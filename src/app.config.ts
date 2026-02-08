export default defineAppConfig({
  pages: [
    // 用户端页面
    'pages/user/index/index',
    'pages/user/list/index',
    'pages/user/detail/index',
    
    // 管理端页面
    'pages/admin/login/index',
    'pages/admin/manage/index',
    'pages/admin/audit/index'
  ],
  window: {
    backgroundTextStyle: 'light',
    navigationBarBackgroundColor: '#fff',
    navigationBarTitleText: '逸宿酒店管理',
    navigationBarTextStyle: 'black'
  }
})