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


export function getPeriodicReplicatesInstancesMolecule(unitCellScaleArr, unitCellOffsetArr, unitCellColorArr, unitCellSelectionArr,  unitCellIndexArr, systemDimension, latticeVectors, options) {
	var sumScaleArr = new Float32Array(unitCellScaleArr.length * 9 * 9 * 9);
	var sumOffsetArr = new Float32Array(unitCellOffsetArr.length * 9 * 9 * 9);
	var sumColorArr = new Float32Array(unitCellColorArr.length * 9 * 9 * 9);
	var sumSelectionArr = new Float32Array(unitCellSelectionArr.length * 9 * 9 * 9);
	var sumIndexArr = new Float32Array(unitCellIndexArr.length * 9 * 9 * 9);
	

	var numInstancePerUnitCell = unitCellScaleArr.length;

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
	
	var currentCellIndex = 0;
	var xStep, yStep, zStep, currentStartingArrIndex;
	for ( var i = x_start; i < x_end; i ++) {
		for ( var j = y_start; j < y_end; j ++) {
			for ( var k = z_start; k < z_end; k ++) {
				//each unit cell
				currentStartingArrIndex = numInstancePerUnitCell * currentCellIndex;
				sumScaleArr.set(unitCellScaleArr, currentStartingArrIndex);
				sumSelectionArr.set(unitCellSelectionArr, currentStartingArrIndex);
				sumIndexArr.set(unitCellIndexArr, currentStartingArrIndex);
				sumColorArr.set(unitCellColorArr, currentStartingArrIndex * 3)

				xStep = i * dim1Step.x + j * dim2Step.x + k * dim3Step.x;
				yStep = i * dim1Step.y + j * dim2Step.y + k * dim3Step.y;
				zStep = i * dim1Step.z + j * dim2Step.z + k * dim3Step.z;
				for (var ii = 0; ii < numInstancePerUnitCell; ii ++){
					sumOffsetArr[(ii + currentStartingArrIndex) * 3 + 0] = unitCellOffsetArr[ii * 3 + 0] + xStep;
					sumOffsetArr[(ii + currentStartingArrIndex) * 3 + 1] = unitCellOffsetArr[ii * 3 + 1] + yStep;
					sumOffsetArr[(ii + currentStartingArrIndex) * 3 + 2] = unitCellOffsetArr[ii * 3 + 2] + zStep;
				}
				
				currentCellIndex++;
			}
		}
	}
	var totalNumInstances = currentCellIndex * numInstancePerUnitCell;

	var sphereTemplate = new THREE.SphereBufferGeometry(1, options.atomModelSegments, Math.ceil(options.atomModelSegments / 2));
	const combinedGeometry = new THREE.InstancedBufferGeometry();
	combinedGeometry.copy(sphereTemplate);
	combinedGeometry.setAttribute('instanceOffset', new THREE.InstancedBufferAttribute(sumOffsetArr, 3 ));
	combinedGeometry.setAttribute('instanceScale', new THREE.InstancedBufferAttribute(sumScaleArr, 1 ));
	combinedGeometry.setAttribute('instanceColor', new THREE.InstancedBufferAttribute(sumColorArr, 3 ));
	combinedGeometry.setAttribute('selection', new THREE.InstancedBufferAttribute(sumSelectionArr, 1 ));
	combinedGeometry.setAttribute('atomIndex', new THREE.InstancedBufferAttribute(sumIndexArr, 1 ));
	console.log(sumIndexArr)
	combinedGeometry.maxInstancedCount = totalNumInstances;

	return combinedGeometry;
}


export function updatePeriodicReplicatesInstancesMoleculeScale(geometry, unitCellScaleArr, options) {
	var numInstancePerUnitCell = unitCellScaleArr.length;
	var sumScaleArr = new Float32Array(unitCellScaleArr.length * 9 * 9 * 9);
	
	var x_start = -1 * ((options.xPBC-1)/2);
	var x_end = ((options.xPBC-1)/2) + 1;
	var y_start = -1 * ((options.yPBC-1)/2);
	var y_end = ((options.yPBC-1)/2) + 1;
	var z_start = -1 * ((options.zPBC-1)/2);
	var z_end = ((options.zPBC-1)/2) + 1;
	var currentCellIndex = 0;
	var currentStartingArrIndex;
	for ( var i = x_start; i < x_end; i ++) {
		for ( var j = y_start; j < y_end; j ++) {
			for ( var k = z_start; k < z_end; k ++) {
				//each unit cell
				currentStartingArrIndex = numInstancePerUnitCell * currentCellIndex;
				sumScaleArr.set(unitCellScaleArr, currentStartingArrIndex);
				currentCellIndex++;
			}
		}
	}

	geometry.setAttribute('instanceScale', new THREE.InstancedBufferAttribute(sumScaleArr, 1 ));

	geometry.attributes.instanceScale.needsUpdate = true;
}


