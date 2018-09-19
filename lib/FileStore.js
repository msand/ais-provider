

const path = require('path')
const fs = require('fs')
const AisStore = require('./AisStore')
const store = new AisStore()


const listVesselImos = (aisHandler) => {
  const files = fs.readdirSync(process.env.DATA_FOLDER)
  files.forEach((imo) => {
    console.log('Processing IMO', imo)
    
    const ais = {
      _path: path.join(process.env.DATA_FOLDER, imo),
      imo: parseInt(imo, 10),
      mmsi: null,
      generatedDate: null,
      receivedDate: null,
      longitude: null,
      latitude: null,
      courseOverGround: null,
      speedOverGround: null,
      rateOfTurn: null,
      positionAccuracy: null,
      trueHeading: null,
      navigationStatus: null,
      vesselName: null,
      callsign: null,
      vesselType: null,
      dimensionToBow: null,
      dimensionToStern: null,
      dimensionToStarboard: null,
      dimensionToPort: null,
      draft: null,
      destination: null,
      eta: null,
      device: null
    }
    aisHandler(ais)
  });
}

const listVesselNames = (aisHandler) => {
  return (ais) => {
    const files = fs.readdirSync(ais._path)
    files.forEach(vesselName => {
      ais.vesselName = vesselName
      aisHandler({...ais, _path: path.join(ais._path, vesselName)})
    })
  }
}
const listVesselDailyFiles = (aisHandler) => {
  return (ais) => {
    const files = fs.readdirSync(ais._path)
    files.forEach(dateString => {
      const fileContent = fs.readFileSync(path.join(ais._path, dateString), 'utf8')
      
      fileContent.split('\n').forEach((line, index) => {
        if(!line) {
          return
        }
        try {
          const aisData = JSON.parse(line)
          ais = {...ais}
          ais.receivedDate = new Date()
          ais.generatedDate = new Date(aisData.time)
          ais.longitude = aisData.lon
          ais.latitude = aisData.lat
          ais.courseOverGround = aisData.cog
          ais.speedOverGround = aisData.sog
          ais.trueHeading = aisData.heading
          ais.navigationStatus = aisData.navstat
          ais.imo = aisData.imo
          ais.vesselName = aisData.name
          ais.callsign = aisData.callsign
          ais.vesselType = aisData.type
          ais.dimensionToBow = aisData.a
          ais.dimensionToStern = aisData.b
          ais.dimensionToStarboard = aisData.c
          ais.dimensionToPort = aisData.d
          ais.draft = aisData.draft
          ais.destination = aisData.dst
          ais.eta = aisData.eta
          aisHandler(ais, )
        } catch(err) {
          console.error('Failed to read JSON in file:', path.join(ais._path, dateString), ', line:', index+1)
        }
      })
    })
  }
}

const saveDataToPostgres = () => {
  let count = 0
  listVesselImos(listVesselNames(listVesselDailyFiles((ais) => {


    count ++
    if(count % 1000 === 0) {
      console.log('**', count)
    }
    // console.log('**', JSON.stringify(ais))
  })))
}

module.exports = {
  saveDataToPostgres
}

saveDataToPostgres()