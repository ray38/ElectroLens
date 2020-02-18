import {getPointCloudMaterialInstanced} from "./Materials.js";
import {getOffsetArray, updateOffsetArray} from "./Utilities.js";

export function getPointCloudGeometry(view){

	var gridSpacing = view.spatiallyResolvedData.gridSpacing;
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
		points_in_block[k] = num_points;
		count += num_points;
	}
	console.log("total points in cloud: ", count)

	

	var positions = new Float32Array(count*3);
	var colors = new Float32Array(count *3);
	var sizes = new Float32Array( count);
	var alphas = new Float32Array( count);
	var selections = new Float32Array( count);
	selections.fill(1);
	// var parentBlock = new Float32Array( count);
	var voxelPointDict = {};
	var pointVoxelMap = new Uint32Array(count);

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
		voxelPointDict[ k ] = [];
		if (temp_num_points > 0){
			
			for (var j = 0; j < temp_num_points; j ++){

				xTempBeforeTransform = (Math.random() - 0.5) * gridSpacing.x;
				yTempBeforeTransform = (Math.random() - 0.5) * gridSpacing.y;
				zTempBeforeTransform = (Math.random() - 0.5) * gridSpacing.z;

				x = latticeVectors.u11 * xTempBeforeTransform + latticeVectors.u21 * yTempBeforeTransform + latticeVectors.u31 * zTempBeforeTransform + spatiallyResolvedData[k].x;
				y = latticeVectors.u12 * xTempBeforeTransform + latticeVectors.u22 * yTempBeforeTransform + latticeVectors.u32 * zTempBeforeTransform + spatiallyResolvedData[k].y;
				z = latticeVectors.u13 * xTempBeforeTransform + latticeVectors.u23 * yTempBeforeTransform + latticeVectors.u33 * zTempBeforeTransform + spatiallyResolvedData[k].z;
				
				positions[ i3 + 0 ] = x;
				positions[ i3 + 1 ] = y;
				positions[ i3 + 2 ] = z;

				color = lut.getColor( spatiallyResolvedData[k][options.propertyOfInterest] );
				
				colors[ i3 + 0 ] = color.r;
				colors[ i3 + 1 ] = color.g;
				colors[ i3 + 2 ] = color.b;

				/*if (spatiallyResolvedData[k].highlighted) {
					sizes[ i ] = options.pointCloudSize * 3;
					alphas[ i ] = 1;
				} else if (spatiallyResolvedData[k].selected){
					alphas[ i ] = options.pointCloudAlpha;
					if (options.animate) {
						sizes[ i ] = Math.random() * options.pointCloudSize;
					} else { 
						sizes[ i ] = options.pointCloudSize; 
					}
				} else {
					alphas[ i ] = 0;
					sizes[ i ] = 0;
				}*/

				if (spatiallyResolvedData[k].highlighted) {
					sizes[ i ] = options.pointCloudSize * 3;
					alphas[ i ] = 1;
				} else {
					// not highlighted
					alphas[ i ] = options.pointCloudAlpha;
					sizes[ i ] = options.pointCloudSize; 
					if (!spatiallyResolvedData[k].selected){
						// not highlighted and not selected
						selections[i] = 0;
					}
				}

				// parentBlock[i] = k;
				pointVoxelMap[ i ] = k;
				voxelPointDict[k].push(i);
				i++;
				i3+=3;
			}
		}			
	}

	
	var geometry = new THREE.InstancedBufferGeometry();
	geometry.setAttribute( 'position', new THREE.BufferAttribute( positions, 3 ) );
	geometry.setAttribute( 'customColor', new THREE.BufferAttribute( colors, 3 ) );
	geometry.setAttribute( 'size', new THREE.BufferAttribute( sizes, 1 ) );
	geometry.setAttribute( 'alpha', new THREE.BufferAttribute( alphas, 1 ) );
	geometry.setAttribute( 'selection', new THREE.BufferAttribute( selections, 1 ) );
	// geometry.parentBlockMap = parentBlock;
	var offsetResult = getOffsetArray(systemDimension, latticeVectors, options);
	geometry.setAttribute('offset', new THREE.InstancedBufferAttribute(offsetResult.sumDisplacement, 3 ));
	geometry.maxInstancedCount = offsetResult.counter;

	var System = new THREE.Points( geometry, getPointCloudMaterialInstanced(options) );
	System.userData.pointVoxelMap = pointVoxelMap;
	System.userData.voxelPointDict = voxelPointDict;
	System.frustumCulled = false;
	view.System = System;
	view.pointVoxelMap = pointVoxelMap;

	scene.add( System );
}


