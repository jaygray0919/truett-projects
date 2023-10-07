var map; // Leaflet Map object
var clickMarker; // Leaflet Marker object that indicates user map click events
var locationMarker; // Leaflet Marker that indicates accurate geocodes and user locations (geolocation)
var accuracyCircle; // Leaflet Marker that indicates the range of geolocation accuracy
var ssaPopup; // Leaflet Popup for SSA info
var overlays = []; // array of jquery selector strings used to manage display of overlays in the app
var activeBasemap; // the currently active basemap
var polygonColor; // the current polygon color: 'light' or 'dark'
var SOIL_LAYER_MIN_ZOOM = 13; // minimum zoom level at which soil layer is displayed on map

$(document).ready(function() {
		
	// ----- Event Handlers ------
	
	// Menu button clicks
	$('#menu-button').click(function() {
		$('#menu').toggle();
		$(this).find('span').toggleClass('hidden');
	});
	
	// Menu item clicks
	$('#menu ul li a').click(function() {
		$('#menu-button').click();
		var menuItem = $(this).attr('href');
		showOverlay(menuItem);
		return false;
	});

	// Close button clicks
	$('#close-button').click(function() {
		var activeOverlay = overlays.pop();
		
		// if closing the mapunit data overlay, hide the reference marker
		if (activeOverlay == '#mapunit-summary') {
			clickMarker.removeFrom(map);
		}
		
		$(activeOverlay).hide();
		
		if (!overlays.length) { // no more overlays, so toggle the buttons
			$(this).hide();
			$('#menu-button').show();
		}
		else { // show the next overlay
			$(overlays[overlays.length - 1]).show();
		}

	});
	
	// Geoaccuracy slider change events
	$('#geoaccuracy-slider').on('input', function() {
		$('#geoaccuracy-label').html(this.value + ' m');
	});
	
	// Geolocation wait time slider change events
	$('#geowait-slider').on('input', function() {
		$('#geowait-label').html(this.value + ' sec');
	});

	// Expandable list clicks
	$('li.expandable h2').click(function() {
		$(this).siblings('div.expandable-content').slideToggle('fast');
		$(this).find('span').toggleClass('hidden');
	});
	
	// Clicks on component summary links
	// use jquery's 'on' method here (instead of 'click') because it will attach event handlers to the <a> links that come back through ajax
	$('#comp-data').on('click', 'a.component-link', function() {
		var url = $(this).data('url');
		showComponentData(url);
		return false;
	});
	
	// Clicks on official series description links
	// use jquery's 'on' method here (instead of 'click') because it will attach event handlers to the <a> links that come back through ajax
	$('#comp-header').on('click', 'a.osd-link', function() {
		var url = $(this).attr('href');
		var height = $('#osd').css('max-height');
		var errorText = '<p style="margin:10px">Unfortunately your browser is incapable of displaying the Official Series Description here.  However you can <a target="_blank" href="' + url + '">view the OSD on the USDA-NRCS website</a>.</p>';
		$('#osd')
			.empty()
			.css('height', height)
			.html('<iframe src="' + url + '">' + errorText + '</iframe>');
		showOverlay('#osd');
		return false;
	});
	
	// Clicks on soil depth profile list items
	$('#soil-prof-menu li').click(function() {
		$('#soil-prof-menu li').removeClass('active');
		$('#soil-prof-menu li span.toggler').addClass('hidden');
		
		$(this).addClass('active');
		$(this).find('span.toggler').removeClass('hidden');
		
		var index = $(this).index();
		$('#soil-prof-images div.soil-prof-img').addClass('hidden');
		$('#soil-prof-images div.soil-prof-img').eq(index).removeClass('hidden');
	});
	
	// Clicks on soil suitability rating list items
	// use jquery's 'on' method here (instead of 'click') because it will attach event handlers to the <li> links that come back through ajax
	$('#suitability-ratings').on('click', 'li', function() {
		var url = $(this).find('a.soil-suit-link').data('url');
		$.get(url, function(data) {
			$('#soil-suit-content').html(data);
		});
		$('.soil-suit-menu li').removeClass('active');		
		$(this).addClass('active');
		return false;
	});
	
	// Clicks on help topic links
	// use jquery's 'on' method here (instead of 'click') because it will attach event handlers to the <a> links that come back through ajax
	$('.overlay, #map-canvas').on('click', 'a.help-topic', function() {
		var url = $(this).data('url');
		showHelp(url);
		return false;
	});
	
	// Clicks for removing the location marker
	$('#map-canvas').on('click', 'a.remove-geomarker-link', function() {
		map.removeLayer(locationMarker);
		if (map.hasLayer(accuracyCircle)) {
			map.removeLayer(accuracyCircle);
		}
		return false;
	});
	
	// Clicks on 'OK' and 'X' close buttons
	$('.close-x, .ok-button').click(function() {
		$(this).closest('div.message').hide();
		$('#mask').hide();
	});
	
	// Window blur or unload saves the map state
	$(window).on('blur unload', saveMapState);
	
	// Window resizing sets the height of overlays
	$(window).resize(setOverlayHeight).resize();
	
	// Validate textbox text and enable submit button
	$('input.required-value')
		// check for valid text after keystrokes
		.keyup(function(){
			if (($.trim(this.value) === '')) {
				$(this).closest('form').find('input[type="submit"]').attr('disabled', 'disabled');
			} else {
				$(this).closest('form').find('input[type="submit"]').removeAttr('disabled');
			}
		})
		// check for valid text when textbox gets focus
		.focus(function() {
			$(this).select().keyup();
		})
		// check for valid text after pasting into textbox
		.bind('paste', function() {
			var el = $(this);
			setTimeout(function() {
				$(el).keyup();
			}, 0);
		});
	
	// Geocode form submission
	$('#geocode-form').submit(function() {
		$('#close-button').click();
		geocodeLocation($('#locationText').val());
		return false;
	});
	
	// Lat/lon form submission
	$('#lat-lon-form').submit(function() {
		zoomToLatLon($('#lat-lon-text').val());
		return false;
	});
	
	// Geolocation form submission
	$('#geolocate-form').submit(function() {
		$('#close-button').click();
		getUserLocation();
		return false;
	});
	
	// ----- End Event Handlers -----
	
	// Show the splash overlay if necessary
	if (!$.cookie('no_splash')) {
		$.get('splash.html', function(data) {
			showMessage('#message', data);
			// create an event handler for the splash checkbox 
			$('#chk-nosplash').click(function() {
				// set a cookie if the user doesn't want to see the splash again
				if ($(this).is(':checked')) {
					$.cookie('no_splash', '1', {expires: 365}); // expires in one year
				} else {
					$.cookie('no_splash', null);
				}
			});
		});
	}
		
	// Reset the geocoding form
	document.getElementById('geocode-form').reset();
	
	// set the opened/closed states of the mapunit summary category headings
	if ($.cookie('mu_headings')) {
		var muHeadings = $.cookie('mu_headings').split(',');
		$.each(muHeadings, function(index, value) {
			if (parseInt(value)) {
				$('#mapunit-summary li.expandable h2').eq(index).click();
			}
		});
	}
	else {
		$('#mapunit-summary li.expandable h2:first').click();
	}
	// set the opened/closed states of the component summary category headings
	if ($.cookie('comp_headings')) {
		var compHeadings = $.cookie('comp_headings').split(',');
		$.each(compHeadings, function(index, value) {
			if (parseInt(value)) {
				$('#component-summary li.expandable h2').eq(index).click();
			}
		});
	}
	else {
		$('#component-summary li.expandable h2:first').click();
	}
	// open the help menu definitions
	$('#help-menu li.expandable h2:first').click();
		
	// Initialize the map
	initMap();

});

