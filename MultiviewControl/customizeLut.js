/**
 * @author daron1337 / http://daron1337.github.io/
 */

THREE.Lut = function ( colormap, numberofcolors ) {

	this.lut = [];
	this.map = THREE.ColorMapKeywords[ colormap ];
	this.n = numberofcolors;
	this.mapname = colormap;

	var step = 1.0 / this.n;

	for ( var i = 0; i <= 1; i += step ) {

		for ( var j = 0; j < this.map.length - 1; j ++ ) {

			if ( i >= this.map[ j ][ 0 ] && i < this.map[ j + 1 ][ 0 ] ) {

				var min = this.map[ j ][ 0 ];
				var max = this.map[ j + 1 ][ 0 ];

				var minColor = new THREE.Color( 0xffffff ).setHex( this.map[ j ][ 1 ] );
				var maxColor = new THREE.Color( 0xffffff ).setHex( this.map[ j + 1 ][ 1 ] );

				var color = minColor.lerp( maxColor, ( i - min ) / ( max - min ) );

				this.lut.push( color );

			}

		}

	}

	return this.set( this );

};

THREE.Lut.prototype = {

	constructor: THREE.Lut,

	lut: [], map: [], mapname: 'rainbow', n: 256, minV: 0, maxV: 1, legend: null,

	set: function ( value ) {

		if ( value instanceof THREE.Lut ) {

			this.copy( value );

		}

		return this;

	},

	setMin: function ( min ) {

		this.minV = min;

		return this;

	},

	setMax: function ( max ) {

		this.maxV = max;

		return this;

	},

	changeNumberOfColors: function ( numberofcolors ) {

		this.n = numberofcolors;

		return new THREE.Lut( this.mapname, this.n );

	},

	changeColorMap: function ( colormap ) {

		this.mapname = colormap;

		return new THREE.Lut( this.mapname, this.n );

	},

	copy: function ( lut ) {

		this.lut = lut.lut;
		this.mapname = lut.mapname;
		this.map = lut.map;
		this.n = lut.n;
		this.minV = lut.minV;
		this.maxV = lut.maxV;

		return this;

	},

	getColor: function ( alpha ) {

		if ( alpha <= this.minV ) {

			alpha = this.minV;

		} else if ( alpha >= this.maxV ) {

			alpha = this.maxV;

		}

		alpha = ( alpha - this.minV ) / ( this.maxV - this.minV );

		var colorPosition = Math.round ( alpha * this.n );
		colorPosition == this.n ? colorPosition -= 1 : colorPosition;

		return this.lut[ colorPosition ];

	},

	addColorMap: function ( colormapName, arrayOfColors ) {

		THREE.ColorMapKeywords[ colormapName ] = arrayOfColors;

	},

	setLegendOn: function ( parameters ) {

		if ( parameters === undefined ) {

			parameters = {};

		}

		this.legend = {};

		this.legend.layout = parameters.hasOwnProperty( 'layout' ) ? parameters[ 'layout' ] : 'vertical';

		this.legend.position = parameters.hasOwnProperty( 'position' ) ? parameters[ 'position' ] : { 'x': 21.5, 'y': 8, 'z': 5 };

		this.legend.dimensions = parameters.hasOwnProperty( 'dimensions' ) ? parameters[ 'dimensions' ] : { 'width': 0.5, 'height': 3 };

		this.legend.canvas = document.createElement( 'canvas' );

		this.legend.canvas.setAttribute( 'id', 'legend' );
		this.legend.canvas.setAttribute( 'hidden', true );

		document.body.appendChild( this.legend.canvas );

		this.legend.ctx = this.legend.canvas.getContext( '2d' );

		this.legend.canvas.setAttribute( 'width',  1 );
		this.legend.canvas.setAttribute( 'height', this.n );

		this.legend.texture = new THREE.Texture( this.legend.canvas );

		var imageData = this.legend.ctx.getImageData( 0, 0, 1, this.n );

		var data = imageData.data;

		this.map = THREE.ColorMapKeywords[ this.mapname ];

		var k = 0;

		var step = 1.0 / this.n;

		for ( var i = 1; i >= 0; i -= step ) {

			for ( var j = this.map.length - 1; j >= 0; j -- ) {

				if ( i < this.map[ j ][ 0 ] && i >= this.map[ j - 1 ][ 0 ]  ) {

					var min = this.map[ j - 1 ][ 0 ];
					var max = this.map[ j ][ 0 ];

					var minColor = new THREE.Color( 0xffffff ).setHex( this.map[ j - 1 ][ 1 ] );
					var maxColor = new THREE.Color( 0xffffff ).setHex( this.map[ j ][ 1 ] );

					var color = minColor.lerp( maxColor, ( i - min ) / ( max - min ) );

					data[ k * 4 ] = Math.round( color.r * 255 );
					data[ k * 4 + 1 ] = Math.round( color.g * 255 );
					data[ k * 4 + 2 ] = Math.round( color.b * 255 );
					data[ k * 4 + 3 ] = 255;

					k += 1;

				}

			}

		}

		this.legend.ctx.putImageData( imageData, 0, 0 );
		this.legend.texture.needsUpdate = true;

		this.legend.legendGeometry = new THREE.PlaneBufferGeometry( this.legend.dimensions.width, this.legend.dimensions.height );
		this.legend.legendMaterial = new THREE.MeshBasicMaterial( { map : this.legend.texture, side : THREE.DoubleSide } );

		this.legend.mesh = new THREE.Mesh( this.legend.legendGeometry, this.legend.legendMaterial );

		if ( this.legend.layout == 'horizontal' ) {

			this.legend.mesh.rotation.z = - 90 * ( Math.PI / 180 );

		}

		this.legend.mesh.position.copy( this.legend.position );

		return this.legend.mesh;

	},

	setLegendOff: function () {

		this.legend = null;

		return this.legend;

	},

	setLegendLayout: function ( layout ) {

		if ( ! this.legend ) {

			return false;

		}

		if ( this.legend.layout == layout ) {

			return false;

		}

		if ( layout != 'horizontal' && layout != 'vertical' ) {

			return false;

		}

		this.layout = layout;

		if ( layout == 'horizontal' ) {

			this.legend.mesh.rotation.z = 90 * ( Math.PI / 180 );

		}

		if ( layout == 'vertical' ) {

			this.legend.mesh.rotation.z = - 90 * ( Math.PI / 180 );

		}

		return this.legend.mesh;

	},

	setLegendPosition: function ( position ) {

		this.legend.position = new THREE.Vector3( position.x, position.y, position.z );

		return this.legend;

	},

	setLegendLabels: function ( parameters, callback ) {

		if ( ! this.legend ) {

			return false;

		}

		if ( typeof parameters === 'function' ) {

			callback = parameters;

		}

		if ( parameters === undefined ) {

			parameters = {};

		}

		this.legend.labels = {};

		this.legend.labels.fontsize = parameters.hasOwnProperty( 'fontsize' ) ? parameters[ 'fontsize' ] : 24;

		this.legend.labels.fontface = parameters.hasOwnProperty( 'fontface' ) ? parameters[ 'fontface' ] : 'Arial';

		this.legend.labels.title = parameters.hasOwnProperty( 'title' ) ? parameters[ 'title' ] : '';

		this.legend.labels.um = parameters.hasOwnProperty( 'um' ) ? ' [ ' + parameters[ 'um' ] + ' ]' : '';

		this.legend.labels.ticks = parameters.hasOwnProperty( 'ticks' ) ? parameters[ 'ticks' ] : 0;

		this.legend.labels.decimal = parameters.hasOwnProperty( 'decimal' ) ? parameters[ 'decimal' ] : 2;

		this.legend.labels.notation = parameters.hasOwnProperty( 'notation' ) ? parameters[ 'notation' ] : 'standard';

		var backgroundColor = { r: 255, g: 100, b: 100, a: 0.8 };
		var borderColor =  { r: 255, g: 0, b: 0, a: 1.0 };
		var borderThickness = 4;

		var canvasTitle = document.createElement( 'canvas' );
		var contextTitle = canvasTitle.getContext( '2d' );

		contextTitle.font = 'Normal ' + this.legend.labels.fontsize * 1.2 + 'px ' + this.legend.labels.fontface;

		var metrics = contextTitle.measureText( this.legend.labels.title.toString() + this.legend.labels.um.toString() );
		var textWidth = metrics.width;

		contextTitle.fillStyle   = 'rgba(' + backgroundColor.r + ',' + backgroundColor.g + ',' + backgroundColor.b + ',' + backgroundColor.a + ')';

		contextTitle.strokeStyle = 'rgba(' + borderColor.r + ',' + borderColor.g + ',' + borderColor.b + ',' + borderColor.a + ')';

		contextTitle.lineWidth = borderThickness;

		contextTitle.fillStyle = 'rgba( 255, 255, 255, 1.0 )';

		contextTitle.fillText( this.legend.labels.title.toString() + this.legend.labels.um.toString(), borderThickness, this.legend.labels.fontsize + borderThickness );

		var txtTitle = new THREE.CanvasTexture( canvasTitle );
		txtTitle.minFilter = THREE.LinearFilter;

		var spriteMaterialTitle = new THREE.SpriteMaterial( { map: txtTitle } );

		var spriteTitle = new THREE.Sprite( spriteMaterialTitle );

		spriteTitle.scale.set( 2, 1, 1.0 );

		if ( this.legend.layout == 'vertical' ) {

			spriteTitle.position.set( this.legend.position.x + this.legend.dimensions.width, this.legend.position.y + ( this.legend.dimensions.height * 0.45 ), this.legend.position.z );

		}

		if ( this.legend.layout == 'horizontal' ) {

			spriteTitle.position.set( this.legend.position.x * 1.015, this.legend.position.y + ( this.legend.dimensions.height * 0.03 ), this.legend.position.z );

		}

		if ( this.legend.labels.ticks > 0 ) {

			var ticks = {};
			var lines = {};

			if ( this.legend.layout == 'vertical' ) {

				var topPositionY = this.legend.position.y + ( this.legend.dimensions.height * 0.36 );
				var bottomPositionY = this.legend.position.y - ( this.legend.dimensions.height * 0.61 );

			}

			if ( this.legend.layout == 'horizontal' ) {

				var topPositionX = this.legend.position.x + ( this.legend.dimensions.height * 0.75 );
				var bottomPositionX = this.legend.position.x - ( this.legend.dimensions.width * 1.2  ) ;

			}

			for ( var i = 0; i < this.legend.labels.ticks; i ++ ) {

				var value = ( this.maxV - this.minV ) / ( this.legend.labels.ticks - 1  ) * i + this.minV;

				if ( callback ) {

					value = callback ( value );

				} else {

					if ( this.legend.labels.notation == 'scientific' ) {

						value = value.toExponential( this.legend.labels.decimal );

					} else {

						value = value.toFixed( this.legend.labels.decimal );

					}

				}

				var canvasTick = document.createElement( 'canvas' );
				var contextTick = canvasTick.getContext( '2d' );

				contextTick.font = 'Normal ' + this.legend.labels.fontsize + 'px ' + this.legend.labels.fontface;

				var metrics = contextTick.measureText( value.toString() );
				var textWidth = metrics.width;

				contextTick.fillStyle   = 'rgba(' + backgroundColor.r + ',' + backgroundColor.g + ',' + backgroundColor.b + ',' + backgroundColor.a + ')';

				contextTick.strokeStyle = 'rgba(' + borderColor.r + ',' + borderColor.g + ',' + borderColor.b + ',' + borderColor.a + ')';

				contextTick.lineWidth = borderThickness;

				contextTick.fillStyle = 'rgba( 255, 255, 255, 1.0 )';

				contextTick.fillText( value.toString(), borderThickness, this.legend.labels.fontsize + borderThickness );

				var txtTick = new THREE.CanvasTexture( canvasTick );
				txtTick.minFilter = THREE.LinearFilter;

				var spriteMaterialTick = new THREE.SpriteMaterial( { map: txtTick } );

				var spriteTick = new THREE.Sprite( spriteMaterialTick );

				spriteTick.scale.set( 2, 1, 1.0 );

				if ( this.legend.layout == 'vertical' ) {

					var position = bottomPositionY + ( topPositionY - bottomPositionY ) * ( ( value - this.minV ) / ( this.maxV - this.minV ) );

					spriteTick.position.set( this.legend.position.x + ( this.legend.dimensions.width * 2.7 ), position, this.legend.position.z );

				}

				if ( this.legend.layout == 'horizontal' ) {

					var position = bottomPositionX + ( topPositionX - bottomPositionX ) * ( ( value - this.minV ) / ( this.maxV - this.minV ) );

					if ( this.legend.labels.ticks > 5 ) {

						if ( i % 2 === 0 ) {

							var offset = 1.7;

						} else {

							var offset = 2.1;

						}

					} else {

						var offset = 1.7;

					}

					spriteTick.position.set( position, this.legend.position.y - this.legend.dimensions.width * offset, this.legend.position.z );

				}

				var material = new THREE.LineBasicMaterial( { color: 0xffffff, linewidth: 2 } );

				var geometry = new THREE.Geometry();


				if ( this.legend.layout == 'vertical' ) {

					var linePosition = ( this.legend.position.y - ( this.legend.dimensions.height * 0.5 ) + 0.01 ) + ( this.legend.dimensions.height ) * ( ( value - this.minV ) / ( this.maxV - this.minV ) * 0.99 );

					geometry.vertices.push( new THREE.Vector3( this.legend.position.x + this.legend.dimensions.width * 0.55, linePosition, this.legend.position.z  ) );

					geometry.vertices.push( new THREE.Vector3( this.legend.position.x + this.legend.dimensions.width * 0.7, linePosition, this.legend.position.z  ) );

				}

				if ( this.legend.layout == 'horizontal' ) {

					var linePosition = ( this.legend.position.x - ( this.legend.dimensions.height * 0.5 ) + 0.01 ) + ( this.legend.dimensions.height ) * ( ( value - this.minV ) / ( this.maxV - this.minV ) * 0.99 );

					geometry.vertices.push( new THREE.Vector3( linePosition, this.legend.position.y - this.legend.dimensions.width * 0.55, this.legend.position.z  ) );

					geometry.vertices.push( new THREE.Vector3( linePosition, this.legend.position.y - this.legend.dimensions.width * 0.7, this.legend.position.z  ) );

				}

				var line = new THREE.Line( geometry, material );

				lines[ i ] = line;
				ticks[ i ] = spriteTick;

			}

		}

		return { 'title': spriteTitle,  'ticks': ticks, 'lines': lines };

	}

};


