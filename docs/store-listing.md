# 商店文案與上架填寫表（滴答小鎮）

> 本檔由 `tools/make-listing.py` 從 `store/listing.json` 產生，**要改文案請改 JSON 再重跑**。英、日、韓、西文是 Claude 寫的，**上架前請母語者看過**。
> 字數都是「字元數」，已用腳本檢查過 Apple 與 Google 的上限（名稱 30、副標 30、宣傳文字 170、簡短說明 80、關鍵字 100、說明 4000）。上限以後台當下顯示為準。

## 一、各語言文案

每種語言在 App Store Connect 各填一次：名稱、副標題、隱私權政策網址（「App 資訊」頁）、宣傳文字、描述、關鍵字、支援網址、截圖。
完整說明分 **Apple 版**和 **Google 版**，只差付款那句的商店名稱（Apple 2.3.10：商店資料不能出現別的商店的名字）。

### 繁體中文（zh-Hant／台灣）

| 欄位 | 字數／上限 | 內容 |
|---|---|---|
| 名稱（Apple Name／Google 標題） | 10／30 | 滴答小鎮：看時鐘練習 |
| 副標題（Apple Subtitle） | 12／30 | 幫小鎮動物撥鐘，練看時間 |
| 宣傳文字（Apple Promotional Text） | 46／170 | 幫小鎮的動物撥時鐘、讀時鐘、算時間。錯的時刻會多練幾次。沒有廣告、不用網路、不收集任何資料。 |
| 簡短說明（Google Short description） | 29／80 | 幫小鎮的動物撥時鐘、讀時鐘、算時間。沒有廣告，也不用網路。 |
| 關鍵字（Apple Keywords） | 59／100 | 時鐘,看時鐘,認識時鐘,時間,幾點幾分,24小時制,經過時間,小學,國小,一年級,二年級,三年級,數學遊戲,兒童,親子 |
| 新功能（What's New） | 58／4000 | 第一版：小鎮的一天、幾點了、配對、修鐘店、兩個人一起；三年級的 24 小時制與經過時間；給家長的學習報告；五種語言。 |
| 隱私權政策網址 | | `https://tick-town.sanbaofang.com/privacy/` |
| 支援網址 | | `https://tick-town.sanbaofang.com/support/` |

**完整說明：Apple 版（App Store Connect）**（1015／4000）

```text
滴答小鎮是給小學一到三年級練「看時鐘、撥時鐘、算時間」的遊戲。孩子只覺得在幫小鎮的動物做事，遊戲在背後記下「哪一種錯」，多出會那樣錯的時刻。

【時針是烏龜，分針是兔子】
短短慢慢的時針是烏龜，長長快快的分針是兔子。用手拖兔子，烏龜會跟著慢慢走，孩子親眼看到「3 點半的時候，時針在 3 和 4 中間」。鐘外面有一圈 05、10、15… 的分鐘數字（可以關掉）。

【玩法】（小鎮的一天、幾點了免費；App 版另外三種各可免費試玩 3 次）
● 小鎮的一天：動物一天有 7 件事要做，幫牠把鐘撥好，牠就出門、家裡的燈亮起來。
● 幾點了？：看鐘選出正確的時刻，熟了改成自己打數字。
● 配對：指針鐘、數字鐘、文字翻牌配對。
● 修鐘店：鐘上的標籤對不對？錯的標籤專挑孩子常犯的錯。
● 兩個人一起：上下兩個鐘，比誰先撥對；也可以跟機器人比。

【三個等級】
● 整點、半點（約一年級）
● 幾點幾分（約二年級，5 分一格）
● 過了多久（約三年級，1 分一格、24 小時制、從幾點到幾點走了幾分鐘）

【錯了也不怕】
沒有倒數、沒有扣血。撥錯時，動物只是歪頭「咦？」，虛線指針告訴你正確的位置；常把 2:50 看成 3:50 的孩子，遊戲會多出 x:50、x:55 的時刻，提示也會對症下藥（例如「烏龜還沒走到 3 喔」、跨過整點時畫一條時間線）。

【越玩越熟】
● 星圖：每個時刻都有一顆星，讀對、撥對幾次就亮起來，一眼看出哪裡還不熟。
● 每日任務、徽章、養寵物；每玩完一次，小鎮就多一樣東西。
● 最多 4 個孩子各自有紀錄；可以備份、換裝置。

【給家長】
● 沒有廣告、沒有追蹤、不收集任何資料，紀錄只存在這台裝置。
● 不用網路也能玩。
● 學習報告（設定的家長區）：這 7 天練了多少、最常搞混的是哪幾種錯。
● 免費下載：小鎮的一天、幾點了、星圖、寵物、每日任務都免費；配對、修鐘店、兩個人一起各可試玩 3 次。想一直玩可以「一次購買」全部解鎖（不是訂閱，同一台裝置的每個孩子都能玩），同時會多出學習報告裡每一種錯的例子，以及在遊戲裡、在家可以怎麼練。付款由 App Store 處理。
● 購買、外部連結都在家長關卡後面；孩子看得到的畫面不提價錢。
● 繁體中文、English、日本語、한국어、Español。

隱私權政策：https://tick-town.sanbaofang.com/privacy/
```


**完整說明：Google 版（Play Console）**（1017／4000）

