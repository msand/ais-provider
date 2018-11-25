const express = require('express');
const app = express();
const path = require('path');
const conf = require('./conf')


function nocache(req, res, next) {
  res.header('Cache-Control', 'private, no-cache, no-store, must-revalidate');
  res.header('Expires', '-1');
  res.header('Pragma', 'no-cache');
  next();
}
app.disable('etag')
app.use(nocache)
app.use(express.static('static'))


let pollingData = {}

const AisStore = require('./AisStore.js')
const store = new AisStore()
app.get('/vessel/list/:imo', (req, res) => {
  console.log('Request for imo', req.params.imo)
  store.listDirectory(req.params.imo, (err, vesselNames) => {
    if(err) console.error(err)
    res.send(vesselNames || [])
  })
})
app.get('/vessel/dates/:imo/:name', (req, res) => {

  console.log('Request for dates', req.params.imo, req.params.name)
  store.listDirectory(path.join(sanitize(req.params.imo), sanitize(req.params.name)), (err, files) => {
    if(err) console.error(err)
    const dates = files.map(extractDate).filter(f => !!f)
    res.send(dates || [])
  })
})


app.get('/stats', (req, res) => {
  res.send(pollingData.stats || {})
})

app.get('/last-vessels-fetched', (req, res) => {
  res.send(pollingData.vessels)
})


// migration(() => {
  
  app.listen(conf.server.port, () => {
    console.log(`HTTP server listening on port ${conf.server.port}`)
    pollingData = require('./aisPolling')
  })
// })