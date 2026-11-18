// 小鎮：會長大（玩完幾次多一樣東西、回主選單說一聲）、撥對時動物走出門、減少動態效果時不跑、每個人的小鎮各自長
const { chromium } = require('playwright');
let fails = 0; const ok = (c, m) => { console.log((c ? 'PASS ' : 'FAIL ') + m); if (!c) fails++; };
const URL = 'http://localhost:8124/index.html';
(async () => {
  const b = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium', args: ['--no-sandbox'] });
  const open = async (save, opts = {}) => {
    const p = await (await b.newContext(Object.assign({ viewport: { width: 390, height: 844 } }, opts))).newPage(); p.errs = []; p.on('pageerror', e => p.errs.push(e.message));
    await p.addInitScript(`if (!sessionStorage.x) { sessionStorage.x = 1; localStorage.setItem('tick-town-v1', ${JSON.stringify(JSON.stringify(Object.assign({ set: { lang: 'zh-Hant', sound: false, music: false, level: 2 }, hinted: true, tut: true }, save)))}); }`);
    await p.goto(URL); await p.waitForTimeout(400); return p;
  };
  // 門檻
  { const p = await open({});
    const D = await p.evaluate(() => window.__tt.DECOR.map(d => [d.id, d.at]));
    ok(D.length === 8 && D.every((d, i) => !i || d[1] > D[i - 1][1]), `八樣東西，門檻由小到大：${D.map(d => d.join(':')).join(' ')}`);
    ok(await p.evaluate(() => window.__tt.townPts()) === 0, '新的小鎮 0 分');
    ok(await p.evaluate(() => { const d = window.__tt.DB(); d.best = { days: 2, reads: 1, matches: 1, vs: 1 }; return window.__tt.townPts(); }) === 7, '小鎮的一天 2 分、讀鐘配對雙人各 1 分');
    await p.close(); }
  // 玩完一次小鎮的一天 → 回主選單說「小鎮多了一片花」
  { const p = await open({});
    await p.click('[data-mode=day]'); await p.waitForTimeout(200);
    for (let i = 0; i < 7; i++) { await p.evaluate(() => { const T = window.__tt.Day.target(), c = window.__tt.clock2; c.set(Math.floor(T / 60), T % 60); c.onChange(c.get().tot, false); }); await p.waitForTimeout(300); if (i === 0) ok((await p.evaluate(() => window.__tt.Town.walking())).length === 1, `撥對：${await p.evaluate(() => window.__tt.Town.walking())} 走出門`); await p.waitForTimeout(1400); }   // 撥對 1.5 秒後才換下一件事
    await p.waitForTimeout(400); ok(await p.isVisible('#o-done'), '做完一天');
    await p.click('#done-home'); await p.waitForTimeout(500);
    const t = await p.textContent('#toast'); ok(await p.isVisible('#toast') && /花|大樹/.test(t), `回主選單：「${t}」`);
    ok(await p.evaluate(() => window.__tt.DB().town.seen) === 2, '小鎮的一天 2 分：花和大樹（seen=2）');
    await p.click('[data-mode=day]'); await p.waitForTimeout(150); await p.click('#s-day [data-home]'); await p.waitForTimeout(500);
    ok(!(await p.isVisible('#toast')) || !/多了/.test(await p.textContent('#toast')), '沒有新東西就不說');
    ok(p.errs.length === 0, `無錯誤 ${p.errs.join(' | ')}`); await p.close(); }
  // 減少動態效果：不跑走路動畫
  { const p = await open({}, { reducedMotion: 'reduce' }); await p.click('[data-mode=day]'); await p.waitForTimeout(150);
    await p.evaluate(() => { const T = window.__tt.Day.target(), c = window.__tt.clock2; c.set(Math.floor(T / 60), T % 60); c.onChange(c.get().tot, false); }); await p.waitForTimeout(200);
    ok((await p.evaluate(() => window.__tt.Town.walking())).length === 0, '減少動態效果：動物不走路'); ok(!(await p.evaluate(() => window.__tt.Town.anim())), '減少動態效果：小動畫（呼吸、雲）不跑'); await p.close(); }
  { const p = await open({}); ok(await p.evaluate(() => window.__tt.Town.anim()), '平常：小動畫的迴圈在跑'); const a = await p.evaluate(() => document.querySelector('#town').toDataURL().length); await p.waitForTimeout(700); const b2 = await p.evaluate(() => document.querySelector('#town').toDataURL().length); ok(a !== b2, '過 0.7 秒畫面有在動（動物呼吸、雲在飄）'); ok(p.errs.length === 0, `無錯誤 ${p.errs.join(' | ')}`); await p.close(); }
  // 壞掉的存檔、每個人各自的小鎮
  { const p = await open({ town: 'abc', best: { days: 40 } });
    ok(await p.evaluate(() => { const t = window.__tt.DB().town; return t && typeof t === 'object' && t.seen >= 0; }), '壞掉的 town 欄位會修好');
    await p.click('[data-mode=day]'); await p.waitForTimeout(100); await p.click('#s-day [data-home]'); await p.waitForTimeout(500);
    ok(await p.evaluate(() => window.__tt.DB().town.seen) === 8, `玩很多次的舊存檔：八樣都有（seen=${await p.evaluate(() => window.__tt.DB().town.seen)}）`);
    await p.evaluate(() => { localStorage.setItem('tick-town-who', JSON.stringify({ cur: '', list: [{ id: '', name: 'A' }, { id: 'pb2', name: 'B' }] })); localStorage.setItem('tick-town-v1:pb2', JSON.stringify({ set: { lang: 'zh-Hant', sound: false, music: false }, tut: true, hinted: true })); });
    await p.reload(); await p.waitForTimeout(300); await p.click('#go-who'); await p.click('#who-list button[data-who="pb2"]'); await p.waitForTimeout(300);
    ok(await p.evaluate(() => window.__tt.townPts()) === 0, 'B 的小鎮是新的（每個人各自長）');
    ok(p.errs.length === 0, `無錯誤 ${p.errs.join(' | ')}`); await p.close(); }
  await b.close();
  console.log(fails ? `\n${fails} FAILED` : '\nALL PASS'); process.exit(fails ? 1 : 0);
})();
