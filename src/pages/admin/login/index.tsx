import { useState } from 'react'
import Taro from '@tarojs/taro'
import { View, Text } from '@tarojs/components'
import { Button, Input, Radio, Form } from '@nutui/nutui-react-taro'
// src/pages/admin/login/index.tsx
import { useStore } from '@/shared/store'
import { UserRole } from '@/shared/types'
import './index.scss'

const Login = () => {
  const { login } = useStore()
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [role, setRole] = useState<UserRole>(UserRole.MERCHANT)
  const [loading, setLoading] = useState(false)

  const handleLogin = () => {
    if (!username || !password) {
      Taro.showToast({ title: '请输入账号和密码', icon: 'none' })
      return
    }

    setLoading(true)
    // Mock login
    setTimeout(() => {
      const user = {
        id: '1',
        username,
        role,
        token: 'mock-token'
      }
      login(user)
      setLoading(false)
      Taro.showToast({ title: '登录成功', icon: 'success' })

      // 使用 reLaunch 跳转，关闭所有页面，避免登录页残留
      if (role === UserRole.ADMIN) {
        Taro.reLaunch({ url: '/pages/admin/audit/index' })
      } else {
        Taro.reLaunch({ url: '/pages/admin/manage/index' })
      }
    }, 1000)
  }

  return (
    <View className='login-container'>
      <View className='header'>
        <Text className='title'>逸宿管理后台</Text>
        <Text className='subtitle'>欢迎回来</Text>
      </View>

      <View className='form-area'>
        <View className='form-item'>
          <Text className='label'>账号</Text>
          <Input
            className='input'
            type='text'
            placeholder='请输入账号'
            value={username}
            onChange={(val) => setUsername(val)}
          />
        </View>

        <View className='form-item'>
          <Text className='label'>密码</Text>
          <Input
            className='input'
            type='password'
            placeholder='请输入密码'
            value={password}
            onChange={(val) => setPassword(val)}
          />
        </View>

        <View className='form-item'>
          <Text className='label'>角色</Text>
          <View className='role-selector'>
            <View
              className={`role-option ${role === UserRole.MERCHANT ? 'active' : ''}`}
              onClick={() => setRole(UserRole.MERCHANT)}
            >
              <Text>商户</Text>
            </View>
            <View
              className={`role-option ${role === UserRole.ADMIN ? 'active' : ''}`}
              onClick={() => setRole(UserRole.ADMIN)}
            >
              <Text>管理员</Text>
            </View>
          </View>
        </View>

        <Button
          type='primary'
          block
          loading={loading}
          onClick={handleLogin}
          className='login-btn'
        >
          登录
        </Button>
      </View>
    </View>
  )
}

export default Login
