import { IHotel, HotelStatus } from '../types/hotel';
import { LocalStorage, STORAGE_KEYS } from '../utils/LocalStorage';


// 生成 15 条假数据
const MOCK_HOTELS: IHotel[] = Array.from({ length: 15 }).map((_, index) => ({
  id: `${index + 1}`,
  nameCn: `易宿精选酒店 ${index + 1} 号`,
  nameEn: `Easy Stay Hotel No.${index + 1}`,
  address: `上海市浦东新区世纪大道 ${100 + index} 号`,
  star: (index % 3) + 3,
  price: 300 + index * 50,
  openingTime: '2025-01-01',
  roomType: '大床房/双床房',
  // ⭐ 新增房型列表
  rooms: [
    {
      id: 'room-1',
      name: '高级大床房',
      price: 350,
      imageUrl: 'https://picsum.photos/200/150?random=11',
      size: '28㎡',
      capacity: 2,
      bedType: '1.8m 大床',
      policy: '可免费取消 · 不含早餐',
    },
    {
      id: 'room-2',
      name: '高级双床房',
      price: 370,
      imageUrl: 'https://picsum.photos/200/150?random=12',
      size: '32㎡',
      capacity: 2,
      bedType: '1.2m 双床',
      policy: '不可取消 · 含早餐',
    },
  ],
  status: HotelStatus.PUBLISHED,
  imageUrl: `https://picsum.photos/200/200?random=${index}`,
  description: '酒店位于市中心，交通便利，设施齐全，服务周到。',
  rating: 4.5,
  images: [
    `https://picsum.photos/800/600?random=${index}`,
    `https://picsum.photos/800/600?random=${index + 100}`,
    `https://picsum.photos/800/600?random=${index + 200}`
  ]
}));

// 获取酒店Map
const getHotelMap = (): Map<string, IHotel> => {
  const hotelMap = LocalStorage.get<Record<string, IHotel>>(STORAGE_KEYS.HOTEL_MAP);

  // 如果本地存储没有数据（首次加载），自动初始化 Mock 数据
  if (!hotelMap || Object.keys(hotelMap).length === 0) {
    const newMap = new Map<string, IHotel>();
    MOCK_HOTELS.forEach(hotel => {
      newMap.set(hotel.id, hotel);
    });
    // 保存到本地存储
    const obj: Record<string, IHotel> = {};
    newMap.forEach((value, key) => {
      obj[key] = value;
    });
    LocalStorage.set(STORAGE_KEYS.HOTEL_MAP, obj);
    return newMap;
  }

  return new Map(Object.entries(hotelMap));
};

// 保存酒店Map到本地存储
const saveHotelMap = (hotelMap: Map<string, IHotel>): void => {
  const obj: Record<string, IHotel> = {};
  hotelMap.forEach((value, key) => {
    obj[key] = value;
  });
  LocalStorage.set(STORAGE_KEYS.HOTEL_MAP, obj);
};

// 获取当前最大ID
const getMaxId = (hotelMap: Map<string, IHotel>): number => {
  let maxId = 0;
  hotelMap.forEach(hotel => {
    const numId = parseInt(hotel.id, 10);
    if (!isNaN(numId) && numId > maxId) {
      maxId = numId;
    }
  });
  return maxId;
};

