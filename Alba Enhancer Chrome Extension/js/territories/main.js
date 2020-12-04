if (adminState === true) {
    $("[name=c]").after('<select id="c-select"><option value="">- Campaign -</option><option value="' + new Date().getFullYear() + ': Кампания на Вечерю / Memorial">Memorial</option><option value="' + new Date().getFullYear() + ': Конгресс / Convention">Convention</option></select>');
    $("[name=c]").hide();
    $("#c-select").change(function () {
        $("[name=c]").val($("#c-select").val());
    });
    $("#territories").after('<div id="territoryAreas" class="modal fade hide" tabindex="-1"><div class="modal-header"><h3>Territories</h3></div><div class="modal-body"><p id="areasText"></p></div><div class="modal-footer"><button class="btn" data-dismiss="modal">OK</button></div></div></div>');

    $("input[name=g]").prop("checked", "checked");
    function areaEnumerate() {
        var areas = {};
        var subareas = {};
        var subareaParents = {};
        var areaPopulations = {};
        var subareaPopulations = {};
        $("#territories td:nth-child(2):not(:contains(Search)) strong, #territories td:nth-child(2):not(:contains(Search)) b").each(function () {
            var territory = $(this).text();
            var area = territory.split("-")[0];
            var subarea = territory.split("-")[1];
            var areaLong = $(this).parent().clone().children().remove().end().contents().text().trim().split(" - ")[0];
            var subareaLong = $(this).parent().clone().children().remove().end().contents().text().trim().split(" - ")[1];
            if (!areas[area]) areas[area] = [];
            if (areas[area].indexOf(areaLong) == -1) areas[area].push(areaLong);
            if (!areaPopulations[area]) areaPopulations[area] = 0;
            areaPopulations[area] += parseInt($(this).parent().next().text());
            if (!subareas[subarea]) subareas[subarea] = [];
            if (subareas[subarea].indexOf(subareaLong) == -1) subareas[subarea].push(subareaLong);
            if (!subareaPopulations[subarea]) subareaPopulations[subarea] = 0;
            subareaPopulations[subarea] += parseInt($(this).parent().next().text());
            subareaParents[subarea] = Object.keys(areas).indexOf(area);
        });
        var output = "<h5>Areas</h5>\n";
        output += "<p><ul>";
        Object.keys(areas).sort().forEach(function (v, i) {
            (areas[v].length == 1) ? areas[v] = "<span class='label label-success'>" + areas[v][0] + "</span>": areas[v] = "<span class='label label-important'>" + areas[v].join("</span> <span class='label label-important'>") + "</span>";
            (v.toUpperCase() !== v) || (/^[0-9\.]+$/.test(v)) ? delete areas[v]: output += "<li><span class='label' style='background-color: " + colors[i] + "'>" + v + "</span> - " + areas[v] + " <span class='label'>" + areaPopulations[v] + "</span></li>\n";
        });
        output += "</ul></p>";
        output += "\n<h5>Subareas</h5>\n";
        output += "<p><ul>";
        Object.keys(subareas).forEach(function (v, i) {
            (subareas[v].length == 1) ? subareas[v] = "<span class='label label-success'>" + subareas[v][0] + "</span>": subareas[v] = "<span class='label label-important'>" + subareas[v].join("</span> <span class='label label-important'>") + "</span>";
            (v.toUpperCase() !== v) || (/^[0-9\.]+$/.test(v)) ? delete subareas[v]: output += "<li><span class='label' style='background-color: " + colors[subareaParents[v]] + "'>" + v + "</span> - " + subareas[v] + " <span class='label'>" + subareaPopulations[v] + "</span></li>\n";
        });
        output += "</ul></p>";
        $("#areasText").html(output);
    }

    $("li.visible-desktop").after("<li class='dropdown admin'><button id='dropdown-admin' class='btn btn-lg btn-danger' data-toggle='dropdown'>Admin</button><ul class='dropdown-menu'><li><a id='territory-areas'>Territory areas</a></li><li><a id='polygon-backup'>Polygon export</a></li></ul></li><button id='areas-show' href='#territoryAreas' class='hide' data-toggle='modal'>Areas</button><button id='backup-show' href='#polygonBackup' class='hide' data-toggle='modal'>Polygons</button>");
    $("#territory-areas").click(function () {
        areaEnumerate();
        $("#areas-show").click();
    });
    $("#polygon-backup").click(function () {
      var terrUrl = "https://www.mcmxiv.com/alba/ts?mod=territories&cmd=search&kinds%5B%5D=0&kinds%5B%5D=1&kinds%5B%5D=2&q=&sort=number&order=asc", terrGeoJson = {};
      terrGeoJson.type = "FeatureCollection";
      terrGeoJson.features = [];
      $.get(terrUrl, function(res) {
        if (res.data.borders) {
          for (border in res.data.borders) {
            var terr = res.data.borders[border];
            var terrObject = {
              "id": border,
              "type": "Feature",
              "properties": {
                "name": terr.tt,
                "num": terr.num,
                "tk": terr.tk,
              },
              "geometry": {
                "coordinates": [terr.pl.map(x => x.sort())],
                "type": "Polygon",
              },
            };
            terrGeoJson.features.push(terrObject);
          }
          if (confirm('Would you like to open a map with these polygons?')) {
              var b = "http://geojson.io/#data=data:application/json," + encodeURIComponent(JSON.stringify(terrGeoJson));
              window.open(b, '_blank')
          }
          if (confirm('Would you like to download a file containing these polygons?')) {
              var a = document.createElement('a');
              a.download = (new Date()).toISOString().split('T')[0] + '-geojson-polygons.json';
              a.href = "data:text/plain;charset=UTF-8," + encodeURIComponent(JSON.stringify(terrGeoJson, null, 2));
              a.textContent = 'Download JSON';
              a.id = "polygonDownload";
              document.body.appendChild(a);
              $("#polygonDownload").addClass("hide");
              $("#polygonDownload")[0].click();
          }
        }
      });
    });
}
