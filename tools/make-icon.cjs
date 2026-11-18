// App 圖示：直接用遊戲裡的鐘（10 點 10 分、不開外圈）放在天空色的底上，跟遊戲同一個風格。
// 用法：先開本機伺服器（python3 -m http.server 8124），再 node tools/make-icon.cjs
// 輸出 assets/icons/：icon-1024.png（圓角、透明底）、icon-1024-store.png（方的、不透明，商店用）、icon-512.png、icon-192.png、
// apple-touch-icon.png（180、方的）、icon-maskable-512.png（鐘縮到 78%，四周留給系統裁）。
const { chromium } = require('playwright');
const path = require('path');
const OUT = path.join(__dirname, '..', 'assets', 'icons'), URL = process.env.TT_URL || 'http://localhost:8124/index.html';
(async () => {
  const b = await chromium.launch({ executablePath: process.env.TT_CHROME || undefined, args: ['--no-sandbox'] });
  const shot = async (file, n, { round = true, scale = 0.86, alpha = true } = {}) => {
    const p = await (await b.newContext({ viewport: { width: n, height: n }, deviceScaleFactor: 1 })).newPage();
    await p.addInitScript(`localStorage.setItem('tick-town-v1', JSON.stringify({ tut: true, hinted: true, set: { lang: 'zh-Hant', sound: false, music: false, ring: false, level: 2 } }));`);
    await p.goto(URL); await p.waitForTimeout(400);
    await p.evaluate(() => { window.__tt.clock.set(10, 10); });
    await p.addStyleTag({ content: `#splash,#town,#fx,.overlay,#toast,.screen>*:not(#clock),#go-now{display:none!important}html,body{background:transparent!important}
      #s-menu{padding:0!important;display:block!important;background:linear-gradient(160deg,#a9dcff,#d8ecff 45%,#ffe3ec);${round ? 'border-radius:22.5%;' : ''}overflow:hidden}
      #clock{position:absolute!important;margin:0!important;width:${scale * 100}vw!important;left:${(1 - scale) * 50}vw;top:${(1 - scale) * 50 + 0.5}vw}` });
    await p.waitForTimeout(300); await p.screenshot({ path: path.join(OUT, file), omitBackground: alpha }); await p.context().close(); console.log(file, n);
  };
  await shot('icon-1024.png', 1024); await shot('icon-1024-store.png', 1024, { round: false, alpha: false });
  await shot('icon-512.png', 512); await shot('icon-192.png', 192); await shot('apple-touch-icon.png', 180, { round: false, alpha: false });
  await shot('icon-maskable-512.png', 512, { round: false, scale: 0.66, alpha: false });
  await b.close();
})();
