// ==UserScript==
// @name       		LeekWars AdvancedTooltips
// @version			0.2.3
// @description		Affiche une info-bulle au survol d'un lien pointant vers la page d'un poireau ou d'un rapport de combat
// @author			yLark
// @projectPage		https://github.com/yLark/LeekWars-AdvancedTooltips
// @downloadURL		https://github.com/yLark/LeekWars-AdvancedTooltips/raw/master/AdvancedTooltips.user.js
// @updateURL		https://github.com/yLark/LeekWars-AdvancedTooltips/raw/master/AdvancedTooltips.user.js
// @match      		http://leekwars.com/*
// @grant			GM_addStyle
// @grant			GM_getValue
// @grant			GM_setValue
// @require			https://code.jquery.com/jquery-2.1.1.min.js
// @require			https://raw.githubusercontent.com/websanova/mousestop/master/mousestop.min.js
// ==/UserScript==

// Ajout de la feuille de style des tooltips
GM_addStyle('\
.hover_tooltip {\
	padding: 4px;\
	box-shadow: 2px 3px 5px rgba(0, 0, 0, 0.3);\
	background-color: #EEE;\
	border: 2px solid #BBB;\
	overflow: auto;\
	position: absolute;\
	z-index: 1001;\
	font-size: 15px;\
	color: black;\
	text-align: center;\
	min-width: 300px;\
}\
.hover_basic {\
	column-count: 3;\
	-moz-column-count: 3;\
	-webkit-column-count: 3;\
}\
.hover_stats {\
	column-count: 4;\
	-moz-column-count: 4;\
	-webkit-column-count: 4;\
}\
.hover_stats, .hover_basic {\
	width: 260px;\
	white-space: nowrap;\
	margin: auto;\
	margin-top: 3px;\
	margin-bottom: 3px;\
}\
.hover_stats img, .hover_basic img {\
	width: 20px;\
	vertical-align: middle;\
	margin-right: 4px;\
	margin-bottom: 4px;\
}\
.leek-weapons {\
	display: inline-block;\
	vertical-align: top;\
}\
.leek-weapons div {\
	margin: 4px;\
	display: block;\
}\
.leek-chips {\
	display: inline-block;\
	vertical-align: top;\
	width: 190px;\
}\
.hover_tooltip .chip {\
	display: inline-block;\
	vertical-align: bottom;\
	margin: 4px;\
}\
.hover_tooltip .chip img {\
	width: 55px;\
	vertical-align: bottom;\
}\
.hover_leek, .hover_farmer_main {\
	float: left;\
	font-weight: bold;\
	font-size: 17px;\
}\
.hover_farmer, .hover_team {\
	text-align: right;\
	margin-bottom: 6px;\
}\
.hover_farmer a, .hover_farmer_main a{\
	color:#AAA;\
}\
.hover_talent {\
	color:#555;\
}\
.life {\
	color: red;\
}\
.force {\
	color: #833100;\
}\
.agility {\
	color: #0080F7;\
}\
.tp {\
	color: #FF7F01;\
}\
.mp {\
	color: #00A900;\
}\
.frequency {\
	color: #b800b6;\
}\
.cores {\
	color: #0000a2;\
}\
.widsom {\
	color: black;\
}\
/* Fight report tooltip css*/\
.hover_tooltip .report .name {\
	text-align: left;\
}\
.hover_tooltip .duration {\
	text-align: right;\
	color: #777;\
}\
.hover_tooltip .report .hover_name {\
	text-align: left;\
}\
.report .alive {\
	margin-left: 23px;\
}\
.report .dead {\
	background-image: url("http://static.leekwars.com/image/cross.png");\
	width: 15px;\
	height: 20px;\
	display: inline-block;\
	margin-right: 8px;\
	vertical-align: bottom;\
}\
.hover_tooltip .hover_money {\
	text-align: right !important;\
}\
.hover_tooltip .report {\
	margin: 0px auto 20px;\
	background: none repeat scroll 0% 0% #F8F8F8;\
	border-collapse: collapse;\
	width:100%;\
}\
.hover_tooltip .report td {\
	border: 2px solid #ddd;\
	text-align: center;\
	padding: 2px 3px;\
}\
.report th {\
	border: 2px solid #ddd;\
	padding: 4px;\
	background: white;\
	font-weight: normal;\
	color: #777;\
}\
.report .total {\
	color: #888;\
	font-style: italic;\
}\
.hover_tooltip .report .hover_fight_talent img {\
	width: 18px;\
	vertical-align: top;\
}\
.hover_tooltip .hab {\
	width: 18px;\
	height: 18px;\
	vertical-align: bottom;\
	display: inline-block;\
	background-image: url("http://static.leekwars.com/image/hab.png");\
}\
.hover_tooltip .report .bonus {\
	background-color: #0075DF;\
	color: white;\
	font-weight: bold;\
	padding: 0 4px;\
	margin-left: 10px;\
	border-radius: 3px;\
}\
.tiny_fight_link {\
	float: left;\
	opacity: 0.2;\
	margin-left: 2px;\
	margin-right: 2px;\
}\
.tiny_fight_link img {\
	width: 16px;\
}\
.team_table {\
	white-space: nowrap;\
	display: inline-block;\
	margin-left: 2px;\
	margin-right: 2px;\
}\
.hover_leeks_table th {\
	border: 2px solid #ddd;\
	padding: 4px;\
	background: white;\
	font-weight: normal;\
	color: #777;\
}\
.hover_leeks_table td {\
	border: 2px solid #ddd;\
	text-align: center;\
	background: white;\
	padding: 2px 3px;\
}\
');


