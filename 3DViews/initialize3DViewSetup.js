import {fullscreenOneView, deFullscreen} from "../MultiviewControl/calculateViewportSizes.js";
import {insertLegend, removeLegend, changeLegend, insertLegendMolecule, removeLegendMolecule, changeLegendMolecule} from "../MultiviewControl/colorLegend.js";
import {addSystemEdge, removeSystemEdge} from "./systemEdge.js";
import {saveSystemMoleculeData, saveSystemSpatiallyResolvedData} from "../Utilities/saveData.js";
export function initialize3DViewSetup(viewSetup,views,plotSetup){
	
	var systemDimension = viewSetup.systemDimension;
	
	if (viewSetup.systemLatticeVectors == null || viewSetup.systemLatticeVectors == undefined) {
		console.log('assigning default lattice vector');
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
	var xPlotMin = systemDimension.x * -10;
	var yPlotMin = systemDimension.y * -10;
	var zPlotMin = systemDimension.z * -10;
	var xPlotMax = systemDimension.x * 10;
	var yPlotMax = systemDimension.y * 10;
	var zPlotMax = systemDimension.z * 10;
	
	/* var xCoordMin = systemDimension["x"][0], xCoordMax = systemDimension["x"][1];
	var yCoordMin = systemDimension["y"][0], yCoordMax = systemDimension["y"][1];
	var zCoordMin = systemDimension["z"][0], zCoordMax = systemDimension["z"][1];
	var xSteps = (xCoordMax - xCoordMin)/gridSpacing.x;
	var ySteps = (yCoordMax - yCoordMin)/gridSpacing.y;
	var zSteps = (zCoordMax - zCoordMin)/gridSpacing.z; 
	var xPlotMin = 0.0 - (xSteps/2.0), xPlotMax =  0.0 + (xSteps/2.0);
	var yPlotMin = 0.0 - (ySteps/2.0), yPlotMax =  0.0 + (ySteps/2.0);
	var zPlotMin = 0.0 - (zSteps/2.0), zPlotMax =  0.0 + (zSteps/2.0); */

	//plot gridspacing is 1



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
		//viewType: '3Dview',
		//moleculeName: 'CO2',
		//dataFilename: "data/CO2_B3LYP_0_0_0_all_descriptors.csv",
		systemSpatiallyResolvedDataBoolean : false,
		systemMoleculeDataBoolean : false,
		controllerEnabled: false,
		controllerZoom : true,
		controllerRotate : true,
		controllerPan : true,
		// xPlotScale : d3.scaleLinear().domain([xCoordMin,xCoordMax]).range([xPlotMin,xPlotMax]),
		// yPlotScale : d3.scaleLinear().domain([yCoordMin,yCoordMax]).range([yPlotMin,yPlotMax]),
		// zPlotScale : d3.scaleLinear().domain([zCoordMin,zCoordMax]).range([zPlotMin,zPlotMax]),
		// gridSpacing: gridSpacing,
		systemLatticeVectors: systemLatticeVectors,
		systemDimension: systemDimension,
		xPlotMin : xPlotMin,
		xPlotMax : xPlotMax,
		yPlotMin : yPlotMin,
		yPlotMax : yPlotMax,
		zPlotMin : zPlotMin,
		zPlotMax : zPlotMax,
		/* xCoordMin : xCoordMin,
		xCoordMax : xCoordMax,
		yCoordMin : yCoordMin,
		yCoordMax : yCoordMax,
		zCoordMin : zCoordMin,
		zCoordMax : zCoordMax, */
		options: new function(){
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
			this.pointCloudSize = 0.1;
			this.animate = false;
			this.currentFrame = 1;
			this.xPBC = 1;
			this.yPBC = 1;
			this.zPBC = 1;
			this.PBCBoolean = false;
			/* this.x_low =  xPlotMin;
			this.x_high = xPlotMax;
			this.y_low =  yPlotMin;
			this.y_high = yPlotMax;
			this.z_low =  zPlotMin;
			this.z_high = zPlotMax; */
			this.x_low =  -100;
			this.x_high = 100;
			this.y_low =  -100;
			this.y_high = 100;
			this.z_low =  -100;
			this.z_high = 100;
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
			this.resetCamera = function(){viewSetup.controller.reset();};
			this.systemEdgeBoolean = true;
			this.autoRotateSystem = false;
			this.autoRotateSpeed = 2.0;
			this.toggleSystemEdge = function(){
										if(viewSetup.options.systemEdgeBoolean){
											addSystemEdge(viewSetup);
											//viewSetup.options.systemEdgeBoolean = !viewSetup.options.systemEdgeBoolean;
										}
										else {
											removeSystemEdge(viewSetup);
											//viewSetup.options.systemEdgeBoolean = !viewSetup.options.systemEdgeBoolean;
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
			this.atomModelSegments = 12;
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

			this.cameraLightPositionX = 0;
			this.cameraLightPositionY = 0;
			this.cameraLightPositionZ = 0;
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