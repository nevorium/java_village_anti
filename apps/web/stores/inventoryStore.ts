'use client';

import { create } from 'zustand';
import { InventorySlot, GameItem } from '@java-village/game-logic';
import { getItem } from '@java-village/game-logic';

// Inventory size constants
const INVENTORY_SIZE = 27; // Main inventory (3 rows of 9)
const HOTBAR_SIZE = 9;
const TOTAL_SLOTS = INVENTORY_SIZE + HOTBAR_SIZE;

interface InventoryState {
    // Slots 0-8 are hotbar, 9-35 are main inventory
    slots: InventorySlot[];
    hotbarIndex: number;
    isOpen: boolean;
    draggedSlot: number | null;

    // Actions
    setHotbarIndex: (index: number) => void;
    toggleInventory: () => void;
    closeInventory: () => void;

    // Item management
    addItem: (itemId: string, quantity?: number) => boolean;
    removeItem: (slotIndex: number, quantity?: number) => boolean;
    swapSlots: (from: number, to: number) => void;
    moveItem: (from: number, to: number, quantity?: number) => void;

    // Drag and drop
    startDrag: (slotIndex: number) => void;
    endDrag: () => void;

    // Getters
    getSlot: (index: number) => InventorySlot;
    getHotbarSlot: (index: number) => InventorySlot;
    getSelectedItem: () => GameItem | null;
    findItemSlot: (itemId: string) => number;
    getTotalItemCount: (itemId: string) => number;
}

function createEmptySlots(): InventorySlot[] {
    return Array.from({ length: TOTAL_SLOTS }, () => ({
        item: null,
        quantity: 0,
    }));
}

// Get initial inventory with starting items
function getInitialInventory(): InventorySlot[] {
    const slots = createEmptySlots();

    // Give player starting tools
    const startingItems = [
        { id: 'hoe', slot: 0 },
        { id: 'watering_can', slot: 1 },
        { id: 'axe', slot: 2 },
        { id: 'pickaxe', slot: 3 },
        { id: 'scythe', slot: 4 },
        { id: 'wheat_seed', slot: 5, quantity: 10 },
    ];

    for (const { id, slot, quantity } of startingItems) {
        const item = getItem(id);
        if (item) {
            slots[slot] = { item, quantity: quantity || 1 };
        }
    }

    return slots;
}

export const useInventoryStore = create<InventoryState>((set, get) => ({
    slots: getInitialInventory(),
    hotbarIndex: 0,
    isOpen: false,
    draggedSlot: null,

    setHotbarIndex: (index) => {
        if (index >= 0 && index < HOTBAR_SIZE) {
            set({ hotbarIndex: index });
        }
    },

    toggleInventory: () => set((state) => ({ isOpen: !state.isOpen })),
    closeInventory: () => set({ isOpen: false }),

    addItem: (itemId, quantity = 1) => {
        const item = getItem(itemId);
        if (!item) return false;

        const { slots } = get();
        let remaining = quantity;

        // First, try to stack with existing items
        if (item.stackable) {
            for (let i = 0; i < slots.length && remaining > 0; i++) {
                const slot = slots[i];
                if (slot.item?.id === itemId && slot.quantity < item.maxStack) {
                    const canAdd = Math.min(remaining, item.maxStack - slot.quantity);
                    slots[i] = { ...slot, quantity: slot.quantity + canAdd };
                    remaining -= canAdd;
                }
            }
        }

        // Then, try to find empty slots
        for (let i = 0; i < slots.length && remaining > 0; i++) {
            if (!slots[i].item) {
                const addAmount = item.stackable ? Math.min(remaining, item.maxStack) : 1;
                slots[i] = { item, quantity: addAmount };
                remaining -= addAmount;
            }
        }

        if (remaining < quantity) {
            set({ slots: [...slots] });
        }

        return remaining === 0;
    },

    removeItem: (slotIndex, quantity = 1) => {
        const { slots } = get();
        const slot = slots[slotIndex];

        if (!slot.item) return false;

        const newQuantity = slot.quantity - quantity;

        if (newQuantity <= 0) {
            slots[slotIndex] = { item: null, quantity: 0 };
        } else {
            slots[slotIndex] = { ...slot, quantity: newQuantity };
        }

        set({ slots: [...slots] });
        return true;
    },

    swapSlots: (from, to) => {
        const { slots } = get();
        const temp = slots[from];
        slots[from] = slots[to];
        slots[to] = temp;
        set({ slots: [...slots] });
    },

    moveItem: (from, to, quantity) => {
        const { slots } = get();
        const fromSlot = slots[from];
        const toSlot = slots[to];

        if (!fromSlot.item) return;

        const moveQuantity = quantity || fromSlot.quantity;

        // If destination is empty, just move
        if (!toSlot.item) {
            slots[to] = { item: fromSlot.item, quantity: moveQuantity };
            const remaining = fromSlot.quantity - moveQuantity;
            slots[from] = remaining > 0
                ? { item: fromSlot.item, quantity: remaining }
                : { item: null, quantity: 0 };
        }
        // If same item and stackable, try to stack
        else if (
            toSlot.item.id === fromSlot.item.id &&
            fromSlot.item.stackable
        ) {
            const maxAdd = fromSlot.item.maxStack - toSlot.quantity;
            const actualMove = Math.min(moveQuantity, maxAdd);

            slots[to] = { ...toSlot, quantity: toSlot.quantity + actualMove };
            const remaining = fromSlot.quantity - actualMove;
            slots[from] = remaining > 0
                ? { item: fromSlot.item, quantity: remaining }
                : { item: null, quantity: 0 };
        }
        // Otherwise swap
        else {
            const temp = slots[from];
            slots[from] = slots[to];
            slots[to] = temp;
        }

        set({ slots: [...slots] });
    },

    startDrag: (slotIndex) => set({ draggedSlot: slotIndex }),
    endDrag: () => set({ draggedSlot: null }),

    getSlot: (index) => get().slots[index] || { item: null, quantity: 0 },

    getHotbarSlot: (index) => get().slots[index] || { item: null, quantity: 0 },

    getSelectedItem: () => {
        const { slots, hotbarIndex } = get();
        return slots[hotbarIndex]?.item || null;
    },

    findItemSlot: (itemId) => {
        const { slots } = get();
        return slots.findIndex((s) => s.item?.id === itemId);
    },

    getTotalItemCount: (itemId) => {
        const { slots } = get();
        return slots.reduce((total, slot) => {
            if (slot.item?.id === itemId) {
                return total + slot.quantity;
            }
            return total;
        }, 0);
    },
}));

// Export constants
export { INVENTORY_SIZE, HOTBAR_SIZE, TOTAL_SLOTS };
