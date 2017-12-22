const request = require('request')
require('dotenv').config()
const url = require('url')

const client = {
  id: process.env.CLIENT_ID,
  secret: process.env.CLIENT_SECRET,
  callback: url.resolve(process.env.BASE_URL, '/callback'),
}

module.exports = {
  login: (req, res) => {
    res.redirect('https://discordapp.com/oauth2/authorize'+
      `?response_type=code&client_id=${client.id}&scope=identify`+
      `&redirect_uri=${encodeURIComponent(client.callback)}`)
  },
  logout: (req, res) => {
    req.session.destroy()
    res.redirect('/')
  },
  callback: (req, res) => {
    getToken(req.query.code, data => {
      request.get({
        url: 'https://discordapp.com/api/v6/users/@me',
        headers: {
          'Authorization': 'Bearer ' + data.access_token,
        },
        json: true,
      }, (err, response, data) => {
        if (err) console.log(err)
        req.session.user = data
        res.redirect('/')
      })
    })
  },
}

function getToken(code, callback) {
  request({
    url: 'https://discordapp.com/api/v6/oauth2/token',
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    formData: {
      client_id: client.id,
      client_secret: client.secret,
      grant_type: 'authorization_code',
      code: code,
      redirect_uri: client.callback,
    },
    json: true,
  }, (err, res, data) => {
    if (err) console.log(err)
    callback(data)
  })
}
