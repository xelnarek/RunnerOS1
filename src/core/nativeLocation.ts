import type { GeoPoint } from './types';

export interface NativeLocationPlugin {
  requestPermissions(): Promise<{ requested?: boolean; granted?: boolean }>;
  start(): Promise<{ started: boolean }>;
  stop(): Promise<{ stopped: boolean }>;
  isRunning(): Promise<{ running: boolean }>;
  getBufferedPoints(): Promise<{ points: GeoPoint[] }>;
  clearBufferedPoints?(): Promise<{ cleared: boolean }>;
  addListener(eventName: 'location'|'status', listener: (data: any) => void): Promise<{ remove: () => Promise<void> }>;
}

function getPlugin(): NativeLocationPlugin|null {
  const cap = (window as any).Capacitor;
  if (!cap?.isNativePlatform?.()) return null;
  return cap.Plugins?.RunnerOSLocation ?? null;
}

export async function getNativeLocationPlugin(){ return getPlugin(); }

export async function startNativeTracking(onPoint:(p:GeoPoint)=>void, onStatus?:(s:string)=>void){
  const plugin = getPlugin();
  if (!plugin) return null;
  const listeners = [
    await plugin.addListener('location', data => onPoint(data as GeoPoint)),
    ...(onStatus ? [await plugin.addListener('status', data => onStatus(data.status))] : [])
  ];
  const perm = await plugin.requestPermissions();
  if (perm.granted === false) throw new Error('Brak uprawnień lokalizacji.');
  await plugin.start();
  return async () => { for (const l of listeners) await l.remove(); await plugin.stop(); };
}
