import { View, Text, Image } from '@tarojs/components';
import Taro, { useDidShow } from '@tarojs/taro';
import { useState } from 'react';
import { Button, Tag, Empty } from '@nutui/nutui-react-taro';
import { useStore } from '@/shared/store';
import { hotelService } from '@/shared/services/hotelService';
import { HotelStatus, IHotel } from '@/shared/types';
import { LocalStorage, STORAGE_KEYS } from '@/shared/utils/LocalStorage';
import './index.scss';

const MerchantHome = () => {
  const { user, logout } = useStore();
  const [list, setList] = useState<IHotel[]>([]);

  useDidShow(() => {
    hotelService.getMerchantHotels(user?.username).then(setList);
  });

  const getStatusInfo = (status: HotelStatus) => {
    const map = {
      [HotelStatus.PENDING]: { text: '审核中', color: '#f0a23a' },
      [HotelStatus.REJECTED]: { text: '已驳回', color: '#e0524d' },
      [HotelStatus.PUBLISHED]: { text: '已发布', color: '#2f9b5a' },
      [HotelStatus.OFFLINE]: { text: '已下线', color: '#8b8f97' },
    };
    return map[status] || { text: '未知', color: '#6b7280' };
  };

  return (
    <View className='merchant-home'>
      <View className='hero'>
        <View className='hero-left'>
          <Text className='hero-title'>商户中心</Text>
          <View className='hero-user-row'>
            <Text className='hero-user'>账号：{user?.username || '未登录'}</Text>
            <Button
              size='small'
              className='hero-logout'
              onClick={() => {
                logout();
                Taro.reLaunch({ url: '/pages/admin/login/index' });
              }}
            >
              退出登录
            </Button>
          </View>
        </View>
        <Button className='hero-add' type='primary' onClick={() => Taro.navigateTo({ url: '/pages/admin/manage/index' })}>
          添加酒店
        </Button>
      </View>

      <View className='content'>
        <View className='section-title'>已上传酒店</View>
        {list.length > 0 ? (
          <View className='card-grid'>
            {list.map((hotel) => {
              const status = getStatusInfo(hotel.status);
              return (
                <View key={hotel.id} className='hotel-card'>
                  <View className='card-cover'>
                    {hotel.imageUrl ? (
                      <Image className='cover-img' src={hotel.imageUrl} mode='aspectFill' />
                    ) : (
                      <View className='cover-placeholder'>
                        <Text className='cover-text'>HOTEL</Text>
                      </View>
                    )}
                    <Tag className='status-tag' style={{ background: status.color }}>
                      {status.text}
                    </Tag>
                  </View>
                  <View className='card-body'>
                    <View className='card-top'>
                      <Text className='hotel-name'>{hotel.nameCn}</Text>
                    </View>
                    <Text className='hotel-addr'>{hotel.address}</Text>
                    <View className='hotel-meta'>
                      <Text>星级：{hotel.star}</Text>
                      <Text>房型：{hotel.rooms?.length || 0}</Text>
                      <Text>起价：¥{hotel.price}</Text>
                    </View>
                    <View className='card-actions'>
                      <Button
                        size='small'
                        type='primary'
                        onClick={() => {
                          LocalStorage.set(STORAGE_KEYS.EDIT_HOTEL_ID, hotel.id);
                          Taro.navigateTo({ url: '/pages/admin/manage/index' });
                        }}
                      >
                        管理酒店
                      </Button>
                    </View>
                  </View>
                </View>
              );
            })}
          </View>
        ) : (
          <Empty description='暂无酒店数据' />
        )}
      </View>
    </View>
  );
};

export default MerchantHome;
