"""把 ChatGPT 生成的配件貼紙圖（一列六樣、白底）切成 6 張透明 PNG 到 assets/gear/。

用法：python3 tools/cut-gear.py <來源圖.png>
順序由左到右：蝴蝶結、圍巾、墨鏡、禮帽、星星髮夾、皇冠。
輸出各自裁到邊緣、最長邊 256px、256 色。結束時印出每張的寬高比，拿去填 index.html 的 GEAR 表 ar 欄位。
"""
import sys, os, json
import numpy as np
from PIL import Image
from collections import deque
IDS = [['bow', 'scarf', 'glasses', 'hat', 'star', 'crown']]
OUT = os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', 'assets', 'gear') + '/'

def remove_bg(img):
    a = np.asarray(img.convert('RGB')).astype(np.int16); h, w, _ = a.shape
    white = a.min(axis=2) >= 235; bg = np.zeros((h, w), bool); q = deque()
    for x in range(w):
        for y in (0, h - 1):
            if white[y, x] and not bg[y, x]: bg[y, x] = True; q.append((y, x))
    for y in range(h):
        for x in (0, w - 1):
            if white[y, x] and not bg[y, x]: bg[y, x] = True; q.append((y, x))
    while q:
        y, x = q.popleft()
        for ny, nx in ((y-1,x),(y+1,x),(y,x-1),(y,x+1)):
            if 0 <= ny < h and 0 <= nx < w and white[ny, nx] and not bg[ny, nx]: bg[ny, nx] = True; q.append((ny, nx))
    alpha = np.full((h, w), 255, np.uint8); alpha[bg] = 0
    rim = np.zeros((h, w), bool)
    for dy, dx in ((1,0),(-1,0),(0,1),(0,-1)): rim |= (np.roll(bg, (dy, dx), (0, 1)) & ~bg)
    soft = np.clip((255 - a.min(axis=2)) * 255 // 90, 0, 255).astype(np.uint8); alpha[rim] = np.minimum(alpha[rim], soft[rim])
    return Image.fromarray(np.dstack([a.astype(np.uint8), alpha]), 'RGBA')

def runs(mask, min_gap):
    """1D 投影切段：回傳 [(start,end)]，相隔小於 min_gap 的段合併。"""
    out, x = [], 0
    while x < len(mask):
        if mask[x]:
            s = x
            while x < len(mask) and mask[x]: x += 1
            if out and s - out[-1][1] < min_gap: out[-1] = (out[-1][0], x)
            else: out.append((s, x))
        else: x += 1
    return out

img = remove_bg(Image.open(sys.argv[1]))
al = np.asarray(img)[:, :, 3] > 0
# 連通區塊：找出 10 個最大的物件（兩列之間沒有完全空白的橫帶，所以不能用投影切）
h, w = al.shape; lab = np.zeros((h, w), np.int32); comps = []
for y in range(h):
    for x in range(w):
        if al[y, x] and not lab[y, x]:
            cid = len(comps) + 1; lab[y, x] = cid; q = deque([(y, x)]); n = 0; x0 = x1 = x; y0 = y1 = y
            while q:
                cy, cx = q.popleft(); n += 1
                x0 = min(x0, cx); x1 = max(x1, cx); y0 = min(y0, cy); y1 = max(y1, cy)
                for ny, nx in ((cy-1,cx),(cy+1,cx),(cy,cx-1),(cy,cx+1)):
                    if 0 <= ny < h and 0 <= nx < w and al[ny, nx] and not lab[ny, nx]: lab[ny, nx] = cid; q.append((ny, nx))
            comps.append([n, x0, y0, x1 + 1, y1 + 1])
comps.sort(reverse=True); comps = comps[:6]
# 小碎片（例如髮夾的夾子跟星星分開）：併進最近的大物件
rows = [sorted(comps, key=lambda c: c[1])]
assert len(rows[0]) == 6, len(rows[0])
meta = {}
for r, row in enumerate(rows):
    for c, (_, x0, y0, x1, y1) in enumerate(row):
        gid = IDS[r][c]
        if gid.startswith('_'): continue   # 不再使用的格子（圍巾）
        sub = img.crop((x0, y0, x1, y1))
        if gid == 'specs':   # 圓框眼鏡：鏡片裡的淡色改半透明，不然會把眼睛蓋住
            a = np.asarray(sub).copy(); light = a[:, :, :3].min(axis=2) >= 200
            a[:, :, 3] = np.where(light & (a[:, :, 3] > 0), (a[:, :, 3] * 0.3).astype(np.uint8), a[:, :, 3]); sub = Image.fromarray(a, 'RGBA')
        k = 256 / max(sub.size); sub = sub.resize((max(1, round(sub.width * k)), max(1, round(sub.height * k))), Image.LANCZOS)
        sub.quantize(256).save(f'{OUT}{gid}.png', optimize=True)
        meta[gid] = round(sub.width / sub.height, 3)
        print(gid, sub.size, 'bbox', (x0, y0, x1, y1))
print(json.dumps(meta))
