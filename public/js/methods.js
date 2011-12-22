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
          $("#content").prepend( err || result );
        }
      });
    });
  });
});



