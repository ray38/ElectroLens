import {colorSetup, atomRadius} from "./AtomSetup.js";
import {shaderMaterial2, shaderMaterial3} from "./Materials.js/index.js";
import {hexToRgb, colorToRgb, rgbToHex} from "../Utilities/other.js";


function addAtoms(view, moleculeData, lut){
	var options = view.options;
	var sizeCode = options.moleculeSizeCodeBasis;
	var colorCode = options.moleculeColorCodeBasis;

	if (options.atomsStyle == "sprite"){
		var geometry = new THREE.BufferGeometry();
		var positions = new Float32Array(moleculeData.length * 3);
		var colors = new Float32Array( moleculeData.length* 3);
		var sizes = new Float32Array( moleculeData.length );
		var alphas = new Float32Array( moleculeData.length );

		var i3 = 0;
		for (var i = 0; i < moleculeData.length; i++) {
			var atomData = moleculeData[i];
			positions[i3+0] = atomData.x;
			positions[i3+1] = atomData.y;
			positions[i3+2] = atomData.z;

			if (colorCode == "atom") {
				var color = colorToRgb(colorSetup[atomData.atom]);
			}
			else {
				var color = lut.getColor( atomData[colorCode] );
			}

			colors[ i3+0 ] = color.r;
			colors[ i3+1 ] = color.g;
			colors[ i3+2 ] = color.b;

			if (moleculeData[i].selected) {
				if (sizeCode == "atom") {
					sizes[i] = options.atomSize*atomRadius[atomData.atom];
				}
				else {
					var tempSize = (atomData[sizeCode] - options.moleculeSizeSettingMin)/(options.moleculeSizeSettingMax - options.moleculeSizeSettingMin);
					sizes[i] = options.atomSize*tempSize;
				}

				alphas[i] = options.moleculeAlpha;
			}
			else{
				sizes[i] = 0;
				alphas[i] = 0;
			}

			i3 +=3;
		}

		geometry.setAttribute( 'position', new THREE.BufferAttribute( positions, 3 ) );
		geometry.setAttribute( 'customColor', new THREE.BufferAttribute( colors, 3 ) );
		geometry.setAttribute( 'size', new THREE.BufferAttribute( sizes, 1 ) );
		geometry.setAttribute( 'alpha', new THREE.BufferAttribute( alphas, 1 ) );

		var atoms = new THREE.Points( geometry, shaderMaterial2 );
		atoms.frustumCulled = false;

	}

	if (options.atomsStyle == "ball"){
		var atomList = [];
		var atomColorList = [];

		for (var i = 0; i < moleculeData.length; i++) {
			var atomData = moleculeData[i];

			if (moleculeData[i].selected) {
				if (colorCode == "atom") {
					//var color = colorToRgb(colorSetup[atomData.atom]);
					var color = colorSetup[atomData.atom];
				}
				else {
					var color = lut.getColor( atomData[colorCode] );
				}
				if (sizeCode == "atom") {
					var atomSize = options.atomSize*atomRadius[atomData.atom];
				}
				else {
					var tempSize = (atomData[sizeCode] - options.moleculeSizeSettingMin)/(options.moleculeSizeSettingMax - options.moleculeSizeSettingMin);
					var atomSize = options.atomSize * tempSize;
				}
				atomList.push(new THREE.SphereBufferGeometry(atomSize, options.atomModelSegments, options.atomModelSegments).translate(atomData.x, atomData.y,atomData.z));
				var tempColor = new THREE.Color( color );
				atomColorList.push([tempColor.r, tempColor.g, tempColor.b]);

			}
		}
		var atomsGeometry = combineGeometry(atomList, atomColorList);
		var atoms = new THREE.Mesh( atomsGeometry, new THREE.MeshPhongMaterial( { transparent: true, opacity: options.moleculeAlpha, vertexColors: THREE.VertexColors} ) );
	}
	
	view.molecule.atoms = atoms;
	view.scene.add(atoms);
}



