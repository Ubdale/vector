/* Editable absolute M/L/Q/C/Z paths. Cubics stay curves in PDF and EPS. */
(function(root){
  const n=v=>Number(v.toFixed(4)).toString();
  function parse(svg){
    const box=svg.match(/viewBox="0 0 ([\d.]+) ([\d.]+)"/);
    if(!box)throw Error('Missing artwork dimensions');
    const paths=[],gradients=new Map();
    const attribute=(tag,key)=>tag.match(new RegExp('(?:^|\\s)'+key+'="([^"]*)"'))?.[1];
    const rgbColor=value=>{const match=value?.match(/^rgb\((\d+),(\d+),(\d+)\)$/);if(!match||match.slice(1).some(v=>+v>255))throw Error('Unsupported tracing color');return match.slice(1).map(Number);};
    const gradientMatrix=tag=>{
      const value=attribute(tag,'gradientTransform');if(value===undefined)return null;
      const match=value.match(/^matrix\(\s*([^)]*)\s*\)$/),matrix=match?.[1].trim().split(/[\s,]+/).map(Number);
      if(!matrix||matrix.length!==6||matrix.some(v=>!Number.isFinite(v))||Math.abs(matrix[0]*matrix[3]-matrix[1]*matrix[2])<1e-10)throw Error('Unsupported tracing gradient transform');
      return matrix;
    };
    const readStops=body=>{
      const stops=[...body.matchAll(/<stop\b[^>]*>/g)].map(stop=>{const opacity=attribute(stop[0],'stop-opacity');if(opacity!==undefined&&Number(opacity)!==1)throw Error('Unsupported tracing gradient');return{offset:Number(attribute(stop[0],'offset')),color:rgbColor(attribute(stop[0],'stop-color'))};});
      if(stops.length<2||stops.length>64||stops[0].offset!==0||stops.at(-1).offset!==1||stops.some((s,i)=>!Number.isFinite(s.offset)||s.offset<0||s.offset>1||(i&&s.offset<=stops[i-1].offset)))throw Error('Unsupported tracing gradient');
      return stops;
    };
    for(const match of svg.matchAll(/<linearGradient\b([^>]*)>([\s\S]*?)<\/linearGradient>/g)){
      const id=attribute(match[1],'id'),coords=['x1','y1','x2','y2'].map(key=>Number(attribute(match[1],key)));
      const stops=readStops(match[2]);
      if(!id||attribute(match[1],'gradientUnits')!=='userSpaceOnUse'||coords.some(v=>!Number.isFinite(v))||Math.hypot(coords[2]-coords[0],coords[3]-coords[1])<1e-6)throw Error('Unsupported tracing gradient');
      gradients.set(id,{coords,transform:gradientMatrix(match[1]),colors:stops.map(stop=>stop.color),offsets:stops.map(stop=>stop.offset)});
    }
    for(const match of svg.matchAll(/<radialGradient\b([^>]*)>([\s\S]*?)<\/radialGradient>/g)){
      const id=attribute(match[1],'id'),cx=Number(attribute(match[1],'cx')),cy=Number(attribute(match[1],'cy')),r=Number(attribute(match[1],'r'));
      const fx=attribute(match[1],'fx'),fy=attribute(match[1],'fy'),fr=attribute(match[1],'fr');
      const stops=readStops(match[2]);
      if(!id||attribute(match[1],'gradientUnits')!=='userSpaceOnUse'||[cx,cy,r].some(v=>!Number.isFinite(v))||r<=0||(fx!==undefined&&Number(fx)!==cx)||(fy!==undefined&&Number(fy)!==cy)||(fr!==undefined&&Number(fr)!==0))throw Error('Unsupported tracing gradient');
      gradients.set(id,{type:3,coords:[cx,cy,0,cx,cy,r],transform:gradientMatrix(match[1]),colors:stops.map(stop=>stop.color),offsets:stops.map(stop=>stop.offset)});
    }
    for(const tag of svg.matchAll(/<path\b[^>]*>/g)){
      const d=tag[0].match(/\bd="([^"]*)"/),fill=attribute(tag[0],'fill'),a=tag[0].match(/(?:^|\s)opacity="([\d.]+)"/),reference=fill?.match(/^url\(#([\w-]+)\)$/),gradient=reference?gradients.get(reference[1]):null;
      if(!d||(reference&&!gradient))throw Error('Unsupported tracing output');
      const color=rgbColor(gradient?attribute(tag[0],'data-fallback-fill'):fill);
      const opacity=a?Number(a[1]):1;if(opacity===0)continue;const fillRule=attribute(tag[0],'fill-rule')||'nonzero';if(!['nonzero','evenodd'].includes(fillRule))throw Error('Unsupported fill rule');
      const tokens=d[1].match(/-?\d*\.?\d+(?:e[-+]?\d+)?|[a-z]/gi)||[];const commands=[];
      for(let i=0;i<tokens.length;){const op=tokens[i++],count={M:2,L:2,Q:4,C:6,Z:0}[op];if(count===undefined)throw Error('Unsupported curve');const values=tokens.slice(i,i+count).map(Number);if(values.length!==count||values.some(v=>!Number.isFinite(v)))throw Error('Invalid path');i+=count;commands.push({op,v:values});}
      paths.push({commands,color,opacity,fillRule,...(gradient?{gradient}: {})});
    }
    return{width:Number(box[1]),height:Number(box[2]),paths};
  }
  function curves(commands,format){let x=0,y=0,start=[0,0];return commands.map(({op,v})=>{if(op==='M'){[x,y]=v;start=v;return `${v.map(n).join(' ')} ${format==='pdf'?'m':'moveto'}`;}if(op==='L'){[x,y]=v;return `${v.map(n).join(' ')} ${format==='pdf'?'l':'lineto'}`;}if(op==='C'){[x,y]=v.slice(4);return `${v.map(n).join(' ')} ${format==='pdf'?'c':'curveto'}`;}if(op==='Q'){const [cx,cy,ex,ey]=v,values=[x+2/3*(cx-x),y+2/3*(cy-y),ex+2/3*(cx-ex),ey+2/3*(cy-ey),ex,ey];x=ex;y=ey;return `${values.map(n).join(' ')} ${format==='pdf'?'c':'curveto'}`;}[x,y]=start;return format==='pdf'?'h':'closepath';}).join('\n');}
  function shading(gradient,opacity=1){
    const colors=gradient.colors.map(color=>color.map(c=>n((c*opacity+255*(1-opacity))/255)).join(' '));
    const pair=(a,b)=>`<< /FunctionType 2 /Domain [0 1] /C0 [${a}] /C1 [${b}] /N 1 >>`;
    const fn=colors.length===2?pair(...colors):`<< /FunctionType 3 /Domain [0 1] /Functions [${colors.slice(1).map((c,i)=>pair(colors[i],c)).join(' ')}] /Bounds [${gradient.offsets.slice(1,-1).map(n).join(' ')}] /Encode [${colors.slice(1).map(()=>'0 1').join(' ')}] >>`;
    return `<< /ShadingType ${gradient.type||2} /ColorSpace /DeviceRGB /Coords [${gradient.coords.map(n).join(' ')}] /Function ${fn} /Extend [true true] >>`;
  }
  function pdf(art){
    const alphas=[...new Set(art.paths.map(p=>p.opacity))],gradients=art.paths.filter(p=>p.gradient).map(p=>p.gradient);
    let gradientIndex=0;
    const content=`q\n1 0 0 -1 0 ${n(art.height)} cm\n`+art.paths.map(p=>{
      const geometry=curves(p.commands,'pdf'),paint=p.gradient?`${geometry}\n${p.fillRule==='evenodd'?'W*':'W'} n\n${p.gradient.transform?p.gradient.transform.map(n).join(' ')+' cm\n':''}/G${gradientIndex++} sh`:`${p.color.map(c=>n(c/255)).join(' ')} rg\n${geometry}\n${p.fillRule==='evenodd'?'f*':'f'}`;
      return `q\n/A${alphas.indexOf(p.opacity)} gs\n${paint}\nQ\n`;
    }).join('')+'Q\n';
    const objects=['<< /Type /Catalog /Pages 2 0 R >>','<< /Type /Pages /Kids [3 0 R] /Count 1 >>',`<< /Type /Page /Parent 2 0 R /MediaBox [0 0 ${n(art.width)} ${n(art.height)}] /Resources << /ExtGState << ${alphas.map((a,i)=>`/A${i} ${i+5} 0 R`).join(' ')} >> /Shading << ${gradients.map((g,i)=>`/G${i} ${i+5+alphas.length} 0 R`).join(' ')} >> >> /Contents 4 0 R >>`,`<< /Length ${content.length} >>\nstream\n${content}endstream`,...alphas.map(a=>`<< /Type /ExtGState /ca ${n(a)} /CA ${n(a)} >>`),...gradients.map(g=>shading(g))];
    let output='%PDF-1.4\n',offsets=[0];objects.forEach((obj,i)=>{offsets.push(output.length);output+=`${i+1} 0 obj\n${obj}\nendobj\n`;});const xref=output.length;
    return output+`xref\n0 ${objects.length+1}\n0000000000 65535 f \n`+offsets.slice(1).map(o=>`${String(o).padStart(10,'0')} 00000 n \n`).join('')+`trailer\n<< /Size ${objects.length+1} /Root 1 0 R >>\nstartxref\n${xref}\n%%EOF\n`;
  }
  function eps(art){
    return `%!PS-Adobe-3.0 EPSF-3.0\n%%BoundingBox: 0 0 ${Math.ceil(art.width)} ${Math.ceil(art.height)}\n%%HiResBoundingBox: 0 0 ${n(art.width)} ${n(art.height)}\n%%LanguageLevel: 3\n%%Creator: Outline Studio\n%%EndComments\ngsave\n0 ${n(art.height)} translate\n1 -1 scale\n`+art.paths.map(p=>{
      const geometry=curves(p.commands,'eps');
      return p.gradient?`gsave\nnewpath\n${geometry}\n${p.fillRule==='evenodd'?'eoclip':'clip'} newpath\n${p.gradient.transform?'['+p.gradient.transform.map(n).join(' ')+'] concat\n':''}${shading(p.gradient,p.opacity)} shfill\ngrestore\n`:`${p.color.map(c=>n((c*p.opacity+255*(1-p.opacity))/255)).join(' ')} setrgbcolor\nnewpath\n${geometry}\n${p.fillRule==='evenodd'?'eofill':'fill'}\n`;
    }).join('')+'grestore\nshowpage\n%%EOF\n';
  }
  // Adaptive subdivision; control hull bounds keep cubics within 0.25 px.
  function contours(commands){const rings=[];let ring=[],x=0,y=0;const append=(a,b)=>ring.push([a,b]);function quad(a,b,c,d,e,f,depth=0){const error=Math.hypot(a-2*c+e,b-2*d+f)/4;if(error<=.25||depth>=12){append(e,f);return;}const ac=(a+c)/2,bd=(b+d)/2,ce=(c+e)/2,df=(d+f)/2,mx=(ac+ce)/2,my=(bd+df)/2;quad(a,b,ac,bd,mx,my,depth+1);quad(mx,my,ce,df,e,f,depth+1);}
    function cubic(a,b,c,d,depth=0){const pointDistance=p=>{const vx=d[0]-a[0],vy=d[1]-a[1],length=vx*vx+vy*vy,t=length?Math.max(0,Math.min(1,((p[0]-a[0])*vx+(p[1]-a[1])*vy)/length)):0;return Math.hypot(p[0]-a[0]-t*vx,p[1]-a[1]-t*vy);};if(Math.max(pointDistance(b),pointDistance(c))<=.25||depth>=18){append(...d);return;}const mid=(u,v)=>[(u[0]+v[0])/2,(u[1]+v[1])/2],ab=mid(a,b),bc=mid(b,c),cd=mid(c,d),abc=mid(ab,bc),bcd=mid(bc,cd),center=mid(abc,bcd);cubic(a,ab,abc,center,depth+1);cubic(center,bcd,cd,d,depth+1);}
    for(const {op,v} of commands){if(op==='M'){if(ring.length)rings.push(ring);ring=[];[x,y]=v;append(x,y);}else if(op==='L'){[x,y]=v;append(x,y);}else if(op==='Q'){quad(x,y,...v);[x,y]=v.slice(2);}else if(op==='C'){cubic([x,y],v.slice(0,2),v.slice(2,4),v.slice(4,6));[x,y]=v.slice(4);}else if(op==='Z'){if(ring.length>1&&ring[0][0]===ring.at(-1)[0]&&ring[0][1]===ring.at(-1)[1])ring.pop();if(ring.length>2)rings.push(ring);ring=[];}}if(ring.length>2)rings.push(ring);return rings;}
  function dxf(art){let out='0\nSECTION\n2\nHEADER\n9\n$ACADVER\n1\nAC1009\n0\nENDSEC\n0\nSECTION\n2\nENTITIES\n';for(const p of art.paths)for(const ring of contours(p.commands)){out+='0\nPOLYLINE\n8\nOUTLINE\n66\n1\n70\n1\n10\n0\n20\n0\n30\n0\n';for(const [x,y]of ring)out+=`0\nVERTEX\n8\nOUTLINE\n10\n${n(x)}\n20\n${n(art.height-y)}\n30\n0\n70\n0\n`;out+='0\nSEQEND\n8\nOUTLINE\n';}return out+'0\nENDSEC\n0\nEOF\n';}
  const api={parse,pdf,eps,dxf,contours};if(typeof module!=='undefined')module.exports=api;else root.OutlineExport=api;
})(typeof self!=='undefined'?self:this);
