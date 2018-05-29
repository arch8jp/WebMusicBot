const express = require('express')
const router = express.Router()
const path = require('path')

router.get('/controller/:id', (req, res) => {
  res.sendFile('public/controller.html', {
    root: path.join(__dirname, '..'),
  })
})

module.exports = router
