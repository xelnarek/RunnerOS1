import type { GeoPoint } from '../types';

export type RouteProfile='foot'|'bike';
export type RouteRequest={start:GeoPoint;end:GeoPoint;profile?:RouteProfile};
export type RouteResponse={points:GeoPoint[];distanceM:number;durationSec:number;provider:string};

export interface RouteProvider {route(req:RouteRequest):Promise<RouteResponse>}

export class HttpRouteProvider implements RouteProvider{
  constructor(private readonly baseUrl:string, private readonly providerName='custom-router'){}
  async route(req:RouteRequest){
    const u=new URL(this.baseUrl); u.searchParams.set('start',`${req.start.lng},${req.start.lat}`);u.searchParams.set('end',`${req.end.lng},${req.end.lat}`);u.searchParams.set('profile',req.profile??'foot');
    const r=await fetch(u); if(!r.ok) throw new Error(`Routing HTTP ${r.status}`); const data=await r.json();
    return {...data,provider:this.providerName} as RouteResponse;
  }
}
