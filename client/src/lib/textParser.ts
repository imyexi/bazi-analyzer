/**
 * 智能文本解析模块
 * 支持多种格式的生辰信息文本解析
 */

export interface ParsedBirthInfo {
  year?: number;
  month?: number;
  day?: number;
  hour?: number;
  minute?: number;
  gender?: 'male' | 'female';
  location?: string;
  isLunar?: boolean;
  confidence: number;
  rawText: string;
}

// 时辰对照表
const SHICHEN_MAP: Record<string, { start: number; middle: number }> = {
  '子': { start: 23, middle: 0 },
  '丑': { start: 1, middle: 2 },
  '寅': { start: 3, middle: 4 },
  '卯': { start: 5, middle: 6 },
  '辰': { start: 7, middle: 8 },
  '巳': { start: 9, middle: 10 },
  '午': { start: 11, middle: 12 },
  '未': { start: 13, middle: 14 },
  '申': { start: 15, middle: 16 },
  '酉': { start: 17, middle: 18 },
  '戌': { start: 19, middle: 20 },
  '亥': { start: 21, middle: 22 },
};

// 中文数字对照
const CN_NUM_MAP: Record<string, number> = {
  '零': 0, '〇': 0, '一': 1, '二': 2, '三': 3, '四': 4,
  '五': 5, '六': 6, '七': 7, '八': 8, '九': 9, '十': 10,
  '十一': 11, '十二': 12, '廿': 20, '卅': 30,
};

// 月份英文对照
const EN_MONTH_MAP: Record<string, number> = {
  'jan': 1, 'january': 1,
  'feb': 2, 'february': 2,
  'mar': 3, 'march': 3,
  'apr': 4, 'april': 4,
  'may': 5,
  'jun': 6, 'june': 6,
  'jul': 7, 'july': 7,
  'aug': 8, 'august': 8,
  'sep': 9, 'september': 9,
  'oct': 10, 'october': 10,
  'nov': 11, 'november': 11,
  'dec': 12, 'december': 12,
};

/**
 * 将中文数字转换为阿拉伯数字
 */
function cnNumToArabic(cnNum: string): number {
  if (!cnNum) return NaN;
  
  // 直接匹配
  if (CN_NUM_MAP[cnNum] !== undefined) {
    return CN_NUM_MAP[cnNum];
  }
  
  // 处理如"廿一"、"廿二"等
  if (cnNum.startsWith('廿')) {
    const rest = cnNum.slice(1);
    if (rest && CN_NUM_MAP[rest] !== undefined) {
      return 20 + CN_NUM_MAP[rest];
    }
    return 20;
  }
  
  // 处理如"卅一"等
  if (cnNum.startsWith('卅')) {
    const rest = cnNum.slice(1);
    if (rest && CN_NUM_MAP[rest] !== undefined) {
      return 30 + CN_NUM_MAP[rest];
    }
    return 30;
  }
  
  // 处理"十X"格式
  if (cnNum.startsWith('十')) {
    const rest = cnNum.slice(1);
    if (rest && CN_NUM_MAP[rest] !== undefined) {
      return 10 + CN_NUM_MAP[rest];
    }
    return 10;
  }
  
  // 处理"X十X"格式
  const match = cnNum.match(/^([一二三四五六七八九])十([一二三四五六七八九])?$/);
  if (match) {
    const tens = CN_NUM_MAP[match[1]] * 10;
    const ones = match[2] ? CN_NUM_MAP[match[2]] : 0;
    return tens + ones;
  }
  
  return NaN;
}

/**
 * 预处理文本
 */
function preprocess(text: string): string {
  return text
    .replace(/\s+/g, ' ')
    .replace(/[，。、；：""''【】（）]/g, ' ')
    .replace(/出生日期|出生时间|生日|生于|出生于|生辰|时辰/g, ' ')
    .replace(/公历|阳历|新历/g, '')
    .trim();
}

/**
 * 解析年份
 */
