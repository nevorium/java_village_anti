'use client';

import { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

// Tile types
export type TileType = 'grass' | 'dirt' | 'water' | 'sand' | 'stone' | 'farmland' | 'farmland_watered';

interface TerrainGridProps {
    width?: number;
    height?: number;
    tileSize?: number;
    tiles?: TileType[][];
    onTileClick?: (x: number, z: number) => void;
    onTileHover?: (x: number, z: number) => void;
}

// Color mappings for each tile type
const TILE_COLORS: Record<TileType, string> = {
    grass: '#4a7c59',
    dirt: '#8b6914',
    water: '#3d85c6',
    sand: '#c9b458',
    stone: '#6b6b6b',
    farmland: '#5c3d1e',
    farmland_watered: '#3d2914',
};

export default function TerrainGrid({
    width = 32,
    height = 32,
    tileSize = 1,
    tiles,
    onTileClick,
    onTileHover,
}: TerrainGridProps) {
    const meshRef = useRef<THREE.InstancedMesh>(null);
    const hoveredTile = useRef<{ x: number; z: number } | null>(null);

    // Generate default tiles if not provided
    const tileData = useMemo(() => {
        if (tiles) return tiles;

        // Generate a simple terrain
        const data: TileType[][] = [];
        for (let x = 0; x < width; x++) {
            data[x] = [];
            for (let z = 0; z < height; z++) {
                // Simple terrain generation
                const distFromCenter = Math.sqrt(
                    Math.pow(x - width / 2, 2) + Math.pow(z - height / 2, 2)
                );

                if (distFromCenter < 5) {
                    data[x][z] = 'farmland';
                } else if (distFromCenter < 8) {
                    data[x][z] = 'dirt';
                } else {
                    data[x][z] = 'grass';
                }
            }
        }
        return data;
    }, [tiles, width, height]);

    // Create instanced geometry
    const { count, matrices, colors } = useMemo(() => {
        const count = width * height;
        const matrices: THREE.Matrix4[] = [];
        const colors: THREE.Color[] = [];

        const matrix = new THREE.Matrix4();

        for (let x = 0; x < width; x++) {
            for (let z = 0; z < height; z++) {
                const tileType = tileData[x]?.[z] || 'grass';

                // Position matrix (centered on grid)
                matrix.setPosition(
                    (x - width / 2) * tileSize + tileSize / 2,
                    0,
                    (z - height / 2) * tileSize + tileSize / 2
                );
                matrices.push(matrix.clone());

                // Color
                colors.push(new THREE.Color(TILE_COLORS[tileType]));
            }
        }

        return { count, matrices, colors };
    }, [width, height, tileSize, tileData]);

    // Apply matrices and colors to instanced mesh
    useMemo(() => {
        if (!meshRef.current) return;

        const mesh = meshRef.current;
        const colorArray = new Float32Array(count * 3);

        for (let i = 0; i < count; i++) {
            mesh.setMatrixAt(i, matrices[i]);
            colors[i].toArray(colorArray, i * 3);
        }

        mesh.instanceMatrix.needsUpdate = true;

        // Set instance colors
        mesh.instanceColor = new THREE.InstancedBufferAttribute(colorArray, 3);
    }, [count, matrices, colors]);

    return (
        <group>
            {/* Base terrain tiles */}
            <instancedMesh
                ref={meshRef}
                args={[undefined, undefined, count]}
                receiveShadow
                onClick={(e) => {
                    if (onTileClick) {
                        const point = e.point;
                        const x = Math.floor(point.x / tileSize + width / 2);
                        const z = Math.floor(point.z / tileSize + height / 2);
                        onTileClick(x, z);
                    }
                }}
                onPointerMove={(e) => {
                    if (onTileHover) {
                        const point = e.point;
                        const x = Math.floor(point.x / tileSize + width / 2);
                        const z = Math.floor(point.z / tileSize + height / 2);
                        if (
                            !hoveredTile.current ||
                            hoveredTile.current.x !== x ||
                            hoveredTile.current.z !== z
                        ) {
                            hoveredTile.current = { x, z };
                            onTileHover(x, z);
                        }
                    }
                }}
            >
                <boxGeometry args={[tileSize * 0.98, 0.2, tileSize * 0.98]} />
                <meshStandardMaterial vertexColors roughness={0.8} metalness={0.1} />
            </instancedMesh>

            {/* Grid lines for visual aid */}
            <GridLines width={width} height={height} tileSize={tileSize} />
        </group>
    );
}

// Grid lines overlay
function GridLines({
    width,
    height,
    tileSize,
}: {
    width: number;
    height: number;
    tileSize: number;
}) {
    const points = useMemo(() => {
        const lines: THREE.Vector3[] = [];

        // Vertical lines
        for (let x = 0; x <= width; x++) {
            const xPos = (x - width / 2) * tileSize;
            lines.push(new THREE.Vector3(xPos, 0.11, (-height / 2) * tileSize));
            lines.push(new THREE.Vector3(xPos, 0.11, (height / 2) * tileSize));
        }

        // Horizontal lines
        for (let z = 0; z <= height; z++) {
            const zPos = (z - height / 2) * tileSize;
            lines.push(new THREE.Vector3((-width / 2) * tileSize, 0.11, zPos));
            lines.push(new THREE.Vector3((width / 2) * tileSize, 0.11, zPos));
        }

        return lines;
    }, [width, height, tileSize]);

    return (
        <lineSegments>
            <bufferGeometry>
                <bufferAttribute
                    attach="attributes-position"
                    count={points.length}
                    array={new Float32Array(points.flatMap((p) => [p.x, p.y, p.z]))}
                    itemSize={3}
                />
            </bufferGeometry>
            <lineBasicMaterial color="#2d5a3d" opacity={0.3} transparent />
        </lineSegments>
    );
}
