// components/providers/offline-provider.tsx

"use client";

import { createContext, useContext, useEffect } from 'react';
import { useOffline } from '@/hooks/use-offline';
import { syncManager } from '@/lib/offline/sync-manager';
import { toast } from 'sonner';
import { Badge } from '@/components/ui/badge';
import { Wifi, WifiOff, Loader2 } from 'lucide-react';

const OfflineContext = createContext<ReturnType<typeof useOffline> | null>(
    null
);

export function OfflineProvider({ children }: { children: React.ReactNode }) {
    const offline = useOffline();

    // Start auto-sync on mount
    useEffect(() => {
        syncManager.startAutoSync();

        // Show offline notification
        const handleOffline = () => {
            toast.warning('You are offline. Changes will sync when you reconnect.', {
                duration: 5000,
            });
        };

        const handleOnline = () => {
            toast.success('Back online! Syncing data...', {
                duration: 3000,
            });
        };

        window.addEventListener('offline', handleOffline);
        window.addEventListener('online', handleOnline);

        return () => {
            syncManager.stopAutoSync();
            window.removeEventListener('offline', handleOffline);
            window.removeEventListener('online', handleOnline);
        };
    }, []);

    return (
        <OfflineContext.Provider value={offline}>
            {/* Offline Status Indicator */}
            <div className="fixed bottom-20 left-4 z-50">
                <Badge
                    variant={offline.isOnline ? 'default' : 'destructive'}
                    className="gap-1.5 px-3 py-1.5 text-xs shadow-lg"
                >
                    {offline.isSyncing ? (
                        <Loader2 className="h-3 w-3 animate-spin" />
                    ) : offline.isOnline ? (
                        <Wifi className="h-3 w-3" />
                    ) : (
                        <WifiOff className="h-3 w-3" />
                    )}
                    {offline.isOnline
                        ? offline.isSyncing
                            ? 'Syncing...'
                            : `${offline.pendingCount > 0 ? `${offline.pendingCount} pending` : 'Online'}`
                        : 'Offline'}
                </Badge>
            </div>

            {children}
        </OfflineContext.Provider>
    );
}

export function useOfflineContext() {
    const context = useContext(OfflineContext);
    if (!context) {
        throw new Error('useOfflineContext must be used within OfflineProvider');
    }
    return context;
}