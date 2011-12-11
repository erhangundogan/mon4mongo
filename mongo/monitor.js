var mongo = require("mongodb")
  , Db = mongo.Db
  , Connection = mongo.Connection
  , Server = mongo.Server;

function monitor(host, port, dbName) {
  this.host = host || (process.env["MONGO_NODE_DRIVER_HOST"] != null
    ? process.env["MONGO_NODE_DRIVER_HOST"]
    : "localhost");
  this.port = port || (process.env["MONGO_NODE_DRIVER_PORT"] != null
    ? process.env["MONGO_NODE_DRIVER_PORT"]
    : Connection.DEFAULT_PORT);
  this.dbName = dbName || "test";
}

monitor.prototype.initialize = function(callback) {
  if (!this.db)
    this.db = new Db(this.dbName, new Server(this.host, this.port, {}), { native_parser:false });

  if (this.db.state !== "connected") {
    this.db.open(function(err, db) {
      if (err != null) {
        console.log(err);
        return callback(err, null);
      } else {
        return callback(null, db);
      }
    });
  } else {
    return callback(null, this.db);
  }
}

monitor.prototype.getServer = function(callback) {
  var self = this;
  function _getServer() {
    return callback(null, {
      "host": self.host,
      "port": self.port,
      "db": self.dbName
    });
  }
  if (!this.db) {
    this.initialize(function(err, db){
      if (!err) {
        return _getServer();
      } else {
        return callback(err, null);
      }
    });
  } else {
    return _getServer();
  }
}

monitor.prototype.call = function(method, cb) {
  var self = this;
  function methodCall(_monitor) {
    _monitor[method](function(err, result) {
      if (err) {
        console.log(err);
        return cb(err, null);
      } else {
        return cb(null, result);
      }
    });
  }

  if (!self.db) {
    self.initialize(function(err, db) {
      return err ? cb(err, null) : methodCall(self);
    })
  } else {
    return methodCall(self);
  }
}

exports.monitor = monitor;