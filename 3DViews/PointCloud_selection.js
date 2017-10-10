function getPointCloudGeometry(options){
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
var particles = options.pointCloudParticles;
var num_blocks = unfilteredData.length;
var points_in_block = new Float32Array(num_blocks);
var total = 100;
var count = 0;

for ( var k = 0; k < num_blocks; k ++) {
	var num_points  = Math.min(Math.floor((unfilteredData[k]['n'] / total) * particles),10);
	points_in_block[k] = num_points;
	count += num_points;
}
console.log(count);

var n = 100;
var n2 = Math.pow(n,2);
var n_inc = n/2;

geometry = new THREE.BufferGeometry();

var positions = new Float32Array(count*3);
var colors = new Float32Array(count *3);
var sizes = new Float32Array( count);
var alphas = new Float32Array( count);

colorMap = options.colorMap;
numberOfColors = 512;

lut = new THREE.Lut( colorMap, numberOfColors );
lut.setMax( options.pointCloudColorSetting);
lut.setMin( 0 );

var i = 0, i3 = 0;
var temp_num_points = 0;
for ( var k = 0; k < num_blocks; k ++) {
	temp_num_points  =  points_in_block[k];
	if (temp_num_points > 0){
		var x_start = unfilteredData[k]['x']*10 + 50;
		var y_start = unfilteredData[k]['y']*10 + 50;
		var z_start = unfilteredData[k]['z']*10 + 50;
		var x_end = x_start + 1;
		var y_end = y_start + 1;
		var z_end = z_start + 1;
		
		for (var j = 0; j < temp_num_points; j ++){

			var x = Math.random()*10  + x_start;
			var y = Math.random()*10  + y_start;
			var z = Math.random()*10  + z_start;
			
			positions[ i3 + 0 ] = (x - n_inc)*10;
			positions[ i3 + 1 ] = (y - n_inc)*10;
			positions[ i3 + 2 ] = (z - n_inc)*10;
			var color = lut.getColor( unfilteredData[k][options.propertyOfInterest] );
			
			colors[ i3 + 0 ] = color.r;
			colors[ i3 + 1 ] = color.g;
			colors[ i3 + 2 ] = color.b;
			
			if (	(x_start >= options.x_low) 	&& (x_end <= options.x_high) 	&&
				(y_start >= options.y_low) 	&& (y_end <= options.y_high)	&&
				(z_start >= options.z_low) 	&& (z_end <= options.z_high)	&& unfilteredData[k].selected)
				{
					alphas[ i ] = options.pointCloudAlpha;
					sizes[ i ] = options.pointCloudSize;
				}
			else {
				alphas[ i ] = 0;
				sizes[ i ] = 0;
			}

			
			i++;
			i3+=3;
		}
	}			
}
	


geometry.addAttribute( 'position', new THREE.BufferAttribute( positions, 3 ) );
geometry.addAttribute( 'customColor', new THREE.BufferAttribute( colors, 3 ) );
geometry.addAttribute( 'size', new THREE.BufferAttribute( sizes, 1 ) );
geometry.addAttribute( 'alpha', new THREE.BufferAttribute( alphas, 1 ) );

var System = new THREE.Points( geometry, shaderMaterial );

return System;

}




function updatePointCloudGeometry(options){

var particles = options.pointCloudParticles;
var num_blocks = unfilteredData.length;
var points_in_block = new Float32Array(num_blocks);
var total = 100;
var count = 0;

for ( var k = 0; k < num_blocks; k ++) {
	//var num_points  = Math.floor((unfilteredData[k]['n'] / total) * particles);
	var num_points  = Math.min(Math.floor((unfilteredData[k]['n'] / total) * particles),10);
	points_in_block[k] = num_points;
	count += num_points;
}

var n = 100;
var n2 = Math.pow(n,2);
var n_inc = n/2;


var colors = new Float32Array(count *3);
var sizes = new Float32Array( count);
var alphas = new Float32Array( count);

colorMap = options.colorMap;
numberOfColors = 512;

lut = new THREE.Lut( colorMap, numberOfColors );
lut.setMax( options.pointCloudColorSetting);
lut.setMin( 0 );

var i = 0, i3 = 0;
var temp_num_points = 0;
for ( var k = 0; k < num_blocks; k ++) {
	temp_num_points  =  points_in_block[k];
	if (temp_num_points > 0){
		var x_start = unfilteredData[k]['x']*10 + 50;
		var y_start = unfilteredData[k]['y']*10 + 50;
		var z_start = unfilteredData[k]['z']*10 + 50;
		var x_end = x_start + 1;
		var y_end = y_start + 1;
		var z_end = z_start + 1;
		
		for (var j = 0; j < temp_num_points; j ++){

			var color = lut.getColor( unfilteredData[k][options.propertyOfInterest] );
			
			colors[ i3 + 0 ] = color.r;
			colors[ i3 + 1 ] = color.g;
			colors[ i3 + 2 ] = color.b;
			
			if (	(x_start >= options.x_low) 	&& (x_end <= options.x_high) 	&&
				(y_start >= options.y_low) 	&& (y_end <= options.y_high)	&&
				(z_start >= options.z_low) 	&& (z_end <= options.z_high)	&& unfilteredData[k].selected)
				{
					alphas[ i ] = options.pointCloudAlpha;
					sizes[ i ] = options.pointCloudSize;
				}
			else {
				alphas[ i ] = 0;
				sizes[ i ] = 0;
			}

			
			i++;
			i3+=3;
		}
	}			
}

System.geometry.addAttribute( 'customColor', new THREE.BufferAttribute( colors, 3 ) );
System.geometry.addAttribute( 'size', new THREE.BufferAttribute( sizes, 1 ) );
System.geometry.addAttribute( 'alpha', new THREE.BufferAttribute( alphas, 1 ) );
}
