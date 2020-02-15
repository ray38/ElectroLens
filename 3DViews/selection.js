import {unhighlightAll, unhighlightHeatmapPoints,highlightVia2DHeatmap,unhighlightVia2DHeatmap,clickUpdateAll2DHeatmaps, clickUpdateVia2DHeatmap } from "../2DHeatmaps/selection.js";

/*function highlight3DViewPointsSpatiallyResolved(index, view, plotSetup) {
	var options = view.options;
	var currentFrame = options.currentFrame.toString();
	var spatiallyResolvedData = view.systemSpatiallyResolvedDataFramed[currentFrame];

	var pointVoxelMap = view.System.userData.pointVoxelMap ;
	//var voxelGlobalIndex = view.
	// var voxelPointDict = view.System.userData.voxelPointDict;

	if (plotSetup.active2DPlotSpatiallyResolved && 
		plotSetup.active2DPlotSpatiallyResolved.options.plotData == 'spatiallyResolvedData' && 
		plotSetup.active2DPlotSpatiallyResolved.heatmapPlot) {
		var twoDPlot = plotSetup.active2DPlotSpatiallyResolved;
		// var X = twoDPlot.options.plotXSpatiallyResolvedData, Y = twoDPlot.options.plotYSpatiallyResolvedData;
		var xScale = twoDPlot.xScale , yScale =  twoDPlot.yScale;
		var xValue = twoDPlot.xValue , yValue =  twoDPlot.yValue;
		var highlightDataPoint = spatiallyResolvedData[pointVoxelMap[index]];

		var xMap = function(d) {return xScale(xValue(d));};
		var yMap = function(d) {return yScale(yValue(d));}; 

		var heatmapX = xMap(highlightDataPoint);
        var heatmapY = yMap(highlightDataPoint);

		var dataset = twoDPlot.data[heatmapX][heatmapY];
		dataset.highlighted = true;

		dataset.list.forEach(datapoint => {
			datapoint.highlighted = true;
		})
	} else {
		var highlightDataPoint = spatiallyResolvedData[pointVoxelMap[index]];
		highlightDataPoint.highlighted = true;
	}
}



function unhighlight3DViewPointsSpatiallyResolved(index, view,plotSetup) {
	var options = view.options;
	var currentFrame = options.currentFrame.toString();
	var spatiallyResolvedData = view.systemSpatiallyResolvedDataFramed[currentFrame];

	var pointVoxelMap = view.System.userData.pointVoxelMap ;
	//var voxelGlobalIndex = view.
	// var voxelPointDict = view.System.userData.voxelPointDict;

	if (plotSetup.active2DPlotSpatiallyResolved && 
		plotSetup.active2DPlotSpatiallyResolved.options.plotData == 'spatiallyResolvedData' && 
		plotSetup.active2DPlotSpatiallyResolved.heatmapPlot) {
		var twoDPlot = plotSetup.active2DPlotSpatiallyResolved;
		// var X = twoDPlot.options.plotXSpatiallyResolvedData, Y = twoDPlot.options.plotYSpatiallyResolvedData;
		var xScale = twoDPlot.xScale , yScale =  twoDPlot.yScale;
		var xValue = twoDPlot.xValue , yValue =  twoDPlot.yValue;
		var highlightDataPoint = spatiallyResolvedData[pointVoxelMap[index]];

		var xMap = function(d) {return xScale(xValue(d));};
		var yMap = function(d) {return yScale(yValue(d));}; 

		var heatmapX = xMap(highlightDataPoint);
        var heatmapY = yMap(highlightDataPoint);
        
        var heatmapPointIndex = twoDPlot.XYtoHeatmapMap[heatmapX][heatmapY];
        var indexInList = twoDPlot.highlightedIndexList.indexOf(heatmapPointIndex);

        if (indexInList == -1) {
            // not in index list
            var dataset = twoDPlot.data[heatmapX][heatmapY];
            dataset.highlighted = false;

            dataset.list.forEach(datapoint => {
                datapoint.highlighted = false;
            })
        }

		
	} else {
		var highlightDataPoint = spatiallyResolvedData[pointVoxelMap[index]];
		highlightDataPoint.highlighted = false;
	}
}

 export function hover3DViewSpatiallyResolved(view, plotSetup, mouseEvent){
	var mouse = new THREE.Vector2();
	mouse.set(	(((mouseEvent.clientX-view.windowLeft)/(view.windowWidth)) * 2 - 1),
				(-((mouseEvent.clientY-view.windowTop)/(view.windowHeight)) * 2 + 1));
	
	view.raycaster.params.Points.threshold = view.options.pointCloudSize / 4;
	console.log(view.raycaster);
	view.raycaster.setFromCamera( mouse.clone(), view.camera );
	var intersects = view.raycaster.intersectObject( view.System );
	if ( intersects.length > 0 ) {
		
		if ( view.INTERSECTED != intersects[ 0 ].index ) {
			if (view.INTERSECTED != null){
				unhighlight3DViewPointsSpatiallyResolved(view.INTERSECTED, view,plotSetup);
			}
			view.INTERSECTED = intersects[ 0 ].index;
			highlight3DViewPointsSpatiallyResolved(view.INTERSECTED, view,plotSetup);
			return true;
		}
		return false;

	}
	else {
		if (view.INTERSECTED != null){
			unhighlight3DViewPointsSpatiallyResolved(view.INTERSECTED, view,plotSetup);
			view.INTERSECTED = null;
			return true;
		} else {
			return false;
		}
		
	}

} 


export function click3DViewSpatiallyResolved(view, views, plotSetup){
    var options = view.options;
	var currentFrame = options.currentFrame.toString();
	var spatiallyResolvedData = view.systemSpatiallyResolvedDataFramed[currentFrame];

	if (view.INTERSECTED != null){
		console.log('currently heatmap point under mouse', view.highlightedIndexList)
        //currently heatmap point under mouse

        if (plotSetup.active2DPlotSpatiallyResolved && 
            plotSetup.active2DPlotSpatiallyResolved.options.plotData == 'spatiallyResolvedData' && 
            plotSetup.active2DPlotSpatiallyResolved.heatmapPlot) {
            // has active 2D plot
        
            var twoDPlot = plotSetup.active2DPlotSpatiallyResolved;
            // var X = twoDPlot.options.plotXSpatiallyResolvedData, Y = twoDPlot.options.plotYSpatiallyResolvedData;
            var xScale = twoDPlot.xScale , yScale =  twoDPlot.yScale;
            var xValue = twoDPlot.xValue , yValue =  twoDPlot.yValue;
            var highlightDataPoint = spatiallyResolvedData[pointVoxelMap[view.INTERSECTED]];

            var xMap = function(d) {return xScale(xValue(d));};
            var yMap = function(d) {return yScale(yValue(d));}; 

            var heatmapX = xMap(highlightDataPoint);
            var heatmapY = yMap(highlightDataPoint);
            
            var heatmapPointIndex = twoDPlot.XYtoHeatmapMap[heatmapX][heatmapY];
            var indexInList = twoDPlot.highlightedIndexList.indexOf(heatmapPointIndex);

            if ( indexInList > -1){
                console.log('already in list, remove from list')
                // was highlighted
                twoDPlot.highlightedIndexList.splice(indexInList, 1);

                
                return false;
            } else {
                console.log('not in list, add to list')
                // not yet highlighted
                twoDPlot.highlightedIndexList.push(heatmapPointIndex);
                return false;
            }


        } else {
            // no active 2D plot
            var highlightDataPoint = spatiallyResolvedData[pointVoxelMap[view.INTERSECTED]];
            highlightedDataPoints.highlighted = false;
            return false;
        }


		
	} else {
        console.log('currently No 3D point under mouse')
        unhighlightAll(views);
        return true;
	}
}




*/

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






