import Vue from 'vue'
import VueRouter from 'vue-router'
import Vuetify from 'vuetify'
import MainPage from './components/App.vue'
import router from './router'
import store from './vuex/store'
import VueSocketio from 'vue-socket.io'
import * as io from 'socket.io-client'

const socket = io.connect()

// Uses
Vue.use(Vuetify)
Vue.use(VueRouter)
Vue.use(VueSocketio, socket)

// App
new Vue({
  el: '#app',
  router,
  render: h => h(MainPage),
  store: store,
})
