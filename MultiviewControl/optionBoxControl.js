export function addOptionBox(view){
	const tempGuiContainer = document.createElement('div');
		
	tempGuiContainer.style.position = 'absolute';
	tempGuiContainer.style.top = view.windowTop +1+ 'px';
	tempGuiContainer.style.left = view.windowLeft +1+ 'px';
	document.body.appendChild(tempGuiContainer);
	const tempGui = new dat.GUI( { autoPlace: false } );
	view.guiContainer = tempGuiContainer;
	view.gui = tempGui;

	tempGuiContainer.appendChild(tempGui.domElement);

}

export function updateOptionBoxLocation(views){
	setTimeout(function(){
    	for ( let ii = 0; ii < views.length; ++ii ){
			const view = views[ii];
			view.guiContainer.style.top = view.windowTop +1+ 'px';
			view.guiContainer.style.left = view.windowLeft +1+ 'px';
		}
	}, 30);
}



function hideAllOptionBoxes(views){
	for (let ii =  0; ii < views.length; ++ii ) {
		const view = views[ii];
		view.guiContainer.style.visibility = "hidden";
	}
}

function showAllOptionBoxes(views){
	for (let ii =  0; ii < views.length; ++ii ) {
		const view = views[ii];
		view.guiContainer.style.visibility = "visible";
	}
}

export function showHideAllOptionBoxes(views,boxShowBool) {
	if (boxShowBool) {hideAllOptionBoxes(views);}
	else {showAllOptionBoxes(views);}
}