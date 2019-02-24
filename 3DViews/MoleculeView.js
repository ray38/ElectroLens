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

/*
	var colorSetup = {	"C":0xC8C8C8, 
						"O":0xF00000, 
						"N":0x8F8FFF, 
						"H":0xFFFFFF,
						"S":0xFFC832,
						"P":0xFFA500,
						"Cl":0x00FF00,
						"Br":0xA52A2A,
						"Na":0x0000FF,
						"Mg":0x2A802A,
						"Ca":0x808090
					}

	var atomRadius = {
						"C":0.73, 
						"O":0.66, 
						"N":0.71, 
						"H":0.31,
						"S":1.05,
						"P":1.07,
						"Cl":1.02,
						"Br":1.20,
						"Na":1.66,
						"Mg":1.41,
						"Ca":1.76
					}
*/
//  jmol color scheme: http://jmol.sourceforge.net/jscolors/
	var colorSetup = {
						"H":   0xFFFFFF, 
						"He":  0xD9FFFF,
						"Li":  0xCC80FF,
						"Be":  0xC2FF00,
						"B":   0xFFB5B5,
						"C":   0x909090,
						"N":   0x3050F8,
						"O":   0xFF0D0D,
						"F":   0x90E050,
						"Ne":  0xB3E3F5,
						"Na":  0xAB5CF2,
						"Mg":  0x8AFF00,
						"Al":  0xBFA6A6,
						"Si":  0xF0C8A0,
						"P":   0xFF8000,
						"S":   0xFFFF30,
						"Cl":  0x1FF01F,
						"Ar":  0x80D1E3,
						"K":   0x8F40D4,
						"Ca":  0x3DFF00,
						"Sc":  0xE6E6E6,
						"Ti":  0xBFC2C7,
						"V":   0xA6A6AB,
						"Cr":  0x8A99C7,
						"Mn":  0x9C7AC7,
						"Fe":  0xE06633,
						"Co":  0xF090A0,
						"Ni":  0x50D050,
						"Cu":  0xC88033,
						"Zn":  0x7D80B0,
						"Ga":  0xC28F8F,
						"Ge":  0x668F8F,
						"As":  0xBD80E3,
						"Se":  0xFFA100,
						"Br":  0xA62929,
						"Kr":  0x5CB8D1,
						"Rb":  0x702EB0,
						"Sr":  0x00FF00,
						"Y":   0x94FFFF,
						"Zr":  0x94E0E0,
						"Nb":  0x73C2C9,
						"Mo":  0x54B5B5,
						"Tc":  0x3B9E9E,
						"Ru":  0x248F8F,
						"Rh":  0x0A7D8C,
						"Pd":  0x006985,
						"Ag":  0xC0C0C0,
						"Cd":  0xFFD98F,
						"In":  0xA67573,
						"Sn":  0x668080,
						"Sb":  0x9E63B5,
						"Te":  0xD47A00,
						"I":   0x940094,
						"Xe":  0x429EB0,
						"Cs":  0x57178F,
						"Ba":  0x00C900,
						"La":  0x70D4FF,
						"Ce":  0xFFFFC7,
						"Pr":  0xD9FFC7,
						"Nd":  0xC7FFC7,
						"Pm":  0xA3FFC7,
						"Sm":  0x8FFFC7,
						"Eu":  0x61FFC7,
						"Gd":  0x45FFC7,
						"Tb":  0x30FFC7,
						"Dy":  0x1FFFC7,
						"Ho":  0x00FF9C,
						"Er":  0x00E675,
						"Tm":  0x00D452,
						"Yb":  0x00BF38,
						"Lu":  0x00AB24,
						"Hf":  0x4DC2FF,
						"Ta":  0x4DA6FF,
						"W":   0x2194D6,
						"Re":  0x267DAB,
						"Os":  0x266696,
						"Ir":  0x175487,
						"Pt":  0xD0D0E0,
						"Au":  0xFFD123,
						"Hg":  0xB8B8D0,
						"Tl":  0xA6544D,
						"Pb":  0x575961,
						"Bi":  0x6E4FB25,
						"Po":  0xAB5C00,
						"At":  0x754F45,
						"Rn":  0x428296,
						"Fr":  0x420066,
						"Ra":  0x007D00,
						"Ac":  0x70ABFA,
						"Th":  0x00BAFF,
						"Pa":  0x00A1FF,
						"U":   0x008FFF,
						"Np":  0x0080FF,
						"Pu":  0x006BFF,
						"Am":  0x545CF2,
						"Cm":  0x785CE3,
						"Bk":  0x8A4FE3,
						"Cf":  0xA136D4,
						"Es":  0xB31FD4,
						"Fm":  0xB31FBA,
						"Md":  0xB30DA6,
						"No":  0xBD0D87,
						"Lr":  0xC70066,
						"Rf":  0xCC0059,
						"Db":  0xD1004F,
						"Sg":  0xD90045,
						"Bh":  0xE00038,
						"Hs":  0xE6002E,
						"Mt":  0xEB0026
					}

