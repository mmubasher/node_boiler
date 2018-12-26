'use strict';

const joi = require('joi');

const signUp = joi.object({
  email_address: joi.string().email().required(),
  password: joi.string().min(8).required()
    .regex(/^(?=.*[A-Za-z])(?=.*[0-9]).{8,20}$/),
  confirm_password: joi.when('password', {is: joi.any(), then: joi.ref('password')})
    .options({language: {any: {allowOnly: 'must match password'}}}).required(),
  phone_number: joi.string().min(10).max(16).required(),
  first_name: joi.string().min(2).max(20).required(),
  last_name: joi.string().min(2).max(20).required(),
  age: joi.number().optional(),
  profile_img: joi.string().optional(),
  gender: joi.string().valid('male', 'female', 'other', 'none').optional(),
  device_uid: joi.string().optional(),
  device_token: joi.string().optional(),
  device_type: joi.string().valid('apple', 'android').optional(),
  ip_address: joi.string().optional(),
  user_agent: joi.string().optional(),
  device_os: joi.string().optional(),
  build_version: joi.string().optional(),
}).and('password', 'confirm_password');

module.exports = {
  signUp,
};
