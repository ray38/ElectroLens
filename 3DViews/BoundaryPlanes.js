function updatePlane(options){
	console.log('updating planes');
	if (options.planeVisibilityU){	plane_material_u.opacity = options.planeOpacity;	}
	else {	plane_material_u.opacity = 0;	}

	if (options.planeVisibilityD){	plane_material_d.opacity = options.planeOpacity;	}
	else {	plane_material_d.opacity = 0;	}

	if (options.planeVisibilityR){	plane_material_r.opacity = options.planeOpacity;	}
	else {	plane_material_r.opacity = 0;	}

	if (options.planeVisibilityL){	plane_material_l.opacity = options.planeOpacity;	}
	else {	plane_material_l.opacity = 0;	}

	if (options.planeVisibilityF){	plane_material_f.opacity = options.planeOpacity;	}
	else {	plane_material_f.opacity = 0;	}

	if (options.planeVisibilityB){	plane_material_b.opacity = options.planeOpacity;	}
	else {	plane_material_b.opacity = 0;	}

	plane_u.position.set( 0, (options.y_high-50)*10, 0 );
	plane_d.position.set( 0, (options.y_low-50)*10, 0 );
	plane_f.position.set( 0, 0, (options.z_high-50)*10 );
	plane_b.position.set( 0, 0, (options.z_low-50)*10 );
	plane_r.position.set( (options.x_high-50)*10, 0, 0 );
	plane_l.position.set( (options.x_low-50)*10, 0, 0 );

}


function setPlanes(options){
	plane_material_u = new THREE.MeshBasicMaterial( {  color: 0xffffff, opacity: options.planeOpacity,transparent: true, side: THREE.DoubleSide,needsUpdate : true } );
	plane_material_d = new THREE.MeshBasicMaterial( {  color: 0xffffff, opacity: options.planeOpacity,transparent: true, side: THREE.DoubleSide,needsUpdate : true } );
	plane_material_r = new THREE.MeshBasicMaterial( {  color: 0xffffff, opacity: options.planeOpacity,transparent: true, side: THREE.DoubleSide,needsUpdate : true } );
	plane_material_l = new THREE.MeshBasicMaterial( {  color: 0xffffff, opacity: options.planeOpacity,transparent: true, side: THREE.DoubleSide,needsUpdate : true } );
	plane_material_f = new THREE.MeshBasicMaterial( {  color: 0xffffff, opacity: options.planeOpacity,transparent: true, side: THREE.DoubleSide,needsUpdate : true } );
	plane_material_b = new THREE.MeshBasicMaterial( {  color: 0xffffff, opacity: options.planeOpacity,transparent: true, side: THREE.DoubleSide,needsUpdate : true } );
	
	plane_u = new THREE.Mesh( new THREE.PlaneGeometry( 1000, 1000), plane_material_u );
	plane_u.position.set( 0, 500, 0 );
	plane_u.rotation.x = Math.PI / 2;
	scene.add( plane_u );
	
	plane_d = new THREE.Mesh( new THREE.PlaneGeometry( 1000, 1000), plane_material_d );
	plane_d.position.set( 0, -500, 0 );
	plane_d.rotation.x = Math.PI / 2;
	scene.add( plane_d );			
	
	plane_f = new THREE.Mesh( new THREE.PlaneGeometry( 1000, 1000), plane_material_f );
	plane_f.position.set( 0, 0, 500 );
	scene.add( plane_f );
	
	plane_b = new THREE.Mesh( new THREE.PlaneGeometry( 1000, 1000), plane_material_b );
	plane_b.position.set( 0, 0, -500 );
	scene.add( plane_b );
	
	plane_l = new THREE.Mesh( new THREE.PlaneGeometry( 1000, 1000), plane_material_l );
	plane_l.position.set( -500, 0, 0 );
	plane_l.rotation.y = Math.PI / 2;
	scene.add( plane_l );
	
	plane_r = new THREE.Mesh( new THREE.PlaneGeometry( 1000, 1000), plane_material_r );
	plane_r.position.set( 500, 0, 0 );
	plane_r.rotation.y = Math.PI / 2;
	scene.add( plane_r );
	updatePlane(options);

}