/*function highlight3DViewPointsMolecule(index, view, plotSetup) {
	var options = view.options;
	var currentFrame = options.currentFrame.toString();
	var moleculeData = view.systemMoleculeDataFramed[currentFrame];


	if (plotSetup.active2DPlotMolecule && 
		plotSetup.active2DPlotMolecule.options.plotData == 'moleculeData' && 
		plotSetup.active2DPlotMolecule.heatmapPlot) {
		var twoDPlot = plotSetup.active2DPlotMolecule;
		// var X = twoDPlot.options.plotXSpatiallyResolvedData, Y = twoDPlot.options.plotYSpatiallyResolvedData;
		var xScale = twoDPlot.xScale , yScale =  twoDPlot.yScale;
		var xValue = twoDPlot.xValue , yValue =  twoDPlot.yValue;
		var highlightDataPoint = moleculeData[index];

		var xMap = function(d) {return xScale(xValue(d));};
		var yMap = function(d) {return yScale(yValue(d));}; 

		var heatmapX = xMap(highlightDataPoint);
		var heatmapY = yMap(highlightDataPoint);

		var dataset = twoDPlot.data[heatmapX][heatmapY];
		dataset.highlighted = true;

		dataset.list.forEach(datapoint => {
			datapoint.highlighted = true;
		})
	} else {
		var highlightDataPoint = moleculeData[index];
		highlightDataPoint.highlighted = true;
	}
}

function unhighlight3DViewPointsMolecule(index, view,plotSetup) {
	var options = view.options;
	var currentFrame = options.currentFrame.toString();
	var moleculeData = view.systemMoleculeDataFramed[currentFrame];


	if (plotSetup.active2DPlotMolecule && 
		plotSetup.active2DPlotMolecule.options.plotData == 'moleculeData' && 
		plotSetup.active2DPlotMolecule.heatmapPlot) {
		var twoDPlot = plotSetup.active2DPlotMolecule;
		// var X = twoDPlot.options.plotXSpatiallyResolvedData, Y = twoDPlot.options.plotYSpatiallyResolvedData;
		var xScale = twoDPlot.xScale , yScale =  twoDPlot.yScale;
		var xValue = twoDPlot.xValue , yValue =  twoDPlot.yValue;
		var highlightDataPoint = moleculeData[index];

		var xMap = function(d) {return xScale(xValue(d));};
		var yMap = function(d) {return yScale(yValue(d));}; 

		var heatmapX = xMap(highlightDataPoint);
		var heatmapY = yMap(highlightDataPoint);

		var dataset = twoDPlot.data[heatmapX][heatmapY];
		dataset.highlighted = false;

		dataset.list.forEach(datapoint => {
			datapoint.highlighted = false;
		})
	} else {
		var highlightDataPoint = moleculeData[index];
		highlightDataPoint.highlighted = false;
	}
}

export function hover3DViewMolecule(view, plotSetup, mouseEvent){
	var mouse = new THREE.Vector2();
	mouse.set(	(((mouseEvent.clientX-view.windowLeft)/(view.windowWidth)) * 2 - 1),
				(-((mouseEvent.clientY-view.windowTop)/(view.windowHeight)) * 2 + 1));
	
	view.raycaster.params.Points.threshold = view.options.pointCloudSize * 3.5;
	view.raycaster.setFromCamera( mouse.clone(), view.camera );

	if (view.options.atomsStyle == "ball") {
		
		var intersects = view.raycaster.intersectObject( view.molecule.atoms );
		if ( intersects.length > 0 ) {
			var intersectIndex = Math.floor(intersects[0].face.a / view.molecule.atoms.userData.numVerticesPerAtom);
			// console.log('intersect', intersectIndex);
			if ( view.INTERSECTED != intersectIndex ) {
				if (view.INTERSECTED != null){
					unhighlight3DViewPointsMolecule(view.INTERSECTED, view,plotSetup);
				}
				view.INTERSECTED = intersectIndex;
				// console.log(intersects[0],view.molecule.atoms.userData.numVerticesPerAtom, view.INTERSECTED);
				highlight3DViewPointsMolecule(view.INTERSECTED, view,plotSetup);
				return true;
			}
			return false;
		}
		else {
			if (view.INTERSECTED != null){
				unhighlight3DViewPointsMolecule(view.INTERSECTED, view,plotSetup);
				view.INTERSECTED = null;
				return true;
			}
			return false;
		}
	}

	if (view.options.atomsStyle == "sprite") {
		var intersects = view.raycaster.intersectObject( view.molecule.atoms );
		if ( intersects.length > 0 ) {
		
			if ( view.INTERSECTED != intersects[ 0 ].index ) {
				if (view.INTERSECTED != null){
					unhighlight3DViewPointsMolecule(view.INTERSECTED, view,plotSetup);
				}
				view.INTERSECTED = intersects[ 0 ].index;
				highlight3DViewPointsMolecule(view.INTERSECTED, view,plotSetup);
				return true;
			}
			return false;
	
		}
		else {
			if (view.INTERSECTED != null){
				unhighlight3DViewPointsMolecule(view.INTERSECTED, view,plotSetup);
				view.INTERSECTED = null;
				return true;
			}
			return false
			
		}
	}
}*/

