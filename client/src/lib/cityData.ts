/**
 * 城市经纬度数据
 * 用于排盘时计算真太阳时
 */

export interface CityInfo {
  name: string;
  province: string;
  longitude: number;  // 东经（负数为西经）
  latitude: number;   // 北纬（负数为南纬）
  timezone?: number;  // 时区（相对UTC的小时数）
}

export const CITIES: CityInfo[] = [
  // 直辖市
  { name: '北京', province: '北京', longitude: 116.40, latitude: 39.90, timezone: 8 },
  { name: '上海', province: '上海', longitude: 121.47, latitude: 31.23, timezone: 8 },
  { name: '天津', province: '天津', longitude: 117.20, latitude: 39.13, timezone: 8 },
  { name: '重庆', province: '重庆', longitude: 106.55, latitude: 29.57, timezone: 8 },
  
  // 省会城市
  { name: '石家庄', province: '河北', longitude: 114.48, latitude: 38.03, timezone: 8 },
  { name: '太原', province: '山西', longitude: 112.55, latitude: 37.87, timezone: 8 },
  { name: '呼和浩特', province: '内蒙古', longitude: 111.65, latitude: 40.82, timezone: 8 },
  { name: '沈阳', province: '辽宁', longitude: 123.43, latitude: 41.80, timezone: 8 },
  { name: '长春', province: '吉林', longitude: 125.32, latitude: 43.90, timezone: 8 },
  { name: '哈尔滨', province: '黑龙江', longitude: 126.63, latitude: 45.75, timezone: 8 },
  { name: '南京', province: '江苏', longitude: 118.78, latitude: 32.05, timezone: 8 },
  { name: '杭州', province: '浙江', longitude: 120.15, latitude: 30.28, timezone: 8 },
  { name: '合肥', province: '安徽', longitude: 117.27, latitude: 31.87, timezone: 8 },
  { name: '福州', province: '福建', longitude: 119.30, latitude: 26.08, timezone: 8 },
  { name: '南昌', province: '江西', longitude: 115.89, latitude: 28.68, timezone: 8 },
  { name: '济南', province: '山东', longitude: 117.00, latitude: 36.65, timezone: 8 },
  { name: '郑州', province: '河南', longitude: 113.65, latitude: 34.76, timezone: 8 },
  { name: '武汉', province: '湖北', longitude: 114.30, latitude: 30.60, timezone: 8 },
  { name: '长沙', province: '湖南', longitude: 112.97, latitude: 28.23, timezone: 8 },
  { name: '广州', province: '广东', longitude: 113.27, latitude: 23.13, timezone: 8 },
  { name: '南宁', province: '广西', longitude: 108.37, latitude: 22.82, timezone: 8 },
  { name: '海口', province: '海南', longitude: 110.33, latitude: 20.02, timezone: 8 },
  { name: '成都', province: '四川', longitude: 104.07, latitude: 30.67, timezone: 8 },
  { name: '贵阳', province: '贵州', longitude: 106.63, latitude: 26.65, timezone: 8 },
  { name: '昆明', province: '云南', longitude: 102.73, latitude: 25.05, timezone: 8 },
  { name: '拉萨', province: '西藏', longitude: 91.13, latitude: 29.65, timezone: 8 },
  { name: '西安', province: '陕西', longitude: 108.95, latitude: 34.27, timezone: 8 },
  { name: '兰州', province: '甘肃', longitude: 103.82, latitude: 36.07, timezone: 8 },
  { name: '西宁', province: '青海', longitude: 101.77, latitude: 36.62, timezone: 8 },
  { name: '银川', province: '宁夏', longitude: 106.27, latitude: 38.47, timezone: 8 },
  { name: '乌鲁木齐', province: '新疆', longitude: 87.62, latitude: 43.82, timezone: 8 },
  
  // 其他重要城市
  { name: '深圳', province: '广东', longitude: 114.07, latitude: 22.55, timezone: 8 },
  { name: '苏州', province: '江苏', longitude: 120.62, latitude: 31.32, timezone: 8 },
  { name: '无锡', province: '江苏', longitude: 120.30, latitude: 31.57, timezone: 8 },
  { name: '常州', province: '江苏', longitude: 119.95, latitude: 31.78, timezone: 8 },
  { name: '青岛', province: '山东', longitude: 120.38, latitude: 36.07, timezone: 8 },
  { name: '大连', province: '辽宁', longitude: 121.62, latitude: 38.92, timezone: 8 },
  { name: '宁波', province: '浙江', longitude: 121.55, latitude: 29.87, timezone: 8 },
  { name: '厦门', province: '福建', longitude: 118.10, latitude: 24.47, timezone: 8 },
  { name: '东莞', province: '广东', longitude: 113.75, latitude: 23.05, timezone: 8 },
  { name: '佛山', province: '广东', longitude: 113.12, latitude: 23.02, timezone: 8 },
  { name: '珠海', province: '广东', longitude: 113.57, latitude: 22.27, timezone: 8 },
  { name: '温州', province: '浙江', longitude: 120.65, latitude: 28.02, timezone: 8 },
  { name: '泉州', province: '福建', longitude: 118.67, latitude: 24.90, timezone: 8 },
  { name: '烟台', province: '山东', longitude: 121.45, latitude: 37.47, timezone: 8 },
  { name: '唐山', province: '河北', longitude: 118.18, latitude: 39.63, timezone: 8 },
  { name: '徐州', province: '江苏', longitude: 117.18, latitude: 34.27, timezone: 8 },
  { name: '洛阳', province: '河南', longitude: 112.45, latitude: 34.62, timezone: 8 },
  { name: '绍兴', province: '浙江', longitude: 120.58, latitude: 30.00, timezone: 8 },
  { name: '嘉兴', province: '浙江', longitude: 120.75, latitude: 30.75, timezone: 8 },
  { name: '金华', province: '浙江', longitude: 119.65, latitude: 29.08, timezone: 8 },
  { name: '台州', province: '浙江', longitude: 121.42, latitude: 28.68, timezone: 8 },
  { name: '惠州', province: '广东', longitude: 114.42, latitude: 23.12, timezone: 8 },
  { name: '中山', province: '广东', longitude: 113.38, latitude: 22.52, timezone: 8 },
  { name: '南通', province: '江苏', longitude: 120.87, latitude: 32.02, timezone: 8 },
  { name: '扬州', province: '江苏', longitude: 119.43, latitude: 32.40, timezone: 8 },
  { name: '镇江', province: '江苏', longitude: 119.45, latitude: 32.20, timezone: 8 },
  { name: '盐城', province: '江苏', longitude: 120.15, latitude: 33.35, timezone: 8 },
  { name: '潍坊', province: '山东', longitude: 119.10, latitude: 36.72, timezone: 8 },
  { name: '临沂', province: '山东', longitude: 118.35, latitude: 35.05, timezone: 8 },
  { name: '淄博', province: '山东', longitude: 118.05, latitude: 36.78, timezone: 8 },
  { name: '济宁', province: '山东', longitude: 116.58, latitude: 35.42, timezone: 8 },
  { name: '泰安', province: '山东', longitude: 117.08, latitude: 36.20, timezone: 8 },
  { name: '威海', province: '山东', longitude: 122.12, latitude: 37.52, timezone: 8 },
  { name: '日照', province: '山东', longitude: 119.53, latitude: 35.42, timezone: 8 },
  { name: '保定', province: '河北', longitude: 115.47, latitude: 38.87, timezone: 8 },
  { name: '廊坊', province: '河北', longitude: 116.70, latitude: 39.52, timezone: 8 },
  { name: '邯郸', province: '河北', longitude: 114.48, latitude: 36.62, timezone: 8 },
  { name: '秦皇岛', province: '河北', longitude: 119.60, latitude: 39.93, timezone: 8 },
  { name: '沧州', province: '河北', longitude: 116.87, latitude: 38.32, timezone: 8 },
  { name: '邢台', province: '河北', longitude: 114.50, latitude: 37.07, timezone: 8 },
  { name: '衡水', province: '河北', longitude: 115.67, latitude: 37.73, timezone: 8 },
  { name: '承德', province: '河北', longitude: 117.93, latitude: 40.97, timezone: 8 },
  { name: '张家口', province: '河北', longitude: 114.88, latitude: 40.82, timezone: 8 },
  
  // 海南
  { name: '三亚', province: '海南', longitude: 109.51, latitude: 18.25, timezone: 8 },
  
  // 新疆
  { name: '吐鲁番', province: '新疆', longitude: 89.19, latitude: 42.95, timezone: 8 },
  { name: '喀什', province: '新疆', longitude: 75.99, latitude: 39.47, timezone: 8 },
  { name: '库尔勒', province: '新疆', longitude: 86.15, latitude: 41.77, timezone: 8 },
  { name: '克拉玛依', province: '新疆', longitude: 84.87, latitude: 45.60, timezone: 8 },
  { name: '伊宁', province: '新疆', longitude: 81.33, latitude: 43.92, timezone: 8 },
  { name: '阿克苏', province: '新疆', longitude: 80.27, latitude: 41.17, timezone: 8 },
  
  // 特别行政区
  { name: '香港', province: '香港', longitude: 114.17, latitude: 22.28, timezone: 8 },
  { name: '澳门', province: '澳门', longitude: 113.55, latitude: 22.20, timezone: 8 },
  
  // 台湾
  { name: '台北', province: '台湾', longitude: 121.52, latitude: 25.05, timezone: 8 },
  { name: '高雄', province: '台湾', longitude: 120.30, latitude: 22.62, timezone: 8 },
  { name: '台中', province: '台湾', longitude: 120.68, latitude: 24.15, timezone: 8 },
  
  // ============ 海外城市 ============
  
  // 欧洲
  { name: '都柏林', province: '爱尔兰', longitude: -6.26, latitude: 53.35, timezone: 0 },
  { name: '伦敦', province: '英国', longitude: -0.12, latitude: 51.51, timezone: 0 },
  { name: '巴黎', province: '法国', longitude: 2.35, latitude: 48.86, timezone: 1 },
  { name: '柏林', province: '德国', longitude: 13.40, latitude: 52.52, timezone: 1 },
  { name: '慕尼黑', province: '德国', longitude: 11.58, latitude: 48.14, timezone: 1 },
  { name: '法兰克福', province: '德国', longitude: 8.68, latitude: 50.11, timezone: 1 },
  { name: '阿姆斯特丹', province: '荷兰', longitude: 4.90, latitude: 52.37, timezone: 1 },
  { name: '布鲁塞尔', province: '比利时', longitude: 4.35, latitude: 50.85, timezone: 1 },
  { name: '苏黎世', province: '瑞士', longitude: 8.54, latitude: 47.37, timezone: 1 },
  { name: '日内瓦', province: '瑞士', longitude: 6.14, latitude: 46.20, timezone: 1 },
  { name: '维也纳', province: '奥地利', longitude: 16.37, latitude: 48.21, timezone: 1 },
  { name: '米兰', province: '意大利', longitude: 9.19, latitude: 45.46, timezone: 1 },
  { name: '罗马', province: '意大利', longitude: 12.50, latitude: 41.90, timezone: 1 },
  { name: '马德里', province: '西班牙', longitude: -3.70, latitude: 40.42, timezone: 1 },
  { name: '巴塞罗那', province: '西班牙', longitude: 2.17, latitude: 41.39, timezone: 1 },
  { name: '里斯本', province: '葡萄牙', longitude: -9.14, latitude: 38.72, timezone: 0 },
  { name: '莫斯科', province: '俄罗斯', longitude: 37.62, latitude: 55.76, timezone: 3 },
  { name: '圣彼得堡', province: '俄罗斯', longitude: 30.31, latitude: 59.94, timezone: 3 },
  
  // 北美
  { name: '纽约', province: '美国', longitude: -74.01, latitude: 40.71, timezone: -5 },
  { name: '洛杉矶', province: '美国', longitude: -118.24, latitude: 34.05, timezone: -8 },
  { name: '旧金山', province: '美国', longitude: -122.42, latitude: 37.77, timezone: -8 },
  { name: '芝加哥', province: '美国', longitude: -87.63, latitude: 41.88, timezone: -6 },
  { name: '西雅图', province: '美国', longitude: -122.33, latitude: 47.61, timezone: -8 },
  { name: '波士顿', province: '美国', longitude: -71.06, latitude: 42.36, timezone: -5 },
  { name: '华盛顿', province: '美国', longitude: -77.04, latitude: 38.91, timezone: -5 },
  { name: '休斯顿', province: '美国', longitude: -95.37, latitude: 29.76, timezone: -6 },
  { name: '达拉斯', province: '美国', longitude: -96.80, latitude: 32.78, timezone: -6 },
  { name: '迈阿密', province: '美国', longitude: -80.19, latitude: 25.76, timezone: -5 },
  { name: '多伦多', province: '加拿大', longitude: -79.38, latitude: 43.65, timezone: -5 },
  { name: '温哥华', province: '加拿大', longitude: -123.12, latitude: 49.28, timezone: -8 },
  { name: '蒙特利尔', province: '加拿大', longitude: -73.57, latitude: 45.50, timezone: -5 },
  
  // 大洋洲
  { name: '悉尼', province: '澳大利亚', longitude: 151.21, latitude: -33.87, timezone: 10 },
  { name: '墨尔本', province: '澳大利亚', longitude: 144.96, latitude: -37.81, timezone: 10 },
  { name: '布里斯班', province: '澳大利亚', longitude: 153.03, latitude: -27.47, timezone: 10 },
  { name: '珀斯', province: '澳大利亚', longitude: 115.86, latitude: -31.95, timezone: 8 },
  { name: '奥克兰', province: '新西兰', longitude: 174.76, latitude: -36.85, timezone: 12 },
  { name: '惠灵顿', province: '新西兰', longitude: 174.78, latitude: -41.29, timezone: 12 },
  
  // 亚洲（除中国）
  { name: '东京', province: '日本', longitude: 139.69, latitude: 35.69, timezone: 9 },
  { name: '大阪', province: '日本', longitude: 135.50, latitude: 34.69, timezone: 9 },
  { name: '首尔', province: '韩国', longitude: 126.98, latitude: 37.57, timezone: 9 },
  { name: '新加坡', province: '新加坡', longitude: 103.82, latitude: 1.35, timezone: 8 },
  { name: '曼谷', province: '泰国', longitude: 100.50, latitude: 13.76, timezone: 7 },
  { name: '吉隆坡', province: '马来西亚', longitude: 101.69, latitude: 3.14, timezone: 8 },
  { name: '雅加达', province: '印尼', longitude: 106.85, latitude: -6.21, timezone: 7 },
  { name: '马尼拉', province: '菲律宾', longitude: 120.98, latitude: 14.60, timezone: 8 },
  { name: '河内', province: '越南', longitude: 105.85, latitude: 21.03, timezone: 7 },
  { name: '胡志明', province: '越南', longitude: 106.63, latitude: 10.82, timezone: 7 },
  { name: '孟买', province: '印度', longitude: 72.88, latitude: 19.08, timezone: 5.5 },
  { name: '新德里', province: '印度', longitude: 77.21, latitude: 28.61, timezone: 5.5 },
  
  // 中东
  { name: '迪拜', province: '阿联酋', longitude: 55.27, latitude: 25.20, timezone: 4 },
  { name: '阿布扎比', province: '阿联酋', longitude: 54.37, latitude: 24.45, timezone: 4 },
];

/**
 * 根据城市名称查找城市信息
 */
export function findCity(name: string): CityInfo | undefined {
  // 精确匹配
  let city = CITIES.find(c => c.name === name);
  if (city) return city;
  
  // 模糊匹配（去掉"市"、"省"等后缀）
  const cleanName = name.replace(/[市省区县]/g, '');
  city = CITIES.find(c => c.name.includes(cleanName) || cleanName.includes(c.name));
  
  return city;
}

/**
 * 获取所有省份/国家
 */
export function getProvinces(): string[] {
  const provinces = new Set(CITIES.map(c => c.province));
  return Array.from(provinces);
}

/**
 * 获取指定省份的城市
 */
export function getCitiesByProvince(province: string): CityInfo[] {
  return CITIES.filter(c => c.province === province);
}

/**
 * 默认城市（北京）
 */
export const DEFAULT_CITY: CityInfo = CITIES[0];
