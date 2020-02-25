function electroLensMain(){(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
"use strict";

exports.__esModule = true;
exports.render = render;

var _MultiviewControlInitializeViewSetupsJs = require("./MultiviewControl/initializeViewSetups.js");

var _DHeatmapsInitialize2DHeatmapSetupJs = require("./2DHeatmaps/initialize2DHeatmapSetup.js");

var _MultiviewControlCalculateViewportSizesJs = require("./MultiviewControl/calculateViewportSizes.js");

var _DHeatmapsHeatmapViewJs = require("./2DHeatmaps/HeatmapView.js");

var _DViewsPointCloud_selectionJs = require("./3DViews/PointCloud_selection.js");

var _DViewsMoleculeViewJs = require("./3DViews/MoleculeView.js");

var _DViewsSystemEdgeJs = require("./3DViews/systemEdge.js");

var _DViewsTooltipJs = require( /*hover3DViewSpatiallyResolved, hover3DViewMolecule*/"./3DViews/tooltip.js");

var _DViewsSelectionJs = require("./3DViews/selection.js");

var _UtilitiesReadDataFileJs = require( /*,readCSVPapaparse, readViewsSetup*/"./Utilities/readDataFile.js");

var _UtilitiesArrangeDataJs = require("./Utilities/arrangeData.js");

var _UtilitiesReadFormJs = require("./Utilities/readForm.js");

var _UtilitiesSaveDataJs = require("./Utilities/saveData.js");

var _DViewsSetupOptionBox3DViewJs = require("./3DViews/setupOptionBox3DView.js");

var _DHeatmapsSetupOptionBox2DHeatmapJs = require("./2DHeatmaps/setupOptionBox2DHeatmap.js");

var _MultiviewControlSetupViewBasicJs = require("./MultiviewControl/setupViewBasic.js");

var _MultiviewControlOptionBoxControlJs = require("./MultiviewControl/optionBoxControl.js");

var _MultiviewControlHUDControlJs = require("./MultiviewControl/HUDControl.js");

var _MultiviewControlControllerControlJs = require("./MultiviewControl/controllerControl.js");

var _DHeatmapsUtilitiesJs = require("./2DHeatmaps/Utilities.js");

var _DHeatmapsTooltipJs = require( /*, hoverHeatmap,clickHeatmap */"./2DHeatmaps/tooltip.js");

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

		$(".save-config").click(function (e) {
			var CONFIG = _UtilitiesReadFormJs.readInputForm();
			_UtilitiesSaveDataJs.download(CONFIG, 'config.json', 'text/plain');
		});

		$("form").submit(function (event) {

			var CONFIG = _UtilitiesReadFormJs.readInputForm();
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
	if (!Detector.webgl) Detector.addGetWebGLMessage();

	var container, stats, renderer, effect;
	var mouseX = 0,
	    mouseY = 0;
	// var windowWidth, windowHeight;
	plotSetup.windowWidth = window.innerWidth;
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
				queue.defer(_UtilitiesReadDataFileJs.processSpatiallyResolvedData, view, plotSetup);
			} else {
				queue.defer(_UtilitiesReadDataFileJs.readCSVSpatiallyResolvedData, view, plotSetup);
				// queue.defer(readCSVSpatiallyResolvedDataPapaparse,view,overallSpatiallyResolvedData,plotSetup);
			}

			if (view.moleculeData != null && view.moleculeData.data != null) {
				queue.defer(_UtilitiesReadDataFileJs.processMoleculeData, view, plotSetup);
			} else {
				queue.defer(_UtilitiesReadDataFileJs.readCSVMoleculeData, view, plotSetup);
			}
		}
	}

	queue.awaitAll(function (error) {
		if (error) throw error;
		/*console.log("updating progress bar");
  progressBar.animate(80);*/
		_UtilitiesReadDataFileJs.combineData(views, overallSpatiallyResolvedData, overallMoleculeData);
		init();
		/*console.log("updating progress bar");
  progressBar.animate(100);)*/
		var htmlUI = document.getElementById("UI");
		htmlUI.parentNode.removeChild(htmlUI);
		render(views, plotSetup);
		animate();
	});

	function init() {

		console.log('started initialization');
		//const { UMAP } = require('umap-js');
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

		plotSetup.renderer = renderer;

		container.appendChild(renderer.domElement);

		plotSetup.active2DPlotSpatiallyResolved = null;
		plotSetup.active2DPlotMolecule = null;

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

			view.controller.addEventListener('change', function (event) {
				render(views, plotSetup);
			});

			if (view.viewType == '3DView') {
				view.controller.autoRotate = false;
				view.options.plotID = "3D_View_" + ii;

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
				}

				_DViewsSetupOptionBox3DViewJs.setupOptionBox3DView(view, plotSetup);
				_DViewsSystemEdgeJs.addSystemEdge(view);
				_DViewsTooltipJs.initialize3DViewTooltip(view);
			}
			if (view.viewType == '2DHeatmap') {

				view.controller.enableRotate = false;
				view.options.plotID = "2D_Plot_" + ii;

				if (overallSpatiallyResolvedData.length > 0) {
					view.overallSpatiallyResolvedDataBoolean = true;
				}
				if (overallMoleculeData.length > 0) {
					view.overallMoleculeDataBoolean = true;
				}

				_DHeatmapsTooltipJs.initialize2DPlotTooltip(view);
				_DHeatmapsSetupOptionBox2DHeatmapJs.setupOptionBox2DHeatmap(view, plotSetup);

				_DHeatmapsUtilitiesJs.addTitle(view);
			}
		}

		stats = new Stats();
		container.appendChild(stats.dom);

		container.addEventListener('mousemove', throttle(onDocumentMouseMove, 20), false);
		container.addEventListener('click', onDocumentMouseClick, false);
		container.addEventListener('mousedown', function (event) {
			mouseHold = true;
			if (event.button == 0) {
				clickRequest = true;
			}
		}, false);
		container.addEventListener('mouseup', function (event) {
			mouseHold = false;
			mouseDrag = false;
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
			render(views, plotSetup);
		}
		if (e.keyCode == 76) {
			for (var ii = 0; ii < views.length; ++ii) {
				var view = views[ii];
				if (view.controllerEnabled) {
					view.options.toggleLegend.call();
				}
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
			temp_view.options.plotID = "2D_Plot_" + views.length;
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
			temp_view.controller.addEventListener('change', function (event) {
				render(views, plotSetup);
			});

			temp_view.controller.enableRotate = false;
			_DHeatmapsTooltipJs.initialize2DPlotTooltip(temp_view);
			_DHeatmapsSetupOptionBox2DHeatmapJs.setupOptionBox2DHeatmap(temp_view, plotSetup);
			_MultiviewControlOptionBoxControlJs.updateOptionBoxLocation(views);
			_DHeatmapsUtilitiesJs.addTitle(temp_view);
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

	function updateActiveView(views) {
		for (var ii = 0; ii < views.length; ++ii) {
			var view = views[ii];
			if (view.controllerEnabled) {
				return view;
			}
		}
	}

	function throttle(callback, interval) {
		var enableCall = true;

		return function () {
			if (!enableCall) return;

			enableCall = false;

			for (var _len = arguments.length, args = Array(_len), _key = 0; _key < _len; _key++) {
				args[_key] = arguments[_key];
			}

			callback.apply(this, args);
			setTimeout(function () {
				return enableCall = true;
			}, interval);
		};
	}

	function onDocumentMouseMove(mouseEvent) {
		mouseX = mouseEvent.clientX;
		mouseY = mouseEvent.clientY;
		if (mouseHold == false) {
			_MultiviewControlControllerControlJs.updateController(views, plotSetup.windowWidth, plotSetup.windowHeight, mouseX, mouseY);
			activeView = updateActiveView(views);
		} else {
			mouseDrag = true;
			return;
		}

		for (var ii = 0; ii < views.length; ++ii) {
			var view = views[ii];
			if (view.controllerEnabled) {
				var left = Math.floor(plotSetup.windowWidth * view.left);
				var top = Math.floor(plotSetup.windowHeight * view.top);
				// var width  = Math.floor( windowWidth  * view.width ) + left;
				// var height = Math.floor( windowHeight * view.height ) + top;
				var vector = new THREE.Vector3();

				vector.set((mouseEvent.clientX - left) / Math.floor(plotSetup.windowWidth * view.width) * 2 - 1, -((mouseEvent.clientY - top) / Math.floor(plotSetup.windowHeight * view.height)) * 2 + 1, 0.1);
				vector.unproject(view.camera);
				var dir = vector.sub(view.camera.position).normalize();
				var distance = -view.camera.position.z / dir.z;
				view.mousePosition = view.camera.position.clone().add(dir.multiplyScalar(distance));
				if (view.viewType == "2DHeatmap") {
					if ((view.options.plotType == "Heatmap" || view.options.plotType == "Comparison" || view.options.plotType == "PCA" || view.options.plotType == "Umap") && typeof view.heatmapPlot != "undefined") {

						if (view.options.plotData == "spatiallyResolvedData") {
							var needsUpdate = _DHeatmapsSelectionJs.hoverHeatmap(view, mouseEvent);
							if (needsUpdate) {
								console.log('updating plots');
								_DHeatmapsSelectionUtilitiesJs.updateAllPlotsSpatiallyResolved(views);
							}
						} else if (view.options.plotData == "moleculeData") {
							var needsUpdate = _DHeatmapsSelectionJs.hoverHeatmap(view, mouseEvent);
							if (needsUpdate) {
								console.log('updating plots');
								_DHeatmapsSelectionUtilitiesJs.updateAllPlotsMolecule(views);
							}
						}
					}
					if (view.options.plotType == "Correlation" && typeof view.covariancePlot != "undefined") {
						_DHeatmapsTooltipJs.updateCovarianceTooltip(view);
					}
				} else if (view.viewType == "3DView") {
					if (view.systemMoleculeDataBoolean && view.options.interactiveMolecule) {
						if (view.options.atomsStyle == "ball") {
							var pickingResult = _DViewsSelectionJs.gpuPickMolecule(view, renderer, view.scene, mouseEvent, plotSetup.windowWidth, plotSetup.windowHeight);
							var needsUpdate = _DViewsSelectionJs.hover3DViewMoleculeBall(view, plotSetup, pickingResult);
							if (needsUpdate) {
								_DHeatmapsSelectionUtilitiesJs.updateAllPlotsMoleculeScale(views);
							}
						} else if (view.options.atomsStyle == "sprite") {
							var needsUpdate = _DViewsSelectionJs.hover3DViewMoleculeSprite(view, plotSetup, mouseEvent);
							if (needsUpdate) {
								_DHeatmapsSelectionUtilitiesJs.updateAllPlotsMoleculeScale(views);
							}
						}
					}

					if (view.systemSpatiallyResolvedDataBoolean && view.options.interactiveSpatiallyResolved) {
						var needsUpdate = _DViewsSelectionJs.hover3DViewSpatiallyResolved(view, plotSetup, mouseEvent);
						if (needsUpdate) {
							_DHeatmapsSelectionUtilitiesJs.updateAllPlotsSpatiallyResolved(views);
						}
					}
				}
			}
		}
		render(views, plotSetup);
	}

	function onDocumentMouseClick(mouseEvent) {
		if (mouseDrag) {
			return;
		}

		for (var ii = 0; ii < views.length; ++ii) {
			var view = views[ii];
			if (view.controllerEnabled) {
				if (view.viewType == "2DHeatmap") {
					if ((view.options.plotType == "Heatmap" || view.options.plotType == "Comparison" || view.options.plotType == "PCA" || view.options.plotType == "Umap") && typeof view.heatmapPlot != "undefined" && !(view.options.planeSelection || view.options.brushSelection)) {
						if (view.options.plotData == "spatiallyResolvedData") {
							var needsUpdate = _DHeatmapsSelectionJs.clickHeatmap(view, views);
							if (needsUpdate) {
								_DHeatmapsSelectionUtilitiesJs.updateAllPlotsSpatiallyResolved(views);
							}
						} else if (view.options.plotData == "moleculeData") {
							var needsUpdate = _DHeatmapsSelectionJs.clickHeatmap(view, views);
							if (needsUpdate) {
								_DHeatmapsSelectionUtilitiesJs.updateAllPlotsMolecule(views);
							}
						}

						// updateHeatmapTooltip(view);
					}
				} else if (view.viewType == "3DView") {
						if (view.systemMoleculeDataBoolean && view.options.interactiveMolecule) {
							var needsUpdate = _DViewsSelectionJs.click3DViewMolecule(view, views, plotSetup);
							if (needsUpdate) {
								_DHeatmapsSelectionUtilitiesJs.updateAllPlotsMolecule(views);
							}
						}

						if (view.systemSpatiallyResolvedDataBoolean && view.options.interactiveSpatiallyResolved) {
							var needsUpdate = _DViewsSelectionJs.click3DViewSpatiallyResolved(view, views, plotSetup);
							if (needsUpdate) {
								_DHeatmapsSelectionUtilitiesJs.updateAllPlotsSpatiallyResolved(views);
							}
						}
					}
			}
		}
		render(views, plotSetup);
	}

	function animate() {
		// render();
		//processClick();
		processSelection();
		stats.update();

		/*for ( var ii = 0; ii < views.length; ++ii ) {
  	var view = views[ii];
  	if (view.viewType == '3DView') {
  		view.controller.update();
  	}
  }*/

		requestAnimationFrame(animate);
	}

	function processSelection() {
		if (activeView != null) {
			if (activeView.viewType == '2DHeatmap') {
				_DHeatmapsSelectionJs.selectionControl(views, activeView, mouseHold);
			}
		}
	}
}

function render(views, plotSetup) {
	try {
		var renderer = plotSetup.renderer;
		updateSize(views, plotSetup);
		for (var ii = 0; ii < views.length; ++ii) {

			var view = views[ii];

			var camera = view.camera;

			var width = Math.floor(plotSetup.windowWidth * view.width);
			var height = Math.floor(plotSetup.windowHeight * view.height);
			var left = Math.floor(plotSetup.windowWidth * view.left);
			var top = Math.floor(plotSetup.windowHeight * (1 - view.top) - height);
			// console.log('top', view.top,(1-view.top), top)

			view.windowLeft = left;
			view.windowTop = plotSetup.windowHeight * view.top;
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
		console.log('called render');
	} catch (err) {
		console.log('render error', err);
	}
}

function updateSize(views, plotSetup) {
	if (plotSetup.windowWidth != window.innerWidth || plotSetup.windowHeight != window.innerHeight) {
		plotSetup.windowWidth = window.innerWidth;
		plotSetup.windowHeight = window.innerHeight;
		plotSetup.renderer.setSize(plotSetup.windowWidth, plotSetup.windowHeight);

		for (var ii = 0; ii < views.length; ++ii) {
			var view = views[ii];

			var width = Math.floor(plotSetup.windowWidth * view.width);
			var height = Math.floor(plotSetup.windowHeight * view.height);
			var left = Math.floor(plotSetup.windowWidth * view.left);
			var top = Math.floor(plotSetup.windowHeight * (1 - view.top) - height);

			view.windowLeft = left;
			view.windowTop = plotSetup.windowHeight * view.top;
			view.windowWidth = width;
			view.windowHeight = height;
		}

		_MultiviewControlOptionBoxControlJs.updateOptionBoxLocation(views);
		_DHeatmapsUtilitiesJs.update2DHeatmapTitlesLocation(views);
	}
}

},{"./2DHeatmaps/HeatmapView.js":2,"./2DHeatmaps/Selection/Utilities.js":5,"./2DHeatmaps/Utilities.js":7,"./2DHeatmaps/initialize2DHeatmapSetup.js":10,"./2DHeatmaps/selection.js":11,"./2DHeatmaps/setupOptionBox2DHeatmap.js":12,"./2DHeatmaps/tooltip.js":13,"./3DViews/MoleculeView.js":16,"./3DViews/PointCloud_selection.js":17,"./3DViews/selection.js":20,"./3DViews/setupOptionBox3DView.js":21,"./3DViews/systemEdge.js":22,"./3DViews/tooltip.js":23,"./MultiviewControl/HUDControl.js":24,"./MultiviewControl/calculateViewportSizes.js":26,"./MultiviewControl/colorLegend.js":27,"./MultiviewControl/controllerControl.js":28,"./MultiviewControl/initializeViewSetups.js":29,"./MultiviewControl/optionBoxControl.js":30,"./MultiviewControl/setupViewBasic.js":31,"./Utilities/arrangeData.js":32,"./Utilities/readDataFile.js":35,"./Utilities/readForm.js":36,"./Utilities/saveData.js":37,"./Utilities/scale.js":38}],2:[function(require,module,exports){
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

var _MaterialsJs = require("./Materials.js");

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
	view.xValue = xValue;
	view.yValue = yValue;

	// var voxelToHeatmapMap = new Uint32Array(Data.length);
	for (var i = 0; i < Data.length; i++) {
		var heatmapX = xMap(Data[i]);
		var heatmapY = yMap(Data[i]);

		if (!(heatmapX in view.data)) {
			view.data[heatmapX] = {};
		}

		if (!(heatmapY in view.data[heatmapX])) {
			view.data[heatmapX][heatmapY] = { list: [], selected: true, highlighted: false };
		}

		view.data[heatmapX][heatmapY]['list'].push(Data[i]);
	}
}

function getHeatmap(view) {

	var options = view.options;

	var data = view.data;

	var num = heatmapPointCount(data);

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

	//var xPlotScale = d3.scaleLinear().domain([0, options.numPerSide]).range([-50,50]);
	//var yPlotScale = d3.scaleLinear().domain([0, options.numPerSide]).range([-50,50]);
	var xPlotScale = view.xPlotScale;
	var yPlotScale = view.yPlotScale;

	var XYtoHeatmapMap = {};

	for (var x in data) {
		for (var y in data[x]) {
			if (!(x in XYtoHeatmapMap)) {
				XYtoHeatmapMap[x] = {};
			}
			XYtoHeatmapMap[x][y] = i;

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
				sizes[i] = options.pointCloudSize;
				alphas[i] = options.pointCloudAlpha;
			} else {
				colors[i3 + 0] = 1;
				colors[i3 + 1] = 1;
				colors[i3 + 2] = 1;
				sizes[i] = options.pointCloudSize;
				alphas[i] = options.pointCloudAlpha / 2;
			}

			if (data[x][y].highlighted || isAnyHighlighted(data[x][y]['list'])) {
				// data[x][y].highlighted = true;
				// view.highlightedIndexList.push(i);
				sizes[i] = 3 * sizes[i];
			} else {
				// data[x][y].highlighted = false;
				// view.highlightedIndexList.splice(view.highlightedIndexList.indexOf(i),1);
			}

			i++;
			i3 += 3;

			var tempInfo = { x: xPlot - 50,
				y: yPlot - 50,
				numberDatapointsRepresented: numberDatapointsRepresented,
				xStart: view.xScale.invertExtent(x)[0],
				xEnd: view.xScale.invertExtent(x)[1],
				yStart: view.yScale.invertExtent(y)[0],
				yEnd: view.yScale.invertExtent(y)[1],
				heatmapX: x,
				heatmapY: y
			};
			//console.log(tempInfo);
			//console.log(view.xScale.invertExtent(""+xPlot)[0], view.xScale.invertExtent(""+xPlot)[1])
			heatmapInformation.push(tempInfo);
		}
	}
	view.heatmapInformation = heatmapInformation;
	view.XYtoHeatmapMap = XYtoHeatmapMap;
	geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
	geometry.setAttribute('customColor', new THREE.BufferAttribute(colors, 3));
	geometry.setAttribute('size', new THREE.BufferAttribute(sizes, 1));
	geometry.setAttribute('alpha', new THREE.BufferAttribute(alphas, 1));

	var material = _MaterialsJs.getHeatmapMaterial();
	var System = new THREE.Points(geometry, material);

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
			if (data[x][y].highlighted || isAnyHighlighted(data[x][y]['list'])) {
				// data[x][y].highlighted = true;
				// view.highlightedIndexList.push(i);
				sizes[i] = 3 * sizes[i];
			} else {
				// data[x][y].highlighted = false;
				// view.highlightedIndexList.splice(view.highlightedIndexList.indexOf(i),1);
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

	if ("UmapGroup" in view) {
		view.scene.remove(view.UmapGroup);
		delete view.UmapGroup;
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

	view.heatmapPlot = heatmapPlot;
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

function isAnyHighlighted(list) {

	for (var i = 0; i < list.length; i++) {
		if (list[i].highlighted) {
			return true;
		}
	}
	return false;
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

},{"../MultiviewControl/colorLegend.js":27,"../Utilities/other.js":34,"./Materials.js":3,"./Utilities.js":7}],3:[function(require,module,exports){
"use strict";

exports.__esModule = true;
exports.getHeatmapMaterial = getHeatmapMaterial;

function getHeatmapMaterial(options) {
  var uniforms = {

    color: { value: new THREE.Color(0xffffff) },
    texture: { value: new THREE.TextureLoader().load("textures/sprites/disc.png") }

  };

  var shaderMaterial = new THREE.ShaderMaterial({

    uniforms: uniforms,
    vertexShader: "\n            attribute float size;\n            attribute vec3 customColor;\n            attribute float alpha;\n    \n            varying float vAlpha;\n            varying vec3 vColor;\n    \n            void main() {\n                vColor = customColor;\n                vAlpha = alpha;\n                vec4 mvPosition = modelViewMatrix * vec4( position, 1.0 );\n                gl_PointSize = size * ( 300.0 / -mvPosition.z );\n                gl_Position = projectionMatrix * mvPosition;\n            }\n        ",
    fragmentShader: "\n            uniform vec3 color;\n            uniform sampler2D texture;\n    \n            varying vec3 vColor;\n            varying float vAlpha;\n    \n            void main() {\n                gl_FragColor = vec4( color * vColor, vAlpha );\n                gl_FragColor = gl_FragColor * texture2D( texture, gl_PointCoord );\n            }\n        ",

    blending: THREE.AdditiveBlending,
    depthTest: false,
    transparent: true

  });

  return shaderMaterial;
}

},{}],4:[function(require,module,exports){
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

var _MaterialsJs = require("./Materials.js");

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

		if (!(heatmapX in view.data)) {
			view.data[heatmapX] = {};
		}

		if (!(heatmapY in view.data[heatmapX])) {
			view.data[heatmapX][heatmapY] = { list: [], selected: true, highlighted: false };
		}
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

	var options = view.options;

	var data = view.data;

	var num = heatmapPointCount(data);

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

	//var xPlotScale = d3.scaleLinear().domain([0, options.numPerSide]).range([-50,50]);
	//var yPlotScale = d3.scaleLinear().domain([0, options.numPerSide]).range([-50,50]);
	var xPlotScale = view.xPlotScale;
	var yPlotScale = view.yPlotScale;

	var XYtoHeatmapMap = {};

	for (var x in data) {
		for (var y in data[x]) {
			XYtoHeatmapMap[x] = XYtoHeatmapMap.x || {};
			XYtoHeatmapMap[x][y] = i;

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
				sizes[i] = options.pointCloudSize;
				alphas[i] = options.pointCloudAlpha;
			} else {
				colors[i3 + 0] = 1;
				colors[i3 + 1] = 1;
				colors[i3 + 2] = 1;
				sizes[i] = options.pointCloudSize;
				alphas[i] = options.pointCloudAlpha / 2;
			}

			if (data[x][y].highlighted || isAnyHighlighted(data[x][y]['list'])) {
				// data[x][y].highlighted = true;
				// view.highlightedIndexList.push(i);
				sizes[i] = 3 * sizes[i];
			} else {
				// data[x][y].highlighted = false;
				// view.highlightedIndexList.splice(view.highlightedIndexList.indexOf(i),1);
			}

			i++;
			i3 += 3;

			var tempInfo = { x: xPlot - 50,
				y: yPlot - 50,
				numberDatapointsRepresented: numberDatapointsRepresented,
				xStart: view.xScale.invertExtent(x)[0],
				xEnd: view.xScale.invertExtent(x)[1],
				yStart: view.yScale.invertExtent(y)[0],
				yEnd: view.yScale.invertExtent(y)[1],
				heatmapX: x,
				heatmapY: y
			};
			//console.log(tempInfo);
			//console.log(view.xScale.invertExtent(""+xPlot)[0], view.xScale.invertExtent(""+xPlot)[1])
			heatmapInformation.push(tempInfo);
		}
	}
	view.heatmapInformation = heatmapInformation;
	view.XYtoHeatmapMap = XYtoHeatmapMap;
	geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
	geometry.setAttribute('customColor', new THREE.BufferAttribute(colors, 3));
	geometry.setAttribute('size', new THREE.BufferAttribute(sizes, 1));
	geometry.setAttribute('alpha', new THREE.BufferAttribute(alphas, 1));

	var material = _MaterialsJs.getHeatmapMaterial();
	var System = new THREE.Points(geometry, material);

	return System;
}

function updatePCAHeatmap(view) {
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
			if (data[x][y].highlighted || isAnyHighlighted(data[x][y]['list'])) {
				// data[x][y].highlighted = true;
				// view.highlightedIndexList.push(i);
				sizes[i] = 3 * sizes[i];
			} else {
				// data[x][y].highlighted = false;
				// view.highlightedIndexList.splice(view.highlightedIndexList.indexOf(i),1);
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
		delete view.covariance;
	}

	if ("comparison" in view) {
		view.scene.remove(view.comparison);
		delete view.comparison;
	}

	if ("heatmap" in view) {
		view.scene.remove(view.heatmap);
		delete view.heatmap;
	}

	if ("PCAGroup" in view) {
		view.scene.remove(view.PCAGroup);
		delete view.PCAGroup;
	}

	if ("UmapGroup" in view) {
		view.scene.remove(view.UmapGroup);
		delete view.UmapGroup;
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

	view.heatmapPlot = PCAPlot;
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

function isAnyHighlighted(list) {

	for (var i = 0; i < list.length; i++) {
		if (list[i].highlighted) {
			return true;
		}
	}
	return false;
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

},{"../MultiviewControl/colorLegend.js":27,"../Utilities/other.js":34,"./Materials.js":3,"./Utilities.js":7,"ml-pca":47}],5:[function(require,module,exports){
"use strict";

exports.__esModule = true;
exports.deselectAllSpatiallyResolvedData = deselectAllSpatiallyResolvedData;
exports.selectAllSpatiallyResolvedData = selectAllSpatiallyResolvedData;
exports.deselectAllMoleculeData = deselectAllMoleculeData;
exports.selectAllMoleculeData = selectAllMoleculeData;
exports.updateAllPlots = updateAllPlots;
exports.updateAllPlotsSpatiallyResolved = updateAllPlotsSpatiallyResolved;
exports.updateAllPlotsMolecule = updateAllPlotsMolecule;
exports.updateAllPlotsMoleculeScale = updateAllPlotsMoleculeScale;
exports.updateSelectionFromHeatmap = updateSelectionFromHeatmap;
exports.updateSelectionFromComparison = updateSelectionFromComparison;

var _HeatmapViewJs = require("../HeatmapView.js");

var _PCAViewJs = require("../PCAView.js");

var _UmapViewJs = require("../UmapView.js");

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
		spatiallyResolvedData[i].highlighted = false;
	}
}

function selectAllSpatiallyResolvedData(views, spatiallyResolvedData) {
	for (var i = 0; i < spatiallyResolvedData.length; i++) {
		spatiallyResolvedData[i].selected = true;
		spatiallyResolvedData[i].highlighted = false;
	}
}

function deselectAllMoleculeData(views, overallMoleculeData) {
	for (var i = 0; i < overallMoleculeData.length; i++) {
		overallMoleculeData[i].selected = false;
		overallMoleculeData[i].highlighted = false;
	}
}

function selectAllMoleculeData(views, overallMoleculeData) {
	for (var i = 0; i < overallMoleculeData.length; i++) {
		overallMoleculeData[i].selected = true;
		overallMoleculeData[i].highlighted = false;
	}
}

function updateAllPlots(views) {
	for (var ii = 0; ii < views.length; ii++) {
		var view = views[ii];
		if (view.viewType == '2DHeatmap' && view.options.plotType == "Heatmap") {
			_HeatmapViewJs.updateHeatmap(view);
		}
		if (view.viewType == '2DHeatmap' && view.options.plotType == "Comparison") {
			_comparisonViewJs.updateComparison(view);
		}
		if (view.viewType == '2DHeatmap' && view.options.plotType == 'PCA') {
			_PCAViewJs.updatePCAHeatmap(view);
		}
		if (view.viewType == '2DHeatmap' && view.options.plotType == 'Umap') {
			_UmapViewJs.updateUmapHeatmap(view);
		}

		if (view.viewType == '3DView') {
			if (view.systemSpatiallyResolvedDataBoolean) {
				_DViewsPointCloud_selectionJs.updatePointCloudGeometry(view);
			}
			if (view.systemMoleculeDataBoolean) {
				_DViewsMoleculeViewJs.updateMoleculeGeometry(view);
				// changeMoleculeGeometry(view);
				// if (view.options.PBCBoolean) {changeMoleculePeriodicReplicates(view);}
			}
		}
	}
}

function updateAllPlotsSpatiallyResolved(views) {
	for (var ii = 0; ii < views.length; ii++) {
		var view = views[ii];
		if (view.viewType == '2DHeatmap' && view.options.plotType == "Heatmap") {
			_HeatmapViewJs.updateHeatmap(view);
		}
		if (view.viewType == '2DHeatmap' && view.options.plotType == "Comparison") {
			_comparisonViewJs.updateComparison(view);
		}
		if (view.viewType == '2DHeatmap' && view.options.plotType == 'PCA') {
			_PCAViewJs.updatePCAHeatmap(view);
		}
		if (view.viewType == '2DHeatmap' && view.options.plotType == 'Umap') {
			_UmapViewJs.updateUmapHeatmap(view);
		}

		if (view.viewType == '3DView') {
			if (view.systemSpatiallyResolvedDataBoolean) {
				_DViewsPointCloud_selectionJs.updatePointCloudGeometry(view);
			}
		}
	}
}

function updateAllPlotsMolecule(views) {
	for (var ii = 0; ii < views.length; ii++) {
		var view = views[ii];
		if (view.viewType == '2DHeatmap' && view.options.plotType == "Heatmap") {
			_HeatmapViewJs.updateHeatmap(view);
		}
		if (view.viewType == '2DHeatmap' && view.options.plotType == "Comparison") {
			_comparisonViewJs.updateComparison(view);
		}
		if (view.viewType == '2DHeatmap' && view.options.plotType == 'PCA') {
			_PCAViewJs.updatePCAHeatmap(view);
		}
		if (view.viewType == '2DHeatmap' && view.options.plotType == 'Umap') {
			_UmapViewJs.updateUmapHeatmap(view);
		}

		if (view.viewType == '3DView') {
			if (view.systemMoleculeDataBoolean) {
				_DViewsMoleculeViewJs.updateMoleculeGeometryScale(view);
				// changeMoleculeGeometry(view);
				// if (view.options.PBCBoolean) {changeMoleculePeriodicReplicates(view);}
			}
		}
	}
}

function updateAllPlotsMoleculeScale(views) {
	for (var ii = 0; ii < views.length; ii++) {
		var view = views[ii];
		if (view.viewType == '2DHeatmap' && view.options.plotType == "Heatmap") {
			_HeatmapViewJs.updateHeatmap(view);
		}
		if (view.viewType == '2DHeatmap' && view.options.plotType == "Comparison") {
			_comparisonViewJs.updateComparison(view);
		}
		if (view.viewType == '2DHeatmap' && view.options.plotType == 'PCA') {
			_PCAViewJs.updatePCAHeatmap(view);
		}
		if (view.viewType == '2DHeatmap' && view.options.plotType == 'Umap') {
			_UmapViewJs.updateUmapHeatmap(view);
		}

		if (view.viewType == '3DView') {
			if (view.systemMoleculeDataBoolean) {
				_DViewsMoleculeViewJs.updateMoleculeGeometryScale(view);
				// changeMoleculeGeometry(view);
				// if (view.options.PBCBoolean) {changeMoleculePeriodicReplicates(view);}
			}
		}
	}
}

function updateSelectionFromHeatmap(view) {
	console.log('called update heatmap');
	var data = view.data;
	for (var x in data) {
		for (var y in data[x]) {
			if (data[x][y].highlighted) {
				for (var i = 0; i < data[x][y]['list'].length; i++) {
					data[x][y]['list'][i].highlighted = true;
				}
			}
			/* if (data[x][y].selected) {
   	for (var i = 0; i < data[x][y]['list'].length; i++) {
   		data[x][y]['list'][i].selected = true;
   	}
   } */
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

},{"../../3DViews/MoleculeView.js":16,"../../3DViews/PointCloud_selection.js":17,"../HeatmapView.js":2,"../PCAView.js":4,"../UmapView.js":6,"../comparisonView.js":8}],6:[function(require,module,exports){
"use strict";

exports.__esModule = true;
exports.arrangeDataForUmap = arrangeDataForUmap;
exports.getUmapHeatmap = getUmapHeatmap;
exports.updateUmapHeatmap = updateUmapHeatmap;
exports.replotUmapHeatmap = replotUmapHeatmap;

var _UtilitiesJs = require("./Utilities.js");

var _UtilitiesOtherJs = require("../Utilities/other.js");

var _MultiviewControlColorLegendJs = require("../MultiviewControl/colorLegend.js");

var _MaterialsJs = require("./Materials.js");

function arrangeDataForUmap(view) {

	var options = view.options;
	if (options.plotData == 'spatiallyResolvedData') {

		var X = view.options.plotUmapXSpatiallyResolvedData,
		    Y = view.options.plotUmapYSpatiallyResolvedData;

		var Data = view.overallSpatiallyResolvedData;
		var propertyList = view.plotSetup.spatiallyResolvedPropertyList;

		console.log(view.UmapCalculatedSpatiallyResolved != true);

		if (view.UmapCalculatedSpatiallyResolved != true) {

			console.log("start Umap");

			var _require = require('umap-js');

			var UMAP = _require.UMAP;

			var filtered = propertyList.filter(function (value, index, arr) {
				return value != "atom" && value != "x" && value != "y" && value != "z";
			});

			var arrays = getArrays2(Data, filtered);

			// const umap = new UMAP();
			// const embedding = umap.fit(arrays);
			var umap = new UMAP({
				nComponents: 2,
				nEpochs: options.UmapNumEpochs,
				nNeighbors: options.UmapNumNeighbours
			});
			var nEpochs = umap.initializeFit(arrays);
			for (var _i4 = 0; _i4 < nEpochs; _i4++) {
				console.log('start iteration: ', _i4);
				umap.step();
				// console.log('aftre', umap.getEmbedding())
			}
			var embedding = umap.getEmbedding();

			console.log('after umap fitting', embedding);

			for (var i = 0; i < Data.length; i++) {
				for (var j = 1; j <= 2; j++) {
					var tempName = "_Umap" + j.toString();
					Data[i][tempName] = embedding[i][j - 1];
				}
			}
			view.UmapCalculatedSpatiallyResolved = true;
			view.UmapResult = umap;

			console.log("Finished Storing umap");
		}
	}

	if (options.plotData == 'moleculeData') {

		var X = view.options.plotUmapXMoleculeData,
		    Y = view.options.plotUmapYMoleculeData;

		var Data = view.overallMoleculeData;
		var propertyList = view.plotSetup.moleculePropertyList;

		console.log(view.UmapCalculatedMolecule != true);

		if (view.UmapCalculatedMolecule != true) {

			console.log("start PCA");

			var _require2 = require('umap-js');

			var UMAP = _require2.UMAP;

			var filtered = propertyList.filter(function (value, index, arr) {
				return value != "atom" && value != "x" && value != "y" && value != "z";
			});

			var arrays = getArrays2(Data, filtered);

			var umap = new UMAP({
				nComponents: 2,
				nEpochs: options.UmapNumEpochs,
				nNeighbors: options.UmapNumNeighbours
			});
			var nEpochs = umap.initializeFit(arrays);
			for (var _i5 = 0; _i5 < nEpochs; _i5++) {
				console.log('start iteration: ', _i5);
				umap.step();
				// console.log('aftre', umap.getEmbedding())
			}
			var embedding = umap.getEmbedding();

			console.log('after umap fitting', embedding);

			for (var i = 0; i < Data.length; i++) {
				for (var j = 1; j <= 2; j++) {
					var tempName = "_Umap" + j.toString();
					Data[i][tempName] = embedding[i][j - 1];
				}
			}
			view.UmapCalculatedSpatiallyResolved = true;
			view.UmapResult = umap;

			console.log("Finished Storing umap");
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

		if (!(heatmapX in view.data)) {
			view.data[heatmapX] = {};
		}

		if (!(heatmapY in view.data[heatmapX])) {
			view.data[heatmapX][heatmapY] = { list: [], selected: true, highlighted: false };
		}
		view.data[heatmapX][heatmapY]['list'].push(Data[i]);
	}
}

function getUmapHeatmap(view) {

	var options = view.options;

	var data = view.data;

	var num = heatmapPointCount(data);

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

	//var xPlotScale = d3.scaleLinear().domain([0, options.numPerSide]).range([-50,50]);
	//var yPlotScale = d3.scaleLinear().domain([0, options.numPerSide]).range([-50,50]);
	var xPlotScale = view.xPlotScale;
	var yPlotScale = view.yPlotScale;

	var XYtoHeatmapMap = {};

	for (var x in data) {
		for (var y in data[x]) {
			XYtoHeatmapMap[x] = XYtoHeatmapMap.x || {};
			XYtoHeatmapMap[x][y] = i;

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
				sizes[i] = options.pointCloudSize;
				alphas[i] = options.pointCloudAlpha;
			} else {
				colors[i3 + 0] = 1;
				colors[i3 + 1] = 1;
				colors[i3 + 2] = 1;
				sizes[i] = options.pointCloudSize;
				alphas[i] = options.pointCloudAlpha / 2;
			}

			if (data[x][y].highlighted || isAnyHighlighted(data[x][y]['list'])) {
				// data[x][y].highlighted = true;
				// view.highlightedIndexList.push(i);
				sizes[i] = 3 * sizes[i];
			} else {
				// data[x][y].highlighted = false;
				// view.highlightedIndexList.splice(view.highlightedIndexList.indexOf(i),1);
			}

			i++;
			i3 += 3;

			var tempInfo = { x: xPlot - 50,
				y: yPlot - 50,
				numberDatapointsRepresented: numberDatapointsRepresented,
				xStart: view.xScale.invertExtent(x)[0],
				xEnd: view.xScale.invertExtent(x)[1],
				yStart: view.yScale.invertExtent(y)[0],
				yEnd: view.yScale.invertExtent(y)[1],
				heatmapX: x,
				heatmapY: y
			};
			//console.log(tempInfo);
			//console.log(view.xScale.invertExtent(""+xPlot)[0], view.xScale.invertExtent(""+xPlot)[1])
			heatmapInformation.push(tempInfo);
		}
	}
	view.heatmapInformation = heatmapInformation;
	view.XYtoHeatmapMap = XYtoHeatmapMap;
	geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
	geometry.setAttribute('customColor', new THREE.BufferAttribute(colors, 3));
	geometry.setAttribute('size', new THREE.BufferAttribute(sizes, 1));
	geometry.setAttribute('alpha', new THREE.BufferAttribute(alphas, 1));

	var material = _MaterialsJs.getHeatmapMaterial();
	var System = new THREE.Points(geometry, material);

	return System;
}

function updateUmapHeatmap(view) {
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
			if (data[x][y].highlighted || isAnyHighlighted(data[x][y]['list'])) {
				// data[x][y].highlighted = true;
				// view.highlightedIndexList.push(i);
				sizes[i] = 3 * sizes[i];
			} else {
				// data[x][y].highlighted = false;
				// view.highlightedIndexList.splice(view.highlightedIndexList.indexOf(i),1);
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

function replotUmapHeatmap(view) {
	if ("covariance" in view) {
		view.scene.remove(view.covariance);
		delete view.covariance;
	}

	if ("comparison" in view) {
		view.scene.remove(view.comparison);
		delete view.comparison;
	}

	if ("heatmap" in view) {
		view.scene.remove(view.heatmap);
		delete view.heatmap;
	}

	if ("PCAGroup" in view) {
		view.scene.remove(view.PCAGroup);
		delete view.PCAGroup;
	}

	if ("UmapGroup" in view) {
		view.scene.remove(view.UmapGroup);
		delete view.UmapGroup;
	}

	console.log("replotting Umap Heatmap");
	//initializePCATooltip(view);
	arrangeDataForUmap(view);
	var UmapGroup = new THREE.Group();

	var UmapPlot = getUmapHeatmap(view);
	var UmapAxis = _UtilitiesJs.getAxis(view);

	UmapGroup.add(UmapPlot);
	UmapGroup.add(UmapAxis);

	view.heatmapPlot = UmapPlot;
	view.UmapGroup = UmapGroup;
	view.scene.add(UmapGroup);
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

function isAnyHighlighted(list) {

	for (var i = 0; i < list.length; i++) {
		if (list[i].highlighted) {
			return true;
		}
	}
	return false;
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

},{"../MultiviewControl/colorLegend.js":27,"../Utilities/other.js":34,"./Materials.js":3,"./Utilities.js":7,"umap-js":50}],7:[function(require,module,exports){
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

},{}],8:[function(require,module,exports){
"use strict";

exports.__esModule = true;
exports.arrangeDataToComparison = arrangeDataToComparison;
exports.getComparison = getComparison;
exports.updateComparison = updateComparison;
exports.replotComparison = replotComparison;

var _UtilitiesJs = require("./Utilities.js");

var _UtilitiesOtherJs = require("../Utilities/other.js");

var _MultiviewControlColorLegendJs = require("../MultiviewControl/colorLegend.js");

var _MaterialsJs = require("./Materials.js");

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
	view.xValue = xValue;
	view.yValue = yValue;

	//const colorArray = [[1, 0, 0],[0, 1, 0], [0, 0, 1], [1, 1, 0], [1, 0, 1], [0, 1, 1], [1, 1, 1]];
	var colorArray = [{ 'r': 1, 'g': 0, 'b': 0 }, { 'r': 0, 'g': 1, 'b': 0 }, { 'r': 0, 'g': 0, 'b': 1 }, { 'r': 1, 'g': 1, 'b': 0 }, { 'r': 1, 'g': 0, 'b': 1 }, { 'r': 0, 'g': 1, 'b': 1 }, { 'r': 1, 'g': 1, 'b': 1 }];
	var colorDict = {};
	var colorCounter = 0;

	// var voxelToHeatmapMap = new Uint32Array(Data.length);
	for (var i = 0; i < Data.length; i++) {
		var systemName = Data[i].name;
		if (!(systemName in colorDict)) {
			colorDict[systemName] = colorArray[colorCounter];
			colorCounter += 1;
		}
		var heatmapX = xMap(Data[i]);
		var heatmapY = yMap(Data[i]);

		if (!(heatmapX in view.data)) {
			view.data[heatmapX] = {};
		}

		if (!(heatmapY in view.data[heatmapX])) {
			view.data[heatmapX][heatmapY] = { list: [], selected: true, highlighted: false };
		}
		view.data[heatmapX][heatmapY]['list'].push(Data[i]);
	}
	view.colorDict = colorDict;
}

function getUniqueSelectedSystemList(list) {
	var result = [];

	for (var i = 0; i < list.length; i++) {
		if (list[i].selected) {
			if (!result.includes(list[i].name)) {
				result.push(list[i].name);
			}
		}
	}
	return result;
}

function getColorAverage(systemList, colorDict) {
	var weight = 1 / systemList.length;
	var result = { 'r': 0, 'g': 0, 'b': 0 };
	var tempColor;
	systemList.forEach(function (systemName) {
		tempColor = colorDict[systemName];
		result.r += weight * tempColor.r;
		result.g += weight * tempColor.g;
		result.b += weight * tempColor.b;
	});
	//console.log('result color', result);
	return result;
}

function getComparison(view) {

	var options = view.options;

	var data = view.data;

	var num = heatmapPointCount(data);

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

	var colorDict = view.colorDict;

	var i = 0;
	var i3 = 0;

	//var xPlotScale = d3.scaleLinear().domain([0, options.numPerSide]).range([-50,50]);
	//var yPlotScale = d3.scaleLinear().domain([0, options.numPerSide]).range([-50,50]);
	var xPlotScale = view.xPlotScale;
	var yPlotScale = view.yPlotScale;

	var XYtoHeatmapMap = {};

	for (var x in data) {
		for (var y in data[x]) {
			XYtoHeatmapMap[x] = XYtoHeatmapMap.x || {};
			XYtoHeatmapMap[x][y] = i;

			var xPlot = xPlotScale(parseFloat(x));
			var yPlot = yPlotScale(parseFloat(y));

			positions[i3 + 0] = xPlot;
			positions[i3 + 1] = yPlot;
			positions[i3 + 2] = 0;

			// var numberDatapointsRepresented = countListSelected(data[x][y]['list']);
			var systemRepresented = getUniqueSelectedSystemList(data[x][y]['list']);
			if (systemRepresented.length > 0) {
				var color = getColorAverage(systemRepresented, colorDict);

				colors[i3 + 0] = color.r;
				colors[i3 + 1] = color.g;
				colors[i3 + 2] = color.b;
				sizes[i] = options.pointCloudSize * 0.5 * systemRepresented.length;
				alphas[i] = options.pointCloudAlpha;
			} else {
				colors[i3 + 0] = 1;
				colors[i3 + 1] = 1;
				colors[i3 + 2] = 1;
				sizes[i] = options.pointCloudSize * 0.5;
				alphas[i] = options.pointCloudAlpha / 2;
			}

			if (data[x][y].highlighted || isAnyHighlighted(data[x][y]['list'])) {
				sizes[i] = 3 * sizes[i];
			} else {}

			i++;
			i3 += 3;

			var tempInfo = { x: xPlot - 50,
				y: yPlot - 50,
				systemRepresented: systemRepresented,
				xStart: view.xScale.invertExtent(x)[0],
				xEnd: view.xScale.invertExtent(x)[1],
				yStart: view.yScale.invertExtent(y)[0],
				yEnd: view.yScale.invertExtent(y)[1],
				heatmapX: x,
				heatmapY: y
			};
			heatmapInformation.push(tempInfo);
		}
	}

	view.heatmapInformation = heatmapInformation;
	view.XYtoHeatmapMap = XYtoHeatmapMap;
	geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
	geometry.setAttribute('customColor', new THREE.BufferAttribute(colors, 3));
	geometry.setAttribute('size', new THREE.BufferAttribute(sizes, 1));
	geometry.setAttribute('alpha', new THREE.BufferAttribute(alphas, 1));

	var material = _MaterialsJs.getHeatmapMaterial();
	var System = new THREE.Points(geometry, material);

	return System;
}

function updateComparison(view) {
	var options = view.options;
	var System = view.heatmapPlot;
	var data = view.data;
	var num = heatmapPointCount(data);
	var colors = new Float32Array(num * 3);
	var sizes = new Float32Array(num);
	var alphas = new Float32Array(num);
	var colorDict = view.colorDict;

	var lut = new THREE.Lut(options.colorMap, 500);
	lut.setMax(1000);
	lut.setMin(0);
	view.lut = lut;

	var i = 0;
	var i3 = 0;
	for (var x in data) {
		for (var y in data[x]) {

			var systemRepresented = getUniqueSelectedSystemList(data[x][y]['list']);
			if (systemRepresented.length > 0) {
				var color = getColorAverage(systemRepresented, colorDict);

				colors[i3 + 0] = color.r;
				colors[i3 + 1] = color.g;
				colors[i3 + 2] = color.b;
				sizes[i] = options.pointCloudSize * 0.5 * systemRepresented.length;
				alphas[i] = options.pointCloudAlpha;
			} else {
				colors[i3 + 0] = 1;
				colors[i3 + 1] = 1;
				colors[i3 + 2] = 1;
				sizes[i] = options.pointCloudSize * 0.5;
				alphas[i] = options.pointCloudAlpha / 2;
			}
			if (data[x][y].highlighted || isAnyHighlighted(data[x][y]['list'])) {
				sizes[i] = 3 * sizes[i];
			} else {}
			i++;
			i3 += 3;
		}
	}

	//geometry.addAttribute( 'position', new THREE.BufferAttribute( positions, 3 ) );
	System.geometry.setAttribute('customColor', new THREE.BufferAttribute(colors, 3));
	System.geometry.setAttribute('size', new THREE.BufferAttribute(sizes, 1));
	System.geometry.setAttribute('alpha', new THREE.BufferAttribute(alphas, 1));
}

function replotComparison(view) {

	if ("covariance" in view) {
		view.scene.remove(view.covariance);
		delete view.covariance;
	}

	if ("comparison" in view) {
		view.scene.remove(view.comparison);
		delete view.comparison;
	}

	if ("heatmap" in view) {
		view.scene.remove(view.heatmap);
		delete view.heatmap;
	}

	if ("PCAGroup" in view) {
		view.scene.remove(view.PCAGroup);
		delete view.PCAGroup;
	}

	if ("UmapGroup" in view) {
		view.scene.remove(view.UmapGroup);
		delete view.UmapGroup;
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
	var comparison = new THREE.Group();

	var comparisonPlot = getComparison(view);
	var comparisonAxis = _UtilitiesJs.getAxis(view);
	//var heatmapLabels = getHeatmapLabels(view);

	/*for (const systemName in comparisonPlots) {
 	comparison.add(comparisonPlots[systemName]);
 }*/
	comparison.add(comparisonPlot);
	comparison.add(comparisonAxis);
	//heatmap.add(heatmapLabels)
	view.heatmapPlot = comparisonPlot;
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

function heatmapPointCount(data) {
	var count = 0;
	for (var x in data) {
		for (var y in data[x]) {
			count = count + 1;
		}
	}

	return count;
}

function isAnyHighlighted(list) {

	for (var i = 0; i < list.length; i++) {
		if (list[i].highlighted) {
			return true;
		}
	}
	return false;
}

},{"../MultiviewControl/colorLegend.js":27,"../Utilities/other.js":34,"./Materials.js":3,"./Utilities.js":7}],9:[function(require,module,exports){
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
		delete view.covariance;
	}

	if ("comparison" in view) {
		view.scene.remove(view.comparison);
		delete view.comparison;
	}

	if ("heatmap" in view) {
		view.scene.remove(view.heatmap);
		delete view.heatmap;
	}

	if ("PCAGroup" in view) {
		view.scene.remove(view.PCAGroup);
		delete view.PCAGroup;
	}

	if ("UmapGroup" in view) {
		view.scene.remove(view.UmapGroup);
		delete view.UmapGroup;
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

},{"../MultiviewControl/colorLegend.js":27,"../Utilities/other.js":34,"./Utilities.js":7}],10:[function(require,module,exports){
"use strict";

exports.__esModule = true;
exports.initialize2DHeatmapSetup = initialize2DHeatmapSetup;

var _HeatmapViewJs = require("./HeatmapView.js");

var _covarianceViewJs = require("./covarianceView.js");

var _PCAViewJs = require("./PCAView.js");

var _comparisonViewJs = require('./comparisonView.js');

var _UmapViewJs = require('./UmapView.js');

var _MultiviewControlCalculateViewportSizesJs = require("../MultiviewControl/calculateViewportSizes.js");

var _MultiviewControlActive2DViewJs = require("../MultiviewControl/active2DView.js");

var _MultiviewControlColorLegendJs = require("../MultiviewControl/colorLegend.js");

var _selectionJs = require("./selection.js");

var _SelectionUtilitiesJs = require("./Selection/Utilities.js");

var _UtilitiesSaveDataJs = require("../Utilities/saveData.js");

var _D3D_connection_heatmapJs = require("../2D3D_connection_heatmap.js");

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
		highlightedIndexList: [],
		IntersectState: null,
		INTERSECT: null,
		activate2DPlotSpatiallyResolved: function activate2DPlotSpatiallyResolved() {
			_MultiviewControlActive2DViewJs.activate2DPlotSpatiallyResolved(plotSetup, viewSetup, views);
		},
		deactivate2DPlotSpatiallyResolved: function deactivate2DPlotSpatiallyResolved() {
			_MultiviewControlActive2DViewJs.deactivate2DPlotsSpatiallyResolved(plotSetup, views);
		},
		activate2DPlotMolecule: function activate2DPlotMolecule() {
			_MultiviewControlActive2DViewJs.activate2DPlotMolecule(plotSetup, viewSetup, views);
		},
		deactivate2DPlotMolecule: function deactivate2DPlotMolecule() {
			_MultiviewControlActive2DViewJs.deactivate2DPlotsMolecule(plotSetup, views);
		},
		options: new function () {
			this.plotID = "";
			this.plotType = "Undefined";
			this.activePlotSpatiallyResolved = false;
			this.activePlotMolecule = false;
			this.backgroundColor = "#000000";
			this.backgroundAlpha = 0.0;
			this.plotData = "spatiallyResolvedData";
			this.numPerSide = 100;
			this.pointCloudAlpha = 1.0;
			this.pointCloudSize = 3.0;
			this.colorMap = 'rainbow';
			this.resetCamera = function () {
				viewSetup.controller.reset();
				_D3D_connection_heatmapJs.render(views, plotSetup);
			};
			this.replotHeatmap = function () {
				_HeatmapViewJs.replotHeatmap(viewSetup);
				_D3D_connection_heatmapJs.render(views, plotSetup);
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
				_SelectionUtilitiesJs.selectAllSpatiallyResolvedData(views, viewSetup.overallSpatiallyResolvedData);
				_selectionJs.clickUpdateAll2DHeatmaps(views);
				_SelectionUtilitiesJs.updateAllPlotsSpatiallyResolved(views);
			};
			this.deselectAllSpatiallyResolvedData = function () {
				_SelectionUtilitiesJs.deselectAllSpatiallyResolvedData(views, viewSetup.overallSpatiallyResolvedData);
				_selectionJs.clickUpdateAll2DHeatmaps(views);
				_SelectionUtilitiesJs.updateAllPlotsSpatiallyResolved(views);
			};

			this.selectAllMoleculeData = function () {
				_SelectionUtilitiesJs.selectAllMoleculeData(views, viewSetup.overallMoleculeData);
				_selectionJs.clickUpdateAll2DHeatmaps(views);
				_SelectionUtilitiesJs.updateAllPlotsMolecule(views);
			};
			this.deselectAllMoleculeData = function () {
				_SelectionUtilitiesJs.deselectAllMoleculeData(views, viewSetup.overallMoleculeData);
				_selectionJs.clickUpdateAll2DHeatmaps(views);
				_SelectionUtilitiesJs.updateAllPlotsMolecule(views);
			};

			this.selectHighlightedSpatiallyResolvedData = function () {
				_selectionJs.selectHighlightedSpatiallyResolvedData(views, viewSetup.overallSpatiallyResolvedData);
				_SelectionUtilitiesJs.updateAllPlotsSpatiallyResolved(views);
			};
			this.deselectHighlightedSpatiallyResolvedData = function () {
				_selectionJs.deselectHighlightedSpatiallyResolvedData(views, viewSetup.overallSpatiallyResolvedData);
				_SelectionUtilitiesJs.updateAllPlotsSpatiallyResolved(views);
			};

			this.selectHighlightedMoleculeData = function () {
				_selectionJs.selectHighlightedMoleculeData(views, viewSetup.overallMoleculeData);
				_SelectionUtilitiesJs.updateAllPlotsMolecule(views);
			};
			this.deselectHighlightedMoleculeData = function () {
				_selectionJs.deselectHighlightedMoleculeData(views, viewSetup.overallMoleculeData);
				_SelectionUtilitiesJs.updateAllPlotsMolecule(views);
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
				_D3D_connection_heatmapJs.render(views, plotSetup);
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
				_D3D_connection_heatmapJs.render(views, plotSetup);
			};

			this.replotComparison = function () {
				_comparisonViewJs.replotComparison(viewSetup);
				_D3D_connection_heatmapJs.render(views, plotSetup);
			};

			this.plotUmapXSpatiallyResolvedData = "_Umap1";
			this.plotUmapYSpatiallyResolvedData = "_Umap2";
			this.plotUmapXTransformSpatiallyResolvedData = "linear";
			this.plotUmapYTransformSpatiallyResolvedData = "linear";

			this.UmapNumEpochs = 100;
			this.UmapNumNeighbours = 15;
			this.plotUmapXMoleculeData = "_Umap1";
			this.plotUmapYMoleculeData = "_Umap2";
			this.plotUmapXTransformMoleculeData = "linear";
			this.plotUmapYTransformMoleculeData = "linear";

			this.replotUmapHeatmap = function () {
				_UmapViewJs.replotUmapHeatmap(viewSetup);
				_D3D_connection_heatmapJs.render(views, plotSetup);
			};

			this.render = function () {
				_D3D_connection_heatmapJs.render(views, plotSetup);
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

},{"../2D3D_connection_heatmap.js":1,"../MultiviewControl/active2DView.js":25,"../MultiviewControl/calculateViewportSizes.js":26,"../MultiviewControl/colorLegend.js":27,"../Utilities/saveData.js":37,"./HeatmapView.js":2,"./PCAView.js":4,"./Selection/Utilities.js":5,"./UmapView.js":6,"./comparisonView.js":8,"./covarianceView.js":9,"./selection.js":11}],11:[function(require,module,exports){
"use strict";

exports.__esModule = true;
exports.updatePlaneSelection = updatePlaneSelection;
exports.updateBrushSelection = updateBrushSelection;
exports.selectionControl = selectionControl;
exports.clickHeatmap = clickHeatmap;
exports.hoverHeatmap = hoverHeatmap;
exports.highlightVia2DHeatmap = highlightVia2DHeatmap;
exports.unhighlightVia2DHeatmap = unhighlightVia2DHeatmap;
exports.clickUpdateVia2DHeatmap = clickUpdateVia2DHeatmap;
exports.unhighlightAll = unhighlightAll;
exports.deselectHighlightedSpatiallyResolvedData = deselectHighlightedSpatiallyResolvedData;
exports.selectHighlightedSpatiallyResolvedData = selectHighlightedSpatiallyResolvedData;
exports.deselectHighlightedMoleculeData = deselectHighlightedMoleculeData;
exports.selectHighlightedMoleculeData = selectHighlightedMoleculeData;
exports.clickUpdateAll2DHeatmaps = clickUpdateAll2DHeatmaps;

var _SelectionUtilitiesJs = require("./Selection/Utilities.js");

var _tooltipJs = require("./tooltip.js");

function spawnPlane(view) {

	var selectionPlaneMaterial = new THREE.MeshBasicMaterial({ color: 0xffffff, opacity: 0.5, transparent: true, side: THREE.DoubleSide });
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
	var scene = view.scene;

	var mousePosition = view.mousePosition;

	var selectionPlane = view.currentSelectionPlane;

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
	selectionPlane.geometry.attributes.position.needsUpdate = true;
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

		if (view.viewType == '2DHeatmap' && (view.options.plotType == "Heatmap" || view.options.plotType == 'PCA' || view.options.plotType == 'Umap' || view.options.plotType == 'Comparison')) {
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
						data[x][y].highlighted = true;
						for (var i = 0; i < data[x][y]['list'].length; i++) {
							data[x][y]['list'][i].highlighted = true;
						}
					}
				}
			}
			clickUpdateAll2DHeatmaps(views);
			_SelectionUtilitiesJs.updateAllPlots(views);
		}
	}
}

function updateBrushSelection(views, view) {
	//var tempSelectionPlane = temp_view.scene.getObjectByName('selectionPlane');
	var tempSelectionBrush = view.currentSelectionBrush;
	//console.log(tempSelectionPlane)
	if (tempSelectionBrush != null) {
		if (view.viewType == '2DHeatmap' && (view.options.plotType == "Heatmap" || view.options.plotType == 'PCA' || view.options.plotType == 'Umap' || view.options.plotType == 'Comparison')) {
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
						data[x][y].highlighted = true;
						for (var i = 0; i < data[x][y]['list'].length; i++) {
							data[x][y]['list'][i].highlighted = true;
						}
					}
					// else { data[x][y].selected = false;}
				}
			}
			clickUpdateAll2DHeatmaps(views);
			// updateSelectionFromHeatmap(view);	
		}
	}
	_SelectionUtilitiesJs.updateAllPlots(views);
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

function clickHeatmap(view, views) {

	if (view.INTERSECTED != null) {
		// console.log('currently heatmap point under mouse', view.highlightedIndexList)
		//currently heatmap point under mouse
		var indexInList = view.highlightedIndexList.indexOf(view.INTERSECTED);
		var heatmapX = view.heatmapInformation[view.INTERSECTED].heatmapX;
		var heatmapY = view.heatmapInformation[view.INTERSECTED].heatmapY;
		if (indexInList > -1) {
			// console.log('was highlighted')
			// was highlighted
			//if (areAllHighlighted(view.data[heatmapX][heatmapY].list)) {
			if (areAllTrue(view.IntersectState)) {
				// console.log('all are selected, thus unhighlight all')
				// all are selected, thus unhighlight all
				unhighlightHeatmapPoints(view.INTERSECTED, view);
				// console.log(view.highlightedIndexList)
				view.highlightedIndexList.splice(indexInList, 1);
				view.IntersectState = null;
				clickUpdateAll2DHeatmaps(views);
				// console.log(view.highlightedIndexList)
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
			highlightAll(view.data[heatmapX][heatmapY].list);
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

function hoverHeatmap(view, mouseEvent) {
	var mouse = new THREE.Vector2();
	mouse.set((mouseEvent.clientX - view.windowLeft) / view.windowWidth * 2 - 1, -((mouseEvent.clientY - view.windowTop) / view.windowHeight) * 2 + 1);
	view.raycaster.params.Points.threshold = view.options.pointCloudSize / 4;
	view.raycaster.setFromCamera(mouse.clone(), view.camera);
	var intersects = view.raycaster.intersectObject(view.heatmapPlot);
	if (intersects.length > 0) {
		// has intersection
		if (view.INTERSECTED != intersects[0].index) {
			// changed intersection
			if (view.INTERSECTED != null) {
				// previously has intersection,
				if (view.highlightedIndexList.indexOf(view.INTERSECTED) == -1) {
					// previously hovered was not in highlight list, unhighlight all;
					unhighlightHeatmapPoints(view.INTERSECTED, view);
				} else {
					// previously hovered was in highlight list, back to its original state
					var heatmapX = view.heatmapInformation[view.INTERSECTED].heatmapX;
					var heatmapY = view.heatmapInformation[view.INTERSECTED].heatmapY;
					// console.log('calling restore 1', view.IntersectState);
					if (view.IntersectState) {
						restoreState(view.data[heatmapX][heatmapY].list, view.IntersectState);
						view.IntersectState = null;
					} /*else {
       unhighlightHeatmapPoints(view.INTERSECTED, view);
       }*/
				}
			}
			// current intersection
			view.INTERSECTED = intersects[0].index;
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

			_tooltipJs.updateHeatmapTooltip(view);
			return true;
		} else {
			//same intersection as before, nothing to do;
			_tooltipJs.updateHeatmapTooltip(view);
			return false;
		}
	} else {
		// no intersection
		if (view.INTERSECTED != null) {
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
				if (view.IntersectState) {
					restoreState(view.data[heatmapX][heatmapY].list, view.IntersectState);
					view.IntersectState = null;
				} /*else {
      unhighlightHeatmapPoints(view.INTERSECTED, view);
      }*/
			}
			view.INTERSECTED = null;
			_tooltipJs.updateHeatmapTooltip(view);
			return true;
		} else {
			_tooltipJs.updateHeatmapTooltip(view);
			return false;
		}
	}
}

function highlightVia2DHeatmap(heatmapPointIndex, twoDPlot) {
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

function unhighlightVia2DHeatmap(heatmapPointIndex, twoDPlot) {
	var heatmapX = twoDPlot.heatmapInformation[heatmapPointIndex].heatmapX;
	var heatmapY = twoDPlot.heatmapInformation[heatmapPointIndex].heatmapY;
	if (twoDPlot.highlightedIndexList.indexOf(heatmapPointIndex) == -1) {
		// previously hovered was not in highlight list, unhighlight all;
		unhighlightHeatmapPoints(heatmapPointIndex, twoDPlot);
	} else {
		// previously hovered was in highlight list, back to its original state
		if (twoDPlot.IntersectState) {
			restoreState(twoDPlot.data[heatmapX][heatmapY].list, twoDPlot.IntersectState);
			twoDPlot.IntersectState = null;
		}
		// restoreState(twoDPlot.data[heatmapX][heatmapY].list, twoDPlot.IntersectState);
		// twoDPlot.IntersectState = null;
	}
}

function clickUpdateVia2DHeatmap(heatmapPointIndex, twoDPlot, views) {
	var indexInList = twoDPlot.highlightedIndexList.indexOf(heatmapPointIndex);
	var heatmapX = twoDPlot.heatmapInformation[heatmapPointIndex].heatmapX;
	var heatmapY = twoDPlot.heatmapInformation[heatmapPointIndex].heatmapY;

	if (indexInList > -1) {
		console.log('was highlighted');
		// was highlighted
		//if (areAllHighlighted(view.data[heatmapX][heatmapY].list)) {
		if (areAllTrue(twoDPlot.IntersectState)) {
			console.log('all are selected, thus unhighlight all');
			// all are selected, thus unhighlight all
			unhighlightHeatmapPoints(heatmapPointIndex, twoDPlot);
			console.log(twoDPlot.highlightedIndexList);
			twoDPlot.highlightedIndexList.splice(indexInList, 1);
			twoDPlot.IntersectState = null;
			clickUpdateAll2DHeatmaps(views);
			console.log(twoDPlot.highlightedIndexList);
		} else {
			// console.log('not all are selected, select all')
			// not all are selected, select all
			twoDPlot.data[heatmapX][heatmapY].highlighted = true;
			highlightHeatmapPoints(heatmapPointIndex, twoDPlot);
			// highlightAll(twoDPlot.data[heatmapX][heatmapY].list);
			twoDPlot.IntersectState = null;
			clickUpdateAll2DHeatmaps(views);
		}
	} else {
		console.log('not in list, add to list');
		// not yet highlighted
		highlightHeatmapPoints(heatmapPointIndex, twoDPlot);
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

	dataset.list.forEach(function (datapoint) {
		datapoint.highlighted = true;
	});
}

function unhighlightHeatmapPoints(index, view) {
	var heatmapX = view.heatmapInformation[index].heatmapX;
	var heatmapY = view.heatmapInformation[index].heatmapY;

	var dataset = view.data[heatmapX][heatmapY];
	//dataset.highlighted = false;

	dataset.list.forEach(function (datapoint) {
		datapoint.highlighted = false;
	});
}

function unhighlightAll(views) {
	for (var ii = 0; ii < views.length; ++ii) {
		var view = views[ii];
		if (view.viewType == "3DView") {
			if (view.systemMoleculeDataBoolean) {
				view.systemMoleculeData.forEach(function (datapoint) {
					datapoint.highlighted = false;
				});
			}

			if (view.systemSpatiallyResolvedDataBoolean) {
				view.systemSpatiallyResolvedData.forEach(function (datapoint) {
					datapoint.highlighted = false;
				});
			}
		} else if (view.viewType == "2DHeatmap") {
			if ((view.options.plotType == "Heatmap" || view.options.plotType == "Comparison" || view.options.plotType == "PCA" || view.options.plotType == "Umap") && typeof view.heatmapPlot != "undefined") {
				view.highlightedIndexList = [];
				for (var x in view.data) {
					for (var y in view.data[x]) {
						view.data[x][y].highlighted = false;
					}
				}
			}
		}
	}
}

function deselectHighlightedSpatiallyResolvedData(views, overallSpatiallyResolvedData) {
	for (var i = 0; i < overallSpatiallyResolvedData.length; i++) {
		if (overallSpatiallyResolvedData[i].highlighted) {
			overallSpatiallyResolvedData[i].selected = false;
		};
		overallSpatiallyResolvedData[i].highlighted = false;
	}
	clickUpdateAll2DHeatmaps(views);
}

function selectHighlightedSpatiallyResolvedData(views, overallSpatiallyResolvedData) {
	for (var i = 0; i < overallSpatiallyResolvedData.length; i++) {
		if (overallSpatiallyResolvedData[i].highlighted) {
			overallSpatiallyResolvedData[i].selected = true;
		};
		overallSpatiallyResolvedData[i].highlighted = false;
	}
	clickUpdateAll2DHeatmaps(views);
}

function deselectHighlightedMoleculeData(views, overallMoleculeData) {
	for (var i = 0; i < overallMoleculeData.length; i++) {
		if (overallMoleculeData[i].highlighted) {
			overallMoleculeData[i].selected = false;
		};
		overallMoleculeData[i].highlighted = false;
	}
	clickUpdateAll2DHeatmaps(views);
}

function selectHighlightedMoleculeData(views, overallMoleculeData) {
	for (var i = 0; i < overallMoleculeData.length; i++) {
		if (overallMoleculeData[i].highlighted) {
			overallMoleculeData[i].selected = true;
		};
		overallMoleculeData[i].highlighted = false;
	}
	clickUpdateAll2DHeatmaps(views);
}

function clickUpdateAll2DHeatmaps(views) {
	for (var ii = 0; ii < views.length; ++ii) {
		var view = views[ii];
		if (view.viewType == "2DHeatmap" && (view.options.plotType == "Heatmap" || view.options.plotType == "Comparison" || view.options.plotType == "PCA" || view.options.plotType == "Umap") && typeof view.heatmapPlot != "undefined") {
			var i = 0;
			for (var x in view.data) {
				for (var y in view.data[x]) {
					var highlightedFound = isAnyHighlighted(view.data[x][y].list);
					if (highlightedFound) {
						view.data[x][y].highlighted = true;
						if (view.highlightedIndexList.indexOf(i) == -1) {
							// console.log('adding to from highlighted list')
							view.highlightedIndexList.push(i);
						}
					} else {
						view.data[x][y].highlighted = false;
						var indexInList = view.highlightedIndexList.indexOf(i);
						if (indexInList != -1) {
							// console.log('removing from highlighted list')
							view.highlightedIndexList.splice(i, 1);
						}
					}

					i++;
				}
			}
		}
	}
}

function isAnyHighlighted(list) {
	for (var i = 0; i < list.length; i++) {
		if (list[i].highlighted) {
			return true;
		}
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
		if (list[i].highlighted == false) {
			return false;
		}
	}
	return true;
}

function areAllTrue(list) {
	for (var i = 0; i < list.length; i++) {
		if (list[i] == false) {
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

},{"./Selection/Utilities.js":5,"./tooltip.js":13}],12:[function(require,module,exports){
"use strict";

exports.__esModule = true;
exports.setupOptionBox2DHeatmap = setupOptionBox2DHeatmap;
exports.setupOptionBox2DHeatmapFolder = setupOptionBox2DHeatmapFolder;
exports.setupOptionBox2DCovarianceFolder = setupOptionBox2DCovarianceFolder;
exports.setupOptionBox2DPCAFolder = setupOptionBox2DPCAFolder;
exports.setupOptionBox2DUmapFolder = setupOptionBox2DUmapFolder;
exports.setupOptionBox2DComparisonFolder = setupOptionBox2DComparisonFolder;

var _covarianceViewJs = require("./covarianceView.js");

var _HeatmapViewJs = require("./HeatmapView.js");

var _comparisonViewJs = require("./comparisonView.js");

var _PCAViewJs = require("./PCAView.js");

var _MultiviewControlColorLegendJs = require("../MultiviewControl/colorLegend.js");

var _UtilitiesOtherJs = require("../Utilities/other.js");

var _UtilitiesColorMapJs = require("../Utilities/colorMap.js");

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

	gui.add(options, 'plotID');
	gui.add(options, 'plotType', { 'Heatmap': 'Heatmap', 'Comparison': 'Comparison', 'Correlation': 'Correlation', 'PCA': 'PCA', 'Umap': 'Umap' }).name('Plot Type').onChange(function (value) {
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

		if (value == "PCA") {
			setupOptionBox2DPCAFolder(view, plotSetup, plotSetupFolder);
		}

		if (value == "Umap") {
			setupOptionBox2DUmapFolder(view, plotSetup, plotSetupFolder);
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
			if (value == 'spatiallyResolvedData') {
				moleculeFolder.close();
				spatiallyResolvedFolder.open();
			}
			if (value == 'moleculeData') {
				moleculeFolder.open();
				spatiallyResolvedFolder.close();
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
		plotFolder.add(options, 'activePlotMolecule').name('active plot').onChange(function (value) {
			if (value == true) {
				view.activate2DPlotMolecule();
			} else {
				view.deactivate2DPlotMolecule();
			}
		});
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

		plotFolder.add(options, 'selectHighlightedMoleculeData').name('Select highlighted');
		plotFolder.add(options, 'deselectHighlightedMoleculeData').name('Deselect highlighted');
	}

	if (view.overallMoleculeDataBoolean == false && view.overallSpatiallyResolvedDataBoolean) {
		plotFolder.add(options, 'activePlotSpatiallyResolved').name('active plot').onChange(function (value) {
			if (value == true) {
				view.activate2DPlotSpatiallyResolved();
			} else {
				view.deactivate2DPlotSpatiallyResolved();
			}
		});
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

		plotFolder.add(options, 'selectHighlightedSpatiallyResolvedData').name('Select highlighted');
		plotFolder.add(options, 'deselectHighlightedSpatiallyResolvedData').name('Deselect highlighted');
	}

	plotFolder.add(options, 'replotHeatmap').name("Plot");
	plotFolder.open();

	viewFolder.add(options, 'colorMap', _UtilitiesColorMapJs.colorMapDict).name('Color Scheme').onChange(function (value) {
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
		moleculeFolder.add(options, 'activePlotMolecule').name('active plot').onChange(function (value) {
			if (value == true) {
				view.activate2DPlotMolecule();
			} else {
				view.deactivate2DPlotMolecule();
			}
		});
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

		moleculeFolder.add(options, 'selectHighlightedMoleculeData').name('Select highlighted');
		moleculeFolder.add(options, 'deselectHighlightedMoleculeData').name('Deselect highlighted');

		moleculeFolder.close();

		spatiallyResolvedFolder.add(options, 'activePlotSpatiallyResolved').name('active plot').onChange(function (value) {
			if (value == true) {
				view.activate2DPlotSpatiallyResolved();
			} else {
				view.deactivate2DPlotSpatiallyResolved();
			}
		});
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

		spatiallyResolvedFolder.add(options, 'selectHighlightedSpatiallyResolvedData').name('Select highlighted');
		spatiallyResolvedFolder.add(options, 'deselectHighlightedSpatiallyResolvedData').name('Deselect highlighted');

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

	viewFolder.add(options, 'colorMap', _UtilitiesColorMapJs.colorMapDict).name('Color Scheme').onChange(function (value) {
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

		plotFolder.add(options, 'selectHighlightedMoleculeData').name('Select highlighted');
		plotFolder.add(options, 'deselectHighlightedMoleculeData').name('Deselect highlighted');
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

		plotFolder.add(options, 'selectHighlightedSpatiallyResolvedData').name('Select highlighted');
		plotFolder.add(options, 'deselectHighlightedSpatiallyResolvedData').name('Deselect highlighted');
	}

	plotFolder.add(options, 'replotPCAHeatmap').name("Calculate & Plot");
	plotFolder.open();

	viewFolder.add(options, 'colorMap', _UtilitiesColorMapJs.colorMapDict).name('Color Scheme').onChange(function (value) {
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

		moleculeFolder.add(options, 'selectHighlightedMoleculeData').name('Select highlighted');
		moleculeFolder.add(options, 'deselectHighlightedMoleculeData').name('Deselect highlighted');

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

		spatiallyResolvedFolder.add(options, 'selectHighlightedSpatiallyResolvedData').name('Select highlighted');
		spatiallyResolvedFolder.add(options, 'deselectHighlightedSpatiallyResolvedData').name('Deselect highlighted');

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

function setupOptionBox2DUmapFolder(view, plotSetup, folder) {
	var gui = view.gui;
	var options = view.options;
	if (view.overallSpatiallyResolvedDataBoolean) {

		var UmapSpatiallyResolvedFeatureList = [];

		for (var i = 1; i <= 2; i++) {
			UmapSpatiallyResolvedFeatureList.push("_Umap" + i.toString());
		}
		var UmapSpatiallyResolvedFeatureChoiceObject = _UtilitiesOtherJs.arrayToIdenticalObject(UmapSpatiallyResolvedFeatureList);
	}

	if (view.overallMoleculeDataBoolean) {

		var UmapMoleculeDataFeatureList = [];

		for (var i = 1; i <= 2; i++) {
			UmapMoleculeDataFeatureList.push("_Umap" + i.toString());
		}
		var UmapMoleculeDataFeatureChoiceObject = _UtilitiesOtherJs.arrayToIdenticalObject(UmapMoleculeDataFeatureList);
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
		plotFolder.add(options, 'UmapNumEpochs', 10, 1000).step(10).name('Num Epochs');

		plotFolder.add(options, 'UmapNumNeighbours', 1, 100).step(1).name('Num Neighbors');

		plotFolder.add(options, 'plotUmapXMoleculeData', UmapMoleculeDataFeatureChoiceObject).name('X').onChange(function (value) {
			//updatePointCloudGeometry(view);
		});

		plotFolder.add(options, 'plotUmapXTransformMoleculeData', { 'linear': 'linear', 'log10': 'log10' }).name('X scale').onChange(function (value) {
			//updatePointCloudGeometry(view);
		});

		plotFolder.add(options, 'plotUmapYMoleculeData', UmapMoleculeDataFeatureChoiceObject).name('Y').onChange(function (value) {
			//updatePointCloudGeometry(view);
		});

		plotFolder.add(options, 'plotUmapYTransformMoleculeData', { 'linear': 'linear', 'log10': 'log10' }).name('Y scale').onChange(function (value) {
			//updatePointCloudGeometry(view);
		});

		plotFolder.add(options, 'selectAllMoleculeData').name('Select all');
		plotFolder.add(options, 'deselectAllMoleculeData').name('Deselect all');

		plotFolder.add(options, 'selectHighlightedMoleculeData').name('Select highlighted');
		plotFolder.add(options, 'deselectHighlightedMoleculeData').name('Deselect highlighted');
	}

	if (view.overallMoleculeDataBoolean == false && view.overallSpatiallyResolvedDataBoolean) {
		plotFolder.add(options, 'UmapNumEpochs', 10, 1000).step(10).name('Num Epochs');

		plotFolder.add(options, 'UmapNumNeighbours', 1, 100).step(1).name('Num Neighbors');

		plotFolder.add(options, 'plotUmapXSpatiallyResolvedData', UmapSpatiallyResolvedFeatureChoiceObject).name('X').onChange(function (value) {
			//updatePointCloudGeometry(view);
		});

		plotFolder.add(options, 'plotUmapXTransformSpatiallyResolvedData', { 'linear': 'linear', 'log10': 'log10' }).name('X scale').onChange(function (value) {
			//updatePointCloudGeometry(view);
		});

		plotFolder.add(options, 'plotUmapYSpatiallyResolvedData', UmapSpatiallyResolvedFeatureChoiceObject).name('Y').onChange(function (value) {
			//updatePointCloudGeometry(view);
		});

		plotFolder.add(options, 'plotUmapYTransformSpatiallyResolvedData', { 'linear': 'linear', 'log10': 'log10' }).name('Y scale').onChange(function (value) {
			//updatePointCloudGeometry(view);
		});

		plotFolder.add(options, 'selectAllSpatiallyResolvedData').name('Select all');
		plotFolder.add(options, 'deselectAllSpatiallyResolvedData').name('Deselect all');

		plotFolder.add(options, 'selectHighlightedSpatiallyResolvedData').name('Select highlighted');
		plotFolder.add(options, 'deselectHighlightedSpatiallyResolvedData').name('Deselect highlighted');
	}

	plotFolder.add(options, 'replotUmapHeatmap').name("Calculate & Plot");
	plotFolder.open();

	viewFolder.add(options, 'colorMap', _UtilitiesColorMapJs.colorMapDict).name('Color Scheme').onChange(function (value) {
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
		moleculeFolder.add(options, 'UmapNumEpochs', 10, 1000).step(10).name('Num Epochs');

		moleculeFolder.add(options, 'UmapNumNeighbours', 1, 100).step(1).name('Num Neighbors');

		moleculeFolder.add(options, 'plotUmapXMoleculeData', UmapMoleculeDataFeatureChoiceObject).name('X').onChange(function (value) {
			//updatePointCloudGeometry(view);
		});

		moleculeFolder.add(options, 'plotUmapXTransformMoleculeData', { 'linear': 'linear', 'log10': 'log10' }).name('X scale').onChange(function (value) {
			//updatePointCloudGeometry(view);
		});

		moleculeFolder.add(options, 'plotUmapYMoleculeData', UmapMoleculeDataFeatureChoiceObject).name('Y').onChange(function (value) {
			//updatePointCloudGeometry(view);
		});

		moleculeFolder.add(options, 'plotUmapYTransformMoleculeData', { 'linear': 'linear', 'log10': 'log10' }).name('Y scale').onChange(function (value) {
			//updatePointCloudGeometry(view);
		});

		moleculeFolder.add(options, 'selectAllMoleculeData').name('Select all');
		moleculeFolder.add(options, 'deselectAllMoleculeData').name('Deselect all');

		moleculeFolder.add(options, 'selectHighlightedMoleculeData').name('Select highlighted');
		moleculeFolder.add(options, 'deselectHighlightedMoleculeData').name('Deselect highlighted');

		moleculeFolder.close();

		spatiallyResolvedFolder.add(options, 'UmapNumEpochs', 10, 1000).step(10).name('Num Epochs');

		spatiallyResolvedFolder.add(options, 'UmapNumNeighbours', 1, 100).step(1).name('Num Neighbors');

		spatiallyResolvedFolder.add(options, 'plotUmapXSpatiallyResolvedData', UmapSpatiallyResolvedFeatureChoiceObject).name('X').onChange(function (value) {
			//updatePointCloudGeometry(view);
		});

		spatiallyResolvedFolder.add(options, 'plotUmapXTransformSpatiallyResolvedData', { 'linear': 'linear', 'log10': 'log10' }).name('X scale').onChange(function (value) {
			//updatePointCloudGeometry(view);
		});

		spatiallyResolvedFolder.add(options, 'plotUmapYSpatiallyResolvedData', UmapSpatiallyResolvedFeatureChoiceObject).name('Y').onChange(function (value) {
			//updatePointCloudGeometry(view);
		});

		spatiallyResolvedFolder.add(options, 'plotUmapYTransformSpatiallyResolvedData', { 'linear': 'linear', 'log10': 'log10' }).name('Y scale').onChange(function (value) {
			//updatePointCloudGeometry(view);
		});

		spatiallyResolvedFolder.add(options, 'selectAllSpatiallyResolvedData').name('Select all');
		spatiallyResolvedFolder.add(options, 'deselectAllSpatiallyResolvedData').name('Deselect all');

		spatiallyResolvedFolder.add(options, 'selectHighlightedSpatiallyResolvedData').name('Select highlighted');
		spatiallyResolvedFolder.add(options, 'deselectHighlightedSpatiallyResolvedData').name('Deselect highlighted');

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

		plotFolder.add(options, 'selectHighlightedMoleculeData').name('Select highlighted');
		plotFolder.add(options, 'deselectHighlightedMoleculeData').name('Deselect highlighted');
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

		plotFolder.add(options, 'selectHighlightedSpatiallyResolvedData').name('Select highlighted');
		plotFolder.add(options, 'deselectHighlightedSpatiallyResolvedData').name('Deselect highlighted');
	}

	plotFolder.add(options, 'replotComparison').name("Plot");
	plotFolder.open();

	viewFolder.add(options, 'colorMap', _UtilitiesColorMapJs.colorMapDict).name('Color Scheme').onChange(function (value) {
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

		moleculeFolder.add(options, 'selectHighlightedMoleculeData').name('Select highlighted');
		moleculeFolder.add(options, 'deselectHighlightedMoleculeData').name('Deselect highlighted');

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

		spatiallyResolvedFolder.add(options, 'selectHighlightedSpatiallyResolvedData').name('Select highlighted');
		spatiallyResolvedFolder.add(options, 'deselectHighlightedSpatiallyResolvedData').name('Deselect highlighted');

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

},{"../MultiviewControl/colorLegend.js":27,"../Utilities/colorMap.js":33,"../Utilities/other.js":34,"./HeatmapView.js":2,"./PCAView.js":4,"./comparisonView.js":8,"./covarianceView.js":9}],13:[function(require,module,exports){
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
	// console.log('updating 2d map tooltip',view.INTERSECTED);
	if (view.options.plotType == "Comparison") {
		if (view.INTERSECTED) {
			view.tooltip.style.top = event.clientY + 5 + 'px';
			view.tooltip.style.left = event.clientX + 5 + 'px';

			var interesctIndex = view.INTERSECTED;
			view.tooltip.innerHTML = "x: " + view.heatmapInformation[interesctIndex].xStart + " : " + view.heatmapInformation[interesctIndex].xEnd + '<br>' + "y: " + view.heatmapInformation[interesctIndex].yStart + " : " + view.heatmapInformation[interesctIndex].yEnd + '<br>' + "systems: " + view.heatmapInformation[interesctIndex].systemRepresented;
		} else {
			view.tooltip.innerHTML = '';
		}
	}

	if (view.options.plotType == "Heatmap") {
		if (view.INTERSECTED) {
			view.tooltip.style.top = event.clientY + 5 + 'px';
			view.tooltip.style.left = event.clientX + 5 + 'px';

			var interesctIndex = view.INTERSECTED;
			view.tooltip.innerHTML = "x: " + view.heatmapInformation[interesctIndex].xStart + " : " + view.heatmapInformation[interesctIndex].xEnd + '<br>' + "y: " + view.heatmapInformation[interesctIndex].yStart + " : " + view.heatmapInformation[interesctIndex].yEnd + '<br>' + "# points: " + view.heatmapInformation[interesctIndex].numberDatapointsRepresented;
		} else {
			view.tooltip.innerHTML = '';
		}
	}

	if (view.options.plotType == "PCA") {
		if (view.INTERSECTED) {
			view.tooltip.style.top = event.clientY + 5 + 'px';
			view.tooltip.style.left = event.clientX + 5 + 'px';

			var interesctIndex = view.INTERSECTED;
			view.tooltip.innerHTML = "x: " + view.heatmapInformation[interesctIndex].xStart + " : " + view.heatmapInformation[interesctIndex].xEnd + '<br>' + "y: " + view.heatmapInformation[interesctIndex].yStart + " : " + view.heatmapInformation[interesctIndex].yEnd + '<br>' + "# points: " + view.heatmapInformation[interesctIndex].numberDatapointsRepresented;
		} else {
			view.tooltip.innerHTML = '';
		}
	}

	if (view.options.plotType == "Umap") {
		if (view.INTERSECTED) {
			view.tooltip.style.top = event.clientY + 5 + 'px';
			view.tooltip.style.left = event.clientX + 5 + 'px';

			var interesctIndex = view.INTERSECTED;
			view.tooltip.innerHTML = "x: " + view.heatmapInformation[interesctIndex].xStart + " : " + view.heatmapInformation[interesctIndex].xEnd + '<br>' + "y: " + view.heatmapInformation[interesctIndex].yStart + " : " + view.heatmapInformation[interesctIndex].yEnd + '<br>' + "# points: " + view.heatmapInformation[interesctIndex].numberDatapointsRepresented;
		} else {
			view.tooltip.innerHTML = '';
		}
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

},{}],14:[function(require,module,exports){
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

},{}],15:[function(require,module,exports){
'use strict';

exports.__esModule = true;
exports.getPointCloudMaterialInstanced = getPointCloudMaterialInstanced;
exports.getMoleculeMaterialInstanced = getMoleculeMaterialInstanced;
exports.getMoleculeAtomSpriteMaterialInstanced = getMoleculeAtomSpriteMaterialInstanced;
exports.getMoleculeBondLineMaterialInstanced = getMoleculeBondLineMaterialInstanced;
exports.getMoleculeAtomsMaterialInstanced = getMoleculeAtomsMaterialInstanced;

function getPointCloudMaterialInstanced(options) {
	var uniforms = {

		color: { value: new THREE.Color(0xffffff) },
		texture: { value: new THREE.TextureLoader().load("textures/sprites/disc.png") },

		xClippingPlaneMax: { type: 'f', value: options.x_high },
		xClippingPlaneMin: { type: 'f', value: options.x_low },
		yClippingPlaneMax: { type: 'f', value: options.y_high },
		yClippingPlaneMin: { type: 'f', value: options.y_low },
		zClippingPlaneMax: { type: 'f', value: options.z_high },
		zClippingPlaneMin: { type: 'f', value: options.z_low }

	};

	var pointCloudMaterialInstanced = new THREE.RawShaderMaterial({

		uniforms: uniforms,
		vertexShader: '\n\t\t\tprecision highp float;\n\n\t\t\tuniform mat4 modelViewMatrix;\n\t\t\tuniform mat4 projectionMatrix;\n\n\t\t\tattribute vec3 position;\n\t\t\tattribute float selection;\n\t\t\tvarying float vSelection;\n\n\t\t\tattribute float size;\n\t\t\tattribute vec3 customColor;\n\t\t\tattribute vec3 offset;\n\t\t\tattribute float alpha;\n\n\t\t\tvarying vec3 slicePosition;\n\t\t\tvarying float vAlpha;\n\t\t\tvarying vec3 vColor;\n\n\t\t\tvoid main() {\n\t\t\t\tvColor = customColor;\n\t\t\t\tvAlpha = alpha;\n\t\t\t\tvec3 newPosition = position + offset;\n\t\t\t\tslicePosition = newPosition;\n\t\t\t\tvSelection = selection;\n\t\t\t\tvec4 mvPosition = modelViewMatrix * vec4( newPosition, 1.0 );\n\t\t\t\tgl_PointSize = size * ( 300.0 / -mvPosition.z );\n\t\t\t\tgl_Position = projectionMatrix * mvPosition;\n\n\t\t\t}',
		fragmentShader: '\n\t\t\tprecision highp float;\n\t\t\tuniform vec3 color;\n\t\t\tuniform sampler2D texture;\n\n\t\t\tvarying vec3 vColor;\n\t\t\tvarying float vAlpha;\n\t\t\tvarying vec3 slicePosition;\n\t\t\tvarying float vSelection;\n\t\t\tuniform float xClippingPlaneMax;\n\t\t\tuniform float xClippingPlaneMin;\n\t\t\tuniform float yClippingPlaneMax;\n\t\t\tuniform float yClippingPlaneMin;\n\t\t\tuniform float zClippingPlaneMax;\n\t\t\tuniform float zClippingPlaneMin;\n\n\t\t\tvoid main() {\n\t\t\t\tif(vSelection==0.0) discard;\n\t\t\t\tif(slicePosition.x<xClippingPlaneMin) discard;\n\t\t\t\tif(slicePosition.x>xClippingPlaneMax) discard;\n\t\t\t\tif(slicePosition.y<yClippingPlaneMin) discard;\n\t\t\t\tif(slicePosition.y>yClippingPlaneMax) discard;\n\t\t\t\tif(slicePosition.z<zClippingPlaneMin) discard;\n\t\t\t\tif(slicePosition.z>zClippingPlaneMax) discard;\n\n\t\t\t\tgl_FragColor = vec4( color * vColor, vAlpha );\n\t\t\t\tgl_FragColor = gl_FragColor * texture2D( texture, gl_PointCoord );\n\t\t\t}',

		blending: THREE.AdditiveBlending,
		depthTest: false,
		transparent: true

	});

	return pointCloudMaterialInstanced;
}

function getMoleculeMaterialInstanced(options) {

	var material = new THREE.MeshLambertMaterial({
		// uniforms: uniforms,
		vertexColors: THREE.VertexColors
	});

	material.onBeforeCompile = function (shader) {

		shader.uniforms.xClippingPlaneMax = { type: 'f', value: options.x_high };
		shader.uniforms.xClippingPlaneMin = { type: 'f', value: options.x_low };
		shader.uniforms.yClippingPlaneMax = { type: 'f', value: options.y_high };
		shader.uniforms.yClippingPlaneMin = { type: 'f', value: options.y_low };
		shader.uniforms.zClippingPlaneMax = { type: 'f', value: options.z_high };
		shader.uniforms.zClippingPlaneMin = { type: 'f', value: options.z_low };
		shader.vertexShader = '\n\t\t\t#define LAMBERT\n\t\t\n\t\t\t// instanced\n\t\t\tattribute vec3 offset;\n\t\t\t// attribute vec3 instanceColor;\n\t\t\t// attribute float instanceScale;\n\t\t\n\t\t\tvarying vec3 vLightFront;\n\t\t\tvarying vec3 vIndirectFront;\n\t\t\tvarying vec3 slicePosition;\n\t\t\t\n\t\t\tattribute float selection;\n\t\t\tvarying float vSelection;\n\t\t\n\t\t\t#ifdef DOUBLE_SIDED\n\t\t\t\tvarying vec3 vLightBack;\n\t\t\t\tvarying vec3 vIndirectBack;\n\t\t\t#endif\n\t\t\n\t\t\t#include <common>\n\t\t\t#include <uv_pars_vertex>\n\t\t\t#include <uv2_pars_vertex>\n\t\t\t#include <envmap_pars_vertex>\n\t\t\t#include <bsdfs>\n\t\t\t#include <lights_pars_begin>\n\t\t\t#include <color_pars_vertex>\n\t\t\t#include <fog_pars_vertex>\n\t\t\t#include <morphtarget_pars_vertex>\n\t\t\t#include <skinning_pars_vertex>\n\t\t\t#include <shadowmap_pars_vertex>\n\t\t\t#include <logdepthbuf_pars_vertex>\n\t\t\t#include <clipping_planes_pars_vertex>\n\t\t\n\t\t\tvoid main() {\n\t\t\n\t\t\t\t#include <uv_vertex>\n\t\t\t\t#include <uv2_vertex>\n\t\t\t\t#include <color_vertex>\n\t\t\n\t\t\t\t// vertex colors instanced\n\t\t\t\t// #ifdef USE_COLOR\n\t\t\t\t// \tvColor.xyz = instanceColor.xyz;\n\t\t\t\t// #endif\n\t\t\n\t\t\t\t#include <beginnormal_vertex>\n\t\t\t\t#include <morphnormal_vertex>\n\t\t\t\t#include <skinbase_vertex>\n\t\t\t\t#include <skinnormal_vertex>\n\t\t\t\t#include <defaultnormal_vertex>\n\t\t\n\t\t\t\t#include <begin_vertex>\n\t\t\n\t\t\t\t// position instanced\n\t\t\t\t// transformed *= instanceScale;\n\t\t\t\t// transformed = transformed + instanceOffset;\n\t\t\t\ttransformed = transformed + offset;\n\t\t\t\tslicePosition = transformed;\n\n\t\t\t\tvSelection = selection;\n\t\t\n\t\t\t\t#include <morphtarget_vertex>\n\t\t\t\t#include <skinning_vertex>\n\t\t\t\t#include <project_vertex>\n\t\t\t\t#include <logdepthbuf_vertex>\n\t\t\t\t#include <clipping_planes_vertex>\n\t\t\n\t\t\t\t#include <worldpos_vertex>\n\t\t\t\t#include <envmap_vertex>\n\t\t\t\t#include <lights_lambert_vertex>\n\t\t\t\t#include <shadowmap_vertex>\n\t\t\t\t#include <fog_vertex>\n\t\t\n\t\t\t}\n\t\t\t';
		shader.fragmentShader = '\n\t\t\tuniform vec3 diffuse;\n\t\t\tuniform vec3 emissive;\n\t\t\tuniform float opacity;\n\t\t\t\n\t\t\tvarying vec3 vLightFront;\n\t\t\tvarying vec3 vIndirectFront;\n\n\t\t\tvarying vec3 slicePosition;\n\t\t\tvarying float vSelection;\n\t\t\tuniform float xClippingPlaneMax;\n\t\t\tuniform float xClippingPlaneMin;\n\t\t\tuniform float yClippingPlaneMax;\n\t\t\tuniform float yClippingPlaneMin;\n\t\t\tuniform float zClippingPlaneMax;\n\t\t\tuniform float zClippingPlaneMin;\n\t\t\t\n\t\t\t#ifdef DOUBLE_SIDED\n\t\t\t\tvarying vec3 vLightBack;\n\t\t\t\tvarying vec3 vIndirectBack;\n\t\t\t#endif\n\t\t\t\n\t\t\t\n\t\t\t#include <common>\n\t\t\t#include <packing>\n\t\t\t#include <dithering_pars_fragment>\n\t\t\t#include <color_pars_fragment>\n\t\t\t#include <uv_pars_fragment>\n\t\t\t#include <uv2_pars_fragment>\n\t\t\t#include <map_pars_fragment>\n\t\t\t#include <alphamap_pars_fragment>\n\t\t\t#include <aomap_pars_fragment>\n\t\t\t#include <lightmap_pars_fragment>\n\t\t\t#include <emissivemap_pars_fragment>\n\t\t\t#include <envmap_common_pars_fragment>\n\t\t\t#include <envmap_pars_fragment>\n\t\t\t#include <cube_uv_reflection_fragment>\n\t\t\t#include <bsdfs>\n\t\t\t#include <lights_pars_begin>\n\t\t\t#include <fog_pars_fragment>\n\t\t\t#include <shadowmap_pars_fragment>\n\t\t\t#include <shadowmask_pars_fragment>\n\t\t\t#include <specularmap_pars_fragment>\n\t\t\t#include <logdepthbuf_pars_fragment>\n\t\t\t#include <clipping_planes_pars_fragment>\n\t\t\t\n\t\t\tvoid main() {\n\n\t\t\t\tif(vSelection==0.0) discard;\n\t\t\t\tif(slicePosition.x<xClippingPlaneMin) discard;\n\t\t\t\tif(slicePosition.x>xClippingPlaneMax) discard;\n\t\t\t\tif(slicePosition.y<yClippingPlaneMin) discard;\n\t\t\t\tif(slicePosition.y>yClippingPlaneMax) discard;\n\t\t\t\tif(slicePosition.z<zClippingPlaneMin) discard;\n\t\t\t\tif(slicePosition.z>zClippingPlaneMax) discard;\n\t\t\t\n\t\t\t\t#include <clipping_planes_fragment>\n\t\t\t\n\t\t\t\tvec4 diffuseColor = vec4( diffuse, opacity );\n\t\t\t\tReflectedLight reflectedLight = ReflectedLight( vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ) );\n\t\t\t\tvec3 totalEmissiveRadiance = emissive;\n\t\t\t\n\t\t\t\t#include <logdepthbuf_fragment>\n\t\t\t\t#include <map_fragment>\n\t\t\t\t#include <color_fragment>\n\t\t\t\t#include <alphamap_fragment>\n\t\t\t\t#include <alphatest_fragment>\n\t\t\t\t#include <specularmap_fragment>\n\t\t\t\t#include <emissivemap_fragment>\n\t\t\t\n\t\t\t\t// accumulation\n\t\t\t\treflectedLight.indirectDiffuse = getAmbientLightIrradiance( ambientLightColor );\n\t\t\t\n\t\t\t\t#ifdef DOUBLE_SIDED\n\t\t\t\n\t\t\t\t\treflectedLight.indirectDiffuse += ( gl_FrontFacing ) ? vIndirectFront : vIndirectBack;\n\t\t\t\n\t\t\t\t#else\n\t\t\t\n\t\t\t\t\treflectedLight.indirectDiffuse += vIndirectFront;\n\t\t\t\n\t\t\t\t#endif\n\t\t\t\n\t\t\t\t#include <lightmap_fragment>\n\t\t\t\n\t\t\t\treflectedLight.indirectDiffuse *= BRDF_Diffuse_Lambert( diffuseColor.rgb );\n\t\t\t\n\t\t\t\t#ifdef DOUBLE_SIDED\n\t\t\t\n\t\t\t\t\treflectedLight.directDiffuse = ( gl_FrontFacing ) ? vLightFront : vLightBack;\n\t\t\t\n\t\t\t\t#else\n\t\t\t\n\t\t\t\t\treflectedLight.directDiffuse = vLightFront;\n\t\t\t\n\t\t\t\t#endif\n\t\t\t\n\t\t\t\treflectedLight.directDiffuse *= BRDF_Diffuse_Lambert( diffuseColor.rgb ) * getShadowMask();\n\t\t\t\n\t\t\t\t// modulation\n\t\t\t\t#include <aomap_fragment>\n\t\t\t\n\t\t\t\tvec3 outgoingLight = reflectedLight.directDiffuse + reflectedLight.indirectDiffuse + totalEmissiveRadiance;\n\t\t\t\n\t\t\t\t#include <envmap_fragment>\n\t\t\t\n\t\t\t\tgl_FragColor = vec4( outgoingLight, diffuseColor.a );\n\t\t\t\n\t\t\t\t#include <tonemapping_fragment>\n\t\t\t\t#include <encodings_fragment>\n\t\t\t\t#include <fog_fragment>\n\t\t\t\t#include <premultiplied_alpha_fragment>\n\t\t\t\t#include <dithering_fragment>\n\t\t\t}\n\t\t\t';
		material.userData.shader = shader;
	};

	return material;
}

function getMoleculeAtomSpriteMaterialInstanced(options) {
	var uniforms = {

		color: { value: new THREE.Color(0xffffff) },
		texture: { value: new THREE.TextureLoader().load("textures/sprites/ball.png") },

		xClippingPlaneMax: { type: 'f', value: options.x_high },
		xClippingPlaneMin: { type: 'f', value: options.x_low },
		yClippingPlaneMax: { type: 'f', value: options.y_high },
		yClippingPlaneMin: { type: 'f', value: options.y_low },
		zClippingPlaneMax: { type: 'f', value: options.z_high },
		zClippingPlaneMin: { type: 'f', value: options.z_low }

	};

	var pointCloudMaterialInstanced = new THREE.RawShaderMaterial({

		uniforms: uniforms,
		vertexShader: '\n\t\t\tprecision highp float;\n\n\t\t\tuniform mat4 modelViewMatrix;\n\t\t\tuniform mat4 projectionMatrix;\n\n\t\t\tattribute vec3 position;\n\n\t\t\tattribute float size;\n\t\t\tattribute vec3 customColor;\n\t\t\tattribute vec3 offset;\n\t\t\tattribute float alpha;\n\n\t\t\tvarying vec3 slicePosition;\n\t\t\tvarying float vAlpha;\n\t\t\tvarying vec3 vColor;\n\n\t\t\tvoid main() {\n\t\t\tvColor = customColor;\n\t\t\tvAlpha = alpha;\n\t\t\tvec3 newPosition = position + offset;\n\t\t\tslicePosition = newPosition;\n\t\t\tvec4 mvPosition = modelViewMatrix * vec4( newPosition, 1.0 );\n\t\t\tgl_PointSize = size * ( 300.0 / -mvPosition.z );\n\t\t\tgl_Position = projectionMatrix * mvPosition;\n\n\t\t\t}',
		fragmentShader: '\n\t\t\tprecision highp float;\n\t\t\tuniform vec3 color;\n\t\t\tuniform sampler2D texture;\n\n\t\t\tvarying vec3 vColor;\n\t\t\tvarying float vAlpha;\n\t\t\tvarying vec3 slicePosition;\n\t\t\tuniform float xClippingPlaneMax;\n\t\t\tuniform float xClippingPlaneMin;\n\t\t\tuniform float yClippingPlaneMax;\n\t\t\tuniform float yClippingPlaneMin;\n\t\t\tuniform float zClippingPlaneMax;\n\t\t\tuniform float zClippingPlaneMin;\n\n\t\t\tvoid main() {\n\t\t\t\tif(slicePosition.x<xClippingPlaneMin) discard;\n\t\t\t\tif(slicePosition.x>xClippingPlaneMax) discard;\n\t\t\t\tif(slicePosition.y<yClippingPlaneMin) discard;\n\t\t\t\tif(slicePosition.y>yClippingPlaneMax) discard;\n\t\t\t\tif(slicePosition.z<zClippingPlaneMin) discard;\n\t\t\t\tif(slicePosition.z>zClippingPlaneMax) discard;\n\n\t\t\t\tgl_FragColor = vec4( color * vColor, vAlpha );\n\t\t\t\tvec4 texColor = texture2D( texture, gl_PointCoord );\n\t\t\t\tif (texColor.a < 0.5) discard;\n\t\t\t\tgl_FragColor = gl_FragColor * texColor;\n\t\t\t}',
		// depthTest:      true,
		// transparent:    true,
		alphaTest: 0.5
	});

	// blending: THREE.NormalBlending,
	// depthTest: false,
	/// transparent: true

	return pointCloudMaterialInstanced;
}

function getMoleculeBondLineMaterialInstanced(options) {
	var uniforms = {

		xClippingPlaneMax: { type: 'f', value: options.x_high },
		xClippingPlaneMin: { type: 'f', value: options.x_low },
		yClippingPlaneMax: { type: 'f', value: options.y_high },
		yClippingPlaneMin: { type: 'f', value: options.y_low },
		zClippingPlaneMax: { type: 'f', value: options.z_high },
		zClippingPlaneMin: { type: 'f', value: options.z_low }

	};

	var materialInstanced = new THREE.ShaderMaterial({
		vertexColors: THREE.VertexColors,
		uniforms: uniforms,
		vertexShader: '\n\t\t\tattribute vec3 offset;\n\n\t\t\tvarying vec3 slicePosition;\n\t\t\tvarying vec4 vcolor;\n\t\t\n\t\t\tvoid main() {\n\t\t\t\tvcolor = vec4(color, 1.0);\n\t\t\t\tvec3 newPosition = position + offset;\n\t\t\t\tslicePosition = newPosition;\n\t\t\t\tvec4 mvPosition = modelViewMatrix * vec4( newPosition, 1.0 );\n\t\t\t\tgl_Position = projectionMatrix * mvPosition;\n\t\t\t}',
		fragmentShader: '\n\t\t\tvarying vec4 vcolor;\n\t\t\tvarying vec3 slicePosition;\n\n\t\t\tuniform float xClippingPlaneMax;\n\t\t\tuniform float xClippingPlaneMin;\n\t\t\tuniform float yClippingPlaneMax;\n\t\t\tuniform float yClippingPlaneMin;\n\t\t\tuniform float zClippingPlaneMax;\n\t\t\tuniform float zClippingPlaneMin;\n\t\n\t\t\tvoid main() {\n\t\t\t\tif(slicePosition.x<xClippingPlaneMin) discard;\n\t\t\t\tif(slicePosition.x>xClippingPlaneMax) discard;\n\t\t\t\tif(slicePosition.y<yClippingPlaneMin) discard;\n\t\t\t\tif(slicePosition.y>yClippingPlaneMax) discard;\n\t\t\t\tif(slicePosition.z<zClippingPlaneMin) discard;\n\t\t\t\tif(slicePosition.z>zClippingPlaneMax) discard;\n\t\t\t\tgl_FragColor = vcolor;\n\t\t\t}'

	});

	return materialInstanced;
}

/*
export var moleculeSpriteMaterialInstanced = new THREE.RawShaderMaterial( {

	uniforms:       uniforms2,
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

function getMoleculeAtomsMaterialInstanced(options) {

	var material = new THREE.MeshLambertMaterial({
		color: 0xffffff,
		combine: THREE.MultiplyOperation,
		vertexColors: THREE.VertexColors
	});

	material.onBeforeCompile = function (shader) {

		shader.uniforms.xClippingPlaneMax = { type: 'f', value: options.x_high };
		shader.uniforms.xClippingPlaneMin = { type: 'f', value: options.x_low };
		shader.uniforms.yClippingPlaneMax = { type: 'f', value: options.y_high };
		shader.uniforms.yClippingPlaneMin = { type: 'f', value: options.y_low };
		shader.uniforms.zClippingPlaneMax = { type: 'f', value: options.z_high };
		shader.uniforms.zClippingPlaneMin = { type: 'f', value: options.z_low };
		shader.vertexShader = '\n\t\t\t#define LAMBERT\n\t\t\n\t\t\t// instanced\n\t\t\tattribute vec3 instanceOffset;\n\t\t\tattribute float instanceScale;\n\t\t\tattribute vec3 instanceColor;\n\t\t\t// attribute vec3 instanceColor;\n\t\t\t// attribute float instanceScale;\n\t\t\tattribute float atomIndex;\n\n\t\t\tvarying float encodedR;\n\t\t\tvarying float encodedG;\n\t\t\tvarying float encodedB;\n\n\t\t\tvarying vec3 vLightFront;\n\t\t\tvarying vec3 vIndirectFront;\n\t\t\tvarying vec3 slicePosition;\n\t\t\t\n\t\t\tattribute float selection;\n\t\t\tvarying float vSelection;\n\t\t\n\t\t\t#ifdef DOUBLE_SIDED\n\t\t\t\tvarying vec3 vLightBack;\n\t\t\t\tvarying vec3 vIndirectBack;\n\t\t\t#endif\n\t\t\n\t\t\t#include <common>\n\t\t\t#include <uv_pars_vertex>\n\t\t\t#include <uv2_pars_vertex>\n\t\t\t#include <envmap_pars_vertex>\n\t\t\t#include <bsdfs>\n\t\t\t#include <lights_pars_begin>\n\t\t\t#include <color_pars_vertex>\n\t\t\t#include <fog_pars_vertex>\n\t\t\t#include <morphtarget_pars_vertex>\n\t\t\t#include <skinning_pars_vertex>\n\t\t\t#include <shadowmap_pars_vertex>\n\t\t\t#include <logdepthbuf_pars_vertex>\n\t\t\t#include <clipping_planes_pars_vertex>\n\t\t\n\t\t\tvoid main() {\n\t\t\n\t\t\t\t#include <uv_vertex>\n\t\t\t\t#include <uv2_vertex>\n\t\t\t\t#include <color_vertex>\n\t\t\n\t\t\t\t// vertex colors instanced\n\t\t\t\t#ifdef USE_COLOR\n\t\t\t\t\tvColor.xyz = instanceColor.xyz;\n\t\t\t\t#endif\n\t\t\n\t\t\t\t#include <beginnormal_vertex>\n\t\t\t\t#include <morphnormal_vertex>\n\t\t\t\t#include <skinbase_vertex>\n\t\t\t\t#include <skinnormal_vertex>\n\t\t\t\t#include <defaultnormal_vertex>\n\t\t\n\t\t\t\t#include <begin_vertex>\n\t\t\n\t\t\t\t// position instanced\n\t\t\t\t// transformed *= instanceScale;\n\t\t\t\t// transformed = transformed + instanceOffset;\n\t\t\t\ttransformed *= instanceScale;\n\t\t\t\ttransformed = transformed + instanceOffset;\n\t\t\t\tslicePosition = transformed;\n\n\t\t\t\tvSelection = selection;\n\t\t\n\t\t\t\t#include <morphtarget_vertex>\n\t\t\t\t#include <skinning_vertex>\n\t\t\t\t#include <project_vertex>\n\t\t\t\t#include <logdepthbuf_vertex>\n\t\t\t\t#include <clipping_planes_vertex>\n\t\t\n\t\t\t\t#include <worldpos_vertex>\n\t\t\t\t#include <envmap_vertex>\n\t\t\t\t#include <lights_lambert_vertex>\n\t\t\t\t#include <shadowmap_vertex>\n\t\t\t\t#include <fog_vertex>\n\n\t\t\t\tencodedR = floor(atomIndex / 100000000.0);\n\t\t\t\tencodedG = floor((atomIndex - encodedR) / 10000.0);\n\t\t\t\tencodedB = atomIndex - encodedR - encodedG;\n\n\t\t\t\tencodedR = (encodedR + 1000.0) * 0.000001 + 5. * 0.0000001;\n\t\t\t\tencodedG = encodedG * 0.000001 + 5. * 0.0000001;\n\t\t\t\tencodedB = encodedB * 0.000001 + 5. * 0.0000001;\n\t\t\t\t\n\t\t\n\t\t\t}\n\t\t\t';
		shader.fragmentShader = '\n\t\t\tuniform vec3 diffuse;\n\t\t\tuniform vec3 emissive;\n\t\t\tuniform float opacity;\n\t\t\t\n\t\t\tvarying vec3 vLightFront;\n\t\t\tvarying vec3 vIndirectFront;\n\n\t\t\tvarying float encodedR;\n\t\t\tvarying float encodedG;\n\t\t\tvarying float encodedB;\n\t\t\tfloat r;\n\t\t\tfloat g;\n\t\t\tfloat b;\n\n\t\t\tvarying vec3 slicePosition;\n\t\t\tvarying float vSelection;\n\t\t\tuniform float xClippingPlaneMax;\n\t\t\tuniform float xClippingPlaneMin;\n\t\t\tuniform float yClippingPlaneMax;\n\t\t\tuniform float yClippingPlaneMin;\n\t\t\tuniform float zClippingPlaneMax;\n\t\t\tuniform float zClippingPlaneMin;\n\t\t\t\n\t\t\t#ifdef DOUBLE_SIDED\n\t\t\t\tvarying vec3 vLightBack;\n\t\t\t\tvarying vec3 vIndirectBack;\n\t\t\t#endif\n\t\t\t\n\t\t\t\n\t\t\t#include <common>\n\t\t\t#include <packing>\n\t\t\t#include <dithering_pars_fragment>\n\t\t\t#include <color_pars_fragment>\n\t\t\t#include <uv_pars_fragment>\n\t\t\t#include <uv2_pars_fragment>\n\t\t\t#include <map_pars_fragment>\n\t\t\t#include <alphamap_pars_fragment>\n\t\t\t#include <aomap_pars_fragment>\n\t\t\t#include <lightmap_pars_fragment>\n\t\t\t#include <emissivemap_pars_fragment>\n\t\t\t#include <envmap_common_pars_fragment>\n\t\t\t#include <envmap_pars_fragment>\n\t\t\t#include <cube_uv_reflection_fragment>\n\t\t\t#include <bsdfs>\n\t\t\t#include <lights_pars_begin>\n\t\t\t#include <fog_pars_fragment>\n\t\t\t#include <shadowmap_pars_fragment>\n\t\t\t#include <shadowmask_pars_fragment>\n\t\t\t#include <specularmap_pars_fragment>\n\t\t\t#include <logdepthbuf_pars_fragment>\n\t\t\t#include <clipping_planes_pars_fragment>\n\t\t\t\n\t\t\tvoid main() {\n\n\t\t\t\tif(vSelection==0.0) discard;\n\t\t\t\tif(slicePosition.x<xClippingPlaneMin) discard;\n\t\t\t\tif(slicePosition.x>xClippingPlaneMax) discard;\n\t\t\t\tif(slicePosition.y<yClippingPlaneMin) discard;\n\t\t\t\tif(slicePosition.y>yClippingPlaneMax) discard;\n\t\t\t\tif(slicePosition.z<zClippingPlaneMin) discard;\n\t\t\t\tif(slicePosition.z>zClippingPlaneMax) discard;\n\t\t\t\n\t\t\t\t#include <clipping_planes_fragment>\n\t\t\t\n\t\t\t\tvec4 diffuseColor = vec4( diffuse, opacity );\n\t\t\t\tReflectedLight reflectedLight = ReflectedLight( vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ) );\n\t\t\t\tvec3 totalEmissiveRadiance = emissive;\n\t\t\t\n\t\t\t\t#include <logdepthbuf_fragment>\n\t\t\t\t#include <map_fragment>\n\t\t\t\t#include <color_fragment>\n\t\t\t\t#include <alphamap_fragment>\n\t\t\t\t#include <alphatest_fragment>\n\t\t\t\t#include <specularmap_fragment>\n\t\t\t\t#include <emissivemap_fragment>\n\t\t\t\n\t\t\t\t// accumulation\n\t\t\t\treflectedLight.indirectDiffuse = getAmbientLightIrradiance( ambientLightColor );\n\t\t\t\n\t\t\t\t#ifdef DOUBLE_SIDED\n\t\t\t\n\t\t\t\t\treflectedLight.indirectDiffuse += ( gl_FrontFacing ) ? vIndirectFront : vIndirectBack;\n\t\t\t\n\t\t\t\t#else\n\t\t\t\n\t\t\t\t\treflectedLight.indirectDiffuse += vIndirectFront;\n\t\t\t\n\t\t\t\t#endif\n\t\t\t\n\t\t\t\t#include <lightmap_fragment>\n\t\t\t\n\t\t\t\treflectedLight.indirectDiffuse *= BRDF_Diffuse_Lambert( diffuseColor.rgb );\n\t\t\t\n\t\t\t\t#ifdef DOUBLE_SIDED\n\t\t\t\n\t\t\t\t\treflectedLight.directDiffuse = ( gl_FrontFacing ) ? vLightFront : vLightBack;\n\t\t\t\n\t\t\t\t#else\n\t\t\t\n\t\t\t\t\treflectedLight.directDiffuse = vLightFront;\n\t\t\t\n\t\t\t\t#endif\n\t\t\t\n\t\t\t\treflectedLight.directDiffuse *= BRDF_Diffuse_Lambert( diffuseColor.rgb ) * getShadowMask();\n\t\t\t\n\t\t\t\t// modulation\n\t\t\t\t#include <aomap_fragment>\n\t\t\t\n\t\t\t\tvec3 outgoingLight = reflectedLight.directDiffuse + reflectedLight.indirectDiffuse + totalEmissiveRadiance;\n\t\t\t\n\t\t\t\t#include <envmap_fragment>\n\t\t\t\n\t\t\t\tgl_FragColor = vec4( outgoingLight, diffuseColor.a );\n\t\t\t\n\t\t\t\t#include <tonemapping_fragment>\n\t\t\t\t#include <encodings_fragment>\n\t\t\t\t#include <fog_fragment>\n\t\t\t\t#include <premultiplied_alpha_fragment>\n\t\t\t\t#include <dithering_fragment>\n\n\t\t\t\tr = floor(gl_FragColor.x * 100.) * 0.01 + encodedR;\n\t\t\t\tg = floor(gl_FragColor.y * 100.) * 0.01 + encodedG;\n\t\t\t\tb = floor(gl_FragColor.z * 100.) * 0.01 + encodedB;\n\t\t\t\tgl_FragColor = vec4(r,g,b,gl_FragColor.w);\n\t\t\t}\n\t\t\t';
		material.userData.shader = shader;
	};

	return material;
}

},{}],16:[function(require,module,exports){
"use strict";

exports.__esModule = true;
exports.getMoleculeGeometry = getMoleculeGeometry;
exports.updateMoleculeGeometrySlider = updateMoleculeGeometrySlider;
exports.updateMoleculeGeometry = updateMoleculeGeometry;
exports.updateMoleculeGeometryScale = updateMoleculeGeometryScale;
exports.changeMoleculeGeometry = changeMoleculeGeometry;
exports.removeMoleculeGeometry = removeMoleculeGeometry;

var _AtomSetupJs = require("./AtomSetup.js");

var _UtilitiesOtherJs = require("../Utilities/other.js");

var _UtilitiesJs = require("./Utilities.js");

var _MaterialsJs = require("./Materials.js");

/*function addAtoms(view, moleculeData, lut){

	var systemDimension = view.systemDimension;
	var latticeVectors = view.systemLatticeVectors;
	var options = view.options;
	var sizeCode = options.moleculeSizeCodeBasis;
	var colorCode = options.moleculeColorCodeBasis;

	if (options.atomsStyle == "sprite"){
		var geometry = new THREE.InstancedBufferGeometry();
		var positions = new Float32Array(moleculeData.length * 3);
		var colors = new Float32Array( moleculeData.length* 3);
		var sizes = new Float32Array( moleculeData.length );
		var alphas = new Float32Array( moleculeData.length );

		var i3 = 0;
		var atomSize;
		var t0 = performance.now()
		for (var i = 0; i < moleculeData.length; i++) {
			var atomData = moleculeData[i];
			positions[i3+0] = atomData.x;
			positions[i3+1] = atomData.y;
			positions[i3+2] = atomData.z;

			if (colorCode == "atom") {
				var color = colorToRgb(colorSetup[atomData.atom]);
			}
			else {
				var color = lut.getColor( atomData[colorCode] );
			}

			colors[ i3+0 ] = color.r;
			colors[ i3+1 ] = color.g;
			colors[ i3+2 ] = color.b;

			if (moleculeData[i].selected) {
				if (sizeCode == "atom") {
					atomSize = options.atomSize*atomRadius[atomData.atom] * 10;
				}
				else {
					var tempSize = (atomData[sizeCode] - options.moleculeSizeSettingMin)/(options.moleculeSizeSettingMax - options.moleculeSizeSettingMin);
					atomSize = options.atomSize*tempSize* 10;
				}

				if (moleculeData[i].highlighted) {
					atomSize = atomSize * 2;
				} 

				sizes[i] = atomSize;
				alphas[i] = options.moleculeAlpha;
			}
			else{
				sizes[i] = 0;
				alphas[i] = 0;
			}

			i3 +=3;
		}
		// console.log('sprite atoms', performance.now() - t0, cloneTime);


		var geometry = new THREE.InstancedBufferGeometry();
		geometry.setAttribute( 'position', new THREE.BufferAttribute( positions, 3 ) );
		geometry.setAttribute( 'customColor', new THREE.BufferAttribute( colors, 3 ) );
		geometry.setAttribute( 'size', new THREE.BufferAttribute( sizes, 1 ) );
		geometry.setAttribute( 'alpha', new THREE.BufferAttribute( alphas, 1 ) );
		// console.log(sumDisplacement);
		var offsetResult = getOffsetArray(systemDimension, latticeVectors, options);
		geometry.setAttribute('offset', new THREE.InstancedBufferAttribute(offsetResult.sumDisplacement, 3 ));
		geometry.maxInstancedCount = offsetResult.counter;

		var atoms = new THREE.Points( geometry, getMoleculeAtomSpriteMaterialInstanced(options) );
		atoms.frustumCulled = false;

	}

	if (options.atomsStyle == "ball"){
		var atomList = [];
		var atomColorList = [];

		var sphereTemplate = new THREE.SphereBufferGeometry(1, options.atomModelSegments, options.atomModelSegments);

		var t0 = performance.now();
		var cloneTime = 0;
		var atomSelectionList = new Float32Array(moleculeData.length);
		atomSelectionList.fill(1);
		for (var i = 0; i < moleculeData.length; i++) {
			var atomData = moleculeData[i];

			// if (moleculeData[i].selected) {
				if (colorCode == "atom") {
					var color = colorSetup[atomData.atom];
				}
				else {
					var color = lut.getColor( atomData[colorCode] );
				}
				if (sizeCode == "atom") {
					var atomSize = options.atomSize*atomRadius[atomData.atom];
				}
				else {
					var tempSize = (atomData[sizeCode] - options.moleculeSizeSettingMin)/(options.moleculeSizeSettingMax - options.moleculeSizeSettingMin);
					var atomSize = options.atomSize * tempSize;
				}

				if (moleculeData[i].highlighted) {
					atomList.push(sphereTemplate.clone().scale(atomSize * 2, atomSize * 2, atomSize * 2).translate(atomData.x, atomData.y,atomData.z));
				} else {
					// atomList.push(new THREE.SphereBufferGeometry(atomSize, options.atomModelSegments, options.atomModelSegments).translate(atomData.x, atomData.y,atomData.z));
					// atomList.push(sphereTemplate.clone().scale(atomSize, atomSize, atomSize).translate(atomData.x, atomData.y,atomData.z));
					var at0 = performance.now()
					var temp = sphereTemplate.clone();
					cloneTime += performance.now() - at0;
					atomList.push(temp.scale(atomSize, atomSize, atomSize).translate(atomData.x, atomData.y,atomData.z));
				}
				
				var tempColor = new THREE.Color( color );
				atomColorList.push([tempColor.r, tempColor.g, tempColor.b]);

			// }
			if (moleculeData[i].selected == false) {
				atomSelectionList[i] = 0;
			} 
		}
		// console.log('individual balls', performance.now() - t0, cloneTime);
		var atomsGeometry = combineGeometry(atomList, atomColorList, atomSelectionList);
		// console.log('combine balls', performance.now() - t0);
		var material = getMoleculeMaterialInstanced(options);
		
		var offsetResult = getOffsetArray(systemDimension, latticeVectors, options);
		atomsGeometry.setAttribute('offset', new THREE.InstancedBufferAttribute(offsetResult.sumDisplacement, 3 ));
		// atomsGeometry.setAttribute('selection', new THREE.InstancedBufferAttribute(atomSelectionArray, 1 ));
		atomsGeometry.maxInstancedCount = offsetResult.counter;

		var atoms = new THREE.Mesh( atomsGeometry, material);
		atoms.userData.numVerticesPerAtom = sphereTemplate.attributes.position.count;
	}
	view.molecule.atoms = atoms;
	view.scene.add(atoms);
}*/

function addAtoms(view, moleculeData) {

	var systemDimension = view.systemDimension;
	var latticeVectors = view.systemLatticeVectors;
	var options = view.options;
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

	if (options.atomsStyle == "sprite") {
		var geometry = new THREE.InstancedBufferGeometry();
		var positions = new Float32Array(moleculeData.length * 3);
		var colors = new Float32Array(moleculeData.length * 3);
		var sizes = new Float32Array(moleculeData.length);
		var alphas = new Float32Array(moleculeData.length);

		var i3 = 0;
		var atomSize;
		var t0 = performance.now();
		for (var i = 0; i < moleculeData.length; i++) {
			var atomData = moleculeData[i];
			positions[i3 + 0] = atomData.x;
			positions[i3 + 1] = atomData.y;
			positions[i3 + 2] = atomData.z;

			if (colorCode == "atom") {
				var color = _UtilitiesOtherJs.colorToRgb(_AtomSetupJs.colorSetup[atomData.atom]);
			} else {
				var color = lut.getColor(atomData[colorCode]);
			}

			colors[i3 + 0] = color.r;
			colors[i3 + 1] = color.g;
			colors[i3 + 2] = color.b;

			if (sizeCode == "atom") {
				atomSize = options.atomSize * _AtomSetupJs.atomRadius[atomData.atom] * 10;
			} else {
				var tempSize = (atomData[sizeCode] - options.moleculeSizeSettingMin) / (options.moleculeSizeSettingMax - options.moleculeSizeSettingMin);
				atomSize = options.atomSize * tempSize * 10;
			}

			if (moleculeData[i].highlighted) {
				atomSize = atomSize * 2;
				sizes[i] = atomSize;
				alphas[i] = options.moleculeAlpha;
			} else if (moleculeData[i].selected) {

				sizes[i] = atomSize;
				alphas[i] = options.moleculeAlpha;
			} else {
				sizes[i] = 0;
				alphas[i] = 0;
			}

			i3 += 3;
		}

		var geometry = new THREE.InstancedBufferGeometry();
		geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
		geometry.setAttribute('customColor', new THREE.BufferAttribute(colors, 3));
		geometry.setAttribute('size', new THREE.BufferAttribute(sizes, 1));
		geometry.setAttribute('alpha', new THREE.BufferAttribute(alphas, 1));
		// console.log(sumDisplacement);
		var offsetResult = _UtilitiesJs.getOffsetArray(systemDimension, latticeVectors, options);
		geometry.setAttribute('offset', new THREE.InstancedBufferAttribute(offsetResult.sumDisplacement, 3));
		geometry.maxInstancedCount = offsetResult.counter;

		var atoms = new THREE.Points(geometry, _MaterialsJs.getMoleculeAtomSpriteMaterialInstanced(options));
		atoms.frustumCulled = false;
	}

	if (options.atomsStyle == "ball") {

		var unitCellScaleArr = new Float32Array(moleculeData.length);
		var unitCellOffsetArr = new Float32Array(moleculeData.length * 3);
		var unitCellColorArr = new Float32Array(moleculeData.length * 3);
		var unitCellSelectionArr = new Float32Array(moleculeData.length);
		var unitCellIndexArr = new Float32Array(moleculeData.length);
		var t0 = performance.now();
		unitCellSelectionArr.fill(0);
		for (var i = 0; i < moleculeData.length; i++) {
			var atomData = moleculeData[i];
			unitCellIndexArr[i] = i;

			if (colorCode == "atom") {
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

			unitCellOffsetArr[i * 3 + 0] = atomData.x;
			unitCellOffsetArr[i * 3 + 1] = atomData.y;
			unitCellOffsetArr[i * 3 + 2] = atomData.z;

			if (moleculeData[i].highlighted) {
				unitCellScaleArr[i] = atomSize * 2;
			} else {
				unitCellScaleArr[i] = atomSize;
			}

			var tempColor = new THREE.Color(color);
			unitCellColorArr[i * 3 + 0] = tempColor.r;
			unitCellColorArr[i * 3 + 1] = tempColor.g;
			unitCellColorArr[i * 3 + 2] = tempColor.b;

			if (moleculeData[i].selected || moleculeData[i].highlighted) {
				unitCellSelectionArr[i] = 1;
			}
		}
		// console.log('single cell', performance.now() - t0);
		var atomsGeometry = _UtilitiesJs.getPeriodicReplicatesInstancesMolecule(unitCellScaleArr, unitCellOffsetArr, unitCellColorArr, unitCellSelectionArr, unitCellIndexArr, systemDimension, latticeVectors, options);
		// console.log('geometry', performance.now() - t0);
		var material = _MaterialsJs.getMoleculeAtomsMaterialInstanced(options);
		var atoms = new THREE.Mesh(atomsGeometry, material);
		atoms.frustumCulled = false;
		// atoms.userData.numVerticesPerAtom = sphereTemplate.attributes.position.count;
	}
	view.molecule.atoms = atoms;
	view.scene.add(atoms);
}

function addBonds(view, moleculeData, neighborsData) {
	var systemDimension = view.systemDimension;
	var latticeVectors = view.systemLatticeVectors;
	var options = view.options;
	var colorCode = options.moleculeColorCodeBasis;
	var lut = view.moleculeLut;

	if (options.bondsStyle == "tube") {
		var bondList = [];
		var bondColorList = [];

		var bondSelectionList = [];
		for (var i = 0; i < moleculeData.length; i++) {
			// if (moleculeData[i].selected) {
			var tempNeighborObject = neighborsData[i];
			var neighborsList = tempNeighborObject.neighborsList;
			var distancesList = tempNeighborObject.distancesList;
			var coordinatesList = tempNeighborObject.coordinatesList;

			if (colorCode == "atom") {
				var color = _AtomSetupJs.colorSetup[moleculeData[i].atom];
			} else {
				var color = lut.getColor(moleculeData[i][colorCode]);
			}

			var point1 = new THREE.Vector3(moleculeData[i].x, moleculeData[i].y, moleculeData[i].z);

			for (var j = 0; j < neighborsList.length; j++) {
				var point2 = coordinatesList[j];
				if (distancesList[j] < options.maxBondLength && distancesList[j] > options.minBondLength /*&&  neighborsList[j].selected*/) {
						bondList.push(createBond(options, point1, point2));
						var tempColor = new THREE.Color(color);
						bondColorList.push([tempColor.r, tempColor.g, tempColor.b]);
						if (moleculeData[i].selected && neighborsList[j].selected) {
							bondSelectionList.push(1);
						} else {
							bondSelectionList.push(0);
						}
					}
			}
			// }
		}
		var bondsGeometry = combineGeometry(bondList, bondColorList, bondSelectionList);

		var material = _MaterialsJs.getMoleculeMaterialInstanced(options);

		var offsetResult = _UtilitiesJs.getOffsetArray(systemDimension, latticeVectors, options);
		bondsGeometry.setAttribute('offset', new THREE.InstancedBufferAttribute(offsetResult.sumDisplacement, 3));
		bondsGeometry.maxInstancedCount = offsetResult.counter;
		var bonds = new THREE.Mesh(bondsGeometry, material);
	} else if (options.bondsStyle == "line") {

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

				var point1 = new THREE.Vector3(moleculeData[i].x, moleculeData[i].y, moleculeData[i].z);

				for (var j = 0; j < neighborsList.length; j++) {
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

		var geometry = new THREE.InstancedBufferGeometry();
		geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
		geometry.setAttribute('color', new THREE.Float32BufferAttribute(colors, 3));
		geometry.setIndex(new THREE.BufferAttribute(new Uint16Array(indices), 1));

		var offsetResult = _UtilitiesJs.getOffsetArray(systemDimension, latticeVectors, options);
		geometry.setAttribute('offset', new THREE.InstancedBufferAttribute(offsetResult.sumDisplacement, 3));
		geometry.maxInstancedCount = offsetResult.counter;

		var bonds = new THREE.LineSegments(geometry, _MaterialsJs.getMoleculeBondLineMaterialInstanced(options));
		bonds.frustumCulled = false;
	}

	view.molecule.bonds = bonds;
	view.scene.add(bonds);
}

function combineGeometry(geoarray, colorarray, selectionList) {
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
	var sumSelectionArr = new Float32Array(indexArrLength);
	//sumSelectionArr.fill(0);

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

		sumSelectionArr.fill(selectionList[a], a * indexArr.length, (a + 1) * indexArr.length);
	}

	var combinedGeometry = new THREE.InstancedBufferGeometry();
	combinedGeometry.setAttribute('position', new THREE.BufferAttribute(sumPosArr, 3));
	combinedGeometry.setAttribute('normal', new THREE.BufferAttribute(sumNormArr, 3));
	combinedGeometry.setAttribute('uv', new THREE.BufferAttribute(sumUvArr, 2));
	combinedGeometry.setAttribute('color', new THREE.BufferAttribute(sumColorArr, 3));
	combinedGeometry.setAttribute('selection', new THREE.BufferAttribute(sumSelectionArr, 1));
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

function getMoleculeGeometry(view) {

	view.molecule = {};
	var options = view.options;
	var currentFrame = options.currentFrame.toString();
	var scene = view.scene;
	//var moleculeData = view.systemMoleculeData;
	var moleculeData = view.systemMoleculeDataFramed[currentFrame];
	var neighborsData = view.systemMoleculeDataFramedBondsDict[currentFrame];

	if (options.showAtoms) {
		addAtoms(view, moleculeData);
	}

	if (options.showBonds) {
		addBonds(view, moleculeData, neighborsData);
	}
}

function updateMoleculeGeometrySpriteAtom(view) {
	var options = view.options;
	var sizeCode = options.moleculeSizeCodeBasis;
	var colorCode = options.moleculeColorCodeBasis;
	var currentFrame = options.currentFrame.toString();

	var moleculeData = view.systemMoleculeDataFramed[currentFrame];
	var atoms = view.molecule.atoms;
	var geometry = atoms.geometry;
	if (colorCode != "atom") {
		var colorMap = options.colorMap;
		var numberOfColors = 512;

		var lut = new THREE.Lut(colorMap, numberOfColors);
		lut.setMax(options.moleculeColorSettingMax);
		lut.setMin(options.moleculeColorSettingMin);
		//view.lut = lut;
		view.moleculeLut = lut;
	}

	var positions = new Float32Array(moleculeData.length * 3);
	var colors = new Float32Array(moleculeData.length * 3);
	var sizes = new Float32Array(moleculeData.length);
	var alphas = new Float32Array(moleculeData.length);

	var atomSize;
	var i3 = 0;
	for (var i = 0; i < moleculeData.length; i++) {
		var atomData = moleculeData[i];
		positions[i3 + 0] = atomData.x;
		positions[i3 + 1] = atomData.y;
		positions[i3 + 2] = atomData.z;

		if (colorCode == "atom") {
			var color = _UtilitiesOtherJs.colorToRgb(_AtomSetupJs.colorSetup[atomData.atom]);
		} else {
			var color = lut.getColor(atomData[colorCode]);
		}

		colors[i3 + 0] = color.r;
		colors[i3 + 1] = color.g;
		colors[i3 + 2] = color.b;

		if (sizeCode == "atom") {
			atomSize = options.atomSize * _AtomSetupJs.atomRadius[atomData.atom] * 10;
		} else {
			var tempSize = (atomData[sizeCode] - options.moleculeSizeSettingMin) / (options.moleculeSizeSettingMax - options.moleculeSizeSettingMin);
			atomSize = options.atomSize * tempSize * 10;
		}

		if (moleculeData[i].highlighted) {
			atomSize = atomSize * 2;
			sizes[i] = atomSize;
			alphas[i] = options.moleculeAlpha;
		} else if (moleculeData[i].selected) {

			sizes[i] = atomSize;
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

	geometry.attributes.position.needsUpdate = true;
	geometry.attributes.customColor.needsUpdate = true;
	geometry.attributes.size.needsUpdate = true;
	geometry.attributes.alpha.needsUpdate = true;
}

function updateMoleculeGeometryBallAtom(view) {
	var atoms = view.molecule.atoms;
	var geometry = atoms.geometry;
	var systemDimension = view.systemDimension;
	var latticeVectors = view.systemLatticeVectors;
	var options = view.options;
	var sizeCode = options.moleculeSizeCodeBasis;
	var colorCode = options.moleculeColorCodeBasis;
	var currentFrame = options.currentFrame.toString();
	var moleculeData = view.systemMoleculeDataFramed[currentFrame];

	if (colorCode != "atom") {
		var colorMap = options.colorMap;
		var numberOfColors = 512;

		var lut = new THREE.Lut(colorMap, numberOfColors);
		lut.setMax(options.moleculeColorSettingMax);
		lut.setMin(options.moleculeColorSettingMin);
		//view.lut = lut;
		view.moleculeLut = lut;
	}

	var unitCellOffsetArr = new Float32Array(moleculeData.length * 3);
	var unitCellScaleArr = new Float32Array(moleculeData.length);
	var unitCellColorArr = new Float32Array(moleculeData.length * 3);
	var unitCellSelectionArr = new Float32Array(moleculeData.length);
	var unitCellIndexArr = new Float32Array(moleculeData.length);
	var t0 = performance.now();
	unitCellSelectionArr.fill(0);
	var atomSize;
	for (var i = 0; i < moleculeData.length; i++) {
		var atomData = moleculeData[i];
		unitCellIndexArr[i] = i;

		if (colorCode == "atom") {
			var color = _AtomSetupJs.colorSetup[atomData.atom];
		} else {
			var color = lut.getColor(atomData[colorCode]);
		}
		if (sizeCode == "atom") {
			atomSize = options.atomSize * _AtomSetupJs.atomRadius[atomData.atom];
		} else {
			var tempSize = (atomData[sizeCode] - options.moleculeSizeSettingMin) / (options.moleculeSizeSettingMax - options.moleculeSizeSettingMin);
			atomSize = options.atomSize * tempSize;
		}

		unitCellOffsetArr[i * 3 + 0] = atomData.x;
		unitCellOffsetArr[i * 3 + 1] = atomData.y;
		unitCellOffsetArr[i * 3 + 2] = atomData.z;

		if (moleculeData[i].highlighted) {
			unitCellScaleArr[i] = atomSize * 2;
		} else {
			unitCellScaleArr[i] = atomSize;
		}

		var tempColor = new THREE.Color(color);
		unitCellColorArr[i * 3 + 0] = tempColor.r;
		unitCellColorArr[i * 3 + 1] = tempColor.g;
		unitCellColorArr[i * 3 + 2] = tempColor.b;

		if (moleculeData[i].selected || moleculeData[i].highlighted) {
			unitCellSelectionArr[i] = 1;
		}
	}

	_UtilitiesJs.updatePeriodicReplicatesInstancesMolecule(geometry, unitCellScaleArr, unitCellOffsetArr, unitCellColorArr, unitCellSelectionArr, unitCellIndexArr, systemDimension, latticeVectors, options);
}

function updateMoleculeGeometryBallAtomScale(view) {
	var atoms = view.molecule.atoms;
	var geometry = atoms.geometry;
	var options = view.options;
	var sizeCode = options.moleculeSizeCodeBasis;
	var currentFrame = options.currentFrame.toString();
	var moleculeData = view.systemMoleculeDataFramed[currentFrame];

	var unitCellScaleArr = new Float32Array(moleculeData.length);
	var t0 = performance.now();
	var atomSize;
	for (var i = 0; i < moleculeData.length; i++) {
		var atomData = moleculeData[i];
		if (sizeCode == "atom") {
			atomSize = options.atomSize * _AtomSetupJs.atomRadius[atomData.atom];
		} else {
			var tempSize = (atomData[sizeCode] - options.moleculeSizeSettingMin) / (options.moleculeSizeSettingMax - options.moleculeSizeSettingMin);
			atomSize = options.atomSize * tempSize;
		}

		if (moleculeData[i].highlighted) {
			unitCellScaleArr[i] = atomSize * 2;
		} else {
			unitCellScaleArr[i] = atomSize;
		}
	}

	_UtilitiesJs.updatePeriodicReplicatesInstancesMoleculeScale(geometry, unitCellScaleArr, options);
}

function updateClippingPlaneBallAtom(view) {
	var atoms = view.molecule.atoms;
	var atomsMaterialShader = atoms.material.userData.shader;
	var options = view.options;
	atomsMaterialShader.uniforms.xClippingPlaneMax.value = options.x_high;
	atomsMaterialShader.uniforms.xClippingPlaneMin.value = options.x_low;
	atomsMaterialShader.uniforms.yClippingPlaneMax.value = options.y_high;
	atomsMaterialShader.uniforms.yClippingPlaneMin.value = options.y_low;
	atomsMaterialShader.uniforms.zClippingPlaneMax.value = options.z_high;
	atomsMaterialShader.uniforms.zClippingPlaneMin.value = options.z_low;
}

function updateClippingPlaneSpriteAtom(view) {
	var atoms = view.molecule.atoms;
	var options = view.options;
	atoms.material.uniforms.xClippingPlaneMax.value = options.x_high;
	atoms.material.uniforms.xClippingPlaneMin.value = options.x_low;
	atoms.material.uniforms.yClippingPlaneMax.value = options.y_high;
	atoms.material.uniforms.yClippingPlaneMin.value = options.y_low;
	atoms.material.uniforms.zClippingPlaneMax.value = options.z_high;
	atoms.material.uniforms.zClippingPlaneMin.value = options.z_low;
}

function updateMoleculeGeometrySlider(view) {

	var options = view.options;

	var t0 = performance.now();
	if (options.showAtoms) {
		var systemDimension = view.systemDimension;
		var latticeVectors = view.systemLatticeVectors;

		if (options.atomsStyle == "sprite") {
			_UtilitiesJs.updateOffsetArray(systemDimension, latticeVectors, view.molecule.atoms.geometry, options);
			updateClippingPlaneSpriteAtom(view);
		} else if (options.atomsStyle == "ball") {
			updateClippingPlaneBallAtom(view);
		}
	}

	if (options.showBonds) {
		var systemDimension = view.systemDimension;
		var latticeVectors = view.systemLatticeVectors;

		_UtilitiesJs.updateOffsetArray(systemDimension, latticeVectors, view.molecule.bonds.geometry, options);

		if (options.bondsStyle == "line") {
			view.molecule.bonds.material.uniforms.xClippingPlaneMax.value = options.x_high;
			view.molecule.bonds.material.uniforms.xClippingPlaneMin.value = options.x_low;
			view.molecule.bonds.material.uniforms.yClippingPlaneMax.value = options.y_high;
			view.molecule.bonds.material.uniforms.yClippingPlaneMin.value = options.y_low;
			view.molecule.bonds.material.uniforms.zClippingPlaneMax.value = options.z_high;
			view.molecule.bonds.material.uniforms.zClippingPlaneMin.value = options.z_low;
		} else if (options.bondsStyle == "tube") {
			var bondsMaterialShader = view.molecule.bonds.material.userData.shader;
			bondsMaterialShader.uniforms.xClippingPlaneMax.value = options.x_high;
			bondsMaterialShader.uniforms.xClippingPlaneMin.value = options.x_low;
			bondsMaterialShader.uniforms.yClippingPlaneMax.value = options.y_high;
			bondsMaterialShader.uniforms.yClippingPlaneMin.value = options.y_low;
			bondsMaterialShader.uniforms.zClippingPlaneMax.value = options.z_high;
			bondsMaterialShader.uniforms.zClippingPlaneMin.value = options.z_low;
		}
	}
	//  console.log('update molecule replicate took: ', performance.now() - t0);
}

function updateMoleculeGeometry(view) {

	var options = view.options;

	if (options.showMolecule) {
		var t0 = performance.now();
		if (options.showAtoms) {
			var systemDimension = view.systemDimension;
			var latticeVectors = view.systemLatticeVectors;

			if (options.atomsStyle == "sprite") {
				updateMoleculeGeometrySpriteAtom(view);
				_UtilitiesJs.updateOffsetArray(systemDimension, latticeVectors, view.molecule.atoms.geometry, options);
				updateClippingPlaneSpriteAtom(view);
			} else if (options.atomsStyle == "ball") {
				updateMoleculeGeometryBallAtom(view);
				updateClippingPlaneBallAtom(view);
			}
		}

		if (options.showBonds) {
			var systemDimension = view.systemDimension;
			var latticeVectors = view.systemLatticeVectors;

			_UtilitiesJs.updateOffsetArray(systemDimension, latticeVectors, view.molecule.bonds.geometry, options);

			if (options.bondsStyle == "line") {
				view.molecule.bonds.material.uniforms.xClippingPlaneMax.value = options.x_high;
				view.molecule.bonds.material.uniforms.xClippingPlaneMin.value = options.x_low;
				view.molecule.bonds.material.uniforms.yClippingPlaneMax.value = options.y_high;
				view.molecule.bonds.material.uniforms.yClippingPlaneMin.value = options.y_low;
				view.molecule.bonds.material.uniforms.zClippingPlaneMax.value = options.z_high;
				view.molecule.bonds.material.uniforms.zClippingPlaneMin.value = options.z_low;
			} else if (options.bondsStyle == "tube") {
				var bondsMaterialShader = view.molecule.bonds.material.userData.shader;
				bondsMaterialShader.uniforms.xClippingPlaneMax.value = options.x_high;
				bondsMaterialShader.uniforms.xClippingPlaneMin.value = options.x_low;
				bondsMaterialShader.uniforms.yClippingPlaneMax.value = options.y_high;
				bondsMaterialShader.uniforms.yClippingPlaneMin.value = options.y_low;
				bondsMaterialShader.uniforms.zClippingPlaneMax.value = options.z_high;
				bondsMaterialShader.uniforms.zClippingPlaneMin.value = options.z_low;
			}
		}
		// console.log('update molecule replicate took: ', performance.now() - t0);
	}
}

function updateMoleculeGeometryScale(view) {
	var options = view.options;

	var t0 = performance.now();
	if (options.showAtoms) {
		var systemDimension = view.systemDimension;
		var latticeVectors = view.systemLatticeVectors;

		if (options.atomsStyle == "sprite") {
			updateMoleculeGeometrySpriteAtom(view);
			_UtilitiesJs.updateOffsetArray(systemDimension, latticeVectors, view.molecule.atoms.geometry, options);
			updateClippingPlaneSpriteAtom(view);
		} else if (options.atomsStyle == "ball") {
			updateMoleculeGeometryBallAtomScale(view);
		}
	}

	// console.log('update molecule scale replicate took: ', performance.now() - t0);
}

function changeMoleculeGeometry(view) {

	removeMoleculeGeometry(view);
	if (view.options.showMolecule) {
		getMoleculeGeometry(view);
	}
}

function removeMoleculeGeometry(view) {

	if (view.molecule != null) {
		view.scene.remove(view.molecule.atoms);
		view.scene.remove(view.molecule.bonds);
		delete view.molecule;
	}
}

},{"../Utilities/other.js":34,"./AtomSetup.js":14,"./Materials.js":15,"./Utilities.js":18}],17:[function(require,module,exports){
"use strict";

exports.__esModule = true;
exports.getPointCloudGeometry = getPointCloudGeometry;
exports.updatePointCloudGeometry = updatePointCloudGeometry;
exports.removePointCloudGeometry = removePointCloudGeometry;
exports.changePointCloudGeometry = changePointCloudGeometry;

var _MaterialsJs = require("./Materials.js");

var _UtilitiesJs = require("./Utilities.js");

function getPointCloudGeometry(view) {

	var gridSpacing = view.spatiallyResolvedData.gridSpacing;
	var systemDimension = view.systemDimension;
	var latticeVectors = view.systemLatticeVectors;

	var options = view.options;
	var scene = view.scene;
	var currentFrame = options.currentFrame.toString();
	var spatiallyResolvedData = view.systemSpatiallyResolvedDataFramed[currentFrame];

	var num_blocks = view.systemSpatiallyResolvedData.length;
	var points_in_block = new Float32Array(num_blocks);
	var pointCloudDensity = Math.pow(10, options.pointCloudTotalMagnitude) * options.pointCloudParticles;
	var count = 0;

	var voxelVolume = gridSpacing.x * gridSpacing.y * gridSpacing.z;

	for (var k = 0; k < num_blocks; k++) {
		var num_points = Math.min(Math.floor(spatiallyResolvedData[k][options.density] * pointCloudDensity * voxelVolume), options.pointCloudMaxPointPerBlock);
		points_in_block[k] = num_points;
		count += num_points;
	}
	console.log("total points in cloud: ", count);

	var positions = new Float32Array(count * 3);
	var colors = new Float32Array(count * 3);
	var sizes = new Float32Array(count);
	var alphas = new Float32Array(count);
	var selections = new Float32Array(count);
	selections.fill(1);
	// var parentBlock = new Float32Array( count);
	var voxelPointDict = {};
	var pointVoxelMap = new Uint32Array(count);

	var colorMap = options.colorMap;
	var numberOfColors = 512;

	var lut = new THREE.Lut(colorMap, numberOfColors);
	lut.setMax(options.pointCloudColorSettingMax);
	lut.setMin(options.pointCloudColorSettingMin);
	view.lut = lut;

	var i = 0,
	    i3 = 0;
	var temp_num_points = 0;

	var xTempBeforeTransform, yTempBeforeTransform, zTempBeforeTransform, x, y, z, color;
	for (var k = 0; k < num_blocks; k++) {
		temp_num_points = points_in_block[k];
		voxelPointDict[k] = [];
		if (temp_num_points > 0) {

			for (var j = 0; j < temp_num_points; j++) {

				xTempBeforeTransform = (Math.random() - 0.5) * gridSpacing.x;
				yTempBeforeTransform = (Math.random() - 0.5) * gridSpacing.y;
				zTempBeforeTransform = (Math.random() - 0.5) * gridSpacing.z;

				x = latticeVectors.u11 * xTempBeforeTransform + latticeVectors.u21 * yTempBeforeTransform + latticeVectors.u31 * zTempBeforeTransform + spatiallyResolvedData[k].x;
				y = latticeVectors.u12 * xTempBeforeTransform + latticeVectors.u22 * yTempBeforeTransform + latticeVectors.u32 * zTempBeforeTransform + spatiallyResolvedData[k].y;
				z = latticeVectors.u13 * xTempBeforeTransform + latticeVectors.u23 * yTempBeforeTransform + latticeVectors.u33 * zTempBeforeTransform + spatiallyResolvedData[k].z;

				positions[i3 + 0] = x;
				positions[i3 + 1] = y;
				positions[i3 + 2] = z;

				color = lut.getColor(spatiallyResolvedData[k][options.propertyOfInterest]);

				colors[i3 + 0] = color.r;
				colors[i3 + 1] = color.g;
				colors[i3 + 2] = color.b;

				/*if (spatiallyResolvedData[k].highlighted) {
    	sizes[ i ] = options.pointCloudSize * 3;
    	alphas[ i ] = 1;
    } else if (spatiallyResolvedData[k].selected){
    	alphas[ i ] = options.pointCloudAlpha;
    	if (options.animate) {
    		sizes[ i ] = Math.random() * options.pointCloudSize;
    	} else { 
    		sizes[ i ] = options.pointCloudSize; 
    	}
    } else {
    	alphas[ i ] = 0;
    	sizes[ i ] = 0;
    }*/

				if (spatiallyResolvedData[k].highlighted) {
					sizes[i] = options.pointCloudSize * 3;
					alphas[i] = 1;
				} else {
					// not highlighted
					alphas[i] = options.pointCloudAlpha;
					sizes[i] = options.pointCloudSize;
					if (!spatiallyResolvedData[k].selected) {
						// not highlighted and not selected
						selections[i] = 0;
					}
				}

				// parentBlock[i] = k;
				pointVoxelMap[i] = k;
				voxelPointDict[k].push(i);
				i++;
				i3 += 3;
			}
		}
	}

	var geometry = new THREE.InstancedBufferGeometry();
	geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
	geometry.setAttribute('customColor', new THREE.BufferAttribute(colors, 3));
	geometry.setAttribute('size', new THREE.BufferAttribute(sizes, 1));
	geometry.setAttribute('alpha', new THREE.BufferAttribute(alphas, 1));
	geometry.setAttribute('selection', new THREE.BufferAttribute(selections, 1));
	// geometry.parentBlockMap = parentBlock;
	var offsetResult = _UtilitiesJs.getOffsetArray(systemDimension, latticeVectors, options);
	geometry.setAttribute('offset', new THREE.InstancedBufferAttribute(offsetResult.sumDisplacement, 3));
	geometry.maxInstancedCount = offsetResult.counter;

	var System = new THREE.Points(geometry, _MaterialsJs.getPointCloudMaterialInstanced(options));
	System.userData.pointVoxelMap = pointVoxelMap;
	System.userData.voxelPointDict = voxelPointDict;
	System.frustumCulled = false;
	view.System = System;
	view.pointVoxelMap = pointVoxelMap;

	scene.add(System);
	options.render.call();
}

function updatePointCloudGeometry(view) {

	var options = view.options;
	if (options.showPointCloud && view.System) {
		// var parentBlock = view.System.geometry.parentBlockMap;
		var pointVoxelMap = view.System.userData.pointVoxelMap;
		var currentFrame = options.currentFrame.toString();
		var spatiallyResolvedData = view.systemSpatiallyResolvedDataFramed[currentFrame];
		var positionArray = view.System.geometry.attributes.position.array;

		var count = view.System.geometry.attributes.size.array.length;

		var colors = new Float32Array(count * 3);
		var sizes = new Float32Array(count);
		var alphas = new Float32Array(count);
		var selections = new Float32Array(count);
		selections.fill(1);

		var colorMap = options.colorMap;
		var numberOfColors = 512;

		var lut = new THREE.Lut(colorMap, numberOfColors);
		lut.setMax(options.pointCloudColorSettingMax);
		lut.setMin(options.pointCloudColorSettingMin);
		view.lut = lut;

		for (var i = 0, i3 = 0; i < count; i++) {
			var x = positionArray[i3 + 0];
			var y = positionArray[i3 + 1];
			var z = positionArray[i3 + 2];
			var k = pointVoxelMap[i];

			var color = lut.getColor(spatiallyResolvedData[k][options.propertyOfInterest]);

			colors[i3 + 0] = color.r;
			colors[i3 + 1] = color.g;
			colors[i3 + 2] = color.b;

			/*if (spatiallyResolvedData[k].highlighted) {
   	// console.log('found highlighted point', k );
   	sizes[ i ] = options.pointCloudSize * 3;
   	alphas[ i ] = 1;
   } else if (spatiallyResolvedData[k].selected){
   	alphas[ i ] = options.pointCloudAlpha;
   	if (options.animate) {
   		sizes[ i ] = Math.random() * options.pointCloudSize;
   	} else { 
   		sizes[ i ] = options.pointCloudSize; 
   	}
   } else {
   	alphas[ i ] = 0;
   	sizes[ i ] = 0;
   }*/

			if (spatiallyResolvedData[k].highlighted) {
				sizes[i] = options.pointCloudSize * 3;
				alphas[i] = 1;
			} else {
				// not highlighted
				alphas[i] = options.pointCloudAlpha;
				sizes[i] = options.pointCloudSize;
				if (!spatiallyResolvedData[k].selected) {
					// not highlighted and not selected
					selections[i] = 0;
				}
			}
			i3 += 3;
		}

		view.System.geometry.setAttribute('customColor', new THREE.BufferAttribute(colors, 3));
		view.System.geometry.setAttribute('size', new THREE.BufferAttribute(sizes, 1));
		view.System.geometry.setAttribute('alpha', new THREE.BufferAttribute(alphas, 1));
		view.System.geometry.setAttribute('selection', new THREE.BufferAttribute(selections, 1));

		var systemDimension = view.systemDimension;
		var latticeVectors = view.systemLatticeVectors;

		_UtilitiesJs.updateOffsetArray(systemDimension, latticeVectors, view.System.geometry, options);

		view.System.material.uniforms.xClippingPlaneMax.value = options.x_high;
		view.System.material.uniforms.xClippingPlaneMin.value = options.x_low;
		view.System.material.uniforms.yClippingPlaneMax.value = options.y_high;
		view.System.material.uniforms.yClippingPlaneMin.value = options.y_low;
		view.System.material.uniforms.zClippingPlaneMax.value = options.z_high;
		view.System.material.uniforms.zClippingPlaneMin.value = options.z_low;

		options.render.call();
	}
}

/* export function animatePointCloudGeometry(view){
	//console.log('updated')

	var options = view.options;

	var currentFrame = options.currentFrame.toString();
	var spatiallyResolvedData = view.systemSpatiallyResolvedDataFramed[currentFrame];
	var positionArray = view.System.geometry.attributes.position.array;
	var sizeArray = view.System.geometry.attributes.size.array;
	// var parentBlock = view.System.geometry.parentBlockMap;
	var pointVoxelMap = view.System.userData.pointVoxelMap ;


	var particles = options.pointCloudParticles;
	var num_blocks = view.systemSpatiallyResolvedData.length;
	var points_in_block = new Float32Array(num_blocks);
	var count = view.System.geometry.attributes.size.array.length;


	//var colors = new Float32Array(count *3);
	var sizes = new Float32Array( count);

	for (var i = 0, i3 = 0; i < count; i++){
		var x = positionArray[ i3 + 0 ]/10;
		var y = positionArray[ i3 + 1 ]/10;
		var z = positionArray[ i3 + 2 ]/10;
		var k = pointVoxelMap[i];
	
		if ( spatiallyResolvedData[k].selected)
		{
			var temp = sizeArray[i]-0.1;
			if (temp >= 0.0) {sizeArray[i] = temp;}
			else {sizeArray[i] = options.pointCloudSize;}
		}
		else {
			sizes[ i ] = 0;
		}

	}
	i3 += 3;

	
} */

function removePointCloudGeometry(view) {
	view.scene.remove(view.System);
	if (view.System != null) {
		view.scene.remove(view.System);
		delete view.System;
	}
	view.options.render.call();
}

function changePointCloudGeometry(view) {
	removePointCloudGeometry(view);
	if (view.options.showPointCloud) {
		getPointCloudGeometry(view);
	}
}

},{"./Materials.js":15,"./Utilities.js":18}],18:[function(require,module,exports){
'use strict';

exports.__esModule = true;
exports.getOffsetArray = getOffsetArray;
exports.getPeriodicReplicatesInstancesMolecule = getPeriodicReplicatesInstancesMolecule;
exports.updatePeriodicReplicatesInstancesMoleculeScale = updatePeriodicReplicatesInstancesMoleculeScale;
exports.updatePeriodicReplicatesInstancesMolecule = updatePeriodicReplicatesInstancesMolecule;
exports.updateOffsetArray = updateOffsetArray;

function getOffsetArray(systemDimension, latticeVectors, options) {

	var dim1Step = { 'x': systemDimension.x * latticeVectors.u11,
		'y': systemDimension.x * latticeVectors.u12,
		'z': systemDimension.x * latticeVectors.u13 };
	var dim2Step = { 'x': systemDimension.y * latticeVectors.u21,
		'y': systemDimension.y * latticeVectors.u22,
		'z': systemDimension.y * latticeVectors.u23 };
	var dim3Step = { 'x': systemDimension.z * latticeVectors.u31,
		'y': systemDimension.z * latticeVectors.u32,
		'z': systemDimension.z * latticeVectors.u33 };

	var x_start = -1 * ((options.xPBC - 1) / 2);
	var x_end = (options.xPBC - 1) / 2 + 1;
	var y_start = -1 * ((options.yPBC - 1) / 2);
	var y_end = (options.yPBC - 1) / 2 + 1;
	var z_start = -1 * ((options.zPBC - 1) / 2);
	var z_end = (options.zPBC - 1) / 2 + 1;

	var counter = 0;
	var sumDisplacement = new Float32Array(9 * 9 * 9 * 3);
	sumDisplacement.fill(0);
	var xStep, yStep, zStep;
	for (var i = x_start; i < x_end; i++) {
		for (var j = y_start; j < y_end; j++) {
			for (var k = z_start; k < z_end; k++) {
				xStep = i * dim1Step.x + j * dim2Step.x + k * dim3Step.x;
				yStep = i * dim1Step.y + j * dim2Step.y + k * dim3Step.y;
				zStep = i * dim1Step.z + j * dim2Step.z + k * dim3Step.z;

				sumDisplacement[counter * 3 + 0] = xStep;
				sumDisplacement[counter * 3 + 1] = yStep;
				sumDisplacement[counter * 3 + 2] = zStep;
				counter++;
			}
		}
	}
	return { sumDisplacement: sumDisplacement, counter: counter };
}

function getPeriodicReplicatesInstancesMolecule(unitCellScaleArr, unitCellOffsetArr, unitCellColorArr, unitCellSelectionArr, unitCellIndexArr, systemDimension, latticeVectors, options) {
	var sumScaleArr = new Float32Array(unitCellScaleArr.length * 9 * 9 * 9);
	var sumOffsetArr = new Float32Array(unitCellOffsetArr.length * 9 * 9 * 9);
	var sumColorArr = new Float32Array(unitCellColorArr.length * 9 * 9 * 9);
	var sumSelectionArr = new Float32Array(unitCellSelectionArr.length * 9 * 9 * 9);
	var sumIndexArr = new Float32Array(unitCellIndexArr.length * 9 * 9 * 9);

	var numInstancePerUnitCell = unitCellScaleArr.length;

	var dim1Step = { 'x': systemDimension.x * latticeVectors.u11,
		'y': systemDimension.x * latticeVectors.u12,
		'z': systemDimension.x * latticeVectors.u13 };
	var dim2Step = { 'x': systemDimension.y * latticeVectors.u21,
		'y': systemDimension.y * latticeVectors.u22,
		'z': systemDimension.y * latticeVectors.u23 };
	var dim3Step = { 'x': systemDimension.z * latticeVectors.u31,
		'y': systemDimension.z * latticeVectors.u32,
		'z': systemDimension.z * latticeVectors.u33 };

	var x_start = -1 * ((options.xPBC - 1) / 2);
	var x_end = (options.xPBC - 1) / 2 + 1;
	var y_start = -1 * ((options.yPBC - 1) / 2);
	var y_end = (options.yPBC - 1) / 2 + 1;
	var z_start = -1 * ((options.zPBC - 1) / 2);
	var z_end = (options.zPBC - 1) / 2 + 1;

	var currentCellIndex = 0;
	var xStep, yStep, zStep, currentStartingArrIndex;
	for (var i = x_start; i < x_end; i++) {
		for (var j = y_start; j < y_end; j++) {
			for (var k = z_start; k < z_end; k++) {
				//each unit cell
				currentStartingArrIndex = numInstancePerUnitCell * currentCellIndex;
				sumScaleArr.set(unitCellScaleArr, currentStartingArrIndex);
				sumSelectionArr.set(unitCellSelectionArr, currentStartingArrIndex);
				sumIndexArr.set(unitCellIndexArr, currentStartingArrIndex);
				sumColorArr.set(unitCellColorArr, currentStartingArrIndex * 3);

				xStep = i * dim1Step.x + j * dim2Step.x + k * dim3Step.x;
				yStep = i * dim1Step.y + j * dim2Step.y + k * dim3Step.y;
				zStep = i * dim1Step.z + j * dim2Step.z + k * dim3Step.z;
				for (var ii = 0; ii < numInstancePerUnitCell; ii++) {
					sumOffsetArr[(ii + currentStartingArrIndex) * 3 + 0] = unitCellOffsetArr[ii * 3 + 0] + xStep;
					sumOffsetArr[(ii + currentStartingArrIndex) * 3 + 1] = unitCellOffsetArr[ii * 3 + 1] + yStep;
					sumOffsetArr[(ii + currentStartingArrIndex) * 3 + 2] = unitCellOffsetArr[ii * 3 + 2] + zStep;
				}

				currentCellIndex++;
			}
		}
	}
	var totalNumInstances = currentCellIndex * numInstancePerUnitCell;

	var sphereTemplate = new THREE.SphereBufferGeometry(1, options.atomModelSegments, Math.ceil(options.atomModelSegments / 2));
	var combinedGeometry = new THREE.InstancedBufferGeometry();
	combinedGeometry.copy(sphereTemplate);
	combinedGeometry.setAttribute('instanceOffset', new THREE.InstancedBufferAttribute(sumOffsetArr, 3));
	combinedGeometry.setAttribute('instanceScale', new THREE.InstancedBufferAttribute(sumScaleArr, 1));
	combinedGeometry.setAttribute('instanceColor', new THREE.InstancedBufferAttribute(sumColorArr, 3));
	combinedGeometry.setAttribute('selection', new THREE.InstancedBufferAttribute(sumSelectionArr, 1));
	combinedGeometry.setAttribute('atomIndex', new THREE.InstancedBufferAttribute(sumIndexArr, 1));
	console.log(sumIndexArr);
	combinedGeometry.maxInstancedCount = totalNumInstances;

	return combinedGeometry;
}

function updatePeriodicReplicatesInstancesMoleculeScale(geometry, unitCellScaleArr, options) {
	var numInstancePerUnitCell = unitCellScaleArr.length;
	var sumScaleArr = new Float32Array(unitCellScaleArr.length * 9 * 9 * 9);

	var x_start = -1 * ((options.xPBC - 1) / 2);
	var x_end = (options.xPBC - 1) / 2 + 1;
	var y_start = -1 * ((options.yPBC - 1) / 2);
	var y_end = (options.yPBC - 1) / 2 + 1;
	var z_start = -1 * ((options.zPBC - 1) / 2);
	var z_end = (options.zPBC - 1) / 2 + 1;
	var currentCellIndex = 0;
	var currentStartingArrIndex;
	for (var i = x_start; i < x_end; i++) {
		for (var j = y_start; j < y_end; j++) {
			for (var k = z_start; k < z_end; k++) {
				//each unit cell
				currentStartingArrIndex = numInstancePerUnitCell * currentCellIndex;
				sumScaleArr.set(unitCellScaleArr, currentStartingArrIndex);
				currentCellIndex++;
			}
		}
	}

	geometry.setAttribute('instanceScale', new THREE.InstancedBufferAttribute(sumScaleArr, 1));

	geometry.attributes.instanceScale.needsUpdate = true;
}

function updatePeriodicReplicatesInstancesMolecule(geometry, unitCellScaleArr, unitCellOffsetArr, unitCellColorArr, unitCellSelectionArr, unitCellIndexArr, systemDimension, latticeVectors, options) {
	var sumScaleArr = new Float32Array(unitCellScaleArr.length * 9 * 9 * 9);
	var sumOffsetArr = new Float32Array(unitCellOffsetArr.length * 9 * 9 * 9);
	var sumColorArr = new Float32Array(unitCellColorArr.length * 9 * 9 * 9);
	var sumSelectionArr = new Float32Array(unitCellSelectionArr.length * 9 * 9 * 9);
	var sumIndexArr = new Float32Array(unitCellIndexArr.length * 9 * 9 * 9);

	var numInstancePerUnitCell = unitCellScaleArr.length;

	var dim1Step = { 'x': systemDimension.x * latticeVectors.u11,
		'y': systemDimension.x * latticeVectors.u12,
		'z': systemDimension.x * latticeVectors.u13 };
	var dim2Step = { 'x': systemDimension.y * latticeVectors.u21,
		'y': systemDimension.y * latticeVectors.u22,
		'z': systemDimension.y * latticeVectors.u23 };
	var dim3Step = { 'x': systemDimension.z * latticeVectors.u31,
		'y': systemDimension.z * latticeVectors.u32,
		'z': systemDimension.z * latticeVectors.u33 };

	var x_start = -1 * ((options.xPBC - 1) / 2);
	var x_end = (options.xPBC - 1) / 2 + 1;
	var y_start = -1 * ((options.yPBC - 1) / 2);
	var y_end = (options.yPBC - 1) / 2 + 1;
	var z_start = -1 * ((options.zPBC - 1) / 2);
	var z_end = (options.zPBC - 1) / 2 + 1;

	var currentCellIndex = 0;
	var xStep, yStep, zStep, currentStartingArrIndex;
	for (var i = x_start; i < x_end; i++) {
		for (var j = y_start; j < y_end; j++) {
			for (var k = z_start; k < z_end; k++) {
				//each unit cell
				currentStartingArrIndex = numInstancePerUnitCell * currentCellIndex;
				sumScaleArr.set(unitCellScaleArr, currentStartingArrIndex);
				sumSelectionArr.set(unitCellSelectionArr, currentStartingArrIndex);
				sumIndexArr.set(unitCellIndexArr, currentStartingArrIndex);
				sumColorArr.set(unitCellColorArr, currentStartingArrIndex * 3);

				xStep = i * dim1Step.x + j * dim2Step.x + k * dim3Step.x;
				yStep = i * dim1Step.y + j * dim2Step.y + k * dim3Step.y;
				zStep = i * dim1Step.z + j * dim2Step.z + k * dim3Step.z;
				for (var ii = 0; ii < numInstancePerUnitCell; ii++) {
					sumOffsetArr[(ii + currentStartingArrIndex) * 3 + 0] = unitCellOffsetArr[ii * 3 + 0] + xStep;
					sumOffsetArr[(ii + currentStartingArrIndex) * 3 + 1] = unitCellOffsetArr[ii * 3 + 1] + yStep;
					sumOffsetArr[(ii + currentStartingArrIndex) * 3 + 2] = unitCellOffsetArr[ii * 3 + 2] + zStep;
				}

				currentCellIndex++;
			}
		}
	}
	var totalNumInstances = currentCellIndex * numInstancePerUnitCell;

	geometry.setAttribute('instanceOffset', new THREE.InstancedBufferAttribute(sumOffsetArr, 3));
	geometry.setAttribute('instanceScale', new THREE.InstancedBufferAttribute(sumScaleArr, 1));
	geometry.setAttribute('instanceColor', new THREE.InstancedBufferAttribute(sumColorArr, 3));
	geometry.setAttribute('selection', new THREE.InstancedBufferAttribute(sumSelectionArr, 1));
	geometry.setAttribute('atomIndex', new THREE.InstancedBufferAttribute(sumIndexArr, 1));
	geometry.maxInstancedCount = totalNumInstances;

	geometry.attributes.instanceOffset.needsUpdate = true;
	geometry.attributes.instanceScale.needsUpdate = true;
	geometry.attributes.instanceColor.needsUpdate = true;
	geometry.attributes.selection.needsUpdate = true;
	geometry.attributes.atomIndex.needsUpdate = true;
	// console.log('num instances',geometry.maxInstancedCount );
}

function updateOffsetArray(systemDimension, latticeVectors, geometry, options) {
	var sumDisplacement = geometry.attributes.offset.array;

	var x_start = -1 * ((options.xPBC - 1) / 2);
	var x_end = (options.xPBC - 1) / 2 + 1;
	var y_start = -1 * ((options.yPBC - 1) / 2);
	var y_end = (options.yPBC - 1) / 2 + 1;
	var z_start = -1 * ((options.zPBC - 1) / 2);
	var z_end = (options.zPBC - 1) / 2 + 1;

	var dim1Step = { 'x': systemDimension.x * latticeVectors.u11,
		'y': systemDimension.x * latticeVectors.u12,
		'z': systemDimension.x * latticeVectors.u13 };
	var dim2Step = { 'x': systemDimension.y * latticeVectors.u21,
		'y': systemDimension.y * latticeVectors.u22,
		'z': systemDimension.y * latticeVectors.u23 };
	var dim3Step = { 'x': systemDimension.z * latticeVectors.u31,
		'y': systemDimension.z * latticeVectors.u32,
		'z': systemDimension.z * latticeVectors.u33 };

	var xStep, yStep, zStep;

	var counter = 0;
	for (var i = x_start; i < x_end; i++) {
		for (var j = y_start; j < y_end; j++) {
			for (var k = z_start; k < z_end; k++) {
				xStep = i * dim1Step.x + j * dim2Step.x + k * dim3Step.x;
				yStep = i * dim1Step.y + j * dim2Step.y + k * dim3Step.y;
				zStep = i * dim1Step.z + j * dim2Step.z + k * dim3Step.z;

				sumDisplacement[counter * 3 + 0] = xStep;
				sumDisplacement[counter * 3 + 1] = yStep;
				sumDisplacement[counter * 3 + 2] = zStep;
				counter++;
			}
		}
	}
	geometry.attributes.offset.needsUpdate = true;
	geometry.maxInstancedCount = counter;
}

function changeGeometry(options) {
	scene.remove(System);
	System = getGeometry(options);
	scene.add(System);
}

function getGeometry(options) {
	var temp;
	if (options.view == 'pointCloud') {
		temp = getPointCloudGeometry(options);
	} else if (options.view == 'box') {
		temp = getBoxGeometry(options);
	} else if (options.view == 'pointMatrix') {
		temp = getPointMatrixGeometry(options);
	} else {
		temp = getPointCloudGeometry(options);
	}

	return temp;
}

function updateGeometry(options) {
	if (options.view == 'pointCloud') {
		updatePointCloudGeometry(options);
	} else if (options.view == 'box') {
		changeGeometry(options);
	} else if (options.view == 'pointMatrix') {
		updatePointMatrixGeometry(options);
	} else {
		updatePointCloudGeometry(options);
	}
}

function updateOptionFilenames() {
	options.dataFilename = "data/" + options.moleculeName + "_B3LYP_0_0_0_all_descriptors.csv";
	console.log(options.densityFilename, options.targetFilename);
}

},{}],19:[function(require,module,exports){
"use strict";

exports.__esModule = true;
exports.initialize3DViewSetup = initialize3DViewSetup;
exports.toggleSync = toggleSync;
exports.syncOptions = syncOptions;

var _MultiviewControlCalculateViewportSizesJs = require("../MultiviewControl/calculateViewportSizes.js");

var _MultiviewControlColorLegendJs = require("../MultiviewControl/colorLegend.js");

var _systemEdgeJs = require("./systemEdge.js");

var _UtilitiesSaveDataJs = require("../Utilities/saveData.js");

var _D3D_connection_heatmapJs = require("../2D3D_connection_heatmap.js");

var _PointCloud_selectionJs = require("./PointCloud_selection.js");

var _MoleculeViewJs = require("./MoleculeView.js");

function initialize3DViewSetup(viewSetup, views, plotSetup) {

	var systemDimension = viewSetup.systemDimension;

	if (viewSetup.systemLatticeVectors == null || viewSetup.systemLatticeVectors == undefined) {
		viewSetup.systemLatticeVectors = { "u11": 1,
			"u12": 0,
			"u13": 0,
			"u21": 0,
			"u22": 1,
			"u23": 0,
			"u31": 0,
			"u32": 0,
			"u33": 1
		};
	}
	var systemLatticeVectors = viewSetup.systemLatticeVectors;

	if (viewSetup.spatiallyResolvedData != null) {
		if (viewSetup.spatiallyResolvedData.gridSpacing == null && viewSetup.spatiallyResolvedData.numGridPoints == null) {
			alert("Error!! please specify grid spacing and/or number of grid points for all systems");
		} else if (viewSetup.spatiallyResolvedData.gridSpacing == null) {
			var numGridPoints = viewSetup.spatiallyResolvedData.numGridPoints;
			var gridSpacing = { "x": systemDimension.x / numGridPoints.x,
				"y": systemDimension.y / numGridPoints.y,
				"z": systemDimension.z / numGridPoints.z };
			viewSetup.spatiallyResolvedData.gridSpacing = gridSpacing;
		} else if (viewSetup.spatiallyResolvedData.numGridPoints == null) {
			var gridSpacing = viewSetup.spatiallyResolvedData.gridSpacing;
			var numGridPoints = { "x": systemDimension.x / gridSpacing.x,
				"y": systemDimension.y / gridSpacing.y,
				"z": systemDimension.z / gridSpacing.z };
			viewSetup.spatiallyResolvedData.numGridPoints = numGridPoints;
		}
	}

	var roughSystemSize = Math.sqrt(systemDimension.x * systemDimension.x + systemDimension.y * systemDimension.y + systemDimension.z * systemDimension.z);
	var xPlotMin = systemDimension.x * -6;
	var yPlotMin = systemDimension.y * -6;
	var zPlotMin = systemDimension.z * -6;
	var xPlotMax = systemDimension.x * 6;
	var yPlotMax = systemDimension.y * 6;
	var zPlotMax = systemDimension.z * 6;

	var defaultSetting = {
		//left: 0,
		//top: 0,
		//width: 0.6,
		//height: 0.5,
		background: new THREE.Color(0, 0, 0),
		backgroundAlpha: 1.0,
		controllerEnabledBackground: new THREE.Color(0.1, 0.1, 0.1),
		// eye: [ 0, 0, 120 ],
		eye: [0, 0, roughSystemSize],
		up: [0, 1, 0],
		//fov: 100,
		mousePosition: [0, 0],
		systemSpatiallyResolvedDataBoolean: false,
		systemMoleculeDataBoolean: false,
		controllerEnabled: false,
		controllerZoom: true,
		controllerRotate: true,
		controllerPan: true,
		systemLatticeVectors: systemLatticeVectors,
		systemDimension: systemDimension,
		xPlotMin: xPlotMin,
		xPlotMax: xPlotMax,
		yPlotMin: yPlotMin,
		yPlotMax: yPlotMax,
		zPlotMin: zPlotMin,
		zPlotMax: zPlotMax,

		options: new function () {
			this.plotID = "";
			this.sync3DView = false;
			this.toggleSync = function () {
				toggleSync(viewSetup, views);
			};
			this.syncOptions = function () {
				syncOptions(viewSetup, views);
			};
			this.cameraFov = 50;
			this.backgroundColor = "#000000";
			this.backgroundAlpha = 0.0;
			this.showPointCloud = true;
			this.showMolecule = true;
			this.atomSize = 0.5;
			this.bondSize = 0.05;
			this.moleculeTransparency = 1.0;
			this.maxBondLength = 1.5;
			this.minBondLength = 0.3;
			this.pointCloudTotalMagnitude = 2;
			this.pointCloudParticles = 10;
			this.pointCloudMaxPointPerBlock = 60;
			this.pointCloudColorSettingMax = 1.2;
			this.pointCloudColorSettingMin = 0.0;
			this.pointCloudAlpha = 1;
			this.pointCloudSize = 0.1;
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
				_D3D_connection_heatmapJs.render(views, plotSetup);
			};
			this.systemEdgeBoolean = true;
			this.autoRotateSystem = false;
			this.autoRotateSpeed = 2.0;
			this.toggleSystemEdge = function () {
				if (viewSetup.options.systemEdgeBoolean) {
					_systemEdgeJs.addSystemEdge(viewSetup);
				} else {
					_systemEdgeJs.removeSystemEdge(viewSetup);
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
			this.atomModelSegments = 18;
			this.bondModelSegments = 8;
			this.showAtoms = true;
			this.showBonds = false;
			this.atomsStyle = "ball";
			this.bondsStyle = "tube";

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

			this.interactiveSpatiallyResolved = false;
			this.interactiveMolecule = false;

			this.cameraLightPositionX = 0;
			this.cameraLightPositionY = 0;
			this.cameraLightPositionZ = 0;

			this.render = function () {
				_D3D_connection_heatmapJs.render(views, plotSetup);
			};
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

function toggleSync(currentView, views) {
	for (var ii = 0; ii < views.length; ++ii) {
		var view = views[ii];
		view.options.sync3DView = currentView.options.sync3DView;
		view.gui.updateDisplay();
	}
}

function syncOptions(currentView, views) {
	var syncPropertyList = ['cameraFov', 'backgroundColor', 'backgroundAlpha', 'showPointCloud', 'showMolecule', 'atomSize', 'bondSize', 'moleculeTransparency', 'maxBondLength', 'minBondLength', 'xPBC', 'yPBC', 'zPBC', 'pointCloudTotalMagnitude', 'pointCloudParticles', 'pointCloudMaxPointPerBlock', 'pointCloudColorSettingMax', 'pointCloudColorSettingMin', 'pointCloudAlpha', 'pointCloudSize', 'propertyOfInterest', 'colorMap', 'systemEdgeBoolean', 'legendX', 'legendY', 'legendWidth', 'legendHeight', 'legendTick', 'legendFontsize', 'legendShownBoolean', 'moleculeColorCodeBasis', 'moleculeColorMap', 'moleculeColorSettingMax', 'moleculeColorSettingMin', 'moleculeSizeCodeBasis', 'moleculeSizeSettingMax', 'moleculeSizeSettingMin', 'moleculeAlpha', 'atomModelSegments', 'bondModelSegments', 'showAtoms', 'showBonds', 'atomsStyle', 'bondsStyle', 'legendXMolecule', 'legendYMolecule', 'legendWidthMolecule', 'legendHeightMolecule', 'legendTickMolecule', 'legendFontsizeMolecule', 'legendShownBooleanMolecule', 'cameraLightPositionX', 'cameraLightPositionY', 'cameraLightPositionZ'];

	var currentOption = currentView.options;
	var currentPlotID = currentOption.PlotID;
	for (var ii = 0; ii < views.length; ++ii) {
		var view = views[ii];
		var options = view.options;
		var plotID = options.plotID;

		if (plotID !== currentPlotID && options.sync3DView) {
			for (var i = 0; i < syncPropertyList.length; i++) {
				var property = syncPropertyList[i];
				options[property] = currentOption[property];
			}
			_PointCloud_selectionJs.changePointCloudGeometry(view);
			_PointCloud_selectionJs.changePointCloudGeometry(view);
			options.toggleSystemEdge.call();
			// options.toggleLegend.call();
			// options.toggleLegendMolecule.call();
			view.gui.updateDisplay();
		}
	}
	currentOption.render.call();
}

},{"../2D3D_connection_heatmap.js":1,"../MultiviewControl/calculateViewportSizes.js":26,"../MultiviewControl/colorLegend.js":27,"../Utilities/saveData.js":37,"./MoleculeView.js":16,"./PointCloud_selection.js":17,"./systemEdge.js":22}],20:[function(require,module,exports){
'use strict';

exports.__esModule = true;
exports.hover3DViewSpatiallyResolved = hover3DViewSpatiallyResolved;
exports.click3DViewSpatiallyResolved = click3DViewSpatiallyResolved;
exports.gpuPickMolecule = gpuPickMolecule;
exports.hover3DViewMoleculeBall = hover3DViewMoleculeBall;
exports.hover3DViewMoleculeSprite = hover3DViewMoleculeSprite;
exports.click3DViewMolecule = click3DViewMolecule;

var _DHeatmapsSelectionJs = require("../2DHeatmaps/selection.js");

function getCorrespondingHeatmapPointIndexSpatiallyResolved(view, voxelIndex, twoDPlot) {
    var options = view.options;
    var currentFrame = options.currentFrame.toString();
    var spatiallyResolvedData = view.systemSpatiallyResolvedDataFramed[currentFrame];

    var xScale = twoDPlot.xScale,
        yScale = twoDPlot.yScale;
    var xValue = twoDPlot.xValue,
        yValue = twoDPlot.yValue;
    var highlightDataPoint = spatiallyResolvedData[voxelIndex];

    var xMap = function xMap(d) {
        return xScale(xValue(d));
    };
    var yMap = function yMap(d) {
        return yScale(yValue(d));
    };

    var heatmapX = xMap(highlightDataPoint);
    var heatmapY = yMap(highlightDataPoint);

    var heatmapPointIndex = twoDPlot.XYtoHeatmapMap[heatmapX][heatmapY];
    return heatmapPointIndex;
}

function hover3DViewSpatiallyResolved(view, plotSetup, mouseEvent) {
    var options = view.options;
    var currentFrame = options.currentFrame.toString();
    var spatiallyResolvedData = view.systemSpatiallyResolvedDataFramed[currentFrame];

    var mouse = new THREE.Vector2();
    mouse.set((mouseEvent.clientX - view.windowLeft) / view.windowWidth * 2 - 1, -((mouseEvent.clientY - view.windowTop) / view.windowHeight) * 2 + 1);

    view.raycaster.params.Points.threshold = view.options.pointCloudSize / 4;
    view.raycaster.setFromCamera(mouse.clone(), view.camera);
    var intersects = view.raycaster.intersectObject(view.System);
    var pointVoxelMap = view.System.userData.pointVoxelMap;
    if (intersects.length > 0) {
        // console.log('has intersection', view.INTERSECTED,intersects[ 0 ].index )
        // if there is intersection
        if (view.INTERSECTED != intersects[0].index) {
            // console.log('changed intersection, deal with previously hovered points')
            // changed intersection, deal with previously hovered points
            if (view.INTERSECTED != null) {
                var indexIn3DView = pointVoxelMap[view.INTERSECTED];
                // console.log('if there is previous intersection', indexIn3DView)
                // if there is previous intersection

                if (plotSetup.active2DPlotSpatiallyResolved && plotSetup.active2DPlotSpatiallyResolved.options.plotData == 'spatiallyResolvedData' && plotSetup.active2DPlotSpatiallyResolved.heatmapPlot) {
                    // console.log('if there is active 2D plot, get the corresponding heatmap point on the 2D plot, and handle it there')
                    // if there is active 2D plot, get the corresponding heatmap point on the 2D plot, and handle it there
                    var twoDPlot = plotSetup.active2DPlotSpatiallyResolved;
                    var heatmapPointIndex = getCorrespondingHeatmapPointIndexSpatiallyResolved(view, indexIn3DView, twoDPlot);
                    _DHeatmapsSelectionJs.unhighlightVia2DHeatmap(heatmapPointIndex, twoDPlot);
                } else {
                    // console.log('no active 2Dplot, return to previous 3D view state')
                    // no active 2Dplot, return to previous 3D view state
                    spatiallyResolvedData[indexIn3DView].highlighted = view.intersectState;
                    view.intersectState = null;
                }
            } else {
                // console.log('no previous intersection, do nothing here')
                // no previous intersection, do nothing here
            }

            view.INTERSECTED = intersects[0].index;
            var indexIn3DView = pointVoxelMap[view.INTERSECTED];
            // console.log('deal with currently intersected points', indexIn3DView)
            // deal with currently intersected points

            if (plotSetup.active2DPlotSpatiallyResolved && plotSetup.active2DPlotSpatiallyResolved.options.plotData == 'spatiallyResolvedData' && plotSetup.active2DPlotSpatiallyResolved.heatmapPlot) {
                // console.log('if there is active 2D plot, get the corresponding heatmap point on the 2D plot, and handle it there')
                // if there is active 2D plot, get the corresponding heatmap point on the 2D plot, and handle it there
                var twoDPlot = plotSetup.active2DPlotSpatiallyResolved;
                heatmapPointIndex = getCorrespondingHeatmapPointIndexSpatiallyResolved(view, indexIn3DView, twoDPlot);
                _DHeatmapsSelectionJs.highlightVia2DHeatmap(heatmapPointIndex, twoDPlot);
            } else {
                // console.log('if there is no active 2D plot, store current state, and highlight the voxel')
                // if there is no active 2D plot, store current state, and highlight the voxel
                view.intersectState = spatiallyResolvedData[indexIn3DView].highlighted;
                spatiallyResolvedData[indexIn3DView].highlighted = true;
            }
            return true;
        } else {
            // console.log('same intersection, do nothing')
            //same intersection, do nothing
            return false;
        }
    } else {
        // console.log('no current intersection ', view.INTERSECTED)
        // no current intersection
        if (view.INTERSECTED != null) {
            var indexIn3DView = pointVoxelMap[view.INTERSECTED];
            //console.log('if there is previous intersection ', indexIn3DView)
            // if there is previous intersection

            if (plotSetup.active2DPlotSpatiallyResolved && plotSetup.active2DPlotSpatiallyResolved.options.plotData == 'spatiallyResolvedData' && plotSetup.active2DPlotSpatiallyResolved.heatmapPlot) {
                // console.log('if there is active 2D plot, get the corresponding heatmap point on the 2D plot, and handle it there')
                // if there is active 2D plot, get the corresponding heatmap point on the 2D plot, and handle it there
                var twoDPlot = plotSetup.active2DPlotSpatiallyResolved;
                var heatmapPointIndex = getCorrespondingHeatmapPointIndexSpatiallyResolved(view, indexIn3DView, twoDPlot);
                _DHeatmapsSelectionJs.unhighlightVia2DHeatmap(heatmapPointIndex, twoDPlot);
            } else {
                // console.log('no active 2Dplot, return to previous 3D view state')
                // no active 2Dplot, return to previous 3D view state
                spatiallyResolvedData[indexIn3DView].highlighted = view.intersectState;
                view.intersectState = null;
            }
            view.INTERSECTED = null;
            return true;
        } else {
            // console.log('no previous intersection, do nothing')
            // no previous intersection, do nothing
            view.INTERSECTED = null;
            return false;
        }
    }
}

function click3DViewSpatiallyResolved(view, views, plotSetup) {
    var options = view.options;
    var currentFrame = options.currentFrame.toString();
    var spatiallyResolvedData = view.systemSpatiallyResolvedDataFramed[currentFrame];
    var pointVoxelMap = view.System.userData.pointVoxelMap;
    if (view.INTERSECTED != null) {
        //currently point under mouse
        var indexIn3DView = pointVoxelMap[view.INTERSECTED];
        if (plotSetup.active2DPlotSpatiallyResolved && plotSetup.active2DPlotSpatiallyResolved.options.plotData == 'spatiallyResolvedData' && plotSetup.active2DPlotSpatiallyResolved.heatmapPlot) {
            // has active 2D plot, handle it there
            var twoDPlot = plotSetup.active2DPlotSpatiallyResolved;
            var heatmapPointIndex = getCorrespondingHeatmapPointIndexSpatiallyResolved(view, indexIn3DView, twoDPlot);
            _DHeatmapsSelectionJs.clickUpdateVia2DHeatmap(heatmapPointIndex, twoDPlot, views);
            return true;
        } else {
            // no active 2D plot
            // var highlightDataPoint = spatiallyResolvedData[indexIn3DView];
            // highlightDataPoint.highlighted = true;
            if (view.intersectState == true) {
                // if previously highlighted
                view.intersectState = false;
            } else {
                // if previously not highlighted
                view.intersectState = true;
            }
            // view.intersectState = spatiallyResolvedData[indexIn3DView].highlighted;
            _DHeatmapsSelectionJs.clickUpdateAll2DHeatmaps(views);
            return true;
        }
    } else {
        // no point intersected, unhighlight all
        _DHeatmapsSelectionJs.unhighlightAll(views);
        return true;
    }
}

//Molecule

function gpuPickMolecule(view, renderer, scene, mouseEvent, windowWidth, windowHeight) {
    var camera = view.camera;
    var pickingTexture = new THREE.WebGLRenderTarget(1, 1, { type: THREE.FloatType });
    var pixelBuffer = new Float32Array(4);

    var width = Math.floor(windowWidth * view.width);
    var height = Math.floor(windowHeight * view.height);
    var left = Math.floor(windowWidth * view.left);
    var top = Math.floor(windowHeight * view.top);

    // camera.setViewOffset(renderer.domElement.width, renderer.domElement.height,
    //     mouseEvent.clientX * window.devicePixelRatio | 0,  mouseEvent.clientY * window.devicePixelRatio | 0, 1, 1 );
    camera.setViewOffset(width, height, mouseEvent.clientX * window.devicePixelRatio | 0, mouseEvent.clientY * window.devicePixelRatio | 0, 1, 1);
    camera.updateProjectionMatrix();
    renderer.setRenderTarget(pickingTexture);

    renderer.setViewport(left, top, width, height);
    renderer.setScissor(left, top, width, height);

    renderer.setScissorTest(true);
    camera.aspect = width / height;
    camera.updateProjectionMatrix();

    renderer.render(scene, camera);

    renderer.readRenderTargetPixels(pickingTexture, 0, 0, 1, 1, pixelBuffer);
    var pickingResult = parsePixelBuffer(pixelBuffer);
    // console.log(pickingResult);

    camera.clearViewOffset();
    camera.updateProjectionMatrix();
    renderer.setRenderTarget(null);
    return pickingResult;
}

function parsePixelBuffer(pixelBuffer) {

    var encodedClass = null;
    var encodedID = null;
    var encodedID1 = null;
    var encodedID2 = null;
    var encodedID3 = null;
    // console.log(pixelBuffer);

    var rChannelInfo = Math.round(pixelBuffer[0] * 1e8);
    var gChannelInfo = Math.round(pixelBuffer[1] * 1e8);
    var bChannelInfo = Math.round(pixelBuffer[2] * 1e8);

    if (Math.abs(rChannelInfo % 100 - 50) <= 8 && Math.abs(gChannelInfo % 100 - 50) <= 8 && Math.abs(bChannelInfo % 100 - 50) <= 8) {
        encodedClass = Math.floor(rChannelInfo % 1000000 * 0.00001);
        encodedID1 = Math.floor(rChannelInfo % 100000 * 0.01);
        encodedID2 = Math.floor(gChannelInfo % 1000000 * 0.01);
        encodedID3 = Math.floor(bChannelInfo % 1000000 * 0.01);
        encodedID = Math.floor(encodedID1 * 100000000 + encodedID2 * 10000 + encodedID3);
    }
    return { encodedClass: encodedClass, encodedID: encodedID };
}

function getCorrespondingHeatmapPointIndexMolecule(view, voxelIndex, twoDPlot) {
    var options = view.options;
    var currentFrame = options.currentFrame.toString();
    var moleculeData = view.systemMoleculeDataFramed[currentFrame];

    var xScale = twoDPlot.xScale,
        yScale = twoDPlot.yScale;
    var xValue = twoDPlot.xValue,
        yValue = twoDPlot.yValue;
    var highlightDataPoint = moleculeData[voxelIndex];

    var xMap = function xMap(d) {
        return xScale(xValue(d));
    };
    var yMap = function yMap(d) {
        return yScale(yValue(d));
    };

    var heatmapX = xMap(highlightDataPoint);
    var heatmapY = yMap(highlightDataPoint);

    var heatmapPointIndex = twoDPlot.XYtoHeatmapMap[heatmapX][heatmapY];
    return heatmapPointIndex;
}

function hover3DViewMoleculeBall(view, plotSetup, pickingResult) {
    var options = view.options;
    var currentFrame = options.currentFrame.toString();
    var moleculeData = view.systemMoleculeDataFramed[currentFrame];
    var intersectClass = pickingResult.encodedClass;

    if (intersectClass && intersectClass == 1) {
        var intersectIndex = pickingResult.encodedID;
        // console.log('has intersection', view.INTERSECTED,intersects[ 0 ].index )
        // if there is intersection
        if (view.INTERSECTED != intersectIndex) {
            // console.log('changed intersection, deal with previously hovered points')
            // changed intersection, deal with previously hovered points
            if (view.INTERSECTED != null) {
                // var indexIn3DView = pointVoxelMap[view.INTERSECTED]
                var indexIn3DView = view.INTERSECTED;
                // console.log('if there is previous intersection', indexIn3DView)
                // if there is previous intersection

                if (plotSetup.active2DPlotMolecule && plotSetup.active2DPlotMolecule.options.plotData == 'moleculeData' && plotSetup.active2DPlotMolecule.heatmapPlot) {
                    // console.log('if there is active 2D plot, get the corresponding heatmap point on the 2D plot, and handle it there')
                    // if there is active 2D plot, get the corresponding heatmap point on the 2D plot, and handle it there
                    var twoDPlot = plotSetup.active2DPlotMolecule;
                    var heatmapPointIndex = getCorrespondingHeatmapPointIndexMolecule(view, indexIn3DView, twoDPlot);
                    _DHeatmapsSelectionJs.unhighlightVia2DHeatmap(heatmapPointIndex, twoDPlot);
                } else {
                    // console.log('changing atom, no active 2Dplot, return to previous 3D view state (current, to set)', moleculeData[indexIn3DView].highlighted, view.intersectState)
                    // no active 2Dplot, return to previous 3D view state
                    moleculeData[indexIn3DView].highlighted = view.intersectState;
                    view.intersectState = null;
                }
            } else {}
            // console.log('no previous intersection, do nothing here')
            // no previous intersection, do nothing here

            // console.log('updating intersect index', view.INTERSECTED)

            view.INTERSECTED = intersectIndex;

            var indexIn3DView = intersectIndex;
            // console.log('deal with currently intersected points', indexIn3DView)
            // deal with currently intersected points

            if (plotSetup.active2DPlotMolecule && plotSetup.active2DPlotMolecule.options.plotData == 'moleculeData' && plotSetup.active2DPlotMolecule.heatmapPlot) {
                // console.log('if there is active 2D plot, get the corresponding heatmap point on the 2D plot, and handle it there')
                // if there is active 2D plot, get the corresponding heatmap point on the 2D plot, and handle it there
                var twoDPlot = plotSetup.active2DPlotMolecule;
                heatmapPointIndex = getCorrespondingHeatmapPointIndexMolecule(view, indexIn3DView, twoDPlot);
                _DHeatmapsSelectionJs.highlightVia2DHeatmap(heatmapPointIndex, twoDPlot);
            } else {
                // console.log('if there is no active 2D plot, store current state, and highlight the atom', moleculeData[indexIn3DView].highlighted)
                // if there is no active 2D plot, store current state, and highlight the voxel
                view.intersectState = moleculeData[indexIn3DView].highlighted;
                moleculeData[indexIn3DView].highlighted = true;
            }
            return true;
        } else {
            // console.log('same intersection, do nothing')
            //same intersection, do nothing
            return false;
        }
    } else {
        // console.log('no current intersection ', view.INTERSECTED)
        // no current intersection
        if (view.INTERSECTED != null) {
            // var indexIn3DView = pointVoxelMap[view.INTERSECTED]

            var indexIn3DView = view.INTERSECTED;
            //console.log('if there is previous intersection ', indexIn3DView)
            // if there is previous intersection

            if (plotSetup.active2DPlotMolecule && plotSetup.active2DPlotMolecule.options.plotData == 'moleculeData' && plotSetup.active2DPlotMolecule.heatmapPlot) {
                // console.log('if there is active 2D plot, get the corresponding heatmap point on the 2D plot, and handle it there')
                // if there is active 2D plot, get the corresponding heatmap point on the 2D plot, and handle it there
                var twoDPlot = plotSetup.active2DPlotMolecule;
                var heatmapPointIndex = getCorrespondingHeatmapPointIndexMolecule(view, indexIn3DView, twoDPlot);
                _DHeatmapsSelectionJs.unhighlightVia2DHeatmap(heatmapPointIndex, twoDPlot);
            } else {
                // console.log('no active 2Dplot, return to previous 3D view state')
                // no active 2Dplot, return to previous 3D view state
                // console.log('no active 2Dplot, return to previous 3D view state', moleculeData[indexIn3DView].highlighted, view.intersectState)
                moleculeData[indexIn3DView].highlighted = view.intersectState;
                view.intersectState = null;
            }
            view.INTERSECTED = null;
            return true;
        } else {
            // console.log('no previous intersection, do nothing')
            // no previous intersection, do nothing
            view.INTERSECTED = null;
            return false;
        }
    }
}

function hover3DViewMoleculeSprite(view, plotSetup, mouseEvent) {
    var options = view.options;
    var currentFrame = options.currentFrame.toString();
    var moleculeData = view.systemMoleculeDataFramed[currentFrame];

    var mouse = new THREE.Vector2();
    mouse.set((mouseEvent.clientX - view.windowLeft) / view.windowWidth * 2 - 1, -((mouseEvent.clientY - view.windowTop) / view.windowHeight) * 2 + 1);

    view.raycaster.params.Points.threshold = view.options.pointCloudSize * 3.5;
    view.raycaster.setFromCamera(mouse.clone(), view.camera);
    //var intersects = view.raycaster.intersectObject( view.System );
    var intersects = view.raycaster.intersectObject(view.molecule.atoms);
    // var pointVoxelMap = view.System.userData.pointVoxelMap ;
    if (intersects.length > 0) {
        /*if (view.options.atomsStyle == "ball") {
            var intersectIndex = Math.floor(intersects[0].face.a / view.molecule.atoms.userData.numVerticesPerAtom);
        }
        else {
            var intersectIndex = intersects[ 0 ].index;
        }*/
        var intersectIndex = intersects[0].index;
        // console.log('has intersection', view.INTERSECTED,intersects[ 0 ].index )
        // if there is intersection
        if (view.INTERSECTED != intersectIndex) {
            // console.log('changed intersection, deal with previously hovered points')
            // changed intersection, deal with previously hovered points
            if (view.INTERSECTED != null) {
                // var indexIn3DView = pointVoxelMap[view.INTERSECTED]
                var indexIn3DView = view.INTERSECTED;
                // console.log('if there is previous intersection', indexIn3DView)
                // if there is previous intersection

                if (plotSetup.active2DPlotMolecule && plotSetup.active2DPlotMolecule.options.plotData == 'moleculeData' && plotSetup.active2DPlotMolecule.heatmapPlot) {
                    // console.log('if there is active 2D plot, get the corresponding heatmap point on the 2D plot, and handle it there')
                    // if there is active 2D plot, get the corresponding heatmap point on the 2D plot, and handle it there
                    var twoDPlot = plotSetup.active2DPlotMolecule;
                    var heatmapPointIndex = getCorrespondingHeatmapPointIndexMolecule(view, indexIn3DView, twoDPlot);
                    _DHeatmapsSelectionJs.unhighlightVia2DHeatmap(heatmapPointIndex, twoDPlot);
                } else {
                    // console.log('no active 2Dplot, return to previous 3D view state')
                    // no active 2Dplot, return to previous 3D view state
                    moleculeData[indexIn3DView].highlighted = view.intersectState;
                    view.intersectState = null;
                }
            } else {
                // console.log('no previous intersection, do nothing here')
                // no previous intersection, do nothing here
            }

            view.INTERSECTED = intersectIndex;
            // var indexIn3DView = pointVoxelMap[view.INTERSECTED]
            var indexIn3DView = intersectIndex;
            // console.log('deal with currently intersected points', indexIn3DView)
            // deal with currently intersected points

            if (plotSetup.active2DPlotMolecule && plotSetup.active2DPlotMolecule.options.plotData == 'moleculeData' && plotSetup.active2DPlotMolecule.heatmapPlot) {
                // console.log('if there is active 2D plot, get the corresponding heatmap point on the 2D plot, and handle it there')
                // if there is active 2D plot, get the corresponding heatmap point on the 2D plot, and handle it there
                var twoDPlot = plotSetup.active2DPlotMolecule;
                heatmapPointIndex = getCorrespondingHeatmapPointIndexMolecule(view, indexIn3DView, twoDPlot);
                _DHeatmapsSelectionJs.highlightVia2DHeatmap(heatmapPointIndex, twoDPlot);
            } else {
                // console.log('if there is no active 2D plot, store current state, and highlight the voxel')
                // if there is no active 2D plot, store current state, and highlight the voxel
                view.intersectState = moleculeData[indexIn3DView].highlighted;
                moleculeData[indexIn3DView].highlighted = true;
            }
            return true;
        } else {
            // console.log('same intersection, do nothing')
            //same intersection, do nothing
            return false;
        }
    } else {
        // console.log('no current intersection ', view.INTERSECTED)
        // no current intersection
        if (view.INTERSECTED != null) {
            // var indexIn3DView = pointVoxelMap[view.INTERSECTED]

            var indexIn3DView = view.INTERSECTED;
            //console.log('if there is previous intersection ', indexIn3DView)
            // if there is previous intersection

            if (plotSetup.active2DPlotMolecule && plotSetup.active2DPlotMolecule.options.plotData == 'moleculeData' && plotSetup.active2DPlotMolecule.heatmapPlot) {
                // console.log('if there is active 2D plot, get the corresponding heatmap point on the 2D plot, and handle it there')
                // if there is active 2D plot, get the corresponding heatmap point on the 2D plot, and handle it there
                var twoDPlot = plotSetup.active2DPlotMolecule;
                var heatmapPointIndex = getCorrespondingHeatmapPointIndexMolecule(view, indexIn3DView, twoDPlot);
                _DHeatmapsSelectionJs.unhighlightVia2DHeatmap(heatmapPointIndex, twoDPlot);
            } else {
                // console.log('no active 2Dplot, return to previous 3D view state')
                // no active 2Dplot, return to previous 3D view state
                moleculeData[indexIn3DView].highlighted = view.intersectState;
                view.intersectState = null;
            }
            view.INTERSECTED = null;
            return true;
        } else {
            // console.log('no previous intersection, do nothing')
            // no previous intersection, do nothing
            view.INTERSECTED = null;
            return false;
        }
    }
}

function click3DViewMolecule(view, views, plotSetup) {
    var options = view.options;
    var currentFrame = options.currentFrame.toString();
    var moleculeData = view.systemMoleculeDataFramed[currentFrame];
    // var pointVoxelMap = view.System.userData.pointVoxelMap ;
    if (view.INTERSECTED != null) {
        //currently point under mouse
        // var indexIn3DView = pointVoxelMap[view.INTERSECTED]
        var indexIn3DView = view.INTERSECTED;
        if (plotSetup.active2DPlotMolecule && plotSetup.active2DPlotMolecule.options.plotData == 'moleculeData' && plotSetup.active2DPlotMolecule.heatmapPlot) {
            // has active 2D plot, handle it there
            var twoDPlot = plotSetup.active2DPlotMolecule;
            var heatmapPointIndex = getCorrespondingHeatmapPointIndexMolecule(view, indexIn3DView, twoDPlot);
            _DHeatmapsSelectionJs.clickUpdateVia2DHeatmap(heatmapPointIndex, twoDPlot, views);
            return true;
        } else {
            // no active 2D plot
            // var highlightDataPoint = spatiallyResolvedData[indexIn3DView];
            // highlightDataPoint.highlighted = true;
            if (view.intersectState == true) {
                // if previously highlighted
                view.intersectState = false;
            } else {
                // if previously not highlighted
                view.intersectState = true;
            }
            // view.intersectState = spatiallyResolvedData[indexIn3DView].highlighted;
            _DHeatmapsSelectionJs.clickUpdateAll2DHeatmaps(views);
            return true;
        }
    } else {
        // no point intersected, unhighlight all
        _DHeatmapsSelectionJs.unhighlightAll(views);
        return true;
    }
}

},{"../2DHeatmaps/selection.js":11}],21:[function(require,module,exports){
"use strict";

exports.__esModule = true;
exports.setupOptionBox3DView = setupOptionBox3DView;

var _PointCloud_selectionJs = require("./PointCloud_selection.js");

var _MoleculeViewJs = require("./MoleculeView.js");

var _MultiviewControlColorLegendJs = require("../MultiviewControl/colorLegend.js");

var _UtilitiesScaleJs = require("../Utilities/scale.js");

var _UtilitiesOtherJs = require("../Utilities/other.js");

var _MultiviewControlSetupViewBasicJs = require("../MultiviewControl/setupViewBasic.js");

var _UtilitiesColorMapJs = require("../Utilities/colorMap.js");

function setupOptionBox3DView(view, plotSetup) {

	var options = view.options;

	if (view.systemSpatiallyResolvedDataBoolean) {
		var propertyList = plotSetup["spatiallyResolvedPropertyList"];
		var propertyChoiceObject = _UtilitiesOtherJs.arrayToIdenticalObject(propertyList);
	}

	if (view.systemMoleculeDataBoolean) {
		var moleculeDataFeatureList = plotSetup["moleculePropertyList"];
		//if (moleculeDataFeatureList.includes('atom') == false){
		// console.log(moleculeDataFeatureList.indexOf("atom"))
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

	systemInfoFolder.add(options, 'sync3DView').name('Sync options').onChange(function (value) {
		options.toggleSync.call();
	});

	systemInfoFolder.add(options, 'showMolecule').name('Show Molecule').onChange(function (value) {
		if (value == true) {
			_MoleculeViewJs.getMoleculeGeometry(view);
		} else {
			_MoleculeViewJs.removeMoleculeGeometry(view);
		}
		if (options.sync3DView) {
			options.syncOptions.call();
		}
		options.render.call();
	});

	systemInfoFolder.add(options, 'showPointCloud').name('Show Point Cloud').onChange(function (value) {
		if (value == true) {
			_PointCloud_selectionJs.getPointCloudGeometry(view);
		} else {
			_PointCloud_selectionJs.removePointCloudGeometry(view);
		}
		if (options.sync3DView) {
			options.syncOptions.call();
		}
		options.render.call();
	});

	systemInfoFolder.open();

	viewFolder.add(options, 'resetCamera').name('Set Camera');
	viewFolder.add(options, 'toggleFullscreen').name('Fullscreen');
	viewFolder.add(options, 'systemEdgeBoolean').name('System Edge').onChange(function (value) {
		//updatePointCloudGeometry(view);
		options.toggleSystemEdge.call();
		gui.updateDisplay();
		options.render.call();
	});
	viewFolder.add(options, 'autoRotateSystem').name('Rotate System').onChange(function (value) {
		view.controller.autoRotate = value;
	});
	if (view.frameBool) {
		viewFolder.add(options, 'currentFrame', view.frameMin, view.frameMax).step(1).name('Current Frame').onChange(function (value) {
			if (options.showPointCloud && view.systemSpatiallyResolvedDataBoolean) {
				_PointCloud_selectionJs.updatePointCloudGeometry(view);
			}
			if (options.showMolecule && view.systemMoleculeDataBoolean) {
				_MoleculeViewJs.changeMoleculeGeometry(view);
			}
			options.render.call();
		});
	}

	viewFolder.open();

	var PBCFolder = viewFolder.addFolder('PBC');

	PBCFolder.add(options, 'xPBC', { '1': 1, '3': 3, '5': 5, '7': 7, '9': 9 }).onChange(function (value) {
		if (options.showPointCloud && view.systemSpatiallyResolvedDataBoolean) {
			_PointCloud_selectionJs.updatePointCloudGeometry(view);
		}
		if (options.showMolecule && view.systemMoleculeDataBoolean) {
			_MoleculeViewJs.updateMoleculeGeometry(view);
		}
		if (options.sync3DView) {
			options.syncOptions.call();
		}
		options.render.call();
	});

	PBCFolder.add(options, 'yPBC', { '1': 1, '3': 3, '5': 5, '7': 7, '9': 9 }).onChange(function (value) {
		if (options.showPointCloud && view.systemSpatiallyResolvedDataBoolean) {
			_PointCloud_selectionJs.updatePointCloudGeometry(view);
		}
		if (options.showMolecule && view.systemMoleculeDataBoolean) {
			_MoleculeViewJs.updateMoleculeGeometry(view);
		}
		if (options.sync3DView) {
			options.syncOptions.call();
		}
		options.render.call();
	});

	PBCFolder.add(options, 'zPBC', { '1': 1, '3': 3, '5': 5, '7': 7, '9': 9 }).onChange(function (value) {
		if (options.showPointCloud && view.systemSpatiallyResolvedDataBoolean) {
			_PointCloud_selectionJs.updatePointCloudGeometry(view);
		}
		if (options.showMolecule && view.systemMoleculeDataBoolean) {
			_MoleculeViewJs.updateMoleculeGeometry(view);
		}
		if (options.sync3DView) {
			options.syncOptions.call();
		}
		options.render.call();
	});
	PBCFolder.close();

	if (view.systemMoleculeDataBoolean) {

		moleculeFolder.add(options, 'interactiveMolecule').name('Interactive?').onChange(function (value) {
			if (value == true && view.options.interactiveSpatiallyResolved) {
				view.options.interactiveSpatiallyResolved = false;
			}
			gui.updateDisplay();
		});

		moleculeFolder.add(options, 'showAtoms').name('Show Atoms').onChange(function (value) {
			_MoleculeViewJs.changeMoleculeGeometry(view);
			if (options.sync3DView) {
				options.syncOptions.call();
			}
			options.render.call();
		});

		moleculeFolder.add(options, 'showBonds').name('Show Bonds').onChange(function (value) {
			_MoleculeViewJs.changeMoleculeGeometry(view);
			if (options.sync3DView) {
				options.syncOptions.call();
			}
			options.render.call();
		});

		moleculeFolder.add(options, 'atomsStyle', { "sprite": "sprite", "ball": "ball" }).name('Atom Style').onChange(function (value) {
			_MoleculeViewJs.changeMoleculeGeometry(view);
			if (options.sync3DView) {
				options.syncOptions.call();
			}
			options.render.call();
		});

		moleculeFolder.add(options, 'bondsStyle', { "line": "line", "tube": "tube" /*, "fatline": "fatline"*/ }).name('Bond Style').onChange(function (value) {
			_MoleculeViewJs.changeMoleculeGeometry(view);
			if (options.sync3DView) {
				options.syncOptions.call();
			}
			options.render.call();
		});

		moleculeFolder.add(options, 'moleculeColorCodeBasis', moleculeDataFeatureChoiceObject).name('Color Basis').onChange(function (value) {
			//adjustColorScaleAccordingToDefault(view);
			if (value == "atom") {
				_MultiviewControlColorLegendJs.removeLegendMolecule(view);
			}
			_UtilitiesScaleJs.adjustScaleAccordingToDefaultMoleculeData(view);
			_MoleculeViewJs.updateMoleculeGeometry(view);
			if (value != "atom") {
				_MultiviewControlColorLegendJs.changeLegendMolecule(view);
			}
			if (options.sync3DView) {
				options.syncOptions.call();
			}
			gui.updateDisplay();
			options.render.call();
		});

		moleculeFolder.add(options, 'moleculeColorSettingMin', -100, 100).step(0.1).name('Color Scale Min').onChange(function (value) {
			_MoleculeViewJs.updateMoleculeGeometry(view);
			_MultiviewControlColorLegendJs.changeLegendMolecule(view);
			if (options.sync3DView) {
				options.syncOptions.call();
			}
			options.render.call();
		});
		moleculeFolder.add(options, 'moleculeColorSettingMax', -100, 100).step(0.1).name('Color Scale Max').onChange(function (value) {
			_MoleculeViewJs.updateMoleculeGeometry(view);
			_MultiviewControlColorLegendJs.changeLegendMolecule(view);
			if (options.sync3DView) {
				options.syncOptions.call();
			}
			options.render.call();
		});

		moleculeFolder.add(options, 'moleculeSizeCodeBasis', moleculeDataFeatureChoiceObject).name('Size Basis').onChange(function (value) {
			//adjustColorScaleAccordingToDefault(view);
			_UtilitiesScaleJs.adjustScaleAccordingToDefaultMoleculeData(view);
			_MoleculeViewJs.updateMoleculeGeometry(view);
			if (options.sync3DView) {
				options.syncOptions.call();
			}
			gui.updateDisplay();
			options.render.call();
		});

		moleculeFolder.add(options, 'moleculeSizeSettingMin', -100, 100).step(0.1).name('Size Scale Min').onChange(function (value) {
			_MoleculeViewJs.updateMoleculeGeometry(view);
			if (options.sync3DView) {
				options.syncOptions.call();
			}
			options.render.call();
		});
		moleculeFolder.add(options, 'moleculeSizeSettingMax', -100, 100).step(0.1).name('Size Scale Max').onChange(function (value) {
			_MoleculeViewJs.updateMoleculeGeometry(view);
			if (options.sync3DView) {
				options.syncOptions.call();
			}
			options.render.call();
		});

		moleculeFolder.add(options, 'atomSize', 0.01, 2).step(0.01).name('Atom Size').onChange(function (value) {
			_MoleculeViewJs.updateMoleculeGeometry(view);
			if (options.sync3DView) {
				options.syncOptions.call();
			}
			options.render.call();
		});
		moleculeFolder.add(options, 'bondSize', 0.01, 0.5).step(0.01).name('Bond Size').onChange(function (value) {
			_MoleculeViewJs.changeMoleculeGeometry(view);
			if (options.sync3DView) {
				options.syncOptions.call();
			}
			options.render.call();
		});
		moleculeFolder.add(options, 'moleculeAlpha', 0.1, 1.0).step(0.1).name('Molecule Opacity').onChange(function (value) {
			_MoleculeViewJs.changeMoleculeGeometry(view);
			if (options.sync3DView) {
				options.syncOptions.call();
			}
			options.render.call();
		});

		moleculeFolder.add(options, 'maxBondLength', 0.1, 4).step(0.1).name('Bond Max').onChange(function (value) {
			_MoleculeViewJs.changeMoleculeGeometry(view);
			if (options.sync3DView) {
				options.syncOptions.call();
			}
			options.render.call();
		});

		moleculeFolder.add(options, 'minBondLength', 0.1, 4).step(0.1).name('Bond Min').onChange(function (value) {
			_MoleculeViewJs.changeMoleculeGeometry(view);
			if (options.sync3DView) {
				options.syncOptions.call();
			}
			options.render.call();
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

		moleculeAdditionalFolder.add(options, 'atomModelSegments', 4, 50).step(1).name('Atom Resolution').onChange(function (value) {
			_MoleculeViewJs.changeMoleculeGeometry(view);
			options.render.call();
		});
		moleculeAdditionalFolder.add(options, 'bondModelSegments', 4, 30).step(1).name('Bond Resolution').onChange(function (value) {
			_MoleculeViewJs.changeMoleculeGeometry(view);
			options.render.call();
		});
		moleculeAdditionalFolder.close();

		moleculeAdditionalFolder.add(options, 'cameraLightPositionX', -20000, 20000).step(50).name('Cam. Light X').onChange(function (value) {
			_MultiviewControlSetupViewBasicJs.updateCamLightPosition(view);
			options.render.call();
		});

		moleculeAdditionalFolder.add(options, 'cameraLightPositionY', -20000, 20000).step(50).name('Cam. Light Y').onChange(function (value) {
			_MultiviewControlSetupViewBasicJs.updateCamLightPosition(view);
			options.render.call();
		});

		moleculeAdditionalFolder.add(options, 'cameraLightPositionZ', -20000, 20000).step(50).name('Cam. Light Z').onChange(function (value) {
			_MultiviewControlSetupViewBasicJs.updateCamLightPosition(view);
			options.render.call();
		});
	}

	/*
 	viewFolder.add( options, 'view',{'pointCloud':'pointCloud', 'box':'box', 'pointMatrix':'pointMatrix'}).onChange( function( value ){
 		changeGeometry(options);
 		updateControlPanel(options);
 	});*/

	if (view.systemSpatiallyResolvedDataBoolean) {
		console.log('inserting spatially resolved folder');
		pointCloudFolder.add(options, 'interactiveSpatiallyResolved').name('Interactive?').onChange(function (value) {
			if (value == true && view.options.interactiveMolecule) {
				view.options.interactiveMolecule = false;
			}
			gui.updateDisplay();
		});
		pointCloudFolder.add(options, 'propertyOfInterest', propertyChoiceObject).name('Color Basis').onChange(function (value) {
			_UtilitiesScaleJs.adjustColorScaleAccordingToDefaultSpatiallyResolvedData(view);
			_PointCloud_selectionJs.updatePointCloudGeometry(view);
			_MultiviewControlColorLegendJs.changeLegend(view);
			if (options.sync3DView) {
				options.syncOptions.call();
			}
			gui.updateDisplay();
			options.render.call();
		});

		pointCloudFolder.add(options, 'colorMap', _UtilitiesColorMapJs.colorMapDict).name('Color Scheme').onChange(function (value) {
			_PointCloud_selectionJs.updatePointCloudGeometry(view);
			_MultiviewControlColorLegendJs.changeLegend(view);
			if (options.sync3DView) {
				options.syncOptions.call();
			}
			options.render.call();
		});

		pointCloudFolder.add(options, 'pointCloudParticles', 0, 100).step(0.1).name('Density').onChange(function (value) {
			_PointCloud_selectionJs.changePointCloudGeometry(view);
			if (options.sync3DView) {
				options.syncOptions.call();
			}
			options.render.call();
		});

		pointCloudFolder.add(options, 'pointCloudAlpha', 0, 1).step(0.01).name('Opacity').onChange(function (value) {
			_PointCloud_selectionJs.updatePointCloudGeometry(view);
			if (options.sync3DView) {
				options.syncOptions.call();
			}
			options.render.call();
		});
		pointCloudFolder.add(options, 'pointCloudSize', 0.01, 1).step(0.01).name('Size').onChange(function (value) {
			_PointCloud_selectionJs.updatePointCloudGeometry(view);
			if (options.sync3DView) {
				options.syncOptions.call();
			}
			options.render.call();
		});
		pointCloudFolder.add(options, 'pointCloudColorSettingMin', -1000, 1000).step(0.001).name('Color Scale Min').onChange(function (value) {
			_PointCloud_selectionJs.updatePointCloudGeometry(view);
			_MultiviewControlColorLegendJs.changeLegend(view);
			if (options.sync3DView) {
				options.syncOptions.call();
			}
			options.render.call();
		});
		pointCloudFolder.add(options, 'pointCloudColorSettingMax', -1000, 1000).step(0.001).name('Color Scale Max').onChange(function (value) {
			_PointCloud_selectionJs.updatePointCloudGeometry(view);
			_MultiviewControlColorLegendJs.changeLegend(view);
			if (options.sync3DView) {
				options.syncOptions.call();
			}
			options.render.call();
		});
		pointCloudFolder.add(options, 'pointCloudMaxPointPerBlock', 10, 200).step(10).name('Max Density').onChange(function (value) {
			_PointCloud_selectionJs.changePointCloudGeometry(view);
			if (options.sync3DView) {
				options.syncOptions.call();
			}
			options.render.call();
		});
		// pointCloudFolder.add( options, 'animate')
		// .onChange( function( value ) {
		// 	updatePointCloudGeometry(view);
		// });

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

		pointCloudAdditionalFolder.add(options, 'pointCloudTotalMagnitude', -5, 10).step(1).name('Dens. Magnitude').onChange(function (value) {
			_PointCloud_selectionJs.changePointCloudGeometry(view);
			options.render.call();
		});
		pointCloudAdditionalFolder.close();
	}

	sliderFolder.add(options, 'x_low', view.xPlotMin, view.xPlotMax).step(1).name('x low').onChange(function (value) {
		if (view.systemSpatiallyResolvedDataBoolean) {
			_PointCloud_selectionJs.updatePointCloudGeometry(view);
		}
		if (view.systemMoleculeDataBoolean) {
			_MoleculeViewJs.updateMoleculeGeometrySlider(view);
		}
		//updatePlane(options);
		options.render.call();
	});
	sliderFolder.add(options, 'x_high', view.xPlotMin, view.xPlotMax).step(1).name('x high').onChange(function (value) {
		if (view.systemSpatiallyResolvedDataBoolean) {
			_PointCloud_selectionJs.updatePointCloudGeometry(view);
		}
		if (view.systemMoleculeDataBoolean) {
			_MoleculeViewJs.updateMoleculeGeometrySlider(view);
		}
		//updatePlane(options);
		options.render.call();
	});
	sliderFolder.add(options, 'y_low', view.yPlotMin, view.yPlotMax).step(1).name('y low').onChange(function (value) {
		if (view.systemSpatiallyResolvedDataBoolean) {
			_PointCloud_selectionJs.updatePointCloudGeometry(view);
		}
		if (view.systemMoleculeDataBoolean) {
			_MoleculeViewJs.updateMoleculeGeometrySlider(view);
		}
		//updatePlane(options);
		options.render.call();
	});
	sliderFolder.add(options, 'y_high', view.yPlotMin, view.yPlotMax).step(1).name('y high').onChange(function (value) {
		if (view.systemSpatiallyResolvedDataBoolean) {
			_PointCloud_selectionJs.updatePointCloudGeometry(view);
		}
		if (view.systemMoleculeDataBoolean) {
			_MoleculeViewJs.updateMoleculeGeometrySlider(view);
		}
		//updatePlane(options);
		options.render.call();
	});
	sliderFolder.add(options, 'z_low', view.zPlotMin, view.zPlotMax).step(1).name('z low').onChange(function (value) {
		if (view.systemSpatiallyResolvedDataBoolean) {
			_PointCloud_selectionJs.updatePointCloudGeometry(view);
		}
		if (view.systemMoleculeDataBoolean) {
			_MoleculeViewJs.updateMoleculeGeometrySlider(view);
		}
		//updatePlane(options);
		options.render.call();
	});
	sliderFolder.add(options, 'z_high', view.zPlotMin, view.zPlotMax).step(1).name('z high').onChange(function (value) {
		if (view.systemSpatiallyResolvedDataBoolean) {
			_PointCloud_selectionJs.updatePointCloudGeometry(view);
		}
		if (view.systemMoleculeDataBoolean) {
			_MoleculeViewJs.updateMoleculeGeometrySlider(view);
		}
		//updatePlane(options);
		options.render.call();
	});

	sliderFolder.add(options, 'x_slider', view.xPlotMin, view.xPlotMax).step(1).onChange(function (value) {
		options.x_low = value - 1;
		options.x_high = value + 1;
		if (view.systemSpatiallyResolvedDataBoolean) {
			_PointCloud_selectionJs.updatePointCloudGeometry(view);
		}
		if (view.systemMoleculeDataBoolean) {
			_MoleculeViewJs.updateMoleculeGeometrySlider(view);
		}
		//updatePlane(options);
		gui.updateDisplay();
		options.render.call();
	});
	sliderFolder.add(options, 'y_slider', view.yPlotMin, view.yPlotMax).step(1).onChange(function (value) {
		options.y_low = value - 1;
		options.y_high = value + 1;
		if (view.systemSpatiallyResolvedDataBoolean) {
			_PointCloud_selectionJs.updatePointCloudGeometry(view);
		}
		if (view.systemMoleculeDataBoolean) {
			_MoleculeViewJs.updateMoleculeGeometrySlider(view);
		}
		//updatePlane(options);
		gui.updateDisplay();
		options.render.call();
	});
	sliderFolder.add(options, 'z_slider', view.zPlotMin, view.zPlotMax).step(1).onChange(function (value) {
		options.z_low = value - 1;
		options.z_high = value + 1;
		if (view.systemSpatiallyResolvedDataBoolean) {
			_PointCloud_selectionJs.updatePointCloudGeometry(view);
		}
		if (view.systemMoleculeDataBoolean) {
			_MoleculeViewJs.updateMoleculeGeometrySlider(view);
		}
		//updatePlane(options);
		gui.updateDisplay();
		options.render.call();
	});

	detailFolder.add(options, 'cameraFov', 10, 150).step(5).name('Camera Fov').onChange(function (value) {
		_MultiviewControlSetupViewBasicJs.updateCameraFov(view);
		options.render.call();
	});

	detailFolder.add(options, 'autoRotateSpeed', 0.1, 30.0).step(0.1).name('Rotate Speed').onChange(function (value) {
		view.controller.autoRotateSpeed = value;
	});

	detailFolder.add(options, 'backgroundAlpha', 0.0, 1.0).step(0.1).name('background transparency').onChange(function (value) {
		view.backgroundAlpha = value;
		if (options.sync3DView) {
			options.syncOptions.call();
		}
	});

	detailFolder.addColor(options, 'backgroundColor').name('background').onChange(function (value) {
		view.background = new THREE.Color(value);
		if (options.sync3DView) {
			options.syncOptions.call();
		}
		options.render.call();
	});

	//sliderFolder.open();
	//console.log(gui);
}

},{"../MultiviewControl/colorLegend.js":27,"../MultiviewControl/setupViewBasic.js":31,"../Utilities/colorMap.js":33,"../Utilities/other.js":34,"../Utilities/scale.js":38,"./MoleculeView.js":16,"./PointCloud_selection.js":17}],22:[function(require,module,exports){
"use strict";

exports.__esModule = true;
exports.addSystemEdge = addSystemEdge;
exports.removeSystemEdge = removeSystemEdge;

function addSystemEdge(view) {

	var options = view.options;
	var scene = view.scene;

	var geometry = new THREE.BoxBufferGeometry(view.systemDimension.x, view.systemDimension.y, view.systemDimension.z);
	var transformedPositionArray = transformPositionArray(geometry.attributes.position.array, view.systemLatticeVectors);
	geometry.setAttribute('position', new THREE.BufferAttribute(transformedPositionArray, 3));

	var geo = new THREE.EdgesGeometry(geometry); // or WireframeGeometry( geometry )
	var mat = new THREE.LineBasicMaterial({ color: 0xffffff, linewidth: 2 });
	var wireframe = new THREE.LineSegments(geo, mat);
	view.systemEdge = wireframe;
	scene.add(wireframe);
}

function removeSystemEdge(view) {
	view.scene.remove(view.systemEdge);
}

function transformPositionArray(array, U) {
	var X = [],
	    Y = [],
	    Z = [];
	var result = new Float32Array(array.length);

	for (var i = 0; i < array.length; i++) {
		switch (i % 3) {
			case 0:
				X.push(array[i]);
				break;

			case 1:
				Y.push(array[i]);
				break;

			case 2:
				Z.push(array[i]);
				break;

			default:
				break;
		}
	}

	if (X.length != Y.length || X.length != Z.length || Y.length != Z.length) {
		alert("weired position array when generating system Edge");
	}

	for (var i = 0; i < X.length; i++) {
		result[i * 3 + 0] = X[i] * U.u11 + Y[i] * U.u21 + Z[i] * U.u31;
		result[i * 3 + 1] = X[i] * U.u12 + Y[i] * U.u22 + Z[i] * U.u32;
		result[i * 3 + 2] = X[i] * U.u13 + Y[i] * U.u23 + Z[i] * U.u33;
	}

	return result;
}

},{}],23:[function(require,module,exports){
'use strict';

exports.__esModule = true;
exports.initialize3DViewTooltip = initialize3DViewTooltip;
exports.update3DViewTooltip = update3DViewTooltip;

function initialize3DViewTooltip(view) {
	var tempRaycaster = new THREE.Raycaster();
	view.raycaster = tempRaycaster;
	view.INTERSECTED = null;

	/*var tempTooltip = document.createElement('div');
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
 document.body.appendChild(tempTooltip);*/
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

},{}],24:[function(require,module,exports){
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

},{}],25:[function(require,module,exports){
'use strict';

exports.__esModule = true;
exports.activate2DPlotSpatiallyResolved = activate2DPlotSpatiallyResolved;
exports.deactivate2DPlotsSpatiallyResolved = deactivate2DPlotsSpatiallyResolved;
exports.activate2DPlotMolecule = activate2DPlotMolecule;
exports.deactivate2DPlotsMolecule = deactivate2DPlotsMolecule;

function activate2DPlotSpatiallyResolved(plotSetup, view, views) {
    for (var ii = 0; ii < views.length; ++ii) {
        var tempView = views[ii];
        tempView.options.activeViewSpatiallyResolved = false;
        tempView.gui.updateDisplay();
    }
    view.options.activeViewSpatiallyResolved = true;
    view.gui.updateDisplay();
    plotSetup.active2DPlotSpatiallyResolved = view;
    console.log('activating view sp', plotSetup.active2DPlotSpatiallyResolved);
}

function deactivate2DPlotsSpatiallyResolved(plotSetup, views) {
    for (var ii = 0; ii < views.length; ++ii) {
        var tempView = views[ii];
        tempView.options.activeViewSpatiallyResolved = false;
        tempView.gui.updateDisplay();
    }
    plotSetup.active2DPlotSpatiallyResolved = null;
    console.log('deactivating view sp', plotSetup.active2DPlotSpatiallyResolved);
}

function activate2DPlotMolecule(plotSetup, view, views) {
    for (var ii = 0; ii < views.length; ++ii) {
        var tempView = views[ii];
        tempView.options.activeViewMolecule = false;
        tempView.gui.updateDisplay();
    }
    view.options.activeViewMolecule = true;
    view.gui.updateDisplay();
    plotSetup.active2DPlotMolecule = view;
    console.log('activating view m', plotSetup.active2DPlotMolecule);
}

function deactivate2DPlotsMolecule(plotSetup, views) {
    for (var ii = 0; ii < views.length; ++ii) {
        var tempView = views[ii];
        tempView.options.activeViewMolecule = false;
        tempView.gui.updateDisplay();
    }
    plotSetup.active2DPlotMolecule = null;
    console.log('deactivating view m', plotSetup.active2DPlotMolecule);
}

},{}],26:[function(require,module,exports){
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

},{"../2DHeatmaps/Utilities.js":7,"./optionBoxControl.js":30}],27:[function(require,module,exports){
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

},{}],28:[function(require,module,exports){
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

		// console.log(left, right, top, bottom, mouseX, mouseY)
		if (mouseX > left && mouseX < right && mouseY > top && mouseY < bottom) {
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

},{}],29:[function(require,module,exports){
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

},{"../2DHeatmaps/initialize2DHeatmapSetup.js":10,"../3DViews/initialize3DViewSetup.js":19,"../MultiviewControl/calculateViewportSizes.js":26}],30:[function(require,module,exports){
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

},{}],31:[function(require,module,exports){
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

	var tempController = new THREE.OrbitControls(camera, renderer.domElement);
	tempController.minAzimuthAngle = -Infinity; // radians
	tempController.maxAzimuthAngle = Infinity; // radians
	tempController.minPolarAngle = -2 * Math.PI; // radians
	tempController.maxPolarAngle = 2 * Math.PI; // radians
	/* var tempController = new THREE.TrackballControls( camera, renderer.domElement );
 tempController.rotateSpeed = 20.0; */
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

},{}],32:[function(require,module,exports){
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
				var point1 = new THREE.Vector3(moleculeData[i].x, moleculeData[i].y, moleculeData[i].z);

				var nearest = tree.nearest(moleculeData[i], 6, 4);

				for (var j = 0; j < nearest.length; j++) {
					var neighbor = nearest[j][0];
					var distance = nearest[j][1];

					if (distance > 0) {
						var point2 = new THREE.Vector3(neighbor.x, neighbor.y, neighbor.z);
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

},{}],33:[function(require,module,exports){
'use strict';

exports.__esModule = true;
var colorMapDict = {
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
    'gist_ncar': 'gist_ncar' };
exports.colorMapDict = colorMapDict;

},{}],34:[function(require,module,exports){
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

},{}],35:[function(require,module,exports){
'use strict';

exports.__esModule = true;
exports.processSpatiallyResolvedData = processSpatiallyResolvedData;
exports.processMoleculeData = processMoleculeData;
exports.readCSVSpatiallyResolvedData = readCSVSpatiallyResolvedData;
exports.readCSVSpatiallyResolvedDataPapaparse = readCSVSpatiallyResolvedDataPapaparse;
exports.readCSVMoleculeData = readCSVMoleculeData;
exports.combineData = combineData;
var Papa = require('papaparse');
var fs = require('fs');

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

	d.forEach(function (d, i) {
		var n = +d[density];
		if (n > densityCutoffLow && n < densityCutoffUp) {
			var temp = {
				x: +d.x,
				y: +d.y,
				z: +d.z,
				selected: true,
				highlighted: false,
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
			// overallSpatiallyResolvedData.push(temp);
		}
	});
	console.log('end processing data');
	callback(null);
}

function processMoleculeData(view, plotSetup, callback) {
	view.systemMoleculeData = [];
	view.systemMoleculeDataFramed = {};
	console.log('started processing molecule data');
	if (view.frameBool && !plotSetup.moleculePropertyList.includes(plotSetup.frameProperty)) {
		alert("The frame property Not in moleculePropertyList");
	}
	var d = view.moleculeData.data;
	var propertyList = plotSetup.moleculePropertyList;
	var systemName = view.moleculeName;

	d.forEach(function (d, i) {

		var temp = {
			atom: d.atom.trim(),
			x: +d.x,
			y: +d.y,
			z: +d.z,
			selected: true,
			highlighted: false,
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
	});
	console.log('end processing molecule data');
	callback(null);
}

function readCSVSpatiallyResolvedData(view, plotSetup, callback) {
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
						selected: true,
						highlighted: false,
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
				}
			});
			console.log('end parsing');
			callback(null);
		});
	}
}

function readCSVSpatiallyResolvedDataPapaparse(view, plotSetup, callback) {
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
		var propertyList = plotSetup.spatiallyResolvedPropertyList;
		var density = plotSetup.pointcloudDensity;
		var densityCutoffLow = plotSetup.densityCutoffLow;
		var densityCutoffUp = plotSetup.densityCutoffUp;
		var systemName = view.moleculeName;

		var d, n, currentFrame;
		Papa.parse(filename, {
			header: true,
			download: true,
			chunk: function chunk(_chunk) {
				console.log('loading chunk');
				for (var ii = 0; ii < _chunk.length; ii++) {
					d = chunck.data[ii];
					n = +d[density];
					if (n > densityCutoffLow && n < densityCutoffUp) {
						var temp = {
							x: +d.x,
							y: +d.y,
							z: +d.z,
							selected: true,
							highlighted: false,
							name: systemName
						};
						for (var i = 0; i < propertyList.length; i++) {
							temp[propertyList[i]] = +d[propertyList[i]];
						}

						if (view.frameBool) {
							currentFrame = (+d[plotSetup.frameProperty]).toString();
						} else {
							temp["__frame__"] = 1;
							currentFrame = 1..toString();
						}

						!(currentFrame in view.systemSpatiallyResolvedDataFramed) && (view.systemSpatiallyResolvedDataFramed[currentFrame] = []);

						view.systemSpatiallyResolvedData.push(temp);
						view.systemSpatiallyResolvedDataFramed[currentFrame].push(temp);
					}
				}
			},
			complete: function complete() {
				console.log('papa load complete');
				callback(null);
			}
		});
	}
}

function readCSVMoleculeData(view, plotSetup, callback) {

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
					selected: true,
					highlighted: false,
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

function addViewDataToOverallDataSpatiallyResolved(view, overallSpatiallyResolvedData) {
	// var map = new Uint32Array(view.systemSpatiallyResolvedData.length);
	// var counterCurrent = 0;
	// var counterOverall = overallSpatiallyResolvedData.length;
	view.systemSpatiallyResolvedData.forEach(function (datapoint) {
		overallSpatiallyResolvedData.push(datapoint);
		// map[counterCurrent] = counterOverall;
		// counterOverall++;
		// counterCurrent++;
	});
	// view.spatiallyResolvedDataToOverallMap = map;
}

function addViewDataToOverallDataMolecule(view, overallMoleculeData) {
	// var map = new Uint32Array(view.systemMoleculeData.length);
	// var counterCurrent = 0;
	// var counterOverall = overallMoleculeData.length;
	view.systemMoleculeData.forEach(function (datapoint) {
		overallMoleculeData.push(datapoint);
		// map[counterCurrent] = counterOverall;
		// counterOverall++;
		// counterCurrent++;
	});
	// view.moleculeDataToOverallMap = map;
}

function combineData(views, overallSpatiallyResolvedData, overallMoleculeData) {
	for (var ii = 0; ii < views.length; ++ii) {
		var view = views[ii];

		if (view.viewType == '3DView') {
			if (view.systemSpatiallyResolvedData != null && view.systemSpatiallyResolvedData.length != 0) {
				addViewDataToOverallDataSpatiallyResolved(view, overallSpatiallyResolvedData);
			}
			if (view.systemMoleculeData != null && view.systemMoleculeData.length != 0) {
				addViewDataToOverallDataMolecule(view, overallMoleculeData);
			}
		}
	}
}

},{"fs":39,"papaparse":48}],36:[function(require,module,exports){
'use strict';

exports.__esModule = true;
exports.readInputForm = readInputForm;

function readInputForm() {
    for (var i = 0; i < NUMBER3DVIEWS; i++) {
        /* document.getElementById('view'+ (i+1) +'YMax').disabled = false;
        document.getElementById('view'+ (i+1) +'ZMax').disabled = false;
        document.getElementById('view'+ (i+1) +'YMin').disabled = false;
        document.getElementById('view'+ (i+1) +'ZMin').disabled = false; */

        document.getElementById('view' + (i + 1) + 'YDim').disabled = false;
        document.getElementById('view' + (i + 1) + 'ZDim').disabled = false;
        document.getElementById('view' + (i + 1) + 'YNumPoints').disabled = false;
        document.getElementById('view' + (i + 1) + 'ZNumPoints').disabled = false;
        document.getElementById('view' + (i + 1) + 'YSpacing').disabled = false;
        document.getElementById('view' + (i + 1) + 'ZSpacing').disabled = false;

        document.getElementById('view' + (i + 1) + 'LatVec11').disabled = false;
        document.getElementById('view' + (i + 1) + 'LatVec12').disabled = false;
        document.getElementById('view' + (i + 1) + 'LatVec13').disabled = false;
        document.getElementById('view' + (i + 1) + 'LatVec21').disabled = false;
        document.getElementById('view' + (i + 1) + 'LatVec22').disabled = false;
        document.getElementById('view' + (i + 1) + 'LatVec23').disabled = false;
        document.getElementById('view' + (i + 1) + 'LatVec31').disabled = false;
        document.getElementById('view' + (i + 1) + 'LatVec32').disabled = false;
        document.getElementById('view' + (i + 1) + 'LatVec33').disabled = false;
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
        /* tempViewSetup["systemDimension"] = {"x":[Number(tempFormResult["view"+i+"XMin"]), Number(tempFormResult["view"+i+"XMax"])],
                                            "y":[Number(tempFormResult["view"+i+"YMin"]), Number(tempFormResult["view"+i+"YMax"])],
                                            "z":[Number(tempFormResult["view"+i+"ZMin"]), Number(tempFormResult["view"+i+"ZMax"])]}; */
        tempViewSetup["systemDimension"] = { "x": Number(tempFormResult["view" + i + "XDim"]),
            "y": Number(tempFormResult["view" + i + "YDim"]),
            "z": Number(tempFormResult["view" + i + "ZDim"]) };
        var tempU = { "u11": Number(tempFormResult["view" + i + "LatVec11"]),
            "u12": Number(tempFormResult["view" + i + "LatVec12"]),
            "u13": Number(tempFormResult["view" + i + "LatVec13"]),
            "u21": Number(tempFormResult["view" + i + "LatVec21"]),
            "u22": Number(tempFormResult["view" + i + "LatVec22"]),
            "u23": Number(tempFormResult["view" + i + "LatVec23"]),
            "u31": Number(tempFormResult["view" + i + "LatVec31"]),
            "u32": Number(tempFormResult["view" + i + "LatVec32"]),
            "u33": Number(tempFormResult["view" + i + "LatVec33"]) };
        tempViewSetup["systemLatticeVectors"] = normalizeLatticeVectors(tempU);

        if (boolSpatiallyResolved) {
            tempViewSetup["spatiallyResolvedData"] = {};
            tempViewSetup["spatiallyResolvedData"]["dataFilename"] = document.getElementById("view" + i + "SpatiallyResolvedDataFilename").files[0].path;
            tempViewSetup["spatiallyResolvedData"]["numGridPoints"] = { "x": Number(tempFormResult["view" + i + "XNumPoints"]),
                "y": Number(tempFormResult["view" + i + "YNumPoints"]),
                "z": Number(tempFormResult["view" + i + "ZNumPoints"]) };
            tempViewSetup["spatiallyResolvedData"]["gridSpacing"] = { "x": Number(tempFormResult["view" + i + "XSpacing"]),
                "y": Number(tempFormResult["view" + i + "YSpacing"]),
                "z": Number(tempFormResult["view" + i + "ZSpacing"]) };
        }

        if (boolMolecular) {
            tempViewSetup["moleculeData"] = {};
            tempViewSetup["moleculeData"]["dataFilename"] = document.getElementById("view" + i + "MolecularDataFilename").files[0].path;
        }
        CONFIG["views"].push(tempViewSetup);
    }
    return CONFIG;
}

function normalizeLatticeVectors(U) {
    var magnitude1 = Math.sqrt(U.u11 * U.u11 + U.u12 * U.u12 + U.u13 * U.u13);
    var magnitude2 = Math.sqrt(U.u21 * U.u21 + U.u22 * U.u22 + U.u23 * U.u23);
    var magnitude3 = Math.sqrt(U.u31 * U.u31 + U.u32 * U.u32 + U.u33 * U.u33);
    var result = {
        "u11": U.u11 / magnitude1,
        "u12": U.u12 / magnitude1,
        "u13": U.u13 / magnitude1,
        "u21": U.u21 / magnitude2,
        "u22": U.u22 / magnitude2,
        "u23": U.u23 / magnitude2,
        "u31": U.u31 / magnitude3,
        "u32": U.u32 / magnitude3,
        "u33": U.u33 / magnitude3
    };
    return result;
}

},{}],37:[function(require,module,exports){
"use strict";

exports.__esModule = true;
exports.saveSystemMoleculeData = saveSystemMoleculeData;
exports.saveSystemSpatiallyResolvedData = saveSystemSpatiallyResolvedData;
exports.saveOverallMoleculeData = saveOverallMoleculeData;
exports.saveOverallSpatiallyResolvedData = saveOverallSpatiallyResolvedData;
exports.download = download;

function saveSystemMoleculeData(view, plotSetup) {
				//var data;
				console.log("save MoleculeData");
				var csv = convertArrayOfObjectsToCSV(view.systemMoleculeData, plotSetup["moleculePropertyList"].slice());
}

function saveSystemSpatiallyResolvedData(view, plotSetup) {
				//var data;
				console.log("save SpatiallyResolvedData");
				var csv = convertArrayOfObjectsToCSV(view.data, plotSetup["spatiallyResolvedPropertyList"].slice());
}

function saveOverallMoleculeData(view, plotSetup) {
				//var data;
				console.log("save overall MoleculeData");
				var csv = convertArrayOfObjectsToCSV(view.overallMoleculeData, plotSetup["moleculePropertyList"].slice());
}

function saveOverallSpatiallyResolvedData(view, plotSetup) {
				//var data;
				console.log("save overall SpatiallyResolvedData");
				var csv = convertArrayOfObjectsToCSV(view.spatiallyResolvedData, plotSetup["spatiallyResolvedPropertyList"].slice());
}

function download(content, fileName, contentType) {
				var contentToWrite = JSON.stringify(content, null, 2);
				var a = document.createElement("a");
				var file = new Blob([contentToWrite], { type: contentType });
				a.href = URL.createObjectURL(file);
				a.download = fileName;
				a.click();
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

},{}],38:[function(require,module,exports){
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
	if (view.defaultScalesSpatiallyResolvedData[view.options.propertyOfInterest]['min'] != view.defaultScalesSpatiallyResolvedData[view.options.propertyOfInterest]['max']) {
		view.options.pointCloudColorSettingMin = view.defaultScalesSpatiallyResolvedData[view.options.propertyOfInterest]['min'];
		view.options.pointCloudColorSettingMax = view.defaultScalesSpatiallyResolvedData[view.options.propertyOfInterest]['max'];
	} else {
		view.options.pointCloudColorSettingMin = view.defaultScalesSpatiallyResolvedData[view.options.propertyOfInterest]['min'] - 0.5;
		view.options.pointCloudColorSettingMax = view.defaultScalesSpatiallyResolvedData[view.options.propertyOfInterest]['max'] + 0.5;
	}
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

},{}],39:[function(require,module,exports){

},{}],40:[function(require,module,exports){
'use strict';

const toString = Object.prototype.toString;

function isAnyArray(object) {
  return toString.call(object).endsWith('Array]');
}

module.exports = isAnyArray;

},{}],41:[function(require,module,exports){
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

  let maxValue = input[0];
  for (let i = 1; i < input.length; i++) {
    if (input[i] > maxValue) maxValue = input[i];
  }
  return maxValue;
}

module.exports = max;

},{"is-any-array":40}],42:[function(require,module,exports){
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

  let minValue = input[0];
  for (let i = 1; i < input.length; i++) {
    if (input[i] < minValue) minValue = input[i];
  }
  return minValue;
}

module.exports = min;

},{"is-any-array":40}],43:[function(require,module,exports){
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
      'minimum and maximum input values are equal. Cannot rescale a constant array',
    );
  }

  const {
    min: minValue = options.autoMinMax ? currentMin : 0,
    max: maxValue = options.autoMinMax ? currentMax : 1,
  } = options;

  if (minValue >= maxValue) {
    throw new RangeError('min option must be smaller than max option');
  }

  const factor = (maxValue - minValue) / (currentMax - currentMin);
  for (let i = 0; i < input.length; i++) {
    output[i] = (input[i] - currentMin) * factor + minValue;
  }

  return output;
}

module.exports = rescale;

},{"is-any-array":40,"ml-array-max":41,"ml-array-min":42}],44:[function(require,module,exports){
'use strict';

var mlMatrix = require('ml-matrix');

/**
 * Calculate current error
 * @ignore
 * @param {{x:Array<number>, y:Array<number>}} data - Array of points to fit in the format [x1, x2, ... ], [y1, y2, ... ]
 * @param {Array<number>} parameters - Array of current parameter values
 * @param {function} parameterizedFunction - The parameters and returns a function with the independent variable as a parameter
 * @return {number}
 */
function errorCalculation(
  data,
  parameters,
  parameterizedFunction
) {
  var error = 0;
  const func = parameterizedFunction(parameters);

  for (var i = 0; i < data.x.length; i++) {
    error += Math.abs(data.y[i] - func(data.x[i]));
  }

  return error;
}

/**
 * Difference of the matrix function over the parameters
 * @ignore
 * @param {{x:Array<number>, y:Array<number>}} data - Array of points to fit in the format [x1, x2, ... ], [y1, y2, ... ]
 * @param {Array<number>} evaluatedData - Array of previous evaluated function values
 * @param {Array<number>} params - Array of previous parameter values
 * @param {number} gradientDifference - Adjustment for decrease the damping parameter
 * @param {function} paramFunction - The parameters and returns a function with the independent variable as a parameter
 * @return {Matrix}
 */
function gradientFunction(
  data,
  evaluatedData,
  params,
  gradientDifference,
  paramFunction
) {
  const n = params.length;
  const m = data.x.length;

  var ans = new Array(n);

  for (var param = 0; param < n; param++) {
    ans[param] = new Array(m);
    var auxParams = params.concat();
    auxParams[param] += gradientDifference;
    var funcParam = paramFunction(auxParams);

    for (var point = 0; point < m; point++) {
      ans[param][point] = evaluatedData[point] - funcParam(data.x[point]);
    }
  }
  return new mlMatrix.Matrix(ans);
}

/**
 * Matrix function over the samples
 * @ignore
 * @param {{x:Array<number>, y:Array<number>}} data - Array of points to fit in the format [x1, x2, ... ], [y1, y2, ... ]
 * @param {Array<number>} evaluatedData - Array of previous evaluated function values
 * @return {Matrix}
 */
function matrixFunction(data, evaluatedData) {
  const m = data.x.length;

  var ans = new Array(m);

  for (var point = 0; point < m; point++) {
    ans[point] = [data.y[point] - evaluatedData[point]];
  }

  return new mlMatrix.Matrix(ans);
}

/**
 * Iteration for Levenberg-Marquardt
 * @ignore
 * @param {{x:Array<number>, y:Array<number>}} data - Array of points to fit in the format [x1, x2, ... ], [y1, y2, ... ]
 * @param {Array<number>} params - Array of previous parameter values
 * @param {number} damping - Levenberg-Marquardt parameter
 * @param {number} gradientDifference - Adjustment for decrease the damping parameter
 * @param {function} parameterizedFunction - The parameters and returns a function with the independent variable as a parameter
 * @return {Array<number>}
 */
function step(
  data,
  params,
  damping,
  gradientDifference,
  parameterizedFunction
) {
  var value = damping * gradientDifference * gradientDifference;
  var identity = mlMatrix.Matrix.eye(params.length, params.length, value);

  const func = parameterizedFunction(params);
  var evaluatedData = data.x.map((e) => func(e));

  var gradientFunc = gradientFunction(
    data,
    evaluatedData,
    params,
    gradientDifference,
    parameterizedFunction
  );
  var matrixFunc = matrixFunction(data, evaluatedData);
  var inverseMatrix = mlMatrix.inverse(
    identity.add(gradientFunc.mmul(gradientFunc.transpose()))
  );

  params = new mlMatrix.Matrix([params]);
  params = params.sub(
    inverseMatrix
      .mmul(gradientFunc)
      .mmul(matrixFunc)
      .mul(gradientDifference)
      .transpose()
  );

  return params.to1DArray();
}

/**
 * Curve fitting algorithm
 * @param {{x:Array<number>, y:Array<number>}} data - Array of points to fit in the format [x1, x2, ... ], [y1, y2, ... ]
 * @param {function} parameterizedFunction - The parameters and returns a function with the independent variable as a parameter
 * @param {object} [options] - Options object
 * @param {number} [options.damping] - Levenberg-Marquardt parameter
 * @param {number} [options.gradientDifference = 10e-2] - Adjustment for decrease the damping parameter
 * @param {Array<number>} [options.minValues] - Minimum allowed values for parameters
 * @param {Array<number>} [options.maxValues] - Maximum allowed values for parameters
 * @param {Array<number>} [options.initialValues] - Array of initial parameter values
 * @param {number} [options.maxIterations = 100] - Maximum of allowed iterations
 * @param {number} [options.errorTolerance = 10e-3] - Minimum uncertainty allowed for each point
 * @return {{parameterValues: Array<number>, parameterError: number, iterations: number}}
 */
function levenbergMarquardt(
  data,
  parameterizedFunction,
  options = {}
) {
  let {
    maxIterations = 100,
    gradientDifference = 10e-2,
    damping = 0,
    errorTolerance = 10e-3,
    minValues,
    maxValues,
    initialValues
  } = options;

  if (damping <= 0) {
    throw new Error('The damping option must be a positive number');
  } else if (!data.x || !data.y) {
    throw new Error('The data parameter must have x and y elements');
  } else if (
    !Array.isArray(data.x) ||
    data.x.length < 2 ||
    !Array.isArray(data.y) ||
    data.y.length < 2
  ) {
    throw new Error(
      'The data parameter elements must be an array with more than 2 points'
    );
  } else if (data.x.length !== data.y.length) {
    throw new Error('The data parameter elements must have the same size');
  }

  var parameters =
    initialValues || new Array(parameterizedFunction.length).fill(1);
  let parLen = parameters.length;
  maxValues = maxValues || new Array(parLen).fill(Number.MAX_SAFE_INTEGER);
  minValues = minValues || new Array(parLen).fill(Number.MIN_SAFE_INTEGER);

  if (maxValues.length !== minValues.length) {
    throw new Error('minValues and maxValues must be the same size');
  }

  if (!Array.isArray(parameters)) {
    throw new Error('initialValues must be an array');
  }

  var error = errorCalculation(data, parameters, parameterizedFunction);

  var converged = error <= errorTolerance;

  for (
    var iteration = 0;
    iteration < maxIterations && !converged;
    iteration++
  ) {
    parameters = step(
      data,
      parameters,
      damping,
      gradientDifference,
      parameterizedFunction
    );

    for (let k = 0; k < parLen; k++) {
      parameters[k] = Math.min(
        Math.max(minValues[k], parameters[k]),
        maxValues[k]
      );
    }

    error = errorCalculation(data, parameters, parameterizedFunction);
    if (isNaN(error)) break;
    converged = error <= errorTolerance;
  }

  return {
    parameterValues: parameters,
    parameterError: error,
    iterations: iteration
  };
}

module.exports = levenbergMarquardt;

},{"ml-matrix":45}],45:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

function _interopDefault (ex) { return (ex && (typeof ex === 'object') && 'default' in ex) ? ex['default'] : ex; }

var rescale = _interopDefault(require('ml-array-rescale'));
var max = _interopDefault(require('ml-array-max'));

/**
 * @class LuDecomposition
 * @link https://github.com/lutzroeder/Mapack/blob/master/Source/LuDecomposition.cs
 * @param {Matrix} matrix
 */
class LuDecomposition {
  constructor(matrix) {
    matrix = WrapperMatrix2D.checkMatrix(matrix);

    var lu = matrix.clone();
    var rows = lu.rows;
    var columns = lu.columns;
    var pivotVector = new Array(rows);
    var pivotSign = 1;
    var i, j, k, p, s, t, v;
    var LUcolj, kmax;

    for (i = 0; i < rows; i++) {
      pivotVector[i] = i;
    }

    LUcolj = new Array(rows);

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

  /**
   *
   * @return {boolean}
   */
  isSingular() {
    var data = this.LU;
    var col = data.columns;
    for (var j = 0; j < col; j++) {
      if (data[j][j] === 0) {
        return true;
      }
    }
    return false;
  }

  /**
   *
   * @param {Matrix} value
   * @return {Matrix}
   */
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
          X[i][j] -= X[k][j] * lu[i][k];
        }
      }
    }
    for (k = columns - 1; k >= 0; k--) {
      for (j = 0; j < count; j++) {
        X[k][j] /= lu[k][k];
      }
      for (i = 0; i < k; i++) {
        for (j = 0; j < count; j++) {
          X[i][j] -= X[k][j] * lu[i][k];
        }
      }
    }
    return X;
  }

  /**
   *
   * @return {number}
   */
  get determinant() {
    var data = this.LU;
    if (!data.isSquare()) {
      throw new Error('Matrix must be square');
    }
    var determinant = this.pivotSign;
    var col = data.columns;
    for (var j = 0; j < col; j++) {
      determinant *= data[j][j];
    }
    return determinant;
  }

  /**
   *
   * @return {Matrix}
   */
  get lowerTriangularMatrix() {
    var data = this.LU;
    var rows = data.rows;
    var columns = data.columns;
    var X = new Matrix(rows, columns);
    for (var i = 0; i < rows; i++) {
      for (var j = 0; j < columns; j++) {
        if (i > j) {
          X[i][j] = data[i][j];
        } else if (i === j) {
          X[i][j] = 1;
        } else {
          X[i][j] = 0;
        }
      }
    }
    return X;
  }

  /**
   *
   * @return {Matrix}
   */
  get upperTriangularMatrix() {
    var data = this.LU;
    var rows = data.rows;
    var columns = data.columns;
    var X = new Matrix(rows, columns);
    for (var i = 0; i < rows; i++) {
      for (var j = 0; j < columns; j++) {
        if (i <= j) {
          X[i][j] = data[i][j];
        } else {
          X[i][j] = 0;
        }
      }
    }
    return X;
  }

  /**
   *
   * @return {Array<number>}
   */
  get pivotPermutationVector() {
    return this.pivotVector.slice();
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

function getFilled2DArray(rows, columns, value) {
  var array = new Array(rows);
  for (var i = 0; i < rows; i++) {
    array[i] = new Array(columns);
    for (var j = 0; j < columns; j++) {
      array[i][j] = value;
    }
  }
  return array;
}

/**
 * @class SingularValueDecomposition
 * @see https://github.com/accord-net/framework/blob/development/Sources/Accord.Math/Decompositions/SingularValueDecomposition.cs
 * @param {Matrix} value
 * @param {object} [options]
 * @param {boolean} [options.computeLeftSingularVectors=true]
 * @param {boolean} [options.computeRightSingularVectors=true]
 * @param {boolean} [options.autoTranspose=false]
 */
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
    var s = new Array(ni);
    var U = getFilled2DArray(m, nu, 0);
    var V = getFilled2DArray(n, n, 0);

    var e = new Array(n);
    var work = new Array(m);

    var si = new Array(ni);
    for (let i = 0; i < ni; i++) si[i] = i;

    var nct = Math.min(m - 1, n);
    var nrt = Math.max(0, Math.min(n - 2, m));
    var mrc = Math.max(nct, nrt);

    for (let k = 0; k < mrc; k++) {
      if (k < nct) {
        s[k] = 0;
        for (let i = k; i < m; i++) {
          s[k] = hypotenuse(s[k], a[i][k]);
        }
        if (s[k] !== 0) {
          if (a[k][k] < 0) {
            s[k] = -s[k];
          }
          for (let i = k; i < m; i++) {
            a[i][k] /= s[k];
          }
          a[k][k] += 1;
        }
        s[k] = -s[k];
      }

      for (let j = k + 1; j < n; j++) {
        if (k < nct && s[k] !== 0) {
          let t = 0;
          for (let i = k; i < m; i++) {
            t += a[i][k] * a[i][j];
          }
          t = -t / a[k][k];
          for (let i = k; i < m; i++) {
            a[i][j] += t * a[i][k];
          }
        }
        e[j] = a[k][j];
      }

      if (wantu && k < nct) {
        for (let i = k; i < m; i++) {
          U[i][k] = a[i][k];
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
              work[i] += e[j] * a[i][j];
            }
          }
          for (let j = k + 1; j < n; j++) {
            let t = -e[j] / e[k + 1];
            for (let i = k + 1; i < m; i++) {
              a[i][j] += t * work[i];
            }
          }
        }
        if (wantv) {
          for (let i = k + 1; i < n; i++) {
            V[i][k] = e[i];
          }
        }
      }
    }

    let p = Math.min(n, m + 1);
    if (nct < n) {
      s[nct] = a[nct][nct];
    }
    if (m < p) {
      s[p - 1] = 0;
    }
    if (nrt + 1 < p) {
      e[nrt] = a[nrt][p - 1];
    }
    e[p - 1] = 0;

    if (wantu) {
      for (let j = nct; j < nu; j++) {
        for (let i = 0; i < m; i++) {
          U[i][j] = 0;
        }
        U[j][j] = 1;
      }
      for (let k = nct - 1; k >= 0; k--) {
        if (s[k] !== 0) {
          for (let j = k + 1; j < nu; j++) {
            let t = 0;
            for (let i = k; i < m; i++) {
              t += U[i][k] * U[i][j];
            }
            t = -t / U[k][k];
            for (let i = k; i < m; i++) {
              U[i][j] += t * U[i][k];
            }
          }
          for (let i = k; i < m; i++) {
            U[i][k] = -U[i][k];
          }
          U[k][k] = 1 + U[k][k];
          for (let i = 0; i < k - 1; i++) {
            U[i][k] = 0;
          }
        } else {
          for (let i = 0; i < m; i++) {
            U[i][k] = 0;
          }
          U[k][k] = 1;
        }
      }
    }

    if (wantv) {
      for (let k = n - 1; k >= 0; k--) {
        if (k < nrt && e[k] !== 0) {
          for (let j = k + 1; j < n; j++) {
            let t = 0;
            for (let i = k + 1; i < n; i++) {
              t += V[i][k] * V[i][j];
            }
            t = -t / V[k + 1][k];
            for (let i = k + 1; i < n; i++) {
              V[i][j] += t * V[i][k];
            }
          }
        }
        for (let i = 0; i < n; i++) {
          V[i][k] = 0;
        }
        V[k][k] = 1;
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
                t = cs * V[i][j] + sn * V[i][p - 1];
                V[i][p - 1] = -sn * V[i][j] + cs * V[i][p - 1];
                V[i][j] = t;
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
                t = cs * U[i][j] + sn * U[i][k - 1];
                U[i][k - 1] = -sn * U[i][j] + cs * U[i][k - 1];
                U[i][j] = t;
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
                t = cs * V[i][j] + sn * V[i][j + 1];
                V[i][j + 1] = -sn * V[i][j] + cs * V[i][j + 1];
                V[i][j] = t;
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
                t = cs * U[i][j] + sn * U[i][j + 1];
                U[i][j + 1] = -sn * U[i][j] + cs * U[i][j + 1];
                U[i][j] = t;
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
                V[i][k] = -V[i][k];
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
                t = V[i][k + 1];
                V[i][k + 1] = V[i][k];
                V[i][k] = t;
              }
            }
            if (wantu && k < m - 1) {
              for (let i = 0; i < m; i++) {
                t = U[i][k + 1];
                U[i][k + 1] = U[i][k];
                U[i][k] = t;
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

  /**
   * Solve a problem of least square (Ax=b) by using the SVD. Useful when A is singular. When A is not singular, it would be better to use qr.solve(value).
   * Example : We search to approximate x, with A matrix shape m*n, x vector size n, b vector size m (m > n). We will use :
   * var svd = SingularValueDecomposition(A);
   * var x = svd.solve(b);
   * @param {Matrix} value - Matrix 1D which is the vector b (in the equation Ax = b)
   * @return {Matrix} - The vector x
   */
  solve(value) {
    var Y = value;
    var e = this.threshold;
    var scols = this.s.length;
    var Ls = Matrix.zeros(scols, scols);

    for (let i = 0; i < scols; i++) {
      if (Math.abs(this.s[i]) <= e) {
        Ls[i][i] = 0;
      } else {
        Ls[i][i] = 1 / this.s[i];
      }
    }

    var U = this.U;
    var V = this.rightSingularVectors;

    var VL = V.mmul(Ls);
    var vrows = V.rows;
    var urows = U.length;
    var VLU = Matrix.zeros(vrows, urows);

    for (let i = 0; i < vrows; i++) {
      for (let j = 0; j < urows; j++) {
        let sum = 0;
        for (let k = 0; k < scols; k++) {
          sum += VL[i][k] * U[j][k];
        }
        VLU[i][j] = sum;
      }
    }

    return VLU.mmul(Y);
  }

  /**
   *
   * @param {Array<number>} value
   * @return {Matrix}
   */
  solveForDiagonal(value) {
    return this.solve(Matrix.diag(value));
  }

  /**
   * Get the inverse of the matrix. We compute the inverse of a matrix using SVD when this matrix is singular or ill-conditioned. Example :
   * var svd = SingularValueDecomposition(A);
   * var inverseA = svd.inverse();
   * @return {Matrix} - The approximation of the inverse of the matrix
   */
  inverse() {
    var V = this.V;
    var e = this.threshold;
    var vrows = V.length;
    var vcols = V[0].length;
    var X = new Matrix(vrows, this.s.length);

    for (let i = 0; i < vrows; i++) {
      for (let j = 0; j < vcols; j++) {
        if (Math.abs(this.s[j]) > e) {
          X[i][j] = V[i][j] / this.s[j];
        } else {
          X[i][j] = 0;
        }
      }
    }

    var U = this.U;

    var urows = U.length;
    var ucols = U[0].length;
    var Y = new Matrix(vrows, urows);

    for (let i = 0; i < vrows; i++) {
      for (let j = 0; j < urows; j++) {
        let sum = 0;
        for (let k = 0; k < ucols; k++) {
          sum += X[i][k] * U[j][k];
        }
        Y[i][j] = sum;
      }
    }

    return Y;
  }

  /**
   *
   * @return {number}
   */
  get condition() {
    return this.s[0] / this.s[Math.min(this.m, this.n) - 1];
  }

  /**
   *
   * @return {number}
   */
  get norm2() {
    return this.s[0];
  }

  /**
   *
   * @return {number}
   */
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

  /**
   *
   * @return {Array<number>}
   */
  get diagonal() {
    return this.s;
  }

  /**
   *
   * @return {number}
   */
  get threshold() {
    return Number.EPSILON / 2 * Math.max(this.m, this.n) * this.s[0];
  }

  /**
   *
   * @return {Matrix}
   */
  get leftSingularVectors() {
    if (!Matrix.isMatrix(this.U)) {
      this.U = new Matrix(this.U);
    }
    return this.U;
  }

  /**
   *
   * @return {Matrix}
   */
  get rightSingularVectors() {
    if (!Matrix.isMatrix(this.V)) {
      this.V = new Matrix(this.V);
    }
    return this.V;
  }

  /**
   *
   * @return {Matrix}
   */
  get diagonalMatrix() {
    return Matrix.diag(this.s);
  }
}

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

function sumByRow(matrix) {
  var sum = Matrix.zeros(matrix.rows, 1);
  for (var i = 0; i < matrix.rows; ++i) {
    for (var j = 0; j < matrix.columns; ++j) {
      sum.set(i, 0, sum.get(i, 0) + matrix.get(i, j));
    }
  }
  return sum;
}

function sumByColumn(matrix) {
  var sum = Matrix.zeros(1, matrix.columns);
  for (var i = 0; i < matrix.rows; ++i) {
    for (var j = 0; j < matrix.columns; ++j) {
      sum.set(0, j, sum.get(0, j) + matrix.get(i, j));
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

function checkNumber(name, value) {
  if (typeof value !== 'number') {
    throw new TypeError(`${name} must be a number`);
  }
}

class BaseView extends AbstractMatrix() {
  constructor(matrix, rows, columns) {
    super();
    this.matrix = matrix;
    this.rows = rows;
    this.columns = columns;
  }

  static get [Symbol.species]() {
    return Matrix;
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

class MatrixRowView extends BaseView {
  constructor(matrix, row) {
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

class MatrixColumnView extends BaseView {
  constructor(matrix, column) {
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

function AbstractMatrix(superCtor) {
  if (superCtor === undefined) superCtor = Object;

  /**
   * Real matrix
   * @class Matrix
   * @param {number|Array|Matrix} nRows - Number of rows of the new matrix,
   * 2D array containing the data or Matrix instance to clone
   * @param {number} [nColumns] - Number of columns of the new matrix
   */
  class Matrix extends superCtor {
    static get [Symbol.species]() {
      return this;
    }

    /**
     * Constructs a Matrix with the chosen dimensions from a 1D array
     * @param {number} newRows - Number of rows
     * @param {number} newColumns - Number of columns
     * @param {Array} newData - A 1D array containing data for the matrix
     * @return {Matrix} - The new matrix
     */
    static from1DArray(newRows, newColumns, newData) {
      var length = newRows * newColumns;
      if (length !== newData.length) {
        throw new RangeError('Data length does not match given dimensions');
      }
      var newMatrix = new this(newRows, newColumns);
      for (var row = 0; row < newRows; row++) {
        for (var column = 0; column < newColumns; column++) {
          newMatrix.set(row, column, newData[row * newColumns + column]);
        }
      }
      return newMatrix;
    }

    /**
         * Creates a row vector, a matrix with only one row.
         * @param {Array} newData - A 1D array containing data for the vector
         * @return {Matrix} - The new matrix
         */
    static rowVector(newData) {
      var vector = new this(1, newData.length);
      for (var i = 0; i < newData.length; i++) {
        vector.set(0, i, newData[i]);
      }
      return vector;
    }

    /**
         * Creates a column vector, a matrix with only one column.
         * @param {Array} newData - A 1D array containing data for the vector
         * @return {Matrix} - The new matrix
         */
    static columnVector(newData) {
      var vector = new this(newData.length, 1);
      for (var i = 0; i < newData.length; i++) {
        vector.set(i, 0, newData[i]);
      }
      return vector;
    }

    /**
         * Creates an empty matrix with the given dimensions. Values will be undefined. Same as using new Matrix(rows, columns).
         * @param {number} rows - Number of rows
         * @param {number} columns - Number of columns
         * @return {Matrix} - The new matrix
         */
    static empty(rows, columns) {
      return new this(rows, columns);
    }

    /**
         * Creates a matrix with the given dimensions. Values will be set to zero.
         * @param {number} rows - Number of rows
         * @param {number} columns - Number of columns
         * @return {Matrix} - The new matrix
         */
    static zeros(rows, columns) {
      return this.empty(rows, columns).fill(0);
    }

    /**
         * Creates a matrix with the given dimensions. Values will be set to one.
         * @param {number} rows - Number of rows
         * @param {number} columns - Number of columns
         * @return {Matrix} - The new matrix
         */
    static ones(rows, columns) {
      return this.empty(rows, columns).fill(1);
    }

    /**
         * Creates a matrix with the given dimensions. Values will be randomly set.
         * @param {number} rows - Number of rows
         * @param {number} columns - Number of columns
         * @param {function} [rng=Math.random] - Random number generator
         * @return {Matrix} The new matrix
         */
    static rand(rows, columns, rng) {
      if (rng === undefined) rng = Math.random;
      var matrix = this.empty(rows, columns);
      for (var i = 0; i < rows; i++) {
        for (var j = 0; j < columns; j++) {
          matrix.set(i, j, rng());
        }
      }
      return matrix;
    }

    /**
         * Creates a matrix with the given dimensions. Values will be random integers.
         * @param {number} rows - Number of rows
         * @param {number} columns - Number of columns
         * @param {number} [maxValue=1000] - Maximum value
         * @param {function} [rng=Math.random] - Random number generator
         * @return {Matrix} The new matrix
         */
    static randInt(rows, columns, maxValue, rng) {
      if (maxValue === undefined) maxValue = 1000;
      if (rng === undefined) rng = Math.random;
      var matrix = this.empty(rows, columns);
      for (var i = 0; i < rows; i++) {
        for (var j = 0; j < columns; j++) {
          var value = Math.floor(rng() * maxValue);
          matrix.set(i, j, value);
        }
      }
      return matrix;
    }

    /**
         * Creates an identity matrix with the given dimension. Values of the diagonal will be 1 and others will be 0.
         * @param {number} rows - Number of rows
         * @param {number} [columns=rows] - Number of columns
         * @param {number} [value=1] - Value to fill the diagonal with
         * @return {Matrix} - The new identity matrix
         */
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

    /**
         * Creates a diagonal matrix based on the given array.
         * @param {Array} data - Array containing the data for the diagonal
         * @param {number} [rows] - Number of rows (Default: data.length)
         * @param {number} [columns] - Number of columns (Default: rows)
         * @return {Matrix} - The new diagonal matrix
         */
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

    /**
         * Returns a matrix whose elements are the minimum between matrix1 and matrix2
         * @param {Matrix} matrix1
         * @param {Matrix} matrix2
         * @return {Matrix}
         */
    static min(matrix1, matrix2) {
      matrix1 = this.checkMatrix(matrix1);
      matrix2 = this.checkMatrix(matrix2);
      var rows = matrix1.rows;
      var columns = matrix1.columns;
      var result = new this(rows, columns);
      for (var i = 0; i < rows; i++) {
        for (var j = 0; j < columns; j++) {
          result.set(i, j, Math.min(matrix1.get(i, j), matrix2.get(i, j)));
        }
      }
      return result;
    }

    /**
         * Returns a matrix whose elements are the maximum between matrix1 and matrix2
         * @param {Matrix} matrix1
         * @param {Matrix} matrix2
         * @return {Matrix}
         */
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

    /**
         * Check that the provided value is a Matrix and tries to instantiate one if not
         * @param {*} value - The value to check
         * @return {Matrix}
         */
    static checkMatrix(value) {
      return Matrix.isMatrix(value) ? value : new this(value);
    }

    /**
         * Returns true if the argument is a Matrix, false otherwise
         * @param {*} value - The value to check
         * @return {boolean}
         */
    static isMatrix(value) {
      return (value != null) && (value.klass === 'Matrix');
    }

    /**
         * @prop {number} size - The number of elements in the matrix.
         */
    get size() {
      return this.rows * this.columns;
    }

    /**
         * Applies a callback for each element of the matrix. The function is called in the matrix (this) context.
         * @param {function} callback - Function that will be called with two parameters : i (row) and j (column)
         * @return {Matrix} this
         */
    apply(callback) {
      if (typeof callback !== 'function') {
        throw new TypeError('callback must be a function');
      }
      var ii = this.rows;
      var jj = this.columns;
      for (var i = 0; i < ii; i++) {
        for (var j = 0; j < jj; j++) {
          callback.call(this, i, j);
        }
      }
      return this;
    }

    /**
         * Returns a new 1D array filled row by row with the matrix values
         * @return {Array}
         */
    to1DArray() {
      var array = new Array(this.size);
      for (var i = 0; i < this.rows; i++) {
        for (var j = 0; j < this.columns; j++) {
          array[i * this.columns + j] = this.get(i, j);
        }
      }
      return array;
    }

    /**
         * Returns a 2D array containing a copy of the data
         * @return {Array}
         */
    to2DArray() {
      var copy = new Array(this.rows);
      for (var i = 0; i < this.rows; i++) {
        copy[i] = new Array(this.columns);
        for (var j = 0; j < this.columns; j++) {
          copy[i][j] = this.get(i, j);
        }
      }
      return copy;
    }

    /**
         * @return {boolean} true if the matrix has one row
         */
    isRowVector() {
      return this.rows === 1;
    }

    /**
         * @return {boolean} true if the matrix has one column
         */
    isColumnVector() {
      return this.columns === 1;
    }

    /**
         * @return {boolean} true if the matrix has one row or one column
         */
    isVector() {
      return (this.rows === 1) || (this.columns === 1);
    }

    /**
         * @return {boolean} true if the matrix has the same number of rows and columns
         */
    isSquare() {
      return this.rows === this.columns;
    }

    /**
         * @return {boolean} true if the matrix is square and has the same values on both sides of the diagonal
         */
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

    /**
          * @return true if the matrix is in echelon form
          */
    isEchelonForm() {
      let i = 0;
      let j = 0;
      let previousColumn = -1;
      let isEchelonForm = true;
      let checked = false;
      while ((i < this.rows) && (isEchelonForm)) {
        j = 0;
        checked = false;
        while ((j < this.columns) && (checked === false)) {
          if (this.get(i, j) === 0) {
            j++;
          } else if ((this.get(i, j) === 1) && (j > previousColumn)) {
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

    /**
             * @return true if the matrix is in reduced echelon form
             */
    isReducedEchelonForm() {
      let i = 0;
      let j = 0;
      let previousColumn = -1;
      let isReducedEchelonForm = true;
      let checked = false;
      while ((i < this.rows) && (isReducedEchelonForm)) {
        j = 0;
        checked = false;
        while ((j < this.columns) && (checked === false)) {
          if (this.get(i, j) === 0) {
            j++;
          } else if ((this.get(i, j) === 1) && (j > previousColumn)) {
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

    /**
         * Sets a given element of the matrix. mat.set(3,4,1) is equivalent to mat[3][4]=1
         * @abstract
         * @param {number} rowIndex - Index of the row
         * @param {number} columnIndex - Index of the column
         * @param {number} value - The new value for the element
         * @return {Matrix} this
         */
    set(rowIndex, columnIndex, value) { // eslint-disable-line no-unused-vars
      throw new Error('set method is unimplemented');
    }

    /**
         * Returns the given element of the matrix. mat.get(3,4) is equivalent to matrix[3][4]
         * @abstract
         * @param {number} rowIndex - Index of the row
         * @param {number} columnIndex - Index of the column
         * @return {number}
         */
    get(rowIndex, columnIndex) { // eslint-disable-line no-unused-vars
      throw new Error('get method is unimplemented');
    }

    /**
         * Creates a new matrix that is a repetition of the current matrix. New matrix has rowRep times the number of
         * rows of the matrix, and colRep times the number of columns of the matrix
         * @param {number} rowRep - Number of times the rows should be repeated
         * @param {number} colRep - Number of times the columns should be re
         * @return {Matrix}
         * @example
         * var matrix = new Matrix([[1,2]]);
         * matrix.repeat(2); // [[1,2],[1,2]]
         */
    repeat(rowRep, colRep) {
      rowRep = rowRep || 1;
      colRep = colRep || 1;
      var matrix = new this.constructor[Symbol.species](this.rows * rowRep, this.columns * colRep);
      for (var i = 0; i < rowRep; i++) {
        for (var j = 0; j < colRep; j++) {
          matrix.setSubMatrix(this, this.rows * i, this.columns * j);
        }
      }
      return matrix;
    }

    /**
         * Fills the matrix with a given value. All elements will be set to this value.
         * @param {number} value - New value
         * @return {Matrix} this
         */
    fill(value) {
      for (var i = 0; i < this.rows; i++) {
        for (var j = 0; j < this.columns; j++) {
          this.set(i, j, value);
        }
      }
      return this;
    }

    /**
         * Negates the matrix. All elements will be multiplied by (-1)
         * @return {Matrix} this
         */
    neg() {
      return this.mulS(-1);
    }

    /**
         * Returns a new array from the given row index
         * @param {number} index - Row index
         * @return {Array}
         */
    getRow(index) {
      checkRowIndex(this, index);
      var row = new Array(this.columns);
      for (var i = 0; i < this.columns; i++) {
        row[i] = this.get(index, i);
      }
      return row;
    }

    /**
         * Returns a new row vector from the given row index
         * @param {number} index - Row index
         * @return {Matrix}
         */
    getRowVector(index) {
      return this.constructor.rowVector(this.getRow(index));
    }

    /**
         * Sets a row at the given index
         * @param {number} index - Row index
         * @param {Array|Matrix} array - Array or vector
         * @return {Matrix} this
         */
    setRow(index, array) {
      checkRowIndex(this, index);
      array = checkRowVector(this, array);
      for (var i = 0; i < this.columns; i++) {
        this.set(index, i, array[i]);
      }
      return this;
    }

    /**
         * Swaps two rows
         * @param {number} row1 - First row index
         * @param {number} row2 - Second row index
         * @return {Matrix} this
         */
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

    /**
         * Returns a new array from the given column index
         * @param {number} index - Column index
         * @return {Array}
         */
    getColumn(index) {
      checkColumnIndex(this, index);
      var column = new Array(this.rows);
      for (var i = 0; i < this.rows; i++) {
        column[i] = this.get(i, index);
      }
      return column;
    }

    /**
         * Returns a new column vector from the given column index
         * @param {number} index - Column index
         * @return {Matrix}
         */
    getColumnVector(index) {
      return this.constructor.columnVector(this.getColumn(index));
    }

    /**
         * Sets a column at the given index
         * @param {number} index - Column index
         * @param {Array|Matrix} array - Array or vector
         * @return {Matrix} this
         */
    setColumn(index, array) {
      checkColumnIndex(this, index);
      array = checkColumnVector(this, array);
      for (var i = 0; i < this.rows; i++) {
        this.set(i, index, array[i]);
      }
      return this;
    }

    /**
         * Swaps two columns
         * @param {number} column1 - First column index
         * @param {number} column2 - Second column index
         * @return {Matrix} this
         */
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

    /**
         * Adds the values of a vector to each row
         * @param {Array|Matrix} vector - Array or vector
         * @return {Matrix} this
         */
    addRowVector(vector) {
      vector = checkRowVector(this, vector);
      for (var i = 0; i < this.rows; i++) {
        for (var j = 0; j < this.columns; j++) {
          this.set(i, j, this.get(i, j) + vector[j]);
        }
      }
      return this;
    }

    /**
         * Subtracts the values of a vector from each row
         * @param {Array|Matrix} vector - Array or vector
         * @return {Matrix} this
         */
    subRowVector(vector) {
      vector = checkRowVector(this, vector);
      for (var i = 0; i < this.rows; i++) {
        for (var j = 0; j < this.columns; j++) {
          this.set(i, j, this.get(i, j) - vector[j]);
        }
      }
      return this;
    }

    /**
         * Multiplies the values of a vector with each row
         * @param {Array|Matrix} vector - Array or vector
         * @return {Matrix} this
         */
    mulRowVector(vector) {
      vector = checkRowVector(this, vector);
      for (var i = 0; i < this.rows; i++) {
        for (var j = 0; j < this.columns; j++) {
          this.set(i, j, this.get(i, j) * vector[j]);
        }
      }
      return this;
    }

    /**
         * Divides the values of each row by those of a vector
         * @param {Array|Matrix} vector - Array or vector
         * @return {Matrix} this
         */
    divRowVector(vector) {
      vector = checkRowVector(this, vector);
      for (var i = 0; i < this.rows; i++) {
        for (var j = 0; j < this.columns; j++) {
          this.set(i, j, this.get(i, j) / vector[j]);
        }
      }
      return this;
    }

    /**
         * Adds the values of a vector to each column
         * @param {Array|Matrix} vector - Array or vector
         * @return {Matrix} this
         */
    addColumnVector(vector) {
      vector = checkColumnVector(this, vector);
      for (var i = 0; i < this.rows; i++) {
        for (var j = 0; j < this.columns; j++) {
          this.set(i, j, this.get(i, j) + vector[i]);
        }
      }
      return this;
    }

    /**
         * Subtracts the values of a vector from each column
         * @param {Array|Matrix} vector - Array or vector
         * @return {Matrix} this
         */
    subColumnVector(vector) {
      vector = checkColumnVector(this, vector);
      for (var i = 0; i < this.rows; i++) {
        for (var j = 0; j < this.columns; j++) {
          this.set(i, j, this.get(i, j) - vector[i]);
        }
      }
      return this;
    }

    /**
         * Multiplies the values of a vector with each column
         * @param {Array|Matrix} vector - Array or vector
         * @return {Matrix} this
         */
    mulColumnVector(vector) {
      vector = checkColumnVector(this, vector);
      for (var i = 0; i < this.rows; i++) {
        for (var j = 0; j < this.columns; j++) {
          this.set(i, j, this.get(i, j) * vector[i]);
        }
      }
      return this;
    }

    /**
         * Divides the values of each column by those of a vector
         * @param {Array|Matrix} vector - Array or vector
         * @return {Matrix} this
         */
    divColumnVector(vector) {
      vector = checkColumnVector(this, vector);
      for (var i = 0; i < this.rows; i++) {
        for (var j = 0; j < this.columns; j++) {
          this.set(i, j, this.get(i, j) / vector[i]);
        }
      }
      return this;
    }

    /**
         * Multiplies the values of a row with a scalar
         * @param {number} index - Row index
         * @param {number} value
         * @return {Matrix} this
         */
    mulRow(index, value) {
      checkRowIndex(this, index);
      for (var i = 0; i < this.columns; i++) {
        this.set(index, i, this.get(index, i) * value);
      }
      return this;
    }

    /**
         * Multiplies the values of a column with a scalar
         * @param {number} index - Column index
         * @param {number} value
         * @return {Matrix} this
         */
    mulColumn(index, value) {
      checkColumnIndex(this, index);
      for (var i = 0; i < this.rows; i++) {
        this.set(i, index, this.get(i, index) * value);
      }
      return this;
    }

    /**
         * Returns the maximum value of the matrix
         * @return {number}
         */
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

    /**
         * Returns the index of the maximum value
         * @return {Array}
         */
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

    /**
         * Returns the minimum value of the matrix
         * @return {number}
         */
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

    /**
         * Returns the index of the minimum value
         * @return {Array}
         */
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

    /**
         * Returns the maximum value of one row
         * @param {number} row - Row index
         * @return {number}
         */
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

    /**
         * Returns the index of the maximum value of one row
         * @param {number} row - Row index
         * @return {Array}
         */
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

    /**
         * Returns the minimum value of one row
         * @param {number} row - Row index
         * @return {number}
         */
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

    /**
         * Returns the index of the maximum value of one row
         * @param {number} row - Row index
         * @return {Array}
         */
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

    /**
         * Returns the maximum value of one column
         * @param {number} column - Column index
         * @return {number}
         */
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

    /**
         * Returns the index of the maximum value of one column
         * @param {number} column - Column index
         * @return {Array}
         */
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

    /**
         * Returns the minimum value of one column
         * @param {number} column - Column index
         * @return {number}
         */
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

    /**
         * Returns the index of the minimum value of one column
         * @param {number} column - Column index
         * @return {Array}
         */
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

    /**
         * Returns an array containing the diagonal values of the matrix
         * @return {Array}
         */
    diag() {
      var min = Math.min(this.rows, this.columns);
      var diag = new Array(min);
      for (var i = 0; i < min; i++) {
        diag[i] = this.get(i, i);
      }
      return diag;
    }

    /**
         * Returns the sum by the argument given, if no argument given,
         * it returns the sum of all elements of the matrix.
         * @param {string} by - sum by 'row' or 'column'.
         * @return {Matrix|number}
         */
    sum(by) {
      switch (by) {
        case 'row':
          return sumByRow(this);
        case 'column':
          return sumByColumn(this);
        default:
          return sumAll(this);
      }
    }

    /**
         * Returns the mean of all elements of the matrix
         * @return {number}
         */
    mean() {
      return this.sum() / this.size;
    }

    /**
         * Returns the product of all elements of the matrix
         * @return {number}
         */
    prod() {
      var prod = 1;
      for (var i = 0; i < this.rows; i++) {
        for (var j = 0; j < this.columns; j++) {
          prod *= this.get(i, j);
        }
      }
      return prod;
    }

    /**
         * Returns the norm of a matrix.
         * @param {string} type - "frobenius" (default) or "max" return resp. the Frobenius norm and the max norm.
         * @return {number}
         */
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

    /**
         * Computes the cumulative sum of the matrix elements (in place, row by row)
         * @return {Matrix} this
         */
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

    /**
         * Computes the dot (scalar) product between the matrix and another
         * @param {Matrix} vector2 vector
         * @return {number}
         */
    dot(vector2) {
      if (Matrix.isMatrix(vector2)) vector2 = vector2.to1DArray();
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

    /**
         * Returns the matrix product between this and other
         * @param {Matrix} other
         * @return {Matrix}
         */
    mmul(other) {
      other = this.constructor.checkMatrix(other);
      if (this.columns !== other.rows) {
        // eslint-disable-next-line no-console
        console.warn('Number of columns of left matrix are not equal to number of rows of right matrix.');
      }

      var m = this.rows;
      var n = this.columns;
      var p = other.columns;

      var result = new this.constructor[Symbol.species](m, p);

      var Bcolj = new Array(n);
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
      var result = new this.constructor[Symbol.species](2, 2);
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
      var result = new this.constructor[Symbol.species](3, 3);

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

    /**
         * Returns the matrix product between x and y. More efficient than mmul(other) only when we multiply squared matrix and when the size of the matrix is > 1000.
         * @param {Matrix} y
         * @return {Matrix}
         */
    mmulStrassen(y) {
      var x = this.clone();
      var r1 = x.rows;
      var c1 = x.columns;
      var r2 = y.rows;
      var c2 = y.columns;
      if (c1 !== r2) {
        // eslint-disable-next-line no-console
        console.warn(`Multiplying ${r1} x ${c1} and ${r2} x ${c2} matrix: dimensions do not match.`);
      }

      // Put a matrix into the top left of a matrix of zeros.
      // `rows` and `cols` are the dimensions of the output matrix.
      function embed(mat, rows, cols) {
        var r = mat.rows;
        var c = mat.columns;
        if ((r === rows) && (c === cols)) {
          return mat;
        } else {
          var resultat = Matrix.zeros(rows, cols);
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
        if ((rows % 2 === 1) && (cols % 2 === 1)) {
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
        var m1 = blockMult(Matrix.add(a11, a22), Matrix.add(b11, b22), halfRows, halfCols);
        var m2 = blockMult(Matrix.add(a21, a22), b11, halfRows, halfCols);
        var m3 = blockMult(a11, Matrix.sub(b12, b22), halfRows, halfCols);
        var m4 = blockMult(a22, Matrix.sub(b21, b11), halfRows, halfCols);
        var m5 = blockMult(Matrix.add(a11, a12), b22, halfRows, halfCols);
        var m6 = blockMult(Matrix.sub(a21, a11), Matrix.add(b11, b12), halfRows, halfCols);
        var m7 = blockMult(Matrix.sub(a12, a22), Matrix.add(b21, b22), halfRows, halfCols);

        // Combine intermediate values into the output.
        var c11 = Matrix.add(m1, m4);
        c11.sub(m5);
        c11.add(m7);
        var c12 = Matrix.add(m3, m5);
        var c21 = Matrix.add(m2, m4);
        var c22 = Matrix.sub(m1, m2);
        c22.add(m3);
        c22.add(m6);

        // Crop output to the desired size (undo dynamic padding).
        var resultat = Matrix.zeros(2 * c11.rows, 2 * c11.columns);
        resultat = resultat.setSubMatrix(c11, 0, 0);
        resultat = resultat.setSubMatrix(c12, c11.rows, 0);
        resultat = resultat.setSubMatrix(c21, 0, c11.columns);
        resultat = resultat.setSubMatrix(c22, c11.rows, c11.columns);
        return resultat.subMatrix(0, rows - 1, 0, cols - 1);
      }
      return blockMult(x, y, r, c);
    }

    /**
         * Returns a row-by-row scaled matrix
         * @param {number} [min=0] - Minimum scaled value
         * @param {number} [max=1] - Maximum scaled value
         * @return {Matrix} - The scaled matrix
         */
    scaleRows(min, max) {
      min = min === undefined ? 0 : min;
      max = max === undefined ? 1 : max;
      if (min >= max) {
        throw new RangeError('min should be strictly smaller than max');
      }
      var newMatrix = this.constructor.empty(this.rows, this.columns);
      for (var i = 0; i < this.rows; i++) {
        var scaled = rescale(this.getRow(i), { min, max });
        newMatrix.setRow(i, scaled);
      }
      return newMatrix;
    }

    /**
         * Returns a new column-by-column scaled matrix
         * @param {number} [min=0] - Minimum scaled value
         * @param {number} [max=1] - Maximum scaled value
         * @return {Matrix} - The new scaled matrix
         * @example
         * var matrix = new Matrix([[1,2],[-1,0]]);
         * var scaledMatrix = matrix.scaleColumns(); // [[1,1],[0,0]]
         */
    scaleColumns(min, max) {
      min = min === undefined ? 0 : min;
      max = max === undefined ? 1 : max;
      if (min >= max) {
        throw new RangeError('min should be strictly smaller than max');
      }
      var newMatrix = this.constructor.empty(this.rows, this.columns);
      for (var i = 0; i < this.columns; i++) {
        var scaled = rescale(this.getColumn(i), {
          min: min,
          max: max
        });
        newMatrix.setColumn(i, scaled);
      }
      return newMatrix;
    }


    /**
         * Returns the Kronecker product (also known as tensor product) between this and other
         * See https://en.wikipedia.org/wiki/Kronecker_product
         * @param {Matrix} other
         * @return {Matrix}
         */
    kroneckerProduct(other) {
      other = this.constructor.checkMatrix(other);

      var m = this.rows;
      var n = this.columns;
      var p = other.rows;
      var q = other.columns;

      var result = new this.constructor[Symbol.species](m * p, n * q);
      for (var i = 0; i < m; i++) {
        for (var j = 0; j < n; j++) {
          for (var k = 0; k < p; k++) {
            for (var l = 0; l < q; l++) {
              result[p * i + k][q * j + l] = this.get(i, j) * other.get(k, l);
            }
          }
        }
      }
      return result;
    }

    /**
         * Transposes the matrix and returns a new one containing the result
         * @return {Matrix}
         */
    transpose() {
      var result = new this.constructor[Symbol.species](this.columns, this.rows);
      for (var i = 0; i < this.rows; i++) {
        for (var j = 0; j < this.columns; j++) {
          result.set(j, i, this.get(i, j));
        }
      }
      return result;
    }

    /**
         * Sorts the rows (in place)
         * @param {function} compareFunction - usual Array.prototype.sort comparison function
         * @return {Matrix} this
         */
    sortRows(compareFunction) {
      if (compareFunction === undefined) compareFunction = compareNumbers;
      for (var i = 0; i < this.rows; i++) {
        this.setRow(i, this.getRow(i).sort(compareFunction));
      }
      return this;
    }

    /**
         * Sorts the columns (in place)
         * @param {function} compareFunction - usual Array.prototype.sort comparison function
         * @return {Matrix} this
         */
    sortColumns(compareFunction) {
      if (compareFunction === undefined) compareFunction = compareNumbers;
      for (var i = 0; i < this.columns; i++) {
        this.setColumn(i, this.getColumn(i).sort(compareFunction));
      }
      return this;
    }

    /**
         * Returns a subset of the matrix
         * @param {number} startRow - First row index
         * @param {number} endRow - Last row index
         * @param {number} startColumn - First column index
         * @param {number} endColumn - Last column index
         * @return {Matrix}
         */
    subMatrix(startRow, endRow, startColumn, endColumn) {
      checkRange(this, startRow, endRow, startColumn, endColumn);
      var newMatrix = new this.constructor[Symbol.species](endRow - startRow + 1, endColumn - startColumn + 1);
      for (var i = startRow; i <= endRow; i++) {
        for (var j = startColumn; j <= endColumn; j++) {
          newMatrix[i - startRow][j - startColumn] = this.get(i, j);
        }
      }
      return newMatrix;
    }

    /**
         * Returns a subset of the matrix based on an array of row indices
         * @param {Array} indices - Array containing the row indices
         * @param {number} [startColumn = 0] - First column index
         * @param {number} [endColumn = this.columns-1] - Last column index
         * @return {Matrix}
         */
    subMatrixRow(indices, startColumn, endColumn) {
      if (startColumn === undefined) startColumn = 0;
      if (endColumn === undefined) endColumn = this.columns - 1;
      if ((startColumn > endColumn) || (startColumn < 0) || (startColumn >= this.columns) || (endColumn < 0) || (endColumn >= this.columns)) {
        throw new RangeError('Argument out of range');
      }

      var newMatrix = new this.constructor[Symbol.species](indices.length, endColumn - startColumn + 1);
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

    /**
         * Returns a subset of the matrix based on an array of column indices
         * @param {Array} indices - Array containing the column indices
         * @param {number} [startRow = 0] - First row index
         * @param {number} [endRow = this.rows-1] - Last row index
         * @return {Matrix}
         */
    subMatrixColumn(indices, startRow, endRow) {
      if (startRow === undefined) startRow = 0;
      if (endRow === undefined) endRow = this.rows - 1;
      if ((startRow > endRow) || (startRow < 0) || (startRow >= this.rows) || (endRow < 0) || (endRow >= this.rows)) {
        throw new RangeError('Argument out of range');
      }

      var newMatrix = new this.constructor[Symbol.species](endRow - startRow + 1, indices.length);
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

    /**
         * Set a part of the matrix to the given sub-matrix
         * @param {Matrix|Array< Array >} matrix - The source matrix from which to extract values.
         * @param {number} startRow - The index of the first row to set
         * @param {number} startColumn - The index of the first column to set
         * @return {Matrix}
         */
    setSubMatrix(matrix, startRow, startColumn) {
      matrix = this.constructor.checkMatrix(matrix);
      var endRow = startRow + matrix.rows - 1;
      var endColumn = startColumn + matrix.columns - 1;
      checkRange(this, startRow, endRow, startColumn, endColumn);
      for (var i = 0; i < matrix.rows; i++) {
        for (var j = 0; j < matrix.columns; j++) {
          this[startRow + i][startColumn + j] = matrix.get(i, j);
        }
      }
      return this;
    }

    /**
         * Return a new matrix based on a selection of rows and columns
         * @param {Array<number>} rowIndices - The row indices to select. Order matters and an index can be more than once.
         * @param {Array<number>} columnIndices - The column indices to select. Order matters and an index can be use more than once.
         * @return {Matrix} The new matrix
         */
    selection(rowIndices, columnIndices) {
      var indices = checkIndices(this, rowIndices, columnIndices);
      var newMatrix = new this.constructor[Symbol.species](rowIndices.length, columnIndices.length);
      for (var i = 0; i < indices.row.length; i++) {
        var rowIndex = indices.row[i];
        for (var j = 0; j < indices.column.length; j++) {
          var columnIndex = indices.column[j];
          newMatrix[i][j] = this.get(rowIndex, columnIndex);
        }
      }
      return newMatrix;
    }

    /**
         * Returns the trace of the matrix (sum of the diagonal elements)
         * @return {number}
         */
    trace() {
      var min = Math.min(this.rows, this.columns);
      var trace = 0;
      for (var i = 0; i < min; i++) {
        trace += this.get(i, i);
      }
      return trace;
    }

    /*
         Matrix views
         */

    /**
         * Returns a view of the transposition of the matrix
         * @return {MatrixTransposeView}
         */
    transposeView() {
      return new MatrixTransposeView(this);
    }

    /**
         * Returns a view of the row vector with the given index
         * @param {number} row - row index of the vector
         * @return {MatrixRowView}
         */
    rowView(row) {
      checkRowIndex(this, row);
      return new MatrixRowView(this, row);
    }

    /**
         * Returns a view of the column vector with the given index
         * @param {number} column - column index of the vector
         * @return {MatrixColumnView}
         */
    columnView(column) {
      checkColumnIndex(this, column);
      return new MatrixColumnView(this, column);
    }

    /**
         * Returns a view of the matrix flipped in the row axis
         * @return {MatrixFlipRowView}
         */
    flipRowView() {
      return new MatrixFlipRowView(this);
    }

    /**
         * Returns a view of the matrix flipped in the column axis
         * @return {MatrixFlipColumnView}
         */
    flipColumnView() {
      return new MatrixFlipColumnView(this);
    }

    /**
         * Returns a view of a submatrix giving the index boundaries
         * @param {number} startRow - first row index of the submatrix
         * @param {number} endRow - last row index of the submatrix
         * @param {number} startColumn - first column index of the submatrix
         * @param {number} endColumn - last column index of the submatrix
         * @return {MatrixSubView}
         */
    subMatrixView(startRow, endRow, startColumn, endColumn) {
      return new MatrixSubView(this, startRow, endRow, startColumn, endColumn);
    }

    /**
         * Returns a view of the cross of the row indices and the column indices
         * @example
         * // resulting vector is [[2], [2]]
         * var matrix = new Matrix([[1,2,3], [4,5,6]]).selectionView([0, 0], [1])
         * @param {Array<number>} rowIndices
         * @param {Array<number>} columnIndices
         * @return {MatrixSelectionView}
         */
    selectionView(rowIndices, columnIndices) {
      return new MatrixSelectionView(this, rowIndices, columnIndices);
    }

    /**
         * Returns a view of the row indices
         * @example
         * // resulting vector is [[1,2,3], [1,2,3]]
         * var matrix = new Matrix([[1,2,3], [4,5,6]]).rowSelectionView([0, 0])
         * @param {Array<number>} rowIndices
         * @return {MatrixRowSelectionView}
         */
    rowSelectionView(rowIndices) {
      return new MatrixRowSelectionView(this, rowIndices);
    }

    /**
         * Returns a view of the column indices
         * @example
         * // resulting vector is [[2, 2], [5, 5]]
         * var matrix = new Matrix([[1,2,3], [4,5,6]]).columnSelectionView([1, 1])
         * @param {Array<number>} columnIndices
         * @return {MatrixColumnSelectionView}
         */
    columnSelectionView(columnIndices) {
      return new MatrixColumnSelectionView(this, columnIndices);
    }


    /**
        * Calculates and returns the determinant of a matrix as a Number
        * @example
        *   new Matrix([[1,2,3], [4,5,6]]).det()
        * @return {number}
        */
    det() {
      if (this.isSquare()) {
        var a, b, c, d;
        if (this.columns === 2) {
          // 2 x 2 matrix
          a = this.get(0, 0);
          b = this.get(0, 1);
          c = this.get(1, 0);
          d = this.get(1, 1);

          return a * d - (b * c);
        } else if (this.columns === 3) {
          // 3 x 3 matrix
          var subMatrix0, subMatrix1, subMatrix2;
          subMatrix0 = this.selectionView([1, 2], [1, 2]);
          subMatrix1 = this.selectionView([1, 2], [0, 2]);
          subMatrix2 = this.selectionView([1, 2], [0, 1]);
          a = this.get(0, 0);
          b = this.get(0, 1);
          c = this.get(0, 2);

          return a * subMatrix0.det() - b * subMatrix1.det() + c * subMatrix2.det();
        } else {
          // general purpose determinant using the LU decomposition
          return new LuDecomposition(this).determinant;
        }
      } else {
        throw Error('Determinant can only be calculated for a square matrix.');
      }
    }

    /**
         * Returns inverse of a matrix if it exists or the pseudoinverse
         * @param {number} threshold - threshold for taking inverse of singular values (default = 1e-15)
         * @return {Matrix} the (pseudo)inverted matrix.
         */
    pseudoInverse(threshold) {
      if (threshold === undefined) threshold = Number.EPSILON;
      var svdSolution = new SingularValueDecomposition(this, { autoTranspose: true });

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

      // convert list to diagonal
      s = this.constructor[Symbol.species].diag(s);
      return V.mmul(s.mmul(U.transposeView()));
    }

    /**
         * Creates an exact and independent copy of the matrix
         * @return {Matrix}
         */
    clone() {
      var newMatrix = new this.constructor[Symbol.species](this.rows, this.columns);
      for (var row = 0; row < this.rows; row++) {
        for (var column = 0; column < this.columns; column++) {
          newMatrix.set(row, column, this.get(row, column));
        }
      }
      return newMatrix;
    }
  }

  Matrix.prototype.klass = 'Matrix';

  function compareNumbers(a, b) {
    return a - b;
  }

  /*
     Synonyms
     */

  Matrix.random = Matrix.rand;
  Matrix.diagonal = Matrix.diag;
  Matrix.prototype.diagonal = Matrix.prototype.diag;
  Matrix.identity = Matrix.eye;
  Matrix.prototype.negate = Matrix.prototype.neg;
  Matrix.prototype.tensorProduct = Matrix.prototype.kroneckerProduct;
  Matrix.prototype.determinant = Matrix.prototype.det;

  /*
     Add dynamically instance and static methods for mathematical operations
     */

  var inplaceOperator = `
(function %name%(value) {
    if (typeof value === 'number') return this.%name%S(value);
    return this.%name%M(value);
})
`;

  var inplaceOperatorScalar = `
(function %name%S(value) {
    for (var i = 0; i < this.rows; i++) {
        for (var j = 0; j < this.columns; j++) {
            this.set(i, j, this.get(i, j) %op% value);
        }
    }
    return this;
})
`;

  var inplaceOperatorMatrix = `
(function %name%M(matrix) {
    matrix = this.constructor.checkMatrix(matrix);
    if (this.rows !== matrix.rows ||
        this.columns !== matrix.columns) {
        throw new RangeError('Matrices dimensions must be equal');
    }
    for (var i = 0; i < this.rows; i++) {
        for (var j = 0; j < this.columns; j++) {
            this.set(i, j, this.get(i, j) %op% matrix.get(i, j));
        }
    }
    return this;
})
`;

  var staticOperator = `
(function %name%(matrix, value) {
    var newMatrix = new this[Symbol.species](matrix);
    return newMatrix.%name%(value);
})
`;

  var inplaceMethod = `
(function %name%() {
    for (var i = 0; i < this.rows; i++) {
        for (var j = 0; j < this.columns; j++) {
            this.set(i, j, %method%(this.get(i, j)));
        }
    }
    return this;
})
`;

  var staticMethod = `
(function %name%(matrix) {
    var newMatrix = new this[Symbol.species](matrix);
    return newMatrix.%name%();
})
`;

  var inplaceMethodWithArgs = `
(function %name%(%args%) {
    for (var i = 0; i < this.rows; i++) {
        for (var j = 0; j < this.columns; j++) {
            this.set(i, j, %method%(this.get(i, j), %args%));
        }
    }
    return this;
})
`;

  var staticMethodWithArgs = `
(function %name%(matrix, %args%) {
    var newMatrix = new this[Symbol.species](matrix);
    return newMatrix.%name%(%args%);
})
`;


  var inplaceMethodWithOneArgScalar = `
(function %name%S(value) {
    for (var i = 0; i < this.rows; i++) {
        for (var j = 0; j < this.columns; j++) {
            this.set(i, j, %method%(this.get(i, j), value));
        }
    }
    return this;
})
`;
  var inplaceMethodWithOneArgMatrix = `
(function %name%M(matrix) {
    matrix = this.constructor.checkMatrix(matrix);
    if (this.rows !== matrix.rows ||
        this.columns !== matrix.columns) {
        throw new RangeError('Matrices dimensions must be equal');
    }
    for (var i = 0; i < this.rows; i++) {
        for (var j = 0; j < this.columns; j++) {
            this.set(i, j, %method%(this.get(i, j), matrix.get(i, j)));
        }
    }
    return this;
})
`;

  var inplaceMethodWithOneArg = `
(function %name%(value) {
    if (typeof value === 'number') return this.%name%S(value);
    return this.%name%M(value);
})
`;

  var staticMethodWithOneArg = staticMethodWithArgs;

  var operators = [
    // Arithmetic operators
    ['+', 'add'],
    ['-', 'sub', 'subtract'],
    ['*', 'mul', 'multiply'],
    ['/', 'div', 'divide'],
    ['%', 'mod', 'modulus'],
    // Bitwise operators
    ['&', 'and'],
    ['|', 'or'],
    ['^', 'xor'],
    ['<<', 'leftShift'],
    ['>>', 'signPropagatingRightShift'],
    ['>>>', 'rightShift', 'zeroFillRightShift']
  ];

  var i;
  var eval2 = eval; // eslint-disable-line no-eval
  for (var operator of operators) {
    var inplaceOp = eval2(fillTemplateFunction(inplaceOperator, { name: operator[1], op: operator[0] }));
    var inplaceOpS = eval2(fillTemplateFunction(inplaceOperatorScalar, { name: `${operator[1]}S`, op: operator[0] }));
    var inplaceOpM = eval2(fillTemplateFunction(inplaceOperatorMatrix, { name: `${operator[1]}M`, op: operator[0] }));
    var staticOp = eval2(fillTemplateFunction(staticOperator, { name: operator[1] }));
    for (i = 1; i < operator.length; i++) {
      Matrix.prototype[operator[i]] = inplaceOp;
      Matrix.prototype[`${operator[i]}S`] = inplaceOpS;
      Matrix.prototype[`${operator[i]}M`] = inplaceOpM;
      Matrix[operator[i]] = staticOp;
    }
  }

  var methods = [['~', 'not']];

  [
    'abs', 'acos', 'acosh', 'asin', 'asinh', 'atan', 'atanh', 'cbrt', 'ceil',
    'clz32', 'cos', 'cosh', 'exp', 'expm1', 'floor', 'fround', 'log', 'log1p',
    'log10', 'log2', 'round', 'sign', 'sin', 'sinh', 'sqrt', 'tan', 'tanh', 'trunc'
  ].forEach(function (mathMethod) {
    methods.push([`Math.${mathMethod}`, mathMethod]);
  });

  for (var method of methods) {
    var inplaceMeth = eval2(fillTemplateFunction(inplaceMethod, { name: method[1], method: method[0] }));
    var staticMeth = eval2(fillTemplateFunction(staticMethod, { name: method[1] }));
    for (i = 1; i < method.length; i++) {
      Matrix.prototype[method[i]] = inplaceMeth;
      Matrix[method[i]] = staticMeth;
    }
  }

  var methodsWithArgs = [['Math.pow', 1, 'pow']];

  for (var methodWithArg of methodsWithArgs) {
    var args = 'arg0';
    for (i = 1; i < methodWithArg[1]; i++) {
      args += `, arg${i}`;
    }
    if (methodWithArg[1] !== 1) {
      var inplaceMethWithArgs = eval2(fillTemplateFunction(inplaceMethodWithArgs, {
        name: methodWithArg[2],
        method: methodWithArg[0],
        args: args
      }));
      var staticMethWithArgs = eval2(fillTemplateFunction(staticMethodWithArgs, { name: methodWithArg[2], args: args }));
      for (i = 2; i < methodWithArg.length; i++) {
        Matrix.prototype[methodWithArg[i]] = inplaceMethWithArgs;
        Matrix[methodWithArg[i]] = staticMethWithArgs;
      }
    } else {
      var tmplVar = {
        name: methodWithArg[2],
        args: args,
        method: methodWithArg[0]
      };
      var inplaceMethod2 = eval2(fillTemplateFunction(inplaceMethodWithOneArg, tmplVar));
      var inplaceMethodS = eval2(fillTemplateFunction(inplaceMethodWithOneArgScalar, tmplVar));
      var inplaceMethodM = eval2(fillTemplateFunction(inplaceMethodWithOneArgMatrix, tmplVar));
      var staticMethod2 = eval2(fillTemplateFunction(staticMethodWithOneArg, tmplVar));
      for (i = 2; i < methodWithArg.length; i++) {
        Matrix.prototype[methodWithArg[i]] = inplaceMethod2;
        Matrix.prototype[`${methodWithArg[i]}M`] = inplaceMethodM;
        Matrix.prototype[`${methodWithArg[i]}S`] = inplaceMethodS;
        Matrix[methodWithArg[i]] = staticMethod2;
      }
    }
  }

  function fillTemplateFunction(template, values) {
    for (var value in values) {
      template = template.replace(new RegExp(`%${value}%`, 'g'), values[value]);
    }
    return template;
  }

  return Matrix;
}

class Matrix extends AbstractMatrix(Array) {
  constructor(nRows, nColumns) {
    var i;
    if (arguments.length === 1 && typeof nRows === 'number') {
      return new Array(nRows);
    }
    if (Matrix.isMatrix(nRows)) {
      return nRows.clone();
    } else if (Number.isInteger(nRows) && nRows > 0) {
      // Create an empty matrix
      super(nRows);
      if (Number.isInteger(nColumns) && nColumns > 0) {
        for (i = 0; i < nRows; i++) {
          this[i] = new Array(nColumns);
        }
      } else {
        throw new TypeError('nColumns must be a positive integer');
      }
    } else if (Array.isArray(nRows)) {
      // Copy the values from the 2D array
      const matrix = nRows;
      nRows = matrix.length;
      nColumns = matrix[0].length;
      if (typeof nColumns !== 'number' || nColumns === 0) {
        throw new TypeError(
          'Data must be a 2D array with at least one element'
        );
      }
      super(nRows);
      for (i = 0; i < nRows; i++) {
        if (matrix[i].length !== nColumns) {
          throw new RangeError('Inconsistent array dimensions');
        }
        this[i] = [].concat(matrix[i]);
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
    this[rowIndex][columnIndex] = value;
    return this;
  }

  get(rowIndex, columnIndex) {
    return this[rowIndex][columnIndex];
  }

  /**
   * Removes a row from the given index
   * @param {number} index - Row index
   * @return {Matrix} this
   */
  removeRow(index) {
    checkRowIndex(this, index);
    if (this.rows === 1) {
      throw new RangeError('A matrix cannot have less than one row');
    }
    this.splice(index, 1);
    this.rows -= 1;
    return this;
  }

  /**
   * Adds a row at the given index
   * @param {number} [index = this.rows] - Row index
   * @param {Array|Matrix} array - Array or vector
   * @return {Matrix} this
   */
  addRow(index, array) {
    if (array === undefined) {
      array = index;
      index = this.rows;
    }
    checkRowIndex(this, index, true);
    array = checkRowVector(this, array, true);
    this.splice(index, 0, array);
    this.rows += 1;
    return this;
  }

  /**
   * Removes a column from the given index
   * @param {number} index - Column index
   * @return {Matrix} this
   */
  removeColumn(index) {
    checkColumnIndex(this, index);
    if (this.columns === 1) {
      throw new RangeError('A matrix cannot have less than one column');
    }
    for (var i = 0; i < this.rows; i++) {
      this[i].splice(index, 1);
    }
    this.columns -= 1;
    return this;
  }

  /**
   * Adds a column at the given index
   * @param {number} [index = this.columns] - Column index
   * @param {Array|Matrix} array - Array or vector
   * @return {Matrix} this
   */
  addColumn(index, array) {
    if (typeof array === 'undefined') {
      array = index;
      index = this.columns;
    }
    checkColumnIndex(this, index, true);
    array = checkColumnVector(this, array);
    for (var i = 0; i < this.rows; i++) {
      this[i].splice(index, 0, array[i]);
    }
    this.columns += 1;
    return this;
  }
}

class WrapperMatrix1D extends AbstractMatrix() {
  /**
   * @class WrapperMatrix1D
   * @param {Array<number>} data
   * @param {object} [options]
   * @param {object} [options.rows = 1]
   */
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

  static get [Symbol.species]() {
    return Matrix;
  }
}

class WrapperMatrix2D extends AbstractMatrix() {
  /**
   * @class WrapperMatrix2D
   * @param {Array<Array<number>>} data
   */
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

  static get [Symbol.species]() {
    return Matrix;
  }
}

/**
 * @param {Array<Array<number>>|Array<number>} array
 * @param {object} [options]
 * @param {object} [options.rows = 1]
 * @return {WrapperMatrix1D|WrapperMatrix2D}
 */
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

/**
 * @class QrDecomposition
 * @link https://github.com/lutzroeder/Mapack/blob/master/Source/QrDecomposition.cs
 * @param {Matrix} value
 */
class QrDecomposition {
  constructor(value) {
    value = WrapperMatrix2D.checkMatrix(value);

    var qr = value.clone();
    var m = value.rows;
    var n = value.columns;
    var rdiag = new Array(n);
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

  /**
   * Solve a problem of least square (Ax=b) by using the QR decomposition. Useful when A is rectangular, but not working when A is singular.
   * Example : We search to approximate x, with A matrix shape m*n, x vector size n, b vector size m (m > n). We will use :
   * var qr = QrDecomposition(A);
   * var x = qr.solve(b);
   * @param {Matrix} value - Matrix 1D which is the vector b (in the equation Ax = b)
   * @return {Matrix} - The vector x
   */
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
          s += qr[i][k] * X[i][j];
        }
        s = -s / qr[k][k];
        for (i = k; i < m; i++) {
          X[i][j] += s * qr[i][k];
        }
      }
    }
    for (k = n - 1; k >= 0; k--) {
      for (j = 0; j < count; j++) {
        X[k][j] /= this.Rdiag[k];
      }
      for (i = 0; i < k; i++) {
        for (j = 0; j < count; j++) {
          X[i][j] -= X[k][j] * qr[i][k];
        }
      }
    }

    return X.subMatrix(0, n - 1, 0, count - 1);
  }

  /**
   *
   * @return {boolean}
   */
  isFullRank() {
    var columns = this.QR.columns;
    for (var i = 0; i < columns; i++) {
      if (this.Rdiag[i] === 0) {
        return false;
      }
    }
    return true;
  }

  /**
   *
   * @return {Matrix}
   */
  get upperTriangularMatrix() {
    var qr = this.QR;
    var n = qr.columns;
    var X = new Matrix(n, n);
    var i, j;
    for (i = 0; i < n; i++) {
      for (j = 0; j < n; j++) {
        if (i < j) {
          X[i][j] = qr[i][j];
        } else if (i === j) {
          X[i][j] = this.Rdiag[i];
        } else {
          X[i][j] = 0;
        }
      }
    }
    return X;
  }

  /**
   *
   * @return {Matrix}
   */
  get orthogonalMatrix() {
    var qr = this.QR;
    var rows = qr.rows;
    var columns = qr.columns;
    var X = new Matrix(rows, columns);
    var i, j, k, s;

    for (k = columns - 1; k >= 0; k--) {
      for (i = 0; i < rows; i++) {
        X[i][k] = 0;
      }
      X[k][k] = 1;
      for (j = k; j < columns; j++) {
        if (qr[k][k] !== 0) {
          s = 0;
          for (i = k; i < rows; i++) {
            s += qr[i][k] * X[i][j];
          }

          s = -s / qr[k][k];

          for (i = k; i < rows; i++) {
            X[i][j] += s * qr[i][k];
          }
        }
      }
    }
    return X;
  }
}

/**
 * Computes the inverse of a Matrix
 * @param {Matrix} matrix
 * @param {boolean} [useSVD=false]
 * @return {Matrix}
 */
function inverse(matrix, useSVD = false) {
  matrix = WrapperMatrix2D.checkMatrix(matrix);
  if (useSVD) {
    return new SingularValueDecomposition(matrix).inverse();
  } else {
    return solve(matrix, Matrix.eye(matrix.rows));
  }
}

/**
 *
 * @param {Matrix} leftHandSide
 * @param {Matrix} rightHandSide
 * @param {boolean} [useSVD = false]
 * @return {Matrix}
 */
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

// function used by rowsDependencies
function xrange(n, exception) {
  var range = [];
  for (var i = 0; i < n; i++) {
    if (i !== exception) {
      range.push(i);
    }
  }
  return range;
}

// function used by rowsDependencies
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

/**
 * Creates a matrix which represents the dependencies between rows.
 * If a row is a linear combination of others rows, the result will be a row with the coefficients of this combination.
 * For example : for A = [[2, 0, 0, 1], [0, 1, 6, 0], [0, 3, 0, 1], [0, 0, 1, 0], [0, 1, 2, 0]], the result will be [[0, 0, 0, 0, 0], [0, 0, 0, 4, 1], [0, 0, 0, 0, 0], [0, 0.25, 0, 0, -0.25], [0, 1, 0, -4, 0]]
 * @param {Matrix} matrix
 * @param {Object} [options] includes thresholdValue and thresholdError.
 * @param {number} [options.thresholdValue = 10e-10] If an absolute value is inferior to this threshold, it will equals zero.
 * @param {number} [options.thresholdError = 10e-10] If the error is inferior to that threshold, the linear combination found is accepted and the row is dependent from other rows.
 * @return {Matrix} the matrix which represents the dependencies between rows.
 */

function linearDependencies(matrix, options = {}) {
  const { thresholdValue = 10e-10, thresholdError = 10e-10 } = options;

  var n = matrix.rows;
  var results = new Matrix(n, n);

  for (var i = 0; i < n; i++) {
    var b = Matrix.columnVector(matrix.getRow(i));
    var Abis = matrix.subMatrixRow(xrange(n, i)).transposeView();
    var svd = new SingularValueDecomposition(Abis);
    var x = svd.solve(b);
    var error = max(
      Matrix.sub(b, Abis.mmul(x))
        .abs()
        .to1DArray()
    );
    results.setRow(
      i,
      dependenciesOneRow(error, x, i, thresholdValue, thresholdError)
    );
  }
  return results;
}

/**
 * @class EigenvalueDecomposition
 * @link https://github.com/lutzroeder/Mapack/blob/master/Source/EigenvalueDecomposition.cs
 * @param {Matrix} matrix
 * @param {object} [options]
 * @param {boolean} [options.assumeSymmetric=false]
 */
class EigenvalueDecomposition {
  constructor(matrix, options = {}) {
    const { assumeSymmetric = false } = options;

    matrix = WrapperMatrix2D.checkMatrix(matrix);
    if (!matrix.isSquare()) {
      throw new Error('Matrix is not a square matrix');
    }

    var n = matrix.columns;
    var V = getFilled2DArray(n, n, 0);
    var d = new Array(n);
    var e = new Array(n);
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
          V[i][j] = value.get(i, j);
        }
      }
      tred2(n, e, d, V);
      tql2(n, e, d, V);
    } else {
      var H = getFilled2DArray(n, n, 0);
      var ort = new Array(n);
      for (j = 0; j < n; j++) {
        for (i = 0; i < n; i++) {
          H[i][j] = value.get(i, j);
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

  /**
   *
   * @return {Array<number>}
   */
  get realEigenvalues() {
    return this.d;
  }

  /**
   *
   * @return {Array<number>}
   */
  get imaginaryEigenvalues() {
    return this.e;
  }

  /**
   *
   * @return {Matrix}
   */
  get eigenvectorMatrix() {
    if (!Matrix.isMatrix(this.V)) {
      this.V = new Matrix(this.V);
    }
    return this.V;
  }

  /**
   *
   * @return {Matrix}
   */
  get diagonalMatrix() {
    var n = this.n;
    var e = this.e;
    var d = this.d;
    var X = new Matrix(n, n);
    var i, j;
    for (i = 0; i < n; i++) {
      for (j = 0; j < n; j++) {
        X[i][j] = 0;
      }
      X[i][i] = d[i];
      if (e[i] > 0) {
        X[i][i + 1] = e[i];
      } else if (e[i] < 0) {
        X[i][i - 1] = e[i];
      }
    }
    return X;
  }
}

function tred2(n, e, d, V) {
  var f, g, h, i, j, k, hh, scale;

  for (j = 0; j < n; j++) {
    d[j] = V[n - 1][j];
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
        d[j] = V[i - 1][j];
        V[i][j] = 0;
        V[j][i] = 0;
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
        V[j][i] = f;
        g = e[j] + V[j][j] * f;
        for (k = j + 1; k <= i - 1; k++) {
          g += V[k][j] * d[k];
          e[k] += V[k][j] * f;
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
          V[k][j] -= f * e[k] + g * d[k];
        }
        d[j] = V[i - 1][j];
        V[i][j] = 0;
      }
    }
    d[i] = h;
  }

  for (i = 0; i < n - 1; i++) {
    V[n - 1][i] = V[i][i];
    V[i][i] = 1;
    h = d[i + 1];
    if (h !== 0) {
      for (k = 0; k <= i; k++) {
        d[k] = V[k][i + 1] / h;
      }

      for (j = 0; j <= i; j++) {
        g = 0;
        for (k = 0; k <= i; k++) {
          g += V[k][i + 1] * V[k][j];
        }
        for (k = 0; k <= i; k++) {
          V[k][j] -= g * d[k];
        }
      }
    }

    for (k = 0; k <= i; k++) {
      V[k][i + 1] = 0;
    }
  }

  for (j = 0; j < n; j++) {
    d[j] = V[n - 1][j];
    V[n - 1][j] = 0;
  }

  V[n - 1][n - 1] = 1;
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
            h = V[k][i + 1];
            V[k][i + 1] = s * V[k][i] + c * h;
            V[k][i] = c * V[k][i] - s * h;
          }
        }

        p = -s * s2 * c3 * el1 * e[l] / dl1;
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
        p = V[j][i];
        V[j][i] = V[j][k];
        V[j][k] = p;
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
      scale = scale + Math.abs(H[i][m - 1]);
    }

    if (scale !== 0) {
      h = 0;
      for (i = high; i >= m; i--) {
        ort[i] = H[i][m - 1] / scale;
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
          f += ort[i] * H[i][j];
        }

        f = f / h;
        for (i = m; i <= high; i++) {
          H[i][j] -= f * ort[i];
        }
      }

      for (i = 0; i <= high; i++) {
        f = 0;
        for (j = high; j >= m; j--) {
          f += ort[j] * H[i][j];
        }

        f = f / h;
        for (j = m; j <= high; j++) {
          H[i][j] -= f * ort[j];
        }
      }

      ort[m] = scale * ort[m];
      H[m][m - 1] = scale * g;
    }
  }

  for (i = 0; i < n; i++) {
    for (j = 0; j < n; j++) {
      V[i][j] = i === j ? 1 : 0;
    }
  }

  for (m = high - 1; m >= low + 1; m--) {
    if (H[m][m - 1] !== 0) {
      for (i = m + 1; i <= high; i++) {
        ort[i] = H[i][m - 1];
      }

      for (j = m; j <= high; j++) {
        g = 0;
        for (i = m; i <= high; i++) {
          g += ort[i] * V[i][j];
        }

        g = g / ort[m] / H[m][m - 1];
        for (i = m; i <= high; i++) {
          V[i][j] += g * ort[i];
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
      d[i] = H[i][i];
      e[i] = 0;
    }

    for (j = Math.max(i - 1, 0); j < nn; j++) {
      norm = norm + Math.abs(H[i][j]);
    }
  }

  while (n >= low) {
    l = n;
    while (l > low) {
      s = Math.abs(H[l - 1][l - 1]) + Math.abs(H[l][l]);
      if (s === 0) {
        s = norm;
      }
      if (Math.abs(H[l][l - 1]) < eps * s) {
        break;
      }
      l--;
    }

    if (l === n) {
      H[n][n] = H[n][n] + exshift;
      d[n] = H[n][n];
      e[n] = 0;
      n--;
      iter = 0;
    } else if (l === n - 1) {
      w = H[n][n - 1] * H[n - 1][n];
      p = (H[n - 1][n - 1] - H[n][n]) / 2;
      q = p * p + w;
      z = Math.sqrt(Math.abs(q));
      H[n][n] = H[n][n] + exshift;
      H[n - 1][n - 1] = H[n - 1][n - 1] + exshift;
      x = H[n][n];

      if (q >= 0) {
        z = p >= 0 ? p + z : p - z;
        d[n - 1] = x + z;
        d[n] = d[n - 1];
        if (z !== 0) {
          d[n] = x - w / z;
        }
        e[n - 1] = 0;
        e[n] = 0;
        x = H[n][n - 1];
        s = Math.abs(x) + Math.abs(z);
        p = x / s;
        q = z / s;
        r = Math.sqrt(p * p + q * q);
        p = p / r;
        q = q / r;

        for (j = n - 1; j < nn; j++) {
          z = H[n - 1][j];
          H[n - 1][j] = q * z + p * H[n][j];
          H[n][j] = q * H[n][j] - p * z;
        }

        for (i = 0; i <= n; i++) {
          z = H[i][n - 1];
          H[i][n - 1] = q * z + p * H[i][n];
          H[i][n] = q * H[i][n] - p * z;
        }

        for (i = low; i <= high; i++) {
          z = V[i][n - 1];
          V[i][n - 1] = q * z + p * V[i][n];
          V[i][n] = q * V[i][n] - p * z;
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
      x = H[n][n];
      y = 0;
      w = 0;
      if (l < n) {
        y = H[n - 1][n - 1];
        w = H[n][n - 1] * H[n - 1][n];
      }

      if (iter === 10) {
        exshift += x;
        for (i = low; i <= n; i++) {
          H[i][i] -= x;
        }
        s = Math.abs(H[n][n - 1]) + Math.abs(H[n - 1][n - 2]);
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
            H[i][i] -= s;
          }
          exshift += s;
          x = y = w = 0.964;
        }
      }

      iter = iter + 1;

      m = n - 2;
      while (m >= l) {
        z = H[m][m];
        r = x - z;
        s = y - z;
        p = (r * s - w) / H[m + 1][m] + H[m][m + 1];
        q = H[m + 1][m + 1] - z - r - s;
        r = H[m + 2][m + 1];
        s = Math.abs(p) + Math.abs(q) + Math.abs(r);
        p = p / s;
        q = q / s;
        r = r / s;
        if (m === l) {
          break;
        }
        if (
          Math.abs(H[m][m - 1]) * (Math.abs(q) + Math.abs(r)) <
          eps *
            (Math.abs(p) *
              (Math.abs(H[m - 1][m - 1]) +
                Math.abs(z) +
                Math.abs(H[m + 1][m + 1])))
        ) {
          break;
        }
        m--;
      }

      for (i = m + 2; i <= n; i++) {
        H[i][i - 2] = 0;
        if (i > m + 2) {
          H[i][i - 3] = 0;
        }
      }

      for (k = m; k <= n - 1; k++) {
        notlast = k !== n - 1;
        if (k !== m) {
          p = H[k][k - 1];
          q = H[k + 1][k - 1];
          r = notlast ? H[k + 2][k - 1] : 0;
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
            H[k][k - 1] = -s * x;
          } else if (l !== m) {
            H[k][k - 1] = -H[k][k - 1];
          }

          p = p + s;
          x = p / s;
          y = q / s;
          z = r / s;
          q = q / p;
          r = r / p;

          for (j = k; j < nn; j++) {
            p = H[k][j] + q * H[k + 1][j];
            if (notlast) {
              p = p + r * H[k + 2][j];
              H[k + 2][j] = H[k + 2][j] - p * z;
            }

            H[k][j] = H[k][j] - p * x;
            H[k + 1][j] = H[k + 1][j] - p * y;
          }

          for (i = 0; i <= Math.min(n, k + 3); i++) {
            p = x * H[i][k] + y * H[i][k + 1];
            if (notlast) {
              p = p + z * H[i][k + 2];
              H[i][k + 2] = H[i][k + 2] - p * r;
            }

            H[i][k] = H[i][k] - p;
            H[i][k + 1] = H[i][k + 1] - p * q;
          }

          for (i = low; i <= high; i++) {
            p = x * V[i][k] + y * V[i][k + 1];
            if (notlast) {
              p = p + z * V[i][k + 2];
              V[i][k + 2] = V[i][k + 2] - p * r;
            }

            V[i][k] = V[i][k] - p;
            V[i][k + 1] = V[i][k + 1] - p * q;
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
      H[n][n] = 1;
      for (i = n - 1; i >= 0; i--) {
        w = H[i][i] - p;
        r = 0;
        for (j = l; j <= n; j++) {
          r = r + H[i][j] * H[j][n];
        }

        if (e[i] < 0) {
          z = w;
          s = r;
        } else {
          l = i;
          if (e[i] === 0) {
            H[i][n] = w !== 0 ? -r / w : -r / (eps * norm);
          } else {
            x = H[i][i + 1];
            y = H[i + 1][i];
            q = (d[i] - p) * (d[i] - p) + e[i] * e[i];
            t = (x * s - z * r) / q;
            H[i][n] = t;
            H[i + 1][n] =
              Math.abs(x) > Math.abs(z) ? (-r - w * t) / x : (-s - y * t) / z;
          }

          t = Math.abs(H[i][n]);
          if (eps * t * t > 1) {
            for (j = i; j <= n; j++) {
              H[j][n] = H[j][n] / t;
            }
          }
        }
      }
    } else if (q < 0) {
      l = n - 1;

      if (Math.abs(H[n][n - 1]) > Math.abs(H[n - 1][n])) {
        H[n - 1][n - 1] = q / H[n][n - 1];
        H[n - 1][n] = -(H[n][n] - p) / H[n][n - 1];
      } else {
        cdivres = cdiv(0, -H[n - 1][n], H[n - 1][n - 1] - p, q);
        H[n - 1][n - 1] = cdivres[0];
        H[n - 1][n] = cdivres[1];
      }

      H[n][n - 1] = 0;
      H[n][n] = 1;
      for (i = n - 2; i >= 0; i--) {
        ra = 0;
        sa = 0;
        for (j = l; j <= n; j++) {
          ra = ra + H[i][j] * H[j][n - 1];
          sa = sa + H[i][j] * H[j][n];
        }

        w = H[i][i] - p;

        if (e[i] < 0) {
          z = w;
          r = ra;
          s = sa;
        } else {
          l = i;
          if (e[i] === 0) {
            cdivres = cdiv(-ra, -sa, w, q);
            H[i][n - 1] = cdivres[0];
            H[i][n] = cdivres[1];
          } else {
            x = H[i][i + 1];
            y = H[i + 1][i];
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
            H[i][n - 1] = cdivres[0];
            H[i][n] = cdivres[1];
            if (Math.abs(x) > Math.abs(z) + Math.abs(q)) {
              H[i + 1][n - 1] = (-ra - w * H[i][n - 1] + q * H[i][n]) / x;
              H[i + 1][n] = (-sa - w * H[i][n] - q * H[i][n - 1]) / x;
            } else {
              cdivres = cdiv(-r - y * H[i][n - 1], -s - y * H[i][n], z, q);
              H[i + 1][n - 1] = cdivres[0];
              H[i + 1][n] = cdivres[1];
            }
          }

          t = Math.max(Math.abs(H[i][n - 1]), Math.abs(H[i][n]));
          if (eps * t * t > 1) {
            for (j = i; j <= n; j++) {
              H[j][n - 1] = H[j][n - 1] / t;
              H[j][n] = H[j][n] / t;
            }
          }
        }
      }
    }
  }

  for (i = 0; i < nn; i++) {
    if (i < low || i > high) {
      for (j = i; j < nn; j++) {
        V[i][j] = H[i][j];
      }
    }
  }

  for (j = nn - 1; j >= low; j--) {
    for (i = low; i <= high; i++) {
      z = 0;
      for (k = low; k <= Math.min(j, high); k++) {
        z = z + V[i][k] * H[k][j];
      }
      V[i][j] = z;
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

/**
 * @class CholeskyDecomposition
 * @link https://github.com/lutzroeder/Mapack/blob/master/Source/CholeskyDecomposition.cs
 * @param {Matrix} value
 */
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
      var Lrowj = l[j];
      var d = 0;
      for (k = 0; k < j; k++) {
        var Lrowk = l[k];
        var s = 0;
        for (i = 0; i < k; i++) {
          s += Lrowk[i] * Lrowj[i];
        }
        Lrowj[k] = s = (a.get(j, k) - s) / l[k][k];
        d = d + s * s;
      }

      d = a.get(j, j) - d;

      positiveDefinite &= d > 0;
      l[j][j] = Math.sqrt(Math.max(d, 0));
      for (k = j + 1; k < dimension; k++) {
        l[j][k] = 0;
      }
    }

    if (!positiveDefinite) {
      throw new Error('Matrix is not positive definite');
    }

    this.L = l;
  }

  /**
   *
   * @param {Matrix} value
   * @return {Matrix}
   */
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
          B[k][j] -= B[i][j] * l[k][i];
        }
        B[k][j] /= l[k][k];
      }
    }

    for (k = dimension - 1; k >= 0; k--) {
      for (j = 0; j < count; j++) {
        for (i = k + 1; i < dimension; i++) {
          B[k][j] -= B[i][j] * l[i][k];
        }
        B[k][j] /= l[k][k];
      }
    }

    return B;
  }

  /**
   *
   * @return {Matrix}
   */
  get lowerTriangularMatrix() {
    return this.L;
  }
}

exports.CHO = CholeskyDecomposition;
exports.CholeskyDecomposition = CholeskyDecomposition;
exports.EVD = EigenvalueDecomposition;
exports.EigenvalueDecomposition = EigenvalueDecomposition;
exports.LU = LuDecomposition;
exports.LuDecomposition = LuDecomposition;
exports.Matrix = Matrix;
exports.QR = QrDecomposition;
exports.QrDecomposition = QrDecomposition;
exports.SVD = SingularValueDecomposition;
exports.SingularValueDecomposition = SingularValueDecomposition;
exports.WrapperMatrix1D = WrapperMatrix1D;
exports.WrapperMatrix2D = WrapperMatrix2D;
exports.abstractMatrix = AbstractMatrix;
exports.default = Matrix;
exports.inverse = inverse;
exports.linearDependencies = linearDependencies;
exports.solve = solve;
exports.wrap = wrap;

},{"ml-array-max":41,"ml-array-rescale":43}],46:[function(require,module,exports){
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
  let max = outer ? matrix.rows : matrix.rows - 1;
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
  let max = outer ? matrix.columns : matrix.columns - 1;
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
      'vector size must be the same as the number of columns',
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
    column: checkColumnIndices(matrix, columnIndices),
  };
}

function checkRowIndices(matrix, rowIndices) {
  if (typeof rowIndices !== 'object') {
    throw new TypeError('unexpected type for row indices');
  }

  let rowOut = rowIndices.some((r) => {
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

  let columnOut = columnIndices.some((c) => {
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
  let array = [];
  for (let i = 0; i < length; i++) {
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
  let sum = newArray(matrix.rows);
  for (let i = 0; i < matrix.rows; ++i) {
    for (let j = 0; j < matrix.columns; ++j) {
      sum[i] += matrix.get(i, j);
    }
  }
  return sum;
}

function sumByColumn(matrix) {
  let sum = newArray(matrix.columns);
  for (let i = 0; i < matrix.rows; ++i) {
    for (let j = 0; j < matrix.columns; ++j) {
      sum[j] += matrix.get(i, j);
    }
  }
  return sum;
}

function sumAll(matrix) {
  let v = 0;
  for (let i = 0; i < matrix.rows; i++) {
    for (let j = 0; j < matrix.columns; j++) {
      v += matrix.get(i, j);
    }
  }
  return v;
}

function productByRow(matrix) {
  let sum = newArray(matrix.rows, 1);
  for (let i = 0; i < matrix.rows; ++i) {
    for (let j = 0; j < matrix.columns; ++j) {
      sum[i] *= matrix.get(i, j);
    }
  }
  return sum;
}

function productByColumn(matrix) {
  let sum = newArray(matrix.columns, 1);
  for (let i = 0; i < matrix.rows; ++i) {
    for (let j = 0; j < matrix.columns; ++j) {
      sum[j] *= matrix.get(i, j);
    }
  }
  return sum;
}

function productAll(matrix) {
  let v = 1;
  for (let i = 0; i < matrix.rows; i++) {
    for (let j = 0; j < matrix.columns; j++) {
      v *= matrix.get(i, j);
    }
  }
  return v;
}

function varianceByRow(matrix, unbiased, mean) {
  const rows = matrix.rows;
  const cols = matrix.columns;
  const variance = [];

  for (let i = 0; i < rows; i++) {
    let sum1 = 0;
    let sum2 = 0;
    let x = 0;
    for (let j = 0; j < cols; j++) {
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

  for (let j = 0; j < cols; j++) {
    let sum1 = 0;
    let sum2 = 0;
    let x = 0;
    for (let i = 0; i < rows; i++) {
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

  let sum1 = 0;
  let sum2 = 0;
  let x = 0;
  for (let i = 0; i < rows; i++) {
    for (let j = 0; j < cols; j++) {
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
  for (let i = 0; i < maxI; i++) {
    let line = [];
    for (let j = 0; j < maxJ; j++) {
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
    for (let i = 0; i < this.rows; i++) {
      for (let j = 0; j < this.columns; j++) {
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
    for (let i = 0; i < this.rows; i++) {
      for (let j = 0; j < this.columns; j++) {
        this.set(i, j, this.get(i, j) + matrix.get(i, j));
      }
    }
    return this;
  };

  AbstractMatrix.add = function add(matrix, value) {
    const newMatrix = new Matrix(matrix);
    return newMatrix.add(value);
  };

  AbstractMatrix.prototype.sub = function sub(value) {
    if (typeof value === 'number') return this.subS(value);
    return this.subM(value);
  };

  AbstractMatrix.prototype.subS = function subS(value) {
    for (let i = 0; i < this.rows; i++) {
      for (let j = 0; j < this.columns; j++) {
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
    for (let i = 0; i < this.rows; i++) {
      for (let j = 0; j < this.columns; j++) {
        this.set(i, j, this.get(i, j) - matrix.get(i, j));
      }
    }
    return this;
  };

  AbstractMatrix.sub = function sub(matrix, value) {
    const newMatrix = new Matrix(matrix);
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
    for (let i = 0; i < this.rows; i++) {
      for (let j = 0; j < this.columns; j++) {
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
    for (let i = 0; i < this.rows; i++) {
      for (let j = 0; j < this.columns; j++) {
        this.set(i, j, this.get(i, j) * matrix.get(i, j));
      }
    }
    return this;
  };

  AbstractMatrix.mul = function mul(matrix, value) {
    const newMatrix = new Matrix(matrix);
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
    for (let i = 0; i < this.rows; i++) {
      for (let j = 0; j < this.columns; j++) {
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
    for (let i = 0; i < this.rows; i++) {
      for (let j = 0; j < this.columns; j++) {
        this.set(i, j, this.get(i, j) / matrix.get(i, j));
      }
    }
    return this;
  };

  AbstractMatrix.div = function div(matrix, value) {
    const newMatrix = new Matrix(matrix);
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
    for (let i = 0; i < this.rows; i++) {
      for (let j = 0; j < this.columns; j++) {
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
    for (let i = 0; i < this.rows; i++) {
      for (let j = 0; j < this.columns; j++) {
        this.set(i, j, this.get(i, j) % matrix.get(i, j));
      }
    }
    return this;
  };

  AbstractMatrix.mod = function mod(matrix, value) {
    const newMatrix = new Matrix(matrix);
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
    for (let i = 0; i < this.rows; i++) {
      for (let j = 0; j < this.columns; j++) {
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
    for (let i = 0; i < this.rows; i++) {
      for (let j = 0; j < this.columns; j++) {
        this.set(i, j, this.get(i, j) & matrix.get(i, j));
      }
    }
    return this;
  };

  AbstractMatrix.and = function and(matrix, value) {
    const newMatrix = new Matrix(matrix);
    return newMatrix.and(value);
  };

  AbstractMatrix.prototype.or = function or(value) {
    if (typeof value === 'number') return this.orS(value);
    return this.orM(value);
  };

  AbstractMatrix.prototype.orS = function orS(value) {
    for (let i = 0; i < this.rows; i++) {
      for (let j = 0; j < this.columns; j++) {
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
    for (let i = 0; i < this.rows; i++) {
      for (let j = 0; j < this.columns; j++) {
        this.set(i, j, this.get(i, j) | matrix.get(i, j));
      }
    }
    return this;
  };

  AbstractMatrix.or = function or(matrix, value) {
    const newMatrix = new Matrix(matrix);
    return newMatrix.or(value);
  };

  AbstractMatrix.prototype.xor = function xor(value) {
    if (typeof value === 'number') return this.xorS(value);
    return this.xorM(value);
  };

  AbstractMatrix.prototype.xorS = function xorS(value) {
    for (let i = 0; i < this.rows; i++) {
      for (let j = 0; j < this.columns; j++) {
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
    for (let i = 0; i < this.rows; i++) {
      for (let j = 0; j < this.columns; j++) {
        this.set(i, j, this.get(i, j) ^ matrix.get(i, j));
      }
    }
    return this;
  };

  AbstractMatrix.xor = function xor(matrix, value) {
    const newMatrix = new Matrix(matrix);
    return newMatrix.xor(value);
  };

  AbstractMatrix.prototype.leftShift = function leftShift(value) {
    if (typeof value === 'number') return this.leftShiftS(value);
    return this.leftShiftM(value);
  };

  AbstractMatrix.prototype.leftShiftS = function leftShiftS(value) {
    for (let i = 0; i < this.rows; i++) {
      for (let j = 0; j < this.columns; j++) {
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
    for (let i = 0; i < this.rows; i++) {
      for (let j = 0; j < this.columns; j++) {
        this.set(i, j, this.get(i, j) << matrix.get(i, j));
      }
    }
    return this;
  };

  AbstractMatrix.leftShift = function leftShift(matrix, value) {
    const newMatrix = new Matrix(matrix);
    return newMatrix.leftShift(value);
  };

  AbstractMatrix.prototype.signPropagatingRightShift = function signPropagatingRightShift(value) {
    if (typeof value === 'number') return this.signPropagatingRightShiftS(value);
    return this.signPropagatingRightShiftM(value);
  };

  AbstractMatrix.prototype.signPropagatingRightShiftS = function signPropagatingRightShiftS(value) {
    for (let i = 0; i < this.rows; i++) {
      for (let j = 0; j < this.columns; j++) {
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
    for (let i = 0; i < this.rows; i++) {
      for (let j = 0; j < this.columns; j++) {
        this.set(i, j, this.get(i, j) >> matrix.get(i, j));
      }
    }
    return this;
  };

  AbstractMatrix.signPropagatingRightShift = function signPropagatingRightShift(matrix, value) {
    const newMatrix = new Matrix(matrix);
    return newMatrix.signPropagatingRightShift(value);
  };

  AbstractMatrix.prototype.rightShift = function rightShift(value) {
    if (typeof value === 'number') return this.rightShiftS(value);
    return this.rightShiftM(value);
  };

  AbstractMatrix.prototype.rightShiftS = function rightShiftS(value) {
    for (let i = 0; i < this.rows; i++) {
      for (let j = 0; j < this.columns; j++) {
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
    for (let i = 0; i < this.rows; i++) {
      for (let j = 0; j < this.columns; j++) {
        this.set(i, j, this.get(i, j) >>> matrix.get(i, j));
      }
    }
    return this;
  };

  AbstractMatrix.rightShift = function rightShift(matrix, value) {
    const newMatrix = new Matrix(matrix);
    return newMatrix.rightShift(value);
  };
  AbstractMatrix.prototype.zeroFillRightShift = AbstractMatrix.prototype.rightShift;
  AbstractMatrix.prototype.zeroFillRightShiftS = AbstractMatrix.prototype.rightShiftS;
  AbstractMatrix.prototype.zeroFillRightShiftM = AbstractMatrix.prototype.rightShiftM;
  AbstractMatrix.zeroFillRightShift = AbstractMatrix.rightShift;

  AbstractMatrix.prototype.not = function not() {
    for (let i = 0; i < this.rows; i++) {
      for (let j = 0; j < this.columns; j++) {
        this.set(i, j, ~(this.get(i, j)));
      }
    }
    return this;
  };

  AbstractMatrix.not = function not(matrix) {
    const newMatrix = new Matrix(matrix);
    return newMatrix.not();
  };

  AbstractMatrix.prototype.abs = function abs() {
    for (let i = 0; i < this.rows; i++) {
      for (let j = 0; j < this.columns; j++) {
        this.set(i, j, Math.abs(this.get(i, j)));
      }
    }
    return this;
  };

  AbstractMatrix.abs = function abs(matrix) {
    const newMatrix = new Matrix(matrix);
    return newMatrix.abs();
  };

  AbstractMatrix.prototype.acos = function acos() {
    for (let i = 0; i < this.rows; i++) {
      for (let j = 0; j < this.columns; j++) {
        this.set(i, j, Math.acos(this.get(i, j)));
      }
    }
    return this;
  };

  AbstractMatrix.acos = function acos(matrix) {
    const newMatrix = new Matrix(matrix);
    return newMatrix.acos();
  };

  AbstractMatrix.prototype.acosh = function acosh() {
    for (let i = 0; i < this.rows; i++) {
      for (let j = 0; j < this.columns; j++) {
        this.set(i, j, Math.acosh(this.get(i, j)));
      }
    }
    return this;
  };

  AbstractMatrix.acosh = function acosh(matrix) {
    const newMatrix = new Matrix(matrix);
    return newMatrix.acosh();
  };

  AbstractMatrix.prototype.asin = function asin() {
    for (let i = 0; i < this.rows; i++) {
      for (let j = 0; j < this.columns; j++) {
        this.set(i, j, Math.asin(this.get(i, j)));
      }
    }
    return this;
  };

  AbstractMatrix.asin = function asin(matrix) {
    const newMatrix = new Matrix(matrix);
    return newMatrix.asin();
  };

  AbstractMatrix.prototype.asinh = function asinh() {
    for (let i = 0; i < this.rows; i++) {
      for (let j = 0; j < this.columns; j++) {
        this.set(i, j, Math.asinh(this.get(i, j)));
      }
    }
    return this;
  };

  AbstractMatrix.asinh = function asinh(matrix) {
    const newMatrix = new Matrix(matrix);
    return newMatrix.asinh();
  };

  AbstractMatrix.prototype.atan = function atan() {
    for (let i = 0; i < this.rows; i++) {
      for (let j = 0; j < this.columns; j++) {
        this.set(i, j, Math.atan(this.get(i, j)));
      }
    }
    return this;
  };

  AbstractMatrix.atan = function atan(matrix) {
    const newMatrix = new Matrix(matrix);
    return newMatrix.atan();
  };

  AbstractMatrix.prototype.atanh = function atanh() {
    for (let i = 0; i < this.rows; i++) {
      for (let j = 0; j < this.columns; j++) {
        this.set(i, j, Math.atanh(this.get(i, j)));
      }
    }
    return this;
  };

  AbstractMatrix.atanh = function atanh(matrix) {
    const newMatrix = new Matrix(matrix);
    return newMatrix.atanh();
  };

  AbstractMatrix.prototype.cbrt = function cbrt() {
    for (let i = 0; i < this.rows; i++) {
      for (let j = 0; j < this.columns; j++) {
        this.set(i, j, Math.cbrt(this.get(i, j)));
      }
    }
    return this;
  };

  AbstractMatrix.cbrt = function cbrt(matrix) {
    const newMatrix = new Matrix(matrix);
    return newMatrix.cbrt();
  };

  AbstractMatrix.prototype.ceil = function ceil() {
    for (let i = 0; i < this.rows; i++) {
      for (let j = 0; j < this.columns; j++) {
        this.set(i, j, Math.ceil(this.get(i, j)));
      }
    }
    return this;
  };

  AbstractMatrix.ceil = function ceil(matrix) {
    const newMatrix = new Matrix(matrix);
    return newMatrix.ceil();
  };

  AbstractMatrix.prototype.clz32 = function clz32() {
    for (let i = 0; i < this.rows; i++) {
      for (let j = 0; j < this.columns; j++) {
        this.set(i, j, Math.clz32(this.get(i, j)));
      }
    }
    return this;
  };

  AbstractMatrix.clz32 = function clz32(matrix) {
    const newMatrix = new Matrix(matrix);
    return newMatrix.clz32();
  };

  AbstractMatrix.prototype.cos = function cos() {
    for (let i = 0; i < this.rows; i++) {
      for (let j = 0; j < this.columns; j++) {
        this.set(i, j, Math.cos(this.get(i, j)));
      }
    }
    return this;
  };

  AbstractMatrix.cos = function cos(matrix) {
    const newMatrix = new Matrix(matrix);
    return newMatrix.cos();
  };

  AbstractMatrix.prototype.cosh = function cosh() {
    for (let i = 0; i < this.rows; i++) {
      for (let j = 0; j < this.columns; j++) {
        this.set(i, j, Math.cosh(this.get(i, j)));
      }
    }
    return this;
  };

  AbstractMatrix.cosh = function cosh(matrix) {
    const newMatrix = new Matrix(matrix);
    return newMatrix.cosh();
  };

  AbstractMatrix.prototype.exp = function exp() {
    for (let i = 0; i < this.rows; i++) {
      for (let j = 0; j < this.columns; j++) {
        this.set(i, j, Math.exp(this.get(i, j)));
      }
    }
    return this;
  };

  AbstractMatrix.exp = function exp(matrix) {
    const newMatrix = new Matrix(matrix);
    return newMatrix.exp();
  };

  AbstractMatrix.prototype.expm1 = function expm1() {
    for (let i = 0; i < this.rows; i++) {
      for (let j = 0; j < this.columns; j++) {
        this.set(i, j, Math.expm1(this.get(i, j)));
      }
    }
    return this;
  };

  AbstractMatrix.expm1 = function expm1(matrix) {
    const newMatrix = new Matrix(matrix);
    return newMatrix.expm1();
  };

  AbstractMatrix.prototype.floor = function floor() {
    for (let i = 0; i < this.rows; i++) {
      for (let j = 0; j < this.columns; j++) {
        this.set(i, j, Math.floor(this.get(i, j)));
      }
    }
    return this;
  };

  AbstractMatrix.floor = function floor(matrix) {
    const newMatrix = new Matrix(matrix);
    return newMatrix.floor();
  };

  AbstractMatrix.prototype.fround = function fround() {
    for (let i = 0; i < this.rows; i++) {
      for (let j = 0; j < this.columns; j++) {
        this.set(i, j, Math.fround(this.get(i, j)));
      }
    }
    return this;
  };

  AbstractMatrix.fround = function fround(matrix) {
    const newMatrix = new Matrix(matrix);
    return newMatrix.fround();
  };

  AbstractMatrix.prototype.log = function log() {
    for (let i = 0; i < this.rows; i++) {
      for (let j = 0; j < this.columns; j++) {
        this.set(i, j, Math.log(this.get(i, j)));
      }
    }
    return this;
  };

  AbstractMatrix.log = function log(matrix) {
    const newMatrix = new Matrix(matrix);
    return newMatrix.log();
  };

  AbstractMatrix.prototype.log1p = function log1p() {
    for (let i = 0; i < this.rows; i++) {
      for (let j = 0; j < this.columns; j++) {
        this.set(i, j, Math.log1p(this.get(i, j)));
      }
    }
    return this;
  };

  AbstractMatrix.log1p = function log1p(matrix) {
    const newMatrix = new Matrix(matrix);
    return newMatrix.log1p();
  };

  AbstractMatrix.prototype.log10 = function log10() {
    for (let i = 0; i < this.rows; i++) {
      for (let j = 0; j < this.columns; j++) {
        this.set(i, j, Math.log10(this.get(i, j)));
      }
    }
    return this;
  };

  AbstractMatrix.log10 = function log10(matrix) {
    const newMatrix = new Matrix(matrix);
    return newMatrix.log10();
  };

  AbstractMatrix.prototype.log2 = function log2() {
    for (let i = 0; i < this.rows; i++) {
      for (let j = 0; j < this.columns; j++) {
        this.set(i, j, Math.log2(this.get(i, j)));
      }
    }
    return this;
  };

  AbstractMatrix.log2 = function log2(matrix) {
    const newMatrix = new Matrix(matrix);
    return newMatrix.log2();
  };

  AbstractMatrix.prototype.round = function round() {
    for (let i = 0; i < this.rows; i++) {
      for (let j = 0; j < this.columns; j++) {
        this.set(i, j, Math.round(this.get(i, j)));
      }
    }
    return this;
  };

  AbstractMatrix.round = function round(matrix) {
    const newMatrix = new Matrix(matrix);
    return newMatrix.round();
  };

  AbstractMatrix.prototype.sign = function sign() {
    for (let i = 0; i < this.rows; i++) {
      for (let j = 0; j < this.columns; j++) {
        this.set(i, j, Math.sign(this.get(i, j)));
      }
    }
    return this;
  };

  AbstractMatrix.sign = function sign(matrix) {
    const newMatrix = new Matrix(matrix);
    return newMatrix.sign();
  };

  AbstractMatrix.prototype.sin = function sin() {
    for (let i = 0; i < this.rows; i++) {
      for (let j = 0; j < this.columns; j++) {
        this.set(i, j, Math.sin(this.get(i, j)));
      }
    }
    return this;
  };

  AbstractMatrix.sin = function sin(matrix) {
    const newMatrix = new Matrix(matrix);
    return newMatrix.sin();
  };

  AbstractMatrix.prototype.sinh = function sinh() {
    for (let i = 0; i < this.rows; i++) {
      for (let j = 0; j < this.columns; j++) {
        this.set(i, j, Math.sinh(this.get(i, j)));
      }
    }
    return this;
  };

  AbstractMatrix.sinh = function sinh(matrix) {
    const newMatrix = new Matrix(matrix);
    return newMatrix.sinh();
  };

  AbstractMatrix.prototype.sqrt = function sqrt() {
    for (let i = 0; i < this.rows; i++) {
      for (let j = 0; j < this.columns; j++) {
        this.set(i, j, Math.sqrt(this.get(i, j)));
      }
    }
    return this;
  };

  AbstractMatrix.sqrt = function sqrt(matrix) {
    const newMatrix = new Matrix(matrix);
    return newMatrix.sqrt();
  };

  AbstractMatrix.prototype.tan = function tan() {
    for (let i = 0; i < this.rows; i++) {
      for (let j = 0; j < this.columns; j++) {
        this.set(i, j, Math.tan(this.get(i, j)));
      }
    }
    return this;
  };

  AbstractMatrix.tan = function tan(matrix) {
    const newMatrix = new Matrix(matrix);
    return newMatrix.tan();
  };

  AbstractMatrix.prototype.tanh = function tanh() {
    for (let i = 0; i < this.rows; i++) {
      for (let j = 0; j < this.columns; j++) {
        this.set(i, j, Math.tanh(this.get(i, j)));
      }
    }
    return this;
  };

  AbstractMatrix.tanh = function tanh(matrix) {
    const newMatrix = new Matrix(matrix);
    return newMatrix.tanh();
  };

  AbstractMatrix.prototype.trunc = function trunc() {
    for (let i = 0; i < this.rows; i++) {
      for (let j = 0; j < this.columns; j++) {
        this.set(i, j, Math.trunc(this.get(i, j)));
      }
    }
    return this;
  };

  AbstractMatrix.trunc = function trunc(matrix) {
    const newMatrix = new Matrix(matrix);
    return newMatrix.trunc();
  };

  AbstractMatrix.pow = function pow(matrix, arg0) {
    const newMatrix = new Matrix(matrix);
    return newMatrix.pow(arg0);
  };

  AbstractMatrix.prototype.pow = function pow(value) {
    if (typeof value === 'number') return this.powS(value);
    return this.powM(value);
  };

  AbstractMatrix.prototype.powS = function powS(value) {
    for (let i = 0; i < this.rows; i++) {
      for (let j = 0; j < this.columns; j++) {
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
    for (let i = 0; i < this.rows; i++) {
      for (let j = 0; j < this.columns; j++) {
        this.set(i, j, Math.pow(this.get(i, j), matrix.get(i, j)));
      }
    }
    return this;
  };
}

class AbstractMatrix {
  static from1DArray(newRows, newColumns, newData) {
    let length = newRows * newColumns;
    if (length !== newData.length) {
      throw new RangeError('data length does not match given dimensions');
    }
    let newMatrix = new Matrix(newRows, newColumns);
    for (let row = 0; row < newRows; row++) {
      for (let column = 0; column < newColumns; column++) {
        newMatrix.set(row, column, newData[row * newColumns + column]);
      }
    }
    return newMatrix;
  }

  static rowVector(newData) {
    let vector = new Matrix(1, newData.length);
    for (let i = 0; i < newData.length; i++) {
      vector.set(0, i, newData[i]);
    }
    return vector;
  }

  static columnVector(newData) {
    let vector = new Matrix(newData.length, 1);
    for (let i = 0; i < newData.length; i++) {
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
    let matrix = new Matrix(rows, columns);
    for (let i = 0; i < rows; i++) {
      for (let j = 0; j < columns; j++) {
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
    let interval = max - min;
    let matrix = new Matrix(rows, columns);
    for (let i = 0; i < rows; i++) {
      for (let j = 0; j < columns; j++) {
        let value = min + Math.round(random() * interval);
        matrix.set(i, j, value);
      }
    }
    return matrix;
  }

  static eye(rows, columns, value) {
    if (columns === undefined) columns = rows;
    if (value === undefined) value = 1;
    let min = Math.min(rows, columns);
    let matrix = this.zeros(rows, columns);
    for (let i = 0; i < min; i++) {
      matrix.set(i, i, value);
    }
    return matrix;
  }

  static diag(data, rows, columns) {
    let l = data.length;
    if (rows === undefined) rows = l;
    if (columns === undefined) columns = rows;
    let min = Math.min(l, rows, columns);
    let matrix = this.zeros(rows, columns);
    for (let i = 0; i < min; i++) {
      matrix.set(i, i, data[i]);
    }
    return matrix;
  }

  static min(matrix1, matrix2) {
    matrix1 = this.checkMatrix(matrix1);
    matrix2 = this.checkMatrix(matrix2);
    let rows = matrix1.rows;
    let columns = matrix1.columns;
    let result = new Matrix(rows, columns);
    for (let i = 0; i < rows; i++) {
      for (let j = 0; j < columns; j++) {
        result.set(i, j, Math.min(matrix1.get(i, j), matrix2.get(i, j)));
      }
    }
    return result;
  }

  static max(matrix1, matrix2) {
    matrix1 = this.checkMatrix(matrix1);
    matrix2 = this.checkMatrix(matrix2);
    let rows = matrix1.rows;
    let columns = matrix1.columns;
    let result = new this(rows, columns);
    for (let i = 0; i < rows; i++) {
      for (let j = 0; j < columns; j++) {
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
    for (let i = 0; i < this.rows; i++) {
      for (let j = 0; j < this.columns; j++) {
        callback.call(this, i, j);
      }
    }
    return this;
  }

  to1DArray() {
    let array = [];
    for (let i = 0; i < this.rows; i++) {
      for (let j = 0; j < this.columns; j++) {
        array.push(this.get(i, j));
      }
    }
    return array;
  }

  to2DArray() {
    let copy = [];
    for (let i = 0; i < this.rows; i++) {
      copy.push([]);
      for (let j = 0; j < this.columns; j++) {
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
      for (let i = 0; i < this.rows; i++) {
        for (let j = 0; j <= i; j++) {
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
    while (h < result.rows && k < result.columns) {
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
        while (p < n && pivot === false) {
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
    let matrix = new Matrix(this.rows * rows, this.columns * columns);
    for (let i = 0; i < rows; i++) {
      for (let j = 0; j < columns; j++) {
        matrix.setSubMatrix(this, this.rows * i, this.columns * j);
      }
    }
    return matrix;
  }

  fill(value) {
    for (let i = 0; i < this.rows; i++) {
      for (let j = 0; j < this.columns; j++) {
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
    let row = [];
    for (let i = 0; i < this.columns; i++) {
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
    for (let i = 0; i < this.columns; i++) {
      this.set(index, i, array[i]);
    }
    return this;
  }

  swapRows(row1, row2) {
    checkRowIndex(this, row1);
    checkRowIndex(this, row2);
    for (let i = 0; i < this.columns; i++) {
      let temp = this.get(row1, i);
      this.set(row1, i, this.get(row2, i));
      this.set(row2, i, temp);
    }
    return this;
  }

  getColumn(index) {
    checkColumnIndex(this, index);
    let column = [];
    for (let i = 0; i < this.rows; i++) {
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
    for (let i = 0; i < this.rows; i++) {
      this.set(i, index, array[i]);
    }
    return this;
  }

  swapColumns(column1, column2) {
    checkColumnIndex(this, column1);
    checkColumnIndex(this, column2);
    for (let i = 0; i < this.rows; i++) {
      let temp = this.get(i, column1);
      this.set(i, column1, this.get(i, column2));
      this.set(i, column2, temp);
    }
    return this;
  }

  addRowVector(vector) {
    vector = checkRowVector(this, vector);
    for (let i = 0; i < this.rows; i++) {
      for (let j = 0; j < this.columns; j++) {
        this.set(i, j, this.get(i, j) + vector[j]);
      }
    }
    return this;
  }

  subRowVector(vector) {
    vector = checkRowVector(this, vector);
    for (let i = 0; i < this.rows; i++) {
      for (let j = 0; j < this.columns; j++) {
        this.set(i, j, this.get(i, j) - vector[j]);
      }
    }
    return this;
  }

  mulRowVector(vector) {
    vector = checkRowVector(this, vector);
    for (let i = 0; i < this.rows; i++) {
      for (let j = 0; j < this.columns; j++) {
        this.set(i, j, this.get(i, j) * vector[j]);
      }
    }
    return this;
  }

  divRowVector(vector) {
    vector = checkRowVector(this, vector);
    for (let i = 0; i < this.rows; i++) {
      for (let j = 0; j < this.columns; j++) {
        this.set(i, j, this.get(i, j) / vector[j]);
      }
    }
    return this;
  }

  addColumnVector(vector) {
    vector = checkColumnVector(this, vector);
    for (let i = 0; i < this.rows; i++) {
      for (let j = 0; j < this.columns; j++) {
        this.set(i, j, this.get(i, j) + vector[i]);
      }
    }
    return this;
  }

  subColumnVector(vector) {
    vector = checkColumnVector(this, vector);
    for (let i = 0; i < this.rows; i++) {
      for (let j = 0; j < this.columns; j++) {
        this.set(i, j, this.get(i, j) - vector[i]);
      }
    }
    return this;
  }

  mulColumnVector(vector) {
    vector = checkColumnVector(this, vector);
    for (let i = 0; i < this.rows; i++) {
      for (let j = 0; j < this.columns; j++) {
        this.set(i, j, this.get(i, j) * vector[i]);
      }
    }
    return this;
  }

  divColumnVector(vector) {
    vector = checkColumnVector(this, vector);
    for (let i = 0; i < this.rows; i++) {
      for (let j = 0; j < this.columns; j++) {
        this.set(i, j, this.get(i, j) / vector[i]);
      }
    }
    return this;
  }

  mulRow(index, value) {
    checkRowIndex(this, index);
    for (let i = 0; i < this.columns; i++) {
      this.set(index, i, this.get(index, i) * value);
    }
    return this;
  }

  mulColumn(index, value) {
    checkColumnIndex(this, index);
    for (let i = 0; i < this.rows; i++) {
      this.set(i, index, this.get(i, index) * value);
    }
    return this;
  }

  max() {
    let v = this.get(0, 0);
    for (let i = 0; i < this.rows; i++) {
      for (let j = 0; j < this.columns; j++) {
        if (this.get(i, j) > v) {
          v = this.get(i, j);
        }
      }
    }
    return v;
  }

  maxIndex() {
    let v = this.get(0, 0);
    let idx = [0, 0];
    for (let i = 0; i < this.rows; i++) {
      for (let j = 0; j < this.columns; j++) {
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
    let v = this.get(0, 0);
    for (let i = 0; i < this.rows; i++) {
      for (let j = 0; j < this.columns; j++) {
        if (this.get(i, j) < v) {
          v = this.get(i, j);
        }
      }
    }
    return v;
  }

  minIndex() {
    let v = this.get(0, 0);
    let idx = [0, 0];
    for (let i = 0; i < this.rows; i++) {
      for (let j = 0; j < this.columns; j++) {
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
    let v = this.get(row, 0);
    for (let i = 1; i < this.columns; i++) {
      if (this.get(row, i) > v) {
        v = this.get(row, i);
      }
    }
    return v;
  }

  maxRowIndex(row) {
    checkRowIndex(this, row);
    let v = this.get(row, 0);
    let idx = [row, 0];
    for (let i = 1; i < this.columns; i++) {
      if (this.get(row, i) > v) {
        v = this.get(row, i);
        idx[1] = i;
      }
    }
    return idx;
  }

  minRow(row) {
    checkRowIndex(this, row);
    let v = this.get(row, 0);
    for (let i = 1; i < this.columns; i++) {
      if (this.get(row, i) < v) {
        v = this.get(row, i);
      }
    }
    return v;
  }

  minRowIndex(row) {
    checkRowIndex(this, row);
    let v = this.get(row, 0);
    let idx = [row, 0];
    for (let i = 1; i < this.columns; i++) {
      if (this.get(row, i) < v) {
        v = this.get(row, i);
        idx[1] = i;
      }
    }
    return idx;
  }

  maxColumn(column) {
    checkColumnIndex(this, column);
    let v = this.get(0, column);
    for (let i = 1; i < this.rows; i++) {
      if (this.get(i, column) > v) {
        v = this.get(i, column);
      }
    }
    return v;
  }

  maxColumnIndex(column) {
    checkColumnIndex(this, column);
    let v = this.get(0, column);
    let idx = [0, column];
    for (let i = 1; i < this.rows; i++) {
      if (this.get(i, column) > v) {
        v = this.get(i, column);
        idx[0] = i;
      }
    }
    return idx;
  }

  minColumn(column) {
    checkColumnIndex(this, column);
    let v = this.get(0, column);
    for (let i = 1; i < this.rows; i++) {
      if (this.get(i, column) < v) {
        v = this.get(i, column);
      }
    }
    return v;
  }

  minColumnIndex(column) {
    checkColumnIndex(this, column);
    let v = this.get(0, column);
    let idx = [0, column];
    for (let i = 1; i < this.rows; i++) {
      if (this.get(i, column) < v) {
        v = this.get(i, column);
        idx[0] = i;
      }
    }
    return idx;
  }

  diag() {
    let min = Math.min(this.rows, this.columns);
    let diag = [];
    for (let i = 0; i < min; i++) {
      diag.push(this.get(i, i));
    }
    return diag;
  }

  norm(type = 'frobenius') {
    let result = 0;
    if (type === 'max') {
      return this.max();
    } else if (type === 'frobenius') {
      for (let i = 0; i < this.rows; i++) {
        for (let j = 0; j < this.columns; j++) {
          result = result + this.get(i, j) * this.get(i, j);
        }
      }
      return Math.sqrt(result);
    } else {
      throw new RangeError(`unknown norm type: ${type}`);
    }
  }

  cumulativeSum() {
    let sum = 0;
    for (let i = 0; i < this.rows; i++) {
      for (let j = 0; j < this.columns; j++) {
        sum += this.get(i, j);
        this.set(i, j, sum);
      }
    }
    return this;
  }

  dot(vector2) {
    if (AbstractMatrix.isMatrix(vector2)) vector2 = vector2.to1DArray();
    let vector1 = this.to1DArray();
    if (vector1.length !== vector2.length) {
      throw new RangeError('vectors do not have the same size');
    }
    let dot = 0;
    for (let i = 0; i < vector1.length; i++) {
      dot += vector1[i] * vector2[i];
    }
    return dot;
  }

  mmul(other) {
    other = Matrix.checkMatrix(other);

    let m = this.rows;
    let n = this.columns;
    let p = other.columns;

    let result = new Matrix(m, p);

    let Bcolj = new Float64Array(n);
    for (let j = 0; j < p; j++) {
      for (let k = 0; k < n; k++) {
        Bcolj[k] = other.get(k, j);
      }

      for (let i = 0; i < m; i++) {
        let s = 0;
        for (let k = 0; k < n; k++) {
          s += this.get(i, k) * Bcolj[k];
        }

        result.set(i, j, s);
      }
    }
    return result;
  }

  strassen2x2(other) {
    other = Matrix.checkMatrix(other);
    let result = new Matrix(2, 2);
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
    let result = new Matrix(3, 3);

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
    let x = this.clone();
    let r1 = x.rows;
    let c1 = x.columns;
    let r2 = y.rows;
    let c2 = y.columns;
    if (c1 !== r2) {
      // eslint-disable-next-line no-console
      console.warn(
        `Multiplying ${r1} x ${c1} and ${r2} x ${c2} matrix: dimensions do not match.`,
      );
    }

    // Put a matrix into the top left of a matrix of zeros.
    // `rows` and `cols` are the dimensions of the output matrix.
    function embed(mat, rows, cols) {
      let r = mat.rows;
      let c = mat.columns;
      if (r === rows && c === cols) {
        return mat;
      } else {
        let resultat = AbstractMatrix.zeros(rows, cols);
        resultat = resultat.setSubMatrix(mat, 0, 0);
        return resultat;
      }
    }

    // Make sure both matrices are the same size.
    // This is exclusively for simplicity:
    // this algorithm can be implemented with matrices of different sizes.

    let r = Math.max(r1, r2);
    let c = Math.max(c1, c2);
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

      let halfRows = parseInt(a.rows / 2, 10);
      let halfCols = parseInt(a.columns / 2, 10);
      // Subdivide input matrices.
      let a11 = a.subMatrix(0, halfRows - 1, 0, halfCols - 1);
      let b11 = b.subMatrix(0, halfRows - 1, 0, halfCols - 1);

      let a12 = a.subMatrix(0, halfRows - 1, halfCols, a.columns - 1);
      let b12 = b.subMatrix(0, halfRows - 1, halfCols, b.columns - 1);

      let a21 = a.subMatrix(halfRows, a.rows - 1, 0, halfCols - 1);
      let b21 = b.subMatrix(halfRows, b.rows - 1, 0, halfCols - 1);

      let a22 = a.subMatrix(halfRows, a.rows - 1, halfCols, a.columns - 1);
      let b22 = b.subMatrix(halfRows, b.rows - 1, halfCols, b.columns - 1);

      // Compute intermediate values.
      let m1 = blockMult(
        AbstractMatrix.add(a11, a22),
        AbstractMatrix.add(b11, b22),
        halfRows,
        halfCols,
      );
      let m2 = blockMult(AbstractMatrix.add(a21, a22), b11, halfRows, halfCols);
      let m3 = blockMult(a11, AbstractMatrix.sub(b12, b22), halfRows, halfCols);
      let m4 = blockMult(a22, AbstractMatrix.sub(b21, b11), halfRows, halfCols);
      let m5 = blockMult(AbstractMatrix.add(a11, a12), b22, halfRows, halfCols);
      let m6 = blockMult(
        AbstractMatrix.sub(a21, a11),
        AbstractMatrix.add(b11, b12),
        halfRows,
        halfCols,
      );
      let m7 = blockMult(
        AbstractMatrix.sub(a12, a22),
        AbstractMatrix.add(b21, b22),
        halfRows,
        halfCols,
      );

      // Combine intermediate values into the output.
      let c11 = AbstractMatrix.add(m1, m4);
      c11.sub(m5);
      c11.add(m7);
      let c12 = AbstractMatrix.add(m3, m5);
      let c21 = AbstractMatrix.add(m2, m4);
      let c22 = AbstractMatrix.sub(m1, m2);
      c22.add(m3);
      c22.add(m6);

      // Crop output to the desired size (undo dynamic padding).
      let resultat = AbstractMatrix.zeros(2 * c11.rows, 2 * c11.columns);
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
    let newMatrix = new Matrix(this.rows, this.columns);
    for (let i = 0; i < this.rows; i++) {
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
    let newMatrix = new Matrix(this.rows, this.columns);
    for (let i = 0; i < this.columns; i++) {
      const column = this.getColumn(i);
      rescale(column, {
        min: min,
        max: max,
        output: column,
      });
      newMatrix.setColumn(i, column);
    }
    return newMatrix;
  }

  flipRows() {
    const middle = Math.ceil(this.columns / 2);
    for (let i = 0; i < this.rows; i++) {
      for (let j = 0; j < middle; j++) {
        let first = this.get(i, j);
        let last = this.get(i, this.columns - 1 - j);
        this.set(i, j, last);
        this.set(i, this.columns - 1 - j, first);
      }
    }
    return this;
  }

  flipColumns() {
    const middle = Math.ceil(this.rows / 2);
    for (let j = 0; j < this.columns; j++) {
      for (let i = 0; i < middle; i++) {
        let first = this.get(i, j);
        let last = this.get(this.rows - 1 - i, j);
        this.set(i, j, last);
        this.set(this.rows - 1 - i, j, first);
      }
    }
    return this;
  }

  kroneckerProduct(other) {
    other = Matrix.checkMatrix(other);

    let m = this.rows;
    let n = this.columns;
    let p = other.rows;
    let q = other.columns;

    let result = new Matrix(m * p, n * q);
    for (let i = 0; i < m; i++) {
      for (let j = 0; j < n; j++) {
        for (let k = 0; k < p; k++) {
          for (let l = 0; l < q; l++) {
            result.set(p * i + k, q * j + l, this.get(i, j) * other.get(k, l));
          }
        }
      }
    }
    return result;
  }

  transpose() {
    let result = new Matrix(this.columns, this.rows);
    for (let i = 0; i < this.rows; i++) {
      for (let j = 0; j < this.columns; j++) {
        result.set(j, i, this.get(i, j));
      }
    }
    return result;
  }

  sortRows(compareFunction = compareNumbers) {
    for (let i = 0; i < this.rows; i++) {
      this.setRow(i, this.getRow(i).sort(compareFunction));
    }
    return this;
  }

  sortColumns(compareFunction = compareNumbers) {
    for (let i = 0; i < this.columns; i++) {
      this.setColumn(i, this.getColumn(i).sort(compareFunction));
    }
    return this;
  }

  subMatrix(startRow, endRow, startColumn, endColumn) {
    checkRange(this, startRow, endRow, startColumn, endColumn);
    let newMatrix = new Matrix(
      endRow - startRow + 1,
      endColumn - startColumn + 1,
    );
    for (let i = startRow; i <= endRow; i++) {
      for (let j = startColumn; j <= endColumn; j++) {
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

    let newMatrix = new Matrix(indices.length, endColumn - startColumn + 1);
    for (let i = 0; i < indices.length; i++) {
      for (let j = startColumn; j <= endColumn; j++) {
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

    let newMatrix = new Matrix(endRow - startRow + 1, indices.length);
    for (let i = 0; i < indices.length; i++) {
      for (let j = startRow; j <= endRow; j++) {
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
    let endRow = startRow + matrix.rows - 1;
    let endColumn = startColumn + matrix.columns - 1;
    checkRange(this, startRow, endRow, startColumn, endColumn);
    for (let i = 0; i < matrix.rows; i++) {
      for (let j = 0; j < matrix.columns; j++) {
        this.set(startRow + i, startColumn + j, matrix.get(i, j));
      }
    }
    return this;
  }

  selection(rowIndices, columnIndices) {
    let indices = checkIndices(this, rowIndices, columnIndices);
    let newMatrix = new Matrix(rowIndices.length, columnIndices.length);
    for (let i = 0; i < indices.row.length; i++) {
      let rowIndex = indices.row[i];
      for (let j = 0; j < indices.column.length; j++) {
        let columnIndex = indices.column[j];
        newMatrix.set(i, j, this.get(rowIndex, columnIndex));
      }
    }
    return newMatrix;
  }

  trace() {
    let min = Math.min(this.rows, this.columns);
    let trace = 0;
    for (let i = 0; i < min; i++) {
      trace += this.get(i, i);
    }
    return trace;
  }

  clone() {
    let newMatrix = new Matrix(this.rows, this.columns);
    for (let row = 0; row < this.rows; row++) {
      for (let column = 0; column < this.columns; column++) {
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
      for (let i = 0; i < variance.length; i++) {
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
      }
      case undefined: {
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
          'Data must be a 2D array with at least one element',
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
        'First argument must be a positive number or an array',
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
    for (let i = 0; i < this.rows; i++) {
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
    for (let i = 0; i < this.rows; i++) {
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
    let indices = checkIndices(matrix, rowIndices, columnIndices);
    super(matrix, indices.row.length, indices.column.length);
    this.rowIndices = indices.row;
    this.columnIndices = indices.column;
  }

  set(rowIndex, columnIndex, value) {
    this.matrix.set(
      this.rowIndices[rowIndex],
      this.columnIndices[columnIndex],
      value,
    );
    return this;
  }

  get(rowIndex, columnIndex) {
    return this.matrix.get(
      this.rowIndices[rowIndex],
      this.columnIndices[columnIndex],
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
      value,
    );
    return this;
  }

  get(rowIndex, columnIndex) {
    return this.matrix.get(
      this.startRow + rowIndex,
      this.startColumn + columnIndex,
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
    let index = this._calculateIndex(rowIndex, columnIndex);
    this.data[index] = value;
    return this;
  }

  get(rowIndex, columnIndex) {
    let index = this._calculateIndex(rowIndex, columnIndex);
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

    let lu = matrix.clone();
    let rows = lu.rows;
    let columns = lu.columns;
    let pivotVector = new Float64Array(rows);
    let pivotSign = 1;
    let i, j, k, p, s, t, v;
    let LUcolj, kmax;

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
    let data = this.LU;
    let col = data.columns;
    for (let j = 0; j < col; j++) {
      if (data.get(j, j) === 0) {
        return true;
      }
    }
    return false;
  }

  solve(value) {
    value = Matrix.checkMatrix(value);

    let lu = this.LU;
    let rows = lu.rows;

    if (rows !== value.rows) {
      throw new Error('Invalid matrix dimensions');
    }
    if (this.isSingular()) {
      throw new Error('LU matrix is singular');
    }

    let count = value.columns;
    let X = value.subMatrixRow(this.pivotVector, 0, count - 1);
    let columns = lu.columns;
    let i, j, k;

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
    let data = this.LU;
    if (!data.isSquare()) {
      throw new Error('Matrix must be square');
    }
    let determinant = this.pivotSign;
    let col = data.columns;
    for (let j = 0; j < col; j++) {
      determinant *= data.get(j, j);
    }
    return determinant;
  }

  get lowerTriangularMatrix() {
    let data = this.LU;
    let rows = data.rows;
    let columns = data.columns;
    let X = new Matrix(rows, columns);
    for (let i = 0; i < rows; i++) {
      for (let j = 0; j < columns; j++) {
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
    let data = this.LU;
    let rows = data.rows;
    let columns = data.columns;
    let X = new Matrix(rows, columns);
    for (let i = 0; i < rows; i++) {
      for (let j = 0; j < columns; j++) {
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
  let r = 0;
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

    let qr = value.clone();
    let m = value.rows;
    let n = value.columns;
    let rdiag = new Float64Array(n);
    let i, j, k, s;

    for (k = 0; k < n; k++) {
      let nrm = 0;
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

    let qr = this.QR;
    let m = qr.rows;

    if (value.rows !== m) {
      throw new Error('Matrix row dimensions must agree');
    }
    if (!this.isFullRank()) {
      throw new Error('Matrix is rank deficient');
    }

    let count = value.columns;
    let X = value.clone();
    let n = qr.columns;
    let i, j, k, s;

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
    let columns = this.QR.columns;
    for (let i = 0; i < columns; i++) {
      if (this.Rdiag[i] === 0) {
        return false;
      }
    }
    return true;
  }

  get upperTriangularMatrix() {
    let qr = this.QR;
    let n = qr.columns;
    let X = new Matrix(n, n);
    let i, j;
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
    let qr = this.QR;
    let rows = qr.rows;
    let columns = qr.columns;
    let X = new Matrix(rows, columns);
    let i, j, k, s;

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

          s = -s / qr.get(k, k);

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

    let m = value.rows;
    let n = value.columns;

    const {
      computeLeftSingularVectors = true,
      computeRightSingularVectors = true,
      autoTranspose = false,
    } = options;

    let wantu = Boolean(computeLeftSingularVectors);
    let wantv = Boolean(computeRightSingularVectors);

    let swapped = false;
    let a;
    if (m < n) {
      if (!autoTranspose) {
        a = value.clone();
        // eslint-disable-next-line no-console
        console.warn(
          'Computing SVD on a matrix with more columns than rows. Consider enabling autoTranspose',
        );
      } else {
        a = value.transpose();
        m = a.rows;
        n = a.columns;
        swapped = true;
        let aux = wantu;
        wantu = wantv;
        wantv = aux;
      }
    } else {
      a = value.clone();
    }

    let nu = Math.min(m, n);
    let ni = Math.min(m + 1, n);
    let s = new Float64Array(ni);
    let U = new Matrix(m, nu);
    let V = new Matrix(n, n);

    let e = new Float64Array(n);
    let work = new Float64Array(m);

    let si = new Float64Array(ni);
    for (let i = 0; i < ni; i++) si[i] = i;

    let nct = Math.min(m - 1, n);
    let nrt = Math.max(0, Math.min(n - 2, m));
    let mrc = Math.max(nct, nrt);

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

    let pp = p - 1;
    let eps = Number.EPSILON;
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
            Math.abs(e[k]),
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
      let tmp = V;
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
    let Y = value;
    let e = this.threshold;
    let scols = this.s.length;
    let Ls = Matrix.zeros(scols, scols);

    for (let i = 0; i < scols; i++) {
      if (Math.abs(this.s[i]) <= e) {
        Ls.set(i, i, 0);
      } else {
        Ls.set(i, i, 1 / this.s[i]);
      }
    }

    let U = this.U;
    let V = this.rightSingularVectors;

    let VL = V.mmul(Ls);
    let vrows = V.rows;
    let urows = U.rows;
    let VLU = Matrix.zeros(vrows, urows);

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
    let V = this.V;
    let e = this.threshold;
    let vrows = V.rows;
    let vcols = V.columns;
    let X = new Matrix(vrows, this.s.length);

    for (let i = 0; i < vrows; i++) {
      for (let j = 0; j < vcols; j++) {
        if (Math.abs(this.s[j]) > e) {
          X.set(i, j, V.get(i, j) / this.s[j]);
        }
      }
    }

    let U = this.U;

    let urows = U.rows;
    let ucols = U.columns;
    let Y = new Matrix(vrows, urows);

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
    let tol = Math.max(this.m, this.n) * this.s[0] * Number.EPSILON;
    let r = 0;
    let s = this.s;
    for (let i = 0, ii = s.length; i < ii; i++) {
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
    let a, b, c, d;
    if (matrix.columns === 2) {
      // 2 x 2 matrix
      a = matrix.get(0, 0);
      b = matrix.get(0, 1);
      c = matrix.get(1, 0);
      d = matrix.get(1, 1);

      return a * d - b * c;
    } else if (matrix.columns === 3) {
      // 3 x 3 matrix
      let subMatrix0, subMatrix1, subMatrix2;
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
  let range = [];
  for (let i = 0; i < n; i++) {
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
  thresholdError = 10e-10,
) {
  if (error > thresholdError) {
    return new Array(matrix.rows + 1).fill(0);
  } else {
    let returnArray = matrix.addRow(index, [0]);
    for (let i = 0; i < returnArray.rows; i++) {
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

  let n = matrix.rows;
  let results = new Matrix(n, n);

  for (let i = 0; i < n; i++) {
    let b = Matrix.columnVector(matrix.getRow(i));
    let Abis = matrix.subMatrixRow(xrange(n, i)).transpose();
    let svd = new SingularValueDecomposition(Abis);
    let x = svd.solve(b);
    let error = Matrix.sub(b, Abis.mmul(x))
      .abs()
      .max();
    results.setRow(
      i,
      dependenciesOneRow(error, x, i, thresholdValue, thresholdError),
    );
  }
  return results;
}

function pseudoInverse(matrix, threshold = Number.EPSILON) {
  matrix = Matrix.checkMatrix(matrix);
  let svdSolution = new SingularValueDecomposition(matrix, { autoTranspose: true });

  let U = svdSolution.leftSingularVectors;
  let V = svdSolution.rightSingularVectors;
  let s = svdSolution.diagonal;

  for (let i = 0; i < s.length; i++) {
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
  if (
    typeof yMatrix === 'object' &&
    !Matrix.isMatrix(yMatrix) &&
    !Array.isArray(yMatrix)
  ) {
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
  const cov = xMatrix.transpose().mmul(yMatrix);
  for (let i = 0; i < cov.rows; i++) {
    for (let j = 0; j < cov.columns; j++) {
      cov.set(i, j, cov.get(i, j) * (1 / (xMatrix.rows - 1)));
    }
  }
  return cov;
}

function correlation(xMatrix, yMatrix = xMatrix, options = {}) {
  xMatrix = Matrix.checkMatrix(xMatrix);
  let yIsSame = false;
  if (
    typeof yMatrix === 'object' &&
    !Matrix.isMatrix(yMatrix) &&
    !Array.isArray(yMatrix)
  ) {
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
  const sdy = yIsSame
    ? sdx
    : yMatrix.standardDeviation('column', { unbiased: true });

  const corr = xMatrix.transpose().mmul(yMatrix);
  for (let i = 0; i < corr.rows; i++) {
    for (let j = 0; j < corr.columns; j++) {
      corr.set(
        i,
        j,
        corr.get(i, j) * (1 / (sdx[i] * sdy[j])) * (1 / (xMatrix.rows - 1)),
      );
    }
  }
  return corr;
}

class EigenvalueDecomposition {
  constructor(matrix, options = {}) {
    const { assumeSymmetric = false } = options;

    matrix = WrapperMatrix2D.checkMatrix(matrix);
    if (!matrix.isSquare()) {
      throw new Error('Matrix is not a square matrix');
    }

    let n = matrix.columns;
    let V = new Matrix(n, n);
    let d = new Float64Array(n);
    let e = new Float64Array(n);
    let value = matrix;
    let i, j;

    let isSymmetric = false;
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
      let H = new Matrix(n, n);
      let ort = new Float64Array(n);
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
    let n = this.n;
    let e = this.e;
    let d = this.d;
    let X = new Matrix(n, n);
    let i, j;
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
  let f, g, h, i, j, k, hh, scale;

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
  let g, h, i, j, k, l, m, p, r, dl1, c, c2, c3, el1, s, s2;

  for (i = 1; i < n; i++) {
    e[i - 1] = e[i];
  }

  e[n - 1] = 0;

  let f = 0;
  let tst1 = 0;
  let eps = Number.EPSILON;

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
  let low = 0;
  let high = n - 1;
  let f, g, h, i, j, m;
  let scale;

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
  let n = nn - 1;
  let low = 0;
  let high = nn - 1;
  let eps = Number.EPSILON;
  let exshift = 0;
  let norm = 0;
  let p = 0;
  let q = 0;
  let r = 0;
  let s = 0;
  let z = 0;
  let iter = 0;
  let i, j, k, l, m, t, w, x, y;
  let ra, sa, vr, vi;
  let notlast, cdivres;

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
              Math.abs(x) > Math.abs(z) ? (-r - w * t) / x : (-s - y * t) / z,
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
              vi,
            );
            H.set(i, n - 1, cdivres[0]);
            H.set(i, n, cdivres[1]);
            if (Math.abs(x) > Math.abs(z) + Math.abs(q)) {
              H.set(
                i + 1,
                n - 1,
                (-ra - w * H.get(i, n - 1) + q * H.get(i, n)) / x,
              );
              H.set(
                i + 1,
                n,
                (-sa - w * H.get(i, n) - q * H.get(i, n - 1)) / x,
              );
            } else {
              cdivres = cdiv(
                -r - y * H.get(i, n - 1),
                -s - y * H.get(i, n),
                z,
                q,
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
  let r, d;
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

    let a = value;
    let dimension = a.rows;
    let l = new Matrix(dimension, dimension);
    let positiveDefinite = true;
    let i, j, k;

    for (j = 0; j < dimension; j++) {
      let d = 0;
      for (k = 0; k < j; k++) {
        let s = 0;
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

    this.L = l;
    this.positiveDefinite = Boolean(positiveDefinite);
  }

  isPositiveDefinite() {
    return this.positiveDefinite;
  }

  solve(value) {
    value = WrapperMatrix2D.checkMatrix(value);

    let l = this.L;
    let dimension = l.rows;

    if (value.rows !== dimension) {
      throw new Error('Matrix dimensions do not match');
    }
    if (this.isPositiveDefinite() === false) {
      throw new Error('Matrix is not positive definite');
    }

    let count = value.columns;
    let B = value.clone();
    let i, j, k;

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

},{"ml-array-rescale":43}],47:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

var mlMatrix = require('ml-matrix');

/**
 * Creates new PCA (Principal Component Analysis) from the dataset
 * @param {Matrix} dataset - dataset or covariance matrix.
 * @param {Object} [options]
 * @param {boolean} [options.isCovarianceMatrix=false] - true if the dataset is a covariance matrix.
 * @param {string} [options.method='SVD'] - select which method to use: SVD (default), covarianceMatrirx or NIPALS.
 * @param {number} [options.nCompNIPALS=2] - number of components to be computed with NIPALS.
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
      this.excludedFeatures = model.excludedFeatures || [];
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
      excludedFeatures: this.excludedFeatures,
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

},{"ml-matrix":46}],48:[function(require,module,exports){
/* @license
Papa Parse
v4.6.3
https://github.com/mholt/PapaParse
License: MIT
*/
Array.isArray||(Array.isArray=function(e){return"[object Array]"===Object.prototype.toString.call(e)}),function(e,t){"function"==typeof define&&define.amd?define([],t):"object"==typeof module&&"undefined"!=typeof exports?module.exports=t():e.Papa=t()}(this,function(){"use strict";var s,e,f="undefined"!=typeof self?self:"undefined"!=typeof window?window:void 0!==f?f:{},n=!f.document&&!!f.postMessage,o=n&&/(\?|&)papaworker(=|&|$)/.test(f.location.search),a=!1,h={},u=0,k={parse:function(e,t){var r=(t=t||{}).dynamicTyping||!1;z(r)&&(t.dynamicTypingFunction=r,r={});if(t.dynamicTyping=r,t.transform=!!z(t.transform)&&t.transform,t.worker&&k.WORKERS_SUPPORTED){var i=function(){if(!k.WORKERS_SUPPORTED)return!1;if(!a&&null===k.SCRIPT_PATH)throw new Error("Script path cannot be determined automatically when Papa Parse is loaded asynchronously. You need to set Papa.SCRIPT_PATH manually.");var e=k.SCRIPT_PATH||s;e+=(-1!==e.indexOf("?")?"&":"?")+"papaworker";var t=new f.Worker(e);return t.onmessage=m,t.id=u++,h[t.id]=t}();return i.userStep=t.step,i.userChunk=t.chunk,i.userComplete=t.complete,i.userError=t.error,t.step=z(t.step),t.chunk=z(t.chunk),t.complete=z(t.complete),t.error=z(t.error),delete t.worker,void i.postMessage({input:e,config:t,workerId:i.id})}var n=null;k.NODE_STREAM_INPUT,"string"==typeof e?n=t.download?new c(t):new _(t):!0===e.readable&&z(e.read)&&z(e.on)?n=new g(t):(f.File&&e instanceof File||e instanceof Object)&&(n=new p(t));return n.stream(e)},unparse:function(e,t){var i=!1,g=!0,m=",",y="\r\n",n='"',r=!1;!function(){if("object"!=typeof t)return;"string"!=typeof t.delimiter||k.BAD_DELIMITERS.filter(function(e){return-1!==t.delimiter.indexOf(e)}).length||(m=t.delimiter);("boolean"==typeof t.quotes||Array.isArray(t.quotes))&&(i=t.quotes);"boolean"!=typeof t.skipEmptyLines&&"string"!=typeof t.skipEmptyLines||(r=t.skipEmptyLines);"string"==typeof t.newline&&(y=t.newline);"string"==typeof t.quoteChar&&(n=t.quoteChar);"boolean"==typeof t.header&&(g=t.header)}();var s=new RegExp(M(n),"g");"string"==typeof e&&(e=JSON.parse(e));if(Array.isArray(e)){if(!e.length||Array.isArray(e[0]))return o(null,e,r);if("object"==typeof e[0])return o(a(e[0]),e,r)}else if("object"==typeof e)return"string"==typeof e.data&&(e.data=JSON.parse(e.data)),Array.isArray(e.data)&&(e.fields||(e.fields=e.meta&&e.meta.fields),e.fields||(e.fields=Array.isArray(e.data[0])?e.fields:a(e.data[0])),Array.isArray(e.data[0])||"object"==typeof e.data[0]||(e.data=[e.data])),o(e.fields||[],e.data||[],r);throw"exception: Unable to serialize unrecognized input";function a(e){if("object"!=typeof e)return[];var t=[];for(var r in e)t.push(r);return t}function o(e,t,r){var i="";"string"==typeof e&&(e=JSON.parse(e)),"string"==typeof t&&(t=JSON.parse(t));var n=Array.isArray(e)&&0<e.length,s=!Array.isArray(t[0]);if(n&&g){for(var a=0;a<e.length;a++)0<a&&(i+=m),i+=v(e[a],a);0<t.length&&(i+=y)}for(var o=0;o<t.length;o++){var h=n?e.length:t[o].length,u=!1,f=n?0===Object.keys(t[o]).length:0===t[o].length;if(r&&!n&&(u="greedy"===r?""===t[o].join("").trim():1===t[o].length&&0===t[o][0].length),"greedy"===r&&n){for(var d=[],l=0;l<h;l++){var c=s?e[l]:l;d.push(t[o][c])}u=""===d.join("").trim()}if(!u){for(var p=0;p<h;p++){0<p&&!f&&(i+=m);var _=n&&s?e[p]:p;i+=v(t[o][_],p)}o<t.length-1&&(!r||0<h&&!f)&&(i+=y)}}return i}function v(e,t){if(null==e)return"";if(e.constructor===Date)return JSON.stringify(e).slice(1,25);e=e.toString().replace(s,n+n);var r="boolean"==typeof i&&i||Array.isArray(i)&&i[t]||function(e,t){for(var r=0;r<t.length;r++)if(-1<e.indexOf(t[r]))return!0;return!1}(e,k.BAD_DELIMITERS)||-1<e.indexOf(m)||" "===e.charAt(0)||" "===e.charAt(e.length-1);return r?n+e+n:e}}};if(k.RECORD_SEP=String.fromCharCode(30),k.UNIT_SEP=String.fromCharCode(31),k.BYTE_ORDER_MARK="\ufeff",k.BAD_DELIMITERS=["\r","\n",'"',k.BYTE_ORDER_MARK],k.WORKERS_SUPPORTED=!n&&!!f.Worker,k.SCRIPT_PATH=null,k.NODE_STREAM_INPUT=1,k.LocalChunkSize=10485760,k.RemoteChunkSize=5242880,k.DefaultDelimiter=",",k.Parser=v,k.ParserHandle=r,k.NetworkStreamer=c,k.FileStreamer=p,k.StringStreamer=_,k.ReadableStreamStreamer=g,f.jQuery){var d=f.jQuery;d.fn.parse=function(o){var r=o.config||{},h=[];return this.each(function(e){if(!("INPUT"===d(this).prop("tagName").toUpperCase()&&"file"===d(this).attr("type").toLowerCase()&&f.FileReader)||!this.files||0===this.files.length)return!0;for(var t=0;t<this.files.length;t++)h.push({file:this.files[t],inputElem:this,instanceConfig:d.extend({},r)})}),e(),this;function e(){if(0!==h.length){var e,t,r,i,n=h[0];if(z(o.before)){var s=o.before(n.file,n.inputElem);if("object"==typeof s){if("abort"===s.action)return e="AbortError",t=n.file,r=n.inputElem,i=s.reason,void(z(o.error)&&o.error({name:e},t,r,i));if("skip"===s.action)return void u();"object"==typeof s.config&&(n.instanceConfig=d.extend(n.instanceConfig,s.config))}else if("skip"===s)return void u()}var a=n.instanceConfig.complete;n.instanceConfig.complete=function(e){z(a)&&a(e,n.file,n.inputElem),u()},k.parse(n.file,n.instanceConfig)}else z(o.complete)&&o.complete()}function u(){h.splice(0,1),e()}}}function l(e){this._handle=null,this._finished=!1,this._completed=!1,this._input=null,this._baseIndex=0,this._partialLine="",this._rowCount=0,this._start=0,this._nextChunk=null,this.isFirstChunk=!0,this._completeResults={data:[],errors:[],meta:{}},function(e){var t=E(e);t.chunkSize=parseInt(t.chunkSize),e.step||e.chunk||(t.chunkSize=null);this._handle=new r(t),(this._handle.streamer=this)._config=t}.call(this,e),this.parseChunk=function(e,t){if(this.isFirstChunk&&z(this._config.beforeFirstChunk)){var r=this._config.beforeFirstChunk(e);void 0!==r&&(e=r)}this.isFirstChunk=!1;var i=this._partialLine+e;this._partialLine="";var n=this._handle.parse(i,this._baseIndex,!this._finished);if(!this._handle.paused()&&!this._handle.aborted()){var s=n.meta.cursor;this._finished||(this._partialLine=i.substring(s-this._baseIndex),this._baseIndex=s),n&&n.data&&(this._rowCount+=n.data.length);var a=this._finished||this._config.preview&&this._rowCount>=this._config.preview;if(o)f.postMessage({results:n,workerId:k.WORKER_ID,finished:a});else if(z(this._config.chunk)&&!t){if(this._config.chunk(n,this._handle),this._handle.paused()||this._handle.aborted())return;n=void 0,this._completeResults=void 0}return this._config.step||this._config.chunk||(this._completeResults.data=this._completeResults.data.concat(n.data),this._completeResults.errors=this._completeResults.errors.concat(n.errors),this._completeResults.meta=n.meta),this._completed||!a||!z(this._config.complete)||n&&n.meta.aborted||(this._config.complete(this._completeResults,this._input),this._completed=!0),a||n&&n.meta.paused||this._nextChunk(),n}},this._sendError=function(e){z(this._config.error)?this._config.error(e):o&&this._config.error&&f.postMessage({workerId:k.WORKER_ID,error:e,finished:!1})}}function c(e){var i;(e=e||{}).chunkSize||(e.chunkSize=k.RemoteChunkSize),l.call(this,e),this._nextChunk=n?function(){this._readChunk(),this._chunkLoaded()}:function(){this._readChunk()},this.stream=function(e){this._input=e,this._nextChunk()},this._readChunk=function(){if(this._finished)this._chunkLoaded();else{if(i=new XMLHttpRequest,this._config.withCredentials&&(i.withCredentials=this._config.withCredentials),n||(i.onload=w(this._chunkLoaded,this),i.onerror=w(this._chunkError,this)),i.open("GET",this._input,!n),this._config.downloadRequestHeaders){var e=this._config.downloadRequestHeaders;for(var t in e)i.setRequestHeader(t,e[t])}if(this._config.chunkSize){var r=this._start+this._config.chunkSize-1;i.setRequestHeader("Range","bytes="+this._start+"-"+r),i.setRequestHeader("If-None-Match","webkit-no-cache")}try{i.send()}catch(e){this._chunkError(e.message)}n&&0===i.status?this._chunkError():this._start+=this._config.chunkSize}},this._chunkLoaded=function(){4===i.readyState&&(i.status<200||400<=i.status?this._chunkError():(this._finished=!this._config.chunkSize||this._start>function(e){var t=e.getResponseHeader("Content-Range");if(null===t)return-1;return parseInt(t.substr(t.lastIndexOf("/")+1))}(i),this.parseChunk(i.responseText)))},this._chunkError=function(e){var t=i.statusText||e;this._sendError(new Error(t))}}function p(e){var i,n;(e=e||{}).chunkSize||(e.chunkSize=k.LocalChunkSize),l.call(this,e);var s="undefined"!=typeof FileReader;this.stream=function(e){this._input=e,n=e.slice||e.webkitSlice||e.mozSlice,s?((i=new FileReader).onload=w(this._chunkLoaded,this),i.onerror=w(this._chunkError,this)):i=new FileReaderSync,this._nextChunk()},this._nextChunk=function(){this._finished||this._config.preview&&!(this._rowCount<this._config.preview)||this._readChunk()},this._readChunk=function(){var e=this._input;if(this._config.chunkSize){var t=Math.min(this._start+this._config.chunkSize,this._input.size);e=n.call(e,this._start,t)}var r=i.readAsText(e,this._config.encoding);s||this._chunkLoaded({target:{result:r}})},this._chunkLoaded=function(e){this._start+=this._config.chunkSize,this._finished=!this._config.chunkSize||this._start>=this._input.size,this.parseChunk(e.target.result)},this._chunkError=function(){this._sendError(i.error)}}function _(e){var r;l.call(this,e=e||{}),this.stream=function(e){return r=e,this._nextChunk()},this._nextChunk=function(){if(!this._finished){var e=this._config.chunkSize,t=e?r.substr(0,e):r;return r=e?r.substr(e):"",this._finished=!r,this.parseChunk(t)}}}function g(e){l.call(this,e=e||{});var t=[],r=!0,i=!1;this.pause=function(){l.prototype.pause.apply(this,arguments),this._input.pause()},this.resume=function(){l.prototype.resume.apply(this,arguments),this._input.resume()},this.stream=function(e){this._input=e,this._input.on("data",this._streamData),this._input.on("end",this._streamEnd),this._input.on("error",this._streamError)},this._checkIsFinished=function(){i&&1===t.length&&(this._finished=!0)},this._nextChunk=function(){this._checkIsFinished(),t.length?this.parseChunk(t.shift()):r=!0},this._streamData=w(function(e){try{t.push("string"==typeof e?e:e.toString(this._config.encoding)),r&&(r=!1,this._checkIsFinished(),this.parseChunk(t.shift()))}catch(e){this._streamError(e)}},this),this._streamError=w(function(e){this._streamCleanUp(),this._sendError(e)},this),this._streamEnd=w(function(){this._streamCleanUp(),i=!0,this._streamData("")},this),this._streamCleanUp=w(function(){this._input.removeListener("data",this._streamData),this._input.removeListener("end",this._streamEnd),this._input.removeListener("error",this._streamError)},this)}function r(g){var a,o,h,i=/^\s*-?(\d*\.?\d+|\d+\.?\d*)(e[-+]?\d+)?\s*$/i,n=/(\d{4}-[01]\d-[0-3]\dT[0-2]\d:[0-5]\d:[0-5]\d\.\d+([+-][0-2]\d:[0-5]\d|Z))|(\d{4}-[01]\d-[0-3]\dT[0-2]\d:[0-5]\d:[0-5]\d([+-][0-2]\d:[0-5]\d|Z))|(\d{4}-[01]\d-[0-3]\dT[0-2]\d:[0-5]\d([+-][0-2]\d:[0-5]\d|Z))/,t=this,r=0,s=0,u=!1,e=!1,f=[],d={data:[],errors:[],meta:{}};if(z(g.step)){var l=g.step;g.step=function(e){if(d=e,p())c();else{if(c(),0===d.data.length)return;r+=e.data.length,g.preview&&r>g.preview?o.abort():l(d,t)}}}function m(e){return"greedy"===g.skipEmptyLines?""===e.join("").trim():1===e.length&&0===e[0].length}function c(){if(d&&h&&(y("Delimiter","UndetectableDelimiter","Unable to auto-detect delimiting character; defaulted to '"+k.DefaultDelimiter+"'"),h=!1),g.skipEmptyLines)for(var e=0;e<d.data.length;e++)m(d.data[e])&&d.data.splice(e--,1);return p()&&function(){if(!d)return;for(var e=0;p()&&e<d.data.length;e++)for(var t=0;t<d.data[e].length;t++){var r=d.data[e][t];g.trimHeaders&&(r=r.trim()),f.push(r)}d.data.splice(0,1)}(),function(){if(!d||!g.header&&!g.dynamicTyping&&!g.transform)return d;for(var e=0;e<d.data.length;e++){var t,r=g.header?{}:[];for(t=0;t<d.data[e].length;t++){var i=t,n=d.data[e][t];g.header&&(i=t>=f.length?"__parsed_extra":f[t]),g.transform&&(n=g.transform(n,i)),n=_(i,n),"__parsed_extra"===i?(r[i]=r[i]||[],r[i].push(n)):r[i]=n}d.data[e]=r,g.header&&(t>f.length?y("FieldMismatch","TooManyFields","Too many fields: expected "+f.length+" fields but parsed "+t,s+e):t<f.length&&y("FieldMismatch","TooFewFields","Too few fields: expected "+f.length+" fields but parsed "+t,s+e))}g.header&&d.meta&&(d.meta.fields=f);return s+=d.data.length,d}()}function p(){return g.header&&0===f.length}function _(e,t){return r=e,g.dynamicTypingFunction&&void 0===g.dynamicTyping[r]&&(g.dynamicTyping[r]=g.dynamicTypingFunction(r)),!0===(g.dynamicTyping[r]||g.dynamicTyping)?"true"===t||"TRUE"===t||"false"!==t&&"FALSE"!==t&&(i.test(t)?parseFloat(t):n.test(t)?new Date(t):""===t?null:t):t;var r}function y(e,t,r,i){d.errors.push({type:e,code:t,message:r,row:i})}this.parse=function(e,t,r){var i=g.quoteChar||'"';if(g.newline||(g.newline=function(e,t){e=e.substr(0,1048576);var r=new RegExp(M(t)+"([^]*?)"+M(t),"gm"),i=(e=e.replace(r,"")).split("\r"),n=e.split("\n"),s=1<n.length&&n[0].length<i[0].length;if(1===i.length||s)return"\n";for(var a=0,o=0;o<i.length;o++)"\n"===i[o][0]&&a++;return a>=i.length/2?"\r\n":"\r"}(e,i)),h=!1,g.delimiter)z(g.delimiter)&&(g.delimiter=g.delimiter(e),d.meta.delimiter=g.delimiter);else{var n=function(e,t,r,i){for(var n,s,a,o=[",","\t","|",";",k.RECORD_SEP,k.UNIT_SEP],h=0;h<o.length;h++){var u=o[h],f=0,d=0,l=0;a=void 0;for(var c=new v({comments:i,delimiter:u,newline:t,preview:10}).parse(e),p=0;p<c.data.length;p++)if(r&&m(c.data[p]))l++;else{var _=c.data[p].length;d+=_,void 0!==a?1<_&&(f+=Math.abs(_-a),a=_):a=0}0<c.data.length&&(d/=c.data.length-l),(void 0===s||s<f)&&1.99<d&&(s=f,n=u)}return{successful:!!(g.delimiter=n),bestDelimiter:n}}(e,g.newline,g.skipEmptyLines,g.comments);n.successful?g.delimiter=n.bestDelimiter:(h=!0,g.delimiter=k.DefaultDelimiter),d.meta.delimiter=g.delimiter}var s=E(g);return g.preview&&g.header&&s.preview++,a=e,o=new v(s),d=o.parse(a,t,r),c(),u?{meta:{paused:!0}}:d||{meta:{paused:!1}}},this.paused=function(){return u},this.pause=function(){u=!0,o.abort(),a=a.substr(o.getCharIndex())},this.resume=function(){u=!1,t.streamer.parseChunk(a,!0)},this.aborted=function(){return e},this.abort=function(){e=!0,o.abort(),d.meta.aborted=!0,z(g.complete)&&g.complete(d),a=""}}function M(e){return e.replace(/[.*+?^${}()|[\]\\]/g,"\\$&")}function v(e){var S,O=(e=e||{}).delimiter,x=e.newline,T=e.comments,I=e.step,A=e.preview,D=e.fastMode,L=S=void 0===e.quoteChar?'"':e.quoteChar;if(void 0!==e.escapeChar&&(L=e.escapeChar),("string"!=typeof O||-1<k.BAD_DELIMITERS.indexOf(O))&&(O=","),T===O)throw"Comment character same as delimiter";!0===T?T="#":("string"!=typeof T||-1<k.BAD_DELIMITERS.indexOf(T))&&(T=!1),"\n"!==x&&"\r"!==x&&"\r\n"!==x&&(x="\n");var P=0,F=!1;this.parse=function(i,t,r){if("string"!=typeof i)throw"Input must be a string";var n=i.length,e=O.length,s=x.length,a=T.length,o=z(I),h=[],u=[],f=[],d=P=0;if(!i)return C();if(D||!1!==D&&-1===i.indexOf(S)){for(var l=i.split(x),c=0;c<l.length;c++){if(f=l[c],P+=f.length,c!==l.length-1)P+=x.length;else if(r)return C();if(!T||f.substr(0,a)!==T){if(o){if(h=[],k(f.split(O)),R(),F)return C()}else k(f.split(O));if(A&&A<=c)return h=h.slice(0,A),C(!0)}}return C()}for(var p,_=i.indexOf(O,P),g=i.indexOf(x,P),m=new RegExp(M(L)+M(S),"g");;)if(i[P]!==S)if(T&&0===f.length&&i.substr(P,a)===T){if(-1===g)return C();P=g+s,g=i.indexOf(x,P),_=i.indexOf(O,P)}else if(-1!==_&&(_<g||-1===g))f.push(i.substring(P,_)),P=_+e,_=i.indexOf(O,P);else{if(-1===g)break;if(f.push(i.substring(P,g)),w(g+s),o&&(R(),F))return C();if(A&&h.length>=A)return C(!0)}else for(p=P,P++;;){if(-1===(p=i.indexOf(S,p+1)))return r||u.push({type:"Quotes",code:"MissingQuotes",message:"Quoted field unterminated",row:h.length,index:P}),E();if(p===n-1)return E(i.substring(P,p).replace(m,S));if(S!==L||i[p+1]!==L){if(S===L||0===p||i[p-1]!==L){var y=b(-1===g?_:Math.min(_,g));if(i[p+1+y]===O){f.push(i.substring(P,p).replace(m,S)),P=p+1+y+e,_=i.indexOf(O,P),g=i.indexOf(x,P);break}var v=b(g);if(i.substr(p+1+v,s)===x){if(f.push(i.substring(P,p).replace(m,S)),w(p+1+v+s),_=i.indexOf(O,P),o&&(R(),F))return C();if(A&&h.length>=A)return C(!0);break}u.push({type:"Quotes",code:"InvalidQuotes",message:"Trailing quote on quoted field is malformed",row:h.length,index:P}),p++}}else p++}return E();function k(e){h.push(e),d=P}function b(e){var t=0;if(-1!==e){var r=i.substring(p+1,e);r&&""===r.trim()&&(t=r.length)}return t}function E(e){return r||(void 0===e&&(e=i.substr(P)),f.push(e),P=n,k(f),o&&R()),C()}function w(e){P=e,k(f),f=[],g=i.indexOf(x,P)}function C(e){return{data:h,errors:u,meta:{delimiter:O,linebreak:x,aborted:F,truncated:!!e,cursor:d+(t||0)}}}function R(){I(C()),h=[],u=[]}},this.abort=function(){F=!0},this.getCharIndex=function(){return P}}function m(e){var t=e.data,r=h[t.workerId],i=!1;if(t.error)r.userError(t.error,t.file);else if(t.results&&t.results.data){var n={abort:function(){i=!0,y(t.workerId,{data:[],errors:[],meta:{aborted:!0}})},pause:b,resume:b};if(z(r.userStep)){for(var s=0;s<t.results.data.length&&(r.userStep({data:[t.results.data[s]],errors:t.results.errors,meta:t.results.meta},n),!i);s++);delete t.results}else z(r.userChunk)&&(r.userChunk(t.results,n,t.file),delete t.results)}t.finished&&!i&&y(t.workerId,t.results)}function y(e,t){var r=h[e];z(r.userComplete)&&r.userComplete(t),r.terminate(),delete h[e]}function b(){throw"Not implemented."}function E(e){if("object"!=typeof e||null===e)return e;var t=Array.isArray(e)?[]:{};for(var r in e)t[r]=E(e[r]);return t}function w(e,t){return function(){e.apply(t,arguments)}}function z(e){return"function"==typeof e}return o?f.onmessage=function(e){var t=e.data;void 0===k.WORKER_ID&&t&&(k.WORKER_ID=t.workerId);if("string"==typeof t.input)f.postMessage({workerId:k.WORKER_ID,results:k.parse(t.input,t.config),finished:!0});else if(f.File&&t.input instanceof File||t.input instanceof Object){var r=k.parse(t.input,t.config);r&&f.postMessage({workerId:k.WORKER_ID,results:r,finished:!0})}}:k.WORKERS_SUPPORTED&&(e=document.getElementsByTagName("script"),s=e.length?e[e.length-1].src:"",document.body?document.addEventListener("DOMContentLoaded",function(){a=!0},!0):a=!0),(c.prototype=Object.create(l.prototype)).constructor=c,(p.prototype=Object.create(l.prototype)).constructor=p,(_.prototype=Object.create(_.prototype)).constructor=_,(g.prototype=Object.create(l.prototype)).constructor=g,k});
},{}],49:[function(require,module,exports){
"use strict";
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (Object.hasOwnProperty.call(mod, k)) result[k] = mod[k];
    result["default"] = mod;
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
var utils = __importStar(require("./utils"));
function makeHeap(nPoints, size) {
    var makeArrays = function (fillValue) {
        return utils.empty(nPoints).map(function () {
            return utils.filled(size, fillValue);
        });
    };
    var heap = [];
    heap.push(makeArrays(-1));
    heap.push(makeArrays(Infinity));
    heap.push(makeArrays(0));
    return heap;
}
exports.makeHeap = makeHeap;
function rejectionSample(nSamples, poolSize, random) {
    var result = utils.zeros(nSamples);
    for (var i = 0; i < nSamples; i++) {
        var rejectSample = true;
        var j = 0;
        while (rejectSample) {
            j = utils.tauRandInt(poolSize, random);
            var broken = false;
            for (var k = 0; k < i; k++) {
                if (j === result[k]) {
                    broken = true;
                    break;
                }
            }
            if (!broken)
                rejectSample = false;
        }
        result[i] = j;
    }
    return result;
}
exports.rejectionSample = rejectionSample;
function heapPush(heap, row, weight, index, flag) {
    row = Math.floor(row);
    var indices = heap[0][row];
    var weights = heap[1][row];
    var isNew = heap[2][row];
    if (weight >= weights[0]) {
        return 0;
    }
    for (var i = 0; i < indices.length; i++) {
        if (index === indices[i]) {
            return 0;
        }
    }
    return uncheckedHeapPush(heap, row, weight, index, flag);
}
exports.heapPush = heapPush;
function uncheckedHeapPush(heap, row, weight, index, flag) {
    var indices = heap[0][row];
    var weights = heap[1][row];
    var isNew = heap[2][row];
    if (weight >= weights[0]) {
        return 0;
    }
    weights[0] = weight;
    indices[0] = index;
    isNew[0] = flag;
    var i = 0;
    var iSwap = 0;
    while (true) {
        var ic1 = 2 * i + 1;
        var ic2 = ic1 + 1;
        var heapShape2 = heap[0][0].length;
        if (ic1 >= heapShape2) {
            break;
        }
        else if (ic2 >= heapShape2) {
            if (weights[ic1] > weight) {
                iSwap = ic1;
            }
            else {
                break;
            }
        }
        else if (weights[ic1] >= weights[ic2]) {
            if (weight < weights[ic1]) {
                iSwap = ic1;
            }
            else {
                break;
            }
        }
        else {
            if (weight < weights[ic2]) {
                iSwap = ic2;
            }
            else {
                break;
            }
        }
        weights[i] = weights[iSwap];
        indices[i] = indices[iSwap];
        isNew[i] = isNew[iSwap];
        i = iSwap;
    }
    weights[i] = weight;
    indices[i] = index;
    isNew[i] = flag;
    return 1;
}
exports.uncheckedHeapPush = uncheckedHeapPush;
function buildCandidates(currentGraph, nVertices, nNeighbors, maxCandidates, random) {
    var candidateNeighbors = makeHeap(nVertices, maxCandidates);
    for (var i = 0; i < nVertices; i++) {
        for (var j = 0; j < nNeighbors; j++) {
            if (currentGraph[0][i][j] < 0) {
                continue;
            }
            var idx = currentGraph[0][i][j];
            var isn = currentGraph[2][i][j];
            var d = utils.tauRand(random);
            heapPush(candidateNeighbors, i, d, idx, isn);
            heapPush(candidateNeighbors, idx, d, i, isn);
            currentGraph[2][i][j] = 0;
        }
    }
    return candidateNeighbors;
}
exports.buildCandidates = buildCandidates;
function deheapSort(heap) {
    var indices = heap[0];
    var weights = heap[1];
    for (var i = 0; i < indices.length; i++) {
        var indHeap = indices[i];
        var distHeap = weights[i];
        for (var j = 0; j < indHeap.length - 1; j++) {
            var indHeapIndex = indHeap.length - j - 1;
            var distHeapIndex = distHeap.length - j - 1;
            var temp1 = indHeap[0];
            indHeap[0] = indHeap[indHeapIndex];
            indHeap[indHeapIndex] = temp1;
            var temp2 = distHeap[0];
            distHeap[0] = distHeap[distHeapIndex];
            distHeap[distHeapIndex] = temp2;
            siftDown(distHeap, indHeap, distHeapIndex, 0);
        }
    }
    return { indices: indices, weights: weights };
}
exports.deheapSort = deheapSort;
function siftDown(heap1, heap2, ceiling, elt) {
    while (elt * 2 + 1 < ceiling) {
        var leftChild = elt * 2 + 1;
        var rightChild = leftChild + 1;
        var swap = elt;
        if (heap1[swap] < heap1[leftChild]) {
            swap = leftChild;
        }
        if (rightChild < ceiling && heap1[swap] < heap1[rightChild]) {
            swap = rightChild;
        }
        if (swap === elt) {
            break;
        }
        else {
            var temp1 = heap1[elt];
            heap1[elt] = heap1[swap];
            heap1[swap] = temp1;
            var temp2 = heap2[elt];
            heap2[elt] = heap2[swap];
            heap2[swap] = temp2;
            elt = swap;
        }
    }
}
function smallestFlagged(heap, row) {
    var ind = heap[0][row];
    var dist = heap[1][row];
    var flag = heap[2][row];
    var minDist = Infinity;
    var resultIndex = -1;
    for (var i = 0; i > ind.length; i++) {
        if (flag[i] === 1 && dist[i] < minDist) {
            minDist = dist[i];
            resultIndex = i;
        }
    }
    if (resultIndex >= 0) {
        flag[resultIndex] = 0;
        return Math.floor(ind[resultIndex]);
    }
    else {
        return -1;
    }
}
exports.smallestFlagged = smallestFlagged;

},{"./utils":55}],50:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var umap_1 = require("./umap");
exports.UMAP = umap_1.UMAP;

},{"./umap":54}],51:[function(require,module,exports){
"use strict";
var __read = (this && this.__read) || function (o, n) {
    var m = typeof Symbol === "function" && o[Symbol.iterator];
    if (!m) return o;
    var i = m.call(o), r, ar = [], e;
    try {
        while ((n === void 0 || n-- > 0) && !(r = i.next()).done) ar.push(r.value);
    }
    catch (error) { e = { error: error }; }
    finally {
        try {
            if (r && !r.done && (m = i["return"])) m.call(i);
        }
        finally { if (e) throw e.error; }
    }
    return ar;
};
var __values = (this && this.__values) || function (o) {
    var m = typeof Symbol === "function" && o[Symbol.iterator], i = 0;
    if (m) return m.call(o);
    return {
        next: function () {
            if (o && i >= o.length) o = void 0;
            return { value: o && o[i++], done: !o };
        }
    };
};
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (Object.hasOwnProperty.call(mod, k)) result[k] = mod[k];
    result["default"] = mod;
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
var _a;
var utils = __importStar(require("./utils"));
var SparseMatrix = (function () {
    function SparseMatrix(rows, cols, values, dims) {
        this.entries = new Map();
        this.nRows = 0;
        this.nCols = 0;
        if (rows.length !== cols.length || rows.length !== values.length) {
            throw new Error('rows, cols and values arrays must all have the same length');
        }
        this.nRows = dims[0];
        this.nCols = dims[1];
        for (var i = 0; i < values.length; i++) {
            var row = rows[i];
            var col = cols[i];
            this.checkDims(row, col);
            var key = this.makeKey(row, col);
            this.entries.set(key, { value: values[i], row: row, col: col });
        }
    }
    SparseMatrix.prototype.makeKey = function (row, col) {
        return row + ":" + col;
    };
    SparseMatrix.prototype.checkDims = function (row, col) {
        var withinBounds = row < this.nRows && col < this.nCols;
        if (!withinBounds) {
            throw new Error('row and/or col specified outside of matrix dimensions');
        }
    };
    SparseMatrix.prototype.set = function (row, col, value) {
        this.checkDims(row, col);
        var key = this.makeKey(row, col);
        if (!this.entries.has(key)) {
            this.entries.set(key, { value: value, row: row, col: col });
        }
        else {
            this.entries.get(key).value = value;
        }
    };
    SparseMatrix.prototype.get = function (row, col, defaultValue) {
        if (defaultValue === void 0) { defaultValue = 0; }
        this.checkDims(row, col);
        var key = this.makeKey(row, col);
        if (this.entries.has(key)) {
            return this.entries.get(key).value;
        }
        else {
            return defaultValue;
        }
    };
    SparseMatrix.prototype.getAll = function (ordered) {
        if (ordered === void 0) { ordered = true; }
        var rowColValues = [];
        this.entries.forEach(function (value) {
            rowColValues.push(value);
        });
        if (ordered) {
            rowColValues.sort(function (a, b) {
                if (a.row === b.row) {
                    return a.col - b.col;
                }
                else {
                    return a.row - b.row;
                }
            });
        }
        return rowColValues;
    };
    SparseMatrix.prototype.getDims = function () {
        return [this.nRows, this.nCols];
    };
    SparseMatrix.prototype.getRows = function () {
        return Array.from(this.entries, function (_a) {
            var _b = __read(_a, 2), key = _b[0], value = _b[1];
            return value.row;
        });
    };
    SparseMatrix.prototype.getCols = function () {
        return Array.from(this.entries, function (_a) {
            var _b = __read(_a, 2), key = _b[0], value = _b[1];
            return value.col;
        });
    };
    SparseMatrix.prototype.getValues = function () {
        return Array.from(this.entries, function (_a) {
            var _b = __read(_a, 2), key = _b[0], value = _b[1];
            return value.value;
        });
    };
    SparseMatrix.prototype.forEach = function (fn) {
        this.entries.forEach(function (value) { return fn(value.value, value.row, value.col); });
    };
    SparseMatrix.prototype.map = function (fn) {
        var vals = [];
        this.entries.forEach(function (value) {
            vals.push(fn(value.value, value.row, value.col));
        });
        var dims = [this.nRows, this.nCols];
        return new SparseMatrix(this.getRows(), this.getCols(), vals, dims);
    };
    SparseMatrix.prototype.toArray = function () {
        var _this = this;
        var rows = utils.empty(this.nRows);
        var output = rows.map(function () {
            return utils.zeros(_this.nCols);
        });
        this.entries.forEach(function (value) {
            output[value.row][value.col] = value.value;
        });
        return output;
    };
    return SparseMatrix;
}());
exports.SparseMatrix = SparseMatrix;
function transpose(matrix) {
    var cols = [];
    var rows = [];
    var vals = [];
    matrix.forEach(function (value, row, col) {
        cols.push(row);
        rows.push(col);
        vals.push(value);
    });
    var dims = [matrix.nCols, matrix.nRows];
    return new SparseMatrix(rows, cols, vals, dims);
}
exports.transpose = transpose;
function identity(size) {
    var _a = __read(size, 1), rows = _a[0];
    var matrix = new SparseMatrix([], [], [], size);
    for (var i = 0; i < rows; i++) {
        matrix.set(i, i, 1);
    }
    return matrix;
}
exports.identity = identity;
function pairwiseMultiply(a, b) {
    return elementWise(a, b, function (x, y) { return x * y; });
}
exports.pairwiseMultiply = pairwiseMultiply;
function add(a, b) {
    return elementWise(a, b, function (x, y) { return x + y; });
}
exports.add = add;
function subtract(a, b) {
    return elementWise(a, b, function (x, y) { return x - y; });
}
exports.subtract = subtract;
function maximum(a, b) {
    return elementWise(a, b, function (x, y) { return (x > y ? x : y); });
}
exports.maximum = maximum;
function multiplyScalar(a, scalar) {
    return a.map(function (value) {
        return value * scalar;
    });
}
exports.multiplyScalar = multiplyScalar;
function eliminateZeros(m) {
    var zeroIndices = new Set();
    var values = m.getValues();
    var rows = m.getRows();
    var cols = m.getCols();
    for (var i = 0; i < values.length; i++) {
        if (values[i] === 0) {
            zeroIndices.add(i);
        }
    }
    var removeByZeroIndex = function (_, index) { return !zeroIndices.has(index); };
    var nextValues = values.filter(removeByZeroIndex);
    var nextRows = rows.filter(removeByZeroIndex);
    var nextCols = cols.filter(removeByZeroIndex);
    return new SparseMatrix(nextRows, nextCols, nextValues, m.getDims());
}
exports.eliminateZeros = eliminateZeros;
function normalize(m, normType) {
    if (normType === void 0) { normType = "l2"; }
    var e_1, _a;
    var normFn = normFns[normType];
    var colsByRow = new Map();
    m.forEach(function (_, row, col) {
        var cols = colsByRow.get(row) || [];
        cols.push(col);
        colsByRow.set(row, cols);
    });
    var nextMatrix = new SparseMatrix([], [], [], m.getDims());
    var _loop_1 = function (row) {
        var cols = colsByRow.get(row).sort();
        var vals = cols.map(function (col) { return m.get(row, col); });
        var norm = normFn(vals);
        for (var i = 0; i < norm.length; i++) {
            nextMatrix.set(row, cols[i], norm[i]);
        }
    };
    try {
        for (var _b = __values(colsByRow.keys()), _c = _b.next(); !_c.done; _c = _b.next()) {
            var row = _c.value;
            _loop_1(row);
        }
    }
    catch (e_1_1) { e_1 = { error: e_1_1 }; }
    finally {
        try {
            if (_c && !_c.done && (_a = _b.return)) _a.call(_b);
        }
        finally { if (e_1) throw e_1.error; }
    }
    return nextMatrix;
}
exports.normalize = normalize;
var normFns = (_a = {},
    _a["max"] = function (xs) {
        var max = -Infinity;
        for (var i = 0; i < xs.length; i++) {
            max = xs[i] > max ? xs[i] : max;
        }
        return xs.map(function (x) { return x / max; });
    },
    _a["l1"] = function (xs) {
        var sum = 0;
        for (var i = 0; i < xs.length; i++) {
            sum += xs[i];
        }
        return xs.map(function (x) { return x / sum; });
    },
    _a["l2"] = function (xs) {
        var sum = 0;
        for (var i = 0; i < xs.length; i++) {
            sum += Math.pow(xs[i], 2);
        }
        return xs.map(function (x) { return Math.sqrt(Math.pow(x, 2) / sum); });
    },
    _a);
function elementWise(a, b, op) {
    var visited = new Set();
    var rows = [];
    var cols = [];
    var vals = [];
    var operate = function (row, col) {
        rows.push(row);
        cols.push(col);
        var nextValue = op(a.get(row, col), b.get(row, col));
        vals.push(nextValue);
    };
    var valuesA = a.getValues();
    var rowsA = a.getRows();
    var colsA = a.getCols();
    for (var i = 0; i < valuesA.length; i++) {
        var row = rowsA[i];
        var col = colsA[i];
        var key = row + ":" + col;
        visited.add(key);
        operate(row, col);
    }
    var valuesB = b.getValues();
    var rowsB = b.getRows();
    var colsB = b.getCols();
    for (var i = 0; i < valuesB.length; i++) {
        var row = rowsB[i];
        var col = colsB[i];
        var key = row + ":" + col;
        if (visited.has(key))
            continue;
        operate(row, col);
    }
    var dims = [a.nRows, a.nCols];
    return new SparseMatrix(rows, cols, vals, dims);
}
function getCSR(x) {
    var entries = [];
    x.forEach(function (value, row, col) {
        entries.push({ value: value, row: row, col: col });
    });
    entries.sort(function (a, b) {
        if (a.row === b.row) {
            return a.col - b.col;
        }
        else {
            return a.row - b.row;
        }
    });
    var indices = [];
    var values = [];
    var indptr = [];
    var currentRow = -1;
    for (var i = 0; i < entries.length; i++) {
        var _a = entries[i], row = _a.row, col = _a.col, value = _a.value;
        if (row !== currentRow) {
            currentRow = row;
            indptr.push(i);
        }
        indices.push(col);
        values.push(value);
    }
    return { indices: indices, values: values, indptr: indptr };
}
exports.getCSR = getCSR;

},{"./utils":55}],52:[function(require,module,exports){
"use strict";
var __values = (this && this.__values) || function (o) {
    var m = typeof Symbol === "function" && o[Symbol.iterator], i = 0;
    if (m) return m.call(o);
    return {
        next: function () {
            if (o && i >= o.length) o = void 0;
            return { value: o && o[i++], done: !o };
        }
    };
};
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (Object.hasOwnProperty.call(mod, k)) result[k] = mod[k];
    result["default"] = mod;
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
var heap = __importStar(require("./heap"));
var matrix = __importStar(require("./matrix"));
var tree = __importStar(require("./tree"));
var utils = __importStar(require("./utils"));
function makeNNDescent(distanceFn, random) {
    return function nNDescent(data, leafArray, nNeighbors, nIters, maxCandidates, delta, rho, rpTreeInit) {
        if (nIters === void 0) { nIters = 10; }
        if (maxCandidates === void 0) { maxCandidates = 50; }
        if (delta === void 0) { delta = 0.001; }
        if (rho === void 0) { rho = 0.5; }
        if (rpTreeInit === void 0) { rpTreeInit = true; }
        var nVertices = data.length;
        var currentGraph = heap.makeHeap(data.length, nNeighbors);
        for (var i = 0; i < data.length; i++) {
            var indices = heap.rejectionSample(nNeighbors, data.length, random);
            for (var j = 0; j < indices.length; j++) {
                var d = distanceFn(data[i], data[indices[j]]);
                heap.heapPush(currentGraph, i, d, indices[j], 1);
                heap.heapPush(currentGraph, indices[j], d, i, 1);
            }
        }
        if (rpTreeInit) {
            for (var n = 0; n < leafArray.length; n++) {
                for (var i = 0; i < leafArray[n].length; i++) {
                    if (leafArray[n][i] < 0) {
                        break;
                    }
                    for (var j = i + 1; j < leafArray[n].length; j++) {
                        if (leafArray[n][j] < 0) {
                            break;
                        }
                        var d = distanceFn(data[leafArray[n][i]], data[leafArray[n][j]]);
                        heap.heapPush(currentGraph, leafArray[n][i], d, leafArray[n][j], 1);
                        heap.heapPush(currentGraph, leafArray[n][j], d, leafArray[n][i], 1);
                    }
                }
            }
        }
        for (var n = 0; n < nIters; n++) {
            var candidateNeighbors = heap.buildCandidates(currentGraph, nVertices, nNeighbors, maxCandidates, random);
            var c = 0;
            for (var i = 0; i < nVertices; i++) {
                for (var j = 0; j < maxCandidates; j++) {
                    var p = Math.floor(candidateNeighbors[0][i][j]);
                    if (p < 0 || utils.tauRand(random) < rho) {
                        continue;
                    }
                    for (var k = 0; k < maxCandidates; k++) {
                        var q = Math.floor(candidateNeighbors[0][i][k]);
                        var cj = candidateNeighbors[2][i][j];
                        var ck = candidateNeighbors[2][i][k];
                        if (q < 0 || (!cj && !ck)) {
                            continue;
                        }
                        var d = distanceFn(data[p], data[q]);
                        c += heap.heapPush(currentGraph, p, d, q, 1);
                        c += heap.heapPush(currentGraph, q, d, p, 1);
                    }
                }
            }
            if (c <= delta * nNeighbors * data.length) {
                break;
            }
        }
        var sorted = heap.deheapSort(currentGraph);
        return sorted;
    };
}
exports.makeNNDescent = makeNNDescent;
function makeInitializations(distanceFn) {
    function initFromRandom(nNeighbors, data, queryPoints, _heap, random) {
        for (var i = 0; i < queryPoints.length; i++) {
            var indices = utils.rejectionSample(nNeighbors, data.length, random);
            for (var j = 0; j < indices.length; j++) {
                if (indices[j] < 0) {
                    continue;
                }
                var d = distanceFn(data[indices[j]], queryPoints[i]);
                heap.heapPush(_heap, i, d, indices[j], 1);
            }
        }
    }
    function initFromTree(_tree, data, queryPoints, _heap, random) {
        for (var i = 0; i < queryPoints.length; i++) {
            var indices = tree.searchFlatTree(queryPoints[i], _tree, random);
            for (var j = 0; j < indices.length; j++) {
                if (indices[j] < 0) {
                    return;
                }
                var d = distanceFn(data[indices[j]], queryPoints[i]);
                heap.heapPush(_heap, i, d, indices[j], 1);
            }
        }
        return;
    }
    return { initFromRandom: initFromRandom, initFromTree: initFromTree };
}
exports.makeInitializations = makeInitializations;
function makeInitializedNNSearch(distanceFn) {
    return function nnSearchFn(data, graph, initialization, queryPoints) {
        var e_1, _a;
        var _b = matrix.getCSR(graph), indices = _b.indices, indptr = _b.indptr;
        for (var i = 0; i < queryPoints.length; i++) {
            var tried = new Set(initialization[0][i]);
            while (true) {
                var vertex = heap.smallestFlagged(initialization, i);
                if (vertex === -1) {
                    break;
                }
                var candidates = indices.slice(indptr[vertex], indptr[vertex + 1]);
                try {
                    for (var candidates_1 = __values(candidates), candidates_1_1 = candidates_1.next(); !candidates_1_1.done; candidates_1_1 = candidates_1.next()) {
                        var candidate = candidates_1_1.value;
                        if (candidate === vertex ||
                            candidate === -1 ||
                            tried.has(candidate)) {
                            continue;
                        }
                        var d = distanceFn(data[candidate], queryPoints[i]);
                        heap.uncheckedHeapPush(initialization, i, d, candidate, 1);
                        tried.add(candidate);
                    }
                }
                catch (e_1_1) { e_1 = { error: e_1_1 }; }
                finally {
                    try {
                        if (candidates_1_1 && !candidates_1_1.done && (_a = candidates_1.return)) _a.call(candidates_1);
                    }
                    finally { if (e_1) throw e_1.error; }
                }
            }
        }
        return initialization;
    };
}
exports.makeInitializedNNSearch = makeInitializedNNSearch;
function initializeSearch(forest, data, queryPoints, nNeighbors, initFromRandom, initFromTree, random) {
    var e_2, _a;
    var results = heap.makeHeap(queryPoints.length, nNeighbors);
    initFromRandom(nNeighbors, data, queryPoints, results, random);
    if (forest) {
        try {
            for (var forest_1 = __values(forest), forest_1_1 = forest_1.next(); !forest_1_1.done; forest_1_1 = forest_1.next()) {
                var tree_1 = forest_1_1.value;
                initFromTree(tree_1, data, queryPoints, results, random);
            }
        }
        catch (e_2_1) { e_2 = { error: e_2_1 }; }
        finally {
            try {
                if (forest_1_1 && !forest_1_1.done && (_a = forest_1.return)) _a.call(forest_1);
            }
            finally { if (e_2) throw e_2.error; }
        }
    }
    return results;
}
exports.initializeSearch = initializeSearch;

},{"./heap":49,"./matrix":51,"./tree":53,"./utils":55}],53:[function(require,module,exports){
"use strict";
var __read = (this && this.__read) || function (o, n) {
    var m = typeof Symbol === "function" && o[Symbol.iterator];
    if (!m) return o;
    var i = m.call(o), r, ar = [], e;
    try {
        while ((n === void 0 || n-- > 0) && !(r = i.next()).done) ar.push(r.value);
    }
    catch (error) { e = { error: error }; }
    finally {
        try {
            if (r && !r.done && (m = i["return"])) m.call(i);
        }
        finally { if (e) throw e.error; }
    }
    return ar;
};
var __spread = (this && this.__spread) || function () {
    for (var ar = [], i = 0; i < arguments.length; i++) ar = ar.concat(__read(arguments[i]));
    return ar;
};
var __values = (this && this.__values) || function (o) {
    var m = typeof Symbol === "function" && o[Symbol.iterator], i = 0;
    if (m) return m.call(o);
    return {
        next: function () {
            if (o && i >= o.length) o = void 0;
            return { value: o && o[i++], done: !o };
        }
    };
};
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (Object.hasOwnProperty.call(mod, k)) result[k] = mod[k];
    result["default"] = mod;
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
var utils = __importStar(require("./utils"));
var FlatTree = (function () {
    function FlatTree(hyperplanes, offsets, children, indices) {
        this.hyperplanes = hyperplanes;
        this.offsets = offsets;
        this.children = children;
        this.indices = indices;
    }
    return FlatTree;
}());
exports.FlatTree = FlatTree;
function makeForest(data, nNeighbors, nTrees, random) {
    var leafSize = Math.max(10, nNeighbors);
    var trees = utils
        .range(nTrees)
        .map(function (_, i) { return makeTree(data, leafSize, i, random); });
    var forest = trees.map(function (tree) { return flattenTree(tree, leafSize); });
    return forest;
}
exports.makeForest = makeForest;
function makeTree(data, leafSize, n, random) {
    if (leafSize === void 0) { leafSize = 30; }
    var indices = utils.range(data.length);
    var tree = makeEuclideanTree(data, indices, leafSize, n, random);
    return tree;
}
function makeEuclideanTree(data, indices, leafSize, q, random) {
    if (leafSize === void 0) { leafSize = 30; }
    if (indices.length > leafSize) {
        var splitResults = euclideanRandomProjectionSplit(data, indices, random);
        var indicesLeft = splitResults.indicesLeft, indicesRight = splitResults.indicesRight, hyperplane = splitResults.hyperplane, offset = splitResults.offset;
        var leftChild = makeEuclideanTree(data, indicesLeft, leafSize, q + 1, random);
        var rightChild = makeEuclideanTree(data, indicesRight, leafSize, q + 1, random);
        var node = { leftChild: leftChild, rightChild: rightChild, isLeaf: false, hyperplane: hyperplane, offset: offset };
        return node;
    }
    else {
        var node = { indices: indices, isLeaf: true };
        return node;
    }
}
function euclideanRandomProjectionSplit(data, indices, random) {
    var dim = data[0].length;
    var leftIndex = utils.tauRandInt(indices.length, random);
    var rightIndex = utils.tauRandInt(indices.length, random);
    rightIndex += leftIndex === rightIndex ? 1 : 0;
    rightIndex = rightIndex % indices.length;
    var left = indices[leftIndex];
    var right = indices[rightIndex];
    var hyperplaneOffset = 0;
    var hyperplaneVector = utils.zeros(dim);
    for (var i = 0; i < hyperplaneVector.length; i++) {
        hyperplaneVector[i] = data[left][i] - data[right][i];
        hyperplaneOffset -=
            (hyperplaneVector[i] * (data[left][i] + data[right][i])) / 2.0;
    }
    var nLeft = 0;
    var nRight = 0;
    var side = utils.zeros(indices.length);
    for (var i = 0; i < indices.length; i++) {
        var margin = hyperplaneOffset;
        for (var d = 0; d < dim; d++) {
            margin += hyperplaneVector[d] * data[indices[i]][d];
        }
        if (margin === 0) {
            side[i] = utils.tauRandInt(2, random);
            if (side[i] === 0) {
                nLeft += 1;
            }
            else {
                nRight += 1;
            }
        }
        else if (margin > 0) {
            side[i] = 0;
            nLeft += 1;
        }
        else {
            side[i] = 1;
            nRight += 1;
        }
    }
    var indicesLeft = utils.zeros(nLeft);
    var indicesRight = utils.zeros(nRight);
    nLeft = 0;
    nRight = 0;
    for (var i in utils.range(side.length)) {
        if (side[i] === 0) {
            indicesLeft[nLeft] = indices[i];
            nLeft += 1;
        }
        else {
            indicesRight[nRight] = indices[i];
            nRight += 1;
        }
    }
    return {
        indicesLeft: indicesLeft,
        indicesRight: indicesRight,
        hyperplane: hyperplaneVector,
        offset: hyperplaneOffset,
    };
}
function flattenTree(tree, leafSize) {
    var nNodes = numNodes(tree);
    var nLeaves = numLeaves(tree);
    var hyperplanes = utils
        .range(nNodes)
        .map(function () { return utils.zeros(tree.hyperplane ? tree.hyperplane.length : 0); });
    var offsets = utils.zeros(nNodes);
    var children = utils.range(nNodes).map(function () { return [-1, -1]; });
    var indices = utils
        .range(nLeaves)
        .map(function () { return utils.range(leafSize).map(function () { return -1; }); });
    recursiveFlatten(tree, hyperplanes, offsets, children, indices, 0, 0);
    return new FlatTree(hyperplanes, offsets, children, indices);
}
function recursiveFlatten(tree, hyperplanes, offsets, children, indices, nodeNum, leafNum) {
    var _a;
    if (tree.isLeaf) {
        children[nodeNum][0] = -leafNum;
        (_a = indices[leafNum]).splice.apply(_a, __spread([0, tree.indices.length], tree.indices));
        leafNum += 1;
        return { nodeNum: nodeNum, leafNum: leafNum };
    }
    else {
        hyperplanes[nodeNum] = tree.hyperplane;
        offsets[nodeNum] = tree.offset;
        children[nodeNum][0] = nodeNum + 1;
        var oldNodeNum = nodeNum;
        var res = recursiveFlatten(tree.leftChild, hyperplanes, offsets, children, indices, nodeNum + 1, leafNum);
        nodeNum = res.nodeNum;
        leafNum = res.leafNum;
        children[oldNodeNum][1] = nodeNum + 1;
        res = recursiveFlatten(tree.rightChild, hyperplanes, offsets, children, indices, nodeNum + 1, leafNum);
        return { nodeNum: res.nodeNum, leafNum: res.leafNum };
    }
}
function numNodes(tree) {
    if (tree.isLeaf) {
        return 1;
    }
    else {
        return 1 + numNodes(tree.leftChild) + numNodes(tree.rightChild);
    }
}
function numLeaves(tree) {
    if (tree.isLeaf) {
        return 1;
    }
    else {
        return numLeaves(tree.leftChild) + numLeaves(tree.rightChild);
    }
}
function makeLeafArray(rpForest) {
    var e_1, _a;
    if (rpForest.length > 0) {
        var output = [];
        try {
            for (var rpForest_1 = __values(rpForest), rpForest_1_1 = rpForest_1.next(); !rpForest_1_1.done; rpForest_1_1 = rpForest_1.next()) {
                var tree = rpForest_1_1.value;
                output.push.apply(output, __spread(tree.indices));
            }
        }
        catch (e_1_1) { e_1 = { error: e_1_1 }; }
        finally {
            try {
                if (rpForest_1_1 && !rpForest_1_1.done && (_a = rpForest_1.return)) _a.call(rpForest_1);
            }
            finally { if (e_1) throw e_1.error; }
        }
        return output;
    }
    else {
        return [[-1]];
    }
}
exports.makeLeafArray = makeLeafArray;
function selectSide(hyperplane, offset, point, random) {
    var margin = offset;
    for (var d = 0; d < point.length; d++) {
        margin += hyperplane[d] * point[d];
    }
    if (margin === 0) {
        var side = utils.tauRandInt(2, random);
        return side;
    }
    else if (margin > 0) {
        return 0;
    }
    else {
        return 1;
    }
}
function searchFlatTree(point, tree, random) {
    var node = 0;
    while (tree.children[node][0] > 0) {
        var side = selectSide(tree.hyperplanes[node], tree.offsets[node], point, random);
        if (side === 0) {
            node = tree.children[node][0];
        }
        else {
            node = tree.children[node][1];
        }
    }
    var index = -1 * tree.children[node][0];
    return tree.indices[index];
}
exports.searchFlatTree = searchFlatTree;

},{"./utils":55}],54:[function(require,module,exports){
"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
var __read = (this && this.__read) || function (o, n) {
    var m = typeof Symbol === "function" && o[Symbol.iterator];
    if (!m) return o;
    var i = m.call(o), r, ar = [], e;
    try {
        while ((n === void 0 || n-- > 0) && !(r = i.next()).done) ar.push(r.value);
    }
    catch (error) { e = { error: error }; }
    finally {
        try {
            if (r && !r.done && (m = i["return"])) m.call(i);
        }
        finally { if (e) throw e.error; }
    }
    return ar;
};
var __spread = (this && this.__spread) || function () {
    for (var ar = [], i = 0; i < arguments.length; i++) ar = ar.concat(__read(arguments[i]));
    return ar;
};
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (Object.hasOwnProperty.call(mod, k)) result[k] = mod[k];
    result["default"] = mod;
    return result;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var heap = __importStar(require("./heap"));
var matrix = __importStar(require("./matrix"));
var nnDescent = __importStar(require("./nn_descent"));
var tree = __importStar(require("./tree"));
var utils = __importStar(require("./utils"));
var ml_levenberg_marquardt_1 = __importDefault(require("ml-levenberg-marquardt"));
var SMOOTH_K_TOLERANCE = 1e-5;
var MIN_K_DIST_SCALE = 1e-3;
var UMAP = (function () {
    function UMAP(params) {
        if (params === void 0) { params = {}; }
        var _this = this;
        this.learningRate = 1.0;
        this.localConnectivity = 1.0;
        this.minDist = 0.1;
        this.nComponents = 2;
        this.nEpochs = 0;
        this.nNeighbors = 15;
        this.negativeSampleRate = 5;
        this.random = Math.random;
        this.repulsionStrength = 1.0;
        this.setOpMixRatio = 1.0;
        this.spread = 1.0;
        this.transformQueueSize = 4.0;
        this.targetMetric = "categorical";
        this.targetWeight = 0.5;
        this.targetNNeighbors = this.nNeighbors;
        this.distanceFn = euclidean;
        this.isInitialized = false;
        this.rpForest = [];
        this.embedding = [];
        this.optimizationState = new OptimizationState();
        var setParam = function (key) {
            if (params[key] !== undefined)
                _this[key] = params[key];
        };
        setParam('distanceFn');
        setParam('learningRate');
        setParam('localConnectivity');
        setParam('minDist');
        setParam('nComponents');
        setParam('nEpochs');
        setParam('nNeighbors');
        setParam('negativeSampleRate');
        setParam('random');
        setParam('repulsionStrength');
        setParam('setOpMixRatio');
        setParam('spread');
        setParam('transformQueueSize');
    }
    UMAP.prototype.fit = function (X) {
        this.initializeFit(X);
        this.optimizeLayout();
        return this.embedding;
    };
    UMAP.prototype.fitAsync = function (X, callback) {
        if (callback === void 0) { callback = function () { return true; }; }
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        this.initializeFit(X);
                        return [4, this.optimizeLayoutAsync(callback)];
                    case 1:
                        _a.sent();
                        return [2, this.embedding];
                }
            });
        });
    };
    UMAP.prototype.setSupervisedProjection = function (Y, params) {
        if (params === void 0) { params = {}; }
        this.Y = Y;
        this.targetMetric = params.targetMetric || this.targetMetric;
        this.targetWeight = params.targetWeight || this.targetWeight;
        this.targetNNeighbors = params.targetNNeighbors || this.targetNNeighbors;
    };
    UMAP.prototype.setPrecomputedKNN = function (knnIndices, knnDistances) {
        this.knnIndices = knnIndices;
        this.knnDistances = knnDistances;
    };
    UMAP.prototype.initializeFit = function (X) {
        if (X.length <= this.nNeighbors) {
            throw new Error("Not enough data points (" + X.length + ") to create nNeighbors: " + this.nNeighbors + ".  Add more data points or adjust the configuration.");
        }
        if (this.X === X && this.isInitialized) {
            return this.getNEpochs();
        }
        this.X = X;
        if (!this.knnIndices && !this.knnDistances) {
            var knnResults = this.nearestNeighbors(X);
            this.knnIndices = knnResults.knnIndices;
            this.knnDistances = knnResults.knnDistances;
        }
        this.graph = this.fuzzySimplicialSet(X, this.nNeighbors, this.setOpMixRatio);
        this.makeSearchFns();
        this.searchGraph = this.makeSearchGraph(X);
        this.processGraphForSupervisedProjection();
        var _a = this.initializeSimplicialSetEmbedding(), head = _a.head, tail = _a.tail, epochsPerSample = _a.epochsPerSample;
        this.optimizationState.head = head;
        this.optimizationState.tail = tail;
        this.optimizationState.epochsPerSample = epochsPerSample;
        this.initializeOptimization();
        this.prepareForOptimizationLoop();
        this.isInitialized = true;
        return this.getNEpochs();
    };
    UMAP.prototype.makeSearchFns = function () {
        var _a = nnDescent.makeInitializations(this.distanceFn), initFromTree = _a.initFromTree, initFromRandom = _a.initFromRandom;
        this.initFromTree = initFromTree;
        this.initFromRandom = initFromRandom;
        this.search = nnDescent.makeInitializedNNSearch(this.distanceFn);
    };
    UMAP.prototype.makeSearchGraph = function (X) {
        var knnIndices = this.knnIndices;
        var knnDistances = this.knnDistances;
        var dims = [X.length, X.length];
        var searchGraph = new matrix.SparseMatrix([], [], [], dims);
        for (var i = 0; i < knnIndices.length; i++) {
            var knn = knnIndices[i];
            var distances = knnDistances[i];
            for (var j = 0; j < knn.length; j++) {
                var neighbor = knn[j];
                var distance = distances[j];
                if (distance > 0) {
                    searchGraph.set(i, neighbor, distance);
                }
            }
        }
        var transpose = matrix.transpose(searchGraph);
        return matrix.maximum(searchGraph, transpose);
    };
    UMAP.prototype.transform = function (toTransform) {
        var _this = this;
        var rawData = this.X;
        if (rawData === undefined || rawData.length === 0) {
            throw new Error('No data has been fit.');
        }
        var nNeighbors = Math.floor(this.nNeighbors * this.transformQueueSize);
        nNeighbors = Math.min(rawData.length, nNeighbors);
        var init = nnDescent.initializeSearch(this.rpForest, rawData, toTransform, nNeighbors, this.initFromRandom, this.initFromTree, this.random);
        var result = this.search(rawData, this.searchGraph, init, toTransform);
        var _a = heap.deheapSort(result), indices = _a.indices, distances = _a.weights;
        indices = indices.map(function (x) { return x.slice(0, _this.nNeighbors); });
        distances = distances.map(function (x) { return x.slice(0, _this.nNeighbors); });
        var adjustedLocalConnectivity = Math.max(0, this.localConnectivity - 1);
        var _b = this.smoothKNNDistance(distances, this.nNeighbors, adjustedLocalConnectivity), sigmas = _b.sigmas, rhos = _b.rhos;
        var _c = this.computeMembershipStrengths(indices, distances, sigmas, rhos), rows = _c.rows, cols = _c.cols, vals = _c.vals;
        var size = [toTransform.length, rawData.length];
        var graph = new matrix.SparseMatrix(rows, cols, vals, size);
        var normed = matrix.normalize(graph, "l1");
        var csrMatrix = matrix.getCSR(normed);
        var nPoints = toTransform.length;
        var eIndices = utils.reshape2d(csrMatrix.indices, nPoints, this.nNeighbors);
        var eWeights = utils.reshape2d(csrMatrix.values, nPoints, this.nNeighbors);
        var embedding = initTransform(eIndices, eWeights, this.embedding);
        var nEpochs = this.nEpochs
            ? this.nEpochs / 3
            : graph.nRows <= 10000
                ? 100
                : 30;
        var graphMax = graph
            .getValues()
            .reduce(function (max, val) { return (val > max ? val : max); }, 0);
        graph = graph.map(function (value) { return (value < graphMax / nEpochs ? 0 : value); });
        graph = matrix.eliminateZeros(graph);
        var epochsPerSample = this.makeEpochsPerSample(graph.getValues(), nEpochs);
        var head = graph.getRows();
        var tail = graph.getCols();
        this.assignOptimizationStateParameters({
            headEmbedding: embedding,
            tailEmbedding: this.embedding,
            head: head,
            tail: tail,
            currentEpoch: 0,
            nEpochs: nEpochs,
            nVertices: graph.getDims()[1],
            epochsPerSample: epochsPerSample,
        });
        this.prepareForOptimizationLoop();
        return this.optimizeLayout();
    };
    UMAP.prototype.processGraphForSupervisedProjection = function () {
        var _a = this, Y = _a.Y, X = _a.X;
        if (Y) {
            if (Y.length !== X.length) {
                throw new Error('Length of X and y must be equal');
            }
            if (this.targetMetric === "categorical") {
                var lt = this.targetWeight < 1.0;
                var farDist = lt ? 2.5 * (1.0 / (1.0 - this.targetWeight)) : 1.0e12;
                this.graph = this.categoricalSimplicialSetIntersection(this.graph, Y, farDist);
            }
        }
    };
    UMAP.prototype.step = function () {
        var currentEpoch = this.optimizationState.currentEpoch;
        if (currentEpoch < this.getNEpochs()) {
            this.optimizeLayoutStep(currentEpoch);
        }
        return this.optimizationState.currentEpoch;
    };
    UMAP.prototype.getEmbedding = function () {
        return this.embedding;
    };
    UMAP.prototype.nearestNeighbors = function (X) {
        var _a = this, distanceFn = _a.distanceFn, nNeighbors = _a.nNeighbors;
        var log2 = function (n) { return Math.log(n) / Math.log(2); };
        var metricNNDescent = nnDescent.makeNNDescent(distanceFn, this.random);
        var round = function (n) {
            return n === 0.5 ? 0 : Math.round(n);
        };
        var nTrees = 5 + Math.floor(round(Math.pow(X.length, 0.5) / 20.0));
        var nIters = Math.max(5, Math.floor(Math.round(log2(X.length))));
        this.rpForest = tree.makeForest(X, nNeighbors, nTrees, this.random);
        var leafArray = tree.makeLeafArray(this.rpForest);
        var _b = metricNNDescent(X, leafArray, nNeighbors, nIters), indices = _b.indices, weights = _b.weights;
        return { knnIndices: indices, knnDistances: weights };
    };
    UMAP.prototype.fuzzySimplicialSet = function (X, nNeighbors, setOpMixRatio) {
        if (setOpMixRatio === void 0) { setOpMixRatio = 1.0; }
        var _a = this, _b = _a.knnIndices, knnIndices = _b === void 0 ? [] : _b, _c = _a.knnDistances, knnDistances = _c === void 0 ? [] : _c, localConnectivity = _a.localConnectivity;
        var _d = this.smoothKNNDistance(knnDistances, nNeighbors, localConnectivity), sigmas = _d.sigmas, rhos = _d.rhos;
        var _e = this.computeMembershipStrengths(knnIndices, knnDistances, sigmas, rhos), rows = _e.rows, cols = _e.cols, vals = _e.vals;
        var size = [X.length, X.length];
        var sparseMatrix = new matrix.SparseMatrix(rows, cols, vals, size);
        var transpose = matrix.transpose(sparseMatrix);
        var prodMatrix = matrix.pairwiseMultiply(sparseMatrix, transpose);
        var a = matrix.subtract(matrix.add(sparseMatrix, transpose), prodMatrix);
        var b = matrix.multiplyScalar(a, setOpMixRatio);
        var c = matrix.multiplyScalar(prodMatrix, 1.0 - setOpMixRatio);
        var result = matrix.add(b, c);
        return result;
    };
    UMAP.prototype.categoricalSimplicialSetIntersection = function (simplicialSet, target, farDist, unknownDist) {
        if (unknownDist === void 0) { unknownDist = 1.0; }
        var intersection = fastIntersection(simplicialSet, target, unknownDist, farDist);
        intersection = matrix.eliminateZeros(intersection);
        return resetLocalConnectivity(intersection);
    };
    UMAP.prototype.smoothKNNDistance = function (distances, k, localConnectivity, nIter, bandwidth) {
        if (localConnectivity === void 0) { localConnectivity = 1.0; }
        if (nIter === void 0) { nIter = 64; }
        if (bandwidth === void 0) { bandwidth = 1.0; }
        var target = (Math.log(k) / Math.log(2)) * bandwidth;
        var rho = utils.zeros(distances.length);
        var result = utils.zeros(distances.length);
        for (var i = 0; i < distances.length; i++) {
            var lo = 0.0;
            var hi = Infinity;
            var mid = 1.0;
            var ithDistances = distances[i];
            var nonZeroDists = ithDistances.filter(function (d) { return d > 0.0; });
            if (nonZeroDists.length >= localConnectivity) {
                var index = Math.floor(localConnectivity);
                var interpolation = localConnectivity - index;
                if (index > 0) {
                    rho[i] = nonZeroDists[index - 1];
                    if (interpolation > SMOOTH_K_TOLERANCE) {
                        rho[i] +=
                            interpolation * (nonZeroDists[index] - nonZeroDists[index - 1]);
                    }
                }
                else {
                    rho[i] = interpolation * nonZeroDists[0];
                }
            }
            else if (nonZeroDists.length > 0) {
                rho[i] = utils.max(nonZeroDists);
            }
            for (var n = 0; n < nIter; n++) {
                var psum = 0.0;
                for (var j = 1; j < distances[i].length; j++) {
                    var d = distances[i][j] - rho[i];
                    if (d > 0) {
                        psum += Math.exp(-(d / mid));
                    }
                    else {
                        psum += 1.0;
                    }
                }
                if (Math.abs(psum - target) < SMOOTH_K_TOLERANCE) {
                    break;
                }
                if (psum > target) {
                    hi = mid;
                    mid = (lo + hi) / 2.0;
                }
                else {
                    lo = mid;
                    if (hi === Infinity) {
                        mid *= 2;
                    }
                    else {
                        mid = (lo + hi) / 2.0;
                    }
                }
            }
            result[i] = mid;
            if (rho[i] > 0.0) {
                var meanIthDistances = utils.mean(ithDistances);
                if (result[i] < MIN_K_DIST_SCALE * meanIthDistances) {
                    result[i] = MIN_K_DIST_SCALE * meanIthDistances;
                }
            }
            else {
                var meanDistances = utils.mean(distances.map(utils.mean));
                if (result[i] < MIN_K_DIST_SCALE * meanDistances) {
                    result[i] = MIN_K_DIST_SCALE * meanDistances;
                }
            }
        }
        return { sigmas: result, rhos: rho };
    };
    UMAP.prototype.computeMembershipStrengths = function (knnIndices, knnDistances, sigmas, rhos) {
        var nSamples = knnIndices.length;
        var nNeighbors = knnIndices[0].length;
        var rows = utils.zeros(nSamples * nNeighbors);
        var cols = utils.zeros(nSamples * nNeighbors);
        var vals = utils.zeros(nSamples * nNeighbors);
        for (var i = 0; i < nSamples; i++) {
            for (var j = 0; j < nNeighbors; j++) {
                var val = 0;
                if (knnIndices[i][j] === -1) {
                    continue;
                }
                if (knnIndices[i][j] === i) {
                    val = 0.0;
                }
                else if (knnDistances[i][j] - rhos[i] <= 0.0) {
                    val = 1.0;
                }
                else {
                    val = Math.exp(-((knnDistances[i][j] - rhos[i]) / sigmas[i]));
                }
                rows[i * nNeighbors + j] = i;
                cols[i * nNeighbors + j] = knnIndices[i][j];
                vals[i * nNeighbors + j] = val;
            }
        }
        return { rows: rows, cols: cols, vals: vals };
    };
    UMAP.prototype.initializeSimplicialSetEmbedding = function () {
        var _this = this;
        var nEpochs = this.getNEpochs();
        var nComponents = this.nComponents;
        var graphValues = this.graph.getValues();
        var graphMax = 0;
        for (var i = 0; i < graphValues.length; i++) {
            var value = graphValues[i];
            if (graphMax < graphValues[i]) {
                graphMax = value;
            }
        }
        var graph = this.graph.map(function (value) {
            if (value < graphMax / nEpochs) {
                return 0;
            }
            else {
                return value;
            }
        });
        this.embedding = utils.zeros(graph.nRows).map(function () {
            return utils.zeros(nComponents).map(function () {
                return utils.tauRand(_this.random) * 20 + -10;
            });
        });
        var weights = [];
        var head = [];
        var tail = [];
        var rowColValues = graph.getAll();
        for (var i = 0; i < rowColValues.length; i++) {
            var entry = rowColValues[i];
            if (entry.value) {
                weights.push(entry.value);
                tail.push(entry.row);
                head.push(entry.col);
            }
        }
        var epochsPerSample = this.makeEpochsPerSample(weights, nEpochs);
        return { head: head, tail: tail, epochsPerSample: epochsPerSample };
    };
    UMAP.prototype.makeEpochsPerSample = function (weights, nEpochs) {
        var result = utils.filled(weights.length, -1.0);
        var max = utils.max(weights);
        var nSamples = weights.map(function (w) { return (w / max) * nEpochs; });
        nSamples.forEach(function (n, i) {
            if (n > 0)
                result[i] = nEpochs / nSamples[i];
        });
        return result;
    };
    UMAP.prototype.assignOptimizationStateParameters = function (state) {
        Object.assign(this.optimizationState, state);
    };
    UMAP.prototype.prepareForOptimizationLoop = function () {
        var _a = this, repulsionStrength = _a.repulsionStrength, learningRate = _a.learningRate, negativeSampleRate = _a.negativeSampleRate;
        var _b = this.optimizationState, epochsPerSample = _b.epochsPerSample, headEmbedding = _b.headEmbedding, tailEmbedding = _b.tailEmbedding;
        var dim = headEmbedding[0].length;
        var moveOther = headEmbedding.length === tailEmbedding.length;
        var epochsPerNegativeSample = epochsPerSample.map(function (e) { return e / negativeSampleRate; });
        var epochOfNextNegativeSample = __spread(epochsPerNegativeSample);
        var epochOfNextSample = __spread(epochsPerSample);
        this.assignOptimizationStateParameters({
            epochOfNextSample: epochOfNextSample,
            epochOfNextNegativeSample: epochOfNextNegativeSample,
            epochsPerNegativeSample: epochsPerNegativeSample,
            moveOther: moveOther,
            initialAlpha: learningRate,
            alpha: learningRate,
            gamma: repulsionStrength,
            dim: dim,
        });
    };
    UMAP.prototype.initializeOptimization = function () {
        var headEmbedding = this.embedding;
        var tailEmbedding = this.embedding;
        var _a = this.optimizationState, head = _a.head, tail = _a.tail, epochsPerSample = _a.epochsPerSample;
        var nEpochs = this.getNEpochs();
        var nVertices = this.graph.nCols;
        var _b = findABParams(this.spread, this.minDist), a = _b.a, b = _b.b;
        this.assignOptimizationStateParameters({
            headEmbedding: headEmbedding,
            tailEmbedding: tailEmbedding,
            head: head,
            tail: tail,
            epochsPerSample: epochsPerSample,
            a: a,
            b: b,
            nEpochs: nEpochs,
            nVertices: nVertices,
        });
    };
    UMAP.prototype.optimizeLayoutStep = function (n) {
        var optimizationState = this.optimizationState;
        var head = optimizationState.head, tail = optimizationState.tail, headEmbedding = optimizationState.headEmbedding, tailEmbedding = optimizationState.tailEmbedding, epochsPerSample = optimizationState.epochsPerSample, epochOfNextSample = optimizationState.epochOfNextSample, epochOfNextNegativeSample = optimizationState.epochOfNextNegativeSample, epochsPerNegativeSample = optimizationState.epochsPerNegativeSample, moveOther = optimizationState.moveOther, initialAlpha = optimizationState.initialAlpha, alpha = optimizationState.alpha, gamma = optimizationState.gamma, a = optimizationState.a, b = optimizationState.b, dim = optimizationState.dim, nEpochs = optimizationState.nEpochs, nVertices = optimizationState.nVertices;
        var clipValue = 4.0;
        for (var i = 0; i < epochsPerSample.length; i++) {
            if (epochOfNextSample[i] > n) {
                continue;
            }
            var j = head[i];
            var k = tail[i];
            var current = headEmbedding[j];
            var other = tailEmbedding[k];
            var distSquared = rDist(current, other);
            var gradCoeff = 0;
            if (distSquared > 0) {
                gradCoeff = -2.0 * a * b * Math.pow(distSquared, b - 1.0);
                gradCoeff /= a * Math.pow(distSquared, b) + 1.0;
            }
            for (var d = 0; d < dim; d++) {
                var gradD = clip(gradCoeff * (current[d] - other[d]), clipValue);
                current[d] += gradD * alpha;
                if (moveOther) {
                    other[d] += -gradD * alpha;
                }
            }
            epochOfNextSample[i] += epochsPerSample[i];
            var nNegSamples = Math.floor((n - epochOfNextNegativeSample[i]) / epochsPerNegativeSample[i]);
            for (var p = 0; p < nNegSamples; p++) {
                var k_1 = utils.tauRandInt(nVertices, this.random);
                var other_1 = tailEmbedding[k_1];
                var distSquared_1 = rDist(current, other_1);
                var gradCoeff_1 = 0.0;
                if (distSquared_1 > 0.0) {
                    gradCoeff_1 = 2.0 * gamma * b;
                    gradCoeff_1 /=
                        (0.001 + distSquared_1) * (a * Math.pow(distSquared_1, b) + 1);
                }
                else if (j === k_1) {
                    continue;
                }
                for (var d = 0; d < dim; d++) {
                    var gradD = 4.0;
                    if (gradCoeff_1 > 0.0) {
                        gradD = clip(gradCoeff_1 * (current[d] - other_1[d]), clipValue);
                    }
                    current[d] += gradD * alpha;
                }
            }
            epochOfNextNegativeSample[i] += nNegSamples * epochsPerNegativeSample[i];
        }
        optimizationState.alpha = initialAlpha * (1.0 - n / nEpochs);
        optimizationState.currentEpoch += 1;
        return headEmbedding;
    };
    UMAP.prototype.optimizeLayoutAsync = function (epochCallback) {
        var _this = this;
        if (epochCallback === void 0) { epochCallback = function () { return true; }; }
        return new Promise(function (resolve, reject) {
            var step = function () { return __awaiter(_this, void 0, void 0, function () {
                var _a, nEpochs, currentEpoch, epochCompleted, shouldStop, isFinished;
                return __generator(this, function (_b) {
                    try {
                        _a = this.optimizationState, nEpochs = _a.nEpochs, currentEpoch = _a.currentEpoch;
                        this.embedding = this.optimizeLayoutStep(currentEpoch);
                        epochCompleted = this.optimizationState.currentEpoch;
                        shouldStop = epochCallback(epochCompleted) === false;
                        isFinished = epochCompleted === nEpochs;
                        if (!shouldStop && !isFinished) {
                            setTimeout(function () { return step(); }, 0);
                        }
                        else {
                            return [2, resolve(isFinished)];
                        }
                    }
                    catch (err) {
                        reject(err);
                    }
                    return [2];
                });
            }); };
            setTimeout(function () { return step(); }, 0);
        });
    };
    UMAP.prototype.optimizeLayout = function (epochCallback) {
        if (epochCallback === void 0) { epochCallback = function () { return true; }; }
        var isFinished = false;
        var embedding = [];
        while (!isFinished) {
            var _a = this.optimizationState, nEpochs = _a.nEpochs, currentEpoch = _a.currentEpoch;
            embedding = this.optimizeLayoutStep(currentEpoch);
            var epochCompleted = this.optimizationState.currentEpoch;
            var shouldStop = epochCallback(epochCompleted) === false;
            isFinished = epochCompleted === nEpochs || shouldStop;
        }
        return embedding;
    };
    UMAP.prototype.getNEpochs = function () {
        var graph = this.graph;
        if (this.nEpochs > 0) {
            return this.nEpochs;
        }
        var length = graph.nRows;
        if (length <= 2500) {
            return 500;
        }
        else if (length <= 5000) {
            return 400;
        }
        else if (length <= 7500) {
            return 300;
        }
        else {
            return 200;
        }
    };
    return UMAP;
}());
exports.UMAP = UMAP;
function euclidean(x, y) {
    var result = 0;
    for (var i = 0; i < x.length; i++) {
        result += Math.pow((x[i] - y[i]), 2);
    }
    return Math.sqrt(result);
}
exports.euclidean = euclidean;
function cosine(x, y) {
    var result = 0.0;
    var normX = 0.0;
    var normY = 0.0;
    for (var i = 0; i < x.length; i++) {
        result += x[i] * y[i];
        normX += Math.pow(x[i], 2);
        normY += Math.pow(y[i], 2);
    }
    if (normX === 0 && normY === 0) {
        return 0;
    }
    else if (normX === 0 || normY === 0) {
        return 1.0;
    }
    else {
        return 1.0 - result / Math.sqrt(normX * normY);
    }
}
exports.cosine = cosine;
var OptimizationState = (function () {
    function OptimizationState() {
        this.currentEpoch = 0;
        this.headEmbedding = [];
        this.tailEmbedding = [];
        this.head = [];
        this.tail = [];
        this.epochsPerSample = [];
        this.epochOfNextSample = [];
        this.epochOfNextNegativeSample = [];
        this.epochsPerNegativeSample = [];
        this.moveOther = true;
        this.initialAlpha = 1.0;
        this.alpha = 1.0;
        this.gamma = 1.0;
        this.a = 1.5769434603113077;
        this.b = 0.8950608779109733;
        this.dim = 2;
        this.nEpochs = 500;
        this.nVertices = 0;
    }
    return OptimizationState;
}());
function clip(x, clipValue) {
    if (x > clipValue)
        return clipValue;
    else if (x < -clipValue)
        return -clipValue;
    else
        return x;
}
function rDist(x, y) {
    var result = 0.0;
    for (var i = 0; i < x.length; i++) {
        result += Math.pow(x[i] - y[i], 2);
    }
    return result;
}
function findABParams(spread, minDist) {
    var curve = function (_a) {
        var _b = __read(_a, 2), a = _b[0], b = _b[1];
        return function (x) {
            return 1.0 / (1.0 + a * Math.pow(x, (2 * b)));
        };
    };
    var xv = utils
        .linear(0, spread * 3, 300)
        .map(function (val) { return (val < minDist ? 1.0 : val); });
    var yv = utils.zeros(xv.length).map(function (val, index) {
        var gte = xv[index] >= minDist;
        return gte ? Math.exp(-(xv[index] - minDist) / spread) : val;
    });
    var initialValues = [0.5, 0.5];
    var data = { x: xv, y: yv };
    var options = {
        damping: 1.5,
        initialValues: initialValues,
        gradientDifference: 10e-2,
        maxIterations: 100,
        errorTolerance: 10e-3,
    };
    var parameterValues = ml_levenberg_marquardt_1.default(data, curve, options).parameterValues;
    var _a = __read(parameterValues, 2), a = _a[0], b = _a[1];
    return { a: a, b: b };
}
exports.findABParams = findABParams;
function fastIntersection(graph, target, unknownDist, farDist) {
    if (unknownDist === void 0) { unknownDist = 1.0; }
    if (farDist === void 0) { farDist = 5.0; }
    return graph.map(function (value, row, col) {
        if (target[row] === -1 || target[col] === -1) {
            return value * Math.exp(-unknownDist);
        }
        else if (target[row] !== target[col]) {
            return value * Math.exp(-farDist);
        }
        else {
            return value;
        }
    });
}
exports.fastIntersection = fastIntersection;
function resetLocalConnectivity(simplicialSet) {
    simplicialSet = matrix.normalize(simplicialSet, "max");
    var transpose = matrix.transpose(simplicialSet);
    var prodMatrix = matrix.pairwiseMultiply(transpose, simplicialSet);
    simplicialSet = matrix.add(simplicialSet, matrix.subtract(transpose, prodMatrix));
    return matrix.eliminateZeros(simplicialSet);
}
exports.resetLocalConnectivity = resetLocalConnectivity;
function initTransform(indices, weights, embedding) {
    var result = utils
        .zeros(indices.length)
        .map(function (z) { return utils.zeros(embedding[0].length); });
    for (var i = 0; i < indices.length; i++) {
        for (var j = 0; j < indices[0].length; j++) {
            for (var d = 0; d < embedding[0].length; d++) {
                var a = indices[i][j];
                result[i][d] += weights[i][j] * embedding[a][d];
            }
        }
    }
    return result;
}
exports.initTransform = initTransform;

},{"./heap":49,"./matrix":51,"./nn_descent":52,"./tree":53,"./utils":55,"ml-levenberg-marquardt":44}],55:[function(require,module,exports){
"use strict";
var __values = (this && this.__values) || function (o) {
    var m = typeof Symbol === "function" && o[Symbol.iterator], i = 0;
    if (m) return m.call(o);
    return {
        next: function () {
            if (o && i >= o.length) o = void 0;
            return { value: o && o[i++], done: !o };
        }
    };
};
Object.defineProperty(exports, "__esModule", { value: true });
function tauRandInt(n, random) {
    return Math.floor(random() * n);
}
exports.tauRandInt = tauRandInt;
function tauRand(random) {
    return random();
}
exports.tauRand = tauRand;
function norm(vec) {
    var e_1, _a;
    var result = 0;
    try {
        for (var vec_1 = __values(vec), vec_1_1 = vec_1.next(); !vec_1_1.done; vec_1_1 = vec_1.next()) {
            var item = vec_1_1.value;
            result += Math.pow(item, 2);
        }
    }
    catch (e_1_1) { e_1 = { error: e_1_1 }; }
    finally {
        try {
            if (vec_1_1 && !vec_1_1.done && (_a = vec_1.return)) _a.call(vec_1);
        }
        finally { if (e_1) throw e_1.error; }
    }
    return Math.sqrt(result);
}
exports.norm = norm;
function empty(n) {
    var output = [];
    for (var i = 0; i < n; i++) {
        output.push(undefined);
    }
    return output;
}
exports.empty = empty;
function range(n) {
    return empty(n).map(function (_, i) { return i; });
}
exports.range = range;
function filled(n, v) {
    return empty(n).map(function () { return v; });
}
exports.filled = filled;
function zeros(n) {
    return filled(n, 0);
}
exports.zeros = zeros;
function ones(n) {
    return filled(n, 1);
}
exports.ones = ones;
function linear(a, b, len) {
    return empty(len).map(function (_, i) {
        return a + i * ((b - a) / (len - 1));
    });
}
exports.linear = linear;
function sum(input) {
    return input.reduce(function (sum, val) { return sum + val; });
}
exports.sum = sum;
function mean(input) {
    return sum(input) / input.length;
}
exports.mean = mean;
function max(input) {
    var max = 0;
    for (var i = 0; i < input.length; i++) {
        max = input[i] > max ? input[i] : max;
    }
    return max;
}
exports.max = max;
function max2d(input) {
    var max = 0;
    for (var i = 0; i < input.length; i++) {
        for (var j = 0; j < input[i].length; j++) {
            max = input[i][j] > max ? input[i][j] : max;
        }
    }
    return max;
}
exports.max2d = max2d;
function rejectionSample(nSamples, poolSize, random) {
    var result = zeros(nSamples);
    for (var i = 0; i < nSamples; i++) {
        var rejectSample = true;
        while (rejectSample) {
            var j = tauRandInt(poolSize, random);
            var broken = false;
            for (var k = 0; k < i; k++) {
                if (j === result[k]) {
                    broken = true;
                    break;
                }
            }
            if (!broken) {
                rejectSample = false;
            }
            result[i] = j;
        }
    }
    return result;
}
exports.rejectionSample = rejectionSample;
function reshape2d(x, a, b) {
    var rows = [];
    var count = 0;
    var index = 0;
    if (x.length !== a * b) {
        throw new Error('Array dimensions must match input length.');
    }
    for (var i = 0; i < a; i++) {
        var col = [];
        for (var j = 0; j < b; j++) {
            col.push(x[index]);
            index += 1;
        }
        rows.push(col);
        count += 1;
    }
    return rows;
}
exports.reshape2d = reshape2d;

},{}]},{},[1]);
}