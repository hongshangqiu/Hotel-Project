// 酒店状态枚举
export enum HotelStatus {
  PENDING = 'PENDING',
  PUBLISHED = 'PUBLISHED',
  REJECTED = 'REJECTED',
  OFFLINE = 'OFFLINE'
}

export interface IHotelRoom {
  id: string;
  name: string;        // 房型名
  price: number;       // 价格
  imageUrl: string;    // 房型图片

  size: string;        // 房间面积，如 28㎡
  capacity: number;   // 入住人数，如 2
  bedType: string;    // 床型，如 1.8m大床
  policy: string;     // 入住政策（文案）
}

// 酒店详情接口
export interface IHotel {
  id: string;
  uploadedBy: string;
  sourceHotelId?: string;
  nameCn: string;
  nameEn: string;
  address: string;
  star: number;
  price: number;
  openingTime: string;
  roomType: string;
  rooms?: IHotelRoom[];
  status: HotelStatus;
  imageUrl: string;
  rejectionReason?: string;
  nearbyIntro?: string;
  tags?: string[];
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
  stars?: number[];
  priceRange?: [number, number];
  tags?: string[];
}

// 通用分页响应
export interface IPaginationResponse<T> {
  list: T[];
  total: number;
  page: number;
  pageSize: number;
}
