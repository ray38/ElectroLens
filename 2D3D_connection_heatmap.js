if ( ! Detector.webgl ) Detector.addGetWebGLMessage();
//var System
var container, stats;
var views, renderer;
var mesh, group1, group2, group3, light;
var selectionPlaneMaterial = new THREE.MeshBasicMaterial( {  color: 0xffffff, opacity: 0.5,transparent: true, side: THREE.DoubleSide,needsUpdate : true } );
var mouseX = 0, mouseY = 0;
var windowWidth, windowHeight;
var mousePosition;
var clickRequest = false;
var mouseHold = false;
var controlers=[];
var scenes = [];

var heightScale = 2., widthScale = 1.;
var views = [
	{
		left: 0,
		top: 0,
		width: 0.6,
		height: 0.5,
		background: new THREE.Color( 0,0,0 ),
		controllerEnabledBackground: new THREE.Color( 0.1,0.1,0.1 ),
		eye: [ 0, 0, 800 ],
		up: [ 0, 1, 0 ],
		fov: 100,
		mousePosition: [0,0],
		viewType: '3Dview',
		moleculeName: 'CO2',
		dataFilename: "data/CO2_B3LYP_0_0_0_all_descriptors.csv",
		controllerEnabled: false,
		controllerZoom : true,
		controllerRotate : true,
		controllerPan : true,
		options: new function(){
			this.pointCloudParticles = 1000;
			this.pointCloudColorSetting = 1.2;
			this.pointCloudAlpha = 1;
			this.pointCloudSize = 1;
			this.boxParticles = 200;
			this.boxColorSetting = 10.0;
			this.boxSize = 10;
			this.boxOpacity = 1;
			this.pointMatrixParticles = 100;
			this.pointMatrixColorSetting = 1.2;
			this.pointMatrixAlpha = 1;
			this.pointMatrixSize = 10;
			this.x_low = 0;
			this.x_high = 100;
			this.y_low = 0;
			this.y_high = 100;
			this.z_low = 0;
			this.z_high = 100;
			this.x_slider = 0;
			this.y_slider = 0;
			this.z_slider = 0;
			this.densityCutoff = -3;
			this.view = 'pointCloud';
			this.moleculeName = 'CO2';
			this.propertyOfInterest = 'n';
			this.colorMap = 'rainbow';
			this.dataFilename = "data/CO2_B3LYP_0_0_0_all_descriptors.csv";
			this.planeVisibilityU = false;
			this.planeVisibilityD = false;
			this.planeVisibilityR = false;
			this.planeVisibilityL = false;
			this.planeVisibilityF = false;
			this.planeVisibilityB = false;
			this.planeOpacity = 0.05;
		}
	},
	{
		left: 0,
		top: 0.5,
		width: 0.6,
		height: 0.5,
		background: new THREE.Color( 0,0,0 ),
		controllerEnabledBackground: new THREE.Color( 0.1,0.1,0.1 ),
		eye: [ 0, 0, 800 ],
		up: [ 0, 1, 0 ],
		fov: 100,
		mousePosition: [0,0],
		viewType: '3Dview',
		moleculeName: 'H2O',
		dataFilename: "data/H2O_B3LYP_0_0_0_all_descriptors.csv",
		controllerEnabled: false,
		controllerZoom : true,
		controllerRotate : true,
		controllerPan : true,
		options: new function(){
			this.pointCloudParticles = 1000;
			this.pointCloudColorSetting = 1.2;
			this.pointCloudAlpha = 1;
			this.pointCloudSize = 1;
			this.boxParticles = 200;
			this.boxColorSetting = 10.0;
			this.boxSize = 10;
			this.boxOpacity = 1;
			this.pointMatrixParticles = 100;
			this.pointMatrixColorSetting = 1.2;
			this.pointMatrixAlpha = 1;
			this.pointMatrixSize = 10;
			this.x_low = 0;
			this.x_high = 100;
			this.y_low = 0;
			this.y_high = 100;
			this.z_low = 0;
			this.z_high = 100;
			this.x_slider = 0;
			this.y_slider = 0;
			this.z_slider = 0;
			this.densityCutoff = -3;
			this.view = 'pointCloud';
			this.moleculeName = 'H2O';
			this.propertyOfInterest = 'n';
			this.colorMap = 'rainbow';
			this.dataFilename = "data/H2O_B3LYP_0_0_0_all_descriptors.csv";
			this.planeVisibilityU = false;
			this.planeVisibilityD = false;
			this.planeVisibilityR = false;
			this.planeVisibilityL = false;
			this.planeVisibilityF = false;
			this.planeVisibilityB = false;
			this.planeOpacity = 0.05;
		}
	},
	{
		left: 0.6,
		top: 0,
		width: 0.4,
		height: 0.2,
		background: new THREE.Color( 0,0,0 ),
		controllerEnabledBackground: new THREE.Color( 0.1,0.1,0.1 ),
		eye: [ 0, 0, 150 ],
		up: [ 0, 0, 1 ],
		fov: 45,
		mousePosition: [0,0],
		viewType: '2Dscatter',
		plotX: 'gamma',
		plotY: 'epxc',
		plotXTransform: 'linear',
		plotYTransform: 'linear',
		controllerEnabled: false,
		controllerZoom : true,
		controllerRotate : false,
		controllerPan : true
	},
	
	{
		left: 0.6,
		top: 0.2,
		width: 0.4,
		height: 0.2,
		background: new THREE.Color( 0,0,0 ),
		controllerEnabledBackground: new THREE.Color( 0.1,0.1,0.1 ),
		eye: [ 0, 0, 150 ],
		up: [ 0, 0, 1 ],
		fov: 45,
		mousePosition: [0,0],
		viewType: '2Dscatter',
		plotX: 'n',
		plotY: 'epxc',
		plotXTransform: 'linear',
		plotYTransform: 'linear',
		controllerEnabled: false,
		controllerZoom : true,
		controllerRotate : false,
		controllerPan : true
	},				
	{
		left: 0.6,
		top: 0.4,
		width: 0.4,
		height: 0.2,
		background: new THREE.Color( 0,0,0 ),
		controllerEnabledBackground: new THREE.Color( 0.1,0.1,0.1 ),
		eye: [ 0, 0, 150 ],
		up: [ 0, 0, 1 ],
		fov: 45,
		mousePosition: [0,0],
		viewType: '2Dscatter',
		plotX: 'gamma',
		plotY: 'epxc',
		plotXTransform: 'linear',
		plotYTransform: 'log10',
		controllerEnabled: false,
		controllerZoom : true,
		controllerRotate : false,
		controllerPan : true
	},
	
	{
		left: 0.6,
		top: 0.6,
		width: 0.4,
		height: 0.2,
		background: new THREE.Color( 0,0,0 ),
		controllerEnabledBackground: new THREE.Color( 0.1,0.1,0.1 ),
		eye: [ 0, 0, 150 ],
		up: [ 0, 0, 1 ],
		fov: 45,
		mousePosition: [0,0],
		viewType: '2Dscatter',
		plotX: 'n',
		plotY: 'epxc',
		plotXTransform: 'log10',
		plotYTransform: 'log10',
		controllerEnabled: false,
		controllerZoom : true,
		controllerRotate : false,
		controllerPan : true
	},
	{
		left: 0.6,
		top: 0.8,
		width: 0.4,
		height: 0.2,
		background: new THREE.Color( 0,0,0 ),
		controllerEnabledBackground: new THREE.Color( 0.1,0.1,0.1 ),
		eye: [ 0, 0, 150 ],
		up: [ 0, 0, 1 ],
		fov: 45,
		mousePosition: [0,0],
		viewType: '2Dscatter',
		plotX: 'n',
		plotY: 'epxc',
		plotXTransform: 'log10',
		plotYTransform: 'log10',
		controllerEnabled: false,
		controllerZoom : true,
		controllerRotate : false,
		controllerPan : true
	}
	
];

