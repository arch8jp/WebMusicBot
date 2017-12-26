import Vue from 'vue'
import Router from 'vue-router'
import Home from '../components/Pages/Home.vue'

Vue.use(Router)

export default new Router({
  mode: 'history',
  routes: [
    {
      path: '/controller/:id',
      component: Home
    }
  ]
})
