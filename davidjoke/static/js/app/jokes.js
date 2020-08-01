var dataJokes = {"jokes": {}, "categories": {}};
var focusedJokeId = 0;

// Récupération des blagues
$.ajax({
	url : url_host + "/api/jokes",
	type : 'GET',
	dataType : 'json',
	success : function (res, statut){
		var jokes = {};
		var cats = {};
		for (var i = 0; i < res.data.joke.length; i++) {
			var jid = res.data.joke[i].joke_id;
			jokes[jid] = res.data.joke[i];
		}
		for (var i = 0; i < res.data.category.length; i++) {
			var cid = res.data.category[i].category_id;
			cats[cid] = res.data.category[i];
		}
		dataJokes["jokes"] = jokes;
		dataJokes["categories"] = cats;
		$("#fondu-noir").hide();
	},
	error : function (res, statut, erreur){
		alert("Problème de connexion ou du serveur");
	},
	complete : function (res, statut){
		
	}
});

// Lorsqu'on clique un row de la liste des blagues
$("tr[data-toggle='modal']").on('click', function(){
    var id = $(this).attr("joke-id");
    var dataJ = dataJokes["jokes"][id];
	focusedJokeId = id;

	// Modification de la fenêtre modal
	// Enlever le style de la validation
	$("#modalJoke form").removeClass("was-validated");

    // Titre
    var textTitle = "Blague n°" + dataJ.joke_id;
    $("#modalJoke .modal-title").text(textTitle);

    // Information de la création
    var textDateCr = dataJ.joke_date_creation;
    var textUser = dataJ.joke_user;
    var htmlInfo = "Ajouté par <strong>" + textUser + "</strong> le " + textDateCr;
    $("#modalJoke .info-creation").html(htmlInfo);

    // Date de dernière modification
    var textDateLastModif = "Dernière modification : " + dataJ.joke_date_last_modification;
    $("#modalJoke .date-last-modification").text(textDateLastModif);

    // Blague active
    if (dataJ.joke_enabled) {
    	$("#modalJoke form input#joke_enabled").prop("checked", true);
    }
    else {
    	$("#modalJoke form input#joke_enabled").prop("checked", false);
	}
	if (!dataJ.joke_editable){
		$("#modalJoke form input#joke_enabled").attr("disabled", "disabled");
	}
	else{
		$("#modalJoke form input#joke_enabled").removeAttr("disabled");
	}

    // Catégorie
    var htmlCategories = '';
    for (var cat_id in dataJokes["categories"]) {
    	var cat_text = dataJokes["categories"][cat_id]["category_text"];
    	var selected = cat_id == dataJ.joke_category_id ? "selected" : "";
    	var htmlOption = '<option value="'+cat_id+'" '+selected+'>'+cat_text+'</option>';
    	htmlCategories += htmlOption;
    }
	$("#modalJoke select#category_id").html(htmlCategories);
	if (!dataJ.joke_editable){
		$("#modalJoke select#category_id").attr("disabled", "disabled");
	}
	else{
		$("#modalJoke select#category_id").removeAttr("disabled");
	}

    // Texte de la blague
	$("#modalJoke textarea#joke_text").val(dataJ.joke_text);
	if (!dataJ.joke_editable){
		$("#modalJoke textarea#joke_text").attr("disabled", "disabled");
	}
	else{
		$("#modalJoke textarea#joke_text").removeAttr("disabled");
	}

	// Bouton Sauvegarder
	if (dataJ.joke_editable) {
		$("button#btnSaveJoke").removeClass("d-none");
	}
	else{
		$("button#btnSaveJoke").addClass("d-none");
	}
});

// Lorsqu'on appuie sur le bouton d'apparition du modal Ajout de blague
$("button#btnShowAddJoke").on('click', function(){
	$("form#formAddJoke").removeClass("was-validated");
});

// Lorsqu'on appuie sur le bouton Ajouter une blague (submit)
$("button#btnAddJokePost").on('click', function(){
	// Validation
	var textareaValue = $("form#formAddJoke textarea#add_joke_text").val();
	if (textareaValue.trim() == "") {
		$("form#formAddJoke textarea#add_joke_text").val("");
		$("form#formAddJoke").addClass("was-validated");
	}
	else {
		$("form#formAddJoke").submit();
	}
});

// Lorsqu'on appuie sur le bouton Sauvegarder (pour l'update de la blague)
$("button#btnSaveJoke").on('click', function(){
	var dataP = {};
	dataP["joke_enabled"] = $("#modalJoke form [name='joke_enabled']").prop("checked");
	dataP["joke_category_id"] = $("#modalJoke form [name='category_id']").val();
	dataP["joke_text"] = $("#modalJoke form textarea#joke_text").val();
	dataP["joke_id"] = focusedJokeId;

	// Validation
	if (dataP["joke_text"].trim() == "") {
		$("#modalJoke form textarea#joke_text").val("");
		$("#modalJoke form").addClass("was-validated");
	}
	else{
		$(this).attr("disabled", "");
		var spanBtnLoading = '<span class="spinner-border spinner-border-sm"></span>';
		var textBtn = $(this).text();
		$(this).html(textBtn + ' ' + spanBtnLoading);
		var $btn = $(this);

		$.ajax({
			url : url_host + "/api/save-joke",
			type : 'POST',
			dataType : 'json',
			data : dataP,
			success : function (res, statut){
				if (res.success) {
					dataJokes["jokes"][focusedJokeId].joke_date_last_modification = res.data.date_last_modification;
					dataJokes["jokes"][focusedJokeId].joke_enabled = dataP["joke_enabled"];
					var cat_text = dataJokes["categories"][dataP["joke_category_id"]].category_text;
					dataJokes["jokes"][focusedJokeId].joke_category = cat_text;
					dataJokes["jokes"][focusedJokeId].joke_category_id = dataP["joke_category_id"];
					dataJokes["jokes"][focusedJokeId].joke_text = dataP["joke_text"];
					$("tr[joke-id='"+dataP["joke_id"]+"'] .tr_cat_text").text(cat_text);
					$("tr[joke-id='"+dataP["joke_id"]+"'] .tr_joke_text").text(dataP["joke_text"]);
					if (dataP["joke_enabled"]) {
						$("tr[joke-id='"+dataP["joke_id"]+"']").removeClass("bg-danger");
					}
					else{
						$("tr[joke-id='"+dataP["joke_id"]+"']").addClass("bg-danger");
					}
					$("#modalJoke").modal("hide");
				}
			},
			error : function (res, statut, erreur){
				alert("Problème de connexion ou du serveur. Sauvegarde annulée.");
			},
			complete : function (res, statut){
				$btn.html(textBtn);
				$btn.removeAttr("disabled");
			}
		});
	}
});