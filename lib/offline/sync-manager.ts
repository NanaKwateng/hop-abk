// lib/offline/sync-manager.ts

import { offlineDB, SyncQueueItem } from './db';
import { createClient } from '@/lib/supabase/client';
import { toast } from 'sonner';

interface SyncResult {
    success: boolean;
    synced: number;
    failed: number;
    errors: string[];
}

class SyncManager {
    private isSyncing = false;
    private supabase = createClient();
    private syncInterval: NodeJS.Timeout | null = null;

    constructor() {
        if (typeof window !== 'undefined') {
            window.addEventListener('online', this.handleOnline.bind(this));
            window.addEventListener('offline', this.handleOffline.bind(this));
        }
    }

    private handleOnline() {
        console.log('[Sync] Online - Starting sync');
        this.sync();
    }

    private handleOffline() {
        console.log('[Sync] Offline - Pausing sync');
        this.stopAutoSync();
    }

    startAutoSync(intervalMs: number = 30000) {
        if (this.syncInterval) return;
        this.syncInterval = setInterval(() => {
            if (navigator.onLine) {
                this.sync();
            }
        }, intervalMs);
        console.log('[Sync] Auto-sync started');
    }

    stopAutoSync() {
        if (this.syncInterval) {
            clearInterval(this.syncInterval);
            this.syncInterval = null;
            console.log('[Sync] Auto-sync stopped');
        }
    }

    async sync(): Promise<SyncResult> {
        if (this.isSyncing) {
            console.log('[Sync] Already syncing, skipping');
            return { success: false, synced: 0, failed: 0, errors: ['Sync in progress'] };
        }

        if (!navigator.onLine) {
            console.log('[Sync] Offline, skipping sync');
            return { success: false, synced: 0, failed: 0, errors: ['Offline'] };
        }

        this.isSyncing = true;
        console.log('[Sync] Starting sync...');

        let synced = 0;
        let failed = 0;
        const errors: string[] = [];

        try {
            const pushResult = await this.pushPendingOperations();
            synced += pushResult.synced;
            failed += pushResult.failed;
            errors.push(...pushResult.errors);

            const pullResult = await this.pullLatestData();
            synced += pullResult.synced;
            failed += pullResult.failed;
            errors.push(...pullResult.errors);

            await this.updateSyncMetadata();

            if (errors.length === 0) {
                toast.success('All data synced successfully!');
            } else if (synced > 0) {
                toast.warning(`Synced ${synced} items, ${failed} failed`);
            }

            console.log(`[Sync] Complete: ${synced} synced, ${failed} failed`);
        } catch (error) {
            console.error('[Sync] Error:', error);
            errors.push(error instanceof Error ? error.message : 'Sync failed');
        } finally {
            this.isSyncing = false;
        }

        return { success: errors.length === 0, synced, failed, errors };
    }

    private async pushPendingOperations(): Promise<{ synced: number; failed: number; errors: string[] }> {
        const queueItems = await offlineDB.getPendingQueueItems();
        let synced = 0;
        let failed = 0;
        const errors: string[] = [];

        if (queueItems.length === 0) {
            return { synced, failed, errors };
        }

        console.log(`[Sync] Processing ${queueItems.length} queue items`);

        for (const item of queueItems) {
            // ✅ Ensure item.id exists (it should for queue items)
            if (item.id === undefined) {
                console.error('[Sync] Item has no id:', item);
                failed++;
                errors.push('Item has no id');
                continue;
            }

            try {
                // ✅ Pass number directly
                await offlineDB.updateQueueItem(item.id, { status: 'processing' });

                let result;
                switch (item.operation) {
                    case 'create':
                        result = await this.handleCreate(item);
                        break;
                    case 'update':
                        result = await this.handleUpdate(item);
                        break;
                    case 'delete':
                        result = await this.handleDelete(item);
                        break;
                    default:
                        throw new Error(`Unknown operation: ${item.operation}`);
                }

                if (result?.success) {
                    await offlineDB.removeQueueItem(item.id);
                    synced++;
                } else {
                    throw new Error(result?.error || 'Operation failed');
                }
            } catch (error) {
                failed++;
                const errorMsg = error instanceof Error ? error.message : 'Unknown error';
                errors.push(`Item ${item.id}: ${errorMsg}`);

                // ✅ Pass number directly to getQueueItem
                const updatedItem = await offlineDB.getQueueItem(item.id);
                if (updatedItem) {
                    const retries = (updatedItem.retries || 0) + 1;
                    if (retries >= 5) {
                        await offlineDB.updateQueueItem(item.id, {
                            status: 'failed',
                            error: errorMsg,
                        });
                    } else {
                        await offlineDB.updateQueueItem(item.id, {
                            retries: retries,
                            status: 'pending',
                        });
                    }
                }
            }
        }

        return { synced, failed, errors };
    }

