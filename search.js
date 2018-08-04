const querystring = require('querystring')
const fetch = require('node-fetch')

module.exports = async q => {
  const qs = '?' + querystring.stringify({
    q: q,
    part: 'snippet',
    type: 'video',
    key: process.env.YOUTUBE_APIKEY,
    maxResults: 10,
  })
  const res = await fetch('https://www.googleapis.com/youtube/v3/search' + qs)
  const json = await res.json()
  return json.items.map(item => ({
    thumbnail: item.snippet.thumbnails.medium.url,
    title: item.snippet.title,
    id: item.id.videoId,
  }))
}
