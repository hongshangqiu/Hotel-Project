export default {
  projectName: 'easy-hotel',
  description: '易宿酒店预订平台',
  sourceRoot: 'src',
  outputRoot: 'dist',
  cacheDir: 'node_modules/.taro',
  designWidth: 375,
  deviceRatio: {
    640: 2.34 / 2,
    750: 1,
    828: 1.81 / 2,
    375: 2 / 1,
  },
  framework: 'react',
  weapp: {
    staticDirectory: 'static',
    minifyXML: { compress: true, removeViewBackground: true },
  },
  h5: {
    devServer: {
      port: 10086,
      open: true,
    },
  },
  alias: {
    '@': '/src',
  },
}
