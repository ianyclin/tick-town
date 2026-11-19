// 內購審查用的截圖：App 版的購買卡（用假的 Capacitor 讀到價錢 NT$90），iPhone 1206×2622。
// 用法：先開本機伺服器（python3 -m http.server 8124），再 node tools/iap-shot.cjs → store/iap/purchase-zh-Hant.png、purchase-en.png
const { chromium } = require('playwright');
const path = require('path');
const URL = process.env.TT_URL || 'http://localhost:8124/index.html', OUT = path.join(__dirname, '..', 'store', 'iap');
const FAKE = `window.Capacitor = { isNativePlatform: () => true, getPlatform: () => 'ios', addListener: () => {}, nativePromise: async (pl, m) => { if (m === 'getProducts') return { products: [{ priceString: 'NT$90' }] }; if (m === 'getPurchases') return { purchases: [] }; return {}; } };`;
(async () => {
  const b = await chromium.launch({ executablePath: process.env.TT_CHROME || undefined, args: ['--no-sandbox'] });
  for (const lang of ['zh-Hant', 'en']) {
    const p = await (await b.newContext({ viewport: { width: 402, height: 874 }, deviceScaleFactor: 3 })).newPage();
    await p.addInitScript(FAKE); await p.addInitScript(`localStorage.setItem('tick-town-v1', JSON.stringify({ tut: true, hinted: true, set: { lang: '${lang}', sound: false, music: false } }));`);
    await p.goto(URL); await p.waitForTimeout(2300);
    await p.evaluate(() => { document.querySelector('#go-set').click(); }); await p.waitForTimeout(200); await p.evaluate(() => document.querySelector('#set-unlock').click()); await p.waitForTimeout(300);
    const q = await p.textContent('#gate-q'), m = q.match(/(\d+)\s*\+\s*(\d+)\s*×\s*(\d+)/); for (const ch of String(+m[1] + m[2] * m[3])) await p.click(`#gate-keys [data-k="${ch}"]`);
    await p.waitForTimeout(800); await p.screenshot({ path: path.join(OUT, `purchase-${lang}.png`) }); console.log(lang, await p.textContent('#buy-go')); await p.close();
  }
  await b.close();
})();
