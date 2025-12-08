import React, { useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { CylinderProps } from '../types';

const StarCylinder: React.FC<CylinderProps> = ({
  position = [0, 0, 0],
  count = 3000,
  radius = 5,
  height = 12,
  color = '#88ccff',
  particleSize = 0.05
}) => {
  const pointsRef = useRef<THREE.Points>(null);

  // Generate particles
  const particles = useMemo(() => {
    const positions = new Float32Array(count * 3);
    const colors = new Float32Array(count * 3);
    const sizes = new Float32Array(count);
    
    const colorObj = new THREE.Color(color);
    const tempColor = new THREE.Color();

    for (let i = 0; i < count; i++) {
      // Cylindrical coordinates
      // We add some thickness to the cylinder wall
      const theta = Math.random() * Math.PI * 2;
      const r = radius + (Math.random() - 0.5) * 1.5; // variance in radius
      const y = (Math.random() - 0.5) * height; // height distribution

      const x = r * Math.cos(theta);
      const z = r * Math.sin(theta);

      positions[i * 3] = x;
      positions[i * 3 + 1] = y;
      positions[i * 3 + 2] = z;

      // Color variation: mix between provided color and white/purple
      // Using HSL to shift hue slightly for variety
      tempColor.set(color);
      tempColor.offsetHSL((Math.random() - 0.5) * 0.1, 0, (Math.random() - 0.5) * 0.2);
      
      colors[i * 3] = tempColor.r;
      colors[i * 3 + 1] = tempColor.g;
      colors[i * 3 + 2] = tempColor.b;

      // Random sizes
      sizes[i] = Math.random() * particleSize;
    }

    return { positions, colors, sizes };
  }, [count, radius, height, color, particleSize]);

  useFrame((state) => {
    if (pointsRef.current) {
      // Rotate the entire cylinder slowly
      // This creates the "swirling" effect of the particles
      pointsRef.current.rotation.y += 0.002;
    }
  });

  return (
    <group position={position}>
      <points ref={pointsRef}>
        <bufferGeometry>
          <bufferAttribute
            attach="attributes-position"
            count={particles.positions.length / 3}
            array={particles.positions}
            itemSize={3}
          />
          <bufferAttribute
            attach="attributes-color"
            count={particles.colors.length / 3}
            array={particles.colors}
            itemSize={3}
          />
        </bufferGeometry>
        <pointsMaterial
          size={particleSize}
          vertexColors
          sizeAttenuation
          transparent
          opacity={0.8}
          blending={THREE.AdditiveBlending}
          depthWrite={false}
        />
      </points>
    </group>
  );
};

export default StarCylinder;