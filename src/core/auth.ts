export type AuthUser = { id:string; name:string; email:string; avatarUrl?:string };
const USER_KEY='runneros-auth-user-v1';
const TOKEN_KEY='runneros-auth-token-v1';

export function loadAuth(): {user:AuthUser|null;token:string|null}{
  try{return {user:JSON.parse(localStorage.getItem(USER_KEY)||'null'),token:localStorage.getItem(TOKEN_KEY)}}catch{return {user:null,token:null}}
}
export function saveAuth(user:AuthUser,token:string){localStorage.setItem(USER_KEY,JSON.stringify(user));localStorage.setItem(TOKEN_KEY,token);}
export function clearAuth(){localStorage.removeItem(USER_KEY);localStorage.removeItem(TOKEN_KEY);}
export function getToken(){return localStorage.getItem(TOKEN_KEY);}
