// 鐘面元件與自由玩：拖指針、吸附、進位、時針跟著走、語言、存檔、小鎮變化
const { chromium } = require('playwright');
let fails = 0; const ok = (c, m) => { console.log((c ? 'PASS ' : 'FAIL ') + m); if (!c) fails++; };
const SHOT = process.argv[2];
(async () => {
  const b = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium', args: ['--no-sandbox'] });
  for (const [w, h, lang] of [[390, 844, 'zh-Hant'], [390, 844, 'en'], [320, 568, 'ja'], [820, 1180, 'zh-Hant']]) {
    const p = await (await b.newContext({ viewport: { width: w, height: h }, hasTouch: true })).newPage(); const errs = []; p.on('pageerror', e => errs.push(e.message));
    await p.addInitScript(`localStorage.setItem('tick-town-v1', JSON.stringify({ set: { lang: '${lang}', sound: false, level: 2 }, free: 420 }));`);
    await p.goto('http://localhost:8124/index.html'); await p.waitForTimeout(400);
    const get = () => p.evaluate(() => window.__tt.clock.get());
    let t = await get(); ok(t.h === 7 && t.m === 0, `${lang} 載入 7:00 → ${t.h}:${t.m}；文字「${await p.textContent('#words')}」`);
    // 幾何：鐘的中心與半徑（SVG 200 單位）
    const r = await p.locator('#clock svg').boundingBox(); const cx = r.x + r.width / 2, cy = r.y + r.height / 2, u = r.width / 200;
    const at = (deg, rad) => [cx + rad * u * Math.sin(deg * Math.PI / 180), cy - rad * u * Math.cos(deg * Math.PI / 180)];
    const dragArc = async (rad, from, to, steps = 24) => { const [x0, y0] = at(from, rad); await p.mouse.move(x0, y0); await p.mouse.down(); for (let i = 1; i <= steps; i++) { const [x, y] = at(from + (to - from) * i / steps, rad); await p.mouse.move(x, y); } await p.mouse.up(); };
    // 把手大小 ≥ 56px
    const knob = await p.evaluate(() => { const k = document.querySelector('.minute .knob'); const bb = k.getBoundingClientRect(); return bb.width; }); ok(knob >= 56, `${lang} 把手 ${Math.round(knob)}px ≥ 56`);
    // 拖兔子（分針，半徑 78）從 12 到 3 → 7:15
    await dragArc(78, 0, 90); t = await get(); ok(t.h === 7 && t.m === 15, `${lang} 拖分針到 3 → ${t.h}:${t.m}`);
    // 時針要在 7 和 8 之間（7.25 格 = 217.5°）
    const ha = await p.evaluate(() => +document.querySelector('.hour').getAttribute('transform').match(/rotate\(([\d.]+)/)[1]); ok(Math.abs(ha - 217.5) < 1, `${lang} 時針跟著走 ${ha.toFixed(1)}°`);
    // 繼續轉一整圈 → 8:15（跨 12 進位）
    await dragArc(78, 90, 450, 60); t = await get(); ok(t.h === 8 && t.m === 15, `${lang} 轉一圈進位 → ${t.h}:${t.m}`);
    // 逆時針退回 → 7:45
    await dragArc(78, 90, -90, 30); t = await get(); ok(t.h === 7 && t.m === 45, `${lang} 逆時針 → ${t.h}:${t.m}`);
    // 吸附到 5 分：拖到 3 點方向偏 7°（≈ 16.2 分）→ 15
    await dragArc(78, 270, 97, 40); t = await get(); ok(t.m === 15 || t.m === 20, `${lang} 吸附 5 分 → ${t.m}`);
    // 拖烏龜（時針，半徑 52）到 3 點方向 → 3:00（分針回 12）
    const hNow = await p.evaluate(() => +document.querySelector('.hour').getAttribute('transform').match(/rotate\(([\d.]+)/)[1]);
    await dragArc(52, hNow, 97, 30); t = await get(); ok(t.h === 3 && t.m === 15, `${lang} 拖時針到 3 → 分針不動 ${t.h}:${t.m}`);
    await dragArc(52, 97, 110, 10); t = await get(); ok(t.h === 3 && t.m === 15, `${lang} 時針只拖一點點 → 還是 3:15 (${t.h}:${t.m})`);
    // 輕點把手不會改時間
    const [kx, ky] = at(97.5, 52); await p.mouse.click(kx, ky); t = await get(); ok(t.h === 3 && t.m === 15, `${lang} 輕點烏龜不變 ${t.h}:${t.m}`);
    // 存檔
    await p.waitForTimeout(100); const saved = await p.evaluate(() => JSON.parse(localStorage.getItem('tick-town-v1')).free); ok(saved === 195, `${lang} 存檔 free=${saved}`);
    // 晚上：拖到 21:00 看天空變暗、場景換
    await p.evaluate(() => { window.__tt.clock.set(21, 0); window.__tt.clock.onChange(21 * 60, false); });
    const px = await p.evaluate(() => { const c = document.querySelector('#town'); const d = c.getContext('2d').getImageData(10, 10, 1, 1).data; return d[0] + d[1] + d[2]; }); ok(px < 300, `${lang} 21:00 天空暗 (${px})；場景「${await p.textContent('#scene')}」`);
    await p.evaluate(() => { window.__tt.clock.set(12, 0); window.__tt.clock.onChange(12 * 60, false); });
    const px2 = await p.evaluate(() => { const c = document.querySelector('#town'); const d = c.getContext('2d').getImageData(10, 10, 1, 1).data; return d[0] + d[1] + d[2]; }); ok(px2 > 450, `${lang} 12:00 天空亮 (${px2})；「${await p.textContent('#words')}」`);
    // 版面
    const sw = await p.evaluate(() => document.documentElement.scrollWidth); ok(sw <= w, `${lang} 不橫捲`);
    const small = await p.evaluate(() => [...document.querySelectorAll('button')].filter(b => b.offsetParent && b.getBoundingClientRect().height < 44).map(b => b.textContent.trim())); ok(small.length === 0, `${lang} 按鈕都 ≥ 44：${small.join(',')}`);
    const modesIn = await p.evaluate(() => { const m = document.querySelector('#modes').getBoundingClientRect(); return m.bottom <= innerHeight + 1; }); ok(modesIn, `${lang} 模式鈕在畫面內`);
    if (SHOT) { await p.evaluate(() => { window.__tt.clock.set(7, 20); window.__tt.clock.onChange(440, false); }); await p.screenshot({ path: `${SHOT}/tt-${lang}-${w}.png` }); await p.evaluate(() => { window.__tt.clock.set(20, 30); window.__tt.clock.onChange(1230, false); }); await p.screenshot({ path: `${SHOT}/tt-${lang}-${w}-night.png` }); }
    // 設定：換語言
    await p.click('#go-set'); await p.click('[data-lang=en]'); ok(/o'clock|half past|:\d/.test(await p.textContent('#words')), `${lang} 換英文後文字「${await p.textContent('#words')}」`);
    await p.keyboard.press('Escape'); ok(await p.isHidden('#o-set'), `${lang} Esc 關設定`);
    ok(errs.length === 0, `${lang} 無錯誤 ${errs.join('|')}`);
    await p.context().close();
  }
  await b.close(); console.log(fails ? `${fails} FAIL` : 'ALL PASS'); process.exit(fails ? 1 : 0);
})();
