import { useMemo, useState } from 'react';
import { Flame, MapPinned, Share2, Trophy, Users, UserPlus, UserCheck, Search, Heart, MessageCircle } from 'lucide-react';
import type { Activity } from '../../core/types';
import './explore.css';
import { isFollowing, toggleFollowing } from '../../core/social';

type Props = { activities: Activity[] };
type View = 'feed' | 'heatmap' | 'challenges' | 'social';

function km(items: Activity[]) { return items.reduce((s, a) => s + a.distanceM, 0) / 1000; }
function fmtPace(sec?: number) { if (!sec || !Number.isFinite(sec)) return '—'; return `${Math.floor(sec / 60)}:${String(Math.round(sec % 60)).padStart(2, '0')} /km`; }

export default function ExploreScreen({ activities }: Props) {
  const [view, setView] = useState<View>('feed');
  const [q,setQ]=useState('');
  const [localFollow,setLocalFollow]=useState<Record<string,boolean>>({});
  const people=[{id:'mateusz',name:'Mateusz Run',meta:'12,4 km ostatnio',followers:184},{id:'anna',name:'Anna Pace',meta:'5:12 /km • 8 aktywności',followers:321},{id:'tomek',name:'Tomek Trail',meta:'+742 m w tym tygodniu',followers:96}].filter(p=>p.name.toLowerCase().includes(q.toLowerCase()));
  const recent = activities.slice(0, 8);
  const month = activities.filter(a => a.startedAt >= Date.now() - 30 * 86400000);
  const monthKm = km(month);
  const challengeProgress = Math.min(100, Math.round((monthKm / 100) * 100));

  const density = useMemo(() => {
    const cells = Array.from({ length: 48 }, (_, i) => ({ i, v: 0 }));
    const points = activities.flatMap(a => a.points || []);
    if (!points.length) return cells;
    const lats = points.map(p => p.lat), lngs = points.map(p => p.lng);
    const minLat = Math.min(...lats), maxLat = Math.max(...lats), minLng = Math.min(...lngs), maxLng = Math.max(...lngs);
    points.forEach(p => {
      const x = maxLng === minLng ? 0.5 : (p.lng - minLng) / (maxLng - minLng);
      const y = maxLat === minLat ? 0.5 : (p.lat - minLat) / (maxLat - minLat);
      const col = Math.max(0, Math.min(7, Math.floor(x * 8)));
      const row = Math.max(0, Math.min(5, Math.floor((1 - y) * 6)));
      cells[row * 8 + col].v += 1;
    });
    const max = Math.max(1, ...cells.map(c => c.v));
    return cells.map(c => ({ ...c, v: c.v / max }));
  }, [activities]);

  const shareLatest = async () => {
    const a = recent[0];
    if (!a) return;
    const text = `RunnerOS • Bieg\n${(a.distanceM / 1000).toFixed(2)} km • ${fmtPace(a.avgPaceSecPerKm)} • ${Math.round(a.durationSec / 60)} min`;
    if (navigator.share) await navigator.share({ title: 'RunnerOS', text });
    else await navigator.clipboard?.writeText(text);
  };

  return <section className="explore">
    <div className="explore-hero"><div><div className="eyebrow">EXPLORE</div><h2>Trening ma mieć ciąg dalszy.</h2><p>Twoje trasy, postęp i wyzwania w jednym miejscu.</p></div><div className="explore-icon"><Flame size={20}/></div></div>
    <div className="explore-tabs">{([['feed','Feed',Users],['heatmap','Heatmap',MapPinned],['challenges','Wyzwania',Trophy]] as const).map(([id,label,I]) => <button key={id} className={view===id?'active':''} onClick={()=>setView(id)}><I size={16}/>{label}</button>)}</div>

    {view === 'feed' && <div className="explore-stack">
      <div className="explore-card highlight"><div><span className="label">OSTATNI TRENING</span><strong>{recent[0] ? `${(recent[0].distanceM/1000).toFixed(2)} km` : 'Brak danych'}</strong><small>{recent[0] ? `${fmtPace(recent[0].avgPaceSecPerKm)} • ${Math.round(recent[0].durationSec/60)} min` : 'Zarejestruj pierwszy bieg.'}</small></div><button className="share-button" onClick={shareLatest} disabled={!recent[0]}><Share2 size={16}/> Udostępnij</button></div>
      {recent.length === 0 ? <div className="empty">Feed zacznie żyć po pierwszym treningu.</div> : recent.map((a, i) => <article className="feed-item" key={a.id}><div className="feed-avatar">{i === 0 ? 'R' : '•'}</div><div><strong>Runner</strong><span>{new Date(a.startedAt).toLocaleDateString('pl-PL', { day:'2-digit', month:'long' })}</span><p>Bieg • {(a.distanceM/1000).toFixed(2)} km • {fmtPace(a.avgPaceSecPerKm)}</p></div></article>)}
    </div>}

    {view === 'heatmap' && <div className="explore-card"><div className="card-title"><div><span className="label">PERSONAL HEATMAP</span><h3>Gdzie naprawdę biegasz</h3></div><MapPinned size={18}/></div><div className="heatmap-grid">{density.map(c=><div key={c.i} className="heat-cell" style={{ opacity: 0.12 + c.v * 0.88 }} />)}</div><div className="legend"><span>mniej</span><i/><i/><i/><i/><i/><span>więcej</span></div><p className="muted">To jest lokalna heatmapa z Twoich zapisanych punktów GPS. Prawdziwa mapa geograficzna zostanie podpięta do silnika map/routingu.</p></div>}


    {view === 'social' && <div className="explore-stack"><div className="explore-card"><div className="search"><Search size={17}/><input value={q} onChange={e=>setQ(e.target.value)} placeholder="Szukaj biegacza" /></div>{people.map(p=>{const f=localFollow[p.id]??isFollowing(p.id);return <div className="person" key={p.id}><div className="feed-avatar">{p.name[0]}</div><div className="person-copy"><strong>{p.name}</strong><span>{p.meta}</span><small>{p.followers} obserwujących</small></div><button className={f?'follow active':'follow'} onClick={()=>setLocalFollow(s=>({...s,[p.id]:toggleFollowing(p.id)}))}>{f?<><UserCheck size={15}/> Obserwujesz</>:<><UserPlus size={15}/> Obserwuj</>}</button></div>})}</div><div className="explore-card"><div className="card-title"><div><span className="label">AKTYWNOŚĆ SPOŁECZNOŚCI</span><h3>Ostatnie treningi</h3></div><MessageCircle size={18}/></div>{activities.slice(0,4).map((a,i)=><article className="feed-item" key={a.id}><div className="feed-avatar">{['M','A','T','K'][i]}</div><div><strong>{['Mateusz Run','Anna Pace','Tomek Trail','Kasia Active'][i]}</strong><span>{new Date(a.startedAt).toLocaleDateString('pl-PL')}</span><p>Bieg • {(a.distanceM/1000).toFixed(2)} km</p></div><div className="social-actions"><span><Heart size={15}/> {12+i*7}</span></div></article>)}</div></div>}

    {view === 'challenges' && <div className="explore-stack"><div className="challenge-card"><div className="challenge-top"><div><span className="label">SIERPIEŃ</span><h3>100 km</h3></div><Trophy size={20}/></div><div className="progress"><span style={{ width: `${challengeProgress}%` }}/></div><div className="challenge-meta"><b>{monthKm.toFixed(1)} km</b><span>{Math.max(0, 100 - monthKm).toFixed(1)} km do celu</span></div></div><div className="challenge-card"><div className="challenge-top"><div><span className="label">REGULARNOŚĆ</span><h3>8 treningów</h3></div><Flame size={20}/></div><div className="progress"><span style={{ width: `${Math.min(100, Math.round((month.length/8)*100))}%` }}/></div><div className="challenge-meta"><b>{month.length}/8</b><span>aktywności w ostatnich 30 dniach</span></div></div></div>}
  </section>;
}
