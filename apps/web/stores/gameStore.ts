'use client';

import { create } from 'zustand';
import { GameTime, InventorySlot, Position } from '@java-village/game-logic';
import { createInitialGameTime, advanceTime } from '@java-village/game-logic';

interface GameState {
    // Player state
    playerPosition: Position;
    playerRotation: number;
    money: number;

    // Inventory
    inventory: InventorySlot[];
    hotbarIndex: number;

    // Time
    gameTime: GameTime;
    isPaused: boolean;

    // UI state
    isInventoryOpen: boolean;
    isSettingsOpen: boolean;
    isChatOpen: boolean;

    // Actions - Player
    setPlayerPosition: (position: Position) => void;
    setPlayerRotation: (rotation: number) => void;
    addMoney: (amount: number) => void;

    // Actions - Inventory
    setHotbarIndex: (index: number) => void;
    setInventorySlot: (index: number, slot: InventorySlot) => void;
    swapInventorySlots: (from: number, to: number) => void;

    // Actions - Time
    updateGameTime: (deltaSeconds: number) => void;
    setPaused: (paused: boolean) => void;

    // Actions - UI
    toggleInventory: () => void;
    toggleSettings: () => void;
    toggleChat: () => void;
    closeAllMenus: () => void;
}

// Create initial inventory (36 slots + 9 hotbar = 45 total, but we use 36 for inventory + hotbar overlay)
function createInitialInventory(): InventorySlot[] {
    return Array.from({ length: 36 }, () => ({ item: null, quantity: 0 }));
}

export const useGameStore = create<GameState>((set, get) => ({
    // Initial state
    playerPosition: { x: 0, y: 0, z: 0 },
    playerRotation: 0,
    money: 500,

    inventory: createInitialInventory(),
    hotbarIndex: 0,

    gameTime: createInitialGameTime(),
    isPaused: false,

    isInventoryOpen: false,
    isSettingsOpen: false,
    isChatOpen: false,

    // Player actions
    setPlayerPosition: (position) => set({ playerPosition: position }),
    setPlayerRotation: (rotation) => set({ playerRotation: rotation }),
    addMoney: (amount) => set((state) => ({ money: state.money + amount })),

    // Inventory actions
    setHotbarIndex: (index) => set({ hotbarIndex: Math.max(0, Math.min(8, index)) }),

    setInventorySlot: (index, slot) =>
        set((state) => {
            const newInventory = [...state.inventory];
            newInventory[index] = slot;
            return { inventory: newInventory };
        }),

    swapInventorySlots: (from, to) =>
        set((state) => {
            const newInventory = [...state.inventory];
            const temp = newInventory[from];
            newInventory[from] = newInventory[to];
            newInventory[to] = temp;
            return { inventory: newInventory };
        }),

    // Time actions
    updateGameTime: (deltaSeconds) =>
        set((state) => {
            if (state.isPaused) return state;
            return { gameTime: advanceTime(state.gameTime, deltaSeconds) };
        }),

    setPaused: (paused) => set({ isPaused: paused }),

    // UI actions
    toggleInventory: () =>
        set((state) => ({
            isInventoryOpen: !state.isInventoryOpen,
            isSettingsOpen: false,
        })),

    toggleSettings: () =>
        set((state) => ({
            isSettingsOpen: !state.isSettingsOpen,
            isInventoryOpen: false,
        })),

    toggleChat: () =>
        set((state) => ({ isChatOpen: !state.isChatOpen })),

    closeAllMenus: () =>
        set({
            isInventoryOpen: false,
            isSettingsOpen: false,
            isChatOpen: false,
        }),
}));
