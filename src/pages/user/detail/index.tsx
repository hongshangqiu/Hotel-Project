import { useEffect, useState } from 'react';
import Taro, { useRouter } from '@tarojs/taro';
import { View, Text, Image, Swiper, SwiperItem, ScrollView } from '@tarojs/components';
import { NavBar, Button, Calendar, Popup } from '@nutui/nutui-react-taro';
import { hotelService } from '../../../shared/services/hotelService';
import { IHotel, HotelStatus } from '../../../shared/types/hotel';
import './index.scss';

// 房型接口
interface RoomType {
  id: string;
  name: string;
  price: number;
  originalPrice: number;
  description: string;
  images: string[];
  facilities: string[];
  stock: number;
}

// 模拟房型数据
const MOCK_ROOM_TYPES: RoomType[] = [
  {
    id: '1',
    name: '豪华大床房',
    price: 588,
    originalPrice: 888,
    description: '1张1.8米大床 | 35㎡ | 城市景观',
    images: ['https://picsum.photos/400/300?random=101'],
    facilities: ['wifi', '空调', '24h热水', '电视', '冰箱'],
    stock: 5
  },
  {
    id: '2',
    name: '精致双床房',
    price: 668,
    originalPrice: 998,
    description: '2张1.2米床 | 40㎡ | 城景/园景',
    images: ['https://picsum.photos/400/300?random=102'],
    facilities: ['wifi', '空调', '24h热水', '电视', '冰箱', '办公桌'],
    stock: 8
  },
  {
    id: '3',
    name: '行政套房',
    price: 1288,
    originalPrice: 1888,
    description: '1张2米大床 | 65㎡ | 行政酒廊',
    images: ['https://picsum.photos/400/300?random=103'],
    facilities: ['wifi', '空调', '24h热水', '电视', '冰箱', '办公桌', '浴缸', '欢迎水果'],
    stock: 3
  },
  {
    id: '4',
    name: '家庭套房',
    price: 1688,
    originalPrice: 2288,
    description: '2室1厅 | 90㎡ | 可住4人',
    images: ['https://picsum.photos/400/300?random=104'],
    facilities: ['wifi', '空调', '24h热水', '电视', '冰箱', '厨房', '洗衣机'],
    stock: 2
  }
];

