/**
 * 八字分析逻辑模块
 * 基于排盘结果自动分析日干旺衰、用神、喜神
 */

// 五行常量
export const WUXING = ['金', '水', '木', '火', '土'] as const;
export type WuxingType = typeof WUXING[number];

// 五行代码映射
export const WUXING_CODE: Record<number, WuxingType> = {
  0: '金',
  1: '水',
  2: '木',
  3: '火',
  4: '土',
};

// 五行颜色映射
export const WUXING_COLORS: Record<WuxingType, string> = {
  '金': '#D4AF37',
  '水': '#4A6FA5',
  '木': '#4A7C59',
  '火': '#C94C4C',
  '土': '#8B7355',
};

// 五行CSS类名映射
export const WUXING_CLASS: Record<WuxingType, string> = {
  '金': 'wuxing-metal',
  '水': 'wuxing-water',
  '木': 'wuxing-wood',
  '火': 'wuxing-fire',
  '土': 'wuxing-earth',
};

// 五行对应颜色描述（用于推荐）
export const WUXING_COLOR_DESC: Record<WuxingType, string> = {
  '金': '白色、金色、银色系',
  '水': '蓝色系、黑色系',
  '木': '绿色系、青色系',
  '火': '红色系、紫色系、粉色系',
  '土': '黄色系、棕色系、咖色系',
};

// 天干
export const TIANGAN = ['甲', '乙', '丙', '丁', '戊', '己', '庚', '辛', '壬', '癸'] as const;

// 地支
export const DIZHI = ['子', '丑', '寅', '卯', '辰', '巳', '午', '未', '申', '酉', '戌', '亥'] as const;

// 天干五行
export const TIANGAN_WUXING: Record<string, WuxingType> = {
  '甲': '木', '乙': '木',
  '丙': '火', '丁': '火',
  '戊': '土', '己': '土',
  '庚': '金', '辛': '金',
  '壬': '水', '癸': '水',
};

// 地支五行
export const DIZHI_WUXING: Record<string, WuxingType> = {
  '子': '水', '亥': '水',
  '寅': '木', '卯': '木',
  '巳': '火', '午': '火',
  '辰': '土', '戌': '土', '丑': '土', '未': '土',
  '申': '金', '酉': '金',
};

// 地支藏干（用于更精确的五行力量计算）
export const DIZHI_CANGGAN: Record<string, string[]> = {
  '子': ['癸'],
  '丑': ['己', '癸', '辛'],
  '寅': ['甲', '丙', '戊'],
  '卯': ['乙'],
  '辰': ['戊', '乙', '癸'],
  '巳': ['丙', '庚', '戊'],
  '午': ['丁', '己'],
  '未': ['己', '丁', '乙'],
  '申': ['庚', '壬', '戊'],
  '酉': ['辛'],
  '戌': ['戊', '辛', '丁'],
  '亥': ['壬', '甲'],
};

// 五行生克关系
export const WUXING_SHENG: Record<WuxingType, WuxingType> = {
  '金': '水', // 金生水
  '水': '木', // 水生木
  '木': '火', // 木生火
  '火': '土', // 火生土
  '土': '金', // 土生金
};

export const WUXING_KE: Record<WuxingType, WuxingType> = {
  '金': '木', // 金克木
  '木': '土', // 木克土
  '土': '水', // 土克水
  '水': '火', // 水克火
  '火': '金', // 火克金
};

// 什么生我
export const WUXING_SHENG_WO: Record<WuxingType, WuxingType> = {
  '金': '土',
  '水': '金',
  '木': '水',
  '火': '木',
  '土': '火',
};

// 什么克我
export const WUXING_KE_WO: Record<WuxingType, WuxingType> = {
  '金': '火',
  '水': '土',
  '木': '金',
  '火': '水',
  '土': '木',
};

