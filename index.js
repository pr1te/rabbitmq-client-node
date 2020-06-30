'use strict';

const { Client } = require('./lib/client');
const ExchangeType = require('./lib/exchange-type');

module.exports = new Client();
module.exports.Client = Client;
module.exports.ExchangeType = ExchangeType;
