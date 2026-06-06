import type { SessionData, BodyMemory, SignalFrame, RecoveryEvent } from '../types';

const DB_NAME = 'shrimp-mode';
const DB_VERSION = 1;

function openDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;
      if (!db.objectStoreNames.contains('sessions')) {
        db.createObjectStore('sessions', { keyPath: 'session_id' });
      }
      if (!db.objectStoreNames.contains('body_memories')) {
        db.createObjectStore('body_memories', { keyPath: 'memory_id' });
      }
    };

    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

function withStore(
  storeName: 'sessions' | 'body_memories',
  mode: IDBTransactionMode,
  fn: (store: IDBObjectStore) => IDBRequest | void
): Promise<void> {
  return openDB().then((db) => {
    return new Promise((resolve, reject) => {
      const tx = db.transaction(storeName, mode);
      const store = tx.objectStore(storeName);
      fn(store);
      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(tx.error);
    });
  });
}

function withStoreResult<T>(
  storeName: 'sessions' | 'body_memories',
  mode: IDBTransactionMode,
  fn: (store: IDBObjectStore) => IDBRequest<T>
): Promise<T> {
  return openDB().then((db) => {
    return new Promise((resolve, reject) => {
      const tx = db.transaction(storeName, mode);
      const store = tx.objectStore(storeName);
      const request = fn(store);
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  });
}

// ─── Sessions ────────────────────────────────

export function saveSession(session: SessionData): Promise<void> {
  return withStore('sessions', 'readwrite', (store) => store.put(session));
}

export function loadSession(sessionId: string): Promise<SessionData | null> {
  return withStoreResult<SessionData | undefined>('sessions', 'readonly', (store) =>
    store.get(sessionId)
  ).then((result) => result ?? null);
}

export function listSessions(limit = 20): Promise<SessionData[]> {
  return withStoreResult<SessionData[]>('sessions', 'readonly', (store) => {
    const sessions: SessionData[] = [];
    const request = store.openCursor(null, 'prev');
    request.onsuccess = (event) => {
      const cursor = (event.target as IDBRequest<IDBCursorWithValue>).result;
      if (cursor && sessions.length < limit) {
        sessions.push(cursor.value);
        cursor.continue();
      }
    };
    return {
      ...request,
      get result() { return sessions; },
    } as unknown as IDBRequest<SessionData[]>;
  });
}

// ─── Body Memories ────────────────────────────

export function saveBodyMemory(memory: BodyMemory): Promise<void> {
  return withStore('body_memories', 'readwrite', (store) => store.put(memory));
}

export function listBodyMemories(sessionId?: string, limit = 50): Promise<BodyMemory[]> {
  return withStoreResult<BodyMemory[]>('body_memories', 'readonly', (store) => {
    const memories: BodyMemory[] = [];
    let count = 0;
    const request = store.openCursor(null, 'prev');
    request.onsuccess = (event) => {
      const cursor = (event.target as IDBRequest<IDBCursorWithValue>).result;
      if (cursor && count < limit) {
        const mem = cursor.value as BodyMemory;
        if (!sessionId || mem.time_range?.start?.startsWith(sessionId.slice(0, 10))) {
          memories.push(mem);
          count++;
        }
        cursor.continue();
      }
    };
    return {
      ...request,
      get result() { return memories; },
    } as unknown as IDBRequest<BodyMemory[]>;
  });
}
