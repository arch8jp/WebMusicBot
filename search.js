const request = require('request')
require('dotenv').config()

module.exports = q => {
  return new Promise((resolve, reject) => {
    request.get({
      uri: 'https://www.googleapis.com/youtube/v3/search',
      headers: {'Content-type': 'application/json'},
      qs: {
        q: q,
        part: 'snippet',
        type: 'video',
        key: process.env.YOUTUBE_APIKEY,
        maxResults: 10,
      },
      json: true,
    }, (error, req, data) => {
      if (error) reject(error)
      else resolve(data)
    })
  })
}
