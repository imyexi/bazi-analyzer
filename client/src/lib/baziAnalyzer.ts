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

// 月令旺相休囚死
export const YUELING_WANGXIANG: Record<string, Record<WuxingType, number>> = {
  // 春季（寅卯月）- 木旺
  '寅': { '木': 3, '火': 2, '土': -1, '金': -2, '水': 1 },
  '卯': { '木': 3, '火': 2, '土': -1, '金': -2, '水': 1 },
  // 夏季（巳午月）- 火旺
  '巳': { '火': 3, '土': 2, '金': -1, '水': -2, '木': 1 },
  '午': { '火': 3, '土': 2, '金': -1, '水': -2, '木': 1 },
  // 秋季（申酉月）- 金旺
  '申': { '金': 3, '水': 2, '木': -1, '火': -2, '土': 1 },
  '酉': { '金': 3, '水': 2, '木': -1, '火': -2, '土': 1 },
  // 冬季（亥子月）- 水旺
  '亥': { '水': 3, '木': 2, '火': -1, '土': -2, '金': 1 },
  '子': { '水': 3, '木': 2, '火': -1, '土': -2, '金': 1 },
  // 四季土月（辰戌丑未）- 土旺
  '辰': { '土': 3, '金': 2, '水': -1, '木': -2, '火': 1 },
  '戌': { '土': 3, '金': 2, '水': -1, '木': -2, '火': 1 },
  '丑': { '土': 3, '金': 2, '水': -1, '木': -2, '火': 1 },
  '未': { '土': 3, '金': 2, '水': -1, '木': -2, '火': 1 },
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
}

/**
 * 计算得令分数
 * 判断日干在月令中的旺衰状态
 */
function calculateDeLing(riGanWuxing: WuxingType, yueZhi: string): number {
  const wangxiang = YUELING_WANGXIANG[yueZhi];
  if (!wangxiang) return 0;
  return wangxiang[riGanWuxing] * 10;
}

/**
 * 计算得地分数
 * 判断日干在地支中的根气
 */
function calculateDeDi(riGanWuxing: WuxingType, diZhi: string[]): number {
  let score = 0;
  const shengWo = WUXING_SHENG_WO[riGanWuxing];
  
  for (const zhi of diZhi) {
    const zhiWuxing = DIZHI_WUXING[zhi];
    if (zhiWuxing === riGanWuxing) {
      score += 8; // 比肩
    } else if (zhiWuxing === shengWo) {
      score += 6; // 印星
    }
  }
  
  return score;
}

/**
 * 计算得势分数
 * 判断天干中生助日干的力量
 */
function calculateDeShi(riGanWuxing: WuxingType, tianGan: string[], riGanIndex: number = 2): number {
  let score = 0;
  const shengWo = WUXING_SHENG_WO[riGanWuxing];
  
  for (let i = 0; i < tianGan.length; i++) {
    if (i === riGanIndex) continue; // 跳过日干本身
    
    const ganWuxing = TIANGAN_WUXING[tianGan[i]];
    if (ganWuxing === riGanWuxing) {
      score += 6; // 比肩劫财
    } else if (ganWuxing === shengWo) {
      score += 4; // 印星
    } else if (ganWuxing === WUXING_KE_WO[riGanWuxing]) {
      score -= 4; // 官杀
    } else if (WUXING_KE[riGanWuxing] === ganWuxing) {
      score -= 2; // 财星泄气
    }
  }
  
  return score;
}

/**
 * 判断旺衰等级（五行力量）
 */
function getWangShuaiLevel(totalScore: number): WangShuaiLevel {
  if (totalScore >= 40) return '过强';
  if (totalScore >= 15) return '偏强';
  if (totalScore >= -15) return '中和';
  if (totalScore >= -40) return '偏弱';
  return '过弱';
}

/**
 * 判断身旺身弱
 */
function getShenWangShuai(deDi: number, deShi: number): ShenWangShuai {
  const shenScore = deDi + deShi;
  if (shenScore >= 10) return '身旺';
  if (shenScore <= -5) return '身弱';
  return '中和';
}

/**
 * 确定用神
 */
