import {uniforms, shaderMaterial} from "./PointCloudMaterials.js";

export function getPointCloudGeometry(view){



	var options = view.options;
	var scene = view.scene;
	var currentFrame = options.currentFrame.toString();
	var spatiallyResolvedData = view.systemSpatiallyResolvedDataFramed[currentFrame];

	var particles = options.pointCloudParticles;
	var num_blocks = view.systemSpatiallyResolvedData.length;
	var points_in_block = new Float32Array(num_blocks);
	var total = Math.pow(10,options.pointCloudTotalMagnitude);
	var count = 0;

	for ( var k = 0; k < num_blocks; k ++) {
		var num_points  = Math.min(Math.floor((spatiallyResolvedData[k][options.density] / total) * particles), options.pointCloudMaxPointPerBlock);
		points_in_block[k] = num_points;
		count += num_points;
	}
	console.log("total points in cloud: ", count)

	

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

			var x_start = spatiallyResolvedData[k]['xPlot'] - 0.5;
			var y_start = spatiallyResolvedData[k]['yPlot'] - 0.5;
			var z_start = spatiallyResolvedData[k]['zPlot'] - 0.5;
			var x_end = x_start + 1;
			var y_end = y_start + 1;
			var z_end = z_start + 1;
			
			for (var j = 0; j < temp_num_points; j ++){

				var x = Math.random()  + x_start;
				var y = Math.random()  + y_start;
				var z = Math.random()  + z_start;
				
				positions[ i3 + 0 ] = x;
				positions[ i3 + 1 ] = y;
				positions[ i3 + 2 ] = z;

				var color = lut.getColor( spatiallyResolvedData[k][options.propertyOfInterest] );
				
				colors[ i3 + 0 ] = color.r;
				colors[ i3 + 1 ] = color.g;
				colors[ i3 + 2 ] = color.b;
				
				if (	(x_start >= options.x_low) 	&& (x_end <= options.x_high) 	&&
					(y_start >= options.y_low) 	&& (y_end <= options.y_high)	&&
					(z_start >= options.z_low) 	&& (z_end <= options.z_high)	&& spatiallyResolvedData[k].selected)
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
				
				i++;
				i3+=3;
			}
		}			
	}

	
	/*if (options.PBCBoolean){
		var xStep = 10.0*(view.xPlotMax - view.xPlotMin);
		var yStep = 10.0*(view.yPlotMax - view.yPlotMin);
		var zStep = 10.0*(view.zPlotMax - view.zPlotMin);

		var x_start = -1 * ((options.xPBC-1)/2);
		var x_end = ((options.xPBC-1)/2) + 1;
		var y_start = -1 * ((options.yPBC-1)/2);
		var y_end = ((options.yPBC-1)/2) + 1;
		var z_start = -1 * ((options.zPBC-1)/2);
		var z_end = ((options.zPBC-1)/2) + 1;
		
		var sumDisplacement = [];
		for ( var i = x_start; i < x_end; i ++) {
			for ( var j = y_start; j < y_end; j ++) {
				for ( var k = z_start; k < z_end; k ++) {
					sumDisplacement.push(i*xStep, j*yStep, k*zStep);
				}
			}
		}
	} else {
		var sumDisplacement = [0.0, 0.0, 0.0];
	}
	

	var geometry = new THREE.InstancedBufferGeometry();
	geometry.setAttribute( 'position', new THREE.BufferAttribute( positions, 3 ) );
	geometry.setAttribute( 'customColor', new THREE.BufferAttribute( colors, 3 ) );
	geometry.setAttribute( 'size', new THREE.BufferAttribute( sizes, 1 ) );
	geometry.setAttribute( 'alpha', new THREE.BufferAttribute( alphas, 1 ) );
	geometry.parentBlockMap = parentBlock;
	console.log(sumDisplacement);
	const sumDisp = new Float32Array(sumDisplacement);
	geometry.setAttribute('offset', new THREE.InstancedBufferAttribute(sumDisp, 3 ));

	var System = new THREE.Mesh( geometry, shaderMaterial );
	System.frustumCulled = false
	view.System = System;
	scene.add( System );*/

	var geometry = new THREE.BufferGeometry();
	geometry.setAttribute( 'position', new THREE.BufferAttribute( positions, 3 ) );
	geometry.setAttribute( 'customColor', new THREE.BufferAttribute( colors, 3 ) );
	geometry.setAttribute( 'size', new THREE.BufferAttribute( sizes, 1 ) );
	geometry.setAttribute( 'alpha', new THREE.BufferAttribute( alphas, 1 ) );
	geometry.parentBlockMap = parentBlock;

	var System = new THREE.Points( geometry, shaderMaterial );
	view.System = System;
	//console.log(System);
	scene.add( System );

	if (options.PBCBoolean){
		changePointCloudPeriodicReplicates(view);
	}

}

