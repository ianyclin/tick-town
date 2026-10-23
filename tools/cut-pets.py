"""把 ChatGPT 生成的「角色成長圖」（一隻五階段並排、白底）切成遊戲用的 15 張透明 PNG。

用法：python3 tools/cut-pets.py <來源資料夾>
來源資料夾放 owl.png（貓頭鷹）、squirrel.png（松鼠）、bear.png（小熊）、legend.png（傳說），有哪張切哪張，每張由左到右是蛋、幼體、少年、成體、究極。
輸出到 assets/pets/{kind}-{0..4}.png（400×400、256 色、透明背景、同一隻五張共用比例、底部對齊）。
結束時印出每張的精靈位置，拿去換 index.html 裡的 PET_HEAD（頭中心與半徑要看截圖微調）。
需要 Pillow 與 numpy，沒有其他相依。
"""
import sys, os, json
import numpy as np
from PIL import Image
from collections import deque
SRC = (sys.argv[1] if len(sys.argv) > 1 else 'pet-src').rstrip('/') + '/'
SHEETS = {k: f'{k}.png' for k in ('owl', 'squirrel', 'bear', 'legend') if os.path.exists(os.path.join(SRC, f'{k}.png'))}   # 來源有哪幾張就切哪幾張
OUT = os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', 'assets', 'pets') + '/'
CANVAS = 400

def remove_bg(img):
    """白底去背：從邊框 flood fill 近白區域；邊緣依白度做半透明。角色內部的白（眼白、反光）保留。"""
    a = np.asarray(img.convert('RGB')).astype(np.int16)
    h, w, _ = a.shape
    white = (a.min(axis=2) >= 235)            # 近白
    bg = np.zeros((h, w), bool)
    q = deque()
    for x in range(w):
        for y in (0, h - 1):
            if white[y, x] and not bg[y, x]: bg[y, x] = True; q.append((y, x))
    for y in range(h):
        for x in (0, w - 1):
            if white[y, x] and not bg[y, x]: bg[y, x] = True; q.append((y, x))
    while q:
        y, x = q.popleft()
        for ny, nx in ((y-1,x),(y+1,x),(y,x-1),(y,x+1)):
            if 0 <= ny < h and 0 <= nx < w and white[ny, nx] and not bg[ny, nx]:
                bg[ny, nx] = True; q.append((ny, nx))
    alpha = np.full((h, w), 255, np.uint8)
    alpha[bg] = 0
    # 邊緣柔化：背景旁一圈的非背景像素，依「離白多遠」給 alpha（抗鋸齒殘留的淡色邊）
    rim = np.zeros((h, w), bool)
    for dy, dx in ((1,0),(-1,0),(0,1),(0,-1)):
        s = np.roll(bg, (dy, dx), (0, 1)); rim |= (s & ~bg)
    whiteness = a.min(axis=2)
    soft = np.clip((255 - whiteness) * 255 // 90, 0, 255).astype(np.uint8)   # min 通道 ≥165 才開始變透明
    alpha[rim] = np.minimum(alpha[rim], soft[rim])
    rgba = np.dstack([a.astype(np.uint8), alpha])
    return Image.fromarray(rgba, 'RGBA')

def split5(img):
    """依欄投影切成 5 塊：找 4 個最寬的「幾乎空白」欄縫，從縫中間切。"""
    al = np.asarray(img)[:, :, 3]
    cnt = (al > 0).sum(axis=0)
    for thr in (0, 2, 6, 15, 40):
        empty = cnt <= thr
        gaps, x = [], 0
        while x < len(empty):
            if empty[x]:
                s = x
                while x < len(empty) and empty[x]: x += 1
                if s > 0 and x < len(empty): gaps.append((x - s, s, x))
            else: x += 1
        gaps.sort(reverse=True)
        if len(gaps) >= 4: break
    cuts = sorted((s + e) // 2 for _, s, e in gaps[:4])
    print('  cuts', cuts, 'thr', thr)
    bounds = [0] + cuts + [img.width]
    out = []
    for s, e in zip(bounds, bounds[1:]):
        sub = img.crop((s, 0, e, img.height)); out.append(sub.crop(sub.getbbox()))
    return out

meta = {}
for kind, f in SHEETS.items():
    im = remove_bg(Image.open(SRC + f))
    parts = split5(im)
    scale = min((CANVAS - 20) / max(p.height for p in parts), (CANVAS - 8) / max(p.width for p in parts))   # 同一隻五張共用比例，長大看得出來
    meta[kind] = []
    for i, p in enumerate(parts):
        w, h = int(p.width * scale), int(p.height * scale)
        p2 = p.resize((w, h), Image.LANCZOS)
        canvas = Image.new('RGBA', (CANVAS, CANVAS), (0, 0, 0, 0))
        x0, y0 = (CANVAS - w) // 2, CANVAS - 10 - h          # 置中、底部對齊
        canvas.paste(p2, (x0, y0), p2)
        canvas.quantize(256).save(f'{OUT}{kind}-{i}.png', optimize=True)   # 256 色 PNG，檔案小很多
        meta[kind].append({'x': x0, 'y': y0, 'w': w, 'h': h})
        print(kind, i, 'sprite', (w, h), 'at', (x0, y0))
print(json.dumps(meta))
