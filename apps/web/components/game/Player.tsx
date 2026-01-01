'use client';

import { useRef, useEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { useGameStore } from '@/stores/gameStore';
import { useKeyboardControls } from './useKeyboardControls';

interface PlayerProps {
    speed?: number;
}

export default function Player({ speed = 5 }: PlayerProps) {
    const meshRef = useRef<THREE.Mesh>(null);
    const velocity = useRef(new THREE.Vector3());

    const setPlayerPosition = useGameStore((state) => state.setPlayerPosition);
    const playerPosition = useGameStore((state) => state.playerPosition);

    // Get keyboard input
    const { forward, backward, left, right, sprint } = useKeyboardControls();

    useFrame((state, delta) => {
        if (!meshRef.current) return;

        // Calculate movement direction
        const direction = new THREE.Vector3();

        if (forward) direction.z -= 1;
        if (backward) direction.z += 1;
        if (left) direction.x -= 1;
        if (right) direction.x += 1;

        // Normalize diagonal movement
        if (direction.length() > 0) {
            direction.normalize();
        }

        // Apply speed (with sprint multiplier)
        const currentSpeed = sprint ? speed * 1.5 : speed;
        velocity.current.copy(direction).multiplyScalar(currentSpeed * delta);

        // Update position
        meshRef.current.position.add(velocity.current);

        // Rotate player to face movement direction
        if (direction.length() > 0) {
            const targetRotation = Math.atan2(direction.x, direction.z);
            meshRef.current.rotation.y = THREE.MathUtils.lerp(
                meshRef.current.rotation.y,
                targetRotation,
                0.2
            );
        }

        // Update store
        setPlayerPosition({
            x: meshRef.current.position.x,
            y: meshRef.current.position.y,
            z: meshRef.current.position.z,
        });
    });

    return (
        <group>
            {/* Player mesh */}
            <mesh
                ref={meshRef}
                position={[playerPosition.x, 0.6, playerPosition.z]}
                castShadow
            >
                {/* Body */}
                <capsuleGeometry args={[0.3, 0.6, 4, 8]} />
                <meshStandardMaterial color="#e07a5f" />
            </mesh>

            {/* Player shadow indicator */}
            <mesh
                position={[playerPosition.x, 0.01, playerPosition.z]}
                rotation={[-Math.PI / 2, 0, 0]}
            >
                <circleGeometry args={[0.4, 16]} />
                <meshBasicMaterial color="#000000" opacity={0.3} transparent />
            </mesh>
        </group>
    );
}
