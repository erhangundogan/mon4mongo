
/*!
 * mon4mongo - admin
 * Copyright(c) 2010 Erhan Gundogan <erhan@trposta.net>
 * MIT Licensed
 */

/**
 * Module dependencies.
 */
var mongo = require("mongodb");

/**
 * Admin object prototype.
 *
 * @param {object} monitor
 * @api public
 */
function Admin(monitor) {
  this.monitor = monitor;
}

/**
 * When admin object created this
 * must be the first called method to
 * initialize mongodb admin object
 *
 * @param {function} callback
 * @return {object} chaining
 * @api public
 */
Admin.prototype.initialize = function(callback) {
  this.monitor.initialize(function(err, db) {
    if (err) {
      console.log(err);
      callback(err, null);
    } else {
       callback(null, new mongo.Admin(db));
    }
  });

  return this;
}

/**
 * MongoDb driver admin object
 * wrapper for generic method calls
 *  - Initializes admin module
 *  - Calls method on module
 *
 *  @param {string} method
 *  @param {function} callback
 *  @return {object} chaining
 *  @api public
 */
Admin.prototype.fn = function(method, callback) {
  var self = this;

  function methodCall(_admin) {
    _admin[method](function(err, result) {
      if (err) {
        console.log(err);
        callback(err, null);
      } else {
        callback(null, result);
      }
    });
  }

  this.initialize(function(err, _admin){
    if (err) {
      callback(err, null)
    } else {
      methodCall(_admin);
    }
  });

  return this;
}

/*
 * Exports
 */
exports.admin = module.exports = Admin;