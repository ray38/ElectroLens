export function getPointCloudGeometry(view){

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

	var options = view.options;
	var scene = view.scene;


	var particles = options.pointCloudParticles;
	var num_blocks = view.systemSpatiallyResolvedData.length;
	var points_in_block = new Float32Array(num_blocks);
	var total = 100;
	var count = 0;

	for ( var k = 0; k < num_blocks; k ++) {
		var num_points  = Math.min(Math.floor((view.systemSpatiallyResolvedData[k][options.density] / total) * particles), options.pointCloudMaxPointPerBlock);
		points_in_block[k] = num_points;
		count += num_points;
	}
	console.log("total points in cloud: ", count)

	var geometry = new THREE.BufferGeometry();

	var positions = new Float32Array(count*3);
	var colors = new Float32Array(count *3);
	var sizes = new Float32Array( count);
	var alphas = new Float32Array( count);
	var parentBlock = new Float32Array( count);

	var colorMap = options.colorMap;
	var numberOfColors = 512;

	var lut = new THREE.Lut( colorMap, numberOfColors );
	lut.setMax( options.pointCloudColorSettingMax );
	lut.setMin( options.pointCloudColorSettingMin );
	view.lut = lut;

	var i = 0, i3 = 0;
	var temp_num_points = 0;
	for ( var k = 0; k < num_blocks; k ++) {
		temp_num_points  =  points_in_block[k];
		if (temp_num_points > 0){

			var x_start = view.systemSpatiallyResolvedData[k]['xPlot'];
			var y_start = view.systemSpatiallyResolvedData[k]['yPlot'];
			var z_start = view.systemSpatiallyResolvedData[k]['zPlot'];
			var x_end = x_start + 1;
			var y_end = y_start + 1;
			var z_end = z_start + 1;
			/*var x_start = view.systemSpatiallyResolvedData[k]['xPlot']-0.5;
			var y_start = view.systemSpatiallyResolvedData[k]['yPlot']-0.5;
			var z_start = view.systemSpatiallyResolvedData[k]['zPlot']-0.5;
			var x_end = x_start + 0.5;
			var y_end = y_start + 0.5;
			var z_end = z_start + 0.5;*/
			
			for (var j = 0; j < temp_num_points; j ++){

				var x = Math.random()*1  + x_start;
				var y = Math.random()*1  + y_start;
				var z = Math.random()*1  + z_start;
				
				positions[ i3 + 0 ] = x*10;
				positions[ i3 + 1 ] = y*10;
				positions[ i3 + 2 ] = z*10;

				var color = lut.getColor( view.systemSpatiallyResolvedData[k][options.propertyOfInterest] );
				
				colors[ i3 + 0 ] = color.r;
				colors[ i3 + 1 ] = color.g;
				colors[ i3 + 2 ] = color.b;

				if (view.frameBool){
					if (	(x_start >= options.x_low) 	&& (x_end <= options.x_high) 	&&
						(y_start >= options.y_low) 	&& (y_end <= options.y_high)	&&
						(z_start >= options.z_low) 	&& (z_end <= options.z_high)	&& 
						view.systemSpatiallyResolvedData[k].selected && view.systemSpatiallyResolvedData[k][view.frameProperty] == options.currentFrame)
						{
							alphas[ i ] = options.pointCloudAlpha;
							//if (options.animate) {sizes[ i ] = Math.random() *(options.pointCloudSize-0.5) + 0.5;}
							if (options.animate) {sizes[ i ] = Math.random() *options.pointCloudSize;}
							else { sizes[ i ] = options.pointCloudSize; }
							
						}
					else {
						alphas[ i ] = 0;
						sizes[ i ] = 0;
					}

					parentBlock[i] = k;
				}
				else{
				
					if (	(x_start >= options.x_low) 	&& (x_end <= options.x_high) 	&&
						(y_start >= options.y_low) 	&& (y_end <= options.y_high)	&&
						(z_start >= options.z_low) 	&& (z_end <= options.z_high)	&& view.systemSpatiallyResolvedData[k].selected)
						{
							alphas[ i ] = options.pointCloudAlpha;
							//if (options.animate) {sizes[ i ] = Math.random() *(options.pointCloudSize-0.5) + 0.5;}
							if (options.animate) {sizes[ i ] = Math.random() *options.pointCloudSize;}
							else { sizes[ i ] = options.pointCloudSize; }
							
						}
					else {
						alphas[ i ] = 0;
						sizes[ i ] = 0;
					}

					parentBlock[i] = k;
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
	geometry.parentBlockMap = parentBlock;

	var System = new THREE.Points( geometry, shaderMaterial );
	view.System = System;
	//console.log(System);
	scene.add( System );

	if (options.PBCBoolean){
		changePointCloudPeriodicReplicates(view);
	}

}


Float32Array.prototype.concat = function() {
	var bytesPerIndex = 4,
		buffers = Array.prototype.slice.call(arguments);
	
	// add self
	buffers.unshift(this);

	buffers = buffers.map(function (item) {
		if (item instanceof Float32Array) {
			return item.buffer;
		} else if (item instanceof ArrayBuffer) {
			if (item.byteLength / bytesPerIndex % 1 !== 0) {
				throw new Error('One of the ArrayBuffers is not from a Float32Array');	
			}
			return item;
		} else {
			throw new Error('You can only concat Float32Array, or ArrayBuffers');
		}
	});

	var concatenatedByteLength = buffers
		.map(function (a) {return a.byteLength;})
		.reduce(function (a,b) {return a + b;}, 0);

	var concatenatedArray = new Float32Array(concatenatedByteLength / bytesPerIndex);

	var offset = 0;
	buffers.forEach(function (buffer, index) {
		concatenatedArray.set(new Float32Array(buffer), offset);
		offset += buffer.byteLength / bytesPerIndex;
	});

	return concatenatedArray;
};


function getPositionArrayAfterTranslation(positions, count, x, y, z){
	var result = new Float32Array(count*3)
	for (var i = 0; i < count*3; i=i+3){
		result[i] = positions[i] + x;
		result[i+1] = positions[i + 1] + y;
		result[i+2] = positions[i + 2] + z;
	}
	return result;
}

export function addPointCloudPeriodicReplicates(view){

	var options = view.options;
	var scene = view.scene;
	var positions = view.System.geometry.attributes.position.array;
	var count = view.System.geometry.attributes.size.array.length;
	var colors = view.System.geometry.attributes.customColor.array;
	var sizes = view.System.geometry.attributes.size.array;
	var alphas = view.System.geometry.attributes.alpha.array;
	var shaderMaterial = view.System.material;


	var geometry = new THREE.BufferGeometry();
	var xStep = 10.0*(view.xPlotMax - view.xPlotMin);
	var yStep = 10.0*(view.yPlotMax - view.yPlotMin);
	var zStep = 10.0*(view.zPlotMax - view.zPlotMin);


	var x_start = -1 * ((options.xPBC-1)/2);
	var x_end = ((options.xPBC-1)/2) + 1;
	var y_start = -1 * ((options.yPBC-1)/2);
	var y_end = ((options.yPBC-1)/2) + 1;
	var z_start = -1 * ((options.zPBC-1)/2);
	var z_end = ((options.zPBC-1)/2) + 1;


	var replicatePositions = new Float32Array();
	var replicateColors = new Float32Array();
	var replicateSizes = new Float32Array();
	var replicateAlphas = new Float32Array();
	console.log('create replicates')
	console.log(replicatePositions instanceof Float32Array)
	console.log(positions instanceof Float32Array)

	for ( var i = x_start; i < x_end; i ++) {
		for ( var j = y_start; j < y_end; j ++) {
			for ( var k = z_start; k < z_end; k ++) {
				if (((i == 0) && (j == 0) && (k == 0)) == false) {
					var tempPositions = getPositionArrayAfterTranslation(positions, count, i*xStep, j*yStep, k*zStep);
					replicatePositions = replicatePositions.concat(tempPositions);
					replicateSizes = replicateSizes.concat(sizes);
					replicateAlphas = replicateAlphas.concat(alphas);
					replicateColors = replicateColors.concat(colors);
				}
			}
		}
	}

	geometry.addAttribute( 'position', new THREE.BufferAttribute( replicatePositions, 3 ) );
	geometry.addAttribute( 'customColor', new THREE.BufferAttribute( replicateColors, 3 ) );
	geometry.addAttribute( 'size', new THREE.BufferAttribute( replicateSizes, 1 ) );
	geometry.addAttribute( 'alpha', new THREE.BufferAttribute( replicateAlphas, 1 ) );

	var System = new THREE.Points( geometry, shaderMaterial );
	view.periodicReplicateSystems = System;
	scene.add( System );
}

export function updatePointCloudPeriodicReplicates(view){
	var replicateSystems = view.periodicReplicateSystems;

	var options = view.options;
	var scene = view.scene;
	var count = view.System.geometry.attributes.size.array.length;
	var colors = view.System.geometry.attributes.customColor.array;
	var sizes = view.System.geometry.attributes.size.array;
	var alphas = view.System.geometry.attributes.alpha.array;
	var shaderMaterial = view.System.material;


	var geometry = new THREE.BufferGeometry();
	var xStep = 10.0*(view.xPlotMax - view.xPlotMin);
	var yStep = 10.0*(view.yPlotMax - view.yPlotMin);
	var zStep = 10.0*(view.zPlotMax - view.zPlotMin);

	var x_start = -1 * ((options.xPBC-1)/2);
	var x_end = ((options.xPBC-1)/2) + 1;
	var y_start = -1 * ((options.yPBC-1)/2);
	var y_end = ((options.xPBC-1)/2) + 1;
	var z_start = -1 * ((options.zPBC-1)/2);
	var z_end = ((options.xPBC-1)/2) + 1;

	var replicateColors = new Float32Array();
	var replicateSizes = new Float32Array();
	var replicateAlphas = new Float32Array();

	for ( var i = x_start; i < x_end; i ++) {
		for ( var j = y_start; j < y_end; j ++) {
			for ( var k = z_start; k < z_end; k ++) {
				if (((i == 0) && (j == 0) && (k == 0)) == false) {
					replicateSizes = replicateSizes.concat(sizes);
					replicateAlphas = replicateAlphas.concat(alphas);
					replicateColors = replicateColors.concat(colors);
				}
			}
		}
	}

	view.periodicReplicateSystems.geometry.addAttribute( 'customColor', new THREE.BufferAttribute( replicateColors, 3 ) );
	view.periodicReplicateSystems.geometry.addAttribute( 'size', new THREE.BufferAttribute( replicateSizes, 1 ) );
	view.periodicReplicateSystems.geometry.addAttribute( 'alpha', new THREE.BufferAttribute( replicateAlphas, 1 ) );


}




export function updatePointCloudGeometry(view){

	var options = view.options;
	var positionArray = view.System.geometry.attributes.position.array;
	var parentBlock = view.System.geometry.parentBlockMap;


	var particles = options.pointCloudParticles;
	var num_blocks = view.systemSpatiallyResolvedData.length;
	var points_in_block = new Float32Array(num_blocks);
	var count = view.System.geometry.attributes.size.array.length;


	var colors = new Float32Array(count *3);
	var sizes = new Float32Array( count);
	var alphas = new Float32Array( count);

	var colorMap = options.colorMap;
	var numberOfColors = 512;

	var lut = new THREE.Lut( colorMap, numberOfColors );
	lut.setMax( options.pointCloudColorSettingMax );
	lut.setMin( options.pointCloudColorSettingMin );
	view.lut = lut;

	for (var i = 0, i3 = 0; i < count; i++){
		var x = positionArray[ i3 + 0 ]/10;
		var y = positionArray[ i3 + 1 ]/10;
		var z = positionArray[ i3 + 2 ]/10;
		var k = parentBlock[i];

		var color = lut.getColor( view.systemSpatiallyResolvedData[k][options.propertyOfInterest] );
				
		colors[ i3 + 0 ] = color.r;
		colors[ i3 + 1 ] = color.g;
		colors[ i3 + 2 ] = color.b;

		if (view.frameBool){
			if (	(x >= options.x_low) 	&& (x <= options.x_high) 	&&
					(y >= options.y_low) 	&& (y <= options.y_high)	&&
					(z >= options.z_low) 	&& (z <= options.z_high)	&&  
				view.systemSpatiallyResolvedData[k].selected && view.systemSpatiallyResolvedData[k][view.frameProperty] == options.currentFrame)
			{
				alphas[ i ] = options.pointCloudAlpha;
			//if (options.animate) {sizes[ i ] = Math.random() *(options.pointCloudSize-0.5) + 0.5;}
				if (options.animate) {sizes[ i ] = Math.random() *options.pointCloudSize;}
				else { sizes[ i ] = options.pointCloudSize; }
				
			}
			else {
				alphas[ i ] = 0;
				sizes[ i ] = 0;
			}
		}
		else{
		
			if (	(x >= options.x_low) 	&& (x <= options.x_high) 	&&
					(y >= options.y_low) 	&& (y <= options.y_high)	&&
					(z >= options.z_low) 	&& (z <= options.z_high)	&& 	view.systemSpatiallyResolvedData[k].selected)
			{
				alphas[ i ] = options.pointCloudAlpha;
				//if (options.animate) {sizes[ i ] = Math.random() *(options.pointCloudSize-0.5) + 0.5;}
				if (options.animate) {sizes[ i ] = Math.random() *options.pointCloudSize;}
				else { sizes[ i ] = options.pointCloudSize; }
			}
			else {
				alphas[ i ] = 0;
				sizes[ i ] = 0;
			}
		}
		i3 += 3;

	}

	view.System.geometry.addAttribute( 'customColor', new THREE.BufferAttribute( colors, 3 ) );
	view.System.geometry.addAttribute( 'size', new THREE.BufferAttribute( sizes, 1 ) );
	view.System.geometry.addAttribute( 'alpha', new THREE.BufferAttribute( alphas, 1 ) );

	if (options.PBCBoolean){
		updatePointCloudPeriodicReplicates(view);
	}
}



export function animatePointCloudGeometry(view){
	//console.log('updated')

	var options = view.options;
	var positionArray = view.System.geometry.attributes.position.array;
	var sizeArray = view.System.geometry.attributes.size.array;
	var parentBlock = view.System.geometry.parentBlockMap;


	var particles = options.pointCloudParticles;
	var num_blocks = view.systemSpatiallyResolvedData.length;
	var points_in_block = new Float32Array(num_blocks);
	var count = view.System.geometry.attributes.size.array.length;


	//var colors = new Float32Array(count *3);
	var sizes = new Float32Array( count);

	for (var i = 0, i3 = 0; i < count; i++){
		var x = positionArray[ i3 + 0 ]/10;
		var y = positionArray[ i3 + 1 ]/10;
		var z = positionArray[ i3 + 2 ]/10;
		var k = parentBlock[i];

		if (view.frameBool){
			if (	(x_start >= options.x_low) 	&& (x_end <= options.x_high) 	&&
				(y_start >= options.y_low) 	&& (y_end <= options.y_high)	&&
				(z_start >= options.z_low) 	&& (z_end <= options.z_high)	&& 
				view.systemSpatiallyResolvedData[k].selected && view.systemSpatiallyResolvedData[k][view.frameProperty] == options.currentFrame)
			{
				var temp = sizeArray[i]-0.1;
				if (temp >= 0.0) {sizeArray[i] = temp;}
				else {sizeArray[i] = options.pointCloudSize;}
			}
			else {
				sizes[ i ] = 0;
			}

			parentBlock[i] = k;
		}
		else{
		
			if (	(x >= options.x_low) 	&& (x <= options.x_high) 	&&
					(y >= options.y_low) 	&& (y <= options.y_high)	&&
					(z >= options.z_low) 	&& (z <= options.z_high)	&& 	view.systemSpatiallyResolvedData[k].selected)
			{
				var temp = sizeArray[i]-0.1;
				if (temp >= 0.0) {sizeArray[i] = temp;}
				else {sizeArray[i] = options.pointCloudSize;}
			}
			else {
				sizes[ i ] = 0;
			}

		}
		i3 += 3;

	}
}

export function removePointCloudGeometry(view){
	view.scene.remove(view.System);
	if (view.System != null ){
		view.scene.remove(view.System);
		delete view.System;
	}
}


export function removePointCloudPeriodicReplicates(view){
	view.scene.remove(view.periodicReplicateSystems);
	if (view.periodicReplicateSystems != null ){
		view.scene.remove(view.periodicReplicateSystems);
		delete view.periodicReplicateSystems;
	}
}

export function changePointCloudGeometry(view){
	removePointCloudGeometry(view);
	getPointCloudGeometry(view);

}

export function changePointCloudPeriodicReplicates(view){
	//if (view.periodicReplicateSystems != null ){removePointCloudPeriodicReplicates(view)}
	removePointCloudPeriodicReplicates(view);
	addPointCloudPeriodicReplicates(view);
}