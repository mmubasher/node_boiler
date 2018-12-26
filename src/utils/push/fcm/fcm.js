'use strict';

const firebaseAdmin = require('firebase-admin');
const serviceAccount = require('./service_account_key.json');

firebaseAdmin.initializeApp({
  credential: firebaseAdmin.credential.cert(serviceAccount),
  databaseURL: 'https://Hapi-Boiler-5a947.firebaseio.com/',
});

module.exports = function (msg, tokens, callback) {
  const payload = {
    data: {
      score: '850',
      text: msg,
    },
  };
  firebaseAdmin.messaging().sendToDevice(tokens, payload)
    .then(function (response) {
      callback(null, response);
    })
    .catch(function (error) {
      callback(error);
    });
};
