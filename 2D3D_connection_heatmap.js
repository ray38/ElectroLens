

import {initializeViewSetups} from "./MultiviewControl/initializeViewSetups.js";
import {initialize2DHeatmapSetup} from "./2DHeatmaps/initialize2DHeatmapSetup.js";
import {calculateViewportSizes} from "./MultiviewControl/calculateViewportSizes.js";

import {arrangeDataToHeatmap, getHeatmap, updateHeatmap, replotHeatmap, addHeatmapLabels} from "./2DHeatmaps/HeatmapView.js";
import {getPointCloudGeometry, updatePointCloudGeometry, changePointCloudGeometry,animatePointCloudGeometry} from "./3DViews/PointCloud_selection.js";
import {getMoleculeGeometry, updateLineBond} from "./3DViews/MoleculeView.js";
import {addSystemEdge} from "./3DViews/systemEdge.js";
import {initialize3DViewTooltip,update3DViewTooltip,/*hover3DViewSpatiallyResolved, hover3DViewMolecule*/} from "./3DViews/tooltip.js";
import {hover3DViewSpatiallyResolved, hover3DViewMoleculeBall, hover3DViewMoleculeSprite, click3DViewMolecule, click3DViewSpatiallyResolved,gpuPickMolecule} from "./3DViews/selection.js";
import {combineData, readCSV,readCSVSpatiallyResolvedData,readCSVSpatiallyResolvedDataPapaparse,readCSVMoleculeData, processSpatiallyResolvedData,processMoleculeData/*,readCSVPapaparse, readViewsSetup*/} from "./Utilities/readDataFile.js";


import {arrangeMoleculeDataToFrame,arrangeMoleculeDataToFrame2} from "./Utilities/arrangeData.js";

import {readInputForm} from "./Utilities/readForm.js";
import {download} from "./Utilities/saveData.js";


import {setupOptionBox3DView} from "./3DViews/setupOptionBox3DView.js";
import {setupOptionBox2DHeatmap} from "./2DHeatmaps/setupOptionBox2DHeatmap.js";

import {setupViewCameraSceneController } from "./MultiviewControl/setupViewBasic.js";
import {addOptionBox, updateOptionBoxLocation, showHideAllOptionBoxes } from "./MultiviewControl/optionBoxControl.js";
import {setupHUD} from "./MultiviewControl/HUDControl.js";
import {updateController} from "./MultiviewControl/controllerControl.js";
import {getAxis, addTitle, update2DHeatmapTitlesLocation} from "./2DHeatmaps/Utilities.js";
import {initialize2DPlotTooltip,updateHeatmapTooltip,  updateCovarianceTooltip/*, hoverHeatmap,clickHeatmap */} from "./2DHeatmaps/tooltip.js";
import {selectionControl, updatePlaneSelection, hoverHeatmap,clickHeatmap} from "./2DHeatmaps/selection.js";
import {heatmapsResetSelection, deselectAll, selectAll, updateAllPlots, updateSelectionFromHeatmap,updateAllPlotsMolecule, updateAllPlotsMoleculeScale,updateAllPlotsSpatiallyResolved} from "./2DHeatmaps/Selection/Utilities.js";

import {fullscreenOneView} from "./MultiviewControl/calculateViewportSizes.js";

import {insertLegend, removeLegend, changeLegend, insertLegendMolecule, removeLegendMolecule, changeLegendMolecule} from "./MultiviewControl/colorLegend.js";

import {calcDefaultScalesSpatiallyResolvedData, adjustColorScaleAccordingToDefaultSpatiallyResolvedData, calcDefaultScalesMoleculeData, adjustScaleAccordingToDefaultMoleculeData} from "./Utilities/scale.js";


//import {addingProgressBar, updateProgressBar} from "./Utilities/progressBar.js";
//var progressBar = new ldBar("#progressbar");
/*
var loadingStatus = new function(){
	this.progress = 0;
	this.message=  "init";
}*/

//var progressBar = addingProgressBar(loadingStatus);


if(typeof data !== 'undefined'){
	console.log(data);
    handleViewSetup(data);
    }
