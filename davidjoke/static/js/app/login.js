$("body").on("click", "#btnLogin", function(e){
    e.preventDefault();

	$(this).attr("disabled", "");
	var spanBtnLoading = '<span class="spinner-border spinner-border-sm"></span>';
	var textBtn = $(this).text();
	$(this).html(textBtn + ' ' + spanBtnLoading);
    var $btn = $(this);
    
    var dataP = {"user_name": "", "user_password": ""};
    dataP.user_name = $("#formLogin #user_name").val();
    dataP.user_password = $("#formLogin #user_password").val();

    var user_ok = false;
	$.ajax({
		url : url_host + "/api/check-login",
		type : 'POST',
        dataType : 'json',
        data: dataP,
		success : function (res, statut){
			if (res.success) {
                $("#indication").text("Nom d'utilisateur et mot de passe OK :)");
                $("#indication").css('color', 'green');
                $("#indication").removeClass("d-none");
                user_ok = true;
                $("#formLogin").submit();
            }
            else{
                $("#indication").text("Nom d'utilisateur ou mot de passe invalide ou ne correspond pas");
                $("#indication").removeClass("d-none");
            }
		},
		error : function (res, statut, erreur){
			$("#indication").text("Une erreur s'est produite. Problème de connexion ou du serveur.");
			$("#indication").removeClass("d-none");
		},
		complete : function (res, statut){
            $btn.html(textBtn);
            if (!user_ok){
                $btn.removeAttr("disabled");
            }
		}
	});
});