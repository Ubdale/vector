const fs=require('node:fs'),assert=require('node:assert/strict');
const quality=require('../public/quality'),tracer=require('../public/vendor/imagetracer'),exp=require('../public/export'),smooth=require('../public/smooth'),before=require('./smooth-before.cjs');
fs.mkdirSync('tmp/smooth-stress',{recursive:true});
const records=[];
const cases={
  'nested-holes':'M 10 10 L 150 10 L 150 150 L 10 150 Z M 30 30 L 30 130 L 130 130 L 130 30 Z',
  'one-pixel-ring':'M 10 10 L 150 10 L 150 150 L 10 150 Z M 11 11 L 11 149 L 149 149 L 149 11 Z',
  'tiny-counters':'M 20 20 L 90 20 L 90 120 L 20 120 Z M 45 40 L 45 44 L 49 44 L 49 40 Z M 45 80 L 45 84 L 49 84 L 49 80 Z',
  'concave-star':'M 80 10 L 95 60 L 150 60 L 108 92 L 125 145 L 80 112 L 35 145 L 52 92 L 10 60 L 65 60 Z',
  'thin-zigzag':'M 10 20 L 80 60 L 150 20 L 150 22 L 80 62 L 10 22 Z',
  'rounded-caption':'M 10 10 L 155 10 L 155 55 L 10 55 Z M 30 25 L 30 35 L 33 35 L 33 25 Z',
  'translucent-overlap':'M 20 20 Q 80 -10 140 20 L 140 120 Q 80 150 20 120 Z',
  'dense-wavy-contour':Array.from({length:24000},(_,i)=>{const t=i*Math.PI*2/24000,r=60+8*Math.sin(t*79);return `${i?'L':'M'} ${(80+Math.cos(t)*r).toFixed(4)} ${(80+Math.sin(t)*r).toFixed(4)}`;}).join(' ')+' Z'
};
for(const [name,d]of Object.entries(cases)){
  const opacity=name==='translucent-overlap'?.5:1;
  const svg=`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 160 160"><path fill="rgb(45,115,85)" opacity="${opacity}" d="${d}"/></svg>`;
  const start=performance.now(),a=before.smooth(svg,{edgeStyle:'smooth',rounding:2}),b=smooth.smooth(svg,{edgeStyle:'smooth',rounding:2});
  const original=smooth.rings(d),output=smooth.rings(exp.parse(b).paths[0].commands.map(c=>c.op+' '+c.v.join(' ')).join(' '));
  assert.equal(output.length,original.length,'hole count changed');
  original.forEach((p,i)=>{assert.equal(Math.sign(smooth.area(p)),Math.sign(smooth.area(output[i])),'winding changed');const bd=smooth.bounds(p),ad=smooth.bounds(output[i]);for(const key of Object.keys(bd))assert.ok(Math.abs(bd[key]-ad[key])<2.1,'contour moved outside softness bound');});
  if(name==='one-pixel-ring'||name==='thin-zigzag')assert.equal(b,svg,'thin geometry must be preserved');
  fs.writeFileSync(`tmp/smooth-stress/${name}-source.pdf`,exp.pdf(exp.parse(svg)));fs.writeFileSync(`tmp/smooth-stress/${name}-before.pdf`,exp.pdf(exp.parse(a)));fs.writeFileSync(`tmp/smooth-stress/${name}-after.pdf`,exp.pdf(exp.parse(b)));
  assert.match(exp.eps(exp.parse(b)),/%%EOF/);assert.match(exp.dxf(exp.parse(b)),/\nEOF\n$/);
  records.push({name,contours:output.length,bytesBefore:Buffer.byteLength(a),bytesAfter:Buffer.byteLength(b),ms:Math.round(performance.now()-start)});
}
fs.writeFileSync('tmp/smooth-stress/results.json',JSON.stringify(records,null,2));console.log('Passed 8 stress cases: holes, winding, displacement bounds, thin geometry, large contours, and PDF/EPS/DXF generation.');