export function updatePointCloudGeometry(view){

	var options = view.options;
	// var parentBlock = view.System.geometry.parentBlockMap;
	var pointVoxelMap = view.System.userData.pointVoxelMap ;
	var currentFrame = options.currentFrame.toString();
	var spatiallyResolvedData = view.systemSpatiallyResolvedDataFramed[currentFrame];
	var positionArray = view.System.geometry.attributes.position.array;

	var count = view.System.geometry.attributes.size.array.length;


	var colors = new Float32Array(count *3);
	var sizes = new Float32Array( count);
	var alphas = new Float32Array( count);
	var selections = new Float32Array( count);
	selections.fill(1);

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
		var k = pointVoxelMap[i];

		var color = lut.getColor( spatiallyResolvedData[k][options.propertyOfInterest] );
				
		colors[ i3 + 0 ] = color.r;
		colors[ i3 + 1 ] = color.g;
		colors[ i3 + 2 ] = color.b;

		/*if (spatiallyResolvedData[k].highlighted) {
			// console.log('found highlighted point', k );
			sizes[ i ] = options.pointCloudSize * 3;
			alphas[ i ] = 1;
		} else if (spatiallyResolvedData[k].selected){
			alphas[ i ] = options.pointCloudAlpha;
			if (options.animate) {
				sizes[ i ] = Math.random() * options.pointCloudSize;
			} else { 
				sizes[ i ] = options.pointCloudSize; 
			}
		} else {
			alphas[ i ] = 0;
			sizes[ i ] = 0;
		}*/

		if (spatiallyResolvedData[k].highlighted) {
			sizes[ i ] = options.pointCloudSize * 3;
			alphas[ i ] = 1;
		} else {
			// not highlighted
			alphas[ i ] = options.pointCloudAlpha;
			sizes[ i ] = options.pointCloudSize; 
			if (!spatiallyResolvedData[k].selected){
				// not highlighted and not selected
				selections[i] = 0;
			}
		}
		i3 += 3;

	}

	view.System.geometry.setAttribute( 'customColor', new THREE.BufferAttribute( colors, 3 ) );
	view.System.geometry.setAttribute( 'size', new THREE.BufferAttribute( sizes, 1 ) );
	view.System.geometry.setAttribute( 'alpha', new THREE.BufferAttribute( alphas, 1 ) );
	view.System.geometry.setAttribute( 'selection', new THREE.BufferAttribute( selections, 1 ) );

	var systemDimension = view.systemDimension;
	var latticeVectors = view.systemLatticeVectors;

	updateOffsetArray(systemDimension, latticeVectors, view.System.geometry, options);

	view.System.material.uniforms.xClippingPlaneMax.value = options.x_high;
	view.System.material.uniforms.xClippingPlaneMin.value = options.x_low;
	view.System.material.uniforms.yClippingPlaneMax.value = options.y_high;
	view.System.material.uniforms.yClippingPlaneMin.value = options.y_low;
	view.System.material.uniforms.zClippingPlaneMax.value = options.z_high;
	view.System.material.uniforms.zClippingPlaneMin.value = options.z_low;

}



/* export function animatePointCloudGeometry(view){
	//console.log('updated')

	var options = view.options;

	var currentFrame = options.currentFrame.toString();
	var spatiallyResolvedData = view.systemSpatiallyResolvedDataFramed[currentFrame];
	var positionArray = view.System.geometry.attributes.position.array;
	var sizeArray = view.System.geometry.attributes.size.array;
	// var parentBlock = view.System.geometry.parentBlockMap;
	var pointVoxelMap = view.System.userData.pointVoxelMap ;


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
		var k = pointVoxelMap[i];
	
		if ( spatiallyResolvedData[k].selected)
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

	
} */

export function removePointCloudGeometry(view){
	view.scene.remove(view.System);
	if (view.System != null ){
		view.scene.remove(view.System);
		delete view.System;
	}
}


export function changePointCloudGeometry(view){
	removePointCloudGeometry(view);
	getPointCloudGeometry(view);

}
