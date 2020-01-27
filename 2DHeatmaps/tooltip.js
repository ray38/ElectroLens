export function initialize2DPlotTooltip(view){
	var tempRaycaster = new THREE.Raycaster();
	view.raycaster = tempRaycaster;
	view.INTERSECTED = null;

	var tempTooltip = document.createElement('div');
	tempTooltip.setAttribute('style', 'cursor: pointer; text-align: left; display:block;');
	tempTooltip.style.position = 'absolute';
	tempTooltip.innerHTML = "";
	//tempTooltip.style.width = 100;
	//tempTooltip.style.height = 100;
	tempTooltip.style.backgroundColor = "blue";
	tempTooltip.style.opacity = 0.9;
	tempTooltip.style.color = "white";
	tempTooltip.style.top = 0 + 'px';
	tempTooltip.style.left = 0 + 'px';
	view.tooltip = tempTooltip;
	document.body.appendChild(tempTooltip);
}


export function updateHeatmapTooltip(view){

	var mouse = new THREE.Vector2();
	mouse.set(	(((event.clientX-view.windowLeft)/(view.windowWidth)) * 2 - 1),
				(-((event.clientY-view.windowTop)/(view.windowHeight)) * 2 + 1));


	view.raycaster.setFromCamera( mouse.clone(), view.camera );
	var intersects = view.raycaster.intersectObject( view.heatmapPlot );
	if ( intersects.length > 0 ) {
		//console.log("found intersect")
		
		view.tooltip.style.top = event.clientY + 5  + 'px';
		view.tooltip.style.left = event.clientX + 5  + 'px';

		var interesctIndex = intersects[ 0 ].index;
		view.tooltip.innerHTML = 	"x: " + view.heatmapInformation[interesctIndex].xStart + " : " + view.heatmapInformation[interesctIndex].xEnd  + '<br>' + 
									"y: " + view.heatmapInformation[interesctIndex].yStart + " : " + view.heatmapInformation[interesctIndex].yEnd  + '<br>' +
									"# points: " + view.heatmapInformation[interesctIndex].numberDatapointsRepresented;

		//view.System.geometry.attributes.size.array[ interesctIndex ]  = 2 * view.options.pointCloudSize;
		//view.System.geometry.attributes.size.needsUpdate = true;


		if ( view.INTERSECTED != intersects[ 0 ].index ) {
			if (view.INTERSECTED != null){
				view.heatmapPlot.geometry.attributes.size.array[ view.INTERSECTED ] = view.options.pointCloudSize;
				view.heatmapPlot.geometry.attributes.size.needsUpdate = true;
			}
			view.INTERSECTED = intersects[ 0 ].index;
			view.heatmapPlot.geometry.attributes.size.array[ view.INTERSECTED ] = 2 * view.options.pointCloudSize;
			view.heatmapPlot.geometry.attributes.size.needsUpdate = true;
		}

	}
	else {	view.tooltip.innerHTML = '';
			if (view.INTERSECTED != null){
				view.heatmapPlot.geometry.attributes.size.array[ view.INTERSECTED ] = view.options.pointCloudSize;
				view.heatmapPlot.geometry.attributes.size.needsUpdate = true;
			}
			view.INTERSECTED = null;
	}
}

export function updateCovarianceTooltip(view){

	var mouse = new THREE.Vector2();
	mouse.set(	(((event.clientX-view.windowLeft)/(view.windowWidth)) * 2 - 1),
				(-((event.clientY-view.windowTop)/(view.windowHeight)) * 2 + 1));


	view.raycaster.setFromCamera( mouse.clone(), view.camera );
	var intersects = view.raycaster.intersectObject( view.covariancePlot );
	if ( intersects.length > 0 ) {
		//console.log("found intersect")
		
		view.tooltip.style.top = event.clientY + 5  + 'px';
		view.tooltip.style.left = event.clientX + 5  + 'px';

		var interesctIndex = intersects[ 0 ].index;
		view.tooltip.innerHTML = 	"x: " + view.covarianceInformation[interesctIndex].x + '<br>' + 
									"y: " + view.covarianceInformation[interesctIndex].y + '<br>' +
									"Correlation: " + view.covarianceInformation[interesctIndex].correlation;

		//view.System.geometry.attributes.size.array[ interesctIndex ]  = 2 * view.options.pointCloudSize;
		//view.System.geometry.attributes.size.needsUpdate = true;


		if ( view.INTERSECTED != intersects[ 0 ].index ) {
			if (view.INTERSECTED != null){
				view.covariancePlot.geometry.attributes.size.array[ view.INTERSECTED ] = view.options.pointCloudSize*10;
				view.covariancePlot.geometry.attributes.size.needsUpdate = true;
			}
			view.INTERSECTED = intersects[ 0 ].index;
			view.covariancePlot.geometry.attributes.size.array[ view.INTERSECTED ] = 2 * view.options.pointCloudSize*10;
			view.covariancePlot.geometry.attributes.size.needsUpdate = true;
		}

	}
	else {	view.tooltip.innerHTML = '';
			if (view.INTERSECTED != null){
				view.covariancePlot.geometry.attributes.size.array[ view.INTERSECTED ] = view.options.pointCloudSize*10;
				view.covariancePlot.geometry.attributes.size.needsUpdate = true;
			}
			view.INTERSECTED = null;
	}
}