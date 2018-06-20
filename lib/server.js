const express = require('express');
const app = express();
const path = require('path');
const port = process.env.PORT || 3000
app.use(express.static('static'))
app.listen(port, () => console.log(`HTTP server listening on port ${port}`))


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
  store.listDirectory(path.join(req.params.imo, req.params.name), (err, files) => {
    if(err) console.error(err)
    const dates = files.map(extractDate).filter(f => !!f)
    res.send(dates || [])
  })
})

const extractDate = (fileName) =>  fileName.replace(/^(\d{4}-\d{2}-\d{2}).jol$/, '$1')

app.get('/vessel/path/:imo/:name/:date', (req, res) => {
  const filePath = store.securelyResolveFileName(path.join(req.params.imo, req.params.name, req.params.date) + '.jol')
  console.log('Request for file', filePath)
  let stream = store.readFile(filePath)
  let fileData = ''
  stream.on('error', (err) => {
    console.error(err)
  })
  stream.on('data', (chunk) => {
    fileData = fileData + chunk.toString('utf8')
    console.log('reading data', fileData)
  })
  stream.on('end', () => {
    console.log('DONE reading data')
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


require('./aisPolling')
