import {arrangeDataForCovariance, getCovariance, updateCovariance, replotCovariance} from "./covarianceView.js";
import {arrangeDataToHeatmap, getHeatmap, updateHeatmap, replotHeatmap} from "./HeatmapView.js";
import {arrangeDataToComparison, getComparison, updateComparison, replotComparison} from "./comparisonView.js";
import {arrangeDataForPCA, getPCAHeatmap, updatePCAHeatmap, replotPCAHeatmap} from "./PCAView.js";
import {insertLegend, removeLegend, changeLegend} from "../MultiviewControl/colorLegend.js";
import {arrayToIdenticalObject} from "../Utilities/other.js";
import {colorMapDict} from "../Utilities/colorMap.js";

dat.GUI.prototype.removeFolder = function(name) {
	const folder = this.__folders[name];
  if (!folder) {
    return;
  }
  folder.close();
  this.__ul.removeChild(folder.domElement.parentNode);
  delete this.__folders[name];
  this.onResize();
}

export function setupOptionBox2DHeatmap(view,plotSetup){

	const options = view.options;
	const gui = view.gui;
	//gui.remember(options);

	gui.width = 250;
	//gui.height = 10;

	gui.add( options, 'plotID');
	gui.add( options, 'plotType', {'Heatmap': 'Heatmap', 'Comparison':'Comparison', 'Correlation': 'Correlation','PCA':'PCA', 'Umap':'Umap'})
	.name( 'Plot Type' )
	.onChange( function( value ) {
		console.log("removing plot");
		try {gui.removeFolder("Plot");}
		catch(err){console.log("not exist");}

		const plotSetupFolder = gui.addFolder("Plot");
		if (value == "Heatmap"){
			setupOptionBox2DHeatmapFolder(view,plotSetup, plotSetupFolder);
		}

		if (value == "Correlation"){
			setupOptionBox2DCovarianceFolder(view,plotSetup, plotSetupFolder);
		}

		if (value == "PCA"){
			setupOptionBox2DPCAFolder(view,plotSetup, plotSetupFolder);
		}

		if (value == "Umap"){
			setupOptionBox2DUmapFolder(view,plotSetup, plotSetupFolder);
		}

		if (value == "Comparison"){
			setupOptionBox2DComparisonFolder(view,plotSetup, plotSetupFolder);
		}
		//updatePointCloudGeometry(view);
	});

	gui.open();

}

