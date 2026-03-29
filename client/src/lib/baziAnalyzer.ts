/**
 * 八字分析逻辑模块
 *
 * 这版规则在原有“扶抑”基础上补了四类判断：
 * 1. 月令季节权重：避免只按数量数五行。
 * 2. 通根深浅：区分本气根、中气根、余气根。
 * 3. 调候与通关：寒暖燥湿和两气相战单独判。
 * 4. 极端盘面：在非常严格的条件下识别从强/从弱倾向。
 */

// 五行常量
export const WUXING = ["金", "水", "木", "火", "土"] as const;
export type WuxingType = typeof WUXING[number];

export type AnalysisPrinciple = "扶抑" | "调候" | "通关" | "从强" | "从弱";

// 五行代码映射
export const WUXING_CODE: Record<number, WuxingType> = {
  0: "金",
  1: "水",
  2: "木",
  3: "火",
  4: "土",
};

// 五行颜色映射
export const WUXING_COLORS: Record<WuxingType, string> = {
  金: "#D4AF37",
  水: "#4A6FA5",
  木: "#4A7C59",
  火: "#C94C4C",
  土: "#8B7355",
};

// 五行CSS类名映射
export const WUXING_CLASS: Record<WuxingType, string> = {
  金: "wuxing-metal",
  水: "wuxing-water",
  木: "wuxing-wood",
  火: "wuxing-fire",
  土: "wuxing-earth",
};

// 五行对应颜色描述（用于推荐）
export const WUXING_COLOR_DESC: Record<WuxingType, string> = {
  金: "白色、金色、银色系",
  水: "蓝色系、黑色系",
  木: "绿色系、青色系",
  火: "红色系、紫色系、粉色系",
  土: "黄色系、棕色系、咖色系",
};

// 天干
export const TIANGAN = ["甲", "乙", "丙", "丁", "戊", "己", "庚", "辛", "壬", "癸"] as const;

// 地支
export const DIZHI = ["子", "丑", "寅", "卯", "辰", "巳", "午", "未", "申", "酉", "戌", "亥"] as const;

// 天干五行
export const TIANGAN_WUXING: Record<string, WuxingType> = {
  甲: "木",
  乙: "木",
  丙: "火",
  丁: "火",
  戊: "土",
  己: "土",
  庚: "金",
  辛: "金",
  壬: "水",
  癸: "水",
};

// 天干阴阳
export const TIANGAN_YINYANG: Record<string, "阳" | "阴"> = {
  甲: "阳",
  乙: "阴",
  丙: "阳",
  丁: "阴",
  戊: "阳",
  己: "阴",
  庚: "阳",
  辛: "阴",
  壬: "阳",
  癸: "阴",
};

// 地支五行
export const DIZHI_WUXING: Record<string, WuxingType> = {
  子: "水",
  亥: "水",
  寅: "木",
  卯: "木",
  巳: "火",
  午: "火",
  辰: "土",
  戌: "土",
  丑: "土",
  未: "土",
  申: "金",
  酉: "金",
};

// 地支藏干（用于更精确的五行力量计算）
export const DIZHI_CANGGAN: Record<string, string[]> = {
  子: ["癸"],
  丑: ["己", "癸", "辛"],
  寅: ["甲", "丙", "戊"],
  卯: ["乙"],
  辰: ["戊", "乙", "癸"],
  巳: ["丙", "庚", "戊"],
  午: ["丁", "己"],
  未: ["己", "丁", "乙"],
  申: ["庚", "壬", "戊"],
  酉: ["辛"],
  戌: ["戊", "辛", "丁"],
  亥: ["壬", "甲"],
};

// 月支对应季节
export const DIZHI_SEASON: Record<string, "春" | "夏" | "秋" | "冬" | "四季"> = {
  寅: "春",
  卯: "春",
  巳: "夏",
  午: "夏",
  申: "秋",
  酉: "秋",
  亥: "冬",
  子: "冬",
  辰: "四季",
  戌: "四季",
  丑: "四季",
  未: "四季",
};

// 五行生克关系
export const WUXING_SHENG: Record<WuxingType, WuxingType> = {
  金: "水",
  水: "木",
  木: "火",
  火: "土",
  土: "金",
};

export const WUXING_KE: Record<WuxingType, WuxingType> = {
  金: "木",
  木: "土",
  土: "水",
  水: "火",
  火: "金",
};

// 什么生我（印星）
export const WUXING_SHENG_WO: Record<WuxingType, WuxingType> = {
  金: "土",
  水: "金",
  木: "水",
  火: "木",
  土: "火",
};

// 什么克我（官杀）
export const WUXING_KE_WO: Record<WuxingType, WuxingType> = {
  金: "火",
  水: "土",
  木: "金",
  火: "水",
  土: "木",
};

const TIAN_GAN_POSITION_WEIGHT = [10, 14, 0, 10];
const DI_ZHI_POSITION_WEIGHT = [8, 14, 12, 8];
const ROOT_POSITION_WEIGHT = [0.8, 1.4, 1.6, 1.0];
const ROOT_LEVEL_WEIGHT = [1.0, 0.6, 0.35];
const CANGGAN_COUNT_WEIGHT = [0.7, 0.25, 0.1];

const SEASONAL_MULTIPLIER: Record<string, Record<WuxingType, number>> = {
  寅: { 木: 1.3, 火: 1.08, 水: 0.95, 金: 0.72, 土: 0.85 },
  卯: { 木: 1.35, 火: 1.05, 水: 0.9, 金: 0.7, 土: 0.82 },
  辰: { 土: 1.2, 木: 1.05, 水: 0.95, 金: 0.88, 火: 0.9 },
  巳: { 火: 1.28, 土: 1.1, 木: 0.95, 水: 0.72, 金: 0.72 },
  午: { 火: 1.35, 土: 1.12, 木: 0.92, 水: 0.68, 金: 0.68 },
  未: { 土: 1.22, 火: 1.05, 木: 0.95, 水: 0.78, 金: 0.8 },
  申: { 金: 1.28, 水: 1.06, 土: 0.95, 火: 0.72, 木: 0.72 },
  酉: { 金: 1.35, 水: 1.08, 土: 0.9, 火: 0.7, 木: 0.68 },
  戌: { 土: 1.2, 金: 1.02, 火: 0.95, 水: 0.85, 木: 0.78 },
  亥: { 水: 1.28, 木: 1.05, 金: 0.95, 土: 0.82, 火: 0.72 },
  子: { 水: 1.35, 木: 1.08, 金: 1.0, 土: 0.8, 火: 0.68 },
  丑: { 土: 1.2, 水: 1.02, 金: 0.96, 火: 0.78, 木: 0.8 },
};

