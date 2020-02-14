import {heatmapsResetSelection, deselectAll, selectAll, updateAllPlots, updateSelectionFromHeatmap, updateSelectionFromComparison} from "./Selection/Utilities.js";
import {updateHeatmapTooltip} from "./tooltip.js";

function spawnPlane(view){

	var selectionPlaneMaterial = new THREE.MeshBasicMaterial( {  color: 0xffffff, opacity: 0.5,transparent: true, side: THREE.DoubleSide,needsUpdate : true } );
	var scene = view.scene;
	var mousePosition = view.mousePosition;
	var selectionPlane = new THREE.Mesh( new THREE.PlaneBufferGeometry( 1, 1), selectionPlaneMaterial );
	selectionPlane.geometry.attributes.position.needsUpdate = true;
	var p = selectionPlane.geometry.attributes.position.array;

	var i = 0;
	p[i++] = mousePosition.x-0.01;
	p[i++] = mousePosition.y+0.01;
	p[i++] = mousePosition.z;
	p[i++] = mousePosition.x;
	p[i++] = mousePosition.y+0.01;
	p[i++] = mousePosition.z;
	p[i++] = mousePosition.x-0.01;
	p[i++] = mousePosition.y;
	p[i++] = mousePosition.z;
	p[i++] = mousePosition.x;
	p[i++] = mousePosition.y;
	p[i]   = mousePosition.z;
	
	selectionPlane.name = 'selectionPlane';
	view.currentSelectionPlane = selectionPlane;
	scene.add( selectionPlane );
	//updateSelection();
}

function updatePlane(view, plane){
	var selectionPlaneMaterial = new THREE.MeshBasicMaterial( {  color: 0xffffff, opacity: 0.5,transparent: true, side: THREE.DoubleSide,needsUpdate : true } );
	var scene = view.scene;

	var mousePosition = view.mousePosition;
	
	var selectionPlane = new THREE.Mesh( new THREE.PlaneBufferGeometry( 1, 1), selectionPlaneMaterial );
	selectionPlane.geometry.attributes.position.needsUpdate = true;
	
	
	var pOriginal = plane.geometry.attributes.position.array;
	
	var originalFirstVerticesCoordx = pOriginal[0],
		originalFirstVerticesCoordy = pOriginal[1],
		originalFirstVerticesCoordz = pOriginal[2];
	
	var p = selectionPlane.geometry.attributes.position.array
	var i = 0;
	p[i++] = originalFirstVerticesCoordx;
	p[i++] = originalFirstVerticesCoordy;
	p[i++] = originalFirstVerticesCoordz;
	p[i++] = mousePosition.x;
	p[i++] = originalFirstVerticesCoordy;
	p[i++] = mousePosition.z;
	p[i++] = originalFirstVerticesCoordx;
	p[i++] = mousePosition.y;
	p[i++] = mousePosition.z;
	p[i++] = mousePosition.x;
	p[i++] = mousePosition.y;
	p[i]   = mousePosition.z;
	
	scene.remove(plane);
	selectionPlane.name = 'selectionPlane';
	view.currentSelectionPlane = selectionPlane;
	scene.add( selectionPlane );
	//updateSelection();
	
}

function spawnBrush(view){

	var selectionBrushMaterial = new THREE.MeshBasicMaterial( {  color: 0xffffff, opacity: 0.5,transparent: true, side: THREE.DoubleSide,needsUpdate : true } );
	var scene = view.scene;
	var mousePosition = view.mousePosition;
	var selectionBrush = new THREE.Mesh( new THREE.CircleGeometry( view.options.selectionBrushSize, 32 ), selectionBrushMaterial );
	//selectionPlane.geometry.attributes.position.needsUpdate = true;
	selectionBrush.position.set(mousePosition.x, mousePosition.y, mousePosition.z);

	
	selectionBrush.name = 'selectionBrush';
	view.currentSelectionBrush = selectionBrush;
	scene.add( selectionBrush );
	console.log("spawn brush");
	//updateSelection();
}

