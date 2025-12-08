import React, { useRef, useMemo, useState, useEffect } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";

interface CandleProps {
  position: [number, number, number];
  isLit?: boolean;
}

const SmokeParticle: React.FC<{
  startPos: [number, number, number];
  index: number;
}> = ({ startPos, index }) => {
  const meshRef = useRef<THREE.Mesh>(null);
  // Randomize speed and initial offset
  const speed = useMemo(() => 0.4 + Math.random() * 0.4, []);
  const offset = useMemo(() => Math.random() * 100, []);
  const initialX = useMemo(() => (Math.random() - 0.5) * 0.05, []);
  const initialZ = useMemo(() => (Math.random() - 0.5) * 0.05, []);

  useFrame((state) => {
    if (meshRef.current) {
      const time = state.clock.elapsedTime + offset;

      // Upward movement
      meshRef.current.position.y += speed * 0.01;

      // Wind/Turbulence effect
      meshRef.current.position.x =
        startPos[0] +
        initialX +
        Math.sin(time * 2 + index) * 0.02 * (meshRef.current.position.y * 2);
      meshRef.current.position.z =
        startPos[2] +
        initialZ +
        Math.cos(time * 1.5 + index) * 0.02 * (meshRef.current.position.y * 2);

      // Growth and Fade logic
      const life = meshRef.current.position.y - startPos[1];
      const maxLife = 1.5 + Math.random(); // Varied life span

      if (life > maxLife) {
        // Reset particle to base
        meshRef.current.position.y = startPos[1];
        meshRef.current.position.x = startPos[0];
        meshRef.current.position.z = startPos[2];
        meshRef.current.scale.setScalar(0.1);
        const mat = meshRef.current.material as THREE.MeshBasicMaterial;
        mat.opacity = 0;
      } else {
        // Animate
        const progress = life / maxLife;
        const mat = meshRef.current.material as THREE.MeshBasicMaterial;

        // Scale grows as it rises
        const targetScale = 0.2 + progress * 0.5;
        meshRef.current.scale.setScalar(targetScale);

        // Opacity fades in then out
        if (progress < 0.2) {
          mat.opacity = progress * 4; // Fast fade in
        } else {
          mat.opacity = 0.8 * (1 - progress); // Slow fade out
        }
      }
    }
  });

  return (
    <mesh
      ref={meshRef}
      position={[startPos[0], startPos[1], startPos[2]]}
      scale={[0.1, 0.1, 0.1]}
    >
      <sphereGeometry args={[0.2, 6, 6]} />
      <meshBasicMaterial
        color="#333333"
        transparent
        opacity={0.6}
        depthWrite={false}
      />
    </mesh>
  );
};

const Smoke: React.FC = () => {
  // Reduced particle count for better performance
  const particles = useMemo(() => Array.from({ length: 8 }), []);
  return (
    <group position={[0, 1.7, 0]}>
      {particles.map((_, i) => (
        <SmokeParticle key={i} index={i} startPos={[0, 0, 0]} />
      ))}
    </group>
  );
};

const Candle: React.FC<CandleProps> = ({ position, isLit = true }) => {
  const lightRef = useRef<THREE.PointLight>(null);
  const flameRef = useRef<THREE.Mesh>(null);
  const [showSmoke, setShowSmoke] = useState(false);

  useEffect(() => {
    if (!isLit) {
      setShowSmoke(true);
      const timer = setTimeout(() => {
        setShowSmoke(false);
      }, 5000);
      return () => clearTimeout(timer);
    } else {
      setShowSmoke(false);
    }
  }, [isLit]);

  useFrame((state) => {
    const time = state.clock.elapsedTime;

    // Handle Extinguishing Animation
    if (flameRef.current && lightRef.current) {
      if (!isLit) {
        // Shrink flame
        flameRef.current.scale.lerp(new THREE.Vector3(0, 0, 0), 0.1);
        // Dim light
        lightRef.current.intensity = THREE.MathUtils.lerp(
          lightRef.current.intensity,
          0,
          0.1
        );
      } else {
        // Active flicker
        const flicker =
          Math.sin(time * 10) * 0.1 +
          Math.cos(time * 23) * 0.1 +
          Math.sin(time * 45) * 0.05;

        // Target scale/intensity
        const targetScale = 1 + flicker * 0.2;
        const currentScale = flameRef.current.scale.x;
        const nextScale = THREE.MathUtils.lerp(currentScale, targetScale, 0.2);

        flameRef.current.scale.set(nextScale, nextScale, nextScale);
        lightRef.current.intensity = 3.0 + flicker * 1.0;

        // Jitter
        flameRef.current.position.x = Math.sin(time * 15) * 0.02;
        flameRef.current.position.z = Math.cos(time * 12) * 0.02;
      }
    }
  });

  return (
    <group position={position}>
      {/* Wax Body */}
      <mesh position={[0, 0.75, 0]}>
        <cylinderGeometry args={[0.25, 0.25, 1.5, 16]} />
        <meshStandardMaterial
          color="#ffffee"
          roughness={0.2}
          metalness={0.1}
          emissive="#ffffee"
          emissiveIntensity={0.1}
        />
      </mesh>

      {/* Wick */}
      <mesh position={[0, 1.5, 0]}>
        <cylinderGeometry args={[0.03, 0.03, 0.3, 8]} />
        <meshStandardMaterial color="#1a1a1a" />
      </mesh>

      {/* Flame Group - Moved up to prevent clipping due to larger size */}
      <group position={[0, 1.85, 0]}>
        {/* Core Flame - Significantly larger */}
        <mesh ref={flameRef}>
          <sphereGeometry args={[0.28, 32, 32]} />
          <meshBasicMaterial color="#ff5500" toneMapped={false} />
        </mesh>

        {/* Outer Glow (Fake Halo) - Only show if lit roughly */}
        {isLit && (
          <mesh scale={[2.5, 2.5, 2.5]}>
            <sphereGeometry args={[0.15, 32, 32]} />
            <meshBasicMaterial
              color="#ffaa00"
              transparent
              opacity={0.2}
              toneMapped={false}
            />
          </mesh>
        )}

        {/* Dynamic Light Source - Brighter and larger range */}
        <pointLight
          ref={lightRef}
          color="#ffaa00"
          distance={25}
          decay={1.5}
          intensity={3.0}
          castShadow
        />
      </group>

      {/* Smoke Effect when extinguished */}
      {showSmoke && <Smoke />}
    </group>
  );
};

export default Candle;
