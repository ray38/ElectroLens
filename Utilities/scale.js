export function calcDefaultScalesSpatiallyResolvedData(plotSetup,spatiallyResolvedData){
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
	if (view.defaultScalesSpatiallyResolvedData[view.options.propertyOfInterest]['min'] != 
		view.defaultScalesSpatiallyResolvedData[view.options.propertyOfInterest]['max']) {
		view.options.pointCloudColorSettingMin = view.defaultScalesSpatiallyResolvedData[view.options.propertyOfInterest]['min'];
		view.options.pointCloudColorSettingMax = view.defaultScalesSpatiallyResolvedData[view.options.propertyOfInterest]['max'];
	}
	else {
		view.options.pointCloudColorSettingMin = view.defaultScalesSpatiallyResolvedData[view.options.propertyOfInterest]['min'] - 0.5;
		view.options.pointCloudColorSettingMax = view.defaultScalesSpatiallyResolvedData[view.options.propertyOfInterest]['max'] + 0.5;
	}
	
}


export function calcDefaultScalesMoleculeData(plotSetup,moleculeData){
	var result = {};
	var propertyList = plotSetup.moleculePropertyList;
	for (var i = 0; i < propertyList.length; i++) {
	    var property = propertyList[i];
	    if (property != "atom") {
		    var xValue = function(d) {return d[property];}
		    var xMin = d3.min(moleculeData,xValue);
			var xMax = d3.max(moleculeData,xValue);
			result[property] = {'min':xMin, 'max':xMax};
		}
	}
	return result;
}

export function adjustScaleAccordingToDefaultMoleculeData(view){
	if (view.options.moleculeSizeCodeBasis != "atom") {
		view.options.moleculeSizeSettingMin = view.defaultScalesMoleculeData[view.options.moleculeSizeCodeBasis]['min'] + (view.defaultScalesMoleculeData[view.options.moleculeSizeCodeBasis]['max']-view.defaultScalesMoleculeData[view.options.moleculeSizeCodeBasis]['min'])*0.2;
		view.options.moleculeSizeSettingMax = view.defaultScalesMoleculeData[view.options.moleculeSizeCodeBasis]['max'];
	}

	if (view.options.moleculeColorCodeBasis != "atom") {
		view.options.moleculeColorSettingMin = view.defaultScalesMoleculeData[view.options.moleculeColorCodeBasis]['min'];
		view.options.moleculeColorSettingMax = view.defaultScalesMoleculeData[view.options.moleculeColorCodeBasis]['max'];
	}
}