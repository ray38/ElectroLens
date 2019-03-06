import {colorSetup, atomRadius} from "./atomSetup.js";



function addAtom(view, index, atomData, atomGroup, lut, moleculeObject){
	var options = view.options;
	var sizeCode = options.moleculeSizeCodeBasis;
	var colorCode = options.moleculeColorCodeBasis;
	var xPlotScale = view.xPlotScale;
	var yPlotScale = view.yPlotScale;
	var zPlotScale = view.zPlotScale;

	var geometry = new THREE.SphereGeometry(100, options.atomModelSegments, options.atomModelSegments);

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
		
	
	var atom = new THREE.Mesh(geometry, material);

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
	//scene.add(atom);

}

function addAtomPeriodicReplicate(view, i, j, k, xStep, yStep, zStep, atomData, atomGroup, lut, moleculeObject){
	var options = view.options;
	var sizeCode = options.moleculeSizeCodeBasis;
	var colorCode = options.moleculeColorCodeBasis;
	var xPlotScale = view.xPlotScale;
	var yPlotScale = view.yPlotScale;
	var zPlotScale = view.zPlotScale;

	var geometry = new THREE.SphereGeometry(100, options.atomModelSegments, options.atomModelSegments);

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
		
	
	var atom = new THREE.Mesh(geometry, material);

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
	atom.position.set(atomData.xPlot*20.0 + i*xStep, atomData.yPlot*20.0 + j*yStep, atomData.zPlot*20.0 + k*zStep);
	
	atom.dataIndex = i;
	view[moleculeObject].atoms.push(atom);
	atomGroup.add( atom );
	//scene.add(atom);

}


function addBond(view, point1, point2, bondGroup, moleculeObject){
	var options = view.options;

	var direction = new THREE.Vector3().subVectors( point2, point1 );
	var orientation = new THREE.Matrix4();
    /* THREE.Object3D().up (=Y) default orientation for all objects */
    orientation.lookAt(point1, point2, new THREE.Object3D().up);
    /* rotation around axis X by -90 degrees 
     * matches the default orientation Y 
     * with the orientation of looking Z */
    orientation.multiply(new THREE.Matrix4().set(1,0,0,0,
                                            0,0,1,0, 
                                            0,-1,0,0,
                                            0,0,0,1));

    /* cylinder: radiusAtTop, radiusAtBottom, 
        height, radiusSegments, heightSegments */
    var bondGeometry = new THREE.CylinderGeometry( options.bondSize*10, options.bondSize*10, direction.length(), options.bondModelSegments, 1, true);
    //bondGeometry.translate( point1 );

    var bond = new THREE.Mesh( bondGeometry, 
            new THREE.MeshBasicMaterial( { color: 0xffffff } ) );

    bond.applyMatrix(orientation)
    bond.position.x = (point2.x + point1.x) / 2;
    bond.position.y = (point2.y + point1.y) / 2;
    bond.position.z = (point2.z + point1.z) / 2;
    view[moleculeObject].bonds.push(bond);
    bondGroup.add(bond);
    //scene.add(bond);
}

