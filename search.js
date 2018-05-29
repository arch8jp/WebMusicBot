const querystring = require('querystring')
const fetch = require('node-fetch')
const { parsed: env } = require('dotenv').load()

module.exports = q => {
  const qs = querystring.stringify({
    q: q,
    part: 'snippet',
    type: 'video',
    key: env.YOUTUBE_APIKEY,
    maxResults: 10,
  })
  return fetch('https://www.googleapis.com/youtube/v3/search?' + qs)
    .then(res => res.json()).catch(err => console.error(err))
}
