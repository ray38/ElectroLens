import {getPointCloudGeometry, updatePointCloudGeometry, removePointCloudGeometry, changePointCloudGeometry} from "./PointCloud_selection.js";
import {getMoleculeGeometry, changeMoleculeGeometry, removeMoleculeGeometry, updateMoleculeGeometry,updateMoleculeGeometrySlider} from "./MoleculeView.js";
import {insertLegend, removeLegend, changeLegend, insertLegendMolecule, removeLegendMolecule, changeLegendMolecule} from "../MultiviewControl/colorLegend.js";
import {calcDefaultScalesSpatiallyResolvedData, adjustColorScaleAccordingToDefaultSpatiallyResolvedData, calcDefaultScalesMoleculeData, adjustScaleAccordingToDefaultMoleculeData} from "../Utilities/scale.js";
import {arrayToIdenticalObject} from "../Utilities/other.js";
import {updateCamLightPosition, updateCameraFov} from "../MultiviewControl/setupViewBasic.js";
import {colorMapDict} from "../Utilities/colorMap.js";
export function setupOptionBox3DView(view,plotSetup){

	var options = view.options;

	if (view.systemSpatiallyResolvedDataBoolean) {
		var propertyList = plotSetup["spatiallyResolvedPropertyList"];
		var propertyChoiceObject = arrayToIdenticalObject(propertyList);
	}

	if (view.systemMoleculeDataBoolean) {
		var moleculeDataFeatureList = plotSetup["moleculePropertyList"];
		//if (moleculeDataFeatureList.includes('atom') == false){
		// console.log(moleculeDataFeatureList.indexOf("atom"))
		if (moleculeDataFeatureList.indexOf("atom") < 0){
			moleculeDataFeatureList.push("atom");
		}
		var moleculeDataFeatureChoiceObject = arrayToIdenticalObject(moleculeDataFeatureList);
	}
	var gui = view.gui;
	//gui.remember(options);
	gui.width = 200;

	var systemInfoFolder	= gui.addFolder( 'System Info' );
	var viewFolder 			= gui.addFolder( 'View Control' );
	if (view.systemMoleculeDataBoolean) {var moleculeFolder = gui.addFolder( 'Molecule View Control' );}
	if (view.systemSpatiallyResolvedDataBoolean) {var pointCloudFolder = gui.addFolder( 'Point Cloud Control' );}
	var sliderFolder 		= gui.addFolder( 'Slider Control' );
	var detailFolder		= gui.addFolder( 'Additional Control' );


	
	systemInfoFolder.add( options, 'moleculeName')
	.name( 'Name' )
	.onChange(function( value ){
		options.moleculeName = view.moleculeName;
		gui.updateDisplay();		
	});

	if (view.systemMoleculeDataBoolean) { systemInfoFolder.add( options, 'saveSystemMoleculeData').name('Save Molecule');}
	if (view.systemSpatiallyResolvedDataBoolean) {systemInfoFolder.add( options, 'saveSystemSpatiallyResolvedData').name('Save Spatially Resolved');}

	systemInfoFolder.add( options, 'showMolecule')
	.name('Show Molecule')
	.onChange( function( value ) {
		if (value == true) {
			getMoleculeGeometry(view);
		} else {
			removeMoleculeGeometry(view);
		}
	});

	systemInfoFolder.add( options, 'showPointCloud')
	.name('Show Point Cloud')
	.onChange( function( value ) {
		if (value == true) {
			getPointCloudGeometry(view);
		} else {
			removePointCloudGeometry(view);
		}
	});

	systemInfoFolder.open();





	viewFolder.add( options, 'resetCamera').name('Set Camera');
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
		view.controller.autoRotate = value;
	});
	if (view.frameBool){
		viewFolder.add( options, 'currentFrame', view.frameMin, view.frameMax).step(1)
		.name('Current Frame')
		.onChange( function( value ) {
			if (options.showPointCloud && view.systemSpatiallyResolvedDataBoolean){
				updatePointCloudGeometry(view);
			}
			if (options.showMolecule && view.systemMoleculeDataBoolean){
				changeMoleculeGeometry(view);
			}
		});
	}

	viewFolder.open();





	var PBCFolder = viewFolder.addFolder('PBC')

	PBCFolder.add( options, 'xPBC', {'1':1, '3':3, '5':5, '7':7, '9':9})
	.onChange( function( value ){
		if (options.showPointCloud && view.systemSpatiallyResolvedDataBoolean){updatePointCloudGeometry(view);}
		if (options.showMolecule && view.systemMoleculeDataBoolean){updateMoleculeGeometry(view);}
	});

	PBCFolder.add( options, 'yPBC', {'1':1, '3':3, '5':5, '7':7, '9':9})
	.onChange( function( value ){
		if (options.showPointCloud && view.systemSpatiallyResolvedDataBoolean){updatePointCloudGeometry(view);}
		if (options.showMolecule && view.systemMoleculeDataBoolean){updateMoleculeGeometry(view);}
	});

	PBCFolder.add( options, 'zPBC', {'1':1, '3':3, '5':5, '7':7, '9':9})
	.onChange( function( value ){
		if (options.showPointCloud && view.systemSpatiallyResolvedDataBoolean){updatePointCloudGeometry(view);}
		if (options.showMolecule && view.systemMoleculeDataBoolean){updateMoleculeGeometry(view);}
	});
	PBCFolder.close();
	


	if (view.systemMoleculeDataBoolean) {

		moleculeFolder.add( options, 'interactiveMolecule')
		.name( 'Interactive?' )
		.onChange( function( value ) {
			if (value == true && view.options.interactiveSpatiallyResolved) {
				view.options.interactiveSpatiallyResolved = false;
			}
			gui.updateDisplay();
		});


		moleculeFolder.add( options, 'showAtoms')
		.name( 'Show Atoms' )
		.onChange( function( value ) {
			changeMoleculeGeometry(view);
		});

		moleculeFolder.add( options, 'showBonds')
		.name( 'Show Bonds' )
		.onChange( function( value ) {
			changeMoleculeGeometry(view);
		});

		moleculeFolder.add( options, 'atomsStyle',{"sprite":"sprite", "ball":"ball"})
		.name( 'Atom Style' )
		.onChange( function( value ) {
			changeMoleculeGeometry(view);
		});

		moleculeFolder.add( options, 'bondsStyle',{"line":"line", "tube":"tube", "fatline": "fatline"})
		.name( 'Bond Style' )
		.onChange( function( value ) {
			changeMoleculeGeometry(view);
		});

		moleculeFolder.add( options, 'moleculeColorCodeBasis', moleculeDataFeatureChoiceObject)
		.name( 'Color Basis' )
		.onChange( function( value ) {
			//adjustColorScaleAccordingToDefault(view);
			if (value == "atom"){removeLegendMolecule(view);}
			adjustScaleAccordingToDefaultMoleculeData(view);
			updateMoleculeGeometry(view);
			if (value != "atom"){changeLegendMolecule(view);}
			gui.updateDisplay();
		});

		moleculeFolder.add( options, 'moleculeColorSettingMin', -100, 100 ).step( 0.1 )
		.name( 'Color Scale Min' )
		.onChange( function( value ) {
			updateMoleculeGeometry(view);
			changeLegendMolecule(view);	
		});
		moleculeFolder.add( options, 'moleculeColorSettingMax', -100, 100 ).step( 0.1 )
		.name( 'Color Scale Max' )
		.onChange( function( value ) {
			updateMoleculeGeometry(view);
			changeLegendMolecule(view);	
		});

		moleculeFolder.add( options, 'moleculeSizeCodeBasis', moleculeDataFeatureChoiceObject)
		.name( 'Size Basis' )
		.onChange( function( value ) {
			//adjustColorScaleAccordingToDefault(view);
			adjustScaleAccordingToDefaultMoleculeData(view);
			updateMoleculeGeometry(view);
			gui.updateDisplay();
		});

		moleculeFolder.add( options, 'moleculeSizeSettingMin', -100, 100 ).step( 0.1 )
		.name( 'Size Scale Min' )
		.onChange( function( value ) {
			updateMoleculeGeometry(view);
		});
		moleculeFolder.add( options, 'moleculeSizeSettingMax', -100, 100 ).step( 0.1 )
		.name( 'Size Scale Max' )
		.onChange( function( value ) {
			updateMoleculeGeometry(view);
		});

		moleculeFolder.add( options, 'atomSize', 0.01, 2 ).step( 0.01 )
		.name( 'Atom Size' )
		.onChange( function( value ) {
			updateMoleculeGeometry(view);
		});
		moleculeFolder.add( options, 'bondSize', 0.01, 0.5 ).step( 0.01 )
		.name( 'Bond Size' )
		.onChange( function( value ) {
			changeMoleculeGeometry(view);
		});
		moleculeFolder.add( options, 'moleculeAlpha', 0.1, 1.0 ).step( 0.1 )
		.name( 'Molecule Opacity' )
		.onChange( function( value ) {
			changeMoleculeGeometry(view);
		});


		moleculeFolder.add( options, 'maxBondLength', 0.1, 4 ).step( 0.1 )
		.name( 'Bond Max' )
		.onChange( function( value ) {
			changeMoleculeGeometry(view);
		});

		moleculeFolder.add( options, 'minBondLength', 0.1, 4 ).step( 0.1 )
		.name( 'Bond Min' )
		.onChange( function( value ) {
			changeMoleculeGeometry(view);
		});

		moleculeFolder.close();

		var moleculeLegendFolder 	= moleculeFolder.addFolder( 'Molecule Legend' );

		moleculeLegendFolder.add(options,'legendXMolecule',-10,10).name("Position X").step(0.1).onChange( function( value ) {
			changeLegend(view);	
		});
		moleculeLegendFolder.add(options,'legendYMolecule',-10,10).name("Position Y").step(0.1).onChange( function( value ) {
			changeLegend(view);	
		});
		moleculeLegendFolder.add(options,'legendWidthMolecule',0,1).name("Width").step(0.1).onChange( function( value ) {
			changeLegend(view);	
		});
		moleculeLegendFolder.add(options,'legendHeightMolecule',0,15).name("Height").step(0.1).onChange( function( value ) {
			changeLegend(view);	
		});
		moleculeLegendFolder.add(options,'legendTickMolecule',1,15).name("Tick").step(1).onChange( function( value ) {
			changeLegend(view);	
		});
		moleculeLegendFolder.add(options,'legendFontsizeMolecule',10,75).name("Fontsize").step(1).onChange( function( value ) {
			changeLegend(view);	
		});
		moleculeLegendFolder.add( options, 'toggleLegendMolecule').name("Toggle legend");
		moleculeLegendFolder.close();

		var moleculeAdditionalFolder 	= moleculeFolder.addFolder( 'Additional' );

		moleculeAdditionalFolder.add( options, 'atomModelSegments', 4, 50 ).step( 1 )
		.name( 'Atom Resolution' )
		.onChange( function( value ) {
			changeMoleculeGeometry(view);
		});
		moleculeAdditionalFolder.add( options, 'bondModelSegments', 4, 30 ).step( 1 )
		.name( 'Bond Resolution' )
		.onChange( function( value ) {
			changeMoleculeGeometry(view);
		});
		moleculeAdditionalFolder.close();

		moleculeAdditionalFolder.add( options, 'cameraLightPositionX', -20000, 20000 ).step( 50 )
		.name( 'Cam. Light X' )
		.onChange( function( value ) {
			updateCamLightPosition(view);
		});

		moleculeAdditionalFolder.add( options, 'cameraLightPositionY', -20000, 20000 ).step( 50 )
		.name( 'Cam. Light Y' )
		.onChange( function( value ) {
			updateCamLightPosition(view);
		});

		moleculeAdditionalFolder.add( options, 'cameraLightPositionZ', -20000, 20000 ).step( 50 )
		.name( 'Cam. Light Z' )
		.onChange( function( value ) {
			updateCamLightPosition(view);
		});


	}