    private async handleCreate(item: SyncQueueItem): Promise<{ success: boolean; error?: string }> {
        try {
            const { data, error } = await this.supabase
                .from(item.table)
                .insert(item.data)
                .select()
                .single();

            if (error) throw error;

            if (data) {
                await offlineDB.put(item.table as any, data);
            }

            return { success: true };
        } catch (error) {
            return {
                success: false,
                error: error instanceof Error ? error.message : 'Create failed',
            };
        }
    }

    private async handleUpdate(item: SyncQueueItem): Promise<{ success: boolean; error?: string }> {
        try {
            const { id, ...data } = item.data;
            const { error } = await this.supabase
                .from(item.table)
                .update(data)
                .eq('id', id);

            if (error) throw error;

            await offlineDB.put(item.table as any, { ...data, id });

            return { success: true };
        } catch (error) {
            return {
                success: false,
                error: error instanceof Error ? error.message : 'Update failed',
            };
        }
    }

    private async handleDelete(item: SyncQueueItem): Promise<{ success: boolean; error?: string }> {
        try {
            const { error } = await this.supabase
                .from(item.table)
                .delete()
                .eq('id', item.data.id);

            if (error) throw error;

            await offlineDB.delete(item.table as any, item.data.id);

            return { success: true };
        } catch (error) {
            return {
                success: false,
                error: error instanceof Error ? error.message : 'Delete failed',
            };
        }
    }

    private async pullLatestData(): Promise<{ synced: number; failed: number; errors: string[] }> {
        const tables = ['members', 'member_payments', 'tasks'];
        let synced = 0;
        let failed = 0;
        const errors: string[] = [];

        for (const table of tables) {
            try {
                const metadata = await offlineDB.getMetadata(table, 'last_sync');
                const lastSync = metadata?.lastSyncedAt || 0;

                const { data, error } = await this.supabase
                    .from(table)
                    .select('*')
                    .gt('updated_at', new Date(lastSync).toISOString());

                if (error) throw error;

                if (data && data.length > 0) {
                    for (const record of data) {
                        await offlineDB.put(table as any, record);
                    }
                    synced += data.length;
                }

                await this.updateTableSyncTimestamp(table);

                console.log(`[Sync] Pulled ${data?.length || 0} records from ${table}`);
            } catch (error) {
                failed++;
                errors.push(`Pull ${table}: ${error instanceof Error ? error.message : 'Unknown error'}`);
            }
        }

        return { synced, failed, errors };
    }

    private async updateTableSyncTimestamp(table: string) {
        const metadata = await offlineDB.getMetadata(table, 'last_sync');
        if (metadata) {
            await offlineDB.updateMetadata({
                ...metadata,
                lastSyncedAt: Date.now(),
                version: metadata.version + 1,
            });
        } else {
            await offlineDB.updateMetadata({
                id: `${table}_last_sync`,
                table,
                recordId: 'last_sync',
                lastSyncedAt: Date.now(),
                version: 1,
                hash: '',
            });
        }
    }

    private async updateSyncMetadata() {
        const now = Date.now();
        const tables = ['members', 'member_payments', 'tasks'];

        for (const table of tables) {
            await this.updateTableSyncTimestamp(table);
        }

        await offlineDB.updateMetadata({
            id: 'last_full_sync',
            table: 'system',
            recordId: 'full_sync',
            lastSyncedAt: now,
            version: 1,
            hash: '',
        });
    }

    async getSyncStatus(): Promise<{
        isSyncing: boolean;
        pendingCount: number;
        lastSync: number;
        online: boolean;
    }> {
        const pending = await offlineDB.getPendingQueueItems();
        const metadata = await offlineDB.getMetadata('system', 'full_sync');

        return {
            isSyncing: this.isSyncing,
            pendingCount: pending.length,
            lastSync: metadata?.lastSyncedAt || 0,
            online: navigator.onLine,
        };
    }
}

export const syncManager = new SyncManager();