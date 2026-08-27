import { useEffect, useState } from 'react';
import { api } from '../../core/api/client';
import { getNativeLocationPlugin } from '../../core/nativeLocation';
import { pendingSyncCount } from '../../core/sync/syncQueue';

type Result = {label:string; value:string; ok:boolean|null};

export default function DiagnosticsScreen(){
  const [results,setResults]=useState<Result[]>([
    {label:'Backend API',value:'sprawdzanie…',ok:null},
    {label:'PostgreSQL / PostGIS',value:'sprawdzanie…',ok:null},
    {label:'Natywny GPS Android',value:'sprawdzanie…',ok:null},
    {label:'Kolejka offline',value:`${pendingSyncCount()} oczekujących`,ok:pendingSyncCount()===0},
    {label:'HTTPS / secure context',value:window.isSecureContext?'tak':'nie',ok:window.isSecureContext},
  ]);
  const [running,setRunning]=useState(false);
  useEffect(()=>{
    let live=true;
    Promise.allSettled([api.health(),getNativeLocationPlugin()]).then(([health,plugin])=>{
      if(!live)return;
      setResults(prev=>prev.map(x=>{
        if(x.label==='Backend API') return { ...x, value: health.status==='fulfilled'?'online':'offline', ok:health.status==='fulfilled' };
        if(x.label==='PostgreSQL / PostGIS') return { ...x, value: health.status==='fulfilled'?(health.value.db?(health.value.postgis?'PostGIS online':'brak PostGIS'):'brak połączenia'):'niedostępne', ok:health.status==='fulfilled'&&health.value.db&&health.value.postgis };
        if(x.label==='Natywny GPS Android') return { ...x, value:plugin.status==='fulfilled'&&plugin.value?'plugin dostępny':'PWA / brak pluginu', ok:plugin.status==='fulfilled'&&!!plugin.value };
        return x;
      }));
    });
    getNativeLocationPlugin().then(p=>p?.isRunning().then(r=>{ if(live) setRunning(r.running); })).catch(()=>{});
    return()=>{live=false};
  },[]);
  return <section className="panel diagnostics">
    <div className="eyebrow">DIAGNOSTYKA</div>
    <h2>Stan RunnerOS</h2>
    <p className="muted">Ten ekran nie symuluje wyników. Pokazuje, które warstwy są faktycznie dostępne w bieżącym środowisku.</p>
    <div className="diag-list">{results.map(r=><div className="diag-row" key={r.label}><span>{r.label}</span><b className={r.ok===true?'ok':r.ok===false?'bad':''}>{r.value}</b></div>)}</div>
    <div className="diag-row"><span>Natywny GPS</span><b>{running?'RUNNING':'STOPPED / WEB'}</b></div>
    <p className="muted small">Uruchom tę diagnostykę na fizycznym Androidzie po instalacji APK/AAB. Dopiero wtedy można potwierdzić zachowanie GPS przy wygaszonym ekranie.</p>
  </section>
}
