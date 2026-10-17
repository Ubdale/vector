import {useState} from 'react';
import {motion, useReducedMotion} from 'motion/react';
import {ArrowUpRight, MoveHorizontal} from 'lucide-react';

// A small, explicitly illustrative curve tool, separate from the real tracing preview.
export default function CurvePlayground() {
  const [bend,setBend]=useState(66);
  const [points,setPoints]=useState(true);
  const reduceMotion=useReducedMotion();
  const top=148-bend*1.25;
  const bottom=148+bend*.95;
  const path=`M 38 155 C 110 ${top}, 146 ${top}, 207 155 S 307 ${bottom}, 377 76`;
  return <div className="curve-playground">
    <div className="playground-top"><span><i/> THE CURVE ROOM</span><span>01 / EXPLORE</span></div>
    <div className="curve-sheet">
      <span className="curve-caption">A little less pixel.<br/>A little more possibility.</span>
      <svg viewBox="0 0 415 230" className="playground-svg" role="img" aria-label="Interactive illustrative Bézier curve. Change its bend using the slider below.">
        <defs><pattern id="playground-grid" width="20" height="20" patternUnits="userSpaceOnUse"><path d="M20 0H0V20" fill="none" stroke="#dedbd1" strokeWidth=".65"/></pattern></defs>
        <rect width="415" height="230" fill="url(#playground-grid)"/>
        <path d="M38 155H67V126H96V97H125V86H154V103H183V134H212V166H241V182H270V168H299V140H328V112H357V76H377" stroke="#d8d4c9" strokeWidth="18" strokeLinejoin="miter" fill="none"/>
        {points&&<g stroke="#9386ab" strokeWidth="1" strokeDasharray="3 4"><path d={`M38 155L110 ${top}M207 155L146 ${top}M207 155L268 ${310-top}M377 76L307 ${bottom}`}/></g>}
        <motion.path d={path} animate={{d:path}} initial={false} transition={{duration:reduceMotion?0:.22}} fill="none" stroke="#58408f" strokeWidth="18" strokeLinecap="round"/>
        <motion.path d={path} animate={{d:path}} initial={false} transition={{duration:reduceMotion?0:.22}} fill="none" stroke="#c2a4ff" strokeWidth="1.5" strokeLinecap="round"/>
        {points&&<g fill="#f5f2e9" stroke="#58408f" strokeWidth="1.5">{[[38,155],[207,155],[377,76]].map(([x,y])=><rect key={x} x={x-4} y={y-4} width="8" height="8"/>)}{[[110,top],[146,top],[268,310-top],[307,bottom]].map(([x,y])=><motion.circle key={x} animate={{cx:x,cy:y}} transition={{duration:reduceMotion?0:.22}} r="3.5"/>)}</g>}
        <text x="24" y="213" fill="#938d80" fontFamily="monospace" fontSize="9">RASTER → PATH</text><text x="308" y="213" fill="#938d80" fontFamily="monospace" fontSize="9">ILLUSTRATION</text>
      </svg>
      <span className="curve-sticker"><ArrowUpRight size={19} strokeWidth={1.5}/><span>Built to<br/>bend.</span></span>
    </div>
    <div className="playground-controls"><label htmlFor="curve-bend"><MoveHorizontal size={15}/> Bend the curve</label><input id="curve-bend" type="range" min="15" max="100" value={bend} onChange={event=>setBend(Number(event.target.value))}/><button type="button" aria-pressed={points} onClick={()=>setPoints(!points)}>{points?'Hide':'Show'} nodes</button></div>
  </div>;
}
