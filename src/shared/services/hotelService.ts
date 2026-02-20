import { IHotel, HotelStatus } from '../types/index';
import { LocalStorage, STORAGE_KEYS } from '../utils/LocalStorage';

// 初始假数据
const MOCK_HOTELS: IHotel[] = Array.from({ length: 15 }).map((_, index) => ({
  id: `${index + 1}`,
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
}));

const getLocalData = (): Record<string, IHotel> => {
  const data = LocalStorage.get<Record<string, IHotel>>(STORAGE_KEYS.HOTEL_MAP);
  if (!data || Object.keys(data).length === 0) {
    const initial: Record<string, IHotel> = {};
    MOCK_HOTELS.forEach(h => initial[h.id] = h);
    LocalStorage.set(STORAGE_KEYS.HOTEL_MAP, initial);
    return initial;
  }
  return data;
};

export const hotelService = {
  // 1. 获取列表
  getHotelsByPage: async (
    page: number,
    pageSize: number = 5,
    sortType?: 'priceAsc' | 'priceDesc' | 'star',
    stars?: number[],
    priceRange?: [number, number]
  ): Promise<{ list: IHotel[], total: number }> => {

    return new Promise((resolve) => {

      setTimeout(() => {

        const hotelMap = getHotelMap()
        const allHotels = Array.from(hotelMap.values())

        const publishedHotels = allHotels.filter(
          h => h.status === HotelStatus.PUBLISHED
        )

        // ⭐ 筛选

        let filteredHotels = [...publishedHotels]

        // 星级筛选
        if (stars && stars.length > 0) {
          filteredHotels = filteredHotels.filter(h =>
            stars.includes(h.star)
          )
        }

        // 价格筛选
        if (priceRange) {
          filteredHotels = filteredHotels.filter(h =>
            h.price >= priceRange[0] && h.price <= priceRange[1]
          )
        }

        // ⭐ 排序
        let sortedHotels = [...filteredHotels]

        if (sortType === 'priceAsc')
          sortedHotels.sort((a, b) => a.price - b.price)

        if (sortType === 'priceDesc')
          sortedHotels.sort((a, b) => b.price - a.price)

        if (sortType === 'star')
          sortedHotels.sort((a, b) => b.star - a.star)

        // ⭐ 分页
        const start = (page - 1) * pageSize
        const end = start + pageSize

        resolve({
          list: sortedHotels.slice(start, end),
          total: sortedHotels.length
        })

      }, 300)

    })

  },

  // 2. 商户专用：获取名下所有酒店列表 (任务 2.2)
  getMerchantHotels: async (): Promise<IHotel[]> => {
    const allMap = getLocalData();
    return Promise.resolve(Object.values(allMap));
  },

  getHotelById: async (id: string): Promise<IHotel | null> => {
    const allMap = getLocalData();
    return Promise.resolve(allMap[id] || null);
  },

  // 3. 创建与自动生成ID (任务 2.3)
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