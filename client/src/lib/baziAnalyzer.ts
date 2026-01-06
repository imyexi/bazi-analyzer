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
 * 计算五行力量（改进版）
 * 更准确地计算各五行的实际力量
 */
function calculateWuxingStrength(tianGan: string[], diZhi: string[]): Record<WuxingType, number> {
  const strength: Record<WuxingType, number> = {
    '金': 0, '水': 0, '木': 0, '火': 0, '土': 0
  };
  
  // 天干力量（透出的力量较强）
  // 年干、月干、日干、时干的权重
  const tianGanWeights = [10, 12, 0, 10]; // 日干不计入（是被分析对象）
  for (let i = 0; i < tianGan.length; i++) {
    if (i === 2) continue; // 跳过日干
    const wx = TIANGAN_WUXING[tianGan[i]];
    strength[wx] += tianGanWeights[i];
  }
  
  // 地支本气力量
  // 年支、月支、日支、时支的权重
  const diZhiWeights = [8, 12, 10, 8];
  for (let i = 0; i < diZhi.length; i++) {
    const wx = DIZHI_WUXING[diZhi[i]];
    strength[wx] += diZhiWeights[i];
  }
  
  // 地支藏干力量
  for (let i = 0; i < diZhi.length; i++) {
    const zhi = diZhi[i];
    const canggan = DIZHI_CANGGAN[zhi];
    if (canggan) {
      const baseWeight = diZhiWeights[i] * 0.4;
      canggan.forEach((gan, index) => {
        const wx = TIANGAN_WUXING[gan];
        // 本气最强，中气次之，余气最弱
        const power = index === 0 ? baseWeight : (index === 1 ? baseWeight * 0.5 : baseWeight * 0.3);
        strength[wx] += power;
      });
    }
  }
  
  return strength;
}

/**
 * 计算日干的实际力量（核心改进）
 * 直接统计帮助和损害日干的干支数量和力量
 */
function calculateRiGanStrength(
  riGanWuxing: WuxingType,
  tianGan: string[],
  diZhi: string[]
): { helpScore: number; hurtScore: number; netScore: number } {
  const shengWo = WUXING_SHENG_WO[riGanWuxing]; // 生我的（印星）
  const keWo = WUXING_KE_WO[riGanWuxing];       // 克我的（官杀）
  const woKe = WUXING_KE[riGanWuxing];          // 我克的（财星）
  const woSheng = WUXING_SHENG[riGanWuxing];    // 我生的（食伤）
  
  let helpScore = 0;
  let hurtScore = 0;
  
  // 天干权重
  const tianGanWeights = [10, 12, 0, 10];
  
  // 分析天干
  for (let i = 0; i < tianGan.length; i++) {
    if (i === 2) continue; // 跳过日干
    const ganWuxing = TIANGAN_WUXING[tianGan[i]];
    const weight = tianGanWeights[i];
    
    if (ganWuxing === riGanWuxing) {
      helpScore += weight * 1.0; // 比劫帮身
    } else if (ganWuxing === shengWo) {
      helpScore += weight * 0.8; // 印星生身
    } else if (ganWuxing === keWo) {
      hurtScore += weight * 1.2; // 官杀克身
    } else if (ganWuxing === woKe) {
      hurtScore += weight * 0.8; // 财星耗身
    } else if (ganWuxing === woSheng) {
      hurtScore += weight * 0.6; // 食伤泄身
    }
  }
  
  // 地支权重
  const diZhiWeights = [8, 12, 10, 8];
  
  // 分析地支本气
  for (let i = 0; i < diZhi.length; i++) {
    const zhiWuxing = DIZHI_WUXING[diZhi[i]];
    const weight = diZhiWeights[i];
    
    if (zhiWuxing === riGanWuxing) {
      helpScore += weight * 0.8; // 比劫帮身（地支力量稍弱）
    } else if (zhiWuxing === shengWo) {
      helpScore += weight * 0.6; // 印星生身
    } else if (zhiWuxing === keWo) {
      hurtScore += weight * 1.0; // 官杀克身
    } else if (zhiWuxing === woKe) {
      hurtScore += weight * 0.6; // 财星耗身
    } else if (zhiWuxing === woSheng) {
      hurtScore += weight * 0.5; // 食伤泄身
    }
  }
  
  // 分析地支藏干
  for (let i = 0; i < diZhi.length; i++) {
    const zhi = diZhi[i];
    const canggan = DIZHI_CANGGAN[zhi];
    if (!canggan) continue;
    
    const baseWeight = diZhiWeights[i] * 0.3;
    
    canggan.forEach((gan, index) => {
      const ganWuxing = TIANGAN_WUXING[gan];
      const power = index === 0 ? baseWeight : (index === 1 ? baseWeight * 0.5 : baseWeight * 0.3);
      
      if (ganWuxing === riGanWuxing) {
        helpScore += power * 0.6;
      } else if (ganWuxing === shengWo) {
        helpScore += power * 0.5;
      } else if (ganWuxing === keWo) {
        hurtScore += power * 0.7;
      } else if (ganWuxing === woKe) {
        hurtScore += power * 0.4;
      } else if (ganWuxing === woSheng) {
        hurtScore += power * 0.3;
      }
    });
  }
  
  const netScore = helpScore - hurtScore;
  
  return { helpScore, hurtScore, netScore };
}

/**
 * 判断旺衰等级（改进版）
 * 综合考虑帮扶比例和日干五行数量
 */
