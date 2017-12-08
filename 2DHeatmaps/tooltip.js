export function initializeHeatmapToolTip(view){
	var tempRaycaster = new THREE.Raycaster();
	view.raycaster = tempRaycaster;
	view.INTERSECTED = null;

	var tempTooltip = document.createElement('div');
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
	document.body.appendChild(tempTooltip);
}


export function updateHeatmapTooltip(view){

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
		view.tooltip.innerHTML = 	"x: " + view.heatmapInformation[interesctIndex].xStart + " : " + view.heatmapInformation[interesctIndex].xEnd  + '<br>' + 
									"y: " + view.heatmapInformation[interesctIndex].yStart + " : " + view.heatmapInformation[interesctIndex].yEnd  + '<br>' +
									"# points: " + view.heatmapInformation[interesctIndex].numberDatapointsRepresented;

		view.System.geometry.attributes.size.array[ interesctIndex ]  = 2 * view.options.pointCloudSize;
		view.System.geometry.attributes.size.needsUpdate = true;


		if ( view.INTERSECTED != intersects[ 0 ].index ) {
			view.System.geometry.attributes.size.array[ view.INTERSECTED ] = view.options.pointCloudSize;
			view.INTERSECTED = intersects[ 0 ].index;
			view.System.geometry.attributes.size.array[ view.INTERSECTED ] = 2 * view.options.pointCloudSize;
			view.System.geometry.attributes.size.needsUpdate = true;
		}

	}
	else {	view.tooltip.innerHTML = '';
			view.System.geometry.attributes.size.array[ view.INTERSECTED ] = view.options.pointCloudSize;
	}
}