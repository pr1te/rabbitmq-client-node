/* eslint-disable no-console */

'use strict';

const debug = require('debug')('example-subscriber');
const { Client } = require('../index');

/**
 * Main
 *
 * @return {void}
 */
async function main () {
  const broker = new Client('amqp://rabbitmq-client:xitgmLwmp@localhost:5672');

  await broker.connect();

  broker.on('connected', () => debug('RabbitMQ connection has been established successfully.'));
  broker.on('reconnecting', (error) => debug('Retry to connect RabbitMQ -', error.message));
  broker.on('error', (error) => debug('Unable connection to RabbitMQ -', error.message));
  broker.on('close', () => debug('RabbitMQ connection has closed'));

  process.once('SIGINT', async () => {
    await broker.close();

    process.exit(0);
  });

  process.once('SIGTERM', async () => {
    await broker.close();

    process.exit(0);
  });

  broker.subscribe('example.greeting', {}, (data, message, { ack, nack }) => {
    try {
      debug({ data });

      ack();
    } catch (error) {
      debug(error);
      nack(false);
    }
  });
}

main();
