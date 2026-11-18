#!/usr/bin/env node
// 把遊戲本體複製到 www/（Capacitor 的 webDir）。index.html 與 assets 原封不動，不改、不壓縮、不加任何檔。
// 用法：node tools/make-www.mjs（或 npm run www）。www/ 是產物，不進版控。
// 不放進 App 的：商店用的 1024 圖示、測試、工具、隱私權頁（那些放在 GitHub Pages）。
import { cpSync, rmSync, mkdirSync, existsSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const out = join(root, 'www');
rmSync(out, { recursive: true, force: true });
mkdirSync(out, { recursive: true });
for (const f of ['index.html', 'manifest.json']) cpSync(join(root, f), join(out, f));
cpSync(join(root, 'assets'), join(out, 'assets'), { recursive: true, filter: src => !/icon-1024/.test(src) });
for (const f of ['index.html', 'assets/fonts', 'assets/pets', 'assets/gear', 'assets/icons/icon-512.png']) {
  if (!existsSync(join(out, f))) { console.error('缺少 ' + f); process.exit(1); }
}
console.log('www/ 完成');