```text
滴答小鎮是給小學一到三年級練「看時鐘、撥時鐘、算時間」的遊戲。孩子只覺得在幫小鎮的動物做事，遊戲在背後記下「哪一種錯」，多出會那樣錯的時刻。

【時針是烏龜，分針是兔子】
短短慢慢的時針是烏龜，長長快快的分針是兔子。用手拖兔子，烏龜會跟著慢慢走，孩子親眼看到「3 點半的時候，時針在 3 和 4 中間」。鐘外面有一圈 05、10、15… 的分鐘數字（可以關掉）。

【玩法】（小鎮的一天、幾點了免費；App 版另外三種各可免費試玩 3 次）
● 小鎮的一天：動物一天有 7 件事要做，幫牠把鐘撥好，牠就出門、家裡的燈亮起來。
● 幾點了？：看鐘選出正確的時刻，熟了改成自己打數字。
● 配對：指針鐘、數字鐘、文字翻牌配對。
● 修鐘店：鐘上的標籤對不對？錯的標籤專挑孩子常犯的錯。
● 兩個人一起：上下兩個鐘，比誰先撥對；也可以跟機器人比。

【三個等級】
● 整點、半點（約一年級）
● 幾點幾分（約二年級，5 分一格）
● 過了多久（約三年級，1 分一格、24 小時制、從幾點到幾點走了幾分鐘）

【錯了也不怕】
沒有倒數、沒有扣血。撥錯時，動物只是歪頭「咦？」，虛線指針告訴你正確的位置；常把 2:50 看成 3:50 的孩子，遊戲會多出 x:50、x:55 的時刻，提示也會對症下藥（例如「烏龜還沒走到 3 喔」、跨過整點時畫一條時間線）。

【越玩越熟】
● 星圖：每個時刻都有一顆星，讀對、撥對幾次就亮起來，一眼看出哪裡還不熟。
● 每日任務、徽章、養寵物；每玩完一次，小鎮就多一樣東西。
● 最多 4 個孩子各自有紀錄；可以備份、換裝置。

【給家長】
● 沒有廣告、沒有追蹤、不收集任何資料，紀錄只存在這台裝置。
● 不用網路也能玩。
● 學習報告（設定的家長區）：這 7 天練了多少、最常搞混的是哪幾種錯。
● 免費下載：小鎮的一天、幾點了、星圖、寵物、每日任務都免費；配對、修鐘店、兩個人一起各可試玩 3 次。想一直玩可以「一次購買」全部解鎖（不是訂閱，同一台裝置的每個孩子都能玩），同時會多出學習報告裡每一種錯的例子，以及在遊戲裡、在家可以怎麼練。付款由 Google Play 處理。
● 購買、外部連結都在家長關卡後面；孩子看得到的畫面不提價錢。
● 繁體中文、English、日本語、한국어、Español。

隱私權政策：https://tick-town.sanbaofang.com/privacy/
```

### English（en-US）

| 欄位 | 字數／上限 | 內容 |
|---|---|---|
| 名稱（Apple Name／Google 標題） | 28／30 | Tick-Tock Town: Telling Time |
| 副標題（Apple Subtitle） | 28／30 | Help town animals set clocks |
| 宣傳文字（Apple Promotional Text） | 129／170 | Help the town animals set, read and work out the time. Tricky times come back more often. No ads, no internet, no data collected. |
| 簡短說明（Google Short description） | 70／80 | Help the town animals set and read clocks. No ads, no internet needed. |
| 關鍵字（Apple Keywords） | 97／100 | clock,analog clock,hour,minute,24-hour,elapsed time,math,kids,1st grade,2nd grade,3rd grade,learn |
| 新功能（What's New） | 164／4000 | First release: Town Day, What time?, Match, Fix-it Shop and Two players; 24-hour time and elapsed time for 3rd grade; a progress report for parents; five languages. |
| 隱私權政策網址 | | `https://tick-town.sanbaofang.com/privacy/en.html` |
| 支援網址 | | `https://tick-town.sanbaofang.com/support/` |

**完整說明：Apple 版（App Store Connect）**（2739／4000）

```text
Tick-Tock Town is a game for children in grades 1–3 to practice reading clocks, setting clocks and working out elapsed time. Kids just feel like they are helping the town animals, while the game quietly tracks which kind of mistake happens and shows more of the times that trigger it.

TORTOISE IS THE HOUR HAND, RABBIT IS THE MINUTE HAND
The short, slow hand is Tortoise; the long, fast hand is Rabbit. Drag Rabbit and Tortoise follows slowly, so kids see for themselves that at half past 3 the hour hand sits between 3 and 4. A ring of 05, 10, 15… around the clock shows the minutes (you can turn it off).

GAMES (Town Day and What time? are free; in the app, the other three can each be tried 3 times)
• Town Day: the animals have 7 things to do. Set the clock and they head out, and their house lights up.
• What time?: read the clock and pick the right time; times you know well switch to typing.
• Match: flip cards and match clocks, digital times and words.
• Fix-it Shop: is the clock's tag right? Wrong tags are picked from your child's typical mistakes.
• Two players: two clocks, first to set it right wins a point; play a friend or the robot.

THREE LEVELS
• O'clock and half past (about 1st grade)
• Hours and minutes (about 2nd grade, 5-minute steps)
• How long? (about 3rd grade, 1-minute steps, 24-hour time, minutes from one time to another)

MISTAKES ARE OK
No timers, no lives. A wrong answer just makes the animal tilt its head, and dotted hands show the right spot. If your child keeps reading 2:50 as 3:50, more x:50 and x:55 times appear, with hints aimed at that mistake ("Tortoise hasn't reached 3 yet!", or a timeline when the time passes the hour).

KEEP GETTING BETTER
• Star map: every time has a star that lights up after a few right answers.
• Daily missions, badges and a pet; the town grows a little after every game.
• Up to 4 children with their own records; backup and move to a new device.

FOR PARENTS
• No ads, no tracking, no data collected. Records stay on this device.
• Works offline.
• Progress report (For grown-ups, in Settings): how much your child practiced in the last 7 days and which mix-ups come up most.
• Free to download: Town Day, What time?, the star map, the pet and daily missions are free. Match, Fix-it Shop and Two players can each be tried 3 times. One purchase unlocks everything for good (not a subscription; every child on the device can play), and also adds an example of each mix-up to the progress report, with what to try in the game and at home. Payment is handled by the App Store.
• Purchases and external links are behind a parent gate; children never see prices.
• 繁體中文, English, 日本語, 한국어, Español.

Privacy policy: https://tick-town.sanbaofang.com/privacy/en.html
```


