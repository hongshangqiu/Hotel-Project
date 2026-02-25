import { useState, useEffect } from 'react'
import Taro from '@tarojs/taro'
import { View, Text } from '@tarojs/components'
import { Button, Input } from '@nutui/nutui-react-taro'
import { useStore } from '@/shared/store'
import { UserRole } from '@/shared/types'
import { LocalStorage, STORAGE_KEYS } from '@/shared/utils/LocalStorage'
import './index.scss'

// 预设管理员账号（登录专用）
const ADMIN_ACCOUNTS = ['admin', 'manager']

// 预设商户账号
const PRESET_MERCHANTS = [
  { id: '1', username: 'hotel01', password: '123456', role: UserRole.MERCHANT },
  { id: '2', username: 'hotel02', password: '123456', role: UserRole.MERCHANT },
]

const Register = () => {
  const { login } = useStore()
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [role, setRole] = useState<UserRole>(UserRole.MERCHANT)
  const [loading, setLoading] = useState(false)

  // 初始化预设商户账号
  useEffect(() => {
    const initMerchants = () => {
      const users = LocalStorage.get<any[]>(STORAGE_KEYS.USER_LIST) || []
      
      // 如果没有预设商户，则添加
      if (users.length === 0) {
        LocalStorage.set(STORAGE_KEYS.USER_LIST, PRESET_MERCHANTS)
      }
    }
    initMerchants()
  }, [])

  // 获取已注册用户列表
  const getRegisteredUsers = (): any[] => {
    return LocalStorage.get<any[]>(STORAGE_KEYS.USER_LIST) || []
  }

  // 保存用户到本地存储
  const saveUser = (user: any) => {
    const users = getRegisteredUsers()
    users.push(user)
    LocalStorage.set(STORAGE_KEYS.USER_LIST, users)
  }

  // 检查用户名是否已存在
  const isUsernameExists = (name: string): boolean => {
    const users = getRegisteredUsers()
    return users.some(u => u.username === name)
  }

  const handleRegister = () => {
    // 验证输入
    if (!username || !password || !confirmPassword) {
      Taro.showToast({ title: '请填写完整信息', icon: 'none' })
      return
    }

    if (username.length < 3) {
      Taro.showToast({ title: '用户名至少3个字符', icon: 'none' })
      return
    }

    if (password.length < 6) {
      Taro.showToast({ title: '密码至少6位', icon: 'none' })
      return
    }

    if (password !== confirmPassword) {
      Taro.showToast({ title: '两次密码输入不一致', icon: 'none' })
      return
    }

    if (isUsernameExists(username)) {
      Taro.showToast({ title: '用户名已存在', icon: 'none' })
      return
    }

    setLoading(true)

    // Mock 注册
    setTimeout(() => {
      const user = {
        id: Date.now().toString(),
        username,
        role,
        token: `mock-token-${Date.now()}`
      }

      // 保存用户信息
      saveUser({
        id: user.id,
        username: user.username,
        password: password,
        role: user.role
      })

      // 自动登录
      login(user)
      setLoading(false)
      Taro.showToast({ title: '注册成功', icon: 'success' })

      // 跳转到对应页面
      if (role === UserRole.ADMIN) {
        Taro.reLaunch({ url: '/pages/admin/audit/index' })
      } else {
        Taro.reLaunch({ url: '/pages/admin/merchant/index' })
      }
    }, 1000)
  }

  const handleGoLogin = async () => {
    try {
      await Taro.navigateTo({ 
        url: '/pages/admin/login/index'
      })
    } catch (err) {
      console.error('返回登录页失败:', err)
      Taro.showToast({ title: '返回失败', icon: 'none' })
    }
  }

  return (
    <View className='register-container'>
      {/* 顶部品牌区域 */}
      <View className='header'>
        <View className='logo-wrapper'>
          <Text className='logo-icon'>🏨</Text>
        </View>
        <Text className='brand-name'>账号注册</Text>
        <Text className='slogan'>加入逸宿酒店管理平台</Text>
      </View>

      {/* 表单区域 */}
      <View className='form-area'>
        <View className='form-card'>
          <Text className='form-title'>填写注册信息</Text>

          <View className='form-item'>
            <View className='input-wrapper'>
              <Input
                className='input'
                type='text'
                placeholder='请输入用户名（至少3位）'
                value={username}
                onChange={(val) => setUsername(val)}
              />
            </View>
          </View>

          <View className='form-item'>
            <View className='input-wrapper'>
              <Input
                className='input'
                type='password'
                placeholder='请输入密码（至少6位）'
                value={password}
                onChange={(val) => setPassword(val)}
              />
            </View>
          </View>

          <View className='form-item'>
            <View className='input-wrapper'>
              <Input
                className='input'
                type='password'
                placeholder='请再次输入密码'
                value={confirmPassword}
                onChange={(val) => setConfirmPassword(val)}
              />
            </View>
          </View>

          <View className='form-item role-section'>
            <Text className='role-label'>选择身份</Text>
            <View className='role-selector'>
              <View
                className={`role-option ${role === UserRole.MERCHANT ? 'active' : ''}`}
                onClick={() => setRole(UserRole.MERCHANT)}
              >
                <Text className='role-text'>商户</Text>
                <Text className='role-desc'>管理酒店</Text>
              </View>
              <View
                className={`role-option ${role === UserRole.ADMIN ? 'active' : ''}`}
                onClick={() => setRole(UserRole.ADMIN)}
              >
                <Text className='role-text'>管理员</Text>
                <Text className='role-desc'>审核管理</Text>
              </View>
            </View>
          </View>

          <Button
            type='primary'
            block
            loading={loading}
            onClick={handleRegister}
            className='register-btn'
          >
            {loading ? '注册中...' : '注册'}
          </Button>
        </View>

        <View className='login-link'>
          <Text className='link-text'>已有账号？</Text>
          <Text className='link-btn' onClick={handleGoLogin}>立即登录</Text>
        </View>
      </View>

      {/* 底部 */}
      <View className='footer'>
        <Text className='footer-text'>
          注册即表示同意<span className='footer-link'>《用户协议》</span>和<span className='footer-link'>《隐私政策》</span>
        </Text>
      </View>
    </View>
  )
}

export default Register
