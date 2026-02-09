import { PropsWithChildren, useState } from 'react'
import { useLaunch, useDidShow } from '@tarojs/taro'
import Layout from './components/Layout'
import './app.scss'

function App({ children }: PropsWithChildren<any>) {

  useLaunch(() => {
    console.log('App launched.')
  })

  const [isLoginPage, setIsLoginPage] = useState(false)

  // 每次页面显示时检测当前页面
  useDidShow(() => {
    const pages = Taro.getCurrentPages()
    if (pages.length > 0) {
      const currentPage = pages[pages.length - 1]
      setIsLoginPage(currentPage?.route?.includes('login') || false)
    }
  })

  // children 是将要渲染的页面
  // 登录页不包裹 Layout，其他页面用 Layout 包裹
  if (isLoginPage) {
    return <>{children}</>
  }

  return (
    <Layout>
      {children}
    </Layout>
  )
}

export default App
