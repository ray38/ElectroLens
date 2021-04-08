export var uniforms = {

		color:     { value: new THREE.Color( 0xffffff ) },
		texture:   { value: new THREE.TextureLoader().load( "textures/sprites/disc.png" ) }

	};


export var pointCloudMaterialInstanced = new THREE.RawShaderMaterial( {

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

});







export var pointCloudMaterial = new THREE.ShaderMaterial( {

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

// export var MoleculeMaterial = new THREE.MeshPhongMaterial( { transparent: true, opacity: options.moleculeAlpha, vertexColors: THREE.VertexColors} );


export function getMoleculeMaterialInstanced() {
	var material = new THREE.MeshLambertMaterial( {
		vertexColors: THREE.VertexColors,
	} );

	material.onBeforeCompile = function( shader ) {
		shader.vertexShader = `
		#define LAMBERT
	
		// instanced
		attribute vec3 offset;
		// attribute vec3 instanceColor;
		// attribute float instanceScale;
	
		varying vec3 vLightFront;
		varying vec3 vIndirectFront;
	
		#ifdef DOUBLE_SIDED
			varying vec3 vLightBack;
			varying vec3 vIndirectBack;
		#endif
	
		#include <common>
		#include <uv_pars_vertex>
		#include <uv2_pars_vertex>
		#include <envmap_pars_vertex>
		#include <bsdfs>
		#include <lights_pars_begin>
		#include <color_pars_vertex>
		#include <fog_pars_vertex>
		#include <morphtarget_pars_vertex>
		#include <skinning_pars_vertex>
		#include <shadowmap_pars_vertex>
		#include <logdepthbuf_pars_vertex>
		#include <clipping_planes_pars_vertex>
	
		void main() {
	
			#include <uv_vertex>
			#include <uv2_vertex>
			#include <color_vertex>
	
			// vertex colors instanced
			// #ifdef USE_COLOR
			// 	vColor.xyz = instanceColor.xyz;
			// #endif
	
			#include <beginnormal_vertex>
			#include <morphnormal_vertex>
			#include <skinbase_vertex>
			#include <skinnormal_vertex>
			#include <defaultnormal_vertex>
	
			#include <begin_vertex>
	
			// position instanced
			// transformed *= instanceScale;
			// transformed = transformed + instanceOffset;
			transformed = transformed + offset;
	
			#include <morphtarget_vertex>
			#include <skinning_vertex>
			#include <project_vertex>
			#include <logdepthbuf_vertex>
			#include <clipping_planes_vertex>
	
			#include <worldpos_vertex>
			#include <envmap_vertex>
			#include <lights_lambert_vertex>
			#include <shadowmap_vertex>
			#include <fog_vertex>
	
		}
		`;
	};
	return material;
}




/* 
	export var MoleculeMaterialInstanced = new THREE.RawShaderMaterial( {

		vertexShader:   phongMaterialVertexShaderInstanced,
		fragmentShader: phongMaterialFragmentShaderInstanced,

		blending:       THREE.AdditiveBlending,
		depthTest:      false,
		transparent: 	true, 
		// opacity: 		options.moleculeAlpha, 
		vertexColors: 	THREE.VertexColors

	});


	var phongMaterialVertexShaderInstanced = `
	#define PHONG

	attribute vec3 offset;
	varying vec3 vDisplacement;

	varying vec3 vViewPosition;

	#ifndef FLAT_SHADED

		varying vec3 vNormal;

	#endif

	#include <common>
	#include <uv_pars_vertex>
	#include <uv2_pars_vertex>
	#include <displacementmap_pars_vertex>
	#include <envmap_pars_vertex>
	#include <color_pars_vertex>
	#include <fog_pars_vertex>
	#include <morphtarget_pars_vertex>
	#include <skinning_pars_vertex>
	#include <shadowmap_pars_vertex>
	#include <logdepthbuf_pars_vertex>
	#include <clipping_planes_pars_vertex>

	void main() {

		#include <uv_vertex>
		#include <uv2_vertex>
		#include <color_vertex>

		#include <beginnormal_vertex>
		#include <morphnormal_vertex>
		#include <skinbase_vertex>
		#include <skinnormal_vertex>
		#include <defaultnormal_vertex>

	#ifndef FLAT_SHADED // Normal computed with derivatives when FLAT_SHADED

		vNormal = normalize( transformedNormal );

	#endif

		#include <begin_vertex>
		#include <morphtarget_vertex>
		#include <skinning_vertex>
		#include <displacementmap_vertex>
		#include <project_vertex>
		#include <logdepthbuf_vertex>
		#include <clipping_planes_vertex>

		vViewPosition = - mvPosition.xyz;

		#include <worldpos_vertex>
		#include <envmap_vertex>
		#include <shadowmap_vertex>
		#include <fog_vertex>

		vDisplacement = offset;
        vec3 newPosition = position + (vDisplacement);
        gl_Position = projectionMatrix * modelViewMatrix * vec4( newPosition, 1.0 );

	}
	`;

var phongMaterialFragmentShaderInstanced = `
	#define PHONG

	uniform vec3 diffuse;
	uniform vec3 emissive;
	uniform vec3 specular;
	uniform float shininess;
	uniform float opacity;

	#include <common>
	#include <packing>
	#include <dithering_pars_fragment>
	#include <color_pars_fragment>
	#include <uv_pars_fragment>
	#include <uv2_pars_fragment>
	#include <map_pars_fragment>
	#include <alphamap_pars_fragment>
	#include <aomap_pars_fragment>
	#include <lightmap_pars_fragment>
	#include <emissivemap_pars_fragment>
	#include <envmap_common_pars_fragment>
	#include <envmap_pars_fragment>
	#include <cube_uv_reflection_fragment>
	#include <fog_pars_fragment>
	#include <bsdfs>
	#include <lights_pars_begin>
	#include <lights_phong_pars_fragment>
	#include <shadowmap_pars_fragment>
	#include <bumpmap_pars_fragment>
	#include <normalmap_pars_fragment>
	#include <specularmap_pars_fragment>
	#include <logdepthbuf_pars_fragment>
	#include <clipping_planes_pars_fragment>

	void main() {

		#include <clipping_planes_fragment>

		vec4 diffuseColor = vec4( diffuse, opacity );
		ReflectedLight reflectedLight = ReflectedLight( vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ) );
		vec3 totalEmissiveRadiance = emissive;

		#include <logdepthbuf_fragment>
		#include <map_fragment>
		#include <color_fragment>
		#include <alphamap_fragment>
		#include <alphatest_fragment>
		#include <specularmap_fragment>
		#include <normal_fragment_begin>
		#include <normal_fragment_maps>
		#include <emissivemap_fragment>

		// accumulation
		#include <lights_phong_fragment>
		#include <lights_fragment_begin>
		#include <lights_fragment_maps>
		#include <lights_fragment_end>

		// modulation
		#include <aomap_fragment>

		vec3 outgoingLight = reflectedLight.directDiffuse + reflectedLight.indirectDiffuse + reflectedLight.directSpecular + reflectedLight.indirectSpecular + totalEmissiveRadiance;

		#include <envmap_fragment>

		gl_FragColor = vec4( outgoingLight, diffuseColor.a );

		#include <tonemapping_fragment>
		#include <encodings_fragment>
		#include <fog_fragment>
		#include <premultiplied_alpha_fragment>
		#include <dithering_fragment>

	}
	`;
 */
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


export var moleculeSpriteMaterialInstanced = new THREE.RawShaderMaterial( {

	uniforms:       uniforms2,
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

});
