function getHeatMap(view,num,x,y){
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

	var heatmapStep = [];

	for (var i = 1; i <= 100; i++) {
	   heatmapStep.push(""+i);
	}

	var xValue = function(d) { return d[x];};
	var xScale = d3.scaleQuantize()
	.domain([d3.min(unfilteredData, xValue), d3.max(unfilteredData, xValue)])
	.range(heatmapStep);

	var yValue = function(d) { return d[y];};
	var yScale = d3.scaleQuantize()
	.domain([d3.min(unfilteredData, yValue), d3.max(unfilteredData, yValue)])
	.range(heatmapStep);

	view.data = {};
	for (var i = 0; i < num; i++;){


	}


}