require('dotenv').config()
const Discord = require('discord.js')
const client = new Discord.Client()
const express = require('express')
const app = express()
const server = app.listen(Number(process.env.SERVER_PORT))
const io = require('socket.io').listen(server)
const session = require('./session')
const path = require('path')
const discord = require('./discord')
const search = require('./search')
const VoiceChannel = require('./VoiceChannel')
const guilds = new Discord.Collection()

app.use(session)

app.get('/status', (req, res) => res.send({
  guilds: client.guilds.size,
  playing: guilds.filter(e => e.playing).size,
  loadedGuilds: guilds.size,
}))

app.get('/controller/:id', (req, res) => {
  res.sendFile('public/controller.html', { root: __dirname })
})

app.use('/', express.static(path.join(__dirname, 'public')))

app.get('/login', discord.login)
app.get('/logout', discord.logout)
app.get('/callback', discord.callback)

io.use((socket, next) => {
  session(socket.request, socket.request.res, next)
})

io.sockets.on('connection', socket => {
  socket.on('init', id => {
    const channel = client.channels.get(id)
    if (!channel || channel.type !== 'voice')
      return socket.emit('err', 'INVAILD_CHANNEL_ID')
    const guild = channel.guild
    // 同じギルドのボイチャに参加済み
    if (guilds.has(guild.id)) {
      io.to(guild.id).emit('list', guilds.has(guild.id).queue)
      if (guilds.get(guild.id).id !== channel.id)
        return socket.emit('err', 'ALREADY_JOINED')
    } else {
      // Botが参加していない
      guilds.set(guild.id, new VoiceChannel(channel, queue => {
        io.to(guild.id).emit('list', queue)
      }))
    }
    socket.join(guild.id)
    socket.emit('volume', guilds.get(guild.id).volume)
    socket.emit('ready', {
      guild: guild.name,
      channel: channel.name,
      id: guild.id,
    })
  })

  socket.on('q', q => {
    search(q)
      .then(data => socket.emit('result', data))
      .catch(error => socket.emit('err', error))
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
})

client.on('ready', () => {
  console.log(`Logged in as ${client.user.tag}!`)
})

client.login(process.env.DISCORD_TOKEN)

process.on('unhandledRejection', console.log)
