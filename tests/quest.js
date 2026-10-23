// 每日任務、家長關卡、清除紀錄
const { chromium } = require('playwright');
let fails = 0; const ok = (c, m) => { console.log((c ? 'PASS ' : 'FAIL ') + m); if (!c) fails++; };
const SHOT = process.argv[2];
const solve = async p => { const q = await p.textContent('#gate-q'); const ans = String(Function('return ' + q.replace(/=/g, '').replace(/×/g, '*').replace(/−/g, '-'))()); for (const d of ans) await p.click(`#gate-keys .key[data-k="${d}"]`); await p.waitForTimeout(150); return ans; };
(async () => {
  const b = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium', args: ['--no-sandbox'] });
  for (const [lang, w, h] of [['zh-Hant', 390, 844], ['en', 320, 568], ['ja', 390, 844]]) {
    const p = await (await b.newContext({ viewport: { width: w, height: h } })).newPage(); const errs = []; p.on('pageerror', e => errs.push(e.message));
    await p.addInitScript(`localStorage.setItem('tick-town-v1', JSON.stringify({ set: { lang: '${lang}', sound: false, level: 2 }, hinted: true, facts: { 'r:7:20': { n: 4, err: 0.05, w: 0, t: 2000 } } }));`);
    await p.goto('http://localhost:8124/index.html'); await p.waitForTimeout(300);
    // 任務
    const db = () => p.evaluate(() => JSON.parse(localStorage.getItem('tick-town-v1')));
    let D = (await db()).daily; ok(D.tasks && D.tasks.length === 3 && new Set(D.tasks.map(t => t.id)).size === 3, `${lang} 今天抽到 3 個不同任務 ${D.tasks && D.tasks.map(t => t.id).join(',')}`);
    ok(/todo/.test(await p.getAttribute('#go-quest', 'class')) && await p.textContent('#q-count') === '0/3', `${lang} chip 0/3 有紅點`);
    await p.click('#go-quest'); await p.waitForTimeout(150); ok(await p.isVisible('#o-quest') && (await p.$$('#quest-list .q')).length === 3, `${lang} 任務卡 3 項：${(await p.textContent('#quest-list')).replace(/\s+/g, ' ').slice(0, 80)}`);
    if (SHOT) await p.screenshot({ path: `${SHOT}/quest-${lang}.png` });
    await p.keyboard.press('Escape'); ok(await p.isHidden('#o-quest'), `${lang} Esc 關任務卡`);
    // 用 Quest.add 推進：讀對 8 題 → 完成 read 任務（若有抽到）
    await p.evaluate(() => { for (let i = 0; i < 8; i++) window.__tt.Quest.add('read'); for (let i = 0; i < 5; i++) window.__tt.Quest.add('set'); window.__tt.Quest.add('day'); window.__tt.Quest.add('match'); window.__tt.Quest.add('vs'); });
    await p.waitForTimeout(200); D = (await db()).daily; const done = D.tasks.filter(t => t.done).length, starQ = D.tasks.find(t => t.id === 'star');
    ok(done === (starQ ? 2 : 3), `${lang} 推進後完成 ${done} 項（${starQ ? '有' : '沒有'}點亮星星任務）`);
    if (starQ) { await p.evaluate(() => { const DB = window.__tt.DB(); for (let i = 1; i <= 3; i++) DB.facts['r:' + i + ':0'] = { n: 4, err: 0, w: 0, t: 1000 }; window.__tt.Quest.add('star'); }); await p.waitForTimeout(200); D = (await db()).daily; }
    ok(D.tasks.every(t => t.done) && D.badges === 1 && D.streak === 1, `${lang} 全完成：徽章 ${D.badges}、連續 ${D.streak}`);
    await p.waitForTimeout(1400); ok(await p.textContent('#q-count') === '✓', `${lang} chip 變 ✓`);
    // 家長關卡：答錯換題、答對才清
    await p.click('#go-set'); await p.click('#set-reset'); await p.waitForTimeout(150);
    ok(await p.isVisible('#o-gate') && /−/.test(await p.textContent('#gate-q')), `${lang} 清除走難的關卡：${await p.textContent('#gate-q')}`);
    const q1 = await p.textContent('#gate-q'); const n = (await p.$$('#gate-a i')).length; for (let i = 0; i < n; i++) await p.click('#gate-keys .key[data-k="1"]'); await p.waitForTimeout(150);
    ok(await p.isVisible('#o-gate') && await p.textContent('#gate-q') !== q1, `${lang} 答錯換一題`);
    ok(Object.keys((await db()).facts).length >= 1, `${lang} 還沒清`);
    await p.click('#gate-cancel'); ok(await p.isHidden('#o-gate'), `${lang} 取消關掉`);
    await p.click('#set-reset'); await p.waitForTimeout(100); await solve(p); await p.waitForTimeout(200);
    const after = await db(); ok(Object.keys(after.facts).length === 0 && after.set.lang === lang && after.daily.badges === 0, `${lang} 清掉了（語言留著）`);
    // 連錯 3 次 → 30 秒
    await p.click('#set-reset'); await p.waitForTimeout(100);
    for (let k = 0; k < 3; k++) { const m = (await p.$$('#gate-a i')).length; for (let i = 0; i < m; i++) await p.click('#gate-keys .key[data-k="9"]'); await p.waitForTimeout(120); }
    ok(await p.isHidden('#o-gate'), `${lang} 連錯 3 次關掉`); await p.click('#set-reset'); await p.waitForTimeout(100); ok(await p.isHidden('#o-gate') && await p.isVisible('#toast'), `${lang} 30 秒內打不開：${await p.textContent('#toast')}`);
    ok(errs.length === 0, `${lang} 無錯誤 ${errs.join('|')}`); await p.context().close();
  }
  await b.close(); console.log(fails ? `${fails} FAIL` : 'ALL PASS'); process.exit(fails ? 1 : 0);
})();
