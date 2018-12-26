'use strict';

const scheduler = require('node-schedule');

module.exports = {
  /**
   * @name Start Cron Job
   * @param intervalStr
   */
  start: (server, intervalStr) => {
    scheduler.scheduleJob(intervalStr, () => {

    });
  },
};
