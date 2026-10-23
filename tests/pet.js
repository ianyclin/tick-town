// 寵物：選蛋、橡果來源、餵食長大、配件門檻
const { chromium } = require('playwright');
let fails = 0; const ok = (c, m) => { console.log((c ? 'PASS ' : 'FAIL ') + m); if (!c) fails++; };
const SHOT = process.argv[2];
(async () => {
  const b = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium', args: ['--no-sandbox'] });
  for (const [lang, w, h] of [['zh-Hant', 390, 844], ['en', 320, 568], ['ja', 820, 1180]]) {
    const p = await (await b.newContext({ viewport: { width: w, height: h } })).newPage(); const errs = []; p.on('pageerror', e => errs.push(e.message));
    await p.addInitScript(`localStorage.setItem('tick-town-v1', JSON.stringify({ set: { lang: '${lang}', sound: false, level: 2 }, hinted: true, daily: { badges: 5 }, pet: { kind: 'bogus', fed: 'x', acorn: 25, wear: { head: 'nope' } } }));`);
    await p.goto('http://localhost:8124/index.html'); await p.waitForTimeout(300);
    const db = () => p.evaluate(() => JSON.parse(localStorage.getItem('tick-town-v1')));
    ok(await p.textContent('#b-acorn') === '25', `${lang} 主選單橡果 25`);
    await p.click('#go-pet'); await p.waitForTimeout(200);
    ok(await p.isVisible('#pet-pick') && (await p.$$('#pet-cards .pet-card')).length === 3, `${lang} 壞存檔的 kind 清掉 → 選蛋，3 顆`);
    if (SHOT) await p.screenshot({ path: `${SHOT}/pet-pick-${lang}.png` });
    await p.click('[data-kind=squirrel]'); await p.waitForTimeout(200);
    ok(await p.isVisible('#pet-show') && /小松|Nutty|リスリス/.test(await p.textContent('#pet-name')), `${lang} 選了松鼠：${(await p.textContent('#pet-name')).trim()}`);
    await p.click('#pet-feed'); await p.waitForTimeout(100); let d = await db(); ok(d.pet.fed === 10 && d.pet.acorn === 15, `${lang} 餵一次 fed=10 acorn=15`);
    await p.click('#pet-feed'); await p.waitForTimeout(100); ok(await p.isDisabled('#pet-feed') && /5/.test(await p.textContent('#pet-feed')), `${lang} 橡果不夠按不下：${await p.textContent('#pet-feed')}`);
    await p.evaluate(() => { window.__tt.Pet.earn(100); window.__tt.Pet.render(); }); await p.click('#pet-feed'); await p.waitForTimeout(500);
    d = await db(); ok(d.pet.fed === 30 && /幼體|Baby|あかちゃん/.test(await p.textContent('#pet-name')) && await p.isVisible('#toast'), `${lang} 餵到 30 升幼體：${await p.textContent('#toast')}`);
    // 配件：徽章 5 → 蝴蝶結、圍巾、墨鏡可戴，帽子不行
    await p.click('[data-gear=glasses]'); await p.waitForTimeout(100); d = await db(); ok(d.pet.wear.face === 'glasses' && (await p.innerHTML('#pet-stage')).includes('🕶'), `${lang} 戴墨鏡`);
    await p.click('[data-gear=hat]', { force: true }); await p.waitForTimeout(100); d = await db(); ok(d.pet.wear.head === '' && /1/.test(await p.textContent('#toast')), `${lang} 帽子還差 1 個徽章：${await p.textContent('#toast')}`);
    await p.click('[data-gear=glasses]'); d = await db(); ok(d.pet.wear.face === '', `${lang} 再點脫掉`);
    if (SHOT) { await p.click('[data-gear=bow]'); await p.waitForTimeout(100); await p.screenshot({ path: `${SHOT}/pet-${lang}.png` }); }
    // 橡果來源：讀鐘答對 +1、任務完成 +10
    await p.click('#s-pet [data-home]'); await p.evaluate(() => { for (let i = 0; i < 8; i++) window.__tt.Quest.add('read'); }); await p.waitForTimeout(100); d = await db();
    const hadRead = d.daily.tasks.some(t => t.id === 'read'); ok(d.pet.acorn === (hadRead ? 105 : 95), `${lang} 任務完成橡果 +10（${d.pet.acorn}）`);
    const sw = await p.evaluate(() => document.documentElement.scrollWidth); ok(sw <= w, `${lang} 不橫捲`);
    ok(errs.length === 0, `${lang} 無錯誤 ${errs.join('|')}`); await p.context().close();
  }
  await b.close(); console.log(fails ? `${fails} FAIL` : 'ALL PASS'); process.exit(fails ? 1 : 0);
})();
