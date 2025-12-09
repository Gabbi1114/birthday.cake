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

// Organic realistic flame component
const Flame = React.forwardRef<THREE.Group, { isLit: boolean }>(
  ({ isLit }, ref) => {
    const groupRef = useRef<THREE.Group>(null);
    const lightRef = useRef<THREE.PointLight>(null);

    // Create multiple flame tongues for organic look
    const flameTongues = useMemo(() => {
      return Array.from({ length: 5 }).map((_, i) => ({
        offset: Math.random() * Math.PI * 2,
        speed: 0.8 + Math.random() * 0.4,
        radius: 0.08 + Math.random() * 0.05,
        height: 0.4 + Math.random() * 0.3,
        angle: (i / 5) * Math.PI * 2,
      }));
    }, []);

    useFrame((state) => {
      if (!groupRef.current) return;
      const time = state.clock.elapsedTime;

      // Animate each flame tongue organically
      flameTongues.forEach((tongue, i) => {
        const tongueMesh = groupRef.current?.children[i] as THREE.Mesh;
        if (tongueMesh) {
          // Organic swaying motion
          const swayX = Math.sin(time * tongue.speed + tongue.offset) * 0.15;
          const swayZ =
            Math.cos(time * tongue.speed * 0.7 + tongue.offset) * 0.15;
          const heightVariation =
            Math.sin(time * tongue.speed * 1.3 + tongue.offset) * 0.1;

          tongueMesh.position.x = Math.cos(tongue.angle) * 0.1 + swayX;
          tongueMesh.position.z = Math.sin(tongue.angle) * 0.1 + swayZ;
          tongueMesh.position.y = tongue.height * 0.5 + heightVariation;

          // Organic scale variation
          const scaleVariation =
            1 + Math.sin(time * tongue.speed * 2 + tongue.offset) * 0.2;
          tongueMesh.scale.setScalar(scaleVariation);
        }
      });

      // Animate light flickering
      if (lightRef.current) {
        const delta = state.clock.getDelta();
        const flicker =
          Math.sin(time * 10) * 0.1 +
          Math.cos(time * 23) * 0.1 +
          Math.sin(time * 45) * 0.05;
        lightRef.current.intensity = THREE.MathUtils.lerp(
          lightRef.current.intensity,
          4.0 + flicker * 1.2,
          0.3 + delta * 10
        );
      }
    });

    React.useImperativeHandle(ref, () => groupRef.current!);

    if (!isLit) return null;

    return (
      <group ref={groupRef} position={[0, 1.9, 0]}>
        {/* Multiple organic flame tongues */}
        {flameTongues.map((tongue, i) => (
          <mesh
            key={i}
            position={[
              Math.cos(tongue.angle) * 0.1,
              tongue.height * 0.5,
              Math.sin(tongue.angle) * 0.1,
            ]}
            scale={[1, 1, 1]}
          >
            {/* Organic flame shape using sphere with custom scaling */}
            <sphereGeometry
              args={[tongue.radius, 12, 12, 0, Math.PI * 2, 0, Math.PI]}
            />
            <meshBasicMaterial
              color={i < 2 ? "#ffaa00" : i < 4 ? "#ff8800" : "#ff5500"}
              transparent
              opacity={0.9}
              toneMapped={false}
            />
          </mesh>
        ))}

        {/* Central core - brightest yellow */}
        <mesh position={[0, 0.25, 0]}>
          <sphereGeometry args={[0.12, 12, 12]} />
          <meshBasicMaterial
            color="#ffdd00"
            transparent
            opacity={0.95}
            toneMapped={false}
          />
        </mesh>

        {/* Outer glow - soft halo */}
        <mesh position={[0, 0.3, 0]}>
          <sphereGeometry args={[0.3, 16, 16]} />
          <meshBasicMaterial
            color="#ffaa00"
            transparent
            opacity={0.2}
            toneMapped={false}
          />
        </mesh>

        {/* Light source */}
        <pointLight
          ref={lightRef}
          color="#ffaa00"
          distance={30}
          decay={1.5}
          intensity={4.0}
          castShadow
        />
      </group>
    );
  }
);

Flame.displayName = "Flame";

const Candle: React.FC<CandleProps> = ({ position, isLit = true }) => {
  const flameGroupRef = useRef<THREE.Group>(null);
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
    const delta = state.clock.getDelta();

    // Handle Extinguishing Animation
    if (flameGroupRef.current) {
      if (!isLit) {
        // Smooth shrink flame
        flameGroupRef.current.scale.lerp(
          new THREE.Vector3(0, 0, 0),
          0.15 + delta * 5
        );
      } else {
        // Restore scale when lit
        const targetScale = 1;
        const currentScale = flameGroupRef.current.scale.x;
        const nextScale = THREE.MathUtils.lerp(
          currentScale,
          targetScale,
          0.3 + delta * 10
        );
        flameGroupRef.current.scale.set(nextScale, nextScale, nextScale);
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

      {/* Flame Group - Organic realistic fire */}
      <Flame ref={flameGroupRef} isLit={isLit} />

      {/* Smoke Effect when extinguished */}
      {showSmoke && <Smoke />}
    </group>
  );
};

export default Candle;
