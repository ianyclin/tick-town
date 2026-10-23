const { chromium } = require('playwright');
let fails = 0; const ok = (c, m) => { console.log((c ? 'PASS ' : 'FAIL ') + m); if (!c) fails++; };
const SHOT = process.argv[2];
(async () => {
  const b = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium', args: ['--no-sandbox'] });
  for (const [lang, level, w, h] of [['zh-Hant', 2, 390, 844], ['en', 1, 320, 568], ['ja', 2, 820, 1180]]) {
    const p = await (await b.newContext({ viewport: { width: w, height: h } })).newPage(); const errs = []; p.on('pageerror', e => errs.push(e.message));
    const facts = {}; facts['r:7:20'] = { n: 4, err: 0.05, w: 0, t: 2000 }; facts['s:19:20'] = { n: 1, err: 0, w: 0, t: 0 }; facts['r:2:50'] = { n: 3, err: 0.6, w: 2, t: 0 }; facts['s:3:30'] = { n: 1, err: 0.3, w: 1, t: 0 }; facts['r:12:0'] = { n: 3, err: 0.1, w: 0, t: 1500 };
    await p.addInitScript(`localStorage.setItem('tick-town-v1', JSON.stringify({ set: { lang: '${lang}', sound: false, level: ${level} }, hinted: true, facts: ${JSON.stringify(facts)}, errs: { hourLate: 0.5 } }));`);
    await p.goto('http://localhost:8124/index.html'); await p.waitForTimeout(300);
    await p.click('#go-map'); await p.waitForTimeout(300);
    ok(await p.isVisible('#s-map'), `${lang} 進入星圖`);
    const cells = await p.$$eval('#map .cell', es => es.length); ok(cells === 144, `${lang} 144 格`);
    const st = await p.evaluate(() => [window.__tt.Map.stateOf(7, 20), window.__tt.Map.stateOf(2, 50), window.__tt.Map.stateOf(3, 30), window.__tt.Map.stateOf(12, 0), window.__tt.Map.stateOf(5, 5)]);
    ok(st.join() === 'star,weak,learn,star,new', `${lang} 狀態 ${st.join()}`);
    const cnt = await p.textContent('#map-count'); ok(level === 1 ? /1\/24/.test(cnt) : /2\/144/.test(cnt), `${lang} 計數 ${cnt}`);
    ok(/hourLate|時針快到|almost at the next|つぎの数字/.test(await p.innerHTML('#map-info')), `${lang} 最常搞混：${(await p.textContent('#map-info')).slice(-40)}`);
    if (SHOT) await p.screenshot({ path: `${SHOT}/map-${lang}.png` });
    await p.click('#map .cell[data-k="10"]'); await p.waitForTimeout(150);
    ok((await p.$$eval('#map-info .hrow span', es => es.map(e => e.className))).join().includes('weak'), `${lang} 點 50 分那片：${await p.textContent('#map-info')}`);
    if (SHOT && lang === 'zh-Hant') await p.screenshot({ path: `${SHOT}/map-${lang}-sel.png` });
    await p.click('#map .cell[data-k="10"]'); await p.waitForTimeout(100); ok(!(await p.innerHTML('#map-info')).includes('hrow'), `${lang} 再點一次取消`);
    const sw = await p.evaluate(() => document.documentElement.scrollWidth); ok(sw <= w, `${lang} 不橫捲`);
    const infoIn = await p.evaluate(() => document.querySelector('#map-info').getBoundingClientRect().bottom <= innerHeight + 1); ok(infoIn, `${lang} 說明框在畫面內`);
    await p.click('#s-map [data-home]'); ok(await p.isVisible('#s-menu'), `${lang} 回主選單`);
    ok(errs.length === 0, `${lang} 無錯誤 ${errs.join('|')}`); await p.context().close();
  }
  await b.close(); console.log(fails ? `${fails} FAIL` : 'ALL PASS'); process.exit(fails ? 1 : 0);
})();
