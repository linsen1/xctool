
import { Question } from "../types";

// --- Helper Functions ---
const rand = (min: number, max: number) => Math.floor(Math.random() * (max - min + 1)) + min;
const randFloat = (min: number, max: number, fixed: number = 1) => parseFloat((Math.random() * (max - min) + min).toFixed(fixed));
const randItem = <T>(arr: T[]): T => arr[Math.floor(Math.random() * arr.length)];

// Smart Distractor Generator
const generateDistractors = (correct: number, type: 'int' | 'float' | 'percent' = 'int'): string[] => {
  const options = new Set<string>();
  const correctStr = type === 'percent' ? `${correct.toFixed(1)}%` : (type === 'float' ? correct.toFixed(1) : Math.round(correct).toString());
  options.add(correctStr);

  let attempts = 0;
  while (options.size < 4 && attempts < 20) {
    let val = 0;
    const mode = Math.random();
    
    if (mode < 0.3) {
      // Small Error: +/- 1 to 5
      val = correct + (rand(1, 5) * (Math.random() > 0.5 ? 1 : -1));
    } else if (mode < 0.5) {
      // Magnitude/Decimal Error
      val = Math.random() > 0.5 ? correct * 10 : correct / 10;
    } else if (mode < 0.7) {
      // Percentage error (e.g. 10% off)
      val = correct * (1 + (rand(5, 15) / 100) * (Math.random() > 0.5 ? 1 : -1));
    } else {
      // Random neighbor range
      val = correct + rand(10, 50) * (Math.random() > 0.5 ? 1 : -1);
    }

    // Format
    let valStr = "";
    if (type === 'int') valStr = Math.round(val).toString();
    else if (type === 'float') valStr = val.toFixed(1);
    else if (type === 'percent') valStr = `${val.toFixed(1)}%`;

    if (valStr !== correctStr && !options.has(valStr) && val > 0) {
      options.add(valStr);
    }
    attempts++;
  }
  
  // Fallback
  while (options.size < 4) {
     const r = correct * (1 + (Math.random() - 0.5));
     const s = type === 'percent' ? `${r.toFixed(1)}%` : Math.round(r).toString();
     if (!options.has(s)) options.add(s);
  }

  return Array.from(options).sort(() => Math.random() - 0.5);
};

