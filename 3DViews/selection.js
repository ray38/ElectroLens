import {unhighlightAll, unhighlightHeatmapPoints,highlightVia2DHeatmap,unhighlightVia2DHeatmap,clickUpdateAll2DHeatmaps, clickUpdateVia2DHeatmap } from "../2DHeatmaps/selection.js";


function getCorrespondingHeatmapPointIndexSpatiallyResolved(view, voxelIndex, twoDPlot){
    var options = view.options;
	var currentFrame = options.currentFrame.toString();
    var spatiallyResolvedData = view.systemSpatiallyResolvedDataFramed[currentFrame];
    
    var xScale = twoDPlot.xScale , yScale =  twoDPlot.yScale;
    var xValue = twoDPlot.xValue , yValue =  twoDPlot.yValue;
    var highlightDataPoint = spatiallyResolvedData[voxelIndex];

    var xMap = function(d) {return xScale(xValue(d));};
    var yMap = function(d) {return yScale(yValue(d));}; 

    var heatmapX = xMap(highlightDataPoint);
    var heatmapY = yMap(highlightDataPoint);
    
    var heatmapPointIndex = twoDPlot.XYtoHeatmapMap[heatmapX][heatmapY];
    return heatmapPointIndex
}

export function hover3DViewSpatiallyResolved(view, plotSetup, mouseEvent){
    var options = view.options;
	var currentFrame = options.currentFrame.toString();
    var spatiallyResolvedData = view.systemSpatiallyResolvedDataFramed[currentFrame];

	var mouse = new THREE.Vector2();
	mouse.set(	(((mouseEvent.clientX-view.windowLeft)/(view.windowWidth)) * 2 - 1),
				(-((mouseEvent.clientY-view.windowTop)/(view.windowHeight)) * 2 + 1));
	
	view.raycaster.params.Points.threshold = view.options.pointCloudSize / 4;
	view.raycaster.setFromCamera( mouse.clone(), view.camera );
    var intersects = view.raycaster.intersectObject( view.System );
    var pointVoxelMap = view.System.userData.pointVoxelMap ;
	if ( intersects.length > 0 ) {
        // console.log('has intersection', view.INTERSECTED,intersects[ 0 ].index )
        // if there is intersection
        if ( view.INTERSECTED != intersects[ 0 ].index ) {
            // console.log('changed intersection, deal with previously hovered points')
            // changed intersection, deal with previously hovered points
            if (view.INTERSECTED != null ){
                var indexIn3DView = pointVoxelMap[view.INTERSECTED]
                // console.log('if there is previous intersection', indexIn3DView)
                // if there is previous intersection
                
                if (plotSetup.active2DPlotSpatiallyResolved && 
                    plotSetup.active2DPlotSpatiallyResolved.options.plotData == 'spatiallyResolvedData' && 
                    plotSetup.active2DPlotSpatiallyResolved.heatmapPlot) {
                    // console.log('if there is active 2D plot, get the corresponding heatmap point on the 2D plot, and handle it there')
                    // if there is active 2D plot, get the corresponding heatmap point on the 2D plot, and handle it there
                    var twoDPlot = plotSetup.active2DPlotSpatiallyResolved;
                    var heatmapPointIndex = getCorrespondingHeatmapPointIndexSpatiallyResolved(view,indexIn3DView, twoDPlot);
                    unhighlightVia2DHeatmap(heatmapPointIndex, twoDPlot);
                    
                } else {
                    // console.log('no active 2Dplot, return to previous 3D view state')
                    // no active 2Dplot, return to previous 3D view state
                    spatiallyResolvedData[indexIn3DView].highlighted = view.intersectState ;  
                    view.intersectState = null;
                }
            } else {
                // console.log('no previous intersection, do nothing here')
                // no previous intersection, do nothing here
            }

            view.INTERSECTED = intersects[ 0 ].index;
            var indexIn3DView = pointVoxelMap[view.INTERSECTED]
            // console.log('deal with currently intersected points', indexIn3DView)
            // deal with currently intersected points
            
            if (plotSetup.active2DPlotSpatiallyResolved && 
                plotSetup.active2DPlotSpatiallyResolved.options.plotData == 'spatiallyResolvedData' && 
                plotSetup.active2DPlotSpatiallyResolved.heatmapPlot) {
                // console.log('if there is active 2D plot, get the corresponding heatmap point on the 2D plot, and handle it there')
                // if there is active 2D plot, get the corresponding heatmap point on the 2D plot, and handle it there
                var twoDPlot = plotSetup.active2DPlotSpatiallyResolved;
                heatmapPointIndex = getCorrespondingHeatmapPointIndexSpatiallyResolved(view,indexIn3DView, twoDPlot);
                highlightVia2DHeatmap(heatmapPointIndex, twoDPlot);
            } else {
                // console.log('if there is no active 2D plot, store current state, and highlight the voxel')
                // if there is no active 2D plot, store current state, and highlight the voxel
                view.intersectState = spatiallyResolvedData[indexIn3DView].highlighted; 
                spatiallyResolvedData[indexIn3DView].highlighted = true;  
            }
            return true;

        } else {
            // console.log('same intersection, do nothing')
            //same intersection, do nothing
            return false;
        }

    
	}
	else {
        // console.log('no current intersection ', view.INTERSECTED)
        // no current intersection 
		if (view.INTERSECTED != null ){
            var indexIn3DView = pointVoxelMap[view.INTERSECTED]
            //console.log('if there is previous intersection ', indexIn3DView)
            // if there is previous intersection
            
            if (plotSetup.active2DPlotSpatiallyResolved && 
                plotSetup.active2DPlotSpatiallyResolved.options.plotData == 'spatiallyResolvedData' && 
                plotSetup.active2DPlotSpatiallyResolved.heatmapPlot) {
                // console.log('if there is active 2D plot, get the corresponding heatmap point on the 2D plot, and handle it there')
                // if there is active 2D plot, get the corresponding heatmap point on the 2D plot, and handle it there
                var twoDPlot = plotSetup.active2DPlotSpatiallyResolved;
                var heatmapPointIndex = getCorrespondingHeatmapPointIndexSpatiallyResolved(view,indexIn3DView, twoDPlot);
                unhighlightVia2DHeatmap(heatmapPointIndex, twoDPlot);
                
            } else {
                // console.log('no active 2Dplot, return to previous 3D view state')
                // no active 2Dplot, return to previous 3D view state
                spatiallyResolvedData[indexIn3DView].highlighted = view.intersectState ;  
                view.intersectState = null;
            }
            view.INTERSECTED = null;
            return true;
        } else {
            // console.log('no previous intersection, do nothing')
            // no previous intersection, do nothing
            view.INTERSECTED = null;
            return false;
        }
		
	}

}




