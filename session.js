require('dotenv').config()
const session = require('express-session')
const FileStore = require('session-file-store')(session)

module.exports = session({
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: false,
  rolling: true,
  store: new FileStore(),
  cookie: {
    httpOnly: true,
    secure: false,
    maxage: 1000 * 60 * 60 * 24 * 30,
  },
})
