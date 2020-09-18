const { statSync } = require('fs');
const { join, isAbsolute, relative } = require('path');

const Database = require('better-sqlite3');

const { sync: globSync } = require('glob');

const [, , DATABASE_DIR_PATH] = process.argv;

if (!DATABASE_DIR_PATH) {
  console.error(
    'ERROR: Please specify the path to the GTFS Conflation SQLite databases directory.',
  );
  process.exit(1);
}

const dataDir = isAbsolute(DATABASE_DIR_PATH)
  ? DATABASE_DIR_PATH
  : join(process.cwd(), DATABASE_DIR_PATH);

const agencies = globSync(join(dataDir, '**/gtfs_conflation_schedule_join'))
  .filter((dbFile) => statSync(dbFile).size)
  .map((dbFile) => relative(dataDir, dbFile).replace(/\/.*/, ''));

const dbs = agencies.reduce((acc, agency) => {
  acc[agency] = new Database();

  [
    'raw_gtfs',
    'geojson_gtfs',
    'gtfs_network',
    'gtfs_osm_network',
    'gtfs_conflation_map_join',
    'gtfs_conflation_schedule_join',
  ].forEach((database) => {
    const dbPath = join(dataDir, agency, 'sqlite', database);
    acc[agency].exec(`ATTACH DATABASE '${dbPath}' AS ${database};`);
  });

  return acc;
}, {});

module.exports = dbs;
