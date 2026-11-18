// 音樂、音效、報時：預設都開、設定三個開關會記住、音樂跟著畫面和時刻換、整點報時敲對次數、又開始撥就停、切到背景就停
const { chromium } = require('playwright');
let fails = 0; const ok = (c, m) => { console.log((c ? 'PASS ' : 'FAIL ') + m); if (!c) fails++; };
const URL = 'http://localhost:8124/index.html';
(async () => {
  const b = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium', args: ['--no-sandbox', '--autoplay-policy=no-user-gesture-required'] });
  const open = async (set = {}, extra = {}) => {
    const p = await (await b.newContext({ viewport: { width: 390, height: 844 }, hasTouch: true })).newPage(); p.errs = []; p.on('pageerror', e => p.errs.push(e.message));
    await p.addInitScript(`if (!sessionStorage.x) { sessionStorage.x = 1; localStorage.setItem('tick-town-v1', ${JSON.stringify(JSON.stringify(Object.assign({ set: Object.assign({ lang: 'zh-Hant', level: 2 }, set), hinted: true, tut: true, free: 420 }, extra)))}); }`);
    await p.goto(URL); await p.waitForTimeout(300);
    // 記下報時敲幾下（包住 SFX.chime）
    await p.evaluate(() => { const S = window.__tt.SFX, orig = S.chime.bind(S); window.__chimes = []; S.chime = n => { window.__chimes.push(n); orig(n); }; });
    return p;
  };
  const M = p => p.evaluate(() => window.__tt.Music.s());
  const chimes = p => p.evaluate(() => window.__chimes.slice());
  const release = (p, h, m) => p.evaluate(([h, m]) => { const c = window.__tt.clock; c.set(h, m); c.onChange(c.get().tot, true); c.onChange(c.get().tot, false); }, [h, m]);

  // 舊存檔（沒有 music、chime 欄位）：都當開
  { const p = await open({ sound: true });
    ok(await p.evaluate(() => { const s = window.__tt.DB().set; return s.music === true && s.chime === true && s.sound === true; }), '舊存檔：音樂、音效、報時預設都開');
    await p.mouse.click(10, 300); await p.waitForTimeout(200);
    let m = await M(p); ok(m.on && m.track === 'town', `碰一下畫面就開始放音樂；早上 7 點是白天的歌（${m.track}）`);
    ok(await p.evaluate(() => window.__tt.Music && typeof AudioContext !== 'undefined'), '有 Web Audio');
    // 主選單跟著時刻換歌
    await release(p, 21, 10); await p.waitForTimeout(100); m = await M(p); ok(m.track === 'night', `晚上 9 點換搖籃曲（${m.track}）`);
    await release(p, 12, 10); m = await M(p); ok(m.track === 'town', `中午換回白天（${m.track}）`);
    // 報時
    await p.evaluate(() => { window.__chimes = []; }); await release(p, 15, 0); await p.waitForTimeout(100);
    ok(JSON.stringify(await chimes(p)) === '[3]', `放手停在 3:00 → 敲 3 下 ${JSON.stringify(await chimes(p))}`);
    ok((await M(p)).duck === true, '敲鐘時音樂變小聲');
    await p.evaluate(() => { const c = window.__tt.clock; c.onChange(c.get().tot, true); });   // 又開始撥
    ok(await p.evaluate(() => window.__tt.SFX.chimeN) === 0 && (await M(p)).duck === false, '又開始撥：報時停掉、音樂回來');
    await p.evaluate(() => { window.__chimes = []; }); await release(p, 0, 0); await release(p, 12, 0); await release(p, 13, 0); await release(p, 7, 5);
    ok(JSON.stringify(await chimes(p)) === '[12,12,1]', `半夜 12 點、中午 12 點敲 12 下，下午 1 點敲 1 下，7:05 不敲 ${JSON.stringify(await chimes(p))}`);
    await p.evaluate(() => { window.__chimes = []; }); await p.evaluate(() => { const c = window.__tt.clock; c.set(4, 0); c.onChange(c.get().tot, true); }); ok((await chimes(p)).length === 0, '拖的途中經過整點不報時（只響一聲鐘）');
    // 換畫面換歌
    await p.click('[data-mode=day]'); await p.waitForTimeout(150); m = await M(p); ok(m.track === 'play', `小鎮的一天放遊戲的歌（${m.track}）`);
    await p.evaluate(() => { window.__chimes = []; const c = window.__tt.clock2; c.set(8, 0); c.onChange(c.get().tot, false); }); ok((await chimes(p)).length === 0, '遊戲裡撥到整點不報時（不打斷題目）');
    await p.click('#s-day [data-home]'); await p.waitForTimeout(150); m = await M(p); ok(m.track === 'town' || m.track === 'night', `回主選單跟著鐘的時刻（${m.track}）`);
    // 切到背景就停，回來再開
    await p.evaluate(() => { Object.defineProperty(document, 'hidden', { configurable: true, get: () => true }); document.dispatchEvent(new Event('visibilitychange')); });
    ok((await M(p)).on === false, '切到背景：音樂停');
    await p.evaluate(() => { Object.defineProperty(document, 'hidden', { configurable: true, get: () => false }); document.dispatchEvent(new Event('visibilitychange')); });
    ok((await M(p)).on === true, '回來：音樂再開');
    // 設定：三個開關
    await p.click('#go-set'); await p.waitForTimeout(100);
    for (const k of ['music', 'sound', 'chime']) ok(await p.isVisible(`.sw[data-set=${k}]`) && await p.getAttribute(`.sw[data-set=${k}]`, 'aria-pressed') === 'true', `設定有「${await p.textContent(`[data-t="set.${k}"]`)}」開關，說明「${await p.textContent(`[data-t="set.${k}D"]`)}」`);
    ok(await p.evaluate(() => ['music', 'sound', 'chime'].every(k => { const r = document.querySelector(`.sw[data-set=${k}]`).getBoundingClientRect(); return r.height >= 44 && r.width >= 44; })), '開關都 ≥ 44px');
    await p.click('.sw[data-set=music]'); await p.waitForTimeout(100); ok((await M(p)).on === false, '關音樂：馬上停');
    await p.click('.sw[data-set=chime]'); await p.click('#set-close');
    await p.evaluate(() => { window.__chimes = []; }); await release(p, 9, 0); await p.waitForTimeout(100);
    ok(await p.evaluate(() => window.__tt.SFX.chimeN) === 0, '關報時：停在 9:00 不敲');
    await p.reload(); await p.waitForTimeout(300); await p.mouse.click(10, 300); await p.waitForTimeout(150);
    ok(await p.evaluate(() => { const s = window.__tt.DB().set; return s.music === false && s.chime === false; }) && (await M(p)).on === false, '重新打開：音樂、報時還是關的，碰畫面也不會放');
    ok(p.errs.length === 0, `無錯誤 ${p.errs.join(' | ')}`); await p.close(); }

  // 只關音效：報時還是會敲（兩個分開）；音效關掉時 tone 不出聲
  { const p = await open({ sound: false, music: false, chime: true });
    await p.evaluate(() => { window.__chimes = []; }); await release(p, 2, 0); await p.waitForTimeout(50);
    ok(await p.evaluate(() => window.__tt.SFX.chimeN) === 2, '音效關、報時開：2:00 還是敲 2 下');
    await p.close(); }

  // 教學第 2 步（烏龜到 3）敲 3 下
  { const p = await (await b.newContext({ viewport: { width: 390, height: 844 } })).newPage(); await p.goto(URL); await p.waitForTimeout(300);
    await p.evaluate(() => { const S = window.__tt.SFX, orig = S.chime.bind(S); window.__chimes = []; S.chime = n => { window.__chimes.push(n); orig(n); }; });
    ok((await M(p)).track === 'town', `教學放白天的歌（${(await M(p)).track}）`);
    await p.evaluate(() => { const c = window.__tt.clock6; c.set(8, 0); c.onChange(c.get().tot, false); }); await p.waitForTimeout(2700);
    await p.evaluate(() => { const c = window.__tt.clock6; c.set(3, 0); c.onChange(c.get().tot, false); }); await p.waitForTimeout(100);
    ok(JSON.stringify(await chimes(p)) === '[3]', `教學：烏龜拖到 3 → 敲 3 下 ${JSON.stringify(await chimes(p))}`);
    await p.close(); }
  await b.close();
  console.log(fails ? `\n${fails} FAILED` : '\nALL PASS'); process.exit(fails ? 1 : 0);
})();
