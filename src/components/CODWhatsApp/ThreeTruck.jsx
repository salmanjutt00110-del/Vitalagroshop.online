/* eslint-disable react/no-unknown-property */
import React, { useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Sparkles } from '@react-three/drei';

function TruckModel({ progress }) {
  const truckRef = useRef();
  const frontWheelRef = useRef();
  const backWheelRef = useRef();
  const headlightBeamRef1 = useRef();
  const headlightBeamRef2 = useRef();

  useFrame((state) => {
    const time = state.clock.getElapsedTime();

    // 1. Suspension Movement (Engine vibration & road bumpiness)
    if (truckRef.current) {
      truckRef.current.position.y = Math.sin(time * 24) * 0.04 + Math.cos(time * 12) * 0.015;
      truckRef.current.rotation.z = Math.sin(time * 24) * 0.005; // tiny tilt
    }

    // 2. Wheel Rotations (Spin faster as time moves)
    const wheelRot = -time * 15;
    if (frontWheelRef.current) frontWheelRef.current.rotation.x = wheelRot;
    if (backWheelRef.current) backWheelRef.current.rotation.x = wheelRot;

    // 3. Headlight spotlight cones pulse slightly
    if (headlightBeamRef1.current) {
      headlightBeamRef1.current.scale.x = 1 + Math.sin(time * 30) * 0.05;
    }
    if (headlightBeamRef2.current) {
      headlightBeamRef2.current.scale.x = 1 + Math.sin(time * 30) * 0.05;
    }
  });

  return (
    <group ref={truckRef} position={[0, -0.2, 0]} rotation={[0, -Math.PI / 2, 0]}>
      {/* 1. Main Trailer Cargo Box */}
      <mesh position={[0, 0.75, -0.6]} castShadow receiveShadow>
        <boxGeometry args={[1.6, 1.1, 2.0]} />
        <meshStandardMaterial 
          color="#5cb85c" 
          roughness={0.2}
          metalness={0.1}
        />
      </mesh>

      {/* Brand logo decal or visual stripe on trailer */}
      <mesh position={[0.81, 0.75, -0.6]}>
        <boxGeometry args={[0.01, 0.3, 1.4]} />
        <meshBasicMaterial color="#ffffff" opacity={0.9} transparent />
      </mesh>

      {/* 2. Cab (Front of the truck) */}
      <mesh position={[0, 0.55, 0.7]} castShadow receiveShadow>
        <boxGeometry args={[1.5, 0.9, 0.8]} />
        <meshStandardMaterial color="#3d8c3d" roughness={0.3} metalness={0.2} />
      </mesh>

      {/* Nose (Engine Hood) */}
      <mesh position={[0, 0.35, 1.3]} castShadow>
        <boxGeometry args={[1.4, 0.5, 0.4]} />
        <meshStandardMaterial color="#2d6a2d" roughness={0.3} />
      </mesh>

      {/* Windshield */}
      <mesh position={[0, 0.75, 0.95]} rotation={[-0.3, 0, 0]}>
        <boxGeometry args={[1.3, 0.4, 0.02]} />
        <meshPhysicalMaterial 
          color="#a5f3fc" 
          transparent 
          opacity={0.6} 
          roughness={0.1} 
          transmission={0.9} 
          thickness={0.5} 
        />
      </mesh>

      {/* Grill & Lights */}
      <mesh position={[0, 0.35, 1.51]}>
        <boxGeometry args={[1.1, 0.25, 0.01]} />
        <meshStandardMaterial color="#1f2937" roughness={0.8} />
      </mesh>

      {/* Headlights (Mesh glow spheres) */}
      <mesh position={[-0.45, 0.35, 1.52]}>
        <sphereGeometry args={[0.12, 16, 16]} />
        <meshBasicMaterial color="#fffae6" />
      </mesh>
      <mesh position={[0.45, 0.35, 1.52]}>
        <sphereGeometry args={[0.12, 16, 16]} />
        <meshBasicMaterial color="#fffae6" />
      </mesh>

      {/* Conic Headlight Glow Beams (Spotlight cones) */}
      <mesh ref={headlightBeamRef1} position={[-0.45, 0.35, 2.5]} rotation={[Math.PI / 2, 0, 0]}>
        <cylinderGeometry args={[0.05, 0.6, 2.0, 16, 1, true]} />
        <meshBasicMaterial 
          color="#fffae6" 
          transparent 
          opacity={0.15} 
          depthWrite={false}
        />
      </mesh>
      <mesh ref={headlightBeamRef2} position={[0.45, 0.35, 2.5]} rotation={[Math.PI / 2, 0, 0]}>
        <cylinderGeometry args={[0.05, 0.6, 2.0, 16, 1, true]} />
        <meshBasicMaterial 
          color="#fffae6" 
          transparent 
          opacity={0.15} 
          depthWrite={false}
        />
      </mesh>

      {/* 3. Chassis (Underbelly frame) */}
      <mesh position={[0, 0.15, 0]}>
        <boxGeometry args={[1.3, 0.15, 3.2]} />
        <meshStandardMaterial color="#111827" roughness={0.9} />
      </mesh>

      {/* Rear bumper / license plate holder */}
      <mesh position={[0, 0.2, -1.61]}>
        <boxGeometry args={[1.4, 0.15, 0.02]} />
        <meshStandardMaterial color="#374151" />
      </mesh>

      {/* Exhaust pipe */}
      <mesh position={[-0.55, 0.15, -1.65]} rotation={[Math.PI / 2, 0, 0]}>
        <cylinderGeometry args={[0.04, 0.04, 0.3]} />
        <meshStandardMaterial color="#9ca3af" metalness={0.9} roughness={0.1} />
      </mesh>

      {/* 4. Wheels */}
      {/* Front Wheels Axis */}
      <group position={[0, 0.15, 0.8]} ref={frontWheelRef}>
        {/* Left Wheel */}
        <mesh position={[-0.75, 0, 0]} rotation={[0, 0, Math.PI / 2]} castShadow>
          <cylinderGeometry args={[0.3, 0.3, 0.22, 24]} />
          <meshStandardMaterial color="#111827" roughness={0.9} />
        </mesh>
        {/* Left Rim */}
        <mesh position={[-0.87, 0, 0]} rotation={[0, 0, Math.PI / 2]}>
          <cylinderGeometry args={[0.16, 0.16, 0.02, 12]} />
          <meshStandardMaterial color="#d1d5db" metalness={0.8} roughness={0.2} />
        </mesh>

        {/* Right Wheel */}
        <mesh position={[0.75, 0, 0]} rotation={[0, 0, Math.PI / 2]} castShadow>
          <cylinderGeometry args={[0.3, 0.3, 0.22, 24]} />
          <meshStandardMaterial color="#111827" roughness={0.9} />
        </mesh>
        {/* Right Rim */}
        <mesh position={[0.87, 0, 0]} rotation={[0, 0, Math.PI / 2]}>
          <cylinderGeometry args={[0.16, 0.16, 0.02, 12]} />
          <meshStandardMaterial color="#d1d5db" metalness={0.8} roughness={0.2} />
        </mesh>
      </group>

      {/* Back Wheels Axis */}
      <group position={[0, 0.15, -0.8]} ref={backWheelRef}>
        {/* Left Wheel */}
        <mesh position={[-0.75, 0, 0]} rotation={[0, 0, Math.PI / 2]} castShadow>
          <cylinderGeometry args={[0.3, 0.3, 0.22, 24]} />
          <meshStandardMaterial color="#111827" roughness={0.9} />
        </mesh>
        {/* Left Rim */}
        <mesh position={[-0.87, 0, 0]} rotation={[0, 0, Math.PI / 2]}>
          <cylinderGeometry args={[0.16, 0.16, 0.02, 12]} />
          <meshStandardMaterial color="#d1d5db" metalness={0.8} roughness={0.2} />
        </mesh>

        {/* Right Wheel */}
        <mesh position={[0.75, 0, 0]} rotation={[0, 0, Math.PI / 2]} castShadow>
          <cylinderGeometry args={[0.3, 0.3, 0.22, 24]} />
          <meshStandardMaterial color="#111827" roughness={0.9} />
        </mesh>
        {/* Right Rim */}
        <mesh position={[0.87, 0, 0]} rotation={[0, 0, Math.PI / 2]}>
          <cylinderGeometry args={[0.16, 0.16, 0.02, 12]} />
          <meshStandardMaterial color="#d1d5db" metalness={0.8} roughness={0.2} />
        </mesh>
      </group>
    </group>
  );
}

