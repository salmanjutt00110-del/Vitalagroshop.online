/* eslint-disable react/no-unknown-property */
import React, { useRef, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import useMousePosition from '@/hooks/useMousePosition';
import * as THREE from 'three';

function FloatingLeaf({ index, mouse }) {
  const meshRef = useRef(null);

  // Randomize positions and movement parameters
  const data = useMemo(() => ({
    x: (Math.random() - 0.5) * 12,
    y: (Math.random() - 0.5) * 8,
    z: (Math.random() - 0.5) * 6 - 2,
    speedX: (Math.random() - 0.5) * 0.004,
    speedY: (Math.random() - 0.5) * 0.004,
    speedZ: (Math.random() - 0.5) * 0.002,
    rotX: Math.random() * Math.PI,
    rotY: Math.random() * Math.PI,
    rotZ: Math.random() * Math.PI,
    rotSpeed: (Math.random() - 0.5) * 0.008,
    scale: 0.12 + Math.random() * 0.14,
  }), []);

  // Programmatic leaf geometry to avoid loading local/remote GLTF assets
  const leafGeometry = useMemo(() => {
    const shape = new THREE.Shape();
    shape.moveTo(0, 0.5);
    shape.quadraticCurveTo(0.3, 0.2, 0.05, -0.5);
    shape.quadraticCurveTo(0, -0.6, -0.05, -0.5);
    shape.quadraticCurveTo(-0.3, 0.2, 0, 0.5);
    
    return new THREE.ExtrudeGeometry(shape, {
      depth: 0.015,
      bevelEnabled: true,
      bevelSegments: 2,
      steps: 1,
      bevelSize: 0.008,
      bevelThickness: 0.008
    });
  }, []);

  useFrame(() => {
    if (!meshRef.current) return;

    // Slowly drift position
    data.x += data.speedX;
    data.y += data.speedY;
    data.z += data.speedZ;

    // Rotate leaf
    meshRef.current.rotation.x += data.rotSpeed;
    meshRef.current.rotation.y += data.rotSpeed * 0.4;

    // Bounds checking
    if (data.x > 7) data.x = -7;
    if (data.x < -7) data.x = 7;
    if (data.y > 5) data.y = -5;
    if (data.y < -5) data.y = 5;
    if (data.z > 1) data.z = -5;
    if (data.z < -5) data.z = 1;

    // Lerp towards target position + mouse offset for interactive depth
    const targetX = data.x + mouse.normalizedX * 1.8;
    const targetY = data.y - mouse.normalizedY * 1.8;

    meshRef.current.position.x += (targetX - meshRef.current.position.x) * 0.05;
    meshRef.current.position.y += (targetY - meshRef.current.position.y) * 0.05;
    meshRef.current.position.z += (data.z - meshRef.current.position.z) * 0.05;
  });

  return (
    <mesh
      ref={meshRef}
      geometry={leafGeometry}
      position={[data.x, data.y, data.z]}
      rotation={[data.rotX, data.rotY, data.rotZ]}
      scale={data.scale}
    >
      <meshStandardMaterial
        color="#76C945"
        roughness={0.5}
        metalness={0.15}
        side={THREE.DoubleSide}
      />
    </mesh>
  );
}

function MouseLight({ mouse }) {
  const lightRef = useRef(null);

  useFrame(() => {
    if (!lightRef.current) return;
    const targetX = mouse.normalizedX * 8;
    const targetY = -mouse.normalizedY * 6;
    lightRef.current.position.x += (targetX - lightRef.current.position.x) * 0.1;
    lightRef.current.position.y += (targetY - lightRef.current.position.y) * 0.1;
  });

  return <pointLight ref={lightRef} intensity={1.6} distance={14} color="#76C945" />;
}

export default function HeroCanvas() {
  const mouse = useMousePosition();
  const [isMobile, setIsMobile] = React.useState(false);

  React.useEffect(() => {
    const mediaQuery = window.matchMedia('(max-width: 768px)');
    setIsMobile(mediaQuery.matches);
    const handler = (e) => setIsMobile(e.matches);
    mediaQuery.addEventListener('change', handler);
    return () => mediaQuery.removeEventListener('change', handler);
  }, []);

  // Disable WebGL canvas on mobile sizes for optimal frame performance
  if (isMobile) return null;

  return (
    <div className="absolute inset-0 z-1 pointer-events-none">
      <Canvas
        camera={{ position: [0, 0, 5], fov: 60 }}
        dpr={[1, 1.5]}
        gl={{ antialias: true, alpha: true }}
      >
        <ambientLight intensity={0.55} />
        <directionalLight position={[3, 5, 2]} intensity={1.3} color="#ffffff" />
        <MouseLight mouse={mouse} />
        {[...Array(20)].map((_, i) => (
          <FloatingLeaf key={i} index={i} mouse={mouse} />
        ))}
        <fog attach="fog" near={5} far={9} color="#0A2E1F" />
      </Canvas>
    </div>
  );
}
