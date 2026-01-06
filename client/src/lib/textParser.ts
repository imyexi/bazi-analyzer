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
    .replace(/[，。、；：""''【】（）]/g, ' ')
    .replace(/出生日期|出生时间|生日|生于|出生于|生辰|时辰/g, ' ')
    .trim();
}

/**
 * 解析紧凑日期格式 如 19900510, 1995510, 19780307
 * 以及空格分隔格式如 1978 03 07
 */
function parseCompactDate(text: string): { year?: number; month?: number; day?: number; remaining: string } {
  // 空格分隔格式: YYYY MM DD 或 YYYY M D (如 1978 03 07 或 1978 3 7)
  let match = text.match(/(?:^|\D)((?:19|20)\d{2})\s+(0?[1-9]|1[0-2])\s+(0?[1-9]|[12]\d|3[01])(?:\D|$)/);
  if (match) {
    return {
      year: parseInt(match[1]),
      month: parseInt(match[2]),
      day: parseInt(match[3]),
      remaining: text.replace(match[0], ' ')
    };
  }
  
  // 8位格式: YYYYMMDD (如 19900510)
  match = text.match(/(?:^|\D)((?:19|20)\d{2})(0[1-9]|1[0-2])(0[1-9]|[12]\d|3[01])(?:\D|$)/);
  if (match) {
    return {
      year: parseInt(match[1]),
      month: parseInt(match[2]),
      day: parseInt(match[3]),
      remaining: text.replace(match[0], ' ')
    };
  }
  
  // 7位格式: YYYYMDD 或 YYYYMMD (如 1995510 = 1995年5月10日)
  match = text.match(/(?:^|\D)((?:19|20)\d{2})([1-9])(0[1-9]|[12]\d|3[01])(?:\D|$)/);
  if (match) {
    return {
      year: parseInt(match[1]),
      month: parseInt(match[2]),
      day: parseInt(match[3]),
      remaining: text.replace(match[0], ' ')
    };
  }
  
  // 另一种7位格式: YYYYMMD (如 1995101 = 1995年10月1日)
  match = text.match(/(?:^|\D)((?:19|20)\d{2})(0[1-9]|1[0-2])([1-9])(?:\D|$)/);
  if (match) {
    return {
      year: parseInt(match[1]),
      month: parseInt(match[2]),
      day: parseInt(match[3]),
      remaining: text.replace(match[0], ' ')
    };
  }
  
  // 6位格式: YYYYMD (如 199551 = 1995年5月1日 或 199515 = 1995年1月5日)
  // 优先解析为 YYYYMD (月份1-9，日期1-9)
  match = text.match(/(?:^|\D)((?:19|20)\d{2})([1-9])([1-9])(?:\D|$)/);
  if (match) {
    return {
      year: parseInt(match[1]),
      month: parseInt(match[2]),
      day: parseInt(match[3]),
      remaining: text.replace(match[0], ' ')
    };
  }
  
  return { remaining: text };
}

/**
 * 解析年份
 */
