/**
 * 八字分析逻辑模块
 * 基于十神理论进行用神喜神分析
 * 遵循"扶抑、调候、通关"三大原则
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

// 天干阴阳
export const TIANGAN_YINYANG: Record<string, '阳' | '阴'> = {
  '甲': '阳', '乙': '阴',
  '丙': '阳', '丁': '阴',
  '戊': '阳', '己': '阴',
  '庚': '阳', '辛': '阴',
  '壬': '阳', '癸': '阴',
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

// 月支对应季节
export const DIZHI_SEASON: Record<string, '春' | '夏' | '秋' | '冬' | '四季'> = {
  '寅': '春', '卯': '春',
  '巳': '夏', '午': '夏',
  '申': '秋', '酉': '秋',
  '亥': '冬', '子': '冬',
  '辰': '四季', '戌': '四季', '丑': '四季', '未': '四季',
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

// 什么生我（印星）
export const WUXING_SHENG_WO: Record<WuxingType, WuxingType> = {
  '金': '土',
  '水': '金',
  '木': '水',
  '火': '木',
  '土': '火',
};

// 什么克我（官杀）
export const WUXING_KE_WO: Record<WuxingType, WuxingType> = {
  '金': '火',
  '水': '土',
  '木': '金',
  '火': '水',
  '土': '木',
};

// 十神类型
export type ShiShenType = '比肩' | '劫财' | '食神' | '伤官' | '偏财' | '正财' | '七杀' | '正官' | '偏印' | '正印';

// 旺衰等级
export type WangShuaiLevel = '过强' | '偏强' | '中和' | '偏弱' | '过弱';

// 身旺身弱
export type ShenWangShuai = '身旺' | '身弱' | '中和';

// 十神统计
export interface ShiShenCount {
  比肩: number;
  劫财: number;
  食神: number;
  伤官: number;
  偏财: number;
  正财: number;
  七杀: number;
  正官: number;
  偏印: number;
  正印: number;
}

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
  
  // 十神统计
  shiShenCount: ShiShenCount;
  
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
  
  // 调候信息
  needTiaoHou: boolean;      // 是否需要调候
  tiaoHouWuxing?: WuxingType; // 调候用神
  
  // 分析文案
  analysisText: string;      // 详细分析
  simpleText: string;        // 简洁文案（适合发送给顾客）
  colorAdvice: string;       // 颜色推荐文案
}

/**
 * 计算十神
 * 根据日干和其他干支的关系确定十神
 */
function getShiShen(riGan: string, otherGan: string): ShiShenType {
  const riWuxing = TIANGAN_WUXING[riGan];
  const otherWuxing = TIANGAN_WUXING[otherGan];
  const riYinYang = TIANGAN_YINYANG[riGan];
  const otherYinYang = TIANGAN_YINYANG[otherGan];
  const sameYinYang = riYinYang === otherYinYang;
  
  // 同我者（比劫）
  if (otherWuxing === riWuxing) {
    return sameYinYang ? '比肩' : '劫财';
  }
  
  // 生我者（印星）
  if (WUXING_SHENG_WO[riWuxing] === otherWuxing) {
    return sameYinYang ? '偏印' : '正印';
  }
  
  // 我生者（食伤）
  if (WUXING_SHENG[riWuxing] === otherWuxing) {
    return sameYinYang ? '食神' : '伤官';
  }
  
  // 克我者（官杀）
  if (WUXING_KE_WO[riWuxing] === otherWuxing) {
    return sameYinYang ? '七杀' : '正官';
  }
  
  // 我克者（财星）
  if (WUXING_KE[riWuxing] === otherWuxing) {
    return sameYinYang ? '偏财' : '正财';
  }
  
  return '比肩'; // 默认
}

/**
 * 统计十神
 */
function countShiShen(riGan: string, tianGan: string[], diZhi: string[]): ShiShenCount {
  const count: ShiShenCount = {
    比肩: 0, 劫财: 0, 食神: 0, 伤官: 0,
    偏财: 0, 正财: 0, 七杀: 0, 正官: 0,
    偏印: 0, 正印: 0
  };
  
  // 统计天干（不包括日干自身）
  for (let i = 0; i < tianGan.length; i++) {
    if (i === 2) continue; // 跳过日干
    const shiShen = getShiShen(riGan, tianGan[i]);
    count[shiShen]++;
  }
  
  // 统计地支藏干
  for (const zhi of diZhi) {
    const canggan = DIZHI_CANGGAN[zhi];
    if (canggan) {
      for (const gan of canggan) {
        const shiShen = getShiShen(riGan, gan);
        count[shiShen] += 0.5; // 藏干力量减半
      }
    }
  }
  
  return count;
}

