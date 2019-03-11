export function arrangeMoleculeDataToFrame(view){
	var moleculeDataFramed = view.systemMoleculeDataFramed;
	view.systemMoleculeDataFramedBondsDict = {};

	for (var frame in moleculeDataFramed) {
		
		if (moleculeDataFramed.hasOwnProperty(frame)) {
			var moleculeData = moleculeDataFramed[frame]
			view.systemMoleculeDataFramedBondsDict[frame] = []

			for (var i = 0; i < moleculeData.length; i++) {
				var tempNeighborObject = {};
				tempNeighborObject.neighborsList = [];
				tempNeighborObject.distancesList = [];
				tempNeighborObject.coordinatesList = [];
				var coordinates1 = new THREE.Vector3(moleculeData[i].x, moleculeData[i].y, moleculeData[i].z);
				var point1 = new THREE.Vector3(moleculeData[i].xPlot*20.0, moleculeData[i].yPlot*20.0,moleculeData[i].zPlot*20.0);

			    for (var j = 0; j < moleculeData.length; j++) {
			    	if (i!= j){
			    		var coordinates2 = new THREE.Vector3(moleculeData[j].x, moleculeData[j].y, moleculeData[j].z);
				    	var point2 = new THREE.Vector3(moleculeData[j].xPlot*20.0, moleculeData[j].yPlot*20.0,moleculeData[j].zPlot*20.0);
					    var bondlength = new THREE.Vector3().subVectors( coordinates2, coordinates1 ).length();
					    var midPoint = new THREE.Vector3().addVectors( point2, point1 ).divideScalar(2);
					    if (bondlength < 2) {
					    	tempNeighborObject.neighborsList.push(moleculeData[j]);
					    	tempNeighborObject.distancesList.push(bondlength);
					    	tempNeighborObject.coordinatesList.push(midPoint);
					    }

			    	}
			    	
				}

				view.systemMoleculeDataFramedBondsDict[frame].push(tempNeighborObject);
			}
		// Do things here
		}
	}

	//console.log(view.systemMoleculeDataFramedBondsDict)

}