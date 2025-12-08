import React, { useRef, useState, useMemo, useEffect } from "react";
import { useFrame } from "@react-three/fiber";
import { Text } from "@react-three/drei";
import * as THREE from "three";

interface PolaroidProps {
  position?: [number, number, number];
  rotation?: [number, number, number];
  scale?: number | [number, number, number];
  showMessage?: boolean;
  message?: string;
}

const Polaroid: React.FC<PolaroidProps> = ({
  position = [0, 0, 0],
  rotation = [0, 0, 0],
  scale = 1,
  showMessage = false,
  message = "Happy Birthday!",
}) => {
  const groupRef = useRef<THREE.Group>(null);
  const [hovered, setHovered] = useState(false);
  const [startSpin, setStartSpin] = useState(false);

  // Handle delay for spin animation
  useEffect(() => {
    if (showMessage) {
      // Wait 2 seconds after arriving before spinning
      const timer = setTimeout(() => {
        setStartSpin(true);
      }, 2000);
      return () => clearTimeout(timer);
    } else {
      setStartSpin(false);
    }
  }, [showMessage]);

  const baseScale = useMemo(() => {
    if (Array.isArray(scale)) {
      return new THREE.Vector3(scale[0], scale[1], scale[2]);
    }
    // Default or number
    const s = scale as number;
    return new THREE.Vector3(s, s, s);
  }, [scale]);

  // Initial values stored to lerp back if needed
  const initialPos = useMemo(() => new THREE.Vector3(...position), [position]);
  const initialRot = useMemo(() => new THREE.Euler(...rotation), [rotation]);

  useFrame((state) => {
    if (groupRef.current) {
      if (showMessage) {
        // --- MESSAGE MODE ---
        // Target Position: Lowered to 10 (was 12)
        // Z=30 puts it further away from camera than 36 (zoomed out)
        const targetPos = new THREE.Vector3(0, 10, 30);
        const targetScale = new THREE.Vector3(2.5, 2.5, 2.5);

        // Smooth move to screen with frame-rate independence
        const delta = state.clock.getDelta();
        groupRef.current.position.lerp(targetPos, 0.08 + delta * 5);
        groupRef.current.scale.lerp(targetScale, 0.08 + delta * 5);

        if (startSpin) {
          // --- SPIN PHASE ---
          // Smooth spin 180 degrees to show back (Message)
          const targetRot = new THREE.Euler(0, Math.PI, 0);

          groupRef.current.rotation.x = THREE.MathUtils.lerp(
            groupRef.current.rotation.x,
            targetRot.x,
            0.08 + delta * 5
          );
          groupRef.current.rotation.y = THREE.MathUtils.lerp(
            groupRef.current.rotation.y,
            targetRot.y,
            0.08 + delta * 5
          );
          groupRef.current.rotation.z = THREE.MathUtils.lerp(
            groupRef.current.rotation.z,
            targetRot.z,
            0.08 + delta * 5
          );
        } else {
          // --- ARRIVAL PHASE ---
          // Face the camera directly (Front/Photo side) before spinning
          // Default rotation [0,0,0] faces Z+ roughly
          const arrivalRot = new THREE.Euler(0, 0, 0);

          groupRef.current.rotation.x = THREE.MathUtils.lerp(
            groupRef.current.rotation.x,
            arrivalRot.x,
            0.08 + delta * 5
          );
          groupRef.current.rotation.y = THREE.MathUtils.lerp(
            groupRef.current.rotation.y,
            arrivalRot.y,
            0.08 + delta * 5
          );
          groupRef.current.rotation.z = THREE.MathUtils.lerp(
            groupRef.current.rotation.z,
            arrivalRot.z,
            0.08 + delta * 5
          );
        }
      } else {
        // --- NORMAL MODE ---
        // Create target scale based on prop and hover state
        const target = baseScale.clone();
        if (hovered) {
          target.multiplyScalar(1.05); // 5% grow on hover
        }

        // Smooth return to initial transforms on the cake
        const delta = state.clock.getDelta();
        groupRef.current.position.lerp(initialPos, 0.12 + delta * 6);

        groupRef.current.rotation.x = THREE.MathUtils.lerp(
          groupRef.current.rotation.x,
          initialRot.x,
          0.12 + delta * 6
        );
        groupRef.current.rotation.y = THREE.MathUtils.lerp(
          groupRef.current.rotation.y,
          initialRot.y,
          0.12 + delta * 6
        );
        groupRef.current.rotation.z = THREE.MathUtils.lerp(
          groupRef.current.rotation.z,
          initialRot.z,
          0.12 + delta * 6
        );

        groupRef.current.scale.lerp(target, 0.12 + delta * 6);
      }
    }
  });

  return (
    <group
      ref={groupRef}
      position={position}
      rotation={new THREE.Euler(...rotation)}
      onPointerOver={() => !showMessage && setHovered(true)}
      onPointerOut={() => !showMessage && setHovered(false)}
    >
      {/* Paper Frame */}
      {/* Origin is at bottom center to make leaning easier */}
      <mesh position={[0, 1.75, 0]} receiveShadow castShadow>
        <boxGeometry args={[3, 3.5, 0.05]} />
        <meshStandardMaterial color="#ffffff" roughness={0.8} metalness={0.0} />
      </mesh>

      {/* --- BACK SIDE (Message Board) --- */}
      {/* Positioned at -Z relative to center */}
      <group position={[0, 1.75, -0.03]} rotation={[0, Math.PI, 0]}>
        {/* Slightly different paper texture/color for back */}
        <mesh position={[0, 0, 0.01]}>
          <planeGeometry args={[2.8, 3.3]} />
          <meshStandardMaterial color="#f8f8f8" roughness={0.9} />
        </mesh>

        {/* The Message */}
        <Text
          position={[0, 0, 0.02]}
          fontSize={0.25}
          color="#333333"
          maxWidth={2.5}
          textAlign="center"
          anchorX="center"
          anchorY="middle"
        >
          {message}
        </Text>
      </group>

      {/* --- FRONT SIDE (Photo) --- */}
      {/* Photo Area (The Black Square) */}
      <mesh position={[0, 2, 0.03]}>
        <planeGeometry args={[2.5, 2.5]} />
        <meshBasicMaterial color="#1a1a2e" />
      </mesh>

      {/* Photo Content - A stylized star/space memory */}
      <group position={[0, 2, 0.04]}>
        {/* Central Star in photo */}
        <mesh position={[0, 0, 0]}>
          <circleGeometry args={[0.5, 32]} />
          <meshBasicMaterial color="#ffd700" />
        </mesh>
        {/* Tiny stars */}
        <mesh position={[0.8, 0.8, 0]}>
          <circleGeometry args={[0.05, 8]} />
          <meshBasicMaterial color="white" />
        </mesh>
        <mesh position={[-0.7, 0.6, 0]}>
          <circleGeometry args={[0.08, 8]} />
          <meshBasicMaterial color="white" />
        </mesh>
        <mesh position={[-0.5, -0.8, 0]}>
          <circleGeometry args={[0.04, 8]} />
          <meshBasicMaterial color="white" />
        </mesh>
      </group>

      {/* Optional: Marker Text Simulation at bottom */}
      <mesh position={[0.5, 0.35, 0.03]} rotation={[0, 0, -0.05]}>
        <planeGeometry args={[1.5, 0.1]} />
        <meshBasicMaterial color="#000000" opacity={0.5} transparent />
      </mesh>
    </group>
  );
};

export default Polaroid;
