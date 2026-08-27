import { describe, expect, it } from 'vitest';
import { AutoPauseDetector } from '../src/core/autoPause';
import { validSegment, movingTime } from '../src/core/metrics';
import { trainingLoad, consistencyScore } from '../src/core/analytics';
import type { GeoPoint, Activity } from '../src/core/types';

const p=(ts:number,lat=51,lng=17,speed=0,accuracy=5):GeoPoint=>({ts,lat,lng,speed,accuracy});

describe('quality engine',()=>{
  it('rejects absurd segments',()=>{const a=p(1000),b=p(2000,52,18,0,5);expect(validSegment(a,b)).toBeNull()});
  it('movingTime does not count stationary high-quality noise as movement',()=>{const pts=[p(0),p(3000,51,17,0,4),p(6000,51,17.00001,0,40)];expect(movingTime(pts)).toBe(0)});
  it('auto pauses after stable stop',()=>{const d=new AutoPauseDetector({triggerSec:5});let state=d.update(p(0),null);expect(state.shouldPause).toBe(false);state=d.update(p(5000,51,17,0.1,3),p(0));expect(state.shouldPause).toBe(true)});
  it('training load is non-negative',()=>{const a:Activity={id:'1',type:'run',startedAt:1,endedAt:1001,durationSec:1000,movingSec:900,pausedSec:100,distanceM:5000,elevationGainM:20,avgPaceSecPerKm:300,maxSpeedMps:4,points:[],splitsSecPerKm:[],status:'completed'};expect(trainingLoad(a)).toBeGreaterThanOrEqual(0)});
  it('consistency is bounded',()=>{expect(consistencyScore([])).toBe(0);expect(consistencyScore([])).toBeLessThanOrEqual(100)});
});
