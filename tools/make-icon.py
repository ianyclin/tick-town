"""App 圖示：用 ChatGPT 生成的軟陶圖示（art/clay-raw/clay-appicon.png，1024×1024、不透明）做出各種尺寸。

用法：python3 tools/make-icon.py [來源圖]
輸出 assets/icons/：icon-1024-store.png（方的、不透明，商店用）、icon-1024.png／icon-512.png／icon-192.png（圓角、透明底）、
apple-touch-icon.png（180、方的）、splash.webp（開場動畫用）、icon-maskable-512.png（圖縮到 80% 放中間，四周用原圖邊緣的漸層顏色補滿，留給系統裁）。
"""
import sys, os
from PIL import Image, ImageDraw, ImageFilter
HERE = os.path.dirname(os.path.abspath(__file__))
OUT = os.path.join(HERE, '..', 'assets', 'icons') + '/'
src = Image.open(sys.argv[1] if len(sys.argv) > 1 else os.path.join(HERE, '..', 'art', 'clay-raw', 'clay-appicon.png')).convert('RGB').resize((1024, 1024), Image.LANCZOS)
src.save(OUT + 'icon-1024-store.png', optimize=True)
mask = Image.new('L', (1024, 1024), 0); ImageDraw.Draw(mask).rounded_rectangle([0, 0, 1023, 1023], radius=230, fill=255)
big = src.convert('RGBA'); big.putalpha(mask); big.save(OUT + 'icon-1024.png', optimize=True)
for n in (512, 192): big.resize((n, n), Image.LANCZOS).save(OUT + f'icon-{n}.png', optimize=True)
src.resize((180, 180), Image.LANCZOS).save(OUT + 'apple-touch-icon.png', optimize=True)
# 可裁切版：底色用原圖最左邊那一欄的顏色（上藍下粉的漸層）往四周延伸，縮小的圖貼在中間、邊緣羽化
col = src.crop((4, 0, 5, 1024)); bg = Image.new('RGB', (1024, 1024))
for y in range(1024): bg.paste(col.getpixel((0, min(1023, max(0, round((y - 102) / 0.8))))), (0, y, 1024, y + 1))
small = src.resize((820, 820), Image.LANCZOS); fm = Image.new('L', (820, 820), 0); ImageDraw.Draw(fm).rounded_rectangle([14, 14, 805, 805], radius=60, fill=255); fm = fm.filter(ImageFilter.GaussianBlur(10))
bg.paste(small, (102, 102), fm); bg.resize((512, 512), Image.LANCZOS).save(OUT + 'icon-maskable-512.png', optimize=True)
big.resize((480, 480), Image.LANCZOS).save(OUT + 'splash.webp', 'WEBP', quality=88, method=6)   # 開場動畫用的（比 PNG 小很多）
print('ok')
