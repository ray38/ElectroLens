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



export function updatePlaneSelection(views,temp_view) {
	//var tempSelectionPlane = temp_view.scene.getObjectByName('selectionPlane');
	var tempSelectionPlane = temp_view.currentSelectionPlane;
	//console.log(tempSelectionPlane)
	if (tempSelectionPlane != null){
		var p = tempSelectionPlane.geometry.attributes.position.array;
		var xmin = Math.min(p[0],p[9]), xmax = Math.max(p[0],p[9]),
			ymin = Math.min(p[1],p[10]), ymax = Math.max(p[1],p[10]);
		var tempx,tempy;

		console.log('updating plane selection')
		
		var data = temp_view.data;
		var xPlotScale = temp_view.xPlotScale;
		var yPlotScale = temp_view.yPlotScale;
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
		updateSelectionFromHeatmap(temp_view);							
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
	var temp = view.currentSelectionPlane;
	//var temp = view.scene.getObjectByName('selectionPlane');
	console.log(mouseHold)
	if (mouseHold) {
		if (temp != null){
			updatePlane(view,temp);
		}
		else {
			spawnPlane(view);
		}
	}
}

function applyPointSelection(view){
	updatePointSelection(view);
}

export function selectionControl(view, mouseHold){

	if (view.options.planeSelection){
		applyPlaneSelection(view, mouseHold);
	}

	if (view.options.pointSelection){
		applyPointSelection(view);
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