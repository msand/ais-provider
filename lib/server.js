const express = require('express');
const app = express();
const path = require('path');
const conf = require('./conf')
const moment = require('moment')


function nocache(req, res, next) {
  res.header('Cache-Control', 'private, no-cache, no-store, must-revalidate');
  res.header('Expires', '-1');
  res.header('Pragma', 'no-cache');
  next();
}
app.disable('etag')
app.use(nocache)
app.use(express.static('static'))

const DATE_REGEXP = /^\d{4}-\d{2}-\d{2}$/

let pollingData = {}

const AisStore = require('./AisStore.js')
const store = new AisStore()

app.get('/vessel/path/:imo/:from/:to', (req, res) => {
  let error;
  if(!/^\d{7}$/.test(req.params.imo)) {
    return res.status(400).send({message: "'imo' parameter must be a 7 digits integer"})
  }
  if(!DATE_REGEXP.test(req.params.from)) {
    return res.status(400).send({message: "'from' parameter should be formatted 'YYYY-MM-DD'"})
  }
  if(!DATE_REGEXP.test(req.params.to)) {
    return res.status(400).send({message: "'to' parameter should be formatted 'YYYY-MM-DD'"})
  }

  const imo = parseInt(req.params.imo, 10)
  const from = moment(req.params.from).startOf('day')
  const to = moment(req.params.to).endOf('day')

  if(from.isAfter(to)) {
    return res.status(400).send({message: "'from' must be after 'to'"})
  }

  if(moment.duration(from.diff(to)).asMonths() > 1) {
    return res.status(400).send({message: "'from' and 'to' dates must not be more than 1 month appart"})
  }

  store.fetchVesselPath(imo, from.toDate(), to.toDate(), (err, aisMessages) => {
    if(err) console.error(err)
    res.send(aisMessages || [])
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