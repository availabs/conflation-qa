#!/usr/bin/env node

const restify = require('restify');
const corsMiddleware = require('restify-cors-middleware');

const { getGtfsEdges } = require('./src/daos/GtfsNetworkDao');
const { getGtfsMatches } = require('./src/daos/GtfsOSMNetworkDao');
const {
  getGtfsConflationMapJoin,
} = require('./src/daos/GtfsConflationMapJoinDao');

const {
  getSharedStreetsMatchParameters,
  runSharedStreetsMatch,
} = require('./src/controllers/ConflationController');

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
server.use(restify.plugins.bodyParser());

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

server.get('/shst-match-params-descriptions', (_req, res, next) => {
  const params = getSharedStreetsMatchParameters();
  res.send(params);
  next();
});

server.post('/shst-match', async (req, res, next) => {
  try {
    console.log(JSON.stringify(req.body, null, 4));

    const { features, flags } = req.body;

    const matches = await runSharedStreetsMatch(features, flags);

    res.send(matches);
    next();
  } catch (err) {
    next(err);
  }
});

server.listen(PORT, function main() {
  console.log('%s listening at %s', server.name, server.url);
});
