<div align="center">

<img src="assets/logo.svg" width="128" height="128" alt="Clipcaster MCP logo"/>

<h1>Clipcaster MCP</h1>

<p>
  <strong>让 AI CLI “完美复制命令” 的 MCP 服务器</strong><br/>
  <em>跨平台 · 保留原格式 · 支持按条复制 · 可选本地浏览器 UI</em>
  <br/>
  <a href="https://www.npmjs.com/package/@martin0359/clipcaster-mcp"><img src="https://img.shields.io/npm/v/%40martin0359%2Fclipcaster-mcp?label=npm&color=cb3837" alt="npm version"></a>
  <a href="https://www.npmjs.com/package/@martin0359/clipcaster-mcp"><img src="https://img.shields.io/npm/dm/%40martin0359%2Fclipcaster-mcp.svg" alt="npm downloads"></a>
  <img src="https://img.shields.io/node/v/@martin0359/clipcaster-mcp" alt="node version"/>
  <a href="https://github.com/martin0359/clipcaster-mcp/blob/main/LICENSE"><img src="https://img.shields.io/badge/License-MIT-blue.svg" alt="license"></a>
  <a href="https://github.com/martin0359/clipcaster-mcp"><img src="https://img.shields.io/github/stars/martin0359/clipcaster-mcp?style=social" alt="stars"></a>
  <br/>
  <a href="#zh">中文</a> • <a href="#en">English</a>
  <br/><br/>
</p>

</div>

---

---

<a id="zh"></a>
## 中文 · 价值与场景

- 完整保真：引号、空格、heredoc、续行、代码围栏均不被破坏。
- 一句“帮我复制”：自动判定整段/分条（assist_copy）。
- 会话池：整段/分条均入池，浏览器中逐条复制；会话结束自动清空；自动标签。
- 跨平台：macOS / Linux（Wayland/X11）/ Windows。

---

## 功能概览（通俗版）

一句话说明：你只要在对话里说“帮我复制”，我会自动判断“整段复制”还是“按条复制”，并给你一个浏览器地址来逐条复制，避免命令在聊天/终端里被格式化破坏。

- 自动决策复制方式：整段复制适合“一次跑完”；按条复制适合“逐步执行更稳”。
- 浏览器可视化：同一会话一个固定地址，展开就能看到每一条命令，点 Copy 即可。
- 会话池自动记录：这次会话复制过的内容都会暂存，关掉 Codex 会自动清空。

- 分条工具（bundle）
  - write_bundle 保存并可整段复制；list/copy/get/clear_* 用于按条查看与复制。
  - smart 分割会尽量保留 heredoc、代码块、续行等结构。

- 模型一次产出（省 token）：
  - split_plan_template → 模型一次返回 items（可带 label 文案）。
  - write_bundle_with_plan 用 items 落地；label 仅用于显示，不写入会话。

- 会话池（自动标签）
  - list_pool_items / copy_pool_item / get_pool_item / clear_pool
  - UI 展开完整内容，支持 Copy All（整段）

---

---

## 兼容与安全

- 后端：macOS(pbpaste/pbcopy)、Windows(PowerShell Get/Set-Clipboard)、Linux/BSD(wl-clipboard → xclip → xsel)
- X11 自适应：缺少 DISPLAY 时尝试 `DISPLAY=:0` 与 `~/.Xauthority`
- 本地 UI：仅回环 127.0.0.1，随机 token；不开启不影响 STDIO 工具

---

## 不同 CLI 的快速安装/注册

说明：先全局安装包，再在各自 CLI 中注册 MCP 服务器命令 `clipcaster-mcp`。带 UI 的版本更易用。

- Codex CLI（推荐）
  ```bash
  npm i -g @martin0359/clipcaster-mcp
  codex mcp remove clipboard || true
  # 开启本地浏览器 UI（建议）
  codex mcp add clipboard -- env CLIPCASTER_HTTP=1 "$(which clipcaster-mcp)"
  # 如不需要 UI：codex mcp add clipboard -- "$(which clipcaster-mcp)"
  codex mcp list
  ```

- Claude Code CLI（若其 CLI 支持 MCP 注册）
  ```bash
  claude-code mcp remove clipboard || true
  claude-code mcp add clipboard -- env CLIPCASTER_HTTP=1 "$(which clipcaster-mcp)"
  claude-code mcp list
  ```

- Gemini CLI（若其 CLI 支持 MCP 注册）
  ```bash
  gemini mcp remove clipboard || true
  gemini mcp add clipboard -- env CLIPCASTER_HTTP=1 "$(which clipcaster-mcp)"
  gemini mcp list
  ```

- MCP Inspector / 其他 MCP STDIO 客户端
  - 原则：把 `clipcaster-mcp` 作为 STDIO MCP 服务器命令；必要时在配置里加入 `CLIPCASTER_HTTP=1` 环境变量。

---

---

## Install & Register

```bash
# Global install (one of)
npm i -g @martin0359/clipcaster-mcp

# Register with Codex (idempotent)
codex mcp remove clipboard || true
codex mcp add clipboard -- "$(which clipcaster-mcp)"
codex mcp list
```

