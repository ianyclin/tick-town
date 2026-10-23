const { chromium } = require('playwright');
let fails = 0; const ok = (c, m) => { console.log((c ? 'PASS ' : 'FAIL ') + m); if (!c) fails++; };
const SHOT = process.argv[2];
(async () => {
  const b = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium', args: ['--no-sandbox'] });
  for (const [lang, w, h] of [['zh-Hant', 390, 844], ['en', 320, 568], ['ja', 390, 844]]) {
    const p = await (await b.newContext({ viewport: { width: w, height: h } })).newPage(); const errs = []; p.on('pageerror', e => errs.push(e.message));
    await p.addInitScript(`localStorage.setItem('tick-town-v1', JSON.stringify({ set: { lang: '${lang}', sound: false, level: 2 }, hinted: true }));`);
    await p.goto('http://localhost:8124/index.html'); await p.waitForTimeout(300);
    await p.click('#go-set'); await p.click('#go-help'); await p.waitForTimeout(150);
    ok(await p.isVisible('#o-help') && await p.isHidden('#o-set') && (await p.$$('#o-help li')).length >= 18, `${lang} 說明 ${(await p.$$('#o-help li')).length} 條`);
    const raw = await p.evaluate(() => [...document.querySelectorAll('#o-help [data-t], #o-help [data-th], #o-about [data-t]')].filter(e => /^[a-z]+\.[a-zA-Z]+$/.test(e.textContent.trim())).map(e => e.textContent)); ok(raw.length === 0, `${lang} 沒有露出 key ${raw.join(',')}`);
    if (SHOT) await p.screenshot({ path: `${SHOT}/help-${lang}.png` });
    await p.click('#help-close'); ok(await p.isHidden('#o-help') && await p.isVisible('#o-set'), `${lang} ✕ 回到設定`);
    await p.click('#go-about'); await p.waitForTimeout(100); ok(await p.isVisible('#o-about') && /gmail/.test(await p.textContent('#o-about')), `${lang} 關於頁`);
    await p.keyboard.press('Escape'); ok(await p.isHidden('#o-about') && await p.isVisible('#o-set'), `${lang} Esc 回到設定`);
    ok(errs.length === 0, `${lang} 無錯誤`); await p.context().close();
  }
  await b.close(); console.log(fails ? `${fails} FAIL` : 'ALL PASS'); process.exit(fails ? 1 : 0);
})();
