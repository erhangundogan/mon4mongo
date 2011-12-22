
/*!
 * mon4mongo - collection
 * Copyright(c) 2010 Erhan Gundogan <erhan@trposta.net>
 * MIT Licensed
 */

/**
 * Module dependencies.
 */
var mongo = require("mongodb");

/**
 * Collection object prototype.
 *
 * @param {object} monitor
 * @api public
 */
function Collection(monitor) {
  this.monitor = monitor;
}

/**
 * When collection object created this
 * must be the first called method to
 * initialize mongodb collection object
 *
 * @param {function} callback
 * @return {object} chaining
 * @api public
 */
Collection.prototype.initialize = function(callback) {
  this.monitor.initialize(function(err, db) {
    if (err) {
      console.log(err);
      callback(err, null);
    } else {
      callback(null, new mongo.Collection(db));
    }
  });

  return this;
}

/**
 * MongoDb driver collection object
 * wrapper for generic method calls
 *  - Initializes admin module
 *  - Calls method on module
 *
 *  @param {string} method
 *  @param {function} callback
 *  @return {object} chaining
 *  @api public
 */
Collection.prototype.fn = function(method, callback) {
  var self = this;

  function methodCall(_collection) {
    _collection[method](function(err, result) {
      if (err) {
        console.log(err);
        callback(err, null);
      } else {
        callback(null, result);
      }
    });
  }

  self.initialize(function(err, _collection){
    if (err) {
      callback(err, null);
    } else {
      methodCall(_collection);
    }
  });

  return this;
}

/*
 * Exports
 */
exports.collection = module.exports = Collection;