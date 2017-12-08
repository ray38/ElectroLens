import {initializeViewSetups} from "./MultiviewControl/initializeViewSetups.js";
import {views} from "./view_setup.js";

import {arrangeDataToHeatmap, getHeatmap, updateHeatmap, replotHeatmap} from "./2DHeatmaps/HeatmapView.js";
import {getPointCloudGeometry, updatePointCloudGeometry, changePointCloudGeometry} from "./3DViews/PointCloud_selection.js";
import {readCSV} from "./Utilities/readDataFile.js";

import {setupOptionBox3DView} from "./3DViews/setupOptionBox3DView.js";
import {setupOptionBox2DHeatmap} from "./2DHeatmaps/setupOptionBox2DHeatmap.js";


import {setupViewCameraSceneController } from "./MultiviewControl/setupViewBasic.js";
import {addHeatmapToolTip, getAxis} from "./2DHeatmaps/Utilities.js";

if ( ! Detector.webgl ) Detector.addGetWebGLMessage();
var container, stats;
var renderer;
var selectionPlaneMaterial = new THREE.MeshBasicMaterial( {  color: 0xffffff, opacity: 0.5,transparent: true, side: THREE.DoubleSide,needsUpdate : true } );
var mouseX = 0, mouseY = 0;
var windowWidth, windowHeight;
var mousePosition;
var clickRequest = false;
var mouseHold = false;

var heightScale = 2., widthScale = 1.;


initializeViewSetups(views);
console.log(views)


var unfilteredData = [];
var num = 0;
var queue=d3.queue();

for (var ii =  0; ii < views.length; ++ii ) {
	var view = views[ii];
	if (view.viewType == '3DView'){
		queue.defer(readCSV,view,view.dataFilename,unfilteredData,num);
	}			
}


queue.awaitAll(function(error) {
	if (error) throw error;
	init();
	animate();
});



function init() {
	console.log('started initialization')
	container = document.getElementById( 'container' );
	renderer = new THREE.WebGLRenderer( { antialias: true } );
	renderer.setPixelRatio( window.devicePixelRatio );
	renderer.setSize( window.innerWidth , window.innerHeight*2);
	container.appendChild( renderer.domElement );
	
	
	

	for (var ii =  0; ii < views.length; ++ii ) {
		var view = views[ii];

		setupViewCameraSceneController(view,renderer);
		addOptionBox(view);

		if (view.viewType == '3DView'){
			getPointCloudGeometry(view);
			setupOptionBox3DView(view);
		}
		if (view.viewType == '2DHeatmap'){
			view.controller.enableRotate=false;
			var tempRaycaster = new THREE.Raycaster();
			view.raycaster = tempRaycaster;
			view.INTERSECTED = null;
			addHeatmapToolTip(view);
			setupOptionBox2DHeatmap(view);
			getAxis(view);

			arrangeDataToHeatmap(view,unfilteredData)
			getHeatmap(view);
			
		}

	}
	
	
	stats = new Stats();
	container.appendChild( stats.dom );
	document.addEventListener( 'mousemove', onDocumentMouseMove, false );
	//var mouseHold = false;
	window.addEventListener( 'mousedown', function( event ) {
		mouseHold = true;
		console.log(mouseHold);
		if (event.button == 0){
			clickRequest = true;
		}
	}, false );
	window.addEventListener( 'mouseup', function( event ) {
		mouseHold = false;
		console.log(mouseHold);
		if (event.button == 0){
			clickRequest = false;
		}
	}, false );

	
	window.addEventListener( 'dblclick', function( event ) {
		//console.log(event.button);
		//if (event.button == 2 ){
			for ( var ii = 0; ii < views.length; ++ii ){
				var view = views[ii];
				if (view.viewType == "2DHeatmap"){
					var temp = view.scene.getObjectByName('selectionPlane');
					if (temp != null){
						view.scene.remove(temp);
						updateSelection();
				
					} 
				}
			}
		//}
	}, false );
	
}




function addOptionBox(view){
	var tempGuiContainer = document.createElement('div');
		
	tempGuiContainer.style.position = 'absolute';
	tempGuiContainer.style.top = view.windowTop + 'px';
	tempGuiContainer.style.left = view.windowLeft + 'px';
	document.body.appendChild(tempGuiContainer);
	var tempGui = new dat.GUI( { autoPlace: false } );
	view.guiContainer = tempGuiContainer;
	view.gui = tempGui;

	tempGuiContainer.appendChild(tempGui.domElement);

}


