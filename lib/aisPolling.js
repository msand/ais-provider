
const AisStore = require('./AisStore.js')
const store = new AisStore()

const aisEvents = require('./exactEarthAISPoller.js')(process.env.EXACT_EARTH_AUTH_KEY)

const polling = {
  vessels: [],
  stats: {}
}

aisEvents.on('vessel', (vessel, requestReceptionDate, done) => {
  if(vessel.source === 'exact_earth_T-AIS') {
    polling.vessels.push(vessel)
  }
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


const aisHubEvents = require('./aisListener.js')(`https://port-chain-ais.herokuapp.com/?key=${process.env.AIS_PROVIDER_SECRET}`)

aisHubEvents.on('vessel', (vessel, requestReceptionDate, done) => {
  store.insertAIS(vessel, (err) => {
    if(err) {
      console.error('[ERROR] Failed to insert', vessel)
    }
    done()
  })

})

aisHubEvents.on('clear', () => {
})

module.exports = polling