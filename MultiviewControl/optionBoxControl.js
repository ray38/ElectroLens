export function addOptionBox(view){
	var tempGuiContainer = document.createElement('div');
		
	tempGuiContainer.style.position = 'absolute';
	tempGuiContainer.style.top = view.windowTop + 'px';
	tempGuiContainer.style.left = view.windowLeft + 'px';
	document.body.appendChild(tempGuiContainer);
	var tempGui = new dat.GUI( { autoPlace: false } );
	view.guiContainer = tempGuiContainer;
	view.gui = tempGui;

	tempGuiContainer.appendChild(tempGui.domElement);

}

export function updateOptionBoxLocation(views){
	setTimeout(function(){
    	for ( var ii = 0; ii < views.length; ++ii ){
			var view = views[ii];
			view.guiContainer.style.top = view.windowTop + 'px';
			view.guiContainer.style.left = view.windowLeft + 'px';
		}
	}, 30);
}

function hideAllOptionBoxes(views){
	for (var ii =  0; ii < views.length; ++ii ) {
		var view = views[ii];
		view.guiContainer.style.visibility = "hidden";
	}
}

function showAllOptionBoxes(views){
	for (var ii =  0; ii < views.length; ++ii ) {
		var view = views[ii];
		view.guiContainer.style.visibility = "visible";
	}
}

export function showHideAllOptionBoxes(views,boxShowBool) {
	if (boxShowBool) {hideAllOptionBoxes(views);}
	else {showAllOptionBoxes(views);}
}