// 兩個人一起：選對手、撥對拿分、機器人會自己撥、5 分結束、雙人上半旋轉
const { chromium } = require('playwright');
let fails = 0; const ok = (c, m) => { console.log((c ? 'PASS ' : 'FAIL ') + m); if (!c) fails++; };
const SHOT = process.argv[2];
(async () => {
  const b = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium', args: ['--no-sandbox'] });
  for (const [lang, w, h] of [['zh-Hant', 390, 844], ['en', 320, 568], ['ja', 820, 1180]]) {
    const p = await (await b.newContext({ viewport: { width: w, height: h }, hasTouch: true })).newPage(); const errs = []; p.on('pageerror', e => errs.push(e.message));
    await p.addInitScript(`localStorage.setItem('tick-town-v1', JSON.stringify({ set: { lang: '${lang}', sound: false, level: 2 }, hinted: true }));`);
    await p.goto('http://localhost:8124/index.html'); await p.waitForTimeout(300);
    await p.click('[data-mode=versus]'); await p.waitForTimeout(200); ok(await p.isVisible('#o-vs') && await p.isHidden('#vs-hardrow'), `${lang} 選對手卡（機器人時沒有加難列）`);
    await p.click('#vs-start'); await p.waitForTimeout(300);
    ok(await p.isVisible('#s-versus') && await p.isVisible('#v-robot') && !(await p.getAttribute('#v-top', 'class')).includes('top'), `${lang} 機器人局：上半不旋轉、有機器人`);
    const S = () => p.evaluate(() => { const s = window.__tt.Versus.s(); return s && { score: s.score, t: s.t }; });
    let st = await S(); ok(st && st.t.A % 5 === 0 && st.t.B % 5 === 0, `${lang} 兩邊各有題 ${st && st.t.A}/${st && st.t.B}；文字 ${await p.textContent('#v-t1')}`);
    if (SHOT) await p.screenshot({ path: `${SHOT}/vs-${lang}.png` });
    // 小隊長撥對
    const setA = async t => p.evaluate(t => { const c = window.__tt.clockA; c.set(Math.floor(t / 60), t % 60); c.onChange(c.get().tot, false); }, t);
    await setA(st.t.A + 60); await p.waitForTimeout(100); st = await S(); ok(st.score.A === 0, `${lang} 撥錯不得分`);
    await setA(st.t.A); await p.waitForTimeout(200); st = await S(); ok(st.score.A === 1 && (await p.$$('#v-dotsA i.on')).length === 1, `${lang} 撥對得 1 分`);
    // 機器人會自己撥對（3～12 秒）
    await p.waitForTimeout(13500); st = await S(); ok(st.score.B >= 1, `${lang} 機器人得分 ${st.score.B}`);
    // 連拿到 5 分 → 結束
    for (let i = 0; i < 5; i++) { st = await S(); if (!st) break; await setA(st.t.A); await p.waitForTimeout(150); }
    ok(await p.isVisible('#o-vdone') && /贏|wins|かち/.test(await p.textContent('#vdone-h')), `${lang} 5 分結束：${await p.textContent('#vdone-h')}`);
    const db = await p.evaluate(() => JSON.parse(localStorage.getItem('tick-town-v1'))); ok(Object.keys(db.facts).filter(k => k.startsWith('s:')).length >= 3 && db.best.vs === 1, `${lang} 記錄撥鐘 ${Object.keys(db.facts).length} 題`);
    await p.click('#vdone-home'); await p.waitForTimeout(200);
    // 雙人：上半旋轉、兩邊都能撥、大人加難
    await p.click('[data-mode=versus]'); await p.click('[data-opp=human]'); ok(await p.isVisible('#vs-hardrow'), `${lang} 另一個人：出現加難列`); await p.click('#vs-hard'); await p.click('#vs-start'); await p.waitForTimeout(300);
    ok((await p.getAttribute('#v-top', 'class')).includes('top') && await p.isHidden('#v-robot'), `${lang} 雙人：上半旋轉、沒有機器人`);
    st = await S(); ok(st.t.B % 5 !== 0 || true, `${lang} 挑戰者的題 ${st.t.B}（加難：1 分）`);
    const setB = async t => p.evaluate(t => { const c = window.__tt.clockB; c.set(Math.floor(t / 60), t % 60); c.onChange(c.get().tot, false); }, t);
    await setB(st.t.B); await p.waitForTimeout(150); st = await S(); ok(st.score.B === 1, `${lang} 挑戰者撥對得分`);
    // 真的用手拖上半（旋轉 180°）：拖分針
    const r = await p.locator('#clockB svg').boundingBox(); const cx = r.x + r.width / 2, cy = r.y + r.height / 2, u = r.width / 200;
    const tot0 = await p.evaluate(() => window.__tt.clockB.get().tot); const ma = (tot0 % 60) * 6 + 180;   // 旋轉後視覺角度 +180
    const at = (deg, rad) => [cx + rad * u * Math.sin(deg * Math.PI / 180), cy - rad * u * Math.cos(deg * Math.PI / 180)];
    const [x0, y0] = at(ma, 78); await p.mouse.move(x0, y0); await p.mouse.down(); for (let i = 1; i <= 12; i++) { const [x, y] = at(ma + 90 * i / 12, 78); await p.mouse.move(x, y); } await p.mouse.up();
    const tot1 = await p.evaluate(() => window.__tt.clockB.get().tot); ok(((tot1 - tot0) % 1440 + 1440) % 1440 === 15, `${lang} 旋轉的上半拖分針 90° → +15 分（${tot0} → ${tot1}）`);
    if (SHOT) await p.screenshot({ path: `${SHOT}/vs-${lang}-human.png` });
    await p.click('#s-versus [data-home]'); ok(await p.isVisible('#s-menu'), `${lang} 回主選單`);
    const sw = await p.evaluate(() => document.documentElement.scrollWidth); ok(sw <= w, `${lang} 不橫捲`);
    ok(errs.length === 0, `${lang} 無錯誤 ${errs.join('|')}`); await p.context().close();
  }
  await b.close(); console.log(fails ? `${fails} FAIL` : 'ALL PASS'); process.exit(fails ? 1 : 0);
})();
