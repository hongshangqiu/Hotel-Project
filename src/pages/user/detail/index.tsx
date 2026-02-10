import { View, Text, Image, ScrollView, Swiper, SwiperItem } from '@tarojs/components';
import Taro from '@tarojs/taro';
import { useEffect, useMemo, useState } from 'react';
import { hotelService } from '../../../shared/services/hotelService';
import { IHotel } from '../../../shared/types/hotel';
import './index.scss';

type NavKey = 'room' | 'detail';

const HotelDetail = () => {
  const [hotel, setHotel] = useState<IHotel | null>(null);
  const [loading, setLoading] = useState<boolean>(false);

  const [activeNav, setActiveNav] = useState<NavKey>('detail');
  const [scrollIntoView, setScrollIntoView] = useState<string>('section-room');

  const hotelId = useMemo(() => {
    const inst = Taro.getCurrentInstance();
    return inst?.router?.params?.id || '';
  }, []);

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

  const confirmBooking = async () => {
    if (!hotel) return;

    const content =
      `酒店：${hotel.nameCn}\n` +
      `起价：¥${hotel.price}\n` +
      `房型：${hotel.roomType}\n\n` +
      '确认预定吗？';

    const res = await Taro.showModal({
      title: '确认预定',
      content,
      confirmText: '确认',
      cancelText: '取消',
    });

    if (res.confirm) {
      Taro.showToast({ title: '预定成功（模拟）', icon: 'success' });
    }
  };

  useEffect(() => {
    loadHotel(hotelId);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hotelId]);

  const canAutoPlay = bannerImages.length > 1;

  return (
    <View className='detail-page'>
      {/* banner + 顶部返回导航 */}
      <View className='banner-wrap'>
        {bannerImages.length > 0 ? (
          <Swiper
            className='banner'
            circular={canAutoPlay}
            autoplay={canAutoPlay}
            interval={3000}
            duration={500}
            indicatorDots={canAutoPlay}
          >
            {bannerImages.map((src, idx) => (
              <SwiperItem key={`${src}-${idx}`}>
                <Image className='banner-img' src={src} mode='aspectFill' />
              </SwiperItem>
            ))}
          </Swiper>
        ) : (
          <View className='banner-empty'>
            <Text>暂无图片</Text>
          </View>
        )}

        <View className='topbar'>
          <View className='back-btn' onClick={handleBack}>
            <Text className='back-text'>返回</Text>
          </View>
          <Text className='topbar-title'>{hotel?.nameCn || '酒店详情'}</Text>
          <View className='topbar-right' />
        </View>
      </View>

      {/* banner 下方导航栏：房型 / 详情 */}
      <View className='nav-bar'>
        <View
          className={`nav-item ${activeNav === 'detail' ? 'active' : ''}`}
          onClick={() => scrollTo('detail')}
        >
          <Text>详情</Text>
        </View>

        <View
          className={`nav-item ${activeNav === 'room' ? 'active' : ''}`}
          onClick={() => scrollTo('room')}
        >
          <Text>房型</Text>
        </View>
      </View>

      <ScrollView className='content' scrollY scrollIntoView={scrollIntoView} scrollWithAnimation>
        {/* 基本信息 */}
        <View className='base-info'>
          <View className='name-row'>
            <Text className='name'>{hotel?.nameCn || '-'}</Text>
            <Text className='star'>{hotel ? `${hotel.star}星` : ''}</Text>
          </View>

          <Text className='address'>{hotel?.address || '-'}</Text>

          <View className='price-row'>
            <Text className='price-symbol'>¥</Text>
            <Text className='price-val'>{hotel?.price ?? '-'}</Text>
            <Text className='price-unit'>起</Text>
          </View>
        </View>



        {/* 详情 */}
        <View id='section-detail' className='section'>
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

        {/* 房型 */}
        <View id='section-room' className='section'>
          <View className='section-title'>
            <Text>房型</Text>
          </View>
          <View className='detail-box'>
            <Text className='detail-line'>{hotel?.roomType || '-'}</Text>
          </View>
        </View>

        <View className='bottom-space' />
      </ScrollView>

      {/* 底部预定栏 */}
      <View className='booking-bar'>
        <View className='booking-left'>
          <Text className='booking-hint'>起价：¥{hotel?.price ?? '-'}</Text>
        </View>

        <View
          className='booking-btn'
          onClick={confirmBooking}
        >
          <Text className='booking-btn-text'>{loading ? '加载中' : '立即预定'}</Text>
        </View>
      </View>
    </View>
  );
};

export default HotelDetail;
