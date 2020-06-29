'use strict';

const Event = require('events');
const amqp = require('amqplib');
const once = require('lodash.once');
const debug = require('debug')('rabbitmq-client');

const { ExchangeType } = require('./exchange-type');
const helper = require('./helper');

/**
 * @typedef {Object} ConnectionOptions
 * @property {number} ConnectionOptions.retryDelay - delay time for auto retry
 *
 * @typedef {Object} PublishOptions
 * @property {import('./exchange-type').ExchangeType} type
 * @property {import('amqplib').Options.Publish} publish
 * @property {import('amqplib').Options.Publish} assertExchange
 *
 * @typedef {Object} SubscribeOptions
 * @property {import('./exchange-type').ExchangeType} type
 * @property {import('amqplib').Options.Consume} subscribe
 * @property {import('amqplib').Options.Publish} assertExchange
 */

class Client {
  /**
   * Constructor
   *
   * @constructor
   * @param {string} uri - rabbitmq uri
   * @param {ConnectionOptions} connOpts - connection options
   */
  constructor (uri, connOpts = {}) {
    this.emitter = new Event();

    /**
     * Default publish options
     *
     * @type {PublishOptions}
     */
    this.defaultPubOpts = { type: ExchangeType.TOPIC };

    /**
     * @type {SubscribeOptions}
     */
    this.defaultSubOpts = { type: ExchangeType.TOPIC };

    // Message broker options
    this.connOpts = { retryDelay: 3000, ...connOpts };
    this.uri = uri;
  }

  /**
   * Initialise instance
   *
   * @private
   * @param {string} uri - rabbitmq uri
   * @return {Promise<any>}
   */
  async connect (uri = this.uri) {
    try {
      this.publisher = await amqp.connect(uri);
      this.subscriber = await amqp.connect(uri);

      this.publisher.on('close', async (error) => {
        this.emitter.emit('reconnecting', error);

        await this.connect(uri);
      });

      this.subscriber.on('close', async (error) => {
        this.emitter.emit('reconnecting', error);

        await this.connect(uri);
      });

      debug('establish connection successfully');
      this.emitter.emit('connected');
    } catch (error) {
      debug('Error to establish connection');
      debug('Retry to connect -', error.message);

      process.nextTick(() => this.emitter.emit('reconnecting', error));
      setTimeout(() => this.connect(uri), this.connOpts.retryDelay);
    }
  }

  /**
   * Adds the listener function
   *
   * @description this is not involve with `amqplib`
   * @param {string} event - event name
   * @param {function} listener - callback listener
   * @return {void}
   */
  on (event, listener) {
    this.emitter.on(event, listener);
  }

  /**
   * Close connection
   *
   * @return {Promise<any>}
   */
  async close () {
    try {
      if (!this.publisher && !this.subscriber) return undefined;

      await Promise.all([this.publisher.close, this.subscriber.close]);

      debug('pub/sub connection has closed.');
      return this.emitter.emit('close');
    } catch (error) {
      debug(error);

      if (error.code === 'ECONNREFUSED') return undefined;
      throw error;
    }
  }

  /**
   * Publish event to message broker
   *
   * @param {string} event - event name
   * @param {any} data
   * @param {PublishOptions} opts
   */
  async publish (event, data, opts) {
    try {
      if (!this.publisher) return undefined;

      const options = { ...this.defaultPubOpts, ...opts };
      const exchange = helper.constructExchangeName(event, options.type);

      const channel = await this.publisher.createChannel();

      await channel.assertExchange(exchange, options.type.description, {
        durable: true,
        autoDelete: true,
        arguments: { ...(options.type === 'x-delayed-message' && { 'x-delayed-type': 'topic' }) },

        // override above setting if assert exchange is provided
        ...options.assertExhange,
      });

      const buffer = Buffer.from(JSON.stringify(data));
      channel.publish(exchange, event, buffer, { persistent: true, ...options.publish });
      debug(`publish '${event}' event`);

      return channel.close();
    } catch (error) {
      debug(error.stack);

      throw error;
    }
  }

  /**
   * Subscribe the event
   *
   * @param {string} event - event name
   * @param {SubscribeOptions} opts
   * @param {function} listener - event subscriber
   */
  async subscribe (event, opts, listener) {
    try {
      if (!this.subscriber) return undefined;

      const options = { ...this.defaultSubOpts, ...opts };
      const exchange = helper.constructExchangeName(event, options.type);

      const channel = await this.subscriber.createChannel();

      await channel.assertExchange(exchange, options.type.description, {
        durable: true,
        autoDelete: true,
        arguments: { ...(options.type === 'x-delayed-message' && { 'x-delayed-type': 'topic' }) },

        // override above setting if assert exchange is provided
        ...options.assertExhange,
      });

      const { queue } = await channel.assertQueue(event, { durable: true });
      channel.bindQueue(queue, exchange, event);

      channel.consume(queue, (message) => {
        const ack = once(() => channel.ack(message));
        const nack = once((requeue) => channel.nack(message, false, requeue));
        const reject = once(() => channel.reject(message, false));
        const data = message ? JSON.parse(message.content.toString()) : undefined;

        if (listener) listener(data, message, { ack, nack, reject });
      });

      return debug(`subscribe '${event}' event`);
    } catch (error) {
      debug(error);

      throw error;
    }
  }
}

module.exports.Client = Client;
