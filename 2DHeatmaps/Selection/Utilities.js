import {updateHeatmap} from "../HeatmapView.js";
import {updatePCAHeatmap} from "../PCAView.js";
import {updateUmapHeatmap} from "../UmapView.js";
import {updateComparison} from "../comparisonView.js"
//import {updatePointCloudGeometry} from "../../3DViews/PointCloud_selection.js";

import {updatePointCloudGeometry,updatePointCloudGeometrySelection} from "../../3DViews/PointCloud.js";
import {updateMoleculeGeometry,updateMoleculeGeometryScale} from "../../3DViews/MoleculeView.js";


/*export function heatmapsResetSelection(views){
	selectAll();
	updateAllPlots();
}*/

export function deselectAllSpatiallyResolvedData(views,spatiallyResolvedData){
	for (let i=0; i<spatiallyResolvedData.length; i++){
			spatiallyResolvedData[i].selected = false;
			spatiallyResolvedData[i].highlighted = false;
		}
}

export function selectAllSpatiallyResolvedData(views,spatiallyResolvedData){
	for (let i=0; i<spatiallyResolvedData.length; i++){
			spatiallyResolvedData[i].selected = true;
			spatiallyResolvedData[i].highlighted = false;
		}
}

export function deselectAllMoleculeData(views,overallMoleculeData){
	for (let i=0; i<overallMoleculeData.length; i++){
			overallMoleculeData[i].selected = false;
			overallMoleculeData[i].highlighted = false;
		}
}

export function selectAllMoleculeData(views,overallMoleculeData){
	for (let i=0; i<overallMoleculeData.length; i++){
			overallMoleculeData[i].selected = true;
			overallMoleculeData[i].highlighted = false;
		}
}



export function updateAllPlots(views){
	const t0 = performance.now();
	for (let ii =  0; ii < views.length; ii++ ) {
		const view = views[ii];
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
				// updatePointCloudGeometry(view);
				updatePointCloudGeometrySelection(view);
			}
			if (view.systemMoleculeDataBoolean) {
				updateMoleculeGeometry(view)
				// changeMoleculeGeometry(view);
				// if (view.options.PBCBoolean) {changeMoleculePeriodicReplicates(view);}
			}
		}
	}
	console.log("update all plots took: ", performance.now() - t0)
}

export function updateAllPlotsSpatiallyResolved(views){
	const t0 = performance.now();
	for (let ii =  0; ii < views.length; ii++ ) {
		const view = views[ii];
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
				// updatePointCloudGeometry(view);
				updatePointCloudGeometrySelection(view);
			}
		}
	}
	console.log("update all plots spatially resolved took: ", performance.now() - t0)
}

export function updateAllPlotsMolecule(views){
	const t0 = performance.now();
	for (let ii =  0; ii < views.length; ii++ ) {
		const view = views[ii];
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
				// updateMoleculeGeometryScale(view)
				updateMoleculeGeometry(view)
				// changeMoleculeGeometry(view);
				// if (view.options.PBCBoolean) {changeMoleculePeriodicReplicates(view);}
			}
		}
	}
	console.log("update all plots molecule took: ", performance.now() - t0)
}

export function updateAllPlotsMoleculeScale(views){
	for (let ii =  0; ii < views.length; ii++ ) {
		const view = views[ii];
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
				updateMoleculeGeometryScale(view)
				// changeMoleculeGeometry(view);
				// if (view.options.PBCBoolean) {changeMoleculePeriodicReplicates(view);}
			}
		}
	}
}


export function updateSelectionFromHeatmap(view){
	console.log('called update heatmap');
	const data = view.data;
	for (const x in data){
		for (const y in data[x]){
			if (data[x][y].highlighted) {
				for (let i = 0; i < data[x][y]['list'].length; i++) {
					data[x][y]['list'][i].highlighted = true;
				}
			}
		}
	}
}

export function updateSelectionFromComparison(view){
	console.log('called update comparison');
	const overallData = view.data;

	console.log(Object.keys(overallData))
	Object.keys(overallData).forEach((systemName, index) => { 
		const data = overallData[systemName].data;
		for (const x in data){
			for (const y in data[x]){
				if (data[x][y].selected) {
					for (let i = 0; i < data[x][y]['list'].length; i++) {
						data[x][y]['list'][i].selected = true;
					}
				}
			}
		}
	})
	
}