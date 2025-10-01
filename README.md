<div align="center">

<img src="assets/logo.svg" width="128" height="128" alt="Clipcaster MCP logo"/>

<h1>Clipcaster MCP</h1>

<p>
  <strong>Clipboard MCP for AI CLIs</strong><br/>
  <em>Preserve formatting · Whole paste by default · Stepwise in browser · Cross‑platform</em><br/>
  <a href="https://www.npmjs.com/package/@martin0359/clipcaster-mcp"><img src="https://img.shields.io/npm/v/%40martin0359%2Fclipcaster-mcp?label=npm&color=cb3837" alt="npm version"></a>
  <img src="https://img.shields.io/node/v/@martin0359/clipcaster-mcp" alt="node version"/>
  <a href="https://github.com/martin0359/clipcaster-mcp"><img src="https://img.shields.io/github/stars/martin0359/clipcaster-mcp?style=social" alt="stars"></a>
  <br/>
  <a href="#zh">中文</a> • <a href="#en">English</a>
</p>

</div>

---

<a id="en"></a>
## English · Overview

- Default flow: ask “Copy this…” → paste whole command; no broken quotes, spaces, heredocs, or code fences.
- Need stepwise? Open the browser URL returned by tools and copy items one by one.
- Session pool remembers what you copied this session; it clears when the CLI exits.
- Works on macOS, Linux (Wayland/X11), and Windows.

## Quick Start (Codex)

```bash
npm i -g @martin0359/clipcaster-mcp
codex mcp remove clipboard || true
codex mcp add clipboard -- env CLIPCASTER_HTTP=1 "$(which clipcaster-mcp)"
codex mcp list
```

Other CLIs (if they support MCP):
- Claude Code CLI: `claude-code mcp add clipboard -- env CLIPCASTER_HTTP=1 "$(which clipcaster-mcp)"`
- Gemini CLI: `gemini mcp add clipboard -- env CLIPCASTER_HTTP=1 "$(which clipcaster-mcp)"`
- MCP Inspector / generic STDIO clients: configure `clipcaster-mcp` as the MCP server command; set `CLIPCASTER_HTTP=1` to enable the browser UI.

## Usage

- Whole Paste (most common)
  - Say “Copy …”. The tool chooses whole‑paste; just paste into your shell.
- Stepwise In Browser
  - Say “Copy …”. For multi‑line/complex input, the tool creates a bundle and returns a browser URL.
  - Open the URL → expand items → click Copy per item. “Copy All” copies the whole bundle.

## Cross‑Platform

- macOS: `pbcopy` / `pbpaste`.
- Windows: PowerShell `Set‑Clipboard` / `Get‑Clipboard`.
- Linux/BSD: backends (priority) `wl‑clipboard` → `xclip` → `xsel`.
- X11 fallback: if `DISPLAY` is missing, tries `DISPLAY=:0` and `~/.Xauthority` (set explicitly if your display differs).
- Browser UI: loopback only (127.0.0.1) with a random token; no desktop toolkit required.

## Tools

- Smart copy: `assist_copy({ text, strategy? })` (auto chooses whole vs. bundle; returns `mode` and `ui.url`).
- Clipboard: `write_clipboard`, `read_clipboard`, `clear_clipboard`, `clipboard_info`.
- Bundle: `write_bundle({ text, split_mode?, copy_full? })`, `list_bundle_items`, `copy_bundle_item`, `get_bundle_item`, `clear_bundle`, `bundle_info`.
- Model plan: `split_plan_template` (items+label in one JSON), `write_bundle_with_plan({ plan, copy_full? })` (uses `items`; label is display‑only).
- Session pool: `list_pool_items`, `copy_pool_item`, `get_pool_item`, `clear_pool` (auto labels; ephemeral).

## License

MIT © 2025 martin0359

---

<a id="zh"></a>
## 中文 · 概览

- 常用流程：说“把这段复制一下”→ 直接整段粘贴；引号、空格、heredoc、代码块都不会被破坏。
- 需要逐条执行？打开工具返回的浏览器地址，在页面里逐条复制。
- 会话池会记住本次会话复制过的内容；关闭 CLI 后自动清空。
- 支持 macOS、Linux（Wayland/X11）和 Windows。

## 快速开始（Codex）

```bash
npm i -g @martin0359/clipcaster-mcp
codex mcp remove clipboard || true
codex mcp add clipboard -- env CLIPCASTER_HTTP=1 "$(which clipcaster-mcp)"
codex mcp list
```

其他 CLI（若支持 MCP）：
- Claude Code CLI：`claude-code mcp add clipboard -- env CLIPCASTER_HTTP=1 "$(which clipcaster-mcp)"`
- Gemini CLI：`gemini mcp add clipboard -- env CLIPCASTER_HTTP=1 "$(which clipcaster-mcp)"`
- MCP Inspector / 其他 STDIO 客户端：将 `clipcaster-mcp` 配置为 MCP 服务器命令；设置 `CLIPCASTER_HTTP=1` 以启用浏览器 UI。

## 使用说明

- 整段粘贴（最常见）
  - 直接说“把……复制一下”。工具会选择整段复制，然后在终端里粘贴即可。
- 浏览器里逐条
  - 对复杂/多行命令，工具会创建分条集合，并返回浏览器地址。
  - 打开地址 → 展开条目 → 每条点击复制。“Copy All” 可整段复制。

## 跨平台特性

- macOS：`pbcopy` / `pbpaste`。
- Windows：PowerShell `Set‑Clipboard` / `Get‑Clipboard`。
- Linux/BSD：优先 `wl‑clipboard`，其次 `xclip`，再到 `xsel`。
- X11 回退：若缺少 `DISPLAY`，尝试 `DISPLAY=:0` 与 `~/.Xauthority`（多显示器请自行设置正确的 DISPLAY）。
- 浏览器 UI：仅本机回环 127.0.0.1，随机 token，无需桌面组件。

## 工具清单

- 智能复制：`assist_copy({ text, strategy? })`（自动整段/分条；返回 `mode` 与 `ui.url`）。
- 剪贴板：`write_clipboard`、`read_clipboard`、`clear_clipboard`、`clipboard_info`。
- 分条：`write_bundle({ text, split_mode?, copy_full? })`、`list_bundle_items`、`copy_bundle_item`、`get_bundle_item`、`clear_bundle`、`bundle_info`。
- 模型计划：`split_plan_template`（一次返回 items+label 的 JSON）、`write_bundle_with_plan({ plan, copy_full? })`（只用 items 落地；label 仅展示）。
- 会话池：`list_pool_items`、`copy_pool_item`、`get_pool_item`、`clear_pool`（自动标签；会话内存）。

