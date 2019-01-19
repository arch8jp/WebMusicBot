const { parsed: env } = require('dotenv').load()
const Discord = require('discord.js')
const client = new Discord.Client()
const io = require('socket.io')(Number(env.SERVER_PORT))
const search = require('./search')
const VoiceChannel = require('./VoiceChannel')
const guilds = new Discord.Collection()

io.sockets.on('connection', socket => {
  const emitError = (socketid, id) =>
    socket.emit('socketid', { socketid: socketid, emit: 'err', data: id })

  socket.on('status', ({ socketid: _socketid }) =>
    socket.emit('socketid', {
      socketid: _socketid,
      emit: 'status',
      data: {
        guilds: client.guilds.size,
        playing: guilds.filter(e => e.playing).size,
        loadedGuilds: guilds.size,
      },
    })
  )

  socket.on(
    'init',
    ({ channel: _channel, user: _user, socketid: _socketid }) => {
      if (!_user) return emitError('UNAUTHORIZED')
      const channel = client.channels.get(_channel)
      if (!channel) return emitError('INVAILD_CHANNEL')
      if (channel.type !== 'voice') return emitError('INVAILD_CHANNEL_TYPE')
      if (channel.full) return emitError('CHANNEL_IS_FULL')
      if (!channel.joinable) return emitError('MISSING_PERMISSION')
      if (!channel.speakable) return emitError('MISSING_PERMISSION')
      if (!channel.members.has(_user)) return emitError('USER_NOT_JOINED')
      const guild = channel.guild
      // 同じギルドのボイチャに参加済み
      if (guilds.has(guild.id)) {
        if (guilds.get(guild.id).id !== channel.id)
          return emitError('ALREADY_JOINED')
      } else {
        // Botが参加していない
        guilds.set(
          guild.id,
          new VoiceChannel(channel, queue => {
            // io.to(guild.id).emit('list', queue)
            io.sockets.emit('room', {
              room: guild.id,
              emit: 'list',
              data: queue,
            })
          })
        )
      }
      socket.join(guild.id)
      io.sockets.emit('socketid', {
        socketid: _socketid,
        emit: 'volume',
        data: guilds.get(guild.id).volume,
      })
      io.sockets.emit('socketid', {
        socketid: _socketid,
        emit: 'repeat',
        data: guilds.get(guild.id).repeat,
      })
      io.sockets.emit('socketid', {
        socketid: _socketid,
        emit: 'list',
        data: guilds.get(guild.id).list,
      })
      io.sockets.emit('socketid', {
        socketid: _socketid,
        emit: 'ready',
        data: {
          guild: guild.name,
          channel: channel.name,
          id: guild.id,
        },
      })
    }
  )

  socket.on('q', q => {
    search(q)
      .then(data => socket.emit('result', data))
      .catch(error => emitError(error))
  })

  socket.on('add', data => {
    if (!guilds.has(data.guild)) emitError('UNTREATED_CHANNEL')
    else
      guilds
        .get(data.guild)
        .add(data)
        .then(list =>
          io.sockets.emit('room', {
            room: data.guild,
            emit: 'list',
            data: list,
          })
        ) // io.to(data.guild).emit('list', list))
        .catch(error => emitError(error))
  })

  socket.on('remove', data => {
    if (!guilds.has(data.id)) emitError('UNTREATED_CHANNEL')
    else
      guilds
        .get(data.id)
        .remove(data.index)
        .then(list =>
          io.sockets.emit('room', {
            room: data.guild,
            emit: 'list',
            data: list,
          })
        ) // io.to(data.id).emit('list', list))
        .catch(error => emitError(error))
  })

  socket.on('volume', data => {
    if (!guilds.has(data.id)) emitError('UNTREATED_CHANNEL')
    else
      guilds
        .get(data.id)
        .setVolume(data.volume)
        .then(volume =>
          io.sockets.emit('room', {
            room: data.guild,
            emit: 'volume',
            data: volume,
            selfExclude: true,
          })
        ) // socket.broadcast.to(data.id).emit('volume', volume))
        .catch(error => emitError(error))
  })

  socket.on('repeat', data => {
    if (!guilds.has(data.id)) emitError('UNTREATED_CHANNEL')
    else
      guilds
        .get(data.id)
        .setRepeat(data.repeat)
        .then(repeat =>
          io.sockets.emit('room', {
            room: data.guild,
            emit: 'repeat',
            data: repeat,
            selfExclude: true,
          })
        ) // socket.broadcast.to(data.id).emit('repeat', repeat))
  })

  socket.on('skip', id => {
    if (!guilds.has(id)) emitError('UNTREATED_CHANNEL')
    else
      guilds
        .get(id)
        .skip()
        .catch(error => emitError(error))
  })
})

client.on('ready', () => {
  console.log(`Logged in as ${client.user.tag}!`)
})

client.login(env.DISCORD_TOKEN)

process.on('unhandledRejection', err => console.log(err))
process.on('uncaughtException', err => console.log(err))
