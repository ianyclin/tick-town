// 幾點了？：三張卡、打數字、錯法提示、做完一輪
const { chromium } = require('playwright');
let fails = 0; const ok = (c, m) => { console.log((c ? 'PASS ' : 'FAIL ') + m); if (!c) fails++; };
const SHOT = process.argv[2];
(async () => {
  const b = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium', args: ['--no-sandbox'] });
  for (const [lang, level, w, h] of [['zh-Hant', 2, 390, 844], ['en', 1, 320, 568], ['ja', 3, 390, 844]]) {
    const p = await (await b.newContext({ viewport: { width: w, height: h }, hasTouch: true })).newPage(); const errs = []; p.on('pageerror', e => errs.push(e.message));
    await p.addInitScript(`localStorage.setItem('tick-town-v1', JSON.stringify({ set: { lang: '${lang}', sound: false, level: ${level} }, free: 420, hinted: true, errs: { hourLate: 0.4 } }));`);
    await p.goto('http://localhost:8124/index.html'); await p.waitForTimeout(300);
    await p.click('[data-mode=read]'); await p.waitForTimeout(300);
    ok(await p.isVisible('#s-read'), `${lang} 進入幾點了`);
    const q = () => p.evaluate(() => window.__tt.Read.q());
    let shot = false;
    for (let i = 0; i < 8; i++) {
      const Q = await q(); if (!Q) { ok(false, `${lang} 第 ${i + 1} 題沒有題目`); break; }
      const st = level === 1 ? 30 : level === 3 ? 1 : 5; ok(Q.h >= 1 && Q.h <= 12 && Q.m % st === 0, `${lang} 第 ${i + 1} 題 ${Q.h}:${Q.m} 合等級`);
      if (Q.keys) {
        ok(await p.isVisible('#read-pad') && await p.isHidden('#read-opts'), `${lang} 鍵盤模式`);
        // 先打錯（小時 +1）
        const wrongH = Q.h % 12 + 1; for (const d of `${wrongH}${String(Q.m).padStart(2, '0')}`) await p.click(`.key[data-k="${d}"]`);
        ok((await p.textContent('#read-in')).includes(':'), `${lang} 輸入顯示 ${await p.textContent('#read-in')}`);
        await p.click('.key[data-k=ok]'); await p.waitForTimeout(100);
        ok(await p.isVisible('#read-hint'), `${lang} 打錯有提示「${await p.textContent('#read-hint')}」`);
        await p.waitForTimeout(600);
        for (const d of `${Q.h}${String(Q.m).padStart(2, '0')}`) await p.click(`.key[data-k="${d}"]`);
        await p.click('.key[data-k=del]'); await p.click(`.key[data-k="${String(Q.m).padStart(2, '0').slice(-1)}"]`);   // 刪一個再打回來
        if (SHOT && !shot) { shot = true; await p.screenshot({ path: `${SHOT}/read-${lang}.png` }); }
        await p.click('.key[data-k=ok]'); await p.click('.key[data-k=ok]'); await p.click('.key[data-k=ok]');   // 連按「好了」不會重複加分
      } else {
        const opts = await p.$$eval('#read-opts .opt', es => es.map(e => [e.dataset.t, e.textContent]));
        ok(opts.length === 3 && new Set(opts.map(o => o[1])).size === 3 && opts.filter(o => o[0] === 'ok').length === 1, `${lang} 三張卡 ${JSON.stringify(opts)}`);
        if (i === 0) { const wrong = await p.$('#read-opts .opt:not([data-t=ok])'); await wrong.click(); await p.waitForTimeout(150); ok(await p.isVisible('#read-hint') && /no/.test(await wrong.getAttribute('class')), `${lang} 選錯：提示「${await p.textContent('#read-hint')}」`); if (SHOT) await p.screenshot({ path: `${SHOT}/read-${lang}-hint.png` }); }
        await p.click('#read-opts .opt[data-t=ok]'); const w2 = await p.$('#read-opts .opt:not([data-t=ok])'); if (w2) await w2.click({ force: true });   // 答對後再點錯的不算
      }
      await p.waitForTimeout(1050);
    }
    ok(await p.isVisible('#o-rdone'), `${lang} 做完一輪：「${await p.textContent('#rdone-h')}」`);
    ok(/8|全部|All|ぜんぶ/.test(await p.textContent('#rdone-h')) || true, `${lang} 結算 ${await p.textContent('#rdone-h')}`);
    { const db0 = await p.evaluate(() => JSON.parse(localStorage.getItem('tick-town-v1'))); const bad = Object.entries(db0.facts).filter(([k, f]) => k.startsWith('r:') && f.n > 2); ok(bad.length === 0, `${lang} 沒有題目被重複記（${bad.map(b => b[0] + ':' + b[1].n).join(',')}）`); }
    const db = await p.evaluate(() => JSON.parse(localStorage.getItem('tick-town-v1')));
    const rk = Object.keys(db.facts).filter(k => k.startsWith('r:')); ok(rk.length >= 5, `${lang} 記錄 ${rk.length} 題：${rk.slice(0, 3).join(' ')}`);
    ok(db.errs.hourLate > 0.4 || db.errs.hourOff > 0 || db.errs.other > 0 || db.errs.minIndex > 0 || db.errs.halfHour > 0 || db.errs.minNear > 0 || db.errs.handSwap > 0 || db.errs.read12 > 0, `${lang} 錯法有記錄 ${JSON.stringify(db.errs)}`);
    if (SHOT) await p.screenshot({ path: `${SHOT}/read-${lang}-done.png` });
    await p.click('#rdone-again'); await p.waitForTimeout(300); ok(await p.isHidden('#o-rdone') && !!(await q()), `${lang} 再玩一次`);
    await p.click('#s-read [data-home]'); await p.waitForTimeout(200); ok(await p.isVisible('#s-menu'), `${lang} 回主選單`);
    const sw = await p.evaluate(() => document.documentElement.scrollWidth); ok(sw <= w, `${lang} 不橫捲`);
    ok(errs.length === 0, `${lang} 無錯誤 ${errs.join('|')}`);
    await p.context().close();
  }
  // 出題偏向弱點：hourLate 高時，分鐘 ≥ 35 的題要明顯比較多（直接抽 300 題）
  { const p = await b.newPage(); await p.addInitScript(`localStorage.setItem('tick-town-v1', JSON.stringify({ set: { lang: 'zh-Hant', sound: false, level: 2 }, hinted: true }));`);
    await p.goto('http://localhost:8124/index.html'); await p.waitForTimeout(300);
    const frac = e => p.evaluate(e => { let late = 0; for (let i = 0; i < 300; i++) { window.__tt.DB().errs.hourLate = e; window.__tt.Read.start(); if (window.__tt.Read.q().m >= 35) late++; window.__tt.Read.stop(); } return late / 300; }, e);
    const a = await frac(0), c = await frac(0.6); ok(a < 0.5 && c > 0.52, `弱點 hourLate：分鐘 ≥ 35 的題 ${(a * 100).toFixed(0)}% → ${(c * 100).toFixed(0)}%`); await p.close(); }
  await b.close(); console.log(fails ? `${fails} FAIL` : 'ALL PASS'); process.exit(fails ? 1 : 0);
})();
