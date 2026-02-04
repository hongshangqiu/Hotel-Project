import { View, Swiper, SwiperItem, Image, Input, Button, Text } from '@tarojs/components';
import { useHotelStore } from '../../../shared/store/useHotelStore';
import Calendar from '../../../components/Calendar/index';
import './index.scss';

const Index = () => {
  const { searchParams, setSearchParams, setCalendarVisible } = useHotelStore();

  return (
    <View className='home-page'>
      {/* 1. Banner */}
      <Swiper className='banner' autoplay indicatorDots>
        <SwiperItem><Image src='https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800' /></SwiperItem>
      </Swiper>

      {/* 2. 查询卡片 */}
      <View className='search-container'>
        <View className='item'>
          <Text>目的地：</Text>
          <Input value={searchParams.city} onInput={e => setSearchParams({ city: e.detail.value })} />
        </View>
        <View className='item' onClick={() => setCalendarVisible(true)}>
          <Text>日期：{searchParams.startDate} 至 {searchParams.endDate}</Text>
        </View>
        <Button className='search-btn'>查询酒店</Button>
      </View>

      <Calendar />
    </View>
  );
};
export default Index;