// Function to show an overlay
function showOverlay(overlay) {
	// hide the last element in the overlays array if there is one
	if (overlays.length) {
		$(overlays[overlays.length - 1]).hide();
	}
	// show the overlay and add it to the overlays array
	$(overlay).show();
	overlays.push(overlay);
	// toggle the buttons
	$('#menu-button').hide();
	$('#close-button').show();
}

// Function to display an infowindow with SSA data
function showSSAData(lat, lon) {
	// create the url for the ajax request				
	var url = 'get_ssa_data.php';
	url += '?lat=' + lat + '&lon=' + lon;
	// load the ssa data
	$.get(url, function(data) {
		if (data.trim().length > 0) {
			ssaPopup
				.setLatLng([lat, lon])
				.setContent(data)
				.openOn(map);
		}
		else {
			ssaPopup.removeFrom(map);
		}
	});		
}

// Function to get and display the mapunit summary data for a given lat/lon
function showMapunitData(lat, lon) {
	// create the url for the ajax request				
	var url = 'get_mapunit_data.php';
	url += '?lat=' + lat + '&lon=' + lon;
	// load the mapunit data
	$.get(url, function(data) {
		$('#mu-header').html($(data).filter('.muheader'));
		$('#comp-data').html($(data).filter('.compdata'));
		$('#mu-data').html($(data).filter('.mudata'));
		$('#survey-metadata').html($(data).filter('.surveymetadata'));
	});		
	// display the reference marker and show the overlay
	clickMarker.setLatLng([lat, lon]).addTo(map);
	showOverlay('#mapunit-summary');
}