export function updatePeriodicReplicatesInstancesMolecule(geometry, unitCellScaleArr, unitCellOffsetArr, unitCellColorArr, unitCellSelectionArr,  unitCellIndexArr, systemDimension, latticeVectors, options) {
	var sumScaleArr = new Float32Array(unitCellScaleArr.length * 9 * 9 * 9);
	var sumOffsetArr = new Float32Array(unitCellOffsetArr.length * 9 * 9 * 9);
	var sumColorArr = new Float32Array(unitCellColorArr.length * 9 * 9 * 9);
	var sumSelectionArr = new Float32Array(unitCellSelectionArr.length * 9 * 9 * 9);
	var sumIndexArr = new Float32Array(unitCellIndexArr.length * 9 * 9 * 9);
	

	var numInstancePerUnitCell = unitCellScaleArr.length;

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
	
	var currentCellIndex = 0;
	var xStep, yStep, zStep, currentStartingArrIndex;
	for ( var i = x_start; i < x_end; i ++) {
		for ( var j = y_start; j < y_end; j ++) {
			for ( var k = z_start; k < z_end; k ++) {
				//each unit cell
				currentStartingArrIndex = numInstancePerUnitCell * currentCellIndex
				sumScaleArr.set(unitCellScaleArr, currentStartingArrIndex);
				sumSelectionArr.set(unitCellSelectionArr, currentStartingArrIndex);
				sumIndexArr.set(unitCellIndexArr, currentStartingArrIndex);
				sumColorArr.set(unitCellColorArr, currentStartingArrIndex * 3)

				xStep = i * dim1Step.x + j * dim2Step.x + k * dim3Step.x;
				yStep = i * dim1Step.y + j * dim2Step.y + k * dim3Step.y;
				zStep = i * dim1Step.z + j * dim2Step.z + k * dim3Step.z;
				for (var ii = 0; ii < numInstancePerUnitCell; ii ++){
					sumOffsetArr[(ii + currentStartingArrIndex) * 3 + 0] = unitCellOffsetArr[ii * 3 + 0] + xStep;
					sumOffsetArr[(ii + currentStartingArrIndex) * 3 + 1] = unitCellOffsetArr[ii * 3 + 1] + yStep;
					sumOffsetArr[(ii + currentStartingArrIndex) * 3 + 2] = unitCellOffsetArr[ii * 3 + 2] + zStep;
				}
				
				currentCellIndex++;
			}
		}
	}
	var totalNumInstances = currentCellIndex * numInstancePerUnitCell;

	geometry.setAttribute('instanceOffset', new THREE.InstancedBufferAttribute(sumOffsetArr, 3 ));
	geometry.setAttribute('instanceScale', new THREE.InstancedBufferAttribute(sumScaleArr, 1 ));
	geometry.setAttribute('instanceColor', new THREE.InstancedBufferAttribute(sumColorArr, 3 ));
	geometry.setAttribute('selection', new THREE.InstancedBufferAttribute(sumSelectionArr, 1 ));
	geometry.setAttribute('atomIndex', new THREE.InstancedBufferAttribute(sumIndexArr, 1 ));
	geometry.maxInstancedCount = totalNumInstances;

	geometry.attributes.instanceOffset.needsUpdate = true;
	geometry.attributes.instanceScale.needsUpdate = true;
	geometry.attributes.instanceColor.needsUpdate = true;
	geometry.attributes.selection.needsUpdate = true;
	geometry.attributes.atomIndex.needsUpdate = true;
	console.log('num instances',geometry.maxInstancedCount );
	console.log(sumIndexArr)
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