export function click3DViewSpatiallyResolved(view, views, plotSetup){
    var options = view.options;
	var currentFrame = options.currentFrame.toString();
	var spatiallyResolvedData = view.systemSpatiallyResolvedDataFramed[currentFrame];
    var pointVoxelMap = view.System.userData.pointVoxelMap ;
	if (view.INTERSECTED != null){
        //currently point under mouse
        var indexIn3DView = pointVoxelMap[view.INTERSECTED]
        if (plotSetup.active2DPlotSpatiallyResolved && 
            plotSetup.active2DPlotSpatiallyResolved.options.plotData == 'spatiallyResolvedData' && 
            plotSetup.active2DPlotSpatiallyResolved.heatmapPlot) {
            // has active 2D plot, handle it there
            var twoDPlot = plotSetup.active2DPlotSpatiallyResolved;
            var heatmapPointIndex = getCorrespondingHeatmapPointIndexSpatiallyResolved(view,indexIn3DView, twoDPlot);
            clickUpdateVia2DHeatmap(heatmapPointIndex, twoDPlot, views);
            return true
            
        } else {
            // no active 2D plot
            // var highlightDataPoint = spatiallyResolvedData[indexIn3DView];
            // highlightDataPoint.highlighted = true;
            if (view.intersectState == true) {
                // if previously highlighted
                view.intersectState = false;
            } else {
                // if previously not highlighted
                view.intersectState = true;
            }
            // view.intersectState = spatiallyResolvedData[indexIn3DView].highlighted; 
            clickUpdateAll2DHeatmaps(views);
            return true;
        }


		
	} else {
        // no point intersected, unhighlight all
        unhighlightAll(views);
        return true;
	}
}




