import { GameItem, ItemCategory } from '../types';

// Tool items
export const TOOLS: Record<string, GameItem> = {
    hoe: {
        id: 'hoe',
        name: 'Hoe',
        description: 'Used to till soil for planting crops',
        icon: '🪓',
        stackable: false,
        maxStack: 1,
        category: 'tool',
        sellPrice: 0,
        buyPrice: 500,
    },
    watering_can: {
        id: 'watering_can',
        name: 'Watering Can',
        description: 'Used to water crops',
        icon: '🪣',
        stackable: false,
        maxStack: 1,
        category: 'tool',
        sellPrice: 0,
        buyPrice: 300,
    },
    axe: {
        id: 'axe',
        name: 'Axe',
        description: 'Used to chop trees',
        icon: '🪓',
        stackable: false,
        maxStack: 1,
        category: 'tool',
        sellPrice: 0,
        buyPrice: 600,
    },
    pickaxe: {
        id: 'pickaxe',
        name: 'Pickaxe',
        description: 'Used to mine rocks and ore',
        icon: '⛏️',
        stackable: false,
        maxStack: 1,
        category: 'tool',
        sellPrice: 0,
        buyPrice: 700,
    },
    scythe: {
        id: 'scythe',
        name: 'Scythe',
        description: 'Used to harvest crops',
        icon: '🌾',
        stackable: false,
        maxStack: 1,
        category: 'tool',
        sellPrice: 0,
        buyPrice: 400,
    },
};

// Seed items
export const SEEDS: Record<string, GameItem> = {
    wheat_seed: {
        id: 'wheat_seed',
        name: 'Wheat Seeds',
        description: 'Plant to grow wheat',
        icon: '🌱',
        stackable: true,
        maxStack: 99,
        category: 'seed',
        sellPrice: 5,
        buyPrice: 20,
    },
    carrot_seed: {
        id: 'carrot_seed',
        name: 'Carrot Seeds',
        description: 'Plant to grow carrots',
        icon: '🌱',
        stackable: true,
        maxStack: 99,
        category: 'seed',
        sellPrice: 8,
        buyPrice: 30,
    },
    tomato_seed: {
        id: 'tomato_seed',
        name: 'Tomato Seeds',
        description: 'Plant to grow tomatoes',
        icon: '🌱',
        stackable: true,
        maxStack: 99,
        category: 'seed',
        sellPrice: 10,
        buyPrice: 40,
    },
};

// Crop harvest items
export const CROPS_ITEMS: Record<string, GameItem> = {
    wheat: {
        id: 'wheat',
        name: 'Wheat',
        description: 'Harvested wheat grain',
        icon: '🌾',
        stackable: true,
        maxStack: 99,
        category: 'crop',
        sellPrice: 50,
        buyPrice: 0,
    },
    carrot: {
        id: 'carrot',
        name: 'Carrot',
        description: 'Fresh orange carrot',
        icon: '🥕',
        stackable: true,
        maxStack: 99,
        category: 'crop',
        sellPrice: 60,
        buyPrice: 0,
    },
    tomato: {
        id: 'tomato',
        name: 'Tomato',
        description: 'Ripe red tomato',
        icon: '🍅',
        stackable: true,
        maxStack: 99,
        category: 'crop',
        sellPrice: 80,
        buyPrice: 0,
    },
};

// All items combined
export const ALL_ITEMS: Record<string, GameItem> = {
    ...TOOLS,
    ...SEEDS,
    ...CROPS_ITEMS,
};

/**
 * Get item by ID
 */
export function getItem(itemId: string): GameItem | undefined {
    return ALL_ITEMS[itemId];
}

/**
 * Get items by category
 */
export function getItemsByCategory(category: ItemCategory): GameItem[] {
    return Object.values(ALL_ITEMS).filter(item => item.category === category);
}
