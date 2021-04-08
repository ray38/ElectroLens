export function initialize2DPlotTooltip(view){
	const tempRaycaster = new THREE.Raycaster();
	view.raycaster = tempRaycaster;
	view.INTERSECTED = null;

	const tempTooltip = document.createElement('div');
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
	console.log('tooltip: ', tempTooltip);
	tempTooltip.style.pointerEvents = "none";
	console.log('tooltip: ', tempTooltip);
	view.tooltip = tempTooltip;
	document.body.appendChild(tempTooltip);
}


export function updateHeatmapTooltip(view, event){
	// console.log('updating 2d map tooltip',view.INTERSECTED);
	if (view.options.plotType == "Comparison"){
		if (view.INTERSECTED !== null) {
			view.tooltip.style.top = event.clientY + 5  + 'px';
			view.tooltip.style.left = event.clientX + 5  + 'px';
	
			const interesctIndex = view.INTERSECTED;
			view.tooltip.innerHTML = 	"x: " + view.heatmapInformation[interesctIndex].xStart + " : " + view.heatmapInformation[interesctIndex].xEnd  + '<br>' + 
										"y: " + view.heatmapInformation[interesctIndex].yStart + " : " + view.heatmapInformation[interesctIndex].yEnd  + '<br>' +
										"systems: " + view.heatmapInformation[interesctIndex].systemRepresented;
		} else {
			view.tooltip.innerHTML = '';
		}
	}

	if (view.options.plotType == "Heatmap"){
		if (view.INTERSECTED !== null) {
			view.tooltip.style.top = event.clientY + 5  + 'px';
			view.tooltip.style.left = event.clientX + 5  + 'px';
	
			const interesctIndex = view.INTERSECTED;
			view.tooltip.innerHTML = 	"x: " + view.heatmapInformation[interesctIndex].xStart + " : " + view.heatmapInformation[interesctIndex].xEnd  + '<br>' + 
										"y: " + view.heatmapInformation[interesctIndex].yStart + " : " + view.heatmapInformation[interesctIndex].yEnd  + '<br>' +
										"# points: " + view.heatmapInformation[interesctIndex].numberDatapointsRepresented;
		} else {
			view.tooltip.innerHTML = '';
		}
	}

	if (view.options.plotType == "PCA"){
		if (view.INTERSECTED !== null) {
			view.tooltip.style.top = event.clientY + 5  + 'px';
			view.tooltip.style.left = event.clientX + 5  + 'px';
	
			const interesctIndex = view.INTERSECTED;
			view.tooltip.innerHTML = 	"x: " + view.heatmapInformation[interesctIndex].xStart + " : " + view.heatmapInformation[interesctIndex].xEnd  + '<br>' + 
										"y: " + view.heatmapInformation[interesctIndex].yStart + " : " + view.heatmapInformation[interesctIndex].yEnd  + '<br>' +
										"# points: " + view.heatmapInformation[interesctIndex].numberDatapointsRepresented;
		} else {
			view.tooltip.innerHTML = '';
		}
	}

	if (view.options.plotType == "Umap"){
		if (view.INTERSECTED !== null) {
			view.tooltip.style.top = event.clientY + 5  + 'px';
			view.tooltip.style.left = event.clientX + 5  + 'px';
	
			const interesctIndex = view.INTERSECTED;
			view.tooltip.innerHTML = 	"x: " + view.heatmapInformation[interesctIndex].xStart + " : " + view.heatmapInformation[interesctIndex].xEnd  + '<br>' + 
										"y: " + view.heatmapInformation[interesctIndex].yStart + " : " + view.heatmapInformation[interesctIndex].yEnd  + '<br>' +
										"# points: " + view.heatmapInformation[interesctIndex].numberDatapointsRepresented;
		} else {
			view.tooltip.innerHTML = '';
		}
	}
	
}


export function updateCovarianceTooltip(view, event){

	const mouse = new THREE.Vector2();
	mouse.set(	(((event.clientX-view.windowLeft)/(view.windowWidth)) * 2 - 1),
				(-((event.clientY-view.windowTop)/(view.windowHeight)) * 2 + 1));


	view.raycaster.setFromCamera( mouse.clone(), view.camera );
	const intersects = view.raycaster.intersectObject( view.covariancePlot );
	if ( intersects.length > 0 ) {
		//console.log("found intersect")
		
		view.tooltip.style.top = event.clientY + 5  + 'px';
		view.tooltip.style.left = event.clientX + 5  + 'px';

		const interesctIndex = intersects[ 0 ].index;
		view.tooltip.innerHTML = 	"x: " + view.covarianceInformation[interesctIndex].x + '<br>' + 
									"y: " + view.covarianceInformation[interesctIndex].y + '<br>' +
									"Correlation: " + view.covarianceInformation[interesctIndex].correlation;



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