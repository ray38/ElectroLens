import {colorSetup, atomRadius} from "./AtomSetup.js";
import {shaderMaterial2, shaderMaterial3} from "./PointCloudMaterials.js";
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
			positions[i3+0] = atomData.xPlot*20.0;
			positions[i3+1] = atomData.yPlot*20.0;
			positions[i3+2] = atomData.zPlot*20.0;

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
					sizes[i] = options.atomSize*atomRadius[atomData.atom]*400;
				}
				else {
					var tempSize = (atomData[sizeCode] - options.moleculeSizeSettingMin)/(options.moleculeSizeSettingMax - options.moleculeSizeSettingMin);
					sizes[i] = options.atomSize*tempSize*400;
				}

				alphas[i] = options.moleculeAlpha;
			}
			else{
				sizes[i] = 0;
				alphas[i] = 0;
			}

			i3 +=3;
		}

		geometry.addAttribute( 'position', new THREE.BufferAttribute( positions, 3 ) );
		geometry.addAttribute( 'customColor', new THREE.BufferAttribute( colors, 3 ) );
		geometry.addAttribute( 'size', new THREE.BufferAttribute( sizes, 1 ) );
		geometry.addAttribute( 'alpha', new THREE.BufferAttribute( alphas, 1 ) );

		var atoms = new THREE.Points( geometry, shaderMaterial2 );
		atoms.frustumCulled = false;

	}

	if (options.atomsStyle == "ball"){
		var atomGeometry = new THREE.SphereGeometry(100, options.atomModelSegments, options.atomModelSegments);
		/*var material = new THREE.MeshLambertMaterial({ transparent: true, opacity: options.moleculeAlpha});*/
		var material = new THREE.MeshPhongMaterial({ transparent: true, opacity: options.moleculeAlpha});
		
		var atoms = new THREE.Group();

		var basicAtom = new THREE.Mesh(atomGeometry, material);
		//basicAtom.castShadow = true; //default is false
		//basicAtom.receiveShadow = false; //default

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
				var atom = basicAtom.clone();
				atom.material = basicAtom.material.clone();
				atom.material.color.set( color );
				if (sizeCode == "atom") {
					atom.scale.set(options.atomSize*atomRadius[atomData.atom], options.atomSize*atomRadius[atomData.atom], options.atomSize*atomRadius[atomData.atom]);
				}
				else {
					var tempSize = (atomData[sizeCode] - options.moleculeSizeSettingMin)/(options.moleculeSizeSettingMax - options.moleculeSizeSettingMin);
					atom.scale.set(options.atomSize*tempSize, options.atomSize*tempSize, options.atomSize*tempSize);
				}
				atom.position.set(atomData.xPlot*20.0, atomData.yPlot*20.0,atomData.zPlot*20.0);
				atom.castShadow = true; //default is false
				atom.receiveShadow = true; //default
				atoms.add(atom);
			}
			
		}

	}
	

	view.molecule.atoms = atoms;
	view.scene.add(atoms);
}



function addBonds(view, moleculeData, neighborsData){
	var options = view.options;
	var colorCode = options.moleculeColorCodeBasis;
	var lut = view.moleculeLut;

	if (options.bondsStyle == "tube"){
		var bonds = new THREE.Group();
		var basicBondGeometry = new THREE.CylinderGeometry( options.bondSize*10, options.bondSize*10, 1, options.bondModelSegments, 0, true);
		var basicBond = new THREE.Mesh( basicBondGeometry, new THREE.MeshBasicMaterial( { transparent: true, opacity: options.moleculeAlpha} ) );

		for (var i = 0; i < moleculeData.length; i++) {
			if (moleculeData[i].selected) {
				var tempNeighborObject = neighborsData[i];
				var neighborsList = tempNeighborObject.neighborsList;
				var distancesList = tempNeighborObject.distancesList;
				var coordinatesList = tempNeighborObject.coordinatesList;

				//if (colorCode == "atom") {var color = colorToRgb(colorSetup[moleculeData[i].atom]);	}
				//else {var color = lut.getColor( moleculeData[i][colorCode] );}
				if (colorCode == "atom") {
					var color = colorSetup[moleculeData[i].atom];
				}
				else {
					var color = lut.getColor( moleculeData[i][colorCode] );
				}
				//var color = colorSetup[moleculeData[i].atom];

				var point1 = new THREE.Vector3(moleculeData[i].xPlot*20.0, moleculeData[i].yPlot*20.0,moleculeData[i].zPlot*20.0);

			    for (var j = 0; j < neighborsList.length; j++) {
			    	//var point2 = new THREE.Vector3(neighborsList[j].xPlot*20.0, neighborsList[j].yPlot*20.0,neighborsList[j].zPlot*20.0);
			    	var point2 = coordinatesList[j];
				    if (distancesList[j] < options.maxBondLength && distancesList[j] > options.minBondLength &&  neighborsList[j].selected ) {
				    	var bond = basicBond.clone();
				    	bond.material = basicBond.material.clone();
				    	bond.material.color.set( color );
				    	addBond(view, point1, point2, bonds, bond);
				    	
				    }
				}
			}
		}
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

				var point1 = new THREE.Vector3(moleculeData[i].xPlot*20.0, moleculeData[i].yPlot*20.0,moleculeData[i].zPlot*20.0);

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
		basicLineBondGeometry.addAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
		basicLineBondGeometry.addAttribute('color', new THREE.Float32BufferAttribute(colors, 3));
		basicLineBondGeometry.setIndex(new THREE.BufferAttribute(new Uint16Array(indices), 1));

		var bonds = new THREE.LineSegments(basicLineBondGeometry, material);
	}

	if (options.bondsStyle == "fatline"){
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

				var point1 = new THREE.Vector3(moleculeData[i].xPlot*20.0, moleculeData[i].yPlot*20.0,moleculeData[i].zPlot*20.0);

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
		basicLineBondGeometry.addAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
		basicLineBondGeometry.addAttribute('color', new THREE.Float32BufferAttribute(colors, 3));
		basicLineBondGeometry.setIndex(new THREE.BufferAttribute(new Uint16Array(indices), 1));

		var bonds = new THREE.LineSegments2(basicLineBondGeometry, material);

	}



	view.molecule.bonds = bonds;
	view.scene.add(bonds);

}


