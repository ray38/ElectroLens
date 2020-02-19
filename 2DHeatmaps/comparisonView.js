import {addTitle,changeTitle} from "./Utilities.js";
import {makeTextSprite, makeTextSprite2} from "../Utilities/other.js"
import {getAxis} from "./Utilities.js";
import {insertLegend, removeLegend, changeLegend, insertLegendMolecule, removeLegendMolecule, changeLegendMolecule} from "../MultiviewControl/colorLegend.js";
import {getHeatmapMaterial} from "./Materials.js";

export function arrangeDataToComparison(view){

	var options = view.options;
	if (options.plotData == 'spatiallyResolvedData'){

		var X = view.options.plotXSpatiallyResolvedData, Y = view.options.plotYSpatiallyResolvedData;
		var XTransform = view.options.plotXTransformSpatiallyResolvedData, YTransform = view.options.plotYTransformSpatiallyResolvedData;

		var Data = view.overallSpatiallyResolvedData;
	}

	if (options.plotData == 'moleculeData'){
		var X = view.options.plotXMoleculeData, Y = view.options.plotYMoleculeData;
		var XTransform = view.options.plotXTransformMoleculeData, YTransform = view.options.plotYTransformMoleculeData;

		var Data = view.overallMoleculeData;
	}


	var numPerSide = view.options.numPerSide;

	var heatmapStep = [];

	var linThres = Math.pow(10,view.options.symlog10thres)

	for (var i=1; i <= numPerSide; i++) {
		heatmapStep.push(""+i);
	}
	
	if (XTransform == 'linear') {var xValue = function(d) {return d[X];}}
	if (YTransform == 'linear') {var yValue = function(d) {return d[Y];}}

	if (XTransform == 'log10') {var xValue = function(d) {return Math.log10(d[X]);};}
	if (YTransform == 'log10') {var yValue = function(d) {return Math.log10(d[Y]);};}

	if (XTransform == 'neglog10') {var xValue = function(d) {return Math.log10(-1*d[X]);}}
	if (YTransform == 'neglog10') {var yValue = function(d) {return Math.log10(-1*d[Y]);}}

	var xMin = d3.min(Data, xValue);
	var xMax = d3.max(Data, xValue);
	var yMin = d3.min(Data, yValue);
	var yMax = d3.max(Data, yValue);

	view.xMin = xMin;
	view.xMax = xMax;
	view.yMin = yMin;
	view.yMax = yMax;

	var xScale = d3.scaleQuantize()
	.domain([xMin, xMax])
	.range(heatmapStep);
	
	var yScale = d3.scaleQuantize()
	.domain([yMin, yMax])
	.range(heatmapStep);
	
	var xMap = function(d) {return xScale(xValue(d));};
	var yMap = function(d) {return yScale(yValue(d));}; 
	
	view.data = {};
	view.dataXMin = d3.min(Data,xValue);
	view.dataXMax = d3.max(Data,xValue);
	view.dataYMin = d3.min(Data,yValue);
	view.dataYMax = d3.max(Data,yValue);

	view.xScale = xScale;
	view.yScale = yScale;
	view.xValue = xValue;
	view.yValue = yValue;

	//const colorArray = [[1, 0, 0],[0, 1, 0], [0, 0, 1], [1, 1, 0], [1, 0, 1], [0, 1, 1], [1, 1, 1]];
	const colorArray = [
		{'r': 1, 'g': 0, 'b':0 },
		{'r': 0, 'g': 1, 'b':0 },
		{'r': 0, 'g': 0, 'b':1 },
		{'r': 1, 'g': 1, 'b':0 },
		{'r': 1, 'g': 0, 'b':1 },
		{'r': 0, 'g': 1, 'b':1 },
		{'r': 1, 'g': 1, 'b':1 }
	]
	var colorDict = {};
	var colorCounter  = 0

	// var voxelToHeatmapMap = new Uint32Array(Data.length);
	for (var i=0; i<Data.length; i++){
		var systemName = Data[i].name;
		if (!(systemName in colorDict)) {
			colorDict[systemName] = colorArray[colorCounter];
			colorCounter += 1
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

function getUniqueSelectedSystemList(list){
	var result = [];
	
	for (var i = 0; i < list.length; i++) {
		if (list[i].selected){
			if (!result.includes(list[i].name)){ result.push(list[i].name);}
		}
	}
	return result;
}

function getColorAverage(systemList, colorDict){
	var weight = 1/systemList.length;
	var result = {'r':0, 'g':0, 'b':0};
	var tempColor;
	systemList.forEach(systemName => {
		tempColor = colorDict[systemName];
		result.r += weight * tempColor.r;
		result.g += weight * tempColor.g;
		result.b += weight * tempColor.b;
	});
	//console.log('result color', result);
	return result;
}

export function getComparison(view){

	

	var options = view.options;
	
	
	var data = view.data;
	
	var num = heatmapPointCount(data);
	
	
	var geometry = new THREE.BufferGeometry();
	var colors = new Float32Array(num *3);
	var positions = new Float32Array(num *3);
	var sizes = new Float32Array(num);
	var alphas = new Float32Array(num);

	var heatmapInformation = [];
	var lut = new THREE.Lut( options.colorMap, 500 );
	lut.setMax( 1000);
	lut.setMin( 0 );
	view.lut = lut;
	
	var colorDict = view.colorDict;
	
	var i = 0;
	var i3 = 0;

	//var xPlotScale = d3.scaleLinear().domain([0, options.numPerSide]).range([-50,50]);
	//var yPlotScale = d3.scaleLinear().domain([0, options.numPerSide]).range([-50,50]);
	var xPlotScale = view.xPlotScale;
	var yPlotScale = view.yPlotScale;

	var XYtoHeatmapMap = {}

	
	
	for (var x in data){
		for (var y in data[x]){
			XYtoHeatmapMap[x] = XYtoHeatmapMap.x || {};
			XYtoHeatmapMap[x][y] = i;

			var xPlot = xPlotScale(parseFloat(x));
			var yPlot = yPlotScale(parseFloat(y));
			
			positions[i3 + 0] = xPlot;
			positions[i3 + 1] = yPlot;
			positions[i3 + 2] = 0
			
			// var numberDatapointsRepresented = countListSelected(data[x][y]['list']);
			var systemRepresented = getUniqueSelectedSystemList(data[x][y]['list']);
			if (systemRepresented.length > 0) {
				var color = getColorAverage(systemRepresented,colorDict);
			
				colors[i3 + 0] = color.r;
				colors[i3 + 1] = color.g;
				colors[i3 + 2] = color.b;
				sizes[i] = options.pointCloudSize * 0.5 * (systemRepresented.length);
				alphas[i] = options.pointCloudAlpha;
			}
			else {
				colors[i3 + 0] = 1;
				colors[i3 + 1] = 1;
				colors[i3 + 2] = 1;
				sizes[i] = options.pointCloudSize * 0.5;
				alphas[i] = options.pointCloudAlpha/2;
			}

			if (data[x][y].highlighted || isAnyHighlighted(data[x][y]['list'])) {
				sizes[i] = 3 * sizes[i];
			}
			else {
			}
			
			
			i++;
			i3 += 3;

			var tempInfo = {x:xPlot-50, 
							y:yPlot-50, 
							systemRepresented: systemRepresented,
							xStart: view.xScale.invertExtent(x)[0],
							xEnd: 	view.xScale.invertExtent(x)[1],
							yStart: view.yScale.invertExtent(y)[0],
							yEnd: 	view.yScale.invertExtent(y)[1],
							heatmapX: x,
							heatmapY: y
							};
			heatmapInformation.push(tempInfo)
		}
	}
	
	view.heatmapInformation = heatmapInformation;
	view.XYtoHeatmapMap = XYtoHeatmapMap;
	geometry.setAttribute( 'position', new THREE.BufferAttribute( positions, 3 ) );
	geometry.setAttribute( 'customColor', new THREE.BufferAttribute( colors, 3 ) );
	geometry.setAttribute( 'size', new THREE.BufferAttribute( sizes, 1 ) );
	geometry.setAttribute( 'alpha', new THREE.BufferAttribute( alphas, 1 ) );

	var material = getHeatmapMaterial();
	var System = new THREE.Points(geometry, material);

	return System;
	
}

export function updateComparison(view){
	var options = view.options;
	var System = view.heatmapPlot;
	var data = view.data;
	var num = heatmapPointCount(data);
	var colors = new Float32Array(num *3);
	var sizes = new Float32Array(num);
	var alphas = new Float32Array(num);
	var colorDict = view.colorDict;

	var lut = new THREE.Lut( options.colorMap, 500 );
	lut.setMax( 1000);
	lut.setMin( 0 );
	view.lut = lut;

	var i = 0;
	var i3 = 0;
	for (var x in data){
		for (var y in data[x]){
			
			var systemRepresented = getUniqueSelectedSystemList(data[x][y]['list']);
			if (systemRepresented.length > 0) {
				var color = getColorAverage(systemRepresented,colorDict);
			
				colors[i3 + 0] = color.r;
				colors[i3 + 1] = color.g;
				colors[i3 + 2] = color.b;
				sizes[i] = options.pointCloudSize * 0.5 * (systemRepresented.length);
				alphas[i] = options.pointCloudAlpha;
			}
			else {
				colors[i3 + 0] = 1;
				colors[i3 + 1] = 1;
				colors[i3 + 2] = 1;
				sizes[i] = options.pointCloudSize * 0.5;
				alphas[i] = options.pointCloudAlpha/2;
			}
			if (data[x][y].highlighted || isAnyHighlighted(data[x][y]['list'])) {
				sizes[i] = 3 * sizes[i];
			}
			else {
			}
			i++;
			i3 += 3;
		}
	}
	
	//geometry.addAttribute( 'position', new THREE.BufferAttribute( positions, 3 ) );
	System.geometry.setAttribute( 'customColor', new THREE.BufferAttribute( colors, 3 ) );
	System.geometry.setAttribute( 'size', new THREE.BufferAttribute( sizes, 1 ) );
	System.geometry.setAttribute( 'alpha', new THREE.BufferAttribute( alphas, 1 ) );

}


export function replotComparison(view){

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
	var comparisonAxis = getAxis(view);
	//var heatmapLabels = getHeatmapLabels(view);

	/*for (const systemName in comparisonPlots) {
		comparison.add(comparisonPlots[systemName]);
	}*/
	comparison.add(comparisonPlot);
	comparison.add(comparisonAxis);
	//heatmap.add(heatmapLabels)
	view.heatmapPlot = comparisonPlot;
	view.comparison = comparison;
	view.scene.add( comparison );
	changeLegend(view);
	changeTitle(view);

}

function countListSelected(list) {
	var count = 0;
	
	for (var i = 0; i < list.length; i++) {
		if (list[i].selected){ count += 1;}
	}
	return count;
}

function heatmapPointCount(data){
	var count = 0;
	for (var x in data){
		for (var y in data[x]){
			count = count + 1;
		}
    }
    
	return count;
}


function isAnyHighlighted(list) {

	for (var i = 0; i < list.length; i++) {
		if (list[i].highlighted){ return true; }
	}
	return false;
	
}