---

## Bundle Tools (multi‑line commands)

- `write_bundle({ text, split_mode? })` → Save a bundle (split into items) and copy full text to clipboard. `split_mode`: `smart` (default) | `simple` | `strict`.
- `write_bundle({ text, split_mode?, copy_full? })` → `copy_full` 为 false 时仅保存分条，不整段复制。
- `list_bundle_items({ bundleId?, offset?, limit? })` → List items: `{ index, preview, bytes }`.
- `copy_bundle_item({ index, bundleId? })` → Copy one item to clipboard (format preserved).
- `get_bundle_item({ index, bundleId? })` → Return full text of an item.
- `bundle_info()` → `{ bundleId, count, ui }`.
- `clear_bundle()` → Clear current bundle.

### Model‑assisted（模型一次产出“分条+标签”）
- `split_plan_template()` → 返回合并模板：模型一次给出 label 与 items（JS 端仅使用 items 建立 bundle，label 仅作显示用途）。
- `write_bundle_with_plan({ plan, copy_full? })` → 读取模型 `plan.items[]` 建立 bundle；`plan.label` 将被忽略（标签为自动生成）。

合并模板示例（模型产出）：
```json
{
  "mode": "model",
  "intent": "bundle-stepwise+label",
  "rationale": "将 heredoc 视为一条，其他按顶层 &&/||/; 拆分",
  "label": "部署脚本",
  "items": [
    "mkdir -p \"/tmp/bundle demo\"",
    "cat > \"/tmp/bundle demo/run.sh\" <<'EOF'\n...heredoc content...\nEOF",
    "chmod +x \"/tmp/bundle demo/run.sh\" && bash \"/tmp/bundle demo/run.sh\""
  ]
}
```

Notes
- Smart split keeps fenced code blocks, heredocs, and trailing backslash continuations intact.
- Strict split only breaks on blank‑line separators.

---

## Optional Local HTTP UI

Enable a lightweight local UI (loopback only) to browse and copy bundle items with one click. Disabled by default.

```bash
# Enable HTTP UI for current session
export CLIPCASTER_HTTP=1
# Optional: override host/port/token
# export CLIPCASTER_HTTP_HOST=127.0.0.1
# export CLIPCASTER_HTTP_PORT=0   # 0 = pick a free port
# export CLIPCASTER_HTTP_TOKEN=your_token

# Then start Codex (or other CLI); the MCP server will spawn the UI.
# To get the URL inside the CLI: call tool bundle_info() → ui.url
```

Behavior
- Runs on `127.0.0.1` with a random token; token required for all actions.
- Purely optional; STDIO tools continue to work identically on all platforms.
- No desktop/GUI dependency; just open in your browser.

Security
- UI listens only on loopback and requires token.
- Data is stored locally under `~/.config/clipcaster/bundles.json` (recent bundle metadata + last bundle items).

---

## Session Pool · 会话池（自动标签）

- 自动记录：每次整段复制或分条保存的条目会加入“会话池”（仅本次会话内有效）。
- 自动标签：根据文本首行自动生成 label（在 UI 中显示），同时记录 createdAt、intent(full|bundle|plan)。
- 工具：
  - `list_pool_items({ offset?, limit? })` → 返回 `{ index, createdAt, label, intent, preview, bytes }`。
  - `copy_pool_item({ index })` / `get_pool_item({ index })` / `clear_pool()`。
- UI：
  - Session Pool 中每条可展开查看“完整内容”，标题显示 `[label] 时间 intent`；
  - Current Bundle 区域同样可展开每条完整内容；
  - “Full Bundle Text” 区域支持一键 Copy All（整段复制）。

标签无需手动设置：为避免操作负担和泄露风险，系统仅使用自动标签（可在模型回复中展示 label 文案，但不写入会话标签）。

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

---

<a id="en"></a>
## English · Overview

- Plain benefit: Say “copy this”, the tool decides full vs bundle; your commands keep exact formatting.
- Session pool with auto labels; optional local UI with per‑session URL; cross‑platform backends.

Install & Register (Codex)
```bash
npm i -g @martin0359/clipcaster-mcp
codex mcp remove clipboard || true
codex mcp add clipboard -- env CLIPCASTER_HTTP=1 "$(which clipcaster-mcp)"
```

Other CLIs (if they support MCP):
- Claude Code CLI: `claude-code mcp add clipboard -- env CLIPCASTER_HTTP=1 "$(which clipcaster-mcp)"`
- Gemini CLI: `gemini mcp add clipboard -- env CLIPCASTER_HTTP=1 "$(which clipcaster-mcp)"`
- Any STDIO client: configure `clipcaster-mcp` as the server command.

Key tools
- assist_copy, write_clipboard, read_clipboard, clear_clipboard, clipboard_info
- write_bundle, list/copy/get/clear_bundle, bundle_info
- split_plan_template, write_bundle_with_plan
- list/copy/get/clear_pool

---

MIT © 2025 martin0359
