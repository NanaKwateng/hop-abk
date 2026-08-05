// lib/offline/conflict-resolver.ts

export interface Conflict {
    local: any;
    remote: any;
    table: string;
    recordId: string;
}

export interface ConflictResolution {
    resolved: 'local' | 'remote' | 'merged';
    data: any;
    message: string;
}

class ConflictResolver {
    /**
     * Resolve conflicts between local and remote data
     */
    async resolve(conflict: Conflict): Promise<ConflictResolution> {
        // Strategy: Last write wins with timestamp comparison
        // Local has updatedAt, remote has updated_at
        const localTime = new Date(conflict.local.updatedAt || conflict.local.createdAt || 0).getTime();
        const remoteTime = new Date(conflict.remote.updated_at || conflict.remote.created_at || 0).getTime();

        if (localTime > remoteTime) {
            return {
                resolved: 'local',
                data: conflict.local,
                message: 'Local data is newer, keeping local version',
            };
        } else if (remoteTime > localTime) {
            return {
                resolved: 'remote',
                data: conflict.remote,
                message: 'Remote data is newer, using remote version',
            };
        }

        // Same timestamp - merge
        return {
            resolved: 'merged',
            data: this.mergeData(conflict.local, conflict.remote),
            message: 'Merged local and remote data',
        };
    }

    /**
     * Merge local and remote data
     */
    private mergeData(local: any, remote: any): any {
        // Prefer non-null values
        const merged: any = {};

        const allKeys = new Set([...Object.keys(local), ...Object.keys(remote)]);

        for (const key of allKeys) {
            const localVal = local[key];
            const remoteVal = remote[key];

            if (localVal !== undefined && remoteVal !== undefined) {
                // Both exist - prefer the non-null one
                if (localVal === null && remoteVal !== null) {
                    merged[key] = remoteVal;
                } else if (remoteVal === null && localVal !== null) {
                    merged[key] = localVal;
                } else if (typeof localVal === 'object' && localVal !== null && typeof remoteVal === 'object' && remoteVal !== null) {
                    // Recursively merge objects
                    merged[key] = this.mergeData(localVal, remoteVal);
                } else {
                    // Prefer local for simple values
                    merged[key] = localVal;
                }
            } else if (localVal !== undefined) {
                merged[key] = localVal;
            } else if (remoteVal !== undefined) {
                merged[key] = remoteVal;
            }
        }

        return merged;
    }

    /**
     * Check if a conflict exists
     */
    hasConflict(local: any, remote: any): boolean {
        // Check if data has changed differently
        const localHash = this.hashData(local);
        const remoteHash = this.hashData(remote);
        return localHash !== remoteHash;
    }

    /**
     * Simple hash function for data comparison
     */
    private hashData(data: any): string {
        const str = JSON.stringify(data);
        let hash = 0;
        for (let i = 0; i < str.length; i++) {
            const char = str.charCodeAt(i);
            hash = ((hash << 5) - hash) + char;
            hash = hash & hash; // Convert to 32bit integer
        }
        return hash.toString(36);
    }
}

export const conflictResolver = new ConflictResolver();