/**
 * 计算五行力量
 */
function calculateWuxingStrength(tianGan: string[], diZhi: string[]): Record<WuxingType, number> {
  const strength: Record<WuxingType, number> = {
    '金': 0, '水': 0, '木': 0, '火': 0, '土': 0
  };
  
  // 天干力量
  const tianGanWeights = [10, 12, 10, 10];
  for (let i = 0; i < tianGan.length; i++) {
    const wx = TIANGAN_WUXING[tianGan[i]];
    strength[wx] += tianGanWeights[i];
  }
  
  // 地支本气力量
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
        const power = index === 0 ? baseWeight : (index === 1 ? baseWeight * 0.5 : baseWeight * 0.3);
        strength[wx] += power;
      });
    }
  }
  
  return strength;
}

/**
 * 计算日干得令分数
 * 月令是八字旺衰的关键
 */
function calculateDeLing(riGanWuxing: WuxingType, yueZhi: string): number {
  const yueZhiWuxing = DIZHI_WUXING[yueZhi];
  const shengWo = WUXING_SHENG_WO[riGanWuxing];
  
  // 月令五行与日干五行相同：得令（旺）
  if (yueZhiWuxing === riGanWuxing) return 30;
  
  // 月令五行生日干：相生（相）
  if (yueZhiWuxing === shengWo) return 20;
  
  // 月令五行被日干所生：休
  if (WUXING_SHENG[riGanWuxing] === yueZhiWuxing) return 5;
  
  // 月令五行被日干所克：囚
  if (WUXING_KE[riGanWuxing] === yueZhiWuxing) return 0;
  
  // 月令五行克日干：死
  if (WUXING_KE_WO[riGanWuxing] === yueZhiWuxing) return -10;
  
  return 10;
}

/**
 * 计算日干得地分数
 * 检查日干在地支中的根基
 */
function calculateDeDi(riGan: string, riGanWuxing: WuxingType, diZhi: string[]): number {
  let score = 0;
  const weights = [6, 8, 10, 6]; // 年支、月支、日支、时支权重
  
  for (let i = 0; i < diZhi.length; i++) {
    const zhi = diZhi[i];
    const canggan = DIZHI_CANGGAN[zhi];
    
    if (canggan) {
      for (let j = 0; j < canggan.length; j++) {
        const gan = canggan[j];
        const ganWuxing = TIANGAN_WUXING[gan];
        
        // 藏干与日干相同或生日干
        if (ganWuxing === riGanWuxing) {
          const power = j === 0 ? 1.0 : (j === 1 ? 0.5 : 0.3);
          score += weights[i] * power;
        } else if (ganWuxing === WUXING_SHENG_WO[riGanWuxing]) {
          const power = j === 0 ? 0.7 : (j === 1 ? 0.35 : 0.2);
          score += weights[i] * power;
        }
      }
    }
  }
  
  return score;
}

/**
 * 计算日干得势分数
 * 检查天干中帮助日干的力量
 */
function calculateDeShi(riGan: string, riGanWuxing: WuxingType, tianGan: string[]): number {
  let score = 0;
  const weights = [8, 10, 0, 8]; // 年干、月干、日干、时干权重
  
  for (let i = 0; i < tianGan.length; i++) {
    if (i === 2) continue; // 跳过日干
    
    const ganWuxing = TIANGAN_WUXING[tianGan[i]];
    
    // 同五行（比劫）
    if (ganWuxing === riGanWuxing) {
      score += weights[i];
    }
    // 生我（印星）
    else if (ganWuxing === WUXING_SHENG_WO[riGanWuxing]) {
      score += weights[i] * 0.8;
    }
  }
  
  return score;
}

/**
 * 计算克泄耗分数
 * 计算对日干不利的力量
 * 增加地支藏干的克泄耗计算
 */
