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
  color = "#DC143C", // Bright red like in the image
  ribbonColor = "#FFFFFF", // White ribbon
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
      {/* Main Box - Red */}
      <mesh castShadow receiveShadow>
        <boxGeometry args={[4, 4, 4]} />
        <meshStandardMaterial color={color} roughness={0.4} metalness={0.05} />
      </mesh>

      {/* Ribbon - Horizontal (wraps around front/back) */}
      <mesh position={[0, 0, 2.01]} castShadow>
        <boxGeometry args={[4.2, 0.4, 0.1]} />
        <meshStandardMaterial
          color={ribbonColor}
          roughness={0.3}
          metalness={0.1}
        />
      </mesh>
      <mesh position={[0, 0, -2.01]} castShadow>
        <boxGeometry args={[4.2, 0.4, 0.1]} />
        <meshStandardMaterial
          color={ribbonColor}
          roughness={0.3}
          metalness={0.1}
        />
      </mesh>

      {/* Ribbon - Vertical (wraps around left/right) */}
      <mesh position={[2.01, 0, 0]} rotation={[0, Math.PI / 2, 0]} castShadow>
        <boxGeometry args={[4.2, 0.4, 0.1]} />
        <meshStandardMaterial
          color={ribbonColor}
          roughness={0.3}
          metalness={0.1}
        />
      </mesh>
      <mesh position={[-2.01, 0, 0]} rotation={[0, Math.PI / 2, 0]} castShadow>
        <boxGeometry args={[4.2, 0.4, 0.1]} />
        <meshStandardMaterial
          color={ribbonColor}
          roughness={0.3}
          metalness={0.1}
        />
      </mesh>

      {/* Bow on top - more detailed */}
      <group position={[0, 2.2, 0]}>
        {/* Bow center knot */}
        <mesh>
          <boxGeometry args={[0.6, 0.6, 0.6]} />
          <meshStandardMaterial
            color={ribbonColor}
            roughness={0.3}
            metalness={0.1}
          />
        </mesh>
        {/* Bow left loop */}
        <mesh position={[-0.8, 0, 0]} rotation={[0, 0, 0.4]}>
          <boxGeometry args={[0.8, 0.3, 0.3]} />
          <meshStandardMaterial
            color={ribbonColor}
            roughness={0.3}
            metalness={0.1}
          />
        </mesh>
        {/* Bow right loop */}
        <mesh position={[0.8, 0, 0]} rotation={[0, 0, -0.4]}>
          <boxGeometry args={[0.8, 0.3, 0.3]} />
          <meshStandardMaterial
            color={ribbonColor}
            roughness={0.3}
            metalness={0.1}
          />
        </mesh>
        {/* Bow left tail */}
        <mesh position={[-0.5, -0.6, 0]}>
          <boxGeometry args={[0.3, 0.6, 0.2]} />
          <meshStandardMaterial
            color={ribbonColor}
            roughness={0.3}
            metalness={0.1}
          />
        </mesh>
        {/* Bow right tail */}
        <mesh position={[0.5, -0.6, 0]}>
          <boxGeometry args={[0.3, 0.6, 0.2]} />
          <meshStandardMaterial
            color={ribbonColor}
            roughness={0.3}
            metalness={0.1}
          />
        </mesh>
      </group>
    </group>
  );
};

export default PresentBox;