THREE.ColorMapKeywords = {

	"rainbow":    [ [ 0.0, '0x0000FF' ], [ 0.2, '0x00FFFF' ], [ 0.5, '0x00FF00' ], [ 0.8, '0xFFFF00' ],  [ 1.0, '0xFF0000' ] ],
	"cooltowarm": [ [ 0.0, '0x3C4EC2' ], [ 0.2, '0x9BBCFF' ], [ 0.5, '0xDCDCDC' ], [ 0.8, '0xF6A385' ],  [ 1.0, '0xB40426' ] ],
	"blackbody" : [ [ 0.0, '0x000000' ], [ 0.2, '0x780000' ], [ 0.5, '0xE63200' ], [ 0.8, '0xFFFF00' ],  [ 1.0, '0xFFFFFF' ] ],
	"grayscale" : [ [ 0.0, '0x000000' ], [ 0.2, '0x404040' ], [ 0.5, '0x7F7F80' ], [ 0.8, '0xBFBFBF' ],  [ 1.0, '0xFFFFFF' ] ],


	"viridis":	[ [0.0, '0x440154'],  [0.1, '0x482475'],  [0.2, '0x414487'],  [0.3, '0x355F8D'],  [0.4, '0x2A788E'],  [0.5, '0x21918C'],  [0.6, '0x22A884'],  [0.7, '0x44BF70'],  [0.8, '0x7AD151'],  [0.9, '0xBDDF26'],  [1.0, '0xFDE725']  ],
	"plasma":	[ [0.0, '0x0D0887'],  [0.1, '0x41049D'],  [0.2, '0x6A00A8'],  [0.3, '0x8F0DA4'],  [0.4, '0xB12A90'],  [0.5, '0xCC4778'],  [0.6, '0xE16462'],  [0.7, '0xF2844B'],  [0.8, '0xFCA636'],  [0.9, '0xFCCE25'],  [1.0, '0xF0F921']  ],
	"inferno":	[ [0.0, '0x000004'],  [0.1, '0x160B39'],  [0.2, '0x420A68'],  [0.3, '0x6A176E'],  [0.4, '0x932667'],  [0.5, '0xBC3754'],  [0.6, '0xDD513A'],  [0.7, '0xF37819'],  [0.8, '0xFCA50A'],  [0.9, '0xF6D746'],  [1.0, '0xFCFFA4']  ],
	"magma":	[ [0.0, '0x000004'],  [0.1, '0x140E36'],  [0.2, '0x3B0F70'],  [0.3, '0x641A80'],  [0.4, '0x8C2981'],  [0.5, '0xB73779'],  [0.6, '0xDE4968'],  [0.7, '0xF7705C'],  [0.8, '0xFE9F6D'],  [0.9, '0xFECF92'],  [1.0, '0xFCFDBF']  ],
	"Greys":	[ [0.0, '0xFFFFFF'],  [0.1, '0xF3F3F3'],  [0.2, '0xE2E2E2'],  [0.3, '0xCECECE'],  [0.4, '0xB5B5B5'],  [0.5, '0x969696'],  [0.6, '0x7A7A7A'],  [0.7, '0x5F5F5F'],  [0.8, '0x404040'],  [0.9, '0x1E1E1E'],  [1.0, '0x000000']  ],
	"Purples":	[ [0.0, '0xFCFBFD'],  [0.1, '0xF2F0F7'],  [0.2, '0xE2E2EF'],  [0.3, '0xCECFE5'],  [0.4, '0xB6B6D8'],  [0.5, '0x9E9AC8'],  [0.6, '0x8683BD'],  [0.7, '0x7362AC'],  [0.8, '0x61409B'],  [0.9, '0x501F8B'],  [1.0, '0x3F007D']  ],
	"Blues":	[ [0.0, '0xF7FBFF'],  [0.1, '0xE3EEF9'],  [0.2, '0xD0E1F2'],  [0.3, '0xB6D4E9'],  [0.4, '0x94C5DF'],  [0.5, '0x6BAED6'],  [0.6, '0x4A97C9'],  [0.7, '0x2E7EBC'],  [0.8, '0x1764AB'],  [0.9, '0x084A92'],  [1.0, '0x08306B']  ],
	"Greens":	[ [0.0, '0xF7FCF5'],  [0.1, '0xE9F6E4'],  [0.2, '0xD3EECD'],  [0.3, '0xB8E3B1'],  [0.4, '0x98D594'],  [0.5, '0x74C476'],  [0.6, '0x4BB062'],  [0.7, '0x2F984E'],  [0.8, '0x157F3B'],  [0.9, '0x006529'],  [1.0, '0x00441B']  ],
	"Oranges":	[ [0.0, '0xFFF5EB'],  [0.1, '0xFEE9D4'],  [0.2, '0xFDD9B4'],  [0.3, '0xFDC38C'],  [0.4, '0xFDA862'],  [0.5, '0xFD8D3C'],  [0.6, '0xF3701B'],  [0.7, '0xE25508'],  [0.8, '0xC44102'],  [0.9, '0x9E3303'],  [1.0, '0x7F2704']  ],
	"Reds":	[ [0.0, '0xFFF5F0'],  [0.1, '0xFEE4D8'],  [0.2, '0xFDCAB5'],  [0.3, '0xFCAB8E'],  [0.4, '0xFC8A6A'],  [0.5, '0xFB6A4A'],  [0.6, '0xF14432'],  [0.7, '0xD92623'],  [0.8, '0xBC141A'],  [0.9, '0x990C13'],  [1.0, '0x67000D']  ],
	"YlOrBr":	[ [0.0, '0xFFFFE5'],  [0.1, '0xFFF9C4'],  [0.2, '0xFEEBA2'],  [0.3, '0xFED777'],  [0.4, '0xFEBC48'],  [0.5, '0xFE9929'],  [0.6, '0xEF7818'],  [0.7, '0xD95A09'],  [0.8, '0xB74203'],  [0.9, '0x8F3104'],  [1.0, '0x662506']  ],
	"YlOrRd":	[ [0.0, '0xFFFFCC'],  [0.1, '0xFFF1A9'],  [0.2, '0xFEE187'],  [0.3, '0xFECA65'],  [0.4, '0xFEAB49'],  [0.5, '0xFD8D3C'],  [0.6, '0xFC5A2D'],  [0.7, '0xED2F22'],  [0.8, '0xD41020'],  [0.9, '0xB10026'],  [1.0, '0x800026']  ],
	"OrRd":	[ [0.0, '0xFFF7EC'],  [0.1, '0xFEEBCF'],  [0.2, '0xFDDCAF'],  [0.3, '0xFDCA94'],  [0.4, '0xFDB27C'],  [0.5, '0xFC8D59'],  [0.6, '0xF26D4B'],  [0.7, '0xE0452F'],  [0.8, '0xC81D13'],  [0.9, '0xA90000'],  [1.0, '0x7F0000']  ],
	"PuRd":	[ [0.0, '0xF7F4F9'],  [0.1, '0xEAE5F1'],  [0.2, '0xDCC9E2'],  [0.3, '0xD0AAD2'],  [0.4, '0xCD8BC3'],  [0.5, '0xDF65B0'],  [0.6, '0xE53591'],  [0.7, '0xD81B6B'],  [0.8, '0xB80B4E'],  [0.9, '0x8E003C'],  [1.0, '0x67001F']  ],
	"RdPu":	[ [0.0, '0xFFF7F3'],  [0.1, '0xFDE5E1'],  [0.2, '0xFCD0CC'],  [0.3, '0xFBB6BC'],  [0.4, '0xF994B1'],  [0.5, '0xF768A1'],  [0.6, '0xE23E99'],  [0.7, '0xC11588'],  [0.8, '0x99017B'],  [0.9, '0x700174'],  [1.0, '0x49006A']  ],
	"BuPu":	[ [0.0, '0xF7FCFD'],  [0.1, '0xE5EFF6'],  [0.2, '0xCCDDEC'],  [0.3, '0xB2CAE1'],  [0.4, '0x9BB5D6'],  [0.5, '0x8C96C6'],  [0.6, '0x8C73B5'],  [0.7, '0x8A52A5'],  [0.8, '0x852D90'],  [0.9, '0x770C72'],  [1.0, '0x4D004B']  ],
	"GnBu":	[ [0.0, '0xF7FCF0'],  [0.1, '0xE5F5DF'],  [0.2, '0xD4EECE'],  [0.3, '0xBEE5BF'],  [0.4, '0x9FDAB8'],  [0.5, '0x7BCCC4'],  [0.6, '0x57B8D0'],  [0.7, '0x399BC6'],  [0.8, '0x1D7DB7'],  [0.9, '0x0860A3'],  [1.0, '0x084081']  ],
	"PuBu":	[ [0.0, '0xFFF7FB'],  [0.1, '0xF0EAF4'],  [0.2, '0xDBDAEB'],  [0.3, '0xBFC9E2'],  [0.4, '0x9CB9D9'],  [0.5, '0x74A9CF'],  [0.6, '0x4295C3'],  [0.7, '0x187DB6'],  [0.8, '0x0567A2'],  [0.9, '0x045382'],  [1.0, '0x023858']  ],
	"YlGnBu":	[ [0.0, '0xFFFFD9'],  [0.1, '0xF1F9B9'],  [0.2, '0xD6EFB3'],  [0.3, '0xABDEB7'],  [0.4, '0x73C9BD'],  [0.5, '0x41B6C4'],  [0.6, '0x2498C1'],  [0.7, '0x2072B1'],  [0.8, '0x234DA0'],  [0.9, '0x1F2F88'],  [1.0, '0x081D58']  ],
	"PuBuGn":	[ [0.0, '0xFFF7FB'],  [0.1, '0xF0E6F2'],  [0.2, '0xDBD8EA'],  [0.3, '0xBFC9E2'],  [0.4, '0x9AB9D9'],  [0.5, '0x67A9CF'],  [0.6, '0x3F95C3'],  [0.7, '0x17879F'],  [0.8, '0x027976'],  [0.9, '0x016452'],  [1.0, '0x014636']  ],
	"BuGn":	[ [0.0, '0xF7FCFD'],  [0.1, '0xE9F6FA'],  [0.2, '0xD6F0EE'],  [0.3, '0xB8E4DB'],  [0.4, '0x8FD4C2'],  [0.5, '0x66C2A4'],  [0.6, '0x48B27F'],  [0.7, '0x2F9958'],  [0.8, '0x157F3B'],  [0.9, '0x006529'],  [1.0, '0x00441B']  ],
	"YlGn":	[ [0.0, '0xFFFFE5'],  [0.1, '0xF9FDC2'],  [0.2, '0xE5F5AC'],  [0.3, '0xC8E89B'],  [0.4, '0xA3D98A'],  [0.5, '0x78C679'],  [0.6, '0x4CB062'],  [0.7, '0x2F934D'],  [0.8, '0x15793E'],  [0.9, '0x006134'],  [1.0, '0x004529']  ],
	"binary":	[ [0.0, '0xFFFFFF'],  [0.1, '0xE6E6E6'],  [0.2, '0xCCCCCC'],  [0.3, '0xB3B3B3'],  [0.4, '0x999999'],  [0.5, '0x7F7F7F'],  [0.6, '0x666666'],  [0.7, '0x4C4C4C'],  [0.8, '0x333333'],  [0.9, '0x191919'],  [1.0, '0x000000']  ],
	"gist_yarg":	[ [0.0, '0xFFFFFF'],  [0.1, '0xE6E6E6'],  [0.2, '0xCCCCCC'],  [0.3, '0xB3B3B3'],  [0.4, '0x999999'],  [0.5, '0x7F7F7F'],  [0.6, '0x666666'],  [0.7, '0x4C4C4C'],  [0.8, '0x333333'],  [0.9, '0x191919'],  [1.0, '0x000000']  ],
	"gist_gray":	[ [0.0, '0x000000'],  [0.1, '0x191919'],  [0.2, '0x333333'],  [0.3, '0x4C4C4C'],  [0.4, '0x666666'],  [0.5, '0x808080'],  [0.6, '0x999999'],  [0.7, '0xB3B3B3'],  [0.8, '0xCCCCCC'],  [0.9, '0xE6E6E6'],  [1.0, '0xFFFFFF']  ],
	"gray":	[ [0.0, '0x000000'],  [0.1, '0x191919'],  [0.2, '0x333333'],  [0.3, '0x4C4C4C'],  [0.4, '0x666666'],  [0.5, '0x808080'],  [0.6, '0x999999'],  [0.7, '0xB3B3B3'],  [0.8, '0xCCCCCC'],  [0.9, '0xE6E6E6'],  [1.0, '0xFFFFFF']  ],
	"bone":	[ [0.0, '0x000000'],  [0.1, '0x16161F'],  [0.2, '0x2D2D3E'],  [0.3, '0x43435D'],  [0.4, '0x595C79'],  [0.5, '0x707B90'],  [0.6, '0x869AA6'],  [0.7, '0x9CB8BC'],  [0.8, '0xB9D2D2'],  [0.9, '0xDCE9E9'],  [1.0, '0xFFFFFF']  ],
	"pink":	[ [0.0, '0x1E0000'],  [0.1, '0x684242'],  [0.2, '0x915D5D'],  [0.3, '0xB07272'],  [0.4, '0xC58B84'],  [0.5, '0xD0AC93'],  [0.6, '0xDAC7A1'],  [0.7, '0xE4DEAE'],  [0.8, '0xEDEDC6'],  [0.9, '0xF6F6E4'],  [1.0, '0xFFFFFF']  ],
	"spring":	[ [0.0, '0xFF00FF'],  [0.1, '0xFF19E6'],  [0.2, '0xFF33CC'],  [0.3, '0xFF4CB3'],  [0.4, '0xFF6699'],  [0.5, '0xFF807F'],  [0.6, '0xFF9966'],  [0.7, '0xFFB34C'],  [0.8, '0xFFCC33'],  [0.9, '0xFFE619'],  [1.0, '0xFFFF00']  ],
	"summer":	[ [0.0, '0x008066'],  [0.1, '0x198C66'],  [0.2, '0x339966'],  [0.3, '0x4CA666'],  [0.4, '0x66B266'],  [0.5, '0x80BF66'],  [0.6, '0x99CC66'],  [0.7, '0xB3D966'],  [0.8, '0xCCE666'],  [0.9, '0xE6F266'],  [1.0, '0xFFFF66']  ],
	"autumn":	[ [0.0, '0xFF0000'],  [0.1, '0xFF1900'],  [0.2, '0xFF3300'],  [0.3, '0xFF4C00'],  [0.4, '0xFF6600'],  [0.5, '0xFF8000'],  [0.6, '0xFF9900'],  [0.7, '0xFFB300'],  [0.8, '0xFFCC00'],  [0.9, '0xFFE600'],  [1.0, '0xFFFF00']  ],
	"winter":	[ [0.0, '0x0000FF'],  [0.1, '0x0019F2'],  [0.2, '0x0033E6'],  [0.3, '0x004CD9'],  [0.4, '0x0066CC'],  [0.5, '0x0080BF'],  [0.6, '0x0099B2'],  [0.7, '0x00B3A6'],  [0.8, '0x00CC99'],  [0.9, '0x00E68C'],  [1.0, '0x00FF80']  ],
	"cool":	[ [0.0, '0x00FFFF'],  [0.1, '0x19E6FF'],  [0.2, '0x33CCFF'],  [0.3, '0x4CB3FF'],  [0.4, '0x6699FF'],  [0.5, '0x807FFF'],  [0.6, '0x9966FF'],  [0.7, '0xB34CFF'],  [0.8, '0xCC33FF'],  [0.9, '0xE619FF'],  [1.0, '0xFF00FF']  ],
	"Wistia":	[ [0.0, '0xE4FF7A'],  [0.1, '0xEFF654'],  [0.2, '0xFAED2D'],  [0.3, '0xFFE015'],  [0.4, '0xFFCE0A'],  [0.5, '0xFFBD00'],  [0.6, '0xFFB100'],  [0.7, '0xFFA600'],  [0.8, '0xFE9900'],  [0.9, '0xFD8C00'],  [1.0, '0xFC7F00']  ],
	"hot":	[ [0.0, '0x0B0000'],  [0.1, '0x4D0000'],  [0.2, '0x900000'],  [0.3, '0xD30000'],  [0.4, '0xFF1700'],  [0.5, '0xFF5B00'],  [0.6, '0xFF9E00'],  [0.7, '0xFFE100'],  [0.8, '0xFFFF37'],  [0.9, '0xFFFF9B'],  [1.0, '0xFFFFFF']  ],
	"afmhot":	[ [0.0, '0x000000'],  [0.1, '0x330000'],  [0.2, '0x660000'],  [0.3, '0x991900'],  [0.4, '0xCC4C00'],  [0.5, '0xFF8000'],  [0.6, '0xFFB333'],  [0.7, '0xFFE666'],  [0.8, '0xFFFF99'],  [0.9, '0xFFFFCC'],  [1.0, '0xFFFFFF']  ],
	"gist_heat":	[ [0.0, '0x000000'],  [0.1, '0x260000'],  [0.2, '0x4C0000'],  [0.3, '0x730000'],  [0.4, '0x990000'],  [0.5, '0xC00000'],  [0.6, '0xE63300'],  [0.7, '0xFF6600'],  [0.8, '0xFF9933'],  [0.9, '0xFFCC99'],  [1.0, '0xFFFFFF']  ],
	"copper":	[ [0.0, '0x000000'],  [0.1, '0x1F140D'],  [0.2, '0x3F2819'],  [0.3, '0x5E3C26'],  [0.4, '0x7E5033'],  [0.5, '0x9E6440'],  [0.6, '0xBD784C'],  [0.7, '0xDD8C59'],  [0.8, '0xFC9F66'],  [0.9, '0xFFB372'],  [1.0, '0xFFC77F']  ],
	"PiYG":	[ [0.0, '0x8E0152'],  [0.1, '0xC51B7D'],  [0.2, '0xDE77AE'],  [0.3, '0xF1B6DA'],  [0.4, '0xFDE0EF'],  [0.5, '0xF7F7F7'],  [0.6, '0xE6F5CF'],  [0.7, '0xB8E186'],  [0.8, '0x7FBC41'],  [0.9, '0x4D9221'],  [1.0, '0x276419']  ],
	"PRGn":	[ [0.0, '0x40004B'],  [0.1, '0x762A83'],  [0.2, '0x9970AB'],  [0.3, '0xC2A5CF'],  [0.4, '0xE7D4E8'],  [0.5, '0xF7F7F7'],  [0.6, '0xD9F0D3'],  [0.7, '0xA6DBA0'],  [0.8, '0x5AAE61'],  [0.9, '0x1B7837'],  [1.0, '0x00441B']  ],
	"BrBG":	[ [0.0, '0x543005'],  [0.1, '0x8C510A'],  [0.2, '0xBF812D'],  [0.3, '0xDFC27D'],  [0.4, '0xF6E8C2'],  [0.5, '0xF5F5F5'],  [0.6, '0xC6EAE5'],  [0.7, '0x80CDC1'],  [0.8, '0x35978F'],  [0.9, '0x01665E'],  [1.0, '0x003C30']  ],
	"PuOr":	[ [0.0, '0x7F3B08'],  [0.1, '0xB35806'],  [0.2, '0xE08214'],  [0.3, '0xFDB863'],  [0.4, '0xFEE0B5'],  [0.5, '0xF7F7F7'],  [0.6, '0xD8DAEB'],  [0.7, '0xB2ABD2'],  [0.8, '0x8073AC'],  [0.9, '0x542788'],  [1.0, '0x2D004B']  ],
	"RdGy":	[ [0.0, '0x67001F'],  [0.1, '0xB2182B'],  [0.2, '0xD6604D'],  [0.3, '0xF4A582'],  [0.4, '0xFDDBC6'],  [0.5, '0xFFFFFF'],  [0.6, '0xE0E0E0'],  [0.7, '0xBABABA'],  [0.8, '0x878787'],  [0.9, '0x4D4D4D'],  [1.0, '0x1A1A1A']  ],
	"RdBu":	[ [0.0, '0x67001F'],  [0.1, '0xB2182B'],  [0.2, '0xD6604D'],  [0.3, '0xF4A582'],  [0.4, '0xFDDBC6'],  [0.5, '0xF7F7F7'],  [0.6, '0xD1E5F0'],  [0.7, '0x92C5DE'],  [0.8, '0x4393C3'],  [0.9, '0x2166AC'],  [1.0, '0x053061']  ],
	"RdYlBu":	[ [0.0, '0xA50026'],  [0.1, '0xD73027'],  [0.2, '0xF46D43'],  [0.3, '0xFDAE61'],  [0.4, '0xFEE090'],  [0.5, '0xFFFFC0'],  [0.6, '0xE0F3F8'],  [0.7, '0xABD9E9'],  [0.8, '0x74ADD1'],  [0.9, '0x4575B4'],  [1.0, '0x313695']  ],
	"RdYlGn":	[ [0.0, '0xA50026'],  [0.1, '0xD73027'],  [0.2, '0xF46D43'],  [0.3, '0xFDAE61'],  [0.4, '0xFEE08B'],  [0.5, '0xFFFFBE'],  [0.6, '0xD9EF8B'],  [0.7, '0xA6D96A'],  [0.8, '0x66BD63'],  [0.9, '0x1A9850'],  [1.0, '0x006837']  ],
	"Spectral":	[ [0.0, '0x9E0142'],  [0.1, '0xD53E4F'],  [0.2, '0xF46D43'],  [0.3, '0xFDAE61'],  [0.4, '0xFEE08B'],  [0.5, '0xFFFFBF'],  [0.6, '0xE6F598'],  [0.7, '0xABDDA4'],  [0.8, '0x66C2A5'],  [0.9, '0x3288BD'],  [1.0, '0x5E4FA2']  ],
	"coolwarm":	[ [0.0, '0x3B4CC0'],  [0.1, '0x5977E3'],  [0.2, '0x7B9EF9'],  [0.3, '0x9EBEFF'],  [0.4, '0xC0D4F5'],  [0.5, '0xDDDDDC'],  [0.6, '0xF2CAB7'],  [0.7, '0xF7AC8E'],  [0.8, '0xEE8468'],  [0.9, '0xD75344'],  [1.0, '0xB40426']  ],
	"bwr":	[ [0.0, '0x0000FF'],  [0.1, '0x3333FF'],  [0.2, '0x6666FF'],  [0.3, '0x9999FF'],  [0.4, '0xCCCCFF'],  [0.5, '0xFFFFFF'],  [0.6, '0xFFCCCC'],  [0.7, '0xFF9999'],  [0.8, '0xFF6666'],  [0.9, '0xFF3333'],  [1.0, '0xFF0000']  ],
	"seismic":	[ [0.0, '0x00004C'],  [0.1, '0x000094'],  [0.2, '0x0000DB'],  [0.3, '0x3232FF'],  [0.4, '0x9898FF'],  [0.5, '0xFFFEFE'],  [0.6, '0xFF9898'],  [0.7, '0xFF3232'],  [0.8, '0xE50000'],  [0.9, '0xB20000'],  [1.0, '0x800000']  ],
	"hsv":	[ [0.0, '0xFF0000'],  [0.1, '0xFF9600'],  [0.2, '0xD1FF00'],  [0.3, '0x3BFF00'],  [0.4, '0x00FF5B'],  [0.5, '0x00FFF5'],  [0.6, '0x0073FF'],  [0.7, '0x2300FF'],  [0.8, '0xB900FF'],  [0.9, '0xFF00AE'],  [1.0, '0xFF0018']  ],
	"Pastel1":	[ [0.0, '0xFBB4AE'],  [0.1, '0xFBB4AE'],  [0.2, '0xB3CDE3'],  [0.3, '0xCCEBC5'],  [0.4, '0xDECBE4'],  [0.5, '0xFED9A6'],  [0.6, '0xFFFFCC'],  [0.7, '0xE5D8BD'],  [0.8, '0xFDDAEC'],  [0.9, '0xF2F2F2'],  [1.0, '0xF2F2F2']  ],
	"Pastel2":	[ [0.0, '0xB3E2CD'],  [0.1, '0xB3E2CD'],  [0.2, '0xFDCDAC'],  [0.3, '0xCBD5E8'],  [0.4, '0xF4CAE4'],  [0.5, '0xE6F5C9'],  [0.6, '0xE6F5C9'],  [0.7, '0xFFF2AE'],  [0.8, '0xF1E2CC'],  [0.9, '0xCCCCCC'],  [1.0, '0xCCCCCC']  ],
	"Paired":	[ [0.0, '0xA6CEE3'],  [0.1, '0x1F78B4'],  [0.2, '0xB2DF8A'],  [0.3, '0x33A02C'],  [0.4, '0xFB9A99'],  [0.5, '0xFDBF6F'],  [0.6, '0xFF7F00'],  [0.7, '0xCAB2D6'],  [0.8, '0x6A3D9A'],  [0.9, '0xFFFF99'],  [1.0, '0xB15928']  ],
	"Accent":	[ [0.0, '0x7FC97F'],  [0.1, '0x7FC97F'],  [0.2, '0xBEAED4'],  [0.3, '0xFDC086'],  [0.4, '0xFFFF99'],  [0.5, '0x386CB0'],  [0.6, '0x386CB0'],  [0.7, '0xF0027F'],  [0.8, '0xBF5B17'],  [0.9, '0x666666'],  [1.0, '0x666666']  ],
	"Dark2":	[ [0.0, '0x1B9E77'],  [0.1, '0x1B9E77'],  [0.2, '0xD95F02'],  [0.3, '0x7570B3'],  [0.4, '0xE7298A'],  [0.5, '0x66A61E'],  [0.6, '0x66A61E'],  [0.7, '0xE6AB02'],  [0.8, '0xA6761D'],  [0.9, '0x666666'],  [1.0, '0x666666']  ],
	"Set1":	[ [0.0, '0xE41A1C'],  [0.1, '0xE41A1C'],  [0.2, '0x377EB8'],  [0.3, '0x4DAF4A'],  [0.4, '0x984EA3'],  [0.5, '0xFF7F00'],  [0.6, '0xFFFF33'],  [0.7, '0xA65628'],  [0.8, '0xF781BF'],  [0.9, '0x999999'],  [1.0, '0x999999']  ],
	"Set2":	[ [0.0, '0x66C2A5'],  [0.1, '0x66C2A5'],  [0.2, '0xFC8D62'],  [0.3, '0x8DA0CB'],  [0.4, '0xE78AC3'],  [0.5, '0xA6D854'],  [0.6, '0xA6D854'],  [0.7, '0xFFD92F'],  [0.8, '0xE5C494'],  [0.9, '0xB3B3B3'],  [1.0, '0xB3B3B3']  ],
	"Set3":	[ [0.0, '0x8DD3C7'],  [0.1, '0xFFFFB3'],  [0.2, '0xBEBADA'],  [0.3, '0xFB8072'],  [0.4, '0x80B1D3'],  [0.5, '0xB3DE69'],  [0.6, '0xFCCDE5'],  [0.7, '0xD9D9D9'],  [0.8, '0xBC80BD'],  [0.9, '0xCCEBC5'],  [1.0, '0xFFED6F']  ],
	"tab10":	[ [0.0, '0x1F77B4'],  [0.1, '0x1F77B4'],  [0.2, '0xFF7F0E'],  [0.3, '0x2CA02C'],  [0.4, '0xD62728'],  [0.5, '0x8C564B'],  [0.6, '0xE377C2'],  [0.7, '0x7F7F7F'],  [0.8, '0xBCBD22'],  [0.9, '0x17BECF'],  [1.0, '0x17BECF']  ],
	"tab20":	[ [0.0, '0x1F77B4'],  [0.1, '0xAEC7E8'],  [0.2, '0xFFBB78'],  [0.3, '0x98DF8A'],  [0.4, '0xFF9896'],  [0.5, '0x8C564B'],  [0.6, '0xE377C2'],  [0.7, '0x7F7F7F'],  [0.8, '0xBCBD22'],  [0.9, '0x17BECF'],  [1.0, '0x9EDAE5']  ],
	"tab20b":	[ [0.0, '0x393B79'],  [0.1, '0x5254A3'],  [0.2, '0x9C9EDE'],  [0.3, '0x8CA252'],  [0.4, '0xCEDB9C'],  [0.5, '0xE7BA52'],  [0.6, '0x843C39'],  [0.7, '0xD6616B'],  [0.8, '0x7B4173'],  [0.9, '0xCE6DBD'],  [1.0, '0xDE9ED6']  ],
	"tab20c":	[ [0.0, '0x3182BD'],  [0.1, '0x6BAED6'],  [0.2, '0xC6DBEF'],  [0.3, '0xFD8D3C'],  [0.4, '0xFDD0A2'],  [0.5, '0xA1D99B'],  [0.6, '0x756BB1'],  [0.7, '0xBCBDDC'],  [0.8, '0x636363'],  [0.9, '0xBDBDBD'],  [1.0, '0xD9D9D9']  ],
	"flag":	[ [0.0, '0xFF0000'],  [0.1, '0x0000BE'],  [0.2, '0xFFC896'],  [0.3, '0x000018'],  [0.4, '0xE3F8FF'],  [0.5, '0x920000'],  [0.6, '0x1C3CFF'],  [0.7, '0xFF3618'],  [0.8, '0x000096'],  [0.9, '0xFFE5BE'],  [1.0, '0x000000']  ],
	"prism":	[ [0.0, '0xFF0000'],  [0.1, '0xFF0000'],  [0.2, '0xFF2600'],  [0.3, '0xFF5900'],  [0.4, '0xFF8C00'],  [0.5, '0xFFCE00'],  [0.6, '0xFFF100'],  [0.7, '0xEAFF00'],  [0.8, '0xB8FF00'],  [0.9, '0x85FF00'],  [1.0, '0x54FF00']  ],
	"ocean":	[ [0.0, '0x008000'],  [0.1, '0x005919'],  [0.2, '0x003333'],  [0.3, '0x000D4C'],  [0.4, '0x001966'],  [0.5, '0x004080'],  [0.6, '0x006699'],  [0.7, '0x1A8CB3'],  [0.8, '0x66B3CC'],  [0.9, '0xB3D9E6'],  [1.0, '0xFFFFFF']  ],
	"gist_earth":	[ [0.0, '0x000000'],  [0.1, '0x112A77'],  [0.2, '0x225E7C'],  [0.3, '0x32837A'],  [0.4, '0x3E915B'],  [0.5, '0x5DA04B'],  [0.6, '0x8EAC56'],  [0.7, '0xB7B65E'],  [0.8, '0xC4A46F'],  [0.9, '0xE1BFAE'],  [1.0, '0xFDFBFB']  ],
	"terrain":	[ [0.0, '0x333399'],  [0.1, '0x1177DD'],  [0.2, '0x00B2B3'],  [0.3, '0x32D670'],  [0.4, '0x98EA84'],  [0.5, '0xFFFE99'],  [0.6, '0xCCBD7D'],  [0.7, '0x997C62'],  [0.8, '0x997D77'],  [0.9, '0xCCBEBB'],  [1.0, '0xFFFFFF']  ],
	"gist_stern":	[ [0.0, '0x000000'],  [0.1, '0xC61933'],  [0.2, '0x473366'],  [0.3, '0x4C4C99'],  [0.4, '0x6666CC'],  [0.5, '0x8080FE'],  [0.6, '0x999992'],  [0.7, '0xB3B325'],  [0.8, '0xCCCC3F'],  [0.9, '0xE6E69F'],  [1.0, '0xFFFFFF']  ],
	"gnuplot":	[ [0.0, '0x000000'],  [0.1, '0x510096'],  [0.2, '0x7202F2'],  [0.3, '0x8C07F3'],  [0.4, '0xA11097'],  [0.5, '0xB42000'],  [0.6, '0xC63700'],  [0.7, '0xD55800'],  [0.8, '0xE48300'],  [0.9, '0xF2BA00'],  [1.0, '0xFFFF00']  ],
	"gnuplot2":	[ [0.0, '0x000000'],  [0.1, '0x000066'],  [0.2, '0x0000CC'],  [0.3, '0x2700FF'],  [0.4, '0x7700FF'],  [0.5, '0xC829D6'],  [0.6, '0xFF5CA3'],  [0.7, '0xFF8F70'],  [0.8, '0xFFC23D'],  [0.9, '0xFFF50A'],  [1.0, '0xFFFFFF']  ],
	"CMRmap":	[ [0.0, '0x000000'],  [0.1, '0x1F1F66'],  [0.2, '0x3D26A6'],  [0.3, '0x6B2BA6'],  [0.4, '0xAD356E'],  [0.5, '0xFF4026'],  [0.6, '0xEA7307'],  [0.7, '0xE6A60F'],  [0.8, '0xE6CF43'],  [0.9, '0xEBEB99'],  [1.0, '0xFFFFFF']  ],
	"cubehelix":	[ [0.0, '0x000000'],  [0.1, '0x1A1530'],  [0.2, '0x163D4E'],  [0.3, '0x1E6642'],  [0.4, '0x53792F'],  [0.5, '0xA1794A'],  [0.6, '0xD07E93'],  [0.7, '0xCF9DDA'],  [0.8, '0xC1CAF3'],  [0.9, '0xD2EEEF'],  [1.0, '0xFFFFFF']  ],
	"brg":	[ [0.0, '0x0000FF'],  [0.1, '0x3300CC'],  [0.2, '0x660099'],  [0.3, '0x990066'],  [0.4, '0xCC0033'],  [0.5, '0xFF0000'],  [0.6, '0xCC3300'],  [0.7, '0x996600'],  [0.8, '0x669900'],  [0.9, '0x33CC00'],  [1.0, '0x00FF00']  ],
	"gist_rainbow":	[ [0.0, '0xFF0029'],  [0.1, '0xFF6000'],  [0.2, '0xFFEA00'],  [0.3, '0x8BFF00'],  [0.4, '0x01FF00'],  [0.5, '0x00FF8A'],  [0.6, '0x00EBFF'],  [0.7, '0x0060FF'],  [0.8, '0x2A00FF'],  [0.9, '0xB400FF'],  [1.0, '0xFF00BF']  ],
	"rainbow2":	[ [0.0, '0x8000FF'],  [0.1, '0x4D4FFC'],  [0.2, '0x1A96F3'],  [0.3, '0x19CEE3'],  [0.4, '0x4CF2CE'],  [0.5, '0x80FFB4'],  [0.6, '0xB3F296'],  [0.7, '0xE6CE74'],  [0.8, '0xFF964F'],  [0.9, '0xFF4F28'],  [1.0, '0xFF0000']  ],
	"jet":	[ [0.0, '0x000080'],  [0.1, '0x0000F3'],  [0.2, '0x004CFF'],  [0.3, '0x00B2FF'],  [0.4, '0x28FFCE'],  [0.5, '0x7CFF7B'],  [0.6, '0xCEFF28'],  [0.7, '0xFFC600'],  [0.8, '0xFF6800'],  [0.9, '0xF30900'],  [1.0, '0x800000']  ],
	"nipy_spectral":	[ [0.0, '0x000000'],  [0.1, '0x880099'],  [0.2, '0x0000DD'],  [0.3, '0x0099DD'],  [0.4, '0x00AA89'],  [0.5, '0x00BC00'],  [0.6, '0x03FF00'],  [0.7, '0xEEEE00'],  [0.8, '0xFF9800'],  [0.9, '0xDD0000'],  [1.0, '0xCCCCCC']  ],
	"gist_ncar":	[ [0.0, '0x000080'],  [0.1, '0x000BD5'],  [0.2, '0x00EDFF'],  [0.3, '0x00FD3B'],  [0.4, '0x73E800'],  [0.5, '0xD9FF21'],  [0.6, '0xFFCD06'],  [0.7, '0xFF3600'],  [0.8, '0xF107FF'],  [0.9, '0xEC82EF'],  [1.0, '0xFEF8FE']  ]

};
