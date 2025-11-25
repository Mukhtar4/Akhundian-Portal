import { openDB, DBSchema, IDBPDatabase } from 'idb';
import { supabase, isCloudEnabled } from '../lib/supabase';
import { Project, Donation, Expense, VolunteerApplication, Document } from '../types';

interface AkhundianDB extends DBSchema {
  projects: { key: string; value: Project };
  donations: { key: string; value: Donation };
  expenses: { key: string; value: Expense };
  volunteers: { key: string; value: VolunteerApplication };
  documents: { key: string; value: Document };
}

type AkhundianStoreName = 'projects' | 'donations' | 'expenses' | 'volunteers' | 'documents';

const DB_NAME = 'akhundian-internal-db';
const DB_VERSION = 1;

let dbPromise: Promise<IDBPDatabase<AkhundianDB>>;

// --- INTERNAL DB HELPERS (IndexedDB) ---
export const initInternalDB = () => {
  if (!dbPromise) {
    dbPromise = openDB<AkhundianDB>(DB_NAME, DB_VERSION, {
      upgrade(db) {
        ['projects', 'donations', 'expenses', 'volunteers', 'documents'].forEach(store => {
          if (!db.objectStoreNames.contains(store as AkhundianStoreName)) {
            db.createObjectStore(store as AkhundianStoreName, { keyPath: 'id' });
          }
        });
      },
    });
  }
  return dbPromise;
};

// --- HYBRID SERVICE ---
export const dbService = {
  async getAll<K extends AkhundianStoreName>(storeName: K): Promise<AkhundianDB[K]['value'][]> {
    if (isCloudEnabled && supabase) {
      const { data, error } = await supabase.from(storeName).select('*');
      if (error) {
        console.error(`Supabase load error for ${storeName}:`, error);
        return [];
      }
      return (data as unknown as AkhundianDB[K]['value'][]) || [];
    }
    // Fallback to Internal DB
    const db = await initInternalDB();
    return db.getAll(storeName);
  },

  async add<K extends AkhundianStoreName>(storeName: K, value: AkhundianDB[K]['value']): Promise<void> {
    if (isCloudEnabled && supabase) {
      // For Document store in Supabase, we typically upload files to Storage, 
      // but for simplicity in this hybrid mode, we will send the object as is (ensure base64 strings aren't too huge)
      const { error } = await supabase.from(storeName).insert(value);
      if (error) console.error(`Supabase add error for ${storeName}:`, error);
      return;
    }
    const db = await initInternalDB();
    await db.put(storeName, value);
  },

  async update<K extends AkhundianStoreName>(storeName: K, value: AkhundianDB[K]['value']): Promise<void> {
    if (isCloudEnabled && supabase) {
      const { error } = await supabase.from(storeName).update(value).eq('id', (value as any).id);
      if (error) console.error(`Supabase update error for ${storeName}:`, error);
      return;
    }
    const db = await initInternalDB();
    await db.put(storeName, value);
  },

  async delete<K extends AkhundianStoreName>(storeName: K, id: string): Promise<void> {
    if (isCloudEnabled && supabase) {
      const { error } = await supabase.from(storeName).delete().eq('id', id);
      if (error) console.error(`Supabase delete error for ${storeName}:`, error);
      return;
    }
    const db = await initInternalDB();
    await db.delete(storeName, id);
  },
  
  async clear<K extends AkhundianStoreName>(storeName: K): Promise<void> {
      // Cloud databases typically don't expose a full "clear table" to client for safety, 
      // but Internal DB does.
      if (!isCloudEnabled) {
        const db = await initInternalDB();
        await db.clear(storeName);
      }
  }
};