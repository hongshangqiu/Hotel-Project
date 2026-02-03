import React, { useState, useRef } from 'react'
import { View, Text, Image, Swiper, SwiperItem, Button } from '@tarojs/components'
import Taro from '@tarojs/taro'
import './index.scss'

export default function HotelDetail() {
  const currentInstance = Taro.getCurrentInstance()
  const { params } = currentInstance.router
  const [currentTab, setCurrentTab] = useState(0)
  const [checkInDate, setCheckInDate] = useState('2026-02-03')
  const [checkOutDate, setCheckOutDate] = useState('2026-02-04')
  const [nights, setNights] = useState(1)
  const [roomType, setRoomType] = useState(0)
  
  const hotel = {
    id: params.id || 1,
    name: '北京希尔顿酒店',
    rating: 4.8,
    starLevel: 5,
    address: '北京市朝阳区建国路108号',
    phone: '010-88888888',
    images: [
      { id: 1, url: '' },
      { id: 2, url: '' },
      { id: 3, url: '' }
    ],
    facilities: ['WiFi', '停车场', '游泳池', '健身房', '餐厅', '会议室'],
    roomTypes: [
      { id: 1, name: '豪华大床房', price: 888, area: '45㎡', bed: '大床', breakfast: '含双早' },
      { id: 2, name: '行政双床房', price: 1088, area: '55㎡', bed: '双床', breakfast: '含双早' },
      { id: 3, name: '总统套房', price: 3888, area: '120㎡', bed: '大床', breakfast: '含双早' }
    ]
  }

  const handleBook = () => {
    Taro.showToast({
      title: '预订功能开发中',
      icon: 'none'
    })
  }

  const goBack = () => {
    Taro.navigateBack()
  }

  return (
    <View className="hotel-detail-container">
      {/* 顶部导航 */}
      <View className="nav-header">
        <View className="back-btn" onClick={goBack}>
          <Text>←</Text>
        </View>
        <Text className="nav-title">{hotel.name}</Text>
        <View className="share-btn">
          <Text>•••</Text>
        </View>
      </View>

      {/* Banner轮播 */}
      <Swiper
        className="banner-swiper"
        indicatorColor="#999"
        indicatorActiveColor="#1890ff"
        circular={true}
        indicatorDots={true}
        autoplay={true}
      >
        {hotel.images.map(img => (
          <SwiperItem key={img.id}>
            <View className="swiper-item">
              <Text>酒店图片 {img.id}</Text>
            </View>
          </SwiperItem>
        ))}
      </Swiper>

      {/* 酒店基础信息 */}
      <View className="hotel-info">
        <View className="hotel-header">
          <View className="hotel-name-row">
            <Text className="hotel-name">{hotel.name}</Text>
            <Text className="hotel-stars">{'⭐'.repeat(hotel.starLevel)}</Text>
          </View>
          <View className="hotel-rating">
            <Text className="rating-score">{hotel.rating}</Text>
            <Text className="rating-text">超赞</Text>
          </View>
        </View>
        
        <View className="hotel-address">
          <Text>📍 {hotel.address}</Text>
        </View>
        
        <View className="hotel-facilities">
          {hotel.facilities.map((facility, index) => (
            <View key={index} className="facility-tag">
              <Text>{facility}</Text>
            </View>
          ))}
        </View>
      </View>

      {/* 日历选择 */}
      <View className="calendar-section">
        <View className="calendar-card">
          <View className="date-item">
            <Text className="date-label">入住</Text>
            <Text className="date-value">{checkInDate}</Text>
          </View>
          <View className="night-count">
            <Text>{nights}晚</Text>
          </View>
          <View className="date-item">
            <Text className="date-label">退房</Text>
            <Text className="date-value">{checkOutDate}</Text>
          </View>
        </View>
      </View>

      {/* 房型列表 */}
      <View className="room-section">
        <Text className="section-title">房型选择</Text>
        <View className="room-list">
          {hotel.roomTypes.map((room, index) => (
            <View 
              key={room.id} 
              className={`room-item ${roomType === index ? 'selected' : ''}`}
              onClick={() => setRoomType(index)}
            >
              <View className="room-info">
                <Text className="room-name">{room.name}</Text>
                <Text className="room-detail">{room.area} | {room.bed} | {room.breakfast}</Text>
              </View>
              <View className="room-price">
                <Text className="price-symbol">¥</Text>
                <Text className="price-value">{room.price}</Text>
                <Text className="price-unit">/晚</Text>
              </View>
            </View>
          ))}
        </View>
      </View>

      {/* 底部预订栏 */}
      <View className="bottom-bar">
        <View className="contact-info">
          <Text>电话咨询: {hotel.phone}</Text>
        </View>
        <Button className="book-btn" onClick={handleBook}>
          <Text>预订</Text>
        </Button>
      </View>
    </View>
  )
}
