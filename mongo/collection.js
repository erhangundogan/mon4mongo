var mongo = require("mongodb");

function collection(monitor) {
  this.monitor = monitor;
}

// initialize
collection.prototype.initialize = function(callback) {
  if (!this._collection) {
    this.monitor.initialize(function(err, db) {
      if (err) {
        console.log(err);
        return callback(err, null);
      } else {
        this._collection = new mongo.Collection(db);
        return callback(null, this._collection);
      }
    })
  } else {
    return callback(null, this._collection);
  }
}

collection.prototype.call = function(method, cb) {
  var self = this;
  function methodCall(_collection) {
    _collection[method](function(err, result) {
      if (err) {
        console.log(err);
        return cb(err, null);
      } else {
        return cb(null, result);
      }
    });
  }

  if (!self._collection) {
    self.initialize(function(err, _collection){
      return err ? cb(err, null) : methodCall(_collection);
    })
  } else {
    return methodCall(self._collection);
  }
}

exports.collection = collection;