function parseYear(text: string): { year?: number; remaining: string } {
  // 4位年份 带分隔符
  let match = text.match(/(?:^|\D)((?:19|20)\d{2})(?:年|\/|-|\.|\s)/);
  if (match) {
    return {
      year: parseInt(match[1]),
      remaining: text.replace(match[1], ' ').replace(/年/, ' ')
    };
  }
  
  // 4位年份 在开头
  match = text.match(/^((?:19|20)\d{2})(?:\D|$)/);
  if (match) {
    return {
      year: parseInt(match[1]),
      remaining: text.replace(match[1], ' ')
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
  // 数字月份 带分隔符
  let match = text.match(/(?:^|\D)(0?[1-9]|1[0-2])(?:月|\/|-|\.)/);
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
  
  // 24小时制 HH:MM 或 HH.MM 或 HH时MM分
  let match = text.match(/(\d{1,2})[:：\.时](\d{1,2})(?:分)?/);
  if (match) {
    let hour = parseInt(match[1]);
    const minute = parseInt(match[2]);
    
    // 检查上午/下午/晚上
    if (/下午|晚上|晚|夜|pm/i.test(text)) {
      if (hour < 12) hour += 12;
    }
    if (/上午|早上|早|am/i.test(text) && hour === 12) {
      hour = 0;
    }
    
    return {
      hour,
      minute,
      remaining: text.replace(match[0], ' ')
    };
  }
  
  // 只有小时 (X时/X点)
  match = text.match(/(\d{1,2})(?:时|点)/);
  if (match) {
    let hour = parseInt(match[1]);
    
    // 检查上午/下午/晚上
    if (/下午|晚上|晚|夜|pm/i.test(text)) {
      if (hour < 12) hour += 12;
    }
    if (/上午|早上|早|am/i.test(text) && hour === 12) {
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
  
  // 口语化时间：上午/下午/晚上 + 数字
  match = text.match(/(上午|早上|早|下午|晚上|晚|夜)\s*(\d{1,2})(?:点|时)?(?:(\d{1,2})分?|半)?/);
  if (match) {
    let hour = parseInt(match[2]);
    const period = match[1];
    
    if (/下午|晚上|晚|夜/.test(period)) {
      if (hour < 12) hour += 12;
    }
    if (/上午|早上|早/.test(period) && hour === 12) {
      hour = 0;
    }
    
    let minute = 0;
    if (match[3]) {
      minute = parseInt(match[3]);
    } else if (text.includes('半')) {
      minute = 30;
    }
    
    return {
      hour,
      minute,
      remaining: text.replace(match[0], ' ')
    };
  }
  
  // 12小时制 with AM/PM
  match = text.match(/(\d{1,2})(?:[:.](d{2}))?\s*(am|pm|AM|PM)/i);
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
  
  // 只有时间段词汇，没有具体时间，设置默认值
  // 检查是否有明确的时间数字（如 10:30, 10时, 10点）
  const hasExplicitTime = /\d{1,2}[:.时点]\d{0,2}/.test(text) || /\d{1,2}[:.时点]/.test(text);
  
  // 如果没有明确时间，检查时间段词汇
  if (!hasExplicitTime) {
    if (/晚上|晚|夜里|夜晚|夜间/.test(text)) {
      return { hour: 20, minute: 0, remaining: text };
    }
    if (/下午/.test(text)) {
      return { hour: 15, minute: 0, remaining: text };
    }
    if (/上午|早上|早/.test(text)) {
      return { hour: 9, minute: 0, remaining: text };
    }
  }
  
  return { remaining: text };
}

/**
 * 解析性别
 */
function parseGender(text: string): { gender?: 'male' | 'female'; remaining: string } {
  // 男性关键词
  if (/男(?:性|生|孩|士|的)?|乾造?|male|man|boy|先生/i.test(text)) {
    return { gender: 'male', remaining: text };
  }
  // 女性关键词
  if (/女(?:性|生|孩|士|的)?|坤造?|female|woman|girl|小姐|女士/i.test(text)) {
    return { gender: 'female', remaining: text };
  }
  return { remaining: text };
}

/**
 * 解析地区
 */
function parseLocation(text: string): { location?: string; remaining: string } {
  // 常见城市（优先匹配）
  const cities = [
    '北京', '上海', '广州', '深圳', '天津', '重庆', '成都', '杭州', '武汉', '南京',
    '西安', '苏州', '郑州', '长沙', '青岛', '沈阳', '大连', '厦门', '福州', '济南',
    '哈尔滨', '长春', '昆明', '贵阳', '南宁', '海口', '石家庄', '太原', '呼和浩特',
    '乌鲁木齐', '兰州', '西宁', '银川', '拉萨', '合肥', '南昌', '香港', '澳门', '台北',
    '徐州', '无锡', '常州', '宁波', '温州', '嘉兴', '绍兴', '金华', '台州', '湖州',
    '珠海', '佛山', '东莞', '中山', '惠州', '汕头', '潮州', '揭阳', '湛江', '茂名',
    '烟台', '威海', '潍坊', '临沂', '淄博', '泰安', '日照', '德州', '聊城', '滨州',
    '洛阳', '开封', '新乡', '安阳', '焦作', '濮阳', '许昌', '漯河', '三门峡', '南阳',
    '株洲', '湘潭', '衡阳', '邵阳', '岳阳', '常德', '张家界', '益阳', '郴州', '永州',
    '三亚', '海口', '吐鲁番', '喀什', '库尔勒', '克拉玛依', '伊犁', '阿克苏',
    // 海外城市
    '都柏林', '伦敦', '巴黎', '纽约', '洛杉矶', '旧金山', '芝加哥', '西雅图', '波士顿',
    '多伦多', '温哥华', '蒙特利尔', '悉尼', '墨尔本', '奥克兰', '新加坡', '东京', '大阪',
    '首尔', '曼谷', '吉隆坡', '雅加达', '马尼拉', '河内', '胡志明', '迪拜', '阿布扎比',
    '柏林', '慕尼黑', '法兰克福', '阿姆斯特丹', '布鲁塞尔', '苏黎世', '日内瓦', '维也纳',
    '米兰', '罗马', '马德里', '巴塞罗那', '里斯本', '莫斯科', '圣彼得堡'
  ];
  
  for (const city of cities) {
    if (text.includes(city)) {
      return { location: city, remaining: text };
    }
  }
  
  // 省份映射到省会城市
  const provinceMap: Record<string, string> = {
    '河北': '石家庄', '山西': '太原', '辽宁': '沈阳', '吉林': '长春', '黑龙江': '哈尔滨',
    '江苏': '南京', '浙江': '杭州', '安徽': '合肥', '福建': '福州', '江西': '南昌',
    '山东': '济南', '河南': '郑州', '湖北': '武汉', '湖南': '长沙', '广东': '广州',
    '海南': '海口', '四川': '成都', '贵州': '贵阳', '云南': '昆明', '陕西': '西安',
    '甘肃': '兰州', '青海': '西宁', '台湾': '台北', '内蒙古': '呼和浩特', '广西': '南宁',
    '西藏': '拉萨', '宁夏': '银川', '新疆': '乌鲁木齐',
    // 海外国家
    '爱尔兰': '都柏林', '英国': '伦敦', '法国': '巴黎', '德国': '柏林', '意大利': '罗马',
    '西班牙': '马德里', '葡萄牙': '里斯本', '荷兰': '阿姆斯特丹', '比利时': '布鲁塞尔',
    '瑞士': '苏黎世', '奥地利': '维也纳', '俄罗斯': '莫斯科', '美国': '纽约', '加拿大': '多伦多',
    '澳大利亚': '悉尼', '新西兰': '奥克兰', '日本': '东京', '韩国': '首尔', '泰国': '曼谷',
    '马来西亚': '吉隆坡', '印尼': '雅加达', '菲律宾': '马尼拉', '越南': '河内',
    '阿联酋': '迪拜', '新加坡': '新加坡'
  };
  
  for (const [province, capital] of Object.entries(provinceMap)) {
    if (text.includes(province)) {
      return { location: capital, remaining: text };
    }
  }
  
  // 匹配省市区格式
  const match = text.match(/([^\s]+(?:省|市|区|县|镇))/);
  if (match) {
    // 提取市名
    const cityMatch = match[1].match(/(.+?)(?:省|市|区|县|镇)/);
    if (cityMatch) {
      return { location: cityMatch[1], remaining: text };
    }
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
  
  // 首先尝试解析紧凑日期格式 (如 19900510, 1995510)
  const compactResult = parseCompactDate(processedText);
  
  let year: number | undefined;
  let month: number | undefined;
  let day: number | undefined;
  
  if (compactResult.year && compactResult.month && compactResult.day) {
    year = compactResult.year;
    month = compactResult.month;
    day = compactResult.day;
    processedText = compactResult.remaining;
  } else {
    // 解析标准格式
    const yearResult = parseYear(processedText);
    processedText = yearResult.remaining;
    year = yearResult.year;
    
    const monthResult = parseMonth(processedText);
    processedText = monthResult.remaining;
    month = monthResult.month;
    
    const dayResult = parseDay(processedText);
    processedText = dayResult.remaining;
    day = dayResult.day;
  }
  
  // 解析时间（使用原始文本检测时间段词汇）
  const timeResult = parseTime(rawText);
  processedText = timeResult.remaining;
  
  // 解析性别
  const genderResult = parseGender(processedText);
  
  // 解析地区
  const locationResult = parseLocation(processedText);
  
  // 计算置信度
  if (year) confidence += 25;
  if (month) confidence += 25;
  if (day) confidence += 25;
  if (timeResult.hour !== undefined) confidence += 15;
  if (genderResult.gender) confidence += 5;
  if (locationResult.location) confidence += 5;
  
  return {
    year,
    month,
    day,
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
