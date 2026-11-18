// 家長報告：答題會記到每天的紀錄、報告列出最常搞混的錯法和建議、沒有紀錄時的說明、壞掉的紀錄會修好、只留 28 天、
// 五種語言都放得下、關掉回設定；介紹九九流星隊的卡要過家長關卡才打開
const { chromium } = require('playwright');
let fails = 0; const ok = (c, m) => { console.log((c ? 'PASS ' : 'FAIL ') + m); if (!c) fails++; };
const URL = 'http://localhost:8124/index.html';
const KEY = `(i => { const d = new Date(); d.setDate(d.getDate() - i); return d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0'); })`;
(async () => {
  const b = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium', args: ['--no-sandbox'] });
  const open = async (save, vp = { width: 390, height: 844 }) => {
    const p = await (await b.newContext({ viewport: vp })).newPage(); p.errs = []; p.on('pageerror', e => p.errs.push(e.message));
    await p.addInitScript(`if (!sessionStorage.x) { sessionStorage.x = 1; const key = ${KEY}; localStorage.setItem('tick-town-v1', JSON.stringify((${save})(key))); }`);
    await p.addInitScript(() => { window.open = u => { window.__opened = u; return null; }; });
    await p.goto(URL); await p.waitForTimeout(400); return p;
  };
  const BASE = `{ tut: true, hinted: true, set: { lang: 'zh-Hant', sound: false, music: false, level: 2 } }`;
  // 答題會記到今天的紀錄
  { const p = await open(`key => (${BASE})`);
    const r = await p.evaluate(() => { const T = window.__tt, d0 = new Date(), k = d0.getFullYear() + '-' + String(d0.getMonth() + 1).padStart(2, '0') + '-' + String(d0.getDate()).padStart(2, '0'); T.Read.start(); return k; });
    await p.evaluate(() => { document.querySelector('#s-read [data-home]').click(); });
    // 小鎮的一天：撥錯一次（小時多一）、再撥對
    await p.click('[data-mode=day]'); await p.waitForTimeout(200);
    await p.evaluate(() => { const T = window.__tt.Day.target(), c = window.__tt.clock2, A = (T + 60) % 1440; c.set(Math.floor(A / 60), A % 60); c.onChange(c.get().tot, false); }); await p.waitForTimeout(2400);
    await p.evaluate(() => { const T = window.__tt.Day.target(), c = window.__tt.clock2; c.set(Math.floor(T / 60), T % 60); c.onChange(c.get().tot, false); }); await p.waitForTimeout(1900);   // 錯過再撥對：這題只記一次錯（跟星圖一樣）
    await p.evaluate(() => { const T = window.__tt.Day.target(), c = window.__tt.clock2; c.set(Math.floor(T / 60), T % 60); c.onChange(c.get().tot, false); }); await p.waitForTimeout(300);   // 下一題一次就撥對
    const L = await p.evaluate(k => window.__tt.DB().log[k], r);
    ok(L && L.n === 2 && L.ok === 1 && Object.values(L.e).reduce((a, x) => a + x, 0) === 1, `一題撥錯（再撥對不重複記）、下一題一次撥對：今天的紀錄 ${JSON.stringify(L)}`);
    ok(await p.evaluate(k => JSON.parse(localStorage.getItem('tick-town-v1')).log[k].n, r) === 2, '紀錄有存檔');
    ok(p.errs.length === 0, `無錯誤 ${p.errs.join(' | ')}`); await p.close(); }
  // 報告：最常搞混的排前面、有例子和兩種建議、這 7 天的數字、跟前一週比
  const SEED = `key => Object.assign(${BASE}, { errs: { hourLate: 0.4, minIndex: 0.2 }, log: { [key(0)]: { n: 16, ok: 13, e: { hourLate: 2, minIndex: 1 } }, [key(1)]: { n: 22, ok: 18, e: { hourLate: 3, halfHour: 1 } }, [key(3)]: { n: 14, ok: 11, e: { minIndex: 2, hourLate: 1 } }, [key(8)]: { n: 20, ok: 13, e: { hourLate: 4, minIndex: 2, halfHour: 1 } }, [key(10)]: { n: 12, ok: 8, e: { handSwap: 1, minNear: 9 } } } })`;
  { const p = await open(SEED);
    await p.click('#go-set'); ok(await p.isVisible('#go-report'), '設定的家長區有「學習報告」');
    await p.click('#go-report'); await p.waitForTimeout(300);
    ok(await p.isVisible('#o-report') && await p.isHidden('#o-set'), '打開報告（設定先收起來）');
    const sum = await p.$$eval('.rep-sum b', e => e.map(x => x.textContent)); ok(sum.join(',') === '3,52,81%', `這 7 天：練了 3 天、52 題、答對 81%（${sum.join('、')}）`);
    ok(/66%/.test(await p.textContent('#rep-body')) && /進步/.test(await p.textContent('#rep-body')), '跟前一週比：進步了（前一週 66%）');
    const errs = await p.$$eval('.rep-err', e => e.map(x => x.dataset.err)); ok(errs.join(',') === 'hourLate,minIndex,halfHour', `最常搞混的三種，照次數排：${errs.join('、')}`);
    ok(!errs.includes('minNear') && !errs.includes('handSwap'), '差一格不列（沒有具體建議）；只犯一次的不列');
    const first = await p.textContent('.rep-err'); ok(/這兩週 10 次/.test(first) && /例如/.test(first) && /遊戲裡/.test(first) && /在家可以/.test(first) && /7:50/.test(first), '每一種有次數、例子、遊戲裡怎麼練、在家怎麼練');
    ok(await p.$$eval('.rep-err .pc svg', e => e.length) === 3, '每一種旁邊有一座小鐘');
    ok(/144/.test(await p.textContent('#rep-body')), '有星圖的統計');
    const fit = await p.evaluate(() => { const r = document.querySelector('#o-report .card').getBoundingClientRect(); return r.top >= 0 && r.bottom <= innerHeight && r.left >= 0 && r.right <= innerWidth; }); ok(fit, '報告卡在畫面內（內容多的時候卡片裡面捲動）');
    // 介紹九九流星隊：要過家長關卡
    await p.evaluate(() => document.querySelector('#o-report [data-promo]').scrollIntoView()); ok(await p.evaluate(() => { const i = document.querySelector('#o-report .promo img'); return i.complete && i.naturalWidth > 0; }), '九九流星隊的圖示載得出來');
    await p.click('#o-report [data-promo]'); await p.waitForTimeout(200); ok(await p.isVisible('#o-gate') && !(await p.evaluate(() => window.__opened)), '按「去看看」先出家長關卡，還沒打開網頁');
    const q = await p.textContent('#gate-q'), m = q.match(/(\d+)\s*\+\s*(\d+)\s*×\s*(\d+)/), ans = String(+m[1] + m[2] * m[3]);
    for (const ch of ans) await p.click(`#gate-keys [data-k="${ch}"]`); await p.waitForTimeout(300);
    ok(/jiujiu-game/.test(await p.evaluate(() => window.__opened || '')), `算對才打開 ${await p.evaluate(() => window.__opened)}`);
    await p.click('#rep-close'); ok(await p.isHidden('#o-report') && await p.isVisible('#o-set'), '關掉回到設定');
    await p.click('#go-report'); await p.keyboard.press('Escape'); ok(await p.isHidden('#o-report') && await p.isVisible('#o-set'), 'Esc 也回到設定');
    ok(p.errs.length === 0, `無錯誤 ${p.errs.join(' | ')}`); await p.close(); }
  // 沒有紀錄：說明怎麼開始；舊存檔（沒有每天的紀錄、只有權重）也列得出最常搞混的
  { const p = await open(`key => (${BASE})`); await p.click('#go-set'); await p.click('#go-report'); await p.waitForTimeout(200);
    ok(await p.$$eval('.rep-sum', e => e.length) === 0 && /還沒有紀錄/.test(await p.textContent('#rep-body')) && (await p.$$('.rep-err')).length === 0, '全新的：說還沒有紀錄、不列錯法'); await p.close(); }
  { const p = await open(`key => Object.assign(${BASE}, { errs: { carry: 0.5, ampm: 0.1 } })`); await p.click('#go-set'); await p.click('#go-report'); await p.waitForTimeout(200);
    const errs = await p.$$eval('.rep-err', e => e.map(x => x.dataset.err)); ok(errs.join(',') === 'carry', `舊存檔只有權重：列出權重高的（${errs.join('、')}）`); await p.close(); }
  // 壞掉的紀錄會修好、只留最近 28 天
  { const p = await open(`key => Object.assign(${BASE}, { log: Object.assign({ 'abc': { n: 5 }, [key(2)]: { n: 'x', ok: 99, e: { hourLate: -3, bogus: 4, minIndex: 2.6 } }, [key(4)]: 7 }, Object.fromEntries(Array.from({ length: 40 }, (_, i) => [key(50 + i), { n: 3, ok: 3, e: {} }]))) })`);
    const L = await p.evaluate(() => window.__tt.DB().log), ks = Object.keys(L);
    ok(ks.length <= 28 && !ks.includes('abc') && ks.every(k => /^\d{4}-\d\d-\d\d$/.test(k)), `只留 28 天、怪的鍵拿掉（${ks.length} 天）`);
    const bad = Object.values(L).find(v => v.e && v.e.minIndex); ok(bad && bad.n === 0 && bad.ok === 0 && bad.e.minIndex === 3 && !('bogus' in bad.e) && !('hourLate' in bad.e), `壞掉的那一天修好了 ${JSON.stringify(bad)}`);
    await p.click('#go-set'); await p.click('#go-report'); await p.waitForTimeout(200); ok(await p.isVisible('#o-report') && p.errs.length === 0, `壞紀錄也打得開報告 ${p.errs.join(' | ')}`); await p.close(); }
  // 五種語言 × 小螢幕：報告卡在畫面內、字沒有跑出卡片、沒有漏翻（看得到 key 的名字就是漏了）
  for (const lang of ['zh-Hant', 'en', 'ja', 'ko', 'es']) for (const [w, h] of [[320, 568], [820, 1180]]) {
    const p = await open(SEED.replace(`lang: 'zh-Hant'`, `lang: '${lang}'`), { width: w, height: h }); await p.click('#go-set'); await p.click('#go-report'); await p.waitForTimeout(300);
    const r = await p.evaluate(() => { const c = document.querySelector('#o-report .card'), cr = c.getBoundingClientRect(); const over = [...c.querySelectorAll('*')].filter(e => { const x = e.getBoundingClientRect(); return x.width && (x.left < cr.left - 1 || x.right > cr.right + 1); }).length; return { fit: cr.top >= 0 && cr.bottom <= innerHeight && cr.right <= innerWidth, over, sw: c.scrollWidth - c.clientWidth, txt: c.innerText }; });
    ok(r.fit && r.over === 0 && r.sw <= 0, `${lang} ${w}x${h} 報告卡在畫面內、沒有東西跑出卡片（超出 ${r.over} 個、橫向多 ${r.sw}px）`);
    ok(!/rep\.|promo\.|err\./.test(r.txt) && r.txt.length > 300, `${lang} ${w}x${h} 沒有漏翻`);
    if (w === 320) { await p.click('#rep-close'); await p.click('#go-about'); await p.waitForTimeout(200); ok(await p.evaluate(() => { const e = document.querySelector('#o-about .promo'); const c = document.querySelector('#o-about .card').getBoundingClientRect(), r = e.getBoundingClientRect(); return r.left >= c.left && r.right <= c.right && !!e.querySelector('b').textContent; }), `${lang} 關於頁也有介紹卡，沒有跑出卡片`); }
    ok(p.errs.length === 0, `${lang} ${w}x${h} 無錯誤 ${p.errs.join(' | ')}`); await p.close();
  }
  await b.close(); console.log(fails ? `${fails} FAIL` : 'ALL PASS'); process.exit(fails ? 1 : 0);
})();
