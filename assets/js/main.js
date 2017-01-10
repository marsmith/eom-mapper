//global vars
var map;
var isMobile = false;
var layerList = [];
var legendDiv;
var kmlLayer;
var layerType;

$(document).ready(function () {

	//mobile test
	if( screen.width <= 480 ) { isMobile = true;}

	map = L.map("map", {
	  minZoom: 7,
	  zoom: 7,
	  zoomControl: false,
	  center: [42.7, -76.2], 
	  layers: [ESRIoceans]
	});
/*
	var baseLayers = {
	  "Terrain": ESRIoceans,
	  "Imagery": ESRIimagery
	};
	
	var layerControl = L.control.layers(baseLayers)
	layerControl.addTo(map);
*/
	
	L.control.zoom({position:'bottomleft'}).addTo(map);

	//show mouse coordinates
	map.on('mousemove', function(evt) {
		$( ".latlng" ).html(evt.latlng.lng.toFixed(3) + ", " + evt.latlng.lat.toFixed(3));
	});
	
	//load config file
	$.ajax({
		url: 'config.xml',
		dataType: 'xml',
		success: function(xml){
			$(xml).find('layer').each(function(){
				layerList.push({label:$(this).attr('label'),visible:$(this).attr('visible'),url:$(this).attr('url')});
			});
			
			//reverse layerlist order to show newest first
			layerList.reverse(); 
			
			//load default data
			layerType = 'Streamflow'
			$('#' + layerType).toggleClass('active');
			loadData(layerType);
			
			$('#Streamflow').addClass('active');
			
			//populate NYC dropdown
			populateNYCstatus(layerList);
			
			//populate historical list
			populateHistoricalData();
		},
		error: function(data){
			console.log('Error loading XML data');
		}
	});
	
	//main dropdown listener
	$(".layerDropdown").on('click', 'li a', function(event){
		
		var $target = $( event.currentTarget );	
		var curValue = $target.closest( '.btn-group' ).find( '[data-bind="label"]' );
		
		//update dropdown with current value
		curValue.addClass('active').attr('value',$target.attr('value')).text( $target.text() ).end().children( '.dropdown-toggle' ).dropdown( 'toggle' );
		 
		var newLayerValue= JSON.parse(decodeURIComponent(curValue.attr('value')));
		
		//draw layer
		drawLayer(newLayerValue);
		
		//update legend title
		$('#legendTitle').text(newLayerValue.label);
		
		//update download links
		$("#kmlDownload").attr('href', newLayerValue.url).attr('target','_blank');
		$("#csvDownload").attr('href', newLayerValue.url.replace('kml','csv')).attr('target','_blank');
		$("#pdfDownload").attr('href', newLayerValue.url.replace('kml','pdf')).attr('target','_blank');

		return false;
	});
	
	//main layer type button listener
	$('.layerTypeButton').on('click', function() {
		//do nothing if clicked active button
		if ($(this).attr('id') == layerType) { return; }
		
		//toggle button
		$('.layerTypeButton').removeClass('active');
		$('#' + $(this).attr('id')).addClass('active');
		
		//load data
		layerType = $(this).attr('id')
		console.log(layerType);
		loadData(layerType)
	});
	

	//tooltips for navbar buttons
	$('[data-toggle="popover"]').popover({
		trigger: 'hover',
        'placement': 'bottom'
	});
	
	//close popover if clicked
	$('[data-toggle="popover"]').click(function(e) {
		$('[data-toggle="popover"]').popover('hide');
	});
	
	//force popup links to open in new window
	$('body').on('click', '.leaflet-popup-content a', function(e) {
		console.log(e,$(e).parent());
		e.target.target = '_blank';
	});
	
});

