const socket = io.connect()

$(() => {
  $('#q').focus()

  $('#search').submit(() => {
    socket.emit('q', $('#q').val())
    return false
  })

  $('#skip').on('click', () => {
    socket.emit('skip')
  })

  socket.on('list', data => {
    $('#list').empty()
    for (const item of data) {
      $('#list').append(
        $('<li>').append(
          $('<img>').attr({
            src: item.img,
            alt: item.title,
            title: item.title,
          })
        )
      )
    }
  })

  socket.on('result', data => {
    $('#results').empty()
    for (const item of data.items) {
      $('#results').append(
        $('<li class="movie">').append(
          $('<img>').attr({
            src: item.snippet.thumbnails.medium.url,
            alt: item.snippet.title,
            title: item.snippet.title,
          }).data('video-id', item.id.videoId)
        )
      )
    }
  })

  $(document).on('click', 'li.movie', e => {
    socket.emit('add', {
      id: $(e.target).data('video-id'),
      img: $(e.target).attr('src'),
      title: $(e.target).attr('alt'),
    })
  })
})
