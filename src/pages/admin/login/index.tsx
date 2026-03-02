import { useState, useEffect } from 'react'
import Taro from '@tarojs/taro'
import { View, Text } from '@tarojs/components'
import { Button, Input } from '@nutui/nutui-react-taro'
import { useStore } from '@/shared/store'
import { UserRole } from '@/shared/types'
import { LocalStorage, STORAGE_KEYS } from '@/shared/utils/LocalStorage'
import { ADMIN_ACCOUNTS, PRESET_MERCHANTS } from '@/shared/constants'
import './index.scss'

const Login = () => {
  const { login } = useStore()
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)

  // 初始化预设商户账号（确保登录页也能初始化）
  useEffect(() => {
    const initMerchants = () => {
      const users = LocalStorage.get<any[]>(STORAGE_KEYS.USER_LIST) || []
      if (users.length === 0) {
        LocalStorage.set(STORAGE_KEYS.USER_LIST, PRESET_MERCHANTS)
      }
    }
    initMerchants()
  }, [])

  // 自动根据账号判断角色
  const detectRole = (name: string): UserRole => {
    // 预设的管理员账号
    const isAdmin = ADMIN_ACCOUNTS.some(
      admin => admin.username.toLowerCase() === name.toLowerCase()
    )
    if (isAdmin) {
      return UserRole.ADMIN
    }
    // 其他账号为商户
    return UserRole.MERCHANT
  }

  // 登录时验证账号
  const validateLogin = (name: string, pwd: string): { valid: boolean; role: UserRole; error?: string } => {
    const role = detectRole(name)
    
    // 预设管理员验证
    if (role === UserRole.ADMIN) {
      const admin = ADMIN_ACCOUNTS.find(
        a => a.username.toLowerCase() === name.toLowerCase()
      )
      if (!admin || admin.password !== pwd) {
        return { valid: false, role, error: '管理员账号或密码错误' }
      }
      return { valid: true, role }
    }
    
    // 商户验证 - 检查本地存储的注册用户
    const users = LocalStorage.get<any[]>(STORAGE_KEYS.USER_LIST) || []
    const user = users.find(u => u.username.toLowerCase() === name.toLowerCase() && u.password === pwd)
    
    if (!user) {
      // 检查是否是已注册用户但密码错误
      const existingUser = users.find(u => u.username.toLowerCase() === name.toLowerCase())
      if (existingUser) {
        return { valid: false, role, error: '密码错误' }
      }
      // 用户不存在
      return { valid: false, role, error: '账号不存在，请先注册' }
    }
    
    return { valid: true, role: user.role as UserRole }
  }

  const handleLogin = async () => {
    if (!username || !password) {
      Taro.showToast({ title: '请输入账号和密码', icon: 'none' })
      return
    }

    setLoading(true)

    try {
      const result = validateLogin(username, password)
      
      if (!result.valid) {
        setLoading(false)
        Taro.showToast({ title: result.error || '登录失败', icon: 'none' })
        return
    }

      const user = {
        id: username.toLowerCase() === 'admin' ? '0' : Date.now().toString(),
        username,
        role: result.role,
        token: 'mock-token'
      }
      
      login(user)
      Taro.showToast({ title: '登录成功', icon: 'success' })

      if (result.role === UserRole.ADMIN) {
        await Taro.reLaunch({ url: '/pages/admin/audit/index' })
      } else {
        await Taro.reLaunch({ url: '/pages/admin/merchant/index' })
      }
    } catch (err) {
      console.error('登录失败:', err)
      Taro.showToast({ title: '登录失败', icon: 'none' })
    } finally {
      setLoading(false)
    }
  }

  const handleGoRegister = async () => {
    try {
      await Taro.navigateTo({ 
        url: '/pages/admin/register/index'
      })
    } catch (err) {
      console.error('跳转注册页失败:', err)
      Taro.showToast({ title: '跳转失败', icon: 'none' })
    }
  }

  return (
    <View className='login-container'>
      {/* 顶部品牌区域 */}
      <View className='header'>
        <View className='logo-wrapper'>
          <Text className='logo-icon'>🏨</Text>
        </View>
        <Text className='brand-name'>逸宿酒店管理</Text>
        <Text className='slogan'>高效管理 · 便捷运营</Text>
      </View>

      {/* 表单区域 */}
      <View className='form-area'>
        <View className='form-card'>
          <Text className='form-title'>账号登录</Text>

        <View className='form-item'>
            <View className='input-wrapper'>
          <Input
            className='input'
            type='text'
            placeholder='请输入账号'
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
            placeholder='请输入密码'
            value={password}
            onChange={(val) => setPassword(val)}
          />
          </View>
        </View>

        <Button
          type='primary'
          block
          loading={loading}
          onClick={handleLogin}
          className='login-btn'
        >
            {loading ? '登录中...' : '登录'}
        </Button>
        </View>

        <View className='register-link'>
          <Text className='link-text'>还没有账号？</Text>
          <Text className='link-btn' onClick={handleGoRegister}>立即注册</Text>
        </View>
      </View>

      {/* 底部 */}
      <View className='footer'>
        <Text className='footer-text'>
          登录即表示同意<span className='footer-link'>《用户协议》</span>和<span className='footer-link'>《隐私政策》</span>
        </Text>
      </View>
    </View>
  )
}

export default Login
