"""把 ChatGPT 生成的小鎮貼紙圖（白底、一列幾樣東西）切成透明 PNG 到 assets/town/。

用法：python3 tools/cut-town.py <來源圖> <名字1,名字2,...>
  例：python3 tools/cut-town.py art/town-raw/town-a.png bunny,tower,tree,flowers,bench
      python3 tools/cut-town.py art/town-raw/town-b.png fountain,swing,windmill,balloon,bakery
找法：去背（跟 cut-gear.py 一樣，從圖的四邊往內把白色淹掉）之後，看哪幾欄完全透明，把不透明的欄分成幾段；
段數比名字多就把最窄的段併到旁邊（像熱氣球的繩子斷開），比名字少就停下來印出段數讓人看。
每樣裁到邊緣、最長邊 384px、256 色，最後印出寬高比（index.html 的 TOWN_AR）。
"""
import sys, os
import numpy as np
from PIL import Image
HERE = os.path.dirname(os.path.abspath(__file__))
OUT = os.path.join(HERE, '..', 'assets', 'town') + '/'
src = open(os.path.join(HERE, 'cut-gear.py'), encoding='utf-8').read()
ns = {'__file__': os.path.join(HERE, 'cut-gear.py')}; exec(src[:src.index('img = remove_bg(')], ns); remove_bg = ns['remove_bg']

if len(sys.argv) != 3: sys.exit(__doc__)
names = sys.argv[2].split(',')
img = remove_bg(Image.open(sys.argv[1]))
a = np.asarray(img)[:, :, 3] > 20
cols = a.any(axis=0)
segs, x = [], 0
while x < len(cols):
    if cols[x]:
        s = x
        while x < len(cols) and cols[x]: x += 1
        segs.append([s, x])
    x += 1
segs = [sg for sg in segs if sg[1] - sg[0] > 3]   # 去掉零星的點
while len(segs) > len(names):   # 太多段：最窄的那段跟比較近的鄰居合併
    i = min(range(len(segs)), key=lambda k: segs[k][1] - segs[k][0])
    j = i - 1 if i > 0 and (i == len(segs) - 1 or segs[i][0] - segs[i - 1][1] < segs[i + 1][0] - segs[i][1]) else i + 1
    lo, hi = min(i, j), max(i, j); segs[lo] = [segs[lo][0], segs[hi][1]]; del segs[hi]
if len(segs) < len(names): sys.exit(f'只找到 {len(segs)} 樣東西，名字有 {len(names)} 個：東西之間要有白色的空隙')
os.makedirs(OUT, exist_ok=True)
for (x0, x1), name in zip(segs, names):
    part = img.crop((x0, 0, x1, img.height)); part = part.crop(part.getbbox())
    k = 384 / max(part.size); part = part.resize((max(1, round(part.width * k)), max(1, round(part.height * k))), Image.LANCZOS)
    part.quantize(256).save(f'{OUT}{name}.png', optimize=True)
    print(f"{name}: {part.size} ar {round(part.width / part.height, 3)}")