// Function to get and display the component summary data
function showComponentData(url) {
	$('#comp-header').html('<div style="background:#fff"><img src="images/ajax-loader.gif" />Loading...</div>');
	$.get(url, function(data) {
		$('#comp-header').html($(data).filter('.compheader'));
		$('#soil-prof-images').html($(data).filter('.soilprof'));
		$('#soil-prof-menu li').first().click();  // make the 'typical profile' button active
		$('#soil-taxonomy').html($(data).filter('.soiltax'));
		$('#land-classification').html($(data).filter('.landclass'));
		$('#hyd-erosion-ratings').html($(data).filter('.hyderosratings'));
		$('#forest-prod').html($(data).filter('.forestprod'));
		$('#suitability-ratings').html($(data).filter('.suitabilityratings'));
		$('#comp-details').html($(data).filter('.compdetails'));
		$('#soil-suit-content').empty();
	});
	showOverlay('#component-summary');
}

// Function to show a help topic
function showHelp(url) {
	$('#help-content').html('<img src="images/ajax-loader.gif" /> Loading...');
	$.ajax({
		type: "GET",
		url: url,
		cache: false,
		error: function(xhr, statusText) { 
			$('#help-content').html('<p>This help topic is currently unavailable.</p>');
		},
		success: function(data) {
			$('#help-content').html(data);
		}
	});
	showOverlay('#help-topic');
}

// Function to set the max height of overlays
// Used on page load and after window resizing so that scrolling/formatting of the overlay align with the map 
function setOverlayHeight() {
	var mapHeight = $('#map-canvas').outerHeight();
	$('div.overlay').each(function() {
		var borderTop = parseFloat($(this).css('borderTopWidth'));
		var borderBottom = parseFloat($(this).css('borderBottomWidth'));
		var paddingTop = parseFloat($(this).css('paddingTop'));
		var paddingBottom = parseFloat($(this).css('paddingBottom'));
		$(this).css('max-height', mapHeight - borderTop - borderBottom - paddingTop - paddingBottom);
	});
}

// Function to show a message box on the page
function showMessage(containerId, content) {
	$('#mask').fadeIn();	
	$(containerId)
		.show()
		.find('p.msg-content')
		.html(content);
}

// Function to geocode an entered location
function geocodeLocation(text) {
    var url = 'https://nominatim.openstreetmap.org/search';
    url += '?q=' + encodeURI(text);
    // countrycodes: USA, American Samoa, Guam, Northern Mariana Islands, Puerto Rico, US Virgin Islands, Micronesia, Marshall Islands, Palau
    url += '&countrycodes=us,as,gu,mp,pr,vi,fm,mh,pw';
    url += '&format=json';
    url += '&limit=1';
    $.getJSON(url, onGeocodeResponse);
}

function onGeocodeResponse(response) {
	if (response.length) {
		var lat = parseFloat(response[0].lat);
		var lon = parseFloat(response[0].lon);
		var latLon = [lat, lon];
		var popupText = response[0].display_name;
		map.setView(latLon, 15);
		setLocationMarker(latLon, '', popupText);
	}
	else {
		showMessage('#message', 'Sorry, no results were found for that location.');
	}	
}

// Function to handle clicks on the WSS link 
// Opens a new window in WSS for the current extent
function onWssClick() {
	var bounds = map.getBounds();
	var sw = bounds.getWest() + ' ' + bounds.getSouth();
	var nw = bounds.getWest() + ' ' + bounds.getNorth();
	var ne = bounds.getEast() + ' ' + bounds.getNorth();
	var se = bounds.getEast() + ' ' + bounds.getSouth();
	var url = 'https://websoilsurvey.sc.egov.usda.gov/App/WebSoilSurvey.aspx';
	url += '?aoicoords=((' + sw + ',' + nw + ',' + ne + ',' + se + ',' + sw + '))';
	window.open(url, '_blank');
	return false;
}