const TONG_GUAN_RULES: Array<{
  pair: [WuxingType, WuxingType];
  mediator: WuxingType;
}> = [
  { pair: ["水", "火"], mediator: "木" },
  { pair: ["火", "金"], mediator: "土" },
  { pair: ["金", "木"], mediator: "水" },
  { pair: ["木", "土"], mediator: "火" },
  { pair: ["土", "水"], mediator: "金" },
];

// 十神类型
export type ShiShenType =
  | "比肩"
  | "劫财"
  | "食神"
  | "伤官"
  | "偏财"
  | "正财"
  | "七杀"
  | "正官"
  | "偏印"
  | "正印";

// 旺衰等级
export type WangShuaiLevel = "过强" | "偏强" | "中和" | "偏弱" | "过弱";

// 身旺身弱
export type ShenWangShuai = "身旺" | "身弱" | "中和";

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

interface RootProfile {
  sameRootScore: number;
  supportRootScore: number;
  hasStrongSameRoot: boolean;
}

interface TiaoHouAssessment {
  need: boolean;
  primary?: WuxingType;
  secondary?: WuxingType;
  severity: "none" | "mild" | "strong";
  reason?: string;
}

interface TongGuanAssessment {
  need: boolean;
  mediator?: WuxingType;
  pair?: [WuxingType, WuxingType];
  reason?: string;
}

interface PatternAssessment {
  type: "normal" | "cong-strong" | "cong-weak";
  label: string;
  samePartyStrength: number;
  oppositeStrength: number;
  rootScore: number;
  dominantElement: WuxingType;
}

export interface YongShenCandidate {
  element: WuxingType;
  score: number;
  reason: string;
  selected: boolean;
  rejectionReason?: string;
}

export interface YongShenReportItem {
  title: string;
  element?: WuxingType;
  kind: "selected" | "alternative" | "misjudgment";
  body: string;
}

// 分析结果接口
export interface BaziAnalysisResult {
  siZhu: string[];
  tianGan: string[];
  diZhi: string[];
  riGan: string;
  riGanWuxing: WuxingType;
  wuxingCount: Record<WuxingType, number>;
  wuxingStrength: Record<WuxingType, number>;
  shiShenCount: ShiShenCount;
  deLing: number;
  deDi: number;
  deShi: number;
  totalScore: number;
  wangShuai: WangShuaiLevel;
  shenWangShuai: ShenWangShuai;
  yongShen: WuxingType;
  xiShen: WuxingType[];
  jiShen: WuxingType;
  needTiaoHou: boolean;
  tiaoHouWuxing?: WuxingType;
  needTongGuan: boolean;
  tongGuanWuxing?: WuxingType;
  pattern: string;
  analysisPrinciples: AnalysisPrinciple[];
  samePartyStrength: number;
  oppositeStrength: number;
  rootScore: number;
  decisionSummary: string;
  yongShenCandidates: YongShenCandidate[];
  yongShenReport: YongShenReportItem[];
  tiaoHouReason?: string;
  tongGuanReason?: string;
  analysisText: string;
  simpleText: string;
  colorAdvice: string;
}

function createEmptyWuxingRecord(): Record<WuxingType, number> {
  return {
    金: 0,
    水: 0,
    木: 0,
    火: 0,
    土: 0,
  };
}

function round1(num: number): number {
  return Math.round(num * 10) / 10;
}

function uniqueElements(elements: WuxingType[]): WuxingType[] {
  return elements.filter((element, index) => elements.indexOf(element) === index);
}

function getDominantElement(
  strength: Record<WuxingType, number>,
  elements: WuxingType[] = WUXING as unknown as WuxingType[]
): WuxingType {
  return [...elements].sort((a, b) => strength[b] - strength[a])[0];
}

function getElementStrengthSum(
  strength: Record<WuxingType, number>,
  elements: WuxingType[]
): number {
  return elements.reduce((sum, element) => sum + strength[element], 0);
}

function pickStronger(
  first: WuxingType,
  second: WuxingType,
  strength: Record<WuxingType, number>
): WuxingType {
  return strength[first] >= strength[second] ? first : second;
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

  if (otherWuxing === riWuxing) {
    return sameYinYang ? "比肩" : "劫财";
  }

  if (WUXING_SHENG_WO[riWuxing] === otherWuxing) {
    return sameYinYang ? "偏印" : "正印";
  }

  if (WUXING_SHENG[riWuxing] === otherWuxing) {
    return sameYinYang ? "食神" : "伤官";
  }

  if (WUXING_KE_WO[riWuxing] === otherWuxing) {
    return sameYinYang ? "七杀" : "正官";
  }

  if (WUXING_KE[riWuxing] === otherWuxing) {
    return sameYinYang ? "偏财" : "正财";
  }

  return "比肩";
}

/**
 * 统计十神
 */
function countShiShen(riGan: string, tianGan: string[], diZhi: string[]): ShiShenCount {
  const count: ShiShenCount = {
    比肩: 0,
    劫财: 0,
    食神: 0,
    伤官: 0,
    偏财: 0,
    正财: 0,
    七杀: 0,
    正官: 0,
    偏印: 0,
    正印: 0,
  };

  for (let i = 0; i < tianGan.length; i++) {
    if (i === 2) continue;
    const shiShen = getShiShen(riGan, tianGan[i]);
    count[shiShen] += 1;
  }

  for (const zhi of diZhi) {
    const canggan = DIZHI_CANGGAN[zhi];
    if (!canggan) continue;

    canggan.forEach((gan, index) => {
      const shiShen = getShiShen(riGan, gan);
      count[shiShen] += CANGGAN_COUNT_WEIGHT[index] ?? 0.1;
    });
  }

  Object.keys(count).forEach(key => {
    count[key as keyof ShiShenCount] = round1(count[key as keyof ShiShenCount]);
  });

  return count;
}

/**
 * 计算五行力量
 * 在基础透干、地支、藏干权重外，再乘以月令季节系数。
 */
function calculateWuxingStrength(
  tianGan: string[],
  diZhi: string[],
  yueZhi: string
): Record<WuxingType, number> {
  const strength = createEmptyWuxingRecord();

  for (let i = 0; i < tianGan.length; i++) {
    const wx = TIANGAN_WUXING[tianGan[i]];
    strength[wx] += TIAN_GAN_POSITION_WEIGHT[i] ?? 8;
  }

  for (let i = 0; i < diZhi.length; i++) {
    const wx = DIZHI_WUXING[diZhi[i]];
    const branchWeight = DI_ZHI_POSITION_WEIGHT[i] ?? 8;
    strength[wx] += branchWeight;

    const canggan = DIZHI_CANGGAN[diZhi[i]];
    if (!canggan) continue;

    canggan.forEach((gan, index) => {
      const cangganWuxing = TIANGAN_WUXING[gan];
      const hiddenWeight = branchWeight * (index === 0 ? 0.42 : index === 1 ? 0.22 : 0.12);
      strength[cangganWuxing] += hiddenWeight;
    });
  }

  const multiplier = SEASONAL_MULTIPLIER[yueZhi];
  if (multiplier) {
    WUXING.forEach(element => {
      strength[element] = round1(strength[element] * multiplier[element]);
    });
  } else {
    WUXING.forEach(element => {
      strength[element] = round1(strength[element]);
    });
  }

  return strength;
}

