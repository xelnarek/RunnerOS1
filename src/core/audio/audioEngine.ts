export type AudioEvent = 'start'|'pause'|'resume'|'finish'|'kilometer'|'halfway'|'gps'|'warning'|'stepStart'|'stepFinish'|'workoutFinish';

type AudioSettings = {
  enabled: boolean;
  workoutAnnouncements: boolean;
  volume: number;
  voice: string;
  kilometerAnnouncements: boolean;
  paceAnnouncements: boolean;
  gpsAnnouncements: boolean;
};

const KEY = 'runneros.audio.settings.v1';
const defaults: AudioSettings = {
  enabled: true,
  workoutAnnouncements: true,
  volume: 0.86,
  voice: 'auto',
  kilometerAnnouncements: true,
  paceAnnouncements: true,
  gpsAnnouncements: true,
};

let queue: string[] = [];
let speaking = false;
let lastKilometer = 0;

export function loadAudioSettings(): AudioSettings {
  try { return {...defaults, ...JSON.parse(localStorage.getItem(KEY) || '{}')}; } catch { return {...defaults}; }
}

export function saveAudioSettings(next: Partial<AudioSettings>) {
  const value = {...loadAudioSettings(), ...next};
  localStorage.setItem(KEY, JSON.stringify(value));
  return value;
}

export function availableVoices(): SpeechSynthesisVoice[] {
  if (!('speechSynthesis' in window)) return [];
  return window.speechSynthesis.getVoices();
}

function selectedVoice(name: string) {
  const voices = availableVoices();
  if (!voices.length) return undefined;
  if (name !== 'auto') return voices.find(v => v.name === name) || voices.find(v => v.lang?.toLowerCase().startsWith('pl'));
  return voices.find(v => v.lang?.toLowerCase().startsWith('pl')) || voices[0];
}

function nativeTts(){
  const cap=(window as any).Capacitor;
  return cap?.isNativePlatform?.() ? cap?.Plugins?.RunnerOSTts ?? null : null;
}

async function speakNative(text:string){
  const plugin=nativeTts();
  if(!plugin?.speak) return false;
  try{ await plugin.speak({text,duck:true}); return true; }catch{return false;}
}

function pump() {
  if (speaking || !queue.length) return;
  const settings = loadAudioSettings();
  if (!settings.enabled || !('speechSynthesis' in window)) { queue=[]; return; }
  speaking = true;
  const text = queue.shift()!;
  void speakNative(text).then(ok=>{
    if(ok){ speaking=false; pump(); return; }
    const utterance = new SpeechSynthesisUtterance(text);
  utterance.lang = 'pl-PL';
  utterance.rate = 1.02;
  utterance.pitch = 1;
  utterance.volume = settings.volume;
  const voice = selectedVoice(settings.voice);
  if (voice) utterance.voice = voice;
  utterance.onend = () => { speaking=false; pump(); };
  utterance.onerror = () => { speaking=false; pump(); };
    window.speechSynthesis.speak(utterance);
  });
}


export function speak(text: string, priority: 'normal'|'high' = 'normal') {
  const settings = loadAudioSettings();
  if (!settings.enabled) return;
  if (priority === 'high') queue.unshift(text); else queue.push(text);
  if (priority === 'high' && speaking) {
    window.speechSynthesis.cancel();
    speaking = false;
  }
  pump();
}

export function stopAudio() {
  queue=[];
  const cap=(window as any).Capacitor;
  void cap?.Plugins?.RunnerOSTts?.stop?.().catch?.(()=>{});
  if ('speechSynthesis' in window) window.speechSynthesis.cancel();
  speaking=false;
}

export function audioEvent(event: AudioEvent, payload: {km?: number; paceSecPerKm?: number; gpsLabel?: string} = {}) {
  const settings = loadAudioSettings();
  if (!settings.enabled) return;
  const paceText = payload.paceSecPerKm && Number.isFinite(payload.paceSecPerKm)
    ? `Tempo ${Math.floor(payload.paceSecPerKm/60)} minuty ${Math.round(payload.paceSecPerKm%60)} sekund na kilometr.`
    : '';
  switch(event) {
    case 'start': speak('Bieg rozpoczęty.'); break;
    case 'pause': speak('Pauza.'); break;
    case 'resume': speak('Wracamy do biegu.'); break;
    case 'finish': speak('Trening zakończony.'); break;
    case 'kilometer':
      if (!settings.kilometerAnnouncements || !payload.km) return;
      speak(`Przebiegnięto ${payload.km} kilometrów. ${settings.paceAnnouncements ? paceText : ''}`); break;
    case 'gps':
      if (!settings.gpsAnnouncements || !payload.gpsLabel) return;
      speak(payload.gpsLabel, 'high'); break;
    case 'halfway': speak('Jesteś w połowie treningu.'); break;
    case 'warning': speak('Uwaga. Słaba jakość sygnału GPS.', 'high'); break;
    case 'stepStart': if(settings.workoutAnnouncements && payload.gpsLabel) speak(payload.gpsLabel,'high'); break;
    case 'stepFinish': if(settings.workoutAnnouncements && payload.gpsLabel) speak(payload.gpsLabel); break;
    case 'workoutFinish': if(settings.workoutAnnouncements) speak('Zaplanowany trening został ukończony.'); break;
  }
}

export function kilometerReached(distanceM: number, paceSecPerKm?: number) {
  const km = Math.floor(distanceM / 1000);
  if (km <= lastKilometer || km < 1) return;
  lastKilometer = km;
  audioEvent('kilometer', {km, paceSecPerKm});
}

export function resetAudioMarkers() { lastKilometer = 0; }
