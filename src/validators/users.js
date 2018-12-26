'use strict';

const joi = require('joi');
const statuses = require('../../constants/statuses');

const listing = joi.object({
  sort: joi.string().valid('first_name', 'last_name', 'created_at', 'email_address'),
  order: joi.string().valid('asc', 'desc').optional(),
  search: joi.string().optional(),
});

const userId = joi.object({
  id: joi.number().required(),
});

const pagination = joi.object({
  page: joi.number().required(),
  limit: joi.number().required(),
});

module.exports = {
  listing,
  userId,
  pagination,
};
