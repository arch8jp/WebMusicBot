const { parsed: env } = require('dotenv').load()
const Discord = require('discord.js')
const client = new Discord.Client()
const express = require('express')
const app = express()
const server = app.listen(Number(env.SERVER_PORT))
const io = require('socket.io').listen(server)
const session = require('./session')
const search = require('./search')
const VoiceChannel = require('./VoiceChannel')
const guilds = new Discord.Collection()

if (env.DEV) app.use(require('morgan')('dev'))

app.use(session)
app.use(express.static('public'))
app.use(require('./routes/index'))
app.use(require('./routes/discord'))

app.get('/status', (req, res) => res.send({
  guilds: client.guilds.size,
  playing: guilds.filter(e => e.playing).size,
  loadedGuilds: guilds.size,
}))

io.use((socket, next) => {
  session(socket.request, socket.request.res, next)
})

io.sockets.on('connection', socket => {
  const error = id => socket.emit('err', id)
  socket.on('init', id => {
    const session = socket.request.session
    if (!session.user || !session.user.id) return error('UNAUTHORIZED')
    const channel = client.channels.get(id)
    if (!channel) return error('INVAILD_CHANNEL')
    if (channel.type !== 'voice') return error('INVAILD_CAHHNEL_TYPE')
    if (channel.full) return error('CHANNEL_IS_FULL')
    if (!channel.joinable) return error('MISSING_PERMISSION')
    if (!channel.speakable) return error('MISSING_PERMISSION')
    if (!channel.member.has(session.user.id)) return error('USER_NOT_JOINED')
    const guild = channel.guild
    // 同じギルドのボイチャに参加済み
    if (guilds.has(guild.id)) {
      if (guilds.get(guild.id).id !== channel.id) return error('ALREADY_JOINED')
    } else {
      // Botが参加していない
      guilds.set(guild.id, new VoiceChannel(channel, queue => {
        io.to(guild.id).emit('list', queue)
      }))
    }
    socket.join(guild.id)
    socket.emit('volume', guilds.get(guild.id).volume)
    socket.emit('list', guilds.get(guild.id).queue)
    socket.emit('ready', {
      guild: guild.name,
      channel: channel.name,
      id: guild.id,
    })
  })

  socket.on('q', q => {
    search(q).then(data => socket.emit('result', data))
  })

  socket.on('add', data => {
    if (!guilds.has(data.guild)) socket.emit('err', 'UNTREATED_CHANNEL')
    else guilds.get(data.guild).add(data)
      .then(list => io.to(data.guild).emit('list', list))
      .catch(error => socket.emit('err', error))
  })

  socket.on('remove', data => {
    if (!guilds.has(data.id)) socket.emit('err', 'UNTREATED_CHANNEL')
    else guilds.get(data.id).remove(data.index)
      .then(list => io.to(data.id).emit('list', list))
      .catch(error => socket.emit('err', error))
  })

  socket.on('volume', data => {
    if (!guilds.has(data.id)) socket.emit('err', 'UNTREATED_CHANNEL')
    else guilds.get(data.id).setVolume(data.volume)
      .then(volume => socket.broadcast.to(data.id).emit('volume', volume))
      .catch(error => socket.emit('err', error))
  })

  socket.on('skip', id => {
    if (!guilds.has(id)) socket.emit('err', 'UNTREATED_CHANNEL')
    else guilds.get(id).skip()
      .catch(error => socket.emit('err', error))
  })
})

client.on('ready', () => {
  console.log(`Logged in as ${client.user.tag}!`)
})

client.login(env.DISCORD_TOKEN)

process.on('unhandledRejection', console.log)
