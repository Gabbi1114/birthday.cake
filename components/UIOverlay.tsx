import React from 'react';
import { ViewMode } from '../types';
import { 
  Mic,
  MicOff,
  Wind
} from 'lucide-react';

interface UIOverlayProps {
  currentView: ViewMode;
  onViewChange: (mode: ViewMode) => void;
  onToggleUI: () => void;
  customText: string;
  onTextChange: (text: string) => void;
  isListening?: boolean;
  onEnableMic?: () => void;
  candlesBlownOut?: boolean;
  visible?: boolean;
}

const UIOverlay: React.FC<UIOverlayProps> = ({ 
  isListening = false,
  onEnableMic,
  candlesBlownOut = false,
}) => {
  return (
    <div className="w-full h-full p-6 pointer-events-none flex flex-col items-start justify-start">
      <div className="pointer-events-auto">
        {/* Microphone Control - Always Visible */}
        <button 
          onClick={onEnableMic}
          disabled={isListening && !candlesBlownOut}
          className={`
            flex items-center gap-3 bg-black/40 backdrop-blur-md p-3 rounded-lg border transition-all whitespace-nowrap
            ${isListening 
              ? 'border-red-500/50 bg-red-900/10 text-red-200' 
              : 'border-white/10 text-gray-400 hover:bg-white/10 hover:text-white'
            }
            ${candlesBlownOut ? 'border-green-500/50 bg-green-900/10 text-green-200' : ''}
          `}
        >
          {candlesBlownOut ? (
            <Wind className="w-5 h-5 text-green-400" />
          ) : isListening ? (
            <Mic className="w-5 h-5 text-red-400 animate-pulse" />
          ) : (
            <MicOff className="w-5 h-5" />
          )}
          
          <div className="flex flex-col text-left">
            <label className="text-[10px] uppercase tracking-widest font-bold opacity-70">
              {candlesBlownOut ? 'WISH' : 'BLOW'} DETECTION
            </label>
            <span className="font-mono text-sm font-bold">
              {candlesBlownOut ? 'GRANTED' : isListening ? 'LISTENING...' : 'ENABLE MIC'}
            </span>
          </div>
        </button>
      </div>
    </div>
  );
};

export default UIOverlay;