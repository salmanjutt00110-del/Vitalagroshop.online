/* eslint-disable react/no-unknown-property */
import { Canvas } from '@react-three/fiber';
import { Suspense, useMemo } from 'react';
import { Float, Stars } from '@react-three/drei';
import * as THREE from 'three';

// Utility to generate a simple noise texture
function generateNoiseTexture() {
  const size = 256;
  const data = new Uint8Array(4 * size * size);
  for (let i = 0; i < size * size; i++) {
    const stride = i * 4;
    const v = Math.random() * 255;
    data[stride] = data[stride + 1] = data[stride + 2] = v;
    data[stride + 3] = 255;
  }
  const texture = new THREE.DataTexture(data, size, size, THREE.RGBAFormat);
  texture.needsUpdate = true;
  texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
  texture.minFilter = THREE.LinearFilter;
  return texture;
}

/**
 * AnimatedBackground renders a full‑screen three‑js canvas with:
 *   • dark‑green gradient mesh (via a rotating plane with a gradient shader)
 *   • subtle floating particles (Stars component)
 *   • a noise overlay (plane with noise texture)
 *   • gentle ambient glow (point lights)
 *   • minimal GPU load – static meshes reuse the same geometry/material.
 */
export default function AnimatedBackground({ theme = {} }) {
  const noiseTex = useMemo(() => {
    if (typeof window === 'undefined') return null;
    return generateNoiseTexture();
  }, []);

  if (typeof window === 'undefined') {
    // Prevent rendering during SSR / non‑browser environments
    // This avoids a blank white screen before the client hydrates.
    return null;
  }

  // Gradient material using a custom shader for smooth color shift.
  const GradientMaterial = () => {
    const frag = `
      uniform float time;
      void main() {
        // dark‑green to lighter hue over time
        vec3 color = mix(vec3(0.05, 0.13, 0.07), vec3(0.12, 0.30, 0.15), 0.5 + 0.5 * sin(time * 0.2));
        gl_FragColor = vec4(color, 0.9);
      }
    `;
    const vert = `
      void main() {
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
      }
    `;
    return (
      <mesh>
        <planeGeometry args={[20, 20]} />
        <shaderMaterial
          fragmentShader={frag}
          vertexShader={vert}
          uniforms={{ time: { value: performance.now() / 1000 } }}
          transparent
        />
      </mesh>
    );
  };

  return (
    <div className="absolute inset-0 -z-10 pointer-events-none">
      <Canvas camera={{ position: [0, 0, 5], fov: 75 }} gl={{ alpha: true }}>
        <ambientLight intensity={0.4} />
        <pointLight position={[0, 0, 2]} intensity={1.2} color={theme.glow || '#76c945'} />
        <Suspense fallback={null}>
          {/* Gradient Mesh */}
          <Float speed={0.2} rotationIntensity={0.1} floatIntensity={0.2}>
            <GradientMaterial />
          </Float>
          {/* Floating Particles */}
          <Stars radius={100} depth={50} count={2000} factor={4} saturation={0} fade speed={1} />
          {/* Noise overlay */}
          <mesh position={[0, 0, -0.1]}>
            <planeGeometry args={[20, 20]} />
            <meshBasicMaterial map={noiseTex} opacity={0.07} transparent depthWrite={false} />
          </mesh>
        </Suspense>
      </Canvas>
    </div>
  );
}
