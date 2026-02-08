import Taro from '@tarojs/taro';
import { useState, useEffect } from 'react';

export const useEnvironment = () => {
  const [isPC, setIsPC] = useState(false);

  useEffect(() => {
    // 获取系统信息
    const getEnv = () => {
      const info = Taro.getSystemInfoSync();
      // 宽度大于 1024 判定为 PC
      setIsPC(info.windowWidth > 1024);
    };

    getEnv();
    
    // 如果是 H5 端，监听窗口大小变化（可选优化）
    if (process.env.TARO_ENV === 'h5') {
      window.addEventListener('resize', getEnv);
      return () => window.removeEventListener('resize', getEnv);
    }
  }, []);

  return { isPC };
};