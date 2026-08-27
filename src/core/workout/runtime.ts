import type { WorkoutDefinition, WorkoutStep } from './engine';

export type WorkoutRuntimeStatus = 'idle'|'running'|'paused'|'completed';
export type WorkoutRuntimeState = {
  status: WorkoutRuntimeStatus;
  stepIndex: number;
  stepElapsedSec: number;
  totalElapsedSec: number;
  completedSteps: number;
  startedAt: number|null;
};

export function createWorkoutRuntime(): WorkoutRuntimeState {
  return { status:'idle', stepIndex:0, stepElapsedSec:0, totalElapsedSec:0, completedSteps:0, startedAt:null };
}

export function currentStep(workout:WorkoutDefinition|undefined, state:WorkoutRuntimeState): WorkoutStep|undefined {
  return workout ? workout.steps[state.stepIndex] : undefined;
}

export function startWorkout(workout:WorkoutDefinition, now=Date.now()):WorkoutRuntimeState {
  return { status:'running', stepIndex:0, stepElapsedSec:0, totalElapsedSec:0, completedSteps:0, startedAt:now };
}

export function pauseWorkout(state:WorkoutRuntimeState):WorkoutRuntimeState {
  return state.status==='running' ? {...state,status:'paused'} : state;
}

export function resumeWorkout(state:WorkoutRuntimeState):WorkoutRuntimeState {
  return state.status==='paused' ? {...state,status:'running'} : state;
}

export function tickWorkout(state:WorkoutRuntimeState, workout:WorkoutDefinition, deltaSec:number){
  if(state.status!=='running') return state;
  let stepIndex=state.stepIndex;
  let stepElapsed=state.stepElapsedSec+Math.max(0,deltaSec);
  let total=state.totalElapsedSec+Math.max(0,deltaSec);
  let completed=state.completedSteps;
  let status: WorkoutRuntimeStatus=state.status;
  while(stepIndex < workout.steps.length){
    const duration=Math.max(1,workout.steps[stepIndex].durationSec);
    if(stepElapsed < duration) break;
    stepElapsed -= duration;
    completed += 1;
    stepIndex += 1;
    if(stepIndex >= workout.steps.length){
      stepIndex=Math.max(0,workout.steps.length-1);
      stepElapsed=duration;
      status='completed';
      break;
    }
  }
  return {...state,stepIndex,stepElapsedSec:stepElapsed,totalElapsedSec:Math.min(total,workout.totalSec),completedSteps:completed,status};
}

export function stepRemainingSec(workout:WorkoutDefinition|undefined,state:WorkoutRuntimeState){
  const step=currentStep(workout,state);
  return Math.max(0,(step?.durationSec??0)-state.stepElapsedSec);
}

export function workoutProgress(workout:WorkoutDefinition|undefined,state:WorkoutRuntimeState){
  return workout ? Math.min(1,Math.max(0,state.totalElapsedSec/Math.max(1,workout.totalSec))) : 0;
}
