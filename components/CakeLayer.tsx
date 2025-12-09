import React, { useMemo } from "react";
import { Text3D, Center } from "@react-three/drei";
import * as THREE from "three";

interface CakeLayerProps {
  position: [number, number, number];
  radius: number;
  height: number;
  color: string;
  creamColor?: string;
  withSprinkles?: boolean;
  withBottomCream?: boolean;
  withGoldDrip?: boolean;
  withFruit?: boolean;
  sideText?: string;
  fontUrl?: string;
}

const Cherry: React.FC = () => (
  <group scale={2.5}>
    {/* Cherry Body */}
    <mesh position={[0, 0.15, 0]}>
      <sphereGeometry args={[0.15, 16, 16]} />
      <meshPhysicalMaterial
        color="#8b0000"
        roughness={0.1}
        metalness={0.1}
        clearcoat={1}
        clearcoatRoughness={0.1}
      />
    </mesh>
    {/* Stem */}
    <mesh position={[0.02, 0.35, 0]} rotation={[0, 0, -0.3]}>
      <cylinderGeometry args={[0.01, 0.01, 0.3, 4]} />
      <meshStandardMaterial color="#2d5a27" roughness={0.8} />
    </mesh>
  </group>
);

const FruitRing: React.FC<{ radius: number }> = ({ radius }) => {
  // Adjusted spacing for larger cherries
  const count = Math.floor((radius * Math.PI * 2) / 2.0);
  const items = useMemo(() => {
    return Array.from({ length: count }).map((_, i) => {
      const angle = (i / count) * Math.PI * 2;
      // Position fruits inside the cream rim
      const r = radius - 1.4;
      const x = Math.cos(angle) * r;
      const z = Math.sin(angle) * r;

      // Random rotation for natural look
      const rotY = (Math.random() - 0.5) * 2.0;

      return { x, z, angle, rotY };
    });
  }, [radius, count]);

  return (
    <group>
      {items.map((item, i) => (
        <group
          key={i}
          position={[item.x, 0, item.z]}
          rotation={[0, -item.angle + item.rotY, 0]}
        >
          <Cherry />
        </group>
      ))}
    </group>
  );
};

const Sprinkles: React.FC<{ radius: number; count: number }> = ({
  radius,
  count,
}) => {
  const items = useMemo(() => {
    const data = [];
    const colors = ["#ff69b4", "#00ced1", "#ffd700", "#ffffff", "#ff6347"];

    for (let i = 0; i < count; i++) {
      const r = Math.sqrt(Math.random()) * (radius - 1.5);
      const theta = Math.random() * Math.PI * 2;
      const x = r * Math.cos(theta);
      const z = r * Math.sin(theta);
      const rotY = Math.random() * Math.PI;
      const type = Math.random() > 0.3 ? "sprinkle" : "pearl";
      const color = colors[Math.floor(Math.random() * colors.length)];
      data.push({
        position: [x, 0.05, z] as [number, number, number],
        rotation: [Math.PI / 2, rotY, 0] as [number, number, number],
        color,
        type,
      });
    }
    return data;
  }, [radius, count]);

  return (
    <group>
      {items.map((s, i) => (
        <mesh key={i} position={s.position} rotation={s.rotation}>
          {s.type === "sprinkle" ? (
            <cylinderGeometry args={[0.03, 0.03, 0.3, 8]} />
          ) : (
            <sphereGeometry args={[0.1, 8, 8]} />
          )}
          <meshStandardMaterial
            color={s.color}
            roughness={0.3}
            metalness={0.1}
          />
        </mesh>
      ))}
    </group>
  );
};

const CreamRim: React.FC<{
  radius: number;
  color: string;
  isBottom?: boolean;
}> = ({ radius, color, isBottom }) => {
  const dollopCount = Math.floor((radius * Math.PI * 2) / 0.6);

  const dollops = useMemo(() => {
    return Array.from({ length: dollopCount }).map((_, i) => {
      const angle = (i / dollopCount) * Math.PI * 2;
      const r = isBottom ? radius + 0.1 : radius - 0.2;
      const x = Math.cos(angle) * r;
      const z = Math.sin(angle) * r;
      const scale = 1 + Math.random() * 0.1;
      return { pos: [x, 0, z] as [number, number, number], scale };
    });
  }, [radius, dollopCount, isBottom]);

  return (
    <group>
      {dollops.map((d, i) => (
        <mesh
          key={i}
          position={d.pos}
          scale={[d.scale, d.scale * 0.8, d.scale]}
        >
          <sphereGeometry args={[0.25, 16, 16]} />
          <meshStandardMaterial color={color} roughness={0.5} metalness={0.1} />
        </mesh>
      ))}
    </group>
  );
};

