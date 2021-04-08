export function addSystemEdge(view){

	const scene = view.scene;
	
	//const geometry = new THREE.BoxBufferGeometry(view.systemDimension.x, view.systemDimension.y, view.systemDimension.z);
	const boxGeometry = new THREE.BoxGeometry(1,1,1).translate(0.5,0.5,0.5).scale(view.systemDimension.x, view.systemDimension.y, view.systemDimension.z);
	const geometry = new THREE.BufferGeometry().fromGeometry(boxGeometry);
	const transformedPositionArray = transformPositionArray(geometry.attributes.position.array, view.systemLatticeVectors);
	geometry.setAttribute( 'position', new THREE.BufferAttribute( transformedPositionArray, 3 ) );

	const geo = new THREE.EdgesGeometry( geometry ); // or WireframeGeometry( geometry )
	const mat = new THREE.LineBasicMaterial( { color: 0xffffff, linewidth: 2 } );
	const wireframe = new THREE.LineSegments( geo, mat );
	view.systemEdge = wireframe; 
	scene.add( wireframe );
	console.log("added edge");
	document.getElementById("container").setAttribute("loadstatus","1");
}

export function removeSystemEdge(view){
	view.scene.remove(view.systemEdge)
}

function transformPositionArray(array, U){
	const X = [], Y = [], Z = [];
	const result = new Float32Array(array.length)

	for (let i = 0; i < array.length; i++) {
		switch (i%3) {
			case 0:
				X.push(array[i]);
				break;
			
			case 1:
				Y.push(array[i]);
				break;

			case 2:
				Z.push(array[i]);
				break;
		
			default:
				break;
		}
	}

	if (X.length != Y.length || X.length != Z.length || Y.length != Z.length) {
		alert("weired position array when generating system Edge")
	}

	for (let i = 0; i < X.length; i++) {
		result[i * 3 + 0] = X[i] * U.u11 + Y[i] * U.u21 + Z[i] * U.u31;
		result[i * 3 + 1] = X[i] * U.u12 + Y[i] * U.u22 + Z[i] * U.u32;
		result[i * 3 + 2] = X[i] * U.u13 + Y[i] * U.u23 + Z[i] * U.u33;
	}

	return result;
}