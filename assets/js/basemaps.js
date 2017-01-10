/* Basemap Layers */
var ESRIoceans = L.layerGroup([L.esri.basemapLayer("Oceans"), L.esri.basemapLayer("OceansLabels")]);

var USGStopoBaseMap = L.layerGroup([L.esri.tiledMapLayer("https://basemap.nationalmap.gov/arcgis/rest/services/USGSTopo/MapServer", {
	maxZoom:15,
	minZoom:0
  }), L.esri.dynamicMapLayer("https://services.nationalmap.gov/arcgis/rest/services/USGSTopoLarge/MapServer", {
	maxZoom:19,
	minZoom:16
  })
]);
var USGStopoBaseMap = L.layerGroup([L.esri.tiledMapLayer("https://basemap.nationalmap.gov/arcgis/rest/services/USGSTopo/MapServer", {
	maxZoom:15,
	minZoom:0
  }), L.esri.dynamicMapLayer("https://services.nationalmap.gov/arcgis/rest/services/USGSTopoLarge/MapServer", {
	maxZoom:19,
	minZoom:16
  })
]);

var USGSimageryTopoBaseMap = L.layerGroup([L.esri.tiledMapLayer("https://basemap.nationalmap.gov/arcgis/rest/services/USGSImageryTopo/MapServer", {
	maxZoom:15,
	minZoom:0
  }), L.esri.dynamicMapLayer("https://services.nationalmap.gov/arcgis/rest/services/USGSImageryTopoLarge/MapServer", {
	maxZoom:19,
	minZoom:16
  })
]);

var USGShydroNHDBaseMap = L.layerGroup([L.esri.tiledMapLayer("https://basemap.nationalmap.gov/arcgis/rest/services/USGSHydroNHD/MapServer", {
	maxZoom:15,
	minZoom:0
  }), L.esri.dynamicMapLayer("https://services.nationalmap.gov/arcgis/rest/services/USGSHydroNHDLarge/MapServer", {
	maxZoom:19,
	minZoom:16
  })
]);