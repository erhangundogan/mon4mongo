
/*!
 * mon4mongo - monitor
 * Copyright(c) 2010 Erhan Gundogan <erhan@trposta.net>
 * MIT Licensed
 */

/**
 * Module dependencies.
 */
var mongo = require("mongodb")
  , Db = mongo.Db
  , Connection = mongo.Connection
  , Server = mongo.Server
  , async = require("async");

/**
 * Monitor object prototype.
 * It corresponds to mongodb.Db object
 *
 * Examples:
 *  var monitor = new Monitor();
 *  var monitor = new Monitor("localhost", 27017, "test");
 *
 * @param {string} host
 * @param {number} port
 * @param {string] dbName
 * @api public
 */
function Monitor(host, port, dbName) {
  this.host = host || (process.env["MONGO_NODE_DRIVER_HOST"] != null
    ? process.env["MONGO_NODE_DRIVER_HOST"]
    : "localhost");
  this.port = port || (process.env["MONGO_NODE_DRIVER_PORT"] != null
    ? process.env["MONGO_NODE_DRIVER_PORT"]
    : Connection.DEFAULT_PORT);
  this.dbName = dbName || "admin";
}

/**
 * When monitor object created this
 * must be the first called method to
 * initialize mongodb
 *
 * @param {function} callback
 * @return {object} chaining
 * @api public
 */
Monitor.prototype.initialize = function(callback) {
  if (!this.db)
    this.db = new Db(this.dbName, new Server(this.host, this.port, {}), { native_parser:false });

  if (this.db.state !== "connected") {
    this.db.open(function(err, db) {
      if (err != null) {
        console.log(err);
        callback(err, null);
      } else {
        callback(null, db);
      }
    });
  } else {
    callback(null, this.db);
  }

  return this;
}

/**
 * Sometimes you want to implement a feature that doesn't exists
 * in mongodb objects. You can write your own functions with
 * mon4mongo modules and you can call them with same fashion.
 * However keep in mind that when you implement same method
 * in mon4mongo native mongodb method will be overridden.
 *
 * Examples:
 *  Db.prototype.collectionNames // native mongoDb method
 *  Monitor.prototype.collectionNames // overrides native method
 *
 * collectionNames using Caolan McMahon's async utilities library
 * https://github.com/caolan/async
 *
 * async.waterfall runs an array of functions in series,
 * each passing their results to the next in the array.
 *
 * @param {function} cb (callback)
 * @return {object} chaining
 * @api public
 */
Monitor.prototype.collectionNames = function(cb) {
  var self = this;
  async.waterfall([
    function(callback) {
      self.initialize(function(err, result) {
        callback(err, result);
      });
    },
    function(db, callback) {
      db.collectionNames(function(err, result) {
        callback(err, result);
      });
    },
    function(collections, callback) {
      var names = collections.map(function(collection) {
        return collection.name;
      });
      callback(null, names);
    }
  ], function(err, results) {
    return cb(err, results);
  });
}

/**
 * Gets server specific information.
 *
 * @param {function} callback
 * @return {object} chaining
 * @api public
 */

Monitor.prototype.getServer = function(callback) {
  var self = this;
  function _getServer(db) {
    callback(null, {
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
        callback(err, null);
      } else {
        _getServer(db);
      }
    });
  } else {
    _getServer(self.db);
  }

  return this;
}

/**
 * MongoDb driver db object
 * wrapper for generic method calls
 *  - Initializes db module
 *  - Calls method on module
 *
 *  @param {string} method
 *  @param {function} callback
 *  @return {object} chaining
 *  @api public
 */
Monitor.prototype.fn = function(method, callback) {
  var self = this;
  function methodCall(db) {
    db[method](function(err, result) {
      if (err) {
        console.log(err);
        callback(err, null);
      } else {
        callback(null, result);
      }
    });
  }

  if (self.constructor.prototype.hasOwnProperty(method)) {
    self[method](function(err, result) {
      if (err) {
        console.log(err);
        callback(err, null);
      } else {
        callback(null, result);
      }
    });
  } else {
    if (!self.db) {
      self.initialize(function(err, db) {
        if (err) {
          console.log(err);
          callback(err, null);
        } else {
          methodCall(db);
        }
      })
    } else {
      methodCall(self.db);
    }
  }

  return this;
};

/**
 * Get list of databases on server.
 * Must use admin database to execute {"listDatabases":1} command
 * TODO: switch to admin db before execute
 *
 * Mongo shell usage:
 *   use admin
 *   db.runCommand({"listDatabases":1});
 *
 * @param {function} callback
 */
Monitor.prototype.listDatabases = function(callback) {
  var self = this,
      db = this.db;

  function execCmd(db, command) {
    db.executeDbCommand(command, function(err, result) {
      if (err) {
        console.log(err);
        return callback(err, null);
      } else {
        if (result && result.documents && result.documents.length > 0) {
          var dbs = result.documents[0];
          if (dbs.hasOwnProperty("databases")) {
            return callback(null, dbs.databases);
          }
        }
        return callback(null, null);
      }
    });
  }

  if (!db) {
    this.initialize(function(err, _db) {
      execCmd(_db, {"listDatabases":1});
    });
  } else {
    execCmd(db, {"listDatabases":1});
  }
};

/**
 * Command execution
 *
 * @param {string} db
 * @param {object} command
 * @param {function} callback
 */
function executeCommand(db, command, callback) {
  if (!db) {
    return callback(null, null);
  } else {
    db.executeDbCommand(command, function(err, result) {
      if (err) {
        console.log(err);
        return callback(err, null);
      } else {
        return callback(null, result);
      }
    });
  }
}

/**
 * Gets active databases stats
 * use stat property to get specific variable.
 * Without specific variable results are:
   {
    "db" : "databaseName",
    "collections" : 5,
    "objects" : 23,
    "avgObjSize" : 138.6086956521739,
    "dataSize" : 3188,
    "storageSize" : 110592,
    "numExtents" : 6,
    "indexes" : 8,
    "indexSize" : 65408,
    "fileSize" : 201326592,
    "nsSizeMB" : 16,
    "ok" : 1
   }
 *
 * @param {string} stat (optional)
 * @param {function} callback
 */
Monitor.prototype.activeDatabaseInfo = function(stat, callback) {
  var self = this,
      db = this.db,
      haveStat = true;

  if (!callback && "function" == typeof stat) {
    callback = stat;
    haveStat = false;
  }

  function _callback(err, result) {
    if (err) {
      return callback(err);
    } else {
      if (result && result.documents && result.documents.length > 0) {
        var dbs = result.documents[0];
        return haveStat && dbs.hasOwnProperty(stat) ?
          callback(null, dbs[stat]) :
          callback(null, dbs);
      } else {
        return callback(null, null);
      }
    }
  }

  if (!db) {
    this.initialize(function(err, _db) {
      executeCommand(_db, {"listDatabases":1}, _callback);
    });
  } else {
    executeCommand(db, {"listDatabases":1}, _callback);
  }
};

/*
 * Exports
 */
exports.monitor = module.exports = Monitor;