// 月令旺相休囚死（调整权重）
export const YUELING_WANGXIANG: Record<string, Record<WuxingType, number>> = {
  // 春季（寅卯月）- 木旺
  '寅': { '木': 4, '火': 2, '土': -2, '金': -3, '水': 1 },
  '卯': { '木': 4, '火': 2, '土': -2, '金': -3, '水': 1 },
  // 夏季（巳午月）- 火旺
  '巳': { '火': 4, '土': 2, '金': -2, '水': -3, '木': 1 },
  '午': { '火': 4, '土': 2, '金': -2, '水': -3, '木': 1 },
  // 秋季（申酉月）- 金旺
  '申': { '金': 4, '水': 2, '木': -2, '火': -3, '土': 1 },
  '酉': { '金': 4, '水': 2, '木': -2, '火': -3, '土': 1 },
  // 冬季（亥子月）- 水旺
  '亥': { '水': 4, '木': 2, '火': -2, '土': -3, '金': 1 },
  '子': { '水': 4, '木': 2, '火': -2, '土': -3, '金': 1 },
  // 四季土月（辰戌丑未）- 土旺
  '辰': { '土': 4, '金': 2, '水': -2, '木': -3, '火': 1 },
  '戌': { '土': 4, '金': 2, '水': -2, '木': -3, '火': 1 },
  '丑': { '土': 4, '金': 2, '水': -2, '木': -3, '火': 1 },
  '未': { '土': 4, '金': 2, '水': -2, '木': -3, '火': 1 },
};

// 旺衰等级
export type WangShuaiLevel = '过强' | '偏强' | '中和' | '偏弱' | '过弱';

// 身旺身弱
export type ShenWangShuai = '身旺' | '身弱' | '中和';

// 分析结果接口
export interface BaziAnalysisResult {
  // 基本信息
  siZhu: string[];           // 四柱
  tianGan: string[];         // 天干
  diZhi: string[];           // 地支
  riGan: string;             // 日干
  riGanWuxing: WuxingType;   // 日干五行
  
  // 五行统计
  wuxingCount: Record<WuxingType, number>;
  wuxingStrength: Record<WuxingType, number>;
  
  // 旺衰分析
  deLing: number;            // 得令分数
  deDi: number;              // 得地分数
  deShi: number;             // 得势分数
  totalScore: number;        // 总分
  wangShuai: WangShuaiLevel; // 旺衰等级（五行力量）
  shenWangShuai: ShenWangShuai; // 身旺身弱
  
  // 用神喜神
  yongShen: WuxingType;      // 用神
  xiShen: WuxingType[];      // 喜神（可能多个）
  jiShen: WuxingType;        // 忌神
  
  // 分析文案
  analysisText: string;      // 详细分析
  simpleText: string;        // 简洁文案（适合发送给顾客）
  colorAdvice: string;       // 颜色推荐文案
}

/**
 * 计算五行力量（考虑藏干）
 */
function calculateWuxingStrength(tianGan: string[], diZhi: string[], yueZhi: string): Record<WuxingType, number> {
  const strength: Record<WuxingType, number> = {
    '金': 0, '水': 0, '木': 0, '火': 0, '土': 0
  };
  
  // 天干力量（每个天干基础值10）
  for (const gan of tianGan) {
    const wx = TIANGAN_WUXING[gan];
    strength[wx] += 10;
  }
  
  // 地支本气力量（每个地支本气基础值10）
  for (const zhi of diZhi) {
    const wx = DIZHI_WUXING[zhi];
    strength[wx] += 10;
  }
  
  // 地支藏干力量（藏干力量较弱）
  for (const zhi of diZhi) {
    const canggan = DIZHI_CANGGAN[zhi];
    if (canggan) {
      canggan.forEach((gan, index) => {
        const wx = TIANGAN_WUXING[gan];
        // 本气最强，中气次之，余气最弱
        const power = index === 0 ? 5 : (index === 1 ? 3 : 2);
        strength[wx] += power;
      });
    }
  }
  
  // 月令加成（当令五行力量翻倍）
  const wangxiang = YUELING_WANGXIANG[yueZhi];
  if (wangxiang) {
    for (const wx of WUXING) {
      if (wangxiang[wx] > 0) {
        strength[wx] *= (1 + wangxiang[wx] * 0.2);
      } else if (wangxiang[wx] < 0) {
        strength[wx] *= (1 + wangxiang[wx] * 0.1);
      }
    }
  }
  
  return strength;
}

