import React, { useEffect, useRef, useMemo, useState, Suspense } from "react";
import { Canvas, useThree } from "@react-three/fiber";
import {
  OrbitControls,
  Stars,
  PerspectiveCamera,
  Environment,
  Text3D,
  Center,
} from "@react-three/drei";
import * as THREE from "three";
import Candle from "./Candle";
import Polaroid from "./Polaroid";
import CakeLayer from "./CakeLayer";
import Rose from "./Rose";
import Balloon from "./Balloon";
import { ViewMode } from "../types";

// --- EDITABLE MESSAGE SECTION ---
const MESSAGE_ON_POLAROID =
  "Make a wish!\n\nMay your year be as\nbright as these stars.\n\nHappy Birthday!";
// --------------------------------

// Component to handle camera transitions based on ViewMode
const CameraController: React.FC<{ viewMode: ViewMode }> = ({ viewMode }) => {
  const { camera } = useThree();
  const targetPos = useRef(new THREE.Vector3(0, 10, 25));

  useEffect(() => {
    switch (viewMode) {
      case ViewMode.TOP:
        targetPos.current.set(0, 50, 0);
        break;
      case ViewMode.SIDE:
        targetPos.current.set(50, 0, 0);
        break;
      case ViewMode.ORBIT:
      default:
        targetPos.current.set(0, 20, 45);
        break;
    }
  }, [viewMode]);

  useEffect(() => {
    camera.position.copy(targetPos.current);
    camera.lookAt(0, 2, 0);
  }, [viewMode, camera]);

  return null;
};

// Wrapper to animate the rotation of the formation
const Formation: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Static formation facing front
  return <group rotation={[0, 0, 0]}>{children}</group>;
};

interface SceneProps {
  viewMode: ViewMode;
  customText: string;
  candlesBlownOut?: boolean;
}

