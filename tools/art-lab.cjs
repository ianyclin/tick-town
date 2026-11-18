// 美術樣張：把 index.html 裡自己畫的圖（ART）一格一格排出來看。
// 用法：node tools/art-lab.cjs <輸出.png> [名字,名字:lit,…（不給就全部）] [每格 px] [背景 CSS]
//   例：node tools/art-lab.cjs /tmp/a.png bear,bunny,house-2:lit,pet-owl-1 240
const { chromium } = require('playwright');
const fs = require('fs'), path = require('path');
const src = fs.readFileSync(path.join(__dirname, '..', 'index.html'), 'utf8');
const a = src.indexOf('const ART = (() => {'), b = src.indexOf('\n})();', a) + 6;
const ART = new Function(src.slice(a, b) + '; return ART;')();
const out = process.argv[2], names = (process.argv[3] || Object.keys(ART.art).join(',')).split(','), px = +process.argv[4] || 200, bg = process.argv[5] || 'linear-gradient(#cfeeff,#fff4e6 60%,#bfe8b0 60%)';
if (!out) { console.log(Object.keys(ART.art).join(' ')); process.exit(0); }
(async () => {
  const b = await chromium.launch({ executablePath: process.env.TT_CHROME || undefined, args: ['--no-sandbox'] });
  const cols = Math.min(names.length, 6), rows = Math.ceil(names.length / cols);
  const p = await b.newPage({ viewport: { width: cols * (px + 20) + 20, height: rows * (px + 46) + 20 } });
  const cells = names.map(n => { const [nm, o] = n.split(':'); const opt = o ? Object.fromEntries(o.split('+').map(k => [k, 1])) : undefined; if (!ART.art[nm]) return `<div>?${n}</div>`; return `<div style="display:inline-flex;flex-direction:column;align-items:center;margin:10px;width:${px}px"><img src="${ART.url(nm, opt)}" style="max-width:${px}px;height:${px}px;object-fit:contain"><small style="font:13px sans-serif;color:#555">${n}</small></div>`; }).join('');
  await p.setContent(`<body style="margin:0;background:${bg};min-height:100vh">${cells}</body>`); await p.waitForTimeout(500); await p.screenshot({ path: out }); await b.close();
})();
