export function calcDefaultColorScales(plotSetup,unfilteredData){
	var result = {};
	var propertyList = plotSetup.propertyList;
	for (var i = 0; i < propertyList.length; i++) {
	    var property = propertyList[i];
	    var xValue = function(d) {return d[property];}
	    var xMin = d3.min(unfilteredData,xValue);
		var xMax = d3.max(unfilteredData,xValue);
		result[property] = {'min':xMin, 'max':xMax};
	}
	return result;
}