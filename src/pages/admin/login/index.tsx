import { useState } from 'react'
import Taro from '@tarojs/taro'
import { View, Text } from '@tarojs/components'
import { Button, Input } from '@nutui/nutui-react-taro'
import { useStore } from '@/shared/store'
import { UserRole } from '@/shared/types'
import { LocalStorage, STORAGE_KEYS } from '@/shared/utils/LocalStorage'
import { ADMIN_ACCOUNTS } from '@/shared/constants'
import './index.scss'

const Login = () => {
  const { login } = useStore()
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [errorCount, setErrorCount] = useState(0)
  const [lockEndTime, setLockEndTime] = useState<number | null>(null)
  const [errors, setErrors] = useState<{ username?: string; password?: string }>({})

  // 最大错误次数
  const MAX_ERROR_COUNT = 5
  // 锁定时间（毫秒）- 30秒
  const LOCK_DURATION = 30 * 1000

  // 检查是否被锁定
  const isLocked = () => {
    if (!lockEndTime) return false
    if (Date.now() >= lockEndTime) {
      setLockEndTime(null)
      setErrorCount(0)
      return false
    }
    return true
  }

  // 表单输入验证
  const validateInput = (): boolean => {
    const newErrors: { username?: string; password?: string } = {}
    let isValid = true

    // 去除首尾空格后的值
    const trimmedUsername = username.trim()
    const trimmedPassword = password.trim()

    // 账号验证
    if (!trimmedUsername) {
      newErrors.username = '请输入账号'
      isValid = false
    } else if (trimmedUsername.length < 3) {
      newErrors.username = '账号至少3个字符'
      isValid = false
    } else if (/[\s<>'"\\]/.test(trimmedUsername)) {
      newErrors.username = '账号不能包含空格或特殊字符'
      isValid = false
    }

    // 密码验证
    if (!trimmedPassword) {
      newErrors.password = '请输入密码'
      isValid = false
    } else if (trimmedPassword.length < 6) {
      newErrors.password = '密码至少6个字符'
      isValid = false
    } else if (/[\s<>'"\\]/.test(trimmedPassword)) {
      newErrors.password = '密码不能包含空格或特殊字符'
      isValid = false
    }

    setErrors(newErrors)
    return isValid
  }

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
    // 检查是否被锁定
    if (isLocked()) {
      const remainingTime = Math.ceil((lockEndTime! - Date.now()) / 1000)
      Taro.showToast({ title: `账号已锁定，请${remainingTime}分钟后再试`, icon: 'none' })
      return
    }

    // 表单验证
    if (!validateInput()) {
      return
    }

    // 去除空格
    const trimmedUsername = username.trim()
    const trimmedPassword = password.trim()

    setLoading(true)

    try {
      const result = validateLogin(trimmedUsername, trimmedPassword)

      if (!result.valid) {
        setLoading(false)
        // 登录失败，错误次数+1
        const newErrorCount = errorCount + 1
        setErrorCount(newErrorCount)

        if (newErrorCount >= MAX_ERROR_COUNT) {
          // 达到最大错误次数，锁定账号
          const lockTime = Date.now() + LOCK_DURATION
          setLockEndTime(lockTime)
          Taro.showToast({ title: `登录错误次数过多，账号已锁定${LOCK_DURATION / 1000}秒`, icon: 'none' })
        } else {
          const remaining = MAX_ERROR_COUNT - newErrorCount
          Taro.showToast({ title: `${result.error || '登录失败'}，还能尝试${remaining}次`, icon: 'none' })
        }
        return
      }

      // 登录成功，重置错误计数
      setErrorCount(0)
      setLockEndTime(null)

      const user = {
        id: trimmedUsername.toLowerCase() === 'admin' ? '0' : Date.now().toString(),
        username: trimmedUsername,
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
            className={`input ${errors.username ? 'input-error' : ''}`}
            type='text'
            placeholder='请输入账号'
            value={username}
            disabled={loading || isLocked()}
            onChange={(val) => {
              setUsername(val)
              setErrors(prev => ({ ...prev, username: undefined }))
            }}
          />
            </View>
            {errors.username && <Text className='error-text'>{errors.username}</Text>}
        </View>

        <View className='form-item'>
            <View className='input-wrapper'>
          <Input
            className={`input ${errors.password ? 'input-error' : ''}`}
            type='password'
            placeholder='请输入密码'
            value={password}
            disabled={loading || isLocked()}
            onChange={(val) => {
              setPassword(val)
              setErrors(prev => ({ ...prev, password: undefined }))
            }}
          />
          </View>
            {errors.password && <Text className='error-text'>{errors.password}</Text>}
        </View>

        {lockEndTime && isLocked() && (
          <View className='lock-tip'>
            <Text className='lock-text'>账号已锁定，剩余 {Math.ceil((lockEndTime - Date.now()) / 1000)} 秒</Text>
          </View>
        )}

        {errorCount > 0 && errorCount < MAX_ERROR_COUNT && (
          <View className='error-count-tip'>
            <Text className='count-text'>密码错误，还能尝试 {MAX_ERROR_COUNT - errorCount} 次</Text>
          </View>
        )}

        <Button
          type='primary'
          block
          loading={loading}
          disabled={isLocked()}
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
