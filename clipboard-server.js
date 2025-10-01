#!/usr/bin/env node
// Minimal MCP clipboard server over stdio without external dependencies.
// Implements two tools:
// - read_clipboard(): returns current clipboard text
// - write_clipboard({ text }): writes text to clipboard

import { spawn, execFileSync, spawnSync } from 'node:child_process';
import fs from 'node:fs';
import os from 'node:os';
import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { z } from 'zod';

function hasCommand(cmd) {
  try {
    if (process.platform === 'win32') {
      const r = spawnSync('where', [cmd], { stdio: 'ignore' });
      return r.status === 0;
    } else {
      const r = spawnSync('bash', ['-lc', `command -v ${cmd} >/dev/null 2>&1`], { stdio: 'ignore' });
      return r.status === 0;
    }
  } catch {
    return false;
  }
}

function envWithDisplay(baseEnv = process.env) {
  const env = { ...baseEnv };
  // If DISPLAY is missing (common when client didn't propagate), try sensible defaults for X11
  if (!env.DISPLAY) {
    env.DISPLAY = ':0';
  }
  if (!env.XAUTHORITY) {
    const home = env.HOME || os.homedir();
    const xauth = home ? `${home}/.Xauthority` : undefined;
    if (xauth && fs.existsSync(xauth)) {
      env.XAUTHORITY = xauth;
    }
  }
  return env;
}

async function readClipboard() {
  if (process.platform === 'darwin') {
    return execFileSync('pbpaste', [], { encoding: 'utf8' });
  }
  if (process.platform === 'win32') {
    // Use PowerShell to read clipboard text.
    const ps = spawnSync('powershell', ['-NoProfile', '-Command', 'Get-Clipboard'], { encoding: 'utf8' });
    if (ps.status === 0) return ps.stdout.replace(/\r?\n$/, '');
    throw new Error(`PowerShell Get-Clipboard failed: ${ps.stderr || ps.status}`);
  }
  // Linux/BSD: prefer Wayland (wl-clipboard), then xclip, then xsel
  if (hasCommand('wl-paste')) {
    const out = spawnSync('wl-paste', [], { encoding: 'utf8' });
    if (out.status === 0) return out.stdout;
  }
  if (hasCommand('xclip')) {
    const out = spawnSync('xclip', ['-selection', 'clipboard', '-o'], { encoding: 'utf8', env: envWithDisplay() });
    if (out.status === 0) return out.stdout;
  }
  if (hasCommand('xsel')) {
    const out = spawnSync('xsel', ['--clipboard', '--output'], { encoding: 'utf8', env: envWithDisplay() });
    if (out.status === 0) return out.stdout;
  }
  throw new Error('No clipboard command found (install xclip or xsel).');
}

async function writeClipboard(text) {
  if (typeof text !== 'string') text = String(text ?? '');
  if (process.platform === 'darwin') {
    const p = spawn('pbcopy');
    p.stdin.end(text, 'utf8');
    return await new Promise((resolve, reject) => {
      p.on('exit', code => (code === 0 ? resolve() : reject(new Error(`pbcopy exit ${code}`))));
      p.on('error', reject);
    });
  }
  if (process.platform === 'win32') {
    // Avoid quoting issues: pipe stdin to PowerShell and set clipboard from STDIN
    const cmd = 'Set-Clipboard -Value ([Console]::In.ReadToEnd())';
    const p = spawn('powershell', ['-NoProfile', '-Command', cmd]);
    p.stdin.end(text, 'utf8');
    return await new Promise((resolve, reject) => {
      p.on('exit', code => (code === 0 ? resolve() : reject(new Error(`Set-Clipboard exit ${code}`))));
      p.on('error', reject);
    });
  }
  // Linux/BSD: prefer Wayland (wl-clipboard), then xclip, then xsel
  if (hasCommand('wl-copy')) {
    const p = spawn('wl-copy');
    p.stdin.end(text, 'utf8');
    return await new Promise((resolve, reject) => {
      p.on('exit', code => (code === 0 ? resolve() : reject(new Error(`wl-copy exit ${code}`))));
      p.on('error', reject);
    });
  }
  if (hasCommand('xclip')) {
    const p = spawn('xclip', ['-selection', 'clipboard'], { env: envWithDisplay() });
    p.stdin.end(text, 'utf8');
    return await new Promise((resolve, reject) => {
      p.on('exit', code => (code === 0 ? resolve() : reject(new Error(`xclip exit ${code}`))));
      p.on('error', reject);
    });
  }
  if (hasCommand('xsel')) {
    const p = spawn('xsel', ['--clipboard', '--input'], { env: envWithDisplay() });
    p.stdin.end(text, 'utf8');
    return await new Promise((resolve, reject) => {
      p.on('exit', code => (code === 0 ? resolve() : reject(new Error(`xsel exit ${code}`))));
      p.on('error', reject);
    });
  }
  throw new Error('No clipboard command found (install xclip or xsel).');
}

function detectBackend() {
  if (process.platform === 'darwin') return { platform: 'darwin', backend: 'pbcopy/pbpaste', available: true };
  if (process.platform === 'win32') return { platform: 'win32', backend: 'PowerShell Get/Set-Clipboard', available: true };
  if (hasCommand('wl-copy') && hasCommand('wl-paste')) return { platform: process.platform, backend: 'wl-clipboard', available: true };
  if (hasCommand('xclip')) return { platform: process.platform, backend: 'xclip', available: true };
  if (hasCommand('xsel')) return { platform: process.platform, backend: 'xsel', available: true };
  return { platform: process.platform, backend: 'none', available: false };
}

const server = new McpServer({ name: 'clipboard', version: '0.1.0' });

server.registerTool(
  'read_clipboard',
  {
    title: 'Read Clipboard',
    description: 'Read text from the system clipboard',
    // SDK expects a Zod raw shape here, not z.object
    inputSchema: {}
  },
  async () => {
    const text = await readClipboard();
    return { content: [{ type: 'text', text }] };
  }
);

server.registerTool(
  'write_clipboard',
  {
    title: 'Write Clipboard',
    description: 'Write text to the system clipboard',
    // Pass raw Zod shape
    inputSchema: { text: z.string() }
  },
  async ({ text }) => {
    await writeClipboard(text);
    return { content: [{ type: 'text', text: 'ok' }] };
  }
);

// Clear the clipboard by writing an empty string.
server.registerTool(
  'clear_clipboard',
  {
    title: 'Clear Clipboard',
    description: 'Clear the system clipboard text contents',
    inputSchema: {}
  },
  async () => {
    await writeClipboard('');
    return { content: [{ type: 'text', text: 'ok' }] };
  }
);

// Report backend/platform info for debugging per mcp-config guidance
server.registerTool(
  'clipboard_info',
  {
    title: 'Clipboard Info',
    description: 'Show detected clipboard backend and availability',
    inputSchema: {}
  },
  async () => {
    const info = detectBackend();
    const message = `platform=${info.platform} backend=${info.backend} available=${info.available}`;
    return { content: [{ type: 'text', text: message }] };
  }
);

const transport = new StdioServerTransport();
await server.connect(transport);
