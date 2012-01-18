/*!
 * vertical-alignment helper
 * Copyright(c) 2011 Erhan Gundogan <erhan@trposta.net>
 * MIT Licensed
 */

/**
 * usage:
 *   // vAlign.columnIDs has id of elements
 *   // default function is Math.min but you can apply function to getKey(fn)
 *   // result.key => elementID
 *   // result.value => value
 *   var vAlign = new vAlignment();
 *   vAlign.calculateColumns().getKey().result.key;
 */

function vAlignment() {
  this.columns = [];
}

vAlignment.prototype.columnIDs = ["row1", "row2", "row3"];

vAlignment.prototype.getKey = function(fn) {
  this.fn = fn || Math.min;
  var value = this.fn.apply(null, this.columns);
  var index = this.columns.indexOf(value);
  this.result = {key:this.columnIDs[index], value:value};
  return this;
}

vAlignment.prototype.calculateColumns = function() {
  this.columns = this.columnIDs.map(function(columnID){
    var elementID = "#" + columnID;
    return $(elementID).height();
  });
  return this;
}

/**
 * sidebar links jQuery bindings.
 *
 */

$(function(){
  [ { navLinkID: "#pingLink",
      bodyElementID: "#pingServer",
      requestAddress: "/pingServer" },
    { navLinkID: "#settingsLink",
      bodyElementID: "#getServer",
      requestAddress: "/getServer" },
    { navLinkID: "#informationLink",
      bodyElementID: "#getInformation",
      requestAddress: "/getInformation" },
    { navLinkID: "#profilingLevelLink",
      bodyElementID: "#profilingLevel",
      requestAddress: "/profilingLevel" },
    { navLinkID: "#collectionsInfoLink",
      bodyElementID: "#collectionsInfo",
      requestAddress: "/collectionsInfo" },
    { navLinkID: "#collectionsNamesLink",
      bodyElementID: "#collectionsNames",
      requestAddress: "/collectionsNames" },
    { navLinkID: "#listDatabasesLink",
      bodyElementID: "#listDatabases",
      requestAddress: "/listDatabases" },
  ].map(function(item) {
    $(item.navLinkID).bind("click", function(event) {
      event.preventDefault();
      var panel = $(item.bodyElementID);
      if (panel && panel.length > 0) {
        return;
      }
      bindAddress(item.requestAddress);
    });
  });
});

function bindDBAddresses() {
  $(".db-link a").each(function(index, item) {
    $(this).bind("click", function(event) {
      event.preventDefault();
      var address = "/changeDatabase/" + $(this).attr("data-db");
      $.ajax({
        url: address,
        dataType: "json",
        error: function(jqXHR, textStatus, errorThrown) {
          alert(textStatus);
          console.log(jqXHR);
        },
        complete: function(jqXHR, textStatus) {
          highlightActiveDB();
        }
      });
    });
  });
}

function highlightActiveDB() {
  $.ajax({
    url: "/activeDatabase",
    dataType: "json",
    success: function(data, textStatus, jqXHR) {
      if (data) {
        $(".db-link a").each(function(index) {
          var db = $(this).attr("data-db");
          if (data == db) {
            $(this).attr("class", "active");
          } else {
            $(this).removeAttr("class");
          }
        });
      }
    }
  });
}

function bindAddress(address, responseType) {
  $.ajax({
    url: address,
    dataType: responseType || "html",
    success: function(err, result) {
      var vAlign = new vAlignment();
      var element = "#" + vAlign.calculateColumns().getKey().result.key;
      $(element).prepend( err || result );
    }
  });
}
