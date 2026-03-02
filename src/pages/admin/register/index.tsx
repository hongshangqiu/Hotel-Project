import { useState } from 'react'
import Taro from '@tarojs/taro'
import { View, Text } from '@tarojs/components'
import { Button, Input } from '@nutui/nutui-react-taro'
import { useStore } from '@/shared/store'
import { UserRole } from '@/shared/types'
import { LocalStorage, STORAGE_KEYS } from '@/shared/utils/LocalStorage'
import './index.scss'

const Register = () => {
  const { login } = useStore()
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [inviteCode, setInviteCode] = useState('')
  const [role, setRole] = useState<UserRole>(UserRole.MERCHANT)
  const [loading, setLoading] = useState(false)
  const [errors, setErrors] = useState<{ username?: string; password?: string; confirmPassword?: string; inviteCode?: string }>({})

  // 推荐码
  const VALID_INVITE_CODE = '123456'

  // 表单输入验证
  const validateInput = (): boolean => {
    const newErrors: { username?: string; password?: string; confirmPassword?: string; inviteCode?: string } = {}
    let isValid = true

    // 去除首尾空格后的值
    const trimmedUsername = username.trim()
    const trimmedPassword = password.trim()
    const trimmedConfirmPassword = confirmPassword.trim()
    const trimmedInviteCode = inviteCode.trim()

    // 用户名验证
    if (!trimmedUsername) {
      newErrors.username = '请输入用户名'
      isValid = false
    } else if (trimmedUsername.length < 3) {
      newErrors.username = '用户名至少3个字符'
      isValid = false
    } else if (/[\s<>'"\\]/.test(trimmedUsername)) {
      newErrors.username = '用户名不能包含空格或特殊字符'
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

    // 确认密码验证
    if (!trimmedConfirmPassword) {
      newErrors.confirmPassword = '请再次输入密码'
      isValid = false
    } else if (trimmedPassword !== trimmedConfirmPassword) {
      newErrors.confirmPassword = '两次密码输入不一致'
      isValid = false
    }

    // 推荐码验证
    if (!trimmedInviteCode) {
      newErrors.inviteCode = '请输入推荐码'
      isValid = false
    } else if (trimmedInviteCode !== VALID_INVITE_CODE) {
      newErrors.inviteCode = '推荐码错误'
      isValid = false
    }

    setErrors(newErrors)
    return isValid
  }

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
    // 表单验证
    if (!validateInput()) {
      return
    }

    // 去除空格
    const trimmedUsername = username.trim()
    const trimmedPassword = password.trim()
    const trimmedInviteCode = inviteCode.trim()

    // 验证推荐码
    if (trimmedInviteCode !== VALID_INVITE_CODE) {
      setErrors({ ...errors, inviteCode: '推荐码错误' })
      Taro.showToast({ title: '推荐码错误', icon: 'none' })
      return
    }

    // 检查用户名是否已存在
    if (isUsernameExists(trimmedUsername)) {
      setErrors({ ...errors, username: '用户名已存在' })
      Taro.showToast({ title: '用户名已存在', icon: 'none' })
      return
    }

    setLoading(true)

    // Mock 注册
    setTimeout(() => {
      const user = {
        id: Date.now().toString(),
        username: trimmedUsername,
        role,
        token: `mock-token-${Date.now()}`
      }

      // 保存用户信息
      saveUser({
        id: user.id,
        username: user.username,
        password: trimmedPassword,
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
                className={`input ${errors.username ? 'input-error' : ''}`}
                type='text'
                placeholder='请输入用户名（至少3位）'
                value={username}
                disabled={loading}
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
                placeholder='请输入密码（至少6位）'
                value={password}
                disabled={loading}
                onChange={(val) => {
                  setPassword(val)
                  setErrors(prev => ({ ...prev, password: undefined }))
                }}
              />
            </View>
            {errors.password && <Text className='error-text'>{errors.password}</Text>}
          </View>

          <View className='form-item'>
            <View className='input-wrapper'>
              <Input
                className={`input ${errors.confirmPassword ? 'input-error' : ''}`}
                type='password'
                placeholder='请再次输入密码'
                value={confirmPassword}
                disabled={loading}
                onChange={(val) => {
                  setConfirmPassword(val)
                  setErrors(prev => ({ ...prev, confirmPassword: undefined }))
                }}
              />
            </View>
            {errors.confirmPassword && <Text className='error-text'>{errors.confirmPassword}</Text>}
          </View>

          <View className='form-item'>
            <View className='input-wrapper'>
              <Input
                className={`input ${errors.inviteCode ? 'input-error' : ''}`}
                type='text'
                placeholder='请输入推荐码'
                value={inviteCode}
                disabled={loading}
                onChange={(val) => {
                  setInviteCode(val)
                  setErrors(prev => ({ ...prev, inviteCode: undefined }))
                }}
              />
            </View>
            {errors.inviteCode && <Text className='error-text'>{errors.inviteCode}</Text>}
          </View>

          <View className='form-item role-section'>
            <Text className='role-label'>选择身份</Text>
            <View className='role-selector'>
              <View
                className={`role-option ${role === UserRole.MERCHANT ? 'active' : ''} ${loading ? 'disabled' : ''}`}
                onClick={() => !loading && setRole(UserRole.MERCHANT)}
              >
                <Text className='role-text'>商户</Text>
                <Text className='role-desc'>管理酒店</Text>
              </View>
              <View
                className={`role-option ${role === UserRole.ADMIN ? 'active' : ''} ${loading ? 'disabled' : ''}`}
                onClick={() => !loading && setRole(UserRole.ADMIN)}
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