const GoldDrip: React.FC<{ radius: number; height: number }> = ({
  radius,
  height,
}) => {
  const drips = useMemo(() => {
    const circumference = radius * Math.PI * 2;
    const count = Math.floor(circumference * 1.5);

    return Array.from({ length: count }).map((_, i) => {
      const angle = (i / count) * Math.PI * 2 + Math.random() * 0.2;
      const dripLength = 0.5 + Math.random() * 1.2;
      const width = 0.12 + Math.random() * 0.05;
      const r = radius + 0.05;
      const x = Math.cos(angle) * r;
      const z = Math.sin(angle) * r;

      return { x, z, angle, length: dripLength, width };
    });
  }, [radius]);

  const goldMaterial = (
    <meshStandardMaterial color="#d4af37" metalness={0.3} roughness={0.6} />
  );

  return (
    <group position={[0, height / 2, 0]}>
      <mesh position={[0, 0.02, 0]}>
        <cylinderGeometry args={[radius + 0.05, radius + 0.05, 0.05, 64]} />
        {goldMaterial}
      </mesh>

      {drips.map((d, i) => (
        <group key={i} position={[d.x, 0, d.z]} rotation={[0, -d.angle, 0]}>
          <mesh position={[0, -d.length / 2, 0]}>
            <cylinderGeometry args={[d.width, d.width, d.length, 8]} />
            {goldMaterial}
          </mesh>
          <mesh position={[0, -d.length, 0]}>
            <sphereGeometry args={[d.width * 1.1, 16, 16]} />
            {goldMaterial}
          </mesh>
        </group>
      ))}
    </group>
  );
};

const CurvedText: React.FC<{
  text: string;
  radius: number;
  fontUrl: string;
  size?: number;
}> = ({ text, radius, fontUrl, size = 1.5 }) => {
  const letters = text.split("");
  // Calculate angular spacing based on text size and radius
  // Arc length per character roughly equals size (with some kerning adjustment)
  const anglePerChar = (size * 0.8) / radius;
  const totalAngle = (letters.length - 1) * anglePerChar;
  const startAngle = -totalAngle / 2;

  const candyMaterial = (
    <meshPhysicalMaterial
      color="#ff69b4"
      emissive="#ff1493"
      emissiveIntensity={0.2}
      roughness={0.1}
      metalness={0.1}
      clearcoat={1.0}
      clearcoatRoughness={0.1}
      transmission={0.1}
    />
  );

  return (
    <group rotation={[0, 0, 0]}>
      {letters.map((letter, i) => {
        const angle = startAngle + i * anglePerChar;
        return (
          <group
            key={i}
            // Position using sine/cosine to place on cylinder edge
            position={[Math.sin(angle) * radius, 0, Math.cos(angle) * radius]}
            // Rotate to face outward
            rotation={[0, angle, 0]}
          >
            <Center>
              <Text3D
                font={fontUrl}
                size={size}
                height={0.2}
                curveSegments={12}
                bevelEnabled
                bevelThickness={0.05}
                bevelSize={0.03}
                bevelOffset={0}
                bevelSegments={8}
              >
                {letter}
                {candyMaterial}
              </Text3D>
            </Center>
          </group>
        );
      })}
    </group>
  );
};

const CakeLayer: React.FC<CakeLayerProps> = ({
  position,
  radius,
  height,
  color,
  creamColor = "#f5e6d3",
  withSprinkles = false,
  withBottomCream = false,
  withGoldDrip = false,
  withFruit = false,
  sideText,
  fontUrl,
}) => {
  return (
    <group position={position}>
      {/* Main Cake Body */}
      <mesh>
        <cylinderGeometry args={[radius, radius, height, 32]} />
        <meshStandardMaterial color={color} metalness={0.05} roughness={0.4} />
      </mesh>

      {/* Gold Drip Sauce */}
      {withGoldDrip && <GoldDrip radius={radius} height={height} />}

      {/* Top Decoration Group */}
      {/* Raise slightly if gold drip exists so cream sits on sauce */}
      <group position={[0, height / 2 + (withGoldDrip ? 0.06 : 0), 0]}>
        <CreamRim radius={radius} color={creamColor} />
        {withSprinkles && (
          <Sprinkles radius={radius} count={Math.floor(radius * 12)} />
        )}
        {withFruit && <FruitRing radius={radius} />}
      </group>

      {/* Bottom Decoration Group */}
      {withBottomCream && (
        <group position={[0, -height / 2 + 0.2, 0]}>
          <CreamRim radius={radius} color={creamColor} isBottom />
        </group>
      )}

      {/* Side Text (Candy Name) */}
      {sideText && fontUrl && (
        // Pass radius + offset so text sits on surface
        <group position={[0, 0, 0]}>
          <CurvedText
            text={sideText}
            radius={radius + 0.22}
            fontUrl={fontUrl}
            size={1.5}
          />
        </group>
      )}
    </group>
  );
};

export default CakeLayer;
