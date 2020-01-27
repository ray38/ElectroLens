function electroLensMain(){(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
"use strict";

var _MultiviewControlInitializeViewSetupsJs = require("./MultiviewControl/initializeViewSetups.js");

var _DHeatmapsInitialize2DHeatmapSetupJs = require("./2DHeatmaps/initialize2DHeatmapSetup.js");

var _MultiviewControlCalculateViewportSizesJs = require("./MultiviewControl/calculateViewportSizes.js");

var _DHeatmapsHeatmapViewJs = require("./2DHeatmaps/HeatmapView.js");

var _DViewsPointCloud_selectionJs = require("./3DViews/PointCloud_selection.js");

var _DViewsMoleculeViewJs = require("./3DViews/MoleculeView.js");

var _DViewsSystemEdgeJs = require("./3DViews/systemEdge.js");

var _DViewsTooltipJs = require("./3DViews/tooltip.js");

var _UtilitiesReadDataFileJs = require( /*,readCSVPapaparse, readViewsSetup*/"./Utilities/readDataFile.js");

var _UtilitiesArrangeDataJs = require("./Utilities/arrangeData.js");

var _DViewsSetupOptionBox3DViewJs = require("./3DViews/setupOptionBox3DView.js");

var _DHeatmapsSetupOptionBox2DHeatmapJs = require("./2DHeatmaps/setupOptionBox2DHeatmap.js");

var _MultiviewControlSetupViewBasicJs = require("./MultiviewControl/setupViewBasic.js");

var _MultiviewControlOptionBoxControlJs = require("./MultiviewControl/optionBoxControl.js");

var _MultiviewControlHUDControlJs = require("./MultiviewControl/HUDControl.js");

var _MultiviewControlControllerControlJs = require("./MultiviewControl/controllerControl.js");

var _DHeatmapsUtilitiesJs = require("./2DHeatmaps/Utilities.js");

var _DHeatmapsTooltipJs = require("./2DHeatmaps/tooltip.js");

var _DHeatmapsSelectionJs = require("./2DHeatmaps/selection.js");

var _DHeatmapsSelectionUtilitiesJs = require("./2DHeatmaps/Selection/Utilities.js");

var _MultiviewControlColorLegendJs = require("./MultiviewControl/colorLegend.js");

var _UtilitiesScaleJs = require("./Utilities/scale.js");

//import {addingProgressBar, updateProgressBar} from "./Utilities/progressBar.js";
//var progressBar = new ldBar("#progressbar");
/*
var loadingStatus = new function(){
	this.progress = 0;
	this.message=  "init";
}*/

//var progressBar = addingProgressBar(loadingStatus);

if (typeof data !== 'undefined') {
	console.log(data);
	handleViewSetup(data);
} else {
	console.log('starting');
	if (document.getElementById("uploader_wrapper") != null) {

		var uploader = document.getElementById("uploader");
		var uploader_wrapper = document.getElementById("uploader_wrapper");
		uploader.addEventListener("change", handleFiles, false);

		var configForm = document.getElementById("form_wrapper");
		var divider = document.getElementById("divider");

		$("form").submit(function (event) {

			for (var i = 0; i < NUMBER3DVIEWS; i++) {
				document.getElementById('view' + (i + 1) + 'YMax').disabled = false;
				document.getElementById('view' + (i + 1) + 'ZMax').disabled = false;
				document.getElementById('view' + (i + 1) + 'YMin').disabled = false;
				document.getElementById('view' + (i + 1) + 'ZMin').disabled = false;
			}

			var tempFormResult = {};
			var CONFIG = { "views": [], "plotSetup": {} };
			$.each($('form').serializeArray(), function () {
				tempFormResult[this.name] = this.value;
			});

			if (tempFormResult["boolSpatiallyResolvedData"] == "yes") {
				var boolSpatiallyResolved = true;
			} else {
				var boolSpatiallyResolved = false;
			}

			if (tempFormResult["boolMolecularData"] == "yes") {
				var boolMolecular = true;
			} else {
				var boolMolecular = false;
			}

			if (tempFormResult["boolFramedData"] == "yes") {
				var boolFramed = true;
			} else {
				var boolFramed = false;
			}

			var boolFormFilledCorrectly = false;

			if (boolSpatiallyResolved) {
				CONFIG["plotSetup"]["spatiallyResolvedPropertyList"] = tempFormResult["propertyListSpatiallyResolved"].split(",").map(function (item) {
					return item.trim();
				});
				CONFIG["plotSetup"]["pointcloudDensity"] = tempFormResult["densityProperty"];
				CONFIG["plotSetup"]["densityCutoffLow"] = Number(tempFormResult["densityCutoffLow"]);
				CONFIG["plotSetup"]["densityCutoffUp"] = Number(tempFormResult["densityCutoffUp"]);
			} else {
				console.log("No Spatially Resolved Data");
			}

			if (boolMolecular) {
				CONFIG["plotSetup"]["moleculePropertyList"] = tempFormResult["propertyListMolecular"].split(",").map(function (item) {
					return item.trim();
				});
			} else {
				console.log("No Molecular Data");
			}

			if (boolFramed) {
				CONFIG["plotSetup"]["frameProperty"] = tempFormResult["frameProperty"];
			} else {
				console.log("Data not framed");
			}

			for (var i = 1; i < NUMBER3DVIEWS + 1; i++) {
				var tempViewSetup = { "viewType": "3DView" };
				tempViewSetup["moleculeName"] = tempFormResult["view" + i + "Name"];
				tempViewSetup["systemDimension"] = { "x": [Number(tempFormResult["view" + i + "XMin"]), Number(tempFormResult["view" + i + "XMax"])],
					"y": [Number(tempFormResult["view" + i + "YMin"]), Number(tempFormResult["view" + i + "YMax"])],
					"z": [Number(tempFormResult["view" + i + "ZMin"]), Number(tempFormResult["view" + i + "ZMax"])] };
				if (boolSpatiallyResolved) {
					tempViewSetup["spatiallyResolvedData"] = {};
					tempViewSetup["spatiallyResolvedData"]["dataFilename"] = document.getElementById("view" + i + "SpatiallyResolvedDataFilename").files[0].path;
					tempViewSetup["spatiallyResolvedData"]["gridSpacing"] = { "x": Number(tempFormResult["view" + i + "XSpacing"]), "y": Number(tempFormResult["view" + i + "YSpacing"]), "z": Number(tempFormResult["view" + i + "ZSpacing"]) };
				}

				if (boolMolecular) {
					tempViewSetup["moleculeData"] = {};
					tempViewSetup["moleculeData"]["dataFilename"] = document.getElementById("view" + i + "MolecularDataFilename").files[0].path;
				}
				CONFIG["views"].push(tempViewSetup);
			}

			console.log(tempFormResult);
			console.log(CONFIG);
			/*console.log(NUMBER3DVIEWS);*/
			console.log("read input form");
			event.preventDefault();
			uploader.parentNode.removeChild(uploader);
			uploader_wrapper.parentNode.removeChild(uploader_wrapper);
			configForm.parentNode.removeChild(configForm);
			divider.parentNode.removeChild(divider);
			handleViewSetup(CONFIG);
		});
	} else {
		console.log("error");
	}
}
function handleFiles() {

	var file = this.files[0];
	uploader.parentNode.removeChild(uploader);
	uploader_wrapper.parentNode.removeChild(uploader_wrapper);
	configForm.parentNode.removeChild(configForm);
	divider.parentNode.removeChild(divider);
	console.log(file);
	console.log(this);

	$.ajax({
		url: file.path,
		dataType: 'json',
		type: 'get',
		cache: false,
		success: function success(data) {
			console.log("read pre defined config");

			handleViewSetup(data);
		},
		error: function error(requestObject, _error, errorThrown) {
			alert(_error);
			alert(errorThrown);
		}
	});
}

function handleViewSetup(data) {
	/*console.log(progressBar);
 console.log("updating progress bar");
 progressBar.set(30);*/
	//updateProgressBar(progressBar, loadingStatus, 30, "finish reading config");
	var views = data.views;
	var plotSetup = data.plotSetup;
	_MultiviewControlInitializeViewSetupsJs.initializeViewSetups(views, plotSetup);
	main(views, plotSetup);
}

function main(views, plotSetup) {
	console.log(plotSetup);
	if (!Detector.webgl) Detector.addGetWebGLMessage();

	var container, stats, renderer, effect;
	var mouseX = 0,
	    mouseY = 0;
	var windowWidth, windowHeight;
	var clickRequest = false;
	var mouseHold = false;

	var continuousSelection = false;

	var activeView = views[0];

	var showOptionBoxesBool = true;

	//initializeViewSetups(views,plotSetup);

	var overallSpatiallyResolvedData = [];
	var overallMoleculeData = [];
	var queue = d3.queue();

	for (var ii = 0; ii < views.length; ++ii) {
		var view = views[ii];
		view.plotSetup = plotSetup;

		if (plotSetup.frameProperty != null) {
			console.log("use MD mode");
			view.frameBool = true;
			view.frameProperty = plotSetup.frameProperty;
		} else {
			console.log("use normal mode");
			view.frameBool = false;
			view.frameProperty = "__frame__";
		}

		if (view.viewType == '3DView') {

			//queue.defer(readCSVSpatiallyResolvedData,view,overallSpatiallyResolvedData,plotSetup);

			if (view.spatiallyResolvedData != null && view.spatiallyResolvedData.data != null) {
				queue.defer(_UtilitiesReadDataFileJs.processSpatiallyResolvedData, view, overallSpatiallyResolvedData, plotSetup);
			} else {
				queue.defer(_UtilitiesReadDataFileJs.readCSVSpatiallyResolvedData, view, overallSpatiallyResolvedData, plotSetup);
			}

			if (view.moleculeData != null && view.moleculeData.data != null) {
				queue.defer(_UtilitiesReadDataFileJs.processMoleculeData, view, overallMoleculeData, plotSetup);
			} else {
				queue.defer(_UtilitiesReadDataFileJs.readCSVMoleculeData, view, overallMoleculeData, plotSetup);
			}
		}
	}

	queue.awaitAll(function (error) {
		if (error) throw error;
		/*console.log("updating progress bar");
  progressBar.animate(80);*/

		init();
		/*console.log("updating progress bar");
  progressBar.animate(100);*/
		var htmlUI = document.getElementById("UI");
		htmlUI.parentNode.removeChild(htmlUI);
		animate();
	});

	function init() {
		console.log('started initialization');
		container = document.getElementById('container');
		renderer = new THREE.WebGLRenderer({ antialias: false, alpha: true, clearAlpha: 1 });
		renderer.setPixelRatio(window.devicePixelRatio);
		renderer.setSize(window.innerWidth, window.innerHeight);
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

		container.appendChild(renderer.domElement);

		if (overallSpatiallyResolvedData.length > 0) {
			var defaultScalesSpatiallyResolvedData = _UtilitiesScaleJs.calcDefaultScalesSpatiallyResolvedData(plotSetup, overallSpatiallyResolvedData);
		}

		if (overallMoleculeData.length > 0) {
			var defaultScalesMoleculeData = _UtilitiesScaleJs.calcDefaultScalesMoleculeData(plotSetup, overallMoleculeData);
		}

		for (var ii = 0; ii < views.length; ++ii) {
			var view = views[ii];

			view.overallSpatiallyResolvedData = overallSpatiallyResolvedData;
			view.overallMoleculeData = overallMoleculeData;

			if (view.frameBool) {
				if (view.systemMoleculeData != null && view.systemMoleculeData.length > 0) {
					var frameValue = function frameValue(d) {
						return d[view.frameProperty];
					};
					view.frameMin = d3.min(view.systemMoleculeData, frameValue);
					view.frameMax = d3.max(view.systemMoleculeData, frameValue);
					view.options.currentFrame = view.frameMin;
					console.log("starting frame, from molecule data ", view.options.currentFrame);
				} else {
					if (view.systemSpatiallyResolvedData != null && view.systemSpatiallyResolvedData.length > 0) {
						var frameValue = function frameValue(d) {
							return d[view.frameProperty];
						};
						view.frameMin = d3.min(view.systemSpatiallyResolvedData, frameValue);
						view.frameMax = d3.max(view.systemSpatiallyResolvedData, frameValue);
						view.options.currentFrame = view.frameMin;
						console.log("starting frame, from sp data ", view.options.currentFrame);
					} else {
						alert("error when calculating frame min and max, double check your input");
					}
				}
			}

			_MultiviewControlSetupViewBasicJs.setupViewCameraSceneController(view, renderer);
			_MultiviewControlOptionBoxControlJs.addOptionBox(view);
			_MultiviewControlHUDControlJs.setupHUD(view);

			view.controller.addEventListener('change', render);

			if (view.viewType == '3DView') {
				view.controller.autoRotate = false;

				if (view.systemSpatiallyResolvedData != null && view.systemSpatiallyResolvedData.length > 0) {
					view.systemSpatiallyResolvedDataBoolean = true;
					view.defaultScalesSpatiallyResolvedData = defaultScalesSpatiallyResolvedData;
					_UtilitiesScaleJs.adjustColorScaleAccordingToDefaultSpatiallyResolvedData(view);
					_DViewsPointCloud_selectionJs.getPointCloudGeometry(view);
					_MultiviewControlColorLegendJs.insertLegend(view);
				}
				if (view.systemMoleculeData != null && view.systemMoleculeData.length > 0) {
					view.systemMoleculeDataBoolean = true;
					view.defaultScalesMoleculeData = defaultScalesMoleculeData;
					_UtilitiesScaleJs.adjustScaleAccordingToDefaultMoleculeData(view);
					_UtilitiesArrangeDataJs.arrangeMoleculeDataToFrame2(view);
					_DViewsMoleculeViewJs.getMoleculeGeometry(view);
					//insertLegend(view);
					//initialize3DViewTooltip(view);
				}

				_DViewsSystemEdgeJs.addSystemEdge(view);
				_DViewsSetupOptionBox3DViewJs.setupOptionBox3DView(view, plotSetup);
			}
			if (view.viewType == '2DHeatmap') {

				view.controller.enableRotate = false;

				if (overallSpatiallyResolvedData.length > 0) {
					view.overallSpatiallyResolvedDataBoolean = true;
				}
				if (overallMoleculeData.length > 0) {
					view.overallMoleculeDataBoolean = true;
				}

				_DHeatmapsTooltipJs.initialize2DPlotTooltip(view);
				_DHeatmapsSetupOptionBox2DHeatmapJs.setupOptionBox2DHeatmap(view, plotSetup);

				_DHeatmapsUtilitiesJs.addTitle(view);

				/*
    getAxis(view);
    arrangeDataToHeatmap(view)
    getHeatmap(view);
    addHeatmapLabels(view);
    insertLegend(view);*/
			}
		}

		//stats = new Stats();
		//container.appendChild( stats.dom );
		document.addEventListener('mousemove', onDocumentMouseMove, false);
		window.addEventListener('mousedown', function (event) {
			mouseHold = true;
			if (event.button == 0) {
				clickRequest = true;
			}
		}, false);
		window.addEventListener('mouseup', function (event) {
			mouseHold = false;
			if (event.button == 0) {
				if (activeView.viewType == '2DHeatmap') {
					if (activeView.options.planeSelection) {
						_DHeatmapsSelectionJs.updatePlaneSelection(views, activeView);
						activeView.scene.remove(activeView.currentSelectionPlane);
						activeView.currentSelectionPlane = null;
					}
					if (activeView.options.brushSelection) {
						//updateBrushSelection(views,activeView);
						activeView.scene.remove(activeView.currentSelectionBrush);
						activeView.currentSelectionBrush = null;
					}
				}
			}
		}, false);

		/*window.addEventListener( 'dblclick', function( event ) {
  	//selectAll();
  	//updateAllPlots();
  	//continuousSelection = false;
  	deselectAll(views, spatiallyResolvedData);
  }, false );*/

		window.addEventListener("keydown", onKeyDown, true);
	}

	function onKeyDown(e) {
		if (e.keyCode == 72) {
			_MultiviewControlOptionBoxControlJs.showHideAllOptionBoxes(views, showOptionBoxesBool);showOptionBoxesBool = !showOptionBoxesBool;
		}
		if (e.keyCode == 70) {
			for (var ii = 0; ii < views.length; ++ii) {
				var view = views[ii];
				if (view.controllerEnabled) {
					view.options.toggleFullscreen.call();
				}
			}
		}
		if (e.keyCode == 76) {
			for (var ii = 0; ii < views.length; ++ii) {
				var view = views[ii];
				if (view.controllerEnabled) {
					view.options.toggleLegend.call();
				}
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
		if (e.keyCode == 107 || e.keyCode == 65) {
			var temp_view = { "viewType": "2DHeatmap" };
			temp_view.plotSetup = plotSetup;

			if (overallSpatiallyResolvedData.length > 0) {
				temp_view["plotXSpatiallyResolvedData"] = plotSetup.spatiallyResolvedPropertyList[0];
				temp_view["plotYSpatiallyResolvedData"] = plotSetup.spatiallyResolvedPropertyList[0];
				temp_view["plotXTransformSpatiallyResolvedData"] = "linear";
				temp_view["plotYTransformSpatiallyResolvedData"] = "linear";
			}
			if (overallMoleculeData.length > 0) {
				temp_view["plotXMoleculeData"] = plotSetup.moleculePropertyList[0];
				temp_view["plotYMoleculeData"] = plotSetup.moleculePropertyList[0];
				temp_view["plotXTransformMoleculeData"] = "linear";
				temp_view["plotYTransformMoleculeData"] = "linear";
			}

			views.push(temp_view);
			_DHeatmapsInitialize2DHeatmapSetupJs.initialize2DHeatmapSetup(temp_view, views, plotSetup);
			_MultiviewControlCalculateViewportSizesJs.calculateViewportSizes(views);

			temp_view.overallSpatiallyResolvedData = overallSpatiallyResolvedData;
			temp_view.overallMoleculeData = overallMoleculeData;
			//console.log(temp_view.spatiallyResolvedData);
			//console.log(temp_view.overallMoleculeData);
			if (overallSpatiallyResolvedData.length > 0) {
				temp_view.overallSpatiallyResolvedDataBoolean = true;
			}
			if (overallMoleculeData.length > 0) {
				temp_view.overallMoleculeDataBoolean = true;
			}

			if (temp_view.overallSpatiallyResolvedDataBoolean == false) {
				temp_view.options.plotData = "moleculeData";
			}

			_MultiviewControlSetupViewBasicJs.setupViewCameraSceneController(temp_view, renderer);
			_MultiviewControlOptionBoxControlJs.addOptionBox(temp_view);
			_MultiviewControlHUDControlJs.setupHUD(temp_view);

			temp_view.controller.enableRotate = false;
			_DHeatmapsTooltipJs.initialize2DPlotTooltip(temp_view);
			_DHeatmapsSetupOptionBox2DHeatmapJs.setupOptionBox2DHeatmap(temp_view, plotSetup);
			_MultiviewControlOptionBoxControlJs.updateOptionBoxLocation(views);
			_DHeatmapsUtilitiesJs.addTitle(temp_view);

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

	function updateActiveView(views) {
		for (var ii = 0; ii < views.length; ++ii) {
			var view = views[ii];
			if (view.controllerEnabled) {
				return view;
			}
		}
	}

	function onDocumentMouseMove(event) {
		mouseX = event.clientX;
		mouseY = event.clientY;
		if (mouseHold == false) {
			_MultiviewControlControllerControlJs.updateController(views, windowWidth, windowHeight, mouseX, mouseY);
		}
		activeView = updateActiveView(views);

		for (var ii = 0; ii < views.length; ++ii) {
			var view = views[ii];
			if (view.controllerEnabled) {
				var left = Math.floor(windowWidth * view.left);
				var top = Math.floor(windowHeight * view.top);
				// var width  = Math.floor( windowWidth  * view.width ) + left;
				// var height = Math.floor( windowHeight * view.height ) + top;
				var vector = new THREE.Vector3();

				vector.set((event.clientX - left) / Math.floor(windowWidth * view.width) * 2 - 1, -((event.clientY - top) / Math.floor(windowHeight * view.height)) * 2 + 1, 0.1);
				vector.unproject(view.camera);
				var dir = vector.sub(view.camera.position).normalize();
				var distance = -view.camera.position.z / dir.z;
				view.mousePosition = view.camera.position.clone().add(dir.multiplyScalar(distance));
				if (view.viewType == "2DHeatmap") {
					if (view.options.plotType == "Heatmap" && typeof view.heatmapPlot != "undefined") {
						_DHeatmapsTooltipJs.updateHeatmapTooltip(view);
					}
					if (view.options.plotType == "Correlation" && typeof view.covariancePlot != "undefined") {
						_DHeatmapsTooltipJs.updateCovarianceTooltip(view);
					}
				}
				//if (view.viewType == "3DView" && view.systemMoleculeDataBoolean ){update3DViewTooltip(view);}
			}
		}
	}
	function updateSize() {
		if (windowWidth != window.innerWidth || windowHeight != window.innerHeight) {
			windowWidth = window.innerWidth;
			windowHeight = window.innerHeight;
			renderer.setSize(windowWidth, windowHeight);

			for (var ii = 0; ii < views.length; ++ii) {
				var view = views[ii];

				var width = Math.floor(windowWidth * view.width);
				var height = Math.floor(windowHeight * view.height);
				var left = Math.floor(windowWidth * view.left);
				var top = Math.floor(windowHeight * (1 - view.top) - height);
				// console.log('top', view.top,(1-view.top), top)

				view.windowLeft = left;
				view.windowTop = windowHeight * view.top;
				view.windowWidth = width;
				view.windowHeight = height;
			}

			_MultiviewControlOptionBoxControlJs.updateOptionBoxLocation(views);
			_DHeatmapsUtilitiesJs.update2DHeatmapTitlesLocation(views);
		}
	}

	function animate() {
		render();
		//processClick();
		processSelection();
		//stats.update();

		for (var ii = 0; ii < views.length; ++ii) {
			var view = views[ii];
			if (view.viewType == '3DView') {
				view.controller.update();
			}
		}

		requestAnimationFrame(animate);
	}

	function render() {
		updateSize();
		for (var ii = 0; ii < views.length; ++ii) {

			var view = views[ii];
			if (view.viewType == '3DView') {
				if (view.options.animate) {
					_DViewsPointCloud_selectionJs.animatePointCloudGeometry(view);
					view.System.geometry.attributes.size.needsUpdate = true;
				}
				//if (view.systemMoleculeDataBoolean) {
				//	updateLineBond(view);
				//}
			}
			//view.controller.update();

			var camera = view.camera;

			var width = Math.floor(windowWidth * view.width);
			var height = Math.floor(windowHeight * view.height);
			var left = Math.floor(windowWidth * view.left);
			var top = Math.floor(windowHeight * (1 - view.top) - height);
			// console.log('top', view.top,(1-view.top), top)

			view.windowLeft = left;
			view.windowTop = windowHeight * view.top;
			view.windowWidth = width;
			view.windowHeight = height;

			renderer.setViewport(left, top, width, height);
			renderer.setScissor(left, top, width, height);
			//renderer.clearDepth(); // important for draw fat line
			renderer.setScissorTest(true);
			renderer.setClearColor(0xffffff, 1); // border color
			renderer.clearColor(); // clear color buffer
			renderer.setClearColor(view.background, view.backgroundAlpha);
			//if (view.controllerEnabled) {renderer.setClearColor( view.controllerEnabledBackground );}
			//else {renderer.setClearColor( view.background );}

			camera.aspect = width / height;
			camera.updateProjectionMatrix();
			renderer.clear();
			renderer.render(view.scene, camera);
			//effect.render( view.scene, camera  );
			renderer.render(view.sceneHUD, view.cameraHUD);
		}
	}

	function processSelection() {
		if (activeView != null) {
			if (activeView.viewType == '2DHeatmap') {
				_DHeatmapsSelectionJs.selectionControl(views, activeView, mouseHold);
			}
		}
	}
}

},{"./2DHeatmaps/HeatmapView.js":2,"./2DHeatmaps/Selection/Utilities.js":4,"./2DHeatmaps/Utilities.js":5,"./2DHeatmaps/initialize2DHeatmapSetup.js":8,"./2DHeatmaps/selection.js":9,"./2DHeatmaps/setupOptionBox2DHeatmap.js":10,"./2DHeatmaps/tooltip.js":11,"./3DViews/MoleculeView.js":13,"./3DViews/PointCloud_selection.js":15,"./3DViews/setupOptionBox3DView.js":17,"./3DViews/systemEdge.js":18,"./3DViews/tooltip.js":19,"./MultiviewControl/HUDControl.js":20,"./MultiviewControl/calculateViewportSizes.js":21,"./MultiviewControl/colorLegend.js":22,"./MultiviewControl/controllerControl.js":23,"./MultiviewControl/initializeViewSetups.js":24,"./MultiviewControl/optionBoxControl.js":25,"./MultiviewControl/setupViewBasic.js":26,"./Utilities/arrangeData.js":27,"./Utilities/readDataFile.js":29,"./Utilities/scale.js":31}],2:[function(require,module,exports){
"use strict";

exports.__esModule = true;
exports.arrangeDataToHeatmap = arrangeDataToHeatmap;
exports.getHeatmap = getHeatmap;
exports.updateHeatmap = updateHeatmap;
exports.getHeatmapLabels = getHeatmapLabels;
exports.replotHeatmap = replotHeatmap;

var _UtilitiesJs = require("./Utilities.js");

var _UtilitiesOtherJs = require("../Utilities/other.js");

var _MultiviewControlColorLegendJs = require("../MultiviewControl/colorLegend.js");

function arrangeDataToHeatmap(view) {

	var options = view.options;
	if (options.plotData == 'spatiallyResolvedData') {

		var X = view.options.plotXSpatiallyResolvedData,
		    Y = view.options.plotYSpatiallyResolvedData;
		var XTransform = view.options.plotXTransformSpatiallyResolvedData,
		    YTransform = view.options.plotYTransformSpatiallyResolvedData;

		var Data = view.overallSpatiallyResolvedData;
	}

	if (options.plotData == 'moleculeData') {
		var X = view.options.plotXMoleculeData,
		    Y = view.options.plotYMoleculeData;
		var XTransform = view.options.plotXTransformMoleculeData,
		    YTransform = view.options.plotYTransformMoleculeData;

		var Data = view.overallMoleculeData;
	}

	//console.log(view.spatiallyResolvedData);
	//console.log(view.overallMoleculeData);
	//console.log(Data);

	var numPerSide = view.options.numPerSide;

	var heatmapStep = [];

	var linThres = Math.pow(10, view.options.symlog10thres);

	for (var i = 1; i <= numPerSide; i++) {
		heatmapStep.push("" + i);
	}

	if (XTransform == 'linear') {
		var xValue = function xValue(d) {
			return d[X];
		};
	}
	if (YTransform == 'linear') {
		var yValue = function yValue(d) {
			return d[Y];
		};
	}

	if (XTransform == 'log10') {
		var xValue = function xValue(d) {
			return Math.log10(d[X]);
		};
	}
	if (YTransform == 'log10') {
		var yValue = function yValue(d) {
			return Math.log10(d[Y]);
		};
	}

	if (XTransform == 'neglog10') {
		var xValue = function xValue(d) {
			return Math.log10(-1 * d[X]);
		};
	}
	if (YTransform == 'neglog10') {
		var yValue = function yValue(d) {
			return Math.log10(-1 * d[Y]);
		};
	}

	/*if (XTransform == 'symlog10') {var xValue = function(d) {
 	if (d[X]>0.0){
 		return Math.log10(d[X]) + 3.0;
 	}else if (d[X]<0.0) {
 		return -1*Math.log10(-1*d[X]) - 3.0;
 	}
 	else {
 		return 0.0;
 	}
 }}
 if (YTransform == 'symlog10') {var yValue = function(d) {
 	if (d[Y]>0.0){
 		return Math.log10(d[Y]) + 3.0;
 	}else if (d[Y]<0.0) {
 		return -1*Math.log10(-1*d[Y]) - 3.0;
 	}
 	else {
 		return 0.0;
 	}
 }}
 
 if (XTransform == 'symlogPC') {var xValue = function(d) {
 	if (d[X]>0.0){
 		return Math.log10(d[X]) -2.0;
 	}else if (d[X]<0.0) {
 		return -1*Math.log10(-1*d[X]) + 2.0;
 	}
 	else {
 		return 0.0;
 	}
 }}
 if (YTransform == 'symlogPC') {var yValue = function(d) {
 	if (d[Y]>0.0){
 		return Math.log10(d[Y]) + 4.5;
 	}else if (d[Y]<0.0) {
 		return -1*Math.log10(-1*d[Y]) - 4.5;
 	}
 	else {
 		return 0.0;
 	}
 }}*/

	/*var xMin = Math.floor(d3.min(Data,xValue));
 var xMax = Math.ceil(d3.max(Data,xValue));
 var yMin = Math.floor(d3.min(Data,yValue));
 var yMax = Math.ceil(d3.max(Data,yValue));*/
	var xMin = d3.min(Data, xValue);
	var xMax = d3.max(Data, xValue);
	var yMin = d3.min(Data, yValue);
	var yMax = d3.max(Data, yValue);

	view.xMin = xMin;
	view.xMax = xMax;
	view.yMin = yMin;
	view.yMax = yMax;

	var xScale = d3.scaleQuantize().domain([xMin, xMax]).range(heatmapStep);

	var yScale = d3.scaleQuantize().domain([yMin, yMax]).range(heatmapStep);

	console.log(xMin, xMax, yMin, yMax, numPerSide);

	console.log(xScale, yScale);

	var xMap = function xMap(d) {
		return xScale(xValue(d));
	};
	var yMap = function yMap(d) {
		return yScale(yValue(d));
	};

	view.data = {};
	view.dataXMin = d3.min(Data, xValue);
	view.dataXMax = d3.max(Data, xValue);
	view.dataYMin = d3.min(Data, yValue);
	view.dataYMax = d3.max(Data, yValue);

	view.xScale = xScale;
	view.yScale = yScale;

	//console.log(xScale.invertExtent(""+50))

	for (var i = 0; i < Data.length; i++) {
		var heatmapX = xMap(Data[i]);
		var heatmapY = yMap(Data[i]);

		view.data[heatmapX] = view.data[heatmapX] || {};
		view.data[heatmapX][heatmapY] = view.data[heatmapX][heatmapY] || { list: [], selected: true };
		view.data[heatmapX][heatmapY]['list'].push(Data[i]);
	}

	//console.log(view.data);
}

function getHeatmap(view) {
	var uniforms = {

		color: { value: new THREE.Color(0xffffff) },
		texture: { value: new THREE.TextureLoader().load("textures/sprites/disc.png") }

	};

	var shaderMaterial = new THREE.ShaderMaterial({

		uniforms: uniforms,
		vertexShader: document.getElementById('vertexshader').textContent,
		fragmentShader: document.getElementById('fragmentshader').textContent,

		blending: THREE.AdditiveBlending,
		depthTest: false,
		transparent: true

	});

	var options = view.options;
	var scene = view.scene;

	if (options.plotData == 'spatiallyResolvedData') {
		var X = view.options.plotXSpatiallyResolvedData,
		    Y = view.options.plotYSpatiallyResolvedData;
	}

	if (options.plotData == 'moleculeData') {
		var X = view.options.plotXMoleculeData,
		    Y = view.options.plotYMoleculeData;
	}

	var data = view.data;

	var num = heatmapPointCount(data);

	var geometry = new THREE.BufferGeometry();
	var colors = new Float32Array(num * 3);
	var positions = new Float32Array(num * 3);
	var sizes = new Float32Array(num);
	var alphas = new Float32Array(num);

	var heatmapInformation = [];
	//console.log(spatiallyResolvedData.length);
	//console.log(num);

	var lut = new THREE.Lut(options.colorMap, 500);
	lut.setMax(1000);
	lut.setMin(0);
	view.lut = lut;

	var i = 0;
	var i3 = 0;

	//var xPlotScale = d3.scaleLinear().domain([0, options.numPerSide]).range([-50,50]);
	//var yPlotScale = d3.scaleLinear().domain([0, options.numPerSide]).range([-50,50]);
	var xPlotScale = view.xPlotScale;
	var yPlotScale = view.yPlotScale;

	for (var x in data) {
		for (var y in data[x]) {
			var xPlot = xPlotScale(parseFloat(x));
			var yPlot = yPlotScale(parseFloat(y));

			positions[i3 + 0] = xPlot;
			positions[i3 + 1] = yPlot;
			positions[i3 + 2] = 0;

			var numberDatapointsRepresented = countListSelected(data[x][y]['list']);
			if (numberDatapointsRepresented > 0) {
				var color = lut.getColor(numberDatapointsRepresented);

				colors[i3 + 0] = color.r;
				colors[i3 + 1] = color.g;
				colors[i3 + 2] = color.b;
			} else {
				colors[i3 + 0] = 100;
				colors[i3 + 1] = 100;
				colors[i3 + 2] = 100;
			}
			sizes[i] = options.pointCloudSize;
			alphas[i] = options.pointCloudAlpha;

			i++;
			i3 += 3;

			var tempInfo = { x: xPlot - 50,
				y: yPlot - 50,
				numberDatapointsRepresented: numberDatapointsRepresented,
				xStart: view.xScale.invertExtent(x)[0],
				xEnd: view.xScale.invertExtent(x)[1],
				yStart: view.yScale.invertExtent(y)[0],
				yEnd: view.yScale.invertExtent(y)[1] /*,
                                         heatmapX: x,
                                         heatmapY: y*/
			};
			//console.log(tempInfo);
			//console.log(view.xScale.invertExtent(""+xPlot)[0], view.xScale.invertExtent(""+xPlot)[1])
			heatmapInformation.push(tempInfo);
		}
	}

	view.heatmapInformation = heatmapInformation;
	geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
	geometry.setAttribute('customColor', new THREE.BufferAttribute(colors, 3));
	geometry.setAttribute('size', new THREE.BufferAttribute(sizes, 1));
	geometry.setAttribute('alpha', new THREE.BufferAttribute(alphas, 1));

	var System = new THREE.Points(geometry, shaderMaterial);
	//return System;

	//particles.name = 'scatterPoints';

	// view.heatmapPlot = System;
	//view.attributes = particles.attributes;
	//view.geometry = particles.geometry;
	//scene.add(System);

	return System;
}

function updateHeatmap(view) {
	var options = view.options;
	var System = view.heatmapPlot;
	var data = view.data;
	var num = heatmapPointCount(data);
	var colors = new Float32Array(num * 3);
	var sizes = new Float32Array(num);
	var alphas = new Float32Array(num);
	var lut = new THREE.Lut(options.colorMap, 500);
	lut.setMax(1000);
	lut.setMin(0);
	view.lut = lut;
	var i = 0;
	var i3 = 0;
	for (var x in data) {
		for (var y in data[x]) {

			var numberDatapointsRepresented = countListSelected(data[x][y]['list']);
			if (numberDatapointsRepresented > 0) {
				var color = lut.getColor(numberDatapointsRepresented);

				colors[i3 + 0] = color.r;
				colors[i3 + 1] = color.g;
				colors[i3 + 2] = color.b;
				sizes[i] = options.pointCloudSize;
				alphas[i] = options.pointCloudAlpha;
			} else {
				colors[i3 + 0] = 1;
				colors[i3 + 1] = 1;
				colors[i3 + 2] = 1;
				sizes[i] = options.pointCloudSize;
				alphas[i] = options.pointCloudAlpha / 2;
			}
			i++;
			i3 += 3;
		}
	}

	//geometry.addAttribute( 'position', new THREE.BufferAttribute( positions, 3 ) );
	System.geometry.setAttribute('customColor', new THREE.BufferAttribute(colors, 3));
	System.geometry.setAttribute('size', new THREE.BufferAttribute(sizes, 1));
	System.geometry.setAttribute('alpha', new THREE.BufferAttribute(alphas, 1));
}

function getHeatmapLabels(view) {
	var labels = new THREE.Group();
	/*var style = { fontsize: 32, borderColor: {r:0, g:0, b:255, a:1.0}, backgroundColor: {r:255, g:255, b:255, a:1.0} };
 var tempLabel = makeTextSprite( view.yMin.toString(), style );
 tempLabel.position.set(-50,-50,0);
 labels.add(tempLabel);
 
 var tempLabel = makeTextSprite( view.yMax.toString(), style );
 tempLabel.position.set(-50,50,0);
 labels.add(tempLabel);
 
 var tempLabel = makeTextSprite( view.xMin.toString(), style );
 tempLabel.position.set(-50,-50,0);
 labels.add(tempLabel);
 
 var tempLabel = makeTextSprite( view.xMax.toString(), style );
 tempLabel.position.set(50,-50,0);
 labels.add(tempLabel);*/

	var style = { fontsize: 32, borderColor: { r: 0, g: 0, b: 255, a: 1.0 }, backgroundColor: { r: 255, g: 255, b: 255, a: 1.0 } };
	var tempLabel = _UtilitiesOtherJs.makeTextSprite2(view.yMin.toString(), style);
	tempLabel.position.set(-75, -50, 0);
	labels.add(tempLabel);

	var tempLabel = _UtilitiesOtherJs.makeTextSprite2(view.yMax.toString(), style);
	tempLabel.position.set(-75, 50, 0);
	labels.add(tempLabel);

	var tempLabel = _UtilitiesOtherJs.makeTextSprite2(((view.yMax + view.yMin) / 2).toString(), style);
	tempLabel.position.set(-75, 0, 0);
	labels.add(tempLabel);

	var tempLabel = _UtilitiesOtherJs.makeTextSprite2(view.xMin.toString(), style);
	tempLabel.position.set(-50, -60, 0);
	labels.add(tempLabel);

	var tempLabel = _UtilitiesOtherJs.makeTextSprite2(view.xMax.toString(), style);
	tempLabel.position.set(50, -60, 0);
	labels.add(tempLabel);

	var tempLabel = _UtilitiesOtherJs.makeTextSprite2(((view.xMax + view.xMin) / 2).toString(), style);
	tempLabel.position.set(0, -60, 0);
	labels.add(tempLabel);

	view.heatmapLabels = labels;

	return labels;
	//view.scene.add( labels );
}

function replotHeatmap(view) {
	if ("covariance" in view) {
		view.scene.remove(view.covariance);
	}

	if ("comparison" in view) {
		view.scene.remove(view.comparison);
	}

	if ("heatmap" in view) {
		view.scene.remove(view.heatmap);
	}

	if ("PCAGroup" in view) {
		view.scene.remove(view.PCAGroup);
	}
	/*var options = view.options;
 //var options = view.options;
 if (options.plotData == 'spatiallyResolvedData'){
 	arrangeDataToHeatmap(view,view.spatiallyResolvedData);
 }
 
 if (options.plotData == 'spatiallyResolvedData'){
 	arrangeDataToHeatmap(view,view.overallMoleculeData);
 }*/

	arrangeDataToHeatmap(view);
	var heatmap = new THREE.Group();

	var heatmapPlot = getHeatmap(view);
	var heatmapAxis = _UtilitiesJs.getAxis(view);
	//var heatmapLabels = getHeatmapLabels(view);

	heatmap.add(heatmapPlot);
	heatmap.add(heatmapAxis);
	//heatmap.add(heatmapLabels)

	view.heatmap = heatmap;
	view.scene.add(heatmap);
	_MultiviewControlColorLegendJs.changeLegend(view);
	_UtilitiesJs.changeTitle(view);
}

function countListSelected(list) {
	var count = 0;

	for (var i = 0; i < list.length; i++) {
		if (list[i].selected) {
			count += 1;
		}
	}
	return count;
}

function heatmapPointCount(data) {
	var count = 0;
	for (var x in data) {
		for (var y in data[x]) {
			count = count + 1;
		}
	}
	return count;
}

},{"../MultiviewControl/colorLegend.js":22,"../Utilities/other.js":28,"./Utilities.js":5}],3:[function(require,module,exports){
"use strict";

exports.__esModule = true;
exports.arrangeDataForPCA = arrangeDataForPCA;
exports.getPCAHeatmap = getPCAHeatmap;
exports.updatePCAHeatmap = updatePCAHeatmap;
exports.replotPCAHeatmap = replotPCAHeatmap;
exports.initializePCATooltip = initializePCATooltip;

var _UtilitiesJs = require("./Utilities.js");

var _UtilitiesOtherJs = require("../Utilities/other.js");

var _MultiviewControlColorLegendJs = require("../MultiviewControl/colorLegend.js");

function arrangeDataForPCA(view) {

	var options = view.options;
	if (options.plotData == 'spatiallyResolvedData') {

		var X = view.options.plotPCAXSpatiallyResolvedData,
		    Y = view.options.plotPCAYSpatiallyResolvedData;
		var XTransform = view.options.plotPCAXTransformSpatiallyResolvedData,
		    YTransform = view.options.plotPCAYTransformSpatiallyResolvedData;

		var Data = view.overallSpatiallyResolvedData;
		var propertyList = view.plotSetup.spatiallyResolvedPropertyList;

		console.log(view.PCACalculatedSpatiallyResolved != true);

		if (view.PCACalculatedSpatiallyResolved != true) {

			console.log("start PCA");

			var _require = require('ml-pca');

			var PCA = _require.PCA;

			var filtered = propertyList.filter(function (value, index, arr) {
				return value != "atom" && value != "x" && value != "y" && value != "z";
			});

			var arrays = getArrays2(Data, filtered);
			var pca = new PCA(arrays /*, {nCompNIPALS:options.nPCAComponentsSpatiallyResolved}*/);
			var transformed = pca.predict(arrays);

			console.log("Finished Calculating PCA");

			for (var i = 0; i < Data.length; i++) {
				for (var j = 1; j <= transformed.columns; j++) {
					var tempName = "_PC" + j.toString();
					Data[i][tempName] = transformed.data[i][j - 1];
				}
			}
			view.PCACalculatedSpatiallyResolved = true;
			view.PCAResult = pca;

			view.PCAExplainedVariance = {};
			for (var i = 1; i <= pca.getExplainedVariance().length; i++) {
				view.PCAExplainedVariance["_PC" + i] = pca.getExplainedVariance()[i - 1];
			}

			view.PCALoadingMatrix = {};
			var PCALoadingMatrix = pca.getLoadings().data;
			console.log(PCALoadingMatrix);
			console.log(filtered.length);
			for (var i = 1; i <= PCALoadingMatrix.length; i++) {
				view.PCALoadingMatrix["_PC" + i] = {};
				for (var j = 0; j <= filtered.length; j++) {
					view.PCALoadingMatrix["_PC" + i][filtered[j]] = PCALoadingMatrix[i - 1][j];
				}
			}

			console.log("Finished Storing PCA");

			/*view.PCAPropertyListSpatiallyResolved = [];
   		for (var i = 1; i <= options.nPCAComponentsSpatiallyResolved; i++) {
   	view.PCAPropertyListSpatiallyResolved.push("_PC"+i.toString());
   }*/
		}
	}

	if (options.plotData == 'moleculeData') {

		var X = view.options.plotPCAXMoleculeData,
		    Y = view.options.plotPCAYMoleculeData;
		var XTransform = view.options.plotPCAXTransformMoleculeData,
		    YTransform = view.options.plotPCAYTransformMoleculeData;

		var Data = view.overallMoleculeData;
		var propertyList = view.plotSetup.moleculePropertyList;

		console.log(view.PCACalculatedMolecule != true);

		if (view.PCACalculatedMolecule != true) {

			console.log("start PCA");

			var _require2 = require('ml-pca');

			var PCA = _require2.PCA;

			var filtered = propertyList.filter(function (value, index, arr) {
				return value != "atom" && value != "x" && value != "y" && value != "z";
			});

			var arrays = getArrays2(Data, filtered);
			var pca = new PCA(arrays /*, {nCompNIPALS:options.nPCAComponentsMolecule}*/);
			var transformed = pca.predict(arrays);

			console.log("Finished Calculating PCA");

			for (var i = 0; i < Data.length; i++) {
				for (var j = 1; j <= transformed.columns; j++) {
					var tempName = "_PC" + j.toString();
					Data[i][tempName] = transformed.data[i][j - 1];
				}
			}

			view.PCACalculatedMolecule = true;
			view.PCAResult = pca;

			view.PCAExplainedVariance = {};
			for (var i = 1; i <= pca.getExplainedVariance().length; i++) {
				view.PCAExplainedVariance["_PC" + i] = pca.getExplainedVariance()[i - 1];
			}

			view.PCALoadingMatrix = {};
			var PCALoadingMatrix = pca.getLoadings().data;
			console.log(PCALoadingMatrix);
			console.log(filtered.length);
			for (var i = 1; i <= PCALoadingMatrix.length; i++) {
				view.PCALoadingMatrix["_PC" + i] = {};
				for (var j = 0; j <= filtered.length; j++) {
					view.PCALoadingMatrix["_PC" + i][filtered[j]] = PCALoadingMatrix[i - 1][j];
				}
			}

			console.log("Finished Storing PCA");

			view.PCAPropertyListMolecule = [];

			/*for (var i = 1; i <= options.nPCAComponentsMolecule; i++) {
   	view.PCAPropertyListMolecule.push("_PC"+i.toString());
   }*/
		}
	}

	var numPerSide = view.options.numPerSide;

	var heatmapStep = [];

	for (var i = 1; i <= numPerSide; i++) {
		heatmapStep.push("" + i);
	}

	var xValue = function xValue(d) {
		return d[X];
	};
	var yValue = function yValue(d) {
		return d[Y];
	};

	var xMin = d3.min(Data, xValue);
	var xMax = d3.max(Data, xValue);
	var yMin = d3.min(Data, yValue);
	var yMax = d3.max(Data, yValue);

	view.xMin = xMin;
	view.xMax = xMax;
	view.yMin = yMin;
	view.yMax = yMax;

	var xScale = d3.scaleQuantize().domain([xMin, xMax]).range(heatmapStep);

	var yScale = d3.scaleQuantize().domain([yMin, yMax]).range(heatmapStep);

	var xMap = function xMap(d) {
		return xScale(xValue(d));
	};
	var yMap = function yMap(d) {
		return yScale(yValue(d));
	};

	view.data = {};
	view.dataXMin = d3.min(Data, xValue);
	view.dataXMax = d3.max(Data, xValue);
	view.dataYMin = d3.min(Data, yValue);
	view.dataYMax = d3.max(Data, yValue);

	view.xScale = xScale;
	view.yScale = yScale;

	//console.log(xScale.invertExtent(""+50))

	for (var i = 0; i < Data.length; i++) {
		var heatmapX = xMap(Data[i]);
		var heatmapY = yMap(Data[i]);

		view.data[heatmapX] = view.data[heatmapX] || {};
		view.data[heatmapX][heatmapY] = view.data[heatmapX][heatmapY] || { list: [], selected: true };
		view.data[heatmapX][heatmapY]['list'].push(Data[i]);
	}

	var PCAResultText = "";
	PCAResultText += X + " explained: " + view.PCAExplainedVariance[X].toExponential(4) + '<br>';

	for (var property in view.PCALoadingMatrix[X]) {
		if (typeof view.PCALoadingMatrix[X][property] !== "undefined") {
			PCAResultText += property + ": " + view.PCALoadingMatrix[X][property].toExponential(4) + '<br>';
		}
	}

	PCAResultText += '<br>';

	PCAResultText += Y + " explained: " + view.PCAExplainedVariance[Y].toExponential(4) + '<br>';

	for (var property in view.PCALoadingMatrix[Y]) {
		if (typeof view.PCALoadingMatrix[Y][property] !== "undefined") {
			PCAResultText += property + ": " + view.PCALoadingMatrix[Y][property].toExponential(4) + '<br>';
		}
	}

	view.PCARestultTextWindow.innerHTML = PCAResultText;
}

function getPCAHeatmap(view) {
	var uniforms = {

		color: { value: new THREE.Color(0xffffff) },
		texture: { value: new THREE.TextureLoader().load("textures/sprites/disc.png") }

	};

	var shaderMaterial = new THREE.ShaderMaterial({

		uniforms: uniforms,
		vertexShader: document.getElementById('vertexshader').textContent,
		fragmentShader: document.getElementById('fragmentshader').textContent,

		blending: THREE.AdditiveBlending,
		depthTest: false,
		transparent: true

	});

	var options = view.options;
	var scene = view.scene;

	if (options.plotData == 'spatiallyResolvedData') {
		var X = view.options.plotPCAXSpatiallyResolvedData,
		    Y = view.options.plotPCAYSpatiallyResolvedData;
	}

	if (options.plotData == 'moleculeData') {
		var X = view.options.plotPCAXMoleculeData,
		    Y = view.options.plotPCAYMoleculeData;
	}

	var data = view.data;

	var num = heatmapPointCount(data);

	var geometry = new THREE.BufferGeometry();
	var colors = new Float32Array(num * 3);
	var positions = new Float32Array(num * 3);
	var sizes = new Float32Array(num);
	var alphas = new Float32Array(num);

	var PCAHeatmapInformation = [];
	//console.log(spatiallyResolvedData.length);
	//console.log(num);

	var lut = new THREE.Lut(options.colorMap, 500);
	lut.setMax(1000);
	lut.setMin(0);
	view.lut = lut;

	var i = 0;
	var i3 = 0;

	//var xPlotScale = d3.scaleLinear().domain([0, options.numPerSide]).range([-50,50]);
	//var yPlotScale = d3.scaleLinear().domain([0, options.numPerSide]).range([-50,50]);
	var xPlotScale = view.xPlotScale;
	var yPlotScale = view.yPlotScale;

	for (var x in data) {
		for (var y in data[x]) {
			var xPlot = xPlotScale(parseFloat(x));
			var yPlot = yPlotScale(parseFloat(y));

			positions[i3 + 0] = xPlot;
			positions[i3 + 1] = yPlot;
			positions[i3 + 2] = 0;

			var numberDatapointsRepresented = countListSelected(data[x][y]['list']);
			if (numberDatapointsRepresented > 0) {
				var color = lut.getColor(numberDatapointsRepresented);

				colors[i3 + 0] = color.r;
				colors[i3 + 1] = color.g;
				colors[i3 + 2] = color.b;
			} else {
				colors[i3 + 0] = 100;
				colors[i3 + 1] = 100;
				colors[i3 + 2] = 100;
			}
			sizes[i] = options.pointCloudSize;
			alphas[i] = options.pointCloudAlpha;

			i++;
			i3 += 3;

			var tempInfo = { x: xPlot - 50,
				y: yPlot - 50,
				numberDatapointsRepresented: numberDatapointsRepresented,
				xStart: view.xScale.invertExtent(x)[0],
				xEnd: view.xScale.invertExtent(x)[1],
				yStart: view.yScale.invertExtent(y)[0],
				yEnd: view.yScale.invertExtent(y)[1] /*,
                                         heatmapX: x,
                                         heatmapY: y*/
			};
			//console.log(tempInfo);
			//console.log(view.xScale.invertExtent(""+xPlot)[0], view.xScale.invertExtent(""+xPlot)[1])
			PCAHeatmapInformation.push(tempInfo);
		}
	}

	view.PCAHeatmapInformation = PCAHeatmapInformation;
	geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
	geometry.setAttribute('customColor', new THREE.BufferAttribute(colors, 3));
	geometry.setAttribute('size', new THREE.BufferAttribute(sizes, 1));
	geometry.setAttribute('alpha', new THREE.BufferAttribute(alphas, 1));

	var System = new THREE.Points(geometry, shaderMaterial);
	//return System;

	//particles.name = 'scatterPoints';

	view.PCAHeatmapPlot = System;
	//view.attributes = particles.attributes;
	//view.geometry = particles.geometry;
	//scene.add(System);

	return System;
}

function updatePCAHeatmap(view) {
	var options = view.options;
	var System = view.PCAHeatmapPlot;
	var data = view.data;
	var num = heatmapPointCount(data);
	var colors = new Float32Array(num * 3);
	var sizes = new Float32Array(num);
	var alphas = new Float32Array(num);
	var lut = new THREE.Lut(options.colorMap, 500);
	lut.setMax(1000);
	lut.setMin(0);
	view.lut = lut;
	var i = 0;
	var i3 = 0;
	for (var x in data) {
		for (var y in data[x]) {

			var numberDatapointsRepresented = countListSelected(data[x][y]['list']);
			if (numberDatapointsRepresented > 0) {
				var color = lut.getColor(numberDatapointsRepresented);

				colors[i3 + 0] = color.r;
				colors[i3 + 1] = color.g;
				colors[i3 + 2] = color.b;
				sizes[i] = options.pointCloudSize;
				alphas[i] = options.pointCloudAlpha;
			} else {
				colors[i3 + 0] = 100;
				colors[i3 + 1] = 100;
				colors[i3 + 2] = 100;
				sizes[i] = options.pointCloudSize;
				alphas[i] = options.pointCloudAlpha / 2;
			}

			i++;
			i3 += 3;
		}
	}

	//geometry.addAttribute( 'position', new THREE.BufferAttribute( positions, 3 ) );
	System.geometry.setAttribute('customColor', new THREE.BufferAttribute(colors, 3));
	System.geometry.setAttribute('size', new THREE.BufferAttribute(sizes, 1));
	System.geometry.setAttribute('alpha', new THREE.BufferAttribute(alphas, 1));
}

function replotPCAHeatmap(view) {
	if ("covariance" in view) {
		view.scene.remove(view.covariance);
	}

	if ("heatmap" in view) {
		view.scene.remove(view.heatmap);
	}

	if ("PCAGroup" in view) {
		view.scene.remove(view.PCAGroup);
	}
	/*var options = view.options;
 //var options = view.options;
 if (options.plotData == 'spatiallyResolvedData'){
 	arrangeDataToHeatmap(view,view.spatiallyResolvedData);
 }
 
 if (options.plotData == 'spatiallyResolvedData'){
 	arrangeDataToHeatmap(view,view.overallMoleculeData);
 }*/
	console.log("replotting PCA Heatmap");
	initializePCATooltip(view);
	arrangeDataForPCA(view);
	var PCAGroup = new THREE.Group();

	var PCAPlot = getPCAHeatmap(view);
	var PCAAxis = _UtilitiesJs.getAxis(view);

	PCAGroup.add(PCAPlot);
	PCAGroup.add(PCAAxis);

	view.PCAGroup = PCAGroup;
	view.scene.add(PCAGroup);
	_MultiviewControlColorLegendJs.changeLegend(view);
	_UtilitiesJs.changeTitle(view);
}

// Returns all values of an attribute or mapping function in an array of objects
function pluck(arr, mapper) {
	return arr.map(function (d) {
		return typeof mapper === "string" ? d[mapper] : mapper(d);
	});
}

// Given a data set (an array of objects)
// and a list of columns (an array with a list of numeric columns),
// calculate the Pearson correlation coeffient for each pair of columns
// and return a correlation matrix, where each object takes the form
// {column_a, column_a, correlation}
// Dependencies: pluck

function getArrays(data, cols) {
	var result = [];
	for (var _iterator = cols, _isArray = Array.isArray(_iterator), _i = 0, _iterator = _isArray ? _iterator : _iterator[Symbol.iterator]();;) {
		var _ref;

		if (_isArray) {
			if (_i >= _iterator.length) break;
			_ref = _iterator[_i++];
		} else {
			_i = _iterator.next();
			if (_i.done) break;
			_ref = _i.value;
		}

		var col = _ref;

		var temp = pluck(data, col);
		result.push(temp);
	}
	return result;
}

function getArrays2(data, propertyList) {
	var result = [];
	for (var _iterator2 = data, _isArray2 = Array.isArray(_iterator2), _i2 = 0, _iterator2 = _isArray2 ? _iterator2 : _iterator2[Symbol.iterator]();;) {
		var _ref2;

		if (_isArray2) {
			if (_i2 >= _iterator2.length) break;
			_ref2 = _iterator2[_i2++];
		} else {
			_i2 = _iterator2.next();
			if (_i2.done) break;
			_ref2 = _i2.value;
		}

		var datapoint = _ref2;

		var temp = [];
		for (var _iterator3 = propertyList, _isArray3 = Array.isArray(_iterator3), _i3 = 0, _iterator3 = _isArray3 ? _iterator3 : _iterator3[Symbol.iterator]();;) {
			var _ref3;

			if (_isArray3) {
				if (_i3 >= _iterator3.length) break;
				_ref3 = _iterator3[_i3++];
			} else {
				_i3 = _iterator3.next();
				if (_i3.done) break;
				_ref3 = _i3.value;
			}

			var property = _ref3;

			temp.push(datapoint[property]);
		}
		result.push(temp);
	}
	return result;
}

function countListSelected(list) {
	var count = 0;

	for (var i = 0; i < list.length; i++) {
		if (list[i].selected) {
			count += 1;
		}
	}
	return count;
}

function heatmapPointCount(data) {
	var count = 0;
	for (var x in data) {
		for (var y in data[x]) {
			count = count + 1;
		}
	}
	return count;
}

function initializePCATooltip(view) {

	if (typeof view.PCARestultTextWindow == "undefined") {
		var tempTooltip = document.createElement('div');
		tempTooltip.setAttribute('style', 'cursor: pointer; text-align: left; display:block;');
		tempTooltip.style.position = 'absolute';
		tempTooltip.innerHTML = "";
		//tempTooltip.style.width = 100;
		//tempTooltip.style.height = 100;
		tempTooltip.style.backgroundColor = "black";
		tempTooltip.style.opacity = 0.6;
		tempTooltip.style.color = "white";
		tempTooltip.style.top = 10 + 'px';
		tempTooltip.style.right = 1 + 'px';
		view.PCARestultTextWindow = tempTooltip;
		document.body.appendChild(tempTooltip);
	}
}

},{"../MultiviewControl/colorLegend.js":22,"../Utilities/other.js":28,"./Utilities.js":5,"ml-pca":37}],4:[function(require,module,exports){
"use strict";

exports.__esModule = true;
exports.deselectAllSpatiallyResolvedData = deselectAllSpatiallyResolvedData;
exports.selectAllSpatiallyResolvedData = selectAllSpatiallyResolvedData;
exports.deselectAllMoleculeData = deselectAllMoleculeData;
exports.selectAllMoleculeData = selectAllMoleculeData;
exports.updateAllPlots = updateAllPlots;
exports.updateSelectionFromHeatmap = updateSelectionFromHeatmap;
exports.updateSelectionFromComparison = updateSelectionFromComparison;

var _HeatmapViewJs = require("../HeatmapView.js");

var _PCAViewJs = require("../PCAView.js");

var _comparisonViewJs = require("../comparisonView.js");

//import {updatePointCloudGeometry} from "../../3DViews/PointCloud_selection.js";

var _DViewsPointCloud_selectionJs = require("../../3DViews/PointCloud_selection.js");

var _DViewsMoleculeViewJs = require("../../3DViews/MoleculeView.js");

/*export function heatmapsResetSelection(views){
	selectAll();
	updateAllPlots();
}*/

function deselectAllSpatiallyResolvedData(views, spatiallyResolvedData) {
	for (var i = 0; i < spatiallyResolvedData.length; i++) {
		spatiallyResolvedData[i].selected = false;
	}

	/*for (var ii =  0; ii < views.length; ++ii ) {
 	var view = views[ii];
 	if (view.viewType == '2DHeatmap'){
 		var data = view.data;
 		for (var x in data){
 			for (var y in data[x]){
 				data[x][y].selected = false;
 			}
 		}
 	}
 }*/
}

function selectAllSpatiallyResolvedData(views, spatiallyResolvedData) {
	for (var i = 0; i < spatiallyResolvedData.length; i++) {
		spatiallyResolvedData[i].selected = true;
	}

	/*for (var ii =  0; ii < views.length; ++ii ) {
 	var view = views[ii];
 	if (view.viewType == '2DHeatmap'){
 		var data = view.data;
 		for (var x in data){
 			for (var y in data[x]){
 				data[x][y].selected = true;
 			}
 		}
 	}
 }*/
}

function deselectAllMoleculeData(views, overallMoleculeData) {
	for (var i = 0; i < overallMoleculeData.length; i++) {
		overallMoleculeData[i].selected = false;
	}
}

function selectAllMoleculeData(views, overallMoleculeData) {
	for (var i = 0; i < overallMoleculeData.length; i++) {
		overallMoleculeData[i].selected = true;
	}
}

function updateAllPlots(views) {
	for (var ii = 0; ii < views.length; ++ii) {
		var view = views[ii];
		if (view.viewType == '2DHeatmap' && view.options.plotType == "Heatmap") {
			_HeatmapViewJs.updateHeatmap(view);
		}
		if (view.viewType == '2DHeatmap' && view.options.plotType == "Comparison") {
			_comparisonViewJs.updateComparison(view);
		}
		if (view.viewType == '2DHeatmap' && view.options.plotType == 'Dim. Reduction') {
			_PCAViewJs.updatePCAHeatmap(view);
		}
	}

	for (var ii = 0; ii < views.length; ++ii) {
		var view = views[ii];
		if (view.viewType == '3DView') {
			//if (view.System != null){updatePointCloudGeometry(view);}
			if (view.systemSpatiallyResolvedDataBoolean) {
				_DViewsPointCloud_selectionJs.updatePointCloudGeometry(view);
				if (view.options.PBCBoolean) {
					_DViewsPointCloud_selectionJs.updatePointCloudPeriodicReplicates(view);
				}
			}
			if (view.systemMoleculeDataBoolean) {
				_DViewsMoleculeViewJs.changeMoleculeGeometry(view);
				if (view.options.PBCBoolean) {
					_DViewsMoleculeViewJs.changeMoleculePeriodicReplicates(view);
				}
			}
		}
	}
}

function updateSelectionFromHeatmap(view) {
	console.log('called update heatmap');
	var data = view.data;
	for (var x in data) {
		for (var y in data[x]) {
			if (data[x][y].selected) {
				for (var i = 0; i < data[x][y]['list'].length; i++) {
					data[x][y]['list'][i].selected = true;
				}
			}
			/*else {
   	for (var i = 0; i < data[x][y]['list'].length; i++) {
   		data[x][y]['list'][i].selected = false;
   	}
   }*/
		}
	}
}

function updateSelectionFromComparison(view) {
	console.log('called update comparison');
	var overallData = view.data;

	console.log(Object.keys(overallData));
	Object.keys(overallData).forEach(function (systemName, index) {
		var data = overallData[systemName].data;
		for (var x in data) {
			for (var y in data[x]) {
				if (data[x][y].selected) {
					for (var i = 0; i < data[x][y]['list'].length; i++) {
						data[x][y]['list'][i].selected = true;
					}
				}
			}
		}
	});
}

},{"../../3DViews/MoleculeView.js":13,"../../3DViews/PointCloud_selection.js":15,"../HeatmapView.js":2,"../PCAView.js":3,"../comparisonView.js":6}],5:[function(require,module,exports){
"use strict";

exports.__esModule = true;
exports.getAxis = getAxis;
exports.addTitle = addTitle;
exports.changeTitle = changeTitle;
exports.update2DHeatmapTitlesLocation = update2DHeatmapTitlesLocation;

function getAxis(view) {
	var geometry = new THREE.Geometry();
	geometry.vertices.push(new THREE.Vector3(-50, -50, 0));
	geometry.vertices.push(new THREE.Vector3(50, -50, 0));
	geometry.vertices.push(new THREE.Vector3(50, 50, 0));
	geometry.vertices.push(new THREE.Vector3(-50, 50, 0));
	geometry.vertices.push(new THREE.Vector3(-50, -50, 0));
	var material = new THREE.LineBasicMaterial({ color: 0xffffff, linewidth: 3 });
	var line = new THREE.Line(geometry, material);

	return line;
	//view.scene.add(line);
}

function addTitle(view) {
	//var titleText = view.plotYTransform + " " + view.plotY + " v.s. " + view.plotXTransform + " " + view.plotX;

	var options = view.options;
	var titleText = "";
	if (options.plotType == "Undefined") {
		titleText += "Undefined Plot";
	}

	if (options.plotType == "Heatmap") {

		if (options.plotData == 'spatiallyResolvedData') {
			var X = view.options.plotXSpatiallyResolvedData,
			    Y = view.options.plotYSpatiallyResolvedData;
			var XTransform = view.options.plotXTransformSpatiallyResolvedData,
			    YTransform = view.options.plotYTransformSpatiallyResolvedData;
		}

		if (options.plotData == 'moleculeData') {
			var X = view.options.plotXMoleculeData,
			    Y = view.options.plotYMoleculeData;
			var XTransform = view.options.plotXTransformMoleculeData,
			    YTransform = view.options.plotYTransformMoleculeData;
		}

		titleText += YTransform + " " + Y + " v.s. " + XTransform + " " + X;
	}

	if (options.plotType == "Covariance") {
		titleText += "Correlation Plot";
	}

	if (options.plotType == "PCA") {
		titleText += "PCA Plot";
	}
	//var titleText = " v.s. ";
	var tempTitle = document.createElement('div');
	tempTitle.style.position = 'absolute';
	//var tempWidth =  Math.max(200, view.windowWidth/2); //calculateTitleSizeWidth(view);
	var tempWidth = 200;
	tempTitle.style.width = tempWidth;
	tempTitle.innerHTML = titleText;
	tempTitle.style.backgroundColor = "black";
	tempTitle.style.opacity = 1.0;
	tempTitle.style.color = "white";
	tempTitle.style.top = view.windowTop + 'px';
	//tempTitle.style.left = view.windowLeft + 'px';
	//tempTitle.style.left = calculateTitlePositionLeft(view, tempWidth) + 'px';
	var tempMargin = (view.windowWidth - tempWidth) / 2;
	tempTitle.style.left = view.windowLeft + tempMargin + 'px';
	console.log(view.windowWidth, tempWidth, tempMargin, tempTitle.style.left);
	view.title = tempTitle;
	document.body.appendChild(tempTitle);
}

function changeTitle(view) {
	//var old_title = document.getElementById("uploader");
	//document.removeChild(view.title);
	view.title.parentNode.removeChild(view.title);
	addTitle(view);
}

function update2DHeatmapTitlesLocation(views) {
	setTimeout(function () {
		for (var ii = 0; ii < views.length; ++ii) {
			var view = views[ii];
			if (view.viewType == '2DHeatmap') {
				//var tempWidth =  Math.max(200, view.windowWidth/2); //calculateTitleSizeWidth(view);
				var tempWidth = 200;
				view.title.style.width = tempWidth;
				var tempMargin = Math.max((view.windowWidth - tempWidth) / 2, 200);
				view.title.style.left = view.windowLeft + tempMargin + 'px';
				view.title.style.top = view.windowTop + 'px';
			}
		}
	}, 30);
}

function calculateTitleSizeWidth(view) {
	return Math.max(200, view.windowWidth / 2);
}

function calculateTitlePositionLeft(view, elementWidth) {
	var margin = (view.windowWidth - elementWidth) / 2;
	console.log(view.windowWidth, elementWidth, margin);
	return view.windowLeft + margin;
}

},{}],6:[function(require,module,exports){
"use strict";

exports.__esModule = true;
exports.arrangeDataToComparison = arrangeDataToComparison;
exports.getComparison = getComparison;
exports.updateComparison = updateComparison;
exports.getHeatmapLabels = getHeatmapLabels;
exports.replotComparison = replotComparison;

var _UtilitiesJs = require("./Utilities.js");

var _UtilitiesOtherJs = require("../Utilities/other.js");

var _MultiviewControlColorLegendJs = require("../MultiviewControl/colorLegend.js");

function arrangeDataToComparison(view) {

	var options = view.options;
	if (options.plotData == 'spatiallyResolvedData') {

		var X = view.options.plotXSpatiallyResolvedData,
		    Y = view.options.plotYSpatiallyResolvedData;
		var XTransform = view.options.plotXTransformSpatiallyResolvedData,
		    YTransform = view.options.plotYTransformSpatiallyResolvedData;

		var Data = view.overallSpatiallyResolvedData;
	}

	if (options.plotData == 'moleculeData') {
		var X = view.options.plotXMoleculeData,
		    Y = view.options.plotYMoleculeData;
		var XTransform = view.options.plotXTransformMoleculeData,
		    YTransform = view.options.plotYTransformMoleculeData;

		var Data = view.overallMoleculeData;
	}

	var numPerSide = view.options.numPerSide;

	var heatmapStep = [];

	var linThres = Math.pow(10, view.options.symlog10thres);

	for (var i = 1; i <= numPerSide; i++) {
		heatmapStep.push("" + i);
	}

	if (XTransform == 'linear') {
		var xValue = function xValue(d) {
			return d[X];
		};
	}
	if (YTransform == 'linear') {
		var yValue = function yValue(d) {
			return d[Y];
		};
	}

	if (XTransform == 'log10') {
		var xValue = function xValue(d) {
			return Math.log10(d[X]);
		};
	}
	if (YTransform == 'log10') {
		var yValue = function yValue(d) {
			return Math.log10(d[Y]);
		};
	}

	if (XTransform == 'neglog10') {
		var xValue = function xValue(d) {
			return Math.log10(-1 * d[X]);
		};
	}
	if (YTransform == 'neglog10') {
		var yValue = function yValue(d) {
			return Math.log10(-1 * d[Y]);
		};
	}

	var xMin = d3.min(Data, xValue);
	var xMax = d3.max(Data, xValue);
	var yMin = d3.min(Data, yValue);
	var yMax = d3.max(Data, yValue);

	view.xMin = xMin;
	view.xMax = xMax;
	view.yMin = yMin;
	view.yMax = yMax;

	var xScale = d3.scaleQuantize().domain([xMin, xMax]).range(heatmapStep);

	var yScale = d3.scaleQuantize().domain([yMin, yMax]).range(heatmapStep);

	console.log(xMin, xMax, yMin, yMax, numPerSide);

	console.log(xScale, yScale);

	var xMap = function xMap(d) {
		return xScale(xValue(d));
	};
	var yMap = function yMap(d) {
		return yScale(yValue(d));
	};

	view.data = {};
	view.dataXMin = d3.min(Data, xValue);
	view.dataXMax = d3.max(Data, xValue);
	view.dataYMin = d3.min(Data, yValue);
	view.dataYMax = d3.max(Data, yValue);

	view.xScale = xScale;
	view.yScale = yScale;

	//console.log(xScale.invertExtent(""+50))
	var colorArray = [[1, 0, 0], [0, 1, 0], [0, 0, 1], [1, 1, 0], [1, 0, 1], [0, 1, 1], [1, 1, 1]];
	var count = 0;
	Data.forEach(function (datapoint) {
		var heatmapX = xMap(datapoint);
		var heatmapY = yMap(datapoint);

		if (!view.data[datapoint.name]) {
			view.data[datapoint.name] = { color: colorArray[count], data: {} };count += 1;
		}
		if (!view.data[datapoint.name].data[heatmapX]) {
			view.data[datapoint.name].data[heatmapX] = {};
		}
		if (!view.data[datapoint.name].data[heatmapX][heatmapY]) {
			view.data[datapoint.name].data[heatmapX][heatmapY] = { list: [], selected: true };
		}
		view.data[datapoint.name].data[heatmapX][heatmapY]['list'].push(datapoint);
	});
}

function getComparison(view) {
	var uniforms = {

		color: { value: new THREE.Color(0xffffff) },
		texture: { value: new THREE.TextureLoader().load("textures/sprites/disc.png") }

	};

	var shaderMaterial = new THREE.ShaderMaterial({

		uniforms: uniforms,
		vertexShader: document.getElementById('vertexshader').textContent,
		fragmentShader: document.getElementById('fragmentshader').textContent,

		blending: THREE.AdditiveBlending,
		depthTest: false,
		transparent: true

	});

	var options = view.options;
	var scene = view.scene;

	if (options.plotData == 'spatiallyResolvedData') {
		var X = view.options.plotXSpatiallyResolvedData,
		    Y = view.options.plotYSpatiallyResolvedData;
	}

	if (options.plotData == 'moleculeData') {
		var X = view.options.plotXMoleculeData,
		    Y = view.options.plotYMoleculeData;
	}

	var systemPlots = {};
	var overallData = view.data;

	Object.keys(overallData).forEach(function (systemName, index) {
		var data = overallData[systemName].data;
		var num = comparisonPointCount(data);
		var color = overallData[systemName].color;
		console.log(systemName, data, color, num);

		var geometry = new THREE.BufferGeometry();
		var colors = new Float32Array(num * 3);
		var positions = new Float32Array(num * 3);
		var sizes = new Float32Array(num);
		var alphas = new Float32Array(num);

		var heatmapInformation = [];

		var lut = new THREE.Lut(options.colorMap, 500);
		lut.setMax(1000);
		lut.setMin(0);
		view.lut = lut;

		var i = 0;
		var i3 = 0;

		var xPlotScale = view.xPlotScale;
		var yPlotScale = view.yPlotScale;

		for (var x in data) {
			for (var y in data[x]) {
				var xPlot = xPlotScale(parseFloat(x));
				var yPlot = yPlotScale(parseFloat(y));

				positions[i3 + 0] = xPlot;
				positions[i3 + 1] = yPlot;
				positions[i3 + 2] = 0;

				var numberDatapointsRepresented = countListSelected(data[x][y].list);
				if (numberDatapointsRepresented > 0) {

					colors[i3 + 0] = color[0];
					colors[i3 + 1] = color[1];
					colors[i3 + 2] = color[2];
					sizes[i] = options.pointCloudSize;
					alphas[i] = options.pointCloudAlpha;
				} else {
					colors[i3 + 0] = 100;
					colors[i3 + 1] = 100;
					colors[i3 + 2] = 100;
					sizes[i] = options.pointCloudSize;
					alphas[i] = options.pointCloudAlpha / 2;
				}

				i++;
				i3 += 3;
				/*
    var tempInfo = {x:xPlot-50, 
                    y:yPlot-50, 
                    numberDatapointsRepresented: numberDatapointsRepresented,
                    xStart: view.xScale.invertExtent(x)[0],
                    xEnd: 	view.xScale.invertExtent(x)[1],
                    yStart: view.yScale.invertExtent(y)[0],
                    yEnd: 	view.yScale.invertExtent(y)[1],
                    };
    heatmapInformation.push(tempInfo)*/
			}
		}

		// view.heatmapInformation = heatmapInformation;
		geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
		geometry.setAttribute('customColor', new THREE.BufferAttribute(colors, 3));
		geometry.setAttribute('size', new THREE.BufferAttribute(sizes, 1));
		geometry.setAttribute('alpha', new THREE.BufferAttribute(alphas, 1));

		var System = new THREE.Points(geometry, shaderMaterial);
		systemPlots[systemName] = System;
	});

	// view.comparisonPlot = systemPlots;

	return systemPlots;
}

function updateComparison(view) {
	var options = view.options;
	var overallData = view.data;

	console.log(Object.keys(overallData));
	Object.keys(overallData).forEach(function (systemName, index) {
		var data = overallData[systemName].data;
		var num = comparisonPointCount(data);
		var color = overallData[systemName].color;
		console.log(systemName, data, color, num);

		var geometry = new THREE.BufferGeometry();
		var colors = new Float32Array(num * 3);
		var sizes = new Float32Array(num);
		var alphas = new Float32Array(num);

		var plot = view.comparisonPlots[systemName];

		var i = 0;
		var i3 = 0;

		for (var x in data) {
			for (var y in data[x]) {

				var numberDatapointsRepresented = countListSelected(data[x][y].list);
				if (numberDatapointsRepresented > 0) {

					colors[i3 + 0] = color[0];
					colors[i3 + 1] = color[1];
					colors[i3 + 2] = color[2];
					sizes[i] = options.pointCloudSize;
					alphas[i] = options.pointCloudAlpha;
				} else {
					colors[i3 + 0] = 100;
					colors[i3 + 1] = 100;
					colors[i3 + 2] = 100;
					sizes[i] = options.pointCloudSize;
					alphas[i] = options.pointCloudAlpha / 2;
				}

				i++;
				i3 += 3;
			}
		}

		// view.heatmapInformation = heatmapInformation;
		plot.geometry.setAttribute('customColor', new THREE.BufferAttribute(colors, 3));
		plot.geometry.setAttribute('size', new THREE.BufferAttribute(sizes, 1));
		plot.geometry.setAttribute('alpha', new THREE.BufferAttribute(alphas, 1));
	});
}

function getHeatmapLabels(view) {
	var labels = new THREE.Group();

	var style = { fontsize: 32, borderColor: { r: 0, g: 0, b: 255, a: 1.0 }, backgroundColor: { r: 255, g: 255, b: 255, a: 1.0 } };
	var tempLabel = _UtilitiesOtherJs.makeTextSprite2(view.yMin.toString(), style);
	tempLabel.position.set(-75, -50, 0);
	labels.add(tempLabel);

	var tempLabel = _UtilitiesOtherJs.makeTextSprite2(view.yMax.toString(), style);
	tempLabel.position.set(-75, 50, 0);
	labels.add(tempLabel);

	var tempLabel = _UtilitiesOtherJs.makeTextSprite2(((view.yMax + view.yMin) / 2).toString(), style);
	tempLabel.position.set(-75, 0, 0);
	labels.add(tempLabel);

	var tempLabel = _UtilitiesOtherJs.makeTextSprite2(view.xMin.toString(), style);
	tempLabel.position.set(-50, -60, 0);
	labels.add(tempLabel);

	var tempLabel = _UtilitiesOtherJs.makeTextSprite2(view.xMax.toString(), style);
	tempLabel.position.set(50, -60, 0);
	labels.add(tempLabel);

	var tempLabel = _UtilitiesOtherJs.makeTextSprite2(((view.xMax + view.xMin) / 2).toString(), style);
	tempLabel.position.set(0, -60, 0);
	labels.add(tempLabel);

	view.heatmapLabels = labels;

	return labels;
	//view.scene.add( labels );
}

function replotComparison(view) {
	if ("covariance" in view) {
		view.scene.remove(view.covariance);
	}

	if ("comparison" in view) {
		view.scene.remove(view.comparison);
	}

	if ("heatmap" in view) {
		view.scene.remove(view.heatmap);
	}

	if ("PCAGroup" in view) {
		view.scene.remove(view.PCAGroup);
	}
	/*var options = view.options;
 //var options = view.options;
 if (options.plotData == 'spatiallyResolvedData'){
 	arrangeDataToHeatmap(view,view.spatiallyResolvedData);
 }
 
 if (options.plotData == 'spatiallyResolvedData'){
 	arrangeDataToHeatmap(view,view.overallMoleculeData);
 }*/

	arrangeDataToComparison(view);
	console.log(view.data);
	var comparison = new THREE.Group();

	var comparisonPlots = getComparison(view);
	var comparisonAxis = _UtilitiesJs.getAxis(view);
	//var heatmapLabels = getHeatmapLabels(view);

	for (var systemName in comparisonPlots) {
		comparison.add(comparisonPlots[systemName]);
	}
	comparison.add(comparisonAxis);
	//heatmap.add(heatmapLabels)
	view.comparisonPlots = comparisonPlots;
	view.comparison = comparison;
	view.scene.add(comparison);
	_MultiviewControlColorLegendJs.changeLegend(view);
	_UtilitiesJs.changeTitle(view);
}

function countListSelected(list) {
	var count = 0;

	for (var i = 0; i < list.length; i++) {
		if (list[i].selected) {
			count += 1;
		}
	}
	return count;
}

function comparisonPointCount(data) {
	var count = 0;
	for (var x in data) {
		for (var y in data[x]) {
			count = count + 1;
		}
	}

	return count;
}

},{"../MultiviewControl/colorLegend.js":22,"../Utilities/other.js":28,"./Utilities.js":5}],7:[function(require,module,exports){
"use strict";

exports.__esModule = true;
exports.arrangeDataForCovariance = arrangeDataForCovariance;
exports.getCovariance = getCovariance;
exports.updateCovariance = updateCovariance;
exports.replotCovariance = replotCovariance;

var _UtilitiesJs = require("./Utilities.js");

var _UtilitiesOtherJs = require("../Utilities/other.js");

var _MultiviewControlColorLegendJs = require("../MultiviewControl/colorLegend.js");

function arrangeDataForCovariance(view) {

	var options = view.options;
	if (options.plotData == 'spatiallyResolvedData') {

		var Transform = view.options.covarianceTransformSpatiallyResolvedData;

		var Data = view.overallSpatiallyResolvedData;
		var propertyList = view.plotSetup.spatiallyResolvedPropertyList;
	}

	if (options.plotData == 'moleculeData') {

		var Transform = view.options.covarianceTransformMoleculeData;

		var Data = view.overallMoleculeData;
		var propertyList = view.plotSetup.moleculePropertyList;
	}

	/*var meanDict = {};
 
 
 for (var i=0; i<propertyList.length; i++){
 	if (Transform == 'linear') {var value = function(d) {return d[propertyList[i]];}}
 	if (Transform == 'log10')  {var value = function(d) {return Math.log10(d[propertyList[i]]);};}
 	var tempMean = d3.min(Data, value);
 	meanDict[propertyList[i]] = tempMean
 }
 
 
 
 
 view.data = {}
 
 for (var i=0; i<propertyList.length; i++){
 	for (var j=0; j<i; j++){
 
 	}
 
 }*/
	var filtered = propertyList.filter(function (value, index, arr) {
		return value != "atom" && value != "x" && value != "y" && value != "z";
	});

	var corrMatrix = jz.arr.correlationMatrix(Data, filtered);
	var grid = data2grid.grid(corrMatrix);
	view.data = grid;
}

function getCovariance(view) {
	var uniforms = {

		color: { value: new THREE.Color(0xffffff) },
		texture: { value: new THREE.TextureLoader().load("textures/sprites/disc.png") }

	};

	var shaderMaterial = new THREE.ShaderMaterial({

		uniforms: uniforms,
		vertexShader: document.getElementById('vertexshader').textContent,
		fragmentShader: document.getElementById('fragmentshader').textContent,

		blending: THREE.AdditiveBlending,
		depthTest: false,
		transparent: true

	});

	var options = view.options;
	var scene = view.scene;

	if (options.plotData == 'spatiallyResolvedData') {
		//var X = view.options.plotXSpatiallyResolvedData, Y = view.options.plotYSpatiallyResolvedData;
		var propertyList = view.plotSetup.spatiallyResolvedPropertyList;
	}

	if (options.plotData == 'moleculeData') {
		//var X = view.options.plotXMoleculeData, Y = view.options.plotYMoleculeData;
		var propertyList = view.plotSetup.moleculePropertyList;
	}

	var filtered = propertyList.filter(function (value, index, arr) {
		return value != "atom" && value != "x" && value != "y" && value != "z";
	});

	var data = view.data;
	console.log(data);

	//var num = propertyList.length ** 2;
	var num = Math.pow(filtered.length, 2);

	console.log(num);
	console.log(options.pointCloudSize);
	console.log(options.pointCloudAlpha);

	var geometry = new THREE.BufferGeometry();
	var colors = new Float32Array(num * 3);
	var positions = new Float32Array(num * 3);
	var sizes = new Float32Array(num);
	var alphas = new Float32Array(num);

	var covarianceInformation = [];
	//console.log(spatiallyResolvedData.length);
	//console.log(num);

	var lut = new THREE.Lut(options.colorMap, 500);
	lut.setMax(1);
	lut.setMin(0);
	view.lut = lut;

	var i = 0;
	var i3 = 0;

	//var ii = 0, jj = 0;
	//var step = 100 / propertyList.length;
	var step = 100 / filtered.length;
	for (var _iterator = data, _isArray = Array.isArray(_iterator), _i = 0, _iterator = _isArray ? _iterator : _iterator[Symbol.iterator]();;) {
		var _ref;

		if (_isArray) {
			if (_i >= _iterator.length) break;
			_ref = _iterator[_i++];
		} else {
			_i = _iterator.next();
			if (_i.done) break;
			_ref = _i.value;
		}

		var datapoint = _ref;

		positions[i3 + 0] = datapoint.row * step - 50 - step / 2;
		positions[i3 + 1] = datapoint.column * step - 50 - step / 2;
		positions[i3 + 2] = 0;

		var tempCorrelation = datapoint.correlation;

		var color = lut.getColor(1 - Math.abs(tempCorrelation));

		colors[i3 + 0] = color.r;
		colors[i3 + 1] = color.g;
		colors[i3 + 2] = color.b;

		sizes[i] = options.pointCloudSize * 10;
		alphas[i] = options.pointCloudAlpha;

		i++;
		i3 += 3;

		var tempInfo = {
			correlation: tempCorrelation,
			x: datapoint.column_x,
			y: datapoint.column_y
		};
		//console.log(tempInfo);
		//console.log(view.xScale.invertExtent(""+xPlot)[0], view.xScale.invertExtent(""+xPlot)[1])
		covarianceInformation.push(tempInfo);
	}
	console.log(i);

	view.covarianceInformation = covarianceInformation;
	geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
	geometry.setAttribute('customColor', new THREE.BufferAttribute(colors, 3));
	geometry.setAttribute('size', new THREE.BufferAttribute(sizes, 1));
	geometry.setAttribute('alpha', new THREE.BufferAttribute(alphas, 1));

	var System = new THREE.Points(geometry, shaderMaterial);
	//return System;

	//particles.name = 'scatterPoints';

	view.covariancePlot = System;
	//view.attributes = particles.attributes;
	//view.geometry = particles.geometry;
	//scene.add(System);

	return System;
}

function updateCovariance(view) {

	var options = view.options;
	var System = view.covariancePlot;
	var data = view.data;

	if (options.plotData == 'spatiallyResolvedData') {
		//var X = view.options.plotXSpatiallyResolvedData, Y = view.options.plotYSpatiallyResolvedData;
		var propertyList = view.plotSetup.spatiallyResolvedPropertyList;
	}

	if (options.plotData == 'moleculeData') {
		//var X = view.options.plotXMoleculeData, Y = view.options.plotYMoleculeData;
		var propertyList = view.plotSetup.moleculePropertyList;
	}

	var filtered = propertyList.filter(function (value, index, arr) {
		return value != "atom" && value != "x" && value != "y" && value != "z";
	});
	//var num = propertyList.length ** 2;
	var num = Math.pow(filtered.length, 2);
	var colors = new Float32Array(num * 3);
	var sizes = new Float32Array(num);
	var alphas = new Float32Array(num);
	var lut = new THREE.Lut(options.colorMap, 500);
	lut.setMax(1);
	lut.setMin(0);
	view.lut = lut;
	var i = 0;
	var i3 = 0;

	for (var _iterator2 = data, _isArray2 = Array.isArray(_iterator2), _i2 = 0, _iterator2 = _isArray2 ? _iterator2 : _iterator2[Symbol.iterator]();;) {
		var _ref2;

		if (_isArray2) {
			if (_i2 >= _iterator2.length) break;
			_ref2 = _iterator2[_i2++];
		} else {
			_i2 = _iterator2.next();
			if (_i2.done) break;
			_ref2 = _i2.value;
		}

		var datapoint = _ref2;

		var tempCorrelation = datapoint.correlation;

		var color = lut.getColor(1 - Math.abs(tempCorrelation));

		colors[i3 + 0] = color.r;
		colors[i3 + 1] = color.g;
		colors[i3 + 2] = color.b;

		sizes[i] = options.pointCloudSize * 10;
		alphas[i] = options.pointCloudAlpha;

		i++;
		i3 += 3;
	}
	//geometry.addAttribute( 'position', new THREE.BufferAttribute( positions, 3 ) );
	System.geometry.setAttribute('customColor', new THREE.BufferAttribute(colors, 3));
	System.geometry.setAttribute('size', new THREE.BufferAttribute(sizes, 1));
	System.geometry.setAttribute('alpha', new THREE.BufferAttribute(alphas, 1));
}

function replotCovariance(view) {
	if ("covariance" in view) {
		view.scene.remove(view.covariance);
	}

	if ("comparison" in view) {
		view.scene.remove(view.comparison);
	}

	if ("heatmap" in view) {
		view.scene.remove(view.heatmap);
	}

	if ("PCAGroup" in view) {
		view.scene.remove(view.PCAGroup);
	}
	/*var options = view.options;
 //var options = view.options;
 if (options.plotData == 'spatiallyResolvedData'){
 	arrangeDataToHeatmap(view,view.spatiallyResolvedData);
 }
 
 if (options.plotData == 'spatiallyResolvedData'){
 	arrangeDataToHeatmap(view,view.overallMoleculeData);
 }*/

	arrangeDataForCovariance(view);
	var covariance = new THREE.Group();

	var covariancePlot = getCovariance(view);
	var covarianceAxis = _UtilitiesJs.getAxis(view);

	covariance.add(covariancePlot);
	covariance.add(covarianceAxis);

	view.covariance = covariance;
	view.scene.add(covariance);
	_MultiviewControlColorLegendJs.changeLegend(view);
	_UtilitiesJs.changeTitle(view);
}

},{"../MultiviewControl/colorLegend.js":22,"../Utilities/other.js":28,"./Utilities.js":5}],8:[function(require,module,exports){
"use strict";

exports.__esModule = true;
exports.initialize2DHeatmapSetup = initialize2DHeatmapSetup;

var _HeatmapViewJs = require("./HeatmapView.js");

var _covarianceViewJs = require("./covarianceView.js");

var _PCAViewJs = require("./PCAView.js");

var _comparisonViewJs = require('./comparisonView.js');

var _MultiviewControlCalculateViewportSizesJs = require("../MultiviewControl/calculateViewportSizes.js");

var _MultiviewControlColorLegendJs = require("../MultiviewControl/colorLegend.js");

var _SelectionUtilitiesJs = require("./Selection/Utilities.js");

var _UtilitiesSaveDataJs = require("../Utilities/saveData.js");

function initialize2DHeatmapSetup(viewSetup, views, plotSetup) {
			var defaultSetting = {
						background: new THREE.Color(0, 0, 0),
						backgroundAlpha: 1.0,
						controllerEnabledBackground: new THREE.Color(0.1, 0.1, 0.1),
						eye: [0, 0, 150],
						up: [0, 0, 1],
						fov: 45,
						mousePosition: [0, 0],
						viewType: '2DHeatmap',
						/*plotX: 'x',
      plotY: 'x',
      plotXTransform: 'linear',
      plotYTransform: 'linear',*/
						controllerEnabled: false,
						controllerZoom: true,
						controllerRotate: false,
						controllerPan: true,
						xPlotScale: d3.scaleLinear().domain([0, 100]).range([-50, 50]),
						yPlotScale: d3.scaleLinear().domain([0, 100]).range([-50, 50]),
						overallSpatiallyResolvedDataBoolean: false,
						overallMoleculeDataBoolean: false,
						options: new function () {
									this.plotType = "Undefined";
									this.backgroundColor = "#000000";
									this.backgroundAlpha = 0.0;
									this.plotData = "spatiallyResolvedData";
									this.numPerSide = 100;
									this.pointCloudAlpha = 1.0;
									this.pointCloudSize = 3.0;
									this.colorMap = 'rainbow';
									this.resetCamera = function () {
												viewSetup.controller.reset();
									};
									this.replotHeatmap = function () {
												_HeatmapViewJs.replotHeatmap(viewSetup);
									};
									this.fullscreenBoolean = false;
									this.toggleFullscreen = function () {
												if (!viewSetup.options.fullscreenBoolean) {
															_MultiviewControlCalculateViewportSizesJs.fullscreenOneView(views, viewSetup);
															viewSetup.options.fullscreenBoolean = !viewSetup.options.fullscreenBoolean;
												} else {
															_MultiviewControlCalculateViewportSizesJs.deFullscreen(views);
															viewSetup.options.fullscreenBoolean = !viewSetup.options.fullscreenBoolean;
												}
									};
									this.legendX = 8;
									this.legendY = -4;
									this.legendWidth = 0.5;
									this.legendHeight = 6;
									this.legendTick = 5;
									this.legendFontsize = 55;
									this.legendShownBoolean = true;
									this.toggleLegend = function () {
												if (!viewSetup.options.legendShownBoolean) {
															_MultiviewControlColorLegendJs.insertLegend(viewSetup);
															viewSetup.options.legendShownBoolean = !viewSetup.options.legendShownBoolean;
												} else {
															_MultiviewControlColorLegendJs.removeLegend(viewSetup);
															viewSetup.options.legendShownBoolean = !viewSetup.options.legendShownBoolean;
												}
									};
									//this.planeSelection = function(){
									//						planeSelection = !planeSelection;
									//						pointSelection = false;
									//					};
									this.planeSelection = false;
									this.brushSelection = false;
									this.selectionBrushSize = 5;

									this.plotXSpatiallyResolvedData = viewSetup.plotXSpatiallyResolvedData;
									this.plotYSpatiallyResolvedData = viewSetup.plotYSpatiallyResolvedData;
									this.plotXTransformSpatiallyResolvedData = viewSetup.plotXTransformSpatiallyResolvedData;
									this.plotYTransformSpatiallyResolvedData = viewSetup.plotYTransformSpatiallyResolvedData;

									this.plotXMoleculeData = viewSetup.plotXMoleculeData;
									this.plotYMoleculeData = viewSetup.plotYMoleculeData;
									this.plotXTransformMoleculeData = viewSetup.plotXTransformMoleculeData;
									this.plotYTransformMoleculeData = viewSetup.plotYTransformMoleculeData;

									this.selectAllSpatiallyResolvedData = function () {
												_SelectionUtilitiesJs.selectAllSpatiallyResolvedData(views, viewSetup.overallSpatiallyResolvedData);_SelectionUtilitiesJs.updateAllPlots(views);
									};
									this.deselectAllSpatiallyResolvedData = function () {
												_SelectionUtilitiesJs.deselectAllSpatiallyResolvedData(views, viewSetup.overallSpatiallyResolvedData);_SelectionUtilitiesJs.updateAllPlots(views);
									};

									this.selectAllMoleculeData = function () {
												_SelectionUtilitiesJs.selectAllMoleculeData(views, viewSetup.overallMoleculeData);_SelectionUtilitiesJs.updateAllPlots(views);
									};
									this.deselectAllMoleculeData = function () {
												_SelectionUtilitiesJs.deselectAllMoleculeData(views, viewSetup.overallMoleculeData);_SelectionUtilitiesJs.updateAllPlots(views);
									};

									this.saveOverallMoleculeData = function () {
												_UtilitiesSaveDataJs.saveOverallMoleculeData(viewSetup, plotSetup);
									};
									this.saveOverallSpatiallyResolvedData = function () {
												_UtilitiesSaveDataJs.saveOverallSpatiallyResolvedData(viewSetup, plotSetup);
									};

									this.covarianceTransformMoleculeData = "linear";
									this.covarianceTransformSpatiallyResolvedData = "linear";
									this.replotCovariance = function () {
												_covarianceViewJs.replotCovariance(viewSetup);
									};

									this.plotPCAXSpatiallyResolvedData = "_PC1";
									this.plotPCAYSpatiallyResolvedData = "_PC1";
									this.plotPCAXTransformSpatiallyResolvedData = "linear";
									this.plotPCAYTransformSpatiallyResolvedData = "linear";

									this.plotPCAXMoleculeData = "_PC1";
									this.plotPCAYMoleculeData = "_PC1";
									this.plotPCAXTransformMoleculeData = "linear";
									this.plotPCAYTransformMoleculeData = "linear";

									//this.nPCAComponentsSpatiallyResolved = plotSetup.spatiallyResolvedPropertyList.length;
									//this.nPCAComponentsMolecule = plotSetup.moleculePropertyList.length;
									this.replotPCAHeatmap = function () {
												_PCAViewJs.replotPCAHeatmap(viewSetup);
									};

									this.replotComparison = function () {
												_comparisonViewJs.replotComparison(viewSetup);
									};
						}()
			};

			viewSetup = extendObject(viewSetup, defaultSetting);
			//viewSetup = defaultSetting;
}

function extendObject(obj, src) {
			for (var key in src) {
						if (src.hasOwnProperty(key) && !(key in obj)) obj[key] = src[key];
			}
			return obj;
}

},{"../MultiviewControl/calculateViewportSizes.js":21,"../MultiviewControl/colorLegend.js":22,"../Utilities/saveData.js":30,"./HeatmapView.js":2,"./PCAView.js":3,"./Selection/Utilities.js":4,"./comparisonView.js":6,"./covarianceView.js":7}],9:[function(require,module,exports){
'use strict';

exports.__esModule = true;
exports.updatePlaneSelection = updatePlaneSelection;
exports.updateBrushSelection = updateBrushSelection;
exports.selectionControl = selectionControl;

var _SelectionUtilitiesJs = require("./Selection/Utilities.js");

function spawnPlane(view) {

	var selectionPlaneMaterial = new THREE.MeshBasicMaterial({ color: 0xffffff, opacity: 0.5, transparent: true, side: THREE.DoubleSide, needsUpdate: true });
	var scene = view.scene;
	var mousePosition = view.mousePosition;
	var selectionPlane = new THREE.Mesh(new THREE.PlaneBufferGeometry(1, 1), selectionPlaneMaterial);
	selectionPlane.geometry.attributes.position.needsUpdate = true;
	var p = selectionPlane.geometry.attributes.position.array;

	var i = 0;
	p[i++] = mousePosition.x - 0.01;
	p[i++] = mousePosition.y + 0.01;
	p[i++] = mousePosition.z;
	p[i++] = mousePosition.x;
	p[i++] = mousePosition.y + 0.01;
	p[i++] = mousePosition.z;
	p[i++] = mousePosition.x - 0.01;
	p[i++] = mousePosition.y;
	p[i++] = mousePosition.z;
	p[i++] = mousePosition.x;
	p[i++] = mousePosition.y;
	p[i] = mousePosition.z;

	selectionPlane.name = 'selectionPlane';
	view.currentSelectionPlane = selectionPlane;
	scene.add(selectionPlane);
	//updateSelection();
}

function updatePlane(view, plane) {
	var selectionPlaneMaterial = new THREE.MeshBasicMaterial({ color: 0xffffff, opacity: 0.5, transparent: true, side: THREE.DoubleSide, needsUpdate: true });
	var scene = view.scene;

	var mousePosition = view.mousePosition;

	var selectionPlane = new THREE.Mesh(new THREE.PlaneBufferGeometry(1, 1), selectionPlaneMaterial);
	selectionPlane.geometry.attributes.position.needsUpdate = true;

	var pOriginal = plane.geometry.attributes.position.array;

	var originalFirstVerticesCoordx = pOriginal[0],
	    originalFirstVerticesCoordy = pOriginal[1],
	    originalFirstVerticesCoordz = pOriginal[2];

	var p = selectionPlane.geometry.attributes.position.array;
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
	p[i] = mousePosition.z;

	scene.remove(plane);
	selectionPlane.name = 'selectionPlane';
	view.currentSelectionPlane = selectionPlane;
	scene.add(selectionPlane);
	//updateSelection();
}

function spawnBrush(view) {

	var selectionBrushMaterial = new THREE.MeshBasicMaterial({ color: 0xffffff, opacity: 0.5, transparent: true, side: THREE.DoubleSide, needsUpdate: true });
	var scene = view.scene;
	var mousePosition = view.mousePosition;
	var selectionBrush = new THREE.Mesh(new THREE.CircleGeometry(view.options.selectionBrushSize, 32), selectionBrushMaterial);
	//selectionPlane.geometry.attributes.position.needsUpdate = true;
	selectionBrush.position.set(mousePosition.x, mousePosition.y, mousePosition.z);

	selectionBrush.name = 'selectionBrush';
	view.currentSelectionBrush = selectionBrush;
	scene.add(selectionBrush);
	console.log("spawn brush");
	//updateSelection();
}

function updateBrush(view, tempBrush) {

	var mousePosition = view.mousePosition;
	tempBrush.position.set(mousePosition.x, mousePosition.y, mousePosition.z);
	console.log("update brush");
	//updateSelection();
}

function updatePlaneSelection(views, view) {
	//var tempSelectionPlane = temp_view.scene.getObjectByName('selectionPlane');
	var tempSelectionPlane = view.currentSelectionPlane;
	//console.log(tempSelectionPlane)
	if (tempSelectionPlane != null) {

		if (view.viewType == '2DHeatmap' && (view.options.plotType == "Heatmap" || view.options.plotType == 'Dim. Reduction')) {
			var p = tempSelectionPlane.geometry.attributes.position.array;
			var xmin = Math.min(p[0], p[9]),
			    xmax = Math.max(p[0], p[9]),
			    ymin = Math.min(p[1], p[10]),
			    ymax = Math.max(p[1], p[10]);
			var tempx, tempy;

			console.log('updating plane selection');

			var data = view.data;
			var xPlotScale = view.xPlotScale;
			var yPlotScale = view.yPlotScale;
			for (var x in data) {
				for (var y in data[x]) {
					tempx = xPlotScale(parseFloat(x));
					tempy = yPlotScale(parseFloat(y));
					if (tempx > xmin && tempx < xmax && tempy > ymin && tempy < ymax) {
						// data[x][y].selected = true;
						for (var i = 0; i < data[x][y]['list'].length; i++) {
							data[x][y]['list'][i].selected = true;
						}
					}
					// else { data[x][y].selected = false;}
				}
			}
			// updateSelectionFromHeatmap(view);
		}
		if (view.viewType == '2DHeatmap' && view.options.plotType == "Comparison") {
			var p;
			var xmin, xmax, ymin, ymax;
			var tempx, tempy;
			var xPlotScale;
			var yPlotScale;

			(function () {
				p = tempSelectionPlane.geometry.attributes.position.array;
				xmin = Math.min(p[0], p[9]);
				xmax = Math.max(p[0], p[9]);
				ymin = Math.min(p[1], p[10]);
				ymax = Math.max(p[1], p[10]);

				console.log('selecting for comparison');
				var overallData = view.data;
				xPlotScale = view.xPlotScale;
				yPlotScale = view.yPlotScale;

				Object.keys(overallData).forEach(function (systemName, index) {
					var data = overallData[systemName].data;

					for (var x in data) {
						for (var y in data[x]) {
							tempx = xPlotScale(parseFloat(x));
							tempy = yPlotScale(parseFloat(y));
							if (tempx > xmin && tempx < xmax && tempy > ymin && tempy < ymax) {
								// data[x][y].selected = true;
								for (var i = 0; i < data[x][y]['list'].length; i++) {
									data[x][y]['list'][i].selected = true;
								}
							}
							// else { data[x][y].selected = false;}
						}
					}
				});
				// updateSelectionFromComparison(view);	
			})();
		}
	}
	_SelectionUtilitiesJs.updateAllPlots(views);
}

function updateBrushSelection(views, view) {
	//var tempSelectionPlane = temp_view.scene.getObjectByName('selectionPlane');
	var tempSelectionBrush = view.currentSelectionBrush;
	//console.log(tempSelectionPlane)
	if (tempSelectionBrush != null) {
		var location = tempSelectionBrush.position;
		var radius2 = Math.pow(view.options.selectionBrushSize, 2);
		//var xmin = Math.min(p[0],p[9]), xmax = Math.max(p[0],p[9]),
		//	ymin = Math.min(p[1],p[10]), ymax = Math.max(p[1],p[10]);
		var tempx, tempy, temp_dist2;

		console.log('updating plane selection');

		var data = view.data;
		var xPlotScale = view.xPlotScale;
		var yPlotScale = view.yPlotScale;
		for (var x in data) {
			for (var y in data[x]) {
				tempx = xPlotScale(parseFloat(x));
				tempy = yPlotScale(parseFloat(y));
				temp_dist2 = Math.pow(tempx - location.x, 2) + Math.pow(tempy - location.y, 2);
				if (temp_dist2 < radius2) {
					data[x][y].selected = true;
				} else {
					data[x][y].selected = false;
				}
			}
		}
		_SelectionUtilitiesJs.updateSelectionFromHeatmap(view);
	}
	_SelectionUtilitiesJs.updateAllPlots(views);
}

function updatePointSelection(view) {
	console.log(view.INTERSECTED);
	if (view.INTERSECTED != null) {
		console.log('updatePointSelection');
		var x = view.heatmapInformation[view.INTERSECTED].heatmapX;
		var y = view.heatmapInformation[view.INTERSECTED].heatmapY;
		var data = view.data;
		data[x][y].selected = true;
		_SelectionUtilitiesJs.updateSelectionFromHeatmap(view);
	}
	_SelectionUtilitiesJs.updateAllPlots();
}

function applyPlaneSelection(view, mouseHold) {
	var tempPlane = view.currentSelectionPlane;
	//var temp = view.scene.getObjectByName('selectionPlane');
	//console.log(mouseHold)
	if (mouseHold) {
		if (tempPlane != null) {
			updatePlane(view, tempPlane);
		} else {
			spawnPlane(view);
		}
	}
}

function applyBrushSelection(view, mouseHold) {
	//updateBrushSelection(view, mouseHold);
	var tempBrush = view.currentSelectionBrush;
	if (mouseHold) {
		if (tempBrush != null) {
			updateBrush(view, tempBrush);
		} else {
			spawnBrush(view);
		}
	}
}

function selectionControl(views, view, mouseHold) {

	if (view.options.planeSelection) {
		applyPlaneSelection(view, mouseHold);
	}

	if (view.options.brushSelection) {
		applyBrushSelection(view, mouseHold);
		updateBrushSelection(views, view);
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

},{"./Selection/Utilities.js":4}],10:[function(require,module,exports){
"use strict";

exports.__esModule = true;
exports.setupOptionBox2DHeatmap = setupOptionBox2DHeatmap;
exports.setupOptionBox2DHeatmapFolder = setupOptionBox2DHeatmapFolder;
exports.setupOptionBox2DCovarianceFolder = setupOptionBox2DCovarianceFolder;
exports.setupOptionBox2DPCAFolder = setupOptionBox2DPCAFolder;
exports.setupOptionBox2DComparisonFolder = setupOptionBox2DComparisonFolder;

var _covarianceViewJs = require("./covarianceView.js");

var _HeatmapViewJs = require("./HeatmapView.js");

var _comparisonViewJs = require("./comparisonView.js");

var _PCAViewJs = require("./PCAView.js");

var _MultiviewControlColorLegendJs = require("../MultiviewControl/colorLegend.js");

var _UtilitiesOtherJs = require("../Utilities/other.js");

dat.GUI.prototype.removeFolder = function (name) {
	var folder = this.__folders[name];
	if (!folder) {
		return;
	}
	folder.close();
	this.__ul.removeChild(folder.domElement.parentNode);
	delete this.__folders[name];
	this.onResize();
};

function setupOptionBox2DHeatmap(view, plotSetup) {

	var options = view.options;
	var gui = view.gui;
	//gui.remember(options);
	console.log("data test");
	console.log(view.overallMoleculeDataBoolean);
	console.log(view.overallSpatiallyResolvedDataBoolean);

	gui.width = 200;
	//gui.height = 10;

	gui.add(options, 'plotType', { 'Heatmap': 'Heatmap', 'Comparison': 'Comparison', 'Correlation': 'Correlation', 'Dim. Reduction': 'Dim. Reduction' }).name('Plot Type').onChange(function (value) {
		console.log("removing plot");
		try {
			gui.removeFolder("Plot");
		} catch (err) {
			console.log("not exist");
		}

		var plotSetupFolder = gui.addFolder("Plot");
		if (value == "Heatmap") {
			setupOptionBox2DHeatmapFolder(view, plotSetup, plotSetupFolder);
		}

		if (value == "Correlation") {
			setupOptionBox2DCovarianceFolder(view, plotSetup, plotSetupFolder);
		}

		if (value == "Dim. Reduction") {
			setupOptionBox2DPCAFolder(view, plotSetup, plotSetupFolder);
		}

		if (value == "Comparison") {
			setupOptionBox2DComparisonFolder(view, plotSetup, plotSetupFolder);
		}
		//updatePointCloudGeometry(view);
	});

	gui.open();
}

function setupOptionBox2DHeatmapFolder(view, plotSetup, folder) {
	var gui = view.gui;
	var options = view.options;
	if (view.overallSpatiallyResolvedDataBoolean) {
		var spatiallyResolvedFeatureList = plotSetup["spatiallyResolvedPropertyList"];
		var spatiallyResolvedFeatureChoiceObject = _UtilitiesOtherJs.arrayToIdenticalObject(spatiallyResolvedFeatureList);
	}

	if (view.overallMoleculeDataBoolean) {
		var moleculeDataFeatureList = plotSetup["moleculePropertyList"];
		var moleculeDataFeatureChoiceObject = _UtilitiesOtherJs.arrayToIdenticalObject(moleculeDataFeatureList);
	}
	var options = view.options;
	var plotFolder = folder.addFolder('Plot Setting');
	var viewFolder = folder.addFolder('View Control');
	var selectionFolder = folder.addFolder('Selection');

	if (view.overallMoleculeDataBoolean && view.overallSpatiallyResolvedDataBoolean) {
		var moleculeFolder = folder.addFolder('Molecular Data');
		var spatiallyResolvedFolder = folder.addFolder('Spatially Resolved Data');
	}

	var detailFolder = folder.addFolder('Additional Control');

	if (view.overallMoleculeDataBoolean && view.overallSpatiallyResolvedDataBoolean) {
		plotFolder.add(options, 'plotData', { 'spatially resolved': 'spatiallyResolvedData', 'molecular': 'moleculeData' }).name('Plot Data').onChange(function (value) {
			if (view.overallMoleculeDataBoolean && view.overallSpatiallyResolvedDataBoolean) {
				if (value == 'spatiallyResolvedData') {
					moleculeFolder.close();
					spatiallyResolvedFolder.open();
				}
				if (value == 'moleculeData') {
					moleculeFolder.open();
					spatiallyResolvedFolder.close();
				}
			}
		});
	} else {
		plotFolder.add(options, 'plotData').name('Plot Data');
	}

	plotFolder.add(options, 'numPerSide', 10, 10000).step(1).name('Resolution').onChange(function (value) {
		view.xPlotScale = d3.scaleLinear().domain([0, value]).range([-50, 50]);
		view.yPlotScale = d3.scaleLinear().domain([0, value]).range([-50, 50]);
		//options.replotHeatmap.call();
	});
	if (view.overallMoleculeDataBoolean) {
		plotFolder.add(options, 'saveOverallMoleculeData').name('Save Molecule');
	}
	if (view.overallSpatiallyResolvedDataBoolean) {
		plotFolder.add(options, 'saveOverallSpatiallyResolvedData').name('Save Spatially Resolved');
	}

	if (view.overallMoleculeDataBoolean && view.overallSpatiallyResolvedDataBoolean == false) {
		plotFolder.add(options, 'plotXMoleculeData', moleculeDataFeatureChoiceObject).name('X').onChange(function (value) {
			//updatePointCloudGeometry(view);
		});

		plotFolder.add(options, 'plotXTransformMoleculeData', { 'linear': 'linear', 'log10': 'log10', 'log10(-1*)': 'neglog10' /*, 'symlog10': 'symlog10', 'symlogPC': 'symlogPC'*/ }).name('X scale').onChange(function (value) {
			//updatePointCloudGeometry(view);
		});

		plotFolder.add(options, 'plotYMoleculeData', moleculeDataFeatureChoiceObject).name('Y').onChange(function (value) {
			//updatePointCloudGeometry(view);
		});

		plotFolder.add(options, 'plotYTransformMoleculeData', { 'linear': 'linear', 'log10': 'log10', 'log10(-1*)': 'neglog10' /*, 'symlog10': 'symlog10', 'symlogPC': 'symlogPC'*/ }).name('Y scale').onChange(function (value) {
			//updatePointCloudGeometry(view);
		});

		plotFolder.add(options, 'selectAllMoleculeData').name('Select all');
		plotFolder.add(options, 'deselectAllMoleculeData').name('Deselect all');
	}

	if (view.overallMoleculeDataBoolean == false && view.overallSpatiallyResolvedDataBoolean) {
		plotFolder.add(options, 'plotXSpatiallyResolvedData', spatiallyResolvedFeatureChoiceObject).name('X').onChange(function (value) {
			//updatePointCloudGeometry(view);
		});

		plotFolder.add(options, 'plotXTransformSpatiallyResolvedData', { 'linear': 'linear', 'log10': 'log10', 'log10(-1*)': 'neglog10', 'symlog10': 'symlog10', 'symlogPC': 'symlogPC' }).name('X scale').onChange(function (value) {
			//updatePointCloudGeometry(view);
		});

		plotFolder.add(options, 'plotYSpatiallyResolvedData', spatiallyResolvedFeatureChoiceObject).name('Y').onChange(function (value) {
			//updatePointCloudGeometry(view);
		});

		plotFolder.add(options, 'plotYTransformSpatiallyResolvedData', { 'linear': 'linear', 'log10': 'log10', 'log10(-1*)': 'neglog10', 'symlog10': 'symlog10', 'symlogPC': 'symlogPC' }).name('Y scale').onChange(function (value) {
			//updatePointCloudGeometry(view);
		});

		plotFolder.add(options, 'selectAllSpatiallyResolvedData').name('Select all');
		plotFolder.add(options, 'deselectAllSpatiallyResolvedData').name('Deselect all');
	}

	plotFolder.add(options, 'replotHeatmap').name("Plot");
	plotFolder.open();

	viewFolder.add(options, 'colorMap', {
		'rainbow': 'rainbow',
		'cooltowarm': 'cooltowarm',
		'blackbody': 'blackbody',
		'grayscale': 'grayscale',
		'viridis': 'viridis',
		'plasma': 'plasma',
		'inferno': 'inferno',
		'magma': 'magma',
		'Greys': 'Greys',
		'Purples': 'Purples',
		'Blues': 'Blues',
		'Greens': 'Greens',
		'Oranges': 'Oranges',
		'Reds': 'Reds',
		'YlOrBr': 'YlOrBr',
		'YlOrRd': 'YlOrRd',
		'OrRd': 'OrRd',
		'PuRd': 'PuRd',
		'RdPu': 'RdPu',
		'BuPu': 'BuPu',
		'GnBu': 'GnBu',
		'PuBu': 'PuBu',
		'YlGnBu': 'YlGnBu',
		'PuBuGn': 'PuBuGn',
		'BuGn': 'BuGn',
		'YlGn': 'YlGn',
		'binary': 'binary',
		'gist_yarg': 'gist_yarg',
		'gist_gray': 'gist_gray',
		'gray': 'gray',
		'bone': 'bone',
		'pink': 'pink',
		'spring': 'spring',
		'summer': 'summer',
		'autumn': 'autumn',
		'winter': 'winter',
		'cool': 'cool',
		'Wistia': 'Wistia',
		'hot': 'hot',
		'afmhot': 'afmhot',
		'gist_heat': 'gist_heat',
		'copper': 'copper',
		'PiYG': 'PiYG',
		'PRGn': 'PRGn',
		'BrBG': 'BrBG',
		'PuOr': 'PuOr',
		'RdGy': 'RdGy',
		'RdBu': 'RdBu',
		'RdYlBu': 'RdYlBu',
		'RdYlGn': 'RdYlGn',
		'Spectral': 'Spectral',
		'coolwarm': 'coolwarm',
		'bwr': 'bwr',
		'seismic': 'seismic',
		'hsv': 'hsv',
		'Pastel1': 'Pastel1',
		'Pastel2': 'Pastel2',
		'Paired': 'Paired',
		'Accent': 'Accent',
		'Dark2': 'Dark2',
		'Set1': 'Set1',
		'Set2': 'Set2',
		'Set3': 'Set3',
		'tab10': 'tab10',
		'tab20': 'tab20',
		'tab20b': 'tab20b',
		'tab20c': 'tab20c',
		'flag': 'flag',
		'prism': 'prism',
		'ocean': 'ocean',
		'gist_earth': 'gist_earth',
		'terrain': 'terrain',
		'gist_stern': 'gist_stern',
		'gnuplot': 'gnuplot',
		'gnuplot2': 'gnuplot2',
		'CMRmap': 'CMRmap',
		'cubehelix': 'cubehelix',
		'brg': 'brg',
		'gist_rainbow': 'gist_rainbow',
		'rainbow2': 'rainbow2',
		'jet': 'jet',
		'nipy_spectral': 'nipy_spectral',
		'gist_ncar': 'gist_ncar' }).name('Color Scheme').onChange(function (value) {
		_HeatmapViewJs.updateHeatmap(view);
		_MultiviewControlColorLegendJs.changeLegend(view);
	});
	viewFolder.add(options, 'resetCamera').name("Reset camera");
	viewFolder.add(options, 'toggleFullscreen').name('Fullscreen');
	//viewFolder.open();

	viewFolder.add(options, 'pointCloudAlpha', 0, 1).step(0.01).name('Point Opacity').onChange(function (value) {
		_HeatmapViewJs.updateHeatmap(view);
	});
	viewFolder.add(options, 'pointCloudSize', 0, 10).step(0.1).name('Point Size').onChange(function (value) {
		_HeatmapViewJs.updateHeatmap(view);
	});

	selectionFolder.add(options, 'planeSelection').name('with plane').onChange(function (value) {
		if (value == true && options.brushSelection == true) {
			options.brushSelection = false;
			gui.updateDisplay();
		}
	});

	selectionFolder.add(options, 'brushSelection').name('with brush').onChange(function (value) {
		if (value == true && options.planeSelection == true) {
			options.planeSelection = false;
			gui.updateDisplay();
		}
	});

	selectionFolder.add(options, 'selectionBrushSize', 0.5, 10).step(0.1).name('brush size').onChange(function (value) {
		options.brushSelection = false;
		options.planeSelection = false;
		gui.updateDisplay();
	});

	if (view.overallMoleculeDataBoolean && view.overallSpatiallyResolvedDataBoolean) {
		moleculeFolder.add(options, 'plotXMoleculeData', moleculeDataFeatureChoiceObject).name('X').onChange(function (value) {
			//updatePointCloudGeometry(view);
		});

		moleculeFolder.add(options, 'plotXTransformMoleculeData', { 'linear': 'linear', 'log10': 'log10', 'log10(-1*)': 'neglog10', 'symlog10': 'symlog10', 'symlogPC': 'symlogPC' }).name('X scale').onChange(function (value) {
			//updatePointCloudGeometry(view);
		});

		moleculeFolder.add(options, 'plotYMoleculeData', moleculeDataFeatureChoiceObject).name('Y').onChange(function (value) {
			//updatePointCloudGeometry(view);
		});

		moleculeFolder.add(options, 'plotYTransformMoleculeData', { 'linear': 'linear', 'log10': 'log10', 'log10(-1*)': 'neglog10', 'symlog10': 'symlog10', 'symlogPC': 'symlogPC' }).name('Y scale').onChange(function (value) {
			//updatePointCloudGeometry(view);
		});

		moleculeFolder.add(options, 'selectAllMoleculeData').name('Select all');
		moleculeFolder.add(options, 'deselectAllMoleculeData').name('Deselect all');

		moleculeFolder.close();

		spatiallyResolvedFolder.add(options, 'plotXSpatiallyResolvedData', spatiallyResolvedFeatureChoiceObject).name('X').onChange(function (value) {
			//updatePointCloudGeometry(view);
		});

		spatiallyResolvedFolder.add(options, 'plotXTransformSpatiallyResolvedData', { 'linear': 'linear', 'log10': 'log10', 'log10(-1*)': 'neglog10', 'symlog10': 'symlog10', 'symlogPC': 'symlogPC' }).name('X scale').onChange(function (value) {
			//updatePointCloudGeometry(view);
		});

		spatiallyResolvedFolder.add(options, 'plotYSpatiallyResolvedData', spatiallyResolvedFeatureChoiceObject).name('Y').onChange(function (value) {
			//updatePointCloudGeometry(view);
		});

		spatiallyResolvedFolder.add(options, 'plotYTransformSpatiallyResolvedData', { 'linear': 'linear', 'log10': 'log10', 'log10(-1*)': 'neglog10', 'symlog10': 'symlog10', 'symlogPC': 'symlogPC' }).name('Y scale').onChange(function (value) {
			//updatePointCloudGeometry(view);
		});

		spatiallyResolvedFolder.add(options, 'selectAllSpatiallyResolvedData').name('Select all');
		spatiallyResolvedFolder.add(options, 'deselectAllSpatiallyResolvedData').name('Deselect all');

		spatiallyResolvedFolder.open();
	}

	detailFolder.add(options, 'legendX', -10, 10).step(0.1).onChange(function (value) {
		_MultiviewControlColorLegendJs.changeLegend(view);
	});
	detailFolder.add(options, 'legendY', -10, 10).step(0.1).onChange(function (value) {
		_MultiviewControlColorLegendJs.changeLegend(view);
	});
	detailFolder.add(options, 'legendWidth', 0, 1).step(0.1).onChange(function (value) {
		_MultiviewControlColorLegendJs.changeLegend(view);
	});
	detailFolder.add(options, 'legendHeight', 0, 15).step(0.1).onChange(function (value) {
		_MultiviewControlColorLegendJs.changeLegend(view);
	});
	detailFolder.add(options, 'legendTick', 1, 15).step(1).onChange(function (value) {
		_MultiviewControlColorLegendJs.changeLegend(view);
	});
	detailFolder.add(options, 'legendFontsize', 10, 75).step(1).onChange(function (value) {
		_MultiviewControlColorLegendJs.changeLegend(view);
	});
	detailFolder.add(options, 'toggleLegend');

	detailFolder.add(options, 'backgroundAlpha', 0.0, 1.0).step(0.1).name('background transparency').onChange(function (value) {
		view.backgroundAlpha = value;
	});

	detailFolder.addColor(options, 'backgroundColor').name('background').onChange(function (value) {
		view.background = new THREE.Color(value);
	});

	folder.open();
}

function setupOptionBox2DCovarianceFolder(view, plotSetup, folder) {
	var gui = view.gui;
	var options = view.options;

	if (view.overallSpatiallyResolvedDataBoolean) {
		var spatiallyResolvedFeatureList = plotSetup["spatiallyResolvedPropertyList"];
		var spatiallyResolvedFeatureChoiceObject = _UtilitiesOtherJs.arrayToIdenticalObject(spatiallyResolvedFeatureList);
	}

	if (view.overallMoleculeDataBoolean) {
		var moleculeDataFeatureList = plotSetup["moleculePropertyList"];
		var moleculeDataFeatureChoiceObject = _UtilitiesOtherJs.arrayToIdenticalObject(moleculeDataFeatureList);
	}
	var options = view.options;
	var plotFolder = folder.addFolder('Plot Setting');
	var viewFolder = folder.addFolder('View Control');

	if (view.overallMoleculeDataBoolean && view.overallSpatiallyResolvedDataBoolean) {
		var moleculeFolder = folder.addFolder('Molecular Data');
		var spatiallyResolvedFolder = folder.addFolder('Spatially Resolved Data');
	}

	var detailFolder = folder.addFolder('Additional Control');

	if (view.overallMoleculeDataBoolean && view.overallSpatiallyResolvedDataBoolean) {
		plotFolder.add(options, 'plotData', { 'spatially resolved': 'spatiallyResolvedData', 'molecular': 'moleculeData' }).name('Plot Data').onChange(function (value) {
			if (view.overallMoleculeDataBoolean && view.overallSpatiallyResolvedDataBoolean) {
				if (value == 'spatiallyResolvedData') {
					moleculeFolder.close();
					spatiallyResolvedFolder.open();
				}
				if (value == 'moleculeData') {
					moleculeFolder.open();
					spatiallyResolvedFolder.close();
				}
			}
		});
	} else {
		plotFolder.add(options, 'plotData').name('Plot Data');
	}

	if (view.overallMoleculeDataBoolean && view.overallSpatiallyResolvedDataBoolean == false) {

		plotFolder.add(options, 'covarianceTransformSpatiallyResolvedData', { 'linear': 'linear', 'log10': 'log10' }).name('Data Transform').onChange(function (value) {
			//updatePointCloudGeometry(view);
		});
	}

	if (view.overallMoleculeDataBoolean == false && view.overallSpatiallyResolvedDataBoolean) {

		plotFolder.add(options, 'covarianceTransformMoleculeData', { 'linear': 'linear', 'log10': 'log10' }).name('Data Transform').onChange(function (value) {
			//updatePointCloudGeometry(view);
		});
	}

	plotFolder.add(options, 'replotCovariance').name("Plot");
	plotFolder.open();

	viewFolder.add(options, 'colorMap', {
		'rainbow': 'rainbow',
		'cooltowarm': 'cooltowarm',
		'blackbody': 'blackbody',
		'grayscale': 'grayscale',
		'viridis': 'viridis',
		'plasma': 'plasma',
		'inferno': 'inferno',
		'magma': 'magma',
		'Greys': 'Greys',
		'Purples': 'Purples',
		'Blues': 'Blues',
		'Greens': 'Greens',
		'Oranges': 'Oranges',
		'Reds': 'Reds',
		'YlOrBr': 'YlOrBr',
		'YlOrRd': 'YlOrRd',
		'OrRd': 'OrRd',
		'PuRd': 'PuRd',
		'RdPu': 'RdPu',
		'BuPu': 'BuPu',
		'GnBu': 'GnBu',
		'PuBu': 'PuBu',
		'YlGnBu': 'YlGnBu',
		'PuBuGn': 'PuBuGn',
		'BuGn': 'BuGn',
		'YlGn': 'YlGn',
		'binary': 'binary',
		'gist_yarg': 'gist_yarg',
		'gist_gray': 'gist_gray',
		'gray': 'gray',
		'bone': 'bone',
		'pink': 'pink',
		'spring': 'spring',
		'summer': 'summer',
		'autumn': 'autumn',
		'winter': 'winter',
		'cool': 'cool',
		'Wistia': 'Wistia',
		'hot': 'hot',
		'afmhot': 'afmhot',
		'gist_heat': 'gist_heat',
		'copper': 'copper',
		'PiYG': 'PiYG',
		'PRGn': 'PRGn',
		'BrBG': 'BrBG',
		'PuOr': 'PuOr',
		'RdGy': 'RdGy',
		'RdBu': 'RdBu',
		'RdYlBu': 'RdYlBu',
		'RdYlGn': 'RdYlGn',
		'Spectral': 'Spectral',
		'coolwarm': 'coolwarm',
		'bwr': 'bwr',
		'seismic': 'seismic',
		'hsv': 'hsv',
		'Pastel1': 'Pastel1',
		'Pastel2': 'Pastel2',
		'Paired': 'Paired',
		'Accent': 'Accent',
		'Dark2': 'Dark2',
		'Set1': 'Set1',
		'Set2': 'Set2',
		'Set3': 'Set3',
		'tab10': 'tab10',
		'tab20': 'tab20',
		'tab20b': 'tab20b',
		'tab20c': 'tab20c',
		'flag': 'flag',
		'prism': 'prism',
		'ocean': 'ocean',
		'gist_earth': 'gist_earth',
		'terrain': 'terrain',
		'gist_stern': 'gist_stern',
		'gnuplot': 'gnuplot',
		'gnuplot2': 'gnuplot2',
		'CMRmap': 'CMRmap',
		'cubehelix': 'cubehelix',
		'brg': 'brg',
		'gist_rainbow': 'gist_rainbow',
		'rainbow2': 'rainbow2',
		'jet': 'jet',
		'nipy_spectral': 'nipy_spectral',
		'gist_ncar': 'gist_ncar' }).name('Color Scheme').onChange(function (value) {
		_covarianceViewJs.updateCovariance(view);
		_MultiviewControlColorLegendJs.changeLegend(view);
	});
	viewFolder.add(options, 'resetCamera').name("Reset camera");
	viewFolder.add(options, 'toggleFullscreen').name('Fullscreen');
	//viewFolder.open();

	viewFolder.add(options, 'pointCloudAlpha', 0, 1).step(0.01).name('Point Opacity').onChange(function (value) {
		_covarianceViewJs.updateCovariance(view);
	});
	viewFolder.add(options, 'pointCloudSize', 0, 10).step(0.1).name('Point Size').onChange(function (value) {
		_covarianceViewJs.updateCovariance(view);
	});

	if (view.overallMoleculeDataBoolean && view.overallSpatiallyResolvedDataBoolean) {

		moleculeFolder.add(options, 'covarianceTransformMoleculeData', { 'linear': 'linear', 'log10': 'log10' }).name('Data Transform').onChange(function (value) {
			//updatePointCloudGeometry(view);
		});

		moleculeFolder.close();

		spatiallyResolvedFolder.add(options, 'covarianceTransformSpatiallyResolvedData', { 'linear': 'linear', 'log10': 'log10' }).name('Data Transform').onChange(function (value) {
			//updatePointCloudGeometry(view);
		});

		spatiallyResolvedFolder.open();
	}

	detailFolder.add(options, 'legendX', -10, 10).step(0.1).onChange(function (value) {
		_MultiviewControlColorLegendJs.changeLegend(view);
	});
	detailFolder.add(options, 'legendY', -10, 10).step(0.1).onChange(function (value) {
		_MultiviewControlColorLegendJs.changeLegend(view);
	});
	detailFolder.add(options, 'legendWidth', 0, 1).step(0.1).onChange(function (value) {
		_MultiviewControlColorLegendJs.changeLegend(view);
	});
	detailFolder.add(options, 'legendHeight', 0, 15).step(0.1).onChange(function (value) {
		_MultiviewControlColorLegendJs.changeLegend(view);
	});
	detailFolder.add(options, 'legendTick', 1, 15).step(1).onChange(function (value) {
		_MultiviewControlColorLegendJs.changeLegend(view);
	});
	detailFolder.add(options, 'legendFontsize', 10, 75).step(1).onChange(function (value) {
		_MultiviewControlColorLegendJs.changeLegend(view);
	});
	detailFolder.add(options, 'toggleLegend');

	detailFolder.add(options, 'backgroundAlpha', 0.0, 1.0).step(0.1).name('background transparency').onChange(function (value) {
		view.backgroundAlpha = value;
	});

	detailFolder.addColor(options, 'backgroundColor').name('background').onChange(function (value) {
		view.background = new THREE.Color(value);
	});

	folder.open();
}

function setupOptionBox2DPCAFolder(view, plotSetup, folder) {
	var gui = view.gui;
	var options = view.options;
	if (view.overallSpatiallyResolvedDataBoolean) {

		var PCASpatiallyResolvedFeatureList = [];

		for (var i = 1; i <= plotSetup["spatiallyResolvedPropertyList"].length; i++) {
			PCASpatiallyResolvedFeatureList.push("_PC" + i.toString());
		}
		var PCASpatiallyResolvedFeatureChoiceObject = _UtilitiesOtherJs.arrayToIdenticalObject(PCASpatiallyResolvedFeatureList);
	}

	if (view.overallMoleculeDataBoolean) {

		var PCAMoleculeDataFeatureList = [];

		for (var i = 1; i <= plotSetup["moleculePropertyList"].length; i++) {
			PCAMoleculeDataFeatureList.push("_PC" + i.toString());
		}
		var PCAMoleculeDataFeatureChoiceObject = _UtilitiesOtherJs.arrayToIdenticalObject(PCAMoleculeDataFeatureList);
	}
	var options = view.options;
	var plotFolder = folder.addFolder('Plot Setting');
	var viewFolder = folder.addFolder('View Control');
	var selectionFolder = folder.addFolder('Selection');

	if (view.overallMoleculeDataBoolean && view.overallSpatiallyResolvedDataBoolean) {
		var moleculeFolder = folder.addFolder('Molecular Data');
		var spatiallyResolvedFolder = folder.addFolder('Spatially Resolved Data');
	}

	var detailFolder = folder.addFolder('Additional Control');

	if (view.overallMoleculeDataBoolean && view.overallSpatiallyResolvedDataBoolean) {
		plotFolder.add(options, 'plotData', { 'spatially resolved': 'spatiallyResolvedData', 'molecular': 'moleculeData' }).name('Plot Data').onChange(function (value) {
			if (view.overallMoleculeDataBoolean && view.overallSpatiallyResolvedDataBoolean) {
				if (value == 'spatiallyResolvedData') {
					moleculeFolder.close();
					spatiallyResolvedFolder.open();
				}
				if (value == 'moleculeData') {
					moleculeFolder.open();
					spatiallyResolvedFolder.close();
				}
			}
		});
	} else {
		plotFolder.add(options, 'plotData').name('Plot Data');
	}

	plotFolder.add(options, 'numPerSide', 10, 10000).step(1).name('Resolution').onChange(function (value) {
		view.xPlotScale = d3.scaleLinear().domain([0, value]).range([-50, 50]);
		view.yPlotScale = d3.scaleLinear().domain([0, value]).range([-50, 50]);
		//options.replotHeatmap.call();
	});
	if (view.overallMoleculeDataBoolean) {
		plotFolder.add(options, 'saveOverallMoleculeData').name('Save Molecule');
	}
	if (view.overallSpatiallyResolvedDataBoolean) {
		plotFolder.add(options, 'saveOverallSpatiallyResolvedData').name('Save Spatially Resolved');
	}

	if (view.overallMoleculeDataBoolean && view.overallSpatiallyResolvedDataBoolean == false) {
		plotFolder.add(options, 'plotPCAXMoleculeData', PCAMoleculeDataFeatureChoiceObject).name('X').onChange(function (value) {
			//updatePointCloudGeometry(view);
		});

		plotFolder.add(options, 'plotPCAXTransformMoleculeData', { 'linear': 'linear', 'log10': 'log10' }).name('X scale').onChange(function (value) {
			//updatePointCloudGeometry(view);
		});

		plotFolder.add(options, 'plotPCAYMoleculeData', PCAMoleculeDataFeatureChoiceObject).name('Y').onChange(function (value) {
			//updatePointCloudGeometry(view);
		});

		plotFolder.add(options, 'plotPCAYTransformMoleculeData', { 'linear': 'linear', 'log10': 'log10' }).name('Y scale').onChange(function (value) {
			//updatePointCloudGeometry(view);
		});

		plotFolder.add(options, 'selectAllMoleculeData').name('Select all');
		plotFolder.add(options, 'deselectAllMoleculeData').name('Deselect all');
	}

	if (view.overallMoleculeDataBoolean == false && view.overallSpatiallyResolvedDataBoolean) {
		plotFolder.add(options, 'plotPCAXSpatiallyResolvedData', PCASpatiallyResolvedFeatureChoiceObject).name('X').onChange(function (value) {
			//updatePointCloudGeometry(view);
		});

		plotFolder.add(options, 'plotPCAXTransformSpatiallyResolvedData', { 'linear': 'linear', 'log10': 'log10' }).name('X scale').onChange(function (value) {
			//updatePointCloudGeometry(view);
		});

		plotFolder.add(options, 'plotPCAYSpatiallyResolvedData', PCASpatiallyResolvedFeatureChoiceObject).name('Y').onChange(function (value) {
			//updatePointCloudGeometry(view);
		});

		plotFolder.add(options, 'plotPCAYTransformSpatiallyResolvedData', { 'linear': 'linear', 'log10': 'log10' }).name('Y scale').onChange(function (value) {
			//updatePointCloudGeometry(view);
		});

		plotFolder.add(options, 'selectAllSpatiallyResolvedData').name('Select all');
		plotFolder.add(options, 'deselectAllSpatiallyResolvedData').name('Deselect all');
	}

	plotFolder.add(options, 'replotPCAHeatmap').name("Calculate & Plot");
	plotFolder.open();

	viewFolder.add(options, 'colorMap', {
		'rainbow': 'rainbow',
		'cooltowarm': 'cooltowarm',
		'blackbody': 'blackbody',
		'grayscale': 'grayscale',
		'viridis': 'viridis',
		'plasma': 'plasma',
		'inferno': 'inferno',
		'magma': 'magma',
		'Greys': 'Greys',
		'Purples': 'Purples',
		'Blues': 'Blues',
		'Greens': 'Greens',
		'Oranges': 'Oranges',
		'Reds': 'Reds',
		'YlOrBr': 'YlOrBr',
		'YlOrRd': 'YlOrRd',
		'OrRd': 'OrRd',
		'PuRd': 'PuRd',
		'RdPu': 'RdPu',
		'BuPu': 'BuPu',
		'GnBu': 'GnBu',
		'PuBu': 'PuBu',
		'YlGnBu': 'YlGnBu',
		'PuBuGn': 'PuBuGn',
		'BuGn': 'BuGn',
		'YlGn': 'YlGn',
		'binary': 'binary',
		'gist_yarg': 'gist_yarg',
		'gist_gray': 'gist_gray',
		'gray': 'gray',
		'bone': 'bone',
		'pink': 'pink',
		'spring': 'spring',
		'summer': 'summer',
		'autumn': 'autumn',
		'winter': 'winter',
		'cool': 'cool',
		'Wistia': 'Wistia',
		'hot': 'hot',
		'afmhot': 'afmhot',
		'gist_heat': 'gist_heat',
		'copper': 'copper',
		'PiYG': 'PiYG',
		'PRGn': 'PRGn',
		'BrBG': 'BrBG',
		'PuOr': 'PuOr',
		'RdGy': 'RdGy',
		'RdBu': 'RdBu',
		'RdYlBu': 'RdYlBu',
		'RdYlGn': 'RdYlGn',
		'Spectral': 'Spectral',
		'coolwarm': 'coolwarm',
		'bwr': 'bwr',
		'seismic': 'seismic',
		'hsv': 'hsv',
		'Pastel1': 'Pastel1',
		'Pastel2': 'Pastel2',
		'Paired': 'Paired',
		'Accent': 'Accent',
		'Dark2': 'Dark2',
		'Set1': 'Set1',
		'Set2': 'Set2',
		'Set3': 'Set3',
		'tab10': 'tab10',
		'tab20': 'tab20',
		'tab20b': 'tab20b',
		'tab20c': 'tab20c',
		'flag': 'flag',
		'prism': 'prism',
		'ocean': 'ocean',
		'gist_earth': 'gist_earth',
		'terrain': 'terrain',
		'gist_stern': 'gist_stern',
		'gnuplot': 'gnuplot',
		'gnuplot2': 'gnuplot2',
		'CMRmap': 'CMRmap',
		'cubehelix': 'cubehelix',
		'brg': 'brg',
		'gist_rainbow': 'gist_rainbow',
		'rainbow2': 'rainbow2',
		'jet': 'jet',
		'nipy_spectral': 'nipy_spectral',
		'gist_ncar': 'gist_ncar' }).name('Color Scheme').onChange(function (value) {
		_HeatmapViewJs.updateHeatmap(view);
		_MultiviewControlColorLegendJs.changeLegend(view);
	});
	viewFolder.add(options, 'resetCamera').name("Reset camera");
	viewFolder.add(options, 'toggleFullscreen').name('Fullscreen');
	//viewFolder.open();

	viewFolder.add(options, 'pointCloudAlpha', 0, 1).step(0.01).name('Point Opacity').onChange(function (value) {
		_HeatmapViewJs.updateHeatmap(view);
	});
	viewFolder.add(options, 'pointCloudSize', 0, 10).step(0.1).name('Point Size').onChange(function (value) {
		_HeatmapViewJs.updateHeatmap(view);
	});

	selectionFolder.add(options, 'planeSelection').name('with plane').onChange(function (value) {
		if (value == true && options.brushSelection == true) {
			options.brushSelection = false;
			gui.updateDisplay();
		}
	});

	selectionFolder.add(options, 'brushSelection').name('with brush').onChange(function (value) {
		if (value == true && options.planeSelection == true) {
			options.planeSelection = false;
			gui.updateDisplay();
		}
	});

	selectionFolder.add(options, 'selectionBrushSize', 0.5, 10).step(0.1).name('brush size').onChange(function (value) {
		options.brushSelection = false;
		options.planeSelection = false;
		gui.updateDisplay();
	});

	if (view.overallMoleculeDataBoolean && view.overallSpatiallyResolvedDataBoolean) {
		moleculeFolder.add(options, 'plotPCAXMoleculeData', PCAMoleculeDataFeatureChoiceObject).name('X').onChange(function (value) {
			//updatePointCloudGeometry(view);
		});

		moleculeFolder.add(options, 'plotPCAXTransformMoleculeData', { 'linear': 'linear', 'log10': 'log10' }).name('X scale').onChange(function (value) {
			//updatePointCloudGeometry(view);
		});

		moleculeFolder.add(options, 'plotPCAYMoleculeData', PCAMoleculeDataFeatureChoiceObject).name('Y').onChange(function (value) {
			//updatePointCloudGeometry(view);
		});

		moleculeFolder.add(options, 'plotPCAYTransformMoleculeData', { 'linear': 'linear', 'log10': 'log10' }).name('Y scale').onChange(function (value) {
			//updatePointCloudGeometry(view);
		});

		moleculeFolder.add(options, 'selectAllMoleculeData').name('Select all');
		moleculeFolder.add(options, 'deselectAllMoleculeData').name('Deselect all');

		moleculeFolder.close();

		spatiallyResolvedFolder.add(options, 'plotPCAXSpatiallyResolvedData', PCASpatiallyResolvedFeatureChoiceObject).name('X').onChange(function (value) {
			//updatePointCloudGeometry(view);
		});

		spatiallyResolvedFolder.add(options, 'plotPCAXTransformSpatiallyResolvedData', { 'linear': 'linear', 'log10': 'log10' }).name('X scale').onChange(function (value) {
			//updatePointCloudGeometry(view);
		});

		spatiallyResolvedFolder.add(options, 'plotPCAYSpatiallyResolvedData', PCASpatiallyResolvedFeatureChoiceObject).name('Y').onChange(function (value) {
			//updatePointCloudGeometry(view);
		});

		spatiallyResolvedFolder.add(options, 'plotPCAYTransformSpatiallyResolvedData', { 'linear': 'linear', 'log10': 'log10' }).name('Y scale').onChange(function (value) {
			//updatePointCloudGeometry(view);
		});

		spatiallyResolvedFolder.add(options, 'selectAllSpatiallyResolvedData').name('Select all');
		spatiallyResolvedFolder.add(options, 'deselectAllSpatiallyResolvedData').name('Deselect all');

		spatiallyResolvedFolder.open();
	}

	detailFolder.add(options, 'legendX', -10, 10).step(0.1).onChange(function (value) {
		_MultiviewControlColorLegendJs.changeLegend(view);
	});
	detailFolder.add(options, 'legendY', -10, 10).step(0.1).onChange(function (value) {
		_MultiviewControlColorLegendJs.changeLegend(view);
	});
	detailFolder.add(options, 'legendWidth', 0, 1).step(0.1).onChange(function (value) {
		_MultiviewControlColorLegendJs.changeLegend(view);
	});
	detailFolder.add(options, 'legendHeight', 0, 15).step(0.1).onChange(function (value) {
		_MultiviewControlColorLegendJs.changeLegend(view);
	});
	detailFolder.add(options, 'legendTick', 1, 15).step(1).onChange(function (value) {
		_MultiviewControlColorLegendJs.changeLegend(view);
	});
	detailFolder.add(options, 'legendFontsize', 10, 75).step(1).onChange(function (value) {
		_MultiviewControlColorLegendJs.changeLegend(view);
	});
	detailFolder.add(options, 'toggleLegend');

	detailFolder.add(options, 'backgroundAlpha', 0.0, 1.0).step(0.1).name('background transparency').onChange(function (value) {
		view.backgroundAlpha = value;
	});

	detailFolder.addColor(options, 'backgroundColor').name('background').onChange(function (value) {
		view.background = new THREE.Color(value);
	});

	folder.open();
}

function setupOptionBox2DComparisonFolder(view, plotSetup, folder) {
	var gui = view.gui;
	var options = view.options;
	if (view.overallSpatiallyResolvedDataBoolean) {
		var spatiallyResolvedFeatureList = plotSetup["spatiallyResolvedPropertyList"];
		var spatiallyResolvedFeatureChoiceObject = _UtilitiesOtherJs.arrayToIdenticalObject(spatiallyResolvedFeatureList);
	}

	if (view.overallMoleculeDataBoolean) {
		var moleculeDataFeatureList = plotSetup["moleculePropertyList"];
		var moleculeDataFeatureChoiceObject = _UtilitiesOtherJs.arrayToIdenticalObject(moleculeDataFeatureList);
	}
	var options = view.options;
	var plotFolder = folder.addFolder('Plot Setting');
	var viewFolder = folder.addFolder('View Control');
	var selectionFolder = folder.addFolder('Selection');

	if (view.overallMoleculeDataBoolean && view.overallSpatiallyResolvedDataBoolean) {
		var moleculeFolder = folder.addFolder('Molecular Data');
		var spatiallyResolvedFolder = folder.addFolder('Spatially Resolved Data');
	}

	var detailFolder = folder.addFolder('Additional Control');

	if (view.overallMoleculeDataBoolean && view.overallSpatiallyResolvedDataBoolean) {
		plotFolder.add(options, 'plotData', { 'spatially resolved': 'spatiallyResolvedData', 'molecular': 'moleculeData' }).name('Plot Data').onChange(function (value) {
			if (view.overallMoleculeDataBoolean && view.overallSpatiallyResolvedDataBoolean) {
				if (value == 'spatiallyResolvedData') {
					moleculeFolder.close();
					spatiallyResolvedFolder.open();
				}
				if (value == 'moleculeData') {
					moleculeFolder.open();
					spatiallyResolvedFolder.close();
				}
			}
		});
	} else {
		plotFolder.add(options, 'plotData').name('Plot Data');
	}

	plotFolder.add(options, 'numPerSide', 10, 10000).step(1).name('Resolution').onChange(function (value) {
		view.xPlotScale = d3.scaleLinear().domain([0, value]).range([-50, 50]);
		view.yPlotScale = d3.scaleLinear().domain([0, value]).range([-50, 50]);
		//options.replotHeatmap.call();
	});
	if (view.overallMoleculeDataBoolean) {
		plotFolder.add(options, 'saveOverallMoleculeData').name('Save Molecule');
	}
	if (view.overallSpatiallyResolvedDataBoolean) {
		plotFolder.add(options, 'saveOverallSpatiallyResolvedData').name('Save Spatially Resolved');
	}

	if (view.overallMoleculeDataBoolean && view.overallSpatiallyResolvedDataBoolean == false) {
		plotFolder.add(options, 'plotXMoleculeData', moleculeDataFeatureChoiceObject).name('X').onChange(function (value) {
			//updatePointCloudGeometry(view);
		});

		plotFolder.add(options, 'plotXTransformMoleculeData', { 'linear': 'linear', 'log10': 'log10', 'log10(-1*)': 'neglog10' /*, 'symlog10': 'symlog10', 'symlogPC': 'symlogPC'*/ }).name('X scale').onChange(function (value) {
			//updatePointCloudGeometry(view);
		});

		plotFolder.add(options, 'plotYMoleculeData', moleculeDataFeatureChoiceObject).name('Y').onChange(function (value) {
			//updatePointCloudGeometry(view);
		});

		plotFolder.add(options, 'plotYTransformMoleculeData', { 'linear': 'linear', 'log10': 'log10', 'log10(-1*)': 'neglog10' /*, 'symlog10': 'symlog10', 'symlogPC': 'symlogPC'*/ }).name('Y scale').onChange(function (value) {
			//updatePointCloudGeometry(view);
		});

		plotFolder.add(options, 'selectAllMoleculeData').name('Select all');
		plotFolder.add(options, 'deselectAllMoleculeData').name('Deselect all');
	}

	if (view.overallMoleculeDataBoolean == false && view.overallSpatiallyResolvedDataBoolean) {
		plotFolder.add(options, 'plotXSpatiallyResolvedData', spatiallyResolvedFeatureChoiceObject).name('X').onChange(function (value) {
			//updatePointCloudGeometry(view);
		});

		plotFolder.add(options, 'plotXTransformSpatiallyResolvedData', { 'linear': 'linear', 'log10': 'log10', 'log10(-1*)': 'neglog10', 'symlog10': 'symlog10', 'symlogPC': 'symlogPC' }).name('X scale').onChange(function (value) {
			//updatePointCloudGeometry(view);
		});

		plotFolder.add(options, 'plotYSpatiallyResolvedData', spatiallyResolvedFeatureChoiceObject).name('Y').onChange(function (value) {
			//updatePointCloudGeometry(view);
		});

		plotFolder.add(options, 'plotYTransformSpatiallyResolvedData', { 'linear': 'linear', 'log10': 'log10', 'log10(-1*)': 'neglog10', 'symlog10': 'symlog10', 'symlogPC': 'symlogPC' }).name('Y scale').onChange(function (value) {
			//updatePointCloudGeometry(view);
		});

		plotFolder.add(options, 'selectAllSpatiallyResolvedData').name('Select all');
		plotFolder.add(options, 'deselectAllSpatiallyResolvedData').name('Deselect all');
	}

	plotFolder.add(options, 'replotComparison').name("Plot");
	plotFolder.open();

	viewFolder.add(options, 'colorMap', {
		'rainbow': 'rainbow',
		'cooltowarm': 'cooltowarm',
		'blackbody': 'blackbody',
		'grayscale': 'grayscale',
		'viridis': 'viridis',
		'plasma': 'plasma',
		'inferno': 'inferno',
		'magma': 'magma',
		'Greys': 'Greys',
		'Purples': 'Purples',
		'Blues': 'Blues',
		'Greens': 'Greens',
		'Oranges': 'Oranges',
		'Reds': 'Reds',
		'YlOrBr': 'YlOrBr',
		'YlOrRd': 'YlOrRd',
		'OrRd': 'OrRd',
		'PuRd': 'PuRd',
		'RdPu': 'RdPu',
		'BuPu': 'BuPu',
		'GnBu': 'GnBu',
		'PuBu': 'PuBu',
		'YlGnBu': 'YlGnBu',
		'PuBuGn': 'PuBuGn',
		'BuGn': 'BuGn',
		'YlGn': 'YlGn',
		'binary': 'binary',
		'gist_yarg': 'gist_yarg',
		'gist_gray': 'gist_gray',
		'gray': 'gray',
		'bone': 'bone',
		'pink': 'pink',
		'spring': 'spring',
		'summer': 'summer',
		'autumn': 'autumn',
		'winter': 'winter',
		'cool': 'cool',
		'Wistia': 'Wistia',
		'hot': 'hot',
		'afmhot': 'afmhot',
		'gist_heat': 'gist_heat',
		'copper': 'copper',
		'PiYG': 'PiYG',
		'PRGn': 'PRGn',
		'BrBG': 'BrBG',
		'PuOr': 'PuOr',
		'RdGy': 'RdGy',
		'RdBu': 'RdBu',
		'RdYlBu': 'RdYlBu',
		'RdYlGn': 'RdYlGn',
		'Spectral': 'Spectral',
		'coolwarm': 'coolwarm',
		'bwr': 'bwr',
		'seismic': 'seismic',
		'hsv': 'hsv',
		'Pastel1': 'Pastel1',
		'Pastel2': 'Pastel2',
		'Paired': 'Paired',
		'Accent': 'Accent',
		'Dark2': 'Dark2',
		'Set1': 'Set1',
		'Set2': 'Set2',
		'Set3': 'Set3',
		'tab10': 'tab10',
		'tab20': 'tab20',
		'tab20b': 'tab20b',
		'tab20c': 'tab20c',
		'flag': 'flag',
		'prism': 'prism',
		'ocean': 'ocean',
		'gist_earth': 'gist_earth',
		'terrain': 'terrain',
		'gist_stern': 'gist_stern',
		'gnuplot': 'gnuplot',
		'gnuplot2': 'gnuplot2',
		'CMRmap': 'CMRmap',
		'cubehelix': 'cubehelix',
		'brg': 'brg',
		'gist_rainbow': 'gist_rainbow',
		'rainbow2': 'rainbow2',
		'jet': 'jet',
		'nipy_spectral': 'nipy_spectral',
		'gist_ncar': 'gist_ncar' }).name('Color Scheme').onChange(function (value) {
		_comparisonViewJs.updateComparison(view);
		_MultiviewControlColorLegendJs.changeLegend(view);
	});
	viewFolder.add(options, 'resetCamera').name("Reset camera");
	viewFolder.add(options, 'toggleFullscreen').name('Fullscreen');
	//viewFolder.open();

	viewFolder.add(options, 'pointCloudAlpha', 0, 1).step(0.01).name('Point Opacity').onChange(function (value) {
		_comparisonViewJs.updateComparison(view);
	});
	viewFolder.add(options, 'pointCloudSize', 0, 10).step(0.1).name('Point Size').onChange(function (value) {
		_comparisonViewJs.updateComparison(view);
	});

	selectionFolder.add(options, 'planeSelection').name('with plane').onChange(function (value) {
		if (value == true && options.brushSelection == true) {
			options.brushSelection = false;
			gui.updateDisplay();
		}
	});

	selectionFolder.add(options, 'brushSelection').name('with brush').onChange(function (value) {
		if (value == true && options.planeSelection == true) {
			options.planeSelection = false;
			gui.updateDisplay();
		}
	});

	selectionFolder.add(options, 'selectionBrushSize', 0.5, 10).step(0.1).name('brush size').onChange(function (value) {
		options.brushSelection = false;
		options.planeSelection = false;
		gui.updateDisplay();
	});

	if (view.overallMoleculeDataBoolean && view.overallSpatiallyResolvedDataBoolean) {
		moleculeFolder.add(options, 'plotXMoleculeData', moleculeDataFeatureChoiceObject).name('X').onChange(function (value) {
			//updatePointCloudGeometry(view);
		});

		moleculeFolder.add(options, 'plotXTransformMoleculeData', { 'linear': 'linear', 'log10': 'log10', 'log10(-1*)': 'neglog10', 'symlog10': 'symlog10', 'symlogPC': 'symlogPC' }).name('X scale').onChange(function (value) {
			//updatePointCloudGeometry(view);
		});

		moleculeFolder.add(options, 'plotYMoleculeData', moleculeDataFeatureChoiceObject).name('Y').onChange(function (value) {
			//updatePointCloudGeometry(view);
		});

		moleculeFolder.add(options, 'plotYTransformMoleculeData', { 'linear': 'linear', 'log10': 'log10', 'log10(-1*)': 'neglog10', 'symlog10': 'symlog10', 'symlogPC': 'symlogPC' }).name('Y scale').onChange(function (value) {
			//updatePointCloudGeometry(view);
		});

		moleculeFolder.add(options, 'selectAllMoleculeData').name('Select all');
		moleculeFolder.add(options, 'deselectAllMoleculeData').name('Deselect all');

		moleculeFolder.close();

		spatiallyResolvedFolder.add(options, 'plotXSpatiallyResolvedData', spatiallyResolvedFeatureChoiceObject).name('X').onChange(function (value) {
			//updatePointCloudGeometry(view);
		});

		spatiallyResolvedFolder.add(options, 'plotXTransformSpatiallyResolvedData', { 'linear': 'linear', 'log10': 'log10', 'log10(-1*)': 'neglog10', 'symlog10': 'symlog10', 'symlogPC': 'symlogPC' }).name('X scale').onChange(function (value) {
			//updatePointCloudGeometry(view);
		});

		spatiallyResolvedFolder.add(options, 'plotYSpatiallyResolvedData', spatiallyResolvedFeatureChoiceObject).name('Y').onChange(function (value) {
			//updatePointCloudGeometry(view);
		});

		spatiallyResolvedFolder.add(options, 'plotYTransformSpatiallyResolvedData', { 'linear': 'linear', 'log10': 'log10', 'log10(-1*)': 'neglog10', 'symlog10': 'symlog10', 'symlogPC': 'symlogPC' }).name('Y scale').onChange(function (value) {
			//updatePointCloudGeometry(view);
		});

		spatiallyResolvedFolder.add(options, 'selectAllSpatiallyResolvedData').name('Select all');
		spatiallyResolvedFolder.add(options, 'deselectAllSpatiallyResolvedData').name('Deselect all');

		spatiallyResolvedFolder.open();
	}

	detailFolder.add(options, 'legendX', -10, 10).step(0.1).onChange(function (value) {
		_MultiviewControlColorLegendJs.changeLegend(view);
	});
	detailFolder.add(options, 'legendY', -10, 10).step(0.1).onChange(function (value) {
		_MultiviewControlColorLegendJs.changeLegend(view);
	});
	detailFolder.add(options, 'legendWidth', 0, 1).step(0.1).onChange(function (value) {
		_MultiviewControlColorLegendJs.changeLegend(view);
	});
	detailFolder.add(options, 'legendHeight', 0, 15).step(0.1).onChange(function (value) {
		_MultiviewControlColorLegendJs.changeLegend(view);
	});
	detailFolder.add(options, 'legendTick', 1, 15).step(1).onChange(function (value) {
		_MultiviewControlColorLegendJs.changeLegend(view);
	});
	detailFolder.add(options, 'legendFontsize', 10, 75).step(1).onChange(function (value) {
		_MultiviewControlColorLegendJs.changeLegend(view);
	});
	detailFolder.add(options, 'toggleLegend');

	detailFolder.add(options, 'backgroundAlpha', 0.0, 1.0).step(0.1).name('background transparency').onChange(function (value) {
		view.backgroundAlpha = value;
	});

	detailFolder.addColor(options, 'backgroundColor').name('background').onChange(function (value) {
		view.background = new THREE.Color(value);
	});

	folder.open();
}

},{"../MultiviewControl/colorLegend.js":22,"../Utilities/other.js":28,"./HeatmapView.js":2,"./PCAView.js":3,"./comparisonView.js":6,"./covarianceView.js":7}],11:[function(require,module,exports){
'use strict';

exports.__esModule = true;
exports.initialize2DPlotTooltip = initialize2DPlotTooltip;
exports.updateHeatmapTooltip = updateHeatmapTooltip;
exports.updateCovarianceTooltip = updateCovarianceTooltip;

function initialize2DPlotTooltip(view) {
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

function updateHeatmapTooltip(view) {

	var mouse = new THREE.Vector2();
	mouse.set((event.clientX - view.windowLeft) / view.windowWidth * 2 - 1, -((event.clientY - view.windowTop) / view.windowHeight) * 2 + 1);

	view.raycaster.setFromCamera(mouse.clone(), view.camera);
	var intersects = view.raycaster.intersectObject(view.heatmapPlot);
	if (intersects.length > 0) {
		//console.log("found intersect")

		view.tooltip.style.top = event.clientY + 5 + 'px';
		view.tooltip.style.left = event.clientX + 5 + 'px';

		var interesctIndex = intersects[0].index;
		view.tooltip.innerHTML = "x: " + view.heatmapInformation[interesctIndex].xStart + " : " + view.heatmapInformation[interesctIndex].xEnd + '<br>' + "y: " + view.heatmapInformation[interesctIndex].yStart + " : " + view.heatmapInformation[interesctIndex].yEnd + '<br>' + "# points: " + view.heatmapInformation[interesctIndex].numberDatapointsRepresented;

		//view.System.geometry.attributes.size.array[ interesctIndex ]  = 2 * view.options.pointCloudSize;
		//view.System.geometry.attributes.size.needsUpdate = true;

		if (view.INTERSECTED != intersects[0].index) {
			if (view.INTERSECTED != null) {
				view.heatmapPlot.geometry.attributes.size.array[view.INTERSECTED] = view.options.pointCloudSize;
				view.heatmapPlot.geometry.attributes.size.needsUpdate = true;
			}
			view.INTERSECTED = intersects[0].index;
			view.heatmapPlot.geometry.attributes.size.array[view.INTERSECTED] = 2 * view.options.pointCloudSize;
			view.heatmapPlot.geometry.attributes.size.needsUpdate = true;
		}
	} else {
		view.tooltip.innerHTML = '';
		if (view.INTERSECTED != null) {
			view.heatmapPlot.geometry.attributes.size.array[view.INTERSECTED] = view.options.pointCloudSize;
			view.heatmapPlot.geometry.attributes.size.needsUpdate = true;
		}
		view.INTERSECTED = null;
	}
}

function updateCovarianceTooltip(view) {

	var mouse = new THREE.Vector2();
	mouse.set((event.clientX - view.windowLeft) / view.windowWidth * 2 - 1, -((event.clientY - view.windowTop) / view.windowHeight) * 2 + 1);

	view.raycaster.setFromCamera(mouse.clone(), view.camera);
	var intersects = view.raycaster.intersectObject(view.covariancePlot);
	if (intersects.length > 0) {
		//console.log("found intersect")

		view.tooltip.style.top = event.clientY + 5 + 'px';
		view.tooltip.style.left = event.clientX + 5 + 'px';

		var interesctIndex = intersects[0].index;
		view.tooltip.innerHTML = "x: " + view.covarianceInformation[interesctIndex].x + '<br>' + "y: " + view.covarianceInformation[interesctIndex].y + '<br>' + "Correlation: " + view.covarianceInformation[interesctIndex].correlation;

		//view.System.geometry.attributes.size.array[ interesctIndex ]  = 2 * view.options.pointCloudSize;
		//view.System.geometry.attributes.size.needsUpdate = true;

		if (view.INTERSECTED != intersects[0].index) {
			if (view.INTERSECTED != null) {
				view.covariancePlot.geometry.attributes.size.array[view.INTERSECTED] = view.options.pointCloudSize * 10;
				view.covariancePlot.geometry.attributes.size.needsUpdate = true;
			}
			view.INTERSECTED = intersects[0].index;
			view.covariancePlot.geometry.attributes.size.array[view.INTERSECTED] = 2 * view.options.pointCloudSize * 10;
			view.covariancePlot.geometry.attributes.size.needsUpdate = true;
		}
	} else {
		view.tooltip.innerHTML = '';
		if (view.INTERSECTED != null) {
			view.covariancePlot.geometry.attributes.size.array[view.INTERSECTED] = view.options.pointCloudSize * 10;
			view.covariancePlot.geometry.attributes.size.needsUpdate = true;
		}
		view.INTERSECTED = null;
	}
}

},{}],12:[function(require,module,exports){
//  jmol color scheme: http://jmol.sourceforge.net/jscolors/
"use strict";

exports.__esModule = true;
var colorSetup = {
						"H": 0xFFFFFF, //0xFFFFFF, 0x3050F8,
						"He": 0xD9FFFF,
						"Li": 0xCC80FF,
						"Be": 0xC2FF00,
						"B": 0xFFB5B5,
						"C": 0x909090,
						"N": 0x3050F8,
						"O": 0xFF0D0D,
						"F": 0x90E050,
						"Ne": 0xB3E3F5,
						"Na": 0xAB5CF2,
						"Mg": 0x8AFF00,
						"Al": 0xBFA6A6,
						"Si": 0xF0C8A0,
						"P": 0xFF8000,
						"S": 0xFFFF30,
						"Cl": 0x1FF01F,
						"Ar": 0x80D1E3,
						"K": 0x8F40D4,
						"Ca": 0x3DFF00,
						"Sc": 0xE6E6E6,
						"Ti": 0xBFC2C7,
						"V": 0xA6A6AB,
						"Cr": 0x8A99C7,
						"Mn": 0x9C7AC7,
						"Fe": 0xE06633,
						"Co": 0xF090A0,
						"Ni": 0x50D050,
						"Cu": 0xC88033,
						"Zn": 0x7D80B0,
						"Ga": 0xC28F8F,
						"Ge": 0x668F8F,
						"As": 0xBD80E3,
						"Se": 0xFFA100,
						"Br": 0xA62929,
						"Kr": 0x5CB8D1,
						"Rb": 0x702EB0,
						"Sr": 0x00FF00,
						"Y": 0x94FFFF,
						"Zr": 0x94E0E0,
						"Nb": 0x73C2C9,
						"Mo": 0x54B5B5,
						"Tc": 0x3B9E9E,
						"Ru": 0x248F8F,
						"Rh": 0x0A7D8C,
						"Pd": 0x006985,
						"Ag": 0xC0C0C0,
						"Cd": 0xFFD98F,
						"In": 0xA67573,
						"Sn": 0x668080,
						"Sb": 0x9E63B5,
						"Te": 0xD47A00,
						"I": 0x940094,
						"Xe": 0x429EB0,
						"Cs": 0x57178F,
						"Ba": 0x00C900,
						"La": 0x70D4FF,
						"Ce": 0xFFFFC7,
						"Pr": 0xD9FFC7,
						"Nd": 0xC7FFC7,
						"Pm": 0xA3FFC7,
						"Sm": 0x8FFFC7,
						"Eu": 0x61FFC7,
						"Gd": 0x45FFC7,
						"Tb": 0x30FFC7,
						"Dy": 0x1FFFC7,
						"Ho": 0x00FF9C,
						"Er": 0x00E675,
						"Tm": 0x00D452,
						"Yb": 0x00BF38,
						"Lu": 0x00AB24,
						"Hf": 0x4DC2FF,
						"Ta": 0x4DA6FF,
						"W": 0x2194D6,
						"Re": 0x267DAB,
						"Os": 0x266696,
						"Ir": 0x175487,
						"Pt": 0xD0D0E0,
						"Au": 0xFFD123,
						"Hg": 0xB8B8D0,
						"Tl": 0xA6544D,
						"Pb": 0x575961,
						"Bi": 0x6E4FB25,
						"Po": 0xAB5C00,
						"At": 0x754F45,
						"Rn": 0x428296,
						"Fr": 0x420066,
						"Ra": 0x007D00,
						"Ac": 0x70ABFA,
						"Th": 0x00BAFF,
						"Pa": 0x00A1FF,
						"U": 0x008FFF,
						"Np": 0x0080FF,
						"Pu": 0x006BFF,
						"Am": 0x545CF2,
						"Cm": 0x785CE3,
						"Bk": 0x8A4FE3,
						"Cf": 0xA136D4,
						"Es": 0xB31FD4,
						"Fm": 0xB31FBA,
						"Md": 0xB30DA6,
						"No": 0xBD0D87,
						"Lr": 0xC70066,
						"Rf": 0xCC0059,
						"Db": 0xD1004F,
						"Sg": 0xD90045,
						"Bh": 0xE00038,
						"Hs": 0xE6002E,
						"Mt": 0xEB0026
};

exports.colorSetup = colorSetup;
// radious, http://periodictable.com/Properties/A/AtomicRadius.an.html
var atomRadius = {
						//"H":  0.53,
						"H": 0.2,
						"He": 0.31,
						"Li": 1.67,
						"Be": 1.12,
						"B": 0.87,
						"C": 0.67,
						"N": 0.56,
						"O": 0.48,
						"F": 0.42,
						"Ne": 0.38,
						"Na": 1.90,
						"Mg": 1.45,
						"Al": 1.18,
						"Si": 1.11,
						"P": 0.98,
						"S": 0.87,
						"Cl": 0.79,
						"Ar": 0.71,
						"K": 2.43,
						"Ca": 1.94,
						"Sc": 1.84,
						"Ti": 1.76,
						"V": 1.71,
						"Cr": 1.66,
						"Mn": 1.61,
						"Fe": 1.56,
						"Co": 1.52,
						"Ni": 1.49,
						"Cu": 1.45,
						"Zn": 1.42,
						"Ga": 1.36,
						"Ge": 1.25,
						"As": 1.14,
						"Se": 1.03,
						"Br": 0.94,
						"Kr": 0.87,
						"Rb": 2.65,
						"Sr": 2.19,
						"Y": 2.12,
						"Zr": 2.06,
						"Nb": 1.98,
						"Mo": 1.90,
						"Tc": 1.83,
						"Ru": 1.78,
						"Rh": 1.73,
						"Pd": 1.69,
						"Ag": 1.65,
						"Cd": 1.61,
						"In": 1.56,
						"Sn": 1.45,
						"Sb": 1.33,
						"Te": 1.23,
						"I": 1.15,
						"Xe": 1.08,
						"Cs": 2.98,
						"Ba": 2.53,
						"La": 2.00, //unknwon
						"Ce": 2.00, //unknwon
						"Pr": 2.47,
						"Nd": 2.06,
						"Pm": 2.05,
						"Sm": 2.38,
						"Eu": 2.31,
						"Gd": 2.33,
						"Tb": 2.25,
						"Dy": 2.28,
						"Ho": 2.26,
						"Er": 2.26,
						"Tm": 2.22,
						"Yb": 2.22,
						"Lu": 2.17,
						"Hf": 2.08,
						"Ta": 2.00,
						"W": 1.93,
						"Re": 1.88,
						"Os": 1.85,
						"Ir": 1.80,
						"Pt": 1.77,
						"Au": 1.74,
						"Hg": 1.71,
						"Tl": 1.56,
						"Pb": 1.54,
						"Bi": 1.43,
						"Po": 1.35,
						"At": 1.27,
						"Rn": 1.20,
						"Fr": 2.00, //unknwon
						"Ra": 2.00, //unknwon
						"Ac": 2.00, //unknwon
						"Th": 2.00, //unknwon
						"Pa": 2.00, //unknwon
						"U": 2.00, //unknwon
						"Np": 2.00, //unknwon
						"Pu": 2.00, //unknwon
						"Am": 2.00, //unknwon
						"Cm": 2.00, //unknwon
						"Bk": 2.00, //unknwon
						"Cf": 2.00, //unknwon
						"Es": 2.00, //unknwon
						"Fm": 2.00, //unknwon
						"Md": 2.00, //unknwon
						"No": 2.00, //unknwon
						"Lr": 2.00, //unknwon
						"Rf": 2.00, //unknwon
						"Db": 2.00, //unknwon
						"Sg": 2.00, //unknwon
						"Bh": 2.00, //unknwon
						"Hs": 2.00, //unknwon
						"Mt": 2.00 //unknwon
};
exports.atomRadius = atomRadius;

},{}],13:[function(require,module,exports){
"use strict";

exports.__esModule = true;
exports.getMoleculeGeometry = getMoleculeGeometry;
exports.updateMoleculeGeometry = updateMoleculeGeometry;
exports.changeMoleculeGeometry = changeMoleculeGeometry;
exports.removeMoleculeGeometry = removeMoleculeGeometry;
exports.addMoleculePeriodicReplicates = addMoleculePeriodicReplicates;
exports.removeMoleculePeriodicReplicates = removeMoleculePeriodicReplicates;
exports.changeMoleculePeriodicReplicates = changeMoleculePeriodicReplicates;

var _AtomSetupJs = require("./AtomSetup.js");

var _PointCloudMaterialsJs = require("./PointCloudMaterials.js");

var _UtilitiesOtherJs = require("../Utilities/other.js");

function addAtoms(view, moleculeData, lut) {
	var options = view.options;
	var sizeCode = options.moleculeSizeCodeBasis;
	var colorCode = options.moleculeColorCodeBasis;

	if (options.atomsStyle == "sprite") {
		var geometry = new THREE.BufferGeometry();
		var positions = new Float32Array(moleculeData.length * 3);
		var colors = new Float32Array(moleculeData.length * 3);
		var sizes = new Float32Array(moleculeData.length);
		var alphas = new Float32Array(moleculeData.length);

		var i3 = 0;
		for (var i = 0; i < moleculeData.length; i++) {
			var atomData = moleculeData[i];
			positions[i3 + 0] = atomData.xPlot;
			positions[i3 + 1] = atomData.yPlot;
			positions[i3 + 2] = atomData.zPlot;

			if (colorCode == "atom") {
				var color = _UtilitiesOtherJs.colorToRgb(_AtomSetupJs.colorSetup[atomData.atom]);
			} else {
				var color = lut.getColor(atomData[colorCode]);
			}

			colors[i3 + 0] = color.r;
			colors[i3 + 1] = color.g;
			colors[i3 + 2] = color.b;

			if (moleculeData[i].selected) {
				if (sizeCode == "atom") {
					sizes[i] = options.atomSize * _AtomSetupJs.atomRadius[atomData.atom] * 40;
				} else {
					var tempSize = (atomData[sizeCode] - options.moleculeSizeSettingMin) / (options.moleculeSizeSettingMax - options.moleculeSizeSettingMin);
					sizes[i] = options.atomSize * tempSize * 40;
				}

				alphas[i] = options.moleculeAlpha;
			} else {
				sizes[i] = 0;
				alphas[i] = 0;
			}

			i3 += 3;
		}

		geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
		geometry.setAttribute('customColor', new THREE.BufferAttribute(colors, 3));
		geometry.setAttribute('size', new THREE.BufferAttribute(sizes, 1));
		geometry.setAttribute('alpha', new THREE.BufferAttribute(alphas, 1));

		var atoms = new THREE.Points(geometry, _PointCloudMaterialsJs.shaderMaterial2);
		atoms.frustumCulled = false;
	}

	if (options.atomsStyle == "ball") {
		var atomList = [];
		var atomColorList = [];

		for (var i = 0; i < moleculeData.length; i++) {
			var atomData = moleculeData[i];

			if (moleculeData[i].selected) {
				if (colorCode == "atom") {
					//var color = colorToRgb(colorSetup[atomData.atom]);
					var color = _AtomSetupJs.colorSetup[atomData.atom];
				} else {
					var color = lut.getColor(atomData[colorCode]);
				}
				if (sizeCode == "atom") {
					var atomSize = options.atomSize * _AtomSetupJs.atomRadius[atomData.atom];
				} else {
					var tempSize = (atomData[sizeCode] - options.moleculeSizeSettingMin) / (options.moleculeSizeSettingMax - options.moleculeSizeSettingMin);
					var atomSize = options.atomSize * tempSize;
				}
				atomList.push(new THREE.SphereBufferGeometry(atomSize * 40, options.atomModelSegments, options.atomModelSegments).translate(atomData.xPlot, atomData.yPlot, atomData.zPlot));
				var tempColor = new THREE.Color(color);
				atomColorList.push([tempColor.r, tempColor.g, tempColor.b]);
			}
		}
		var atomsGeometry = combineGeometry(atomList, atomColorList);
		var atoms = new THREE.Mesh(atomsGeometry, new THREE.MeshBasicMaterial({ transparent: true, opacity: options.moleculeAlpha, vertexColors: THREE.VertexColors }));
	}

	view.molecule.atoms = atoms;
	view.scene.add(atoms);
}

function addBonds(view, moleculeData, neighborsData) {
	var options = view.options;
	var colorCode = options.moleculeColorCodeBasis;
	var lut = view.moleculeLut;

	if (options.bondsStyle == "tube") {
		var bondList = [];
		var bondColorList = [];

		for (var i = 0; i < moleculeData.length; i++) {
			if (moleculeData[i].selected) {
				var tempNeighborObject = neighborsData[i];
				var neighborsList = tempNeighborObject.neighborsList;
				var distancesList = tempNeighborObject.distancesList;
				var coordinatesList = tempNeighborObject.coordinatesList;

				if (colorCode == "atom") {
					var color = _AtomSetupJs.colorSetup[moleculeData[i].atom];
				} else {
					var color = lut.getColor(moleculeData[i][colorCode]);
				}

				var point1 = new THREE.Vector3(moleculeData[i].xPlot, moleculeData[i].yPlot, moleculeData[i].zPlot);

				for (var j = 0; j < neighborsList.length; j++) {
					var point2 = coordinatesList[j];
					if (distancesList[j] < options.maxBondLength && distancesList[j] > options.minBondLength && neighborsList[j].selected) {
						bondList.push(createBond(options, point1, point2));
						var tempColor = new THREE.Color(color);
						bondColorList.push([tempColor.r, tempColor.g, tempColor.b]);
					}
				}
			}
		}
		var bondsGeometry = combineGeometry(bondList, bondColorList);
		var bonds = new THREE.Mesh(bondsGeometry, new THREE.MeshBasicMaterial({ transparent: true, opacity: options.moleculeAlpha, vertexColors: THREE.VertexColors }));
	}

	if (options.bondsStyle == "line") {
		var basicLineBondGeometry = new THREE.BufferGeometry();
		var material = new THREE.LineBasicMaterial({ vertexColors: THREE.VertexColors });
		var vertices = [];
		var indices = [];
		var verticesColors = [];
		var index_counter = 0;

		for (var i = 0; i < moleculeData.length; i++) {
			if (moleculeData[i].selected) {
				var tempNeighborObject = neighborsData[i];
				var neighborsList = tempNeighborObject.neighborsList;
				var distancesList = tempNeighborObject.distancesList;
				var coordinatesList = tempNeighborObject.coordinatesList;

				if (colorCode == "atom") {
					var color = _UtilitiesOtherJs.colorToRgb(_AtomSetupJs.colorSetup[moleculeData[i].atom]);
				} else {
					var color = lut.getColor(moleculeData[i][colorCode]);
				}
				//var color = colorSetup[moleculeData[i].atom];

				var point1 = new THREE.Vector3(moleculeData[i].xPlot, moleculeData[i].yPlot, moleculeData[i].zPlot);

				for (var j = 0; j < neighborsList.length; j++) {
					//var point2 = new THREE.Vector3(neighborsList[j].xPlot*20.0, neighborsList[j].yPlot*20.0,neighborsList[j].zPlot*20.0);
					var point2 = coordinatesList[j];
					if (distancesList[j] < options.maxBondLength && distancesList[j] > options.minBondLength && neighborsList[j].selected) {

						vertices.push(point1, point2);
						indices.push(index_counter, index_counter + 1);
						verticesColors.push(color, color);
						index_counter += 2;
					}
				}
			}
		}

		var positions = new Float32Array(vertices.length * 3);
		var colors = new Float32Array(vertices.length * 3);

		for (var i = 0; i < vertices.length; i++) {

			positions[i * 3] = vertices[i].x;
			positions[i * 3 + 1] = vertices[i].y;
			positions[i * 3 + 2] = vertices[i].z;

			colors[i * 3] = verticesColors[i].r;
			colors[i * 3 + 1] = verticesColors[i].g;
			colors[i * 3 + 2] = verticesColors[i].b;
		}
		basicLineBondGeometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
		basicLineBondGeometry.setAttribute('color', new THREE.Float32BufferAttribute(colors, 3));
		basicLineBondGeometry.setIndex(new THREE.BufferAttribute(new Uint16Array(indices), 1));

		var bonds = new THREE.LineSegments(basicLineBondGeometry, material);
	}

	if (options.bondsStyle == "fatline") {
		var basicLineBondGeometry = new THREE.BufferGeometry();
		var material = new THREE.LineMaterial({

			color: 0xffffff,
			linewidth: 5, // in pixels
			vertexColors: THREE.VertexColors,
			//resolution:  // to be set by renderer, eventually
			dashed: false

		});

		material.resolution.set(view.windowWidth, view.windowHeight);
		var vertices = [];
		var indices = [];
		var verticesColors = [];
		var index_counter = 0;

		for (var i = 0; i < moleculeData.length; i++) {
			if (moleculeData[i].selected) {
				var tempNeighborObject = neighborsData[i];
				var neighborsList = tempNeighborObject.neighborsList;
				var distancesList = tempNeighborObject.distancesList;
				var coordinatesList = tempNeighborObject.coordinatesList;

				if (colorCode == "atom") {
					var color = _UtilitiesOtherJs.colorToRgb(_AtomSetupJs.colorSetup[moleculeData[i].atom]);
				} else {
					var color = lut.getColor(moleculeData[i][colorCode]);
				}
				//var color = colorSetup[moleculeData[i].atom];

				var point1 = new THREE.Vector3(moleculeData[i].xPlot, moleculeData[i].yPlot, moleculeData[i].zPlot);

				for (var j = 0; j < neighborsList.length; j++) {
					//var point2 = new THREE.Vector3(neighborsList[j].xPlot*20.0, neighborsList[j].yPlot*20.0,neighborsList[j].zPlot*20.0);
					var point2 = coordinatesList[j];
					if (distancesList[j] < options.maxBondLength && distancesList[j] > options.minBondLength && neighborsList[j].selected) {

						vertices.push(point1, point2);
						indices.push(index_counter, index_counter + 1);
						verticesColors.push(color, color);
						index_counter += 2;
					}
				}
			}
		}

		var positions = new Float32Array(vertices.length * 3);
		var colors = new Float32Array(vertices.length * 3);

		for (var i = 0; i < vertices.length; i++) {

			positions[i * 3] = vertices[i].x;
			positions[i * 3 + 1] = vertices[i].y;
			positions[i * 3 + 2] = vertices[i].z;

			colors[i * 3] = verticesColors[i].r;
			colors[i * 3 + 1] = verticesColors[i].g;
			colors[i * 3 + 2] = verticesColors[i].b;
		}
		basicLineBondGeometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
		basicLineBondGeometry.setAttribute('color', new THREE.Float32BufferAttribute(colors, 3));
		basicLineBondGeometry.setIndex(new THREE.BufferAttribute(new Uint16Array(indices), 1));
		var bonds = new THREE.LineSegments2(basicLineBondGeometry, material);
	}
	view.molecule.bonds = bonds;
	view.scene.add(bonds);
}

function combineGeometry(geoarray, colorarray) {
	var posArrLength = 0;
	var normArrLength = 0;
	var uvArrLength = 0;
	var indexArrLength = 0;
	geoarray.forEach(function (geometry) {
		posArrLength += geometry.attributes.position.count * 3;
		normArrLength += geometry.attributes.normal.count * 3;
		uvArrLength += geometry.attributes.uv.count * 2;
		indexArrLength += geometry.index.count;
	});

	var sumPosArr = new Float32Array(posArrLength);
	var sumColorArr = new Float32Array(posArrLength);
	var sumNormArr = new Float32Array(normArrLength);
	var sumUvArr = new Float32Array(uvArrLength);
	var sumIndexArr = new Uint32Array(indexArrLength);

	var postotalarr = [];

	var sumPosCursor = 0;
	var sumNormCursor = 0;
	var sumUvCursor = 0;
	var sumIndexCursor = 0;
	var sumIndexCursor2 = 0;

	for (var a = 0; a < geoarray.length; a++) {
		var posAttArr = geoarray[a].getAttribute('position').array;

		for (var b = 0; b < posAttArr.length; b++) {
			sumPosArr[b + sumPosCursor] = posAttArr[b];
			sumColorArr[b + sumPosCursor] = colorarray[a][b % 3];
		}
		sumPosCursor += posAttArr.length;

		var numAttArr = geoarray[a].getAttribute('normal').array;

		for (var b = 0; b < numAttArr.length; b++) {
			sumNormArr[b + sumNormCursor] = numAttArr[b];
		}
		sumNormCursor += numAttArr.length;

		var uvAttArr = geoarray[a].getAttribute('uv').array;

		for (var b = 0; b < uvAttArr.length; b++) {
			sumUvArr[b + sumUvCursor] = uvAttArr[b];
		}
		sumUvCursor += uvAttArr.length;

		var indexArr = geoarray[a].index.array;
		for (var b = 0; b < indexArr.length; b++) {
			sumIndexArr[b + sumIndexCursor] = indexArr[b] + sumIndexCursor2;
		}
		sumIndexCursor += indexArr.length;
		sumIndexCursor2 += posAttArr.length / 3;
	}

	var combinedGeometry = new THREE.BufferGeometry();
	combinedGeometry.setAttribute('position', new THREE.BufferAttribute(sumPosArr, 3));
	combinedGeometry.setAttribute('normal', new THREE.BufferAttribute(sumNormArr, 3));
	combinedGeometry.setAttribute('uv', new THREE.BufferAttribute(sumUvArr, 2));
	combinedGeometry.setAttribute('color', new THREE.BufferAttribute(sumColorArr, 3));
	combinedGeometry.setIndex(new THREE.BufferAttribute(sumIndexArr, 1));
	return combinedGeometry;
}

function createBond(options, point1, point2) {
	var direction = new THREE.Vector3().subVectors(point2, point1);
	var bondGeometry = new THREE.CylinderBufferGeometry(options.bondSize, options.bondSize, direction.length(), options.bondModelSegments, 1, true);
	//bond.scale.set(1, 1, direction.length());
	var orientation = new THREE.Matrix4();
	// THREE.Object3D().up (=Y) default orientation for all objects
	orientation.lookAt(point1, point2, new THREE.Object3D().up);
	// rotation around axis X by -90 degrees
	// matches the default orientation Y
	// with the orientation of looking Z
	orientation.multiply(new THREE.Matrix4().set(1, 0, 0, 0, 0, 0, 1, 0, 0, -1, 0, 0, 0, 0, 0, 1));
	bondGeometry.applyMatrix(orientation);
	bondGeometry.translate((point2.x + point1.x) / 2, (point2.y + point1.y) / 2, (point2.z + point1.z) / 2);

	return bondGeometry;
}

function addBond(view, point1, point2, bond, bondGroup) {
	var options = view.options;

	var direction = new THREE.Vector3().subVectors(point2, point1);
	//bond.scale.set(1, 1, direction.length());
	var orientation = new THREE.Matrix4();
	// THREE.Object3D().up (=Y) default orientation for all objects
	orientation.lookAt(point1, point2, new THREE.Object3D().up);
	// rotation around axis X by -90 degrees
	// matches the default orientation Y
	// with the orientation of looking Z
	orientation.multiply(new THREE.Matrix4().set(1, 0, 0, 0, 0, 0, 1, 0, 0, -1, 0, 0, 0, 0, 0, 1));

	bond.applyMatrix(orientation);
	bond.position.x = (point2.x + point1.x) / 2;
	bond.position.y = (point2.y + point1.y) / 2;
	bond.position.z = (point2.z + point1.z) / 2;
	bond.scale.set(1, direction.length(), 1);
	//view[moleculeObject].bonds.push(bond);
	bondGroup.add(bond);
	// return bond;
	//scene.add(bond);*/
}

function getMoleculeGeometry(view) {

	view.molecule = {};
	//view.molecule.atoms = [];
	//view.molecule.bonds = [];
	var options = view.options;
	var currentFrame = options.currentFrame.toString();
	var scene = view.scene;
	//var moleculeData = view.systemMoleculeData;
	var moleculeData = view.systemMoleculeDataFramed[currentFrame];
	var neighborsData = view.systemMoleculeDataFramedBondsDict[currentFrame];

	var sizeCode = options.moleculeSizeCodeBasis;
	var colorCode = options.moleculeColorCodeBasis;

	if (colorCode != "atom") {
		var colorMap = options.colorMap;
		var numberOfColors = 512;

		var lut = new THREE.Lut(colorMap, numberOfColors);
		lut.setMax(options.moleculeColorSettingMax);
		lut.setMin(options.moleculeColorSettingMin);
		//view.lut = lut;
		view.moleculeLut = lut;
	}

	if (options.showAtoms) {
		addAtoms(view, moleculeData, lut);
	}

	if (options.showBonds) {
		addBonds(view, moleculeData, neighborsData);
	}
}

function updateMoleculeGeometry(view) {

	removeMoleculeGeometry(view);
	getMoleculeGeometry(view);
}

function changeMoleculeGeometry(view) {

	removeMoleculeGeometry(view);
	getMoleculeGeometry(view);
}

function removeMoleculeGeometry(view) {

	if (view.molecule != null) {
		view.scene.remove(view.molecule.atoms);
		view.scene.remove(view.molecule.bonds);
		delete view.molecule;
	}
}

function addMoleculePeriodicReplicates(view) {

	view.periodicReplicateMolecule = {};

	var options = view.options;
	var currentFrame = options.currentFrame.toString();
	var scene = view.scene;
	var moleculeData = view.systemMoleculeDataFramed[currentFrame];

	var atoms = view.molecule.atoms;
	var bonds = view.molecule.bonds;

	var sizeCode = options.moleculeSizeCodeBasis;
	var colorCode = options.moleculeColorCodeBasis;

	if (colorCode != "atom") {
		var lut = view.moleculeLut;
		//var lut = view.lut;
	}

	if (sizeCode != "atom") {
		var sizeMax = options.moleculeSizeSettingMax;
		var sizeMin = options.moleculeSizeSettingMin;
	}

	var xPlotScale = view.xPlotScale;
	var yPlotScale = view.yPlotScale;
	var zPlotScale = view.zPlotScale;

	var xStep = 20.0 * (view.xPlotMax - view.xPlotMin);
	var yStep = 20.0 * (view.yPlotMax - view.yPlotMin);
	var zStep = 20.0 * (view.zPlotMax - view.zPlotMin);

	var x_start = -1 * ((options.xPBC - 1) / 2);
	var x_end = (options.xPBC - 1) / 2 + 1;
	var y_start = -1 * ((options.yPBC - 1) / 2);
	var y_end = (options.yPBC - 1) / 2 + 1;
	var z_start = -1 * ((options.zPBC - 1) / 2);
	var z_end = (options.zPBC - 1) / 2 + 1;

	var periodicReplicateAtomGroup = new THREE.Group();
	var periodicReplicateBondGroup = new THREE.Group();

	//var atomGeometry = new THREE.SphereGeometry(100, options.atomModelSegments, options.atomModelSegments);
	//var bondGeometry = new THREE.CylinderGeometry( options.bondSize*10, options.bondSize*10, direction.length(), options.bondModelSegments, 1, true);

	if (options.showAtoms) {
		for (var i = x_start; i < x_end; i++) {
			for (var j = y_start; j < y_end; j++) {
				for (var k = z_start; k < z_end; k++) {
					if ((i == 0 && j == 0 && k == 0) == false) {

						var tempAtomsReplica = atoms.clone();
						tempAtomsReplica.position.set(i * xStep, j * yStep, k * zStep);
						periodicReplicateAtomGroup.add(tempAtomsReplica);
					}
				}
			}
		}
	}

	if (options.showBonds) {
		for (var i = x_start; i < x_end; i++) {
			for (var j = y_start; j < y_end; j++) {
				for (var k = z_start; k < z_end; k++) {
					if ((i == 0 && j == 0 && k == 0) == false) {

						var tempBondsReplica = bonds.clone();
						tempBondsReplica.position.set(i * xStep, j * yStep, k * zStep);
						periodicReplicateBondGroup.add(tempBondsReplica);
					}
				}
			}
		}
	}

	view.periodicReplicateMolecule.atoms = periodicReplicateAtomGroup;
	view.periodicReplicateMolecule.bonds = periodicReplicateBondGroup;
	scene.add(periodicReplicateAtomGroup);
	scene.add(periodicReplicateBondGroup);
}

function removeMoleculePeriodicReplicates(view) {

	if (view.periodicReplicateMolecule != null) {
		view.scene.remove(view.periodicReplicateMolecule.atoms);
		view.scene.remove(view.periodicReplicateMolecule.bonds);
		delete view.periodicReplicateMolecule;
	}
}

function changeMoleculePeriodicReplicates(view) {
	removeMoleculePeriodicReplicates(view);
	addMoleculePeriodicReplicates(view);
}

},{"../Utilities/other.js":28,"./AtomSetup.js":12,"./PointCloudMaterials.js":14}],14:[function(require,module,exports){
"use strict";

exports.__esModule = true;
var uniforms = {

	color: { value: new THREE.Color(0xffffff) },
	texture: { value: new THREE.TextureLoader().load("textures/sprites/disc.png") }

};

exports.uniforms = uniforms;
/*const material = new THREE.ShaderMaterial( {
	vertexShader: `attribute vec3 color;
	attribute vec3 offset;
	varying vec4 vColor;
	varying vec3 vDisplacement;
	uniform float scale;

	void main()	{
		vColor = vec4( color, 1.0 );
		vDisplacement = offset;
		//vDisplacement = vec3(0.0,0.0,0.0);
		vec3 newPosition = position + (vDisplacement);
		gl_Position = projectionMatrix * modelViewMatrix * vec4( newPosition, 1.0 );
	}`,
	fragmentShader: `varying vec3 vPosition;
	varying vec4 vColor;
	void main()	{
		vec4 color = vec4( vColor );
		gl_FragColor = color;
	}`,
	side: THREE.DoubleSide,
	transparent: true
	});
	


<script id="vshader" type="x-shader/x-vertex">
		precision highp float;
		uniform mat4 modelViewMatrix;
		uniform mat4 projectionMatrix;
		uniform float time;

		attribute vec3 position;
		attribute vec2 uv;
		attribute vec3 translate;

		varying vec2 vUv;
		varying float vScale;

		void main() {

			vec4 mvPosition = modelViewMatrix * vec4( translate, 1.0 );
			vec3 trTime = vec3(translate.x + time,translate.y + time,translate.z + time);
			float scale =  sin( trTime.x * 2.1 ) + sin( trTime.y * 3.2 ) + sin( trTime.z * 4.3 );
			vScale = scale;
			scale = scale * 10.0 + 10.0;
			mvPosition.xyz += position * scale;
			vUv = uv;
			gl_Position = projectionMatrix * mvPosition;

		}
	</script>
	<script id="fshader" type="x-shader/x-fragment">
		precision highp float;

		uniform sampler2D map;

		varying vec2 vUv;
		varying float vScale;

		// HSL to RGB Convertion helpers
		vec3 HUEtoRGB(float H){
			H = mod(H,1.0);
			float R = abs(H * 6.0 - 3.0) - 1.0;
			float G = 2.0 - abs(H * 6.0 - 2.0);
			float B = 2.0 - abs(H * 6.0 - 4.0);
			return clamp(vec3(R,G,B),0.0,1.0);
		}

		vec3 HSLtoRGB(vec3 HSL){
			vec3 RGB = HUEtoRGB(HSL.x);
			float C = (1.0 - abs(2.0 * HSL.z - 1.0)) * HSL.y;
			return (RGB - 0.5) * C + HSL.z;
		}

		void main() {
			vec4 diffuseColor = texture2D( map, vUv );
			gl_FragColor = vec4( diffuseColor.xyz * HSLtoRGB(vec3(vScale/5.0, 1.0, 0.5)), diffuseColor.w );

			if ( diffuseColor.w < 0.5 ) discard;
		}
	</script>
	
	
	*/

/*export var shaderMaterialInstanced = new THREE.RawShaderMaterial( {

	uniforms:       uniforms,
	vertexShader:   `
	precision highp float;

	uniform mat4 modelViewMatrix;
	uniform mat4 projectionMatrix;

	attribute vec3 position;

	attribute float size;
	attribute vec3 customColor;
	attribute vec3 offset;
	attribute float alpha;

	varying float vAlpha;
	varying vec3 vColor;

	void main() {
	  vColor = customColor;
	  vAlpha = alpha;
	  vec3 newPosition = position + offset;
	  vec4 mvPosition = modelViewMatrix * vec4( newPosition, 1.0 );
	  gl_PointSize = size * ( 300.0 / -mvPosition.z );
	  gl_Position = projectionMatrix * mvPosition;

	}`,
	fragmentShader: `
	precision highp float;
	uniform vec3 color;
	uniform sampler2D texture;

	varying vec3 vColor;
	varying float vAlpha;

	void main() {
	gl_FragColor = vec4( color * vColor, vAlpha );
	gl_FragColor = gl_FragColor * texture2D( texture, gl_PointCoord );
	}`,

	blending:       THREE.AdditiveBlending,
	depthTest:      false,
	transparent:    true

});*/

var shaderMaterial = new THREE.ShaderMaterial({

	uniforms: uniforms,
	vertexShader: "\n\t\tattribute float size;\n\t\tattribute vec3 customColor;\n\t\tattribute float alpha;\n\n\t\tvarying float vAlpha;\n\t\tvarying vec3 vColor;\n\n\t\tvoid main() {\n\t\tvColor = customColor;\n\t\tvAlpha = alpha;\n\t\tvec4 mvPosition = modelViewMatrix * vec4( position, 1.0 );\n\t\tgl_PointSize = size * ( 300.0 / -mvPosition.z );\n\t\tgl_Position = projectionMatrix * mvPosition;\n\t\t}\n\t",
	fragmentShader: "\n\t\tuniform vec3 color;\n\t\tuniform sampler2D texture;\n\n\t\tvarying vec3 vColor;\n\t\tvarying float vAlpha;\n\n\t\tvoid main() {\n\t\t\tgl_FragColor = vec4( color * vColor, vAlpha );\n\t\t\tgl_FragColor = gl_FragColor * texture2D( texture, gl_PointCoord );\n\t\t}\n\t",

	blending: THREE.AdditiveBlending,
	depthTest: false,
	transparent: true

});

exports.shaderMaterial = shaderMaterial;
var uniforms2 = {

	color: { value: new THREE.Color(0xffffff) },
	texture: { value: new THREE.TextureLoader().load("textures/sprites/ball.png") }

};

exports.uniforms2 = uniforms2;
var shaderMaterial2 = new THREE.ShaderMaterial({

	uniforms: uniforms2,
	vertexShader: document.getElementById('vertexshader_molecule').textContent,
	fragmentShader: document.getElementById('fragmentshader_molecule').textContent,

	/*blending:       THREE.AdditiveBlending,
 depthTest:      false,
 transparent:    true*/
	alphaTest: 0.5

});
exports.shaderMaterial2 = shaderMaterial2;

},{}],15:[function(require,module,exports){
"use strict";

exports.__esModule = true;
exports.getPointCloudGeometry = getPointCloudGeometry;
exports.addPointCloudPeriodicReplicates = addPointCloudPeriodicReplicates;
exports.updatePointCloudGeometry = updatePointCloudGeometry;
exports.animatePointCloudGeometry = animatePointCloudGeometry;
exports.removePointCloudGeometry = removePointCloudGeometry;
exports.removePointCloudPeriodicReplicates = removePointCloudPeriodicReplicates;
exports.changePointCloudGeometry = changePointCloudGeometry;
exports.changePointCloudPeriodicReplicates = changePointCloudPeriodicReplicates;

var _PointCloudMaterialsJs = require("./PointCloudMaterials.js");

function getPointCloudGeometry(view) {

	var options = view.options;
	var scene = view.scene;
	var currentFrame = options.currentFrame.toString();
	var spatiallyResolvedData = view.systemSpatiallyResolvedDataFramed[currentFrame];

	var particles = options.pointCloudParticles;
	var num_blocks = view.systemSpatiallyResolvedData.length;
	var points_in_block = new Float32Array(num_blocks);
	var total = Math.pow(10, options.pointCloudTotalMagnitude);
	var count = 0;

	for (var k = 0; k < num_blocks; k++) {
		var num_points = Math.min(Math.floor(spatiallyResolvedData[k][options.density] / total * particles), options.pointCloudMaxPointPerBlock);
		points_in_block[k] = num_points;
		count += num_points;
	}
	console.log("total points in cloud: ", count);

	var positions = new Float32Array(count * 3);
	var colors = new Float32Array(count * 3);
	var sizes = new Float32Array(count);
	var alphas = new Float32Array(count);
	var parentBlock = new Float32Array(count);

	var colorMap = options.colorMap;
	var numberOfColors = 512;

	var lut = new THREE.Lut(colorMap, numberOfColors);
	lut.setMax(options.pointCloudColorSettingMax);
	lut.setMin(options.pointCloudColorSettingMin);
	view.lut = lut;

	var i = 0,
	    i3 = 0;
	var temp_num_points = 0;
	for (var k = 0; k < num_blocks; k++) {
		temp_num_points = points_in_block[k];
		if (temp_num_points > 0) {

			var x_start = spatiallyResolvedData[k]['xPlot'] - 0.5;
			var y_start = spatiallyResolvedData[k]['yPlot'] - 0.5;
			var z_start = spatiallyResolvedData[k]['zPlot'] - 0.5;
			var x_end = x_start + 1;
			var y_end = y_start + 1;
			var z_end = z_start + 1;

			for (var j = 0; j < temp_num_points; j++) {

				var x = Math.random() + x_start;
				var y = Math.random() + y_start;
				var z = Math.random() + z_start;

				positions[i3 + 0] = x;
				positions[i3 + 1] = y;
				positions[i3 + 2] = z;

				var color = lut.getColor(spatiallyResolvedData[k][options.propertyOfInterest]);

				colors[i3 + 0] = color.r;
				colors[i3 + 1] = color.g;
				colors[i3 + 2] = color.b;

				if (x_start >= options.x_low && x_end <= options.x_high && y_start >= options.y_low && y_end <= options.y_high && z_start >= options.z_low && z_end <= options.z_high && spatiallyResolvedData[k].selected) {
					alphas[i] = options.pointCloudAlpha;
					//if (options.animate) {sizes[ i ] = Math.random() *(options.pointCloudSize-0.5) + 0.5;}
					if (options.animate) {
						sizes[i] = Math.random() * options.pointCloudSize;
					} else {
						sizes[i] = options.pointCloudSize;
					}
				} else {
					alphas[i] = 0;
					sizes[i] = 0;
				}

				parentBlock[i] = k;

				i++;
				i3 += 3;
			}
		}
	}

	/*if (options.PBCBoolean){
 	var xStep = 10.0*(view.xPlotMax - view.xPlotMin);
 	var yStep = 10.0*(view.yPlotMax - view.yPlotMin);
 	var zStep = 10.0*(view.zPlotMax - view.zPlotMin);
 
 	var x_start = -1 * ((options.xPBC-1)/2);
 	var x_end = ((options.xPBC-1)/2) + 1;
 	var y_start = -1 * ((options.yPBC-1)/2);
 	var y_end = ((options.yPBC-1)/2) + 1;
 	var z_start = -1 * ((options.zPBC-1)/2);
 	var z_end = ((options.zPBC-1)/2) + 1;
 	
 	var sumDisplacement = [];
 	for ( var i = x_start; i < x_end; i ++) {
 		for ( var j = y_start; j < y_end; j ++) {
 			for ( var k = z_start; k < z_end; k ++) {
 				sumDisplacement.push(i*xStep, j*yStep, k*zStep);
 			}
 		}
 	}
 } else {
 	var sumDisplacement = [0.0, 0.0, 0.0];
 }
 
 
 var geometry = new THREE.InstancedBufferGeometry();
 geometry.setAttribute( 'position', new THREE.BufferAttribute( positions, 3 ) );
 geometry.setAttribute( 'customColor', new THREE.BufferAttribute( colors, 3 ) );
 geometry.setAttribute( 'size', new THREE.BufferAttribute( sizes, 1 ) );
 geometry.setAttribute( 'alpha', new THREE.BufferAttribute( alphas, 1 ) );
 geometry.parentBlockMap = parentBlock;
 console.log(sumDisplacement);
 const sumDisp = new Float32Array(sumDisplacement);
 geometry.setAttribute('offset', new THREE.InstancedBufferAttribute(sumDisp, 3 ));
 
 var System = new THREE.Mesh( geometry, shaderMaterial );
 System.frustumCulled = false
 view.System = System;
 scene.add( System );*/

	var geometry = new THREE.BufferGeometry();
	geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
	geometry.setAttribute('customColor', new THREE.BufferAttribute(colors, 3));
	geometry.setAttribute('size', new THREE.BufferAttribute(sizes, 1));
	geometry.setAttribute('alpha', new THREE.BufferAttribute(alphas, 1));
	geometry.parentBlockMap = parentBlock;

	var System = new THREE.Points(geometry, _PointCloudMaterialsJs.shaderMaterial);
	view.System = System;
	//console.log(System);
	scene.add(System);

	if (options.PBCBoolean) {
		changePointCloudPeriodicReplicates(view);
	}
}

/*
Float32Array.prototype.concat = function() {
	var bytesPerIndex = 4,
		buffers = Array.prototype.slice.call(arguments);
	
	// add self
	buffers.unshift(this);

	buffers = buffers.map(function (item) {
		if (item instanceof Float32Array) {
			return item.buffer;
		} else if (item instanceof ArrayBuffer) {
			if (item.byteLength / bytesPerIndex % 1 !== 0) {
				throw new Error('One of the ArrayBuffers is not from a Float32Array');	
			}
			return item;
		} else {
			throw new Error('You can only concat Float32Array, or ArrayBuffers');
		}
	});

	var concatenatedByteLength = buffers
		.map(function (a) {return a.byteLength;})
		.reduce(function (a,b) {return a + b;}, 0);

	var concatenatedArray = new Float32Array(concatenatedByteLength / bytesPerIndex);

	var offset = 0;
	buffers.forEach(function (buffer, index) {
		concatenatedArray.set(new Float32Array(buffer), offset);
		offset += buffer.byteLength / bytesPerIndex;
	});

	return concatenatedArray;
};
*/

function getPositionArrayAfterTranslation(positions, count, x, y, z) {
	var result = new Float32Array(count * 3);
	for (var i = 0; i < count * 3; i = i + 3) {
		result[i] = positions[i] + x;
		result[i + 1] = positions[i + 1] + y;
		result[i + 2] = positions[i + 2] + z;
	}
	return result;
}

function addPointCloudPeriodicReplicates(view) {

	var options = view.options;
	var scene = view.scene;
	var system = view.System;

	var shaderMaterial = view.System.material;

	//var geometry = new THREE.BufferGeometry();
	var xStep = view.xPlotMax - view.xPlotMin;
	var yStep = view.yPlotMax - view.yPlotMin;
	var zStep = view.zPlotMax - view.zPlotMin;

	var x_start = -1 * ((options.xPBC - 1) / 2);
	var x_end = (options.xPBC - 1) / 2 + 1;
	var y_start = -1 * ((options.yPBC - 1) / 2);
	var y_end = (options.yPBC - 1) / 2 + 1;
	var z_start = -1 * ((options.zPBC - 1) / 2);
	var z_end = (options.zPBC - 1) / 2 + 1;

	var periodicReplicateSystemGroup = new THREE.Group();

	console.log('create replicates');

	for (var i = x_start; i < x_end; i++) {
		for (var j = y_start; j < y_end; j++) {
			for (var k = z_start; k < z_end; k++) {
				if (!(i == 0 && j == 0 && k == 0)) {
					console.log(i, j, k);
					var tempSystemReplica = system.clone();
					tempSystemReplica.position.set(i * xStep, j * yStep, k * zStep);
					periodicReplicateSystemGroup.add(tempSystemReplica);
				}
			}
		}
	}
	view.periodicReplicateSystems = periodicReplicateSystemGroup;
	scene.add(periodicReplicateSystemGroup);

	/*var options = view.options;
 var system = view.System;
 
 var xStep = 10.0*(view.xPlotMax - view.xPlotMin);
 var yStep = 10.0*(view.yPlotMax - view.yPlotMin);
 var zStep = 10.0*(view.zPlotMax - view.zPlotMin);
 
 
 var x_start = -1 * ((options.xPBC-1)/2);
 var x_end = ((options.xPBC-1)/2) + 1;
 var y_start = -1 * ((options.yPBC-1)/2);
 var y_end = ((options.yPBC-1)/2) + 1;
 var z_start = -1 * ((options.zPBC-1)/2);
 var z_end = ((options.zPBC-1)/2) + 1;
 
 const sumDisplacement = []
 for ( var i = x_start; i < x_end; i ++) {
 	for ( var j = y_start; j < y_end; j ++) {
 		for ( var k = z_start; k < z_end; k ++) {
 			sumDisplacement.push(i*xStep, j*yStep, k*zStep);
 		}
 	}
 }
 console.log(sumDisplacement);
 const sumDisp = new Float32Array(sumDisplacement);
 system.geometry.setAttribute('offset', new THREE.InstancedBufferAttribute(sumDisp, 3 ));*/
}

function updatePointCloudGeometry(view) {

	var options = view.options;
	var positionArray = view.System.geometry.attributes.position.array;
	var parentBlock = view.System.geometry.parentBlockMap;
	var currentFrame = options.currentFrame.toString();
	var spatiallyResolvedData = view.systemSpatiallyResolvedDataFramed[currentFrame];

	var count = view.System.geometry.attributes.size.array.length;

	var colors = new Float32Array(count * 3);
	var sizes = new Float32Array(count);
	var alphas = new Float32Array(count);

	var colorMap = options.colorMap;
	var numberOfColors = 512;

	var lut = new THREE.Lut(colorMap, numberOfColors);
	lut.setMax(options.pointCloudColorSettingMax);
	lut.setMin(options.pointCloudColorSettingMin);
	view.lut = lut;

	for (var i = 0, i3 = 0; i < count; i++) {
		var x = positionArray[i3 + 0] / 10;
		var y = positionArray[i3 + 1] / 10;
		var z = positionArray[i3 + 2] / 10;
		var k = parentBlock[i];

		var color = lut.getColor(spatiallyResolvedData[k][options.propertyOfInterest]);

		colors[i3 + 0] = color.r;
		colors[i3 + 1] = color.g;
		colors[i3 + 2] = color.b;

		if (x >= options.x_low && x <= options.x_high && y >= options.y_low && y <= options.y_high && z >= options.z_low && z <= options.z_high && spatiallyResolvedData[k].selected) {
			alphas[i] = options.pointCloudAlpha;
			//if (options.animate) {sizes[ i ] = Math.random() *(options.pointCloudSize-0.5) + 0.5;}
			if (options.animate) {
				sizes[i] = Math.random() * options.pointCloudSize;
			} else {
				sizes[i] = options.pointCloudSize;
			}
		} else {
			alphas[i] = 0;
			sizes[i] = 0;
		}
		i3 += 3;
	}

	view.System.geometry.setAttribute('customColor', new THREE.BufferAttribute(colors, 3));
	view.System.geometry.setAttribute('size', new THREE.BufferAttribute(sizes, 1));
	view.System.geometry.setAttribute('alpha', new THREE.BufferAttribute(alphas, 1));

	if (options.PBCBoolean) {
		changePointCloudPeriodicReplicates(view);
	}
}

function animatePointCloudGeometry(view) {
	//console.log('updated')

	var options = view.options;

	var currentFrame = options.currentFrame.toString();
	var spatiallyResolvedData = view.systemSpatiallyResolvedDataFramed[currentFrame];
	var positionArray = view.System.geometry.attributes.position.array;
	var sizeArray = view.System.geometry.attributes.size.array;
	var parentBlock = view.System.geometry.parentBlockMap;

	var particles = options.pointCloudParticles;
	var num_blocks = view.systemSpatiallyResolvedData.length;
	var points_in_block = new Float32Array(num_blocks);
	var count = view.System.geometry.attributes.size.array.length;

	//var colors = new Float32Array(count *3);
	var sizes = new Float32Array(count);

	for (var i = 0, i3 = 0; i < count; i++) {
		var x = positionArray[i3 + 0] / 10;
		var y = positionArray[i3 + 1] / 10;
		var z = positionArray[i3 + 2] / 10;
		var k = parentBlock[i];

		if (x >= options.x_low && x <= options.x_high && y >= options.y_low && y <= options.y_high && z >= options.z_low && z <= options.z_high && spatiallyResolvedData[k].selected) {
			var temp = sizeArray[i] - 0.1;
			if (temp >= 0.0) {
				sizeArray[i] = temp;
			} else {
				sizeArray[i] = options.pointCloudSize;
			}
		} else {
			sizes[i] = 0;
		}
	}
	i3 += 3;
}

function removePointCloudGeometry(view) {
	view.scene.remove(view.System);
	if (view.System != null) {
		view.scene.remove(view.System);
		delete view.System;
	}
}

function removePointCloudPeriodicReplicates(view) {
	view.scene.remove(view.periodicReplicateSystems);
	if (view.periodicReplicateSystems != null) {
		view.scene.remove(view.periodicReplicateSystems);
		delete view.periodicReplicateSystems;
	}
}

function changePointCloudGeometry(view) {
	removePointCloudGeometry(view);
	getPointCloudGeometry(view);
}

function changePointCloudPeriodicReplicates(view) {
	//if (view.periodicReplicateSystems != null ){removePointCloudPeriodicReplicates(view)}
	removePointCloudPeriodicReplicates(view);
	addPointCloudPeriodicReplicates(view);
}

},{"./PointCloudMaterials.js":14}],16:[function(require,module,exports){
"use strict";

exports.__esModule = true;
exports.initialize3DViewSetup = initialize3DViewSetup;

var _MultiviewControlCalculateViewportSizesJs = require("../MultiviewControl/calculateViewportSizes.js");

var _MultiviewControlColorLegendJs = require("../MultiviewControl/colorLegend.js");

var _systemEdgeJs = require("./systemEdge.js");

var _UtilitiesSaveDataJs = require("../Utilities/saveData.js");

function initialize3DViewSetup(viewSetup, views, plotSetup) {

	var systemDimension = viewSetup.systemDimension;

	if (viewSetup.spatiallyResolvedData != null) {
		if (viewSetup.spatiallyResolvedData.gridSpacing != null) {
			var gridSpacing = viewSetup.spatiallyResolvedData.gridSpacing;
		} else {
			var gridSpacing = { "x": 0.1, "y": 0.1, "z": 0.1 };
		}
	} else {
		var gridSpacing = { "x": 0.1, "y": 0.1, "z": 0.1 };
	}

	var xCoordMin = systemDimension["x"][0],
	    xCoordMax = systemDimension["x"][1];
	var yCoordMin = systemDimension["y"][0],
	    yCoordMax = systemDimension["y"][1];
	var zCoordMin = systemDimension["z"][0],
	    zCoordMax = systemDimension["z"][1];
	var xSteps = (xCoordMax - xCoordMin) / gridSpacing.x;
	var ySteps = (yCoordMax - yCoordMin) / gridSpacing.y;
	var zSteps = (zCoordMax - zCoordMin) / gridSpacing.z;
	var xPlotMin = 0.0 - xSteps / 2.0,
	    xPlotMax = 0.0 + xSteps / 2.0;
	var yPlotMin = 0.0 - ySteps / 2.0,
	    yPlotMax = 0.0 + ySteps / 2.0;
	var zPlotMin = 0.0 - zSteps / 2.0,
	    zPlotMax = 0.0 + zSteps / 2.0;

	//plot gridspacing is 1

	var defaultSetting = {
		//left: 0,
		//top: 0,
		//width: 0.6,
		//height: 0.5,
		background: new THREE.Color(0, 0, 0),
		backgroundAlpha: 1.0,
		controllerEnabledBackground: new THREE.Color(0.1, 0.1, 0.1),
		eye: [0, 0, 120],
		up: [0, 1, 0],
		//fov: 100,
		mousePosition: [0, 0],
		//viewType: '3Dview',
		//moleculeName: 'CO2',
		//dataFilename: "data/CO2_B3LYP_0_0_0_all_descriptors.csv",
		systemSpatiallyResolvedDataBoolean: false,
		systemMoleculeDataBoolean: false,
		controllerEnabled: false,
		controllerZoom: true,
		controllerRotate: true,
		controllerPan: true,
		xPlotScale: d3.scaleLinear().domain([xCoordMin, xCoordMax]).range([xPlotMin, xPlotMax]),
		yPlotScale: d3.scaleLinear().domain([yCoordMin, yCoordMax]).range([yPlotMin, yPlotMax]),
		zPlotScale: d3.scaleLinear().domain([zCoordMin, zCoordMax]).range([zPlotMin, zPlotMax]),
		xPlotMin: xPlotMin,
		xPlotMax: xPlotMax,
		yPlotMin: yPlotMin,
		yPlotMax: yPlotMax,
		zPlotMin: zPlotMin,
		zPlotMax: zPlotMax,
		xCoordMin: xCoordMin,
		xCoordMax: xCoordMax,
		yCoordMin: yCoordMin,
		yCoordMax: yCoordMax,
		zCoordMin: zCoordMin,
		zCoordMax: zCoordMax,
		options: new function () {
			this.cameraFov = 50;
			this.backgroundColor = "#000000";
			this.backgroundAlpha = 0.0;
			this.showPointCloud = true;
			this.showMolecule = true;
			this.atomSize = 1.0;
			this.bondSize = 1.0;
			this.moleculeTransparency = 1.0;
			this.maxBondLength = 1.5;
			this.minBondLength = 0.3;
			this.pointCloudTotalMagnitude = 2;
			this.pointCloudParticles = 500;
			this.pointCloudMaxPointPerBlock = 60;
			this.pointCloudColorSettingMax = 1.2;
			this.pointCloudColorSettingMin = 0.0;
			this.pointCloudAlpha = 1;
			this.pointCloudSize = 0.5;
			this.animate = false;
			this.currentFrame = 1;
			this.xPBC = 1;
			this.yPBC = 1;
			this.zPBC = 1;
			this.PBCBoolean = false;
			this.x_low = xPlotMin;
			this.x_high = xPlotMax;
			this.y_low = yPlotMin;
			this.y_high = yPlotMax;
			this.z_low = zPlotMin;
			this.z_high = zPlotMax;
			this.x_slider = 0;
			this.y_slider = 0;
			this.z_slider = 0;
			this.densityCutoff = -3;
			this.view = 'pointCloud';
			this.moleculeName = viewSetup.moleculeName;
			this.propertyOfInterest = plotSetup["pointcloudDensity"];
			this.density = plotSetup["pointcloudDensity"];
			this.colorMap = 'rainbow';
			this.planeVisibilityU = false;
			this.planeVisibilityD = false;
			this.planeVisibilityR = false;
			this.planeVisibilityL = false;
			this.planeVisibilityF = false;
			this.planeVisibilityB = false;
			this.planeOpacity = 0.05;
			this.resetCamera = function () {
				viewSetup.controller.reset();
			};
			this.systemEdgeBoolean = true;
			this.autoRotateSystem = false;
			this.autoRotateSpeed = 2.0;
			this.toggleSystemEdge = function () {
				if (viewSetup.options.systemEdgeBoolean) {
					_systemEdgeJs.addSystemEdge(viewSetup);
					//viewSetup.options.systemEdgeBoolean = !viewSetup.options.systemEdgeBoolean;
				} else {
						_systemEdgeJs.removeSystemEdge(viewSetup);
						//viewSetup.options.systemEdgeBoolean = !viewSetup.options.systemEdgeBoolean;
					}
			};
			this.fullscreenBoolean = false;
			this.toggleFullscreen = function () {
				if (!viewSetup.options.fullscreenBoolean) {
					_MultiviewControlCalculateViewportSizesJs.fullscreenOneView(views, viewSetup);
					viewSetup.options.fullscreenBoolean = !viewSetup.options.fullscreenBoolean;
				} else {
					_MultiviewControlCalculateViewportSizesJs.deFullscreen(views);
					viewSetup.options.fullscreenBoolean = !viewSetup.options.fullscreenBoolean;
				}
			};
			this.legendX = 8;
			this.legendY = -4;
			this.legendWidth = 0.5;
			this.legendHeight = 6;
			this.legendTick = 5;
			this.legendFontsize = 55;
			this.legendShownBoolean = true;
			this.toggleLegend = function () {
				if (!viewSetup.options.legendShownBoolean) {
					_MultiviewControlColorLegendJs.insertLegend(viewSetup);
					viewSetup.options.legendShownBoolean = !viewSetup.options.legendShownBoolean;
				} else {
					_MultiviewControlColorLegendJs.removeLegend(viewSetup);
					viewSetup.options.legendShownBoolean = !viewSetup.options.legendShownBoolean;
				}
			};

			this.moleculeColorCodeBasis = "atom";
			this.moleculeColorMap = 'rainbow';
			this.moleculeColorSettingMax = 2;
			this.moleculeColorSettingMin = -2;
			this.moleculeSizeCodeBasis = "atom";
			this.moleculeSizeSettingMax = 2;
			this.moleculeSizeSettingMin = -2;
			this.moleculeAlpha = 1.0;
			this.atomModelSegments = 6;
			this.bondModelSegments = 3;
			this.showAtoms = true;
			this.showBonds = false;
			this.atomsStyle = "sprite";
			this.bondsStyle = "line";

			this.legendXMolecule = 6;
			this.legendYMolecule = -4;
			this.legendWidthMolecule = 0.5;
			this.legendHeightMolecule = 6;
			this.legendTickMolecule = 5;
			this.legendFontsizeMolecule = 55;
			this.legendShownBooleanMolecule = true;
			this.toggleLegendMolecule = function () {
				if (!viewSetup.options.legendShownBooleanMolecule) {
					_MultiviewControlColorLegendJs.insertLegendMolecule(viewSetup);
					viewSetup.options.legendShownBooleanMolecule = !viewSetup.options.legendShownBooleanMolecule;
				} else {
					_MultiviewControlColorLegendJs.removeLegendMolecule(viewSetup);
					viewSetup.options.legendShownBooleanMolecule = !viewSetup.options.legendShownBooleanMolecule;
				}
			};

			this.saveSystemMoleculeData = function () {
				_UtilitiesSaveDataJs.saveSystemMoleculeData(viewSetup, plotSetup);
			};
			this.saveSystemSpatiallyResolvedData = function () {
				_UtilitiesSaveDataJs.saveSystemSpatiallyResolvedData(viewSetup, plotSetup);
			};

			this.cameraLightPositionX = 0;
			this.cameraLightPositionY = 0;
			this.cameraLightPositionZ = 0;
		}()
	};

	viewSetup = extendObject(viewSetup, defaultSetting);
}

function extendObject(obj, src) {
	for (var key in src) {
		if (src.hasOwnProperty(key)) obj[key] = src[key];
	}
	return obj;
}

},{"../MultiviewControl/calculateViewportSizes.js":21,"../MultiviewControl/colorLegend.js":22,"../Utilities/saveData.js":30,"./systemEdge.js":18}],17:[function(require,module,exports){
"use strict";

exports.__esModule = true;
exports.setupOptionBox3DView = setupOptionBox3DView;

var _PointCloud_selectionJs = require("./PointCloud_selection.js");

var _MoleculeViewJs = require("./MoleculeView.js");

var _MultiviewControlColorLegendJs = require("../MultiviewControl/colorLegend.js");

var _UtilitiesScaleJs = require("../Utilities/scale.js");

var _UtilitiesOtherJs = require("../Utilities/other.js");

var _MultiviewControlSetupViewBasicJs = require("../MultiviewControl/setupViewBasic.js");

function setupOptionBox3DView(view, plotSetup) {

	var options = view.options;

	if (view.systemSpatiallyResolvedDataBoolean) {
		var propertyList = plotSetup["spatiallyResolvedPropertyList"];
		var propertyChoiceObject = _UtilitiesOtherJs.arrayToIdenticalObject(propertyList);
	}

	if (view.systemMoleculeDataBoolean) {
		var moleculeDataFeatureList = plotSetup["moleculePropertyList"];
		//if (moleculeDataFeatureList.includes('atom') == false){
		console.log(moleculeDataFeatureList.indexOf("atom"));
		if (moleculeDataFeatureList.indexOf("atom") < 0) {
			moleculeDataFeatureList.push("atom");
		}
		var moleculeDataFeatureChoiceObject = _UtilitiesOtherJs.arrayToIdenticalObject(moleculeDataFeatureList);
	}
	var gui = view.gui;
	//gui.remember(options);
	gui.width = 200;

	var systemInfoFolder = gui.addFolder('System Info');
	var viewFolder = gui.addFolder('View Control');
	if (view.systemMoleculeDataBoolean) {
		var moleculeFolder = gui.addFolder('Molecule View Control');
	}
	if (view.systemSpatiallyResolvedDataBoolean) {
		var pointCloudFolder = gui.addFolder('Point Cloud Control');
	}
	var sliderFolder = gui.addFolder('Slider Control');
	var detailFolder = gui.addFolder('Additional Control');

	systemInfoFolder.add(options, 'moleculeName').name('Name').onChange(function (value) {
		options.moleculeName = view.moleculeName;
		gui.updateDisplay();
	});

	if (view.systemMoleculeDataBoolean) {
		systemInfoFolder.add(options, 'saveSystemMoleculeData').name('Save Molecule');
	}
	if (view.systemSpatiallyResolvedDataBoolean) {
		systemInfoFolder.add(options, 'saveSystemSpatiallyResolvedData').name('Save Spatially Resolved');
	}

	systemInfoFolder.add(options, 'showMolecule').name('Show Molecule').onChange(function (value) {
		if (value == true) {
			_MoleculeViewJs.getMoleculeGeometry(view);
			_MoleculeViewJs.addMoleculePeriodicReplicates(view);
		} else {
			_MoleculeViewJs.removeMoleculeGeometry(view);
			_MoleculeViewJs.removeMoleculePeriodicReplicates(view);
		}
	});

	systemInfoFolder.add(options, 'showPointCloud').name('Show Point Cloud').onChange(function (value) {
		if (value == true) {
			_PointCloud_selectionJs.getPointCloudGeometry(view);
			_PointCloud_selectionJs.addPointCloudPeriodicReplicates(view);
		} else {
			_PointCloud_selectionJs.removePointCloudGeometry(view);
			_PointCloud_selectionJs.removePointCloudPeriodicReplicates(view);
		}
	});

	systemInfoFolder.open();

	viewFolder.add(options, 'resetCamera').name('Set Camera');
	viewFolder.add(options, 'toggleFullscreen').name('Fullscreen');
	viewFolder.add(options, 'systemEdgeBoolean').name('System Edge').onChange(function (value) {
		//updatePointCloudGeometry(view);
		options.toggleSystemEdge.call();
		gui.updateDisplay();
	});
	viewFolder.add(options, 'autoRotateSystem').name('Rotate System').onChange(function (value) {
		view.controller.autoRotate = value;
	});
	if (view.frameBool) {
		viewFolder.add(options, 'currentFrame', view.frameMin, view.frameMax).step(1).name('Current Frame').onChange(function (value) {
			if (options.showPointCloud && view.systemSpatiallyResolvedDataBoolean) {
				_PointCloud_selectionJs.updatePointCloudGeometry(view);
				if (options.PBCBoolean == true) {
					_PointCloud_selectionJs.changePointCloudPeriodicReplicates(view);
				}
			}
			if (options.showMolecule && view.systemMoleculeDataBoolean) {
				_MoleculeViewJs.changeMoleculeGeometry(view);
				if (options.PBCBoolean == true) {
					_MoleculeViewJs.changeMoleculePeriodicReplicates(view);
				}
			}
		});
	}

	viewFolder.open();

	var PBCFolder = viewFolder.addFolder('PBC');

	PBCFolder.add(options, 'xPBC', { '1': 1, '3': 3, '5': 5 }).onChange(function (value) {
		if (options.xPBC > 1 || options.yPBC > 1 || options.zPBC > 1) {
			if (options.showPointCloud && view.systemSpatiallyResolvedDataBoolean) {
				_PointCloud_selectionJs.changePointCloudPeriodicReplicates(view);
			}
			if (options.showMolecule && view.systemMoleculeDataBoolean) {
				_MoleculeViewJs.changeMoleculePeriodicReplicates(view);
			}
			options.PBCBoolean = true;
		} else {
			_PointCloud_selectionJs.removePointCloudPeriodicReplicates(view);
			_MoleculeViewJs.removeMoleculePeriodicReplicates(view);
			options.PBCBoolean = false;
		}
	});

	PBCFolder.add(options, 'yPBC', { '1': 1, '3': 3, '5': 5 }).onChange(function (value) {
		if (options.xPBC > 1 || options.yPBC > 1 || options.zPBC > 1) {
			if (options.showPointCloud && view.systemSpatiallyResolvedDataBoolean) {
				_PointCloud_selectionJs.changePointCloudPeriodicReplicates(view);
			}
			if (options.showMolecule && view.systemMoleculeDataBoolean) {
				_MoleculeViewJs.changeMoleculePeriodicReplicates(view);
			}
			options.PBCBoolean = true;
		} else {
			_PointCloud_selectionJs.removePointCloudPeriodicReplicates(view);
			_MoleculeViewJs.removeMoleculePeriodicReplicates(view);
			options.PBCBoolean = false;
		}
	});

	PBCFolder.add(options, 'zPBC', { '1': 1, '3': 3, '5': 5 }).onChange(function (value) {
		if (options.xPBC > 1 || options.yPBC > 1 || options.zPBC > 1) {
			if (options.showPointCloud && view.systemSpatiallyResolvedDataBoolean) {
				_PointCloud_selectionJs.changePointCloudPeriodicReplicates(view);
			}
			if (options.showMolecule && view.systemMoleculeDataBoolean) {
				_MoleculeViewJs.changeMoleculePeriodicReplicates(view);
			}
			options.PBCBoolean = true;
		} else {
			_PointCloud_selectionJs.removePointCloudPeriodicReplicates(view);
			_MoleculeViewJs.removeMoleculePeriodicReplicates(view);
			options.PBCBoolean = false;
		}
	});
	PBCFolder.close();

	if (view.systemMoleculeDataBoolean) {

		moleculeFolder.add(options, 'showAtoms').name('Show Atoms').onChange(function (value) {
			_MoleculeViewJs.changeMoleculeGeometry(view);
			if (options.PBCBoolean) {
				_MoleculeViewJs.changeMoleculePeriodicReplicates(view);
			};
		});

		moleculeFolder.add(options, 'showBonds').name('Show Bonds').onChange(function (value) {
			_MoleculeViewJs.changeMoleculeGeometry(view);
			if (options.PBCBoolean) {
				_MoleculeViewJs.changeMoleculePeriodicReplicates(view);
			};
		});

		moleculeFolder.add(options, 'atomsStyle', { "sprite": "sprite", "ball": "ball" }).name('Atom Style').onChange(function (value) {
			_MoleculeViewJs.changeMoleculeGeometry(view);
			if (options.PBCBoolean) {
				_MoleculeViewJs.changeMoleculePeriodicReplicates(view);
			};
		});

		moleculeFolder.add(options, 'bondsStyle', { "line": "line", "tube": "tube", "fatline": "fatline" }).name('Bond Style').onChange(function (value) {
			_MoleculeViewJs.changeMoleculeGeometry(view);
			if (options.PBCBoolean) {
				_MoleculeViewJs.changeMoleculePeriodicReplicates(view);
			};
		});

		moleculeFolder.add(options, 'moleculeColorCodeBasis', moleculeDataFeatureChoiceObject).name('Color Basis').onChange(function (value) {
			//adjustColorScaleAccordingToDefault(view);
			if (value == "atom") {
				_MultiviewControlColorLegendJs.removeLegendMolecule(view);
			}
			_UtilitiesScaleJs.adjustScaleAccordingToDefaultMoleculeData(view);
			_MoleculeViewJs.changeMoleculeGeometry(view);
			if (value != "atom") {
				_MultiviewControlColorLegendJs.changeLegendMolecule(view);
			}
			if (options.PBCBoolean) {
				_MoleculeViewJs.changeMoleculePeriodicReplicates(view);
			};
			gui.updateDisplay();
		});

		moleculeFolder.add(options, 'moleculeColorSettingMin', -100, 100).step(0.1).name('Color Scale Min').onChange(function (value) {
			_MoleculeViewJs.changeMoleculeGeometry(view);
			if (options.PBCBoolean) {
				_MoleculeViewJs.changeMoleculePeriodicReplicates(view);
			};
			_MultiviewControlColorLegendJs.changeLegendMolecule(view);
		});
		moleculeFolder.add(options, 'moleculeColorSettingMax', -100, 100).step(0.1).name('Color Scale Max').onChange(function (value) {
			_MoleculeViewJs.changeMoleculeGeometry(view);
			if (options.PBCBoolean) {
				_MoleculeViewJs.changeMoleculePeriodicReplicates(view);
			};
			_MultiviewControlColorLegendJs.changeLegendMolecule(view);
		});

		moleculeFolder.add(options, 'moleculeSizeCodeBasis', moleculeDataFeatureChoiceObject).name('Size Basis').onChange(function (value) {
			//adjustColorScaleAccordingToDefault(view);
			_UtilitiesScaleJs.adjustScaleAccordingToDefaultMoleculeData(view);
			_MoleculeViewJs.changeMoleculeGeometry(view);
			if (options.PBCBoolean) {
				_MoleculeViewJs.changeMoleculePeriodicReplicates(view);
			};
			gui.updateDisplay();
		});

		moleculeFolder.add(options, 'moleculeSizeSettingMin', -100, 100).step(0.1).name('Size Scale Min').onChange(function (value) {
			_MoleculeViewJs.changeMoleculeGeometry(view);
			if (options.PBCBoolean) {
				_MoleculeViewJs.changeMoleculePeriodicReplicates(view);
			};
		});
		moleculeFolder.add(options, 'moleculeSizeSettingMax', -100, 100).step(0.1).name('Size Scale Max').onChange(function (value) {
			_MoleculeViewJs.changeMoleculeGeometry(view);
			if (options.PBCBoolean) {
				_MoleculeViewJs.changeMoleculePeriodicReplicates(view);
			};
		});

		moleculeFolder.add(options, 'atomSize', 0.1, 20).step(0.1).name('Atom Size').onChange(function (value) {
			_MoleculeViewJs.changeMoleculeGeometry(view);
			_MoleculeViewJs.changeMoleculePeriodicReplicates(view);
		});
		moleculeFolder.add(options, 'bondSize', 0.1, 5).step(0.1).name('Bond Size').onChange(function (value) {
			_MoleculeViewJs.changeMoleculeGeometry(view);
			_MoleculeViewJs.changeMoleculePeriodicReplicates(view);
		});
		moleculeFolder.add(options, 'moleculeAlpha', 0.1, 1.0).step(0.1).name('Molecule Opacity').onChange(function (value) {
			_MoleculeViewJs.changeMoleculeGeometry(view);
			_MoleculeViewJs.changeMoleculePeriodicReplicates(view);
		});

		moleculeFolder.add(options, 'maxBondLength', 0.1, 5).step(0.1).name('Bond Max').onChange(function (value) {
			_MoleculeViewJs.changeMoleculeGeometry(view);
		});

		moleculeFolder.add(options, 'minBondLength', 0.1, 5).step(0.1).name('Bond Min').onChange(function (value) {
			_MoleculeViewJs.changeMoleculeGeometry(view);
		});

		moleculeFolder.close();

		var moleculeLegendFolder = moleculeFolder.addFolder('Molecule Legend');

		moleculeLegendFolder.add(options, 'legendXMolecule', -10, 10).name("Position X").step(0.1).onChange(function (value) {
			_MultiviewControlColorLegendJs.changeLegend(view);
		});
		moleculeLegendFolder.add(options, 'legendYMolecule', -10, 10).name("Position Y").step(0.1).onChange(function (value) {
			_MultiviewControlColorLegendJs.changeLegend(view);
		});
		moleculeLegendFolder.add(options, 'legendWidthMolecule', 0, 1).name("Width").step(0.1).onChange(function (value) {
			_MultiviewControlColorLegendJs.changeLegend(view);
		});
		moleculeLegendFolder.add(options, 'legendHeightMolecule', 0, 15).name("Height").step(0.1).onChange(function (value) {
			_MultiviewControlColorLegendJs.changeLegend(view);
		});
		moleculeLegendFolder.add(options, 'legendTickMolecule', 1, 15).name("Tick").step(1).onChange(function (value) {
			_MultiviewControlColorLegendJs.changeLegend(view);
		});
		moleculeLegendFolder.add(options, 'legendFontsizeMolecule', 10, 75).name("Fontsize").step(1).onChange(function (value) {
			_MultiviewControlColorLegendJs.changeLegend(view);
		});
		moleculeLegendFolder.add(options, 'toggleLegendMolecule').name("Toggle legend");
		moleculeLegendFolder.close();

		var moleculeAdditionalFolder = moleculeFolder.addFolder('Additional');

		moleculeAdditionalFolder.add(options, 'atomModelSegments', 3, 200).step(1).name('Atom Resolution').onChange(function (value) {
			_MoleculeViewJs.changeMoleculeGeometry(view);
			_MoleculeViewJs.changeMoleculePeriodicReplicates(view);
		});
		moleculeAdditionalFolder.add(options, 'bondModelSegments', 3, 200).step(1).name('Bond Resolution').onChange(function (value) {
			_MoleculeViewJs.changeMoleculeGeometry(view);
			_MoleculeViewJs.changeMoleculePeriodicReplicates(view);
		});
		moleculeAdditionalFolder.close();

		moleculeAdditionalFolder.add(options, 'cameraLightPositionX', -20000, 20000).step(50).name('Cam. Light X').onChange(function (value) {
			_MultiviewControlSetupViewBasicJs.updateCamLightPosition(view);
		});

		moleculeAdditionalFolder.add(options, 'cameraLightPositionY', -20000, 20000).step(50).name('Cam. Light Y').onChange(function (value) {
			_MultiviewControlSetupViewBasicJs.updateCamLightPosition(view);
		});

		moleculeAdditionalFolder.add(options, 'cameraLightPositionZ', -20000, 20000).step(50).name('Cam. Light Z').onChange(function (value) {
			_MultiviewControlSetupViewBasicJs.updateCamLightPosition(view);
		});
	}

	/*
 	viewFolder.add( options, 'view',{'pointCloud':'pointCloud', 'box':'box', 'pointMatrix':'pointMatrix'}).onChange( function( value ){
 		changeGeometry(options);
 		updateControlPanel(options);
 	});*/

	if (view.systemSpatiallyResolvedDataBoolean) {
		pointCloudFolder.add(options, 'propertyOfInterest', propertyChoiceObject).name('Color Basis').onChange(function (value) {
			_UtilitiesScaleJs.adjustColorScaleAccordingToDefaultSpatiallyResolvedData(view);
			_PointCloud_selectionJs.updatePointCloudGeometry(view);
			if (options.PBCBoolean) {
				_PointCloud_selectionJs.updatePointCloudPeriodicReplicates(view);
			};
			_MultiviewControlColorLegendJs.changeLegend(view);
			gui.updateDisplay();
		});

		pointCloudFolder.add(options, 'colorMap', {
			'rainbow': 'rainbow',
			'cooltowarm': 'cooltowarm',
			'blackbody': 'blackbody',
			'grayscale': 'grayscale',
			'viridis': 'viridis',
			'plasma': 'plasma',
			'inferno': 'inferno',
			'magma': 'magma',
			'Greys': 'Greys',
			'Purples': 'Purples',
			'Blues': 'Blues',
			'Greens': 'Greens',
			'Oranges': 'Oranges',
			'Reds': 'Reds',
			'YlOrBr': 'YlOrBr',
			'YlOrRd': 'YlOrRd',
			'OrRd': 'OrRd',
			'PuRd': 'PuRd',
			'RdPu': 'RdPu',
			'BuPu': 'BuPu',
			'GnBu': 'GnBu',
			'PuBu': 'PuBu',
			'YlGnBu': 'YlGnBu',
			'PuBuGn': 'PuBuGn',
			'BuGn': 'BuGn',
			'YlGn': 'YlGn',
			'binary': 'binary',
			'gist_yarg': 'gist_yarg',
			'gist_gray': 'gist_gray',
			'gray': 'gray',
			'bone': 'bone',
			'pink': 'pink',
			'spring': 'spring',
			'summer': 'summer',
			'autumn': 'autumn',
			'winter': 'winter',
			'cool': 'cool',
			'Wistia': 'Wistia',
			'hot': 'hot',
			'afmhot': 'afmhot',
			'gist_heat': 'gist_heat',
			'copper': 'copper',
			'PiYG': 'PiYG',
			'PRGn': 'PRGn',
			'BrBG': 'BrBG',
			'PuOr': 'PuOr',
			'RdGy': 'RdGy',
			'RdBu': 'RdBu',
			'RdYlBu': 'RdYlBu',
			'RdYlGn': 'RdYlGn',
			'Spectral': 'Spectral',
			'coolwarm': 'coolwarm',
			'bwr': 'bwr',
			'seismic': 'seismic',
			'hsv': 'hsv',
			'Pastel1': 'Pastel1',
			'Pastel2': 'Pastel2',
			'Paired': 'Paired',
			'Accent': 'Accent',
			'Dark2': 'Dark2',
			'Set1': 'Set1',
			'Set2': 'Set2',
			'Set3': 'Set3',
			'tab10': 'tab10',
			'tab20': 'tab20',
			'tab20b': 'tab20b',
			'tab20c': 'tab20c',
			'flag': 'flag',
			'prism': 'prism',
			'ocean': 'ocean',
			'gist_earth': 'gist_earth',
			'terrain': 'terrain',
			'gist_stern': 'gist_stern',
			'gnuplot': 'gnuplot',
			'gnuplot2': 'gnuplot2',
			'CMRmap': 'CMRmap',
			'cubehelix': 'cubehelix',
			'brg': 'brg',
			'gist_rainbow': 'gist_rainbow',
			'rainbow2': 'rainbow2',
			'jet': 'jet',
			'nipy_spectral': 'nipy_spectral',
			'gist_ncar': 'gist_ncar' }).name('Color Scheme').onChange(function (value) {
			_PointCloud_selectionJs.updatePointCloudGeometry(view);
			if (options.PBCBoolean) {
				_PointCloud_selectionJs.updatePointCloudPeriodicReplicates(view);
			};
			_MultiviewControlColorLegendJs.changeLegend(view);
		});

		pointCloudFolder.add(options, 'pointCloudParticles', 10, 10000).step(10).name('Density').onChange(function (value) {
			_PointCloud_selectionJs.changePointCloudGeometry(view);
			if (options.PBCBoolean) {
				_PointCloud_selectionJs.changePointCloudPeriodicReplicates(view);
			};
		});

		pointCloudFolder.add(options, 'pointCloudAlpha', 0, 1).step(0.01).name('Opacity').onChange(function (value) {
			_PointCloud_selectionJs.updatePointCloudGeometry(view);
			if (options.PBCBoolean) {
				_PointCloud_selectionJs.updatePointCloudPeriodicReplicates(view);
			};
		});
		pointCloudFolder.add(options, 'pointCloudSize', 0, 10).step(0.1).name('Size').onChange(function (value) {
			_PointCloud_selectionJs.updatePointCloudGeometry(view);
			if (options.PBCBoolean) {
				_PointCloud_selectionJs.updatePointCloudPeriodicReplicates(view);
			};
		});
		pointCloudFolder.add(options, 'pointCloudColorSettingMin', -1000, 1000).step(0.001).name('Color Scale Min').onChange(function (value) {
			_PointCloud_selectionJs.updatePointCloudGeometry(view);
			if (options.PBCBoolean) {
				_PointCloud_selectionJs.updatePointCloudPeriodicReplicates(view);
			};
			_MultiviewControlColorLegendJs.changeLegend(view);
		});
		pointCloudFolder.add(options, 'pointCloudColorSettingMax', -1000, 1000).step(0.001).name('Color Scale Max').onChange(function (value) {
			_PointCloud_selectionJs.updatePointCloudGeometry(view);
			if (options.PBCBoolean) {
				_PointCloud_selectionJs.updatePointCloudPeriodicReplicates(view);
			};
			_MultiviewControlColorLegendJs.changeLegend(view);
		});
		pointCloudFolder.add(options, 'pointCloudMaxPointPerBlock', 10, 200).step(10).name('Max Density').onChange(function (value) {
			_PointCloud_selectionJs.changePointCloudGeometry(view);
			if (options.PBCBoolean) {
				_PointCloud_selectionJs.changePointCloudPeriodicReplicates(view);
			};
		});
		pointCloudFolder.add(options, 'animate').onChange(function (value) {
			_PointCloud_selectionJs.updatePointCloudGeometry(view);
		});

		pointCloudFolder.close();

		var pointCloudLegendFolder = pointCloudFolder.addFolder('Point Cloud Legend');

		pointCloudLegendFolder.add(options, 'legendX', -10, 10).step(0.1).onChange(function (value) {
			_MultiviewControlColorLegendJs.changeLegend(view);
		});
		pointCloudLegendFolder.add(options, 'legendY', -10, 10).step(0.1).onChange(function (value) {
			_MultiviewControlColorLegendJs.changeLegend(view);
		});
		pointCloudLegendFolder.add(options, 'legendWidth', 0, 1).step(0.1).onChange(function (value) {
			_MultiviewControlColorLegendJs.changeLegend(view);
		});
		pointCloudLegendFolder.add(options, 'legendHeight', 0, 15).step(0.1).onChange(function (value) {
			_MultiviewControlColorLegendJs.changeLegend(view);
		});
		pointCloudLegendFolder.add(options, 'legendTick', 1, 15).step(1).onChange(function (value) {
			_MultiviewControlColorLegendJs.changeLegend(view);
		});
		pointCloudLegendFolder.add(options, 'legendFontsize', 10, 75).step(1).onChange(function (value) {
			_MultiviewControlColorLegendJs.changeLegend(view);
		});
		pointCloudLegendFolder.add(options, 'toggleLegend').name("Toggle legend");
		pointCloudLegendFolder.close();

		var pointCloudAdditionalFolder = pointCloudFolder.addFolder('Additional');

		pointCloudAdditionalFolder.add(options, 'pointCloudTotalMagnitude', -5, 4).step(1).name('Dens. Magnitude').onChange(function (value) {
			_PointCloud_selectionJs.changePointCloudGeometry(view);
			if (options.PBCBoolean) {
				_PointCloud_selectionJs.changePointCloudPeriodicReplicates(view);
			};
		});
		pointCloudAdditionalFolder.close();
	}

	sliderFolder.add(options, 'x_low', view.xPlotMin, view.xPlotMax).step(1).name('x low').onChange(function (value) {
		_PointCloud_selectionJs.updatePointCloudGeometry(view);
		//updatePlane(options);
	});
	sliderFolder.add(options, 'x_high', view.xPlotMin, view.xPlotMax).step(1).name('x high').onChange(function (value) {
		_PointCloud_selectionJs.updatePointCloudGeometry(view);
		//updatePlane(options);
	});
	sliderFolder.add(options, 'y_low', view.yPlotMin, view.yPlotMax).step(1).name('y low').onChange(function (value) {
		_PointCloud_selectionJs.updatePointCloudGeometry(view);
		//updatePlane(options);
	});
	sliderFolder.add(options, 'y_high', view.yPlotMin, view.yPlotMax).step(1).name('y high').onChange(function (value) {
		_PointCloud_selectionJs.updatePointCloudGeometry(view);
		//updatePlane(options);
	});
	sliderFolder.add(options, 'z_low', view.zPlotMin, view.zPlotMax).step(1).name('z low').onChange(function (value) {
		_PointCloud_selectionJs.updatePointCloudGeometry(view);
		//updatePlane(options);
	});
	sliderFolder.add(options, 'z_high', view.zPlotMin, view.zPlotMax).step(1).name('z high').onChange(function (value) {
		_PointCloud_selectionJs.updatePointCloudGeometry(view);
		//updatePlane(options);
	});

	sliderFolder.add(options, 'x_slider', view.xPlotMin, view.xPlotMax).step(1).onChange(function (value) {
		options.x_low = value - 1;
		options.x_high = value + 1;
		_PointCloud_selectionJs.updatePointCloudGeometry(view);
		//updatePlane(options);
		gui.updateDisplay();
	});
	sliderFolder.add(options, 'y_slider', view.yPlotMin, view.yPlotMax).step(1).onChange(function (value) {
		options.y_low = value - 1;
		options.y_high = value + 1;
		_PointCloud_selectionJs.updatePointCloudGeometry(view);
		//updatePlane(options);
		gui.updateDisplay();
	});
	sliderFolder.add(options, 'z_slider', view.zPlotMin, view.zPlotMax).step(1).onChange(function (value) {
		options.z_low = value - 1;
		options.z_high = value + 1;
		_PointCloud_selectionJs.updatePointCloudGeometry(view);
		//updatePlane(options);
		gui.updateDisplay();
	});

	detailFolder.add(options, 'cameraFov', 30, 150).step(5).name('Camera Fov').onChange(function (value) {
		_MultiviewControlSetupViewBasicJs.updateCameraFov(view);
	});

	detailFolder.add(options, 'autoRotateSpeed', 0.1, 30.0).step(0.1).name('Rotate Speed').onChange(function (value) {
		view.controller.autoRotateSpeed = value;
	});

	detailFolder.add(options, 'backgroundAlpha', 0.0, 1.0).step(0.1).name('background transparency').onChange(function (value) {
		view.backgroundAlpha = value;
	});

	detailFolder.addColor(options, 'backgroundColor').name('background').onChange(function (value) {
		view.background = new THREE.Color(value);
	});

	//sliderFolder.open();
	//console.log(gui);
}

},{"../MultiviewControl/colorLegend.js":22,"../MultiviewControl/setupViewBasic.js":26,"../Utilities/other.js":28,"../Utilities/scale.js":31,"./MoleculeView.js":13,"./PointCloud_selection.js":15}],18:[function(require,module,exports){
"use strict";

exports.__esModule = true;
exports.addSystemEdge = addSystemEdge;
exports.removeSystemEdge = removeSystemEdge;

function addSystemEdge(view) {

	var options = view.options;
	var scene = view.scene;

	var geometry = new THREE.BoxGeometry(view.xPlotMax - view.xPlotMin, view.yPlotMax - view.yPlotMin, view.zPlotMax - view.zPlotMin);

	var geo = new THREE.EdgesGeometry(geometry); // or WireframeGeometry( geometry )

	var mat = new THREE.LineBasicMaterial({ color: 0xffffff, linewidth: 2 });

	var wireframe = new THREE.LineSegments(geo, mat);

	view.systemEdge = wireframe;

	scene.add(wireframe);
}

function removeSystemEdge(view) {
	view.scene.remove(view.systemEdge);
}

},{}],19:[function(require,module,exports){
'use strict';

exports.__esModule = true;
exports.initialize3DViewTooltip = initialize3DViewTooltip;
exports.update3DViewTooltip = update3DViewTooltip;

function initialize3DViewTooltip(view) {
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
	tempTooltip.style.opacity = 0.5;
	tempTooltip.style.color = "white";
	tempTooltip.style.top = 0 + 'px';
	tempTooltip.style.left = 0 + 'px';
	view.tooltip = tempTooltip;
	document.body.appendChild(tempTooltip);
}

function update3DViewTooltip(view) {

	var mouse = new THREE.Vector2();
	mouse.set((event.clientX - view.windowLeft) / view.windowWidth * 2 - 1, -((event.clientY - view.windowTop) / view.windowHeight) * 2 + 1);

	view.raycaster.setFromCamera(mouse.clone(), view.camera);
	var intersects = view.raycaster.intersectObjects(view.molecule.atoms);
	//console.log(intersects);
	if (intersects.length > 0) {
		//console.log("found intersect")

		view.tooltip.style.top = event.clientY + 5 + 'px';
		view.tooltip.style.left = event.clientX + 5 + 'px';

		var data = view.systemMoleculeData[intersects[0].object.dataIndex];

		var tempDisplayedInfo = "x: " + data.x + "<br>" + "y: " + data.y + "<br>" + "z: " + data.z + "<br>";
		for (var property in data) {
			if (data.hasOwnProperty(property)) {
				if (property != "xPlot" && property != "yPlot" && property != "zPlot" && property != "x" && property != "y" && property != "z" && property != "selected") {
					tempDisplayedInfo += property + ": " + data[property] + "<br>";
				}
			}
		}

		view.tooltip.innerHTML = tempDisplayedInfo;

		if (view.INTERSECTED != intersects[0]) {

			if (view.INTERSECTED != null) {
				view.INTERSECTED.scale.set(view.INTERSECTED.scale.x / 1.3, view.INTERSECTED.scale.y / 1.3, view.INTERSECTED.scale.z / 1.3);
			}

			view.INTERSECTED = intersects[0].object;
			view.INTERSECTED.scale.set(view.INTERSECTED.scale.x * 1.3, view.INTERSECTED.scale.y * 1.3, view.INTERSECTED.scale.z * 1.3);
		}
	} else {
		view.tooltip.innerHTML = '';

		if (view.INTERSECTED != null) {
			view.INTERSECTED.scale.set(view.INTERSECTED.scale.x / 1.3, view.INTERSECTED.scale.y / 1.3, view.INTERSECTED.scale.z / 1.3);
		}
		view.INTERSECTED = null;
	}
}

/*
export function update3DViewTooltip(view){

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
		var tempDisplayedInfo = 	"x: " + data.x + "<br>" + 
									"y: " + data.y + "<br>" +
									"z: " + data.z + "<br>";
		for (var property in data ) {
			if (data.hasOwnProperty(property)) {
				if (property != "xPlot" && property != "yPlot" && property != "zPlot" && property != "x" && property != "y" && property != "z" && property != "selected"){
					tempDisplayedInfo += property + ": " + data[property] + "<br>";
				}
			}
		}

		view.tooltip.innerHTML = 	tempDisplayedInfo;

		if ( view.INTERSECTED != intersects[ 0 ].index ) {
			if (view.INTERSECTED != null){
				view.System.geometry.attributes.size.array[ view.INTERSECTED ] = view.options.pointCloudSize;
				view.System.geometry.attributes.size.needsUpdate = true;
			}
			view.INTERSECTED = intersects[ 0 ].index;
			view.System.geometry.attributes.size.array[ view.INTERSECTED ] = 2 * view.options.pointCloudSize;
			view.System.geometry.attributes.size.needsUpdate = true;
		}

	}
	else {	view.tooltip.innerHTML = '';
			if (view.INTERSECTED != null){
				view.System.geometry.attributes.size.array[ view.INTERSECTED ] = view.options.pointCloudSize;
				view.System.geometry.attributes.size.needsUpdate = true;
			}
			view.INTERSECTED = null;
	}
}*/

},{}],20:[function(require,module,exports){
'use strict';

exports.__esModule = true;
exports.setupHUD = setupHUD;

function setupHUD(view) {
	var tempSceneHUD = new THREE.Scene();
	var tempCameraHUD = new THREE.OrthographicCamera(-10, 10, 10, -10, -10, 10);
	view.sceneHUD = tempSceneHUD;
	view.cameraHUD = tempCameraHUD;

	var lineGeometry = new THREE.Geometry();
	/*lineGeometry.vertices.push(	new THREE.Vector3(-10, -10, 0),
 							new THREE.Vector3(10, -10, 0),
 							new THREE.Vector3(10, 10, 0),
 							new THREE.Vector3(-10, 10, 0),
 							new THREE.Vector3(-10, -10, 0));*/
	lineGeometry.vertices.push(new THREE.Vector3(-9.999, -9.999, 0), new THREE.Vector3(9.999, -9.999, 0), new THREE.Vector3(9.999, 9.999, 0), new THREE.Vector3(-9.999, 9.999, 0), new THREE.Vector3(-9.999, -9.999, 0));
	var border = new THREE.Line(lineGeometry, new THREE.LineBasicMaterial({
		color: 0x000000
	}));
	//sceneHUD.add(line);
	border.name = 'border';
	tempSceneHUD.add(border);
	view.border = border;
}

},{}],21:[function(require,module,exports){
"use strict";

exports.__esModule = true;
exports.calculateViewportSizes = calculateViewportSizes;
exports.fullscreenOneView = fullscreenOneView;
exports.deFullscreen = deFullscreen;

var _optionBoxControlJs = require("./optionBoxControl.js");

var _DHeatmapsUtilitiesJs = require("../2DHeatmaps/Utilities.js");

function calculateViewportSizes(views) {
	var twoDViewCount = 0.0,
	    threeDViewCount = 0.0;

	var threeDViewHeight, threeDViewWidth;
	var twoDViewHeight, twoDViewWidth;
	for (var ii = 0; ii < views.length; ++ii) {
		var view = views[ii];
		if (view.viewType == '2DHeatmap') {
			twoDViewCount += 1.0;
		}
		if (view.viewType == '3DView') {
			threeDViewCount += 1.0;
		}
	}

	if (twoDViewCount == 0) {
		threeDViewWidth = 1.0;twoDViewWidth = 0.0;
	} else {
		threeDViewWidth = 0.6;twoDViewWidth = 0.4;
	}

	if (twoDViewCount != 0) {
		twoDViewHeight = 1.0 / twoDViewCount;
	}
	if (threeDViewCount != 0) {
		threeDViewHeight = 1.0 / threeDViewCount;
	}

	var twoDViewTopCounter = 0.0,
	    threeDViewTopCounter = 0.0;

	for (var ii = 0; ii < views.length; ++ii) {
		var view = views[ii];
		if (view.viewType == '2DHeatmap') {
			view.left = threeDViewWidth;
			view.top = twoDViewTopCounter;
			view.height = twoDViewHeight;
			view.width = twoDViewWidth;

			twoDViewTopCounter += twoDViewHeight;
		}
		if (view.viewType == '3DView') {
			view.left = 0.0;
			view.top = threeDViewTopCounter;
			view.height = threeDViewHeight;
			view.width = threeDViewWidth;

			threeDViewTopCounter += threeDViewHeight;
		}
	}
}

function fullscreenOneView(views, view) {
	for (var ii = 0; ii < views.length; ++ii) {
		var tempView = views[ii];

		tempView.left = 0.0;
		tempView.top = 0.0;
		tempView.height = 0.0;
		tempView.width = 0.0;

		//tempView.guiContainer.style.display = "none";
		tempView.guiContainer.style.visibility = "hidden";
		/*if (tempView.viewType == '2DHeatmap') {
  	tempView.title.style.visibility = "hidden";
  }*/
	}

	view.left = 0.0;
	view.top = 0.0;
	view.height = 1.0;
	view.width = 1.0;

	view.guiContainer.style.visibility = "visible";
	/*if (view.viewType == '2DHeatmap') {
 	view.title.style.visibility = "visible";
 }*/

	_optionBoxControlJs.updateOptionBoxLocation(views);
	_DHeatmapsUtilitiesJs.update2DHeatmapTitlesLocation(views);
}

function deFullscreen(views) {
	var twoDViewCount = 0.0,
	    threeDViewCount = 0.0;

	var threeDViewHeight, threeDViewWidth;
	var twoDViewHeight, twoDViewWidth;
	for (var ii = 0; ii < views.length; ++ii) {
		var view = views[ii];
		if (view.viewType == '2DHeatmap') {
			twoDViewCount += 1.0;
		}
		if (view.viewType == '3DView') {
			threeDViewCount += 1.0;
		}
	}

	if (twoDViewCount == 0) {
		threeDViewWidth = 1.0;twoDViewWidth = 0.0;
	} else {
		threeDViewWidth = 0.6;twoDViewWidth = 0.4;
	}

	if (twoDViewCount != 0) {
		twoDViewHeight = 1.0 / twoDViewCount;
	}
	if (threeDViewCount != 0) {
		threeDViewHeight = 1.0 / threeDViewCount;
	}

	var twoDViewTopCounter = 0.0,
	    threeDViewTopCounter = 0.0;

	for (var ii = 0; ii < views.length; ++ii) {
		var view = views[ii];
		view.guiContainer.style.visibility = "visible";
		if (view.viewType == '2DHeatmap') {
			view.left = threeDViewWidth;
			view.top = twoDViewTopCounter;
			view.height = twoDViewHeight;
			view.width = twoDViewWidth;

			twoDViewTopCounter += twoDViewHeight;

			view.title.style.visibility = "visible";
		}
		if (view.viewType == '3DView') {
			view.left = 0.0;
			view.top = threeDViewTopCounter;
			view.height = threeDViewHeight;
			view.width = threeDViewWidth;

			threeDViewTopCounter += threeDViewHeight;
		}
	}

	_optionBoxControlJs.updateOptionBoxLocation(views);
	_DHeatmapsUtilitiesJs.update2DHeatmapTitlesLocation(views);
}

},{"../2DHeatmaps/Utilities.js":5,"./optionBoxControl.js":25}],22:[function(require,module,exports){
'use strict';

exports.__esModule = true;
exports.insertLegend = insertLegend;
exports.removeLegend = removeLegend;
exports.changeLegend = changeLegend;
exports.insertLegendMolecule = insertLegendMolecule;
exports.removeLegendMolecule = removeLegendMolecule;
exports.changeLegendMolecule = changeLegendMolecule;

function insertLegend(view) {
	var lut = view.lut;
	var options = view.options;
	var legend = lut.setLegendOn({ 'position': { 'x': options.legendX, 'y': options.legendY, 'z': 0 }, 'dimensions': { 'width': options.legendWidth, 'height': options.legendHeight } });
	view.sceneHUD.add(legend);
	view.legend = legend;
	var labels = lut.setLegendLabels({ /*'title': title,*/'ticks': options.legendTick, 'fontsize': options.legendFontsize });

	//view.sceneHUD.add ( labels['title'] );

	for (var i = 0; i < options.legendTick; i++) {
		view.sceneHUD.add(labels['ticks'][i]);
		view.sceneHUD.add(labels['lines'][i]);
	}
}

function removeLegend(view) {
	var sceneHUD = view.sceneHUD;
	var elementsInTheScene = sceneHUD.children.length;

	for (var i = elementsInTheScene - 1; i > 0; i--) {

		if (sceneHUD.children[i].name != 'camera' && sceneHUD.children[i].name != 'ambientLight' && sceneHUD.children[i].name != 'border' && sceneHUD.children[i].name != 'directionalLight') {

			//console.log(sceneHUD.children [ i ].name);
			sceneHUD.remove(sceneHUD.children[i]);
		}
	}
}

function changeLegend(view) {
	removeLegend(view);
	insertLegend(view);
}

function insertLegendMolecule(view) {
	var lut = view.moleculeLut;
	var options = view.options;
	var legend = lut.setLegendOn({ 'position': { 'x': options.legendXMolecule, 'y': options.legendYMolecule, 'z': 0 }, 'dimensions': { 'width': options.legendWidthMolecule, 'height': options.legendHeightMolecule } });
	view.sceneHUD.add(legend);
	view.legendMolecule = legend;
	var labels = lut.setLegendLabels({ /*'title': title,*/'ticks': options.legendTickMolecule, 'fontsize': options.legendFontsizeMolecule });

	//view.sceneHUD.add ( labels['title'] );

	for (var i = 0; i < options.legendTickMolecule; i++) {
		view.sceneHUD.add(labels['ticks'][i]);
		view.sceneHUD.add(labels['lines'][i]);
	}
}

function removeLegendMolecule(view) {
	var sceneHUD = view.sceneHUD;
	var elementsInTheScene = sceneHUD.children.length;

	for (var i = elementsInTheScene - 1; i > 0; i--) {

		if (sceneHUD.children[i].name != 'camera' && sceneHUD.children[i].name != 'ambientLight' && sceneHUD.children[i].name != 'border' && sceneHUD.children[i].name != 'directionalLight') {

			//console.log(sceneHUD.children [ i ].name);
			sceneHUD.remove(sceneHUD.children[i]);
		}
	}
}

function changeLegendMolecule(view) {
	removeLegendMolecule(view);
	insertLegendMolecule(view);
	//if (view.options.moleculeColorCodeBasis != "atom"){insertLegendMolecule(view);}
}

},{}],23:[function(require,module,exports){
"use strict";

exports.__esModule = true;
exports.updateController = updateController;

function updateController(views, windowWidth, windowHeight, mouseX, mouseY) {
	for (var ii = 0; ii < views.length; ++ii) {
		var view = views[ii];
		var left = Math.floor(windowWidth * view.left);
		var top = Math.floor(windowHeight * view.top);
		var right = Math.floor(windowWidth * view.width) + left;
		var bottom = Math.floor(windowHeight * view.height) + top;

		// console.log(left, right, top, bottom)
		if (mouseX > left && mouseX < right && windowHeight - mouseY > top && windowHeight - mouseY < bottom) {
			enableController(view, view.controller);
		} else {
			disableController(view, view.controller);
		}
	}
}

function enableController(view, controller) {
	// console.log('activating')
	view.controllerEnabled = true;
	controller.enableZoom = view.controllerZoom;
	controller.enablePan = view.controllerPan;
	controller.enableRotate = view.controllerRotate;

	/*controller.noZoom = false;
 controller.noPan  = false;
 controller.staticMoving = true;*/
	view.border.material.color = new THREE.Color(0xffffff);
	view.border.material.needsUpdate = true;
}
function disableController(view, controller) {
	view.controllerEnabled = false;
	controller.enableZoom = false;
	controller.enablePan = false;
	controller.enableRotate = false;

	/*controller.noZoom = true;
 controller.noPan  = true;
 controller.staticMoving = false;*/
	view.border.material.color = new THREE.Color(0x000000);
	view.border.material.needsUpdate = true;
}

},{}],24:[function(require,module,exports){
"use strict";

exports.__esModule = true;
exports.initializeViewSetups = initializeViewSetups;

var _MultiviewControlCalculateViewportSizesJs = require("../MultiviewControl/calculateViewportSizes.js");

var _DHeatmapsInitialize2DHeatmapSetupJs = require("../2DHeatmaps/initialize2DHeatmapSetup.js");

var _DViewsInitialize3DViewSetupJs = require("../3DViews/initialize3DViewSetup.js");

function initializeViewSetups(views, plotSetup) {
	for (var ii = 0; ii < views.length; ++ii) {
		var view = views[ii];
		if (view.viewType == '2DHeatmap') {
			_DHeatmapsInitialize2DHeatmapSetupJs.initialize2DHeatmapSetup(view, views, plotSetup);
		}
		if (view.viewType == '3DView') {
			_DViewsInitialize3DViewSetupJs.initialize3DViewSetup(view, views, plotSetup);
		}
	}

	_MultiviewControlCalculateViewportSizesJs.calculateViewportSizes(views);
}

},{"../2DHeatmaps/initialize2DHeatmapSetup.js":8,"../3DViews/initialize3DViewSetup.js":16,"../MultiviewControl/calculateViewportSizes.js":21}],25:[function(require,module,exports){
'use strict';

exports.__esModule = true;
exports.addOptionBox = addOptionBox;
exports.updateOptionBoxLocation = updateOptionBoxLocation;
exports.showHideAllOptionBoxes = showHideAllOptionBoxes;

function addOptionBox(view) {
	var tempGuiContainer = document.createElement('div');

	tempGuiContainer.style.position = 'absolute';
	tempGuiContainer.style.top = view.windowTop + 1 + 'px';
	tempGuiContainer.style.left = view.windowLeft + 1 + 'px';
	document.body.appendChild(tempGuiContainer);
	var tempGui = new dat.GUI({ autoPlace: false });
	view.guiContainer = tempGuiContainer;
	view.gui = tempGui;

	tempGuiContainer.appendChild(tempGui.domElement);
}

function updateOptionBoxLocation(views) {
	setTimeout(function () {
		for (var ii = 0; ii < views.length; ++ii) {
			var view = views[ii];
			view.guiContainer.style.top = view.windowTop + 1 + 'px';
			view.guiContainer.style.left = view.windowLeft + 1 + 'px';
		}
	}, 30);
}

function hideAllOptionBoxes(views) {
	for (var ii = 0; ii < views.length; ++ii) {
		var view = views[ii];
		view.guiContainer.style.visibility = "hidden";
	}
}

function showAllOptionBoxes(views) {
	for (var ii = 0; ii < views.length; ++ii) {
		var view = views[ii];
		view.guiContainer.style.visibility = "visible";
	}
}

function showHideAllOptionBoxes(views, boxShowBool) {
	if (boxShowBool) {
		hideAllOptionBoxes(views);
	} else {
		showAllOptionBoxes(views);
	}
}

},{}],26:[function(require,module,exports){
"use strict";

exports.__esModule = true;
exports.setupViewCameraSceneController = setupViewCameraSceneController;
exports.updateCamLightPosition = updateCamLightPosition;
exports.updateCameraFov = updateCameraFov;

function setupViewCameraSceneController(view, renderer) {

	var camera = new THREE.PerspectiveCamera(view.options.cameraFov, window.innerWidth / window.innerHeight, 1, 100000);
	camera.position.fromArray(view.eye);

	view.camera = camera;

	var dirLight = new THREE.DirectionalLight(0xffffff, 1);

	dirLight.castShadow = true;
	dirLight.shadowDarkness = 1.0;
	dirLight.shadowCameraVisible = true;
	dirLight.position.set(0, 0, 0);
	view.camLight = dirLight;
	view.camera.add(dirLight);

	/*var dirLightHeper = new THREE.DirectionalLightHelper(dirLight, 10);
 view.scene.add(dirLightHeper);*/

	/*var hemiLight = new THREE.HemisphereLight(0xffffff, 0xffffff, 0.6);
 hemiLight.position.set(0, 10000, 0);
 view.scene.add(hemiLight);
 
 var hemiLightHelper = new THREE.HemisphereLightHelper(hemiLight, 10);
 view.scene.add(hemiLightHelper);*/

	/*var tempController = new THREE.OrbitControls( camera, renderer.domElement );
 tempController.minAzimuthAngle = - Infinity; // radians
 tempController.maxAzimuthAngle = Infinity; // radians
 tempController.minPolarAngle = - 2* Math.PI; // radians
 tempController.maxPolarAngle = 2* Math.PI; // radians*/
	var tempController = new THREE.TrackballControls(camera, renderer.domElement);
	tempController.rotateSpeed = 20.0;
	/*tempController.zoomSpeed = 10.2;
 tempController.panSpeed = 10.8;
 tempController.noZoom = false;
 tempController.noPan = false;
 tempController.staticMoving = true;*/
	view.controller = tempController;
	var tempScene = new THREE.Scene();

	view.scene = tempScene;
	view.scene.add(view.camera);

	var left = Math.floor(window.innerWidth * view.left);
	var top = Math.floor(window.innerHeight * view.top);
	var width = Math.floor(window.innerWidth * view.width);
	var height = Math.floor(window.innerHeight * view.height);

	view.windowLeft = left;
	view.windowTop = top;
	view.windowWidth = width;
	view.windowHeight = height;
}

function updateCamLightPosition(view) {
	view.camLight.position.set(view.options.cameraLightPositionX, view.options.cameraLightPositionY, view.options.cameraLightPositionZ);
}

function updateCameraFov(view) {
	view.camera.fov = view.options.cameraFov;
	view.camera.updateProjectionMatrix();
}

},{}],27:[function(require,module,exports){
"use strict";

exports.__esModule = true;
exports.arrangeMoleculeDataToFrame = arrangeMoleculeDataToFrame;
exports.arrangeMoleculeDataToFrame2 = arrangeMoleculeDataToFrame2;

function arrangeMoleculeDataToFrame(view) {
	var moleculeDataFramed = view.systemMoleculeDataFramed;
	view.systemMoleculeDataFramedBondsDict = {};

	for (var frame in moleculeDataFramed) {

		if (moleculeDataFramed.hasOwnProperty(frame)) {
			var moleculeData = moleculeDataFramed[frame];
			view.systemMoleculeDataFramedBondsDict[frame] = [];

			for (var i = 0; i < moleculeData.length; i++) {
				var tempNeighborObject = {};
				tempNeighborObject.neighborsList = [];
				tempNeighborObject.distancesList = [];
				tempNeighborObject.coordinatesList = [];
				var coordinates1 = new THREE.Vector3(moleculeData[i].x, moleculeData[i].y, moleculeData[i].z);
				var point1 = new THREE.Vector3(moleculeData[i].xPlot, moleculeData[i].yPlot, moleculeData[i].zPlot);

				for (var j = 0; j < moleculeData.length; j++) {
					if (i != j) {
						var coordinates2 = new THREE.Vector3(moleculeData[j].x, moleculeData[j].y, moleculeData[j].z);
						var point2 = new THREE.Vector3(moleculeData[j].xPlot, moleculeData[j].yPlot, moleculeData[j].zPlot);
						var bondlength = new THREE.Vector3().subVectors(coordinates2, coordinates1).length();
						var midPoint = new THREE.Vector3().addVectors(point2, point1).divideScalar(2);
						if (bondlength < 2) {
							tempNeighborObject.neighborsList.push(moleculeData[j]);
							tempNeighborObject.distancesList.push(bondlength);
							tempNeighborObject.coordinatesList.push(midPoint);
						}
					}
				}

				view.systemMoleculeDataFramedBondsDict[frame].push(tempNeighborObject);
			}
			// Do things here
		}
	}

	//console.log(view.systemMoleculeDataFramedBondsDict)
}

function arrangeMoleculeDataToFrame2(view) {
	var moleculeDataFramed = view.systemMoleculeDataFramed;
	view.systemMoleculeDataFramedBondsDict = {};

	for (var frame in moleculeDataFramed) {

		console.log("arrange frame: ", frame);

		if (moleculeDataFramed.hasOwnProperty(frame)) {
			var moleculeData = moleculeDataFramed[frame];
			view.systemMoleculeDataFramedBondsDict[frame] = [];

			var pointsList = [];

			//var t0 = performance.now();

			//construct tree
			for (var i = 0; i < moleculeData.length; i++) {
				pointsList.push(moleculeData[i]);
			}

			//var t1 = performance.now();
			//console.log("arrange pointlist took " + (t1 - t0) + " milliseconds.");

			var tree = new kdTree(pointsList, euclideanDistnace, ["x", "y", "z"]);

			//var t1 = performance.now();
			//console.log("construct tree took " + (t1 - t0) + " milliseconds.");

			for (var i = 0; i < moleculeData.length; i++) {
				var tempNeighborObject = {};
				tempNeighborObject.neighborsList = [];
				tempNeighborObject.distancesList = [];
				tempNeighborObject.coordinatesList = [];
				//var coordinates1 =  {"x":moleculeData[i].x, "y": moleculeData[i].y, "z":moleculeData[i].z};
				var point1 = new THREE.Vector3(moleculeData[i].xPlot, moleculeData[i].yPlot, moleculeData[i].zPlot);

				var nearest = tree.nearest(moleculeData[i], 6, 6);

				for (var j = 0; j < nearest.length; j++) {
					var neighbor = nearest[j][0];
					var distance = nearest[j][1];

					if (distance > 0) {
						var point2 = new THREE.Vector3(neighbor.xPlot, neighbor.yPlot, neighbor.zPlot);
						var bondlength = Math.sqrt(distance);
						var midPoint = new THREE.Vector3().addVectors(point2, point1).divideScalar(2);
						tempNeighborObject.neighborsList.push(neighbor);
						tempNeighborObject.distancesList.push(bondlength);
						tempNeighborObject.coordinatesList.push(midPoint);
					}
				}

				view.systemMoleculeDataFramedBondsDict[frame].push(tempNeighborObject);
			}
			//var t1 = performance.now();
			//console.log("query took " + (t1 - t0) + " milliseconds.");
		}
		console.log("end frame: ", frame);
	}
}

function euclideanDistnace(a, b) {
	return Math.pow(a.x - b.x, 2) + Math.pow(a.y - b.y, 2) + Math.pow(a.z - b.z, 2);
}

},{}],28:[function(require,module,exports){
"use strict";

exports.__esModule = true;
exports.arrayToIdenticalObject = arrayToIdenticalObject;
exports.hexToRgb = hexToRgb;
exports.getHexColor = getHexColor;
exports.colorToRgb = colorToRgb;
exports.rgbToHex = rgbToHex;
exports.makeTextSprite2 = makeTextSprite2;
exports.makeTextSprite = makeTextSprite;

function arrayToIdenticalObject(array) {
        var result = {};
        for (var i = 0; i < array.length; i++) {
                result[array[i]] = array[i];
        }
        return result;
}

function hexToRgb(hex) {
        var result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
        return result ? {
                r: parseInt(result[1], 16),
                g: parseInt(result[2], 16),
                b: parseInt(result[3], 16)
        } : null;
}

function getHexColor(number) {
        return "#" + (number >>> 0).toString(16).slice(-6);
}

function colorToRgb(color) {
        var hex = getHexColor(color);
        var result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
        return result ? {
                r: parseInt(result[1], 16) / 255,
                g: parseInt(result[2], 16) / 255,
                b: parseInt(result[3], 16) / 255
        } : null;
}

function componentToHex(c) {
        var hex = c.toString(16);
        return hex.length == 1 ? "0" + hex : hex;
}

function rgbToHex(color) {
        return "#" + componentToHex(color.r) + componentToHex(color.g) + componentToHex(color.b);
}

function expo(x, f) {
        return Number.parseFloat(x).toExponential(f);
}

function makeTextSprite2(message, parameters) {
        /*let sprite = new THREE.TextSprite({
          textSize: 32,
          redrawInterval: 250,
          texture: {
            text: message,
            fontFamily: 'Arial, Helvetica, sans-serif',
            strokeStyle: 'white'
          },
          material: {
            color: 'white',
            fog: true,
          },
        });
        return sprite
        let texture = new THREE.TextTexture({
          fontFamily: 'Arial, Helvetica, sans-serif',
          fontSize: 32,
          text: message,
        });
        let material = new THREE.SpriteMaterial({
          color: 0xffffbb,
          map: texture,
        });
        let sprite = new THREE.Sprite(material);
        return sprite*/

        /*let sprite = new THREE.TextSprite({
          textSize: 32,
          redrawInterval: 250,
          texture: {
            text: message,
            fontsize: 800,
            fontFamily: 'Arial, Helvetica, sans-serif',
            strokeStyle: 'white'
          },
          material: {
            color: 'white',
            fog: true,
          },
        });
        return sprite*/

        var sprite = new SpriteText(expo(message, 2));
        return sprite;
}

function makeTextSprite(message, parameters) {

        if (parameters === undefined) parameters = {};

        var fontface = parameters.hasOwnProperty("fontface") ? parameters["fontface"] : "Arial";

        var fontsize = parameters.hasOwnProperty("fontsize") ? parameters["fontsize"] : 18;

        var borderThickness = parameters.hasOwnProperty("borderThickness") ? parameters["borderThickness"] : 4;

        var borderColor = parameters.hasOwnProperty("borderColor") ? parameters["borderColor"] : { r: 0, g: 0, b: 0, a: 1.0 };

        var backgroundColor = parameters.hasOwnProperty("backgroundColor") ? parameters["backgroundColor"] : { r: 255, g: 255, b: 255, a: 1.0 };

        //var spriteAlignment = THREE.SpriteAlignment.topLeft;

        //var canvas = document.createElement('canvas');
        //var context = canvas.getContext('2d');
        var canvas = document.createElement('canvas');
        var context = canvas.getContext('2d');
        var contextWidth = context.canvas.clientWidth;
        var contextHeight = context.canvas.clientHeight;
        console.log("canvas: " + canvas.width + ", " + canvas.height);
        console.log("context: " + contextWidth + ", " + contextHeight);
        canvas.height = fontsize * 2;
        canvas.width = fontsize * 2;
        /*console.log("canvas: " + canvas.width + ", " + canvas.height );
        console.log("context: " + contextWidth + ", " + contextHeight );*/
        context.font = "Bold " + fontsize + "px " + fontface;

        // get size data (height depends only on font size)
        var metrics = context.measureText(message);
        var textWidth = metrics.width;

        // background color
        context.fillStyle = "rgba(" + backgroundColor.r + "," + backgroundColor.g + "," + backgroundColor.b + "," + backgroundColor.a + ")";
        // border color
        context.strokeStyle = "rgba(" + borderColor.r + "," + borderColor.g + "," + borderColor.b + "," + borderColor.a + ")";

        context.lineWidth = borderThickness;
        roundRect(context, borderThickness / 2, borderThickness / 2, textWidth + borderThickness, fontsize * 1.4 + borderThickness, 6);
        // 1.4 is extra height factor for text below baseline: g,j,p,q.

        // text color
        context.fillStyle = "rgba(0, 0, 0, 1.0)";

        context.fillText(message, borderThickness, fontsize + borderThickness);
        //context.fillText( message, (contextWidth - textWidth) / 2, (contextHeight - textHeight) / 2);

        // canvas contents will be used for a texture
        var texture = new THREE.Texture(canvas);
        texture.needsUpdate = true;

        //var spriteMaterial = new THREE.SpriteMaterial({ map: texture, useScreenCoordinates: false, alignment: spriteAlignment });
        var spriteMaterial = new THREE.SpriteMaterial({ map: texture });
        var sprite = new THREE.Sprite(spriteMaterial);
        //sprite.scale.set(10,5,1.0);
        sprite.scale.set(textWidth, fontsize, 1.0);
        sprite.position.normalize();
        return sprite;

        /*if ( parameters === undefined ) parameters = {};
        
            var fontface = parameters.hasOwnProperty("fontface") ?
                  parameters["fontface"] : "Arial";
        
            var fontsize = parameters.hasOwnProperty("fontsize") ?
                  parameters["fontsize"] : 18;
        
            var borderThickness = parameters.hasOwnProperty("borderThickness") ?
                  parameters["borderThickness"] : 4;
        
            var borderColor = parameters.hasOwnProperty("borderColor") ?
                  parameters["borderColor"] : { r:0, g:0, b:0, a:1.0 };
        
            var fillColor = parameters.hasOwnProperty("fillColor") ?
                  parameters["fillColor"] : undefined;
        
            var textColor = parameters.hasOwnProperty("textColor") ?
                  parameters["textColor"] : { r:0, g:0, b:255, a:1.0 };
        
            var radius = parameters.hasOwnProperty("radius") ?
                          parameters["radius"] : 6;
        
            var vAlign = parameters.hasOwnProperty("vAlign") ?
                                  parameters["vAlign"] : "center";
        
            var hAlign = parameters.hasOwnProperty("hAlign") ?
                                  parameters["hAlign"] : "center";
        
            var canvas = document.createElement('canvas');
              var context = canvas.getContext('2d');
        
            // set a large-enough fixed-size canvas.  Both dimensions should be powers of 2.
            canvas.width  = 2048;
            canvas.height = 1024;
              context.font = fontsize + "px " + fontface;
            context.textBaseline = "alphabetic";
            context.textAlign = "left";
              // get size data (height depends only on font size)
            var metrics = context.measureText( message );
            var textWidth = metrics.width;
                // find the center of the canvas and the half of the font width and height
            // we do it this way because the sprite's position is the CENTER of the sprite
            var cx = canvas.width / 2;
            var cy = canvas.height / 2;
            var tx = textWidth/ 2.0;
            var ty = fontsize / 2.0;
        
            // then adjust for the justification
              if ( vAlign === "bottom")
                ty = 0;
              else if (vAlign === "top")
                ty = fontsize;
              if (hAlign === "left")
                tx = 0;
              else if (hAlign === "right")
                tx = textWidth;
        
            // the DESCENDER_ADJUST is extra height factor for text below baseline: g,j,p,q. since we don't know the true bbox
            roundRect(context, cx - tx , cy + ty + 0.28 * fontsize,
                    textWidth, fontsize, radius, borderThickness, borderColor, fillColor);
                // text color.  Note that we have to do this AFTER the round-rect as it also uses the "fillstyle" of the canvas
              context.fillStyle = getCanvasColor(textColor);
            context.fillText( message, cx - tx, cy + ty);
              // draw some visual references - debug only
            drawCrossHairs( context, cx, cy );
            // outlineCanvas(context, canvas);
            //addSphere(x,y,z);
                // canvas contents will be used for a texture
            var texture = new THREE.Texture(canvas);
            texture.needsUpdate = true;
              var spriteMaterial = new THREE.SpriteMaterial( { map: texture } );
            var sprite = new THREE.Sprite( spriteMaterial );
              // we MUST set the scale to 2:1.  The canvas is already at a 2:1 scale,
            // but the sprite itself is square: 1.0 by 1.0
            // Note also that the size of the scale factors controls the actual size of the text-label
            sprite.scale.set(4,2,1);
              return sprite;*/
}

// function for drawing rounded rectangles
function roundRect(ctx, x, y, w, h, r) {
        ctx.beginPath();
        ctx.moveTo(x + r, y);
        ctx.lineTo(x + w - r, y);
        ctx.quadraticCurveTo(x + w, y, x + w, y + r);
        ctx.lineTo(x + w, y + h - r);
        ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
        ctx.lineTo(x + r, y + h);
        ctx.quadraticCurveTo(x, y + h, x, y + h - r);
        ctx.lineTo(x, y + r);
        ctx.quadraticCurveTo(x, y, x + r, y);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();
}

function drawCrossHairs(context, cx, cy) {

        context.strokeStyle = "rgba(0,255,0,1)";
        context.lineWidth = 2;
        context.beginPath();
        context.moveTo(cx - 150, cy);
        context.lineTo(cx + 150, cy);
        context.stroke();

        context.strokeStyle = "rgba(0,255,0,1)";
        context.lineWidth = 2;
        context.beginPath();
        context.moveTo(cx, cy - 150);
        context.lineTo(cx, cy + 150);
        context.stroke();
        context.strokeStyle = "rgba(0,255,0,1)";
        context.lineWidth = 2;
        context.beginPath();
        context.moveTo(cx - 150, cy);
        context.lineTo(cx + 150, cy);
        context.stroke();

        context.strokeStyle = "rgba(0,255,0,1)";
        context.lineWidth = 2;
        context.beginPath();
        context.moveTo(cx, cy - 150);
        context.lineTo(cx, cy + 150);
        context.stroke();
}

function getCanvasColor(color) {

        return "rgba(" + color.r + "," + color.g + "," + color.b + "," + color.a + ")";
}

},{}],29:[function(require,module,exports){
"use strict";

exports.__esModule = true;
exports.readCSV = readCSV;
exports.processSpatiallyResolvedData = processSpatiallyResolvedData;
exports.processMoleculeData = processMoleculeData;
exports.readCSVSpatiallyResolvedData = readCSVSpatiallyResolvedData;
exports.readCSVMoleculeData = readCSVMoleculeData;

var _MultiviewControlInitializeViewSetupsJs = require("../MultiviewControl/initializeViewSetups.js");

function readCSV(view, plotData, callback) {

	var filename = view.dataFilename;
	view.data = [];
	d3.csv(filename, function (d) {
		d.forEach(function (d, i) {
			var n = +d.rho;

			if (n > 1e-3) {
				var temp = {
					x: +d.x,
					y: +d.y,
					z: +d.z,
					n: +d.rho,
					gamma: +d.gamma,
					epxc: +d.epxc,
					ad0p2: +d.ad0p2,
					deriv1: +d.deriv1,
					deriv2: +d.deriv2,
					selected: true
				};

				view.data.push(temp);
				plotData.push(temp);
			}
		});
		//number = number + view.data.length;
		//console.log(number);
		//console.log(view.data);
		callback(null);
	});
}

function processSpatiallyResolvedData(view, overallSpatiallyResolvedData, plotSetup, callback) {
	view.systemSpatiallyResolvedData = [];
	console.log('started processing data');
	if (view.frameBool && !plotSetup.spatiallyResolvedPropertyList.includes(plotSetup.frameProperty)) {
		alert("The frame property Not in spatiallyResolvedPropertyList");
	}
	var d = view.spatiallyResolvedData.data;
	var propertyList = plotSetup.spatiallyResolvedPropertyList;
	var density = plotSetup.pointcloudDensity;
	var densityCutoffLow = plotSetup.densityCutoffLow;
	var densityCutoffUp = plotSetup.densityCutoffUp;
	var systemName = view.moleculeName;

	var xPlotScale = view.xPlotScale;
	var yPlotScale = view.yPlotScale;
	var zPlotScale = view.zPlotScale;
	d.forEach(function (d, i) {
		var n = +d[density];
		if (n > densityCutoffLow && n < densityCutoffUp) {
			var temp = {
				x: +d.x,
				y: +d.y,
				z: +d.z,
				xPlot: xPlotScale(+d.x),
				yPlot: yPlotScale(+d.y),
				zPlot: zPlotScale(+d.z),
				selected: true,
				name: systemName
			};
			for (var i = 0; i < propertyList.length; i++) {
				temp[propertyList[i]] = +d[propertyList[i]];
			}

			if (view.frameBool) {
				var currentFrame = (+d[plotSetup.frameProperty]).toString();
			} else {
				temp["__frame__"] = 1;
				var currentFrame = 1..toString();
			}

			!(currentFrame in view.systemSpatiallyResolvedDataFramed) && (view.systemSpatiallyResolvedDataFramed[currentFrame] = []);

			view.systemSpatiallyResolvedData.push(temp);
			view.systemSpatiallyResolvedDataFramed[currentFrame].push(temp);
			overallSpatiallyResolvedData.push(temp);
		}
	});
	console.log('end processing data');
	callback(null);
}

function processMoleculeData(view, overallMoleculeData, plotSetup, callback) {
	view.systemMoleculeData = [];
	view.systemMoleculeDataFramed = {};
	console.log('started processing molecule data');
	if (view.frameBool && !plotSetup.moleculePropertyList.includes(plotSetup.frameProperty)) {
		alert("The frame property Not in moleculePropertyList");
	}
	var d = view.moleculeData.data;
	var propertyList = plotSetup.moleculePropertyList;
	var systemName = view.moleculeName;

	var xPlotScale = view.xPlotScale;
	var yPlotScale = view.yPlotScale;
	var zPlotScale = view.zPlotScale;

	d.forEach(function (d, i) {

		var temp = {
			atom: d.atom.trim(),
			x: +d.x,
			y: +d.y,
			z: +d.z,
			xPlot: xPlotScale(+d.x),
			yPlot: yPlotScale(+d.y),
			zPlot: zPlotScale(+d.z),
			selected: true,
			name: systemName
		};

		for (var i = 0; i < propertyList.length; i++) {
			if (propertyList[i] != "atom") {
				temp[propertyList[i]] = +d[propertyList[i]];
			}
		}

		if (view.frameBool) {
			var currentFrame = (+d[plotSetup.frameProperty]).toString();
		} else {
			temp["__frame__"] = 1;
			var currentFrame = 1..toString();
		}

		!(currentFrame in view.systemMoleculeDataFramed) && (view.systemMoleculeDataFramed[currentFrame] = []);

		view.systemMoleculeData.push(temp);
		view.systemMoleculeDataFramed[currentFrame].push(temp);
		overallMoleculeData.push(temp);
	});
	console.log(view.systemMoleculeDataFramed);
	console.log('end processing molecule data');
	callback(null);
}

function readCSVSpatiallyResolvedData(view, overallSpatiallyResolvedData, plotSetup, callback) {
	view.systemSpatiallyResolvedData = [];
	view.systemSpatiallyResolvedDataFramed = {};

	if (view.spatiallyResolvedData == null || view.spatiallyResolvedData.dataFilename == null) {
		console.log('no spatially resolved data loaded');
		callback(null);
	} else {
		if (view.frameBool && !plotSetup.spatiallyResolvedPropertyList.includes(plotSetup.frameProperty)) {
			alert("The frame property Not in spatiallyResolvedPropertyList");
		}
		console.log('started loading');
		var filename = view.spatiallyResolvedData.dataFilename;
		console.log(filename);
		var propertyList = plotSetup.spatiallyResolvedPropertyList;
		var density = plotSetup.pointcloudDensity;
		var densityCutoffLow = plotSetup.densityCutoffLow;
		var densityCutoffUp = plotSetup.densityCutoffUp;
		var systemName = view.moleculeName;

		var xPlotScale = view.xPlotScale;
		var yPlotScale = view.yPlotScale;
		var zPlotScale = view.zPlotScale;

		d3.csv(filename, function (error, d) {
			if (error && error.target.status === 404) {
				console.log(error);
				console.log("File not found");
			}
			if (d.length === 0) {
				console.log("File empty");
			}
			console.log('end loading');
			d.forEach(function (d, i) {
				var n = +d[density];
				if (n > densityCutoffLow && n < densityCutoffUp) {
					var temp = {
						x: +d.x,
						y: +d.y,
						z: +d.z,
						xPlot: xPlotScale(+d.x),
						yPlot: yPlotScale(+d.y),
						zPlot: zPlotScale(+d.z),
						selected: true,
						name: systemName
					};
					for (var i = 0; i < propertyList.length; i++) {
						temp[propertyList[i]] = +d[propertyList[i]];
					}

					if (view.frameBool) {
						var currentFrame = (+d[plotSetup.frameProperty]).toString();
					} else {
						temp["__frame__"] = 1;
						var currentFrame = 1..toString();
					}

					!(currentFrame in view.systemSpatiallyResolvedDataFramed) && (view.systemSpatiallyResolvedDataFramed[currentFrame] = []);

					view.systemSpatiallyResolvedData.push(temp);
					view.systemSpatiallyResolvedDataFramed[currentFrame].push(temp);
					overallSpatiallyResolvedData.push(temp);
				}
			});
			console.log('end parsing');
			callback(null);
		});
	}
}

function readCSVMoleculeData(view, overallMoleculeData, plotSetup, callback) {

	view.systemMoleculeData = [];
	view.systemMoleculeDataFramed = {};

	if (view.moleculeData == null || view.moleculeData.dataFilename == null) {
		console.log('no molecule data loaded');
		callback(null);
	} else {
		if (view.frameBool && !plotSetup.moleculePropertyList.includes(plotSetup.frameProperty)) {
			alert("The frame property Not in moleculePropertyList");
		}
		console.log('started loading');
		var filename = view.moleculeData.dataFilename;
		console.log(filename);
		var propertyList = plotSetup.moleculePropertyList;
		var systemName = view.moleculeName;

		var xPlotScale = view.xPlotScale;
		var yPlotScale = view.yPlotScale;
		var zPlotScale = view.zPlotScale;

		d3.csv(filename, function (error, d) {
			if (error && error.target.status === 404) {
				console.log(error);
				console.log("File not found");
			}
			if (d.length === 0) {
				console.log("File empty");
			}
			console.log('end loading');
			d.forEach(function (d, i) {

				var temp = {
					atom: d.atom.trim(),
					x: +d.x,
					y: +d.y,
					z: +d.z,
					xPlot: xPlotScale(+d.x),
					yPlot: yPlotScale(+d.y),
					zPlot: zPlotScale(+d.z),
					selected: true,
					name: systemName
				};

				for (var i = 0; i < propertyList.length; i++) {
					if (propertyList[i] != "atom") {
						temp[propertyList[i]] = +d[propertyList[i]];
					}
				}

				if (view.frameBool) {
					var currentFrame = (+d[plotSetup.frameProperty]).toString();
				} else {
					temp["__frame__"] = 1;
					var currentFrame = 1..toString();
				}

				!(currentFrame in view.systemMoleculeDataFramed) && (view.systemMoleculeDataFramed[currentFrame] = []);

				view.systemMoleculeData.push(temp);
				view.systemMoleculeDataFramed[currentFrame].push(temp);
				overallMoleculeData.push(temp);

				/*var n = +d[density];
    if (n >densityCutoff){
    	var temp = {
    			xPlot: xPlotScale(+d.x),
    			yPlot: yPlotScale(+d.y),
    			zPlot: zPlotScale(+d.z),
    			selected: true,
    			name: systemName
    		}
    	for (var i = 0; i < propertyList.length; i++) {
    	    temp[propertyList[i]] = +d[propertyList[i]];
    	}
    					view.data.push(temp);
    	plotData.push(temp);
    }*/
			});
			console.log('end parsing');
			callback(null);
		});
	}
}

//export function readCSVPapaparse(view,plotData,plotSetup,callback){
//	console.log('started using papa')
//	var filename = view.dataFilename;
//	var propertyList = plotSetup.propertyList;
//	var density = plotSetup.pointcloudDensity;
//	var densityCutoff = plotSetup.densityCutoff;
//	var systemName = view.moleculeName;
//	console.log(density,densityCutoff,propertyList)
//	view.data = [];
/*Papa.parse(filename, {
	complete: function(results) {
		console.log('successfully used papa')
		console.log(results);
		callback(null);
	}
});*/
//	$.ajax({
//    	url: filename,
//    	//dataType: 'json',
//    	type: 'get',
//    	cache: false,
//    	success: function(data) {
//    		console.log('loading setup');
//    		Papa.parse(data, {
//				complete: function(results) {
//					console.log('successfully used papa')
//					console.log(results);
//					callback(null);
//				}
//			});
//    	},
//    	error: function(requestObject, error, errorThrown) {
//            alert(error);
//            alert(errorThrown);
//        }
//    })
/*d3.csv(filename, function (d) {
	d.forEach(function (d,i) {
		var n = +d[density];
		if (n >densityCutoff){
			var temp = {
					n: +d[density],
					selected: true,
					name: systemName
				}
			for (var i = 0; i < propertyList.length; i++) {
			    temp[propertyList[i]] = +d[propertyList[i]];
			}


			view.data.push(temp);
			plotData.push(temp);
		}
	})
callback(null);
});*/

//}

function getCoordinateScales(data) {
	var xValue = function xValue(d) {
		return d.x;
	};
	var yValue = function yValue(d) {
		return d.y;
	};
	var zValue = function zValue(d) {
		return d.z;
	};
	var xMin = d3.min(data, xValue);
	var xMax = d3.max(data, xValue);
	var yMin = d3.min(data, yValue);
	var yMax = d3.max(data, yValue);
	var zMin = d3.min(data, zValue);
	var zMax = d3.max(data, zValue);
}

function preprocessData(view) {
	var data = view.data;
}

/*

export function readViewsSetup(filname,callback){
	loadJSON(function(response) {
		// Parse JSON string into object
		views = JSON.parse(response);
		console.log(response);
		console.log(views);
		initializeViewSetups(views);
		callback(null);
	});
}

function loadJSON(filename,callback) {   

	var xobj = new XMLHttpRequest();
	xobj.overrideMimeType("application/json");
	xobj.open('GET', filename, true); // Replace 'my_data' with the path to your file
	xobj.onreadystatechange = function () {
		if (xobj.readyState == 4 && xobj.status == "200") {
			// Required use of an anonymous callback as .open will NOT return a value but simply returns undefined in asynchronous mode
		callback(xobj.responseText);
		}
	};
	xobj.send(null);  
}*/

},{"../MultiviewControl/initializeViewSetups.js":24}],30:[function(require,module,exports){
"use strict";

exports.__esModule = true;
exports.saveSystemMoleculeData = saveSystemMoleculeData;
exports.saveSystemSpatiallyResolvedData = saveSystemSpatiallyResolvedData;
exports.saveOverallMoleculeData = saveOverallMoleculeData;
exports.saveOverallSpatiallyResolvedData = saveOverallSpatiallyResolvedData;

function saveSystemMoleculeData(view, plotSetup) {
	//var data;
	console.log("save MoleculeData");
	var csv = convertArrayOfObjectsToCSV(view.systemMoleculeData, plotSetup["moleculePropertyList"].slice());
	/*if (csv == null) return;
 
 var filename = 'export.csv';
 
 if (!csv.match(/^data:text\/csv/i)) {
     csv = 'data:text/csv;charset=utf-8,' + csv;
 }
 data = encodeURI(csv);
 
 var link = document.createElement('a');
 link.setAttribute('href', data);
 link.setAttribute('download', filename);
 link.click();*/
}

function saveSystemSpatiallyResolvedData(view, plotSetup) {
	//var data;
	console.log("save SpatiallyResolvedData");
	var csv = convertArrayOfObjectsToCSV(view.data, plotSetup["spatiallyResolvedPropertyList"].slice());
	/*console.log("end processing csv");
 
 var filename = 'export.csv';
 
 if (!csv.match(/^data:text\/csv/i)) {
     csv = 'data:text/csv;charset=utf-8,' + csv;
 }
 data = encodeURI(csv);
 
 //console.log(data);
 
 var link = document.createElement('a');
 link.setAttribute('href', data);
 link.setAttribute('download', filename);
 link.click();*/
}

function saveOverallMoleculeData(view, plotSetup) {
	//var data;
	console.log("save overall MoleculeData");
	var csv = convertArrayOfObjectsToCSV(view.overallMoleculeData, plotSetup["moleculePropertyList"].slice());
	/*if (csv == null) return;
 
 var filename = 'export.csv';
 
 if (!csv.match(/^data:text\/csv/i)) {
     csv = 'data:text/csv;charset=utf-8,' + csv;
 }
 data = encodeURI(csv);
 
 var link = document.createElement('a');
 link.setAttribute('href', data);
 link.setAttribute('download', filename);
 link.click();*/
}

function saveOverallSpatiallyResolvedData(view, plotSetup) {
	//var data;
	console.log("save overall SpatiallyResolvedData");
	var csv = convertArrayOfObjectsToCSV(view.spatiallyResolvedData, plotSetup["spatiallyResolvedPropertyList"].slice());
	/*console.log("end processing csv");
 
 var filename = 'export.csv';
 
 if (!csv.match(/^data:text\/csv/i)) {
     csv = 'data:text/csv;charset=utf-8,' + csv;
 }
 data = encodeURI(csv);
 
 //console.log(data);
 
 var link = document.createElement('a');
 link.setAttribute('href', data);
 link.setAttribute('download', filename);
 link.click();*/
}

function convertArrayOfObjectsToCSV(data, keys) {
	var result, ctr, columnDelimiter, lineDelimiter;

	/*if (data == null || !data.length) {
     return null;
 }*/
	//console.log(data);

	if (keys.indexOf("z") < 0) {
		keys.unshift("z");
	}
	if (keys.indexOf("y") < 0) {
		keys.unshift("y");
	}
	if (keys.indexOf("x") < 0) {
		keys.unshift("x");
	}

	if (keys.indexOf("selected") < 0) {
		keys.push("selected");
	}

	columnDelimiter = ',';
	lineDelimiter = '\n';

	//keys = Object.keys(data[0]);

	result = '';
	result += keys.join(columnDelimiter);
	result += lineDelimiter;

	data.forEach(function (item) {
		ctr = 0;
		keys.forEach(function (key) {
			if (ctr > 0) result += columnDelimiter;

			result += item[key];
			ctr++;
		});
		result += lineDelimiter;
	});

	var filename = 'export.csv';

	/*if (!result.match(/^data:text\/csv/i)) {
     result = 'data:text/csv;charset=utf-8,' + result;
 }
 var result_data = encodeURI(result);
 
 //console.log(data);
 
 var link = document.createElement('a');
 link.setAttribute('href', result_data);
 link.setAttribute('download', filename);
 link.click();*/

	var blob = new Blob([result], { type: "text/csv;charset=utf-8;" });
	if (navigator.msSaveBlob) {
		// IE 10+
		navigator.msSaveBlob(blob, filename);
	} else {
		var link = document.createElement("a");
		if (link.download !== undefined) {
			// feature detection, Browsers that support HTML5 download attribute
			var url = URL.createObjectURL(blob);
			link.setAttribute("href", url);
			link.setAttribute("download", filename);
			link.style = "visibility:hidden";
			document.body.appendChild(link);
			link.click();
			document.body.removeChild(link);
		}
	}
}

},{}],31:[function(require,module,exports){
'use strict';

exports.__esModule = true;
exports.calcDefaultScalesSpatiallyResolvedData = calcDefaultScalesSpatiallyResolvedData;
exports.adjustColorScaleAccordingToDefaultSpatiallyResolvedData = adjustColorScaleAccordingToDefaultSpatiallyResolvedData;
exports.calcDefaultScalesMoleculeData = calcDefaultScalesMoleculeData;
exports.adjustScaleAccordingToDefaultMoleculeData = adjustScaleAccordingToDefaultMoleculeData;

function calcDefaultScalesSpatiallyResolvedData(plotSetup, spatiallyResolvedData) {
	var result = {};
	var propertyList = plotSetup.spatiallyResolvedPropertyList;
	for (var i = 0; i < propertyList.length; i++) {
		var property = propertyList[i];
		var xValue = function xValue(d) {
			return d[property];
		};
		var xMin = d3.min(spatiallyResolvedData, xValue);
		var xMax = d3.max(spatiallyResolvedData, xValue);
		result[property] = { 'min': xMin, 'max': xMax };
	}
	return result;
}

function adjustColorScaleAccordingToDefaultSpatiallyResolvedData(view) {
	view.options.pointCloudColorSettingMin = view.defaultScalesSpatiallyResolvedData[view.options.propertyOfInterest]['min'];
	view.options.pointCloudColorSettingMax = view.defaultScalesSpatiallyResolvedData[view.options.propertyOfInterest]['max'];
}

function calcDefaultScalesMoleculeData(plotSetup, moleculeData) {
	var result = {};
	var propertyList = plotSetup.moleculePropertyList;
	for (var i = 0; i < propertyList.length; i++) {
		var property = propertyList[i];
		if (property != "atom") {
			var xValue = function xValue(d) {
				return d[property];
			};
			var xMin = d3.min(moleculeData, xValue);
			var xMax = d3.max(moleculeData, xValue);
			result[property] = { 'min': xMin, 'max': xMax };
		}
	}
	return result;
}

function adjustScaleAccordingToDefaultMoleculeData(view) {
	if (view.options.moleculeSizeCodeBasis != "atom") {
		view.options.moleculeSizeSettingMin = view.defaultScalesMoleculeData[view.options.moleculeSizeCodeBasis]['min'] + (view.defaultScalesMoleculeData[view.options.moleculeSizeCodeBasis]['max'] - view.defaultScalesMoleculeData[view.options.moleculeSizeCodeBasis]['min']) * 0.2;
		view.options.moleculeSizeSettingMax = view.defaultScalesMoleculeData[view.options.moleculeSizeCodeBasis]['max'];
	}

	if (view.options.moleculeColorCodeBasis != "atom") {
		view.options.moleculeColorSettingMin = view.defaultScalesMoleculeData[view.options.moleculeColorCodeBasis]['min'];
		view.options.moleculeColorSettingMax = view.defaultScalesMoleculeData[view.options.moleculeColorCodeBasis]['max'];
	}
}

},{}],32:[function(require,module,exports){
'use strict';

const toString = Object.prototype.toString;

function isAnyArray(object) {
  return toString.call(object).endsWith('Array]');
}

module.exports = isAnyArray;

},{}],33:[function(require,module,exports){
'use strict';

function _interopDefault (ex) { return (ex && (typeof ex === 'object') && 'default' in ex) ? ex['default'] : ex; }

var isArray = _interopDefault(require('is-any-array'));

/**
 * Computes the maximum of the given values
 * @param {Array<number>} input
 * @return {number}
 */
function max(input) {
  if (!isArray(input)) {
    throw new TypeError('input must be an array');
  }

  if (input.length === 0) {
    throw new TypeError('input must not be empty');
  }

  var max = input[0];
  for (var i = 1; i < input.length; i++) {
    if (input[i] > max) max = input[i];
  }
  return max;
}

module.exports = max;

},{"is-any-array":32}],34:[function(require,module,exports){
'use strict';

function _interopDefault (ex) { return (ex && (typeof ex === 'object') && 'default' in ex) ? ex['default'] : ex; }

var isArray = _interopDefault(require('is-any-array'));

/**
 * Computes the minimum of the given values
 * @param {Array<number>} input
 * @return {number}
 */
function min(input) {
  if (!isArray(input)) {
    throw new TypeError('input must be an array');
  }

  if (input.length === 0) {
    throw new TypeError('input must not be empty');
  }

  var min = input[0];
  for (var i = 1; i < input.length; i++) {
    if (input[i] < min) min = input[i];
  }
  return min;
}

module.exports = min;

},{"is-any-array":32}],35:[function(require,module,exports){
'use strict';

function _interopDefault (ex) { return (ex && (typeof ex === 'object') && 'default' in ex) ? ex['default'] : ex; }

var max = _interopDefault(require('ml-array-max'));
var min = _interopDefault(require('ml-array-min'));
var isArray = _interopDefault(require('is-any-array'));

function rescale(input, options = {}) {
  if (!isArray(input)) {
    throw new TypeError('input must be an array');
  } else if (input.length === 0) {
    throw new TypeError('input must not be empty');
  }

  let output;
  if (options.output !== undefined) {
    if (!isArray(options.output)) {
      throw new TypeError('output option must be an array if specified');
    }
    output = options.output;
  } else {
    output = new Array(input.length);
  }

  const currentMin = min(input);
  const currentMax = max(input);

  if (currentMin === currentMax) {
    throw new RangeError(
      'minimum and maximum input values are equal. Cannot rescale a constant array'
    );
  }

  const {
    min: minValue = options.autoMinMax ? currentMin : 0,
    max: maxValue = options.autoMinMax ? currentMax : 1
  } = options;

  if (minValue >= maxValue) {
    throw new RangeError('min option must be smaller than max option');
  }

  const factor = (maxValue - minValue) / (currentMax - currentMin);
  for (var i = 0; i < input.length; i++) {
    output[i] = (input[i] - currentMin) * factor + minValue;
  }

  return output;
}

module.exports = rescale;

},{"is-any-array":32,"ml-array-max":33,"ml-array-min":34}],36:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

function _interopDefault (ex) { return (ex && (typeof ex === 'object') && 'default' in ex) ? ex['default'] : ex; }

var rescale = _interopDefault(require('ml-array-rescale'));

/**
 * @private
 * Check that a row index is not out of bounds
 * @param {Matrix} matrix
 * @param {number} index
 * @param {boolean} [outer]
 */
function checkRowIndex(matrix, index, outer) {
  var max = outer ? matrix.rows : matrix.rows - 1;
  if (index < 0 || index > max) {
    throw new RangeError('Row index out of range');
  }
}

/**
 * @private
 * Check that a column index is not out of bounds
 * @param {Matrix} matrix
 * @param {number} index
 * @param {boolean} [outer]
 */
function checkColumnIndex(matrix, index, outer) {
  var max = outer ? matrix.columns : matrix.columns - 1;
  if (index < 0 || index > max) {
    throw new RangeError('Column index out of range');
  }
}

/**
 * @private
 * Check that the provided vector is an array with the right length
 * @param {Matrix} matrix
 * @param {Array|Matrix} vector
 * @return {Array}
 * @throws {RangeError}
 */
function checkRowVector(matrix, vector) {
  if (vector.to1DArray) {
    vector = vector.to1DArray();
  }
  if (vector.length !== matrix.columns) {
    throw new RangeError(
      'vector size must be the same as the number of columns'
    );
  }
  return vector;
}

/**
 * @private
 * Check that the provided vector is an array with the right length
 * @param {Matrix} matrix
 * @param {Array|Matrix} vector
 * @return {Array}
 * @throws {RangeError}
 */
function checkColumnVector(matrix, vector) {
  if (vector.to1DArray) {
    vector = vector.to1DArray();
  }
  if (vector.length !== matrix.rows) {
    throw new RangeError('vector size must be the same as the number of rows');
  }
  return vector;
}

function checkIndices(matrix, rowIndices, columnIndices) {
  return {
    row: checkRowIndices(matrix, rowIndices),
    column: checkColumnIndices(matrix, columnIndices)
  };
}

function checkRowIndices(matrix, rowIndices) {
  if (typeof rowIndices !== 'object') {
    throw new TypeError('unexpected type for row indices');
  }

  var rowOut = rowIndices.some((r) => {
    return r < 0 || r >= matrix.rows;
  });

  if (rowOut) {
    throw new RangeError('row indices are out of range');
  }

  if (!Array.isArray(rowIndices)) rowIndices = Array.from(rowIndices);

  return rowIndices;
}

function checkColumnIndices(matrix, columnIndices) {
  if (typeof columnIndices !== 'object') {
    throw new TypeError('unexpected type for column indices');
  }

  var columnOut = columnIndices.some((c) => {
    return c < 0 || c >= matrix.columns;
  });

  if (columnOut) {
    throw new RangeError('column indices are out of range');
  }
  if (!Array.isArray(columnIndices)) columnIndices = Array.from(columnIndices);

  return columnIndices;
}

function checkRange(matrix, startRow, endRow, startColumn, endColumn) {
  if (arguments.length !== 5) {
    throw new RangeError('expected 4 arguments');
  }
  checkNumber('startRow', startRow);
  checkNumber('endRow', endRow);
  checkNumber('startColumn', startColumn);
  checkNumber('endColumn', endColumn);
  if (
    startRow > endRow ||
    startColumn > endColumn ||
    startRow < 0 ||
    startRow >= matrix.rows ||
    endRow < 0 ||
    endRow >= matrix.rows ||
    startColumn < 0 ||
    startColumn >= matrix.columns ||
    endColumn < 0 ||
    endColumn >= matrix.columns
  ) {
    throw new RangeError('Submatrix indices are out of range');
  }
}

function newArray(length, value = 0) {
  var array = [];
  for (var i = 0; i < length; i++) {
    array.push(value);
  }
  return array;
}

function checkNumber(name, value) {
  if (typeof value !== 'number') {
    throw new TypeError(`${name} must be a number`);
  }
}

function sumByRow(matrix) {
  var sum = newArray(matrix.rows);
  for (var i = 0; i < matrix.rows; ++i) {
    for (var j = 0; j < matrix.columns; ++j) {
      sum[i] += matrix.get(i, j);
    }
  }
  return sum;
}

function sumByColumn(matrix) {
  var sum = newArray(matrix.columns);
  for (var i = 0; i < matrix.rows; ++i) {
    for (var j = 0; j < matrix.columns; ++j) {
      sum[j] += matrix.get(i, j);
    }
  }
  return sum;
}

function sumAll(matrix) {
  var v = 0;
  for (var i = 0; i < matrix.rows; i++) {
    for (var j = 0; j < matrix.columns; j++) {
      v += matrix.get(i, j);
    }
  }
  return v;
}

function productByRow(matrix) {
  var sum = newArray(matrix.rows, 1);
  for (var i = 0; i < matrix.rows; ++i) {
    for (var j = 0; j < matrix.columns; ++j) {
      sum[i] *= matrix.get(i, j);
    }
  }
  return sum;
}

function productByColumn(matrix) {
  var sum = newArray(matrix.columns, 1);
  for (var i = 0; i < matrix.rows; ++i) {
    for (var j = 0; j < matrix.columns; ++j) {
      sum[j] *= matrix.get(i, j);
    }
  }
  return sum;
}

function productAll(matrix) {
  var v = 1;
  for (var i = 0; i < matrix.rows; i++) {
    for (var j = 0; j < matrix.columns; j++) {
      v *= matrix.get(i, j);
    }
  }
  return v;
}

function varianceByRow(matrix, unbiased, mean) {
  const rows = matrix.rows;
  const cols = matrix.columns;
  const variance = [];

  for (var i = 0; i < rows; i++) {
    var sum1 = 0;
    var sum2 = 0;
    var x = 0;
    for (var j = 0; j < cols; j++) {
      x = matrix.get(i, j) - mean[i];
      sum1 += x;
      sum2 += x * x;
    }
    if (unbiased) {
      variance.push((sum2 - (sum1 * sum1) / cols) / (cols - 1));
    } else {
      variance.push((sum2 - (sum1 * sum1) / cols) / cols);
    }
  }
  return variance;
}

function varianceByColumn(matrix, unbiased, mean) {
  const rows = matrix.rows;
  const cols = matrix.columns;
  const variance = [];

  for (var j = 0; j < cols; j++) {
    var sum1 = 0;
    var sum2 = 0;
    var x = 0;
    for (var i = 0; i < rows; i++) {
      x = matrix.get(i, j) - mean[j];
      sum1 += x;
      sum2 += x * x;
    }
    if (unbiased) {
      variance.push((sum2 - (sum1 * sum1) / rows) / (rows - 1));
    } else {
      variance.push((sum2 - (sum1 * sum1) / rows) / rows);
    }
  }
  return variance;
}

function varianceAll(matrix, unbiased, mean) {
  const rows = matrix.rows;
  const cols = matrix.columns;
  const size = rows * cols;

  var sum1 = 0;
  var sum2 = 0;
  var x = 0;
  for (var i = 0; i < rows; i++) {
    for (var j = 0; j < cols; j++) {
      x = matrix.get(i, j) - mean;
      sum1 += x;
      sum2 += x * x;
    }
  }
  if (unbiased) {
    return (sum2 - (sum1 * sum1) / size) / (size - 1);
  } else {
    return (sum2 - (sum1 * sum1) / size) / size;
  }
}

function centerByRow(matrix, mean) {
  for (let i = 0; i < matrix.rows; i++) {
    for (let j = 0; j < matrix.columns; j++) {
      matrix.set(i, j, matrix.get(i, j) - mean[i]);
    }
  }
}

function centerByColumn(matrix, mean) {
  for (let i = 0; i < matrix.rows; i++) {
    for (let j = 0; j < matrix.columns; j++) {
      matrix.set(i, j, matrix.get(i, j) - mean[j]);
    }
  }
}

function centerAll(matrix, mean) {
  for (let i = 0; i < matrix.rows; i++) {
    for (let j = 0; j < matrix.columns; j++) {
      matrix.set(i, j, matrix.get(i, j) - mean);
    }
  }
}

function getScaleByRow(matrix) {
  const scale = [];
  for (let i = 0; i < matrix.rows; i++) {
    let sum = 0;
    for (let j = 0; j < matrix.columns; j++) {
      sum += Math.pow(matrix.get(i, j), 2) / (matrix.columns - 1);
    }
    scale.push(Math.sqrt(sum));
  }
  return scale;
}

function scaleByRow(matrix, scale) {
  for (let i = 0; i < matrix.rows; i++) {
    for (let j = 0; j < matrix.columns; j++) {
      matrix.set(i, j, matrix.get(i, j) / scale[i]);
    }
  }
}

function getScaleByColumn(matrix) {
  const scale = [];
  for (let j = 0; j < matrix.columns; j++) {
    let sum = 0;
    for (let i = 0; i < matrix.rows; i++) {
      sum += Math.pow(matrix.get(i, j), 2) / (matrix.rows - 1);
    }
    scale.push(Math.sqrt(sum));
  }
  return scale;
}

function scaleByColumn(matrix, scale) {
  for (let i = 0; i < matrix.rows; i++) {
    for (let j = 0; j < matrix.columns; j++) {
      matrix.set(i, j, matrix.get(i, j) / scale[j]);
    }
  }
}

function getScaleAll(matrix) {
  const divider = matrix.size - 1;
  let sum = 0;
  for (let j = 0; j < matrix.columns; j++) {
    for (let i = 0; i < matrix.rows; i++) {
      sum += Math.pow(matrix.get(i, j), 2) / divider;
    }
  }
  return Math.sqrt(sum);
}

function scaleAll(matrix, scale) {
  for (let i = 0; i < matrix.rows; i++) {
    for (let j = 0; j < matrix.columns; j++) {
      matrix.set(i, j, matrix.get(i, j) / scale);
    }
  }
}

function inspectMatrix() {
  const indent = ' '.repeat(2);
  const indentData = ' '.repeat(4);
  return `${this.constructor.name} {
${indent}[
${indentData}${inspectData(this, indentData)}
${indent}]
${indent}rows: ${this.rows}
${indent}columns: ${this.columns}
}`;
}

const maxRows = 15;
const maxColumns = 10;
const maxNumSize = 8;

function inspectData(matrix, indent) {
  const { rows, columns } = matrix;
  const maxI = Math.min(rows, maxRows);
  const maxJ = Math.min(columns, maxColumns);
  const result = [];
  for (var i = 0; i < maxI; i++) {
    let line = [];
    for (var j = 0; j < maxJ; j++) {
      line.push(formatNumber(matrix.get(i, j)));
    }
    result.push(`${line.join(' ')}`);
  }
  if (maxJ !== columns) {
    result[result.length - 1] += ` ... ${columns - maxColumns} more columns`;
  }
  if (maxI !== rows) {
    result.push(`... ${rows - maxRows} more rows`);
  }
  return result.join(`\n${indent}`);
}

function formatNumber(num) {
  const numStr = String(num);
  if (numStr.length <= maxNumSize) {
    return numStr.padEnd(maxNumSize, ' ');
  }
  const precise = num.toPrecision(maxNumSize - 2);
  if (precise.length <= maxNumSize) {
    return precise;
  }
  const exponential = num.toExponential(maxNumSize - 2);
  const eIndex = exponential.indexOf('e');
  const e = exponential.substring(eIndex);
  return exponential.substring(0, maxNumSize - e.length) + e;
}

function installMathOperations(AbstractMatrix, Matrix) {
  AbstractMatrix.prototype.add = function add(value) {
    if (typeof value === 'number') return this.addS(value);
    return this.addM(value);
  };

  AbstractMatrix.prototype.addS = function addS(value) {
    for (var i = 0; i < this.rows; i++) {
      for (var j = 0; j < this.columns; j++) {
        this.set(i, j, this.get(i, j) + value);
      }
    }
    return this;
  };

  AbstractMatrix.prototype.addM = function addM(matrix) {
    matrix = Matrix.checkMatrix(matrix);
    if (this.rows !== matrix.rows ||
      this.columns !== matrix.columns) {
      throw new RangeError('Matrices dimensions must be equal');
    }
    for (var i = 0; i < this.rows; i++) {
      for (var j = 0; j < this.columns; j++) {
        this.set(i, j, this.get(i, j) + matrix.get(i, j));
      }
    }
    return this;
  };

  AbstractMatrix.add = function add(matrix, value) {
    var newMatrix = new Matrix(matrix);
    return newMatrix.add(value);
  };

  AbstractMatrix.prototype.sub = function sub(value) {
    if (typeof value === 'number') return this.subS(value);
    return this.subM(value);
  };

  AbstractMatrix.prototype.subS = function subS(value) {
    for (var i = 0; i < this.rows; i++) {
      for (var j = 0; j < this.columns; j++) {
        this.set(i, j, this.get(i, j) - value);
      }
    }
    return this;
  };

  AbstractMatrix.prototype.subM = function subM(matrix) {
    matrix = Matrix.checkMatrix(matrix);
    if (this.rows !== matrix.rows ||
      this.columns !== matrix.columns) {
      throw new RangeError('Matrices dimensions must be equal');
    }
    for (var i = 0; i < this.rows; i++) {
      for (var j = 0; j < this.columns; j++) {
        this.set(i, j, this.get(i, j) - matrix.get(i, j));
      }
    }
    return this;
  };

  AbstractMatrix.sub = function sub(matrix, value) {
    var newMatrix = new Matrix(matrix);
    return newMatrix.sub(value);
  };
  AbstractMatrix.prototype.subtract = AbstractMatrix.prototype.sub;
  AbstractMatrix.prototype.subtractS = AbstractMatrix.prototype.subS;
  AbstractMatrix.prototype.subtractM = AbstractMatrix.prototype.subM;
  AbstractMatrix.subtract = AbstractMatrix.sub;

  AbstractMatrix.prototype.mul = function mul(value) {
    if (typeof value === 'number') return this.mulS(value);
    return this.mulM(value);
  };

  AbstractMatrix.prototype.mulS = function mulS(value) {
    for (var i = 0; i < this.rows; i++) {
      for (var j = 0; j < this.columns; j++) {
        this.set(i, j, this.get(i, j) * value);
      }
    }
    return this;
  };

  AbstractMatrix.prototype.mulM = function mulM(matrix) {
    matrix = Matrix.checkMatrix(matrix);
    if (this.rows !== matrix.rows ||
      this.columns !== matrix.columns) {
      throw new RangeError('Matrices dimensions must be equal');
    }
    for (var i = 0; i < this.rows; i++) {
      for (var j = 0; j < this.columns; j++) {
        this.set(i, j, this.get(i, j) * matrix.get(i, j));
      }
    }
    return this;
  };

  AbstractMatrix.mul = function mul(matrix, value) {
    var newMatrix = new Matrix(matrix);
    return newMatrix.mul(value);
  };
  AbstractMatrix.prototype.multiply = AbstractMatrix.prototype.mul;
  AbstractMatrix.prototype.multiplyS = AbstractMatrix.prototype.mulS;
  AbstractMatrix.prototype.multiplyM = AbstractMatrix.prototype.mulM;
  AbstractMatrix.multiply = AbstractMatrix.mul;

  AbstractMatrix.prototype.div = function div(value) {
    if (typeof value === 'number') return this.divS(value);
    return this.divM(value);
  };

  AbstractMatrix.prototype.divS = function divS(value) {
    for (var i = 0; i < this.rows; i++) {
      for (var j = 0; j < this.columns; j++) {
        this.set(i, j, this.get(i, j) / value);
      }
    }
    return this;
  };

  AbstractMatrix.prototype.divM = function divM(matrix) {
    matrix = Matrix.checkMatrix(matrix);
    if (this.rows !== matrix.rows ||
      this.columns !== matrix.columns) {
      throw new RangeError('Matrices dimensions must be equal');
    }
    for (var i = 0; i < this.rows; i++) {
      for (var j = 0; j < this.columns; j++) {
        this.set(i, j, this.get(i, j) / matrix.get(i, j));
      }
    }
    return this;
  };

  AbstractMatrix.div = function div(matrix, value) {
    var newMatrix = new Matrix(matrix);
    return newMatrix.div(value);
  };
  AbstractMatrix.prototype.divide = AbstractMatrix.prototype.div;
  AbstractMatrix.prototype.divideS = AbstractMatrix.prototype.divS;
  AbstractMatrix.prototype.divideM = AbstractMatrix.prototype.divM;
  AbstractMatrix.divide = AbstractMatrix.div;

  AbstractMatrix.prototype.mod = function mod(value) {
    if (typeof value === 'number') return this.modS(value);
    return this.modM(value);
  };

  AbstractMatrix.prototype.modS = function modS(value) {
    for (var i = 0; i < this.rows; i++) {
      for (var j = 0; j < this.columns; j++) {
        this.set(i, j, this.get(i, j) % value);
      }
    }
    return this;
  };

  AbstractMatrix.prototype.modM = function modM(matrix) {
    matrix = Matrix.checkMatrix(matrix);
    if (this.rows !== matrix.rows ||
      this.columns !== matrix.columns) {
      throw new RangeError('Matrices dimensions must be equal');
    }
    for (var i = 0; i < this.rows; i++) {
      for (var j = 0; j < this.columns; j++) {
        this.set(i, j, this.get(i, j) % matrix.get(i, j));
      }
    }
    return this;
  };

  AbstractMatrix.mod = function mod(matrix, value) {
    var newMatrix = new Matrix(matrix);
    return newMatrix.mod(value);
  };
  AbstractMatrix.prototype.modulus = AbstractMatrix.prototype.mod;
  AbstractMatrix.prototype.modulusS = AbstractMatrix.prototype.modS;
  AbstractMatrix.prototype.modulusM = AbstractMatrix.prototype.modM;
  AbstractMatrix.modulus = AbstractMatrix.mod;

  AbstractMatrix.prototype.and = function and(value) {
    if (typeof value === 'number') return this.andS(value);
    return this.andM(value);
  };

  AbstractMatrix.prototype.andS = function andS(value) {
    for (var i = 0; i < this.rows; i++) {
      for (var j = 0; j < this.columns; j++) {
        this.set(i, j, this.get(i, j) & value);
      }
    }
    return this;
  };

  AbstractMatrix.prototype.andM = function andM(matrix) {
    matrix = Matrix.checkMatrix(matrix);
    if (this.rows !== matrix.rows ||
      this.columns !== matrix.columns) {
      throw new RangeError('Matrices dimensions must be equal');
    }
    for (var i = 0; i < this.rows; i++) {
      for (var j = 0; j < this.columns; j++) {
        this.set(i, j, this.get(i, j) & matrix.get(i, j));
      }
    }
    return this;
  };

  AbstractMatrix.and = function and(matrix, value) {
    var newMatrix = new Matrix(matrix);
    return newMatrix.and(value);
  };

  AbstractMatrix.prototype.or = function or(value) {
    if (typeof value === 'number') return this.orS(value);
    return this.orM(value);
  };

  AbstractMatrix.prototype.orS = function orS(value) {
    for (var i = 0; i < this.rows; i++) {
      for (var j = 0; j < this.columns; j++) {
        this.set(i, j, this.get(i, j) | value);
      }
    }
    return this;
  };

  AbstractMatrix.prototype.orM = function orM(matrix) {
    matrix = Matrix.checkMatrix(matrix);
    if (this.rows !== matrix.rows ||
      this.columns !== matrix.columns) {
      throw new RangeError('Matrices dimensions must be equal');
    }
    for (var i = 0; i < this.rows; i++) {
      for (var j = 0; j < this.columns; j++) {
        this.set(i, j, this.get(i, j) | matrix.get(i, j));
      }
    }
    return this;
  };

  AbstractMatrix.or = function or(matrix, value) {
    var newMatrix = new Matrix(matrix);
    return newMatrix.or(value);
  };

  AbstractMatrix.prototype.xor = function xor(value) {
    if (typeof value === 'number') return this.xorS(value);
    return this.xorM(value);
  };

  AbstractMatrix.prototype.xorS = function xorS(value) {
    for (var i = 0; i < this.rows; i++) {
      for (var j = 0; j < this.columns; j++) {
        this.set(i, j, this.get(i, j) ^ value);
      }
    }
    return this;
  };

  AbstractMatrix.prototype.xorM = function xorM(matrix) {
    matrix = Matrix.checkMatrix(matrix);
    if (this.rows !== matrix.rows ||
      this.columns !== matrix.columns) {
      throw new RangeError('Matrices dimensions must be equal');
    }
    for (var i = 0; i < this.rows; i++) {
      for (var j = 0; j < this.columns; j++) {
        this.set(i, j, this.get(i, j) ^ matrix.get(i, j));
      }
    }
    return this;
  };

  AbstractMatrix.xor = function xor(matrix, value) {
    var newMatrix = new Matrix(matrix);
    return newMatrix.xor(value);
  };

  AbstractMatrix.prototype.leftShift = function leftShift(value) {
    if (typeof value === 'number') return this.leftShiftS(value);
    return this.leftShiftM(value);
  };

  AbstractMatrix.prototype.leftShiftS = function leftShiftS(value) {
    for (var i = 0; i < this.rows; i++) {
      for (var j = 0; j < this.columns; j++) {
        this.set(i, j, this.get(i, j) << value);
      }
    }
    return this;
  };

  AbstractMatrix.prototype.leftShiftM = function leftShiftM(matrix) {
    matrix = Matrix.checkMatrix(matrix);
    if (this.rows !== matrix.rows ||
      this.columns !== matrix.columns) {
      throw new RangeError('Matrices dimensions must be equal');
    }
    for (var i = 0; i < this.rows; i++) {
      for (var j = 0; j < this.columns; j++) {
        this.set(i, j, this.get(i, j) << matrix.get(i, j));
      }
    }
    return this;
  };

  AbstractMatrix.leftShift = function leftShift(matrix, value) {
    var newMatrix = new Matrix(matrix);
    return newMatrix.leftShift(value);
  };

  AbstractMatrix.prototype.signPropagatingRightShift = function signPropagatingRightShift(value) {
    if (typeof value === 'number') return this.signPropagatingRightShiftS(value);
    return this.signPropagatingRightShiftM(value);
  };

  AbstractMatrix.prototype.signPropagatingRightShiftS = function signPropagatingRightShiftS(value) {
    for (var i = 0; i < this.rows; i++) {
      for (var j = 0; j < this.columns; j++) {
        this.set(i, j, this.get(i, j) >> value);
      }
    }
    return this;
  };

  AbstractMatrix.prototype.signPropagatingRightShiftM = function signPropagatingRightShiftM(matrix) {
    matrix = Matrix.checkMatrix(matrix);
    if (this.rows !== matrix.rows ||
      this.columns !== matrix.columns) {
      throw new RangeError('Matrices dimensions must be equal');
    }
    for (var i = 0; i < this.rows; i++) {
      for (var j = 0; j < this.columns; j++) {
        this.set(i, j, this.get(i, j) >> matrix.get(i, j));
      }
    }
    return this;
  };

  AbstractMatrix.signPropagatingRightShift = function signPropagatingRightShift(matrix, value) {
    var newMatrix = new Matrix(matrix);
    return newMatrix.signPropagatingRightShift(value);
  };

  AbstractMatrix.prototype.rightShift = function rightShift(value) {
    if (typeof value === 'number') return this.rightShiftS(value);
    return this.rightShiftM(value);
  };

  AbstractMatrix.prototype.rightShiftS = function rightShiftS(value) {
    for (var i = 0; i < this.rows; i++) {
      for (var j = 0; j < this.columns; j++) {
        this.set(i, j, this.get(i, j) >>> value);
      }
    }
    return this;
  };

  AbstractMatrix.prototype.rightShiftM = function rightShiftM(matrix) {
    matrix = Matrix.checkMatrix(matrix);
    if (this.rows !== matrix.rows ||
      this.columns !== matrix.columns) {
      throw new RangeError('Matrices dimensions must be equal');
    }
    for (var i = 0; i < this.rows; i++) {
      for (var j = 0; j < this.columns; j++) {
        this.set(i, j, this.get(i, j) >>> matrix.get(i, j));
      }
    }
    return this;
  };

  AbstractMatrix.rightShift = function rightShift(matrix, value) {
    var newMatrix = new Matrix(matrix);
    return newMatrix.rightShift(value);
  };
  AbstractMatrix.prototype.zeroFillRightShift = AbstractMatrix.prototype.rightShift;
  AbstractMatrix.prototype.zeroFillRightShiftS = AbstractMatrix.prototype.rightShiftS;
  AbstractMatrix.prototype.zeroFillRightShiftM = AbstractMatrix.prototype.rightShiftM;
  AbstractMatrix.zeroFillRightShift = AbstractMatrix.rightShift;

  AbstractMatrix.prototype.not = function not() {
    for (var i = 0; i < this.rows; i++) {
      for (var j = 0; j < this.columns; j++) {
        this.set(i, j, ~(this.get(i, j)));
      }
    }
    return this;
  };

  AbstractMatrix.not = function not(matrix) {
    var newMatrix = new Matrix(matrix);
    return newMatrix.not();
  };

  AbstractMatrix.prototype.abs = function abs() {
    for (var i = 0; i < this.rows; i++) {
      for (var j = 0; j < this.columns; j++) {
        this.set(i, j, Math.abs(this.get(i, j)));
      }
    }
    return this;
  };

  AbstractMatrix.abs = function abs(matrix) {
    var newMatrix = new Matrix(matrix);
    return newMatrix.abs();
  };

  AbstractMatrix.prototype.acos = function acos() {
    for (var i = 0; i < this.rows; i++) {
      for (var j = 0; j < this.columns; j++) {
        this.set(i, j, Math.acos(this.get(i, j)));
      }
    }
    return this;
  };

  AbstractMatrix.acos = function acos(matrix) {
    var newMatrix = new Matrix(matrix);
    return newMatrix.acos();
  };

  AbstractMatrix.prototype.acosh = function acosh() {
    for (var i = 0; i < this.rows; i++) {
      for (var j = 0; j < this.columns; j++) {
        this.set(i, j, Math.acosh(this.get(i, j)));
      }
    }
    return this;
  };

  AbstractMatrix.acosh = function acosh(matrix) {
    var newMatrix = new Matrix(matrix);
    return newMatrix.acosh();
  };

  AbstractMatrix.prototype.asin = function asin() {
    for (var i = 0; i < this.rows; i++) {
      for (var j = 0; j < this.columns; j++) {
        this.set(i, j, Math.asin(this.get(i, j)));
      }
    }
    return this;
  };

  AbstractMatrix.asin = function asin(matrix) {
    var newMatrix = new Matrix(matrix);
    return newMatrix.asin();
  };

  AbstractMatrix.prototype.asinh = function asinh() {
    for (var i = 0; i < this.rows; i++) {
      for (var j = 0; j < this.columns; j++) {
        this.set(i, j, Math.asinh(this.get(i, j)));
      }
    }
    return this;
  };

  AbstractMatrix.asinh = function asinh(matrix) {
    var newMatrix = new Matrix(matrix);
    return newMatrix.asinh();
  };

  AbstractMatrix.prototype.atan = function atan() {
    for (var i = 0; i < this.rows; i++) {
      for (var j = 0; j < this.columns; j++) {
        this.set(i, j, Math.atan(this.get(i, j)));
      }
    }
    return this;
  };

  AbstractMatrix.atan = function atan(matrix) {
    var newMatrix = new Matrix(matrix);
    return newMatrix.atan();
  };

  AbstractMatrix.prototype.atanh = function atanh() {
    for (var i = 0; i < this.rows; i++) {
      for (var j = 0; j < this.columns; j++) {
        this.set(i, j, Math.atanh(this.get(i, j)));
      }
    }
    return this;
  };

  AbstractMatrix.atanh = function atanh(matrix) {
    var newMatrix = new Matrix(matrix);
    return newMatrix.atanh();
  };

  AbstractMatrix.prototype.cbrt = function cbrt() {
    for (var i = 0; i < this.rows; i++) {
      for (var j = 0; j < this.columns; j++) {
        this.set(i, j, Math.cbrt(this.get(i, j)));
      }
    }
    return this;
  };

  AbstractMatrix.cbrt = function cbrt(matrix) {
    var newMatrix = new Matrix(matrix);
    return newMatrix.cbrt();
  };

  AbstractMatrix.prototype.ceil = function ceil() {
    for (var i = 0; i < this.rows; i++) {
      for (var j = 0; j < this.columns; j++) {
        this.set(i, j, Math.ceil(this.get(i, j)));
      }
    }
    return this;
  };

  AbstractMatrix.ceil = function ceil(matrix) {
    var newMatrix = new Matrix(matrix);
    return newMatrix.ceil();
  };

  AbstractMatrix.prototype.clz32 = function clz32() {
    for (var i = 0; i < this.rows; i++) {
      for (var j = 0; j < this.columns; j++) {
        this.set(i, j, Math.clz32(this.get(i, j)));
      }
    }
    return this;
  };

  AbstractMatrix.clz32 = function clz32(matrix) {
    var newMatrix = new Matrix(matrix);
    return newMatrix.clz32();
  };

  AbstractMatrix.prototype.cos = function cos() {
    for (var i = 0; i < this.rows; i++) {
      for (var j = 0; j < this.columns; j++) {
        this.set(i, j, Math.cos(this.get(i, j)));
      }
    }
    return this;
  };

  AbstractMatrix.cos = function cos(matrix) {
    var newMatrix = new Matrix(matrix);
    return newMatrix.cos();
  };

  AbstractMatrix.prototype.cosh = function cosh() {
    for (var i = 0; i < this.rows; i++) {
      for (var j = 0; j < this.columns; j++) {
        this.set(i, j, Math.cosh(this.get(i, j)));
      }
    }
    return this;
  };

  AbstractMatrix.cosh = function cosh(matrix) {
    var newMatrix = new Matrix(matrix);
    return newMatrix.cosh();
  };

  AbstractMatrix.prototype.exp = function exp() {
    for (var i = 0; i < this.rows; i++) {
      for (var j = 0; j < this.columns; j++) {
        this.set(i, j, Math.exp(this.get(i, j)));
      }
    }
    return this;
  };

  AbstractMatrix.exp = function exp(matrix) {
    var newMatrix = new Matrix(matrix);
    return newMatrix.exp();
  };

  AbstractMatrix.prototype.expm1 = function expm1() {
    for (var i = 0; i < this.rows; i++) {
      for (var j = 0; j < this.columns; j++) {
        this.set(i, j, Math.expm1(this.get(i, j)));
      }
    }
    return this;
  };

  AbstractMatrix.expm1 = function expm1(matrix) {
    var newMatrix = new Matrix(matrix);
    return newMatrix.expm1();
  };

  AbstractMatrix.prototype.floor = function floor() {
    for (var i = 0; i < this.rows; i++) {
      for (var j = 0; j < this.columns; j++) {
        this.set(i, j, Math.floor(this.get(i, j)));
      }
    }
    return this;
  };

  AbstractMatrix.floor = function floor(matrix) {
    var newMatrix = new Matrix(matrix);
    return newMatrix.floor();
  };

  AbstractMatrix.prototype.fround = function fround() {
    for (var i = 0; i < this.rows; i++) {
      for (var j = 0; j < this.columns; j++) {
        this.set(i, j, Math.fround(this.get(i, j)));
      }
    }
    return this;
  };

  AbstractMatrix.fround = function fround(matrix) {
    var newMatrix = new Matrix(matrix);
    return newMatrix.fround();
  };

  AbstractMatrix.prototype.log = function log() {
    for (var i = 0; i < this.rows; i++) {
      for (var j = 0; j < this.columns; j++) {
        this.set(i, j, Math.log(this.get(i, j)));
      }
    }
    return this;
  };

  AbstractMatrix.log = function log(matrix) {
    var newMatrix = new Matrix(matrix);
    return newMatrix.log();
  };

  AbstractMatrix.prototype.log1p = function log1p() {
    for (var i = 0; i < this.rows; i++) {
      for (var j = 0; j < this.columns; j++) {
        this.set(i, j, Math.log1p(this.get(i, j)));
      }
    }
    return this;
  };

  AbstractMatrix.log1p = function log1p(matrix) {
    var newMatrix = new Matrix(matrix);
    return newMatrix.log1p();
  };

  AbstractMatrix.prototype.log10 = function log10() {
    for (var i = 0; i < this.rows; i++) {
      for (var j = 0; j < this.columns; j++) {
        this.set(i, j, Math.log10(this.get(i, j)));
      }
    }
    return this;
  };

  AbstractMatrix.log10 = function log10(matrix) {
    var newMatrix = new Matrix(matrix);
    return newMatrix.log10();
  };

  AbstractMatrix.prototype.log2 = function log2() {
    for (var i = 0; i < this.rows; i++) {
      for (var j = 0; j < this.columns; j++) {
        this.set(i, j, Math.log2(this.get(i, j)));
      }
    }
    return this;
  };

  AbstractMatrix.log2 = function log2(matrix) {
    var newMatrix = new Matrix(matrix);
    return newMatrix.log2();
  };

  AbstractMatrix.prototype.round = function round() {
    for (var i = 0; i < this.rows; i++) {
      for (var j = 0; j < this.columns; j++) {
        this.set(i, j, Math.round(this.get(i, j)));
      }
    }
    return this;
  };

  AbstractMatrix.round = function round(matrix) {
    var newMatrix = new Matrix(matrix);
    return newMatrix.round();
  };

  AbstractMatrix.prototype.sign = function sign() {
    for (var i = 0; i < this.rows; i++) {
      for (var j = 0; j < this.columns; j++) {
        this.set(i, j, Math.sign(this.get(i, j)));
      }
    }
    return this;
  };

  AbstractMatrix.sign = function sign(matrix) {
    var newMatrix = new Matrix(matrix);
    return newMatrix.sign();
  };

  AbstractMatrix.prototype.sin = function sin() {
    for (var i = 0; i < this.rows; i++) {
      for (var j = 0; j < this.columns; j++) {
        this.set(i, j, Math.sin(this.get(i, j)));
      }
    }
    return this;
  };

  AbstractMatrix.sin = function sin(matrix) {
    var newMatrix = new Matrix(matrix);
    return newMatrix.sin();
  };

  AbstractMatrix.prototype.sinh = function sinh() {
    for (var i = 0; i < this.rows; i++) {
      for (var j = 0; j < this.columns; j++) {
        this.set(i, j, Math.sinh(this.get(i, j)));
      }
    }
    return this;
  };

  AbstractMatrix.sinh = function sinh(matrix) {
    var newMatrix = new Matrix(matrix);
    return newMatrix.sinh();
  };

  AbstractMatrix.prototype.sqrt = function sqrt() {
    for (var i = 0; i < this.rows; i++) {
      for (var j = 0; j < this.columns; j++) {
        this.set(i, j, Math.sqrt(this.get(i, j)));
      }
    }
    return this;
  };

  AbstractMatrix.sqrt = function sqrt(matrix) {
    var newMatrix = new Matrix(matrix);
    return newMatrix.sqrt();
  };

  AbstractMatrix.prototype.tan = function tan() {
    for (var i = 0; i < this.rows; i++) {
      for (var j = 0; j < this.columns; j++) {
        this.set(i, j, Math.tan(this.get(i, j)));
      }
    }
    return this;
  };

  AbstractMatrix.tan = function tan(matrix) {
    var newMatrix = new Matrix(matrix);
    return newMatrix.tan();
  };

  AbstractMatrix.prototype.tanh = function tanh() {
    for (var i = 0; i < this.rows; i++) {
      for (var j = 0; j < this.columns; j++) {
        this.set(i, j, Math.tanh(this.get(i, j)));
      }
    }
    return this;
  };

  AbstractMatrix.tanh = function tanh(matrix) {
    var newMatrix = new Matrix(matrix);
    return newMatrix.tanh();
  };

  AbstractMatrix.prototype.trunc = function trunc() {
    for (var i = 0; i < this.rows; i++) {
      for (var j = 0; j < this.columns; j++) {
        this.set(i, j, Math.trunc(this.get(i, j)));
      }
    }
    return this;
  };

  AbstractMatrix.trunc = function trunc(matrix) {
    var newMatrix = new Matrix(matrix);
    return newMatrix.trunc();
  };

  AbstractMatrix.pow = function pow(matrix, arg0) {
    var newMatrix = new Matrix(matrix);
    return newMatrix.pow(arg0);
  };

  AbstractMatrix.prototype.pow = function pow(value) {
    if (typeof value === 'number') return this.powS(value);
    return this.powM(value);
  };

  AbstractMatrix.prototype.powS = function powS(value) {
    for (var i = 0; i < this.rows; i++) {
      for (var j = 0; j < this.columns; j++) {
        this.set(i, j, Math.pow(this.get(i, j), value));
      }
    }
    return this;
  };

  AbstractMatrix.prototype.powM = function powM(matrix) {
    matrix = Matrix.checkMatrix(matrix);
    if (this.rows !== matrix.rows ||
      this.columns !== matrix.columns) {
      throw new RangeError('Matrices dimensions must be equal');
    }
    for (var i = 0; i < this.rows; i++) {
      for (var j = 0; j < this.columns; j++) {
        this.set(i, j, Math.pow(this.get(i, j), matrix.get(i, j)));
      }
    }
    return this;
  };
}

class AbstractMatrix {
  static from1DArray(newRows, newColumns, newData) {
    var length = newRows * newColumns;
    if (length !== newData.length) {
      throw new RangeError('data length does not match given dimensions');
    }
    var newMatrix = new Matrix(newRows, newColumns);
    for (var row = 0; row < newRows; row++) {
      for (var column = 0; column < newColumns; column++) {
        newMatrix.set(row, column, newData[row * newColumns + column]);
      }
    }
    return newMatrix;
  }

  static rowVector(newData) {
    var vector = new Matrix(1, newData.length);
    for (var i = 0; i < newData.length; i++) {
      vector.set(0, i, newData[i]);
    }
    return vector;
  }

  static columnVector(newData) {
    var vector = new Matrix(newData.length, 1);
    for (var i = 0; i < newData.length; i++) {
      vector.set(i, 0, newData[i]);
    }
    return vector;
  }

  static zeros(rows, columns) {
    return new Matrix(rows, columns);
  }

  static ones(rows, columns) {
    return new Matrix(rows, columns).fill(1);
  }

  static rand(rows, columns, options = {}) {
    if (typeof options !== 'object') {
      throw new TypeError('options must be an object');
    }
    const { random = Math.random } = options;
    var matrix = new Matrix(rows, columns);
    for (var i = 0; i < rows; i++) {
      for (var j = 0; j < columns; j++) {
        matrix.set(i, j, random());
      }
    }
    return matrix;
  }

  static randInt(rows, columns, options = {}) {
    if (typeof options !== 'object') {
      throw new TypeError('options must be an object');
    }
    const { min = 0, max = 1000, random = Math.random } = options;
    if (!Number.isInteger(min)) throw new TypeError('min must be an integer');
    if (!Number.isInteger(max)) throw new TypeError('max must be an integer');
    if (min >= max) throw new RangeError('min must be smaller than max');
    var interval = max - min;
    var matrix = new Matrix(rows, columns);
    for (var i = 0; i < rows; i++) {
      for (var j = 0; j < columns; j++) {
        var value = min + Math.round(random() * interval);
        matrix.set(i, j, value);
      }
    }
    return matrix;
  }

  static eye(rows, columns, value) {
    if (columns === undefined) columns = rows;
    if (value === undefined) value = 1;
    var min = Math.min(rows, columns);
    var matrix = this.zeros(rows, columns);
    for (var i = 0; i < min; i++) {
      matrix.set(i, i, value);
    }
    return matrix;
  }

  static diag(data, rows, columns) {
    var l = data.length;
    if (rows === undefined) rows = l;
    if (columns === undefined) columns = rows;
    var min = Math.min(l, rows, columns);
    var matrix = this.zeros(rows, columns);
    for (var i = 0; i < min; i++) {
      matrix.set(i, i, data[i]);
    }
    return matrix;
  }

  static min(matrix1, matrix2) {
    matrix1 = this.checkMatrix(matrix1);
    matrix2 = this.checkMatrix(matrix2);
    var rows = matrix1.rows;
    var columns = matrix1.columns;
    var result = new Matrix(rows, columns);
    for (var i = 0; i < rows; i++) {
      for (var j = 0; j < columns; j++) {
        result.set(i, j, Math.min(matrix1.get(i, j), matrix2.get(i, j)));
      }
    }
    return result;
  }

  static max(matrix1, matrix2) {
    matrix1 = this.checkMatrix(matrix1);
    matrix2 = this.checkMatrix(matrix2);
    var rows = matrix1.rows;
    var columns = matrix1.columns;
    var result = new this(rows, columns);
    for (var i = 0; i < rows; i++) {
      for (var j = 0; j < columns; j++) {
        result.set(i, j, Math.max(matrix1.get(i, j), matrix2.get(i, j)));
      }
    }
    return result;
  }

  static checkMatrix(value) {
    return AbstractMatrix.isMatrix(value) ? value : new Matrix(value);
  }

  static isMatrix(value) {
    return value != null && value.klass === 'Matrix';
  }

  get size() {
    return this.rows * this.columns;
  }

  apply(callback) {
    if (typeof callback !== 'function') {
      throw new TypeError('callback must be a function');
    }
    for (var i = 0; i < this.rows; i++) {
      for (var j = 0; j < this.columns; j++) {
        callback.call(this, i, j);
      }
    }
    return this;
  }

  to1DArray() {
    var array = [];
    for (var i = 0; i < this.rows; i++) {
      for (var j = 0; j < this.columns; j++) {
        array.push(this.get(i, j));
      }
    }
    return array;
  }

  to2DArray() {
    var copy = [];
    for (var i = 0; i < this.rows; i++) {
      copy.push([]);
      for (var j = 0; j < this.columns; j++) {
        copy[i].push(this.get(i, j));
      }
    }
    return copy;
  }

  toJSON() {
    return this.to2DArray();
  }

  isRowVector() {
    return this.rows === 1;
  }

  isColumnVector() {
    return this.columns === 1;
  }

  isVector() {
    return this.rows === 1 || this.columns === 1;
  }

  isSquare() {
    return this.rows === this.columns;
  }

  isSymmetric() {
    if (this.isSquare()) {
      for (var i = 0; i < this.rows; i++) {
        for (var j = 0; j <= i; j++) {
          if (this.get(i, j) !== this.get(j, i)) {
            return false;
          }
        }
      }
      return true;
    }
    return false;
  }

  isEchelonForm() {
    let i = 0;
    let j = 0;
    let previousColumn = -1;
    let isEchelonForm = true;
    let checked = false;
    while (i < this.rows && isEchelonForm) {
      j = 0;
      checked = false;
      while (j < this.columns && checked === false) {
        if (this.get(i, j) === 0) {
          j++;
        } else if (this.get(i, j) === 1 && j > previousColumn) {
          checked = true;
          previousColumn = j;
        } else {
          isEchelonForm = false;
          checked = true;
        }
      }
      i++;
    }
    return isEchelonForm;
  }

  isReducedEchelonForm() {
    let i = 0;
    let j = 0;
    let previousColumn = -1;
    let isReducedEchelonForm = true;
    let checked = false;
    while (i < this.rows && isReducedEchelonForm) {
      j = 0;
      checked = false;
      while (j < this.columns && checked === false) {
        if (this.get(i, j) === 0) {
          j++;
        } else if (this.get(i, j) === 1 && j > previousColumn) {
          checked = true;
          previousColumn = j;
        } else {
          isReducedEchelonForm = false;
          checked = true;
        }
      }
      for (let k = j + 1; k < this.rows; k++) {
        if (this.get(i, k) !== 0) {
          isReducedEchelonForm = false;
        }
      }
      i++;
    }
    return isReducedEchelonForm;
  }

  echelonForm() {
    let result = this.clone();
    let h = 0;
    let k = 0;
    while ((h < result.rows) && (k < result.columns)) {
      let iMax = h;
      for (let i = h; i < result.rows; i++) {
        if (result.get(i, k) > result.get(iMax, k)) {
          iMax = i;
        }
      }
      if (result.get(iMax, k) === 0) {
        k++;
      } else {
        result.swapRows(h, iMax);
        let tmp = result.get(h, k);
        for (let j = k; j < result.columns; j++) {
          result.set(h, j, result.get(h, j) / tmp);
        }
        for (let i = h + 1; i < result.rows; i++) {
          let factor = result.get(i, k) / result.get(h, k);
          result.set(i, k, 0);
          for (let j = k + 1; j < result.columns; j++) {
            result.set(i, j, result.get(i, j) - result.get(h, j) * factor);
          }
        }
        h++;
        k++;
      }
    }
    return result;
  }

  reducedEchelonForm() {
    let result = this.echelonForm();
    let m = result.columns;
    let n = result.rows;
    let h = n - 1;
    while (h >= 0) {
      if (result.maxRow(h) === 0) {
        h--;
      } else {
        let p = 0;
        let pivot = false;
        while ((p < n) && (pivot === false)) {
          if (result.get(h, p) === 1) {
            pivot = true;
          } else {
            p++;
          }
        }
        for (let i = 0; i < h; i++) {
          let factor = result.get(i, p);
          for (let j = p; j < m; j++) {
            let tmp = result.get(i, j) - factor * result.get(h, j);
            result.set(i, j, tmp);
          }
        }
        h--;
      }
    }
    return result;
  }

  set() {
    throw new Error('set method is unimplemented');
  }

  get() {
    throw new Error('get method is unimplemented');
  }

  repeat(options = {}) {
    if (typeof options !== 'object') {
      throw new TypeError('options must be an object');
    }
    const { rows = 1, columns = 1 } = options;
    if (!Number.isInteger(rows) || rows <= 0) {
      throw new TypeError('rows must be a positive integer');
    }
    if (!Number.isInteger(columns) || columns <= 0) {
      throw new TypeError('columns must be a positive integer');
    }
    var matrix = new Matrix(this.rows * rows, this.columns * columns);
    for (var i = 0; i < rows; i++) {
      for (var j = 0; j < columns; j++) {
        matrix.setSubMatrix(this, this.rows * i, this.columns * j);
      }
    }
    return matrix;
  }

  fill(value) {
    for (var i = 0; i < this.rows; i++) {
      for (var j = 0; j < this.columns; j++) {
        this.set(i, j, value);
      }
    }
    return this;
  }

  neg() {
    return this.mulS(-1);
  }

  getRow(index) {
    checkRowIndex(this, index);
    var row = [];
    for (var i = 0; i < this.columns; i++) {
      row.push(this.get(index, i));
    }
    return row;
  }

  getRowVector(index) {
    return Matrix.rowVector(this.getRow(index));
  }

  setRow(index, array) {
    checkRowIndex(this, index);
    array = checkRowVector(this, array);
    for (var i = 0; i < this.columns; i++) {
      this.set(index, i, array[i]);
    }
    return this;
  }

  swapRows(row1, row2) {
    checkRowIndex(this, row1);
    checkRowIndex(this, row2);
    for (var i = 0; i < this.columns; i++) {
      var temp = this.get(row1, i);
      this.set(row1, i, this.get(row2, i));
      this.set(row2, i, temp);
    }
    return this;
  }

  getColumn(index) {
    checkColumnIndex(this, index);
    var column = [];
    for (var i = 0; i < this.rows; i++) {
      column.push(this.get(i, index));
    }
    return column;
  }

  getColumnVector(index) {
    return Matrix.columnVector(this.getColumn(index));
  }

  setColumn(index, array) {
    checkColumnIndex(this, index);
    array = checkColumnVector(this, array);
    for (var i = 0; i < this.rows; i++) {
      this.set(i, index, array[i]);
    }
    return this;
  }

  swapColumns(column1, column2) {
    checkColumnIndex(this, column1);
    checkColumnIndex(this, column2);
    for (var i = 0; i < this.rows; i++) {
      var temp = this.get(i, column1);
      this.set(i, column1, this.get(i, column2));
      this.set(i, column2, temp);
    }
    return this;
  }

  addRowVector(vector) {
    vector = checkRowVector(this, vector);
    for (var i = 0; i < this.rows; i++) {
      for (var j = 0; j < this.columns; j++) {
        this.set(i, j, this.get(i, j) + vector[j]);
      }
    }
    return this;
  }

  subRowVector(vector) {
    vector = checkRowVector(this, vector);
    for (var i = 0; i < this.rows; i++) {
      for (var j = 0; j < this.columns; j++) {
        this.set(i, j, this.get(i, j) - vector[j]);
      }
    }
    return this;
  }

  mulRowVector(vector) {
    vector = checkRowVector(this, vector);
    for (var i = 0; i < this.rows; i++) {
      for (var j = 0; j < this.columns; j++) {
        this.set(i, j, this.get(i, j) * vector[j]);
      }
    }
    return this;
  }

  divRowVector(vector) {
    vector = checkRowVector(this, vector);
    for (var i = 0; i < this.rows; i++) {
      for (var j = 0; j < this.columns; j++) {
        this.set(i, j, this.get(i, j) / vector[j]);
      }
    }
    return this;
  }

  addColumnVector(vector) {
    vector = checkColumnVector(this, vector);
    for (var i = 0; i < this.rows; i++) {
      for (var j = 0; j < this.columns; j++) {
        this.set(i, j, this.get(i, j) + vector[i]);
      }
    }
    return this;
  }

  subColumnVector(vector) {
    vector = checkColumnVector(this, vector);
    for (var i = 0; i < this.rows; i++) {
      for (var j = 0; j < this.columns; j++) {
        this.set(i, j, this.get(i, j) - vector[i]);
      }
    }
    return this;
  }

  mulColumnVector(vector) {
    vector = checkColumnVector(this, vector);
    for (var i = 0; i < this.rows; i++) {
      for (var j = 0; j < this.columns; j++) {
        this.set(i, j, this.get(i, j) * vector[i]);
      }
    }
    return this;
  }

  divColumnVector(vector) {
    vector = checkColumnVector(this, vector);
    for (var i = 0; i < this.rows; i++) {
      for (var j = 0; j < this.columns; j++) {
        this.set(i, j, this.get(i, j) / vector[i]);
      }
    }
    return this;
  }

  mulRow(index, value) {
    checkRowIndex(this, index);
    for (var i = 0; i < this.columns; i++) {
      this.set(index, i, this.get(index, i) * value);
    }
    return this;
  }

  mulColumn(index, value) {
    checkColumnIndex(this, index);
    for (var i = 0; i < this.rows; i++) {
      this.set(i, index, this.get(i, index) * value);
    }
    return this;
  }

  max() {
    var v = this.get(0, 0);
    for (var i = 0; i < this.rows; i++) {
      for (var j = 0; j < this.columns; j++) {
        if (this.get(i, j) > v) {
          v = this.get(i, j);
        }
      }
    }
    return v;
  }

  maxIndex() {
    var v = this.get(0, 0);
    var idx = [0, 0];
    for (var i = 0; i < this.rows; i++) {
      for (var j = 0; j < this.columns; j++) {
        if (this.get(i, j) > v) {
          v = this.get(i, j);
          idx[0] = i;
          idx[1] = j;
        }
      }
    }
    return idx;
  }

  min() {
    var v = this.get(0, 0);
    for (var i = 0; i < this.rows; i++) {
      for (var j = 0; j < this.columns; j++) {
        if (this.get(i, j) < v) {
          v = this.get(i, j);
        }
      }
    }
    return v;
  }

  minIndex() {
    var v = this.get(0, 0);
    var idx = [0, 0];
    for (var i = 0; i < this.rows; i++) {
      for (var j = 0; j < this.columns; j++) {
        if (this.get(i, j) < v) {
          v = this.get(i, j);
          idx[0] = i;
          idx[1] = j;
        }
      }
    }
    return idx;
  }

  maxRow(row) {
    checkRowIndex(this, row);
    var v = this.get(row, 0);
    for (var i = 1; i < this.columns; i++) {
      if (this.get(row, i) > v) {
        v = this.get(row, i);
      }
    }
    return v;
  }

  maxRowIndex(row) {
    checkRowIndex(this, row);
    var v = this.get(row, 0);
    var idx = [row, 0];
    for (var i = 1; i < this.columns; i++) {
      if (this.get(row, i) > v) {
        v = this.get(row, i);
        idx[1] = i;
      }
    }
    return idx;
  }

  minRow(row) {
    checkRowIndex(this, row);
    var v = this.get(row, 0);
    for (var i = 1; i < this.columns; i++) {
      if (this.get(row, i) < v) {
        v = this.get(row, i);
      }
    }
    return v;
  }

  minRowIndex(row) {
    checkRowIndex(this, row);
    var v = this.get(row, 0);
    var idx = [row, 0];
    for (var i = 1; i < this.columns; i++) {
      if (this.get(row, i) < v) {
        v = this.get(row, i);
        idx[1] = i;
      }
    }
    return idx;
  }

  maxColumn(column) {
    checkColumnIndex(this, column);
    var v = this.get(0, column);
    for (var i = 1; i < this.rows; i++) {
      if (this.get(i, column) > v) {
        v = this.get(i, column);
      }
    }
    return v;
  }

  maxColumnIndex(column) {
    checkColumnIndex(this, column);
    var v = this.get(0, column);
    var idx = [0, column];
    for (var i = 1; i < this.rows; i++) {
      if (this.get(i, column) > v) {
        v = this.get(i, column);
        idx[0] = i;
      }
    }
    return idx;
  }

  minColumn(column) {
    checkColumnIndex(this, column);
    var v = this.get(0, column);
    for (var i = 1; i < this.rows; i++) {
      if (this.get(i, column) < v) {
        v = this.get(i, column);
      }
    }
    return v;
  }

  minColumnIndex(column) {
    checkColumnIndex(this, column);
    var v = this.get(0, column);
    var idx = [0, column];
    for (var i = 1; i < this.rows; i++) {
      if (this.get(i, column) < v) {
        v = this.get(i, column);
        idx[0] = i;
      }
    }
    return idx;
  }

  diag() {
    var min = Math.min(this.rows, this.columns);
    var diag = [];
    for (var i = 0; i < min; i++) {
      diag.push(this.get(i, i));
    }
    return diag;
  }

  norm(type = 'frobenius') {
    var result = 0;
    if (type === 'max') {
      return this.max();
    } else if (type === 'frobenius') {
      for (var i = 0; i < this.rows; i++) {
        for (var j = 0; j < this.columns; j++) {
          result = result + this.get(i, j) * this.get(i, j);
        }
      }
      return Math.sqrt(result);
    } else {
      throw new RangeError(`unknown norm type: ${type}`);
    }
  }

  cumulativeSum() {
    var sum = 0;
    for (var i = 0; i < this.rows; i++) {
      for (var j = 0; j < this.columns; j++) {
        sum += this.get(i, j);
        this.set(i, j, sum);
      }
    }
    return this;
  }

  dot(vector2) {
    if (AbstractMatrix.isMatrix(vector2)) vector2 = vector2.to1DArray();
    var vector1 = this.to1DArray();
    if (vector1.length !== vector2.length) {
      throw new RangeError('vectors do not have the same size');
    }
    var dot = 0;
    for (var i = 0; i < vector1.length; i++) {
      dot += vector1[i] * vector2[i];
    }
    return dot;
  }

  mmul(other) {
    other = Matrix.checkMatrix(other);

    var m = this.rows;
    var n = this.columns;
    var p = other.columns;

    var result = new Matrix(m, p);

    var Bcolj = new Float64Array(n);
    for (var j = 0; j < p; j++) {
      for (var k = 0; k < n; k++) {
        Bcolj[k] = other.get(k, j);
      }

      for (var i = 0; i < m; i++) {
        var s = 0;
        for (k = 0; k < n; k++) {
          s += this.get(i, k) * Bcolj[k];
        }

        result.set(i, j, s);
      }
    }
    return result;
  }

  strassen2x2(other) {
    other = Matrix.checkMatrix(other);
    var result = new Matrix(2, 2);
    const a11 = this.get(0, 0);
    const b11 = other.get(0, 0);
    const a12 = this.get(0, 1);
    const b12 = other.get(0, 1);
    const a21 = this.get(1, 0);
    const b21 = other.get(1, 0);
    const a22 = this.get(1, 1);
    const b22 = other.get(1, 1);

    // Compute intermediate values.
    const m1 = (a11 + a22) * (b11 + b22);
    const m2 = (a21 + a22) * b11;
    const m3 = a11 * (b12 - b22);
    const m4 = a22 * (b21 - b11);
    const m5 = (a11 + a12) * b22;
    const m6 = (a21 - a11) * (b11 + b12);
    const m7 = (a12 - a22) * (b21 + b22);

    // Combine intermediate values into the output.
    const c00 = m1 + m4 - m5 + m7;
    const c01 = m3 + m5;
    const c10 = m2 + m4;
    const c11 = m1 - m2 + m3 + m6;

    result.set(0, 0, c00);
    result.set(0, 1, c01);
    result.set(1, 0, c10);
    result.set(1, 1, c11);
    return result;
  }

  strassen3x3(other) {
    other = Matrix.checkMatrix(other);
    var result = new Matrix(3, 3);

    const a00 = this.get(0, 0);
    const a01 = this.get(0, 1);
    const a02 = this.get(0, 2);
    const a10 = this.get(1, 0);
    const a11 = this.get(1, 1);
    const a12 = this.get(1, 2);
    const a20 = this.get(2, 0);
    const a21 = this.get(2, 1);
    const a22 = this.get(2, 2);

    const b00 = other.get(0, 0);
    const b01 = other.get(0, 1);
    const b02 = other.get(0, 2);
    const b10 = other.get(1, 0);
    const b11 = other.get(1, 1);
    const b12 = other.get(1, 2);
    const b20 = other.get(2, 0);
    const b21 = other.get(2, 1);
    const b22 = other.get(2, 2);

    const m1 = (a00 + a01 + a02 - a10 - a11 - a21 - a22) * b11;
    const m2 = (a00 - a10) * (-b01 + b11);
    const m3 = a11 * (-b00 + b01 + b10 - b11 - b12 - b20 + b22);
    const m4 = (-a00 + a10 + a11) * (b00 - b01 + b11);
    const m5 = (a10 + a11) * (-b00 + b01);
    const m6 = a00 * b00;
    const m7 = (-a00 + a20 + a21) * (b00 - b02 + b12);
    const m8 = (-a00 + a20) * (b02 - b12);
    const m9 = (a20 + a21) * (-b00 + b02);
    const m10 = (a00 + a01 + a02 - a11 - a12 - a20 - a21) * b12;
    const m11 = a21 * (-b00 + b02 + b10 - b11 - b12 - b20 + b21);
    const m12 = (-a02 + a21 + a22) * (b11 + b20 - b21);
    const m13 = (a02 - a22) * (b11 - b21);
    const m14 = a02 * b20;
    const m15 = (a21 + a22) * (-b20 + b21);
    const m16 = (-a02 + a11 + a12) * (b12 + b20 - b22);
    const m17 = (a02 - a12) * (b12 - b22);
    const m18 = (a11 + a12) * (-b20 + b22);
    const m19 = a01 * b10;
    const m20 = a12 * b21;
    const m21 = a10 * b02;
    const m22 = a20 * b01;
    const m23 = a22 * b22;

    const c00 = m6 + m14 + m19;
    const c01 = m1 + m4 + m5 + m6 + m12 + m14 + m15;
    const c02 = m6 + m7 + m9 + m10 + m14 + m16 + m18;
    const c10 = m2 + m3 + m4 + m6 + m14 + m16 + m17;
    const c11 = m2 + m4 + m5 + m6 + m20;
    const c12 = m14 + m16 + m17 + m18 + m21;
    const c20 = m6 + m7 + m8 + m11 + m12 + m13 + m14;
    const c21 = m12 + m13 + m14 + m15 + m22;
    const c22 = m6 + m7 + m8 + m9 + m23;

    result.set(0, 0, c00);
    result.set(0, 1, c01);
    result.set(0, 2, c02);
    result.set(1, 0, c10);
    result.set(1, 1, c11);
    result.set(1, 2, c12);
    result.set(2, 0, c20);
    result.set(2, 1, c21);
    result.set(2, 2, c22);
    return result;
  }

  mmulStrassen(y) {
    y = Matrix.checkMatrix(y);
    var x = this.clone();
    var r1 = x.rows;
    var c1 = x.columns;
    var r2 = y.rows;
    var c2 = y.columns;
    if (c1 !== r2) {
      // eslint-disable-next-line no-console
      console.warn(
        `Multiplying ${r1} x ${c1} and ${r2} x ${c2} matrix: dimensions do not match.`
      );
    }

    // Put a matrix into the top left of a matrix of zeros.
    // `rows` and `cols` are the dimensions of the output matrix.
    function embed(mat, rows, cols) {
      var r = mat.rows;
      var c = mat.columns;
      if (r === rows && c === cols) {
        return mat;
      } else {
        var resultat = AbstractMatrix.zeros(rows, cols);
        resultat = resultat.setSubMatrix(mat, 0, 0);
        return resultat;
      }
    }

    // Make sure both matrices are the same size.
    // This is exclusively for simplicity:
    // this algorithm can be implemented with matrices of different sizes.

    var r = Math.max(r1, r2);
    var c = Math.max(c1, c2);
    x = embed(x, r, c);
    y = embed(y, r, c);

    // Our recursive multiplication function.
    function blockMult(a, b, rows, cols) {
      // For small matrices, resort to naive multiplication.
      if (rows <= 512 || cols <= 512) {
        return a.mmul(b); // a is equivalent to this
      }

      // Apply dynamic padding.
      if (rows % 2 === 1 && cols % 2 === 1) {
        a = embed(a, rows + 1, cols + 1);
        b = embed(b, rows + 1, cols + 1);
      } else if (rows % 2 === 1) {
        a = embed(a, rows + 1, cols);
        b = embed(b, rows + 1, cols);
      } else if (cols % 2 === 1) {
        a = embed(a, rows, cols + 1);
        b = embed(b, rows, cols + 1);
      }

      var halfRows = parseInt(a.rows / 2, 10);
      var halfCols = parseInt(a.columns / 2, 10);
      // Subdivide input matrices.
      var a11 = a.subMatrix(0, halfRows - 1, 0, halfCols - 1);
      var b11 = b.subMatrix(0, halfRows - 1, 0, halfCols - 1);

      var a12 = a.subMatrix(0, halfRows - 1, halfCols, a.columns - 1);
      var b12 = b.subMatrix(0, halfRows - 1, halfCols, b.columns - 1);

      var a21 = a.subMatrix(halfRows, a.rows - 1, 0, halfCols - 1);
      var b21 = b.subMatrix(halfRows, b.rows - 1, 0, halfCols - 1);

      var a22 = a.subMatrix(halfRows, a.rows - 1, halfCols, a.columns - 1);
      var b22 = b.subMatrix(halfRows, b.rows - 1, halfCols, b.columns - 1);

      // Compute intermediate values.
      var m1 = blockMult(
        AbstractMatrix.add(a11, a22),
        AbstractMatrix.add(b11, b22),
        halfRows,
        halfCols
      );
      var m2 = blockMult(AbstractMatrix.add(a21, a22), b11, halfRows, halfCols);
      var m3 = blockMult(a11, AbstractMatrix.sub(b12, b22), halfRows, halfCols);
      var m4 = blockMult(a22, AbstractMatrix.sub(b21, b11), halfRows, halfCols);
      var m5 = blockMult(AbstractMatrix.add(a11, a12), b22, halfRows, halfCols);
      var m6 = blockMult(
        AbstractMatrix.sub(a21, a11),
        AbstractMatrix.add(b11, b12),
        halfRows,
        halfCols
      );
      var m7 = blockMult(
        AbstractMatrix.sub(a12, a22),
        AbstractMatrix.add(b21, b22),
        halfRows,
        halfCols
      );

      // Combine intermediate values into the output.
      var c11 = AbstractMatrix.add(m1, m4);
      c11.sub(m5);
      c11.add(m7);
      var c12 = AbstractMatrix.add(m3, m5);
      var c21 = AbstractMatrix.add(m2, m4);
      var c22 = AbstractMatrix.sub(m1, m2);
      c22.add(m3);
      c22.add(m6);

      // Crop output to the desired size (undo dynamic padding).
      var resultat = AbstractMatrix.zeros(2 * c11.rows, 2 * c11.columns);
      resultat = resultat.setSubMatrix(c11, 0, 0);
      resultat = resultat.setSubMatrix(c12, c11.rows, 0);
      resultat = resultat.setSubMatrix(c21, 0, c11.columns);
      resultat = resultat.setSubMatrix(c22, c11.rows, c11.columns);
      return resultat.subMatrix(0, rows - 1, 0, cols - 1);
    }
    return blockMult(x, y, r, c);
  }

  scaleRows(options = {}) {
    if (typeof options !== 'object') {
      throw new TypeError('options must be an object');
    }
    const { min = 0, max = 1 } = options;
    if (!Number.isFinite(min)) throw new TypeError('min must be a number');
    if (!Number.isFinite(max)) throw new TypeError('max must be a number');
    if (min >= max) throw new RangeError('min must be smaller than max');
    var newMatrix = new Matrix(this.rows, this.columns);
    for (var i = 0; i < this.rows; i++) {
      const row = this.getRow(i);
      rescale(row, { min, max, output: row });
      newMatrix.setRow(i, row);
    }
    return newMatrix;
  }

  scaleColumns(options = {}) {
    if (typeof options !== 'object') {
      throw new TypeError('options must be an object');
    }
    const { min = 0, max = 1 } = options;
    if (!Number.isFinite(min)) throw new TypeError('min must be a number');
    if (!Number.isFinite(max)) throw new TypeError('max must be a number');
    if (min >= max) throw new RangeError('min must be smaller than max');
    var newMatrix = new Matrix(this.rows, this.columns);
    for (var i = 0; i < this.columns; i++) {
      const column = this.getColumn(i);
      rescale(column, {
        min: min,
        max: max,
        output: column
      });
      newMatrix.setColumn(i, column);
    }
    return newMatrix;
  }

  flipRows() {
    const middle = Math.ceil(this.columns / 2);
    for (var i = 0; i < this.rows; i++) {
      for (var j = 0; j < middle; j++) {
        var first = this.get(i, j);
        var last = this.get(i, this.columns - 1 - j);
        this.set(i, j, last);
        this.set(i, this.columns - 1 - j, first);
      }
    }
    return this;
  }

  flipColumns() {
    const middle = Math.ceil(this.rows / 2);
    for (var j = 0; j < this.columns; j++) {
      for (var i = 0; i < middle; i++) {
        var first = this.get(i, j);
        var last = this.get(this.rows - 1 - i, j);
        this.set(i, j, last);
        this.set(this.rows - 1 - i, j, first);
      }
    }
    return this;
  }

  kroneckerProduct(other) {
    other = Matrix.checkMatrix(other);

    var m = this.rows;
    var n = this.columns;
    var p = other.rows;
    var q = other.columns;

    var result = new Matrix(m * p, n * q);
    for (var i = 0; i < m; i++) {
      for (var j = 0; j < n; j++) {
        for (var k = 0; k < p; k++) {
          for (var l = 0; l < q; l++) {
            result.set(p * i + k, q * j + l, this.get(i, j) * other.get(k, l));
          }
        }
      }
    }
    return result;
  }

  transpose() {
    var result = new Matrix(this.columns, this.rows);
    for (var i = 0; i < this.rows; i++) {
      for (var j = 0; j < this.columns; j++) {
        result.set(j, i, this.get(i, j));
      }
    }
    return result;
  }

  sortRows(compareFunction = compareNumbers) {
    for (var i = 0; i < this.rows; i++) {
      this.setRow(i, this.getRow(i).sort(compareFunction));
    }
    return this;
  }

  sortColumns(compareFunction = compareNumbers) {
    for (var i = 0; i < this.columns; i++) {
      this.setColumn(i, this.getColumn(i).sort(compareFunction));
    }
    return this;
  }

  subMatrix(startRow, endRow, startColumn, endColumn) {
    checkRange(this, startRow, endRow, startColumn, endColumn);
    var newMatrix = new Matrix(
      endRow - startRow + 1,
      endColumn - startColumn + 1
    );
    for (var i = startRow; i <= endRow; i++) {
      for (var j = startColumn; j <= endColumn; j++) {
        newMatrix.set(i - startRow, j - startColumn, this.get(i, j));
      }
    }
    return newMatrix;
  }

  subMatrixRow(indices, startColumn, endColumn) {
    if (startColumn === undefined) startColumn = 0;
    if (endColumn === undefined) endColumn = this.columns - 1;
    if (
      startColumn > endColumn ||
      startColumn < 0 ||
      startColumn >= this.columns ||
      endColumn < 0 ||
      endColumn >= this.columns
    ) {
      throw new RangeError('Argument out of range');
    }

    var newMatrix = new Matrix(indices.length, endColumn - startColumn + 1);
    for (var i = 0; i < indices.length; i++) {
      for (var j = startColumn; j <= endColumn; j++) {
        if (indices[i] < 0 || indices[i] >= this.rows) {
          throw new RangeError(`Row index out of range: ${indices[i]}`);
        }
        newMatrix.set(i, j - startColumn, this.get(indices[i], j));
      }
    }
    return newMatrix;
  }

  subMatrixColumn(indices, startRow, endRow) {
    if (startRow === undefined) startRow = 0;
    if (endRow === undefined) endRow = this.rows - 1;
    if (
      startRow > endRow ||
      startRow < 0 ||
      startRow >= this.rows ||
      endRow < 0 ||
      endRow >= this.rows
    ) {
      throw new RangeError('Argument out of range');
    }

    var newMatrix = new Matrix(endRow - startRow + 1, indices.length);
    for (var i = 0; i < indices.length; i++) {
      for (var j = startRow; j <= endRow; j++) {
        if (indices[i] < 0 || indices[i] >= this.columns) {
          throw new RangeError(`Column index out of range: ${indices[i]}`);
        }
        newMatrix.set(j - startRow, i, this.get(j, indices[i]));
      }
    }
    return newMatrix;
  }

  setSubMatrix(matrix, startRow, startColumn) {
    matrix = Matrix.checkMatrix(matrix);
    var endRow = startRow + matrix.rows - 1;
    var endColumn = startColumn + matrix.columns - 1;
    checkRange(this, startRow, endRow, startColumn, endColumn);
    for (var i = 0; i < matrix.rows; i++) {
      for (var j = 0; j < matrix.columns; j++) {
        this.set(startRow + i, startColumn + j, matrix.get(i, j));
      }
    }
    return this;
  }

  selection(rowIndices, columnIndices) {
    var indices = checkIndices(this, rowIndices, columnIndices);
    var newMatrix = new Matrix(rowIndices.length, columnIndices.length);
    for (var i = 0; i < indices.row.length; i++) {
      var rowIndex = indices.row[i];
      for (var j = 0; j < indices.column.length; j++) {
        var columnIndex = indices.column[j];
        newMatrix.set(i, j, this.get(rowIndex, columnIndex));
      }
    }
    return newMatrix;
  }

  trace() {
    var min = Math.min(this.rows, this.columns);
    var trace = 0;
    for (var i = 0; i < min; i++) {
      trace += this.get(i, i);
    }
    return trace;
  }

  clone() {
    var newMatrix = new Matrix(this.rows, this.columns);
    for (var row = 0; row < this.rows; row++) {
      for (var column = 0; column < this.columns; column++) {
        newMatrix.set(row, column, this.get(row, column));
      }
    }
    return newMatrix;
  }

  sum(by) {
    switch (by) {
      case 'row':
        return sumByRow(this);
      case 'column':
        return sumByColumn(this);
      case undefined:
        return sumAll(this);
      default:
        throw new Error(`invalid option: ${by}`);
    }
  }

  product(by) {
    switch (by) {
      case 'row':
        return productByRow(this);
      case 'column':
        return productByColumn(this);
      case undefined:
        return productAll(this);
      default:
        throw new Error(`invalid option: ${by}`);
    }
  }

  mean(by) {
    const sum = this.sum(by);
    switch (by) {
      case 'row': {
        for (let i = 0; i < this.rows; i++) {
          sum[i] /= this.columns;
        }
        return sum;
      }
      case 'column': {
        for (let i = 0; i < this.columns; i++) {
          sum[i] /= this.rows;
        }
        return sum;
      }
      case undefined:
        return sum / this.size;
      default:
        throw new Error(`invalid option: ${by}`);
    }
  }

  variance(by, options = {}) {
    if (typeof by === 'object') {
      options = by;
      by = undefined;
    }
    if (typeof options !== 'object') {
      throw new TypeError('options must be an object');
    }
    const { unbiased = true, mean = this.mean(by) } = options;
    if (typeof unbiased !== 'boolean') {
      throw new TypeError('unbiased must be a boolean');
    }
    switch (by) {
      case 'row': {
        if (!Array.isArray(mean)) {
          throw new TypeError('mean must be an array');
        }
        return varianceByRow(this, unbiased, mean);
      }
      case 'column': {
        if (!Array.isArray(mean)) {
          throw new TypeError('mean must be an array');
        }
        return varianceByColumn(this, unbiased, mean);
      }
      case undefined: {
        if (typeof mean !== 'number') {
          throw new TypeError('mean must be a number');
        }
        return varianceAll(this, unbiased, mean);
      }
      default:
        throw new Error(`invalid option: ${by}`);
    }
  }

  standardDeviation(by, options) {
    if (typeof by === 'object') {
      options = by;
      by = undefined;
    }
    const variance = this.variance(by, options);
    if (by === undefined) {
      return Math.sqrt(variance);
    } else {
      for (var i = 0; i < variance.length; i++) {
        variance[i] = Math.sqrt(variance[i]);
      }
      return variance;
    }
  }

  center(by, options = {}) {
    if (typeof by === 'object') {
      options = by;
      by = undefined;
    }
    if (typeof options !== 'object') {
      throw new TypeError('options must be an object');
    }
    const { center = this.mean(by) } = options;
    switch (by) {
      case 'row': {
        if (!Array.isArray(center)) {
          throw new TypeError('center must be an array');
        }
        centerByRow(this, center);
        return this;
      }
      case 'column': {
        if (!Array.isArray(center)) {
          throw new TypeError('center must be an array');
        }
        centerByColumn(this, center);
        return this;
      } case undefined: {
        if (typeof center !== 'number') {
          throw new TypeError('center must be a number');
        }
        centerAll(this, center);
        return this;
      }
      default:
        throw new Error(`invalid option: ${by}`);
    }
  }

  scale(by, options = {}) {
    if (typeof by === 'object') {
      options = by;
      by = undefined;
    }
    if (typeof options !== 'object') {
      throw new TypeError('options must be an object');
    }
    let scale = options.scale;
    switch (by) {
      case 'row': {
        if (scale === undefined) {
          scale = getScaleByRow(this);
        } else if (!Array.isArray(scale)) {
          throw new TypeError('scale must be an array');
        }
        scaleByRow(this, scale);
        return this;
      }
      case 'column': {
        if (scale === undefined) {
          scale = getScaleByColumn(this);
        } else if (!Array.isArray(scale)) {
          throw new TypeError('scale must be an array');
        }
        scaleByColumn(this, scale);
        return this;
      }
      case undefined: {
        if (scale === undefined) {
          scale = getScaleAll(this);
        } else if (typeof scale !== 'number') {
          throw new TypeError('scale must be a number');
        }
        scaleAll(this, scale);
        return this;
      }
      default:
        throw new Error(`invalid option: ${by}`);
    }
  }
}

AbstractMatrix.prototype.klass = 'Matrix';
if (typeof Symbol !== 'undefined') {
  AbstractMatrix.prototype[
    Symbol.for('nodejs.util.inspect.custom')
  ] = inspectMatrix;
}

function compareNumbers(a, b) {
  return a - b;
}

// Synonyms
AbstractMatrix.random = AbstractMatrix.rand;
AbstractMatrix.randomInt = AbstractMatrix.randInt;
AbstractMatrix.diagonal = AbstractMatrix.diag;
AbstractMatrix.prototype.diagonal = AbstractMatrix.prototype.diag;
AbstractMatrix.identity = AbstractMatrix.eye;
AbstractMatrix.prototype.negate = AbstractMatrix.prototype.neg;
AbstractMatrix.prototype.tensorProduct =
  AbstractMatrix.prototype.kroneckerProduct;

class Matrix extends AbstractMatrix {
  constructor(nRows, nColumns) {
    super();
    if (Matrix.isMatrix(nRows)) {
      return nRows.clone();
    } else if (Number.isInteger(nRows) && nRows > 0) {
      // Create an empty matrix
      this.data = [];
      if (Number.isInteger(nColumns) && nColumns > 0) {
        for (let i = 0; i < nRows; i++) {
          this.data.push(new Float64Array(nColumns));
        }
      } else {
        throw new TypeError('nColumns must be a positive integer');
      }
    } else if (Array.isArray(nRows)) {
      // Copy the values from the 2D array
      const arrayData = nRows;
      nRows = arrayData.length;
      nColumns = arrayData[0].length;
      if (typeof nColumns !== 'number' || nColumns === 0) {
        throw new TypeError(
          'Data must be a 2D array with at least one element'
        );
      }
      this.data = [];
      for (let i = 0; i < nRows; i++) {
        if (arrayData[i].length !== nColumns) {
          throw new RangeError('Inconsistent array dimensions');
        }
        this.data.push(Float64Array.from(arrayData[i]));
      }
    } else {
      throw new TypeError(
        'First argument must be a positive number or an array'
      );
    }
    this.rows = nRows;
    this.columns = nColumns;
    return this;
  }

  set(rowIndex, columnIndex, value) {
    this.data[rowIndex][columnIndex] = value;
    return this;
  }

  get(rowIndex, columnIndex) {
    return this.data[rowIndex][columnIndex];
  }

  removeRow(index) {
    checkRowIndex(this, index);
    if (this.rows === 1) {
      throw new RangeError('A matrix cannot have less than one row');
    }
    this.data.splice(index, 1);
    this.rows -= 1;
    return this;
  }

  addRow(index, array) {
    if (array === undefined) {
      array = index;
      index = this.rows;
    }
    checkRowIndex(this, index, true);
    array = Float64Array.from(checkRowVector(this, array));
    this.data.splice(index, 0, array);
    this.rows += 1;
    return this;
  }

  removeColumn(index) {
    checkColumnIndex(this, index);
    if (this.columns === 1) {
      throw new RangeError('A matrix cannot have less than one column');
    }
    for (var i = 0; i < this.rows; i++) {
      const newRow = new Float64Array(this.columns - 1);
      for (let j = 0; j < index; j++) {
        newRow[j] = this.data[i][j];
      }
      for (let j = index + 1; j < this.columns; j++) {
        newRow[j - 1] = this.data[i][j];
      }
      this.data[i] = newRow;
    }
    this.columns -= 1;
    return this;
  }

  addColumn(index, array) {
    if (typeof array === 'undefined') {
      array = index;
      index = this.columns;
    }
    checkColumnIndex(this, index, true);
    array = checkColumnVector(this, array);
    for (var i = 0; i < this.rows; i++) {
      const newRow = new Float64Array(this.columns + 1);
      let j = 0;
      for (; j < index; j++) {
        newRow[j] = this.data[i][j];
      }
      newRow[j++] = array[i];
      for (; j < this.columns + 1; j++) {
        newRow[j] = this.data[i][j - 1];
      }
      this.data[i] = newRow;
    }
    this.columns += 1;
    return this;
  }
}

installMathOperations(AbstractMatrix, Matrix);

class BaseView extends AbstractMatrix {
  constructor(matrix, rows, columns) {
    super();
    this.matrix = matrix;
    this.rows = rows;
    this.columns = columns;
  }
}

class MatrixColumnView extends BaseView {
  constructor(matrix, column) {
    checkColumnIndex(matrix, column);
    super(matrix, matrix.rows, 1);
    this.column = column;
  }

  set(rowIndex, columnIndex, value) {
    this.matrix.set(rowIndex, this.column, value);
    return this;
  }

  get(rowIndex) {
    return this.matrix.get(rowIndex, this.column);
  }
}

class MatrixColumnSelectionView extends BaseView {
  constructor(matrix, columnIndices) {
    columnIndices = checkColumnIndices(matrix, columnIndices);
    super(matrix, matrix.rows, columnIndices.length);
    this.columnIndices = columnIndices;
  }

  set(rowIndex, columnIndex, value) {
    this.matrix.set(rowIndex, this.columnIndices[columnIndex], value);
    return this;
  }

  get(rowIndex, columnIndex) {
    return this.matrix.get(rowIndex, this.columnIndices[columnIndex]);
  }
}

class MatrixFlipColumnView extends BaseView {
  constructor(matrix) {
    super(matrix, matrix.rows, matrix.columns);
  }

  set(rowIndex, columnIndex, value) {
    this.matrix.set(rowIndex, this.columns - columnIndex - 1, value);
    return this;
  }

  get(rowIndex, columnIndex) {
    return this.matrix.get(rowIndex, this.columns - columnIndex - 1);
  }
}

class MatrixFlipRowView extends BaseView {
  constructor(matrix) {
    super(matrix, matrix.rows, matrix.columns);
  }

  set(rowIndex, columnIndex, value) {
    this.matrix.set(this.rows - rowIndex - 1, columnIndex, value);
    return this;
  }

  get(rowIndex, columnIndex) {
    return this.matrix.get(this.rows - rowIndex - 1, columnIndex);
  }
}

class MatrixRowView extends BaseView {
  constructor(matrix, row) {
    checkRowIndex(matrix, row);
    super(matrix, 1, matrix.columns);
    this.row = row;
  }

  set(rowIndex, columnIndex, value) {
    this.matrix.set(this.row, columnIndex, value);
    return this;
  }

  get(rowIndex, columnIndex) {
    return this.matrix.get(this.row, columnIndex);
  }
}

class MatrixRowSelectionView extends BaseView {
  constructor(matrix, rowIndices) {
    rowIndices = checkRowIndices(matrix, rowIndices);
    super(matrix, rowIndices.length, matrix.columns);
    this.rowIndices = rowIndices;
  }

  set(rowIndex, columnIndex, value) {
    this.matrix.set(this.rowIndices[rowIndex], columnIndex, value);
    return this;
  }

  get(rowIndex, columnIndex) {
    return this.matrix.get(this.rowIndices[rowIndex], columnIndex);
  }
}

class MatrixSelectionView extends BaseView {
  constructor(matrix, rowIndices, columnIndices) {
    var indices = checkIndices(matrix, rowIndices, columnIndices);
    super(matrix, indices.row.length, indices.column.length);
    this.rowIndices = indices.row;
    this.columnIndices = indices.column;
  }

  set(rowIndex, columnIndex, value) {
    this.matrix.set(
      this.rowIndices[rowIndex],
      this.columnIndices[columnIndex],
      value
    );
    return this;
  }

  get(rowIndex, columnIndex) {
    return this.matrix.get(
      this.rowIndices[rowIndex],
      this.columnIndices[columnIndex]
    );
  }
}

class MatrixSubView extends BaseView {
  constructor(matrix, startRow, endRow, startColumn, endColumn) {
    checkRange(matrix, startRow, endRow, startColumn, endColumn);
    super(matrix, endRow - startRow + 1, endColumn - startColumn + 1);
    this.startRow = startRow;
    this.startColumn = startColumn;
  }

  set(rowIndex, columnIndex, value) {
    this.matrix.set(
      this.startRow + rowIndex,
      this.startColumn + columnIndex,
      value
    );
    return this;
  }

  get(rowIndex, columnIndex) {
    return this.matrix.get(
      this.startRow + rowIndex,
      this.startColumn + columnIndex
    );
  }
}

class MatrixTransposeView extends BaseView {
  constructor(matrix) {
    super(matrix, matrix.columns, matrix.rows);
  }

  set(rowIndex, columnIndex, value) {
    this.matrix.set(columnIndex, rowIndex, value);
    return this;
  }

  get(rowIndex, columnIndex) {
    return this.matrix.get(columnIndex, rowIndex);
  }
}

class WrapperMatrix1D extends AbstractMatrix {
  constructor(data, options = {}) {
    const { rows = 1 } = options;

    if (data.length % rows !== 0) {
      throw new Error('the data length is not divisible by the number of rows');
    }
    super();
    this.rows = rows;
    this.columns = data.length / rows;
    this.data = data;
  }

  set(rowIndex, columnIndex, value) {
    var index = this._calculateIndex(rowIndex, columnIndex);
    this.data[index] = value;
    return this;
  }

  get(rowIndex, columnIndex) {
    var index = this._calculateIndex(rowIndex, columnIndex);
    return this.data[index];
  }

  _calculateIndex(row, column) {
    return row * this.columns + column;
  }
}

class WrapperMatrix2D extends AbstractMatrix {
  constructor(data) {
    super();
    this.data = data;
    this.rows = data.length;
    this.columns = data[0].length;
  }

  set(rowIndex, columnIndex, value) {
    this.data[rowIndex][columnIndex] = value;
    return this;
  }

  get(rowIndex, columnIndex) {
    return this.data[rowIndex][columnIndex];
  }
}

function wrap(array, options) {
  if (Array.isArray(array)) {
    if (array[0] && Array.isArray(array[0])) {
      return new WrapperMatrix2D(array);
    } else {
      return new WrapperMatrix1D(array, options);
    }
  } else {
    throw new Error('the argument is not an array');
  }
}

class LuDecomposition {
  constructor(matrix) {
    matrix = WrapperMatrix2D.checkMatrix(matrix);

    var lu = matrix.clone();
    var rows = lu.rows;
    var columns = lu.columns;
    var pivotVector = new Float64Array(rows);
    var pivotSign = 1;
    var i, j, k, p, s, t, v;
    var LUcolj, kmax;

    for (i = 0; i < rows; i++) {
      pivotVector[i] = i;
    }

    LUcolj = new Float64Array(rows);

    for (j = 0; j < columns; j++) {
      for (i = 0; i < rows; i++) {
        LUcolj[i] = lu.get(i, j);
      }

      for (i = 0; i < rows; i++) {
        kmax = Math.min(i, j);
        s = 0;
        for (k = 0; k < kmax; k++) {
          s += lu.get(i, k) * LUcolj[k];
        }
        LUcolj[i] -= s;
        lu.set(i, j, LUcolj[i]);
      }

      p = j;
      for (i = j + 1; i < rows; i++) {
        if (Math.abs(LUcolj[i]) > Math.abs(LUcolj[p])) {
          p = i;
        }
      }

      if (p !== j) {
        for (k = 0; k < columns; k++) {
          t = lu.get(p, k);
          lu.set(p, k, lu.get(j, k));
          lu.set(j, k, t);
        }

        v = pivotVector[p];
        pivotVector[p] = pivotVector[j];
        pivotVector[j] = v;

        pivotSign = -pivotSign;
      }

      if (j < rows && lu.get(j, j) !== 0) {
        for (i = j + 1; i < rows; i++) {
          lu.set(i, j, lu.get(i, j) / lu.get(j, j));
        }
      }
    }

    this.LU = lu;
    this.pivotVector = pivotVector;
    this.pivotSign = pivotSign;
  }

  isSingular() {
    var data = this.LU;
    var col = data.columns;
    for (var j = 0; j < col; j++) {
      if (data.get(j, j) === 0) {
        return true;
      }
    }
    return false;
  }

  solve(value) {
    value = Matrix.checkMatrix(value);

    var lu = this.LU;
    var rows = lu.rows;

    if (rows !== value.rows) {
      throw new Error('Invalid matrix dimensions');
    }
    if (this.isSingular()) {
      throw new Error('LU matrix is singular');
    }

    var count = value.columns;
    var X = value.subMatrixRow(this.pivotVector, 0, count - 1);
    var columns = lu.columns;
    var i, j, k;

    for (k = 0; k < columns; k++) {
      for (i = k + 1; i < columns; i++) {
        for (j = 0; j < count; j++) {
          X.set(i, j, X.get(i, j) - X.get(k, j) * lu.get(i, k));
        }
      }
    }
    for (k = columns - 1; k >= 0; k--) {
      for (j = 0; j < count; j++) {
        X.set(k, j, X.get(k, j) / lu.get(k, k));
      }
      for (i = 0; i < k; i++) {
        for (j = 0; j < count; j++) {
          X.set(i, j, X.get(i, j) - X.get(k, j) * lu.get(i, k));
        }
      }
    }
    return X;
  }

  get determinant() {
    var data = this.LU;
    if (!data.isSquare()) {
      throw new Error('Matrix must be square');
    }
    var determinant = this.pivotSign;
    var col = data.columns;
    for (var j = 0; j < col; j++) {
      determinant *= data.get(j, j);
    }
    return determinant;
  }

  get lowerTriangularMatrix() {
    var data = this.LU;
    var rows = data.rows;
    var columns = data.columns;
    var X = new Matrix(rows, columns);
    for (var i = 0; i < rows; i++) {
      for (var j = 0; j < columns; j++) {
        if (i > j) {
          X.set(i, j, data.get(i, j));
        } else if (i === j) {
          X.set(i, j, 1);
        } else {
          X.set(i, j, 0);
        }
      }
    }
    return X;
  }

  get upperTriangularMatrix() {
    var data = this.LU;
    var rows = data.rows;
    var columns = data.columns;
    var X = new Matrix(rows, columns);
    for (var i = 0; i < rows; i++) {
      for (var j = 0; j < columns; j++) {
        if (i <= j) {
          X.set(i, j, data.get(i, j));
        } else {
          X.set(i, j, 0);
        }
      }
    }
    return X;
  }

  get pivotPermutationVector() {
    return Array.from(this.pivotVector);
  }
}

function hypotenuse(a, b) {
  var r = 0;
  if (Math.abs(a) > Math.abs(b)) {
    r = b / a;
    return Math.abs(a) * Math.sqrt(1 + r * r);
  }
  if (b !== 0) {
    r = a / b;
    return Math.abs(b) * Math.sqrt(1 + r * r);
  }
  return 0;
}

class QrDecomposition {
  constructor(value) {
    value = WrapperMatrix2D.checkMatrix(value);

    var qr = value.clone();
    var m = value.rows;
    var n = value.columns;
    var rdiag = new Float64Array(n);
    var i, j, k, s;

    for (k = 0; k < n; k++) {
      var nrm = 0;
      for (i = k; i < m; i++) {
        nrm = hypotenuse(nrm, qr.get(i, k));
      }
      if (nrm !== 0) {
        if (qr.get(k, k) < 0) {
          nrm = -nrm;
        }
        for (i = k; i < m; i++) {
          qr.set(i, k, qr.get(i, k) / nrm);
        }
        qr.set(k, k, qr.get(k, k) + 1);
        for (j = k + 1; j < n; j++) {
          s = 0;
          for (i = k; i < m; i++) {
            s += qr.get(i, k) * qr.get(i, j);
          }
          s = -s / qr.get(k, k);
          for (i = k; i < m; i++) {
            qr.set(i, j, qr.get(i, j) + s * qr.get(i, k));
          }
        }
      }
      rdiag[k] = -nrm;
    }

    this.QR = qr;
    this.Rdiag = rdiag;
  }

  solve(value) {
    value = Matrix.checkMatrix(value);

    var qr = this.QR;
    var m = qr.rows;

    if (value.rows !== m) {
      throw new Error('Matrix row dimensions must agree');
    }
    if (!this.isFullRank()) {
      throw new Error('Matrix is rank deficient');
    }

    var count = value.columns;
    var X = value.clone();
    var n = qr.columns;
    var i, j, k, s;

    for (k = 0; k < n; k++) {
      for (j = 0; j < count; j++) {
        s = 0;
        for (i = k; i < m; i++) {
          s += qr.get(i, k) * X.get(i, j);
        }
        s = -s / qr.get(k, k);
        for (i = k; i < m; i++) {
          X.set(i, j, X.get(i, j) + s * qr.get(i, k));
        }
      }
    }
    for (k = n - 1; k >= 0; k--) {
      for (j = 0; j < count; j++) {
        X.set(k, j, X.get(k, j) / this.Rdiag[k]);
      }
      for (i = 0; i < k; i++) {
        for (j = 0; j < count; j++) {
          X.set(i, j, X.get(i, j) - X.get(k, j) * qr.get(i, k));
        }
      }
    }

    return X.subMatrix(0, n - 1, 0, count - 1);
  }

  isFullRank() {
    var columns = this.QR.columns;
    for (var i = 0; i < columns; i++) {
      if (this.Rdiag[i] === 0) {
        return false;
      }
    }
    return true;
  }

  get upperTriangularMatrix() {
    var qr = this.QR;
    var n = qr.columns;
    var X = new Matrix(n, n);
    var i, j;
    for (i = 0; i < n; i++) {
      for (j = 0; j < n; j++) {
        if (i < j) {
          X.set(i, j, qr.get(i, j));
        } else if (i === j) {
          X.set(i, j, this.Rdiag[i]);
        } else {
          X.set(i, j, 0);
        }
      }
    }
    return X;
  }

  get orthogonalMatrix() {
    var qr = this.QR;
    var rows = qr.rows;
    var columns = qr.columns;
    var X = new Matrix(rows, columns);
    var i, j, k, s;

    for (k = columns - 1; k >= 0; k--) {
      for (i = 0; i < rows; i++) {
        X.set(i, k, 0);
      }
      X.set(k, k, 1);
      for (j = k; j < columns; j++) {
        if (qr.get(k, k) !== 0) {
          s = 0;
          for (i = k; i < rows; i++) {
            s += qr.get(i, k) * X.get(i, j);
          }

          s = -s / qr[k][k];

          for (i = k; i < rows; i++) {
            X.set(i, j, X.get(i, j) + s * qr.get(i, k));
          }
        }
      }
    }
    return X;
  }
}

class SingularValueDecomposition {
  constructor(value, options = {}) {
    value = WrapperMatrix2D.checkMatrix(value);

    var m = value.rows;
    var n = value.columns;

    const {
      computeLeftSingularVectors = true,
      computeRightSingularVectors = true,
      autoTranspose = false
    } = options;

    var wantu = Boolean(computeLeftSingularVectors);
    var wantv = Boolean(computeRightSingularVectors);

    var swapped = false;
    var a;
    if (m < n) {
      if (!autoTranspose) {
        a = value.clone();
        // eslint-disable-next-line no-console
        console.warn(
          'Computing SVD on a matrix with more columns than rows. Consider enabling autoTranspose'
        );
      } else {
        a = value.transpose();
        m = a.rows;
        n = a.columns;
        swapped = true;
        var aux = wantu;
        wantu = wantv;
        wantv = aux;
      }
    } else {
      a = value.clone();
    }

    var nu = Math.min(m, n);
    var ni = Math.min(m + 1, n);
    var s = new Float64Array(ni);
    var U = new Matrix(m, nu);
    var V = new Matrix(n, n);

    var e = new Float64Array(n);
    var work = new Float64Array(m);

    var si = new Float64Array(ni);
    for (let i = 0; i < ni; i++) si[i] = i;

    var nct = Math.min(m - 1, n);
    var nrt = Math.max(0, Math.min(n - 2, m));
    var mrc = Math.max(nct, nrt);

    for (let k = 0; k < mrc; k++) {
      if (k < nct) {
        s[k] = 0;
        for (let i = k; i < m; i++) {
          s[k] = hypotenuse(s[k], a.get(i, k));
        }
        if (s[k] !== 0) {
          if (a.get(k, k) < 0) {
            s[k] = -s[k];
          }
          for (let i = k; i < m; i++) {
            a.set(i, k, a.get(i, k) / s[k]);
          }
          a.set(k, k, a.get(k, k) + 1);
        }
        s[k] = -s[k];
      }

      for (let j = k + 1; j < n; j++) {
        if (k < nct && s[k] !== 0) {
          let t = 0;
          for (let i = k; i < m; i++) {
            t += a.get(i, k) * a.get(i, j);
          }
          t = -t / a.get(k, k);
          for (let i = k; i < m; i++) {
            a.set(i, j, a.get(i, j) + t * a.get(i, k));
          }
        }
        e[j] = a.get(k, j);
      }

      if (wantu && k < nct) {
        for (let i = k; i < m; i++) {
          U.set(i, k, a.get(i, k));
        }
      }

      if (k < nrt) {
        e[k] = 0;
        for (let i = k + 1; i < n; i++) {
          e[k] = hypotenuse(e[k], e[i]);
        }
        if (e[k] !== 0) {
          if (e[k + 1] < 0) {
            e[k] = 0 - e[k];
          }
          for (let i = k + 1; i < n; i++) {
            e[i] /= e[k];
          }
          e[k + 1] += 1;
        }
        e[k] = -e[k];
        if (k + 1 < m && e[k] !== 0) {
          for (let i = k + 1; i < m; i++) {
            work[i] = 0;
          }
          for (let i = k + 1; i < m; i++) {
            for (let j = k + 1; j < n; j++) {
              work[i] += e[j] * a.get(i, j);
            }
          }
          for (let j = k + 1; j < n; j++) {
            let t = -e[j] / e[k + 1];
            for (let i = k + 1; i < m; i++) {
              a.set(i, j, a.get(i, j) + t * work[i]);
            }
          }
        }
        if (wantv) {
          for (let i = k + 1; i < n; i++) {
            V.set(i, k, e[i]);
          }
        }
      }
    }

    let p = Math.min(n, m + 1);
    if (nct < n) {
      s[nct] = a.get(nct, nct);
    }
    if (m < p) {
      s[p - 1] = 0;
    }
    if (nrt + 1 < p) {
      e[nrt] = a.get(nrt, p - 1);
    }
    e[p - 1] = 0;

    if (wantu) {
      for (let j = nct; j < nu; j++) {
        for (let i = 0; i < m; i++) {
          U.set(i, j, 0);
        }
        U.set(j, j, 1);
      }
      for (let k = nct - 1; k >= 0; k--) {
        if (s[k] !== 0) {
          for (let j = k + 1; j < nu; j++) {
            let t = 0;
            for (let i = k; i < m; i++) {
              t += U.get(i, k) * U.get(i, j);
            }
            t = -t / U.get(k, k);
            for (let i = k; i < m; i++) {
              U.set(i, j, U.get(i, j) + t * U.get(i, k));
            }
          }
          for (let i = k; i < m; i++) {
            U.set(i, k, -U.get(i, k));
          }
          U.set(k, k, 1 + U.get(k, k));
          for (let i = 0; i < k - 1; i++) {
            U.set(i, k, 0);
          }
        } else {
          for (let i = 0; i < m; i++) {
            U.set(i, k, 0);
          }
          U.set(k, k, 1);
        }
      }
    }

    if (wantv) {
      for (let k = n - 1; k >= 0; k--) {
        if (k < nrt && e[k] !== 0) {
          for (let j = k + 1; j < n; j++) {
            let t = 0;
            for (let i = k + 1; i < n; i++) {
              t += V.get(i, k) * V.get(i, j);
            }
            t = -t / V.get(k + 1, k);
            for (let i = k + 1; i < n; i++) {
              V.set(i, j, V.get(i, j) + t * V.get(i, k));
            }
          }
        }
        for (let i = 0; i < n; i++) {
          V.set(i, k, 0);
        }
        V.set(k, k, 1);
      }
    }

    var pp = p - 1;
    var eps = Number.EPSILON;
    while (p > 0) {
      let k, kase;
      for (k = p - 2; k >= -1; k--) {
        if (k === -1) {
          break;
        }
        const alpha =
          Number.MIN_VALUE + eps * Math.abs(s[k] + Math.abs(s[k + 1]));
        if (Math.abs(e[k]) <= alpha || Number.isNaN(e[k])) {
          e[k] = 0;
          break;
        }
      }
      if (k === p - 2) {
        kase = 4;
      } else {
        let ks;
        for (ks = p - 1; ks >= k; ks--) {
          if (ks === k) {
            break;
          }
          let t =
            (ks !== p ? Math.abs(e[ks]) : 0) +
            (ks !== k + 1 ? Math.abs(e[ks - 1]) : 0);
          if (Math.abs(s[ks]) <= eps * t) {
            s[ks] = 0;
            break;
          }
        }
        if (ks === k) {
          kase = 3;
        } else if (ks === p - 1) {
          kase = 1;
        } else {
          kase = 2;
          k = ks;
        }
      }

      k++;

      switch (kase) {
        case 1: {
          let f = e[p - 2];
          e[p - 2] = 0;
          for (let j = p - 2; j >= k; j--) {
            let t = hypotenuse(s[j], f);
            let cs = s[j] / t;
            let sn = f / t;
            s[j] = t;
            if (j !== k) {
              f = -sn * e[j - 1];
              e[j - 1] = cs * e[j - 1];
            }
            if (wantv) {
              for (let i = 0; i < n; i++) {
                t = cs * V.get(i, j) + sn * V.get(i, p - 1);
                V.set(i, p - 1, -sn * V.get(i, j) + cs * V.get(i, p - 1));
                V.set(i, j, t);
              }
            }
          }
          break;
        }
        case 2: {
          let f = e[k - 1];
          e[k - 1] = 0;
          for (let j = k; j < p; j++) {
            let t = hypotenuse(s[j], f);
            let cs = s[j] / t;
            let sn = f / t;
            s[j] = t;
            f = -sn * e[j];
            e[j] = cs * e[j];
            if (wantu) {
              for (let i = 0; i < m; i++) {
                t = cs * U.get(i, j) + sn * U.get(i, k - 1);
                U.set(i, k - 1, -sn * U.get(i, j) + cs * U.get(i, k - 1));
                U.set(i, j, t);
              }
            }
          }
          break;
        }
        case 3: {
          const scale = Math.max(
            Math.abs(s[p - 1]),
            Math.abs(s[p - 2]),
            Math.abs(e[p - 2]),
            Math.abs(s[k]),
            Math.abs(e[k])
          );
          const sp = s[p - 1] / scale;
          const spm1 = s[p - 2] / scale;
          const epm1 = e[p - 2] / scale;
          const sk = s[k] / scale;
          const ek = e[k] / scale;
          const b = ((spm1 + sp) * (spm1 - sp) + epm1 * epm1) / 2;
          const c = sp * epm1 * (sp * epm1);
          let shift = 0;
          if (b !== 0 || c !== 0) {
            if (b < 0) {
              shift = 0 - Math.sqrt(b * b + c);
            } else {
              shift = Math.sqrt(b * b + c);
            }
            shift = c / (b + shift);
          }
          let f = (sk + sp) * (sk - sp) + shift;
          let g = sk * ek;
          for (let j = k; j < p - 1; j++) {
            let t = hypotenuse(f, g);
            if (t === 0) t = Number.MIN_VALUE;
            let cs = f / t;
            let sn = g / t;
            if (j !== k) {
              e[j - 1] = t;
            }
            f = cs * s[j] + sn * e[j];
            e[j] = cs * e[j] - sn * s[j];
            g = sn * s[j + 1];
            s[j + 1] = cs * s[j + 1];
            if (wantv) {
              for (let i = 0; i < n; i++) {
                t = cs * V.get(i, j) + sn * V.get(i, j + 1);
                V.set(i, j + 1, -sn * V.get(i, j) + cs * V.get(i, j + 1));
                V.set(i, j, t);
              }
            }
            t = hypotenuse(f, g);
            if (t === 0) t = Number.MIN_VALUE;
            cs = f / t;
            sn = g / t;
            s[j] = t;
            f = cs * e[j] + sn * s[j + 1];
            s[j + 1] = -sn * e[j] + cs * s[j + 1];
            g = sn * e[j + 1];
            e[j + 1] = cs * e[j + 1];
            if (wantu && j < m - 1) {
              for (let i = 0; i < m; i++) {
                t = cs * U.get(i, j) + sn * U.get(i, j + 1);
                U.set(i, j + 1, -sn * U.get(i, j) + cs * U.get(i, j + 1));
                U.set(i, j, t);
              }
            }
          }
          e[p - 2] = f;
          break;
        }
        case 4: {
          if (s[k] <= 0) {
            s[k] = s[k] < 0 ? -s[k] : 0;
            if (wantv) {
              for (let i = 0; i <= pp; i++) {
                V.set(i, k, -V.get(i, k));
              }
            }
          }
          while (k < pp) {
            if (s[k] >= s[k + 1]) {
              break;
            }
            let t = s[k];
            s[k] = s[k + 1];
            s[k + 1] = t;
            if (wantv && k < n - 1) {
              for (let i = 0; i < n; i++) {
                t = V.get(i, k + 1);
                V.set(i, k + 1, V.get(i, k));
                V.set(i, k, t);
              }
            }
            if (wantu && k < m - 1) {
              for (let i = 0; i < m; i++) {
                t = U.get(i, k + 1);
                U.set(i, k + 1, U.get(i, k));
                U.set(i, k, t);
              }
            }
            k++;
          }
          p--;
          break;
        }
        // no default
      }
    }

    if (swapped) {
      var tmp = V;
      V = U;
      U = tmp;
    }

    this.m = m;
    this.n = n;
    this.s = s;
    this.U = U;
    this.V = V;
  }

  solve(value) {
    var Y = value;
    var e = this.threshold;
    var scols = this.s.length;
    var Ls = Matrix.zeros(scols, scols);

    for (let i = 0; i < scols; i++) {
      if (Math.abs(this.s[i]) <= e) {
        Ls.set(i, i, 0);
      } else {
        Ls.set(i, i, 1 / this.s[i]);
      }
    }

    var U = this.U;
    var V = this.rightSingularVectors;

    var VL = V.mmul(Ls);
    var vrows = V.rows;
    var urows = U.rows;
    var VLU = Matrix.zeros(vrows, urows);

    for (let i = 0; i < vrows; i++) {
      for (let j = 0; j < urows; j++) {
        let sum = 0;
        for (let k = 0; k < scols; k++) {
          sum += VL.get(i, k) * U.get(j, k);
        }
        VLU.set(i, j, sum);
      }
    }

    return VLU.mmul(Y);
  }

  solveForDiagonal(value) {
    return this.solve(Matrix.diag(value));
  }

  inverse() {
    var V = this.V;
    var e = this.threshold;
    var vrows = V.rows;
    var vcols = V.columns;
    var X = new Matrix(vrows, this.s.length);

    for (let i = 0; i < vrows; i++) {
      for (let j = 0; j < vcols; j++) {
        if (Math.abs(this.s[j]) > e) {
          X.set(i, j, V.get(i, j) / this.s[j]);
        }
      }
    }

    var U = this.U;

    var urows = U.rows;
    var ucols = U.columns;
    var Y = new Matrix(vrows, urows);

    for (let i = 0; i < vrows; i++) {
      for (let j = 0; j < urows; j++) {
        let sum = 0;
        for (let k = 0; k < ucols; k++) {
          sum += X.get(i, k) * U.get(j, k);
        }
        Y.set(i, j, sum);
      }
    }

    return Y;
  }

  get condition() {
    return this.s[0] / this.s[Math.min(this.m, this.n) - 1];
  }

  get norm2() {
    return this.s[0];
  }

  get rank() {
    var tol = Math.max(this.m, this.n) * this.s[0] * Number.EPSILON;
    var r = 0;
    var s = this.s;
    for (var i = 0, ii = s.length; i < ii; i++) {
      if (s[i] > tol) {
        r++;
      }
    }
    return r;
  }

  get diagonal() {
    return Array.from(this.s);
  }

  get threshold() {
    return (Number.EPSILON / 2) * Math.max(this.m, this.n) * this.s[0];
  }

  get leftSingularVectors() {
    return this.U;
  }

  get rightSingularVectors() {
    return this.V;
  }

  get diagonalMatrix() {
    return Matrix.diag(this.s);
  }
}

function inverse(matrix, useSVD = false) {
  matrix = WrapperMatrix2D.checkMatrix(matrix);
  if (useSVD) {
    return new SingularValueDecomposition(matrix).inverse();
  } else {
    return solve(matrix, Matrix.eye(matrix.rows));
  }
}

function solve(leftHandSide, rightHandSide, useSVD = false) {
  leftHandSide = WrapperMatrix2D.checkMatrix(leftHandSide);
  rightHandSide = WrapperMatrix2D.checkMatrix(rightHandSide);
  if (useSVD) {
    return new SingularValueDecomposition(leftHandSide).solve(rightHandSide);
  } else {
    return leftHandSide.isSquare()
      ? new LuDecomposition(leftHandSide).solve(rightHandSide)
      : new QrDecomposition(leftHandSide).solve(rightHandSide);
  }
}

function determinant(matrix) {
  matrix = Matrix.checkMatrix(matrix);
  if (matrix.isSquare()) {
    var a, b, c, d;
    if (matrix.columns === 2) {
      // 2 x 2 matrix
      a = matrix.get(0, 0);
      b = matrix.get(0, 1);
      c = matrix.get(1, 0);
      d = matrix.get(1, 1);

      return a * d - b * c;
    } else if (matrix.columns === 3) {
      // 3 x 3 matrix
      var subMatrix0, subMatrix1, subMatrix2;
      subMatrix0 = new MatrixSelectionView(matrix, [1, 2], [1, 2]);
      subMatrix1 = new MatrixSelectionView(matrix, [1, 2], [0, 2]);
      subMatrix2 = new MatrixSelectionView(matrix, [1, 2], [0, 1]);
      a = matrix.get(0, 0);
      b = matrix.get(0, 1);
      c = matrix.get(0, 2);

      return (
        a * determinant(subMatrix0) -
        b * determinant(subMatrix1) +
        c * determinant(subMatrix2)
      );
    } else {
      // general purpose determinant using the LU decomposition
      return new LuDecomposition(matrix).determinant;
    }
  } else {
    throw Error('determinant can only be calculated for a square matrix');
  }
}

function xrange(n, exception) {
  var range = [];
  for (var i = 0; i < n; i++) {
    if (i !== exception) {
      range.push(i);
    }
  }
  return range;
}

function dependenciesOneRow(
  error,
  matrix,
  index,
  thresholdValue = 10e-10,
  thresholdError = 10e-10
) {
  if (error > thresholdError) {
    return new Array(matrix.rows + 1).fill(0);
  } else {
    var returnArray = matrix.addRow(index, [0]);
    for (var i = 0; i < returnArray.rows; i++) {
      if (Math.abs(returnArray.get(i, 0)) < thresholdValue) {
        returnArray.set(i, 0, 0);
      }
    }
    return returnArray.to1DArray();
  }
}

function linearDependencies(matrix, options = {}) {
  const { thresholdValue = 10e-10, thresholdError = 10e-10 } = options;
  matrix = Matrix.checkMatrix(matrix);

  var n = matrix.rows;
  var results = new Matrix(n, n);

  for (var i = 0; i < n; i++) {
    var b = Matrix.columnVector(matrix.getRow(i));
    var Abis = matrix.subMatrixRow(xrange(n, i)).transpose();
    var svd = new SingularValueDecomposition(Abis);
    var x = svd.solve(b);
    var error = Matrix.sub(b, Abis.mmul(x))
      .abs()
      .max();
    results.setRow(
      i,
      dependenciesOneRow(error, x, i, thresholdValue, thresholdError)
    );
  }
  return results;
}

function pseudoInverse(matrix, threshold = Number.EPSILON) {
  matrix = Matrix.checkMatrix(matrix);
  var svdSolution = new SingularValueDecomposition(matrix, { autoTranspose: true });

  var U = svdSolution.leftSingularVectors;
  var V = svdSolution.rightSingularVectors;
  var s = svdSolution.diagonal;

  for (var i = 0; i < s.length; i++) {
    if (Math.abs(s[i]) > threshold) {
      s[i] = 1.0 / s[i];
    } else {
      s[i] = 0.0;
    }
  }

  return V.mmul(Matrix.diag(s).mmul(U.transpose()));
}

function covariance(xMatrix, yMatrix = xMatrix, options = {}) {
  xMatrix = Matrix.checkMatrix(xMatrix);
  let yIsSame = false;
  if (typeof yMatrix === 'object' && !Matrix.isMatrix(yMatrix) && !Array.isArray(yMatrix)) {
    options = yMatrix;
    yMatrix = xMatrix;
    yIsSame = true;
  } else {
    yMatrix = Matrix.checkMatrix(yMatrix);
  }
  if (xMatrix.rows !== yMatrix.rows) {
    throw new TypeError('Both matrices must have the same number of rows');
  }
  const { center = true } = options;
  if (center) {
    xMatrix = xMatrix.center('column');
    if (!yIsSame) {
      yMatrix = yMatrix.center('column');
    }
  }
  const covariance = xMatrix.transpose().mmul(yMatrix);
  for (let i = 0; i < covariance.rows; i++) {
    for (let j = 0; j < covariance.columns; j++) {
      covariance.set(i, j, covariance.get(i, j) * (1 / (xMatrix.rows - 1)));
    }
  }
  return covariance;
}

function correlation(xMatrix, yMatrix = xMatrix, options = {}) {
  xMatrix = Matrix.checkMatrix(xMatrix);
  let yIsSame = false;
  if (typeof yMatrix === 'object' && !Matrix.isMatrix(yMatrix) && !Array.isArray(yMatrix)) {
    options = yMatrix;
    yMatrix = xMatrix;
    yIsSame = true;
  } else {
    yMatrix = Matrix.checkMatrix(yMatrix);
  }
  if (xMatrix.rows !== yMatrix.rows) {
    throw new TypeError('Both matrices must have the same number of rows');
  }

  const { center = true, scale = true } = options;
  if (center) {
    xMatrix.center('column');
    if (!yIsSame) {
      yMatrix.center('column');
    }
  }
  if (scale) {
    xMatrix.scale('column');
    if (!yIsSame) {
      yMatrix.scale('column');
    }
  }

  const sdx = xMatrix.standardDeviation('column', { unbiased: true });
  const sdy = yIsSame ? sdx : yMatrix.standardDeviation('column', { unbiased: true });

  const correlation = xMatrix.transpose().mmul(yMatrix);
  for (let i = 0; i < correlation.rows; i++) {
    for (let j = 0; j < correlation.columns; j++) {
      correlation.set(i, j, correlation.get(i, j) * (1 / (sdx[i] * sdy[j])) * (1 / (xMatrix.rows - 1)));
    }
  }
  return correlation;
}

class EigenvalueDecomposition {
  constructor(matrix, options = {}) {
    const { assumeSymmetric = false } = options;

    matrix = WrapperMatrix2D.checkMatrix(matrix);
    if (!matrix.isSquare()) {
      throw new Error('Matrix is not a square matrix');
    }

    var n = matrix.columns;
    var V = new Matrix(n, n);
    var d = new Float64Array(n);
    var e = new Float64Array(n);
    var value = matrix;
    var i, j;

    var isSymmetric = false;
    if (assumeSymmetric) {
      isSymmetric = true;
    } else {
      isSymmetric = matrix.isSymmetric();
    }

    if (isSymmetric) {
      for (i = 0; i < n; i++) {
        for (j = 0; j < n; j++) {
          V.set(i, j, value.get(i, j));
        }
      }
      tred2(n, e, d, V);
      tql2(n, e, d, V);
    } else {
      var H = new Matrix(n, n);
      var ort = new Float64Array(n);
      for (j = 0; j < n; j++) {
        for (i = 0; i < n; i++) {
          H.set(i, j, value.get(i, j));
        }
      }
      orthes(n, H, ort, V);
      hqr2(n, e, d, V, H);
    }

    this.n = n;
    this.e = e;
    this.d = d;
    this.V = V;
  }

  get realEigenvalues() {
    return Array.from(this.d);
  }

  get imaginaryEigenvalues() {
    return Array.from(this.e);
  }

  get eigenvectorMatrix() {
    return this.V;
  }

  get diagonalMatrix() {
    var n = this.n;
    var e = this.e;
    var d = this.d;
    var X = new Matrix(n, n);
    var i, j;
    for (i = 0; i < n; i++) {
      for (j = 0; j < n; j++) {
        X.set(i, j, 0);
      }
      X.set(i, i, d[i]);
      if (e[i] > 0) {
        X.set(i, i + 1, e[i]);
      } else if (e[i] < 0) {
        X.set(i, i - 1, e[i]);
      }
    }
    return X;
  }
}

function tred2(n, e, d, V) {
  var f, g, h, i, j, k, hh, scale;

  for (j = 0; j < n; j++) {
    d[j] = V.get(n - 1, j);
  }

  for (i = n - 1; i > 0; i--) {
    scale = 0;
    h = 0;
    for (k = 0; k < i; k++) {
      scale = scale + Math.abs(d[k]);
    }

    if (scale === 0) {
      e[i] = d[i - 1];
      for (j = 0; j < i; j++) {
        d[j] = V.get(i - 1, j);
        V.set(i, j, 0);
        V.set(j, i, 0);
      }
    } else {
      for (k = 0; k < i; k++) {
        d[k] /= scale;
        h += d[k] * d[k];
      }

      f = d[i - 1];
      g = Math.sqrt(h);
      if (f > 0) {
        g = -g;
      }

      e[i] = scale * g;
      h = h - f * g;
      d[i - 1] = f - g;
      for (j = 0; j < i; j++) {
        e[j] = 0;
      }

      for (j = 0; j < i; j++) {
        f = d[j];
        V.set(j, i, f);
        g = e[j] + V.get(j, j) * f;
        for (k = j + 1; k <= i - 1; k++) {
          g += V.get(k, j) * d[k];
          e[k] += V.get(k, j) * f;
        }
        e[j] = g;
      }

      f = 0;
      for (j = 0; j < i; j++) {
        e[j] /= h;
        f += e[j] * d[j];
      }

      hh = f / (h + h);
      for (j = 0; j < i; j++) {
        e[j] -= hh * d[j];
      }

      for (j = 0; j < i; j++) {
        f = d[j];
        g = e[j];
        for (k = j; k <= i - 1; k++) {
          V.set(k, j, V.get(k, j) - (f * e[k] + g * d[k]));
        }
        d[j] = V.get(i - 1, j);
        V.set(i, j, 0);
      }
    }
    d[i] = h;
  }

  for (i = 0; i < n - 1; i++) {
    V.set(n - 1, i, V.get(i, i));
    V.set(i, i, 1);
    h = d[i + 1];
    if (h !== 0) {
      for (k = 0; k <= i; k++) {
        d[k] = V.get(k, i + 1) / h;
      }

      for (j = 0; j <= i; j++) {
        g = 0;
        for (k = 0; k <= i; k++) {
          g += V.get(k, i + 1) * V.get(k, j);
        }
        for (k = 0; k <= i; k++) {
          V.set(k, j, V.get(k, j) - g * d[k]);
        }
      }
    }

    for (k = 0; k <= i; k++) {
      V.set(k, i + 1, 0);
    }
  }

  for (j = 0; j < n; j++) {
    d[j] = V.get(n - 1, j);
    V.set(n - 1, j, 0);
  }

  V.set(n - 1, n - 1, 1);
  e[0] = 0;
}

function tql2(n, e, d, V) {
  var g, h, i, j, k, l, m, p, r, dl1, c, c2, c3, el1, s, s2;

  for (i = 1; i < n; i++) {
    e[i - 1] = e[i];
  }

  e[n - 1] = 0;

  var f = 0;
  var tst1 = 0;
  var eps = Number.EPSILON;

  for (l = 0; l < n; l++) {
    tst1 = Math.max(tst1, Math.abs(d[l]) + Math.abs(e[l]));
    m = l;
    while (m < n) {
      if (Math.abs(e[m]) <= eps * tst1) {
        break;
      }
      m++;
    }

    if (m > l) {
      do {

        g = d[l];
        p = (d[l + 1] - g) / (2 * e[l]);
        r = hypotenuse(p, 1);
        if (p < 0) {
          r = -r;
        }

        d[l] = e[l] / (p + r);
        d[l + 1] = e[l] * (p + r);
        dl1 = d[l + 1];
        h = g - d[l];
        for (i = l + 2; i < n; i++) {
          d[i] -= h;
        }

        f = f + h;

        p = d[m];
        c = 1;
        c2 = c;
        c3 = c;
        el1 = e[l + 1];
        s = 0;
        s2 = 0;
        for (i = m - 1; i >= l; i--) {
          c3 = c2;
          c2 = c;
          s2 = s;
          g = c * e[i];
          h = c * p;
          r = hypotenuse(p, e[i]);
          e[i + 1] = s * r;
          s = e[i] / r;
          c = p / r;
          p = c * d[i] - s * g;
          d[i + 1] = h + s * (c * g + s * d[i]);

          for (k = 0; k < n; k++) {
            h = V.get(k, i + 1);
            V.set(k, i + 1, s * V.get(k, i) + c * h);
            V.set(k, i, c * V.get(k, i) - s * h);
          }
        }

        p = (-s * s2 * c3 * el1 * e[l]) / dl1;
        e[l] = s * p;
        d[l] = c * p;
      } while (Math.abs(e[l]) > eps * tst1);
    }
    d[l] = d[l] + f;
    e[l] = 0;
  }

  for (i = 0; i < n - 1; i++) {
    k = i;
    p = d[i];
    for (j = i + 1; j < n; j++) {
      if (d[j] < p) {
        k = j;
        p = d[j];
      }
    }

    if (k !== i) {
      d[k] = d[i];
      d[i] = p;
      for (j = 0; j < n; j++) {
        p = V.get(j, i);
        V.set(j, i, V.get(j, k));
        V.set(j, k, p);
      }
    }
  }
}

function orthes(n, H, ort, V) {
  var low = 0;
  var high = n - 1;
  var f, g, h, i, j, m;
  var scale;

  for (m = low + 1; m <= high - 1; m++) {
    scale = 0;
    for (i = m; i <= high; i++) {
      scale = scale + Math.abs(H.get(i, m - 1));
    }

    if (scale !== 0) {
      h = 0;
      for (i = high; i >= m; i--) {
        ort[i] = H.get(i, m - 1) / scale;
        h += ort[i] * ort[i];
      }

      g = Math.sqrt(h);
      if (ort[m] > 0) {
        g = -g;
      }

      h = h - ort[m] * g;
      ort[m] = ort[m] - g;

      for (j = m; j < n; j++) {
        f = 0;
        for (i = high; i >= m; i--) {
          f += ort[i] * H.get(i, j);
        }

        f = f / h;
        for (i = m; i <= high; i++) {
          H.set(i, j, H.get(i, j) - f * ort[i]);
        }
      }

      for (i = 0; i <= high; i++) {
        f = 0;
        for (j = high; j >= m; j--) {
          f += ort[j] * H.get(i, j);
        }

        f = f / h;
        for (j = m; j <= high; j++) {
          H.set(i, j, H.get(i, j) - f * ort[j]);
        }
      }

      ort[m] = scale * ort[m];
      H.set(m, m - 1, scale * g);
    }
  }

  for (i = 0; i < n; i++) {
    for (j = 0; j < n; j++) {
      V.set(i, j, i === j ? 1 : 0);
    }
  }

  for (m = high - 1; m >= low + 1; m--) {
    if (H.get(m, m - 1) !== 0) {
      for (i = m + 1; i <= high; i++) {
        ort[i] = H.get(i, m - 1);
      }

      for (j = m; j <= high; j++) {
        g = 0;
        for (i = m; i <= high; i++) {
          g += ort[i] * V.get(i, j);
        }

        g = g / ort[m] / H.get(m, m - 1);
        for (i = m; i <= high; i++) {
          V.set(i, j, V.get(i, j) + g * ort[i]);
        }
      }
    }
  }
}

function hqr2(nn, e, d, V, H) {
  var n = nn - 1;
  var low = 0;
  var high = nn - 1;
  var eps = Number.EPSILON;
  var exshift = 0;
  var norm = 0;
  var p = 0;
  var q = 0;
  var r = 0;
  var s = 0;
  var z = 0;
  var iter = 0;
  var i, j, k, l, m, t, w, x, y;
  var ra, sa, vr, vi;
  var notlast, cdivres;

  for (i = 0; i < nn; i++) {
    if (i < low || i > high) {
      d[i] = H.get(i, i);
      e[i] = 0;
    }

    for (j = Math.max(i - 1, 0); j < nn; j++) {
      norm = norm + Math.abs(H.get(i, j));
    }
  }

  while (n >= low) {
    l = n;
    while (l > low) {
      s = Math.abs(H.get(l - 1, l - 1)) + Math.abs(H.get(l, l));
      if (s === 0) {
        s = norm;
      }
      if (Math.abs(H.get(l, l - 1)) < eps * s) {
        break;
      }
      l--;
    }

    if (l === n) {
      H.set(n, n, H.get(n, n) + exshift);
      d[n] = H.get(n, n);
      e[n] = 0;
      n--;
      iter = 0;
    } else if (l === n - 1) {
      w = H.get(n, n - 1) * H.get(n - 1, n);
      p = (H.get(n - 1, n - 1) - H.get(n, n)) / 2;
      q = p * p + w;
      z = Math.sqrt(Math.abs(q));
      H.set(n, n, H.get(n, n) + exshift);
      H.set(n - 1, n - 1, H.get(n - 1, n - 1) + exshift);
      x = H.get(n, n);

      if (q >= 0) {
        z = p >= 0 ? p + z : p - z;
        d[n - 1] = x + z;
        d[n] = d[n - 1];
        if (z !== 0) {
          d[n] = x - w / z;
        }
        e[n - 1] = 0;
        e[n] = 0;
        x = H.get(n, n - 1);
        s = Math.abs(x) + Math.abs(z);
        p = x / s;
        q = z / s;
        r = Math.sqrt(p * p + q * q);
        p = p / r;
        q = q / r;

        for (j = n - 1; j < nn; j++) {
          z = H.get(n - 1, j);
          H.set(n - 1, j, q * z + p * H.get(n, j));
          H.set(n, j, q * H.get(n, j) - p * z);
        }

        for (i = 0; i <= n; i++) {
          z = H.get(i, n - 1);
          H.set(i, n - 1, q * z + p * H.get(i, n));
          H.set(i, n, q * H.get(i, n) - p * z);
        }

        for (i = low; i <= high; i++) {
          z = V.get(i, n - 1);
          V.set(i, n - 1, q * z + p * V.get(i, n));
          V.set(i, n, q * V.get(i, n) - p * z);
        }
      } else {
        d[n - 1] = x + p;
        d[n] = x + p;
        e[n - 1] = z;
        e[n] = -z;
      }

      n = n - 2;
      iter = 0;
    } else {
      x = H.get(n, n);
      y = 0;
      w = 0;
      if (l < n) {
        y = H.get(n - 1, n - 1);
        w = H.get(n, n - 1) * H.get(n - 1, n);
      }

      if (iter === 10) {
        exshift += x;
        for (i = low; i <= n; i++) {
          H.set(i, i, H.get(i, i) - x);
        }
        s = Math.abs(H.get(n, n - 1)) + Math.abs(H.get(n - 1, n - 2));
        x = y = 0.75 * s;
        w = -0.4375 * s * s;
      }

      if (iter === 30) {
        s = (y - x) / 2;
        s = s * s + w;
        if (s > 0) {
          s = Math.sqrt(s);
          if (y < x) {
            s = -s;
          }
          s = x - w / ((y - x) / 2 + s);
          for (i = low; i <= n; i++) {
            H.set(i, i, H.get(i, i) - s);
          }
          exshift += s;
          x = y = w = 0.964;
        }
      }

      iter = iter + 1;

      m = n - 2;
      while (m >= l) {
        z = H.get(m, m);
        r = x - z;
        s = y - z;
        p = (r * s - w) / H.get(m + 1, m) + H.get(m, m + 1);
        q = H.get(m + 1, m + 1) - z - r - s;
        r = H.get(m + 2, m + 1);
        s = Math.abs(p) + Math.abs(q) + Math.abs(r);
        p = p / s;
        q = q / s;
        r = r / s;
        if (m === l) {
          break;
        }
        if (
          Math.abs(H.get(m, m - 1)) * (Math.abs(q) + Math.abs(r)) <
          eps *
            (Math.abs(p) *
              (Math.abs(H.get(m - 1, m - 1)) +
                Math.abs(z) +
                Math.abs(H.get(m + 1, m + 1))))
        ) {
          break;
        }
        m--;
      }

      for (i = m + 2; i <= n; i++) {
        H.set(i, i - 2, 0);
        if (i > m + 2) {
          H.set(i, i - 3, 0);
        }
      }

      for (k = m; k <= n - 1; k++) {
        notlast = k !== n - 1;
        if (k !== m) {
          p = H.get(k, k - 1);
          q = H.get(k + 1, k - 1);
          r = notlast ? H.get(k + 2, k - 1) : 0;
          x = Math.abs(p) + Math.abs(q) + Math.abs(r);
          if (x !== 0) {
            p = p / x;
            q = q / x;
            r = r / x;
          }
        }

        if (x === 0) {
          break;
        }

        s = Math.sqrt(p * p + q * q + r * r);
        if (p < 0) {
          s = -s;
        }

        if (s !== 0) {
          if (k !== m) {
            H.set(k, k - 1, -s * x);
          } else if (l !== m) {
            H.set(k, k - 1, -H.get(k, k - 1));
          }

          p = p + s;
          x = p / s;
          y = q / s;
          z = r / s;
          q = q / p;
          r = r / p;

          for (j = k; j < nn; j++) {
            p = H.get(k, j) + q * H.get(k + 1, j);
            if (notlast) {
              p = p + r * H.get(k + 2, j);
              H.set(k + 2, j, H.get(k + 2, j) - p * z);
            }

            H.set(k, j, H.get(k, j) - p * x);
            H.set(k + 1, j, H.get(k + 1, j) - p * y);
          }

          for (i = 0; i <= Math.min(n, k + 3); i++) {
            p = x * H.get(i, k) + y * H.get(i, k + 1);
            if (notlast) {
              p = p + z * H.get(i, k + 2);
              H.set(i, k + 2, H.get(i, k + 2) - p * r);
            }

            H.set(i, k, H.get(i, k) - p);
            H.set(i, k + 1, H.get(i, k + 1) - p * q);
          }

          for (i = low; i <= high; i++) {
            p = x * V.get(i, k) + y * V.get(i, k + 1);
            if (notlast) {
              p = p + z * V.get(i, k + 2);
              V.set(i, k + 2, V.get(i, k + 2) - p * r);
            }

            V.set(i, k, V.get(i, k) - p);
            V.set(i, k + 1, V.get(i, k + 1) - p * q);
          }
        }
      }
    }
  }

  if (norm === 0) {
    return;
  }

  for (n = nn - 1; n >= 0; n--) {
    p = d[n];
    q = e[n];

    if (q === 0) {
      l = n;
      H.set(n, n, 1);
      for (i = n - 1; i >= 0; i--) {
        w = H.get(i, i) - p;
        r = 0;
        for (j = l; j <= n; j++) {
          r = r + H.get(i, j) * H.get(j, n);
        }

        if (e[i] < 0) {
          z = w;
          s = r;
        } else {
          l = i;
          if (e[i] === 0) {
            H.set(i, n, w !== 0 ? -r / w : -r / (eps * norm));
          } else {
            x = H.get(i, i + 1);
            y = H.get(i + 1, i);
            q = (d[i] - p) * (d[i] - p) + e[i] * e[i];
            t = (x * s - z * r) / q;
            H.set(i, n, t);
            H.set(
              i + 1,
              n,
              Math.abs(x) > Math.abs(z) ? (-r - w * t) / x : (-s - y * t) / z
            );
          }

          t = Math.abs(H.get(i, n));
          if (eps * t * t > 1) {
            for (j = i; j <= n; j++) {
              H.set(j, n, H.get(j, n) / t);
            }
          }
        }
      }
    } else if (q < 0) {
      l = n - 1;

      if (Math.abs(H.get(n, n - 1)) > Math.abs(H.get(n - 1, n))) {
        H.set(n - 1, n - 1, q / H.get(n, n - 1));
        H.set(n - 1, n, -(H.get(n, n) - p) / H.get(n, n - 1));
      } else {
        cdivres = cdiv(0, -H.get(n - 1, n), H.get(n - 1, n - 1) - p, q);
        H.set(n - 1, n - 1, cdivres[0]);
        H.set(n - 1, n, cdivres[1]);
      }

      H.set(n, n - 1, 0);
      H.set(n, n, 1);
      for (i = n - 2; i >= 0; i--) {
        ra = 0;
        sa = 0;
        for (j = l; j <= n; j++) {
          ra = ra + H.get(i, j) * H.get(j, n - 1);
          sa = sa + H.get(i, j) * H.get(j, n);
        }

        w = H.get(i, i) - p;

        if (e[i] < 0) {
          z = w;
          r = ra;
          s = sa;
        } else {
          l = i;
          if (e[i] === 0) {
            cdivres = cdiv(-ra, -sa, w, q);
            H.set(i, n - 1, cdivres[0]);
            H.set(i, n, cdivres[1]);
          } else {
            x = H.get(i, i + 1);
            y = H.get(i + 1, i);
            vr = (d[i] - p) * (d[i] - p) + e[i] * e[i] - q * q;
            vi = (d[i] - p) * 2 * q;
            if (vr === 0 && vi === 0) {
              vr =
                eps *
                norm *
                (Math.abs(w) +
                  Math.abs(q) +
                  Math.abs(x) +
                  Math.abs(y) +
                  Math.abs(z));
            }
            cdivres = cdiv(
              x * r - z * ra + q * sa,
              x * s - z * sa - q * ra,
              vr,
              vi
            );
            H.set(i, n - 1, cdivres[0]);
            H.set(i, n, cdivres[1]);
            if (Math.abs(x) > Math.abs(z) + Math.abs(q)) {
              H.set(
                i + 1,
                n - 1,
                (-ra - w * H.get(i, n - 1) + q * H.get(i, n)) / x
              );
              H.set(
                i + 1,
                n,
                (-sa - w * H.get(i, n) - q * H.get(i, n - 1)) / x
              );
            } else {
              cdivres = cdiv(
                -r - y * H.get(i, n - 1),
                -s - y * H.get(i, n),
                z,
                q
              );
              H.set(i + 1, n - 1, cdivres[0]);
              H.set(i + 1, n, cdivres[1]);
            }
          }

          t = Math.max(Math.abs(H.get(i, n - 1)), Math.abs(H.get(i, n)));
          if (eps * t * t > 1) {
            for (j = i; j <= n; j++) {
              H.set(j, n - 1, H.get(j, n - 1) / t);
              H.set(j, n, H.get(j, n) / t);
            }
          }
        }
      }
    }
  }

  for (i = 0; i < nn; i++) {
    if (i < low || i > high) {
      for (j = i; j < nn; j++) {
        V.set(i, j, H.get(i, j));
      }
    }
  }

  for (j = nn - 1; j >= low; j--) {
    for (i = low; i <= high; i++) {
      z = 0;
      for (k = low; k <= Math.min(j, high); k++) {
        z = z + V.get(i, k) * H.get(k, j);
      }
      V.set(i, j, z);
    }
  }
}

function cdiv(xr, xi, yr, yi) {
  var r, d;
  if (Math.abs(yr) > Math.abs(yi)) {
    r = yi / yr;
    d = yr + r * yi;
    return [(xr + r * xi) / d, (xi - r * xr) / d];
  } else {
    r = yr / yi;
    d = yi + r * yr;
    return [(r * xr + xi) / d, (r * xi - xr) / d];
  }
}

class CholeskyDecomposition {
  constructor(value) {
    value = WrapperMatrix2D.checkMatrix(value);
    if (!value.isSymmetric()) {
      throw new Error('Matrix is not symmetric');
    }

    var a = value;
    var dimension = a.rows;
    var l = new Matrix(dimension, dimension);
    var positiveDefinite = true;
    var i, j, k;

    for (j = 0; j < dimension; j++) {
      var d = 0;
      for (k = 0; k < j; k++) {
        var s = 0;
        for (i = 0; i < k; i++) {
          s += l.get(k, i) * l.get(j, i);
        }
        s = (a.get(j, k) - s) / l.get(k, k);
        l.set(j, k, s);
        d = d + s * s;
      }

      d = a.get(j, j) - d;

      positiveDefinite &= d > 0;
      l.set(j, j, Math.sqrt(Math.max(d, 0)));
      for (k = j + 1; k < dimension; k++) {
        l.set(j, k, 0);
      }
    }

    if (!positiveDefinite) {
      throw new Error('Matrix is not positive definite');
    }

    this.L = l;
  }

  solve(value) {
    value = WrapperMatrix2D.checkMatrix(value);

    var l = this.L;
    var dimension = l.rows;

    if (value.rows !== dimension) {
      throw new Error('Matrix dimensions do not match');
    }

    var count = value.columns;
    var B = value.clone();
    var i, j, k;

    for (k = 0; k < dimension; k++) {
      for (j = 0; j < count; j++) {
        for (i = 0; i < k; i++) {
          B.set(k, j, B.get(k, j) - B.get(i, j) * l.get(k, i));
        }
        B.set(k, j, B.get(k, j) / l.get(k, k));
      }
    }

    for (k = dimension - 1; k >= 0; k--) {
      for (j = 0; j < count; j++) {
        for (i = k + 1; i < dimension; i++) {
          B.set(k, j, B.get(k, j) - B.get(i, j) * l.get(i, k));
        }
        B.set(k, j, B.get(k, j) / l.get(k, k));
      }
    }

    return B;
  }

  get lowerTriangularMatrix() {
    return this.L;
  }
}

class nipals {
  constructor(X, options = {}) {
    X = WrapperMatrix2D.checkMatrix(X);
    let { Y } = options;
    const {
      scaleScores = false,
      maxIterations = 1000,
      terminationCriteria = 1e-10,
    } = options;

    let u;
    if (Y) {
      if (Array.isArray(Y) && typeof Y[0] === 'number') {
        Y = Matrix.columnVector(Y);
      } else {
        Y = WrapperMatrix2D.checkMatrix(Y);
      }
      if (!Y.isColumnVector() || Y.rows !== X.rows) {
        throw new Error('Y must be a column vector of length X.rows');
      }
      u = Y;
    } else {
      u = X.getColumnVector(0);
    }

    let diff = 1;
    let t, q, w, tOld;

    for (
      let counter = 0;
      counter < maxIterations && diff > terminationCriteria;
      counter++
    ) {
      w = X.transpose()
        .mmul(u)
        .div(
          u
            .transpose()
            .mmul(u)
            .get(0, 0),
        );
      w = w.div(w.norm());

      t = X.mmul(w).div(
        w
          .transpose()
          .mmul(w)
          .get(0, 0),
      );

      if (counter > 0) {
        diff = t
          .clone()
          .sub(tOld)
          .pow(2)
          .sum();
      }
      tOld = t.clone();

      if (Y) {
        q = Y.transpose()
          .mmul(t)
          .div(
            t
              .transpose()
              .mmul(t)
              .get(0, 0),
          );
        q = q.div(q.norm());

        u = Y.mmul(q).div(
          q
            .transpose()
            .mmul(q)
            .get(0, 0),
        );
      } else {
        u = t;
      }
    }

    if (Y) {
      let p = X.transpose()
        .mmul(t)
        .div(
          t
            .transpose()
            .mmul(t)
            .get(0, 0),
        );
      p = p.div(p.norm());
      let xResidual = X.clone().sub(t.clone().mmul(p.transpose()));
      let residual = u
        .transpose()
        .mmul(t)
        .div(
          t
            .transpose()
            .mmul(t)
            .get(0, 0),
        );
      let yResidual = Y.clone().sub(
        t
          .clone()
          .mulS(residual.get(0, 0))
          .mmul(q.transpose()),
      );

      this.t = t;
      this.p = p.transpose();
      this.w = w.transpose();
      this.q = q;
      this.u = u;
      this.s = t.transpose().mmul(t);
      this.xResidual = xResidual;
      this.yResidual = yResidual;
      this.betas = residual;
    } else {
      this.w = w.transpose();
      this.s = t
        .transpose()
        .mmul(t)
        .sqrt();
      if (scaleScores) {
        this.t = t.clone().div(this.s.get(0, 0));
      } else {
        this.t = t;
      }
      this.xResidual = X.sub(t.mmul(w.transpose()));
    }
  }
}

exports.AbstractMatrix = AbstractMatrix;
exports.CHO = CholeskyDecomposition;
exports.CholeskyDecomposition = CholeskyDecomposition;
exports.EVD = EigenvalueDecomposition;
exports.EigenvalueDecomposition = EigenvalueDecomposition;
exports.LU = LuDecomposition;
exports.LuDecomposition = LuDecomposition;
exports.Matrix = Matrix;
exports.MatrixColumnSelectionView = MatrixColumnSelectionView;
exports.MatrixColumnView = MatrixColumnView;
exports.MatrixFlipColumnView = MatrixFlipColumnView;
exports.MatrixFlipRowView = MatrixFlipRowView;
exports.MatrixRowSelectionView = MatrixRowSelectionView;
exports.MatrixRowView = MatrixRowView;
exports.MatrixSelectionView = MatrixSelectionView;
exports.MatrixSubView = MatrixSubView;
exports.MatrixTransposeView = MatrixTransposeView;
exports.NIPALS = nipals;
exports.Nipals = nipals;
exports.QR = QrDecomposition;
exports.QrDecomposition = QrDecomposition;
exports.SVD = SingularValueDecomposition;
exports.SingularValueDecomposition = SingularValueDecomposition;
exports.WrapperMatrix1D = WrapperMatrix1D;
exports.WrapperMatrix2D = WrapperMatrix2D;
exports.correlation = correlation;
exports.covariance = covariance;
exports.default = Matrix;
exports.determinant = determinant;
exports.inverse = inverse;
exports.linearDependencies = linearDependencies;
exports.pseudoInverse = pseudoInverse;
exports.solve = solve;
exports.wrap = wrap;

},{"ml-array-rescale":35}],37:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

var mlMatrix = require('ml-matrix');

/**
 * Creates new PCA (Principal Component Analysis) from the dataset
 * @param {Matrix} dataset - dataset or covariance matrix.
 * @param {Object} [options]
 * @param {boolean} [options.isCovarianceMatrix=false] - true if the dataset is a covariance matrix.
 * @param {boolean} [options.method='SVD'] - select which method to use: SVD (default), covarianceMatrirx or NIPALS.
 * @param {boolean} [options.nCompNIPALS=2] - number of components to be computed with NIPALS.
 * @param {boolean} [options.center=true] - should the data be centered (subtract the mean).
 * @param {boolean} [options.scale=false] - should the data be scaled (divide by the standard deviation).
 * @param {boolean} [options.ignoreZeroVariance=false] - ignore columns with zero variance if `scale` is `true`.
 * */
class PCA {
  constructor(dataset, options = {}) {
    if (dataset === true) {
      const model = options;
      this.center = model.center;
      this.scale = model.scale;
      this.means = model.means;
      this.stdevs = model.stdevs;
      this.U = mlMatrix.Matrix.checkMatrix(model.U);
      this.S = model.S;
      this.R = model.R;
      this.excludedFeatures = model.excludedFeatures;
      return;
    }

    dataset = new mlMatrix.Matrix(dataset);

    const {
      isCovarianceMatrix = false,
      method = 'SVD',
      nCompNIPALS = 2,
      center = true,
      scale = false,
      ignoreZeroVariance = false,
    } = options;

    this.center = center;
    this.scale = scale;
    this.means = null;
    this.stdevs = null;
    this.excludedFeatures = [];

    if (isCovarianceMatrix) {
      // User provided a covariance matrix instead of dataset.
      this._computeFromCovarianceMatrix(dataset);
      return;
    }

    this._adjust(dataset, ignoreZeroVariance);
    switch (method) {
      case 'covarianceMatrix': {
        // User provided a dataset but wants us to compute and use the covariance matrix.
        const covarianceMatrix = new mlMatrix.MatrixTransposeView(dataset)
          .mmul(dataset)
          .div(dataset.rows - 1);
        this._computeFromCovarianceMatrix(covarianceMatrix);
        break;
      }
      case 'NIPALS': {
        this._computeWithNIPALS(dataset, nCompNIPALS);
        break;
      }
      case 'SVD': {
        const svd = new mlMatrix.SVD(dataset, {
          computeLeftSingularVectors: false,
          computeRightSingularVectors: true,
          autoTranspose: true,
        });

        this.U = svd.rightSingularVectors;

        const singularValues = svd.diagonal;
        const eigenvalues = [];
        for (const singularValue of singularValues) {
          eigenvalues.push((singularValue * singularValue) / (dataset.rows - 1));
        }
        this.S = eigenvalues;
        break;
      }
      default: {
        throw new Error(`unknown method: ${method}`);
      }
    }
  }

  /**
   * Load a PCA model from JSON
   * @param {Object} model
   * @return {PCA}
   */
  static load(model) {
    if (typeof model.name !== 'string') {
      throw new TypeError('model must have a name property');
    }
    if (model.name !== 'PCA') {
      throw new RangeError(`invalid model: ${model.name}`);
    }
    return new PCA(true, model);
  }

  /**
   * Project the dataset into the PCA space
   * @param {Matrix} dataset
   * @param {Object} options
   * @return {Matrix} dataset projected in the PCA space
   */
  predict(dataset, options = {}) {
    const { nComponents = this.U.columns } = options;
    dataset = new mlMatrix.Matrix(dataset);
    if (this.center) {
      dataset.subRowVector(this.means);
      if (this.scale) {
        for (let i of this.excludedFeatures) {
          dataset.removeColumn(i);
        }
        dataset.divRowVector(this.stdevs);
      }
    }
    var predictions = dataset.mmul(this.U);
    return predictions.subMatrix(0, predictions.rows - 1, 0, nComponents - 1);
  }

  /**
   * Calculates the inverse PCA transform
   * @param {Matrix} dataset
   * @return {Matrix} dataset projected in the PCA space
   */
  invert(dataset) {
    dataset = mlMatrix.Matrix.checkMatrix(dataset);

    var inverse = dataset.mmul(this.U.transpose());

    if (this.center) {
      if (this.scale) {
        inverse.mulRowVector(this.stdevs);
      }
      inverse.addRowVector(this.means);
    }

    return inverse;
  }


  /**
   * Returns the proportion of variance for each component
   * @return {[number]}
   */
  getExplainedVariance() {
    var sum = 0;
    for (const s of this.S) {
      sum += s;
    }
    return this.S.map((value) => value / sum);
  }

  /**
   * Returns the cumulative proportion of variance
   * @return {[number]}
   */
  getCumulativeVariance() {
    var explained = this.getExplainedVariance();
    for (var i = 1; i < explained.length; i++) {
      explained[i] += explained[i - 1];
    }
    return explained;
  }

  /**
   * Returns the Eigenvectors of the covariance matrix
   * @returns {Matrix}
   */
  getEigenvectors() {
    return this.U;
  }

  /**
   * Returns the Eigenvalues (on the diagonal)
   * @returns {[number]}
   */
  getEigenvalues() {
    return this.S;
  }

  /**
   * Returns the standard deviations of the principal components
   * @returns {[number]}
   */
  getStandardDeviations() {
    return this.S.map((x) => Math.sqrt(x));
  }

  /**
   * Returns the loadings matrix
   * @return {Matrix}
   */
  getLoadings() {
    return this.U.transpose();
  }

  /**
   * Export the current model to a JSON object
   * @return {Object} model
   */
  toJSON() {
    return {
      name: 'PCA',
      center: this.center,
      scale: this.scale,
      means: this.means,
      stdevs: this.stdevs,
      U: this.U,
      S: this.S,
    };
  }

  _adjust(dataset, ignoreZeroVariance) {
    if (this.center) {
      const mean = dataset.mean('column');
      const stdevs = this.scale
        ? dataset.standardDeviation('column', { mean })
        : null;
      this.means = mean;
      dataset.subRowVector(mean);
      if (this.scale) {
        for (let i = 0; i < stdevs.length; i++) {
          if (stdevs[i] === 0) {
            if (ignoreZeroVariance) {
              dataset.removeColumn(i);
              stdevs.splice(i, 1);
              this.excludedFeatures.push(i);
              i--;
            } else {
              throw new RangeError(
                `Cannot scale the dataset (standard deviation is zero at index ${i}`,
              );
            }
          }
        }
        this.stdevs = stdevs;
        dataset.divRowVector(stdevs);
      }
    }
  }

  _computeFromCovarianceMatrix(dataset) {
    const evd = new mlMatrix.EVD(dataset, { assumeSymmetric: true });
    this.U = evd.eigenvectorMatrix;
    this.U.flipRows();
    this.S = evd.realEigenvalues;
    this.S.reverse();
  }

  _computeWithNIPALS(dataset, nCompNIPALS) {
    this.U = new mlMatrix.Matrix(nCompNIPALS, dataset.columns);
    this.S = [];

    let x = dataset;
    for (let i = 0; i < nCompNIPALS; i++) {
      let dc = new mlMatrix.NIPALS(x);

      this.U.setRow(i, dc.w.transpose());
      this.S.push(Math.pow(dc.s.get(0, 0), 2));

      x = dc.xResidual;
    }
    this.U = this.U.transpose(); // to be compatible with API
  }
}

exports.PCA = PCA;

},{"ml-matrix":36}]},{},[1]);
}