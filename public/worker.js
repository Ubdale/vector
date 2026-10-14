onmessage=async({data})=>{try{
const base=data.apiBase;
if(!base)throw Error('Backend URL is missing. Set NEXT_PUBLIC_API_BASE_URL.');
const response=await fetch(base.replace(/\/$/,'')+'/api/trace',{method:'POST',headers:{'Content-Type':'application/octet-stream','X-Width':String(data.image.width),'X-Height':String(data.image.height),'X-Settings':JSON.stringify(data.settings)},body:data.image.data});
if(!response.ok)throw Error(response.status===503?'Backend is busy. Try again shortly.':response.status===404?'Tracing API not found. Check the configured backend URL.':'Python tracing failed. Try fewer colors or standard resolution.');
postMessage(await response.json());
}catch(error){postMessage({error:error.message});}};