// Function to zoom to an entered lat/lon
function zoomToLatLon(latLonText) {
    var vals = latLonText.split(',');
    if (vals.length < 2) {
		showMessage('#message', 'Could not identify two coordinates. Coordinates must be separated by a comma.');
		return;
	}
    var lat = parseFloat(vals[0].trim());
    var lon = parseFloat(vals[1].trim());
    if (lat <= 85 && lat >= -85 && lon <= 180 && lon >= -180) {
		var latLon = [lat, lon];
		map.setView(latLon, 16);
		var hoverText = lat + ', ' + lon;
		var popupText = 'Latitude: ' + lat + '<br />Longitude: ' + lon;
		setLocationMarker(latLon, hoverText, popupText);
		if (map.hasLayer(accuracyCircle)) {
			map.removeLayer(accuracyCircle);
		}
		$('#close-button').click();
	}
	else {
		showMessage('#message', 'You entered an invalid latitude/longitude coordinate pair. Please try again.');
	}
}

// Function to determine the user's location and zoom map there
function getUserLocation() {
	if (navigator.geolocation) {
		showMessage('#loader', 'If prompted, be sure to give your browser permission to determine your location.  Please wait...');
		var geoOptions = {
			desiredAccuracy: parseInt($('#geoaccuracy-slider').val()), // in meters
			maxWait: parseInt($('#geowait-slider').val()) * 1000,
			maximumAge: 0,
			enableHighAccuracy: true
		};
		navigator.geolocation.getAccurateCurrentPosition(onGeoSuccess, onGeoError, onGeoProgress, geoOptions);
	} else { // no browser geolocation object
		showMessage('#message', 'Sorry, your browser does not support geolocation.');
	}
}

// Function to handle successful geolocation requests
function onGeoSuccess(position) {
	$('#loader, #mask').hide();
	$('#geo-accuracy').empty();
	var lat = position.coords.latitude;
	var lon = position.coords.longitude;
	var latLon = [lat, lon];
	var accuracy = Math.round(position.coords.accuracy);
	var d = new Date();
	var dateString = d.toLocaleTimeString([], {hour: '2-digit', minute: '2-digit'});
	var hoverText = 'Your location within ' + accuracy + ' meters';
	var popupText = 'Your location was determined with an accuracy of ' + accuracy + ' meters at ' + dateString;
	accuracyCircle.setLatLng(latLon).setRadius(accuracy).addTo(map);
	var accBounds = accuracyCircle.getBounds();
	var accZoom = map.getBoundsZoom(accBounds);
	var zoom = accZoom > 17 ? 17 : accZoom;
	setLocationMarker(latLon, hoverText, popupText);
	map.setView(latLon, zoom);
	// fetch the map unit data if that setting is checked
	if ($('#on-geosuccess-query').is(':checked')) { 
		showMapunitData(lat, lon);
	}
}

// Function to handle geolocation progress
function onGeoProgress(position) {
	$('#geo-accuracy').html('Accuracy: ' + Math.round(position.coords.accuracy) + ' meters');
}

// Function to handle unsuccessful geolocation requests
function onGeoError(error) {
	console.log(error);
	var message;
	switch (error.code) {
		case 1: message = 'Your browser did not have permission to determine your location.';
			break;
		case 2: message = 'Sorry, we were unable to determine your location.';
			break;
		case 3: message = 'Sorry, the network is taking too long to determine your location.';
			break;
		default: message = 'An unknown error occurred.';
	}
	$('#loader, #mask').hide();
	showMessage('#message', message);
}

// Function to display the location marker on the map 
function setLocationMarker(latLon, hoverText, popupText) {
	var popupHtml = '<p>' + popupText + '</p>';
	popupHtml += '<p><a class="remove-geomarker-link" href="">Remove location marker</a></p>';
	locationMarker
		.setLatLng(latLon)
		.setTooltipContent(hoverText)
		.setPopupContent(popupHtml)
		.addTo(map)
		.openPopup();
}

