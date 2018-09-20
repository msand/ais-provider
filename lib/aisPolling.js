
const AisStore = require('./AisStore.js')
const store = new AisStore()

const aisEvents = require('./aisListener.js')(`https://port-chain-ais.herokuapp.com/?key=${process.env.AIS_PROVIDER_SECRET}`)

const polling = {
  vessels: [],
  stats: {}
}

aisEvents.on('vessel', (data, requestReceptionDate, done) => {
  const vessel = {
    mmsi: data.MMSI,
    generatedDate: new Date(data.TIME),
    receivedDate: new Date(),
    longitude: data.LONGITUDE,
    latitude: data.LATITUDE,
    courseOverGround: data.COG,
    speedOverGround: data.SOG,
    rateOfTurn: data.ROT,
    positionAccuracy: data.PAC == 1,
    trueHeading: data.HEADING,
    navigationStatus: data.NAVSTAT,
    imo: data.IMO,
    vesselName: data.NAME,
    callsign: data.CALLSIGN,
    vesselType: data.TYPE,
    dimensionToBow: data.A,
    dimensionToStern: data.B,
    dimensionToStarboard: data.C,
    dimensionToPort: data.D,
    draft: data.DRAUGHT,
    destination: data.DEST,
    eta: data.ETA,
    device: data.DEVICE
  }
  polling.vessels.push(vessel)
  store.insertAIS(vessel, (err) => {
    if(err) {
      console.error('[ERROR] Failed to insert', vessel)
    } else {
      polling.stats = {
        lastDataSaved: new Date()
      }
    }
    done()
  })

})

aisEvents.on('clear', () => {
  polling.vessels = []
})

module.exports = polling