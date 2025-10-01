#!/usr/bin/env node
// Cross-platform clipboard helper (no external deps, no MCP required)
// Usage:
//   Write: echo "text" | clip write
//   Read:  clip read

import { spawn, spawnSync, execFileSync } from 'node:child_process';

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

async function writeClipboard(text) {
  if (typeof text !== 'string') text = String(text ?? '');
  if (process.platform === 'darwin') {
    const p = spawn('pbcopy');
    p.stdin.end(text, 'utf8');
    await new Promise((resolve, reject) => {
      p.on('exit', c => (c === 0 ? resolve() : reject(new Error(`pbcopy ${c}`))));
      p.on('error', reject);
    });
    return;
  }
  if (process.platform === 'win32') {
    const p = spawn('powershell', ['-NoProfile', '-Command', 'Set-Clipboard -Value ([Console]::In.ReadToEnd())']);
    p.stdin.end(text, 'utf8');
    await new Promise((resolve, reject) => {
      p.on('exit', c => (c === 0 ? resolve() : reject(new Error(`Set-Clipboard ${c}`))));
      p.on('error', reject);
    });
    return;
  }
  if (hasCommand('xclip')) {
    const p = spawn('xclip', ['-selection', 'clipboard']);
    p.stdin.end(text, 'utf8');
    await new Promise((resolve, reject) => {
      p.on('exit', c => (c === 0 ? resolve() : reject(new Error(`xclip ${c}`))));
      p.on('error', reject);
    });
    return;
  }
  if (hasCommand('xsel')) {
    const p = spawn('xsel', ['--clipboard', '--input']);
    p.stdin.end(text, 'utf8');
    await new Promise((resolve, reject) => {
      p.on('exit', c => (c === 0 ? resolve() : reject(new Error(`xsel ${c}`))));
      p.on('error', reject);
    });
    return;
  }
  throw new Error('No clipboard utility found (install xclip or xsel)');
}

function readClipboard() {
  if (process.platform === 'darwin') {
    return execFileSync('pbpaste', [], { encoding: 'utf8' });
  }
  if (process.platform === 'win32') {
    const r = spawnSync('powershell', ['-NoProfile', '-Command', 'Get-Clipboard'], { encoding: 'utf8' });
    if (r.status === 0) return r.stdout;
    throw new Error(`Get-Clipboard failed: ${r.stderr || r.status}`);
  }
  if (hasCommand('xclip')) {
    const r = spawnSync('xclip', ['-selection', 'clipboard', '-o'], { encoding: 'utf8' });
    if (r.status === 0) return r.stdout;
  }
  if (hasCommand('xsel')) {
    const r = spawnSync('xsel', ['--clipboard', '--output'], { encoding: 'utf8' });
    if (r.status === 0) return r.stdout;
  }
  throw new Error('No clipboard utility found (install xclip or xsel)');
}

async function main() {
  const [cmd] = process.argv.slice(2);
  if (!cmd || (cmd !== 'write' && cmd !== 'read')) {
    console.error('Usage: clip write|read');
    process.exit(2);
  }
  if (cmd === 'write') {
    let chunks = [];
    process.stdin.on('data', c => chunks.push(c));
    process.stdin.on('end', async () => {
      const text = Buffer.concat(chunks).toString('utf8');
      try {
        await writeClipboard(text);
        process.stdout.write('ok\n');
      } catch (e) {
        console.error(String(e?.message || e));
        process.exit(1);
      }
    });
    process.stdin.resume();
    return;
  }
  if (cmd === 'read') {
    try {
      const t = readClipboard();
      process.stdout.write(t);
    } catch (e) {
      console.error(String(e?.message || e));
      process.exit(1);
    }
  }
}

main();

