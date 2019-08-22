'use strict';

const joi = require('@hapi/joi');

const forgotPwd = joi.object({
  email_address: joi.string().email().required(),
});
const changePwd = joi.object({
  old_password: joi.string().min(8).required()
    .regex(/^(?=.*[A-Za-z])(?=.*[0-9]).{8,20}$/),
  new_password: joi.string().min(8).required()
    .regex(/^(?=.*[A-Za-z])(?=.*[0-9]).{8,20}$/),
  confirm_password: joi.when('new_password', {is: joi.any(), then: joi.ref('new_password')})
    .options({language: {any: {allowOnly: 'must match password'}}}).required(),
});
const resetPwd = joi.object({
  password: joi.string().min(8).required()
    .regex(/^(?=.*[A-Za-z])(?=.*[0-9]).{8,20}$/),
  confirm_password: joi.when('password', {is: joi.any(), then: joi.ref('password')})
    .options({language: {any: {allowOnly: 'must match password'}}}).required(),
});
const resetCode = joi.object({
  code: joi.string().required(),
});
const userId = joi.object({
  user_id: joi.number().required(),
});
module.exports = {
  forgotPwd,
  resetPwd,
  userId,
  changePwd,
  resetCode,
};
