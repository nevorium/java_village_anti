// Asset manifest - defines all game assets and their paths
// This makes it easy to swap asset packs in the future

export interface AssetPack {
    name: string;
    version: string;
    basePath: string;
}

export interface ModelAsset {
    id: string;
    path: string;
    scale?: number;
}

export interface TextureAsset {
    id: string;
    path: string;
}

export interface SoundAsset {
    id: string;
    path: string;
    volume?: number;
}

export interface AssetManifest {
    pack: AssetPack;
    models: Record<string, ModelAsset>;
    textures: Record<string, TextureAsset>;
    sounds: Record<string, SoundAsset>;
}

// Default asset pack (placeholder/free assets)
export const DEFAULT_ASSET_MANIFEST: AssetManifest = {
    pack: {
        name: 'default',
        version: '1.0.0',
        basePath: '/assets/packs/default',
    },
    models: {
        // Player
        player: { id: 'player', path: '/models/player.glb', scale: 1 },

        // Tools
        hoe: { id: 'hoe', path: '/models/tools/hoe.glb', scale: 0.5 },
        axe: { id: 'axe', path: '/models/tools/axe.glb', scale: 0.5 },
        pickaxe: { id: 'pickaxe', path: '/models/tools/pickaxe.glb', scale: 0.5 },
        watering_can: { id: 'watering_can', path: '/models/tools/watering_can.glb', scale: 0.5 },

        // Crops (growth stages)
        wheat_stage_0: { id: 'wheat_stage_0', path: '/models/crops/wheat_0.glb', scale: 1 },
        wheat_stage_1: { id: 'wheat_stage_1', path: '/models/crops/wheat_1.glb', scale: 1 },
        wheat_stage_2: { id: 'wheat_stage_2', path: '/models/crops/wheat_2.glb', scale: 1 },
        wheat_stage_3: { id: 'wheat_stage_3', path: '/models/crops/wheat_3.glb', scale: 1 },

        // Buildings
        barn: { id: 'barn', path: '/models/buildings/barn.glb', scale: 1 },
        house: { id: 'house', path: '/models/buildings/house.glb', scale: 1 },

        // Animals
        chicken: { id: 'chicken', path: '/models/animals/chicken.glb', scale: 0.5 },
        cow: { id: 'cow', path: '/models/animals/cow.glb', scale: 1 },

        // Fantasy animals
        unicorn: { id: 'unicorn', path: '/models/animals/unicorn.glb', scale: 1 },
        dragon: { id: 'dragon', path: '/models/animals/dragon.glb', scale: 1.5 },

        // Environment
        tree_oak: { id: 'tree_oak', path: '/models/environment/tree_oak.glb', scale: 1 },
        rock: { id: 'rock', path: '/models/environment/rock.glb', scale: 1 },
    },
    textures: {
        // Terrain
        grass: { id: 'grass', path: '/textures/terrain/grass.png' },
        dirt: { id: 'dirt', path: '/textures/terrain/dirt.png' },
        tilled: { id: 'tilled', path: '/textures/terrain/tilled.png' },
        watered: { id: 'watered', path: '/textures/terrain/watered.png' },

        // UI
        inventory_slot: { id: 'inventory_slot', path: '/textures/ui/slot.png' },
        hotbar_bg: { id: 'hotbar_bg', path: '/textures/ui/hotbar_bg.png' },
    },
    sounds: {
        // Ambient
        birds: { id: 'birds', path: '/sounds/ambient/birds.mp3', volume: 0.3 },
        wind: { id: 'wind', path: '/sounds/ambient/wind.mp3', volume: 0.2 },

        // Actions
        hoe_till: { id: 'hoe_till', path: '/sounds/actions/till.mp3', volume: 0.5 },
        water_pour: { id: 'water_pour', path: '/sounds/actions/water.mp3', volume: 0.5 },
        harvest: { id: 'harvest', path: '/sounds/actions/harvest.mp3', volume: 0.5 },
        axe_chop: { id: 'axe_chop', path: '/sounds/actions/chop.mp3', volume: 0.6 },

        // UI
        click: { id: 'click', path: '/sounds/ui/click.mp3', volume: 0.4 },
        item_pickup: { id: 'item_pickup', path: '/sounds/ui/pickup.mp3', volume: 0.4 },
    },
};