function addBonds(view, moleculeData, neighborsData){
	var options = view.options;
	var colorCode = options.moleculeColorCodeBasis;
	var lut = view.moleculeLut;

	if (options.bondsStyle == "tube"){
		var bondList = [];
		var bondColorList = [];
		
		for (var i = 0; i < moleculeData.length; i++) {
			if (moleculeData[i].selected) {
				var tempNeighborObject = neighborsData[i];
				var neighborsList = tempNeighborObject.neighborsList;
				var distancesList = tempNeighborObject.distancesList;
				var coordinatesList = tempNeighborObject.coordinatesList;

				if (colorCode == "atom") {
					var color = colorSetup[moleculeData[i].atom];
				}
				else {
					var color = lut.getColor( moleculeData[i][colorCode] );
				}

				var point1 = new THREE.Vector3(moleculeData[i].x, moleculeData[i].y,moleculeData[i].z);

			    for (var j = 0; j < neighborsList.length; j++) {
			    	var point2 = coordinatesList[j];
				    if (distancesList[j] < options.maxBondLength && distancesList[j] > options.minBondLength &&  neighborsList[j].selected ) {
						bondList.push(createBond(options, point1, point2));
						var tempColor = new THREE.Color( color );
				    	bondColorList.push([tempColor.r, tempColor.g, tempColor.b]);
				    }
				}
			}
		}
		var bondsGeometry = combineGeometry(bondList, bondColorList);
		var bonds = new THREE.Mesh( bondsGeometry, new THREE.MeshPhongMaterial( { transparent: true, opacity: options.moleculeAlpha, vertexColors: THREE.VertexColors} ) );
	}

	if (options.bondsStyle == "line"){
		var basicLineBondGeometry = new THREE.BufferGeometry();
		var material = new THREE.LineBasicMaterial({vertexColors: THREE.VertexColors });
		var vertices = [];
		var indices = [];
		var verticesColors = [];
		var index_counter = 0;

		for (var i = 0; i < moleculeData.length; i++) {
			if (moleculeData[i].selected) {
				var tempNeighborObject = neighborsData[i];
				var neighborsList = tempNeighborObject.neighborsList;
				var distancesList = tempNeighborObject.distancesList;
				var coordinatesList = tempNeighborObject.coordinatesList;

				if (colorCode == "atom") {var color = colorToRgb(colorSetup[moleculeData[i].atom]);	}
				else {var color = lut.getColor( moleculeData[i][colorCode] );}
				//var color = colorSetup[moleculeData[i].atom];

				var point1 = new THREE.Vector3(moleculeData[i].x, moleculeData[i].y, moleculeData[i].z);

			    for (var j = 0; j < neighborsList.length; j++) {
			    	var point2 = coordinatesList[j];
				    if (distancesList[j] < options.maxBondLength && distancesList[j] > options.minBondLength &&  neighborsList[j].selected ) {

				    	vertices.push(point1, point2);
				    	indices.push(index_counter, index_counter + 1);
				    	verticesColors.push(color, color);
				    	index_counter += 2;

				    }
				}
			}
		}

		var positions = new Float32Array(vertices.length * 3);
		var colors = new Float32Array(vertices.length * 3);

		for (var i = 0; i < vertices.length; i++) {

		    positions[i * 3] = vertices[i].x;
		    positions[i * 3 + 1] = vertices[i].y;
		    positions[i * 3 + 2] = vertices[i].z;

		    colors[i * 3] = verticesColors[i].r;
		    colors[i * 3 + 1] = verticesColors[i].g;
		    colors[i * 3 + 2] = verticesColors[i].b;

		}
		basicLineBondGeometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
		basicLineBondGeometry.setAttribute('color', new THREE.Float32BufferAttribute(colors, 3));
		basicLineBondGeometry.setIndex(new THREE.BufferAttribute(new Uint16Array(indices), 1));

		var bonds = new THREE.LineSegments(basicLineBondGeometry, material);
	}

	/* if (options.bondsStyle == "fatline"){
		var basicLineBondGeometry = new THREE.BufferGeometry();
		var material = new THREE.LineMaterial( {

			color: 0xffffff,
			linewidth: 5, // in pixels
			vertexColors: THREE.VertexColors,
			//resolution:  // to be set by renderer, eventually
			dashed: false

		} );

		material.resolution.set( view.windowWidth, view.windowHeight );
		var vertices = [];
		var indices = [];
		var verticesColors = [];
		var index_counter = 0;

		for (var i = 0; i < moleculeData.length; i++) {
			if (moleculeData[i].selected) {
				var tempNeighborObject = neighborsData[i];
				var neighborsList = tempNeighborObject.neighborsList;
				var distancesList = tempNeighborObject.distancesList;
				var coordinatesList = tempNeighborObject.coordinatesList;

				if (colorCode == "atom") {var color = colorToRgb(colorSetup[moleculeData[i].atom]);	}
				else {var color = lut.getColor( moleculeData[i][colorCode] );}
				//var color = colorSetup[moleculeData[i].atom];

				var point1 = new THREE.Vector3(moleculeData[i].xPlot, moleculeData[i].yPlot,moleculeData[i].zPlot);

			    for (var j = 0; j < neighborsList.length; j++) {
			    	//var point2 = new THREE.Vector3(neighborsList[j].xPlot*20.0, neighborsList[j].yPlot*20.0,neighborsList[j].zPlot*20.0);
			    	var point2 = coordinatesList[j];
				    if (distancesList[j] < options.maxBondLength && distancesList[j] > options.minBondLength &&  neighborsList[j].selected ) {

				    	vertices.push(point1, point2);
				    	indices.push(index_counter, index_counter + 1);
				    	verticesColors.push(color, color);
				    	index_counter += 2;

				    }
				}
			}
		}

		var positions = new Float32Array(vertices.length * 3);
		var colors = new Float32Array(vertices.length * 3);

		for (var i = 0; i < vertices.length; i++) {

		    positions[i * 3] = vertices[i].x;
		    positions[i * 3 + 1] = vertices[i].y;
		    positions[i * 3 + 2] = vertices[i].z;

		    colors[i * 3] = verticesColors[i].r;
		    colors[i * 3 + 1] = verticesColors[i].g;
		    colors[i * 3 + 2] = verticesColors[i].b;

		}
		basicLineBondGeometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
		basicLineBondGeometry.setAttribute('color', new THREE.Float32BufferAttribute(colors, 3));
		basicLineBondGeometry.setIndex(new THREE.BufferAttribute(new Uint16Array(indices), 1));
		var bonds = new THREE.LineSegments2(basicLineBondGeometry, material);
	} */
	view.molecule.bonds = bonds;
	view.scene.add(bonds);
}

