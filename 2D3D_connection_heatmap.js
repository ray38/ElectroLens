import {initializeViewSetups} from "./MultiviewControl/initializeViewSetups.js";
import {views} from "./view_setup.js";

import {arrangeDataToHeatmap, getHeatmap, updateHeatmap} from "./2DHeatmaps/HeatmapView.js";

if ( ! Detector.webgl ) Detector.addGetWebGLMessage();
//var System
var container, stats;
//var views, renderer;
var renderer;
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


initializeViewSetups(views);


var unfilteredData = [];
//var heatmapData = [];
var num = 0;
var queue=d3.queue();

for (var ii =  0; ii < views.length; ++ii ) {
	var view = views[ii];
	if (view.viewType == '3DView'){
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
		var tempControler = new THREE.OrbitControls( camera, renderer.domElement );
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

		
		//gui.domElement.id = 'gui' + ii;

		var tempGuiContainer = document.createElement('div');
		
		tempGuiContainer.style.position = 'absolute';
		tempGuiContainer.style.top = view.windowTop + 5 + 'px';
		tempGuiContainer.style.left = view.windowLeft + 'px';
		console.log(tempGuiContainer)
		document.body.appendChild(tempGuiContainer);
		var tempGui = new dat.GUI( { autoPlace: false } );
		view.guiContainer = tempGuiContainer;

		tempGuiContainer.appendChild(tempGui.domElement);

		var moleculeFolder 		= tempGui.addFolder( 'Molecule Selection' );
		moleculeFolder.open();



		if (view.viewType == '3DView'){
			getPointCloudGeometry(view,view.scene,view.options);
		}
		if (view.viewType == '2DHeatmap'){
			tempControler.enableRotate=false;
			var tempRaycaster = new THREE.Raycaster();
			view.raycaster = tempRaycaster;
			view.INTERSECTED = null;
			addHeatmapToolTip(view);
			addTitle(view);
			console.log(view.tooltip);
			console.log(view.title);
			
			arrangeDataToHeatmap(view,unfilteredData)
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
				if (view.viewType == "2DHeatmap"){
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
			if (view.viewType == "2DHeatmap"){updateInteractiveHeatmap(view);}
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
			if (view.viewType == "2DHeatmap") {
				
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

				view.guiContainer.style.top = view.windowTop + 'px';
				view.guiContainer.style.left = view.windowLeft + 'px';
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

		var interesctIndex = intersects[ 0 ].index;
		view.tooltip.innerHTML = 	"x Range: " + view.heatmapInformation[interesctIndex].xStart + "--" + view.heatmapInformation[interesctIndex].xEnd  + '<br>' + 
									"y Range: " + view.heatmapInformation[interesctIndex].yStart + "--" + view.heatmapInformation[interesctIndex].yEnd  + '<br>' +
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
		renderer.setClearColor( 0xffffff, 1 ); // border color
		renderer.clearColor(); // clear color buffer
		if (view.controllerEnabled) {renderer.setClearColor( view.controllerEnabledBackground );}
		else {renderer.setClearColor( view.background );}
		camera.aspect = width / height;
		camera.updateProjectionMatrix();
		//if (view.viewType == "2DHeatmap" && view.controllerEnabled){updateInteractiveHeatmap(view);}
		renderer.render( view.scene, camera );
	}
}




function spawnPlane(view){
	//console.log(views[1].controllerEnabled);
	for (var ii =  0; ii < views.length; ++ii ) {
		var temp_view = views[ii];
		if (temp_view.viewType == '2DHeatmap' && temp_view.controllerEnabled == false){
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
		if (temp_view.viewType == '2DHeatmap'){
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
		if (view.viewType == '2DHeatmap'){
			//updatePointCloud(view,unfilteredData.length);
			updateHeatmap(view);
		}
	}
	
	
	//updatePointCloudGeometry(options);
	for (var ii =  0; ii < views.length; ++ii ) {
		var view = views[ii];
		if (view.viewType == '3DView'){
			updatePointCloudGeometry(view, view.options);
		}
	}


}

function processClick() {
	if ( clickRequest ) {
		for (var ii =  0; ii < views.length; ++ii ) {
			var view = views[ii];
			if (view.viewType == '2DHeatmap' && view.controllerEnabled){
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
