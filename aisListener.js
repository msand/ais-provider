const request = require('request')
const EventEmitter = require('events').EventEmitter
const moment = require('moment')


module.exports = (url) => {

  var lastFetched = 0

  const eventEmitter = new EventEmitter()

  const pollData = () => {
    var delayToNextCall = (1.2 * 60 * 1000) - (Date.now() - lastFetched)
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
      } else if(response && response.statusCode === 200) {
        try {
          var vessels = JSON.parse(body)
          if(vessels) {
            let processedVesselCount = 0
            let validVesselCount = 0

            onVesselProcessed = () => {
              processedVesselCount++
              if(processedVesselCount === validVesselCount) {
                console.info('Vessels fully processed:', processedVesselCount)
                callback()
              }
            }
            const requestReceptionDate = moment()
            vessels.forEach((vessel) => {
              if(vessel.MMSI && vessel.IMO && vessel.IMO > 1000000 && vessel.IMO < 10000000) {
                validVesselCount ++
                setTimeout(() => {
                  eventEmitter.emit('vessel', vessel, requestReceptionDate, onVesselProcessed)
                })
              }
            })
            console.info('vessels imported / vessel received', validVesselCount, '/', vessels.length)
          } else {
            callback()
            console.error('Error. Falsy result from the AIS API')
          }
          
        } catch(e) {
          console.error(e)
          callback()
        }
      } else {
        console.error('Error', response)
        callback()
      }
    })
  }

  setTimeout(() => {
    console.info('POLLING DATA')
    pollData()
  })
  return eventEmitter
}