/**
 * 计算日干得令分数
 * 月令仍是第一参考，但不再完全替代其他维度。
 */
function calculateDeLing(riGanWuxing: WuxingType, yueZhi: string): number {
  const yueZhiWuxing = DIZHI_WUXING[yueZhi];
  const shengWo = WUXING_SHENG_WO[riGanWuxing];

  if (yueZhiWuxing === riGanWuxing) return 30;
  if (yueZhiWuxing === shengWo) return 18;
  if (WUXING_SHENG[riGanWuxing] === yueZhiWuxing) return 6;
  if (WUXING_KE[riGanWuxing] === yueZhiWuxing) return -2;
  if (WUXING_KE_WO[riGanWuxing] === yueZhiWuxing) return -12;
  return 8;
}

/**
 * 通根画像：区分本气根、中气根、余气根。
 */
function getRootProfile(riGanWuxing: WuxingType, diZhi: string[]): RootProfile {
  const supportWuxing = WUXING_SHENG_WO[riGanWuxing];
  let sameRootScore = 0;
  let supportRootScore = 0;
  let hasStrongSameRoot = false;

  for (let i = 0; i < diZhi.length; i++) {
    const canggan = DIZHI_CANGGAN[diZhi[i]];
    if (!canggan) continue;

    canggan.forEach((gan, index) => {
      const wuxing = TIANGAN_WUXING[gan];
      const score = (ROOT_POSITION_WEIGHT[i] ?? 1) * (ROOT_LEVEL_WEIGHT[index] ?? 0.3);

      if (wuxing === riGanWuxing) {
        sameRootScore += score;
        if (index === 0 && i !== 0) {
          hasStrongSameRoot = true;
        }
      } else if (wuxing === supportWuxing) {
        supportRootScore += score * 0.8;
      }
    });
  }

  return {
    sameRootScore: round1(sameRootScore),
    supportRootScore: round1(supportRootScore),
    hasStrongSameRoot,
  };
}

/**
 * 计算日干得地分数
 */
function calculateDeDi(riGanWuxing: WuxingType, rootProfile: RootProfile): number {
  return round1(rootProfile.sameRootScore * 8 + rootProfile.supportRootScore * 6);
}

/**
 * 计算日干得势分数
 * 看透干的帮扶，不再只看同类个数。
 */
function calculateDeShi(riGanWuxing: WuxingType, tianGan: string[]): number {
  let score = 0;
  const shengWo = WUXING_SHENG_WO[riGanWuxing];

  for (let i = 0; i < tianGan.length; i++) {
    if (i === 2) continue;

    const ganWuxing = TIANGAN_WUXING[tianGan[i]];
    const weight = TIAN_GAN_POSITION_WEIGHT[i] ?? 8;

    if (ganWuxing === riGanWuxing) {
      score += weight;
    } else if (ganWuxing === shengWo) {
      score += weight * 0.85;
    }
  }

  return round1(score);
}

/**
 * 计算克泄耗分数
 */
function calculateKeXieHao(riGanWuxing: WuxingType, tianGan: string[], diZhi: string[]): number {
  let score = 0;
  const woSheng = WUXING_SHENG[riGanWuxing];
  const woKe = WUXING_KE[riGanWuxing];
  const keWo = WUXING_KE_WO[riGanWuxing];

  for (let i = 0; i < tianGan.length; i++) {
    if (i === 2) continue;

    const ganWuxing = TIANGAN_WUXING[tianGan[i]];
    const weight = TIAN_GAN_POSITION_WEIGHT[i] ?? 8;

    if (ganWuxing === keWo) score += weight * 1.4;
    else if (ganWuxing === woKe) score += weight * 1.0;
    else if (ganWuxing === woSheng) score += weight * 0.85;
  }

  for (let i = 0; i < diZhi.length; i++) {
    const zhiWuxing = DIZHI_WUXING[diZhi[i]];
    const branchWeight = DI_ZHI_POSITION_WEIGHT[i] ?? 8;

    if (zhiWuxing === keWo) score += branchWeight * 1.05;
    else if (zhiWuxing === woKe) score += branchWeight * 0.75;
    else if (zhiWuxing === woSheng) score += branchWeight * 0.65;

    const canggan = DIZHI_CANGGAN[diZhi[i]];
    if (!canggan) continue;

    canggan.forEach((gan, index) => {
      const ganWuxing = TIANGAN_WUXING[gan];
      const hiddenWeight = branchWeight * (index === 0 ? 0.32 : index === 1 ? 0.18 : 0.1);

      if (ganWuxing === keWo) score += hiddenWeight * 1.0;
      else if (ganWuxing === woKe) score += hiddenWeight * 0.65;
      else if (ganWuxing === woSheng) score += hiddenWeight * 0.55;
    });
  }

  return round1(score);
}

function calculateBalanceScore(
  deLing: number,
  deDi: number,
  deShi: number,
  keXieHao: number,
  rootProfile: RootProfile
): number {
  return round1(
    deLing +
      deDi +
      deShi +
      rootProfile.sameRootScore * 4 +
      rootProfile.supportRootScore * 2 -
      keXieHao
  );
}

/**
 * 判断旺衰等级
 */
function getWangShuaiLevel(
  riGanWuxing: WuxingType,
  wuxingStrength: Record<WuxingType, number>,
  deLing: number,
  deDi: number,
  deShi: number,
  keXieHao: number,
  rootProfile: RootProfile
): WangShuaiLevel {
  const shengWo = WUXING_SHENG_WO[riGanWuxing];
  const samePartyStrength = wuxingStrength[riGanWuxing] + wuxingStrength[shengWo];
  const oppositeStrength = getElementStrengthSum(
    wuxingStrength,
    WUXING.filter(element => element !== riGanWuxing && element !== shengWo)
  );
  const ratio = samePartyStrength / (oppositeStrength + 0.1);
  const netScore = calculateBalanceScore(deLing, deDi, deShi, keXieHao, rootProfile);

  if (ratio >= 2.2 || netScore >= 42) return "过强";
  if (ratio >= 1.35 || netScore >= 16) return "偏强";
  if (ratio <= 0.48 || netScore <= -42) return "过弱";
  if (ratio <= 0.82 || netScore <= -16) return "偏弱";
  return "中和";
}

/**
 * 判断身旺身弱
 */
function getShenWangShuai(wangShuai: WangShuaiLevel): ShenWangShuai {
  if (wangShuai === "过强" || wangShuai === "偏强") return "身旺";
  if (wangShuai === "过弱" || wangShuai === "偏弱") return "身弱";
  return "中和";
}

