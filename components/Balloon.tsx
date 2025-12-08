import React, { useRef, useMemo } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";

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
      const delta = state.clock.getDelta();

      // Smooth bobbing motion (Y-axis) with frame-rate independence
      const targetY = position[1] + Math.sin(time * speed) * 0.5;
      groupRef.current.position.y = THREE.MathUtils.lerp(
        groupRef.current.position.y,
        targetY,
        0.1 + delta * 10
      );

      // Smooth swaying rotation
      const targetRotZ = Math.sin(time * speed * 0.5) * range;
      const targetRotX = Math.cos(time * speed * 0.3) * range;
      groupRef.current.rotation.z = THREE.MathUtils.lerp(
        groupRef.current.rotation.z,
        targetRotZ,
        0.1 + delta * 10
      );
      groupRef.current.rotation.x = THREE.MathUtils.lerp(
        groupRef.current.rotation.x,
        targetRotX,
        0.1 + delta * 10
      );
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
        <sphereGeometry args={[1, 16, 16]} />
        <meshStandardMaterial color={color} roughness={0.2} metalness={0.3} />
      </mesh>
    </group>
  );
};

export default Balloon;
