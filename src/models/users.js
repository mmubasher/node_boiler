'use strict';

const db = require('../database/index');
const bcrypt = require('bcrypt');
const salt = bcrypt.genSaltSync(16);
const knex = require('knex')({
  client: 'mysql',
});
const async = require('async');
const _ = require('lodash');
const responseCodes = require('../../constants/response_codes');
const statuses = require('../../constants/statuses');
/**
 * @name Get Users
 * @description Get user(s) with id, ids and filters
 * @param model
 * @param callback
 * @return [map] {
              "data": [object],
              "count": numeric
          }
 */
const getUsers = function (model, callback) {
  let listQuery = knex.select(
    'u.id', 'u.email_address', 'u.password_hash',
    'u.role', 'u.device_uid', 'u.device_token', 'u.device_type', 'u.auth_token', 'u.status',
    'u.reset_code', 'p.first_name', 'p.last_name', 'p.age', 'p.gender', 'u.created_at',
    'p.phone_number', 'p.profile_img', 'p.address_street', 'p.address_city', 'p.address_state',
    'p.address_zip_code'
  );
  // handling nulls
  listQuery.column(knex.raw(`IF(us.ip_address, us.ip_address, '') AS ip_address`));
  listQuery.column(knex.raw(`IF(us.user_agent, us.user_agent, '') AS user_agent`));
  listQuery.column(knex.raw(`IF(us.device_os, us.device_os, '') AS device_os`));
  listQuery.column(knex.raw(`IF(us.build_version, us.build_version, '') AS build_version`));
  listQuery.column(knex.raw(`IF(us.device_type, us.device_type, '') AS device_type`));

  listQuery.from('users AS u');
  listQuery.leftJoin('profiles AS p', 'u.id', '=', 'p.user_id');
  listQuery.leftJoin('user_sessions AS us', 'u.id', '=', 'us.user_id');
  listQuery.where('u.role', 'user');

  let countQuery = knex.count('u.id AS user_count');
  countQuery.from('users AS u');
  countQuery.leftJoin('profiles AS p', 'u.id', '=', 'p.user_id');
  countQuery.leftJoin('user_sessions AS us', 'u.id', '=', 'us.user_id');
  countQuery.where('u.role', 'user');

  if (model.id) { // get single user
    listQuery.where('u.id', model.id);
  }
  if (model.ids) { // get multiple users
    listQuery.whereIn('u.id', model.ids);
    countQuery.whereIn('u.id', model.ids);
  }
  if (model.email_address) { // get single user
    listQuery.where('u.email_address', model.email_address);
  }
  if (model.code) { // get single user
    listQuery.where('u.reset_code', model.code);
  }
  if (model.search) {
    listQuery.where(function () {
      this.where('p.first_name', 'like', `%${model.search}%`)
        .orWhere('p.last_name', 'like', `%${model.search}%`)
        .orWhere('u.email_address', 'like', `%${model.search}%`);
    });
    countQuery.where(function () {
      this.where('p.first_name', 'like', `%${model.search}%`)
        .orWhere('p.last_name', 'like', `%${model.search}%`)
        .orWhere('u.email_address', 'like', `%${model.search}%`);
    });
  }
  listQuery.orderBy('p.first_name', 'asc');
  listQuery.orderBy('p.last_name', 'asc');
  listQuery.orderBy('u.email_address', 'asc');
  if (model.limit) {
    listQuery.limit(model.limit);
    listQuery.offset(model.start);
  }

  let users = () => {
    return new Promise((resolve, reject) => {
      db.mysql.query(
        listQuery.toString(),
        function (err, rows) {
          if (err) reject(err);
          resolve(rows);
        });
    });
  };
  let count = () => {
    return new Promise((resolve, reject) => {
      db.mysql.query(
        countQuery.toString(),
        function (err, rows) {
          if (err) reject(err);
          resolve(rows[0].user_count);
        });
    });
  };
  let funcs = [];
  funcs.push(users());
  // count users if no filter
  if (!model.id) {
    funcs.push(count());
  }
  Promise.all(funcs)
    .then(rows => {
      if (rows) {
        callback(null, {
          'data': rows[0],
          'count': rows[1],
        });
        return;
      }
      callback(null, {
        'data': [],
        'count': 0,
      });
    })
    .catch(err => {
      callback(err);
    });
};

const remove = function (userId, callback) {
  let query = knex('users')
    .where('id', userId)
    .update({'status': statuses.DELETED});
  db.mysql.query(query.toString(),
    function (error, results) {
      if (error) return callback(error);
      callback(null, results.affectedRows);
    });
};
/**
 * @name: _Add User
 */
