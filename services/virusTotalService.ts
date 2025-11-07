// A helper function to convert ArrayBuffer to hex string
const bufferToHex = (buffer: ArrayBuffer): string => {
    return Array.from(new Uint8Array(buffer))
        .map(b => b.toString(16).padStart(2, '0'))
        .join('');
};

export const calculateFileHash = async (file: File): Promise<string> => {
    const buffer = await file.arrayBuffer();
    const hashBuffer = await crypto.subtle.digest('SHA-256', buffer);
    return bufferToHex(hashBuffer);
};

// This function will attempt to build a behavior-like report from VT API data
const formatReportFromVTData = (data: any): string => {
    const attributes = data?.data?.attributes;
    if (!attributes) {
        return "在 VirusTotal 响应中未找到任何属性。";
    }

    let report = `Process: ${attributes.names?.[0] || 'Unknown'}\n\n`;

    const fileSystem = new Set<string>();
    const registry = new Set<string>();
    const network = new Set<string>();

    // Crowdsourced data often has behavior snippets
    const behaviors = attributes.crowdsourced_ids_results || [];
    for (const behavior of behaviors) {
        (behavior.attributes.files_written || []).forEach((f: string) => fileSystem.add(`- 创建文件: ${f}`));
        (behavior.attributes.files_dropped || []).forEach((f: any) => fileSystem.add(`- 释放文件: ${f.filename} (SHA256: ${f.sha256})`));
        (behavior.attributes.registry_keys_set || []).forEach((r: string) => registry.add(`- 设置注册表项: ${r}`));
        (behavior.attributes.network_communications || []).forEach((n: any) => network.add(`- 连接到 IP: ${n.destination_ip} 端口 ${n.destination_port} (${n.transport_layer_protocol})`));
    }
    
    // Add some PE info if available
    if(attributes.pe_info?.import_list){
        for(const imp of attributes.pe_info.import_list){
            if (imp.library_name === 'ws2_32.dll') {
                imp.imported_functions.forEach((func: string) => {
                    if (['socket', 'connect', 'send', 'recv'].includes(func)) {
                        network.add(`- 导入网络函数: ${func} from ${imp.library_name}`);
                    }
                });
            }
        }
    }


    report += "[文件系统活动]\n";
    if (fileSystem.size > 0) {
        report += [...fileSystem].join('\n') + '\n\n';
    } else {
        report += "- 未检测到重要活动。\n\n";
    }

    report += "[注册表活动]\n";
    if (registry.size > 0) {
        report += [...registry].join('\n') + '\n\n';
    } else {
        report += "- 未检测到重要活动。\n\n";
    }
    
    report += "[网络活动]\n";
    if (network.size > 0) {
        report += [...network].join('\n') + '\n\n';
    } else {
        report += "- 未检测到重要活动。\n\n";
    }
    
    report += `[分析摘要]\n- 无害: ${attributes.last_analysis_stats?.harmless || 0}, 恶意: ${attributes.last_analysis_stats?.malicious || 0}, 可疑: ${attributes.last_analysis_stats?.suspicious || 0}`;

    return report;
};


export const getVirusTotalReport = async (file: File): Promise<string> => {
    // In a real local setup, you'd use a .env file for this.
    // For this playground, we assume it's set in the environment.
    if (!process.env.VIRUSTOTAL_API_KEY) {
        throw new Error("VirusTotal API 密钥未配置。请在您的本地环境中添加 VIRUSTOTAL_API_KEY。");
    }
    
    const hash = await calculateFileHash(file);
    const url = `https://www.virustotal.com/api/v3/files/${hash}`;
    
    const options = {
        method: 'GET',
        headers: {
            'x-apikey': process.env.VIRUSTOTAL_API_KEY,
        }
    };

    try {
        const response = await fetch(url, options);
        if (!response.ok) {
            if (response.status === 404) {
                return `文件哈希 ${hash} 在 VirusTotal 上未找到。您可能需要先在那里上传它。`;
            }
            throw new Error(`VirusTotal API 错误: ${response.status} ${response.statusText}`);
        }
        const data = await response.json();
        return formatReportFromVTData(data);
    } catch (error) {
        console.error("从 VirusTotal 获取数据时出错:", error);
        throw new Error("无法从 VirusTotal 获取报告。");
    }
};
