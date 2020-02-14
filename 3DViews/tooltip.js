export function initialize3DViewTooltip(view){
	var tempRaycaster = new THREE.Raycaster();
	view.raycaster = tempRaycaster;
	view.INTERSECTED = null;

	/*var tempTooltip = document.createElement('div');
	tempTooltip.setAttribute('style', 'cursor: pointer; text-align: left; display:block;');
	tempTooltip.style.position = 'absolute';
	tempTooltip.innerHTML = "";
	//tempTooltip.style.width = 100;
	//tempTooltip.style.height = 100;
	tempTooltip.style.backgroundColor = "blue";
	tempTooltip.style.opacity = 0.5;
	tempTooltip.style.color = "white";
	tempTooltip.style.top = 0 + 'px';
	tempTooltip.style.left = 0 + 'px';
	view.tooltip = tempTooltip;
	document.body.appendChild(tempTooltip);*/

}


export function update3DViewTooltip(view){

	var mouse = new THREE.Vector2();
	mouse.set(	(((event.clientX-view.windowLeft)/(view.windowWidth)) * 2 - 1),
				(-((event.clientY-view.windowTop)/(view.windowHeight)) * 2 + 1));


	view.raycaster.setFromCamera( mouse.clone(), view.camera );
	var intersects = view.raycaster.intersectObjects( view.molecule.atoms );
	//console.log(intersects);
	if ( intersects.length > 0 ) {
		//console.log("found intersect")
		
		view.tooltip.style.top = event.clientY + 5  + 'px';
		view.tooltip.style.left = event.clientX + 5  + 'px';

		var data = view.systemMoleculeData[ intersects[ 0 ].object.dataIndex ];

		var tempDisplayedInfo = 	"x: " + data.x + "<br>" + 
									"y: " + data.y + "<br>" +
									"z: " + data.z + "<br>";
		for (var property in data ) {
			if (data.hasOwnProperty(property)) {
				if (property != "xPlot" && property != "yPlot" && property != "zPlot" && property != "x" && property != "y" && property != "z" && property != "selected"){
					tempDisplayedInfo += property + ": " + data[property] + "<br>";
				}
			}
		}

		view.tooltip.innerHTML = 	tempDisplayedInfo;

		if ( view.INTERSECTED != intersects[ 0 ] ) {

			if (view.INTERSECTED != null){view.INTERSECTED.scale.set(view.INTERSECTED.scale.x/1.3, view.INTERSECTED.scale.y/1.3, view.INTERSECTED.scale.z/1.3);}
			
			view.INTERSECTED = intersects[ 0 ].object;
			view.INTERSECTED.scale.set(view.INTERSECTED.scale.x*1.3, view.INTERSECTED.scale.y*1.3, view.INTERSECTED.scale.z*1.3);
		}
		

	}
	else {	view.tooltip.innerHTML = '';

			if (view.INTERSECTED != null){view.INTERSECTED.scale.set(view.INTERSECTED.scale.x/1.3, view.INTERSECTED.scale.y/1.3, view.INTERSECTED.scale.z/1.3);}
			view.INTERSECTED = null;
	}
}

/*
export function update3DViewTooltip(view){

	var mouse = new THREE.Vector2();
	mouse.set(	(((event.clientX-view.windowLeft)/(view.windowWidth)) * 2 - 1),
				(-((event.clientY-view.windowTop)/(view.windowHeight)) * 2 + 1));


	view.raycaster.setFromCamera( mouse.clone(), view.camera );
	var intersects = view.raycaster.intersectObject( view.System );
	if ( intersects.length > 0 ) {
		//console.log("found intersect")
		
		view.tooltip.style.top = event.clientY + 5  + 'px';
		view.tooltip.style.left = event.clientX + 5  + 'px';

		var interesctIndex = intersects[ 0 ].index;
		var tempDisplayedInfo = 	"x: " + data.x + "<br>" + 
									"y: " + data.y + "<br>" +
									"z: " + data.z + "<br>";
		for (var property in data ) {
			if (data.hasOwnProperty(property)) {
				if (property != "xPlot" && property != "yPlot" && property != "zPlot" && property != "x" && property != "y" && property != "z" && property != "selected"){
					tempDisplayedInfo += property + ": " + data[property] + "<br>";
				}
			}
		}

		view.tooltip.innerHTML = 	tempDisplayedInfo;

		if ( view.INTERSECTED != intersects[ 0 ].index ) {
			if (view.INTERSECTED != null){
				view.System.geometry.attributes.size.array[ view.INTERSECTED ] = view.options.pointCloudSize;
				view.System.geometry.attributes.size.needsUpdate = true;
			}
			view.INTERSECTED = intersects[ 0 ].index;
			view.System.geometry.attributes.size.array[ view.INTERSECTED ] = 2 * view.options.pointCloudSize;
			view.System.geometry.attributes.size.needsUpdate = true;
		}

	}
	else {	view.tooltip.innerHTML = '';
			if (view.INTERSECTED != null){
				view.System.geometry.attributes.size.array[ view.INTERSECTED ] = view.options.pointCloudSize;
				view.System.geometry.attributes.size.needsUpdate = true;
			}
			view.INTERSECTED = null;
	}
}*/

