import {getPointCloudGeometry, updatePointCloudGeometry, removePointCloudGeometry, changePointCloudGeometry, addPointCloudPeriodicReplicates, removePointCloudPeriodicReplicates, changePointCloudPeriodicReplicates} from "./PointCloud_selection.js";
import {getMoleculeGeometry, changeMoleculeGeometry, removeMoleculeGeometry, addMoleculePeriodicReplicates, removeMoleculePeriodicReplicates, changeMoleculePeriodicReplicates} from "./MoleculeView.js";
import {insertLegend, removeLegend, changeLegend} from "../MultiviewControl/colorLegend.js";
import {calcDefaultColorScales, adjustColorScaleAccordingToDefault} from "../Utilities/colorScale.js";
import {arrayToIdenticalObject} from "../Utilities/other.js";
export function setupOptionBox3DView(view,plotSetup){

	var options = view.options;
	var propertyList = plotSetup["propertyList"];
	var propertyChoiceObject = arrayToIdenticalObject(propertyList);
	var gui = view.gui;
	gui.width = 200;


	var moleculeFolder 		= gui.addFolder( 'Molecule Selection' );
	var viewFolder 			= gui.addFolder( 'View Selection' );
	var pointCloudFolder 	= gui.addFolder( 'point cloud control' );
	var sliderFolder 		= gui.addFolder( 'Slider Control' );
	var detailFolder		= gui.addFolder( 'Detailed Control' );
	
	moleculeFolder.add( options, 'moleculeName')
	.name( 'Molecule' )
	.onChange(function( value ){
		options.moleculeName = view.moleculeName;
		gui.updateDisplay();		
	});
	moleculeFolder.add( options, 'propertyOfInterest', propertyChoiceObject)
	.name( 'Color Basis' )
	.onChange( function( value ) {
		adjustColorScaleAccordingToDefault(view);
		updatePointCloudGeometry(view);
		
		changeLegend(view);	
		gui.updateDisplay();
	});

	moleculeFolder.add( options, 'atomSize', 0.1, 10 ).step( 0.1 )
	.name( 'Atom Size' )
	.onChange( function( value ) {
		changeMoleculeGeometry(view);
	});
	moleculeFolder.add( options, 'bondSize', 0.1, 5 ).step( 0.1 )
	.name( 'Bond Size' )
	.onChange( function( value ) {
		changeMoleculeGeometry(view);
	});

	moleculeFolder.add( options, 'maxBondLength', 0.1, 5 ).step( 0.1 )
	.name( 'Bond Max' )
	.onChange( function( value ) {
		changeMoleculeGeometry(view);
	});

	moleculeFolder.add( options, 'minBondLength', 0.1, 5 ).step( 0.1 )
	.name( 'Bond Min' )
	.onChange( function( value ) {
		changeMoleculeGeometry(view);
	});

	moleculeFolder.add( options, 'showMolecule')
	.name('Show Molecule')
	.onChange( function( value ) {
		if (value == true) {
			getMoleculeGeometry(view);
			addMoleculePeriodicReplicates(view);
		} else {
			removeMoleculeGeometry(view);
			removeMoleculePeriodicReplicates(view);
		}
	});

	moleculeFolder.add( options, 'showPointCloud')
	.name('Show Point Cloud')
	.onChange( function( value ) {
		if (value == true) {
			getPointCloudGeometry(view);
			addPointCloudPeriodicReplicates(view);
		} else {
			removePointCloudGeometry(view);
			removePointCloudPeriodicReplicates(view);
		}
	});

	moleculeFolder.open();


/*
	viewFolder.add( options, 'view',{'pointCloud':'pointCloud', 'box':'box', 'pointMatrix':'pointMatrix'}).onChange( function( value ){
		changeGeometry(options);
		updateControlPanel(options);
	});*/

	viewFolder.add( options, 'colorMap',{'rainbow':'rainbow', 'cooltowarm':'cooltowarm', 'blackbody':'blackbody', 'grayscale':'grayscale'})
	.name( 'Color Scheme' )
	.onChange( function( value ){
		updatePointCloudGeometry(view);
		changeLegend(view);		
	});
	viewFolder.add( options, 'resetCamera').name('Set Camera');
	//viewFolder.add( options, 'fullscreen');
	//viewFolder.add( options, 'defullscreen');
	viewFolder.add( options, 'toggleFullscreen').name('Fullscreen');
	viewFolder.add( options, 'systemEdgeBoolean')
	.name('System Edge')
	.onChange( function( value ) {
		//updatePointCloudGeometry(view);
		options.toggleSystemEdge.call();
		gui.updateDisplay();
	});
	viewFolder.add( options, 'autoRotateSystem')
	.name('Rotate System')
	.onChange( function( value ) {
		//updatePointCloudGeometry(view);
		//options.toggleSystemEdge.call();
		//gui.updateDisplay();
		//console.log(value)
		view.controller.autoRotate = value;
	});

	var PBCFolder = viewFolder.addFolder('PBC')

	PBCFolder.add( options, 'xPBC', {'1':1, '3':3, '5':5})
	.onChange( function( value ){
		if ((options.xPBC > 1) || (options.yPBC > 1) || (options.zPBC > 1))	{
			if (options.showPointCloud){changePointCloudPeriodicReplicates(view);}
			if (options.showMolecule){changeMoleculePeriodicReplicates(view);}
			options.PBCBoolean = true;
		}
		else {
			removePointCloudPeriodicReplicates(view);
			removeMoleculePeriodicReplicates(view);
			options.PBCBoolean = false;
		}
	});

	PBCFolder.add( options, 'yPBC', {'1':1, '3':3, '5':5})
	.onChange( function( value ){
		if ((options.xPBC > 1) || (options.yPBC > 1) || (options.zPBC > 1))	{
			if (options.showPointCloud){changePointCloudPeriodicReplicates(view);}
			if (options.showMolecule){changeMoleculePeriodicReplicates(view);}
			options.PBCBoolean = true;
		}
		else {
			removePointCloudPeriodicReplicates(view);
			removeMoleculePeriodicReplicates(view);
			options.PBCBoolean = false;
		}
	});

	PBCFolder.add( options, 'zPBC', {'1':1, '3':3, '5':5})
	.onChange( function( value ){
		if ((options.xPBC > 1) || (options.yPBC > 1) || (options.zPBC > 1))	{
			if (options.showPointCloud){changePointCloudPeriodicReplicates(view);}
			if (options.showMolecule){changeMoleculePeriodicReplicates(view);}
			options.PBCBoolean = true;
		}
		else {
			removePointCloudPeriodicReplicates(view);
			removeMoleculePeriodicReplicates(view);
			options.PBCBoolean = false;
		}
	});
	PBCFolder.close();
	viewFolder.open();



	pointCloudFolder.add( options, 'pointCloudParticles', 10, 10000 ).step( 10 )
	.name( 'Density' )
	.onChange( function( value ) {
		changePointCloudGeometry(view);
	});
	pointCloudFolder.add( options, 'pointCloudAlpha',     0, 1 ).step( 0.01 )
	.name( 'Opacity' )
	.onChange( function( value ) {
		updatePointCloudGeometry(view);
	});
	pointCloudFolder.add( options, 'pointCloudSize', 0, 10 ).step( 0.1 )
	.name( 'Size' )
	.onChange( function( value ) {
		updatePointCloudGeometry(view);
	});
	pointCloudFolder.add( options, 'pointCloudColorSettingMin', -1000, 1000 ).step( 0.1 )
	.name( 'Color Scale Min' )
	.onChange( function( value ) {
		updatePointCloudGeometry(view);
		changeLegend(view);	
	});
	pointCloudFolder.add( options, 'pointCloudColorSettingMax', -1000, 1000 ).step( 0.1 )
	.name( 'Color Scale Max' )
	.onChange( function( value ) {
		updatePointCloudGeometry(view);
		changeLegend(view);	
	});
	pointCloudFolder.add( options, 'pointCloudMaxPointPerBlock', 10, 200 ).step( 10 )
	.name( 'Max Density')
	.onChange( function( value ) {
		changePointCloudGeometry(view);
	});
	pointCloudFolder.add( options, 'animate')
	.onChange( function( value ) {
		updatePointCloudGeometry(view);
	});

	//console.log(pointCloudFolder);

	pointCloudFolder.close();



	sliderFolder.add( options, 'x_low', view.xPlotMin, view.xPlotMax ).step( 1 )
	.name( 'x low' )
	.onChange( function( value ) {
		updatePointCloudGeometry(view);
		//updatePlane(options);
	});
	sliderFolder.add( options, 'x_high', view.xPlotMin, view.xPlotMax ).step( 1 )
	.name( 'x high' )
	.onChange( function( value ) {
		updatePointCloudGeometry(view);
		//updatePlane(options);
	});
	sliderFolder.add( options, 'y_low', view.yPlotMin, view.yPlotMax ).step( 1 )
	.name( 'y low' )
	.onChange( function( value ) {
		updatePointCloudGeometry(view);
		//updatePlane(options);
	});
	sliderFolder.add( options, 'y_high', view.yPlotMin, view.yPlotMax ).step( 1 )
	.name( 'y high' )
	.onChange( function( value ) {
		updatePointCloudGeometry(view);
		//updatePlane(options);
	});
	sliderFolder.add( options, 'z_low', view.zPlotMin, view.zPlotMax  ).step( 1 )
	.name( 'z low' )
	.onChange( function( value ) {
		updatePointCloudGeometry(view);
		//updatePlane(options);
	});
	sliderFolder.add( options, 'z_high', view.zPlotMin, view.zPlotMax ).step( 1 )
	.name( 'z high' )
	.onChange( function( value ) {
		updatePointCloudGeometry(view);
		//updatePlane(options);
	});

	sliderFolder.add( options,'x_slider', view.xPlotMin, view.xPlotMax  ).step( 1 ).onChange( function( value ) {
		options.x_low = value-1;
		options.x_high = value+1;
		updatePointCloudGeometry(view);
		//updatePlane(options);
	    gui.updateDisplay();
	});
	sliderFolder.add( options,'y_slider', view.yPlotMin, view.yPlotMax  ).step( 1 ).onChange( function( value ) {
		options.y_low = value-1;
		options.y_high = value+1;
		updatePointCloudGeometry(view);
		//updatePlane(options);
	    gui.updateDisplay();
	});
	sliderFolder.add( options,'z_slider', view.zPlotMin, view.zPlotMax  ).step( 1 ).onChange( function( value ) {
		options.z_low = value-1;
		options.z_high = value+1;
		updatePointCloudGeometry(view);
		//updatePlane(options);
	    gui.updateDisplay();
	});

	detailFolder.add( options, 'autoRotateSpeed', 0.1, 30.0 ).step( 0.1 )
	.name( 'Rotate Speed' )
	.onChange( function( value ) {
		view.controller.autoRotateSpeed = value;
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

	//sliderFolder.open();
	//console.log(gui);
			
}
