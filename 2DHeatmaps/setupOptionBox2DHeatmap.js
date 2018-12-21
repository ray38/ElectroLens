import {arrangeDataToHeatmap, getHeatmap, updateHeatmap, replotHeatmap} from "./HeatmapView.js";
import {insertLegend, removeLegend, changeLegend} from "../MultiviewControl/colorLegend.js";
import {arrayToIdenticalObject} from "../Utilities/other.js";

export function setupOptionBox2DHeatmap(view,plotSetup){

	var options = view.options;
	var gui = view.gui;
	var propertyList = plotSetup["propertyList"];
	var propertyChoiceObject = arrayToIdenticalObject(propertyList);
	gui.width = 200;
	//gui.height = 10;

	//var moleculeFolder 		= gui.addFolder( 'Molecule Selection' );
	var plotFolder			= gui.addFolder( 'Plot Setting' );
	var viewFolder 			= gui.addFolder( 'View Selection' );
	var selectionFolder 	= gui.addFolder( 'Selection' );
	var detailFolder		= gui.addFolder( 'Detailed Control' );
	//var pointCloudFolder 	= gui.addFolder( 'point cloud control' );

	


	plotFolder.add( options, 'plotX', propertyChoiceObject/*{'n':'n','epxc':'epxc', 'gamma':'gamma','ad0p2':'ad0p2','deriv1':'deriv1','deriv2':'deriv2'}*/)
	.name( 'X' )
	.onChange( function( value ) {
		//updatePointCloudGeometry(view);
	});

	plotFolder.add( options, 'plotXTransform', {'linear': 'linear', 'log10': 'log10', 'log10(-1*)': 'neglog10', 'symlog10': 'symlog10', 'symlogPC': 'symlogPC'})
	.name( 'X scale' )
	.onChange( function( value ) {
		//updatePointCloudGeometry(view);
	});

	plotFolder.add( options, 'plotY', propertyChoiceObject/*{'n':'n','epxc':'epxc', 'gamma':'gamma','ad0p2':'ad0p2','deriv1':'deriv1','deriv2':'deriv2'}*/)
	.name( 'Y' )
	.onChange( function( value ) {
		//updatePointCloudGeometry(view);
	});

	plotFolder.add( options, 'plotYTransform', {'linear': 'linear', 'log10': 'log10', 'log10(-1*)': 'neglog10', 'symlog10': 'symlog10', 'symlogPC': 'symlogPC'})
	.name( 'Y scale' )
	.onChange( function( value ) {
		//updatePointCloudGeometry(view);
	});
	plotFolder.add( options, 'numPerSide', 10, 50000)
	.name('# Points')
	.onChange( function( value ) {
		view.xPlotScale = d3.scaleLinear().domain([0, value]).range([-50,50]);
		view.yPlotScale = d3.scaleLinear().domain([0, value]).range([-50,50]);
		//options.replotHeatmap.call();
	});
	plotFolder.add(options, 'replotHeatmap');

	plotFolder.open()


	viewFolder.add( options, 'colorMap',{'rainbow':'rainbow', 'cooltowarm':'cooltowarm', 'blackbody':'blackbody', 'grayscale':'grayscale'})
	.name( 'Color Scheme' )
	.onChange( function( value ){
		updateHeatmap(view);
		changeLegend(view);
	});
	viewFolder.add( options, 'resetCamera');
	//viewFolder.add( options, 'planeSelection');
	//viewFolder.add( options, 'fullscreen');
	//viewFolder.add( options, 'defullscreen');
	viewFolder.add( options, 'toggleFullscreen').name('Fullscreen');
	//viewFolder.open();



	viewFolder.add( options, 'pointCloudAlpha', 0, 1 ).step( 0.01 )
	.name( 'Point Opacity' )
	.onChange( function( value ) {
		updateHeatmap(view);
	});
	viewFolder.add( options, 'pointCloudSize', 0, 10 ).step( 0.1 )
	.name( 'Point Size' )
	.onChange( function( value ) {
		updateHeatmap(view);
	});
	/*pointCloudFolder.add( options, 'pointCloudColorSetting', 0.1, 20.0 ).step( 0.1 ).onChange( function( value ) {
		updatePointCloudGeometry(view);
	});*/
	//pointCloudFolder.open();

	//console.log(gui);

	selectionFolder.add( options, 'selectAll').name('Select all');
	selectionFolder.add( options, 'deselectAll').name('Deselect all');
	selectionFolder.add(options, 'planeSelection')
	.name('with plane')
	.onChange( function( value ) {
		if (value == true && options.pointSelection == true){
			options.pointSelection = false;
			gui.updateDisplay();
		}
	});

	selectionFolder.add(options, 'brushSelection')
	.name('with brush')
	.onChange( function( value ) {
		if (value == true && options.planeSelection == true){
			options.planeSelection = false;
			gui.updateDisplay();
		}
	});



	detailFolder.add(options,'legendX',-10,10).step(0.1).onChange( function( value ) {
		changeLegend(view);	
	});
	detailFolder.add(options,'legendY',-10,10).step(0.1).onChange( function( value ) {
		changeLegend(view);	
	});
	detailFolder.add(options,'legendWidth',0,1).step(0.1).onChange( function( value ) {
		changeLegend(view);	
	});
	detailFolder.add(options,'legendHeight',0,15).step(0.1).onChange( function( value ) {
		changeLegend(view);	
	});
	detailFolder.add(options,'legendTick',1,15).step(1).onChange( function( value ) {
		changeLegend(view);	
	});
	detailFolder.add(options,'legendFontsize',10,75).step(1).onChange( function( value ) {
		changeLegend(view);	
	});
	detailFolder.add( options, 'toggleLegend');

	detailFolder.add(options,'backgroundAlpha',0.0,1.0).step(0.1)
	.name('background transparency')
	.onChange( function( value ) {
		view.backgroundAlpha = value;
	});

	detailFolder.addColor(options,'backgroundColor')
	.name('background')
	.onChange( function( value ) {
		view.background = new THREE.Color(value);
	});

	gui.close();

}