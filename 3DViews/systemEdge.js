export function addSystemEdge(view){

	var options = view.options;
	var scene = view.scene;

	var geometry = new THREE.CubeGeometry(	20.0*(view.xPlotScale(view.xCoordMax)-view.xPlotScale(view.xCoordMin)), 
											20.0*(view.yPlotScale(view.yCoordMax)-view.yPlotScale(view.yCoordMin)),  
											20.0*(view.zPlotScale(view.zCoordMax)-view.zPlotScale(view.zCoordMin)) );



    var geo = new THREE.EdgesGeometry( geometry ); // or WireframeGeometry( geometry )

	var mat = new THREE.LineBasicMaterial( { color: 0xffffff, linewidth: 2 } );

	var wireframe = new THREE.LineSegments( geo, mat );

	view.systemEdge = wireframe; 

	scene.add( wireframe );
}

export function removeSystemEdge(view){
	view.scene.remove(view.systemEdge)
}