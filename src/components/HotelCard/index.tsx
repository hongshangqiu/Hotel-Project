import { View, Text, Image } from '@tarojs/components';
import Taro from '@tarojs/taro';
import { memo, useCallback, useMemo } from 'react';
import { IHotel } from '../../shared/types';
import { LocalStorage, STORAGE_KEYS } from '../../shared/utils/LocalStorage';
import { calculateHotelMinPrice } from '../../shared/utils/priceCalculator';
import StarRating from '../StarRating';
import './index.scss';

interface HotelCardProps {
  hotel: IHotel;
  index: number;
  startDate?: string;
  endDate?: string;
}

// 使用 memo 包装组件，只有当 hotel 或 index 变化时才重新渲染
const HotelCard = memo<HotelCardProps>(({ hotel, index, startDate, endDate }) => {
  const handleClick = useCallback(() => {
    LocalStorage.set(STORAGE_KEYS.USER_VIEW_HOTEL_ID, hotel.id);
    Taro.navigateTo({ url: '/pages/user/detail/index' });
  }, [hotel.id]);

  // 计算动态价格（用户端只显示最终价格），使用传入的日期或默认日期
  const displayPrice = useMemo(() => {
    const result = calculateHotelMinPrice(hotel, startDate, endDate);
    return result.price;
  }, [hotel.price, hotel.priceConfig, startDate, endDate]);

  return (
    <View 
      key={`${hotel.id}-${index}`} 
      className='hotel-card'
      onClick={handleClick}
    >
      <Image 
        className='cover' 
        src={hotel.imageUrl} 
        mode='aspectFill'
        lazyLoad={true}
      />
      <View className='info'>
        <View className='name-row'>
          <Text className='name'>{hotel.nameCn}</Text>
          <StarRating rating={hotel.star || 0} size="small" />
        </View>
        <Text className='address'>{hotel.address}</Text>
        <View className='price-row'>
          <Text className='price-symbol'>¥</Text>
          <Text className='price-val'>{displayPrice}</Text>
          <Text className='price-unit'>起</Text>
        </View>
      </View>
    </View>
  );
}, (prevProps, nextProps) => {
  // 自定义比较函数：只有当 id 或 price 变化时才重新渲染
  return (
    prevProps.hotel.id === nextProps.hotel.id &&
    prevProps.hotel.price === nextProps.hotel.price &&
    prevProps.hotel.nameCn === nextProps.hotel.nameCn &&
    prevProps.hotel.star === nextProps.hotel.star &&
    prevProps.startDate === nextProps.startDate &&
    prevProps.endDate === nextProps.endDate
  );
});

// 设置 displayName 以便于调试
HotelCard.displayName = 'HotelCard';

export default HotelCard;
