# 上架步驟（iPhone 先上）

照九九流星隊第一次送審的經驗（九九 repo 的 `docs/app-store-submission-notes.md`）。要貼的文字全部在 **`docs/store-listing.md`**（從 `store/listing.json` 產生，字數已檢查）。

## 已經準備好的（不用做）

- 遊戲 1.0、五種語言、網站 `https://tick-town.sanbaofang.com`（Cloudflare Pages，推到 main 自動更新）。
- 隱私權政策 `…/privacy/`（五種語言）、支援頁 `…/support/`。
- iPhone 專案 `ios/`：Bundle ID `com.sanbaofang.ticktown`、Team 58GU3MVJFC 自動簽署、版本 1.0（1）、圖示、啟動畫面、隱私清單、六種語言的 App 名稱。本機 session 在模擬器驗過。
- 內購：一個非消耗型 `unlock_all`（解鎖配對、修鐘店、兩個人一起，和學習報告的例子與建議）；網頁版永遠全部免費。
- 商店文案（五種語言）、截圖（iPhone 1206×2622、iPad 2064×2752、Google 手機，各語言 6 張）、App 圖示 `assets/icons/icon-1024-store.png`、Google 主圖。

## 要 Ian 做的（照順序）

1. **先通三件事（最花時間，先做）**：App Store Connect →「商務」：付費 App 協議、銀行帳戶、稅表三樣都要「有效」。九九的銀行審核等了好幾天。沒生效，內購讀不到價錢，送審會被退。
2. **註冊 Bundle ID**：Apple Developer → Certificates, Identifiers & Profiles → Identifiers → ＋ → App IDs → `com.sanbaofang.ticktown`（描述可填 Tick-Tock Town）。勾 In-App Purchase（預設就有）。
3. **建立 App**：App Store Connect →「App」→ ＋ 新增 App：平台 iOS、名稱用 `docs/store-listing.md` 的繁體中文名稱、主要語言繁體中文、Bundle ID 選上面那個、SKU 隨便填（例如 `ticktown`）。
4. **建立內購**：App 內購買項目 → ＋ → 非消耗型，產品 ID **`unlock_all`**（一定要一模一樣）。價格（九九是 US$2.99）、各語言顯示名稱與說明照 `docs/store-listing.md` 第四節。打開家人共享。
5. **上傳 build**（請本機 session 做，或照九九的方式）：Mac 上 `git pull`、`npm ci && npm run www && npx cap sync ios`，Xcode 打開 `ios/App/App.xcodeproj` → Product → Archive → Distribute → App Store Connect。
6. **TestFlight 實測**（用沙盒帳號）：
   - 購買鈕上看得到價錢（例如「購買 NT$90」）。**這時先截購買卡的圖**，內購審查要用（買過就還原不了）。
   - 真的買一次：三個遊戲解鎖、學習報告出現例子和建議。
   - 刪掉 App 重裝，開起來會自己解鎖；試「恢復購買」。
   - 隨便玩一輪：撥鐘、讀鐘、配對、修鐘店、兩個人、寵物、設定的學習報告。
7. **填資料**：照 `docs/store-listing.md` 第一到三節，每種語言各填一次；隱私權網址每種語言都要填（漏了會擋住送出）。上傳截圖（`store/screenshots/apple-iphone-6.3/`、`apple-ipad-13/`）。
8. **送審（最大的坑）**：先到「App 內購買項目」點進 `unlock_all` → 「新增以供審查」（會開一份草稿）；再到版本頁按「新增以供審查」，**選已經存在的那份草稿**，確認草稿裡有 App 和內購兩項才按提交。只送 App 的話內購會停在「準備提交」，審核員會退件。
9. **通過後**：手動按「發佈」。把 App Store 連結給我，我會讓九九流星隊和滴答小鎮的介紹卡改成直接開商店頁。

## 還沒做、上架後再說

- **母語者看文字**：英、日、韓、西文是 Claude 寫的。可以先上繁體中文和英文，其他語言等看過再加（App Store 的語言之後可以隨時加）。
- **Android**：照九九的決定，等確認是否登記行號再上 Google Play。GitHub Actions 每次 main 更新都會自動建測試 APK：`https://github.com/ianyclin/tick-town/releases/download/android-latest/tick-town.apk`。
- **標題和搜尋結果素材**（選填）：本機 session 用 ChatGPT 生了 3D 劇照風主視覺，做好放在 `store/hero/`。

## 著作權

- 插畫是 ChatGPT 生成的，原圖留在 `art/clay-raw/`，生成紀錄也請留存。
- 字型都是 SIL Open Font License（關於頁有寫）。
