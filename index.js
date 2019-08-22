'use strict';

require('dotenv').config();
const Hapi = require('@hapi/hapi');
const config = require('./configs/config');
const auth = require('./src/models/auth');
const routes = require('./src/routes');
const fs = require('fs-extra');
const pagination = require('./configs/pagination');
const log = require('./configs/log');
const documentation = require('./configs/documentation');
const notificationCronJob = require('./src/cron/notifications');

[
  'PORT', 'NODE_ENV', 'PROJECT_NAME', 'SERVER_SECRET_KEY',
  'SERVER_URI', /*, 'DB_HOST', 'DB_USER', /!* 'DB_PWD', *!/
  'DB_NAME', 'MAILER_PROVIDER', 'MAILER_ADDRESS', 'MAILER_PWD',
  'AWS_S3_BUCKET', 'AWS_ACCESS_KEY', 'AWS_SECRET_KEY',
  'FORCE_UPDATE', 'APP_VERSION',
  'TWILIO_SECRET', 'TWILIO_ACC_SID', 'TWILIO_COPILOT_SRV_ID',
  'BRAINTREE_PUBLIC_KEY', 'BRAINTREE_PRIVATE_KEY', 'BRAINTREE_MERCHANT_ID',
  'BRAINTREE_MASTER_MERCHANT',*/
].forEach((name) => {
  if (!process.env[name]) {
    throw new Error(`Environment variable ${name} is missing`);
  }
});

fs.ensureDir(`${config.rootPath}/logs`,
  function (e) {
    if (e) {
      throw e;
    }
  });
fs.ensureDir(`${config.rootPath}/uploads`,
  function (e) {
    if (e) {
      throw e;
    }
  });

const start = async function () {
  const server = Hapi.server({
    port: config.port, routes: {cors: true},
  });

  server.register(
    [
      require('hapi-auth-jwt2'),
      {
        plugin: require('@hapi/good'),
        options: log.goodOptions,
      },
      {
        plugin: require('hapi-swagger'),
        options: documentation.swaggerOptions,
      },
      require('@hapi/inert').plugin,
      require('@hapi/vision').plugin,
      {
        plugin: require('hapi-pagination'),
        options: pagination.options,
      }
    ],
  ).then(() => {

    server.auth.strategy('jwt', 'jwt', {
      key: config.secretKey,
      validate: auth.validate,
      verifyOptions: {algorithms: ['HS256']},
    });

    server.views({
      engines: {
        pug: {
          module: require('pug'),
          compileMode: 'sync', // engine specific
        },
      },
      path: 'views',
      relativeTo: __dirname,
      compileMode: 'async', // global setting
    });

    server.route(routes);

    server.start().then(
      async () => {
        notificationCronJob.start(server, config.notificationCronInterval);
        await server.inject({url: '/', headers: {host: server.info.uri}});
      });
  });
};

process.on('unhandledRejection',
  (err) => {
    console.error(err);
    process.exit(1);
  });

start();

