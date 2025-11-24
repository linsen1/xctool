
import React, { useState, useEffect, useRef, useMemo } from 'react';
import { 
  Home, Calculator, Brain, List, BarChart3, Calendar, XCircle, Clock, 
  ChevronRight, ArrowLeft, RefreshCw, CheckCircle2, Play, User, Crown, 
  Settings, Zap, Trophy, Grid3X3, Eye, Delete, CornerDownLeft, RotateCw,
  Search, Hash, Timer, BookOpen, Star, AlertCircle, Check, Undo, Lightbulb,
  Table
} from 'lucide-react';
import { 
  AppView, Question, PracticeRecord, MistakeRecord, UserStats, ModuleConfig 
} from './types';
import { 
  generateCalcQuestion, generateSeriesQuestion, generateDataQuestion 
} from './services/mathEngine';
import { generateDaily10 } from './services/geminiService';
import { LeadGenModal } from './components/LeadGenModal';

// --- Module Configurations ---
const MODULES: ModuleConfig[] = [
  {
    id: 'module_a', title: '基础计算', icon: Calculator, color: 'text-blue-600 bg-blue-100 border-blue-200',
    subModules: [
      { id: 'calc_2digit_add', title: '两位数加减' },
      { id: 'calc_3digit_add', title: '三位数加法' },
      { id: 'calc_3digit_sub', title: '三位数减法' },
      { id: 'calc_multi_add', title: '多数相加' },
      { id: 'calc_mul_2x1', title: '两位数 × 一位数' },
      { id: 'calc_mul_3x1', title: '三位数 × 一位数' },
      { id: 'calc_mul_2x11', title: '两位数 × 11' },
      { id: 'calc_mul_2x15', title: '两位数 × 15' },
      { id: 'calc_mul_2x2', title: '两位数 × 两位数' },
      { id: 'calc_mul_3x2', title: '三位数 × 两位数' },
      { id: 'calc_square', title: '常见平方数' },
      { id: 'calc_div_3d1', title: '三位 ÷ 一位' },
      { id: 'calc_div_3d2', title: '三位 ÷ 两位' },
      { id: 'calc_div_5d3', title: '五位 ÷ 三位' },
      { id: 'calc_div_3d4', title: '三位 ÷ 四位' },
      { id: 'calc_est_mul', title: '乘法估算' },
    ]
  },
  {
    id: 'module_b', title: '思维训练', icon: Brain, color: 'text-purple-600 bg-purple-100 border-purple-200',
    subModules: [
      // 1. Find Numbers
      { id: 'think_schulte', title: '舒尔特方格', category: '找数能力训练' },
      { id: 'think_linked_schulte', title: '连动舒尔特', category: '找数能力训练' },
      { id: 'think_text_find', title: '文字找茬', category: '找数能力训练' },
      // 2. Reasoning
      { id: 'think_sudoku', title: '四宫格数独', category: '推理能力训练' },
      { id: 'think_guess_num', title: '猜数字(AABB)', category: '推理能力训练' },
      { id: 'think_24point', title: '加减乘除24', category: '推理能力训练' },
      // 3. Memory
      { id: 'think_memory_instant', title: '瞬间记忆', category: '记忆能力训练' },
      { id: 'think_flash_calc', title: '闪电心算', category: '记忆能力训练' },
      // 4. Attention
      { id: 'think_stroop', title: '斯特鲁普测试', category: '注意力训练' },
      { id: 'think_shape_rot', title: '图形旋转', category: '注意力训练' },
    ]
  },
  {
    id: 'module_c', title: '数字推理', icon: List, color: 'text-green-600 bg-green-100 border-green-200',
    subModules: [
      { id: 'series_basic', title: '基础数列' },
      { id: 'series_multi', title: '多级数列' },
      { id: 'series_power', title: '幂次数列' },
      { id: 'series_recursive', title: '递推数列' },
      { id: 'series_factor', title: '因数分解' },
      { id: 'series_fraction', title: '分数数列' },
      { id: 'series_mech', title: '机械划分' },
    ]
  },
  {
    id: 'module_d', title: '资料分析', icon: BarChart3, color: 'text-orange-600 bg-orange-100 border-orange-200',
    subModules: [
      // 1. Comprehensive
      { id: 'data_comprehensive', title: '一表通算', category: '综合训练' },
      // 2. Growth
      { id: 'data_est_base', title: '估算前期量', category: '增长相关' },
      { id: 'data_est_growth', title: '估算增长量', category: '增长相关' },
      { id: 'data_pct_to_frac', title: '百化分计算', category: '增长相关' },
      { id: 'data_comp_growth_amt', title: '增量比大小', category: '增长相关' },
      { id: 'data_comp_base', title: '基期比大小', category: '增长相关' },
      { id: 'data_avg_growth_rate', title: '年均增长率', category: '增长相关' },
      // 3. Proportion
      { id: 'data_prop_calc_small', title: '分数计算(分<母)', category: '比重相关' },
      { id: 'data_prop_calc_large', title: '分数计算(分>母)', category: '比重相关' },
      { id: 'data_comp_frac', title: '分数比大小', category: '比重相关' },
      { id: 'data_base_prop', title: '基期比重', category: '比重相关' },
      { id: 'data_avg_val', title: '年平均量', category: '比重相关' },
    ]
  }
];

// --- Common Components ---

const Header: React.FC<{ title: string, onBack?: () => void }> = ({ title, onBack }) => (
  <div className="bg-white px-4 py-3 flex items-center sticky top-0 z-20 shadow-sm border-b border-gray-100">
    {onBack && (
      <button onClick={onBack} className="mr-3 p-2 hover:bg-gray-100 rounded-full active:bg-gray-200 transition-colors">
        <ArrowLeft size={20} className="text-gray-800" />
      </button>
    )}
    <h1 className="font-bold text-lg text-gray-900 flex-1 truncate">{title}</h1>
  </div>
);

const GameContainer: React.FC<{ title: string, onBack: () => void, children: React.ReactNode, footer?: React.ReactNode }> = ({ title, onBack, children, footer }) => (
  <div className="min-h-screen bg-gray-50 flex flex-col font-sans">
    <Header title={title} onBack={onBack} />
    <div className="flex-1 p-4 flex flex-col items-center w-full max-w-md mx-auto">
      {children}
    </div>
    {footer && <div className="p-4 bg-white border-t border-gray-200">{footer}</div>}
  </div>
);

const ResultModal: React.FC<{ title?: string, score?: string | number, msg?: string, onRetry: () => void, onExit: () => void }> = ({ title="挑战结束", score, msg, onRetry, onExit }) => (
  <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
    <div className="bg-white rounded-2xl p-6 w-full max-w-sm text-center shadow-2xl animate-scale-up">
      <div className="w-16 h-16 bg-yellow-100 text-yellow-600 rounded-full flex items-center justify-center mx-auto mb-4">
        <Trophy size={32} />
      </div>
      <h2 className="text-xl font-bold text-gray-900 mb-2">{title}</h2>
      {score !== undefined && <div className="text-3xl font-mono font-bold text-blue-600 mb-2">{score}</div>}
      {msg && <p className="text-gray-500 mb-6">{msg}</p>}
      <div className="grid grid-cols-2 gap-3">
        <button onClick={onExit} className="py-3 rounded-xl border border-gray-200 font-bold text-gray-600 hover:bg-gray-50">退出</button>
        <button onClick={onRetry} className="py-3 rounded-xl bg-blue-600 text-white font-bold hover:bg-blue-700">再来一次</button>
      </div>
    </div>
  </div>
);

