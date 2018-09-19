

const path = require('path')
const fs = require('fs')
const AisStore = require('./AisStore')
const moment = require('moment')
const store = new AisStore()

const logTimeStamp = () => {
  return moment().format('YYYY-MM-DD HH:mm.sss')
}

const listVesselImos = () => {
  const files = fs.readdirSync(process.env.DATA_FOLDER)

  const next = () => {
    if(files.length === 0) {
      return;
    }
    const imo = files.pop()
    console.log(logTimeStamp(), 'Processing IMO', imo, '. IMOs left:', files.length)
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
    listVesselNames(ais, next)
  }

  next()
}

const listVesselNames = (ais, cb) => {
  const files = fs.readdirSync(ais._path)

  const next = () => {
    if(files.length === 0) {
      return setTimeout(() => cb())
    }

    const vesselName = files.pop()
    console.log(logTimeStamp(), '  vessel name', vesselName)

    listVesselDailyFiles({...ais, vesselName: vesselName, _path: path.join(ais._path, vesselName)}, next)
  }

  next()
}
const listVesselDailyFiles = (ais, cb) => {
  const files = fs.readdirSync(ais._path)
  const next = () => {
    if(files.length === 0) {
      return setTimeout(() => cb())
    }
    const dateString = files.pop()
    console.log(logTimeStamp(), '    date', dateString)

    processVesselDailyFile(ais, path.join(ais._path, dateString), next)
  }

  next()
}
const processVesselDailyFile = (ais, filePath, cb) => {

  const fileContent = fs.readFileSync(filePath, 'utf8')
  const lines = fileContent.split('\n')
  const totalLinesCount = lines.length
  const next = () => {
    if(lines.length === 0) {
      return setTimeout(() => cb())
    }

    line = lines.pop()
    if(!line) {
      return setTimeout(() => next())
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
      // console.log(ais.imo, ais.vesselName, ais.generatedDate)
      store.insertAIS(ais, next)
    } catch(err) {
      console.error(logTimeStamp(), 'Failed to read JSON in file:', filePath, ', line:', totalLinesCount - lines.length)
      return setTimeout(() => next())
    }

  }

  next()
}

listVesselImos()