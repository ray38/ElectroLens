export var uniforms = {

		color:     { value: new THREE.Color( 0xffffff ) },
		texture:   { value: new THREE.TextureLoader().load( "textures/sprites/disc.png" ) }

	};

export var shaderMaterial = new THREE.ShaderMaterial( {

	uniforms:       uniforms,
	vertexShader:   document.getElementById( 'vertexshader' ).textContent,
	fragmentShader: document.getElementById( 'fragmentshader' ).textContent,

	blending:       THREE.AdditiveBlending,
	depthTest:      false,
	transparent:    true

});

export var uniforms2 = {

		color:     { value: new THREE.Color( 0xffffff ) },
		texture:   { value: new THREE.TextureLoader().load( "textures/sprites/ball.png" ) }

	};

export var shaderMaterial2 = new THREE.ShaderMaterial( {

	uniforms:       uniforms2,
	vertexShader:   document.getElementById( 'vertexshader_molecule' ).textContent,
	fragmentShader: document.getElementById( 'fragmentshader_molecule' ).textContent,

	/*blending:       THREE.AdditiveBlending,
	depthTest:      false,
	transparent:    true*/
	alphaTest: 0.5

});

