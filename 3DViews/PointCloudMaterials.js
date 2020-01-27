export var uniforms = {

		color:     { value: new THREE.Color( 0xffffff ) },
		texture:   { value: new THREE.TextureLoader().load( "textures/sprites/disc.png" ) }

	};

/*const material = new THREE.ShaderMaterial( {
	vertexShader: `attribute vec3 color;
	attribute vec3 offset;
	varying vec4 vColor;
	varying vec3 vDisplacement;
	uniform float scale;

	void main()	{
		vColor = vec4( color, 1.0 );
		vDisplacement = offset;
		//vDisplacement = vec3(0.0,0.0,0.0);
		vec3 newPosition = position + (vDisplacement);
		gl_Position = projectionMatrix * modelViewMatrix * vec4( newPosition, 1.0 );
	}`,
	fragmentShader: `varying vec3 vPosition;
	varying vec4 vColor;
	void main()	{
		vec4 color = vec4( vColor );
		gl_FragColor = color;
	}`,
	side: THREE.DoubleSide,
	transparent: true
	});
	


<script id="vshader" type="x-shader/x-vertex">
		precision highp float;
		uniform mat4 modelViewMatrix;
		uniform mat4 projectionMatrix;
		uniform float time;

		attribute vec3 position;
		attribute vec2 uv;
		attribute vec3 translate;

		varying vec2 vUv;
		varying float vScale;

		void main() {

			vec4 mvPosition = modelViewMatrix * vec4( translate, 1.0 );
			vec3 trTime = vec3(translate.x + time,translate.y + time,translate.z + time);
			float scale =  sin( trTime.x * 2.1 ) + sin( trTime.y * 3.2 ) + sin( trTime.z * 4.3 );
			vScale = scale;
			scale = scale * 10.0 + 10.0;
			mvPosition.xyz += position * scale;
			vUv = uv;
			gl_Position = projectionMatrix * mvPosition;

		}
	</script>
	<script id="fshader" type="x-shader/x-fragment">
		precision highp float;

		uniform sampler2D map;

		varying vec2 vUv;
		varying float vScale;

		// HSL to RGB Convertion helpers
		vec3 HUEtoRGB(float H){
			H = mod(H,1.0);
			float R = abs(H * 6.0 - 3.0) - 1.0;
			float G = 2.0 - abs(H * 6.0 - 2.0);
			float B = 2.0 - abs(H * 6.0 - 4.0);
			return clamp(vec3(R,G,B),0.0,1.0);
		}

		vec3 HSLtoRGB(vec3 HSL){
			vec3 RGB = HUEtoRGB(HSL.x);
			float C = (1.0 - abs(2.0 * HSL.z - 1.0)) * HSL.y;
			return (RGB - 0.5) * C + HSL.z;
		}

		void main() {
			vec4 diffuseColor = texture2D( map, vUv );
			gl_FragColor = vec4( diffuseColor.xyz * HSLtoRGB(vec3(vScale/5.0, 1.0, 0.5)), diffuseColor.w );

			if ( diffuseColor.w < 0.5 ) discard;
		}
	</script>
	
	
	*/

/*export var shaderMaterialInstanced = new THREE.RawShaderMaterial( {

	uniforms:       uniforms,
	vertexShader:   `
	precision highp float;

	uniform mat4 modelViewMatrix;
	uniform mat4 projectionMatrix;

	attribute vec3 position;

	attribute float size;
	attribute vec3 customColor;
	attribute vec3 offset;
	attribute float alpha;

	varying float vAlpha;
	varying vec3 vColor;

	void main() {
	  vColor = customColor;
	  vAlpha = alpha;
	  vec3 newPosition = position + offset;
	  vec4 mvPosition = modelViewMatrix * vec4( newPosition, 1.0 );
	  gl_PointSize = size * ( 300.0 / -mvPosition.z );
	  gl_Position = projectionMatrix * mvPosition;

	}`,
	fragmentShader: `
	precision highp float;
	uniform vec3 color;
	uniform sampler2D texture;

	varying vec3 vColor;
	varying float vAlpha;

	void main() {
	gl_FragColor = vec4( color * vColor, vAlpha );
	gl_FragColor = gl_FragColor * texture2D( texture, gl_PointCoord );
	}`,

	blending:       THREE.AdditiveBlending,
	depthTest:      false,
	transparent:    true

});*/




export var shaderMaterial = new THREE.ShaderMaterial( {

	uniforms:       uniforms,
	vertexShader:   `
		attribute float size;
		attribute vec3 customColor;
		attribute float alpha;

		varying float vAlpha;
		varying vec3 vColor;

		void main() {
		vColor = customColor;
		vAlpha = alpha;
		vec4 mvPosition = modelViewMatrix * vec4( position, 1.0 );
		gl_PointSize = size * ( 300.0 / -mvPosition.z );
		gl_Position = projectionMatrix * mvPosition;
		}
	`,
	fragmentShader: `
		uniform vec3 color;
		uniform sampler2D texture;

		varying vec3 vColor;
		varying float vAlpha;

		void main() {
			gl_FragColor = vec4( color * vColor, vAlpha );
			gl_FragColor = gl_FragColor * texture2D( texture, gl_PointCoord );
		}
	`,

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