function combineGeometry(geoarray, colorarray) {
	let posArrLength = 0;
	let normArrLength = 0;
	let uvArrLength = 0;
	let indexArrLength = 0;
	geoarray.forEach(geometry => {
		posArrLength += geometry.attributes.position.count * 3;
		normArrLength += geometry.attributes.normal.count * 3;
		uvArrLength += geometry.attributes.uv.count * 2;
		indexArrLength += geometry.index.count;
	});

	const sumPosArr = new Float32Array(posArrLength);
	const sumColorArr = new Float32Array(posArrLength);
	const sumNormArr = new Float32Array(normArrLength);
	const sumUvArr = new Float32Array(uvArrLength);
	const sumIndexArr = new Uint32Array(indexArrLength);

	const postotalarr = [];

	let sumPosCursor = 0;
	let sumNormCursor = 0;
	let sumUvCursor = 0;
	let sumIndexCursor = 0;
	let sumIndexCursor2 = 0;

	for (let a = 0; a < geoarray.length; a++ ) {
		const posAttArr = geoarray[a].getAttribute('position').array;

		for (let b = 0; b < posAttArr.length; b++) {
			sumPosArr[b + sumPosCursor] = posAttArr[b];
			sumColorArr[b + sumPosCursor] = colorarray[a][b % 3];
		}
		sumPosCursor += posAttArr.length;

		const numAttArr = geoarray[a].getAttribute('normal').array;

		for (let b = 0; b < numAttArr.length; b++) {
			sumNormArr[b + sumNormCursor] = numAttArr[b];
		}
		sumNormCursor += numAttArr.length;

		const uvAttArr = geoarray[a].getAttribute('uv').array;

		for (let b = 0; b < uvAttArr.length; b++) {
			sumUvArr[b + sumUvCursor] = uvAttArr[b];
		}
		sumUvCursor += uvAttArr.length;

		const indexArr = geoarray[a].index.array;
		for (let b = 0; b < indexArr.length; b++) {
			sumIndexArr[b + sumIndexCursor] = indexArr[b] + sumIndexCursor2;
		}
		sumIndexCursor += indexArr.length;
		sumIndexCursor2 += posAttArr.length / 3;
	}

	const combinedGeometry = new THREE.BufferGeometry();
	combinedGeometry.setAttribute('position', new THREE.BufferAttribute(sumPosArr, 3 ));
	combinedGeometry.setAttribute('normal', new THREE.BufferAttribute(sumNormArr, 3 ));
	combinedGeometry.setAttribute('uv', new THREE.BufferAttribute(sumUvArr, 2 ));
	combinedGeometry.setAttribute('color', new THREE.BufferAttribute(sumColorArr, 3 ));
	combinedGeometry.setIndex(new THREE.BufferAttribute(sumIndexArr, 1));
	return combinedGeometry;
}