//Molecule

export function gpuPickMolecule(view, renderer, scene,mouseEvent, windowWidth, windowHeight) {
    var camera = view.camera;
    var pickingTexture = new THREE.WebGLRenderTarget(1, 1, { type: THREE.FloatType} );
    var pixelBuffer = new Float32Array(4);
        
    var width  = Math.floor( windowWidth  * view.width );
    var height = Math.floor( windowHeight * view.height );
    var left   = Math.floor( windowWidth  * view.left );
    var top    = Math.floor( windowHeight * view.top);


    // camera.setViewOffset(renderer.domElement.width, renderer.domElement.height,
    //     mouseEvent.clientX * window.devicePixelRatio | 0,  mouseEvent.clientY * window.devicePixelRatio | 0, 1, 1 );
    camera.setViewOffset(width, height,
        mouseEvent.clientX * window.devicePixelRatio | 0,  mouseEvent.clientY * window.devicePixelRatio | 0, 1, 1 );
    camera.updateProjectionMatrix();
    renderer.setRenderTarget(pickingTexture);

    renderer.setViewport( left, top, width, height );
    renderer.setScissor( left, top, width, height );

    renderer.setScissorTest( true );
    camera.aspect = width / height;
    camera.updateProjectionMatrix();
    
    renderer.render(scene, camera);

    renderer.readRenderTargetPixels(pickingTexture, 0, 0, 1, 1, pixelBuffer);
    const pickingResult = parsePixelBuffer(pixelBuffer);
    // console.log(pickingResult);

    camera.clearViewOffset();
    camera.updateProjectionMatrix();
    renderer.setRenderTarget(null);
    return pickingResult;
}

function parsePixelBuffer(pixelBuffer) {

    let encodedClass = null;
    let encodedID = null;
    let encodedID1 = null;
    let encodedID2 = null;
    let encodedID3 = null;
    // console.log(pixelBuffer);

    const rChannelInfo = Math.round(pixelBuffer[0] * 1e8);
    const gChannelInfo = Math.round(pixelBuffer[1] * 1e8);
    const bChannelInfo = Math.round(pixelBuffer[2] * 1e8);

    if (Math.abs(rChannelInfo % 100 - 50) <= 8 &&
        Math.abs(gChannelInfo % 100 - 50) <= 8 &&
        Math.abs(bChannelInfo % 100 - 50) <= 8) {
        encodedClass = Math.floor((rChannelInfo % 1000000) * 0.00001);
        encodedID1 = Math.floor((rChannelInfo % 100000) * 0.01);
        encodedID2 = Math.floor((gChannelInfo % 1000000) * 0.01);
        encodedID3 = Math.floor((bChannelInfo % 1000000) * 0.01);
        encodedID = Math.floor(encodedID1 * 100000000 + encodedID2 * 10000 + encodedID3);
    }
    return {encodedClass, encodedID};
}

function getCorrespondingHeatmapPointIndexMolecule(view, voxelIndex, twoDPlot){
    var options = view.options;
	var currentFrame = options.currentFrame.toString();
    var moleculeData = view.systemMoleculeDataFramed[currentFrame];
    
    var xScale = twoDPlot.xScale , yScale =  twoDPlot.yScale;
    var xValue = twoDPlot.xValue , yValue =  twoDPlot.yValue;
    var highlightDataPoint = moleculeData[voxelIndex];

    var xMap = function(d) {return xScale(xValue(d));};
    var yMap = function(d) {return yScale(yValue(d));}; 

    var heatmapX = xMap(highlightDataPoint);
    var heatmapY = yMap(highlightDataPoint);
    
    var heatmapPointIndex = twoDPlot.XYtoHeatmapMap[heatmapX][heatmapY];
    return heatmapPointIndex
}



