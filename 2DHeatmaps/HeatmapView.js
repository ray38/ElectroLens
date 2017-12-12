export function arrangeDataToHeatmap(view,unfilteredData){

	var X = view.options.plotX, Y = view.options.plotY;
	var XTransform = view.options.plotXTransform, YTransform = view.options.plotYTransform;
	var numPerSide = view.options.numPerSide;

	var heatmapStep = [];

	for (var i=1; i <= numPerSide; i++) {
		heatmapStep.push(""+i);
	}
	
	if (XTransform == 'linear') {var xValue = function(d) {return d[X];}}
	if (YTransform == 'linear') {var yValue = function(d) {return d[Y];}}
	
	/*if (XTransform == 'log10') {
		if (X == 'epxc') {var xValue = function(d) {return Math.log10(-1*d[X]);}}
		else {var xValue = function(d) {return Math.log10(d[X]);};}
	}
	if (YTransform == 'log10') {
		if (Y == 'epxc') {var yValue = function(d) {return Math.log10(-1*d[Y]);}}
		else {var yValue = function(d) {return Math.log10(d[Y]);};}
	}*/

	if (XTransform == 'log10') {var xValue = function(d) {return Math.log10(d[X]);};}
	if (YTransform == 'log10') {var yValue = function(d) {return Math.log10(d[Y]);};}

	if (XTransform == 'neglog10') {var xValue = function(d) {return Math.log10(-1*d[X]);}}
	if (YTransform == 'neglog10') {var yValue = function(d) {return Math.log10(-1*d[Y]);}}
	
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
	
	for (var i=0; i<unfilteredData.length; i++){
		var heatmapX = xMap(unfilteredData[i]);
		var heatmapY = yMap(unfilteredData[i]);
		
		view.data[heatmapX] = view.data[heatmapX] || {};
		view.data[heatmapX][heatmapY] = view.data[heatmapX][heatmapY] || {list:[], selected:true};
		view.data[heatmapX][heatmapY]['list'].push(unfilteredData[i]);
	}
	
	//console.log(view.data);
			
}




export function getHeatmap(view){
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

	var X = view.options.plotX;
	var Y = view.options.plotY;
	var options = view.options;
	var scene = view.scene;
	
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
	
	var lut = new THREE.Lut( options.colorMap, 500 );
	lut.setMax( 1000);
	lut.setMin( 0 );

	var legend = lut.setLegendOn( {  'position': { 'x': 8, 'y': -4, 'z': 0 }, 'dimensions': { 'width': 0.5, 'height': 8 } } );
	view.sceneHUD.add( legend );
	view.legend = legend;
	var labels = lut.setLegendLabels( { 'title': 'Count', 'ticks': 5 ,'fontsize': 55} );

	//view.sceneHUD.add ( labels['title'] );

	for ( var i = 0; i < 5; i++ ) {
		view.sceneHUD.add ( labels[ 'ticks' ][ i ] );
		view.sceneHUD.add ( labels[ 'lines' ][ i ] );
	}
	
	var i = 0;
	var i3 = 0;
	
	for (var x in data){
		for (var y in data[x]){
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
			sizes[i] = options.pointCloudSize;
			alphas[i] = options.pointCloudAlpha;
			
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
			//console.log(tempInfo);
			heatmapInformation.push(tempInfo)
		}
	}
	
	view.heatmapInformation = heatmapInformation;
	geometry.addAttribute( 'position', new THREE.BufferAttribute( positions, 3 ) );
	geometry.addAttribute( 'customColor', new THREE.BufferAttribute( colors, 3 ) );
	geometry.addAttribute( 'size', new THREE.BufferAttribute( sizes, 1 ) );
	geometry.addAttribute( 'alpha', new THREE.BufferAttribute( alphas, 1 ) );

	var System = new THREE.Points(geometry, shaderMaterial);
	//return System;

	//particles.name = 'scatterPoints';
			
	view.System = System;
	//view.attributes = particles.attributes;
	//view.geometry = particles.geometry;
	scene.add(System);
	
}


export function updateHeatmap(view){
	var options = view.options;
	var System = view.System;
	var data = view.data;
	var num = heatmapPointCount(data);
	var colors = new Float32Array(num *3);
	var sizes = new Float32Array(num);
	var alphas = new Float32Array(num);
	var lut = new THREE.Lut( options.colorMap, 500 );
	lut.setMax( 1000);
	lut.setMin( 0 );
	var i = 0;
	var i3 = 0;
	for (var x in data){
		for (var y in data[x]){
			
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
			
			sizes[i] = options.pointCloudSize;
			alphas[i] = options.pointCloudAlpha;
			
			i++;
			i3 += 3;
		}
	}
	
	//geometry.addAttribute( 'position', new THREE.BufferAttribute( positions, 3 ) );
	System.geometry.addAttribute( 'customColor', new THREE.BufferAttribute( colors, 3 ) );
	System.geometry.addAttribute( 'size', new THREE.BufferAttribute( sizes, 1 ) );
	System.geometry.addAttribute( 'alpha', new THREE.BufferAttribute( alphas, 1 ) );

}

export function replotHeatmap(view){
	view.scene.remove(view.System);
	//var options = view.options;
	arrangeDataToHeatmap(view,view.unfilteredData);
	getHeatmap(view);

}

function countListSelected(list) {
	var count = 0;
	
	for (var i = 0; i < list.length; i++) {
		if (list[i].selected){ count += 1;}
	}
	return count;
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