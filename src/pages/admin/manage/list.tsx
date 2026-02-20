import { View, Text } from '@tarojs/components';
import Taro, { useDidShow } from '@tarojs/taro';
import { useState } from 'react';
import { Tag, Button, Empty } from '@nutui/nutui-react-taro';
import { hotelService } from '../../../shared/services/hotelService';
import { IHotel, HotelStatus } from '../../../shared/types/index';
import './list.scss';

const MerchantList = () => {
  const [list, setList] = useState<IHotel[]>([]);

  useDidShow(() => {
    hotelService.getMerchantHotels().then(setList);
  });

  const getStatusInfo = (s: HotelStatus) => {
    const map = {
      [HotelStatus.PENDING]: { text: '审核中', color: '#fa9d3b' },
      [HotelStatus.PUBLISHED]: { text: '已发布', color: '#4caf50' },
      [HotelStatus.REJECTED]: { text: '已驳回', color: '#f44336' },
      [HotelStatus.OFFLINE]: { text: '已下线', color: '#9e9e9e' },
    };
    return map[s] || { text: '未知', color: '#333' };
  };

  return (
    <View className='merchant-list-container'>
      <View className='list-header'>
        <Text className='title'>我的酒店资产</Text>
        <Button size='small' type='primary' onClick={() => Taro.navigateTo({ url: '/pages/admin/manage/index' })}>+ 新增酒店入驻</Button>
      </View>

      <View className='card-grid'>
        {list.length > 0 ? list.map(h => (
          <View key={h.id} className='hotel-mini-card'>
            <View className='top'>
              <Text className='name'>{h.nameCn}</Text>
              <Tag style={{ background: getStatusInfo(h.status).color, color: '#fff' }}>{getStatusInfo(h.status).text}</Tag>
            </View>
            <View className='mid'>
              <Text>房型数量：{h.rooms?.length || 0}</Text>
              <Text>当前起价：¥{h.price}</Text>
            </View>
            <Button block size='small' fill='outline' onClick={() => Taro.navigateTo({ url: `/pages/admin/manage/index?id=${h.id}` })}>编辑详情</Button>
          </View>
        )) : <Empty description="暂无数据" />}
      </View>
    </View>
  );
};

export default MerchantList;