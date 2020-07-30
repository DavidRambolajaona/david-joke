$("body").on("click", "#btn_generate_random_joke", function(e){
	$(this).attr("disabled", "");
	var spanBtnLoading = '<span class="spinner-border spinner-border-sm"></span>';
	var textBtn = $(this).text();
	$(this).html(textBtn + ' ' + spanBtnLoading);
	var $btn = $(this);
	$.ajax({
		url : url_host + "/api/joke",
		type : 'GET',
		dataType : 'json',
		success : function (res, statut){
			$("#show_random_joke_category").text(res.joke_category);
			$("#show_random_joke_text").text(res.joke_text);
		},
		error : function (res, statut, erreur){
			
		},
		complete : function (res, statut){
			$btn.html(textBtn);
			$btn.removeAttr("disabled");
		}
	});
});