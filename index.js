const config = require('./config.json')
const Discord = require('discord.js')
const client = new Discord.Client()
const express = require('express')
const app = express()
const server = app.listen(config.port)
const io = require('socket.io').listen(server)
const session = require('express-session')
const MongoStore = require('connect-mongo')(session)
const path = require('path')
const discord = require('./discord')
const search = require('./search')
const VoiceChannel = require('./VoiceChannel')
const guilds = new Map()

const sessionMiddleware = session({
  secret: 'secret',
  resave: false,
  saveUninitialized: false,
  rolling : true,
  store: new MongoStore({
    url: 'mongodb://localhost/musicbot',
    ttl: 60 * 60 * 14 * 24,
  }),
  cookie:{
    httpOnly: true,
    secure: false,
    maxage: 1000 * 60 * 60 * 24 * 30,
  },
})

app.set('views', path.join(__dirname, 'views'))
app.set('view engine', 'ejs')

app.use(sessionMiddleware)

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
    name: `${guild.name}🔈${channel.name}`,
    id: guild.id,
  })
})

app.use('/', express.static(path.join(__dirname, 'static')))

app.get('/login', discord.login)
app.get('/logout', discord.logout)
app.get('/callback', discord.callback)

io.use((socket, next) => {
  sessionMiddleware(socket.request, socket.request.res, next)
})

io.sockets.on('connection', socket => {
  socket.on('init', id => {
    socket.join(id)
    socket.emit('list', guilds.get(id).queue || [])
    socket.emit('volume', guilds.get(id).volume)
  })

  socket.on('q', data => {
    if (!search[data.type]) socket.emit('err', `不正な取得方法 - ${data.type}`)
    else search[data.type](data.q)
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
      .then(volume => io.to(data.id).emit('volume', volume))
      .catch(error => socket.emit('err', error))
  })
})

client.on('ready', () => {
  console.log(`Logged in as ${client.user.tag}!`)
})

client.login(config.token)

process.on('unhandledRejection', console.log)
