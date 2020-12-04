if (adminState === true) {
  $("#addresses").after('<div id="massiveChange" class="modal fade hide" tabindex="-1"><div class="modal-header"><button type="button" class="close" data-dismiss="modal">×</button><h3>Batch edit</h3></div><div class="modal-body"><p>You may here overwrite any fields in all open entries:</p><p id="fieldPicker"></p></div><div class="modal-footer"><button class="btn btn-secondary" data-dismiss="modal">Close</button><button type="button" id="cmd-mass-change" class="btn btn-primary">Batch edit</button></div></div>');
  $("#addresses").after('<div id="errorMessage" class="modal fade hide" tabindex="-1"><div class="modal-header"><h3>Error</h3></div><div class="modal-body"><p id="errorText"></p></div><div class="modal-footer"><button class="btn" data-dismiss="modal">OK</button></div></div></div><div id="deleteMessage" class="modal fade hide" tabindex="-1"><div class="modal-header"><button type="button" class="close" data-dismiss="modal">×</button><h3>Massive delete</h3></div><div class="modal-body"><p>By clicking <strong>Delete</strong>, you are confirming that you would like to <strong>permanently delete</strong> all rows currently opened on this page.</p></div><div class="modal-footer"><p><button type="button" id="cmd-mass-delete" class="btn btn-danger">Delete</button></p></div></div>');
  $(document).on('click', ".cmd-osm", function() {
    var elem = this;
    var prevAddress = $(elem).siblings("[name='address']").val();
    var prevCity = $(elem).siblings("[name='city']").val();
    var prevPostCode = $(elem).siblings("[name='postcode']").val();
    var prevLat = $(elem).siblings("[name='lat']").val();
    var prevLng = $(elem).siblings("[name='lng']").val();
    $.getJSON("https://nominatim.openstreetmap.org/search?street=" + encodeURIComponent(prevAddress) + "&city=" + encodeURIComponent(prevCity) + "&state=quebec&country=canada&format=json&addressdetails=1").done(function(data) {
      try {
        var initialData = data;
        data = $.grep(data, function(a) {
          return a.osm_type === "node" || a.type === "house";
        });
        if (data.length == 1) {
          var newAddress = data[0].address.house_number + " " + data[0].address.road;
          var newCity = "",
            newPostCode = "";
          if ("city_district" in data[0].address) {
            newCity = data[0].address.city_district;
          } else if ("suburb" in data[0].address) {
            newCity = data[0].address.suburb;
          } else if ("town" in data[0].address) {
            newCity = data[0].address.town;
          } else if ("village" in data[0].address) {
            newCity = data[0].address.village;
          } else if ("city" in data[0].address) {
            newCity = data[0].address.city;
          }
          if ("postcode" in data[0].address) {
            newPostCode = data[0].address.postcode;
          } else {
            newPostCode = prevPostCode;
          }

          var newLat = data[0].lat;
          var newLng = data[0].lon;

          if ([newAddress, newCity, newPostCode, newLat, newLng].join(", ") != [prevAddress, prevCity, prevPostCode, prevLat, prevLng].join(", ")) {
            var modified = [];
            if (newAddress != prevAddress) {
              $(elem).siblings("[name='address']").val(newAddress);
              if (prevAddress === "") prevAddress = "blank address";
              modified.push(prevAddress);
            }
            if (newCity != prevCity) {
              $(elem).siblings("[name='city']").val(newCity);
              if (prevCity === "") prevCity = "blank city";
              modified.push(prevCity);
            }
            if (newPostCode != prevPostCode) {
              $(elem).siblings("[name='postcode']").val(newPostCode);
              if (prevPostCode === "") prevPostCode = "blank postal code";
              modified.push(prevPostCode);
            }
            if (newLat != prevLat) {
              $(elem).siblings("[name='lat']").val(newLat);
              if (prevLat === "") prevLat = "blank latitude";
              modified.push(prevLat);
            }
            if (newLng != prevLng) {
              $(elem).siblings("[name='lng']").val(newLng);
              if (prevLng === "") prevLng = "blank longitude";
              modified.push(prevLng);
            }
            if (newProv != prevProv) {
              $(elem).siblings("[name='province']").val(newProv);
              if (prevProv === "") prevProv = "blank province";
              modified.push(prevProv);
            }
            //$(elem).siblings("[name='province']").val("QC");
            $(elem).siblings("[name='country']").val("Canada");
            $(elem).closest("td").find("#geoMessage").html("Replaced: " + modified.join(", "));
          } else {
            $(elem).closest("td").find("#geoMessage").html("The geotag operation did not reveal new or updated information.");
            isBatch && $(elem).closest("tr").find(".cmd-cancel").click();
          }
        } else if (data.length === 0) {
          $(elem).siblings("#geoMessage").html("Failed to geocode: no matches!");
          console.log(initialData);
        } else {
          $(elem).siblings("#geoMessage").html("Failed to geocode: too many matches");
          console.log(initialData);
        }
      } catch (err) {
        $("#errorText").html(err);
        $("#error-show").click();
      }
    });
  });
  $(document).on('click', ".cmd-bing", function() {
    var elem = this;
    var prevAddress = $(elem).siblings("[name='address']").val();
    var prevCity = $(elem).siblings("[name='city']").val();
    var prevPostCode = $(elem).siblings("[name='postcode']").val();
    var prevProvince = $(elem).siblings("[name='province']").val();
    //var province = "QC";
    var country = "Canada";
    var prevLat = $(elem).siblings("[name='lat']").val();
    var prevLng = $(elem).siblings("[name='lng']").val();
    $.getJSON("https://dev.virtualearth.net/REST/v1/Locations/" + encodeURIComponent([prevAddress, prevCity, prevPostCode, prevProvince, country].join(", ")) + "?key=" + bingAPIKey + "&output=JSON").done(function(data) {
      try {
        if (data.resourceSets[0].resources[0].confidence == "High" && data.resourceSets[0].resources[0].matchCodes[0] == "Good" && data.resourceSets[0].resources[0].entityType == "Address") {
          var newAddress = data.resourceSets[0].resources[0].address.addressLine;
          var newCity = data.resourceSets[0].resources[0].address.locality;
          var newPostCode = data.resourceSets[0].resources[0].address.postalCode;
          var newProvince = data.resourceSets[0].resources[0].address.adminDistrict;
          var newLat = data.resourceSets[0].resources[0].point.coordinates[0];
          var newLng = data.resourceSets[0].resources[0].point.coordinates[1];
          if ([newAddress, newCity, newPostCode, newLat, newLng, newProvince].join(", ") != [prevAddress, prevCity, prevPostCode, prevLat, prevLng, prevProvince].join(", ")) {
            var modified = [];
            if (newAddress != prevAddress) {
              $(elem).siblings("[name='address']").val(newAddress);
              if (prevAddress === "") prevAddress = "blank address";
              modified.push(prevAddress);
            }
            if (newCity != prevCity) {
              $(elem).siblings("[name='city']").val(newCity);
              if (prevCity === "") prevCity = "blank city";
              modified.push(prevCity);
            }
            if (newPostCode != prevPostCode) {
              $(elem).siblings("[name='postcode']").val(newPostCode);
              if (prevPostCode === "") prevPostCode = "blank postal code";
              modified.push(prevPostCode);
            }
            if (newLat != prevLat) {
              $(elem).siblings("[name='lat']").val(newLat);
              if (prevLat === "") prevLat = "blank latitude";
              modified.push(prevLat);
            }
            if (newLng != prevLng) {
              $(elem).siblings("[name='lng']").val(newLng);
              if (prevLng === "") prevLng = "blank longitude";
              modified.push(prevLng);
            }
            if (newProvince != prevProvince) {
              $(elem).siblings("[name='province']").val(newProvince);
              if (prevProvince === "") prevProvince = "blank province";
              modified.push(prevProvince);
            }
            //$(elem).siblings("[name='province']").val("QC");
            $(elem).siblings("[name='country']").val("Canada");
            $(elem).closest("td").find("#geoMessage").html("Replaced: " + modified.join(", "));
          } else {
            $(elem).closest("td").find("#geoMessage").html("The geotag operation did not reveal new or updated information.");
            isBatch && $(elem).closest("tr").find(".cmd-cancel").click();
          }
        } else {
          $(elem).siblings("#geoMessage").html("Failed to geocode: Confidence not high enough");
        }
      } catch (err) {
        $("#errorText").html(err);
        $("#error-show").click();
      }
    });
  });
  var target = $("#addresses").parent()[0];
  var observer = new MutationObserver(function(mutations) {
    mutations.forEach(function(mutation) {
      if (mutation.addedNodes.length > 0 && mutation.type == "childList") {
        $(mutation.addedNodes).find(".cmd-geocode").html("Google");
        $(mutation.addedNodes).find("[name='lng']").siblings("small.muted").before("<small class='muted' id='geoMessage'></small><br/>");
        $(mutation.addedNodes).find(".cmd-geocode").after('<button type="button" class="btn btn-info btn-small cmd-bing">Bing</button><br/>');
        $(mutation.addedNodes).find(".cmd-geocode").after('<button type="button" class="btn btn-info btn-small cmd-osm">OSM</button>');
        $(mutation.addedNodes).find("small.tt").each(function() {
          $(this).html($(this).html() + ": " + $(this).data("original-title").split(" by ")[1].match(/\b(\w)/g).join(""));
        });
      }
    });
  });
  var config = {
    childList: true,
    subtree: true
  };
  observer.observe(target, config);
  $("td.person small.tt").each(function() {
    $(this).html($(this).html() + ": " + $(this).data("original-title").split(" by ")[1].match(/\b(\w)/g).join(""));
  });
  $("li.visible-desktop").after("<li class='dropdown admin'><button id='dropdown-admin' class='btn btn-lg btn-danger' data-toggle='dropdown'>Admin</button><ul class='dropdown-menu'><li><a id='select-all'>Open all entries for editing</a></li><li class='divider'></li><li><a id='bing-all'>Correct opened addresses using Bing</a></li><li><a id='osm-all'>Correct opened addresses using OSM</a></li><li><a id='massive-change' href='#massiveChange' data-toggle='modal'>Batch edit fields in opened entries</a></li><li><a id='search-replace'>Search and replace in all opened entries</a></li><li class='divider'></li><li><a id='save-all'>Save all opened entries</a></li><li><a id='delete-all'>Delete all opened entries</a></li><li><a id='cancel-all'>Cancel all modifications</a></li></ul></li><button id='error-show' href='#errorMessage' class='hide' data-toggle='modal'>Error</button><button id='delete-show' href='#deleteMessage' class='hide' data-toggle='modal'>Error</button>");
  $("#select-all").click(function() {
    $.fx.off = true;
    $("#addresses tr").click();
  });
  $("#bing-all").click(function() {
    var bingbing = $(".cmd-bing").length,
      counter = 0,
	  delay = 100;
    for (let i = bingbing; i > 0; i--) {
      setTimeout(function() {
        console.log("$(\".cmd-bing\").eq(" + (i - 1) + ").click();")
        $(".cmd-bing").eq(i - 1).click();
      }, counter * delay); //100ms between requests
      counter++;
    }
    //$(".cmd-bing").click(); 
	// before, click all at the same time.
	// Now, click on all from last to first, spaced out by "delay" milliseconds.
  });
  $("#osm-all").click(function() {
    $(".cmd-osm").click();
  });
  $("#search-replace").click(function() {
    var regexP = prompt("Please enter the regex search expression here:");
    try {
      if (regexP === "" || regexP === undefined) throw ("No regex search expression was entered.");
      var regex = new RegExp(regexP, "gim");
      var matches = [];
      $("#addresses input[type='text'], #addresses select, #addresses textarea").each(function() {
        if ($(this).val().match(regex)) {
          matches.push($(this).val());
        }
      });
      if (matches.length > 0) {
        var replaceP = prompt("Please enter the replacement value here:");
        var promptMessage = "The following matches will be replaced as follows:\n__________________________________\n";
        matches.forEach(function(v, k) {
          promptMessage += "\n" + v + "       ->       " + v.replace(regex, replaceP);
        });
        if (confirm(promptMessage)) {
          $("#addresses input[type='text'], #addresses select, #addresses textarea").each(function() {
            $(this).val($(this).val().replace(regex, replaceP));
          });
        } else {
          throw ("The replace operation was cancelled.");
        }
      } else {
        throw ("There were no matches to your search pattern.");
      }
    } catch (err) {
      $("#errorText").html(err);
      $("#error-show").click();
    }
  });
  $("#massive-change").click(function() {
    //$("#fieldPicker").html($("#addresses tr td:nth-child(2) select").first().clone());
    $("#fieldPicker").html("");
    var elements = $("#addresses tr.edit:first").find("select:visible, input:visible, textarea:visible").clone();
    elements.each(function(element) {
      $(this).addClass("massiveField").val("");
      $("#fieldPicker").append("<span class='massiveLabel'>" + $(this).prop("name") + "</span>", $(this));
      $("#fieldPicker").append("<br/>");
    });
  });
  $("#cmd-mass-change").click(function() {
    $(".massiveField").each(function() {
      if (!($(this).val() == "" || $(this).val() == null)) {
        var newValue = $(this).val();
        $("[name=" + $(this).prop("name") + "]").each(function() {
          //
          console.log(this.nodeName)
          if (this.nodeName.toLowerCase() == "textarea") {
            newValue = $(this).val().trim() + "\n" + newValue;
          }
          $(this).val(newValue.replace(/[\n]+/g, "\n").trim());
        });
      }
    });
    $("#massiveChange .btn-secondary").click();
  });
  $("#save-all").click(function() {
    $(".cmd-save").click();
  });
  $("#delete-all").click(function() {
    $("#delete-show").click();
  });
  $("#cmd-mass-delete").click(function() {
    $("#deleteMessage .close").click();
    $(".cmd-delete").click();
    $(".bootbox .modal-footer a.btn-primary").each(function() {
      $(this).get(0).click();
    });
  });
  $("#cancel-all").click(function() {
    $(".cmd-cancel").click();
  });
  var isBatch = false;
  $('#dropdown-admin').on('click', function() {
    if ($(".dropdown-menu").is(":visible")) { // menu just closed
      $.fx.off = false;
    } else { // menu just opened
      $.fx.off = true;
      if ($("#addresses tr.edit").length === 0) {
        $("#massive-change, #bing-all, #osm-all, #search-replace, #save-all, #delete-all, #cancel-all").parent("li").addClass("disabled");
      } else {
        $("#massive-change, #bing-all, #osm-all, #search-replace, #save-all, #delete-all, #cancel-all").parent("li").removeClass("disabled");
      }
      isBatch = $("#addresses tr.edit").length > 1 && true;
    }
  });
}