function updateBrush(view,tempBrush){

	var mousePosition = view.mousePosition;
	tempBrush.position.set(mousePosition.x, mousePosition.y, mousePosition.z);
	console.log("update brush");
	//updateSelection();
}


export function updatePlaneSelection(views,view) {
	//var tempSelectionPlane = temp_view.scene.getObjectByName('selectionPlane');
	var tempSelectionPlane = view.currentSelectionPlane;
	//console.log(tempSelectionPlane)
	if (tempSelectionPlane != null){
		
		if (view.viewType == '2DHeatmap' && (view.options.plotType == "Heatmap" || view.options.plotType == 'Dim. Reduction')) {
			var p = tempSelectionPlane.geometry.attributes.position.array;
			var xmin = Math.min(p[0],p[9]), xmax = Math.max(p[0],p[9]),
				ymin = Math.min(p[1],p[10]), ymax = Math.max(p[1],p[10]);
			var tempx,tempy;

			console.log('updating plane selection')
			
			var data = view.data;
			var xPlotScale = view.xPlotScale;
			var yPlotScale = view.yPlotScale;
			for (var x in data){
				for (var y in data[x]){
					tempx = xPlotScale(parseFloat(x));
					tempy = yPlotScale(parseFloat(y));
					if (tempx>xmin && tempx<xmax && tempy>ymin && tempy<ymax){
						data[x][y].highlighted = true;
						// data[x][y].selected = true;
						for (var i = 0; i < data[x][y]['list'].length; i++) {
							data[x][y]['list'][i].highlighted = true;
							// data[x][y]['list'][i].selected = true;
						}
					}
					// else { data[x][y].selected = false;}
				}
			}
			clickUpdateAll2DHeatmaps(views);
			// updateSelectionFromHeatmap(view);
		}
		if (view.viewType == '2DHeatmap' && view.options.plotType == "Comparison") {
			var p = tempSelectionPlane.geometry.attributes.position.array;
			var xmin = Math.min(p[0],p[9]), xmax = Math.max(p[0],p[9]),
				ymin = Math.min(p[1],p[10]), ymax = Math.max(p[1],p[10]);
			var tempx,tempy;
			console.log('selecting for comparison')
			const overallData = view.data;
			var xPlotScale = view.xPlotScale;
			var yPlotScale = view.yPlotScale;

			Object.keys(overallData).forEach((systemName, index) => { 
				var data = overallData[systemName].data;

				for (var x in data){
					for (var y in data[x]){
						tempx = xPlotScale(parseFloat(x));
						tempy = yPlotScale(parseFloat(y));
						if (tempx>xmin && tempx<xmax && tempy>ymin && tempy<ymax){
							// data[x][y].selected = true;
							for (var i = 0; i < data[x][y]['list'].length; i++) {
								data[x][y]['list'][i].selected = true;
							}
						}
						// else { data[x][y].selected = false;}
					}
				}
			})
			// updateSelectionFromComparison(view);	
		}
	}
	
	updateAllPlots(views);
}


export function updateBrushSelection(views,view) {
	//var tempSelectionPlane = temp_view.scene.getObjectByName('selectionPlane');
	var tempSelectionBrush = view.currentSelectionBrush;
	//console.log(tempSelectionPlane)
	if (tempSelectionBrush != null){
		var location = tempSelectionBrush.position;
		var radius2   = view.options.selectionBrushSize ** 2;
		//var xmin = Math.min(p[0],p[9]), xmax = Math.max(p[0],p[9]),
		//	ymin = Math.min(p[1],p[10]), ymax = Math.max(p[1],p[10]);
		var tempx,tempy,temp_dist2;

		console.log('updating plane selection')
		
		var data = view.data;
		var xPlotScale = view.xPlotScale;
		var yPlotScale = view.yPlotScale;
		for (var x in data){
			for (var y in data[x]){
				tempx = xPlotScale(parseFloat(x));
				tempy = yPlotScale(parseFloat(y));
				temp_dist2 = (tempx-location.x)**2 + (tempy-location.y)**2 
				if (temp_dist2 < radius2){
					data[x][y].selected = true;
				}
				// else { data[x][y].selected = false;}
			}
		}
		updateSelectionFromHeatmap(view);							
	}	
	updateAllPlots(views);
}