/**
 * 调候判断
 * 参考“冬寒需火、夏热需水”的共识，再结合燥湿差值。
 */
function assessTiaoHou(
  wuxingStrength: Record<WuxingType, number>,
  yueZhi: string
): TiaoHouAssessment {
  const season = DIZHI_SEASON[yueZhi];
  const coldScore =
    wuxingStrength["水"] + wuxingStrength["金"] * 0.35 + (season === "冬" ? 12 : 0);
  const hotScore =
    wuxingStrength["火"] + wuxingStrength["木"] * 0.25 + (season === "夏" ? 12 : 0);
  const wetScore =
    wuxingStrength["水"] +
    wuxingStrength["土"] * 0.3 +
    (["亥", "子", "丑"].includes(yueZhi) ? 6 : 0);
  const dryScore =
    wuxingStrength["火"] +
    wuxingStrength["金"] * 0.25 +
    (["巳", "午", "未", "戌"].includes(yueZhi) ? 6 : 0);

  if ((season === "冬" || yueZhi === "丑") && coldScore - hotScore >= 16 && wuxingStrength["火"] < 26) {
    return {
      need: true,
      primary: "火",
      secondary: wetScore - dryScore >= 10 ? "土" : undefined,
      severity: coldScore - hotScore >= 28 ? "strong" : "mild",
      reason: "冬令寒湿偏重，以火暖局；湿重时再借土燥湿。",
    };
  }

  if ((season === "夏" || yueZhi === "未") && hotScore - coldScore >= 16 && wuxingStrength["水"] < 26) {
    return {
      need: true,
      primary: "水",
      secondary: dryScore - wetScore >= 10 ? "金" : undefined,
      severity: hotScore - coldScore >= 28 ? "strong" : "mild",
      reason: "夏令燥热偏重，以水润局；燥甚时再借金生水。",
    };
  }

  if (wetScore - dryScore >= 18 && wuxingStrength["火"] < 24) {
    return {
      need: true,
      primary: "火",
      secondary: "土",
      severity: "mild",
      reason: "全局湿气偏重，宜火土并用。",
    };
  }

  if (dryScore - wetScore >= 18 && wuxingStrength["水"] < 24) {
    return {
      need: true,
      primary: "水",
      secondary: "金",
      severity: "mild",
      reason: "全局燥气偏重，宜水金并用。",
    };
  }

  return {
    need: false,
    severity: "none",
  };
}

/**
 * 通关判断
 * 只在两气都强且中介之气不足时触发。
 */
function assessTongGuan(wuxingStrength: Record<WuxingType, number>): TongGuanAssessment {
  let best:
    | {
        mediator: WuxingType;
        pair: [WuxingType, WuxingType];
        tension: number;
      }
    | undefined;

  for (const rule of TONG_GUAN_RULES) {
    const [first, second] = rule.pair;
    const firstStrength = wuxingStrength[first];
    const secondStrength = wuxingStrength[second];
    const lower = Math.min(firstStrength, secondStrength);
    const higher = Math.max(firstStrength, secondStrength);

    if (lower < 16) continue;
    if (higher / (lower + 0.1) > 2.2) continue;

    const mediatorStrength = wuxingStrength[rule.mediator];
    const tension = lower * 2 - mediatorStrength;

    if (tension >= 12 && (!best || tension > best.tension)) {
      best = {
        mediator: rule.mediator,
        pair: rule.pair,
        tension,
      };
    }
  }

  if (!best) {
    return { need: false };
  }

  return {
    need: true,
    mediator: best.mediator,
    pair: best.pair,
    reason: `${best.pair[0]}${best.pair[1]}两气相战，中介之气偏弱，宜取${best.mediator}通关。`,
  };
}

function countVisibleSupport(riGanWuxing: WuxingType, tianGan: string[]): number {
  const shengWo = WUXING_SHENG_WO[riGanWuxing];
  return tianGan.filter((gan, index) => {
    if (index === 2) return false;
    const wuxing = TIANGAN_WUXING[gan];
    return wuxing === riGanWuxing || wuxing === shengWo;
  }).length;
}

function countVisibleOpposition(riGanWuxing: WuxingType, tianGan: string[]): number {
  const shengWo = WUXING_SHENG_WO[riGanWuxing];
  return tianGan.filter((gan, index) => {
    if (index === 2) return false;
    const wuxing = TIANGAN_WUXING[gan];
    return wuxing !== riGanWuxing && wuxing !== shengWo;
  }).length;
}

/**
 * 极端盘面识别
 * 条件故意收得很严，避免把普通偏旺/偏弱误判成从格。
 */
function assessPattern(
  riGanWuxing: WuxingType,
  yueZhi: string,
  tianGan: string[],
  wuxingStrength: Record<WuxingType, number>,
  rootProfile: RootProfile
): PatternAssessment {
  const shengWo = WUXING_SHENG_WO[riGanWuxing];
  const samePartyStrength = wuxingStrength[riGanWuxing] + wuxingStrength[shengWo];
  const oppositeStrength = getElementStrengthSum(
    wuxingStrength,
    WUXING.filter(element => element !== riGanWuxing && element !== shengWo)
  );
  const monthSupport = [riGanWuxing, shengWo].includes(DIZHI_WUXING[yueZhi]);
  const supportVisible = countVisibleSupport(riGanWuxing, tianGan);
  const oppositionVisible = countVisibleOpposition(riGanWuxing, tianGan);
  const rootScore = rootProfile.sameRootScore + rootProfile.supportRootScore * 0.8;
  const dominantElement = getDominantElement(wuxingStrength);

  if (
    samePartyStrength >= oppositeStrength * 2.25 &&
    rootProfile.sameRootScore >= 2.6 &&
    supportVisible >= 2 &&
    oppositionVisible === 0 &&
    monthSupport
  ) {
    return {
      type: "cong-strong",
      label: "从强倾向",
      samePartyStrength: round1(samePartyStrength),
      oppositeStrength: round1(oppositeStrength),
      rootScore: round1(rootScore),
      dominantElement,
    };
  }

  if (
    samePartyStrength * 2.6 <= oppositeStrength &&
    rootProfile.sameRootScore < 1 &&
    rootProfile.supportRootScore < 1.6 &&
    supportVisible === 0 &&
    !monthSupport
  ) {
    return {
      type: "cong-weak",
      label: "从弱倾向",
      samePartyStrength: round1(samePartyStrength),
      oppositeStrength: round1(oppositeStrength),
      rootScore: round1(rootScore),
      dominantElement,
    };
  }

  return {
    type: "normal",
    label: "常规格局",
    samePartyStrength: round1(samePartyStrength),
    oppositeStrength: round1(oppositeStrength),
    rootScore: round1(rootScore),
    dominantElement,
  };
}

