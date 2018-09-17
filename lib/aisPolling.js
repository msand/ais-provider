
const Store = require('./Store.js')
const sanitize = require('sanitize-filename')
const store = new Store()

const aisEvents = require('./aisListener.js')(`https://port-chain-ais.herokuapp.com/?key=${process.env.AIS_PROVIDER_SECRET}`)

const pollingStats = {}

aisEvents.on('vessel', (data, requestReceptionDate, done) => {
  const vessel = {
    mmsi: data.MMSI,
    receivedDate: data.TIME,
    receivedDate: data.RECEIVED_AT,
    lon: data.LONGITUDE,
    lat: data.LATITUDE,
    courseOverGround: data.COG,
    speedOverGround: data.SOG,
    trueHeading: data.HEADING,
    navigationStatus: data.NAVSTAT,
    imo: data.IMO,
    vesselName: data.NAME,
    callsign: data.CALLSIGN,
    type: data.TYPE,
    dimensionToBow: data.A,
    dimensionToStern: data.B,
    dimensionToStarboard: data.C,
    dimensionToPort: data.D,
    draft: data.DRAUGHT,
    dst: data.DEST,
    eta: data.ETA
  }

  const dateStr = requestReceptionDate.format('YYYY-MM-DD')
  const fileName =  sanitize(vessel.imo + '', '') + '/' + sanitize(vessel.name || 'unknown', '') + '/' + dateStr + '.jol'

  const vesselStringData = JSON.stringify(vessel)
  store.appendFile(fileName, vesselStringData, (err) => {
    if(err) {
      console.error('[ERROR] Failed to append', vesselStringData)
    } else {
      pollingStats.lastDataSaved = new Date()
    }
    done()
  })

})

module.exports = pollingStats