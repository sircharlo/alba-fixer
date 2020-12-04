//$("table:eq(0)").addClass("mainTable");
//$("body").after("<button id='printTAR' disabled='disabled'>Print TAR</button><button id='hideTAR' style='display: none;'>Back</button><span id='updateStatus'>Verifying if territory sign-out history updates are necessary...</span>");

// declare some vars
/*var dateReturned = new Date();
var currentlySignedOut = [];
var signedOutHistory = [];
var signedOutHistoryFormatted = {};
var addToSignedOutHistory = [];
var populations = {};
var populationsByTer = {};
var formID = ["entry.1034074982", "entry.1657743289", "entry.1862622033", "entry.536978807", "entry.853264099", "entry.502204457", "entry.716062490", "entry.1560598354", "entry.1868906645", "entry.1878392072"]; // google form field ids
var url = "";
var h = 0, i = 0, j = 0, y = 0, nameCell, datesRow, colors, workDate;*/

/*$("table.mainTable tbody tr").each(function (key, value) {
    currentlySignedOut[key] = [];
    $(this).children("td").each(function (index, value) {
        if (index == 1) {
            currentlySignedOut[key].push($(value).find("b").text().trim());
            currentlySignedOut[key].push($(value).contents().filter(function () {
                return this.nodeType === 3;
            }).text().trim());
        } else if (index == 4) {
            currentlySignedOut[key].push($(value).find("strong").text().trim());
            currentlySignedOut[key].push($(value).find("small").text().trim());
        } else {
            currentlySignedOut[key].push($(value).text().trim());
        }
    });
    var terrArea = $(this).find("td:nth-child(2) b").text().split("-")[0];
    var terrName = $(this).find("td:nth-child(2) b").text();
    var population = parseInt($(this).find("td:nth-child(3) span").text());
    if (terrArea.toUpperCase() == terrArea) {
        populations[terrArea] ? populations[terrArea] += population : populations[terrArea] = population;
        populationsByTer[terrName] = population;
    }
});
$.each(currentlySignedOut, function (k, v) {
    if (currentlySignedOut[k][6] !== 'Never completed' && !currentlySignedOut[k][5].includes("Printed")) addToSignedOutHistory.push(currentlySignedOut[k]);
});*/

