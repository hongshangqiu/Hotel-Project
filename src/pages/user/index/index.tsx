import { View, Swiper, SwiperItem, Image, Input, Button, Text } from '@tarojs/components';
import { useHotelStore } from '../../../shared/store/useHotelStore';
import Calendar from '../../../components/Calendar/index';
import './index.scss';

const Index = () => {
  const { searchParams, setSearchParams, setCalendarVisible } = useHotelStore();

  return (
    <View className='home-page'>
      {/* 1. 顶部 Banner 轮播图 */}
      <Swiper className='banner' autoplay indicatorDots circular>
        <SwiperItem>
          <Image src='https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800' />
        </SwiperItem>
        <SwiperItem>
          <Image src='https://images.unsplash.com/photo-1551882547-ff43c63efeaf?w=800' />
        </SwiperItem>
      </Swiper>

      {/* 2. 核心查询卡片 (白色容器) */}
      <View className='search-container'>
        {/* 目的地选择 */}
        <View className='item'>
          <Text className='label'>目的地：</Text>
          <Input 
            value={searchParams.city} 
            onInput={e => setSearchParams({ city: e.detail.value })} 
            placeholder='请输入城市'
          />
        </View>

        {/* 日期选择 (点击弹出日历) */}
        <View className='item' onClick={() => setCalendarVisible(true)}>
          <Text className='label'>日期：</Text>
          <Text className='date-text'>{searchParams.startDate} 至 {searchParams.endDate}</Text>
        </View>

        {/* 筛选条件 - 根据 PDF 要求放入容器内 */}
        <View className='item'>
          <Text className='label'>星级/价格：</Text>
          <Input placeholder='不限星级 / 不限价格' />
        </View>

        {/* 快捷标签 - 根据 PDF 要求放入容器内 */}
        <View className='tag-row'>
          <Text className='tag'>亲子酒店</Text>
          <Text className='tag'>豪华酒店</Text>
          <Text className='tag'>免费停车场</Text>
        </View>

        {/* 查询按钮 - 放在容器最底部 */}
        <Button className='search-btn'>查询酒店</Button>
      </View>

      {/* 3. 日历弹窗组件 */}
      <Calendar />
    </View>
  );
};

export default Index;