function updatePointSelection(view){
	console.log(view.INTERSECTED)
	if (view.INTERSECTED != null) {
		console.log('updatePointSelection')
		var x = view.heatmapInformation[view.INTERSECTED].heatmapX;
		var y = view.heatmapInformation[view.INTERSECTED].heatmapY;
		var data = view.data;
		data[x][y].selected = true;
		updateSelectionFromHeatmap(view);
	}
	updateAllPlots();
}

function applyPlaneSelection(view, mouseHold) {
	var tempPlane = view.currentSelectionPlane;
	//var temp = view.scene.getObjectByName('selectionPlane');
	//console.log(mouseHold)
	if (mouseHold) {
		if (tempPlane != null){
			updatePlane(view,tempPlane);
		}
		else {
			spawnPlane(view);
		}
	}
}

function applyBrushSelection(view, mouseHold){
	//updateBrushSelection(view, mouseHold);
	var tempBrush = view.currentSelectionBrush;
	if (mouseHold) {
		if (tempBrush != null){
			updateBrush(view,tempBrush);
		}
		else {
			spawnBrush(view);
		}
	}
}

export function selectionControl(views, view, mouseHold){

	if (view.options.planeSelection){
		applyPlaneSelection(view, mouseHold);
	}

	if (view.options.brushSelection){
		applyBrushSelection(view, mouseHold);
		updateBrushSelection(views,view);
	}
}
/*
function processClick() {
	if ( clickRequest ) {
		var view = activeView;
		if (view.viewType == '2DHeatmap'){
			//console.log(continuousSelection, planeSelection, pointSelection)
			if (continuousSelection == false ){
				if (planeSelection == true || pointSelection == true){
					console.log('deselect')
					deselectAll();
					updateAllPlots();
					continuousSelection = true;
				}
			}
			

			if (planeSelection){
				var temp = view.scene.getObjectByName('selectionPlane');
				if (temp != null){
					updatePlane(view,temp);
				}
				else {
					spawnPlane(view);
				}
			}

			if (pointSelection){
				updatePointSelection(view);
			}
		}
	}

}*/

export function clickHeatmap(view, views){

	if (view.INTERSECTED != null){
		// console.log('currently heatmap point under mouse', view.highlightedIndexList)
		//currently heatmap point under mouse
		var indexInList = view.highlightedIndexList.indexOf(view.INTERSECTED);
		var heatmapX = view.heatmapInformation[view.INTERSECTED].heatmapX;
		var heatmapY = view.heatmapInformation[view.INTERSECTED].heatmapY;
		if ( indexInList > -1){
			console.log('was highlighted')
			// was highlighted
			//if (areAllHighlighted(view.data[heatmapX][heatmapY].list)) {
			if (areAllTrue(view.IntersectState)) {
				console.log('all are selected, thus unhighlight all')
				// all are selected, thus unhighlight all
				unhighlightHeatmapPoints(view.INTERSECTED, view);
				console.log(view.highlightedIndexList)
				view.highlightedIndexList.splice(indexInList, 1);
				view.IntersectState = null;
				clickUpdateAll2DHeatmaps(views);
				console.log(view.highlightedIndexList)
				return false;
			} else {
				// console.log('not all are selected, select all')
				// not all are selected, select all
				view.data[heatmapX][heatmapY].highlighted = true;
				highlightAll(view.data[heatmapX][heatmapY].list);
				view.IntersectState = null;
				clickUpdateAll2DHeatmaps(views);
				return true;
			}
		} else {
			// console.log('not in list, add to list')
			// not yet highlighted
			highlightAll(view.data[heatmapX][heatmapY].list)
			view.data[heatmapX][heatmapY].highlighted = true;
			view.highlightedIndexList.push(view.INTERSECTED);
			clickUpdateAll2DHeatmaps(views);
			return false;
		}
	} else {
		// console.log('currently No heatmap point under mouse')
		// currently no heatmap point under mouse
		unhighlightAll(views);
		return true;
		
	}
}



