'use strict';

const statusCodes = require('http-status-codes');
const model = require('../models/profile');
const validator = require('../validators/profile');

/**
 * @name: Request Forgot Password
 * @description Request for a forgotten password email
 */
const forgotPwd = {
  description: 'Request Forgot Password',
  notes: 'Request for a forgotten password email',
  tags: ['api', 'profile'],
  auth: false,
  handler: function (request, reply) {
    model.forgotPwd(request.payload,
      (err, result) => {
        if (err) {
          request.log(['error'], err, new Date());
          reply({
            'success': false,
            'statusCode': statusCodes.FAILED,
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
          'description': 'ACTION_SUCCESSFUL',
        },
        '400': {
          'description': 'INVALID_PARAMS',
        },
      },
      payloadType: 'json',
    },
  },
  validate: {
    payload: validator.forgotPwd,
    failAction: (request, reply, source, err) => {
      reply({
        success: false,
        message: 'INVALID_PARAMETERS',
        data: err.message.replace(/[^a-zA-Z ]/g, ''),
      }).code(statusCodes.BAD_REQUEST);
    },
  },
};

/**
 * @name: Reset Password
 * @description Request for a forgotten password email
 */
const resetPwd = {
  description: 'Reset Password',
  notes: 'Request for a forgotten password email',
  tags: ['api', 'profile'],
  auth: false,
  handler: function (request, reply) {
    model.resetPwd(request.query, request.payload,
      (err, result) => {
        if (err) {
          request.log(['error'], err, new Date());
          reply({
            'success': false,
            'statusCode': statusCodes.FAILED,
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
          'description': 'ACTION_SUCCESSFUL',
        },
        '400': {
          'description': 'INVALID_PARAMS',
        },
      },
      payloadType: 'json',
    },
  },
  validate: {
    query: validator.resetCode,
    payload: validator.resetPwd,
    failAction: (request, reply, source, err) => {
      reply({
        success: false,
        message: 'INVALID_PARAMETERS',
        data: err.message.replace(/[^a-zA-Z ]/g, ''),
      }).code(statusCodes.BAD_REQUEST);
    },
  },
};

module.exports = {
  forgotPwd,
  resetPwd,
};
