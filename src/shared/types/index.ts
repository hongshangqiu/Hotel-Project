// 酒店相关接口定义
export interface IHotel {
  id: string;
  name: string;
  address: string;
  price: number;
  rating: number;
  images: string[];
  description: string;
}

// 用户相关接口定义
export interface IUser {
  id: string;
  username: string;
  role: 'user' | 'admin';
  token?: string;
}

// 通用分页响应
export interface IPaginationResponse<T> {
  list: T[];
  total: number;
  page: number;
  pageSize: number;
}
