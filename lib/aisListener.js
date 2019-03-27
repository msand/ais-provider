const request = require('request')
const EventEmitter = require('events').EventEmitter
const moment = require('moment')


module.exports = (url) => {

  var lastFetched = 0

  const eventEmitter = new EventEmitter()

  const pollData = () => {
    var delayToNextCall = (2 * 60 * 1000) - (Date.now() - lastFetched)
    if(delayToNextCall < 0) {
      lastFetched = Date.now()
      console.log('pollData now', delayToNextCall)
      fetchData(pollData)
    } else {
      console.log('Delaying pollData', delayToNextCall)
      setTimeout(pollData, delayToNextCall)
    }
  }

  const fetchData = (callback) => {
    console.log('fetchData')
    request(url, function (err, response, body) {
      if(err) {
        console.error(err)
        callback()
      } else if(response && response.statusCode === 200) {
        try {
          var vessels = JSON.parse(body)
          if(vessels && vessels.length > 0) {
            let processedVesselCount = 0
            let validVesselCount = 0

            onVesselProcessed = () => {
              processedVesselCount++
              if(processedVesselCount === validVesselCount) {
                console.info('Vessels fully processed:', processedVesselCount)
                callback()
              }
            }
            setTimeout(() => {
              eventEmitter.emit('clear')
            })
            const requestReceptionDate = moment()
            vessels.forEach((vessel) => {
              if(vessel.MMSI && vessel.IMO && vessel.IMO > 1000000 && vessel.IMO < 10000000) {
                validVesselCount ++
                setTimeout(() => {
                  eventEmitter.emit('vessel', {
                      mmsi: vessel.MMSI,
                      generatedDate: new Date(vessel.TIME),
                      receivedDate: new Date(),
                      longitude: vessel.LONGITUDE,
                      latitude: vessel.LATITUDE,
                      courseOverGround: vessel.COG,
                      speedOverGround: vessel.SOG,
                      rateOfTurn: vessel.ROT,
                      positionAccuracy: vessel.PAC == 1,
                      trueHeading: vessel.HEADING,
                      navigationStatus: vessel.NAVSTAT,
                      imo: vessel.IMO,
                      vesselName: vessel.NAME,
                      callsign: vessel.CALLSIGN,
                      vesselType: vessel.TYPE,
                      dimensionToBow: vessel.A,
                      dimensionToStern: vessel.B,
                      dimensionToStarboard: vessel.C,
                      dimensionToPort: vessel.D,
                      draft: vessel.DRAUGHT,
                      destination: vessel.DEST,
                      eta: vessel.ETA,
                      device: vessel.DEVICE,
                      source: vessel.SOURCE
                    }, requestReceptionDate, onVesselProcessed)
                })
              }
            })
            console.info('vessels imported / vessel received', validVesselCount, '/', vessels.length)
          } else if(vessels.length === 0) {
            console.error('No vessels to import...')
            callback()

          } else {
            callback()
            console.error('Error. Falsy result from the AIS API')
          }
          
        } catch(e) {
          console.error(e)
          callback()
        }
      } else {
        console.error('Error', response.statusCode, body)
        callback()
      }
    })
  }

  setTimeout(() => {
    console.info('Polling data')
    pollData()
  })
  return eventEmitter
}