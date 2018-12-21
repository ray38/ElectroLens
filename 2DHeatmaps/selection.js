import {heatmapsResetSelection, deselectAll, selectAll, updateAllPlots, updateSelectionFromHeatmap} from "./Selection/Utilities.js";

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
					data[x][y].selected = true;
				}
				else { data[x][y].selected = false;}
			}
		}
		updateSelectionFromHeatmap(view);							
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
				else { data[x][y].selected = false;}
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
		if (temp != null){
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