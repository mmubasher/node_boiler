'use strict';

const braintree = require('braintree');
const config = require('./config');

const publicKey = config.braintree.publicKey;
const privateKey = config.braintree.privateKey;
const merchantId = config.braintree.merchantId;
const env = config.braintree.environment;

const gateway = braintree.connect({
  environment: env === 'production' ? braintree.Environment.Production
    : braintree.Environment.Sandbox,
  merchantId: merchantId,
  publicKey: publicKey,
  privateKey: privateKey,
});

module.exports = gateway;
