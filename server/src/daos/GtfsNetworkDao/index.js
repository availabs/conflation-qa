const turf = require('@turf/turf');

const db = require('../../services/DatabaseService');

const getGtfsEdgesStmt = db.prepare(`
  SELECT
      feature
    FROM gtfs_network.shape_segments;
`);

const getGtfsEdges = () => {
  const features = getGtfsEdgesStmt
    .raw()
    .all()
    .map(([feature]) => JSON.parse(feature));

  return turf.featureCollection(features);
};

module.exports = { getGtfsEdges };