/* 


function highlight3DViewPointsSpatiallyResolved(index, view, plotSetup) {
	var options = view.options;
	var currentFrame = options.currentFrame.toString();
	var spatiallyResolvedData = view.systemSpatiallyResolvedDataFramed[currentFrame];

	var pointVoxelMap = view.System.userData.pointVoxelMap ;
	//var voxelGlobalIndex = view.
	var voxelPointDict = view.System.userData.voxelPointDict;

	if (plotSetup.active2DPlotSpatiallyResolved && 
		plotSetup.active2DPlotSpatiallyResolved.options.plotData == 'spatiallyResolvedData' && 
		plotSetup.active2DPlotSpatiallyResolved.heatmapPlot) {
		var twoDPlot = plotSetup.active2DPlotSpatiallyResolved;
		// var X = twoDPlot.options.plotXSpatiallyResolvedData, Y = twoDPlot.options.plotYSpatiallyResolvedData;
		var xScale = twoDPlot.xScale , yScale =  twoDPlot.yScale;
		var xValue = twoDPlot.xValue , yValue =  twoDPlot.yValue;
		var highlightDataPoint = spatiallyResolvedData[pointVoxelMap[index]];

		var xMap = function(d) {return xScale(xValue(d));};
		var yMap = function(d) {return yScale(yValue(d));}; 

		var heatmapX = xMap(highlightDataPoint);
		var heatmapY = yMap(highlightDataPoint);

		var dataset = twoDPlot.data[heatmapX][heatmapY];
		dataset.highlighted = true;

		dataset.list.forEach(datapoint => {
			datapoint.highlighted = true;
		})
	} else {
		var highlightDataPoint = spatiallyResolvedData[pointVoxelMap[index]];
		highlightDataPoint.highlighted = true;
	}
}

function unhighlight3DViewPointsSpatiallyResolved(index, view,plotSetup) {
	var options = view.options;
	var currentFrame = options.currentFrame.toString();
	var spatiallyResolvedData = view.systemSpatiallyResolvedDataFramed[currentFrame];

	var pointVoxelMap = view.System.userData.pointVoxelMap ;
	//var voxelGlobalIndex = view.
	var voxelPointDict = view.System.userData.voxelPointDict;

	if (plotSetup.active2DPlotSpatiallyResolved && 
		plotSetup.active2DPlotSpatiallyResolved.options.plotData == 'spatiallyResolvedData' && 
		plotSetup.active2DPlotSpatiallyResolved.heatmapPlot) {
		var twoDPlot = plotSetup.active2DPlotSpatiallyResolved;
		// var X = twoDPlot.options.plotXSpatiallyResolvedData, Y = twoDPlot.options.plotYSpatiallyResolvedData;
		var xScale = twoDPlot.xScale , yScale =  twoDPlot.yScale;
		var xValue = twoDPlot.xValue , yValue =  twoDPlot.yValue;
		var highlightDataPoint = spatiallyResolvedData[pointVoxelMap[index]];

		var xMap = function(d) {return xScale(xValue(d));};
		var yMap = function(d) {return yScale(yValue(d));}; 

		var heatmapX = xMap(highlightDataPoint);
		var heatmapY = yMap(highlightDataPoint);

		var dataset = twoDPlot.data[heatmapX][heatmapY];
		dataset.highlighted = false;

		dataset.list.forEach(datapoint => {
			datapoint.highlighted = false;
		})
	} else {
		var highlightDataPoint = spatiallyResolvedData[pointVoxelMap[index]];
		highlightDataPoint.highlighted = false;
	}
}

export function hover3DViewSpatiallyResolved(view, plotSetup, mouseEvent){
	var mouse = new THREE.Vector2();
	mouse.set(	(((mouseEvent.clientX-view.windowLeft)/(view.windowWidth)) * 2 - 1),
				(-((mouseEvent.clientY-view.windowTop)/(view.windowHeight)) * 2 + 1));
	
	view.raycaster.params.Points.threshold = view.options.pointCloudSize / 4;
	console.log(view.raycaster);
	view.raycaster.setFromCamera( mouse.clone(), view.camera );
	var intersects = view.raycaster.intersectObject( view.System );
	if ( intersects.length > 0 ) {
		
		if ( view.INTERSECTED != intersects[ 0 ].index ) {
			if (view.INTERSECTED != null){
				unhighlight3DViewPointsSpatiallyResolved(view.INTERSECTED, view,plotSetup);
			}
			view.INTERSECTED = intersects[ 0 ].index;
			highlight3DViewPointsSpatiallyResolved(view.INTERSECTED, view,plotSetup);
			return true;
		}
		return false;

	}
	else {
		if (view.INTERSECTED != null){
			unhighlight3DViewPointsSpatiallyResolved(view.INTERSECTED, view,plotSetup);
			view.INTERSECTED = null;
			return true;
		} else {
			return false;
		}
		
	}

}





function highlight3DViewPointsMolecule(index, view, plotSetup) {
	var options = view.options;
	var currentFrame = options.currentFrame.toString();
	var moleculeData = view.systemMoleculeDataFramed[currentFrame];


	if (plotSetup.active2DPlotMolecule && 
		plotSetup.active2DPlotMolecule.options.plotData == 'moleculeData' && 
		plotSetup.active2DPlotMolecule.heatmapPlot) {
		var twoDPlot = plotSetup.active2DPlotMolecule;
		// var X = twoDPlot.options.plotXSpatiallyResolvedData, Y = twoDPlot.options.plotYSpatiallyResolvedData;
		var xScale = twoDPlot.xScale , yScale =  twoDPlot.yScale;
		var xValue = twoDPlot.xValue , yValue =  twoDPlot.yValue;
		var highlightDataPoint = moleculeData[index];

		var xMap = function(d) {return xScale(xValue(d));};
		var yMap = function(d) {return yScale(yValue(d));}; 

		var heatmapX = xMap(highlightDataPoint);
		var heatmapY = yMap(highlightDataPoint);

		var dataset = twoDPlot.data[heatmapX][heatmapY];
		dataset.highlighted = true;

		dataset.list.forEach(datapoint => {
			datapoint.highlighted = true;
		})
	} else {
		var highlightDataPoint = moleculeData[index];
		highlightDataPoint.highlighted = true;
	}
}

function unhighlight3DViewPointsMolecule(index, view,plotSetup) {
	var options = view.options;
	var currentFrame = options.currentFrame.toString();
	var moleculeData = view.systemMoleculeDataFramed[currentFrame];


	if (plotSetup.active2DPlotMolecule && 
		plotSetup.active2DPlotMolecule.options.plotData == 'moleculeData' && 
		plotSetup.active2DPlotMolecule.heatmapPlot) {
		var twoDPlot = plotSetup.active2DPlotMolecule;
		// var X = twoDPlot.options.plotXSpatiallyResolvedData, Y = twoDPlot.options.plotYSpatiallyResolvedData;
		var xScale = twoDPlot.xScale , yScale =  twoDPlot.yScale;
		var xValue = twoDPlot.xValue , yValue =  twoDPlot.yValue;
		var highlightDataPoint = moleculeData[index];

		var xMap = function(d) {return xScale(xValue(d));};
		var yMap = function(d) {return yScale(yValue(d));}; 

		var heatmapX = xMap(highlightDataPoint);
		var heatmapY = yMap(highlightDataPoint);

		var dataset = twoDPlot.data[heatmapX][heatmapY];
		dataset.highlighted = false;

		dataset.list.forEach(datapoint => {
			datapoint.highlighted = false;
		})
	} else {
		var highlightDataPoint = moleculeData[index];
		highlightDataPoint.highlighted = false;
	}
}

export function hover3DViewMolecule(view, plotSetup, mouseEvent){
	var mouse = new THREE.Vector2();
	mouse.set(	(((mouseEvent.clientX-view.windowLeft)/(view.windowWidth)) * 2 - 1),
				(-((mouseEvent.clientY-view.windowTop)/(view.windowHeight)) * 2 + 1));
	
	view.raycaster.params.Points.threshold = view.options.pointCloudSize * 3.5;
	view.raycaster.setFromCamera( mouse.clone(), view.camera );

	if (view.options.atomsStyle == "ball") {
		
		var intersects = view.raycaster.intersectObject( view.molecule.atoms );
		if ( intersects.length > 0 ) {
			var intersectIndex = Math.floor(intersects[0].face.a / view.molecule.atoms.userData.numVerticesPerAtom);
			console.log('intersect', intersectIndex);
			if ( view.INTERSECTED != intersectIndex ) {
				if (view.INTERSECTED != null){
					unhighlight3DViewPointsMolecule(view.INTERSECTED, view,plotSetup);
				}
				view.INTERSECTED = intersectIndex;
				// console.log(intersects[0],view.molecule.atoms.userData.numVerticesPerAtom, view.INTERSECTED);
				highlight3DViewPointsMolecule(view.INTERSECTED, view,plotSetup);
				return true;
			}
			return false;
		}
		else {
			if (view.INTERSECTED != null){
				unhighlight3DViewPointsMolecule(view.INTERSECTED, view,plotSetup);
				view.INTERSECTED = null;
				return true;
			}
			return false;
		}
	}

	if (view.options.atomsStyle == "sprite") {
		var intersects = view.raycaster.intersectObject( view.molecule.atoms );
		if ( intersects.length > 0 ) {
		
			if ( view.INTERSECTED != intersects[ 0 ].index ) {
				if (view.INTERSECTED != null){
					unhighlight3DViewPointsMolecule(view.INTERSECTED, view,plotSetup);
				}
				view.INTERSECTED = intersects[ 0 ].index;
				highlight3DViewPointsMolecule(view.INTERSECTED, view,plotSetup);
				return true;
			}
			return false;
	
		}
		else {
			if (view.INTERSECTED != null){
				unhighlight3DViewPointsMolecule(view.INTERSECTED, view,plotSetup);
				view.INTERSECTED = null;
				return true;
			}
			return false
			
		}
	}

}
 */