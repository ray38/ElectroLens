export function setupViewCameraSceneController(view,renderer){

	var camera = new THREE.PerspectiveCamera( view.fov, window.innerWidth / window.innerHeight, 1, 60000 );
	camera.position.fromArray( view.eye );


	view.camera = camera;

	var dirLight = new THREE.DirectionalLight(0xffffff, 1);

	dirLight.castShadow = true;
	dirLight.shadowDarkness = 1.0;
	dirLight.shadowCameraVisible = true;
	dirLight.position.set(0,0,0);
	view.camLight = dirLight
	view.camera.add(dirLight);
	

	/*var dirLightHeper = new THREE.DirectionalLightHelper(dirLight, 10);
	view.scene.add(dirLightHeper);*/


	/*var hemiLight = new THREE.HemisphereLight(0xffffff, 0xffffff, 0.6);
	hemiLight.position.set(0, 10000, 0);
	view.scene.add(hemiLight);

	var hemiLightHelper = new THREE.HemisphereLightHelper(hemiLight, 10);
	view.scene.add(hemiLightHelper);*/


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
	view.scene.add(view.camera);

	var left   = Math.floor( window.innerWidth  * view.left );
	var top    = Math.floor( window.innerHeight * view.top );
	var width  = Math.floor( window.innerWidth  * view.width );
	var height = Math.floor( window.innerHeight * view.height );

	view.windowLeft = left;
	view.windowTop = top;
	view.windowWidth = width;
	view.windowHeight = height;
}

export function updateCamLightPosition(view){
	view.camLight.position.set(view.options.cameraLightPositionX, view.options.cameraLightPositionY, view.options.cameraLightPositionZ);
}
