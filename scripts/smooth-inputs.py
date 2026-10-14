from pathlib import Path
import pypdfium2 as pdfium
import json,base64
root=Path('tmp/smooth-images');root.mkdir(exist_ok=True)
for source in Path('tmp/smooth-stress').glob('*-source.pdf'):
    name=source.stem.removesuffix('-source');doc=pdfium.PdfDocument(source)
    im=doc[0].render(scale=1,fill_color=(0,0,0,0)).to_pil().convert('RGBA');im.save(root/(name+'.png'))
    (root/(name+'.json')).write_text(json.dumps(dict(width=im.width,height=im.height,data=base64.b64encode(im.tobytes()).decode(),preset='logo')))
    doc.close()
print('Generated 8 raster input images from the original stress contours.')
