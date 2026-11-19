"""量寵物插畫的眼睛和頭頂，給 index.html 的 CLAY_PET 用：python3 -I tools/measure-pet.py pet-legend-1 pet-legend-2 …
輸出 [兩眼中間 x, 眼睛 y, 兩眼距離, 頭頂 y, 寬高比]（x、兩眼距離是圖寬的比例，y 是圖高的比例）。
眼睛＝圖上 70% 以內最大的兩塊黑色；頭頂＝兩眼中間那一欄第一個不透明的點。蛋（階段 0）沒有眼睛，只要寬高比。"""
import sys, os
from collections import deque
import numpy as np
from PIL import Image
CLAY = os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', 'assets', 'clay')


def blobs(m):
    h, w = m.shape; seen = np.zeros((h, w), bool); out = []
    for y in range(h):
        for x in range(w):
            if m[y, x] and not seen[y, x]:
                q = deque([(y, x)]); seen[y, x] = True; pts = []
                while q:
                    a, b = q.popleft(); pts.append((a, b))
                    for c, d in ((a + 1, b), (a - 1, b), (a, b + 1), (a, b - 1)):
                        if 0 <= c < h and 0 <= d < w and m[c, d] and not seen[c, d]: seen[c, d] = True; q.append((c, d))
                out.append(pts)
    return sorted(out, key=len, reverse=True)


for n in sys.argv[1:]:
    im = np.asarray(Image.open(os.path.join(CLAY, n + '.webp')).convert('RGBA')).astype(int); h, w, _ = im.shape
    dark = (im[..., :3].max(axis=2) < 70) & (im[..., 3] > 200); dark[int(h * .7):] = False
    b = blobs(dark)
    if len(b) < 2: print(n, '找不到兩隻眼睛；寬高比', round(w / h, 3)); continue
    (y1, x1), (y2, x2) = sorted([np.mean(p, axis=0) for p in b[:2]], key=lambda c: c[1])
    ex, ey, u = (x1 + x2) / 2, (y1 + y2) / 2, abs(x2 - x1); top = int(np.argmax(im[:, int(ex), 3] > 128))
    print(n, [float(round(v, 3)) for v in (ex / w, ey / h, u / w, top / h, w / h)])
