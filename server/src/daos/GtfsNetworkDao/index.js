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
    .map(([feature]) => {
      let f = JSON.parse(feature);
      f.properties.matchId = `${f.properties.shape_id}::${f.properties.shape_index}`;
      return f;
    });

  return turf.featureCollection(features);
};

module.exports = { getGtfsEdges };
