'use client';

import { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { useFarmStore } from '@/stores/farmStore';
import { CROPS, getCurrentGrowthStage, calculateGrowthProgress } from '@java-village/game-logic';
import { useGameStore } from '@/stores/gameStore';
import { getTotalGameHours } from '@java-village/game-logic';

// Tile colors
const TILE_COLORS = {
    untilled: '#4a7c59', // Green grass
    tilled: '#5c3d1e',   // Brown soil
    watered: '#3d2914',  // Dark wet soil
};

export default function FarmlandSystem() {
    const tiles = useFarmStore((state) => state.tiles);
    const useTool = useFarmStore((state) => state.useTool);
    const gameTime = useGameStore((state) => state.gameTime);

    const currentGameHours = useMemo(() => getTotalGameHours(gameTime), [gameTime]);

    const handleTileClick = (x: number, z: number) => {
        useTool(x, z, currentGameHours);
    };

    return (
        <group>
            {tiles.map((tile) => (
                <FarmTile
                    key={`${tile.position.x}-${tile.position.z}`}
                    tile={tile}
                    onClick={() => handleTileClick(tile.position.x, tile.position.z)}
                    currentGameHours={currentGameHours}
                />
            ))}
        </group>
    );
}

interface FarmTileProps {
    tile: {
        position: { x: number; z: number };
        tilled: boolean;
        watered: boolean;
        crop: {
            cropId: string;
            currentStage: number;
            plantedAt: number;
            lastWateredAt: number;
        } | null;
    };
    onClick: () => void;
    currentGameHours: number;
}

function FarmTile({ tile, onClick, currentGameHours }: FarmTileProps) {
    const meshRef = useRef<THREE.Mesh>(null);
    const [hovered, setHovered] = useState(false);

    // Calculate tile color based on state
    const tileColor = useMemo(() => {
        if (!tile.tilled) return TILE_COLORS.untilled;
        if (tile.watered) return TILE_COLORS.watered;
        return TILE_COLORS.tilled;
    }, [tile.tilled, tile.watered]);

    return (
        <group position={[tile.position.x, 0, tile.position.z]}>
            {/* Tile base */}
            <mesh
                ref={meshRef}
                position={[0, 0.05, 0]}
                receiveShadow
                onClick={onClick}
                onPointerEnter={() => setHovered(true)}
                onPointerLeave={() => setHovered(false)}
            >
                <boxGeometry args={[0.95, 0.1, 0.95]} />
                <meshStandardMaterial
                    color={hovered ? '#6b9b7a' : tileColor}
                    roughness={0.8}
                />
            </mesh>

            {/* Crop if planted */}
            {tile.crop && (
                <Crop
                    cropId={tile.crop.cropId}
                    plantedAt={tile.crop.plantedAt}
                    lastWateredAt={tile.crop.lastWateredAt}
                    currentGameHours={currentGameHours}
                />
            )}
        </group>
    );
}

// Add useState import
import { useState } from 'react';

interface CropProps {
    cropId: string;
    plantedAt: number;
    lastWateredAt: number;
    currentGameHours: number;
}

function Crop({ cropId, plantedAt, lastWateredAt, currentGameHours }: CropProps) {
    const cropDef = CROPS[cropId];
    if (!cropDef) return null;

    // Calculate growth progress
    const wasWatered = lastWateredAt > 0;
    const progress = calculateGrowthProgress(
        cropDef,
        plantedAt,
        currentGameHours,
        wasWatered
    );
    const stage = getCurrentGrowthStage(cropDef, progress);

    // Scale based on growth stage
    const scale = 0.2 + (stage / cropDef.growthStages) * 0.8;
    const height = 0.1 + (stage / cropDef.growthStages) * 0.5;

    // Color based on growth (green to yellow when ready)
    const isReady = progress >= 1;
    const color = isReady ? '#c4a35a' : '#3d8c40';

    return (
        <mesh position={[0, height / 2 + 0.1, 0]} castShadow>
            <cylinderGeometry args={[0.05 * scale, 0.1 * scale, height, 6]} />
            <meshStandardMaterial color={color} />
        </mesh>
    );
}
