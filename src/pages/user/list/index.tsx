import { View, Text, Image, Input, Picker } from '@tarojs/components';
import Taro, { useReachBottom } from '@tarojs/taro';
import { useState, useEffect } from 'react';
import { hotelService } from '../../../shared/services/hotelService';
import { IHotel } from '../../../shared/types/hotel';
import { LocalStorage, STORAGE_KEYS } from '../../../shared/utils/LocalStorage';
import { PROVINCES, CITIES_BY_PROVINCE } from '../../../shared/constants/regions';
import { useHotelStore } from '../../../shared/store/useHotelStore';
import Calendar from '../../../components/Calendar/index';
import './index.scss';

const HotelList = () => {
  const [list, setList] = useState<IHotel[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  
  // 排序状态
  const [showSort, setShowSort] = useState(false)
  const [sortType, setSortType] = useState<'priceAsc' | 'priceDesc' | 'star'>('priceAsc')
  const SORT_OPTIONS = [
    { label: '价格升序', value: 'priceAsc' },
    { label: '价格降序', value: 'priceDesc' },
    { label: '星级降序', value: 'star' }
  ]
  // 筛选状态
  const [showFilter, setShowFilter] = useState(false)
  const [selectedStars, setSelectedStars] = useState<number[]>([])
  const [priceRange, setPriceRange] = useState<[number, number]>()
  const STAR_OPTIONS = [5, 4, 3, 2, 1]
  const PRICE_OPTIONS = [
    { label: '¥0–500', value: [0, 500] },
    { label: '¥500–800', value: [500, 800] },
    { label: '¥800+', value: [800, 9999] }
  ]

  const [province, setProvince] = useState('上海市')
  const [city, setCity] = useState('上海市')

  // Picker multiSelector 需要的 range/value
  const [cityRange, setCityRange] = useState<string[][]>([
    PROVINCES,
    CITIES_BY_PROVINCE['上海市'] || ['上海市'],
  ])

  const [cityIndex, setCityIndex] = useState<[number, number]>([
    PROVINCES.indexOf('上海市') >= 0 ? PROVINCES.indexOf('上海市') : 0,
    0,
  ])
  const { searchParams, setCalendarVisible } = useHotelStore()

  // 搜索栏（先不做功能）
  const [keyword, setKeyword] = useState('')

  const onCityColumnChange = (e) => {
    const { column, value } = e.detail

    // 改省：更新城市列表，并重置市索引为0
    if (column === 0) {
      const nextProvince = PROVINCES[value]
      const nextCities = CITIES_BY_PROVINCE[nextProvince] || [nextProvince]

      setCityRange([PROVINCES, nextCities])
      setCityIndex([value, 0])

      // 同步展示文本（你也可以等 onChange 再设）
      setProvince(nextProvince)
      setCity(nextCities[0])
    }

    // 改市：只更新索引
    if (column === 1) {
      setCityIndex(prev => [prev[0], value])
    }
  }

  const onCityChange = (e) => {
    const [pIdx, cIdx] = e.detail.value as [number, number]
    const nextProvince = PROVINCES[pIdx]
    const nextCities = CITIES_BY_PROVINCE[nextProvince] || [nextProvince]
    const nextCity = nextCities[cIdx] || nextCities[0]

    setProvince(nextProvince)
    setCity(nextCity)
    setCityIndex([pIdx, cIdx])
  }

  const calcNights = () => {
    const { startDate, endDate } = searchParams
    if (!startDate || !endDate) return 0
    const s = new Date(startDate).getTime()
    const e = new Date(endDate).getTime()
    return Math.max(0, Math.round((e - s) / (1000 * 60 * 60 * 24)))
  }

  const nights = calcNights()

  // 加载数据的方法
  const loadData = async (currentPage: number) => {
    if (loading || !hasMore) return;
    setLoading(true);

    try {
      const res = await hotelService.getHotelsByPage(
        currentPage,
        5,
        sortType,
        selectedStars,
        priceRange,
        searchParams.keyword,
        searchParams.tags
      )
      const newList = res?.list ?? []
      const totalCount = res?.total ?? 0

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

  // 初始化加载
  useEffect(() => {
    loadData(1)
  }, [])

  useEffect(() => {
    setSelectedStars(searchParams.stars || [])
    setPriceRange(searchParams.priceRange)
  }, [searchParams.stars, searchParams.priceRange])


  // 条件变化 → 重置分页
  useEffect(() => {
    setPage(1)
    setHasMore(true)
    setList([])
  }, [sortType, selectedStars, priceRange, searchParams.keyword, searchParams.tags])


  // 页码变化 → 请求
  useEffect(() => {
    loadData(page)
  }, [page])

  // 核心：监听触底事件（上滑自动加载）
  useReachBottom(() => {
    loadData(page);
  });

  return (
    <View className='list-page'>
      {/* 顶部搜索区 */}
      <View className='search-bar'>

        {/* 搜索栏：先只做UI不做功能 */}
        <View className='keyword-row'>
          <View className='keyword-input'>
            <Input
              className='input'
              value={keyword}
              placeholder='搜索酒店名/地址/关键词'
              onInput={(e) => setKeyword(e.detail.value)}
            />
          </View>

          <View className='keyword-btn'>搜索</View>
        </View>

      </View>
      <View className='header'>
        <Text className='title'>共发现 {total} 家酒店</Text>
      </View>

      {/* 日期区域 */}
      <View className='date-row'>
        <View className='date-item' onClick={() => setCalendarVisible(true, 'start')}>
          <Text className='date-label'>入住</Text>
          <Text className='date-val'>{searchParams.startDate || '请选择'}</Text>
        </View>

        <View className='date-item' onClick={() => setCalendarVisible(true, 'end')}>
          <Text className='date-label'>离店</Text>
          <Text className='date-val'>{searchParams.endDate || '请选择'}</Text>
        </View>

        {!!nights && (
          <View className='nights-badge'>
            <Text>{nights}晚</Text>
          </View>
        )}
      </View>

      {/* 排序筛选栏 */}
      <View className='toolbar'>

        {/* 按钮 */}
        <View
          className='toolbar-item'
          onClick={() => setShowSort(!showSort)}
        >
          排序方式
          <Text className='arrow'>▼</Text>
        </View>

        {/* 下拉面板 */}
        {showSort && (
          <View className='sort-panel'>

            {SORT_OPTIONS.map(item => (
              <View
                key={item.value}
                className={`sort-item ${sortType === item.value ? 'active' : ''}`}
                onClick={() => {
                  setSortType(item.value as any)
                  setShowSort(false)
                }}
              >
                {item.label}
              </View>
            ))}

          </View>
        )}
        {/* 城市选择（省/市） */}
        <Picker
          mode='multiSelector'
          range={cityRange}
          value={cityIndex}
          onColumnChange={onCityColumnChange}
          onChange={onCityChange}
        >
          <View className='toolbar-item'>
            <Text className='city-text'>{city}</Text>
            <Text className='arrow'>▼</Text>
          </View>
        </Picker>
        <View
          className='toolbar-item'
          onClick={() => setShowFilter(true)}
        >
          筛选
          <Text className='arrow'>▼</Text>
        </View>
        {showFilter && (
          <View className='filter-mask' onClick={() => setShowFilter(false)}>

            <View className='filter-panel' onClick={e => e.stopPropagation()}>

              <View className='filter-title'>筛选条件</View>

              {/* 星级 */}
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
                        )
                      }}
                    >
                      {star}星
                    </View>
                  ))}
                </View>
              </View>

              {/* 价格 */}
              <View className='filter-section'>
                <Text className='section-title'>价格</Text>

                <View className='option-list'>
                  {PRICE_OPTIONS.map(item => (
                    <View
                      key={item.label}
                      className={`option ${priceRange?.[0] === item.value[0] ? 'active' : ''
                        }`}
                      onClick={() => setPriceRange(item.value as any)}
                    >
                      {item.label}
                    </View>
                  ))}
                </View>
              </View>

              {/* 按钮 */}
              <View className='filter-actions'>
                <View className='btn reset'
                  onClick={() => {
                    setSelectedStars([])
                    setPriceRange(undefined)
                  }}
                >
                  重置
                </View>

                <View className='btn confirm'
                  onClick={() => {
                    setShowFilter(false)

                  }}
                >
                  确定
                </View>
              </View>

            </View>
          </View>
        )}

      </View>


      <View className='hotel-list'>
        {/* 空状态 */}
        {!loading && list.length === 0 && (
          <View className='empty'>
            <Image
              className='empty-img'
              src='https://cdn-icons-png.flaticon.com/512/6134/6134065.png'
            />
            <Text className='empty-text'>没有符合条件的酒店</Text>
          </View>
        )}
        {list.map((hotel, index) => (
          <View key={`${hotel.id}-${index}`} className='hotel-card'
            onClick={() => {
              LocalStorage.set(STORAGE_KEYS.USER_VIEW_HOTEL_ID, hotel.id)
              Taro.navigateTo({ url: '/pages/user/detail/index' })
            }}
          >
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

      {/* 悬浮返回按钮 */}
      <View
        className="floating-back"
        onClick={() => {
          if (Taro.getCurrentPages().length > 1) {
            Taro.navigateBack()
          } else {
            Taro.switchTab({ url: '/pages/user/index/index' })
          }
        }}
      >
        返回
      </View>

      {/* 日历弹窗组件 */}
      <Calendar />
    </View>

  );
};

export default HotelList;