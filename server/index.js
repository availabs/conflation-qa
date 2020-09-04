#!/usr/bin/env node

const restify = require('restify');
const corsMiddleware = require('restify-cors-middleware');

const { getGtfsEdges } = require('./src/daos/GtfsNetworkDao');
const { getGtfsMatches } = require('./src/daos/GtfsOSMNetworkDao');
const {
  getGtfsConflationMapJoin,
} = require('./src/daos/GtfsConflationMapJoinDao');

const {
  getGtfsConflationScheduleJoin,
} = require('./src/daos/GtfsConflationScheduleJoinDao');

const PORT = process.env.PORT || 8080;

const server = restify.createServer();

// https://www.npmjs.com/package/restify-cors-middleware#usage
const cors = corsMiddleware({
  origins: ['*'],
});

server.pre(cors.preflight);
server.use(cors.actual);

server.get('/gtfs-edges', (_req, res, next) => {
  const gtfsEdges = getGtfsEdges();
  res.send(gtfsEdges);
  next();
});

server.get('/gtfs-matches', (_req, res, next) => {
  const gtfsMatches = getGtfsMatches();
  res.send(gtfsMatches);
  next();
});

server.get('/gtfs-conflation-map-join', (_req, res, next) => {
  const result = getGtfsConflationMapJoin();
  res.send(result);
  next();
});

server.get(
  '/gtfs-conflation-schedule-join/:conflation_map_id',
  (req, res, next) => {
    const { conflation_map_id } = req.params;
    const result = getGtfsConflationScheduleJoin(conflation_map_id);
    res.send(result);
    next();
  },
);

server.listen(PORT, function main() {
  console.log('%s listening at %s', server.name, server.url);
});
