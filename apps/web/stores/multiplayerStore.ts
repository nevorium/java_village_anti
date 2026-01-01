'use client';

import { create } from 'zustand';
import { multiplayerSync, PlayerPosition } from '@/lib/multiplayer/sync';

interface RemotePlayer {
    id: string;
    x: number;
    y: number;
    z: number;
    rotation: number;
    lastUpdate: number;
}

interface MultiplayerState {
    isConnected: boolean;
    worldId: string | null;
    remotePlayers: Map<string, RemotePlayer>;

    // Actions
    connect: (worldId: string, playerId: string) => Promise<void>;
    disconnect: () => Promise<void>;
    updateLocalPosition: (x: number, y: number, z: number, rotation: number) => void;
    getRemotePlayers: () => RemotePlayer[];
}

export const useMultiplayerStore = create<MultiplayerState>((set, get) => ({
    isConnected: false,
    worldId: null,
    remotePlayers: new Map(),

    connect: async (worldId, playerId) => {
        await multiplayerSync.joinWorld(worldId, playerId, {
            onPlayerJoin: (joinedPlayerId) => {
                console.log(`Player joined: ${joinedPlayerId}`);
            },
            onPlayerLeave: (leftPlayerId) => {
                set((state) => {
                    const newPlayers = new Map(state.remotePlayers);
                    newPlayers.delete(leftPlayerId);
                    return { remotePlayers: newPlayers };
                });
            },
            onPlayerMove: (position: PlayerPosition) => {
                set((state) => {
                    const newPlayers = new Map(state.remotePlayers);
                    newPlayers.set(position.playerId, {
                        id: position.playerId,
                        x: position.x,
                        y: position.y,
                        z: position.z,
                        rotation: position.rotation,
                        lastUpdate: Date.now(),
                    });
                    return { remotePlayers: newPlayers };
                });
            },
        });

        set({ isConnected: true, worldId });
    },

    disconnect: async () => {
        await multiplayerSync.leaveWorld();
        set({
            isConnected: false,
            worldId: null,
            remotePlayers: new Map(),
        });
    },

    updateLocalPosition: (x, y, z, rotation) => {
        multiplayerSync.broadcastPosition(x, y, z, rotation);
    },

    getRemotePlayers: () => {
        return Array.from(get().remotePlayers.values());
    },
}));
