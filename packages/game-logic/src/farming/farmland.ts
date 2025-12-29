import { FarmTile, PlantedCrop } from '../types';

/**
 * Create a new empty farm tile
 */
export function createFarmTile(x: number, z: number): FarmTile {
    return {
        position: { x, z },
        tilled: false,
        watered: false,
        crop: null,
    };
}

/**
 * Create a grid of farm tiles
 */
export function createFarmGrid(
    startX: number,
    startZ: number,
    width: number,
    height: number
): FarmTile[] {
    const tiles: FarmTile[] = [];

    for (let x = 0; x < width; x++) {
        for (let z = 0; z < height; z++) {
            tiles.push(createFarmTile(startX + x, startZ + z));
        }
    }

    return tiles;
}

/**
 * Till a farm tile
 */
export function tillTile(tile: FarmTile): FarmTile {
    return {
        ...tile,
        tilled: true,
    };
}

/**
 * Water a farm tile
 */
export function waterTile(tile: FarmTile, currentTime: number): FarmTile {
    return {
        ...tile,
        watered: true,
        crop: tile.crop
            ? { ...tile.crop, lastWateredAt: currentTime }
            : null,
    };
}

/**
 * Plant a crop in a tilled tile
 */
export function plantCrop(
    tile: FarmTile,
    cropId: string,
    currentTime: number
): FarmTile {
    if (!tile.tilled) {
        throw new Error('Cannot plant in untilled soil');
    }

    if (tile.crop) {
        throw new Error('Tile already has a crop');
    }

    const plantedCrop: PlantedCrop = {
        cropId,
        currentStage: 0,
        plantedAt: currentTime,
        lastWateredAt: 0,
    };

    return {
        ...tile,
        crop: plantedCrop,
    };
}

/**
 * Harvest a crop from a tile
 */
export function harvestTile(tile: FarmTile): FarmTile {
    return {
        ...tile,
        crop: null,
        tilled: true, // Keep tilled after harvest
        watered: false,
    };
}

/**
 * Reset watered status (called at start of new day)
 */
export function resetDailyWater(tiles: FarmTile[]): FarmTile[] {
    return tiles.map(tile => ({
        ...tile,
        watered: false,
    }));
}
