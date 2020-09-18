const db = require('../../services/DatabaseService');

const getAgencies = () => Object.keys(db);

module.exports = { getAgencies };