// Initialisation des paramètres d'affichage des tooltips
var display_method = GM_getValue('advanced_tooltips_display_method', 'mousestop');			// Méthode d'affichage des tooltips
var delay_before_display = GM_getValue('advanced_tooltips_delay_before_display', 250);		// Délais d'affichage des tooltips
if(isNaN(delay_before_display) || delay_before_display < 0) delay_before_display = 250;		// Contrôle qu'on a bien un entier positif


// Création du div qui va accueillir tous les tooltips générés par le script
var hover_tooltip = document.createElement('div');
hover_tooltip.id = 'hover_tooltip';
document.body.appendChild(hover_tooltip);

set_event_listeners();	// Appel initial, au lancement du script

function set_event_listeners() {	// Recalcul des éléments à surveiller
	
	var $element = $('a, div.leek');	// Élément à matcher : les liens et les div de class leek
	
	$element.hover(	// Au survol de l'élément
		function() {	// hover, mouse in
			var target = match_test(this);
			if(target != null) {
				var id = 'hover_tooltip_' + target.type + target.id;
				var tooltip = document.getElementById(id);
				if(tooltip != null && tooltip.style.display != 'none')	// Si le tooltip a déjà été créé et qu'il est affiché, on stop l'animation et on l'affiche. Permet d'annuler le fadeOut si on survole le lien après avoir survolé le tooltip
					$('#' + id).stop().show().css('opacity', 1);
			}
		},
		function() {	// hover, mouse out
			var target = match_test(this);
			if(target != null)
				$('#hover_tooltip_' + target.type + target.id).stop().fadeOut('fast');	// Masque le tooltip
		}
	);
	
	if(display_method == 'mousestop') {	// Si l'utilisateur a choisi la méthode mouse stop
	
		$element.mousestop(delay_before_display,	// Affiche ou créé le tooltip que quand la souris s'arrête de bouger sur l'élément. Ça permet d'éviter des appels ajax et affichages intempestifs lors d'un survol malheureux. mousestop est un event perso en @require dans le header du script
			function() {
				var target = match_test(this);
				if(target != null)
					display_tooltip(target);
			}
		);
	}else{		// Si l'utilisateur a choisi la méthode mouse over
		var timer;
		$element.hover(
			function () {
				var target = match_test(this);
				timer = setTimeout(function () {	// On définit le timeout avec la valeur spécifiée par l'utilisateur
					if(target != null)
						display_tooltip(target);
				}, delay_before_display);
			},
			function () {
				clearTimeout(timer);	// Si on sort de l'élément avant la fin du timeout, on annule l'affichage du tooltip
			}
		);
	}
	
/* 	$element.bind('destroyed', function() {
		$('#hover_tooltip').children().hide();
	}); */
}


