import axios from 'axios';
import Taro from '@tarojs/taro';

// 创建 Axios 实例
const request = axios.create({
  baseURL: process.env.API_BASE_URL || 'https://api.example.com',
  timeout: 10000,
});

// 请求拦截器
request.interceptors.request.use(
  (config) => {
    // 从 Store 获取 Token（如果需要）
    // const token = useStore.getState().user?.token;
    // if (token) config.headers.Authorization = `Bearer ${token}`;
    return config;
  },
  (error) => Promise.reject(error)
);

// 响应拦截器
request.interceptors.response.use(
  (response) => response.data,
  (error) => {
    Taro.showToast({
      title: error.response?.data?.message || '请求失败',
      icon: 'none',
    });
    return Promise.reject(error);
  }
);

export default request;
