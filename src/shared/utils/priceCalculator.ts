import { IHotel, IHotelRoom, IPriceConfig } from '../types';

/**
 * 判断是否为周末（周六、周日）
 */
export const isWeekend = (dateStr: string): boolean => {
  const date = new Date(dateStr);
  const day = date.getDay();
  return day === 0 || day === 6; // 0=周日, 6=周六
};

/**
 * 判断是否为节假日（中国主要节假日）
 * 这里使用简化的判断逻辑，实际项目中可以接入节假日API
 */
export const isHoliday = (dateStr: string): boolean => {
  const date = new Date(dateStr);
  const month = date.getMonth() + 1;
  const day = date.getDate();
  
  // 中国主要节假日（简化判断，仅作示例）
  const holidays = [
    // 元旦
    { month: 1, day: 1 },
    // 春节（简化，假设除夕到初六）
    { month: 1, day: [28, 29, 30, 31, 1, 2, 3, 4, 5, 6, 7].filter(d => typeof d === 'number') },
    // 清明节
    { month: 4, day: 5 },
    // 劳动节
    { month: 5, day: 1 },
    // 端午节
    { month: 6, day: 10 },
    // 中秋节
    { month: 9, day: 15 },
    // 国庆节
    { month: 10, day: [1, 2, 3, 4, 5, 6, 7].filter(d => typeof d === 'number') },
  ];
  
  // 简化处理：仅判断主要节假日日期
  const holidayDates = [
    '01-01', // 元旦
    '04-05', // 清明
    '05-01', // 劳动
    '06-10', // 端午
    '09-15', // 中秋
    '10-01', // 国庆
  ];
  
  const monthDay = `${month.toString().padStart(2, '0')}-${day.toString().padStart(2, '0')}`;
  return holidayDates.includes(monthDay);
};

/**
 * 获取指定日期的价格调整倍数
 * 优先级：固定日期 > 节假日 > 周末 > 淡旺季 > 默认
 */
export const getDateMultiplier = (
  dateStr: string,
  config?: IPriceConfig
): number => {
  if (!config) return 1;

  const date = new Date(dateStr);
  const month = date.getMonth() + 1;
  const dateStrFull = dateStr; // YYYY-MM-DD 格式

  // 1. 检查固定日期价格覆盖（优先级最高）
  if (config.datePriceOverrides?.length) {
    const override = config.datePriceOverrides.find(
      (d) => d.date === dateStrFull
    );
    if (override) {
      // 如果有固定价格，返回特殊标记（需要在调用处处理）
      if (override.fixedPrice !== undefined) {
        return -1; // 表示使用固定价格
      }
      if (override.multiplier !== undefined) {
        return override.multiplier;
      }
    }
  }

  // 2. 检查节假日
  if (config.holidayMultiplier && isHoliday(dateStrFull)) {
    return config.holidayMultiplier;
  }

  // 3. 检查周末
  if (config.weekendMultiplier && isWeekend(dateStrFull)) {
    return config.weekendMultiplier;
  }

  // 4. 检查淡旺季
  if (config.seasons?.length) {
    for (const season of config.seasons) {
      if (month >= season.startMonth && month <= season.endMonth) {
        if (season.multiplier !== undefined) {
          return season.multiplier;
        }
      }
    }
  }

  return 1; // 默认不调整
};

/**
 * 计算指定日期的房价
 * @param basePrice 基础价格
 * @param date 入住日期
 * @param config 价格配置
 * @returns 调整后的价格
 */
export const calculateRoomPrice = (
  basePrice: number,
  date: string,
  config?: IPriceConfig
): { price: number; isAdjusted: boolean; reason: string } => {
  if (!config) {
    return { price: basePrice, isAdjusted: false, reason: '' };
  }

  const multiplier = getDateMultiplier(date, config);
  
  // 检查是否有固定价格配置
  if (config.datePriceOverrides?.length) {
    const override = config.datePriceOverrides.find(
      (d) => d.date === date
    );
    if (override?.fixedPrice !== undefined) {
      return {
        price: override.fixedPrice,
        isAdjusted: true,
        reason: '特定日期价格',
      };
    }
  }

  // 计算调整后的价格（四舍五入）
  const adjustedPrice = Math.round(basePrice * multiplier);
  const isAdjusted = multiplier !== 1;
  
  let reason = '';
  if (isHoliday(date) && config.holidayMultiplier) {
    reason = '节假日';
  } else if (isWeekend(date) && config.weekendMultiplier) {
    reason = '周末';
  }

  return {
    price: adjustedPrice,
    isAdjusted,
    reason,
  };
};