// --- 1. Schulte Grid ---
const SchulteGame: React.FC<{ onBack: () => void }> = ({ onBack }) => {
  const [grid, setGrid] = useState<number[]>([]);
  const [nextNum, setNextNum] = useState(1);
  const [startTime, setStartTime] = useState(0);
  const [time, setTime] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [showResult, setShowResult] = useState(false);

  const init = () => {
    setGrid(Array.from({ length: 25 }, (_, i) => i + 1).sort(() => Math.random() - 0.5));
    setNextNum(1);
    setStartTime(Date.now());
    setIsPlaying(true);
    setShowResult(false);
  };

  useEffect(() => { init(); }, []);
  useEffect(() => {
    if (!isPlaying) return;
    const timer = setInterval(() => setTime((Date.now() - startTime) / 1000), 100);
    return () => clearInterval(timer);
  }, [isPlaying, startTime]);

  const handleClick = (num: number) => {
    if (num === nextNum) {
      if (num === 25) {
        setIsPlaying(false);
        setShowResult(true);
      } else {
        setNextNum(n => n + 1);
      }
    }
  };

  return (
    <GameContainer title="舒尔特方格" onBack={onBack}>
      <div className="bg-white px-6 py-2 rounded-full shadow-sm border border-blue-100 mb-8">
        <span className="text-4xl font-mono font-bold text-blue-600">{time.toFixed(1)}s</span>
      </div>
      <div className="grid grid-cols-5 gap-2 bg-white p-3 rounded-2xl shadow-lg border border-gray-200 w-full aspect-square">
        {grid.map((num) => (
          <button
            key={num}
            onClick={() => handleClick(num)}
            disabled={!isPlaying || num < nextNum}
            className={`flex items-center justify-center text-xl font-bold rounded-xl transition-all shadow-sm border
              ${num < nextNum ? 'bg-blue-50 text-blue-300 border-transparent opacity-50' : 'bg-white text-gray-900 border-gray-200 active:bg-blue-50'}`}
          >
            {num}
          </button>
        ))}
      </div>
      <div className="mt-6 text-center">
        <p className="text-gray-500 mb-1">目标：按顺序点击</p>
        <p className="text-xl font-bold text-gray-800 flex items-center justify-center gap-2">
           当前目标: <span className="text-blue-600 text-2xl">{nextNum}</span>
        </p>
      </div>
      {showResult && <ResultModal title="挑战成功" score={`${time.toFixed(2)}s`} onRetry={init} onExit={onBack} />}
    </GameContainer>
  );
};

// --- 2. Linked Schulte (Red/Blue) ---
const LinkedSchulteGame: React.FC<{ onBack: () => void }> = ({ onBack }) => {
  const [grid, setGrid] = useState<{val: number, color: 'red'|'blue'}[]>([]);
  const [step, setStep] = useState(0); // 0: Red 1, 1: Blue 1, 2: Red 2...
  const [startTime, setStartTime] = useState(0);
  const [time, setTime] = useState(0);
  const [showResult, setShowResult] = useState(false);

  const init = () => {
    const items = [];
    for(let i=1; i<=12; i++) items.push({val: i, color: 'red' as const});
    for(let i=1; i<=13; i++) items.push({val: i, color: 'blue' as const});
    setGrid(items.sort(() => Math.random() - 0.5));
    setStep(0);
    setStartTime(Date.now());
    setShowResult(false);
  };

  useEffect(() => { init(); }, []);
  useEffect(() => {
    if (showResult) return;
    const timer = setInterval(() => setTime((Date.now() - startTime) / 1000), 100);
    return () => clearInterval(timer);
  }, [showResult, startTime]);

  const targetColor = step % 2 === 0 ? 'red' : 'blue';
  const targetNum = Math.floor(step / 2) + 1;

  const handleClick = (item: {val: number, color: string}) => {
    if (item.color === targetColor && item.val === targetNum) {
      if (step === 24) setShowResult(true);
      else setStep(s => s + 1);
    }
  };

  return (
    <GameContainer title="连动舒尔特" onBack={onBack}>
      <div className="bg-white px-6 py-2 rounded-full shadow-sm border border-blue-100 mb-6">
        <span className="text-4xl font-mono font-bold text-blue-600">{time.toFixed(1)}s</span>
      </div>
      <div className="text-center mb-4">
        <span className="text-gray-500 mr-2">当前寻找:</span>
        <span className={`text-2xl font-bold ${targetColor === 'red' ? 'text-red-500' : 'text-blue-500'}`}>
          {targetColor === 'red' ? '红' : '蓝'} {targetNum}
        </span>
      </div>
      <div className="grid grid-cols-5 gap-2 bg-white p-3 rounded-2xl shadow-lg border border-gray-200 w-full aspect-square">
        {grid.map((item, idx) => {
          const isDone = (item.color === 'red' && (item.val < targetNum || (item.val === targetNum && targetColor === 'blue'))) ||
                         (item.color === 'blue' && (item.val < targetNum || (item.val === targetNum && targetColor === 'red' && step > 0))); 
          
          const itemStep = (item.val - 1) * 2 + (item.color === 'blue' ? 1 : 0);
          const done = itemStep < step;
          
          return (
            <button
              key={idx}
              onClick={() => handleClick(item)}
              className={`flex items-center justify-center text-xl font-bold rounded-xl shadow-sm border transition-all
                ${done ? 'opacity-20 bg-gray-100 text-gray-400' : 'bg-white'}
                ${item.color === 'red' ? 'text-red-600 border-red-100' : 'text-blue-600 border-blue-100'}
                hover:bg-gray-50
              `}
            >
              {item.val}
            </button>
          );
        })}
      </div>
      {showResult && <ResultModal title="挑战成功" score={`${time.toFixed(2)}s`} onRetry={init} onExit={onBack} />}
    </GameContainer>
  );
};

