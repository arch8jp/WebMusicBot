import Vue from 'vue'
import VueRouter from 'vue-router'
import Vuetify from 'vuetify'
import MainPage from './components/App.vue'
import router from './router'
import socket from './socket'

// Uses
Vue.use(Vuetify);
Vue.use(VueRouter);

// App
new Vue({
  el: '#app',
  router,
  render: h => h(MainPage),
});
