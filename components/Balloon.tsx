import React, { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

interface BalloonProps {
  position: [number, number, number];
  color: string;
  scale?: number;
}

const Balloon: React.FC<BalloonProps> = ({ position, color, scale = 1 }) => {
  const groupRef = useRef<THREE.Group>(null);
  const offset = useMemo(() => Math.random() * 100, []);
  
  // Random sway parameters
  const speed = useMemo(() => 0.5 + Math.random() * 0.5, []);
  const range = useMemo(() => 0.05 + Math.random() * 0.05, []);

  useFrame((state) => {
    if (groupRef.current) {
      const time = state.clock.elapsedTime + offset;
      
      // Bobbing motion (Y-axis)
      groupRef.current.position.y = position[1] + Math.sin(time * speed) * 0.5;
      
      // Gentle swaying rotation
      groupRef.current.rotation.z = Math.sin(time * speed * 0.5) * range;
      groupRef.current.rotation.x = Math.cos(time * speed * 0.3) * range;
    }
  });

  return (
    <group ref={groupRef} position={position} scale={scale}>
      {/* String */}
      <mesh position={[0, -4, 0]}>
        <cylinderGeometry args={[0.01, 0.01, 6, 8]} />
        <meshStandardMaterial color="#dddddd" transparent opacity={0.6} />
      </mesh>

      {/* Balloon Knot */}
      <mesh position={[0, -1.15, 0]}>
        <coneGeometry args={[0.2, 0.2, 16]} />
        <meshStandardMaterial color={color} roughness={0.2} metalness={0.4} />
      </mesh>

      {/* Balloon Body (Oval Sphere) */}
      <mesh position={[0, 0, 0]} scale={[1, 1.25, 1]} castShadow receiveShadow>
        <sphereGeometry args={[1, 32, 32]} />
        <meshPhysicalMaterial 
            color={color} 
            roughness={0.1} 
            metalness={0.2}
            clearcoat={1.0}
            clearcoatRoughness={0.1}
        />
      </mesh>
    </group>
  );
};

export default Balloon;