var unfilteredData = [];
var heatmapData = [];
var num = 0;
var queue=d3.queue();

for (var ii =  0; ii < views.length; ++ii ) {
	var view = views[ii];
	if (view.viewType == '3Dview'){
		queue.defer(readCSV,view,view.dataFilename,unfilteredData,num);
	}			
}


queue.awaitAll(function(error) {
	if (error) throw error;
	init();
	animate();
});


function readCSV(view,filename,plotData,number,callback){

	view.data = [];
	d3.csv(filename, function (d) {
		d.forEach(function (d,i) {
			var n = +d.rho;
			if (n >1e-5){
				var temp = {
						x: +d.x,
						y: +d.y,
						z: +d.z,
						n: +d.rho,
						gamma: +d.gamma,
						epxc: +d.epxc,
						ad0p2: +d.ad0p2,
						deriv1: +d.deriv1,
						deriv2: +d.deriv2,
						selected: true
					}
			    	
				view.data.push(temp);
				plotData.push(temp);
			}
		})
	number = number + view.data.length;
	//console.log(number);
	//console.log(view.data);
	callback(null);
	});

}



function init() {
	console.log('started initialization')
	container = document.getElementById( 'container' );
	renderer = new THREE.WebGLRenderer( { antialias: true } );
	renderer.setPixelRatio( window.devicePixelRatio );
	renderer.setSize( window.innerWidth , window.innerHeight*2);
	container.appendChild( renderer.domElement );
	
	
	

	for (var ii =  0; ii < views.length; ++ii ) {
		var view = views[ii];
		var camera = new THREE.PerspectiveCamera( view.fov, window.innerWidth / window.innerHeight, 1, 10000 );
		camera.position.fromArray( view.eye );
		view.camera = camera;
		tempControler = new THREE.OrbitControls( camera, renderer.domElement );
		view.controler = tempControler;
		controlers.push(tempControler);
		var tempScene = new THREE.Scene();
		view.scene = tempScene;
		scenes.push(tempScene);


		var left   = Math.floor( window.innerWidth  * view.left );
		var top    = Math.floor( window.innerHeight * view.top );
		var width  = Math.floor( window.innerWidth  * view.width );
		var height = Math.floor( window.innerHeight * view.height );

		view.windowLeft = left;
		view.windowTop = top;
		view.windowWidth = width;
		view.windowHeight = height;
		//console.log(left,top);

		if (view.viewType == '3Dview'){
			var System = getPointCloudGeometry(view,view.options);
			view.System = System;
			tempScene.add( System );
		}
		if (view.viewType == '2Dscatter'){
			tempControler.enableRotate=false;
			var tempRaycaster = new THREE.Raycaster();
			view.raycaster = tempRaycaster;
			view.INTERSECTED = null;
			addHeatmapToolTip(view);
			addTitle(view);
			console.log(view.tooltip);
			console.log(view.title);
			
			//var particles = getPointCloud(unfilteredData.length,view.plotX,view.plotY);
			arrangeDataToHeatmap(view,unfilteredData.length,view.plotX,view.plotY,100)
			var particles = getHeatmap(view,view.plotX,view.plotY);
			var line = getAxis(view);
			tempScene.add(line);
			particles.name = 'scatterPoints';
			
			view.scatterPoints = particles;
			view.attributes = particles.attributes;
			view.geometry = particles.geometry;
			tempScene.add(particles);
			
		}

	}
	
	
	stats = new Stats();
	container.appendChild( stats.dom );
	document.addEventListener( 'mousemove', onDocumentMouseMove, false );
	//var mouseHold = false;
	window.addEventListener( 'mousedown', function( event ) {
		mouseHold = true;
		console.log(mouseHold);
		if (event.button == 0){
			clickRequest = true;
		}
	}, false );
	window.addEventListener( 'mouseup', function( event ) {
		mouseHold = false;
		console.log(mouseHold);
		if (event.button == 0){
			clickRequest = false;
		}
	}, false );

	
	window.addEventListener( 'dblclick', function( event ) {
		//console.log(event.button);
		//if (event.button == 2 ){
			for ( var ii = 0; ii < views.length; ++ii ){
				var view = views[ii];
				if (view.viewType == "2Dscatter"){
					var temp = view.scene.getObjectByName('selectionPlane');
					if (temp != null){
						view.scene.remove(temp);
						updateSelection();
				
					} 
				}
			}
		//}
	}, false );
	
}

