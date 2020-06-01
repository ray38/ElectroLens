// var Papa = require('papaparse');
// const fs = require('fs');
const fs = window.require('fs');
// const remote = require('electron').remote;
// const electronFs = remote.require('fs');
// const path = require('path');
const csv = require('fast-csv');




export function processSpatiallyResolvedData(view,overallSpatiallyResolvedData,plotSetup,callback){
	view.systemSpatiallyResolvedData = [];
	console.log('started processing data');
	if (view.frameBool && !(plotSetup.spatiallyResolvedPropertyList.includes(plotSetup.frameProperty))){
		alert("The frame property Not in spatiallyResolvedPropertyList");
	}
	const data = view.spatiallyResolvedData.data;
	const propertyList = plotSetup.spatiallyResolvedPropertyList;
	const density = plotSetup.pointcloudDensity;
	const densityCutoffLow = plotSetup.densityCutoffLow;
	const densityCutoffUp = plotSetup.densityCutoffUp;
	const systemName = view.moleculeName;

	data.forEach(function (d,i) {
		const n = +d[density];
		if (n > densityCutoffLow && n < densityCutoffUp){
			const temp = {
					x:+d.x,
					y:+d.y,
					z:+d.z,
					selected: true,
					highlighted: false,
					name: systemName
				}
			for (let i = 0; i < propertyList.length; i++) {
			    temp[propertyList[i]] = +d[propertyList[i]];
			}

			let currentFrame;
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
	const data = view.moleculeData.data;
	const propertyList = plotSetup.moleculePropertyList;
	const systemName = view.moleculeName;
	
	data.forEach(function (d,i) {

		const temp = {
					atom:d.atom.trim(),
					x:+d.x,
					y:+d.y,
					z:+d.z,
					selected: true,
					highlighted: false,
					name: systemName
				};

		for (let i = 0; i < propertyList.length; i++) {
				if (propertyList[i] != "atom"){
			    	temp[propertyList[i]] = +d[propertyList[i]];
				}
			}
		
		let currentFrame;
		if (view.frameBool){
			currentFrame = (+d[plotSetup.frameProperty]).toString();
		}
		else{
			temp["__frame__"] = 1;
			currentFrame = (1).toString();
		}

		!(currentFrame in view.systemMoleculeDataFramed) && (view.systemMoleculeDataFramed[currentFrame] = []);
		console.log(temp)
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
		const filename = view.spatiallyResolvedData.dataFilename;
		const propertyList = plotSetup.spatiallyResolvedPropertyList;
		const density = plotSetup.pointcloudDensity;
		const densityCutoffLow = plotSetup.densityCutoffLow;
		const densityCutoffUp = plotSetup.densityCutoffUp;
		const systemName = view.moleculeName;


		d3.csv(filename, function (error,d) {
			if (error && error.target.status === 404) {
				console.log(error);
				console.log("File not found");
			}
			if(d.length === 0){
				console.log("File empty")
			}
			console.log('end loading', d.length)
			d.forEach(function (d,i) {
				const n = +d[density];
				if (n > densityCutoffLow && n < densityCutoffUp){
					const temp = {
							x:+d.x,
							y:+d.y,
							z:+d.z,
							selected: true,
							highlighted: false,
							name: systemName
						}
					for (let i = 0; i < propertyList.length; i++) {
					    temp[propertyList[i]] = +d[propertyList[i]];
					}

					let currentFrame;
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
			console.log('end parsing')
			callback(null);
		});
	}
}

// export function readCSVSpatiallyResolvedDataPapaparse(view,plotSetup,callback){
// 	view.systemSpatiallyResolvedData = [];
// 	view.systemSpatiallyResolvedDataFramed = {};

// 	if (view.spatiallyResolvedData == null || view.spatiallyResolvedData.dataFilename == null){
// 		console.log('no spatially resolved data loaded')
// 		callback(null);
// 	} else{
// 		if (view.frameBool && !(plotSetup.spatiallyResolvedPropertyList.includes(plotSetup.frameProperty))){
// 			alert("The frame property Not in spatiallyResolvedPropertyList");
// 		}
// 		console.log('started loading')
// 		var filename = view.spatiallyResolvedData.dataFilename;
// 		var propertyList = plotSetup.spatiallyResolvedPropertyList;
// 		var density = plotSetup.pointcloudDensity;
// 		var densityCutoffLow = plotSetup.densityCutoffLow;
// 		var densityCutoffUp = plotSetup.densityCutoffUp;
// 		var systemName = view.moleculeName;

// 		var count = 0;
// 		var d, n, currentFrame;
// 		Papa.parse(filename, {
// 			header: true,
// 			download: true,
// 			/*step: function(results){
// 				count = count + 1;
// 				console.log('finished count: ', count, results.data);
// 			},*/
// 			chunk: function(chunk) {
// 				console.log('loading chunk');
// 				/*for (var ii = 0; ii < chunk.length; ii++) {
// 					d = chunck.data[ii];
// 					n = +d[density];
// 					if (n > densityCutoffLow && n < densityCutoffUp){
// 						var temp = {
// 								x:+d.x,
// 								y:+d.y,
// 								z:+d.z,
// 								selected: true,
// 								highlighted: false,
// 								name: systemName
// 							}
// 						for (var i = 0; i < propertyList.length; i++) {
// 							temp[propertyList[i]] = +d[propertyList[i]];
// 						}

// 						if (view.frameBool){
// 							currentFrame = (+d[plotSetup.frameProperty]).toString();
// 						}
// 						else{
// 							temp["__frame__"] = 1;
// 							currentFrame = (1).toString();
// 						}

// 						!(currentFrame in view.systemSpatiallyResolvedDataFramed) && (view.systemSpatiallyResolvedDataFramed[currentFrame] = []);

// 						view.systemSpatiallyResolvedData.push(temp);
// 						view.systemSpatiallyResolvedDataFramed[currentFrame].push(temp);

// 					}
// 				}*/
// 				console.log('end parsing', view.systemSpatiallyResolvedData.length)
// 			},
// 			complete: function(results) {
// 				// console.log('finished', results.data);
// 				console.log('papa load complete', view.systemSpatiallyResolvedData.length, results);
// 				callback(null);
// 			}
// 		});

// 	}
// }

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
		const filename = view.spatiallyResolvedData.dataFilename;
		const propertyList = plotSetup.spatiallyResolvedPropertyList;
		const density = plotSetup.pointcloudDensity;
		const densityCutoffLow = plotSetup.densityCutoffLow;
		const densityCutoffUp = plotSetup.densityCutoffUp;
		const systemName = view.moleculeName;

		let count = 0;
		//let currentFrame;
		const stream = fs.createReadStream(filename, {highWaterMark : 5096 * 1024});

		const t0 = performance.now();

		csv.parseStream(stream, { headers: true, quote:null})
			.on("data", function(d) {
				count = count +1;
				const n = +d[density];
				if (n > densityCutoffLow && n < densityCutoffUp){
					const temp = {
							x:+d.x,
							y:+d.y,
							z:+d.z,
							selected: true,
							highlighted: false,
							name: systemName
						}
					for (let i = propertyList.length; i--;) {
						temp[propertyList[i]] = +d[propertyList[i]];
					}

					let currentFrame;
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
				console.log(" took: ",performance.now() - t0);
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
		const filename = view.moleculeData.dataFilename;
		const propertyList = plotSetup.moleculePropertyList;
		const systemName = view.moleculeName;


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

				const temp = {
							atom:d.atom.trim(),
							x:+d.x,
							y:+d.y,
							z:+d.z,
							selected: true,
							highlighted: false,
							name: systemName
						};

				for (let i = 0; i < propertyList.length; i++) {
						if (propertyList[i] != "atom"){
					    	temp[propertyList[i]] = +d[propertyList[i]];
						}
					}

				let currentFrame;
				if (view.frameBool){
					currentFrame = (+d[plotSetup.frameProperty]).toString();
				}
				else{
					temp["__frame__"] = 1;
					currentFrame = (1).toString();
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


function addViewDataToOverallDataSpatiallyResolved(view, overallSpatiallyResolvedData) {
	view.systemSpatiallyResolvedData.forEach(datapoint => {
		overallSpatiallyResolvedData.push(datapoint);
	});
}

function addViewDataToOverallDataMolecule(view, overallMoleculeData) {
	view.systemMoleculeData.forEach(datapoint => {
		overallMoleculeData.push(datapoint);
	});
}

export function combineData(views, overallSpatiallyResolvedData,overallMoleculeData){
	for (let ii =  0; ii < views.length; ++ii ) {
		let view = views[ii];
		
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