function scoreStrongCandidate(
  candidate: WuxingType,
  riGanWuxing: WuxingType,
  strength: Record<WuxingType, number>,
  tongGuan: TongGuanAssessment
): number {
  const woSheng = WUXING_SHENG[riGanWuxing];
  const woKe = WUXING_KE[riGanWuxing];
  const preference = candidate === woSheng ? 6 : candidate === woKe ? 4 : 2;
  const mediatorBonus = tongGuan.mediator === candidate ? 4 : 0;
  return 100 - strength[candidate] + preference + mediatorBonus;
}

function scoreWeakCandidate(
  candidate: WuxingType,
  riGanWuxing: WuxingType,
  strength: Record<WuxingType, number>,
  tongGuan: TongGuanAssessment
): number {
  const shengWo = WUXING_SHENG_WO[riGanWuxing];
  const preference = candidate === shengWo ? 6 : candidate === riGanWuxing ? 4 : 2;
  const mediatorBonus = tongGuan.mediator === candidate ? 3 : 0;
  return 100 - strength[candidate] + preference + mediatorBonus;
}

function upsertCandidate(
  candidates: Array<{ element: WuxingType; score: number; reason: string }>,
  candidate: { element: WuxingType; score: number; reason: string }
) {
  const existing = candidates.find(item => item.element === candidate.element);
  if (!existing) {
    candidates.push(candidate);
    return;
  }

  if (candidate.score > existing.score) {
    existing.score = candidate.score;
  }

  if (!existing.reason.includes(candidate.reason)) {
    existing.reason += `；${candidate.reason}`;
  }
}

function finalizeCandidateList(
  candidates: Array<{ element: WuxingType; score: number; reason: string }>,
  selectedElement: WuxingType
): YongShenCandidate[] {
  const sorted = [...candidates]
    .sort((a, b) => b.score - a.score)
    .map(item => ({ ...item, score: round1(item.score) }));

  const selected = sorted.find(item => item.element === selectedElement);

  return sorted.map(item => {
    const gap = selected ? round1(selected.score - item.score) : 0;
    return {
      element: item.element,
      score: item.score,
      reason: item.reason,
      selected: item.element === selectedElement,
      rejectionReason:
        item.element === selectedElement
          ? undefined
          : `未优先取此项，因为它比【${selectedElement}】的综合评分低${gap}分，更适合作为辅助喜神或备选方案。`,
    };
  });
}

function buildMisjudgmentNote(params: {
  selectedElement: WuxingType;
  selectedReason: string;
  rejectedCandidates: YongShenCandidate[];
  tiaoHou: TiaoHouAssessment;
  tongGuan: TongGuanAssessment;
  pattern: PatternAssessment;
  wangShuai: WangShuaiLevel;
}): YongShenReportItem | undefined {
  const { selectedElement, selectedReason, rejectedCandidates, tiaoHou, tongGuan, pattern, wangShuai } = params;
  const topRejected = rejectedCandidates[0];

  if (pattern.type === "cong-weak") {
    return {
      title: "常见误判",
      element: topRejected?.element,
      kind: "misjudgment",
      body: `这类盘面最容易被误判成普通身弱，然后直接回头扶日主。这里没有这么做，因为命局已经接近从弱，若再硬扶日主，反而会逆势。当前优先取【${selectedElement}】，核心原因是：${selectedReason}`,
    };
  }

  if (pattern.type === "cong-strong") {
    return {
      title: "常见误判",
      element: topRejected?.element,
      kind: "misjudgment",
      body: `这类盘面常见误判是把旺局当普通偏旺处理，直接强行克泄。这里优先取【${selectedElement}】，因为命局同党成势，先顺势取用比直接逆制更稳。`,
    };
  }

  if (tiaoHou.need && tiaoHou.primary && selectedElement !== tiaoHou.primary) {
    return {
      title: "常见误判",
      element: tiaoHou.primary,
      kind: "misjudgment",
      body: `常见误判是只看寒热燥湿，直接把【${tiaoHou.primary}】立成唯一主用。这里没有直接这么取，因为虽然有调候需求，但扶抑/通关主线更强，所以把【${tiaoHou.primary}】保留为重要喜神而不是主用。`,
    };
  }

  if (tongGuan.need && tongGuan.mediator && selectedElement !== tongGuan.mediator) {
    return {
      title: "常见误判",
      element: tongGuan.mediator,
      kind: "misjudgment",
      body: `常见误判是看到两气相战就只取【${tongGuan.mediator}】通关。这里没有直接这么定，是因为虽然需要通关，但当前【${selectedElement}】在整体评分里更优，通关气更适合做辅助喜神。`,
    };
  }

  if (topRejected) {
    return {
      title: "常见误判",
      element: topRejected.element,
      kind: "misjudgment",
      body: `常见误判是只看五行数量或单一十神，就把【${topRejected.element}】直接立为主用。这里没有采用，是因为综合得令、通根、透干、调候与通关后，它的优先级仍低于【${selectedElement}】。当前命局属于${wangShuai}，所以更适合按综合评分取用。`,
    };
  }

  return undefined;
}

function buildYongShenReport(params: {
  candidates: YongShenCandidate[];
  selectedElement: WuxingType;
  tiaoHou: TiaoHouAssessment;
  tongGuan: TongGuanAssessment;
  pattern: PatternAssessment;
  wangShuai: WangShuaiLevel;
}): YongShenReportItem[] {
  const { candidates, selectedElement, tiaoHou, tongGuan, pattern, wangShuai } = params;
  const selected = candidates.find(candidate => candidate.selected);
  const rejected = candidates.filter(candidate => !candidate.selected);
  const report: YongShenReportItem[] = [];

  if (selected) {
    report.push({
      title: "第一候选",
      element: selected.element,
      kind: "selected",
      body: `优先取【${selected.element}】。${selected.reason} 这是当前综合评分最高、最符合主线的结果。`,
    });
  }

  rejected.slice(0, 2).forEach((candidate, index) => {
    report.push({
      title: index === 0 ? "第二候选" : "第三候选",
      element: candidate.element,
      kind: "alternative",
      body: `${candidate.reason} ${candidate.rejectionReason ?? ""}`,
    });
  });

  const misjudgment = buildMisjudgmentNote({
    selectedElement,
    selectedReason: selected?.reason ?? "",
    rejectedCandidates: rejected,
    tiaoHou,
    tongGuan,
    pattern,
    wangShuai,
  });

  if (misjudgment) {
    report.push(misjudgment);
  }

  return report;
}

/**
 * 确定用神和喜神
 * 规则顺序：
 * 1. 强调候（寒热燥湿很明显时优先）。
 * 2. 特殊盘面顺势处理。
 * 3. 常规格局按扶抑定主线。
 * 4. 通关作为辅助优先并入喜神。
 */
