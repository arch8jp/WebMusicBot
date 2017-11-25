const guild = $('#id').val()
const socket = io.connect()

console.log('socket', 'emit', 'init', guild)
socket.emit('init', guild)

socket.on('connect', () => {
  console.log('socket', 'connect')
  $('#loading').addClass('completed')
})

$('#q').focus()

$('#search').submit(() => {
  console.log('socket', 'emit', 'q', {
    q: $('#q').val(),
    type: $('select').val(),
  })
  socket.emit('q', {
    q: $('#q').val(),
    type: $('select').val(),
  })
  return false
})

socket.on('list', data => {
  console.log('socket', 'on', 'list', data)
  $('#list').empty()
  if (!Array.isArray(data)) return
  for (const item of data) {
    $('#list').append(`
      <li class="movie">
        <img src="${item.img}" alt="${item.title}">
        <div class="title">${item.title}</div>
        <div id="remove">X</div>
      </li>`
    )
  }
})

socket.on('result', data => {
  console.log('socket', 'on', 'result', data)
  $('#results').empty()
  for (const item of data.items) {
    $('#results').append(`
      <li class="movie">
        <img src="${item.snippet.thumbnails.medium.url}" alt="${item.snippet.title}" data-video-id="${item.id.videoId}">
        <div class="title">${item.snippet.title}</div>
      </li>`)
  }
})

socket.on('err', error => {
  console.log('socket', 'on', 'err', error)
  $('.error').show().text(error).delay(3000).fadeOut()
})

$(document).on('click', '#results>li', function() {
  const target = $(this).find('img')
  const data = {
    id: target.data('video-id'),
    img: target.attr('src'),
    title: target.attr('alt'),
    guild: guild,
  }
  console.log('socket', 'emit', 'add', data)
  socket.emit('add', data)
})

$(document).on('click', '#remove', function() {
  const data = { index: $('#list>li').index($(this).parent()), id: guild }
  console.log('socket', 'emit', 'remove', data)
  socket.emit('remove', data)
})

$('#volume').on('input', function() {
  const data = { volume: $(this).val(), id: guild }
  console.log('socket', 'emit', 'volume', data)
  socket.emit('volume', data)
})

socket.on('volume', volume => {
  console.log('socket', 'on', 'volume', volume)
  $('#volume').val(volume)
})
