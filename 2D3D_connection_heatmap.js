import {initializeViewSetups} from "./MultiviewControl/initializeViewSetups.js";
//import {views} from "./view_setup.js";

import {arrangeDataToHeatmap, getHeatmap, updateHeatmap, replotHeatmap} from "./2DHeatmaps/HeatmapView.js";
import {getPointCloudGeometry, updatePointCloudGeometry, changePointCloudGeometry} from "./3DViews/PointCloud_selection.js";
import {readCSV,readCSV2/*, readViewsSetup*/} from "./Utilities/readDataFile.js";

import {setupOptionBox3DView} from "./3DViews/setupOptionBox3DView.js";
import {setupOptionBox2DHeatmap} from "./2DHeatmaps/setupOptionBox2DHeatmap.js";

import {setupViewCameraSceneController } from "./MultiviewControl/setupViewBasic.js";
import {addOptionBox, updateOptionBoxLocation, showHideAllOptionBoxes } from "./MultiviewControl/optionBoxControl.js";
import {setupHUD} from "./MultiviewControl/HUDControl.js";
import {updateController} from "./MultiviewControl/controllerControl.js";
import {getAxis} from "./2DHeatmaps/Utilities.js";
import {initializeHeatmapToolTip,updateHeatmapTooltip} from "./2DHeatmaps/tooltip.js";

import {fullscreenOneView} from "./MultiviewControl/calculateViewportSizes.js";

import {insertLegend, removeLegend, changeLegend} from "./MultiviewControl/colorLegend.js";


var uploader = document.getElementById("uploader");
var uploader_wrapper = document.getElementById("uploader_wrapper");

uploader.addEventListener("change", handleFiles, false);

function handleFiles() {
    var file = this.files[0];
    console.log(file);
    $.ajax({
    	url: file.name,
    	dataType: 'json',
    	type: 'get',
    	cache: false,
    	success: function(data) {
    		console.log('loading setup');
    		var views = data.views;
    		var plotSetup = data.plotSetup;
    		uploader.parentNode.removeChild(uploader);
    		uploader_wrapper.parentNode.removeChild(uploader_wrapper);
    		main(views,plotSetup);
    	},
    	error: function(requestObject, error, errorThrown) {
            alert(error);
            alert(errorThrown);
        }
    })
}