export function getMoleculeGeometry(view){

	view.molecule = {};
	view.molecule.atoms = [];
	view.molecule.bonds = [];
	var options = view.options;
	var scene = view.scene;
	var moleculeData = view.systemMoleculeData;

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
	
	if (sizeCode != "atom") {
		var sizeMax = options.moleculeSizeSettingMax;
		var sizeMin = options.moleculeSizeSettingMin;
	}


	//var xPlotScale = view.xPlotScale;
	//var yPlotScale = view.yPlotScale;
	//var zPlotScale = view.zPlotScale;

	var atomGroup = new THREE.Group();
	var bondGroup = new THREE.Group();
	

	if (view.frameBool){
		for (var i = 0; i < moleculeData.length; i++) {
			if (moleculeData[i].selected && moleculeData[i][view.frameProperty]== options.currentFrame) {
				addAtom(view, i, moleculeData[i], atomGroup, lut, "molecule");
			}
		}
		for (var i = 0; i < moleculeData.length; i++) {
			if (moleculeData[i].selected && moleculeData[i][view.frameProperty] == options.currentFrame) {
				var coordinates1 = new THREE.Vector3(moleculeData[i].x, moleculeData[i].y, moleculeData[i].z);
				var point1 = new THREE.Vector3(moleculeData[i].xPlot*20.0, moleculeData[i].yPlot*20.0,moleculeData[i].zPlot*20.0);

			    for (var j = 0; j < moleculeData.length; j++) {
			    	var coordinates2 = new THREE.Vector3(moleculeData[j].x, moleculeData[j].y, moleculeData[j].z);
			    	var point2 = new THREE.Vector3(moleculeData[j].xPlot*20.0, moleculeData[j].yPlot*20.0,moleculeData[j].zPlot*20.0);
				    var bondlength = new THREE.Vector3().subVectors( coordinates2, coordinates1 ).length();
				    if (bondlength < options.maxBondLength && bondlength > options.minBondLength &&  moleculeData[j].selected && moleculeData[j][view.frameProperty] == options.currentFrame) {
				    	addBond(view, point1, point2, bondGroup, "molecule");
				    }
				}
			}
		}
	}
	else{
		for (var i = 0; i < moleculeData.length; i++) {
			if (moleculeData[i].selected) {
				addAtom(view, i, moleculeData[i], atomGroup, lut, "molecule");
			}
		}
		for (var i = 0; i < moleculeData.length; i++) {
			if (moleculeData[i].selected) {
				var coordinates1 = new THREE.Vector3(moleculeData[i].x, moleculeData[i].y, moleculeData[i].z);
				var point1 = new THREE.Vector3(moleculeData[i].xPlot*20.0, moleculeData[i].yPlot*20.0,moleculeData[i].zPlot*20.0);

			    for (var j = 0; j < moleculeData.length; j++) {
			    	var coordinates2 = new THREE.Vector3(moleculeData[j].x, moleculeData[j].y, moleculeData[j].z);
			    	var point2 = new THREE.Vector3(moleculeData[j].xPlot*20.0, moleculeData[j].yPlot*20.0,moleculeData[j].zPlot*20.0);
				    var bondlength = new THREE.Vector3().subVectors( coordinates2, coordinates1 ).length();
				    if (bondlength < options.maxBondLength && bondlength > options.minBondLength &&  moleculeData[j].selected ) {
				    	addBond(view, point1, point2, bondGroup, "molecule");
				    }
				}
			}
		}
	}

	scene.add(atomGroup);
	scene.add(bondGroup);
	view.atomGroup = atomGroup;
	view.bondGroup = bondGroup;
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
	view.scene.remove(view.atomGroup);
	view.scene.remove(view.bondGroup);
	delete view.atomGroup;
	delete view.bondGroup;
	delete view.molecule;
}



