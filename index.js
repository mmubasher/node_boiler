'use strict';

require('dotenv').config();
const hapi = require('hapi');
const server = new hapi.Server();
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
  'SERVER_URI', 'DB_HOST', 'DB_USER', /* 'DB_PWD', */
  'DB_NAME', 'MAILER_PROVIDER', 'MAILER_ADDRESS', 'MAILER_PWD',
  'AWS_S3_BUCKET', 'AWS_ACCESS_KEY', 'AWS_SECRET_KEY',
  'FORCE_UPDATE', 'APP_VERSION',
  'TWILIO_SECRET', 'TWILIO_ACC_SID', 'TWILIO_COPILOT_SRV_ID',
  'BRAINTREE_PUBLIC_KEY', 'BRAINTREE_PRIVATE_KEY', 'BRAINTREE_MERCHANT_ID',
  'BRAINTREE_MASTER_MERCHANT',
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
server.connection({
  port: config.port, labels: ['api'], routes: {cors: true},
});
let registrationErrors = false;
server.register([
  require('hapi-auth-jwt2'),
  require('inert'),
  require('vision'),
  {
    register: require('good'),
    options: log.goodOptions,
  },
  {
    register: require('hapi-swagger'),
    options: documentation.swaggerOptions,
  },
], function (err) {
  if (err) {
    registrationErrors = true;
    throw err;
  }
});
server.auth.strategy('jwt', 'jwt', 'optional', {
  key: config.secretKey,
  validateFunc: auth.validate,
  verifyOptions: {algorithms: ['HS256']},
});
server.route(routes);
server.register([
  {
    register: require('hapi-pagination'),
    options: pagination.options,
  },
  {
    register: require('hapi-sanitize-payload'),
    options: {pruneMethod: 'delete'},
  },
], function (err) {
  if (err) {
    registrationErrors = true;
    throw err;
  }
});
if (!registrationErrors) {
  server.start(function () {
    notificationCronJob.start(server, config.notificationCronInterval);
    server.inject({url: '/', headers: {host: server.info.uri}});
  });
}
module.exports = server; // TODO: remove after usage
