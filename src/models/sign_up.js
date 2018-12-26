'use strict';

const db = require('../database/index');
const knex = require('knex')({client: 'mysql'});
const userModel = require('./users');
const authModel = require('./auth');
const async = require('async');
const responseCodes = require('../../constants/response_codes');
const _ = require('lodash');
/**
 * @name: Sign Up
 * @description
 * If sign up with email. add new user. fail if email exists
 * if sign up with facebook but email exists. update account
 * if sign up with facebook but email not exists. add account
 */
const signUp = function (model, callback) {
  const signUpCase = {
    'OK': 'ok',
    'FAIL': 'fail',
  };
  let funcs = {};
  funcs.validate = (cb) => {
    _validate(model,
      (err, user) => {
        if (err) {
          cb(err);
          return;
        }
        if (!_.isEmpty(user)) {
          cb(null, {'status': signUpCase.FAIL});
          return;
        }
        cb(null, {'status': signUpCase.OK});
      });
  };
  funcs.add = (validate, cb) => {
    if (validate.status === signUpCase.FAIL) {
      cb();
      return;
    }
    userModel._addUser(model,
      (err, userId) => {
        if (err) {
          cb(err);
          return;
        }
        cb(null, userId);
      });
  };
  funcs.addProfile = (add, cb) => {
    if (!add) {
      cb();
      return;
    }
    model.id = add;
    userModel._addProfile(model,
      (err, profileId) => {
        if (err) {
          cb(err);
          return;
        }
        cb(null, profileId);
      });
  };
  funcs.addAuth = (add, validate, cb) => {
    if (validate.status === signUpCase.FAIL) {
      cb();
      return;
    }
    let userId = add;
    authModel._addAuth(userId,
      function (err, added) {
        if (err) {
          cb(err);
          return;
        }
        cb(null, added);
      });
  };
  funcs.user = (add, validate, addAuth, cb) => {
    if (!addAuth) {
      cb();
      return;
    }
    userModel.getUsers({id: add},
      (err, result) => {
        if (err) {
          cb(err);
          return;
        }
        cb(null, result);
      });
  };
  async.autoInject(funcs,
    function (err, results) {
      if (err) {
        callback(null, {
          'success': false,
          'statusCode': responseCodes.FAILED,
          'message': err.message,
        });
        return;
      }
      if (results.validate.status === signUpCase.FAIL) {
        callback(null, {
          'success': false,
          'statusCode': responseCodes.EXISTS,
          'message': responseCodes.getStatusText(responseCodes.EXISTS),
        });
        return;
      }
      delete results.user.data[0].password_hash;
      delete results.user.data[0].reset_code;
      callback(null, {
        'success': true,
        'data': results.user.data[0],
        'message': responseCodes.getStatusText(responseCodes.SIGNUP_SUCCESSFUL),
        'statusCode': responseCodes.SIGNUP_SUCCESSFUL,
      });
    }
  );
};
const _validate = function (model, cb) {
  let queryStr = knex.select('u.id', 'u.email_address')
    .from('users AS u');
  if (model.email_address) {
    queryStr.where('u.email_address', model.email_address);
  }
  db.mysql.query(queryStr.toString(),
    (err, result) => {
      if (err) {
        cb(err);
        return;
      }
      if (result.length) {
        cb(null, result[0]);
        return;
      }
      cb();
    });
};

module.exports = {
  signUp,
};
