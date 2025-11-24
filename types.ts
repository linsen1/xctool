
export enum AppView {
  SPLASH = 'SPLASH',
  HOME = 'HOME',
  
  // Module Menus
  MENU_CALC = 'MENU_CALC',
  MENU_SERIES = 'MENU_SERIES',
  MENU_THINKING = 'MENU_THINKING',
  MENU_DATA = 'MENU_DATA',
  
  // Active Practice/Game Views
  PRACTICE_SESSION = 'PRACTICE_SESSION', 
  
  // Thinking Games
  GAME_SCHULTE = 'GAME_SCHULTE',
  GAME_LINKED_SCHULTE = 'GAME_LINKED_SCHULTE',
  GAME_TEXT_FIND = 'GAME_TEXT_FIND',
  GAME_SUDOKU = 'GAME_SUDOKU',
  GAME_GUESS_NUMBER = 'GAME_GUESS_NUMBER',
  GAME_24_POINT = 'GAME_24_POINT',
  GAME_INSTANT_MEMORY = 'GAME_INSTANT_MEMORY',
  GAME_FLASH_CALC = 'GAME_FLASH_CALC',
  GAME_STROOP = 'GAME_STROOP',
  GAME_SHAPE_ROTATION = 'GAME_SHAPE_ROTATION',
  
  // Utility Views
  MISTAKE_BOOK = 'MISTAKE_BOOK',
  HISTORY = 'HISTORY',
  FOCUS_MODE = 'FOCUS_MODE',
  DAILY_10 = 'DAILY_10',
  PROFILE = 'PROFILE',
  VIP_PAGE = 'VIP_PAGE'
}

export type QuestionType = 'calc' | 'series' | 'data' | 'verbal' | 'logic';

export interface Question {
  id: string;
  type: QuestionType;
  subType?: string; 
  content: string; 
  dataContext?: string; 
  options?: string[]; 
  correctAnswer: string;
  explanation?: string;
  inputMode?: 'choice' | 'numpad'; 
}

export interface PracticeRecord {
  id: string;
  date: string;
  moduleName: string;
  score: number;
  total: number;
  durationSeconds: number;
}

export interface MistakeRecord {
  question: Question;
  userAnswer: string;
  timestamp: number;
  errorCount: number;
}

export interface UserStats {
  totalQuestions: number;
  streakDays: number;
  points: number;
  vipLevel: 'free' | 'vip';
  lastActiveDate: string;
}

export interface ModuleConfig {
  id: string;
  title: string;
  icon: any;
  color: string;
  subModules: { id: string; title: string; category?: string }[];
}

export interface LeadForm {
  name: string;
  phone: string;
  targetExam: string;
}
