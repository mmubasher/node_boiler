'use strict';

const statusCodes = require('http-status-codes');
const config = require('../../configs/config');
// Controllers
const appConfig = require('../controllers/config');
const respCodes = require('../controllers/response_codes');
const push = require('../controllers/test_push');
const auth = require('../controllers/auth');
const signUp = require('../controllers/sign_up');
const users = require('../controllers/users');
const profile = require('../controllers/profile');
const upload = require('../controllers/upload');
// Webhooks
const braintreeWebhook = require('../webhooks/braintree');

module.exports = [
  /**
   * Base
   * */
  {
    method: 'GET',
    path: '/',
    config: {
      description: 'Server Root',
      notes: 'Hapi Boiler Backend API ',
      tags: ['api', 'base'],
      auth: false,
      handler: function (request, reply) {
        reply({
          'statusCode': statusCodes.OK,
          'message': `Hapi Boiler backend ${config.environment} server api `,
        });
      },
    },
  },
  /**
   * Config
   * */
  {
    method: 'GET',
    path: '/api/config',
    config: appConfig.get,
  },
  /**
   * Test push
   * */
  {
    method: 'POST',
    path: '/api/test-push',
    config: push.send,
  },
  /**
   * Response Codes
   * */
  {
    method: 'GET',
    path: '/api/codes',
    config: respCodes.get,
  },
  /**
   * Auth
   * */
  {
    method: 'POST',
    path: '/api/login',
    config: auth.login,
  },
  {
    method: 'POST',
    path: '/api/sign-up',
    config: signUp.action,
  },
  {
    method: 'GET',
    path: '/api/logout',
    config: auth.logout,
  },
  /**
   * Users
   * */
  {
    method: 'POST',
    path: '/api/users',
    config: users.usersList,
  },
  {
    method: 'GET',
    path: '/api/user',
    config: users.getUser,
  },
  {
    method: 'PUT',
    path: '/api/user',
    config: users.update,
  },
  {
    method: 'GET',
    path: '/api/reset',
    config: {auth: false},
    handler: function (request, reply) {
      let MobileDetect = require('mobile-detect');
      let md = new MobileDetect(request.headers['user-agent']);
      if (md.mobile()) {
        reply.redirect(`favoriterunresetpassword://favoriterun.com/code/${request.query.code}`);
      } else {
        reply.redirect(`${config.adminUrl}/#/reset-password?code=` + request.query.code);
      }
    },
  },
  {
    method: 'PUT',
    path: '/api/reset',
    config: profile.resetPwd,
  },
  /**
   * Uploads
   * */
  {
    method: 'GET',
    path: '/images/{params*}',
    config: {auth: false},
    handler: {
      directory: {
        path: 'static/images',
        listing: false,
      },
    },
  },
  {
    method: 'POST',
    path: '/api/upload/s3',
    config: upload.s3,
  },
  {
    method: 'POST',
    path: '/api/upload/local',
    config: upload.local,
  },
  /**
   * Webhooks
   */
  {
    method: 'POST',
    path: '/api/webhooks/braintree',
    config: braintreeWebhook,
  },
];