// --- 3. Text Find ---
const TextFindGame: React.FC<{ onBack: () => void }> = ({ onBack }) => {
  const PAIRS = [
    { target: '士', dist: '土' }, { target: '太', dist: '大' }, 
    { target: '未', dist: '末' }, { target: '白', dist: '自' },
    { target: '甲', dist: '由' }
  ];
  const [grid, setGrid] = useState<{char:string, id:number, selected: boolean}[]>([]);
  const [pair, setPair] = useState(PAIRS[0]);
  const [totalTarget, setTotalTarget] = useState(0);
  const [startTime, setStartTime] = useState(0);
  const [showResult, setShowResult] = useState(false);
  const [score, setScore] = useState({found: 0, wrong: 0});

  const init = () => {
    const p = PAIRS[Math.floor(Math.random() * PAIRS.length)];
    setPair(p);
    const count = Math.floor(Math.random() * 5) + 5; // 5-9 targets
    setTotalTarget(count);
    const items = Array(36).fill(null).map((_, i) => ({
      char: i < count ? p.target : p.dist,
      id: i,
      selected: false
    })).sort(() => Math.random() - 0.5);
    setGrid(items);
    setStartTime(Date.now());
    setShowResult(false);
  };

  useEffect(() => { init(); }, []);

  const handleSelect = (idx: number) => {
    const newGrid = [...grid];
    newGrid[idx].selected = !newGrid[idx].selected;
    setGrid(newGrid);
  };

  const submit = () => {
    let found = 0;
    let wrong = 0;
    grid.forEach(i => {
      if (i.selected) {
        if (i.char === pair.target) found++;
        else wrong++;
      }
    });
    setScore({found, wrong});
    setShowResult(true);
  };

  return (
    <GameContainer title="文字找茬" onBack={onBack} 
      footer={<button onClick={submit} className="w-full bg-blue-600 text-white py-3 rounded-xl font-bold">提交结果</button>}
    >
      <div className="text-center mb-6">
        <p className="text-gray-500 text-sm mb-1">找出所有的</p>
        <div className="text-5xl font-bold text-gray-900 border-2 border-blue-100 inline-block px-6 py-2 rounded-xl bg-white shadow-sm">
          {pair.target}
        </div>
        <p className="text-xs text-gray-400 mt-2">干扰字: {pair.dist}</p>
      </div>
      <div className="grid grid-cols-6 gap-2 bg-white p-3 rounded-2xl shadow-sm border border-gray-200">
        {grid.map((item, idx) => (
          <button key={idx} onClick={() => handleSelect(idx)}
            className={`w-10 h-10 flex items-center justify-center text-xl rounded-lg font-bold font-serif
              ${item.selected ? 'bg-blue-600 text-white shadow-md transform scale-105' : 'bg-gray-50 text-gray-800 hover:bg-gray-100'}
              transition-all duration-200
            `}
          >
            {item.char}
          </button>
        ))}
      </div>
      {showResult && (
        <ResultModal 
          title={score.found === totalTarget && score.wrong === 0 ? "完美通过" : "挑战结束"}
          msg={`找到: ${score.found}/${totalTarget}, 错选: ${score.wrong}, 用时: ${((Date.now()-startTime)/1000).toFixed(1)}s`} 
          onRetry={init} onExit={onBack} 
        />
      )}
    </GameContainer>
  );
};

// --- 4. Sudoku (4x4) ---
const SudokuGame: React.FC<{ onBack: () => void }> = ({ onBack }) => {
  const [board, setBoard] = useState<number[]>([]);
  const [initialMask, setInitialMask] = useState<boolean[]>([]);
  const [selectedInfo, setSelectedInfo] = useState<number | null>(null); // selected cell index
  const [isComplete, setIsComplete] = useState(false);

  const init = () => {
    const solution = [1,2,3,4, 3,4,1,2, 2,1,4,3, 4,3,2,1];
    const b = [...solution];
    const mask = Array(16).fill(false);
    for(let i=0; i<8; i++) { // Remove 8 cells
       let idx = Math.floor(Math.random()*16);
       b[idx] = 0;
    }
    for(let i=0; i<16; i++) mask[i] = (b[i] !== 0); 
    setBoard(b);
    setInitialMask(mask);
    setIsComplete(false);
    setSelectedInfo(null);
  };

  useEffect(() => { init(); }, []);

  const handleInput = (num: number) => {
    if (selectedInfo === null || initialMask[selectedInfo]) return;
    const newBoard = [...board];
    newBoard[selectedInfo] = num;
    setBoard(newBoard);
    
    if (!newBoard.includes(0)) {
      setIsComplete(true); 
    }
  };

  return (
    <GameContainer title="四宫格数独" onBack={onBack}>
      <div className="bg-white p-4 rounded-2xl shadow-lg border border-gray-200 mb-8">
        <div className="grid grid-cols-4 gap-1 w-64 h-64 bg-gray-800 p-1 rounded-lg">
          {board.map((val, idx) => (
            <div key={idx} onClick={() => setSelectedInfo(idx)}
              className={`bg-white flex items-center justify-center text-2xl font-bold cursor-pointer
                ${(idx % 4 === 1) ? 'border-r-2 border-gray-300' : ''} 
                ${(Math.floor(idx / 4) === 1) ? 'border-b-2 border-gray-300' : ''}
                ${initialMask[idx] ? 'text-gray-900 bg-gray-100' : 'text-blue-600'}
                ${selectedInfo === idx ? 'bg-blue-100' : ''}
              `}
            >
              {val || ''}
            </div>
          ))}
        </div>
      </div>
      <div className="grid grid-cols-4 gap-4 w-full max-w-[280px]">
        {[1,2,3,4].map(n => (
          <button key={n} onClick={() => handleInput(n)} className="h-14 bg-white border border-gray-200 rounded-xl shadow-sm text-2xl font-bold text-gray-800 active:bg-blue-50">
            {n}
          </button>
        ))}
      </div>
      <button onClick={() => handleInput(0)} className="mt-4 text-gray-500 flex items-center gap-2">
        <Delete size={18} /> 清除选中
      </button>
      {isComplete && <ResultModal title="填写完成" msg="恭喜完成数独挑战！" onRetry={init} onExit={onBack} />}
    </GameContainer>
  );
};

// --- 5. Guess Number (AABB) ---
const GuessNumberGame: React.FC<{ onBack: () => void }> = ({ onBack }) => {
  const [secret, setSecret] = useState("");
  const [guess, setGuess] = useState("");
  const [history, setHistory] = useState<{g: string, res: string}[]>([]);
  const [success, setSuccess] = useState(false);

  const init = () => {
    // Generate 4 unique digits
    const digits = [0,1,2,3,4,5,6,7,8,9].sort(()=>Math.random()-0.5);
    setSecret(digits.slice(0,4).join(''));
    setGuess("");
    setHistory([]);
    setSuccess(false);
  };

  useEffect(() => { init(); }, []);

  const submit = () => {
    if (guess.length !== 4) return;
    let A = 0, B = 0;
    for(let i=0; i<4; i++) {
      if (guess[i] === secret[i]) A++;
      else if (secret.includes(guess[i])) B++;
    }
    const res = `${A}A${B}B`;
    setHistory([{g: guess, res}, ...history]);
    setGuess("");
    if (A === 4) setSuccess(true);
  };

  return (
    <GameContainer title="猜数字 (AABB)" onBack={onBack}>
      <div className="flex-1 w-full overflow-hidden flex flex-col">
        <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-200 mb-4 flex-1 overflow-y-auto no-scrollbar">
           {history.length === 0 ? (
             <div className="text-center text-gray-400 mt-10">
               <p>规则说明：</p>
               <p className="text-xs mt-2">输入4个不重复数字</p>
               <p className="text-xs">A = 数字位置都对</p>
               <p className="text-xs">B = 数字对位置不对</p>
             </div>
           ) : (
             history.map((h, i) => (
               <div key={i} className="flex justify-between items-center border-b border-gray-50 py-2 last:border-0">
                 <span className="font-mono text-lg tracking-widest text-gray-800">{h.g}</span>
                 <span className={`font-bold font-mono ${h.res === '4A0B' ? 'text-green-600' : 'text-blue-500'}`}>{h.res}</span>
               </div>
             ))
           )}
        </div>
        <div className="mt-auto">
           <div className="flex items-center justify-center text-3xl font-mono tracking-[1em] h-16 border-b-2 border-blue-100 text-blue-600 mb-4">
             {guess.padEnd(4, '_')}
           </div>
           <div className="grid grid-cols-5 gap-2">
              {[1,2,3,4,5,6,7,8,9,0].map(n => (
                <button key={n} 
                  onClick={() => {
                    if(guess.length < 4 && !guess.includes(n.toString())) setGuess(g => g + n);
                  }}
                  disabled={guess.includes(n.toString())}
                  className="h-12 rounded-lg bg-white border border-gray-200 text-xl font-bold shadow-sm active:bg-gray-50 disabled:opacity-30"
                >
                  {n}
                </button>
              ))}
           </div>
           <div className="grid grid-cols-2 gap-3 mt-3">
             <button onClick={() => setGuess(g => g.slice(0,-1))} className="bg-gray-100 text-gray-600 rounded-lg font-bold py-3 flex items-center justify-center gap-2"><Delete size={18}/> 退格</button>
             <button onClick={submit} className="bg-blue-600 text-white rounded-lg font-bold py-3">猜!</button>
           </div>
        </div>
      </div>
      {success && <ResultModal title="猜对了！" msg={`共尝试 ${history.length} 次`} onRetry={init} onExit={onBack} />}
    </GameContainer>
  );
};

