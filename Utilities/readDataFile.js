// var Papa = require('papaparse');
// const fs = require('fs');
const fs = window.require('fs');
// const remote = require('electron').remote;
// const electronFs = remote.require('fs');
const path = require('path');
const csv = require('fast-csv');




export function processSpatiallyResolvedData(view,overallSpatiallyResolvedData,plotSetup,callback){
	view.systemSpatiallyResolvedData = [];
	console.log('started processing data');
	if (view.frameBool && !(plotSetup.spatiallyResolvedPropertyList.includes(plotSetup.frameProperty))){
		alert("The frame property Not in spatiallyResolvedPropertyList");
	}
	var d = view.spatiallyResolvedData.data;
	var propertyList = plotSetup.spatiallyResolvedPropertyList;
	var density = plotSetup.pointcloudDensity;
	var densityCutoffLow = plotSetup.densityCutoffLow;
	var densityCutoffUp = plotSetup.densityCutoffUp;
	var systemName = view.moleculeName;

	d.forEach(function (d,i) {
		var n = +d[density];
		if (n > densityCutoffLow && n < densityCutoffUp){
			var temp = {
					x:+d.x,
					y:+d.y,
					z:+d.z,
					selected: true,
					highlighted: false,
					name: systemName
				}
			for (var i = 0; i < propertyList.length; i++) {
			    temp[propertyList[i]] = +d[propertyList[i]];
			}

			if (view.frameBool){
				var currentFrame = (+d[plotSetup.frameProperty]).toString();
			}
			else{
				temp["__frame__"] = 1;
				var currentFrame = (1).toString();
			}

			!(currentFrame in view.systemSpatiallyResolvedDataFramed) && (view.systemSpatiallyResolvedDataFramed[currentFrame] = []);

			view.systemSpatiallyResolvedData.push(temp);
			view.systemSpatiallyResolvedDataFramed[currentFrame].push(temp);
			// overallSpatiallyResolvedData.push(temp);

		}
	})
	console.log('end processing data')
	callback(null);
}

export function processMoleculeData(view,plotSetup,callback){
	view.systemMoleculeData = [];
	view.systemMoleculeDataFramed = {};
	console.log('started processing molecule data')
	if (view.frameBool && !(plotSetup.moleculePropertyList.includes(plotSetup.frameProperty))){
		alert("The frame property Not in moleculePropertyList");
	}
	var d = view.moleculeData.data;
	var propertyList = plotSetup.moleculePropertyList;
	var systemName = view.moleculeName;

	
	d.forEach(function (d,i) {

		var temp = {
					atom:d.atom.trim(),
					x:+d.x,
					y:+d.y,
					z:+d.z,
					selected: true,
					highlighted: false,
					name: systemName
				};

		for (var i = 0; i < propertyList.length; i++) {
				if (propertyList[i] != "atom"){
			    	temp[propertyList[i]] = +d[propertyList[i]];
				}
			}

		if (view.frameBool){
			var currentFrame = (+d[plotSetup.frameProperty]).toString();
		}
		else{
			temp["__frame__"] = 1;
			var currentFrame = (1).toString();
		}

		!(currentFrame in view.systemMoleculeDataFramed) && (view.systemMoleculeDataFramed[currentFrame] = []);

		view.systemMoleculeData.push(temp);
		view.systemMoleculeDataFramed[currentFrame].push(temp);

	})
	console.log('end processing molecule data');
	callback(null);
}

export function readCSVSpatiallyResolvedData(view,plotSetup,callback){
	view.systemSpatiallyResolvedData = [];
	view.systemSpatiallyResolvedDataFramed = {};

	if (view.spatiallyResolvedData == null || view.spatiallyResolvedData.dataFilename == null){
		console.log('no spatially resolved data loaded')
		callback(null);
	} else{
		if (view.frameBool && !(plotSetup.spatiallyResolvedPropertyList.includes(plotSetup.frameProperty))){
			alert("The frame property Not in spatiallyResolvedPropertyList");
		}
		console.log('started loading')
		var filename = view.spatiallyResolvedData.dataFilename;
		console.log(filename)
		var propertyList = plotSetup.spatiallyResolvedPropertyList;
		var density = plotSetup.pointcloudDensity;
		var densityCutoffLow = plotSetup.densityCutoffLow;
		var densityCutoffUp = plotSetup.densityCutoffUp;
		var systemName = view.moleculeName;


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
				if (n > densityCutoffLow && n < densityCutoffUp){
					var temp = {
							x:+d.x,
							y:+d.y,
							z:+d.z,
							selected: true,
							highlighted: false,
							name: systemName
						}
					for (var i = 0; i < propertyList.length; i++) {
					    temp[propertyList[i]] = +d[propertyList[i]];
					}

					if (view.frameBool){
						var currentFrame = (+d[plotSetup.frameProperty]).toString();
					}
					else{
						temp["__frame__"] = 1;
						var currentFrame = (1).toString();
					}

					!(currentFrame in view.systemSpatiallyResolvedDataFramed) && (view.systemSpatiallyResolvedDataFramed[currentFrame] = []);

					view.systemSpatiallyResolvedData.push(temp);
					view.systemSpatiallyResolvedDataFramed[currentFrame].push(temp);

				}
			})
			console.log('end parsing')
			callback(null);
		});
	}
}