**完整說明：Google 版（Play Console）**（2737／4000）

```text
Tick-Tock Town is a game for children in grades 1–3 to practice reading clocks, setting clocks and working out elapsed time. Kids just feel like they are helping the town animals, while the game quietly tracks which kind of mistake happens and shows more of the times that trigger it.

TORTOISE IS THE HOUR HAND, RABBIT IS THE MINUTE HAND
The short, slow hand is Tortoise; the long, fast hand is Rabbit. Drag Rabbit and Tortoise follows slowly, so kids see for themselves that at half past 3 the hour hand sits between 3 and 4. A ring of 05, 10, 15… around the clock shows the minutes (you can turn it off).

GAMES (Town Day and What time? are free; in the app, the other three can each be tried 3 times)
• Town Day: the animals have 7 things to do. Set the clock and they head out, and their house lights up.
• What time?: read the clock and pick the right time; times you know well switch to typing.
• Match: flip cards and match clocks, digital times and words.
• Fix-it Shop: is the clock's tag right? Wrong tags are picked from your child's typical mistakes.
• Two players: two clocks, first to set it right wins a point; play a friend or the robot.

THREE LEVELS
• O'clock and half past (about 1st grade)
• Hours and minutes (about 2nd grade, 5-minute steps)
• How long? (about 3rd grade, 1-minute steps, 24-hour time, minutes from one time to another)

MISTAKES ARE OK
No timers, no lives. A wrong answer just makes the animal tilt its head, and dotted hands show the right spot. If your child keeps reading 2:50 as 3:50, more x:50 and x:55 times appear, with hints aimed at that mistake ("Tortoise hasn't reached 3 yet!", or a timeline when the time passes the hour).

KEEP GETTING BETTER
• Star map: every time has a star that lights up after a few right answers.
• Daily missions, badges and a pet; the town grows a little after every game.
• Up to 4 children with their own records; backup and move to a new device.

FOR PARENTS
• No ads, no tracking, no data collected. Records stay on this device.
• Works offline.
• Progress report (For grown-ups, in Settings): how much your child practiced in the last 7 days and which mix-ups come up most.
• Free to download: Town Day, What time?, the star map, the pet and daily missions are free. Match, Fix-it Shop and Two players can each be tried 3 times. One purchase unlocks everything for good (not a subscription; every child on the device can play), and also adds an example of each mix-up to the progress report, with what to try in the game and at home. Payment is handled by Google Play.
• Purchases and external links are behind a parent gate; children never see prices.
• 繁體中文, English, 日本語, 한국어, Español.

Privacy policy: https://tick-town.sanbaofang.com/privacy/en.html
```

### 日本語（ja）

| 欄位 | 字數／上限 | 內容 |
|---|---|---|
| 名稱（Apple Name／Google 標題） | 17／30 | チクタクタウン：とけいのれんしゅう |
| 副標題（Apple Subtitle） | 20／30 | まちの どうぶつと とけいを あわせよう |
| 宣傳文字（Apple Promotional Text） | 68／170 | まちの動物のために、時計を合わせたり読んだり、時間を計算したり。まちがえやすい時刻は多めに出ます。広告なし・ネット不要・データ収集なし。 |
| 簡短說明（Google Short description） | 35／80 | まちの動物と時計を合わせて、読んで、時間を計算。広告なし・ネット不要。 |
| 關鍵字（Apple Keywords） | 59／100 | 時計,とけい,時計の読み方,時刻,何時何分,24時間制,時間の計算,小学生,1年生,2年生,3年生,算数,知育,子ども |
| 新功能（What's New） | 78／4000 | はじめての リリース：まちの一日、いま何時？、ペアさがし、とけいやさん、ふたりで。3年生の 24時間制と 時間の計算、保護者向けの 学習レポート、5か国語。 |
| 隱私權政策網址 | | `https://tick-town.sanbaofang.com/privacy/ja.html` |
| 支援網址 | | `https://tick-town.sanbaofang.com/support/` |

**完整說明：Apple 版（App Store Connect）**（1267／4000）

