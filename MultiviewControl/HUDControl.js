export function setupHUD(view) {
	const tempSceneHUD = new THREE.Scene();
	const tempCameraHUD = new THREE.OrthographicCamera(-10, 10, 10, -10, -10, 10);
	view.sceneHUD = tempSceneHUD;
	view.cameraHUD = tempCameraHUD;

	const lineGeometry = new THREE.Geometry();
	/*lineGeometry.vertices.push(	new THREE.Vector3(-10, -10, 0),
								new THREE.Vector3(10, -10, 0),
								new THREE.Vector3(10, 10, 0),
								new THREE.Vector3(-10, 10, 0),
								new THREE.Vector3(-10, -10, 0));*/
	lineGeometry.vertices.push(	new THREE.Vector3(-9.999, -9.999, 0),
								new THREE.Vector3(9.999, -9.999, 0),
								new THREE.Vector3(9.999, 9.999, 0),
								new THREE.Vector3(-9.999, 9.999, 0),
								new THREE.Vector3(-9.999, -9.999, 0));
	const border = new THREE.Line(lineGeometry,
	new THREE.LineBasicMaterial({
		color: 0x000000,
	}));
	//sceneHUD.add(line);
	border.name = 'border';
	tempSceneHUD.add(border);
	view.border = border;
}