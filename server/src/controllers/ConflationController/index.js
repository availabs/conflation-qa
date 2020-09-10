const ConflationService = require('../../services/ConflationService');

const shstMatchParams = require('./shstMatchParams');

const getSharedStreetsMatchParameters = () => shstMatchParams;

const runSharedStreetsMatch = (features, flags) =>
  ConflationService.runMatch(features, flags);

module.exports = {
  getSharedStreetsMatchParameters,
  runSharedStreetsMatch,
};
