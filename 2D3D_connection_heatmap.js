import {initializeViewSetups} from "./MultiviewControl/initializeViewSetups.js";
import {initialize2DHeatmapSetup} from "./2DHeatmaps/initialize2DHeatmapSetup.js";
import {calculateViewportSizes} from "./MultiviewControl/calculateViewportSizes.js";

import {arrangeDataToHeatmap, getHeatmap, updateHeatmap, replotHeatmap} from "./2DHeatmaps/HeatmapView.js";
import {getPointCloudGeometry, updatePointCloudGeometry, changePointCloudGeometry,animatePointCloudGeometry} from "./3DViews/PointCloud_selection.js";
import {getMoleculeGeometry, updateLineBond} from "./3DViews/MoleculeView.js";
import {addSystemEdge} from "./3DViews/systemEdge.js";
import {initialize3DViewTooltip,update3DViewTooltip} from "./3DViews/tooltip.js";
import {readCSV,readCSVSpatiallyResolvedData,readCSVMoleculeData, processSpatiallyResolvedData,processMoleculeData/*,readCSVPapaparse, readViewsSetup*/} from "./Utilities/readDataFile.js";

import {setupOptionBox3DView} from "./3DViews/setupOptionBox3DView.js";
import {setupOptionBox2DHeatmap} from "./2DHeatmaps/setupOptionBox2DHeatmap.js";

import {setupViewCameraSceneController } from "./MultiviewControl/setupViewBasic.js";
import {addOptionBox, updateOptionBoxLocation, showHideAllOptionBoxes } from "./MultiviewControl/optionBoxControl.js";
import {setupHUD} from "./MultiviewControl/HUDControl.js";
import {updateController} from "./MultiviewControl/controllerControl.js";
import {getAxis, addTitle, update2DHeatmapTitlesLocation} from "./2DHeatmaps/Utilities.js";
import {initializeHeatmapTooltip,updateHeatmapTooltip} from "./2DHeatmaps/tooltip.js";
import {selectionControl, updatePlaneSelection} from "./2DHeatmaps/selection.js";
import {heatmapsResetSelection, deselectAll, selectAll, updateAllPlots, updateSelectionFromHeatmap} from "./2DHeatmaps/Selection/Utilities.js";

import {fullscreenOneView} from "./MultiviewControl/calculateViewportSizes.js";

import {insertLegend, removeLegend, changeLegend} from "./MultiviewControl/colorLegend.js";

import {calcDefaultScalesSpatiallyResolvedData, adjustColorScaleAccordingToDefaultSpatiallyResolvedData, calcDefaultScalesMoleculeData, adjustScaleAccordingToDefaultMoleculeData} from "./Utilities/scale.js";

if(typeof data !== 'undefined'){
	console.log(data);
    handleViewSetup(data);
}
else{
	if (document.getElementById("uploader_wrapper") != null){
		console.log('starting');
		var uploader = document.getElementById("uploader");
		console.log(uploader);
		var uploader_wrapper = document.getElementById("uploader_wrapper");

		uploader.addEventListener("change", handleFiles, false);
	}
	else{
		console.log("error");
	}
}
function handleFiles() {

	var file = this.files[0];
	console.log(file);
	console.log(this);
	$.ajax({
		url: file.path,
		dataType: 'json',
		type: 'get',
		cache: false,
		success: function(data) {
			uploader.parentNode.removeChild(uploader);
			uploader_wrapper.parentNode.removeChild(uploader_wrapper);
			handleViewSetup(data);
		},
		error: function(requestObject, error, errorThrown) {
	        alert(error);
	        alert(errorThrown);
	    }
	})
}


function handleViewSetup(data){
	var views = data.views;
	var plotSetup = data.plotSetup;
	initializeViewSetups(views,plotSetup);
	main(views,plotSetup);

}

