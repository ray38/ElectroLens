import {addTitle,changeTitle} from "./Utilities.js";
import {makeTextSprite, makeTextSprite2} from "../Utilities/other.js"
import {getAxis,dispose2DPlots} from "./Utilities.js";
import {insertLegend, removeLegend, changeLegend, insertLegendMolecule, removeLegendMolecule, changeLegendMolecule} from "../MultiviewControl/colorLegend.js";

export function arrangeDataForCovariance(view){

	const options = view.options;
	let Transform, Data, propertyList;
	if (options.plotData == 'spatiallyResolvedData'){

		Transform = view.options.covarianceTransformSpatiallyResolvedData

		Data = view.overallSpatiallyResolvedData;
		propertyList = view.plotSetup.spatiallyResolvedPropertyList;
	}

	if (options.plotData == 'moleculeData'){

		Transform = view.options.covarianceTransformMoleculeData

		Data = view.overallMoleculeData;
		propertyList = view.plotSetup.moleculePropertyList;
	}


	const filtered = propertyList.filter(function(value, index, arr){
	    return (value != "atom") && (value != "x") && (value != "y") && (value != "z");
	});


    const corrMatrix = jz.arr.correlationMatrix(Data, filtered);
    const grid = data2grid.grid(corrMatrix);
    view.data = grid;

			
}


export function getCovariance(view){
	const uniforms = {

		color:     { value: new THREE.Color( 0xffffff ) },
		texture:   { value: new THREE.TextureLoader().load( "textures/sprites/disc.png" ) }

	};

	const shaderMaterial = new THREE.ShaderMaterial( {

		uniforms:       uniforms,
		vertexShader:   document.getElementById( 'vertexshader' ).textContent,
		fragmentShader: document.getElementById( 'fragmentshader' ).textContent,

		blending:       THREE.AdditiveBlending,
		depthTest:      false,
		transparent:    true

	});

	const options = view.options;
	const scene = view.scene;

	let propertyList;
	if (options.plotData == 'spatiallyResolvedData'){
		propertyList = view.plotSetup.spatiallyResolvedPropertyList;
	}

	if (options.plotData == 'moleculeData'){
		propertyList = view.plotSetup.moleculePropertyList;
	}

	const filtered = propertyList.filter(function(value, index, arr){
	    return (value != "atom") && (value != "x") && (value != "y") && (value != "z");
	});
	
	const data = view.data;
	
	const num = filtered.length ** 2;
	
	const geometry = new THREE.BufferGeometry();
	const colors = new Float32Array(num *3);
	const positions = new Float32Array(num *3);
	const sizes = new Float32Array(num);
	const alphas = new Float32Array(num);

	const covarianceInformation = [];
	
	const lut = new THREE.Lut( options.colorMap, 500 );
	lut.setMax( 1);
	lut.setMin( 0 );
	view.lut = lut;
	
	let i = 0;
	let i3 = 0;

	const step = 100 / filtered.length;
	for (const datapoint of data){
		
		positions[i3 + 0] = datapoint.row * step - 50 - (step/2);
		positions[i3 + 1] = datapoint.column * step - 50 - (step/2);
		positions[i3 + 2] = 0
		
		const tempCorrelation = datapoint.correlation;

		const color = lut.getColor( 1-Math.abs(tempCorrelation) );
	
		colors[i3 + 0] = color.r;
		colors[i3 + 1] = color.g;
		colors[i3 + 2] = color.b;
		
		sizes[i] = options.pointCloudSize*10;
		alphas[i] = options.pointCloudAlpha;

		
		i++;
		i3 += 3;

		const tempInfo = { 
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

	const System = new THREE.Points(geometry, shaderMaterial);
	view.covariancePlot = System;

	return System
	
}


export function updateCovariance(view){

	const options = view.options;
	const System = view.covariancePlot;
	const data = view.data;

	let propertyList;
	if (options.plotData == 'spatiallyResolvedData'){
		 propertyList = view.plotSetup.spatiallyResolvedPropertyList;
	}

	if (options.plotData == 'moleculeData'){
		propertyList = view.plotSetup.moleculePropertyList;
	}

	const filtered = propertyList.filter(function(value, index, arr){
	    return (value != "atom") && (value != "x") && (value != "y") && (value != "z");
	});
	const num = filtered.length ** 2;
	const colors = new Float32Array(num *3);
	const sizes = new Float32Array(num);
	const alphas = new Float32Array(num);
	const lut = new THREE.Lut( options.colorMap, 500 );
	lut.setMax( 1);
	lut.setMin( 0 );
	view.lut = lut;
	let i = 0;
	let i3 = 0;

	for (const datapoint of data){
		
		const tempCorrelation = datapoint.correlation;

		const color = lut.getColor( 1-Math.abs(tempCorrelation) );
	
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
	const covariance = new THREE.Group()

	const covariancePlot = getCovariance(view);
	const covarianceAxis = getAxis(view);

	covariance.add(covariancePlot);
	covariance.add(covarianceAxis);

	view.covariance = covariance;
	view.scene.add( covariance );
	changeLegend(view);
	changeTitle(view);

}

