export function calcDefaultColorScalesSpatiallyResolvedData(plotSetup,spatiallyResolvedData){
	var result = {};
	var propertyList = plotSetup.spatiallyResolvedPropertyList;
	for (var i = 0; i < propertyList.length; i++) {
	    var property = propertyList[i];
	    var xValue = function(d) {return d[property];}
	    var xMin = d3.min(spatiallyResolvedData,xValue);
		var xMax = d3.max(spatiallyResolvedData,xValue);
		result[property] = {'min':xMin, 'max':xMax};
	}
	return result;
}

export function adjustColorScaleAccordingToDefaultSpatiallyResolvedData(view){
	view.options.pointCloudColorSettingMin = view.defaultColorScalesSpatiallyResolvedData[view.options.propertyOfInterest]['min'];
	view.options.pointCloudColorSettingMax = view.defaultColorScalesSpatiallyResolvedData[view.options.propertyOfInterest]['max'];
}