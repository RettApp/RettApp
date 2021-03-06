var currentFeature_or_Features = null;
var watchID = null;
var map, GeoMarker, activePage, geolocpoint, results, correspond, unityLabel, unityValue, agentAmount, liquidAmount, unityPerKg, patientWeight;
var database = $.ajax({type: "GET", url: "xml/database.xml", dataType: "xml", async: false}).responseXML;
if (localStorage.getItem("settings") === null) {
	var settings = {};
	settings.startdisclaimer = '0';
	settings.meddisclaimer = '0';
	settings.startup = '0';
	settings.zoomrange = '10';
	settings.poison = '112';
	settings.vibration = '0';
	settings.rescuecoordinationcenter= '112';
	localStorage.setItem("settings", JSON.stringify(settings));
};
if (localStorage.getItem("visiblemeddisclaimer") === null) {
	localStorage.setItem("visiblemeddisclaimer", '0');
} 
function initPositionMap() {
	var settings = JSON.parse(localStorage.getItem('settings'));
	var zoomrange = +settings.zoomrange;
	var mapOptions = {
		zoom: zoomrange,
		center: new google.maps.LatLng(50.0075202,8.300264),
		mapTypeId: google.maps.MapTypeId.ROADMAP,
		mapTypeControlOptions: {
			style: google.maps.MapTypeControlStyle.DROPDOWN_MENU
		},
		zoomControl: false,
	};
	map = new google.maps.Map(document.getElementById('location-01-index-map_canvas'), mapOptions);
	GeoMarker = new GeolocationMarker();
	GeoMarker.setCircleOptions({fillColor: '#808080'});
	var watchID = navigator.geolocation.watchPosition(function(pos){
		geolocpoint = new google.maps.LatLng(pos.coords.latitude, pos.coords.longitude);
		map.setCenter(geolocpoint);
		map.setZoom(zoomrange);
	}, function(msg){
		console.log(typeof msg == 'string' ? msg : "error");
	}, {
		maximumAge: 4000,
		enableHighAccuracy: true
	});
	$('#stoplocation').click(function(){
		if($('#stoplocation').prop('checked') == false){
			navigator.geolocation.clearWatch(watchID);
		}else{
			watchID = navigator.geolocation.watchPosition(function(pos){
				geolocpoint = new google.maps.LatLng(pos.coords.latitude, pos.coords.longitude);
				map.setCenter(geolocpoint);
				map.setZoom(zoomrange);
			}, function(msg){
				console.log(typeof msg == 'string' ? msg : "error");
			}, {
				maximumAge: 4000,
				enableHighAccuracy: true
			});
		}
	});
	
	google.maps.event.addListenerOnce(GeoMarker, 'position_changed', function() {
		map.setCenter(this.getPosition());
		map.fitBounds(this.getBounds());
		map.setZoom(zoomrange);
	});
	GeoMarker.setMap(map);
	showGeoJSON(geojson_leitstellen);
}
function panelAndListRefresh() {
	$('body > [data-role="panel"]').panel();
	$('body > [data-role="panel"] [data-role="listview"]').listview().listview('refresh');
	$('body > [data-role="page"] [data-role="listview"]').listview().listview('refresh');
}
function refreshSlider(refreshSliderID) {
	$(refreshSliderID).slider().slider("refresh");
}
function refreshSelectMenu(refreshSelectMenuID) {
	$(refreshSelectMenuID).selectmenu().selectmenu("refresh");
}
function changeSliderOnSettings(sliderID, sliderIDvalue) {
	$(sliderID+' [value="'+sliderIDvalue+'"]').prop("selected", true);
	$(sliderID).slider().slider("refresh");
}
function changeSelectMenuOnSettings(selectID, selectIDvalue) {
	$(selectID+' [value="'+selectIDvalue+'"]').prop("selected", true);
	$(selectID).selectmenu().selectmenu("refresh");
}
function changeSliderVisibleOnSettings(sliderID, sliderVisibleStatus) {
	$(sliderID).slider(sliderVisibleStatus);
	$(sliderID).slider("refresh");	
}
function changeSelectMenuVisibleOnSettings(selectID, selectVisibleStatus) {
	$(selectID).selectmenu(selectVisibleStatus);
	$(selectID).selectmenu("refresh");
}
function openDeviceBrowser (externalLinkToOpen){
		window.open(externalLinkToOpen, '_system', 'location=no');
}
function showGeoJSON(geojson, style){
	currentFeature_or_Features = new GeoJSON(geojson, style || null);
	if (currentFeature_or_Features.type && currentFeature_or_Features.type == "Error"){
		document.getElementById("putsomthing").value = currentFeature_or_Features.message;
		return;
	}
	if (currentFeature_or_Features.length){
		for (var i = 0; i < currentFeature_or_Features.length; i++){
			if(currentFeature_or_Features[i].length){
				for(var j = 0; j < currentFeature_or_Features[i].length; j++){
					currentFeature_or_Features[i][j].setMap(map);
					if(currentFeature_or_Features[i][j].geojsonProperties) {
						setInfoWindow(currentFeature_or_Features[i][j]);
					}
				}
			}else{
				currentFeature_or_Features[i].setMap(map);
			}
			if (currentFeature_or_Features[i].geojsonProperties) {
				setInfoWindow(currentFeature_or_Features[i]);
			}
		}
	}else{
		currentFeature_or_Features.setMap(map)
		if (currentFeature_or_Features.geojsonProperties) {
			setInfoWindow(currentFeature_or_Features);
		}
	}
}
function setInfoWindow (feature) {
	google.maps.event.addListener(feature, "click", function(event) {
		var content = "<b>Aktuelle Leitstelle:</b>";
		for (var key in this.geojsonProperties) {
			if(key != "Telefon"){
				content += "<br />"+key+": "+this.geojsonProperties[key];
			}
		}
		content += '<p><a href="tel:'+this.geojsonProperties["Telefon"]+'" class="ui-btn ui-icon-phone ui-btn-icon-left ui-corner-all">Diese Anrufen</a></p>';
		$('#location-01-map_canvas_info').html(content);
	});
}
function restoreOrder (listToOrder, listOrder, kindOfList, disableSort){
	var list = $(listToOrder);
	if (list == null) {
		return
	}
	var order = localStorage.getItem(listOrder);
	if (!order) {
		return
	}
	var IDs = order.split(",");
	var items = list.sortable("toArray", {
		attribute: "name"
	});
	var rebuild = new Array();
	console.log(items.length);
	for (var v = 0, len = items.length; v < len; v++) {
		rebuild[items[v]] = items[v];
    }
    console.log(IDs.length);
    for (var i = 0, n = IDs.length; i < n; i++) {
    	var itemID = IDs[i];
    	if (itemID in rebuild) {
    		var item = rebuild[itemID];
    		var child = list.children("[name='"+item+"']");
    		var savedOrd = list.children("[name='"+itemID+"']");
    		child.remove();
    		list.filter(":first").append(savedOrd);
    	}
    }
    switch(kindOfList) {
	    case "collapsibleset":
	    	list.collapsibleset("refresh");
	    	break;
	    case "listview":
	    	list.listview("refresh");
	    	break;
    }
    if(disableSort == true) {
	    list.sortable("disable");
    }
};
$(document).on("pagebeforecreate", "#main-01-disclaimer", function(event, ui) {
	var settings = JSON.parse(localStorage.getItem('settings'));
	if(settings.startdisclaimer == "1") {
		if(settings.startup == "1") {
			$.mobile.changePage("#main-02-index");
		} else {
			$.mobile.changePage("#main-03-startup");
		};
	};
	panelAndListRefresh();
});
$(document).on("pageshow", "#location-01-index", function() {
	initPositionMap();
});
$(document).on("pagebeforeshow", "#function-02-settings", function(event) {
	panelAndListRefresh();
	var settings = JSON.parse(localStorage.getItem('settings'));
	if(localStorage.getItem("visiblemeddisclaimer") == '0'){
		changeSliderVisibleOnSettings("#settings-meddisclaimer", "disable");
	}else{
		changeSliderVisibleOnSettings("#settings-meddisclaimer", "enable");
	}
	if(settings.position == '1'){
		changeSelectMenuVisibleOnSettings("#settings-zoomrange", "disable");
	}else{
		changeSelectMenuVisibleOnSettings("#settings-zoomrange", "enable");
	}
	changeSliderOnSettings('#settings-startdisclaimer', settings.startdisclaimer);
	changeSliderOnSettings('#settings-startup', settings.startup);
	changeSliderOnSettings('#settings-meddisclaimer', settings.meddisclaimer);
	changeSliderOnSettings('#settings-position', settings.position);
	changeSelectMenuOnSettings('#settings-zoomrange', settings.zoomrange);
	changeSelectMenuOnSettings('#settings-poison', settings.poison);
	changeSelectMenuOnSettings('#settings-rescuecoordinationcenter', settings.rescuecoordinationcenter);
});
$(document).on("pagebeforeshow", "#main-03-startup", function(event) {
	var settings = JSON.parse(localStorage.getItem('settings'));
	if(settings.startup == "1") {
		$.mobile.changePage("#main-02-index");
	};
	panelAndListRefresh();
});
$(document).on("pagebeforeshow", "#main-02-index", function(event) {
	panelAndListRefresh();
});
$(document).on("pageshow", "#main-03-startup", function(event) {
	$("#slides").slidesjs({
		width: 700,
		height: 700,
		navigation: false
	});
});
$(document).on("pagebeforeshow", function(event){
	var settings = JSON.parse(localStorage.getItem('settings'));
	if(settings.meddisclaimer == "1") {
		var obj = $('a.drugsDisclaimer');
		$.each(obj, function(){
			$(this).attr('href', '#drugs-02-index');
		})
	}else{
		var obj = $('a.drugsDisclaimer');
		$.each(obj, function(){
			$(this).attr('href', '#drugs-01-disclaimer');
		})
	}
	if(settings.startup == "1") {
		var obj = $('a.startuplink');
		$.each(obj, function(){
			$(this).attr('href', '#main-02-index');
		})
	}else{
		var obj = $('a.startuplink');
		$.each(obj, function(){
			$(this).attr('href', '#main-03-startup');
		})
	}
});
$(document).on("pagebeforeshow", function(event){
	activePage = $.mobile.activePage.attr("id");
	$('a.ui-btn-active').removeClass("ui-btn-active");
	$('[href="#'+activePage+'"]').addClass("ui-btn-active");
});
$(document).on("pageshow", function(event) {
	var settings = JSON.parse(localStorage.getItem('settings'));
	$('.getPoisonNumber').attr("href", "tel:"+settings.poison);
	$('.getRescueCoordinationCenterNumber').attr("href", "tel:"+settings.rescuecoordinationcenter);
});
$(document).on("pageshow", "#function-03-dose", function(event) {
	$("input").change(function() {
	    unityLabel = $("#unity :radio:checked").attr('label');
	    unityValue = $("#unity :radio:checked").val();
	    agentAmount = $("#agent-amount").val();
	    liquidAmount = $('#liquid-amount').val();
	    unityPerKg = $('#unity-per-kg').val();
	    patientWeight = $('#patient-weight').val();
	    
	    if(unityValue === '1'){
	        results = '<b>'+agentAmount+unityLabel+" auf "+liquidAmount+" ml</b><br>";
	        results += agentAmount*1000+'mg'+" auf "+liquidAmount+" ml<br>";
	        results += agentAmount*1000000+'µg'+" auf "+liquidAmount+" ml";
	        $('#doseResultsConditionDefinition').html(results);
	    }else if(unityValue === '1000'){
	        results = agentAmount/1000+"g"+" auf "+liquidAmount+" ml</b><br>";
	        results += '<b>'+agentAmount+unityLabel+" auf "+liquidAmount+" ml</b><br>";
	        results += agentAmount*1000+'µg'+" auf "+liquidAmount+" ml";
	        $('#doseResultsConditionDefinition').html(results);
	    }else if(unityValue === '1000000') {
	        results = agentAmount/1000000+"g auf "+liquidAmount+" ml</b><br>";
	        results += agentAmount/1000+"mg auf "+liquidAmount+" ml<br>";
	        results += '<b>'+agentAmount+unityLabel+" auf "+liquidAmount+" ml<b>";
	        $('#doseResultsConditionDefinition').html(results);
	    }
	    if(unityValue === '1'){
	        results = '<b>'+agentAmount/liquidAmount+' '+unityLabel+'/ml</b><br>';
	        results += agentAmount*1000/liquidAmount+' mg/ml<br>';
	        results += agentAmount*1000000/liquidAmount+' µg/ml';
	        $('#doseResultsCorrespondValue').html(results);
	    }else if(unityValue === '1000'){
	        results = agentAmount/1000/liquidAmount+' g/ml<br>';
	        results += '<b>'+agentAmount/liquidAmount+' '+unityLabel+'/ml</b><br>';
	        results += agentAmount*1000/liquidAmount+' µg/ml';
	        $('#doseResultsCorrespondValue').html(results);
	    }else if(unityValue === '1000000') {
	        results = agentAmount/1000000/liquidAmount+' g/ml<br>';
	        results += agentAmount/1000/liquidAmount+' mg/ml<br>';
	        results += '<b>'+agentAmount/liquidAmount+' '+unityLabel+'/ml</b>';
	        $('#doseResultsCorrespondValue').html(results);
	    }
	    if(unityValue === '1'){
	        correspond = agentAmount*1000/liquidAmount;
	        results = patientWeight*unityPerKg+' mg<br>';
	        results += patientWeight*unityPerKg/correspond+' ml bei aktueller Dosis';
	        $('#doseResultsDoseValue').html(results);
	    }else if(unityValue === '1000'){
	        correspond = agentAmount/liquidAmount;
	        results = patientWeight*unityPerKg+' mg<br>';
	        results += patientWeight*unityPerKg/correspond+' ml bei aktueller Dosis';
	        $('#doseResultsDoseValue').html(results);
	    }else if(unityValue === '1000000') {
	        correspond = agentAmount/1000/liquidAmount;
	        results = patientWeight*unityPerKg+' mg<br>';
	        results += patientWeight*unityPerKg/correspond+' ml bei aktueller Dosis';
	        $('#doseResultsDoseValue').html(results);
	    }
	});
});
$(document).on("pageshow", function(event) {
	$("#saveSettings").click(function(){
		var settings = {};
		settings.startdisclaimer = $('#settings-startdisclaimer').val();
		settings.meddisclaimer = $('#settings-meddisclaimer').val();
		settings.startup = $('#settings-startup').val();
		settings.zoomrange = $('#settings-zoomrange').val();
		settings.poison = $('#settings-poison').val();
		settings.rescuecoordinationcenter = $('#settings-rescuecoordinationcenter').val();
		localStorage.setItem("settings", JSON.stringify(settings));
		location.reload(true);
	});
	$("#setVisibleMedSetting").click(function(){
		if(localStorage.getItem("visiblemeddisclaimer") == '0'){
			localStorage.setItem("visiblemeddisclaimer", '1');
		}
	});
});
$(document).on("pagebeforeshow", "#function-02-settings-sort", function (event) {
	$("#settings-medisort").sortable({
		'containment': 'parent',
		'opacity': 0.6,
		update: function (event, ui) {
			$("#settings-medisort").listview("refresh");
			orderToSave = $("#settings-medisort").sortable("toArray", {
				attribute: "name"
			});
			console.log(orderToSave);
			localStorage.setItem("sortMedical", orderToSave);
		}
	});
	restoreOrder("#settings-medisort", "sortMedical", "listview", false);
});
$(document).on("pagebeforeshow", ".sortDrugList", function (event) {
	$(".listToSort").sortable();
	restoreOrder(".listToSort", "sortMedical", "collapsibleset", true);
	$(".listToSort").sortable("disable");
});
/*$(document).on("pagebeforeshow", "#rescuecoordinationcenter-01-index", function(event){
	$(database).find('leitstellen > region').each(function(){
		var id = $(this).attr('id');
		var name = $(this).attr('name');
		var acronym = $(this).attr('acronym');
		$('<li><a href="#'+id+'">'+name+' ('+acronym+')</a></li>').appendTo($('#listRLSRegion'));
	});
	$('#listRLSRegion').listview('refresh');
});*/
$(document).on("click", ".show-page-loading-msg", function() {
	var $this = $( this ),
		theme = $this.jqmData( "theme" ) || $.mobile.loader.prototype.options.theme,
		msgText = $this.jqmData( "msgtext" ) || $.mobile.loader.prototype.options.text,
		textVisible = $this.jqmData( "textvisible" ) || $.mobile.loader.prototype.options.textVisible,
		textonly = !!$this.jqmData( "textonly" );
		html = $this.jqmData( "html" ) || "";
	$.mobile.loading( "show", {
		text: msgText,
		textVisible: textVisible,
		theme: theme,
		textonly: textonly,
		html: html
    });
})
.on("click", ".hide-page-loading-msg", function() {
    $.mobile.loading("hide");
});