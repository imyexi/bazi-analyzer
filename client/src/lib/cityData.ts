/**
 * 中国主要城市经纬度数据
 * 用于排盘时计算真太阳时
 */

export interface CityInfo {
  name: string;
  province: string;
  longitude: number;  // 东经
  latitude: number;   // 北纬
}

export const CITIES: CityInfo[] = [
  // 直辖市
  { name: '北京', province: '北京', longitude: 116.40, latitude: 39.90 },
  { name: '上海', province: '上海', longitude: 121.47, latitude: 31.23 },
  { name: '天津', province: '天津', longitude: 117.20, latitude: 39.13 },
  { name: '重庆', province: '重庆', longitude: 106.55, latitude: 29.57 },
  
  // 省会城市
  { name: '石家庄', province: '河北', longitude: 114.48, latitude: 38.03 },
  { name: '太原', province: '山西', longitude: 112.55, latitude: 37.87 },
  { name: '呼和浩特', province: '内蒙古', longitude: 111.65, latitude: 40.82 },
  { name: '沈阳', province: '辽宁', longitude: 123.43, latitude: 41.80 },
  { name: '长春', province: '吉林', longitude: 125.32, latitude: 43.90 },
  { name: '哈尔滨', province: '黑龙江', longitude: 126.63, latitude: 45.75 },
  { name: '南京', province: '江苏', longitude: 118.78, latitude: 32.05 },
  { name: '杭州', province: '浙江', longitude: 120.15, latitude: 30.28 },
  { name: '合肥', province: '安徽', longitude: 117.27, latitude: 31.87 },
  { name: '福州', province: '福建', longitude: 119.30, latitude: 26.08 },
  { name: '南昌', province: '江西', longitude: 115.89, latitude: 28.68 },
  { name: '济南', province: '山东', longitude: 117.00, latitude: 36.65 },
  { name: '郑州', province: '河南', longitude: 113.65, latitude: 34.76 },
  { name: '武汉', province: '湖北', longitude: 114.30, latitude: 30.60 },
  { name: '长沙', province: '湖南', longitude: 112.97, latitude: 28.23 },
  { name: '广州', province: '广东', longitude: 113.27, latitude: 23.13 },
  { name: '南宁', province: '广西', longitude: 108.37, latitude: 22.82 },
  { name: '海口', province: '海南', longitude: 110.33, latitude: 20.02 },
  { name: '成都', province: '四川', longitude: 104.07, latitude: 30.67 },
  { name: '贵阳', province: '贵州', longitude: 106.63, latitude: 26.65 },
  { name: '昆明', province: '云南', longitude: 102.73, latitude: 25.05 },
  { name: '拉萨', province: '西藏', longitude: 91.13, latitude: 29.65 },
  { name: '西安', province: '陕西', longitude: 108.95, latitude: 34.27 },
  { name: '兰州', province: '甘肃', longitude: 103.82, latitude: 36.07 },
  { name: '西宁', province: '青海', longitude: 101.77, latitude: 36.62 },
  { name: '银川', province: '宁夏', longitude: 106.27, latitude: 38.47 },
  { name: '乌鲁木齐', province: '新疆', longitude: 87.62, latitude: 43.82 },
  
  // 其他重要城市
  { name: '深圳', province: '广东', longitude: 114.07, latitude: 22.55 },
  { name: '苏州', province: '江苏', longitude: 120.62, latitude: 31.32 },
  { name: '无锡', province: '江苏', longitude: 120.30, latitude: 31.57 },
  { name: '常州', province: '江苏', longitude: 119.95, latitude: 31.78 },
  { name: '青岛', province: '山东', longitude: 120.38, latitude: 36.07 },
  { name: '大连', province: '辽宁', longitude: 121.62, latitude: 38.92 },
  { name: '宁波', province: '浙江', longitude: 121.55, latitude: 29.87 },
  { name: '厦门', province: '福建', longitude: 118.10, latitude: 24.47 },
  { name: '东莞', province: '广东', longitude: 113.75, latitude: 23.05 },
  { name: '佛山', province: '广东', longitude: 113.12, latitude: 23.02 },
  { name: '珠海', province: '广东', longitude: 113.57, latitude: 22.27 },
  { name: '温州', province: '浙江', longitude: 120.65, latitude: 28.02 },
  { name: '泉州', province: '福建', longitude: 118.67, latitude: 24.90 },
  { name: '烟台', province: '山东', longitude: 121.45, latitude: 37.47 },
  { name: '唐山', province: '河北', longitude: 118.18, latitude: 39.63 },
  { name: '徐州', province: '江苏', longitude: 117.18, latitude: 34.27 },
  { name: '洛阳', province: '河南', longitude: 112.45, latitude: 34.62 },
  { name: '绍兴', province: '浙江', longitude: 120.58, latitude: 30.00 },
  { name: '嘉兴', province: '浙江', longitude: 120.75, latitude: 30.75 },
  { name: '金华', province: '浙江', longitude: 119.65, latitude: 29.08 },
  { name: '台州', province: '浙江', longitude: 121.42, latitude: 28.68 },
  { name: '惠州', province: '广东', longitude: 114.42, latitude: 23.12 },
  { name: '中山', province: '广东', longitude: 113.38, latitude: 22.52 },
  { name: '南通', province: '江苏', longitude: 120.87, latitude: 32.02 },
  { name: '扬州', province: '江苏', longitude: 119.43, latitude: 32.40 },
  { name: '镇江', province: '江苏', longitude: 119.45, latitude: 32.20 },
  { name: '盐城', province: '江苏', longitude: 120.15, latitude: 33.35 },
  { name: '潍坊', province: '山东', longitude: 119.10, latitude: 36.72 },
  { name: '临沂', province: '山东', longitude: 118.35, latitude: 35.05 },
  { name: '淄博', province: '山东', longitude: 118.05, latitude: 36.78 },
  { name: '济宁', province: '山东', longitude: 116.58, latitude: 35.42 },
  { name: '泰安', province: '山东', longitude: 117.08, latitude: 36.20 },
  { name: '威海', province: '山东', longitude: 122.12, latitude: 37.52 },
  { name: '日照', province: '山东', longitude: 119.53, latitude: 35.42 },
  { name: '保定', province: '河北', longitude: 115.47, latitude: 38.87 },
  { name: '廊坊', province: '河北', longitude: 116.70, latitude: 39.52 },
  { name: '邯郸', province: '河北', longitude: 114.48, latitude: 36.62 },
  { name: '秦皇岛', province: '河北', longitude: 119.60, latitude: 39.93 },
  { name: '沧州', province: '河北', longitude: 116.87, latitude: 38.32 },
  { name: '邢台', province: '河北', longitude: 114.50, latitude: 37.07 },
  { name: '衡水', province: '河北', longitude: 115.67, latitude: 37.73 },
  { name: '承德', province: '河北', longitude: 117.93, latitude: 40.97 },
  { name: '张家口', province: '河北', longitude: 114.88, latitude: 40.82 },
  
  // 特别行政区
  { name: '香港', province: '香港', longitude: 114.17, latitude: 22.28 },
  { name: '澳门', province: '澳门', longitude: 113.55, latitude: 22.20 },
  
  // 台湾
  { name: '台北', province: '台湾', longitude: 121.52, latitude: 25.05 },
  { name: '高雄', province: '台湾', longitude: 120.30, latitude: 22.62 },
  { name: '台中', province: '台湾', longitude: 120.68, latitude: 24.15 },
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
 * 获取所有省份
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