// --- 6. 24 Points ---
const Game24Point: React.FC<{ onBack: () => void }> = ({ onBack }) => {
  const [nums, setNums] = useState<number[]>([]);
  const [expr, setExpr] = useState("");
  const [usedMask, setUsedMask] = useState([false,false,false,false]); 

  const init = () => {
    const sets = [[3,8,3,8], [4,6,1,1], [5,5,5,1], [3,3,8,8], [1,2,3,4]]; 
    setNums(sets[Math.floor(Math.random()*sets.length)]);
    setExpr("");
    setUsedMask([false,false,false,false]);
  };

  useEffect(() => { init(); }, []);

  const addNum = (n: number, idx: number) => {
    if (usedMask[idx]) return;
    setExpr(e => e + n);
    const newMask = [...usedMask];
    newMask[idx] = true;
    setUsedMask(newMask);
  };

  const addOp = (op: string) => setExpr(e => e + op);
  
  const reset = () => {
    setExpr("");
    setUsedMask([false,false,false,false]);
  };

  const check = () => {
    try {
      if (!usedMask.every(b => b)) { alert("必须使用所有4个数字"); return; }
      // eslint-disable-next-line no-eval
      const res = eval(expr); 
      if (Math.abs(res - 24) < 0.001) {
        alert("成功！");
        init();
      } else {
        alert(`结果是 ${res}，不是 24。重试吧！`);
        reset();
      }
    } catch (e) {
      alert("表达式无效");
    }
  };

  return (
    <GameContainer title="加减乘除24点" onBack={onBack}>
       <div className="bg-white w-full p-6 rounded-2xl shadow-sm border border-blue-100 mb-6 text-center h-32 flex items-center justify-center">
         <span className="text-3xl font-mono font-bold text-gray-800 tracking-wider">{expr || "请点击卡片组算式"}</span>
       </div>
       
       <div className="grid grid-cols-4 gap-3 mb-6 w-full">
         {nums.map((n, i) => (
           <button key={i} onClick={() => addNum(n, i)} disabled={usedMask[i]}
             className={`aspect-[3/4] rounded-xl border-2 flex items-center justify-center text-3xl font-bold shadow-sm transition-all
               ${usedMask[i] ? 'border-dashed border-gray-300 text-gray-300 bg-gray-50' : 'bg-white border-blue-200 text-blue-800 hover:-translate-y-1'}
             `}
           >
             {n}
           </button>
         ))}
       </div>

       <div className="grid grid-cols-4 gap-3 w-full">
          {['+', '-', '*', '/', '(', ')'].map(op => (
            <button key={op} onClick={() => addOp(op)} className="h-12 bg-gray-100 rounded-lg text-xl font-bold text-gray-700 hover:bg-gray-200">
              {op === '*' ? '×' : op === '/' ? '÷' : op}
            </button>
          ))}
          <button onClick={reset} className="h-12 bg-red-50 text-red-500 rounded-lg font-bold flex items-center justify-center"><Undo size={20}/></button>
          <button onClick={check} className="h-12 bg-blue-600 text-white rounded-lg font-bold">提交</button>
       </div>
    </GameContainer>
  );
};

// --- 7. Instant Memory ---
const InstantMemoryGame: React.FC<{ onBack: () => void }> = ({ onBack }) => {
  const [phase, setPhase] = useState<'ready'|'show'|'input'|'result'>('ready');
  const [level, setLevel] = useState(3);
  const [target, setTarget] = useState("");
  const [input, setInput] = useState("");
  const [countdown, setCountdown] = useState(3);

  const startLevel = () => {
    let num = "";
    for(let i=0; i<level; i++) num += Math.floor(Math.random()*10);
    setTarget(num);
    setPhase('ready');
    setCountdown(3);
    setInput("");
  };

  useEffect(() => { startLevel(); }, []);

  useEffect(() => {
    if (phase === 'ready') {
       if (countdown > 0) setTimeout(() => setCountdown(c => c-1), 1000);
       else setPhase('show');
    } else if (phase === 'show') {
       setTimeout(() => setPhase('input'), 1000 + (level * 200)); 
    }
  }, [phase, countdown]);

  const check = () => {
    if (input === target) {
       alert("正确！下一关");
       setLevel(l => l+1);
       startLevel();
    } else {
       setPhase('result');
    }
  };

  return (
    <GameContainer title={`瞬间记忆 (Lv.${level})`} onBack={onBack}>
      <div className="flex-1 flex flex-col items-center justify-center w-full">
         {phase === 'ready' && <div className="text-6xl font-bold text-blue-500 animate-bounce">{countdown || "Go!"}</div>}
         {phase === 'show' && <div className="text-6xl font-mono font-bold text-gray-900 tracking-widest">{target}</div>}
         {phase === 'input' && (
            <div className="w-full max-w-xs text-center">
               <input type="number" value={input} onChange={e=>setInput(e.target.value)} 
                 className="w-full text-center text-3xl border-b-2 border-blue-500 outline-none py-2 mb-6 font-mono" autoFocus />
               <button onClick={check} className="w-full bg-blue-600 text-white py-3 rounded-xl font-bold">确认</button>
            </div>
         )}
         {phase === 'result' && <ResultModal title="记忆失败" msg={`正确答案: ${target}`} onRetry={() => {setLevel(3); startLevel();}} onExit={onBack} />}
      </div>
    </GameContainer>
  );
};

// --- 8. Flash Calc ---
const FlashCalcGame: React.FC<{ onBack: () => void }> = ({ onBack }) => {
  const [phase, setPhase] = useState<'ready'|'flash'|'input'>('ready');
  const [nums, setNums] = useState<number[]>([]);
  const [currentNum, setCurrentNum] = useState<number|null>(null);
  const [input, setInput] = useState("");
  const [count, setCount] = useState(3);

  const start = () => {
    const arr = Array(5).fill(0).map(() => Math.floor(Math.random()*20)+1);
    setNums(arr);
    setPhase('ready');
    setCount(3);
  };
  
  useEffect(() => { start(); }, []);

  useEffect(() => {
    if (phase === 'ready') {
      if (count > 0) setTimeout(() => setCount(c=>c-1), 1000);
      else {
        setPhase('flash');
        let i = 0;
        const interval = setInterval(() => {
           if (i < nums.length) {
             setCurrentNum(nums[i]);
             setTimeout(() => setCurrentNum(null), 400); 
             i++;
           } else {
             clearInterval(interval);
             setPhase('input');
           }
        }, 800); 
      }
    }
  }, [phase, count]);

  const check = () => {
    const sum = nums.reduce((a,b)=>a+b,0);
    if (parseInt(input) === sum) {
      alert("正确！");
      start();
    } else {
      alert(`错误，总和是 ${sum}`);
      start();
    }
  };

  return (
    <GameContainer title="闪电心算" onBack={onBack}>
       <div className="flex-1 flex items-center justify-center">
         {phase === 'ready' && <div className="text-5xl text-blue-500 font-bold">{count}</div>}
         {phase === 'flash' && currentNum !== null && <div className="text-7xl font-bold text-gray-900">{currentNum}</div>}
         {phase === 'input' && (
           <div className="w-full max-w-xs">
             <p className="text-center mb-4 text-gray-500">请输入总和</p>
             <input type="number" value={input} onChange={e=>setInput(e.target.value)} className="w-full text-4xl text-center border p-2 rounded-lg mb-4" />
             <button onClick={check} className="w-full bg-blue-600 text-white py-3 rounded-xl font-bold">提交</button>
           </div>
         )}
       </div>
    </GameContainer>
  );
};

