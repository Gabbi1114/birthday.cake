import React from 'react';
import * as THREE from 'three';

interface RoseProps {
  position?: [number, number, number];
  scale?: number;
  color?: string;
}

const Rose: React.FC<RoseProps> = ({ position = [0, 0, 0], scale = 1, color = "#d4af37" }) => {
  return (
    <group position={position} scale={scale}>
      {/* Center Bud */}
      <mesh position={[0, 0.2, 0]}>
        <sphereGeometry args={[0.25, 16, 16]} />
        <meshStandardMaterial color={color} roughness={0.3} metalness={0.6} />
      </mesh>

      {/* Inner Petals */}
      {[0, 1, 2].map((i) => (
        <mesh key={`inner-${i}`} rotation={[0.5, (i / 3) * Math.PI * 2, 0]} position={[0, 0.2, 0]}>
          <sphereGeometry args={[0.25, 16, 16, 0, Math.PI * 2, 0, Math.PI / 2.5]} />
          <meshStandardMaterial color={color} side={THREE.DoubleSide} roughness={0.3} metalness={0.6} />
        </mesh>
      ))}

      {/* Outer Petals */}
      {[0, 1, 2, 3, 4].map((i) => (
        <mesh 
          key={`outer-${i}`} 
          rotation={[0.8, (i / 5) * Math.PI * 2 + 0.5, 0]} 
          position={[0, 0.1, 0]}
        >
          <sphereGeometry args={[0.35, 16, 16, 0, Math.PI * 2, 0, Math.PI / 3]} />
          <meshStandardMaterial color={color} side={THREE.DoubleSide} roughness={0.3} metalness={0.6} />
        </mesh>
      ))}
    </group>
  );
};

export default Rose;