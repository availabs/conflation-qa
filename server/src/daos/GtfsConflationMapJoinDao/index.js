/*
    gtfs_conflation_map_join> \d gtfs_matches_conflation_map_join
    +-----+-------------------+---------+---------+------------+----+
    | cid | name              | type    | notnull | dflt_value | pk |
    +-----+-------------------+---------+---------+------------+----+
    | 0   | id                | INTEGER | 0       | <null>     | 1  |
    | 1   | gtfs_shape_id     | INTEGER | 0       | <null>     | 0  |
    | 2   | gtfs_shape_index  | INTEGER | 0       | <null>     | 0  |
    | 3   | conflation_map_id | INTEGER | 0       | <null>     | 0  |
    | 4   | conf_map_pre_len  | REAL    | 0       | <null>     | 0  |
    | 5   | conf_map_post_len | REAL    | 0       | <null>     | 0  |
    | 6   | along_idx         | INTEGER | 0       | <null>     | 0  |
    +-----+-------------------+---------+---------+------------+----+
*/

const _ = require('lodash');

const db = require('../../services/DatabaseService');

const getGtfsConflationMapJoinStmt = db.prepare(`
  SELECT
      a.gtfs_shape_id,
      a.gtfs_shape_index,
      a.conflation_map_id,
      b.conf_map_seg_len,
      a.conf_map_pre_len,
      a.conf_map_post_len,
      a.along_idx,
      b.intersection_len
    FROM gtfs_conflation_map_join.gtfs_matches_conflation_map_join AS a
      INNER JOIN gtfs_conflation_map_join.map_segments_cospatiality AS b
        USING (conflation_map_id)
  ;
`);

const getGtfsConflationMapJoin = () => {
  const result = getGtfsConflationMapJoinStmt.raw().all();

  const matches = result.reduce((acc, row) => {
    const [
      gtfs_shape_id,
      gtfs_shape_index,
      conflation_map_id,
      conf_map_seg_len,
      conf_map_pre_len,
      conf_map_post_len,
      along_idx,
      intersection_len,
    ] = row;

    const gtfsId = `${gtfs_shape_id}::${gtfs_shape_index}`;

    acc[gtfsId] = acc[gtfsId] || [];
    acc[gtfsId][along_idx] = {
      conflation_map_id,
      conf_map_seg_len: _.round(conf_map_seg_len, 3),
      conf_map_pre_len: _.round(conf_map_pre_len, 3),
      conf_map_post_len: _.round(conf_map_post_len, 3),
      intersection_len: _.round(intersection_len, 3),
    };

    return acc;
  }, {});

  return matches;
};

module.exports = { getGtfsConflationMapJoin };
