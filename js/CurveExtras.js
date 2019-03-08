/**
 * @author WestLangley / http://github.com/WestLangley
 *
 * parameters = {
 *  color: <hex>,
 *  linewidth: <float>,
 *  dashed: <boolean>,
 *  dashScale: <float>,
 *  dashSize: <float>,
 *  gapSize: <float>,
 *  resolution: <Vector2>, // to be set by renderer
 * }
 */

THREE.UniformsLib.line = {

	linewidth: { value: 1 },
	resolution: { value: new THREE.Vector2( 1, 1 ) },
	dashScale: { value: 1 },
	dashSize: { value: 1 },
	gapSize: { value: 1 } // todo FIX - maybe change to totalSize

};

THREE.ShaderLib[ 'line' ] = {

	uniforms: THREE.UniformsUtils.merge( [
		THREE.UniformsLib.common,
		THREE.UniformsLib.fog,
		THREE.UniformsLib.line
	] ),

	vertexShader:
		`
		#include <common>
		#include <color_pars_vertex>
		#include <fog_pars_vertex>
		#include <logdepthbuf_pars_vertex>
		#include <clipping_planes_pars_vertex>

		uniform float linewidth;
		uniform vec2 resolution;

		attribute vec3 instanceStart;
		attribute vec3 instanceEnd;

		attribute vec3 instanceColorStart;
		attribute vec3 instanceColorEnd;

		varying vec2 vUv;

		#ifdef USE_DASH

			uniform float dashScale;
			attribute float instanceDistanceStart;
			attribute float instanceDistanceEnd;
			varying float vLineDistance;

		#endif

		void trimSegment( const in vec4 start, inout vec4 end ) {

			// trim end segment so it terminates between the camera plane and the near plane

			// conservative estimate of the near plane
			float a = projectionMatrix[ 2 ][ 2 ]; // 3nd entry in 3th column
			float b = projectionMatrix[ 3 ][ 2 ]; // 3nd entry in 4th column
			float nearEstimate = - 0.5 * b / a;

			float alpha = ( nearEstimate - start.z ) / ( end.z - start.z );

			end.xyz = mix( start.xyz, end.xyz, alpha );

		}

		void main() {

			#ifdef USE_COLOR

				vColor.xyz = ( position.y < 0.5 ) ? instanceColorStart : instanceColorEnd;

			#endif

			#ifdef USE_DASH

				vLineDistance = ( position.y < 0.5 ) ? dashScale * instanceDistanceStart : dashScale * instanceDistanceEnd;

			#endif

			float aspect = resolution.x / resolution.y;

			vUv = uv;

			// camera space
			vec4 start = modelViewMatrix * vec4( instanceStart, 1.0 );
			vec4 end = modelViewMatrix * vec4( instanceEnd, 1.0 );

			// special case for perspective projection, and segments that terminate either in, or behind, the camera plane
			// clearly the gpu firmware has a way of addressing this issue when projecting into ndc space
			// but we need to perform ndc-space calculations in the shader, so we must address this issue directly
			// perhaps there is a more elegant solution -- WestLangley

			bool perspective = ( projectionMatrix[ 2 ][ 3 ] == - 1.0 ); // 4th entry in the 3rd column

			if ( perspective ) {

				if ( start.z < 0.0 && end.z >= 0.0 ) {

					trimSegment( start, end );

				} else if ( end.z < 0.0 && start.z >= 0.0 ) {

					trimSegment( end, start );

				}

			}

			// clip space
			vec4 clipStart = projectionMatrix * start;
			vec4 clipEnd = projectionMatrix * end;

			// ndc space
			vec2 ndcStart = clipStart.xy / clipStart.w;
			vec2 ndcEnd = clipEnd.xy / clipEnd.w;

			// direction
			vec2 dir = ndcEnd - ndcStart;

			// account for clip-space aspect ratio
			dir.x *= aspect;
			dir = normalize( dir );

			// perpendicular to dir
			vec2 offset = vec2( dir.y, - dir.x );

			// undo aspect ratio adjustment
			dir.x /= aspect;
			offset.x /= aspect;

			// sign flip
			if ( position.x < 0.0 ) offset *= - 1.0;

			// endcaps
			if ( position.y < 0.0 ) {

				offset += - dir;

			} else if ( position.y > 1.0 ) {

				offset += dir;

			}

			// adjust for linewidth
			offset *= linewidth;

			// adjust for clip-space to screen-space conversion // maybe resolution should be based on viewport ...
			offset /= resolution.y;

			// select end
			vec4 clip = ( position.y < 0.5 ) ? clipStart : clipEnd;

			// back to clip space
			offset *= clip.w;

			clip.xy += offset;

			gl_Position = clip;

			vec4 mvPosition = ( position.y < 0.5 ) ? start : end; // this is an approximation

			#include <logdepthbuf_vertex>
			#include <clipping_planes_vertex>
			#include <fog_vertex>

		}
		`,

	fragmentShader:
		`
		uniform vec3 diffuse;
		uniform float opacity;

		#ifdef USE_DASH

			uniform float dashSize;
			uniform float gapSize;

		#endif

		varying float vLineDistance;

		#include <common>
		#include <color_pars_fragment>
		#include <fog_pars_fragment>
		#include <logdepthbuf_pars_fragment>
		#include <clipping_planes_pars_fragment>

		varying vec2 vUv;

		void main() {

			#include <clipping_planes_fragment>

			#ifdef USE_DASH

				if ( vUv.y < - 1.0 || vUv.y > 1.0 ) discard; // discard endcaps

				if ( mod( vLineDistance, dashSize + gapSize ) > dashSize ) discard; // todo - FIX

			#endif

			if ( abs( vUv.y ) > 1.0 ) {

				float a = vUv.x;
				float b = ( vUv.y > 0.0 ) ? vUv.y - 1.0 : vUv.y + 1.0;
				float len2 = a * a + b * b;

				if ( len2 > 1.0 ) discard;

			}

			vec4 diffuseColor = vec4( diffuse, opacity );

			#include <logdepthbuf_fragment>
			#include <color_fragment>

			gl_FragColor = vec4( diffuseColor.rgb, diffuseColor.a );

			#include <premultiplied_alpha_fragment>
			#include <tonemapping_fragment>
			#include <encodings_fragment>
			#include <fog_fragment>

		}
		`
};

