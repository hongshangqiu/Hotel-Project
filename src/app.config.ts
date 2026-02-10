export default defineAppConfig({
  pages: [
    // 管理端页面 - 登录页作为默认首页
    'pages/admin/login/index',
    'pages/admin/manage/index',
    'pages/admin/audit/index',

    // 用户端页面
    'pages/user/index/index',
    'pages/user/list/index',
    'pages/user/detail/index'
  ],
  window: {
    backgroundTextStyle: 'light',
    navigationBarBackgroundColor: '#fff',
    navigationBarTitleText: '逸宿酒店管理',
    navigationBarTextStyle: 'black'
  }
})