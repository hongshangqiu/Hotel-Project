import React, { useState } from 'react'
import { View, Text, Input, Button, Image } from '@tarojs/components'
import './index.scss'

export default function Index() {
  const [keyword, setKeyword] = useState('')
  const [location, setLocation] = useState('当前位置')

  const handleSearch = () => {
    console.log('搜索关键词:', keyword)
  }

  const handleLocation = () => {
    console.log('获取定位')
  }

  const banners = [
    { id: 1, image: '', title: '限时特惠' },
    { id: 2, image: '', title: '新品上线' }
  ]

  return (
    <View className="index-container">
      {/* 搜索区域 */}
      <View className="search-area">
        <View className="location" onClick={handleLocation}>
          <Text>{location}</Text>
          <Text className="icon">▼</Text>
        </View>
        <Input 
          className="search-input"
          placeholder="搜索酒店名称"
          value={keyword}
          onInput={(e) => setKeyword(e.detail.value)}
        />
        <Button className="search-btn" onClick={handleSearch}>搜索</Button>
      </View>

      {/* Banner区域 */}
      <View className="banner-area">
        {banners.map(banner => (
          <View key={banner.id} className="banner-item">
            <Text>{banner.title}</Text>
          </View>
        ))}
      </View>

      {/* 快捷标签 */}
      <View className="quick-tags">
        <View className="tag-item">
          <Text>亲子</Text>
        </View>
        <View className="tag-item">
          <Text>豪华</Text>
        </View>
        <View className="tag-item">
          <Text>免费停车</Text>
        </View>
        <View className="tag-item">
          <Text>WiFi</Text>
        </View>
      </View>

      {/* 快捷入口 */}
      <View className="shortcuts">
        <View className="shortcut-item">
          <Text>热门酒店</Text>
        </View>
        <View className="shortcut-item">
          <Text>附近酒店</Text>
        </View>
        <View className="shortcut-item">
          <Text>我的订单</Text>
        </View>
      </View>
    </View>
  )
}