```text
チクタクタウンは、小学1～3年生が時計の読み方・合わせ方・時間の計算を練習するゲームです。子どもは、まちの動物のお手伝いをしているだけ。その裏で、ゲームは「どんなまちがいが多いか」を記録し、そのまちがいが起きやすい時刻を多めに出します。

【短い針はかめ、長い針はうさぎ】
ゆっくり動く短い針はかめ、速く動く長い針はうさぎ。うさぎを指で動かすと、かめもゆっくりついてきます。「3時半のとき、短い針は3と4の間」が目で見てわかります。時計の外側には 05、10、15… の分の数字（消すこともできます）。

【あそびかた】（まちの一日・いま何時？は無料。アプリ版のほかの3つは各3回お試しできます）
● まちの一日：動物たちの1日7つの予定。時計を合わせると出かけて、家の明かりがつきます。
● いま何時？：時計を見て正しい時刻を選びます。慣れたら数字で入力。
● ペアさがし：アナログ時計、デジタル時計、文字でペアを作ります。
● とけいやさん：時計の札は合っている？ まちがった札は、お子さまがよくするまちがいから選ばれます。
● ふたりで：上下に2つの時計。先に合わせたほうが1点。ロボットとも対戦できます。

【3つのレベル】
● 何時・何時半（1年生くらい）
● 何時何分（2年生くらい、5分きざみ）
● たった時間（3年生くらい、1分きざみ・24時間制・何時から何時まで何分）

【まちがえても大丈夫】
タイマーもライフもありません。まちがえると動物が首をかしげ、点線の針が正しい位置を教えます。2:50 を 3:50 と読みがちなら x:50、x:55 の時刻が増え、ヒントもそのまちがいに合わせて出ます。

【続けるほど上手に】
● 星マップ：時刻ごとに星があり、何度か正解すると光ります。
● 毎日のミッション、バッジ、ペット。遊ぶたびにまちが少しずつ大きくなります。
● 最大4人まで記録を分けられます。バックアップで機種変更も。

【保護者の方へ】
● 広告・トラッキングなし、データを収集しません。記録は端末の中だけ。
● オフラインで遊べます。
● 学習レポート（設定の「おうちの人へ」）：この7日間の練習量と、よくある間違いの種類がわかります。
● 無料でダウンロード：まちの一日、いま何時？、星マップ、ペット、毎日のミッションは無料。ペアさがし、とけいやさん、ふたりでは それぞれ3回 お試しできます。1回の購入ですべてアンロック（サブスクリプションではありません。この端末のすべての子どもが遊べます）。学習レポートに、間違いごとの例と、ゲームやおうちでの練習方法も表示されるようになります。お支払いは App Store で行われます。
● 購入と外部リンクは保護者向けの確認問題の後ろ。子どもに価格は表示されません。
● 繁體中文・English・日本語・한국어・Español。

プライバシーポリシー：https://tick-town.sanbaofang.com/privacy/ja.html
```


**完整說明：Google 版（Play Console）**（1269／4000）

```text
チクタクタウンは、小学1～3年生が時計の読み方・合わせ方・時間の計算を練習するゲームです。子どもは、まちの動物のお手伝いをしているだけ。その裏で、ゲームは「どんなまちがいが多いか」を記録し、そのまちがいが起きやすい時刻を多めに出します。

【短い針はかめ、長い針はうさぎ】
ゆっくり動く短い針はかめ、速く動く長い針はうさぎ。うさぎを指で動かすと、かめもゆっくりついてきます。「3時半のとき、短い針は3と4の間」が目で見てわかります。時計の外側には 05、10、15… の分の数字（消すこともできます）。

【あそびかた】（まちの一日・いま何時？は無料。アプリ版のほかの3つは各3回お試しできます）
● まちの一日：動物たちの1日7つの予定。時計を合わせると出かけて、家の明かりがつきます。
● いま何時？：時計を見て正しい時刻を選びます。慣れたら数字で入力。
● ペアさがし：アナログ時計、デジタル時計、文字でペアを作ります。
● とけいやさん：時計の札は合っている？ まちがった札は、お子さまがよくするまちがいから選ばれます。
● ふたりで：上下に2つの時計。先に合わせたほうが1点。ロボットとも対戦できます。

【3つのレベル】
● 何時・何時半（1年生くらい）
● 何時何分（2年生くらい、5分きざみ）
● たった時間（3年生くらい、1分きざみ・24時間制・何時から何時まで何分）

【まちがえても大丈夫】
タイマーもライフもありません。まちがえると動物が首をかしげ、点線の針が正しい位置を教えます。2:50 を 3:50 と読みがちなら x:50、x:55 の時刻が増え、ヒントもそのまちがいに合わせて出ます。

【続けるほど上手に】
● 星マップ：時刻ごとに星があり、何度か正解すると光ります。
● 毎日のミッション、バッジ、ペット。遊ぶたびにまちが少しずつ大きくなります。
● 最大4人まで記録を分けられます。バックアップで機種変更も。

【保護者の方へ】
● 広告・トラッキングなし、データを収集しません。記録は端末の中だけ。
● オフラインで遊べます。
● 学習レポート（設定の「おうちの人へ」）：この7日間の練習量と、よくある間違いの種類がわかります。
● 無料でダウンロード：まちの一日、いま何時？、星マップ、ペット、毎日のミッションは無料。ペアさがし、とけいやさん、ふたりでは それぞれ3回 お試しできます。1回の購入ですべてアンロック（サブスクリプションではありません。この端末のすべての子どもが遊べます）。学習レポートに、間違いごとの例と、ゲームやおうちでの練習方法も表示されるようになります。お支払いは Google Play で行われます。
● 購入と外部リンクは保護者向けの確認問題の後ろ。子どもに価格は表示されません。
● 繁體中文・English・日本語・한국어・Español。

プライバシーポリシー：https://tick-town.sanbaofang.com/privacy/ja.html
```

### 한국어（ko）

