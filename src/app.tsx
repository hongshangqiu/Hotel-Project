import { PropsWithChildren, useState, useEffect } from 'react'
import Taro from '@tarojs/taro'
import Layout from './components/Layout'
import { useStore } from './shared/store'
import { hotelService } from './shared/services/hotelService'
import './app.scss'

function App({ children }: PropsWithChildren<any>) {
  const { isLogin, isPC, setDevice, user } = useStore()
  const [initialized, setInitialized] = useState(false)

  // 0. 启动时确保 Mock 数据已初始化
  useEffect(() => {
    // 预加载酒店数据，确保 Mock 数据被初始化到 LocalStorage
    hotelService.getHotelsByPage(1, 1).catch(() => {});
  }, []);

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
          Taro.reLaunch({ url: '/pages/admin/login/index' })
        }
      } else {
        // 已登录，确保在管理端页面
        if (!currentRoute.includes('admin')) {
          Taro.reLaunch({ url: '/pages/admin/merchant/index' })
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

  // 2. 管理端页面登录状态检查（每次路由变化时执行）
  useEffect(() => {
    // 等待初始化完成
    if (!initialized) return

    const pages = Taro.getCurrentPages()
    const currentPage = pages[pages.length - 1]
    const currentRoute = currentPage?.route || ''

    // 检查是否是管理端页面（非登录/注册页）
    const isAdminPage = currentRoute.includes('admin') && 
      !currentRoute.includes('login') && 
      !currentRoute.includes('register')

    // 如果是管理端页面但未登录，重定向到登录页
    if (isAdminPage && !isLogin) {
      Taro.reLaunch({ url: '/pages/admin/login/index' })
      return
    }

    // 如果已登录但访问登录/注册页，重定向到对应后台
    if (isLogin && user) {
      if (currentRoute.includes('login') || currentRoute.includes('register')) {
        if (user.role === 'ADMIN') {
          Taro.reLaunch({ url: '/pages/admin/audit/index' })
        } else {
          Taro.reLaunch({ url: '/pages/admin/merchant/index' })
        }
      }
    }
  }, [initialized, isLogin, user])

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
