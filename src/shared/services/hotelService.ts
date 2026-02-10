import { IHotel, HotelStatus } from '../types/hotel';

/**
 * 以下方法的具体实现（如 localStorage 持久化）属于任务 3。
 */

// 静态假数据供 UI 渲染使用
const MOCK_HOTELS: IHotel[] = Array.from({ length: 15 }).map((_, index) => ({
  id: `${index + 1}`,
  nameCn: `易宿精选酒店 ${index + 1} 号`,
  nameEn: `Easy Stay Hotel No.${index + 1}`,
  address: `上海市浦东新区世纪大道 ${100 + index} 号`,
  star: (index % 3) + 3,
  price: 300 + index * 50,
  openingTime: '2025-01-01',
  roomType: '大床房/双床房',
  status: HotelStatus.PUBLISHED,
  imageUrl: `https://picsum.photos/200/200?random=${index}`
}));

export const hotelService = {
  // 1. 获取列表
  getHotelsByPage: async (page: number, pageSize: number = 5): Promise<IHotel[]> => {
    return new Promise((resolve) => {
      setTimeout(() => {
        const start = (page - 1) * pageSize;
        const end = start + pageSize;
        resolve(MOCK_HOTELS.slice(start, end));
      }, 500);
    });
  },

  // 2. 根据 ID 获取酒店 (任务3：在此处实现 localStorage 读取)
  getHotelById: async (id: string): Promise<IHotel | undefined> => {
    console.log('[任务2占位] 正在查询 ID:', id);
    return Promise.resolve(MOCK_HOTELS.find(h => h.id === id));
  },

  // 3. 新增酒店 (任务3：在此处实现自动生成 ID 和存入 localStorage)
  createHotel: async (data: Omit<IHotel, 'id'>): Promise<{ success: boolean; id: string }> => {
    console.log('[任务2占位] 收到新增数据，等待任务3实现持久化:', data);
    return Promise.resolve({ success: true, id: 'temp-' + Date.now() });
  },

  // 4. 更新酒店 (任务3：在此处实现 localStorage 更新)
  updateHotel: async (id: string, data: Partial<IHotel>): Promise<{ success: boolean }> => {
    console.log('[任务2占位] 收到更新请求，ID:', id, '数据:', data);
    return Promise.resolve({ success: true });
  }
};