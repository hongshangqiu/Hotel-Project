export default defineApp({
  pages: [
    'pages/index/index',
    'pages/hotel/list/index',
    'pages/hotel/detail/index',
    'pages/auth/login/index',
    'pages/admin/add/index',
    'pages/admin/audit/index'
  ],
  window: {
    backgroundTextStyle: 'light',
    navigationBarBackgroundColor: '#fff',
    navigationBarTitleText: '易宿酒店',
    navigationBarTextStyle: 'black'
  },
  tabBar: {
    color: '#999999',
    selectedColor: '#1890ff',
    backgroundColor: '#ffffff',
    list: [
      {
        pagePath: 'pages/index/index',
        text: '首页',
        iconPath: 'assets/tabbar/home.png',
        selectedIconPath: 'assets/tabbar/home-active.png'
      },
      {
        pagePath: 'pages/hotel/list/index',
        text: '酒店',
        iconPath: 'assets/tabbar/hotel.png',
        selectedIconPath: 'assets/tabbar/hotel-active.png'
      }
    ]
  }
})