// --- Module A: Calculation ---
export const generateCalcQuestion = (subType: string): Question => {
  let content = "";
  let answer = "";
  let inputMode: 'numpad' | 'choice' = 'numpad';
  let explanation = "细心计算，注意进位退位。";

  switch (subType) {
    case 'calc_2digit_add': 
      const a1 = rand(15, 85); const b1 = rand(15, 99 - a1);
      content = `${a1} + ${b1} = ?`; answer = (a1 + b1).toString();
      break;
    case 'calc_3digit_add':
      const aa = rand(100, 800); const bb = rand(100, 999 - aa);
      content = `${aa} + ${bb} = ?`; answer = (aa + bb).toString();
      break;
    case 'calc_3digit_sub':
      const sub1 = rand(500, 999); const sub2 = rand(100, sub1 - 50);
      content = `${sub1} - ${sub2} = ?`; answer = (sub1 - sub2).toString();
      break;
    case 'calc_multi_add':
      const m1 = rand(11, 49), m2 = rand(11, 49), m3 = rand(11, 49), m4 = rand(11, 49);
      content = `${m1} + ${m2} + ${m3} + ${m4} = ?`; answer = (m1 + m2 + m3 + m4).toString();
      break;
    case 'calc_mul_2x1': 
      const mu1 = rand(10, 99), mu2 = rand(2, 9);
      content = `${mu1} × ${mu2} = ?`; answer = (mu1 * mu2).toString();
      break;
    case 'calc_mul_3x1': 
      const mu3 = rand(100, 999), mu4 = rand(2, 9);
      content = `${mu3} × ${mu4} = ?`; answer = (mu3 * mu4).toString();
      break;
    case 'calc_mul_2x11':
      const m11 = rand(11, 88);
      content = `${m11} × 11 = ?`; answer = (m11 * 11).toString();
      explanation = "两边一拉，中间相加。";
      break;
    case 'calc_mul_2x15':
      const m15 = rand(12, 88); const eM15 = m15 % 2 === 0 ? m15 : m15 + 1;
      content = `${eM15} × 15 = ?`; answer = (eM15 * 15).toString();
      explanation = "加一半，再乘10。";
      break;
    case 'calc_mul_2x2':
      const mm1 = rand(11, 99), mm2 = rand(11, 19);
      content = `${mm1} × ${mm2} = ?`; answer = (mm1 * mm2).toString();
      break;
    case 'calc_mul_3x2':
       const mm3 = rand(101, 999), mm4 = rand(11, 99);
       content = `${mm3} × ${mm4} = ?`; answer = (mm3 * mm4).toString();
       break;
    case 'calc_square':
      const sqBase = rand(11, 25);
      content = `${sqBase}² = ?`; answer = (sqBase * sqBase).toString();
      break;
    case 'calc_est_mul':
      const v1 = rand(300, 900), v2 = rand(11, 99);
      content = `${v1} × ${v2} ≈ ?`; answer = (Math.round((v1*v2)/100)*100).toString();
      inputMode = 'choice';
      break;
    case 'calc_div_3d1':
      const d3 = rand(100, 999), d1 = rand(2, 9);
      content = `${d3} ÷ ${d1} ≈ ?`; answer = Math.round(d3/d1).toString(); inputMode = 'choice';
      break;
    case 'calc_div_3d2':
      const d32 = rand(100, 999), d22 = rand(11, 99);
      content = `${d32} ÷ ${d22} ≈ ?`; answer = Math.round(d32/d22).toString(); inputMode = 'choice';
      break;
    case 'calc_div_5d3':
       const d5 = rand(10000, 99999), d3d = rand(100, 999);
       content = `${d5} ÷ ${d3d} ≈ ?`; answer = Math.round(d5/d3d).toString(); inputMode = 'choice';
       break;
    case 'calc_div_3d4':
      const B = rand(2000, 9000), A = Math.floor(B * (rand(10, 80) / 100));
      content = `${A} ÷ ${B} ≈ ?`; answer = ((A / B) * 100).toFixed(1) + "%"; inputMode = 'choice';
      break;
    default: 
      content = "1 + 1 = ?"; answer = "2";
  }

  const q: Question = {
    id: `calc-${Date.now()}-${Math.random()}`,
    type: 'calc',
    subType,
    content,
    correctAnswer: answer,
    inputMode,
    explanation
  };

  if (inputMode === 'choice') {
    const numAns = parseFloat(answer.replace('%',''));
    q.options = generateDistractors(numAns, answer.includes('%') ? 'percent' : 'int');
  }
  return q;
};

// --- Module C: Series ---
export const generateSeriesQuestion = (subType: string): Question => {
  let seq: number[] = [];
  let rule = "";
  let nextVal = 0;

  switch (subType) {
    case 'series_basic':
      const d = rand(2, 9), s = rand(1, 10);
      seq = [0,1,2,3,4,5].map(i => s + i*d); rule = `公差为 ${d}`;
      break;
    case 'series_multi':
      const start = rand(2,10), d1 = rand(1,5), dd = rand(2,4);
      seq = [start]; let c = d1;
      for(let i=0; i<5; i++) { seq.push(seq[seq.length-1]+c); c+=dd; }
      rule = `二级等差，公差 ${dd}`;
      break;
    case 'series_power':
      const base = rand(2,5), shift = rand(1,2)*(Math.random()>0.5?1:-1);
      for(let i=0; i<6; i++) seq.push((base+i)**2 + shift);
      rule = `n² ${shift>0?'+':''} ${Math.abs(shift)}`;
      break;
    case 'series_recursive':
      const r1 = rand(1,4), r2 = rand(1,4);
      seq = [r1, r2];
      for(let i=0; i<4; i++) seq.push(seq[seq.length-1] + seq[seq.length-2]);
      rule = "前两项之和";
      break;
    case 'series_factor':
      const f = rand(1,5);
      for(let i=0; i<6; i++) seq.push((f+i)*(f+i+1));
      rule = "N × (N+1)";
      break;
    case 'series_mech':
      const m = rand(1,5);
      for(let i=0; i<6; i++) seq.push((m+i)*10 + (m+i+1));
      rule = "机械划分";
      break;
    case 'series_fraction':
       // Special case for fraction rendering
       return {
         id: `series-frac-${Date.now()}`, type: 'series', subType,
         content: "1/2, 3/5, 8/13, 21/34, ( )", correctAnswer: "55/89", inputMode: 'choice',
         explanation: "分子分母分别递推", options: ["55/89", "34/55", "45/78", "50/80"]
       };
    default: 
      seq = [1,2,3,4,5,6]; rule="递增";
  }

  const content = `${seq.slice(0,5).join(', ')}, ( )`;
  nextVal = seq[5];
  
  return {
    id: `series-${Date.now()}-${Math.random()}`,
    type: 'series',
    subType,
    content,
    correctAnswer: nextVal.toString(),
    inputMode: 'choice',
    explanation: rule,
    options: generateDistractors(nextVal, 'int')
  };
};