THREE.LineMaterial = function ( parameters ) {

	THREE.ShaderMaterial.call( this, {

		type: 'LineMaterial',

		uniforms: THREE.UniformsUtils.clone( THREE.ShaderLib[ 'line' ].uniforms ),

		vertexShader: THREE.ShaderLib[ 'line' ].vertexShader,
		fragmentShader: THREE.ShaderLib[ 'line' ].fragmentShader

	} );

	this.dashed = false;

	Object.defineProperties( this, {

		color: {

			enumerable: true,

			get: function () {

				return this.uniforms.diffuse.value;

			},

			set: function ( value ) {

				this.uniforms.diffuse.value = value;

			}

		},

		linewidth: {

			enumerable: true,

			get: function () {

				return this.uniforms.linewidth.value;

			},

			set: function ( value ) {

				this.uniforms.linewidth.value = value;

			}

		},

		dashScale: {

			enumerable: true,

			get: function () {

				return this.uniforms.dashScale.value;

			},

			set: function ( value ) {

				this.uniforms.dashScale.value = value;

			}

		},

		dashSize: {

			enumerable: true,

			get: function () {

				return this.uniforms.dashSize.value;

			},

			set: function ( value ) {

				this.uniforms.dashSize.value = value;

			}

		},

		gapSize: {

			enumerable: true,

			get: function () {

				return this.uniforms.gapSize.value;

			},

			set: function ( value ) {

				this.uniforms.gapSize.value = value;

			}

		},

		resolution: {

			enumerable: true,

			get: function () {

				return this.uniforms.resolution.value;

			},

			set: function ( value ) {

				this.uniforms.resolution.value.copy( value );

			}

		}

	} );

	this.setValues( parameters );

};

THREE.LineMaterial.prototype = Object.create( THREE.ShaderMaterial.prototype );
THREE.LineMaterial.prototype.constructor = THREE.LineMaterial;

THREE.LineMaterial.prototype.isLineMaterial = true;

