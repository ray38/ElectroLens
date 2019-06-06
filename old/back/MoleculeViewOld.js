export function getMoleculeGeometry(view){

	view.molecule = {};
	view.molecule.atoms = [];
	view.molecule.bonds = [];

	var colorSetup = {"C":0x777777, "O":0xFF0000, "N":0x0000FF, "H":0xCCCCCC}
	var atomRadius = {
						"C":0.77,
						"O":0.73,
						"N":0.75,
						"H":0.37
					}
	var options = view.options;
	var scene = view.scene;

	var xPlotScale = view.xPlotScale;
	var yPlotScale = view.yPlotScale;
	var zPlotScale = view.zPlotScale;

	for (var i = 0; i < view.coordinates.length; i++) {
	    //console.log(view.coordinates[i]);
	    //console.log(view.coordinates[i][1][0] , view.coordinates[i][1][1] ,view.coordinates[i][1][2]);
	    //console.log((view.coordinates[i][1][0]*10 + 0.5)*20, (view.coordinates[i][1][1]*10 + 0.5)*20,(view.coordinates[i][1][2]*10 + 0.5)*20);
	    //Do something
	    var geometry = new THREE.SphereGeometry(100, 24, 24);
	    //options.atomSize*atomRadius[view.coordinates[i][0]]*
		//geometry.translate( (view.coordinates[i][1][0]*10 + 0.5)*20, (view.coordinates[i][1][1]*10 + 0.5)*20,(view.coordinates[i][1][2]*10 + 0.5)*20);
			
		var material = new THREE.MeshBasicMaterial( {color: colorSetup[view.coordinates[i][0]]} );
		var atom = new THREE.Mesh(geometry, material);
		atom.scale.set(options.atomSize*atomRadius[view.coordinates[i][0]], options.atomSize*atomRadius[view.coordinates[i][0]], options.atomSize*atomRadius[view.coordinates[i][0]])
		//atom.position.set((view.coordinates[i][1][0]*10 + 0.5)*20, (view.coordinates[i][1][1]*10 + 0.5)*20,(view.coordinates[i][1][2]*10 + 0.5)*20)
		atom.position.set(xPlotScale(view.coordinates[i][1][0])*20.0, yPlotScale(view.coordinates[i][1][1])*20.0,zPlotScale(view.coordinates[i][1][2])*20.0);
		view.molecule.atoms.push(atom);
		scene.add(atom);
	}
	
	for (var i = 0; i < view.coordinates.length; i++) {
		var coordinates1 = new THREE.Vector3(view.coordinates[i][1][0], view.coordinates[i][1][1], view.coordinates[i][1][2]);
		//var point1 = new THREE.Vector3((view.coordinates[i][1][0]*10 + 0.5)*20, (view.coordinates[i][1][1]*10 + 0.5)*20,(view.coordinates[i][1][2]*10 + 0.5)*20);
		var point1 = new THREE.Vector3(xPlotScale(view.coordinates[i][1][0])*20.0, yPlotScale(view.coordinates[i][1][1])*20.0,zPlotScale(view.coordinates[i][1][2])*20.0);

	    for (var j = 0; j < view.coordinates.length; j++) {
	    	var coordinates2 = new THREE.Vector3(view.coordinates[j][1][0], view.coordinates[j][1][1], view.coordinates[j][1][2]);
	    	//var point2 = new THREE.Vector3((view.coordinates[j][1][0]*10 + 0.5)*20, (view.coordinates[j][1][1]*10 + 0.5)*20,(view.coordinates[j][1][2]*10 + 0.5)*20);
	    	var point2 = new THREE.Vector3(xPlotScale(view.coordinates[j][1][0])*20.0, yPlotScale(view.coordinates[j][1][1])*20.0,zPlotScale(view.coordinates[j][1][2])*20.0);
	    	//console.log(point1, point2)

	    	 /* edge from X to Y */
		    
		    var bondlength = new THREE.Vector3().subVectors( coordinates2, coordinates1 ).length();
		    //console.log(direction.length());
		    if (bondlength < options.maxBondLength && bondlength > options.minBondLength) {
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
			    //console.log(direction, orientation)
			    var bondGeometry = new THREE.CylinderGeometry( options.bondSize*10, options.bondSize*10, direction.length(), 24, 1, true);
			    //bondGeometry.translate( point1 );

			    var bond = new THREE.Mesh( bondGeometry, 
			            new THREE.MeshBasicMaterial( { color: 0xffffff } ) );

			    bond.applyMatrix(orientation)
			    //console.log(new THREE.Vector3().addVectors( point1, direction.multiplyScalar(0.5) ))
			    //bond.position = new THREE.Vector3().addVectors( point1, direction.multiplyScalar(0.5) );
			    //bond.position.set(new THREE.Vector3().addVectors(point1, direction.multiplyScalar(0.5)));
	            bond.position.x = (point2.x + point1.x) / 2;
			    bond.position.y = (point2.y + point1.y) / 2;
			    bond.position.z = (point2.z + point1.z) / 2;
			    view.molecule.bonds.push(bond);
			    scene.add(bond);
		    }
		    
		}

	}

}


