

const path = require('path')
const fs = require('fs')
const moment = require('moment')

const logTimeStamp = () => {
  return moment().format('YYYY-MM-DD HH:mm.sss')
}
if(!process.env.EXPORT_DIRECTORY) {
  throw new Error('Missing EXPORT_DIRECTORY env var')
}
const listVesselImos = () => {

  let files;
  try {
    files = fs.readdirSync(process.env.DATA_FOLDER)
  } catch(err) {
    console.error(`Failed to read dir ${process.env.DATA_FOLDER}`)
    console.error(err)
    return db()
  }

  let sqlFileStream;
  const next = () => {
    if(files.length === 0) {
      return;
    }
    if(sqlFileStream) {
      sqlFileStream.write('COMMIT;\n')
      sqlFileStream.end()
    }
    const imo = files.pop()
    sqlFileStream = fs.createWriteStream(path.join(process.env.EXPORT_DIRECTORY, `${imo}.sql`), 'utf8')
    sqlFileStream.write('BEGIN;\n')
    sqlFileStream.on('error', (err) => {
      console.log('SQL write failed for IMO', imo)
      console.error(err)
    })
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
    listVesselNames(ais, sqlFileStream, next)
  }

  next()
}

const listVesselNames = (ais, sqlFileStream, cb) => {
  let files;
  try {
    files = fs.readdirSync(ais._path)
  } catch(err) {
    console.error(`Failed to read dir ${ais._path}`)
    console.error(err)
    return db()
  }

  const next = () => {
    if(files.length === 0) {
      return setTimeout(() => cb())
    }

    const vesselName = files.pop()
    console.log(logTimeStamp(), '  vessel name', vesselName)

    listVesselDailyFiles({...ais, vesselName: vesselName, _path: path.join(ais._path, vesselName)}, sqlFileStream, next)
  }

  next()
}
const listVesselDailyFiles = (ais, sqlFileStream, cb) => {
  let files;
  try {
    files = fs.readdirSync(ais._path)
  } catch(err) {
    console.error(`Failed to read dir ${ais._path}`)
    console.error(err)
    return db()
  }
  const next = () => {
    if(files.length === 0) {
      return setTimeout(() => cb())
    }
    const dateString = files.pop()
    console.log(logTimeStamp(), '    date', dateString)

    if(/\d\d\d\d-\d\d-\d\d\.jol/.test(dateString)) {
      processVesselDailyFile(ais, path.join(ais._path, dateString), sqlFileStream, next)
    } else {
      next()
    }
  }

  next()
}

let previousAisLine

const processVesselDailyFile = (ais, filePath, sqlFileStream, cb) => {
  let fileContent
  try {
    fileContent = fs.readFileSync(filePath, 'utf8')
  } catch(err) {
    console.error(`Failed to open file ${filePath}`)
    console.error(err)
    return db()
  }
  const lines = fileContent.split('\n')
  const totalLinesCount = lines.length
  const next = () => {
    if(lines.length === 0) {
      return setTimeout(() => cb())
    }

    line = lines.pop()

    if(previousAisLine && previousAisLine === line) {
      return next()
    }

    if(!line) {
      return setTimeout(() => next())
    }
    previousAisLine = line
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
      // store.insertAIS(ais, next)
      sqlFileStream.write(`
        INSERT INTO ais (
          mmsi,
          received_date,
          generated_date,
          navigation_status,
          rate_of_turn,
          speed_over_ground,
          position_accuracy,
          longitude,
          latitude,
          course_over_ground,
          true_heading,
          maneuver,
          imo,
          callsign,
          vessel_name,
          vessel_type,
          dimension_to_bow,
          dimension_to_stern,
          dimension_to_starboard,
          dimension_to_port,
          destination,
          eta,
          draft,
          device
        ) VALUES (
            ${ais.mmsi},
            '${moment(ais.receivedDate).format('YYYY-MM-DD HH:mm')}',
            '${moment(ais.generatedDate).format('YYYY-MM-DD HH:mm')}',
            ${ais.navigationStatus},
            ${ais.rateOfTurn},
            ${ais.speedOverGround},
            ${ais.positionAccuracy},
            ${ais.longitude},
            ${ais.latitude},
            ${ais.courseOverGround},
            ${ais.trueHeading},
            '${ais.maneuver ? ais.maneuver : ''}',
            ${ais.imo},
            '${ais.callsign ? ais.callsign : ''}',
            '${ais.vesselName}',
            '${ais.vesselType}',
            ${ais.dimensionToBow},
            ${ais.dimensionToStern},
            ${ais.dimensionToStarboard},
            ${ais.dimensionToPort},
            '${ais.destination ? ais.destination : ''}',
            '${ais.eta ? ais.eta : ''}',
            ${ais.draft},
            '${ais.device ? ais.device : ''}'
        ) ON CONFLICT (mmsi, generated_date) DO NOTHING;`.replace(/\n/g, '') + '\n', 'utf8')
        next()
    } catch(err) {
      console.error(logTimeStamp(), 'Failed to read JSON in file:', filePath, ', line:', totalLinesCount - lines.length)
      return setTimeout(() => next())
    }

  }

  next()
}

listVesselImos()