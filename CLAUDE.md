# 滴答小鎮（tick-town）

給小一到小三練「看時鐘、撥時鐘、算時間」的遊戲。跟九九流星隊（`ianyclin/jiujiu-game`）同一套做法：孩子只覺得在玩，遊戲在背後追蹤「哪一種錯」、多出會誘發那種錯的時刻。設計文件在 `docs/DESIGN.md`（先讀第 0 節「給孩子的設計原則」）。待辦與順序在 `ROADMAP.md`。

## 現況

- 單檔 `index.html`（HTML + CSS + JS），無建置步驟，開檔即玩。**不連任何外部網域**。字型自行託管在 `assets/fonts/`（Lilita One 數字、Chiron GoRound TC 中英韓西（它有韓文字，切子集時一起切進來）、Zen Maru Gothic 日文，OFL；`tools/make-fonts.py` 從 Google Fonts 的 GitHub 倉庫切子集，**改了介面文字要重跑**）。已切過一次；改字串後重跑 `python3 tools/make-fonts.py <來源目錄>`（來源 ttf 從 Google Fonts 的 GitHub 倉庫下載）。
- 網頁版**全部免費**（已定案）。App 版（之後用 Capacitor 包）才有解鎖，規則照九九流星隊：免費的部分永遠夠玩，付費只解鎖額外玩法，購買在家長關卡後面，孩子看得到的文字不提價錢、不叫孩子去找大人買。
- 存檔 `localStorage` key `tick-town-v1`（多人時 `tick-town-v1:<id>`，`tick-town-who`）。
- 五種語言：繁體中文（預設、台灣用語、不得出現簡體字）、英文（美國小一到小三）、日文（小一到小三，漢字以三年級前學過的為主，其他用假名）、韓文（孩子看的用親切的반말「시계를 맞춰 줘!」，給大人看的用존댓말；動物和寵物的名字都**以母音結尾**（곰돌이、토순이、다람쥐、부엉이、부리、다래、곰이），後面的「가／와」才不會錯，`tests/lang.js` 會檢查）、西班牙文（拉丁美洲通用、對孩子用 tú、對大人用 usted；時刻「la 1／las 3」靠 `timeWords` 給的 `{art}`，15 分「y cuarto」只有 `es` 有 `t.quarter`，時段放在後面「las 7 y 20 de la mañana」，自己一行時第一個字大寫）。時段和時刻怎麼排在 `timePhrase(w, menu)`。裝置語言照九九 `langAuto()` 依 `navigator.languages` 找第一個認得的，都不認得用英文。翻譯是 Claude 寫的，上架前請母語者看過。文字全部在 `STR[語言][key]`，`tx(key, 參數)` 取；HTML 用 `data-t`／`data-th`／`data-ta` 標 key，`applyStr()` 填。`STR` 的 `ja` 區塊必須是 `\n  ja: {` 開頭、`\n  },` 結尾（切字腳本靠這個找）。

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
   - **鐘面元件** `Clock(el, opts)`：SVG 200×200 viewBox；`set(h, m)`、`get()`、`onChange`、`snap`（5 或 1 分）、`drag`（可不可以拖）。拖分針：用連續角度累計（跨 12 會進位小時），時針同步；拖烏龜：**分針不動**，只換小時（吸附到「整點 + 原本的分鐘」，`hourSnap()`）。一次只認一根手指（`drag.id`，第二指不理，兩指同時按會把角度差算亂）；`lostpointercapture` 也當放手。`snapTick` 每吸附一格 `SFX.tick()`，整點 `SFX.bell()`。
   - **外圈** `setRing(on)`：鐘外面一圈 00～55（`.ring`，紅色小字），兔子指到（差 1.5 分以內）的數字亮 `.on`；開的時候 viewBox 從 `0 0 200 200` 放大到 `-19 -19 238 238`（鐘本身稍微變小），把手半徑 ×`RS` 放大回原本的像素。`countTo(m)` 開外圈時改成外圈數字一格一格亮 `.lit`（不另外疊字）。設定 `DB.set.ring`（預設 true，舊存檔沒有這欄當 true），`setRingAll()` 改全部的鐘；`Clock(el, { ring: false })` 的迷你鐘（配對、選等級卡）不在 `CLOCKS` 裡、不畫外圈。量把手大小要在兔子朝上時量（斜的時候外框會比較大）。
   - **教學** `Tut`（`#s-tut`、`clock6`）：全新的第一次打開（沒有存檔）先動手撥三下：兔子跑一圈（7:00 起，離開 50 分以上才算）→ 烏龜拖到 3 → 兔子拖到 6（半），最後三張大卡選「要練什麼」＝ `set.level`（全遊戲唯一決定難度的地方，設定頁同一個）。選了才存 `DB.tut = true`；沒選就關掉下次還是教學。有教學以前的舊存檔（`loadDB()` 的 `had`）當作看過；清除紀錄後也不再跳。「我會了」直接到選等級；設定頁「再看一次怎麼玩」`Tut.start(true)`（現在的等級先亮著）。鐘面為教學加了 `clock.only = 'm'／'h'`（只准拖一根，碰另一根呼叫 `onWrong` → 提醒「那是烏龜喔」並讓對的那根閃 `nudge()`）、`mark(n)` 圈出數字；手指 👆 用 CSS 變數 `--a0`／`--a1`／`--r` 沿著把手的路徑示範，孩子一拖就消失、放手沒做到 1.8 秒後再示範並出虛線（不說錯）。
   - **誰在玩**（照九九）：`WHO = { cur, list:[{id, name}] }` 存在 `tick-town-who`，最多 4 人；每個人一把存檔 `keyFor(id)`（第一個人 id 是空字串＝舊的 `tick-town-v1`，舊存檔自動變成第一個人；之後的人 `tick-town-v1:p…`）。語言、難度、外圈、聲音、紀錄、星圖、寵物、每日任務都跟著人。主選單的名字鈕 `#go-who` 只在有名字或兩個人以上才出現（一個孩子的家庭不多一顆鈕）；設定頁最上面「誰在玩」一定有。沒名字時先取名才能新增；新增的人先存一份 `tut:false`（沿用語言和聲音），`switchWho` 後跑教學選等級。上排放不下時 `fitTitle()` 先縮、再兩行、再把標題藏起來（`visibility:hidden`），名字鈕在 375px 以下只剩圖示。
   - **家長區**：備份紀錄（`#o-bk`，匯出不用關卡；匯入取代所有人，要難的家長關卡）、清除紀錄（只清目前這個人，名字留著）、刪除玩家（名字和存檔一起刪，`switchWho(next, true)` 不要先存回去；只有一個沒名字的人時不顯示）。備份格式照九九：`{ app:'tick-town', v:1, at, who, saves:{ key: 存檔 } }`，檔案 `tick-town-backup-日期.json` 或備份碼 `TTWN1:` + base64；`bkParse()` 檢查 app、id 格式、最多 4 人，前後多貼了字也讀得懂；`bkApply()` 寫完 `location.reload()`，期間 `bkFrozen` 擋住 `save()`。關於頁最後有獻詞 `about.ded`。
   - **三年級（等級 3）**：讀鐘每題先 `kind()` 抽種類：一般讀鐘、`h24`（鐘上 15:20，打 24 小時制，鍵 `a:H:m`；下午沒加 12／早上多加 12 → `ampm`，提示 `hint.ampm`／`hint.ampmAm`）、`dur`（旁邊寫出發時刻、鐘上是到的時刻，打分鐘數，鍵 `g:出發:分鐘`；跨整點時「只算分鐘相減／只算到整點／只算整點後」→ `carry`，差 1～4 → `minOne`）。權重 h24 = 1 + 3×`errs.ampm`、dur = 1 + 3×`errs.carry`，上一題同種 ×0.5；`Read.only(k)` 測試用。小鎮的一天等級 3 下午以後的事有 40～80% 寫成 24 小時制（`task.h24`，目標寫 15:20＋「24 小時制」），分鐘對、小時錯 → `ampm`、提示 `hint.ampmSet`。`classifySet` 差 1～4 分 → `minOne`，提示 `clock.countOne(m)` 從 5 的倍數開始小格一格一格亮（`.tk-lit`）。**時間線** `timeline(t1, t2)`：SVG，跨整點分兩段（橘：到整點、紅：剩下的），每段上面寫 +幾分，一段一段畫（`RM` 就直接出現）；用在讀鐘 dur 的提示與答對、小鎮的一天「走了幾分鐘」撥錯。打數字時的提示 `.bubble.over` 蓋在鍵盤上（不擠掉鐘），按「知道了」收起來；`fitRead()` 題目長時把鐘縮小到鍵盤放得下（最小 110px）。
   - **小鎮** `Town`：canvas 畫天空、太陽／月亮、遠山、房子、路燈、動物；`Town.set(minutesOfDay)`。
   - `SFX`：Web Audio 合成（tick、bell、ding、hm）；`DB.set.sound` 關掉就不出聲。**報時** `SFX.chime(n)`：鐘樓敲 n 下（0.62 秒一下），走自己的 `chimeBus` 才能 `chimeStop()` 中途停；只看 `DB.set.chime`（跟音效分開）。主選單放手停在整點才報時（拖的途中經過整點只 `bell()` 一聲；又開始拖、離開主選單、切到背景都停）；教學第 2 步烏龜到 3 敲 3 下；遊戲裡不報時（不打斷題目）。敲鐘時音樂 `duck`。
   - **音樂** `Music`（照九九，Web Audio 即時合成、沒有音檔）：`TRACKS` 三首，`town`（白天音樂盒 C–Am–F–G）、`night`（搖籃曲 F–Dm–B♭–C）、`play`（遊戲中 G–Em–C–D，輕拍子、每兩輪一次主旋律，不加速）。`show(name)` 換畫面時換歌：主選單看鐘上的時刻（`forTime`：6～19 點白天）、教學／星圖／寵物 `town`、其他遊戲 `play`；主選單拖鐘時 `showTime` 也跟著換。瀏覽器要先碰一下才能出聲：`pointerdown`／`keydown`（capture）時 `Music.start()`；`visibilitychange` 切背景停、回來再開。`DB.set.music` 預設開。
   - 存檔 `DB = { facts, errs, best, set:{ lang, music, sound, chime, level, timer, ring }, daily, pet, retest, town }`，`save()`；載入用 `Object.assign(fresh(), …)` 補欄位並消毒。
   - 題目鍵 `s:H:m`（撥鐘，H 是 24 小時）、`r:h:m`（讀鐘，12 小時）、`e:from:d`（走了幾分鐘，錯法 `carry`：忘了跨過整點）、`a:H:m`（24 小時制）、`g:from:d`（從幾點到幾點走了幾分）；載入時 `loadDB()` 逐欄位消毒（facts 只留這五種鍵且數字封頂、errs 只留 `ERRS`、daily.tasks 不合法就重抽、`set.lang` 要是 `STR` 自己的 key）；`record(k, ok, ms, errType)`：`facts[k]` 指數平滑，`errs[type]` 每答一題全部 ×0.85、犯的那一種 +0.15。
   - **小鎮的一天** `Day`：一天 7 件事（起床、早餐、上學、午餐、公園、晚餐、睡覺），時刻依等級（1 整點半點、2 五分、3 一分，等級 3 的公園、晚餐用「{t1} 出發走了 {d} 分鐘」問）。`makeDay()` 每件事在自己的時段裡加權挑時刻（`weight(t)`，同讀鐘的 `pick()`：1 + `facts[s:H:m].err×6` + 沒遇過 0.5 + 會誘發弱點錯法的時刻 +3×`errs[type]`；上一輪出過的 ×0.3；「走了幾分鐘」的題 (t, d) 一起挑，`errs.carry` 高就多出跨整點的）。鐘從上一件事的時刻開始；**放手時**跟目標比（**mod 720**，鐘面是 12 小時的），對了 `good()`（敲鐘、動物跳、亮一盞燈 `Town.lit`、1.5 秒後下一題），錯了**等 2 秒沒再拖**才 `judge()`（孩子常分兩次拖；同一個錯的答案只記一次 `S.lastA`，撥對後 `S.ok` 擋住再碰指針）：`classifySet(T, A)` 判錯法（hourLate／halfHour：小時多一、minIndex：7:20 把兔子放在 2、handSwap、minNear 差一格內、hourOff、other），顯示該類型的提示泡泡＋虛線指針 `clock.ghost(h, m)`，minIndex 再 `clock.countTo(m)` 從 12 開始一格一格標 5、10、15。沒有倒數、沒有次數限制；7 件做完 `#o-done` 放煙火。
   - **幾點了** `Read`：一輪 8 題。`pick()` 依等級列出所有時刻，權重 = 1 + 該題 `err×6` + 沒遇過 0.5 + 會誘發孩子弱點錯法的時刻（`errs.hourLate` 高 → 分鐘 ≥ 35、`minIndex` → 不是整點半點、`halfHour` → :30、`read12` → 12 點）各 +3×權重；最近 4 題 ×0.05。熟了（`facts[r:h:m].n ≥ 2 且 err < 0.2`）或等級 3 才用鍵盤 `#read-pad`（打 3～4 個數字，`720` → 7:20，要按「好了」），否則三張數字鐘卡 `options()`：正確＋兩張干擾（hourLate 小時 +1、halfHour、minIndex 7:20 → 7:04、handSwap、read12、minNear ±一格、hourOff），干擾的權重 1 + 4×`errs[type]`。選錯：卡片 `.no`、提示泡泡（同 `hint.*`，minIndex 加 `countTo`）、只記一次錯，可以再選；選對 `.yes`、0.9 秒下一題（`q.done` 擋住連按「好了」或答對後再點錯卡）。打數字的錯法另外判 minIndex（7:20 打成 7:04）、read12，其他用 `classifySet`。等級 1 的干擾卡只出整點半點。讀鐘的鍵是 12 小時 `r:h:m`（上下午鐘面看不出來，小鎮的太陽只是氣氛）。`inducible(h, m)` 列出這個時刻可能誘發的錯法：答對只衰減這幾種的 `errs`（×0.85），答錯只加犯的那一種（×0.85 + 0.15），弱點才不會被無關的題洗掉。

