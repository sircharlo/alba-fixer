$("table:eq(0), div:eq(0), h1:eq(0)").addClass("main");
$("body").prepend("<button id='printTAR' disabled='disabled'>Print TAR</button>");
$("body").prepend("<button id='hideTAR' style='display: none;'>Back</button>");
$("body").prepend("<span id='updateStatus'>Verifying if territory sign-out history updates are necessary...</span>");

var currentStatuses = {},
  currentlySignedOut = {},
  retrievedSignedOutSpreadsheet = {},
  territoryAssignmentRecord = {},
  congregation = $("h1.main span.muted").text(),
  areas = [];
//var formID = ["entry.1034074982", "entry.1657743289", "entry.1862622033", "entry.536978807", "entry.853264099", "entry.502204457", "entry.716062490", "entry.1560598354", "entry.1868906645", "entry.1878392072"]; // google form field ids

function getCurrentStatuses() {
  $("table.main tbody tr").each(function(key, value) {
    var row = $(this);
    var id = row.find("td:nth-child(1)").text();
    var code = row.find("td:nth-child(2)").find("b").text().trim();
    var area = code.split("-")[0];
    if ($.inArray(area, areas) == -1) {
      areas.push(area)
    }
    var dateText = row.find("td:nth-child(5) small").text().trim().replace("Last completed ", "").split(" by ")[0];
    var dateActual = "";
    if (!dateText.includes("Never")) {
      dateActual = new Date(dateText);
    }
    if (!code.includes("Wow")) {
      currentStatuses[code] = {
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
      };
    }

  });
  Object.keys(currentStatuses).filter(function(key) {
    if (!currentStatuses[key].datesignedout.includes("Never")) {
      if (currentStatuses[key].publisher.includes("Printed")) {
        currentStatuses[key].publisher = "Publisher"
      }
      currentlySignedOut[key] = currentStatuses[key];
      return key
    }
  });
}

function buildTerritoryAssignmentRecord() {
  for (var terrNo in currentStatuses) {
    if (!(currentStatuses[terrNo].desc.includes("phone") || currentStatuses[terrNo].desc.includes("Border") || currentStatuses[terrNo].code == "Wow")) {
      if (!territoryAssignmentRecord[terrNo]) {
        territoryAssignmentRecord[terrNo] = [];
      }
      if (retrievedSignedOutSpreadsheet[terrNo]) { // territory has been assigned previously
        var terr = retrievedSignedOutSpreadsheet[terrNo];
        for (var terrHistory in terr) {
          var terrHistoryEntry = terr[terrHistory];
          if (territoryAssignmentRecord[terrNo].length == 0) { // no sign-out history yet
            if (terrHistoryEntry.status == "Signed-out") { // initial sign-out!
              territoryAssignmentRecord[terrNo].push(terrHistoryEntry)
            } else { // what is this?? get outta here
              console.log("ANOMALY: ", terrHistoryEntry.id, terrHistoryEntry.code, terrHistoryEntry.datesignedout, terrHistoryEntry.datesignedin, terrHistoryEntry.publisher, terrHistoryEntry.status)
            }
          } else { // sign-out history exists
            var prevHistEntry = territoryAssignmentRecord[terrNo].slice(-1)[0];
            if (prevHistEntry.status == "Signed-out") { // terr was previously signed out..
              if (terrHistoryEntry.status == "Available") { // and now brought back
                prevHistEntry.status = "Signed back in";
                prevHistEntry.datesignedin = terrHistoryEntry.datesignedout;
              }
            } else if (terrHistoryEntry.status == "Signed-out") { // territory wasn't assigned and is now signed out...
              territoryAssignmentRecord[terrNo].push(terrHistoryEntry)
            } else {
              console.log("ANOMALY PREV: ", prevHistEntry.id, prevHistEntry.code, prevHistEntry.datesignedout, prevHistEntry.datesignedin, prevHistEntry.publisher, prevHistEntry.status)
              console.log("ANOMALY CURR: ", terrHistoryEntry.id, terrHistoryEntry.code, terrHistoryEntry.datesignedout, terrHistoryEntry.datesignedin, terrHistoryEntry.publisher, terrHistoryEntry.status)
            }
          }
        }
      }
    }
  }
  var tarHtml = "";
  for (var terr in territoryAssignmentRecord) {
    //console.log(terr)//, territoryAssignmentRecord[terr])
    tarHtml += "<div class='terr'><div class='terrNameRow'><span class='terrName'><span class='terrLabel'>Terr.<br/>No.</span><span class='terrNo'>" + terr + "</span></span></div>";
    var numEntries = Object.values(territoryAssignmentRecord[terr]).length;
    territoryAssignmentRecord[terr].forEach(function(elem) {
      var dateOut = elem.datesignedout ? new Date(elem.datesignedout).toISOString().slice(0, 10) : "";
      var dateIn = elem.datesignedin ? new Date(elem.datesignedin).toISOString().slice(0, 10) : "";
      tarHtml += "<div class='terrPub'><span>" + elem.publisher + "</span></div>";
      tarHtml += "<div class='terrDate'><div class='dateOut'>" + dateOut + "</div><div class='dateIn'>" + dateIn + "</div></div>";
    });
    for (numEntries; numEntries < 12; numEntries++) {
      tarHtml += "<div class='terrPub empty'><span></span></div>";
      tarHtml += "<div class='terrDate empty'><div class='dateOut'></div><div class='dateIn'></div></div>";
    }
    tarHtml += "</div>";
  }
  $("#terrs").append(tarHtml);
}

