import {replotHeatmap} from "./HeatmapView.js";
import {arrangeDataForCovariance, getCovariance, updateCovariance, replotCovariance} from "./covarianceView.js";
import {arrangeDataForPCA, getPCAHeatmap, updatePCAHeatmap, replotPCAHeatmap} from "./PCAView.js";
import {replotComparison} from './comparisonView.js'
import {replotUmapHeatmap} from './UmapView.js'
import {fullscreenOneView, deFullscreen} from "../MultiviewControl/calculateViewportSizes.js";
import {activate2DPlotSpatiallyResolved, deactivate2DPlotsSpatiallyResolved,activate2DPlotMolecule,deactivate2DPlotsMolecule} from "../MultiviewControl/active2DView.js";
import {insertLegend, removeLegend, changeLegend} from "../MultiviewControl/colorLegend.js";
import {selectHighlightedSpatiallyResolvedData, deselectHighlightedSpatiallyResolvedData, selectHighlightedMoleculeData, deselectHighlightedMoleculeData, clickUpdateAll2DHeatmaps} from "./selection.js";
import {deselectAllSpatiallyResolvedData, selectAllSpatiallyResolvedData, deselectAllMoleculeData, selectAllMoleculeData, updateAllPlots,updateAllPlotsSpatiallyResolved, updateAllPlotsMolecule} from "./Selection/Utilities.js";
import {saveOverallMoleculeData, saveOverallSpatiallyResolvedData} from "../Utilities/saveData.js";
import {render} from "../ElectroLensMain.js"
export function initialize2DHeatmapSetup(viewSetup,views,plotSetup){
	var defaultSetting = {
		background: new THREE.Color( 0,0,0 ),
		backgroundAlpha: 1.0,
		controllerEnabledBackground: new THREE.Color( 0.1,0.1,0.1 ),
		eye: [ 0, 0, 150 ],
		up: [ 0, 0, 1 ],
		geometryCenter: [0,0,0],
		fov: 45,
		mousePosition: [0,0],
		viewType: '2DHeatmap',
		/*plotX: 'x',
		plotY: 'x',
		plotXTransform: 'linear',
		plotYTransform: 'linear',*/
		controllerEnabled: false,
		controllerZoom : true,
		controllerRotate : false,
		controllerPan : true,
		xPlotScale : d3.scaleLinear().domain([0, 100]).range([-50,50]),
		yPlotScale : d3.scaleLinear().domain([0, 100]).range([-50,50]),
		overallSpatiallyResolvedDataBoolean: false,
		overallMoleculeDataBoolean: false,
		highlightedIndexList: [],
		IntersectState: null,
		INTERSECT: null,
		activate2DPlotSpatiallyResolved: function() {activate2DPlotSpatiallyResolved(plotSetup, viewSetup, views);},
		deactivate2DPlotSpatiallyResolved: function() {deactivate2DPlotsSpatiallyResolved(plotSetup, views);},
		activate2DPlotMolecule: function() {activate2DPlotMolecule(plotSetup, viewSetup, views);},
		deactivate2DPlotMolecule: function() {deactivate2DPlotsMolecule(plotSetup, views);},
		options: new function(){
			this.plotID = "";
			this.plotType = "Undefined";
			this.activePlotSpatiallyResolved = false;
			this.activePlotMolecule = false;
			this.backgroundColor = "#000000";
			this.backgroundAlpha = 0.0;
			this.plotData = "spatiallyResolvedData";
			this.numPerSide = 100;
			this.pointCloudAlpha = 1.0;
			this.pointCloudSize = 3.0;
			this.colorMap = 'rainbow';
			this.resetCamera = function(){
				viewSetup.controller.reset();
				render(views, plotSetup);
			};
			this.replotHeatmap = function(){
				replotHeatmap(viewSetup);
				render(views, plotSetup);
			};
			this.fullscreenBoolean = false;
			this.toggleFullscreen = function(){
										if (!viewSetup.options.fullscreenBoolean){
											fullscreenOneView(views,viewSetup);
											viewSetup.options.fullscreenBoolean = !viewSetup.options.fullscreenBoolean;
										}
										else {
											deFullscreen(views);
											viewSetup.options.fullscreenBoolean = !viewSetup.options.fullscreenBoolean;
										}
									};
			this.legendX = 8;
			this.legendY = -4;
			this.legendWidth  = 0.5;
			this.legendHeight = 6;
			this.legendTick = 5;
			this.legendFontsize = 55;
			this.legendShownBoolean = true;
			this.toggleLegend = function(){
									if (!viewSetup.options.legendShownBoolean){
										insertLegend(viewSetup);
										viewSetup.options.legendShownBoolean = !viewSetup.options.legendShownBoolean;
									}
									else {
										removeLegend(viewSetup);
										viewSetup.options.legendShownBoolean = !viewSetup.options.legendShownBoolean;
									}
								};
			//this.planeSelection = function(){
			//						planeSelection = !planeSelection;
			//						pointSelection = false;
			//					};
			this.planeSelection = false;
			this.brushSelection = false;
			this.selectionBrushSize = 5;

			this.plotXSpatiallyResolvedData = viewSetup.plotXSpatiallyResolvedData;
			this.plotYSpatiallyResolvedData = viewSetup.plotYSpatiallyResolvedData;
			this.plotXTransformSpatiallyResolvedData = viewSetup.plotXTransformSpatiallyResolvedData;
			this.plotYTransformSpatiallyResolvedData = viewSetup.plotYTransformSpatiallyResolvedData;

			this.plotXMoleculeData = viewSetup.plotXMoleculeData;
			this.plotYMoleculeData = viewSetup.plotYMoleculeData;
			this.plotXTransformMoleculeData = viewSetup.plotXTransformMoleculeData;
			this.plotYTransformMoleculeData = viewSetup.plotYTransformMoleculeData;

			this.selectAllSpatiallyResolvedData   = function(){
				selectAllSpatiallyResolvedData(views, viewSetup.overallSpatiallyResolvedData);
				clickUpdateAll2DHeatmaps(views);
				updateAllPlotsSpatiallyResolved(views);
			}; 
			this.deselectAllSpatiallyResolvedData = function(){
				deselectAllSpatiallyResolvedData(views, viewSetup.overallSpatiallyResolvedData);
				clickUpdateAll2DHeatmaps(views);
				updateAllPlotsSpatiallyResolved(views);
			};

			this.selectAllMoleculeData   = function(){
				selectAllMoleculeData(views, viewSetup.overallMoleculeData);
				clickUpdateAll2DHeatmaps(views);
				updateAllPlotsMolecule(views);
			}; 
			this.deselectAllMoleculeData = function(){
				deselectAllMoleculeData(views, viewSetup.overallMoleculeData);
				clickUpdateAll2DHeatmaps(views);
				updateAllPlotsMolecule(views);
			};

			this.selectHighlightedSpatiallyResolvedData   = function(){
				selectHighlightedSpatiallyResolvedData(views, viewSetup.overallSpatiallyResolvedData); 
				updateAllPlotsSpatiallyResolved(views);
			}; 
			this.deselectHighlightedSpatiallyResolvedData = function(){
				deselectHighlightedSpatiallyResolvedData(views, viewSetup.overallSpatiallyResolvedData);
				updateAllPlotsSpatiallyResolved(views);
			};

			this.selectHighlightedMoleculeData   = function(){
				selectHighlightedMoleculeData(views, viewSetup.overallMoleculeData); 
				updateAllPlotsMolecule(views);
			}; 
			this.deselectHighlightedMoleculeData = function(){
				deselectHighlightedMoleculeData(views, viewSetup.overallMoleculeData);
				updateAllPlotsMolecule(views);
			};

			this.saveOverallMoleculeData = function(){saveOverallMoleculeData(viewSetup,plotSetup)};
			this.saveOverallSpatiallyResolvedData = function(){saveOverallSpatiallyResolvedData(viewSetup,plotSetup)};


			this.covarianceTransformMoleculeData = "linear";
			this.covarianceTransformSpatiallyResolvedData = "linear";
			this.replotCovariance = function(){
				replotCovariance(viewSetup);
				render(views, plotSetup);
			};


			this.plotPCAXSpatiallyResolvedData = "_PC1";
			this.plotPCAYSpatiallyResolvedData = "_PC1";
			this.plotPCAXTransformSpatiallyResolvedData = "linear";
			this.plotPCAYTransformSpatiallyResolvedData = "linear";

			this.plotPCAXMoleculeData = "_PC1";
			this.plotPCAYMoleculeData = "_PC1";
			this.plotPCAXTransformMoleculeData = "linear";
			this.plotPCAYTransformMoleculeData = "linear";

			//this.nPCAComponentsSpatiallyResolved = plotSetup.spatiallyResolvedPropertyList.length;
			//this.nPCAComponentsMolecule = plotSetup.moleculePropertyList.length;
			this.replotPCAHeatmap = function(){
				replotPCAHeatmap(viewSetup);
				render(views, plotSetup);
			};

			this.replotComparison = function() {
				replotComparison(viewSetup);
				render(views, plotSetup);
			};


			this.plotUmapXSpatiallyResolvedData = "_Umap1";
			this.plotUmapYSpatiallyResolvedData = "_Umap2";
			this.plotUmapXTransformSpatiallyResolvedData = "linear";
			this.plotUmapYTransformSpatiallyResolvedData = "linear";

			this.UmapNumEpochs = 100;
			this.UmapNumNeighbours = 15;
			this.plotUmapXMoleculeData = "_Umap1";
			this.plotUmapYMoleculeData = "_Umap2";
			this.plotUmapXTransformMoleculeData = "linear";
			this.plotUmapYTransformMoleculeData = "linear";

			this.replotUmapHeatmap = function(){
				replotUmapHeatmap(viewSetup);
				render(views, plotSetup);
			};

			
			this.render = function(){render(views, plotSetup)}

		}
	}

	viewSetup = extendObject(viewSetup,defaultSetting);
	//viewSetup = defaultSetting;

}

function extendObject(obj, src) {
    for (var key in src) {
        if (src.hasOwnProperty(key) && !(key in obj)) obj[key] = src[key];
    }
    return obj;
}