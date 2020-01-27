export function addSystemEdge(view){

	var options = view.options;
	var scene = view.scene;

	var geometry = new THREE.BoxGeometry(	( view.xPlotMax - view.xPlotMin ), 
											( view.yPlotMax - view.yPlotMin ),  
											( view.zPlotMax - view.zPlotMin ) );



    var geo = new THREE.EdgesGeometry( geometry ); // or WireframeGeometry( geometry )

	var mat = new THREE.LineBasicMaterial( { color: 0xffffff, linewidth: 2 } );

	var wireframe = new THREE.LineSegments( geo, mat );

	view.systemEdge = wireframe; 

	scene.add( wireframe );
}

export function removeSystemEdge(view){
	view.scene.remove(view.systemEdge)
}