const express = require('express')
const router = express.Router()

const fetch = require('node-fetch')
const btoa = require('btoa')
const querystring = require('querystring')
const { parsed: env } = require('dotenv').load()
const url = require('url')

const ENDPOINT = 'https://discordapp.com/api/v6/'
const client = {
  id: env.CLIENT_ID,
  secret: env.CLIENT_SECRET,
  callback: url.resolve(env.BASE_URL, '/callback'),
}

router.get('/login', (req, res) => {
  res.redirect('https://discordapp.com/oauth2/authorize'+
    `?response_type=code&client_id=${client.id}&scope=identify`+
    `&redirect_uri=${encodeURIComponent(client.callback)}`)
})

router.get('/logout', (req, res) => {
  req.session.destroy()
  res.redirect('/')
})

router.get('/callback', async (req, res) => {
  if (!req.query.code) return res.redirect('/')
  const token = await getToken(req.query.code)
  const user = await fetch(ENDPOINT + 'users/@me', {
    headers: { 'Authorization': 'Bearer ' + token.access_token },
  }).then(res => res.json())
  req.session.user = user
  res.redirect('/')
})

function getToken(code) {
  const creds = btoa(client.id + ':' + client.secret)
  const qs = querystring.stringify({
    grant_type: 'authorization_code',
    code: code,
    redirect_uri: client.callback,
  })
  return fetch(ENDPOINT + 'oauth2/token?' + qs, {
    method: 'POST',
    headers: { Authorization: 'Basic ' + creds },
  }).then(res => res.json())
}

module.exports = router