else{
	console.log('starting');
	if (document.getElementById("uploader_wrapper") != null){
		
		var uploader = document.getElementById("uploader");
		var uploader_wrapper = document.getElementById("uploader_wrapper");
		uploader.addEventListener("change", handleFiles, false);

		var configForm = document.getElementById("form_wrapper");
		var divider = document.getElementById("divider");

		$(".save-config").click(function(e){
			var CONFIG = readInputForm();
			download(CONFIG, 'config.json', 'text/plain');
		})

		$( "form" ).submit(function( event ) {

			var CONFIG = readInputForm();
		    console.log("read input form");
		    event.preventDefault();
		    uploader.parentNode.removeChild(uploader);
			uploader_wrapper.parentNode.removeChild(uploader_wrapper);	
			configForm.parentNode.removeChild(configForm);
			divider.parentNode.removeChild(divider);
			handleViewSetup(CONFIG);
		});

	}
	else{
		console.log("error");
	}
}



function handleFiles() {

	var file = this.files[0];
	uploader.parentNode.removeChild(uploader);
	uploader_wrapper.parentNode.removeChild(uploader_wrapper);	
	configForm.parentNode.removeChild(configForm);
	divider.parentNode.removeChild(divider);

	$.ajax({
		url: file.path,
		dataType: 'json',
		type: 'get',
		cache: false,
		success: function(data) {
			console.log("read pre defined config");
			
			handleViewSetup(data);
		},
		error: function(requestObject, error, errorThrown) {
	        alert(error);
	        alert(errorThrown);
	    }
	})
}


function handleViewSetup(data){
	/*console.log(progressBar);
	console.log("updating progress bar");
	progressBar.set(30);*/
	//updateProgressBar(progressBar, loadingStatus, 30, "finish reading config");
	var views = data.views;
	var plotSetup = data.plotSetup;
	initializeViewSetups(views,plotSetup);
	main(views,plotSetup);

}

