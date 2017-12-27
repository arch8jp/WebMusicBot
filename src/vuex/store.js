import Vuex from 'vuex'
import Vue from 'vue'
Vue.use(Vuex)

const state = {
  isConnected: false,
  connect_guild: '',
  connect_guildid: '',
  connect_channel: '',
  snack_visible: false,
  snack_message: '',
  snack_color: '',
}

const actions = {
}

const getters = {}

const mutations = {
  connect_ready(state,data){
    state.connect_guild = data.guild;
    state.connect_guildid = data.id;
    state.connect_channel = data.channel;
    state.isConnected = true;
  },
  connect_disconnect(state){
    state.connect_guild = ""
    state.connect_guildid = ""
    state.connect_channel = ""
    state.isConnected = false;
  },
}

export default new Vuex.Store({
  state,
  getters,
  actions,
  mutations,
})
