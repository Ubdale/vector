"""Procedural complex test artwork. Includes a photo-like scene, not a real photo."""
from pathlib import Path
from PIL import Image, ImageDraw, ImageFont, ImageFilter
import random, math, json, base64
root=Path('tmp/complex');root.mkdir(parents=True,exist_ok=True);random.seed(1234)
def save(name,im,preset='illustration'):
    im=im.convert('RGBA');im.save(root/(name+'.png'));(root/(name+'.json')).write_text(json.dumps(dict(width=im.width,height=im.height,data=base64.b64encode(im.tobytes()).decode(),preset=preset)))
font=ImageFont.truetype('C:/Windows/Fonts/arial.ttf',12);large=ImageFont.truetype('C:/Windows/Fonts/arialbd.ttf',30)
im=Image.new('RGB',(640,420),'#192d4e');d=ImageDraw.Draw(im)
for y in range(420):d.line((0,y,640,y),fill=(25+y//8,45+y//5,85+y//7))
d.ellipse((450,30,550,130),fill='#ffc974')
for x in range(0,640,45):
    top=random.randint(100,220);d.rectangle((x,top,x+40,370),fill=random.choice(['#264d61','#45696e','#394359','#794954']))
    for wx in range(x+5,x+36,10):
        for wy in range(top+10,360,16):d.rectangle((wx,wy,wx+5,wy+8),fill=random.choice(['#ffc580','#c98550','#375671']))
d.polygon([(0,370),(640,370),(640,420),(0,420)],fill='#152735')
for x in range(0,640,40):d.line((x,395,x+18,395),fill='#b5b4a6',width=2)
d.text((20,25),'MIDNIGHT CITY',font=large,fill='#ffeecc');save('city-poster',im)
im=Image.new('RGB',(576,576),'#f6edda');d=ImageDraw.Draw(im)
for ring in range(7):
    radius=35+ring*32
    for i in range(24):
        a=i*math.tau/24+ring*.13;x=288+math.cos(a)*radius;y=288+math.sin(a)*radius;r=7+ring*2
        d.ellipse((x-r,y-r,x+r,y+r),outline=['#9f394d','#2d716d','#d99436'][ring%3],width=2)
        d.line((288+math.cos(a)*(radius-25),288+math.sin(a)*(radius-25),x,y),fill='#534268',width=1)
for r in range(25,270,30):d.ellipse((288-r,288-r,288+r,288+r),outline='#2d716d',width=1)
save('fine-mandala',im,'logo')
im=Image.new('RGB',(720,480),'white');d=ImageDraw.Draw(im)
for row in range(5):
    for col in range(6):
        x=20+col*115;y=20+row*90;d.rounded_rectangle((x,y,x+95,y+60),radius=8,fill=['#e5eef8','#dcf1e1','#fff0d6'][row%3],outline='#506883',width=1);d.text((x+7,y+8),f'Node {row*6+col+1}',font=font,fill='#203653');d.text((x+7,y+30),'8.4 kΩ / 12 V',font=font,fill='#516f8a')
        if col<5:d.line((x+95,y+30,x+114,y+30),fill='#21405a',width=1)
        if row<4:d.line((x+50,y+60,x+50,y+89),fill='#af4360',width=1)
save('dense-technical-diagram',im,'logo')
im=Image.new('RGBA',(540,420),(0,0,0,0))
for i in range(80):
    overlay=Image.new('RGBA',im.size);d=ImageDraw.Draw(overlay);x=random.randint(-40,500);y=random.randint(-40,380);r=random.randint(20,120);d.ellipse((x-r,y-r,x+r,y+r),fill=(*[random.randint(20,235) for _ in range(3)],random.randint(40,190)));im=Image.alpha_composite(im,overlay)
save('overlapping-translucent-shapes',im)
im=Image.new('RGB',(576,384));pixels=im.load()
for y in range(384):
    for x in range(576):
        noise=random.uniform(-12,12);v=math.sin(x*.025)*math.cos(y*.018);pixels[x,y]=tuple(max(0,min(255,int(c+noise))) for c in (130+80*v,110+70*math.sin(y*.022),140+60*math.cos(x*.02+y*.009)))
im=im.filter(ImageFilter.GaussianBlur(.65));d=ImageDraw.Draw(im);d.text((30,120),'COLOR / FORM',font=large,fill='#fff4d6');save('textured-artwork',im)
im=Image.new('RGB',(640,420));pixels=im.load()
for y in range(420):
    for x in range(640):
        horizon=215+18*math.sin(x*.012);n=random.uniform(-10,10)
        if y<horizon:c=(105+y*.25,150+y*.15,205+y*.05)
        else:
            ripples=15*math.sin(y*.34+x*.01);c=(25+ripples,100+ripples,110+ripples)
        pixels[x,y]=tuple(max(0,min(255,int(v+n))) for v in c)
d=ImageDraw.Draw(im);d.polygon([(0,230),(140,80),(230,210),(350,95),(450,230)],fill='#536775');d.polygon([(120,100),(140,80),(168,114)],fill='#d4dce1')
for _ in range(700):
    x=random.randint(450,639);y=random.randint(210,419);r=random.randint(1,8);d.ellipse((x-r,y-r,x+r,y+r),fill=random.choice(['#294c3c','#48664a','#719065']))
save('photo-like-landscape',im)
im=Image.new('RGB',(600,400),'#f7f1e5');d=ImageDraw.Draw(im)
for i in range(200):
    x=random.randint(0,600);y=random.randint(0,400);a=random.random()*math.tau;r=random.randint(10,65);pts=[(x+math.cos(a+k*math.tau/5)*r,y+math.sin(a+k*math.tau/5)*r) for k in range(5)];d.polygon(pts,fill=random.choice(['#b04a5a','#3d887d','#e4b449','#435c95','#b791c1']),outline='#253946')
save('overlapping-illustration',im)
print('Generated 7 complex fixtures (procedural artwork; landscape is photo-like).')
