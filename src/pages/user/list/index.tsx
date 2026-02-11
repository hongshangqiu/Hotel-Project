import { View, Text, Image, ScrollView } from '@tarojs/components';
import Taro, { useReachBottom } from '@tarojs/taro';
import { useState, useEffect } from 'react';
import { hotelService } from '../../../shared/services/hotelService';
import { IHotel } from '../../../shared/types/hotel';
import './index.scss';

const HotelList = () => {
  const [list, setList] = useState<IHotel[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);

  // 加载数据的方法
  const loadData = async (currentPage: number) => {
    if (loading || !hasMore) return;
    setLoading(true);
    
    try {
      const res = await hotelService.getHotelsByPage(currentPage);
      const { list: newList, total: totalCount } = res;
      
      setTotal(totalCount);
      
      if (newList.length < 5) {
        setHasMore(false); // 不满5条说明到底了
      }
      setList(prev => [...prev, ...newList]);
      setPage(currentPage + 1);
    } catch (err) {
      Taro.showToast({ title: '加载失败', icon: 'none' });
    } finally {
      setLoading(false);
    }
  };

  // 初始加载
  useEffect(() => {
    loadData(1);
  }, []);

  // 核心：监听触底事件（上滑自动加载）
  useReachBottom(() => {
    loadData(page);
  });

  return (
    <View className='list-page'>
      <View className='header'>
        <Text className='title'>共发现 {total} 家酒店</Text>
      </View>

      <View className='hotel-list'>
        {list.map((hotel) => (
          <View key={hotel.id} className='hotel-card' onClick={() => Taro.navigateTo({ url: `/pages/user/detail/index?id=${hotel.id}` })}>
            <Image className='cover' src={hotel.imageUrl} />
            <View className='info'>
              <View className='name-row'>
                <Text className='name'>{hotel.nameCn}</Text>
                <Text className='star'>{hotel.star}星</Text>
              </View>
              <Text className='address'>{hotel.address}</Text>
              <View className='price-row'>
                <Text className='price-symbol'>¥</Text>
                <Text className='price-val'>{hotel.price}</Text>
                <Text className='price-unit'>起</Text>
              </View>
            </View>
          </View>
        ))}
      </View>

      {/* 加载状态提示 */}
      <View className='loading-status'>
        {loading ? '正在拼命加载...' : !hasMore ? '—— 到底啦 ——' : ''}
      </View>
    </View>
  );
};

export default HotelList;