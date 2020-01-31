import {pointCloudMaterial, pointCloudMaterialInstanced} from "./Materials.js/index.js";

export function getPointCloudGeometry(view){

	var gridSpacing = view.spatiallyResolvedData.gridSpacing;
	var systemLatticeVectors = view.systemLatticeVectors;
	var systemDimension = view.systemDimension;
	var latticeVectors = view.systemLatticeVectors;

	var options = view.options;
	var scene = view.scene;
	var currentFrame = options.currentFrame.toString();
	var spatiallyResolvedData = view.systemSpatiallyResolvedDataFramed[currentFrame];

	var num_blocks = view.systemSpatiallyResolvedData.length;
	var points_in_block = new Float32Array(num_blocks);
	var pointCloudDensity = Math.pow(10,options.pointCloudTotalMagnitude) * options.pointCloudParticles;
	var count = 0;

	var voxelVolume = gridSpacing.x * gridSpacing.y * gridSpacing.z

	for ( var k = 0; k < num_blocks; k ++) {
		var num_points  = Math.min(Math.floor(spatiallyResolvedData[k][options.density] * pointCloudDensity * voxelVolume), options.pointCloudMaxPointPerBlock);
		// var num_points  = Math.min(Math.floor((spatiallyResolvedData[k][options.density] / total) * particles), options.pointCloudMaxPointPerBlock);
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

	var xTempBeforeTransform, yTempBeforeTransform, zTempBeforeTransform, x, y, z, color;
	for ( var k = 0; k < num_blocks; k ++) {
		temp_num_points  =  points_in_block[k];
		if (temp_num_points > 0){
			
			for (var j = 0; j < temp_num_points; j ++){

				xTempBeforeTransform = (Math.random() - 0.5) * gridSpacing.x;
				yTempBeforeTransform = (Math.random() - 0.5) * gridSpacing.y;
				zTempBeforeTransform = (Math.random() - 0.5) * gridSpacing.z;

				x = systemLatticeVectors.u11 * xTempBeforeTransform + systemLatticeVectors.u21 * yTempBeforeTransform + systemLatticeVectors.u31 * zTempBeforeTransform + spatiallyResolvedData[k].x;
				y = systemLatticeVectors.u12 * xTempBeforeTransform + systemLatticeVectors.u22 * yTempBeforeTransform + systemLatticeVectors.u32 * zTempBeforeTransform + spatiallyResolvedData[k].y;
				z = systemLatticeVectors.u13 * xTempBeforeTransform + systemLatticeVectors.u23 * yTempBeforeTransform + systemLatticeVectors.u33 * zTempBeforeTransform + spatiallyResolvedData[k].z;
				
				positions[ i3 + 0 ] = x;
				positions[ i3 + 1 ] = y;
				positions[ i3 + 2 ] = z;

				color = lut.getColor( spatiallyResolvedData[k][options.propertyOfInterest] );
				
				colors[ i3 + 0 ] = color.r;
				colors[ i3 + 1 ] = color.g;
				colors[ i3 + 2 ] = color.b;
				
				if (	(x >= options.x_low) 	&& (x <= options.x_high) 	&&
						(y >= options.y_low) 	&& (y <= options.y_high)	&&
						(z >= options.z_low) 	&& (z <= options.z_high)	&& spatiallyResolvedData[k].selected)
					{
						alphas[ i ] = options.pointCloudAlpha;
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

	
	var dim1Step = {'x': systemDimension.x * latticeVectors.u11, 
					'y': systemDimension.x * latticeVectors.u12, 
					'z': systemDimension.x * latticeVectors.u13};
	var dim2Step = {'x': systemDimension.y * latticeVectors.u21, 
					'y': systemDimension.y * latticeVectors.u22, 
					'z': systemDimension.y * latticeVectors.u23};
	var dim3Step = {'x': systemDimension.z * latticeVectors.u31, 
					'y': systemDimension.z * latticeVectors.u32, 
					'z': systemDimension.z * latticeVectors.u33};
	
	
	var x_start = -1 * ((options.xPBC-1)/2);
	var x_end = ((options.xPBC-1)/2) + 1;
	var y_start = -1 * ((options.yPBC-1)/2);
	var y_end = ((options.yPBC-1)/2) + 1;
	var z_start = -1 * ((options.zPBC-1)/2);
	var z_end = ((options.zPBC-1)/2) + 1;
	
	var xStep, yStep, zStep;
	var sumDisplacement = [];
	for ( var i = x_start; i < x_end; i ++) {
		for ( var j = y_start; j < y_end; j ++) {
			for ( var k = z_start; k < z_end; k ++) {
				xStep = i * dim1Step.x + j * dim2Step.x + k * dim3Step.x;
				yStep = i * dim1Step.y + j * dim2Step.y + k * dim3Step.y;
				zStep = i * dim1Step.z + j * dim2Step.z + k * dim3Step.z;
				
				sumDisplacement.push(xStep, yStep, zStep);
			}
		}
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

	var System = new THREE.Points( geometry, pointCloudMaterialInstanced );
	System.frustumCulled = false
	view.System = System;
	scene.add( System );

	/* var geometry = new THREE.BufferGeometry();
	geometry.setAttribute( 'position', new THREE.BufferAttribute( positions, 3 ) );
	geometry.setAttribute( 'customColor', new THREE.BufferAttribute( colors, 3 ) );
	geometry.setAttribute( 'size', new THREE.BufferAttribute( sizes, 1 ) );
	geometry.setAttribute( 'alpha', new THREE.BufferAttribute( alphas, 1 ) );
	geometry.parentBlockMap = parentBlock;

	var System = new THREE.Points( geometry, shaderMaterial );
	view.System = System;
	scene.add( System );

	if (options.PBCBoolean){
		changePointCloudPeriodicReplicates(view);
	}
 */
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

	var systemDimension = view.systemDimension;
	var latticeVectors = view.systemLatticeVectors;

	var options = view.options;
	var system = view.System;

	var x_start = -1 * ((options.xPBC-1)/2);
	var x_end = ((options.xPBC-1)/2) + 1;
	var y_start = -1 * ((options.yPBC-1)/2);
	var y_end = ((options.yPBC-1)/2) + 1;
	var z_start = -1 * ((options.zPBC-1)/2);
	var z_end = ((options.zPBC-1)/2) + 1;

	var dim1Step = {'x': systemDimension.x * latticeVectors.u11, 
					'y': systemDimension.x * latticeVectors.u12, 
					'z': systemDimension.x * latticeVectors.u13};
	var dim2Step = {'x': systemDimension.y * latticeVectors.u21, 
					'y': systemDimension.y * latticeVectors.u22, 
					'z': systemDimension.y * latticeVectors.u23};
	var dim3Step = {'x': systemDimension.z * latticeVectors.u31, 
					'y': systemDimension.z * latticeVectors.u32, 
					'z': systemDimension.z * latticeVectors.u33};

// 	var periodicReplicateSystemGroup = new THREE.Group();
	
	var xStep, yStep, zStep;

	const sumDisplacement = []
	for ( var i = x_start; i < x_end; i ++) {
		for ( var j = y_start; j < y_end; j ++) {
			for ( var k = z_start; k < z_end; k ++) {
				xStep = i * dim1Step.x + j * dim2Step.x + k * dim3Step.x;
				yStep = i * dim1Step.y + j * dim2Step.y + k * dim3Step.y;
				zStep = i * dim1Step.z + j * dim2Step.z + k * dim3Step.z;
				
				sumDisplacement.push(xStep, yStep, zStep); 
			}
		}
	}
	console.log(sumDisplacement);
	const sumDisp = new Float32Array(sumDisplacement);
	system.geometry.setAttribute('offset', new THREE.InstancedBufferAttribute(sumDisp, 3 ));

	/*for ( var i = x_start; i < x_end; i ++) {
		for ( var j = y_start; j < y_end; j ++) {
			for ( var k = z_start; k < z_end; k ++) {
				if (!((i == 0) && (j == 0) && (k == 0))) {
					var tempSystemReplica = system.clone();
					xStep = i * dim1Step.x + j * dim2Step.x + k * dim3Step.x;
					yStep = i * dim1Step.y + j * dim2Step.y + k * dim3Step.y;
					zStep = i * dim1Step.z + j * dim2Step.z + k * dim3Step.z;
					
					tempSystemReplica.position.set(xStep, yStep, zStep); 
					periodicReplicateSystemGroup.add(tempSystemReplica);
				}
			}
		}
	}
	view.periodicReplicateSystems = periodicReplicateSystemGroup;
	scene.add(periodicReplicateSystemGroup);*/

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
	var parentBlock = view.System.geometry.parentBlockMap;
	var currentFrame = options.currentFrame.toString();
	var spatiallyResolvedData = view.systemSpatiallyResolvedDataFramed[currentFrame];
	var positionArray = view.System.geometry.attributes.position.array;

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
		var x = positionArray[i3 + 0];
		var y = positionArray[i3 + 1];
		var z = positionArray[i3 + 2];
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

	var systemDimension = view.systemDimension;
	var latticeVectors = view.systemLatticeVectors;

	var x_start = -1 * ((options.xPBC-1)/2);
	var x_end = ((options.xPBC-1)/2) + 1;
	var y_start = -1 * ((options.yPBC-1)/2);
	var y_end = ((options.yPBC-1)/2) + 1;
	var z_start = -1 * ((options.zPBC-1)/2);
	var z_end = ((options.zPBC-1)/2) + 1;

	var dim1Step = {'x': systemDimension.x * latticeVectors.u11, 
					'y': systemDimension.x * latticeVectors.u12, 
					'z': systemDimension.x * latticeVectors.u13};
	var dim2Step = {'x': systemDimension.y * latticeVectors.u21, 
					'y': systemDimension.y * latticeVectors.u22, 
					'z': systemDimension.y * latticeVectors.u23};
	var dim3Step = {'x': systemDimension.z * latticeVectors.u31, 
					'y': systemDimension.z * latticeVectors.u32, 
					'z': systemDimension.z * latticeVectors.u33};

// 	var periodicReplicateSystemGroup = new THREE.Group();
	
	var xStep, yStep, zStep;

	const sumDisplacement = []
	for ( var i = x_start; i < x_end; i ++) {
		for ( var j = y_start; j < y_end; j ++) {
			for ( var k = z_start; k < z_end; k ++) {
				xStep = i * dim1Step.x + j * dim2Step.x + k * dim3Step.x;
				yStep = i * dim1Step.y + j * dim2Step.y + k * dim3Step.y;
				zStep = i * dim1Step.z + j * dim2Step.z + k * dim3Step.z;
				
				sumDisplacement.push(xStep, yStep, zStep); 
			}
		}
	}
	console.log(sumDisplacement);
	const sumDisp = new Float32Array(sumDisplacement);
	view.System.geometry.setAttribute('offset', new THREE.InstancedBufferAttribute(sumDisp, 3 ));

	// if (options.PBCBoolean){
	// 	changePointCloudPeriodicReplicates(view);
	// }
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