function main(views,plotSetup) {

	if ( ! Detector.webgl ) Detector.addGetWebGLMessage();
	var container, stats, renderer;
	var selectionPlaneMaterial = new THREE.MeshBasicMaterial( {  color: 0xffffff, opacity: 0.5,transparent: true, side: THREE.DoubleSide,needsUpdate : true } );
	var mouseX = 0, mouseY = 0;
	var windowWidth, windowHeight;
	var clickRequest = false;
	var mouseHold = false;
	var planeSelection = false;

	var showOptionBoxesBool = true;

	initializeViewSetups(views);

	var unfilteredData = [];
	var queue=d3.queue();

	for (var ii =  0; ii < views.length; ++ii ) {
		var view = views[ii];
		if (view.viewType == '3DView'){
			//queue.defer(readCSV,view,unfilteredData);
			queue.defer(readCSV2,view,unfilteredData,plotSetup);
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

		renderer.autoClear = false;
		container.appendChild( renderer.domElement );

		for (var ii =  0; ii < views.length; ++ii ) {
			var view = views[ii];

			view.unfilteredData = unfilteredData;

			setupViewCameraSceneController(view,renderer);
			addOptionBox(view);
			setupHUD(view);

			if (view.viewType == '3DView'){
				
				getPointCloudGeometry(view);
				setupOptionBox3DView(view);
				insertLegend(view);
			}
			if (view.viewType == '2DHeatmap'){
				view.controller.enableRotate=false;
				initializeHeatmapToolTip(view);
				setupOptionBox2DHeatmap(view);
				getAxis(view);

				arrangeDataToHeatmap(view,unfilteredData)
				getHeatmap(view);
				insertLegend(view);
				
			}

		}
		
		
		stats = new Stats();
		container.appendChild( stats.dom );
		document.addEventListener( 'mousemove', onDocumentMouseMove, false );
		window.addEventListener( 'mousedown', function( event ) {
			mouseHold = true;
			if (event.button == 0){
				clickRequest = true;
			}
		}, false );
		window.addEventListener( 'mouseup', function( event ) {
			mouseHold = false;
			if (event.button == 0){
				clickRequest = false;
				if (planeSelection){
					planeSelection = false;
					for ( var ii = 0; ii < views.length; ++ii ){
						var view = views[ii];
						if (view.viewType == "2DHeatmap"){
							var temp = view.scene.getObjectByName('selectionPlane');
							if (temp != null){
								updateSelection();
								view.scene.remove(temp);
								
							} 
						}
					}
				}
			}
		}, false );

		
		window.addEventListener( 'dblclick', function( event ) {
			/*for ( var ii = 0; ii < views.length; ++ii ){
				var view = views[ii];
				if (view.viewType == "2DHeatmap"){
					var temp = view.scene.getObjectByName('selectionPlane');
					if (temp != null){
						view.scene.remove(temp);
					} 
				}
			}*/
			deselectAll();
			updateAllPlots();
		}, false );

		window.addEventListener( "keydown", onKeyDown, true);
		
	}




	function onKeyDown(e){
		if (e.keyCode == 72) {showHideAllOptionBoxes(views,showOptionBoxesBool); showOptionBoxesBool = !showOptionBoxesBool;}
		if (e.keyCode == 70) {
			for (var ii =  0; ii < views.length; ++ii ) {
				var view = views[ii];
				if (view.controllerEnabled) {view.options.toggleFullscreen.call();}
			}
		}
		if (e.keyCode == 76) {
			for (var ii =  0; ii < views.length; ++ii ) {
				var view = views[ii];
				if (view.controllerEnabled) {view.options.toggleLegend.call();}
			}
		}
		if (e.keyCode == 49) {
			planeSelection = true;
		}
	}


	function onDocumentMouseMove( event ) {
		mouseX = event.clientX;
		mouseY = event.clientY;
		if (mouseHold == false){updateController(views, windowWidth, windowHeight, mouseX, mouseY);}
		
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
				if (view.viewType == "2DHeatmap"){updateHeatmapTooltip(view);}
			}
		}
	}
	function updateSize() {
		if ( windowWidth != window.innerWidth || windowHeight != window.innerHeight) {
			windowWidth  = window.innerWidth;
			windowHeight = window.innerHeight;
			renderer.setSize ( windowWidth, windowHeight );

			for ( var ii = 0; ii < views.length; ++ii ){
				var view = views[ii];
				if (view.viewType == "2DHeatmap") {
					
					var left   = Math.floor( windowWidth  * view.left );
					var top    = Math.floor( windowHeight * view.top );
					var width  = Math.floor( windowWidth  * view.width );
					var height = Math.floor( windowHeight * view.height );

					view.windowLeft = left;
					view.windowTop = top;
					view.windowWidth = width;
					view.windowHeight = height;

				}
			}

			updateOptionBoxLocation(views);
		}
	}
	function animate() {
		render();
		processClick();
		stats.update();
		requestAnimationFrame( animate );
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

			renderer.setViewport( left, top, width, height );
			renderer.setScissor( left, top, width, height );
			renderer.setScissorTest( true );
			renderer.setClearColor( 0xffffff, 1 ); // border color
			renderer.clearColor(); // clear color buffer
			renderer.setClearColor( view.background );
			//if (view.controllerEnabled) {renderer.setClearColor( view.controllerEnabledBackground );}
			//else {renderer.setClearColor( view.background );}
			camera.aspect = width / height;
			camera.updateProjectionMatrix();
			renderer.clear();
			renderer.render( view.scene, camera );
			renderer.render( view.sceneHUD, view.cameraHUD );
		}
	}




	function spawnPlane(view){
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
		scene.add( selectionPlane );
		//updateSelection();
		
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

	function deselectAll(){
		for (var i=0; i<unfilteredData.length; i++){
				unfilteredData[i].selected = true;
			}
	}

	function updateAllPlots(){
		for (var ii =  0; ii < views.length; ++ii ) {
			var view = views[ii];
			if (view.viewType == '2DHeatmap'){
				updateHeatmap(view);
			}
		}
		
		for (var ii =  0; ii < views.length; ++ii ) {
			var view = views[ii];
			if (view.viewType == '3DView'){
				updatePointCloudGeometry(view);
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

					console.log('updating selection')
					
					var data = temp_view.data
					for (var x in data){
						for (var y in data[x]){
							tempx = parseFloat(x)-50;
							tempy = parseFloat(y)-50;
							if (tempx>xmin && tempx<xmax && tempy>ymin && tempy<ymax){
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
			deselectAll();
		}
		updateAllPlots();
		/*if(noSelection){
			console.log('no selection')
			for (var i=0; i<unfilteredData.length; i++){
				unfilteredData[i].selected = true;
			}
		}
		
		for (var ii =  0; ii < views.length; ++ii ) {
			var view = views[ii];
			if (view.viewType == '2DHeatmap'){
				updateHeatmap(view);
			}
		}
		
		
		for (var ii =  0; ii < views.length; ++ii ) {
			var view = views[ii];
			if (view.viewType == '3DView'){
				updatePointCloudGeometry(view);
			}
		}*/


	}

	function processClick() {
		if ( clickRequest && planeSelection ) {
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
}