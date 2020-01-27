import {addTitle,changeTitle} from "./Utilities.js";
import {makeTextSprite, makeTextSprite2} from "../Utilities/other.js"
import {getAxis} from "./Utilities.js";
import {insertLegend, removeLegend, changeLegend, insertLegendMolecule, removeLegendMolecule, changeLegendMolecule} from "../MultiviewControl/colorLegend.js";

export function arrangeDataForPCA(view){

	var options = view.options;
	if (options.plotData == 'spatiallyResolvedData'){

		var X = view.options.plotPCAXSpatiallyResolvedData, Y = view.options.plotPCAYSpatiallyResolvedData;
		var XTransform = view.options.plotPCAXTransformSpatiallyResolvedData, YTransform = view.options.plotPCAYTransformSpatiallyResolvedData;

		var Data = view.overallSpatiallyResolvedData;
		var propertyList = view.plotSetup.spatiallyResolvedPropertyList;

		console.log(view.PCACalculatedSpatiallyResolved != true);

		if (view.PCACalculatedSpatiallyResolved != true) {

			console.log("start PCA");
			const { PCA } = require('ml-pca');
			var filtered = propertyList.filter(function(value, index, arr){
			    return (value != "atom") && (value != "x") && (value != "y") && (value != "z");
			});


		    var arrays = getArrays2(Data, filtered);
		    const pca = new PCA(arrays/*, {nCompNIPALS:options.nPCAComponentsSpatiallyResolved}*/);
		    var transformed = pca.predict(arrays);

		    console.log("Finished Calculating PCA");

			for (var i = 0; i < Data.length; i++) {
			    for (var j = 1; j <= transformed.columns; j++) {
			    	var tempName = "_PC" + j.toString();
			    	Data[i][tempName] = transformed.data[i][j-1];
			    }
			}
			view.PCACalculatedSpatiallyResolved = true;
			view.PCAResult = pca;

			view.PCAExplainedVariance = {};
			for (var i = 1; i <= pca.getExplainedVariance().length; i++){
				view.PCAExplainedVariance["_PC" + i] = pca.getExplainedVariance()[i-1];
			}

			view.PCALoadingMatrix = {};
			var PCALoadingMatrix = pca.getLoadings().data;
			console.log(PCALoadingMatrix);
			console.log(filtered.length);
			for (var i = 1; i <= PCALoadingMatrix.length; i++){
				view.PCALoadingMatrix["_PC" + i] = {};
				for (var j = 0; j <= filtered.length; j++){
					view.PCALoadingMatrix["_PC" + i][filtered[j]] = PCALoadingMatrix[i-1][j];
				}
			}


			console.log("Finished Storing PCA");


			/*view.PCAPropertyListSpatiallyResolved = [];

			for (var i = 1; i <= options.nPCAComponentsSpatiallyResolved; i++) {
				view.PCAPropertyListSpatiallyResolved.push("_PC"+i.toString());
			}*/
		}
	}

	if (options.plotData == 'moleculeData'){

		var X = view.options.plotPCAXMoleculeData, Y = view.options.plotPCAYMoleculeData;
		var XTransform = view.options.plotPCAXTransformMoleculeData, YTransform = view.options.plotPCAYTransformMoleculeData;

		var Data = view.overallMoleculeData;
		var propertyList = view.plotSetup.moleculePropertyList;

		console.log(view.PCACalculatedMolecule != true);

		if (view.PCACalculatedMolecule != true) {

			console.log("start PCA");
			const { PCA } = require('ml-pca');
			var filtered = propertyList.filter(function(value, index, arr){
			    return (value != "atom") && (value != "x") && (value != "y") && (value != "z");
			});


		    var arrays = getArrays2(Data, filtered);
		    const pca = new PCA(arrays/*, {nCompNIPALS:options.nPCAComponentsMolecule}*/);
		    var transformed = pca.predict(arrays);

		    console.log("Finished Calculating PCA");

			for (var i = 0; i < Data.length; i++) {
			    for (var j = 1; j <= transformed.columns; j++) {
			    	var tempName = "_PC" + j.toString();
			    	Data[i][tempName] = transformed.data[i][j-1];
			    }
			}

			view.PCACalculatedMolecule = true;
			view.PCAResult = pca;

			view.PCAExplainedVariance = {};
			for (var i = 1; i <= pca.getExplainedVariance().length; i++){
				view.PCAExplainedVariance["_PC" + i] = pca.getExplainedVariance()[i-1];
			}

			view.PCALoadingMatrix = {};
			var PCALoadingMatrix = pca.getLoadings().data;
			console.log(PCALoadingMatrix);
			console.log(filtered.length);
			for (var i = 1; i <= PCALoadingMatrix.length; i++){
				view.PCALoadingMatrix["_PC" + i] = {};
				for (var j = 0; j <= filtered.length; j++){
					view.PCALoadingMatrix["_PC" + i][filtered[j]] = PCALoadingMatrix[i-1][j];
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

	var PCAResultText = "";
	PCAResultText += X + " explained: " + view.PCAExplainedVariance[X].toExponential(4) + '<br>';

	for (var property in view.PCALoadingMatrix[X]){
		if(typeof view.PCALoadingMatrix[X][property] !== "undefined"){
			PCAResultText += property + ": " + view.PCALoadingMatrix[X][property].toExponential(4) + '<br>';
		}
	}

	PCAResultText += '<br>';

	PCAResultText += Y + " explained: " + view.PCAExplainedVariance[Y].toExponential(4) + '<br>';

	for (var property in view.PCALoadingMatrix[Y]){
		if(typeof view.PCALoadingMatrix[Y][property] !== "undefined"){
			PCAResultText += property + ": " + view.PCALoadingMatrix[Y][property].toExponential(4) + '<br>';
		}
	}
			
	view.PCARestultTextWindow.innerHTML = PCAResultText;
}


export function getPCAHeatmap(view){
	var uniforms = {

		color:     { value: new THREE.Color( 0xffffff ) },
		texture:   { value: new THREE.TextureLoader().load( "textures/sprites/disc.png" ) }

	};

	var shaderMaterial = new THREE.ShaderMaterial( {

		uniforms:       uniforms,
		vertexShader:   document.getElementById( 'vertexshader' ).textContent,
		fragmentShader: document.getElementById( 'fragmentshader' ).textContent,

		blending:       THREE.AdditiveBlending,
		depthTest:      false,
		transparent:    true

	});

	var options = view.options;
	var scene = view.scene;

	if (options.plotData == 'spatiallyResolvedData'){
		var X = view.options.plotPCAXSpatiallyResolvedData, Y = view.options.plotPCAYSpatiallyResolvedData;
	}

	if (options.plotData == 'moleculeData'){
		var X = view.options.plotPCAXMoleculeData, Y = view.options.plotPCAYMoleculeData;
	}

	
	
	var data = view.data;
	
	var num = heatmapPointCount(data);
	
	
	var geometry = new THREE.BufferGeometry();
	var colors = new Float32Array(num *3);
	var positions = new Float32Array(num *3);
	var sizes = new Float32Array(num);
	var alphas = new Float32Array(num);

	var PCAHeatmapInformation = [];
	//console.log(spatiallyResolvedData.length);
	//console.log(num);
	
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
			}
			else {
				colors[i3 + 0] = 100;
				colors[i3 + 1] = 100;
				colors[i3 + 2] = 100;
			}
			sizes[i] = options.pointCloudSize;
			alphas[i] = options.pointCloudAlpha;
			
			i++;
			i3 += 3;

			var tempInfo = {x:xPlot-50, 
							y:yPlot-50, 
							numberDatapointsRepresented: numberDatapointsRepresented,
							xStart: view.xScale.invertExtent(x)[0],
							xEnd: 	view.xScale.invertExtent(x)[1],
							yStart: view.yScale.invertExtent(y)[0],
							yEnd: 	view.yScale.invertExtent(y)[1]/*,
							heatmapX: x,
							heatmapY: y*/
							};
			//console.log(tempInfo);
			//console.log(view.xScale.invertExtent(""+xPlot)[0], view.xScale.invertExtent(""+xPlot)[1])
			PCAHeatmapInformation.push(tempInfo)
		}
	}
	
	view.PCAHeatmapInformation = PCAHeatmapInformation;
	geometry.setAttribute( 'position', new THREE.BufferAttribute( positions, 3 ) );
	geometry.setAttribute( 'customColor', new THREE.BufferAttribute( colors, 3 ) );
	geometry.setAttribute( 'size', new THREE.BufferAttribute( sizes, 1 ) );
	geometry.setAttribute( 'alpha', new THREE.BufferAttribute( alphas, 1 ) );

	var System = new THREE.Points(geometry, shaderMaterial);
	//return System;

	//particles.name = 'scatterPoints';
			
	view.PCAHeatmapPlot = System;
	//view.attributes = particles.attributes;
	//view.geometry = particles.geometry;
	//scene.add(System);

	return System
	
}


export function updatePCAHeatmap(view){
	var options = view.options;
	var System = view.PCAHeatmapPlot;
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
				colors[i3 + 0] = 100;
				colors[i3 + 1] = 100;
				colors[i3 + 2] = 100;
				sizes[i] = options.pointCloudSize;
				alphas[i] = options.pointCloudAlpha/2;
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



export function replotPCAHeatmap(view){
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
	var PCAGroup = new THREE.Group()

	var PCAPlot = getPCAHeatmap(view);
	var PCAAxis = getAxis(view);

	PCAGroup.add(PCAPlot);
	PCAGroup.add(PCAAxis);

	view.PCAGroup = PCAGroup;
	view.scene.add( PCAGroup );
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

function heatmapPointCount(data){
	var count = 0;
	for (var x in data){
		for (var y in data[x]){
			count = count + 1;
		}
	}
	return count;
}

export function initializePCATooltip(view){

	if(typeof view.PCARestultTextWindow  == "undefined")
	{
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