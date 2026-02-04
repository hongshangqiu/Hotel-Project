export enum UserRole {
  MERCHANT = 'MERCHANT', // 商户：负责上传/编辑酒店
  ADMIN = 'ADMIN'        // 管理员：负责审核/发布
}

export interface IUser {
  id: string;
  username: string;
  role: UserRole;
  avatar?: string;
}