| 欄位 | 字數／上限 | 內容 |
|---|---|---|
| 名稱（Apple Name／Google 標題） | 15／30 | 째깍 마을: 시계 보기 연습 |
| 副標題（Apple Subtitle） | 14／30 | 마을 동물들과 시계 맞추기 |
| 宣傳文字（Apple Promotional Text） | 87／170 | 마을 동물들을 위해 시계를 맞추고, 읽고, 지난 시간을 계산해요. 자주 헷갈리는 시각은 더 자주 나와요. 광고 없음, 인터넷 필요 없음, 데이터 수집 없음. |
| 簡短說明（Google Short description） | 38／80 | 마을 동물들과 시계를 맞추고 읽어요. 광고 없음, 인터넷 필요 없음. |
| 關鍵字（Apple Keywords） | 55／100 | 시계,시계보기,시각,몇시몇분,24시간제,지난시간,초등학생,1학년,2학년,3학년,수학게임,어린이,교육 |
| 新功能（What's New） | 85／4000 | 첫 버전: 마을의 하루, 몇 시야?, 짝 맞추기, 시계 수리점, 둘이서. 3학년용 24시간제와 지난 시간 계산, 부모님을 위한 학습 보고서, 5개 언어. |
| 隱私權政策網址 | | `https://tick-town.sanbaofang.com/privacy/ko.html` |
| 支援網址 | | `https://tick-town.sanbaofang.com/support/` |

**完整說明：Apple 版（App Store Connect）**（1386／4000）

```text
째깍 마을은 초등학교 1~3학년이 시계 읽기, 시계 맞추기, 지난 시간 계산을 연습하는 게임입니다. 아이는 마을 동물을 돕는다고만 느끼고, 게임은 뒤에서 '어떤 종류의 실수'를 하는지 기록해 그 실수가 나오기 쉬운 시각을 더 자주 냅니다.

【짧은바늘은 거북이, 긴바늘은 토끼】
짧고 느린 바늘은 거북이, 길고 빠른 바늘은 토끼예요. 토끼를 끌면 거북이가 천천히 따라와서, '3시 반일 때 짧은바늘은 3과 4 사이'라는 걸 눈으로 볼 수 있어요. 시계 바깥에는 05, 10, 15… 분 숫자가 있어요(끌 수 있음).

【놀이】(마을의 하루, 몇 시야?는 무료. 앱의 나머지 세 가지는 각각 3번 무료 체험)
● 마을의 하루: 동물들의 하루 일 7가지. 시계를 맞추면 동물이 나가고 집에 불이 켜져요.
● 몇 시야?: 시계를 보고 맞는 시각을 골라요. 익숙해지면 숫자로 입력해요.
● 짝 맞추기: 바늘 시계, 숫자 시계, 글자로 짝을 찾아요.
● 시계 수리점: 시계 이름표가 맞을까? 틀린 이름표는 아이가 자주 하는 실수에서 골라요.
● 둘이서: 위아래 두 시계, 먼저 맞추면 1점. 로봇과도 할 수 있어요.

【세 단계】
● 정각과 반(1학년 정도)
● 몇 시 몇 분(2학년 정도, 5분 단위)
● 얼마나 지났지?(3학년 정도, 1분 단위, 24시간제, 몇 시부터 몇 시까지 몇 분)

【틀려도 괜찮아요】
시간 제한도, 목숨도 없어요. 틀리면 동물이 고개를 갸웃하고, 점선 바늘이 맞는 자리를 알려 줘요. 2:50을 3:50으로 읽는 아이에게는 x:50, x:55 시각이 더 나오고, 힌트도 그 실수에 맞춰 나와요.

【할수록 익숙해져요】
● 별 지도: 시각마다 별이 있고, 몇 번 맞히면 켜져요.
● 오늘의 미션, 배지, 펫. 게임을 할 때마다 마을이 조금씩 커져요.
● 최대 4명이 각자 기록을 가져요. 백업으로 기기 이동도 돼요.

【부모님께】
● 광고, 추적, 데이터 수집이 없어요. 기록은 기기에만 저장돼요.
● 인터넷 없이 할 수 있어요.
● 학습 보고서(설정의 어른용): 최근 7일 동안의 연습량과 가장 자주 헷갈리는 실수를 볼 수 있습니다.
● 무료 다운로드: 마을의 하루, 몇 시야?, 별 지도, 펫, 오늘의 미션은 무료입니다. 짝 맞추기, 시계 수리점, 둘이서는 각각 3번 체험할 수 있습니다. 한 번 구매로 모두 잠금 해제됩니다(구독이 아니며, 이 기기의 모든 아이가 이용할 수 있습니다). 학습 보고서에 실수마다 예시와 게임·집에서 연습하는 방법도 나타납니다. 결제는 App Store에서 처리됩니다.
● 구매와 외부 링크는 어른 확인 뒤에 있어요. 아이에게 가격이 보이지 않아요.
● 繁體中文, English, 日本語, 한국어, Español.

개인정보 처리방침: https://tick-town.sanbaofang.com/privacy/ko.html
```


**完整說明：Google 版（Play Console）**（1388／4000）

