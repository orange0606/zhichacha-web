import Vue from 'vue'
import App from './App.vue'
import router from './router'
import ElementUI from 'element-ui'
import 'element-ui/lib/theme-chalk/index.css'
import request from './utils/request'
import { maskShopName, maskShopId, maskGoodsName } from './utils/filters'

Vue.use(ElementUI)
Vue.prototype.$http = request
Vue.config.productionTip = false

// 全局过滤器
Vue.filter('maskShopName', maskShopName)
Vue.filter('maskShopId', maskShopId)
Vue.filter('maskGoodsName', maskGoodsName)

new Vue({
  router,
  render: h => h(App)
}).$mount('#app')