const Scene: React.FC<SceneProps> = ({
  viewMode,
  customText,
  candlesBlownOut = false,
}) => {
  // Constants for the chocolate design
  const CHOCOLATE_COLOR = "#3e2723";
  const CREAM_COLOR = "#f5e6d3";
  const GOLD_COLOR = "#d4af37";

  const [showPolaroidMessage, setShowPolaroidMessage] = useState(false);

  // Trigger Polaroid animation 5 seconds after candles are blown out
  useEffect(() => {
    if (candlesBlownOut) {
      const timer = setTimeout(() => {
        setShowPolaroidMessage(true);
      }, 5000);
      return () => clearTimeout(timer);
    } else {
      setShowPolaroidMessage(false);
    }
  }, [candlesBlownOut]);

  // Calculate positions for candles (moved slightly outward to frame the roses)
  const candles = useMemo(() => {
    const count = 6; // Reduced count for elegance
    const radius = 3.0;
    const yPos = 7.5;

    return Array.from({ length: count }).map((_, i) => {
      const angle = (i / count) * Math.PI * 2;
      return (
        <Candle
          key={i}
          position={[Math.cos(angle) * radius, yPos, Math.sin(angle) * radius]}
          isLit={!candlesBlownOut}
        />
      );
    });
  }, [candlesBlownOut]);

  // Generate random balloons with vibrant colors, positioned near table with collision avoidance
  const balloons = useMemo(() => {
    const colors = [
      "#FF6B6B", // Bright red
      "#4ECDC4", // Turquoise
      "#FFE66D", // Yellow
      "#FF6B9D", // Pink
      "#C44569", // Deep pink
      "#6C5CE7", // Purple
      "#00D2D3", // Cyan
      "#FFA07A", // Light salmon
      "#98D8C8", // Mint green
      "#F7DC6F", // Light yellow
      "#BB8FCE", // Lavender
      "#85C1E2", // Sky blue
    ];

    const balloonCount = 8;
    const minDistance = 8; // Minimum distance between balloon centers to prevent overlap
    const positions: Array<[number, number, number]> = [];
    const scales: number[] = [];
    const balloonColors: string[] = [];

    // Generate balloons with collision detection
    for (let i = 0; i < balloonCount; i++) {
      let attempts = 0;
      let validPosition = false;
      let x = 0,
        y = 0,
        z = 0;

      while (!validPosition && attempts < 100) {
        // Position around the table (closer radius: 12-20)
        const angle = Math.random() * Math.PI * 2; // Full circle around table
        const radius = 12 + Math.random() * 8; // Closer to table
        x = Math.cos(angle) * radius;
        z = Math.sin(angle) * radius;
        y = 3 + Math.random() * 12; // Floating height above table

        // Check collision with existing balloons
        validPosition = true;
        for (const existingPos of positions) {
          const dx = x - existingPos[0];
          const dy = y - existingPos[1];
          const dz = z - existingPos[2];
          const distance = Math.sqrt(dx * dx + dy * dy + dz * dz);

          if (distance < minDistance) {
            validPosition = false;
            break;
          }
        }

        attempts++;
      }

      if (validPosition) {
        positions.push([x, y, z]);
        scales.push(2.5 + Math.random() * 2.0); // Slightly smaller scale range
        balloonColors.push(colors[Math.floor(Math.random() * colors.length)]);
      }
    }

    return positions.map((position, i) => ({
      position,
      color: balloonColors[i],
      scale: scales[i],
    }));
  }, []);

  // Standard font URL
  const fontUrl =
    "https://cdn.jsdelivr.net/npm/three/examples/fonts/helvetiker_bold.typeface.json";

  return (
    <Canvas
      gl={{
        antialias: true,
        toneMapping: THREE.ACESFilmicToneMapping,
        toneMappingExposure: 1.3,
        powerPreference: "high-performance",
        alpha: false,
        stencil: false,
        depth: true,
      }}
      dpr={[1, Math.min(window.devicePixelRatio, 2.5)]}
      shadows={true}
      performance={{ min: 0.5 }}
      frameloop="always"
    >
      <Suspense fallback={null}>
        <PerspectiveCamera makeDefault position={[0, 20, 45]} fov={45} />
        <CameraController viewMode={viewMode} />

        <OrbitControls
          enablePan={false}
          enableZoom={true}
          minDistance={10}
          maxDistance={150}
          autoRotate={false}
          autoRotateSpeed={0.5}
        />

        {/* Bright & Elegant Lighting */}
        <ambientLight intensity={1.0} color="#fff0e0" />
        <pointLight
          position={[30, 20, 30]}
          intensity={2.5}
          color="#fff8e1"
          castShadow
          shadow-mapSize={[512, 512]}
        />
        <pointLight position={[-30, 10, -20]} intensity={2.0} color="#ffd700" />
        <spotLight
          position={[0, 40, 0]}
          angle={0.5}
          penumbra={1}
          intensity={3.0}
          color="#ffffff"
          castShadow
          shadow-mapSize={[512, 512]}
        />
        <directionalLight
          position={[0, 10, 20]}
          intensity={1.5}
          color="#fff5e6"
        />
        {/* Rim lighting for better depth */}
        <pointLight position={[0, 5, -30]} intensity={1.5} color="#ffebcd" />

        {/* Environment disabled for better performance */}

        {/* Background */}
        <Stars
          radius={100}
          depth={50}
          count={2000}
          factor={4}
          saturation={0}
          fade
          speed={1}
        />

        {/* Table Surface (White Blanket) */}
        {/* Bottom of lowest cake layer is at y = -5 - (5/2) = -7.5 */}
        <mesh
          position={[0, -7.6, 0]}
          rotation={[-Math.PI / 2, 0, 0]}
          receiveShadow
        >
          <circleGeometry args={[30, 32]} />
          <meshStandardMaterial
            color="#ffffff"
            roughness={0.9}
            metalness={0.0}
          />
        </mesh>

        {/* Scattered Balloons (Outside rotation) */}
        <group>
          {balloons.map((b, i) => (
            <Balloon
              key={i}
              position={b.position}
              color={b.color}
              scale={b.scale}
            />
          ))}
        </group>

        <Formation>
          {/* Bottom Layer */}
          <CakeLayer
            position={[0, -5, 0]}
            radius={11}
            height={5}
            color={CHOCOLATE_COLOR}
            creamColor={CREAM_COLOR}
            withBottomCream={true}
            withGoldDrip={true}
            withFruit={true}
          />

          {/* Middle Layer */}
          <CakeLayer
            position={[0, 0, 0]}
            radius={7.5}
            height={5}
            color={CHOCOLATE_COLOR}
            creamColor={CREAM_COLOR}
            withBottomCream={true}
            withGoldDrip={true}
            sideText={customText}
            fontUrl={fontUrl}
          />

          {/* Top Layer */}
          <group>
            <CakeLayer
              position={[0, 5, 0]}
              radius={4}
              height={5}
              color={CHOCOLATE_COLOR}
              creamColor={CREAM_COLOR}
              withBottomCream={true}
              withGoldDrip={true}
            />

            {/* Candles */}
            {candles}

            {/* Topper: Text & Roses */}
            <group position={[0, 7.5, 0]}>
              {/* 3D Text */}
              <group position={[0, 0.5, 0]}>
                <Center position={[0, 1.4, 0]}>
                  <Text3D
                    font={fontUrl}
                    size={0.8}
                    height={0.2}
                    curveSegments={8}
                    bevelEnabled
                    bevelThickness={0.03}
                    bevelSize={0.02}
                    bevelOffset={0}
                    bevelSegments={3}
                  >
                    Happy
                    <meshStandardMaterial
                      color={GOLD_COLOR}
                      metalness={0.6}
                      roughness={0.3}
                    />
                  </Text3D>
                </Center>

                <Center position={[0, 0.4, 0]}>
                  <Text3D
                    font={fontUrl}
                    size={0.8}
                    height={0.2}
                    curveSegments={8}
                    bevelEnabled
                    bevelThickness={0.03}
                    bevelSize={0.02}
                    bevelOffset={0}
                    bevelSegments={3}
                  >
                    Birthday
                    <meshStandardMaterial
                      color={GOLD_COLOR}
                      metalness={0.6}
                      roughness={0.3}
                    />
                  </Text3D>
                </Center>
              </group>

              {/* Gold Roses Cluster */}
              <group position={[0, 0, 0.5]}>
                <Rose position={[-0.8, 0, 0]} scale={1.2} color={GOLD_COLOR} />
                <Rose
                  position={[0.8, 0, -0.2]}
                  scale={1.1}
                  color={GOLD_COLOR}
                />
                <Rose position={[0, 0.2, 0.8]} scale={1.3} color={GOLD_COLOR} />
                <Rose
                  position={[0, 0.4, -0.5]}
                  scale={1.0}
                  color={GOLD_COLOR}
                />
              </group>
            </group>
          </group>

          {/* Polaroid - Leaning against middle/top interface */}
          <Polaroid
            position={[0, 2.5, 6.0]}
            rotation={[-0.1, 0, 0]}
            scale={1.4}
            showMessage={showPolaroidMessage}
            message={MESSAGE_ON_POLAROID}
          />
        </Formation>

        <fog attach="fog" args={["#050200", 30, 150]} />
      </Suspense>
    </Canvas>
  );
};

export default Scene;
