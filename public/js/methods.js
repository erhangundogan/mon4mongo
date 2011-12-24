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
      requestAddress: "/collectionsNames" }
  ].map(function(item) {
    $(item.navLinkID).bind("click", function(event) {
      event.preventDefault();
      var panel = $(item.bodyElementID);
      if (panel && panel.length > 0) {
        return;
      }

      $.ajax({
        url: item.requestAddress,
        dataType: "html",
        success: function(err, result) {
          var vAlign = new vAlignment();
          var element = "#" + vAlign.calculateColumns().getKey().result.key;
          $(element).prepend( err || result );
        }
      });
    });
  });
});



