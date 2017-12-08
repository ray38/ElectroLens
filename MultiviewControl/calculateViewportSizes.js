import { updateOptionBoxLocation } from "./setupViewBasic.js";

export function calculateViewportSizes(views){
	var twoDViewCount = 0.0, threeDViewCount = 0.0;

	var threeDViewHeight, threeDViewWidth;
	var twoDViewHeight, twoDViewWidth;
	for (var ii =  0; ii < views.length; ++ii ) {
		var view = views[ii];
		if (view.viewType == '2DHeatmap'){ twoDViewCount += 1.0; }
		if (view.viewType == '3DView'){ threeDViewCount += 1.0; }
	}

	if (twoDViewCount == 0) {threeDViewWidth = 1.0; twoDViewWidth = 0.0;}
	else {threeDViewWidth = 0.6; twoDViewWidth = 0.4;}

	if (twoDViewCount != 0) {twoDViewHeight = 1.0/twoDViewCount;}
	if (threeDViewCount != 0) {threeDViewHeight = 1.0/threeDViewCount;}

	var twoDViewTopCounter = 0.0, threeDViewTopCounter = 0.0;

	for (var ii =  0; ii < views.length; ++ii ) {
		var view = views[ii];
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
	for (var ii =  0; ii < views.length; ++ii ) {
		var tempView = views[ii];
		
		tempView.left = 0.0;
		tempView.top = 0.0;
		tempView.height = 0.0;
		tempView.width = 0.0;

		//tempView.guiContainer.style.display = "none";
		tempView.guiContainer.style.visibility = "hidden";
	}

	view.left = 0.0;
	view.top = 0.0;
	view.height = 1.0;
	view.width = 1.0;

	view.guiContainer.style.visibility = "visible";

	/*setTimeout(function(){
    	for ( var ii = 0; ii < views.length; ++ii ){
			var view = views[ii];
			view.guiContainer.style.top = view.windowTop + 'px';
			view.guiContainer.style.left = view.windowLeft + 'px';
		}
	}, 30);*/
	updateOptionBoxLocation(views);

}

export function deFullscreen(views){
	var twoDViewCount = 0.0, threeDViewCount = 0.0;

	var threeDViewHeight, threeDViewWidth;
	var twoDViewHeight, twoDViewWidth;
	for (var ii =  0; ii < views.length; ++ii ) {
		var view = views[ii];
		if (view.viewType == '2DHeatmap'){ twoDViewCount += 1.0; }
		if (view.viewType == '3DView'){ threeDViewCount += 1.0; }
	}

	if (twoDViewCount == 0) {threeDViewWidth = 1.0; twoDViewWidth = 0.0;}
	else {threeDViewWidth = 0.6; twoDViewWidth = 0.4;}

	if (twoDViewCount != 0) {twoDViewHeight = 1.0/twoDViewCount;}
	if (threeDViewCount != 0) {threeDViewHeight = 1.0/threeDViewCount;}

	var twoDViewTopCounter = 0.0, threeDViewTopCounter = 0.0;

	for (var ii =  0; ii < views.length; ++ii ) {
		var view = views[ii];
		view.guiContainer.style.visibility = "visible";
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

	/*setTimeout(function(){
    	for ( var ii = 0; ii < views.length; ++ii ){
			var view = views[ii];
			view.guiContainer.style.top = view.windowTop + 'px';
			view.guiContainer.style.left = view.windowLeft + 'px';
		}
	}, 30);*/

	updateOptionBoxLocation(views);
	
}