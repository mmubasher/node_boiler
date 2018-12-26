'use strict';

const apn = require('apn');
const path = require('path');
const config = require('../../../../configs/config');

module.exports = function (title, msg, tokens, callback) {
  let certs = {};
  if (config.environment === 'production' || config.environment === 'stag') {
    certs = {
      key: path.join(__dirname, 'certificates/production.pem'),
      cert: path.join(__dirname, 'certificates/production.pem'),
    };
  } else {
    certs = {
      key: path.join(__dirname, 'certificates/development.pem'),
      cert: path.join(__dirname, 'certificates/development.pem'),
    };
  }
  let service = new apn.Provider(certs);

  let note = new apn.Notification({
    alert: title,
    payload: msg,
  });
  note.rawPayload = {
    from: "node-apn",
    source: "web",
    aps: {
      "content-available": 1,
    },
  };
// The topic is usually the bundle identifier of your application.
  note.topic = config.apnsBundleId;

  // console.log(`Sending: ${note.compile()} to ${tokens}`);
  service.send(note, tokens).then(result => {
    // console.log("sent:", result.sent.length);
    // console.log("failed:", result.failed.length);
    // console.log(result.failed);
    callback(null, result);
  });

// For one-shot notification tasks you may wish to shutdown the connection
// after everything is sent, but only call shutdown if you need your
// application to terminate.
  service.shutdown();
};
