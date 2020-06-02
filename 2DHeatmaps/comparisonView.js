import {addTitle,changeTitle, countListSelected, isAnyHighlighted, heatmapPointCount} from "./Utilities.js";
import {makeTextSprite, makeTextSprite2} from "../Utilities/other.js"
import {getAxis, dispose2DPlots} from "./Utilities.js";
import {insertLegend, removeLegend, changeLegend, insertLegendMolecule, removeLegendMolecule, changeLegendMolecule} from "../MultiviewControl/colorLegend.js";
import {getHeatmapMaterial} from "./Materials.js";

export function arrangeDataToComparison(view){

	const options = view.options;
	let X,Y,XTransform,YTransform,Data;
	if (options.plotData == 'spatiallyResolvedData'){

		X = view.options.plotXSpatiallyResolvedData, Y = view.options.plotYSpatiallyResolvedData;
		XTransform = view.options.plotXTransformSpatiallyResolvedData, YTransform = view.options.plotYTransformSpatiallyResolvedData;

		Data = view.overallSpatiallyResolvedData;
	}

	if (options.plotData == 'moleculeData'){
		X = view.options.plotXMoleculeData, Y = view.options.plotYMoleculeData;
		XTransform = view.options.plotXTransformMoleculeData, YTransform = view.options.plotYTransformMoleculeData;

		Data = view.overallMoleculeData;
	}


	const numPerSide = view.options.numPerSide;

	const heatmapStep = [];

	const linThres = Math.pow(10,view.options.symlog10thres)

	let xValue, yValue;
	for (let i=1; i <= numPerSide; i++) {
		heatmapStep.push(""+i);
	}
	
	if (XTransform == 'linear') {xValue = function(d) {return d[X];}}
	if (YTransform == 'linear') {yValue = function(d) {return d[Y];}}

	if (XTransform == 'log10') {xValue = function(d) {return Math.log10(d[X]);};}
	if (YTransform == 'log10') {yValue = function(d) {return Math.log10(d[Y]);};}

	if (XTransform == 'neglog10') {xValue = function(d) {return Math.log10(-1*d[X]);}}
	if (YTransform == 'neglog10') {yValue = function(d) {return Math.log10(-1*d[Y]);}}

	const xMin = d3.min(Data, xValue);
	const xMax = d3.max(Data, xValue);
	const yMin = d3.min(Data, yValue);
	const yMax = d3.max(Data, yValue);

	view.xMin = xMin;
	view.xMax = xMax;
	view.yMin = yMin;
	view.yMax = yMax;

	const xScale = d3.scaleQuantize()
	.domain([xMin, xMax])
	.range(heatmapStep);
	
	const yScale = d3.scaleQuantize()
	.domain([yMin, yMax])
	.range(heatmapStep);
	
	const xMap = function(d) {return xScale(xValue(d));};
	const yMap = function(d) {return yScale(yValue(d));}; 
	
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
	const colorDict = {};
	let colorCounter  = 0;

	for (let i=0; i<Data.length; i++){
		const systemName = Data[i].name;
		if (!(systemName in colorDict)) {
			colorDict[systemName] = colorArray[colorCounter];
			colorCounter += 1
		}
		let heatmapX = xMap(Data[i]);
		let heatmapY = yMap(Data[i]);
		
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
	const result = [];
	
	for (let i = 0; i < list.length; i++) {
		if (list[i].selected){
			if (!result.includes(list[i].name)){ result.push(list[i].name);}
		}
	}
	return result;
}

function getColorAverage(systemList, colorDict){
	const weight = 1/systemList.length;
	const result = {'r':0, 'g':0, 'b':0};
	let tempColor;
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

	const options = view.options;
	
	const data = view.data;
	
	const num = heatmapPointCount(data);
	
	
	const geometry = new THREE.BufferGeometry();
	const colors = new Float32Array(num *3);
	const positions = new Float32Array(num *3);
	const sizes = new Float32Array(num);
	const alphas = new Float32Array(num);

	const heatmapInformation = [];
	const lut = new THREE.Lut( options.colorMap, 500 );
	lut.setMax( 1000);
	lut.setMin( 0 );
	view.lut = lut;
	
	const colorDict = view.colorDict;
	
	let i = 0;
	let i3 = 0;

	//var xPlotScale = d3.scaleLinear().domain([0, options.numPerSide]).range([-50,50]);
	//var yPlotScale = d3.scaleLinear().domain([0, options.numPerSide]).range([-50,50]);
	const xPlotScale = view.xPlotScale;
	const yPlotScale = view.yPlotScale;

	const XYtoHeatmapMap = {}

	
	for (const x in data){
		for (const y in data[x]){
			XYtoHeatmapMap[x] = XYtoHeatmapMap.x || {};
			XYtoHeatmapMap[x][y] = i;

			const xPlot = xPlotScale(parseFloat(x));
			const yPlot = yPlotScale(parseFloat(y));
			
			positions[i3 + 0] = xPlot;
			positions[i3 + 1] = yPlot;
			positions[i3 + 2] = 0
			
			// var numberDatapointsRepresented = countListSelected(data[x][y]['list']);
			const systemRepresented = getUniqueSelectedSystemList(data[x][y]['list']);
			if (systemRepresented.length > 0) {
				const color = getColorAverage(systemRepresented,colorDict);
			
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

			const tempInfo = {x:xPlot-50, 
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

	const material = getHeatmapMaterial();
	const System = new THREE.Points(geometry, material);

	return System;
	
}

export function updateComparison(view){
	const options = view.options;
	const System = view.heatmapPlot;
	const data = view.data;
	const num = heatmapPointCount(data);
	const colors = new Float32Array(num *3);
	const sizes = new Float32Array(num);
	const alphas = new Float32Array(num);
	const colorDict = view.colorDict;

	const lut = new THREE.Lut( options.colorMap, 500 );
	lut.setMax( 1000);
	lut.setMin( 0 );
	view.lut = lut;

	let i = 0;
	let i3 = 0;
	for (const x in data){
		for (const y in data[x]){
			
			const systemRepresented = getUniqueSelectedSystemList(data[x][y]['list']);
			if (systemRepresented.length > 0) {
				const color = getColorAverage(systemRepresented,colorDict);
			
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

	dispose2DPlots(view);

	arrangeDataToComparison(view);
	const comparison = new THREE.Group();

	const comparisonPlot = getComparison(view);
	const comparisonAxis = getAxis(view);
	comparison.add(comparisonPlot);
	comparison.add(comparisonAxis);
	//heatmap.add(heatmapLabels)
	view.heatmapPlot = comparisonPlot;
	view.comparison = comparison;
	view.scene.add( comparison );
	changeLegend(view);
	changeTitle(view);

}
