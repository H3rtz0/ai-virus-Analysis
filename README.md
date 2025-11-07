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

### **重要：本地测试指南 (解决 CORS 问题)**

当您在本地尝试使用 VirusTotal API 功能时，浏览器的控制台可能会显示一个关于 **CORS (跨源资源共享)** 的错误。这是浏览器的一项标准安全功能，可防止网页脚本向其来源域之外的服务器发出请求。

**这是预料之中的行为，而非应用本身的 Bug。** 要在本地成功测试 API 功能，您需要使用以下任一方法：

#### 方法一：使用浏览器插件 (推荐)

最简单的方法是安装一个浏览器扩展程序来临时禁用 CORS 检查。
1.  在您的浏览器（如 Chrome 或 Firefox）中搜索并安装一个可靠的 "CORS Unblock" 或 "Allow CORS" 插件。
2.  **仅在测试本应用时**激活该插件。
3.  测试完成后，**请务必禁用该插件**，以恢复浏览器的正常安全状态。

#### 方法二：启动一个本地代理服务器

这是一种更专业的方法。您可以在本地运行一个简单的代理服务器，它会接收您应用的请求，然后将其转发到 VirusTotal，并将响应返回给您的应用。
您可以使用 `cors-anywhere` 或其他类似的工具来快速搭建。

#### 方法三：使用特定的浏览器启动标志 (仅限高级用户)

您可以带着禁用网页安全的标志启动浏览器。**此方法具有安全风险，请仅在您完全了解其后果的情况下使用，并且切勿使用此浏览器访问任何其他网站。**

-   **对于 Chrome (Windows)**:
    ```bash
    "C:\Program Files\Google\Chrome\Application\chrome.exe" --disable-web-security --user-data-dir="C:/ChromeDevSession"
    ```

选择上述任一方法后，刷新应用页面，VirusTotal API 的自动获取功能应该就能正常工作了。

## 项目结构

```
/
├── src/
│   ├── components/       # React 组件 (UI)
│   ├── services/         # API 调用和业务逻辑
│   └── ...
├── index.html            # HTML 入口文件
├── package.json          # 项目依赖和脚本
└── README.md             # 项目说明文档
```
