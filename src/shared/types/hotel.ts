export enum HotelStatus {
  PENDING = 'PENDING',
  PUBLISHED = 'PUBLISHED',
  REJECTED = 'REJECTED',
  OFFLINE = 'OFFLINE'
}

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
}

export interface IHotelSearchParams {
  city: string;
  startDate: string;
  endDate: string;
  keyword?: string;
}