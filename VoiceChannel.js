const ytdl = require('ytdl-core')
const youtubedl = require('youtube-dl')

class VoiceChannel {
  constructor(channel, callback) {
    this.id = channel.id
    this.channel = channel
    this.guild = this.channel.guild
    this.queue = []
    this.playing = false
    this.callback = callback
    this.volume = 100
  }

  add(data) {
    return new Promise(resolve => {
      this.queue.push(data)
      resolve(this.queue)
      if (!this.playing) this.loop()
      // TODO: 最大件数とか
    })
  }

  remove(index) {
    return new Promise((resolve, reject) => {
      if (typeof index !== 'number' || index < 1) return reject('INVAILD_VALUE')
      this.queue.splice(index, 1)
      resolve(this.queue)
    })
  }

  loop() {
    this.playing = true
    console.log('playing', this.queue[0].url, this.queue[0].type)
    this.setTitle(this.queue[0].title)
    const stream = this.queue[0].type === 'api'
      ? ytdl(this.queue[0].url, {filter: 'audioonly'})
      : youtubedl(this.queue[0].url, ['-x'])
    this.channel.join().then(connection => {
      this.dispatcher = connection.playStream(stream).on('end', () => {
        this.setTitle()
        this.playing = false
        this.queue.shift()
        this.callback(this.queue)
        if (this.queue[0]) this.loop()
        else this.channel.leave()
      }).on('error', console.error)
      this.dispatcher.setVolume(0.1)
    }).catch(console.error)
  }

  setVolume(volume) {
    return new Promise((resolve, reject) => {
      if (this.volume === volume) return
      if (!this.dispatcher) return reject('NOT_PLAYING_YET')
      // FrontEnd 0  25 50  75 100
      // Discord  0 0.5  1 1.5   2
      // vol * 2 / 100 = vol / 50
      this.dispatcher.setVolume(volume / 1000)
      this.volume = volume
      resolve(volume)
    })
  }

  skip() {
    return new Promise((resolve, reject) => {
      if (!this.dispatcher) return reject('NOT_PLAYING_YET')
      this.dispatcher.end()
      console.log('Skipped')
    })
  }

  setTitle(title) {
    const me = this.guild.me
    if (!me || !me.hasPermission('CHANGE_NICKNAME')) return
    if (!title) return me.setNickname(null)
    if (title.length > 28) title = title.slice(0, 25) + '...'
    me.setNickname(title + 'を再生中')
  }
}

module.exports = VoiceChannel
