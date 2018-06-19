
const Store = require('./Store.js')


const store = new Store()
const aisEvents = require('./aisListener.js')(`https://port-chain-ais.herokuapp.com/?key=${process.env.AIS_PROVIDER_SECRET}`)

aisEvents.on('vessel', (data, requestReceptionDate, done) => {
  const vessel = {
    time: data.TIME,
    lon: data.LONGITUDE,
    lat: data.LATITUDE,
    cog: data.COG,
    sog: data.SOG,
    heading: data.HEADING,
    navstat: data.NAVSTAT,
    imo: data.IMO,
    name: data.NAME,
    callsign: data.CALLSIGN,
    type: data.TYPE,
    a: data.A,
    b: data.B,
    c: data.C,
    d: data.D,
    draft: data.DRAUGHT,
    dst: data.DEST,
    eta: data.ETA
  }

  const dateStr = requestReceptionDate.format('YYYY-MM-DD')
  const fileName =  `${vessel.imo}/${dateStr}.jol`

  const vesselStringData = JSON.stringify(vessel)
  store.appendFile(fileName, vesselStringData, done)

})