/**
 * 计算得令分数
 */
function calculateDeLing(riGanWuxing: WuxingType, yueZhi: string): number {
  const wangxiang = YUELING_WANGXIANG[yueZhi];
  if (!wangxiang) return 0;
  return wangxiang[riGanWuxing] * 8;
}

/**
 * 计算得地分数
 */
function calculateDeDi(riGanWuxing: WuxingType, diZhi: string[]): number {
  let score = 0;
  const shengWo = WUXING_SHENG_WO[riGanWuxing];
  
  for (const zhi of diZhi) {
    // 本气
    const zhiWuxing = DIZHI_WUXING[zhi];
    if (zhiWuxing === riGanWuxing) {
      score += 10;
    } else if (zhiWuxing === shengWo) {
      score += 6;
    }
    
    // 藏干
    const canggan = DIZHI_CANGGAN[zhi];
    if (canggan) {
      for (const gan of canggan) {
        const ganWuxing = TIANGAN_WUXING[gan];
        if (ganWuxing === riGanWuxing) {
          score += 3;
        } else if (ganWuxing === shengWo) {
          score += 2;
        }
      }
    }
  }
  
  return score;
}

/**
 * 计算得势分数
 */
function calculateDeShi(riGanWuxing: WuxingType, tianGan: string[], riGanIndex: number = 2): number {
  let score = 0;
  const shengWo = WUXING_SHENG_WO[riGanWuxing];
  const keWo = WUXING_KE_WO[riGanWuxing];
  const woKe = WUXING_KE[riGanWuxing];
  const woSheng = WUXING_SHENG[riGanWuxing];
  
  for (let i = 0; i < tianGan.length; i++) {
    if (i === riGanIndex) continue;
    
    const ganWuxing = TIANGAN_WUXING[tianGan[i]];
    if (ganWuxing === riGanWuxing) {
      score += 8; // 比肩劫财
    } else if (ganWuxing === shengWo) {
      score += 6; // 印星
    } else if (ganWuxing === keWo) {
      score -= 6; // 官杀
    } else if (ganWuxing === woKe) {
      score -= 4; // 财星耗身
    } else if (ganWuxing === woSheng) {
      score -= 2; // 食伤泄气
    }
  }
  
  return score;
}

/**
 * 判断旺衰等级
 */
function getWangShuaiLevel(totalScore: number): WangShuaiLevel {
  if (totalScore >= 35) return '过强';
  if (totalScore >= 12) return '偏强';
  if (totalScore >= -12) return '中和';
  if (totalScore >= -35) return '偏弱';
  return '过弱';
}

/**
 * 判断身旺身弱
 */
function getShenWangShuai(deDi: number, deShi: number): ShenWangShuai {
  const shenScore = deDi + deShi;
  if (shenScore >= 15) return '身旺';
  if (shenScore <= -8) return '身弱';
  return '中和';
}

/**
 * 确定用神和喜神（核心算法优化）
 * 基于五行力量平衡原则
 */