export function hoverHeatmap(view, mouseEvent){
	var mouse = new THREE.Vector2();
	mouse.set(	(((mouseEvent.clientX-view.windowLeft)/(view.windowWidth)) * 2 - 1),
				(-((mouseEvent.clientY-view.windowTop)/(view.windowHeight)) * 2 + 1));
	view.raycaster.params.Points.threshold = view.options.pointCloudSize / 4;
	view.raycaster.setFromCamera( mouse.clone(), view.camera );
	var intersects = view.raycaster.intersectObject( view.heatmapPlot );
	if ( intersects.length > 0 ) {
		// has intersection
		if ( view.INTERSECTED != intersects[ 0 ].index ) {
			// changed intersection
			if (view.INTERSECTED != null ){
				// previously has intersection,
				if (view.highlightedIndexList.indexOf(view.INTERSECTED) == -1) {
					// previously hovered was not in highlight list, unhighlight all;
					unhighlightHeatmapPoints(view.INTERSECTED, view);
				} else {
					// previously hovered was in highlight list, back to its original state
					var heatmapX = view.heatmapInformation[view.INTERSECTED].heatmapX;
					var heatmapY = view.heatmapInformation[view.INTERSECTED].heatmapY;
					// console.log('calling restore 1', view.IntersectState);
					if (view.IntersectState){
						restoreState(view.data[heatmapX][heatmapY].list, view.IntersectState);
						view.IntersectState = null;
					} /*else {
						unhighlightHeatmapPoints(view.INTERSECTED, view);
					}*/
				}
			} 
			// current intersection
			view.INTERSECTED = intersects[ 0 ].index;
			var heatmapX = view.heatmapInformation[view.INTERSECTED].heatmapX;
			var heatmapY = view.heatmapInformation[view.INTERSECTED].heatmapY;
			if (view.highlightedIndexList.indexOf(view.INTERSECTED) > -1) {
				// if current intersection in highlight list, store current state, and highlight all
				view.IntersectState = getCurrentState(view.data[heatmapX][heatmapY].list);
				highlightHeatmapPoints(view.INTERSECTED, view);
			} else {
				// current  intersection not in highlight list, just highlight all;
				highlightHeatmapPoints(view.INTERSECTED, view);
			}
			
			updateHeatmapTooltip(view)
			return true;
		} else {
			//same intersection as before, nothing to do;
			updateHeatmapTooltip(view)
			return false;
		}
		
	}
	else {
		// no intersection
		if (view.INTERSECTED != null ){
			// console.log('hover, previously has interaction')
			// previously has intersection,
			if (view.highlightedIndexList.indexOf(view.INTERSECTED) == -1) {
				// previously hovered was not in highlight list, unhighlight all;
				unhighlightHeatmapPoints(view.INTERSECTED, view);
			} else {
				// previously hovered was in highlight list, back to its original state
				var heatmapX = view.heatmapInformation[view.INTERSECTED].heatmapX;
				var heatmapY = view.heatmapInformation[view.INTERSECTED].heatmapY;
				// console.log('calling restore 2', view.IntersectState);
				if (view.IntersectState){
					restoreState(view.data[heatmapX][heatmapY].list, view.IntersectState);
					view.IntersectState = null;
				} /*else {
					unhighlightHeatmapPoints(view.INTERSECTED, view);
				}*/
				
			}
			view.INTERSECTED = null;
			updateHeatmapTooltip(view);
			return true;
		} else {
			updateHeatmapTooltip(view);
			return false;
		}
		
	}
}

