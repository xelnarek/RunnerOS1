import type { GeoPoint } from "../types";
import { startNativeTracking } from "../nativeLocation";

export type NativeLocationPoint = GeoPoint & { source?: "android" };

export interface NativeLocationBridge {
  isAvailable(): Promise<boolean>;
  start(options?: { highAccuracy?: boolean }): Promise<void>;
  stop(): Promise<void>;
  addListener(listener: (point: NativeLocationPoint) => void): Promise<() => void>;
}

export const nativeLocationBridge: NativeLocationBridge = {
  async isAvailable() {
    return Boolean((window as any).Capacitor?.isNativePlatform?.() && (window as any).Capacitor?.Plugins?.RunnerOSLocation);
  },
  async start() {
    const cleanup = await startNativeTracking(() => {});
    if (!cleanup) throw new Error("Natywny GPS RunnerOS nie jest dostępny.");
  },
  async stop() {
    const plugin = (window as any).Capacitor?.Plugins?.RunnerOSLocation;
    if (plugin) await plugin.stop();
  },
  async addListener(listener) {
    const plugin = (window as any).Capacitor?.Plugins?.RunnerOSLocation;
    if (!plugin) return () => {};
    const handle = await plugin.addListener("location", listener);
    return async () => { await handle.remove(); };
  }
};
