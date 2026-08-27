import type {Activity} from '../types';
export type Gear={id:string;name:string;limitKm:number;km:number;active:boolean};
const KEY='runneros.gear.v2';
export function loadGear():Gear[]{try{return JSON.parse(localStorage.getItem(KEY)||'[]')}catch{return[]}}
export function saveGear(items:Gear[]){localStorage.setItem(KEY,JSON.stringify(items))}
export function addGear(name:string,limitKm=700){const next=[...loadGear(),{id:crypto.randomUUID(),name:name.trim(),limitKm,km:0,active:true}];saveGear(next);return next}
export function removeGear(id:string){const next=loadGear().filter(x=>x.id!==id);saveGear(next);return next}
export function updateActivityGear(activity:Activity,gearId?:string){if(!gearId)return activity; return {...activity,gearId}}
export function recalcGearUsage(activities:Activity[]){const gear=loadGear();const result=gear.map(g=>({...g,km:activities.filter(a=>a.gearId===g.id).reduce((s,a)=>s+a.distanceM/1000,0)}));saveGear(result);return result}