function determineYongXiShen(
  riGanWuxing: WuxingType,
  wuxingStrength: Record<WuxingType, number>,
  wangShuai: WangShuaiLevel,
  shenWangShuai: ShenWangShuai
): { yongShen: WuxingType; xiShen: WuxingType[] } {
  const shengWo = WUXING_SHENG_WO[riGanWuxing]; // 印星
  const keWo = WUXING_KE_WO[riGanWuxing];       // 官杀
  const woKe = WUXING_KE[riGanWuxing];          // 财星
  const woSheng = WUXING_SHENG[riGanWuxing];    // 食伤
  
  // 找出最强和最弱的五行
  const sortedWuxing = [...WUXING].sort((a, b) => wuxingStrength[b] - wuxingStrength[a]);
  const strongestWuxing = sortedWuxing[0];
  const weakestWuxing = sortedWuxing[sortedWuxing.length - 1];
  
  let yongShen: WuxingType;
  let xiShen: WuxingType[] = [];
  
  // 根据日干旺衰确定用神喜神
  if (wangShuai === '过强' || wangShuai === '偏强') {
    // 身强需要泄耗克
    // 日干五行偏强时：
    // - 泄：日干生的五行（食伤）
    // - 耗：日干克的五行（财星）
    // - 克：克日干的五行（官杀）
    const xieWo = WUXING_SHENG[riGanWuxing];  // 日干生的（食伤泄身）
    const haoWo = WUXING_KE[riGanWuxing];     // 日干克的（财星耗身）
    const keWoWuxing = WUXING_KE_WO[riGanWuxing]; // 克日干的（官杀克身）
    
    // 用神优先用泄身的五行（食伤）
    yongShen = xieWo;
    // 喜神包括耗身的五行（财星）和克身的五行（官杀）
    xiShen = [haoWo];
    
    // 如果官杀不等于用神和已有喜神，也加入喜神
    if (keWoWuxing !== yongShen && keWoWuxing !== haoWo) {
      xiShen.push(keWoWuxing);
    }
  } else if (wangShuai === '过弱' || wangShuai === '偏弱') {
    // 身弱需要生扶
    // 优先用印星生身，其次比劫帮身
    if (wuxingStrength[shengWo] < wuxingStrength[keWo]) {
      yongShen = shengWo; // 印星生身
      xiShen = [riGanWuxing]; // 比劫帮身
    } else {
      yongShen = riGanWuxing; // 比劫帮身
      xiShen = [shengWo]; // 印星生身
    }
  } else {
    // 中和状态，根据五行平衡调整
    // 补最弱的五行
    yongShen = weakestWuxing;
    // 喜神为生用神的五行
    xiShen = [WUXING_SHENG_WO[weakestWuxing]];
  }
  
  // 确保喜神不重复且不等于用神
  xiShen = xiShen.filter(x => x !== yongShen);
  if (xiShen.length === 0) {
    // 如果喜神为空，添加一个合理的喜神
    if (wangShuai === '过强' || wangShuai === '偏强') {
      xiShen = [woKe !== yongShen ? woKe : woSheng];
    } else {
      xiShen = [shengWo !== yongShen ? shengWo : riGanWuxing];
    }
  }
  
  return { yongShen, xiShen };
}

/**
 * 确定忌神
 */
function determineJiShen(riGanWuxing: WuxingType, wangShuai: WangShuaiLevel): WuxingType {
  const shengWo = WUXING_SHENG_WO[riGanWuxing];
  const keWo = WUXING_KE_WO[riGanWuxing];
  
  switch (wangShuai) {
    case '过强':
    case '偏强':
      return shengWo; // 身强忌印星再生
    case '过弱':
    case '偏弱':
      return keWo; // 身弱忌官杀克身
    case '中和':
    default:
      return keWo;
  }
}

/**
 * 生成颜色推荐文案
 */
function generateColorAdvice(yongShen: WuxingType, xiShen: WuxingType[]): string {
  const allShen: WuxingType[] = [yongShen, ...xiShen];
  const uniqueShen: WuxingType[] = allShen.filter((item, index) => allShen.indexOf(item) === index);
  
  const shenNames = uniqueShen.join('和');
  const colors = uniqueShen.map((wx: WuxingType) => WUXING_COLOR_DESC[wx]).join('、');
  
  return `你的喜用神是${shenNames}，${colors}的水晶会比较适合你～`;
}

/**
 * 生成简洁文案（参考网站格式）
 */
