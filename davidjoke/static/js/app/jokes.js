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
	},
	error : function (res, statut, erreur){
		
	},
	complete : function (res, statut){
		$("#fondu-noir").hide();
	}
});

// Lorsqu'on clique un row de la liste des blagues
$("tr[data-toggle='modal']").on('click', function(){
    var id = $(this).attr("joke-id");
    var dataJ = dataJokes["jokes"][id];console.log(dataJ);
    focusedJokeId = id;

    // Modification de la fenêtre modal
    // Titre
    var textTitle = "Blague n°" + dataJ.joke_id;
    $("#modalJoke .modal-title").text(textTitle);

    // Information de la création
    var textDateCr = dataJ.joke_date_creation;
    var textUser = dataJ.joke_user;
    var htmlInfo = "Créé par <strong>" + textUser + "</strong> le " + textDateCr;
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

    // Catégorie
    var htmlCategories = '';
    for (var cat_id in dataJokes["categories"]) {
    	var cat_text = dataJokes["categories"][cat_id]["category_text"];
    	var selected = cat_id == dataJ.joke_category_id ? "selected" : "";
    	var htmlOption = '<option value="'+cat_id+'" '+selected+'>'+cat_text+'</option>';
    	htmlCategories += htmlOption;
    }
    $("#modalJoke select#category_id").html(htmlCategories);

    // Texte de la blague
    $("#modalJoke textarea#joke_text").text(dataJ.joke_text);
});


// Lorsqu'on appuie sur le bouton Ajouter une blague
$("button#btnAddJokePost").on('click', function(){
	$("form#formAddJoke").submit();
});

// Lorsqu'on appuie sur le bouton Sauvegarder (pour l'update de la blague)
$("button#btnSaveJoke").on('click', function(){
	$(this).attr("disabled", "");
	var spanBtnLoading = '<span class="spinner-border spinner-border-sm"></span>';
	var textBtn = $(this).text();
	$(this).html(textBtn + ' ' + spanBtnLoading);
	var $btn = $(this);

	var dataP = {};
	dataP["joke_enabled"] = $("#modalJoke form [name='joke_enabled']").val();
	dataP["joke_category_id"] = $("#modalJoke form [name='category_id']").val();
	dataP["joke_text"] = $("#modalJoke form [name='joke_text']").val();

	$.ajax({
		url : url_host + "/api/save-joke",
		type : 'POST',
		dataType : 'json',
		data : dataP,
		success : function (res, statut){
			dataJokes["jokes"][focusedJokeId].joke_date_last_modification = "";
			dataJokes["jokes"][focusedJokeId].joke_enabled = dataP["joke_enabled"] == "on" ? true : false;
			dataJokes["jokes"][focusedJokeId].joke_category_id = dataP["joke_category_id"];
			dataJokes["jokes"][focusedJokeId].joke_text = dataP["joke_text"];
			$("#modalJoke").modal("hide");
		},
		error : function (res, statut, erreur){
			
		},
		complete : function (res, statut){
			$btn.html(textBtn);
			$btn.removeAttr("disabled");
		}
	});
});