// radious, http://periodictable.com/Properties/A/AtomicRadius.an.html
	var atomRadius = {
						"H":  0.53,
						"He": 0.31,
						"Li": 1.67,
						"Be": 1.12,
						"B":  0.87,
						"C":  0.67,
						"N":  0.56,
						"O":  0.48,
						"F":  0.42,
						"Ne": 0.38,
						"Na": 1.90,
						"Mg": 1.45,
						"Al": 1.18,
						"Si": 1.11,
						"P":  0.98,
						"S":  0.87,
						"Cl": 0.79,
						"Ar": 0.71,
						"K":  2.43,
						"Ca": 1.94,
						"Sc": 1.84,
						"Ti": 1.76, 
						"V":  1.71,
						"Cr": 1.66,
						"Mn": 1.61,
						"Fe": 1.56,
						"Co": 1.52,
						"Ni": 1.49,
						"Cu": 1.45,
						"Zn": 1.42,
						"Ga": 1.36,
						"Ge": 1.25,
						"As": 1.14,
						"Se": 1.03,
						"Br": 0.94,
						"Kr": 0.87,
						"Rb": 2.65,
						"Sr": 2.19,
						"Y":  2.12,
						"Zr": 2.06,
						"Nb": 1.98,
						"Mo": 1.90,
						"Tc": 1.83,
						"Ru": 1.78,
						"Rh": 1.73,
						"Pd": 1.69,
						"Ag": 1.65,
						"Cd": 1.61,
						"In": 1.56,
						"Sn": 1.45,
						"Sb": 1.33,
						"Te": 1.23,
						"I":  1.15,
						"Xe": 1.08,
						"Cs": 2.98,
						"Ba": 2.53,
						"La": 2.00, //unknwon
						"Ce": 2.00, //unknwon
						"Pr": 2.47,
						"Nd": 2.06,
						"Pm": 2.05,
						"Sm": 2.38,
						"Eu": 2.31,
						"Gd": 2.33,
						"Tb": 2.25,
						"Dy": 2.28,
						"Ho": 2.26,
						"Er": 2.26,
						"Tm": 2.22,
						"Yb": 2.22,
						"Lu": 2.17,
						"Hf": 2.08,
						"Ta": 2.00,
						"W":  1.93,
						"Re": 1.88,
						"Os": 1.85,
						"Ir": 1.80,
						"Pt": 1.77,
						"Au": 1.74,
						"Hg": 1.71,
						"Tl": 1.56,
						"Pb": 1.54,
						"Bi": 1.43,
						"Po": 1.35,
						"At": 1.27,
						"Rn": 1.20,
						"Fr": 2.00, //unknwon
						"Ra": 2.00, //unknwon
						"Ac": 2.00, //unknwon
						"Th": 2.00, //unknwon
						"Pa": 2.00, //unknwon
						"U": 2.00, //unknwon
						"Np": 2.00, //unknwon
						"Pu": 2.00, //unknwon
						"Am": 2.00, //unknwon
						"Cm": 2.00, //unknwon
						"Bk": 2.00, //unknwon
						"Cf": 2.00, //unknwon
						"Es": 2.00, //unknwon
						"Fm": 2.00, //unknwon
						"Md": 2.00, //unknwon
						"No": 2.00, //unknwon
						"Lr": 2.00, //unknwon
						"Rf": 2.00, //unknwon
						"Db": 2.00, //unknwon
						"Sg": 2.00, //unknwon
						"Bh": 2.00, //unknwon
						"Hs": 2.00, //unknwon
						"Mt": 2.00 //unknwon
					}
	

	var xPlotScale = view.xPlotScale;
	var yPlotScale = view.yPlotScale;
	var zPlotScale = view.zPlotScale;
	if (view.frameBool){
		for (var i = 0; i < moleculeData.length; i++) {
			if (moleculeData[i].selected && moleculeData[i][view.frameProperty]== options.currentFrame) {
			    var geometry = new THREE.SphereGeometry(100, options.atomModelSegments, options.atomModelSegments);

			    //console.log(colorCode);
			    if (colorCode == "atom") {
			    	//console.log("atom color basis");
					var material = new THREE.MeshBasicMaterial( {color: colorSetup[moleculeData[i].atom]} );
				}
				else {
					//console.log("other color basis");
					var tempColor = lut.getColor( moleculeData[i][colorCode] );
					var material = new THREE.MeshBasicMaterial( {color: tempColor } );
				}
					
				
				var atom = new THREE.Mesh(geometry, material);

				if (sizeCode == "atom") {
			    	//console.log("atom color basis");
			    	//console.log(atom);
					atom.scale.set(options.atomSize*atomRadius[moleculeData[i].atom], options.atomSize*atomRadius[moleculeData[i].atom], options.atomSize*atomRadius[moleculeData[i].atom]);
				}
				else {
					//console.log("other color basis");
					var tempSize = (moleculeData[i][sizeCode] - sizeMin)/(sizeMax - sizeMin);
					atom.scale.set(options.atomSize*tempSize, options.atomSize*tempSize, options.atomSize*tempSize);
				}
				//atom.position.set(xPlotScale(view.coordinates[i][1][0])*20.0, yPlotScale(view.coordinates[i][1][1])*20.0,zPlotScale(view.coordinates[i][1][2])*20.0);
				atom.position.set(moleculeData[i].xPlot*20.0, moleculeData[i].yPlot*20.0,moleculeData[i].zPlot*20.0);
				
				atom.dataIndex = i;
				view.molecule.atoms.push(atom);
				scene.add(atom);
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
					    view.molecule.bonds.push(bond);
					    scene.add(bond);
				    }
				}
			}
		}
	}
	else{
		for (var i = 0; i < moleculeData.length; i++) {
			if (moleculeData[i].selected) {
			    var geometry = new THREE.SphereGeometry(100, options.atomModelSegments, options.atomModelSegments);

			    //console.log(colorCode);
			    if (colorCode == "atom") {
			    	//console.log("atom color basis");
					var material = new THREE.MeshBasicMaterial( {color: colorSetup[moleculeData[i].atom]} );
				}
				else {
					//console.log("other color basis");
					var tempColor = lut.getColor( moleculeData[i][colorCode] );
					var material = new THREE.MeshBasicMaterial( {color: tempColor } );
				}
					
				
				var atom = new THREE.Mesh(geometry, material);

				if (sizeCode == "atom") {
			    	//console.log("atom color basis");
			    	//console.log(atom);
					atom.scale.set(options.atomSize*atomRadius[moleculeData[i].atom], options.atomSize*atomRadius[moleculeData[i].atom], options.atomSize*atomRadius[moleculeData[i].atom]);
				}
				else {
					//console.log("other color basis");
					var tempSize = (moleculeData[i][sizeCode] - sizeMin)/(sizeMax - sizeMin);
					atom.scale.set(options.atomSize*tempSize, options.atomSize*tempSize, options.atomSize*tempSize);
				}
				//atom.position.set(xPlotScale(view.coordinates[i][1][0])*20.0, yPlotScale(view.coordinates[i][1][1])*20.0,zPlotScale(view.coordinates[i][1][2])*20.0);
				atom.position.set(moleculeData[i].xPlot*20.0, moleculeData[i].yPlot*20.0,moleculeData[i].zPlot*20.0);
				
				atom.dataIndex = i;
				view.molecule.atoms.push(atom);
				scene.add(atom);
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
					    view.molecule.bonds.push(bond);
					    scene.add(bond);
				    }
				}
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


/*
	var colorSetup = {	"C":0xC8C8C8, 
						"O":0xF00000, 
						"N":0x8F8FFF, 
						"H":0xFFFFFF,
						"S":0xFFC832,
						"P":0xFFA500,
						"Cl":0x00FF00,
						"Br":0xA52A2A,
						"Na":0x0000FF,
						"Mg":0x2A802A,
						"Ca":0x808090
					}

	var atomRadius = {
						"C":0.73, 
						"O":0.66, 
						"N":0.71, 
						"H":0.31,
						"S":1.05,
						"P":1.07,
						"Cl":1.02,
						"Br":1.20,
						"Na":1.66,
						"Mg":1.41,
						"Ca":1.76
					}
*/
//  jmol color scheme: http://jmol.sourceforge.net/jscolors/
	var colorSetup = {
						"H":   0xFFFFFF, 
						"He":  0xD9FFFF,
						"Li":  0xCC80FF,
						"Be":  0xC2FF00,
						"B":   0xFFB5B5,
						"C":   0x909090,
						"N":   0x3050F8,
						"O":   0xFF0D0D,
						"F":   0x90E050,
						"Ne":  0xB3E3F5,
						"Na":  0xAB5CF2,
						"Mg":  0x8AFF00,
						"Al":  0xBFA6A6,
						"Si":  0xF0C8A0,
						"P":   0xFF8000,
						"S":   0xFFFF30,
						"Cl":  0x1FF01F,
						"Ar":  0x80D1E3,
						"K":   0x8F40D4,
						"Ca":  0x3DFF00,
						"Sc":  0xE6E6E6,
						"Ti":  0xBFC2C7,
						"V":   0xA6A6AB,
						"Cr":  0x8A99C7,
						"Mn":  0x9C7AC7,
						"Fe":  0xE06633,
						"Co":  0xF090A0,
						"Ni":  0x50D050,
						"Cu":  0xC88033,
						"Zn":  0x7D80B0,
						"Ga":  0xC28F8F,
						"Ge":  0x668F8F,
						"As":  0xBD80E3,
						"Se":  0xFFA100,
						"Br":  0xA62929,
						"Kr":  0x5CB8D1,
						"Rb":  0x702EB0,
						"Sr":  0x00FF00,
						"Y":   0x94FFFF,
						"Zr":  0x94E0E0,
						"Nb":  0x73C2C9,
						"Mo":  0x54B5B5,
						"Tc":  0x3B9E9E,
						"Ru":  0x248F8F,
						"Rh":  0x0A7D8C,
						"Pd":  0x006985,
						"Ag":  0xC0C0C0,
						"Cd":  0xFFD98F,
						"In":  0xA67573,
						"Sn":  0x668080,
						"Sb":  0x9E63B5,
						"Te":  0xD47A00,
						"I":   0x940094,
						"Xe":  0x429EB0,
						"Cs":  0x57178F,
						"Ba":  0x00C900,
						"La":  0x70D4FF,
						"Ce":  0xFFFFC7,
						"Pr":  0xD9FFC7,
						"Nd":  0xC7FFC7,
						"Pm":  0xA3FFC7,
						"Sm":  0x8FFFC7,
						"Eu":  0x61FFC7,
						"Gd":  0x45FFC7,
						"Tb":  0x30FFC7,
						"Dy":  0x1FFFC7,
						"Ho":  0x00FF9C,
						"Er":  0x00E675,
						"Tm":  0x00D452,
						"Yb":  0x00BF38,
						"Lu":  0x00AB24,
						"Hf":  0x4DC2FF,
						"Ta":  0x4DA6FF,
						"W":   0x2194D6,
						"Re":  0x267DAB,
						"Os":  0x266696,
						"Ir":  0x175487,
						"Pt":  0xD0D0E0,
						"Au":  0xFFD123,
						"Hg":  0xB8B8D0,
						"Tl":  0xA6544D,
						"Pb":  0x575961,
						"Bi":  0x6E4FB25,
						"Po":  0xAB5C00,
						"At":  0x754F45,
						"Rn":  0x428296,
						"Fr":  0x420066,
						"Ra":  0x007D00,
						"Ac":  0x70ABFA,
						"Th":  0x00BAFF,
						"Pa":  0x00A1FF,
						"U":   0x008FFF,
						"Np":  0x0080FF,
						"Pu":  0x006BFF,
						"Am":  0x545CF2,
						"Cm":  0x785CE3,
						"Bk":  0x8A4FE3,
						"Cf":  0xA136D4,
						"Es":  0xB31FD4,
						"Fm":  0xB31FBA,
						"Md":  0xB30DA6,
						"No":  0xBD0D87,
						"Lr":  0xC70066,
						"Rf":  0xCC0059,
						"Db":  0xD1004F,
						"Sg":  0xD90045,
						"Bh":  0xE00038,
						"Hs":  0xE6002E,
						"Mt":  0xEB0026
					}

// radious, http://periodictable.com/Properties/A/AtomicRadius.an.html
	var atomRadius = {
						"H":  0.53,
						"He": 0.31,
						"Li": 1.67,
						"Be": 1.12,
						"B":  0.87,
						"C":  0.67,
						"N":  0.56,
						"O":  0.48,
						"F":  0.42,
						"Ne": 0.38,
						"Na": 1.90,
						"Mg": 1.45,
						"Al": 1.18,
						"Si": 1.11,
						"P":  0.98,
						"S":  0.87,
						"Cl": 0.79,
						"Ar": 0.71,
						"K":  2.43,
						"Ca": 1.94,
						"Sc": 1.84,
						"Ti": 1.76, 
						"V":  1.71,
						"Cr": 1.66,
						"Mn": 1.61,
						"Fe": 1.56,
						"Co": 1.52,
						"Ni": 1.49,
						"Cu": 1.45,
						"Zn": 1.42,
						"Ga": 1.36,
						"Ge": 1.25,
						"As": 1.14,
						"Se": 1.03,
						"Br": 0.94,
						"Kr": 0.87,
						"Rb": 2.65,
						"Sr": 2.19,
						"Y":  2.12,
						"Zr": 2.06,
						"Nb": 1.98,
						"Mo": 1.90,
						"Tc": 1.83,
						"Ru": 1.78,
						"Rh": 1.73,
						"Pd": 1.69,
						"Ag": 1.65,
						"Cd": 1.61,
						"In": 1.56,
						"Sn": 1.45,
						"Sb": 1.33,
						"Te": 1.23,
						"I":  1.15,
						"Xe": 1.08,
						"Cs": 2.98,
						"Ba": 2.53,
						"La": 2.00, //unknwon
						"Ce": 2.00, //unknwon
						"Pr": 2.47,
						"Nd": 2.06,
						"Pm": 2.05,
						"Sm": 2.38,
						"Eu": 2.31,
						"Gd": 2.33,
						"Tb": 2.25,
						"Dy": 2.28,
						"Ho": 2.26,
						"Er": 2.26,
						"Tm": 2.22,
						"Yb": 2.22,
						"Lu": 2.17,
						"Hf": 2.08,
						"Ta": 2.00,
						"W":  1.93,
						"Re": 1.88,
						"Os": 1.85,
						"Ir": 1.80,
						"Pt": 1.77,
						"Au": 1.74,
						"Hg": 1.71,
						"Tl": 1.56,
						"Pb": 1.54,
						"Bi": 1.43,
						"Po": 1.35,
						"At": 1.27,
						"Rn": 1.20,
						"Fr": 2.00, //unknwon
						"Ra": 2.00, //unknwon
						"Ac": 2.00, //unknwon
						"Th": 2.00, //unknwon
						"Pa": 2.00, //unknwon
						"U": 2.00, //unknwon
						"Np": 2.00, //unknwon
						"Pu": 2.00, //unknwon
						"Am": 2.00, //unknwon
						"Cm": 2.00, //unknwon
						"Bk": 2.00, //unknwon
						"Cf": 2.00, //unknwon
						"Es": 2.00, //unknwon
						"Fm": 2.00, //unknwon
						"Md": 2.00, //unknwon
						"No": 2.00, //unknwon
						"Lr": 2.00, //unknwon
						"Rf": 2.00, //unknwon
						"Db": 2.00, //unknwon
						"Sg": 2.00, //unknwon
						"Bh": 2.00, //unknwon
						"Hs": 2.00, //unknwon
						"Mt": 2.00 //unknwon
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

	if (view.frameBool){
		for ( var i = x_start; i < x_end; i ++) {
			for ( var j = y_start; j < y_end; j ++) {
				for ( var k = z_start; k < z_end; k ++) {
					if (((i == 0) && (j == 0) && (k == 0)) == false) {
						for (var ii = 0; ii < moleculeData.length; ii++) {
							
							if (moleculeData[ii].selected && moleculeData[ii][view.frameProperty]== options.currentFrame) {
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
								scene.add(atom);
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
								    	var direction = new THREE.Vector3().subVectors( point2, point1 );
								    	var orientation = new THREE.Matrix4();
									    /* THREE.Object3D().up (=Y) default orientation for all objects */
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
									    scene.add(bond);
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
								scene.add(atom);
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
								    	var direction = new THREE.Vector3().subVectors( point2, point1 );
								    	var orientation = new THREE.Matrix4();
									    /* THREE.Object3D().up (=Y) default orientation for all objects */
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
									    scene.add(bond);
								    }
							    }
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