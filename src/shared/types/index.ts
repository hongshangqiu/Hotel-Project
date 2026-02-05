// 酒店状态枚举
export enum HotelStatus {
  PENDING = 'PENDING',
  PUBLISHED = 'PUBLISHED',
  REJECTED = 'REJECTED',
  OFFLINE = 'OFFLINE'
}

// 酒店详情接口
export interface IHotel {
  id: string;
  nameCn: string;
  nameEn: string;
  address: string;
  star: number;
  price: number;
  openingTime: string;
  roomType: string;
  status: HotelStatus;
  imageUrl: string;
  rejectionReason?: string;
  description?: string; // 从 index.ts 补充
  rating?: number; // 从 index.ts 补充
  images?: string[]; // 从 index.ts 补充
}

// 用户角色枚举
export enum UserRole {
  MERCHANT = 'MERCHANT',
  ADMIN = 'ADMIN',
  USER = 'USER'
}

// 用户相关接口定义
export interface IUser {
  id: string;
  username: string;
  role: UserRole;
  avatar?: string;
  token?: string;
}

// 酒店搜索参数
export interface IHotelSearchParams {
  city: string;
  startDate: string;
  endDate: string;
  keyword?: string;
}

// 通用分页响应
export interface IPaginationResponse<T> {
  list: T[];
  total: number;
  page: number;
  pageSize: number;
}
