import { Volume2, VolumeX, Gauge } from 'lucide-react';
import { useMemo, useState } from 'react';
import { availableVoices, loadAudioSettings, saveAudioSettings, speak } from '../../core/audio/audioEngine';

export default function AudioSettingsCard(){
  const [settings,setSettings]=useState(loadAudioSettings());
  const voices=useMemo(()=>availableVoices(),[]);
  const update=(patch:Partial<typeof settings>)=>setSettings(saveAudioSettings(patch));
  return <section className="panel audio-settings-card">
    <div className="panel-head"><div><div className="eyebrow">AUDIO TRENINGU</div><h2>Komunikaty głosowe</h2><p>Bez nachalnego gadania. Tylko informacje, które pomagają biec.</p></div><button className="icon-btn" onClick={()=>update({enabled:!settings.enabled})}>{settings.enabled?<Volume2 size={18}/>:<VolumeX size={18}/>}</button></div>
    <div className="audio-row"><div><b>Głośność</b><span>{Math.round(settings.volume*100)}%</span></div><input aria-label="Głośność" type="range" min="0" max="1" step="0.01" value={settings.volume} onChange={e=>update({volume:Number(e.target.value)})}/></div>
    <div className="audio-row"><div><b>Głos</b><span>Polski preferowany automatycznie</span></div><select value={settings.voice} onChange={e=>update({voice:e.target.value})}><option value="auto">Automatycznie</option>{voices.map(v=><option key={v.name} value={v.name}>{v.name} · {v.lang}</option>)}</select></div>
    <div className="audio-toggle-grid">
      <label><input type="checkbox" checked={settings.kilometerAnnouncements} onChange={e=>update({kilometerAnnouncements:e.target.checked})}/><span>Splity 1 km</span></label>
      <label><input type="checkbox" checked={settings.paceAnnouncements} onChange={e=>update({paceAnnouncements:e.target.checked})}/><span>Tempo</span></label>
      <label><input type="checkbox" checked={settings.gpsAnnouncements} onChange={e=>update({gpsAnnouncements:e.target.checked})}/><span>GPS / ostrzeżenia</span></label>
    </div>
    <button className="audio-test" onClick={()=>speak('RunnerOS. Test komunikatu głosowego. System gotowy.') }><Gauge size={16}/> Test głosu</button>
  </section>
}
