// 寵物（照九九補齊的部分）：照顧與愛心、摸摸、橡果換徽章、神祕配件、放回家、回家的夥伴、傳說蛋、刪除寵物、存檔消毒
const { chromium } = require('playwright');
let fails = 0; const ok = (c, m) => { console.log((c ? 'PASS ' : 'FAIL ') + m); if (!c) fails++; };
const solve = async p => { const q = await p.textContent('#gate-q'); const ans = String(Function('return ' + q.replace(/=/g, '').replace(/×/g, '*').replace(/−/g, '-'))()); for (const d of ans) await p.click(`#gate-keys .key[data-k="${d}"]`); await p.waitForTimeout(150); return ans; };
const today = () => { const d = new Date(); return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`; };
(async () => {
  const b = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium', args: ['--no-sandbox'] });
  for (const [lang, w, h] of [['zh-Hant', 390, 844], ['en', 320, 568], ['ko', 375, 667]]) {
    const p = await (await b.newContext({ viewport: { width: w, height: h }, reducedMotion: 'reduce' })).newPage(); const errs = []; p.on('pageerror', e => errs.push(e.message));
    const save = { set: { lang, sound: false, music: false, level: 2 }, tut: true, hinted: true, daily: { badges: 39 },
      pet: { kind: 'bear', name: '', fed: 490, acorn: 700, love: 'x', pat: 5, wear: { head: 'crown', back: 'scarf' }, released: [{ kind: 'nope' }, { kind: 'owl', name: 'X'.repeat(30), fed: 120 }, { kind: 'phoenix', fed: 500 }], sent: -3 } };
    await p.addInitScript(`if (!sessionStorage.getItem('t')) { sessionStorage.setItem('t', 1); localStorage.setItem('tick-town-v1', ${JSON.stringify(JSON.stringify(save))}); }`);
    await p.goto('http://localhost:8124/index.html'); await p.waitForTimeout(400);
    const db = () => p.evaluate(() => JSON.parse(localStorage.getItem('tick-town-v1')));
    const tick = () => p.waitForTimeout(650);   // 照顧有 0.6 秒的連點保護
    let d = await db();
    ok(d.pet.love === 0 && d.pet.pat === '' && d.pet.sent === 0 && d.pet.wear.back === '' && d.pet.released.length === 1 && d.pet.released[0].name.length === 10, `${lang} 壞存檔消毒（愛心、摸摸、送回家次數、配件位置、夥伴名單；沒有圖的鳳凰不收）`);
    await p.click('#go-pet'); await p.waitForTimeout(200);
    ok(await p.isVisible('#pet-love') && (await p.$$('#pet-love .hearts .ic')).length === 5, `${lang} 愛心：5 顆（還沒有亮）`);
    ok(/39/.test(await p.textContent('.gear-src')), `${lang} 配件區寫出徽章從每日任務來：${(await p.textContent('.gear-src')).trim()}`);
    ok((await p.$$('#pet-gear .mystery')).length === 2, `${lang} 兩個神祕配件（問號）`);
    // 照顧：餅乾 +1、最愛的蜂蜜 ×2
    await p.click('[data-care=cookie]'); await tick(); d = await db(); ok(d.pet.love === 1 && d.pet.acorn === 690, `${lang} 餅乾：愛心 +1、橡果 -10`);
    await p.click('[data-care=honey]'); await tick(); d = await db(); ok(d.pet.love === 5 && d.pet.acorn === 675 && await p.isVisible('#pet-care .favtag'), `${lang} 小熊最愛蜂蜜：愛心 +4（加倍）`);
    await p.click('[data-care=cake]'); await p.click('[data-care=cake]'); await tick(); d = await db(); ok(d.pet.love === 10, `${lang} 連點只算一次（愛心 ${d.pet.love}）`);
    ok(/朋友|Friends|친구/.test(await p.textContent('#pet-love')), `${lang} 10 顆升到第 1 顆愛心：${(await p.textContent('#pet-love')).trim()}`);
    // 摸摸：每天第一次 +1
    await p.click('#pet-stage'); await tick(); await p.click('#pet-stage'); await tick(); d = await db(); ok(d.pet.love === 11 && d.pet.pat === today(), `${lang} 摸摸一天只加一次`);
    // 橡果換徽章：要按兩下、一天一次；換到第 40 個 → 翅膀現身
    await p.click('#badge-buy'); await p.waitForTimeout(700); d = await db(); ok(d.daily.badges === 39 && /再|again|한 번/.test(await p.textContent('#badge-buy')), `${lang} 第一下只變成「再按一次」`);
    await p.click('#badge-buy'); await p.waitForTimeout(300); d = await db(); ok(d.daily.badges === 40 && d.pet.acorn === 335 && d.pet.badgeDay === today(), `${lang} 第二下換到徽章（40）`);
    ok((await p.$$('#pet-gear .mystery')).length === 1 && await p.isVisible('[data-gear=wings]'), `${lang} 徽章 40：翅膀出現、披風還是問號`);
    await p.waitForTimeout(700); await p.click('#badge-buy', { force: true }); await p.waitForTimeout(700); await p.click('#badge-buy', { force: true }); await p.waitForTimeout(300); d = await db(); ok(d.daily.badges === 40, `${lang} 一天只能換一次`);
    await p.click('[data-gear=wings]'); await p.waitForTimeout(100); d = await db(); ok(d.pet.wear.back === 'wings' && /data-g="wings"/.test(await p.innerHTML('#pet-stage')), `${lang} 戴上翅膀（畫在寵物後面）`);
    // 長到究極 → 放回家（確認卡、主要鈕是「再陪我一下」）
    await p.click('#pet-feed'); await p.waitForTimeout(1700); ok(await p.isVisible('#pet-bye') && !(await p.isVisible('#pet-feed')), `${lang} 究極：出現「放回家」鈕`);
    await p.click('#pet-bye'); await p.waitForTimeout(100); ok(await p.isVisible('#o-pbye'), `${lang} 先問要不要回家`);
    await p.click('#pbye-go'); d = await db(); ok(await p.isHidden('#o-pbye') === false && d.pet.kind === 'bear', `${lang} 卡片剛打開就按「回家」不算（防連點）`);
    await p.click('#pbye-stay'); await p.waitForTimeout(100); ok(await p.isHidden('#o-pbye'), `${lang} 「再陪我一下」關掉`);
    await p.click('#pet-bye'); await p.waitForTimeout(900); await p.click('#pbye-go'); await p.waitForTimeout(800); d = await db();
    ok(d.pet.kind === '' && d.pet.sent === 1 && d.pet.released.length === 2 && d.pet.released[1].kind === 'bear' && d.pet.released[1].fed === 500, `${lang} 放回家：記到夥伴名單、sent=1`);
    ok(await p.isVisible('#pet-pick') && await p.isVisible('#pet-alumni') && (await p.$$('#pet-alumni .alum')).length === 2, `${lang} 回到選蛋，下面有回家的夥伴`);
    // 傳說蛋：徽章 40、送回家 1 → 小星龍可以選；獨角獸、鳳凰還沒有圖 → 即將登場
    ok(await p.isVisible('[data-kind=legend]') && (await p.$$('#pet-cards [data-lock]')).length === 2, `${lang} 小星龍解鎖，另外兩隻還鎖著`);
    await p.click('[data-lock=unicorn]', { force: true }); await p.waitForTimeout(100); ok(await p.isVisible('#toast'), `${lang} 點鎖著的：${await p.textContent('#toast')}`);
    await p.click('[data-kind=legend]'); await p.waitForTimeout(100); const max = await p.getAttribute('#pname-in', 'maxlength'); ok(max === (lang === 'en' ? '10' : '6'), `${lang} 名字最多 ${max} 個字`);
    await p.click('#pname-ok'); await p.waitForTimeout(200); d = await db(); ok(d.pet.kind === 'legend' && d.pet.fed === 0 && d.pet.love === 0, `${lang} 養小星龍`);
    // 請夥伴回來：小星龍去休息、熊回來（進度留著）
    await p.click('#pet-alumni .alum[data-i="1"]'); await p.waitForTimeout(100); ok(await p.isVisible('#o-alum') && await p.isVisible('#alum-note'), `${lang} 夥伴卡：說明現在的會先去休息`);
    await p.click('#alum-go'); await p.waitForTimeout(300); d = await db(); ok(d.pet.kind === 'bear' && d.pet.fed === 500 && d.pet.love === 11 && d.pet.released.some(r => r.kind === 'legend'), `${lang} 換回小熊（fed 500、愛心 11），小星龍到名單裡`);
    // 刪除寵物：設定 → 家長區 → 難的家長關卡
    await p.click('#s-pet [data-home]'); await p.click('#go-set'); await p.waitForTimeout(100); ok(await p.isVisible('#go-petdel'), `${lang} 設定有「刪除寵物」`);
    await p.click('#go-petdel'); await p.waitForTimeout(100); ok((await p.$$('#pdel-list .pdel')).length === 3, `${lang} 列出 3 隻（現在的＋2 隻夥伴）`);
    await p.click('#pdel-list [data-i="1"]'); await p.waitForTimeout(100); ok(/−/.test(await p.textContent('#gate-q')), `${lang} 刪除要過難的家長關卡`);
    await solve(p); await p.waitForTimeout(200); d = await db(); ok(d.pet.released.length === 1 && d.pet.kind === 'bear' && d.daily.badges === 40, `${lang} 刪掉一隻夥伴，徽章留著`);
    await p.click('#pdel-list [data-i="0"]'); await solve(p); await p.waitForTimeout(200); d = await db(); ok(d.pet.kind === '' && d.pet.acorn === 325, `${lang} 刪掉現在的寵物，橡果留著`);
    // 每日任務拿到徽章剛好解鎖配件 → 提示
    await p.evaluate(TODAY => { localStorage.setItem('tick-town-v1', JSON.stringify(Object.assign(JSON.parse(localStorage.getItem('tick-town-v1')), { daily: { badges: 49, date: TODAY, tasks: ['read', 'set', 'shop'].map(id => ({ id, n: 2, p: 0, done: false })) } }))); }, today()); await p.reload(); await p.waitForTimeout(400);
    await p.evaluate(() => { for (const id of ['read', 'set', 'shop']) { window.__tt.Quest.add(id); window.__tt.Quest.add(id); } }); await p.waitForTimeout(3200);
    d = await db(); ok(d.daily.badges === 50 && /披風|cape|망토/i.test(await p.textContent('#toast')), `${lang} 每日任務拿到第 50 個徽章就說新配件：${await p.textContent('#toast')}`);
    ok(errs.length === 0, `${lang} 無錯誤 ${errs.join(' | ')}`); await p.context().close();
  }
  await b.close(); console.log(fails ? `${fails} FAIL` : 'ALL PASS'); process.exit(fails ? 1 : 0);
})();
