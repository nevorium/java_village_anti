'use client';

import { OrbitControls, Sky, Environment } from '@react-three/drei';
import { useRef } from 'react';
import * as THREE from 'three';

export default function Scene() {
    const directionalLightRef = useRef<THREE.DirectionalLight>(null);

    return (
        <>
            {/* Lighting */}
            <ambientLight intensity={0.4} />
            <directionalLight
                ref={directionalLightRef}
                position={[10, 20, 10]}
                intensity={1.5}
                castShadow
                shadow-mapSize={[2048, 2048]}
                shadow-camera-far={50}
                shadow-camera-left={-20}
                shadow-camera-right={20}
                shadow-camera-top={20}
                shadow-camera-bottom={-20}
            />

            {/* Sky */}
            <Sky
                distance={450000}
                sunPosition={[10, 20, 10]}
                inclination={0.5}
                azimuth={0.25}
            />

            {/* Environment for reflections */}
            <Environment preset="forest" />

            {/* Camera Controls */}
            <OrbitControls
                enablePan={true}
                enableZoom={true}
                enableRotate={true}
                minDistance={5}
                maxDistance={50}
                maxPolarAngle={Math.PI / 2.2} // Limit vertical rotation
                target={[0, 0, 0]}
            />

            {/* Ground Plane (temporary) */}
            <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]} receiveShadow>
                <planeGeometry args={[50, 50]} />
                <meshStandardMaterial color="#3d6b4a" />
            </mesh>

            {/* Grid Helper (for development) */}
            <gridHelper args={[50, 50, '#4a7c59', '#2d5a3d']} />

            {/* Test Cube (placeholder for player) */}
            <mesh position={[0, 0.5, 0]} castShadow>
                <boxGeometry args={[1, 1, 1]} />
                <meshStandardMaterial color="#e07a5f" />
            </mesh>
        </>
    );
}
