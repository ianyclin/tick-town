// 小鎮的一天：出題、撥對亮燈、撥錯的提示與錯誤類型、做完一天
const { chromium } = require('playwright');
let fails = 0; const ok = (c, m) => { console.log((c ? 'PASS ' : 'FAIL ') + m); if (!c) fails++; };
const SHOT = process.argv[2];
(async () => {
  const b = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium', args: ['--no-sandbox'] });
  // 錯誤分類
  { const p = await b.newPage(); await p.goto('http://localhost:8124/index.html'); await p.waitForTimeout(300);
    const cs = (T, A) => p.evaluate(([T, A]) => window.__tt.classifySet(T, A), [T, A]);
    ok(await cs(7 * 60 + 50, 8 * 60 + 50) === 'hourLate', '7:50 撥成 8:50 → hourLate');
    ok(await cs(3 * 60 + 30, 4 * 60 + 30) === 'halfHour', '3:30 撥成 4:30 → halfHour');
    ok(await cs(7 * 60 + 20, 7 * 60 + 10) === 'minIndex', '7:20 兔子放在 2 → minIndex');
    ok(await cs(7 * 60 + 45, 7 * 60 + 20) === 'minIndex', '7:45 兔子放在 4 → minIndex');
    ok(await cs(7 * 60 + 20, 4 * 60 + 35) === 'handSwap', '7:20 兩針對調 → handSwap');
    ok(await cs(7 * 60 + 20, 7 * 60 + 25) === 'minNear', '7:20 撥成 7:25 → minNear');
    ok(await cs(7 * 60 + 20, 9 * 60 + 20) === 'hourOff', '7:20 撥成 9:20 → hourOff');
    ok(await cs(7 * 60 + 20, 2 * 60 + 5) === 'other', '亂撥 → other');
    await p.close(); }
  // 出題偏向弱點：某種錯法的權重高，會誘發那種錯的時刻要明顯變多
  { const rate = async (level, errs, facts, f) => { const p = await b.newPage(); await p.addInitScript(`localStorage.setItem('tick-town-v1', ${JSON.stringify(JSON.stringify({ set: { lang: 'zh-Hant', sound: false, level }, errs, facts, hinted: true }))});`); await p.goto('http://localhost:8124/index.html'); await p.waitForTimeout(200);
      const r = await p.evaluate(f => { const fn = new Function('k', 'return ' + f); let hit = 0, n = 0, bad = 0; for (let i = 0; i < 300; i++) { const d = window.__tt.Day.makeDay(); if (d.length !== 7 || d.some((k, j) => j && k.t <= d[j - 1].t)) bad++; for (const k of d) { n++; if (fn(k)) hit++; } } return [hit / n, bad]; }, f); await p.close(); return r; };
    const late = 'k.t % 60 >= 35', half = 'k.t % 60 === 30', idx = 'k.t % 30 !== 0', cross = 'k.from !== undefined && k.from % 60 + k.d > 60', el = 'k.from !== undefined';
    const [l0, bad0] = await rate(2, {}, {}, late), [l1, bad1] = await rate(2, { hourLate: 0.8 }, {}, late);
    ok(bad0 === 0 && bad1 === 0, '每天 7 件事、時刻一件比一件晚');
    ok(l1 > l0 + 0.12, `hourLate 弱 → 35 分以後的時刻變多（${l0.toFixed(2)} → ${l1.toFixed(2)}）`);
    const [h0] = await rate(2, {}, {}, half), [h1] = await rate(2, { halfHour: 0.8 }, {}, half); ok(h1 > h0 * 1.8, `halfHour 弱 → 半點變多（${h0.toFixed(2)} → ${h1.toFixed(2)}）`);
    const [i0] = await rate(1, {}, {}, idx), [i1] = await rate(1, { minIndex: 0.9, hourLate: 0.9 }, {}, idx); ok(i0 === 0 && i1 === 0, '等級 1 不管弱點是什麼都只出整點、半點');
    const [f0] = await rate(2, {}, {}, 'k.t === 430'), [f1] = await rate(2, {}, { 's:7:10': { n: 3, w: 2, err: 0.6, t: 0 } }, 'k.t === 430'); ok(f1 > f0 * 2, `錯過的 7:10 比較常出（${f0.toFixed(3)} → ${f1.toFixed(3)}）`);
    const [c0] = await rate(3, {}, {}, cross), [c1] = await rate(3, { carry: 0.8 }, {}, cross), [e3] = await rate(3, {}, {}, el); ok(c1 > c0 + 0.03 && Math.abs(e3 - 2 / 7) < 0.001, `carry 弱 → 跨整點的「走了幾分鐘」變多（${c0.toFixed(2)} → ${c1.toFixed(2)}），等級 3 每天兩題`);
  }
  for (const [lang, level, w, h] of [['zh-Hant', 2, 390, 844], ['en', 1, 320, 568], ['ja', 3, 390, 844]]) {
    const p = await (await b.newContext({ viewport: { width: w, height: h }, hasTouch: true })).newPage(); const errs = []; p.on('pageerror', e => errs.push(e.message));
    await p.addInitScript(`localStorage.setItem('tick-town-v1', JSON.stringify({ set: { lang: '${lang}', sound: false, level: ${level} }, free: 420, hinted: true }));`);
    await p.goto('http://localhost:8124/index.html'); await p.waitForTimeout(300);
    await p.click('[data-mode=day]'); await p.waitForTimeout(300);
    ok(await p.isVisible('#s-day') && await p.isHidden('#s-menu'), `${lang} 進入小鎮的一天`);
    const say = await p.textContent('#day-say'), target = await p.textContent('#day-target'); ok(say.length > 5 && /\d/.test(target), `${lang} 題目「${say}」目標 ${target}`);
    if (SHOT) await p.screenshot({ path: `${SHOT}/day-${lang}.png` });
    // 用內部狀態取得目標：從 Town 的時間（Town.set(k.t)）讀不到，改從存檔／DOM 推：target 文字 h:mm + ampm → 直接撥 clock2 並觸發 onChange
    const parse = await p.evaluate(() => { const t = document.querySelector('#day-target').textContent; const m = t.match(/(\d+):(\d+)/); return m ? [+m[1], +m[2], /下午|PM|ごご/.test(t) ? 'pm' : 'am', t] : null; });
    ok(parse, `${lang} 目標可解析 ${JSON.stringify(parse)}`);
    const setAns = async (hh, mm) => { await p.evaluate(([hh, mm]) => { const c = window.__tt.clock2; c.set(hh, mm); c.onChange(c.get().tot, true); c.onChange(c.get().tot, false); }, [hh, mm]); };
    const toTot = ([hh, mm, ap]) => ((ap === 'pm' && hh !== 12 ? hh + 12 : (ap === 'am' && hh === 12 ? 0 : hh)) * 60 + mm);
    if (parse && !/\+/.test(parse[3])) {
      const T = toTot(parse), wrong = (T + 60) % 1440;   // 撥成下一個小時
      await setAns(Math.floor(wrong / 60), wrong % 60); await p.waitForTimeout(2300);
      ok(await p.isVisible('#day-hint'), `${lang} 撥錯 2 秒後出現提示「${await p.textContent('#day-hint')}」`);
      ok(await p.evaluate(() => document.querySelectorAll('#clock2 .ghost').length >= 2), `${lang} 虛線指針出現`);
      if (SHOT) await p.screenshot({ path: `${SHOT}/day-${lang}-hint.png` });
      const errsAfter = await p.evaluate(() => JSON.parse(localStorage.getItem('tick-town-v1')).errs); const top = Object.entries(errsAfter).sort((a, b) => b[1] - a[1])[0]; ok(top && top[1] > 0, `${lang} 錯誤類型有記錄：${JSON.stringify(errsAfter)}`);
      await setAns(Math.floor(T / 60), T % 60); await p.waitForTimeout(300);
      ok(/1\/7/.test(await p.textContent('#day-lights')), `${lang} 撥對亮 1 盞燈：${await p.textContent('#day-lights')}`);
      await setAns(Math.floor(T / 60), T % 60); await p.waitForTimeout(200); ok(/1\/7/.test(await p.textContent('#day-lights')), `${lang} 撥對後再放一次手不會多亮一盞`);
      const f1 = await p.evaluate(() => JSON.parse(localStorage.getItem('tick-town-v1')).facts); const fk = Object.keys(f1)[0]; ok(f1[fk].n === 1 && f1[fk].w === 1, `${lang} 錯一次再撥對只記一筆錯（${fk}: n=${f1[fk].n} w=${f1[fk].w}）`);
      ok(await p.evaluate(() => document.querySelectorAll('#clock2 .ghost').length === 0), `${lang} 虛線消失`);
      ok(await p.textContent('#day-hint') !== '' && /good/.test(await p.getAttribute('#day-hint', 'class')), `${lang} 成功語「${await p.textContent('#day-hint')}」`);
      await p.waitForTimeout(1600);
      ok(await p.textContent('#day-say') !== say, `${lang} 換下一題「${await p.textContent('#day-say')}」`);
    }
    // 把剩下的全部撥對 → 完成一天
    for (let i = 0; i < 7; i++) {
      if (await p.isVisible('#o-done')) break;
      const T = await p.evaluate(() => window.__tt.Day.target());
      await setAns(Math.floor(T / 60) % 24, T % 60); await p.waitForTimeout(1700);
    }
    ok(await p.isVisible('#o-done'), `${lang} 做完一天出現結算：「${await p.textContent('#o-done h3')}」`);
    if (SHOT) await p.screenshot({ path: `${SHOT}/day-${lang}-done.png` });
    const db = await p.evaluate(() => JSON.parse(localStorage.getItem('tick-town-v1'))); ok(Object.keys(db.facts).length >= 6 && db.best.days === 1, `${lang} 紀錄 ${Object.keys(db.facts).length} 題、days=${db.best.days}`);
    await p.click('#done-home'); await p.waitForTimeout(200); ok(await p.isVisible('#s-menu'), `${lang} 回主選單`);
    const sw = await p.evaluate(() => document.documentElement.scrollWidth); ok(sw <= w, `${lang} 不橫捲`);
    ok(errs.length === 0, `${lang} 無錯誤 ${errs.join('|')}`);
    await p.context().close();
  }
  await b.close(); console.log(fails ? `${fails} FAIL` : 'ALL PASS'); process.exit(fails ? 1 : 0);
})();