export function setupOptionBox2DHeatmapFolder(view,plotSetup, folder){
	const gui = view.gui;
	const options = view.options;
	let spatiallyResolvedFeatureChoiceObject, moleculeDataFeatureChoiceObject;
	if (view.overallSpatiallyResolvedDataBoolean) {
		const spatiallyResolvedFeatureList = plotSetup["spatiallyResolvedPropertyList"];
		spatiallyResolvedFeatureChoiceObject = arrayToIdenticalObject(spatiallyResolvedFeatureList);
	}

	if (view.overallMoleculeDataBoolean) {
		const moleculeDataFeatureList = plotSetup["moleculePropertyList"];
		moleculeDataFeatureChoiceObject = arrayToIdenticalObject(moleculeDataFeatureList);
	}
	const plotFolder			= folder.addFolder( 'Plot Setting' );
	const viewFolder 			= folder.addFolder( 'View Control' );
	const selectionFolder 	= folder.addFolder( 'Selection' );


	let moleculeFolder, spatiallyResolvedFolder;
	if (view.overallMoleculeDataBoolean && view.overallSpatiallyResolvedDataBoolean) {
		moleculeFolder = folder.addFolder( 'Molecular Data' );
		spatiallyResolvedFolder = folder.addFolder( 'Spatially Resolved Data' );
	}
	
	const detailFolder		= folder.addFolder( 'Additional Control' );

	if (view.overallMoleculeDataBoolean && view.overallSpatiallyResolvedDataBoolean) {
		plotFolder.add( options, 'plotData', {'spatially resolved': 'spatiallyResolvedData' , 'molecular': 'moleculeData'})
		.name( 'Plot Data' )
		.onChange( function( value ) {
			if (value == 'spatiallyResolvedData') {
				moleculeFolder.close();
				spatiallyResolvedFolder.open();
			}
			if (value == 'moleculeData') {
				moleculeFolder.open();
				spatiallyResolvedFolder.close();
			}

		});
	}
	else {
		plotFolder.add( options, 'plotData')
		.name( 'Plot Data' );
	}

	


	plotFolder.add( options, 'numPerSide', 10, 10000).step( 1 )
	.name('Resolution')
	.onChange( function( value ) {
		view.xPlotScale = d3.scaleLinear().domain([0, value]).range([-50,50]);
		view.yPlotScale = d3.scaleLinear().domain([0, value]).range([-50,50]);
		//options.replotHeatmap.call();
	});
	if (view.overallMoleculeDataBoolean) { plotFolder.add( options, 'saveOverallMoleculeData').name('Save Molecule');}
	if (view.overallSpatiallyResolvedDataBoolean) {plotFolder.add( options, 'saveOverallSpatiallyResolvedData').name('Save Spatially Resolved');}

	

	if (view.overallMoleculeDataBoolean && view.overallSpatiallyResolvedDataBoolean == false) {
		plotFolder.add(options, 'activePlotMolecule').name('active plot')
		.onChange( function(value) {
			if (value == true) {
				view.activate2DPlotMolecule();
			} else {
				view.deactivate2DPlotMolecule()
			}
		});
		plotFolder.add( options, 'plotXMoleculeData', moleculeDataFeatureChoiceObject)
		.name( 'X' )
		.onChange( function( value ) {
			//updatePointCloudGeometry(view);
		});

		plotFolder.add( options, 'plotXTransformMoleculeData', {'linear': 'linear', 'log10': 'log10', 'log10(-1*)': 'neglog10'/*, 'symlog10': 'symlog10', 'symlogPC': 'symlogPC'*/})
		.name( 'X scale' )
		.onChange( function( value ) {
			//updatePointCloudGeometry(view);
		});

		plotFolder.add( options, 'plotYMoleculeData', moleculeDataFeatureChoiceObject)
		.name( 'Y' )
		.onChange( function( value ) {
			//updatePointCloudGeometry(view);
		});

		plotFolder.add( options, 'plotYTransformMoleculeData', {'linear': 'linear', 'log10': 'log10', 'log10(-1*)': 'neglog10'/*, 'symlog10': 'symlog10', 'symlogPC': 'symlogPC'*/})
		.name( 'Y scale' )
		.onChange( function( value ) {
			//updatePointCloudGeometry(view);
		});

		plotFolder.add( options, 'selectAllMoleculeData').name('Select all');
		plotFolder.add( options, 'deselectAllMoleculeData').name('Deselect all');

		plotFolder.add( options, 'selectHighlightedMoleculeData').name('Select highlighted');
		plotFolder.add( options, 'deselectHighlightedMoleculeData').name('Deselect highlighted');
	}

	if (view.overallMoleculeDataBoolean  == false && view.overallSpatiallyResolvedDataBoolean) {
		plotFolder.add(options, 'activePlotSpatiallyResolved').name('active plot')
		.onChange( function(value) {
			if (value == true) {
				view.activate2DPlotSpatiallyResolved();
			} else {
				view.deactivate2DPlotSpatiallyResolved()
			}
		});
		plotFolder.add( options, 'plotXSpatiallyResolvedData', spatiallyResolvedFeatureChoiceObject)
		.name( 'X' )
		.onChange( function( value ) {
			//updatePointCloudGeometry(view);
		});

		plotFolder.add( options, 'plotXTransformSpatiallyResolvedData', {'linear': 'linear', 'log10': 'log10', 'log10(-1*)': 'neglog10', 'symlog10': 'symlog10', 'symlogPC': 'symlogPC'})
		.name( 'X scale' )
		.onChange( function( value ) {
			//updatePointCloudGeometry(view);
		});

		plotFolder.add( options, 'plotYSpatiallyResolvedData', spatiallyResolvedFeatureChoiceObject)
		.name( 'Y' )
		.onChange( function( value ) {
			//updatePointCloudGeometry(view);
		});

		plotFolder.add( options, 'plotYTransformSpatiallyResolvedData', {'linear': 'linear', 'log10': 'log10', 'log10(-1*)': 'neglog10', 'symlog10': 'symlog10', 'symlogPC': 'symlogPC'})
		.name( 'Y scale' )
		.onChange( function( value ) {
			//updatePointCloudGeometry(view);
		});

		plotFolder.add( options, 'selectAllSpatiallyResolvedData').name('Select all');
		plotFolder.add( options, 'deselectAllSpatiallyResolvedData').name('Deselect all');

		plotFolder.add( options, 'selectHighlightedSpatiallyResolvedData').name('Select highlighted');
		plotFolder.add( options, 'deselectHighlightedSpatiallyResolvedData').name('Deselect highlighted');
	}

	plotFolder.add(options, 'replotHeatmap').name("Plot");
	plotFolder.open()


	viewFolder.add( options, 'colorMap', colorMapDict)
	.name( 'Color Scheme' )
	.onChange( function( value ){
		updateHeatmap(view);
		changeLegend(view);
	});
	viewFolder.add( options, 'resetCamera').name("Reset camera");
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


	if (view.overallMoleculeDataBoolean && view.overallSpatiallyResolvedDataBoolean){
		moleculeFolder.add(options, 'activePlotMolecule').name('active plot')
		.onChange( function(value) {
			if (value == true) {
				view.activate2DPlotMolecule();
			} else {
				view.deactivate2DPlotMolecule()
			}
		});
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

		moleculeFolder.add( options, 'selectHighlightedMoleculeData').name('Select highlighted');
		moleculeFolder.add( options, 'deselectHighlightedMoleculeData').name('Deselect highlighted');

		moleculeFolder.close();

		spatiallyResolvedFolder.add(options, 'activePlotSpatiallyResolved').name('active plot')
		.onChange( function(value) {
			if (value == true) {
				view.activate2DPlotSpatiallyResolved();
			} else {
				view.deactivate2DPlotSpatiallyResolved()
			}
		});
		spatiallyResolvedFolder.add( options, 'plotXSpatiallyResolvedData', spatiallyResolvedFeatureChoiceObject)
		.name( 'X' )
		.onChange( function( value ) {
			//updatePointCloudGeometry(view);
		});

		spatiallyResolvedFolder.add( options, 'plotXTransformSpatiallyResolvedData', {'linear': 'linear', 'log10': 'log10', 'log10(-1*)': 'neglog10', 'symlog10': 'symlog10', 'symlogPC': 'symlogPC'})
		.name( 'X scale' )
		.onChange( function( value ) {
			//updatePointCloudGeometry(view);
		});

		spatiallyResolvedFolder.add( options, 'plotYSpatiallyResolvedData', spatiallyResolvedFeatureChoiceObject)
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

		spatiallyResolvedFolder.add( options, 'selectHighlightedSpatiallyResolvedData').name('Select highlighted');
		spatiallyResolvedFolder.add( options, 'deselectHighlightedSpatiallyResolvedData').name('Deselect highlighted');

		spatiallyResolvedFolder.open();

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

	folder.open()

}

export function setupOptionBox2DCovarianceFolder(view,plotSetup, folder){
	const gui = view.gui;
	const options = view.options;

	let spatiallyResolvedFeatureChoiceObject, moleculeDataFeatureChoiceObject;
	if (view.overallSpatiallyResolvedDataBoolean) {
		const spatiallyResolvedFeatureList = plotSetup["spatiallyResolvedPropertyList"];
		spatiallyResolvedFeatureChoiceObject = arrayToIdenticalObject(spatiallyResolvedFeatureList);
	}

	if (view.overallMoleculeDataBoolean) {
		const moleculeDataFeatureList = plotSetup["moleculePropertyList"];
		moleculeDataFeatureChoiceObject = arrayToIdenticalObject(moleculeDataFeatureList);
	}
	const plotFolder			= folder.addFolder( 'Plot Setting' );
	const viewFolder 			= folder.addFolder( 'View Control' );


	let moleculeFolder, spatiallyResolvedFolder;
	if (view.overallMoleculeDataBoolean && view.overallSpatiallyResolvedDataBoolean) {
		moleculeFolder = folder.addFolder( 'Molecular Data' );
		spatiallyResolvedFolder = folder.addFolder( 'Spatially Resolved Data' );
	}
	
	const detailFolder		= folder.addFolder( 'Additional Control' );

	if (view.overallMoleculeDataBoolean && view.overallSpatiallyResolvedDataBoolean) {
		plotFolder.add( options, 'plotData', {'spatially resolved': 'spatiallyResolvedData' , 'molecular': 'moleculeData'})
		.name( 'Plot Data' )
		.onChange( function( value ) {
			if (view.overallMoleculeDataBoolean && view.overallSpatiallyResolvedDataBoolean) {
				if (value == 'spatiallyResolvedData') {
					moleculeFolder.close();
					spatiallyResolvedFolder.open();
				}
				if (value == 'moleculeData') {
					moleculeFolder.open();
					spatiallyResolvedFolder.close();
				}
			}
		});
	}
	else {
		plotFolder.add( options, 'plotData')
		.name( 'Plot Data' );
	}


	if (view.overallMoleculeDataBoolean && view.overallSpatiallyResolvedDataBoolean == false) {

		plotFolder.add( options, 'covarianceTransformSpatiallyResolvedData', {'linear': 'linear', 'log10': 'log10'})
		.name( 'Data Transform' )
		.onChange( function( value ) {
			//updatePointCloudGeometry(view);
		});



	}

	if (view.overallMoleculeDataBoolean  == false && view.overallSpatiallyResolvedDataBoolean) {

		plotFolder.add( options, 'covarianceTransformMoleculeData', {'linear': 'linear', 'log10': 'log10'})
		.name( 'Data Transform' )
		.onChange( function( value ) {
			//updatePointCloudGeometry(view);
		});

	}

	plotFolder.add(options, 'replotCovariance').name("Plot");
	plotFolder.open()


	viewFolder.add( options, 'colorMap', colorMapDict)
	.name( 'Color Scheme' )
	.onChange( function( value ){
		updateCovariance(view);
		changeLegend(view);
	});
	viewFolder.add( options, 'resetCamera').name("Reset camera");
	viewFolder.add( options, 'toggleFullscreen').name('Fullscreen');
	//viewFolder.open();



	viewFolder.add( options, 'pointCloudAlpha', 0, 1 ).step( 0.01 )
	.name( 'Point Opacity' )
	.onChange( function( value ) {
		updateCovariance(view);
	});
	viewFolder.add( options, 'pointCloudSize', 0, 10 ).step( 0.1 )
	.name( 'Point Size' )
	.onChange( function( value ) {
		updateCovariance(view);
	});


	if (view.overallMoleculeDataBoolean && view.overallSpatiallyResolvedDataBoolean){


		moleculeFolder.add( options, 'covarianceTransformMoleculeData', {'linear': 'linear', 'log10': 'log10'})
		.name( 'Data Transform' )
		.onChange( function( value ) {
			//updatePointCloudGeometry(view);
		});

		moleculeFolder.close();



		spatiallyResolvedFolder.add( options, 'covarianceTransformSpatiallyResolvedData', {'linear': 'linear', 'log10': 'log10'})
		.name( 'Data Transform' )
		.onChange( function( value ) {
			//updatePointCloudGeometry(view);
		});


		spatiallyResolvedFolder.open();

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

	folder.open()

}


export function setupOptionBox2DPCAFolder(view,plotSetup, folder){
	const gui = view.gui;
	const options = view.options;
	let PCASpatiallyResolvedFeatureChoiceObject, PCAMoleculeDataFeatureChoiceObject;
	if (view.overallSpatiallyResolvedDataBoolean) {

		const PCASpatiallyResolvedFeatureList = [];

		for (let i = 1; i <= plotSetup["spatiallyResolvedPropertyList"].length; i++) {
			PCASpatiallyResolvedFeatureList.push("_PC"+i.toString());
		}
		PCASpatiallyResolvedFeatureChoiceObject = arrayToIdenticalObject(PCASpatiallyResolvedFeatureList);
	}

	if (view.overallMoleculeDataBoolean) {


		let PCAMoleculeDataFeatureList = [];

		for (let i = 1; i <= plotSetup["moleculePropertyList"].length; i++) {
			PCAMoleculeDataFeatureList.push("_PC"+i.toString());
		}
		PCAMoleculeDataFeatureChoiceObject = arrayToIdenticalObject(PCAMoleculeDataFeatureList);
	}
	const plotFolder			= folder.addFolder( 'Plot Setting' );
	const viewFolder 			= folder.addFolder( 'View Control' );
	const selectionFolder 	= folder.addFolder( 'Selection' );


	let moleculeFolder, spatiallyResolvedFolder;
	if (view.overallMoleculeDataBoolean && view.overallSpatiallyResolvedDataBoolean) {
		moleculeFolder = folder.addFolder( 'Molecular Data' );
		spatiallyResolvedFolder = folder.addFolder( 'Spatially Resolved Data' );
	}
	
	const detailFolder		= folder.addFolder( 'Additional Control' );

	if (view.overallMoleculeDataBoolean && view.overallSpatiallyResolvedDataBoolean) {
		plotFolder.add( options, 'plotData', {'spatially resolved': 'spatiallyResolvedData' , 'molecular': 'moleculeData'})
		.name( 'Plot Data' )
		.onChange( function( value ) {
			if (view.overallMoleculeDataBoolean && view.overallSpatiallyResolvedDataBoolean) {
				if (value == 'spatiallyResolvedData') {
					moleculeFolder.close();
					spatiallyResolvedFolder.open();
				}
				if (value == 'moleculeData') {
					moleculeFolder.open();
					spatiallyResolvedFolder.close();
				}
			}
		});
	}
	else {
		plotFolder.add( options, 'plotData')
		.name( 'Plot Data' );
	}


	plotFolder.add( options, 'numPerSide', 10, 10000).step( 1 )
	.name('Resolution')
	.onChange( function( value ) {
		view.xPlotScale = d3.scaleLinear().domain([0, value]).range([-50,50]);
		view.yPlotScale = d3.scaleLinear().domain([0, value]).range([-50,50]);
		//options.replotHeatmap.call();
	});
	if (view.overallMoleculeDataBoolean) { plotFolder.add( options, 'saveOverallMoleculeData').name('Save Molecule');}
	if (view.overallSpatiallyResolvedDataBoolean) {plotFolder.add( options, 'saveOverallSpatiallyResolvedData').name('Save Spatially Resolved');}

	

	if (view.overallMoleculeDataBoolean && view.overallSpatiallyResolvedDataBoolean == false) {
		plotFolder.add( options, 'plotPCAXMoleculeData', PCAMoleculeDataFeatureChoiceObject)
		.name( 'X' )
		.onChange( function( value ) {
			//updatePointCloudGeometry(view);
		});

		plotFolder.add( options, 'plotPCAXTransformMoleculeData', {'linear': 'linear', 'log10': 'log10'})
		.name( 'X scale' )
		.onChange( function( value ) {
			//updatePointCloudGeometry(view);
		});

		plotFolder.add( options, 'plotPCAYMoleculeData', PCAMoleculeDataFeatureChoiceObject)
		.name( 'Y' )
		.onChange( function( value ) {
			//updatePointCloudGeometry(view);
		});

		plotFolder.add( options, 'plotPCAYTransformMoleculeData', {'linear': 'linear', 'log10': 'log10'})
		.name( 'Y scale' )
		.onChange( function( value ) {
			//updatePointCloudGeometry(view);
		});

		plotFolder.add( options, 'selectAllMoleculeData').name('Select all');
		plotFolder.add( options, 'deselectAllMoleculeData').name('Deselect all');

		plotFolder.add( options, 'selectHighlightedMoleculeData').name('Select highlighted');
		plotFolder.add( options, 'deselectHighlightedMoleculeData').name('Deselect highlighted');
	}

	if (view.overallMoleculeDataBoolean  == false && view.overallSpatiallyResolvedDataBoolean) {
		plotFolder.add( options, 'plotPCAXSpatiallyResolvedData', PCASpatiallyResolvedFeatureChoiceObject)
		.name( 'X' )
		.onChange( function( value ) {
			//updatePointCloudGeometry(view);
		});

		plotFolder.add( options, 'plotPCAXTransformSpatiallyResolvedData', {'linear': 'linear', 'log10': 'log10'})
		.name( 'X scale' )
		.onChange( function( value ) {
			//updatePointCloudGeometry(view);
		});

		plotFolder.add( options, 'plotPCAYSpatiallyResolvedData', PCASpatiallyResolvedFeatureChoiceObject)
		.name( 'Y' )
		.onChange( function( value ) {
			//updatePointCloudGeometry(view);
		});

		plotFolder.add( options, 'plotPCAYTransformSpatiallyResolvedData', {'linear': 'linear', 'log10': 'log10'})
		.name( 'Y scale' )
		.onChange( function( value ) {
			//updatePointCloudGeometry(view);
		});

		plotFolder.add( options, 'selectAllSpatiallyResolvedData').name('Select all');
		plotFolder.add( options, 'deselectAllSpatiallyResolvedData').name('Deselect all');

		plotFolder.add( options, 'selectHighlightedSpatiallyResolvedData').name('Select highlighted');
		plotFolder.add( options, 'deselectHighlightedSpatiallyResolvedData').name('Deselect highlighted');
	}

	plotFolder.add(options, 'replotPCAHeatmap').name("Calculate & Plot");
	plotFolder.open()


	viewFolder.add( options, 'colorMap', colorMapDict)
	.name( 'Color Scheme' )
	.onChange( function( value ){
		updateHeatmap(view);
		changeLegend(view);
	});
	viewFolder.add( options, 'resetCamera').name("Reset camera");
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


	if (view.overallMoleculeDataBoolean && view.overallSpatiallyResolvedDataBoolean){
		moleculeFolder.add( options, 'plotPCAXMoleculeData', PCAMoleculeDataFeatureChoiceObject)
		.name( 'X' )
		.onChange( function( value ) {
			//updatePointCloudGeometry(view);
		});

		moleculeFolder.add( options, 'plotPCAXTransformMoleculeData', {'linear': 'linear', 'log10': 'log10'})
		.name( 'X scale' )
		.onChange( function( value ) {
			//updatePointCloudGeometry(view);
		});

		moleculeFolder.add( options, 'plotPCAYMoleculeData', PCAMoleculeDataFeatureChoiceObject)
		.name( 'Y' )
		.onChange( function( value ) {
			//updatePointCloudGeometry(view);
		});

		moleculeFolder.add( options, 'plotPCAYTransformMoleculeData', {'linear': 'linear', 'log10': 'log10'})
		.name( 'Y scale' )
		.onChange( function( value ) {
			//updatePointCloudGeometry(view);
		});

		moleculeFolder.add( options, 'selectAllMoleculeData').name('Select all');
		moleculeFolder.add( options, 'deselectAllMoleculeData').name('Deselect all');
		
		moleculeFolder.add( options, 'selectHighlightedMoleculeData').name('Select highlighted');
		moleculeFolder.add( options, 'deselectHighlightedMoleculeData').name('Deselect highlighted');

		moleculeFolder.close();


		spatiallyResolvedFolder.add( options, 'plotPCAXSpatiallyResolvedData', PCASpatiallyResolvedFeatureChoiceObject)
		.name( 'X' )
		.onChange( function( value ) {
			//updatePointCloudGeometry(view);
		});

		spatiallyResolvedFolder.add( options, 'plotPCAXTransformSpatiallyResolvedData', {'linear': 'linear', 'log10': 'log10'})
		.name( 'X scale' )
		.onChange( function( value ) {
			//updatePointCloudGeometry(view);
		});

		spatiallyResolvedFolder.add( options, 'plotPCAYSpatiallyResolvedData', PCASpatiallyResolvedFeatureChoiceObject)
		.name( 'Y' )
		.onChange( function( value ) {
			//updatePointCloudGeometry(view);
		});

		spatiallyResolvedFolder.add( options, 'plotPCAYTransformSpatiallyResolvedData', {'linear': 'linear', 'log10': 'log10'})
		.name( 'Y scale' )
		.onChange( function( value ) {
			//updatePointCloudGeometry(view);
		});

		spatiallyResolvedFolder.add( options, 'selectAllSpatiallyResolvedData').name('Select all');
		spatiallyResolvedFolder.add( options, 'deselectAllSpatiallyResolvedData').name('Deselect all');

		spatiallyResolvedFolder.add( options, 'selectHighlightedSpatiallyResolvedData').name('Select highlighted');
		spatiallyResolvedFolder.add( options, 'deselectHighlightedSpatiallyResolvedData').name('Deselect highlighted');

		spatiallyResolvedFolder.open();

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

	folder.open()

}




export function setupOptionBox2DUmapFolder(view,plotSetup, folder){
	const gui = view.gui;
	const options = view.options;

	let UmapSpatiallyResolvedFeatureChoiceObject, UmapMoleculeDataFeatureChoiceObject;
	if (view.overallSpatiallyResolvedDataBoolean) {

		const UmapSpatiallyResolvedFeatureList = [];

		for (let i = 1; i <= 2; i++) {
			UmapSpatiallyResolvedFeatureList.push("_Umap"+i.toString());
		}
		UmapSpatiallyResolvedFeatureChoiceObject = arrayToIdenticalObject(UmapSpatiallyResolvedFeatureList);
	}

	if (view.overallMoleculeDataBoolean) {


		const UmapMoleculeDataFeatureList = [];

		for (let i = 1; i <= 2; i++) {
			UmapMoleculeDataFeatureList.push("_Umap"+i.toString());
		}
		UmapMoleculeDataFeatureChoiceObject = arrayToIdenticalObject(UmapMoleculeDataFeatureList);
	}
	const plotFolder			= folder.addFolder( 'Plot Setting' );
	const viewFolder 			= folder.addFolder( 'View Control' );
	const selectionFolder 	= folder.addFolder( 'Selection' );


	let moleculeFolder, spatiallyResolvedFolder;
	if (view.overallMoleculeDataBoolean && view.overallSpatiallyResolvedDataBoolean) {
		moleculeFolder = folder.addFolder( 'Molecular Data' );
		spatiallyResolvedFolder = folder.addFolder( 'Spatially Resolved Data' );
	}
	
	const detailFolder		= folder.addFolder( 'Additional Control' );

	if (view.overallMoleculeDataBoolean && view.overallSpatiallyResolvedDataBoolean) {
		plotFolder.add( options, 'plotData', {'spatially resolved': 'spatiallyResolvedData' , 'molecular': 'moleculeData'})
		.name( 'Plot Data' )
		.onChange( function( value ) {
			if (view.overallMoleculeDataBoolean && view.overallSpatiallyResolvedDataBoolean) {
				if (value == 'spatiallyResolvedData') {
					moleculeFolder.close();
					spatiallyResolvedFolder.open();
				}
				if (value == 'moleculeData') {
					moleculeFolder.open();
					spatiallyResolvedFolder.close();
				}
			}
		});
	}
	else {
		plotFolder.add( options, 'plotData')
		.name( 'Plot Data' );
	}


	plotFolder.add( options, 'numPerSide', 10, 10000).step( 1 )
	.name('Resolution')
	.onChange( function( value ) {
		view.xPlotScale = d3.scaleLinear().domain([0, value]).range([-50,50]);
		view.yPlotScale = d3.scaleLinear().domain([0, value]).range([-50,50]);
		//options.replotHeatmap.call();
	});
	if (view.overallMoleculeDataBoolean) { plotFolder.add( options, 'saveOverallMoleculeData').name('Save Molecule');}
	if (view.overallSpatiallyResolvedDataBoolean) {plotFolder.add( options, 'saveOverallSpatiallyResolvedData').name('Save Spatially Resolved');}

	

	if (view.overallMoleculeDataBoolean && view.overallSpatiallyResolvedDataBoolean == false) {
		plotFolder.add( options, 'UmapNumEpochs', 10, 1000).step(10).name( 'Num Epochs' );

		plotFolder.add( options, 'UmapNumNeighbours', 1, 100).step(1).name( 'Num Neighbors' );

		plotFolder.add( options, 'plotUmapXMoleculeData', UmapMoleculeDataFeatureChoiceObject)
		.name( 'X' )
		.onChange( function( value ) {
			//updatePointCloudGeometry(view);
		});

		plotFolder.add( options, 'plotUmapXTransformMoleculeData', {'linear': 'linear', 'log10': 'log10'})
		.name( 'X scale' )
		.onChange( function( value ) {
			//updatePointCloudGeometry(view);
		});

		plotFolder.add( options, 'plotUmapYMoleculeData', UmapMoleculeDataFeatureChoiceObject)
		.name( 'Y' )
		.onChange( function( value ) {
			//updatePointCloudGeometry(view);
		});

		plotFolder.add( options, 'plotUmapYTransformMoleculeData', {'linear': 'linear', 'log10': 'log10'})
		.name( 'Y scale' )
		.onChange( function( value ) {
			//updatePointCloudGeometry(view);
		});

		plotFolder.add( options, 'selectAllMoleculeData').name('Select all');
		plotFolder.add( options, 'deselectAllMoleculeData').name('Deselect all');

		plotFolder.add( options, 'selectHighlightedMoleculeData').name('Select highlighted');
		plotFolder.add( options, 'deselectHighlightedMoleculeData').name('Deselect highlighted');
	}

	if (view.overallMoleculeDataBoolean  == false && view.overallSpatiallyResolvedDataBoolean) {
		plotFolder.add( options, 'UmapNumEpochs', 10, 1000).step(10).name( 'Num Epochs' );

		plotFolder.add( options, 'UmapNumNeighbours', 1, 100).step(1).name( 'Num Neighbors' );

		plotFolder.add( options, 'plotUmapXSpatiallyResolvedData', UmapSpatiallyResolvedFeatureChoiceObject)
		.name( 'X' )
		.onChange( function( value ) {
			//updatePointCloudGeometry(view);
		});

		plotFolder.add( options, 'plotUmapXTransformSpatiallyResolvedData', {'linear': 'linear', 'log10': 'log10'})
		.name( 'X scale' )
		.onChange( function( value ) {
			//updatePointCloudGeometry(view);
		});

		plotFolder.add( options, 'plotUmapYSpatiallyResolvedData', UmapSpatiallyResolvedFeatureChoiceObject)
		.name( 'Y' )
		.onChange( function( value ) {
			//updatePointCloudGeometry(view);
		});

		plotFolder.add( options, 'plotUmapYTransformSpatiallyResolvedData', {'linear': 'linear', 'log10': 'log10'})
		.name( 'Y scale' )
		.onChange( function( value ) {
			//updatePointCloudGeometry(view);
		});

		plotFolder.add( options, 'selectAllSpatiallyResolvedData').name('Select all');
		plotFolder.add( options, 'deselectAllSpatiallyResolvedData').name('Deselect all');

		plotFolder.add( options, 'selectHighlightedSpatiallyResolvedData').name('Select highlighted');
		plotFolder.add( options, 'deselectHighlightedSpatiallyResolvedData').name('Deselect highlighted');

	}

	plotFolder.add(options, 'replotUmapHeatmap').name("Calculate & Plot");
	plotFolder.open()


	viewFolder.add( options, 'colorMap', colorMapDict)
	.name( 'Color Scheme' )
	.onChange( function( value ){
		updateHeatmap(view);
		changeLegend(view);
	});
	viewFolder.add( options, 'resetCamera').name("Reset camera");
	viewFolder.add( options, 'toggleFullscreen').name('Fullscreen');
	//viewFolder.open();



	viewFolder.add( options, 'pointCloudAlpha', 0, 1 ).step( 0.01 )
	.name( 'Point Opacity' )
	.onChange( function( value ) {
		updateHeatmap(view);
	});
	viewFolder.add( options, 'pointCloudSize', 0, 3 ).step( 0.01 )
	.name( 'Point Size' )
	.onChange( function( value ) {
		updateHeatmap(view);
	});

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


	if (view.overallMoleculeDataBoolean && view.overallSpatiallyResolvedDataBoolean){
		moleculeFolder.add( options, 'UmapNumEpochs', 10, 1000).step(10).name( 'Num Epochs' );

		moleculeFolder.add( options, 'UmapNumNeighbours', 1, 100).step(1).name( 'Num Neighbors' );

		moleculeFolder.add( options, 'plotUmapXMoleculeData', UmapMoleculeDataFeatureChoiceObject)
		.name( 'X' )
		.onChange( function( value ) {
			//updatePointCloudGeometry(view);
		});

		moleculeFolder.add( options, 'plotUmapXTransformMoleculeData', {'linear': 'linear', 'log10': 'log10'})
		.name( 'X scale' )
		.onChange( function( value ) {
			//updatePointCloudGeometry(view);
		});

		moleculeFolder.add( options, 'plotUmapYMoleculeData', UmapMoleculeDataFeatureChoiceObject)
		.name( 'Y' )
		.onChange( function( value ) {
			//updatePointCloudGeometry(view);
		});

		moleculeFolder.add( options, 'plotUmapYTransformMoleculeData', {'linear': 'linear', 'log10': 'log10'})
		.name( 'Y scale' )
		.onChange( function( value ) {
			//updatePointCloudGeometry(view);
		});

		moleculeFolder.add( options, 'selectAllMoleculeData').name('Select all');
		moleculeFolder.add( options, 'deselectAllMoleculeData').name('Deselect all');

		moleculeFolder.add( options, 'selectHighlightedMoleculeData').name('Select highlighted');
		moleculeFolder.add( options, 'deselectHighlightedMoleculeData').name('Deselect highlighted');

		moleculeFolder.close();

		spatiallyResolvedFolder.add( options, 'UmapNumEpochs', 10, 1000).step(10).name( 'Num Epochs' );

		spatiallyResolvedFolder.add( options, 'UmapNumNeighbours', 1, 100).step(1).name( 'Num Neighbors' );

		spatiallyResolvedFolder.add( options, 'plotUmapXSpatiallyResolvedData', UmapSpatiallyResolvedFeatureChoiceObject)
		.name( 'X' )
		.onChange( function( value ) {
			//updatePointCloudGeometry(view);
		});

		spatiallyResolvedFolder.add( options, 'plotUmapXTransformSpatiallyResolvedData', {'linear': 'linear', 'log10': 'log10'})
		.name( 'X scale' )
		.onChange( function( value ) {
			//updatePointCloudGeometry(view);
		});

		spatiallyResolvedFolder.add( options, 'plotUmapYSpatiallyResolvedData', UmapSpatiallyResolvedFeatureChoiceObject)
		.name( 'Y' )
		.onChange( function( value ) {
			//updatePointCloudGeometry(view);
		});

		spatiallyResolvedFolder.add( options, 'plotUmapYTransformSpatiallyResolvedData', {'linear': 'linear', 'log10': 'log10'})
		.name( 'Y scale' )
		.onChange( function( value ) {
			//updatePointCloudGeometry(view);
		});

		spatiallyResolvedFolder.add( options, 'selectAllSpatiallyResolvedData').name('Select all');
		spatiallyResolvedFolder.add( options, 'deselectAllSpatiallyResolvedData').name('Deselect all');

		spatiallyResolvedFolder.add( options, 'selectHighlightedSpatiallyResolvedData').name('Select highlighted');
		spatiallyResolvedFolder.add( options, 'deselectHighlightedSpatiallyResolvedData').name('Deselect highlighted');

		spatiallyResolvedFolder.open();

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

	folder.open()

}


export function setupOptionBox2DComparisonFolder(view,plotSetup, folder){
	const gui = view.gui;
	const options = view.options;

	let spatiallyResolvedFeatureChoiceObject, moleculeDataFeatureChoiceObject;
	if (view.overallSpatiallyResolvedDataBoolean) {
		const spatiallyResolvedFeatureList = plotSetup["spatiallyResolvedPropertyList"];
		spatiallyResolvedFeatureChoiceObject = arrayToIdenticalObject(spatiallyResolvedFeatureList);
	}

	if (view.overallMoleculeDataBoolean) {
		const moleculeDataFeatureList = plotSetup["moleculePropertyList"];
		moleculeDataFeatureChoiceObject = arrayToIdenticalObject(moleculeDataFeatureList);
	}
	const plotFolder			= folder.addFolder( 'Plot Setting' );
	const viewFolder 			= folder.addFolder( 'View Control' );
	const selectionFolder 	= folder.addFolder( 'Selection' );


	let moleculeFolder, spatiallyResolvedFolder;
	if (view.overallMoleculeDataBoolean && view.overallSpatiallyResolvedDataBoolean) {
		moleculeFolder = folder.addFolder( 'Molecular Data' );
		spatiallyResolvedFolder = folder.addFolder( 'Spatially Resolved Data' );
	}
	
	const detailFolder		= folder.addFolder( 'Additional Control' );

	if (view.overallMoleculeDataBoolean && view.overallSpatiallyResolvedDataBoolean) {
		plotFolder.add( options, 'plotData', {'spatially resolved': 'spatiallyResolvedData' , 'molecular': 'moleculeData'})
		.name( 'Plot Data' )
		.onChange( function( value ) {
			if (view.overallMoleculeDataBoolean && view.overallSpatiallyResolvedDataBoolean) {
				if (value == 'spatiallyResolvedData') {
					moleculeFolder.close();
					spatiallyResolvedFolder.open();
				}
				if (value == 'moleculeData') {
					moleculeFolder.open();
					spatiallyResolvedFolder.close();
				}
			}
		});
	}
	else {
		plotFolder.add( options, 'plotData')
		.name( 'Plot Data' );
	}


	plotFolder.add( options, 'numPerSide', 10, 10000).step( 1 )
	.name('Resolution')
	.onChange( function( value ) {
		view.xPlotScale = d3.scaleLinear().domain([0, value]).range([-50,50]);
		view.yPlotScale = d3.scaleLinear().domain([0, value]).range([-50,50]);
		//options.replotHeatmap.call();
	});
	if (view.overallMoleculeDataBoolean) { plotFolder.add( options, 'saveOverallMoleculeData').name('Save Molecule');}
	if (view.overallSpatiallyResolvedDataBoolean) {plotFolder.add( options, 'saveOverallSpatiallyResolvedData').name('Save Spatially Resolved');}

	

	if (view.overallMoleculeDataBoolean && view.overallSpatiallyResolvedDataBoolean == false) {
		plotFolder.add( options, 'plotXMoleculeData', moleculeDataFeatureChoiceObject)
		.name( 'X' )
		.onChange( function( value ) {
			//updatePointCloudGeometry(view);
		});

		plotFolder.add( options, 'plotXTransformMoleculeData', {'linear': 'linear', 'log10': 'log10', 'log10(-1*)': 'neglog10'/*, 'symlog10': 'symlog10', 'symlogPC': 'symlogPC'*/})
		.name( 'X scale' )
		.onChange( function( value ) {
			//updatePointCloudGeometry(view);
		});

		plotFolder.add( options, 'plotYMoleculeData', moleculeDataFeatureChoiceObject)
		.name( 'Y' )
		.onChange( function( value ) {
			//updatePointCloudGeometry(view);
		});

		plotFolder.add( options, 'plotYTransformMoleculeData', {'linear': 'linear', 'log10': 'log10', 'log10(-1*)': 'neglog10'/*, 'symlog10': 'symlog10', 'symlogPC': 'symlogPC'*/})
		.name( 'Y scale' )
		.onChange( function( value ) {
			//updatePointCloudGeometry(view);
		});

		plotFolder.add( options, 'selectAllMoleculeData').name('Select all');
		plotFolder.add( options, 'deselectAllMoleculeData').name('Deselect all');

		plotFolder.add( options, 'selectHighlightedMoleculeData').name('Select highlighted');
		plotFolder.add( options, 'deselectHighlightedMoleculeData').name('Deselect highlighted');
	}

	if (view.overallMoleculeDataBoolean  == false && view.overallSpatiallyResolvedDataBoolean) {
		plotFolder.add( options, 'plotXSpatiallyResolvedData', spatiallyResolvedFeatureChoiceObject)
		.name( 'X' )
		.onChange( function( value ) {
			//updatePointCloudGeometry(view);
		});

		plotFolder.add( options, 'plotXTransformSpatiallyResolvedData', {'linear': 'linear', 'log10': 'log10', 'log10(-1*)': 'neglog10', 'symlog10': 'symlog10', 'symlogPC': 'symlogPC'})
		.name( 'X scale' )
		.onChange( function( value ) {
			//updatePointCloudGeometry(view);
		});

		plotFolder.add( options, 'plotYSpatiallyResolvedData', spatiallyResolvedFeatureChoiceObject)
		.name( 'Y' )
		.onChange( function( value ) {
			//updatePointCloudGeometry(view);
		});

		plotFolder.add( options, 'plotYTransformSpatiallyResolvedData', {'linear': 'linear', 'log10': 'log10', 'log10(-1*)': 'neglog10', 'symlog10': 'symlog10', 'symlogPC': 'symlogPC'})
		.name( 'Y scale' )
		.onChange( function( value ) {
			//updatePointCloudGeometry(view);
		});

		plotFolder.add( options, 'selectAllSpatiallyResolvedData').name('Select all');
		plotFolder.add( options, 'deselectAllSpatiallyResolvedData').name('Deselect all');

		plotFolder.add( options, 'selectHighlightedSpatiallyResolvedData').name('Select highlighted');
		plotFolder.add( options, 'deselectHighlightedSpatiallyResolvedData').name('Deselect highlighted');
	}

	plotFolder.add(options, 'replotComparison').name("Plot");
	plotFolder.open()


	viewFolder.add( options, 'colorMap', colorMapDict)
	.name( 'Color Scheme' )
	.onChange( function( value ){
		updateComparison(view);
		changeLegend(view);
	});
	viewFolder.add( options, 'resetCamera').name("Reset camera");
	viewFolder.add( options, 'toggleFullscreen').name('Fullscreen');
	//viewFolder.open();



	viewFolder.add( options, 'pointCloudAlpha', 0, 1 ).step( 0.01 )
	.name( 'Point Opacity' )
	.onChange( function( value ) {
		updateComparison(view);
	});
	viewFolder.add( options, 'pointCloudSize', 0, 50 ).step( 0.1 )
	.name( 'Point Size' )
	.onChange( function( value ) {
		updateComparison(view);
	});

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


	if (view.overallMoleculeDataBoolean && view.overallSpatiallyResolvedDataBoolean){
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
		
		moleculeFolder.add( options, 'selectHighlightedMoleculeData').name('Select highlighted');
		moleculeFolder.add( options, 'deselectHighlightedMoleculeData').name('Deselect highlighted');

		moleculeFolder.close();


		spatiallyResolvedFolder.add( options, 'plotXSpatiallyResolvedData', spatiallyResolvedFeatureChoiceObject)
		.name( 'X' )
		.onChange( function( value ) {
			//updatePointCloudGeometry(view);
		});

		spatiallyResolvedFolder.add( options, 'plotXTransformSpatiallyResolvedData', {'linear': 'linear', 'log10': 'log10', 'log10(-1*)': 'neglog10', 'symlog10': 'symlog10', 'symlogPC': 'symlogPC'})
		.name( 'X scale' )
		.onChange( function( value ) {
			//updatePointCloudGeometry(view);
		});

		spatiallyResolvedFolder.add( options, 'plotYSpatiallyResolvedData', spatiallyResolvedFeatureChoiceObject)
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

		spatiallyResolvedFolder.add( options, 'selectHighlightedSpatiallyResolvedData').name('Select highlighted');
		spatiallyResolvedFolder.add( options, 'deselectHighlightedSpatiallyResolvedData').name('Deselect highlighted');

		spatiallyResolvedFolder.open();

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

	folder.open()

}