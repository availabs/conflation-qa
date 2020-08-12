const {join, isAbsolute} = require("path");

const Database = require("better-sqlite3");

const [, , DATABASE_DIR_PATH] = process.argv

if (!DATABASE_DIR_PATH) {
  console.error('ERROR: Please specify the path to the GTFS Conflation SQLite databases directory.')
  process.exit(1)
}

const dataDir = isAbsolute(DATABASE_DIR_PATH) ? DATABASE_DIR_PATH : join(process.cwd(), DATABASE_DIR_PATH)

const db = new Database();

[
  "raw_gtfs",
  "geojson_gtfs",
  "gtfs_network",
  "gtfs_osm_network",
].forEach((database) => {
  const dbPath = join(dataDir, database);
  db.exec(`ATTACH DATABASE '${dbPath}' AS ${database};`);
});


module.exports = db;