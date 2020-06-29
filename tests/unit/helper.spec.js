'use strict';

const helper = require('../../lib/helper');
const { ExchangeType } = require('../../lib/exchange-type');

describe('helper.js', () => {
  describe('constructExchangeName', () => {
    const event = 'test.unit';

    it(`should return 'test.tx' when provide 'test.unit' as an event name with '${ExchangeType.TOPIC.toString()}'`, () => {
      // act
      const exchange = helper.constructExchangeName(event, ExchangeType.TOPIC);

      // assert
      expect(exchange).toBe('test.tx');
    });

    it(`should return 'test.dx' when provide 'test.unit' as an event name with '${ExchangeType.DIRECT.toString()}'`, () => {
      // act
      const exchange = helper.constructExchangeName(event, ExchangeType.DIRECT);

      // assert
      expect(exchange).toBe('test.dx');
    });

    it(`should return 'test.fx' when provide 'test.unit' as an event name with '${ExchangeType.FANOUT.toString()}'`, () => {
      // act
      const exchange = helper.constructExchangeName(event, ExchangeType.FANOUT);

      // assert
      expect(exchange).toBe('test.fx');
    });

    it(`should return 'test.xdx' when provide 'test.unit' as an event name with '${ExchangeType.DELAYED.toString()}'`, () => {
      // act
      const exchange = helper.constructExchangeName(event, ExchangeType.DELAYED);

      // assert
      expect(exchange).toBe('test.xdx');
    });

    it('should throw error when provide unexpected type (expected type: Symbol(topic), Symbol(direct), Symbol(fanout), Symbol(delayed))', () => {
      // act and assert
      expect(() => helper.constructExchangeName(event, 'another-type'))
        .toThrowError('Only \'topic\', \'direct\', \'fanout\', and \'x-delayed-message\' type are available');
    });
  });
});
