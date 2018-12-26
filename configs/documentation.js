'use strict';

const swaggerOptions = {
  info: {
    'title': 'Hapi-Boiler backend API',
    'description': 'Powered by node, hapi, joi and swagger-ui',
  },
  securityDefinitions: {
    'jwt': {
      'type': 'apiKey',
      'name': 'Authorization',
      'in': 'header',
    },
  },
  grouping: 'tags',
  security: [{'jwt': []}],
  host: (process.env.SERVER_URI).replace(/(^\w+:|^)\/\//, ''),
};

module.exports = {
  swaggerOptions,
};