function createBond(options, point1, point2) {
	var direction = new THREE.Vector3().subVectors( point2, point1 );
	var bondGeometry = new THREE.CylinderBufferGeometry( options.bondSize, options.bondSize, direction.length(), options.bondModelSegments, 1, true);
	//bond.scale.set(1, 1, direction.length());
	var orientation = new THREE.Matrix4();
    // THREE.Object3D().up (=Y) default orientation for all objects 
    orientation.lookAt(point1, point2, new THREE.Object3D().up);
    // rotation around axis X by -90 degrees 
    // matches the default orientation Y 
    // with the orientation of looking Z 
    orientation.multiply(new THREE.Matrix4().set(1,0,0,0,
                                            0,0,1,0, 
                                            0,-1,0,0,
											0,0,0,1));
	bondGeometry.applyMatrix(orientation);
	bondGeometry.translate((point2.x + point1.x) / 2, (point2.y + point1.y) / 2, (point2.z + point1.z) / 2);
	
	return bondGeometry;
}


export function getMoleculeGeometry(view){

	view.molecule = {};
	var options = view.options;
	var currentFrame = options.currentFrame.toString();
	var scene = view.scene;
	//var moleculeData = view.systemMoleculeData;
	var moleculeData = view.systemMoleculeDataFramed[currentFrame];
	var neighborsData = view.systemMoleculeDataFramedBondsDict[currentFrame];

	var sizeCode = options.moleculeSizeCodeBasis;
	var colorCode = options.moleculeColorCodeBasis;

	if (colorCode != "atom") {
		var colorMap = options.colorMap;
		var numberOfColors = 512;

		var lut = new THREE.Lut( colorMap, numberOfColors );
		lut.setMax( options.moleculeColorSettingMax );
		lut.setMin( options.moleculeColorSettingMin );
		//view.lut = lut;
		view.moleculeLut = lut;
	}
	
	
	if (options.showAtoms){
		addAtoms(view, moleculeData, lut);
	}

	if (options.showBonds){
		addBonds(view, moleculeData, neighborsData);
	}
}


export function updateMoleculeGeometry(view){

	removeMoleculeGeometry(view);
	getMoleculeGeometry(view);

}


export function changeMoleculeGeometry(view){

	removeMoleculeGeometry(view);
	getMoleculeGeometry(view);

}