function addBond(view, point1, point2, bondGroup, bond){
	var options = view.options;

	var direction = new THREE.Vector3().subVectors( point2, point1 );
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


    bond.applyMatrix(orientation);
    bond.position.x = (point2.x + point1.x) / 2;
    bond.position.y = (point2.y + point1.y) / 2;
    bond.position.z = (point2.z + point1.z) / 2;
    bond.scale.set(1, direction.length(), 1);
    //view[moleculeObject].bonds.push(bond);
    bondGroup.add(bond);
    //scene.add(bond);*/



}

export function getMoleculeGeometry(view){

	view.molecule = {};
	//view.molecule.atoms = [];
	//view.molecule.bonds = [];
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



	view.periodicReplicateMolecule = {};

	var options = view.options;
	var currentFrame = options.currentFrame.toString();
	var scene = view.scene;
	var moleculeData = view.systemMoleculeDataFramed[currentFrame];

	var atoms = view.molecule.atoms;
	var bonds = view.molecule.bonds;


	var sizeCode = options.moleculeSizeCodeBasis;
	var colorCode = options.moleculeColorCodeBasis;

	if (colorCode != "atom") {
		var lut = view.moleculeLut;
		//var lut = view.lut;
	}
	
	if (sizeCode != "atom") {
		var sizeMax = options.moleculeSizeSettingMax;
		var sizeMin = options.moleculeSizeSettingMin;
	}

	var xPlotScale = view.xPlotScale;
	var yPlotScale = view.yPlotScale;
	var zPlotScale = view.zPlotScale;

	var xStep = 20.0*(view.xPlotMax - view.xPlotMin);
	var yStep = 20.0*(view.yPlotMax - view.yPlotMin);
	var zStep = 20.0*(view.zPlotMax - view.zPlotMin);


	var x_start = -1 * ((options.xPBC-1)/2);
	var x_end = ((options.xPBC-1)/2) + 1;
	var y_start = -1 * ((options.yPBC-1)/2);
	var y_end = ((options.yPBC-1)/2) + 1;
	var z_start = -1 * ((options.zPBC-1)/2);
	var z_end = ((options.zPBC-1)/2) + 1;

	var periodicReplicateAtomGroup = new THREE.Group();
	var periodicReplicateBondGroup = new THREE.Group();

	//var atomGeometry = new THREE.SphereGeometry(100, options.atomModelSegments, options.atomModelSegments);
	//var bondGeometry = new THREE.CylinderGeometry( options.bondSize*10, options.bondSize*10, direction.length(), options.bondModelSegments, 1, true);

	
	if (options.showAtoms){
		for ( var i = x_start; i < x_end; i ++) {
			for ( var j = y_start; j < y_end; j ++) {
				for ( var k = z_start; k < z_end; k ++) {
					if (((i == 0) && (j == 0) && (k == 0)) == false) {

						var tempAtomsReplica = atoms.clone();
						tempAtomsReplica.position.set(i*xStep, j*yStep, k*zStep); 
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
						
						var tempBondsReplica = bonds.clone();
						tempBondsReplica.position.set(i*xStep, j*yStep, k*zStep); 
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