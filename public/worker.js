onmessage=async({data})=>{try{
const base=data.apiBase;
if(!base)throw Error('Backend URL is missing. Set NEXT_PUBLIC_API_BASE_URL.');
let response;
for(let attempt=0;attempt<2;attempt++){
  try{
    response=await fetch(base.replace(/\/$/,'')+'/api/trace',{method:'POST',headers:{'Content-Type':'application/octet-stream','X-Width':String(data.image.width),'X-Height':String(data.image.height),'X-Settings':JSON.stringify(data.settings)},body:data.image.data});
    break;
  }catch(error){
    if(attempt)throw Error('Could not reach the tracing server. It may be waking up. Your image is kept; try again shortly.');
    // Conversion has no saved side effects. Retry a transient transport failure
    // once; the backend's single-job guard prevents overlapping conversions.
    await new Promise(resolve=>setTimeout(resolve,1500));
  }
}
if(!response.ok){
  const messages={400:'The image or settings were not accepted. Reload the image and try again.',408:'Image upload took too long. Your image is kept; try again.',413:'This image is too large for tracing. Choose standard resolution.',422:'These tracing settings are invalid. Reload the page and try again.',404:'Tracing API not found. Check the configured backend URL.',502:'The tracing server is restarting or waking up. Your image is kept; try again shortly.',503:'The tracing server is busy. Your image is kept; try again shortly.',504:'The tracing server took too long. Try standard resolution or fewer colors.'};
  throw Error(messages[response.status]||'Tracing failed on the server. Your image is kept; try again.');
}
const result=await response.json();
if(typeof result.svg!=='string'||!result.svg.includes('<svg')||!result.svg.trimEnd().endsWith('</svg>'))throw Error('The server returned an incomplete vector. Your image is kept; try again.');
postMessage(result);
}catch(error){postMessage({error:error.message});}};