## 開發慣例

- 改規則同一次 commit 更新遊戲說明（`help.*`）。說明要 ELI5。
- 存檔向下相容。
- commit 訊息用繁體中文，一句話說清楚改了什麼。
- 五種語言版面要一樣（320×568 到 1920×1080；`tests/layout.js` 量 9 種尺寸 × 五語；`tests/lang.js` 查字串表齊全、時刻說法、裝置語言；教學另外在 `tests/tut.js` 量 6 種）：標題 `h1` 一行、放不下就縮（`flex:1;min-width:0`，右邊的 chip 與圖示鈕 `flex:none`，不然會被推出畫面；`fitTitle()` 一次縮 1px 到 11px，還放不下（320px 寬的英、日文）才用 `title2` 折成兩行；≤ 400px 寬上排的間距縮小）；矮螢幕（≤ 620px）主選單那行提示藏起來；讀鐘打數字時鐘縮小（`.clock-wrap.small`，≤ 640px 高再縮到 22vh）、鍵盤不透明；雙人把手 `knob: 28`（鐘比較小）、中線的返回鈕 44px 不折行、toast 放中線上面（`.toast.mid`）；日文 `word-break:keep-all`（在空格處斷行，不在詞中間）；虛線指針是珊瑚色加白底線（細灰線孩子看不到）。
- 測試用 Playwright（chromium 在 `/opt/pw-browsers/chromium`，`NODE_PATH=/opt/node-tools/node_modules:$(npm root -g)`），本機 `python3 -m http.server 8124`。
- 派 agent：試玩、截圖、量版面用 sonnet；批次跑腳本用 haiku；程式碼審查、破壞性測試用 opus。

