'use strict';

const config = require('../../configs/config');
var gateway = require('../../configs/payment_gateway');

const get = {
  description: 'App Config',
  notes: 'App Config',
  tags: ['api', 'config'],
  auth: false,
  handler: function (request, reply) {
    let response = {};
    response.app_version = config.aws.appVersion;
    response.force_app_update = false;
    if (config.forceAppUpdate === 'yes') {
      response.force_app_update = true;
    }
    response.version = config.appVersion;
    response.aws_pool_id = config.aws.poolId;
    response.aws_pool_arn = config.aws.poolArn;
    response.aws_bucket_id = config.aws.bucketId;
    response.aws_img_path = `https://${config.aws.bucketId}.s3.amazonaws.com`;
    gateway.clientToken.generate({"merchantAccountId": config.braintree.merchantId}, function (err, res) {
      if (err) {
        reply(err);
        return;
      }
      response.braintree_client_token = res.clientToken;
      reply(response);
    });
  },
  plugins: {
    'hapi-swagger': {
      responses: {
        '200': {
          'description': 'SUCCESSFUL',
        },
        '400': {
          'description': 'INVALID_PARAMS',
        },
      },
      payloadType: 'json',
    },
  },
};

module.exports = {
  get,
};
