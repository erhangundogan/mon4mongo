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
  function _getServer(db) {
    return callback(null, {
      "host": db.serverConfig.host,
      "port": db.serverConfig.port,
      "db": db.databaseName,
      "state": db.state,
      "autoReconnect": db.serverConfig.autoReconnect
    });
  }
  if (!self.db) {
    this.initialize(function(err, db){
      if (err) {
        console.log(err);
        return callback(err, null);
      } else {
        return _getServer(db);
      }
    });
  } else {
    return _getServer(self.db);
  }
}

monitor.prototype.call = function(method, cb) {
  var self = this;
  function methodCall(db) {
    db[method](function(err, result) {
      if (err) {
        console.log(err);
        return cb(err, null);
      } else {
        return cb(null, result);
      }
    });
  }

  if (self.constructor.prototype.hasOwnProperty(method)) {
    self[method](function(err, result) {
      return err ? cb(err, null) : cb(null, result);
    });
  } else {
    if (!self.db) {
      self.initialize(function(err, db) {
        return err
          ? cb(err, null)
          : methodCall(db);
      })
    } else {
      return methodCall(self.db);
    }
  }
}

exports.monitor = monitor;