import {initializeViewSetups} from "../MultiviewControl/initializeViewSetups.js";
export function readCSV(view,plotData,callback){

	var filename = view.dataFilename;
	view.data = [];
	d3.csv(filename, function (d) {
		d.forEach(function (d,i) {
			var n = +d.rho;

			if (n >1e-3){
				var temp = {
						x: +d.x,
						y: +d.y,
						z: +d.z,
						n: +d.rho,
						gamma: +d.gamma,
						epxc: +d.epxc,
						ad0p2: +d.ad0p2,
						deriv1: +d.deriv1,
						deriv2: +d.deriv2,
						selected: true
					}
			    	
				view.data.push(temp);
				plotData.push(temp);
			}
		})
	//number = number + view.data.length;
	//console.log(number);
	//console.log(view.data);
	callback(null);
	});

}


export function readCSVSpatiallyResolvedData(view,plotData,plotSetup,callback){
	view.data = [];

	if (view.spatiallyResolvedData == null || view.spatiallyResolvedData.dataFilename == null){
		console.log('no spatially resolved data loaded')
		callback(null);
	} else{
		console.log('started loading')
		var filename = view.spatiallyResolvedData.dataFilename;
		console.log(filename)
		var propertyList = plotSetup.spatiallyResolvedPropertyList;
		var density = plotSetup.pointcloudDensity;
		var densityCutoff = plotSetup.densityCutoff;
		var systemName = view.moleculeName;

		var xPlotScale = view.xPlotScale;
		var yPlotScale = view.yPlotScale;
		var zPlotScale = view.zPlotScale;

		console.log(density,densityCutoff,propertyList)
		

		d3.csv(filename, function (error,d) {
			if (error && error.target.status === 404) {
				console.log(error);
				console.log("File not found");
			}
			if(d.length === 0){
				console.log("File empty")
			}
			console.log('end loading')
			d.forEach(function (d,i) {
				var n = +d[density];
				if (n >densityCutoff){
					var temp = {
							x:+d.x,
							y:+d.y,
							z:+d.z,
							xPlot: xPlotScale(+d.x),
							yPlot: yPlotScale(+d.y),
							zPlot: zPlotScale(+d.z),
							selected: true,
							name: systemName
						}
					for (var i = 0; i < propertyList.length; i++) {
					    temp[propertyList[i]] = +d[propertyList[i]];
					}


					view.data.push(temp);
					plotData.push(temp);
				}
			})
			console.log('end parsing')
			callback(null);
		});

	}

}


export function readCSVMoleculeData(view,overallMoleculeData,plotSetup,callback){

	view.systemMoleculeData = [];

	if (view.moleculeData == null || view.moleculeData.dataFilename == null){
		console.log('no molecule data loaded')
		callback(null);
	} else{

		console.log('started loading')
		var filename = view.moleculeData.dataFilename;
		console.log(filename)
		var propertyList = plotSetup.moleculePropertyList;
		var systemName = view.moleculeName;

		var xPlotScale = view.xPlotScale;
		var yPlotScale = view.yPlotScale;
		var zPlotScale = view.zPlotScale;

		

		d3.csv(filename, function (error,d) {
			if (error && error.target.status === 404) {
				console.log(error);
				console.log("File not found");
			}
			if(d.length === 0){
				console.log("File empty")
			}
			console.log('end loading')
			d.forEach(function (d,i) {

				var temp = {
							atom:d.atom,
							x:+d.x,
							y:+d.y,
							z:+d.z,
							xPlot: xPlotScale(+d.x),
							yPlot: yPlotScale(+d.y),
							zPlot: zPlotScale(+d.z),
							selected: true,
							name: systemName
						};

				for (var i = 0; i < propertyList.length; i++) {
						if (propertyList[i] != "atom"){
					    	temp[propertyList[i]] = +d[propertyList[i]];
						}
					}

				view.systemMoleculeData.push(temp);
				overallMoleculeData.push(temp);

				/*var n = +d[density];
				if (n >densityCutoff){
					var temp = {
							xPlot: xPlotScale(+d.x),
							yPlot: yPlotScale(+d.y),
							zPlot: zPlotScale(+d.z),
							selected: true,
							name: systemName
						}
					for (var i = 0; i < propertyList.length; i++) {
					    temp[propertyList[i]] = +d[propertyList[i]];
					}


					view.data.push(temp);
					plotData.push(temp);
				}*/
			})
			console.log('end parsing')
			callback(null);
		});

	}

}

export function readCSVPapaparse(view,plotData,plotSetup,callback){
	console.log('started using papa')
	var filename = view.dataFilename;
	var propertyList = plotSetup.propertyList;
	var density = plotSetup.pointcloudDensity;
	var densityCutoff = plotSetup.densityCutoff;
	var systemName = view.moleculeName;
	console.log(density,densityCutoff,propertyList)
	view.data = [];
	/*Papa.parse(filename, {
		complete: function(results) {
			console.log('successfully used papa')
			console.log(results);
			callback(null);
		}
	});*/
	$.ajax({
    	url: filename,
    	//dataType: 'json',
    	type: 'get',
    	cache: false,
    	success: function(data) {
    		console.log('loading setup');
    		Papa.parse(data, {
				complete: function(results) {
					console.log('successfully used papa')
					console.log(results);
					callback(null);
				}
			});
    	},
    	error: function(requestObject, error, errorThrown) {
            alert(error);
            alert(errorThrown);
        }
    })
	/*d3.csv(filename, function (d) {
		d.forEach(function (d,i) {
			var n = +d[density];
			if (n >densityCutoff){
				var temp = {
						n: +d[density],
						selected: true,
						name: systemName
					}
				for (var i = 0; i < propertyList.length; i++) {
				    temp[propertyList[i]] = +d[propertyList[i]];
				}


				view.data.push(temp);
				plotData.push(temp);
			}
		})
	callback(null);
	});*/

}

function getCoordinateScales(data){
	var xValue = function(d) {return d.x;}
	var yValue = function(d) {return d.y;}
	var zValue = function(d) {return d.z;}
	var xMin = d3.min(data,xValue);
	var xMax = d3.max(data,xValue);
	var yMin = d3.min(data,yValue);
	var yMax = d3.max(data,yValue);
	var zMin = d3.min(data,zValue);
	var zMax = d3.max(data,zValue);
}


function preprocessData(view){
	var data = view.data;
}







/*

export function readViewsSetup(filname,callback){
	loadJSON(function(response) {
		// Parse JSON string into object
		views = JSON.parse(response);
		console.log(response);
		console.log(views);
		initializeViewSetups(views);
		callback(null);
	});
}

function loadJSON(filename,callback) {   

	var xobj = new XMLHttpRequest();
	xobj.overrideMimeType("application/json");
	xobj.open('GET', filename, true); // Replace 'my_data' with the path to your file
	xobj.onreadystatechange = function () {
		if (xobj.readyState == 4 && xobj.status == "200") {
			// Required use of an anonymous callback as .open will NOT return a value but simply returns undefined in asynchronous mode
		callback(xobj.responseText);
		}
	};
	xobj.send(null);  
}*/