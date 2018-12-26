'use strict';

const responseCodes = require('../../constants/response_codes');

const get = {
  description: 'API Response Codes',
  notes: 'Get Listing of response codes used in API',
  tags: ['api', 'codes'],
  auth: {
    strategy: 'jwt',
    scope: ['user', 'admin'],
  },
  handler: function (request, reply) {
    let out = [];
    for (let code in responseCodes) {
      if (code !== 'getStatusText') { // skip getStatusText as it is internal func
        out.push({
          'code': responseCodes[code],
          'label': code,
          'text': responseCodes.getStatusText(responseCodes[code]),
        });
      }
    }
    reply(out);
  },
};

module.exports = {
  get,
};
