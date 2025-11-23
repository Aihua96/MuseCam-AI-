# MuseCam AI - 你的智能视频日记助手 🎥✨

MuseCam AI 是一个基于 React 和 Google Gemini Live API 构建的智能网页应用。它不仅是一个录像工具，更像是一位能够“倾听”并激发你灵感的 AI 视频播客主持人。

当你对着镜头诉说时，AI 会实时分析你的语音内容。当你停顿或不知道该说什么时，屏幕上会以优雅的文字浮层形式跳出具有启发性的问题，引导你继续分享，激发无限创意。

## 🌟 核心功能

*   **🎙️ AI 实时引导**：集成 Google Gemini 2.5 Flash 模型，实时“倾听”你的语音流，并在合适的时机生成简短、贴心的引导性问题（静音文字模式），让你录制时不卡壳。
*   **📹 多画幅录制**：支持多种社交媒体视频比例（9:16 抖音/Reels, 16:9 YouTube, 3:4, 1:1 Instagram）。
*   **💾 本地视频生成**：录制完成后，自动合成包含音频的 MP4 文件供下载。
*   **🎨 质感 UI 设计**：采用柔和的马卡龙色系与毛玻璃（Glassmorphism）效果，提供舒适、专注的录制体验。
*   **🔒 隐私安全**：音频流仅用于 AI 生成提示词，视频录制完全在本地浏览器进行，不上传服务器。

## 🛠️ 技术栈

*   **前端框架**: React 19
*   **样式库**: Tailwind CSS
*   **AI 模型**: Google Gemini 2.5 Flash (via `@google/genai` Live API)
*   **媒体处理**:
    *   `MediaRecorder` API 用于视频录制
    *   `Canvas` API 用于画面裁剪与处理
    *   `Web Audio` API 用于音频流处理

## 🚀 如何运行

1.  **克隆或下载代码**。
2.  **获取 API Key**：你需要一个 Google Gemini API Key。请访问 [Google AI Studio](https://aistudio.google.com/) 获取。
3.  **配置环境**：
    *   本项目设计为在支持 ES Modules 的环境中运行（如 Vite 或直接在 AI Studio 环境中）。
    *   确保 `process.env.API_KEY` 已设置，或者在初始化 `GoogleGenAI` 时传入你的 Key。
4.  **安装依赖** (如果使用 npm/yarn):
    ```bash
    npm install
    ```
5.  **启动服务**:
    ```bash
    npm start
    ```

## 💡 使用指南

1.  允许浏览器访问摄像头和麦克风权限。
2.  选择你喜欢的视频比例（如手机竖屏 9:16）。
3.  点击红色的录制按钮。
4.  开始对着镜头说话。当你停下来时，留意屏幕下方的文字提示。
5.  录制结束后，点击下载按钮保存视频。

---
*Powered by Google Gemini API*