'use client';

import { Canvas } from '@react-three/fiber';
import { Suspense } from 'react';
import Scene from '@/components/three/Scene';
import UIOverlay from '@/components/ui/UIOverlay';

export default function Game() {
    return (
        <>
            {/* 3D Canvas */}
            <div className="canvas-container">
                <Canvas
                    shadows
                    camera={{
                        position: [0, 10, 10],
                        fov: 60,
                        near: 0.1,
                        far: 1000,
                    }}
                    gl={{
                        antialias: true,
                        powerPreference: 'high-performance',
                    }}
                    dpr={[1, 2]} // Adaptive pixel ratio
                >
                    <Suspense fallback={null}>
                        <Scene />
                    </Suspense>
                </Canvas>
            </div>

            {/* UI Overlay */}
            <UIOverlay />
        </>
    );
}