THREE.LineMaterial.prototype.copy = function ( source ) {

	THREE.ShaderMaterial.prototype.copy.call( this, source );

	this.color.copy( source.color );

	this.linewidth = source.linewidth;

	this.resolution = source.resolution;

	// todo

	return this;

};
/*
 * A bunch of parametric curves
 * @author zz85
 *
 * Formulas collected from various sources
 * http://mathworld.wolfram.com/HeartCurve.html
 * http://mathdl.maa.org/images/upload_library/23/stemkoski/knots/page6.html
 * http://en.wikipedia.org/wiki/Viviani%27s_curve
 * http://mathdl.maa.org/images/upload_library/23/stemkoski/knots/page4.html
 * http://www.mi.sanu.ac.rs/vismath/taylorapril2011/Taylor.pdf
 * http://prideout.net/blog/?p=44
 */

( function( Curves ) {

	// GrannyKnot

	function GrannyKnot() {

		THREE.Curve.call( this );

	}

	GrannyKnot.prototype = Object.create( THREE.Curve.prototype );
	GrannyKnot.prototype.constructor = GrannyKnot;

	GrannyKnot.prototype.getPoint = function( t ) {

		t = 2 * Math.PI * t;

		var x = - 0.22 * Math.cos( t ) - 1.28 * Math.sin( t ) - 0.44 * Math.cos( 3 * t ) - 0.78 * Math.sin( 3 * t );
		var y = - 0.1 * Math.cos( 2 * t ) - 0.27 * Math.sin( 2 * t ) + 0.38 * Math.cos( 4 * t ) + 0.46 * Math.sin( 4 * t );
		var z = 0.7 * Math.cos( 3 * t ) - 0.4 * Math.sin( 3 * t );

		return new THREE.Vector3( x, y, z ).multiplyScalar( 20 );

	};

	// HeartCurve

	function HeartCurve( s ) {

		THREE.Curve.call( this );

		this.scale = ( s === undefined ) ? 5 : s;

	}

	HeartCurve.prototype = Object.create( THREE.Curve.prototype );
	HeartCurve.prototype.constructor = HeartCurve;

	HeartCurve.prototype.getPoint = function( t ) {

		t *= 2 * Math.PI;

		var x = 16 * Math.pow( Math.sin( t ), 3 );
		var y = 13 * Math.cos( t ) - 5 * Math.cos( 2 * t ) - 2 * Math.cos( 3 * t ) - Math.cos( 4 * t );
		var z = 0;

		return new THREE.Vector3( x, y, z ).multiplyScalar( this.scale );

	};

	// Viviani's Curve

	function VivianiCurve( radius ) {

		THREE.Curve.call( this );

		this.radius = radius;

	}

	VivianiCurve.prototype = Object.create( THREE.Curve.prototype );
	VivianiCurve.prototype.constructor = VivianiCurve;

	VivianiCurve.prototype.getPoint = function( t ) {

		t = t * 4 * Math.PI; // normalized to 0..1
		var a = this.radius / 2;

		var x = a * ( 1 + Math.cos( t ) );
		var y = a * Math.sin( t );
		var z = 2 * a * Math.sin( t / 2 );

		return new THREE.Vector3( x, y, z );

	};

	// KnotCurve

	function KnotCurve() {

		THREE.Curve.call( this );

	}

	KnotCurve.prototype = Object.create( THREE.Curve.prototype );
	KnotCurve.prototype.constructor = KnotCurve;

	KnotCurve.prototype.getPoint = function( t ) {

		t *= 2 * Math.PI;

		var R = 10;
		var s = 50;

		var x = s * Math.sin( t );
		var y = Math.cos( t ) * ( R + s * Math.cos( t ) );
		var z = Math.sin( t ) * ( R + s * Math.cos( t ) );

		return new THREE.Vector3( x, y, z );

	};

	// HelixCurve

	function HelixCurve() {

		THREE.Curve.call( this );

	}

	HelixCurve.prototype = Object.create( THREE.Curve.prototype );
	HelixCurve.prototype.constructor = HelixCurve;

	HelixCurve.prototype.getPoint = function( t ) {

		var a = 30; // radius
		var b = 150; // height

		var t2 = 2 * Math.PI * t * b / 30;

		var x = Math.cos( t2 ) * a;
		var y = Math.sin( t2 ) * a;
		var z = b * t;

		return new THREE.Vector3( x, y, z );

	};

	// TrefoilKnot

	function TrefoilKnot( s ) {

		THREE.Curve.call( this );

		this.scale = ( s === undefined ) ? 10 : s;

	}

	TrefoilKnot.prototype = Object.create( THREE.Curve.prototype );
	TrefoilKnot.prototype.constructor = TrefoilKnot;

	TrefoilKnot.prototype.getPoint = function( t ) {

		t *= Math.PI * 2;

		var x = ( 2 + Math.cos( 3 * t ) ) * Math.cos( 2 * t );
		var y = ( 2 + Math.cos( 3 * t ) ) * Math.sin( 2 * t );
		var z = Math.sin( 3 * t );

		return new THREE.Vector3( x, y, z ).multiplyScalar( this.scale );

	};

	// TorusKnot

	function TorusKnot( s ) {

		THREE.Curve.call( this );

		this.scale = ( s === undefined ) ? 10 : s;

	}

	TorusKnot.prototype = Object.create( THREE.Curve.prototype );
	TorusKnot.prototype.constructor = TorusKnot;

	TorusKnot.prototype.getPoint = function( t ) {

		var p = 3;
		var q = 4;

		t *= Math.PI * 2;

		var x = ( 2 + Math.cos( q * t ) ) * Math.cos( p * t );
		var y = ( 2 + Math.cos( q * t ) ) * Math.sin( p * t );
		var z = Math.sin( q * t );

		return new THREE.Vector3( x, y, z ).multiplyScalar( this.scale );

	};

	// CinquefoilKnot

	function CinquefoilKnot( s ) {

		THREE.Curve.call( this );

		this.scale = ( s === undefined ) ? 10 : s;

	}

	CinquefoilKnot.prototype = Object.create( THREE.Curve.prototype );
	CinquefoilKnot.prototype.constructor = CinquefoilKnot;

	CinquefoilKnot.prototype.getPoint = function( t ) {

		var p = 2;
		var q = 5;

		t *= Math.PI * 2;

		var x = ( 2 + Math.cos( q * t ) ) * Math.cos( p * t );
		var y = ( 2 + Math.cos( q * t ) ) * Math.sin( p * t );
		var z = Math.sin( q * t );

		return new THREE.Vector3( x, y, z ).multiplyScalar( this.scale );

	};

	// TrefoilPolynomialKnot

	function TrefoilPolynomialKnot( s ) {

		THREE.Curve.call( this );

		this.scale = ( s === undefined ) ? 10 : s;

	}

	TrefoilPolynomialKnot.prototype = Object.create( THREE.Curve.prototype );
	TrefoilPolynomialKnot.prototype.constructor = TrefoilPolynomialKnot;

	TrefoilPolynomialKnot.prototype.getPoint = function( t ) {

		t = t * 4 - 2;

		var x = Math.pow( t, 3 ) - 3 * t;
		var y = Math.pow( t, 4 ) - 4 * t * t;
		var z = 1 / 5 * Math.pow( t, 5 ) - 2 * t;

		return new THREE.Vector3( x, y, z ).multiplyScalar( this.scale );

	};

	var scaleTo = function( x, y, t ) {

		var r = y - x;
		return t * r + x;

	};

	// FigureEightPolynomialKnot

	function FigureEightPolynomialKnot( s ) {

		THREE.Curve.call( this );

		this.scale = ( s === undefined ) ? 1 : s;

	}

	FigureEightPolynomialKnot.prototype = Object.create( THREE.Curve.prototype );
	FigureEightPolynomialKnot.prototype.constructor = FigureEightPolynomialKnot;

	FigureEightPolynomialKnot.prototype.getPoint = function( t ) {

		t = scaleTo( - 4, 4, t );

		var x = 2 / 5 * t * ( t * t - 7 ) * ( t * t - 10 );
		var y = Math.pow( t, 4 ) - 13 * t * t;
		var z = 1 / 10 * t * ( t * t - 4 ) * ( t * t - 9 ) * ( t * t - 12 );

		return new THREE.Vector3( x, y, z ).multiplyScalar( this.scale );

	};

	// DecoratedTorusKnot4a

	function DecoratedTorusKnot4a( s ) {

		THREE.Curve.call( this );

		this.scale = ( s === undefined ) ? 40 : s;

	}

	DecoratedTorusKnot4a.prototype = Object.create( THREE.Curve.prototype );
	DecoratedTorusKnot4a.prototype.constructor = DecoratedTorusKnot4a;

	DecoratedTorusKnot4a.prototype.getPoint = function( t ) {

		t *= Math.PI * 2;

		var x = Math.cos( 2 * t ) * ( 1 + 0.6 * ( Math.cos( 5 * t ) + 0.75 * Math.cos( 10 * t ) ) );
		var y = Math.sin( 2 * t ) * ( 1 + 0.6 * ( Math.cos( 5 * t ) + 0.75 * Math.cos( 10 * t ) ) );
		var z = 0.35 * Math.sin( 5 * t );

		return new THREE.Vector3( x, y, z ).multiplyScalar( this.scale );

	};

	// DecoratedTorusKnot4b

	function DecoratedTorusKnot4b( s ) {

		THREE.Curve.call( this );

		this.scale = ( s === undefined ) ? 40 : s;

	}

	DecoratedTorusKnot4b.prototype = Object.create( THREE.Curve.prototype );
	DecoratedTorusKnot4b.prototype.constructor = DecoratedTorusKnot4b;

	DecoratedTorusKnot4b.prototype.getPoint = function( t ) {

		var fi = t * Math.PI * 2;

		var x = Math.cos( 2 * fi ) * ( 1 + 0.45 * Math.cos( 3 * fi ) + 0.4 * Math.cos( 9 * fi ) );
		var y = Math.sin( 2 * fi ) * ( 1 + 0.45 * Math.cos( 3 * fi ) + 0.4 * Math.cos( 9 * fi ) );
		var z = 0.2 * Math.sin( 9 * fi );

		return new THREE.Vector3( x, y, z ).multiplyScalar( this.scale );

	};

	// DecoratedTorusKnot5a

	function DecoratedTorusKnot5a( s ) {

		THREE.Curve.call( this );

		this.scale = ( s === undefined ) ? 40 : s;

	}

	DecoratedTorusKnot5a.prototype = Object.create( THREE.Curve.prototype );
	DecoratedTorusKnot5a.prototype.constructor = DecoratedTorusKnot5a;

	DecoratedTorusKnot5a.prototype.getPoint = function( t ) {

		var fi = t * Math.PI * 2;

		var x = Math.cos( 3 * fi ) * ( 1 + 0.3 * Math.cos( 5 * fi ) + 0.5 * Math.cos( 10 * fi ) );
		var y = Math.sin( 3 * fi ) * ( 1 + 0.3 * Math.cos( 5 * fi ) + 0.5 * Math.cos( 10 * fi ) );
		var z = 0.2 * Math.sin( 20 * fi );

		return new THREE.Vector3( x, y, z ).multiplyScalar( this.scale );

	};

	// DecoratedTorusKnot5c

	function DecoratedTorusKnot5c( s ) {

		THREE.Curve.call( this );

		this.scale = ( s === undefined ) ? 40 : s;

	}

	DecoratedTorusKnot5c.prototype = Object.create( THREE.Curve.prototype );
	DecoratedTorusKnot5c.prototype.constructor = DecoratedTorusKnot5c;

	DecoratedTorusKnot5c.prototype.getPoint = function( t ) {

		var fi = t * Math.PI * 2;

		var x = Math.cos( 4 * fi ) * ( 1 + 0.5 * ( Math.cos( 5 * fi ) + 0.4 * Math.cos( 20 * fi ) ) );
		var y = Math.sin( 4 * fi ) * ( 1 + 0.5 * ( Math.cos( 5 * fi ) + 0.4 * Math.cos( 20 * fi ) ) );
		var z = 0.35 * Math.sin( 15 * fi );

		return new THREE.Vector3( x, y, z ).multiplyScalar( this.scale );

	};

	// export

	Curves.GrannyKnot = GrannyKnot;
	Curves.HeartCurve = HeartCurve;
	Curves.VivianiCurve = VivianiCurve;
	Curves.KnotCurve = KnotCurve;
	Curves.HelixCurve = HelixCurve;
	Curves.TrefoilKnot = TrefoilKnot;
	Curves.TorusKnot = TorusKnot;
	Curves.CinquefoilKnot = CinquefoilKnot;
	Curves.TrefoilPolynomialKnot = TrefoilPolynomialKnot;
	Curves.FigureEightPolynomialKnot = FigureEightPolynomialKnot;
	Curves.DecoratedTorusKnot4a = DecoratedTorusKnot4a;
	Curves.DecoratedTorusKnot4b = DecoratedTorusKnot4b;
	Curves.DecoratedTorusKnot5a = DecoratedTorusKnot5a;
	Curves.DecoratedTorusKnot5c = DecoratedTorusKnot5c;

} ) ( THREE.Curves = THREE.Curves || {} );
