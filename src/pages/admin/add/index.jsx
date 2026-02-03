import React, { useState } from 'react'
import { View, Text, Input, Button, Textarea, Picker } from '@tarojs/components'
import Taro from '@tarojs/taro'
import './index.scss'

export default function HotelAdd() {
  const [hotelInfo, setHotelInfo] = useState({
    name: '',
    nameEn: '',
    address: '',
    starLevel: 5,
    roomTypes: [],
    price: 0,
    openDate: '',
    description: ''
  })
  const [newRoomType, setNewRoomType] = useState({
    name: '',
    price: 0,
    area: '',
    bed: '',
    breakfast: ''
  })
  const starLevels = [3, 4, 5]

  const handleInputChange = (field, value) => {
    setHotelInfo({
      ...hotelInfo,
      [field]: value
    })
  }

  const addRoomType = () => {
    if (!newRoomType.name || !newRoomType.price) {
      Taro.showToast({
        title: '请填写完整房型信息',
        icon: 'none'
      })
      return
    }

    setHotelInfo({
      ...hotelInfo,
      roomTypes: [...hotelInfo.roomTypes, { ...newRoomType, id: Date.now() }]
    })

    setNewRoomType({
      name: '',
      price: 0,
      area: '',
      bed: '',
      breakfast: ''
    })
  }

  const removeRoomType = (id) => {
    setHotelInfo({
      ...hotelInfo,
      roomTypes: hotelInfo.roomTypes.filter(room => room.id !== id)
    })
  }

  const handleSave = () => {
    if (!hotelInfo.name || !hotelInfo.address) {
      Taro.showToast({
        title: '请填写完整酒店信息',
        icon: 'none'
      })
      return
    }

    // 模拟保存
    Taro.showLoading({ title: '保存中...' })
    setTimeout(() => {
      Taro.hideLoading()
      Taro.showToast({
        title: '保存成功',
        icon: 'success'
      })
    }, 1000)
  }

  return (
    <View className="hotel-add-container">
      <View className="page-header">
        <Text className="page-title">酒店信息录入</Text>
      </View>

      <View className="form-section">
        <View className="section-title">
          <Text>基本信息</Text>
        </View>

        <View className="form-item">
          <Text className="label">酒店名称 *</Text>
          <Input 
            className="input"
            placeholder="请输入酒店名称"
            value={hotelInfo.name}
            onInput={(e) => handleInputChange('name', e.detail.value)}
          />
        </View>

        <View className="form-item">
          <Text className="label">英文名称</Text>
          <Input 
            className="input"
            placeholder="请输入英文名称"
            value={hotelInfo.nameEn}
            onInput={(e) => handleInputChange('nameEn', e.detail.value)}
          />
        </View>

        <View className="form-item">
          <Text className="label">酒店地址 *</Text>
          <Input 
            className="input"
            placeholder="请输入酒店地址"
            value={hotelInfo.address}
            onInput={(e) => handleInputChange('address', e.detail.value)}
          />
        </View>

        <View className="form-item">
          <Text className="label">酒店星级</Text>
          <View className="star-selector">
            {starLevels.map(star => (
              <View 
                key={star}
                className={`star-item ${hotelInfo.starLevel === star ? 'active' : ''}`}
                onClick={() => handleInputChange('starLevel', star)}
              >
                <Text>{star}星级</Text>
              </View>
            ))}
          </View>
        </View>

        <View className="form-item">
          <Text className="label">开业时间</Text>
          <Input 
            className="input"
            placeholder="如：2020年1月"
            value={hotelInfo.openDate}
            onInput={(e) => handleInputChange('openDate', e.detail.value)}
          />
        </View>

        <View className="form-item">
          <Text className="label">酒店价格</Text>
          <Input 
            className="input"
            type="number"
            placeholder="请输入基础价格"
            value={hotelInfo.price.toString()}
            onInput={(e) => handleInputChange('price', parseInt(e.detail.value) || 0)}
          />
        </View>

        <View className="form-item">
          <Text className="label">酒店介绍</Text>
          <Textarea 
            className="textarea"
            placeholder="请输入酒店介绍"
            value={hotelInfo.description}
            onInput={(e) => handleInputChange('description', e.detail.value)}
          />
        </View>
      </View>

      <View className="form-section">
        <View className="section-title">
          <Text>房型管理</Text>
        </View>

        <View className="room-type-form">
          <View className="form-row">
            <View className="form-item half">
              <Text className="label">房型名称</Text>
              <Input 
                className="input"
                placeholder="如：豪华大床房"
                value={newRoomType.name}
                onInput={(e) => setNewRoomType({ ...newRoomType, name: e.detail.value })}
              />
            </View>
            <View className="form-item half">
              <Text className="label">价格</Text>
              <Input 
                className="input"
                type="number"
                placeholder="价格"
                value={newRoomType.price.toString()}
                onInput={(e) => setNewRoomType({ ...newRoomType, price: parseInt(e.detail.value) || 0 })}
              />
            </View>
          </View>

          <View className="form-row">
            <View className="form-item half">
              <Text className="label">面积</Text>
              <Input 
                className="input"
                placeholder="如：45㎡"
                value={newRoomType.area}
                onInput={(e) => setNewRoomType({ ...newRoomType, area: e.detail.value })}
              />
            </View>
            <View className="form-item half">
              <Text className="label">床型</Text>
              <Input 
                className="input"
                placeholder="如：大床/双床"
                value={newRoomType.bed}
                onInput={(e) => setNewRoomType({ ...newRoomType, bed: e.detail.value })}
              />
            </View>
          </View>

          <View className="form-item">
            <Text className="label">早餐</Text>
            <Input 
              className="input"
              placeholder="如：含双早/无早"
              value={newRoomType.breakfast}
              onInput={(e) => setNewRoomType({ ...newRoomType, breakfast: e.detail.value })}
            />
          </View>

          <Button className="add-room-btn" onClick={addRoomType}>
            <Text>添加房型</Text>
          </Button>
        </View>

        <View className="room-type-list">
          {hotelInfo.roomTypes.map(room => (
            <View key={room.id} className="room-type-item">
              <View className="room-info">
                <Text className="room-name">{room.name}</Text>
                <Text className="room-detail">{room.area} | {room.bed} | {room.breakfast}</Text>
              </View>
              <View className="room-price">
                <Text className="price">¥{room.price}</Text>
                <View className="delete-btn" onClick={() => removeRoomType(room.id)}>
                  <Text>删除</Text>
                </View>
              </View>
            </View>
          ))}
        </View>
      </View>

      <View className="bottom-bar">
        <Button className="save-btn" onClick={handleSave}>
          <Text>保存提交</Text>
        </Button>
      </View>
    </View>
  )
}
