import {addTitle,changeTitle} from "./Utilities.js";
import {makeTextSprite, makeTextSprite2} from "../Utilities/other.js"
import {getAxis} from "./Utilities.js";
import {insertLegend, removeLegend, changeLegend, insertLegendMolecule, removeLegendMolecule, changeLegendMolecule} from "../MultiviewControl/colorLegend.js";
import {getHeatmapMaterial} from "./Materials.js";

export function arrangeDataForUmap(view){

	var options = view.options;
	if (options.plotData == 'spatiallyResolvedData'){

		var X = view.options.plotUmapXSpatiallyResolvedData, Y = view.options.plotUmapYSpatiallyResolvedData;

		var Data = view.overallSpatiallyResolvedData;
		var propertyList = view.plotSetup.spatiallyResolvedPropertyList;

		console.log(view.UmapCalculatedSpatiallyResolved != true);

		if (view.UmapCalculatedSpatiallyResolved != true) {

			console.log("start Umap");
			const { UMAP } = require('umap-js');
			var filtered = propertyList.filter(function(value, index, arr){
			    return (value != "atom") && (value != "x") && (value != "y") && (value != "z");
			});


			var arrays = getArrays2(Data, filtered);
			
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


			for (var i = 0; i < Data.length; i++) {
			    for (var j = 1; j <= 2; j++) {
			    	var tempName = "_Umap" + j.toString();
			    	Data[i][tempName] = embedding[i][j-1];
			    }
			}
			view.UmapCalculatedSpatiallyResolved = true;
			view.UmapResult = umap;


			console.log("Finished Storing umap");

		}
	}

	if (options.plotData == 'moleculeData'){

		var X = view.options.plotUmapXMoleculeData, Y = view.options.plotUmapYMoleculeData;

		var Data = view.overallMoleculeData;
		var propertyList = view.plotSetup.moleculePropertyList;

		console.log(view.UmapCalculatedMolecule != true);

		if (view.UmapCalculatedMolecule != true) {

			console.log("start PCA");
			const { UMAP } = require('umap-js');
			var filtered = propertyList.filter(function(value, index, arr){
			    return (value != "atom") && (value != "x") && (value != "y") && (value != "z");
			});

			var arrays = getArrays2(Data, filtered);
			
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


			for (var i = 0; i < Data.length; i++) {
			    for (var j = 1; j <= 2; j++) {
			    	var tempName = "_Umap" + j.toString();
			    	Data[i][tempName] = embedding[i][j-1];
			    }
			}
			view.UmapCalculatedSpatiallyResolved = true;
			view.UmapResult = umap;


			console.log("Finished Storing umap");

		}
	}




	var numPerSide = view.options.numPerSide;

	var heatmapStep = [];


	for (var i=1; i <= numPerSide; i++) {
		heatmapStep.push(""+i);
	}
	
	var xValue = function(d) {return d[X];}
	var yValue = function(d) {return d[Y];}


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

	//console.log(xScale.invertExtent(""+50))
	
	for (var i=0; i<Data.length; i++){
		var heatmapX = xMap(Data[i]);
		var heatmapY = yMap(Data[i]);
		
		view.data[heatmapX] = view.data[heatmapX] || {};
		view.data[heatmapX][heatmapY] = view.data[heatmapX][heatmapY] || {list:[], selected:true};
		view.data[heatmapX][heatmapY]['list'].push(Data[i]);
	}

}

export function getUmapHeatmap(view){

	

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
	view.XYtoHeatmapMap = XYtoHeatmapMap;
	geometry.setAttribute( 'position', new THREE.BufferAttribute( positions, 3 ) );
	geometry.setAttribute( 'customColor', new THREE.BufferAttribute( colors, 3 ) );
	geometry.setAttribute( 'size', new THREE.BufferAttribute( sizes, 1 ) );
	geometry.setAttribute( 'alpha', new THREE.BufferAttribute( alphas, 1 ) );

	var material = getHeatmapMaterial();
	var System = new THREE.Points(geometry, material);

	return System
	
}


export function updateUmapHeatmap(view){
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
	var UmapGroup = new THREE.Group()

	var UmapPlot = getUmapHeatmap(view);
	var UmapAxis = getAxis(view);

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
	var result = [];
	for (const col of cols){
		var temp = pluck(data, col);
		result.push(temp);
	}
	return result;
}

function getArrays2(data,propertyList){
	var result = [];
	for (const datapoint of data){
		var temp = [];
		for (const property of propertyList){
			temp.push(datapoint[property])
		}
		result.push(temp);
	}
	return result;
}

function countListSelected(list) {
	var count = 0;
	
	for (var i = 0; i < list.length; i++) {
		if (list[i].selected){ count += 1;}
	}
	return count;
}

function isAnyHighlighted(list) {

	for (var i = 0; i < list.length; i++) {
		if (list[i].highlighted){ return true; }
	}
	return false;
	
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