export function hover3DViewMoleculeBall(view, plotSetup, pickingResult){
    var options = view.options;
	var currentFrame = options.currentFrame.toString();
    var moleculeData = view.systemMoleculeDataFramed[currentFrame];
    var intersectClass = pickingResult.encodedClass;

    if (intersectClass && intersectClass == 1) {
        var intersectIndex = pickingResult.encodedID;
        // console.log('has intersection', view.INTERSECTED,intersects[ 0 ].index )
        // if there is intersection
        if ( view.INTERSECTED != intersectIndex ) {
            // console.log('changed intersection, deal with previously hovered points')
            // changed intersection, deal with previously hovered points
            if (view.INTERSECTED != null ){
                // var indexIn3DView = pointVoxelMap[view.INTERSECTED]
                var indexIn3DView = view.INTERSECTED;
                // console.log('if there is previous intersection', indexIn3DView)
                // if there is previous intersection
                
                if (plotSetup.active2DPlotMolecule && 
                    plotSetup.active2DPlotMolecule.options.plotData == 'moleculeData' && 
                    plotSetup.active2DPlotMolecule.heatmapPlot) {
                    // console.log('if there is active 2D plot, get the corresponding heatmap point on the 2D plot, and handle it there')
                    // if there is active 2D plot, get the corresponding heatmap point on the 2D plot, and handle it there
                    var twoDPlot = plotSetup.active2DPlotMolecule;
                    var heatmapPointIndex = getCorrespondingHeatmapPointIndexMolecule(view,indexIn3DView, twoDPlot);
                    unhighlightVia2DHeatmap(heatmapPointIndex, twoDPlot);
                    
                } else {
                    // console.log('changing atom, no active 2Dplot, return to previous 3D view state (current, to set)', moleculeData[indexIn3DView].highlighted, view.intersectState)
                    // no active 2Dplot, return to previous 3D view state
                    moleculeData[indexIn3DView].highlighted = view.intersectState ; 
                    view.intersectState = null;
                }
            } else {
                // console.log('no previous intersection, do nothing here')
                // no previous intersection, do nothing here
            }
            // console.log('updating intersect index', view.INTERSECTED)

            view.INTERSECTED = intersectIndex;
            
            var indexIn3DView = intersectIndex;
            // console.log('deal with currently intersected points', indexIn3DView)
            // deal with currently intersected points
            
            if (plotSetup.active2DPlotMolecule && 
                plotSetup.active2DPlotMolecule.options.plotData == 'moleculeData' && 
                plotSetup.active2DPlotMolecule.heatmapPlot) {
                // console.log('if there is active 2D plot, get the corresponding heatmap point on the 2D plot, and handle it there')
                // if there is active 2D plot, get the corresponding heatmap point on the 2D plot, and handle it there
                var twoDPlot = plotSetup.active2DPlotMolecule;
                heatmapPointIndex = getCorrespondingHeatmapPointIndexMolecule(view,indexIn3DView, twoDPlot);
                highlightVia2DHeatmap(heatmapPointIndex, twoDPlot);
            } else {
                // console.log('if there is no active 2D plot, store current state, and highlight the atom', moleculeData[indexIn3DView].highlighted)
                // if there is no active 2D plot, store current state, and highlight the voxel
                view.intersectState = moleculeData[indexIn3DView].highlighted; 
                moleculeData[indexIn3DView].highlighted = true;  
            }
            return true;

        } else {
            // console.log('same intersection, do nothing')
            //same intersection, do nothing
            return false;
        }

    
	}
	else {
        // console.log('no current intersection ', view.INTERSECTED)
        // no current intersection 
		if (view.INTERSECTED != null ){
            // var indexIn3DView = pointVoxelMap[view.INTERSECTED]

            var indexIn3DView = view.INTERSECTED ;
            //console.log('if there is previous intersection ', indexIn3DView)
            // if there is previous intersection
            
            if (plotSetup.active2DPlotMolecule && 
                plotSetup.active2DPlotMolecule.options.plotData == 'moleculeData' && 
                plotSetup.active2DPlotMolecule.heatmapPlot) {
                // console.log('if there is active 2D plot, get the corresponding heatmap point on the 2D plot, and handle it there')
                // if there is active 2D plot, get the corresponding heatmap point on the 2D plot, and handle it there
                var twoDPlot = plotSetup.active2DPlotMolecule;
                var heatmapPointIndex = getCorrespondingHeatmapPointIndexMolecule(view,indexIn3DView, twoDPlot);
                unhighlightVia2DHeatmap(heatmapPointIndex, twoDPlot);
                
            } else {
                // console.log('no active 2Dplot, return to previous 3D view state')
                // no active 2Dplot, return to previous 3D view state
                // console.log('no active 2Dplot, return to previous 3D view state', moleculeData[indexIn3DView].highlighted, view.intersectState)
                moleculeData[indexIn3DView].highlighted = view.intersectState ;  
                view.intersectState = null;
            }
            view.INTERSECTED = null;
            return true;
        } else {
            // console.log('no previous intersection, do nothing')
            // no previous intersection, do nothing
            view.INTERSECTED = null;
            return false;
        }
		
	}
}