```text
째깍 마을은 초등학교 1~3학년이 시계 읽기, 시계 맞추기, 지난 시간 계산을 연습하는 게임입니다. 아이는 마을 동물을 돕는다고만 느끼고, 게임은 뒤에서 '어떤 종류의 실수'를 하는지 기록해 그 실수가 나오기 쉬운 시각을 더 자주 냅니다.

【짧은바늘은 거북이, 긴바늘은 토끼】
짧고 느린 바늘은 거북이, 길고 빠른 바늘은 토끼예요. 토끼를 끌면 거북이가 천천히 따라와서, '3시 반일 때 짧은바늘은 3과 4 사이'라는 걸 눈으로 볼 수 있어요. 시계 바깥에는 05, 10, 15… 분 숫자가 있어요(끌 수 있음).

【놀이】(마을의 하루, 몇 시야?는 무료. 앱의 나머지 세 가지는 각각 3번 무료 체험)
● 마을의 하루: 동물들의 하루 일 7가지. 시계를 맞추면 동물이 나가고 집에 불이 켜져요.
● 몇 시야?: 시계를 보고 맞는 시각을 골라요. 익숙해지면 숫자로 입력해요.
● 짝 맞추기: 바늘 시계, 숫자 시계, 글자로 짝을 찾아요.
● 시계 수리점: 시계 이름표가 맞을까? 틀린 이름표는 아이가 자주 하는 실수에서 골라요.
● 둘이서: 위아래 두 시계, 먼저 맞추면 1점. 로봇과도 할 수 있어요.

【세 단계】
● 정각과 반(1학년 정도)
● 몇 시 몇 분(2학년 정도, 5분 단위)
● 얼마나 지났지?(3학년 정도, 1분 단위, 24시간제, 몇 시부터 몇 시까지 몇 분)

【틀려도 괜찮아요】
시간 제한도, 목숨도 없어요. 틀리면 동물이 고개를 갸웃하고, 점선 바늘이 맞는 자리를 알려 줘요. 2:50을 3:50으로 읽는 아이에게는 x:50, x:55 시각이 더 나오고, 힌트도 그 실수에 맞춰 나와요.

【할수록 익숙해져요】
● 별 지도: 시각마다 별이 있고, 몇 번 맞히면 켜져요.
● 오늘의 미션, 배지, 펫. 게임을 할 때마다 마을이 조금씩 커져요.
● 최대 4명이 각자 기록을 가져요. 백업으로 기기 이동도 돼요.

【부모님께】
● 광고, 추적, 데이터 수집이 없어요. 기록은 기기에만 저장돼요.
● 인터넷 없이 할 수 있어요.
● 학습 보고서(설정의 어른용): 최근 7일 동안의 연습량과 가장 자주 헷갈리는 실수를 볼 수 있습니다.
● 무료 다운로드: 마을의 하루, 몇 시야?, 별 지도, 펫, 오늘의 미션은 무료입니다. 짝 맞추기, 시계 수리점, 둘이서는 각각 3번 체험할 수 있습니다. 한 번 구매로 모두 잠금 해제됩니다(구독이 아니며, 이 기기의 모든 아이가 이용할 수 있습니다). 학습 보고서에 실수마다 예시와 게임·집에서 연습하는 방법도 나타납니다. 결제는 Google Play에서 처리됩니다.
● 구매와 외부 링크는 어른 확인 뒤에 있어요. 아이에게 가격이 보이지 않아요.
● 繁體中文, English, 日本語, 한국어, Español.

개인정보 처리방침: https://tick-town.sanbaofang.com/privacy/ko.html
```

### Español（es-MX／中南美）

| 欄位 | 字數／上限 | 內容 |
|---|---|---|
| 名稱（Apple Name／Google 標題） | 27／30 | Pueblo Tictac: Leer la hora |
| 副標題（Apple Subtitle） | 30／30 | Pon en hora relojes del pueblo |
| 宣傳文字（Apple Promotional Text） | 145／170 | Ayuda a los animales del pueblo a poner, leer y calcular la hora. Las horas difíciles salen más. Sin anuncios, sin internet, sin recopilar datos. |
| 簡短說明（Google Short description） | 76／80 | Ayuda a los animales del pueblo a poner y leer relojes. Sin anuncios ni red. |
| 關鍵字（Apple Keywords） | 97／100 | reloj,reloj analógico,minutos,24 horas,tiempo transcurrido,matemáticas,niños,primaria,1.º,2.º,3.º |
| 新功能（What's New） | 173／4000 | Primera versión: Día del pueblo, ¿Qué hora es?, Parejas, El taller y A dos; formato de 24 horas y tiempo transcurrido para 3.º; informe de avance para padres; cinco idiomas. |
| 隱私權政策網址 | | `https://tick-town.sanbaofang.com/privacy/es.html` |
| 支援網址 | | `https://tick-town.sanbaofang.com/support/` |

**完整說明：Apple 版（App Store Connect）**（2833／4000）