export function highlightVia2DHeatmap(heatmapPointIndex, twoDPlot) {
	var heatmapX = twoDPlot.heatmapInformation[heatmapPointIndex].heatmapX;
	var heatmapY = twoDPlot.heatmapInformation[heatmapPointIndex].heatmapY;
	if (twoDPlot.highlightedIndexList.indexOf(heatmapPointIndex) > -1) {
		// if current intersection in highlight list, store current state, and highlight all
		twoDPlot.IntersectState = getCurrentState(twoDPlot.data[heatmapX][heatmapY].list);
		highlightHeatmapPoints(heatmapPointIndex, twoDPlot);
	} else {
		// current  intersection not in highlight list, just highlight all;
		highlightHeatmapPoints(heatmapPointIndex, twoDPlot);
	}
}

export function unhighlightVia2DHeatmap(heatmapPointIndex, twoDPlot) {
	var heatmapX = twoDPlot.heatmapInformation[heatmapPointIndex].heatmapX;
	var heatmapY = twoDPlot.heatmapInformation[heatmapPointIndex].heatmapY;
	if (twoDPlot.highlightedIndexList.indexOf(heatmapPointIndex) == -1) {
		// previously hovered was not in highlight list, unhighlight all;
		unhighlightHeatmapPoints(heatmapPointIndex, twoDPlot);
	} else {
		// previously hovered was in highlight list, back to its original state
		if (twoDPlot.IntersectState){
			restoreState(twoDPlot.data[heatmapX][heatmapY].list, twoDPlot.IntersectState);
			twoDPlot.IntersectState = null;
		}
		// restoreState(twoDPlot.data[heatmapX][heatmapY].list, twoDPlot.IntersectState);
		// twoDPlot.IntersectState = null;
	}
}


export function clickUpdateVia2DHeatmap(heatmapPointIndex, twoDPlot, views) {
	var indexInList = twoDPlot.highlightedIndexList.indexOf(heatmapPointIndex);
	var heatmapX = twoDPlot.heatmapInformation[heatmapPointIndex].heatmapX;
	var heatmapY = twoDPlot.heatmapInformation[heatmapPointIndex].heatmapY;

	if ( indexInList > -1){
		console.log('was highlighted')
		// was highlighted
		//if (areAllHighlighted(view.data[heatmapX][heatmapY].list)) {
		if (areAllTrue(twoDPlot.IntersectState)) {
			console.log('all are selected, thus unhighlight all')
			// all are selected, thus unhighlight all
			unhighlightHeatmapPoints(heatmapPointIndex, twoDPlot);
			console.log(twoDPlot.highlightedIndexList)
			twoDPlot.highlightedIndexList.splice(indexInList, 1);
			twoDPlot.IntersectState = null;
			clickUpdateAll2DHeatmaps(views);
			console.log(twoDPlot.highlightedIndexList)
		} else {
			// console.log('not all are selected, select all')
			// not all are selected, select all
			twoDPlot.data[heatmapX][heatmapY].highlighted = true;
			highlightHeatmapPoints(heatmapPointIndex, twoDPlot)
			// highlightAll(twoDPlot.data[heatmapX][heatmapY].list);
			twoDPlot.IntersectState = null;
			clickUpdateAll2DHeatmaps(views);
		}
	} else {
		console.log('not in list, add to list');
		// not yet highlighted
		highlightHeatmapPoints(heatmapPointIndex, twoDPlot)
		// highlightAll(twoDPlot.data[heatmapX][heatmapY].list)
		twoDPlot.data[heatmapX][heatmapY].highlighted = true;
		twoDPlot.highlightedIndexList.push(heatmapPointIndex);
		clickUpdateAll2DHeatmaps(views);
	}



/*	if ( indexInList > -1){
		// was highlighted
		if (areAllHighlighted(twoDPlot.data[heatmapX][heatmapY].list)) {
			// all are selected, thus unhighlight all
			twoDPlot.highlightedIndexList.splice(indexInList, 1);
			clickUpdateAll2DHeatmaps(views);
		} else {
			// not all are selected, select all
			highlightAll(twoDPlot.data[heatmapX][heatmapY].list)
			clickUpdateAll2DHeatmaps(views);
		}
	} else {
		// console.log('not in list, add to list')
		// not yet highlighted
		twoDPlot.highlightedIndexList.push(heatmapPointIndex);
		clickUpdateAll2DHeatmaps(views);
	}
*/


	/*var heatmapX = twoDPlot.heatmapInformation[heatmapPointIndex].heatmapX;
	var heatmapY = twoDPlot.heatmapInformation[heatmapPointIndex].heatmapY;
	if (twoDPlot.highlightedIndexList.indexOf(heatmapPointIndex) == -1) {
		// previously hovered was not in highlight list, unhighlight all;
		unhighlightHeatmapPoints(heatmapPointIndex, twoDPlot);
	} else {
		// previously hovered was in highlight list, back to its original state
		if (twoDPlot.IntersectState){
			restoreState(twoDPlot.data[heatmapX][heatmapY].list, twoDPlot.IntersectState);
			twoDPlot.IntersectState = null;
		}
		// restoreState(twoDPlot.data[heatmapX][heatmapY].list, twoDPlot.IntersectState);
		// twoDPlot.IntersectState = null;
	}*/
}

