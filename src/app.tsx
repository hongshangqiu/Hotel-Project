import { PropsWithChildren, useState, useEffect } from 'react'
import Taro from '@tarojs/taro'
import Layout from './components/Layout'
import { useStore } from './shared/store'
import './app.scss'

function App({ children }: PropsWithChildren<any>) {
  const { isLogin, isPC, setDevice, user } = useStore()
  const [initialized, setInitialized] = useState(false)
  const [isLoginPage, setIsLoginPage] = useState(false)

  // 1. 启动时检测设备类型并自动跳转
  useEffect(() => {
    if (initialized) return

    const systemInfo = Taro.getSystemInfoSync()
    const width = (systemInfo as any).windowWidth || systemInfo.screenWidth || 375
    const isPCDevice = width > 768

    // 更新设备类型
    setDevice(isPCDevice)

    // 获取当前页面
    const pages = Taro.getCurrentPages()
    const currentPage = pages[pages.length - 1]
    const currentRoute = currentPage?.route || ''

    // 根据设备类型自动跳转
    if (isPCDevice) {
      // PC端：未登录跳转到登录页，已登录跳转到管理后台
      if (!isLogin) {
        if (!currentRoute.includes('login')) {
          Taro.redirectTo({ url: '/pages/admin/login/index' })
        }
      } else {
        // 已登录，确保在管理端页面
        if (!currentRoute.includes('admin')) {
          Taro.reLaunch({ url: '/pages/admin/manage/index' })
        }
      }
    } else {
      // 移动端：确保在用户端页面
      if (!currentRoute.includes('user/index') && !currentRoute.includes('user/list') && !currentRoute.includes('user/detail')) {
        Taro.reLaunch({ url: '/pages/user/index/index' })
      }
    }

    setInitialized(true)
  }, [initialized, isLogin, setDevice])

  // 2. 检测当前是否是登录页
  useEffect(() => {
    const pages = Taro.getCurrentPages()
    if (pages.length > 0) {
      const currentPage = pages[pages.length - 1]
      setIsLoginPage(currentPage?.route?.includes('login') || false)
    }
  })

  // 3. PC端已登录：使用 Layout 包裹管理端页面
  if (isPC && isLogin && user) {
    // 管理端页面需要 Layout 包裹
    const pages = Taro.getCurrentPages()
    const currentPage = pages[pages.length - 1]
    if (currentPage?.route?.includes('admin')) {
      return (
        <Layout>
          {children}
        </Layout>
      )
    }
  }

  // 4. 登录页和其他页面直接显示
  return <>{children}</>
}

export default App
