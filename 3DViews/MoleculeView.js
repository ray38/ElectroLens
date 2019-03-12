import {colorSetup, atomRadius} from "./AtomSetup.js";
import {shaderMaterial2, shaderMaterial3} from "./PointCloudMaterials.js";
import {hexToRgb, colorToRgb} from "../Utilities/other.js";


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
					sizes[i] = options.atomSize*atomRadius[atomData.atom]*200;
				}
				else {
					var tempSize = (atomData[sizeCode] - sizeMin)/(sizeMax - sizeMin);
					sizes[i] = options.atomSize*tempSize*200;
				}

				alphas[i] = 1;
			}
			else{
				size[i] = 0;
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
		var material = new THREE.MeshBasicMaterial();
		var atoms = new THREE.Group();

		var basicAtom = new THREE.Mesh(atomGeometry, material);

		for (var i = 0; i < moleculeData.length; i++) {
			var atomData = moleculeData[i];

			if (moleculeData[i].selected) {
				if (colorCode == "atom") {
					var color = colorToRgb(colorSetup[atomData.atom]);
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
					var tempSize = (atomData[sizeCode] - sizeMin)/(sizeMax - sizeMin);
					atom.scale.set(options.atomSize*tempSize, options.atomSize*tempSize, options.atomSize*tempSize);
				}
				atom.position.set(atomData.xPlot*20.0, atomData.yPlot*20.0,atomData.zPlot*20.0);
				atoms.add(atom);
			}
			
		}

	}
	

	view.molecule.atoms = atoms;
	view.scene.add(atoms);
}