export function updateMoleculeGeometry(view){
	
	for (var i = 0; i < view.molecule.bonds.length; i++) {
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
	}

	getMoleculeGeometry(view);

}


export function changeMoleculeGeometry(view){
	
	/*for (var i = 0; i < view.molecule.bonds.length; i++) {
		view.scene.remove(view.molecule.bonds[i]);
	}

	for (var i = 0; i < view.molecule.atoms.length; i++) {
		view.scene.remove(view.molecule.atoms[i]);
	}*/
	removeMoleculeGeometry(view);
	getMoleculeGeometry(view);

}

export function removeMoleculeGeometry(view){
	//console.log("delete molecule");
	//console.log(view.molecule);
	if (view.molecule != null ){
		//console.log("delete molecule");
		for (var i = 0; i < view.molecule.bonds.length; i++) {
			view.scene.remove(view.molecule.bonds[i]);
		}

		for (var i = 0; i < view.molecule.atoms.length; i++) {
			view.scene.remove(view.molecule.atoms[i]);
		}

		delete view.Molecule;
	}

}



export function addMoleculePeriodicReplicates(view){



	view.periodicReplicateMolecule = {};
	view.periodicReplicateMolecule.atoms = [];
	view.periodicReplicateMolecule.bonds = [];

	var colorSetup = {"C":0x777777, "O":0xFF0000, "N":0x0000FF, "H":0xCCCCCC}
	var atomRadius = {
						"C":0.77,
						"O":0.73,
						"N":0.75,
						"H":0.37
					}
	var options = view.options;
	var scene = view.scene;

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


	for ( var i = x_start; i < x_end; i ++) {
		for ( var j = y_start; j < y_end; j ++) {
			for ( var k = z_start; k < z_end; k ++) {
				if (((i == 0) && (j == 0) && (k == 0)) == false) {
					for (var ii = 0; ii < view.coordinates.length; ii++) {
					   
					    var geometry = new THREE.SphereGeometry(100, 24, 24);
							
						var material = new THREE.MeshBasicMaterial( {color: colorSetup[view.coordinates[ii][0]]} );
						var atom = new THREE.Mesh(geometry, material);
						atom.scale.set(options.atomSize*atomRadius[view.coordinates[ii][0]], options.atomSize*atomRadius[view.coordinates[ii][0]], options.atomSize*atomRadius[view.coordinates[ii][0]])
						//atom.position.set((view.coordinates[i][1][0]*10 + 0.5)*20, (view.coordinates[i][1][1]*10 + 0.5)*20,(view.coordinates[i][1][2]*10 + 0.5)*20)
						atom.position.set(xPlotScale(view.coordinates[ii][1][0])*20.0 + i*xStep, yPlotScale(view.coordinates[ii][1][1])*20.0 + j*yStep,zPlotScale(view.coordinates[ii][1][2])*20.0 + k*zStep);
						view.periodicReplicateMolecule.atoms.push(atom);
						scene.add(atom);
					}
					
				}
			}
		}
	}


	for ( var i = x_start; i < x_end; i ++) {
		for ( var j = y_start; j < y_end; j ++) {
			for ( var k = z_start; k < z_end; k ++) {
				if (((i == 0) && (j == 0) && (k == 0)) == false) {
					for (var ii = 0; ii < view.coordinates.length; ii++) {
						var coordinates1 = new THREE.Vector3(view.coordinates[ii][1][0], view.coordinates[ii][1][1], view.coordinates[ii][1][2]);
						var point1 = new THREE.Vector3(xPlotScale(view.coordinates[ii][1][0])*20.0 + i*xStep, yPlotScale(view.coordinates[ii][1][1])*20.0 + j*yStep,zPlotScale(view.coordinates[ii][1][2])*20.0 + k*zStep);

					    for (var jj = 0; jj < view.coordinates.length; jj++) {
					    	var coordinates2 = new THREE.Vector3(view.coordinates[jj][1][0], view.coordinates[jj][1][1], view.coordinates[jj][1][2]);
					    	var point2 = new THREE.Vector3(xPlotScale(view.coordinates[jj][1][0])*20.0 + i*xStep, yPlotScale(view.coordinates[jj][1][1])*20.0 + j*yStep,zPlotScale(view.coordinates[jj][1][2])*20.0 + k*zStep);

						    var bondlength = new THREE.Vector3().subVectors( coordinates2, coordinates1 ).length();
						    //console.log(direction.length());
						    if (bondlength < options.maxBondLength && bondlength > options.minBondLength) {
						    	var direction = new THREE.Vector3().subVectors( point2, point1 );
						    	var orientation = new THREE.Matrix4();
							    /* THREE.Object3D().up (=Y) default orientation for all objects */
							    orientation.lookAt(point1, point2, new THREE.Object3D().up);
							    orientation.multiply(new THREE.Matrix4().set(1,0,0,0,
							                                            0,0,1,0, 
							                                            0,-1,0,0,
							                                            0,0,0,1));

							    var bondGeometry = new THREE.CylinderGeometry( options.bondSize*10, options.bondSize*10, direction.length(), 24, 1, true);

							    var bond = new THREE.Mesh( bondGeometry, 
							            new THREE.MeshBasicMaterial( { color: 0xffffff } ) );

							    bond.applyMatrix(orientation)
					            bond.position.x = (point2.x + point1.x) / 2;
							    bond.position.y = (point2.y + point1.y) / 2;
							    bond.position.z = (point2.z + point1.z) / 2;
							    view.periodicReplicateMolecule.bonds.push(bond);
							    scene.add(bond);
						    }
					    }
					}
				}
			}
		}
	}
}


export function removeMoleculePeriodicReplicates(view){
	//console.log("delete molecule replicate");
	//console.log(view.periodicReplicateMolecule);
	if (view.periodicReplicateMolecule != null ) {
		//console.log(" start delete molecule replicate");
		for (var i = 0; i < view.periodicReplicateMolecule.bonds.length; i++) {
			view.scene.remove(view.periodicReplicateMolecule.bonds[i]);
		}

		for (var i = 0; i < view.periodicReplicateMolecule.atoms.length; i++) {
			view.scene.remove(view.periodicReplicateMolecule.atoms[i]);
		}

		delete view.periodicReplicateMolecule;
	}
}

export function changeMoleculePeriodicReplicates(view){
	removeMoleculePeriodicReplicates(view);
	addMoleculePeriodicReplicates(view);
}