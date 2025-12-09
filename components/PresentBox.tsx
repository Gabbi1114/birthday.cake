import React, { useRef, useMemo } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";

interface PresentBoxProps {
  position: [number, number, number];
  color?: string;
  ribbonColor?: string;
  scale?: number;
}

const PresentBox: React.FC<PresentBoxProps> = ({
  position,
  color = "#FF6B6B",
  ribbonColor = "#FFD700",
  scale = 1,
}) => {
  const groupRef = useRef<THREE.Group>(null);
  const offset = useMemo(() => Math.random() * 100, []);

  // Gentle floating animation
  useFrame((state) => {
    if (groupRef.current) {
      const time = state.clock.elapsedTime + offset;
      groupRef.current.position.y = position[1] + Math.sin(time * 0.5) * 0.1;
      groupRef.current.rotation.y = Math.sin(time * 0.3) * 0.05;
    }
  });

  return (
    <group ref={groupRef} position={position} scale={scale}>
      {/* Main Box */}
      <mesh castShadow receiveShadow>
        <boxGeometry args={[3, 3, 3]} />
        <meshStandardMaterial color={color} roughness={0.3} metalness={0.1} />
      </mesh>

      {/* Ribbon - Horizontal */}
      <mesh position={[0, 0, 1.51]} castShadow>
        <boxGeometry args={[3.2, 0.3, 0.1]} />
        <meshStandardMaterial
          color={ribbonColor}
          roughness={0.2}
          metalness={0.3}
        />
      </mesh>

      {/* Ribbon - Vertical */}
      <mesh position={[0, 0, 1.51]} rotation={[0, Math.PI / 2, 0]} castShadow>
        <boxGeometry args={[3.2, 0.3, 0.1]} />
        <meshStandardMaterial
          color={ribbonColor}
          roughness={0.2}
          metalness={0.3}
        />
      </mesh>

      {/* Bow on top */}
      <group position={[0, 1.6, 0]}>
        {/* Bow center */}
        <mesh>
          <boxGeometry args={[0.4, 0.4, 0.4]} />
          <meshStandardMaterial
            color={ribbonColor}
            roughness={0.2}
            metalness={0.3}
          />
        </mesh>
        {/* Bow loops */}
        <mesh position={[-0.5, 0, 0]} rotation={[0, 0, 0.3]}>
          <boxGeometry args={[0.6, 0.2, 0.2]} />
          <meshStandardMaterial
            color={ribbonColor}
            roughness={0.2}
            metalness={0.3}
          />
        </mesh>
        <mesh position={[0.5, 0, 0]} rotation={[0, 0, -0.3]}>
          <boxGeometry args={[0.6, 0.2, 0.2]} />
          <meshStandardMaterial
            color={ribbonColor}
            roughness={0.2}
            metalness={0.3}
          />
        </mesh>
      </group>
    </group>
  );
};

export default PresentBox;
