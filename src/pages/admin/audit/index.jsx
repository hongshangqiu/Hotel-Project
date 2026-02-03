import React, { useState } from 'react'
import { View, Text, Input, Button, ScrollView } from '@tarojs/components'
import Taro from '@tarojs/taro'
import './index.scss'

export default function HotelAudit() {
  const [filterStatus, setFilterStatus] = useState('all')
  const [hotelList, setHotelList] = useState([
    {
      id: 1,
      name: '北京希尔顿酒店',
      starLevel: 5,
      price: 888,
      status: 'pending',
      submitTime: '2026-02-01 10:30',
      address: '北京市朝阳区建国路108号'
    },
    {
      id: 2,
      name: '北京四季酒店',
      starLevel: 5,
      price: 1288,
      status: 'approved',
      submitTime: '2026-01-30 14:20',
      address: '北京市朝阳区亮马桥路'
    },
    {
      id: 3,
      name: '北京香格里拉',
      starLevel: 5,
      price: 1088,
      status: 'rejected',
      submitTime: '2026-01-28 09:15',
      address: '北京市海淀区紫竹院路',
      rejectReason: '酒店资质证明不清晰，请重新上传营业执照'
    },
    {
      id: 4,
      name: '北京万豪酒店',
      starLevel: 4,
      price: 768,
      status: 'offline',
      submitTime: '2026-01-25 16:45',
      address: '北京市东城区王府井大街'
    }
  ])

  const getStatusText = (status) => {
    const statusMap = {
      pending: '审核中',
      approved: '已发布',
      rejected: '已拒绝',
      offline: '已下线'
    }
    return statusMap[status] || status
  }

  const getStatusClass = (status) => {
    const classMap = {
      pending: 'status-pending',
      approved: 'status-approved',
      rejected: 'status-rejected',
      offline: 'status-offline'
    }
    return classMap[status] || ''
  }

  const filteredList = hotelList.filter(hotel => {
    if (filterStatus === 'all') return true
    return hotel.status === filterStatus
  })

  const handleApprove = (id) => {
    Taro.showModal({
      title: '确认通过',
      content: '确定要通过该酒店的上线申请吗？',
      success: (res) => {
        if (res.confirm) {
          setHotelList(hotelList.map(hotel => 
            hotel.id === id ? { ...hotel, status: 'approved' } : hotel
          ))
          Taro.showToast({ title: '操作成功', icon: 'success' })
        }
      }
    })
  }

  const handleReject = (id) => {
    Taro.showModal({
      title: '拒绝申请',
      content: '请输入拒绝原因',
      editable: true,
      placeholderText: '请输入拒绝原因',
      success: (res) => {
        if (res.confirm) {
          const reason = res.content || '信息不符合要求'
          setHotelList(hotelList.map(hotel => 
            hotel.id === id ? { ...hotel, status: 'rejected', rejectReason: reason } : hotel
          ))
          Taro.showToast({ title: '已拒绝', icon: 'none' })
        }
      }
    })
  }

  const handleOffline = (id) => {
    Taro.showModal({
      title: '确认下线',
      content: '确定要下线该酒店吗？下线后酒店将不会在用户端展示。',
      success: (res) => {
        if (res.confirm) {
          setHotelList(hotelList.map(hotel => 
            hotel.id === id ? { ...hotel, status: 'offline' } : hotel
          ))
          Taro.showToast({ title: '已下线', icon: 'success' })
        }
      }
    })
  }

  const handleOnline = (id) => {
    Taro.showModal({
      title: '确认恢复上线',
      content: '确定要恢复该酒店的上线状态吗？',
      success: (res) => {
        if (res.confirm) {
          setHotelList(hotelList.map(hotel => 
            hotel.id === id ? { ...hotel, status: 'approved' } : hotel
          ))
          Taro.showToast({ title: '已恢复上线', icon: 'success' })
        }
      }
    })
  }

  return (
    <View className="hotel-audit-container">
      <View className="page-header">
        <Text className="page-title">酒店审核管理</Text>
      </View>

      <View className="filter-tabs">
        <View 
          className={`filter-tab ${filterStatus === 'all' ? 'active' : ''}`}
          onClick={() => setFilterStatus('all')}
        >
          <Text>全部</Text>
          <Text className="count">{hotelList.length}</Text>
        </View>
        <View 
          className={`filter-tab ${filterStatus === 'pending' ? 'active' : ''}`}
          onClick={() => setFilterStatus('pending')}
        >
          <Text>待审核</Text>
          <Text className="count">{hotelList.filter(h => h.status === 'pending').length}</Text>
        </View>
        <View 
          className={`filter-tab ${filterStatus === 'approved' ? 'active' : ''}`}
          onClick={() => setFilterStatus('approved')}
        >
          <Text>已发布</Text>
          <Text className="count">{hotelList.filter(h => h.status === 'approved').length}</Text>
        </View>
        <View 
          className={`filter-tab ${filterStatus === 'offline' ? 'active' : ''}`}
          onClick={() => setFilterStatus('offline')}
        >
          <Text>已下线</Text>
          <Text className="count">{hotelList.filter(h => h.status === 'offline').length}</Text>
        </View>
      </View>

      <ScrollView 
        className="hotel-list"
        scrollY={true}
      >
        {filteredList.map(hotel => (
          <View key={hotel.id} className="hotel-card">
            <View className="card-header">
              <View className="hotel-name">
                <Text className="name">{hotel.name}</Text>
                <Text className="stars">{'⭐'.repeat(hotel.starLevel)}</Text>
              </View>
              <View className={`status-badge ${getStatusClass(hotel.status)}`}>
                <Text>{getStatusText(hotel.status)}</Text>
              </View>
            </View>

            <View className="card-info">
              <Text className="info-row">
                <Text className="label">地址：</Text>
                <Text>{hotel.address}</Text>
              </Text>
              <Text className="info-row">
                <Text className="label">价格：</Text>
                <Text className="price">¥{hotel.price}起</Text>
              </Text>
              <Text className="info-row">
                <Text className="label">提交时间：</Text>
                <Text>{hotel.submitTime}</Text>
              </Text>
              {hotel.rejectReason && (
                <Text className="info-row reject-reason">
                  <Text className="label">拒绝原因：</Text>
                  <Text>{hotel.rejectReason}</Text>
                </Text>
              )}
            </View>

            <View className="card-actions">
              {hotel.status === 'pending' && (
                <>
                  <View className="action-btn approve" onClick={() => handleApprove(hotel.id)}>
                    <Text>通过</Text>
                  </View>
                  <View className="action-btn reject" onClick={() => handleReject(hotel.id)}>
                    <Text>拒绝</Text>
                  </View>
                </>
              )}
              {hotel.status === 'approved' && (
                <View className="action-btn offline" onClick={() => handleOffline(hotel.id)}>
                  <Text>下线</Text>
                </View>
              )}
              {hotel.status === 'offline' && (
                <View className="action-btn online" onClick={() => handleOnline(hotel.id)}>
                  <Text>恢复上线</Text>
                </View>
              )}
              {hotel.status === 'rejected' && (
                <View className="action-btn view">
                  <Text>查看详情</Text>
                </View>
              )}
            </View>
          </View>
        ))}

        {filteredList.length === 0 && (
          <View className="empty-state">
            <Text className="empty-text">暂无酒店数据</Text>
          </View>
        )}
      </ScrollView>
    </View>
  )
}
