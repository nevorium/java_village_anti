// Core game types

export interface Position {
    x: number;
    y: number;
    z: number;
}

export interface GameItem {
    id: string;
    name: string;
    description: string;
    icon: string;
    stackable: boolean;
    maxStack: number;
    category: ItemCategory;
    sellPrice: number;
    buyPrice: number;
}

export type ItemCategory =
    | 'tool'
    | 'seed'
    | 'crop'
    | 'material'
    | 'food'
    | 'building'
    | 'special';

export interface InventorySlot {
    item: GameItem | null;
    quantity: number;
}

export interface Player {
    id: string;
    username: string;
    position: Position;
    money: number;
    inventory: InventorySlot[];
    hotbarIndex: number;
}

export interface GameTime {
    day: number;
    hour: number;
    minute: number;
    season: Season;
    year: number;
}

export type Season = 'spring' | 'summer' | 'autumn' | 'winter';

export interface CropDefinition {
    id: string;
    name: string;
    seedItem: string;
    harvestItem: string;
    growthStages: number;
    growthTime: number; // In-game hours per stage
    seasons: Season[];
    waterRequired: boolean;
}

export interface FarmTile {
    position: { x: number; z: number };
    tilled: boolean;
    watered: boolean;
    crop: PlantedCrop | null;
}

export interface PlantedCrop {
    cropId: string;
    currentStage: number;
    plantedAt: number; // Game timestamp
    lastWateredAt: number;
}

export interface Building {
    id: string;
    type: string;
    position: Position;
    rotation: number;
    level: number;
}

export interface NPC {
    id: string;
    name: string;
    personality: string;
    position: Position;
    currentTask: string | null;
    isBusy: boolean;
}

export interface Animal {
    id: string;
    type: string;
    name: string;
    position: Position;
    happiness: number;
    lastFedAt: number;
    isFantasy: boolean;
}

export interface WorldState {
    id: string;
    ownerId: string;
    name: string;
    players: Player[];
    farmTiles: FarmTile[];
    buildings: Building[];
    npcs: NPC[];
    animals: Animal[];
    gameTime: GameTime;
}
