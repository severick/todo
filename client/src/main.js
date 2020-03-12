import Vue from 'vue'
import App from './App'
import router from './router';
import { BootstrapVue, IconsPlugin } from 'bootstrap-vue'
import 'bootstrap/dist/css/bootstrap.css'
import 'bootstrap-vue/dist/bootstrap-vue.css'
import './assets/style.scss'

Vue.config.productionTip = false

import VueLogger from 'vuejs-logger';

const options = {
  isEnabled: true,
  logLevel : 'debug',
  stringifyArguments : false,
  showLogLevel : true,
  showMethodName : false,
  separator: '|',
  showConsoleColors: true
};

Vue.use(VueLogger, options);
Vue.use(BootstrapVue);
Vue.use(IconsPlugin);

/* eslint-disable no-new */
new Vue({
  el: '#app',
  router,
  template: '<App/>',
  components: { App }
});