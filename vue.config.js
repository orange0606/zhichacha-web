const { defineConfig } = require('@vue/cli-service')

module.exports = defineConfig({
  transpileDependencies: true,
  // 子路径部署，末尾斜杠必须带上，对应nginx /zhachacha/
  publicPath: '/zhichacha/',
  devServer: {
    port: 8080,
    open: true
  }
})