export function readCSVSpatiallyResolvedDataPapaparse(view,plotSetup,callback){
	view.systemSpatiallyResolvedData = [];
	view.systemSpatiallyResolvedDataFramed = {};

	if (view.spatiallyResolvedData == null || view.spatiallyResolvedData.dataFilename == null){
		console.log('no spatially resolved data loaded')
		callback(null);
	} else{
		if (view.frameBool && !(plotSetup.spatiallyResolvedPropertyList.includes(plotSetup.frameProperty))){
			alert("The frame property Not in spatiallyResolvedPropertyList");
		}
		console.log('started loading')
		var filename = view.spatiallyResolvedData.dataFilename;
		var propertyList = plotSetup.spatiallyResolvedPropertyList;
		var density = plotSetup.pointcloudDensity;
		var densityCutoffLow = plotSetup.densityCutoffLow;
		var densityCutoffUp = plotSetup.densityCutoffUp;
		var systemName = view.moleculeName;

		var count = 0;
		var d, n, currentFrame;
		Papa.parse(filename, {
			header: true,
			download: true,
			/*step: function(results){
				count = count + 1;
				console.log('finished count: ', count, results.data);
			},*/
			chunk: function(chunk) {
				console.log('loading chunk');
				/*for (var ii = 0; ii < chunk.length; ii++) {
					d = chunck.data[ii];
					n = +d[density];
					if (n > densityCutoffLow && n < densityCutoffUp){
						var temp = {
								x:+d.x,
								y:+d.y,
								z:+d.z,
								selected: true,
								highlighted: false,
								name: systemName
							}
						for (var i = 0; i < propertyList.length; i++) {
							temp[propertyList[i]] = +d[propertyList[i]];
						}

						if (view.frameBool){
							currentFrame = (+d[plotSetup.frameProperty]).toString();
						}
						else{
							temp["__frame__"] = 1;
							currentFrame = (1).toString();
						}

						!(currentFrame in view.systemSpatiallyResolvedDataFramed) && (view.systemSpatiallyResolvedDataFramed[currentFrame] = []);

						view.systemSpatiallyResolvedData.push(temp);
						view.systemSpatiallyResolvedDataFramed[currentFrame].push(temp);

					}
				}*/
				console.log('end parsing', view.systemSpatiallyResolvedData.length)
			},
			complete: function(results) {
				// console.log('finished', results.data);
				console.log('papa load complete', view.systemSpatiallyResolvedData.length, results);
				callback(null);
			}
		});

	}
}

export function readCSVSpatiallyResolvedDataFastCSV(view,plotSetup,callback){
	view.systemSpatiallyResolvedData = [];
	view.systemSpatiallyResolvedDataFramed = {};

	if (view.spatiallyResolvedData == null || view.spatiallyResolvedData.dataFilename == null){
		console.log('no spatially resolved data loaded')
		callback(null);
	} else{
		if (view.frameBool && !(plotSetup.spatiallyResolvedPropertyList.includes(plotSetup.frameProperty))){
			alert("The frame property Not in spatiallyResolvedPropertyList");
		}
		console.log('started loading')
		var filename = view.spatiallyResolvedData.dataFilename;
		var propertyList = plotSetup.spatiallyResolvedPropertyList;
		var density = plotSetup.pointcloudDensity;
		var densityCutoffLow = plotSetup.densityCutoffLow;
		var densityCutoffUp = plotSetup.densityCutoffUp;
		var systemName = view.moleculeName;

		var count = 0;
		var n, currentFrame;
		var stream = fs.createReadStream(filename);

		var csvStream = csv.parseStream(stream, { headers: true })
			.on("data", function(d) {
				count = count +1;
				// console.log("reading row: ", count,d);
				n = +d[density];
				if (n > densityCutoffLow && n < densityCutoffUp){
					var temp = {
							x:+d.x,
							y:+d.y,
							z:+d.z,
							selected: true,
							highlighted: false,
							name: systemName
						}
					for (var i = 0; i < propertyList.length; i++) {
						temp[propertyList[i]] = +d[propertyList[i]];
					}

					if (view.frameBool){
						currentFrame = (+d[plotSetup.frameProperty]).toString();
					}
					else{
						temp["__frame__"] = 1;
						currentFrame = (1).toString();
					}

					!(currentFrame in view.systemSpatiallyResolvedDataFramed) && (view.systemSpatiallyResolvedDataFramed[currentFrame] = []);

					view.systemSpatiallyResolvedData.push(temp);
					view.systemSpatiallyResolvedDataFramed[currentFrame].push(temp);

				}
			})
			.on("end", function() {
				console.log(" End of file import, read: ",count);
				callback(null);
			});

	}
}



