# 寵物圖怎麼做

跟九九流星隊一樣：ChatGPT 生成「角色成長圖」，`tools/cut-pets.py` 切成 15 張透明 PNG。圖還沒到位之前，遊戲用 emoji 代替（`PET_IMG` 偵測 `assets/pets/owl-0.png` 存不存在）。

## 三隻動物（住在鐘樓裡）

| kind | 中 | 英 | 日 | 預設名字 |
|---|---|---|---|---|
| `owl` | 貓頭鷹 | Owl | ふくろう | 咕咕／Hoot／ホーホー |
| `squirrel` | 松鼠 | Squirrel | りす | 小松／Nutty／リスリス |
| `bear` | 小熊 | Bear | くま | 熊熊／Bruno／クマタ |

## 給 ChatGPT 的提示（每隻一張，英文比較穩）

> A character growth sheet for a children's game, five stages side by side in one row on a pure white background, left to right: (1) an egg with a small pattern, (2) a tiny baby **owl** just hatched, (3) a young owl, (4) a grown owl, (5) an "ultimate" majestic owl with a little glow and stars. Cute, round, big eyes, friendly, flat cartoon style with soft shading, bold clean outlines, bright warm colors, all five facing the viewer and standing on the same baseline, no text, no shadows on the ground, evenly spaced, 16:5 aspect ratio.

松鼠把 **owl** 換成 **squirrel**（抱著橡果），小熊換成 **bear**（戴一條小圍巾也可以，但第 2 到 5 階段要一致）。

要求：
- 純白底（切圖靠白色去背），五隻之間留白，不要重疊。
- 每隻都正面、站在同一條線上、不要畫地上的影子。
- 同一隻五個階段的顏色、臉要像同一個角色。
- 檔名存成 `owl.png`、`squirrel.png`、`bear.png`，放到一個資料夾，跑 `python3 tools/cut-pets.py <資料夾>`。

## 配件（先用 emoji，之後再換圖）

徽章門檻：蝴蝶結 1、圍巾 2、墨鏡 4、帽子 6、星星髮夾 8、皇冠 12。圖檔 `assets/gear/{id}.png`，切圖用 `tools/cut-gear.py`（貼紙圖，白底）。換成圖之後要重量每隻每階段的頭位置 `PET_HEAD`（照九九的做法，用 Playwright 截四隻 × 五階段戴墨鏡看位置）。

## 圖到位之後要改的程式

- `PET_HEAD`：目前是通用值，改成每隻每階段量過的 `[hx, hy, hr]`。
- `petSVG()`：把 emoji 的 `<text>` 換成 `<image href="assets/gear/…">`，照九九的 `gearSVG()`。
- 著作權：AI 生成的插畫保護不明確，上架前留存生成紀錄。