export function hover3DViewMoleculeSprite(view, plotSetup, mouseEvent){
    var options = view.options;
	var currentFrame = options.currentFrame.toString();
    var moleculeData = view.systemMoleculeDataFramed[currentFrame];

	var mouse = new THREE.Vector2();
	mouse.set(	(((mouseEvent.clientX-view.windowLeft)/(view.windowWidth)) * 2 - 1),
				(-((mouseEvent.clientY-view.windowTop)/(view.windowHeight)) * 2 + 1));
	
	view.raycaster.params.Points.threshold = view.options.pointCloudSize *3.5;
	view.raycaster.setFromCamera( mouse.clone(), view.camera );
    //var intersects = view.raycaster.intersectObject( view.System );
    var intersects = view.raycaster.intersectObject( view.molecule.atoms );
    // var pointVoxelMap = view.System.userData.pointVoxelMap ;
	if ( intersects.length > 0 ) {
        /*if (view.options.atomsStyle == "ball") {
            var intersectIndex = Math.floor(intersects[0].face.a / view.molecule.atoms.userData.numVerticesPerAtom);
        }
        else {
            var intersectIndex = intersects[ 0 ].index;
        }*/
        var intersectIndex = intersects[ 0 ].index;
        // console.log('has intersection', view.INTERSECTED,intersects[ 0 ].index )
        // if there is intersection
        if ( view.INTERSECTED != intersectIndex ) {
            // console.log('changed intersection, deal with previously hovered points')
            // changed intersection, deal with previously hovered points
            if (view.INTERSECTED != null ){
                // var indexIn3DView = pointVoxelMap[view.INTERSECTED]
                var indexIn3DView = view.INTERSECTED;
                // console.log('if there is previous intersection', indexIn3DView)
                // if there is previous intersection
                
                if (plotSetup.active2DPlotMolecule && 
                    plotSetup.active2DPlotMolecule.options.plotData == 'moleculeData' && 
                    plotSetup.active2DPlotMolecule.heatmapPlot) {
                    // console.log('if there is active 2D plot, get the corresponding heatmap point on the 2D plot, and handle it there')
                    // if there is active 2D plot, get the corresponding heatmap point on the 2D plot, and handle it there
                    var twoDPlot = plotSetup.active2DPlotMolecule;
                    var heatmapPointIndex = getCorrespondingHeatmapPointIndexMolecule(view,indexIn3DView, twoDPlot);
                    unhighlightVia2DHeatmap(heatmapPointIndex, twoDPlot);
                    
                } else {
                    // console.log('no active 2Dplot, return to previous 3D view state')
                    // no active 2Dplot, return to previous 3D view state
                    moleculeData[indexIn3DView].highlighted = view.intersectState ;  
                    view.intersectState = null;
                }
            } else {
                // console.log('no previous intersection, do nothing here')
                // no previous intersection, do nothing here
            }

            view.INTERSECTED = intersectIndex;
            // var indexIn3DView = pointVoxelMap[view.INTERSECTED]
            var indexIn3DView = intersectIndex;
            // console.log('deal with currently intersected points', indexIn3DView)
            // deal with currently intersected points
            
            if (plotSetup.active2DPlotMolecule && 
                plotSetup.active2DPlotMolecule.options.plotData == 'moleculeData' && 
                plotSetup.active2DPlotMolecule.heatmapPlot) {
                // console.log('if there is active 2D plot, get the corresponding heatmap point on the 2D plot, and handle it there')
                // if there is active 2D plot, get the corresponding heatmap point on the 2D plot, and handle it there
                var twoDPlot = plotSetup.active2DPlotMolecule;
                heatmapPointIndex = getCorrespondingHeatmapPointIndexMolecule(view,indexIn3DView, twoDPlot);
                highlightVia2DHeatmap(heatmapPointIndex, twoDPlot);
            } else {
                // console.log('if there is no active 2D plot, store current state, and highlight the voxel')
                // if there is no active 2D plot, store current state, and highlight the voxel
                view.intersectState = moleculeData[indexIn3DView].highlighted; 
                moleculeData[indexIn3DView].highlighted = true;  
            }
            return true;

        } else {
            // console.log('same intersection, do nothing')
            //same intersection, do nothing
            return false;
        }

    
	}
	else {
        // console.log('no current intersection ', view.INTERSECTED)
        // no current intersection 
		if (view.INTERSECTED != null ){
            // var indexIn3DView = pointVoxelMap[view.INTERSECTED]

            var indexIn3DView = view.INTERSECTED ;
            //console.log('if there is previous intersection ', indexIn3DView)
            // if there is previous intersection
            
            if (plotSetup.active2DPlotMolecule && 
                plotSetup.active2DPlotMolecule.options.plotData == 'moleculeData' && 
                plotSetup.active2DPlotMolecule.heatmapPlot) {
                // console.log('if there is active 2D plot, get the corresponding heatmap point on the 2D plot, and handle it there')
                // if there is active 2D plot, get the corresponding heatmap point on the 2D plot, and handle it there
                var twoDPlot = plotSetup.active2DPlotMolecule;
                var heatmapPointIndex = getCorrespondingHeatmapPointIndexMolecule(view,indexIn3DView, twoDPlot);
                unhighlightVia2DHeatmap(heatmapPointIndex, twoDPlot);
                
            } else {
                // console.log('no active 2Dplot, return to previous 3D view state')
                // no active 2Dplot, return to previous 3D view state
                moleculeData[indexIn3DView].highlighted = view.intersectState ;  
                view.intersectState = null;
            }
            view.INTERSECTED = null;
            return true;
        } else {
            // console.log('no previous intersection, do nothing')
            // no previous intersection, do nothing
            view.INTERSECTED = null;
            return false;
        }
		
	}

}




