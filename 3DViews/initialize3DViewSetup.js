import {fullscreenOneView, deFullscreen} from "../MultiviewControl/calculateViewportSizes.js";
import {insertLegend, removeLegend, changeLegend, insertLegendMolecule, removeLegendMolecule, changeLegendMolecule} from "../MultiviewControl/colorLegend.js";
import {addSystemEdge, removeSystemEdge} from "./systemEdge.js";
import {saveSystemMoleculeData, saveSystemSpatiallyResolvedData} from "../Utilities/saveData.js";
import {render} from "../2D3D_connection_heatmap.js"
import {changePointCloudGeometry} from "./PointCloud_selection.js";
import {changeMoleculeGeometry} from "./MoleculeView.js";
export function initialize3DViewSetup(viewSetup,views,plotSetup){
	
	var systemDimension = viewSetup.systemDimension;
	
	if (viewSetup.systemLatticeVectors == null || viewSetup.systemLatticeVectors == undefined) {
		viewSetup.systemLatticeVectors = { 	"u11": 1, 
											"u12": 0, 
											"u13": 0, 
											"u21": 0, 
											"u22": 1, 
											"u23": 0,
											"u31": 0, 
											"u32": 0, 
											"u33": 1
		}
	}
	var systemLatticeVectors = viewSetup.systemLatticeVectors;

	if (viewSetup.spatiallyResolvedData != null) {
		if (viewSetup.spatiallyResolvedData.gridSpacing == null && viewSetup.spatiallyResolvedData.numGridPoints == null) {
			alert("Error!! please specify grid spacing and/or number of grid points for all systems")
		} else if (viewSetup.spatiallyResolvedData.gridSpacing == null){
			var numGridPoints = viewSetup.spatiallyResolvedData.numGridPoints;
			var gridSpacing = {	"x": systemDimension.x / numGridPoints.x,
								"y": systemDimension.y / numGridPoints.y,
								"z": systemDimension.z / numGridPoints.z};
			viewSetup.spatiallyResolvedData.gridSpacing	= gridSpacing;	
		} else if (viewSetup.spatiallyResolvedData.numGridPoints == null) {
			var gridSpacing = viewSetup.spatiallyResolvedData.gridSpacing;
			var numGridPoints = {	"x": systemDimension.x / gridSpacing.x,
									"y": systemDimension.y / gridSpacing.y,
									"z": systemDimension.z / gridSpacing.z};
			viewSetup.spatiallyResolvedData.numGridPoints = numGridPoints;
		}
	} 

	var roughSystemSize = Math.sqrt(systemDimension.x * systemDimension.x + systemDimension.y * systemDimension.y + systemDimension.z * systemDimension.z);
	var xPlotMin = systemDimension.x * -6;
	var yPlotMin = systemDimension.y * -6;
	var zPlotMin = systemDimension.z * -6;
	var xPlotMax = systemDimension.x * 6;
	var yPlotMax = systemDimension.y * 6;
	var zPlotMax = systemDimension.z * 6;
	



	var defaultSetting = {
		//left: 0,
		//top: 0,
		//width: 0.6,
		//height: 0.5,
		background: new THREE.Color( 0,0,0 ),
		backgroundAlpha: 1.0,
		controllerEnabledBackground: new THREE.Color( 0.1,0.1,0.1 ),
		// eye: [ 0, 0, 120 ],
		eye: [0, 0, roughSystemSize],
		up: [ 0, 1, 0 ],
		//fov: 100,
		mousePosition: [0,0],
		systemSpatiallyResolvedDataBoolean : false,
		systemMoleculeDataBoolean : false,
		controllerEnabled: false,
		controllerZoom : true,
		controllerRotate : true,
		controllerPan : true,
		systemLatticeVectors: systemLatticeVectors,
		systemDimension: systemDimension,
		xPlotMin : xPlotMin,
		xPlotMax : xPlotMax,
		yPlotMin : yPlotMin,
		yPlotMax : yPlotMax,
		zPlotMin : zPlotMin,
		zPlotMax : zPlotMax,
		
		options: new function(){
			this.plotID = "";
			this.sync3DView = false;
			this.toggleSync = function() {toggleSync(viewSetup,views);}
			this.syncOptions = function() {syncOptions(viewSetup,views);}
			this.cameraFov = 50;
			this.backgroundColor = "#000000";
			this.backgroundAlpha = 0.0;
			this.showPointCloud = true;
			this.showMolecule = true;
			this.atomSize = 0.5;
			this.bondSize = 0.05;
			this.moleculeTransparency = 1.0;
			this.maxBondLength = 1.5;
			this.minBondLength = 0.3;
			this.pointCloudTotalMagnitude = 2;
			this.pointCloudParticles = 10;
			this.pointCloudMaxPointPerBlock = 60;
			this.pointCloudColorSettingMax = 1.2;
			this.pointCloudColorSettingMin = 0.0;
			this.pointCloudAlpha = 1;
			this.pointCloudSize = 0.05;
			this.animate = false;
			this.currentFrame = 1;
			this.xPBC = 1;
			this.yPBC = 1;
			this.zPBC = 1;
			this.PBCBoolean = false;
			this.x_low =  xPlotMin;
			this.x_high = xPlotMax;
			this.y_low =  yPlotMin;
			this.y_high = yPlotMax;
			this.z_low =  zPlotMin;
			this.z_high = zPlotMax;
			this.x_slider = 0;
			this.y_slider = 0;
			this.z_slider = 0;
			this.densityCutoff = -3;
			this.view = 'pointCloud';
			this.moleculeName = viewSetup.moleculeName;
			this.propertyOfInterest = plotSetup["pointcloudDensity"];
			this.density = plotSetup["pointcloudDensity"];
			this.colorMap = 'rainbow';
			this.planeVisibilityU = false;
			this.planeVisibilityD = false;
			this.planeVisibilityR = false;
			this.planeVisibilityL = false;
			this.planeVisibilityF = false;
			this.planeVisibilityB = false;
			this.planeOpacity = 0.05;
			this.resetCamera = function(){
				viewSetup.controller.reset();
				render(views, plotSetup);
			};
			this.systemEdgeBoolean = true;
			this.autoRotateSystem = false;
			this.autoRotateSpeed = 2.0;
			this.toggleSystemEdge = function(){
										if(viewSetup.options.systemEdgeBoolean){
											addSystemEdge(viewSetup);
										}
										else {
											removeSystemEdge(viewSetup);
										}
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
			
			this.moleculeColorCodeBasis = "atom";
			this.moleculeColorMap = 'rainbow';
			this.moleculeColorSettingMax = 2;
			this.moleculeColorSettingMin = -2;
			this.moleculeSizeCodeBasis = "atom";
			this.moleculeSizeSettingMax = 2;
			this.moleculeSizeSettingMin = -2;
			this.moleculeAlpha = 1.0;
			this.atomModelSegments = 18;
			this.bondModelSegments = 8;
			this.showAtoms = true;
			this.showBonds = false;
			this.atomsStyle = "ball";
			this.bondsStyle = "tube";

			this.legendXMolecule = 6;
			this.legendYMolecule = -4;
			this.legendWidthMolecule  = 0.5;
			this.legendHeightMolecule = 6;
			this.legendTickMolecule = 5;
			this.legendFontsizeMolecule = 55;
			this.legendShownBooleanMolecule = true;
			this.toggleLegendMolecule = function(){
									if (!viewSetup.options.legendShownBooleanMolecule){
										insertLegendMolecule(viewSetup);
										viewSetup.options.legendShownBooleanMolecule = !viewSetup.options.legendShownBooleanMolecule;
									}
									else {
										removeLegendMolecule(viewSetup);
										viewSetup.options.legendShownBooleanMolecule = !viewSetup.options.legendShownBooleanMolecule;
									}
								};


			this.saveSystemMoleculeData = function(){saveSystemMoleculeData(viewSetup,plotSetup)};
			this.saveSystemSpatiallyResolvedData = function(){saveSystemSpatiallyResolvedData(viewSetup,plotSetup)};

			this.interactiveSpatiallyResolved = false;
			this.interactiveMolecule = false;

			this.cameraLightPositionX = 0;
			this.cameraLightPositionY = 0;
			this.cameraLightPositionZ = 0;

			this.render = function(){render(views, plotSetup)}
		}
	}

	viewSetup = extendObject(viewSetup,defaultSetting);


}

function extendObject(obj, src) {
    for (var key in src) {
        if (src.hasOwnProperty(key)) obj[key] = src[key];
    }
    return obj;
}

export function toggleSync(currentView, views) {
	for ( var ii = 0; ii < views.length; ++ii ) {
		var view = views[ii];
		view.options.sync3DView = currentView.options.sync3DView
		view.gui.updateDisplay();
	}
}

export function syncOptions(currentView, views){
	var syncPropertyList = [
			'cameraFov',
			'backgroundColor',
			'backgroundAlpha',
			'showPointCloud',
			'showMolecule',
			'atomSize',
			'bondSize',
			'moleculeTransparency',
			'maxBondLength',
			'minBondLength',
			'xPBC',
			'yPBC',
			'zPBC',
			'pointCloudTotalMagnitude',
			'pointCloudParticles',
			'pointCloudMaxPointPerBlock',
			'pointCloudColorSettingMax',
			'pointCloudColorSettingMin',
			'pointCloudAlpha',
			'pointCloudSize',
			'propertyOfInterest',
			'colorMap',
			'systemEdgeBoolean',
			'legendX',
			'legendY',
			'legendWidth',
			'legendHeight',
			'legendTick',
			'legendFontsize',
			'legendShownBoolean',
			'moleculeColorCodeBasis',
			'moleculeColorMap',
			'moleculeColorSettingMax',
			'moleculeColorSettingMin',
			'moleculeSizeCodeBasis',
			'moleculeSizeSettingMax',
			'moleculeSizeSettingMin',
			'moleculeAlpha',
			'atomModelSegments',
			'bondModelSegments',
			'showAtoms',
			'showBonds',
			'atomsStyle',
			'bondsStyle',
			'legendXMolecule',
			'legendYMolecule',
			'legendWidthMolecule',
			'legendHeightMolecule',
			'legendTickMolecule',
			'legendFontsizeMolecule',
			'legendShownBooleanMolecule',
			'cameraLightPositionX',
			'cameraLightPositionY',
			'cameraLightPositionZ'
	];

	var currentOption = currentView.options;
	var currentPlotID = currentOption.PlotID;
	for ( var ii = 0; ii < views.length; ++ii ) {
		var view = views[ii];
		var options = view.options;
		var plotID = options.plotID;

		if (view.viewType == "3DView" && plotID !== currentPlotID && options.sync3DView){
			for (var i = 0; i < syncPropertyList.length; i++) {
				var property = syncPropertyList[i];
				options[property] = currentOption[property]
			}
			changePointCloudGeometry(view);
			changeMoleculeGeometry(view);
			options.toggleSystemEdge.call();
			// options.toggleLegend.call();
			// options.toggleLegendMolecule.call();
			view.gui.updateDisplay();
		}
	}
	currentOption.render.call();
}