function getCurrentState(list) {
	var result = [];
	for (var i = 0; i < list.length; i++) {
		result.push(list[i].highlighted);
	}
	return result;
}

function restoreState(list, state) {

	for (var i = 0; i < list.length; i++) {
		list[i].highlighted = state[i];
	}
}

function highlightHeatmapPoints(index, view) {
	var heatmapX = view.heatmapInformation[index].heatmapX;
	var heatmapY = view.heatmapInformation[index].heatmapY;

	var dataset = view.data[heatmapX][heatmapY];
	//dataset.highlighted = true;

	dataset.list.forEach(datapoint => {
		datapoint.highlighted = true;
	});
}

function unhighlightHeatmapPoints(index, view) {
	var heatmapX = view.heatmapInformation[index].heatmapX;
	var heatmapY = view.heatmapInformation[index].heatmapY;
	
	var dataset = view.data[heatmapX][heatmapY];
	//dataset.highlighted = false;

	dataset.list.forEach(datapoint => {
		datapoint.highlighted = false;
	});
}

export function unhighlightAll(views) {
	for ( var ii = 0; ii < views.length; ++ii ){
		var view = views[ii];
		if (view.viewType == "3DView") {
			if (view.systemMoleculeDataBoolean ) {
				view.systemMoleculeData.forEach(datapoint => {
					datapoint.highlighted = false;
				});
			}

			if (view.systemSpatiallyResolvedDataBoolean) {
				view.systemSpatiallyResolvedData.forEach(datapoint => {
					datapoint.highlighted = false;
				});
			}

		} else if (view.viewType == "2DHeatmap"){
			if (view.options.plotType == "Heatmap" && typeof view.heatmapPlot != "undefined"){
				view.highlightedIndexList = [];
				for (var x in view.data){
					for (var y in view.data[x]){
						view.data[x][y].highlighted = false;
					}
				}
			}
		}
	}
}

/* export function clickHighlightOther2DHeatmaps(currentViewID, views) {
	for ( var ii = 0; ii < views.length; ++ii ){
		var view = views[ii];
		if (view.viewType == "2DHeatmap" &&
			view.options.plotType == "Heatmap" &&
			typeof view.heatmapPlot != "undefined" &&
			view.options.plotID != currentViewID
			){
			var i = 0;
			for (var x in view.data){
				for (var y in view.data[x]){
					for (var datapoint in view.data[x][y].list) {
						if (datapoint.highlighted){
							view.data[x][y].highlighted = true;
							if (view.highlightedIndexList.indexOf(i) == -1) {view.highlightedIndexList.push(i);}
							break;
						}
					}
					i++;
				}
			}
		}
	}
} */

