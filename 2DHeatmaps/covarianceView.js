import {addTitle,changeTitle} from "./Utilities.js";
import {makeTextSprite, makeTextSprite2} from "../Utilities/other.js"
import {getAxis,dispose2DPlots} from "./Utilities.js";
import {insertLegend, removeLegend, changeLegend, insertLegendMolecule, removeLegendMolecule, changeLegendMolecule} from "../MultiviewControl/colorLegend.js";

export function arrangeDataForCovariance(view){

	var options = view.options;
	if (options.plotData == 'spatiallyResolvedData'){

		var Transform = view.options.covarianceTransformSpatiallyResolvedData

		var Data = view.overallSpatiallyResolvedData;
		var propertyList = view.plotSetup.spatiallyResolvedPropertyList;
	}

	if (options.plotData == 'moleculeData'){

		var Transform = view.options.covarianceTransformMoleculeData

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
	var filtered = propertyList.filter(function(value, index, arr){
	    return (value != "atom") && (value != "x") && (value != "y") && (value != "z");
	});


    var corrMatrix = jz.arr.correlationMatrix(Data, filtered);
    var grid = data2grid.grid(corrMatrix);
    view.data = grid;

			
}


export function getCovariance(view){
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
		//var X = view.options.plotXSpatiallyResolvedData, Y = view.options.plotYSpatiallyResolvedData;
		var propertyList = view.plotSetup.spatiallyResolvedPropertyList;
	}

	if (options.plotData == 'moleculeData'){
		//var X = view.options.plotXMoleculeData, Y = view.options.plotYMoleculeData;
		var propertyList = view.plotSetup.moleculePropertyList;
	}

	var filtered = propertyList.filter(function(value, index, arr){
	    return (value != "atom") && (value != "x") && (value != "y") && (value != "z");
	});
	
	var data = view.data;
	console.log(data)
	
	//var num = propertyList.length ** 2;
	var num = filtered.length ** 2;

	console.log(num);
	console.log(options.pointCloudSize);
	console.log(options.pointCloudAlpha);
	
	var geometry = new THREE.BufferGeometry();
	var colors = new Float32Array(num *3);
	var positions = new Float32Array(num *3);
	var sizes = new Float32Array(num);
	var alphas = new Float32Array(num);

	var covarianceInformation = [];
	//console.log(spatiallyResolvedData.length);
	//console.log(num);
	
	var lut = new THREE.Lut( options.colorMap, 500 );
	lut.setMax( 1);
	lut.setMin( 0 );
	view.lut = lut;
	
	var i = 0;
	var i3 = 0;

	
	//var ii = 0, jj = 0;
	//var step = 100 / propertyList.length;
	var step = 100 / filtered.length;
	for (const datapoint of data){
		
		positions[i3 + 0] = datapoint.row * step - 50 - (step/2);
		positions[i3 + 1] = datapoint.column * step - 50 - (step/2);
		positions[i3 + 2] = 0
		
		var tempCorrelation = datapoint.correlation;

		var color = lut.getColor( 1-Math.abs(tempCorrelation) );
	
		colors[i3 + 0] = color.r;
		colors[i3 + 1] = color.g;
		colors[i3 + 2] = color.b;
		
		sizes[i] = options.pointCloudSize*10;
		alphas[i] = options.pointCloudAlpha;

		
		i++;
		i3 += 3;

		var tempInfo = { 
						correlation: tempCorrelation,
						x:datapoint.column_x,
						y:datapoint.column_y
						};
		//console.log(tempInfo);
		//console.log(view.xScale.invertExtent(""+xPlot)[0], view.xScale.invertExtent(""+xPlot)[1])
		covarianceInformation.push(tempInfo)


	}
	console.log(i);
	
	view.covarianceInformation = covarianceInformation;
	geometry.setAttribute( 'position', new THREE.BufferAttribute( positions, 3 ) );
	geometry.setAttribute( 'customColor', new THREE.BufferAttribute( colors, 3 ) );
	geometry.setAttribute( 'size', new THREE.BufferAttribute( sizes, 1 ) );
	geometry.setAttribute( 'alpha', new THREE.BufferAttribute( alphas, 1 ) );

	var System = new THREE.Points(geometry, shaderMaterial);
	//return System;

	//particles.name = 'scatterPoints';
			
	view.covariancePlot = System;
	//view.attributes = particles.attributes;
	//view.geometry = particles.geometry;
	//scene.add(System);

	return System
	
}


export function updateCovariance(view){

	var options = view.options;
	var System = view.covariancePlot;
	var data = view.data;


	if (options.plotData == 'spatiallyResolvedData'){
		//var X = view.options.plotXSpatiallyResolvedData, Y = view.options.plotYSpatiallyResolvedData;
		var propertyList = view.plotSetup.spatiallyResolvedPropertyList;
	}

	if (options.plotData == 'moleculeData'){
		//var X = view.options.plotXMoleculeData, Y = view.options.plotYMoleculeData;
		var propertyList = view.plotSetup.moleculePropertyList;
	}

	var filtered = propertyList.filter(function(value, index, arr){
	    return (value != "atom") && (value != "x") && (value != "y") && (value != "z");
	});
	//var num = propertyList.length ** 2;
	var num = filtered.length ** 2;
	var colors = new Float32Array(num *3);
	var sizes = new Float32Array(num);
	var alphas = new Float32Array(num);
	var lut = new THREE.Lut( options.colorMap, 500 );
	lut.setMax( 1);
	lut.setMin( 0 );
	view.lut = lut;
	var i = 0;
	var i3 = 0;

	for (const datapoint of data){
		

		
		var tempCorrelation = datapoint.correlation;

		var color = lut.getColor( 1-Math.abs(tempCorrelation) );
	
		colors[i3 + 0] = color.r;
		colors[i3 + 1] = color.g;
		colors[i3 + 2] = color.b;
		
		sizes[i] = options.pointCloudSize*10;
		alphas[i] = options.pointCloudAlpha;

		
		i++;
		i3 += 3;


	}
	//geometry.addAttribute( 'position', new THREE.BufferAttribute( positions, 3 ) );
	System.geometry.setAttribute( 'customColor', new THREE.BufferAttribute( colors, 3 ) );
	System.geometry.setAttribute( 'size', new THREE.BufferAttribute( sizes, 1 ) );
	System.geometry.setAttribute( 'alpha', new THREE.BufferAttribute( alphas, 1 ) );

}



export function replotCovariance(view){

	dispose2DPlots(view);
	
	arrangeDataForCovariance(view);
	var covariance = new THREE.Group()

	var covariancePlot = getCovariance(view);
	var covarianceAxis = getAxis(view);

	covariance.add(covariancePlot);
	covariance.add(covarianceAxis);

	view.covariance = covariance;
	view.scene.add( covariance );
	changeLegend(view);
	changeTitle(view);

}

