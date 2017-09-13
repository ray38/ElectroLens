function getBoxGeometry(options){
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






function updateBoxGeometry(options){
console.log('start updating box');
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
			
			for (var q = 0; q < 12; q ++){
				colors[i] = tempColor.getHex ();
				i++;
			}
		}			
	}			
}

for ( var i = 0; i < System.geometry.faces.length; i ++ ) {

    var face = System.geometry.faces[ i ];
    face.color.setHex( colors[i]);

}
console.log('end updating box');

}
