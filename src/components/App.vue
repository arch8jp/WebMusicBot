<template>
  <div>
    <v-app>
      <pageheader></pageheader>
      <v-content>
        <v-container>
          <v-alert color="info" icon="info" value="true" transition="scale-transition">
            テスト運用中です<br>
            不具合を発見したらかずえもん(@mcpe_kazuemon)までお問い合わせください
          </v-alert>
          <v-alert color="error" icon="warning" value="true" transition="scale-transition">
            <b>既知の不具合</b><br>
            1回しか押していないのに2曲スキップされる
          </v-alert>
        </v-container>
        <router-view></router-view>
      </v-content>
    </v-app>
  </div>
</template>

<script>
import { mapState,mapMutations,mapActions } from 'vuex'

import pageheader from './Layouts/Header.vue'
//import pagefooter from './Layouts/Footer.vue'

export default {
  components: {
    pageheader,
    //pagefooter
  },
  sockets: {
  },
  methods: {
  },
  computed:{
  }
}
</script>