function match_test(self) { // Contrôle que l'élément survolé est bien susceptible d'affiche un tooltip
	if(!/menu|tabs/i.test(self.parentNode.id) && !/menu|tabs/i.test(self.parentNode.parentNode.id)){	// Exclusion des liens contenus dans le menu et dans les tabs. Évite de spammer des tooltips
		
		// Cas d'un div de class leek
		if(!isNaN(self.id) && self.id != '' && /leek/i.test(self.className))
			return {type: 'leek', id: self.id};
		
		// Cas d'un lien href vers une page leek|fight|report|farmer
		if( /^http:\/\/leekwars.com\/(leek|fight|report|farmer)\/([0-9]+)$/i.test(self.href)){
			var link_type = ((RegExp.$1 == 'fight')?'report':RegExp.$1);
			return {type: link_type, id: RegExp.$2};
		}
		
		// Cas d'un lien xlink:href vers une page leek|fight|report
		if( /^(?:http:\/\/leekwars.com)?\/(leek|fight|report)\/([0-9]+)$/i.test(self.getAttributeNS("http://www.w3.org/1999/xlink", "href"))){
			var link_type = ((RegExp.$1 == 'fight')?'report':RegExp.$1);
			return {type: link_type, id: RegExp.$2};
		}
		
		// Pages à prendre en charge dans les regex par la suite : |team|tournament
	}
}


function display_tooltip(target) {	// Créé le tooltip s'il n'a pas encore été créé. S'il a déjà été créé, l'affiche.

	var id = 'hover_tooltip_' + target.type + target.id;	// Génère l'id du tooltip
	var tooltip = document.getElementById(id);
	var document_height = Math.max(document.body.scrollHeight, document.body.offsetHeight, document.documentElement.clientHeight, document.documentElement.scrollHeight, document.documentElement.offsetHeight);	// Récupère la hauteur de la page web. source : http://stackoverflow.com/questions/1145850/how-to-get-height-of-entire-document-with-javascript
	var posX = mouse.x;
	var posY = mouse.y;
	
	if(tooltip === null) {	// Si le tooltip contenant l'info sur le leek/farmer/team n'a pas encore été créé, on le créé
		tooltip = document.createElement('div');
		tooltip.id = id;
		tooltip.className = 'hover_tooltip';
		tooltip.innerHTML = '<img src="http://static.leekwars.com/image/loader.gif" alt="" style="display:block;margin:auto;">';
		hover_tooltip.appendChild(tooltip);
		
		var url = 'http://leekwars.com/' + target.type + '/' + target.id;
		
		// Récupère le contenu de la page cible via ajax
		$.post(url, function(data) {	// Récupère la page cible du lien
			tooltip.innerHTML = null;	// Supprime le gif de chargement
			var $data = $(data);
			
			if(target.type === 'report')	fill_report(tooltip, target, $data);	// Si le lien pointe vers une page de rapport de combat, on rempli le tooltip des données du rapport
			if(target.type === 'leek')		fill_leek(tooltip, target, $data);		// Si le lien pointe vers une page de poireau, on rempli le tooltip des données poireau
			if(target.type === 'farmer')	fill_farmer(tooltip, target, $data);	// Si le lien pointe vers une page d'éleveur, on rempli le tooltip des données de l'éleveur
			if(target.type === 'team')		fill_team(tooltip, target, $data);		// Si le lien pointe vers une page de team, on rempli le tooltip des données team
			
			$('#hover_tooltip .tooltip').remove();						// Supprime les div de class .tooltip, qui sont inutiles et provoquent des erreurs d'affichage
			position_tooltip(tooltip, document_height, posX, posY);		// Repositionne le tooltip vu ses nouvelles dimensions
		});
		
		// Créé un handler pour garder le tooltip affiché quand il est survolé
		$('#' + id).bind('mouseover', function() {
			$(this).stop().show().css('opacity', 1);
		});
		// Créé un handler pour masquer le tooltip quand il n'est plus survolé
		$('#' + id).bind('mouseout', function() {
			$(this).stop().fadeOut('fast');
		});
	}
	
	if(tooltip.style.display != 'block') {		// Si le tooltip vient d'être initialisé, ou s'il était masqué
		tooltip.style.display = 'block';		// On l'affiche
		position_tooltip(tooltip, document_height, posX, posY);	// On place le tooltip dans la page
	}
}


