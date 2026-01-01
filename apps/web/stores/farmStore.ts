'use client';

import { create } from 'zustand';
import { FarmTile, PlantedCrop } from '@java-village/game-logic';
import {
    createFarmGrid,
    tillTile,
    waterTile,
    plantCrop,
    harvestTile,
} from '@java-village/game-logic';

interface FarmState {
    tiles: FarmTile[];
    selectedTool: 'hoe' | 'watering_can' | 'scythe' | 'axe' | 'pickaxe' | null;

    // Actions
    initializeFarm: (startX: number, startZ: number, width: number, height: number) => void;
    setSelectedTool: (tool: FarmState['selectedTool']) => void;
    useTool: (x: number, z: number, gameTime: number) => void;
    getTile: (x: number, z: number) => FarmTile | undefined;
    updateTile: (x: number, z: number, tile: FarmTile) => void;
    resetDailyWater: () => void;
}

export const useFarmStore = create<FarmState>((set, get) => ({
    tiles: [],
    selectedTool: 'hoe',

    initializeFarm: (startX, startZ, width, height) => {
        const tiles = createFarmGrid(startX, startZ, width, height);
        set({ tiles });
    },

    setSelectedTool: (tool) => set({ selectedTool: tool }),

    getTile: (x, z) => {
        const { tiles } = get();
        return tiles.find((t) => t.position.x === x && t.position.z === z);
    },

    updateTile: (x, z, newTile) => {
        set((state) => ({
            tiles: state.tiles.map((t) =>
                t.position.x === x && t.position.z === z ? newTile : t
            ),
        }));
    },

    useTool: (x, z, gameTime) => {
        const { selectedTool, getTile, updateTile } = get();
        const tile = getTile(x, z);

        if (!tile || !selectedTool) return;

        try {
            switch (selectedTool) {
                case 'hoe':
                    if (!tile.tilled) {
                        updateTile(x, z, tillTile(tile));
                    }
                    break;

                case 'watering_can':
                    if (tile.tilled) {
                        updateTile(x, z, waterTile(tile, gameTime));
                    }
                    break;

                case 'scythe':
                    if (tile.crop) {
                        // Check if crop is ready to harvest
                        updateTile(x, z, harvestTile(tile));
                        // TODO: Add harvested items to inventory
                    }
                    break;

                default:
                    break;
            }
        } catch (error) {
            console.warn('Tool action failed:', error);
        }
    },

    resetDailyWater: () => {
        set((state) => ({
            tiles: state.tiles.map((tile) => ({
                ...tile,
                watered: false,
            })),
        }));
    },
}));
