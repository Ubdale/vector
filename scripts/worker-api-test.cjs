const fs=require('node:fs'),vm=require('node:vm'),assert=require('node:assert/strict');
(async()=>{
 let request,result;
 const context={fetch:async(url,options)=>{request={url,options};return{ok:true,json:async()=>({svg:'<svg></svg>',engine:'python-opencv'})};},setTimeout:callback=>callback(),postMessage:data=>result=data,onmessage:null};
 vm.createContext(context);vm.runInContext(fs.readFileSync('public/worker.js','utf8'),context);
 const pixels=new Uint8ClampedArray(16);
 await context.onmessage({data:{apiBase:'https://backend.example/',image:{width:2,height:2,data:pixels},settings:{edgeStyle:'smooth'}}});
 assert.equal(request.url,'https://backend.example/api/trace');assert.equal(request.options.body,pixels);assert.equal(request.options.headers['X-Width'],'2');assert.equal(result.engine,'python-opencv');
 result=null;await context.onmessage({data:{image:{width:2,height:2,data:pixels},settings:{}}});assert.match(result.error,/Backend URL is missing/);
 const payload={apiBase:'https://backend.example',image:{width:2,height:2,data:pixels},settings:{}};
 context.fetch=async()=>({ok:false,status:502});await context.onmessage({data:payload});assert.match(result.error,/restarting or waking up/);
 context.fetch=async()=>({ok:false,status:503});await context.onmessage({data:payload});assert.match(result.error,/server is busy/);
 context.fetch=async()=>({ok:true,json:async()=>({svg:'<svg>'})});await context.onmessage({data:payload});assert.match(result.error,/incomplete vector/);
 let attempts=0;context.fetch=async()=>{if(++attempts===1)throw Error('Failed to fetch');return{ok:true,json:async()=>({svg:'<svg></svg>'})};};await context.onmessage({data:payload});assert.equal(attempts,2);assert.equal(result.svg,'<svg></svg>');
 attempts=0;context.fetch=async()=>{attempts++;throw Error('Failed to fetch');};await context.onmessage({data:payload});assert.equal(attempts,2);assert.match(result.error,/Could not reach the tracing server/);
 console.log('Passed: worker sends RGBA to configured backend and reports missing configuration.');
})().catch(error=>{console.error(error);process.exitCode=1;});
