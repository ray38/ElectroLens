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

/*function highlightHeatmapPoints(index, view) {
	var heatmapX = view.heatmapInformation[index].heatmapX;
	var heatmapY = view.heatmapInformation[index].heatmapY;

	var dataset = view.data[heatmapX][heatmapY];
	dataset.highlighted = true;

	dataset.list.forEach(datapoint => {
		datapoint.highlighted = true;
	});
}

function unhighlightHeatmapPoints(index, view) {
	var heatmapX = view.heatmapInformation[index].heatmapX;
	var heatmapY = view.heatmapInformation[index].heatmapY;
	
	var dataset = view.data[heatmapX][heatmapY];
	dataset.highlighted = false;

	dataset.list.forEach(datapoint => {
		datapoint.highlighted = false;
	});
}
export function hoverHeatmap(view, mouseEvent){
	var mouse = new THREE.Vector2();
	mouse.set(	(((mouseEvent.clientX-view.windowLeft)/(view.windowWidth)) * 2 - 1),
				(-((mouseEvent.clientY-view.windowTop)/(view.windowHeight)) * 2 + 1));
	view.raycaster.params.Points.threshold = view.options.pointCloudSize / 4;
	view.raycaster.setFromCamera( mouse.clone(), view.camera );
	var intersects = view.raycaster.intersectObject( view.heatmapPlot );
	if ( intersects.length > 0 ) {
		
		if ( view.INTERSECTED != intersects[ 0 ].index ) {
			if (view.INTERSECTED != null && view.highlightedIndexList.indexOf(view.INTERSECTED) == -1){
				unhighlightHeatmapPoints(view.INTERSECTED, view);
			}
			view.INTERSECTED = intersects[ 0 ].index;
			highlightHeatmapPoints(view.INTERSECTED, view);
			updateHeatmapTooltip(view)
			return true;
		}
		updateHeatmapTooltip(view)
		return false
	}
	else {
		// no intersection
		if (view.INTERSECTED != null && view.highlightedIndexList.indexOf(view.INTERSECTED) == -1){
			// has previous intersection and previous interesction not in list
			unhighlightHeatmapPoints(view.INTERSECTED, view);
			view.INTERSECTED = null;
			updateHeatmapTooltip(view);
			return true;
		} else if (view.INTERSECTED != null) {
			// has previous intersection and previous interesction in list
			view.INTERSECTED = null;
			updateHeatmapTooltip(view);
			return true;
		}else {
			updateHeatmapTooltip(view);
			return false;
		}
		
	}
}*/

export function updateHeatmapTooltip(view){
	// console.log('updating 2d map tooltip',view.INTERSECTED);
	if (view.INTERSECTED) {
		view.tooltip.style.top = event.clientY + 5  + 'px';
		view.tooltip.style.left = event.clientX + 5  + 'px';

		var interesctIndex = view.INTERSECTED;
		view.tooltip.innerHTML = 	"x: " + view.heatmapInformation[interesctIndex].xStart + " : " + view.heatmapInformation[interesctIndex].xEnd  + '<br>' + 
									"y: " + view.heatmapInformation[interesctIndex].yStart + " : " + view.heatmapInformation[interesctIndex].yEnd  + '<br>' +
									"# points: " + view.heatmapInformation[interesctIndex].numberDatapointsRepresented;
	} else {
		view.tooltip.innerHTML = '';
	}
}





/* export function clickHeatmap(view){

	if (view.INTERSECTED != null){
		console.log('currently heatmap point under mouse', view.highlightedIndexList)
		//currently heatmap point under mouse
		var indexInList = view.highlightedIndexList.indexOf(view.INTERSECTED);
		if ( indexInList > -1){
			console.log('already in list, remove from list')
			// was highlighted
			view.highlightedIndexList.splice(indexInList, 1);
			return false;
		} else {
			console.log('not in list, add to list')
			// not yet highlighted
			view.highlightedIndexList.push(view.INTERSECTED);
			return false;
		}
	} else {
		console.log('currently No heatmap point under mouse')
		// currently no heatmap point under mouse
		if (view.highlightedIndexList.length > 0) {
			view.highlightedIndexList.forEach(index => {
				unhighlightHeatmapPoints(index, view);	
			});
			view.highlightedIndexList = [];
			return true;
		}
		else {
			return false;
		}
		
	}
} */



/*export function updateHeatmapTooltip(view){

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
}*/

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