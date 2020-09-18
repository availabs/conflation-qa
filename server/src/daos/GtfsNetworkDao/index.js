const turf = require('@turf/turf');

const db = require('../../services/DatabaseService');

const getGtfsEdgesStmts = {};

const prepareGetGtfsEdgesStmts = (agency) => {
  if (!getGtfsEdgesStmts[agency]) {
    getGtfsEdgesStmts[agency] = db[agency].prepare(`
      SELECT
          feature
        FROM gtfs_network.shape_segments;
    `);
  }

  return getGtfsEdgesStmts[agency];
};

const getGtfsEdges = (agency) => {
  const q = prepareGetGtfsEdgesStmts(agency);
  const features = q
    .raw()
    .all()
    .map(([feature]) => {
      let f = JSON.parse(feature);
      f.properties.matchId = `${f.properties.shape_id}::${f.properties.shape_index}`;
      return f;
    });

  return turf.featureCollection(features);
};

module.exports = { getGtfsEdges };
