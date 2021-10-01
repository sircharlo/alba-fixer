// ==UserScript==
// @name         Alba Enhancer
// @version      0.1.6
// @description  Utilities and fixes for Alba
// @author       SirCharlo
// @match        https://www.mcmxiv.com/alba/*
// @require      https://code.jquery.com/jquery-3.6.0.min.js
// @require      https://cdnjs.cloudflare.com/ajax/libs/jquery.tablesorter/2.31.3/js/jquery.tablesorter.min.js
// @require      https://cdnjs.cloudflare.com/ajax/libs/Chart.js/2.9.3/Chart.min.js
// @grant        GM_addStyle
// ==/UserScript==

/* eslint no-undef: "off", no-console: "off" */

$(function() {
  var colors = ["#b71c1c", "#880e4f", "#4a148c", "#0d47a1", "#006064", "#1b5e20", "#827717", "#ff6f00", "#212121", "#b71c1c", "#880e4f", "#4a148c", "#0d47a1", "#006064", "#1b5e20", "#827717", "#ff6f00", "#212121"],
    hereAPIKey = "aXUToJoWnlgv0zCAgupM7ukogmefDriDS2ZcQroT8Ps",
    mapquestAPIKey = "cWthMOAPfdye1t02NcpkzD30NVLfhNy6";
  GM_addStyle(".disabled a{pointer-events:none} li.dropdown.admin{padding-top:4px}");
  $("ul.pull-right li.dropdown").last().find("a").first().find(".muted").hide();
  $("ul.nav:not(.pull-right) > li").each(function() {
    $(this).find("span").text($(this).find("span").text().replace(String.fromCharCode(160) + String.fromCharCode(160) + "Users", "").replace(String.fromCharCode(160) + String.fromCharCode(160) + "Account", ""));
  });

  let curPage = location.pathname;
  if (curPage.includes("home") || curPage === "/alba/") {
    $("div.container > h3").each(function() {
      let total = $(this).html().replace(/\D/g, "");
      $(this).next().find("tr span.badge").each(function() {
        let percent = ($(this).html().replace(/\D/g, "") / total * 100).toFixed(1) + "%";
        $(this).parent().next("td").html(percent);
        $(this).parent().next("td").next("td").find("div.progress div.bar").css("width", percent);
      });
    });
  } else if (curPage.includes("addresses")) {
    GM_addStyle(".massiveLabel{width:8em;display:inline-block;vertical-align:top}");
    $("#addresses").after("<div id=\"massiveChange\" class=\"modal fade hide\" tabindex=\"-1\"><div class=\"modal-header\"><button type=\"button\" class=\"close\" data-dismiss=\"modal\">×</button><h3>Batch edit</h3></div><div class=\"modal-body\"><p>You may here overwrite any fields in all open entries:</p><p id=\"fieldPicker\"></p></div><div class=\"modal-footer\"><button class=\"btn btn-secondary\" data-dismiss=\"modal\">Close</button><button type=\"button\" id=\"cmd-mass-change\" class=\"btn btn-primary\">Batch edit</button></div></div>");
    $("#addresses").after("<div id=\"errorMessage\" class=\"modal fade hide\" tabindex=\"-1\"><div class=\"modal-header\"><h3>Error</h3></div><div class=\"modal-body\"><p id=\"errorText\"></p></div><div class=\"modal-footer\"><button class=\"btn\" data-dismiss=\"modal\">OK</button></div></div></div><div id=\"deleteMessage\" class=\"modal fade hide\" tabindex=\"-1\"><div class=\"modal-header\"><button type=\"button\" class=\"close\" data-dismiss=\"modal\">×</button><h3>Massive delete</h3></div><div class=\"modal-body\"><p>By clicking <strong>Delete</strong>, you are confirming that you would like to <strong>permanently delete</strong> all rows currently opened on this page.</p></div><div class=\"modal-footer\"><p><button type=\"button\" id=\"cmd-mass-delete\" class=\"btn btn-danger\">Delete</button></p></div></div>");
    $(document).on("click", ".cmd-osm", function() {
      var elem = this,
        prevAddress = $(elem).siblings("[name='address']").val(),
        prevCity = $(elem).siblings("[name='city']").val(),
        prevPostCode = $(elem).siblings("[name='postcode']").val(),
        prevProv = $(elem).siblings("[name='province']").val(),
        prevLat = $(elem).siblings("[name='lat']").val(),
        prevLng = $(elem).siblings("[name='lng']").val();
      $.getJSON("https://nominatim.openstreetmap.org/search?street=" + encodeURIComponent(prevAddress) + "&city=" + encodeURIComponent(prevCity) + "&state=quebec&country=canada&format=json&addressdetails=1").done(function(data) {
        try {
          console.log(data);
          var initialData = data;
          if ($.grep(data, function(a) {
            return "node" === a.osm_type || "house" === a.type;
          }).length === 1) {
            var newAddress = data[0].address.house_number + " " + data[0].address.road,
              newCity = "",
              newProv = "QC",
              newPostCode = "postcode" in data[0].address ? data[0].address.postcode : prevPostCode,
              newLat = data[0].lat,
              newLng = data[0].lon;
            "city_district" in data[0].address ? newCity = data[0].address.city_district : "suburb" in data[0].address ? newCity = data[0].address.suburb : "town" in data[0].address ? newCity = data[0].address.town : "village" in data[0].address ? newCity = data[0].address.village : "city" in data[0].address && (newCity = data[0].address.city);
            if ([newAddress, newCity, newPostCode, newLat, newLng].join(", ") != [prevAddress, prevCity, prevPostCode, prevLat, prevLng].join(", ")) {
              var modified = [];
              newAddress != prevAddress && ($(elem).siblings("[name='address']").val(newAddress), "" === prevAddress && (prevAddress = "blank address"), modified.push(prevAddress));
              newCity != prevCity && ($(elem).siblings("[name='city']").val(newCity), "" === prevCity && (prevCity = "blank city"), modified.push(prevCity));
              newPostCode != prevPostCode && ($(elem).siblings("[name='postcode']").val(newPostCode), "" === prevPostCode && (prevPostCode = "blank postal code"), modified.push(prevPostCode));
              newLat != prevLat && ($(elem).siblings("[name='lat']").val(newLat), "" === prevLat && (prevLat = "blank latitude"), modified.push(prevLat));
              newLng != prevLng && ($(elem).siblings("[name='lng']").val(newLng), "" === prevLng && (prevLng = "blank longitude"), modified.push(prevLng));
              newProv != prevProv && ($(elem).siblings("[name='province']").val(newProv), "" === prevProv && (prevProv = "blank province"), modified.push(prevProv));
              $(elem).siblings("[name='country']").val("Canada");
              $(elem).closest("td").find("#geoMessage").html("Replaced: " + modified.join(", "));
            } else {
              $(elem).closest("td").find("#geoMessage").html("The geotag operation did not reveal new or updated information.");
              isBatch && $(elem).closest("tr").find(".cmd-cancel").click();
            }
          } else {
            0 === data.length ? ($(elem).siblings("#geoMessage").html("Failed to geocode: no matches!"), console.log(initialData)) : ($(elem).siblings("#geoMessage").html("Failed to geocode: too many matches"), console.log(initialData));
          }
        } catch (err) {
          $("#errorText").html(err), $("#error-show").click();
        }
      });
    });
    $(document).on("click", ".cmd-bing", function() {
      var elem = this,
        prevAddress = $(elem).siblings("[name='address']").val(),
        prevCity = $(elem).siblings("[name='city']").val(),
        prevPostCode = $(elem).siblings("[name='postcode']").val(),
        prevProvince = $(elem).siblings("[name='province']").val(),
        prevLat = $(elem).siblings("[name='lat']").val(),
        prevLng = $(elem).siblings("[name='lng']").val();
      $.getJSON("https://geocode.search.hereapi.com/v1/geocode?q=" + encodeURIComponent([prevAddress, prevCity, prevPostCode, prevProvince, "Canada"].join(", ")) + "&apiKey=" + hereAPIKey + "&output=JSON").done(function(data) {
        try {
          var firstItem = data.items[0];
          if (firstItem.resultType == "houseNumber" && firstItem.scoring.queryScore > 0.5) {
            var newAddress = firstItem.address.houseNumber + " " + firstItem.address.street,
              newCity = firstItem.address.city,
              newPostCode = firstItem.address.postalCode,
              newProv = "QC",
              newLat = firstItem.position.lat,
              newLng = firstItem.position.lng;
            if ([newAddress, newCity, newPostCode, newLat, newLng, newProv].join(", ") != [prevAddress, prevCity, prevPostCode, prevLat, prevLng, prevProvince].join(", ")) {
              var modified = [];
              newAddress != prevAddress && ($(elem).siblings("[name='address']").val(newAddress), "" === prevAddress && (prevAddress = "blank address"), modified.push(prevAddress)), newCity != prevCity && ($(elem).siblings("[name='city']").val(newCity), "" === prevCity && (prevCity = "blank city"), modified.push(prevCity)), newPostCode != prevPostCode && ($(elem).siblings("[name='postcode']").val(newPostCode), "" === prevPostCode && (prevPostCode = "blank postal code"), modified.push(prevPostCode)), newLat != prevLat && ($(elem).siblings("[name='lat']").val(newLat), "" === prevLat && (prevLat = "blank latitude"), modified.push(prevLat)), newLng != prevLng && ($(elem).siblings("[name='lng']").val(newLng), "" === prevLng && (prevLng = "blank longitude"), modified.push(prevLng)), newProv != prevProvince && ($(elem).siblings("[name='province']").val(newProv), "" === prevProvince && (prevProvince = "blank province"), modified.push(prevProvince)), $(elem).siblings("[name='country']").val("Canada"), $(elem).closest("td").find("#geoMessage").html("Replaced: " + modified.join(", "));
            } else $(elem).closest("td").find("#geoMessage").html("The geotag operation did not reveal new or updated information."), isBatch && $(elem).closest("tr").find(".cmd-cancel").click();
          } else  {
            $(elem).siblings("#geoMessage").html("Failed to geocode: Confidence not high enough");
            console.log(firstItem);
          }
        } catch (err) {
          $("#errorText").html(err), $("#error-show").click();
          console.error(data);
        }
      });
    });
    let target = $("#addresses").parent()[0],
      observer = new MutationObserver(function(mutations) {
        mutations.forEach(function(mutation) {
          mutation.addedNodes.length > 0 && "childList" == mutation.type && ($(mutation.addedNodes).find(".cmd-geocode").html("Google"), $(mutation.addedNodes).find("[name='lng']").siblings("small.muted").before("<small class='muted' id='geoMessage'></small><br/>"), $(mutation.addedNodes).find(".cmd-geocode").after("<button type=\"button\" class=\"btn btn-info btn-small cmd-bing\">Bing</button><br/>"), $(mutation.addedNodes).find(".cmd-geocode").after("<button type=\"button\" class=\"btn btn-info btn-small cmd-osm\">OSM</button>"), $(mutation.addedNodes).find("small.tt").each(function() {
            $(this).html($(this).html() + ": " + $(this).data("original-title").split(" by ")[1].match(/\b(\w)/g).join(""));
          }));
        });
      }),
      config = {
        childList: true,
        subtree: true
      };
    observer.observe(target, config);
    $("td.person small.tt").each(function() {
      $(this).html($(this).html() + ": " + $(this).data("original-title").split(" by ")[1].match(/\b(\w)/g).join(""));
    });
    $("li.visible-desktop").after("<li class='dropdown admin'><button id='dropdown-admin' class='btn btn-lg btn-danger' data-toggle='dropdown'>Admin</button><ul class='dropdown-menu'><li><a id='select-all'>Open all entries for editing</a></li><li class='divider'></li><li><a id='bing-all'>Correct opened addresses using Bing</a></li><li><a id='osm-all'>Correct opened addresses using OSM</a></li><li><a id='massive-change' href='#massiveChange' data-toggle='modal'>Batch edit fields in opened entries</a></li><li><a id='search-replace'>Search and replace in all opened entries</a></li><li class='divider'></li><li><a id='save-all'>Save all opened entries</a></li><li><a id='delete-all'>Delete all opened entries</a></li><li><a id='cancel-all'>Cancel all modifications</a></li></ul></li><button id='error-show' href='#errorMessage' class='hide' data-toggle='modal'>Error</button><button id='delete-show' href='#deleteMessage' class='hide' data-toggle='modal'>Error</button>");
    $("#select-all").click(function() {
      $.fx.off = true, $("#addresses tr").click();
    });
    $("#bing-all").click(function() {
      var counter = 0;
      for (let i = $(".cmd-bing").length; i > 0; i--) setTimeout(function() {
        console.log("$(\".cmd-bing\").eq(" + (i - 1) + ").click();"), $(".cmd-bing").eq(i - 1).click();
      }, 100 * counter), counter++;
    });
    $("#osm-all").click(function() {
      $(".cmd-osm").click();
    });
    $("#search-replace").click(function() {
      var regexP = prompt("Please enter the regex search expression here:");
      try {
        if ("" === regexP || void 0 === regexP) throw "No regex search expression was entered.";
        var regex = new RegExp(regexP, "gim"),
          matches = [];
        if ($("#addresses input[type='text'], #addresses select, #addresses textarea").each(function() {
          $(this).val().match(regex) && matches.push($(this).val());
        }), !(matches.length > 0)) throw "There were no matches to your search pattern.";
        var replaceP = prompt("Please enter the replacement value here:"),
          promptMessage = "The following matches will be replaced as follows:\n__________________________________\n";
        if (matches.forEach(function(v) {
          promptMessage += "\n" + v + "       ->       " + v.replace(regex, replaceP);
        }), !confirm(promptMessage)) throw "The replace operation was cancelled.";
        $("#addresses input[type='text'], #addresses select, #addresses textarea").each(function() {
          $(this).val($(this).val().replace(regex, replaceP));
        });
      } catch (err) {
        $("#errorText").html(err), $("#error-show").click();
      }
    });
    $("#massive-change").click(function() {
      $("#fieldPicker").html(""), $("#addresses tr.edit:first").find("select:visible, input:visible, textarea:visible").clone().each(function() {
        $(this).addClass("massiveField").val("");
        $("#fieldPicker").append("<span class='massiveLabel'>" + $(this).prop("name") + "</span>", $(this));
        $("#fieldPicker").append("<br/>");
      });
    });
    $("#cmd-mass-change").click(function() {
      $(".massiveField").each(function() {
        if ("" != $(this).val() && null != $(this).val()) {
          var newValue = $(this).val();
          $("[name=" + $(this).prop("name") + "]").each(function() {
            console.log(this.nodeName), "textarea" == this.nodeName.toLowerCase() && (newValue = $(this).val().trim() + "\n" + newValue), $(this).val(newValue.replace(/[\n]+/g, "\n").trim());
          });
        }
      }), $("#massiveChange .btn-secondary").click();
    }), $("#save-all").click(function() {
      $(".cmd-save").click();
    }), $("#delete-all").click(function() {
      $("#delete-show").click();
    }), $("#cmd-mass-delete").click(function() {
      $("#deleteMessage .close").click(), $(".cmd-delete").click(), $(".bootbox .modal-footer a.btn-primary").each(function() {
        $(this).get(0).click();
      });
    }), $("#cancel-all").click(function() {
      $(".cmd-cancel").click();
    });
    var isBatch = !1;
    $("#dropdown-admin").on("click", function() {
      $(".dropdown-menu").is(":visible") ? $.fx.off = !1 : ($.fx.off = true, 0 === $("#addresses tr.edit").length ? $("#massive-change, #bing-all, #osm-all, #search-replace, #save-all, #delete-all, #cancel-all").parent("li").addClass("disabled") : $("#massive-change, #bing-all, #osm-all, #search-replace, #save-all, #delete-all, #cancel-all").parent("li").removeClass("disabled"), isBatch = $("#addresses tr.edit").length > 1 && true);
    });
  } else if (curPage.includes("territories") || curPage.includes("assigned")) {
    GM_addStyle("#areasText ul{list-style-type:none;column-count:2} #polygonText{display:flex;height:30px;align-items:center} #polygonText button{margin-right:1em} #polygonText .progress{flex-grow:100;margin-bottom:0!important}");
    $("#territories").after("<div id=\"territoryAreas\" class=\"modal fade hide\" tabindex=\"-1\"><div class=\"modal-header\"><h3>Territories</h3></div><div class=\"modal-body\"><p id=\"areasText\"></p></div><div class=\"modal-footer\"><button class=\"btn\" data-dismiss=\"modal\">OK</button></div></div></div>");
    $("input[name=g]").prop("checked", "checked");
    $("li.visible-desktop").after("<li class='dropdown admin'><button id='dropdown-admin' class='btn btn-lg btn-danger' data-toggle='dropdown'>Admin</button><ul class='dropdown-menu'><li><a id='territory-areas'>Territory areas</a></li><li><a id='polygon-backup'>Polygon export</a></li></ul></li><button id='areas-show' href='#territoryAreas' class='hide' data-toggle='modal'>Areas</button><button id='backup-show' href='#polygonBackup' class='hide' data-toggle='modal'>Polygons</button>");
    $("#territory-areas").click(function() {
      areaEnumerate();
      $("#areas-show").click();
    });
    $("#polygon-backup").click(function() {
      var terrGeoJson = {
        type: "FeatureCollection",
        features: []
      };
      $.get("https://www.mcmxiv.com/alba/ts?mod=territories&cmd=search&kinds%5B%5D=0&kinds%5B%5D=1&kinds%5B%5D=2&q=&sort=number&order=asc", function(res) {
        if (res.data.borders) {
          for (let border in res.data.borders) {
            let terr = res.data.borders[border],
              terrObject = {
                id: border,
                type: "Feature",
                properties: {
                  name: terr.tt,
                  num: terr.num,
                  tk: terr.tk
                },
                geometry: {
                  coordinates: [terr.pl.map(x => x.sort())],
                  type: "Polygon"
                }
              };
            terrGeoJson.features.push(terrObject);
          }
          if (confirm("Would you like to open a map with these polygons?")) {
            var b = "http://geojson.io/#data=data:application/json," + encodeURIComponent(JSON.stringify(terrGeoJson));
            window.open(b, "_blank");
          }
          if (confirm("Would you like to download a file containing these polygons?")) {
            var a = document.createElement("a");
            a.download = (new Date).toISOString().split("T")[0] + "-geojson-polygons.json";
            a.href = "data:text/plain;charset=UTF-8," + encodeURIComponent(JSON.stringify(terrGeoJson, null, 2));
            a.textContent = "Download JSON";
            a.id = "polygonDownload";
            document.body.appendChild(a);
            $("#polygonDownload").addClass("hide");
            $("#polygonDownload")[0].click();
          }
        }
      });
    });
    if (curPage.includes("assigned")) {
      GM_addStyle(".recently-worked td{background-color:#ccc!important}.overdue td{background-color:#faf2cc!important}.over-one-year td{background-color:#ebcccc!important}#shame{columns:2;column-gap:0;font-size:15px;margin:0 .2in}#shame>li{break-inside:avoid-column;padding:1em;border:1px solid grey}#shame>li ul.terrs{margin-bottom:1em;list-style:none}#shame>li ul.terrs li{padding-bottom:.5em}#shame>li ul.terrs li::before{content:'\\2B24';font-weight:700;display:inline-block;width:1.5em;margin-left:-1.5em;color:#00c853}#shame>li ul.terrs li.overdue::before{color:#d50000}#shame>li ul.terrs li.overdue{font-weight:700}#shame>li{list-style-type:none}.name{font-weight:700;font-size:125%;padding-bottom:1em}.terrs{padding-bottom:1em}.bold{font-weight:700}.smaller{font-size:80%}#territory-shame-remove{position:fixed;top:0;right:0;margin:1em}@media print{#territory-shame-remove{display:none}}");
      $("#territories").after("<div id=\"territoryList\" class=\"modal fade hide\" tabindex=\"-1\"><div class=\"modal-header\"><h3>Territories</h3></div><div class=\"modal-body\"><ul id=\"individualTerritories\"></ul></div><div class=\"modal-footer\"><button class=\"btn\" data-dismiss=\"modal\">OK</button></div></div></div>");
      $("#territories").after("<div id=\"territoryFacts\" class=\"modal fade hide\" tabindex=\"-1\"><div class=\"modal-header\"><h3>Territory Facts</h3></div><div class=\"modal-body\"><ul id=\"facts\"></ul></div><div class=\"modal-footer\"><button class=\"btn\" data-dismiss=\"modal\">OK</button></div></div></div>");
      $("#territories").after("<div id=\"territoryLinks\" class=\"modal fade hide\" tabindex=\"-1\"><div class=\"modal-header\"><h3>Territory Links</h3></div><div class=\"modal-body\"><ul id=\"links\"></ul></div><div class=\"modal-footer\"><button class=\"btn\" data-dismiss=\"modal\">OK</button></div></div></div>");
      $("#territory-areas").parent().after("<li><a id='territory-list'>Territory list</a></li><button id='list-show' href='#territoryList' class='hide' data-toggle='modal'>List</button>");
      $("#territory-areas").parent().after("<li><a id='territory-facts'>Territory facts</a></li><button id='facts-show' href='#territoryFacts' class='hide' data-toggle='modal'>Facts</button>");
      $("#territory-areas").parent().after("<li><a id='territory-links'>Territory links</a></li><button id='links-show' href='#territoryLinks' class='hide' data-toggle='modal'>Links</button>");
      $("#territory-areas").parent().after("<li><a id='territory-shame'>List of assigned and overdue territories</a></li>");
      $("#territory-list").click(function() {
        createList();
        $("#list-show").click();
      });
      $("#territory-links").click(function() {
        createLinks();
        $("#links-show").click();
      });
      $("#territory-facts").click(function() {
        createFacts();
        $("#facts-show").click();
      });
      $("html").on("click", "#territory-shame-remove", function() {
        $("#shameContainer, #territory-shame-remove").remove();
        $(".hidden-programatically").show().removeClass("hidden-programatically");
      });
      $("#territory-shame").click(function() {
        createShame();
      });
      $("[name=so]").parent().wrap("<div></div>");
      let newElem = $("#view div:first label:first");
      newElem.clone().insertAfter($("[name=av]").parent()).html(newElem.html().replace("Available", "Not worked in over 1 year")).find("input").attr("name", "nc");
      newElem.clone().insertAfter($("[name=av]").parent()).html(newElem.html().replace("Available", "Not worked in 6 to 12 months")).find("input").attr("name", "nw");
      newElem.clone().insertAfter($("[name=av]").parent()).html(newElem.html().replace("Available", "Completed in the past 6 months")).find("input").attr("name", "rw");
      newElem.clone().appendTo($("#view div:first div")).html(newElem.html().replace("Available", "Overdue")).find("input").attr("name", "od");
      $("[name=av]").on("change", function() {
        $("[name=nc], [name=rw], [name=nm]").prop("disabled", !$(this).prop("checked"));
      });
      $("[name=so]").on("change", function() {
        $("[name=od]").prop("disabled", !$(this).prop("checked"));
      });
      let target = $("#territories")[0],
        observer = new MutationObserver(function(mutations) {
          mutations.forEach(function(mutation) {
            var newNodes = mutation.addedNodes;
            if (newNodes.length > 0 && ($(newNodes).each(function() {
              var $node = $(this).find("td small.muted");
              if ("Never completed" != $node.text()) {
                var dateSO, targetElem, prevDone = !1;
                $node.text().match(/last/i) ? (dateSO = new Date($node.text().replace(/Last completed /i, "").split(" by ")[0]), targetElem = $node.parent().next("td").next("td").find("span.badge"), prevDone = true) : (dateSO = new Date($node.text()), targetElem = $node.parent().next("td").find("span.badge"));
                var monthsSO = Math.abs(Math.round((dateSO - new Date) / 1e3 / 60 / 60 / 24 / 30.42 * 10) / 10);
                targetElem.text(monthsSO);
                prevDone && monthsSO <= 6 ? targetElem.closest("tr").addClass("recently-worked") : !prevDone && monthsSO > 3 ? (targetElem.addClass("badge-important"), targetElem.closest("tr").addClass("overdue")) : prevDone && monthsSO > 12 ? targetElem.closest("tr").addClass("over-one-year") : prevDone && monthsSO > 6 && targetElem.closest("tr").addClass("normal");
              } else $node.closest("tr").addClass("over-one-year");
            }), true !== $("[name=av]").prop("disabled"))) {
              injectScript(recentlyWorkedScript, "recently-worked", "body");
              injectScript(normalScript, "normal", "body");
              injectScript(overdueScript, "overdue", "body");
              injectScript(neverCompletedScript, "never-completed", "body");
            }
          });
        }),
        target2 = $("#stats")[0],
        observer2 = new MutationObserver(function(mutations) {
          mutations.forEach(function(mutation) {
            if ("childList" == mutation.type && mutation.addedNodes.length > 0) {
              var terrs = parseInt($("#summary .badge:eq(0)").text());
              $("#stats tbody tr").each(function() {
                var newPercent = (parseInt($(this).find("td:nth-child(2)").text()) / terrs * 100).toFixed(1) + "%";
                $(this).find("td:nth-child(3)").html(newPercent), $(this).find("td:nth-child(4) div.bar").css("width", newPercent);
              });
            }
          });
        }),
        config = {
          attributes: true,
          childList: true,
          characterData: true
        };
      observer.observe(target, config), observer2.observe(target2, config);
    }
  } else if (curPage.includes("print") || curPage.includes("campaign")) {
    GM_addStyle("table th, table td{padding: 2pt 0pt;},.card{max-width:8.25in;margin:0 auto}td.attempts div{height:8px;width:8px;border-color:#777}table tr{height:18px}.attempts{min-width:1px!important}.italic{font-variant:italic}.transparent{color:transparent}.break{display:block}.campaign{letter-spacing:-.5px}.addresses tbody td{white-space:nowrap;vertical-align:middle}img.map{width:4in!important;height:4in!important}.marker{width:12px!important;text-align:center!important;padding:1px 0 0!important}p.print-notes{padding:1em;border-style:solid;display:inline-block;border-radius:1em;margin-bottom:10pt;margin-right:0}.st1_bg{background-color:#66d2ff!important;color:#000!important}.st2_bg{background-color:#52d965!important;color:#000!important}.st6_bg{background-color:#ccc!important;color:#fff!important}.white-bg{background-color:#fff!important}.returnDate{padding:.5em 2.5em .5em 1.5em;border-radius:0 0 1em 0;display:inline-block;-webkit-print-color-adjust:exact;background:#ffab91;position:absolute}.returnDateString{font-weight:700}.group{display:inline-block;padding:.5em 1.5em .5em 2.5em;border-radius:0 0 0 1em;float:left}.group-name{font-weight:700}.directions{margin-top:10pt!important}a.directions,h1{margin-top:3em!important}.group-ls{background:#e1bee7}//purple 1 .group-lc{background:#aed581}//green 3 .group-kh{background:#80cbc4}//turquoise 2 .group-pf{background:#ffe082}// yellow 2 .strike{text-decoration:line-through}.instructions{font-size:90%;line-height:normal}.instructionsRU{font-size:100%;margin-top:2em}.langRU{column-count:2;list-style-position:inside}.phoneEntries{font-size:90%}.campaignHeader{margin:0 0 10pt}.doNotCallBadge{background-color:#444!important;color:#fff!important}.sizeToggle{position:absolute;left:50%;transform:translateX(-50%);top:1%;background:rgba(255,255,255,.9);border:2px #000 solid;border-radius:1em;padding:1em;z-index:99}.sizeToggle ul{padding:0;margin-bottom:0}.sizeToggle ul li{list-style-type:none}#mqMe{margin-left:1em}.label-language{border:1px solid rgba(0,0,0,.4);color:#000!important;font-size:90%!important;margin:0 .5em}#pageLine{border-top:2px solid #ccc;width:100%;position:absolute;top:10.15in;right:0}#transferDiv span.label{width:15em}#transferDiv textarea{width:30em;height:10em}@media print{.sizeToggle{display:none!important}#pageLine{display:none!important}}");
    $("p").addClass("instructions"), $("small.muted, .overview, h1 span.muted,span.badge").hide();
    $(".addresses tr").each(function() {
      $(this).find("td:nth-child(3), th:nth-child(3)").insertAfter($(this).find("td:nth-child(6), th:nth-child(6)"));
      $(this).find("td strike:first").closest("tr").find("td:nth-child(n+4),.nw").addClass("strike").addClass("muted");
      $(this).find("td strike:first").closest("tr").find(".attempts div").hide();
      $(this).find("td strike:first").closest("tr").find("td .marker").addClass("doNotCallBadge");
      $(this).find("td strike").each(function() {
        $(this).replaceWith($(this).contents());
      });
      $(this).find("td.attempts div.completed").addClass("attempt").removeClass("completed");
    });
    $("th:contains(Status)").html("");
    $("td.notes").removeClass("notes");
    1 == $(".card").length && (document.title = $("h1 strong").text());
    $(".card").each(function() {
      if ($(this).find("h1:contains(Telephone)").length > 0) {
        $(".map, #map-canvas, p:not(:contains(Notes)):eq(4)").hide(), $(this).find("h1 strong").addClass("st2_c");
        var languages = ["Р", "Б", "У", "А", "Ф", "NIS", "&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;"],
          html = "<p class='instructionsRU'>Пожалуйста, установите галочки, чтобы указать, на каком языке каждый человек говорит.</p><ul class='langRU'>";
        $.each(["На русском", "На болгарском", "На украинском", "На английском", "На французском", "Телефон не работает"], function(k, v) {
          html += "<li>" + languages[k] + ": " + v + "</li>";
        });
        html += "</ul>";
        $("p.instructions:first").after(html);
        $(".instructions:first").nextAll("br:first()").remove();
        $(this).find(".addresses").prevUntil("div").each(function() {
          $(this).hide();
        });
        $("span.nw").addClass("break").next("br").remove();
        $(this).find(".addresses tr td .break").each(function() {
          0 === $(this).text().length && $(this).closest("td").addClass("st1_bg");
          $(this).text($(this).text().replace("(", "").replace(") ", "-"));
        });
        $(this).find(".addresses tr").each(function() {
          $(this).find(":not(div):nth-child(5),:not(div):nth-child(4),th:not(div):nth-child(2),td:not(div):nth-child(2)").hide();
          $(this).find("td:nth-child(6)").addClass("right").html(languages.map(language => `<span class="label label-language">☐ ${language}</span>`).join(""));
          $(this).find("td:nth-child(6) span.label-language:nth-child(-n+3)").addClass("st2_bg_f");
          $(this).find("td:nth-child(6) span.label-language:nth-child(n+4):nth-child(-n+7)").addClass("st0_bg_f");
          $(this).find("td:nth-child(6) span.label-language:nth-child(8)").addClass("white-bg");
          $(this).find("th:nth-child(6)").css("text-align", "center");
          $(this).append($(this).find("td.attempts"));
          $(this).find("th:nth-child(7)").insertAfter($(this).find("th:nth-child(1)"));
        });
        $(".addresses thead").hide();
        $("p:contains(addresses) > strong").html($("p:contains(addresses) > strong").html().replace(/addresses/i, "numbers"));
        $(".addresses").tablesorter({
          sortList: [[3, 0]]
        });
        $(this).find(".addresses tr td:nth-child(1)").each(function(n) {
          $(this).html("<strong class='marker' style='color: black;'>" + parseInt(n + 1) + "</span>");
        });
        $("td:not(:nth-child(1)) small.muted").show();
        $("td:nth-child(3) br").remove();
        $(this).find(".addresses td:not(.attempts)").addClass("phoneEntries");
      } else {
        if ($(this).find("p:contains(Signed)").length > 0) {
          var arr = $(this).find("p:contains(Signed)").html().split("<br>")[1].replace(/[,.]/g, "").split(" "),
            soDate = new Date(arr.slice(Math.max(arr.length - 3, 0)).join(" "));
          $(this).find(".addresses tr td:nth-child(3) small.muted:contains(Contacted)").each(function() {
            var contactedDate = new Date($(this).html().split("Contacted ")[1]);
            ((contactedDate - soDate) / 1e3 / 60 / 60 / 24 / 30.5 > -4 || (contactedDate - soDate) / 1e3 / 60 / 60 / 24 / 30.5 > -4) && ($(this).show(), $(this).closest("tr").addClass("muted"), $(this).closest("tr").find("td:nth-child(n+3)").addClass("strike").addClass("italic"), $(this).closest("tr").find("td:nth-child(5)").html($(this)).attr("colspan", 3).addClass("right").removeClass("strike"), $(this).closest("tr").find("td:nth-child(1) strong").addClass("st6_bg"), $(this).closest("tr").find("td:nth-child(2) strong").addClass("tk1_c_f"), $(this).closest("tr").find("td:nth-child(6),td.attempts").hide());
          });
        }
        $("#map-canvas").remove();
        $(".attempts div, .qrcode, span.nw, .instructions").hide();
        $(this).find(".addresses thead th, .addresses tr td:nth-child(2), .addresses tr td:nth-child(5), .addresses tr td:nth-child(6)").html("");
        if ($("p.instructions .muted").hide(), -1 !== $("p:contains(Signed)").text().indexOf("Signed out")) {
          var dateOptions = {
              year: "numeric",
              month: "long",
              day: "numeric"
            },
            soPar = $("p:contains(Signed)"),
            soText = soPar.html().split("</strong><br>")[1].split("<br>")[0],
            formattedSoDate = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"][(soDate = new Date(soText)).getMonth()] + " " + soDate.getDate() + ", " + soDate.getFullYear() + ".",
            soPub = soText.replace(formattedSoDate, "").replace("Signed out by ", ""),
            returnDate = new Date(soDate.setMonth(soDate.getMonth() + 3)); - 1 == soPub.indexOf("Printed - To give out") ? (returnDateString = "Сдать до <span class='returnDateString'>" + returnDate.toLocaleDateString("ru-RU", dateOptions) + "</span><br/>Due before <span class='returnDateString'>" + returnDate.toLocaleDateString("en-CA", dateOptions) + "</span>", returnPubString = soPub) : (returnDateString = "Сдать до:<br/>Due before: <span class='returnDateString'>_________________</span>", returnPubString = "_________________"), soPar.html(soPar.html().replace(formattedSoDate, "<div class='returnDate'>" + returnDateString + "</div>").replace("Signed out by ", "").replace(soPub, "")), $("h1:eq(0)").html($("h1:eq(0)").html().replace(" - ", "<br/>")), $("h1:eq(0) strong").append("<br/><span class='soPub st4_c'>" + returnPubString + "</span>"), $(".group").length > 0 ? $(".returnDate").insertAfter(".group") : $(".returnDate").prependTo(".card");
        }
        if ($("#map-canvas").length > 0) $("#map-canvas").remove(), $(".card").prepend("<div class='right-corner clearfix'>"), $("div.right-corner").append("<img class='map'>");
        else {
          var staleMapsLink = $("img.map").parent();
          staleMapsLink.parent().append($("img.map")), staleMapsLink.remove();
        }
        $(this).find("img.map").parent().after("<div class='sizeToggle'>"), $(".sizeToggle").append("<select id='mapSize'>");
        for (var i = 4; i <= 10; i++) $("#mapSize").append("<option value='" + i / 2 + "'" + (8 == i ? " selected" : "") + ">" + i / 2 + "\"</option>");
        $(".sizeToggle").append("<select id='mapRes'>");
        for (i = 4; i <= 10; i++) {
          var res = 100 * i;
          $("#mapRes").append("<option value='" + res + "'" + (5 == i ? " selected" : "") + ">" + res + "x" + res + "</option>");
        }
        $(".sizeToggle").append("<select id='mapZoom'>"), $("#mapZoom").append("<option value=''>Auto</option>");
        for (i = 1; i <= 20; i++) $(".sizeToggle #mapZoom").append("<option value='" + i + "'>" + i + "</option>>");
        $(".sizeToggle #mqMe");
        var mapquestUrl = "https://www.mapquestapi.com/staticmap/v5/map?size=500,500@2x&zoom=&declutter=true&key=" + mapquestAPIKey + "&locations=",
          pins = {},
          syntheticPin = 10;
        $(".addresses tbody tr").each(function() {
          if (!$(this).find("td:nth-child(4)").hasClass("strike")) {
            var pin = $(this).find("td:nth-child(1) strong").text();
            "" === pin && (pin = syntheticPin.toString(), $(this).find("td:nth-child(1) strong").text(pin), syntheticPin += 1);
            var color = rgb2hex($(this).find("td:nth-child(1) strong").css("backgroundColor")),
              coords = $(this).find("td:nth-child(4) .nw.muted").text().replace(/°/g, "").replace(" ", ",");
            pins[pin] = {
              color: color,
              coords: coords,
              label: pin
            };
          }
          $(this).find("td:nth-child(4) .nw.muted").hide();
        }), $.each(pins, function(k) {
          mapquestUrl += pins[k].coords + "|marker-sm-" + pins[k].color + "-" + pins[k].color + "-" + pins[k].label + "||";
        }), $("img.map").prop("src", mapquestUrl), $(this).find(".sizeToggle #mapSize").change(function() {
          var dim = $(this).val() + "in";
          $(".map")[0].style.setProperty("height", dim, "important"), $(".map")[0].style.setProperty("width", dim, "important");
        }), $(this).find(".sizeToggle #mapRes").change(function() {
          var res = $(this).val(),
            src = $(".map").prop("src");
          $(".map").prop("src", src.replace(/([0-9]{3,4})([,x])([0-9]{3,4})/g, res + "$2" + res));
        }), $(this).find(".sizeToggle #mapZoom").change(function() {
          var zoom = $(this).val(),
            src = $(".map").prop("src");
          $(".map").prop("src", src.replace(/zoom=[\d]*/g, "zoom=" + zoom));
        });
        $(".addresses tbody tr td:nth-child(6):contains(Russian)").removeClass("muted").addClass("transparent");
        if (window.location.href.includes("st=1,2,3")) window.location.href = window.location.href.replace("st=1,2,3", "st=1,2");
        window.print();
      }
      var statuses = [];
      $(this).find(".addresses tbody tr").each(function() {
        var status = $(this).find("td:nth-child(2)").text().trim(); - 1 === statuses.indexOf(status) && statuses.push(status);
      }), $(this).find(".addresses").prevUntil("div").each(function() {
        var curStatus = $(this).find(".status").text(); - 1 === statuses.indexOf(curStatus) && $(this).hide();
      }), $(this).find(".campaign").clone().insertBefore($(this).find("h1:not(.campaign)")), $(this).find("div:not(.card) > .campaign").parent("div").remove(), $(this).find("h1:not(:first)").addClass("campaignHeader"), $(this).find("h1 strong").after("<br/>").after("<div id='pageLine'></div>"), $("h1").before($(".directions"));
    }), $(".campaign").addClass("tk2_bg"), $(".campaign").nextAll("div").find(".directions").remove();
  } else if (curPage.includes("signoutsheet")) {
    GM_addStyle(".mainTable tbody td{vertical-align:middle}div.terr{width:1.6in;display:inline-block;vertical-align:top;page-break-inside:avoid;padding-top:.2in}div.terr>div>span{display:inline-block}div.terr>div:last-child{border-bottom:1px solid #000}div.terrNameRow{height:24px}div.terrDate,div.terrPub{height:18px;line-height:18px;font-size:11px;border:#000 1px solid;border-width:1px 1px 0 1px;vertical-align:middle;text-align:center}div.terrDate.empty,div.terrPub.empty{display:none}div.terrDate div{width:50%;height:18px;line-height:18px;white-space:nowrap;overflow:hidden;display:inline-block;box-sizing:border-box}div.terrDate div:last-child{border-left:1px solid #000}.terrLabel{font-size:7px;display:inline-block;line-height:6px;margin-right:3px;vertical-align:1px}.terrNo{font-size:14px;font-weight:700;vertical-align:1px}.terrName{text-align:left;padding:.2em .5em}.chart.fullpage{width:8in}.chart.fullpage .chart{width:4in;display:inline-block}#hideTAR,#printTAR{position:fixed;top:0;right:0}@media print{#hideTAR,#printTAR{display:none!important;},div.terrDate.empty,div.terrPub.empty{display:block}}");
    $("table:eq(0), div:eq(0), h1:eq(0)").addClass("main"), $("body").prepend("<button id='printTAR' disabled='disabled'>Print TAR</button>"), $("body").prepend("<button id='hideTAR' style='display: none;'>Back</button>");
    var currentStatuses = {},
      currentlySignedOut = {},
      areas = [];
    $("#printTAR").click(function() {
      $("#terrs, .chart.fullpage, .main").toggle();
    });
    $("table.main").after("<div id='terrs' style='display:none'>");
    getCurrentStatuses();
    makeCharts();
    $("#printTAR").prop("disabled", false);
  }

  function areaEnumerate() {
    var areas = {},
      subareas = {},
      subareaParents = {},
      areaPopulations = {},
      subareaPopulations = {};
    $("#territories td:nth-child(2):not(:contains(Search)) strong, #territories td:nth-child(2):not(:contains(Search)) b").each(function() {
      var territory = $(this).text(),
        area = territory.split("-")[0],
        subarea = territory.split("-")[1],
        areaLong = $(this).parent().clone().children().remove().end().contents().text().trim().split(" - ")[0],
        subareaLong = $(this).parent().clone().children().remove().end().contents().text().trim().split(" - ")[1];
      areas[area] || (areas[area] = []), -1 == areas[area].indexOf(areaLong) && areas[area].push(areaLong), areaPopulations[area] || (areaPopulations[area] = 0), areaPopulations[area] += parseInt($(this).parent().next().text()), subareas[subarea] || (subareas[subarea] = []), -1 == subareas[subarea].indexOf(subareaLong) && subareas[subarea].push(subareaLong), subareaPopulations[subarea] || (subareaPopulations[subarea] = 0), subareaPopulations[subarea] += parseInt($(this).parent().next().text()), subareaParents[subarea] = Object.keys(areas).indexOf(area);
    });
    var output = "<h5>Areas</h5>\n";
    output += "<p><ul>", Object.keys(areas).sort().forEach(function(v, i) {
      1 == areas[v].length ? areas[v] = "<span class='label label-success'>" + areas[v][0] + "</span>" : areas[v] = "<span class='label label-important'>" + areas[v].join("</span> <span class='label label-important'>") + "</span>", v.toUpperCase() !== v || /^[0-9.]+$/.test(v) ? delete areas[v] : output += "<li><span class='label' style='background-color: " + colors[i] + "'>" + v + "</span> - " + areas[v] + " <span class='label'>" + areaPopulations[v] + "</span></li>\n";
    }), output += "</ul></p>", output += "\n<h5>Subareas</h5>\n", output += "<p><ul>", Object.keys(subareas).forEach(function(v) {
      1 == subareas[v].length ? subareas[v] = "<span class='label label-success'>" + subareas[v][0] + "</span>" : subareas[v] = "<span class='label label-important'>" + subareas[v].join("</span> <span class='label label-important'>") + "</span>", v.toUpperCase() !== v || /^[0-9.]+$/.test(v) ? delete subareas[v] : output += "<li><span class='label' style='background-color: " + colors[subareaParents[v]] + "'>" + v + "</span> - " + subareas[v] + " <span class='label'>" + subareaPopulations[v] + "</span></li>\n";
    }), output += "</ul></p>", $("#areasText").html(output);
  }
  function createList() {
    $("#individualTerritories")
      .html($("td.territory:visible")
        .clone()), $("#individualTerritories span.label")
      .remove(), $("#individualTerritories td")
      .each(function() {
        $(this)
          .replaceWith($("<li>" + this.innerHTML.replace("<br>", "")
            .replace("</b>", "</b> //")
            .replace("&nbsp; ", "") + "</li>"));
      });
  }
  function createFacts() {
    var areas = {};
    $("#territories tr")
      .each(function() {
        var population = parseInt($(this)
            .find("td:nth-child(3)")
            .text()
            .trim()),
          areaShort = $(this)
            .find("td:nth-child(2) b")
            .text()
            .trim()
            .split("-")[0];
        if (areaShort === areaShort.toUpperCase()) {
          var area = orphanText($(this)
            .find("td:nth-child(2)"))
            .split(" - ")[0];
          areas.hasOwnProperty(area) || (areas[area] = {
            total: 0,
            donePastYear: 0,
            notDonePastYear: 0
          }), areas[area].total += population, $(this)
            .hasClass("over-one-year") ? areas[area].notDonePastYear += population : areas[area].donePastYear += population;
        }
      });
    var text = "";
    $.each(areas, function(k) {
      (areas[k].notDonePastYear / areas[k].total * 100)
        .toFixed(1) > 0 && (text += "<li>" + k + ": <strong>" + (areas[k].notDonePastYear / areas[k].total * 100)
        .toFixed(1) + "%</strong> of doors (" + areas[k].notDonePastYear + ") <strong>not done</strong> in the past year</li>");
    }), $("#facts")
      .html(text);
  }
  function createShame() {
    $("body").append("<div id='shameContainer'></div>");
    $("#shameContainer").append("<ul id='shame'></ul>");
    var myTableArray = [];
    $("#territories tr").each(function() {
      var arrayOfThisRow = [],
        tableData = $(this).find("td");
      tableData.length > 0 && (tableData.each(function(i) {
        4 !== i && 3 !== i && 8 !== i && (1 == i || 6 == i ? arrayOfThisRow.push($(this).html()) : arrayOfThisRow.push($(this).text()));
      }), myTableArray.push(arrayOfThisRow));
    });
    var terrsPerPerson = {};
    $.each(myTableArray, function(i, v) {
      "Signed-out" == v[3] && (v.push(v[4].split("</strong>")[1].replace(/<(?:.|\n)*?>/gm, "")), v[4] = v[4].split("</strong>")[0].replace(/<(?:.|\n)*?>/gm, ""), v.push(v[1].split("</b>")[1].replace(/<(?:.|\n)*?>/gm, "").replace(" &nbsp; Assigned (no border)", "")), v[1] = v[1].split("</b>")[0].replace(/<(?:.|\n)*?>/gm, ""), void 0 === terrsPerPerson[v[4]] && (terrsPerPerson[v[4]] = []), terrsPerPerson[v[4]].push([v[1], v[6]]));
    });
    var formattedTerrsPerPerson = "";
    $.each(Object.keys(terrsPerPerson).sort(), function(k, v) {
      formattedTerrsPerPerson += "<li><div class='name'>" + v + "</div>\n<ul class='terrs'>\n";
      $.each(terrsPerPerson[v], function(k, v) {
        var terDate = new Date(v[1]),
          timeOut = (new Date - terDate) / 1e3 / 60 / 60 / 24 / 30.4375;
        formattedTerrsPerPerson += "<li" + (timeOut > 4 ? " class='overdue'" : "") + ">" + v[0] + "</li>\n";
      });
      formattedTerrsPerPerson += "</ul>\n";
      formattedTerrsPerPerson += "<span class='bold smaller'>Пожалуйста, обратите внимание:</span><ul class='smaller'>";
      formattedTerrsPerPerson += "<li>Если перед территорией есть зеленая точка, еще есть время ее закончить. Нет необходимости сразу ее возвращать.</li>";
      formattedTerrsPerPerson += "<li>Если перед территорией есть красная точка, она просрочена. Пожалуйста, верните брату территорию как можно скорее.</li>";
      formattedTerrsPerPerson += "</ul>";
      formattedTerrsPerPerson += "<span class='bold smaller'>Please note:</span><ul class='smaller'>";
      formattedTerrsPerPerson += "<li>If a territory is preceded by a green bullet point, it is not overdue. You may continue to work it.</li>";
      formattedTerrsPerPerson += "<li>If a territory is preceded by a red bullet point, it is overdue. Please hand it in as soon as possible.</li>";
      formattedTerrsPerPerson += "</ul>";
      formattedTerrsPerPerson += "</li>\n";
    });
    $("#shame").html(formattedTerrsPerPerson);
    $("body > *:visible").addClass("hidden-programatically").hide();
    $("#shameContainer").show();
    $("body").after("<button id='territory-shame-remove'>Back to Assigned</button>");
  }
  function createLinks() {
    var myTableArray = [];
    $("#territories tr")
      .each(function() {
        var arrayOfThisRow = [],
          tableData = $(this)
            .find("td");
        tableData.length > 0 && (tableData.each(function(i) {
          4 !== i && 8 !== i && (1 == i || 3 == i || 6 == i ? arrayOfThisRow.push($(this)
            .html()) : arrayOfThisRow.push($(this)
            .text()));
        }), myTableArray.push(arrayOfThisRow));
      });
    var terrsPerPerson = {};
    $.each(myTableArray, function(i, v) {
      "Signed-out" == v[4] && (v.push(v[5].split("</strong>")[1].replace(/<(?:.|\n)*?>/gm, "")), v[5] = v[5].split("</strong>")[0].replace(/<(?:.|\n)*?>/gm, ""), v.push(v[1].split("</b>")[1].replace(/<(?:.|\n)*?>/gm, "")
        .replace(" &nbsp; Assigned (no border)", "")), v[1] = v[1].split("</b>")[0].replace(/<(?:.|\n)*?>/gm, ""), void 0 === terrsPerPerson[v[5]] && (terrsPerPerson[v[5]] = []), terrsPerPerson[v[5]].push([v[1], v[6], $(v[3])
        .find(".cmd-open")
        .attr("rel"), $(v[3])
        .find(".cmd-print").first()
        .attr("rel")
      ]));
    }), console.log(terrsPerPerson);
    var formattedTerrsPerPerson = "";
    $.each(Object.keys(terrsPerPerson)
      .sort(),
    function(k, v) {
      formattedTerrsPerPerson += "<li><div class='name'>" + v + "</div>Привет! Вот все твои территории <i>(Hello! Here are your territories)</i>:<br/><br/>\n<ul class='terrs'>\n", $.each(terrsPerPerson[v], function(k, v) {
        formattedTerrsPerPerson += "<li>" + v[0] + ": <br/>- " + v[2] + "<br/>- " + v[3] + "&&address_only=0&m=1&o=1&l=1&d=1&c_n=1&c_t=1&c_l=1&c_nt=1&g=1&cl=1&clm=20&clss=1&st=1,2,3" + "</li>\n";
      }), formattedTerrsPerPerson += "</ul>\n", formattedTerrsPerPerson += "</li><br/>\n";
    }), $("#links")
      .html(formattedTerrsPerPerson);
  }
  function injectScript(content, id, tag) {
    $("script#" + id).remove();
    var node = document.getElementsByTagName(tag)[0],
      script = document.createElement("script");
    script.setAttribute("type", "text/javascript"), script.innerHTML = content, script.id = id, node.appendChild(script);
  }
  function rgb2hex(rgb) {
    return (rgb = rgb.match(/^rgba?[\s+]?\([\s+]?(\d+)[\s+]?,[\s+]?(\d+)[\s+]?,[\s+]?(\d+)[\s+]?/i)) && 4 === rgb.length ? ("0" + parseInt(rgb[1], 10).toString(16)).slice(-2) + ("0" + parseInt(rgb[2], 10).toString(16)).slice(-2) + ("0" + parseInt(rgb[3], 10).toString(16)).slice(-2) : "";
  }
  function orphanText(element) {
    return element.contents().filter(function() {
      return 3 === this.nodeType;
    }).text().trim();
  }
  function getCurrentStatuses() {
    $("table.main tbody tr").each(function() {
      var row = $(this),
        id = row.find("td:nth-child(1)").text(),
        code = row.find("td:nth-child(2)").find("b").text().trim(),
        area = code.split("-")[0]; - 1 == $.inArray(area, areas) && areas.push(area);
      var dateText = row.find("td:nth-child(5) small").text().trim().replace("Last completed ", "").split(" by ")[0],
        dateActual = "";
      dateText.includes("Never") || (dateActual = new Date(dateText)), code.includes("Wow") || (currentStatuses[code] = {
        id: id,
        code: code,
        area: code.split("-")[0],
        subarea: code.split("-")[1],
        desc: orphanText(row.find("td:nth-child(2)")),
        doors: parseInt(row.find("td:nth-child(3)").text().trim()),
        status: row.find("td:nth-child(4)").text().trim(),
        datesignedout: dateText,
        dateactual: dateActual,
        publisher: row.find("td:nth-child(5) strong").text().trim()
      });
    });
    Object.keys(currentStatuses).filter(function(key) {
      if (!currentStatuses[key].datesignedout.includes("Never")) return currentStatuses[key].publisher.includes("Printed") && (currentStatuses[key].publisher = "Publisher"), currentlySignedOut[key] = currentStatuses[key], key;
    });
  }
  function makeCharts() {
    var terrCoverageInfo = {},
      now = new Date,
      timeCategories = ["Less than 6 months ago", "6 to 12 months ago", "More than 12 months ago"];
    for (let terr in currentStatuses)
      if (terrCoverageInfo[currentStatuses[terr].area] || (terrCoverageInfo[currentStatuses[terr].area] = {}, terrCoverageInfo[currentStatuses[terr].area][timeCategories[0]] = 0, terrCoverageInfo[currentStatuses[terr].area][timeCategories[1]] = 0, terrCoverageInfo[currentStatuses[terr].area][timeCategories[2]] = 0), "" == currentStatuses[terr].dateactual) terrCoverageInfo[currentStatuses[terr].area][timeCategories[2]] += currentStatuses[terr].doors;
      else {
        var monthsSinceCovered = (now - currentStatuses[terr].dateactual) / 1e3 / 60 / 60 / 24 / 30.4375;
        if (monthsSinceCovered > 12) var areaToIncrease = [timeCategories[2]];
        else if (monthsSinceCovered > 6) areaToIncrease = [timeCategories[1]];
        else if (monthsSinceCovered >= 0) areaToIncrease = [timeCategories[0]];
        else console.log("CHART ERROR: ", currentStatuses[terr].code, monthsSinceCovered);
        "" !== areaToIncrease && (terrCoverageInfo[currentStatuses[terr].area][areaToIncrease] += currentStatuses[terr].doors);
      } areas = Object.keys(terrCoverageInfo);
    var legendData = [];
    timeCategories.forEach(function(tC) {
      var sum = 0;
      Object.keys(terrCoverageInfo).forEach(function(tA) {
        sum += terrCoverageInfo[tA][tC];
      }), legendData.push(sum);
    });
    var charts = {
      terrCoverageInfo: terrCoverageInfo
    };
    for (var area in $("table.main").after("<div id='globalCoverageChart' class='chart fullpage' style='display: none'><canvas id='globalCoverage' width='400' height='400'></canvas></div>"), charts.globalCoverage = {}, charts.globalCoverage.el = $("#globalCoverage"), charts.globalCoverage.data = {
      labels: [
        [timeCategories[0]],
        [timeCategories[1]],
        [timeCategories[2]]
      ],
      datasets: [{
        label: "# of Terrs",
        data: legendData,
        backgroundColor: ["#4CAF50", "#FFC107", "#f44336"]
      }]
    }, charts.globalCoverage.options = {
      title: {
        display: true,
        text: "Doors covered globally",
        fontSize: 24
      },
      legend: {
        display: true,
        position: "bottom",
        labels: {
          generateLabels: function(chart) {
            var data = chart.data;
            return data.labels.length && data.datasets.length ? data.labels.map(function(label, i) {
              var meta = chart.getDatasetMeta(0),
                ds = data.datasets[0],
                arc = meta.data[i],
                custom = arc && arc.custom || {},
                getValueAtIndexOrDefault = Chart.helpers.getValueAtIndexOrDefault,
                arcOpts = chart.options.elements.arc,
                fill = custom.backgroundColor ? custom.backgroundColor : getValueAtIndexOrDefault(ds.backgroundColor, i, arcOpts.backgroundColor),
                stroke = custom.borderColor ? custom.borderColor : getValueAtIndexOrDefault(ds.borderColor, i, arcOpts.borderColor),
                bw = custom.borderWidth ? custom.borderWidth : getValueAtIndexOrDefault(ds.borderWidth, i, arcOpts.borderWidth);
              return {
                text: label + " : " + chart.config.data.datasets[arc._datasetIndex].data[arc._index],
                fillStyle: fill,
                strokeStyle: stroke,
                lineWidth: bw,
                hidden: isNaN(ds.data[i]) || meta.data[i].hidden,
                index: i
              };
            }) : [];
          }
        }
      }
    }, charts.globalCoverage.chart = new Chart(charts.globalCoverage.el, {
      type: "pie",
      data: charts.globalCoverage.data,
      options: charts.globalCoverage.options
    }), $("#globalCoverageChart").after("<div id='individualCoverageCharts' class='chart fullpage' style='display:none'>"), areas) $("#individualCoverageCharts").append("<div id='" + areas[area] + "CoverageChart' class='chart'><canvas id='" + areas[area] + "Coverage' width='400' height='400'></canvas></div>"), charts[areas[area] + "Coverage"] = {}, charts[areas[area] + "Coverage"].el = $("#" + areas[area] + "Coverage"), charts[areas[area] + "Coverage"].data = {
      labels: [
        [timeCategories[0]],
        [timeCategories[1]],
        [timeCategories[2]]
      ],
      datasets: [{
        label: "# of Terrs",
        data: [terrCoverageInfo[areas[area]][timeCategories[0]], terrCoverageInfo[areas[area]][timeCategories[1]], terrCoverageInfo[areas[area]][timeCategories[2]]],
        backgroundColor: ["#4CAF50", "#FFC107", "#f44336"]
      }]
    }, charts[areas[area] + "Coverage"].options = {
      title: {
        display: true,
        text: "Doors covered in the " + areas[area] + " area",
        fontSize: 18
      },
      legend: {
        display: true,
        position: "bottom",
        labels: {
          generateLabels: function(chart) {
            var data = chart.data;
            return data.labels.length && data.datasets.length ? data.labels.map(function(label, i) {
              var meta = chart.getDatasetMeta(0),
                ds = data.datasets[0],
                arc = meta.data[i],
                custom = arc && arc.custom || {},
                getValueAtIndexOrDefault = Chart.helpers.getValueAtIndexOrDefault,
                arcOpts = chart.options.elements.arc,
                fill = custom.backgroundColor ? custom.backgroundColor : getValueAtIndexOrDefault(ds.backgroundColor, i, arcOpts.backgroundColor),
                stroke = custom.borderColor ? custom.borderColor : getValueAtIndexOrDefault(ds.borderColor, i, arcOpts.borderColor),
                bw = custom.borderWidth ? custom.borderWidth : getValueAtIndexOrDefault(ds.borderWidth, i, arcOpts.borderWidth);
              return {
                text: label + " : " + chart.config.data.datasets[arc._datasetIndex].data[arc._index],
                fillStyle: fill,
                strokeStyle: stroke,
                lineWidth: bw,
                hidden: isNaN(ds.data[i]) || meta.data[i].hidden,
                index: i
              };
            }) : [];
          }
        }
      }
    }, charts[areas[area] + "Coverage"].chart = new Chart(charts[areas[area] + "Coverage"].el, {
      type: "pie",
      data: charts[areas[area] + "Coverage"].data,
      options: charts[areas[area] + "Coverage"].options
    });
  }
});

var neverCompletedScript = String.raw `
  function neverCompleted() {
var e = "#b84747",
          v = false;
      $(".over-one-year").hide();
      if ($("[name=nc]").prop("checked")) {
          v = true;
          $(".over-one-year").show();
      }
      $(".over-one-year").each(function() {
          var o = $(this).find("td:eq(0)").text().trim();
          $(this).find("td:eq(1) .tk1_bg").length || window.polygons[o].setOptions({
              fillColor: e,
              strokeColor: e,
              visible: v
          })
      })
  }
  neverCompleted(), $("[name=nc]").change(function () {
      neverCompleted()
  });`,
  normalScript = String.raw `
    function normal() {
var /*e = "#ffff00",*/
            v = false;
        $(".normal").hide();
        if ($("[name=nm]").prop("checked")) {
            v = true;
            $(".normal").show();
        }
        $(".normal").each(function() {
            var o = $(this).find("td:eq(0)").text().trim();
            $(this).find("td:eq(1) .tk1_bg").length || window.polygons[o].setOptions({
                /*fillColor: e,
                strokeColor: e,*/
                visible: v
            })
        })
    }
    normal(), $("[name=nm]").change(function () {
        normal()
    });`,
  recentlyWorkedScript = String.raw `
      function recentlyWorked() {
          var e = "#777",
              v = false;
          $(".recently-worked").hide();
          if ($("[name=rw]").prop("checked")) {
              v = true;
              $(".recently-worked").show();
          }
          $(".recently-worked").each(function() {
              var o = $(this).find("td:eq(0)").text().trim();
              $(this).find("td:eq(1) .tk1_bg").length || window.polygons[o].setOptions({
                  fillColor: e,
                  strokeColor: e,
                  visible: v
              })
          })
      }
      recentlyWorked(), $("[name=rw]").change(function() {
          recentlyWorked()
      });`,
  overdueScript = String.raw `
        function overDue() {
  var e = "#e8c517",
                v = false;
            $(".overdue").hide();
            if ($("[name=od]").prop("checked")) {
                v = true;
                $(".overdue").show();
            }
            $(".overdue").each(function() {
                var o = $(this).find("td:eq(0)").text().trim();
                $(this).find("td:eq(1) .tk1_bg").length || window.polygons[o].setOptions({
                    fillColor: e,
                    strokeColor: e,
                    visible: v
                })
            })
        }
        overDue(), $("[name=od]").change(function () {
            overDue()
        });`;
