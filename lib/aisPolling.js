
const AisStore = require('./AisStore.js')
const store = new AisStore()

const aisEvents = require('./aisListener.js')(`https://port-chain-ais.herokuapp.com/?key=${process.env.AIS_PROVIDER_SECRET}`)

const polling = {
  vessels: [],
  stats: {}
}

aisEvents.on('vessel', (vessel, requestReceptionDate, done) => {
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