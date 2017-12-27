<template>
  <div>
    <v-toolbar color="indigo" dark fixed app>
      <v-toolbar-title>WebMusicBot</v-toolbar-title>
      {{connect_guild}} / {{connect_channel}} に接続中
    </v-toolbar>
  </div>
</template>

<script>

import { mapState,mapMutations,mapActions } from 'vuex'

export default {
  computed: {
    ...mapState([
      'isConnected',
      'connect_guild',
      'connect_channel'
    ])
  }
}
</script>
