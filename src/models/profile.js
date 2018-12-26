'use strict';

const db = require('../database/index');
const bcrypt = require('bcrypt');
const salt = bcrypt.genSaltSync(16);
const knex = require('knex')({client: 'mysql'});
const randomString = require('randomstring');
const async = require('async');
const userModel = require('./users');
const funcs = require('../utils/functions');
const responseCodes = require('../../constants/response_codes');

/**
 * @name: Forgot Password
 */
const forgotPwd = function (model, callback) {
  async.autoInject({
    user: (cb) => {
      userModel.getUsers(model,
          (err, result) => {
            if (err) {
              cb(err);
              return;
            }
            cb(null, result.data[0]);
          });
    },
    code: (user, cb) => {
      if (!user) {
        cb();
        return;
      }
      const code = randomString.generate({
        length: 64,
        charset: 'alphanumeric',
      });
      let queryStr = knex('users')
          .where('id', user.id)
          .update({'reset_code': code});
      db.mysql.query(queryStr.toString(),
          (err, res) => {
            if (err) {
              cb(err);
              return;
            }
            cb(null, code);
          });
    },
    sendEmail: (user, code, cb) => {
      if (!user) {
        cb();
        return;
      }
      funcs.sendForgotPwdMail(user, code,
          (err, isSent) => {
            if (err) {
              cb(err);
              return;
            }
            cb(null, isSent);
          });
    },
  },
    (err, result) => {
      if (err) {
        callback(err);
        return;
      }
      if (!result.user) {
        callback(null, {
          'success': false,
          'statusCode': responseCodes.NOT_FOUND,
          'message': responseCodes.getStatusText(responseCodes.NOT_FOUND),
        });
        return;
      }
      if (result.sendEmail) {
        callback(null, {
          'success': true,
          'statusCode': responseCodes.OK,
          'message': responseCodes.getStatusText(responseCodes.OK),
        });
        return;
      }
      callback(null, {
        'success': false,
        'statusCode': responseCodes.FAILED,
        'message': responseCodes.getStatusText(responseCodes.FAILED),
      });
    });
};

/**
 * @name: Reset Password
 */
const resetPwd = function (code, model, callback) {
  async.autoInject({
    user: (cb) => {
      userModel.getUsers(code,
          (err, result) => {
            if (err) {
              cb(err);
              return;
            }
            cb(null, result.data[0]);
          });
    },
    reset: (user, cb) => {
      if (!user) {
        cb();
        return;
      }
      let data = {};
      data.reset_code = '';
      data.password_hash = bcrypt.hashSync(model.password, salt);
      let queryStr = knex('users')
          .where('id', user.id)
          .update(data);
      db.mysql.query(queryStr.toString(),
          (err, res) => {
            if (err) {
              cb(err);
              return;
            }
            cb(null, res.affectedRows);
          });
    },
  },
    (err, result) => {
      if (err) {
        callback(err);
        return;
      }
      if (!result.user) {
        callback(null, {
          'success': false,
          'statusCode': responseCodes.NOT_FOUND,
          'message': responseCodes.getStatusText(responseCodes.NOT_FOUND),
        });
        return;
      }
      if (result.reset) {
        callback(null, {
          'success': true,
          'statusCode': responseCodes.OK,
          'message': responseCodes.getStatusText(responseCodes.OK),
        });
        return;
      }
      callback(null, {
        'success': false,
        'statusCode': responseCodes.FAILED,
        'message': responseCodes.getStatusText(responseCodes.FAILED),
      });
    });
};
/**
 * @name: phone exists
 * @desc: Check if phone exists in db
 * @param: phoneNumber {string}
 * @param: callback
 */
const _phoneExists = function (phoneNumber, callback) {
  let queryStr = knex.select('id');
  queryStr.from('profiles');
  queryStr.where('phone_number', phoneNumber);
  queryStr.limit(1);
  db.mysql.query(queryStr.toString(),
    (err, results) => {
      if (err) {
        callback(err);
        return;
      }
      if (results[0]) {
        callback(null, true);
        return;
      }
      callback(null, false);
    });
};

module.exports = {
  forgotPwd,
  resetPwd,
  _phoneExists,
};
