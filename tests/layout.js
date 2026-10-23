// 版面：各尺寸讀鐘鍵盤在畫面內、首次開啟模式鈕在畫面內、雙人把手與返回鈕、toast 位置
const { chromium } = require('playwright');
let fails = 0; const ok = (c, m) => { console.log((c ? 'PASS ' : 'FAIL ') + m); if (!c) fails++; };
const SHOT = process.argv[2];
(async () => {
  const b = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium', args: ['--no-sandbox'] });
  for (const [w, h] of [[320, 568], [360, 640], [375, 667], [390, 844], [414, 736], [466, 678], [626, 890], [820, 1180], [1024, 768]]) for (const lang of ['zh-Hant', 'en', 'ja']) {
    const p = await (await b.newContext({ viewport: { width: w, height: h } })).newPage(); const errs = []; p.on('pageerror', e => errs.push(e.message));
    await p.addInitScript(`localStorage.setItem('tick-town-v1', JSON.stringify({ set: { lang: '${lang}', sound: false, level: 3 } }));`);   // hinted:false 首次開啟
    await p.goto('http://localhost:8124/index.html'); await p.waitForTimeout(250);
    const inView = sel => p.evaluate(sel => { const r = document.querySelector(sel).getBoundingClientRect(); return r.bottom <= innerHeight + 1 && r.top >= -1; }, sel);
    ok(await inView('#modes'), `${w}x${h} ${lang} 首次開啟模式鈕在畫面內`);
    const h1lines = await p.evaluate(() => { const e = document.querySelector('h1'); return e.getBoundingClientRect().height / parseFloat(getComputedStyle(e).fontSize); }); ok(h1lines <= 1.7, `${w}x${h} ${lang} 標題一行`);
    await p.click('[data-mode=read]'); await p.waitForTimeout(250);
    ok(await inView('#read-keys'), `${w}x${h} ${lang} 讀鐘鍵盤整個在畫面內`);
    const okBtn = await p.evaluate(() => { const r = document.querySelector('.key.ok').getBoundingClientRect(); return r.height >= 44 && r.bottom <= innerHeight; }); ok(okBtn, `${w}x${h} ${lang} 「好了」按得到`);
    if (SHOT && w === 320) await p.screenshot({ path: `${SHOT}/lay-read-${lang}-${w}.png` });
    await p.click('#s-read [data-home]'); await p.click('[data-mode=versus]'); await p.click('[data-opp=human]'); await p.click('#vs-start'); await p.waitForTimeout(250);
    const kn = await p.evaluate(() => Math.min(...[...document.querySelectorAll('#s-versus .knob')].map(k => k.getBoundingClientRect().width))); ok(kn >= (w >= 390 && h >= 740 ? 56 : 44), `${w}x${h} ${lang} 雙人把手 ${Math.round(kn)}px`);
    const back = await p.evaluate(() => document.querySelector('#s-versus [data-home]').getBoundingClientRect().height); ok(back >= 44, `${w}x${h} ${lang} 雙人返回鈕 ${Math.round(back)}px`);
    const halves = await p.evaluate(() => ['#v-top', '#v-bottom'].map(id => { const r = document.querySelector(id).getBoundingClientRect(); const c = document.querySelector(id + ' .clock-wrap').getBoundingClientRect(); return c.top >= r.top - 1 && c.bottom <= r.bottom + 1; })); ok(halves.every(Boolean), `${w}x${h} ${lang} 兩座鐘都在各自那一半裡`);
    await p.evaluate(() => { window.__tt.Quest.add('vs'); }); await p.waitForTimeout(50);
    const tpos = await p.evaluate(() => { const t = document.querySelector('#toast'); if (t.hidden) return null; const r = t.getBoundingClientRect(); const c = document.querySelector('#clockA').getBoundingClientRect(); return r.bottom <= c.top + 2; }); if (tpos !== null) ok(tpos, `${w}x${h} ${lang} 雙人的 toast 不蓋下面的鐘`);
    if (SHOT && w === 320) await p.screenshot({ path: `${SHOT}/lay-vs-${lang}-${w}.png` });
    ok(errs.length === 0, `${w}x${h} ${lang} 無錯誤`); await p.context().close();
  }
  await b.close(); console.log(fails ? `${fails} FAIL` : 'ALL PASS'); process.exit(fails ? 1 : 0);
})();