const _addUser = function (model, cb) {
  let userModel = {};
  if (model.email_address) userModel.email_address = model.email_address || '';
  if (model.password) userModel.password_hash = bcrypt.hashSync(model.password, salt);
  if (model.role) userModel.role = model.role || 'user';
  if (model.device_uid) userModel.device_uid = model.device_uid || '';
  if (model.device_type) userModel.device_type = model.device_type || '';
  if (model.device_token) userModel.device_token = model.device_token || '';
  if (model.reset_code) userModel.reset_code = model.reset_code || '';
  let queryStr = knex('users').insert([userModel]);
  db.mysql.query(queryStr.toString(),
    (err, results) => {
      if (err) {
        cb(err);
        return;
      }
      cb(null, results.insertId);
    });
};
/**
 * @name: Add Profile
 */
const _addProfile = function (model, cb) {
  let userModel = {};
  userModel.user_id = model.id;
  userModel.first_name = model.first_name;
  userModel.last_name = model.last_name;
  if (model.gender) userModel.gender = model.gender;
  if (model.phone_number) userModel.phone_number = model.phone_number || '';
  if (model.profile_img) userModel.profile_img = model.profile_img || '';
  if (model.address_street) userModel.address_street = model.address_street || '';
  if (model.address_city) userModel.address_city = model.address_city || '';
  if (model.address_state) userModel.address_state = model.address_state || '';
  if (model.address_zip_code) userModel.address_zip_code = model.address_zip_code || '';
  if (!_.isEmpty(userModel)) {
    let queryStr = knex('profiles').insert([userModel]);
    db.mysql.query(queryStr.toString(),
      (err, results) => {
        if (err) {
          cb(err);
          return;
        }
        cb(null, results.insertId);
      });
  }
};

const update = function (userId, model, callback) {
  let funcs = {};
  funcs.getUser = (cb) => {
    db.mysql.query(knex('users')
        .leftJoin('profiles', 'users.id', 'profiles.user_id')
        .where('users.id', userId).toString(),
      function (error, results) {
        if (error) return cb(error);
        if (_.isArray(results)) {
          cb(null, results[0]);
          return;
        }
        cb(null, false);
      });
  };
  funcs.validatePwd = (getUser, cb) => {
    if (model.new_password &&
      model.confirm_new_password && model.current_password) {
      _comparePwd(model.current_password, getUser.password_hash, cb);
    } else {
      cb(null, true);
    }
  };
  funcs.user = function (validatePwd, cb) {
    if (validatePwd) {
      _updateUser(userId, model, cb);
    } else {
      cb();
    }
  };
  funcs.profile = function (validatePwd, cb) {
    if (validatePwd) {
      _updateProfile(userId, model, cb);
    } else {
      cb();
    }
  };
  async.autoInject(funcs,
    (err, res) => {
      if (err) {
        callback(err);
        return;
      }
      if (res.validatePwd) {
        callback(null, {
          'success': true,
          'statusCode': responseCodes.OK,
          'message': responseCodes.getStatusText(responseCodes.OK),
        });
        return;
      }
      callback(null, {
        'success': false,
        'statusCode': responseCodes.INVALID_PASSWORD,
        'message': responseCodes.getStatusText(responseCodes.INVALID_PASSWORD),
      });
    });
};
const _updateUser = function (userId, model, cb) {
  let data = {};
  if (model.email_address) data.email_address = model.email_address;
  if (model.facebook_id) data.facebook_id = model.facebook_id;
  if (model.new_password) data.password_hash = bcrypt.hashSync(model.new_password, salt);
  if (model.role) data.role = model.role;
  if (model.auth_token) data.auth_token = model.auth_token;
  if (model.device_type) data.device_type = model.device_type;
  if (model.device_uid) data.device_uid = model.device_uid;
  if (model.device_token) data.device_token = model.device_token;
  if (!_.isEmpty(data)) {
    let query = knex('users')
      .where('id', userId)
      .update(data);
    db.mysql.query(query.toString(),
      function (error, results) {
        if (error) return cb(error);
        cb(null, results.affectedRows);
      });
  } else {
    cb(null, null);
  }
};
/**
 * @name: _Update Profile
 */
const _updateProfile = function (userId, model, cb) {
  let profileModel = {};
  if (model.first_name) profileModel.first_name = model.first_name;
  if (model.last_name) profileModel.last_name = model.last_name;
  if (model.age) profileModel.age = model.age;
  if (model.gender) profileModel.gender = model.gender;
  if (model.phone_number) profileModel.phone_number = model.phone_number || '';
  if (model.profile_img) profileModel.profile_img = model.profile_img || '';
  if (model.address_street) profileModel.address_street = model.address_street || '';
  if (model.address_city) profileModel.address_city = model.address_city || '';
  if (model.address_state) profileModel.address_state = model.address_state || '';
  if (model.address_zip_code) profileModel.address_zip_code = model.address_zip_code || '';
  if (!_.isEmpty(profileModel)) {
    let query = knex('profiles')
      .where('user_id', userId)
      .update(profileModel);
    db.mysql.query(query.toString(),
      function (error, results) {
        if (error) return cb(error);
        cb(null, results.affectedRows);
      });
  } else {
    cb();
  }
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

module.exports = {
  getUsers,
  remove,
  update,
  _addUser,
  _addProfile,
  _updateProfile,
};
