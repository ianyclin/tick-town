// 商店圖：Google Play 主視覺（1024×500）與手機截圖（iPhone 6.9 吋 1320×2868、Android 手機 1080×1920），五種語言。
// 用法：先開本機伺服器（python3 -m http.server 8124），再 node tools/store-art.cjs [語言,…]（預設全部）
// 輸出 store/graphic/feature-<語言>.png、store/screenshots/<裝置>/<語言>-<n>.jpg。
// 截圖用遊戲本身（Playwright），存檔先放好一點進度（小鎮長大、星圖有亮）讓畫面不空。
const { chromium } = require('playwright');
const fs = require('fs'), path = require('path');
const ROOT = path.join(__dirname, '..'), URL = process.env.TT_URL || 'http://localhost:8124/index.html';
const L = JSON.parse(fs.readFileSync(path.join(ROOT, 'store/listing.json'), 'utf8'));
const langs = (process.argv[2] || 'zh-Hant,en,ja,ko,es').split(',');
const SAVE = lang => JSON.stringify({ set: { lang, sound: false, music: false, level: 2 }, hinted: true, tut: true, free: 7 * 60 + 20, best: { days: 9, reads: 4, matches: 2 }, town: { lit: [], seen: 8 },
  pet: { kind: 'squirrel', fed: 120, acorn: 14, wear: { head: 'bow', face: '', neck: '' } }, daily: { badges: 3, streak: 2 },
  facts: Object.fromEntries(Array.from({ length: 40 }, (_, i) => [`r:${i % 12 + 1}:${(i * 5) % 60}`, { n: 3, w: 0, err: 0.05, t: 2000 }])) });
(async () => {
  const b = await chromium.launch();
  for (const lang of langs) {
    const g = L[lang].graphic;
    // 主視覺：左邊標題、右邊遊戲畫面
    { const p = await b.newPage({ viewport: { width: 1024, height: 500 } });
      const shot = await (async () => { const q = await b.newPage({ viewport: { width: 390, height: 760 }, deviceScaleFactor: 2 }); await q.addInitScript(`localStorage.setItem('tick-town-v1', ${JSON.stringify(SAVE(lang))});`); await q.goto(URL); await q.waitForTimeout(2300); const buf = await q.screenshot(); await q.close(); return buf.toString('base64'); })();
      const font = lang === 'ja' ? 'zenmaru-900' : 'chiron-900';
      await p.setContent(`<html><head><style>@font-face{font-family:T;src:url(${URL.replace('index.html', '')}assets/fonts/${font}.woff2)}
        body{margin:0;width:1024px;height:500px;overflow:hidden;background:linear-gradient(#8fc9ff,#ffe9c9);font-family:T,sans-serif;position:relative}
        .l{position:absolute;left:56px;top:60px;width:560px}.i{width:128px;height:128px;border-radius:28px;box-shadow:0 8px 20px rgba(0,0,0,.15)}
        h1{margin:18px 0 8px;font-size:64px;color:#fff;text-shadow:0 4px 0 rgba(0,0,0,.25);letter-spacing:2px;line-height:1.1}
        p{margin:0;font-size:36px;line-height:1.3;color:#3b2f2f}.badge{display:inline-block;margin-top:22px;background:#fff;border-radius:999px;padding:8px 20px;font-size:22px;color:#c77a10}
        .ph{position:absolute;right:56px;top:34px;width:230px;height:449px;border-radius:30px;border:8px solid #2b2b33;overflow:hidden;background:#000;box-shadow:0 10px 30px rgba(0,0,0,.25)}.ph img{width:100%}
        .gr{position:absolute;left:0;right:0;bottom:-60px;height:140px;background:#79c35e;border-radius:50% 50% 0 0}</style></head>
        <body><div class="gr"></div><div class="l"><img class="i" src="${URL.replace('index.html', '')}assets/icons/icon-512.png"><h1>${g.title}</h1><p>${g.tagline}</p><span class="badge">${g.badge}</span></div><div class="ph"><img src="data:image/png;base64,${shot}"></div></body></html>`);
      await p.waitForTimeout(800); fs.mkdirSync(path.join(ROOT, 'store/graphic'), { recursive: true }); await p.screenshot({ path: path.join(ROOT, `store/graphic/feature-${lang}.png`) }); await p.close(); }
    // 手機截圖：主選單、小鎮的一天、幾點了、修鐘店、星圖
    for (const [dev, vw, vh, sc] of [['iphone-6.9', 440, 956, 3], ['android-phone', 360, 640, 3]]) {
      const dir = path.join(ROOT, 'store/screenshots', dev); fs.mkdirSync(dir, { recursive: true });
      const p = await b.newPage({ viewport: { width: vw, height: vh }, deviceScaleFactor: sc });
      await p.addInitScript(`localStorage.setItem('tick-town-v1', ${JSON.stringify(SAVE(lang))});`);
      await p.goto(URL); await p.waitForTimeout(2300);
      const snap = async n => p.screenshot({ path: path.join(dir, `${lang}-${n}.jpg`), type: 'jpeg', quality: 86 });
      await snap(1);
      await p.click('[data-mode=day]'); await p.waitForTimeout(400); await snap(2); await p.click('#s-day [data-home]'); await p.waitForTimeout(300);
      await p.click('[data-mode=read]'); await p.waitForTimeout(400); await snap(3); await p.click('#s-read [data-home]'); await p.waitForTimeout(300);
      await p.click('[data-mode=shop]'); await p.waitForTimeout(400); await snap(4); await p.click('#s-shop [data-home]'); await p.waitForTimeout(300);
      await p.click('#go-map'); await p.waitForTimeout(400); await snap(5);
      await p.close();
    }
    console.log(lang, 'done');
  }
  await b.close();
})();
