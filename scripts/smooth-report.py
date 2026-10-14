from pathlib import Path
import json
from PIL import Image,ImageDraw,ImageFont
import pypdfium2 as pdfium
rows=['# Smooth-edge validation','', '34 bitmap inputs: the existing 26 cases (including 3 real photographs), plus 8 new bitmap stress images rendered from original vector contours. In addition, 8 direct geometry tests verify holes, winding, displacement bounds, thin paths, and export generation.', '', 'The reference is the engine before smooth finish. Smooth finish rounds supported contours, fits eligible ellipses, preserves tiny or thin contours, and limits per-contour area change to 1.5% (or 1 pixel squared). Faithful detail remains available. Sample buttons now wait for application initialization before accepting input.', '', '## Validation', '', 'npm test passes, including tangent-continuous joins, ellipse fitting, tiny-path preservation, and 8 structural stress cases. PDFs are rendered using PDFium for inspection; EPS and DXF generation and structure are checked. Illustrator itself was not tested.', '', 'Mean pixel error measures resemblance to the input, not smoothness. Rounding intentionally changes corners, so some images have higher pixel error despite smoother edges. This is not a 100% accuracy claim. Photos and small lettering remain approximate; smooth output can be larger.', '', '| Image | Pixel error before | Pixel error smooth | SVG KB before | SVG KB smooth |','|---|---:|---:|---:|---:|']
improved=unchanged=worse=0
for suite in ['quality','complex','advanced','smooth-images']:
    root=Path('tmp')/suite;before={r['name']:r for r in json.loads((root/'metrics-sharp-before.json').read_text())}
    for r in json.loads((root/'metrics-smooth-after.json').read_text()):
        b=before[r['name']];delta=r['mae']-b['mae'];improved+=delta<-.01;worse+=delta>.01;unchanged+=abs(delta)<=.01
        rows.append(f"| {r['name']} | {b['mae']} | {r['mae']} | {b['bytes']/1024:.1f} | {r['bytes']/1024:.1f} |")
rows+=['',f'At a 0.01 threshold: {improved} lower-error cases, {unchanged} effectively unchanged, {worse} higher-error cases. These counts concern pixel resemblance only, not perceived smoothness.', '', 'Reproduce: npm test; scripts/smooth-inputs.py; run scripts/quality-benchmark.cjs sharp-before and smooth-after with QUALITY_ROOT set to each fixture directory; run scripts/quality-score.py for both modes; run scripts/smooth-report.py. The earlier fixture generators and documented sample photographs are required for the existing suites.']
Path('SMOOTH-EDGE-REPORT.md').write_text('\n'.join(rows),encoding='utf-8')
font=ImageFont.truetype('C:/Windows/Fonts/arial.ttf',23);small=ImageFont.truetype('C:/Windows/Fonts/arial.ttf',14)
sheet=Image.new('RGB',(1140,650),'#f8faf7');draw=ImageDraw.Draw(sheet)
for x,text in [(28,'Previous finish'),(592,'Smooth finish')]:draw.text((x,18),text,font=font,fill='#36532d')
for x,mode in [(28,'sharp-before'),(592,'smooth-after')]:
    doc=pdfium.PdfDocument('tmp/smooth-demo/curve-demo-'+mode+'.pdf');im=doc[0].render(scale=8).to_pil().convert('RGB');sheet.paste(im,(x,70));doc.close()
draw.text((28,607),'Same 64 × 64 source · vector output rendered at 8×',font=small,fill='#687a60')
sheet.save('smooth-edge-comparison.png')
print(f'Validated 34 bitmap comparisons: {improved} lower error, {unchanged} unchanged, {worse} higher error. Saved report and edge comparison.')
