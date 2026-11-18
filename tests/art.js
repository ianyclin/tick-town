// 美術：整個遊戲不出現現成的 emoji（字串表、畫面上的字都不行）、圖示和插畫都載得出來、鐘的漸層有畫出來（不是透明的）
const { chromium } = require('playwright');
const fs = require('fs');
let fails = 0; const ok = (c, m) => { console.log((c ? 'PASS ' : 'FAIL ') + m); if (!c) fails++; };
const URL = 'http://localhost:8124/index.html';
const EMO = /\p{Extended_Pictographic}/u, OKCH = /[©®™↔↕→←↑↓✓✕×]/u;   // 箭頭、勾、叉是字，不算 emoji
const emoIn = t => [...t].filter(ch => EMO.test(ch) && !OKCH.test(ch));
(async () => {
  // 原始檔：除了註解以外不該有 emoji
  const src = fs.readFileSync(__dirname + '/../index.html', 'utf8').split('\n').map(l => l.replace(/\/\/.*$/, '').replace(/\/\*.*?\*\//g, '').replace(/<!--.*?-->/g, '')).join('\n');
  const bad = [...new Set(emoIn(src))]; ok(bad.length === 0, `index.html 沒有 emoji${bad.length ? '：' + bad.join(' ') : ''}`);
  const b = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium', args: ['--no-sandbox'] });
  for (const lang of ['zh-Hant', 'en', 'ja', 'ko', 'es']) {
    const p = await (await b.newContext({ viewport: { width: 390, height: 844 } })).newPage(); const errs = []; p.on('pageerror', e => errs.push(e.message));
    const failed = []; p.on('requestfailed', r => failed.push(r.url())); p.on('response', r => { if (r.status() >= 400) failed.push(r.url()); });
    await p.addInitScript(`localStorage.setItem('tick-town-v1', JSON.stringify({ tut: true, hinted: true, set: { lang: '${lang}', sound: false, music: false, level: 3 }, pet: { kind: 'owl', acorn: 99, fed: 120, wear: { head: 'hat', face: 'glasses', neck: 'scarf' } }, daily: { badges: 20 }, best: { days: 20, reads: 9, matches: 9, vs: 9, shops: 9 } }));`);
    await p.goto(URL); await p.waitForTimeout(2100);
    const check = async where => {
      const r = await p.evaluate(() => { const vis = e => !!(e.offsetWidth || e.offsetHeight); return { text: [...document.querySelectorAll('.screen:not([hidden]), .overlay:not([hidden]), #toast:not([hidden])')].map(e => e.innerText).join('\n'), broken: [...document.querySelectorAll('img')].filter(i => vis(i) && !(i.complete && i.naturalWidth > 0)).map(i => i.src.slice(0, 60)), imgs: [...document.querySelectorAll('img')].filter(vis).length }; });
      const e = [...new Set(emoIn(r.text))]; ok(e.length === 0, `${lang} ${where}：畫面上沒有 emoji${e.length ? '：' + e.join(' ') : ''}`);
      ok(r.broken.length === 0, `${lang} ${where}：${r.imgs} 張圖都載得出來${r.broken.length ? '，壞的：' + r.broken.join(' ') : ''}`);
    };
    await check('主選單');
    // 鐘的漸層：鐘面中間偏右上的一點應該是奶油色（漸層失效會變透明，露出後面的天空或草地）
    const face = await p.evaluate(() => { const c = document.querySelector('#clock svg circle[fill="url(#ckFace)"]'); return c ? getComputedStyle(c).fill : ''; }); ok(/ckFace/.test(face) && await p.evaluate(() => !!document.querySelector('#ck-defs #ckFace')), `${lang} 鐘面的漸層在（${face.slice(0, 30)}）`);
    // 軟陶插畫有用上：針尖的烏龜和兔子、主選單鈕的圖示、小鎮的圖都是 assets/clay/ 的檔案
    ok(await p.evaluate(() => !!document.querySelector('#clock image[href*="clay/turtle"]') && !!document.querySelector('#clock image[href*="clay/rabbithead"]')), `${lang} 針尖是軟陶的烏龜和兔子`);
    ok(await p.evaluate(() => [...document.querySelectorAll('#modes img.ic')].every(i => /assets\/clay\//.test(i.getAttribute('src')))), `${lang} 主選單鈕的圖示是軟陶插畫`);
    for (const m of ['day', 'read', 'match', 'shop']) { await p.click(`[data-mode=${m}]`); await p.waitForTimeout(350); await check(m); await p.click(`#s-${m} [data-home]`); await p.waitForTimeout(250); }
    await p.click('[data-mode=versus]'); await p.waitForTimeout(200); await check('雙人選單'); await p.click('#vs-start'); await p.waitForTimeout(300); await check('雙人'); await p.click('#s-versus [data-home]'); await p.waitForTimeout(250);
    await p.click('#go-map'); await p.waitForTimeout(250); await check('星圖'); await p.click('#s-map [data-home]');
    await p.click('#go-quest'); await p.waitForTimeout(200); await check('今日任務'); await p.click('#quest-close');
    await p.click('#go-pet'); await p.waitForTimeout(400); await check('寵物'); ok(await p.evaluate(() => { const g = [...document.querySelectorAll('#pet-stage image')].map(i => i.getAttribute('href')); return g.some(h => /pet-owl-/.test(h)) && g.filter(h => /\/g-/.test(h)).length === 3; }), `${lang} 寵物是軟陶插畫、戴著三樣配件`); await p.click('#s-pet [data-home]');
    await p.click('#go-set'); await p.waitForTimeout(200); await check('設定'); await p.click('#go-report'); await p.waitForTimeout(200); await check('學習報告'); await p.click('#rep-close'); await p.click('#go-help'); await p.waitForTimeout(200); await check('遊戲說明'); await p.click('#help-close'); await p.click('#go-about'); await p.waitForTimeout(200); await check('關於'); await p.click('#about-close'); await p.click('#go-tut'); await p.waitForTimeout(500); await check('教學');
    // 小鎮：要用的圖都載入了（太陽、房子、鐘樓、動物）
    const spr = await p.evaluate(() => window.__tt.Town.img()); ok(['tower', 'house-0', 'house-5', 'sun'].every(k => spr.includes(k)), `${lang} 小鎮的圖：${spr.length} 張（${spr.slice(0, 6).join('、')}…）`);
    ok(failed.length === 0, `${lang} 沒有載不到的檔案${failed.length ? '：' + failed.slice(0, 3).join(' ') : ''}`);
    ok(errs.length === 0, `${lang} 無錯誤 ${errs.join(' | ')}`); await p.context().close();
  }
  await b.close(); console.log(fails ? `${fails} FAIL` : 'ALL PASS'); process.exit(fails ? 1 : 0);
})();