function generateSimpleText(result: {
  riGan: string;
  riGanWuxing: WuxingType;
  wangShuai: WangShuaiLevel;
  shenWangShuai: ShenWangShuai;
  yongShen: WuxingType;
  xiShen: WuxingType[];
}): string {
  const { riGanWuxing, wangShuai, shenWangShuai, yongShen, xiShen } = result;
  
  let wangShuaiDesc = '';
  switch (wangShuai) {
    case '过强': wangShuaiDesc = '过强'; break;
    case '偏强': wangShuaiDesc = '偏强'; break;
    case '中和': wangShuaiDesc = '较为平衡'; break;
    case '偏弱': wangShuaiDesc = '偏弱'; break;
    case '过弱': wangShuaiDesc = '偏弱'; break;
  }
  
  const shenDesc = shenWangShuai === '身旺' ? '身旺' : (shenWangShuai === '身弱' ? '身衰' : '身平');
  const xiShenText = xiShen.join('、');
  
  let text = `日干为${riGanWuxing}，即五行属${riGanWuxing}，俗称的${riGanWuxing}命`;
  
  if (wangShuai === '中和') {
    text += `，从你的五行来看你的【${riGanWuxing}】五行力量${wangShuaiDesc}，`;
    text += `可以用【用神：${yongShen}】来维持平衡，`;
    text += `同时你五行属${riGanWuxing}${shenDesc}，也可以用【喜神：${xiShenText}】来调和，这样会更顺利。`;
  } else if (wangShuai === '过强' || wangShuai === '偏强') {
    text += `，但是从你的五行来看你的【${riGanWuxing}】五行力量${wangShuaiDesc}，要用【用神：${yongShen}】来平衡，`;
    if (shenWangShuai === '身旺') {
      text += `同时你五行属${riGanWuxing}${shenDesc}，需要用【喜神：${xiShenText}】来平衡，这样会更顺利。`;
    } else {
      text += `同时你五行属${riGanWuxing}${shenDesc}，需要用【喜神：${xiShenText}】来帮扶，这样会更顺利。`;
    }
  } else {
    text += `，从你的五行来看你的【${riGanWuxing}】五行力量${wangShuaiDesc}，要用【用神：${yongShen}】来帮扶，`;
    if (shenWangShuai === '身旺') {
      text += `同时你五行属${riGanWuxing}${shenDesc}，也是需要用【喜神：${xiShenText}】来平衡，这样会更顺利。`;
    } else {
      text += `同时你五行属${riGanWuxing}${shenDesc}，需要用【喜神：${xiShenText}】来帮扶，这样会更顺利。`;
    }
  }
  
  return text;
}

/**
 * 生成详细分析文案
 */
function generateAnalysisText(result: {
  riGan: string;
  riGanWuxing: WuxingType;
  wangShuai: WangShuaiLevel;
  shenWangShuai: ShenWangShuai;
  yongShen: WuxingType;
  xiShen: WuxingType[];
  jiShen: WuxingType;
  wuxingCount: Record<WuxingType, number>;
}): string {
  const { riGan, riGanWuxing, wangShuai, yongShen, xiShen, jiShen, wuxingCount } = result;
  
  // 五行缺失检查
  const missingWuxing = WUXING.filter(wx => wuxingCount[wx] === 0);
  const missingText = missingWuxing.length > 0 
    ? `八字中缺【${missingWuxing.join('、')}】。` 
    : '';
  
  let text = `【日干分析】\n`;
  text += `日干为${riGan}，五行属${riGanWuxing}，俗称"${riGanWuxing}命"。\n\n`;
  
  text += `【五行强弱】\n`;
  const wangShuaiDesc = wangShuai === '中和' ? '较为平衡' : wangShuai;
  text += `从八字整体来看，${riGanWuxing}的力量${wangShuaiDesc}。`;
  text += `${missingText}\n\n`;
  
  text += `【用神喜神】\n`;
  text += `• 用神为【${yongShen}】\n`;
  text += `• 喜神为【${xiShen.join('、')}】\n`;
  text += `• 忌神为【${jiShen}】\n`;
  
  return text;
}

/**
 * 主分析函数
 */
