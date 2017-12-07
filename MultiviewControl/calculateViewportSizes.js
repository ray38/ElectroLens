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
	else {threeDViewWidth = 0.7; twoDViewWidth = 0.3;}

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