function getWangShuaiLevel(
  helpScore: number, 
  hurtScore: number,
  riGanWuxing: WuxingType,
  wuxingCount: Record<WuxingType, number>
): WangShuaiLevel {
  const ratio = helpScore / (hurtScore + 0.1); // 避免除零
  const riGanCount = wuxingCount[riGanWuxing];
  const totalCount = Object.values(wuxingCount).reduce((a, b) => a + b, 0);
  const riGanRatio = riGanCount / totalCount;
  
  // 综合判断：同时考虑帮扶比例和日干五行占比
  // 如果日干五行数量>=4，或占比>=50%，则认为偏强
  if (riGanCount >= 4 || riGanRatio >= 0.5) {
    if (ratio >= 1.5) return '过强';
    return '偏强';
  }
  
  // 如果日干五行数量<=1，或占比<=12.5%，则认为偏弱
  if (riGanCount <= 1 || riGanRatio <= 0.125) {
    if (ratio <= 0.6) return '过弱';
    return '偏弱';
  }
  
  // 标准判断
  if (ratio >= 1.8) return '过强';
  if (ratio >= 1.2) return '偏强';
  if (ratio <= 0.5) return '过弱';
  if (ratio <= 0.8) return '偏弱';
  return '中和';
}

/**
 * 判断身旺身弱
 */
function getShenWangShuai(helpScore: number, hurtScore: number): ShenWangShuai {
  const ratio = helpScore / (hurtScore + 0.1);
  if (ratio >= 1.3) return '身旺';
  if (ratio <= 0.7) return '身弱';
  return '中和';
}

/**
 * 确定用神和喜神（核心算法）
 */
function determineYongXiShen(
  riGanWuxing: WuxingType,
  wangShuai: WangShuaiLevel
): { yongShen: WuxingType; xiShen: WuxingType[] } {
  const shengWo = WUXING_SHENG_WO[riGanWuxing]; // 印星（生我）
  const keWo = WUXING_KE_WO[riGanWuxing];       // 官杀（克我）
  const woSheng = WUXING_SHENG[riGanWuxing];    // 食伤（我生）
  const woKe = WUXING_KE[riGanWuxing];          // 财星（我克）
  
  let yongShen: WuxingType;
  let xiShen: WuxingType[] = [];
  
  if (wangShuai === '过强' || wangShuai === '偏强') {
    // 身强：需要泄耗克来平衡
    // 用神：食伤泄身（我生）
    // 喜神：财星耗身（我克）+ 官杀克身（克我）
    yongShen = woSheng;  // 食伤泄身
    xiShen = [woKe, keWo]; // 财星耗身、官杀克身
  } else if (wangShuai === '过弱' || wangShuai === '偏弱') {
    // 身弱：需要生扶来帮助
    // 用神：印星生身（生我）
    // 喜神：比劫帮身（同我）
    yongShen = shengWo;  // 印星生身
    xiShen = [riGanWuxing]; // 比劫帮身
  } else {
    // 中和：根据五行平衡，适当生扶
    yongShen = shengWo;
    xiShen = [riGanWuxing];
  }
  
  // 确保喜神不重复且不等于用神
  xiShen = xiShen.filter(x => x !== yongShen);
  
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
  const { riGanWuxing, wangShuai, yongShen, xiShen } = result;
  
  let wangShuaiDesc = '';
  switch (wangShuai) {
    case '过强': wangShuaiDesc = '过强'; break;
    case '偏强': wangShuaiDesc = '偏强'; break;
    case '中和': wangShuaiDesc = '较为平衡'; break;
    case '偏弱': wangShuaiDesc = '偏弱'; break;
    case '过弱': wangShuaiDesc = '偏弱'; break;
  }
  
  // 组合喜用神文案
  const allXiYong = [yongShen, ...xiShen].filter((v, i, a) => a.indexOf(v) === i);
  const xiYongText = allXiYong.join('');
  
  let text = `日干为${riGanWuxing}，即五行属${riGanWuxing}，俗称的${riGanWuxing}命`;
  
  if (wangShuai === '中和') {
    text += `，从你的五行来看你的【${riGanWuxing}】五行力量${wangShuaiDesc}，可以用【喜用神：${xiYongText}】来平衡，这样会更顺利。`;
  } else if (wangShuai === '过强' || wangShuai === '偏强') {
    text += `，从你的五行来看你的【${riGanWuxing}】五行力量${wangShuaiDesc}，要用【喜用神：${xiYongText}】来平衡，这样会更顺利。`;
  } else {
    text += `，从你的五行来看你的【${riGanWuxing}】五行力量${wangShuaiDesc}，要用【喜用神：${xiYongText}】来帮扶，这样会更顺利。`;
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
  
  // 计算五行力量
  const wuxingStrength = calculateWuxingStrength(tianGan, diZhi);
  
  // 计算日干实际力量
  const { helpScore, hurtScore, netScore } = calculateRiGanStrength(riGanWuxing, tianGan, diZhi);
  
  // 判断旺衰
  const wangShuai = getWangShuaiLevel(helpScore, hurtScore, riGanWuxing, wuxingCount);
  const shenWangShuai = getShenWangShuai(helpScore, hurtScore);
  
  // 确定用神喜神忌神
  const { yongShen, xiShen } = determineYongXiShen(riGanWuxing, wangShuai);
  const jiShen = determineJiShen(riGanWuxing, wangShuai);
  
  const partialResult = {
    siZhu,
    tianGan,
    diZhi,
    riGan,
    riGanWuxing,
    wuxingCount,
    wuxingStrength,
    deLing: helpScore,
    deDi: hurtScore,
    deShi: netScore,
    totalScore: netScore,
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
