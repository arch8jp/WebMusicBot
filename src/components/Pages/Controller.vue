<template>
<div>
  <div v-if="isConnected">
    <v-container grid-list-lg>

      <v-layout row wrap>

        <!-- 現在キュー表示 -->

        <v-flex xs12>
          <v-card>

            <v-card-title primary-title>
              <h3 class="headline mb-0"><v-icon large>playlist_play</v-icon> Now Playing</h3>
            </v-card-title>

            <v-card-text v-if="queue.length > 0">
              <v-list>
                <v-list-tile avatar v-for="(item, key) in queue" v-bind:key="key">
                  <v-list-tile-avatar>
                    <img v-bind:src="item.img"/>
                  </v-list-tile-avatar>
                  <v-list-tile-content>
                    <v-list-tile-title>{{item.title}}</v-list-tile-title>
                  </v-list-tile-content>
                  <v-list-tile-action>
                    <v-btn icon ripple v-if="key !== 0" @click="del(item,key)">
                      <v-icon>delete</v-icon>
                    </v-btn>
                  </v-list-tile-action>
                </v-list-tile>
              </v-list>
            </v-card-text>

            <v-card-text class="text-xs-center" v-else>
              <p class="headline">キューに曲がありません</p>
              <p class="subheading">もし曲が再生されているのにキューにない場合はご連絡ください</p>
            </v-card-text>

            <v-divider></v-divider>

            <v-card-actions>
              <v-spacer></v-spacer>
              <v-tooltip top>
                <v-btn icon ripple slot="activator" disabled>
                  <v-icon>volume_up</v-icon>
                </v-btn>
                <span>一時停止中</span>
              </v-tooltip>
              <v-tooltip top>
                <v-btn icon ripple slot="activator" disabled>
                  <v-icon>skip_next</v-icon>
                </v-btn>
                <span>実装予定</span>
              </v-tooltip>
              <v-tooltip top>
                <v-btn icon ripple slot="activator" disabled>
                  <v-icon>power_settings_new</v-icon>
                </v-btn>
                <span>実装予定</span>
              </v-tooltip>
            </v-card-actions>

          </v-card>
        </v-flex>

        <v-flex xs12>
          <v-card>

            <v-card-title primary-title>
              <h3 class="headline mb-0"><v-icon large>search</v-icon> Search</h3>
            </v-card-title>

            <v-card-text>
              <v-form v-on:submit.prevent="search()">
              <v-text-field
                name="search_query"
                label="検索キーワード"
                v-model="search_query"
              ></v-text-field>
              </v-form>
            </v-card-text>

            <v-card-actions>
              <v-spacer></v-spacer>
              <v-btn
                @click="clearSearch()"
                color="blue-grey"
                class="white--text"
                flat
              >
                <v-icon>clear</v-icon>
              </v-btn>
              <v-btn
                :loading="searching"
                :disabled="searching"
                color="primary"
                @click="search()"
                type="submit"
              >
                <v-icon>search</v-icon>
              </v-btn>
            </v-card-actions>

            <v-slide-y-transition>
              <v-card-text v-show="search_panel">
                <v-list two-line v-if="search_result.length > 0">
                  <v-list-tile avatar v-for="item in search_result" v-bind:key="item.id.videoId">
                    <v-list-tile-avatar>
                      <img v-bind:src="item.snippet.thumbnails.medium.url"/>
                    </v-list-tile-avatar>
                    <v-list-tile-content>
                      <v-list-tile-title>{{item.snippet.title}}</v-list-tile-title>
                      <v-list-tile-sub-title>by {{ item.snippet.channelTitle }}</v-list-tile-sub-title>
                    </v-list-tile-content>
                    <v-list-tile-action>
                      <v-btn icon ripple :disabled="add_block" @click="add(item)">
                        <v-icon>playlist_add</v-icon>
                      </v-btn>
                    </v-list-tile-action>
                  </v-list-tile>
                </v-list>
              </v-card-text>
            </v-slide-y-transition>
          </v-card>
        </v-flex>
      </v-layout>
    </v-container>
  </div>

  <div v-else>
    <v-container>
      <v-alert color="warning" icon="priority_high" value="true" transition="scale-transition">
        チャンネルに接続されていません
      </v-alert>
    </v-container>
  </div>

</div>
</template>

<script>

import { mapState,mapMutations,mapActions } from 'vuex'

export default {
  data() {
    return {
      volume: 0,
      volume_panel: false,
      search_query: '',
      search_result: {},
      search_panel: false,
      queue: [],
      searching: false,
      add_block: false
    }
  },
  mounted: function() {
    this.$socket.emit('init', this.$route.params.id)
  },
  sockets: {
    connect() {
      /* チャンネル判定があるので廃止 */
    },
    disconnect(){
      this.connect_disconnect()
    },
    ready(data){
      this.connect_ready(data)
    },
    result(data){
      console.log(data);
      this.search_result = data.items;
      this.searching = false;
      this.search_panel = true;
    },
    list(data){
      console.log(data);
      this.queue = data;
    },
    volume(volume){
      this.volume = volume
    },
    err(code){

    }
  },
  methods: {
    ...mapMutations([
      'connect_ready',
      'connect_disconnect'
    ]),
    search() {
      this.searching = true;
      this.$socket.emit('q', this.search_query)
    },
    add(item) {
      const data = {
        id: item.id.videoId,
        img: item.snippet.thumbnails.medium.url,
        title: item.snippet.title,
        guild: this.connect_guildid
      }
      this.$socket.emit('add', data)
      this.add_block = true;
      var self = this
      setTimeout(function(){
        self.add_block = false;
      }, 3000);
    },
    del(item,key){
      const data = {
        index: key,
        id: this.connect_guildid,
      }
      this.$socket.emit('remove', data)
    },
    vchange(){
      const data = {
        volume: this.volume,
        id: this.connect_guildid
      }
      this.$socket.emit('volume', data);
    },
    clearSearch(){
      this.search_panel = false;
      this.search_result = {}
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
