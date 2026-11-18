// 誰在玩（多人）、刪除玩家、清除紀錄、備份匯出／匯入、獻詞
const { chromium } = require('playwright');
let fails = 0; const ok = (c, m) => { console.log((c ? 'PASS ' : 'FAIL ') + m); if (!c) fails++; };
const URL = 'http://localhost:8124/index.html';
(async () => {
  const b = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium', args: ['--no-sandbox'] });
  const solve = async p => { const q = await p.textContent('#gate-q'); const m = q.match(/(\d+)\s*\+\s*(\d+)\s*×\s*(\d+)(?:\s*[−-]\s*(\d+)\s*×\s*(\d+))?/); const v = +m[1] + m[2] * m[3] - (m[4] ? m[4] * m[5] : 0); for (const ch of String(v)) await p.click(`#gate-keys [data-k="${ch}"]`); await p.waitForTimeout(400); };
  const db = p => p.evaluate(() => window.__tt.DB());
  const who = p => p.evaluate(() => window.__tt.WHO());
  const vis = (p, sel) => p.evaluate(sel => { const e = document.querySelector(sel); if (!e || e.hidden) return false; const r = e.getBoundingClientRect(); return r.width > 0 && r.height > 0; }, sel);
  const pickLevel = async (p, l) => { await p.waitForSelector('#s-tut:not([hidden])'); await p.click('#tut-skip'); await p.click(`.pick[data-level="${l}"]`); await p.waitForTimeout(250); };
  const nameIt = async (p, name) => { await p.fill('#who-in', name); await p.click('#who-rename'); await p.waitForTimeout(150); };
  const addIt = async (p, name) => { await p.fill('#who-in', name); await p.click('#who-add'); await p.waitForTimeout(300); };

  for (const [lang, w, h] of [['zh-Hant', 390, 844], ['en', 320, 568], ['ko', 360, 640]]) {
    const tag = `${w}x${h} ${lang}`;
    const p = await (await b.newContext({ viewport: { width: w, height: h } })).newPage(); p.errs = []; p.on('pageerror', e => p.errs.push(e.message));
    // 舊存檔（有紀錄、沒有 tick-town-who）：變成第一個人
    await p.addInitScript(`if (!sessionStorage.x) { sessionStorage.x = 1; localStorage.clear(); localStorage.setItem('tick-town-v1', JSON.stringify({ set: { lang: '${lang}', sound: false, music: false, level: 3 }, facts: { 's:7:20': { n: 3, w: 1, err: 0.2, t: 0 } }, hinted: true, pet: { kind: 'owl', fed: 40, acorn: 7 } })); }`);
    await p.goto(URL); await p.waitForTimeout(400);
    ok(await vis(p, '#s-menu') && !(await vis(p, '#go-who')), `${tag} 舊存檔直接進主選單；一個人、沒名字時主選單不多一顆名字鈕`);
    ok((await db(p)).facts['s:7:20'] && (await db(p)).set.level === 3, `${tag} 舊紀錄還在`);
    // 設定 → 誰在玩 → 取名
    await p.click('#go-set'); await p.waitForTimeout(100);
    ok(await vis(p, '#set-who') && /:|：/.test(await p.textContent('#set-whoD')), `${tag} 設定有「${await p.textContent('[data-t="set.who"]')}」${await p.textContent('#set-whoD')}`);
    ok(await p.isHidden('#set-del') && !(await p.textContent('#set-resetP')).includes('{'), `${tag} 一個人、沒名字：不給刪除玩家，清除寫「${await p.textContent('#set-resetP')}」`);
    await p.click('#set-who'); await p.waitForTimeout(100);
    ok(await vis(p, '#o-who') && !(await vis(p, '#who-add')) && await vis(p, '#who-hint'), `${tag} 還沒名字：先取名（「新增」先不給）`);
    ok((await p.$$('#who-sug button')).length === 4, `${tag} 有 4 個名字可以直接點`);
    await p.click('#who-sug button'); const sug = await p.inputValue('#who-in'); await p.click('#who-rename'); await p.waitForTimeout(150);
    ok((await who(p)).list[0].name === sug && await p.isHidden('#o-who'), `${tag} 點「${sug}」取名，視窗關掉`);
    ok(await vis(p, '#go-who'), `${tag} 有名字以後主選單出現名字鈕`);
    ok(await p.evaluate(() => { const r = [...document.querySelectorAll('#s-menu .top button:not([hidden])')].map(e => e.getBoundingClientRect()); return r.every(x => x.right <= innerWidth + 1 && x.left >= -1 && x.height >= 44); }), `${tag} 上排的鈕都在畫面內、≥ 44px`);
    ok(await p.evaluate(() => { const e = document.querySelector('h1'); return e.style.visibility === 'hidden' || e.scrollWidth <= e.clientWidth + 1; }), `${tag} 標題放得下，放不下就藏起來（不會被切一半）`);
    // 新增第二個人：先玩教學、選等級；紀錄分開
    await p.click('#go-who'); await p.waitForTimeout(100); ok(await vis(p, '#who-add'), `${tag} 有名字以後可以新增`);
    await addIt(p, sug); ok(await vis(p, '#toast') && (await who(p)).list.length === 1, `${tag} 同名不行：「${await p.textContent('#toast')}」`);
    await addIt(p, 'Kid2');
    ok((await who(p)).list.length === 2 && (await who(p)).list[1].name === 'Kid2', `${tag} 新增 Kid2`);
    ok(await vis(p, '#s-tut'), `${tag} 新的人先玩教學`);
    ok(await p.evaluate(() => document.documentElement.lang) === lang, `${tag} 新的人沿用語言`);
    await pickLevel(p, 1);
    let d = await db(p); ok(Object.keys(d.facts).length === 0 && d.set.level === 1 && d.pet.acorn === 0 && d.tut === true, `${tag} Kid2 的紀錄是空的、等級 1、沒有橡果`);
    ok((await p.textContent('#who-nm')) === 'Kid2', `${tag} 名字鈕寫 Kid2`);
    // 換回第一個人
    await p.click('#go-who'); await p.waitForTimeout(100); ok((await p.$$('#who-list button')).length === 2, `${tag} 名單兩個人`);
    await p.click('#who-list button[data-who=""]'); await p.waitForTimeout(250);
    d = await db(p); ok(d.facts['s:7:20'] && d.set.level === 3 && d.pet.acorn === 7, `${tag} 換回第一個人：紀錄、等級 3、橡果 7 都在`);
    ok(await vis(p, '#toast') && (await p.textContent('#toast')).includes(sug), `${tag} 換人提示「${await p.textContent('#toast')}」`);
    ok(await p.evaluate(() => localStorage.getItem('tick-town-who') !== null && Object.keys(localStorage).some(k => k.startsWith('tick-town-v1:p'))), `${tag} 每個人各存一份`);
    // 最多 4 人
    await p.click('#go-who'); await addIt(p, 'Kid3'); await pickLevel(p, 2); await p.click('#go-who'); await addIt(p, 'Kid4'); await pickLevel(p, 2);
    await p.click('#go-who'); await p.waitForTimeout(100);
    ok((await who(p)).list.length === 4 && !(await vis(p, '#who-add')) && /4/.test(await p.textContent('#who-hint')), `${tag} 4 個人就不能再加：「${await p.textContent('#who-hint')}」`);
    await p.keyboard.press('Escape'); ok(await p.isHidden('#o-who'), `${tag} Esc 關掉`);
    // 清除紀錄：只清目前這個人（Kid4），名字留著
    await p.click('#go-set'); await p.waitForTimeout(100);
    ok((await p.textContent('#o-set h3')).includes('Kid4') && (await p.textContent('#set-resetP')).includes('Kid4'), `${tag} 設定標題、清除的說明都寫 Kid4`);
    await p.evaluate(() => { window.__tt.DB().facts['r:3:0'] = { n: 1, w: 0, err: 0, t: 0 }; });
    await p.locator('#set-reset').scrollIntoViewIfNeeded(); await p.click('#set-reset'); await p.waitForTimeout(100); await solve(p);
    ok(Object.keys((await db(p)).facts).length === 0 && (await who(p)).list.length === 4 && (await p.textContent('#who-nm')) === 'Kid4', `${tag} 清除紀錄：只清 Kid4，名字和其他人還在`);
    // 刪除玩家（清完紀錄設定頁還開著）
    if (await vis(p, '#o-set')) await p.click('#set-close');
    await p.click('#go-set'); await p.locator('#set-del').scrollIntoViewIfNeeded(); await p.click('#set-del'); await p.waitForTimeout(100);
    ok(await vis(p, '#o-gate') && /−/.test(await p.textContent('#gate-q')), `${tag} 刪除玩家走難的家長關卡`);
    await solve(p);
    ok((await who(p)).list.length === 3 && !(await who(p)).list.some(x => x.name === 'Kid4') && await p.evaluate(() => !Object.keys(localStorage).some(k => k.startsWith('tick-town-v1:') && !window.__tt.WHO().list.some(x => k === window.__tt.keyFor(x.id)))), `${tag} 刪掉 Kid4，存檔也刪了`);
    ok((await db(p)).facts['s:7:20'], `${tag} 回到第一個人`);
    // 關於頁的獻詞
    await p.click('#go-set'); await p.locator('#go-about').scrollIntoViewIfNeeded(); await p.click('#go-about'); await p.waitForTimeout(100);
    const ded = (await p.textContent('.about-ded')).trim(); ok(ded.length > 8, `${tag} 關於頁有獻詞「${ded}」`);
    await p.click('#about-close');
    ok(p.errs.length === 0, `${tag} 無錯誤 ${p.errs.join(' | ')}`);
    await p.close();
  }

  // 備份：A 裝置匯出備份碼 → B 裝置匯入（家長關卡）→ 一樣的人、一樣的紀錄
  { const A = await (await b.newContext({ viewport: { width: 390, height: 844 }, permissions: ['clipboard-read', 'clipboard-write'] })).newPage(); A.errs = []; A.on('pageerror', e => A.errs.push(e.message));
    await A.addInitScript(`if (!sessionStorage.x) { sessionStorage.x = 1; localStorage.setItem('tick-town-v1', JSON.stringify({ set: { lang: 'zh-Hant', sound: false, music: false, level: 2 }, facts: { 'r:2:50': { n: 2, w: 1, err: 0.3, t: 0 } }, hinted: true, tut: true, pet: { kind: 'bear', fed: 120, acorn: 3 } })); }`);
    await A.goto(URL); await A.waitForTimeout(300);
    await A.click('#go-set'); await A.click('#set-who'); await nameIt(A, '小明'); await A.click('#go-who'); await addIt(A, '小美'); await pickLevel(A, 1);
    await A.evaluate(() => { window.__tt.DB().facts['s:8:30'] = { n: 1, w: 0, err: 0, t: 0 }; });
    await A.click('#go-set'); await A.locator('#go-backup').scrollIntoViewIfNeeded(); await A.click('#go-backup'); await A.waitForTimeout(100);
    ok(await vis(A, '#o-bk') && await A.isHidden('#o-gate'), '匯出不用家長關卡');
    await A.click('#bk-copy'); await A.waitForTimeout(200);
    const code = await A.inputValue('#bk-out'); ok(/^TTWN1:[A-Za-z0-9+/=]+$/.test(code) && await vis(A, '#bk-msg'), `備份碼 ${code.length} 字：「${await A.textContent('#bk-msg')}」`);
    const parsed = await A.evaluate(c => window.__tt.bkParse('隨便貼的字 ' + c + ' 後面也有字'), code);
    ok(parsed && parsed.who.list.map(x => x.name).join() === '小明,小美', '備份碼前後多貼了字也讀得懂');
    // 檔案
    const [dl] = await Promise.all([A.waitForEvent('download'), A.click('#bk-file')]); ok(/^tick-town-backup-\d{4}-\d\d-\d\d\.json$/.test(dl.suggestedFilename()), `存成備份檔 ${dl.suggestedFilename()}`);
    const filePath = await dl.path();
    await A.click('#bk-close'); ok(await vis(A, '#o-set'), '關掉備份回到設定');
    const B = await (await b.newContext({ viewport: { width: 360, height: 640 } })).newPage(); B.errs = []; B.on('pageerror', e => B.errs.push(e.message));
    await B.addInitScript(`if (!sessionStorage.y) { sessionStorage.y = 1; localStorage.setItem('tick-town-v1', JSON.stringify({ set: { lang: 'zh-Hant', sound: false, music: false, level: 3 }, facts: { 'r:9:9': { n: 1, w: 0, err: 0, t: 0 } }, hinted: true, tut: true })); }`);
    await B.goto(URL); await B.waitForTimeout(300);
    await B.click('#go-set'); await B.locator('#go-backup').scrollIntoViewIfNeeded(); await B.click('#go-backup');
    await B.fill('#bk-in', 'TTWN1:亂打的'); await B.click('#bk-paste'); await B.waitForTimeout(100);
    ok(await B.evaluate(() => document.querySelector('#bk-msg').classList.contains('bad')) && await B.isHidden('#bk-confirm'), `看不懂的備份碼：「${await B.textContent('#bk-msg')}」`);
    await B.fill('#bk-in', code); await B.click('#bk-paste'); await B.waitForTimeout(100);
    ok(await vis(B, '#bk-confirm') && (await B.textContent('#bk-msg')).includes('小明'), `讀得懂：「${await B.textContent('#bk-msg')}」`);
    await B.click('#bk-yes'); await B.waitForTimeout(100); ok(/−/.test(await B.textContent('#gate-q')), '匯入要過難的家長關卡');
    await solve(B); await B.waitForLoadState('load'); await B.waitForTimeout(700);
    ok((await who(B)).list.map(x => x.name).join() === '小明,小美', 'B 裝置現在有小明、小美');
    let dB = await db(B); ok(dB.facts['s:8:30'] && !dB.facts['r:9:9'] && dB.set.level === 1, 'B 裝置現在是小美的紀錄（原本的紀錄被取代）');
    ok(await vis(B, '#toast') && /匯入完成/.test(await B.textContent('#toast')), `匯入完成提示「${await B.textContent('#toast')}」`);
    await B.click('#go-who'); await B.click('#who-list button[data-who=""]'); await B.waitForTimeout(200);
    dB = await db(B); ok(dB.facts['r:2:50'] && dB.pet.kind === 'bear' && dB.pet.fed === 120, '小明的紀錄、寵物都搬過來了');
    // 匯入檔案
    const C = await (await b.newContext({ viewport: { width: 390, height: 844 } })).newPage();
    await C.addInitScript(`if (!sessionStorage.z) { sessionStorage.z = 1; localStorage.setItem('tick-town-v1', JSON.stringify({ set: { lang: 'en', sound: false, music: false }, hinted: true, tut: true })); }`);
    await C.goto(URL); await C.waitForTimeout(300); await C.click('#go-set'); await C.locator('#go-backup').scrollIntoViewIfNeeded(); await C.click('#go-backup');
    const [fc] = await Promise.all([C.waitForEvent('filechooser'), C.click('#bk-pick')]); await fc.setFiles(filePath); await C.waitForTimeout(300);
    ok(await vis(C, '#bk-confirm') && /2 player/.test(await C.textContent('#bk-msg')), `選備份檔：「${await C.textContent('#bk-msg')}」`);
    await C.click('#bk-no'); ok(await C.isHidden('#bk-confirm'), '取消匯入');
    ok(A.errs.length === 0 && B.errs.length === 0, `備份無錯誤 ${A.errs.concat(B.errs).join(' | ')}`);
  }
  await b.close();
  console.log(fails ? `\n${fails} FAILED` : '\nALL PASS'); process.exit(fails ? 1 : 0);
})();
