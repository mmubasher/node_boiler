'use strict';

const funcs = require('../utils/functions');
const responseCodes = require('../../constants/response_codes');
const statusCodes = require('http-status-codes');
const validate = require('../validators/upload');

const s3 = {
  description: 'Upload S3 Image File',
  notes: 'Upload Image File',
  tags: ['api', 'upload'],
  // auth: {
  //   strategy: 'jwt',
  //   scope: ['user', 'admin'],
  // },
  auth: false,
  payload: {
    output: 'stream',
    allow: 'multipart/form-data',
    maxBytes: 10000000, // 10 Mb Limit
    parse: true,
  },
  validate: {
    payload: validate.file,
    failAction: (request, reply, source, err) => {
      return {
        'success': false,
        'statusCode': responseCodes.INVALID_PARAMETERS,
        'message': err.message.replace(/[^a-zA-Z ]/g, ''),
      };
    },
  },
  plugins: {
    'hapi-swagger': {
      payloadType: 'form',
    },
  },
  handler: function (request, reply) {
    funcs.s3Upload(request.payload.file,
      (err, uploads) => {
        if (err) {
          request.log(['error'], err, new Date());
          return {
            'success': false,
            'statusCode': responseCodes.FAILED,
            'message': err.message,
          };
        }
        return {
          'success': true,
          'statusCode': responseCodes.OK,
          'data': uploads,
          'message': responseCodes.getStatusText(responseCodes.OK),
        };
      });
  },
};

const local = {
  description: 'Upload Local Image File',
  notes: 'Upload Image File',
  tags: ['api', 'upload'],
  auth: false,
  payload: {
    output: 'stream',
    allow: 'multipart/form-data',
    maxBytes: 10000000, // 10 Mb Limit
    parse: true,
  },
  validate: {
    payload: validate.file,
    failAction: (request, reply, source, err) => {
      return {
        'success': false,
        'statusCode': responseCodes.INVALID_PARAMETERS,
        'message': err.message.replace(/[^a-zA-Z ]/g, ''),
      };
    },
  },
  plugins: {
    'hapi-swagger': {
      payloadType: 'form',
    },
  },
  handler: function (request, reply) {
    funcs.uploadToLocal(request.payload.file,
      (err, uploads) => {
        if (err) {
          request.log(['error'], err, new Date());
          return {
            'success': false,
            'statusCode': responseCodes.FAILED,
            'message': err.message,
          };
        }
        return {
          'success': true,
          'statusCode': responseCodes.OK,
          'data': uploads,
          'message': responseCodes.getStatusText(responseCodes.OK),
        };
      });
  },
};

module.exports = {
  s3,
  local,
};
