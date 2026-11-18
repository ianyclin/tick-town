# 上架步驟（簡單版）

照九九流星隊的經驗。程式這邊能做的都做好了，下面是要 Ian 自己操作的部分，照順序做。

## 已經好了的（不用做）

- 遊戲本體、五種語言、隱私權政策與支援頁（`privacy/`、`support/`，網址 `https://ianyclin.github.io/tick-town/privacy/`、`…/support/`）。
- App 圖示（`assets/icons/`，`tools/make-icon.py` 用 ChatGPT 生成的軟陶鐘圖 `art/clay-raw/clay-appicon.png` 做出各尺寸；AI 生成圖的商用注意事項同九九）、加入主畫面用的 `manifest.json`。
- 開場動畫、App 版解鎖（配對、修鐘店、兩個人一起各試玩 3 次，之後一次購買 `unlock_all`；網頁版永遠全部免費）。
- Capacitor 外殼設定（`capacitor.config.json`、`package.json`），App ID `io.github.ianyclin.ticktown`。
- GitHub Actions 每次 main 更新都自動建 Android 測試 APK：`https://github.com/ianyclin/tick-town/releases/download/android-latest/tick-town.apk`。
- 商店文案（`store/listing.json`，五種語言）、主視覺（`store/graphic/feature-*.png`，1024×500）、手機截圖（`store/screenshots/iphone-6.9/`、`android-phone/`，五種語言各 5 張）。重做：`node tools/store-art.cjs`（要先開本機伺服器）。

## 要 Ian 做的

1. **用 Android 手機裝測試版玩一次**：上面 APK 網址，看觸控、聲音、開場動畫、試玩次數是不是正常。
2. **請會英、日、韓、西文的人看一次文字**（`ROADMAP.md`「遲早要面對」列了比較沒把握的地方）。
3. **決定價錢**：九九是 US$2.99。在商店後台設定，遊戲裡會自動顯示當地價格（孩子看不到）。
4. **iPhone（先上）**
   - 在 Mac 上：`npm ci && npm run www && npx cap add ios && npx cap sync ios`，用 Xcode 打開 `ios/App`，設定簽章與 Bundle ID `io.github.ianyclin.ticktown`，App 圖示用 `assets/icons/icon-1024-store.png`。
   - App Store Connect：建立 App、內購項目 `unlock_all`（非消耗型）、填隱私權網址與支援網址、年齡分級選「兒童」（Kids Category 6–8 歲）、隱私標籤選「不收集資料」。
   - 用 TestFlight 沙盒帳號真的買一次、刪掉 App 重裝看會不會自己解鎖、試「恢復購買」。
   - 送審。
5. **Android（之後）**：照九九的決定，等確認是否登記行號再上 Google Play。

## 著作權

- 寵物圖、小鎮插畫是 ChatGPT 生成的，上架前留存生成紀錄。
- 字型都是 SIL Open Font License（關於頁有寫）。
