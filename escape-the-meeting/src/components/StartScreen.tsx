import React from 'react';
import { Ghost, Coffee, Rocket, ShieldAlert } from 'lucide-react';
import { COLORS, SHADOW, BUTTON_CLASS } from '../constants';

interface StartScreenProps {
  onStart: () => void;
}

export const StartScreen: React.FC<StartScreenProps> = ({ onStart }) => {
  return (
    <div className={`min-h-screen ${COLORS.paper} flex items-center justify-center p-4 font-sans bg-halftone`}>
      <div className={`max-w-md w-full ${COLORS.panel} border-4 border-black ${SHADOW} p-8 text-center`}>
        <Ghost size={60} className="text-blue-600 mx-auto mb-2 animate-bounce" strokeWidth={2.5} />
        
        <h1 className="text-6xl font-black italic tracking-tighter mb-2 transform -rotate-2 leading-[0.85]">
           <span className="text-black block">ESCAPE THE</span>
           <span className="text-red-600 block text-stroke-2">MEETING</span>
        </h1>
        
        <p className="text-lg font-bold text-gray-500 mb-6 border-b-4 border-gray-200 pb-4 comic-font uppercase tracking-wide">
          Improvise. Adapt. Overcome.
        </p>

        <div className="text-left space-y-3 mb-8 font-bold text-sm comic-font bg-yellow-50 p-4 border-2 border-black transform rotate-1">
          <div className="flex items-center">
            <Rocket size={20} className="text-indigo-600 mr-2 flex-shrink-0" />
            <span>Ship the <span className="text-indigo-700">FEATURE</span> to get promoted.</span>
          </div>
          <div className="flex items-center">
            <Coffee size={20} className="text-amber-700 mr-2 flex-shrink-0" />
            <span>Drink <span className="text-amber-700">COFFEE</span> to extend your deadline.</span>
          </div>
          <div className="flex items-center">
            <ShieldAlert size={20} className="text-red-600 mr-2 flex-shrink-0" />
            <span>Avoid <span className="text-red-600">MANAGERS</span> or excuse your way out!</span>
          </div>
        </div>

        <button onClick={onStart} className={`${BUTTON_CLASS} ${COLORS.primary} text-white w-full hover:bg-blue-700 active:bg-blue-800 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]`}>
          START INTERNSHIP
        </button>
      </div>
    </div>
  );
};
