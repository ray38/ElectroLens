import {calculateViewportSizes} from "../MultiviewControl/calculateViewportSizes.js";
import {initialize2DHeatmapSetup} from "../2DHeatmaps/initialize2DHeatmapSetup.js";
import {initialize3DViewSetup} from "../3DViews/initialize3DViewSetup.js";

export function initializeViewSetups(views,plotSetup){
	for (var ii =  0; ii < views.length; ++ii ) {
		var view = views[ii];
		if (view.viewType == '2DHeatmap'){ 
			initialize2DHeatmapSetup(view,views,plotSetup);
		}
		if (view.viewType == '3DView'){ 
			initialize3DViewSetup(view,views,plotSetup);
		}
	}

	calculateViewportSizes(views);

}