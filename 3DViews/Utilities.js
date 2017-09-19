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