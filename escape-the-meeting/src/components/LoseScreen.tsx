import React from 'react';
import { COLORS, SHADOW, BORDERS, BUTTON_CLASS } from '../constants';

interface LoseScreenProps {
  onRestart: () => void;
  onMenu: () => void;
}

export const LoseScreen: React.FC<LoseScreenProps> = ({ onRestart, onMenu }) => {
  return (
    <div className={`min-h-screen bg-gray-900 flex items-center justify-center p-4`}>
      <div className={`max-w-md w-full ${COLORS.panel} ${BORDERS} ${SHADOW} p-8 text-center grayscale`}>
        <h1 className="text-6xl font-black mb-4 text-red-600 comic-font">FIRED</h1>
        <p className="text-xl font-bold mb-8 comic-font">
          You were let go for poor time management.
        </p>
        <button onClick={onRestart} className={`${BUTTON_CLASS} bg-gray-200 w-full hover:bg-white mb-4`}>
          Apply Again
        </button>
        <button onClick={onMenu} className={`${BUTTON_CLASS} bg-white text-black w-full hover:bg-gray-100`}>
          Back to Menu
        </button>
      </div>
    </div>
  );
};
