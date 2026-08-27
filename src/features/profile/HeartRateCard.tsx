import { useState } from 'react';
import { Bluetooth, HeartPulse } from 'lucide-react';
export default function HeartRateCard(){
 const [status,setStatus]=useState('Niepołączony'); const [bpm,setBpm]=useState<number|null>(null);
 async function connect(){const p=(window as any).Capacitor?.Plugins?.RunnerOSHeartRate; if(!p){setStatus('Tylko Android');return;} try{await p.requestPermissions(); const scan=await p.scan(); const d=scan.devices?.[0]; if(!d){setStatus('Nie znaleziono czujnika');return;} await p.connect({id:d.id}); setStatus(d.name||'Połączono'); await p.addListener('heartRate',(x:any)=>setBpm(Number(x.bpm)));}catch(e){setStatus(e instanceof Error?e.message:'Błąd Bluetooth')} }
 return <div className="health-card"><HeartPulse size={18}/><div className="health-copy"><b>Tętno BLE</b><span>{bpm?`${bpm} BPM • ${status}`:status}</span></div><button className="health-btn" onClick={connect}><Bluetooth size={13}/> Połącz</button></div>
}