function addBonds_backup(view, moleculeData, neighborsData){
	var options = view.options;
	var bonds = new THREE.Group();

	/*var basicBondGeometry = new THREE.CylinderGeometry( options.bondSize*10, options.bondSize*10, 1, options.bondModelSegments, 0, true);
	var basicBond = new THREE.Mesh( basicBondGeometry, new THREE.MeshBasicMaterial( ) );*/

	/*var basicLineBondGeometry = new THREE.BufferGeometry();
	var positions = new Float32Array(6);
	var i = 0;
	positions[i++] = 0;
	positions[i++] = 0;
	positions[i++] = 0;
	positions[i++] = 0;
	positions[i++] = 0;
	positions[i] = 100;
	basicLineBondGeometry.addAttribute('position', new THREE.BufferAttribute( positions, 3 ));
	
	var basicLineBond = new THREE.LineSegments( basicLineBondGeometry, new THREE.LineBasicMaterial( ) );*/

	var basicLineBondGeometry = new THREE.BufferGeometry();
	var material = new THREE.LineBasicMaterial({color: 0xffffff, vertexColors: THREE.VertexColors });
	var vertices = [];
	var indices = [];
	var indicesColors = [];
	var index_counter = 0;

	/*for (var i = 0; i < moleculeData.length; i++) {
		if (moleculeData[i].selected) {
			var coordinates1 = new THREE.Vector3(moleculeData[i].x, moleculeData[i].y, moleculeData[i].z);
			var point1 = new THREE.Vector3(moleculeData[i].xPlot*20.0, moleculeData[i].yPlot*20.0,moleculeData[i].zPlot*20.0);

		    for (var j = 0; j < moleculeData.length; j++) {
		    	var coordinates2 = new THREE.Vector3(moleculeData[j].x, moleculeData[j].y, moleculeData[j].z);
		    	var point2 = new THREE.Vector3(moleculeData[j].xPlot*20.0, moleculeData[j].yPlot*20.0,moleculeData[j].zPlot*20.0);
			    var bondlength = new THREE.Vector3().subVectors( coordinates2, coordinates1 ).length();
			    if (bondlength < options.maxBondLength && bondlength > options.minBondLength &&  moleculeData[j].selected ) {
			    	addBond(view, point1, point2, bonds);
			    }
			}
		}
	}*/
	
	for (var i = 0; i < moleculeData.length; i++) {
		if (moleculeData[i].selected) {
			var tempNeighborObject = neighborsData[i];
			var neighborsList = tempNeighborObject.neighborsList;
			var distancesList = tempNeighborObject.distancesList;
			var coordinatesList = tempNeighborObject.coordinatesList;

			var color = colorSetup[moleculeData[i].atom];

			var point1 = new THREE.Vector3(moleculeData[i].xPlot*20.0, moleculeData[i].yPlot*20.0,moleculeData[i].zPlot*20.0);

		    for (var j = 0; j < neighborsList.length; j++) {
		    	//var point2 = new THREE.Vector3(neighborsList[j].xPlot*20.0, neighborsList[j].yPlot*20.0,neighborsList[j].zPlot*20.0);
		    	var point2 = coordinatesList[j];
			    if (distancesList[j] < options.maxBondLength && distancesList[j] > options.minBondLength &&  neighborsList[j].selected ) {
			    	/*var bond = basicBond.clone();
			    	bond.material = basicBond.material.clone();
			    	bond.material.color.set( color );
			    	addBond(view, point1, point2, bonds, bond);*/


			    	/*var bond = basicLineBond.clone();
			    	bond.geometry = basicLineBond.geometry.clone();
			    	bond.material = basicLineBond.material.clone();
			    	bond.material.color.set( color );
			    	addLineBond(view, point1, point2, bonds, bond);*/

			    	vertices.push(point1, point2);
			    	indices.push(index_counter, index_counter + 1);
			    	indicesColors.push(colorToRgb(color), colorToRgb(color));
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

	    colors[i * 3] = indicesColors[i].r;
	    colors[i * 3 + 1] = indicesColors[i].g;
	    colors[i * 3 + 2] = indicesColors[i].b;

	}
	basicLineBondGeometry.addAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
	basicLineBondGeometry.addAttribute('color', new THREE.Float32BufferAttribute(colors, 3));
	basicLineBondGeometry.setIndex(new THREE.BufferAttribute(new Uint16Array(indices), 1));

	var bonds = new THREE.LineSegments(basicLineBondGeometry, material);

	view.molecule.bonds = bonds;
	view.scene.add(bonds);

}


function addBonds(view, moleculeData, neighborsData){
	var options = view.options;
	

	if (options.bondsStyle == "tube"){
		var bonds = new THREE.Group();
		var basicBondGeometry = new THREE.CylinderGeometry( options.bondSize*10, options.bondSize*10, 1, options.bondModelSegments, 0, true);
		var basicBond = new THREE.Mesh( basicBondGeometry, new THREE.MeshBasicMaterial( ) );

		for (var i = 0; i < moleculeData.length; i++) {
			if (moleculeData[i].selected) {
				var tempNeighborObject = neighborsData[i];
				var neighborsList = tempNeighborObject.neighborsList;
				var distancesList = tempNeighborObject.distancesList;
				var coordinatesList = tempNeighborObject.coordinatesList;

				var color = colorSetup[moleculeData[i].atom];

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

				var color = colorSetup[moleculeData[i].atom];

				var point1 = new THREE.Vector3(moleculeData[i].xPlot*20.0, moleculeData[i].yPlot*20.0,moleculeData[i].zPlot*20.0);

			    for (var j = 0; j < neighborsList.length; j++) {
			    	//var point2 = new THREE.Vector3(neighborsList[j].xPlot*20.0, neighborsList[j].yPlot*20.0,neighborsList[j].zPlot*20.0);
			    	var point2 = coordinatesList[j];
				    if (distancesList[j] < options.maxBondLength && distancesList[j] > options.minBondLength &&  neighborsList[j].selected ) {

				    	vertices.push(point1, point2);
				    	indices.push(index_counter, index_counter + 1);
				    	verticesColors.push(colorToRgb(color), colorToRgb(color));
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

				var color = colorSetup[moleculeData[i].atom];

				var point1 = new THREE.Vector3(moleculeData[i].xPlot*20.0, moleculeData[i].yPlot*20.0,moleculeData[i].zPlot*20.0);

			    for (var j = 0; j < neighborsList.length; j++) {
			    	//var point2 = new THREE.Vector3(neighborsList[j].xPlot*20.0, neighborsList[j].yPlot*20.0,neighborsList[j].zPlot*20.0);
			    	var point2 = coordinatesList[j];
				    if (distancesList[j] < options.maxBondLength && distancesList[j] > options.minBondLength &&  neighborsList[j].selected ) {

				    	vertices.push(point1, point2);
				    	indices.push(index_counter, index_counter + 1);
				    	verticesColors.push(colorToRgb(color), colorToRgb(color));
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




function addAtom(view, atomGeometry, index, atomData, atomGroup, lut, moleculeObject){
	
	var options = view.options;
	var sizeCode = options.moleculeSizeCodeBasis;
	var colorCode = options.moleculeColorCodeBasis;
	var xPlotScale = view.xPlotScale;
	var yPlotScale = view.yPlotScale;
	var zPlotScale = view.zPlotScale;
/*
	if (sizeCode != "atom") {
		var sizeMax = options.moleculeSizeSettingMax;
		var sizeMin = options.moleculeSizeSettingMin;
	}
	
	//var atomGeometry = new THREE.SphereGeometry(100, options.atomModelSegments, options.atomModelSegments);

    //console.log(colorCode);
    if (colorCode == "atom") {
    	//console.log("atom color basis");
		var material = new THREE.MeshBasicMaterial( {color: colorSetup[atomData.atom]} );
	}
	else {
		//console.log("other color basis");
		var tempColor = lut.getColor( atomData[colorCode] );
		var material = new THREE.MeshBasicMaterial( {color: tempColor } );
	}
		
	
	var atom = new THREE.Mesh(atomGeometry, material);

	if (sizeCode == "atom") {
    	//console.log("atom color basis");
    	//console.log(atom);
		atom.scale.set(options.atomSize*atomRadius[atomData.atom], options.atomSize*atomRadius[atomData.atom], options.atomSize*atomRadius[atomData.atom]);
	}
	else {
		//console.log("other color basis");
		var tempSize = (atomData[sizeCode] - sizeMin)/(sizeMax - sizeMin);
		atom.scale.set(options.atomSize*tempSize, options.atomSize*tempSize, options.atomSize*tempSize);
	}
	//atom.position.set(xPlotScale(view.coordinates[i][1][0])*20.0, yPlotScale(view.coordinates[i][1][1])*20.0,zPlotScale(view.coordinates[i][1][2])*20.0);
	atom.position.set(atomData.xPlot*20.0, atomData.yPlot*20.0,atomData.zPlot*20.0);
	
	//atom.position.set(atomData.xPlot*20.0 + i*xStep, atomData.yPlot*20.0 + j*yStep, atomData.zPlot*20.0 + k*zStep);
	atom.dataIndex = index;
	view[moleculeObject].atoms.push(atom);
	atomGroup.add( atom );
	//scene.add(atom);*/
	


	var geometry = new THREE.BufferGeometry();
	var positions = new Float32Array(3);
	var colors = new Float32Array(3);
	var sizes = new Float32Array( 1);
	var alphas = new Float32Array( 1);


	positions[0] = atomData.xPlot*20.0;
	positions[1] = atomData.yPlot*20.0;
	positions[2] = atomData.zPlot*20.0;


	if (colorCode == "atom") {
    	//console.log("atom color basis");
		//var material = new THREE.MeshBasicMaterial( {color: colorSetup[atomData.atom]} );
		var color = colorToRgb(colorSetup[atomData.atom]);
	}
	else {
		//console.log("other color basis");
		var color = lut.getColor( atomData[colorCode] );
		//var material = new THREE.MeshBasicMaterial( {color: tempColor } );
	}
	

	colors[ 0 ] = color.r;
	colors[ 1 ] = color.g;
	colors[ 2 ] = color.b;
	//console.log(colors);

	if (sizeCode == "atom") {
		sizes[0] = options.atomSize*atomRadius[atomData.atom]*500;
		//atom.scale.set(options.atomSize*atomRadius[atomData.atom], options.atomSize*atomRadius[atomData.atom], options.atomSize*atomRadius[atomData.atom]);
	}
	else {
		var tempSize = (atomData[sizeCode] - sizeMin)/(sizeMax - sizeMin);
		sizes[0] = options.atomSize*tempSize*500;
		//atom.scale.set(options.atomSize*tempSize, options.atomSize*tempSize, options.atomSize*tempSize);
	}

	alphas[0] = 1;

	geometry.addAttribute( 'position', new THREE.BufferAttribute( positions, 3 ) );
	geometry.addAttribute( 'customColor', new THREE.BufferAttribute( colors, 3 ) );
	geometry.addAttribute( 'size', new THREE.BufferAttribute( sizes, 1 ) );
	geometry.addAttribute( 'alpha', new THREE.BufferAttribute( alphas, 1 ) );

	var atom = new THREE.Points( geometry, shaderMaterial2 );

	//console.log(atom);
	atom.dataIndex = index;
	view[moleculeObject].atoms.push(atom);
	atomGroup.add( atom );
	//scene.add(atom);

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

    // cylinder: radiusAtTop, radiusAtBottom, 
    //  height, radiusSegments, heightSegments 
    //var bondGeometry = new THREE.CylinderGeometry( options.bondSize*10, options.bondSize*10, direction.length(), options.bondModelSegments, 1, true);
    //bondGeometry.translate( point1 );

    //var bond = new THREE.Mesh( bondGeometry, new THREE.MeshBasicMaterial( { color: 0xffffff } ) );

    bond.applyMatrix(orientation);
    bond.position.x = (point2.x + point1.x) / 2;
    bond.position.y = (point2.y + point1.y) / 2;
    bond.position.z = (point2.z + point1.z) / 2;
    bond.scale.set(1, direction.length(), 1);
    //view[moleculeObject].bonds.push(bond);
    bondGroup.add(bond);
    //scene.add(bond);*/


/*

	var geometry = new THREE.LineGeometry();
	var positions = [];
	//var colors = [0, 0, 0, 0, 0, 0];
	var colors = [1,1,1,1,1,1];
	positions.push(point1.x, point1.y, point1.z);
	positions.push(point2.x, point2.y, point2.z);
	geometry.setPositions( positions );
	geometry.setColors( colors );

	var bondMat = new THREE.LineMaterial( {

		color: 0xffffff,
		linewidth: 5, // in pixels
		vertexColors: THREE.VertexColors,
		//resolution:  // to be set by renderer, eventually
		dashed: false

	} );

	bondMat.resolution.set( view.windowWidth, view.windowHeight );

	var bond = new THREE.Line2( geometry, bondMat );
	bond.computeLineDistances();
	bond.scale.set( 1, 1, 1 );
	view[moleculeObject].bonds.push(bond);
	bondGroup.add(bond);
	//view.scene.add( line );*/


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
	
	/*for (var i = 0; i < view.molecule.bonds.length; i++) {
		view.scene.remove(view.molecule.bonds[i]);
	}

	for (var i = 0; i < view.molecule.atoms.length; i++) {
		var colorSetup = {"C":0x777777, "O":0xFF0000, "N":0x0000FF, "H":0xCCCCCC}
		var atomRadius = {
							"C":0.77,
							"O":0.73,
							"N":0.75,
							"H":0.37
						}
	}*/
	removeMoleculeGeometry(view);
	getMoleculeGeometry(view);

}


export function changeMoleculeGeometry(view){

	removeMoleculeGeometry(view);
	getMoleculeGeometry(view);

}

export function removeMoleculeGeometry(view){
	//console.log("delete molecule");
	//console.log(view.molecule);
	/*if (view.molecule != null ){
		//console.log("delete molecule");
		for (var i = 0; i < view.molecule.bonds.length; i++) {
			view.scene.remove(view.molecule.bonds[i]);
		}

		for (var i = 0; i < view.molecule.atoms.length; i++) {
			view.scene.remove(view.molecule.atoms[i]);
		}

		delete view.Molecule;
	}*/
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
	//console.log("delete molecule replicate");
	//console.log(view.periodicReplicateMolecule);
	/*if (view.periodicReplicateMolecule != null ) {
		//console.log(" start delete molecule replicate");
		for (var i = 0; i < view.periodicReplicateMolecule.bonds.length; i++) {
			view.scene.remove(view.periodicReplicateMolecule.bonds[i]);
		}

		for (var i = 0; i < view.periodicReplicateMolecule.atoms.length; i++) {
			view.scene.remove(view.periodicReplicateMolecule.atoms[i]);
		}

		delete view.periodicReplicateMolecule;
	}*/
	/*view.scene.remove(view.periodicReplicateAtomGroup);
	view.scene.remove(view.periodicReplicateBondGroup);
	delete view.periodicReplicateAtomGroup;
	delete view.periodicReplicateBondGroup;
	delete view.periodicReplicateMolecule;*/
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