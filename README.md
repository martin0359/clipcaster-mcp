Clipcaster MCP (CLI‑first, cross‑platform)

中文简介
- 一个面向命令行 AI 工具（CLI）的 MCP 剪贴板服务器，通过 STDIO 工作，零外部 Node 依赖，跨平台可用。

English Summary
- A CLI‑first MCP clipboard server over STDIO. Zero extra Node deps, works across macOS/Windows/Linux.

Tools 提供的工具
- read_clipboard() → 返回/Return clipboard text
- write_clipboard({ text }) → 写入/Write clipboard text
- clear_clipboard() → 清空/Clear clipboard
- clipboard_info() → 显示后端/Show backend info

Quick Start 快速开始
1) Install 安装（从 npm 发布后任意一种皆可）
   - npm i -g clipcaster-mcp
   - 或/or: npm i -g @martin0359/clipcaster-mcp
2) Register in Codex 在 Codex 中注册
   - codex mcp add clipboard -- $(which clipcaster-mcp)
   - Windows PowerShell: codex mcp add clipboard -- (Get-Command clipcaster-mcp).Source
3) Open Codex 打开 Codex
   - 运行 codex，输入 /mcp 应能看到工具；用自然语言直接说“把‘hello’复制到剪贴板”。

Use with other AI CLIs 适配其他 AI CLI（示例）
- 本项目专为“CLI 形态”的 MCP 客户端设计（STDIO 传输）。
- Claude Code CLI（若其支持 MCP 注册命令）
  - claude-code mcp add clipboard -- $(which clipcaster-mcp)
  - 或在其 MCP 配置文件中将 command 指向 clipcaster-mcp 的可执行文件（绝对路径更稳妥）。
- Gemini CLI（若其支持 MCP）
  - gemini mcp add clipboard -- $(which clipcaster-mcp)
  - 或配置文件中设置 command=clipcaster-mcp（或其绝对路径）。
- 说明：不同 CLI 的命令/配置位置略有差异，请以各 CLI 官方文档为准；核心是“把 clipcaster-mcp 当作 MCP 服务器的可执行命令”。

OS Backends 系统后端
- macOS: pbcopy/pbpaste（原生）
- Windows: PowerShell Get-Clipboard / Set-Clipboard（原生）
- Linux/BSD: 优先 wl-clipboard（wl-copy/wl-paste）；否则 xclip，最后 xsel
  - 建议安装：sudo apt-get install -y wl-clipboard xclip（或 xsel）
  - X11 下若客户端未传递图形环境，服务会尝试 DISPLAY=:0 与 ~/.Xauthority，降低配置负担

Natural Usage 自然使用
- 不需要说“使用 MCP”，直接说：
  - 把“hello”复制到剪贴板 / Copy “hello” to clipboard
  - 读一下剪贴板内容 / Read clipboard content
  - 清空剪贴板 / Clear clipboard
  - 看下剪贴板后端 / Show clipboard backend

Troubleshooting 故障排查
- No MCP tools available：重启 Codex；检查 codex mcp list 是否含 clipboard。
- request timed out：在 mcp 目录先 npm install；注册时使用绝对路径/which；Linux 安装 wl-clipboard 或 xclip。
- Linux 下写入失败：检查 DISPLAY/XDG_SESSION_TYPE；必要时在该 CLI 的 MCP 配置为本服务器添加 env（例如 DISPLAY=:0, XAUTHORITY=~/.Xauthority）。

Local Dev 本地开发
- cd mcp && npm install
- node ./clipboard-server.js（将静默等待 MCP 客户端通过 STDIO 握手，不会自行输出）

Distribute & Publish 分发与发布
- GitHub 仓库建议：martin0359/clipcaster-mcp
- npm 包名：clipcaster-mcp（或作用域包 @martin0359/clipcaster-mcp）
- 发布步骤（发布者）：
  - cd mcp
  - npm login
  - 未使用作用域：npm publish --access public
  - 使用作用域：先将 package.json 的 name 改为 @martin0359/clipcaster-mcp，再 npm publish --access public
- 使用者安装：
  - npm i -g clipcaster-mcp  或/or  npm i -g @martin0359/clipcaster-mcp
  - codex mcp add clipboard -- $(which clipcaster-mcp)

Notes 说明
- 本项目专门支持“命令行 AI 工具（CLI）”的 MCP 场景（STDIO）；GUI 产品需具备 MCP/STDIO 或使用未来的 HTTP 入口。
- 处理带空格路径时，请给路径加引号（"/path with space/..."）。
