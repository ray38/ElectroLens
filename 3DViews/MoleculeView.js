import {colorSetup, atomRadius} from "./AtomSetup.js";
import {hexToRgb, colorToRgb, rgbToHex} from "../Utilities/other.js";
import {getOffsetArray, updateOffsetArray} from "./Utilities.js";
import {shaderMaterial2, MoleculeMaterial, MoleculeMaterialInstanced, getMoleculeMaterialInstanced, getMoleculeAtomSpriteMaterialInstanced, getMoleculeBondLineMaterialInstanced} from "./Materials.js";

function addAtoms(view, moleculeData, lut){

	var systemDimension = view.systemDimension;
	var latticeVectors = view.systemLatticeVectors;
	var options = view.options;
	var sizeCode = options.moleculeSizeCodeBasis;
	var colorCode = options.moleculeColorCodeBasis;

	if (options.atomsStyle == "sprite"){
		var geometry = new THREE.InstancedBufferGeometry();
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
					sizes[i] = options.atomSize*atomRadius[atomData.atom] * 10;
				}
				else {
					var tempSize = (atomData[sizeCode] - options.moleculeSizeSettingMin)/(options.moleculeSizeSettingMax - options.moleculeSizeSettingMin);
					sizes[i] = options.atomSize*tempSize* 10;
				}

				alphas[i] = options.moleculeAlpha;
			}
			else{
				sizes[i] = 0;
				alphas[i] = 0;
			}

			i3 +=3;
		}


		var geometry = new THREE.InstancedBufferGeometry();
		geometry.setAttribute( 'position', new THREE.BufferAttribute( positions, 3 ) );
		geometry.setAttribute( 'customColor', new THREE.BufferAttribute( colors, 3 ) );
		geometry.setAttribute( 'size', new THREE.BufferAttribute( sizes, 1 ) );
		geometry.setAttribute( 'alpha', new THREE.BufferAttribute( alphas, 1 ) );
		// console.log(sumDisplacement);
		var offsetResult = getOffsetArray(systemDimension, latticeVectors, options);
		geometry.setAttribute('offset', new THREE.InstancedBufferAttribute(offsetResult.sumDisplacement, 3 ));
		geometry.maxInstancedCount = offsetResult.counter;

		var atoms = new THREE.Points( geometry, getMoleculeAtomSpriteMaterialInstanced(options) );
		atoms.frustumCulled = false;

	}

	if (options.atomsStyle == "ball"){
		var atomList = [];
		var atomColorList = [];

		for (var i = 0; i < moleculeData.length; i++) {
			var atomData = moleculeData[i];

			if (moleculeData[i].selected) {
				if (colorCode == "atom") {
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

		var material = getMoleculeMaterialInstanced(options);
		
		var offsetResult = getOffsetArray(systemDimension, latticeVectors, options);
		atomsGeometry.setAttribute('offset', new THREE.InstancedBufferAttribute(offsetResult.sumDisplacement, 3 ));
		atomsGeometry.maxInstancedCount = offsetResult.counter;

		var atoms = new THREE.Mesh( atomsGeometry, material);
	}
	view.molecule.atoms = atoms;
	view.scene.add(atoms);
}



function addBonds(view, moleculeData, neighborsData){
	var systemDimension = view.systemDimension;
	var latticeVectors = view.systemLatticeVectors;
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

		var material = getMoleculeMaterialInstanced(options);
		
		var offsetResult = getOffsetArray(systemDimension, latticeVectors, options);
		bondsGeometry.setAttribute('offset', new THREE.InstancedBufferAttribute(offsetResult.sumDisplacement, 3 ));
		bondsGeometry.maxInstancedCount = offsetResult.counter;
		var bonds = new THREE.Mesh( bondsGeometry, material );
	}

	else if (options.bondsStyle == "line"){
		
		
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

		var geometry = new THREE.InstancedBufferGeometry();
		geometry.setAttribute( 'position', new THREE.BufferAttribute( positions, 3 ) );
		geometry.setAttribute('color', new THREE.Float32BufferAttribute(colors, 3));
		geometry.setIndex(new THREE.BufferAttribute(new Uint16Array(indices), 1));

		var offsetResult = getOffsetArray(systemDimension, latticeVectors, options);
		geometry.setAttribute('offset', new THREE.InstancedBufferAttribute(offsetResult.sumDisplacement, 3 ));
		geometry.maxInstancedCount = offsetResult.counter;

		var bonds = new THREE.LineSegments( geometry, getMoleculeBondLineMaterialInstanced(options) );
		bonds.frustumCulled = false;

	}

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

	const combinedGeometry = new THREE.InstancedBufferGeometry();
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

	var options = view.options;

	if(options.showAtoms) {
		var systemDimension = view.systemDimension;
		var latticeVectors = view.systemLatticeVectors;

		updateOffsetArray(systemDimension, latticeVectors, view.molecule.atoms.geometry, options);
		
		if (options.atomsStyle == "sprite") {
			
			view.molecule.atoms.material.uniforms.xClippingPlaneMax.value = options.x_high;
			view.molecule.atoms.material.uniforms.xClippingPlaneMin.value = options.x_low;
			view.molecule.atoms.material.uniforms.yClippingPlaneMax.value = options.y_high;
			view.molecule.atoms.material.uniforms.yClippingPlaneMin.value = options.y_low;
			view.molecule.atoms.material.uniforms.zClippingPlaneMax.value = options.z_high;
			view.molecule.atoms.material.uniforms.zClippingPlaneMin.value = options.z_low;

		} else if (options.atomsStyle == "ball") {
			var atomsMaterialShader = view.molecule.atoms.material.userData.shader;
			atomsMaterialShader.uniforms.xClippingPlaneMax.value = options.x_high;
			atomsMaterialShader.uniforms.xClippingPlaneMin.value = options.x_low;
			atomsMaterialShader.uniforms.yClippingPlaneMax.value = options.y_high;
			atomsMaterialShader.uniforms.yClippingPlaneMin.value = options.y_low;
			atomsMaterialShader.uniforms.zClippingPlaneMax.value = options.z_high;
			atomsMaterialShader.uniforms.zClippingPlaneMin.value = options.z_low;
		}

	}

	if (options.showBonds) {
		var systemDimension = view.systemDimension;
		var latticeVectors = view.systemLatticeVectors;

		updateOffsetArray(systemDimension, latticeVectors, view.molecule.bonds.geometry, options);

		if (options.bondsStyle == "line") {
			view.molecule.bonds.material.uniforms.xClippingPlaneMax.value = options.x_high;
			view.molecule.bonds.material.uniforms.xClippingPlaneMin.value = options.x_low;
			view.molecule.bonds.material.uniforms.yClippingPlaneMax.value = options.y_high;
			view.molecule.bonds.material.uniforms.yClippingPlaneMin.value = options.y_low;
			view.molecule.bonds.material.uniforms.zClippingPlaneMax.value = options.z_high;
			view.molecule.bonds.material.uniforms.zClippingPlaneMin.value = options.z_low;

		} else if (options.bondsStyle == "tube") {
			var bondsMaterialShader = view.molecule.bonds.material.userData.shader;
			bondsMaterialShader.uniforms.xClippingPlaneMax.value = options.x_high;
			bondsMaterialShader.uniforms.xClippingPlaneMin.value = options.x_low;
			bondsMaterialShader.uniforms.yClippingPlaneMax.value = options.y_high;
			bondsMaterialShader.uniforms.yClippingPlaneMin.value = options.y_low;
			bondsMaterialShader.uniforms.zClippingPlaneMax.value = options.z_high;
			bondsMaterialShader.uniforms.zClippingPlaneMin.value = options.z_low;
		}
	}

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
