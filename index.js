const { parsed: env } = require('dotenv').load()
const Discord = require('discord.js')
const client = new Discord.Client()
const express = require('express')
const app = express()
const server = app.listen(Number(env.SERVER_PORT))
const io = require('socket.io').listen(server)
const search = require('./search')
const VoiceChannel = require('./VoiceChannel')
const guilds = new Discord.Collection()

if (env.DEV) app.use(require('morgan')('dev'))

app.use(express.static('public'))

app.get('/status', (req, res) => res.send({
  guilds: client.guilds.size,
  playing: guilds.filter(e => e.playing).size,
  loadedGuilds: guilds.size,
}))

io.sockets.on('connection', socket => {
  const emitError = id => socket.emit('err', id)
  socket.on('init', id => {
    const channel = client.channels.get(id)
    if (!channel) return emitError('INVAILD_CHANNEL')
    if (channel.type !== 'voice') return emitError('INVAILD_CHANNEL_TYPE')
    if (channel.full) return emitError('CHANNEL_IS_FULL')
    if (!channel.joinable) return emitError('MISSING_PERMISSION')
    if (!channel.speakable) return emitError('MISSING_PERMISSION')
    const guild = channel.guild
    // 同じギルドのボイチャに参加済み
    if (guilds.has(guild.id)) {
      if (guilds.get(guild.id).id !== channel.id) return emitError('ALREADY_JOINED')
    } else {
      // Botが参加していない
      guilds.set(guild.id, new VoiceChannel(channel, queue => {
        io.to(guild.id).emit('list', queue)
      }))
    }
    socket.join(guild.id)
    socket.emit('volume', guilds.get(guild.id).volume)
    socket.emit('repeat', guilds.get(guild.id).repeat)
    socket.emit('list', guilds.get(guild.id).queue)
    socket.emit('ready', {
      guild: guild.name,
      channel: channel.name,
      id: guild.id,
    })
  })

  socket.on('q', data => {
    if (!search[data.type]) return emitError('INVAILD_TYPE')
    search[data.type](data.q)
      .then(data => socket.emit('result', data))
      .catch(error => emitError(error))
  })

  socket.on('add', data => {
    if (!guilds.has(data.guild)) emitError('UNTREATED_CHANNEL')
    else guilds.get(data.guild).add(data)
      .then(list => io.to(data.guild).emit('list', list))
      .catch(error => emitError(error))
  })

  socket.on('remove', data => {
    if (!guilds.has(data.id)) emitError('UNTREATED_CHANNEL')
    else guilds.get(data.id).remove(data.index)
      .then(list => io.to(data.id).emit('list', list))
      .catch(error => emitError(error))
  })

  socket.on('volume', data => {
    if (!guilds.has(data.id)) emitError('UNTREATED_CHANNEL')
    else guilds.get(data.id).setVolume(data.volume)
      .then(volume => socket.broadcast.to(data.id).emit('volume', volume))
      .catch(error => emitError(error))
  })

  socket.on('repeat', data => {
    if (!guilds.has(data.id)) emitError('UNTREATED_CHANNEL')
    else guilds.get(data.id).setRepeat(data.repeat)
      .then(repeat => socket.broadcast.to(data.id).emit('repeat', repeat))
  })

  socket.on('skip', id => {
    if (!guilds.has(id)) emitError('UNTREATED_CHANNEL')
    else guilds.get(id).skip()
      .catch(error => emitError(error))
  })
})

client.on('ready', () => {
  console.log(`Logged in as ${client.user.tag}!`)
})

client.login(env.DISCORD_TOKEN)

process.on('unhandledRejection', console.log)
