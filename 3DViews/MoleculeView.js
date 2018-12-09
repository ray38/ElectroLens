export function getMoleculeGeometryTest(view){
	console.log('re-calculating geometry');

var material = new THREE.MeshBasicMaterial( {
	color: 0xffffff, 
	vertexColors: THREE.FaceColors,
	opacity: options.boxOpacity,
	transparent: true
	 } );
var mergedGeometry = new THREE.Geometry();

var particles = options.boxParticles;
var num_blocks = 1000000;
var points_in_block = new Float32Array(num_blocks);
var total = 100;
var count = 0;



for ( var k = 0; k < num_blocks; k ++) {
	var num_points  = Math.floor((n_test[k] / total) * particles);
	points_in_block[k] = num_points;
	if (num_points>0){
		count += 1;
	}
}
var colors = new Array(count);

var n = 100;
var n2 = Math.pow(n,2);
var n_inc = n/2;

colorMap = options.colorMap;
numberOfColors = 512;

lut = new THREE.Lut( colorMap, numberOfColors );
lut.setMax( options.boxColorSetting);
lut.setMin( 0 );

var i = 0;
for ( var k = 0; k < num_blocks; k ++) {
	if (points_in_block[k] > 0){
		var x_start = k%n;
		var y_start = ((k-(k%n))/n)%n;
		var z_start = (k-(k%n2))/n2;
		var x_end = x_start + 1;
		var y_end = y_start + 1;
		var z_end = z_start + 1;
		
		if (	(x_start >= options.x_low) 	&& (x_end <= options.x_high) 	&&
			(y_start >= options.y_low) 	&& (y_end <= options.y_high)	&&
			(z_start >= options.z_low) 	&& (z_end <= options.z_high)	){

			var tempColor = lut.getColor( target_test[k] );
			var tempGeometry = new THREE.BoxGeometry( options.boxSize, options.boxSize, options.boxSize );

			tempGeometry.translate( (x_start - n_inc)*10 , (y_start - n_inc)*10 ,(z_start - n_inc)*10 );
			mergedGeometry.merge(tempGeometry);
			
			for (var q = 0; q < 12; q ++){
				colors[i] = tempColor.getHex ();
				i++;
			}
		}			
	}			
}

for ( var i = 0; i < mergedGeometry.faces.length; i ++ ) {

    var face = mergedGeometry.faces[ i ];
    face.color.setHex( colors[i]);

}

var mesh = new THREE.Mesh( mergedGeometry, material );

console.log(' end re-calculating geometry');
return mesh;


}


export function getMoleculeGeometry(view){

	view.molecule = {};
	view.molecule.atoms = [];
	view.molecule.bonds = [];

	var colorSetup = {"C":0x999999, "O":0xFF0000, "N":0x0000FF, "H":0xFFFFFF}
	var options = view.options;
	var scene = view.scene;

	for (var i = 0; i < view.coordinates.length; i++) {
	    console.log(view.coordinates[i]);
	    console.log(view.coordinates[i][1][0] , view.coordinates[i][1][1] ,view.coordinates[i][1][2]);
	    console.log((view.coordinates[i][1][0]*10 + 0.5)*20, (view.coordinates[i][1][1]*10 + 0.5)*20,(view.coordinates[i][1][2]*10 + 0.5)*20);
	    //Do something
	    var geometry = new THREE.SphereGeometry(options.atomSize*50, 50, 50);
		geometry.translate( (view.coordinates[i][1][0]*10 + 0.5)*20, (view.coordinates[i][1][1]*10 + 0.5)*20,(view.coordinates[i][1][2]*10 + 0.5)*20);
			
		var material = new THREE.MeshBasicMaterial( {color: colorSetup[view.coordinates[i][0]]} );
		var atom = new THREE.Mesh(geometry, material);
		//atom.material.color.setHex( colorSetup[view.coordinates[i][1]] )
		//atom.material.color = new THREE.Color(colorSetup[view.coordinates[i][0]]);
		//console.log(view.coordinates[i][0]);
		//console.log(colorSetup[view.coordinates[i][0]]);
		view.molecule.atoms.push(atom);
		scene.add(atom);
	}
	
	for (var i = 0; i < view.coordinates.length; i++) {
		var coordinates1 = new THREE.Vector3(view.coordinates[i][1][0], view.coordinates[i][1][1], view.coordinates[i][1][2]);
		var point1 = new THREE.Vector3((view.coordinates[i][1][0]*10 + 0.5)*20, (view.coordinates[i][1][1]*10 + 0.5)*20,(view.coordinates[i][1][2]*10 + 0.5)*20);

	    for (var j = 0; j < view.coordinates.length; j++) {
	    	var coordinates2 = new THREE.Vector3(view.coordinates[j][1][0], view.coordinates[j][1][1], view.coordinates[j][1][2]);
	    	var point2 = new THREE.Vector3((view.coordinates[j][1][0]*10 + 0.5)*20, (view.coordinates[j][1][1]*10 + 0.5)*20,(view.coordinates[j][1][2]*10 + 0.5)*20);

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
			    var bondGeometry = new THREE.CylinderGeometry( options.bondSize*10, options.bondSize*10, direction.length(), 32, 1, true);
			    //bondGeometry.translate( point1 );

			    var bond = new THREE.Mesh( bondGeometry, 
			            new THREE.MeshBasicMaterial( { color: 0xffffff } ) );

			    bond.applyMatrix(orientation)
			    //console.log(new THREE.Vector3().addVectors( point1, direction.multiplyScalar(0.5) ))
			    //bond.position = new THREE.Vector3().addVectors( point1, direction.multiplyScalar(0.5) );
			    //bond.position.set(new THREE.Vector3().addVectors(point1, direction.multiplyScalar(0.5)));
			    //bond.position.x = (view.coordinates[j][1][0]*10 + 0.5)*20;
	            //bond.position.y = (view.coordinates[j][1][1]*10 + 0.5)*20;
	            //bond.position.z = (view.coordinates[j][1][2]*10 + 0.5)*20;
	            bond.position.x = (point2.x + point1.x) / 2;
			    bond.position.y = (point2.y + point1.y) / 2;
			    bond.position.z = (point2.z + point1.z) / 2;
			    view.molecule.bonds.push(bond);
			    scene.add(bond);
		    }
		    
		}

	}

}


export function changeMoleculeGeometry(view){
	
	for (var i = 0; i < view.molecule.bonds.length; i++) {
		view.scene.remove(view.molecule.bonds[i]);
	}

	for (var i = 0; i < view.molecule.atoms.length; i++) {
		view.scene.remove(view.molecule.atoms[i]);
	}

	getMoleculeGeometry(view);

}

export function removeMoleculeGeometry(view){
	
	for (var i = 0; i < view.molecule.bonds.length; i++) {
		view.scene.remove(view.molecule.bonds[i]);
	}

	for (var i = 0; i < view.molecule.atoms.length; i++) {
		view.scene.remove(view.molecule.atoms[i]);
	}

}