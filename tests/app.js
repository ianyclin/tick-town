// App 版：網頁版全部免費；App（用假的 Capacitor）付費遊戲各試玩 3 次、用完出鎖卡、家長關卡後購買、恢復購買；開場動畫不擋點擊；隱私權政策要過家長關卡
const { chromium } = require('playwright');
let fails = 0; const ok = (c, m) => { console.log((c ? 'PASS ' : 'FAIL ') + m); if (!c) fails++; };
const SHOT = process.argv[2];
const URL = process.env.TT_URL || 'http://localhost:8124/index.html';
const FAKE = owned => `window.__iap = { owned: ${owned}, calls: [] }; window.Capacitor = { isNativePlatform: () => true, getPlatform: () => 'android', addListener: () => {},
  nativePromise: async (pl, m, o) => { window.__iap.calls.push(m); if (m === 'getProducts') return { products: [{ priceString: 'NT$90' }] };
    if (m === 'getPurchases') return { purchases: window.__iap.owned ? [{ productIdentifier: 'ticktown.unlock_all', purchaseState: '1', isAcknowledged: true }] : [] };
    if (m === 'purchaseProduct') { window.__iap.owned = true; return { productIdentifier: 'ticktown.unlock_all', purchaseState: '1', isAcknowledged: false, purchaseToken: 't' }; }
    return {}; } };`;