// --- Module D: Data Analysis (Real Scenario Engine) ---

// Real-world topics for variation
const TOPICS = [
  { name: "国内生产总值", unit: "亿元" },
  { name: "社会消费品零售总额", unit: "亿元" },
  { name: "货物进出口总额", unit: "亿美元" },
  { name: "全国夏粮产量", unit: "万吨" },
  { name: "一般公共预算收入", unit: "亿元" },
  { name: "高技术制造业增加值", unit: "亿元" },
  { name: "软件业务收入", unit: "亿元" },
  { name: "餐饮收入", unit: "亿元" },
  { name: "房地产开发投资", unit: "亿元" },
  { name: "网上零售额", unit: "亿元" }
];

const YEARS = [2023, 2024, 2022, 2021];

// Template Helper
const formatQ = (templates: string[], data: any) => {
  const t = randItem(templates);
  return t.replace(/{(\w+)}/g, (_, k) => data[k]);
};

export const generateDataQuestion = (subType: string): Question => {
  const topic = randItem(TOPICS);
  const year = randItem(YEARS);
  const prevYear = year - 1;
  
  // Realistic large numbers
  const currentVal = randFloat(2000, 90000, 1); 
  const rate = randFloat(0.02, 0.18, 3); 
  const rateStr = (rate * 100).toFixed(1) + "%";
  const prevVal = currentVal / (1 + rate);
  const growthAmt = currentVal - prevVal;

  let content = "";
  let answer = "";
  let explanation = "";
  let options: string[] = [];
  let dataContext = "";

  if (subType === 'data_comprehensive') {
    const t1 = randItem(TOPICS);
    const t2 = randItem(TOPICS.filter(t => t.name !== t1.name));
    const v1 = randFloat(10000, 50000, 1); const r1 = randFloat(0.04, 0.12, 3);
    const v2 = randFloat(5000, 30000, 1); const r2 = randFloat(0.05, 0.15, 3);
    
    dataContext = `${year}年统计公报显示：\n全年${t1.name} ${v1}${t1.unit}，比上年增长 ${(r1*100).toFixed(1)}%；\n${t2.name} ${v2}${t2.unit}，同比增长 ${(r2*100).toFixed(1)}%。`;
    
    if (Math.random() < 0.5) {
      const tmpls = [
        `求 ${year}年 ${t1.name} 的同比增量约是多少？`,
        `计算 ${t1.name} 较上年增加了多少${t1.unit}？`,
        `${year}年 ${t1.name} 的增长量约为？`
      ];
      content = randItem(tmpls);
      answer = Math.round(v1 * (r1 / (1+r1))).toString();
      explanation = `增量 = 现期 × 增长率 / (1+增长率)\n${v1} × ${(r1*100).toFixed(1)}% / (1+${(r1*100).toFixed(1)}%) ≈ ${answer}`;
    } else {
      const tmpls = [
        `求 ${prevYear}年 ${t2.name} 约为多少${t2.unit}？`,
        `计算 ${year}年 ${t2.name} 的基期值。`,
        `若保持增速，${prevYear}年的 ${t2.name} 是多少？`
      ];
      content = randItem(tmpls);
      answer = Math.round(v2 / (1+r2)).toString();
      explanation = `基期 = 现期 / (1+增长率)\n${v2} / 1.${Math.round(r2*100)} ≈ ${answer}`;
    }
    options = generateDistractors(parseFloat(answer), 'int');

  } else if (subType === 'data_est_base') {
    const g = Math.round(growthAmt);
    const tmpls = [
      `${year}年${topic.name}比上年增长了${g}${topic.unit}，增幅为${rateStr}。求${prevYear}年的数值？`,
      `已知${year}年${topic.name}的同比增量为${g}${topic.unit}，增速${rateStr}。计算基期值。`,
      `若${topic.name}同比增长${g}${topic.unit} (增速${rateStr})，则上年数值约为？`
    ];
    content = randItem(tmpls);
    const base = g / rate;
    answer = Math.round(base).toString();
    explanation = `基期 = 增量 / 增长率 = ${g} / ${rateStr} ≈ ${answer}`;
    options = generateDistractors(base, 'int');

  } else if (subType === 'data_est_growth') {
    const base = Math.round(prevVal);
    const tmpls = [
      `${prevYear}年${topic.name}为${base}${topic.unit}，${year}年增长了${rateStr}。求增量？`,
      `已知基期数值${base}${topic.unit}，同比增长${rateStr}。增长量约为多少？`,
      `若${prevYear}年数据为${base}，增速${rateStr}，则${year}年增加了多少？`
    ];
    content = randItem(tmpls);
    const amt = base * rate;
    answer = Math.round(amt).toString();
    explanation = `增量 = 基期 × 增长率 = ${base} × ${rateStr} ≈ ${answer}`;
    options = generateDistractors(amt, 'int');

  } else if (subType === 'data_pct_to_frac') {
    const pairs = [
      {p:"14.3%", f:"1/7"}, {p:"16.7%", f:"1/6"}, {p:"12.5%", f:"1/8"}, {p:"11.1%", f:"1/9"},
      {p:"9.1%", f:"1/11"}, {p:"5.9%", f:"1/17"}, {p:"5.3%", f:"1/19"}, {p:"33.3%", f:"1/3"},
      {p:"25.0%", f:"1/4"}, {p:"20.0%", f:"1/5"}
    ];
    const item = randItem(pairs);
    content = `在资料分析计算中，${item.p} 最接近的分数是？`;
    answer = item.f;
    explanation = "高频特征分数，建议背诵。";
    options = [item.f, "1/6", "1/7", "1/8", "1/9", "1/12"].filter(x=>x!==item.f).slice(0,3);
    options.push(item.f);
    options.sort(()=>Math.random()-0.5);

  } else if (subType === 'data_comp_growth_amt') {
    const tA = randItem(TOPICS);
    const tB = randItem(TOPICS.filter(t => t.name !== tA.name));
    const A_base = rand(2000, 8000); const A_r = randFloat(0.05, 0.2, 2);
    const B_base = rand(2000, 8000); const B_r = randFloat(0.05, 0.2, 2);
    
    content = `比较增量大小：\n${tA.name}: 基期${A_base}, 增速${(A_r*100).toFixed(0)}%\n${tB.name}: 基期${B_base}, 增速${(B_r*100).toFixed(0)}%`;
    const A_g = A_base * A_r;
    const B_g = B_base * B_r;
    answer = A_g > B_g ? `${tA.name.substr(0,2)} > ${tB.name.substr(0,2)}` : (A_g < B_g ? `${tB.name.substr(0,2)} > ${tA.name.substr(0,2)}` : "相等");
    explanation = `${tA.name}增≈${Math.round(A_g)}, ${tB.name}增≈${Math.round(B_g)}`;
    options = [`${tA.name.substr(0,2)} > ${tB.name.substr(0,2)}`, `${tB.name.substr(0,2)} > ${tA.name.substr(0,2)}`, "相等", "无法判断"];

  } else if (subType === 'data_comp_base') {
    const tA = randItem(TOPICS);
    const tB = randItem(TOPICS.filter(t => t.name !== tA.name));
    const A_cur = rand(3000, 9000); const A_r = randFloat(0.05, 0.25, 2);
    const B_cur = rand(3000, 9000); const B_r = randFloat(0.05, 0.25, 2);
    
    content = `比较${prevYear}年基期值：\n${tA.name}: 现期${A_cur}, 增速${(A_r*100).toFixed(0)}%\n${tB.name}: 现期${B_cur}, 增速${(B_r*100).toFixed(0)}%`;
    const A_base = A_cur / (1+A_r);
    const B_base = B_cur / (1+B_r);
    answer = A_base > B_base ? `${tA.name.substr(0,2)} > ${tB.name.substr(0,2)}` : (A_base < B_base ? `${tB.name.substr(0,2)} > ${tA.name.substr(0,2)}` : "相等");
    explanation = `${tA.name}基≈${Math.round(A_base)}, ${tB.name}基≈${Math.round(B_base)}`;
    options = [`${tA.name.substr(0,2)} > ${tB.name.substr(0,2)}`, `${tB.name.substr(0,2)} > ${tA.name.substr(0,2)}`, "相等", "无法判断"];

  } else if (subType === 'data_avg_growth_rate') {
    const start = rand(100, 200);
    const n = rand(2, 3); // n years
    const r_hidden = randFloat(0.05, 0.25, 2);
    const end = Math.round(start * Math.pow(1+r_hidden, n));
    const startYear = year - n;
    
    const tmpls = [
      `${startYear}年产值为${start}，${year}年达到${end}。这${n}年的年均增长率约为？`,
      `某指标从${startYear}年的${start}增加到${year}年的${end}，年均增速是多少？`
    ];
    content = randItem(tmpls);
    answer = (r_hidden*100).toFixed(0) + "%";
    explanation = `(1+r)^${n} = ${end}/${start} ≈ ${(end/start).toFixed(2)}，反推得 r ≈ ${answer}`;
    
    const o1 = (r_hidden*100).toFixed(0)+"%";
    const o2 = ((r_hidden-0.05)*100).toFixed(0)+"%";
    const o3 = ((r_hidden+0.05)*100).toFixed(0)+"%";
    const o4 = ((r_hidden+0.1)*100).toFixed(0)+"%";
    options = [o1, o2, o3, o4].sort();

  } else if (subType === 'data_prop_calc_small') {
    const A = rand(300, 900); const B = rand(3000, 9000);
    const t = randItem(TOPICS);
    const tmpls = [
      `${year}年${t.name}中，某细分领域收入为${A}${t.unit}，总量为${B}${t.unit}。该领域占比为？`,
      `已知${t.name}总量${B}，其中出口${A}。出口占总量的比重是多少？`
    ];
    content = randItem(tmpls);
    const res = (A/B)*100;
    answer = res.toFixed(1) + "%";
    explanation = `比重 = 部分/整体 = ${A}/${B} ≈ ${answer}`;
    options = generateDistractors(res, 'percent');

  } else if (subType === 'data_prop_calc_large') {
    const A = rand(5000, 9000); const B = rand(200, 800);
    content = `产值A=${A} 是 产值B=${B} 的多少倍？`;
    const res = A/B;
    answer = res.toFixed(1);
    explanation = `${A}/${B} ≈ ${answer}`;
    options = generateDistractors(res, 'float');

  } else if (subType === 'data_base_prop') {
    const curProp = randFloat(15, 45, 1); 
    const r_p = randFloat(0.05, 0.2, 2);
    const r_t = randFloat(0.05, 0.2, 2);
    const t = randItem(TOPICS);
    
    content = `${year}年${t.name}中某部分占比${curProp}%。已知该部分增速${(r_p*100).toFixed(0)}%，整体增速${(r_t*100).toFixed(0)}%。求${prevYear}年的比重？`;
    const baseProp = curProp * ((1+r_t)/(1+r_p));
    answer = baseProp.toFixed(1) + "%";
    explanation = `基期比重 = 现期比重 × (1+整体增)/(1+部分增)\n${curProp} × (1+${r_t})/(1+${r_p}) ≈ ${answer}`;
    options = generateDistractors(baseProp, 'percent');
  
  } else if (subType === 'data_comp_frac') {
    const A1 = rand(1000, 9000), B1 = rand(10000, 50000);
    const A2 = rand(1000, 9000), B2 = rand(10000, 50000);
    content = `比较分数值大小：\nA: ${A1}/${B1}\nB: ${A2}/${B2}`;
    const v1 = A1/B1, v2 = A2/B2;
    answer = v1 > v2 ? "A > B" : "B > A";
    explanation = `A≈${v1.toFixed(3)}, B≈${v2.toFixed(3)} (建议用直除法或差分法)`;
    options = ["A > B", "B > A", "A = B", "无法判断"];

  } else {
    const total = rand(2000, 8000);
    const n = rand(5, 12);
    content = `某项目${n}年累计投资${total}亿元。年均投资额约为？`;
    const avg = total/n;
    answer = Math.round(avg).toString();
    explanation = `平均 = 总量 / 年份数 = ${total} / ${n} = ${answer}`;
    options = generateDistractors(avg, 'int');
  }

  return {
    id: `data-${Date.now()}-${Math.random()}`,
    type: 'data',
    subType,
    dataContext: dataContext || undefined,
    content,
    correctAnswer: answer,
    inputMode: 'choice',
    explanation,
    options: options.length >= 4 ? options : [...options, "error"].slice(0,4).sort(()=>Math.random()-0.5)
  };
};
