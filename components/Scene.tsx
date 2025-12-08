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

  // Generate random balloons
  const balloons = useMemo(() => {
    const colors = [
      GOLD_COLOR,
      CREAM_COLOR,
      "#ffffff",
      "#c0c0c0",
      CHOCOLATE_COLOR,
    ];
    return Array.from({ length: 12 }).map((_, i) => {
      // Position scattered around the back (semi-circle) to avoid blocking the front view
      // Camera is at +Z, so we place balloons in the -Z region.
      // Angles from PI (Left) to 2PI (Right) puts them in the back half.
      const angle = Math.PI + Math.random() * Math.PI;

      // Increased radius to accommodate larger size
      const radius = 30 + Math.random() * 20;
      const x = Math.cos(angle) * radius;
      // The -10 shift combined with the angle restriction ensures they are well behind the main subject
      const z = Math.sin(angle) * radius - 10;
      const y = 5 + Math.random() * 15; // Floating height

      const color = colors[Math.floor(Math.random() * colors.length)];
      // Significantly increased scale range (3.5 to 6.0)
      const scale = 3.5 + Math.random() * 2.5;

      return { position: [x, y, z] as [number, number, number], color, scale };
    });
  }, []);

  // Standard font URL
  const fontUrl =
    "https://cdn.jsdelivr.net/npm/three/examples/fonts/helvetiker_bold.typeface.json";

  return (
    <Canvas
      gl={{
        antialias: true,
        toneMapping: THREE.ACESFilmicToneMapping,
        toneMappingExposure: 1.2,
        powerPreference: "high-performance",
      }}
      dpr={[1, Math.min(window.devicePixelRatio, 1.5)]}
      shadows
      performance={{ min: 0.5 }}
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
        <ambientLight intensity={0.8} color="#fff0e0" />
        <pointLight
          position={[30, 20, 30]}
          intensity={2.0}
          color="#fff8e1"
          castShadow
          shadow-mapSize={[1024, 1024]}
        />
        <pointLight position={[-30, 10, -20]} intensity={1.5} color="#ffd700" />
        <spotLight
          position={[0, 40, 0]}
          angle={0.5}
          penumbra={1}
          intensity={2.5}
          color="#ffffff"
          castShadow
          shadow-mapSize={[1024, 1024]}
          shadow-bias={-0.0001}
        />
        <directionalLight
          position={[0, 10, 20]}
          intensity={1.0}
          color="#fff5e6"
        />

        {/* Environment for realistic reflections on chocolate/balloons */}
        <Environment preset="city" />

        {/* Background */}
        <Stars
          radius={100}
          depth={50}
          count={2500}
          factor={4}
          saturation={0}
          fade
          speed={1}
        />

        {/* Table Surface (White Blanket) */}
        {/* Bottom of lowest cake layer is at y = -5 - (5/2) = -7.5 */}
        <mesh
          position={[0, -7.6, 0]}
          receiveShadow
          rotation={[-Math.PI / 2, 0, 0]}
        >
          <circleGeometry args={[50, 32]} />
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
                    curveSegments={12}
                    bevelEnabled
                    bevelThickness={0.03}
                    bevelSize={0.02}
                    bevelOffset={0}
                    bevelSegments={5}
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
                    curveSegments={12}
                    bevelEnabled
                    bevelThickness={0.03}
                    bevelSize={0.02}
                    bevelOffset={0}
                    bevelSegments={5}
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