// Défini la position du tooltip en fonction de sa taille et des contraintes des bordures de la page
function position_tooltip(tooltip, document_height, posX, posY) {
	//tooltip.style.left = '0px';								// On redéfini la position x à zéro pour corriger un problème d'affichage avec les rapports de combats
	posX = posX - tooltip.offsetWidth / 2;					// Calcul la nouvelle position en x
	posY = posY + 17;										// Calcul la nouvelle position en y
	if(posX < 10) posX = 10;								// Si on dépasse à gauche
	if(posX + tooltip.offsetWidth / 2 > window.innerWidth)	// Si on dépasse à droite
		posX = window.innerWidth - tooltip.offsetWidth/2;
	if(posY + tooltip.offsetHeight > document_height)		// Si on dépasse en bas de la page
		posY += -tooltip.offsetHeight - 30;
	tooltip.style.left = posX + 'px';						// On (re)défini la position x
	tooltip.style.top  = posY + 'px';						// On (re)défini la position y
}


// Suivi de la position de la souris
var mouse = {x: 0, y: 0};
document.addEventListener('mousemove', function(e) {
    mouse.x = e.pageX;
    mouse.y = e.pageY
}, false);


/* // Special jQuery event for element removal : http://stackoverflow.com/questions/2200494/jquery-trigger-event-when-an-element-is-removed-from-the-dom/10172676#10172676
(function($){
  $.event.special.destroyed = {
    remove: function(o) {
      if (o.handler) {
        o.handler()
      }
    }
  }
})(jQuery) */

///////////////////////// Suivi des modifications du DOM /////////////////////////
//////////////////////////////////////////////////////////////////////////////////

var observeDOM = (function(){	// Code copied from here: http://stackoverflow.com/questions/3219758/detect-changes-in-the-dom
	var MutationObserver = window.MutationObserver || window.WebKitMutationObserver,
		eventListenerSupported = window.addEventListener;
	
	return function(obj, callback){
		if( MutationObserver ){
			// define a new observer
			var obs = new MutationObserver(function(){
				callback();
			});
			// have the observer observe foo for changes in children
			obs.observe( obj, { childList:true, subtree:true });
		}
		else if( eventListenerSupported ){
			obj.addEventListener('DOMNodeInserted', callback, false);
			obj.addEventListener('DOMNodeRemoved', callback, false);
		}
	}
})();

// Observe a DOM element
observeDOM(document.body, function(){ 
	set_event_listeners();	// Si le DOM a changé, on relance l'écoute des évènements du script
});


///////////////////////// Création du contenu des tooltips /////////////////////////
////////////////////////////////////////////////////////////////////////////////////

