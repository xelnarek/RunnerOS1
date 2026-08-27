export type SyncEntity = 'activity' | 'route' | 'profile';
export type SyncAction = 'upsert' | 'delete';
export type SyncItem = {
  id:string;
  entity:SyncEntity;
  action:SyncAction;
  payload?:unknown;
  createdAt:number;
  attempts:number;
  lastError?:string;
};

const KEY='runneros-sync-queue-v1';
function read():SyncItem[]{ try{return JSON.parse(localStorage.getItem(KEY)||'[]')}catch{return []} }
function write(items:SyncItem[]){localStorage.setItem(KEY,JSON.stringify(items));}

export function enqueue(item:Omit<SyncItem,'id'|'createdAt'|'attempts'>){
  const next={...item,id:crypto.randomUUID(),createdAt:Date.now(),attempts:0};
  write([...read(),next]); return next;
}
export function pendingSyncCount(){return read().length;}
export function clearQueue(){write([])}
export function listPending(){return read()}

export async function flushSync(endpoint:string, token?:string){
  const items=read(); if(!items.length) return {sent:0,failed:0};
  let sent=0, failed=0; const keep:SyncItem[]=[];
  for(const item of items){
    try{
      const r=await fetch(endpoint,{method:'POST',headers:{'Content-Type':'application/json',...(token?{Authorization:`Bearer ${token}`}:{})},body:JSON.stringify(item)});
      if(!r.ok) throw new Error(`HTTP ${r.status}`); sent++;
    }catch(e){failed++; keep.push({...item,attempts:item.attempts+1,lastError:e instanceof Error?e.message:'sync failed'});}
  }
  write(keep); return {sent,failed};
}
