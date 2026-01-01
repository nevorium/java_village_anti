'use client';

import { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import { Sky } from '@react-three/drei';
import * as THREE from 'three';
import { useGameStore } from '@/stores/gameStore';
import { isDaytime } from '@java-village/game-logic';

interface DayNightCycleProps {
    // Speed multiplier for time progression (1 = normal, 2 = twice as fast)
    speed?: number;
}

export default function DayNightCycle({ speed = 1 }: DayNightCycleProps) {
    const directionalLightRef = useRef<THREE.DirectionalLight>(null);
    const ambientLightRef = useRef<THREE.AmbientLight>(null);

    const gameTime = useGameStore((state) => state.gameTime);
    const updateGameTime = useGameStore((state) => state.updateGameTime);
    const isPaused = useGameStore((state) => state.isPaused);

    // Calculate sun position based on game time
    const sunPosition = useMemo(() => {
        // Convert hour to radians (0-24 hours = 0-2π)
        const hourAngle = ((gameTime.hour + gameTime.minute / 60) / 24) * Math.PI * 2;

        // Sun rises at 6am (π/2), sets at 6pm (3π/2)
        // Offset so sunrise is at correct position
        const adjustedAngle = hourAngle - Math.PI / 2;

        const radius = 100;
        const x = Math.cos(adjustedAngle) * radius;
        const y = Math.sin(adjustedAngle) * radius;
        const z = 50;

        return new THREE.Vector3(x, Math.max(y, -10), z);
    }, [gameTime.hour, gameTime.minute]);

    // Calculate lighting intensity based on time
    const lightingParams = useMemo(() => {
        const hour = gameTime.hour + gameTime.minute / 60;

        // Dawn: 5-7, Dusk: 17-19, Night: 19-5
        let sunIntensity = 0;
        let ambientIntensity = 0;
        let skyInclination = 0.5;

        if (hour >= 6 && hour < 7) {
            // Sunrise transition
            const t = (hour - 6);
            sunIntensity = t * 1.5;
            ambientIntensity = 0.2 + t * 0.3;
            skyInclination = 0.4 + t * 0.1;
        } else if (hour >= 7 && hour < 17) {
            // Day
            sunIntensity = 1.5;
            ambientIntensity = 0.5;
            skyInclination = 0.5;
        } else if (hour >= 17 && hour < 19) {
            // Sunset transition
            const t = (19 - hour) / 2;
            sunIntensity = t * 1.5;
            ambientIntensity = 0.2 + t * 0.3;
            skyInclination = 0.3 + t * 0.2;
        } else {
            // Night
            sunIntensity = 0;
            ambientIntensity = 0.15;
            skyInclination = 0.2;
        }

        return { sunIntensity, ambientIntensity, skyInclination };
    }, [gameTime.hour, gameTime.minute]);

    // Calculate sun color based on time
    const sunColor = useMemo(() => {
        const hour = gameTime.hour + gameTime.minute / 60;

        if (hour >= 6 && hour < 7) {
            // Sunrise - orange/pink
            return new THREE.Color(1.0, 0.6, 0.4);
        } else if (hour >= 17 && hour < 19) {
            // Sunset - orange/red
            return new THREE.Color(1.0, 0.5, 0.3);
        } else if (hour >= 7 && hour < 17) {
            // Day - warm white
            return new THREE.Color(1.0, 0.95, 0.9);
        } else {
            // Night - cool blue
            return new THREE.Color(0.4, 0.4, 0.6);
        }
    }, [gameTime.hour, gameTime.minute]);

    // Update time each frame
    useFrame((state, delta) => {
        if (!isPaused) {
            updateGameTime(delta * speed);
        }

        // Update directional light
        if (directionalLightRef.current) {
            directionalLightRef.current.position.copy(sunPosition);
            directionalLightRef.current.intensity = lightingParams.sunIntensity;
            directionalLightRef.current.color.copy(sunColor);
        }

        // Update ambient light
        if (ambientLightRef.current) {
            ambientLightRef.current.intensity = lightingParams.ambientIntensity;
        }
    });

    const isDay = isDaytime(gameTime);

    return (
        <>
            {/* Ambient light - always present */}
            <ambientLight
                ref={ambientLightRef}
                intensity={lightingParams.ambientIntensity}
                color={isDay ? '#ffffff' : '#4466aa'}
            />

            {/* Directional light (sun/moon) */}
            <directionalLight
                ref={directionalLightRef}
                position={[sunPosition.x, sunPosition.y, sunPosition.z]}
                intensity={lightingParams.sunIntensity}
                color={sunColor}
                castShadow
                shadow-mapSize={[2048, 2048]}
                shadow-camera-far={200}
                shadow-camera-left={-50}
                shadow-camera-right={50}
                shadow-camera-top={50}
                shadow-camera-bottom={-50}
            />

            {/* Sky */}
            <Sky
                distance={450000}
                sunPosition={[sunPosition.x, sunPosition.y, sunPosition.z]}
                inclination={lightingParams.skyInclination}
                azimuth={0.25}
                mieCoefficient={0.005}
                mieDirectionalG={0.8}
                rayleigh={isDay ? 2 : 0.5}
                turbidity={isDay ? 8 : 2}
            />

            {/* Stars at night */}
            {!isDay && <Stars />}
        </>
    );
}

// Simple stars component for nighttime
function Stars() {
    const starsRef = useRef<THREE.Points>(null);

    const [positions, colors] = useMemo(() => {
        const count = 500;
        const positions = new Float32Array(count * 3);
        const colors = new Float32Array(count * 3);

        for (let i = 0; i < count; i++) {
            // Random positions on a sphere
            const theta = Math.random() * Math.PI * 2;
            const phi = Math.acos(2 * Math.random() - 1);
            const radius = 400;

            positions[i * 3] = radius * Math.sin(phi) * Math.cos(theta);
            positions[i * 3 + 1] = Math.abs(radius * Math.cos(phi)); // Only upper hemisphere
            positions[i * 3 + 2] = radius * Math.sin(phi) * Math.sin(theta);

            // Slight color variation (white to blue-white)
            const brightness = 0.5 + Math.random() * 0.5;
            colors[i * 3] = brightness;
            colors[i * 3 + 1] = brightness;
            colors[i * 3 + 2] = brightness + Math.random() * 0.2;
        }

        return [positions, colors];
    }, []);

    // Twinkle effect
    useFrame((state) => {
        if (starsRef.current) {
            const time = state.clock.elapsedTime;
            starsRef.current.rotation.y = time * 0.01;
        }
    });

    return (
        <points ref={starsRef}>
            <bufferGeometry>
                <bufferAttribute
                    attach="attributes-position"
                    count={positions.length / 3}
                    array={positions}
                    itemSize={3}
                />
                <bufferAttribute
                    attach="attributes-color"
                    count={colors.length / 3}
                    array={colors}
                    itemSize={3}
                />
            </bufferGeometry>
            <pointsMaterial
                size={2}
                vertexColors
                transparent
                opacity={0.8}
                sizeAttenuation={false}
            />
        </points>
    );
}
