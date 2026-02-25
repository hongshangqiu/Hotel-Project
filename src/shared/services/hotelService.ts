import Taro from '@tarojs/taro';
import { IHotel, HotelStatus } from '../types/index';
import { LocalStorage, STORAGE_KEYS } from '../utils/LocalStorage';

const DEV_SEED_FLAG = '__HOTEL_DEV_SEEDED__';

const ensureDevSeed = () => {
  const isDev = process.env.NODE_ENV === 'development';
  const isWeb = typeof Taro.getEnv === 'function' && Taro.getEnv() === Taro.ENV_TYPE.WEB;
  if (!isDev || !isWeb) return;

  try {
    if (sessionStorage.getItem(DEV_SEED_FLAG) !== '1') {
      LocalStorage.remove(STORAGE_KEYS.HOTEL_MAP);
      sessionStorage.setItem(DEV_SEED_FLAG, '1');
    }
  } catch {
    // Ignore if sessionStorage is not available.
  }
};

const TAG_POOL = [
  ['亲子', '免费停车场'],
  ['豪华', '含早餐'],
  ['近地铁', '商务'],
  ['江景', '健身房'],
  ['亲子', '泳池'],
  ['精品', '免费停车场'],
];

// 初始假数据
const MOCK_HOTELS: IHotel[] = Array.from({ length: 15 }).map((_, index) => ({
  id: `${index + 1}`,
  uploadedBy: 'admin',
  nameCn: `易宿精选酒店 ${index + 1} 号`,
  nameEn: `Easy Stay Hotel No.${index + 1}`,
  address: `上海市浦东新区世纪大道 ${100 + index} 号`,
  star: (index % 3) + 3,
  price: 300 + index * 50,
  openingTime: '2025-01-01',
  roomType: '多房型可选',
  rooms: [
    {
      id: 'r1',
      name: '经济双床房',
      price: 300 + index * 50,
      imageUrl: '',
      size: '25㎡',
      capacity: 2,
      bedType: '1.2m双床',
      policy: '准时入离'
    }
  ],
  status: index === 0 ? HotelStatus.PENDING : HotelStatus.PUBLISHED, // 模拟一个审核中的
  imageUrl: `https://picsum.photos/200/200?random=${index}`,
  tags: TAG_POOL[index % TAG_POOL.length],
}));

const getLocalData = (): Record<string, IHotel> => {
  ensureDevSeed();
  const data = LocalStorage.get<Record<string, IHotel>>(STORAGE_KEYS.HOTEL_MAP);
  if (!data || Object.keys(data).length === 0) {
    const initial: Record<string, IHotel> = {};
    MOCK_HOTELS.forEach(h => initial[h.id] = h);
    LocalStorage.set(STORAGE_KEYS.HOTEL_MAP, initial);
    return initial;
  }
  let patched = false;
  Object.values(data).forEach((hotel) => {
    if (!hotel.uploadedBy) {
      hotel.uploadedBy = 'admin';
      patched = true;
    }
    if (!hotel.tags) {
      hotel.tags = [];
      patched = true;
    }
  });
  if (patched) {
    LocalStorage.set(STORAGE_KEYS.HOTEL_MAP, data);
  }
  return data;
};

