'use strict';

const statusCodes = require('http-status-codes');
const model = require('../models/sign_up');
const validator = require('../validators/sign_up');
const responseCodes = require('../../constants/response_codes');

/**
 * @name: Email Sign Up
 * @description sign up a user using mail and password
 */
const action = {
  description: 'Sign Up',
  notes: 'Sign Up using email address and password',
  tags: ['api', 'signup'],
  auth: false,
  handler: function (request, reply) {
    model.signUp(request.payload,
      (err, result) => {
        if (err) {
          request.log(['error'], err, new Date());
          reply({
            'success': false,
            'statusCode': responseCodes.FAILED,
            'message': err.message,
          }).code(statusCodes.INTERNAL_SERVER_ERROR);
          return;
        }
        return reply(result);
      });
  },
  plugins: {
    'hapi-swagger': {
      responses: {
        '200': {
          'description': 'SIGNUP_SUCCESSFUL',
        },
        '400': {
          'description': 'INVALID_PARAMS',
        },
      },
      payloadType: 'json',
    },
  },
  validate: {
    payload: validator.signUp,
    failAction: (request, reply, source, err) => {
      reply({
        message: 'INVALID_PARAMETERS',
        data: err.message.replace(/[^a-zA-Z ]/g, ''),
      }).code(statusCodes.BAD_REQUEST);
    },
  },
};

module.exports = {
  action,
};
