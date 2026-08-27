import type { Activity } from '../types';

const DB_NAME = 'runneros';
const DB_VERSION = 1;
const STORE = 'activities';
const LEGACY_KEY = 'runneros.activities.v2';

let dbPromise: Promise<IDBDatabase> | null = null;

function openDb(): Promise<IDBDatabase> {
  if (dbPromise) return dbPromise;
  dbPromise = new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, DB_VERSION);
    req.onupgradeneeded = () => {
      const db = req.result;
      if (!db.objectStoreNames.contains(STORE)) db.createObjectStore(STORE, { keyPath: 'id' });
    };
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error ?? new Error('Nie można otworzyć IndexedDB'));
  });
  return dbPromise;
}

export async function loadActivitiesDb(): Promise<Activity[]> {
  try {
    const db = await openDb();
    const items = await new Promise<Activity[]>((resolve, reject) => {
      const tx = db.transaction(STORE, 'readonly');
      const req = tx.objectStore(STORE).getAll();
      req.onsuccess = () => resolve((req.result as Activity[]).sort((a, b) => b.startedAt - a.startedAt));
      req.onerror = () => reject(req.error);
    });
    if (items.length) return items;

    const legacyRaw = localStorage.getItem(LEGACY_KEY);
    if (!legacyRaw) return [];
    const legacy = JSON.parse(legacyRaw) as Activity[];
    if (!Array.isArray(legacy)) return [];
    await saveActivitiesDb(legacy);
    return legacy.sort((a, b) => b.startedAt - a.startedAt);
  } catch {
    try {
      const raw = JSON.parse(localStorage.getItem(LEGACY_KEY) || '[]');
      return Array.isArray(raw) ? raw : [];
    } catch {
      return [];
    }
  }
}

export async function saveActivitiesDb(items: Activity[]): Promise<void> {
  const db = await openDb();
  await new Promise<void>((resolve, reject) => {
    const tx = db.transaction(STORE, 'readwrite');
    const store = tx.objectStore(STORE);
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
    for (const item of items) store.put(item);
  });
}

export async function deleteActivityDb(id: string): Promise<void> {
  const db = await openDb();
  await new Promise<void>((resolve, reject) => {
    const tx = db.transaction(STORE, 'readwrite');
    tx.objectStore(STORE).delete(id);
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
}
