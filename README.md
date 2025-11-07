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

## 技术栈

-   **前端**: React, TypeScript
-   **样式**: Tailwind CSS
-   **AI 模型**: Google Gemini, 阿里通义千问, 兼容 OpenAI 的自定义模型
-   **外部数据**: VirusTotal API

## 项目运行指南

要在本地环境中运行此项目，请按照以下步骤操作。

### 先决条件

-   确保您已安装 [Node.js](https://nodejs.org/) (建议版本 v18 或更高)。
-   您需要获取以下 API 密钥：
    -   **VirusTotal API Key**: 从您的 [VirusTotal 个人资料页](https://www.virustotal.com/gui/user/YOUR_USERNAME/apikey)获取。
    -   **Google Gemini API Key**: 从 [Google AI Studio](https://aistudio.google.com/app/apikey) 获取。
    -   **DashScope API Key (通义千问)**: 从[阿里云百炼控制台](https://dashscope.console.aliyun.com/apiKey)获取。
    -   **自定义模型**: 您需要一个 API 端点 URL 和一个 API 密钥。

### 安装与启动

1.  **克隆或下载项目代码**
    将项目文件保存到本地文件夹中。

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
    应用将在本地启动，您可以在浏览器中访问终端中显示的 URL。

4.  **在 UI 中配置 API 密钥**
    项目启动后，直接在网页的用户界面中输入您获取的 API 密钥：
    -   在 **步骤 0** 中配置您选择的 AI 模型密钥。
    -   在 **步骤 1** 中配置您的 VirusTotal API 密钥。

### **重要：云端/远程测试指南 (安全上下文要求)**

当您在云服务器上通过 `http://<服务器IP>` 访问此应用并尝试上传文件时，您可能会遇到两种常见的、由浏览器安全策略导致的错误：

1.  **CORS (跨源资源共享) 错误**: 在调用 VirusTotal API 时，浏览器会阻止该请求。
2.  **Web Crypto API 不可用错误**: 在计算文件哈希时，应用会报错，因为 `crypto.subtle` 功能仅在安全上下文中可用。

**这是预料之中的行为，而非应用本身的 Bug。** 浏览器要求像加密和跨域 API 调用这样的敏感操作必须在安全环境（**HTTPS** 或 **localhost**）下进行。

要在您的云服务器上成功测试完整功能，您需要创建一个安全上下文。最简单的方法是使用一个反向代理或隧道服务来为您的开发服务器提供 HTTPS 地址。

#### 解决方案：使用 `ngrok` (推荐)

`ngrok` 是一个流行的工具，可以为您的本地服务创建一个安全的公共 HTTPS URL。

1.  [下载并安装 ngrok](https://ngrok.com/download)。
2.  在 ngrok 网站上注册一个免费账户并获取您的 authtoken。
3.  配置您的 authtoken：
    ```bash
    ngrok config add-authtoken <YOUR_AUTHTOKEN>
    ```
4.  在您的项目正常运行 (`npm run start`) 后，它会在一个端口上监听（例如 `5173`）。在**另一个终端窗口**中，启动 ngrok 将流量转发到该端口：
    ```bash
    ngrok http 5173
    ```
5.  `ngrok` 将会提供一个 `https://` 开头的 URL (例如 `https://random-string.ngrok-free.app`)。**使用这个 HTTPS URL** 在任何设备上访问您的应用。现在，文件哈希和 API 调用功能都应该可以正常工作了。


## 项目结构

```
/
├── components/       # React 组件 (UI)
├── services/         # API 调用和业务逻辑
├── index.html            # HTML 入口文件
├── package.json          # 项目依赖和脚本
└── README.md             # 项目说明文档
```