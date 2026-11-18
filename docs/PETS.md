# 寵物的圖

2026-11 美術重做之後，寵物是 ChatGPT 生成的「手捏軟陶玩具」插畫。

- 原圖：`art/clay-raw/clay-pet-owl.png`、`clay-pet-squirrel.png`、`clay-pet-bear.png`，每張一列五個成長階段（蛋 → 從蛋殼探出頭 → 幼兒 → 少年 → 長大），純白底；配件 `clay-gear.png` 一列六樣（蝴蝶結、圍巾、墨鏡、帽子、星星髮夾、皇冠）。出圖時附 `clay-a.png` 當風格基準。
- 切圖：`python3 -I tools/cut-clay.py art/clay-raw/clay-pet-owl.png pet-owl-0,pet-owl-1,pet-owl-2,pet-owl-3,pet-owl-4 400` → `assets/clay/pet-owl-N.webp`；配件 `g-bow,g-scarf,g-glasses,g-hat,g-star,g-crown`。
- 配件怎麼戴：`index.html` 的 `CLAY_PET[種類][階段] = [兩眼中間 x, 眼睛 y, 兩眼距離, 頭頂 y, 寬高比]`（比例）。眼睛是圖上最大的兩顆黑點、頭頂是兩眼中間那一欄最上面的不透明點，切完圖用程式量的。`GEAR_FIT[配件] = [寬是兩眼距離的幾倍, 寬高比, 位置, 旋轉]`。
- 每個階段畫多高：`PET_H`（120 單位的框）。
- 徽章門檻：蝴蝶結 1、圍巾 2、墨鏡 4、帽子 6、星星髮夾 8、皇冠 12。
- 沒有插畫的時候（`CLAY` 裡沒有那個名字）會退回自己畫的 `ART.pet`。
- 換圖之後要截圖看每一隻每個階段戴每樣配件的樣子（位置不對就調 `GEAR_FIT`）。