function getStatusHistory() {
  $.getJSON("https://spreadsheets.google.com/feeds/list/1HgHkhx7AkZ8iQx5ICPcMDsf1wZW_7D7KBj__Eg1UVEU/default/public/values?alt=json", function(data) {
    if (data.feed.entry) {
      for (var row in data.feed.entry) {
        rowData = data.feed.entry[row];
        //console.log(data.feed.entry[row]);
        if (congregation == rowData["gsx$congregation"]["$t"]) {
          var id = rowData["gsx$id"]["$t"];
          var code = rowData["gsx$territorycode"]["$t"];
          if (!retrievedSignedOutSpreadsheet[code]) {
            retrievedSignedOutSpreadsheet[code] = [];
          }
          retrievedSignedOutSpreadsheet[code].push({
            id: id,
            code: code,
            publisher: rowData["gsx$signedoutto"]["$t"],
            status: rowData["gsx$status"]["$t"],
            datesignedout: rowData["gsx$date"]["$t"],
          });
        }
      }
    }
    compareRetrievedAndCurrentHistory();
    buildTerritoryAssignmentRecord();
  });
}

var totalToUpdate = 0;

function toUpdate(num) {
  totalToUpdate = totalToUpdate + parseInt(num);
  if (totalToUpdate > 0) {
    $("#updateStatus").html("Updates remaining: " + totalToUpdate)
  } else {
    $("#updateStatus").html("Sign-out history up to date.").delay(2000).fadeOut(500);
  }
}

function updateHistory(element) {
  var url = "https://docs.google.com/forms/d/e/1FAIpQLSfuKMhGFNx99lRMhBeGT38g_0CJDd0D5JxAFxW53N1JD7G0fA/formResponse?";
  url += "entry.1317884980=" + element.datesignedout;
  url += "&entry.1034074982=" + element.id;
  url += "&entry.1657743289=" + element.code;
  url += "&entry.1862622033=" + element.desc;
  url += "&entry.853264099=" + element.status;
  url += "&entry.502204457=" + element.publisher;
  url += "&entry.407328389=" + congregation;
  $.get(url, function(data) {
    console.log(element.id, "Update complete");
    toUpdate(-1);
  });
}

function compareRetrievedAndCurrentHistory() {
  for (var el in currentlySignedOut) {
    var currentEntry = currentlySignedOut[el],
      lastEntry = {};
    if (retrievedSignedOutSpreadsheet[el]) {
      var lastEntry = retrievedSignedOutSpreadsheet[el].slice(-1)[0];
    }
    if (!(currentEntry.datesignedout == lastEntry.datesignedout && currentEntry.publisher == lastEntry.publisher && currentEntry.status == lastEntry.status)) {
      toUpdate(1);
      if (!retrievedSignedOutSpreadsheet[el]) {
        retrievedSignedOutSpreadsheet[el] = [];
      }
      retrievedSignedOutSpreadsheet[el].push(currentEntry)
      updateHistory(currentEntry);
      console.log("PENDING UPDATE: ", currentEntry)
    }
  }
  toUpdate(0);
}

