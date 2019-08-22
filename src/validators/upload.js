'use strict';

const joi = require('@hapi/joi');

const file = joi.object({
  file: joi.any()
    .meta({ swaggerType: 'file' })
    .description('.png|.jpg file').required(),
});

module.exports = {
  file,
};
