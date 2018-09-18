
const db = require('./db.js')()

function AisStore() {
}

AisStore.prototype.insertAIS = (aisData, cb) => {
  db.insertAIS(
    aisData.mmsi,
    aisData.receivedDate,
    aisData.generatedDate,
    aisData.navigationStatus,
    aisData.rateOfTurn,
    aisData.speedOverGround,
    aisData.positionAccuracy,
    aisData.longitude,
    aisData.latitude,
    aisData.courseOverGround,
    aisData.trueHeading,
    aisData.maneuver,
    aisData.imo,
    aisData.callsign,
    aisData.vesselName,
    aisData.vesselType,
    aisData.dimensionToBow,
    aisData.dimensionToStern,
    aisData.dimensionToStarboard,
    aisData.dimensionToPort,
    aisData.destination,
    aisData.eta,
    aisData.draft,
    aisData.device,
    cb)
}


module.exports = AisStore