// Function to set cookies to save the state of the app
function saveMapState() {
	// set cookies for the map center and zoom
	$.cookie('center_lat', map.getCenter().lat, {expires: 30});
	$.cookie('center_lon', map.getCenter().lng, {expires: 30});
	$.cookie('zoom', map.getZoom(), {expires: 30});
	// set cookies for the click marker position if necessary
	if (map.hasLayer(clickMarker)) { // the marker is displayed on the map
		$.cookie('click_lat', clickMarker.getLatLng().lat, {expires: 30});
		$.cookie('click_lon', clickMarker.getLatLng().lng, {expires: 30});
	}
	else {
		$.cookie('click_lat', null);
		$.cookie('click_lon', null);
	}
	// set a cookie for the state of the mapunit summary headings
	var muHeadings = [];
	$('#mapunit-summary div.expandable-content').each(function(index) {
		muHeadings[index] = $(this).css('display') == 'none' ? 0 : 1;
	});
	$.cookie('mu_headings', muHeadings.toString(), {expires: 30});
	// set a cookie for the state of the component summary headings
	var compHeadings = [];
	$('#component-summary div.expandable-content').each(function(index) {
		compHeadings[index] = $(this).css('display') == 'none' ? 0 : 1;
	});
	$.cookie('comp_headings', compHeadings.toString(), {expires: 30});
	// set a cookie for the basemap
	$.cookie('basemap', activeBasemap, {expires: 30});
	// set a cookie for the polygon color
	$.cookie('poly_color', polygonColor, {expires: 30});
}

// Function to initialize the map
function initMap() {
	
	var mapOptions = {
		zoomControl: false,
		maxZoom: 17
	};
	map = L.map('map-canvas', mapOptions);
	
	// ** MAP CONTROLS **
	
	// Create the Lat/Lon control
	L.Control.LatLonControl = L.Control.extend({
		onAdd: function(map) {
			var latLonControl = L.DomUtil.create('div', 'lat-lon');
			map.on('mousemove', function(e) {
				var lat = e.latlng.lat.toFixed(4);
				var lon = e.latlng.lng.toFixed(4);
				latLonControl.innerHTML = 'Lat: ' + lat + '<br />Lon: ' + lon;
			});
			// disable mouse clicks propagating to the map
			L.DomEvent.disableClickPropagation(latLonControl);
			return latLonControl;
		}	
	});
	map.addControl(new L.Control.LatLonControl({position: 'bottomright'}));
	
	// Create the map message
	L.Control.MapMessage = L.Control.extend({
		onAdd: function(map) {
			var mapMessage = L.DomUtil.create('div', 'map-message');
			var html = 'Currently displaying soil survey area boundaries<br />';
			html += 'Click map to view survey area metadata<br />';
			html += 'Zoom in to view and identify soil map units';
			mapMessage.innerHTML = html;
			// hide/show the message depending on the zoom level
			map.on('zoom load', function() {
				$(mapMessage).toggle(map.getZoom() < SOIL_LAYER_MIN_ZOOM);
			});
			// disable mouse clicks propagating to the map
			L.DomEvent.disableClickPropagation(mapMessage);
			return mapMessage;
		}	
	});
	map.addControl(new L.Control.MapMessage({position: 'topright'}));
	
	// Create the WSS link
	L.Control.WSSLink = L.Control.extend({
		onAdd: function(map) {
			var wssLink = L.DomUtil.create('div', 'wss-control');
			wssLink.innerHTML = '<a href="" class="wss-link" title="Create an Area of Interest (AOI) for this area in Web Soil Survey (WSS)">Link to WSS</a>';
			$(wssLink).click(onWssClick);
			// hide/show the link depending on the zoom level
			map.on('zoom load', function() {
				$(wssLink).toggle(map.getZoom() >= SOIL_LAYER_MIN_ZOOM);
			});
			// disable mouse clicks propagating to the map
			L.DomEvent.disableClickPropagation(wssLink);
			return wssLink;
		}	
	});
	map.addControl(new L.Control.WSSLink({position: 'topright'}));
	
	// Create the geolocation control
	L.Control.GeolocationControl = L.Control.extend({
		onAdd: function(map) {
			var geolocationControl = L.DomUtil.create('div', 'custom-map-control');
			$(geolocationControl)
				.attr('title', 'Zoom to my location using the current geolocation settings')
				.html('<img src="images/target.png" class="custom-control-icon"/>')
				.click(getUserLocation);
			// disable mouse clicks propagating to the map
			L.DomEvent.disableClickPropagation(geolocationControl);
			return geolocationControl;
		}	
	});
	map.addControl(new L.Control.GeolocationControl({position: 'topleft'}));
		
	// Create base layers
	// ESRI StreetMap
	var Esri_WorldStreetMap = L.esri.basemapLayer('Streets');

	// ESRI Topo
	var Esri_WorldTopoMap = L.esri.basemapLayer('Topographic');
	
	// ESRI Imagery
	var Esri_WorldImagery = L.esri.basemapLayer('Imagery');
	
	// ESRI Imagery with labels
	var Esri_StreetLabels = L.esri.basemapLayer('ImageryTransportation', {minZoom: 13});
	var Esri_PlaceLabels = L.esri.basemapLayer('ImageryLabels');
	var Esri_Imagery = L.esri.basemapLayer('Imagery');
	var Esri_WorldImageryLabels = L.layerGroup([Esri_Imagery, Esri_StreetLabels, Esri_PlaceLabels]);
	
	// Open Street Map
	var OpenStreetMap = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
		attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
	});
	
	// Stamen - Terrain
	var StamenTerrain = L.tileLayer('https://stamen-tiles-{s}.a.ssl.fastly.net/terrain/{z}/{x}/{y}{r}.{ext}', {
		attribution: 'Map tiles by <a href="http://stamen.com">Stamen Design</a>, <a href="http://creativecommons.org/licenses/by/3.0">CC BY 3.0</a> &mdash; Map data &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
		subdomains: 'abcd',
		ext: 'png'
	});

	// USGS Topo
    var USGSTopo = L.tileLayer('https://basemap.nationalmap.gov/ArcGIS/rest/services/USGSTopo/MapServer/tile/{z}/{y}/{x}', {
		attribution: '<a href="https://www.doi.gov">U.S. Department of the Interior</a> | <a href="https://www.usgs.gov">U.S. Geological Survey</a> | <a href="https://www.usgs.gov/laws/policies_notices.html">Policies</a>',
		maxNativeZoom: 16
	});
	
