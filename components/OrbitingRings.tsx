import React, { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { RingProps } from '../types';

const OrbitingRing: React.FC<RingProps> = ({ 
  radius, 
  tube, 
  color, 
  speed = 0.2, 
  rotationOffset = [0, 0, 0] 
}) => {
  const meshRef = useRef<THREE.Mesh>(null);

  useFrame((state) => {
    if (meshRef.current) {
      const time = state.clock.getElapsedTime();
      
      // Complex rotation
      meshRef.current.rotation.x = rotationOffset[0] + Math.sin(time * speed * 0.5) * 0.1;
      meshRef.current.rotation.y = rotationOffset[1] + time * speed;
      meshRef.current.rotation.z = rotationOffset[2] + Math.cos(time * speed * 0.3) * 0.1;
    }
  });

  return (
    <mesh ref={meshRef} rotation={new THREE.Euler(...rotationOffset)}>
      {/* TorusGeometry: radius, tube, radialSegments, tubularSegments */}
      <torusGeometry args={[radius, tube, 16, 100]} />
      <meshStandardMaterial 
        color={color} 
        emissive={color}
        emissiveIntensity={0.5}
        transparent 
        opacity={0.3} 
        wireframe={false}
        metalness={0.8}
        roughness={0.2}
      />
    </mesh>
  );
};

export default OrbitingRing;