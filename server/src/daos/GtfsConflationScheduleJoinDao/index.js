/*
  gtfs_conflation_schedule_join> \d conflation_map_aadt_breakdown
  +-----+-------------------+---------+---------+------------+----+
  | cid | name              | type    | notnull | dflt_value | pk |
  +-----+-------------------+---------+---------+------------+----+
  | 0   | conflation_map_id | INTEGER | 1       | <null>     | 1  |
  | 1   | aadt              | INTEGER | 0       | <null>     | 0  |
  | 2   | aadt_by_peak      | TEXT    | 0       | <null>     | 0  |
  | 3   | aadt_by_route     | TEXT    | 0       | <null>     | 0  |
  +-----+-------------------+---------+---------+------------+----+
*/

const db = require('../../services/DatabaseService');

const getGtfsConflationScheduleJoinStmt = db.prepare(`
  SELECT
      conflation_map_id,
      aadt,
      aadt_by_peak,
      aadt_by_route
    FROM gtfs_conflation_schedule_join.conflation_map_aadt_breakdown
    WHERE ( conflation_map_id = ? )
  ;
`);

const getGtfsConflationScheduleJoin = (conflation_map_id) => {
  const result = getGtfsConflationScheduleJoinStmt
    .raw()
    .all([conflation_map_id]);

  const d = result.reduce((acc, row) => {
    const [conflation_map_id, aadt, aadt_by_peak, aadt_by_route] = row;

    acc[conflation_map_id] = {
      aadt,
      aadt_by_peak: JSON.parse(aadt_by_peak),
      aadt_by_route: JSON.parse(aadt_by_route),
    };

    return acc;
  }, {});

  return d;
};

module.exports = { getGtfsConflationScheduleJoin };
