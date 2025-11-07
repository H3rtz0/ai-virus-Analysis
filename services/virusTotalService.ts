// A helper function to convert ArrayBuffer to hex string
const bufferToHex = (buffer: ArrayBuffer): string => {
    return Array.from(new Uint8Array(buffer))
        .map(b => b.toString(16).padStart(2, '0'))
        .join('');
};

export const calculateFileHash = async (file: File): Promise<string> => {
    if (!crypto.subtle) {
        throw new Error(
            "Web Crypto API 不可用。此功能需要在安全上下文 (HTTPS 或 localhost) 中运行。请参考 README 中的指南来配置您的测试环境。"
        );
    }
    const buffer = await file.arrayBuffer();
    const hashBuffer = await crypto.subtle.digest('SHA-256', buffer);
    return bufferToHex(hashBuffer);
};

/**
 * Fetches the main file report from the VirusTotal API via the local Vite proxy.
 * @param fileHash The SHA-256 hash of the file.
 * @param apiKey The user's VirusTotal API key.
 * @returns The JSON response from the API.
 */
export const getVirusTotalReport = async (fileHash: string, apiKey: string): Promise<any> => {
    if (!apiKey) {
        throw new Error("VirusTotal API 密钥未提供。");
    }
    // The request now goes to the local server, which will proxy it to VirusTotal.
    // This completely avoids CORS issues in the browser.
    const url = `/vt-api/api/v3/files/${fileHash}`;
    const options = {
        method: 'GET',
        headers: {
            'x-apikey': apiKey
        }
    };
    
    const response = await fetch(url, options);

    if (response.status === 404) {
        throw new Error("VirusTotal 中未找到该文件的报告。这可能是一个新文件或一个良性文件。");
    }
    if (!response.ok) {
        const errorData = await response.json().catch(() => null);
        const errorMessage = errorData?.error?.message || `从 VirusTotal API 获取数据时出错: ${response.status} ${response.statusText}`;
        throw new Error(errorMessage);
    }
    return response.json();
};

/**
 * Formats the complex JSON response from VirusTotal into a simple, human-readable text report.
 * This is a simplified parser focusing on key indicators.
 * @param apiResponse The raw JSON object from the getVirusTotalReport function.
 * @returns A formatted string report.
 */
export const formatVirusTotalReport = (apiResponse: any): string => {
    const attributes = apiResponse.data?.attributes;
    if (!attributes) {
        return "无法从 API 响应中解析报告。数据结构可能不符合预期。";
    }

    let report = `--- VirusTotal 自动提取报告 ---\n\n`;
    report += `主要文件名: ${attributes.names?.[0] || 'N/A'}\n`;
    report += `文件类型: ${attributes.type_description || 'N/A'}\n`;
    report += `文件大小: ${attributes.size} 字节\n\n`;

    if (attributes.last_analysis_stats) {
        const stats = attributes.last_analysis_stats;
        report += `[引擎检测摘要]\n`;
        report += `- 恶意: ${stats.malicious}\n`;
        report += `- 可疑: ${stats.suspicious}\n`;
        report += `- 无害: ${stats.harmless}\n\n`;
    }

    const detections = new Set<string>();
    if (attributes.last_analysis_results) {
        Object.values(attributes.last_analysis_results).forEach((engine: any) => {
            if (engine.category === 'malicious' && engine.result) {
                detections.add(engine.result);
            }
        });
    }

    if (detections.size > 0) {
        report += `[主要检测名称]\n`;
        Array.from(detections).slice(0, 5).forEach(detection => {
            report += `- ${detection}\n`;
        });
        report += '\n';
    }

    // Attempt to extract some behavioral indicators if available in the main report
    const sandboxNames = attributes.sandbox_verdicts ? Object.keys(attributes.sandbox_verdicts) : [];
    if (sandboxNames.length > 0) {
        report += `[沙箱行为摘要]\n`;
        sandboxNames.forEach(name => {
            const verdict = attributes.sandbox_verdicts[name];
            report += `- ${name}: ${verdict.category} (恶意软件类别: ${verdict.malware_classification?.join(', ') || 'N/A'})\n`;
        });
        report += '\n';
    } else {
        report += `[沙箱行为摘要]\n- 在主报告中未找到详细的沙箱行为数据。完整的动态分析可能需要访问 'Behavior' 标签页或特定的 API 端点。\n\n`;
    }
    
    if (attributes.pe_info?.import_list) {
         report += `[部分导入的 DLLs]\n`;
         attributes.pe_info.import_list.slice(0, 5).forEach((imp: any) => {
             report += `- ${imp.library_name}\n`;
         });
         report += '\n';
    }

    report += `--- 报告结束 ---`;
    return report;
};