export function removeMoleculeGeometry(view){

	if (view.molecule != null ){
		view.scene.remove(view.molecule.atoms);
		view.scene.remove(view.molecule.bonds);
		delete view.molecule;
	}
}





export function addMoleculePeriodicReplicates(view){

	var systemDimension = view.systemDimension;
	var latticeVectors = view.systemLatticeVectors;

	view.periodicReplicateMolecule = {};

	var options = view.options;
	var scene = view.scene;

	var atoms = view.molecule.atoms;
	var bonds = view.molecule.bonds;

	var x_start = -1 * ((options.xPBC-1)/2);
	var x_end = ((options.xPBC-1)/2) + 1;
	var y_start = -1 * ((options.yPBC-1)/2);
	var y_end = ((options.yPBC-1)/2) + 1;
	var z_start = -1 * ((options.zPBC-1)/2);
	var z_end = ((options.zPBC-1)/2) + 1;

	var dim1Step = {'x': systemDimension.x * latticeVectors.u11, 
					'y': systemDimension.x * latticeVectors.u12, 
					'z': systemDimension.x * latticeVectors.u13};
	var dim2Step = {'x': systemDimension.y * latticeVectors.u21, 
					'y': systemDimension.y * latticeVectors.u22, 
					'z': systemDimension.y * latticeVectors.u23};
	var dim3Step = {'x': systemDimension.z * latticeVectors.u31, 
					'y': systemDimension.z * latticeVectors.u32, 
					'z': systemDimension.z * latticeVectors.u33};
	
	var xStep, yStep, zStep, tempBondsReplica, tempAtomsReplica;

	var periodicReplicateAtomGroup = new THREE.Group();
	var periodicReplicateBondGroup = new THREE.Group();

	
	if (options.showAtoms){
		for ( var i = x_start; i < x_end; i ++) {
			for ( var j = y_start; j < y_end; j ++) {
				for ( var k = z_start; k < z_end; k ++) {
					if (((i == 0) && (j == 0) && (k == 0)) == false) {
						tempAtomsReplica = atoms.clone();
						xStep = i * dim1Step.x + j * dim2Step.x + k * dim3Step.x;
						yStep = i * dim1Step.y + j * dim2Step.y + k * dim3Step.y;
						zStep = i * dim1Step.z + j * dim2Step.z + k * dim3Step.z;
						tempAtomsReplica.position.set(xStep, yStep, zStep); 
						periodicReplicateAtomGroup.add(tempAtomsReplica);
					}
				}
			}
		}
	}

	if (options.showBonds){
		for ( var i = x_start; i < x_end; i ++) {
			for ( var j = y_start; j < y_end; j ++) {
				for ( var k = z_start; k < z_end; k ++) {
					if (((i == 0) && (j == 0) && (k == 0)) == false) {
						tempBondsReplica = bonds.clone();
						xStep = i * dim1Step.x + j * dim2Step.x + k * dim3Step.x;
						yStep = i * dim1Step.y + j * dim2Step.y + k * dim3Step.y;
						zStep = i * dim1Step.z + j * dim2Step.z + k * dim3Step.z;
						tempBondsReplica.position.set(xStep, yStep, zStep); 
						periodicReplicateBondGroup.add(tempBondsReplica);

					}
				}
			}
		}
	}

	
	view.periodicReplicateMolecule.atoms = periodicReplicateAtomGroup;
	view.periodicReplicateMolecule.bonds = periodicReplicateBondGroup;
	scene.add(periodicReplicateAtomGroup);
	scene.add(periodicReplicateBondGroup);
}


export function removeMoleculePeriodicReplicates(view){

	if (view.periodicReplicateMolecule != null ) {
		view.scene.remove(view.periodicReplicateMolecule.atoms);
		view.scene.remove(view.periodicReplicateMolecule.bonds);
		delete view.periodicReplicateMolecule;
	}
}

export function changeMoleculePeriodicReplicates(view){
	removeMoleculePeriodicReplicates(view);
	addMoleculePeriodicReplicates(view);
}