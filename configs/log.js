'use strict';

const goodOptions = {
  ops: {
    interval: 100000,
  },
  reporters: {
    console: [{
      module: 'good-squeeze',
      name: 'Squeeze',
      args: [{error: '*', log: '*', response: '*', request: '*'}],
    }, {
      module: 'good-console',
    }, 'stdout'],

    file: [{
      module: 'good-squeeze',
      name: 'Squeeze',
      args: [{error: '*', log: '*', response: '*', request: '*'}],
    }, {
      module: 'good-squeeze',
      name: 'SafeJson',
    }, {
      module: 'good-file',
      args: ['./logs/awesome_log'],
    }],
    // http: [{
    //   module: 'good-squeeze',
    //   name: 'Squeeze',
    //   args: [{error: '*', log: '*', response: '*', request: '*'}],
    // }, {
    //   module: 'good-http',
    //   args: ['http://prod.logs:3000', {
    //     wreck: {
    //       headers: {'x-api-key': 12345},
    //     },
    //   }],
    // }],
  },
};

module.exports = {
  goodOptions,
};
