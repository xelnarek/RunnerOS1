export interface HealthSummary { available:boolean; heartRate?:number; source?:string; }

export async function healthConnectStatus():Promise<HealthSummary>{
  const plugin=(window as any).Capacitor?.Plugins?.RunnerOSHealth;
  if(!plugin) return {available:false};
  try{return await plugin.isAvailable();}catch{return {available:false};}
}

export async function requestHealthPermissions(){
  const plugin=(window as any).Capacitor?.Plugins?.RunnerOSHealth;
  if(!plugin) throw new Error('Health Connect jest dostępny tylko w aplikacji Android.');
  return plugin.requestPermissions();
}

export async function writeHealthActivity(activity:any){
  const plugin=(window as any).Capacitor?.Plugins?.RunnerOSHealth;
  if(!plugin) return {written:false,reason:'not-native'};
  return plugin.writeActivity(activity);
}

export async function readLatestHeartRate(startMs:number,endMs:number){
  const plugin=(window as any).Capacitor?.Plugins?.RunnerOSHealth;
  if(!plugin) return [];
  try{return (await plugin.readHeartRate({startTime:startMs,endTime:endMs})).samples ?? [];}catch{return [];}
}
