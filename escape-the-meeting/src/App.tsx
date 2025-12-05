import React, { useState, useEffect, useCallback } from 'react';
import { Smile, Briefcase, Coffee, Clock, Rocket, Volume2, VolumeX } from 'lucide-react';
import { StartScreen } from './components/StartScreen';
import { WinScreen } from './components/WinScreen';
import { LoseScreen } from './components/LoseScreen';
import { EncounterScreen } from './components/EncounterScreen';
import { SoundManager } from './utils/SoundManager';
import { getContextAwareExcuse } from './utils/excuses';
import { initializeLevel } from './utils/maze';
import { 
  LEVEL_THEMES, 
  JOB_TITLES, 
  BORDERS, 
  GRID_SIZE, 
  TILE_WALL, 
  TILE_START, 
  TILE_EXIT, 
  TILE_COFFEE,
  TILE_EMPTY
} from './constants';

export default function EscapeTheMeeting() {
  const [gameState, setGameState] = useState('START'); 
  const [level, setLevel] = useState(1);
  const [grid, setGrid] = useState<number[][]>([]);
  const [playerPos, setPlayerPos] = useState({ x: 0, y: 0 });
  const [enemies, setEnemies] = useState<any[]>([]); 
  const [activeEnemy, setActiveEnemy] = useState<any>(null);
  const [dialogueOptions, setDialogueOptions] = useState<string[]>([]);
  const [coffeeCount, setCoffeeCount] = useState(0);
  const [feedbackText, setFeedbackText] = useState("");
  const [timeLeft, setTimeLeft] = useState(20); 
  const [dialogueTimeLeft, setDialogueTimeLeft] = useState(10);
  const [sfx, setSfx] = useState<string | null>(null);
  const [usedQuestions, setUsedQuestions] = useState<Set<string>>(new Set());
  const [isMuted, setIsMuted] = useState(SoundManager.muted);

  const triggerSfx = (text: string) => {
    setSfx(text);
    setTimeout(() => setSfx(null), 800);
  };

  const toggleMute = () => {
    const muted = SoundManager.toggleMute();
    setIsMuted(muted);
  };

  useEffect(() => {
    // Start playing music on mount (Menu)
    SoundManager.playThemeMusic();
  }, []);

  const initLevel = useCallback((lvlNum: number) => {
    SoundManager.playThemeMusic(); // Will not restart if already playing
    const levelData = initializeLevel(lvlNum);
    if (!levelData) return;

    setGrid(levelData.grid);
    setEnemies(levelData.enemies);
    setPlayerPos(levelData.playerStart);
    setTimeLeft(levelData.timeLimit); 
    setGameState('PLAYING');
  }, []);

  const startGame = () => {
    SoundManager.playCollect(); // Start sound
    setLevel(1);
    setCoffeeCount(0);
    setFeedbackText(""); 
    setUsedQuestions(new Set()); // Reset used questions
    initLevel(1);
  };

  const goToMenu = () => {
    setGameState('START');
    SoundManager.playThemeMusic(); // Ensure music plays in menu
    SoundManager.playCollect();
  };

  useEffect(() => {
    if (gameState === 'ENCOUNTER') {
      SoundManager.playDialogueMusic();
    } else {
      SoundManager.stopDialogueMusic();
    }
  }, [gameState]);

  useEffect(() => {
    let interval: any = null;
    if (gameState === 'PLAYING') {
      interval = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            setGameState('TIMEOUT');
            SoundManager.stopThemeMusic(); // Stop music on timeout
            SoundManager.playLose();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [gameState]);

  useEffect(() => {
    let interval: any = null;
    if (gameState === 'ENCOUNTER' && !feedbackText) {
      interval = setInterval(() => {
        setDialogueTimeLeft((prev) => {
          if (prev <= 1) {
            if (dialogueOptions.length > 0) {
                handleExcuseSelect("...silence...", true);
            }
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [gameState, feedbackText, dialogueOptions]);

  const movePlayer = (dx: number, dy: number) => {
    if (gameState !== 'PLAYING') return;

    const newX = playerPos.x + dx;
    const newY = playerPos.y + dy;

    if (newX < 0 || newX >= GRID_SIZE || newY < 0 || newY >= GRID_SIZE) return;
    
    if (grid[newY][newX] === TILE_WALL) {
      return;
    }

    const enemy = enemies.find(e => e.x === newX && e.y === newY);
    if (enemy) {
      startEncounter(enemy);
      return;
    }

    setPlayerPos({ x: newX, y: newY });
    SoundManager.playStep();

    if (grid[newY][newX] === TILE_COFFEE) {
      let g = [...grid.map(row => [...row])];
      g[newY][newX] = TILE_EMPTY;
      setGrid(g);
      
      const newCoffeeCount = coffeeCount + 1;
      setCoffeeCount(newCoffeeCount);
      setTimeLeft(t => t + 3); 
      triggerSfx("+3 SEC");
      SoundManager.playSlurp();

    } else if (grid[newY][newX] === TILE_EXIT) {
      triggerSfx("PROMOTED!");
      SoundManager.playWin();
      if (level >= JOB_TITLES.length) {
        SoundManager.stopThemeMusic(); // Stop theme music on final win
        setGameState('WIN');
      } else {
        setLevel(l => l + 1);
        initLevel(level + 1);
      }
    }
  };

  const startEncounter = (enemy: any) => {
    SoundManager.playEncounter();
    let line = enemy.lines[Math.floor(Math.random() * enemy.lines.length)];
    let attempts = 0;
    while (usedQuestions.has(line) && attempts < 10) {
        line = enemy.lines[Math.floor(Math.random() * enemy.lines.length)];
        attempts++;
    }
    setUsedQuestions(prev => new Set(prev).add(line));
    
    const enemyWithLine = { ...enemy, currentLine: line };

    setActiveEnemy(enemyWithLine);
    setGameState('ENCOUNTER');
    setFeedbackText(""); 
    setDialogueTimeLeft(10); 
    
    const uniqueOptions = new Set<string>();
    let optsAttempts = 0;
    while (uniqueOptions.size < 3 && optsAttempts < 20) {
      uniqueOptions.add(getContextAwareExcuse(enemy.name, line));
      optsAttempts++;
    }
    setDialogueOptions(Array.from(uniqueOptions));
  };

  const handleExcuseSelect = (excuse: string, forceFail: boolean = false) => {
    SoundManager.stopDialogueMusic();
    const successChance = 0.6 + (coffeeCount * 0.05);
    const rolled = Math.random();

    if (!forceFail && rolled < successChance) {
      setFeedbackText("ESCAPED!");
      triggerSfx("DODGED!");
      SoundManager.playCorrectAnswer(); // Success sound
      setEnemies(prev => prev.filter(e => e.id !== activeEnemy.id));
      setPlayerPos({ x: activeEnemy.x, y: activeEnemy.y });
      
      setTimeout(() => {
        setGameState('PLAYING');
        SoundManager.playThemeMusic(); // Resume bg music
        setFeedbackText("");
        setActiveEnemy(null);
      }, 1500);
    } else {
      const penalty = 5;
      setFeedbackText(`STUCK! -${penalty}s`);
      triggerSfx("BLAH BLAH");
      SoundManager.playWrongAnswer();
      setTimeLeft(prev => Math.max(0, prev - penalty));
      setEnemies(prev => prev.filter(e => e.id !== activeEnemy.id));
      setPlayerPos({ x: activeEnemy.x, y: activeEnemy.y });

      setTimeout(() => {
        setTimeLeft(current => {
             if (current <= 0) {
                 setGameState('TIMEOUT');
                 SoundManager.stopThemeMusic(); // Stop music on timeout
                 SoundManager.playLose();
             } else {
                 setGameState('PLAYING');
                 SoundManager.playThemeMusic(); // Resume bg music
             }
             return current;
        });
        setFeedbackText("");
        setActiveEnemy(null);
      }, 1500);
    }
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (gameState === 'PLAYING') {
        if (e.key === 'ArrowUp' || e.key === 'w') movePlayer(0, -1);
        if (e.key === 'ArrowDown' || e.key === 's') movePlayer(0, 1);
        if (e.key === 'ArrowLeft' || e.key === 'a') movePlayer(-1, 0);
        if (e.key === 'ArrowRight' || e.key === 'd') movePlayer(1, 0);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [playerPos, gameState, coffeeCount, grid]);

  const currentTheme = LEVEL_THEMES[(level - 1) % LEVEL_THEMES.length];
  const currentTitle = JOB_TITLES[Math.min(level - 1, JOB_TITLES.length - 1)];

  const renderGrid = () => {
    return grid.map((row, y) => (
      <div key={y} className="flex">
        {row.map((tile, x) => {
          const isPlayer = playerPos.x === x && playerPos.y === y;
          const isEnemy = enemies.find(e => e.x === x && e.y === y);
          
          let content = null;
          let cellClass = `w-10 h-10 md:w-12 md:h-12 border-2 border-black flex items-center justify-center relative transition-colors duration-300 `;

          if (tile === TILE_WALL) {
            cellClass += `${currentTheme.wall} pattern-diagonal-lines`;
            content = <div className="w-full h-full bg-black opacity-50" />;
          } else if (tile === TILE_START) {
            cellClass += "bg-green-100";
            content = <div className="text-xs font-bold text-green-700">IN</div>;
          } else           if (tile === TILE_EXIT) {
            cellClass += "bg-indigo-100";
            content = <Rocket size={28} className="text-indigo-700" strokeWidth={2.5} />;
          } else if (tile === TILE_COFFEE) {
            content = <Coffee size={24} className="text-amber-700 animate-pulse" strokeWidth={2.5} />;
          } else {
            cellClass += "bg-white/90";
          }

          if (isEnemy) {
             content = <Briefcase size={28} className="text-red-600 z-10 drop-shadow-sm" strokeWidth={2.5} />;
          }

          if (isPlayer) {
             content = <Smile size={28} className="text-blue-600 z-20 drop-shadow-sm" strokeWidth={2.5} />;
          }

          return (
            <div key={`${x}-${y}`} className={cellClass}>
              {content}
            </div>
          );
        })}
      </div>
    ));
  };

  if (gameState === 'START') {
    return <StartScreen onStart={startGame} />;
  }

  if (gameState === 'ENCOUNTER') {
    return (
      <EncounterScreen 
        activeEnemy={activeEnemy}
        dialogueTimeLeft={dialogueTimeLeft}
        feedbackText={feedbackText}
        dialogueOptions={dialogueOptions}
        onOptionSelect={handleExcuseSelect}
      />
    );
  }

  if (gameState === 'WIN') {
    return <WinScreen onRestart={startGame} onMenu={goToMenu} />;
  }

  if (gameState === 'LOSE' || gameState === 'TIMEOUT') {
    return <LoseScreen onRestart={startGame} onMenu={goToMenu} />;
  }

  return (
    <div className={`min-h-screen ${currentTheme.bg} bg-halftone flex flex-col items-center justify-center p-2 font-sans overflow-hidden transition-colors duration-500`}>
      <div className="w-full max-w-lg mb-4 flex justify-between items-stretch gap-2">
        <div className="bg-white border-4 border-black px-4 py-2 transform -rotate-1 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] flex flex-col justify-center min-w-[140px]">
           <span className="text-xs font-bold text-gray-500 uppercase tracking-widest">Current Role</span>
           <span className={`font-black text-xl italic leading-none comic-font ${currentTheme.accent}`}>{currentTitle}</span>
        </div>
        <div className={`flex-grow border-4 border-black px-4 py-2 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] flex items-center justify-center space-x-2 ${timeLeft < 15 ? 'bg-red-500 text-white animate-pulse' : 'bg-white text-black'}`}>
           <Clock size={24} className={timeLeft < 15 ? 'text-white' : 'text-black'} strokeWidth={3} />
           <span className="font-black text-3xl italic tabular-nums comic-font">{timeLeft}s</span>
        </div>
        <button onClick={goToMenu} className="bg-white border-4 border-black px-3 flex items-center justify-center shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:bg-gray-100 active:translate-y-1 active:shadow-none transition-all transform rotate-1">
           <span className="font-bold text-sm">MENU</span>
        </button>
      </div>

      <div className={`relative bg-white ${BORDERS} p-2 shadow-[12px_12px_0px_0px_rgba(0,0,0,1)]`}>
        {sfx && (
          <div className="absolute inset-0 z-50 flex items-center justify-center pointer-events-none">
            <h1 className="text-7xl font-black text-yellow-400 text-stroke-3 stroke-black drop-shadow-lg animate-ping transform -rotate-12 comic-font whitespace-nowrap">
              {sfx}
            </h1>
          </div>
        )}
        <div className={`flex flex-col ${currentTheme.bg} border-2 border-black transition-colors duration-300`}>
          {renderGrid()}
        </div>
        <div className="absolute -bottom-24 left-0 right-0 flex justify-center space-x-4 md:hidden">
            <div className="bg-gray-200 p-2 rounded-full border-2 border-black">Use Arrow Keys / Tap</div>
        </div>
        
        {/* Desktop Mute Button - Left Side */}
        <div className="hidden md:block absolute -left-24 top-0">
           <button onClick={toggleMute} className="bg-white border-2 border-black p-3 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:bg-gray-100 active:translate-y-1 active:shadow-none transition-all flex flex-col items-center gap-2">
              {isMuted ? <VolumeX size={32} className="text-red-600"/> : <Volume2 size={32} className="text-green-600"/>}
           </button>
        </div>

        {/* Desktop Legend - Right Side */}
        <div className="hidden md:block absolute -right-40 top-0">
           <div className="bg-white border-2 border-black p-3 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] flex flex-col gap-3">
              <div className="flex items-center gap-2"><Smile size={20} className="text-blue-600"/> <span className="text-sm font-bold">YOU</span></div>
              <div className="flex items-center gap-2"><Briefcase size={20} className="text-red-600"/> <span className="text-sm font-bold">BOSS</span></div>
              <div className="flex items-center gap-2"><Rocket size={20} className="text-indigo-600"/> <span className="text-sm font-bold">FINISH</span></div>
              <div className="flex items-center gap-2"><Coffee size={20} className="text-amber-700"/> <span className="text-sm font-bold">+TIME</span></div>
           </div>
        </div>
      </div>

      <div className="max-w-lg mt-8 text-center">
        <p className="font-bold text-gray-800 uppercase tracking-widest text-sm bg-white inline-block px-2 border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
          Use Arrow Keys or WASD to Move
        </p>
      </div>
    </div>
  );
}
