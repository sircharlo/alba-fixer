var colors = ["#b71c1c", "#880e4f", "#4a148c", "#0d47a1", "#006064", "#1b5e20", "#827717", "#ff6f00", "#212121", "#b71c1c", "#880e4f", "#4a148c", "#0d47a1", "#006064", "#1b5e20", "#827717", "#ff6f00", "#212121"];

Chart.defaults.global.animation.duartion = 10;
Chart.defaults.global.devicePixelRatio = 10;
/*Chart.defaults.global.legend.labels.generateLabels = function(chart) {
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
                }*/

$("ul.pull-right li.dropdown").last().find("a").first().find(".muted").hide(); // hide congregation name from interface
var userName = $("ul.pull-right li.dropdown").last().find("a").first().find("span span").first().text().trim();
var bingAPIKey = "AnLVuIekXyEvbagcmNli9pgb0bC6rBSbLoiIwqpG4YzxhnZII44HkTMwFN8bPEpI";
var mapquestAPIKey = "cWthMOAPfdye1t02NcpkzD30NVLfhNy6";
/*if (userName.includes("Olivier") || userName.includes("Grant")) { // allow admin menus
    var adminState = true;
} else {
    var adminState = false;
}*/
var adminState = true; // everyone is an admin now!

$("ul.nav:not(.pull-right) > li").each(function () {
    $(this).find("span").text($(this).find("span").text().replace(String.fromCharCode(160) + String.fromCharCode(160) + "Users", "").replace(String.fromCharCode(160) + String.fromCharCode(160) + "Account", ""));
});

function injectScript(content, id, tag) {
    $("script#" + id).remove();
    var node = document.getElementsByTagName(tag)[0];
    var script = document.createElement('script');
    script.setAttribute('type', 'text/javascript');
    script.innerHTML = content;
    script.id = id;
    node.appendChild(script);
}

function setTextColorByLuma(rgb) {
    var c = rgb.substring(1); // strip #
    rgb = parseInt(c, 16); // convert rrggbb to decimal
    var r = (rgb >> 16) & 0xff; // extract red
    var g = (rgb >> 8) & 0xff; // extract green
    var b = (rgb >> 0) & 0xff; // extract blue

    var luma = 0.2126 * r + 0.7152 * g + 0.0722 * b; // per ITU-R BT.709
    var output = "";
    if (luma < 140) {
        output = "#ffffff";
    } else(
        output = "#000000"
    );
    return output;
}

function rgb2hex(rgb) {
    rgb = rgb.match(/^rgba?[\s+]?\([\s+]?(\d+)[\s+]?,[\s+]?(\d+)[\s+]?,[\s+]?(\d+)[\s+]?/i);
    return (rgb && rgb.length === 4) ? ("0" + parseInt(rgb[1], 10).toString(16)).slice(-2) +
        ("0" + parseInt(rgb[2], 10).toString(16)).slice(-2) +
        ("0" + parseInt(rgb[3], 10).toString(16)).slice(-2) : '';
}

function copyToClipboard(text) {
    if (window.clipboardData && window.clipboardData.setData) {
        return window.clipboardData.setData("Text", text);

    } else if (document.queryCommandSupported && document.queryCommandSupported("copy")) {
        var textarea = document.createElement("textarea");
        textarea.textContent = text;
        textarea.style.position = "fixed";
        document.body.appendChild(textarea);
        textarea.select();
        try {
            return document.execCommand("copy");
        } catch (ex) {
            console.warn("Copy to clipboard failed.", ex);
            return false;
        } finally {
            document.body.removeChild(textarea);
        }
    }
}

function orphanText(element) {
  return element.contents().filter(function () {
      return this.nodeType === 3;
  }).text().trim();
}

function isOdd(num) {
  return num % 2;
}
