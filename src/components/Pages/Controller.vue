<template>
<div>
  <div v-if="isConnected">
    <v-container grid-list-lg>

      <v-layout row wrap>

        <!-- ステータス表示 (デバッグ用なので後で削除します) -->
        <v-flex xs12>
          <v-card>
            <v-card-title primary-title>
              <h3 class="headline mb-0"><v-icon large>airplay</v-icon> Status</h3>
            </v-card-title>
            <v-card-text>
              ギルドID: {{guild}}<br>
              チャンネル名: {{channel}}<br>
              チャンネルとの接続状態: {{isConnected}}
            </v-card-text>
          </v-card>
        </v-flex>

        <!-- 現在キュー表示 -->

        <v-flex xs12>
          <v-card>

            <v-card-title primary-title>
              <h3 class="headline mb-0"><v-icon large>playlist_play</v-icon> Now Playing</h3>
            </v-card-title>

            <v-list v-if="queue.length > 0">
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

            <!-- キューが空の場合 -->
            <v-card-text class="text-xs-center" v-else>
              <p class="headline">キューに曲がありません</p>
            </v-card-text>

            <v-divider></v-divider>

            <v-container fluid grid-list-md>
              <v-layout row wrap>
                <v-flex xs12 md6>
                  <v-container>
                    <v-slider prepend-icon="volume_up" @min="0" @max="100" @input="vchange()" v-model="volume" thumb-label></v-slider>
                  </v-container>
                </v-flex>
                <v-flex xs12 md6>
                  <v-container>
                    <div class="text-xs-right">
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
                    </div>
                  </v-container>
                </v-flex>
              </v-layout>
            </v-container>

          </v-card>
        </v-flex>

        <v-flex xs12>
          <v-card>

            <v-card-title primary-title>
              <h3 class="headline mb-0"><v-icon large>search</v-icon> Search</h3>
            </v-card-title>

            <v-card-text>
                <v-container fluid grid-list-md>
                  <v-layout row wrap>
                    <v-flex xs8 sm10 lg11>
                      <v-form v-on:submit.prevent="search()">
                      <v-text-field
                        name="search_query"
                        label="検索キーワード"
                        v-model="search_query"
                      ></v-text-field>
                      </v-form>
                    </v-flex>
                    <v-flex xs4 sm2 lg1>
                        <v-btn
                          :loading="searching"
                          :disabled="searching"
                          color="primary"
                          @click="search()"
                          block
                          type="submit"
                        >
                        <v-icon>search</v-icon>
                        </v-btn>
                    </v-flex>
                  </v-layout>
              </v-container>

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
                    <v-btn icon ripple @click="add(item)">
                      <v-icon>playlist_add</v-icon>
                    </v-btn>
                  </v-list-tile-action>
                </v-list-tile>
              </v-list>
            </v-card-text>
          </v-card>
        </v-flex>
      </v-layout>
    </v-container>

    <v-snackbar bottom v-model="snack_visible" :color="snack_color">
      {{ snack_message }}
      <v-btn dark flat @click.native="snack_visible = false">Close</v-btn>
    </v-snackbar>

  </div>
  <div v-else>
    <v-container fluid>
      <v-alert color="warning" icon="priority_high" value="true" transition="scale-transition">
        チャンネルに接続されていません
      </v-alert>
    </v-container>
  </div>
</div>
</template>

<script>
export default {
  data() {
    return {
      isConnected: false,
      guild: '-',
      channel: '-',
      volume: 0,
      snack_visible: false,
      snack_message: 'None',
      snack_color: '',
      search_query: '',
      search_result: {},
      queue: [],
      searching: false,
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
      this.guild = "-"
      this.channel = "-"
      this.snack_message = "接続が切断されました"
      this.snack_color = "error";
      this.snack_visible = true;
      this.isConnected = false;
    },
    ready(data){
      this.guild = data.id;
      this.channel = data.channel;
      this.isConnected = true;
      this.snack_color = "success";
      this.snack_message = '接続しました'
      this.snack_visible = true;
    },
    result(data){
      console.log(data);
      this.search_result = data.items;
      this.searching = false;
    },
    list(data){
      console.log(data);
      this.queue = data;
    },
    volume(volume){
      this.volume = volume
    },
    err(code){
      this.snack_message = code
      this.snack_color = "error";
      this.snack_visible = true;
    }
  },
  methods: {
    search() {
      this.searching = true;
      this.$socket.emit('q', this.search_query)
    },
    add(item) {
      const data = {
        id: item.id.videoId,
        img: item.snippet.thumbnails.medium.url,
        title: item.snippet.title,
        guild: this.guild
      }
      this.$socket.emit('add', data)
      this.snack_message = '曲 '+ data.id + 'を追加しました'
      this.snack_color = "success";
      this.snack_visible = true;
    },
    del(item,key){
      const data = {
        index: key,
        id: this.guild,
      }
      this.snack_message = '曲を削除しました'
      this.snack_color = "success";
      this.snack_visible = true;
      this.$socket.emit('remove', data)
    },
    vchange(){
      const data = {
        volume: this.volume,
        id: this.guild
      }
      this.$socket.emit('volume', data);
    }
  },
  computed: {
  }
}
</script>
