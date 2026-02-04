export default defineAppConfig({
  pages: [
    // 用户端页面 (移动端展示)
    'pages/user/index',
    'pages/user/list',
    'pages/user/detail',
    // 管理端页面 (PC端展示)
    'pages/admin/login',
    'pages/admin/manage',
    'pages/admin/audit'
  ],
  window: {
    backgroundTextStyle: 'light',
    navigationBarBackgroundColor: '#fff',
    navigationBarTitleText: '逸宿酒店管理',
    navigationBarTextStyle: 'black'
  }
})
