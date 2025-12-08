import React, { useState, useRef, useEffect } from 'react';
import Scene from './components/Scene';
import UIOverlay from './components/UIOverlay';
import { ViewMode } from './types';

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
      if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current);
      if (audioContextRef.current) audioContextRef.current.close();
    };
  }, []);

  const startMicrophone = async () => {
    if (isListening) return;

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const analyser = audioCtx.createAnalyser();
      const microphone = audioCtx.createMediaStreamSource(stream);
      
      microphone.connect(analyser);
      analyser.fftSize = 256;
      analyser.smoothingTimeConstant = 0.3;
      
      audioContextRef.current = audioCtx;
      analyserRef.current = analyser;
      setIsListening(true);
      
      // If candles are already out, we can reset them or keep them out. 
      // For this flow, let's assume we are starting fresh or trying to blow them out.
      if (candlesBlownOut) setCandlesBlownOut(false);

      const bufferLength = analyser.frequencyBinCount;
      const dataArray = new Uint8Array(bufferLength);

      const detectBlow = () => {
        if (!analyserRef.current) return;
        
        analyserRef.current.getByteFrequencyData(dataArray);
        
        // Calculate average volume
        let sum = 0;
        for (let i = 0; i < bufferLength; i++) {
          sum += dataArray[i];
        }
        const average = sum / bufferLength;

        // Threshold detection for "blowing" 
        // Adjusted to 140: slightly more sensitive than 160.
        if (average > 140) {
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
      alert("Unable to access microphone. Please allow permissions to blow out candles.");
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