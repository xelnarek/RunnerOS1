import { useMemo, useState } from 'react';
import { Plus, Footprints, Trash2, CheckCircle2 } from 'lucide-react';
import type { Activity } from '../../core/types';
import { addGear, loadGear, removeGear, recalcGearUsage, type Gear } from '../../core/workout/gear';
import './gear.css';

export default function GearCard({activities}:{activities:Activity[]}){
  const [items,setItems]=useState<Gear[]>(recalcGearUsage(activities));
  const [name,setName]=useState('');
  const usage=useMemo(()=>activities.reduce((s,a)=>s+a.distanceM,0)/1000,[activities]);
  function add(){const n=name.trim();if(!n)return;setItems(addGear(n));setName('')}
  function del(id:string){setItems(removeGear(id))}
  return <section className="panel gear-card"><div className="panel-head"><div><div className="eyebrow">SPRZĘT</div><h2>Buty i ekwipunek</h2><p>Przebieg jest liczony z aktywności przypisanych do konkretnej pary.</p></div><Footprints size={18}/></div>{items.map(g=>{const pct=Math.min(100,(g.km/g.limitKm)*100);return <div className="gear-row" key={g.id}><div><strong>{g.name}</strong><span>{g.km.toFixed(1)} / {g.limitKm} km • {pct.toFixed(0)}% użycia</span><div className="gear-meter"><span style={{width:`${pct}%`}}/></div></div><button className="icon-btn" onClick={()=>del(g.id)}><Trash2 size={15}/></button></div>})}<div className="gear-add"><input value={name} onChange={e=>setName(e.target.value)} placeholder="np. ASICS Novablast 5"/><button className="audio-test" onClick={add}><Plus size={15}/> Dodaj</button></div><div className="status"><CheckCircle2 size={13}/> Łączny kilometraż konta: <b>{usage.toFixed(1)} km</b>. Aktywność może być przypisana do butów w kolejnej iteracji formularza post-run.</div></section>
}
