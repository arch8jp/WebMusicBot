const querystring = require('querystring')
const fetch = require('node-fetch')
const { promisify } = require('util')
const getInfo = promisify(require('youtube-dl').getInfo)

module.exports = {
  async api(q) {
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
      url: 'https://www.youtube.com/watch?v=' + item.id.videoId,
      type: 'api',
    }))
  },
  async google(q) {
    return await this.ytdl(q, 'gvsearch')
  },
  async soundcloud(q) {
    return await this.ytdl(q, 'scsearch')
  },
  async ytdl(q, search = 'gvsearch') {
    const args = [['--default-search', search + '10'], {maxBuffer: 1024 * 500}]
    let info = await getInfo(q, ...args)
    if (!Array.isArray(info)) info = [info]
    return info.map(video => ({
      thumbnail: video.thumbnail,
      title: video.title,
      url: video.webpage_url,
      type: 'ytdl',
    }))
  },
}
