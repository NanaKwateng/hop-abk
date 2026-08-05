// lib/offline/db.ts

import { openDB, IDBPDatabase } from 'idb';

export const STORES = {
    MEMBERS: 'members',
    PAYMENTS: 'payments',
    TASKS: 'tasks',
    QUEUE: 'sync_queue',
    METADATA: 'sync_metadata',
} as const;

export type StoreName = typeof STORES[keyof typeof STORES];

export interface SyncQueueItem {
    id?: number;
    operation: 'create' | 'update' | 'delete';
    table: string;
    data: any;
    timestamp: number;
    retries: number;
    status: 'pending' | 'processing' | 'completed' | 'failed';
    error?: string;
    syncId?: string;
}

export interface SyncMetadata {
    id: string;
    table: string;
    recordId: string;
    lastSyncedAt: number;
    version: number;
    hash: string;
}

// ✅ Check if we're in the browser
const isBrowser = typeof window !== 'undefined' && typeof window.indexedDB !== 'undefined';

class OfflineDB {
    private db: IDBPDatabase | null = null;
    private dbName = 'hop-offline';
    private dbVersion = 1;

    async init(): Promise<IDBPDatabase | null> {
        // ✅ Return null if not in browser
        if (!isBrowser) {
            console.log('[OfflineDB] Not in browser, skipping init');
            return null;
        }

        if (this.db) return this.db;

        this.db = await openDB(this.dbName, this.dbVersion, {
            upgrade: (db) => {
                // Members store
                if (!db.objectStoreNames.contains(STORES.MEMBERS)) {
                    const memberStore = db.createObjectStore(STORES.MEMBERS, {
                        keyPath: 'id',
                    });
                    memberStore.createIndex('by_membership_id', 'membershipId', {
                        unique: false,
                    });
                    memberStore.createIndex('by_phone', 'phone', { unique: false });
                    memberStore.createIndex('by_updated_at', 'updatedAt', {
                        unique: false,
                    });
                }

                // Payments store
                if (!db.objectStoreNames.contains(STORES.PAYMENTS)) {
                    const paymentStore = db.createObjectStore(STORES.PAYMENTS, {
                        keyPath: 'id',
                    });
                    paymentStore.createIndex('by_member_id', 'memberId', {
                        unique: false,
                    });
                    paymentStore.createIndex('by_year_month', ['year', 'month'], {
                        unique: false,
                    });
                }

                // Tasks store
                if (!db.objectStoreNames.contains(STORES.TASKS)) {
                    const taskStore = db.createObjectStore(STORES.TASKS, {
                        keyPath: 'id',
                    });
                    taskStore.createIndex('by_status', 'status', { unique: false });
                    taskStore.createIndex('by_created_at', 'createdAt', {
                        unique: false,
                    });
                }

                // Sync Queue store
                if (!db.objectStoreNames.contains(STORES.QUEUE)) {
                    const queueStore = db.createObjectStore(STORES.QUEUE, {
                        keyPath: 'id',
                        autoIncrement: true,
                    });
                    queueStore.createIndex('by_status', 'status', { unique: false });
                    queueStore.createIndex('by_table', 'table', { unique: false });
                    queueStore.createIndex('by_timestamp', 'timestamp', {
                        unique: false,
                    });
                }

                // Sync Metadata store
                if (!db.objectStoreNames.contains(STORES.METADATA)) {
                    const metaStore = db.createObjectStore(STORES.METADATA, {
                        keyPath: 'id',
                    });
                    metaStore.createIndex('by_table', 'table', { unique: false });
                    metaStore.createIndex('by_record_id', 'recordId', { unique: false });
                    metaStore.createIndex('by_last_synced', 'lastSyncedAt', {
                        unique: false,
                    });
                }
            },
        });

        return this.db;
    }

    async getDB(): Promise<IDBPDatabase | null> {
        if (!isBrowser) {
            return null;
        }
        if (!this.db) {
            await this.init();
        }
        return this.db!;
    }

    // --- Generic CRUD operations ---

