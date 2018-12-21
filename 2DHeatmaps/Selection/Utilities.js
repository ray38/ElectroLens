import {updateHeatmap} from "../HeatmapView.js";
import {updatePointCloudGeometry} from "../../3DViews/PointCloud_selection.js";

export function heatmapsResetSelection(views){
	selectAll();
	updateAllPlots();
}

export function deselectAll(views,unfilteredData){
	for (var i=0; i<unfilteredData.length; i++){
			unfilteredData[i].selected = false;
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

export function selectAll(views,unfilteredData){
	for (var i=0; i<unfilteredData.length; i++){
			unfilteredData[i].selected = true;
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

export function updateAllPlots(views){
	for (var ii =  0; ii < views.length; ++ii ) {
		var view = views[ii];
		if (view.viewType == '2DHeatmap'){
			updateHeatmap(view);
		}
	}
	
	for (var ii =  0; ii < views.length; ++ii ) {
		var view = views[ii];
		if (view.viewType == '3DView'){
			updatePointCloudGeometry(view);
		}
	}
}


export function updateSelectionFromHeatmap(view){
	var data = view.data;
	for (var x in data){
		for (var y in data[x]){
			if (data[x][y].selected) {
				for (var i = 0; i < data[x][y]['list'].length; i++) {
					data[x][y]['list'][i].selected = true;
				}
			}
			/*else {
				for (var i = 0; i < data[x][y]['list'].length; i++) {
					data[x][y]['list'][i].selected = false;
				}
			}*/
		}
	}
}