export function readCSVMoleculeData(view,plotSetup,callback){

	view.systemMoleculeData = [];
	view.systemMoleculeDataFramed = {};

	if (view.moleculeData == null || view.moleculeData.dataFilename == null){
		console.log('no molecule data loaded')
		callback(null);
	} else{
		if (view.frameBool && !(plotSetup.moleculePropertyList.includes(plotSetup.frameProperty))){
			alert("The frame property Not in moleculePropertyList");
		}
		console.log('started loading')
		var filename = view.moleculeData.dataFilename;
		console.log(filename)
		var propertyList = plotSetup.moleculePropertyList;
		var systemName = view.moleculeName;


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
							atom:d.atom.trim(),
							x:+d.x,
							y:+d.y,
							z:+d.z,
							selected: true,
							highlighted: false,
							name: systemName
						};

				for (var i = 0; i < propertyList.length; i++) {
						if (propertyList[i] != "atom"){
					    	temp[propertyList[i]] = +d[propertyList[i]];
						}
					}

				if (view.frameBool){
					var currentFrame = (+d[plotSetup.frameProperty]).toString();
				}
				else{
					temp["__frame__"] = 1;
					var currentFrame = (1).toString();
				}

				!(currentFrame in view.systemMoleculeDataFramed) && (view.systemMoleculeDataFramed[currentFrame] = []);

				view.systemMoleculeData.push(temp);
				view.systemMoleculeDataFramed[currentFrame].push(temp);
			})
			console.log('end parsing')
			callback(null);
		});

	}

}

//export function readCSVPapaparse(view,plotData,plotSetup,callback){
//	console.log('started using papa')
//	var filename = view.dataFilename;
//	var propertyList = plotSetup.propertyList;
//	var density = plotSetup.pointcloudDensity;
//	var densityCutoff = plotSetup.densityCutoff;
//	var systemName = view.moleculeName;
//	console.log(density,densityCutoff,propertyList)
//	view.data = [];
	/*Papa.parse(filename, {
		complete: function(results) {
			console.log('successfully used papa')
			console.log(results);
			callback(null);
		}
	});*/
//	$.ajax({
//    	url: filename,
//    	//dataType: 'json',
//    	type: 'get',
//    	cache: false,
//    	success: function(data) {
//    		console.log('loading setup');
//    		Papa.parse(data, {
//				complete: function(results) {
//					console.log('successfully used papa')
//					console.log(results);
//					callback(null);
//				}
//			});
//    	},
//    	error: function(requestObject, error, errorThrown) {
//            alert(error);
//            alert(errorThrown);
//        }
//    })
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

//}


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

function addViewDataToOverallDataSpatiallyResolved(view, overallSpatiallyResolvedData) {
	// var map = new Uint32Array(view.systemSpatiallyResolvedData.length);
	// var counterCurrent = 0;
	// var counterOverall = overallSpatiallyResolvedData.length;
	view.systemSpatiallyResolvedData.forEach(datapoint => {
		overallSpatiallyResolvedData.push(datapoint);
		// map[counterCurrent] = counterOverall;
		// counterOverall++;
		// counterCurrent++;
	});
	// view.spatiallyResolvedDataToOverallMap = map;
}

function addViewDataToOverallDataMolecule(view, overallMoleculeData) {
	// var map = new Uint32Array(view.systemMoleculeData.length);
	// var counterCurrent = 0;
	// var counterOverall = overallMoleculeData.length;
	view.systemMoleculeData.forEach(datapoint => {
		overallMoleculeData.push(datapoint);
		// map[counterCurrent] = counterOverall;
		// counterOverall++;
		// counterCurrent++;
	});
	// view.moleculeDataToOverallMap = map;
}

export function combineData(views, overallSpatiallyResolvedData,overallMoleculeData){
	for (var ii =  0; ii < views.length; ++ii ) {
		var view = views[ii];
		
		if (view.viewType == '3DView'){
			if(view.systemSpatiallyResolvedData != null && view.systemSpatiallyResolvedData.length != 0){
				addViewDataToOverallDataSpatiallyResolved(view, overallSpatiallyResolvedData);
			}
			if(view.systemMoleculeData != null && view.systemMoleculeData.length != 0){
				addViewDataToOverallDataMolecule(view, overallMoleculeData);
			}	
		}			
	}
}
