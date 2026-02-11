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
  },
  getHotelById: async (id: string): Promise<IHotel> => {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        const hotel = MOCK_HOTELS.find((h) => `${h.id}` === `${id}`);
        if (!hotel) {
          reject(new Error('hotel not found'));
          return;
        }
        resolve(hotel);
      }, 300); // 模拟请求延迟
    })
  }

};