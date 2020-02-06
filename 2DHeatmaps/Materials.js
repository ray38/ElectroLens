export function getHeatmapMaterial(options) {
	var uniforms = {

		color:     { value: new THREE.Color( 0xffffff ) },
		texture:   { value: new THREE.TextureLoader().load( "textures/sprites/disc.png" ) }

	};

	var shaderMaterial = new THREE.ShaderMaterial( {

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


	return shaderMaterial;

}
