import { updateOptionBoxLocation } from "./optionBoxControl.js";
import { update2DHeatmapTitlesLocation } from "../2DHeatmaps/Utilities.js";
export function calculateViewportSizes(views){
	let twoDViewCount = 0.0, threeDViewCount = 0.0;

	let threeDViewHeight, threeDViewWidth;
	let twoDViewHeight, twoDViewWidth;
	for (let ii =  0; ii < views.length; ++ii ) {
		const view = views[ii];
		if (view.viewType == '2DHeatmap'){ twoDViewCount += 1.0; }
		if (view.viewType == '3DView'){ threeDViewCount += 1.0; }
	}

	if (twoDViewCount == 0) {threeDViewWidth = 1.0; twoDViewWidth = 0.0;}
	else {threeDViewWidth = 0.6; twoDViewWidth = 0.4;}

	if (twoDViewCount != 0) {twoDViewHeight = 1.0/twoDViewCount;}
	if (threeDViewCount != 0) {threeDViewHeight = 1.0/threeDViewCount;}

	let twoDViewTopCounter = 0.0, threeDViewTopCounter = 0.0;

	for (let ii =  0; ii < views.length; ++ii ) {
		const view = views[ii];
		if (view.viewType == '2DHeatmap'){ 
			view.left = threeDViewWidth;
			view.top = twoDViewTopCounter;
			view.height = twoDViewHeight;
			view.width = twoDViewWidth;

			twoDViewTopCounter += twoDViewHeight; 
		}
		if (view.viewType == '3DView'){ 
			view.left = 0.0;
			view.top = threeDViewTopCounter;
			view.height = threeDViewHeight;
			view.width = threeDViewWidth;

			threeDViewTopCounter += threeDViewHeight; 
		}
	}

}

export function fullscreenOneView(views, view){
	for (let ii =  0; ii < views.length; ++ii ) {
		const tempView = views[ii];
		
		tempView.left = 0.0;
		tempView.top = 0.0;
		tempView.height = 0.0;
		tempView.width = 0.0;

		//tempView.guiContainer.style.display = "none";
		tempView.guiContainer.style.visibility = "hidden";
		/*if (tempView.viewType == '2DHeatmap') {
			tempView.title.style.visibility = "hidden";
		}*/
	}

	view.left = 0.0;
	view.top = 0.0;
	view.height = 1.0;
	view.width = 1.0;

	view.guiContainer.style.visibility = "visible";
	/*if (view.viewType == '2DHeatmap') {
		view.title.style.visibility = "visible";
	}*/

	updateOptionBoxLocation(views);
	update2DHeatmapTitlesLocation(views);

}

export function deFullscreen(views){
	let twoDViewCount = 0.0, threeDViewCount = 0.0;

	let threeDViewHeight, threeDViewWidth;
	let twoDViewHeight, twoDViewWidth;
	for (let ii =  0; ii < views.length; ++ii ) {
		const view = views[ii];
		if (view.viewType == '2DHeatmap'){ twoDViewCount += 1.0; }
		if (view.viewType == '3DView'){ threeDViewCount += 1.0; }
	}

	if (twoDViewCount == 0) {threeDViewWidth = 1.0; twoDViewWidth = 0.0;}
	else {threeDViewWidth = 0.6; twoDViewWidth = 0.4;}

	if (twoDViewCount != 0) {twoDViewHeight = 1.0/twoDViewCount;}
	if (threeDViewCount != 0) {threeDViewHeight = 1.0/threeDViewCount;}

	let twoDViewTopCounter = 0.0, threeDViewTopCounter = 0.0;

	for (let ii =  0; ii < views.length; ++ii ) {
		const view = views[ii];
		view.guiContainer.style.visibility = "visible";
		if (view.viewType == '2DHeatmap'){ 
			view.left = threeDViewWidth;
			view.top = twoDViewTopCounter;
			view.height = twoDViewHeight;
			view.width = twoDViewWidth;

			twoDViewTopCounter += twoDViewHeight; 

			view.title.style.visibility = "visible";
		}
		if (view.viewType == '3DView'){ 
			view.left = 0.0;
			view.top = threeDViewTopCounter;
			view.height = threeDViewHeight;
			view.width = threeDViewWidth;

			threeDViewTopCounter += threeDViewHeight; 
		}
	}


	updateOptionBoxLocation(views);
	update2DHeatmapTitlesLocation(views);
	
}