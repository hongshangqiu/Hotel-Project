import React, { useState } from 'react'
import { View, Text, Input, ScrollView } from '@tarojs/components'
import Taro from '@tarojs/taro'
import './index.scss'

export default function HotelList() {
  const [city, setCity] = useState('北京市')
  const [keyword, setKeyword] = useState('')
  const [priceRange, setPriceRange] = useState('')
  const [starLevel, setStarLevel] = useState('')
  const [hotelList, setHotelList] = useState([
    { id: 1, name: '北京希尔顿酒店', rating: 4.8, address: '朝阳区建国路', price: 888, stars: 5 },
    { id: 2, name: '北京四季酒店', rating: 4.9, address: '朝阳区亮马桥', price: 1288, stars: 5 },
    { id: 3, name: '北京香格里拉', rating: 4.7, address: '海淀区紫竹院', price: 1088, stars: 5 },
    { id: 4, name: '北京万豪酒店', rating: 4.6, address: '东城区王府井', price: 768, stars: 4 },
    { id: 5, name: '北京洲际酒店', rating: 4.8, address: '朝阳区国贸', price: 988, stars: 5 }
  ])

  const handleSearch = () => {
    console.log('搜索酒店列表')
  }

  const goToDetail = (id) => {
    Taro.navigateTo({
      url: `/pages/hotel/detail/index?id=${id}`
    })
  }

  const filterOptions = {
    priceRanges: ['不限', '200以下', '200-500', '500-1000', '1000以上'],
    starLevels: ['不限', '五星/豪华', '四星/高档', '三星/舒适']
  }

  return (
    <View className="hotel-list-container">
      {/* 顶部筛选区域 */}
      <View className="filter-header">
        <View className="city-filter">
          <Text>{city}</Text>
          <Text className="arrow">▼</Text>
        </View>
        <Input 
          className="search-input"
          placeholder="搜索酒店名称"
          value={keyword}
          onInput={(e) => setKeyword(e.detail.value)}
        />
        <View className="filter-btn" onClick={handleSearch}>
          <Text>搜索</Text>
        </View>
      </View>

      {/* 详细筛选区域 */}
      <View className="filter-section">
        <View 
          className={`filter-item ${priceRange === '' ? 'active' : ''}`}
          onClick={() => setPriceRange('')}
        >
          <Text>价格</Text>
        </View>
        <View 
          className={`filter-item ${starLevel === '' ? 'active' : ''}`}
          onClick={() => setStarLevel('')}
        >
          <Text>星级</Text>
        </View>
        <View className="filter-item">
          <Text>更多筛选</Text>
        </View>
      </View>

      {/* 酒店列表 */}
      <ScrollView 
        className="hotel-list"
        scrollY={true}
        lowerThreshold={50}
        onScrollToLower={() => console.log('加载更多')}
      >
        {hotelList.map(hotel => (
          <View 
            key={hotel.id} 
            className="hotel-item"
            onClick={() => goToDetail(hotel.id)}
          >
            <View className="hotel-image">
              <Text>酒店图片</Text>
            </View>
            <View className="hotel-info">
              <View className="hotel-name">
                <Text className="name">{hotel.name}</Text>
                <Text className="stars">{'⭐'.repeat(hotel.stars - 2)}</Text>
              </View>
              <View className="hotel-rating">
                <Text className="rating-score">{hotel.rating}</Text>
                <Text className="rating-text">超赞</Text>
              </View>
              <View className="hotel-address">
                <Text>{hotel.address}</Text>
              </View>
              <View className="hotel-price">
                <Text className="price-symbol">¥</Text>
                <Text className="price-value">{hotel.price}</Text>
                <Text className="price-unit">起</Text>
              </View>
            </View>
          </View>
        ))}
        
        <View className="load-more">
          <Text>上滑加载更多酒店</Text>
        </View>
      </ScrollView>
    </View>
  )
}
