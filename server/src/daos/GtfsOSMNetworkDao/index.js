/*
  gtfs_osm_network> \d gtfs_shape_shst_match_paths
  +-----+------------------+---------+---------+------------+----+
  | cid | name             | type    | notnull | dflt_value | pk |
  +-----+------------------+---------+---------+------------+----+
  | 0   | gtfs_shape_id    | INTEGER | 1       | <null>     | 1  |
  | 1   | gtfs_shape_index | INTEGER | 1       | <null>     | 2  |
  | 2   | path_index       | INTEGER | 1       | <null>     | 3  |
  | 3   | path_edge_index  | INTEGER | 1       | <null>     | 4  |
  | 4   | shst_match_id    | INTEGER | 0       | <null>     | 0  |
  | 5   | shst_reference   | TEXT    | 0       | <null>     | 0  |
  | 6   | shst_ref_start   | REAL    | 0       | <null>     | 0  |
  | 7   | shst_ref_end     | REAL    | 0       | <null>     | 0  |
  +-----+------------------+---------+---------+------------+----+
*/

const _ = require('lodash');
const db = require('../../services/DatabaseService');

const getGtfsShapeMatchesStmt = db.prepare(`
  SELECT
      (gtfs_shape_id || '::' || gtfs_shape_index) as key,
      '[' ||
        group_concat(
          json_array(
            path_index,
            path_edge_index,
            shst_match_id,
            shst_reference,
            shst_ref_start,
            shst_ref_end
          )
        ) ||
      ']' AS value
    FROM gtfs_osm_network.gtfs_shape_shst_match_paths
    GROUP BY gtfs_shape_id, gtfs_shape_index ;
`);

const getGtfsMatches = () => {
  const result = getGtfsShapeMatchesStmt.raw().all();

  const matches = result.reduce((acc, [k, v]) => {
    acc[k] = _(JSON.parse(v))
      .filter(([, , shst_match_id]) => shst_match_id !== null)
      .sortBy([0, 1])
      .map(
        ([
          ,
          ,
          shst_match_id,
          shst_reference,
          shst_ref_start,
          shst_ref_end,
        ]) => ({
          shst_match_id,
          shst_reference,
          shst_ref_start,
          shst_ref_end,
        }),
      )
      .value();

    return acc;
  }, {});

  return matches;
};

module.exports = { getGtfsMatches };
