// 配對：8 張牌 4 對、翻錯翻回去、配錯記讀錯、全配完結算
const { chromium } = require('playwright');
let fails = 0; const ok = (c, m) => { console.log((c ? 'PASS ' : 'FAIL ') + m); if (!c) fails++; };
const SHOT = process.argv[2];
(async () => {
  const b = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium', args: ['--no-sandbox'] });
  for (const [lang, level, w, h] of [['zh-Hant', 2, 390, 844], ['en', 1, 320, 568], ['ja', 2, 820, 1180]]) {
    const p = await (await b.newContext({ viewport: { width: w, height: h } })).newPage(); const errs = []; p.on('pageerror', e => errs.push(e.message));
    await p.addInitScript(`localStorage.setItem('tick-town-v1', JSON.stringify({ set: { lang: '${lang}', sound: false, level: ${level} }, hinted: true }));`);
    await p.goto('http://localhost:8124/index.html'); await p.waitForTimeout(300);
    await p.click('[data-mode=match]'); await p.waitForTimeout(300);
    ok(await p.isVisible('#s-match') && (await p.$$('#mgrid .mcard')).length === 8, `${lang} 8 張牌`);
    const S = () => p.evaluate(() => { const s = window.__tt.Match.s(); return { cards: s.cards.map(c => ({ t: c.t, r: c.r, i: c.i, done: !!c.done })), done: s.done, flips: s.flips }; });
    let st = await S(); const ids = new Set(st.cards.map(c => c.i)); ok(ids.size === 4 && st.cards.every(c => st.cards.filter(x => x.i === c.i).length === 2), `${lang} 4 對，每對 2 張`);
    ok(st.cards.every(c => { const o = st.cards.find(x => x.i === c.i && x !== c); return o.r !== c.r; }), `${lang} 每對兩張是不同樣子：${st.cards.map(c => c.r).join('')}`);
    if (lang === 'en') ok(st.cards.every(c => c.r !== 'w' || c.t[1] % 30 === 0), `${lang} 英文的文字牌只在整點半點`);
    const sizes = await p.$$eval('#mgrid .mcard', es => es.map(e => e.getBoundingClientRect().width)); ok(Math.min(...sizes) >= 44, `${lang} 牌寬 ${Math.round(Math.min(...sizes))}`);
    if (SHOT) { await p.click('#mgrid .mcard[data-i="0"]'); await p.waitForTimeout(400); await p.screenshot({ path: `${SHOT}/match-${lang}.png` }); await p.click('#mgrid .mcard[data-i="1"]'); await p.waitForTimeout(1200); }
    // 翻錯：找兩張不同對的
    st = await S(); const i0 = st.cards.findIndex(c => !c.done), i1 = st.cards.findIndex((c, i) => i !== i0 && !c.done && c.i !== st.cards[i0].i);
    await p.click(`#mgrid .mcard[data-i="${i0}"]`); await p.click(`#mgrid .mcard[data-i="${i1}"]`); await p.waitForTimeout(200);
    ok((await p.$$('#mgrid .mcard.open')).length === 2, `${lang} 翻開兩張`); await p.waitForTimeout(1000);
    ok((await p.$$('#mgrid .mcard.open')).length === 0, `${lang} 配錯翻回去`);
    // 全部配對：照 i 配
    for (let k = 0; k < 4; k++) { st = await S(); const a = st.cards.findIndex(c => !c.done); const bb = st.cards.findIndex((c, i) => i !== a && !c.done && c.i === st.cards[a].i); await p.click(`#mgrid .mcard[data-i="${a}"]`); await p.click(`#mgrid .mcard[data-i="${bb}"]`); await p.waitForTimeout(250); }
    st = await S(); ok(st.done === 4 && (await p.$$('#mgrid .mcard.done')).length === 8, `${lang} 4 對全配完`);
    await p.waitForTimeout(900); ok(await p.isVisible('#o-mdone'), `${lang} 結算：${await p.textContent('#mdone-p')}`);
    const db = await p.evaluate(() => JSON.parse(localStorage.getItem('tick-town-v1'))); ok(Object.keys(db.facts).some(k => k.startsWith('r:')) && db.best.matches === 1, `${lang} 配對記進讀鐘紀錄、matches=${db.best.matches}`);
    await p.click('#mdone-again'); await p.waitForTimeout(300); ok((await p.$$('#mgrid .mcard.done')).length === 0, `${lang} 再玩一次重新發牌`);
    await p.click('#s-match [data-home]'); ok(await p.isVisible('#s-menu'), `${lang} 回主選單`);
    const sw = await p.evaluate(() => document.documentElement.scrollWidth); ok(sw <= w, `${lang} 不橫捲`);
    ok(errs.length === 0, `${lang} 無錯誤 ${errs.join('|')}`); await p.context().close();
  }
  // 配錯的讀錯分類：指針 2:50 配數字 3:50 → hourLate
  { const p = await b.newPage(); await p.addInitScript(`localStorage.setItem('tick-town-v1', JSON.stringify({ set: { lang: 'zh-Hant', sound: false, level: 2 }, hinted: true }));`); await p.goto('http://localhost:8124/index.html'); await p.waitForTimeout(300);
    let found = false; for (let tries = 0; tries < 60 && !found; tries++) { await p.evaluate(() => window.__tt.Match.start()); const st = await p.evaluate(() => window.__tt.Match.s().cards.map(c => ({ t: c.t, r: c.r }))); const a = st.findIndex(c => c.r === 'a' && c.t[1] >= 35); if (a < 0) continue; const bb = st.findIndex(c => c.r !== 'a' && c.t[0] === st[a].t[0] % 12 + 1 && c.t[1] === st[a].t[1]); if (bb < 0) continue; found = true;
      await p.click(`#mgrid .mcard[data-i="${a}"]`); await p.click(`#mgrid .mcard[data-i="${bb}"]`); await p.waitForTimeout(200);
      ok(await p.isVisible('#match-hint') && /烏龜還沒走到/.test(await p.textContent('#match-hint')), `配指針 ${st[a].t.join(':')} 與 ${st[bb].t.join(':')} → hourLate 提示「${await p.textContent('#match-hint')}」`);
      const e = await p.evaluate(() => JSON.parse(localStorage.getItem('tick-town-v1')).errs); ok(e.hourLate > 0.1, `errs.hourLate=${e.hourLate}`); }
    ok(found, '60 局內出現過容易搞混的一對'); await p.close(); }
  await b.close(); console.log(fails ? `${fails} FAIL` : 'ALL PASS'); process.exit(fails ? 1 : 0);
})();
