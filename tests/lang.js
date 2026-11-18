// 五種語言：字串表齊全、時刻的說法、裝置語言自動選、設定可以切換、韓文西班牙文的句子沒有漏填
const { chromium } = require('playwright');
const fs = require('fs');
let fails = 0; const ok = (c, m) => { console.log((c ? 'PASS ' : 'FAIL ') + m); if (!c) fails++; };
const URL = 'http://localhost:8124/index.html';
const LANGS = ['zh-Hant', 'en', 'ja', 'ko', 'es'];
const ONLY = { 't.quarter': ['es'] };   // 只有某些語言才有的鍵（西班牙文 15 分說 y cuarto）
(async () => {
  // 字串表：每種語言的鍵一樣多；只有 {參數} 的寫法對得上
  const src = fs.readFileSync(__dirname + '/../index.html', 'utf8');
  const a = src.indexOf('const STR = {'), b = src.indexOf('\n};', a);
  const STR = eval('(' + src.slice(a + 12, b + 2) + ')');
  ok(JSON.stringify(Object.keys(STR)) === JSON.stringify(LANGS), `字串表有五種語言：${Object.keys(STR).join(' ')}`);
  const all = new Set(LANGS.flatMap(l => Object.keys(STR[l])));
  for (const l of LANGS) { const miss = [...all].filter(k => !(k in STR[l]) && !(ONLY[k] && !ONLY[k].includes(l))); ok(miss.length === 0, `${l} 沒有缺字串 ${miss.join(' ')}`); }
  // 每個 {參數} 都要是中文版也有給的（不然會照字印出 {xx}）；時刻的鍵（t.*）各語言用的參數不同（m／mm／art），另外在畫面上檢查
  const params = v => new Set([...String(v).matchAll(/\{(\w+)\}/g)].map(m => m[1]));
  for (const l of ['ko', 'es', 'ja', 'en']) { const bad = Object.keys(STR['zh-Hant']).filter(k => !k.startsWith('t.') && [...params(STR[l][k])].some(x => !params(STR['zh-Hant'][k]).has(x))); ok(bad.length === 0, `${l} 的 {參數} 都是中文版有的 ${bad.join(' ')}`); }
  ok(!/[가-힣]/.test(Object.values(STR.es).join('')) && !/[ぁ-ん]/.test(Object.values(STR.ko).join('')), '西班牙文裡沒有韓文、韓文裡沒有日文假名');
  ok(Object.values(STR.ko).filter(v => /[가-힣]/.test(v)).length > 180, '韓文表真的是韓文');
  // 韓文：動物名字都以母音結尾，後面接的「가／와／는」才不會錯
  const lastHangulHasBatchim = w => { const c = w.charCodeAt(w.length - 1); return c >= 0xac00 && c <= 0xd7a3 && (c - 0xac00) % 28 !== 0; };
  for (const k of ['who.bear', 'who.rabbit', 'who.squirrel', 'who.owl', 'kname.owl', 'kname.squirrel', 'kname.bear']) ok(!lastHangulHasBatchim(STR.ko[k]), `韓文 ${k}「${STR.ko[k]}」以母音結尾`);

  const br = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium', args: ['--no-sandbox'] });
  // 裝置語言自動選
  for (const [loc, want] of [['ko-KR', 'ko'], ['es-ES', 'es'], ['es-419', 'es'], ['fr-FR', 'en'], ['zh-TW', 'zh-Hant'], ['ja-JP', 'ja']]) {
    const p = await (await br.newContext({ locale: loc })).newPage(); await p.goto(URL); await p.waitForTimeout(300);
    ok(await p.evaluate(() => document.documentElement.lang) === want, `裝置語言 ${loc} → ${want}`); await p.close();
  }
  // 時刻的說法
  const p = await br.newPage(); p.errs = []; p.on('pageerror', e => p.errs.push(e.message));
  await p.addInitScript(`localStorage.setItem('tick-town-v1', JSON.stringify({ set: { lang: 'ko', sound: false, level: 2 }, tut: true, hinted: true }));`);
  await p.goto(URL); await p.waitForTimeout(300);
  const say = async t => { await p.evaluate(t => { const c = window.__tt.clock; c.set(Math.floor(t / 60), t % 60); c.onChange(c.get().tot, false); }, t); return (await p.textContent('#words')).trim(); };
  const setLang = async l => { await p.click('#go-set'); await p.click(`#set-lang [data-lang="${l}"]`); await p.click('#set-close'); await p.waitForTimeout(100); };
  for (const [t, want] of [[420, '아침 7시'], [440, '아침 7시 20분'], [450, '아침 7시 반'], [900, '오후 3시'], [1380, '밤 11시']]) ok(await say(t) === want, `韓文 ${t} →「${want}」`);
  await setLang('es');
  ok(await p.evaluate(() => document.documentElement.lang) === 'es', '設定換成西班牙文');
  for (const [t, want] of [[60, 'La 1 en punto de la noche'], [420, 'Las 7 en punto de la mañana'], [435, 'Las 7 y cuarto de la mañana'], [450, 'Las 7 y media de la mañana'], [440, 'Las 7 y 20 de la mañana'], [800, 'La 1 y 20 de la tarde'], [900, 'Las 3 en punto de la tarde']]) ok(await say(t) === want, `西班牙文 ${t} →「${want}」`);
  // 小鎮的一天：句子中間用小寫「a las 7…」，有填好時刻、沒有留下 {參數}
  await p.click('[data-mode=day]'); await p.waitForTimeout(300); const s1 = await p.textContent('#day-say');
  ok(/ a las? \d+/.test(s1) && !/[{}]/.test(s1), `西班牙文題目「${s1}」`);
  await p.click('#s-day [data-home]'); await setLang('ko'); await p.click('[data-mode=day]'); await p.waitForTimeout(300); const s2 = await p.textContent('#day-say');
  ok(/^(아침|낮|오후|저녁|밤) \d+시.*에 곰돌이가/.test(s2) && !/[{}]/.test(s2), `韓文題目「${s2}」`);
  await p.click('#s-day [data-home]');
  // 設定頁五個語言鈕都在、都按得到
  await p.click('#go-set'); await p.waitForTimeout(100);
  ok(await p.evaluate(() => [...document.querySelectorAll('#set-lang button')].map(b => b.textContent).join(',')) === '繁體中文,English,日本語,한국어,Español', '設定頁五個語言鈕');
  ok(await p.evaluate(() => [...document.querySelectorAll('#set-lang button')].every(b => { const r = b.getBoundingClientRect(); return r.height >= 44 && r.width >= 44; })), '語言鈕都 ≥ 44px');
  // 每種語言都沒有留下沒翻的 key（畫面上的 data-t 都填了）
  for (const l of LANGS) { await p.click(`#set-lang [data-lang="${l}"]`); await p.waitForTimeout(80); const raw = await p.evaluate(() => [...document.querySelectorAll('[data-t]')].filter(e => e.textContent.trim() === e.dataset.t).map(e => e.dataset.t)); ok(raw.length === 0, `${l} 畫面上沒有沒填的字 ${raw.join(' ')}`); }
  ok(p.errs.length === 0, `無錯誤 ${p.errs.join(' | ')}`);
  await br.close();
  console.log(fails ? `\n${fails} FAILED` : '\nALL PASS'); process.exit(fails ? 1 : 0);
})();
