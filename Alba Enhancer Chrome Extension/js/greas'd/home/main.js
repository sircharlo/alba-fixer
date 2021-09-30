//var totals = [];
$("div.container > h3").each(function() {
  let total = $(this).html().replace(/\D/g, "");
  console.log(total, $(this).next());
  let table = $(this).next();
  table.find("tr span.badge").each(function() {
    let num = $(this).html().replace(/\D/g, "");
	console.log(num)
  })
})

  $(this).find("tr span.badge").each(function() {
    var num = $(this).html().replace(/\D/g, ""),
      l = 1;
    0 === k && (l = 0);
    var percent = (num / totals[l] * 100).toFixed(1) + "%";
    $(this).parent().next("td").html(percent), $(this).parent().next("td").next("td").find("div.progress div.bar").css("width", percent)
  })
