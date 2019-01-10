

export function getAxis(view){
	var geometry = new THREE.Geometry();
	geometry.vertices.push(new THREE.Vector3(-50, -50, 0));
	geometry.vertices.push(new THREE.Vector3(50, -50, 0));
	geometry.vertices.push(new THREE.Vector3(50, 50, 0));
	geometry.vertices.push(new THREE.Vector3(-50, 50, 0));
	geometry.vertices.push(new THREE.Vector3(-50, -50, 0));
	var material = new THREE.LineBasicMaterial({ color: 0xffffff, linewidth: 3, });
	var line = new THREE.Line(geometry, material);
	view.scene.add(line);
	
}

export function addTitle(view) {
	//var titleText = view.plotYTransform + " " + view.plotY + " v.s. " + view.plotXTransform + " " + view.plotX;

	var options = view.options;

	if (options.plotData == 'spatiallyResolvedData'){
		var X = view.options.plotXSpatiallyResolvedData, Y = view.options.plotYSpatiallyResolvedData;
		var XTransform = view.options.plotXTransformSpatiallyResolvedData, YTransform = view.options.plotYTransformSpatiallyResolvedData;
	}

	if (options.plotData == 'moleculeData'){
		var X = view.options.plotXMoleculeData, Y = view.options.plotYMoleculeData;
		var XTransform = view.options.plotXTransformMoleculeData, YTransform = view.options.plotYTransformMoleculeData;
	}

	var titleText = YTransform + " " + Y + " v.s. " + XTransform + " " + X;

	//var titleText = " v.s. ";
	var tempTitle = document.createElement('div');
	tempTitle.style.position = 'absolute';
	//var tempWidth =  Math.max(200, view.windowWidth/2); //calculateTitleSizeWidth(view);
	var tempWidth =  200;
	tempTitle.style.width = tempWidth;
	tempTitle.innerHTML = titleText;
	tempTitle.style.backgroundColor = "black";
	tempTitle.style.opacity = 1.0;
	tempTitle.style.color = "white";
	tempTitle.style.top = view.windowTop + 'px';
	//tempTitle.style.left = view.windowLeft + 'px';
	//tempTitle.style.left = calculateTitlePositionLeft(view, tempWidth) + 'px';
	var tempMargin = (view.windowWidth - tempWidth) / 2;
	tempTitle.style.left = view.windowLeft + tempMargin + 'px';
	console.log(view.windowWidth, tempWidth, tempMargin, tempTitle.style.left);
	view.title = tempTitle;
	document.body.appendChild(tempTitle);
	
}

export function changeTitle(view) {
	//var old_title = document.getElementById("uploader");
	//document.removeChild(view.title);
	view.title.parentNode.removeChild(view.title);
	addTitle(view);
}

export function update2DHeatmapTitlesLocation(views){
	setTimeout(function(){
    	for ( var ii = 0; ii < views.length; ++ii ){
			var view = views[ii];
			if (view.viewType == '2DHeatmap'){
				//var tempWidth =  Math.max(200, view.windowWidth/2); //calculateTitleSizeWidth(view);
				var tempWidth =  200;
				view.title.style.width = tempWidth;
				var tempMargin = Math.max((view.windowWidth - tempWidth) / 2, 200);
				view.title.style.left = view.windowLeft + tempMargin + 'px';
				view.title.style.top = view.windowTop + 'px';
			}
		}
	}, 30);
}

function calculateTitleSizeWidth(view){
	return Math.max(200, view.windowWidth/2);
}

function calculateTitlePositionLeft(view, elementWidth){
	var margin = (view.windowWidth - elementWidth) / 2;
	console.log(view.windowWidth, elementWidth, margin);
	return view.windowLeft + margin;
}