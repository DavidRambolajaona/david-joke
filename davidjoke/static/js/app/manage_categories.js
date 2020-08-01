

$("tr.row-cat").on("click", function(){
    $("#category_id").val($(this).attr("cat-id"));
    $("#category_text").val($(this).attr("cat-text"));
});