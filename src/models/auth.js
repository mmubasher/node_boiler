'use strict';

const config = require('../../configs/config');
const userModel = require('./users');
const db = require('../database/index');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const knex = require('knex')({
  client: 'mysql',
});
const async = require('async');
const responseCodes = require('../../constants/response_codes');
const userRoles = require('../../constants/user_roles');
const statuses = require('../../constants/statuses');

/**
 * @name validate
 * @description Validates jwt token of a User/ Admin
 */
const validate = function (decoded, request, callback) {
  let query = knex
    .select('id', 'role')
    .from('users')
    .where('id', decoded.id)
    .where('auth_token', request.headers.authorization)
    .where('role', decoded.scope)
    .where('status', statuses.ACTIVE);
  db.mysql.query(query.toString(),
    (err, result) => {
      if (err) {
        callback(err);
        return;
      }
      if (result.length) {
        callback(null, true);
        return;
      }
      return callback(null, false);
    });
};
/**
 * @name login
 * @description login a user
 */
const login = function (payload, callback) {
  let funcs = {};
  funcs.user = function (cb) {
    userModel.getUsers(payload,
      (err, result) => {
        if (err) {
          cb(err);
          return;
        }
        cb(null, result.data[0]);
      });
  };
  funcs.comparePwd = function (user, cb) {
    if (!user) {
      return cb(null, false);
    }
    _comparePwd(payload.password, user.password_hash,
      (err, result) => {
        if (err) {
          cb(err);
          return;
        }
        cb(null, result);
      });
  };
  funcs.updateAuth = function (user, comparePwd, cb) {
    if (!(user && comparePwd)) {
      return cb(null, false);
    }
    if (payload.device_token) {
      user.device_token = payload.device_token;
    }
    if (payload.device_uid) {
      user.device_uid = payload.device_uid;
    }
    if (payload.device_type) {
      user.device_type = payload.device_type;
    }
    _updateAuth(user,
      (err, result) => {
        if (err) {
          cb(err);
          return;
        }
        if (result) {
          cb(null, user);
          return;
        }
        cb(null, false);
      });
  };
  funcs.updatedUser = function (user, updateAuth, cb) {
    if (!updateAuth) {
      cb(null, false);
      return;
    }
    userModel.getUsers(user,
      (err, result) => {
        if (err) {
          cb(err);
          return;
        }
        cb(null, result.data[0]);
      });
  };
  async.autoInject(funcs,
    function (err, results) {
      if (err) callback(err);
      if (results.comparePwd === false) { // user not found
        callback(null, {
          'success': false,
          'statusCode': responseCodes.INVALID_PASSWORD,
          'message': responseCodes.getStatusText(responseCodes.INVALID_PASSWORD),
        });
        return;
      }
      if (!results.user) { // user not found
        callback(null, {
          'success': false,
          'statusCode': responseCodes.NOT_EXISTS,
          'message': responseCodes.getStatusText(responseCodes.NOT_EXISTS),
        });
        return;
      }
      if (results.user.status === statuses.DELETED) {
        callback(null, {
          'success': false,
          'statusCode': responseCodes.IS_DELETED,
          'message': responseCodes.getStatusText(responseCodes.IS_DELETED),
        });
        return;
      }
      if (results.user.status === statuses.IN_ACTIVE) {
        callback(null, {
          'success': false,
          'statusCode': responseCodes.IS_IN_ACTIVE,
          'message': responseCodes.getStatusText(responseCodes.IS_IN_ACTIVE),
        });
        return;
      }
      if (results.user.status === statuses.NOT_VERIFIED) {
        callback(null, {
          'success': false,
          'statusCode': responseCodes.IS_NOT_VERIFIED,
          'message': responseCodes.getStatusText(responseCodes.IS_NOT_VERIFIED),
        });
        return;
      }
      delete results.updatedUser.password_hash;
      delete results.updatedUser.reset_code;
      callback(null, {
        'success': true,
        'data': results.updatedUser,
        'statusCode': responseCodes.LOGIN_OK,
        'message': responseCodes.getStatusText(responseCodes.LOGIN_OK),
      });
    });
};
/**
 * @name logout
 * @description logout a user, unset its authorization and device tokens
 */
const logout = function (model, cb) {
  let queryStr = knex('users')
    .where('id', model.id)
    .where('role', model.scope)
    .update({
      'auth_token': '',
      'device_token': '',
    });
  db.mysql.query(queryStr.toString(),
    (err, results) => {
      if (err) {
        cb(err);
        return;
      }
      cb(null, {
        'success': true,
        'statusCode': responseCodes.OK,
        'message': responseCodes.getStatusText(responseCodes.OK),
      });
    });
};
/**
 * @name generateToken
 * @description Generates a token for user using id, role, secretKey and expiry interval
 */
const _generateToken = function (id, role) {
  return jwt.sign(
    {id: id, scope: role === userRoles.ADMIN ? userRoles.ADMIN : userRoles.USER},
    config.secretKey,
    {expiresIn: '30d'}
  );
};
/**
 * @name _updateAuth
 */
const _updateAuth = function (model, callback) {
  let data = {};
  data.auth_token = _generateToken(model.id, model.role);
  if (model.device_token) {
    data.device_token = model.device_token;
  }
  if (model.device_uid) {
    data.device_uid = model.device_uid;
  }
  if (model.device_type) {
    data.device_type = model.device_type;
  }
  let queryStr = knex('users')
    .where('id', model.id)
    .update(data);
  db.mysql.query(queryStr.toString(),
    (err, results) => {
      if (err) {
        callback(err);
        return;
      }
      callback(null, results);
    });
};
/**
 * @name _comparePwd
 */
const _comparePwd = function (data, hash, callback) {
  bcrypt.compare(data, hash, function (err, isValid) {
    if (err) return callback(err);
    callback(null, isValid);
  });
};
/**
 * @name: Add auth
 */
const _addAuth = function (userId, callback) {
  let queryStr = knex('users')
    .where('id', userId)
    .update({'auth_token': _generateToken(userId)});
  db.mysql.query(queryStr.toString(),
    (err, results) => {
      if (err) {
        callback(err);
        return;
      }
      callback(null, results);
    });
};
module.exports = {
  validate,
  login,
  logout,
  _addAuth,
};
