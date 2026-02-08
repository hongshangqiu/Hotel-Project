import { IHotel, HotelStatus } from '../types/hotel';

// 生成 15 条假数据
const MOCK_HOTELS: IHotel[] = Array.from({ length: 15 }).map((_, index) => ({
  id: `${index + 1}`,
  nameCn: `易宿精选酒店 ${index + 1} 号`,
  nameEn: `Easy Stay Hotel No.${index + 1}`,
  address: `上海市浦东新区世纪大道 ${100 + index} 号`,
  star: (index % 3) + 3, // 3-5星
  price: 300 + index * 50,
  openingTime: '2025-01-01',
  roomType: '大床房/双床房',
  status: HotelStatus.PUBLISHED,
  imageUrl: `https://picsum.photos/200/200?random=${index}` // 随机图
}));

export const hotelService = {
  // 模拟分页获取数据：params 包含页码和每页条数
  getHotelsByPage: async (page: number, pageSize: number = 5): Promise<IHotel[]> => {
    return new Promise((resolve) => {
      setTimeout(() => {
        const start = (page - 1) * pageSize;
        const end = start + pageSize;
        resolve(MOCK_HOTELS.slice(start, end));
      }, 800); // 模拟网络延迟
    });
  }
};