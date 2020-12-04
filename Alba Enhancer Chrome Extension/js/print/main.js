// remove some stuff from addresses
$(".addresses tr td:nth-child(5)").each(function() {
  var addr = $(this).html().split(", ");
  if (addr.length > 1) { // there's something to do here
    addr.indexOf("QC") !== -1 && addr.splice(addr.indexOf("QC"), 1); // remove "QC"
    !addr[addr.length - 2].match(/\d+/g) && addr.splice((addr.length - 2), 1); // remove city
  }
  $(this).html(addr.join(", "));
});

$("p").addClass("instructions");

// hide duplicate info, address id, overview map, congregation name and territory type
$("small.muted, .overview, h1 span.muted,span.badge").hide();

// reposition the language column and header and clearly identify DNCs
$(".addresses tr").each(function() {
  $(this).find("td:nth-child(3), th:nth-child(3)").insertAfter($(this).find("td:nth-child(6), th:nth-child(6)"));
  $(this).find("td strike:first").closest("tr").find("td:nth-child(n+4),.nw").addClass("strike").addClass("muted");
  $(this).find("td strike:first").closest("tr").find(".attempts div").hide();
  $(this).find("td strike:first").closest("tr").find("td .marker").addClass("doNotCallBadge");
  $(this).find("td strike").each(function() {
    $(this).replaceWith($(this).contents()); // get rid of strike tags
  });
  //$(this).find("td.attempts div.attempt").last().remove();
  $(this).find("td.attempts div.completed").addClass("attempt").removeClass("completed");
});
$("th:contains(Status)").html("");

$("td.notes").removeClass("notes");