function addHeatmapToolTip(view){
	var tempTooltip = document.createElement('div');
	tempTooltip.style.position = 'absolute';
	tempTooltip.innerHTML = "";
	//tempTooltip.style.width = 100;
	//tempTooltip.style.height = 100;
	tempTooltip.style.backgroundColor = "blue";
	tempTooltip.style.opacity = 0.5;
	tempTooltip.style.color = "white";
	tempTooltip.style.top = 0 + 'px';
	tempTooltip.style.left = 0 + 'px';
	view.tooltip = tempTooltip;
	document.body.appendChild(tempTooltip);
}

function arrangeDataToHeatmap(view,numData,X,Y,numPerSide,transform){
	var heatmapStep = [];
	for (var i=1; i <= numPerSide; i++) {
		heatmapStep.push(""+i);
	}
	
	if (view.plotXTransform == 'linear') {var xValue = function(d) {return d[X];}}
	if (view.plotYTransform == 'linear') {var yValue = function(d) {return d[Y];}}
	
	if (view.plotXTransform == 'log10') {
		if (view.plotX == 'epxc') {var xValue = function(d) {return Math.log10(-1*d[X]);}}
		else {var xValue = function(d) {return Math.log10(d[X]);};}
	}
	if (view.plotYTransform == 'log10') {
		if (view.plotY == 'epxc') {var yValue = function(d) {return Math.log10(-1*d[Y]);}}
		else {var yValue = function(d) {return Math.log10(d[Y]);};}
	}
	
	var xMin = Math.floor(d3.min(unfilteredData,xValue));
	var xMax = Math.ceil(d3.max(unfilteredData,xValue));
	var yMin = Math.floor(d3.min(unfilteredData,yValue));
	var yMax = Math.ceil(d3.max(unfilteredData,yValue));
	
	/*var xMin = d3.min(unfilteredData,xValue);
	var xMax = d3.max(unfilteredData,xValue);
	var yMin = d3.min(unfilteredData,yValue);
	var yMax = d3.max(unfilteredData,yValue);*/

	view.xMin = xMin;
	view.xMax = xMax;
	view.yMin = yMin;
	view.yMax = yMax;

	var xScale = d3.scaleQuantize()
	.domain([xMin, xMax])
	.range(heatmapStep);
	
	var yScale = d3.scaleQuantize()
	.domain([yMin, yMax])
	.range(heatmapStep);
	
	var xMap = function(d) {return xScale(xValue(d));};
	var yMap = function(d) {return yScale(yValue(d));}; 
	
	view.data = {};
	view.dataXMin = d3.min(unfilteredData,xValue);
	view.dataXMax = d3.max(unfilteredData,xValue);
	view.dataYMin = d3.min(unfilteredData,yValue);
	view.dataYMax = d3.max(unfilteredData,yValue);

	view.xScale = xScale;
	view.yScale = yScale;

	//console.log(xScale.invertExtent(""+50))
	
	for (var i=0; i<numData; i++){
		var heatmapX = xMap(unfilteredData[i]);
		var heatmapY = yMap(unfilteredData[i]);
		
		view.data[heatmapX] = view.data[heatmapX] || {};
		view.data[heatmapX][heatmapY] = view.data[heatmapX][heatmapY] || {list:[], selected:true};
		view.data[heatmapX][heatmapY]['list'].push(unfilteredData[i]);
	}
	
	//console.log(view.data);
			
}

