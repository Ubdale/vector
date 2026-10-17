import Head from 'next/head';
import Script from 'next/script';
import fs from 'node:fs';
import path from 'node:path';
import StudioTools from '../components/StudioTools';

export default function Studio({html}) {
  return <>
    <Head><title>Outline — Image to vector studio</title><meta name="viewport" content="width=device-width, initial-scale=1"/><meta name="description" content="Convert images into editable vectors with Python tracing."/><link rel="stylesheet" href="/style.css"/></Head>
    <div id="studio-root" data-api-base={process.env.NEXT_PUBLIC_API_BASE_URL || 'https://vector-backend-ofrj.onrender.com'} dangerouslySetInnerHTML={{__html:html}} />
    <StudioTools />
    <Script src="/export.js" strategy="afterInteractive" onLoad={() => {
      // Initialize only after the export library and studio DOM are ready.
      const script=document.createElement('script'); script.src='/app.js'; document.body.appendChild(script);
    }} />
  </>;
}
export function getStaticProps() {
  return {props:{html:fs.readFileSync(path.join(process.cwd(),'ui/studio.html'),'utf8')}};
}
