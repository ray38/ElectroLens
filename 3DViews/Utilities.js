export function getOffsetArray(systemDimension, latticeVectors, options) {

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
	
	var counter = 0;
	var sumDisplacement = new Float32Array(9 * 9 * 9 * 3);
	sumDisplacement.fill(0);
	var xStep, yStep, zStep;
	for ( var i = x_start; i < x_end; i ++) {
		for ( var j = y_start; j < y_end; j ++) {
			for ( var k = z_start; k < z_end; k ++) {
				xStep = i * dim1Step.x + j * dim2Step.x + k * dim3Step.x;
				yStep = i * dim1Step.y + j * dim2Step.y + k * dim3Step.y;
				zStep = i * dim1Step.z + j * dim2Step.z + k * dim3Step.z;
				
				sumDisplacement[counter * 3 + 0] = xStep;
				sumDisplacement[counter * 3 + 1] = yStep;
				sumDisplacement[counter * 3 + 2] = zStep;
				counter++;
			}
		}
	}
	return {sumDisplacement, counter};
}

export function updateOffsetArray(systemDimension, latticeVectors, geometry, options) {
	var sumDisplacement = geometry.attributes.offset.array;

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

	
	var xStep, yStep, zStep;

	var counter = 0;
	for ( var i = x_start; i < x_end; i ++) {
		for ( var j = y_start; j < y_end; j ++) {
			for ( var k = z_start; k < z_end; k ++) {
				xStep = i * dim1Step.x + j * dim2Step.x + k * dim3Step.x;
				yStep = i * dim1Step.y + j * dim2Step.y + k * dim3Step.y;
				zStep = i * dim1Step.z + j * dim2Step.z + k * dim3Step.z;
				
				sumDisplacement[counter * 3 + 0] = xStep;
				sumDisplacement[counter * 3 + 1] = yStep;
				sumDisplacement[counter * 3 + 2] = zStep;
				counter++;
			}
		}
	}
	geometry.attributes.offset.needsUpdate = true;
	geometry.maxInstancedCount = counter;
	

}

function changeGeometry(options){
	scene.remove(System);
	System = getGeometry(options);
	scene.add( System );
}



function getGeometry(options){
	var temp;
	if (options.view == 'pointCloud'){
		temp = getPointCloudGeometry(options);
	}
	else if (options.view == 'box'){
		temp = getBoxGeometry(options);
	}
	else if (options.view == 'pointMatrix'){
		temp = getPointMatrixGeometry(options);
	}
	else {
		temp = getPointCloudGeometry(options);
	}

	return temp
}

function updateGeometry(options){
	if (options.view == 'pointCloud'){
		updatePointCloudGeometry(options);
	}
	else if (options.view == 'box'){
		changeGeometry(options)
	}
	else if (options.view == 'pointMatrix'){
		updatePointMatrixGeometry(options);
	}
	else {
		updatePointCloudGeometry(options);
	}

}

function updateOptionFilenames() {
	options.dataFilename = "data/" + options.moleculeName + "_B3LYP_0_0_0_all_descriptors.csv";
	console.log(options.densityFilename, options.targetFilename);
}