import React, { useState } from 'react'
import { View, Text, Input, Button, Form } from '@tarojs/components'
import Taro from '@tarojs/taro'
import './index.scss'

export default function Login() {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [role, setRole] = useState('merchant') // merchant: 商户, admin: 管理员

  const handleLogin = () => {
    if (!username || !password) {
      Taro.showToast({
        title: '请输入用户名和密码',
        icon: 'none'
      })
      return
    }

    // 模拟登录
    Taro.showLoading({ title: '登录中...' })
    
    setTimeout(() => {
      Taro.hideLoading()
      
      if (role === 'merchant') {
        // 商户跳转到酒店信息录入页面
        Taro.redirectTo({
          url: '/pages/admin/add/index'
        })
      } else {
        // 管理员跳转到审核页面
        Taro.redirectTo({
          url: '/pages/admin/audit/index'
        })
      }
      
      Taro.showToast({
        title: '登录成功',
        icon: 'success'
      })
    }, 1000)
  }

  const handleRegister = () => {
    Taro.showToast({
      title: '注册功能开发中',
      icon: 'none'
    })
  }

  return (
    <View className="login-container">
      <View className="login-box">
        <View className="logo-area">
          <Text className="logo-text">易宿酒店</Text>
          <Text className="subtitle">管理平台</Text>
        </View>

        <View className="role-switch">
          <View 
            className={`role-item ${role === 'merchant' ? 'active' : ''}`}
            onClick={() => setRole('merchant')}
          >
            <Text>商户</Text>
          </View>
          <View 
            className={`role-item ${role === 'admin' ? 'active' : ''}`}
            onClick={() => setRole('admin')}
          >
            <Text>管理员</Text>
          </View>
        </View>

        <View className="form-area">
          <View className="form-item">
            <Text className="label">用户名</Text>
            <Input 
              className="input"
              placeholder="请输入用户名"
              value={username}
              onInput={(e) => setUsername(e.detail.value)}
            />
          </View>

          <View className="form-item">
            <Text className="label">密码</Text>
            <Input 
              className="input"
              password={true}
              placeholder="请输入密码"
              value={password}
              onInput={(e) => setPassword(e.detail.value)}
            />
          </View>

          <Button className="login-btn" onClick={handleLogin}>
            <Text>登录</Text>
          </Button>

          <View className="register-link" onClick={handleRegister}>
            <Text>还没有账号？立即注册</Text>
          </View>
        </View>
      </View>
    </View>
  )
}