function onDocumentMouseMove( event ) {
	mouseX = event.clientX;
	mouseY = event.clientY;
	if (mouseHold == false){updateController();}
	//updateController();
	
	for ( var ii = 0; ii < views.length; ++ii ){
		var view = views[ii];
		if (view.controllerEnabled){
			var left   = Math.floor( windowWidth  * view.left );
			var top    = Math.floor( windowHeight * view.top );
			var width  = Math.floor( windowWidth  * view.width ) + left;
			var height = Math.floor( windowHeight * view.height ) + top;
			var vector = new THREE.Vector3();
		
			vector.set(	(((event.clientX-left)/(width-left)) * 2 - 1),
					(-((event.clientY-top)/(height-top)) * 2 + 1),
					0.1);
			vector.unproject( view.camera );
			var dir = vector.sub( view.camera.position ).normalize();
			var distance = - view.camera.position.z/dir.z;
			view.mousePosition = view.camera.position.clone().add( dir.multiplyScalar( distance ) );
			if (view.viewType == "2DHeatmap"){updateInteractiveHeatmap(view);}
		}
	}
}
function updateSize() {
	if ( windowWidth != window.innerWidth || windowHeight != window.innerHeight) {
		windowWidth  = window.innerWidth;
		windowHeight = window.innerHeight;
		renderer.setSize ( windowWidth, windowHeight*2 );

		for ( var ii = 0; ii < views.length; ++ii ){
			var view = views[ii];
			view.guiContainer.style.top = view.windowTop + 'px';
			view.guiContainer.style.left = view.windowLeft + 'px';
			if (view.viewType == "2DHeatmap") {
				
				var left   = Math.floor( windowWidth  * view.left );
				var top    = Math.floor( windowHeight * view.top );
				var width  = Math.floor( windowWidth  * view.width );
				var height = Math.floor( windowHeight * view.height );

				view.windowLeft = left;
				view.windowTop = top;
				view.windowWidth = width;
				view.windowHeight = height;

				//view.title.style.top = view.windowTop + 'px';
				//view.title.style.left = view.windowLeft + 'px';

				
			}
		}
	}
}
function animate() {
	render();
	processClick();
	stats.update();
	requestAnimationFrame( animate );
}

function updateController(){
	for ( var ii = 0; ii < views.length; ++ii ){
		var view = views[ii];
		var left   = Math.floor( windowWidth  * view.left );
		var top    = Math.floor( windowHeight * view.top );
		var width  = Math.floor( windowWidth  * view.width );
		var height = Math.floor( windowHeight * view.height );
		
		if (mouseX > left && mouseX < (left + width) && mouseY > top && mouseY <top + height){
			enableController(view, view.controller);
		}
		else{
			disableController(view,view.controller);
		}
	}
}

function enableController(view, controller){
	view.controllerEnabled = true;
	controller.enableZoom = view.controllerZoom;
	controller.enablePan  = view.controllerPan;
	controller.enableRotate = view.controllerRotate;
}
function disableController(view, controller){
	view.controllerEnabled = false;
	controller.enableZoom = false;
	controller.enablePan  = false;
	controller.enableRotate = false;
}


function updateInteractiveHeatmap(view){
	var left   = Math.floor( windowWidth  * view.left );
	var top    = Math.floor( windowHeight * view.top );
	var width  = Math.floor( windowWidth  * view.width ) + left;
	var height = Math.floor( windowHeight * view.height ) + top;
	var mouse = new THREE.Vector2();
		
	mouse.set(	(((event.clientX-left)/(width-left)) * 2 - 1),
					(-((event.clientY-top)/(height-top)) * 2 + 1));


	view.raycaster.setFromCamera( mouse.clone(), view.camera );
	var intersects = view.raycaster.intersectObject( view.System );
	if ( intersects.length > 0 ) {
		//console.log("found intersect")
		
		view.tooltip.style.top = event.clientY + 5  + 'px';
		view.tooltip.style.left = event.clientX + 5  + 'px';

		var interesctIndex = intersects[ 0 ].index;
		view.tooltip.innerHTML = 	"x Range: " + view.heatmapInformation[interesctIndex].xStart + "--" + view.heatmapInformation[interesctIndex].xEnd  + '<br>' + 
									"y Range: " + view.heatmapInformation[interesctIndex].yStart + "--" + view.heatmapInformation[interesctIndex].yEnd  + '<br>' +
									"number of points: " + view.heatmapInformation[interesctIndex].numberDatapointsRepresented;

		view.System.geometry.attributes.size.array[ interesctIndex ]  = 3;
		view.System.geometry.attributes.size.needsUpdate = true;


		if ( view.INTERSECTED != intersects[ 0 ].index ) {
			view.System.geometry.attributes.size.array[ view.INTERSECTED ] = 1.5;
			view.INTERSECTED = intersects[ 0 ].index;
			view.System.geometry.attributes.size.array[ view.INTERSECTED ] = 3;
			view.System.geometry.attributes.size.needsUpdate = true;
		}

	}
	else {	view.tooltip.innerHTML = '';
			view.System.geometry.attributes.size.array[ view.INTERSECTED ] = 1.5;
	}
}

