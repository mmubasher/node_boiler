'use strict';

const config = require('../../../configs/config');
const gateway = require('../../../configs/payment_gateway');
const braintree = require('braintree');

const masterMerchantAccountId = config.braintree.masterMerchantAccountId;

function createMerchantAccount(data, callback) {
  let merchantAccountParams = {
    individual: { // require
      firstName: data.first_name,
      lastName: data.last_name,
      email: data.email_address,
      phone: data.phone_number,
      dateOfBirth: data.dob,
      ssn: data.ssn,
      address: {
        streetAddress: data.street,
        locality: data.city,
        region: data.state,
        postalCode: data.zip_code,
      },
    },
    business: {
      legalName: data.first_name + data.last_name,
      dbaName: data.name,
      taxId: data.tax_id,
      // address: {
      //   streetAddress: "111 Main St",
      //   locality: "Chicago",
      //   region: "IL",
      //   postalCode: "60622"
      // }
    },
    funding: { // require
      destination: braintree.MerchantAccount.FundingDestination.Bank,
      accountNumber: data.account_number,
      routingNumber: data.routing_number,
    },
    tosAccepted: true,
    masterMerchantAccountId: masterMerchantAccountId,
    // id: "blue_ladders_store"
  };

  gateway.merchantAccount.create(merchantAccountParams, function (err, result) {
    callback(err, result);
  });
}

function updateMerchantAccount(accountId, data, callback) {
  gateway.merchantAccount.update(accountId, data, function (err, result) {
    callback(err, result);
  });
}

function getMerchantAccount(accountId, callback) {
  gateway.merchantAccount.find(accountId, function (err, merchantAccount) {
    callback(err, merchantAccount);
  });
}

function addCustomer(customer, callback) {
  gateway.customer.create(customer, function (err, response) {
    if (err) return callback(err);
    else {
      if (response.errors) {
        let formattedErrors = _formatErrors(response.errors)
        callback(formattedErrors);
        return;
      }
      callback(null, response);
    }
  });
}

function addCard(paymentGatewayId, paymentMethodNonce, callback) {
  gateway.paymentMethod.create({
    customerId: paymentGatewayId,
    paymentMethodNonce: paymentMethodNonce,
    options: {
      makeDefault: false,
    },
  }, function (err, response) {
    if (err) return callback(err);
    else {
      if (response.errors) {
        let formattedErrors = _formatErrors(response.errors);
        callback(formattedErrors);
        return;
      }
      callback(null, response);
    }
  });
}

function editCard(model, callback) {
  gateway.paymentMethod.update(model.token, {
    paymentMethodNonce: model.payment_method_nonce,
    options: {
      makeDefault: model.make_default ? model.make_default : false,
    },
  }, function (err, response) {
    if (err) return callback(err);
    else {
      callback(null, response);
    }
  });
}

function setDefault(token, callback) {
  gateway.paymentMethod.update(token, {
    options: {
      makeDefault: true,
    },
  }, function (err, response) {
    if (err) return callback(err);
    else {
      callback(null, response);
    }
  });
}

function listCards(paymentGatewayId, callback) {
  gateway.customer.find(paymentGatewayId, function (err, response) {
    if (err) return callback(err);
    else {
      callback(null, response);
    }
  });
}

function getCard(token, callback) {
  gateway.paymentMethod.find(token, function (err, paymentMethod) {
    if (err) return callback(err);
    else {
      callback(null, paymentMethod);
    }
  });
}

function deleteCard(token, callback) {
  gateway.paymentMethod.delete(token, function (err, response) {
    if (err) return callback(err);
    else {
      callback(null, response);
    }
  });
}

function _formatErrors(errors) {
  let error = {code: '', message: ''};
  let deepErrors = errors.deepErrors();
  for (let i in deepErrors) {
    if (deepErrors.hasOwnProperty(i)) {
      error.code = deepErrors[i].code;
      error.message = deepErrors[i].message;
      break;
    }
  }
  return error;
}

module.exports = {
  createMerchantAccount,
  updateMerchantAccount,
  getMerchantAccount,
  listCards,
  addCard,
  addCustomer,
  editCard,
  setDefault,
  getCard,
  deleteCard,
};
