// 版面：各尺寸讀鐘鍵盤在畫面內、首次開啟模式鈕在畫面內、雙人把手與返回鈕、toast 位置
const { chromium } = require('playwright');
let fails = 0; const ok = (c, m) => { console.log((c ? 'PASS ' : 'FAIL ') + m); if (!c) fails++; };
const SHOT = process.argv[2];
(async () => {
  const b = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium', args: ['--no-sandbox'] });
  for (const [w, h] of [[320, 568], [360, 640], [375, 667], [390, 844], [414, 736], [466, 678], [626, 890], [820, 1180], [1024, 768]]) for (const lang of ['zh-Hant', 'en', 'ja', 'ko', 'es']) {
    const p = await (await b.newContext({ viewport: { width: w, height: h } })).newPage(); const errs = []; p.on('pageerror', e => errs.push(e.message));
    await p.addInitScript(`localStorage.setItem('tick-town-v1', JSON.stringify({ set: { lang: '${lang}', sound: false, level: 3 } }));`);   // hinted:false 首次開啟
    await p.goto('http://localhost:8124/index.html'); await p.waitForTimeout(250);
    const inView = sel => p.evaluate(sel => { const r = document.querySelector(sel).getBoundingClientRect(); return r.bottom <= innerHeight + 1 && r.top >= -1; }, sel);
    ok(await inView('#modes'), `${w}x${h} ${lang} 首次開啟模式鈕在畫面內`);
    const h1lines = await p.evaluate(() => { const e = document.querySelector('h1'), cs = getComputedStyle(e); return (e.offsetHeight - parseFloat(cs.paddingTop) - parseFloat(cs.paddingBottom)) / parseFloat(cs.fontSize); }); ok(h1lines <= (w <= 340 ? 2.2 : 1.7), `${w}x${h} ${lang} 標題一行（320 寬放不下才兩行）`);
    const h1cut = await p.evaluate(() => { const e = document.querySelector('h1'); return e.scrollWidth - e.clientWidth; }); ok(h1cut <= 0, `${w}x${h} ${lang} 標題沒被切掉（多出 ${h1cut}px）`);
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
  // 「減少動態效果」打開、主選單上排有橡果和任務（右邊的鈕最多）時，標題也要縮到放得下；兩個人一起的比數在正中間
  for (const [w, h, lang] of [[320, 568, 'zh-Hant'], [375, 667, 'en'], [360, 640, 'es'], [414, 736, 'ja']]) {
    const p = await (await b.newContext({ viewport: { width: w, height: h }, reducedMotion: 'reduce' })).newPage();
    await p.addInitScript(`localStorage.setItem('tick-town-v1', JSON.stringify({ tut: true, hinted: true, set: { lang: '${lang}', sound: false, music: false }, pet: { kind: 'bear', acorn: 60, fed: 260 }, daily: { badges: 20 } }));`);
    await p.goto('http://localhost:8124/index.html'); await p.waitForTimeout(1500);
    const t = await p.evaluate(() => { const h = document.querySelector('h1'), r = h.getBoundingClientRect(), n = h.nextElementSibling.getBoundingClientRect(); return { fit: h.scrollWidth <= h.clientWidth + 1, gap: n.left - r.right }; });
    ok(t.fit && t.gap >= 0, `${w}x${h} ${lang} 減少動態：標題放得下（${JSON.stringify(t)}）`);
    await p.evaluate(() => { document.querySelector('[data-mode=versus]').click(); }); await p.waitForTimeout(200); await p.evaluate(() => document.querySelector('#vs-start').click()); await p.waitForTimeout(400);
    const c = await p.evaluate(() => { const r = [...document.querySelectorAll('.vscore > span')].find(e => e.textContent === ':').getBoundingClientRect(); return Math.abs(r.left + r.width / 2 - innerWidth / 2); });
    ok(c <= 6, `${w}x${h} ${lang} 雙人比數在正中間（差 ${c.toFixed(1)}px）`);
    await p.context().close();
  }
  await b.close(); console.log(fails ? `${fails} FAIL` : 'ALL PASS'); process.exit(fails ? 1 : 0);
})();
