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
      <div className={`max-w-2xl w-full grid grid-cols-1 md:grid-cols-2 gap-4 ${COLORS.panel} ${BORDERS} ${SHADOW} p-6`}>
        <div className={`relative ${BORDERS} bg-gray-100 h-64 flex flex-col items-center justify-center overflow-hidden`}>
           <div className="absolute inset-0 opacity-10" style={{backgroundImage: 'radial-gradient(circle, #000 1px, transparent 1px)', backgroundSize: '10px 10px'}}></div>
           <Briefcase size={80} className="text-red-600 mb-4 animate-bounce" strokeWidth={2} />
           <div className="bg-red-600 text-white font-black px-4 py-1 transform -rotate-3 text-xl z-10 border-2 border-black comic-font">
             {activeEnemy?.name}
           </div>
           <div className="absolute top-4 right-4 animate-ping">
             <ShieldAlert className="text-red-500" size={32} strokeWidth={3} />
           </div>
        </div>
        <div className="flex flex-col justify-between">
          <div className="relative bg-white border-4 border-black p-4 mb-4 rounded-xl flex justify-between items-center">
             <div className="absolute -left-4 top-1/2 w-0 h-0 border-t-[10px] border-t-transparent border-r-[20px] border-r-black border-b-[10px] border-b-transparent transform -translate-y-1/2 md:block hidden"></div>
             <p className="font-bold text-xl uppercase italic comic-font mr-2">
               "{activeEnemy?.currentLine}"
             </p>
             <div className={`flex items-center justify-center w-12 h-12 rounded-full border-2 border-black ${dialogueTimeLeft <= 5 ? 'bg-red-500 text-white animate-ping' : 'bg-gray-200 text-black'}`}>
                <span className="font-black text-lg">{dialogueTimeLeft}</span>
             </div>
          </div>
          {feedbackText ? (
             <div className="flex-grow flex items-center justify-center">
               <h2 className={`text-6xl font-black text-center transform -rotate-6 drop-shadow-md text-stroke-2 ${feedbackText.includes('ESCAPED') ? 'text-green-500' : 'text-red-600'}`}>
                 {feedbackText}
               </h2>
             </div>
          ) : (
            <div className="space-y-3">
              <p className="text-sm font-bold text-gray-500 uppercase tracking-wide">Excuse your way out:</p>
              {dialogueOptions.map((opt, idx) => (
                <button key={idx} onClick={() => onOptionSelect(opt)} className={`w-full text-left p-3 text-sm font-bold border-2 border-black hover:bg-yellow-200 transition-colors bg-white shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] active:translate-x-1 active:translate-y-1 active:shadow-none`}>
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