function main(views,plotSetup) {
	if ( ! Detector.webgl ) Detector.addGetWebGLMessage();

	var container, stats, renderer, effect;
	var mouseX = 0, mouseY = 0;
	// var windowWidth, windowHeight;
	plotSetup.windowWidth  = window.innerWidth;
	plotSetup.windowHeight = window.innerHeight;
	var clickRequest = false;
	var mouseHold = false;
	var mouseDrag = false;
	
	var continuousSelection = false;

	var activeView = views[0];

	var showOptionBoxesBool = true;
	var overallSpatiallyResolvedData = [];
	var overallMoleculeData = [];

	//initializeViewSetups(views,plotSetup);

	
	var queue=d3.queue();

	for (var ii =  0; ii < views.length; ++ii ) {
		var view = views[ii];
		view.plotSetup = plotSetup;

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
				queue.defer(processSpatiallyResolvedData,view,plotSetup);
			}
			else{
				queue.defer(readCSVSpatiallyResolvedData,view,plotSetup);
				// queue.defer(readCSVSpatiallyResolvedDataPapaparse,view,overallSpatiallyResolvedData,plotSetup);
			}

			if(view.moleculeData != null && view.moleculeData.data != null){
				queue.defer(processMoleculeData,view,plotSetup);
			}
			else{
				queue.defer(readCSVMoleculeData,view,plotSetup);
			}	
		}			
	}

	queue.awaitAll(function(error) {
		if (error) throw error;
		/*console.log("updating progress bar");
		progressBar.animate(80);*/
		combineData(views, overallSpatiallyResolvedData,overallMoleculeData);
		init();
		/*console.log("updating progress bar");
		progressBar.animate(100);)*/
		var htmlUI = document.getElementById("UI");
		htmlUI.parentNode.removeChild(htmlUI);
		render(views, plotSetup);
		animate();
	});


	function init() {
		
		console.log('started initialization')
		//const { UMAP } = require('umap-js');
		container = document.getElementById( 'container' );
		renderer = new THREE.WebGLRenderer( { antialias: false, alpha: true, clearAlpha: 1 } );
		renderer.setPixelRatio( window.devicePixelRatio );
		renderer.setSize( window.innerWidth , window.innerHeight);
		//effect = new THREE.AnaglyphEffect( renderer );
		//effect.setSize( window.innerWidth , window.innerHeight);

		renderer.autoClear = false;

		renderer.shadowMap.enabled = true;
		renderer.shadowMapEnabled = true;
		renderer.shadowMapSoft = true;

		renderer.shadowCameraNear = 1;
		renderer.shadowCameraFar = 60000;
		renderer.shadowCameraFov = 100;

		renderer.shadowMapBias = 0.0039;
		renderer.shadowMapDarkness = 0.5;
		renderer.shadowMapWidth = 1024;
		renderer.shadowMapHeight = 1024;

		plotSetup.renderer = renderer;

		container.appendChild( renderer.domElement );

		plotSetup.active2DPlotSpatiallyResolved = null;
		plotSetup.active2DPlotMolecule = null;

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

			view.controller.addEventListener( 'change', function( event ) {
				render(views, plotSetup);
			} );

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
					arrangeMoleculeDataToFrame2(view);
					getMoleculeGeometry(view);
					//insertLegend(view);
					
				}

				setupOptionBox3DView(view,plotSetup);
				addSystemEdge(view);
				initialize3DViewTooltip(view);
			}
			if (view.viewType == '2DHeatmap'){

				view.controller.enableRotate = false;
				view.options.plotID = "2D_Plot_" + ii;
				 

				if (overallSpatiallyResolvedData.length > 0){
					view.overallSpatiallyResolvedDataBoolean = true;
				}
				if (overallMoleculeData.length > 0){
					view.overallMoleculeDataBoolean = true;
				}

				initialize2DPlotTooltip(view);
				setupOptionBox2DHeatmap(view,plotSetup);
				
				addTitle(view);
				
			}

		}
		
		
		stats = new Stats();
		container.appendChild( stats.dom );

		container.addEventListener( 'mousemove', throttle(onDocumentMouseMove, 20), false );
		container.addEventListener( 'click', onDocumentMouseClick,  false );
		container.addEventListener( 'mousedown', function( event ) {
			mouseHold = true;
			if (event.button == 0){
				clickRequest = true;
			}
		}, false );
		container.addEventListener( 'mouseup', function( event ) {
			mouseHold = false;
			mouseDrag = false;
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

		window.addEventListener( "keydown", onKeyDown, true);
		
	}




	function onKeyDown(e){
		if (e.keyCode == 72) {showHideAllOptionBoxes(views,showOptionBoxesBool); showOptionBoxesBool = !showOptionBoxesBool;}
		if (e.keyCode == 70) {
			for (var ii =  0; ii < views.length; ++ii ) {
				var view = views[ii];
				if (view.controllerEnabled) {
					view.options.toggleFullscreen.call();
				}
			}
			render(views, plotSetup);
		}
		if (e.keyCode == 76) {
			for (var ii =  0; ii < views.length; ++ii ) {
				var view = views[ii];
				if (view.controllerEnabled) {view.options.toggleLegend.call();}
			}
			render(views, plotSetup);
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
		if (e.keyCode == 107 || e.keyCode == 65) {
			var temp_view = {"viewType": "2DHeatmap"}
			temp_view.plotSetup = plotSetup;
			
			if (overallSpatiallyResolvedData.length > 0){
				temp_view["plotXSpatiallyResolvedData"] = plotSetup.spatiallyResolvedPropertyList[0]
				temp_view["plotYSpatiallyResolvedData"] = plotSetup.spatiallyResolvedPropertyList[0]
				temp_view["plotXTransformSpatiallyResolvedData"] = "linear"
				temp_view["plotYTransformSpatiallyResolvedData"] = "linear"
			}
			if (overallMoleculeData.length > 0){
				temp_view["plotXMoleculeData"] = plotSetup.moleculePropertyList[0]
				temp_view["plotYMoleculeData"] = plotSetup.moleculePropertyList[0]
				temp_view["plotXTransformMoleculeData"] = "linear"
				temp_view["plotYTransformMoleculeData"] = "linear"
			}

			
			views.push(temp_view);
			initialize2DHeatmapSetup(temp_view,views,plotSetup);
			temp_view.options.plotID = "2D_Plot_" + views.length;
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
			temp_view.controller.addEventListener( 'change', function( event ) {
				render(views, plotSetup);
			} );

			
			temp_view.controller.enableRotate=false;
			initialize2DPlotTooltip(temp_view);
			setupOptionBox2DHeatmap(temp_view,plotSetup);
			updateOptionBoxLocation(views);
			addTitle(temp_view)
			render(views, plotSetup);
			

			/*
			getAxis(temp_view);
			;
			arrangeDataToHeatmap(temp_view)
			getHeatmap(temp_view);
			addHeatmapLabels(temp_view);
			insertLegend(temp_view);*/
			
			//update2DHeatmapTitlesLocation(views);
				
			
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

	function throttle(callback, interval) {
		let enableCall = true;
	  
		return function(...args) {
		  if (!enableCall) return;
	  
		  enableCall = false;
		  callback.apply(this, args);
		  setTimeout(() => enableCall = true, interval);
		}
	}

	function onDocumentMouseMove( mouseEvent ) {
		mouseX = mouseEvent.clientX;
		mouseY = mouseEvent.clientY;
		if (mouseHold == false){
			updateController(views, plotSetup.windowWidth, plotSetup.windowHeight, mouseX, mouseY);
			activeView = updateActiveView(views);
		}
		else {
			mouseDrag = true; 
			return;
		}
		


		for ( var ii = 0; ii < views.length; ++ii ){
			var view = views[ii];
			if (view.controllerEnabled){
				var left   = Math.floor( plotSetup.windowWidth  * view.left );
				var top    = Math.floor( plotSetup.windowHeight * view.top );
				// var width  = Math.floor( windowWidth  * view.width ) + left;
				// var height = Math.floor( windowHeight * view.height ) + top;
				var vector = new THREE.Vector3();
			
				vector.set(	(((mouseEvent.clientX-left)/Math.floor( plotSetup.windowWidth  * view.width )) * 2 - 1),
							(-((mouseEvent.clientY-top)/Math.floor( plotSetup.windowHeight * view.height )) * 2 + 1),
							0.1);
				vector.unproject( view.camera );
				var dir = vector.sub( view.camera.position ).normalize();
				var distance = - view.camera.position.z/dir.z;
				view.mousePosition = view.camera.position.clone().add( dir.multiplyScalar( distance ) );
				if (view.viewType == "2DHeatmap"){
					if ((view.options.plotType == "Heatmap" || view.options.plotType == "Comparison"
						|| view.options.plotType == "PCA" || view.options.plotType == "Umap") 
						&& typeof view.heatmapPlot != "undefined"){

						if (view.options.plotData == "spatiallyResolvedData") {
							var needsUpdate = hoverHeatmap(view,mouseEvent);
							if (needsUpdate) {
								console.log('updating plots');
								updateAllPlotsSpatiallyResolved(views);
							}
						} else if (view.options.plotData == "moleculeData") {
							var needsUpdate = hoverHeatmap(view,mouseEvent);
							if (needsUpdate) {
								console.log('updating plots');
								updateAllPlotsMolecule(views);
							}
						}
					}
					if (view.options.plotType == "Correlation" && typeof view.covariancePlot != "undefined"){
						updateCovarianceTooltip(view);
					}
				} else if (view.viewType == "3DView") {
					if (view.systemMoleculeDataBoolean && view.options.interactiveMolecule ) {
						if (view.options.atomsStyle == "ball") {
							var pickingResult = gpuPickMolecule(view, renderer, view.scene,mouseEvent, plotSetup.windowWidth, plotSetup.windowHeight);
							var needsUpdate = hover3DViewMoleculeBall(view, plotSetup, pickingResult);
							if (needsUpdate) {
								updateAllPlotsMoleculeScale(views);
							}
						} else if (view.options.atomsStyle == "sprite"){
							var needsUpdate = hover3DViewMoleculeSprite(view, plotSetup, mouseEvent);
							if (needsUpdate) {
								updateAllPlotsMoleculeScale(views);
							}
						}
					}

					if (view.systemSpatiallyResolvedDataBoolean && view.options.interactiveSpatiallyResolved) {
						var needsUpdate = hover3DViewSpatiallyResolved(view, plotSetup, mouseEvent);
						if (needsUpdate) {
							updateAllPlotsSpatiallyResolved(views);
						}
					}
					
				}
			}
		}
		render(views, plotSetup);
	}

	function onDocumentMouseClick( mouseEvent ) {
		if (mouseDrag) {
			return;
		}
		
		for ( var ii = 0; ii < views.length; ++ii ){
			var view = views[ii];
			if (view.controllerEnabled){
				if (view.viewType == "2DHeatmap"){
					if ((view.options.plotType == "Heatmap" || view.options.plotType == "Comparison"
						|| view.options.plotType == "PCA" || view.options.plotType == "Umap")  && 
						typeof view.heatmapPlot != "undefined" &&
						!(view.options.planeSelection || view.options.brushSelection)){
							if (view.options.plotData == "spatiallyResolvedData") {
								var needsUpdate = clickHeatmap(view, views);
								if (needsUpdate) {
									updateAllPlotsSpatiallyResolved(views);
								}
							} else if (view.options.plotData == "moleculeData") {
								var needsUpdate = clickHeatmap(view, views);
								if (needsUpdate) {
									updateAllPlotsMolecule(views);
								}
							}
						
						// updateHeatmapTooltip(view);
					}
				} 
				else if (view.viewType == "3DView") {
					if (view.systemMoleculeDataBoolean && view.options.interactiveMolecule) {
						var needsUpdate = click3DViewMolecule(view, views, plotSetup);
						if (needsUpdate) {
							updateAllPlotsMolecule(views);
						}
					}

					if (view.systemSpatiallyResolvedDataBoolean && view.options.interactiveSpatiallyResolved) {
						var needsUpdate = click3DViewSpatiallyResolved(view, views, plotSetup);
						if (needsUpdate) {
							updateAllPlotsSpatiallyResolved(views);
						}
					}
				}
			}
		}
		render(views, plotSetup);
	}

	/*function updateSize(views) {
		if ( windowWidth != window.innerWidth || windowHeight != window.innerHeight) {
			windowWidth  = window.innerWidth;
			windowHeight = window.innerHeight;
			renderer.setSize ( windowWidth, windowHeight );

			for ( var ii = 0; ii < views.length; ++ii ){
				var view = views[ii];
					
				var width  = Math.floor( windowWidth  * view.width );
				var height = Math.floor( windowHeight * view.height );
				var left   = Math.floor( windowWidth  * view.left );
				var top    = Math.floor( windowHeight * (1-view.top) - height );

				view.windowLeft = left;
				view.windowTop = windowHeight * view.top;
				view.windowWidth = width;
				view.windowHeight = height;
			}

			updateOptionBoxLocation(views);
			update2DHeatmapTitlesLocation(views);
		}
	}*/

	function animate() {
		// render();
		//processClick();
		processSelection( );
		stats.update();

		/*for ( var ii = 0; ii < views.length; ++ii ) {
			var view = views[ii];
			if (view.viewType == '3DView') {
				view.controller.update();
			}
		}*/

		requestAnimationFrame( animate );
	}

	/*function render() {
		updateSize();
		for ( var ii = 0; ii < views.length; ++ii ) {

			var view = views[ii];
			
			var camera = view.camera;
			
			var width  = Math.floor( windowWidth  * view.width );
			var height = Math.floor( windowHeight * view.height );
			var left   = Math.floor( windowWidth  * view.left );
			var top    = Math.floor( windowHeight * (1-view.top) - height );
			// console.log('top', view.top,(1-view.top), top)

			view.windowLeft = left;
			view.windowTop = windowHeight * view.top;
			view.windowWidth = width;
			view.windowHeight = height;

			renderer.setViewport( left, top, width, height );
			renderer.setScissor( left, top, width, height );
			//renderer.clearDepth(); // important for draw fat line
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
			//effect.render( view.scene, camera  );
			renderer.render( view.sceneHUD, view.cameraHUD );
		}
	}*/

	

	function processSelection(){
		if (activeView != null){
			if (activeView.viewType == '2DHeatmap') {selectionControl(views, activeView, mouseHold);}
		}
	}
}


export function render(views, plotSetup) {
	var renderer = plotSetup.renderer;
	updateSize(views, plotSetup);
	for ( var ii = 0; ii < views.length; ++ii ) {

		var view = views[ii];
		
		var camera = view.camera;
		
		var width  = Math.floor( plotSetup.windowWidth  * view.width );
		var height = Math.floor( plotSetup.windowHeight * view.height );
		var left   = Math.floor( plotSetup.windowWidth  * view.left );
		var top    = Math.floor( plotSetup.windowHeight * (1-view.top) - height );
		// console.log('top', view.top,(1-view.top), top)

		view.windowLeft = left;
		view.windowTop = plotSetup.windowHeight * view.top;
		view.windowWidth = width;
		view.windowHeight = height;

		renderer.setViewport( left, top, width, height );
		renderer.setScissor( left, top, width, height );
		//renderer.clearDepth(); // important for draw fat line
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
		//effect.render( view.scene, camera  );
		renderer.render( view.sceneHUD, view.cameraHUD );
	}
}

function updateSize(views, plotSetup) {
	if ( plotSetup.windowWidth != window.innerWidth || plotSetup.windowHeight != window.innerHeight) {
		plotSetup.windowWidth  = window.innerWidth;
		plotSetup.windowHeight = window.innerHeight;
		plotSetup.renderer.setSize ( plotSetup.windowWidth, plotSetup.windowHeight );

		for ( var ii = 0; ii < views.length; ++ii ){
			var view = views[ii];
				
			var width  = Math.floor( plotSetup.windowWidth  * view.width );
			var height = Math.floor( plotSetup.windowHeight * view.height );
			var left   = Math.floor( plotSetup.windowWidth  * view.left );
			var top    = Math.floor( plotSetup.windowHeight * (1-view.top) - height );

			view.windowLeft = left;
			view.windowTop = plotSetup.windowHeight * view.top;
			view.windowWidth = width;
			view.windowHeight = height;
		}

		updateOptionBoxLocation(views);
		update2DHeatmapTitlesLocation(views);
	}
}