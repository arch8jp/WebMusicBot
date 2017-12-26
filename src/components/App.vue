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
        </v-container>
        <router-view></router-view>
      </v-content>
      <pagefooter></pagefooter>
    </v-app>
  </div>
</template>

<script>
import pageheader from './Layouts/Header.vue'
import pagefooter from './Layouts/Footer.vue'

export default {
  components: {
    pageheader,
    pagefooter
  }
}
</script>
