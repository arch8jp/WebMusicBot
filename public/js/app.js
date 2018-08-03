/* global io: falss, Vue: false */
const socket = io.connect()
const channel = location.href.split('/').pop() // location.hash.slice(1)
let guild

const messages = {
  UNAUTHORIZED: 'ログインしてください',
  INVAILD_CHANNEL: 'チャンネルが正しくありません',
  INVAILD_CHANNEL_TYPE: 'ボイスチャンネルを指定してください',
  CHANNEL_IS_FULL: 'ボイスチャンネルが満員です',
  MISSING_PERMISSION: 'ボイスチャンネルに参加できません',
  USER_NOT_JOINED: 'ボイスチャンネルに参加してください',
  ALREADY_JOINED: 'すでに参加しています',
  UNTREATED_CHANNEL: 'チャンネルが読み込まれていません',
}

const app = new Vue({
  el: '#app',
  data: {
    name: 'WebMusicController',
    loading: false,
    query: '',
    result: [],
    list: [],
    volume: 100,
    error: '',
  },
  directives: {
    focus: {
      inserted: el => el.focus(),
    },
  },
  components: {
    movie: {
      props: ['item', 'result', 'index'],
      methods: {
        add() {
          const data = {
            id: this.item.id,
            thumbnail: this.item.thumbnail,
            title: this.item.title,
            guild,
          }
          console.log('socket', 'emit', 'add', data)
          socket.emit('add', data)
        },
        remove() {
          const data = { index: this.index, id: guild }
          console.log('socket', 'emit', 'remove', data)
          socket.emit('remove', data)
        },
        open() {
          window.open('https://www.youtube.com/watch?v=' + this.item.id, '_blank')
        },
      },
      template: `
        <li class="movie" @click="add" v-if="result === ''" @click.ctrl="open">
          <img :src="item.thumbnail" :alt="item.title">
          <div class="title">{{item.title}}</div>
        </li>
        <li class="movie" v-else>
          <img :src="item.thumbnail" :alt="item.title" @click.ctrl="open">
          <div class="title">{{item.title}}</div>
          <div id="remove" @click="remove">X</div>
        </li>
      `,
    },
  },
  methods: {
    search() {
      console.log('socket', 'emit', 'q', this.query)
      socket.emit('q', this.query)
    },
    setVolume() {
      const data = { volume: this.volume, id: guild }
      // console.log('socket', 'emit', 'volume', data)
      socket.emit('volume', data)
    },
    skip() {
      console.log('socket', 'emit', 'skip', guild)
      socket.emit('skip', guild)
    },
    showError(id) {
      this.error = `${messages[id] || messages.UNKNOWN_ERROR} (${id})`
    },
  },
})

socket.on('connect', () => {
  console.log('socket', 'connect')
  app.loading = false
  console.log('socket', 'emit', 'init', channel)
  socket.emit('init', channel)
})

socket.on('ready', data => {
  console.log('socket', 'on', 'ready', data)
  app.name = data.guild + ' / ' + data.channel
  guild = data.id
})

socket.on('result', data => {
  console.log('socket', 'on', 'result', data)
  app.result = data.items.map(item => ({
    thumbnail: item.snippet.thumbnails.medium.url,
    title: item.snippet.title,
    id: item.id.videoId,
  }))
})

socket.on('list', data => {
  console.log('socket', 'on', 'list', data)
  app.list = data
})

socket.on('err', error => {
  console.log('socket', 'on', 'err', error)
  console.error(error)
  app.showError(error)
})

socket.on('volume', volume => {
  // console.log('socket', 'on', 'volume', volume)
  app.volume = volume
})
