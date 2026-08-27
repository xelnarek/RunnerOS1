import type { Activity } from '../types';
import { getToken } from '../auth';

const base=()=>import.meta.env.VITE_API_URL || '';
async function request<T>(path:string, init:RequestInit={}):Promise<T>{
  if(!base()) throw new Error('API not configured');
  const token=getToken();
  const r=await fetch(`${base()}${path}`,{...init,headers:{'Content-Type':'application/json',...(token?{Authorization:`Bearer ${token}`}:{}) ,...(init.headers||{})}});
  const data=await r.json().catch(()=>({}));
  if(!r.ok) throw new Error(data?.error || `API ${r.status}`);
  return data as T;
}
export const api={
  health:()=>request<{ok:boolean;db:boolean;postgis?:boolean;version:string}>('/health'),
  register:(body:{email:string;password:string;name:string})=>request<{user:{id:string;name:string;email:string};token:string}>('/v1/auth/register',{method:'POST',body:JSON.stringify(body)}),
  login:(body:{email:string;password:string})=>request<{user:{id:string;name:string;email:string};token:string}>('/v1/auth/login',{method:'POST',body:JSON.stringify(body)}),
  me:()=>request<{user:{id:string;name:string;email:string;avatarUrl?:string}}>('/v1/me'),
  feed:()=>request<Activity[]>('/v1/feed'),
  activities:(body:Activity)=>request<{ok:true;id:string}>('/v1/activities',{method:'POST',body:JSON.stringify(body)}),
  follow:(userId:string)=>request<{ok:true}>(`/v1/users/${userId}/follow`,{method:'POST'}),
  unfollow:(userId:string)=>request<{ok:true}>(`/v1/users/${userId}/follow`,{method:'DELETE'}),
  usersSearch:(q:string)=>request<Array<{id:string;name:string;avatar_url?:string;following_count:number;follower_count:number;followed_by_me:boolean}>>(`/v1/users/search?q=${encodeURIComponent(q)}`),
  heatmap:()=>request<{geojson:any}>('/v1/heatmap'),
};