function parseYear(text: string): { year?: number; remaining: string } {
  // 4位年份
  let match = text.match(/(?:^|\D)((?:19|20)\d{2})(?:年|\s|\/|-|\.|\D|$)/);
  if (match) {
    return {
      year: parseInt(match[1]),
      remaining: text.replace(match[1], ' ').replace(/年/, ' ')
    };
  }
  
  // 2位年份（假设90-99是1990-1999，00-30是2000-2030）
  match = text.match(/(?:^|\D)(\d{2})(?:年)/);
  if (match) {
    const twoDigit = parseInt(match[1]);
    const year = twoDigit >= 31 ? 1900 + twoDigit : 2000 + twoDigit;
    return {
      year,
      remaining: text.replace(match[0], ' ')
    };
  }
  
  return { remaining: text };
}

/**
 * 解析月份
 */
function parseMonth(text: string): { month?: number; remaining: string } {
  // 数字月份
  let match = text.match(/(?:^|\D)(0?[1-9]|1[0-2])(?:月|\s|\/|-|\.)/);
  if (match) {
    return {
      month: parseInt(match[1]),
      remaining: text.replace(match[0], ' ')
    };
  }
  
  // 中文月份
  match = text.match(/(正|一|二|三|四|五|六|七|八|九|十|十一|十二|腊)月/);
  if (match) {
    const cnMonth = match[1];
    let month: number;
    if (cnMonth === '正') month = 1;
    else if (cnMonth === '腊') month = 12;
    else month = cnNumToArabic(cnMonth);
    
    return {
      month,
      remaining: text.replace(match[0], ' ')
    };
  }
  
  // 英文月份
  const lowerText = text.toLowerCase();
  for (const [en, num] of Object.entries(EN_MONTH_MAP)) {
    if (lowerText.includes(en)) {
      return {
        month: num,
        remaining: text.replace(new RegExp(en, 'i'), ' ')
      };
    }
  }
  
  return { remaining: text };
}

/**
 * 解析日期
 */
function parseDay(text: string): { day?: number; remaining: string } {
  // 数字日期
  let match = text.match(/(?:^|\D)(0?[1-9]|[12]\d|3[01])(?:日|号|\s|$)/);
  if (match) {
    return {
      day: parseInt(match[1]),
      remaining: text.replace(match[0], ' ')
    };
  }
  
  // 中文日期（廿一、廿二等）
  match = text.match(/(初[一二三四五六七八九十]|十[一二三四五六七八九]?|廿[一二三四五六七八九]?|卅[一]?)/);
  if (match) {
    let day: number;
    const cnDay = match[1];
    if (cnDay.startsWith('初')) {
      day = cnNumToArabic(cnDay.slice(1));
    } else {
      day = cnNumToArabic(cnDay);
    }
    return {
      day,
      remaining: text.replace(match[0], ' ')
    };
  }
  
  return { remaining: text };
}

/**
 * 解析时间
 */
function parseTime(text: string): { hour?: number; minute?: number; remaining: string } {
  // 时辰
  const shichenMatch = text.match(/(子|丑|寅|卯|辰|巳|午|未|申|酉|戌|亥)时/);
  if (shichenMatch) {
    const shichen = SHICHEN_MAP[shichenMatch[1]];
    return {
      hour: shichen.middle,
      minute: 0,
      remaining: text.replace(shichenMatch[0], ' ')
    };
  }
  
  // 24小时制 HH:MM 或 HH时MM分
  let match = text.match(/(\d{1,2})[:：时](\d{1,2})(?:分)?/);
  if (match) {
    return {
      hour: parseInt(match[1]),
      minute: parseInt(match[2]),
      remaining: text.replace(match[0], ' ')
    };
  }
  
  // 只有小时
  match = text.match(/(\d{1,2})(?:时|点)/);
  if (match) {
    let hour = parseInt(match[1]);
    
    // 检查上午/下午
    if (text.includes('下午') || text.includes('晚上') || text.toLowerCase().includes('pm')) {
      if (hour < 12) hour += 12;
    }
    if ((text.includes('上午') || text.toLowerCase().includes('am')) && hour === 12) {
      hour = 0;
    }
    
    // 检查"半"
    const minute = text.includes('半') ? 30 : 0;
    
    return {
      hour,
      minute,
      remaining: text.replace(match[0], ' ')
    };
  }
  
  // 12小时制 with AM/PM
  match = text.match(/(\d{1,2})(?::(\d{2}))?\s*(am|pm|AM|PM)/i);
  if (match) {
    let hour = parseInt(match[1]);
    const minute = match[2] ? parseInt(match[2]) : 0;
    const isPM = match[3].toLowerCase() === 'pm';
    
    if (isPM && hour < 12) hour += 12;
    if (!isPM && hour === 12) hour = 0;
    
    return {
      hour,
      minute,
      remaining: text.replace(match[0], ' ')
    };
  }
  
  return { remaining: text };
}

