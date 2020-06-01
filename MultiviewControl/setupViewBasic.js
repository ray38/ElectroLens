export function setupViewCameraSceneController(view,renderer){

	const camera = new THREE.PerspectiveCamera( view.options.cameraFov, window.innerWidth / window.innerHeight, 1, 100000 );
	camera.position.set( view.eye[0] + view.geometryCenter[0], view.eye[1] + view.geometryCenter[1], view.eye[2] + view.geometryCenter[2] );
	console.log("camera", camera)
	view.camera = camera;



	/*
	const aspect = window.innerWidth / window.innerHeight;
	const cameraPerspective = new THREE.PerspectiveCamera( view.options.cameraFov, aspect, 1, 100000 );
	cameraPerspective.position.set( view.eye[0] + view.geometryCenter[0], view.eye[1] + view.geometryCenter[1], view.eye[2] + view.geometryCenter[2] );

	const cameraOrtho = new THREE.OrthographicCamera( view.options.cameraFrustumSize * aspect / - 2, view.options.cameraFrustumSize * aspect / 2, view.options.cameraFrustumSize / 2, view.options.cameraFrustumSize / - 2, 1, 100000 );
	cameraOrtho.position.set( view.eye[0] + view.geometryCenter[0], view.eye[1] + view.geometryCenter[1], view.eye[2] + view.geometryCenter[2] );

	view.camera = cameraPerspective;


	const cameraRig = new THREE.Group();

	cameraRig.add( cameraPerspective );
	cameraRig.add( cameraOrtho );

	view.cameraRig = cameraRig;
	// view.scene.add( cameraRig );
*/


	const dirLight = new THREE.DirectionalLight(0xffffff, 1);

	dirLight.castShadow = true;
	dirLight.shadowDarkness = 1.0;
	dirLight.shadowCameraVisible = true;
	dirLight.position.set(0,0,0);
	view.camLight = dirLight
	view.camera.add(view.camLight);
	

	/*var dirLightHeper = new THREE.DirectionalLightHelper(dirLight, 10);
	view.scene.add(dirLightHeper);*/


	/*var hemiLight = new THREE.HemisphereLight(0xffffff, 0xffffff, 0.6);
	hemiLight.position.set(0, 10000, 0);
	view.scene.add(hemiLight);

	var hemiLightHelper = new THREE.HemisphereLightHelper(hemiLight, 10);
	view.scene.add(hemiLightHelper);*/


	const tempController = new THREE.OrbitControls( view.camera, renderer.domElement );
	tempController.target.set( view.geometryCenter[0], view.geometryCenter[1], view.geometryCenter[2]  );
	view.camera.rotation.set(0,0,0);
	// console.log(tempController)
	// tempController.minAzimuthAngle = - Infinity; // radians
	// tempController.maxAzimuthAngle = Infinity; // radians
	// tempController.minPolarAngle = - 2* Math.PI; // radians
	// tempController.maxPolarAngle = 2* Math.PI; // radians
	/* var tempController = new THREE.TrackballControls( camera, renderer.domElement );
	tempController.rotateSpeed = 20.0; */
	/*tempController.zoomSpeed = 10.2;
	tempController.panSpeed = 10.8;
	tempController.noZoom = false;
	tempController.noPan = false;
	tempController.staticMoving = true;*/
	view.controller = tempController;
	const tempScene = new THREE.Scene();

	view.scene = tempScene;
	view.scene.add(view.camera);
	view.renderer = renderer;
	

	const left   = Math.floor( window.innerWidth  * view.left );
	const top    = Math.floor( window.innerHeight * view.top );
	const width  = Math.floor( window.innerWidth  * view.width );
	const height = Math.floor( window.innerHeight * view.height );

	view.windowLeft = left;
	view.windowTop = top;
	view.windowWidth = width;
	view.windowHeight = height;
}

export function updateCamLightPosition(view){
	view.camLight.position.set(view.options.cameraLightPositionX, view.options.cameraLightPositionY, view.options.cameraLightPositionZ);
}


export function updateCameraFov(view){
	view.camera.fov = view.options.cameraFov;
	view.camera.updateProjectionMatrix();
}

export function switchCamera(cameraType, view){
	if (cameraType === "orthographic"){
		view.scene.remove(view.camera);

		console.log("change to orthographic")
		view.options.cameraType = "orthographic";
		const aspect = window.innerWidth / window.innerHeight;
		const cameraOrtho = new THREE.OrthographicCamera( view.options.cameraFrustumSize * aspect / - 2, 
														  view.options.cameraFrustumSize * aspect / 2, 
														  view.options.cameraFrustumSize / 2, 
														  view.options.cameraFrustumSize / - 2, 
														  1, 100000 );
		cameraOrtho.position.set( view.eye[0] + view.geometryCenter[0], 
								  view.eye[1] + view.geometryCenter[1], 
								  view.eye[2] + view.geometryCenter[2] );

		view.camera = cameraOrtho;
		const tempController = new THREE.OrbitControls( view.camera, view.renderer.domElement );
		tempController.target.set( view.geometryCenter[0], view.geometryCenter[1], view.geometryCenter[2]  );
		view.camera.rotation.set(0,0,0);
		view.controller = tempController;

		const dirLight = new THREE.DirectionalLight(0xffffff, 1);

		dirLight.castShadow = true;
		dirLight.shadowDarkness = 1.0;
		dirLight.shadowCameraVisible = true;
		dirLight.position.set(0,0,0);
		view.camLight = dirLight
		view.camera.add(view.camLight);
		view.scene.add(view.camera);
	}
	if (cameraType === "perspective"){
		view.scene.remove(view.camera)

		console.log("change to perspective")
		view.options.cameraType = "perspective";
		const aspect = window.innerWidth / window.innerHeight;
		const cameraPerspective = new THREE.PerspectiveCamera( view.options.cameraFov, aspect, 1, 100000 );
		cameraPerspective.position.set( view.eye[0] + view.geometryCenter[0], 
										view.eye[1] + view.geometryCenter[1], 
										view.eye[2] + view.geometryCenter[2] );

		view.camera = cameraPerspective;
		const tempController = new THREE.OrbitControls( view.camera, view.renderer.domElement );
		tempController.target.set( view.geometryCenter[0], view.geometryCenter[1], view.geometryCenter[2]  );
		view.camera.rotation.set(0,0,0);
		view.controller = tempController;

		const dirLight = new THREE.DirectionalLight(0xffffff, 1);

		dirLight.castShadow = true;
		dirLight.shadowDarkness = 1.0;
		dirLight.shadowCameraVisible = true;
		dirLight.position.set(0,0,0);
		view.camLight = dirLight
		view.camera.add(view.camLight);
		view.scene.add(view.camera);
	}
}