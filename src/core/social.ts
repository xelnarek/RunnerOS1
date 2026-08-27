export type SocialProfile={id:string;name:string;avatarUrl?:string;followers:number;following:number;followingMe:boolean;followedByMe:boolean};
const KEY='runneros-social-v1';
function read(){try{return JSON.parse(localStorage.getItem(KEY)||'{}') as Record<string,boolean>}catch{return {}}}
function write(v:Record<string,boolean>){localStorage.setItem(KEY,JSON.stringify(v))}
export function isFollowing(id:string){return !!read()[id]}
export function toggleFollowing(id:string){const v=read();v[id]=!v[id];write(v);return v[id]}
