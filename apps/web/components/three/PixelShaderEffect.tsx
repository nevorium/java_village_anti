'use client';

import { useRef, useMemo } from 'react';
import { extend, useFrame, useThree } from '@react-three/fiber';
import { Effects } from '@react-three/drei';
import * as THREE from 'three';
import { ShaderPass } from 'three/examples/jsm/postprocessing/ShaderPass';
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass';

// Pixelation shader
const PixelShader = {
    uniforms: {
        tDiffuse: { value: null },
        resolution: { value: new THREE.Vector2(256, 256) },
        pixelSize: { value: 4.0 },
    },
    vertexShader: `
    varying vec2 vUv;
    void main() {
      vUv = uv;
      gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    }
  `,
    fragmentShader: `
    uniform sampler2D tDiffuse;
    uniform vec2 resolution;
    uniform float pixelSize;
    varying vec2 vUv;
    
    void main() {
      vec2 dxy = pixelSize / resolution;
      vec2 coord = dxy * floor(vUv / dxy);
      gl_FragColor = texture2D(tDiffuse, coord);
    }
  `,
};

// Color quantization shader for retro palette effect
const ColorQuantizeShader = {
    uniforms: {
        tDiffuse: { value: null },
        colorLevels: { value: 8.0 }, // Number of color levels per channel
    },
    vertexShader: `
    varying vec2 vUv;
    void main() {
      vUv = uv;
      gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    }
  `,
    fragmentShader: `
    uniform sampler2D tDiffuse;
    uniform float colorLevels;
    varying vec2 vUv;
    
    void main() {
      vec4 color = texture2D(tDiffuse, vUv);
      
      // Quantize each color channel
      color.r = floor(color.r * colorLevels) / colorLevels;
      color.g = floor(color.g * colorLevels) / colorLevels;
      color.b = floor(color.b * colorLevels) / colorLevels;
      
      gl_FragColor = color;
    }
  `,
};

// Extend Three.js with custom passes
extend({ ShaderPass, RenderPass });

interface PixelShaderEffectProps {
    pixelSize?: number;
    colorLevels?: number;
    enabled?: boolean;
}

export default function PixelShaderEffect({
    pixelSize = 3,
    colorLevels = 16,
    enabled = true,
}: PixelShaderEffectProps) {
    const { size } = useThree();
    const pixelPassRef = useRef<ShaderPass>(null);
    const colorPassRef = useRef<ShaderPass>(null);

    // Update resolution when size changes
    useFrame(() => {
        if (pixelPassRef.current && enabled) {
            pixelPassRef.current.uniforms.resolution.value.set(size.width, size.height);
            pixelPassRef.current.uniforms.pixelSize.value = pixelSize;
        }
        if (colorPassRef.current && enabled) {
            colorPassRef.current.uniforms.colorLevels.value = colorLevels;
        }
    });

    if (!enabled) {
        return null;
    }

    return (
        <Effects disableGamma>
            <shaderPass
                ref={pixelPassRef}
                args={[PixelShader]}
                uniforms-resolution-value={[size.width, size.height]}
                uniforms-pixelSize-value={pixelSize}
            />
            <shaderPass
                ref={colorPassRef}
                args={[ColorQuantizeShader]}
                uniforms-colorLevels-value={colorLevels}
            />
        </Effects>
    );
}
