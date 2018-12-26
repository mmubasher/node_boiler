'use strict';

const statusCodes = require('http-status-codes');
const authModel = require('../models/auth');
const validator = require('../validators/auth');
const responseCodes = require('../../constants/response_codes');

const login = {
  description: 'Login',
  notes: 'Logs In a user using their email_address and password',
  tags: ['api', 'auth'],
  auth: false,
  handler: function (request, reply) {
    authModel.login(request.payload,
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
        reply(result);
      });
  },
  validate: {
    payload: validator.login,
    failAction: (request, reply, source, err) => {
      reply({
        'success': false,
        'statusCode': responseCodes.INVALID_PARAMETERS,
        'message': err.message.replace(/[^a-zA-Z ]/g, ''),
      }).code(statusCodes.BAD_REQUEST);
    },
  },
  plugins: {
    'hapi-swagger': {
      responses: {
        '200': {
          'description': 'LOGIN_SUCCESSFUL',
        },
        '400': {
          'description': 'INVALID_PARAMS',
        },
      },
      payloadType: 'json',
    },
  },
};
const logout = {
  description: 'Logout User',
  notes: 'This endpoint removes user auth token and device token if any',
  tags: ['api', 'auth'],
  auth: {
    strategy: 'jwt',
    scope: ['user', 'admin'],
  },
  handler: function (request, reply) {
    authModel.logout(request.auth.credentials,
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
        reply(result);
      });
  },
  plugins: {
    'hapi-swagger': {
      responses: {
        '200': {
          'description': 'Request ok',
        },
        '403': {
          'description': 'Insufficient rights',
        },
      },
      payloadType: 'json',
    },
  },
};
module.exports = {
  login,
  logout,
};
