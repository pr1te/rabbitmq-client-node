'use strict';

/**
 * @typedef {Object} ExchangeType
 * @property {Symbol('topic')} TOPIC
 * @property {Symbol('direct')} DIRECT
 * @property {Symbol('fanout')} FANOUT
 * @property {Symbol('x-delayed-message')} DELAYED
 */

/** @type {ExchangeType} */
module.exports.ExchangeType = {
  TOPIC: Symbol('topic'),
  DIRECT: Symbol('direct'),
  FANOUT: Symbol('fanout'),
  DELAYED: Symbol('x-delayed-message'),
};
