const fs = window.require('fs');
const csvparse = require("csv-parse");
const transform = require("stream-transform");


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

		let count = 0;
		const t0 = Date.now();

		const parser = csvparse({
			delimiter: ',',
			columns: true 
		});
		
		const transformer = transform(function(record, callback){ 
			const n = +record[density];
			//console.log(record);
			if (n > densityCutoffLow && n < densityCutoffUp) {
				record.x = +record.x;
				record.y = +record.y;
				record.z = +record.z;
				record.selected = true;
				record.name = systemName;
				record.highlighted = false;
				for (let i = propertyList.length; i--;) { 
					record[propertyList[i]] = +record[propertyList[i]];
				} 
				let currentFrame;
				if (view.frameBool){ 
					currentFrame = (+record[plotSetup.frameProperty]).toString();
				}
				else{
					record["__frame__"] = 1;
					currentFrame = (1).toString();
				}
				// console.log(record);
				!(currentFrame in view.systemSpatiallyResolvedDataFramed) && (view.systemSpatiallyResolvedDataFramed[currentFrame] = []);
				view.systemSpatiallyResolvedData.push(record);
				view.systemSpatiallyResolvedDataFramed[currentFrame].push(record);
			}
			callback(null);

		});
		
		fs.createReadStream(filename, { highWaterMark :  2048 * 1024})
		.pipe(parser).pipe(transformer)
		.on('finish', function() {
			console.log(" End of file import, read: ",count);
			console.log(" took: ",Date.now() - t0);
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