// Créé le contenu du tooltip leek
function fill_leek(tooltip, target, $data) {
	
	// Si le poireau n'existe pas ou est en erreur, on supprime le div
	if($data.find('#page h1:contains("Poireau introuvable")').length != 0){
		tooltip.parentNode.removeChild(tooltip);
		return;
	}
	
	// Ajout du nom du poireau
	var leek = document.createElement('div');
	var leek_name = $data.find('#leek').find('h1').text();
	leek.innerHTML = '<a title="Défier ' + leek_name + '" href="/garden/challenge=' + target.id + '">' + leek_name + '</a>';
	leek.className = 'hover_leek';
	tooltip.appendChild(leek);
	
	// Ajout de l'éleveur
	var farmer = document.createElement('div');
	farmer.innerHTML = '<a title="Éleveur" href="' + $data.find('.leek-farmer').attr('href') + '">' + $data.find('.leek-farmer').html() + '</a>';
	farmer.className = 'hover_farmer';
	tooltip.appendChild(farmer);
	
	// Ajout du conteneur de level + talent + ratio
	var hover_basic = document.createElement('div');
	hover_basic.className = 'hover_basic';
	tooltip.appendChild(hover_basic);
	
	// Ajout du level
	var level = document.createElement('div');
	level.className = 'hover_level';
	level.innerHTML = $data.find('#leek-table').find('h2').text();
	hover_basic.appendChild(level);
	
	// Ajout du talent
	var talent = document.createElement('div');
	if($data.find("#talent").text() != '') {	// Si le poireau a un talent
		talent.innerHTML += '<img class="talent-icon" src="http://static.leekwars.com/image/talent.png">';
		talent.innerHTML += $data.find("#talent").text();
		talent.title = 'Talent';
	}else{
		talent.innerHTML += '-';
	}
	talent.className = 'hover_talent';
	hover_basic.appendChild(talent);
	
	// Ajout du ratio
	var ratio = document.createElement('div');
	ratio.innerHTML = $data.find("#tt_fights").text();
	ratio.className = 'ratio';
	hover_basic.appendChild(ratio);
	
	// Ajout des statistiques du poireau
	var stats = document.createElement('div');
	stats.className = 'hover_stats';
	stats.innerHTML += '<div>' + $data.find('#lifespan').html() + '</div>';
	stats.innerHTML += '<div>' + $data.find('#frequencyspan').html() + '</div>';
	stats.innerHTML += '<div>' + $data.find('#forcespan').html() + '</div>';
	stats.innerHTML += '<div>' + $data.find('#tpspan').html() + '</div>';
	stats.innerHTML += '<div>' + $data.find('#agilityspan').html() + '</div>';
	stats.innerHTML += '<div>' + $data.find('#mpspan').html() + '</div>';
	stats.innerHTML += '<div>' + $data.find('#widsomspan').html() + '</div>';
	stats.innerHTML += '<div>' + $data.find('#coresspan').html() + '</div>';
	stats.innerHTML = stats.innerHTML.replace(/id=/g, 'class=');
	tooltip.appendChild(stats);
	
	// Ajout des armes
	var weapons = document.createElement('div');
	weapons.innerHTML = $data.find("#leek-weapons").html().replace(/id=/g, 'old_id=');
	weapons.className = 'leek-weapons';
	tooltip.appendChild(weapons);
	
	// Ajout des puces
	var chips = document.createElement('div');
	chips.innerHTML = $data.find("#leek-chips").html().replace(/id=/g, 'old_id=');
	chips.className = 'leek-chips';
	tooltip.appendChild(chips);
}

// Créé le contenu du tooltip report
function fill_report(tooltip, target, $data) {
	
	// Si le combat n'est pas encore généré ou en erreur, on supprime le div
	if($data.find('#page h1:contains("404")').length != 0){
		tooltip.parentNode.removeChild(tooltip);
		return;
	}
	
	tooltip.innerHTML += '<a class="tiny_fight_link" href="http://leekwars.com/fight/'  + target.id + '" title="Combat"><img src="http://static.leekwars.com/image/garden.png"></a>';
	tooltip.innerHTML += '<a class="tiny_fight_link" href="http://leekwars.com/report/' + target.id + '" title="Rapport de combat"><img src="http://static.leekwars.com/image/forum.png"></a>';
	
	// S'il y a trop de poireaux, on affiche les tableaux de chaque équipe côte à côte
	if($data.find('.name').length > 10){
		$('<div class="teams_block"></div>').insertBefore( $data.find('h3').eq(0) );
		$('<div class="team_table"></div><div class="team_table"></div>').appendTo( $data.find('.teams_block') );
		$( $data.find('h3').eq(0) ).appendTo( $data.find('.team_table').eq(0) );
		$( $data.find('h3').eq(1) ).appendTo( $data.find('.team_table').eq(1) );
		$( $data.find('.report').eq(0) ).appendTo( $data.find('.team_table').eq(0) );
		$( $data.find('.report').eq(1) ).appendTo( $data.find('.team_table').eq(0) );
		$( $data.find('.report').eq(2) ).appendTo( $data.find('.team_table').eq(1) );
		$( $data.find('.report').eq(3) ).appendTo( $data.find('.team_table').eq(1) );
	}
	
	$data.find('.bar').remove();
	$data.find('#duration').addClass('duration');
	$data.find('.name').removeClass('name').addClass('hover_name');
	$data.find('.money').removeClass('money').addClass('hover_money');
	$data.find('.talent').removeClass('talent').addClass('hover_fight_talent');
	$data.find('.level').removeClass('level');
	tooltip.innerHTML += $data.find('#report-general').html().replace(/id=/g, 'old_id=');	// Nettoie les id pour ne pas avoir de conflit
}