function calculateKeXieHao(riGanWuxing: WuxingType, tianGan: string[], diZhi: string[]): number {
  let score = 0;
  const woSheng = WUXING_SHENG[riGanWuxing];    // 食伤
  const woKe = WUXING_KE[riGanWuxing];          // 财星
  const keWo = WUXING_KE_WO[riGanWuxing];       // 官杀
  
  // 天干（透出的力量较强）
  const tianGanWeights = [10, 12, 0, 10];
  for (let i = 0; i < tianGan.length; i++) {
    if (i === 2) continue;
    const ganWuxing = TIANGAN_WUXING[tianGan[i]];
    
    if (ganWuxing === keWo) score += tianGanWeights[i] * 1.5;      // 官杀克身（最强）
    else if (ganWuxing === woKe) score += tianGanWeights[i] * 1.0; // 财星耗身
    else if (ganWuxing === woSheng) score += tianGanWeights[i] * 0.8; // 食伤泄身
  }
  
  // 地支本气
  const diZhiWeights = [8, 10, 10, 8];
  for (let i = 0; i < diZhi.length; i++) {
    const zhiWuxing = DIZHI_WUXING[diZhi[i]];
    
    if (zhiWuxing === keWo) score += diZhiWeights[i] * 1.2;
    else if (zhiWuxing === woKe) score += diZhiWeights[i] * 0.8;
    else if (zhiWuxing === woSheng) score += diZhiWeights[i] * 0.6;
  }
  
  // 地支藏干的克泄耗
  for (let i = 0; i < diZhi.length; i++) {
    const zhi = diZhi[i];
    const canggan = DIZHI_CANGGAN[zhi];
    if (!canggan) continue;
    
    const baseWeight = diZhiWeights[i] * 0.4;
    
    canggan.forEach((gan, index) => {
      const ganWuxing = TIANGAN_WUXING[gan];
      const power = index === 0 ? baseWeight : (index === 1 ? baseWeight * 0.5 : baseWeight * 0.3);
      
      if (ganWuxing === keWo) score += power * 1.0;
      else if (ganWuxing === woKe) score += power * 0.6;
      else if (ganWuxing === woSheng) score += power * 0.5;
    });
  }
  
  return score;
}

/**
 * 判断旺衰等级
 * 综合得令、得地、得势、克泄耗来判断
 * 重点考虑克泄耗的力量
 */
function getWangShuaiLevel(
  deLing: number,
  deDi: number,
  deShi: number,
  keXieHao: number,
  riGanWuxing: WuxingType,
  wuxingCount: Record<WuxingType, number>
): WangShuaiLevel {
  const helpScore = deLing + deDi + deShi;
  const hurtScore = keXieHao;
  
  // 计算净分数（帮扶 - 克泄耗）
  const netScore = helpScore - hurtScore;
  
  // 计算比例
  const ratio = helpScore / (hurtScore + 0.1);
  
  // 同时考虑日干五行在八字中的数量
  const riGanCount = wuxingCount[riGanWuxing];
  const shengWoCount = wuxingCount[WUXING_SHENG_WO[riGanWuxing]];
  const helpCount = riGanCount + shengWoCount;
  
  // 计算克泄耗的五行数量
  const keWoCount = wuxingCount[WUXING_KE_WO[riGanWuxing]]; // 官杀
  const woKeCount = wuxingCount[WUXING_KE[riGanWuxing]];    // 财星
  const woShengCount = wuxingCount[WUXING_SHENG[riGanWuxing]]; // 食伤
  const hurtCount = keWoCount + woKeCount + woShengCount;
  
  // 综合判断：同时考虑数量和力量
  
  // 1. 如果克泄耗数量远大于帮扶数量，倾向于身弱
  if (hurtCount >= helpCount + 2) {
    if (ratio <= 0.5) return '过弱';
    return '偏弱';
  }
  
  // 2. 如果帮扶数量远大于克泄耗数量，倾向于身强
  if (helpCount >= hurtCount + 2) {
    if (ratio >= 1.8) return '过强';
    return '偏强';
  }
  
  // 3. 根据净分数判断
  if (netScore >= 40) return '过强';
  if (netScore >= 15) return '偏强';
  if (netScore <= -40) return '过弱';
  if (netScore <= -15) return '偏弱';
  
  // 4. 根据比例判断
  if (ratio >= 1.8) return '过强';
  if (ratio >= 1.2) return '偏强';
  if (ratio <= 0.55) return '过弱';
  if (ratio <= 0.85) return '偏弱';
  
  return '中和';
}

/**
 * 判断身旺身弱
 */
