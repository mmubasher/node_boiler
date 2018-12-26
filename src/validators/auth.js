'use strict';

const joi = require('joi');

const login = joi.object({
  email_address: joi.string().email().required(),
  password: joi.string().min(8).required()
    .regex(/^(?=.*[A-Za-z])(?=.*[0-9]).{8,20}$/),
  device_uid: joi.string().optional(),
  device_token: joi.string().optional(),
  device_type: joi.string().valid('apple', 'android').optional(),
  ip_address: joi.string().optional(),
  user_agent: joi.string().optional(),
  device_os: joi.string().optional(),
  build_version: joi.string().optional(),
});

module.exports = {
  login,
};
