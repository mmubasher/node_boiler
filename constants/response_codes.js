'use strict';

let responseCodes = {};
// Generic - Series 1XX
responseCodes[exports.OK = 100] = 'Action successful';
responseCodes[exports.AUTHORIZATION_FAIL = 101] = 'Insufficient rights';
responseCodes[exports.INVALID_PARAMETERS = 102] = 'Invalid Parameters';
responseCodes[exports.LISTING_OK = 103] = 'Listing successful';
responseCodes[exports.NO_RECORDS = 104] = 'No records found';
responseCodes[exports.FAILED = 105] = 'Action failed';
responseCodes[exports.NOT_FOUND = 106] = 'Requested resource does not exists';
// Auth - Series 2XX
responseCodes[exports.LOGIN_OK = 200] = 'Authentication successful';
responseCodes[exports.LOGIN_FAIL = 201] = 'Invalid credentials';
responseCodes[exports.IS_IN_ACTIVE = 202] = 'Requested resource has a status as in-active or banned';
responseCodes[exports.IS_NOT_VERIFIED = 203] = 'Requested resource is pending verification';
responseCodes[exports.IS_DELETED = 204] = 'Requested resource has a status as deleted';
responseCodes[exports.NOT_EXISTS = 205] = 'Requested resource does not exists';
responseCodes[exports.INVALID_PASSWORD = 206] = 'Invalid password';
responseCodes[exports.LOGOUT_FAILED = 207] = 'No login found';
// Sign Up - Series 3XX
responseCodes[exports.VALIDATION_OK = 300] = 'Validation successful';
responseCodes[exports.VALIDATION_FAILED = 301] = 'Validation failed';
responseCodes[exports.SIGNUP_SUCCESSFUL = 302] = 'Sign Up successful';
responseCodes[exports.SIGNUP_FAILED = 303] = 'Sign Up failed';
responseCodes[exports.EXISTS = 304] = 'Resource exists already';

exports.getStatusText = function (code) {
  if (responseCodes.hasOwnProperty(code)) {
    return responseCodes[code];
  } else {
    throw new Error('Status code does not exist: ' + code);
  }
};