function determineYongXiShen(params: {
  riGanWuxing: WuxingType;
  wangShuai: WangShuaiLevel;
  wuxingStrength: Record<WuxingType, number>;
  tiaoHou: TiaoHouAssessment;
  tongGuan: TongGuanAssessment;
  pattern: PatternAssessment;
}): {
  yongShen: WuxingType;
  xiShen: WuxingType[];
  principles: AnalysisPrinciple[];
  decisionSummary: string;
  candidates: YongShenCandidate[];
  report: YongShenReportItem[];
} {
  const { riGanWuxing, wangShuai, wuxingStrength, tiaoHou, tongGuan, pattern } = params;

  const shengWo = WUXING_SHENG_WO[riGanWuxing];
  const woSheng = WUXING_SHENG[riGanWuxing];
  const woKe = WUXING_KE[riGanWuxing];
  const keWo = WUXING_KE_WO[riGanWuxing];

  const principleSet = new Set<AnalysisPrinciple>();
  let yongShen: WuxingType | undefined;
  const xiShen: WuxingType[] = [];
  const candidatePool: Array<{ element: WuxingType; score: number; reason: string }> = [];
  const decisionNotes: string[] = [];

  if (tiaoHou.need) principleSet.add("调候");
  if (tongGuan.need) principleSet.add("通关");

  if (tiaoHou.need && tiaoHou.primary && tiaoHou.severity === "strong") {
    yongShen = tiaoHou.primary;
    upsertCandidate(candidatePool, {
      element: tiaoHou.primary,
      score: 135,
      reason: `调候失衡明显，优先处理寒暖燥湿问题。${tiaoHou.reason ?? ""}`,
    });
    if (tiaoHou.secondary) {
      upsertCandidate(candidatePool, {
        element: tiaoHou.secondary,
        score: 108,
        reason: `作为调候辅助气，配合${tiaoHou.primary}一起修正气候失衡。`,
      });
    }
    decisionNotes.push(`调候失衡较重，先立${tiaoHou.primary}，再看扶抑与通关。`);
  }

  if (!yongShen && pattern.type === "cong-weak") {
    principleSet.add("从弱");
    const candidates = [woSheng, woKe, keWo].sort(
      (a, b) => wuxingStrength[b] - wuxingStrength[a]
    );
    yongShen = candidates[0];
    candidates.forEach((element, index) => {
      upsertCandidate(candidatePool, {
        element,
        score: 124 - index * 8 + wuxingStrength[element] * 0.1,
        reason:
          index === 0
            ? `命局呈从弱倾向，顺势取局中更强的${element}，避免逆势再扶日主。`
            : `从弱盘面下，${element}也能顺势成局，但优先级略低。`,
      });
    });
    xiShen.push(...candidates.slice(1));
    decisionNotes.push(`日主根气浅、同党弱，接近从弱思路，优先顺势不逆扶。`);
  }

  if (!yongShen && pattern.type === "cong-strong") {
    principleSet.add("从强");
    yongShen = pickStronger(riGanWuxing, shengWo, wuxingStrength);
    upsertCandidate(candidatePool, {
      element: yongShen,
      score: 126,
      reason: `命局呈从强倾向，优先顺着旺势取${yongShen}，避免贸然逆势制化。`,
    });
    upsertCandidate(candidatePool, {
      element: yongShen === riGanWuxing ? shengWo : riGanWuxing,
      score: 118,
      reason: "同党之气仍可顺势助旺，但次于当前主导五行。",
    });
    upsertCandidate(candidatePool, {
      element: woSheng,
      score: 96,
      reason: "泄秀之气可作次级出口，但不宜压过顺势主线。",
    });
    xiShen.push(pickStronger(shengWo, riGanWuxing, wuxingStrength), woSheng);
    decisionNotes.push(`命局同党远强于异党，按从强倾向处理。`);
  }

  if (!yongShen) {
    principleSet.add("扶抑");

    if (wangShuai === "过强" || wangShuai === "偏强") {
      const candidates = [woSheng, woKe, keWo].sort(
        (a, b) =>
          scoreStrongCandidate(b, riGanWuxing, wuxingStrength, tongGuan) -
          scoreStrongCandidate(a, riGanWuxing, wuxingStrength, tongGuan)
      );
      [woSheng, woKe, keWo].forEach(element => {
        upsertCandidate(candidatePool, {
          element,
          score: scoreStrongCandidate(element, riGanWuxing, wuxingStrength, tongGuan),
          reason:
            element === woSheng
              ? "日主偏旺时先看泄秀，食伤泄身通常最柔和。"
              : element === woKe
                ? "财星可耗身，把过旺之气转为外泄。"
                : "官杀可制身，但通常排在食伤、财星之后。",
        });
      });
      yongShen = candidates[0];
      xiShen.push(...candidates.slice(1));
      decisionNotes.push(`日主${wangShuai}，按扶抑先比较泄、耗、克三条路径。`);
    } else if (wangShuai === "过弱" || wangShuai === "偏弱") {
      const candidates = [shengWo, riGanWuxing].sort(
        (a, b) =>
          scoreWeakCandidate(b, riGanWuxing, wuxingStrength, tongGuan) -
          scoreWeakCandidate(a, riGanWuxing, wuxingStrength, tongGuan)
      );
      [shengWo, riGanWuxing, woSheng].forEach(element => {
        const score =
          element === woSheng
            ? 70 - wuxingStrength[element] * 0.2
            : scoreWeakCandidate(element, riGanWuxing, wuxingStrength, tongGuan);
        upsertCandidate(candidatePool, {
          element,
          score,
          reason:
            element === shengWo
              ? "日主偏弱时优先取印星生身，先补源头。"
              : element === riGanWuxing
                ? "比劫可直接帮身，是常见次选。"
                : "食伤会继续泄身，通常只作低优先级备选。",
        });
      });
      yongShen = candidates[0];
      xiShen.push(...candidates.slice(1), woSheng);
      decisionNotes.push(`日主${wangShuai}，按扶抑先比较印星与比劫谁更适合先扶身。`);
    } else {
      const balancedCandidates = [tongGuan.mediator, tiaoHou.primary, woSheng, shengWo, woKe]
        .filter((value): value is WuxingType => Boolean(value));
      balancedCandidates.forEach((element, index) => {
        upsertCandidate(candidatePool, {
          element,
          score: 92 - index * 4 + (tongGuan.mediator === element ? 6 : 0) + (tiaoHou.primary === element ? 5 : 0),
          reason:
            element === tongGuan.mediator
              ? "中和盘若见两气相战，先取通关。"
              : element === tiaoHou.primary
                ? "中和盘若见轻度寒热失衡，先顾调候。"
                : element === woSheng
                  ? "中和盘可用食伤作温和出口。"
                  : element === shengWo
                    ? "中和盘也可轻取印星维持平衡。"
                    : "财星可作为温和耗身的次选。",
        });
      });
      yongShen = tongGuan.mediator ?? tiaoHou.primary ?? woSheng;
      xiShen.push(shengWo, woKe);
      decisionNotes.push(`日主接近中和，优先看通关与调候，再做轻微扶抑。`);
    }
  }

  if (tiaoHou.need && tiaoHou.primary && yongShen !== tiaoHou.primary) {
    xiShen.unshift(tiaoHou.primary);
    upsertCandidate(candidatePool, {
      element: tiaoHou.primary,
      score: 104,
      reason: `虽然没有立为主用，但${tiaoHou.primary}仍承担调候任务。${tiaoHou.reason ?? ""}`,
    });
  }

  if (tiaoHou.need && tiaoHou.secondary) {
    xiShen.push(tiaoHou.secondary);
    upsertCandidate(candidatePool, {
      element: tiaoHou.secondary,
      score: 90,
      reason: `作为调候辅助气，配合${tiaoHou.primary}改善寒暖燥湿。`,
    });
  }

  if (tongGuan.need && tongGuan.mediator && yongShen !== tongGuan.mediator) {
    xiShen.unshift(tongGuan.mediator);
    upsertCandidate(candidatePool, {
      element: tongGuan.mediator,
      score: 102,
      reason: `虽然不是主用，但${tongGuan.mediator}承担通关职责。${tongGuan.reason ?? ""}`,
    });
  }

  // 对外最终只保留前 3 个“喜用”总项：
  // 1 个用神 + 最多 2 个喜神。
  // 更完整的候选解释仍保留在 report/candidates 中。
  const finalXiShen = uniqueElements(xiShen).filter(element => element !== yongShen).slice(0, 2);
  const finalCandidates = finalizeCandidateList(candidatePool, yongShen);
  const report = buildYongShenReport({
    candidates: finalCandidates,
    selectedElement: yongShen,
    tiaoHou,
    tongGuan,
    pattern,
    wangShuai,
  });

  return {
    yongShen,
    xiShen: finalXiShen,
    principles: Array.from(principleSet),
    decisionSummary: decisionNotes.join(" "),
    candidates: finalCandidates,
    report,
  };
}

