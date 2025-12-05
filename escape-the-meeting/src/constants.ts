// Level Themes
export const LEVEL_THEMES = [
  { bg: 'bg-yellow-50', wall: 'bg-gray-800', accent: 'text-amber-700', border: 'border-black' }, // Office
  { bg: 'bg-blue-50', wall: 'bg-slate-800', accent: 'text-blue-600', border: 'border-blue-900' },   // Server Room
  { bg: 'bg-green-50', wall: 'bg-emerald-900', accent: 'text-green-600', border: 'border-green-900' }, // Garden
  { bg: 'bg-orange-50', wall: 'bg-orange-900', accent: 'text-orange-600', border: 'border-orange-900' }, // Coffee Shop
  { bg: 'bg-purple-50', wall: 'bg-purple-900', accent: 'text-purple-600', border: 'border-purple-900' }, // Boardroom
];

export const JOB_TITLES = [
  "Intern",
  "Junior Developer",
  "Senior Developer",
  "Tech Lead",
  "Engineering Manager",
  "CTO",
  "Co-Founder",
  "CEO"
];

// Comic book style constants
export const COLORS = {
  panel: 'bg-white',
  ink: 'text-gray-900',
  danger: 'bg-red-500 bg-halftone',
  success: 'bg-green-400 bg-halftone',
  primary: 'bg-blue-600',
};

export const BORDERS = "border-4 border-black";
export const SHADOW = "shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]";
export const BUTTON_CLASS = `px-6 py-3 font-bold uppercase tracking-widest ${BORDERS} ${SHADOW} active:translate-x-1 active:translate-y-1 active:shadow-none transition-all comic-font text-xl`;

// Game Config
export const GRID_SIZE = 10;
export const TILE_EMPTY = 0;
export const TILE_WALL = 1;
export const TILE_START = 2;
export const TILE_EXIT = 3;
export const TILE_COFFEE = 4;
