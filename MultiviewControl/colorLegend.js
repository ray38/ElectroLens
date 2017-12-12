export function insertLegend(view){
	var lut = view.lut
	var legend = lut.setLegendOn( {  'position': { 'x': 8, 'y': -4, 'z': 0 }, 'dimensions': { 'width': 0.5, 'height': 8 } } );
	view.sceneHUD.add( legend );
	view.legend = legend;
	var labels = lut.setLegendLabels( { /*'title': title,*/ 'ticks': 5 ,'fontsize': 55} );

	//view.sceneHUD.add ( labels['title'] );

	for ( var i = 0; i < 5; i++ ) {
		view.sceneHUD.add ( labels[ 'ticks' ][ i ] );
		view.sceneHUD.add ( labels[ 'lines' ][ i ] );
	}
}


export function removeLegend(view) {
	var sceneHUD = view.sceneHUD;
	var elementsInTheScene = sceneHUD.children.length;

	for ( var i = elementsInTheScene-1; i > 0; i-- ) {

		if ( sceneHUD.children [ i ].name != 'camera' &&
			 sceneHUD.children [ i ].name != 'ambientLight' &&
			 sceneHUD.children [ i ].name != 'border' &&
			 sceneHUD.children [ i ].name != 'directionalLight') {

			console.log(sceneHUD.children [ i ].name);
			sceneHUD.remove ( sceneHUD.children [ i ] );

		}

	}

}

export function changeLegend(view) {
	removeLegend(view);
	insertLegend(view);
}