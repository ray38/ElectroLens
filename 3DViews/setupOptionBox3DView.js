import {getPointCloudGeometry, updatePointCloudGeometry, changePointCloudGeometry} from "./PointCloud_selection.js";
export function setupOptionBox3DView(view){

	var options = view.options;
	var gui = view.gui;
	gui.width = 200;
	gui.height = 10;

	var moleculeFolder 		= gui.addFolder( 'Molecule Selection' );
	var viewFolder 			= gui.addFolder( 'View Selection' );
	var pointCloudFolder 	= gui.addFolder( 'point cloud control' );
	var sliderFolder 		= gui.addFolder( 'Slider Control' );

	/*moleculeFolder.add( options, 'moleculeName',{'CO2':'CO2', 'H2O':'H2O', 'CO':'CO', 'CH4':'CH4', 'C2H2':'C2H2', 'NCCN':'NCCN','C6H6':'C6H6','butadiene':'butadiene'}).onChange( function( value ) {
		updateOptionFilenames();
		unfilteredData = [];
		var data = d3.csv(options.dataFilename, function (d) { 
	        d.forEach(function (d,i) {
	            unfilteredData[i] = {
	                x: +d.x,
	                y: +d.y,
	                z: +d.z,
	                n: +d.rho,
	                gamma: +d.gamma,
	                epxc: +d.epxc,
			ad0p2: +d.ad0p2,
			deriv1: +d.deriv1,
			deriv2: +d.deriv2
	            }
	        })
	        changeGeometry(options)
	    });

	});		*/	
	moleculeFolder.add( options, 'moleculeName')
	.name( 'Molecule' )
	.onChange(function( value ){
		options.moleculeName = view.moleculeName;
		gui.updateDisplay();		
	});
	moleculeFolder.add( options, 'propertyOfInterest',{'n':'n','epxc':'epxc', 'gamma':'gamma','ad0p2':'ad0p2','deriv1':'deriv1','deriv2':'deriv2'})
	.name( 'Color Basis' )
	.onChange( function( value ) {
		updatePointCloudGeometry(view);
	});
	moleculeFolder.open();


/*
	viewFolder.add( options, 'view',{'pointCloud':'pointCloud', 'box':'box', 'pointMatrix':'pointMatrix'}).onChange( function( value ){
		changeGeometry(options);
		updateControlPanel(options);
	});*/

	viewFolder.add( options, 'colorMap',{'rainbow':'rainbow', 'cooltowarm':'cooltowarm', 'blackbody':'blackbody', 'grayscale':'grayscale'})
	.name( 'Color Scheme' )
	.onChange( function( value ){
		updatePointCloudGeometry(view);			
	});
	//viewFolder.add( options, 'resetCamera');
	viewFolder.open();



	pointCloudFolder.add( options, 'pointCloudParticles', 10, 20000 ).step( 10 )
	.name( 'Point Density' )
	.onChange( function( value ) {
		changePointCloudGeometry(view);
	});
	pointCloudFolder.add( options, 'pointCloudAlpha',     0, 1 ).step( 0.01 )
	.name( 'Point Opacity' )
	.onChange( function( value ) {
		updatePointCloudGeometry(view);
	});
	pointCloudFolder.add( options, 'pointCloudSize', 0, 10 ).step( 0.1 )
	.name( 'Point Size' )
	.onChange( function( value ) {
		updatePointCloudGeometry(view);
	});
	/*pointCloudFolder.add( options, 'pointCloudColorSetting', 0.1, 20.0 ).step( 0.1 ).onChange( function( value ) {
		updatePointCloudGeometry(view);
	});*/
	pointCloudFolder.open();



	sliderFolder.add( options, 'x_low', 0, 100 ).step( 1 )
	.name( 'x low' )
	.onChange( function( value ) {
		updatePointCloudGeometry(view);
		//updatePlane(options);
	});
	sliderFolder.add( options, 'x_high', 0, 100 ).step( 1 )
	.name( 'x high' )
	.onChange( function( value ) {
		updatePointCloudGeometry(view);
		//updatePlane(options);
	});
	sliderFolder.add( options, 'y_low', 0, 100  ).step( 1 )
	.name( 'y low' )
	.onChange( function( value ) {
		updatePointCloudGeometry(view);
		//updatePlane(options);
	});
	sliderFolder.add( options, 'y_high', 0, 100  ).step( 1 )
	.name( 'y high' )
	.onChange( function( value ) {
		updatePointCloudGeometry(view);
		//updatePlane(options);
	});
	sliderFolder.add( options, 'z_low', 0, 100  ).step( 1 )
	.name( 'z low' )
	.onChange( function( value ) {
		updatePointCloudGeometry(view);
		//updatePlane(options);
	});
	sliderFolder.add( options, 'z_high', 0, 100  ).step( 1 )
	.name( 'z high' )
	.onChange( function( value ) {
		updatePointCloudGeometry(view);
		//updatePlane(options);
	});

	sliderFolder.add( options,'x_slider', 0, 100  ).step( 1 ).onChange( function( value ) {
		options.x_low = value-1;
		options.x_high = value;
		updatePointCloudGeometry(view);
		//updatePlane(options);
	    gui.updateDisplay();
	});
	sliderFolder.add( options,'y_slider', 0, 100  ).step( 1 ).onChange( function( value ) {
		options.y_low = value-1;
		options.y_high = value;
		updatePointCloudGeometry(view);
		//updatePlane(options);
	    gui.updateDisplay();
	});
	sliderFolder.add( options,'z_slider', 0, 100  ).step( 1 ).onChange( function( value ) {
		options.z_low = value-1;
		options.z_high = value;
		updatePointCloudGeometry(view);
		//updatePlane(options);
	    gui.updateDisplay();
	});

	//sliderFolder.open();
	//console.log(gui);
			
}