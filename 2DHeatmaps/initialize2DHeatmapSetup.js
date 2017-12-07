export function initialize2DHeatmapSetup(viewSetup){
	var defaultSetting = {
		background: new THREE.Color( 0,0,0 ),
		controllerEnabledBackground: new THREE.Color( 0.1,0.1,0.1 ),
		eye: [ 0, 0, 150 ],
		up: [ 0, 0, 1 ],
		fov: 45,
		mousePosition: [0,0],
		//viewType: '2Dscatter',
		//plotX: 'gamma',
		//plotY: 'epxc',
		//plotXTransform: 'linear',
		plotYTransform: 'log10',
		controllerEnabled: false,
		controllerZoom : true,
		controllerRotate : false,
		controllerPan : true
		}

	viewSetup = extendObject(viewSetup,defaultSetting);

}

function extendObject(obj, src) {
    for (var key in src) {
        if (src.hasOwnProperty(key)) obj[key] = src[key];
    }
    return obj;
}