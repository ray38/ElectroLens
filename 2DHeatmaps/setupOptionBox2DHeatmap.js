import {arrangeDataToHeatmap, getHeatmap, updateHeatmap, replotHeatmap} from "./HeatmapView.js";
import {insertLegend, removeLegend, changeLegend} from "../MultiviewControl/colorLegend.js";
import {arrayToIdenticalObject} from "../Utilities/other.js";

export function setupOptionBox2DHeatmap(view,plotSetup){

	var options = view.options;
	var gui = view.gui;
	//var propertyList = plotSetup["spatiallyResolvedPropertyList"];
	//var propertyChoiceObject = arrayToIdenticalObject(propertyList);

	if (view.overallSpatiallyResolvedDataBoolean) {
		var propertyList = plotSetup["spatiallyResolvedPropertyList"];
		var propertyChoiceObject = arrayToIdenticalObject(propertyList);
	}

	if (view.overallMoleculeDataBoolean) {
		var moleculeDataFeatureList = plotSetup["moleculePropertyList"];
		var moleculeDataFeatureChoiceObject = arrayToIdenticalObject(moleculeDataFeatureList);
	}
	gui.width = 200;
	//gui.height = 10;

	var plotFolder			= gui.addFolder( 'Plot Setting' );
	var viewFolder 			= gui.addFolder( 'View Control' );
	var selectionFolder 	= gui.addFolder( 'Selection' );

	if (view.overallMoleculeDataBoolean) {var moleculeFolder = gui.addFolder( 'Molecular Data' );}
	if (view.overallSpatiallyResolvedDataBoolean) {var spatiallyResolvedFolder = gui.addFolder( 'Spatially Resolved Data' );}
	
	var detailFolder		= gui.addFolder( 'Additional Control' );

	
	plotFolder.add( options, 'plotData', {'spatially resolved': 'spatiallyResolvedData' , 'molecular': 'moleculeData'})
	.name( 'Plot Data' )
	.onChange( function( value ) {
		//updatePointCloudGeometry(view);
	});

	/*plotFolder.add( options, 'plotX', propertyChoiceObject)
	.name( 'X' )
	.onChange( function( value ) {
		//updatePointCloudGeometry(view);
	});

	plotFolder.add( options, 'plotXTransform', {'linear': 'linear', 'log10': 'log10', 'log10(-1*)': 'neglog10', 'symlog10': 'symlog10', 'symlogPC': 'symlogPC'})
	.name( 'X scale' )
	.onChange( function( value ) {
		//updatePointCloudGeometry(view);
	});

	plotFolder.add( options, 'plotY', propertyChoiceObject)
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
	});*/
	plotFolder.add(options, 'replotHeatmap');

	plotFolder.open()


	viewFolder.add( options, 'colorMap',{'rainbow':'rainbow', 'cooltowarm':'cooltowarm', 'blackbody':'blackbody', 'grayscale':'grayscale'})
	.name( 'Color Scheme' )
	.onChange( function( value ){
		updateHeatmap(view);
		changeLegend(view);
	});
	viewFolder.add( options, 'resetCamera');
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

	/*selectionFolder.add( options, 'selectAllSpatiallyResolvedData').name('Select all');
	selectionFolder.add( options, 'deselectAllSpatiallyResolvedData').name('Deselect all');*/
	selectionFolder.add(options, 'planeSelection')
	.name('with plane')
	.onChange( function( value ) {
		if (value == true && options.brushSelection == true){
			options.brushSelection = false;
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

	selectionFolder.add(options,'selectionBrushSize',0.5,10).step(0.1)
	.name('brush size')
	.onChange( function( value ) {
		options.brushSelection = false;
		options.planeSelection = false;
		gui.updateDisplay();
	});


	if (view.overallMoleculeDataBoolean){
		moleculeFolder.add( options, 'plotXMoleculeData', moleculeDataFeatureChoiceObject)
		.name( 'X' )
		.onChange( function( value ) {
			//updatePointCloudGeometry(view);
		});

		moleculeFolder.add( options, 'plotXTransformMoleculeData', {'linear': 'linear', 'log10': 'log10', 'log10(-1*)': 'neglog10', 'symlog10': 'symlog10', 'symlogPC': 'symlogPC'})
		.name( 'X scale' )
		.onChange( function( value ) {
			//updatePointCloudGeometry(view);
		});

		moleculeFolder.add( options, 'plotYMoleculeData', moleculeDataFeatureChoiceObject)
		.name( 'Y' )
		.onChange( function( value ) {
			//updatePointCloudGeometry(view);
		});

		moleculeFolder.add( options, 'plotYTransformMoleculeData', {'linear': 'linear', 'log10': 'log10', 'log10(-1*)': 'neglog10', 'symlog10': 'symlog10', 'symlogPC': 'symlogPC'})
		.name( 'Y scale' )
		.onChange( function( value ) {
			//updatePointCloudGeometry(view);
		});

		moleculeFolder.add( options, 'selectAllMoleculeData').name('Select all');
		moleculeFolder.add( options, 'deselectAllMoleculeData').name('Deselect all');

		moleculeFolder.close();

	}

	if (view.overallMoleculeDataBoolean){
		spatiallyResolvedFolder.add( options, 'plotXSpatiallyResolvedData', moleculeDataFeatureChoiceObject)
		.name( 'X' )
		.onChange( function( value ) {
			//updatePointCloudGeometry(view);
		});

		spatiallyResolvedFolder.add( options, 'plotXTransformSpatiallyResolvedData', {'linear': 'linear', 'log10': 'log10', 'log10(-1*)': 'neglog10', 'symlog10': 'symlog10', 'symlogPC': 'symlogPC'})
		.name( 'X scale' )
		.onChange( function( value ) {
			//updatePointCloudGeometry(view);
		});

		spatiallyResolvedFolder.add( options, 'plotYSpatiallyResolvedData', moleculeDataFeatureChoiceObject)
		.name( 'Y' )
		.onChange( function( value ) {
			//updatePointCloudGeometry(view);
		});

		spatiallyResolvedFolder.add( options, 'plotYTransformSpatiallyResolvedData', {'linear': 'linear', 'log10': 'log10', 'log10(-1*)': 'neglog10', 'symlog10': 'symlog10', 'symlogPC': 'symlogPC'})
		.name( 'Y scale' )
		.onChange( function( value ) {
			//updatePointCloudGeometry(view);
		});

		spatiallyResolvedFolder.add( options, 'selectAllSpatiallyResolvedData').name('Select all');
		spatiallyResolvedFolder.add( options, 'deselectAllSpatiallyResolvedData').name('Deselect all');

		spatiallyResolvedFolder.close();

	}



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