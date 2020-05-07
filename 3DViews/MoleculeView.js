import {colorSetup, atomRadius} from "./AtomSetup.js";
import {hexToRgb, colorToRgb, rgbToHex} from "../Utilities/other.js";
import {getOffsetArray, updateOffsetArray, getPeriodicReplicatesInstancesMolecule, updatePeriodicReplicatesInstancesMolecule, updatePeriodicReplicatesInstancesMoleculeScale} from "./Utilities.js";
import { getMoleculeMaterialInstanced,getMoleculeAtomsMaterialInstanced, getMoleculeAtomSpriteMaterialInstanced, getMoleculeBondLineMaterialInstanced} from "./Materials.js";
import {disposeMeshOrGroup} from '../Utilities/dispose.js';

/*function addAtoms(view, moleculeData, lut){

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
		var atomSize;
		var t0 = performance.now()
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
					atomSize = options.atomSize*atomRadius[atomData.atom] * 10;
				}
				else {
					var tempSize = (atomData[sizeCode] - options.moleculeSizeSettingMin)/(options.moleculeSizeSettingMax - options.moleculeSizeSettingMin);
					atomSize = options.atomSize*tempSize* 10;
				}

				if (moleculeData[i].highlighted) {
					atomSize = atomSize * 2;
				} 

				sizes[i] = atomSize;
				alphas[i] = options.moleculeAlpha;
			}
			else{
				sizes[i] = 0;
				alphas[i] = 0;
			}

			i3 +=3;
		}
		// console.log('sprite atoms', performance.now() - t0, cloneTime);


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

		var sphereTemplate = new THREE.SphereBufferGeometry(1, options.atomModelSegments, options.atomModelSegments);

		var t0 = performance.now();
		var cloneTime = 0;
		var atomSelectionList = new Float32Array(moleculeData.length);
		atomSelectionList.fill(1);
		for (var i = 0; i < moleculeData.length; i++) {
			var atomData = moleculeData[i];

			// if (moleculeData[i].selected) {
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

				if (moleculeData[i].highlighted) {
					atomList.push(sphereTemplate.clone().scale(atomSize * 2, atomSize * 2, atomSize * 2).translate(atomData.x, atomData.y,atomData.z));
				} else {
					// atomList.push(new THREE.SphereBufferGeometry(atomSize, options.atomModelSegments, options.atomModelSegments).translate(atomData.x, atomData.y,atomData.z));
					// atomList.push(sphereTemplate.clone().scale(atomSize, atomSize, atomSize).translate(atomData.x, atomData.y,atomData.z));
					var at0 = performance.now()
					var temp = sphereTemplate.clone();
					cloneTime += performance.now() - at0;
					atomList.push(temp.scale(atomSize, atomSize, atomSize).translate(atomData.x, atomData.y,atomData.z));
				}
				
				var tempColor = new THREE.Color( color );
				atomColorList.push([tempColor.r, tempColor.g, tempColor.b]);

			// }
			if (moleculeData[i].selected == false) {
				atomSelectionList[i] = 0;
			} 
		}
		// console.log('individual balls', performance.now() - t0, cloneTime);
		var atomsGeometry = combineGeometry(atomList, atomColorList, atomSelectionList);
		// console.log('combine balls', performance.now() - t0);
		var material = getMoleculeMaterialInstanced(options);
		
		var offsetResult = getOffsetArray(systemDimension, latticeVectors, options);
		atomsGeometry.setAttribute('offset', new THREE.InstancedBufferAttribute(offsetResult.sumDisplacement, 3 ));
		// atomsGeometry.setAttribute('selection', new THREE.InstancedBufferAttribute(atomSelectionArray, 1 ));
		atomsGeometry.maxInstancedCount = offsetResult.counter;

		var atoms = new THREE.Mesh( atomsGeometry, material);
		atoms.userData.numVerticesPerAtom = sphereTemplate.attributes.position.count;
	}
	view.molecule.atoms = atoms;
	view.scene.add(atoms);
}*/

