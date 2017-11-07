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
var controlers=[];
var scenes = [];
var views = [
	{
		left: 0,
		top: 0,
		width: 0.7,
		height: 0.5,
		background: new THREE.Color( 0,0,0 ),
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
		width: 0.7,
		height: 0.5,
		background: new THREE.Color( 0,0,0 ),
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
		left: 0.7,
		top: 0,
		width: 0.3,
		height: 0.5,
		background: new THREE.Color( 0,0,0 ),
		eye: [ 0, 0, 150 ],
		up: [ 0, 0, 1 ],
		fov: 45,
		mousePosition: [0,0],
		viewType: '2Dscatter',
		plotX: 'gamma',
		plotY: 'epxc',
		controllerEnabled: false,
		controllerZoom : true,
		controllerRotate : false,
		controllerPan : true
	},
	
	{
		left: 0.7,
		top: 0.5,
		width: 0.3,
		height: 0.5,
		background: new THREE.Color( 0,0,0 ),
		eye: [ 0, 0, 150 ],
		up: [ 0, 0, 1 ],
		fov: 45,
		mousePosition: [0,0],
		viewType: '2Dscatter',
		plotX: 'n',
		plotY: 'epxc',
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
	renderer = new THREE.WebGLRenderer( { antialias: false } );
	renderer.setPixelRatio( window.devicePixelRatio );
	renderer.setSize( window.innerWidth, window.innerHeight );
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
		if (view.viewType == '3Dview'){
			var System = getPointCloudGeometry(view,view.options);
			view.System = System;
			tempScene.add( System );
		}
		if (view.viewType == '2Dscatter'){
			tempControler.enableRotate=false;
			var particles = getPointCloud(unfilteredData.length,view.plotX,view.plotY);
			arrangeDataToHeatmap(view,unfilteredData.length,view.plotX,view.plotY,20)
			//particles.sortParticles = true;
			particles.name = 'scatterPoints';
			view.scatterPoints = particles;
			tempScene.add(particles);
			
		}

	}
	
	
	stats = new Stats();
	container.appendChild( stats.dom );
	document.addEventListener( 'mousemove', onDocumentMouseMove, false );
	var hold = false;
	window.addEventListener( 'mousedown', function( event ) {
		if (event.button == 0){
			hold = true;
			clickRequest = true;
		}
	}, false );
	window.addEventListener( 'mouseup', function( event ) {
		if (event.button == 0){
			hold = false;
			clickRequest = false;
		}
	}, false );

	
	window.addEventListener( 'click', function( event ) {
		if (event.button == 1){
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
		}
	}, false );
	
}

function arrangeDataToHeatmap(view,numData,X,Y,numPerSide){
	var heatmapStep = [];
	for (var i=1; i <= numPerSide; i++) {
		heatmapStep.push(""+i);
	}
	var xValue = function(d) {return d[X];};
	var yValue = function(d) {return d[Y];};
	
	var xScale = d3.scaleQuantize()
	.domain([d3.min(unfilteredData,xValue), d3.max(unfilteredData,xValue)])
	.range(heatmapStep);
	
	var yScale = d3.scaleQuantize()
	.domain([d3.min(unfilteredData,yValue), d3.max(unfilteredData,yValue)])
	.range(heatmapStep);
	
	var xMap = function(d) {return xScale(xValue(d));};
	var yMap = function(d) {return yScale(yValue(d));}; 
	
	view.data = {};
	for (var i=0; i<numData; i++){
		var heatmapX = xMap(unfilteredData[i]);
		var heatmapY = yMap(unfilteredData[i]);
		
		view.data[heatmapX] = view.data[heatmapX] || {};
		view.data[heatmapX][heatmapY] = view.data[heatmapX][heatmapY] || [];
		//console.log(view.data[heatmapX][heatmapY]);
		view.data[heatmapX][heatmapY].push(unfilteredData[i]);
	}
	
	console.log(view.data);
			
}






