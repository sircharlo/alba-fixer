var totals = [];
$("div.container > h3").each(function () {
    totals.push($(this).html().replace(/\D/g, ''));
});

$("div.container > table").each(function (k) {
    $(this).find("tr span.badge").each(function () {
        var num = $(this).html().replace(/\D/g, '');
        var l = 1;
        if (k === 0) l = 0;
        var percent = (num / totals[l] * 100).toFixed(1) + "%";
        $(this).parent().next("td").html(percent);
        $(this).parent().next("td").next("td").find("div.progress div.bar").css("width", percent);
    });
});
