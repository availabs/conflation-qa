#!/usr/bin/env node

const restify = require('restify');
const corsMiddleware = require('restify-cors-middleware');

const { getAgencies } = require('./src/daos/AgenciesDao');
const { getGtfsEdges } = require('./src/daos/GtfsNetworkDao');
const {
  getGtfsMatches,
  getSharedStreetsMatchesScores,
} = require('./src/daos/GtfsOSMNetworkDao');
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

server.get('/list-agencies', (_req, res, next) => {
  const agencies = getAgencies();
  res.send(agencies);
  next();
});

server.get('/:agency/gtfs-edges', (req, res, next) => {
  const { agency } = req.params;
  const gtfsEdges = getGtfsEdges(agency);
  res.send(gtfsEdges);
  next();
});

server.get('/:agency/gtfs-matches', (req, res, next) => {
  const { agency } = req.params;
  const gtfsMatches = getGtfsMatches(agency);
  res.send(gtfsMatches);
  next();
});

server.get('/:agency/gtfs-conflation-map-join', (req, res, next) => {
  const { agency } = req.params;
  const result = getGtfsConflationMapJoin(agency);
  res.send(result);
  next();
});

server.get('/:agency/gtfs-conflation-schedule-join', (req, res, next) => {
  const { agency } = req.params;
  const result = getGtfsConflationScheduleJoin(agency);
  res.send(result);
  next();
});

server.get('/:agency/shst-match-params-descriptions', (req, res, next) => {
  const { agency } = req.params;
  const params = getSharedStreetsMatchParameters(agency);
  res.send(params);
  next();
});

server.post('/:agency/shst-match', async (req, res, next) => {
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

server.get('/:agency/shst-match-scores', (req, res, next) => {
  const { agency } = req.params;
  const scores = getSharedStreetsMatchesScores(agency);
  res.send(scores);
  next();
});

server.listen(PORT, function main() {
  console.log('%s listening at %s', server.name, server.url);
});