// --- 9. Stroop Test ---
const StroopGame: React.FC<{ onBack: () => void, onFinish: () => void }> = ({ onBack }) => {
  const COLORS = [
    { name: '红', hex: 'text-red-500' },
    { name: '黄', hex: 'text-yellow-500' },
    { name: '蓝', hex: 'text-blue-500' },
    { name: '绿', hex: 'text-green-500' },
  ];
  
  const [q, setQ] = useState({ word: '', colorHex: '', correctName: '' });
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(30);
  const [active, setActive] = useState(false);

  const nextQ = () => {
    const wordIdx = Math.floor(Math.random() * 4);
    const colorIdx = Math.floor(Math.random() * 4);
    setQ({
      word: COLORS[wordIdx].name,
      colorHex: COLORS[colorIdx].hex,
      correctName: COLORS[colorIdx].name
    });
  };

  useEffect(() => {
    nextQ();
    setActive(true);
  }, []);

  useEffect(() => {
    if(active && timeLeft > 0) {
       const t = setInterval(() => setTimeLeft(l => l-1), 1000);
       return () => clearInterval(t);
    } else if (timeLeft === 0) {
       setActive(false);
    }
  }, [active, timeLeft]);

  const handleAns = (name: string) => {
    if (name === q.correctName) setScore(s => s+1);
    nextQ();
  };

  return (
    <GameContainer title="斯特鲁普测试" onBack={onBack}>
       {active ? (
         <>
           <div className="w-full flex justify-between mb-8 px-4">
             <div className="flex items-center gap-2"><Clock size={18}/> {timeLeft}s</div>
             <div className="font-bold text-blue-600">得分: {score}</div>
           </div>
           <div className="flex-1 flex flex-col items-center justify-center mb-10">
              <div className="text-gray-400 text-sm mb-4">请选择文字的<span className="font-bold text-gray-800">颜色</span></div>
              <div className={`text-8xl font-bold mb-12 ${q.colorHex}`}>
                {q.word}
              </div>
              <div className="grid grid-cols-2 gap-4 w-full">
                {COLORS.map(c => (
                  <button key={c.name} onClick={() => handleAns(c.name)} className="bg-white border-2 border-gray-100 py-4 rounded-xl text-xl font-bold text-gray-800 shadow-sm hover:border-blue-200 active:bg-gray-50">
                    {c.name}
                  </button>
                ))}
              </div>
           </div>
         </>
       ) : (
         <ResultModal title="测试结束" score={`得分: ${score}`} onRetry={()=>{setScore(0); setTimeLeft(30); setActive(true);}} onExit={onBack} />
       )}
    </GameContainer>
  );
};

// --- 10. Shape Rotation ---
const ShapeRotationGame: React.FC<{ onBack: () => void }> = ({ onBack }) => {
  const [targetRot, setTargetRot] = useState(0);
  const [options, setOptions] = useState<{rot: number, flip: boolean}[]>([]);
  const [correctIdx, setCorrectIdx] = useState(0);
  const [score, setScore] = useState(0);

  const nextQ = () => {
    const tr = Math.floor(Math.random() * 4) * 90;
    setTargetRot(tr);
    
    const opts = [];
    opts.push({ rot: Math.floor(Math.random()*4)*90, flip: false });
    for(let i=0; i<3; i++) opts.push({ rot: Math.floor(Math.random()*4)*90, flip: true });
    
    const shuffled = opts.map(value => ({ value, sort: Math.random() }))
    .sort((a, b) => a.sort - b.sort)
    .map(({ value }) => value);
    
    setOptions(shuffled);
    setCorrectIdx(shuffled.findIndex(o => !o.flip));
  };

  useEffect(nextQ, []);

  const check = (idx: number) => {
    if (idx === correctIdx) {
       setScore(s => s+1);
       nextQ();
    } else {
       alert("错误！那是镜像图形");
    }
  };

  return (
    <GameContainer title={`图形旋转 (得分: ${score})`} onBack={onBack}>
      <div className="flex-1 flex flex-col items-center justify-center w-full">
         <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-200 mb-10">
           <CornerDownLeft size={64} className="text-blue-600" style={{ transform: `rotate(${targetRot}deg)` }} />
         </div>
         <p className="mb-6 text-gray-500">找出由上图旋转得到的图形：</p>
         <div className="grid grid-cols-2 gap-4 w-full">
           {options.map((opt, i) => (
             <button key={i} onClick={() => check(i)} 
               className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm flex items-center justify-center hover:bg-gray-50 active:border-blue-400 transition-all"
             >
               <CornerDownLeft size={40} className="text-gray-800" 
                 style={{ transform: `rotate(${opt.rot}deg) ${opt.flip ? 'scaleX(-1)' : ''}` }} 
               />
             </button>
           ))}
         </div>
      </div>
    </GameContainer>
  );
};


// --- Practice Session ---

