import { openDB, DBSchema, IDBPDatabase } from 'idb';
import { Project, Donation, Expense, VolunteerApplication, Document } from '../types';

interface AkhundianDB extends DBSchema {
  projects: {
    key: string;
    value: Project;
  };
  donations: {
    key: string;
    value: Donation;
  };
  expenses: {
    key: string;
    value: Expense;
  };
  volunteers: {
    key: string;
    value: VolunteerApplication;
  };
  documents: {
    key: string;
    value: Document;
  };
}

type AkhundianStoreName = 'projects' | 'donations' | 'expenses' | 'volunteers' | 'documents';

const DB_NAME = 'akhundian-internal-db';
const DB_VERSION = 1;

let dbPromise: Promise<IDBPDatabase<AkhundianDB>>;

export const initDB = () => {
  if (!dbPromise) {
    dbPromise = openDB<AkhundianDB>(DB_NAME, DB_VERSION, {
      upgrade(db) {
        if (!db.objectStoreNames.contains('projects')) {
          db.createObjectStore('projects', { keyPath: 'id' });
        }
        if (!db.objectStoreNames.contains('donations')) {
          db.createObjectStore('donations', { keyPath: 'id' });
        }
        if (!db.objectStoreNames.contains('expenses')) {
          db.createObjectStore('expenses', { keyPath: 'id' });
        }
        if (!db.objectStoreNames.contains('volunteers')) {
          db.createObjectStore('volunteers', { keyPath: 'id' });
        }
        if (!db.objectStoreNames.contains('documents')) {
          db.createObjectStore('documents', { keyPath: 'id' });
        }
      },
    });
  }
  return dbPromise;
};

export const dbService = {
  async getAll<K extends AkhundianStoreName>(storeName: K): Promise<AkhundianDB[K]['value'][]> {
    const db = await initDB();
    return db.getAll(storeName);
  },

  async add<K extends AkhundianStoreName>(storeName: K, value: AkhundianDB[K]['value']): Promise<void> {
    const db = await initDB();
    await db.put(storeName, value);
  },

  async update<K extends AkhundianStoreName>(storeName: K, value: AkhundianDB[K]['value']): Promise<void> {
    const db = await initDB();
    await db.put(storeName, value);
  },

  async delete<K extends AkhundianStoreName>(storeName: K, id: string): Promise<void> {
    const db = await initDB();
    await db.delete(storeName, id);
  },
  
  async clear<K extends AkhundianStoreName>(storeName: K): Promise<void> {
      const db = await initDB();
      await db.clear(storeName);
  }
};