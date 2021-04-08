import {addTitle,changeTitle, countListSelected, isAnyHighlighted, heatmapPointCount} from "./Utilities.js";
import {makeTextSprite, makeTextSprite2} from "../Utilities/other.js"
import {getAxis,dispose2DPlots} from "./Utilities.js";
import {insertLegend, removeLegend, changeLegend, insertLegendMolecule, removeLegendMolecule, changeLegendMolecule} from "../MultiviewControl/colorLegend.js";
import {getHeatmapMaterial} from "./Materials.js";

export function arrangeDataForUmap(view){

	const options = view.options;
	let X,Y;
	if (options.plotData == 'spatiallyResolvedData'){

		X = view.options.plotUmapXSpatiallyResolvedData;
		Y = view.options.plotUmapYSpatiallyResolvedData;

		const Data = view.overallSpatiallyResolvedData;
		const propertyList = view.plotSetup.spatiallyResolvedPropertyList;

		console.log(view.UmapCalculatedSpatiallyResolved != true);

		if (view.UmapCalculatedSpatiallyResolved != true) {

			console.log("start Umap");
			const { UMAP } = require('umap-js');
			const filtered = propertyList.filter(function(value, index, arr){
			    return (value != "atom") && (value != "x") && (value != "y") && (value != "z") && (value != view.plotSetup.frameProperty);
			});


			const arrays = getArrays2(Data, filtered);
			
			// const umap = new UMAP();
			// const embedding = umap.fit(arrays);
			const umap = new UMAP({
				nComponents: 2,
				nEpochs: options.UmapNumEpochs,
				nNeighbors: options.UmapNumNeighbours,
			  });
			const nEpochs = umap.initializeFit(arrays);
			for (let i = 0; i < nEpochs; i++) {
				console.log('start iteration: ', i)
				umap.step();
				// console.log('aftre', umap.getEmbedding())
			}
			const embedding = umap.getEmbedding();

			console.log('after umap fitting', embedding)


			for (let i = 0; i < Data.length; i++) {
			    for (let j = 1; j <= 2; j++) {
			    	const tempName = "_Umap" + j.toString();
			    	Data[i][tempName] = embedding[i][j-1];
			    }
			}
			view.UmapCalculatedSpatiallyResolved = true;
			view.UmapResult = umap;


			console.log("Finished Storing umap");

		}
	}

	if (options.plotData == 'moleculeData'){

		X = view.options.plotUmapXMoleculeData;
		Y = view.options.plotUmapYMoleculeData;

		const Data = view.overallMoleculeData;
		const propertyList = view.plotSetup.moleculePropertyList;

		console.log(view.UmapCalculatedMolecule != true);

		if (view.UmapCalculatedMolecule != true) {

			console.log("start PCA");
			const { UMAP } = require('umap-js');
			const filtered = propertyList.filter(function(value, index, arr){
			    return (value != "atom") && (value != "x") && (value != "y") && (value != "z") && (value != view.plotSetup.frameProperty);
			});

			const arrays = getArrays2(Data, filtered);
			
			const umap = new UMAP({
				nComponents: 2,
				nEpochs: options.UmapNumEpochs,
				nNeighbors: options.UmapNumNeighbours,
			  });
			const nEpochs = umap.initializeFit(arrays);
			for (let i = 0; i < nEpochs; i++) {
				console.log('start iteration: ', i)
				umap.step();
				// console.log('aftre', umap.getEmbedding())
			}
			const embedding = umap.getEmbedding();

			console.log('after umap fitting', embedding)


			for (let i = 0; i < Data.length; i++) {
			    for (let j = 1; j <= 2; j++) {
			    	const tempName = "_Umap" + j.toString();
			    	Data[i][tempName] = embedding[i][j-1];
			    }
			}
			view.UmapCalculatedSpatiallyResolved = true;
			view.UmapResult = umap;


			console.log("Finished Storing umap");

		}
	}

	const numPerSide = view.options.numPerSide;
	const heatmapStep = [];

	for (let i=1; i <= numPerSide; i++) {
		heatmapStep.push(""+i);
	}
	
	const xValue = function(d) {return d[X];}
	const yValue = function(d) {return d[Y];}

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

	//console.log(xScale.invertExtent(""+50))
	
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

export function getUmapHeatmap(view){

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


export function updateUmapHeatmap(view){
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

}



export function replotUmapHeatmap(view){
	
	dispose2DPlots(view);
    
	console.log("replotting Umap Heatmap");
	//initializePCATooltip(view);
	arrangeDataForUmap(view);
	const UmapGroup = new THREE.Group()

	const UmapPlot = getUmapHeatmap(view);
	const UmapAxis = getAxis(view);

	UmapGroup.add(UmapPlot);
	UmapGroup.add(UmapAxis);

	view.heatmapPlot = UmapPlot;
	view.UmapGroup = UmapGroup;
	view.scene.add( UmapGroup );
	changeLegend(view);
	changeTitle(view);

}


// Returns all values of an attribute or mapping function in an array of objects
function pluck(arr, mapper){
  return arr.map(function(d){ return typeof(mapper) === "string" ? d[mapper] : mapper(d); });
}

// Given a data set (an array of objects)
// and a list of columns (an array with a list of numeric columns),
// calculate the Pearson correlation coeffient for each pair of columns
// and return a correlation matrix, where each object takes the form
// {column_a, column_a, correlation}
// Dependencies: pluck

function getArrays(data, cols){
	const result = [];
	for (const col of cols){
		const temp = pluck(data, col);
		result.push(temp);
	}
	return result;
}

function getArrays2(data,propertyList){
	const result = [];
	for (const datapoint of data){
		const temp = [];
		for (const property of propertyList){
			temp.push(datapoint[property])
		}
		result.push(temp);
	}
	return result;
}