/*
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
*/

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
	var system = view.System;

	var shaderMaterial = view.System.material;


	//var geometry = new THREE.BufferGeometry();
	var xStep = (view.xPlotMax - view.xPlotMin);
	var yStep = (view.yPlotMax - view.yPlotMin);
	var zStep = (view.zPlotMax - view.zPlotMin);


	var x_start = -1 * ((options.xPBC-1)/2);
	var x_end = ((options.xPBC-1)/2) + 1;
	var y_start = -1 * ((options.yPBC-1)/2);
	var y_end = ((options.yPBC-1)/2) + 1;
	var z_start = -1 * ((options.zPBC-1)/2);
	var z_end = ((options.zPBC-1)/2) + 1;


	var periodicReplicateSystemGroup = new THREE.Group();

	
	console.log('create replicates')

	for ( var i = x_start; i < x_end; i ++) {
		for ( var j = y_start; j < y_end; j ++) {
			for ( var k = z_start; k < z_end; k ++) {
				if (!((i == 0) && (j == 0) && (k == 0))) {
					console.log(i,j,k);
					var tempSystemReplica = system.clone();
					tempSystemReplica.position.set(i*xStep, j*yStep, k*zStep); 
					periodicReplicateSystemGroup.add(tempSystemReplica);
				}
			}
		}
	}
	view.periodicReplicateSystems = periodicReplicateSystemGroup;
	scene.add(periodicReplicateSystemGroup);

	/*var options = view.options;
	var system = view.System;

	var xStep = 10.0*(view.xPlotMax - view.xPlotMin);
	var yStep = 10.0*(view.yPlotMax - view.yPlotMin);
	var zStep = 10.0*(view.zPlotMax - view.zPlotMin);


	var x_start = -1 * ((options.xPBC-1)/2);
	var x_end = ((options.xPBC-1)/2) + 1;
	var y_start = -1 * ((options.yPBC-1)/2);
	var y_end = ((options.yPBC-1)/2) + 1;
	var z_start = -1 * ((options.zPBC-1)/2);
	var z_end = ((options.zPBC-1)/2) + 1;

	const sumDisplacement = []
	for ( var i = x_start; i < x_end; i ++) {
		for ( var j = y_start; j < y_end; j ++) {
			for ( var k = z_start; k < z_end; k ++) {
				sumDisplacement.push(i*xStep, j*yStep, k*zStep);
			}
		}
	}
	console.log(sumDisplacement);
	const sumDisp = new Float32Array(sumDisplacement);
	system.geometry.setAttribute('offset', new THREE.InstancedBufferAttribute(sumDisp, 3 ));*/

}




export function updatePointCloudGeometry(view){

	var options = view.options;
	var positionArray = view.System.geometry.attributes.position.array;
	var parentBlock = view.System.geometry.parentBlockMap;
	var currentFrame = options.currentFrame.toString();
	var spatiallyResolvedData = view.systemSpatiallyResolvedDataFramed[currentFrame];

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

		var color = lut.getColor( spatiallyResolvedData[k][options.propertyOfInterest] );
				
		colors[ i3 + 0 ] = color.r;
		colors[ i3 + 1 ] = color.g;
		colors[ i3 + 2 ] = color.b;

		if (	(x >= options.x_low) 	&& (x <= options.x_high) 	&&
				(y >= options.y_low) 	&& (y <= options.y_high)	&&
				(z >= options.z_low) 	&& (z <= options.z_high)	&& 	spatiallyResolvedData[k].selected)
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
		i3 += 3;

	}

	view.System.geometry.setAttribute( 'customColor', new THREE.BufferAttribute( colors, 3 ) );
	view.System.geometry.setAttribute( 'size', new THREE.BufferAttribute( sizes, 1 ) );
	view.System.geometry.setAttribute( 'alpha', new THREE.BufferAttribute( alphas, 1 ) );

	if (options.PBCBoolean){
		changePointCloudPeriodicReplicates(view);
	}
}



export function animatePointCloudGeometry(view){
	//console.log('updated')

	var options = view.options;

	var currentFrame = options.currentFrame.toString();
	var spatiallyResolvedData = view.systemSpatiallyResolvedDataFramed[currentFrame];
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
	
		if (	(x >= options.x_low) 	&& (x <= options.x_high) 	&&
				(y >= options.y_low) 	&& (y <= options.y_high)	&&
				(z >= options.z_low) 	&& (z <= options.z_high)	&& 	spatiallyResolvedData[k].selected)
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