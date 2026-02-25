import { View, Text, Image, ScrollView, Swiper, SwiperItem } from '@tarojs/components';
import Taro from '@tarojs/taro';
import { useEffect, useMemo, useState } from 'react';
import { hotelService } from '../../../shared/services/hotelService';
import { IHotel } from '../../../shared/types/hotel';
import { LocalStorage, STORAGE_KEYS } from '../../../shared/utils/LocalStorage';
import { useHotelStore } from '../../../shared/store/useHotelStore';
import Calendar from '../../../components/Calendar/index';
import './index.scss';

type NavKey = 'room' | 'detail';

const HotelDetail = () => {
  const [hotel, setHotel] = useState<IHotel | null>(null);
  const [loading, setLoading] = useState<boolean>(false);

  const [activeNav, setActiveNav] = useState<NavKey>('detail');
  const [scrollIntoView, setScrollIntoView] = useState<string>('section-room');

  const hotelId = useMemo(() => {
    const inst = Taro.getCurrentInstance();
    return inst?.router?.params?.id || LocalStorage.get<string>(STORAGE_KEYS.USER_VIEW_HOTEL_ID) || '';
  }, []);

  const { searchParams, setCalendarVisible } = useHotelStore();

  const nightCount = useMemo(() => {
    const { startDate, endDate } = searchParams
    if (!startDate || !endDate) return 0
    const s = new Date(startDate).getTime()
    const e = new Date(endDate).getTime()
    return Math.max(0, Math.round((e - s) / (1000 * 60 * 60 * 24)))
  }, [searchParams.startDate, searchParams.endDate])


  const openMap = (address) => {
    const url = `https://apis.map.qq.com/uri/v1/search?keyword=${encodeURIComponent(address)}&referer=myapp`;
    Taro.navigateTo({ url: `/pages/user/webview/index?url=${encodeURIComponent(url)}` });
  }



  // - 当前 mock：imageUrl 为 string => 1 张图
  // - 未来扩展：若 imageUrl / imageUrls / images 为 string[] => 有几张播几张
  const bannerImages = useMemo((): string[] => {
    if (!hotel) return [];
    const anyHotel: any = hotel;

    if (Array.isArray(anyHotel?.images) && anyHotel.images.length > 0) {
      return anyHotel.images.filter(Boolean);
    }
    if (Array.isArray(anyHotel?.imageUrls) && anyHotel.imageUrls.length > 0) {
      return anyHotel.imageUrls.filter(Boolean);
    }
    if (Array.isArray(anyHotel?.imageUrl) && anyHotel.imageUrl.length > 0) {
      return anyHotel.imageUrl.filter(Boolean);
    }

    if (typeof hotel.imageUrl === 'string' && hotel.imageUrl) {
      return [hotel.imageUrl];
    }
    return [];
  }, [hotel]);

  const [activeRoomId, setActiveRoomId] = useState<string | null>(null);

  const handleViewRooms = () => {
    setActiveNav('room');
    setActiveRoomId(null);
  };

  const handleBack = () => {
    const pages = Taro.getCurrentPages();
    if (pages.length > 1) {
      Taro.navigateBack();
      return;
    }
    // 没有上一页时回到列表页
    Taro.navigateTo({ url: '/pages/user/list/index' });
  };

  const scrollTo = (key: NavKey) => {
    setActiveNav(key);
    setScrollIntoView(`section-${key}`);
  };


  const loadHotel = async (id: string) => {
    if (!id) {
      Taro.showToast({ title: '缺少酒店ID', icon: 'none' });
      return;
    }

    setLoading(true);
    try {
      const res: IHotel = await (hotelService as any).getHotelById(id);
      setHotel(res);
    } catch (e: any) {
      Taro.showToast({ title: e?.message || '酒店加载失败', icon: 'none' });
      setHotel(null);
    } finally {
      setLoading(false);
    }
  };


  useEffect(() => {
    loadHotel(hotelId);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hotelId]);

  const canAutoPlay = bannerImages.length > 1;

  return (
    <View className='hotel-detail-page'>
      {/* ===== Banner 区域 ===== */}
      <View className='banner-wrapper'>

        {/* 轮播图 */}
        {bannerImages.length > 0 ? (
          <Swiper
            className='banner-swiper'
            circular={canAutoPlay}
            autoplay={canAutoPlay}
            interval={3000}
            duration={500}
            indicatorDots={canAutoPlay}
          >
            {bannerImages.map((src, idx) => (
              <SwiperItem key={`${src}-${idx}`}>
                <Image
                  className='banner-image'
                  src={src}
                  mode='aspectFill'
                />
              </SwiperItem>
            ))}
          </Swiper>
        ) : (
          <View className='banner-empty'>
            <Text>暂无图片</Text>
          </View>
        )}

        {/* 顶部覆盖层 */}
        <View className='banner-topbar'>
          <Text className='topbar-title'>
            {hotel?.nameCn || '酒店详情'}
          </Text>

          <View className='topbar-right' />
        </View>

      </View>


      {/* ===== Tab 导航栏（独立出来） ===== */}
      <View className='tab-nav'>
        <View
          className={`tab-item ${activeNav === 'detail' ? 'active' : ''}`}
          onClick={() => scrollTo('detail')}
        >
          <Text>详情</Text>
        </View>

        <View
          className={`tab-item ${activeNav === 'room' ? 'active' : ''}`}
          onClick={() => scrollTo('room')}
        >
          <Text>房型</Text>
        </View>
      </View>

      <ScrollView className='content' scrollY scrollWithAnimation>

        {/* 基本信息（始终显示） */}
        <View className='hotel-info-section'>
          <View className='hotel-header'>
            <View className='hotel-title-row'>
              <Text className='hotel-name'>{hotel?.nameCn || '-'}</Text>
              <Text className='hotel-star'>{hotel ? `${hotel.star}星` : ''}</Text>
            </View>

            <Text className='hotel-enname'>{hotel?.nameEn || '-'}</Text>
            <View className='hotel-rating'>
              <Text className='rating-score '>{hotel?.rating || '-'}分</Text>
            </View>
            <View
              className='hotel-address'
              onClick={() => openMap(hotel?.address)}
            >
              <Text className='address-text'>
                {hotel?.address || '-'}
              </Text>

              <Image
                className='map-icon'
                src='https://api.iconify.design/mdi/map-marker.svg?color=%23ff6b00'
              />
            </View>
          </View>

        </View>

        <View className='date-select-bar'>
          {/* 入住 */}
          <View
            className='date-item'
            onClick={() => setCalendarVisible(true, 'start')}
          >
            <Text className='date-label'>入住</Text>
            <Text className='date-value'>{searchParams.startDate || '请选择'}</Text>
          </View>

          {/* 中间：几晚 */}
          <View className='date-divider'>
            <Text className='night-count'>
              {nightCount > 0 ? `${nightCount}晚` : '—'}
            </Text>
          </View>

          {/* 离店 */}
          <View
            className='date-item'
            onClick={() => setCalendarVisible(true, 'end')}
          >
            <Text className='date-label'>离店</Text>
            <Text className='date-value'>{searchParams.endDate || '请选择'}</Text>
          </View>
        </View>

        {/* ===== 详情 Tab ===== */}
        {activeNav === 'detail' && (
          <View className='detail-section'>
            <View className='section-title'>
              <Text>酒店详情</Text>
            </View>

            <View className='detail-box'>
              <View className='detail-line'>英文名：{hotel?.nameEn || '-'}</View>
              <View className='detail-line'>开业时间：{hotel?.openingTime || '-'}</View>
              <View className='detail-line'>地址：{hotel?.address || '-'}</View>
              <View className='detail-line'>星级：{hotel ? `${hotel.star}星` : '-'}</View>
              <View className='detail-line'>起价：¥{hotel?.price ?? '-'}</View>
            </View>
          </View>
        )}

        {/* ===== 房型 Tab ===== */}
        {activeNav === 'room' && (
          <View className='room-section'>
            <View className='section-title'>
              <Text>房型</Text>
            </View>

            {hotel?.rooms?.map(room => {
              const expanded = activeRoomId === room.id;

              return (
                <View key={room.id} className='room-card'>
                  {/* 基本信息 */}
                  <View className='room-main'>
                    <Image className='room-img' src={room.imageUrl} />

                    <View className='room-basic'>
                      <Text className='room-name'>{room.name}</Text>
                      <Text className='room-meta'>
                        {room.size} · 可住 {room.capacity} 人 · {room.bedType}
                      </Text>
                      <Text className='room-price'>¥{room.price}</Text>

                      {/* 展开按钮*/}
                      <Text
                        className='room-expand'
                        onClick={() =>
                          setActiveRoomId(expanded ? null : room.id)
                        }
                      >
                        {expanded ? '收起' : '展开'}
                      </Text>
                    </View>
                  </View>

                  {/* 展开详情（带动画） */}
                  <View className={`room-detail ${expanded ? 'open' : ''}`}>
                    <View className='room-detail-inner'>
                      <Text className='room-policy'>{room.policy}</Text>

                      <View
                        className='room-book-btn'
                        onClick={() =>
                          Taro.navigateTo({ url: `/pages/user/booking/index?id=${hotelId}&roomId=${room.id}` })
                        }
                      >
                        <Text className='room-book-text'>预定</Text>
                      </View>
                    </View>
                  </View>
                </View>
              );
            })}
          </View>
        )}

      </ScrollView>

      {/* 底部预定栏 */}
      <View className='footer-bar'>
        <View className='footer-left'>
          <Text className='price-unit'>
            ¥{hotel?.price ?? '-'} 起
          </Text>
        </View>

        <View className='footer-book-btn' onClick={handleViewRooms}>
          <Text className='action-btn-text'>查看可订房型</Text>
        </View>
      </View>

      <View className='back-btn' onClick={handleBack}>返回</View>

      {/* 日历弹窗组件 */}
      <Calendar />
    </View>
  );
};

export default HotelDetail;