import { type AnalysisResult } from '../types';

// This schema is compatible with OpenAI's function calling format.
const analysisSchema = {
    type: 'object',
    properties: {
        malware_family_guess: { type: 'string', description: "一个 plausible 的恶意软件家族猜测 (例如, 'Zeus', 'WannaCry', 'Unknown Dropper')." },
        summary: { type: 'string', description: "关于恶意软件目的和主要行为的简要、高级摘要。" },
        key_behaviors: {
            type: 'object',
            properties: {
                file_system: { type: 'array', items: { type: 'string' }, description: "与文件创建、删除或修改相关的行为。" },
                registry: { type: 'array', items: { type: 'string' }, description: "与 Windows 注册表创建、删除或修改相关的行为。" },
                network: { type: 'array', items: { type: 'string' }, description: "网络相关行为，如 DNS 查询、IP 连接和 HTTP 请求。" },
            },
            required: ['file_system', 'registry', 'network']
        },
        mitre_attack_techniques: {
            type: 'array',
            items: {
                type: 'object',
                properties: {
                    technique_id: { type: 'string', description: "MITRE ATT&CK 技术 ID (例如, T1059.001)." },
                    technique_name: { type: 'string', description: "技术名称。" },
                    description: { type: 'string', description: "恶意软件的行为如何映射到此技术。" },
                },
                required: ['technique_id', 'technique_name', 'description']
            }
        },
        indicators_of_compromise: {
            type: 'object',
            properties: {
                files: { type: 'array', items: { type: 'string' }, description: "创建/释放的文件路径或名称。" },
                domains: { type: 'array', items: { type: 'string' }, description: "恶意软件联系的域名。" },
                ips: { type: 'array', items: { type: 'string' }, description: "恶意软件联系的 IP 地址。" },
                registry_keys: { type: 'array', items: { type: 'string' }, description: "创建或修改的注册表项。" },
            },
            required: ['files', 'domains', 'ips', 'registry_keys']
        },
    },
    required: ['malware_family_guess', 'summary', 'key_behaviors', 'mitre_attack_techniques', 'indicators_of_compromise']
};


const callCustomAPI = async (apiUrl: string, apiKey: string, body: object) => {
    if (!apiKey || !apiUrl) {
        throw new Error("自定义模型的 URL 或 API 密钥未提供。");
    }

    const response = await fetch(apiUrl, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${apiKey}`,
        },
        body: JSON.stringify(body),
    });

    if (!response.ok) {
        const errorBody = await response.text();
        console.error("Custom API Error Response:", errorBody);
        throw new Error(`自定义模型 API 错误: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    if (data.error) {
        throw new Error(`自定义模型 API 错误: ${data.error.message}`);
    }
    return data;
};

export const analyzeMalwareReport = async (report: string, apiUrl: string, apiKey: string): Promise<AnalysisResult> => {
    const prompt = `请分析以下恶意软件沙箱报告。你的角色是一位资深的恶意软件逆向工程师。调用 'extract_malware_info' 函数来提取关键信息并进行结构化。请确保结果精确而全面。\n\n---报告开始---\n${report}\n---报告结束---`;

    const body = {
        model: "custom-model", // Model name might be ignored by some endpoints, but it's good practice to include it.
        messages: [
            { role: 'system', content: 'You are a helpful assistant that uses tools to extract information.' },
            { role: 'user', content: prompt }
        ],
        tools: [
            {
                type: 'function',
                function: {
                    name: 'extract_malware_info',
                    description: '从恶意软件报告中提取结构化信息。',
                    parameters: analysisSchema
                }
            }
        ],
        tool_choice: { type: "function", function: { name: "extract_malware_info" } } // Force the model to use the function
    };

    try {
        const data = await callCustomAPI(apiUrl, apiKey, body);
        const toolCall = data.choices?.[0]?.message?.tool_calls?.[0];

        if (toolCall && toolCall.type === 'function') {
            const args = toolCall.function.arguments;
            return JSON.parse(args) as AnalysisResult;
        }
        throw new Error("模型未能按预期调用函数。请检查模型是否支持 Function/Tool Calling。");
    } catch (error) {
        console.error("分析恶意软件报告时出错 (自定义模型):", error);
        throw new Error(`从自定义模型获取分析失败: ${error instanceof Error ? error.message : '未知错误'}`);
    }
};

export const generateYaraRule = async (analysis: AnalysisResult, apiUrl: string, apiKey: string): Promise<string> => {
    const keyStrings = [
        ...analysis.indicators_of_compromise.files,
        ...analysis.indicators_of_compromise.registry_keys,
        ...analysis.indicators_of_compromise.domains
    ].filter(s => s && s.length > 5);

    const prompt = `
    基于以下恶意软件分析，生成一条简单但有效的 YARA 规则。
    规则应命名为 "Suspicious_${analysis.malware_family_guess.replace(/\s+/g, '_') || 'Behavior'}".
    在 meta 部分包含来自分析摘要的描述，并将作者标记为 "Custom AI Analyst"。
    strings 部分应专注于提供的最独特的指标。

    分析摘要: ${analysis.summary}
    关键指标:
    ${keyStrings.map(s => `- ${s}`).join('\n')}

    请仅生成 YARA 规则代码，不要包含任何解释或 markdown 格式。
    `;

    const body = {
        model: "custom-model",
        messages: [
            { role: 'system', content: 'You are a helpful assistant that only generates YARA code.' },
            { role: 'user', content: prompt }
        ],
        // Some models might benefit from a lower temperature for code generation
        temperature: 0.2 
    };

    try {
        const data = await callCustomAPI(apiUrl, apiKey, body);
        const yaraRule = data.choices?.[0]?.message?.content;
        if (!yaraRule) {
            throw new Error("API 响应中未找到生成的代码。");
        }
        const regex = /`{3}(yara\n)?|`{3}/g;
        return yaraRule.replace(regex, '').trim();
    } catch (error) {
        console.error("生成 YARA 规则时出错 (自定义模型):", error);
        throw new Error(`从自定义模型生成 YARA 规则失败: ${error instanceof Error ? error.message : '未知错误'}`);
    }
};