function addAtoms(view, moleculeData){

	var systemDimension = view.systemDimension;
	var latticeVectors = view.systemLatticeVectors;
	var options = view.options;
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

	if (options.atomsStyle == "sprite"){
		var geometry = new THREE.InstancedBufferGeometry();
		var positions = new Float32Array(moleculeData.length * 3);
		var colors = new Float32Array( moleculeData.length* 3);
		var sizes = new Float32Array( moleculeData.length );
		var alphas = new Float32Array( moleculeData.length );

		var i3 = 0;
		var atomSize;
		var t0 = performance.now()
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

			if (sizeCode == "atom") {
				atomSize = options.atomSize*atomRadius[atomData.atom] * 10;
			}
			else {
				var tempSize = (atomData[sizeCode] - options.moleculeSizeSettingMin)/(options.moleculeSizeSettingMax - options.moleculeSizeSettingMin);
				atomSize = options.atomSize*tempSize* 10;
			}

			if (moleculeData[i].highlighted) {
				atomSize = atomSize * 2;
				sizes[i] = atomSize;
				alphas[i] = options.moleculeAlpha;
			} else if (moleculeData[i].selected) {
				
				sizes[i] = atomSize;
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

		var unitCellScaleArr = new Float32Array(moleculeData.length);
		var unitCellOffsetArr = new Float32Array(moleculeData.length * 3);
		var unitCellColorArr = new Float32Array(moleculeData.length * 3);
		var unitCellSelectionArr = new Float32Array(moleculeData.length);
		var unitCellIndexArr = new Float32Array(moleculeData.length);
		var t0 = performance.now();
		unitCellSelectionArr.fill(0);
		for (var i = 0; i < moleculeData.length; i++) {
			var atomData = moleculeData[i];
			unitCellIndexArr[i] = i;

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

			unitCellOffsetArr[i * 3 + 0] = atomData.x;
			unitCellOffsetArr[i * 3 + 1] = atomData.y;
			unitCellOffsetArr[i * 3 + 2] = atomData.z;

			if (moleculeData[i].highlighted) {
				unitCellScaleArr[i] = atomSize * 2;
			} else {
				unitCellScaleArr[i] = atomSize;
			}
			
			var tempColor = new THREE.Color( color );
			unitCellColorArr[i * 3 + 0] = tempColor.r;
			unitCellColorArr[i * 3 + 1] = tempColor.g;
			unitCellColorArr[i * 3 + 2] = tempColor.b;

			if (moleculeData[i].selected || moleculeData[i].highlighted) {
				unitCellSelectionArr[i] = 1;
			} 
		}
		// console.log('single cell', performance.now() - t0);
		var atomsGeometry = getPeriodicReplicatesInstancesMolecule(unitCellScaleArr, unitCellOffsetArr, unitCellColorArr, unitCellSelectionArr, unitCellIndexArr, systemDimension, latticeVectors, options)
		// console.log('geometry', performance.now() - t0);
		var material = getMoleculeAtomsMaterialInstanced(options);
		var atoms = new THREE.Mesh( atomsGeometry, material);
		atoms.frustumCulled = false;
		// atoms.userData.numVerticesPerAtom = sphereTemplate.attributes.position.count;
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
		
		var bondSelectionList = [];
		for (var i = 0; i < moleculeData.length; i++) {
			// if (moleculeData[i].selected) {
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
				    if (distancesList[j] < options.maxBondLength && distancesList[j] > options.minBondLength /*&&  neighborsList[j].selected*/ ) {
						bondList.push(createBond(options, point1, point2));
						var tempColor = new THREE.Color( color );
						bondColorList.push([tempColor.r, tempColor.g, tempColor.b]);
						if (moleculeData[i].selected && neighborsList[j].selected ){
							bondSelectionList.push(1);
						} else {bondSelectionList.push(0);}
				    }
				}
			// }
		}
		var bondsGeometry = combineGeometry(bondList, bondColorList,bondSelectionList);

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

function combineGeometry(geoarray, colorarray, selectionList) {
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
	const sumSelectionArr = new Float32Array(indexArrLength);
	//sumSelectionArr.fill(0);

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

		sumSelectionArr.fill(selectionList[a], a * indexArr.length, (a+1) * indexArr.length);
	}

	const combinedGeometry = new THREE.InstancedBufferGeometry();
	combinedGeometry.setAttribute('position', new THREE.BufferAttribute(sumPosArr, 3 ));
	combinedGeometry.setAttribute('normal', new THREE.BufferAttribute(sumNormArr, 3 ));
	combinedGeometry.setAttribute('uv', new THREE.BufferAttribute(sumUvArr, 2 ));
	combinedGeometry.setAttribute('color', new THREE.BufferAttribute(sumColorArr, 3 ));
	combinedGeometry.setAttribute('selection', new THREE.BufferAttribute(sumSelectionArr, 1 ));
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
	
	
	if (options.showAtoms){
		addAtoms(view, moleculeData);
	}

	if (options.showBonds){
		addBonds(view, moleculeData, neighborsData);
	}
}




function updateMoleculeGeometrySpriteAtom(view) {
	var options = view.options;
	var sizeCode = options.moleculeSizeCodeBasis;
	var colorCode = options.moleculeColorCodeBasis;
	var currentFrame = options.currentFrame.toString();

	var moleculeData = view.systemMoleculeDataFramed[currentFrame];
	var atoms = view.molecule.atoms;
	var geometry = atoms.geometry;
	if (colorCode != "atom" ) {
		var colorMap = options.colorMap;
		var numberOfColors = 512;

		var lut = new THREE.Lut( colorMap, numberOfColors );
		lut.setMax( options.moleculeColorSettingMax );
		lut.setMin( options.moleculeColorSettingMin );
		//view.lut = lut;
		view.moleculeLut = lut;
	}

	var positions = new Float32Array(moleculeData.length * 3);
	var colors = new Float32Array( moleculeData.length* 3);
	var sizes = new Float32Array(moleculeData.length);
	var alphas = new Float32Array(moleculeData.length);

	var atomSize;
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

		if (sizeCode == "atom") {
			atomSize = options.atomSize*atomRadius[atomData.atom] * 10;
		}
		else {
			var tempSize = (atomData[sizeCode] - options.moleculeSizeSettingMin)/(options.moleculeSizeSettingMax - options.moleculeSizeSettingMin);
			atomSize = options.atomSize*tempSize* 10;
		}

		if (moleculeData[i].highlighted) {
			atomSize = atomSize * 2;
			sizes[i] = atomSize;
			alphas[i] = options.moleculeAlpha;
		} else if (moleculeData[i].selected) {
			
			sizes[i] = atomSize;
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

	geometry.attributes.position.needsUpdate = true;
	geometry.attributes.customColor.needsUpdate = true;
	geometry.attributes.size.needsUpdate = true;
	geometry.attributes.alpha.needsUpdate = true;

}

function updateMoleculeGeometryBallAtom(view) {
	var atoms = view.molecule.atoms;
	var geometry = atoms.geometry;
	var systemDimension = view.systemDimension;
	var latticeVectors = view.systemLatticeVectors;
	var options = view.options;
	var sizeCode = options.moleculeSizeCodeBasis;
	var colorCode = options.moleculeColorCodeBasis;
	var currentFrame = options.currentFrame.toString();
	var moleculeData = view.systemMoleculeDataFramed[currentFrame];

	if (colorCode != "atom" ) {
		var colorMap = options.colorMap;
		var numberOfColors = 512;

		var lut = new THREE.Lut( colorMap, numberOfColors );
		lut.setMax( options.moleculeColorSettingMax );
		lut.setMin( options.moleculeColorSettingMin );
		//view.lut = lut;
		view.moleculeLut = lut;
	}

	var unitCellOffsetArr = new Float32Array(moleculeData.length * 3)
	var unitCellScaleArr = new Float32Array(moleculeData.length);
	var unitCellColorArr = new Float32Array(moleculeData.length * 3);
	var unitCellSelectionArr = new Float32Array(moleculeData.length);
	var unitCellIndexArr = new Float32Array(moleculeData.length);
	var t0 = performance.now();
	unitCellSelectionArr.fill(0);
	var atomSize;
	for (var i = 0; i < moleculeData.length; i++) {
		var atomData = moleculeData[i];
		unitCellIndexArr[i] = i;

		if (colorCode == "atom") {
			var color = colorSetup[atomData.atom];
		}
		else {
			var color = lut.getColor( atomData[colorCode] );
		}
		if (sizeCode == "atom") {
			atomSize = options.atomSize*atomRadius[atomData.atom];
		}
		else {
			var tempSize = (atomData[sizeCode] - options.moleculeSizeSettingMin)/(options.moleculeSizeSettingMax - options.moleculeSizeSettingMin);
			atomSize = options.atomSize * tempSize;
		}

		unitCellOffsetArr[i * 3 + 0] = atomData.x;
		unitCellOffsetArr[i * 3 + 1] = atomData.y;
		unitCellOffsetArr[i * 3 + 2] = atomData.z;

		if (moleculeData[i].highlighted) {
			unitCellScaleArr[i] = atomSize * 2;
		} else {
			unitCellScaleArr[i] = atomSize;
		}
		
		var tempColor = new THREE.Color( color );
		unitCellColorArr[i * 3 + 0] = tempColor.r;
		unitCellColorArr[i * 3 + 1] = tempColor.g;
		unitCellColorArr[i * 3 + 2] = tempColor.b;

		if (moleculeData[i].selected || moleculeData[i].highlighted) {
			unitCellSelectionArr[i] = 1;
		} 
	}

	updatePeriodicReplicatesInstancesMolecule(geometry, unitCellScaleArr, unitCellOffsetArr, unitCellColorArr, unitCellSelectionArr,  unitCellIndexArr, systemDimension, latticeVectors, options);

}


function updateMoleculeGeometryBallAtomScale(view) {
	var atoms = view.molecule.atoms;
	var geometry = atoms.geometry;
	var options = view.options;
	var sizeCode = options.moleculeSizeCodeBasis;
	var currentFrame = options.currentFrame.toString();
	var moleculeData = view.systemMoleculeDataFramed[currentFrame];

	var unitCellScaleArr = new Float32Array(moleculeData.length);
	var t0 = performance.now();
	var atomSize;
	for (var i = 0; i < moleculeData.length; i++) {
		var atomData = moleculeData[i];
		if (sizeCode == "atom") {
			atomSize = options.atomSize*atomRadius[atomData.atom];
		}
		else {
			var tempSize = (atomData[sizeCode] - options.moleculeSizeSettingMin)/(options.moleculeSizeSettingMax - options.moleculeSizeSettingMin);
			atomSize = options.atomSize * tempSize;
		}

		if (moleculeData[i].highlighted) {
			unitCellScaleArr[i] = atomSize * 2;
		} else {
			unitCellScaleArr[i] = atomSize;
		}
		
	}

	updatePeriodicReplicatesInstancesMoleculeScale(geometry, unitCellScaleArr, options);

}





function updateClippingPlaneBallAtom(view) {
	var atoms = view.molecule.atoms;
	var atomsMaterialShader = atoms.material.userData.shader;
	var options = view.options;
	atomsMaterialShader.uniforms.xClippingPlaneMax.value = options.x_high;
	atomsMaterialShader.uniforms.xClippingPlaneMin.value = options.x_low;
	atomsMaterialShader.uniforms.yClippingPlaneMax.value = options.y_high;
	atomsMaterialShader.uniforms.yClippingPlaneMin.value = options.y_low;
	atomsMaterialShader.uniforms.zClippingPlaneMax.value = options.z_high;
	atomsMaterialShader.uniforms.zClippingPlaneMin.value = options.z_low;
}

function updateClippingPlaneSpriteAtom(view) {
	var atoms = view.molecule.atoms;
	var options = view.options;
	atoms.material.uniforms.xClippingPlaneMax.value = options.x_high;
	atoms.material.uniforms.xClippingPlaneMin.value = options.x_low;
	atoms.material.uniforms.yClippingPlaneMax.value = options.y_high;
	atoms.material.uniforms.yClippingPlaneMin.value = options.y_low;
	atoms.material.uniforms.zClippingPlaneMax.value = options.z_high;
	atoms.material.uniforms.zClippingPlaneMin.value = options.z_low;
}

export function updateMoleculeGeometrySlider(view){

	var options = view.options;

	var t0 = performance.now();
	if(options.showAtoms) {
		var systemDimension = view.systemDimension;
		var latticeVectors = view.systemLatticeVectors;

		
		
		if (options.atomsStyle == "sprite") {
			updateOffsetArray(systemDimension, latticeVectors, view.molecule.atoms.geometry, options);
			updateClippingPlaneSpriteAtom(view);
			

		} else if (options.atomsStyle == "ball") {
			updateClippingPlaneBallAtom(view);
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
	//  console.log('update molecule replicate took: ', performance.now() - t0);
}


export function updateMoleculeGeometry(view){

	var options = view.options;

	if (options.showMolecule){
		var t0 = performance.now();
		if(options.showAtoms) {
			var systemDimension = view.systemDimension;
			var latticeVectors = view.systemLatticeVectors;

			
			
			if (options.atomsStyle == "sprite") {
				updateMoleculeGeometrySpriteAtom(view);
				updateOffsetArray(systemDimension, latticeVectors, view.molecule.atoms.geometry, options);
				updateClippingPlaneSpriteAtom(view);
				

			} else if (options.atomsStyle == "ball") {
				updateMoleculeGeometryBallAtom(view)
				updateClippingPlaneBallAtom(view);
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
		// console.log('update molecule replicate took: ', performance.now() - t0);
	}
	
}




export function updateMoleculeGeometryScale(view){
	var options = view.options;

	var t0 = performance.now();
	if(options.showAtoms) {
		var systemDimension = view.systemDimension;
		var latticeVectors = view.systemLatticeVectors;

		
		
		if (options.atomsStyle == "sprite") {
			updateMoleculeGeometrySpriteAtom(view);
			updateOffsetArray(systemDimension, latticeVectors, view.molecule.atoms.geometry, options);
			updateClippingPlaneSpriteAtom(view);
			

		} else if (options.atomsStyle == "ball") {
			updateMoleculeGeometryBallAtomScale(view)
		}

	}

	// console.log('update molecule scale replicate took: ', performance.now() - t0);


}




export function changeMoleculeGeometry(view){

	removeMoleculeGeometry(view);
	if (view.options.showMolecule) {
		getMoleculeGeometry(view);
	}
}

export function removeMoleculeGeometry(view){

	if (view.molecule != null ){
		view.scene.remove(view.molecule.atoms);
		view.scene.remove(view.molecule.bonds);
		disposeMeshOrGroup(view.molecule.atoms)
		disposeMeshOrGroup(view.molecule.bonds)
		delete view.molecule;
	}
}