export function addMoleculePeriodicReplicates(view){



	view.periodicReplicateMolecule = {};
	view.periodicReplicateMolecule.atoms = [];
	view.periodicReplicateMolecule.bonds = [];

	var options = view.options;
	var scene = view.scene;
	var moleculeData = view.systemMoleculeData;

	var sizeCode = options.moleculeSizeCodeBasis;
	var colorCode = options.moleculeColorCodeBasis;

	if (colorCode != "atom") {
		/*var colorMap = options.colorMap;
		var numberOfColors = 512;

		var lut = new THREE.Lut( colorMap, numberOfColors );
		lut.setMax( options.moleculeColorSettingMax );
		lut.setMin( options.moleculeColorSettingMin );
		view.moleculeLut = lut;*/
		var lut = view.moleculeLut;
	}
	
	if (sizeCode != "atom") {
		var sizeMax = options.moleculeSizeSettingMax;
		var sizeMin = options.moleculeSizeSettingMin;
	}

	var xPlotScale = view.xPlotScale;
	var yPlotScale = view.yPlotScale;
	var zPlotScale = view.zPlotScale;

	var xStep = 10.0*(view.xPlotMax - view.xPlotMin);
	var yStep = 10.0*(view.yPlotMax - view.yPlotMin);
	var zStep = 10.0*(view.zPlotMax - view.zPlotMin);


	var x_start = -1 * ((options.xPBC-1)/2);
	var x_end = ((options.xPBC-1)/2) + 1;
	var y_start = -1 * ((options.yPBC-1)/2);
	var y_end = ((options.yPBC-1)/2) + 1;
	var z_start = -1 * ((options.zPBC-1)/2);
	var z_end = ((options.zPBC-1)/2) + 1;

	var periodicReplicateAtomGroup = new THREE.Group();
	var periodicReplicateBondGroup = new THREE.Group();

	if (view.frameBool){
		for ( var i = x_start; i < x_end; i ++) {
			for ( var j = y_start; j < y_end; j ++) {
				for ( var k = z_start; k < z_end; k ++) {
					if (((i == 0) && (j == 0) && (k == 0)) == false) {
						for (var ii = 0; ii < moleculeData.length; ii++) {
							
							if (moleculeData[ii].selected && moleculeData[ii][view.frameProperty]== options.currentFrame) {

								addAtomPeriodicReplicate(view, i, j, k, xStep, yStep, zStep, moleculeData[ii], periodicReplicateAtomGroup, lut, "periodicReplicateMolecule");
							    /*
							    var geometry = new THREE.SphereGeometry(100, options.atomModelSegments, options.atomModelSegments);
									
								if (colorCode == "atom") {
									var material = new THREE.MeshBasicMaterial( {color: colorSetup[moleculeData[ii].atom]} );
								}
								else {
									var tempColor = lut.getColor( moleculeData[ii][colorCode] );
									var material = new THREE.MeshBasicMaterial( {color: tempColor } );
								}
								var atom = new THREE.Mesh(geometry, material);
								//atom.scale.set(options.atomSize*atomRadius[view.coordinates[ii][0]], options.atomSize*atomRadius[view.coordinates[ii][0]], options.atomSize*atomRadius[view.coordinates[ii][0]])
								//atom.position.set(xPlotScale(view.coordinates[ii][1][0])*20.0 + i*xStep, yPlotScale(view.coordinates[ii][1][1])*20.0 + j*yStep,zPlotScale(view.coordinates[ii][1][2])*20.0 + k*zStep);
								
								if (sizeCode == "atom") {
							    	//console.log("atom color basis");
									atom.scale.set(options.atomSize*atomRadius[moleculeData[ii].atom], options.atomSize*atomRadius[moleculeData[ii].atom], options.atomSize*atomRadius[moleculeData[ii].atom]);
								}
								else {
									//console.log("other color basis");
									var tempSize = (moleculeData[ii][sizeCode] - sizeMin)/(sizeMax - sizeMin);
									atom.scale.set(options.atomSize*tempSize, options.atomSize*tempSize, options.atomSize*tempSize);
								}
								//atom.scale.set(options.atomSize*atomRadius[moleculeData[ii].atom], options.atomSize*atomRadius[moleculeData[ii].atom], options.atomSize*atomRadius[moleculeData[ii].atom])
								atom.position.set(moleculeData[ii].xPlot*20.0 + i*xStep, moleculeData[ii].yPlot*20.0 + j*yStep, moleculeData[ii].zPlot*20.0 + k*zStep);

								view.periodicReplicateMolecule.atoms.push(atom);
								//scene.add(atom);
								periodicReplicateAtomGroup.add(atom);*/
							}
						}
					}
				}
			}
		}


		for ( var i = x_start; i < x_end; i ++) {
			for ( var j = y_start; j < y_end; j ++) {
				for ( var k = z_start; k < z_end; k ++) {
					if (((i == 0) && (j == 0) && (k == 0)) == false) {
						for (var ii = 0; ii < moleculeData.length; ii++) {
							if (moleculeData[ii].selected && moleculeData[ii][view.frameProperty]== options.currentFrame){
								var coordinates1 = new THREE.Vector3(moleculeData[ii].x, moleculeData[ii].y, moleculeData[ii].z);
								var point1 = new THREE.Vector3(moleculeData[ii].xPlot*20.0 + i*xStep, moleculeData[ii].yPlot*20.0 + j*yStep, moleculeData[ii].zPlot*20.0 + k*zStep);

							    for (var jj = 0; jj < moleculeData.length; jj++) {
							    	var coordinates2 = new THREE.Vector3(moleculeData[jj].x, moleculeData[jj].y, moleculeData[jj].z);
							    	var point2 = new THREE.Vector3(moleculeData[jj].xPlot*20.0 + i*xStep, moleculeData[jj].yPlot*20.0 + j*yStep, moleculeData[jj].zPlot*20.0 + k*zStep);

								    var bondlength = new THREE.Vector3().subVectors( coordinates2, coordinates1 ).length();
								    //console.log(direction.length());
								    if (bondlength < options.maxBondLength && bondlength > options.minBondLength &&  moleculeData[jj].selected && moleculeData[jj][view.frameProperty]== options.currentFrame) {
								    	addBond(view, point1, point2, periodicReplicateBondGroup, "periodicReplicateMolecule");


								    	/*var direction = new THREE.Vector3().subVectors( point2, point1 );
								    	var orientation = new THREE.Matrix4();
									    // THREE.Object3D().up (=Y) default orientation for all objects 
									    orientation.lookAt(point1, point2, new THREE.Object3D().up);
									    orientation.multiply(new THREE.Matrix4().set(1,0,0,0,
									                                            0,0,1,0, 
									                                            0,-1,0,0,
									                                            0,0,0,1));

									    var bondGeometry = new THREE.CylinderGeometry( options.bondSize*10, options.bondSize*10, direction.length(), options.bondModelSegments, 1, true);

									    var bond = new THREE.Mesh( bondGeometry, 
									            new THREE.MeshBasicMaterial( { color: 0xffffff } ) );

									    bond.applyMatrix(orientation)
							            bond.position.x = (point2.x + point1.x) / 2;
									    bond.position.y = (point2.y + point1.y) / 2;
									    bond.position.z = (point2.z + point1.z) / 2;
									    view.periodicReplicateMolecule.bonds.push(bond);
									    //scene.add(bond);

									    periodicReplicateBondGroup.add(bond);*/
								    }
							    }
							}
						}
					}
				}
			}
		}
	}
	else{

		for ( var i = x_start; i < x_end; i ++) {
			for ( var j = y_start; j < y_end; j ++) {
				for ( var k = z_start; k < z_end; k ++) {
					if (((i == 0) && (j == 0) && (k == 0)) == false) {
						for (var ii = 0; ii < moleculeData.length; ii++) {
							
							if (moleculeData[ii].selected) {
								addAtomPeriodicReplicate(view, i, j, k, xStep, yStep, zStep, moleculeData[ii], periodicReplicateAtomGroup, lut, "periodicReplicateMolecule");
								/*
							    var geometry = new THREE.SphereGeometry(100, options.atomModelSegments, options.atomModelSegments);
									
								if (colorCode == "atom") {
									var material = new THREE.MeshBasicMaterial( {color: colorSetup[moleculeData[ii].atom]} );
								}
								else {
									var tempColor = lut.getColor( moleculeData[ii][colorCode] );
									var material = new THREE.MeshBasicMaterial( {color: tempColor } );
								}
								var atom = new THREE.Mesh(geometry, material);
								//atom.scale.set(options.atomSize*atomRadius[view.coordinates[ii][0]], options.atomSize*atomRadius[view.coordinates[ii][0]], options.atomSize*atomRadius[view.coordinates[ii][0]])
								//atom.position.set(xPlotScale(view.coordinates[ii][1][0])*20.0 + i*xStep, yPlotScale(view.coordinates[ii][1][1])*20.0 + j*yStep,zPlotScale(view.coordinates[ii][1][2])*20.0 + k*zStep);
								
								if (sizeCode == "atom") {
							    	//console.log("atom color basis");
									atom.scale.set(options.atomSize*atomRadius[moleculeData[ii].atom], options.atomSize*atomRadius[moleculeData[ii].atom], options.atomSize*atomRadius[moleculeData[ii].atom]);
								}
								else {
									//console.log("other color basis");
									var tempSize = (moleculeData[ii][sizeCode] - sizeMin)/(sizeMax - sizeMin);
									atom.scale.set(options.atomSize*tempSize, options.atomSize*tempSize, options.atomSize*tempSize);
								}
								//atom.scale.set(options.atomSize*atomRadius[moleculeData[ii].atom], options.atomSize*atomRadius[moleculeData[ii].atom], options.atomSize*atomRadius[moleculeData[ii].atom])
								atom.position.set(moleculeData[ii].xPlot*20.0 + i*xStep, moleculeData[ii].yPlot*20.0 + j*yStep, moleculeData[ii].zPlot*20.0 + k*zStep);

								view.periodicReplicateMolecule.atoms.push(atom);
								//scene.add(atom);
								periodicReplicateAtomGroup.add(atom);
								*/
							}
						}
					}
				}
			}
		}


		for ( var i = x_start; i < x_end; i ++) {
			for ( var j = y_start; j < y_end; j ++) {
				for ( var k = z_start; k < z_end; k ++) {
					if (((i == 0) && (j == 0) && (k == 0)) == false) {
						for (var ii = 0; ii < moleculeData.length; ii++) {
							if (moleculeData[ii].selected){
								var coordinates1 = new THREE.Vector3(moleculeData[ii].x, moleculeData[ii].y, moleculeData[ii].z);
								var point1 = new THREE.Vector3(moleculeData[ii].xPlot*20.0 + i*xStep, moleculeData[ii].yPlot*20.0 + j*yStep, moleculeData[ii].zPlot*20.0 + k*zStep);

							    for (var jj = 0; jj < moleculeData.length; jj++) {
							    	var coordinates2 = new THREE.Vector3(moleculeData[jj].x, moleculeData[jj].y, moleculeData[jj].z);
							    	var point2 = new THREE.Vector3(moleculeData[jj].xPlot*20.0 + i*xStep, moleculeData[jj].yPlot*20.0 + j*yStep, moleculeData[jj].zPlot*20.0 + k*zStep);

								    var bondlength = new THREE.Vector3().subVectors( coordinates2, coordinates1 ).length();
								    //console.log(direction.length());
								    if (bondlength < options.maxBondLength && bondlength > options.minBondLength &&  moleculeData[jj].selected) {
								    	addBond(view, point1, point2, periodicReplicateBondGroup, "periodicReplicateMolecule");
								    	/*var direction = new THREE.Vector3().subVectors( point2, point1 );
								    	var orientation = new THREE.Matrix4();
									    // THREE.Object3D().up (=Y) default orientation for all objects 
									    orientation.lookAt(point1, point2, new THREE.Object3D().up);
									    orientation.multiply(new THREE.Matrix4().set(1,0,0,0,
									                                            0,0,1,0, 
									                                            0,-1,0,0,
									                                            0,0,0,1));

									    var bondGeometry = new THREE.CylinderGeometry( options.bondSize*10, options.bondSize*10, direction.length(), options.bondModelSegments, 1, true);

									    var bond = new THREE.Mesh( bondGeometry, 
									            new THREE.MeshBasicMaterial( { color: 0xffffff } ) );

									    bond.applyMatrix(orientation)
							            bond.position.x = (point2.x + point1.x) / 2;
									    bond.position.y = (point2.y + point1.y) / 2;
									    bond.position.z = (point2.z + point1.z) / 2;
									    view.periodicReplicateMolecule.bonds.push(bond);
									    //scene.add(bond);
									    periodicReplicateBondGroup.add(bond);*/
								    }
							    }
							}
						}
					}
				}
			}
		}
	}
	view.periodicReplicateAtomGroup = periodicReplicateAtomGroup;
	view.periodicReplicateBondGroup = periodicReplicateBondGroup;
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
	view.scene.remove(view.periodicReplicateAtomGroup);
	view.scene.remove(view.periodicReplicateBondGroup);
	delete view.periodicReplicateAtomGroup;
	delete view.periodicReplicateBondGroup;
	delete view.periodicReplicateMolecule;
}

export function changeMoleculePeriodicReplicates(view){
	removeMoleculePeriodicReplicates(view);
	addMoleculePeriodicReplicates(view);
}