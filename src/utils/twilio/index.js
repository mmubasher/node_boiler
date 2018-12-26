'use strict';

const config = require('../../../configs/config');

// Twilio Credentials
const accountSid = config.twilio.accSid;
const authToken = config.twilio.secret;
const serviceId = config.twilio.serviceId;

const sms = function (to, text, callback) {
  // require the Twilio module and create a REST client
  let client = require('twilio')(accountSid, authToken);
  return client.api.messages
    .create({
      messagingServiceSid: serviceId,
      to: to,
      body: text,
    })
    .then((message) => {
      callback(null, message);
    })
    .catch((err) => {
      callback(null, {
        'success': false,
        'statusCode': err.code,
        'message': err.message,
        'errorData': err,
      });
    });
};

module.exports = {
  sms,
};
