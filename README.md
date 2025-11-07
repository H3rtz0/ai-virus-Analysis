# AI 驱动的恶意软件分析实现器

[![zh-CN](https://img.shields.io/badge/lang-中文-blue.svg)](README.md)

这是一个交互式 Web 应用，旨在演示如何实现一个 AI 驱动的恶意软件分析解决方案。该项目灵感来源于 VirusTotal 的一篇博客文章，利用大语言模型（LLM）的强大功能，将非结构化的恶意软件行为报告转化为结构化的、可操作的情报，并自动生成检测规则。

![应用截图](https://storage.googleapis.com/aistudio-ux-team-public/sdk_gallery/malware_analysis_readme.png)

## 核心功能

-   **交互式指南**: 分步引导用户了解从数据收集到自动化响应的整个恶意软件分析流程。
-   **多模型支持**: 支持 **Google Gemini**、**通义千问 (DashScope)** 以及任何**兼容 OpenAI API 的自定义模型**。
-   **动态 API 配置**: 直接在网页界面中配置 AI 模型和 VirusTotal 的 API 密钥。
-   **自动化报告提取**: 上传文件后，应用会使用您的 VirusTotal API 密钥自动获取并格式化分析报告。
-   **AI 特征提取**: 使用所选的 AI 模型解析行为报告，提取关键行为、入侵指标 (IOCs)、MITRE ATT&CK 技术映射，并猜测恶意软件家族。
-   **自动生成 YARA 规则**: 基于 AI 的分析结果，自动生成一条有效的 YARA 规则用于威胁检测。
-   **现代化 UI**: 使用 React 和 Tailwind CSS 构建的响应式、美观的用户界面。
-   **无缝的本地开发体验**: 集成了 Vite 的反向代理来解决跨域（CORS）问题，并内置自签名 SSL 证书以提供安全上下文，无需额外配置。

## 技术栈

-   **前端**: React, TypeScript
-   **构建工具**: Vite
-   **样式**: Tailwind CSS
-   **AI 模型**: Google Gemini, 阿里通义千问, 兼容 OpenAI 的自定义模型
-   **外部数据**: VirusTotal API

## 项目运行指南

要在本地或云端环境中运行此项目，请按照以下步骤操作。

### 先决条件

-   确保您已安装 [Node.js](https://nodejs.org/) (建议版本 v18 或更高)。
-   您需要获取以下 API 密钥：
    -   **VirusTotal API Key**: 从您的 [VirusTotal 个人资料页](https://www.virustotal.com/gui/user/YOUR_USERNAME/apikey)获取。
    -   **Google Gemini API Key**: 从 [Google AI Studio](https://aistudio.google.com/app/apikey) 获取。
    -   **DashScope API Key (通义千问)**: 从[阿里云百炼控制台](https://dashscope.console.aliyun.com/apiKey)获取。
    -   **自定义模型**: 您需要一个 API 端点 URL 和一个 API 密钥。

### 安装与启动

1.  **克隆或下载项目代码**
    将项目文件保存到您的本地或云服务器文件夹中。

2.  **安装依赖**
    在项目根目录打开终端，运行：
    ```bash
    npm install
    ```

3.  **启动应用**
    运行以下命令启动开发服务器：
    ```bash
    npm run start 
    ```
    应用将以 **HTTPS** 模式在本地启动。您可以在浏览器中访问终端中显示的 `https://` 地址。

4.  **在 UI 中配置 API 密钥**
    项目启动后，直接在网页的用户界面中输入您获取的 API 密钥：
    -   在 **步骤 0** 中配置您选择的 AI 模型密钥。
    -   在 **步骤 1** 中配置您的 VirusTotal API 密钥。

### **重要：本地开发环境说明**

为了提供流畅的开箱即用体验，该项目利用了 Vite 的两项关键功能：

1.  **开发代理 (解决 CORS)**: 项目配置了一个反向代理，将对 VirusTotal API 的请求通过本地开发服务器进行转发。这彻底解决了浏览器的**跨域资源共享 (CORS)** 安全限制，让您无需任何浏览器插件或复杂配置即可自动获取报告。

2.  **本地 HTTPS (解决安全上下文)**: 项目会自动生成一个“自签名”SSL 证书，以 `https://` 模式运行。这为应用提供了一个“安全上下文”，是运行某些 Web API（如文件哈希计算）所必需的。

#### 首次访问时的浏览器安全警告

当您第一次通过 `https://` URL 访问应用时，您的浏览器会显示一个**安全警告**（例如，“您的连接不是私密连接”）。

**这是完全正常且预期的行为。** 因为该证书是由您的开发环境生成的，而不是由浏览器默认信任的机构颁发。为了进行测试，我们需要手动信任它。

**解决方案：**

1.  在警告页面上，点击“**高级**”。
2.  点击“**继续前往...（不安全）**”链接。

完成此操作后，浏览器将记住您的选择，所有功能都将正常运行。


## 项目结构

```
/
├── components/       # React 组件 (UI)
├── services/         # API 调用和业务逻辑
├── index.html            # HTML 入口文件
├── package.json          # 项目依赖和脚本
└── README.md             # 项目说明文档
```