// 教學：第一次打開先動手撥三下、選要練什麼；舊存檔不會被擋；設定可以再看一次
const { chromium } = require('playwright');
let fails = 0; const ok = (c, m) => { console.log((c ? 'PASS ' : 'FAIL ') + m); if (!c) fails++; };
const SHOT = process.argv[2];
const URL = 'http://localhost:8124/index.html';
(async () => {
  const b = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium', args: ['--no-sandbox'] });
  const tot = p => p.evaluate(() => window.__tt.clock6.get().tot);
  // 真的用滑鼠拖把手：which = 'm' 兔子／'h' 烏龜，順時針拖到 toDeg（laps 有給就是跑幾圈）
  const drag = async (p, which, toDeg, laps) => {
    const box = await p.locator('#clock6 svg').boundingBox(), cx = box.x + box.width / 2, cy = box.y + box.height / 2, R = box.width * (which === 'm' ? 0.39 : 0.26);
    const from = await p.evaluate(w => { const t = window.__tt.clock6.get().tot; return w === 'm' ? (t % 60) * 6 : ((t / 60) % 12) * 30; }, which);
    const d = laps ? 360 * laps : (((toDeg - from) % 360) + 360) % 360, pt = a => [cx + R * Math.sin(a * Math.PI / 180), cy - R * Math.cos(a * Math.PI / 180)];
    await p.mouse.move(...pt(from)); await p.mouse.down(); for (let i = 1; i <= 40; i++) await p.mouse.move(...pt(from + d * i / 40)); await p.mouse.up();
  };
  const inView = (p, sel) => p.evaluate(sel => { const r = document.querySelector(sel).getBoundingClientRect(); return r.width > 0 && r.top >= -1 && r.left >= -1 && r.bottom <= innerHeight + 1 && r.right <= innerWidth + 1; }, sel);
  const noScroll = p => p.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1);

  for (const [lang, loc, w, h] of [['zh-Hant', 'zh-TW', 390, 844], ['en', 'en-US', 320, 568], ['ja', 'ja-JP', 360, 640], ['ko', 'ko-KR', 320, 568], ['es', 'es-MX', 375, 667], ['zh-Hant', 'zh-TW', 1024, 768], ['en', 'en-US', 1920, 1080], ['ja', 'ja-JP', 768, 1024]]) {
    const tag = `${w}x${h} ${lang}`;
    const p = await (await b.newContext({ viewport: { width: w, height: h }, hasTouch: true, locale: loc })).newPage(); const errs = []; p.on('pageerror', e => errs.push(e.message));
    await p.goto(URL); await p.waitForTimeout(500);
    ok(await p.isVisible('#s-tut') && await p.isHidden('#s-menu'), `${tag} 全新的第一次打開是教學`);
    // 照九九：開場動畫後先問名字（卡片上面有語言），只問這一次；按 ✕ 不取名也可以，接著就是教學
    await p.waitForTimeout(1300); ok(await p.isVisible('#o-who') && await p.isVisible('#who-lang') && (await p.$$('#who-lang button')).length === 5, `${tag} 第一次打開先問名字，上面有五種語言`);
    ok(await p.evaluate(() => { const c = document.querySelector('#o-who .card').getBoundingClientRect(), r = document.querySelector('#who-rename').getBoundingClientRect(); return r.bottom <= Math.min(innerHeight, c.bottom) + 1; }), `${tag} 取名卡不用捲就按得到「我就叫這個名字」`);
    await p.click('#who-close'); await p.waitForTimeout(200); ok(await p.isHidden('#o-who') && await p.evaluate(() => JSON.parse(localStorage.getItem('tick-town-who')).asked === true), `${tag} 關掉取名卡回到教學（記下問過了）`);
    ok(await p.evaluate(() => document.documentElement.lang) === lang, `${tag} 語言跟著裝置`);
    ok(await inView(p, '#clock6 svg') && await inView(p, '#tut-skip') && await inView(p, '#tut-say'), `${tag} 鐘、說明、「我會了」都在畫面內`);
    ok(await p.evaluate(() => { const r = document.querySelector('#tut-skip').getBoundingClientRect(); return r.height >= 44 && r.width >= 44; }), `${tag} 「我會了」≥ 44px`);
    ok(await p.isVisible('#tut-finger') && await p.evaluate(() => document.querySelectorAll('#tut-dots i.on').length) === 1, `${tag} 第 1 步：手指示範、進度 1/4`);
    ok(await tot(p) === 420, `${tag} 從 7:00 開始`);
    if (SHOT) await p.screenshot({ path: `${SHOT}/tut-${lang}-${w}-1.png` });
    // 第 1 步只能拖兔子：碰烏龜不會動，只會提醒
    { const box = await p.locator('#clock6 svg').boundingBox(), a = 210 * Math.PI / 180; await p.mouse.move(box.x + box.width / 2 + box.width * 0.26 * Math.sin(a), box.y + box.height / 2 - box.width * 0.26 * Math.cos(a)); await p.mouse.down(); await p.mouse.move(box.x + box.width / 2 + 60, box.y + box.height / 2); await p.mouse.up(); await p.waitForTimeout(150);
      ok(await tot(p) === 420 && await p.isVisible('#tut-hint'), `${tag} 第 1 步碰烏龜：鐘不動，提醒「${await p.textContent('#tut-hint')}」`); }
    await drag(p, 'm', 0, 0.5); await p.waitForTimeout(300);
    ok(await tot(p) === 450 && await p.evaluate(() => window.__tt.Tut.s().i) === 0, `${tag} 只跑半圈還不算`);
    await drag(p, 'm', 0, 0.5); await p.waitForTimeout(300);
    ok(await p.evaluate(() => document.querySelector('#tut-hint').classList.contains('good')), `${tag} 跑完一圈：「${await p.textContent('#tut-hint')}」`);
    await p.waitForTimeout(2700);
    ok(await p.evaluate(() => window.__tt.Tut.s().i) === 1 && await p.evaluate(() => document.querySelectorAll('#clock6 .mark').length) === 1, `${tag} 第 2 步：圈出 3`);
    ok(await inView(p, '#tut-say'), `${tag} 第 2 步說明在畫面內「${await p.textContent('#tut-say')}」`);
    // 第 2 步撥錯：不說錯，等一下出現虛線
    await drag(p, 'h', 150); await p.waitForTimeout(2100);
    ok(await p.evaluate(() => window.__tt.Tut.s().i) === 1 && await p.evaluate(() => document.querySelectorAll('#clock6 .ghost').length) >= 2, `${tag} 烏龜拖到 5：還在第 2 步，虛線指出 3`);
    await drag(p, 'h', 90); await p.waitForTimeout(300);
    ok(await tot(p) % 720 === 180 && await p.evaluate(() => document.querySelector('#tut-hint').classList.contains('good')), `${tag} 烏龜到 3：「${await p.textContent('#tut-hint')}」`);
    await p.waitForTimeout(2700);
    ok(await p.evaluate(() => window.__tt.Tut.s().i) === 2, `${tag} 第 3 步`);
    if (SHOT) await p.screenshot({ path: `${SHOT}/tut-${lang}-${w}-3.png` });
    await drag(p, 'm', 180); await p.waitForTimeout(300);
    ok(await tot(p) % 720 === 210 && /3/.test(await p.textContent('#tut-hint')), `${tag} 兔子到 6：「${await p.textContent('#tut-hint')}」`);
    ok(await inView(p, '#tut-hint'), `${tag} 稱讚的泡泡在畫面內`);
    await p.waitForTimeout(2700);
    ok(await p.isVisible('#tut-pick') && await p.isHidden('#clock6') && await p.isHidden('#tut-skip'), `${tag} 最後選要練什麼`);
    ok((await p.$$('#tut-pick .pick')).length === 3 && (await p.$$('#tut-pick .pick[aria-pressed=true]')).length === 0, `${tag} 三張卡，第一次不預選`);
    ok(await inView(p, '#tut-pick') && await inView(p, '#tut-note') && await noScroll(p), `${tag} 三張卡與說明都在畫面內、不橫捲`);
    ok(await p.evaluate(() => [...document.querySelectorAll('#tut-pick .pick')].every(e => { const r = e.getBoundingClientRect(); return r.height >= 60 && [...e.querySelectorAll('.pt b,.pt i')].every(t => t.scrollWidth <= t.clientWidth + 1 && t.getBoundingClientRect().right <= r.right); })), `${tag} 卡片文字沒被切掉`);
    if (SHOT) await p.screenshot({ path: `${SHOT}/tut-${lang}-${w}-pick.png` });
    await p.click('.pick[data-level="1"]'); await p.waitForTimeout(300);
    const db = await p.evaluate(() => JSON.parse(localStorage.getItem('tick-town-v1')));
    ok(await p.isVisible('#s-menu') && db.set.level === 1 && db.tut === true, `${tag} 選了就回主選單、存檔 level=1 tut=true`);
    await p.reload(); await p.waitForTimeout(400);
    ok(await p.isVisible('#s-menu') && await p.isHidden('#s-tut'), `${tag} 再打開不會再跳教學`);
    // 設定 → 再看一次
    await p.click('#go-set'); await p.waitForTimeout(150); await p.locator('#go-tut').scrollIntoViewIfNeeded(); ok(await inView(p, '#go-tut'), `${tag} 設定裡有「${await p.textContent('#go-tut')}」`);
    await p.click('#go-tut'); await p.waitForTimeout(300);
    ok(await p.isVisible('#s-tut') && await p.isHidden('#o-set') && await tot(p) === 420, `${tag} 再看一次：從第 1 步開始`);
    await p.click('#tut-skip'); await p.waitForTimeout(200);
    ok(await p.getAttribute('.pick[data-level="1"]', 'aria-pressed') === 'true', `${tag} 再看一次時，現在的等級先亮著`);
    await p.click('.pick[data-level="3"]'); await p.waitForTimeout(300);
    ok(await p.isVisible('#s-menu') && await p.evaluate(() => window.__tt.DB().set.level) === 3, `${tag} 改選「過了多久」`);
    ok(errs.length === 0, `${tag} 無錯誤 ${errs.join(' | ')}`);
    await p.close();
  }
  // 「我會了」直接到選等級；沒選就關掉，下次還是教學
  { const p = await (await b.newContext({ viewport: { width: 390, height: 844 }, locale: 'zh-TW' })).newPage(); await p.addInitScript(`localStorage.setItem('tick-town-who', JSON.stringify({ cur: '', list: [{ id: '', name: '' }], asked: true }));`); await p.goto(URL); await p.waitForTimeout(400);
    await p.click('#tut-skip'); await p.waitForTimeout(200); ok(await p.isVisible('#tut-pick'), '「我會了」直接到選要練什麼');
    await p.reload(); await p.waitForTimeout(400); ok(await p.isVisible('#s-tut'), '還沒選就關掉：下次打開還是教學');
    await p.click('#tut-skip'); await p.click('.pick[data-level="2"]'); await p.waitForTimeout(300); ok(await p.isVisible('#s-menu'), '選了才進主選單');
    await p.close(); }
  // 有教學以前的舊存檔：直接進主選單
  { const p = await b.newPage(); await p.addInitScript(`if (!localStorage.getItem('tick-town-v1')) localStorage.setItem('tick-town-v1', JSON.stringify({ set: { lang: 'zh-Hant', sound: false, level: 3 }, facts: { 's:7:20': { n: 3, w: 1, err: 0.2, t: 0 } } }));`);
    await p.goto(URL); await p.waitForTimeout(400);
    ok(await p.isVisible('#s-menu') && await p.isHidden('#s-tut') && await p.evaluate(() => window.__tt.DB().set.level) === 3, '舊存檔不會被教學擋住，等級不變');
    // 清除紀錄後也不會跳教學（那是大人按的）
    await p.click('#go-set'); await p.click('#set-reset'); await p.waitForTimeout(200);
    const q = await p.textContent('#gate-q'); const m = q.match(/(\d+)\s*\+\s*(\d+)\s*×\s*(\d+)\s*[−-]\s*(\d+)\s*×\s*(\d+)/);
    if (m) { for (const ch of String(+m[1] + m[2] * m[3] - m[4] * m[5])) await p.click(`#gate-keys [data-k="${ch}"]`); await p.waitForTimeout(600);   // 打滿位數自動送出
      ok(await p.isHidden('#s-tut') && await p.evaluate(() => window.__tt.DB().tut === true && Object.keys(window.__tt.DB().facts).length === 0), '清除紀錄後不跳教學'); }
    else ok(false, `家長關卡題目看不懂：${q}`);
    await p.close(); }
  // 減少動態效果：手指不動但看得到
  { const p = await (await b.newContext({ viewport: { width: 390, height: 844 }, reducedMotion: 'reduce' })).newPage(); await p.addInitScript(`localStorage.setItem('tick-town-who', JSON.stringify({ cur: '', list: [{ id: '', name: '' }], asked: true }));`); await p.goto(URL); await p.waitForTimeout(400);
    ok(await p.evaluate(() => getComputedStyle(document.querySelector('#tut-finger')).animationName === 'none' && getComputedStyle(document.querySelector('#tut-finger')).opacity === '1'), '減少動態效果：手指停在把手上');
    await p.close(); }
  await b.close();
  console.log(fails ? `\n${fails} FAILED` : '\nALL PASS'); process.exit(fails ? 1 : 0);
})();
