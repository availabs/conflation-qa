#!/usr/bin/env node

const restify = require("restify");
const corsMiddleware = require('restify-cors-middleware')

const {getGtfsEdges} = require('./src/daos/GtfsNetworkDao')

const PORT = process.env.PORT || 8080

const server = restify.createServer();

// https://www.npmjs.com/package/restify-cors-middleware#usage
const cors = corsMiddleware({
  origins: ['*'],
})

server.pre(cors.preflight)
server.use(cors.actual)

server.get("/gtfs-edges", (_req, res, next) => {
  const gtfsEdges = getGtfsEdges()
  res.send(gtfsEdges);
  next();
});

server.listen(PORT, function main() {
  console.log("%s listening at %s", server.name, server.url);
});
