
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
  , admin = new MongoAdmin(monitor);

/**
 * Configuration.
 */
app.configure(function(){
  app.set("views", __dirname + "/views");
  app.set("view engine", "jade");
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
  return function(req, res) {
    base.fn(command, function(err, result) {
      if (err) {
        res.partial("error", { err:err });
      } else {
        if (req.xhr) {
          res.partial(template, { result:result });
        } else {
          res.render(template, { result:result });
        }
      }
    });
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
  getRoute(monitor, "getServer", "modules/monitor/getServer"));

app.get("/getInformation",
  getRoute(admin, "serverInfo", "modules/admin/getInformation"));

app.get("/pingServer",
  getRoute(admin, "ping", "modules/admin/pingServer"));

app.get("/profilingLevel",
  getRoute(admin, "profilingLevel", "modules/admin/profilingLevel"));

app.get("/collectionsInfo",
  getRoute(monitor, "collectionsInfo", "modules/monitor/collectionsInfo"));

app.get("/collectionsNames",
  getRoute(monitor, "collectionNames", "modules/monitor/collectionsNames"));

app.get("/collectionsNames",
  getRoute(monitor, "collectionNames", "modules/monitor/collectionsNames"));

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
