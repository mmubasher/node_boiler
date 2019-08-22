'use strict';

const braintree = require('braintree');
const gateway = require('../../configs/payment_gateway');

module.exports = {
  auth: false,
  handler: (request, reply) => {
    // request.log(['braintreeHooks'], request.payload);
    // var sampleNotification = gateway.webhookTesting.sampleNotification(
    //     braintree.WebhookNotification.Kind.SubMerchantAccountDeclined,
    //     'MRD91HJQ2AU8BQ'
    // );
    gateway.webhookNotification.parse(
      request.payload.bt_signature,
      request.payload.bt_payload,
      // sampleNotification.bt_signature,
      // sampleNotification.bt_payload,
      function (err, webhookNotification) {
        if (err) {
          throw err;
        } else {
          switch (webhookNotification.kind) {
            case braintree.WebhookNotification.Kind.SubMerchantAccountApproved:
              // do something here
              break;
            case braintree.WebhookNotification.Kind.SubMerchantAccountDeclined:
              // do something here
              break;
            case braintree.WebhookNotification.Kind.DisbursementException:
              // do something here
              break;
            case braintree.WebhookNotification.Kind.Disbursement:
              // do something here
              break;
            case braintree.WebhookNotification.Kind.TransactionSettled:
              // do something here
              break;
            case braintree.WebhookNotification.Kind.TransactionSettlementDeclined:
              // do something here
              break;
            default:
              // do something here
              break;
          }
        }
      }
    );
  },
};
