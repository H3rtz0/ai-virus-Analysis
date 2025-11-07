import React from 'react';
import { AnalysisIcon } from './components/icons/AnalysisIcon';
import { CodeIcon } from './components/icons/CodeIcon';
import { SimilarityIcon } from './components/icons/SimilarityIcon';
import { type GuideStepContent } from './types';

export const DEFAULT_MALWARE_REPORT = `
Process: evasive_loader.exe (PID: 1337)
Parent Process: explorer.exe (PID: 1234)

[File System Activity]
- Creates file: C:\\Users\\Admin\\AppData\\Local\\Temp\\updater.dll
- Creates file: C:\\ProgramData\\SystemCache\\config.dat
- Deletes file: C:\\Users\\Admin\\Downloads\\invoice_2024.zip

[Registry Activity]
- Creates key: HKCU\\Software\\Microsoft\\Windows\\CurrentVersion\\Run\\SystemUpdater
- Sets value: HKCU\\Software\\Microsoft\\Windows\\CurrentVersion\\Run\\SystemUpdater -> "rundll32.exe C:\\Users\\Admin\\AppData\\Local\\Temp\\updater.dll,EntryPoint"
- Reads key: HKLM\\SOFTWARE\\Microsoft\\Windows NT\\CurrentVersion\\ProductId

[Network Activity]
- Resolves DNS: evil-c2-server.net
- Connects to IP: 198.51.100.10 on port 443 (TCP)
- HTTP Request: POST /api/v1/checkin HTTP/1.1
- User-Agent: Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36
- POST Data: (base64 encoded system information)
- Resolves DNS: update.microsoft.com (decoy traffic)

[Process Injection]
- Injects code into: svchost.exe (PID: 888)

[Signatures Detected]
- Anti-VM: Checks for VMWare registry keys
- Persistence: Establishes Run key for persistence
- Evasion: Injects into trusted system process
`;


export const GUIDE_STEPS: GuideStepContent[] = [
    {
        title: "第一步：数据收集与准备",
        description: "从沙箱化的恶意软件执行中收集行为报告。这些报告（如演示中的示例）包含有关文件、注册表和网络活动的原始数据。这些数据是我们进行 AI 分析的基础。",
        // Fix: Replaced JSX syntax with React.createElement to avoid parsing errors in a .ts file.
        icon: React.createElement(AnalysisIcon)
    },
    {
        title: "第二步：AI 驱动的特征提取",
        description: "使用像 Gemini 这样的强大生成模型来解析原始文本报告。AI 的任务是理解上下文、提取关键行为、识别入侵指标 (IOCs)，并将行为映射到已知的威胁框架（如 MITRE ATT&CK）。这将非结构化文本转化为结构化的、可操作的情报。",
        // Fix: Replaced JSX syntax with React.createElement to avoid parsing errors in a .ts file.
        icon: React.createElement(CodeIcon)
    },
    {
        title: "第三步：相似性分析与聚类",
        description: "AI 输出的结构化 JSON 可以转换为数值向量（嵌入）。通过计算这些向量之间的相似度（例如，余弦相似度），您可以将新的恶意软件样本与已知威胁进行识别和聚类，即使它们使用不同的代码。",
        // Fix: Replaced JSX syntax with React.createElement to avoid parsing errors in a .ts file.
        icon: React.createElement(SimilarityIcon)
    },
    {
        title: "第四步：验证与自动化响应",
        description: "根据现有的威胁情报验证 AI 的发现。一旦验证通过，这些结构化数据就可用于自动生成检测规则（如 YARA）、更新阻止列表，并触发事件响应工作流，从而极大地加速您的防御周期。",
        // Fix: Replaced JSX syntax with React.createElement to avoid parsing errors in a .ts file.
        icon: React.createElement(AnalysisIcon)
    }
];