function determineYongShen(riGanWuxing: WuxingType, wangShuai: WangShuaiLevel): WuxingType {
  const keWo = WUXING_KE_WO[riGanWuxing];  // 克我者（官杀）
  const woKe = WUXING_KE[riGanWuxing];      // 我克者（财星）
  const shengWo = WUXING_SHENG_WO[riGanWuxing]; // 生我者（印星）
  const woSheng = WUXING_SHENG[riGanWuxing];    // 我生者（食伤）
  
  switch (wangShuai) {
    case '过强':
      return keWo; // 用官杀克制
    case '偏强':
      return woSheng; // 用食伤泄秀
    case '过弱':
      return riGanWuxing; // 用比劫帮身
    case '偏弱':
      return shengWo; // 用印星生扶
    case '中和':
    default:
      return shengWo; // 中和取印比为用
  }
}

/**
 * 确定喜神
 */
function determineXiShen(riGanWuxing: WuxingType, wangShuai: WangShuaiLevel, shenWangShuai: ShenWangShuai): WuxingType[] {
  const keWo = WUXING_KE_WO[riGanWuxing];
  const woKe = WUXING_KE[riGanWuxing];
  const shengWo = WUXING_SHENG_WO[riGanWuxing];
  const woSheng = WUXING_SHENG[riGanWuxing];
  
  // 根据五行强弱和身旺身弱组合确定喜神
  if (wangShuai === '过强' || wangShuai === '偏强') {
    if (shenWangShuai === '身旺') {
      return [woSheng, woKe]; // 身旺用食伤、财星泄气
    } else {
      return [shengWo]; // 身弱用印星帮扶
    }
  } else if (wangShuai === '过弱' || wangShuai === '偏弱') {
    if (shenWangShuai === '身旺') {
      return [woSheng]; // 身旺用食伤泄气
    } else {
      return [shengWo]; // 身弱用印星帮扶
    }
  }
  
  return [shengWo];
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
      return shengWo; // 身强忌印比
    case '过弱':
    case '偏弱':
      return keWo; // 身弱忌官杀财
    case '中和':
    default:
      return keWo;
  }
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
  
  let shenDesc = shenWangShuai === '身旺' ? '身旺' : (shenWangShuai === '身弱' ? '身衰' : '身平');
  
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
  text += `• 忌神为【${jiShen}】\n\n`;
  
  text += `【调候建议】\n`;
  text += `在日常生活中，可以多接触与【${yongShen}】和【${xiShen[0]}】相关的事物：\n`;
  text += getWuxingAdvice(yongShen, xiShen[0]);
  
  return text;
}

/**
 * 获取五行调候建议
 */
function getWuxingAdvice(yongShen: WuxingType, xiShen: WuxingType): string {
  const advice: Record<WuxingType, string> = {
    '金': '• 金：白色、金色、银色；西方；金属饰品；金融、机械行业',
    '水': '• 水：黑色、蓝色；北方；水晶、流动的水；物流、旅游行业',
    '木': '• 木：绿色、青色；东方；植物、木制品；教育、文化行业',
    '火': '• 火：红色、紫色；南方；灯光、阳光；电子、能源行业',
    '土': '• 土：黄色、棕色；中央；陶瓷、玉石；房地产、农业行业',
  };
  
  let text = advice[yongShen] + '\n';
  if (xiShen !== yongShen) {
    text += advice[xiShen] + '\n';
  }
  
  return text;
}

/**
 * 主分析函数
 * @param paipanResult paipan.js fatemaps方法的返回结果
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
  
  // 计算五行力量（简化版）
  const wuxingStrength: Record<WuxingType, number> = { ...wuxingCount };
  
  // 计算旺衰
  const deLing = calculateDeLing(riGanWuxing, yueZhi);
  const deDi = calculateDeDi(riGanWuxing, diZhi);
  const deShi = calculateDeShi(riGanWuxing, tianGan);
  const totalScore = deLing + deDi + deShi;
  const wangShuai = getWangShuaiLevel(totalScore);
  const shenWangShuai = getShenWangShuai(deDi, deShi);
  
  // 确定用神喜神忌神
  const yongShen = determineYongShen(riGanWuxing, wangShuai);
  const xiShen = determineXiShen(riGanWuxing, wangShuai, shenWangShuai);
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
  
  return {
    ...partialResult,
    analysisText,
    simpleText,
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
  text += result.simpleText;
  
  return text;
}

/**
 * 获取简洁文案用于直接复制发送
 */
export function getSimpleTextForCopy(result: BaziAnalysisResult): string {
  return result.simpleText;
}
