const request = require('request')
const config = require('./config')

module.exports = {
  youtube: q => {
    return new Promise((resolve, reject) => {
      request.get({
        uri: 'https://www.googleapis.com/youtube/v3/search',
        headers: {'Content-type': 'application/json'},
        qs: {
          q: q,
          part: 'snippet',
          type: 'video',
          key: config.apikey,
          maxResults: 30,
        },
        json: true,
      }, (error, req, data) => {
        if (error) reject(error)
        else resolve(data)
      })
    })
  },
}
