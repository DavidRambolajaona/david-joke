// Variables Jquery
var $user_name = $("#user_name");
var $user_password = $("#user_password");
var $user_password_second = $("#user_password_second");
var $user_email = $("#user_email");

// Lorsqu'on appuie sur le bouton d'inscription
$("button#btnRegister").on("click", function(e){
    e.preventDefault();

    $("#indicationNomValidation").text("Le nom ne doit pas être vide");

    var c_name=false, c_mdp=false, c_mdp_conf=false, c_email=false;

    // Nom
    $user_name.val($user_name.val().trim());
    if ($user_name.val().trim() == "") {
        $user_name.addClass("is-invalid");
        $user_name.removeClass("is-valid");
    }
    else{
        c_name = true;
        $user_name.addClass("is-valid");
        $user_name.removeClass("is-invalid");
    }

    // Mot de passe
    if ($user_password.val() == "") {
        $user_password.addClass("is-invalid");
        $user_password.removeClass("is-valid");
    }
    else{
        c_mdp = true;
        $user_password.addClass("is-valid");
        $user_password.removeClass("is-invalid");
    }

    // Mot de passe confirmation
    if ($user_password_second.val() != $user_password.val() || $user_password_second.val() == ""){
        $user_password_second.addClass("is-invalid");
        $user_password_second.removeClass("is-valid");
    }
    else{
        c_mdp_conf = true;
        $user_password_second.addClass("is-valid");
        $user_password_second.removeClass("is-invalid");
    }

    // Email
    $user_email.val($user_email.val().trim());
    if ($user_email.val().trim() != ""){
        var regex = new RegExp($user_email.attr("pattern"));
        if (!regex.test($user_email.val())){
            $user_email.addClass("is-invalid");
            $user_email.removeClass("is-valid");
        }
        else{
            c_email = true;
            $user_email.addClass("is-valid");
            $user_email.removeClass("is-invalid");
        }
    }
    else{
        c_email = true;
    }

    // Check si nom d'utilisateur déjà pris
    if (c_name && c_mdp && c_mdp_conf && c_email) {
        $(this).attr("disabled", "");
        var spanBtnLoading = '<span class="spinner-border spinner-border-sm"></span>';
        var textBtn = $(this).text();
        $(this).html(textBtn + ' ' + spanBtnLoading);
        var $btn = $(this);

        var user_ok = false;
        var dataP = {};
        dataP["user_name"] = $user_name.val().trim();

        $.ajax({
            url : url_host + "/api/check-name-user",
            type : 'POST',
            dataType : 'json',
            data: dataP,
            success : function (res, statut){
                if (res.success) {
                    $("#indicationNomValidation").text("Ce nom a déjà été pris");
                    $user_name.addClass("is-invalid");
                }
                else {
                    user_ok = true;
                    $("form").submit();
                }
            },
            error : function (res, statut, erreur){
                alert("Problème de connexion ou du serveur");
            },
            complete : function (res, statut){
                $btn.html(textBtn);
                if (!user_ok){
                    $btn.removeAttr("disabled");
                }
            }
        });
    }
});

// Lorsque le nom change de valeur
$user_name.on("change paste keyup", function(){
    $(this).removeClass("is-valid");
    $(this).removeClass("is-invalid");
    $("#indicationNomValidation").text("Le nom ne doit pas être vide");
    if ($(this).val().trim() == "") {
        $(this).addClass("is-invalid");
    }
});

// Lorsque le mot de passe change de valeur
$user_password.on("change paste keyup", function(){
    $(this).removeClass("is-valid");
    $(this).removeClass("is-invalid");
    if ($(this).val() == "") {
        $(this).addClass("is-invalid");
    }

    $user_password_second.removeClass("is-valid");
    $user_password_second.removeClass("is-invalid");
    if ($user_password_second.val() != $user_password.val() && $user_password_second.val() != ""){
        $user_password_second.addClass("is-invalid");
        $user_password_second.removeClass("is-valid");
    }
});

// Lorsque le mot de passe de confirmation change de valeur
$user_password_second.on("change paste keyup", function(){
    if ($user_password_second.val() != $user_password.val() || $user_password_second.val() == ""){
        $(this).addClass("is-invalid");
        $(this).removeClass("is-valid");
    }
    else{
        $(this).addClass("is-valid");
        $(this).removeClass("is-invalid");
    }
});

// Lorsque l'email change de valeur
$user_email.on("change paste keyup", function(){
    $(this).removeClass("is-valid");
    $(this).removeClass("is-invalid");
});