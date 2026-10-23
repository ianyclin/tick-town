// 寵物對位表：每隻每階段放大加 120 單位格線（每 10 單位一線），可選戴上配件，截圖看頭的位置
// 用法：NODE_PATH=... node tools/pet-sheet.cjs <輸出.png> [glasses,hat,scarf]  （要先在本機 8124 開伺服器）
const { chromium } = require('playwright');
const [out, wearArg] = process.argv.slice(2);
(async () => {
  const b = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium', args: ['--no-sandbox'] });
  const p = await b.newPage({ viewport: { width: 1250, height: 760 } });
  await p.addInitScript(`localStorage.setItem('tick-town-v1', JSON.stringify({ set: { sound: false }, hinted: true }));`);
  await p.goto('http://localhost:8124/index.html'); await p.waitForTimeout(600);
  await p.evaluate(wearArg => {
    const wear = wearArg ? { face: wearArg.includes('glasses') ? 'glasses' : '', head: wearArg.includes('hat') ? 'hat' : wearArg.includes('crown') ? 'crown' : wearArg.includes('bow') ? 'bow' : wearArg.includes('star') ? 'star' : '', neck: wearArg.includes('scarf') ? 'scarf' : '' } : null;
    const grid = Array.from({ length: 13 }, (_, i) => `<line x1="${i * 10}" y1="0" x2="${i * 10}" y2="120" stroke="${i % 5 ? 'rgba(0,0,0,.15)' : 'rgba(255,0,0,.4)'}" stroke-width=".4"/><line x1="0" y1="${i * 10}" x2="120" y2="${i * 10}" stroke="${i % 5 ? 'rgba(0,0,0,.15)' : 'rgba(255,0,0,.4)'}" stroke-width=".4"/>`).join('');
    const kinds = ['owl', 'squirrel', 'bear'];
    document.body.innerHTML = `<div style="position:fixed;inset:0;background:#cfe;z-index:99;display:grid;grid-template-columns:repeat(5,240px);grid-auto-rows:240px;gap:6px;padding:6px">` + kinds.map(k => [0, 1, 2, 3, 4].map(st => { const svg = window.__tt.petSVG(k, st, wear); return svg.replace('</svg>', grid + `<text x="2" y="8" font-size="7" fill="#c00">${k} ${st}</text></svg>`); }).join('')).join('') + '</div>';
  }, wearArg || '');
  await p.waitForTimeout(500); await p.screenshot({ path: out }); await b.close(); console.log('ok', out);
})();
