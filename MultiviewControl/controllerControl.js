export function updateController(views, windowWidth, windowHeight, mouseX, mouseY){
	for ( let ii = 0; ii < views.length; ++ii ){
		const view = views[ii];
		const left   = Math.floor( windowWidth  * view.left );
		const top    = Math.floor( windowHeight * view.top );
		const right  = Math.floor( windowWidth  * view.width ) + left;
		const bottom = Math.floor( windowHeight * view.height ) + top;
		
		// console.log(left, right, top, bottom, mouseX, mouseY)
		if (mouseX > left && mouseX < right && mouseY > top && mouseY < bottom){
			enableController(view, view.controller);
		}
		else{
			disableController(view,view.controller);
		}
	}
}

function enableController(view, controller){
	// console.log('activating')
	view.controllerEnabled = true;
	controller.enableZoom = view.controllerZoom;
	controller.enablePan  = view.controllerPan;
	controller.enableRotate = view.controllerRotate;

	/*controller.noZoom = false;
	controller.noPan  = false;
	controller.staticMoving = true;*/
	view.border.material.color = new THREE.Color( 0xffffff );         
	view.border.material.needsUpdate = true;
}
function disableController(view, controller){
	view.controllerEnabled = false;
	controller.enableZoom = false;
	controller.enablePan  = false;
	controller.enableRotate = false;

	/*controller.noZoom = true;
	controller.noPan  = true;
	controller.staticMoving = false;*/
	view.border.material.color = new THREE.Color( 0x000000 );         
	view.border.material.needsUpdate = true;
}
