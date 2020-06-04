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
	const geometry = new THREE.Geometry();
	geometry.vertices.push(new THREE.Vector3(-50, -50, 0));
	geometry.vertices.push(new THREE.Vector3(50, -50, 0));
	geometry.vertices.push(new THREE.Vector3(50, 50, 0));
	geometry.vertices.push(new THREE.Vector3(-50, 50, 0));
	geometry.vertices.push(new THREE.Vector3(-50, -50, 0));
	const material = new THREE.LineBasicMaterial({ color: 0xffffff, linewidth: 3, });
	const line = new THREE.Line(geometry, material);

	return line;
	//view.scene.add(line);
	
}

export function addTitle(view) {

	const options = view.options;
	let titleText = "";
	if (options.plotType == "Undefined"){
		titleText += "Undefined Plot";
	}

	if (options.plotType == "Heatmap"){
		
		let X, Y, XTransform, YTransform;
		if (options.plotData == 'spatiallyResolvedData'){
			X = view.options.plotXSpatiallyResolvedData, Y = view.options.plotYSpatiallyResolvedData;
			XTransform = view.options.plotXTransformSpatiallyResolvedData, YTransform = view.options.plotYTransformSpatiallyResolvedData;
		}

		if (options.plotData == 'moleculeData'){
			X = view.options.plotXMoleculeData, Y = view.options.plotYMoleculeData;
			XTransform = view.options.plotXTransformMoleculeData, YTransform = view.options.plotYTransformMoleculeData;
		}

		titleText += YTransform + " " + Y + " v.s. " + XTransform + " " + X;
	}

	if (options.plotType == "Covariance"){
		titleText += "Correlation Plot";
	}

	if (options.plotType == "PCA"){
		titleText += "PCA Plot";
	}
	const tempTitle = document.createElement('div');
	tempTitle.style.position = 'absolute';
	const tempWidth =  200;
	tempTitle.style.width = tempWidth;
	tempTitle.innerHTML = titleText;
	tempTitle.style.backgroundColor = "black";
	tempTitle.style.opacity = 1.0;
	tempTitle.style.color = "white";
	tempTitle.style.top = view.windowTop + 'px';
	//tempTitle.style.left = view.windowLeft + 'px';
	//tempTitle.style.left = calculateTitlePositionLeft(view, tempWidth) + 'px';
	const tempMargin = (view.windowWidth - tempWidth) / 2;
	tempTitle.style.left = view.windowLeft + tempMargin + 'px';
	console.log(view.windowWidth, tempWidth, tempMargin, tempTitle.style.left);
	view.title = tempTitle;
	document.body.appendChild(tempTitle);
	
}

export function changeTitle(view) {
	view.title.parentNode.removeChild(view.title);
	addTitle(view);
}

export function update2DHeatmapTitlesLocation(views){
	setTimeout(function(){
    	for ( let ii = 0; ii < views.length; ++ii ){
			const view = views[ii];
			if (view.viewType == '2DHeatmap'){
				const tempWidth =  200;
				view.title.style.width = tempWidth;
				const tempMargin = Math.max((view.windowWidth - tempWidth) / 2, 200);
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
	const margin = (view.windowWidth - elementWidth) / 2;
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