// Créé le contenu du tooltip farmer
function fill_farmer(tooltip, target, $data) {
	// Ajout du nom de l'éleveur
	var farmer = document.createElement('div');
	var farmer_name = $data.find('#farmer').find('h1').text();
	farmer.innerHTML = '<a title="Défier ' + farmer_name + '" id="challenge_farmer">' + farmer_name + '</div>';
    $("#challenge_farmer").click(function() {
		submitForm("garden_update", [
			['challenge_farmer', target.id]
		]);
	});
	farmer.className = 'hover_farmer_main';
	tooltip.appendChild(farmer);
	
	// Ajout de l'équipe
	var team = document.createElement('div');
	team.innerHTML = '<a title="Équipe" href="' + $data.find('#team').find('a').attr('href') + '">[' + $data.find('#team').find('a').find('h2').text() + ']</a>';
	team.className = 'hover_team';
	tooltip.appendChild(team);
	
	// Ajout du conteneur de talent + ratio + nb poireaux
	var hover_basic = document.createElement('div');
	hover_basic.className = 'hover_basic';
	tooltip.appendChild(hover_basic);
	
	// Ajout du talent
	var talent = document.createElement('div');
	if($data.find("#talent").text() != '') {	// Si le poireau a un talent
		talent.innerHTML += '<img class="talent-icon" src="http://static.leekwars.com/image/talent.png">';
		talent.innerHTML += $data.find("#talent").text();
		talent.title = 'Talent';
	}else{
		talent.innerHTML += '-';
	}
	talent.className = 'hover_talent';
	hover_basic.appendChild(talent);
	
	// Ajout du ratio
	var ratio = document.createElement('div');
	ratio.innerHTML = $data.find("#tt_fights").text();
	ratio.className = 'ratio';
	hover_basic.appendChild(ratio);
    
    //Ajout du nombre de poireaux
    var leeks_count = document.createElement('div') ;
    leeks_count.innerHTML = $data.find('.leek').length + ' Poireau' + (($data.find('.leek').length>1)?'x':'');
    leeks_count.className = 'ratio';
    hover_basic.appendChild(leeks_count) ;
    
    //ajout du tableau au tooltip
    tooltip.innerHTML += '<table id="leeks_table_'+target.id+'" class="hover_leeks_table"><tbody><tr><th>Poireau</th><th>Niveau</th><th>Ratio</th>\
       <th><img src="http://static.leekwars.com/image/talent.png" alt="Talent" title="Talent"></img></th>\
       <th><img src="http://static.leekwars.com/image/icon_life.png" alt="Vie" title="Vie"></img></th>\
       <th><img src="http://static.leekwars.com/image/icon_force.png" alt="Force" title="Force"></img></th>\
       <th><img src="http://static.leekwars.com/image/icon_agility.png" alt="Agilit&eacute;" title="Agilit&eacute;"></img></th>\
       <th><img src="http://static.leekwars.com/image/icon_widsom.png" alt="Sagesse" title="Sagesse"></img></th>\
       <th><img src="http://static.leekwars.com/image/icon_frequency.png" alt="Fr&eacute;quence" title="Fr&eacute;quence"></img></th>\
       <th><img src="http://static.leekwars.com/image/icon_tp.png" alt="PT" title="PT"></img></th>\
       <th><img src="http://static.leekwars.com/image/icon_mp.png" alt="PM" title="PM"></img></th>\
       <th><img src="http://static.leekwars.com/image/icon_cores.png" alt="C&oelig;urs" title="C&oelig;urs"></img></th>\
    </tr></tbody></table>' ;
    
    // Extract des caractéristiques des leeks
    $data.find('.leek').each(function(){
        var id = $(this).attr('id');
        var id = $(this).attr('id');
        var name = /(\w+)/.exec($(this).text())[1]; //
        var level = /^Niveau ([0-9]+)$/.exec($('span.level', $(this)).first().text())[1];
        var talent = '' + $('div.talent', $(this)).first().text();
        if(talent=='') talent = '-';
        
        // Récupère les données du poireau
        $.post('http://leekwars.com/leek/' + id, function(leekdata){
            var $leekdata = $(leekdata);
            var ratio = /^Ratio : ([0-9]+\.[0-9]+)/.exec($leekdata.find("#tt_fights").text())[1];
            var life = $leekdata.find('#lifespan').text();
            var force = $leekdata.find('#forcespan').text();
            var agility = $leekdata.find('#agilityspan').text();
            var wisdom = $leekdata.find('#widsomspan').text();
            var frequency = $leekdata.find('#frequencyspan').text();
            var tp = $leekdata.find('#tpspan').text();
            var mp = $leekdata.find('#mpspan').text();
            var cores = $leekdata.find('#coresspan').text();
            
            $('#leeks_table_'+target.id+'').append($('<tr><td><a href="/leek/'+id+'">'+name+'</td>\
                <td>'+level+'</td><td>'+ratio+'</td><td>'+talent+'</td><td>'+life+'</td>\
                <td>'+force+'</td><td>'+agility+'</td><td>'+wisdom+'</td><td>'+frequency+'</td>\
                <td>'+tp+'</td><td>'+mp+'</td><td>'+cores+'</td></tr>'));
        });
    }) ;    
}

