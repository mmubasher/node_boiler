'use strict';

const fs = require('fs');
const config = require('../../configs/config');
const path = require('path');
const awsS3 = require('./aws_sdk/index');
const nodemailer = require('nodemailer');
const uuid = require('uuid');
const mailTemplates = {
  'FORGOT_PASSWORD': 'password_reset',
};

function _extName (filename) {
  const ext = path.extname(filename || '').split('.');
  return ext.pop();
}

const uploadToLocal = function (rqFile, callback) {
  if (rqFile) {
    const path = `${config.rootPath}/${rqFile.hapi.filename}`;
    let file = fs.createWriteStream(path);
    rqFile.pipe(file);
    file.on('error', function (err) {
      return callback(err);
    });
    file.on('finish', function (err) {
      if (err) return callback(err);
      return callback(null, {
        fileName: rqFile.hapi.filename,
        fileExt: _extName(rqFile.hapi.filename),
        mimeType: rqFile.hapi.headers['content-type'],
        destination: path,
      });
    });
  }
};
const s3Upload = (file, callback) => {
  const fileName = `${uuid.v1()}.${_extName(file.hapi.filename)}`;
  Promise.all([awsS3.upload(fileName, file._data)])
    .then(urls => {
      return callback(null, {
        'fileName': urls[0],
      });
    })
    .catch(err => {
      return callback(err);
    });
};
/**
 * @name gen5DigitCode
 * @description Generate a random number
 * @return {number}
 */
const gen5DigitCode = function () {
  return Math.floor(Math.random() * 90000) + 10000;
};
/**
 * @name getMailTemplate
 * @param templateName
 * @param callback
 */
const getMailTemplate = function (templateName, callback) {
  fs.readFile(`././static/templates/${templateName}.html`, 'utf8',
    (err, data) => {
      if (err) {
        return callback(err, null);
      }
      return callback(null, data);
    });
};
/**
 * @name _sendEmail
 * @description Sends email
 * @param to Array
 * @param subject String
 * @param text String
 * @param html String
 * @param callback Boolean
 * @private
 */
const _sendEmail = function (to, subject, text, html, callback) {
  let transporter = nodemailer.createTransport(config.mailer);
  let mailOptions = {
    to: to, // list of receivers
    subject: subject, // Subject line
    text: text, // plain text body
    html: html,
  };
  // send mail with defined transport object
  transporter.sendMail(mailOptions, (error, info) => {
    if (error) {
      callback(error);
      return;
    }
    callback(null, info);
  });
};
/**
 * @name sendForgotPwdMail
 * @description Sends a forgotten password mail with link to reset
 * @param user [map]
 * @param code String
 * @param callback Boolean
 */
const sendForgotPwdMail = function (user, code, callback) {
  getMailTemplate(mailTemplates.FORGOT_PASSWORD,
    (err, template) => {
      if (err) {
        callback(err);
        return;
      }
      const txtContent = `Click here ${config.serverUri}/api/reset?code=${code}
    to reset your password on ${config.projectName}`; // plain text body
      let htmlContent = template;
      htmlContent = htmlContent.replace('{{first_name}}', user.first_name);
      htmlContent = htmlContent.replace('{{last_name}}', user.last_name);
      htmlContent = htmlContent.replace(/{{action_url}}/g, `${config.serverUri}/api/reset?code=${code}`);
      htmlContent = htmlContent.replace(/{{project_name}}/g, config.projectName);
      htmlContent = htmlContent.replace(/{{logo_url}}/g, `${config.serverUri}/images/logo.png`);
      htmlContent = htmlContent.replace('{{year}}', (new Date().getFullYear()));
      let subject = `${config.projectName} Forgotten password reset`;
      _sendEmail(user.email_address, subject, txtContent, htmlContent,
        (err, response) => {
          if (err) {
            callback(err);
            return;
          }
          if (!response.accepted.length) {
            callback(null, false);
            return;
          }
          callback(null, true);// email sent successfully
        });
    });
};
module.exports = {
  s3Upload,
  gen5DigitCode,
  uploadToLocal,
  sendForgotPwdMail,
};