function heatmapPointCount(data){
	var count = 0;
	for (var x in data){
		for (var y in data[x]){
			count = count + 1;
		}
	}
	return count;
}


function getAxis(view){
	var geometry = new THREE.Geometry();
	geometry.vertices.push(new THREE.Vector3(-50, -50, 0));
	geometry.vertices.push(new THREE.Vector3(50, -50, 0));
	geometry.vertices.push(new THREE.Vector3(50, 50, 0));
	geometry.vertices.push(new THREE.Vector3(-50, 50, 0));
	geometry.vertices.push(new THREE.Vector3(-50, -50, 0));
	var material = new THREE.LineBasicMaterial({ color: 0xffffff, linewidth: 3, });
	var line = new THREE.Line(geometry, material);
	return line;
}

function addTitle(view) {
	var titleText = view.plotYTransform + " " + view.plotY + " v.s. " + view.plotXTransform + " " + view.plotX;
	//var titleText = " v.s. ";
	var tempTitle = document.createElement('div');
	tempTitle.style.position = 'absolute';
	tempTitle.innerHTML = titleText;
	tempTitle.style.backgroundColor = "black";
	tempTitle.style.opacity = 0.7;
	tempTitle.style.color = "white";
	tempTitle.style.top = view.windowTop + 'px';
	tempTitle.style.left = view.windowLeft + 'px';
	view.title = tempTitle;
	document.body.appendChild(tempTitle);

	/*var titleText = view.plotY + " v.s. " + view.plotX;

	var titleGeo = new THREE.TextGeometry( titleText, {
		size: 10, height: 1, curveSegments: 3,
        font: 'janda manatee solid', weight: 'normal',
        bevelThickness: 3, bevelSize: 3, bevelEnabled: true
	});

    titleGeo.computeBoundingBox();
    var titleGeoWidth = titleGeo.boundingBox.max.x - titleGeo.boundingBox.min.x;
	var titleMesh = new THREE.Mesh( titleGeo, new THREE.MeshPhongMaterial( { color: 0xffffff } ) );
	titleMesh.position.set( -0.5 * titleGeoWidth, 50, 0 );
	return titleMesh;

	var loader = new THREE.FontLoader();

	loader.load( 'fonts/helvetiker_bold.typeface.json', function ( font ) {

	    var titleGeo = new THREE.TextGeometry( titleText, {
			size: 10, font: font, height: 1, curveSegments: 3,
	        font: 'janda manatee solid', weight: 'normal',
	        bevelThickness: 3, bevelSize: 3, bevelEnabled: true
		});

	    titleGeo.computeBoundingBox();
	    var titleGeoWidth = titleGeo.boundingBox.max.x - titleGeo.boundingBox.min.x;
		var titleMesh = new THREE.Mesh( titleGeo, new THREE.MeshPhongMaterial( { color: 0xffffff } ) );
		titleMesh.position.set( -0.5 * titleGeoWidth, 50, 0 );
		return titleMesh;

	});*/
	
}

