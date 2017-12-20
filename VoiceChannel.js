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
    channel.client.on('voiceStateUpdate', () => {
      const members = channel.members.map(member => !member.user.bot).length
      if (members < 1) this.pause()
      else this.play()
    })
  }

  add(data) {
    return new Promise(resolve => {
      this.queue.push(data)
      resolve(this.queue)
      if (!this.playing || this.queue[0]) this.loop()
      // TODO: 最大件数とか
    })
  }

  remove(index) {
    return new Promise((resolve, reject) => {
      if (typeof index !== 'number' || index === 0) return reject('不正な値')
      this.queue.splice(index, 1)
      resolve(this.queue)
    })
  }

  loop() {
    if (this.playing || !this.queue[0]) return
    this.playing = true
    const stream = ytdl(`https://www.youtube.com/watch?v=${this.queue[0].id}`, {filter: 'audioonly'})
    this.channel.join().then(connection => {
      this.dispatcher = connection.playStream(stream).on('end', () => {
        this.playing = false
        this.queue.shift()
        this.callback(this.queue)
        this.loop()
      })
    }).catch(console.error)
  }

  setVolume(volume) {
    return new Promise((resolve, reject) => {
      if (this.volume === volume) return
      if (!this.dispatcher) return reject('再生していません')
      this.dispatcher.setVolume(volume / 100)
      this.volume = volume
      resolve(volume)
    })
  }

  play() {
    if (!this.dispatcher) return
    if (!this.dispatcher.paused) return
    this.dispatcher.resume()
  }

  pause() {
    if (!this.dispatcher) return
    if (this.dispatcher.paused) return
    this.dispatcher.pause()
  }
}

module.exports = VoiceChannel