/*	
	// Stamen - TonerLite
	var StamenTonerLite = L.tileLayer('https://stamen-tiles-{s}.a.ssl.fastly.net/toner-lite/{z}/{x}/{y}{r}.{ext}', {
		attribution: 'Map tiles by <a href="http://stamen.com">Stamen Design</a>, <a href="http://creativecommons.org/licenses/by/3.0">CC BY 3.0</a> &mdash; Map data &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
		subdomains: 'abcd',
		ext: 'png'
	});

	// Carto Light
	var CartoLight = L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}' + (L.Browser.retina ? '@2x.png' : '.png'), {
		attribution:'&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>, &copy; <a href="https://carto.com/attributions">CARTO</a>',
		subdomains: 'abcd'
	});
	
	// Carto Dark
	var CartoDark = L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}' + (L.Browser.retina ? '@2x.png' : '.png'), {
		attribution:'&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>, &copy; <a href="https://carto.com/attributions">CARTO</a>',
		subdomains: 'abcd'
	});
*/	
         
	var basemaps = {
		'ESRI Imagery': Esri_WorldImagery,
		'ESRI Imagery With Labels': Esri_WorldImageryLabels,
		'ESRI Street': Esri_WorldStreetMap,
		'ESRI Topo': Esri_WorldTopoMap,
		'USGS Topo': USGSTopo,
		'OpenStreetMap': OpenStreetMap,
		'Stamen Terrain': StamenTerrain
		/*
		'Stamen TonerLite': StamenTonerLite,
		'Carto Light': CartoLight,
		'Carto Dark': CartoDark
		*/
	};
	
	// set the basemap 
	var startingBasemap = ($.cookie('basemap') in basemaps) ? $.cookie('basemap') : 'ESRI Imagery With Labels';
	map.addLayer(basemaps[startingBasemap]);

	// create a map pane on top of the base maps that the soil layers will go into
	map.createPane('soillayers');
	map.getPane('soillayers').style.zIndex = 201;
	
	// create the soil tile layers
	var path = window.location.pathname;
	var pathDir = path.substring(0, path.lastIndexOf('/'));
	var urlLight = '/cgi-bin/mapserv?map=/soilmap2/website' + pathDir + '/mapunit_wms.map&layers=ssurgo&layers=ssa&mode=tile&tilemode=gmap&tile={x}+{y}+{z}';
	var urlDark = urlLight + '&map.layer[ssurgo].class[0].style[0]=OUTLINECOLOR+64+64+64&map.layer[ssa].class[0].style[0]=OUTLINECOLOR+64+64+64';	
	var soilLayerLight = L.tileLayer(urlLight, {pane: 'soillayers'});
	var soilLayerDark = L.tileLayer(urlDark, {pane: 'soillayers'});
	var soilLayers = {
		'Light': soilLayerLight,
		'Dark': soilLayerDark
	};
	// add the soil layers to the map
	var startingSoilLayer = $.cookie('poly_color') ? $.cookie('poly_color') : 'Light';
	map.addLayer(soilLayers[startingSoilLayer]);
	
	// add the basemap layer control
	var basemapControl = L.control.layers(basemaps).addTo(map);
	// hack: add text to the top of the layers list
	$(basemapControl.getContainer()).find('.leaflet-control-layers-list').prepend('<label class="bold">Base Map:</label>');
	// mobile devices: create a close button for the control
	if (L.Browser.mobile) {
		var basemapControlCloserWrapper = L.DomUtil.create('div', 'center');
		basemapControlCloserWrapper.style.marginTop = '5px';
		var basemapControlCloser = L.DomUtil.create('button', 'leaflet-control-close-button', basemapControlCloserWrapper);
		basemapControlCloser.innerText = 'Close';
		L.DomEvent.on(basemapControlCloser, 'click', function(e) {
			L.DomEvent.stop(e);
			basemapControl.collapse();
		});
		$(basemapControl.getContainer()).find('.leaflet-control-layers-list').append(basemapControlCloserWrapper);
	}
	
	// create and customize the control for polygon color
	var soilLayerControl = L.control.layers(soilLayers).addTo(map);
	var soilControlEl = soilLayerControl.getContainer();
	$(soilControlEl).find('.leaflet-control-layers-list').prepend('<label class="bold">Outline Color for Map<br />Units and Survey Areas:</label>');
	// mobile devices: create a close button for the control
	if (L.Browser.mobile) {
		var soilLayerControlCloserWrapper = L.DomUtil.create('div', 'center');
		soilLayerControlCloserWrapper.style.marginTop = '5px';
		var soilLayerControlCloser = L.DomUtil.create('button', 'leaflet-control-close-button', soilLayerControlCloserWrapper);
		soilLayerControlCloser.innerText = 'Close';
		L.DomEvent.on(soilLayerControlCloser, 'click', function(e) {
			L.DomEvent.stop(e);
			soilLayerControl.collapse();
		});
		$(soilControlEl).find('.leaflet-control-layers-list').append(soilLayerControlCloserWrapper);
	}
	// create the text in the button
	$(soilControlEl).find('.leaflet-control-layers-toggle')
		.html('<label class="bold">Outline<br />Color</label>')
		.css({
			backgroundImage: 'none',
			width: 'auto',
			height: 'auto',
			textDecoration: 'none',
			color: '#666',
			textAlign: 'center',
			padding: '2px'
	});
	
	// Add a zoom control
	L.control.zoom({position: 'bottomright'}).addTo(map);
	
	// ** MAP UI LAYERS **
	
	// Init the click marker and its image
	var clickMarkerIcon = L.icon({
		iconUrl: 'images/x-marker.png',
		iconSize: [16, 16],
		iconAnchor: [8, 8]
	});
	clickMarker = L.marker([0, 0], {
		icon: clickMarkerIcon,
		interactive: false
	});
	
	// Init the accuracy circle marker
	accuracyCircle = L.circle([0, 0], {
		weight: 2,
		color: '#4da9ff',
		opacity: 0.5,
		fillColor: '#4da9ff',
		fillOpacity: 0.2,
		interactive: false
	});
	
	// Init the position marker
	locationMarker = L.marker([0, 0])
		.bindPopup(L.popup({
			maxWidth: 220
		}))
		.bindTooltip();
	
	// Init the info window for SSA data
	ssaPopup = L.popup({
		maxWidth: 220
	});
	
	// ** MAP EVENT LISTENERS **
	
	// Close the SSA popup when zooming into soil layer zoom levels
	map.on('zoom', function() {
		if (ssaPopup.isOpen() && map.getZoom() >= SOIL_LAYER_MIN_ZOOM) {
			map.closePopup(ssaPopup);
		}
	});
	
	// map click events
	map.on('click', function(e) {
		// if the menu is open, close it before responding to map click events
		if ($('#menu').is(':visible')) {
			$('#menu-button').click();
		}
		// if a menu item overlay is open, close it before responding to map click events
		else if ($('.menu-overlay').is(':visible')) {
			$('#close-button').click();
		}
		else {
			var lat = e.latlng.lat;
			var lon = e.latlng.lng;
			var zoom = map.getZoom();
			if (zoom >= SOIL_LAYER_MIN_ZOOM) { // query map units
				// if any content overlays are open, close them
				while ($('.content-overlay').is(':visible')) {
					$('#close-button').click();
				}
				showMapunitData(lat, lon);
			}
			else if (zoom >= 5) { // query SSAs
				showSSAData(lat, lon);
			}
		}
	});
	
	// right click events
	map.on('contextmenu', function(e) {
		var latLon = e.latlng;
		var zoom = map.getZoom();
		var url = 'https://' + window.location.host + window.location.pathname;
		url += '?loc=' + latLon.lat.toFixed(5) + ',' + latLon.lng.toFixed(5) + ',z' + zoom;
		var content = L.DomUtil.create('label');
		$(content).html('Share this location by pasting the link below:');
		var input = L.DomUtil.create('input');
		$(input)
			.attr({
				type: 'text',
				readonly: 'readonly'
			})
			.css('width', '280px')
			.val(url);
		$(content).append(input);
		L.popup()
			.setLatLng(latLon)
			.setContent(content)
			.openOn(map);
		$(input).select();
		document.execCommand('copy');
	});
	
	// changes in the basemap update the global vars 
	map.on('baselayerchange', function(e) {
		var layerName = e.name;
		if (layerName === 'Light' || layerName === 'Dark') { // this base layer is soil layer
			polygonColor = layerName;
		}
		else { // this is a basemap
			activeBasemap = layerName;
		}
	});

	// make the map cursor crosshair
	L.DomUtil.addClass(map._container,'crosshair-cursor-enabled');
	
	// dragging disables the crosshairs
	map.on('movestart', function() {
		L.DomUtil.removeClass(map._container,'crosshair-cursor-enabled');
	});
	
	map.on('moveend', function() {
		L.DomUtil.addClass(map._container,'crosshair-cursor-enabled');
	});
	
	// ** SET APP STATE **
	
	// Set a different initial location of the map if necessary
	if (/loc=(-?\d+\.?\d*),(-?\d+\.?\d*)/.test(window.location.search)) {  
		// the location lat/lon is in the url
		var lat = parseFloat(RegExp.$1);
		var lon = parseFloat(RegExp.$2);
		if ((lat >= -85) && (lat <= 85) && (lon >= -180) && (lon <=180)) {
			var latLon = [lat, lon];
			var hoverText = lat + ', ' + lon;
			var popupText = 'Latitude: ' + lat + '<br />Longitude: ' + lon;
			// check for a zoom level in the url
			var zoom = 16; // default zoom is level 16
			if (/z([0-9]{1,2})/.test(window.location.search)) {
				var urlZoom = parseInt(RegExp.$1);
				if (urlZoom > 0 && urlZoom <= 17) {
					zoom = urlZoom;
				}
			}
			map.setView(latLon, zoom);
			setLocationMarker(latLon, hoverText, popupText);
			// once the user interacts with the map, remove the query params
			map.once('move zoom', function() {
				window.history.pushState({}, '', window.location.pathname);
			});
		}
	}
	else if ($.cookie('center_lat') && $.cookie('center_lon')) { 
		// use saved map settings
		var lat = parseFloat($.cookie('center_lat'));
		var lon = parseFloat($.cookie('center_lon'));
		var zoom = $.cookie('zoom') ? $.cookie('zoom') : 16;
		map.setView([lat, lon], zoom);
		// set the marker position if necessary
		if ($.cookie('click_lat') && $.cookie('click_lon')) {
			showMapunitData(parseFloat($.cookie('click_lat')), parseFloat($.cookie('click_lon')));
		}
	}
	else {
		// default the map view to Davis CA
		var davis = [38.53957, -121.74564];
		map.setView(davis, 14);	
	}
}