/**
 * 解析性别
 */
function parseGender(text: string): { gender?: 'male' | 'female'; remaining: string } {
  if (/男|乾|male|man|boy/i.test(text)) {
    return { gender: 'male', remaining: text };
  }
  if (/女|坤|female|woman|girl/i.test(text)) {
    return { gender: 'female', remaining: text };
  }
  return { remaining: text };
}

/**
 * 解析地区
 */
function parseLocation(text: string): { location?: string; remaining: string } {
  // 常见城市
  const cities = [
    '北京', '上海', '广州', '深圳', '天津', '重庆', '成都', '杭州', '武汉', '南京',
    '西安', '苏州', '郑州', '长沙', '青岛', '沈阳', '大连', '厦门', '福州', '济南',
    '哈尔滨', '长春', '昆明', '贵阳', '南宁', '海口', '石家庄', '太原', '呼和浩特',
    '乌鲁木齐', '兰州', '西宁', '银川', '拉萨', '合肥', '南昌', '香港', '澳门', '台北'
  ];
  
  for (const city of cities) {
    if (text.includes(city)) {
      return { location: city, remaining: text };
    }
  }
  
  // 匹配省市区格式
  const match = text.match(/([^\s]+(?:省|市|区|县|镇))/);
  if (match) {
    return { location: match[1], remaining: text };
  }
  
  return { remaining: text };
}

/**
 * 检测是否为农历
 */
function detectLunar(text: string): boolean {
  return /农历|阴历|旧历|初[一二三四五六七八九十]|廿|卅/.test(text);
}

/**
 * 主解析函数
 */
export function parseBirthInfo(text: string): ParsedBirthInfo {
  const rawText = text;
  let processedText = preprocess(text);
  let confidence = 0;
  
  // 检测农历
  const isLunar = detectLunar(text);
  
  // 解析各部分
  const yearResult = parseYear(processedText);
  processedText = yearResult.remaining;
  
  const monthResult = parseMonth(processedText);
  processedText = monthResult.remaining;
  
  const dayResult = parseDay(processedText);
  processedText = dayResult.remaining;
  
  const timeResult = parseTime(processedText);
  processedText = timeResult.remaining;
  
  const genderResult = parseGender(processedText);
  const locationResult = parseLocation(processedText);
  
  // 计算置信度
  if (yearResult.year) confidence += 25;
  if (monthResult.month) confidence += 25;
  if (dayResult.day) confidence += 25;
  if (timeResult.hour !== undefined) confidence += 15;
  if (genderResult.gender) confidence += 5;
  if (locationResult.location) confidence += 5;
  
  return {
    year: yearResult.year,
    month: monthResult.month,
    day: dayResult.day,
    hour: timeResult.hour,
    minute: timeResult.minute ?? 0,
    gender: genderResult.gender,
    location: locationResult.location,
    isLunar,
    confidence,
    rawText,
  };
}

/**
 * 格式化解析结果为可读文本
 */
export function formatParsedInfo(info: ParsedBirthInfo): string {
  const parts: string[] = [];
  
  if (info.year && info.month && info.day) {
    parts.push(`${info.isLunar ? '农历' : '公历'}${info.year}年${info.month}月${info.day}日`);
  }
  
  if (info.hour !== undefined) {
    parts.push(`${info.hour}时${info.minute || 0}分`);
  }
  
  if (info.gender) {
    parts.push(info.gender === 'male' ? '男' : '女');
  }
  
  if (info.location) {
    parts.push(info.location);
  }
  
  return parts.join(' ');
}