function getShenWangShuai(wangShuai: WangShuaiLevel): ShenWangShuai {
  if (wangShuai === '过强' || wangShuai === '偏强') return '身旺';
  if (wangShuai === '过弱' || wangShuai === '偏弱') return '身弱';
  return '中和';
}

/**
 * 判断是否需要调候
 * 根据出生月份判断寒暖燥湿
 */
function checkTiaoHou(riGanWuxing: WuxingType, yueZhi: string): { need: boolean; wuxing?: WuxingType } {
  const season = DIZHI_SEASON[yueZhi];
  
  // 冬天出生（亥子丑月），需要火来暖局
  if (season === '冬' || yueZhi === '丑') {
    // 水命、金命冬天更需要调候
    if (riGanWuxing === '水' || riGanWuxing === '金') {
      return { need: true, wuxing: '火' };
    }
  }
  
  // 夏天出生（巳午未月），需要水来润局
  if (season === '夏' || yueZhi === '未') {
    // 火命、土命夏天更需要调候
    if (riGanWuxing === '火' || riGanWuxing === '土') {
      return { need: true, wuxing: '水' };
    }
  }
  
  return { need: false };
}

/**
 * 确定用神和喜神（基于十神理论）
 * 遵循"扶抑、调候、通关"三大原则
 */
