import { View, Text, Image, ScrollView } from '@tarojs/components';
import Taro, { useReachBottom } from '@tarojs/taro';
import { useState, useEffect } from 'react';
import { hotelService } from '../../../shared/services/hotelService';
import { IHotel } from '../../../shared/types/hotel';
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

  // 加载数据的方法
  const loadData = async (currentPage: number) => {
    if (loading || !hasMore) return;
    setLoading(true);

    try {
      const res = await hotelService.getHotelsByPage(currentPage, 5, sortType, selectedStars, priceRange)
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


  // 条件变化 → 重置分页
  useEffect(() => {
    setPage(1)
    setHasMore(true)
    setList([])
  }, [sortType, selectedStars, priceRange])


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
      <View className='header'>
        <Text className='title'>共发现 {total} 家酒店</Text>
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
        {list.map((hotel) => (
          <View key={hotel.id} className='hotel-card'
            onClick={() => {
              window.location.hash = `/pages/user/detail/index?id=${hotel.id}`
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
    </View>

  );
};

export default HotelList;