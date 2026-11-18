// 修鐘店（標籤對不對）與主選單的「現在」鈕
const { chromium } = require('playwright');
let fails = 0; const ok = (c, m) => { console.log((c ? 'PASS ' : 'FAIL ') + m); if (!c) fails++; };
const SHOT = process.argv[2];
const URL = process.env.TT_URL || 'http://localhost:8124/index.html';
(async () => {
  const b = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium', args: ['--no-sandbox'] });
  for (const [lang, level, w, h] of [['zh-Hant', 2, 390, 844], ['en', 1, 320, 568], ['ja', 3, 360, 640], ['ko', 2, 375, 667], ['es', 2, 320, 568]]) {
    const tag = `${w}x${h} ${lang}`;
    const p = await (await b.newContext({ viewport: { width: w, height: h }, hasTouch: true })).newPage(); p.errs = []; p.on('pageerror', e => p.errs.push(e.message));
    await p.addInitScript(`if (!sessionStorage.x) { sessionStorage.x = 1; localStorage.setItem('tick-town-v1', JSON.stringify({ set: { lang: '${lang}', sound: false, music: false, level: ${level} }, hinted: true, tut: true, errs: { hourLate: 0.6 } })); }`);
    await p.goto(URL); await p.waitForTimeout(400);
    // 主選單 5 個鈕都放得下
    ok(await p.evaluate(() => { const m = [...document.querySelectorAll('#modes .mode')]; return m.length === 5 && m.every(e => { const r = e.getBoundingClientRect(); return r.right <= innerWidth + 1 && r.bottom <= innerHeight + 1 && r.height >= 44 && [...e.querySelectorAll('span')].every(s => s.scrollWidth <= e.clientWidth + 1); }); }), `${tag} 主選單 5 個鈕都放得下、字沒被切`);
    // 現在鈕
    ok(await p.evaluate(() => { const r = document.querySelector('#go-now').getBoundingClientRect(); return r.width >= 44 && r.height >= 44 && r.right <= innerWidth; }), `${tag} 「現在」鈕 ≥ 44px`);
    await p.click('#go-now'); await p.waitForTimeout(100);
    const [ct, nowM] = await p.evaluate(() => { const d = new Date(); return [window.__tt.clock.get().tot, d.getHours() * 60 + d.getMinutes()]; });
    ok(Math.abs(ct - nowM) <= 3 || Math.abs(ct - nowM) >= 1437, `${tag} 按「現在」鐘跳到現在（${ct} vs ${nowM}）`);
    // 修鐘店
    await p.click('[data-mode=shop]'); await p.waitForTimeout(250);
    ok(await p.isVisible('#s-shop'), `${tag} 進入修鐘店`);
    const inView = sel => p.evaluate(sel => { const r = document.querySelector(sel).getBoundingClientRect(); return r.top >= -1 && r.bottom <= innerHeight + 1 && r.left >= -1 && r.right <= innerWidth + 1; }, sel);
    ok(await inView('#shop-tag') && await inView('#shop-yes') && await inView('#shop-fix') && await inView('#clock5'), `${tag} 鐘、標籤、兩個鈕都在畫面內`);
    if (SHOT) await p.screenshot({ path: `${SHOT}/shop-${lang}.png` });
    let nOk = 0, nBad = 0, didMiss = false, didFix = false;
    for (let i = 0; i < 10; i++) {
      const q = await p.evaluate(() => { const q = window.__tt.Shop.q(); return { h: q.h, m: q.m, tag: q.tag }; });
      const tagOk = q.tag[0] === 'ok'; tagOk ? nOk++ : nBad++;
      ok(tagOk || q.tag[1] !== q.h || q.tag[2] !== q.m, `${tag} 第 ${i + 1} 題 ${q.h}:${q.m}，標籤 ${q.tag[1]}:${q.tag[2]}（${q.tag[0]}）`);
      if (!tagOk && !didMiss) {   // 錯的標籤按「對」：記錯法、虛線、提示，按知道了下一題
        didMiss = true; const before = (await p.evaluate(() => window.__tt.DB().errs))[q.tag[0]] || 0;
        await p.click('#shop-yes'); await p.waitForTimeout(150);
        ok(await p.isVisible('#shop-hint-ok') && await p.evaluate(() => document.querySelectorAll('#clock5 .ghost').length) >= 2, `${tag} 錯的標籤按「對」：虛線＋提示「${(await p.textContent('#shop-hint')).slice(0, 40)}…」`);
        ok(((await p.evaluate(() => window.__tt.DB().errs))[q.tag[0]] || 0) > before, `${tag} 記成 ${q.tag[0]}`);
        if (SHOT && lang === 'zh-Hant') await p.screenshot({ path: `${SHOT}/shop-miss.png` });
        await p.click('#shop-hint-ok'); await p.waitForTimeout(200); continue;
      }
      if (!tagOk && !didFix) { didFix = true; await p.click('#shop-fix'); await p.waitForTimeout(150); ok(await p.evaluate(() => document.querySelector('#shop-tag').classList.contains('fixed')), `${tag} 按「要修」：標籤修好變成 ${await p.textContent('#shop-tag')}`); if (SHOT && lang === 'zh-Hant') await p.screenshot({ path: `${SHOT}/shop-fixed.png` }); await p.waitForTimeout(1200); continue; }
      await p.click(tagOk ? '#shop-yes' : '#shop-fix'); await p.evaluate(sel => document.querySelector(sel).click(), tagOk ? '#shop-fix' : '#shop-yes'); await p.waitForTimeout(1250);   // 第二下不算（已經答過）
    }
    await p.waitForTimeout(200);
    ok(await p.isVisible('#o-sdone'), `${tag} 一輪 10 個：「${await p.textContent('#sdone-h')}」`);
    ok(nOk >= 1 && nBad >= 2, `${tag} 對的標籤 ${nOk} 個、錯的 ${nBad} 個`);
    const d = await p.evaluate(() => window.__tt.DB()); ok(d.best.shops === 1 && Object.keys(d.facts).some(k => k.startsWith('r:')), `${tag} 記進讀鐘紀錄、shops=1`);
    await p.click('#sdone-home'); await p.waitForTimeout(400); ok(await p.isVisible('#s-menu'), `${tag} 回主選單`);
    ok(p.errs.length === 0, `${tag} 無錯誤 ${p.errs.join(' | ')}`); await p.close();
  }
  await b.close();
  console.log(fails ? `\n${fails} FAILED` : '\nALL PASS'); process.exit(fails ? 1 : 0);
})();
