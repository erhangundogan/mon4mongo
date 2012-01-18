
/*!
 * mon4mongo
 * Copyright(c) 2010 Erhan Gundogan <erhan@trposta.net>
 * MIT Licensed
 */

/**
 * Module dependencies.
 */
var express = require("express")
  , settings = require("./settings")
  , app = module.exports.app = express.createServer()
  , MongoMonitor = require("./mongo/monitor")
  , monitor = new MongoMonitor()
  , MongoAdmin = require("./mongo/admin")
  , admin = new MongoAdmin(monitor)
  , utils = require("./utils");

/**
 * Configuration.
 */
app.configure(function(){
  app.set("views", __dirname + "/views");
  app.set("view engine", "jade");
  app.use(express.logger());
  app.use(express.bodyParser());
  app.use(express.methodOverride());
  app.use(express.cookieParser());
  app.use(express.session({ secret: "your secret here" }));
  app.use(app.router);
  app.use("/public", express.static(__dirname + "/public"));
});

app.configure("development", function(){
  app.use(express.errorHandler({
    dumpExceptions: true, showStack: true
  }));
});

app.configure("production", function(){
  app.use(express.errorHandler()); 
});

/**
 * Dynamic Helpers.
 */
app.dynamicHelpers({
  base: function() {
    return "/" == app.route ? "" : app.route;
  },
  session: function(req, res) {
    return req.session;
  },
  settings: function() {
    return settings;
  },
  utils: function() {
    return utils;
  }
});

/**
 * Module base functions wrapper
 * calls command function on base and render
 * associated template with callback results
 *
 * Examples:
 *  getRoute(admin, "ping", "modules/admin/pingServer");
 *
 * @param {String} base
 * @param {String} command
 * @param {String} template
 * @return {Function} route
 * @api public
 */
function getRoute(base, command, template) {
  return function(req, res, next) {
    base.fn(command, function(err, result) {
      if (err) {
        next(err);
      } else {
        req.pre_process = result;
        req.template = template;
        next();
      }
    });
  }
}

function postProcess(fn) {
  return function(req, res, next) {
    var result = req.pre_process;
    function _process() {
      if (req.xhr) {
        return res.partial(req.template, { result:result });
      } else {
        return res.render(req.template, { result:result });
      }
    }

    if (fn) {
      fn(result, function(err, result) {
        if (err) {
          next(err);
        } else {
          _process(result);
        }
      });
    } else {
      _process(result);
    }
  }
}


/**
 * Routes.
 */
app.get("/", function(req, res){
  res.render("index");
});

app.get("/about", function(req, res){
  res.render("about");
});

app.get("/getServer",
  getRoute(monitor, "getServer", "modules/monitor/getServer"), postProcess());

app.get("/getInformation",
  getRoute(admin, "serverInfo", "modules/admin/getInformation"), postProcess());

app.get("/pingServer",
  getRoute(admin, "ping", "modules/admin/pingServer"), postProcess());

app.get("/profilingLevel",
  getRoute(admin, "profilingLevel", "modules/admin/profilingLevel"), postProcess());

app.get("/collectionsInfo",
  getRoute(monitor, "collectionsInfo", "modules/monitor/collectionsInfo"), postProcess());

app.get("/collectionsNames",
  getRoute(monitor, "collectionNames", "modules/monitor/collectionsNames"), postProcess());

app.get("/listDatabases",
  getRoute(monitor, "listDatabases", "modules/monitor/listDatabases"),
  postProcess(
    /*
    function(items, callback) {
      try {
        var result = items.map(function(item) {
          return JSON.stringify(item);
        });
        callback(null, result);
      } catch(err) {
        callback(err, null);
      }
    }
    */
));

app.get("/activeDatabase", function(req, res) {
  monitor.initialize(function(err, db) {
    if (err) {
      res.end();
    } else {
      res.json(db.databaseName);
    }
  });
  /*
  monitor.activeDatabaseInfo("db", function(err, dbName) {
    res.json(dbName);
  })
  */
});

app.get("/changeDatabase/:db", function(req, res) {
  if (!req.params.db) {
    res.end();
  } else {
    admin.initialize(function(err, _admin) {
      if (err) {
        res.json(false);
      } else {
        _admin.db.databaseName = req.params.db;
        res.json(true);
      }
    });
  }
});

app.post("/profilingLevel", function(req, res, next) {
  var result = req.body.set;
  if (result) {
    // set profiling on
  } else {
    // set profiling off
  }
  //res.header('Content-Type', 'application/json');
  res.json({ success:true });
  res.end();
});


app.listen(settings.server.port);
console.log("Express server listening on port %d in %s mode",
  app.address().port, app.settings.env);
