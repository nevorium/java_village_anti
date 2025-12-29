import { CropDefinition, Season } from '../types';

// Crop definitions
export const CROPS: Record<string, CropDefinition> = {
    wheat: {
        id: 'wheat',
        name: 'Wheat',
        seedItem: 'wheat_seed',
        harvestItem: 'wheat',
        growthStages: 4,
        growthTime: 6, // 6 hours per stage
        seasons: ['spring', 'summer', 'autumn'],
        waterRequired: true,
    },
    carrot: {
        id: 'carrot',
        name: 'Carrot',
        seedItem: 'carrot_seed',
        harvestItem: 'carrot',
        growthStages: 3,
        growthTime: 4,
        seasons: ['spring', 'autumn'],
        waterRequired: true,
    },
    tomato: {
        id: 'tomato',
        name: 'Tomato',
        seedItem: 'tomato_seed',
        harvestItem: 'tomato',
        growthStages: 5,
        growthTime: 8,
        seasons: ['summer'],
        waterRequired: true,
    },
    pumpkin: {
        id: 'pumpkin',
        name: 'Pumpkin',
        seedItem: 'pumpkin_seed',
        harvestItem: 'pumpkin',
        growthStages: 6,
        growthTime: 10,
        seasons: ['autumn'],
        waterRequired: true,
    },
    strawberry: {
        id: 'strawberry',
        name: 'Strawberry',
        seedItem: 'strawberry_seed',
        harvestItem: 'strawberry',
        growthStages: 4,
        growthTime: 5,
        seasons: ['spring'],
        waterRequired: true,
    },
};

/**
 * Get crops available for a specific season
 */
export function getCropsForSeason(season: Season): CropDefinition[] {
    return Object.values(CROPS).filter(crop => crop.seasons.includes(season));
}

/**
 * Calculate growth progress
 */
export function calculateGrowthProgress(
    crop: CropDefinition,
    plantedAt: number,
    currentTime: number,
    wasWatered: boolean
): number {
    if (!wasWatered && crop.waterRequired) {
        return 0; // No growth without water
    }

    const elapsedHours = currentTime - plantedAt;
    const totalGrowthTime = crop.growthStages * crop.growthTime;

    return Math.min(1, elapsedHours / totalGrowthTime);
}

/**
 * Get current growth stage (0-indexed)
 */
export function getCurrentGrowthStage(
    crop: CropDefinition,
    progress: number
): number {
    return Math.floor(progress * crop.growthStages);
}
