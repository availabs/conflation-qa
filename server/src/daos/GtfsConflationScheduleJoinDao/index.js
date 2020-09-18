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

const getGtfsConflationScheduleJoinStmts = {};

const prepareGetGtfsConflationScheduleJoinStmt = (agency) => {
  if (!getGtfsConflationScheduleJoinStmts[agency]) {
    getGtfsConflationScheduleJoinStmts[agency] = db[agency].prepare(`
      SELECT
          conflation_map_id,
          aadt,
          aadt_by_peak,
          aadt_by_route
        FROM gtfs_conflation_schedule_join.conflation_map_aadt_breakdown
      ;
    `);
  }
  return getGtfsConflationScheduleJoinStmts[agency];
};

const getGtfsConflationScheduleJoin = (agency) => {
  const q = prepareGetGtfsConflationScheduleJoinStmt(agency);
  const result = q.raw().all();

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
