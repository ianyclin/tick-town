// 寵物：選蛋、橡果來源、餵食長大、配件門檻
const { chromium } = require('playwright');
let fails = 0; const ok = (c, m) => { console.log((c ? 'PASS ' : 'FAIL ') + m); if (!c) fails++; };
const SHOT = process.argv[2];
(async () => {
  const b = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium', args: ['--no-sandbox'] });
  for (const [lang, w, h] of [['zh-Hant', 390, 844], ['en', 320, 568], ['ja', 820, 1180], ['ko', 320, 568], ['es', 390, 844]]) {
    const p = await (await b.newContext({ viewport: { width: w, height: h } })).newPage(); const errs = []; p.on('pageerror', e => errs.push(e.message));
    await p.addInitScript(`localStorage.setItem('tick-town-v1', JSON.stringify({ set: { lang: '${lang}', sound: false, level: 2 }, hinted: true, daily: { badges: 5 }, pet: { kind: 'bogus', fed: 'x', acorn: 25, wear: { head: 'nope' } } }));`);
    await p.goto('http://localhost:8124/index.html'); await p.waitForTimeout(300);
    const db = () => p.evaluate(() => JSON.parse(localStorage.getItem('tick-town-v1')));
    ok(await p.textContent('#b-acorn') === '25', `${lang} 主選單橡果 25`);
    await p.click('#go-pet'); await p.waitForTimeout(200);
    ok(await p.isVisible('#pet-pick') && (await p.$$('#pet-cards .pet-card')).length === 3, `${lang} 壞存檔的 kind 清掉 → 選蛋，3 顆`);
    if (SHOT) await p.screenshot({ path: `${SHOT}/pet-pick-${lang}.png` });
    await p.click('[data-kind=squirrel]'); await p.waitForTimeout(200);
    ok(await p.isVisible('#o-pname') && /小松|Nutty|リスリス|다래|Nuez/.test(await p.inputValue('#pname-in')) && (await p.$$('#pname-sug button')).length === 4, `${lang} 選了蛋先取名字，預設帶入建議的名字`);
    await p.click('#pname-ok'); await p.waitForTimeout(200);
    ok(await p.isVisible('#pet-show') && /小松|Nutty|リスリス|다래|Nuez/.test(await p.textContent('#pet-name')), `${lang} 選了松鼠：${(await p.textContent('#pet-name')).trim()}`);
    await p.click('#pet-feed'); await p.waitForTimeout(100); let d = await db(); ok(d.pet.fed === 10 && d.pet.acorn === 15, `${lang} 餵一次 fed=10 acorn=15`);
    await p.click('#pet-feed'); await p.waitForTimeout(100); ok(await p.isDisabled('#pet-feed') && /5/.test(await p.textContent('#pet-feed')), `${lang} 橡果不夠按不下：${await p.textContent('#pet-feed')}`);
    await p.evaluate(() => { window.__tt.Pet.earn(100); window.__tt.Pet.render(); }); await p.click('#pet-feed'); await p.waitForTimeout(500);
    d = await db(); ok(d.pet.fed === 30 && /幼體|Baby|あかちゃん|아기|Bebé/.test(await p.textContent('#pet-name')) && await p.isVisible('#toast'), `${lang} 餵到 30 升幼體：${await p.textContent('#toast')}`);
    // 配件：徽章 5 → 蝴蝶結、圍巾、墨鏡可戴，帽子不行
    await p.click('[data-gear=glasses]'); await p.waitForTimeout(100); d = await db(); ok(d.pet.wear.face === 'glasses' && /data-g="glasses"/.test(await p.innerHTML('#pet-stage')), `${lang} 戴墨鏡`);
    await p.click('[data-gear=hat]', { force: true }); await p.waitForTimeout(100); d = await db(); ok(d.pet.wear.head === '' && /1/.test(await p.textContent('#toast')), `${lang} 帽子還差 1 個徽章：${await p.textContent('#toast')}`);
    await p.click('[data-gear=glasses]'); d = await db(); ok(d.pet.wear.face === '', `${lang} 再點脫掉`);
    if (SHOT) { await p.click('[data-gear=bow]'); await p.waitForTimeout(100); await p.screenshot({ path: `${SHOT}/pet-${lang}.png` }); }
    // 橡果來源：讀鐘答對 +1、任務完成 +10
    await p.click('#s-pet [data-home]'); await p.evaluate(() => { for (let i = 0; i < 8; i++) window.__tt.Quest.add('read'); }); await p.waitForTimeout(100); d = await db();
    const hadRead = d.daily.tasks.some(t => t.id === 'read'); ok(d.pet.acorn === (hadRead ? 105 : 95), `${lang} 任務完成橡果 +10（${d.pet.acorn}）`);
    const sw = await p.evaluate(() => document.documentElement.scrollWidth); ok(sw <= w, `${lang} 不橫捲`);
    ok(errs.length === 0, `${lang} 無錯誤 ${errs.join('|')}`); await p.context().close();
  }
  // 取名、改名、韓文助詞、主選單走來走去的寵物、寵物頁置中
  { const p = await (await b.newContext({ viewport: { width: 390, height: 844 } })).newPage(); const errs = []; p.on('pageerror', e => errs.push(e.message));
    await p.addInitScript(`if (!sessionStorage.x) { sessionStorage.x = 1; localStorage.setItem('tick-town-v1', JSON.stringify({ tut: true, hinted: true, set: { lang: 'ko', sound: false, music: false }, pet: { kind: '', acorn: 20 } })); }`);
    await p.goto('http://localhost:8124/index.html'); await p.waitForTimeout(500);
    ok(await p.isHidden('#menu-pet'), '還沒選寵物：主選單沒有寵物');
    await p.click('#go-pet'); await p.click('[data-kind=bear]'); await p.waitForTimeout(150); await p.fill('#pname-in', '  별님   '); await p.click('#pname-ok'); await p.waitForTimeout(200);
    let d = await p.evaluate(() => JSON.parse(localStorage.getItem('tick-town-v1')).pet); ok(d.kind === 'bear' && d.name === '별님', `自己打的名字存起來（前後空白去掉）：${d.name}`);
    ok(/별님이 /.test(await p.textContent('#toast')), `韓文：名字有收尾音時用「이」：${await p.textContent('#toast')}`);
    const c = await p.evaluate(() => { const r = document.querySelector('#pet-stage').getBoundingClientRect(), n = document.querySelector('#pet-name').getBoundingClientRect(); return [Math.abs(r.left + r.width / 2 - innerWidth / 2), Math.abs(n.left + n.width / 2 - innerWidth / 2)]; });
    ok(c[0] < 3 && c[1] < 3, `寵物和名字在畫面正中間（差 ${c.map(Math.round).join('、')}px）`);
    await p.click('#pet-rename'); await p.waitForTimeout(150); ok(await p.inputValue('#pname-in') === '별님', '改名字：帶入現在的名字');
    await p.click('#pname-sug button >> nth=1'); await p.click('#pname-ok'); await p.waitForTimeout(150); d = await p.evaluate(() => JSON.parse(localStorage.getItem('tick-town-v1')).pet);
    ok(d.name === '꿀이' && d.fed === 0 && d.kind === 'bear', `點建議的名字改名，種類和餵食不變：${d.name}`); ok(/꿀이야/.test(await p.textContent('#toast')), `韓文：沒有收尾音用「야」：${await p.textContent('#toast')}`);
    await p.click('#pet-rename'); await p.fill('#pname-in', ''); await p.click('#pname-ok'); await p.waitForTimeout(100); ok((await p.evaluate(() => JSON.parse(localStorage.getItem('tick-town-v1')).pet.name)) === '곰이', '名字清空就用預設的名字');
    await p.click('#s-pet [data-home]'); await p.waitForTimeout(300);
    const mp = await p.evaluate(() => { const m = document.querySelector('#menu-pet'), r = m.getBoundingClientRect(), md = document.querySelector('#modes').getBoundingClientRect(); return { vis: !m.hidden && m.style.visibility !== 'hidden', above: r.bottom <= md.top + 8, size: r.width, img: !!m.querySelector('image[href*="pet-bear-0"]') }; });
    ok(mp.vis && mp.above && mp.size >= 44 && mp.img, `選了寵物：主選單的草地上有牠（${Math.round(mp.size)}px，在模式鈕上面）`);
    await p.click('#menu-pet', { force: true }); await p.waitForTimeout(200); ok(await p.isVisible('#s-pet'), '點主選單的寵物進寵物頁');
    ok(errs.length === 0, `無錯誤 ${errs.join(' | ')}`); await p.close(); }
  // 壞掉的名字
  { const p = await (await b.newContext()).newPage(); await p.addInitScript(`localStorage.setItem('tick-town-v1', JSON.stringify({ tut: true, pet: { kind: 'owl', name: { x: 1 } } }));`); await p.goto('http://localhost:8124/index.html'); await p.waitForTimeout(300);
    ok(await p.evaluate(() => window.__tt.DB().pet.name) === '', '壞掉的名字欄位清成空的'); await p.close(); }
  await b.close(); console.log(fails ? `${fails} FAIL` : 'ALL PASS'); process.exit(fails ? 1 : 0);
})();