function populateHistoricalData() {
	//load config file
	$.ajax({
		url: 'historicalList.xml',
		dataType: 'xml',
		success: function(xml){
			$(xml).find('item').each(function(){
				if ($(this).attr('url')) {
					var name = $(this).attr('url').split('/eom/historical/')[1].split('.eom')[0];
					var month = name[0].toUpperCase() + name.substr(1,2);
					var shortYear = name.slice(-2);
					if (Number(shortYear)  > 50) { 
						var year = '19' + shortYear;
					}
					else {
						year = '20' + shortYear;
					}
					$("#historicalGroup ul").append('<li></i><a href="' + $(this).attr('url') + '" target="_blank"><span><i class="fa fa-download"></i></span>&nbsp;&nbsp;' + month + ' ' + year + '</a></li>');
				}
			});

		},
		error: function(data){
			console.log('Error loading XML data');
		}
	});
}

function populateNYCstatus(LayerList) {

	//loop over all layers
	$(layerList).each(function(index, value) { 
	
		//get single list of one layer type, we'll use streamflow here
		if (value.label.indexOf('Streamflow') != -1) {	
		
			//make sure to ignore seasons
			if (value.label.indexOf('Autumn') == -1 && value.label.indexOf('Winter') == -1 && value.label.indexOf('Spring') == -1 && value.label.indexOf('Summer') == -1) {	
			
				//add to dropdown
				var date = value.label.split('Streamflow ')[1].split(' ');
				$("#NYCsupplyGroup ul").append('<li></i><a href="data/' + date[1] + '/res/' + date.join('_') + '.pdf" target="_blank"><span><i class="fa fa-download"></i></span>&nbsp;&nbsp;' + date.join(' ') + '</a></li>');
			}
		}
	});
}

function loadData(layerType) {

	//clear dropdown
	$("#legendDropdown ul").html('');

	//do some seasonal stuff here
	var seasonList = ['Winter','Spring','Summer','Autumn'];
	var seasonalFlag = false;
	
	//seasonal check
	if (layerType.indexOf('Seasonal') != -1) {
		seasonalFlag = true
		layerType = layerType.split('Seasonal ')[1];
	}
	
	//update legend
	$('#legendImage').attr('src', 'assets/img/hydro_cond_' + layerType + '.png');
	
	//array for current layerType
	var curLayerList = [];
	
	//loop over all layers
	$(layerList).each(function(index, value) { 
	
		//check for seasonal
		if (seasonalFlag) {
			
			//if layer is the right layerType and is a seasonal layer
			if (value.label.indexOf(layerType) != -1 && $.inArray(value.label.split(' ')[1], seasonList) != -1) {
		
				//push filtered layers
				curLayerList.push(value);
				
				//update legend and dropdown
				$("#legendDropdown ul").append('<li><a href="#" value="' + encodeURIComponent(JSON.stringify(value)) + '">' + value.label + '</a></li>');
			}
		}
	
		//if not seasonal, get the right layer type but NOT seasonal layers
		else if (value.label.indexOf(layerType) != -1 && $.inArray(value.label.split(' ')[1], seasonList) == -1 ){

			//push filtered layers
			curLayerList.push(value);
		
			//update legend and dropdown
			$("#legendDropdown ul").append('<li><a href="#" value="' + encodeURIComponent(JSON.stringify(value)) + '">' + value.label + '</a></li>');
		}
	});
	
	//deal with most recent value
	console.log('Total of ',curLayerList.length,' layers.  Most recent is: ',curLayerList[0].label)
	$('#dropdownDefault').attr('value',encodeURIComponent(JSON.stringify(curLayerList[0])));
	$('#dropdownDefault').text(curLayerList[0].label);
	$('#legendTitle').text(curLayerList[0].label);
	
	$("#kmlDownload").attr('href', curLayerList[0].url).attr('target','_blank');
	$("#csvDownload").attr('href', curLayerList[0].url.replace('kml','csv')).attr('target','_blank');
	$("#pdfDownload").attr('href', curLayerList[0].url.replace('kml','pdf')).attr('target','_blank');
	drawLayer(curLayerList[0]);
}

