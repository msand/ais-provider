const express = require('express');
const app = express();
const path = require('path');
const conf = require('./conf')
const bodyParser = require('body-parser')
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
app.use(bodyParser.json())

const DATE_REGEXP = /^\d{4}-\d{2}-\d{2}$/

let pollingData = {}

const AisStore = require('./AisStore.js')
const store = new AisStore()

app.post('/ais-data', (req, res) => {
  console.log(req.body)
  if(!DATE_REGEXP.test(req.body.from)) {
    return res.status(400).send({message: "'from' parameter should be formatted 'YYYY-MM-DD'"})
  }
  if(!DATE_REGEXP.test(req.body.to)) {
    return res.status(400).send({message: "'to' parameter should be formatted 'YYYY-MM-DD'"})
  }


  const imo = parseInt(req.body.imo, 10) || null
  const from = moment(req.body.from).startOf('day')
  const to = moment(req.body.to).endOf('day')
  const dataSource = req.body.dataSource || null
  const portUnLocode = req.body.portUnLocode || null

  if(from.isAfter(to)) {
    return res.status(400).send({message: "'from' must be after 'to'"})
  }

  if(moment.duration(from.diff(to)).asMonths() > 6) {
    return res.status(400).send({message: "'from' and 'to' dates must not be more than 6 months appart"})
  }

  store.fetchAISData(imo, dataSource, portUnLocode, from.toDate(), to.toDate(), (err, aisMessages) => {
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

app.get('/ports-of-interest', (req, res) => {
  store.fetchPortsOfInterest((err, portsOfInterest) => {
    if(err) console.error(err)
    res.send(portsOfInterest || [])
  })
})


// migration(() => {
  
  app.listen(conf.server.port, () => {
    console.log(`HTTP server listening on port ${conf.server.port}`)
    pollingData = require('./aisPolling')
  })
// })