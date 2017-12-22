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

app.set('views', path.join(__dirname, 'views'))
app.set('view engine', 'ejs')

app.use(session)

app.get('/status', (req, res) => res.send({
  guilds: client.guilds.size,
  playing: guilds.filter(e => e.playing).size,
  loadedGuilds: guilds.size,
}))

app.get('/controller/:id', (req, res) => {
  const channel = client.channels.get(req.params.id)
  if (!channel || channel.type !== 'voice') return res.send('不正なチャンネルID')
  const guild = channel.guild
  if (guilds.has(guild.id)) {
    // 同じギルドのボイチャに参加済み
    if (guilds.get(guild.id).id !== channel.id)
      return res.send('同ギルド内のボイチャに参加済み')
  } else {
    // Botが参加していない
    guilds.set(guild.id, new VoiceChannel(channel, queue => {
      io.to(guild.id).emit('list', queue)
    }))
  }
  res.render('controller', {
    guild: guild.name,
    channel: channel.name,
    id: guild.id,
  })
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
    socket.join(id)
    socket.emit('list', guilds.get(id).queue || [])
    socket.emit('volume', guilds.get(id).volume)
  })

  socket.on('q', q => {
    search(q)
      .then(data => socket.emit('result', data))
      .catch(error => socket.emit('err', error))
  })

  socket.on('add', data => {
    if (!guilds.has(data.guild)) socket.emit('err', '定義されていないギルド')
    else guilds.get(data.guild).add(data)
      .then(list => io.to(data.guild).emit('list', list))
      .catch(error => socket.emit('err', error))
  })

  socket.on('remove', data => {
    if (!guilds.has(data.id)) socket.emit('err', '定義されていないギルド')
    else guilds.get(data.id).remove(data.index)
      .then(list => io.to(data.id).emit('list', list))
      .catch(error => socket.emit('err', error))
  })

  socket.on('volume', data => {
    if (!guilds.has(data.id)) socket.emit('err', '定義されていないギルド')
    else guilds.get(data.id).setVolume(data.volume)
      .then(volume => socket.broadcast.to(data.id).emit('volume', volume))
      .catch(error => socket.emit('err', error))
  })
})

client.on('ready', () => {
  console.log(`Logged in as ${client.user.tag}!`)
  updateStatus()
})

client.login(process.env.DISCORD_TOKEN)

function updateStatus() {
  const all = client.guilds.size
  const playing = guilds.filter(e => e.playing).size
  client.user.setGame(playing + '/' + all)
  setTimeout(() => updateStatus(), 1000)
}

process.on('unhandledRejection', console.log)
