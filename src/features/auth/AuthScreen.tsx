import { useState } from 'react';
import { api } from '../../core/api/client';
import { saveAuth } from '../../core/auth';
import './auth.css';

type Props={onAuthenticated:()=>void};
export default function AuthScreen({onAuthenticated}:Props){
  const [mode,setMode]=useState<'login'|'register'>('login');
  const [email,setEmail]=useState(''); const [password,setPassword]=useState(''); const [name,setName]=useState('Runner');
  const [busy,setBusy]=useState(false); const [error,setError]=useState('');
  async function submit(e:React.FormEvent){e.preventDefault();setBusy(true);setError('');
    try{
      const r=mode==='login'?await api.login({email,password}):await api.register({email,password,name});
      saveAuth(r.user,r.token); onAuthenticated();
    }catch(err){setError(err instanceof Error?err.message:'Nie udało się zalogować');}
    finally{setBusy(false)}
  }
  return <main className="auth-screen"><div className="auth-card"><div className="brand auth-brand">RUNNER<span>OS</span></div><div className="eyebrow">{mode==='login'?'WITAJ PONOWNIE':'NOWY PROFIL'}</div><h1>{mode==='login'?'Twój trening. Twoje dane.':'Zacznij biegać z RunnerOS.'}</h1><p className="muted">Offline-first. GPS na urządzeniu. Synchronizacja dopiero, gdy masz sieć.</p><form onSubmit={submit}>
    {mode==='register'&&<label>Nazwa<input value={name} onChange={e=>setName(e.target.value)} minLength={2} required /></label>}
    <label>E-mail<input type="email" autoComplete="email" value={email} onChange={e=>setEmail(e.target.value)} required /></label>
    <label>Hasło<input type="password" autoComplete={mode==='login'?'current-password':'new-password'} value={password} onChange={e=>setPassword(e.target.value)} minLength={8} required /></label>
    {error&&<div className="auth-error">{error}</div>}
    <button className="primary wide" disabled={busy}>{busy?'Łączenie…':mode==='login'?'Zaloguj':'Utwórz konto'}</button>
  </form><button className="link-btn" onClick={()=>{setMode(mode==='login'?'register':'login');setError('')}}>{mode==='login'?'Nie masz konta? Utwórz je':'Masz już konto? Zaloguj się'}</button>
  <div className="auth-note">Tryb demonstracyjny bez skonfigurowanego API nadal działa lokalnie. Konto wymaga ustawienia <code>VITE_API_URL</code>.</div></div></main>
}
