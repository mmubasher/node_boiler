'use strict';

const goodOptions = {
  ops: {
    interval: 10000,
  },
  reporters: {
    myConsoleReporter: [
      {
        module: '@hapi/good-squeeze',
        name: 'Squeeze',
        args: [{log: '*', response: '*'}],
      },
      {
        module: '@hapi/good-console',
      },
      'stdout',
    ],
  },
};

module.exports = {
  goodOptions,
};