const PracticeSession: React.FC<{ subType: string, category: string, onBack: () => void }> = ({ subType, category, onBack }) => {
  const [question, setQuestion] = useState<Question | null>(null);
  const [inputVal, setInputVal] = useState("");
  const [result, setResult] = useState<'correct' | 'wrong' | null>(null);
  const [stats, setStats] = useState({ total: 0, correct: 0 });
  const [showExp, setShowExp] = useState(false);
  const [toast, setToast] = useState("");

  const loadQ = () => {
    let q: Question;
    if (category === 'calc') q = generateCalcQuestion(subType);
    else if (category === 'series') q = generateSeriesQuestion(subType);
    else if (category === 'data') q = generateDataQuestion(subType);
    else q = generateCalcQuestion(subType); 

    setQuestion(q);
    setInputVal("");
    setResult(null);
    setShowExp(false);
  };

  useEffect(() => { loadQ(); }, []);

  const saveToMistakes = (q: Question, userAns: string) => {
    const existing = localStorage.getItem('youlu_mistakes');
    const list: MistakeRecord[] = existing ? JSON.parse(existing) : [];
    const idx = list.findIndex(m => m.question.content === q.content);
    if (idx >= 0) {
      list[idx].errorCount += 1;
      list[idx].timestamp = Date.now();
      list[idx].userAnswer = userAns;
    } else {
      list.unshift({ question: q, userAnswer: userAns, timestamp: Date.now(), errorCount: 1 });
    }
    localStorage.setItem('youlu_mistakes', JSON.stringify(list));
    setToast("已加入错题本");
    setTimeout(() => setToast(""), 2000);
  };

  const submit = (val: string) => {
    if (!question) return;
    const isCorrect = val.trim() === question.correctAnswer.trim();
    
    if (isCorrect) {
        setResult('correct');
        setStats(s => ({ total: s.total + 1, correct: s.correct + 1 }));
        setTimeout(loadQ, 800);
    } else {
        setResult('wrong');
        setStats(s => ({ total: s.total + 1, correct: s.correct }));
        setShowExp(true);
        saveToMistakes(question, val);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Header title={`练习中 (${stats.correct}/${stats.total})`} onBack={onBack} />
      
      {toast && (
        <div className="fixed top-16 left-1/2 transform -translate-x-1/2 bg-gray-800 text-white px-4 py-2 rounded-full text-sm shadow-lg z-50 flex items-center gap-2 animate-fade-in">
          <BookOpen size={14} /> {toast}
        </div>
      )}

      <div className="flex-1 p-4 flex flex-col items-center w-full max-w-md mx-auto relative">
        {question && (
          <>
             {/* Data Context Panel (For One Table Calc) */}
             {question.dataContext && (
               <div className="w-full bg-indigo-50 border border-indigo-100 p-4 rounded-xl mb-4 text-sm text-indigo-900 leading-relaxed shadow-sm">
                  <div className="flex items-center gap-2 font-bold mb-2 text-indigo-800">
                    <Table size={16} /> 统计资料
                  </div>
                  <pre className="whitespace-pre-wrap font-sans">{question.dataContext}</pre>
               </div>
             )}

            {/* Question Card */}
            <div className={`w-full bg-white p-8 rounded-2xl shadow-sm border transition-all duration-300 mb-6 mt-2
                ${result === 'correct' ? 'border-green-200 bg-green-50' : result === 'wrong' ? 'border-red-200' : 'border-gray-200'}
            `}>
              <div className="text-xl font-bold text-gray-900 leading-relaxed text-center">{question.content}</div>
              {question.inputMode === 'numpad' && (
                <div className="mt-6 text-4xl font-mono text-center text-blue-600 border-b-2 border-blue-100 inline-block w-full pb-1 h-12">
                  {inputVal}
                </div>
              )}
            </div>

            {/* Explanation Panel (Shown on Error) */}
            {showExp && (
              <div className="w-full bg-white border-l-4 border-red-500 p-5 rounded-xl shadow-sm mb-6 animate-slide-up">
                <div className="flex items-start gap-3">
                    <AlertCircle className="text-red-500 shrink-0 mt-1" size={20} />
                    <div>
                        <div className="font-bold text-gray-900 text-lg mb-1">回答错误</div>
                        <div className="text-red-600 font-medium mb-2">你的答案: {inputVal || "未填"}</div>
                        <div className="text-green-700 font-bold mb-2">正确答案: {question.correctAnswer}</div>
                        <div className="text-gray-600 text-sm leading-relaxed bg-gray-50 p-3 rounded-lg">
                            <span className="font-bold text-gray-800">解析：</span>
                            {question.explanation}
                        </div>
                    </div>
                </div>
                <button onClick={loadQ} className="mt-4 w-full py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold shadow-lg active:scale-95 transition-all">
                    下一题
                </button>
              </div>
            )}

            {/* Input Area */}
            {!showExp && (
                question.inputMode === 'numpad' ? (
                    <div className="w-full max-w-[320px] mx-auto mt-auto mb-4 animate-slide-up">
                        <div className="grid grid-cols-3 gap-3">
                            {[1, 2, 3, 4, 5, 6, 7, 8, 9, '.', 0, 'Del'].map(k => (
                            <button key={k} onClick={() => k === 'Del' ? setInputVal(v => v.slice(0, -1)) : setInputVal(v => v + k)}
                                className={`h-14 rounded-xl text-2xl font-bold flex items-center justify-center shadow-[0_4px_0_#e5e7eb] active:shadow-none active:translate-y-[4px] border transition-all
                                ${k==='Del'?'bg-red-50 text-red-500 border-red-100 active:bg-red-100':'bg-white text-gray-900 border-gray-200 active:bg-gray-50'}`}>
                                {k === 'Del' ? <Delete size={22} /> : k}
                            </button>
                            ))}
                        </div>
                        <button onClick={() => submit(inputVal)} className="w-full bg-blue-600 text-white h-14 rounded-xl font-bold text-lg mt-4 shadow-lg active:scale-95 transition-transform">提交</button>
                    </div>
                ) : (
                    <div className="space-y-3 w-full animate-slide-up pb-8">
                        {question.options?.map((opt, i) => (
                            <button key={i} onClick={() => submit(opt)} 
                                className={`w-full p-5 text-left rounded-xl border-2 font-medium text-lg bg-white text-gray-800 border-gray-100 shadow-sm active:scale-[0.98] hover:border-blue-200 transition-all flex items-center`}>
                                <span className="w-8 h-8 inline-flex items-center justify-center rounded-full bg-gray-100 text-sm font-bold text-gray-500 mr-4">{String.fromCharCode(65 + i)}</span>
                                {opt}
                            </button>
                        ))}
                    </div>
                )
            )}
          </>
        )}
      </div>
    </div>
  );
};

// Mistake Book 2.0
const MistakeBook: React.FC<{ onBack: () => void }> = ({ onBack }) => {
  const [mistakes, setMistakes] = useState<MistakeRecord[]>([]);
  const [mode, setMode] = useState<'list' | 'redo'>('list');
  const [redoIndex, setRedoIndex] = useState(0);
  const [redoInput, setRedoInput] = useState("");
  const [showRedoExp, setShowRedoExp] = useState(false);

  useEffect(() => {
    const m = localStorage.getItem('youlu_mistakes');
    if (m) setMistakes(JSON.parse(m));
  }, []);

  const removeMistake = (idx: number) => {
      const newList = [...mistakes];
      newList.splice(idx, 1);
      setMistakes(newList);
      localStorage.setItem('youlu_mistakes', JSON.stringify(newList));
  };

  const handleRedoSubmit = (val: string) => {
      const currentQ = mistakes[redoIndex].question;
      if (val.trim() === currentQ.correctAnswer.trim()) {
          alert("回答正确！已从错题本移除。");
          removeMistake(redoIndex);
          setRedoInput("");
          if (mistakes.length <= 1) {
              setMode('list'); 
          } else if (redoIndex >= mistakes.length - 1) {
              setRedoIndex(0); 
          }
      } else {
          setShowRedoExp(true);
      }
  };

  const renderRedoView = () => {
      if (mistakes.length === 0) return <div className="p-10 text-center">太棒了！错题已全部消灭！</div>;
      const current = mistakes[redoIndex];
      const q = current.question;

      return (
          <div className="p-4 flex flex-col h-full">
             <div className="flex justify-between items-center mb-4">
                <span className="text-sm text-gray-500">剩余错题: {mistakes.length}</span>
                <button onClick={() => setMode('list')} className="text-sm text-blue-600">返回列表</button>
             </div>
             
             <div className="bg-white p-6 rounded-2xl shadow-sm border border-red-100 mb-6">
                 <div className="text-xl font-bold text-gray-900 text-center mb-4">{q.content}</div>
                 {q.inputMode === 'choice' ? (
                     <div className="space-y-2">
                         {q.options?.map((opt, i) => (
                             <button key={i} onClick={() => handleRedoSubmit(opt)} className="w-full p-3 border rounded-lg text-left hover:bg-gray-50 text-gray-800">
                                 {String.fromCharCode(65+i)}. {opt}
                             </button>
                         ))}
                     </div>
                 ) : (
                     <div className="flex flex-col gap-2">
                         <input type="text" value={redoInput} onChange={e=>setRedoInput(e.target.value)} className="border p-3 rounded-lg text-center text-xl text-gray-900" placeholder="输入答案" />
                         <button onClick={() => handleRedoSubmit(redoInput)} className="bg-blue-600 text-white p-3 rounded-lg">提交</button>
                     </div>
                 )}
             </div>

             {showRedoExp && (
                 <div className="bg-red-50 p-4 rounded-xl mb-4 animate-fade-in">
                     <div className="text-red-700 font-bold mb-2">还是错了...</div>
                     <div className="text-sm text-gray-700">解析: {q.explanation}</div>
                     <div className="text-sm font-bold mt-2 text-gray-900">正确答案: {q.correctAnswer}</div>
                     <button onClick={() => {setShowRedoExp(false); setRedoIndex((redoIndex+1)%mistakes.length); setRedoInput("");}} className="mt-3 w-full bg-white border border-red-200 text-red-600 py-2 rounded-lg">暂时跳过</button>
                 </div>
             )}
          </div>
      );
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header title={mode === 'list' ? "错题本" : "消灭错题模式"} onBack={onBack} />
      
      {mode === 'redo' ? renderRedoView() : (
          <div className="p-4 space-y-3 pb-20">
            {mistakes.length > 0 && (
                <button onClick={() => setMode('redo')} className="w-full bg-red-600 text-white p-3 rounded-xl shadow-md font-bold flex items-center justify-center gap-2 mb-4">
                    <Zap size={20} fill="currentColor" /> 开始刷错题 ({mistakes.length})
                </button>
            )}

            {mistakes.length === 0 ? (
                <div className="text-center text-gray-400 mt-20 flex flex-col items-center">
                    <CheckCircle2 size={48} className="mb-2 text-green-500" />
                    <div>暂无错题</div>
                    <div className="text-xs mt-1">继续保持！</div>
                </div>
            ) : mistakes.map((m, i) => (
                <div key={i} className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm relative overflow-hidden">
                  <div className="absolute top-0 left-0 w-1 h-full bg-red-500"></div>
                  <div className="pl-3">
                      <div className="font-bold text-gray-900 mb-2 text-lg">{m.question.content}</div>
                      <div className="flex items-center gap-4 text-sm mb-2">
                          <span className="text-red-500 flex items-center gap-1"><XCircle size={14}/> 误选: {m.userAnswer}</span>
                          <span className="text-green-600 flex items-center gap-1"><CheckCircle2 size={14}/> 正解: {m.question.correctAnswer}</span>
                      </div>
                      <div className="bg-gray-50 p-2 rounded text-xs text-gray-600 leading-relaxed">
                          <span className="font-bold">解析：</span>{m.question.explanation || "暂无解析"}
                      </div>
                      <div className="mt-3 flex justify-between items-center">
                          <span className="text-xs text-gray-400">错误次数: {m.errorCount}</span>
                          <button onClick={() => {setRedoIndex(i); setMode('redo');}} className="px-3 py-1 bg-blue-50 text-blue-600 rounded-lg text-xs font-bold">
                              重做
                          </button>
                      </div>
                  </div>
                </div>
              ))}
          </div>
      )}
    </div>
  );
};

export default function App() {
  const [view, setView] = useState<AppView>(AppView.HOME);
  const [activeModuleId, setActiveModuleId] = useState<string>('');
  const [activeSubType, setActiveSubType] = useState<string>('');
  const [showLeadModal, setShowLeadModal] = useState(false);
  
  const goHome = () => setView(AppView.HOME);
  const enterModule = (id: string) => {
    if (id === 'module_a') setView(AppView.MENU_CALC);
    else if (id === 'module_b') setView(AppView.MENU_THINKING);
    else if (id === 'module_c') setView(AppView.MENU_SERIES);
    else if (id === 'module_d') setView(AppView.MENU_DATA);
  };

  const startPractice = (subTypeId: string, category: 'calc'|'series'|'data'|'thinking') => {
    setActiveSubType(subTypeId);
    if (category === 'thinking') {
       const map: Record<string, AppView> = {
         'think_schulte': AppView.GAME_SCHULTE, 'think_linked_schulte': AppView.GAME_LINKED_SCHULTE,
         'think_text_find': AppView.GAME_TEXT_FIND, 'think_sudoku': AppView.GAME_SUDOKU,
         'think_guess_num': AppView.GAME_GUESS_NUMBER, 'think_24point': AppView.GAME_24_POINT,
         'think_memory_instant': AppView.GAME_INSTANT_MEMORY, 'think_flash_calc': AppView.GAME_FLASH_CALC,
         'think_stroop': AppView.GAME_STROOP, 'think_shape_rot': AppView.GAME_SHAPE_ROTATION
       };
       setView(map[subTypeId] || AppView.HOME);
    } else {
      setActiveModuleId(category); 
      setView(AppView.PRACTICE_SESSION);
    }
  };

  const goBackFromPractice = () => {
    switch (activeModuleId) {
      case 'calc': setView(AppView.MENU_CALC); break;
      case 'series': setView(AppView.MENU_SERIES); break;
      case 'data': setView(AppView.MENU_DATA); break;
      case 'thinking': setView(AppView.MENU_THINKING); break;
      default: setView(AppView.HOME);
    }
  };

  const goBackFromThinking = () => setView(AppView.MENU_THINKING);

  const ModuleMenu = ({ config, cat }: { config: ModuleConfig, cat: any }) => {
    const grouped = config.subModules.reduce((acc, curr) => {
      const k = curr.category || '全部练习';
      if(!acc[k]) acc[k] = [];
      acc[k].push(curr);
      return acc;
    }, {} as Record<string, typeof config.subModules>);

    return (
      <div className="min-h-screen bg-gray-50 pb-10">
        <Header title={config.title} onBack={goHome} />
        <div className="p-4 space-y-6">
          {Object.keys(grouped).map(groupKey => (
             <div key={groupKey}>
                {groupKey !== '全部练习' && (
                  <div className="flex items-center gap-2 mb-3 ml-1">
                    <div className={`w-1 h-4 rounded-full ${config.color.split(' ')[0].replace('text-','bg-')}`}></div>
                    <h3 className="font-bold text-gray-700 text-sm">{groupKey}</h3>
                  </div>
                )}
                <div className="grid grid-cols-2 gap-3">
                  {grouped[groupKey].map(sub => (
                    <button 
                      key={sub.id}
                      onClick={() => startPractice(sub.id, cat)}
                      className={`bg-white p-4 rounded-xl shadow-sm border border-gray-200 flex flex-col items-center justify-center text-center h-24 active:scale-[0.98] transition-all active:bg-gray-50 hover:border-blue-200 relative overflow-hidden group`}
                    >
                      <div className={`absolute top-0 left-0 w-full h-1 ${config.color.split(' ')[1]}`}></div>
                      <span className={`font-bold text-base text-gray-800 group-hover:text-blue-600 transition-colors`}>{sub.title}</span>
                    </button>
                  ))}
                </div>
             </div>
          ))}
        </div>
      </div>
    );
  };

  const Dashboard = () => (
    <div className="min-h-screen bg-gray-50 pb-24">
      <div className="bg-gradient-to-br from-red-700 to-red-600 pt-8 pb-10 px-6 rounded-b-[2.5rem] shadow-lg relative overflow-hidden">
        <div className="absolute top-[-20%] right-[-10%] w-48 h-48 bg-white/10 rounded-full blur-2xl"></div>
        <div className="absolute bottom-[10%] left-[-10%] w-32 h-32 bg-white/10 rounded-full blur-xl"></div>
        
        <div className="relative z-10 flex justify-between items-center mb-8">
           <div>
             <h1 className="text-2xl font-bold text-white tracking-wide">优路速通</h1>
             <p className="text-red-100 text-xs opacity-90 mt-1 font-medium tracking-wider">公考上岸 · 每日必练</p>
           </div>
           <div className="bg-white/20 p-2.5 rounded-full backdrop-blur-md border border-white/20 shadow-lg">
              <User className="text-white" size={22} />
           </div>
        </div>
        <div className="grid grid-cols-3 gap-4">
           <div className="bg-white/10 backdrop-blur-md rounded-2xl p-3 text-center border border-white/10 shadow-inner">
              <div className="text-2xl font-bold text-white font-mono">12</div>
              <div className="text-[10px] text-red-100 mt-1 uppercase tracking-wide">坚持天数</div>
           </div>
           <div className="bg-white/10 backdrop-blur-md rounded-2xl p-3 text-center border border-white/10 shadow-inner">
              <div className="text-2xl font-bold text-white font-mono">185</div>
              <div className="text-[10px] text-red-100 mt-1 uppercase tracking-wide">刷题总数</div>
           </div>
           <div className="bg-white/10 backdrop-blur-md rounded-2xl p-3 text-center border border-white/10 shadow-inner">
              <div className="text-2xl font-bold text-white font-mono">85%</div>
              <div className="text-[10px] text-red-100 mt-1 uppercase tracking-wide">正确率</div>
           </div>
        </div>
      </div>

      <div className="px-5 -mt-6 relative z-10 space-y-8">
         <div className="grid grid-cols-2 gap-4">
            {MODULES.map(m => (
              <button 
                key={m.id} 
                onClick={() => enterModule(m.id)} 
                className="bg-white p-5 rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-gray-100 flex flex-col items-center justify-center gap-3 transition-all active:scale-95 hover:shadow-md"
              >
                 <div className={`w-14 h-14 rounded-2xl flex items-center justify-center ${m.color} shadow-sm`}>
                    <m.icon size={28} strokeWidth={2.5} />
                 </div>
                 <div className="text-center">
                    <div className="font-bold text-gray-800 text-base">{m.title}</div>
                    <div className="text-xs text-gray-400 mt-0.5 font-medium">{m.subModules.length} 个专项</div>
                 </div>
              </button>
            ))}
         </div>

         <div>
           <h3 className="font-bold text-gray-800 mb-4 px-1 text-sm flex items-center gap-2">
             <Zap size={16} className="text-yellow-500 fill-yellow-500" /> 每日必练
           </h3>
           <div className="grid grid-cols-2 gap-4">
              <button onClick={() => setView(AppView.DAILY_10)} className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 flex items-center gap-3 active:bg-gray-50 transition-colors group">
                 <div className="w-12 h-12 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center group-hover:scale-110 transition-transform">
                   <Calendar size={22} />
                 </div>
                 <div className="text-left">
                   <div className="font-bold text-gray-800 text-sm">每日10题</div>
                   <div className="text-xs text-gray-400 mt-0.5">混合题型训练</div>
                 </div>
              </button>
              <button onClick={() => setView(AppView.MISTAKE_BOOK)} className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 flex items-center gap-3 active:bg-gray-50 transition-colors group">
                 <div className="w-12 h-12 rounded-xl bg-red-50 text-red-500 flex items-center justify-center group-hover:scale-110 transition-transform">
                   <BookOpen size={22} />
                 </div>
                 <div className="text-left">
                   <div className="font-bold text-gray-800 text-sm">错题本</div>
                   <div className="text-xs text-gray-400 mt-0.5">攻克薄弱点</div>
                 </div>
              </button>
           </div>
         </div>
         
         <div className="bg-gradient-to-r from-gray-900 via-gray-800 to-gray-900 rounded-2xl p-1 shadow-xl cursor-pointer transform hover:scale-[1.02] transition-transform" onClick={() => setShowLeadModal(true)}>
            <div className="bg-gray-800/50 rounded-xl p-4 flex items-center justify-between backdrop-blur-sm border border-white/5">
              <div>
                 <h4 className="font-bold text-base mb-1 flex items-center gap-2 text-white">
                   <Crown size={18} className="text-yellow-400 fill-yellow-400" />
                   VIP 尊享服务
                 </h4>
                 <p className="text-xs text-gray-400 font-medium">解锁名师视频解析 & 考前预测卷</p>
              </div>
              <div className="bg-white text-gray-900 px-4 py-2 rounded-lg text-xs font-bold shadow-lg">立即开通</div>
            </div>
         </div>
      </div>
    </div>
  );

  const renderContent = () => {
    switch (view) {
      case AppView.HOME: return <Dashboard />;
      case AppView.MENU_CALC: return <ModuleMenu config={MODULES[0]} cat="calc" />;
      case AppView.MENU_THINKING: return <ModuleMenu config={MODULES[1]} cat="thinking" />;
      case AppView.MENU_SERIES: return <ModuleMenu config={MODULES[2]} cat="series" />;
      case AppView.MENU_DATA: return <ModuleMenu config={MODULES[3]} cat="data" />;
      
      case AppView.PRACTICE_SESSION: return <PracticeSession subType={activeSubType} category={activeModuleId} onBack={goBackFromPractice} />;
      
      case AppView.GAME_SCHULTE: return <SchulteGame onBack={goBackFromThinking} />;
      case AppView.GAME_LINKED_SCHULTE: return <LinkedSchulteGame onBack={goBackFromThinking} />;
      case AppView.GAME_TEXT_FIND: return <TextFindGame onBack={goBackFromThinking} />;
      case AppView.GAME_SUDOKU: return <SudokuGame onBack={goBackFromThinking} />;
      case AppView.GAME_GUESS_NUMBER: return <GuessNumberGame onBack={goBackFromThinking} />;
      case AppView.GAME_24_POINT: return <Game24Point onBack={goBackFromThinking} />;
      case AppView.GAME_INSTANT_MEMORY: return <InstantMemoryGame onBack={goBackFromThinking} />;
      case AppView.GAME_FLASH_CALC: return <FlashCalcGame onBack={goBackFromThinking} />;
      case AppView.GAME_STROOP: return <StroopGame onFinish={goBackFromThinking} onBack={goBackFromThinking} />;
      case AppView.GAME_SHAPE_ROTATION: return <ShapeRotationGame onBack={goBackFromThinking} />;
      
      case AppView.MISTAKE_BOOK: return <MistakeBook onBack={goHome} />;
      case AppView.DAILY_10: return <PracticeSession subType="calc_multi_add" category="calc" onBack={goHome} />;
      
      default: return <Dashboard />;
    }
  };

  return (
    <div className="max-w-md mx-auto bg-white min-h-screen shadow-2xl relative font-sans overflow-hidden border-x border-gray-100">
      {renderContent()}
      <LeadGenModal isOpen={showLeadModal} onClose={() => setShowLeadModal(false)} />
    </div>
  );
}
