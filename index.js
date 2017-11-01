const app = require('http').createServer(handler)
const io = require('socket.io')(app)
const path = require('path')
const fs = require('fs')
const mime = require('mime-types')
const req = require('request')
const ytdl = require('ytdl-core')
const discord = require('discord.js')
const client = new discord.Client()
const config = require('./config')

let isPlaying = false
let list = []
let voiceChannel

io.sockets.on('connection', socket => {
  socket.emit('list', list)

  socket.on('q', data => {
    req.get({
      uri: 'https://www.googleapis.com/youtube/v3/search',
      headers: {'Content-type': 'application/json'},
      qs: {
        q: data,
        part: 'snippet',
        type: 'video',
        key: config.apikey,
        maxResults: 30
      },
      json: true
    }, (error, req, data) => {
      if (error) socket.emit('error', error)
      else socket.emit('result', data)
    })
  })

  socket.on('add', data => {
    list.push(data)

    io.sockets.emit('list', list)
    if (!isPlaying) loop()
  })

  socket.on('allset', data => {
    list = [list[0], ...data]
    io.sockets.emit('list', list)
    if (!isPlaying) loop()
  })
})

function loop () {
  if (!list[0]) return
  isPlaying = true
  voiceChannel.join().then(connnection => {
    const stream = ytdl(`https://www.youtube.com/watch?v=${list[0].id}`, {filter: 'audioonly'})
    connnection.playStream(stream).on('end', () => {
      isPlaying = false
      if (config.loop) list.push(list[0])
      list.shift()
      loop()
      io.sockets.emit('socket', list)
    })
  })
}

client.on('ready', () => {
  console.log(`Logged in as ${client.user.tag}!`)
  voiceChannel = client.channels.get(config.channelId)
  loop()
})

client.login(config.token)

function handler (req, res) {
  const pathname = (req.url === '/') ? 'index.html' : req.url
  const uri = path.join(__dirname, 'app/', pathname)
  fs.readFile(uri, 'binary', (error, data) => {
    if (error && error.code === 'ENOENT') {
      res.writeHead(404)
      res.write('404 Not Found\n')
      res.end()
    } else if (error) {
      res.writeHead(500)
      res.write(error + '\n')
      res.end()
    } else {
      res.writeHead(200, {
        'Content-Type': mime.lookup(pathname)
      })
      res.write(data, 'binary')
      res.end()
    }
  })
}

app.listen(config.port)
