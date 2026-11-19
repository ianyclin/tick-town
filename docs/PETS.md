# 寵物的圖

2026-11 美術重做之後，寵物是 ChatGPT 生成的「手捏軟陶玩具」插畫。

- 原圖：`art/clay-raw/clay-pet-owl.png`、`clay-pet-squirrel.png`、`clay-pet-bear.png`，每張一列五個成長階段（蛋 → 從蛋殼探出頭 → 幼兒 → 少年 → 長大），純白底；配件 `clay-gear.png` 一列六樣（蝴蝶結、圍巾、墨鏡、帽子、星星髮夾、皇冠）。出圖時附 `clay-a.png` 當風格基準。
- 切圖：`python3 -I tools/cut-clay.py art/clay-raw/clay-pet-owl.png pet-owl-0,pet-owl-1,pet-owl-2,pet-owl-3,pet-owl-4 400` → `assets/clay/pet-owl-N.webp`；配件 `g-bow,g-scarf,g-glasses,g-hat,g-star,g-crown`。
- 配件怎麼戴：`index.html` 的 `CLAY_PET[種類][階段] = [兩眼中間 x, 眼睛 y, 兩眼距離, 頭頂 y, 寬高比]`（比例）。眼睛是圖上最大的兩顆黑點、頭頂是兩眼中間那一欄最上面的不透明點，切完圖用程式量的。`GEAR_FIT[配件] = [寬是兩眼距離的幾倍, 寬高比, 位置, 旋轉]`。
- 每個階段畫多高：`PET_H`（120 單位的框）。
- 徽章門檻：蝴蝶結 1、圍巾 2、墨鏡 4、帽子 6、星星髮夾 8、皇冠 12。
- 沒有插畫的時候（`CLAY` 裡沒有那個名字）會退回自己畫的 `ART.pet`。
- 換圖之後要截圖看每一隻每個階段戴每樣配件的樣子（位置不對就調 `GEAR_FIT`）。

## 照九九補齊的系統（2026-11-19）

- 照顧：點心 餅乾 10／蜂蜜、核桃、藍莓 15／蛋糕 40／星星糖 80，玩 丟球、跳舞 20；愛心 1／2／2／2／5／11／3／3，最愛加倍（貓頭鷹藍莓、松鼠核桃、小熊蜂蜜、小星龍星星糖、獨角獸蛋糕、鳳凰餅乾）。圖示 `i-cookie,i-honey,i-nut,i-berry,i-cake,i-candy,i-note`（`clay-food.png`，160px）。
- 愛心門檻 `LOVE = [0, 10, 30, 60, 100, 160]`，只增不減；沒有飢餓、沒有倒扣、不能用錢買橡果。
- 傳說蛋：小星龍（徽章 30＋送回家 1）、彩虹獨角獸（45＋2）、小鳳凰（60＋3）。原圖 `clay-pet-legend.png`（小星龍）；獨角獸、鳳凰的圖還沒來（`clay-pet-unicorn.png`、`clay-pet-phoenix.png`），沒圖的顯示「即將登場」、存檔裡的也會被清掉。
- 量眼睛：`python3 -I tools/measure-pet.py pet-legend-1 …`：圖上半部最大的兩塊黑色（眼睛）的中心、兩眼距離、兩眼中間那一欄第一個不透明的點（頭頂）；量過的小熊數字跟手量的一樣。
- 神祕配件：翅膀 40、披風 50（`g-wings`、`g-cape`，`clay-gear2.png`），`back` 位置畫在寵物後面，`GEAR_FIT` 用兩眼距離的倍數放大到會從身體兩邊露出來。
