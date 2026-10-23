# 寵物圖怎麼做

跟九九流星隊一樣：ChatGPT 生成「角色成長圖」，`tools/cut-pets.py` 切成 15 張透明 PNG。圖還沒到位之前，遊戲用 emoji 代替（`PET_IMG` 偵測 `assets/pets/owl-0.png` 存不存在）。

## 三隻動物（住在鐘樓裡）

| kind | 中 | 英 | 日 | 預設名字 |
|---|---|---|---|---|
| `owl` | 貓頭鷹 | Owl | ふくろう | 咕咕／Hoot／ホーホー |
| `squirrel` | 松鼠 | Squirrel | りす | 小松／Nutty／リスリス |
| `bear` | 小熊 | Bear | くま | 熊熊／Bruno／クマタ |

## 給 ChatGPT 的提示（每隻一張，英文比較穩；四段各自貼一次）

**貓頭鷹 `owl.png`**

> A character growth sheet for a children's educational game, five stages side by side in ONE row on a pure white background, left to right: (1) a pale purple egg with a few darker spots, (2) a tiny newly hatched baby owl, round and fluffy with huge eyes, (3) a young owl with small ear tufts, (4) a grown owl with bigger ear tufts and spread-out wings, (5) an "ultimate" majestic owl wearing a tiny golden crown, with a soft glow and a few sparkles around it. The owl is purple with a cream belly and an orange beak. Cute, round, big friendly eyes, flat cartoon sticker style with soft shading and bold clean dark outlines, bright warm colors. All five face the viewer, stand on the same invisible baseline, are evenly spaced and do not overlap. No text, no ground shadows, no background objects. Aspect ratio 16:5.

**松鼠 `squirrel.png`**

> A character growth sheet for a children's educational game, five stages side by side in ONE row on a pure white background, left to right: (1) a light brown egg with a small acorn pattern, (2) a tiny newly hatched baby squirrel, round and fluffy with a small tail, (3) a young squirrel holding an acorn, (4) a grown squirrel with a big bushy tail holding an acorn, (5) an "ultimate" squirrel with a huge magnificent tail, wearing a tiny golden crown, with a soft glow and a few sparkles. The squirrel is warm orange-brown with a cream belly. Cute, round, big friendly eyes, flat cartoon sticker style with soft shading and bold clean dark outlines, bright warm colors. All five face the viewer, stand on the same invisible baseline, are evenly spaced and do not overlap. No text, no ground shadows, no background objects. Aspect ratio 16:5.

**小熊 `bear.png`**

> A character growth sheet for a children's educational game, five stages side by side in ONE row on a pure white background, left to right: (1) a light brown egg with a small honey-pot pattern, (2) a tiny newly hatched baby bear cub, round and fluffy, (3) a young bear cub sitting up, (4) a grown bear standing with a small red scarf, (5) an "ultimate" big gentle bear with a tiny golden crown, a soft glow and a few sparkles. The bear is warm brown with a lighter round muzzle and belly. Cute, round, big friendly eyes, flat cartoon sticker style with soft shading and bold clean dark outlines, bright warm colors. All five face the viewer, stand on the same invisible baseline, are evenly spaced and do not overlap. No text, no ground shadows, no background objects. Aspect ratio 16:5.

**配件貼紙 `gear.png`**

> A sticker sheet of six accessories for a cute cartoon animal character, on a pure white background, arranged in ONE row with clear white space between them, left to right: (1) a red ribbon bow, (2) a striped knitted scarf shown as a loop seen from the front, (3) a pair of black sunglasses seen from the front, (4) a blue top hat, (5) a yellow star-shaped hair clip, (6) a small golden crown with red jewels. Flat cartoon sticker style with soft shading and bold clean dark outlines, bright colors, each item drawn straight-on as if it were about to be placed on a character's head, face or neck. No text, no shadows, no background objects, evenly spaced, not overlapping. Aspect ratio 16:4.

要求（給 ChatGPT 之後自己檢查）：
- 純白底（切圖靠白色去背），五隻之間留白，不要重疊、不要有地上的影子。
- 每隻都正面、站在同一條線上、大小由左到右漸大。
- 同一隻五個階段的顏色、臉要像同一個角色。生出來不像的那一張，叫 ChatGPT「只重畫第 N 隻，其他不變」通常沒用，直接整張重生比較快。
- 檔名存成 `owl.png`、`squirrel.png`、`bear.png`、`gear.png`，放到一個資料夾，跑 `python3 tools/cut-pets.py <資料夾>`、`python3 tools/cut-gear.py <資料夾>/gear.png`。

## 配件（圖已到位）

徽章門檻：蝴蝶結 1、圍巾 2、墨鏡 4、帽子 6、星星髮夾 8、皇冠 12。圖檔 `assets/gear/{id}.png`，切圖用 `tools/cut-gear.py`（貼紙圖，白底）。換成圖之後要重量每隻每階段的頭位置 `PET_HEAD`（照九九的做法，用 Playwright 截四隻 × 五階段戴墨鏡看位置）。

## 對位（2026-10 已量）

- `tools/pet-sheet.cjs <輸出.png> [glasses,hat,scarf]`：三隻 × 五階段放大加 120 單位格線，可戴配件截圖看位置（要先開本機 8124）。
- `PET_HEAD`、`PET_FACE` 是照格線目測的；換圖要重量。
- 著作權：AI 生成的插畫保護不明確，上架前留存生成紀錄。
