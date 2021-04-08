import {addTitle,changeTitle} from "./Utilities.js";
import {makeTextSprite, makeTextSprite2} from "../Utilities/other.js"
import {getAxis} from "./Utilities.js";
import {insertLegend, removeLegend, changeLegend, insertLegendMolecule, removeLegendMolecule, changeLegendMolecule} from "../MultiviewControl/colorLegend.js";

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

    //console.log(xScale.invertExtent(""+50))
	const colorArray = [[1, 0, 0],[0, 1, 0], [0, 0, 1], [1, 1, 0], [1, 0, 1], [0, 1, 1], [1, 1, 1]];
	let count = 0;
    Data.forEach(datapoint => {
        var heatmapX = xMap(datapoint);
		var heatmapY = yMap(datapoint);

        if (!view.data[datapoint.name]) { view.data[datapoint.name] = {color: colorArray[count], data:{}}; count += 1}
        if (!view.data[datapoint.name].data[heatmapX]) {view.data[datapoint.name].data[heatmapX] = {};}
        if (!view.data[datapoint.name].data[heatmapX][heatmapY]) {view.data[datapoint.name].data[heatmapX][heatmapY] = {list:[], selected:true};}
		view.data[datapoint.name].data[heatmapX][heatmapY]['list'].push(datapoint);
    });

}


export function getComparison(view){
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
		var X = view.options.plotXSpatiallyResolvedData, Y = view.options.plotYSpatiallyResolvedData;
	}

	if (options.plotData == 'moleculeData'){
		var X = view.options.plotXMoleculeData, Y = view.options.plotYMoleculeData;
	}

    const systemPlots = {};
	var overallData = view.data;

	Object.keys(overallData).forEach((systemName, index) => { 
        var data = overallData[systemName].data;
		var num = comparisonPointCount(data);
		var color = overallData[systemName].color;
		console.log(systemName, data, color, num);

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

        var xPlotScale = view.xPlotScale;
        var yPlotScale = view.yPlotScale;
        
        for (var x in data){
            for (var y in data[x]){
                var xPlot = xPlotScale(parseFloat(x));
                var yPlot = yPlotScale(parseFloat(y));
                
                positions[i3 + 0] = xPlot;
                positions[i3 + 1] = yPlot;
                positions[i3 + 2] = 0
                
                var numberDatapointsRepresented = countListSelected(data[x][y].list);
                if (numberDatapointsRepresented > 0) {
                
                    colors[i3 + 0] = color[0];
                    colors[i3 + 1] = color[1];
					colors[i3 + 2] = color[2];
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
        geometry.setAttribute( 'position', new THREE.BufferAttribute( positions, 3 ) );
        geometry.setAttribute( 'customColor', new THREE.BufferAttribute( colors, 3 ) );
        geometry.setAttribute( 'size', new THREE.BufferAttribute( sizes, 1 ) );
        geometry.setAttribute( 'alpha', new THREE.BufferAttribute( alphas, 1 ) );

        var System = new THREE.Points(geometry, shaderMaterial);
        systemPlots[systemName] = System;

	})
	
	// view.comparisonPlot = systemPlots;

	return systemPlots
	
}


export function updateComparison(view){
	var options = view.options;
	const overallData = view.data;

	console.log(Object.keys(overallData))
	Object.keys(overallData).forEach((systemName, index) => { 
        var data = overallData[systemName].data;
		var num = comparisonPointCount(data);
		var color = overallData[systemName].color;
		console.log(systemName, data, color, num);

        var geometry = new THREE.BufferGeometry();
        var colors = new Float32Array(num *3);
        var sizes = new Float32Array(num);
		var alphas = new Float32Array(num);
		
		var plot = view.comparisonPlots[systemName];
        
        
        var i = 0;
        var i3 = 0;

        
        for (var x in data){
            for (var y in data[x]){
                
                var numberDatapointsRepresented = countListSelected(data[x][y].list);
                if (numberDatapointsRepresented > 0) {
                
                    colors[i3 + 0] = color[0];
                    colors[i3 + 1] = color[1];
					colors[i3 + 2] = color[2];
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
        
        // view.heatmapInformation = heatmapInformation;
        plot.geometry.setAttribute( 'customColor', new THREE.BufferAttribute( colors, 3 ) );
        plot.geometry.setAttribute( 'size', new THREE.BufferAttribute( sizes, 1 ) );
        plot.geometry.setAttribute( 'alpha', new THREE.BufferAttribute( alphas, 1 ) );
	})
	
	

}

export function getHeatmapLabels(view){
	var labels = new THREE.Group();


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

export function replotComparison(view){
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
	var comparisonAxis = getAxis(view);
	//var heatmapLabels = getHeatmapLabels(view);

	for (const systemName in comparisonPlots) {
		comparison.add(comparisonPlots[systemName]);
	}
	comparison.add(comparisonAxis);
	//heatmap.add(heatmapLabels)
	view.comparisonPlots = comparisonPlots;
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

function comparisonPointCount(data){
	var count = 0;
	for (var x in data){
		for (var y in data[x]){
			count = count + 1;
		}
    }
    
	return count;
}