function render() {
	updateSize();
	for ( var ii = 0; ii < views.length; ++ii ) {
		var view = views[ii];
		var camera = view.camera;
		var left   = Math.floor( windowWidth  * view.left );
		var top    = Math.floor( windowHeight * view.top );
		var width  = Math.floor( windowWidth  * view.width );
		var height = Math.floor( windowHeight * view.height );

		view.windowLeft = left;
		view.windowTop = top;
		view.windowWidth = width;
		view.windowHeight = height;

		//view.title.style.top = view.windowTop + 'px';
		//view.title.style.left = view.windowLeft + 'px';

		renderer.setViewport( left, top, width, height );
		renderer.setScissor( left, top, width, height );
		renderer.setScissorTest( true );
		renderer.setClearColor( 0xffffff, 1 ); // border color
		renderer.clearColor(); // clear color buffer
		if (view.controllerEnabled) {renderer.setClearColor( view.controllerEnabledBackground );}
		else {renderer.setClearColor( view.background );}
		camera.aspect = width / height;
		camera.updateProjectionMatrix();
		//if (view.viewType == "2DHeatmap" && view.controllerEnabled){updateInteractiveHeatmap(view);}
		renderer.render( view.scene, camera );
	}
}




function spawnPlane(view){
	//console.log(views[1].controllerEnabled);
	for (var ii =  0; ii < views.length; ++ii ) {
		var temp_view = views[ii];
		if (temp_view.viewType == '2DHeatmap' && temp_view.controllerEnabled == false){
			var tempSelectionPlane = temp_view.scene.getObjectByName('selectionPlane');
			if (tempSelectionPlane != null){
				console.log('remove plane')
				temp_view.scene.remove(tempSelectionPlane);
			}					
		}
	}


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
	scene.add( selectionPlane );
	updateSelection();
}

function updatePlane(view, plane){
	var scene = view.scene;

	var mousePosition = view.mousePosition;
	
	var selectionPlane = new THREE.Mesh( new THREE.PlaneBufferGeometry( 1, 1), selectionPlaneMaterial );
	selectionPlane.geometry.attributes.position.needsUpdate = true;
	
	
	var pOriginal = plane.geometry.attributes.position.array;
	
	var 	originalFirstVerticesCoordx = pOriginal[0],
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
	scene.add( selectionPlane );
	updateSelection();
	
}

function updateSelectionFromHeatmap(view){
	var data = view.data;
	for (var x in data){
		for (var y in data[x]){
			if (data[x][y].selected) {
				for (var i = 0; i < data[x][y]['list'].length; i++) {
					data[x][y]['list'][i].selected = true;
				}
			}
			else {
				for (var i = 0; i < data[x][y]['list'].length; i++) {
					data[x][y]['list'][i].selected = false;
				}
			}
		}
	}
}

function updateSelection(){
	var noSelection = true;
	for (var ii =  0; ii < views.length; ++ii ) {
		var temp_view = views[ii];
		if (temp_view.viewType == '2DHeatmap'){
			var tempSelectionPlane = temp_view.scene.getObjectByName('selectionPlane');
			if (tempSelectionPlane != null){
				noSelection = false;
				var p = tempSelectionPlane.geometry.attributes.position.array;
				var xmin = Math.min(p[0],p[9]), xmax = Math.max(p[0],p[9]),
					ymin = Math.min(p[1],p[10]), ymax = Math.max(p[1],p[10]);
				var tempx,tempy;
				
				var data = temp_view.data
				for (var x in data){
					for (var y in data[x]){
						tempx = parseFloat(x)-50;
						tempy = parseFloat(y)-50;
						if (tempx>xmin && tempx<xmax && tempy>ymin && tempy<ymax){
							//console.log('true')
							data[x][y].selected = true;
						}
						else { data[x][y].selected = false;}
					}
				}
				updateSelectionFromHeatmap(temp_view);							
			}										
		}
	}
	
	
	if(noSelection){
		for (var i=0; i<unfilteredData.length; i++){
			unfilteredData[i].selected = true;
		}
	}
	
	for (var ii =  0; ii < views.length; ++ii ) {
		var view = views[ii];
		if (view.viewType == '2DHeatmap'){
			//updatePointCloud(view,unfilteredData.length);
			updateHeatmap(view);
		}
	}
	
	
	//updatePointCloudGeometry(options);
	for (var ii =  0; ii < views.length; ++ii ) {
		var view = views[ii];
		if (view.viewType == '3DView'){
			updatePointCloudGeometry(view);
		}
	}


}

function processClick() {
	if ( clickRequest ) {
		for (var ii =  0; ii < views.length; ++ii ) {
			var view = views[ii];
			if (view.viewType == '2DHeatmap' && view.controllerEnabled){
				var temp = view.scene.getObjectByName('selectionPlane');
				if (temp != null){
					updatePlane(view,temp);
				}
				else {
					spawnPlane(view);
				}
			}
		}
	}
}