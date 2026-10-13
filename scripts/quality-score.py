from pathlib import Path
import json, sys
from PIL import Image, ImageChops, ImageStat, ImageDraw
import pypdfium2 as pdfium
root=Path(sys.argv[2]) if len(sys.argv)>2 else Path('tmp/quality');variant=sys.argv[1] if len(sys.argv)>1 else 'baseline'
records=json.loads((root/f'metrics-{variant}.json').read_text())
sheet=Image.new('RGB',(900, len(records)*180),'#f8faf7');draw=ImageDraw.Draw(sheet)
for row,record in enumerate(records):
    name=record['name'];source=Image.open(root/(name+'.png')).convert('RGBA')
    pdf=pdfium.PdfDocument(root/f'{name}-{variant}.pdf');render=pdf[0].render(scale=1,fill_color=(0,0,0,0)).to_pil().convert('RGBA');render.save(root/f'{name}-{variant}-render.png')
    background=Image.new('RGBA',source.size,'white');source_white=Image.alpha_composite(background,source).convert('RGB');render_white=Image.alpha_composite(background,render).convert('RGB')
    record['mae']=round(sum(ImageStat.Stat(ImageChops.difference(source_white,render_white)).mean)/3,3)
    record['alpha_mae']=round(ImageStat.Stat(ImageChops.difference(source.getchannel('A'),render.getchannel('A'))).mean[0],3)
    black=Image.new('RGBA',source.size,'black');record['mae_black']=round(sum(ImageStat.Stat(ImageChops.difference(Image.alpha_composite(black,source).convert('RGB'),Image.alpha_composite(black,render).convert('RGB'))).mean)/3,3)
    record['max_channel_error']=max(v[1] for v in ImageChops.difference(source_white,render_white).getextrema())
    draw.text((8,row*180+12),name,fill='#24302a');draw.text((8,row*180+40),f"Error {record['mae']} / 255\n{record['paths']} paths",fill='#53684a')
    for image,x in [(source_white,220),(render_white,550)]:image.thumbnail((300,155));sheet.paste(image,(x,row*180+15))
    pdf.close()
sheet.save(root/f'contact-sheet-{variant}.png');(root/f'metrics-{variant}.json').write_text(json.dumps(records,indent=2));print(json.dumps(records))
