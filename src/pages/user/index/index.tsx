import { View, Swiper, SwiperItem, Image, Input, Button, Text } from '@tarojs/components';
import Taro from '@tarojs/taro';
import { useHotelStore } from '../../../shared/store/useHotelStore';
import { useEnvironment } from '../../../shared/utils/useEnvironment'; // 引入环境检测Hook
import Calendar from '../../../components/Calendar/index';
import './index.scss';

const Index = () => {
  const { searchParams, setSearchParams, setCalendarVisible } = useHotelStore();
  const { isPC } = useEnvironment(); // 获取当前是否为 PC 端

  /**
   * 校验逻辑：
   * 1. 两个日期必须都存在
   * 2. 离店日期必须大于或等于入住日期
   */
  const isDateValid = () => {
    if (!searchParams.startDate || !searchParams.endDate) return false;
    const start = new Date(searchParams.startDate).getTime();
    const end = new Date(searchParams.endDate).getTime();
    return end >= start;
  };

  /**
   * 查询跳转逻辑
   */
  const handleSearch = () => {
    if (!isDateValid()) {
      Taro.showToast({
        title: '日期范围无效，请修正后查询',
        icon: 'none',
        duration: 2000
      });
      return;
    }
    // 校验通过，跳转到列表页
    Taro.navigateTo({
      url: '/pages/user/list/index'
    });
  };

  return (
    <View className={`home-page ${isPC ? 'pc-mode' : ''}`}>
      {/* 1. 顶部 Banner 轮播图 */}
      <Swiper className='banner' autoplay indicatorDots circular>
        <SwiperItem>
          <Image src='https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800' />
        </SwiperItem>
        <SwiperItem>
          <Image src='https://images.unsplash.com/photo-1551882547-ff43c63efeaf?w=800' />
        </SwiperItem>
      </Swiper>

      {/* 2. 核心查询卡片 */}
      <View className='search-container'>
        {/* 目的地选择 */}
        <View className='item'>
          <Text className='label'>目的地</Text>
          <Input 
            value={searchParams.city} 
            onInput={e => setSearchParams({ city: e.detail.value })} 
            placeholder='请输入城市'
          />
        </View>

        {/* 入住日期行 */}
        <View className='item' onClick={() => setCalendarVisible(true, 'start')}>
          <Text className='label'>入住日期</Text>
          <Text className='date-val'>{searchParams.startDate || '请选择'}</Text>
        </View>

        {/* 离店日期行 */}
        <View className='item' onClick={() => setCalendarVisible(true, 'end')}>
          <Text className='label'>离店日期</Text>
          <Text className='date-val'>{searchParams.endDate || '请选择'}</Text>
        </View>

        {/* 筛选条件 (星级/价格) */}
        <View className='item'>
          <Text className='label'>星级/价格</Text>
          <Input placeholder='不限星级 / 不限价格' />
        </View>

        {/* 快捷标签 */}
        <View className='tag-row'>
          <Text className='tag'>亲子酒店</Text>
          <Text className='tag'>豪华酒店</Text>
          <Text className='tag'>免费停车场</Text>
        </View>

        {/* 查询按钮：根据校验状态应用 disabled 样式 */}
        <Button 
          className={`search-btn ${!isDateValid() ? 'btn-disabled' : ''}`} 
          onClick={handleSearch}
        >
          查询酒店
        </Button>
      </View>

      {/* 3. 日历弹窗组件 */}
      <Calendar />
    </View>
  );
};

export default Index;