const HotelDetail = () => {
  const router = useRouter();
  const hotelId = router.params.id;
  const [hotel, setHotel] = useState<IHotel | null>(null);
  const [loading, setLoading] = useState(true);
  const [currentSwiper, setCurrentSwiper] = useState(0);
  const [selectedRoom, setSelectedRoom] = useState<RoomType | null>(null);
  const [showCalendar, setShowCalendar] = useState(false);
  const [dateRange, setDateRange] = useState<{ start: string; end: string }>({
    start: '',
    end: ''
  });

  useEffect(() => {
    loadHotelDetail();
  }, [hotelId]);

  const loadHotelDetail = async () => {
    setLoading(true);
    try {
      if (hotelId) {
        const data = await hotelService.getHotelById(hotelId);
        setHotel(data);
      }
    } catch (err) {
      Taro.showToast({ title: '加载失败', icon: 'none' });
    } finally {
      setLoading(false);
    }
  };

  // 处理轮播变化
  const onSwiperChange = (e: any) => {
    setCurrentSwiper(e.detail.current);
  };

  // 处理日期选择
  const onCalendarConfirm = (startDate: string, endDate: string) => {
    setDateRange({ start: startDate, end: endDate });
    setShowCalendar(false);
  };

  // 预订房间
  const handleBook = (room: RoomType) => {
    if (!dateRange.start || !dateRange.end) {
      Taro.showToast({ title: '请选择入住日期', icon: 'none' });
      setShowCalendar(true);
      return;
    }
    setSelectedRoom(room);
    // TODO: 跳转预订页面或显示预订确认弹窗
    Taro.showModal({
      title: '确认预订',
      content: `确认预订 ${room.name}？\n入住：${dateRange.start}\n退房：${dateRange.end}\n总价：¥${room.price}`,
      success: (res) => {
        if (res.confirm) {
          Taro.showToast({ title: '预订成功', icon: 'success' });
        }
      }
    });
  };

  // 计算住宿晚数
  const getNightCount = () => {
    if (!dateRange.start || !dateRange.end) return 0;
    const start = new Date(dateRange.start);
    const end = new Date(dateRange.end);
    const diff = end.getTime() - start.getTime();
    return Math.ceil(diff / (1000 * 60 * 60 * 24));
  };

  // 获取星级文字
  const getStarText = (star: number) => {
    const starMap: Record<number, string> = {
      3: '三星级',
      4: '四星级',
      5: '五星级'
    };
    return starMap[star] || `${star}星级`;
  };

  if (loading) {
    return (
      <View className='detail-loading'>
        <Text>加载中...</Text>
      </View>
    );
  }

  if (!hotel) {
    return (
      <View className='detail-error'>
        <Text>酒店不存在</Text>
        <Button onClick={() => Taro.navigateBack()}>返回</Button>
      </View>
    );
  }

  return (
    <View className='hotel-detail-page'>
      {/* 1. 顶部 Banner 轮播 */}
      <View className='banner-wrapper'>
        <Swiper
          className='banner-swiper'
          autoplay
          interval={3000}
          circular
          onChange={onSwiperChange}
        >
          {hotel.images && hotel.images.length > 0 ? (
            hotel.images.map((img, index) => (
              <SwiperItem key={index}>
                <Image className='banner-image' src={img} mode='aspectFill' />
              </SwiperItem>
            ))
          ) : (
            <SwiperItem>
              <Image className='banner-image' src={hotel.imageUrl} mode='aspectFill' />
            </SwiperItem>
          )}
        </Swiper>
        
        {/* 轮播指示器 */}
        <View className='swiper-indicator'>
          {(hotel.images || [hotel.imageUrl]).map((_, index) => (
            <View 
              key={index} 
              className={`indicator-dot ${currentSwiper === index ? 'active' : ''}`}
            />
          ))}
        </View>

        {/* 2. 返回导航栏 */}
        <View className='nav-bar-wrapper'>
          <View 
            className='nav-back-btn'
            onClick={() => Taro.navigateBack()}
          >
            <Text className='back-icon'>‹</Text>
          </View>
          <View className='nav-actions'>
            <View 
              className='nav-action-btn'
              onClick={() => Taro.showToast({ title: '分享功能开发中', icon: 'none' })}
            >
              <Text className='action-icon'>⋯</Text>
            </View>
            <View 
              className='nav-action-btn'
              onClick={() => Taro.showToast({ title: '收藏成功', icon: 'success' })}
            >
              <Text className='action-icon'>♡</Text>
            </View>
          </View>
        </View>
      </View>

      {/* 3. 酒店基本信息 */}
      <View className='hotel-info-section'>
        <View className='hotel-header'>
          <View className='hotel-title-row'>
            <Text className='hotel-name'>{hotel.nameCn}</Text>
            <View className='hotel-star'>
              <Text className='star-text'>{getStarText(hotel.star)}</Text>
            </View>
          </View>
          <Text className='hotel-enname'>{hotel.nameEn}</Text>
          <View className='hotel-rating'>
            <Text className='rating-score'>{hotel.rating || 4.8}</Text>
            <Text className='rating-text'>超赞</Text>
            <Text className='rating-count'>| 已订 568 间夜</Text>
          </View>
        </View>

        <View className='hotel-address'>
          <Text className='address-icon'>📍</Text>
          <Text className='address-text'>{hotel.address}</Text>
          <Text className='address-nav'>导航 ›</Text>
        </View>

        <View className='hotel-opening'>
          <Text className='opening-icon'>🏨</Text>
          <Text className='opening-text'>开业时间：{hotel.openingTime}</Text>
        </View>
      </View>

      {/* 4. 日期选择条 */}
      <View className='date-select-bar' onClick={() => setShowCalendar(true)}>
        <View className='date-item'>
          <Text className='date-label'>入住</Text>
          <Text className='date-value'>{dateRange.start || '选择日期'}</Text>
        </View>
        <View className='date-divider'>
          <Text className='night-count'>{getNightCount()}晚</Text>
        </View>
        <View className='date-item'>
          <Text className='date-label'>退房</Text>
          <Text className='date-value'>{dateRange.end || '选择日期'}</Text>
        </View>
        <View className='date-select-btn'>
          <Text>修改日期</Text>
        </View>
      </View>

      {/* 5. 房型列表 */}
      <View className='room-section'>
        <View className='section-header'>
          <Text className='section-title'>选择房型</Text>
          <Text className='section-sub'>共 {MOCK_ROOM_TYPES.length} 种房型</Text>
        </View>

        <View className='room-list'>
          {MOCK_ROOM_TYPES.map((room) => (
            <View key={room.id} className='room-card'>
              <Image className='room-image' src={room.images[0]} mode='aspectFill' />
              <View className='room-info'>
                <View className='room-header'>
                  <Text className='room-name'>{room.name}</Text>
                  {room.stock < 5 && (
                    <Text className='room-scarce'>仅剩{room.stock}</Text>
                  )}
                </View>
                <Text className='room-desc'>{room.description}</Text>
                <View className='room-facilities'>
                  {room.facilities.slice(0, 4).map((facility, idx) => (
                    <Text key={idx} className='facility-tag'>{facility}</Text>
                  ))}
                  {room.facilities.length > 4 && (
                    <Text className='facility-more'>+{room.facilities.length - 4}</Text>
                  )}
                </View>
                <View className='room-price-row'>
                  <View className='price-info'>
                    <Text className='price-symbol'>¥</Text>
                    <Text className='price-value'>{room.price}</Text>
                    <Text className='price-unit'>/晚</Text>
                    <Text className='original-price'>¥{room.originalPrice}</Text>
                  </View>
                  <Button 
                    className='book-btn'
                    onClick={() => handleBook(room)}
                  >
                    预订
                  </Button>
                </View>
              </View>
            </View>
          ))}
        </View>
      </View>

      {/* 6. 酒店详情 */}
      <View className='detail-section'>
        <View className='section-header'>
          <Text className='section-title'>酒店详情</Text>
        </View>
        <View className='detail-content'>
          <View className='detail-item'>
            <Text className='detail-label'>设施服务</Text>
            <View className='facility-list'>
              <View className='facility-item'>
                <Text className='facility-icon'>📶</Text>
                <Text className='facility-text'>免费WiFi</Text>
              </View>
              <View className='facility-item'>
                <Text className='facility-icon'>🅿️</Text>
                <Text className='facility-text'>免费停车</Text>
              </View>
              <View className='facility-item'>
                <Text className='facility-icon'>🏊</Text>
                <Text className='facility-text'>游泳池</Text>
              </View>
              <View className='facility-item'>
                <Text className='facility-icon'>🍽️</Text>
                <Text className='facility-text'>餐厅</Text>
              </View>
            </View>
          </View>
          
          {hotel.description && (
            <View className='detail-item'>
              <Text className='detail-label'>酒店介绍</Text>
              <Text className='detail-desc'>{hotel.description}</Text>
            </View>
          )}
        </View>
      </View>

      {/* 7. 底部预订栏 */}
      <View className='footer-bar'>
        <View className='footer-left'>
          <View className='footer-item' onClick={() => Taro.switchTab({ url: '/pages/user/list/index' })}>
            <Text className='footer-icon'>🏠</Text>
            <Text className='footer-text'>首页</Text>
          </View>
          <View className='footer-item' onClick={() => Taro.showToast({ title: '客服功能开发中', icon: 'none' })}>
            <Text className='footer-icon'>💬</Text>
            <Text className='footer-text'>客服</Text>
          </View>
        </View>
        <View className='footer-right'>
          <View className='price-summary'>
            {selectedRoom ? (
              <>
                <Text className='summary-symbol'>¥</Text>
                <Text className='summary-value'>{selectedRoom.price * Math.max(1, getNightCount())}</Text>
                <Text className='summary-unit'>起</Text>
              </>
            ) : (
              <Text className='summary-text'>请选择房型</Text>
            )}
          </View>
          <Button 
            className='footer-book-btn'
            onClick={() => {
              if (selectedRoom) {
                handleBook(selectedRoom);
              } else {
                Taro.showToast({ title: '请选择房型', icon: 'none' });
              }
            }}
          >
            立即预订
          </Button>
        </View>
      </View>

      {/* 日期选择弹窗 */}
      <Popup
        visible={showCalendar}
        position='bottom'
        onClose={() => setShowCalendar(false)}
      >
        <View className='calendar-popup'>
          <View className='calendar-header'>
            <Text className='calendar-cancel' onClick={() => setShowCalendar(false)}>取消</Text>
            <Text className='calendar-title'>选择入住日期</Text>
            <Text 
              className='calendar-confirm' 
              onClick={() => onCalendarConfirm(
                dateRange.start || new Date().toISOString().split('T')[0],
                dateRange.end || new Date(Date.now() + 86400000).toISOString().split('T')[0]
              )}
            >
              确定
            </Text>
          </View>
          <Calendar
            type='range'
            defaultValue={dateRange.start ? [dateRange.start, dateRange.end] : undefined}
            onChange={(dates: any) => {
              if (Array.isArray(dates) && dates.length >= 2) {
                setDateRange({ start: dates[0], end: dates[1] });
              }
            }}
          />
        </View>
      </Popup>
    </View>
  );
};

export default HotelDetail;