function drawLayer(value) {

	//show the loader
	$('#loadingSpinner').show();

	//clear any existing features
	if (map.hasLayer(kmlLayer)) {
		map.removeLayer(kmlLayer);
	}
	
	//streamflow marker icon
	var streamflowIcon = L.icon({
		iconUrl: 'assets/img/sites_symbol.png',
		iconSize: [20, 20],
	});
	
	//groundwater default marker icon
	var groundwaterMarker = {
		radius: 8,
		fillColor: "#7800",
		color: "#000",
		weight: 1,
		opacity: 1,
		fillOpacity: 1
	};
		
	//set up layers
	if (value.label.indexOf('Groundwater') != -1) {
		var customLayer = L.geoJson(null, {
			style: function(feature) {

				//some fill logic
				var fillColor = colorLookup(feature.properties.styleUrl.split('#')[1]);
				if (fillColor == '') {
					var fill = false;
				}
				else {
					var fill = true;
				}
				
				return {
					//overwrite fill color using lookup function
					fillColor :  fillColor,
					fill: fill
				}

			},
			onEachFeature: function(feature, layer) {
				layer.bindPopup(feature.properties.description);
			},
			pointToLayer: function (feature, latlng) {
				//var circleIcon = new L.divIcon({className: 'mydivicon'});
				//return L.marker(latlng, {icon: circleIcon});
				return L.circleMarker(latlng, groundwaterMarker);
				
				//return L.MapMarker(latlng, groundwaterMarker);
			}
		});
	}	
	
	else {
	
		var customLayer = L.geoJson(null, {
			
			//overright fill color using lookup function
			style: function(feature) {
			
				var fillColor = colorLookup(feature.properties.styleUrl.split('#')[1]);
			
				return {
					fillColor :  fillColor,
					color: "#999",
					weight: 1,
					opacity: 1,
					fillOpacity: 1
				}
			},
			onEachFeature: function(feature, layer) {
				layer.bindPopup(feature.properties.description);
			},
			//for handling sites within polygon layer
			pointToLayer: function (feature, latlng) {
				return L.marker(latlng, {icon: streamflowIcon});
			}
		});
	}
	
	//add KML layer to map
	console.log(value.url);
	kmlLayer = omnivore.kml(value.url.replace('http://ny.water.usgs.gov/projects/eom/',''), null, customLayer)
	.on('ready', function() {
        $('#loadingSpinner').hide();
    }).addTo(map);
		
}

function colorLookup(value) {
	switch(value) {
		case 'Wet': return "#c2d1eb";
		case 'Normal': return '#cdcdce';
		case 'Dry': return '#f7f277';
		case 'Very Dry': return '#f04d4f';
		case '-': return '';
		case 'sites': return '#000';		
		case 'depart-8to-10': return '#841618';
		case 'depart-6to-8': return '#b52225'
		case 'depart-4to-6': return '#ed1c24';
		case 'depart-3to-4': return '#936226';
		case 'depart-2to-3': return '#ce882a';
		case 'depart-1to-2': return '#faa51a';
		case 'depart0to-1': return '#efea23';
		case 'depart0': return '#acacac';
		case 'depart0to1': return '#a9d58e';
		case 'depart1to2': return '#5bbb47';
		case 'depart2to3': return '#0e9346';
		case 'depart3to4': return '#6ecddd';
		case 'depart4to6': return '#3bbded';
		case 'depart6to8': return '#374fa2';
		case 'depart8to10': return '#8570b2';
		case 'precip0': return '#c0c0c0';
		case 'precip0.01to0.25': return '#8a5aa5';
		case 'precip0.25to0.50': return '#b5509e';
		case 'precip0.50to1.00': return '#bd2025';
		case 'precip1.00to1.50': return '#d62027';
		case 'precip1.50to2.00': return '#ed1f24';
		case 'precip2.00to3.00': return '#f68c1f';
		case 'precip3.00to4.00': return '#e5bd20';
		case 'precip4.00to5.00': return '#f5ed23';
		case 'precip5.00to7.00': return '#0f9146';
		case 'precip7.00to9.00': return '#3bb54a';
		case 'precip9.00to12.00': return '#69bd45';
		case 'precip12.00to15.00': return '#3751a3';
		case 'precip15+': return '#399ad5';
	}
}