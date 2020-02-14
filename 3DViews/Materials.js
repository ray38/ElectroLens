export function getPointCloudMaterialInstanced(options) {
	var uniforms = {

		color:     { value: new THREE.Color( 0xffffff ) },
		texture:   { value: new THREE.TextureLoader().load( "textures/sprites/disc.png" ) },

		xClippingPlaneMax: { type: 'f', value: options.x_high },
		xClippingPlaneMin: { type: 'f', value: options.x_low  },
		yClippingPlaneMax: { type: 'f', value: options.y_high },
		yClippingPlaneMin: { type: 'f', value: options.y_low  },
		zClippingPlaneMax: { type: 'f', value: options.z_high },
		zClippingPlaneMin: { type: 'f', value: options.z_low  },

	};


	var pointCloudMaterialInstanced = new THREE.RawShaderMaterial( {

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

			varying vec3 slicePosition;
			varying float vAlpha;
			varying vec3 vColor;

			void main() {
			vColor = customColor;
			vAlpha = alpha;
			vec3 newPosition = position + offset;
			slicePosition = newPosition;
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
			varying vec3 slicePosition;
			uniform float xClippingPlaneMax;
			uniform float xClippingPlaneMin;
			uniform float yClippingPlaneMax;
			uniform float yClippingPlaneMin;
			uniform float zClippingPlaneMax;
			uniform float zClippingPlaneMin;

			void main() {
				if(slicePosition.x<xClippingPlaneMin) discard;
				if(slicePosition.x>xClippingPlaneMax) discard;
				if(slicePosition.y<yClippingPlaneMin) discard;
				if(slicePosition.y>yClippingPlaneMax) discard;
				if(slicePosition.z<zClippingPlaneMin) discard;
				if(slicePosition.z>zClippingPlaneMax) discard;

				gl_FragColor = vec4( color * vColor, vAlpha );
				gl_FragColor = gl_FragColor * texture2D( texture, gl_PointCoord );
			}`,

		blending:       THREE.AdditiveBlending,
		depthTest:      false,
		transparent:    true

	});

	return pointCloudMaterialInstanced;

}









export function getMoleculeMaterialInstanced(options) {


	var material = new THREE.MeshLambertMaterial( {
		// uniforms: uniforms,
		vertexColors: THREE.VertexColors,
	} );

	material.onBeforeCompile = function( shader ) {
		
		shader.uniforms.xClippingPlaneMax = { type: 'f', value: options.x_high };
		shader.uniforms.xClippingPlaneMin = { type: 'f', value: options.x_low  };
		shader.uniforms.yClippingPlaneMax = { type: 'f', value: options.y_high };
		shader.uniforms.yClippingPlaneMin = { type: 'f', value: options.y_low  };
		shader.uniforms.zClippingPlaneMax = { type: 'f', value: options.z_high };
		shader.uniforms.zClippingPlaneMin = { type: 'f', value: options.z_low  };
		shader.vertexShader = `
			#define LAMBERT
		
			// instanced
			attribute vec3 offset;
			// attribute vec3 instanceColor;
			// attribute float instanceScale;
		
			varying vec3 vLightFront;
			varying vec3 vIndirectFront;
			varying vec3 slicePosition;
			
			attribute float selection;
			varying float vSelection;
		
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
				slicePosition = transformed;

				vSelection = selection;
		
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
		shader.fragmentShader = `
			uniform vec3 diffuse;
			uniform vec3 emissive;
			uniform float opacity;
			
			varying vec3 vLightFront;
			varying vec3 vIndirectFront;

			varying vec3 slicePosition;
			varying float vSelection;
			uniform float xClippingPlaneMax;
			uniform float xClippingPlaneMin;
			uniform float yClippingPlaneMax;
			uniform float yClippingPlaneMin;
			uniform float zClippingPlaneMax;
			uniform float zClippingPlaneMin;
			
			#ifdef DOUBLE_SIDED
				varying vec3 vLightBack;
				varying vec3 vIndirectBack;
			#endif
			
			
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
			#include <bsdfs>
			#include <lights_pars_begin>
			#include <fog_pars_fragment>
			#include <shadowmap_pars_fragment>
			#include <shadowmask_pars_fragment>
			#include <specularmap_pars_fragment>
			#include <logdepthbuf_pars_fragment>
			#include <clipping_planes_pars_fragment>
			
			void main() {

				if(vSelection==0.0) discard;
				if(slicePosition.x<xClippingPlaneMin) discard;
				if(slicePosition.x>xClippingPlaneMax) discard;
				if(slicePosition.y<yClippingPlaneMin) discard;
				if(slicePosition.y>yClippingPlaneMax) discard;
				if(slicePosition.z<zClippingPlaneMin) discard;
				if(slicePosition.z>zClippingPlaneMax) discard;
			
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
				#include <emissivemap_fragment>
			
				// accumulation
				reflectedLight.indirectDiffuse = getAmbientLightIrradiance( ambientLightColor );
			
				#ifdef DOUBLE_SIDED
			
					reflectedLight.indirectDiffuse += ( gl_FrontFacing ) ? vIndirectFront : vIndirectBack;
			
				#else
			
					reflectedLight.indirectDiffuse += vIndirectFront;
			
				#endif
			
				#include <lightmap_fragment>
			
				reflectedLight.indirectDiffuse *= BRDF_Diffuse_Lambert( diffuseColor.rgb );
			
				#ifdef DOUBLE_SIDED
			
					reflectedLight.directDiffuse = ( gl_FrontFacing ) ? vLightFront : vLightBack;
			
				#else
			
					reflectedLight.directDiffuse = vLightFront;
			
				#endif
			
				reflectedLight.directDiffuse *= BRDF_Diffuse_Lambert( diffuseColor.rgb ) * getShadowMask();
			
				// modulation
				#include <aomap_fragment>
			
				vec3 outgoingLight = reflectedLight.directDiffuse + reflectedLight.indirectDiffuse + totalEmissiveRadiance;
			
				#include <envmap_fragment>
			
				gl_FragColor = vec4( outgoingLight, diffuseColor.a );
			
				#include <tonemapping_fragment>
				#include <encodings_fragment>
				#include <fog_fragment>
				#include <premultiplied_alpha_fragment>
				#include <dithering_fragment>
			}
			`;
		material.userData.shader = shader;
	};

	return material;
}



export function getMoleculeAtomSpriteMaterialInstanced(options) {
	var uniforms = {

		color:     { value: new THREE.Color( 0xffffff ) },
		texture:   { value: new THREE.TextureLoader().load( "textures/sprites/ball.png" ) },

		xClippingPlaneMax: { type: 'f', value: options.x_high },
		xClippingPlaneMin: { type: 'f', value: options.x_low  },
		yClippingPlaneMax: { type: 'f', value: options.y_high },
		yClippingPlaneMin: { type: 'f', value: options.y_low  },
		zClippingPlaneMax: { type: 'f', value: options.z_high },
		zClippingPlaneMin: { type: 'f', value: options.z_low  },

	};


	var pointCloudMaterialInstanced = new THREE.RawShaderMaterial( {

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

			varying vec3 slicePosition;
			varying float vAlpha;
			varying vec3 vColor;

			void main() {
			vColor = customColor;
			vAlpha = alpha;
			vec3 newPosition = position + offset;
			slicePosition = newPosition;
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
			varying vec3 slicePosition;
			uniform float xClippingPlaneMax;
			uniform float xClippingPlaneMin;
			uniform float yClippingPlaneMax;
			uniform float yClippingPlaneMin;
			uniform float zClippingPlaneMax;
			uniform float zClippingPlaneMin;

			void main() {
				if(slicePosition.x<xClippingPlaneMin) discard;
				if(slicePosition.x>xClippingPlaneMax) discard;
				if(slicePosition.y<yClippingPlaneMin) discard;
				if(slicePosition.y>yClippingPlaneMax) discard;
				if(slicePosition.z<zClippingPlaneMin) discard;
				if(slicePosition.z>zClippingPlaneMax) discard;

				gl_FragColor = vec4( color * vColor, vAlpha );
				vec4 texColor = texture2D( texture, gl_PointCoord );
				if (texColor.a < 0.5) discard;
				gl_FragColor = gl_FragColor * texColor;
			}`,
		// depthTest:      true,
		// transparent:    true,
		alphaTest: 0.5,
		// blending: THREE.NormalBlending,
		// depthTest: false,
		/// transparent: true

	});

	return pointCloudMaterialInstanced;

}


export function getMoleculeBondLineMaterialInstanced(options) {
	var uniforms = {

		xClippingPlaneMax: { type: 'f', value: options.x_high },
		xClippingPlaneMin: { type: 'f', value: options.x_low  },
		yClippingPlaneMax: { type: 'f', value: options.y_high },
		yClippingPlaneMin: { type: 'f', value: options.y_low  },
		zClippingPlaneMax: { type: 'f', value: options.z_high },
		zClippingPlaneMin: { type: 'f', value: options.z_low  },

	};

	var materialInstanced = new THREE.ShaderMaterial( {
		vertexColors: THREE.VertexColors,
		uniforms:       uniforms,
		vertexShader:   `
			attribute vec3 offset;

			varying vec3 slicePosition;
			varying vec4 vcolor;
		
			void main() {
				vcolor = vec4(color, 1.0);
				vec3 newPosition = position + offset;
				slicePosition = newPosition;
				vec4 mvPosition = modelViewMatrix * vec4( newPosition, 1.0 );
				gl_Position = projectionMatrix * mvPosition;
			}`,
		fragmentShader: `
			varying vec4 vcolor;
			varying vec3 slicePosition;

			uniform float xClippingPlaneMax;
			uniform float xClippingPlaneMin;
			uniform float yClippingPlaneMax;
			uniform float yClippingPlaneMin;
			uniform float zClippingPlaneMax;
			uniform float zClippingPlaneMin;
	
			void main() {
				if(slicePosition.x<xClippingPlaneMin) discard;
				if(slicePosition.x>xClippingPlaneMax) discard;
				if(slicePosition.y<yClippingPlaneMin) discard;
				if(slicePosition.y>yClippingPlaneMax) discard;
				if(slicePosition.z<zClippingPlaneMin) discard;
				if(slicePosition.z>zClippingPlaneMax) discard;
				gl_FragColor = vcolor;
			}`,
		

	});

	return materialInstanced;

}

/*
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

});*/

export function getMoleculeAtomsMaterialInstanced(options) {


	var material = new THREE.MeshLambertMaterial( {
		color: 0xffffff,
		combine: THREE.MultiplyOperation,
		vertexColors: THREE.VertexColors
	} );

	material.onBeforeCompile = function( shader ) {
		
		shader.uniforms.xClippingPlaneMax = { type: 'f', value: options.x_high };
		shader.uniforms.xClippingPlaneMin = { type: 'f', value: options.x_low  };
		shader.uniforms.yClippingPlaneMax = { type: 'f', value: options.y_high };
		shader.uniforms.yClippingPlaneMin = { type: 'f', value: options.y_low  };
		shader.uniforms.zClippingPlaneMax = { type: 'f', value: options.z_high };
		shader.uniforms.zClippingPlaneMin = { type: 'f', value: options.z_low  };
		shader.vertexShader = `
			#define LAMBERT
		
			// instanced
			attribute vec3 instanceOffset;
			attribute float instanceScale;
			attribute vec3 instanceColor;
			// attribute vec3 instanceColor;
			// attribute float instanceScale;
		
			varying vec3 vLightFront;
			varying vec3 vIndirectFront;
			varying vec3 slicePosition;
			
			attribute float selection;
			varying float vSelection;
		
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
				#ifdef USE_COLOR
					vColor.xyz = instanceColor.xyz;
				#endif
		
				#include <beginnormal_vertex>
				#include <morphnormal_vertex>
				#include <skinbase_vertex>
				#include <skinnormal_vertex>
				#include <defaultnormal_vertex>
		
				#include <begin_vertex>
		
				// position instanced
				// transformed *= instanceScale;
				// transformed = transformed + instanceOffset;
				transformed *= instanceScale;
				transformed = transformed + instanceOffset;
				slicePosition = transformed;

				vSelection = selection;
		
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
		shader.fragmentShader = `
			uniform vec3 diffuse;
			uniform vec3 emissive;
			uniform float opacity;
			
			varying vec3 vLightFront;
			varying vec3 vIndirectFront;

			varying vec3 slicePosition;
			varying float vSelection;
			uniform float xClippingPlaneMax;
			uniform float xClippingPlaneMin;
			uniform float yClippingPlaneMax;
			uniform float yClippingPlaneMin;
			uniform float zClippingPlaneMax;
			uniform float zClippingPlaneMin;
			
			#ifdef DOUBLE_SIDED
				varying vec3 vLightBack;
				varying vec3 vIndirectBack;
			#endif
			
			
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
			#include <bsdfs>
			#include <lights_pars_begin>
			#include <fog_pars_fragment>
			#include <shadowmap_pars_fragment>
			#include <shadowmask_pars_fragment>
			#include <specularmap_pars_fragment>
			#include <logdepthbuf_pars_fragment>
			#include <clipping_planes_pars_fragment>
			
			void main() {

				if(vSelection==0.0) discard;
				if(slicePosition.x<xClippingPlaneMin) discard;
				if(slicePosition.x>xClippingPlaneMax) discard;
				if(slicePosition.y<yClippingPlaneMin) discard;
				if(slicePosition.y>yClippingPlaneMax) discard;
				if(slicePosition.z<zClippingPlaneMin) discard;
				if(slicePosition.z>zClippingPlaneMax) discard;
			
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
				#include <emissivemap_fragment>
			
				// accumulation
				reflectedLight.indirectDiffuse = getAmbientLightIrradiance( ambientLightColor );
			
				#ifdef DOUBLE_SIDED
			
					reflectedLight.indirectDiffuse += ( gl_FrontFacing ) ? vIndirectFront : vIndirectBack;
			
				#else
			
					reflectedLight.indirectDiffuse += vIndirectFront;
			
				#endif
			
				#include <lightmap_fragment>
			
				reflectedLight.indirectDiffuse *= BRDF_Diffuse_Lambert( diffuseColor.rgb );
			
				#ifdef DOUBLE_SIDED
			
					reflectedLight.directDiffuse = ( gl_FrontFacing ) ? vLightFront : vLightBack;
			
				#else
			
					reflectedLight.directDiffuse = vLightFront;
			
				#endif
			
				reflectedLight.directDiffuse *= BRDF_Diffuse_Lambert( diffuseColor.rgb ) * getShadowMask();
			
				// modulation
				#include <aomap_fragment>
			
				vec3 outgoingLight = reflectedLight.directDiffuse + reflectedLight.indirectDiffuse + totalEmissiveRadiance;
			
				#include <envmap_fragment>
			
				gl_FragColor = vec4( outgoingLight, diffuseColor.a );
			
				#include <tonemapping_fragment>
				#include <encodings_fragment>
				#include <fog_fragment>
				#include <premultiplied_alpha_fragment>
				#include <dithering_fragment>
			}
			`;
		material.userData.shader = shader;
	};

	return material;
}