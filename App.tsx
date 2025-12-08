import React, { useState, useRef, useEffect } from "react";
import Scene from "./components/Scene";
import UIOverlay from "./components/UIOverlay";
import { ViewMode } from "./types";

const App: React.FC = () => {
  const [viewMode, setViewMode] = useState<ViewMode>(ViewMode.ORBIT);
  const [showUI, setShowUI] = useState<boolean>(true);
  const [customText, setCustomText] = useState<string>("ALEXANDER");

  // Microphone & Candle State
  const [isListening, setIsListening] = useState(false);
  const [candlesBlownOut, setCandlesBlownOut] = useState(false);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const animationFrameRef = useRef<number>(0);

  // Cleanup effect
  useEffect(() => {
    return () => {
      if (animationFrameRef.current)
        cancelAnimationFrame(animationFrameRef.current);
      if (audioContextRef.current) audioContextRef.current.close();
    };
  }, []);

  const startMicrophone = async () => {
    if (isListening) return;

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const audioCtx = new (window.AudioContext ||
        (window as any).webkitAudioContext)();
      const analyser = audioCtx.createAnalyser();
      const microphone = audioCtx.createMediaStreamSource(stream);

      microphone.connect(analyser);
      // Increased FFT size for better frequency resolution
      analyser.fftSize = 512;
      // Reduced smoothing for more responsive detection
      analyser.smoothingTimeConstant = 0.1;

      audioContextRef.current = audioCtx;
      analyserRef.current = analyser;
      setIsListening(true);

      // If candles are already out, we can reset them or keep them out.
      // For this flow, let's assume we are starting fresh or trying to blow them out.
      if (candlesBlownOut) setCandlesBlownOut(false);

      const bufferLength = analyser.frequencyBinCount;
      const frequencyData = new Uint8Array(bufferLength);
      const timeData = new Uint8Array(analyser.fftSize);

      const detectBlow = () => {
        if (!analyserRef.current) return;

        analyserRef.current.getByteFrequencyData(frequencyData);
        analyserRef.current.getByteTimeDomainData(timeData);

        // Focus on lower frequencies (0-100 Hz range) where blowing sounds are strongest
        // Lower frequencies are in the first ~20% of the array
        const lowFreqRange = Math.floor(bufferLength * 0.2);
        let lowFreqSum = 0;
        for (let i = 0; i < lowFreqRange; i++) {
          lowFreqSum += frequencyData[i];
        }
        const lowFreqAverage = lowFreqSum / lowFreqRange;

        // Calculate overall volume from time domain (more accurate for amplitude)
        let timeSum = 0;
        for (let i = 0; i < timeData.length; i++) {
          const amplitude = Math.abs(timeData[i] - 128);
          timeSum += amplitude;
        }
        const timeAverage = timeSum / timeData.length;

        // Combined detection: focus on low frequencies and overall amplitude
        // Lower threshold (100) for better phone microphone sensitivity
        // Weight low frequencies more heavily as blowing produces low-frequency sounds
        const combinedThreshold =
          (lowFreqAverage * 1.5 + timeAverage * 0.5) / 2;

        if (combinedThreshold > 100) {
          setCandlesBlownOut(true);
          // We can optionally stop listening here, or keep listening.
          // Stopping saves resources.
          setIsListening(false);
          if (audioContextRef.current) {
            audioContextRef.current.close();
            audioContextRef.current = null;
          }
          return;
        }

        animationFrameRef.current = requestAnimationFrame(detectBlow);
      };

      detectBlow();
    } catch (err) {
      console.error("Microphone access denied or error:", err);
      alert(
        "Unable to access microphone. Please allow permissions to blow out candles."
      );
      setIsListening(false);
    }
  };

  return (
    <div className="relative w-full h-full bg-black">
      {/* 3D Scene Container */}
      <div className="absolute inset-0 z-0">
        <Scene
          viewMode={viewMode}
          customText={customText}
          candlesBlownOut={candlesBlownOut}
        />
      </div>

      {/* UI Overlay - Always rendered, manages its own internal visibility */}
      <div className="absolute inset-0 z-10 pointer-events-none">
        <UIOverlay
          currentView={viewMode}
          onViewChange={setViewMode}
          onToggleUI={() => setShowUI(!showUI)}
          customText={customText}
          onTextChange={setCustomText}
          isListening={isListening}
          onEnableMic={startMicrophone}
          candlesBlownOut={candlesBlownOut}
          visible={showUI}
        />
      </div>

      {/* Floating Toggle Button (visible when UI is hidden) */}
      {!showUI && (
        <button
          onClick={() => setShowUI(true)}
          className="absolute top-4 right-4 z-20 px-4 py-2 bg-white/10 backdrop-blur-md border border-white/20 rounded-full text-white hover:bg-white/20 transition-all pointer-events-auto"
        >
          Show UI
        </button>
      )}
    </div>
  );
};

export default App;