export const hotelService = {
  // 1. 获取列表
  getHotelsByPage: async (page: number, pageSize: number = 5): Promise<{ list: IHotel[], total: number }> => {
    return new Promise((resolve) => {
      setTimeout(() => {
        const hotelMap = getHotelMap();
        const allHotels = Array.from(hotelMap.values());
        const publishedHotels = allHotels.filter(h => h.status === HotelStatus.PUBLISHED);
        
        const start = (page - 1) * pageSize;
        const end = start + pageSize;
        
        resolve({
          list: publishedHotels.slice(start, end),
          total: publishedHotels.length
        });
      }, 300);
    });
  },

  /**
   * 获取酒店详情
   * @param id 酒店ID
   * @returns 酒店详情对象，不存在返回 null
   */
  getHotelById: async (id: string): Promise<IHotel | null> => {
    return new Promise((resolve) => {
      setTimeout(() => {
        const hotelMap = getHotelMap();
        const hotel = hotelMap.get(id) || null;
        resolve(hotel);
      }, 200);
    });
  },

  /**
   * 获取所有酒店列表
   * @returns 所有酒店数组
   */
  getAllHotels: async (): Promise<IHotel[]> => {
    return new Promise((resolve) => {
      setTimeout(() => {
        const hotelMap = getHotelMap();
        const hotels = Array.from(hotelMap.values());
        resolve(hotels);
      }, 200);
    });
  },

  /**
   * 新增酒店
   * 自动生成唯一ID，并添加到本地存储
   * @param hotel 酒店对象（不包含id）
   * @returns 新创建的酒店对象（包含生成的id）
   */
  createHotel: async (hotel: Omit<IHotel, 'id'>): Promise<IHotel> => {
    return new Promise((resolve) => {
      setTimeout(() => {
        const hotelMap = getHotelMap();
        const maxId = getMaxId(hotelMap);
        const newId = `${maxId + 1}`;

        const newHotel: IHotel = {
          ...hotel,
          id: newId
        };

        hotelMap.set(newId, newHotel);
        saveHotelMap(hotelMap);

        resolve(newHotel);
      }, 300);
    });
  },

  /**
   * 更新酒店信息
   * @param id 酒店ID
   * @param updates 要更新的字段
   * @returns 更新后的酒店对象，不存在返回 null
   */
  updateHotel: async (id: string, updates: Partial<IHotel>): Promise<IHotel | null> => {
    return new Promise((resolve) => {
      setTimeout(() => {
        const hotelMap = getHotelMap();
        const existingHotel = hotelMap.get(id);

        if (!existingHotel) {
          resolve(null);
          return;
        }

        const updatedHotel: IHotel = {
          ...existingHotel,
          ...updates,
          id: existingHotel.id
        };

        hotelMap.set(id, updatedHotel);
        saveHotelMap(hotelMap);

        resolve(updatedHotel);
      }, 300);
    });
  },

  /**
   * 删除酒店
   * @param id 酒店ID
   * @returns 是否删除成功
   */
  deleteHotel: async (id: string): Promise<boolean> => {
    return new Promise((resolve) => {
      setTimeout(() => {
        const hotelMap = getHotelMap();
        const deleted = hotelMap.delete(id);

        if (deleted) {
          saveHotelMap(hotelMap);
        }

        resolve(deleted);
      }, 300);
    });
  },

  /**
   * 搜索酒店
   * @param keyword 关键词
   * @returns 匹配的酒店数组
   */
  searchHotels: async (keyword: string): Promise<IHotel[]> => {
    return new Promise((resolve) => {
      setTimeout(() => {
        const hotelMap = getHotelMap();
        const hotels = Array.from(hotelMap.values());

        if (!keyword.trim()) {
          resolve(hotels);
          return;
        }

        const lowerKeyword = keyword.toLowerCase();
        const filtered = hotels.filter(hotel =>
          hotel.nameCn.toLowerCase().includes(lowerKeyword) ||
          hotel.nameEn.toLowerCase().includes(lowerKeyword) ||
          hotel.address.toLowerCase().includes(lowerKeyword)
        );

        resolve(filtered);
      }, 200);
    });
  },

  /**
   * 重置酒店数据到初始状态
   * 清除本地存储中的酒店数据，恢复为默认的 Mock 数据
   */
  resetToDefault: async (): Promise<void> => {
    return new Promise((resolve) => {
      setTimeout(() => {
        const newMap = new Map<string, IHotel>();
        MOCK_HOTELS.forEach(hotel => {
          newMap.set(hotel.id, hotel);
        });
        saveHotelMap(newMap);
        resolve();
      }, 300);
    });
  },

  /**
   * 获取酒店数量
   * @returns 酒店总数
   */
  getHotelCount: async (): Promise<number> => {
    const hotelMap = getHotelMap();
    return hotelMap.size;
  },

  /**
   * 获取待审核列表
   * 筛选状态为 PENDING 的酒店
   * @param page 页码
   * @param pageSize 每页数量
   * @returns 待审核酒店列表
   */
  getPendingAuditList: async (page: number, pageSize: number = 10): Promise<{ list: IHotel[]; total: number }> => {
    return new Promise((resolve) => {
      setTimeout(() => {
        const hotelMap = getHotelMap();
        const allHotels = Array.from(hotelMap.values());
        const pendingHotels = allHotels.filter(hotel => hotel.status === HotelStatus.PENDING);
        const total = pendingHotels.length;
        const start = (page - 1) * pageSize;
        const end = start + pageSize;
        resolve({
          list: pendingHotels.slice(start, end),
          total
        });
      }, 300);
    });
  },

  /**
   * 获取已发布列表
   * 筛选状态为 PUBLISHED 的酒店
   * @param page 页码
   * @param pageSize 每页数量
   * @returns 已发布酒店列表
   */
  getPublishedList: async (page: number, pageSize: number = 10): Promise<{ list: IHotel[]; total: number }> => {
    return new Promise((resolve) => {
      setTimeout(() => {
        const hotelMap = getHotelMap();
        const allHotels = Array.from(hotelMap.values());
        const publishedHotels = allHotels.filter(hotel => hotel.status === HotelStatus.PUBLISHED);
        const total = publishedHotels.length;
        const start = (page - 1) * pageSize;
        const end = start + pageSize;
        resolve({
          list: publishedHotels.slice(start, end),
          total
        });
      }, 300);
    });
  },

  /**
   * 审核通过
   * 将酒店状态从 PENDING 更新为 PUBLISHED
   * @param id 酒店ID
   * @returns 更新后的酒店对象，不存在返回 null
   */
  approveHotel: async (id: string): Promise<IHotel | null> => {
    return new Promise((resolve) => {
      setTimeout(() => {
        const hotelMap = getHotelMap();
        const hotel = hotelMap.get(id);

        if (!hotel) {
          resolve(null);
          return;
        }

        if (hotel.status !== HotelStatus.PENDING) {
          resolve(null);
          return;
        }

        const updatedHotel: IHotel = {
          ...hotel,
          status: HotelStatus.PUBLISHED,
          rejectionReason: undefined // 清空驳回原因
        };

        hotelMap.set(id, updatedHotel);
        saveHotelMap(hotelMap);

        resolve(updatedHotel);
      }, 300);
    });
  },

  /**
   * 驳回审核
   * 将酒店状态从 PENDING 更新为 REJECTED，并保存驳回原因
   * @param id 酒店ID
   * @param reason 驳回原因
   * @returns 更新后的酒店对象，不存在返回 null
   */
  rejectHotel: async (id: string, reason: string): Promise<IHotel | null> => {
    return new Promise((resolve) => {
      setTimeout(() => {
        const hotelMap = getHotelMap();
        const hotel = hotelMap.get(id);

        if (!hotel) {
          resolve(null);
          return;
        }

        if (hotel.status !== HotelStatus.PENDING) {
          resolve(null);
          return;
        }

        const updatedHotel: IHotel = {
          ...hotel,
          status: HotelStatus.REJECTED,
          rejectionReason: reason
        };

        hotelMap.set(id, updatedHotel);
        saveHotelMap(hotelMap);

        resolve(updatedHotel);
      }, 300);
    });
  },

  /**
   * 下线酒店
   * 将酒店状态从 PUBLISHED 更新为 OFFLINE
   * @param id 酒店ID
   * @returns 更新后的酒店对象，不存在返回 null
   */
  offlineHotel: async (id: string): Promise<IHotel | null> => {
    return new Promise((resolve) => {
      setTimeout(() => {
        const hotelMap = getHotelMap();
        const hotel = hotelMap.get(id);

        if (!hotel) {
          resolve(null);
          return;
        }

        if (hotel.status !== HotelStatus.PUBLISHED) {
          resolve(null);
          return;
        }

        const updatedHotel: IHotel = {
          ...hotel,
          status: HotelStatus.OFFLINE
        };

        hotelMap.set(id, updatedHotel);
        saveHotelMap(hotelMap);

        resolve(updatedHotel);
      }, 300);
    });
  }
};