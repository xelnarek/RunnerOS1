import { useEffect,useState } from 'react';
import { HeartPulse, ShieldCheck, Smartphone } from 'lucide-react';
import { healthConnectStatus, requestHealthPermissions } from '../../core/health';

export default function HealthConnectCard(){
  const [available,setAvailable]=useState(false); const [state,setState]=useState<'idle'|'granted'|'denied'|'unavailable'>('idle'); const [busy,setBusy]=useState(false);
  useEffect(()=>{healthConnectStatus().then(x=>setAvailable(Boolean(x.available))).catch(()=>setAvailable(false))},[]);
  if(!available) return <div className="health-card muted-card"><Smartphone size={19}/><div><b>Health Connect</b><span>Dostępne po uruchomieniu wersji Android.</span></div></div>;
  async function connect(){setBusy(true);try{const x=await requestHealthPermissions();setState(x?.granted?'granted':'denied')}catch{setState('denied')}finally{setBusy(false)}}
  return <div className="health-card"><HeartPulse size={20}/><div className="health-copy"><b>Health Connect</b><span>Synchronizacja treningów i odczyt tętna tylko po zgodzie.</span></div><button className="health-btn" onClick={connect} disabled={busy}>{state==='granted'?<><ShieldCheck size={15}/> POŁĄCZONO</>:busy?'…':'POŁĄCZ'}</button></div>
}
