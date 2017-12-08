function getPointMatrixGeometry(options) {
var uniforms = {

	color:     { value: new THREE.Color( 0xffffff ) },
	texture:   { value: new THREE.TextureLoader().load( "textures/sprites/disc.png" ) }

};

var shaderMaterial = new THREE.ShaderMaterial( {

	uniforms:       uniforms,
	vertexShader:   document.getElementById( 'vertexshader' ).textContent,
	fragmentShader: document.getElementById( 'fragmentshader' ).textContent,

	blending:       THREE.AdditiveBlending,
	depthTest:      false,
	transparent:    true

});
var particles = options.pointMatrixParticles;

var geometry = new THREE.BufferGeometry();

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
var positions = new Float32Array(count*3);
var colors = new Float32Array(count *3);
var sizes = new Float32Array( count);
var alphas = new Float32Array( count);

var n = 100;
var n2 = Math.pow(n,2);
var n_inc = n/2;

colorMap = options.colorMap;
numberOfColors = 512;

lut = new THREE.Lut( colorMap, numberOfColors );
lut.setMax( options.boxColorSetting);
lut.setMin( 0 );

var i = 0;
var i3 = 0;
for ( var k = 0; k < num_blocks; k ++) {
	if (points_in_block[k] > 0){
		var x_start = k%n;
		var y_start = ((k-(k%n))/n)%n;
		var z_start = (k-(k%n2))/n2;
		var x_end = x_start + 1;
		var y_end = y_start + 1;
		var z_end = z_start + 1;

		var color = lut.getColor( target_test[k] );

		positions[ i3 ]     = (x_start - n_inc)*10;
		positions[ i3 + 1 ] = (y_start - n_inc)*10;
		positions[ i3 + 2 ] = (z_start - n_inc)*10;

		colors[ i3 ]     = color.r;
		colors[ i3 + 1 ] = color.g;
		colors[ i3 + 2 ] = color.b;

		if (	(x_start >= options.x_low) 	&& (x_end <= options.x_high) 	&&
			(y_start >= options.y_low) 	&& (y_end <= options.y_high)	&&
			(z_start >= options.z_low) 	&& (z_end <= options.z_high)	)
			{
				alphas[ i ] = options.pointMatrixAlpha;
				sizes[ i ] = Math.min(5,target_test[k] * options.pointMatrixSize);
			}
		else {
			alphas[ i ] = 0;
			sizes[ i ] = 0;
		}
		i++;
		i3 += 3;			
	}			
}

geometry.addAttribute( 'position', new THREE.BufferAttribute( positions, 3 ) );
geometry.addAttribute( 'customColor', new THREE.BufferAttribute( colors, 3 ) );
geometry.addAttribute( 'size', new THREE.BufferAttribute( sizes, 1 ) );
geometry.addAttribute( 'alpha', new THREE.BufferAttribute( alphas, 1 ) );

var System = new THREE.Points( geometry, shaderMaterial );

return System;


}


function updatePointMatrixGeometry(options) {
var uniforms = {

	color:     { value: new THREE.Color( 0xffffff ) },
	texture:   { value: new THREE.TextureLoader().load( "textures/sprites/disc.png" ) }

};

var shaderMaterial = new THREE.ShaderMaterial( {

	uniforms:       uniforms,
	vertexShader:   document.getElementById( 'vertexshader' ).textContent,
	fragmentShader: document.getElementById( 'fragmentshader' ).textContent,

	blending:       THREE.AdditiveBlending,
	depthTest:      false,
	transparent:    true

});
var particles = options.pointMatrixParticles;

var geometry = new THREE.BufferGeometry();

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

var colors = new Float32Array(count *3);
var sizes = new Float32Array( count);
var alphas = new Float32Array( count);

var n = 100;
var n2 = Math.pow(n,2);
var n_inc = n/2;

colorMap = options.colorMap;
numberOfColors = 512;

lut = new THREE.Lut( colorMap, numberOfColors );
lut.setMax( options.boxColorSetting);
lut.setMin( 0 );

var i = 0;
var i3 = 0;
for ( var k = 0; k < num_blocks; k ++) {
	if (points_in_block[k] > 0){
		var x_start = k%n;
		var y_start = ((k-(k%n))/n)%n;
		var z_start = (k-(k%n2))/n2;
		var x_end = x_start + 1;
		var y_end = y_start + 1;
		var z_end = z_start + 1;

		var color = lut.getColor( target_test[k] );


		colors[ i3 ]     = color.r;
		colors[ i3 + 1 ] = color.g;
		colors[ i3 + 2 ] = color.b;

		if (	(x_start >= options.x_low) 	&& (x_end <= options.x_high) 	&&
			(y_start >= options.y_low) 	&& (y_end <= options.y_high)	&&
			(z_start >= options.z_low) 	&& (z_end <= options.z_high)	)
			{
				alphas[ i ] = options.pointMatrixAlpha;
				sizes[ i ] = Math.min(5,n_test[k] * options.pointMatrixSize);
			}
		else {
			alphas[ i ] = 0;
			sizes[ i ] = 0;
		}
		i++;
		i3 += 3;			
	}			
}


System.geometry.addAttribute( 'customColor', new THREE.BufferAttribute( colors, 3 ) );
System.geometry.addAttribute( 'size', new THREE.BufferAttribute( sizes, 1 ) );
System.geometry.addAttribute( 'alpha', new THREE.BufferAttribute( alphas, 1 ) );

}
