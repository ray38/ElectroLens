import {disposeMeshOrGroup} from '../Utilities/dispose.js';

export function dispose2DPlots(view) {
	if ("covariance" in view) {
		view.scene.remove(view.covariance);
		disposeMeshOrGroup(view.covariance);
		delete view.covariance;
	}

	if ("comparison" in view) {
		view.scene.remove(view.comparison);
		disposeMeshOrGroup(view.comparison);
		delete view.comparison;
	}
	
	if ("heatmap" in view) {
		view.scene.remove(view.heatmap);
		disposeMeshOrGroup(view.heatmap);
		delete view.heatmap;
	}
	
	if ("PCAGroup" in view) {
		view.scene.remove(view.PCAGroup);
		disposeMeshOrGroup(view.PCAGroup);
		delete view.PCAGroup;
	}

	if ("UmapGroup" in view) {
		view.scene.remove(view.UmapGroup);
		disposeMeshOrGroup(view.UmapGroup);
		delete view.UmapGroup;
    }
}

export function getAxis(view){
	var geometry = new THREE.Geometry();
	geometry.vertices.push(new THREE.Vector3(-50, -50, 0));
	geometry.vertices.push(new THREE.Vector3(50, -50, 0));
	geometry.vertices.push(new THREE.Vector3(50, 50, 0));
	geometry.vertices.push(new THREE.Vector3(-50, 50, 0));
	geometry.vertices.push(new THREE.Vector3(-50, -50, 0));
	var material = new THREE.LineBasicMaterial({ color: 0xffffff, linewidth: 3, });
	var line = new THREE.Line(geometry, material);

	return line;
	//view.scene.add(line);
	
}

export function addTitle(view) {
	//var titleText = view.plotYTransform + " " + view.plotY + " v.s. " + view.plotXTransform + " " + view.plotX;

	var options = view.options;
	var titleText = "";
	if (options.plotType == "Undefined"){
		titleText += "Undefined Plot";
	}

	if (options.plotType == "Heatmap"){
		
		if (options.plotData == 'spatiallyResolvedData'){
			var X = view.options.plotXSpatiallyResolvedData, Y = view.options.plotYSpatiallyResolvedData;
			var XTransform = view.options.plotXTransformSpatiallyResolvedData, YTransform = view.options.plotYTransformSpatiallyResolvedData;
		}

		if (options.plotData == 'moleculeData'){
			var X = view.options.plotXMoleculeData, Y = view.options.plotYMoleculeData;
			var XTransform = view.options.plotXTransformMoleculeData, YTransform = view.options.plotYTransformMoleculeData;
		}

		titleText += YTransform + " " + Y + " v.s. " + XTransform + " " + X;
	}

	if (options.plotType == "Covariance"){
		titleText += "Correlation Plot";
	}

	if (options.plotType == "PCA"){
		titleText += "PCA Plot";
	}
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

export function countListSelected(list) {
	let count = 0;
	
	// for (let i = 0; i < list.length; i++) {
	for (let i = list.length; i--;) {
		if (list[i].selected){ count += 1;}
	}
	return count;
}

export function isAnyHighlighted(list) {

	// for (let i = 0; i < list.length; i++) {
	for (let i = list.length; i--;) {
		if (list[i].highlighted){ return true; }
	}
	return false;
	
}

export function heatmapPointCount(data){
	let count = 0;
	for (let x in data){
		for (let y in data[x]){
			count = count + 1;
		}
	}
	return count;
}