/**
 * 确定忌神
 */
function determineJiShen(params: {
  riGanWuxing: WuxingType;
  wangShuai: WangShuaiLevel;
  pattern: PatternAssessment;
  wuxingStrength: Record<WuxingType, number>;
}): WuxingType {
  const { riGanWuxing, wangShuai, pattern, wuxingStrength } = params;
  const shengWo = WUXING_SHENG_WO[riGanWuxing];
  const woSheng = WUXING_SHENG[riGanWuxing];
  const woKe = WUXING_KE[riGanWuxing];
  const keWo = WUXING_KE_WO[riGanWuxing];

  if (pattern.type === "cong-weak") {
    return pickStronger(riGanWuxing, shengWo, wuxingStrength);
  }

  if (pattern.type === "cong-strong") {
    return [woSheng, woKe, keWo].sort((a, b) => wuxingStrength[b] - wuxingStrength[a])[0];
  }

  if (wangShuai === "过强" || wangShuai === "偏强") {
    return pickStronger(riGanWuxing, shengWo, wuxingStrength);
  }

  if (wangShuai === "过弱" || wangShuai === "偏弱") {
    return [keWo, woKe, woSheng].sort((a, b) => wuxingStrength[b] - wuxingStrength[a])[0];
  }

  return getDominantElement(wuxingStrength);
}

/**
 * 生成颜色推荐文案
 */
function generateColorAdvice(yongShen: WuxingType, xiShen: WuxingType[]): string {
  const allShen = uniqueElements([yongShen, ...xiShen]);
  const shenNames = allShen.join("和");
  const colors = allShen.map(wx => WUXING_COLOR_DESC[wx]).join("、");

  return `你的喜用神是${shenNames}，${colors}的水晶会比较适合你。`;
}

/**
 * 生成简洁文案
 */
function generateSimpleText(result: {
  riGanWuxing: WuxingType;
  wangShuai: WangShuaiLevel;
  yongShen: WuxingType;
  xiShen: WuxingType[];
  needTiaoHou: boolean;
  tiaoHouWuxing?: WuxingType;
}): string {
  const { riGanWuxing, wangShuai, yongShen, xiShen, needTiaoHou, tiaoHouWuxing } = result;

  const allXiYong = uniqueElements([yongShen, ...xiShen]);
  const xiYongText = allXiYong.join("");
  const wangShuaiDesc =
    wangShuai === "中和" ? "较为平衡" : wangShuai === "偏强" ? "偏旺" : wangShuai;

  let text = `日干五行属${riGanWuxing}，整体力量${wangShuaiDesc}，主用【${yongShen}】，辅以【${xiYongText}】来调平命局。`;

  if (needTiaoHou && tiaoHouWuxing) {
    text += ` 此盘还有明显调候需求，${tiaoHouWuxing}气需要优先照顾。`;
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
  analysisPrinciples: AnalysisPrinciple[];
  pattern: string;
  needTiaoHou: boolean;
  tiaoHouWuxing?: WuxingType;
  needTongGuan: boolean;
  tongGuanWuxing?: WuxingType;
  tiaoHouReason?: string;
  tongGuanReason?: string;
  samePartyStrength: number;
  oppositeStrength: number;
  rootScore: number;
  decisionSummary: string;
  yongShenCandidates: YongShenCandidate[];
  yongShenReport: YongShenReportItem[];
  deLing: number;
  deDi: number;
  deShi: number;
  totalScore: number;
}): string {
  const {
    riGan,
    riGanWuxing,
    wangShuai,
    yongShen,
    xiShen,
    jiShen,
    wuxingCount,
    shiShenCount,
    analysisPrinciples,
    pattern,
    needTiaoHou,
    tiaoHouWuxing,
    needTongGuan,
    tongGuanWuxing,
    tiaoHouReason,
    tongGuanReason,
    samePartyStrength,
    oppositeStrength,
    rootScore,
    decisionSummary,
    yongShenCandidates,
    yongShenReport,
    deLing,
    deDi,
    deShi,
    totalScore,
  } = result;

  const missingWuxing = WUXING.filter(wx => wuxingCount[wx] === 0);
  const missingText = missingWuxing.length > 0 ? `命局偏枯，缺【${missingWuxing.join("、")}】。` : "";
  const wangShuaiDesc = wangShuai === "中和" ? "较为平衡" : wangShuai;

  let text = "【日干分析】\n";
  text += `日干为${riGan}，五行属${riGanWuxing}。\n\n`;

  text += "【判定主线】\n";
  text += `本次取用以【${analysisPrinciples.join("、")}】为主，格局倾向为【${pattern}】。\n\n`;

  text += "【五行强弱】\n";
  text += `从整体气势看，日主属于${wangShuaiDesc}。${missingText}\n\n`;

  text += "【判定过程】\n";
  text += `得令：${deLing}，得地：${deDi}，得势：${deShi}，综合平衡分：${totalScore}。\n`;
  text += `同党强度：${samePartyStrength}，异党强度：${oppositeStrength}，根气分：${rootScore}。\n`;
  text += `${decisionSummary}\n\n`;

  text += "【十神分布】\n";
  text += `印星（正印+偏印）：${round1(shiShenCount.正印 + shiShenCount.偏印)}\n`;
  text += `比劫（比肩+劫财）：${round1(shiShenCount.比肩 + shiShenCount.劫财)}\n`;
  text += `食伤（食神+伤官）：${round1(shiShenCount.食神 + shiShenCount.伤官)}\n`;
  text += `财星（正财+偏财）：${round1(shiShenCount.正财 + shiShenCount.偏财)}\n`;
  text += `官杀（正官+七杀）：${round1(shiShenCount.正官 + shiShenCount.七杀)}\n\n`;

  text += "【调候与通关】\n";
  text += needTiaoHou
    ? `命局有调候需求，优先照顾【${tiaoHouWuxing}】气。${tiaoHouReason ?? ""}\n`
    : "寒暖燥湿未见明显失衡，可不单独立调候。\n";
  text += needTongGuan
    ? `局中存在两气相战，宜以【${tongGuanWuxing}】通关。${tongGuanReason ?? ""}\n\n`
    : "未见明显两强相战，无需单独取通关神。\n\n";

  text += "【用神喜神】\n";
  text += `• 用神为【${yongShen}】\n`;
  text += `• 喜神为【${xiShen.length > 0 ? xiShen.join("、") : "暂无明显辅助喜神"}】\n`;
  text += `• 忌神为【${jiShen}】\n`;

  text += "\n【多方案报告】\n";
  yongShenReport.forEach(item => {
    text += item.element
      ? `${item.title}【${item.element}】：${item.body}\n`
      : `${item.title}：${item.body}\n`;
  });

  text += "\n【候选比较】\n";
  yongShenCandidates.forEach(candidate => {
    text += candidate.selected
      ? `✓ ${candidate.element}：评分${candidate.score}。${candidate.reason} 因此优先立为用神。\n`
      : `• ${candidate.element}：评分${candidate.score}。${candidate.reason} ${candidate.rejectionReason ?? ""}\n`;
  });

  return text;
}