(async () => {
  const b = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium', args: ['--no-sandbox'] });
  const solve = async p => { const q = await p.textContent('#gate-q'); const m = q.match(/(\d+)\s*\+\s*(\d+)\s*×\s*(\d+)(?:\s*[−-]\s*(\d+)\s*×\s*(\d+))?/); const v = +m[1] + m[2] * m[3] - (m[4] ? m[4] * m[5] : 0); for (const ch of String(v)) await p.click(`#gate-keys [data-k="${ch}"]`); await p.waitForTimeout(300); };
  const open = async (extra, lang = 'zh-Hant', w = 390, h = 844) => {
    const p = await (await b.newContext({ viewport: { width: w, height: h } })).newPage(); p.errs = []; p.on('pageerror', e => p.errs.push(e.message));
    await p.addInitScript(`if (!sessionStorage.x) { sessionStorage.x = 1; localStorage.setItem('tick-town-v1', JSON.stringify({ set: { lang: '${lang}', sound: false, music: false, level: 2 }, hinted: true, tut: true })); } window.open = (u) => { window.__opened = u; return null; }; ${extra || ''}`);
    await p.goto(URL); await p.waitForTimeout(300); return p;
  };
  // 網頁版
  { const p = await open('');
    ok(await p.isVisible('#splash'), '開場動畫出現');
    await p.click('[data-mode=day]'); await p.waitForTimeout(150); ok(await p.isVisible('#s-day'), '開場動畫不擋點擊（還在播的時候也能按）'); await p.click('#s-day [data-home]');
    await p.waitForTimeout(1900); ok(await p.evaluate(() => !document.querySelector('#splash')), '1.9 秒後開場動畫拿掉');
    ok(await p.evaluate(() => [...document.querySelectorAll('.m-lock')].every(e => e.hidden)) && !(await p.evaluate(() => window.__tt.APP)), '網頁版：沒有鎖、沒有試玩標籤');
    for (const m of ['match', 'shop']) { await p.click(`[data-mode=${m}]`); await p.waitForTimeout(150); ok(await p.isVisible(`#s-${m}`), `網頁版：${m} 直接玩`); await p.click(`#s-${m} [data-home]`); await p.waitForTimeout(100); }
    await p.click('#go-set'); ok(await p.isHidden('#set-unlock'), '網頁版：設定沒有「解鎖全部遊戲」');
    await p.locator('#go-about').scrollIntoViewIfNeeded(); await p.click('#go-about'); await p.locator('#about-privacy').scrollIntoViewIfNeeded(); await p.click('#about-privacy'); await p.waitForTimeout(100);
    ok(await p.isVisible('#o-gate') && !/−/.test(await p.textContent('#gate-q')), '隱私權政策：先過簡單的家長關卡');
    await solve(p); ok(/privacy\/$/.test(await p.evaluate(() => window.__opened || '')), `過關才打開 ${await p.evaluate(() => window.__opened)}`);
    ok(await p.evaluate(() => { const l = document.querySelector('link[rel=manifest]'); return !!l; }) && (await (await p.request.get(URL.replace('index.html', 'manifest.json'))).json()).icons.length === 3, 'manifest.json 有三個圖示');
    ok(p.errs.length === 0, `網頁版無錯誤 ${p.errs.join(' | ')}`); await p.close(); }

  // App：試玩、鎖、購買
  for (const [lang, w, h] of [['zh-Hant', 390, 844], ['en', 320, 568], ['es', 375, 667], ['ja', 320, 568], ['ko', 360, 640]]) {
    const tag = `${lang} ${w}x${h}`, p = await open(FAKE(false), lang, w, h); await p.waitForTimeout(1900);
    ok(await p.evaluate(() => window.__tt.APP), `${tag} 假的 Capacitor：是 App`);
    const badge = await p.textContent('#go-match .m-lock'); ok(await p.isVisible('#go-match .m-lock') && /3/.test(badge) && await p.isHidden('#go-day .m-lock'), `${tag} 付費遊戲上有「${badge}」，小鎮的一天沒有`);
    ok(await p.evaluate(() => { const L = [...document.querySelectorAll('.m-lock')].filter(e => !e.hidden).map(e => e.getBoundingClientRect()); return L.every(r => r.left >= 0 && r.right <= innerWidth) && L.every((r, i) => !i || r.left >= L[i - 1].right - 1) && [...document.querySelectorAll('.m-lock')].every(e => e.hidden || e.scrollWidth <= e.clientWidth + 1); }), `${tag} 標籤在畫面內、不互相重疊、字沒被切`);
    if (SHOT && lang === 'zh-Hant') await p.screenshot({ path: `${SHOT}/app-menu.png` });
    for (let i = 0; i < 3; i++) { await p.click('[data-mode=match]'); await p.waitForTimeout(150); ok(await p.isVisible('#s-match') && await p.isVisible('#toast'), `${tag} 試玩第 ${i + 1} 次：「${await p.textContent('#toast')}」`); await p.click('#s-match [data-home]'); await p.waitForTimeout(100); }
    ok(await p.evaluate(() => { const e = document.querySelector('#go-match .m-lock'); return e.classList.contains('locked') && !!e.querySelector('img.ic') && !e.hidden; }), `${tag} 用完了：鈕上是鎖頭的圖`);
    await p.click('[data-mode=match]'); await p.waitForTimeout(150);
    ok(await p.isHidden('#s-match') && await p.isVisible('#o-lock'), `${tag} 第 4 次：鎖卡「${await p.textContent('#lock-title')}」`);
    const lockTxt = await p.textContent('#o-lock'); ok(!/\$|NT|元|price|precio/i.test(lockTxt), `${tag} 鎖卡沒有價錢`);
    if (SHOT && lang === 'zh-Hant') await p.screenshot({ path: `${SHOT}/app-lock.png` });
    await p.click('#lock-ask'); await p.waitForTimeout(100); ok(await p.isVisible('#o-gate'), `${tag} 「給大人看」→ 家長關卡`);
    await solve(p); await p.waitForTimeout(200);
    ok(await p.isVisible('#o-buy') && (await p.textContent('#buy-go')).includes('NT$90'), `${tag} 購買卡：「${await p.textContent('#buy-go')}」`);
    if (SHOT && lang === 'zh-Hant') await p.screenshot({ path: `${SHOT}/app-buy.png` });
    await p.click('#buy-go'); await p.waitForTimeout(300);
    ok((await p.evaluate(() => window.__tt.UL().ok)) && await p.evaluate(() => window.__iap.calls.includes('acknowledgePurchase')), `${tag} 買了就解鎖（Android 有確認購買）`);
    ok(await p.evaluate(() => [...document.querySelectorAll('.m-lock')].every(e => e.hidden)), `${tag} 解鎖後標籤都不見`);
    await p.click('#buy-close'); await p.click('[data-mode=match]'); await p.waitForTimeout(150); ok(await p.isVisible('#s-match'), `${tag} 解鎖後直接玩`);
    ok(p.errs.length === 0, `${tag} 無錯誤 ${p.errs.join(' | ')}`); await p.close();
  }
  // App：重裝以後（商店說買過）自己解鎖；每日任務不出鎖住的遊戲
  { const p = await open(FAKE(true)); await p.waitForTimeout(400);
    ok(await p.evaluate(() => window.__tt.UL().ok), '商店說買過：打開就自己解鎖');
    await p.click('#go-set'); ok(await p.isVisible('.app-only') && await p.isHidden('#set-unlock'), `設定的家長區：「${await p.textContent('#set-unlockD')}」`); await p.close(); }
  { const p = await open(FAKE(false) + ` localStorage.setItem('tick-town-unlock', JSON.stringify({ ok: false, trial: { match: 3, shop: 3, versus: 3 } }));`); await p.waitForTimeout(300);
    const ids = await p.evaluate(() => { const r = new Set(); for (let i = 0; i < 40; i++) { const d = window.__tt.DB(); d.daily = { tasks: [], date: '' }; window.__tt.Quest.ensure(); window.__tt.DB().daily.tasks.forEach(t => r.add(t.id)); } return [...r]; });
    ok(!ids.some(i => ['match', 'shop', 'vs'].includes(i)), `試玩都用完：每日任務不出配對、修鐘店、雙人（${ids.join(' ')}）`);
    await p.click('#go-set'); await p.click('#set-unlock'); await p.waitForTimeout(100); ok(await p.isVisible('#o-gate'), '設定「解鎖全部遊戲」→ 家長關卡'); await solve(p); await p.waitForTimeout(200);
    await p.click('#buy-restore'); await p.waitForTimeout(300); ok(/沒有找到/.test(await p.textContent('#buy-msg')), `恢復購買（沒買過）：「${await p.textContent('#buy-msg')}」`);
    ok(p.errs.length === 0, `無錯誤 ${p.errs.join(' | ')}`); await p.close(); }
  await b.close();
  console.log(fails ? `\n${fails} FAILED` : '\nALL PASS'); process.exit(fails ? 1 : 0);
})();
