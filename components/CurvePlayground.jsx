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
    <div className="playground-top"><span><i/> A LITTLE CREATIVE PLAY</span><span>VECTOR STUDY / 01</span></div>
    <div className="curve-sheet">
      <span className="curve-caption">Stay curious.<br/>Keep it curvy.</span>
      <svg viewBox="0 0 415 230" className="playground-svg" role="img" aria-label="Interactive illustrative Bézier curve. Change its bend using the slider below.">
        <circle cx="275" cy="108" r="94" fill="#dcf56e"/>
        <path d="M330 12l8 18 20-3-12 16 10 17-20-5-12 16-1-20-19-6 19-7z" fill="#ff927e"/>
        <path d="M48 75l13 7 13-7-7 13 7 13-13-7-13 7 7-13z" fill="#beaaff"/>
        <ellipse cx="242" cy="120" rx="140" ry="61" transform="rotate(-24 242 120)" fill="none" stroke="#7e8aff" strokeWidth=".7"/>
        {points&&<g stroke="#d5d9ff" strokeWidth="1" strokeDasharray="3 4"><path d={`M38 155L110 ${top}M207 155L146 ${top}M207 155L268 ${310-top}M377 76L307 ${bottom}`}/></g>}
        <motion.path d={path} animate={{d:path}} initial={false} transition={{duration:reduceMotion?0:.22}} fill="none" stroke="#141b59" strokeWidth="35" strokeLinecap="round"/>
        <motion.path d={path} animate={{d:path}} initial={false} transition={{duration:reduceMotion?0:.22}} fill="none" stroke="#ff927e" strokeWidth="28" strokeLinecap="round"/>
        <motion.path d={path} animate={{d:path}} initial={false} transition={{duration:reduceMotion?0:.22}} fill="none" stroke="#ffdbcf" strokeWidth="1.3" strokeLinecap="round"/>
        {points&&<g fill="#f1efff" stroke="#252d92" strokeWidth="1.5">{[[38,155],[207,155],[377,76]].map(([x,y])=><rect key={x} x={x-5} y={y-5} width="10" height="10"/>)}{[[110,top],[146,top],[268,310-top],[307,bottom]].map(([x,y])=><motion.circle key={x} animate={{cx:x,cy:y}} transition={{duration:reduceMotion?0:.22}} r="4"/>)}</g>}
        <text x="24" y="213" fill="#b0b9ff" fontFamily="monospace" fontSize="8">AN INTERACTIVE VECTOR STUDY</text>
      </svg>
      <span className="curve-sticker"><ArrowUpRight size={19} strokeWidth={1.5}/><span>Built to<br/>bend.</span></span>
    </div>
    <div className="playground-controls"><label htmlFor="curve-bend"><MoveHorizontal size={15}/> Bend the curve</label><input id="curve-bend" type="range" min="15" max="100" value={bend} onChange={event=>setBend(Number(event.target.value))}/><button type="button" aria-pressed={points} onClick={()=>setPoints(!points)}>{points?'Hide':'Show'} nodes</button></div>
  </div>;
}