function getHeatmap(view,X, Y){
	var uniforms = {

		color:     { value: new THREE.Color( 0xffffff ) },
		//texture:   { value: new THREE.TextureLoader().load( "textures/sprites/disc.png" ) }

	};

	var shaderMaterial = new THREE.ShaderMaterial( {

		uniforms:       uniforms,
		vertexShader:   document.getElementById( 'vertexshader' ).textContent,
		fragmentShader: document.getElementById( 'fragmentshader' ).textContent,

		blending:       THREE.AdditiveBlending,
		depthTest:      false,
		transparent:    true

	});
	
	var data = view.data;
	
	var num = heatmapPointCount(data);
	
	
	var geometry = new THREE.BufferGeometry();
	var colors = new Float32Array(num *3);
	var positions = new Float32Array(num *3);
	var sizes = new Float32Array(num);
	var alphas = new Float32Array(num);

	var heatmapInformation = [];
	//console.log(unfilteredData.length);
	//console.log(num);
	
	lut = new THREE.Lut( 'rainbow', 500 );
	lut.setMax( 1000);
	lut.setMin( 0 );
	
	
	var i = 0;
	var i3 = 0;
	
	for (x in data){
		for (y in data[x]){
			var xPlot = parseFloat(x);
			var yPlot = parseFloat(y);
			
			positions[i3 + 0] = xPlot-50;
			positions[i3 + 1] = yPlot-50;
			positions[i3 + 2] = 0
			
			var numberDatapointsRepresented = countListSelected(data[x][y]['list']);
			if (numberDatapointsRepresented > 0) {
				var color = lut.getColor( numberDatapointsRepresented );
			
				colors[i3 + 0] = color.r;
				colors[i3 + 1] = color.g;
				colors[i3 + 2] = color.b;
			}
			else {
				colors[i3 + 0] = 100;
				colors[i3 + 1] = 100;
				colors[i3 + 2] = 100;
			}
			sizes[i] = 1.5;
			alphas[i] = 1;
			
			i++;
			i3 += 3;

			var tempInfo = {x:xPlot-50, 
							y:yPlot-50, 
							numberDatapointsRepresented: numberDatapointsRepresented,
							xStart: view.xScale.invertExtent(""+xPlot)[0],
							xEnd: 	view.xScale.invertExtent(""+xPlot)[1],
							yStart: view.yScale.invertExtent(""+yPlot)[0],
							yEnd: 	view.yScale.invertExtent(""+yPlot)[1]
							};
			console.log(tempInfo);
			heatmapInformation.push(tempInfo)
		}
	}
	
	view.heatmapInformation = heatmapInformation;
	geometry.addAttribute( 'position', new THREE.BufferAttribute( positions, 3 ) );
	geometry.addAttribute( 'customColor', new THREE.BufferAttribute( colors, 3 ) );
	geometry.addAttribute( 'size', new THREE.BufferAttribute( sizes, 1 ) );
	geometry.addAttribute( 'alpha', new THREE.BufferAttribute( alphas, 1 ) );

	var System = new THREE.Points(geometry, shaderMaterial);
	return System;
	
}

function countListSelected(list) {
	var count = 0;
	
	for (var i = 0; i < list.length; i++) {
		if (list[i].selected){ count += 1;}
	}
	return count;
}

