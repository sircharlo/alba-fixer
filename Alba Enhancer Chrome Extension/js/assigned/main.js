if (adminState === true) {
    $("#territories").after('<div id="territoryList" class="modal fade hide" tabindex="-1"><div class="modal-header"><h3>Territories</h3></div><div class="modal-body"><ul id="individualTerritories"></ul></div><div class="modal-footer"><button class="btn" data-dismiss="modal">OK</button></div></div></div>');
    $("#territories").after('<div id="territoryFacts" class="modal fade hide" tabindex="-1"><div class="modal-header"><h3>Territory Facts</h3></div><div class="modal-body"><ul id="facts"></ul></div><div class="modal-footer"><button class="btn" data-dismiss="modal">OK</button></div></div></div>');

    function createList() {
        $("#individualTerritories").html($("td.territory:visible").clone());
        $("#individualTerritories span.label").remove();
        $("#individualTerritories td").each(function () {
            $(this).replaceWith($('<li>' + this.innerHTML.replace("<br>", "").replace("</b>", "</b> //").replace("&nbsp; ", "") + '</li>'));
        });
    }

    function createFacts() {
        var areas = {};
        $("#territories tr").each(function () {
            var population = parseInt($(this).find("td:nth-child(3)").text().trim());
            var areaShort = $(this).find("td:nth-child(2) b").text().trim().split("-")[0];
            if (areaShort === areaShort.toUpperCase()) {
                var area = orphanText($(this).find("td:nth-child(2)")).split(" - ")[0];
                if (!areas.hasOwnProperty(area)) {
                    areas[area] = {
                        total: 0,
                        donePastYear: 0,
                        notDonePastYear: 0
                    };
                }
                areas[area].total += population;
                if ($(this).hasClass("over-one-year")) {
                    areas[area].notDonePastYear += population;
                } else {
                    areas[area].donePastYear += population;
                }
            }
        });
        var text = "";

        $.each(areas, function (k, v) {
            var percent = (areas[k].notDonePastYear / areas[k].total * 100).toFixed(1);
            if (percent > 0) {
                text += "<li>" + k + ": <strong>" + (areas[k].notDonePastYear / areas[k].total * 100).toFixed(1) + "%</strong> of doors (" + areas[k].notDonePastYear + ") <strong>not done</strong> in the past year" + "</li>";
            }
        });
        $("#facts").html(text);
    }

    function createShame() {
        var myTableArray = [];

        $("#territories tr").each(function () {
            var arrayOfThisRow = [],
                tableData = $(this).find("td");
            tableData.length > 0 && (tableData.each(function (i, v) {
                    i !== 4 && i !== 3 && i !== 8 && (i == 1 || i == 6 ? arrayOfThisRow.push($(this).html()) : arrayOfThisRow.push($(this).text()));
                }),
                myTableArray.push(arrayOfThisRow));
        });

        var terrsPerPerson = {};
        $.each(myTableArray, function (i, v) {
            if (v[3] == "Signed-out") {
                v.push(v[4].split("</strong>")[1].replace(/<(?:.|\n)*?>/gm, ''));
                v[4] = v[4].split("</strong>")[0].replace(/<(?:.|\n)*?>/gm, '');
                v.push(v[1].split("</b>")[1].replace(/<(?:.|\n)*?>/gm, '').replace(" &nbsp; Assigned (no border)", ""));
                v[1] = v[1].split("</b>")[0].replace(/<(?:.|\n)*?>/gm, '');
                if (terrsPerPerson[v[4]] === undefined) {
                    terrsPerPerson[v[4]] = [];
                }
                terrsPerPerson[v[4]].push([v[1], v[6]]);
            }
        });

        var formattedTerrsPerPerson = "";
        $.each(Object.keys(terrsPerPerson).sort(), function (k, v) {
            formattedTerrsPerPerson += "<li><div class='name'>" + v + "</div>\n<ul class='terrs'>\n",
                $.each(terrsPerPerson[v], function (k, v) {
                    var terDate = new Date(v[1]);
                    var timeOut = (new Date() - terDate) / 1000 / 60 / 60 / 24 / (365.25 / 12);
                    formattedTerrsPerPerson += "<li" + (timeOut > 4 ? " class='overdue'" : "") + ">" + v[0] + "</li>\n";
                }),
                formattedTerrsPerPerson += "</ul>\n";
            formattedTerrsPerPerson += "<span class='bold smaller'>Пожалуйста, обратите внимание:</span><ul class='smaller'>";
          //  formattedTerrsPerPerson += "<li>убедитесь, что у вас есть все эти территории.</li>";
          //  formattedTerrsPerPerson += "<li>если одна из них потеряна, пожалуйста как можно скорее расскажи брату, который заботится о территориях, об этом.</li>";
            formattedTerrsPerPerson += "<li>Если перед территорией есть зеленая точка, еще есть время ее закончить. Нет необходимости сразу ее возвращать.</li>";
            formattedTerrsPerPerson += "<li>Если перед территорией есть красная точка, она просрочена. Пожалуйста, верните брату территорию как можно скорее.</li>";
            formattedTerrsPerPerson += "</ul>";
            formattedTerrsPerPerson += "<span class='bold smaller'>Please note:</span><ul class='smaller'>";
          //  formattedTerrsPerPerson += "<li>make sure you still have every territory listed.</li>";
          //  formattedTerrsPerPerson += "<li>if you no longer have one of these territories, please let the territory servant know.</li>";
            formattedTerrsPerPerson += "<li>If a territory is preceded by a green bullet point, it is not overdue. You may continue to work it.</li>";
            formattedTerrsPerPerson += "<li>If a territory is preceded by a red bullet point, it is overdue. Please hand it in as soon as possible.</li>";
            formattedTerrsPerPerson += "</ul>";
            formattedTerrsPerPerson += "</li>\n";
        });
        $("#shame").html(formattedTerrsPerPerson);
    }

    $("#territory-areas").parent().after("<li><a id='territory-list'>Territory list</a></li><button id='list-show' href='#territoryList' class='hide' data-toggle='modal'>List</button>");
    $("#territory-areas").parent().after("<li><a id='territory-facts'>Territory facts</a></li><button id='facts-show' href='#territoryFacts' class='hide' data-toggle='modal'>Facts</button>");
    $("#territory-areas").parent().after("<li><a id='territory-shame'>List of assigned and overdue territories</a></li>");

    $("#territory-list").click(function () {
        createList();
        $("#list-show").click();
    });

    $("#territory-facts").click(function () {
        createFacts();
        $("#facts-show").click();
    });

    $("html").on("click", "#territory-shame-remove", function () {
        $("#shameContainer, #territory-shame-remove").remove();
        $("body > *:not(.datepicker)").show();
    });

    $("#territory-shame").click(function () {
        $("body").append("<div id='shameContainer'></div>");
        $("#shameContainer").append("<ul id='shame'></ul>");
        createShame();
        $("body > *").hide();
        $("#shameContainer").show();
        $("body").after("<button id='territory-shame-remove'>Back to Assigned</button>");
    });

    $("[name=so]").parent().wrap("<div></div>");

    $("#view div:first label:first").clone().appendTo($("#view div:first div"));
    $("[name=av]:not(:first)").attr("name", "od");
    $("[name=od]").parent().html($("[name=od]").parent().html().replace("Available", "Overdue"));

    $("#view div:first label:first").clone().insertAfter($("#view div:first label:first"));
    $("[name=av]:not(:first)").attr("name", "rw");
    $("[name=rw]").parent().html($("[name=rw]").parent().html().replace("Available", "Completed in the past 6 months"));

    $("#view div:first label:first").clone().insertAfter($("#view div:first label:first"));
    $("[name=av]:not(:first)").attr("name", "nm");
    $("[name=nm]").parent().html($("[name=nm]").parent().html().replace("Available", "Not worked in 6 to 12 months"));

    $("#view div:first label:first").clone().insertAfter($("#view div:first label:first"));
    $("[name=av]:not(:first)").attr("name", "nc");
    $("[name=nc]").parent().html($("[name=nc]").parent().html().replace("Available", "Not worked in over 1 year"));

    $("[name=av]").on("change", function () {
        $("[name=nc],[name=rw],[name=nm]").prop("disabled", !($(this).prop("checked")));
    });
    $("[name=so]").on("change", function () {
        $("[name=od]").prop("disabled", !($(this).prop("checked")));
    });

    var target = $("#territories")[0];
    var observer = new MutationObserver(function (mutations) {
        mutations.forEach(function (mutation) {
            var newNodes = mutation.addedNodes;
            if (newNodes.length > 0) {
                var $nodes = $(newNodes);
                $nodes.each(function () {
                    var $node = $(this).find("td small.muted");
                    if ($node.text() != "Never completed") {
                        var prevDone = false, dateSO, targetElem;
                        if ($node.text().match(/last/i)) {
                             dateSO = new Date($node.text().replace(/Last completed /i, '').split(" by ")[0]);
                             targetElem = $node.parent().next("td").next("td").find("span.badge");
                            prevDone = true;
                        } else {
                             dateSO = new Date($node.text());
                             targetElem = $node.parent().next("td").find("span.badge");
                        }
                        var monthsSO = Math.abs(Math.round((dateSO - new Date()) / 1000 / 60 / 60 / 24 / 30.42 * 10) / 10);
                        targetElem.text(monthsSO);
                        if (prevDone && monthsSO <= 6) {
                            targetElem.closest("tr").addClass("recently-worked");
                            //targetElem.closest("tr").find(".controls .dropdown-menu a.cmd-assign-to").parent("li").addClass("disabled");
                        } else if (!prevDone && monthsSO > 3) {
                            targetElem.addClass("badge-important");
                            targetElem.closest("tr").addClass("overdue");
                        } else if (prevDone && monthsSO > 12) {
                            targetElem.closest("tr").addClass("over-one-year");
                        } else if (prevDone && monthsSO > 6) {
                            targetElem.closest("tr").addClass("normal");
                        }
                    } else {
                        $node.closest("tr").addClass("over-one-year");
                    }
                });
                if ($("[name=av]").prop("disabled") !== true) {
                    var scriptSrc = String.raw `
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
                });`;
                    injectScript(scriptSrc, "recently-worked", "body");

                    scriptSrc = String.raw `
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
                    injectScript(scriptSrc, "overdue", "body");

                    scriptSrc = String.raw `
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
                });`;
                    injectScript(scriptSrc, "overdue", "body");


                    scriptSrc = String.raw `
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
                });`;
                    injectScript(scriptSrc, "never-completed", "body");
                }
            }
        });
    });

    var target2 = $("#stats")[0];
    var observer2 = new MutationObserver(function (mutations) {
        mutations.forEach(function (mutation) {
            if (mutation.type == "childList" && mutation.addedNodes.length > 0) {
                var terrs = parseInt($("#summary .badge:eq(0)").text());
                $("#stats tbody tr").each(function () {
                    var matchTerrs = parseInt($(this).find("td:nth-child(2)").text());
                    var newPercent = (matchTerrs / terrs * 100).toFixed(1) + "%";
                    $(this).find("td:nth-child(3)").html(newPercent);
                    $(this).find("td:nth-child(4) div.bar").css("width", newPercent);
                });
            }
        });
    });


    var config = {
        attributes: true,
        childList: true,
        characterData: true
    };

    observer.observe(target, config);
    observer2.observe(target2, config);
}
