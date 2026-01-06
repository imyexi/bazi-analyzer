/**
 * Paipan.js 包装器
 * 提供TypeScript类型支持和简化的API
 */

// @ts-ignore - paipan.js 是纯JS库
import './paipan.js';

// 声明全局paipan对象
declare global {
  interface Window {
    p: any;
  }
}

export interface PaipanResult {
  // 基本信息
  mz: string;           // 命造（乾/坤）
  xb: string;           // 性别
  gl: number[];         // 公历 [年,月,日]
  nl: any;              // 农历信息
  sx: string;           // 生肖
  xz: string;           // 星座
  cyy: string;          // 日干阴阳
  
  // 四柱信息
  tg: number[];         // 天干代码
  dz: number[];         // 地支代码
  sz: string[];         // 四柱字符
  ctg: string[];        // 天干字符
  cdz: string[];        // 地支字符
  
  // 五行统计
  nwx: number[];        // 五行数量 [金,水,木,火,土]
  nyy: number[];        // 阴阳数量
  
  // 藏干信息
  bctg: string[];       // 藏干文字
  bzcg: string[];       // 藏干十神
  
  // 大运信息
  qyy: number;          // 起运年
  qyy_desc: string;     // 起运描述
  qyy_desc2: string;    // 交脱大运时间
  dy: any[];            // 大运数组
  
  // 真太阳时
  pty?: number[];       // 地方平太阳时
  zty?: number[];       // 地方真太阳时
}

/**
 * 获取paipan实例
 */
function getPaipan(): any {
  if (typeof window !== 'undefined' && window.p) {
    return window.p;
  }
  throw new Error('Paipan library not loaded');
}

/**
 * 排盘主函数
 * @param gender 性别：0=男，1=女
 * @param year 年
 * @param month 月
 * @param day 日
 * @param hour 时
 * @param minute 分
 * @param second 秒
 * @param longitude 经度（可选，用于计算真太阳时）
 * @param latitude 纬度（可选）
 */
export function fatemaps(
  gender: number,
  year: number,
  month: number,
  day: number,
  hour: number,
  minute: number = 0,
  second: number = 0,
  longitude?: number,
  latitude?: number
): PaipanResult | null {
  try {
    const p = getPaipan();
    
    if (longitude !== undefined && latitude !== undefined) {
      return p.fatemaps(gender, year, month, day, hour, minute, second, longitude, latitude);
    }
    
    return p.fatemaps(gender, year, month, day, hour, minute, second);
  } catch (error) {
    console.error('Paipan error:', error);
    return null;
  }
}

/**
 * 农历转公历
 */
export function lunarToSolar(year: number, month: number, day: number, isLeap: boolean = false): number[] | null {
  try {
    const p = getPaipan();
    return p.Lunar2Solar(year, month, day, isLeap ? 1 : 0);
  } catch (error) {
    console.error('Lunar to Solar error:', error);
    return null;
  }
}

/**
 * 公历转农历
 */
export function solarToLunar(year: number, month: number, day: number): any {
  try {
    const p = getPaipan();
    return p.Solar2Lunar(year, month, day);
  } catch (error) {
    console.error('Solar to Lunar error:', error);
    return null;
  }
}

/**
 * 获取天干文字
 */
export function getTianganText(code: number): string {
  const tiangan = ['甲', '乙', '丙', '丁', '戊', '己', '庚', '辛', '壬', '癸'];
  return tiangan[code] || '';
}

/**
 * 获取地支文字
 */
export function getDizhiText(code: number): string {
  const dizhi = ['子', '丑', '寅', '卯', '辰', '巳', '午', '未', '申', '酉', '戌', '亥'];
  return dizhi[code] || '';
}

/**
 * 获取五行文字
 */
export function getWuxingText(code: number): string {
  const wuxing = ['金', '水', '木', '火', '土'];
  return wuxing[code] || '';
}

/**
 * 获取生肖文字
 */
export function getShengxiaoText(code: number): string {
  const shengxiao = ['鼠', '牛', '虎', '兔', '龙', '蛇', '马', '羊', '猴', '鸡', '狗', '猪'];
  return shengxiao[code] || '';
}