function updateHeatmap(view){
	var particles = view.scatterPoints;
	var data = view.data;
	var num = heatmapPointCount(data);
	colors = new Float32Array(num *3);
	sizes = new Float32Array(num);
	lut = new THREE.Lut( 'rainbow', 500 );
	lut.setMax( 1000);
	lut.setMin( 0 );
	var i = 0;
	var i3 = 0;
	for (x in data){
		for (y in data[x]){
			
			if (countListSelected(data[x][y]['list']) > 0) {
				var color = lut.getColor( countListSelected(data[x][y]['list']) );
			
				colors[i3 + 0] = color.r;
				colors[i3 + 1] = color.g;
				colors[i3 + 2] = color.b;
			}
			else {
				colors[i3 + 0] = 100;
				colors[i3 + 1] = 100;
				colors[i3 + 2] = 100;
			}
			
			sizes[i] = 1.5;
			//alphas[i] = 1;
			
			i++;
			i3 += 3;
		}
	}
	
	//geometry.addAttribute( 'position', new THREE.BufferAttribute( positions, 3 ) );
	particles.geometry.addAttribute( 'customColor', new THREE.BufferAttribute( colors, 3 ) );
	particles.geometry.addAttribute( 'size', new THREE.BufferAttribute( sizes, 1 ) );
	//geometry.addAttribute( 'alpha', new THREE.BufferAttribute( alphas, 1 ) );

}







function onDocumentMouseMove( event ) {
	mouseX = event.clientX;
	mouseY = event.clientY;
	if (mouseHold == false){updateController();}
	//updateController();
	
	for ( var ii = 0; ii < views.length; ++ii ){
		var view = views[ii];
		if (view.controllerEnabled){
			var left   = Math.floor( windowWidth  * view.left );
			var top    = Math.floor( windowHeight * view.top );
			var width  = Math.floor( windowWidth  * view.width ) + left;
			var height = Math.floor( windowHeight * view.height ) + top;
			var vector = new THREE.Vector3();
		
			vector.set(	(((event.clientX-left)/(width-left)) * 2 - 1),
					(-((event.clientY-top)/(height-top)) * 2 + 1),
					0.1);
			vector.unproject( view.camera );
			var dir = vector.sub( view.camera.position ).normalize();
			var distance = - view.camera.position.z/dir.z;
			view.mousePosition = view.camera.position.clone().add( dir.multiplyScalar( distance ) );
			if (view.viewType == "2Dscatter"){updateInteractiveHeatmap(view);}
		}
	}
}
function updateSize() {
	if ( windowWidth != window.innerWidth || windowHeight != window.innerHeight) {
		windowWidth  = window.innerWidth;
		windowHeight = window.innerHeight;
		renderer.setSize ( windowWidth, windowHeight*2 );

		for ( var ii = 0; ii < views.length; ++ii ){
			var view = views[ii];
			if (view.viewType == "2Dscatter") {
				
				var left   = Math.floor( windowWidth  * view.left );
				var top    = Math.floor( windowHeight * view.top );
				var width  = Math.floor( windowWidth  * view.width );
				var height = Math.floor( windowHeight * view.height );

				view.windowLeft = left;
				view.windowTop = top;
				view.windowWidth = width;
				view.windowHeight = height;

				view.title.style.top = view.windowTop + 'px';
				view.title.style.left = view.windowLeft + 'px';
			}
		}
	}
}
function animate() {
	render();
	processClick();
	stats.update();
	requestAnimationFrame( animate );
}

function updateController(){
	for ( var ii = 0; ii < views.length; ++ii ){
		var view = views[ii];
		var left   = Math.floor( windowWidth  * view.left );
		var top    = Math.floor( windowHeight * view.top );
		var width  = Math.floor( windowWidth  * view.width );
		var height = Math.floor( windowHeight * view.height );
		
		if (mouseX > left && mouseX < (left + width) && mouseY > top && mouseY <top + height){
			enableControler(view, view.controler);
		}
		else{
			disableControler(view,view.controler);
		}
	}
}

function enableControler(view, controler){
	view.controllerEnabled = true;
	controler.enableZoom = view.controllerZoom;
	controler.enablePan  = view.controllerPan;
	controler.enableRotate = view.controllerRotate;
}
function disableControler(view, controler){
	view.controllerEnabled = false;
	controler.enableZoom = false;
	controler.enablePan  = false;
	controler.enableRotate = false;
}


