from pathlib import Path
from PIL import Image,ImageDraw,ImageFont,ImageFilter
import json,base64,math,random,io
root=Path('tmp/advanced');random.seed(789)
def save(name,im,preset='illustration'):
    im=im.convert('RGBA');im.save(root/(name+'.png'));(root/(name+'.json')).write_text(json.dumps(dict(width=im.width,height=im.height,data=base64.b64encode(im.tobytes()).decode(),preset=preset)))
for name in ['astronaut','chelsea','coffee']:
    im=Image.open(root/'source'/(name+'.png'));im.thumbnail((512,512),Image.Resampling.LANCZOS);save('photo-'+name,im)
im=Image.new('RGB',(768,512),'#fcfaf6');d=ImageDraw.Draw(im);font=ImageFont.truetype('C:/Windows/Fonts/arial.ttf',11)
for y in range(16,500,28):
    for x in range(10,750,85):
        color=random.choice(['#f2f0e7','#edf2f4','#e9f2ee','#f5edf0']);d.rounded_rectangle((x,y,x+78,y+22),radius=4,fill=color,outline='#a0aba8');d.text((x+3,y+4),'R Ω 1.2 / 8.0',font=font,fill='#626e72')
for _ in range(100):
    x=random.randrange(20,748);y=random.randrange(20,492);d.line((x,y,x+random.randrange(-30,30),y+random.randrange(-30,30)),fill='#8093a2',width=1)
save('microtext-pastel-circuit',im,'logo')
im=Image.new('RGBA',(600,480),(0,0,0,0));pix=im.load()
for y in range(480):
    for x in range(600):
        r=math.hypot(x-300,y-240);a=max(0,min(255,int((210-r)*4)));pix[x,y]=(int(80+x*.22),int(35+y*.38),int(220-x*.15),a)
save('feathered-alpha-gradient',im)
im=Image.new('RGB',(700,500),'#fff8ed');d=ImageDraw.Draw(im)
for i in range(600):
    x=random.randint(0,700);y=random.randint(0,500);c=tuple(random.randint(25,230) for _ in range(3));r=random.randint(4,32);d.polygon([(x-r,y),(x,y-r),(x+r,y),(x,y+r)],fill=c,outline='#304755')
save('six-hundred-colored-shapes',im)
im=Image.new('RGB',(700,500),'#fffdf8');d=ImageDraw.Draw(im)
for j in range(140):
    pts=[(x,250+140*math.sin(x*.012+j*.07)+j*.35) for x in range(0,700,3)];d.line(pts,fill=['#263d57','#82604c','#337a67'][j%3],width=1)
save('dense-engraving',im,'logo')
im=Image.new('RGB',(640,480),'#f4ead5');d=ImageDraw.Draw(im)
for _ in range(200):
    x=random.randint(-20,640);y=random.randint(-20,480);r=random.randint(10,80);d.ellipse((x-r,y-r,x+r,y+r),fill=random.choice(['#f2c688','#449080','#ad4e6d','#446c9e','#ddd09c']))
im=im.filter(ImageFilter.GaussianBlur(1.3));buf=io.BytesIO();im.save(buf,'JPEG',quality=18);save('damaged-jpeg-painting',Image.open(io.BytesIO(buf.getvalue())))
im=Image.new('RGB',(1024,640),'white');d=ImageDraw.Draw(im)
for x in range(0,1024,16):d.line((x,0,x,640),fill='#dce5e9',width=1)
for y in range(0,640,16):d.line((0,y,1024,y),fill='#dce5e9',width=1)
for i in range(90):
    x=random.randint(30,990);y=random.randint(30,610);r=random.randint(8,60);d.ellipse((x-r,y-r,x+r,y+r),outline='#31566a',width=2);d.line((x-r,y,x+r,y),fill='#31566a',width=1);d.line((x,y-r,x,y+r),fill='#31566a',width=1)
save('large-cad-grid',im,'logo')
im=Image.new('RGB',(640,480),'white');d=ImageDraw.Draw(im)
for y in range(0,480,4):
    for x in range(0,640,4):
        c=(int(120+90*math.sin(x*.019)),int(120+90*math.sin(y*.027)),int(120+90*math.cos(x*.01+y*.02)));d.rectangle((x,y,x+3,y+3),fill=c if (x//4+y//4)%2 else tuple(int(v*.65) for v in c))
save('chromatic-woven-pattern',im)
print('Generated 10 advanced cases: 3 real photos and 7 procedural stress tests.')
