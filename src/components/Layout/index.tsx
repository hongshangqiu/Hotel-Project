import { PropsWithChildren, useEffect } from 'react'
import Taro from '@tarojs/taro'
import { View, Text } from '@tarojs/components'
import { useStore } from '@/shared/store'
import './index.scss'

interface LayoutProps {
  title?: string
}

const Layout: React.FC<PropsWithChildren<LayoutProps>> = ({ children, title }) => {
  const { isPC, setDevice, logout, user, isLogin } = useStore()

  useEffect(() => {
    const systemInfo = Taro.getSystemInfoSync()
    // 简单判断：H5 环境下如果窗口宽度大于 750 (通常)，则视为 PC
    // 微信小程序环境中，可以使用 deviceInfo.screenWidth
    // 这里做一个通用处理，假设屏幕宽度大于 768px 为 PC
    const width = (systemInfo as any).windowWidth || systemInfo.screenWidth || 375
    const pc = width > 768
    setDevice(pc)
  }, [setDevice])

  const handleLogout = () => {
    logout()
    Taro.reLaunch({ url: '/pages/admin/login/index' })
  }

  const menu = [
    { title: '首页', url: '/pages/admin/manage/index' },
    { title: '酒店管理', url: '/pages/admin/manage/index' }, // 占位
    { title: '审核管理', url: '/pages/admin/audit/index' }
  ]

  // 未登录或登录页，不显示 Layout
  if (!isLogin || !user) {
    return <>{children}</>
  }

  return (
    <View className='layout-container'>
      {isPC ? (
        <View className='pc-layout'>
          <View className='sidebar'>
            <View className='logo'>
              <Text className='logo-text'>逸宿 Admin</Text>
            </View>
            <View className='menu'>
              {menu.map((item, index) => (
                <View
                  key={index}
                  className='menu-item'
                  onClick={() => Taro.navigateTo({ url: item.url })}
                >
                  <Text>{item.title}</Text>
                </View>
              ))}
            </View>
            <View className='footer'>
               <View className='user-info'>
                 <Text className='username'>{user?.username || 'Admin'}</Text>
               </View>
               <View className='logout-btn' onClick={handleLogout}>
                 <Text>退出登录</Text>
               </View>
            </View>
          </View>
          <View className='main-content'>
             <View className='header-bar'>
               <Text className='page-title'>{title || '管理后台'}</Text>
             </View>
             <View className='content-scroll'>
               {children}
             </View>
          </View>
        </View>
      ) : (
        <View className='mobile-layout'>
          <View className='mobile-header'>
            <Text className='mobile-title'>{title || '逸宿'}</Text>
            <View className='mobile-logout' onClick={handleLogout}>退出</View>
          </View>
          <View className='mobile-content'>
            {children}
          </View>
        </View>
      )}
    </View>
  )
}

export default Layout