// Créé le contenu du tooltip team
function fill_team(tooltip, target, $data) {
	
}




// Insertion et gestion des paramètres d'affichage du tooltip
if(document.URL == 'http://leekwars.com/settings') {
	
	// Insertion du code html dans le DOM
	var tooltips_settings = document.createElement('div');
	tooltips_settings.id = 'advanced_tooltips_settings';
	tooltips_settings.innerHTML = '\
		<h2>AdvancedTooltips</h2><br>\
		<h3>Méthode d\'affichage des info-bulles</h3>\
		<form id="advanced_tooltips_display_method">\
			<input ' + ((display_method=='mouseover')?'checked ':' ') + 'type="radio" name="advanced_tooltips_display_method" id="advanced_tooltips_display_method_mouseover" value="mouseover"><label for="advanced_tooltips_display_method_mouseover">Au survol de l\'élément</label><br>\
			<input ' + ((display_method=='mousestop')?'checked ':' ') + 'type="radio" name="advanced_tooltips_display_method" id="advanced_tooltips_display_method_mousestop" value="mousestop"><label for="advanced_tooltips_display_method_mousestop">À l\'arrêt de la souris sur l\'élément</label>\
		</form><br>\
		<h3>Délais avant affichage (ms)</h3>\
		<input id="advanced_tooltips_delay_before_display" type="text" value="' + delay_before_display + '"></input>\
		<br><br><br>\
	';
	var settings_container = document.getElementById('settings-container');
	settings_container.insertBefore(tooltips_settings, settings_container.firstChild);
	
	// Listeners pour le suivi des modifications des paramètres
	$('input[name="advanced_tooltips_display_method"]').change(function(){
		display_method = $(this).val();
		GM_setValue('advanced_tooltips_display_method', display_method);
	});
	
	$('#advanced_tooltips_delay_before_display').change(function() {
		delay_before_display = parseInt( $(this).val() );
		GM_setValue('advanced_tooltips_delay_before_display', delay_before_display);
	});
}
