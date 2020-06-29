/* eslint-disable no-console */

'use strict';

const debug = require('debug')('example-publisher');
const { Client } = require('../index');

/**
 * Main
 *
 * @return {void}
 */
async function main () {
  const broker = new Client('amqp://rabbitmq-client:xitgmLwmp@localhost:5672');

  broker.on('connected', () => debug('RabbitMQ connection has been established successfully.'));
  broker.on('reconnecting', (error) => debug('Retry to connect RabbitMQ -', error.message));
  broker.on('error', (error) => debug('Unable connection to RabbitMQ -', error.message));
  broker.on('close', () => {
    debug('RabbitMQ connection has closed');

    process.exit(0);
  });

  process.once('SIGINT', async () => {
    await broker.close();

    process.exit(0);
  });

  process.once('SIGTERM', async () => {
    await broker.close();

    process.exit(0);
  });

  await broker.connect();
  await broker.publish('example.greeting', { msg: 'hello subscriber' });

  // close connection and shutdown application
  await broker.close();
}

main();
