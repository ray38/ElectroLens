export function insertLegend(view){
	const lut = view.lut;
	const options = view.options;
	const legend = lut.setLegendOn( {  'position': { 'x': options.legendX, 'y': options.legendY, 'z': 0 }, 'dimensions': { 'width': options.legendWidth, 'height': options.legendHeight } } );
	view.sceneHUD.add( legend );
	view.legend = legend;
	const labels = lut.setLegendLabels( { /*'title': title,*/ 'ticks': options.legendTick ,'fontsize': options.legendFontsize} );

	//view.sceneHUD.add ( labels['title'] );

	for ( let i = 0; i < options.legendTick; i++ ) {
		view.sceneHUD.add ( labels[ 'ticks' ][ i ] );
		view.sceneHUD.add ( labels[ 'lines' ][ i ] );
	}
}


export function removeLegend(view) {
	const sceneHUD = view.sceneHUD;
	const elementsInTheScene = sceneHUD.children.length;

	for ( let i = elementsInTheScene-1; i > 0; i-- ) {

		if ( sceneHUD.children [ i ].name != 'camera' &&
			 sceneHUD.children [ i ].name != 'ambientLight' &&
			 sceneHUD.children [ i ].name != 'border' &&
			 sceneHUD.children [ i ].name != 'directionalLight') {

			//console.log(sceneHUD.children [ i ].name);
			sceneHUD.remove ( sceneHUD.children [ i ] );

		}

	}

}

export function changeLegend(view) {
	removeLegend(view);
	insertLegend(view);
}

export function insertLegendMolecule(view){
	const lut = view.moleculeLut;
	const options = view.options;
	const legend = lut.setLegendOn( {  'position': { 'x': options.legendXMolecule, 'y': options.legendYMolecule, 'z': 0 }, 'dimensions': { 'width': options.legendWidthMolecule, 'height': options.legendHeightMolecule } } );
	view.sceneHUD.add( legend );
	view.legendMolecule = legend;
	const labels = lut.setLegendLabels( { /*'title': title,*/ 'ticks': options.legendTickMolecule ,'fontsize': options.legendFontsizeMolecule} );

	//view.sceneHUD.add ( labels['title'] );

	for ( let i = 0; i < options.legendTickMolecule; i++ ) {
		view.sceneHUD.add ( labels[ 'ticks' ][ i ] );
		view.sceneHUD.add ( labels[ 'lines' ][ i ] );
	}
}


export function removeLegendMolecule(view) {
	const sceneHUD = view.sceneHUD;
	const elementsInTheScene = sceneHUD.children.length;

	for ( let i = elementsInTheScene-1; i > 0; i-- ) {

		if ( sceneHUD.children [ i ].name != 'camera' &&
			 sceneHUD.children [ i ].name != 'ambientLight' &&
			 sceneHUD.children [ i ].name != 'border' &&
			 sceneHUD.children [ i ].name != 'directionalLight') {

			//console.log(sceneHUD.children [ i ].name);
			sceneHUD.remove ( sceneHUD.children [ i ] );

		}

	}

}

export function changeLegendMolecule(view) {
	removeLegendMolecule(view);
	insertLegendMolecule(view);
	//if (view.options.moleculeColorCodeBasis != "atom"){insertLegendMolecule(view);}
	
}