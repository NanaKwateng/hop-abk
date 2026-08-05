// hooks/use-offline.ts

"use client";

import { useState, useEffect, useCallback } from 'react';
import { syncManager } from '@/lib/offline/sync-manager';
import { offlineDB } from '@/lib/offline/db';
import { toast } from 'sonner';

interface OfflineState {
    isOnline: boolean;
    isSyncing: boolean;
    pendingCount: number;
    lastSync: number;
}

export function useOffline() {
    const [state, setState] = useState<OfflineState>({
        isOnline: navigator.onLine,
        isSyncing: false,
        pendingCount: 0,
        lastSync: 0,
    });

    // Update state periodically
    useEffect(() => {
        const updateState = async () => {
            const status = await syncManager.getSyncStatus();
            setState((prev) => ({
                ...prev,
                isSyncing: status.isSyncing,
                pendingCount: status.pendingCount,
                lastSync: status.lastSync,
            }));
        };

        updateState();

        // Listen to online/offline events
        const handleOnline = () => {
            setState((prev) => ({ ...prev, isOnline: true }));
            syncManager.sync();
        };

        const handleOffline = () => {
            setState((prev) => ({ ...prev, isOnline: false }));
        };

        window.addEventListener('online', handleOnline);
        window.addEventListener('offline', handleOffline);

        // Check every 10 seconds for queue updates
        const interval = setInterval(updateState, 10000);

        return () => {
            window.removeEventListener('online', handleOnline);
            window.removeEventListener('offline', handleOffline);
            clearInterval(interval);
        };
    }, []);

    // Manual sync trigger
    const sync = useCallback(async () => {
        if (!state.isOnline) {
            toast.error('Cannot sync while offline');
            return;
        }

        const result = await syncManager.sync();
        const status = await syncManager.getSyncStatus();
        setState((prev) => ({
            ...prev,
            isSyncing: false,
            pendingCount: status.pendingCount,
            lastSync: status.lastSync,
        }));

        return result;
    }, [state.isOnline]);

    return {
        ...state,
        sync,
        isReady: offlineDB.getDB() !== null,
    };
}