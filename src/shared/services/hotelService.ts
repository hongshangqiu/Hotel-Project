import request from './request';
import { IHotel, HotelStatus } from '../types/hotel';

// 准备假数据
const MOCK_DATA: IHotel[] = [
  {
    id: '1',
    nameCn: '上海陆家嘴酒店',
    nameEn: 'Lujiazui Hotel',
    address: '上海市浦东新区',
    star: 5,
    price: 999,
    openingTime: '2026-01-01',
    roomType: '豪华大床房',
    status: HotelStatus.PUBLISHED,
    imageUrl: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=500'
  }
];

export const hotelService = {
  // 模拟获取酒店列表
  getHotels: async (): Promise<IHotel[]> => {
    // 实际项目中会是：return request.get('/api/hotels');
    return Promise.resolve(MOCK_DATA); 
  }
};