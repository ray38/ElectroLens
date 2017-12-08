import {replotHeatmap} from "./HeatmapView.js";
export function initialize2DHeatmapSetup(viewSetup){
	var defaultSetting = {
		background: new THREE.Color( 0,0,0 ),
		controllerEnabledBackground: new THREE.Color( 0.1,0.1,0.1 ),
		eye: [ 0, 0, 150 ],
		up: [ 0, 0, 1 ],
		fov: 45,
		mousePosition: [0,0],
		viewType: '2DHeatmap',
		//plotX: 'gamma',
		//plotY: 'epxc',
		//plotXTransform: 'linear',
		//plotYTransform: 'log10',
		controllerEnabled: false,
		controllerZoom : true,
		controllerRotate : false,
		controllerPan : true,
		options: new function(){
			this.numPerSide = 100;
			this.pointCloudAlpha = 1;
			this.pointCloudSize = 1.5;
			this.plotX = viewSetup.plotX;
			this.plotY = viewSetup.plotY;
			this.plotXTransform = viewSetup.plotXTransform;
			this.plotYTransform = viewSetup.plotYTransform;
			this.colorMap = 'rainbow';
			//this.resetCamera = function(){view.controler.reset();};
			//this.replotHeatmap = function(){replotHeatmap(view)};
		}
	}

	viewSetup = extendObject(viewSetup,defaultSetting);
	//viewSetup = defaultSetting;

}

function extendObject(obj, src) {
    for (var key in src) {
        if (src.hasOwnProperty(key)) obj[key] = src[key];
    }
    return obj;
}