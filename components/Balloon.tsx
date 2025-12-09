import React, { useRef, useMemo } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";

interface BalloonProps {
  position: [number, number, number];
  color: string;
  scale?: number;
  type?: "round" | "apple" | "banana" | "dog";
}

const Balloon: React.FC<BalloonProps> = ({
  position,
  color,
  scale = 1,
  type = "round",
}) => {
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

      {/* Balloon Body - Different shapes based on type */}
      {type === "round" && (
        <mesh
          position={[0, 0, 0]}
          scale={[1, 1.25, 1]}
          castShadow
          receiveShadow
        >
          <sphereGeometry args={[1, 32, 32]} />
          <meshStandardMaterial
            color={color}
            roughness={0.1}
            metalness={0.2}
            emissive={color}
            emissiveIntensity={0.1}
          />
        </mesh>
      )}

      {type === "apple" && (
        <group castShadow receiveShadow>
          {/* Apple body */}
          <mesh position={[0, 0.1, 0]} scale={[1, 1.1, 1]}>
            <sphereGeometry args={[1, 32, 32]} />
            <meshStandardMaterial
              color={color}
              roughness={0.1}
              metalness={0.2}
              emissive={color}
              emissiveIntensity={0.1}
            />
          </mesh>
          {/* Apple stem */}
          <mesh position={[0, 1.2, 0]} rotation={[0, 0, 0.2]}>
            <cylinderGeometry args={[0.05, 0.05, 0.3, 8]} />
            <meshStandardMaterial color="#8B4513" />
          </mesh>
          {/* Apple leaf */}
          <mesh position={[0.15, 1.3, 0]} rotation={[0, 0, -0.3]}>
            <sphereGeometry args={[0.15, 8, 8, 0, Math.PI]} />
            <meshStandardMaterial color="#90EE90" side={THREE.DoubleSide} />
          </mesh>
        </group>
      )}

      {type === "banana" && (
        <group castShadow receiveShadow>
          {/* Banana body - curved cylinder */}
          <mesh position={[0, 0, 0]} rotation={[0, 0, 0.3]}>
            <cylinderGeometry args={[0.6, 0.4, 2, 16]} />
            <meshStandardMaterial
              color={color}
              roughness={0.1}
              metalness={0.2}
              emissive={color}
              emissiveIntensity={0.1}
            />
          </mesh>
          {/* Banana tip */}
          <mesh position={[0, 1.1, 0]} rotation={[0, 0, 0.3]}>
            <coneGeometry args={[0.4, 0.3, 8]} />
            <meshStandardMaterial color="#8B6914" />
          </mesh>
        </group>
      )}

      {type === "dog" && (
        <group castShadow receiveShadow>
          {/* Dog head */}
          <mesh position={[0, 0.3, 0]} scale={[1.1, 1, 1]}>
            <sphereGeometry args={[0.8, 32, 32]} />
            <meshStandardMaterial
              color={color}
              roughness={0.1}
              metalness={0.2}
              emissive={color}
              emissiveIntensity={0.1}
            />
          </mesh>
          {/* Dog snout */}
          <mesh position={[0, 0, 0.7]} scale={[0.6, 0.5, 0.8]}>
            <sphereGeometry args={[0.4, 16, 16]} />
            <meshStandardMaterial color={color} />
          </mesh>
          {/* Dog ears */}
          <mesh position={[-0.6, 0.5, 0]} rotation={[0, 0, -0.5]}>
            <sphereGeometry args={[0.3, 16, 16, 0, Math.PI]} />
            <meshStandardMaterial color={color} side={THREE.DoubleSide} />
          </mesh>
          <mesh position={[0.6, 0.5, 0]} rotation={[0, 0, 0.5]}>
            <sphereGeometry args={[0.3, 16, 16, 0, Math.PI]} />
            <meshStandardMaterial color={color} side={THREE.DoubleSide} />
          </mesh>
          {/* Dog eyes */}
          <mesh position={[-0.3, 0.4, 0.6]}>
            <sphereGeometry args={[0.1, 8, 8]} />
            <meshStandardMaterial color="#000000" />
          </mesh>
          <mesh position={[0.3, 0.4, 0.6]}>
            <sphereGeometry args={[0.1, 8, 8]} />
            <meshStandardMaterial color="#000000" />
          </mesh>
        </group>
      )}
    </group>
  );
};

export default Balloon;