/**
 * 计算酒店起价（考虑所有房型和日期范围）
 * @param hotel 酒店信息
 * @param checkInDate 入住日期
 * @param checkOutDate 离店日期
 * @returns 最低价格
 */
export const calculateHotelMinPrice = (
  hotel: IHotel,
  checkInDate?: string,
  checkOutDate?: string
): { price: number; isAdjusted: boolean; reason: string } => {
  const config = hotel.priceConfig;
  
  // 获取酒店最低价：优先使用房型中的最低价，其次使用酒店基础价格
  let basePrice = hotel.price;
  if (hotel.rooms && hotel.rooms.length > 0) {
    const roomPrices = hotel.rooms
      .map(room => Number(room.price))
      .filter(price => Number.isFinite(price));
    if (roomPrices.length > 0) {
      basePrice = Math.min(...roomPrices);
    }
  }
  
  // 如果有入住日期，计算日期范围内的最低价
  if (checkInDate && checkOutDate) {
    const nights = getNightCount(checkInDate, checkOutDate);
    if (nights > 0) {
      // 简化为使用入住日期计算（实际可能需要遍历每天）
      const result = calculateRoomPrice(basePrice, checkInDate, config);
      return result;
    }
  }
  
  // 否则返回基础价格（已考虑配置中的最低调整）
  return calculateRoomPrice(basePrice, new Date().toISOString().split('T')[0], config);
};

/**
 * 计算房型在某日期范围内的总价
 */
export const calculateTotalRoomPrice = (
  room: IHotelRoom,
  checkInDate: string,
  checkOutDate: string,
  config?: IPriceConfig
): { totalPrice: number; nightlyPrices: number[] } => {
  const nights = getNightCount(checkInDate, checkOutDate);
  const nightlyPrices: number[] = [];
  
  let currentDate = new Date(checkInDate);
  const endDate = new Date(checkOutDate);
  
  while (currentDate < endDate) {
    const dateStr = currentDate.toISOString().split('T')[0];
    const { price } = calculateRoomPrice(room.price, dateStr, config);
    nightlyPrices.push(price);
    currentDate.setDate(currentDate.getDate() + 1);
  }
  
  const totalPrice = nightlyPrices.reduce((sum, p) => sum + p, 0);
  
  return { totalPrice, nightlyPrices };
};

/**
 * 计算间夜数
 */
export const getNightCount = (checkIn: string, checkOut: string): number => {
  const start = new Date(checkIn).getTime();
  const end = new Date(checkOut).getTime();
  return Math.max(0, Math.floor((end - start) / (1000 * 60 * 60 * 24)));
};

/**
 * 格式化价格显示
 */
export const formatPrice = (price: number): string => {
  return `¥${price}`;
};

/**
 * 获取价格标签（如 "周末加价", "节假日"）
 */
export const getPriceTag = (
  date: string,
  config?: IPriceConfig
): string | null => {
  if (!config) return null;
  
  if (config.datePriceOverrides?.length) {
    const override = config.datePriceOverrides.find((d) => d.date === date);
    if (override?.fixedPrice !== undefined) {
      return '特惠价';
    }
  }
  
  if (isHoliday(date) && config.holidayMultiplier && config.holidayMultiplier > 1) {
    return '节假日';
  }
  
  if (isWeekend(date) && config.weekendMultiplier && config.weekendMultiplier > 1) {
    return '周末';
  }
  
  return null;
};

// 默认价格配置
export const DEFAULT_PRICE_CONFIG: IPriceConfig = {
  weekendMultiplier: 1.1, // 周末加价10%
  holidayMultiplier: 1.2, // 节假日加价20%
  datePriceOverrides: [],
  seasons: [],
};
