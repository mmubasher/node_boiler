'use strict';

const apn = require('./apn/index');
const fcm = require('./fcm/fcm');
const deviceConstants = require('../../../constants/device');

module.exports = function (title, message, deviceToken, deviceType, callback) {
  if (!(deviceType && deviceToken && message)) {
    callback({status: false, msg: 'device type or token can not be blank'});
  }
  if (deviceType === deviceConstants.types.APPLE) {
    apn(title, message, deviceToken, callback);
  }
  if (deviceType === deviceConstants.types.ANDROID) {
    fcm(message, deviceToken, callback);
  }
};
