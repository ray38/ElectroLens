import {replotHeatmap} from "./HeatmapView.js";
import {arrangeDataForCovariance, getCovariance, updateCovariance, replotCovariance} from "./covarianceView.js";
import {arrangeDataForPCA, getPCAHeatmap, updatePCAHeatmap, replotPCAHeatmap} from "./PCAView.js";
import {replotComparison} from './comparisonView.js'
import {fullscreenOneView, deFullscreen} from "../MultiviewControl/calculateViewportSizes.js";
import {insertLegend, removeLegend, changeLegend} from "../MultiviewControl/colorLegend.js";
import {deselectAllSpatiallyResolvedData, selectAllSpatiallyResolvedData, deselectAllMoleculeData, selectAllMoleculeData, updateAllPlots} from "./Selection/Utilities.js";
import {saveOverallMoleculeData, saveOverallSpatiallyResolvedData} from "../Utilities/saveData.js";
export function initialize2DHeatmapSetup(viewSetup,views,plotSetup){
	var defaultSetting = {
		background: new THREE.Color( 0,0,0 ),
		backgroundAlpha: 1.0,
		controllerEnabledBackground: new THREE.Color( 0.1,0.1,0.1 ),
		eye: [ 0, 0, 150 ],
		up: [ 0, 0, 1 ],
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
		options: new function(){
			this.plotID = "";
			this.plotType = "Undefined";
			this.backgroundColor = "#000000";
			this.backgroundAlpha = 0.0;
			this.plotData = "spatiallyResolvedData";
			this.numPerSide = 100;
			this.pointCloudAlpha = 1.0;
			this.pointCloudSize = 3.0;
			this.colorMap = 'rainbow';
			this.resetCamera = function(){viewSetup.controller.reset();};
			this.replotHeatmap = function(){replotHeatmap(viewSetup)};
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

			this.selectAllSpatiallyResolvedData   = function(){selectAllSpatiallyResolvedData(views, viewSetup.overallSpatiallyResolvedData); updateAllPlots(views);}; 
			this.deselectAllSpatiallyResolvedData = function(){deselectAllSpatiallyResolvedData(views, viewSetup.overallSpatiallyResolvedData);updateAllPlots(views);};

			this.selectAllMoleculeData   = function(){selectAllMoleculeData(views, viewSetup.overallMoleculeData); updateAllPlots(views);}; 
			this.deselectAllMoleculeData = function(){deselectAllMoleculeData(views, viewSetup.overallMoleculeData);updateAllPlots(views);};

			this.saveOverallMoleculeData = function(){saveOverallMoleculeData(viewSetup,plotSetup)};
			this.saveOverallSpatiallyResolvedData = function(){saveOverallSpatiallyResolvedData(viewSetup,plotSetup)};


			this.covarianceTransformMoleculeData = "linear";
			this.covarianceTransformSpatiallyResolvedData = "linear";
			this.replotCovariance = function(){replotCovariance(viewSetup)};


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
			this.replotPCAHeatmap = function(){replotPCAHeatmap(viewSetup)};

			this.replotComparison = function() {replotComparison(viewSetup)};


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