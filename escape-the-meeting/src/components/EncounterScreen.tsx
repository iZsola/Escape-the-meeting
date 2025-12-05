import React from 'react';
import { Briefcase, ShieldAlert } from 'lucide-react';
import { COLORS, BORDERS, SHADOW } from '../constants';

interface EncounterScreenProps {
  activeEnemy: any;
  dialogueTimeLeft: number;
  feedbackText: string;
  dialogueOptions: string[];
  onOptionSelect: (opt: string) => void;
}

export const EncounterScreen: React.FC<EncounterScreenProps> = ({
  activeEnemy,
  dialogueTimeLeft,
  feedbackText,
  dialogueOptions,
  onOptionSelect
}) => {
  return (
    <div className={`min-h-screen bg-[#6264A7] bg-halftone flex items-center justify-center p-4`}>
      <div className={`max-w-4xl w-full grid grid-cols-1 md:grid-cols-2 gap-6 ${COLORS.panel} ${BORDERS} ${SHADOW} p-8`}>
        <div className={`relative ${BORDERS} bg-gray-100 min-h-[300px] flex flex-col items-center justify-center overflow-hidden`}>
           <div className="absolute inset-0 opacity-10" style={{backgroundImage: 'radial-gradient(circle, #000 1px, transparent 1px)', backgroundSize: '10px 10px'}}></div>
           <Briefcase size={100} className="text-red-600 mb-4 animate-bounce" strokeWidth={2} />
           <div className="bg-red-600 text-white font-black px-6 py-2 transform -rotate-3 text-2xl z-10 border-2 border-black comic-font">
             {activeEnemy?.name}
           </div>
           <div className="absolute top-4 right-4 animate-ping">
             <ShieldAlert className="text-red-500" size={40} strokeWidth={3} />
           </div>
        </div>
        <div className="flex flex-col justify-between h-full">
          <div className="relative bg-white border-4 border-black p-6 mb-6 rounded-xl flex justify-between items-center shadow-md">
             <div className="absolute -left-4 top-1/2 w-0 h-0 border-t-[12px] border-t-transparent border-r-[24px] border-r-black border-b-[12px] border-b-transparent transform -translate-y-1/2 md:block hidden"></div>
             <p className="font-bold text-2xl uppercase italic comic-font mr-4 leading-tight">
               "{activeEnemy?.currentLine}"
             </p>
             <div className={`flex-shrink-0 flex items-center justify-center w-16 h-16 rounded-full border-4 border-black bg-gray-200 text-black ${dialogueTimeLeft <= 5 ? 'animate-pulse' : ''}`}>
                <span className="font-black text-2xl">{dialogueTimeLeft}</span>
             </div>
          </div>
          {feedbackText ? (
             <div className="flex-grow flex items-center justify-center">
               <h2 className={`text-7xl font-black text-center transform -rotate-6 drop-shadow-xl text-stroke-3 ${feedbackText.includes('ESCAPED') ? 'text-green-500' : 'text-red-600'}`}>
                 {feedbackText}
               </h2>
             </div>
          ) : (
            <div className="space-y-4 flex-grow flex flex-col justify-center">
              <p className="text-base font-bold text-gray-500 uppercase tracking-wide">Excuse your way out:</p>
              {dialogueOptions.map((opt, idx) => (
                <button key={idx} onClick={() => onOptionSelect(opt)} className={`w-full text-left p-4 text-lg font-bold border-2 border-black hover:bg-yellow-200 transition-colors bg-white shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] active:translate-x-1 active:translate-y-1 active:shadow-none leading-snug`}>
                  "{opt}"
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

