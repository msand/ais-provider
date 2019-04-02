const request = require('request')
const EventEmitter = require('events').EventEmitter
const moment = require('moment-timezone')
const parse = require('csv-parse')



const buildExactEarthQueryUrl = (timeFrom, authKey) => {
  timeFrom = moment(timeFrom).subtract(5, 'seconds').tz('UTC')
  return `https://services.exactearth.com/gws/wfs\?service\=WFS\&version\=1.1.0\&request\=GetFeature\&typeNames\=exactAIS:LVI\&outputformat\=csv\&filter\=\<Filter\>\<And\>\<PropertyIsGreaterThanOrEqualTo\>\<PropertyName\>ts_insert_utc\</PropertyName\>\<Literal\>${timeFrom.format('YYYYMMDDHHmmss')}\</Literal\>\</PropertyIsGreaterThanOrEqualTo\>\<PropertyIsEqualTo\>\<PropertyName\>vessel_class\</PropertyName\>\<Literal\>A\</Literal\>\</PropertyIsEqualTo\>\</And\>\</Filter\>\&authkey\=${authKey}`
}
const POLLING_INTERVAL_SECONDS = 5 * 60

module.exports = (authKey) => {

  var lastFetched = moment().subtract(POLLING_INTERVAL_SECONDS, 'seconds')

  const eventEmitter = new EventEmitter()

  const pollData = () => {
    var delayToNextCall = (POLLING_INTERVAL_SECONDS * 1000) - (Date.now() - lastFetched.valueOf())
    if(delayToNextCall <= 0) {
      console.log('[exactearth] pollData now', delayToNextCall)
      fetchData(lastFetched, pollData)
    } else {
      console.log('[exactearth] Delaying pollData', delayToNextCall)
      setTimeout(pollData, delayToNextCall)
    }
  }

  const fetchData = (fetchFrom, callback) => {
    console.log('[exactearth] fetchData')
    lastFetched = moment()
    const url = buildExactEarthQueryUrl(fetchFrom, authKey)
    request(url, function (err, response, body) {
      if(err) {
        console.error(err)
        callback()
      } else if(response && response.statusCode === 200) {
        parse(body, {
          delimiter: ',',
          columns: true
        }, (err, aisEntries) => {
          if(err) {
            console.error('[exactearth] Failed to parse CSV when fetching data from URL:', url)
            console.error(err)
            callback()
          } else if(!aisEntries || aisEntries.length === 0) {
            console.error('[exactearth] No data found when parsing CSV from URL:', url)
            callback()
          } else {
            let processedVesselCount = 0
            let validVesselCount = 0

            onVesselProcessed = () => {
              processedVesselCount++
              if(processedVesselCount === validVesselCount) {
                console.info('[exactearth] Vessels fully processed:', processedVesselCount)
                console.info('[exactearth] vessels imported / vessel received', validVesselCount, '/', aisEntries.length)
                callback()
              }
            }
            setTimeout(() => {
              eventEmitter.emit('clear')
            })
            const requestReceptionDate = moment()

            aisEntries.forEach(aisEntry => {
              // aisEntry = {"FID":"6067129253175546634","mmsi":"636015370","imo":"9542295",
              // "vessel_name":"GARDENIA ACE",
              // "callsign":"D5AG5",
              // "vessel_type":"Cargo",
              // "vessel_type_code":"70",
              // "vessel_type_cargo":"",
              // "vessel_class":"A",
              // "length":"180",
              // "width":"30",
              // "flag_country":"Liberia",
              // "flag_code":"636",
              // "destination":"CANWE",
              // "eta":"04031800",
              // "draught":"8.7",
              // "position":"POINT (54.54201166666667 179.68016)",
              // "longitude":"179.68016",
              // "latitude":"54.54201167",
              // "sog":"15.7",
              // "cog":"82.9",
              // "rot":"0",
              // "heading":"83",
              // "nav_status":"Under Way Using Engine",
              // "nav_status_code":"0",
              // "source":"S-AIS",
              // "ts_pos_utc":"20190327085040",
              // "ts_static_utc":"20190327084846",
              // "ts_insert_utc":"20190327085100",
              // "dt_pos_utc":"2019-03-27 08:50:40",
              // "dt_static_utc":"2019-03-27 08:48:46",
              // "dt_insert_utc":"2019-03-27 08:51:00",
              // "vessel_type_main":"Ro Ro Cargo Ship",
              // "vessel_type_sub":"Vehicles Carrier",
              // "message_type":"1",
              // "eeid":"6067129253175546634"}

              if(aisEntry.mmsi) {
                validVesselCount ++
                const imo = parseInt(aisEntry.imo, 10)
                const vessel = {
                  mmsi: parseInt(aisEntry.mmsi, 10),
                  imo: imo || null,
                  vesselName: aisEntry.vessel_name,
                  generatedDate: moment.tz(aisEntry.dt_static_utc, 'UTC').toDate(),
                  receivedDate: moment.tz(aisEntry.dt_insert_utc, 'UTC').toDate(),
                  longitude: parseFloat(aisEntry.longitude),
                  latitude: parseFloat(aisEntry.latitude),
                  courseOverGround: parseFloat(aisEntry.cog),
                  speedOverGround: parseFloat(aisEntry.sog),
                  rateOfTurn: parseFloat(aisEntry.rot),
                  positionAccuracy: true,
                  trueHeading: parseFloat(aisEntry.heading),
                  navigationStatus: parseInt(aisEntry.nav_status_code, 10),
                  callsign: aisEntry.callsign,
                  vesselType: parseInt(aisEntry.vessel_type_code, 10),
                  dimensionToBow: null,
                  dimensionToStern: null,
                  dimensionToStarboard: null,
                  dimensionToPort: null,
                  draft: parseFloat(aisEntry.draught),
                  destination: aisEntry.destination,
                  eta: aisEntry.eta,
                  device: null,
                  source: `exact_earth_${aisEntry.source}`
                }
                // console.log(JSON.stringify(vessel))
                setTimeout(() => {
                  eventEmitter.emit('vessel', vessel, requestReceptionDate, onVesselProcessed)
                })
              }
            })
            // callback()
          }
        })
      } else {
        console.error('[exactearth] Error', response.statusCode, body)
        callback()
      }
    })
  }

  setTimeout(() => {
    console.info('[exactearth] Polling data')
    pollData()
  })
  return eventEmitter
}