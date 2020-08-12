#!/usr/bin/env node

const restify = require("restify");

const {getGtfsEdges} = require('./src/daos/GtfsEdgesDao')

const PORT = process.env.PORT || 8080

const server = restify.createServer();

server.get("/gtfs-edges", (_req, res, next) => {
  const gtfsEdges = getGtfsEdges()
  res.send(gtfsEdges);
  next();
});

server.listen(PORT, function main() {
  console.log("%s listening at %s", server.name, server.url);
});
