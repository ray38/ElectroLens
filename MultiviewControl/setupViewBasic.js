export function setupViewCameraSceneController(view,renderer){

	var camera = new THREE.PerspectiveCamera( view.fov, window.innerWidth / window.innerHeight, 1, 10000 );
	camera.position.fromArray( view.eye );
	view.camera = camera;
	var tempController = new THREE.OrbitControls( camera, renderer.domElement );
	view.controller = tempController;
	var tempScene = new THREE.Scene();
	view.scene = tempScene;

	


	var left   = Math.floor( window.innerWidth  * view.left );
	var top    = Math.floor( window.innerHeight * view.top );
	var width  = Math.floor( window.innerWidth  * view.width );
	var height = Math.floor( window.innerHeight * view.height );

	view.windowLeft = left;
	view.windowTop = top;
	view.windowWidth = width;
	view.windowHeight = height;
}


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