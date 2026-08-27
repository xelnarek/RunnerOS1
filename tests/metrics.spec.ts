import { describe, expect, it } from 'vitest';
import { distance, paceSecPerKm, splits } from '../src/core/metrics';
import type { GeoPoint } from '../src/core/types';

const p=(lat:number,lng:number,ts:number):GeoPoint=>({lat,lng,ts,accuracy:4});

describe('RunnerOS metrics',()=>{
  it('liczy dodatni dystans',()=>{expect(distance([p(51.1,17.0,0),p(51.1,17.001,10000)])).toBeGreaterThan(60)});
  it('liczy tempo',()=>{expect(paceSecPerKm(5000,1500)).toBe(300)});
  it('liczy splity dla sekwencji punktów',()=>{const pts=[p(51.1,17.0,0),p(51.109,17.0,33300),p(51.118,17.0,66600)];expect(splits(pts).length).toBeGreaterThan(1)});
});