export function analyzeBazi(paipanResult: any): BaziAnalysisResult {
  // 提取基本信息
  const tianGan = paipanResult.ctg as string[];
  const diZhi = paipanResult.cdz as string[];
  const siZhu = paipanResult.sz as string[];
  
  const riGan = tianGan[2];
  const riGanWuxing = TIANGAN_WUXING[riGan];
  const yueZhi = diZhi[1];
  
  // 计算五行数量
  const wuxingCount: Record<WuxingType, number> = {
    '金': 0, '水': 0, '木': 0, '火': 0, '土': 0
  };
  
  // 统计天干五行
  for (const gan of tianGan) {
    const wx = TIANGAN_WUXING[gan];
    wuxingCount[wx]++;
  }
  
  // 统计地支五行
  for (const zhi of diZhi) {
    const wx = DIZHI_WUXING[zhi];
    wuxingCount[wx]++;
  }
  
  // 计算五行力量（考虑藏干）
  const wuxingStrength = calculateWuxingStrength(tianGan, diZhi, yueZhi);
  
  // 计算旺衰
  const deLing = calculateDeLing(riGanWuxing, yueZhi);
  const deDi = calculateDeDi(riGanWuxing, diZhi);
  const deShi = calculateDeShi(riGanWuxing, tianGan);
  const totalScore = deLing + deDi + deShi;
  const wangShuai = getWangShuaiLevel(totalScore);
  const shenWangShuai = getShenWangShuai(deDi, deShi);
  
  // 确定用神喜神忌神（使用优化后的算法）
  const { yongShen, xiShen } = determineYongXiShen(riGanWuxing, wuxingStrength, wangShuai, shenWangShuai);
  const jiShen = determineJiShen(riGanWuxing, wangShuai);
  
  const partialResult = {
    siZhu,
    tianGan,
    diZhi,
    riGan,
    riGanWuxing,
    wuxingCount,
    wuxingStrength,
    deLing,
    deDi,
    deShi,
    totalScore,
    wangShuai,
    shenWangShuai,
    yongShen,
    xiShen,
    jiShen,
  };
  
  // 生成分析文案
  const analysisText = generateAnalysisText(partialResult);
  const simpleText = generateSimpleText(partialResult);
  const colorAdvice = generateColorAdvice(yongShen, xiShen);
  
  return {
    ...partialResult,
    analysisText,
    simpleText,
    colorAdvice,
  };
}

/**
 * 格式化用于复制的结果文本
 */
export function formatResultForCopy(result: BaziAnalysisResult, basicInfo?: {
  gender?: string;
  birthDate?: string;
  birthTime?: string;
}): string {
  let text = '';
  
  if (basicInfo) {
    text += `【基本信息】\n`;
    if (basicInfo.gender) text += `性别：${basicInfo.gender}\n`;
    if (basicInfo.birthDate) text += `出生日期：${basicInfo.birthDate}\n`;
    if (basicInfo.birthTime) text += `出生时间：${basicInfo.birthTime}\n`;
    text += '\n';
  }
  
  text += `【八字排盘】\n`;
  text += `四柱：${result.siZhu.join(' ')}\n`;
  text += `天干：${result.tianGan.join(' ')}\n`;
  text += `地支：${result.diZhi.join(' ')}\n\n`;
  
  text += `【五行统计】\n`;
  text += `金：${result.wuxingCount['金']}个  `;
  text += `水：${result.wuxingCount['水']}个  `;
  text += `木：${result.wuxingCount['木']}个  `;
  text += `火：${result.wuxingCount['火']}个  `;
  text += `土：${result.wuxingCount['土']}个\n\n`;
  
  text += `【分析结果】\n`;
  text += result.simpleText + '\n\n';
  
  text += `【颜色推荐】\n`;
  text += result.colorAdvice;
  
  return text;
}

/**
 * 获取简洁文案用于直接复制发送
 */
export function getSimpleTextForCopy(result: BaziAnalysisResult): string {
  return result.simpleText;
}
