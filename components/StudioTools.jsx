import {useEffect, useState} from 'react';
import {createPortal} from 'react-dom';
import {Upload, PenTool, ScanLine, Keyboard, X, Check, Layers, MoveUpRight} from 'lucide-react';
import {Toaster, toast} from 'sonner';

const icons = {upload:Upload, brand:PenTool, workspace:Layers, empty:ScanLine, arrow:MoveUpRight};

export default function StudioTools() {
  const [mounts, setMounts] = useState([]);
  const [help, setHelp] = useState(false);
  useEffect(() => {
    setMounts([...document.querySelectorAll('[data-ui-icon]')]);
    const notify = ({detail}) => {
      if (detail.kind === 'error') toast.error(detail.message);
      else if (detail.kind === 'success') toast.success(detail.message);
    };
    const open = () => setHelp(true);
    document.addEventListener('outline:notify', notify);
    document.addEventListener('outline:help', open);
    return () => {document.removeEventListener('outline:notify', notify); document.removeEventListener('outline:help', open);};
  }, []);
  useEffect(() => {
    if (!help) return;
    const dialog = document.getElementById('shortcut-dialog');
    dialog.showModal();
    const close = () => setHelp(false);
    dialog.addEventListener('close', close);
    return () => dialog.removeEventListener('close', close);
  }, [help]);
  return <>
    {mounts.map((mount, i) => {const Icon=icons[mount.dataset.uiIcon];return Icon ? createPortal(<Icon size={mount.dataset.uiIcon==='empty'?36:20} strokeWidth={1.6} aria-hidden="true"/>,mount,i):null;})}
    {mounts.length>0 && createPortal(<button className="shortcut-trigger" type="button" onClick={()=>setHelp(true)} title="Keyboard shortcuts (?)"><Keyboard size={16} aria-hidden="true"/><span>Shortcuts</span><kbd>?</kbd></button>,document.getElementById('shortcut-mount'))}
    <Toaster position="bottom-right" closeButton richColors duration={5000} icons={{success:<Check size={18}/>}}/>
    {help && <dialog id="shortcut-dialog" className="shortcut-dialog" aria-labelledby="shortcut-heading" onClick={e=>{if(e.target===e.currentTarget)e.currentTarget.close();}}>
      <div className="shortcut-heading"><h2 id="shortcut-heading">A few useful shortcuts</h2><button autoFocus aria-label="Close shortcuts" onClick={()=>document.getElementById('shortcut-dialog').close()}><X size={18}/></button></div>
      <p>Keep your focus on the artwork.</p>
      <dl>{[['Upload an image','⌘ / Ctrl O'],['Paste an image','⌘ / Ctrl V'],['Run trace','⌘ / Ctrl Enter'],['Undo an edit','⌘ / Ctrl Z'],['Redo an edit','⌘ / Ctrl Shift Z'],['Compare / Original / Vector','1 / 2 / 3'],['Stop tracing','Esc']].map(([action,key])=><div key={action}><dt>{action}</dt><dd><kbd>{key}</kbd></dd></div>)}</dl>
      <small>View shortcuts work when you aren’t typing or changing a setting.</small>
    </dialog>}
  </>;
}
