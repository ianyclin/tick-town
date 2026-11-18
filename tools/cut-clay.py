"""把 ChatGPT 生成的軟陶插畫（純白底、一列幾樣東西）切成透明的 WebP 到 assets/clay/。

用法：python3 tools/cut-clay.py <來源圖> <名字1,名字2,...> [最長邊 px，預設 384] [--win]
  例：python3 tools/cut-clay.py art/clay-raw/clay-a.png bear,bunny,squirrel,owl 384
      python3 tools/cut-clay.py art/clay-raw/clay-houses.png house-0,house-1,house-2,house-3,house-4,house-5 320 --win
做法（跟 cut-town.py 一樣）：從圖的四邊往內把白色淹掉 → 看哪幾欄完全透明，把不透明的欄分成幾段；
段數比名字多就把最窄的段併到旁邊，比名字少就停下來。每樣裁到邊緣、縮到最長邊、存 WebP（有透明）。
--win：找出每間房子的窗戶（淡天藍色的一塊），印出 [x, y, 半徑]（圖寬高的比例），貼到 index.html 的 CLAY_WIN。
最後印出每樣的寬高比。
"""
import sys, os, json
import numpy as np
from PIL import Image
from collections import deque
HERE = os.path.dirname(os.path.abspath(__file__))
OUT = os.path.join(HERE, '..', 'assets', 'clay') + '/'


def remove_bg(img, th=238):
    a = np.asarray(img.convert('RGB')).astype(np.int16); h, w, _ = a.shape
    white = (a.min(axis=2) >= th) & (a.max(axis=2) - a.min(axis=2) <= 12); bg = np.zeros((h, w), bool); q = deque()
    for x in range(w):
        for y in (0, h - 1):
            if white[y, x] and not bg[y, x]: bg[y, x] = True; q.append((y, x))
    for y in range(h):
        for x in (0, w - 1):
            if white[y, x] and not bg[y, x]: bg[y, x] = True; q.append((y, x))
    while q:
        y, x = q.popleft()
        for ny, nx in ((y - 1, x), (y + 1, x), (y, x - 1), (y, x + 1)):
            if 0 <= ny < h and 0 <= nx < w and white[ny, nx] and not bg[ny, nx]: bg[ny, nx] = True; q.append((ny, nx))
    alpha = np.full((h, w), 255, np.uint8); alpha[bg] = 0
    # 邊緣兩圈：越白越透明（去掉白邊）
    for _ in range(2):
        rim = np.zeros((h, w), bool); cur = alpha == 0
        for dy, dx in ((1, 0), (-1, 0), (0, 1), (0, -1)): rim |= (np.roll(cur, (dy, dx), (0, 1)) & ~cur)
        soft = np.clip((255 - a.min(axis=2)) * 255 // 70, 0, 255).astype(np.uint8); alpha[rim] = np.minimum(alpha[rim], soft[rim])
    return Image.fromarray(np.dstack([a.astype(np.uint8), alpha]), 'RGBA')


def windows(part):
    """淡天藍色的窗戶：回 [[x, y, r], ...]（比例）。"""
    a = np.asarray(part).astype(np.int16); r, g, b, al = a[:, :, 0], a[:, :, 1], a[:, :, 2], a[:, :, 3]
    m = (al > 200) & (b > 170) & (b - r > 25) & (g > 150) & (g - r > 5); h, w = m.shape; seen = np.zeros((h, w), bool); out = []
    for y in range(h):
        for x in range(w):
            if m[y, x] and not seen[y, x]:
                q = deque([(y, x)]); seen[y, x] = True; n = 0; x0 = x1 = x; y0 = y1 = y
                while q:
                    cy, cx = q.popleft(); n += 1; x0 = min(x0, cx); x1 = max(x1, cx); y0 = min(y0, cy); y1 = max(y1, cy)
                    for ny, nx in ((cy - 1, cx), (cy + 1, cx), (cy, cx - 1), (cy, cx + 1)):
                        if 0 <= ny < h and 0 <= nx < w and m[ny, nx] and not seen[ny, nx]: seen[ny, nx] = True; q.append((ny, nx))
                if n > w * h * 0.004: out.append([n, round((x0 + x1) / 2 / w, 3), round((y0 + y1) / 2 / h, 3), round(min(x1 - x0, y1 - y0) / 2 / w, 3)])
    out.sort(reverse=True); return sorted([o[1:] for o in out[:3]])


if __name__ == '__main__':
    args = [a for a in sys.argv[1:] if not a.startswith('--')]
    if len(args) < 2: sys.exit(__doc__)
    names = args[1].split(','); size = int(args[2]) if len(args) > 2 else 384
    img = remove_bg(Image.open(args[0]))
    a = np.asarray(img)[:, :, 3] > 20
    cols = a.sum(axis=0) > 1
    segs, x = [], 0
    while x < len(cols):
        if cols[x]:
            s = x
            while x < len(cols) and cols[x]: x += 1
            segs.append([s, x])
        x += 1
    segs = [sg for sg in segs if sg[1] - sg[0] > 6]   # 去掉零星的點
    while len(segs) > len(names):   # 太多段：最窄的那段跟比較近的鄰居合併
        i = min(range(len(segs)), key=lambda k: segs[k][1] - segs[k][0])
        j = i - 1 if i > 0 and (i == len(segs) - 1 or segs[i][0] - segs[i - 1][1] < segs[i + 1][0] - segs[i][1]) else i + 1
        lo, hi = min(i, j), max(i, j); segs[lo] = [segs[lo][0], segs[hi][1]]; del segs[hi]
    if len(segs) < len(names): sys.exit(f'只找到 {len(segs)} 樣東西，名字有 {len(names)} 個：東西之間要有白色的空隙')
    os.makedirs(OUT, exist_ok=True); wins = {}
    for (x0, x1), name in zip(segs, names):
        part = img.crop((x0, 0, x1, img.height)); part = part.crop(part.getbbox())
        k = size / max(part.size); part = part.resize((max(1, round(part.width * k)), max(1, round(part.height * k))), Image.LANCZOS)
        part.save(f'{OUT}{name}.webp', 'WEBP', quality=88, method=6)
        print(f"{name}: {part.size} ar {round(part.width / part.height, 3)} {os.path.getsize(f'{OUT}{name}.webp') // 1024}KB")
        if '--win' in sys.argv: wins[name] = windows(part)
    if wins: print(json.dumps(list(wins.values())))
