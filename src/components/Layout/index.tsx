import { PropsWithChildren } from 'react'
import { useStore } from '@/shared/store'

interface LayoutProps {
  title?: string
}

const Layout: React.FC<PropsWithChildren<LayoutProps>> = ({ children, title }) => {
  const { user, isLogin } = useStore()

  // 未登录或登录页，不显示 Layout
  if (!isLogin || !user) {
    return <>{children}</>
  }

  return <>{children}</>
}

export default Layout
