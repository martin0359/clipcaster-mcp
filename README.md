<div align="center">

<img src="assets/logo.svg" width="128" height="128" alt="Clipcaster MCP logo"/>

<h1>
  ✨ Clipcaster MCP ✨
</h1>

<p>
  <strong>CLI‑first, cross‑platform MCP clipboard server</strong><br/>
  <em>面向命令行 AI 工具 · 跨平台 · 零额外依赖（Node ESM）</em>
  <br/>
  <a href="https://www.npmjs.com/package/@martin0359/clipcaster-mcp"><img src="https://img.shields.io/npm/v/%40martin0359%2Fclipcaster-mcp?label=npm&color=cb3837" alt="npm version"></a>
  <a href="https://www.npmjs.com/package/@martin0359/clipcaster-mcp"><img src="https://img.shields.io/npm/dm/%40martin0359%2Fclipcaster-mcp.svg" alt="npm downloads"></a>
  <img src="https://img.shields.io/node/v/@martin0359/clipcaster-mcp" alt="node version"/>
  <a href="https://github.com/martin0359/clipcaster-mcp/blob/main/LICENSE"><img src="https://img.shields.io/badge/License-MIT-blue.svg" alt="license"></a>
  <a href="https://github.com/martin0359/clipcaster-mcp"><img src="https://img.shields.io/github/stars/martin0359/clipcaster-mcp?style=social" alt="stars"></a>
  <br/>
  <a href="#english">English</a> • <a href="#中文">中文</a>
  <br/><br/>
</p>

<pre>
 ╔═╗┬  ┬┌─┐┌┐┌┌─┐┌─┐┬ ┬┌┬┐┌─┐┬─┐
 ╚═╗│  ││ ││││├─┘├─┤│ │ ││├┤ ├┬┘
 ╚═╝┴─┘┴└─┘┘└┘┴  ┴ ┴└─┘─┴┘└─┘┴└─
</pre>

</div>

---

---

## English

Clipcaster MCP is a tiny, reliable MCP server that gives AI CLIs clipboard powers via STDIO.

- Tools: `read_clipboard()`, `write_clipboard({ text })`, `clear_clipboard()`, `clipboard_info()`
- OS backends: macOS (pbcopy/pbpaste), Windows (PowerShell), Linux/BSD (wl-clipboard → xclip → xsel)
- X11 fallback: auto `DISPLAY=:0` + `~/.Xauthority` when missing

— Quick Start —
- Install: `npm i -g @martin0359/clipcaster-mcp`
- Register (Codex): `codex mcp add clipboard -- $(which clipcaster-mcp)`
- Use: in Codex, just say “Copy ‘hello’ to clipboard” (no need to say “use MCP”).

— Use with other AI CLIs —
- Any MCP‑capable CLI can register the server command `clipcaster-mcp`.
- Examples (pseudo):
  - Claude Code CLI: `claude-code mcp add clipboard -- $(which clipcaster-mcp)`
  - Gemini CLI: `gemini mcp add clipboard -- $(which clipcaster-mcp)`

— Troubleshooting —
- No tools listed: restart the CLI, ensure `codex mcp list` shows `clipboard`.
- Timeout: run `npm install` in project folder; register using absolute path; on Linux install `wl-clipboard` or `xclip`.
- Linux write fails: check `DISPLAY`/Wayland; optionally set `env = { DISPLAY=":0", XAUTHORITY="~/.Xauthority" }` in the client MCP config.

---

---

## 中文

Clipcaster MCP 是一个面向“命令行 AI 工具”的轻量 MCP 服务器，通过 STDIO 让 AI 具备读写系统剪贴板的能力。

- 工具: `read_clipboard()`, `write_clipboard({ text })`, `clear_clipboard()`, `clipboard_info()`
- 系统后端: macOS(pbpaste/pbcopy)、Windows(PowerShell)、Linux/BSD(wl-clipboard → xclip → xsel)
- X11 自适应: 若未传入图形环境，自动尝试 `DISPLAY=:0` 与 `~/.Xauthority`

— 快速开始 —
- 安装: `npm i -g @martin0359/clipcaster-mcp`
- 在 Codex 中注册: `codex mcp add clipboard -- $(which clipcaster-mcp)`
- 使用: 直接说“把‘hello’复制到剪贴板”，无需强调“使用 MCP”。

— 适配其他 AI CLI —
- 任何支持 MCP 的 CLI 都可以把 `clipcaster-mcp` 注册为服务器命令。
- 示例（思路）：
  - Claude Code CLI: `claude-code mcp add clipboard -- $(which clipcaster-mcp)`
  - Gemini CLI: `gemini mcp add clipboard -- $(which clipcaster-mcp)`

— 常见问题 —
- 看不到工具: 重启 CLI；确认 `codex mcp list` 里有 `clipboard`。
- 超时: 在项目目录执行 `npm install`；注册时使用绝对路径；Linux 安装 `wl-clipboard` 或 `xclip`。
- Linux 写入失败: 检查 `DISPLAY`/Wayland；必要时在该 CLI 的 MCP 配置中为本服务器添加 `env = { DISPLAY=":0", XAUTHORITY="~/.Xauthority" }`。

---

---

## Install & Register

```bash
# Global install (one of)
npm i -g @martin0359/clipcaster-mcp

# Register with Codex (idempotent)
codex mcp remove clipboard || true
codex mcp add clipboard -- $(which clipcaster-mcp)
codex mcp list
```

---

## Dev

```bash
cd mcp && npm install
node ./clipboard-server.js  # waits for MCP client over STDIO
```

---

## License

---

## Supported AI CLIs · 已支持/适配的 CLI

- Codex CLI（OpenAI Codex）
- MCP Inspector（调试/测试 MCP 服务器）
- Claude Code CLI（若提供 MCP 注册能力）
- Gemini CLI（若提供 MCP 注册能力）
- 任何支持 MCP·STDIO 的 AI CLI 客户端（可通过命令 `clipcaster-mcp` 注册）

Tips
- 若某 CLI 仅支持 HTTP 传输，可扩展一个可选 HTTP 入口（保持 STDIO 作为默认）。如需我添加，请告知。

MIT © 2025 martin0359