function updateInteractiveHeatmap(view){
	var left   = Math.floor( windowWidth  * view.left );
	var top    = Math.floor( windowHeight * view.top );
	var width  = Math.floor( windowWidth  * view.width ) + left;
	var height = Math.floor( windowHeight * view.height ) + top;
	var mouse = new THREE.Vector2();
		
	mouse.set(	(((event.clientX-left)/(width-left)) * 2 - 1),
					(-((event.clientY-top)/(height-top)) * 2 + 1));


	view.raycaster.setFromCamera( mouse.clone(), view.camera );
	var intersects = view.raycaster.intersectObject( view.scatterPoints );
	if ( intersects.length > 0 ) {
		//console.log("found intersect")
		
		view.tooltip.style.top = event.clientY + 5  + 'px';
		view.tooltip.style.left = event.clientX + 5  + 'px';

		interesctIndex = intersects[ 0 ].index;
		view.tooltip.innerHTML = 	"x Range: " + view.heatmapInformation[interesctIndex].xStart + " -- " + view.heatmapInformation[interesctIndex].xEnd  + '<br>' + 
									"y Range: " + view.heatmapInformation[interesctIndex].yStart + " -- " + view.heatmapInformation[interesctIndex].yEnd  + '<br>' +
									"number of points: " + view.heatmapInformation[interesctIndex].numberDatapointsRepresented;

		view.scatterPoints.geometry.attributes.size.array[ interesctIndex ]  = 3;
		view.scatterPoints.geometry.attributes.size.needsUpdate = true;


		if ( view.INTERSECTED != intersects[ 0 ].index ) {
			view.scatterPoints.geometry.attributes.size.array[ view.INTERSECTED ] = 1.5;
			view.INTERSECTED = intersects[ 0 ].index;
			view.scatterPoints.geometry.attributes.size.array[ view.INTERSECTED ] = 3;
			view.scatterPoints.geometry.attributes.size.needsUpdate = true;
		}

	}
	else {	view.tooltip.innerHTML = '';
			view.scatterPoints.geometry.attributes.size.array[ view.INTERSECTED ] = 1.5;
	}
}

function render() {
	updateSize();
	for ( var ii = 0; ii < views.length; ++ii ) {
		var view = views[ii];
		var camera = view.camera;
		var left   = Math.floor( windowWidth  * view.left );
		var top    = Math.floor( windowHeight * view.top );
		var width  = Math.floor( windowWidth  * view.width );
		var height = Math.floor( windowHeight * view.height );

		view.windowLeft = left;
		view.windowTop = top;
		view.windowWidth = width;
		view.windowHeight = height;

		//view.title.style.top = view.windowTop + 'px';
		//view.title.style.left = view.windowLeft + 'px';

		renderer.setViewport( left, top, width, height );
		renderer.setScissor( left, top, width, height );
		renderer.setScissorTest( true );
		if (view.controllerEnabled) {renderer.setClearColor( view.controllerEnabledBackground );}
		else {renderer.setClearColor( view.background );}
		camera.aspect = width / height;
		camera.updateProjectionMatrix();
		//if (view.viewType == "2Dscatter" && view.controllerEnabled){updateInteractiveHeatmap(view);}
		renderer.render( view.scene, camera );
	}
}




function spawnPlane(view){
	//console.log(views[1].controllerEnabled);
	for (var ii =  0; ii < views.length; ++ii ) {
		var temp_view = views[ii];
		if (temp_view.viewType == '2Dscatter' && temp_view.controllerEnabled == false){
			var tempSelectionPlane = temp_view.scene.getObjectByName('selectionPlane');
			if (tempSelectionPlane != null){
				console.log('remove plane')
				temp_view.scene.remove(tempSelectionPlane);
			}					
		}
	}


	var scene = view.scene;
	var mousePosition = view.mousePosition;
	var selectionPlane = new THREE.Mesh( new THREE.PlaneBufferGeometry( 1, 1), selectionPlaneMaterial );
	selectionPlane.geometry.attributes.position.needsUpdate = true;
	var p = selectionPlane.geometry.attributes.position.array;

	var i = 0;
	p[i++] = mousePosition.x-0.01;
	p[i++] = mousePosition.y+0.01;
	p[i++] = mousePosition.z;
	p[i++] = mousePosition.x;
	p[i++] = mousePosition.y+0.01;
	p[i++] = mousePosition.z;
	p[i++] = mousePosition.x-0.01;
	p[i++] = mousePosition.y;
	p[i++] = mousePosition.z;
	p[i++] = mousePosition.x;
	p[i++] = mousePosition.y;
	p[i]   = mousePosition.z;
	
	selectionPlane.name = 'selectionPlane';
	scene.add( selectionPlane );
	updateSelection();
}

