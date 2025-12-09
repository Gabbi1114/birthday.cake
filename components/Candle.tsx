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

// Realistic single candle flame component
const Flame = React.forwardRef<THREE.Group, { isLit: boolean }>(
  ({ isLit }, ref) => {
    const groupRef = useRef<THREE.Group>(null);
    const outerFlameRef = useRef<THREE.Mesh>(null);
    const innerFlameRef = useRef<THREE.Mesh>(null);
    const coreRef = useRef<THREE.Mesh>(null);
    const lightRef = useRef<THREE.PointLight>(null);

    useFrame((state) => {
      if (!groupRef.current) return;
      const time = state.clock.elapsedTime;
      const delta = state.clock.getDelta();

      // Energetic, dynamic flickering motion - more aggressive like real fire
      const swayX = Math.sin(time * 15) * 0.08 + Math.cos(time * 23) * 0.04;
      const swayZ = Math.cos(time * 12) * 0.08 + Math.sin(time * 19) * 0.04;
      const heightVariation =
        Math.sin(time * 18) * 0.1 + Math.cos(time * 25) * 0.05;

      if (groupRef.current) {
        groupRef.current.position.x = swayX;
        groupRef.current.position.z = swayZ;
        groupRef.current.position.y = heightVariation;
      }

      // More aggressive flickering scale variation - fire is very dynamic
      const flicker1 = Math.sin(time * 15) * 0.15;
      const flicker2 = Math.cos(time * 28) * 0.1;
      const flicker3 = Math.sin(time * 42) * 0.08;
      const flicker4 = Math.cos(time * 35) * 0.05;
      const scaleVariation = 1 + flicker1 + flicker2 + flicker3 + flicker4;

      // Fast, responsive scaling for energetic fire effect
      if (outerFlameRef.current) {
        const currentScale = outerFlameRef.current.scale.y;
        const targetScale = scaleVariation;
        const nextScale = THREE.MathUtils.lerp(
          currentScale,
          targetScale,
          0.6 + delta * 15
        );
        outerFlameRef.current.scale.y = nextScale;
        outerFlameRef.current.scale.x = nextScale * 0.85;
        outerFlameRef.current.scale.z = nextScale * 0.85;

        // Add rotation for more dynamic effect
        outerFlameRef.current.rotation.z = Math.sin(time * 20) * 0.1;
      }

      if (innerFlameRef.current) {
        const currentScale = innerFlameRef.current.scale.y;
        const targetScale = scaleVariation * 0.9;
        const nextScale = THREE.MathUtils.lerp(
          currentScale,
          targetScale,
          0.6 + delta * 15
        );
        innerFlameRef.current.scale.y = nextScale;
        innerFlameRef.current.scale.x = nextScale * 0.75;
        innerFlameRef.current.scale.z = nextScale * 0.75;

        // Independent rotation for chaotic fire effect
        innerFlameRef.current.rotation.z = Math.cos(time * 18) * 0.08;
      }

      if (coreRef.current) {
        const currentScale = coreRef.current.scale.y;
        const targetScale = scaleVariation * 0.7;
        const nextScale = THREE.MathUtils.lerp(
          currentScale,
          targetScale,
          0.6 + delta * 15
        );
        coreRef.current.scale.y = nextScale;
        coreRef.current.scale.x = nextScale * 0.6;
        coreRef.current.scale.z = nextScale * 0.6;

        // Core flickers more intensely
        coreRef.current.rotation.z = Math.sin(time * 25) * 0.12;
      }

      // More dramatic light flickering
      if (lightRef.current) {
        const lightFlicker =
          Math.sin(time * 15) * 0.15 +
          Math.cos(time * 28) * 0.12 +
          Math.sin(time * 42) * 0.08 +
          Math.cos(time * 35) * 0.05;
        lightRef.current.intensity = THREE.MathUtils.lerp(
          lightRef.current.intensity,
          4.0 + lightFlicker * 1.5,
          0.5 + delta * 12
        );
      }
    });

    React.useImperativeHandle(ref, () => groupRef.current!);

    if (!isLit) return null;

      return (
      <group ref={groupRef} position={[0, 2.2, 0]}>
        {/* Outer flame - orange-yellow, teardrop shape - more vibrant */}
        <mesh
          ref={outerFlameRef}
          position={[0, 0.35, 0]}
          scale={[0.22, 0.65, 0.22]}
        >
          {/* Teardrop shape using elongated sphere */}
          <sphereGeometry args={[0.3, 16, 16]} />
          <meshBasicMaterial
            color="#ff9900"
            transparent
            opacity={0.9}
            toneMapped={false}
          />
        </mesh>

        {/* Inner flame - brighter orange - more intense */}
        <mesh
          ref={innerFlameRef}
          position={[0, 0.3, 0]}
          scale={[0.16, 0.55, 0.16]}
        >
          <sphereGeometry args={[0.25, 14, 14]} />
          <meshBasicMaterial
            color="#ff7700"
            transparent
            opacity={0.95}
            toneMapped={false}
          />
        </mesh>

        {/* Core - bright yellow center - very bright */}
        <mesh ref={coreRef} position={[0, 0.2, 0]} scale={[0.11, 0.35, 0.11]}>
          <sphereGeometry args={[0.15, 12, 12]} />
          <meshBasicMaterial
            color="#ffee00"
            transparent
            opacity={0.98}
            toneMapped={false}
          />
        </mesh>

        {/* Enhanced outer glow halo - brighter and more visible */}
        <mesh position={[0, 0.25, 0]}>
          <sphereGeometry args={[0.4, 16, 16]} />
          <meshBasicMaterial
            color="#ff9900"
            transparent
            opacity={0.25}
            toneMapped={false}
          />
        </mesh>

        {/* Light source - brighter and more dynamic */}
        <pointLight
          ref={lightRef}
          color="#ffaa00"
          distance={35}
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
