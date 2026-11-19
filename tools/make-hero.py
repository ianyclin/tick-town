"""App Store「標題和搜尋結果」素材：把 ChatGPT 生成的主視覺（art/hero-raw/hero.png，16:9）做成 App Store 要的尺寸（不透明 PNG）。
用法：python3 tools/make-hero.py
輸出 store/hero/：universal-5244x2950.png（通用，一張就好）、title-3840x1646.png（標題 21:9）、search-3840x2560.png（搜尋結果 3:2）。
原圖只有 1672 寬，放大約 3 倍會有點軟；放大後加一點點銳利化。裁切時保留中間（鐘樓和動物都在中間 60%）。
"""
import os
from PIL import Image, ImageFilter
HERE = os.path.dirname(os.path.abspath(__file__)); ROOT = os.path.join(HERE, '..'); OUT = os.path.join(ROOT, 'store', 'hero')
src = Image.open(os.path.join(ROOT, 'art', 'hero-raw', 'hero.png')).convert('RGB'); W, H = src.size
def make(w, h, name, cy=0.5):
    ar = w / h
    if W / H > ar: cw, ch = round(H * ar), H
    else: cw, ch = W, round(W / ar)
    x0 = (W - cw) // 2; y0 = round((H - ch) * cy)
    im = src.crop((x0, y0, x0 + cw, y0 + ch)).resize((w, h), Image.LANCZOS).filter(ImageFilter.UnsharpMask(radius=2, percent=60, threshold=2))
    im.save(os.path.join(OUT, name), optimize=True); print(name, im.size, os.path.getsize(os.path.join(OUT, name)) // 1024, 'KB')
os.makedirs(OUT, exist_ok=True)
make(5244, 2950, 'universal-5244x2950.png')
make(3840, 1646, 'title-3840x1646.png', cy=0.58)   # 21:9：上下都要裁；原圖 y 130～847 剛好放得下屋頂到動物的腳
make(3840, 2560, 'search-3840x2560.png')
