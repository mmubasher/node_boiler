/**
 * @author: mmubasher
 */

'use strict';

const config = require('../../configs/config');
let mysql = require('mysql');
const pool = mysql.createPool(config.db);
mysql = undefined; // for the sake of re-use

module.exports = {
  pool,
  query: function () {
    let SqlArgs = [];
    let args = [];
    for (let i = 0; i < arguments.length; i++) {
      args.push(arguments[i]);
    }
    let callback = args[args.length - 1]; // last arg is callback
    pool.getConnection(function (err, connection) {
      if (err) {
        return callback(err);
      }
      if (args.length > 2) {
        SqlArgs = args[1];
      }
      connection.query(args[0], SqlArgs, function (err, results) {
        connection.release(); // always put connection back in pool after last query
        if (err) {
          return callback(err);
        }
        callback(null, results);
      });
    });
  },
};
