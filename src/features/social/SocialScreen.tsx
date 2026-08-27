import { useMemo, useState } from 'react';
import { UserPlus, UserCheck, Search, Heart, MessageCircle, UsersRound } from 'lucide-react';
import type { Activity } from '../../core/types';
import { isFollowing, toggleFollowing } from '../../core/social';
import './social.css';

type Props={activities:Activity[]};
export default function SocialScreen({activities}:Props){
  const [q,setQ]=useState('');
  const [localFollow,setLocalFollow]=useState<Record<string,boolean>>({});
  const people=useMemo(()=>[
    {id:'mateusz',name:'Mateusz Run',meta:'12,4 km ostatnio',followers:184},
    {id:'anna',name:'Anna Pace',meta:'5:12 /km • 8 aktywności',followers:321},
    {id:'tomek',name:'Tomek Trail',meta:'+742 m w tym tygodniu',followers:96},
  ].filter(p=>p.name.toLowerCase().includes(q.toLowerCase())),[q]);
  function follow(id:string){const v=toggleFollowing(id);setLocalFollow(s=>({...s,[id]:v}))}
  return <section className="social-screen">
    <div className="social-head"><div><div className="eyebrow">SPOŁECZNOŚĆ</div><h2>Ludzie, którzy biegają.</h2><p>Obserwuj wyniki, poznawaj trasy i buduj własną historię.</p></div><div className="social-badge"><UsersRound size={20}/></div></div>
    <div className="search"><Search size={17}/><input value={q} onChange={e=>setQ(e.target.value)} placeholder="Szukaj biegacza" /></div>
    <div className="people-card"><div className="label">SUGEROWANI</div>{people.map(p=>{const f=localFollow[p.id] ?? isFollowing(p.id); return <div className="person" key={p.id}><div className="person-avatar">{p.name[0]}</div><div className="person-copy"><strong>{p.name}</strong><span>{p.meta}</span><small>{p.followers} obserwujących</small></div><button className={f?'follow active':'follow'} onClick={()=>follow(p.id)}>{f?<><UserCheck size={15}/> Obserwujesz</>:<><UserPlus size={15}/> Obserwuj</>}</button></div>})}</div>
    <div className="people-card"><div className="label">AKTYWNOŚĆ SPOŁECZNOŚCI</div>{activities.slice(0,4).map((a,i)=><article className="social-activity" key={a.id}><div className="person-avatar small">{['M','A','T','K'][i]}</div><div className="person-copy"><strong>{['Mateusz Run','Anna Pace','Tomek Trail','Kasia Active'][i]}</strong><span>Bieg • {(a.distanceM/1000).toFixed(2)} km</span><small>{new Date(a.startedAt).toLocaleDateString('pl-PL')}</small></div><div className="social-actions"><span><Heart size={15}/> {12+i*7}</span><span><MessageCircle size={15}/> {i+1}</span></div></article>)}</div>
  </section>
}