function updatePlane(view, plane){
	var scene = view.scene;

	var mousePosition = view.mousePosition;
	
	var selectionPlane = new THREE.Mesh( new THREE.PlaneBufferGeometry( 1, 1), selectionPlaneMaterial );
	selectionPlane.geometry.attributes.position.needsUpdate = true;
	
	
	var pOriginal = plane.geometry.attributes.position.array;
	
	var 	originalFirstVerticesCoordx = pOriginal[0],
		originalFirstVerticesCoordy = pOriginal[1],
		originalFirstVerticesCoordz = pOriginal[2];
	
	p = selectionPlane.geometry.attributes.position.array
	var i = 0;
	p[i++] = originalFirstVerticesCoordx;
	p[i++] = originalFirstVerticesCoordy;
	p[i++] = originalFirstVerticesCoordz;
	p[i++] = mousePosition.x;
	p[i++] = originalFirstVerticesCoordy;
	p[i++] = mousePosition.z;
	p[i++] = originalFirstVerticesCoordx;
	p[i++] = mousePosition.y;
	p[i++] = mousePosition.z;
	p[i++] = mousePosition.x;
	p[i++] = mousePosition.y;
	p[i]   = mousePosition.z;
	
	scene.remove(plane);
	selectionPlane.name = 'selectionPlane';
	scene.add( selectionPlane );
	updateSelection();
	
}

function updateSelectionFromHeatmap(view){
	var data = view.data;
	for (var x in data){
		for (var y in data[x]){
			if (data[x][y].selected) {
				for (var i = 0; i < data[x][y]['list'].length; i++) {
					data[x][y]['list'][i].selected = true;
				}
			}
			else {
				for (var i = 0; i < data[x][y]['list'].length; i++) {
					data[x][y]['list'][i].selected = false;
				}
			}
		}
	}
}

function updateSelection(){
	var noSelection = true;
	for (var ii =  0; ii < views.length; ++ii ) {
		var temp_view = views[ii];
		if (temp_view.viewType == '2Dscatter'){
			var tempSelectionPlane = temp_view.scene.getObjectByName('selectionPlane');
			if (tempSelectionPlane != null){
				noSelection = false;
				var p = tempSelectionPlane.geometry.attributes.position.array;
				var xmin = Math.min(p[0],p[9]), xmax = Math.max(p[0],p[9]),
					ymin = Math.min(p[1],p[10]), ymax = Math.max(p[1],p[10]);
				var tempx,tempy;
				
				var data = temp_view.data
				for (var x in data){
					for (var y in data[x]){
						tempx = parseFloat(x)-50;
						tempy = parseFloat(y)-50;
						if (tempx>xmin && tempx<xmax && tempy>ymin && tempy<ymax){
							//console.log('true')
							data[x][y].selected = true;
						}
						else { data[x][y].selected = false;}
					}
				}
				updateSelectionFromHeatmap(temp_view);							
			}										
		}
	}
	
	
	if(noSelection){
		for (var i=0; i<unfilteredData.length; i++){
			unfilteredData[i].selected = true;
		}
	}
	
	for (var ii =  0; ii < views.length; ++ii ) {
		var view = views[ii];
		if (view.viewType == '2Dscatter'){
			//updatePointCloud(view,unfilteredData.length);
			updateHeatmap(view);
		}
	}
	
	
	//updatePointCloudGeometry(options);
	for (var ii =  0; ii < views.length; ++ii ) {
		var view = views[ii];
		if (view.viewType == '3Dview'){
			updatePointCloudGeometry(view, view.options);
		}
	}


}

function processClick() {
	if ( clickRequest ) {
		for (var ii =  0; ii < views.length; ++ii ) {
			var view = views[ii];
			if (view.viewType == '2Dscatter' && view.controllerEnabled){
				var temp = view.scene.getObjectByName('selectionPlane');
				if (temp != null){
					updatePlane(view,temp);
				}
				else {
					spawnPlane(view);
				}
			}
		}
	}
}
