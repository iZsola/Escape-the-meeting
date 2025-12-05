import React from 'react';
import { Rocket } from 'lucide-react';
import { COLORS, SHADOW, BORDERS, BUTTON_CLASS } from '../constants';

interface WinScreenProps {
  onRestart: () => void;
  onMenu: () => void;
}

export const WinScreen: React.FC<WinScreenProps> = ({ onRestart, onMenu }) => {
  return (
    <div className={`min-h-screen ${COLORS.success} flex items-center justify-center p-4`}>
      <div className={`max-w-md w-full ${COLORS.panel} ${BORDERS} ${SHADOW} p-8 text-center`}>
        <Rocket size={80} className="mx-auto mb-4 text-indigo-700 animate-bounce" strokeWidth={2.5} />
        <h1 className="text-7xl font-black mb-4 text-white text-stroke-3 stroke-black drop-shadow-lg tracking-wider transform -rotate-3">
          CEO STATUS!
        </h1>
        <p className="text-xl font-bold mb-8 comic-font bg-white border-2 border-black p-2 inline-block transform rotate-1">
          You own the company now. No more meetings.
        </p>
        <button onClick={onRestart} className={`${BUTTON_CLASS} ${COLORS.primary} text-white w-full hover:bg-blue-500 mb-4`}>
          Re-Org (Restart)
        </button>
        <button onClick={onMenu} className={`${BUTTON_CLASS} bg-white text-black w-full hover:bg-gray-100`}>
          Back to Menu
        </button>
      </div>
    </div>
  );
};