function main(views,plotSetup) {
	console.log(plotSetup);
	if ( ! Detector.webgl ) Detector.addGetWebGLMessage();
	var container, stats, renderer;
	//var selectionPlaneMaterial = new THREE.MeshBasicMaterial( {  color: 0xffffff, opacity: 0.5,transparent: true, side: THREE.DoubleSide,needsUpdate : true } );
	var mouseX = 0, mouseY = 0;
	var windowWidth, windowHeight;
	var clickRequest = false;
	var mouseHold = false;
	
	var continuousSelection = false;

	var activeView = views[0];

	var showOptionBoxesBool = true;

	//initializeViewSetups(views,plotSetup);

	var overallSpatiallyResolvedData = [];
	var overallMoleculeData = [];
	var queue=d3.queue();

	for (var ii =  0; ii < views.length; ++ii ) {
		var view = views[ii];

		if (plotSetup.frameProperty != null){
			console.log("use MD mode");
			view.frameBool = true;
			view.frameProperty = plotSetup.frameProperty;
		}
		else{
			console.log("use normal mode");
			view.frameBool = false;
			view.frameProperty = "__frame__";
		}
		
		if (view.viewType == '3DView'){

			//queue.defer(readCSVSpatiallyResolvedData,view,overallSpatiallyResolvedData,plotSetup);

			if(view.spatiallyResolvedData != null && view.spatiallyResolvedData.data != null){
				queue.defer(processSpatiallyResolvedData,view,overallSpatiallyResolvedData,plotSetup);
			}
			else{
				queue.defer(readCSVSpatiallyResolvedData,view,overallSpatiallyResolvedData,plotSetup);
			}

			if(view.moleculeData != null && view.moleculeData.data != null){
				queue.defer(processMoleculeData,view,overallMoleculeData,plotSetup);
			}
			else{
				queue.defer(readCSVMoleculeData,view,overallMoleculeData,plotSetup);
			}	
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
		renderer = new THREE.WebGLRenderer( { antialias: false, alpha: true, clearAlpha: 1 } );
		renderer.setPixelRatio( window.devicePixelRatio );
		renderer.setSize( window.innerWidth , window.innerHeight);

		renderer.autoClear = false;
		container.appendChild( renderer.domElement );

		if (overallSpatiallyResolvedData.length > 0){
			var defaultScalesSpatiallyResolvedData = calcDefaultScalesSpatiallyResolvedData(plotSetup,overallSpatiallyResolvedData);
		}

		if (overallMoleculeData.length > 0){
			var defaultScalesMoleculeData = calcDefaultScalesMoleculeData(plotSetup,overallMoleculeData);
		}
		

		for (var ii =  0; ii < views.length; ++ii ) {
			var view = views[ii];

			view.overallSpatiallyResolvedData = overallSpatiallyResolvedData;
			view.overallMoleculeData = overallMoleculeData;

			if (view.frameBool){
				if ( view.systemMoleculeData != null && view.systemMoleculeData.length > 0){
					var frameValue = function(d) {return d[view.frameProperty];}
					view.frameMin = d3.min(view.systemMoleculeData,frameValue);
					view.frameMax = d3.max(view.systemMoleculeData,frameValue);
					view.options.currentFrame = view.frameMin;
					console.log("starting frame, from molecule data ",view.options.currentFrame);
				}
				else{
					if (view.systemSpatiallyResolvedData != null && view.systemSpatiallyResolvedData.length > 0){
						var frameValue = function(d) {return d[view.frameProperty];}
						view.frameMin = d3.min(view.systemSpatiallyResolvedData,frameValue);
						view.frameMax = d3.max(view.systemSpatiallyResolvedData,frameValue);
						view.options.currentFrame = view.frameMin;
						console.log(view.systemSpatiallyResolvedData)
						console.log(d3.min(view.systemSpatiallyResolvedData,frameValue))
						console.log("starting frame, from sp data ",view.options.currentFrame);
					}
					else{
						alert("error when calculating frame min and max, double check your input")
					}
				}

			}



			setupViewCameraSceneController(view,renderer);
			addOptionBox(view);
			setupHUD(view);

			view.controller.addEventListener( 'change', render );

			if (view.viewType == '3DView'){
				view.controller.autoRotate = false;
								

				if (view.systemSpatiallyResolvedData != null && view.systemSpatiallyResolvedData.length > 0){
					view.systemSpatiallyResolvedDataBoolean = true;
					view.defaultScalesSpatiallyResolvedData = defaultScalesSpatiallyResolvedData;
					adjustColorScaleAccordingToDefaultSpatiallyResolvedData(view);
					getPointCloudGeometry(view);
					insertLegend(view);
				}
				if (view.systemMoleculeData != null && view.systemMoleculeData.length > 0){
					view.systemMoleculeDataBoolean = true;
					view.defaultScalesMoleculeData = defaultScalesMoleculeData;
					adjustScaleAccordingToDefaultMoleculeData(view);
					getMoleculeGeometry(view);
					//initialize3DViewTooltip(view);
				}
				//if ("coordinates" in view) {
				//	getMoleculeGeometry(view);
				//}
				

				addSystemEdge(view);
				setupOptionBox3DView(view,plotSetup);
				
			}
			if (view.viewType == '2DHeatmap'){

				view.controller.enableRotate=false;

				if (overallSpatiallyResolvedData.length > 0){
					view.overallSpatiallyResolvedDataBoolean = true;
				}
				if (overallMoleculeData.length > 0){
					view.overallMoleculeDataBoolean = true;
				}

				initializeHeatmapTooltip(view);
				setupOptionBox2DHeatmap(view,plotSetup);
				getAxis(view);
				addTitle(view);

				arrangeDataToHeatmap(view)
				getHeatmap(view);
				insertLegend(view);
				
			}

		}
		
		
		stats = new Stats();
		//container.appendChild( stats.dom );
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
				if (activeView.viewType == '2DHeatmap') {
					if (activeView.options.planeSelection){
						updatePlaneSelection(views,activeView);
						activeView.scene.remove(activeView.currentSelectionPlane);
						activeView.currentSelectionPlane = null;
					}
					if (activeView.options.brushSelection){
						//updateBrushSelection(views,activeView);
						activeView.scene.remove(activeView.currentSelectionBrush);
						activeView.currentSelectionBrush = null;
					}
				}
			}
		}, false );

		
		/*window.addEventListener( 'dblclick', function( event ) {
			//selectAll();
			//updateAllPlots();
			//continuousSelection = false;
			deselectAll(views, spatiallyResolvedData);
		}, false );*/

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
			//planeSelection = !planeSelection;
			//pointSelection = false;
			activeView.options.planeSelection = !activeView.options.planeSelection;
			activeView.options.brushSelection = false;
			activeView.gui.updateDisplay();
		}
		if (e.keyCode == 50) {
			//pointSelection = !pointSelection;
			//planeSelection = false;
			activeView.options.brushSelection = !activeView.options.brushSelection;
			activeView.options.planeSelection = false;
			activeView.gui.updateDisplay();
		}
		if (e.keyCode == 107) {

			
			var temp_view = {
								"viewType": "2DHeatmap",
								"plotXSpatiallyResolvedData": plotSetup.spatiallyResolvedPropertyList[0],
								"plotYSpatiallyResolvedData": plotSetup.spatiallyResolvedPropertyList[0],
								"plotXTransformSpatiallyResolvedData": "linear",
								"plotYTransformSpatiallyResolvedData": "linear",

								"plotXMoleculeData": plotSetup.moleculePropertyList[0],
								"plotYMoleculeData": plotSetup.moleculePropertyList[0],
								"plotXTransformMoleculeData": "linear",
								"plotYTransformMoleculeData": "linear"
							}
			views.push(temp_view);
			initialize2DHeatmapSetup(temp_view,views,plotSetup);
			calculateViewportSizes(views);

			temp_view.overallSpatiallyResolvedData = overallSpatiallyResolvedData;
			temp_view.overallMoleculeData = overallMoleculeData;
			//console.log(temp_view.spatiallyResolvedData);
			//console.log(temp_view.overallMoleculeData);
			if (overallSpatiallyResolvedData.length > 0){
				temp_view.overallSpatiallyResolvedDataBoolean = true;
			}
			if (overallMoleculeData.length > 0){
				temp_view.overallMoleculeDataBoolean = true;
			}

			if (temp_view.overallSpatiallyResolvedDataBoolean==false){
				temp_view.options.plotData = "moleculeData";
			}

			setupViewCameraSceneController(temp_view,renderer);
			addOptionBox(temp_view);
			setupHUD(temp_view);

			
			temp_view.controller.enableRotate=false;
			initializeHeatmapTooltip(temp_view);
			setupOptionBox2DHeatmap(temp_view,plotSetup);
			getAxis(temp_view);
			addTitle(temp_view);

			arrangeDataToHeatmap(temp_view)
			getHeatmap(temp_view);
			insertLegend(temp_view);
			updateOptionBoxLocation(views);
			update2DHeatmapTitlesLocation(views);
				
			
		}
	}


	function updateActiveView(views){
		for ( var ii = 0; ii < views.length; ++ii ){
			var view = views[ii];
			if (view.controllerEnabled){
				return view;
			}
		}
	}


	function onDocumentMouseMove( event ) {
		mouseX = event.clientX;
		mouseY = event.clientY;
		if (mouseHold == false){updateController(views, windowWidth, windowHeight, mouseX, mouseY);}
		activeView = updateActiveView(views);

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
				//if (view.viewType == "3DView" && view.systemMoleculeDataBoolean ){update3DViewTooltip(view);}
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
					
				var left   = Math.floor( windowWidth  * view.left );
				var top    = Math.floor( windowHeight * view.top );
				var width  = Math.floor( windowWidth  * view.width );
				var height = Math.floor( windowHeight * view.height );

				view.windowLeft = left;
				view.windowTop = top;
				view.windowWidth = width;
				view.windowHeight = height;
			}

			updateOptionBoxLocation(views);
			update2DHeatmapTitlesLocation(views);
		}
	}

	function animate() {
		render();
		//processClick();
		processSelection( );
		stats.update();

		for ( var ii = 0; ii < views.length; ++ii ) {
			var view = views[ii];
			if (view.viewType == '3DView') {
				view.controller.update();
			}
		}

		requestAnimationFrame( animate );
	}

	function render() {
		updateSize();
		for ( var ii = 0; ii < views.length; ++ii ) {

			var view = views[ii];
			if (view.viewType == '3DView' ) {
				if (view.options.animate){
					animatePointCloudGeometry(view);
					view.System.geometry.attributes.size.needsUpdate = true;
				}
				//if (view.systemMoleculeDataBoolean) {
				//	updateLineBond(view);
				//}
				
			}


			//view.controller.update();
			
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
			renderer.clearDepth(); // important for draw fat line
			renderer.setScissorTest( true );
			renderer.setClearColor( 0xffffff, 1 ); // border color
			renderer.clearColor(); // clear color buffer
			renderer.setClearColor( view.background, view.backgroundAlpha);
			//if (view.controllerEnabled) {renderer.setClearColor( view.controllerEnabledBackground );}
			//else {renderer.setClearColor( view.background );}

			camera.aspect = width / height;
			camera.updateProjectionMatrix();
			renderer.clear();
			renderer.render( view.scene, camera );
			renderer.render( view.sceneHUD, view.cameraHUD );
		}
	}

	function processSelection(){
		if (activeView != null){
			if (activeView.viewType == '2DHeatmap') {selectionControl(views, activeView, mouseHold);}
		}
	}	


}