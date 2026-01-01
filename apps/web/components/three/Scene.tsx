'use client';

import { Suspense } from 'react';
import { Environment } from '@react-three/drei';
import IsometricCamera from './IsometricCamera';
import DayNightCycle from './DayNightCycle';
import TerrainGrid from './TerrainGrid';
// import PixelShaderEffect from './PixelShaderEffect'; // Uncomment for pixel effect

export default function Scene() {
    return (
        <>
            {/* Camera */}
            <IsometricCamera zoom={40} />

            {/* Day/Night Cycle (includes lighting and sky) */}
            <Suspense fallback={null}>
                <DayNightCycle speed={1} />
            </Suspense>

            {/* Environment for reflections */}
            <Environment preset="forest" />

            {/* Terrain Grid */}
            <Suspense fallback={null}>
                <TerrainGrid
                    width={32}
                    height={32}
                    tileSize={1}
                    onTileClick={(x, z) => {
                        console.log(`Clicked tile: ${x}, ${z}`);
                    }}
                />
            </Suspense>

            {/* Test Player (placeholder) */}
            <mesh position={[0, 0.6, 0]} castShadow>
                <capsuleGeometry args={[0.3, 0.6, 4, 8]} />
                <meshStandardMaterial color="#e07a5f" />
            </mesh>

            {/* Pixel Shader Effect - uncomment for retro look */}
            {/* <PixelShaderEffect pixelSize={3} colorLevels={16} enabled={true} /> */}
        </>
    );
}
