'use strict';

const push = require('../utils/push/index');
const responseCodes = require('../../constants/response_codes');
const statusCodes = require('http-status-codes');
const joi = require('joi');

const send = {
  description: 'Test Push Notification',
  notes: 'Test Push Notification',
  tags: ['api', 'push'],
  auth: false,
  handler: function (request, reply) {
    push('[Hapi Boiler] Test Push Notification',
      'Hi, this is a push notification from FR',
      request.payload.device_tokens,
      request.payload.device_type,
      (e, res) => {
        if (e) {
          request.log(['error'], e, new Date());
          reply({
            'success': false,
            'statusCode': responseCodes.FAILED,
            'message': e.message,
          }).code(statusCodes.INTERNAL_SERVER_ERROR);
          return;
        }
        reply(res);
      });
  },
  validate: {
    payload: joi.object({
      device_tokens: joi.array().items(joi.string()).required(),
      device_type: joi.string().valid('android', 'apple').required(),
    }),
    failAction: (request, reply, source, err) => {
      reply({
        'success': false,
        'statusCode': responseCodes.INVALID_PARAMETERS,
        'message': err.message.replace(/[^a-zA-Z ]/g, ''),
      });
    },
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
  send,
};
