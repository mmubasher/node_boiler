'use strict';

const path = require('path');

module.exports = {
  projectName: process.env.PROJECT_NAME,
  secretKey: process.env.SERVER_SECRET_KEY,
  rootPath: path.join(__dirname, '/..'),
  serverUri: process.env.SERVER_URI,
  adminUrl: process.env.ADMIN_URI,
  port: process.env.PORT,
  environment: process.env.NODE_ENV,
  mailer: {
    service: process.env.MAILER_PROVIDER,
    auth: {
      user: process.env.MAILER_ADDRESS,
      pass: process.env.MAILER_PWD,
    },
    tls: {
      rejectUnauthorized: false,
    },
  },
  db: {
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PWD,
    database: process.env.DB_NAME,
    connectionLimit: 5,
  },
  aws: {
    bucketId: process.env.AWS_S3_BUCKET,
    secretAccessKey: process.env.AWS_SECRET_KEY,
    accessKey: process.env.AWS_ACCESS_KEY,
  },
  imgResizeDim: {
    large: process.env.LARGE_IMG_SIZE,
    small: process.env.THUMB_IMG_SIZE,
  },
  twilio: {
    secret: process.env.TWILIO_SECRET,
    accSid: process.env.TWILIO_ACC_SID,
    serviceId: process.env.TWILIO_COPILOT_SRV_ID,
  },
  braintree: {
    environment:  process.env.BRAINTREE_ENV,
    publicKey: process.env.BRAINTREE_PUBLIC_KEY,
    privateKey: process.env.BRAINTREE_PRIVATE_KEY,
    merchantId: process.env.BRAINTREE_MERCHANT_ID,
    masterMerchantAccountId: process.env.BRAINTREE_MASTER_MERCHANT,
    channel: process.env.BRAINTREE_CHANNEL,
  },
  forceAppUpdate: process.env.FORCE_UPDATE,
  appVersion: process.env.APP_VERSION,
  /**
   * * '* * * * * *' - runs every second
   * '*!/5 * * * * *' - runs every 5 seconds
   * '10,20,30 * * * * *' - run at 10th, 20th and 30th second of every minute
   * '0 * * * * *' - runs every minute
   * '0 0 * * * *' - runs every hour (at 0 minutes and 0 seconds)
   **/
  notificationCronInterval: '* * * * * *', // every 30 seconds
  apnsBundleId: 'com.Citrusbits.hapiboiler',
  appDownloadLink: 'https://dummyimage.com/600x400/000000/ff0033.jpg&text=Placeholder',
};