```text
Pueblo Tictac es un juego para niños de 1.º a 3.º de primaria para practicar leer la hora, poner el reloj en hora y calcular cuánto tiempo pasó. Los niños solo sienten que ayudan a los animales del pueblo, mientras el juego registra qué tipo de error ocurre y muestra más las horas que lo provocan.

LA TORTUGA ES LA AGUJA CORTA, EL CONEJO ES LA LARGA
La aguja corta y lenta es la tortuga; la larga y rápida es el conejo. Al arrastrar el conejo, la tortuga lo sigue despacio, así los niños ven que a las 3 y media la aguja corta está entre el 3 y el 4. Un aro con 05, 10, 15… alrededor del reloj muestra los minutos (se puede quitar).

JUEGOS (Día del pueblo y ¿Qué hora es? son gratis; en la app, los otros tres se pueden probar 3 veces cada uno)
• Día del pueblo: los animales tienen 7 cosas que hacer. Pon el reloj y salen de casa, y se enciende su luz.
• ¿Qué hora es?: lee el reloj y elige la hora correcta; las que ya sabes se escriben con números.
• Parejas: voltea cartas y empareja relojes, horas en números y palabras.
• El taller: ¿la etiqueta del reloj está bien? Las etiquetas equivocadas se eligen según los errores típicos de tu hijo o hija.
• A dos: dos relojes; el primero que lo pone bien gana un punto. También contra el robot.

TRES NIVELES
• En punto y media (aprox. 1.º)
• Horas y minutos (aprox. 2.º, de 5 en 5)
• ¿Cuánto tiempo? (aprox. 3.º, de minuto en minuto, formato de 24 horas, minutos entre dos horas)

EQUIVOCARSE ESTÁ BIEN
Sin cuenta atrás ni vidas. Si se equivoca, el animal inclina la cabeza y las agujas punteadas muestran el lugar correcto. Si suele leer 2:50 como 3:50, salen más horas x:50 y x:55, con pistas pensadas para ese error.

CADA VEZ MEJOR
• Mapa de estrellas: cada hora tiene una estrella que se enciende tras unos aciertos.
• Misiones del día, medallas y una mascota; el pueblo crece un poco con cada juego.
• Hasta 4 niños con su propio progreso; copia de seguridad para cambiar de dispositivo.

PARA PADRES Y MADRES
• Sin anuncios, sin rastreo, sin recopilar datos. El progreso se queda en el dispositivo.
• Funciona sin internet.
• Informe de avance (Para adultos, en Ajustes): cuánto practicó en los últimos 7 días y en qué se confunde más.
• Descarga gratis: Día del pueblo, ¿Qué hora es?, el mapa de estrellas, la mascota y las misiones del día son gratis. Parejas, El taller y A dos se pueden probar 3 veces cada uno. Una sola compra lo desbloquea todo para siempre (no es una suscripción; todos los niños del dispositivo pueden jugar) y además agrega al informe un ejemplo de cada confusión y qué hacer en el juego y en casa. El pago lo procesa App Store.
• Las compras y los enlaces externos están detrás de una pregunta para adultos; los niños nunca ven precios.
• 繁體中文, English, 日本語, 한국어, Español.

Política de privacidad: https://tick-town.sanbaofang.com/privacy/es.html
```


**完整說明：Google 版（Play Console）**（2835／4000）

```text
Pueblo Tictac es un juego para niños de 1.º a 3.º de primaria para practicar leer la hora, poner el reloj en hora y calcular cuánto tiempo pasó. Los niños solo sienten que ayudan a los animales del pueblo, mientras el juego registra qué tipo de error ocurre y muestra más las horas que lo provocan.

LA TORTUGA ES LA AGUJA CORTA, EL CONEJO ES LA LARGA
La aguja corta y lenta es la tortuga; la larga y rápida es el conejo. Al arrastrar el conejo, la tortuga lo sigue despacio, así los niños ven que a las 3 y media la aguja corta está entre el 3 y el 4. Un aro con 05, 10, 15… alrededor del reloj muestra los minutos (se puede quitar).

JUEGOS (Día del pueblo y ¿Qué hora es? son gratis; en la app, los otros tres se pueden probar 3 veces cada uno)
• Día del pueblo: los animales tienen 7 cosas que hacer. Pon el reloj y salen de casa, y se enciende su luz.
• ¿Qué hora es?: lee el reloj y elige la hora correcta; las que ya sabes se escriben con números.
• Parejas: voltea cartas y empareja relojes, horas en números y palabras.
• El taller: ¿la etiqueta del reloj está bien? Las etiquetas equivocadas se eligen según los errores típicos de tu hijo o hija.
• A dos: dos relojes; el primero que lo pone bien gana un punto. También contra el robot.

TRES NIVELES
• En punto y media (aprox. 1.º)
• Horas y minutos (aprox. 2.º, de 5 en 5)
• ¿Cuánto tiempo? (aprox. 3.º, de minuto en minuto, formato de 24 horas, minutos entre dos horas)

EQUIVOCARSE ESTÁ BIEN
Sin cuenta atrás ni vidas. Si se equivoca, el animal inclina la cabeza y las agujas punteadas muestran el lugar correcto. Si suele leer 2:50 como 3:50, salen más horas x:50 y x:55, con pistas pensadas para ese error.

CADA VEZ MEJOR
• Mapa de estrellas: cada hora tiene una estrella que se enciende tras unos aciertos.
• Misiones del día, medallas y una mascota; el pueblo crece un poco con cada juego.
• Hasta 4 niños con su propio progreso; copia de seguridad para cambiar de dispositivo.

PARA PADRES Y MADRES
• Sin anuncios, sin rastreo, sin recopilar datos. El progreso se queda en el dispositivo.
• Funciona sin internet.
• Informe de avance (Para adultos, en Ajustes): cuánto practicó en los últimos 7 días y en qué se confunde más.
• Descarga gratis: Día del pueblo, ¿Qué hora es?, el mapa de estrellas, la mascota y las misiones del día son gratis. Parejas, El taller y A dos se pueden probar 3 veces cada uno. Una sola compra lo desbloquea todo para siempre (no es una suscripción; todos los niños del dispositivo pueden jugar) y además agrega al informe un ejemplo de cada confusión y qué hacer en el juego y en casa. El pago lo procesa Google Play.
• Las compras y los enlaces externos están detrás de una pregunta para adultos; los niños nunca ven precios.
• 繁體中文, English, 日本語, 한국어, Español.

Política de privacidad: https://tick-town.sanbaofang.com/privacy/es.html
```

> 關鍵字不要重複名稱與副標題裡已有的字（Apple 會自己索引）；不要放別的 App 或商標名稱。
> 說明裡沒有宣稱成效（例如「保證學會」），也沒有說插畫是手繪的（插畫是 AI 生成的）。

