/* Export the absolute M/L/Q/Z paths produced by ImageTracer. No raster embedding. */
(function(root){
  const n=v=>Number(v.toFixed(4)).toString();
  function parse(svg){
    const box=svg.match(/viewBox="0 0 ([\d.]+) ([\d.]+)"/);
    if(!box)throw Error('Missing artwork dimensions');
    const paths=[];
    for(const tag of svg.matchAll(/<path\b[^>]*>/g)){
      const d=tag[0].match(/\bd="([^"]*)"/),rgb=tag[0].match(/fill="rgb\((\d+),(\d+),(\d+)\)"/),a=tag[0].match(/opacity="([\d.]+)"/);
      if(!d||!rgb)throw Error('Unsupported tracing output');
      const opacity=a?Number(a[1]):1;if(opacity===0)continue;
      const tokens=d[1].match(/[MLQZ]|-?\d*\.?\d+(?:e[-+]?\d+)?/gi)||[];const commands=[];
      for(let i=0;i<tokens.length;){const op=tokens[i++].toUpperCase(),count={M:2,L:2,Q:4,Z:0}[op];if(count===undefined)throw Error('Unsupported curve');const values=tokens.slice(i,i+count).map(Number);if(values.length!==count||values.some(v=>!Number.isFinite(v)))throw Error('Invalid path');i+=count;commands.push({op,v:values});}
      paths.push({commands,color:rgb.slice(1).map(Number),opacity});
    }
    return{width:Number(box[1]),height:Number(box[2]),paths};
  }
  function curves(commands,format){let x=0,y=0,start=[0,0];return commands.map(({op,v})=>{if(op==='M'){[x,y]=v;start=v;return `${v.map(n).join(' ')} ${format==='pdf'?'m':'moveto'}`;}if(op==='L'){[x,y]=v;return `${v.map(n).join(' ')} ${format==='pdf'?'l':'lineto'}`;}if(op==='Q'){const [cx,cy,ex,ey]=v,values=[x+2/3*(cx-x),y+2/3*(cy-y),ex+2/3*(cx-ex),ey+2/3*(cy-ey),ex,ey];x=ex;y=ey;return `${values.map(n).join(' ')} ${format==='pdf'?'c':'curveto'}`;}[x,y]=start;return format==='pdf'?'h':'closepath';}).join('\n');}
  function pdf(art){const alphas=[...new Set(art.paths.map(p=>p.opacity))];const content=`q\n1 0 0 -1 0 ${n(art.height)} cm\n`+art.paths.map(p=>`/A${alphas.indexOf(p.opacity)} gs\n${p.color.map(c=>n(c/255)).join(' ')} rg\n${curves(p.commands,'pdf')}\nf\n`).join('')+'Q\n';const objects=['<< /Type /Catalog /Pages 2 0 R >>','<< /Type /Pages /Kids [3 0 R] /Count 1 >>',`<< /Type /Page /Parent 2 0 R /MediaBox [0 0 ${n(art.width)} ${n(art.height)}] /Resources << /ExtGState << ${alphas.map((a,i)=>`/A${i} ${i+5} 0 R`).join(' ')} >> >> /Contents 4 0 R >>`,`<< /Length ${content.length} >>\nstream\n${content}endstream`,...alphas.map(a=>`<< /Type /ExtGState /ca ${n(a)} /CA ${n(a)} >>`)];let output='%PDF-1.4\n',offsets=[0];objects.forEach((obj,i)=>{offsets.push(output.length);output+=`${i+1} 0 obj\n${obj}\nendobj\n`;});const xref=output.length;output+=`xref\n0 ${objects.length+1}\n0000000000 65535 f \n`+offsets.slice(1).map(o=>`${String(o).padStart(10,'0')} 00000 n \n`).join('')+`trailer\n<< /Size ${objects.length+1} /Root 1 0 R >>\nstartxref\n${xref}\n%%EOF\n`;return output;}
  function eps(art){return `%!PS-Adobe-3.0 EPSF-3.0\n%%BoundingBox: 0 0 ${Math.ceil(art.width)} ${Math.ceil(art.height)}\n%%HiResBoundingBox: 0 0 ${n(art.width)} ${n(art.height)}\n%%Creator: Outline Studio\n%%EndComments\ngsave\n0 ${n(art.height)} translate\n1 -1 scale\n`+art.paths.map(p=>`${p.color.map(c=>n((c*p.opacity+255*(1-p.opacity))/255)).join(' ')} setrgbcolor\nnewpath\n${curves(p.commands,'eps')}\nfill\n`).join('')+'grestore\nshowpage\n%%EOF\n';}
  // Adaptive quadratic subdivision: each resulting chord has <=0.25 pixel deviation.
  function contours(commands){const rings=[];let ring=[],x=0,y=0;const append=(a,b)=>ring.push([a,b]);function quad(a,b,c,d,e,f,depth=0){const error=Math.hypot(a-2*c+e,b-2*d+f)/4;if(error<=.25||depth>=12){append(e,f);return;}const ac=(a+c)/2,bd=(b+d)/2,ce=(c+e)/2,df=(d+f)/2,mx=(ac+ce)/2,my=(bd+df)/2;quad(a,b,ac,bd,mx,my,depth+1);quad(mx,my,ce,df,e,f,depth+1);}
    for(const {op,v} of commands){if(op==='M'){if(ring.length)rings.push(ring);ring=[];[x,y]=v;append(x,y);}else if(op==='L'){[x,y]=v;append(x,y);}else if(op==='Q'){quad(x,y,...v);[x,y]=v.slice(2);}else if(op==='Z'){if(ring.length>1&&ring[0][0]===ring.at(-1)[0]&&ring[0][1]===ring.at(-1)[1])ring.pop();if(ring.length>2)rings.push(ring);ring=[];}}if(ring.length>2)rings.push(ring);return rings;}
  function dxf(art){let out='0\nSECTION\n2\nHEADER\n9\n$ACADVER\n1\nAC1009\n0\nENDSEC\n0\nSECTION\n2\nENTITIES\n';for(const p of art.paths)for(const ring of contours(p.commands)){out+='0\nPOLYLINE\n8\nOUTLINE\n66\n1\n70\n1\n10\n0\n20\n0\n30\n0\n';for(const [x,y]of ring)out+=`0\nVERTEX\n8\nOUTLINE\n10\n${n(x)}\n20\n${n(art.height-y)}\n30\n0\n70\n0\n`;out+='0\nSEQEND\n8\nOUTLINE\n';}return out+'0\nENDSEC\n0\nEOF\n';}
  const api={parse,pdf,eps,dxf,contours};if(typeof module!=='undefined')module.exports=api;else root.OutlineExport=api;
})(typeof self!=='undefined'?self:this);
