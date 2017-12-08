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