export function deselectHighlightedSpatiallyResolvedData(views, overallSpatiallyResolvedData){
	for (var i=0; i<overallSpatiallyResolvedData.length; i++){
		if (overallSpatiallyResolvedData[i].highlighted == false){overallSpatiallyResolvedData[i].selected = false};
		overallSpatiallyResolvedData[i].highlighted = false;
	}
	clickUpdateAll2DHeatmaps(views);
	// updateAllPlots(views);
}

export function selectHighlightedSpatiallyResolvedData(views, overallSpatiallyResolvedData){
	for (var i=0; i<overallSpatiallyResolvedData.length; i++){
		if (overallSpatiallyResolvedData[i].highlighted){overallSpatiallyResolvedData[i].selected = true};
		overallSpatiallyResolvedData[i].highlighted = false;
	}
	clickUpdateAll2DHeatmaps(views);
	// updateAllPlots(views);
}

export function deselectHighlightedMoleculeData(views, overallMoleculeData){
	for (var i=0; i<overallMoleculeData.length; i++){
		if (overallMoleculeData[i].highlighted == false){overallMoleculeData[i].selected = false};
		overallMoleculeData[i].highlighted = false;
	}
	clickUpdateAll2DHeatmaps(views);
	// updateAllPlots(views);
}

export function selectHighlightedMoleculeData(views, overallMoleculeData){
	for (var i=0; i<overallMoleculeData.length; i++){
		if (overallMoleculeData[i].highlighted){overallMoleculeData[i].selected = true};
		overallMoleculeData[i].highlighted = false;
	}
	clickUpdateAll2DHeatmaps(views);
	// updateAllPlots(views);
}


export function clickUpdateAll2DHeatmaps(views) {
	for ( var ii = 0; ii < views.length; ++ii ){
		var view = views[ii];
		if (view.viewType == "2DHeatmap" &&
			view.options.plotType == "Heatmap" &&
			typeof view.heatmapPlot != "undefined"
			){
			var i = 0;
			for (var x in view.data){
				for (var y in view.data[x]){
					var highlightedFound = isAnyHighlighted(view.data[x][y].list)
					if (highlightedFound) {
						view.data[x][y].highlighted = true;
						if (view.highlightedIndexList.indexOf(i) == -1) {
							view.highlightedIndexList.push(i);
						}
					} else {
						view.data[x][y].highlighted = false;
						var indexInList = view.highlightedIndexList.indexOf(i);
						if ( indexInList != -1) {
							view.highlightedIndexList.splice(i,1);
						}
					}
					
					i++;
				}
			}
		}
	}
}

function isAnyHighlighted(list){
	for (var i = 0; i < list.length; i++) {
		if (list[i].highlighted){ return true; }
	}
	return false;
}
//function findListHighlighted(list) {
	
function highlightAll(list) {
	for (var i = 0; i < list.length; i++) {
		list[i].highlighted = true;
	}
}
function areAllHighlighted(list) {
	for (var i = 0; i < list.length; i++) {
		if (list[i].highlighted == false){ 
			return false;
		}
	}
	return true;
}

function areAllTrue(list) {
	for (var i = 0; i < list.length; i++) {
		if (list[i] == false){
			return false;
		}
	}
	return true;
}

/* export function clickUnhighlightOther2DHeatmaps(currentViewID, views) {
	for ( var ii = 0; ii < views.length; ++ii ){
		var view = views[ii];
		if (view.viewType == "2DHeatmap" &&
			view.options.plotType == "Heatmap" &&
			typeof view.heatmapPlot != "undefined" &&
			view.options.plotID != currentViewID
			){
			var i = 0;
			for (var x in view.data){
				for (var y in view.data[x]){
					for (var datapoint in view.data[x][y].list) {
						if (datapoint.highlighted){
							view.data[x][y].highlighted = true;
							
							break;
						}
					}
					i++;
				}
			}
		}
	}
} */