function determineYongXiShen(
  riGanWuxing: WuxingType,
  wangShuai: WangShuaiLevel,
  shiShenCount: ShiShenCount,
  tiaoHou: { need: boolean; wuxing?: WuxingType }
): { yongShen: WuxingType; xiShen: WuxingType[] } {
  const shengWo = WUXING_SHENG_WO[riGanWuxing]; // 印星（生我）
  const keWo = WUXING_KE_WO[riGanWuxing];       // 官杀（克我）
  const woSheng = WUXING_SHENG[riGanWuxing];    // 食伤（我生）
  const woKe = WUXING_KE[riGanWuxing];          // 财星（我克）
  
  let yongShen: WuxingType;
  let xiShen: WuxingType[] = [];
  
  // 首先考虑调候
  if (tiaoHou.need && tiaoHou.wuxing) {
    // 调候用神优先级很高，但不是绝对的
    // 如果调候用神与扶抑用神冲突，需要综合考虑
  }
  
  if (wangShuai === '过强' || wangShuai === '偏强') {
    // 身强：需要泄耗克来平衡
    // 十神角度：用食伤泄身，财星耗身，官杀克身
    
    // 检查十神分布，选择最合适的用神
    const shiShang = shiShenCount.食神 + shiShenCount.伤官;
    const caiXing = shiShenCount.正财 + shiShenCount.偏财;
    const guanSha = shiShenCount.正官 + shiShenCount.七杀;
    
    // 优先用食伤泄身（最温和）
    if (shiShang >= 1) {
      yongShen = woSheng;  // 食伤
      xiShen = [woKe];     // 财星（食伤生财）
    }
    // 其次用财星耗身
    else if (caiXing >= 1) {
      yongShen = woKe;     // 财星
      xiShen = [woSheng];  // 食伤（生财）
    }
    // 最后用官杀克身
    else {
      yongShen = keWo;     // 官杀
      xiShen = [woKe];     // 财星（生官杀）
    }
    
    // 身强时，官杀也可以作为喜神
    if (!xiShen.includes(keWo) && yongShen !== keWo) {
      xiShen.push(keWo);
    }
    
  } else if (wangShuai === '过弱' || wangShuai === '偏弱') {
    // 身弱：需要生扶来帮助
    // 十神角度：用印星生身，比劫帮身
    
    const yinXing = shiShenCount.正印 + shiShenCount.偏印;
    const biJie = shiShenCount.比肩 + shiShenCount.劫财;
    
    // 优先用印星生身
    if (yinXing >= 0.5) {
      yongShen = shengWo;      // 印星
      xiShen = [riGanWuxing];  // 比劫
    }
    // 其次用比劫帮身
    else if (biJie >= 1) {
      yongShen = riGanWuxing;  // 比劫
      xiShen = [shengWo];      // 印星
    }
    // 默认用印星
    else {
      yongShen = shengWo;
      xiShen = [riGanWuxing];
    }
    
  } else {
    // 中和：根据五行平衡微调
    // 一般取印星为用神，比劫为喜神
    yongShen = shengWo;
    xiShen = [riGanWuxing];
  }
  
  // 调候用神的特殊处理
  if (tiaoHou.need && tiaoHou.wuxing) {
    // 如果调候用神不在喜用神中，考虑加入
    if (yongShen !== tiaoHou.wuxing && !xiShen.includes(tiaoHou.wuxing)) {
      // 调候用神作为辅助喜神
      xiShen.push(tiaoHou.wuxing);
    }
  }
  
  // 确保喜神不重复且不等于用神
  xiShen = xiShen.filter((x, i, arr) => x !== yongShen && arr.indexOf(x) === i);
  
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
    case '偏强': wangShuaiDesc = '偏旺'; break;
    case '中和': wangShuaiDesc = '较为平衡'; break;
    case '偏弱': wangShuaiDesc = '偏弱'; break;
    case '过弱': wangShuaiDesc = '偏弱'; break;
  }
  
  // 组合喜用神文案
  const allXiYong = [yongShen, ...xiShen].filter((v, i, a) => a.indexOf(v) === i);
  const xiYongText = allXiYong.join('');
  
  let text = `日干为${riGanWuxing}，即五行属${riGanWuxing}`;
  
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
  shiShenCount: ShiShenCount;
}): string {
  const { riGan, riGanWuxing, wangShuai, yongShen, xiShen, jiShen, wuxingCount, shiShenCount } = result;
  
  // 五行缺失检查
  const missingWuxing = WUXING.filter(wx => wuxingCount[wx] === 0);
  const missingText = missingWuxing.length > 0 
    ? `八字中缺【${missingWuxing.join('、')}】。` 
    : '';
  
  let text = `【日干分析】\n`;
  text += `日干为${riGan}，五行属${riGanWuxing}。\n\n`;
  
  text += `【五行强弱】\n`;
  const wangShuaiDesc = wangShuai === '中和' ? '较为平衡' : wangShuai;
  text += `从八字整体来看，${riGanWuxing}的力量${wangShuaiDesc}。`;
  text += `${missingText}\n\n`;
  
  text += `【十神分布】\n`;
  text += `印星（正印+偏印）：${(shiShenCount.正印 + shiShenCount.偏印).toFixed(1)}\n`;
  text += `比劫（比肩+劫财）：${(shiShenCount.比肩 + shiShenCount.劫财).toFixed(1)}\n`;
  text += `食伤（食神+伤官）：${(shiShenCount.食神 + shiShenCount.伤官).toFixed(1)}\n`;
  text += `财星（正财+偏财）：${(shiShenCount.正财 + shiShenCount.偏财).toFixed(1)}\n`;
  text += `官杀（正官+七杀）：${(shiShenCount.正官 + shiShenCount.七杀).toFixed(1)}\n\n`;
  
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
  const yueZhi = diZhi[1]; // 月支
  
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
  
  // 统计十神
  const shiShenCount = countShiShen(riGan, tianGan, diZhi);
  
  // 计算得令、得地、得势
  const deLing = calculateDeLing(riGanWuxing, yueZhi);
  const deDi = calculateDeDi(riGan, riGanWuxing, diZhi);
  const deShi = calculateDeShi(riGan, riGanWuxing, tianGan);
  const keXieHao = calculateKeXieHao(riGanWuxing, tianGan, diZhi);
  
  // 判断旺衰
  const wangShuai = getWangShuaiLevel(deLing, deDi, deShi, keXieHao, riGanWuxing, wuxingCount);
  const shenWangShuai = getShenWangShuai(wangShuai);
  
  // 检查调候
  const tiaoHou = checkTiaoHou(riGanWuxing, yueZhi);
  
  // 确定用神喜神忌神
  const { yongShen, xiShen } = determineYongXiShen(riGanWuxing, wangShuai, shiShenCount, tiaoHou);
  const jiShen = determineJiShen(riGanWuxing, wangShuai);
  
  const partialResult = {
    siZhu,
    tianGan,
    diZhi,
    riGan,
    riGanWuxing,
    wuxingCount,
    wuxingStrength,
    shiShenCount,
    deLing,
    deDi,
    deShi,
    totalScore: deLing + deDi + deShi - keXieHao,
    wangShuai,
    shenWangShuai,
    yongShen,
    xiShen,
    jiShen,
    needTiaoHou: tiaoHou.need,
    tiaoHouWuxing: tiaoHou.wuxing,
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
