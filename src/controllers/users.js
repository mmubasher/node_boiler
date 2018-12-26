'use strict';

const statusCodes = require('http-status-codes');
const userModel = require('../models/users');
const validate = require('../validators/users');
const responseCodes = require('../../constants/response_codes');
const userRoles = require('../../constants/user_roles');

const usersList = {
  description: 'Users Listing',
  notes: 'Users Listing',
  tags: ['api', 'user'],
  auth: {
    strategy: 'jwt',
    scope: ['user', 'admin'],
  },
  handler: function (request, reply) {
    /* <-- Pagination block
     * */
    let start = 0;
    const page = request.query.page ? request.query.page : 1;
    if (page === 1) {
      start = 0;
    } else {
      start = request.query.limit * (page - 1);
    }
    /* Pagination block --/> */
    let rq = request.payload;
    rq.limit = request.query.limit;
    rq.start = start;
    userModel.getUsers(rq,
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
        if (result.count) {
          reply.paginate({
            'success': true,
            'data': result.data,
            'statusCode': responseCodes.LISTING_OK,
            'message': responseCodes.getStatusText(responseCodes.LISTING_OK),
          }, result.count, {key: 'data'}).code(statusCodes.OK);
          return;
        }
        reply.paginate({
          'success': false,
          'data': [],
          'statusCode': responseCodes.NO_RECORDS,
          'message': responseCodes.getStatusText(responseCodes.NO_RECORDS),
        }, 0, {key: 'data'}).code(statusCodes.OK);
      });
  },
  validate: {
    query: validate.pagination,
    payload: validate.listing,
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
          'description': 'LISTING_SUCCESSFUL',
        },
        '400': {
          'description': 'INVALID_PARAMS',
        },
      },
      payloadType: 'json',
    },
  },
};

const getUser = {
  description: 'Get User',
  notes: 'Get single user detail by id',
  tags: ['api', 'user'],
  auth: {
    strategy: 'jwt',
    scope: ['user', 'admin'],
  },
  handler: function (request, reply) {
    userModel.getUsers(request.query,
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
        if (result.data[0]) {
          reply({
            'success': true,
            'data': result.data,
            'statusCode': responseCodes.OK,
            'message': responseCodes.getStatusText(responseCodes.OK),
          }).code(statusCodes.OK);
          return;
        }
        reply({
          'success': false,
          'statusCode': responseCodes.NO_RECORDS,
          'message': responseCodes.getStatusText(responseCodes.NO_RECORDS),
        }).code(statusCodes.OK);
      });
  },
  validate: {
    query: validate.userId,
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
          'description': 'LISTING_SUCCESSFUL',
        },
        '400': {
          'description': 'INVALID_PARAMS',
        },
      },
      payloadType: 'json',
    },
  },
};

const update = {
  description: 'Update user',
  notes: 'Update user',
  tags: ['api', 'user'],
  auth: {
    strategy: 'jwt',
    scope: ['user', 'admin'],
  },
  handler: function (request, reply) {
    let userId = 0;
    // if role of user is 'admin' use userId from payload
    if (request.auth.credentials.scope === userRoles.ADMIN) {
      if (request.payload.id) {
        userId = request.payload.id;
      } else {
        reply({
          'success': false,
          'statusCode': responseCodes.INVALID_PARAMETERS,
          'message': 'User id is required',
        }).code(statusCodes.BAD_REQUEST);
        return;
      }
    } else { // if role of user is 'user', use userId from auth token
      userId = request.auth.credentials.id;
    }
    userModel.update(userId, request.payload,
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
    payload: validate.update,
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
          'description': 'ACTION_SUCCESSFUL',
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
  usersList,
  getUser,
  update,
};
