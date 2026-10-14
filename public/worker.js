importScripts('vendor/imagetracer.js');
importScripts('quality.js');
importScripts('smooth.js');
onmessage=({data})=>{try{const svg=OutlineQuality.trace(data.image,data.settings,ImageTracer);postMessage({svg});}catch(error){postMessage({error:error.message});}};
