"""Generate reproducible image fixtures; no external artwork or services."""
from pathlib import Path
from PIL import Image, ImageDraw, ImageFont, ImageFilter
import random, json, base64, io
root = Path('tmp/quality'); root.mkdir(parents=True, exist_ok=True)
def save(name, image, preset='logo'):
    image=image.convert('RGBA'); image.save(root / (name+'.png'))
    (root/(name+'.json')).write_text(json.dumps(dict(width=image.width,height=image.height,data=base64.b64encode(image.tobytes()).decode(),preset=preset)))
def canvas(): return Image.new('RGBA',(768,768),'white')
im=canvas();d=ImageDraw.Draw(im);d.ellipse((100,100,668,668),fill='#286f61');d.polygon([(200,520),(384,180),(568,520)],fill='white');d.ellipse((530,120,620,210),fill='#e7aa3e');save('curved-logo',im.resize((256,256),Image.Resampling.LANCZOS))
im=canvas();d=ImageDraw.Draw(im);d.line([(70,380),(210,380),(280,190),(370,550),(470,270),(540,380),(700,380)],fill='#233853',width=4);d.rectangle((100,100,180,180),outline='#c92b42',width=3);save('thin-lines',im.resize((256,256),Image.Resampling.LANCZOS))
im=Image.new('RGBA',(240,120),'white');d=ImageDraw.Draw(im);font=ImageFont.truetype('C:/Windows/Fonts/arial.ttf',14);d.text((12,20),'VECTOR 2026 • Details',font=font,fill='#222222');d.text((12,55),'Open paths: A B 8 @',font=font,fill='#173d78');save('small-text',im)
im=Image.new('RGBA',(256,256),(0,0,0,0));d=ImageDraw.Draw(im);d.ellipse((30,30,220,220),fill=(35,110,205,128));d.rectangle((95,95,245,245),fill=(200,45,90,220));save('transparency',im)
im=Image.new('RGBA',(256,128),'white');d=ImageDraw.Draw(im);d.rectangle((12,12,110,116),fill='#28706f');d.rectangle((145,12,243,116),fill='#3a8382');d.rectangle((20,20,35,35),fill='#e32749');d.rectangle((225,105,226,106),fill='#ffba20');save('small-accents',im)
im=Image.new('RGBA',(256,128));pix=im.load()
for y in range(128):
    for x in range(256):pix[x,y]=(int(20+x*.8),int(50+y*1.1),int(210-x*.5),255)
save('gradient',im,'illustration')
im=Image.open(root/'curved-logo.png').convert('RGB');buf=io.BytesIO();im.save(buf,format='JPEG',quality=35);im=Image.open(io.BytesIO(buf.getvalue())).convert('RGBA');save('compressed-logo',im)
im=Image.open(root/'curved-logo.png').convert('RGBA');pix=im.load();random.seed(42)
for y in range(im.height):
    for x in range(im.width):
        c=pix[x,y];pix[x,y]=tuple(max(0,min(255,v+random.randint(-8,8))) for v in c[:3])+(255,)
save('noisy-logo',im)
im=Image.new('RGBA',(256,256),(255,255,255,0));d=ImageDraw.Draw(im);d.rounded_rectangle((35,35,220,220),radius=35,fill=(25,140,90,255));save('hidden-white-transparency',im)
print('Generated 9 image fixtures.')
