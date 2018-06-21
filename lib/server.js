const express = require('express');
const app = express();
const path = require('path');
const sanitize = require('sanitize-filename')
const port = process.env.PORT || 3000
app.use(express.static('static'))


let pollingStats = {}

const Store = require('./Store.js')
const store = new Store()
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
  res.send(pollingStats)
})

const extractDate = (fileName) =>  fileName.replace(/^(\d{4}-\d{2}-\d{2}).jol$/, '$1')

app.get('/vessel/path/:imo/:name/:date', (req, res) => {
  const filePath = store.securelyResolveFileName(path.join(sanitize(req.params.imo), sanitize(req.params.name), sanitize(req.params.date)) + '.jol')
  console.log('Request for file', filePath)
  let stream = store.readFile(filePath)
  let fileData = ''
  stream.on('error', (err) => {
    console.error(err)
  })
  stream.on('data', (chunk) => {
    fileData = fileData + chunk.toString('utf8')
  })
  stream.on('end', () => {
    let aisData
    if(fileData) {
      aisData = fileData.split('\n')
      aisData = aisData.map((data) => {
        try {
          return data ? JSON.parse(data) : null
        } catch(err) {
          console.error('Could not parse data as JSON in', filePath)
          return null
        }
      }).filter(d => !!d)
    }

    res.send(aisData ? aisData : [])
  })
})


app.listen(port, () => {
  console.log(`HTTP server listening on port ${port}`)
  pollingStats = require('./aisPolling')
})