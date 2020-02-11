import {addTitle,changeTitle} from "./Utilities.js";
import {makeTextSprite, makeTextSprite2} from "../Utilities/other.js"
import {getAxis} from "./Utilities.js";
import {insertLegend, removeLegend, changeLegend, insertLegendMolecule, removeLegendMolecule, changeLegendMolecule} from "../MultiviewControl/colorLegend.js";
import {getHeatmapMaterial} from "./Materials.js";

export function arrangeDataToHeatmap(view){

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

	var xScale = d3.scaleQuantize()
	.domain([xMin, xMax])
	.range(heatmapStep);
	
	var yScale = d3.scaleQuantize()
	.domain([yMin, yMax])
	.range(heatmapStep);

	console.log(xMin,xMax,yMin,yMax, numPerSide)

	console.log(xScale,yScale)
	
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

	// var voxelToHeatmapMap = new Uint32Array(Data.length);
	for (var i=0; i<Data.length; i++){
		var heatmapX = xMap(Data[i]);
		var heatmapY = yMap(Data[i]);
		
		view.data[heatmapX] = view.data[heatmapX] || {};
		view.data[heatmapX][heatmapY] = view.data[heatmapX][heatmapY] || {list:[], selected:true, highlight: false};
		view.data[heatmapX][heatmapY]['list'].push(Data[i]);
	}
	
			
}


export function getHeatmap(view){

	

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
	
	var i = 0;
	var i3 = 0;

	//var xPlotScale = d3.scaleLinear().domain([0, options.numPerSide]).range([-50,50]);
	//var yPlotScale = d3.scaleLinear().domain([0, options.numPerSide]).range([-50,50]);
	var xPlotScale = view.xPlotScale;
	var yPlotScale = view.yPlotScale;
	
	for (var x in data){
		for (var y in data[x]){
			var xPlot = xPlotScale(parseFloat(x));
			var yPlot = yPlotScale(parseFloat(y));
			
			positions[i3 + 0] = xPlot;
			positions[i3 + 1] = yPlot;
			positions[i3 + 2] = 0
			
			var numberDatapointsRepresented = countListSelected(data[x][y]['list']);
			if (numberDatapointsRepresented > 0) {
				var color = lut.getColor( numberDatapointsRepresented );
			
				colors[i3 + 0] = color.r;
				colors[i3 + 1] = color.g;
				colors[i3 + 2] = color.b;
				sizes[i] = options.pointCloudSize;
				alphas[i] = options.pointCloudAlpha;
			}
			else {
				colors[i3 + 0] = 1;
				colors[i3 + 1] = 1;
				colors[i3 + 2] = 1;
				sizes[i] = options.pointCloudSize;
				alphas[i] = options.pointCloudAlpha/2;
			}
			
			
			i++;
			i3 += 3;

			var tempInfo = {x:xPlot-50, 
							y:yPlot-50, 
							numberDatapointsRepresented: numberDatapointsRepresented,
							xStart: view.xScale.invertExtent(x)[0],
							xEnd: 	view.xScale.invertExtent(x)[1],
							yStart: view.yScale.invertExtent(y)[0],
							yEnd: 	view.yScale.invertExtent(y)[1],
							heatmapX: x,
							heatmapY: y
							};
			//console.log(tempInfo);
			//console.log(view.xScale.invertExtent(""+xPlot)[0], view.xScale.invertExtent(""+xPlot)[1])
			heatmapInformation.push(tempInfo)
		}
	}
	
	view.heatmapInformation = heatmapInformation;
	geometry.setAttribute( 'position', new THREE.BufferAttribute( positions, 3 ) );
	geometry.setAttribute( 'customColor', new THREE.BufferAttribute( colors, 3 ) );
	geometry.setAttribute( 'size', new THREE.BufferAttribute( sizes, 1 ) );
	geometry.setAttribute( 'alpha', new THREE.BufferAttribute( alphas, 1 ) );

	var material = getHeatmapMaterial();
	var System = new THREE.Points(geometry, material);

	return System
	
}


export function updateHeatmap(view){
	var options = view.options;
	var System = view.heatmapPlot;
	var data = view.data;
	var num = heatmapPointCount(data);
	var colors = new Float32Array(num *3);
	var sizes = new Float32Array(num);
	var alphas = new Float32Array(num);
	var lut = new THREE.Lut( options.colorMap, 500 );
	lut.setMax( 1000);
	lut.setMin( 0 );
	view.lut = lut;
	var i = 0;
	var i3 = 0;
	for (var x in data){
		for (var y in data[x]){
			
			var numberDatapointsRepresented = countListSelected(data[x][y]['list']);
			if (numberDatapointsRepresented > 0) {
				var color = lut.getColor( numberDatapointsRepresented );
			
				colors[i3 + 0] = color.r;
				colors[i3 + 1] = color.g;
				colors[i3 + 2] = color.b;
				sizes[i] = options.pointCloudSize;
				alphas[i] = options.pointCloudAlpha;
			}
			else {
				colors[i3 + 0] = 1;
				colors[i3 + 1] = 1;
				colors[i3 + 2] = 1;
				sizes[i] = options.pointCloudSize;
				alphas[i] = options.pointCloudAlpha/2;
			}
			if (data[x][y].highlighted) {
				sizes[i] = 3* sizes[i];
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

export function getHeatmapLabels(view){
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

	var style = { fontsize: 32, borderColor: {r:0, g:0, b:255, a:1.0}, backgroundColor: {r:255, g:255, b:255, a:1.0} };
	var tempLabel = makeTextSprite2( view.yMin.toString(), style );
	tempLabel.position.set(-75,-50,0);
	labels.add(tempLabel);

	var tempLabel = makeTextSprite2( view.yMax.toString(), style );
	tempLabel.position.set(-75,50,0);
	labels.add(tempLabel);

	var tempLabel = makeTextSprite2( ((view.yMax + view.yMin)/2).toString(), style );
	tempLabel.position.set(-75,0,0);
	labels.add(tempLabel);

	var tempLabel = makeTextSprite2( view.xMin.toString(), style );
	tempLabel.position.set(-50,-60,0);
	labels.add(tempLabel);

	var tempLabel = makeTextSprite2( view.xMax.toString(), style );
	tempLabel.position.set(50,-60,0);
	labels.add(tempLabel);

	var tempLabel = makeTextSprite2( ((view.xMax + view.xMin)/2).toString(), style );
	tempLabel.position.set(0,-60,0);
	labels.add(tempLabel);

	view.heatmapLabels = labels;

	return labels
	//view.scene.add( labels );

}

export function replotHeatmap(view){
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
	var heatmap = new THREE.Group()

	var heatmapPlot = getHeatmap(view);
	var heatmapAxis = getAxis(view);
	//var heatmapLabels = getHeatmapLabels(view);

	heatmap.add(heatmapPlot);
	heatmap.add(heatmapAxis);
	//heatmap.add(heatmapLabels)

	view.heatmapPlot = heatmapPlot;
	view.heatmap = heatmap;
	view.scene.add( heatmap );
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