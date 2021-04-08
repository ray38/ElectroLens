import {addTitle,changeTitle, countListSelected, isAnyHighlighted, heatmapPointCount} from "./Utilities.js";
import {makeTextSprite, makeTextSprite2} from "../Utilities/other.js"
import {getAxis, dispose2DPlots} from "./Utilities.js";
import {changeLegend/*, insertLegend, removeLegend, insertLegendMolecule, removeLegendMolecule, changeLegendMolecule*/} from "../MultiviewControl/colorLegend.js";
import {getHeatmapMaterial} from "./Materials.js";

export function arrangeDataToHeatmap(view){

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

	for (let i=1; i <= numPerSide; i++) {
		heatmapStep.push(""+i);
	}
	
	let xValue, yValue;
	if (XTransform == 'linear') {xValue = function(d) {return d[X];}}
	if (YTransform == 'linear') {yValue = function(d) {return d[Y];}}

	if (XTransform == 'log10') {xValue = function(d) {return Math.log10(d[X]);};}
	if (YTransform == 'log10') {yValue = function(d) {return Math.log10(d[Y]);};}

	if (XTransform == 'neglog10') {xValue = function(d) {return Math.log10(-1*d[X]);}}
	if (YTransform == 'neglog10') {yValue = function(d) {return Math.log10(-1*d[Y]);}}

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

	// var voxelToHeatmapMap = new Uint32Array(Data.length);
	for (let i=0; i<Data.length; i++){
		const heatmapX = xMap(Data[i]);
		const heatmapY = yMap(Data[i]);

		if (!(heatmapX in view.data)) {
			view.data[heatmapX] = {};
		}

		if (!(heatmapY in view.data[heatmapX])) {
			view.data[heatmapX][heatmapY] = { list: [], selected: true, highlighted: false };
		}

		view.data[heatmapX][heatmapY]['list'].push(Data[i]);
	}
}


export function getHeatmap(view){

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
	
	let i = 0;
	let i3 = 0;

	//var xPlotScale = d3.scaleLinear().domain([0, options.numPerSide]).range([-50,50]);
	//var yPlotScale = d3.scaleLinear().domain([0, options.numPerSide]).range([-50,50]);
	const xPlotScale = view.xPlotScale;
	const yPlotScale = view.yPlotScale;

	const XYtoHeatmapMap = {}
	
	for (const x in data){
		for (const y in data[x]){
			if (!(x in XYtoHeatmapMap)){
				XYtoHeatmapMap[x] = {};
			}
			XYtoHeatmapMap[x][y] = i;

			const xPlot = xPlotScale(parseFloat(x));
			const yPlot = yPlotScale(parseFloat(y));
			
			positions[i3 + 0] = xPlot;
			positions[i3 + 1] = yPlot;
			positions[i3 + 2] = 0
			
			const numberDatapointsRepresented = countListSelected(data[x][y]['list']);
			if (numberDatapointsRepresented > 0) {
				const color = lut.getColor( numberDatapointsRepresented );
			
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

			if (data[x][y].highlighted || isAnyHighlighted(data[x][y]['list'])) {
				// data[x][y].highlighted = true;
				// view.highlightedIndexList.push(i);
				sizes[i] = 3 * sizes[i];
			}
			else {
				// data[x][y].highlighted = false;
				// view.highlightedIndexList.splice(view.highlightedIndexList.indexOf(i),1);
			}
			
			
			i++;
			i3 += 3;

			const tempInfo = {x:xPlot-50, 
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
	view.XYtoHeatmapMap = XYtoHeatmapMap;
	geometry.setAttribute( 'position', new THREE.BufferAttribute( positions, 3 ) );
	geometry.setAttribute( 'customColor', new THREE.BufferAttribute( colors, 3 ) );
	geometry.setAttribute( 'size', new THREE.BufferAttribute( sizes, 1 ) );
	geometry.setAttribute( 'alpha', new THREE.BufferAttribute( alphas, 1 ) );

	const material = getHeatmapMaterial();
	const System = new THREE.Points(geometry, material);

	return System
	
}


export function updateHeatmap(view){
	const t0 = performance.now();
	const options = view.options;
	const System = view.heatmapPlot;
	const data = view.data;
	const num = heatmapPointCount(data);
	const colors = new Float32Array(num *3);
	const sizes = new Float32Array(num);
	const alphas = new Float32Array(num);
	const lut = new THREE.Lut( options.colorMap, 500 );
	lut.setMax( 1000);
	lut.setMin( 0 );
	view.lut = lut;
	let i = 0;
	let i3 = 0;
	for (const x in data){
		for (const y in data[x]){
			
			const numberDatapointsRepresented = countListSelected(data[x][y]['list']);
			if (numberDatapointsRepresented > 0) {
				const color = lut.getColor( numberDatapointsRepresented );
			
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
			if (data[x][y].highlighted || isAnyHighlighted(data[x][y]['list'])) {
				// data[x][y].highlighted = true;
				// view.highlightedIndexList.push(i);
				sizes[i] = 3 * sizes[i];
			}
			else {
				// data[x][y].highlighted = false;
				// view.highlightedIndexList.splice(view.highlightedIndexList.indexOf(i),1);
			}
			i++;
			i3 += 3;
		}
	}
	
	//geometry.addAttribute( 'position', new THREE.BufferAttribute( positions, 3 ) );
	System.geometry.setAttribute( 'customColor', new THREE.BufferAttribute( colors, 3 ) );
	System.geometry.setAttribute( 'size', new THREE.BufferAttribute( sizes, 1 ) );
	System.geometry.setAttribute( 'alpha', new THREE.BufferAttribute( alphas, 1 ) );
	console.log("updating 2D heatmap took: ", performance.now()-t0);

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

	dispose2DPlots(view);

	arrangeDataToHeatmap(view);
	const heatmap = new THREE.Group()

	const heatmapPlot = getHeatmap(view);
	const heatmapAxis = getAxis(view);
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