//Molecule

function gpuPickMolecule(view, renderer, scene) {
    var camera = view.camera;
    var pickingTexture = new THREE.WebGLRenderTarget(1, 1, { type: THREE.FloatType} );
    var pixelBuffer = new Float32Array(4);
        
    var width  = Math.floor( windowWidth  * view.width );
    var height = Math.floor( windowHeight * view.height );
    var left   = Math.floor( windowWidth  * view.left );
    var top    = Math.floor( windowHeight * (1-view.top) - height );


    camera.setViewOffset(renderer.domElement.width, renderer.domElement.height,
      pickingMouse.x * window.devicePixelRatio | 0,  pickingMouse.y * window.devicePixelRatio | 0, 1, 1 );
    camera.updateProjectionMatrix();
    renderer.setRenderTarget(pickingTexture);

    renderer.setViewport( left, top, width, height );
    renderer.setScissor( left, top, width, height );
    
    renderer.render(scene, camera);

    renderer.readRenderTargetPixels(pickingTexture, 0, 0, 1, 1, pixelBuffer);
    // const t0 = performance.now();
    const pickingResult = parsePixelBuffer(pixelBuffer);
    // console.log("estimated time", (performance.now() - t0) * 1920*1080);
    this.geometrySelector.parseGpuPickingResult(pickingResult);


    camera.clearViewOffset();
    camera.updateProjectionMatrix();
}

