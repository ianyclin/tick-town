// 三年級（等級 3「過了多久」）：24 小時制、走了幾分鐘、時間線提示、1 分的小格（minOne）
const { chromium } = require('playwright');
let fails = 0; const ok = (c, m) => { console.log((c ? 'PASS ' : 'FAIL ') + m); if (!c) fails++; };
const SHOT = process.argv[2];
const URL = 'http://localhost:8124/index.html';
(async () => {
  const b = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium', args: ['--no-sandbox'] });
  const open = async (lang, w, h, extra = {}) => {
    const p = await (await b.newContext({ viewport: { width: w, height: h }, hasTouch: true })).newPage(); p.errs = []; p.on('pageerror', e => p.errs.push(e.message));
    await p.addInitScript(`if (!sessionStorage.x) { sessionStorage.x = 1; localStorage.setItem('tick-town-v1', ${JSON.stringify(JSON.stringify(Object.assign({ set: { lang, sound: false, music: false, level: 3 }, hinted: true, tut: true }, extra)))}); }`);
    await p.goto(URL); await p.waitForTimeout(300); return p;
  };
  const type = async (p, str) => { for (const ch of str) await p.click(`#read-keys .key[data-k="${ch}"]`); await p.click('#read-keys .key.ok'); await p.waitForTimeout(150); };
  const db = p => p.evaluate(() => window.__tt.DB());
  const inView = (p, sel) => p.evaluate(sel => { const e = document.querySelector(sel); const r = e.getBoundingClientRect(); return !e.hidden && r.height > 0 && r.top >= -1 && r.bottom <= innerHeight + 1 && r.left >= -1 && r.right <= innerWidth + 1; }, sel);

  // 錯法：差 1～4 分是 minOne
  { const p = await open('zh-Hant', 390, 844); const cs = (T, A) => p.evaluate(([T, A]) => window.__tt.classifySet(T, A), [T, A]);
    ok(await cs(7 * 60 + 23, 7 * 60 + 22) === 'minOne', '7:23 撥成 7:22 → minOne'); ok(await cs(7 * 60 + 20, 7 * 60 + 24) === 'minOne', '7:20 撥成 7:24 → minOne'); ok(await cs(7 * 60 + 20, 7 * 60 + 25) === 'minNear', '差 5 分還是 minNear');
    // 時間線
    const tl = await p.evaluate(() => { const d = document.createElement('div'); d.innerHTML = window.__tt.timeline(160, 195); return { seg: d.querySelectorAll('.seg').length, txt: [...d.querySelectorAll('text')].map(t => t.textContent) }; });
    ok(tl.seg === 2 && tl.txt.includes('+20 分') && tl.txt.includes('+15 分') && tl.txt.includes('2:40') && tl.txt.includes('3:00') && tl.txt.includes('3:15'), `時間線 2:40→3:15 分兩段：${tl.txt.join(' ')}`);
    const tl2 = await p.evaluate(() => { const d = document.createElement('div'); d.innerHTML = window.__tt.timeline(130, 155); return d.querySelectorAll('.seg').length; });
    ok(tl2 === 1, '沒跨整點的時間線只有一段');
    // 存檔：a、g 的鍵會留下來，亂的鍵會被丟掉
    await p.evaluate(() => { localStorage.setItem('tick-town-v1', JSON.stringify({ set: { lang: 'zh-Hant', level: 3 }, tut: true, facts: { 'a:15:20': { n: 1, w: 1, err: 0.3, t: 0 }, 'g:160:35': { n: 2, w: 0, err: 0, t: 0 }, 'x:1:2': { n: 1 } } })); });
    await p.reload(); await p.waitForTimeout(300); const f = (await db(p)).facts;
    ok(f['a:15:20'] && f['g:160:35'] && !f['x:1:2'], '存檔留下 a:、g: 的題目，丟掉不認得的');
    await p.close(); }

  for (const [lang, w, h] of [['zh-Hant', 390, 844], ['en', 320, 568], ['ja', 360, 640], ['ko', 390, 844], ['es', 375, 667]]) {
    const tag = `${w}x${h} ${lang}`, p = await open(lang, w, h);
    await p.click('[data-mode=read]'); await p.waitForTimeout(200);
    const seen = new Set(); let did24 = false, didDur = false, shot24 = false, shotDur = false;
    for (let i = 0; i < 8; i++) {
      const q = await p.evaluate(() => { const s = window.__tt.Read.s ? window.__tt.Read.s() : null; return null; });
      const Q = await p.evaluate(() => window.__readQ && window.__readQ());
      const kind = await p.evaluate(() => { const say = document.querySelector('#read-say').textContent, tgt = document.querySelector('#read-target'); return !tgt.hidden ? 'dur' : /24/.test(say) ? 'h24' : 'clock'; });
      seen.add(kind);
      ok(await p.isVisible('#read-pad') && await inView(p, '#read-keys') && await inView(p, '.key.ok'), `${tag} 第 ${i + 1} 題（${kind}）鍵盤在畫面內`);
      const st = await p.evaluate(() => { const q = window.__tt.Read.q(); return q && { kind: q.kind, h: q.h, m: q.m, H: q.H, t1: q.t1, d: q.d, T: q.T }; });
      if (st.kind === 'h24' && !did24 && st.H >= 13) {
        did24 = true; const say = await p.textContent('#read-say'); ok(!/[{}]/.test(say), `${tag} 24 小時制題目「${say}」`);
        await type(p, `${st.h}${String(st.m).padStart(2, '0')}`);   // 沒加 12
        const hint = await p.textContent('#read-hint'); ok(await p.isVisible('#read-hint') && hint.includes(String(st.H)) && hint.includes('12'), `${tag} ${st.h}:${st.m} 打成沒加 12 → 提示「${hint}」`);
        ok((await db(p)).errs.ampm > 0, `${tag} 記成 ampm 的錯`);
        if (SHOT && !shot24) { shot24 = true; await p.screenshot({ path: `${SHOT}/g3-h24-${lang}.png` }); }
        ok(await p.isVisible('#read-hint-ok'), `${tag} 提示蓋在鍵盤上，有「知道了」`); await p.click('#read-hint-ok'); ok(await p.isHidden('#read-hint'), `${tag} 按「知道了」回到鍵盤`);
        await p.waitForTimeout(550); await type(p, `${st.H}${String(st.m).padStart(2, '0')}`);
        ok(/\d+:\d\d/.test(await p.textContent('#read-hint')) && await p.evaluate(() => document.querySelector('#read-hint').classList.contains('good')), `${tag} 打 ${st.H}:${st.m} 對了`);
        ok(Object.keys((await db(p)).facts).some(k => k === `a:${st.H}:${st.m}`), `${tag} 記成 a:${st.H}:${st.m}`);
      } else if (st.kind === 'dur' && !didDur && st.t1 % 60 + st.d > 60) {
        didDur = true; const say = await p.textContent('#read-say'), tgt = await p.textContent('#read-target'); ok(!/[{}]/.test(say) && /\d:\d\d/.test(tgt), `${tag} 走了幾分鐘「${say}」出發 ${tgt}`);
        const wrongN = Math.abs(st.T % 60 - st.t1 % 60); await type(p, String(wrongN === st.d ? wrongN + 7 : wrongN));
        const segs = await p.evaluate(() => document.querySelectorAll('#read-hint .tl .seg').length);
        ok(await p.isVisible('#read-hint') && segs === 2, `${tag} 只算分鐘相減（${wrongN}）→ 提示＋時間線兩段「${(await p.textContent('#read-hint')).slice(0, 40)}…」`);
        ok(await inView(p, '#read-hint .tl'), `${tag} 時間線在畫面內`);
        ok((await db(p)).errs.carry > 0, `${tag} 記成 carry 的錯`);
        if (SHOT && !shotDur) { shotDur = true; await p.waitForTimeout(1800); await p.screenshot({ path: `${SHOT}/g3-dur-${lang}.png` }); }
        await p.click('#read-hint-ok'); await p.waitForTimeout(550); await type(p, String(st.d)); ok(await p.evaluate(() => document.querySelector('#read-hint').classList.contains('good')), `${tag} 打 ${st.d} 分對了`);
        ok(Object.keys((await db(p)).facts).includes(`g:${st.t1}:${st.d}`), `${tag} 記成 g:${st.t1}:${st.d}`);
      } else {
        const ans = st.kind === 'dur' ? String(st.d) : st.kind === 'h24' ? `${st.H}${String(st.m).padStart(2, '0')}` : `${st.h}${String(st.m).padStart(2, '0')}`; await type(p, ans);
      }
      await p.waitForTimeout(1000);
    }
    ok(await p.isVisible('#o-rdone'), `${tag} 一輪做完`);
    ok(seen.size >= 2, `${tag} 一輪有不同種類的題：${[...seen].join(' ')}`);
    ok(p.errs.length === 0, `${tag} 無錯誤 ${p.errs.join(' | ')}`); await p.close();
  }

  // 弱點：ampm 高 → 24 小時制的題多；carry 高 → 走了幾分鐘的題多
  { const p = await open('zh-Hant', 390, 844, { errs: { ampm: 0.9 } }); await p.click('[data-mode=read]'); await p.waitForTimeout(150);
    const r1 = await p.evaluate(() => { let n = 0; for (let i = 0; i < 400; i++) if (window.__tt.Read.kind() === 'h24') n++; return n / 400; });
    await p.evaluate(() => { const d = window.__tt.DB(); d.errs = { carry: 0.9 }; }); const r2 = await p.evaluate(() => { let n = 0; for (let i = 0; i < 400; i++) if (window.__tt.Read.kind() === 'dur') n++; return n / 400; });
    await p.evaluate(() => { window.__tt.DB().errs = {}; }); const r0 = await p.evaluate(() => { let a = 0, d = 0; for (let i = 0; i < 400; i++) { const k = window.__tt.Read.kind(); if (k === 'h24') a++; if (k === 'dur') d++; } return [a / 400, d / 400]; });
    ok(r1 > r0[0] + 0.15 && r2 > r0[1] + 0.15, `弱點多出：24 小時制 ${r0[0].toFixed(2)}→${r1.toFixed(2)}、走了幾分鐘 ${r0[1].toFixed(2)}→${r2.toFixed(2)}`);
    await p.evaluate(() => { window.__tt.DB().set.level = 2; }); ok(await p.evaluate(() => { for (let i = 0; i < 50; i++) if (window.__tt.Read.kind() !== 'clock') return false; return true; }), '等級 2 只考一般讀鐘');
    await p.close(); }

  // 小鎮的一天：24 小時制的題，分鐘對、小時錯 → ampm 提示；走了幾分鐘撥錯有時間線；1 分撥錯小格亮
  { const p = await open('zh-Hant', 390, 844); await p.click('[data-mode=day]'); await p.waitForTimeout(200);
    const days = await p.evaluate(() => { let n = 0, t = 0; for (let i = 0; i < 200; i++) for (const k of window.__tt.Day.makeDay()) { if (k.t >= 780 && k.from === undefined) { t++; if (k.h24) n++; } if (k.h24 && k.t < 780) return -1; } return n / t; });
    ok(days > 0.25 && days < 0.7, `等級 3 下午以後的事約一半寫成 24 小時制（${days.toFixed(2)}），上午不會`);
    const setTask = (task) => p.evaluate(t => window.__tt.Day.force(t), task);
    await setTask({ sc: 'park', t: 15 * 60 + 20, who: 'bear', h24: true });
    const say = await p.textContent('#day-say'), tgt = await p.textContent('#day-target'); ok(say.includes('15:20') && tgt.includes('15:20') && tgt.includes('24'), `24 小時制的題「${say}」目標「${tgt}」`);
    const setAns = async (hh, mm) => { await p.evaluate(([hh, mm]) => { const c = window.__tt.clock2; c.set(hh, mm); c.onChange(c.get().tot, true); c.onChange(c.get().tot, false); }, [hh, mm]); await p.waitForTimeout(2200); };
    await setAns(5, 20); const hint = await p.textContent('#day-hint'); ok(hint.includes('15') && hint.includes('3'), `撥成 5:20 → 提示「${hint}」`); ok((await db(p)).errs.ampm > 0, '記成 ampm');
    if (SHOT) await p.screenshot({ path: `${SHOT}/g3-day24.png` });
    await setTask({ sc: 'park', t: 15 * 60 + 15, who: 'squirrel', from: 14 * 60 + 40, d: 35 });
    await setAns(14, 55); ok(await p.evaluate(() => { const r = document.querySelector('#day-hint').getBoundingClientRect(); return r.top >= 0 && r.bottom <= innerHeight; }) && await p.isVisible('#day-hint-ok'), '走了幾分鐘的提示在畫面內、有「知道了」'); ok(await p.evaluate(() => document.querySelectorAll('#day-hint .tl .seg').length) === 2, `走了幾分鐘撥錯：時間線兩段「${(await p.textContent('#day-hint')).slice(0, 30)}…」`);
    if (SHOT) { await p.waitForTimeout(1800); await p.screenshot({ path: `${SHOT}/g3-daytl.png` }); }
    await p.click('#day-hint-ok'); ok(await p.isHidden('#day-hint'), '按「知道了」收起來');
    await setTask({ sc: 'lunch', t: 12 * 60 + 23, who: 'bear' });
    await setAns(12, 21); ok(/1 分鐘|小格/.test(await p.textContent('#day-hint')), `差 2 分：提示「${await p.textContent('#day-hint')}」`);
    await p.waitForTimeout(900); ok(await p.evaluate(() => document.querySelectorAll('#clock2 .tk-lit').length) >= 2, '小格一格一格亮');
    if (SHOT) await p.screenshot({ path: `${SHOT}/g3-minone.png` });
    ok(p.errs.length === 0, `無錯誤 ${p.errs.join(' | ')}`); await p.close(); }
  await b.close();
  console.log(fails ? `\n${fails} FAILED` : '\nALL PASS'); process.exit(fails ? 1 : 0);
})();
