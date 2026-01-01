'use client';

import { createClient } from '@/lib/supabase/client';
import { RealtimeChannel } from '@supabase/supabase-js';

export interface PlayerPosition {
    playerId: string;
    x: number;
    y: number;
    z: number;
    rotation: number;
    updatedAt: string;
}

export interface MultiplayerCallbacks {
    onPlayerJoin?: (playerId: string) => void;
    onPlayerLeave?: (playerId: string) => void;
    onPlayerMove?: (position: PlayerPosition) => void;
    onWorldStateUpdate?: (state: any) => void;
}

class MultiplayerSync {
    private supabase = createClient();
    private channel: RealtimeChannel | null = null;
    private worldId: string | null = null;
    private playerId: string | null = null;
    private callbacks: MultiplayerCallbacks = {};
    private syncInterval: NodeJS.Timeout | null = null;
    private lastPosition: PlayerPosition | null = null;

    /**
     * Join a world and start syncing
     */
    async joinWorld(worldId: string, playerId: string, callbacks: MultiplayerCallbacks) {
        this.worldId = worldId;
        this.playerId = playerId;
        this.callbacks = callbacks;

        // Create or join the realtime channel
        this.channel = this.supabase
            .channel(`world:${worldId}`)
            .on('presence', { event: 'sync' }, () => {
                this.handlePresenceSync();
            })
            .on('presence', { event: 'join' }, ({ key, newPresences }) => {
                callbacks.onPlayerJoin?.(key);
            })
            .on('presence', { event: 'leave' }, ({ key }) => {
                callbacks.onPlayerLeave?.(key);
            })
            .on('broadcast', { event: 'player_move' }, ({ payload }) => {
                if (payload.playerId !== playerId) {
                    callbacks.onPlayerMove?.(payload as PlayerPosition);
                }
            })
            .on('broadcast', { event: 'world_state' }, ({ payload }) => {
                callbacks.onWorldStateUpdate?.(payload);
            });

        await this.channel.subscribe(async (status) => {
            if (status === 'SUBSCRIBED') {
                // Track presence
                await this.channel?.track({
                    playerId,
                    online_at: new Date().toISOString(),
                });
            }
        });

        // Also subscribe to database changes for player_positions
        this.supabase
            .channel(`positions:${worldId}`)
            .on(
                'postgres_changes',
                {
                    event: '*',
                    schema: 'public',
                    table: 'player_positions',
                    filter: `world_id=eq.${worldId}`,
                },
                (payload) => {
                    if (payload.new && (payload.new as any).player_id !== playerId) {
                        const pos = payload.new as any;
                        callbacks.onPlayerMove?.({
                            playerId: pos.player_id,
                            x: pos.x,
                            y: pos.y,
                            z: pos.z,
                            rotation: pos.rotation,
                            updatedAt: pos.updated_at,
                        });
                    }
                }
            )
            .subscribe();

        console.log(`[Multiplayer] Joined world: ${worldId}`);
    }

    /**
     * Leave the current world
     */
    async leaveWorld() {
        if (this.syncInterval) {
            clearInterval(this.syncInterval);
            this.syncInterval = null;
        }

        if (this.channel) {
            await this.channel.unsubscribe();
            this.channel = null;
        }

        this.worldId = null;
        this.playerId = null;
        this.callbacks = {};

        console.log('[Multiplayer] Left world');
    }

    /**
     * Broadcast player position (high-frequency, use for realtime movement)
     */
    broadcastPosition(x: number, y: number, z: number, rotation: number) {
        if (!this.channel || !this.playerId) return;

        const position: PlayerPosition = {
            playerId: this.playerId,
            x,
            y,
            z,
            rotation,
            updatedAt: new Date().toISOString(),
        };

        // Only broadcast if position changed significantly
        if (this.lastPosition) {
            const dx = Math.abs(position.x - this.lastPosition.x);
            const dz = Math.abs(position.z - this.lastPosition.z);
            const dr = Math.abs(position.rotation - this.lastPosition.rotation);

            if (dx < 0.01 && dz < 0.01 && dr < 0.01) {
                return; // No significant change
            }
        }

        this.lastPosition = position;

        this.channel.send({
            type: 'broadcast',
            event: 'player_move',
            payload: position,
        });
    }

    /**
     * Persist position to database (lower frequency, for persistence)
     */
    async persistPosition(x: number, y: number, z: number, rotation: number) {
        if (!this.worldId || !this.playerId) return;

        try {
            await this.supabase.from('player_positions').upsert({
                world_id: this.worldId,
                player_id: this.playerId,
                x,
                y,
                z,
                rotation,
                updated_at: new Date().toISOString(),
            });
        } catch (error) {
            console.error('[Multiplayer] Failed to persist position:', error);
        }
    }

    /**
     * Start auto-persisting position at interval
     */
    startPositionSync(getPosition: () => { x: number; y: number; z: number; rotation: number }) {
        // Persist every 2 seconds
        this.syncInterval = setInterval(() => {
            const pos = getPosition();
            this.persistPosition(pos.x, pos.y, pos.z, pos.rotation);
        }, 2000);
    }

    /**
     * Broadcast world state update
     */
    broadcastWorldState(state: any) {
        if (!this.channel) return;

        this.channel.send({
            type: 'broadcast',
            event: 'world_state',
            payload: state,
        });
    }

    /**
     * Get all players currently in the world
     */
    getOnlinePlayers(): string[] {
        if (!this.channel) return [];

        const presence = this.channel.presenceState();
        return Object.keys(presence);
    }

    private handlePresenceSync() {
        // Handle full presence sync if needed
        const players = this.getOnlinePlayers();
        console.log(`[Multiplayer] Online players: ${players.length}`);
    }
}

// Singleton instance
export const multiplayerSync = new MultiplayerSync();