export function click3DViewMolecule(view, views, plotSetup){
    var options = view.options;
	var currentFrame = options.currentFrame.toString();
	var moleculeData = view.systemMoleculeDataFramed[currentFrame];
    // var pointVoxelMap = view.System.userData.pointVoxelMap ;
	if (view.INTERSECTED != null){
        //currently point under mouse
        // var indexIn3DView = pointVoxelMap[view.INTERSECTED]
        var indexIn3DView = view.INTERSECTED;
        if (plotSetup.active2DPlotMolecule && 
            plotSetup.active2DPlotMolecule.options.plotData == 'moleculeData' && 
            plotSetup.active2DPlotMolecule.heatmapPlot) {
            // has active 2D plot, handle it there
            var twoDPlot = plotSetup.active2DPlotMolecule;
            var heatmapPointIndex = getCorrespondingHeatmapPointIndexMolecule(view,indexIn3DView, twoDPlot);
            clickUpdateVia2DHeatmap(heatmapPointIndex, twoDPlot, views);
            return true
            
        } else {
            // no active 2D plot
            // var highlightDataPoint = spatiallyResolvedData[indexIn3DView];
            // highlightDataPoint.highlighted = true;
            if (view.intersectState == true) {
                // if previously highlighted
                view.intersectState = false;
            } else {
                // if previously not highlighted
                view.intersectState = true;
            }
            // view.intersectState = spatiallyResolvedData[indexIn3DView].highlighted; 
            clickUpdateAll2DHeatmaps(views);
            return true;
        }


		
	} else {
        // no point intersected, unhighlight all
        unhighlightAll(views);
        return true;
	}
}
