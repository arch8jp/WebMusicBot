<template>
  <div>
    <v-app>
      <pageheader></pageheader>
      <v-content>
        <v-container fluid>
          <v-alert color="info" icon="info" value="true" transition="scale-transition">
            新ページ テスト運用中です!
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
