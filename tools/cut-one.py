"""把一張 ChatGPT 生成的單一配件貼紙圖（白底、只有一樣東西）切成透明 PNG：assets/gear/<id>.png。

用法：python3 tools/cut-one.py <來源圖> <配件 id>   例：python3 tools/cut-one.py medal.webp medal
去背跟 cut-gear.py 一樣（從圖的四邊往內把白色淹掉，外框裡面的白色反光不會被去掉），裁到邊緣、最長邊 256px、256 色。
最後印出寬高比，拿去填 index.html 的 GEAR 表 ar 欄位。
"""
import sys, os
from PIL import Image
OUT = os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', 'assets', 'gear') + '/'

# 直接重用 cut-gear 的去背（不執行它的主程式）
src = open(os.path.join(os.path.dirname(os.path.abspath(__file__)), 'cut-gear.py'), encoding='utf-8').read()
ns = {'__file__': os.path.join(os.path.dirname(os.path.abspath(__file__)), 'cut-gear.py')}; exec(src[:src.index('img = remove_bg(')], ns); remove_bg = ns['remove_bg']

if len(sys.argv) != 3: sys.exit(__doc__)
img = remove_bg(Image.open(sys.argv[1]))
img = img.crop(img.getbbox())
k = 256 / max(img.size); img = img.resize((max(1, round(img.width * k)), max(1, round(img.height * k))), Image.LANCZOS)
img.quantize(256).save(f'{OUT}{sys.argv[2]}.png', optimize=True)
print(sys.argv[2], img.size, 'ar', round(img.width / img.height, 3))
