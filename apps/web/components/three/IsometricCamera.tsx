'use client';

import { useRef, useMemo } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import { OrthographicCamera } from '@react-three/drei';
import * as THREE from 'three';

interface IsometricCameraProps {
    zoom?: number;
    minZoom?: number;
    maxZoom?: number;
    followTarget?: THREE.Vector3 | null;
    smoothness?: number;
    angle?: number; // Isometric angle (default ~35.264 degrees for true isometric)
}

export default function IsometricCamera({
    zoom = 50,
    minZoom = 20,
    maxZoom = 100,
    followTarget = null,
    smoothness = 0.1,
    angle = 35.264,
}: IsometricCameraProps) {
    const cameraRef = useRef<THREE.OrthographicCamera>(null);
    const { size } = useThree();

    // Calculate camera position for isometric view
    const cameraPosition = useMemo(() => {
        const angleRad = (angle * Math.PI) / 180;
        const distance = 50;
        return new THREE.Vector3(
            distance * Math.cos(angleRad),
            distance * Math.sin(angleRad) * 1.5, // Height
            distance * Math.cos(angleRad)
        );
    }, [angle]);

    // Smooth camera follow
    useFrame(() => {
        if (!cameraRef.current) return;

        if (followTarget) {
            // Smooth interpolation towards target
            const targetPosition = new THREE.Vector3(
                followTarget.x + cameraPosition.x,
                cameraPosition.y,
                followTarget.z + cameraPosition.z
            );

            cameraRef.current.position.lerp(targetPosition, smoothness);
            cameraRef.current.lookAt(followTarget);
        }
    });

    // Calculate frustum based on viewport
    const frustum = useMemo(() => {
        const aspect = size.width / size.height;
        return {
            left: -zoom * aspect,
            right: zoom * aspect,
            top: zoom,
            bottom: -zoom,
        };
    }, [size, zoom]);

    return (
        <OrthographicCamera
            ref={cameraRef}
            makeDefault
            position={[cameraPosition.x, cameraPosition.y, cameraPosition.z]}
            zoom={1}
            near={0.1}
            far={1000}
            left={frustum.left}
            right={frustum.right}
            top={frustum.top}
            bottom={frustum.bottom}
        />
    );
}
