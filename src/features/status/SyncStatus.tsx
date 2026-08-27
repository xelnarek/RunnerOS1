import { useEffect, useState } from 'react';
import { Cloud, RefreshCw } from 'lucide-react';
import { flushSync, pendingSyncCount } from '../../core/sync/syncQueue';

export default function SyncStatus(){
  const [count,setCount]=useState(pendingSyncCount()); const [busy,setBusy]=useState(false); const [text,setText]=useState('Offline-first');
  useEffect(()=>{const id=setInterval(()=>setCount(pendingSyncCount()),1500); return()=>clearInterval(id)},[]);
  async function sync(){const endpoint=import.meta.env.VITE_SYNC_ENDPOINT as string|undefined; if(!endpoint){setText('Brak VITE_SYNC_ENDPOINT');return;} setBusy(true); const r=await flushSync(endpoint,import.meta.env.VITE_SYNC_TOKEN as string|undefined); setCount(pendingSyncCount()); setText(r.failed?`Wysłano ${r.sent}, błędów ${r.failed}`:`Wysłano ${r.sent}`); setBusy(false);}
  return <div className="sync-card"><Cloud size={18}/><div><b>Synchronizacja</b><span>{count?`${count} oczekujących`:text}</span></div><button className="icon-btn" onClick={sync} disabled={busy}><RefreshCw size={16} className={busy?'spin':''}/></button></div>
}