export default function ThreeTruck({ progress = 0 }) {
  return (
    <div className="w-full h-full pointer-events-none relative overflow-visible z-10">
      <Canvas
        shadows
        gl={{ antialias: true, alpha: true }}
        camera={{ position: [2.5, 1.4, 3.5], fov: 32 }}
        className="w-full h-full bg-transparent"
        style={{ pointerEvents: 'none' }}
      >
        {/* Lights configuration */}
        <ambientLight intensity={1.2} />
        <directionalLight 
          position={[5, 10, 5]} 
          intensity={1.5} 
          castShadow 
          shadow-mapSize={[512, 512]}
        />
        <pointLight position={[-3, 5, -2]} intensity={0.5} />
        
        {/* Highlight details spotlight */}
        <spotLight 
          position={[0, 4, 3]} 
          angle={0.6} 
          penumbra={0.5} 
          intensity={1.0} 
          color="#8AD65A" 
        />

        {/* Dynamic Truck */}
        <TruckModel progress={progress} />

        {/* Exhaust & Tire Dust trails */}
        <Sparkles
          count={24}
          scale={[1.5, 0.5, 3]}
          size={2}
          speed={1.5}
          color="#76C945"
          position={[0, -0.3, -0.8]}
        />
      </Canvas>
    </div>
  );
}