export const hotelService = {
// 1. 获取列表（支持分页、排序、筛选）
  getHotelsByPage: async (
    page: number,
    pageSize: number = 5,
    sortType?: 'priceAsc' | 'priceDesc' | 'star',
    stars?: number[],
    priceRange?: [number, number],
    keyword?: string,
    tags?: string[]
  ): Promise<{ list: IHotel[], total: number }> => {
    return new Promise((resolve) => {
      setTimeout(() => {
        // 修正：使用当前文件定义的 getLocalData，并将 Record 转换为数组
        const hotelMap = getLocalData();
        const allHotels = Object.values(hotelMap);

        const publishedHotels = allHotels.filter(
          h => h.status === HotelStatus.PUBLISHED
        );

        // ⭐ 筛选
        let filteredHotels = [...publishedHotels];

        // 关键字筛选
        if (keyword) {
          const kw = keyword.toLowerCase();
          filteredHotels = filteredHotels.filter(h =>
            h.nameCn.toLowerCase().includes(kw) ||
            h.nameEn.toLowerCase().includes(kw) ||
            h.address.toLowerCase().includes(kw)
          );
        }

        // 星级筛选
        if (stars && stars.length > 0) {
          filteredHotels = filteredHotels.filter(h =>
            stars.includes(h.star)
          );
        }

        // 价格筛选
        if (priceRange) {
          filteredHotels = filteredHotels.filter(h =>
            h.price >= priceRange[0] && h.price <= priceRange[1]
          );
        }

        if (tags && tags.length > 0) {
          filteredHotels = filteredHotels.filter(h =>
            tags.some(tag => (h.tags || []).includes(tag))
          );
        }

        // ⭐ 排序
        let sortedHotels = [...filteredHotels];

        if (sortType === 'priceAsc')
          sortedHotels.sort((a, b) => a.price - b.price);

        if (sortType === 'priceDesc')
          sortedHotels.sort((a, b) => b.price - a.price);

        if (sortType === 'star')
          sortedHotels.sort((a, b) => b.star - a.star);

        // ⭐ 分页
        const start = (page - 1) * pageSize;
        const end = start + pageSize;

        resolve({
          list: sortedHotels.slice(start, end),
          total: sortedHotels.length
        });

      }, 300);
    });
  },
  // 管理端：待审核列表
  getPendingAuditList: async (page: number, pageSize: number = 10): Promise<{ list: IHotel[], total: number }> => {
    return new Promise((resolve) => {
      const allMap = getLocalData();
      const pending = Object.values(allMap).filter(h => h.status === HotelStatus.PENDING);
      const start = (page - 1) * pageSize;
      resolve({
        list: pending.slice(start, start + pageSize),
        total: pending.length
      });
    });
  },

  // 管理端：已通过列表
  getPublishedList: async (page: number, pageSize: number = 10): Promise<{ list: IHotel[], total: number }> => {
    return new Promise((resolve) => {
      const allMap = getLocalData();
      const published = Object.values(allMap).filter(h => h.status === HotelStatus.PUBLISHED);
      const start = (page - 1) * pageSize;
      resolve({
        list: published.slice(start, start + pageSize),
        total: published.length
      });
    });
  },

  // 管理端：已拒绝列表
  getRejectedList: async (page: number, pageSize: number = 10): Promise<{ list: IHotel[], total: number }> => {
    return new Promise((resolve) => {
      const allMap = getLocalData();
      const rejected = Object.values(allMap).filter(h => h.status === HotelStatus.REJECTED);
      const start = (page - 1) * pageSize;
      resolve({
        list: rejected.slice(start, start + pageSize),
        total: rejected.length
      });
    });
  },

  approveHotel: async (id: string): Promise<IHotel | null> => {
    const allMap = getLocalData();
    const target = allMap[id];
    if (!target) return Promise.resolve(null);

    if (target.sourceHotelId) {
      const source = allMap[target.sourceHotelId];
      if (!source) return Promise.resolve(null);

      const { id: _id, status, sourceHotelId, rejectionReason, ...rest } = target;
      allMap[target.sourceHotelId] = {
        ...source,
        ...rest,
        status: HotelStatus.PUBLISHED,
        rejectionReason: undefined,
      };
      delete allMap[id];
      LocalStorage.set(STORAGE_KEYS.HOTEL_MAP, allMap);
      return Promise.resolve(allMap[target.sourceHotelId]);
    }

    target.status = HotelStatus.PUBLISHED;
    target.rejectionReason = undefined;
    LocalStorage.set(STORAGE_KEYS.HOTEL_MAP, allMap);
    return Promise.resolve(target);
  },

  rejectHotel: async (id: string, reason: string): Promise<IHotel | null> => {
    return hotelService.updateHotel(id, { status: HotelStatus.REJECTED, rejectionReason: reason });
  },

  offlineHotel: async (id: string): Promise<IHotel | null> => {
    return hotelService.updateHotel(id, { status: HotelStatus.OFFLINE });
  },

  // 2. 商户专用：获取名下所有酒店列表
  getMerchantHotels: async (merchantName?: string): Promise<IHotel[]> => {
    const allMap = getLocalData();
    const list = Object.values(allMap);
    if (!merchantName) {
      return Promise.resolve(list);
    }
    return Promise.resolve(list.filter(h => h.uploadedBy === merchantName));
  },

  getHotelById: async (id: string): Promise<IHotel | null> => {
    const allMap = getLocalData();
    return Promise.resolve(allMap[id] || null);
  },

  // 3. 创建与自动生成ID
  createHotel: async (hotel: Omit<IHotel, 'id'>): Promise<IHotel> => {
    const allMap = getLocalData();
    const newId = `${Date.now()}`;
    const newHotel = { ...hotel, id: newId };
    allMap[newId] = newHotel;
    LocalStorage.set(STORAGE_KEYS.HOTEL_MAP, allMap);
    return Promise.resolve(newHotel);
  },

  updateHotel: async (id: string, updates: Partial<IHotel>): Promise<IHotel | null> => {
    const allMap = getLocalData();
    if (!allMap[id]) return Promise.resolve(null);
    allMap[id] = { ...allMap[id], ...updates };
    LocalStorage.set(STORAGE_KEYS.HOTEL_MAP, allMap);
    return Promise.resolve(allMap[id]);
  }
};