    async put<T extends { id: string }>(storeName: StoreName, data: T): Promise<T | null> {
        const db = await this.getDB();
        if (!db) return null;

        const tx = db.transaction(storeName, 'readwrite');
        const store = tx.objectStore(storeName);
        await store.put(data);
        await tx.done;
        return data;
    }

    async get<T>(storeName: StoreName, id: string): Promise<T | null> {
        const db = await this.getDB();
        if (!db) return null;

        const tx = db.transaction(storeName, 'readonly');
        const store = tx.objectStore(storeName);
        const result = await store.get(id);
        await tx.done;
        return result as T || null;
    }

    async getAll<T>(storeName: StoreName): Promise<T[]> {
        const db = await this.getDB();
        if (!db) return [];

        const tx = db.transaction(storeName, 'readonly');
        const store = tx.objectStore(storeName);
        const results = await store.getAll();
        await tx.done;
        return results as T[];
    }

    async delete(storeName: StoreName, id: string): Promise<void> {
        const db = await this.getDB();
        if (!db) return;

        const tx = db.transaction(storeName, 'readwrite');
        const store = tx.objectStore(storeName);
        await store.delete(id);
        await tx.done;
    }

    async clear(storeName: StoreName): Promise<void> {
        const db = await this.getDB();
        if (!db) return;

        const tx = db.transaction(storeName, 'readwrite');
        const store = tx.objectStore(storeName);
        await store.clear();
        await tx.done;
    }

    // --- Queue operations ---

    async addToQueue(item: Omit<SyncQueueItem, 'id' | 'timestamp'>): Promise<number | null> {
        const db = await this.getDB();
        if (!db) return null;

        const tx = db.transaction(STORES.QUEUE, 'readwrite');
        const store = tx.objectStore(STORES.QUEUE);
        const result = await store.add({
            ...item,
            timestamp: Date.now(),
            status: 'pending' as const,
            retries: 0,
        });
        await tx.done;
        return result as number;
    }

    async getPendingQueueItems(): Promise<SyncQueueItem[]> {
        const db = await this.getDB();
        if (!db) return [];

        const tx = db.transaction(STORES.QUEUE, 'readonly');
        const store = tx.objectStore(STORES.QUEUE);
        const index = store.index('by_status');
        const results = await index.getAll('pending');
        await tx.done;
        return results as SyncQueueItem[];
    }

    async getQueueItem(id: number): Promise<SyncQueueItem | null> {
        const db = await this.getDB();
        if (!db) return null;

        const tx = db.transaction(STORES.QUEUE, 'readonly');
        const store = tx.objectStore(STORES.QUEUE);
        const result = await store.get(id);
        await tx.done;
        return result as SyncQueueItem || null;
    }

    async updateQueueItem(id: number, updates: Partial<SyncQueueItem>): Promise<void> {
        const db = await this.getDB();
        if (!db) return;

        const tx = db.transaction(STORES.QUEUE, 'readwrite');
        const store = tx.objectStore(STORES.QUEUE);
        const item = await store.get(id);
        if (item) {
            await store.put({ ...item, ...updates });
        }
        await tx.done;
    }

    async removeQueueItem(id: number): Promise<void> {
        const db = await this.getDB();
        if (!db) return;

        const tx = db.transaction(STORES.QUEUE, 'readwrite');
        const store = tx.objectStore(STORES.QUEUE);
        await store.delete(id);
        await tx.done;
    }

    // --- Metadata operations ---

    async getMetadata(table: string, recordId: string): Promise<SyncMetadata | null> {
        const db = await this.getDB();
        if (!db) return null;

        const tx = db.transaction(STORES.METADATA, 'readonly');
        const store = tx.objectStore(STORES.METADATA);
        const index = store.index('by_record_id');
        const results = await index.getAll(recordId);
        await tx.done;
        return results.find((m) => m.table === table) || null;
    }

    async updateMetadata(metadata: SyncMetadata): Promise<void> {
        await this.put(STORES.METADATA, metadata);
    }
}

export const offlineDB = new OfflineDB();