function makeCharts() {
  var terrCoverageInfo = {},
    now = new Date(),
    timeCategories = ["Less than 6 months ago", "6 to 12 months ago", "More than 12 months ago"];
  for (var terr in currentStatuses) {
    if (!terrCoverageInfo[currentStatuses[terr].area]) {
      terrCoverageInfo[currentStatuses[terr].area] = {};
      terrCoverageInfo[currentStatuses[terr].area][timeCategories[0]] = 0;
      terrCoverageInfo[currentStatuses[terr].area][timeCategories[1]] = 0;
      terrCoverageInfo[currentStatuses[terr].area][timeCategories[2]] = 0;
    }
    if (currentStatuses[terr].dateactual == "") {
      terrCoverageInfo[currentStatuses[terr].area][timeCategories[2]] += currentStatuses[terr].doors
    } else {
      var monthsSinceCovered = (now - currentStatuses[terr].dateactual) / 1000 / 60 / 60 / 24 / (365.25 / 12);
      if (monthsSinceCovered > 12) {
        var areaToIncrease = [timeCategories[2]];
      } else if (monthsSinceCovered > 6) {
        var areaToIncrease = [timeCategories[1]];
      } else if (monthsSinceCovered >= 0) {
        var areaToIncrease = [timeCategories[0]];
      } else {
        console.log("CHART ERROR: ", currentStatuses[terr].code, monthsSinceCovered)
      }
      if (areaToIncrease !== "") {
        terrCoverageInfo[currentStatuses[terr].area][areaToIncrease] += currentStatuses[terr].doors
      }
    }
  }
  //console.log(terrCoverageInfo)
  areas = Object.keys(terrCoverageInfo);
  var legendData = [];
  timeCategories.forEach(function(tC) {
    var sum = 0;
    Object.keys(terrCoverageInfo).forEach(function(tA) {
      sum = sum + terrCoverageInfo[tA][tC];
    })
    legendData.push(sum);
  })

  var charts = {
    terrCoverageInfo
  };
  $("table.main").after("<div id='globalCoverageChart' class='chart fullpage' style='display: none'><canvas id='globalCoverage' width='400' height='400'></canvas></div>");
  charts.globalCoverage = {}
  charts.globalCoverage.el = $("#globalCoverage");
  charts.globalCoverage.data = {
    labels: [
      [timeCategories[0]],
      [timeCategories[1]],
      [timeCategories[2]]
    ],
    datasets: [{
      label: '# of Terrs',
      data: legendData,
      backgroundColor: ["#4CAF50", "#FFC107", "#f44336"]

    }]
  }
  charts.globalCoverage.options = {
    title: {
      display: true,
      text: 'Doors covered globally',
      fontSize: 24
    },
    legend: {
      display: true,
      position: 'bottom',
      labels: {
        generateLabels: function(chart) {
          var data = chart.data;
          if (data.labels.length && data.datasets.length) {
            return data.labels.map(function(label, i) {
              var meta = chart.getDatasetMeta(0);
              var ds = data.datasets[0];
              var arc = meta.data[i];
              var custom = arc && arc.custom || {};
              var getValueAtIndexOrDefault = Chart.helpers.getValueAtIndexOrDefault;
              var arcOpts = chart.options.elements.arc;
              var fill = custom.backgroundColor ? custom.backgroundColor : getValueAtIndexOrDefault(ds.backgroundColor, i, arcOpts.backgroundColor);
              var stroke = custom.borderColor ? custom.borderColor : getValueAtIndexOrDefault(ds.borderColor, i, arcOpts.borderColor);
              var bw = custom.borderWidth ? custom.borderWidth : getValueAtIndexOrDefault(ds.borderWidth, i, arcOpts.borderWidth);

              // We get the value of the current label
              var value = chart.config.data.datasets[arc._datasetIndex].data[arc._index];

              return {
                // Instead of `text: label,`
                // We add the value to the string
                text: label + " : " + value,
                fillStyle: fill,
                strokeStyle: stroke,
                lineWidth: bw,
                hidden: isNaN(ds.data[i]) || meta.data[i].hidden,
                index: i
              };
            });
          } else {
            return [];
          }
        }
      }
    },
  };
  charts.globalCoverage.chart = new Chart(charts.globalCoverage.el, {
    type: 'pie',
    data: charts.globalCoverage.data,
    options: charts.globalCoverage.options,
  });

  $("#globalCoverageChart").after("<div id='individualCoverageCharts' class='chart fullpage' style='display:none'>");

  //var montrAreas = ["MON", "MNS", "MSS", "MWI"];
  for (var area in areas) {
    $("#individualCoverageCharts").append("<div id='" + areas[area] + "CoverageChart' class='chart'><canvas id='" + areas[area] + "Coverage' width='400' height='400'></canvas></div>");
    charts[areas[area] + "Coverage"] = {}
    charts[areas[area] + "Coverage"].el = $("#" + areas[area] + "Coverage");
    charts[areas[area] + "Coverage"].data = {
      labels: [
        [timeCategories[0]],
        [timeCategories[1]],
        [timeCategories[2]]
      ],
      datasets: [{
        label: '# of Terrs',
        data: [
          terrCoverageInfo[areas[area]][timeCategories[0]], terrCoverageInfo[areas[area]][timeCategories[1]], terrCoverageInfo[areas[area]][timeCategories[2]]
        ],
        backgroundColor: ["#4CAF50", "#FFC107", "#f44336"]

      }]
    }
    charts[areas[area] + "Coverage"].options = {
      title: {
        display: true,
        text: 'Doors covered in the ' + areas[area] + ' area',
        fontSize: 18
      },
      legend: {
        display: true,
        position: 'bottom',
        labels: {
          generateLabels: function(chart) {
            var data = chart.data;
            if (data.labels.length && data.datasets.length) {
              return data.labels.map(function(label, i) {
                var meta = chart.getDatasetMeta(0);
                var ds = data.datasets[0];
                var arc = meta.data[i];
                var custom = arc && arc.custom || {};
                var getValueAtIndexOrDefault = Chart.helpers.getValueAtIndexOrDefault;
                var arcOpts = chart.options.elements.arc;
                var fill = custom.backgroundColor ? custom.backgroundColor : getValueAtIndexOrDefault(ds.backgroundColor, i, arcOpts.backgroundColor);
                var stroke = custom.borderColor ? custom.borderColor : getValueAtIndexOrDefault(ds.borderColor, i, arcOpts.borderColor);
                var bw = custom.borderWidth ? custom.borderWidth : getValueAtIndexOrDefault(ds.borderWidth, i, arcOpts.borderWidth);

                // We get the value of the current label
                var value = chart.config.data.datasets[arc._datasetIndex].data[arc._index];

                return {
                  // Instead of `text: label,`
                  // We add the value to the string
                  text: label + " : " + value,
                  fillStyle: fill,
                  strokeStyle: stroke,
                  lineWidth: bw,
                  hidden: isNaN(ds.data[i]) || meta.data[i].hidden,
                  index: i
                };
              });
            } else {
              return [];
            }
          }
        }
      },
    };
    charts[areas[area] + "Coverage"].chart = new Chart(charts[areas[area] + "Coverage"].el, {
      type: 'pie',
      data: charts[areas[area] + "Coverage"].data,
      options: charts[areas[area] + "Coverage"].options,
    });
  }
}

function enableDisplayButton() {
  $("#printTAR").prop('disabled', false);
}

function printTar() {
  $("#terrs, .chart.fullpage, .main").toggle();
}

$("#printTAR").click(function() {
  printTar();
});

$("table.main").after("<div id='terrs' style='display:none'>");

getCurrentStatuses();
getStatusHistory();
makeCharts();
enableDisplayButton();
