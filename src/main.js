// The Vue build version to load with the `import` command（用“导入”命令加载VUE构建版本）
// (runtime-only or standalone) has been set in webpack.base.conf with an alias.(在WebPACK.BASE.CONF中设置了别名（运行时单独或运行时）。)
import Vue from 'vue'
import App from './App'
import ElementUI from 'element-ui'
import 'element-ui/lib/theme-chalk/index.css'
// import './style/main.css'
// import './style/thirdPartsRewrite.css'
import VueRouter from 'vue-router'
import routes from './router' // 或者 import routes from './router/index'

Vue.use(ElementUI)
Vue.use(VueRouter)
// Vue.use(jquery)
//创建路由
const router = new VueRouter({
  routes
})
Vue.config.productionTip = false

/* eslint-disable no-new */
new Vue({
  el: '#Data',
  router,
  template: '<App/>',
  components: { App }
})