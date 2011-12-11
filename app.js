
/**
 * Module dependencies.
 */

var express = require("express")
  , app = module.exports.app = express.createServer()
  , MongoMonitor = require("./mongo/monitor.js").monitor
  , monitor = new MongoMonitor()
  , MongoAdmin = require("./mongo/admin.js").admin
  , admin = new MongoAdmin(monitor);

// Configuration
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
  app.use(express.errorHandler({ dumpExceptions: true, showStack: true })); 
});

app.configure("production", function(){
  app.use(express.errorHandler()); 
});

app.dynamicHelpers({
  base: function() {
    return "/" == app.route ? "" : app.route;
  },
  session: function(req, res) {
    return req.session;
  }
});

// Automatic route generator from module methods.
// base (mongodb module): admin,
// command (base module function): serverInfo,
// template (jade template): getInformation
function getRoute(base, command, template) {
  return function(req, res) {
    base.call(command, function(err, result) {
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

// Routes
app.get("/", function(req, res){
  res.render("index");
});
app.get("/getServer", getRoute(monitor, "getServer", "modules/monitor/getServer"));
app.get("/getInformation", getRoute(admin, "serverInfo", "modules/admin/getInformation"));
app.get("/pingServer", getRoute(admin, "ping", "modules/admin/pingServer"));
app.get("/profilingLevel", getRoute(admin, "profilingLevel", "modules/admin/profilingLevel"));

app.listen(3000);
console.log("Express server listening on port %d in %s mode",
  app.address().port, app.settings.env);
