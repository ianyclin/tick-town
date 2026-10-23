# 滴答小鎮（tick-town）

給小一到小三練「看時鐘、撥時鐘、算時間」的遊戲。跟九九流星隊（`ianyclin/jiujiu-game`）同一套做法：孩子只覺得在玩，遊戲在背後追蹤「哪一種錯」、多出會誘發那種錯的時刻。設計文件在 `docs/DESIGN.md`（先讀第 0 節「給孩子的設計原則」）。

## 現況

- 單檔 `index.html`（HTML + CSS + JS），無建置步驟，開檔即玩。**不連任何外部網域**。字型自行託管在 `assets/fonts/`（Lilita One 數字、Chiron GoRound TC 中英、Zen Maru Gothic 日文，OFL；`tools/make-fonts.py` 從 Google Fonts 的 GitHub 倉庫切子集，**改了介面文字要重跑**）。字型檔還沒切之前用系統字型 fallback。
- 網頁版**全部免費**（已定案）。App 版（之後用 Capacitor 包）才有解鎖，規則照九九流星隊：免費的部分永遠夠玩，付費只解鎖額外玩法，購買在家長關卡後面，孩子看得到的文字不提價錢、不叫孩子去找大人買。
- 存檔 `localStorage` key `tick-town-v1`（多人時 `tick-town-v1:<id>`，`tick-town-who`）。
- 三語：繁體中文（預設、台灣用語、不得出現簡體字）、英文（美國小一到小三）、日文（小一到小三，漢字以三年級前學過的為主，其他用假名）。文字全部在 `STR[語言][key]`，`tx(key, 參數)` 取；HTML 用 `data-t`／`data-th`／`data-ta` 標 key，`applyStr()` 填。`STR` 的 `ja` 區塊必須是 `\n  ja: {` 開頭、`\n  },` 結尾（切字腳本靠這個找）。

## 兒童 app 硬限制（從第一天就遵守）

- 不放第三方廣告、追蹤、分析 SDK；不收集任何個資；資料只存本機。
- 外部連結與購買前要有家長關卡（混合運算 `a + b × c`；不可逆的操作用 `a + b × c − d × e`；答錯換題、連錯 3 次關掉 30 秒）。
- 孩子看得到的文字：沒有倒數壓力、沒有「失敗」、沒有催孩子回來（不寫「明天再來」）、沒有價錢。
- 任何視覺效果尊重 `prefers-reduced-motion`（`RM`）。
- 觸控目標 ≥ 44px；指針把手 ≥ 56px。
- 按鈕綁 `pointerdown`＋`click`，click 只處理鍵盤／輔助工具（`kbClick(e)`，同九九）。

## 給孩子的設計原則（摘要，細節在 docs/DESIGN.md）

1. 先有故事再有題目：是小鎮的動物有事要做，不是「撥到 3:45」。
2. 圖多字少：等級 1 幾乎不用認字。
3. 用手撥，不用打字：指針末端有大把手，每 5 分「咔」一聲吸附。
4. **時針是烏龜（短、慢、藍），分針是兔子（長、快、紅）**，針尖有小臉。拖兔子時烏龜跟著慢慢走。
5. 先玩再考：主選單就是一座可以隨便撥的鐘，小鎮跟著時刻變。
6. 沒有倒數、沒有扣血；錯了動物只是歪頭「咦？」。
7. 進度看得見：答對點亮小鎮的燈。
8. 追蹤「哪一種錯」（`ERRS`：hourLate／minIndex／handSwap／halfHour／minOne／carry／ampm／read12），提示動畫對症下藥。

## 架構（index.html）

1. `<style>`：`:root` tokens（白天小鎮：天空淡藍到米白、暖色屋頂、鐘面米白、時針藍、分針紅、強調橘黃）。
2. HTML：`.screen` 用 `hidden` 切換：`#s-menu`（自由玩的鐘＋小鎮＋模式鈕）、之後 `#s-day`（小鎮的一天）、`#s-read`、`#s-match`、`#s-versus`、`#s-map`；overlay 卡片照九九的關閉規則（看資料的卡右上 ✕；要做決定的卡底部按鈕）。
3. JS（IIFE）：
   - `STR`／`tx`／`applyStr`／`setLang`。
   - **鐘面元件** `Clock(el, opts)`：SVG 200×200 viewBox；`set(h, m)`、`get()`、`onChange`、`snap`（5 或 1 分）、`drag`（可不可以拖）。拖分針：用連續角度累計（跨 12 會進位小時），時針同步；拖時針：吸附到半點，分針跟著 0／30。`snapTick` 每吸附一格 `SFX.tick()`，整點 `SFX.bell()`。
   - **小鎮** `Town`：canvas 畫天空、太陽／月亮、遠山、房子、路燈、動物；`Town.set(minutesOfDay)`。
   - `SFX`：Web Audio 合成（tick、bell、ding、wrong、fan）。
   - 存檔 `DB = { facts, errs, best, set:{ lang, music, sound, level, timer }, daily, pet, retest, town }`，`save()`；載入用 `Object.assign(fresh(), …)` 補欄位並消毒。
   - 題目鍵 `s:h:m`（撥鐘）、`r:h:m`（讀鐘）、`e:…`（經過時間）；`record(k, ok, ms, errType)`。

## 開發慣例

- 改規則同一次 commit 更新遊戲說明（`help.*`）。說明要 ELI5。
- 存檔向下相容。
- commit 訊息用繁體中文，一句話說清楚改了什麼。
- 三種語言版面要一樣（320×568 到 1920×1080）。
- 測試用 Playwright（chromium 在 `/opt/pw-browsers/chromium`，`NODE_PATH=/opt/node-tools/node_modules:$(npm root -g)`），本機 `python3 -m http.server 8124`。
- 派 agent：試玩、截圖、量版面用 sonnet；批次跑腳本用 haiku；程式碼審查、破壞性測試用 opus。

## 進度

- [x] 設計文件
- [x] 鐘面元件（拖指針、吸附、烏龜兔子、時針跟著走）
- [x] 自由玩的鐘＋會跟著變的小鎮（主選單）
- [ ] 小鎮的一天（撥鐘任務、錯誤類型判定、提示動畫）
- [ ] 幾點了、鐘面星圖、每日任務
- [ ] 配對、兩個人一起、寵物、三語校對、字型、App 版、商店文案
