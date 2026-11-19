#!/usr/bin/env python3
"""讀 store/listing.json（商店文案的唯一來源），檢查各商店的字數上限，輸出 docs/store-listing.md（上架時從這裡複製貼上）。
用法：python3 tools/make-listing.py（超過上限會報錯並結束）。改文案只改 listing.json，不要直接改產出的 md。
格式照九九流星隊的 tools/make-listing.py；審查備註、分級、隱私的填法照九九第一次送審的經驗（九九 repo 的 docs/app-store-submission-notes.md）。"""
import json, os, sys
root = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
L = json.load(open(os.path.join(root, 'store', 'listing.json'), encoding='utf-8'))
LIM = {'name': 30, 'subtitle': 30, 'promo': 170, 'short': 80, 'keywords': 100, 'whatsNew': 4000, 'description': 4000}
NAMES = {'zh-Hant': '繁體中文（zh-Hant／台灣）', 'en': 'English（en-US）', 'ja': '日本語（ja）', 'ko': '한국어（ko）', 'es': 'Español（es-MX／中南美）'}
PRIV = {'zh-Hant': '', 'en': 'en.html', 'ja': 'ja.html', 'ko': 'ko.html', 'es': 'es.html'}
SITE = 'https://tick-town.sanbaofang.com'
desc = lambda d, st: d['description'].replace('{store}', d['stores'][st])
bad = []
for lang, d in L.items():
    for k, m in LIM.items():
        if k != 'description' and len(d[k]) > m: bad.append(f'{lang}.{k}: {len(d[k])} > {m}')
    for st in ('apple', 'google'):
        t = desc(d, st)
        if len(t) > LIM['description']: bad.append(f'{lang}.description({st}): {len(t)} > 4000')
        if '{' in t: bad.append(f'{lang}.description({st}): 還有沒換掉的 {{…}}')
    if 'Google' in desc(d, 'apple') or 'Android' in desc(d, 'apple'): bad.append(f'{lang}.description(apple): 不能出現別的商店或平台（Apple 2.3.10）')
    if len(set(d['keywords'].split(','))) != len(d['keywords'].split(',')): bad.append(f'{lang}.keywords: 有重複的關鍵字')
if bad: sys.exit('有問題：\n' + '\n'.join(bad))

o = []; w = o.append
w('''# 商店文案與上架填寫表（滴答小鎮）

> 本檔由 `tools/make-listing.py` 從 `store/listing.json` 產生，**要改文案請改 JSON 再重跑**。英、日、韓、西文是 Claude 寫的，**上架前請母語者看過**。
> 字數都是「字元數」，已用腳本檢查過 Apple 與 Google 的上限（名稱 30、副標 30、宣傳文字 170、簡短說明 80、關鍵字 100、說明 4000）。上限以後台當下顯示為準。

## 一、各語言文案

每種語言在 App Store Connect 各填一次：名稱、副標題、隱私權政策網址（「App 資訊」頁）、宣傳文字、描述、關鍵字、支援網址、截圖。
完整說明分 **Apple 版**和 **Google 版**，只差付款那句的商店名稱（Apple 2.3.10：商店資料不能出現別的商店的名字）。
''')
for lang, d in L.items():
    w(f'### {NAMES[lang]}\n')
    w('| 欄位 | 字數／上限 | 內容 |\n|---|---|---|')
    for label, k in [('名稱（Apple Name／Google 標題）', 'name'), ('副標題（Apple Subtitle）', 'subtitle'), ('宣傳文字（Apple Promotional Text）', 'promo'),
                     ('簡短說明（Google Short description）', 'short'), ('關鍵字（Apple Keywords）', 'keywords'), ("新功能（What's New）", 'whatsNew')]:
        w(f'| {label} | {len(d[k])}／{LIM[k]} | {d[k]} |')
    w(f'| 隱私權政策網址 | | `{SITE}/privacy/{PRIV[lang]}` |')
    w(f'| 支援網址 | | `{SITE}/support/` |')
    for st, label in (('apple', 'Apple 版（App Store Connect）'), ('google', 'Google 版（Play Console）')):
        t = desc(d, st); w(f'\n**完整說明：{label}**（{len(t)}／4000）\n'); w('```text\n' + t + '\n```\n')
w(f'''> 關鍵字不要重複名稱與副標題裡已有的字（Apple 會自己索引）；不要放別的 App 或商標名稱。
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
''')
open(os.path.join(root, 'docs', 'store-listing.md'), 'w', encoding='utf-8').write('\n'.join(o))
print('ok')