function parsePixelBuffer(pixelBuffer) {

    let encodedClass = null;
    let encodedID = null;
    let encodedID1 = null;
    let encodedID2 = null;
    let encodedID3 = null;

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

export function hover3DViewMolecule(view, plotSetup, mouseEvent){
    var options = view.options;
	var currentFrame = options.currentFrame.toString();
    var moleculeData = view.systemMoleculeDataFramed[currentFrame];

	var mouse = new THREE.Vector2();
	mouse.set(	(((mouseEvent.clientX-view.windowLeft)/(view.windowWidth)) * 2 - 1),
				(-((mouseEvent.clientY-view.windowTop)/(view.windowHeight)) * 2 + 1));
	
	view.raycaster.params.Points.threshold = view.options.pointCloudSize / 4;
	view.raycaster.setFromCamera( mouse.clone(), view.camera );
    //var intersects = view.raycaster.intersectObject( view.System );
    var intersects = view.raycaster.intersectObject( view.molecule.atoms );
    // var pointVoxelMap = view.System.userData.pointVoxelMap ;
	if ( intersects.length > 0 ) {
        if (view.options.atomsStyle == "ball") {
            var intersectIndex = Math.floor(intersects[0].face.a / view.molecule.atoms.userData.numVerticesPerAtom);
        }
        else {
            var intersectIndex = intersects[ 0 ].index;
        }
        // console.log('has intersection', view.INTERSECTED,intersects[ 0 ].index )
        // if there is intersection
        if ( view.INTERSECTED != intersectIndex ) {
            // console.log('changed intersection, deal with previously hovered points')
            // changed intersection, deal with previously hovered points
            if (view.INTERSECTED != null ){
                // var indexIn3DView = pointVoxelMap[view.INTERSECTED]
                var indexIn3DView = intersectIndex;
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
        var indexIn3DView = intersectIndex;
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
