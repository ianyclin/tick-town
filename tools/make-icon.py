#!/usr/bin/env python3
"""畫 App 圖示：天空藍的圓角方塊上一座米白鐘面，藍色短針（烏龜）指 10、紅色長針（兔子）指 2（10:10），針尖有小臉。
用法：python3 tools/make-icon.py
輸出 assets/icons/：icon-1024.png（商店）、icon-512.png、icon-192.png（加入主畫面）、apple-touch-icon.png（180）、icon-maskable-512.png（Android 自適應圖示，內容縮在安全區）。
圖是程式畫的（不是 AI 生成），可以放心商用。
"""
import os, math
from PIL import Image, ImageDraw, ImageFilter
ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
OUT = os.path.join(ROOT, 'assets', 'icons'); os.makedirs(OUT, exist_ok=True)
S = 1024


def draw(scale_content=1.0, rounded=True):
    im = Image.new('RGBA', (S, S), (0, 0, 0, 0)); d = ImageDraw.Draw(im)
    # 背景：上淡藍、下米白的天空
    bg = Image.new('RGBA', (S, S)); bd = ImageDraw.Draw(bg)
    for y in range(S):
        k = y / S; c = tuple(round(a + (b - a) * k) for a, b in zip((126, 196, 255), (255, 233, 201))); bd.line([(0, y), (S, y)], fill=c + (255,))
    # 草地
    bd.ellipse([-S * 0.3, S * 0.78, S * 1.3, S * 1.6], fill=(121, 195, 94, 255))
    mask = Image.new('L', (S, S), 0); ImageDraw.Draw(mask).rounded_rectangle([0, 0, S - 1, S - 1], radius=int(S * 0.22) if rounded else 0, fill=255)
    im.paste(bg, (0, 0), mask)
    d = ImageDraw.Draw(im)
    cx, cy, R = S / 2, S * 0.47, S * 0.36 * scale_content
    # 影子
    sh = Image.new('RGBA', (S, S), (0, 0, 0, 0)); ImageDraw.Draw(sh).ellipse([cx - R, cy - R + S * 0.03, cx + R, cy + R + S * 0.03], fill=(60, 40, 20, 90)); sh = sh.filter(ImageFilter.GaussianBlur(S * 0.02)); im.alpha_composite(sh)
    d = ImageDraw.Draw(im)
    d.ellipse([cx - R, cy - R, cx + R, cy + R], fill=(232, 201, 143, 255))
    r2 = R * 0.9; d.ellipse([cx - r2, cy - r2, cx + r2, cy + r2], fill=(255, 250, 240, 255))
    for i in range(12):   # 粗刻度
        a = i * math.pi / 6; x1, y1 = cx + r2 * 0.78 * math.sin(a), cy - r2 * 0.78 * math.cos(a); x2, y2 = cx + r2 * 0.92 * math.sin(a), cy - r2 * 0.92 * math.cos(a)
        d.line([(x1, y1), (x2, y2)], fill=(91, 74, 58, 255), width=int(S * 0.022))

    def hand(ang, L, w, col, face):
        a = math.radians(ang); x, y = cx + L * math.sin(a), cy - L * math.cos(a)
        d.line([(cx, cy), (x, y)], fill=col, width=int(w)); r = face; d.ellipse([x - r, y - r, x + r, y + r], fill=col)
        return x, y
    # 時針（烏龜，藍、短）指 10:10 的時針位置；分針（兔子，紅、長）指 2
    hx, hy = hand(-55, r2 * 0.5, S * 0.05, (58, 111, 216, 255), S * 0.025)
    tr = S * 0.075; d.ellipse([hx - tr, hy - tr * 0.85, hx + tr, hy + tr * 0.85], fill=(127, 194, 74, 255), outline=(79, 143, 42, 255), width=int(S * 0.012))   # 烏龜臉
    for ex in (-0.33, 0.33): d.ellipse([hx + tr * ex - S * 0.012, hy - tr * 0.2 - S * 0.012, hx + tr * ex + S * 0.012, hy - tr * 0.2 + S * 0.012], fill=(34, 34, 51, 255))
    mx, my = hand(60, r2 * 0.74, S * 0.034, (229, 83, 75, 255), S * 0.018)
    br = S * 0.07   # 兔子臉＋耳朵
    for ex in (-0.45, 0.45): d.ellipse([mx + br * ex - br * 0.28, my - br * 1.9, mx + br * ex + br * 0.28, my - br * 0.4], fill=(255, 255, 255, 255), outline=(227, 163, 163, 255), width=int(S * 0.01))
    d.ellipse([mx - br, my - br, mx + br, my + br], fill=(255, 255, 255, 255), outline=(227, 163, 163, 255), width=int(S * 0.012))
    for ex in (-0.35, 0.35): d.ellipse([mx + br * ex - S * 0.011, my - br * 0.15 - S * 0.011, mx + br * ex + S * 0.011, my - br * 0.15 + S * 0.011], fill=(34, 34, 51, 255))
    d.ellipse([mx - S * 0.012, my + br * 0.25, mx + S * 0.012, my + br * 0.4], fill=(240, 138, 138, 255))
    c = S * 0.03; d.ellipse([cx - c, cy - c, cx + c, cy + c], fill=(91, 74, 58, 255))
    return im


big = draw()
big.save(os.path.join(OUT, 'icon-1024.png'))
flat = Image.new('RGB', (S, S), (255, 248, 234)); flat.paste(draw(rounded=False), (0, 0), draw(rounded=False))   # 商店要的不透明正方形（圓角由系統加）
flat.save(os.path.join(OUT, 'icon-1024-store.png'))
for n in (512, 192):
    big.resize((n, n), Image.LANCZOS).save(os.path.join(OUT, f'icon-{n}.png'))
flat.resize((180, 180), Image.LANCZOS).save(os.path.join(OUT, 'apple-touch-icon.png'))
mk = draw(scale_content=0.78, rounded=False); mk.resize((512, 512), Image.LANCZOS).save(os.path.join(OUT, 'icon-maskable-512.png'))
print('icons:', sorted(os.listdir(OUT)))
