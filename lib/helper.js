'use strict';

const { ExchangeType } = require('./exchange-type');

module.exports = {
  /**
   * Construct exchange name
   *
   * @param {string} event
   * @param {import('./exchange-type').ExchangeType} type
   * @return {string}
   */
  constructExchangeName (event, type) {
    const prefix = event.split('.').shift();

    switch (type) {
      case ExchangeType.TOPIC:
        return `${prefix}.tx`;

      case ExchangeType.DIRECT:
        return `${prefix}.dx`;

      case ExchangeType.FANOUT:
        return `${prefix}.fx`;

      case ExchangeType.DELAYED:
        return `${prefix}.xdx`;

      default:
        throw new Error('Only \'topic\', \'direct\', \'fanout\', and \'x-delayed-message\' type are available');
    }
  },
};
