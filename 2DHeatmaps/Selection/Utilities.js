import {updateHeatmap} from "../HeatmapView.js";
import {updatePCAHeatmap} from "../PCAView.js";
import {updateUmapHeatmap} from "../UmapView.js";
import {updateComparison} from "../comparisonView.js"
//import {updatePointCloudGeometry} from "../../3DViews/PointCloud_selection.js";

import {getPointCloudGeometry, updatePointCloudGeometry, removePointCloudGeometry, changePointCloudGeometry} from "../../3DViews/PointCloud_selection.js";
import {getMoleculeGeometry, changeMoleculeGeometry, removeMoleculeGeometry,updateMoleculeGeometry,updateMoleculeGeometryScale} from "../../3DViews/MoleculeView.js";


/*export function heatmapsResetSelection(views){
	selectAll();
	updateAllPlots();
}*/

export function deselectAllSpatiallyResolvedData(views,spatiallyResolvedData){
	for (var i=0; i<spatiallyResolvedData.length; i++){
			spatiallyResolvedData[i].selected = false;
			spatiallyResolvedData[i].highlighted = false;
		}

	/*for (var ii =  0; ii < views.length; ++ii ) {
		var view = views[ii];
		if (view.viewType == '2DHeatmap'){
			var data = view.data;
			for (var x in data){
				for (var y in data[x]){
					data[x][y].selected = false;
				}
			}
		}
	}*/
}

export function selectAllSpatiallyResolvedData(views,spatiallyResolvedData){
	for (var i=0; i<spatiallyResolvedData.length; i++){
			spatiallyResolvedData[i].selected = true;
			spatiallyResolvedData[i].highlighted = false;
		}

	/*for (var ii =  0; ii < views.length; ++ii ) {
		var view = views[ii];
		if (view.viewType == '2DHeatmap'){
			var data = view.data;
			for (var x in data){
				for (var y in data[x]){
					data[x][y].selected = true;
				}
			}
		}
	}*/
}

export function deselectAllMoleculeData(views,overallMoleculeData){
	for (var i=0; i<overallMoleculeData.length; i++){
			overallMoleculeData[i].selected = false;
			overallMoleculeData[i].highlighted = false;
		}

}

export function selectAllMoleculeData(views,overallMoleculeData){
	for (var i=0; i<overallMoleculeData.length; i++){
			overallMoleculeData[i].selected = true;
			overallMoleculeData[i].highlighted = false;
		}
}



export function updateAllPlots(views){
	for (var ii =  0; ii < views.length; ii++ ) {
		var view = views[ii];
		if (view.viewType == '2DHeatmap' && view.options.plotType == "Heatmap"){
			updateHeatmap(view);
		}
		if (view.viewType == '2DHeatmap' && view.options.plotType == "Comparison"){
			updateComparison(view);
		}
		if (view.viewType == '2DHeatmap' && view.options.plotType == 'PCA'){
			updatePCAHeatmap(view);
		}

		if (view.viewType == '3DView'){
			if (view.systemSpatiallyResolvedDataBoolean) {
				updatePointCloudGeometry(view);
			}
			if (view.systemMoleculeDataBoolean) {
				updateMoleculeGeometry(view)
				// changeMoleculeGeometry(view);
				// if (view.options.PBCBoolean) {changeMoleculePeriodicReplicates(view);}
			}
		}
	}
}

export function updateAllPlotsSpatiallyResolved(views){
	for (var ii =  0; ii < views.length; ii++ ) {
		var view = views[ii];
		if (view.viewType == '2DHeatmap' && view.options.plotType == "Heatmap"){
			updateHeatmap(view);
		}
		if (view.viewType == '2DHeatmap' && view.options.plotType == "Comparison"){
			updateComparison(view);
		}
		if (view.viewType == '2DHeatmap' && view.options.plotType == 'PCA'){
			updatePCAHeatmap(view);
		}
		if (view.viewType == '2DHeatmap' && view.options.plotType == 'Umap'){
			updateUmapHeatmap(view);
		}

		if (view.viewType == '3DView'){
			if (view.systemSpatiallyResolvedDataBoolean) {
				updatePointCloudGeometry(view);
			}
		}
	}
}

export function updateAllPlotsMolecule(views){
	for (var ii =  0; ii < views.length; ii++ ) {
		var view = views[ii];
		if (view.viewType == '2DHeatmap' && view.options.plotType == "Heatmap"){
			updateHeatmap(view);
		}
		if (view.viewType == '2DHeatmap' && view.options.plotType == "Comparison"){
			updateComparison(view);
		}
		if (view.viewType == '2DHeatmap' && view.options.plotType == 'PCA'){
			updatePCAHeatmap(view);
		}
		if (view.viewType == '2DHeatmap' && view.options.plotType == 'Umap'){
			updateUmapHeatmap(view);
		}

		if (view.viewType == '3DView'){
			if (view.systemMoleculeDataBoolean) {
				updateMoleculeGeometry(view)
				// changeMoleculeGeometry(view);
				// if (view.options.PBCBoolean) {changeMoleculePeriodicReplicates(view);}
			}
		}
	}
}

export function updateAllPlotsMoleculeScale(views){
	for (var ii =  0; ii < views.length; ii++ ) {
		var view = views[ii];
		if (view.viewType == '2DHeatmap' && view.options.plotType == "Heatmap"){
			updateHeatmap(view);
		}
		if (view.viewType == '2DHeatmap' && view.options.plotType == "Comparison"){
			updateComparison(view);
		}
		if (view.viewType == '2DHeatmap' && view.options.plotType == 'PCA'){
			updatePCAHeatmap(view);
		}

		if (view.viewType == '3DView'){
			if (view.systemMoleculeDataBoolean) {
				updateMoleculeGeometryScale(view)
				// changeMoleculeGeometry(view);
				// if (view.options.PBCBoolean) {changeMoleculePeriodicReplicates(view);}
			}
		}
	}
}


export function updateSelectionFromHeatmap(view){
	console.log('called update heatmap');
	var data = view.data;
	for (var x in data){
		for (var y in data[x]){
			if (data[x][y].highlighted) {
				for (var i = 0; i < data[x][y]['list'].length; i++) {
					data[x][y]['list'][i].highlighted = true;
				}
			}
			/* if (data[x][y].selected) {
				for (var i = 0; i < data[x][y]['list'].length; i++) {
					data[x][y]['list'][i].selected = true;
				}
			} */
			/*else {
				for (var i = 0; i < data[x][y]['list'].length; i++) {
					data[x][y]['list'][i].selected = false;
				}
			}*/
		}
	}
}

export function updateSelectionFromComparison(view){
	console.log('called update comparison');
	const overallData = view.data;

	console.log(Object.keys(overallData))
	Object.keys(overallData).forEach((systemName, index) => { 
		var data = overallData[systemName].data;
		for (var x in data){
			for (var y in data[x]){
				if (data[x][y].selected) {
					for (var i = 0; i < data[x][y]['list'].length; i++) {
						data[x][y]['list'][i].selected = true;
					}
				}
			}
		}
	})
	
}