($(".card").length == 1) && (document.title = $("h1 strong").text());
$(".card").each(function() {
  if ($(this).find("h1:contains(Telephone)").length > 0) { // phone territory
    // hide the map
    $(".map, #map-canvas, p:not(:contains(Notes)):eq(4)").hide();
    $(this).find("h1 strong").addClass("st2_c");
    var languages = ["Р", "Б", "У", "А", "Ф", "NIS", "&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;"];
    var languagesFull = ["На русском", "На болгарском", "На украинском", "На английском", "На французском", "Телефон не работает"]; //, "Другой язык, или примечания"];
    var html = "<p class='instructionsRU'>Пожалуйста, установите галочки, чтобы указать, на каком языке каждый человек говорит.</p><ul class='langRU'>";
    $.each(languagesFull, function(k, v) {
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
      $(this).text().length === 0 && $(this).closest("td").addClass("st1_bg");
      $(this).text($(this).text().replace("(", "").replace(") ", "-"));
    });
    $(this).find(".addresses tr").each(function() {
      $(this).find(":not(div):nth-child(5),:not(div):nth-child(4),th:not(div):nth-child(2),td:not(div):nth-child(2)").hide();
      $(this).find("td:nth-child(6)").addClass("right").html(languages.map(language => `<span class="label label-language">☐ ${language}</span>`).join(""))
      $(this).find("td:nth-child(6) span.label-language:nth-child(-n+3)").addClass("st2_bg_f")
      $(this).find("td:nth-child(6) span.label-language:nth-child(n+4):nth-child(-n+7)").addClass("st0_bg_f")
      $(this).find("td:nth-child(6) span.label-language:nth-child(8)").addClass("white-bg");
      $(this).find("th:nth-child(6)").css("text-align", "center");
      $(this).find("td.attempts").insertAfter($(this).find("td:nth-child(1)"));
      $(this).find("th:nth-child(7)").insertAfter($(this).find("th:nth-child(1)"));
    });
    // change header to remove mention of "addresses"
    $("p:contains(addresses) > strong").html($("p:contains(addresses) > strong").html().replace(/addresses/i, "numbers"));

    // force sort by name
    $(".addresses").tablesorter({
      sortList: [
        [3, 0]
      ]
    });

    // re-number doors
    $(this).find(".addresses tr td:nth-child(1)").each(function(n) {
      $(this).html("<strong class='marker' style='color: black;'>" + parseInt(n + 1) + "</span>");
    });
    // show last time phone done
    $("td:not(:nth-child(1)) small.muted").show();
    $("td:nth-child(3) br").remove();

    // make entries bigger
    $(this).find(".addresses td:not(.attempts)").addClass("phoneEntries");
  } else if ($(this).find("h1:contains(CTB-)").length > 0) { // territory border
    var currentUrl = window.location.href.split("st=").pop();
    if (currentUrl.includes("1") || currentUrl.includes("2") || currentUrl.includes("3")) {
      console.log("incorrect url for door transfers, redirecting...")
      window.location = window.location.href.split("st=")[0] + "st=4,6";
    } else {
      $("#map-canvas").remove();
      $("h1").after("<div id='transferDiv'>");
      $("#transferDiv").append("<div><button id='transfer'>Create transfer TSV</button> <span id='progress'></div>");
      $("#transferDiv").append("<div><span class='label'>Congregation:</span> <input id='congName' /></div>");
      $("#transferDiv").append("<div><span class='label'>Errors:</span> <textarea id='errors' /></div>");
      $("#transferDiv").append("<div><span class='label'>Skipped:</span> <textarea id='skipped' /></div>");
      $("#transferDiv").append("<div><span class='label'>Info:</span> <textarea id='info' /></div>");
      $("#transferDiv").append("<div><span class='label'>Output:</span> <textarea id='output' /></div>");

	  $("h1 *:not(:visible)").remove();
      var congName = $("h1").text().split("Congregation Territory Border - ").pop().trim();
      if (congName.length > 0) {
	    $("#congName").val(congName);
      }

      var processed,
        rows,
        addresses;

      function increaseProgress(addr, row) {
        processed++;
		if ($("#progress").text() == "" || !$("#progress").is(':visible')) {
			$("#progress").hide().fadeIn()
		}
        $("#progress").html(addr + " - " + processed + "/" + addresses + " = " + (processed / addresses * 100).toFixed(2) + "%");
        //console.log("loading: ", row + 1, "processed: ", processed, "total: ", addresses)
        if ((row + 1) < addresses) {
          startTransferCheck(row + 1)
        } else {
			$("#progress").delay(2000).fadeOut();
		}
      }

      function startTransferCheck(row) {
        var $this = $(".addresses tbody tr:eq(" + row + ")"),
		  addrId = parseInt($this.find("td:nth-child(1) .muted").text().trim()),
          now = (new Date()).toISOString().split("T")[0];
        if (!isNaN(addrId)) {
          var addrUrl = "https://www.mcmxiv.com/alba/ts?mod=addresses&cmd=search&acids=3&exp=true&npp=25&cp=1&tid=0&lid=0&display=4%2C6&onlyun=false&q=" + addrId + "&sort=id&order=desc&lat=&lng=";
          $.ajax({
            async: true,
            success: function(res) {
              if (res.data.exp) {
                var addrData = res.data.exp.split("\n")[1].split("\t");
                if (!(addrData[16].includes("Sent to") || addrData[16].includes("Submitted to") || addrData[16].includes("Do not transfer") || addrData[5].includes("?") || addrData[15].includes("list"))) {
                  $("#output").val($("#output").val() + addrData.join("\t") + "\n");
                  var updateUrl = encodeURI("https://www.mcmxiv.com/alba/ts?mod=addresses&cmd=save&id=" + addrData[0] + "&lat=" + addrData[11] + "&lng=" + addrData[12] + "&territory_id=0&status=6&language_id=3&full_name=" + addrData[4] + "&suite=" + addrData[5] + "&address=" + addrData[6] + "&city=" + addrData[7] + "&province=" + addrData[8] + "&country=" + addrData[10] + "&postcode=" + addrData[9] + "&telephone=" + addrData[13] + "&notes=" + addrData[15] + "&notes_private=[ " + now + "+-+Sent+to+" + congName + " ]\n" + addrData[16]);
                  $.ajax({
                    async: true,
                    success: function(res) {
                      if (res.error.length === 0) {
                        $("#info").val($("#info").val() + "MARKED AS SENT IN ALBA: " + addrData[0] + "\n");
                      } else {
                        $("#errors").val($("#errors").val() + "ERROR UPDATING IN ALBA: " + addrData[0] + ": " + res.error + "\n");
                      }
                    },
                    error: function(err) {
                      $("#errors").val($("#errors").val() + "ERROR UPDATING IN ALBA: " + addrData[0] + ": " + err);
                    },
                    url: updateUrl,
                  });

                } else {
                  $("#skipped").val($("#skipped").val() + "Already sent or invalid door, skipping: " + addrData[0] + "\n");
                }
                increaseProgress(addrData[0], row)
              } else {
                $("#skipped").val($("#skipped").val() + "not NV/MOVED, skipping: " + addrId + "\n");
              }

            },
            error: function(err) {
              $("#errors").val($("#errors").val() + "ERROR: " + addrId + "\n");
              increaseProgress(addrId, row);
            },
            url: addrUrl,
          });
        } else {
          $("#errors").val($("#errors").val() + "ERROR: " + addrId + "\n");
        }
      }

      $(this).find("#transfer").click(function() {
        var congName = $("input#congName").val();
		processed = 0,
        rows = $(".addresses tbody tr"),
        addresses = rows.length;
        startTransferCheck(0);
      });
    }
  } else { // normal territory
    if ($(this).find("p:contains(Signed)").length > 0) {
      var arr = $(this).find("p:contains(Signed)").html().split("<br>")[1].replace(/[,\.]/g, "").split(" ");
      var soDate = new Date(arr.slice(Math.max(arr.length - 3, 0)).join(" "));
      $(this).find(".addresses tr td:nth-child(3) small.muted:contains(Contacted)").each(function() {
        var contactedDate = new Date($(this).html().split("Contacted ")[1]);
        //console.log(contactedDate, soDate);
        var hideThis = ((contactedDate - soDate) / 1000 / 60 / 60 / 24 / 30.5) > -4 || ((contactedDate - soDate) / 1000 / 60 / 60 / 24 / 30.5) > -4;
        if (hideThis) {
          $(this).show();
          $(this).closest("tr").addClass("muted");
          $(this).closest("tr").find("td:nth-child(n+3)").addClass("strike").addClass("italic");
          $(this).closest("tr").find("td:nth-child(5)").html($(this)).attr('colspan', 3).addClass("right").removeClass("strike");
          $(this).closest("tr").find("td:nth-child(1) strong").addClass("st6_bg");
          $(this).closest("tr").find("td:nth-child(2) strong").addClass("tk1_c_f");
          $(this).closest("tr").find("td:nth-child(6),td.attempts").hide();
        }
      });
    }
    $("p:contains(Notes:)").addClass("ro10_b").addClass("st1_bg_f").addClass("print-notes");
    if ($(".print-notes").length > 0) {
      $(".print-notes").html($(".print-notes").html().replace(":<", "<br/><").replace(/; /g, "<br/>"));
      $("p:contains(Printed)").after($(".print-notes"));

      if ($(".print-notes").html().includes("Group:")) {
        var group;
        var notesArray = $(".print-notes").html().split("<br>");
        var newNotes = [];
        var arr = jQuery.grep(notesArray, function(el, i) {
          //console.log(el)
          if (el.includes("Group:")) {
            group = el.split("Group: ")[1];
          } else if (!el.includes("Notes")) {
            newNotes.push(el);
          }
        });
        //console.log(newNotes)

        if ((newNotes.length) > 0) {
          $(".print-notes").html("<strong>Notes</strong><br>" + newNotes.join("<br>"));
        } else {
          $(".print-notes").hide();
        }

        $("h1").before("<div class='group'>");
        if (group.includes("LaSalle")) {
          $(".group").addClass("group-ls");
        } else if (group.includes("Lachine")) {
          $(".group").addClass("group-lc");
        } else if (group.includes("Hall")) {
          $(".group").addClass("group-kh");
        } else if (group.includes("Pierrefonds")) {
          $(".group").addClass("group-pf");
        }
        $(".group").html("Group:<br><span class='group-name'>" + group + "</span>")
      }
    }
    $("p.instructions .muted").hide();


    if ($("p.instructions:eq(0)").text().indexOf("Signed out") !== -1) {
      var monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
      var dateOptions = {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      };

      var blankLine = "_________________";
      var soPar = $("p.instructions:eq(0)");
      var soText = soPar.html().split("</strong><br>")[1].split("<br>")[0];
      var soDate = new Date(soText);
      var formattedSoDate = monthNames[soDate.getMonth()] + " " + soDate.getDate() + ", " + soDate.getFullYear() + ".";
      var soPub = soText.replace(formattedSoDate, "").replace("Signed out by ", "")
	  var monthsToWorkTerritory = 4;
      var returnDate = new Date(soDate.setMonth(soDate.getMonth() + monthsToWorkTerritory));

      if (soPub.indexOf("Printed - To give out") == -1) {
        returnDateString = "Сдать до <span class='returnDateString'>" + returnDate.toLocaleDateString('ru-RU', dateOptions) + "</span><br/>Due before <span class='returnDateString'>" + returnDate.toLocaleDateString('en-CA', dateOptions) + "</span>";
        returnPubString = soPub;
      } else {
        returnDateString = "Сдать до:<br/>Due before: <span class='returnDateString'>" + blankLine + "</span>";
        returnPubString = blankLine;
      }

      soPar.html(soPar.html().replace(formattedSoDate, "<div class='returnDate'>" + returnDateString + "</div>").replace("Signed out by ", "").replace(soPub, ""))
      $("h1:eq(0)").html($("h1:eq(0)").html().replace(" - ", "<br/>"))
      $("h1:eq(0) strong").append("<br/><span class='soPub st4_c'>" + returnPubString + "</span>");
      if ($(".group").length > 0) {
        $(".returnDate").insertAfter(".group");
      } else {
        $(".returnDate").prependTo(".card");
      }
    }

    if ($("#map-canvas").length > 0) { //apple maps
      $("#map-canvas").remove();
      $(".card").prepend("<div class='right-corner clearfix'>")
      $("div.right-corner").append("<img class='map'>")
    } else {
      var staleMapsLink = $("img.map").parent();
      staleMapsLink.parent().append($("img.map"));
      staleMapsLink.remove();
    }

    $(this).find("img.map").parent().after("<div class='sizeToggle'>");
    $(".sizeToggle").append("<select id='mapSize'>")
    for (var i = 4; i <= 10; i++) {
      $("#mapSize").append("<option value='" + i / 2 + "'" + (i == 8 ? " selected" : "") + ">" + i / 2 + "\"</option>")
    }

    $(".sizeToggle").append("<select id='mapRes'>");
    for (var i = 4; i <= 10; i++) {
      var res = i * 100;
      $("#mapRes").append("<option value='" + res + "'" + (i == 5 ? " selected" : "") + ">" + res + "x" + res + "</option>")
    }

    $(".sizeToggle").append("<select id='mapZoom'>");
    $("#mapZoom").append("<option value=''>Auto</option>");
    for (var i = 1; i <= 20; i++) {
      $(".sizeToggle #mapZoom").append("<option value='" + i + "'>" + i + "</option>>")
    }
    $(".sizeToggle #mqMe").after("<ul id='options'><li id='phonesSeparateLines'><input type='checkbox' /> Telephone numbers on separate lines</li></ul>");
    $(".sizeToggle #phonesSeparateLines").after("<li id='displayRussian'><input type='checkbox' /> Display <strong>Russian</strong> in the Language column</li>");

    var mapquestUrl = "https://www.mapquestapi.com/staticmap/v5/map?size=500,500@2x&zoom=&declutter=true&key=" + mapquestAPIKey + "&locations=";
    var pins = {};
    var syntheticPin = 10;
    $(".addresses tbody tr").each(function(k, v) {
      if (!($(this).find("td:nth-child(4)").hasClass("strike"))) {
        var pin = $(this).find("td:nth-child(1) strong").text();
        if (pin === "") {
          pin = syntheticPin.toString();
          $(this).find("td:nth-child(1) strong").text(pin);
          syntheticPin += 1;
        }
        var color = rgb2hex($(this).find("td:nth-child(1) strong").css("backgroundColor"));
        var coords = $(this).find("td:nth-child(4) .nw.muted").text().replace(/°/g, "").replace(" ", ",");
        pins[pin] = {
          color: color,
          coords: coords,
          label: pin
        };
      }
      $(this).find("td:nth-child(4) .nw.muted").hide();
    });
    $.each(pins, function(k, v) {
      mapquestUrl += pins[k]["coords"] + "|marker-sm-" + pins[k]["color"] + "-" + pins[k]["color"] + "-" + pins[k]["label"] + "||";
    });
    $("img.map").prop("src", mapquestUrl);

    $(this).find(".sizeToggle #mapSize").change(function() {
      var dim = $(this).val() + "in";
      $('.map')[0].style.setProperty("height", dim, "important");
      $('.map')[0].style.setProperty("width", dim, "important");
    });

    $(this).find(".sizeToggle #mapRes").change(function() {
      var res = $(this).val();
      var src = $('.map').prop("src");
      $('.map').prop("src", src.replace(/([0-9]{3,4})([,x])([0-9]{3,4})/g, res + "$2" + res));
    });

    $(this).find(".sizeToggle #mapZoom").change(function() {
      var zoom = $(this).val();
      var src = $('.map').prop("src");
      $('.map').prop("src", src.replace(/zoom=[\d]*/g, "zoom=" + zoom));
    });

    $(this).find(".sizeToggle #phonesSeparateLines input").click(function() {
      if (!$("span.break").length) {
        $("span.nw").addClass("break").next("br").remove();
      } else {
        $("span.nw").removeClass("break");
      }
    });

    $(".addresses tbody tr td:nth-child(6):contains(Russian)").removeClass("muted").addClass("transparent");
    $(this).find(".sizeToggle #displayRussian input").click(function() {
      if (!$(".transparent").length) {
        $(".addresses tbody tr td:nth-child(6):contains(Russian)").removeClass("muted").addClass("transparent");
      } else {
        $(".addresses tbody tr td:nth-child(6):contains(Russian)").addClass("muted").removeClass("transparent");
      }
    });
  }

  $(this).find(".sizeToggle #displayRussian input").click();

  var statuses = [];
  $(this).find(".addresses tbody tr").each(function() {
    var status = $(this).find("td:nth-child(2)").text().trim();
    if (statuses.indexOf(status) === -1) {
      statuses.push(status);
    }
  });
  $(this).find(".addresses").prevUntil("div").each(function() {
    var curStatus = $(this).find(".status").text();
    if (statuses.indexOf(curStatus) === -1) {
      $(this).hide();
    }
  });
  $(this).find(".campaign").clone().insertBefore($(this).find("h1:not(.campaign)"));
  $(this).find("div:not(.card) > .campaign").parent("div").remove();
  $(this).find("h1:not(:first)").addClass("campaignHeader");
  $(this).find("h1 strong").after("<br/>").after("<div id='pageLine'></div>");
  $("h1").before($(".directions"));
});
$(".campaign").addClass("tk2_bg");
$(".campaign").nextAll("div").find(".directions").remove();
