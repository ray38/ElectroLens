export function setupViewCameraSceneController(view,renderer){

	var camera = new THREE.PerspectiveCamera( view.fov, window.innerWidth / window.innerHeight, 1, 60000 );
	camera.position.fromArray( view.eye );

	//var pointLight = new THREE.PointLight( 0xffffff );
	//pointLight.position.set(1,1,2);
	//camera.add(pointLight);

	view.camera = camera;
	var tempController = new THREE.OrbitControls( camera, renderer.domElement );
	tempController.minAzimuthAngle = - Infinity; // radians
	tempController.maxAzimuthAngle = Infinity; // radians
	tempController.minPolarAngle = - 2* Math.PI; // radians
	tempController.maxPolarAngle = 2* Math.PI; // radians
	/*var tempController = new THREE.TrackballControls( camera, renderer.domElement );
	tempController.rotateSpeed = 10.0;
	tempController.zoomSpeed = 10.2;
	tempController.panSpeed = 10.8;
	tempController.noZoom = false;
	tempController.noPan = false;
	tempController.staticMoving = true;*/
	view.controller = tempController;
	var tempScene = new THREE.Scene();

	view.scene = tempScene;
	var light = new THREE.DirectionalLight( 0xffffff, 1, 100 );
	light.position.set( 0, 1, 0 ); 			//default; light shining from top
	light.castShadow = true;            // default false
	view.scene.add( light );
	//view.scene.add( camera );


	var left   = Math.floor( window.innerWidth  * view.left );
	var top    = Math.floor( window.innerHeight * view.top );
	var width  = Math.floor( window.innerWidth  * view.width );
	var height = Math.floor( window.innerHeight * view.height );

	view.windowLeft = left;
	view.windowTop = top;
	view.windowWidth = width;
	view.windowHeight = height;
}