/**
 * 主分析函数
 */
export function analyzeBazi(paipanResult: any): BaziAnalysisResult {
  const tianGan = paipanResult.ctg as string[];
  const diZhi = paipanResult.cdz as string[];
  const siZhu = paipanResult.sz as string[];

  const riGan = tianGan[2];
  const riGanWuxing = TIANGAN_WUXING[riGan];
  const yueZhi = diZhi[1];

  const wuxingCount = createEmptyWuxingRecord();
  for (const gan of tianGan) {
    wuxingCount[TIANGAN_WUXING[gan]]++;
  }
  for (const zhi of diZhi) {
    wuxingCount[DIZHI_WUXING[zhi]]++;
  }

  const wuxingStrength = calculateWuxingStrength(tianGan, diZhi, yueZhi);
  const shiShenCount = countShiShen(riGan, tianGan, diZhi);
  const rootProfile = getRootProfile(riGanWuxing, diZhi);

  const deLing = calculateDeLing(riGanWuxing, yueZhi);
  const deDi = calculateDeDi(riGanWuxing, rootProfile);
  const deShi = calculateDeShi(riGanWuxing, tianGan);
  const keXieHao = calculateKeXieHao(riGanWuxing, tianGan, diZhi);
  const totalScore = calculateBalanceScore(deLing, deDi, deShi, keXieHao, rootProfile);

  const wangShuai = getWangShuaiLevel(
    riGanWuxing,
    wuxingStrength,
    deLing,
    deDi,
    deShi,
    keXieHao,
    rootProfile
  );
  const shenWangShuai = getShenWangShuai(wangShuai);

  const tiaoHou = assessTiaoHou(wuxingStrength, yueZhi);
  const tongGuan = assessTongGuan(wuxingStrength);
  const pattern = assessPattern(riGanWuxing, yueZhi, tianGan, wuxingStrength, rootProfile);

  const { yongShen, xiShen, principles, decisionSummary, candidates, report } = determineYongXiShen({
    riGanWuxing,
    wangShuai,
    wuxingStrength,
    tiaoHou,
    tongGuan,
    pattern,
  });

  const jiShen = determineJiShen({
    riGanWuxing,
    wangShuai,
    pattern,
    wuxingStrength,
  });

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
    totalScore,
    wangShuai,
    shenWangShuai,
    yongShen,
    xiShen,
    jiShen,
    needTiaoHou: tiaoHou.need,
    tiaoHouWuxing: tiaoHou.primary,
    needTongGuan: tongGuan.need,
    tongGuanWuxing: tongGuan.mediator,
    pattern: pattern.label,
    analysisPrinciples: principles,
    samePartyStrength: pattern.samePartyStrength,
    oppositeStrength: pattern.oppositeStrength,
    rootScore: pattern.rootScore,
    decisionSummary,
    yongShenCandidates: candidates,
    yongShenReport: report,
    tiaoHouReason: tiaoHou.reason,
    tongGuanReason: tongGuan.reason,
  };

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
export function formatResultForCopy(
  result: BaziAnalysisResult,
  basicInfo?: {
    gender?: string;
    birthDate?: string;
    birthTime?: string;
  }
): string {
  let text = "";

  if (basicInfo) {
    text += "【基本信息】\n";
    if (basicInfo.gender) text += `性别：${basicInfo.gender}\n`;
    if (basicInfo.birthDate) text += `出生日期：${basicInfo.birthDate}\n`;
    if (basicInfo.birthTime) text += `出生时间：${basicInfo.birthTime}\n`;
    text += "\n";
  }

  text += "【八字排盘】\n";
  text += `四柱：${result.siZhu.join(" ")}\n`;
  text += `天干：${result.tianGan.join(" ")}\n`;
  text += `地支：${result.diZhi.join(" ")}\n\n`;

  text += "【五行统计】\n";
  text += `金：${result.wuxingCount["金"]}个  `;
  text += `水：${result.wuxingCount["水"]}个  `;
  text += `木：${result.wuxingCount["木"]}个  `;
  text += `火：${result.wuxingCount["火"]}个  `;
  text += `土：${result.wuxingCount["土"]}个\n\n`;

  text += "【分析结果】\n";
  text += result.simpleText + "\n\n";

  text += "【颜色推荐】\n";
  text += result.colorAdvice;

  return text;
}

/**
 * 获取简洁文案用于直接复制发送
 */
export function getSimpleTextForCopy(result: BaziAnalysisResult): string {
  return result.simpleText;
}
