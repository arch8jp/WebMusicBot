<template>
  <div>
    <v-toolbar color="indigo" dark fixed app>
      <v-toolbar-title>WebMusicBot</v-toolbar-title>
      <v-spacer></v-spacer>

      <v-menu offset-y>
        <v-btn icon slot="activator">
          <v-icon>more_vert</v-icon>
        </v-btn>
        <v-card>
          <v-list>
            <v-list-tile>
              <v-list-tile-content>
                <v-list-tile-title v-if="isConnected">
                  {{connect_guild}} / {{connect_channel}} に接続中
                </v-list-tile-title>
                <v-list-tile-title v-else>
                  チャンネルに接続していません
                </v-list-tile-title>
              </v-list-tile-content>
            </v-list-tile>
          </v-list>
        </v-card>
      </v-menu>
    </v-toolbar>
  </div>
</template>

<script>

import { mapState,mapMutations,mapActions } from 'vuex'

export default {
  data() {
    return {
      header_menu:false
    }
  },
  computed: {
    ...mapState([
      'isConnected',
      'connect_guild',
      'connect_guildid',
      'connect_channel'
    ])
  }
}
</script>
