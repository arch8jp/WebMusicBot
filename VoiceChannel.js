const ytdl = require('ytdl-core')

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
    console.log(this.queue[0].id)
    const stream = ytdl(this.queue[0].id, {filter: 'audioonly'})
    this.channel.join().then(connection => {
      this.dispatcher = connection.playStream(stream).on('end', () => {
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
}

module.exports = VoiceChannel
