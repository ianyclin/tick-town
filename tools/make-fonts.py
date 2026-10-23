#!/usr/bin/env python3
"""把 Google Fonts 倉庫的字型切成遊戲用的子集（woff2），放進 assets/fonts。
用法：python3 tools/make-fonts.py <來源目錄>
來源目錄要有 ChironGoRoundTC[wght].ttf（可變字型）、LilitaOne-Regular.ttf、ZenMaruGothic-Regular/Bold/Black.ttf，
下載自 https://github.com/google/fonts/tree/main/ofl/chirongoroundtc、ofl/lilitaone、ofl/zenmarugothic。
需要 pip install fonttools brotli。改了 index.html 的文字之後要重跑一次（新字才會有）。

中文與英文用 Chiron GoRound TC：取 index.html 裡日文字串表（STR 的 ja 區塊）以外的所有字。
日文用 Zen Maru Gothic（日本的字形，Chiron 是台灣／香港字形）：取 ja 區塊的字，再加上全部假名（孩子打名字用）。
ja 區塊靠 index.html 裡的 '\n  ja: {' 到下一個 '\n  },' 找，改那段的縮排要一起改這裡。
"""
import sys, os
from fontTools.ttLib import TTFont
from fontTools.varLib import instancer
from fontTools import subset
src = sys.argv[1]; root = os.path.dirname(os.path.dirname(os.path.abspath(__file__))); out = os.path.join(root, 'assets', 'fonts'); os.makedirs(out, exist_ok=True)
html = open(os.path.join(root, 'index.html'), encoding='utf-8').read()
a = html.index('\n  ja: {'); b = html.index('\n  },', a)
ja_block, rest = html[a:b], html[:a] + html[b:]
base = set('0123456789+−×÷=？?！!，。、：；「」（）〈〉《》…・·★☆♥✓✕～~%/-–—′″℃ 　')
base |= set(chr(c) for c in range(0x20, 0x7f)) | set(chr(c) for c in range(0xff01, 0xff5f))
clean = lambda chars: ''.join(sorted(c for c in chars if c >= ' ' and c not in '\u2028\u2029'))
zh_text = clean(set(rest) | base)
ja_text = clean(set(ja_block) | base | set(chr(c) for c in range(0x3041, 0x3097)) | set(chr(c) for c in range(0x30a1, 0x30fb)) | set('ーゝゞヽヾ〜'))
print('chiron chars', len(zh_text), 'cjk', sum(1 for c in zh_text if '一' <= c <= '鿿'))
print('zenmaru chars', len(ja_text), 'kanji', sum(1 for c in ja_text if '一' <= c <= '鿿'))
def sub(path, dst, text):
    o = subset.Options(); o.flavor = 'woff2'; o.layout_features = ['*']; o.name_IDs = ['*']; o.notdef_outline = True; o.hinting = False; o.desubroutinize = True
    f = TTFont(path); ss = subset.Subsetter(o); ss.populate(text=text); ss.subset(f); f.flavor = 'woff2'; f.save(dst); print(dst, os.path.getsize(dst))
vf = TTFont(os.path.join(src, 'ChironGoRoundTC[wght].ttf'))
for w in (400, 700, 900):
    inst = instancer.instantiateVariableFont(vf, {'wght': w}, inplace=False, updateFontNames=False)
    tmp = os.path.join(out, f'chiron-{w}.tmp.ttf'); inst.save(tmp); sub(tmp, os.path.join(out, f'chiron-{w}.woff2'), zh_text); os.remove(tmp)
for w, name in ((400, 'Regular'), (700, 'Bold'), (900, 'Black')):
    sub(os.path.join(src, f'ZenMaruGothic-{name}.ttf'), os.path.join(out, f'zenmaru-{w}.woff2'), ja_text)
sub(os.path.join(src, 'LilitaOne-Regular.ttf'), os.path.join(out, 'lilita.woff2'), ''.join(chr(c) for c in range(0x20, 0x7f)) + '×−＋？！：・…')
