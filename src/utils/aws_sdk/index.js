'use strict';

const config = require('../../../configs/config');
const AWS = require('aws-sdk');

AWS.config.update({
  accessKeyId: config.aws.accessKey,
  secretAccessKey: config.aws.secretAccessKey,
});
const s3 = new AWS.S3({apiVersion: '2006-03-01'});

function upload (fileName, fileBuffer) {
  return new Promise(function (resolve, reject) {
    const uploadParams = {
      Bucket: config.aws.bucketId, Key: fileName,
      Body: fileBuffer, ContentEncoding: 'base64', ContentType: 'image/jpeg',
    };
    s3.upload(uploadParams, function (err, data) {
      if (err) {
        return reject(err);
      }
      if (data) {
        return resolve(data.Key);
      }
      resolve(null);
    });
  });
}

module.exports = {
  upload,
};
