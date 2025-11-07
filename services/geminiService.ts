import { GoogleGenAI, Type } from "@google/genai";
import { type AnalysisResult } from '../types';

if (!process.env.API_KEY) {
    throw new Error("API_KEY environment variable is not set");
}
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

const analysisSchema = {
    type: Type.OBJECT,
    properties: {
        malware_family_guess: { type: Type.STRING, description: "一个 plausible 的恶意软件家族猜测 (例如, 'Zeus', 'WannaCry', 'Unknown Dropper')." },
        summary: { type: Type.STRING, description: "关于恶意软件目的和主要行为的简要、高级摘要。" },
        key_behaviors: {
            type: Type.OBJECT,
            properties: {
                file_system: { type: Type.ARRAY, items: { type: Type.STRING }, description: "与文件创建、删除或修改相关的行为。" },
                registry: { type: Type.ARRAY, items: { type: Type.STRING }, description: "与 Windows 注册表创建、删除或修改相关的行为。" },
                network: { type: Type.ARRAY, items: { type: Type.STRING }, description: "网络相关行为，如 DNS 查询、IP 连接和 HTTP 请求。" },
            },
            required: ['file_system', 'registry', 'network']
        },
        mitre_attack_techniques: {
            type: Type.ARRAY,
            items: {
                type: Type.OBJECT,
                properties: {
                    technique_id: { type: Type.STRING, description: "MITRE ATT&CK 技术 ID (例如, T1059.001)." },
                    technique_name: { type: Type.STRING, description: "技术名称。" },
                    description: { type: Type.STRING, description: "恶意软件的行为如何映射到此技术。" },
                },
                required: ['technique_id', 'technique_name', 'description']
            }
        },
        indicators_of_compromise: {
            type: Type.OBJECT,
            properties: {
                files: { type: Type.ARRAY, items: { type: Type.STRING }, description: "创建/释放的文件路径或名称。" },
                domains: { type: Type.ARRAY, items: { type: Type.STRING }, description: "恶意软件联系的域名。" },
                ips: { type: Type.ARRAY, items: { type: Type.STRING }, description: "恶意软件联系的 IP 地址。" },
                registry_keys: { type: Type.ARRAY, items: { type: Type.STRING }, description: "创建或修改的注册表项。" },
            },
            required: ['files', 'domains', 'ips', 'registry_keys']
        },
    },
    required: ['malware_family_guess', 'summary', 'key_behaviors', 'mitre_attack_techniques', 'indicators_of_compromise']
};


export const analyzeMalwareReport = async (report: string): Promise<AnalysisResult> => {
    try {
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: `请分析以下恶意软件沙箱报告。你的角色是一位资深的恶意软件逆向工程师。根据提供的 JSON schema 提取关键信息并进行结构化。请确保结果精确而全面。\n\n---报告开始---\n${report}\n---报告结束---`,
            config: {
                responseMimeType: 'application/json',
                responseSchema: analysisSchema,
            },
        });
        
        const jsonText = response.text.trim();
        return JSON.parse(jsonText) as AnalysisResult;
    } catch (error) {
        console.error("分析恶意软件报告时出错:", error);
        throw new Error("从 Gemini API 获取分析失败。");
    }
};

export const generateYaraRule = async (analysis: AnalysisResult): Promise<string> => {
    const keyStrings = [
        ...analysis.indicators_of_compromise.files,
        ...analysis.indicators_of_compromise.registry_keys,
        ...analysis.indicators_of_compromise.domains
    ].filter(s => s && s.length > 5); // 筛选有意义的字符串

    const prompt = `
    基于以下恶意软件分析，生成一条简单但有效的 YARA 规则。
    规则应命名为 "Suspicious_${analysis.malware_family_guess.replace(new RegExp('\\s+', 'g'), '_') || 'Behavior'}".
    在 meta 部分包含来自分析摘要的描述，并将作者标记为 "Gemini AI Analyst"。
    strings 部分应专注于提供的最独特的指标。

    分析摘要: ${analysis.summary}
    关键指标:
    ${keyStrings.map(s => `- ${s}`).join('\n')}

    请仅生成 YARA 规则代码。
    `;

    try {
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
        });
        
        const yaraRule = response.text;
        // 清理可能存在的 markdown 代码块
        const regex = new RegExp('`{3}yara\\n|`{3}', 'g');
        return yaraRule.replace(regex, '').trim();
    } catch (error) {
        console.error("生成 YARA 规则时出错:", error);
        throw new Error("从 Gemini API 生成 YARA 规则失败。");
    }
};