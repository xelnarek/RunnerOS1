import { describe, expect, it } from 'vitest';
import { WORKOUTS } from '../src/core/workout/engine';
import { startWorkout, tickWorkout, pauseWorkout, resumeWorkout, stepRemainingSec } from '../src/core/workout/runtime';

describe('Workout Runtime V2.1',()=>{
  it('przechodzi automatycznie do kolejnego etapu',()=>{
    const w=WORKOUTS.find(x=>x.id==='interval-6x2')!;
    let state=startWorkout(w,0);
    state=tickWorkout(state,w,600);
    expect(state.stepIndex).toBe(1);
    expect(state.completedSteps).toBe(1);
    expect(stepRemainingSec(w,state)).toBe(120);
  });
  it('zatrzymuje licznik podczas pauzy',()=>{
    const w=WORKOUTS.find(x=>x.id==='easy-30')!;
    let state=startWorkout(w,0);
    state=tickWorkout(state,w,10);
    state=pauseWorkout(state);
    expect(tickWorkout(state,w,30).totalElapsedSec).toBe(10);
    state=resumeWorkout(state);
    expect(tickWorkout(state,w,5).totalElapsedSec).toBe(15);
  });
  it('oznacza workout jako completed po pełnym czasie',()=>{
    const w=WORKOUTS.find(x=>x.id==='easy-30')!;
    let state=startWorkout(w,0);
    state=tickWorkout(state,w,w.totalSec);
    expect(state.status).toBe('completed');
    expect(state.completedSteps).toBe(w.steps.length);
  });
});
