# AI 驱动的恶意软件分析实现器

[![zh-CN](https://img.shields.io/badge/lang-中文-blue.svg)](README.md)

这是一个交互式 Web 应用，旨在演示如何实现一个 AI 驱动的恶意软件分析解决方案。该项目灵感来源于 VirusTotal 的一篇博客文章，利用 Google Gemini API 的强大功能，将非结构化的恶意软件行为报告转化为结构化的、可操作的情报，并自动生成检测规则。

![应用截图](https://storage.googleapis.com/aistudio-ux-team-public/sdk_gallery/malware_analysis_readme.png)

## 核心功能

-   **交互式指南**: 分步引导用户了解从数据收集到自动化响应的整个恶意软件分析流程。
-   **文件上传与分析**: 支持拖放或点击上传恶意软件样本（或任何文件）。
-   **VirusTotal API 集成**: 自动计算文件哈希 (SHA-256) 并从 VirusTotal API 获取最新的分析报告。
-   **AI 特征提取**: 使用 Gemini API 解析行为报告，提取关键行为、入侵指标 (IOCs)、MITRE ATT&CK 技术映射，并猜测恶意软件家族。
-   **自动生成 YARA 规则**: 基于 AI 的分析结果，自动生成一条有效的 YARA 规则用于威胁检测。
-   **现代化 UI**: 使用 React 和 Tailwind CSS 构建的响应式、美观的用户界面。

## 技术栈

-   **前端**: React, TypeScript
-   **样式**: Tailwind CSS
-   **AI 模型**: Google Gemini API
-   **外部数据**: VirusTotal API
-   **构建工具**: Vite

## 项目运行指南

要在本地环境中运行此项目，请按照以下步骤操作。

### 先决条件

-   确保您已安装 [Node.js](https://nodejs.org/) (建议版本 v18 或更高)。
-   您需要获取以下 API 密钥：
    -   **Google Gemini API Key**: 从 [Google AI Studio](https://aistudio.google.com/app/apikey) 获取。
    -   **VirusTotal API Key**: 在 [VirusTotal 官网](https://www.virustotal.com/) 注册并获取免费的 API 密钥。

### 安装与配置

1.  **克隆仓库**
    ```bash
    git clone https://github.com/your-repository/ai-malware-analyzer.git
    cd ai-malware-analyzer
    ```

2.  **安装依赖**
    ```bash
    npm install
    ```

3.  **配置环境变量**
    在项目的根目录下创建一个名为 `.env` 的文件。此文件用于存放您的 API 密钥，不会被提交到版本控制中。

    将您的密钥添加到 `.env` 文件中，格式如下：

    ```env
    # 用于 Gemini API
    API_KEY="YOUR_GEMINI_API_KEY"

    # 用于 VirusTotal API
    VIRUSTOTAL_API_KEY="YOUR_VIRUSTOTAL_API_KEY"
    ```

    **重要**: 将 `YOUR_GEMINI_API_KEY` 和 `YOUR_VIRUSTOTAL_API_KEY` 替换为您自己的实际密钥。

### 启动应用

配置完成后，运行以下命令启动开发服务器：

```bash
npm run dev
```

应用将在本地启动，您可以在浏览器中访问 `http://localhost:5173` (或终端中显示的 URL) 来查看和使用。

## 项目结构

```
/
├── public/               # 静态资源
├── src/
│   ├── components/       # React 组件 (UI)
│   │   ├── icons/        # SVG 图标组件
│   │   ├── CodeBlock.tsx
│   │   ├── GuideStep.tsx
│   │   ├── Header.tsx
│   │   └── InteractiveDemo.tsx
│   ├── services/         # API 调用和业务逻辑
│   │   ├── geminiService.ts
│   │   └── virusTotalService.ts
│   ├── App.tsx           # 主应用组件
│   ├── constants.ts      # 应用常量
│   ├── index.css         # 全局样式
│   ├── index.tsx         # 应用入口
│   └── types.ts          # TypeScript 类型定义
├── .env                  # (需手动创建) 环境变量
├── index.html            # HTML 入口文件
├── package.json          # 项目依赖和脚本
└── README.md             # 项目说明文档
```

## 贡献

欢迎对该项目进行贡献！如果您有任何建议或发现 bug，请随时提出 Issue 或提交 Pull Request。

1.  Fork 本仓库
2.  创建您的功能分支 (`git checkout -b feature/AmazingFeature`)
3.  提交您的更改 (`git commit -m 'Add some AmazingFeature'`)
4.  将分支推送到远程 (`git push origin feature/AmazingFeature`)
5.  开启一个 Pull Request

## 致谢

-   灵感来源于 [VirusTotal 博客](https://blog.virustotal.com/) 中关于使用 AI 进行恶意软件聚类的文章。
-   由 [Google Gemini API](https://ai.google.dev/) 提供强大的 AI 分析能力。
-   由 [VirusTotal API](https://developers.virustotal.com/reference) 提供丰富的恶意软件元数据和报告。
