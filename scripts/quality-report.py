from pathlib import Path
import json
from PIL import Image, ImageDraw, ImageFont
root=Path('tmp/quality');before={r['name']:r for r in json.loads((root/'metrics-baseline.json').read_text())};after=json.loads((root/'metrics-improved.json').read_text())
rows=['# Vector tracing quality check','', 'Nine generated fixtures: logos, JPEG compression, noise, small text, thin lines, gradients, small accents, and two transparency cases. Baseline is the implementation before edge recovery. Both runs use eight requested colors; adaptive illustration mode uses 32 for the gradient.', '', 'SVG curves are exported to PDF and rasterized with PDFium at the original pixel dimensions. Error is mean absolute RGB difference (0–255), measured on white and black backgrounds. Lower is better. This measures these fixtures, not performance against commercial tools or a representative production dataset.', '', '| Image | White error before | White error after | Paths before | Paths after |','|---|---:|---:|---:|---:|']
for r in after:
    b=before[r['name']];assert r['mae']<=b['mae']+.01,(r['name'],'white regression');assert r['mae_black']<=b['mae_black']+.01,(r['name'],'black regression')
    rows.append(f"| {r['name']} | {b['mae']} | {r['mae']} | {b['paths']} | {r['paths']} |")
rows+=['','All nine fixtures have equal or lower average RGB error on both backgrounds. Gradients remain quantized into solid colors; increasing colors improves fidelity at the cost of more shapes. Adaptive colors slightly increase alpha seams in the gradient, so lower RGB error does not mean every pixel or metric improves. Small text remains outlines, not editable typography. Some inputs take longer due to supersampling.','', 'Reproduce: run scripts/quality-fixtures.py, node scripts/quality-benchmark.cjs baseline, node scripts/quality-benchmark.cjs improved, scripts/quality-score.py baseline, scripts/quality-score.py improved, then scripts/quality-report.py. Python requires Pillow and pypdfium2 (available in the bundled runtime).']
Path('QUALITY-REPORT.md').write_text('\n'.join(rows),encoding='utf-8')
font=ImageFont.truetype('C:/Windows/Fonts/arial.ttf',18);small=ImageFont.truetype('C:/Windows/Fonts/arial.ttf',14)
sheet=Image.new('RGB',(1140,670),'#f8faf7');draw=ImageDraw.Draw(sheet)
for x,label in [(155,'Source'),(510,'Before'),(865,'After')]:draw.text((x,18),label,font=font,fill='#36532d')
for y,name in [(65,'curved-logo'),(265,'small-text'),(465,'thin-lines')]:
    draw.text((12,y),name,font=small,fill='#536747')
    for x,file in [(145,name+'.png'),(500,name+'-baseline-render.png'),(855,name+'-improved-render.png')]:
        im=Image.open(root/file).convert('RGBA');bg=Image.new('RGBA',im.size,'white');im=Image.alpha_composite(bg,im).convert('RGB');im.thumbnail((265,175));sheet.paste(im,(x,y+20))
sheet.save('quality-comparison.png');print('Passed all nine before/after RGB checks; saved QUALITY-REPORT.md and comparison image.')