$.getJSON("https://spreadsheets.google.com/feeds/list/1HgHkhx7AkZ8iQx5ICPcMDsf1wZW_7D7KBj__Eg1UVEU/default/public/values?alt=json", function (data) {
    if (data.feed.entry) {
        $.each(data.feed.entry, function (index, value) {
    //         signedOutHistory[index] = [];
    //         $.each(value, function (key, value) {
    //             if (key.indexOf("gsx") !== -1) signedOutHistory[index].push(value["$t"]);
    //         });
    //         for (y = 0; y < addToSignedOutHistory.length; y += 1) {
    //             if (addToSignedOutHistory[y][0] == signedOutHistory[index][1] && addToSignedOutHistory[y][4] == signedOutHistory[index][5] && addToSignedOutHistory[y][5] == signedOutHistory[index][6] && addToSignedOutHistory[y][6] == signedOutHistory[index][7]) addToSignedOutHistory[y] = "";
    //         }
    //         addToSignedOutHistory = $.grep(addToSignedOutHistory, function (value) {
    //             return value !== "";
    //         });
    //
    //         if (!signedOutHistoryFormatted[signedOutHistory[index][2]]) {
    //             signedOutHistoryFormatted[signedOutHistory[index][2]] = [];
    //         }
    //
    //         function pushSignedOutTerr() {
    //             var dateOut = new Date(signedOutHistory[index][7]);
    //             dateOut = dateOut.getFullYear() + "." + ("0" + (dateOut.getMonth() + 1)).slice(-2) + "." + ("0" + dateOut.getDate()).slice(-2);
    //
    //             signedOutHistoryFormatted[signedOutHistory[index][2]].push([signedOutHistory[index][0], signedOutHistory[index][4], signedOutHistory[index][5], signedOutHistory[index][6], dateOut, ""]);
    //
    //         }
    //         if (signedOutHistoryFormatted[signedOutHistory[index][2]].length === 0) {
    //             pushSignedOutTerr();
    //         } else if (signedOutHistoryFormatted[signedOutHistory[index][2]][signedOutHistoryFormatted[signedOutHistory[index][2]].length - 1][5] === "") {
    //             if (signedOutHistory[index][7].includes("Last")) {
    //                 dateReturned = new Date(signedOutHistory[index][7].replace(/Last completed /i, '').split(" by ")[0]);
    //                 dateReturned = dateReturned.getFullYear() + "." + ("0" + (dateReturned.getMonth() + 1)).slice(-2) + "." + ("0" + dateReturned.getDate()).slice(-2);
    //                 signedOutHistoryFormatted[signedOutHistory[index][2]][signedOutHistoryFormatted[signedOutHistory[index][2]].length - 1][5] = dateReturned;
    //             } else {
    //                 pushSignedOutTerr();
    //             }
    //         } else {
    //             pushSignedOutTerr();
    //         }
    //
    //     });
    // }
    // console.log(signedOutHistoryFormatted);
    //
    // if (addToSignedOutHistory.length === 0) {
    //     $("#updateStatus").html("No territory sign-out history update necessary");
    //     $("#printTAR").prop("disabled", false);
    // } else {
    //     var iframeLoad = 0;
    //   function iframeLoaded() {
    //         iframeLoad += 1;
    //         if (iframeLoad == addToSignedOutHistory.length) {
    //             $("#updateStatus").html("Territory sign-out history updates completed (" + iframeLoad + ")");
    //             location.reload();
    //         }
    //     }
    //     for (i = 0; i < addToSignedOutHistory.length; i += 1) {
    //         url = "https://docs.google.com/forms/d/e/1FAIpQLSfuKMhGFNx99lRMhBeGT38g_0CJDd0D5JxAFxW53N1JD7G0fA/formResponse?";
    //         for (j = 0; j < addToSignedOutHistory[i].length; j += 1) {
    //             url += formID[j] + "=" + encodeURIComponent(addToSignedOutHistory[i][j]) + "&";
    //         }
    //         var ifr = $('<iframe/>', {
    //             src: url,
    //             style: 'display:none;'
    //         });
    //         $('body').append(ifr);
    //         $("#printTAR").prop("disabled", true);
    //         $("#updateStatus").html("Preparing territory sign-out history updates (" + (i + 1) + ")");
    //         $(ifr).on("load", function () {
    //             iframeLoaded();
    //         });
    //     }
    // }
    // var terrs = $(".mainTable tbody tr td:nth-child(2) b:not(:contains(Search)):not(:contains(Tel-)):not(:contains(Wow-))");
    // var numTerrs = terrs.length;
    // var pages = Math.ceil(numTerrs / 5);
    // for (h = 0; h < pages; h++) {
    //     $(".mainTable").before("<div class='territoryAssignmentRecordC'><div class='title'>Territory Assignment Record</div><table class='territoryAssignmentRecord'><thead></thead><tbody></tbody></table></div>");
    // }
    // terrs.each(function (k) {
    //     $(".territoryAssignmentRecord:eq(" + Math.ceil(((k + 1) / 5) - 1) + ") thead").append("<th colspan='2'><span class='terrlabel'>Terr.<br/>No.</span><span class='terrno'>" + $(this).html() + "</span></th>");
    // });
    //
    // for (j = 0; j < 25; j++) {
    //     var htmlAppend = "<tr class='name" + ((Math.ceil((j)) % 2) === 0 ? " other" : "") + "'>";
    //     for (i = 0; i < 5; i++) {
    //         htmlAppend += "<td colspan='2'" + (i == 1 || i == 3 ? " class='even'" : "") + "></td>";
    //     }
    //     htmlAppend += "</tr><tr" + ((Math.ceil((j)) % 2) === 0 ? " class='other'" : "") + ">";
    //     for (i = 0; i < 5; i++) {
    //         htmlAppend += "<td class='dateleft" + (i == 1 || i == 3 ? " even" : "") + "'></td><td class='dateright" + (i == 1 || i == 3 ? " even" : "") + "'></td>";
    //     }
    //     htmlAppend += "</tr>";
    //     $(".territoryAssignmentRecord tbody").append(htmlAppend);
    // }
    // $.each(signedOutHistoryFormatted, function (k, v) {
    //     var thead = $(".territoryAssignmentRecord thead th:contains(" + k + ")");
    //     var cellIndex = $(".territoryAssignmentRecord thead th:contains(" + k + ")").index();
    //     if (cellIndex !== -1) {
    //         var rows = $(thead).closest('thead').next("tbody").children();
    //         $.each(v, function (k, v) {
    //             nameCell = $((rows)[((k + 1) * 2) - 2]).children("td").eq(cellIndex);
    //             datesRow = $((rows)[((k + 1) * 2) - 1]).children("td");
    //             nameCell.text(v[3]);
    //             datesRow.eq(((cellIndex + 1) * 2) - 2).text(v[4]);
    //             datesRow.eq(((cellIndex + 1) * 2) - 1).text(v[5]);
    //         });
    //     }
    // });
    // $(".territoryAssignmentRecord tr.name").each(function () {
    //     if ($(this).text() === "") {
    //         $(this).next("tr").hide();
    //         $(this).hide();
    //     } else {
    //         $(this).html($(this).html().replace(/ \(Deleted\)/g,""));
    //         $(this).find("td").each(function (k) {
    //             var num = ((k) * 2);
    //             if ($(this).text().length > 0) {
    //                 var prevOutDate = $(this).parent().prev("tr.other").find("td:eq(" + num + ")");
    //                 var terr = $(this).closest("table").find("thead th:eq(" + k + ")");
    //                 var prevInDate = $(this).parent().prev("tr.other").find("td:eq(" + parseInt(num + 1) + ")");
    //                 //var prevName = $(this).parent().prev("tr.other").prev("tr.name").find("td:eq(" + k + ")");
    //                 if (prevOutDate.length > 0 && prevInDate.length > 0 && prevInDate.text() === "") {
    //                     $(terr).css("background-color", "red");
    //                 }
    //             }
    //         });
    //     }
    // });
    var areas = {};
    var areaChildren = {};
    var subareas = {};
    $(".mainTable td:nth-child(2) b").each(function () {
        var territory = $(this).text();
        var area = territory.split("-")[0];
        var subarea = territory.split("-")[1];
        var areaLong = $(this).parent().clone().children().remove().end().contents().text().trim().split(" - ")[0];
        var subareaLong = $(this).parent().clone().children().remove().end().contents().text().trim().split(" - ")[1];
        if (!areas[area]) areas[area] = [];
        if (areas[area].indexOf(areaLong) == -1) areas[area].push(areaLong);
        if (!subareas[subarea]) subareas[subarea] = [];
        if (subareas[subarea].indexOf(subareaLong) == -1) subareas[subarea].push(subareaLong);
        if (!areaChildren[area]) areaChildren[area] = [];
        if (areaChildren[area].indexOf(subarea) == -1) areaChildren[area].push(subarea);
    });

    var output = "<div class='territoryAssignmentRecordC' id='areaContainer'><h2>Areas</h2><p><ul>";
    Object.keys(areas).sort().forEach(function (v, i) {
        if (areas[v][0].indexOf("Telephone") === -1) {
            (areas[v].length == 1) ? areas[v] = areas[v][0]: areas[v] = "<span class='ro40_c'>" + areas[v].join("</span>, <span class='ro40_c'>") + "</span>";
            var backgroundColor = colors.slice(0).reverse()[i];
            (v.toUpperCase() !== v) ? delete areas[v]: output += "<li><span class='label' style='background-color: " + backgroundColor + "; color: " + setTextColorByLuma(backgroundColor) + "'>" + v + " - " + areas[v] + " (" + populations[v] + ")</span></li>";
        }
    });
    output += "</ul></p><h2>Subareas</h2><p><ul>";
    Object.keys(subareas).forEach(function (v, i) {
        if (v.toLowerCase().indexOf("tel") === -1 && v.toUpperCase() == v && v.match(/[a-z]/i)) {
            (subareas[v].length == 1) ?
            subareas[v] = subareas[v][0]: subareas[v] = "<span class='ro40_c'>" + subareas[v].join("</span>, <span class='ro40_c'>") + "</span>";
            var parentArea = Object.keys(areaChildren).find(key => areaChildren[key].indexOf(v) !== -1);
            var backgroundColor = colors.slice(0).reverse()[Object.keys(areas).indexOf(parentArea)];
            (v.toUpperCase() !== v) ? delete subareas[v]: output += "<li><span class='label' style='background-color: " + backgroundColor + "; color: " + setTextColorByLuma(backgroundColor) + "'>" + v + " - " + subareas[v] + "</span></li>\n";
        }
    });
    output += "</ul></p></div>";


    $(".territoryAssignmentRecordC:eq(0)").before(output);
    $(".territoryAssignmentRecordC").hide();
    $("#areaContainer").before("<div class='territoryAssignmentRecordC' id='graphContainer'></div>");
    $("#graphContainer").after("<div class='territoryAssignmentRecordC' id='areaFrequencyContainer'></div>");
});

function graphAway() {
    var terrs = [],
        lastWorked = {},
        areas = {},
        stats,
        terr = "",
        monthsSinceWorked,
        timePeriod = "";

    $(".mainTable > tbody > tr > td:nth-child(2) b").each(function () {
        terr = $(this).text().trim();
        if ($.inArray(terr, terrs) === -1) {
            terrs.push(terr);
        }
        var area = terr.split("-")[0];
        var areaFull = $(this).parent().clone().children().remove().end().contents().text().trim().split(" - ")[0];
        if (!areas[area] && area.toUpperCase() == area) {
            areas[area] = areaFull;
        }
    });
    $.each(terrs, function (k, v) {
        terr = v;
        monthsSinceWorked = -1;
        if (signedOutHistoryFormatted[v]) {
            var terrHist = signedOutHistoryFormatted[v][signedOutHistoryFormatted[v].length - 1];
            if (terrHist[5] === "") {
                workDate = terrHist[4];
            } else {
                workDate = terrHist[5];
            }
            monthsSinceWorked = workDate.length > 0 ? (new Date() - new Date(workDate)) / 1000 / 60 / 60 / 24 / 30.4375 : -1;
        }

        if (lastWorked[terr]) {
            lastWorked[terr] < monthsSinceWorked ? lastWorked[terr] = monthsSinceWorked : "";
        } else {
            lastWorked[terr] = monthsSinceWorked;
        }
    });

    function frequencyAnalysis(area) {
        stats = {
            "Not done since the switch to Alba in December 2016": 0,
            "Done over 1 year ago": 0,
            "Done from 6 to 12 months ago": 0,
            "Done in the last 6 months": 0
        };
        $.each(lastWorked, function (k, v) {
            if ((new RegExp("^" + area, "i").test(k) || typeof area === "undefined") && Object.keys(populationsByTer).indexOf(k) !== -1) {
                if (v == -1) {
                    timePeriod = "Not done since the switch to Alba in December 2016";
                } else if (v < 6) {
                    timePeriod = "Done in the last 6 months";
                } else if (v < 12) {
                    timePeriod = "Done from 6 to 12 months ago";
                } else
                if (v >= 12) {
                    timePeriod = "Done over 1 year ago";
                } else {
                    console.log(v);
                }
                stats[timePeriod] += populationsByTer[k];
            }
        });
    }

    var options = {
        responsive: false,
        title: {
            display: true,
            fontSize: 20
        },
        legend: {
            position: 'bottom',
            reverse: true,
            labels: {
                usePointStyle: true,
                fontSize: 40,
                filter: function (li, cd) {
                    if (cd.datasets[0].data[li.index] !== 0) {
                        return true;
                    }
                }
            }
        },
        tooltips: {
            bodyFontSize: 18,
            callbacks: {
                label: function (tooltipItem, data) {
                    var value = data.datasets[tooltipItem.datasetIndex].data[tooltipItem.index];
                    return value;
                }
            }
        }
    };

    Chart.defaults.global.animation.duration = 0;
    Chart.defaults.global.tooltips.enabled = false;

    function frequencyCharts() {
        $("#graphContainer").append("<canvas width='2400' height='3150' class='chart-frequency' id='chart-global'></canvas>");
        var ctx = $("#chart-global");
        var data = {
            labels: [],
            datasets: [{
                data: [],
                backgroundColor: [
                    "#CC0000", "#ffbb33", "#007E33", "#00C851"
                ]
            }]
        };

        frequencyAnalysis();
        var legendItems = Object.keys(stats);
        legendItems.forEach(function (v, k, a) {
            return a[k] = v + ": " + Object.values(stats)[k];
        });
        data.labels = legendItems, data.datasets[0].data = Object.values(stats);
        options.title.text = "Door coverage";
        options.title.fontSize = 100;
        options.legend.display = true;
        options.legend.position = "bottom";
        options.legend.labels.padding = 40;

        new Chart(ctx, {
            type: 'pie',
            data: data,
            options: options
        });

        $.each(["MON", "MNS", "MSS", "MWI"].concat(Object.keys(areas).filter(function (propertyName) {
            return !(propertyName.indexOf("MON") === 0) && !(propertyName.indexOf("MNS") === 0) && !(propertyName.indexOf("MWI") === 0) && !(propertyName.indexOf("MSS") === 0) && !(propertyName.indexOf("Tel-") === 0);
        })), function (k, v) {
            var area = v;
            $("#areaFrequencyContainer").append("<canvas height='720' width='480' class='chart-frequency' id='chart-" + area.toLowerCase() + "'></canvas>");
            var ctx = $("#chart-" + area.toLowerCase());
            var data = {
                labels: [],
                datasets: [{
                    data: [],
                    backgroundColor: [
                        "#CC0000", "#ffbb33", "#007E33", "#00C851"
                    ]
                }]
            };
            data.labels = [];
            data.datasets[0].data = [];
            options.title.text = areas[area] + " (" + populations[area] + ")";
            options.title.fontSize = 40;
            options.tooltips.bodyFontSize = 30;
            options.legend.display = true;
            options.legend.position = "bottom";
            options.legend.labels.fontSize = 30;
            options.legend.labels.padding = 20;

            frequencyAnalysis(area);
            data.labels = Object.values(stats), data.datasets[0].data = Object.values(stats);
            new Chart(ctx, {
                type: 'pie',
                data: data,
                options: options
            });
        });
    }

    function populationCharts() {
        var data = {
            labels: [],
            datasets: [{
                data: [],
                backgroundColor: colors.reverse()
			}]
        };

        $("#graphContainer").append("<canvas width='2400' height='3150' id='chart-population'></canvas>");
        var ctx = $("#chart-population");
        var legendItems = Object.keys(populations);
        legendItems.forEach(function (v, k, a) {
            return a[k] = v;
        });
        options.title.text = "Doors per area";
        options.title.fontSize = 100;
        options.legend.display = false;
        options.scales = {
            xAxes: [{
                ticks: {
                    fontSize: 40
                }
            }],
            yAxes: [{
                ticks: {
                    fontSize: 40
                }
            }]
        };
        data.labels = legendItems, data.datasets[0].data = Object.values(populations);

        new Chart(ctx, {
            type: 'bar',
            data: data,
            options: options
        });
    }
    $("canvas").remove();
    frequencyCharts();
    populationCharts();
    $("#areaFrequencyContainer [id*='mon'],[id*='mwi'],[id*='mss'],[id*='mns']").addClass("big-areas");
    $("#areaFrequencyContainer :not([id*='mon'],[id*='mwi'],[id*='mss'],[id*='mns'])").addClass("small-areas");
}


function printTAR() {
    $("div:eq(0), .mainTable, h1").hide();
    $(".territoryAssignmentRecordC, #hideTAR").show();
    graphAway();
}

$("#printTAR").click(function () {
    printTAR();
    $("#printTAR, #updateStatus").hide();
    $("#hideTAR").show();
});

$("#hideTAR").click(function () {
    $("div:eq(0), .mainTable, #printTAR, .territoryAssignmentRecordC, #hideTAR, h1, #updateStatus").toggle();
});