/*
	viewFolder.add( options, 'view',{'pointCloud':'pointCloud', 'box':'box', 'pointMatrix':'pointMatrix'}).onChange( function( value ){
		changeGeometry(options);
		updateControlPanel(options);
	});*/


	

	if (view.systemSpatiallyResolvedDataBoolean) {
		pointCloudFolder.add( options, 'interactiveSpatiallyResolved')
		.name( 'Interactive?' )
		.onChange( function( value ) {
			if (value == true && view.options.interactiveMolecule) {
				view.options.interactiveMolecule = false;
			}
			gui.updateDisplay();
		});
		pointCloudFolder.add( options, 'propertyOfInterest', propertyChoiceObject)
		.name( 'Color Basis' )
		.onChange( function( value ) {
			adjustColorScaleAccordingToDefaultSpatiallyResolvedData(view);
			updatePointCloudGeometry(view);
			changeLegend(view);	
			gui.updateDisplay();
		});
		
		pointCloudFolder.add( options, 'colorMap', colorMapDict )
		.name( 'Color Scheme' )
		.onChange( function( value ){
			updatePointCloudGeometry(view);
			changeLegend(view);		
		});

		pointCloudFolder.add( options, 'pointCloudParticles', 0, 100 ).step( 0.1 )
		.name( 'Density' )
		.onChange( function( value ) {
			changePointCloudGeometry(view);
		});
		
		pointCloudFolder.add( options, 'pointCloudAlpha', 0, 1 ).step( 0.01 )
		.name( 'Opacity' )
		.onChange( function( value ) {
			updatePointCloudGeometry(view);
		});
		pointCloudFolder.add( options, 'pointCloudSize', 0.01, 1 ).step( 0.01 )
		.name( 'Size' )
		.onChange( function( value ) {
			updatePointCloudGeometry(view);
		});
		pointCloudFolder.add( options, 'pointCloudColorSettingMin', -1000, 1000 ).step( 0.001 )
		.name( 'Color Scale Min' )
		.onChange( function( value ) {
			updatePointCloudGeometry(view);
			changeLegend(view);	
		});
		pointCloudFolder.add( options, 'pointCloudColorSettingMax', -1000, 1000 ).step( 0.001 )
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
		// pointCloudFolder.add( options, 'animate')
		// .onChange( function( value ) {
		// 	updatePointCloudGeometry(view);
		// });

		pointCloudFolder.close();

		var pointCloudLegendFolder 	= pointCloudFolder.addFolder( 'Point Cloud Legend' );

		pointCloudLegendFolder.add(options,'legendX',-10,10).step(0.1).onChange( function( value ) {
			changeLegend(view);	
		});
		pointCloudLegendFolder.add(options,'legendY',-10,10).step(0.1).onChange( function( value ) {
			changeLegend(view);	
		});
		pointCloudLegendFolder.add(options,'legendWidth',0,1).step(0.1).onChange( function( value ) {
			changeLegend(view);	
		});
		pointCloudLegendFolder.add(options,'legendHeight',0,15).step(0.1).onChange( function( value ) {
			changeLegend(view);	
		});
		pointCloudLegendFolder.add(options,'legendTick',1,15).step(1).onChange( function( value ) {
			changeLegend(view);	
		});
		pointCloudLegendFolder.add(options,'legendFontsize',10,75).step(1).onChange( function( value ) {
			changeLegend(view);	
		});
		pointCloudLegendFolder.add( options, 'toggleLegend').name("Toggle legend");
		pointCloudLegendFolder.close();

		var pointCloudAdditionalFolder 	= pointCloudFolder.addFolder( 'Additional' );

		pointCloudAdditionalFolder.add( options, 'pointCloudTotalMagnitude', -5, 10 ).step( 1 )
		.name( 'Dens. Magnitude' )
		.onChange( function( value ) {
			changePointCloudGeometry(view);
		});
		pointCloudAdditionalFolder.close();

	}

	sliderFolder.add( options, 'x_low', view.xPlotMin, view.xPlotMax ).step( 1 )
	.name( 'x low' )
	.onChange( function( value ) {
		if (view.systemSpatiallyResolvedDataBoolean){updatePointCloudGeometry(view);}
		if (view.systemMoleculeDataBoolean){updateMoleculeGeometrySlider(view);}
		//updatePlane(options);
	});
	sliderFolder.add( options, 'x_high', view.xPlotMin, view.xPlotMax ).step( 1 )
	.name( 'x high' )
	.onChange( function( value ) {
		if (view.systemSpatiallyResolvedDataBoolean){updatePointCloudGeometry(view);}
		if (view.systemMoleculeDataBoolean){updateMoleculeGeometrySlider(view);}
		//updatePlane(options);
	});
	sliderFolder.add( options, 'y_low', view.yPlotMin, view.yPlotMax ).step( 1 )
	.name( 'y low' )
	.onChange( function( value ) {
		if (view.systemSpatiallyResolvedDataBoolean){updatePointCloudGeometry(view);}
		if (view.systemMoleculeDataBoolean){updateMoleculeGeometrySlider(view);}
		//updatePlane(options);
	});
	sliderFolder.add( options, 'y_high', view.yPlotMin, view.yPlotMax ).step( 1 )
	.name( 'y high' )
	.onChange( function( value ) {
		if (view.systemSpatiallyResolvedDataBoolean){updatePointCloudGeometry(view);}
		if (view.systemMoleculeDataBoolean){updateMoleculeGeometrySlider(view);}
		//updatePlane(options);
	});
	sliderFolder.add( options, 'z_low', view.zPlotMin, view.zPlotMax  ).step( 1 )
	.name( 'z low' )
	.onChange( function( value ) {
		if (view.systemSpatiallyResolvedDataBoolean){updatePointCloudGeometry(view);}
		if (view.systemMoleculeDataBoolean){updateMoleculeGeometrySlider(view);}
		//updatePlane(options);
	});
	sliderFolder.add( options, 'z_high', view.zPlotMin, view.zPlotMax ).step( 1 )
	.name( 'z high' )
	.onChange( function( value ) {
		if (view.systemSpatiallyResolvedDataBoolean){updatePointCloudGeometry(view);}
		if (view.systemMoleculeDataBoolean){updateMoleculeGeometrySlider(view);}
		//updatePlane(options);
	});

	sliderFolder.add( options,'x_slider', view.xPlotMin, view.xPlotMax  ).step( 1 ).onChange( function( value ) {
		options.x_low = value-1;
		options.x_high = value+1;
		if (view.systemSpatiallyResolvedDataBoolean){updatePointCloudGeometry(view);}
		if (view.systemMoleculeDataBoolean){updateMoleculeGeometrySlider(view);}
		//updatePlane(options);
	    gui.updateDisplay();
	});
	sliderFolder.add( options,'y_slider', view.yPlotMin, view.yPlotMax  ).step( 1 ).onChange( function( value ) {
		options.y_low = value-1;
		options.y_high = value+1;
		if (view.systemSpatiallyResolvedDataBoolean){updatePointCloudGeometry(view);}
		if (view.systemMoleculeDataBoolean){updateMoleculeGeometrySlider(view);}
		//updatePlane(options);
	    gui.updateDisplay();
	});
	sliderFolder.add( options,'z_slider', view.zPlotMin, view.zPlotMax  ).step( 1 ).onChange( function( value ) {
		options.z_low = value-1;
		options.z_high = value+1;
		if (view.systemSpatiallyResolvedDataBoolean){updatePointCloudGeometry(view);}
		if (view.systemMoleculeDataBoolean){updateMoleculeGeometrySlider(view);}
		//updatePlane(options);
	    gui.updateDisplay();
	});

	detailFolder.add( options, 'cameraFov', 30, 150 ).step( 5 )
	.name( 'Camera Fov' )
	.onChange( function( value ) {
		updateCameraFov(view);
	});

	detailFolder.add( options, 'autoRotateSpeed', 0.1, 30.0 ).step( 0.1 )
	.name( 'Rotate Speed' )
	.onChange( function( value ) {
		view.controller.autoRotateSpeed = value;
	});

	

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
