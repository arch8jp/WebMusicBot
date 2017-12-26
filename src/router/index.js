import Vue from 'vue'
import Router from 'vue-router'
import Controller from '../components/Pages/Controller.vue'

Vue.use(Router)

export default new Router({
  mode: 'history',
  routes: [
    {
      path: '/controller/:id',
      component: Controller
    }
  ]
})
