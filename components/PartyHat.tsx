import React, { useRef, useMemo } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";

interface PartyHatProps {
  position: [number, number, number];
  color?: string;
  scale?: number;
}

const PartyHat: React.FC<PartyHatProps> = ({
  position,
  color = "#FF6B6B",
  scale = 1,
}) => {
  const groupRef = useRef<THREE.Group>(null);
  const offset = useMemo(() => Math.random() * 100, []);

  // Very subtle animation - stays on table
  useFrame((state) => {
    if (groupRef.current) {
      const time = state.clock.elapsedTime + offset;
      // Minimal rotation only, no vertical movement to keep it on table
      groupRef.current.rotation.y = Math.sin(time * 0.3) * 0.05;
    }
  });

  return (
    <group ref={groupRef} position={position} scale={scale}>
      {/* Cone hat body */}
      <mesh castShadow receiveShadow rotation={[0, 0, 0]}>
        <coneGeometry args={[1.5, 4, 16]} />
        <meshStandardMaterial color={color} roughness={0.3} metalness={0.1} />
      </mesh>

      {/* Pom-pom on top */}
      <mesh position={[0, 2.2, 0]} castShadow>
        <sphereGeometry args={[0.3, 16, 16]} />
        <meshStandardMaterial color="#FFFFFF" roughness={0.2} metalness={0.2} />
      </mesh>

      {/* Decorative stripe - rotated 90 degrees */}
      <mesh position={[0, -0.3, 0]} rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[1, 0.15, 8, 16]} />
        <meshStandardMaterial color="#FFD700" roughness={0.2} metalness={0.3} />
      </mesh>

      {/* Bottom rim - rotated 90 degrees */}
      <mesh position={[0, -2, 0]} rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[1.5, 0.2, 8, 16]} />
        <meshStandardMaterial color="#FFFFFF" roughness={0.3} metalness={0.1} />
      </mesh>
    </group>
  );
};

export default PartyHat;
