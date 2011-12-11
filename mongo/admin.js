var mongo = require("mongodb");

function admin(monitor) {
  this.monitor = monitor;
}

// initialize
admin.prototype.initialize = function(callback) {
  if (!this._admin) {
    this.monitor.initialize(function(err, db) {
      if (err) {
        console.log(err);
        return callback(err, null);
      } else {
        this._admin = new mongo.Admin(db);
        return callback(null, this._admin);
      }
    })
  } else {
    return callback(null, this._admin);
  }
}

admin.prototype.call = function(method, cb) {
  var self = this;
  function methodCall(admin) {
    admin[method](function(err, result) {
      if (err) {
        console.log(err);
        return cb(err, null);
      } else {
        return cb(null, result);
      }
    });
  }

  if (!self._admin) {
    self.initialize(function(err, admin){
      if (err) {
        return cb(err, null);
      } else {
        return methodCall(admin);
      }
    })
  } else {
    return methodCall(self._admin);
  }
}

exports.admin = admin;