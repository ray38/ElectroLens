(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
"use strict";

var _MultiviewControlInitializeViewSetupsJs = require("./MultiviewControl/initializeViewSetups.js");

var _DHeatmapsInitialize2DHeatmapSetupJs = require("./2DHeatmaps/initialize2DHeatmapSetup.js");

var _MultiviewControlCalculateViewportSizesJs = require("./MultiviewControl/calculateViewportSizes.js");

var _DHeatmapsHeatmapViewJs = require("./2DHeatmaps/HeatmapView.js");

var _DViewsPointCloud_selectionJs = require("./3DViews/PointCloud_selection.js");

var _DViewsMoleculeViewJs = require("./3DViews/MoleculeView.js");

var _DViewsSystemEdgeJs = require("./3DViews/systemEdge.js");

var _UtilitiesReadDataFileJs = require( /*,readCSVPapaparse, readViewsSetup*/"./Utilities/readDataFile.js");

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

var _UtilitiesColorScaleJs = require("./Utilities/colorScale.js");

console.log('starting');
var uploader = document.getElementById("uploader");
console.log(uploader);
var uploader_wrapper = document.getElementById("uploader_wrapper");

uploader.addEventListener("change", handleFiles, false);

function handleFiles() {
	var file = this.files[0];
	console.log(file);
	console.log(this);
	$.ajax({
		url: file.path,
		dataType: 'json',
		type: 'get',
		cache: false,
		success: function success(data) {
			var views = data.views;
			var plotSetup = data.plotSetup;
			uploader.parentNode.removeChild(uploader);
			uploader_wrapper.parentNode.removeChild(uploader_wrapper);
			_MultiviewControlInitializeViewSetupsJs.initializeViewSetups(views, plotSetup);
			main(views, plotSetup);
		},
		error: function error(requestObject, _error, errorThrown) {
			alert(_error);
			alert(errorThrown);
		}
	});
}

function main(views, plotSetup) {

	if (!Detector.webgl) Detector.addGetWebGLMessage();
	var container, stats, renderer;
	//var selectionPlaneMaterial = new THREE.MeshBasicMaterial( {  color: 0xffffff, opacity: 0.5,transparent: true, side: THREE.DoubleSide,needsUpdate : true } );
	var mouseX = 0,
	    mouseY = 0;
	var windowWidth, windowHeight;
	var clickRequest = false;
	var mouseHold = false;

	var continuousSelection = false;

	var activeView = null;

	var showOptionBoxesBool = true;

	//initializeViewSetups(views,plotSetup);

	var unfilteredData = [];
	var queue = d3.queue();

	for (var ii = 0; ii < views.length; ++ii) {
		var view = views[ii];
		if (view.viewType == '3DView') {
			//queue.defer(readCSV,view,unfilteredData);
			queue.defer(_UtilitiesReadDataFileJs.readCSV2, view, unfilteredData, plotSetup);
			//queue.defer(readCSVPapaparse,view,unfilteredData,plotSetup);
		}
	}

	queue.awaitAll(function (error) {
		if (error) throw error;
		init();
		animate();
	});

	function init() {
		console.log(unfilteredData);
		console.log('started initialization');
		container = document.getElementById('container');
		renderer = new THREE.WebGLRenderer({ antialias: false, alpha: true, clearAlpha: 1 });
		renderer.setPixelRatio(window.devicePixelRatio);
		renderer.setSize(window.innerWidth, window.innerHeight);

		renderer.autoClear = false;
		container.appendChild(renderer.domElement);

		var defaultColorScales = _UtilitiesColorScaleJs.calcDefaultColorScales(plotSetup, unfilteredData);

		for (var ii = 0; ii < views.length; ++ii) {
			var view = views[ii];

			view.unfilteredData = unfilteredData;

			_MultiviewControlSetupViewBasicJs.setupViewCameraSceneController(view, renderer);
			_MultiviewControlOptionBoxControlJs.addOptionBox(view);
			_MultiviewControlHUDControlJs.setupHUD(view);

			view.controller.addEventListener('change', render);

			console.log(view.controller);

			if (view.viewType == '3DView') {
				view.controller.autoRotate = false;
				view.defaultColorScales = defaultColorScales;
				_UtilitiesColorScaleJs.adjustColorScaleAccordingToDefault(view);

				_DViewsPointCloud_selectionJs.getPointCloudGeometry(view);
				if ("coordinates" in view) {
					_DViewsMoleculeViewJs.getMoleculeGeometry(view);
				}
				_DViewsSystemEdgeJs.addSystemEdge(view);
				_DViewsSetupOptionBox3DViewJs.setupOptionBox3DView(view, plotSetup);
				_MultiviewControlColorLegendJs.insertLegend(view);
			}
			if (view.viewType == '2DHeatmap') {
				view.controller.enableRotate = false;
				_DHeatmapsTooltipJs.initializeHeatmapToolTip(view);
				_DHeatmapsSetupOptionBox2DHeatmapJs.setupOptionBox2DHeatmap(view, plotSetup);
				_DHeatmapsUtilitiesJs.getAxis(view);
				_DHeatmapsUtilitiesJs.addTitle(view);

				_DHeatmapsHeatmapViewJs.arrangeDataToHeatmap(view, unfilteredData);
				_DHeatmapsHeatmapViewJs.getHeatmap(view);
				_MultiviewControlColorLegendJs.insertLegend(view);
			}
		}

		stats = new Stats();
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
		}, false);

		/*window.addEventListener( 'dblclick', function( event ) {
  	//selectAll();
  	//updateAllPlots();
  	//continuousSelection = false;
  	deselectAll(views, unfilteredData);
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
		if (e.keyCode == 107) {
			var temp_view = {
				"viewType": "2DHeatmap",
				"plotX": plotSetup.propertyList[0],
				"plotY": plotSetup.propertyList[0],
				"plotXTransform": "linear",
				"plotYTransform": "linear"
			};
			views.push(temp_view);
			_DHeatmapsInitialize2DHeatmapSetupJs.initialize2DHeatmapSetup(temp_view, views, plotSetup);
			_MultiviewControlCalculateViewportSizesJs.calculateViewportSizes(views);

			temp_view.unfilteredData = unfilteredData;

			_MultiviewControlSetupViewBasicJs.setupViewCameraSceneController(temp_view, renderer);
			_MultiviewControlOptionBoxControlJs.addOptionBox(temp_view);
			_MultiviewControlHUDControlJs.setupHUD(temp_view);

			temp_view.controller.enableRotate = false;
			_DHeatmapsTooltipJs.initializeHeatmapToolTip(temp_view);
			_DHeatmapsSetupOptionBox2DHeatmapJs.setupOptionBox2DHeatmap(temp_view, plotSetup);
			_DHeatmapsUtilitiesJs.getAxis(temp_view);
			_DHeatmapsUtilitiesJs.addTitle(temp_view);

			_DHeatmapsHeatmapViewJs.arrangeDataToHeatmap(temp_view, unfilteredData);
			_DHeatmapsHeatmapViewJs.getHeatmap(temp_view);
			_MultiviewControlColorLegendJs.insertLegend(temp_view);
			_MultiviewControlOptionBoxControlJs.updateOptionBoxLocation(views);
			_DHeatmapsUtilitiesJs.update2DHeatmapTitlesLocation(views);
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
				var width = Math.floor(windowWidth * view.width) + left;
				var height = Math.floor(windowHeight * view.height) + top;
				var vector = new THREE.Vector3();

				vector.set((event.clientX - left) / (width - left) * 2 - 1, -((event.clientY - top) / (height - top)) * 2 + 1, 0.1);
				vector.unproject(view.camera);
				var dir = vector.sub(view.camera.position).normalize();
				var distance = -view.camera.position.z / dir.z;
				view.mousePosition = view.camera.position.clone().add(dir.multiplyScalar(distance));
				if (view.viewType == "2DHeatmap") {
					_DHeatmapsTooltipJs.updateHeatmapTooltip(view);
				}
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

				var left = Math.floor(windowWidth * view.left);
				var top = Math.floor(windowHeight * view.top);
				var width = Math.floor(windowWidth * view.width);
				var height = Math.floor(windowHeight * view.height);

				view.windowLeft = left;
				view.windowTop = top;
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
		stats.update();

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
			if (view.viewType == '3DView' && view.options.animate) {
				_DViewsPointCloud_selectionJs.animatePointCloudGeometry(view);
				view.System.geometry.attributes.size.needsUpdate = true;
			}

			//view.controller.update();

			var camera = view.camera;
			var left = Math.floor(windowWidth * view.left);
			var top = Math.floor(windowHeight * view.top);
			var width = Math.floor(windowWidth * view.width);
			var height = Math.floor(windowHeight * view.height);

			view.windowLeft = left;
			view.windowTop = top;
			view.windowWidth = width;
			view.windowHeight = height;

			renderer.setViewport(left, top, width, height);
			renderer.setScissor(left, top, width, height);
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

},{"./2DHeatmaps/HeatmapView.js":2,"./2DHeatmaps/Selection/Utilities.js":3,"./2DHeatmaps/Utilities.js":4,"./2DHeatmaps/initialize2DHeatmapSetup.js":5,"./2DHeatmaps/selection.js":6,"./2DHeatmaps/setupOptionBox2DHeatmap.js":7,"./2DHeatmaps/tooltip.js":8,"./3DViews/MoleculeView.js":9,"./3DViews/PointCloud_selection.js":10,"./3DViews/setupOptionBox3DView.js":12,"./3DViews/systemEdge.js":13,"./MultiviewControl/HUDControl.js":14,"./MultiviewControl/calculateViewportSizes.js":15,"./MultiviewControl/colorLegend.js":16,"./MultiviewControl/controllerControl.js":17,"./MultiviewControl/initializeViewSetups.js":18,"./MultiviewControl/optionBoxControl.js":19,"./MultiviewControl/setupViewBasic.js":20,"./Utilities/colorScale.js":21,"./Utilities/readDataFile.js":23}],2:[function(require,module,exports){
'use strict';

exports.__esModule = true;
exports.arrangeDataToHeatmap = arrangeDataToHeatmap;
exports.getHeatmap = getHeatmap;
exports.updateHeatmap = updateHeatmap;
exports.replotHeatmap = replotHeatmap;

function arrangeDataToHeatmap(view, unfilteredData) {

	var X = view.options.plotX,
	    Y = view.options.plotY;
	var XTransform = view.options.plotXTransform,
	    YTransform = view.options.plotYTransform;
	var numPerSide = view.options.numPerSide;

	var heatmapStep = [];

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

	if (XTransform == 'symlog10') {
		var xValue = function xValue(d) {
			if (d[X] > 0.0) {
				return Math.log10(d[X]) + 3.0;
			} else if (d[X] < 0.0) {
				return -1 * Math.log10(-1 * d[X]) - 3.0;
			} else {
				return 0.0;
			}
		};
	}
	if (YTransform == 'symlog10') {
		var yValue = function yValue(d) {
			if (d[Y] > 0.0) {
				return Math.log10(d[Y]) + 3.0;
			} else if (d[Y] < 0.0) {
				return -1 * Math.log10(-1 * d[Y]) - 3.0;
			} else {
				return 0.0;
			}
		};
	}

	if (XTransform == 'symlogPC') {
		var xValue = function xValue(d) {
			if (d[X] > 0.0) {
				return Math.log10(d[X]) - 2.0;
			} else if (d[X] < 0.0) {
				return -1 * Math.log10(-1 * d[X]) + 2.0;
			} else {
				return 0.0;
			}
		};
	}
	if (YTransform == 'symlogPC') {
		var yValue = function yValue(d) {
			if (d[Y] > 0.0) {
				return Math.log10(d[Y]) + 4.5;
			} else if (d[Y] < 0.0) {
				return -1 * Math.log10(-1 * d[Y]) - 4.5;
			} else {
				return 0.0;
			}
		};
	}

	var xMin = Math.floor(d3.min(unfilteredData, xValue));
	var xMax = Math.ceil(d3.max(unfilteredData, xValue));
	var yMin = Math.floor(d3.min(unfilteredData, yValue));
	var yMax = Math.ceil(d3.max(unfilteredData, yValue));

	/*var xMin = d3.min(unfilteredData,xValue);
 var xMax = d3.max(unfilteredData,xValue);
 var yMin = d3.min(unfilteredData,yValue);
 var yMax = d3.max(unfilteredData,yValue);*/

	view.xMin = xMin;
	view.xMax = xMax;
	view.yMin = yMin;
	view.yMax = yMax;

	var xScale = d3.scaleQuantize().domain([xMin, xMax]).range(heatmapStep);

	var yScale = d3.scaleQuantize().domain([yMin, yMax]).range(heatmapStep);

	console.log(xMin, xMax, yMin, yMax);

	console.log(xScale, yScale);

	var xMap = function xMap(d) {
		return xScale(xValue(d));
	};
	var yMap = function yMap(d) {
		return yScale(yValue(d));
	};

	view.data = {};
	view.dataXMin = d3.min(unfilteredData, xValue);
	view.dataXMax = d3.max(unfilteredData, xValue);
	view.dataYMin = d3.min(unfilteredData, yValue);
	view.dataYMax = d3.max(unfilteredData, yValue);

	view.xScale = xScale;
	view.yScale = yScale;

	//console.log(xScale.invertExtent(""+50))

	for (var i = 0; i < unfilteredData.length; i++) {
		var heatmapX = xMap(unfilteredData[i]);
		var heatmapY = yMap(unfilteredData[i]);

		view.data[heatmapX] = view.data[heatmapX] || {};
		view.data[heatmapX][heatmapY] = view.data[heatmapX][heatmapY] || { list: [], selected: true };
		view.data[heatmapX][heatmapY]['list'].push(unfilteredData[i]);
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

	var X = view.options.plotX;
	var Y = view.options.plotY;
	var options = view.options;
	var scene = view.scene;

	var data = view.data;

	var num = heatmapPointCount(data);

	var geometry = new THREE.BufferGeometry();
	var colors = new Float32Array(num * 3);
	var positions = new Float32Array(num * 3);
	var sizes = new Float32Array(num);
	var alphas = new Float32Array(num);

	var heatmapInformation = [];
	//console.log(unfilteredData.length);
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
	geometry.addAttribute('position', new THREE.BufferAttribute(positions, 3));
	geometry.addAttribute('customColor', new THREE.BufferAttribute(colors, 3));
	geometry.addAttribute('size', new THREE.BufferAttribute(sizes, 1));
	geometry.addAttribute('alpha', new THREE.BufferAttribute(alphas, 1));

	var System = new THREE.Points(geometry, shaderMaterial);
	//return System;

	//particles.name = 'scatterPoints';

	view.System = System;
	//view.attributes = particles.attributes;
	//view.geometry = particles.geometry;
	scene.add(System);
}

function updateHeatmap(view) {
	var options = view.options;
	var System = view.System;
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
	System.geometry.addAttribute('customColor', new THREE.BufferAttribute(colors, 3));
	System.geometry.addAttribute('size', new THREE.BufferAttribute(sizes, 1));
	System.geometry.addAttribute('alpha', new THREE.BufferAttribute(alphas, 1));
}

function replotHeatmap(view) {
	view.scene.remove(view.System);
	//var options = view.options;
	arrangeDataToHeatmap(view, view.unfilteredData);
	getHeatmap(view);
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

},{}],3:[function(require,module,exports){
"use strict";

exports.__esModule = true;
exports.heatmapsResetSelection = heatmapsResetSelection;
exports.deselectAll = deselectAll;
exports.selectAll = selectAll;
exports.updateAllPlots = updateAllPlots;
exports.updateSelectionFromHeatmap = updateSelectionFromHeatmap;

var _HeatmapViewJs = require("../HeatmapView.js");

var _DViewsPointCloud_selectionJs = require("../../3DViews/PointCloud_selection.js");

function heatmapsResetSelection(views) {
	selectAll();
	updateAllPlots();
}

function deselectAll(views, unfilteredData) {
	for (var i = 0; i < unfilteredData.length; i++) {
		unfilteredData[i].selected = false;
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

function selectAll(views, unfilteredData) {
	for (var i = 0; i < unfilteredData.length; i++) {
		unfilteredData[i].selected = true;
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

function updateAllPlots(views) {
	for (var ii = 0; ii < views.length; ++ii) {
		var view = views[ii];
		if (view.viewType == '2DHeatmap') {
			_HeatmapViewJs.updateHeatmap(view);
		}
	}

	for (var ii = 0; ii < views.length; ++ii) {
		var view = views[ii];
		if (view.viewType == '3DView') {
			if (view.System != null) {
				_DViewsPointCloud_selectionJs.updatePointCloudGeometry(view);
			}
		}
	}
}

function updateSelectionFromHeatmap(view) {
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

},{"../../3DViews/PointCloud_selection.js":10,"../HeatmapView.js":2}],4:[function(require,module,exports){
"use strict";

exports.__esModule = true;
exports.getAxis = getAxis;
exports.addTitle = addTitle;
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
	view.scene.add(line);
}

function addTitle(view) {
	var titleText = view.plotYTransform + " " + view.plotY + " v.s. " + view.plotXTransform + " " + view.plotX;
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

},{}],5:[function(require,module,exports){
"use strict";

exports.__esModule = true;
exports.initialize2DHeatmapSetup = initialize2DHeatmapSetup;

var _HeatmapViewJs = require("./HeatmapView.js");

var _MultiviewControlCalculateViewportSizesJs = require("../MultiviewControl/calculateViewportSizes.js");

var _MultiviewControlColorLegendJs = require("../MultiviewControl/colorLegend.js");

var _SelectionUtilitiesJs = require("./Selection/Utilities.js");

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
		//plotX: 'gamma',
		//plotY: 'epxc',
		//plotXTransform: 'linear',
		//plotYTransform: 'log10',
		controllerEnabled: false,
		controllerZoom: true,
		controllerRotate: false,
		controllerPan: true,
		xPlotScale: d3.scaleLinear().domain([0, 100]).range([-50, 50]),
		yPlotScale: d3.scaleLinear().domain([0, 100]).range([-50, 50]),
		options: new function () {
			this.backgroundColor = "#000000";
			this.backgroundAlpha = 0.0;
			this.numPerSide = 100;
			this.pointCloudAlpha = 1.0;
			this.pointCloudSize = 3.0;
			this.plotX = viewSetup.plotX;
			this.plotY = viewSetup.plotY;
			this.plotXTransform = viewSetup.plotXTransform;
			this.plotYTransform = viewSetup.plotYTransform;
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
			this.selectAll = function () {
				_SelectionUtilitiesJs.selectAll(views, viewSetup.unfilteredData);_SelectionUtilitiesJs.updateAllPlots(views);
			};
			this.deselectAll = function () {
				_SelectionUtilitiesJs.deselectAll(views, viewSetup.unfilteredData);_SelectionUtilitiesJs.updateAllPlots(views);
			};
		}()
	};

	viewSetup = extendObject(viewSetup, defaultSetting);
	//viewSetup = defaultSetting;
}

function extendObject(obj, src) {
	for (var key in src) {
		if (src.hasOwnProperty(key)) obj[key] = src[key];
	}
	return obj;
}

},{"../MultiviewControl/calculateViewportSizes.js":15,"../MultiviewControl/colorLegend.js":16,"./HeatmapView.js":2,"./Selection/Utilities.js":3}],6:[function(require,module,exports){
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

},{"./Selection/Utilities.js":3}],7:[function(require,module,exports){
"use strict";

exports.__esModule = true;
exports.setupOptionBox2DHeatmap = setupOptionBox2DHeatmap;

var _HeatmapViewJs = require("./HeatmapView.js");

var _MultiviewControlColorLegendJs = require("../MultiviewControl/colorLegend.js");

var _UtilitiesOtherJs = require("../Utilities/other.js");

function setupOptionBox2DHeatmap(view, plotSetup) {

	var options = view.options;
	var gui = view.gui;
	var propertyList = plotSetup["propertyList"];
	var propertyChoiceObject = _UtilitiesOtherJs.arrayToIdenticalObject(propertyList);
	gui.width = 200;
	//gui.height = 10;

	//var moleculeFolder 		= gui.addFolder( 'Molecule Selection' );
	var plotFolder = gui.addFolder('Plot Setting');
	var viewFolder = gui.addFolder('View Selection');
	var selectionFolder = gui.addFolder('Selection');
	var detailFolder = gui.addFolder('Detailed Control');
	//var pointCloudFolder 	= gui.addFolder( 'point cloud control' );

	plotFolder.add(options, 'plotX', propertyChoiceObject /*{'n':'n','epxc':'epxc', 'gamma':'gamma','ad0p2':'ad0p2','deriv1':'deriv1','deriv2':'deriv2'}*/).name('X').onChange(function (value) {
		//updatePointCloudGeometry(view);
	});

	plotFolder.add(options, 'plotXTransform', { 'linear': 'linear', 'log10': 'log10', 'log10(-1*)': 'neglog10', 'symlog10': 'symlog10', 'symlogPC': 'symlogPC' }).name('X scale').onChange(function (value) {
		//updatePointCloudGeometry(view);
	});

	plotFolder.add(options, 'plotY', propertyChoiceObject /*{'n':'n','epxc':'epxc', 'gamma':'gamma','ad0p2':'ad0p2','deriv1':'deriv1','deriv2':'deriv2'}*/).name('Y').onChange(function (value) {
		//updatePointCloudGeometry(view);
	});

	plotFolder.add(options, 'plotYTransform', { 'linear': 'linear', 'log10': 'log10', 'log10(-1*)': 'neglog10', 'symlog10': 'symlog10', 'symlogPC': 'symlogPC' }).name('Y scale').onChange(function (value) {
		//updatePointCloudGeometry(view);
	});
	plotFolder.add(options, 'numPerSide', 10, 50000).name('# Points').onChange(function (value) {
		view.xPlotScale = d3.scaleLinear().domain([0, value]).range([-50, 50]);
		view.yPlotScale = d3.scaleLinear().domain([0, value]).range([-50, 50]);
		//options.replotHeatmap.call();
	});
	plotFolder.add(options, 'replotHeatmap');

	plotFolder.open();

	viewFolder.add(options, 'colorMap', { 'rainbow': 'rainbow', 'cooltowarm': 'cooltowarm', 'blackbody': 'blackbody', 'grayscale': 'grayscale' }).name('Color Scheme').onChange(function (value) {
		_HeatmapViewJs.updateHeatmap(view);
		_MultiviewControlColorLegendJs.changeLegend(view);
	});
	viewFolder.add(options, 'resetCamera');
	//viewFolder.add( options, 'planeSelection');
	//viewFolder.add( options, 'fullscreen');
	//viewFolder.add( options, 'defullscreen');
	viewFolder.add(options, 'toggleFullscreen').name('Fullscreen');
	//viewFolder.open();

	viewFolder.add(options, 'pointCloudAlpha', 0, 1).step(0.01).name('Point Opacity').onChange(function (value) {
		_HeatmapViewJs.updateHeatmap(view);
	});
	viewFolder.add(options, 'pointCloudSize', 0, 10).step(0.1).name('Point Size').onChange(function (value) {
		_HeatmapViewJs.updateHeatmap(view);
	});
	/*pointCloudFolder.add( options, 'pointCloudColorSetting', 0.1, 20.0 ).step( 0.1 ).onChange( function( value ) {
 	updatePointCloudGeometry(view);
 });*/
	//pointCloudFolder.open();

	//console.log(gui);

	selectionFolder.add(options, 'selectAll').name('Select all');
	selectionFolder.add(options, 'deselectAll').name('Deselect all');
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

	gui.close();
}

},{"../MultiviewControl/colorLegend.js":16,"../Utilities/other.js":22,"./HeatmapView.js":2}],8:[function(require,module,exports){
'use strict';

exports.__esModule = true;
exports.initializeHeatmapToolTip = initializeHeatmapToolTip;
exports.updateHeatmapTooltip = updateHeatmapTooltip;

function initializeHeatmapToolTip(view) {
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

function updateHeatmapTooltip(view) {

	var mouse = new THREE.Vector2();
	mouse.set((event.clientX - view.windowLeft) / view.windowWidth * 2 - 1, -((event.clientY - view.windowTop) / view.windowHeight) * 2 + 1);

	view.raycaster.setFromCamera(mouse.clone(), view.camera);
	var intersects = view.raycaster.intersectObject(view.System);
	if (intersects.length > 0) {
		//console.log("found intersect")

		view.tooltip.style.top = event.clientY + 5 + 'px';
		view.tooltip.style.left = event.clientX + 5 + 'px';

		var interesctIndex = intersects[0].index;
		view.tooltip.innerHTML = "x: " + view.heatmapInformation[interesctIndex].xStart + " : " + view.heatmapInformation[interesctIndex].xEnd + '<br>' + "y: " + view.heatmapInformation[interesctIndex].yStart + " : " + view.heatmapInformation[interesctIndex].yEnd + '<br>' + "# points: " + view.heatmapInformation[interesctIndex].numberDatapointsRepresented;

		view.System.geometry.attributes.size.array[interesctIndex] = 2 * view.options.pointCloudSize;
		view.System.geometry.attributes.size.needsUpdate = true;

		if (view.INTERSECTED != intersects[0].index) {
			view.System.geometry.attributes.size.array[view.INTERSECTED] = view.options.pointCloudSize;
			view.System.geometry.attributes.size.needsUpdate = true;
			view.INTERSECTED = intersects[0].index;
			view.System.geometry.attributes.size.array[view.INTERSECTED] = 2 * view.options.pointCloudSize;
			view.System.geometry.attributes.size.needsUpdate = true;
		}
	} else {
		view.tooltip.innerHTML = '';
		view.System.geometry.attributes.size.array[view.INTERSECTED] = view.options.pointCloudSize;
		view.System.geometry.attributes.size.needsUpdate = true;
		view.INTERSECTED = null;
	}
}

},{}],9:[function(require,module,exports){
"use strict";

exports.__esModule = true;
exports.getMoleculeGeometry = getMoleculeGeometry;
exports.updateMoleculeGeometry = updateMoleculeGeometry;
exports.changeMoleculeGeometry = changeMoleculeGeometry;
exports.removeMoleculeGeometry = removeMoleculeGeometry;
exports.addMoleculePeriodicReplicates = addMoleculePeriodicReplicates;
exports.removeMoleculePeriodicReplicates = removeMoleculePeriodicReplicates;
exports.changeMoleculePeriodicReplicates = changeMoleculePeriodicReplicates;

function getMoleculeGeometry(view) {

	view.molecule = {};
	view.molecule.atoms = [];
	view.molecule.bonds = [];

	var colorSetup = { "C": 0x777777, "O": 0xFF0000, "N": 0x0000FF, "H": 0xCCCCCC };
	var atomRadius = {
		"C": 0.77,
		"O": 0.73,
		"N": 0.75,
		"H": 0.37
	};
	var options = view.options;
	var scene = view.scene;

	var xPlotScale = view.xPlotScale;
	var yPlotScale = view.yPlotScale;
	var zPlotScale = view.zPlotScale;

	for (var i = 0; i < view.coordinates.length; i++) {
		//console.log(view.coordinates[i]);
		//console.log(view.coordinates[i][1][0] , view.coordinates[i][1][1] ,view.coordinates[i][1][2]);
		//console.log((view.coordinates[i][1][0]*10 + 0.5)*20, (view.coordinates[i][1][1]*10 + 0.5)*20,(view.coordinates[i][1][2]*10 + 0.5)*20);
		//Do something
		var geometry = new THREE.SphereGeometry(100, 24, 24);
		//options.atomSize*atomRadius[view.coordinates[i][0]]*
		//geometry.translate( (view.coordinates[i][1][0]*10 + 0.5)*20, (view.coordinates[i][1][1]*10 + 0.5)*20,(view.coordinates[i][1][2]*10 + 0.5)*20);

		var material = new THREE.MeshBasicMaterial({ color: colorSetup[view.coordinates[i][0]] });
		var atom = new THREE.Mesh(geometry, material);
		atom.scale.set(options.atomSize * atomRadius[view.coordinates[i][0]], options.atomSize * atomRadius[view.coordinates[i][0]], options.atomSize * atomRadius[view.coordinates[i][0]]);
		//atom.position.set((view.coordinates[i][1][0]*10 + 0.5)*20, (view.coordinates[i][1][1]*10 + 0.5)*20,(view.coordinates[i][1][2]*10 + 0.5)*20)
		atom.position.set(xPlotScale(view.coordinates[i][1][0]) * 20.0, yPlotScale(view.coordinates[i][1][1]) * 20.0, zPlotScale(view.coordinates[i][1][2]) * 20.0);
		view.molecule.atoms.push(atom);
		scene.add(atom);
	}

	for (var i = 0; i < view.coordinates.length; i++) {
		var coordinates1 = new THREE.Vector3(view.coordinates[i][1][0], view.coordinates[i][1][1], view.coordinates[i][1][2]);
		//var point1 = new THREE.Vector3((view.coordinates[i][1][0]*10 + 0.5)*20, (view.coordinates[i][1][1]*10 + 0.5)*20,(view.coordinates[i][1][2]*10 + 0.5)*20);
		var point1 = new THREE.Vector3(xPlotScale(view.coordinates[i][1][0]) * 20.0, yPlotScale(view.coordinates[i][1][1]) * 20.0, zPlotScale(view.coordinates[i][1][2]) * 20.0);

		for (var j = 0; j < view.coordinates.length; j++) {
			var coordinates2 = new THREE.Vector3(view.coordinates[j][1][0], view.coordinates[j][1][1], view.coordinates[j][1][2]);
			//var point2 = new THREE.Vector3((view.coordinates[j][1][0]*10 + 0.5)*20, (view.coordinates[j][1][1]*10 + 0.5)*20,(view.coordinates[j][1][2]*10 + 0.5)*20);
			var point2 = new THREE.Vector3(xPlotScale(view.coordinates[j][1][0]) * 20.0, yPlotScale(view.coordinates[j][1][1]) * 20.0, zPlotScale(view.coordinates[j][1][2]) * 20.0);
			//console.log(point1, point2)

			/* edge from X to Y */

			var bondlength = new THREE.Vector3().subVectors(coordinates2, coordinates1).length();
			//console.log(direction.length());
			if (bondlength < options.maxBondLength && bondlength > options.minBondLength) {
				var direction = new THREE.Vector3().subVectors(point2, point1);
				var orientation = new THREE.Matrix4();
				/* THREE.Object3D().up (=Y) default orientation for all objects */
				orientation.lookAt(point1, point2, new THREE.Object3D().up);
				/* rotation around axis X by -90 degrees 
     * matches the default orientation Y 
     * with the orientation of looking Z */
				orientation.multiply(new THREE.Matrix4().set(1, 0, 0, 0, 0, 0, 1, 0, 0, -1, 0, 0, 0, 0, 0, 1));

				/* cylinder: radiusAtTop, radiusAtBottom, 
        height, radiusSegments, heightSegments */
				//console.log(direction, orientation)
				var bondGeometry = new THREE.CylinderGeometry(options.bondSize * 10, options.bondSize * 10, direction.length(), 24, 1, true);
				//bondGeometry.translate( point1 );

				var bond = new THREE.Mesh(bondGeometry, new THREE.MeshBasicMaterial({ color: 0xffffff }));

				bond.applyMatrix(orientation);
				//console.log(new THREE.Vector3().addVectors( point1, direction.multiplyScalar(0.5) ))
				//bond.position = new THREE.Vector3().addVectors( point1, direction.multiplyScalar(0.5) );
				//bond.position.set(new THREE.Vector3().addVectors(point1, direction.multiplyScalar(0.5)));
				bond.position.x = (point2.x + point1.x) / 2;
				bond.position.y = (point2.y + point1.y) / 2;
				bond.position.z = (point2.z + point1.z) / 2;
				view.molecule.bonds.push(bond);
				scene.add(bond);
			}
		}
	}
}

function updateMoleculeGeometry(view) {

	for (var i = 0; i < view.molecule.bonds.length; i++) {
		view.scene.remove(view.molecule.bonds[i]);
	}

	for (var i = 0; i < view.molecule.atoms.length; i++) {
		var colorSetup = { "C": 0x777777, "O": 0xFF0000, "N": 0x0000FF, "H": 0xCCCCCC };
		var atomRadius = {
			"C": 0.77,
			"O": 0.73,
			"N": 0.75,
			"H": 0.37
		};
	}

	getMoleculeGeometry(view);
}

function changeMoleculeGeometry(view) {

	/*for (var i = 0; i < view.molecule.bonds.length; i++) {
 	view.scene.remove(view.molecule.bonds[i]);
 }
 
 for (var i = 0; i < view.molecule.atoms.length; i++) {
 	view.scene.remove(view.molecule.atoms[i]);
 }*/
	removeMoleculeGeometry(view);
	getMoleculeGeometry(view);
}

function removeMoleculeGeometry(view) {
	//console.log("delete molecule");
	//console.log(view.molecule);
	if (view.molecule != null) {
		//console.log("delete molecule");
		for (var i = 0; i < view.molecule.bonds.length; i++) {
			view.scene.remove(view.molecule.bonds[i]);
		}

		for (var i = 0; i < view.molecule.atoms.length; i++) {
			view.scene.remove(view.molecule.atoms[i]);
		}

		delete view.Molecule;
	}
}

function addMoleculePeriodicReplicates(view) {

	view.periodicReplicateMolecule = {};
	view.periodicReplicateMolecule.atoms = [];
	view.periodicReplicateMolecule.bonds = [];

	var colorSetup = { "C": 0x777777, "O": 0xFF0000, "N": 0x0000FF, "H": 0xCCCCCC };
	var atomRadius = {
		"C": 0.77,
		"O": 0.73,
		"N": 0.75,
		"H": 0.37
	};
	var options = view.options;
	var scene = view.scene;

	var xPlotScale = view.xPlotScale;
	var yPlotScale = view.yPlotScale;
	var zPlotScale = view.zPlotScale;

	var xStep = 10.0 * (view.xPlotMax - view.xPlotMin);
	var yStep = 10.0 * (view.yPlotMax - view.yPlotMin);
	var zStep = 10.0 * (view.zPlotMax - view.zPlotMin);

	var x_start = -1 * ((options.xPBC - 1) / 2);
	var x_end = (options.xPBC - 1) / 2 + 1;
	var y_start = -1 * ((options.yPBC - 1) / 2);
	var y_end = (options.yPBC - 1) / 2 + 1;
	var z_start = -1 * ((options.zPBC - 1) / 2);
	var z_end = (options.zPBC - 1) / 2 + 1;

	for (var i = x_start; i < x_end; i++) {
		for (var j = y_start; j < y_end; j++) {
			for (var k = z_start; k < z_end; k++) {
				if ((i == 0 && j == 0 && k == 0) == false) {
					for (var ii = 0; ii < view.coordinates.length; ii++) {

						var geometry = new THREE.SphereGeometry(100, 24, 24);

						var material = new THREE.MeshBasicMaterial({ color: colorSetup[view.coordinates[ii][0]] });
						var atom = new THREE.Mesh(geometry, material);
						atom.scale.set(options.atomSize * atomRadius[view.coordinates[ii][0]], options.atomSize * atomRadius[view.coordinates[ii][0]], options.atomSize * atomRadius[view.coordinates[ii][0]]);
						//atom.position.set((view.coordinates[i][1][0]*10 + 0.5)*20, (view.coordinates[i][1][1]*10 + 0.5)*20,(view.coordinates[i][1][2]*10 + 0.5)*20)
						atom.position.set(xPlotScale(view.coordinates[ii][1][0]) * 20.0 + i * xStep, yPlotScale(view.coordinates[ii][1][1]) * 20.0 + j * yStep, zPlotScale(view.coordinates[ii][1][2]) * 20.0 + k * zStep);
						view.periodicReplicateMolecule.atoms.push(atom);
						scene.add(atom);
					}
				}
			}
		}
	}

	for (var i = x_start; i < x_end; i++) {
		for (var j = y_start; j < y_end; j++) {
			for (var k = z_start; k < z_end; k++) {
				if ((i == 0 && j == 0 && k == 0) == false) {
					for (var ii = 0; ii < view.coordinates.length; ii++) {
						var coordinates1 = new THREE.Vector3(view.coordinates[ii][1][0], view.coordinates[ii][1][1], view.coordinates[ii][1][2]);
						var point1 = new THREE.Vector3(xPlotScale(view.coordinates[ii][1][0]) * 20.0 + i * xStep, yPlotScale(view.coordinates[ii][1][1]) * 20.0 + j * yStep, zPlotScale(view.coordinates[ii][1][2]) * 20.0 + k * zStep);

						for (var jj = 0; jj < view.coordinates.length; jj++) {
							var coordinates2 = new THREE.Vector3(view.coordinates[jj][1][0], view.coordinates[jj][1][1], view.coordinates[jj][1][2]);
							var point2 = new THREE.Vector3(xPlotScale(view.coordinates[jj][1][0]) * 20.0 + i * xStep, yPlotScale(view.coordinates[jj][1][1]) * 20.0 + j * yStep, zPlotScale(view.coordinates[jj][1][2]) * 20.0 + k * zStep);

							var bondlength = new THREE.Vector3().subVectors(coordinates2, coordinates1).length();
							//console.log(direction.length());
							if (bondlength < options.maxBondLength && bondlength > options.minBondLength) {
								var direction = new THREE.Vector3().subVectors(point2, point1);
								var orientation = new THREE.Matrix4();
								/* THREE.Object3D().up (=Y) default orientation for all objects */
								orientation.lookAt(point1, point2, new THREE.Object3D().up);
								orientation.multiply(new THREE.Matrix4().set(1, 0, 0, 0, 0, 0, 1, 0, 0, -1, 0, 0, 0, 0, 0, 1));

								var bondGeometry = new THREE.CylinderGeometry(options.bondSize * 10, options.bondSize * 10, direction.length(), 24, 1, true);

								var bond = new THREE.Mesh(bondGeometry, new THREE.MeshBasicMaterial({ color: 0xffffff }));

								bond.applyMatrix(orientation);
								bond.position.x = (point2.x + point1.x) / 2;
								bond.position.y = (point2.y + point1.y) / 2;
								bond.position.z = (point2.z + point1.z) / 2;
								view.periodicReplicateMolecule.bonds.push(bond);
								scene.add(bond);
							}
						}
					}
				}
			}
		}
	}
}

function removeMoleculePeriodicReplicates(view) {
	//console.log("delete molecule replicate");
	//console.log(view.periodicReplicateMolecule);
	if (view.periodicReplicateMolecule != null) {
		//console.log(" start delete molecule replicate");
		for (var i = 0; i < view.periodicReplicateMolecule.bonds.length; i++) {
			view.scene.remove(view.periodicReplicateMolecule.bonds[i]);
		}

		for (var i = 0; i < view.periodicReplicateMolecule.atoms.length; i++) {
			view.scene.remove(view.periodicReplicateMolecule.atoms[i]);
		}

		delete view.periodicReplicateMolecule;
	}
}

function changeMoleculePeriodicReplicates(view) {
	removeMoleculePeriodicReplicates(view);
	addMoleculePeriodicReplicates(view);
}

},{}],10:[function(require,module,exports){
'use strict';

exports.__esModule = true;
exports.getPointCloudGeometry = getPointCloudGeometry;
exports.addPointCloudPeriodicReplicates = addPointCloudPeriodicReplicates;
exports.updatePointCloudPeriodicReplicates = updatePointCloudPeriodicReplicates;
exports.updatePointCloudGeometry = updatePointCloudGeometry;
exports.animatePointCloudGeometry = animatePointCloudGeometry;
exports.removePointCloudGeometry = removePointCloudGeometry;
exports.removePointCloudPeriodicReplicates = removePointCloudPeriodicReplicates;
exports.changePointCloudGeometry = changePointCloudGeometry;
exports.changePointCloudPeriodicReplicates = changePointCloudPeriodicReplicates;

function getPointCloudGeometry(view) {

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

	var particles = options.pointCloudParticles;
	var num_blocks = view.data.length;
	var points_in_block = new Float32Array(num_blocks);
	var total = 100;
	var count = 0;

	for (var k = 0; k < num_blocks; k++) {
		var num_points = Math.min(Math.floor(view.data[k][options.density] / total * particles), options.pointCloudMaxPointPerBlock);
		points_in_block[k] = num_points;
		count += num_points;
	}
	console.log("total points in cloud: ", count);

	var geometry = new THREE.BufferGeometry();

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

			var x_start = view.data[k]['xPlot'];
			var y_start = view.data[k]['yPlot'];
			var z_start = view.data[k]['zPlot'];
			var x_end = x_start + 1;
			var y_end = y_start + 1;
			var z_end = z_start + 1;
			/*var x_start = view.data[k]['xPlot']-0.5;
   var y_start = view.data[k]['yPlot']-0.5;
   var z_start = view.data[k]['zPlot']-0.5;
   var x_end = x_start + 0.5;
   var y_end = y_start + 0.5;
   var z_end = z_start + 0.5;*/

			for (var j = 0; j < temp_num_points; j++) {

				var x = Math.random() * 1 + x_start;
				var y = Math.random() * 1 + y_start;
				var z = Math.random() * 1 + z_start;

				positions[i3 + 0] = x * 10;
				positions[i3 + 1] = y * 10;
				positions[i3 + 2] = z * 10;

				var color = lut.getColor(view.data[k][options.propertyOfInterest]);

				colors[i3 + 0] = color.r;
				colors[i3 + 1] = color.g;
				colors[i3 + 2] = color.b;

				if (x_start >= options.x_low && x_end <= options.x_high && y_start >= options.y_low && y_end <= options.y_high && z_start >= options.z_low && z_end <= options.z_high && view.data[k].selected) {
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

	geometry.addAttribute('position', new THREE.BufferAttribute(positions, 3));
	geometry.addAttribute('customColor', new THREE.BufferAttribute(colors, 3));
	geometry.addAttribute('size', new THREE.BufferAttribute(sizes, 1));
	geometry.addAttribute('alpha', new THREE.BufferAttribute(alphas, 1));
	geometry.parentBlockMap = parentBlock;

	var System = new THREE.Points(geometry, shaderMaterial);
	view.System = System;
	//console.log(System);
	scene.add(System);

	if (options.PBCBoolean) {
		changePointCloudPeriodicReplicates(view);
	}
}

Float32Array.prototype.concat = function () {
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

	var concatenatedByteLength = buffers.map(function (a) {
		return a.byteLength;
	}).reduce(function (a, b) {
		return a + b;
	}, 0);

	var concatenatedArray = new Float32Array(concatenatedByteLength / bytesPerIndex);

	var offset = 0;
	buffers.forEach(function (buffer, index) {
		concatenatedArray.set(new Float32Array(buffer), offset);
		offset += buffer.byteLength / bytesPerIndex;
	});

	return concatenatedArray;
};

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
	var positions = view.System.geometry.attributes.position.array;
	var count = view.System.geometry.attributes.size.array.length;
	var colors = view.System.geometry.attributes.customColor.array;
	var sizes = view.System.geometry.attributes.size.array;
	var alphas = view.System.geometry.attributes.alpha.array;
	var shaderMaterial = view.System.material;

	var geometry = new THREE.BufferGeometry();
	var xStep = 10.0 * (view.xPlotMax - view.xPlotMin);
	var yStep = 10.0 * (view.yPlotMax - view.yPlotMin);
	var zStep = 10.0 * (view.zPlotMax - view.zPlotMin);

	var x_start = -1 * ((options.xPBC - 1) / 2);
	var x_end = (options.xPBC - 1) / 2 + 1;
	var y_start = -1 * ((options.yPBC - 1) / 2);
	var y_end = (options.yPBC - 1) / 2 + 1;
	var z_start = -1 * ((options.zPBC - 1) / 2);
	var z_end = (options.zPBC - 1) / 2 + 1;

	var replicatePositions = new Float32Array();
	var replicateColors = new Float32Array();
	var replicateSizes = new Float32Array();
	var replicateAlphas = new Float32Array();
	console.log('create replicates');
	console.log(replicatePositions instanceof Float32Array);
	console.log(positions instanceof Float32Array);

	for (var i = x_start; i < x_end; i++) {
		for (var j = y_start; j < y_end; j++) {
			for (var k = z_start; k < z_end; k++) {
				if ((i == 0 && j == 0 && k == 0) == false) {
					var tempPositions = getPositionArrayAfterTranslation(positions, count, i * xStep, j * yStep, k * zStep);
					replicatePositions = replicatePositions.concat(tempPositions);
					replicateSizes = replicateSizes.concat(sizes);
					replicateAlphas = replicateAlphas.concat(alphas);
					replicateColors = replicateColors.concat(colors);
				}
			}
		}
	}

	geometry.addAttribute('position', new THREE.BufferAttribute(replicatePositions, 3));
	geometry.addAttribute('customColor', new THREE.BufferAttribute(replicateColors, 3));
	geometry.addAttribute('size', new THREE.BufferAttribute(replicateSizes, 1));
	geometry.addAttribute('alpha', new THREE.BufferAttribute(replicateAlphas, 1));

	var System = new THREE.Points(geometry, shaderMaterial);
	view.periodicReplicateSystems = System;
	scene.add(System);
}

function updatePointCloudPeriodicReplicates(view) {
	var replicateSystems = view.periodicReplicateSystems;

	var options = view.options;
	var scene = view.scene;
	var count = view.System.geometry.attributes.size.array.length;
	var colors = view.System.geometry.attributes.customColor.array;
	var sizes = view.System.geometry.attributes.size.array;
	var alphas = view.System.geometry.attributes.alpha.array;
	var shaderMaterial = view.System.material;

	var geometry = new THREE.BufferGeometry();
	var xStep = 10.0 * (view.xPlotMax - view.xPlotMin);
	var yStep = 10.0 * (view.yPlotMax - view.yPlotMin);
	var zStep = 10.0 * (view.zPlotMax - view.zPlotMin);

	var x_start = -1 * ((options.xPBC - 1) / 2);
	var x_end = (options.xPBC - 1) / 2 + 1;
	var y_start = -1 * ((options.yPBC - 1) / 2);
	var y_end = (options.xPBC - 1) / 2 + 1;
	var z_start = -1 * ((options.zPBC - 1) / 2);
	var z_end = (options.xPBC - 1) / 2 + 1;

	var replicateColors = new Float32Array();
	var replicateSizes = new Float32Array();
	var replicateAlphas = new Float32Array();

	for (var i = x_start; i < x_end; i++) {
		for (var j = y_start; j < y_end; j++) {
			for (var k = z_start; k < z_end; k++) {
				if ((i == 0 && j == 0 && k == 0) == false) {
					replicateSizes = replicateSizes.concat(sizes);
					replicateAlphas = replicateAlphas.concat(alphas);
					replicateColors = replicateColors.concat(colors);
				}
			}
		}
	}

	view.periodicReplicateSystems.geometry.addAttribute('customColor', new THREE.BufferAttribute(replicateColors, 3));
	view.periodicReplicateSystems.geometry.addAttribute('size', new THREE.BufferAttribute(replicateSizes, 1));
	view.periodicReplicateSystems.geometry.addAttribute('alpha', new THREE.BufferAttribute(replicateAlphas, 1));
}

function updatePointCloudGeometry(view) {

	var options = view.options;
	var positionArray = view.System.geometry.attributes.position.array;
	var parentBlock = view.System.geometry.parentBlockMap;

	var particles = options.pointCloudParticles;
	var num_blocks = view.data.length;
	var points_in_block = new Float32Array(num_blocks);
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

		var color = lut.getColor(view.data[k][options.propertyOfInterest]);

		colors[i3 + 0] = color.r;
		colors[i3 + 1] = color.g;
		colors[i3 + 2] = color.b;

		if (x >= options.x_low && x <= options.x_high && y >= options.y_low && y <= options.y_high && z >= options.z_low && z <= options.z_high && view.data[k].selected) {
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

	view.System.geometry.addAttribute('customColor', new THREE.BufferAttribute(colors, 3));
	view.System.geometry.addAttribute('size', new THREE.BufferAttribute(sizes, 1));
	view.System.geometry.addAttribute('alpha', new THREE.BufferAttribute(alphas, 1));

	if (options.PBCBoolean) {
		updatePointCloudPeriodicReplicates(view);
	}
}

function animatePointCloudGeometry(view) {
	//console.log('updated')

	var options = view.options;
	var positionArray = view.System.geometry.attributes.position.array;
	var sizeArray = view.System.geometry.attributes.size.array;
	var parentBlock = view.System.geometry.parentBlockMap;

	var particles = options.pointCloudParticles;
	var num_blocks = view.data.length;
	var points_in_block = new Float32Array(num_blocks);
	var count = view.System.geometry.attributes.size.array.length;

	//var colors = new Float32Array(count *3);
	var sizes = new Float32Array(count);

	for (var i = 0, i3 = 0; i < count; i++) {
		var x = positionArray[i3 + 0] / 10;
		var y = positionArray[i3 + 1] / 10;
		var z = positionArray[i3 + 2] / 10;
		var k = parentBlock[i];

		if (x >= options.x_low && x <= options.x_high && y >= options.y_low && y <= options.y_high && z >= options.z_low && z <= options.z_high && view.data[k].selected) {
			var temp = sizeArray[i] - 0.1;
			if (temp >= 0.0) {
				sizeArray[i] = temp;
			} else {
				sizeArray[i] = options.pointCloudSize;
			}
		} else {
			sizes[i] = 0;
		}
		i3 += 3;
	}
}

function removePointCloudGeometry(view) {
	view.scene.remove(view.System);
	if (view.System != null) {
		view.scene.remove(view.System);
		delete view.System;
	}
}

function removePointCloudPeriodicReplicates(view) {
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

},{}],11:[function(require,module,exports){
"use strict";

exports.__esModule = true;
exports.initialize3DViewSetup = initialize3DViewSetup;

var _MultiviewControlCalculateViewportSizesJs = require("../MultiviewControl/calculateViewportSizes.js");

var _MultiviewControlColorLegendJs = require("../MultiviewControl/colorLegend.js");

var _systemEdgeJs = require("./systemEdge.js");

function initialize3DViewSetup(viewSetup, views, plotSetup) {
	var gridSpacing = viewSetup.gridSpacing;
	var systemDimension = viewSetup.systemDimension;
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
		eye: [0, 0, 1200],
		up: [0, 1, 0],
		fov: 100,
		mousePosition: [0, 0],
		//viewType: '3Dview',
		//moleculeName: 'CO2',
		//dataFilename: "data/CO2_B3LYP_0_0_0_all_descriptors.csv",
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
			this.backgroundColor = "#000000";
			this.backgroundAlpha = 0.0;
			this.showPointCloud = true;
			this.showMolecule = true;
			this.atomSize = 1.0;
			this.bondSize = 1.0;
			this.moleculeTransparency = 1.0;
			this.maxBondLength = 1.5;
			this.minBondLength = 0.3;
			this.pointCloudParticles = 500;
			this.pointCloudMaxPointPerBlock = 60;
			this.pointCloudColorSettingMax = 1.2;
			this.pointCloudColorSettingMin = 0.0;
			this.pointCloudAlpha = 1;
			this.pointCloudSize = 5;
			this.animate = false;
			this.xPBC = 1;
			this.yPBC = 1;
			this.zPBC = 1;
			this.PBCBoolean = false;
			/*this.boxParticles = 200;
   this.boxColorSetting = 10.0;
   this.boxSize = 10;
   this.boxOpacity = 1;
   this.pointMatrixParticles = 100;
   this.pointMatrixColorSettingMax = 1.2;
   this.pointMatrixColorSettingMin = 0.0;
   this.pointMatrixAlpha = 1;
   this.pointMatrixSize = 10;*/
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
			//this.dataFilename = "data/CO2_B3LYP_0_0_0_all_descriptors.csv";
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

},{"../MultiviewControl/calculateViewportSizes.js":15,"../MultiviewControl/colorLegend.js":16,"./systemEdge.js":13}],12:[function(require,module,exports){
"use strict";

exports.__esModule = true;
exports.setupOptionBox3DView = setupOptionBox3DView;

var _PointCloud_selectionJs = require("./PointCloud_selection.js");

var _MoleculeViewJs = require("./MoleculeView.js");

var _MultiviewControlColorLegendJs = require("../MultiviewControl/colorLegend.js");

var _UtilitiesColorScaleJs = require("../Utilities/colorScale.js");

var _UtilitiesOtherJs = require("../Utilities/other.js");

function setupOptionBox3DView(view, plotSetup) {

	var options = view.options;
	var propertyList = plotSetup["propertyList"];
	var propertyChoiceObject = _UtilitiesOtherJs.arrayToIdenticalObject(propertyList);
	var gui = view.gui;
	gui.width = 200;

	var moleculeFolder = gui.addFolder('Molecule Selection');
	var viewFolder = gui.addFolder('View Selection');
	var pointCloudFolder = gui.addFolder('point cloud control');
	var sliderFolder = gui.addFolder('Slider Control');
	var detailFolder = gui.addFolder('Detailed Control');

	moleculeFolder.add(options, 'moleculeName').name('Molecule').onChange(function (value) {
		options.moleculeName = view.moleculeName;
		gui.updateDisplay();
	});
	moleculeFolder.add(options, 'propertyOfInterest', propertyChoiceObject).name('Color Basis').onChange(function (value) {
		_UtilitiesColorScaleJs.adjustColorScaleAccordingToDefault(view);
		_PointCloud_selectionJs.updatePointCloudGeometry(view);

		_MultiviewControlColorLegendJs.changeLegend(view);
		gui.updateDisplay();
	});

	moleculeFolder.add(options, 'atomSize', 0.1, 10).step(0.1).name('Atom Size').onChange(function (value) {
		_MoleculeViewJs.changeMoleculeGeometry(view);
	});
	moleculeFolder.add(options, 'bondSize', 0.1, 5).step(0.1).name('Bond Size').onChange(function (value) {
		_MoleculeViewJs.changeMoleculeGeometry(view);
	});

	moleculeFolder.add(options, 'maxBondLength', 0.1, 5).step(0.1).name('Bond Max').onChange(function (value) {
		_MoleculeViewJs.changeMoleculeGeometry(view);
	});

	moleculeFolder.add(options, 'minBondLength', 0.1, 5).step(0.1).name('Bond Min').onChange(function (value) {
		_MoleculeViewJs.changeMoleculeGeometry(view);
	});

	moleculeFolder.add(options, 'showMolecule').name('Show Molecule').onChange(function (value) {
		if (value == true) {
			_MoleculeViewJs.getMoleculeGeometry(view);
			_MoleculeViewJs.addMoleculePeriodicReplicates(view);
		} else {
			_MoleculeViewJs.removeMoleculeGeometry(view);
			_MoleculeViewJs.removeMoleculePeriodicReplicates(view);
		}
	});

	moleculeFolder.add(options, 'showPointCloud').name('Show Point Cloud').onChange(function (value) {
		if (value == true) {
			_PointCloud_selectionJs.getPointCloudGeometry(view);
			_PointCloud_selectionJs.addPointCloudPeriodicReplicates(view);
		} else {
			_PointCloud_selectionJs.removePointCloudGeometry(view);
			_PointCloud_selectionJs.removePointCloudPeriodicReplicates(view);
		}
	});

	moleculeFolder.open();

	/*
 	viewFolder.add( options, 'view',{'pointCloud':'pointCloud', 'box':'box', 'pointMatrix':'pointMatrix'}).onChange( function( value ){
 		changeGeometry(options);
 		updateControlPanel(options);
 	});*/

	viewFolder.add(options, 'colorMap', { 'rainbow': 'rainbow', 'cooltowarm': 'cooltowarm', 'blackbody': 'blackbody', 'grayscale': 'grayscale' }).name('Color Scheme').onChange(function (value) {
		_PointCloud_selectionJs.updatePointCloudGeometry(view);
		_MultiviewControlColorLegendJs.changeLegend(view);
	});
	viewFolder.add(options, 'resetCamera').name('Set Camera');
	//viewFolder.add( options, 'fullscreen');
	//viewFolder.add( options, 'defullscreen');
	viewFolder.add(options, 'toggleFullscreen').name('Fullscreen');
	viewFolder.add(options, 'systemEdgeBoolean').name('System Edge').onChange(function (value) {
		//updatePointCloudGeometry(view);
		options.toggleSystemEdge.call();
		gui.updateDisplay();
	});
	viewFolder.add(options, 'autoRotateSystem').name('Rotate System').onChange(function (value) {
		//updatePointCloudGeometry(view);
		//options.toggleSystemEdge.call();
		//gui.updateDisplay();
		//console.log(value)
		view.controller.autoRotate = value;
	});

	var PBCFolder = viewFolder.addFolder('PBC');

	PBCFolder.add(options, 'xPBC', { '1': 1, '3': 3, '5': 5 }).onChange(function (value) {
		if (options.xPBC > 1 || options.yPBC > 1 || options.zPBC > 1) {
			if (options.showPointCloud) {
				_PointCloud_selectionJs.changePointCloudPeriodicReplicates(view);
			}
			if (options.showMolecule) {
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
			if (options.showPointCloud) {
				_PointCloud_selectionJs.changePointCloudPeriodicReplicates(view);
			}
			if (options.showMolecule) {
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
			if (options.showPointCloud) {
				_PointCloud_selectionJs.changePointCloudPeriodicReplicates(view);
			}
			if (options.showMolecule) {
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
	viewFolder.open();

	pointCloudFolder.add(options, 'pointCloudParticles', 10, 10000).step(10).name('Density').onChange(function (value) {
		_PointCloud_selectionJs.changePointCloudGeometry(view);
	});
	pointCloudFolder.add(options, 'pointCloudAlpha', 0, 1).step(0.01).name('Opacity').onChange(function (value) {
		_PointCloud_selectionJs.updatePointCloudGeometry(view);
	});
	pointCloudFolder.add(options, 'pointCloudSize', 0, 10).step(0.1).name('Size').onChange(function (value) {
		_PointCloud_selectionJs.updatePointCloudGeometry(view);
	});
	pointCloudFolder.add(options, 'pointCloudColorSettingMin', -1000, 1000).step(0.1).name('Color Scale Min').onChange(function (value) {
		_PointCloud_selectionJs.updatePointCloudGeometry(view);
		_MultiviewControlColorLegendJs.changeLegend(view);
	});
	pointCloudFolder.add(options, 'pointCloudColorSettingMax', -1000, 1000).step(0.1).name('Color Scale Max').onChange(function (value) {
		_PointCloud_selectionJs.updatePointCloudGeometry(view);
		_MultiviewControlColorLegendJs.changeLegend(view);
	});
	pointCloudFolder.add(options, 'pointCloudMaxPointPerBlock', 10, 200).step(10).name('Max Density').onChange(function (value) {
		_PointCloud_selectionJs.changePointCloudGeometry(view);
	});
	pointCloudFolder.add(options, 'animate').onChange(function (value) {
		_PointCloud_selectionJs.updatePointCloudGeometry(view);
	});

	//console.log(pointCloudFolder);

	pointCloudFolder.close();

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

	detailFolder.add(options, 'autoRotateSpeed', 0.1, 30.0).step(0.1).name('Rotate Speed').onChange(function (value) {
		view.controller.autoRotateSpeed = value;
	});

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

	//sliderFolder.open();
	//console.log(gui);
}

},{"../MultiviewControl/colorLegend.js":16,"../Utilities/colorScale.js":21,"../Utilities/other.js":22,"./MoleculeView.js":9,"./PointCloud_selection.js":10}],13:[function(require,module,exports){
"use strict";

exports.__esModule = true;
exports.addSystemEdge = addSystemEdge;
exports.removeSystemEdge = removeSystemEdge;

function addSystemEdge(view) {

	var options = view.options;
	var scene = view.scene;

	var geometry = new THREE.CubeGeometry(10.0 * (view.xPlotScale(view.xCoordMax) - view.xPlotScale(view.xCoordMin)), 10.0 * (view.yPlotScale(view.yCoordMax) - view.yPlotScale(view.yCoordMin)), 10.0 * (view.zPlotScale(view.zCoordMax) - view.zPlotScale(view.zCoordMin)));

	var geo = new THREE.EdgesGeometry(geometry); // or WireframeGeometry( geometry )

	var mat = new THREE.LineBasicMaterial({ color: 0xffffff, linewidth: 2 });

	var wireframe = new THREE.LineSegments(geo, mat);

	view.systemEdge = wireframe;

	scene.add(wireframe);
}

function removeSystemEdge(view) {
	view.scene.remove(view.systemEdge);
}

},{}],14:[function(require,module,exports){
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

},{}],15:[function(require,module,exports){
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
		if (tempView.viewType == '2DHeatmap') {
			tempView.title.style.visibility = "hidden";
		}
	}

	view.left = 0.0;
	view.top = 0.0;
	view.height = 1.0;
	view.width = 1.0;

	view.guiContainer.style.visibility = "visible";
	if (view.viewType == '2DHeatmap') {
		view.title.style.visibility = "visible";
	}

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

},{"../2DHeatmaps/Utilities.js":4,"./optionBoxControl.js":19}],16:[function(require,module,exports){
'use strict';

exports.__esModule = true;
exports.insertLegend = insertLegend;
exports.removeLegend = removeLegend;
exports.changeLegend = changeLegend;

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

},{}],17:[function(require,module,exports){
"use strict";

exports.__esModule = true;
exports.updateController = updateController;

function updateController(views, windowWidth, windowHeight, mouseX, mouseY) {
	for (var ii = 0; ii < views.length; ++ii) {
		var view = views[ii];
		var left = Math.floor(windowWidth * view.left);
		var top = Math.floor(windowHeight * view.top);
		var width = Math.floor(windowWidth * view.width);
		var height = Math.floor(windowHeight * view.height);

		if (mouseX > left && mouseX < left + width && mouseY > top && mouseY < top + height) {
			enableController(view, view.controller);
		} else {
			disableController(view, view.controller);
		}
	}
}

function enableController(view, controller) {
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

},{}],18:[function(require,module,exports){
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

},{"../2DHeatmaps/initialize2DHeatmapSetup.js":5,"../3DViews/initialize3DViewSetup.js":11,"../MultiviewControl/calculateViewportSizes.js":15}],19:[function(require,module,exports){
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

},{}],20:[function(require,module,exports){
"use strict";

exports.__esModule = true;
exports.setupViewCameraSceneController = setupViewCameraSceneController;

function setupViewCameraSceneController(view, renderer) {

	var camera = new THREE.PerspectiveCamera(view.fov, window.innerWidth / window.innerHeight, 1, 10000);
	camera.position.fromArray(view.eye);
	view.camera = camera;
	var tempController = new THREE.OrbitControls(camera, renderer.domElement);
	tempController.minAzimuthAngle = -Infinity; // radians
	tempController.maxAzimuthAngle = Infinity; // radians
	tempController.minPolarAngle = -2 * Math.PI; // radians
	tempController.maxPolarAngle = 2 * Math.PI; // radians
	/*var tempController = new THREE.TrackballControls( camera, renderer.domElement );
 tempController.rotateSpeed = 10.0;
 tempController.zoomSpeed = 10.2;
 tempController.panSpeed = 10.8;
 tempController.noZoom = false;
 tempController.noPan = false;
 tempController.staticMoving = true;*/
	view.controller = tempController;
	var tempScene = new THREE.Scene();
	view.scene = tempScene;

	var left = Math.floor(window.innerWidth * view.left);
	var top = Math.floor(window.innerHeight * view.top);
	var width = Math.floor(window.innerWidth * view.width);
	var height = Math.floor(window.innerHeight * view.height);

	view.windowLeft = left;
	view.windowTop = top;
	view.windowWidth = width;
	view.windowHeight = height;
}

},{}],21:[function(require,module,exports){
'use strict';

exports.__esModule = true;
exports.calcDefaultColorScales = calcDefaultColorScales;
exports.adjustColorScaleAccordingToDefault = adjustColorScaleAccordingToDefault;

function calcDefaultColorScales(plotSetup, unfilteredData) {
	var result = {};
	var propertyList = plotSetup.propertyList;
	for (var i = 0; i < propertyList.length; i++) {
		var property = propertyList[i];
		var xValue = function xValue(d) {
			return d[property];
		};
		var xMin = d3.min(unfilteredData, xValue);
		var xMax = d3.max(unfilteredData, xValue);
		result[property] = { 'min': xMin, 'max': xMax };
	}
	return result;
}

function adjustColorScaleAccordingToDefault(view) {
	view.options.pointCloudColorSettingMin = view.defaultColorScales[view.options.propertyOfInterest]['min'];
	view.options.pointCloudColorSettingMax = view.defaultColorScales[view.options.propertyOfInterest]['max'];
}

},{}],22:[function(require,module,exports){
"use strict";

exports.__esModule = true;
exports.arrayToIdenticalObject = arrayToIdenticalObject;

function arrayToIdenticalObject(array) {
	var result = {};
	for (var i = 0; i < array.length; i++) {
		result[array[i]] = array[i];
	}
	return result;
}

},{}],23:[function(require,module,exports){
"use strict";

exports.__esModule = true;
exports.readCSV = readCSV;
exports.readCSV2 = readCSV2;
exports.readCSVPapaparse = readCSVPapaparse;

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

function readCSV2(view, plotData, plotSetup, callback) {
	console.log('started loading');
	var filename = view.dataFilename;
	console.log(filename);
	var propertyList = plotSetup.propertyList;
	var density = plotSetup.pointcloudDensity;
	var densityCutoff = plotSetup.densityCutoff;
	var systemName = view.moleculeName;

	var xPlotScale = view.xPlotScale;
	var yPlotScale = view.yPlotScale;
	var zPlotScale = view.zPlotScale;

	console.log(density, densityCutoff, propertyList);
	view.data = [];

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
			if (n > densityCutoff) {
				var temp = {
					xPlot: xPlotScale(+d.x),
					yPlot: yPlotScale(+d.y),
					zPlot: zPlotScale(+d.z),
					selected: true,
					name: systemName
				};
				for (var i = 0; i < propertyList.length; i++) {
					temp[propertyList[i]] = +d[propertyList[i]];
				}

				view.data.push(temp);
				plotData.push(temp);
			}
		});
		console.log('end parsing');
		callback(null);
	});
}

function readCSVPapaparse(view, plotData, plotSetup, callback) {
	console.log('started using papa');
	var filename = view.dataFilename;
	var propertyList = plotSetup.propertyList;
	var density = plotSetup.pointcloudDensity;
	var densityCutoff = plotSetup.densityCutoff;
	var systemName = view.moleculeName;
	console.log(density, densityCutoff, propertyList);
	view.data = [];
	/*Papa.parse(filename, {
 	complete: function(results) {
 		console.log('successfully used papa')
 		console.log(results);
 		callback(null);
 	}
 });*/
	$.ajax({
		url: filename,
		//dataType: 'json',
		type: 'get',
		cache: false,
		success: function success(data) {
			console.log('loading setup');
			Papa.parse(data, {
				complete: function complete(results) {
					console.log('successfully used papa');
					console.log(results);
					callback(null);
				}
			});
		},
		error: function error(requestObject, _error, errorThrown) {
			alert(_error);
			alert(errorThrown);
		}
	});
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
}

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

},{"../MultiviewControl/initializeViewSetups.js":18}]},{},[1]);
