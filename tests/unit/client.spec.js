'use strict';

const sinon = require('sinon');
const Event = require('events');
const { Client } = require('../../lib/client');

describe('message broker', () => {
  let sandbox;

  beforeAll(() => {
    sandbox = sinon.createSandbox();
  });

  afterEach(() => {
    sandbox.restore();
  });

  describe('create instance from message broker constructor', () => {
    afterEach(() => {
      delete Client.instance;
    });

    it('should return instance of Client', () => {
      // act
      const broker = new Client('test-uri');

      // assert
      expect(broker).toBeInstanceOf(Client);
      expect(broker.emitter).toBeInstanceOf(Event);
    });
  });
});
