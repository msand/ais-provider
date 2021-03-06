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
      console.log('[aishub] pollData now', delayToNextCall)
      fetchData(pollData)
    } else {
      console.log('[aishub] Delaying pollData', delayToNextCall)
      setTimeout(pollData, delayToNextCall)
    }
  }

  const fetchData = (callback) => {
    console.log('[aishub] fetchData')
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
                console.info('[aishub] Vessels fully processed:', processedVesselCount)
                callback()
              }
            }
            setTimeout(() => {
              eventEmitter.emit('clear')
            })
            const requestReceptionDate = moment()
            vessels.forEach((vessel) => {
              if(vessel.MMSI) {
                validVesselCount ++
                setTimeout(() => {
                  eventEmitter.emit('vessel', {
                      mmsi: vessel.MMSI,
                      generatedDate: new Date(vessel.TIME),
                      receivedDate: new Date(),
                      longitude: vessel.LONGITUDE,
                      latitude: vessel.LATITUDE,
                      courseOverGround: vessel.COG && vessel.COG < 1000 ? vessel.COG : null,
                      speedOverGround: vessel.SOG && vessel.SOG < 1000 ? vessel.SOG : null,
                      rateOfTurn: vessel.ROT && vessel.ROT < 1000 ? vessel.ROT : null,
                      positionAccuracy: vessel.PAC == 1,
                      trueHeading: vessel.HEADING && vessel.HEADING < 1000 ? vessel.HEADING : null,
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
                      source: 'aishub'
                    }, requestReceptionDate, onVesselProcessed)
                })
              }
            })
            console.info('[aishub] vessels imported / vessel received', validVesselCount, '/', vessels.length)
          } else if(vessels.length === 0) {
            console.error('[aishub] No vessels to import...')
            callback()

          } else {
            callback()
            console.error('[aishub] Error. Falsy result from the AIS API')
          }
          
        } catch(e) {
          console.error(e)
          callback()
        }
      } else {
        console.error('[aishub] Error', response.statusCode, body)
        callback()
      }
    })
  }

  setTimeout(() => {
    console.info('[aishub] Polling data')
    pollData()
  })
  return eventEmitter
}