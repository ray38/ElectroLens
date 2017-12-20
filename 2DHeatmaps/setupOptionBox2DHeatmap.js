import {arrangeDataToHeatmap, getHeatmap, updateHeatmap, replotHeatmap} from "./HeatmapView.js";
import {insertLegend, removeLegend, changeLegend} from "../MultiviewControl/colorLegend.js";
export function setupOptionBox2DHeatmap(view){

	var options = view.options;
	var gui = view.gui;
	gui.width = 200;
	//gui.height = 10;

	//var moleculeFolder 		= gui.addFolder( 'Molecule Selection' );
	var plotFolder			= gui.addFolder( 'Plot Setting' );
	var viewFolder 			= gui.addFolder( 'View Selection' );
	var detailFolder		= gui.addFolder( 'Detailed Control' );
	//var pointCloudFolder 	= gui.addFolder( 'point cloud control' );

	
/*	moleculeFolder.add( options, 'moleculeName')
	.name( 'Molecule' )
	.onChange(function( value ){
		options.moleculeName = view.moleculeName;
		gui.updateDisplay();		
	});
	moleculeFolder.add( options, 'propertyOfInterest',{'n':'n','epxc':'epxc', 'gamma':'gamma','ad0p2':'ad0p2','deriv1':'deriv1','deriv2':'deriv2'})
	.name( 'Color Basis' )
	.onChange( function( value ) {
		updatePointCloudGeometry(view);
	});
	moleculeFolder.open();*/


/*
	viewFolder.add( options, 'view',{'pointCloud':'pointCloud', 'box':'box', 'pointMatrix':'pointMatrix'}).onChange( function( value ){
		changeGeometry(options);
		updateControlPanel(options);
	});*/

	plotFolder.add( options, 'plotX', {'n':'n','epxc':'epxc', 'gamma':'gamma','ad0p2':'ad0p2','deriv1':'deriv1','deriv2':'deriv2'})
	.name( 'X' )
	.onChange( function( value ) {
		//updatePointCloudGeometry(view);
	});

	plotFolder.add( options, 'plotXTransform', {'linear': 'linear', 'log10': 'log10', 'log10(-1*)': 'neglog10'})
	.name( 'X scale' )
	.onChange( function( value ) {
		//updatePointCloudGeometry(view);
	});

	plotFolder.add( options, 'plotY', {'n':'n','epxc':'epxc', 'gamma':'gamma','ad0p2':'ad0p2','deriv1':'deriv1','deriv2':'deriv2'})
	.name( 'Y' )
	.onChange( function( value ) {
		//updatePointCloudGeometry(view);
	});

	plotFolder.add( options, 'plotYTransform', {'linear': 'linear', 'log10': 'log10', 'log10(-1*)': 'neglog10'})
	.name( 'Y scale' )
	.onChange( function( value ) {
		//updatePointCloudGeometry(view);
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
	//viewFolder.add( options, 'fullscreen');
	//viewFolder.add( options, 'defullscreen');
	viewFolder.add( options, 'toggleFullscreen').name('Fullscreen');
	//viewFolder.open();



	viewFolder.add( options, 'pointCloudAlpha',     0, 1 ).step( 0.01 )
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

	gui.close();

}