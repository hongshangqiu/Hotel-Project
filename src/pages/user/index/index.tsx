import { View, Swiper, SwiperItem, Image, Input, Button, Text } from '@tarojs/components';
import Taro from '@tarojs/taro';
import { useEffect, useMemo, useState } from 'react';
import { hotelService } from '../../../shared/services/hotelService';
import { IHotel } from '../../../shared/types';
import { LocalStorage, STORAGE_KEYS } from '../../../shared/utils/LocalStorage';
import { useHotelStore } from '../../../shared/store/useHotelStore';
import { useEnvironment } from '../../../shared/utils/useEnvironment';
import Calendar from '../../../components/Calendar/index';
import './index.scss';

const Index = () => {
  const { searchParams, setSearchParams, setCalendarVisible } = useHotelStore();
  const { isPC } = useEnvironment();
    const QQ_MAP_KEY = 'AWBBZ-HTZKV-NGKPK-5U2CL-EK6WH-P6FIT';
  const [bannerHotels, setBannerHotels] = useState<IHotel[]>([]);
  const [filterVisible, setFilterVisible] = useState(false);
  const [selectedStars, setSelectedStars] = useState<number[]>(searchParams.stars || []);
  const [selectedPriceRange, setSelectedPriceRange] = useState<[number, number] | undefined>(searchParams.priceRange);

  const TAG_OPTIONS = ['亲子', '豪华', '免费停车场', '近地铁', '商务', '江景', '健身房', '泳池'];
  const STAR_OPTIONS = [5, 4, 3, 2, 1];
  const PRICE_OPTIONS = [
    { label: '¥0–500', value: [0, 500] as [number, number] },
    { label: '¥500–800', value: [500, 800] as [number, number] },
    { label: '¥800+', value: [800, 9999] as [number, number] },
  ];

  useEffect(() => {
    hotelService.getHotelsByPage(1, 3).then((res) => {
      setBannerHotels(res.list || []);
    });
  }, []);

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

  const handleLocate = () => {
    Taro.getLocation({
      type: 'wgs84',
      success: async (res) => {
        try {
          const { latitude, longitude } = res;
          const baseUrl = `https://apis.map.qq.com/ws/geocoder/v1/?location=${latitude},${longitude}&key=${QQ_MAP_KEY}&get_poi=0`;
          const jsonp = (url: string) => new Promise<any>((resolve, reject) => {
            const callbackName = `__qqmap_cb_${Date.now()}_${Math.random().toString(16).slice(2)}`;
            const script = document.createElement('script');
            (window as any)[callbackName] = (data: any) => {
              resolve(data);
              delete (window as any)[callbackName];
              script.remove();
            };
            script.onerror = () => {
              reject(new Error('jsonp failed'));
              delete (window as any)[callbackName];
              script.remove();
            };
            script.src = `${url}&output=jsonp&callback=${callbackName}`;
            document.body.appendChild(script);
          });

          const resp = await jsonp(baseUrl);
          const city = resp?.result?.address_component?.city;
          if (city) {
            setSearchParams({ city });
            Taro.showToast({ title: '定位成功', icon: 'success' });
            return;
          }
          throw new Error('no city');
        } catch {
          Taro.showToast({ title: '定位失败，请稍后重试', icon: 'none' });
        }
      },
      fail: () => {
        Taro.showToast({ title: '定位失败，请检查权限', icon: 'none' });
      }
    });
  };

  const filterSummary = useMemo(() => {
    const starText = selectedStars.length > 0 ? `${Math.max(...selectedStars)}星等` : '不限星级';
    const priceText = selectedPriceRange ? `${selectedPriceRange[0]}-${selectedPriceRange[1]}元` : '不限价格';
    return `${starText} / ${priceText}`;
  }, [selectedStars, selectedPriceRange]);

  return (
    <View className={`home-page ${isPC ? 'pc-mode' : ''}`}>
      {/* 1. 顶部 Banner 轮播图 */}
      <Swiper className='banner' autoplay indicatorDots circular>
        {bannerHotels.length > 0 ? bannerHotels.map((hotel) => (
          <SwiperItem key={hotel.id}>
            <Image
              src={hotel.imageUrl}
              onClick={() => {
                LocalStorage.set(STORAGE_KEYS.USER_VIEW_HOTEL_ID, hotel.id);
                Taro.navigateTo({ url: '/pages/user/detail/index' });
              }}
            />
          </SwiperItem>
        )) : (
          <SwiperItem>
            <Image src='https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800' />
          </SwiperItem>
        )}
      </Swiper>

      {/* 2. 核心查询卡片 */}
      <View className='search-container'>
        {/* 目的地选择 */}
        <View className='item location-row'>
          <Text className='label'>目的地</Text>
          <Input 
            value={searchParams.city} 
            onInput={e => setSearchParams({ city: e.detail.value })} 
            placeholder='请输入城市'
          />
          <View className='locate-btn' onClick={handleLocate}>定位</View>
        </View>

        <View className='item'>
          <Text className='label'>关键词</Text>
          <Input
            value={searchParams.keyword || ''}
            onInput={e => setSearchParams({ keyword: e.detail.value })}
            placeholder='酒店名/地标/商圈'
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
        <View className='item filter-row' onClick={() => {
          setSelectedStars(searchParams.stars || []);
          setSelectedPriceRange(searchParams.priceRange);
          setFilterVisible(true);
        }}>
          <Text className='label'>星级/价格</Text>
          <Text className='filter-val'>{filterSummary}</Text>
        </View>

        {/* 快捷标签 */}
        <View className='tag-row'>
          {TAG_OPTIONS.map((tag) => {
            const active = (searchParams.tags || []).includes(tag);
            return (
              <Text
                key={tag}
                className={`tag ${active ? 'active' : ''}`}
                onClick={() => {
                  const current = searchParams.tags || [];
                  const next = active ? current.filter(t => t !== tag) : [...current, tag];
                  setSearchParams({ tags: next });
                }}
              >
                {tag}
              </Text>
            );
          })}
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

      {filterVisible && (
        <View className='filter-mask' onClick={() => setFilterVisible(false)}>
          <View className='filter-panel' onClick={e => e.stopPropagation()}>
            <View className='filter-title'>筛选条件</View>

            <View className='filter-section'>
              <Text className='section-title'>星级</Text>
              <View className='option-list'>
                {STAR_OPTIONS.map(star => (
                  <View
                    key={star}
                    className={`option ${selectedStars.includes(star) ? 'active' : ''}`}
                    onClick={() => {
                      setSelectedStars(prev =>
                        prev.includes(star)
                          ? prev.filter(s => s !== star)
                          : [...prev, star]
                      );
                    }}
                  >
                    {star}星
                  </View>
                ))}
              </View>
            </View>

            <View className='filter-section'>
              <Text className='section-title'>价格</Text>
              <View className='option-list'>
                {PRICE_OPTIONS.map(item => (
                  <View
                    key={item.label}
                    className={`option ${selectedPriceRange?.[0] === item.value[0] ? 'active' : ''}`}
                    onClick={() => setSelectedPriceRange(item.value)}
                  >
                    {item.label}
                  </View>
                ))}
              </View>
            </View>

            <View className='filter-actions'>
              <View className='btn reset' onClick={() => {
                setSelectedStars([]);
                setSelectedPriceRange(undefined);
              }}>
                重置
              </View>
              <View className='btn confirm' onClick={() => {
                setSearchParams({
                  stars: selectedStars,
                  priceRange: selectedPriceRange
                });
                setFilterVisible(false);
              }}>
                确定
              </View>
            </View>
          </View>
        </View>
      )}
    </View>
  );
};

export default Index;
