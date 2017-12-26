import Vuex from 'vuex'
import Vue from 'vue'
Vue.use(Vuex)

const state = {
  message: 'こんにちは'
}

const actions = {
  updateAsync ({commit, dispatch, state, rootState, getters, rootGetters}, payload) {
    setTimeout(() => {
      commit('update',payload)
    }, 2000)
  }
}

const getters = {}

const mutations = {
  update (state,payload) {
    state.message = payload;
  }
}

export default new Vuex.Store({
  state,
  getters,
  actions,
  mutations
})