## 二、只填一次的欄位

| 項目 | 填法 |
|---|---|
| Bundle ID | `com.sanbaofang.ticktown`（Apple Developer → Identifiers 先註冊，**上架後不能改**） |
| 版本／build | 1.0（1）；之後每次上傳 build 號 +1 |
| 主要類別／次要類別 | 教育（Education）／遊戲（Games），遊戲子類別選「家庭遊戲」（「教育」子類別已經沒有了） |
| Kids 類別 | 「年齡類別與分級覆蓋」選「專為兒童製作」，年齡層 **6–8 歲**（小一到小三）。**核准後不能改、也不能退出 Kids**，之後每一版都要守兒童規則（不加分析、廣告，外部連結與購買在家長關卡後面——現在都做到了） |
| 年齡分級問卷 | 七步全部答「無／否」。「分級保護控制」答否（家長關卡只擋購買和外部連結，不算） |
| 內容版權 | 選「是，且有權使用」（用了 SIL OFL 字型；插畫是 AI 生成、由作者擁有） |
| 版權（版本頁） | `2026 指數三寶飯`（不要自己打 ©） |
| 價格 | App **免費**＋一個**非消耗型**內購 `unlock_all`（九九是 US$2.99）。內購的顯示名稱與說明見下面第四節。打開「家人共享」 |
| App Privacy | **不收集資料（Data Not Collected）**、不追蹤。遊戲本身沒有網路請求；購買由 Apple 處理 |
| Game Center | 不勾 |
| 版本發佈 | 「手動發佈」，通過後自己按上架 |
| 聯絡 email | `gigigagagogogege@gmail.com`（會公開顯示，關於頁和支援頁也是這個） |

## 三、App 審查資訊

「需要登入」取消勾選。備註（英文，直接貼）：

```text
Tick-Tock Town is an offline clock-reading game for children in grades 1-3. It has no accounts, no ads, no analytics or advertising SDKs, and the game itself makes no network requests. All progress is stored on the device only.

First launch: a short hands-on tutorial starts (drag the clock hands three times). Tap "Skip" at the top right to go straight to "What do you want to practice?", pick any level, and the main menu opens.

In-app purchase (one non-consumable, unlock_all): Town Day, What time?, the star map, the pet and daily missions are free. Match, Fix-it Shop and Two players can each be played 3 times for free; after that a card asks the child to show a grown-up. Buying also adds the detailed advice (an example of each mistake, and what to try in the game and at home) to the parents' Progress report.

Fastest path to the purchase screen: Settings (gear icon, top right) -> For grown-ups -> Unlock all games -> "View" -> solve the parental gate -> purchase card (price, Buy, Restore purchase, Use a promo code).
Parental gate: solve the arithmetic shown, e.g. 5 + 2 x 13 = 31 (multiply first). Three wrong answers lock it for 30 seconds.

The only links that leave the app are the privacy policy (About page) and a link to the author's other app (9x9 Meteor Squad, in About and at the bottom of the Progress report). Both are behind the same parental gate.
Acorns (used to feed the pet) are earned only by answering questions and cannot be bought.
```

> 不要在備註裡提「網頁版免費」（4.2 最低功能的風險）。送審前付費協議、銀行、稅表要全部「有效」，而且**要在 TestFlight 看到購買鈕上的價錢**，不然審核員看到讀不到商品會退件。

## 四、內購項目 `unlock_all`

| 語言 | 顯示名稱 | 說明 |
|---|---|---|
| 繁體中文 | 解鎖全部遊戲 | 配對、修鐘店、兩個人一起可以一直玩，學習報告多出例子和建議。 |
| English | Unlock all games | Play Match, Fix-it Shop and Two players any time, plus tips in the report. |
| 日本語 | すべてのゲームをアンロック | 3つのゲームがいつでも遊べて、学習レポートに例とアドバイスが出ます。 |
| 한국어 | 모든 게임 잠금 해제 | 세 게임을 마음껏 하고 학습 보고서에 예시와 조언이 나옵니다. |
| Español | Desbloquear todo | Juega Parejas, El taller y A dos cuando quieras, con consejos en el informe. |

審查用截圖：**在 TestFlight 買之前**先截購買卡（買過就還原不了）。

## 五、截圖與圖形

重做：先開本機伺服器（`python3 -m http.server 8124`），`node tools/store-art.cjs [語言,…]`。用真的遊戲、放好一份「玩了幾週」的存檔。每種語言 6 張：主選單、小鎮的一天、幾點了、配對、修鐘店、寵物（搜尋結果只顯示前三張）。

| 資料夾 | 像素 | 用在 |
|---|---|---|
| `store/screenshots/apple-iphone-6.3/` | 1206 × 2622 | App Store「配備動態島的 iPhone」（**必填**；這格不收 6.9 吋的 1320 × 2868） |
| `store/screenshots/apple-ipad-13/` | 2064 × 2752 | App Store iPad 13 吋（**必填**，專案支援 iPad） |
| `store/screenshots/google-phone/` | 1080 × 2160 | Google Play 手機 |
| `store/graphic/feature-<語言>.png` | 1024 × 500 | Google Play 主圖 |
| `store/hero/` | 見資料夾 | App Store「標題和搜尋結果」素材（選填），ChatGPT 生成的 3D 劇照風主視覺 |

- 英文、日文等沒傳截圖的語言，會沿用主要語言那組。
- App 圖示：`assets/icons/icon-1024-store.png`（1024 × 1024、不透明）。