function onDocumentMouseMove( event ) {
	mouseX = event.clientX;
	mouseY = event.clientY;
	updateController();
	
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
		}
	}
}
function updateSize() {
	if ( windowWidth != window.innerWidth || windowHeight != window.innerHeight ) {
		windowWidth  = window.innerWidth;
		windowHeight = window.innerHeight;
		renderer.setSize ( windowWidth, windowHeight );
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


function render() {
	updateSize();
	for ( var ii = 0; ii < views.length; ++ii ) {
		var view = views[ii];
		var camera = view.camera;
		var left   = Math.floor( windowWidth  * view.left );
		var top    = Math.floor( windowHeight * view.top );
		var width  = Math.floor( windowWidth  * view.width );
		var height = Math.floor( windowHeight * view.height );
		renderer.setViewport( left, top, width, height );
		renderer.setScissor( left, top, width, height );
		renderer.setScissorTest( true );
		renderer.setClearColor( view.background );
		camera.aspect = width / height;
		camera.updateProjectionMatrix();
		renderer.render( view.scene, camera );
	}
}




function getPointCloud(num, X, Y){
	var uniforms = {

		color:     { value: new THREE.Color( 0xffffff ) },
		texture:   { value: new THREE.TextureLoader().load( "textures/sprites/disc.png" ) }

	};

	var shaderMaterial = new THREE.ShaderMaterial( {

		uniforms:       uniforms,
		vertexShader:   document.getElementById( 'vertexshader' ).textContent,
		fragmentShader: document.getElementById( 'fragmentshader' ).textContent,

		blending:       THREE.AdditiveBlending,
		depthTest:      false,
		transparent:    true

	});
	
	var geometry = new THREE.BufferGeometry();
	var colors = new Float32Array(num *3);
	var positions = new Float32Array(num *3);
	var sizes = new Float32Array(num);
	var alphas = new Float32Array(num);
	console.log(unfilteredData.length);
	console.log(num);

	for (var i = 0, i3 = 0; i < num; i++, i3+=3) {
	    
		
		
		positions[i3 + 0] = unfilteredData[i][X];
		positions[i3 + 1] = unfilteredData[i][Y];
		positions[i3 + 2] = 0//unfilteredData[i][X];
		
		if (unfilteredData[i].selected){
			colors[i3 + 0] = 255;
			colors[i3 + 1] = 0;
			colors[i3 + 2] = 0;
			sizes[i] = 0.2;
		}else {
			colors[i3 + 0] = 255;
			colors[i3 + 1] = 255;
			colors[i3 + 2] = 255;
			sizes[i] = 0.1;
		
		}

		
		alphas[i] = 1;

	}
	geometry.addAttribute( 'position', new THREE.BufferAttribute( positions, 3 ) );
	geometry.addAttribute( 'customColor', new THREE.BufferAttribute( colors, 3 ) );
	geometry.addAttribute( 'size', new THREE.BufferAttribute( sizes, 1 ) );
	geometry.addAttribute( 'alpha', new THREE.BufferAttribute( alphas, 1 ) );

	var System = new THREE.Points(geometry, shaderMaterial);
	return System
}


function updatePointCloud(view,num){
	var particles = view.scatterPoints;
	colors = new Float32Array(num *3);
	sizes = new Float32Array(num);
	//alphas = new Float32Array(num);

	for (var i = 0, i3 = 0; i < num; i++, i3+=3) {
		
		if (unfilteredData[i].selected){
			colors[i3 + 0] = 255;
			colors[i3 + 1] = 0;
			colors[i3 + 2] = 0;
			sizes[i] = 0.2;
		}else {
			colors[i3 + 0] = 255;
			colors[i3 + 1] = 255;
			colors[i3 + 2] = 255;
			sizes[i] = 0.1;
		
		}

		//sizes[i] = 0.1;
		//alphas[i] = 1;

	}
	//geometry.addAttribute( 'position', new THREE.BufferAttribute( positions, 3 ) );
	particles.geometry.addAttribute( 'customColor', new THREE.BufferAttribute( colors, 3 ) );
	particles.geometry.addAttribute( 'size', new THREE.BufferAttribute( sizes, 1 ) );
	//geometry.addAttribute( 'alpha', new THREE.BufferAttribute( alphas, 1 ) );

}


function spawnPlane(view){
	console.log(views[1].controllerEnabled);
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
				for (var i=0; i<unfilteredData.length; i++){
					tempx = unfilteredData[i][temp_view.plotX];
					tempy = unfilteredData[i][temp_view.plotY];
					if (tempx>xmin && tempx<xmax && tempy>ymin && tempy<ymax){
						unfilteredData[i].selected = true;
					}
					else { unfilteredData[i].selected = false;}
				}								
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
			updatePointCloud(view,unfilteredData.length);
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
