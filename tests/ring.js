// 鐘面外圈：預設開、兔子指到的數字亮、設定可以關（存檔記得）、提示一格一格亮、把手大小不變、迷你鐘沒有外圈
const { chromium } = require('playwright');
let fails = 0; const ok = (c, m) => { console.log((c ? 'PASS ' : 'FAIL ') + m); if (!c) fails++; };
const SHOT = process.argv[2];
const URL = 'http://localhost:8124/index.html';
(async () => {
  const b = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium', args: ['--no-sandbox'] });
  const open = async (w, h, lang, set = {}) => {
    const p = await (await b.newContext({ viewport: { width: w, height: h }, hasTouch: true })).newPage(); p.errs = []; p.on('pageerror', e => p.errs.push(e.message));
    await p.addInitScript(`if (!sessionStorage.getItem('x')) { sessionStorage.setItem('x', 1); localStorage.setItem('tick-town-v1', ${JSON.stringify(JSON.stringify({ set: Object.assign({ lang, sound: false, level: 2 }, set), hinted: true, tut: true }))}); }`);
    await p.goto(URL); await p.waitForTimeout(400); return p;
  };
  const lit = (p, sel) => p.evaluate(sel => [...document.querySelectorAll(`${sel} .ring-n.on`)].map(e => e.textContent), sel);
  const ringShown = (p, sel) => p.evaluate(sel => { const g = document.querySelector(`${sel} .ring`); return !!g && getComputedStyle(g).display !== 'none'; }, sel);
  const knob = (p, sel) => p.evaluate(sel => Math.round(document.querySelector(`${sel} .minute .knob`).getBoundingClientRect().width), sel);
  const setT = (p, name, h, m) => p.evaluate(([name, h, m]) => { const c = window.__tt[name]; c.set(h, m); if (c.onChange) c.onChange(c.get().tot, false); }, [name, h, m]);

  for (const [lang, w, h] of [['zh-Hant', 390, 844], ['en', 320, 568], ['ja', 1024, 768]]) {
    const tag = `${w}x${h} ${lang}`, p = await open(w, h, lang);
    ok(await ringShown(p, '#clock'), `${tag} 舊存檔（沒有 ring 欄位）預設開外圈`);
    ok(await p.evaluate(() => [...document.querySelectorAll('#clock .ring-n')].map(e => e.textContent).join(',')) === '00,05,10,15,20,25,30,35,40,45,50,55', `${tag} 外圈 00～55`);
    for (const [hh, mm, want] of [[7, 20, '20'], [3, 0, '00'], [9, 45, '45'], [11, 55, '55']]) { await setT(p, 'clock', hh, mm); ok(JSON.stringify(await lit(p, '#clock')) === JSON.stringify([want]), `${tag} ${hh}:${String(mm).padStart(2, '0')} 亮 ${want}`); }
    await p.evaluate(() => window.__tt.clock.setSnap(1)); await setT(p, 'clock', 7, 22); ok((await lit(p, '#clock')).length === 0, `${tag} 7:22（不在 5 的倍數附近）不亮`); await p.evaluate(() => window.__tt.clock.setSnap(5));
    await setT(p, 'clock', 3, 0); const kOn = await knob(p, '#clock');   // 兔子朝上時量（指針斜的時候外框會比較大） ok(kOn >= 56, `${tag} 開外圈時把手 ${kOn}px ≥ 56`);
    // 外圈不超出畫面、不橫捲
    ok(await p.evaluate(() => { const r = document.querySelector('#clock .ring circle').getBoundingClientRect(); return r.left >= -1 && r.right <= innerWidth + 1 && document.documentElement.scrollWidth <= innerWidth + 1; }), `${tag} 外圈在畫面內、不橫捲`);
    // 外圈的數字沒有被兔子的耳朵蓋住（兔子在 12 時，00 的中心不在兔子臉／耳朵的框裡）
    await setT(p, 'clock', 3, 0); ok(await p.evaluate(() => { const n = document.querySelector('#clock .ring-n').getBoundingClientRect(), cy = n.top + n.height / 2; const ears = [...document.querySelectorAll('#clock .minute ellipse')].map(e => e.getBoundingClientRect()); return ears.every(r => cy < r.top); }), `${tag} 兔子在 12 時，00 不被耳朵蓋住`);
    if (SHOT) await p.screenshot({ path: `${SHOT}/ring-${lang}-${w}.png` });
    // 設定關掉
    await p.click('#go-set'); await p.waitForTimeout(150);
    ok(await p.isVisible('.sw[data-set=ring]') && await p.getAttribute('.sw[data-set=ring]', 'aria-pressed') === 'true', `${tag} 設定有「${await p.textContent('[data-t="set.ring"]')}」開`);
    ok(await p.evaluate(() => { const r = document.querySelector('.sw[data-set=ring]').getBoundingClientRect(); return r.height >= 44 && r.width >= 44; }), `${tag} 開關 ≥ 44px`);
    await p.click('.sw[data-set=ring]'); await p.click('#set-close'); await p.waitForTimeout(150);
    ok(!(await ringShown(p, '#clock')) && !(await ringShown(p, '#clock2')) && !(await ringShown(p, '#clock3')) && !(await ringShown(p, '#clockA')), `${tag} 關掉：所有的鐘都沒有外圈`);
    const kOff = await knob(p, '#clock'); ok(Math.abs(kOff - kOn) <= 2, `${tag} 關掉後把手大小不變（${kOn} → ${kOff}）`);
    await p.reload(); await p.waitForTimeout(400);
    ok(!(await ringShown(p, '#clock')) && await p.evaluate(() => window.__tt.DB().set.ring === false), `${tag} 重新打開還是關的`);
    await p.click('#go-set'); await p.click('.sw[data-set=ring]'); await p.click('#set-close'); await p.waitForTimeout(150);
    ok(await ringShown(p, '#clock') && await ringShown(p, '#clock2'), `${tag} 再打開：外圈回來`);
    // 小鎮的一天：撥錯成 minIndex 時，外圈的數字一格一格亮到答案
    await p.click('[data-mode=day]'); await p.waitForTimeout(300); ok(await ringShown(p, '#clock2'), `${tag} 小鎮的一天有外圈`);
    await p.evaluate(() => window.__tt.clock2.countTo(35, 40)); await p.waitForTimeout(450);
    ok(await p.evaluate(() => [...document.querySelectorAll('#clock2 .ring-n.lit')].map(e => e.textContent).join(',')) === '05,10,15,20,25,30,35' && await p.evaluate(() => document.querySelectorAll('#clock2 .cnt').length) === 0, `${tag} 數到 35：外圈 05～35 依序亮（不另外疊字）`);
    await p.evaluate(() => window.__tt.clock2.countStop()); ok(await p.evaluate(() => document.querySelectorAll('#clock2 .ring-n.lit').length) === 0, `${tag} 停止後熄掉`);
    await p.click('[data-home]:visible'); await p.waitForTimeout(200);
    // 配對的迷你鐘沒有外圈
    await p.click('[data-mode=match]'); await p.waitForTimeout(300);
    ok(await p.evaluate(() => [...document.querySelectorAll('#mgrid svg')].every(s => !s.querySelector('.ring') || getComputedStyle(s.querySelector('.ring')).display === 'none')), `${tag} 配對的小鐘沒有外圈`);
    ok(p.errs.length === 0, `${tag} 無錯誤 ${p.errs.join(' | ')}`);
    await p.close();
  }
  // 雙人：外圈開著，把手還是夠大
  { const p = await open(390, 844, 'zh-Hant'); await p.click('[data-mode=versus]'); await p.waitForTimeout(300); const st = await p.$('#o-vs .btn'); if (st) await st.click(); await p.waitForTimeout(400);
    const kn = await p.evaluate(() => Math.min(...[...document.querySelectorAll('#s-versus .knob')].map(k => k.getBoundingClientRect().width))); ok(kn >= 56, `雙人 390x844 把手 ${kn}px`);
    ok(await ringShown(p, '#clockA') && await ringShown(p, '#clockB'), '雙人兩個鐘都有外圈'); await p.close(); }
  // 清除紀錄：外圈回到預設開
  { const p = await open(390, 844, 'zh-Hant', { ring: false }); ok(!(await ringShown(p, '#clock')), '存檔 ring:false → 關');
    await p.click('#go-set'); await p.click('#set-reset'); await p.waitForTimeout(200);
    const q = await p.textContent('#gate-q'); const m = q.match(/(\d+)\s*\+\s*(\d+)\s*×\s*(\d+)\s*[−-]\s*(\d+)\s*×\s*(\d+)/);
    for (const ch of String(+m[1] + m[2] * m[3] - m[4] * m[5])) await p.click(`#gate-keys [data-k="${ch}"]`); await p.waitForTimeout(600);
    ok(await ringShown(p, '#clock') && await p.evaluate(() => window.__tt.DB().set.ring === true), '清除紀錄後外圈回到預設開'); await p.close(); }
  await b.close();
  console.log(fails ? `\n${fails} FAILED` : '\nALL PASS'); process.exit(fails ? 1 : 0);
})();