## 進度

- [x] 設計文件
- [x] 鐘面元件（拖指針、吸附、烏龜兔子、時針跟著走）
- [x] 自由玩的鐘＋會跟著變的小鎮（主選單）
- [x] 小鎮的一天（撥鐘任務、錯誤類型判定、提示動畫）— 出題依 `DB.errs` 偏向會誘發弱點的時刻
- [x] 幾點了（讀鐘：三張卡／打數字、依錯法加權的干擾選項、出題偏向弱點）
- [x] 鐘面星圖（`Map`：12 片 × 12 圈，點一片看那幾分 1～12 點的狀態，說明框寫最常搞混的錯法）
- [x] 每日任務（`Quest`：每天從 day／read／set／star 四種抽 3 個，全完成徽章 +1、連續天數；主選單 📋 chip）
- [x] 家長關卡 `Gate.open(fn, hard)` 與設定家長區「清除所有紀錄」（語言留著）
- [x] 配對（`Match`：4 對 8 張，指針／數字／文字兩兩不同樣子；一半機會放一對容易搞混的；配錯時若一張是指針鐘且錯法看得出來才記讀錯＋提示，兩張都不是指針只是記性不記）
- [x] 兩個人一起（`Versus`：上下分割各撥各的鐘，先撥對拿一分、5 分贏；機器人想的時間跟著孩子最近 4 次撥對的時間 ×1.1、夾 3～12 秒、落後 ×1.3／領先 ×0.8，鐘面會慢慢轉到答案；另一個人時上半旋轉 180°、可選大人加難（1 分）；只記小隊長那邊）
- [x] 遊戲說明（`#o-help`，從設定開、✕ 回設定）、關於頁（`#o-about`：練什麼、三個等級、隱私、製作、字型授權；版本號寫在 `about.made`）
- [x] 字型切子集（`assets/fonts/`，約 600 KB）
- [x] 寵物（`Pet`：住在鐘樓的貓頭鷹／松鼠／小熊，橡果 `pet.acorn` 答對 +1、任務單項 +10、全完成 +30，餵 10 顆、`PET_STAGES` 30／100／250／500；配件 `GEAR` 依徽章門檻、`wear.{head,face,neck}`；圖在 `assets/pets/{kind}-{st}.png`（ChatGPT 生成、`tools/cut-pets.py` 切）與 `assets/gear/{id}.png`（`tools/cut-gear.py`，一列六樣）；`PET_HEAD[kind][st] = [hx, hy, hr, top, ny]`、`PET_FACE[kind][st] = {ex, ey, ew, hb, hw}` 用 `tools/pet-sheet.cjs <png> [glasses,hat,scarf]` 的格線圖目測；`PET_IMG` 偵測不到圖時退回 emoji）
- [x] 教學（`Tut`：第一次打開動手撥三下、選要練什麼；設定可再看）
- [x] 鐘面外圈（`setRing`：00～55、兔子指到的亮、提示一格一格亮；設定可關）
- [x] 韓文、西班牙文（`STR.ko`／`STR.es`，`timePhrase`）
- [x] 三年級內容（24 小時制、走了幾分鐘、時間線提示、1 分的小格；`tests/grade3.js`）
- [x] 誰在玩（最多 4 人）、備份紀錄、家長區（備份／清除／刪除玩家）、獻詞（`tests/who.js`）
- [x] 音樂、報時（`Music` 三首、`SFX.chime`；設定頁音樂／音效／報時三個開關；`tests/sound.js`）
- [ ] 其餘待辦與順序見 `ROADMAP.md`（插畫、新玩法、App 版）
