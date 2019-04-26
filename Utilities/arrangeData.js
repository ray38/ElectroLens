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

export function arrangeMoleculeDataToFrame2(view){
	var moleculeDataFramed = view.systemMoleculeDataFramed;
	view.systemMoleculeDataFramedBondsDict = {};
	

	for (var frame in moleculeDataFramed) {

		console.log("arrange frame: ", frame)
		
		if (moleculeDataFramed.hasOwnProperty(frame)) {
			var moleculeData = moleculeDataFramed[frame]
			view.systemMoleculeDataFramedBondsDict[frame] = []

			var pointsList = [];

			//var t0 = performance.now();


			//construct tree
			for (var i = 0; i < moleculeData.length; i++) {
				pointsList.push(moleculeData[i]);
			}

			//var t1 = performance.now();
			//console.log("arrange pointlist took " + (t1 - t0) + " milliseconds.");

			var tree = new kdTree(pointsList, euclideanDistnace, ["x", "y", "z"]);

			//var t1 = performance.now();
			//console.log("construct tree took " + (t1 - t0) + " milliseconds.");

			for (var i = 0; i < moleculeData.length; i++) {
				var tempNeighborObject = {};
				tempNeighborObject.neighborsList = [];
				tempNeighborObject.distancesList = [];
				tempNeighborObject.coordinatesList = [];
				//var coordinates1 =  {"x":moleculeData[i].x, "y": moleculeData[i].y, "z":moleculeData[i].z};
				var point1 = new THREE.Vector3(moleculeData[i].xPlot*20.0, moleculeData[i].yPlot*20.0,moleculeData[i].zPlot*20.0);

				var nearest = tree.nearest(moleculeData[i], 6, 4);

				for (var j = 0; j < nearest.length; j++){
					var neighbor = nearest[j][0];
					var distance = nearest[j][1];

					if (distance > 0){
						var point2 = new THREE.Vector3(neighbor.xPlot*20.0, neighbor.yPlot*20.0,neighbor.zPlot*20.0);
						var bondlength = Math.sqrt(distance);
					    var midPoint = new THREE.Vector3().addVectors( point2, point1 ).divideScalar(2);
					    tempNeighborObject.neighborsList.push(neighbor);
				    	tempNeighborObject.distancesList.push(bondlength);
				    	tempNeighborObject.coordinatesList.push(midPoint);
					}
				} 

				view.systemMoleculeDataFramedBondsDict[frame].push(tempNeighborObject);
			}
			//var t1 = performance.now();
			//console.log("query took " + (t1 - t0) + " milliseconds.");
		}
		console.log("end frame: ", frame)
	}

}

function euclideanDistnace(a, b){
	return Math.pow(a.x - b.x, 2) +  Math.pow(a.y - b.y, 2) +  Math.pow(a.z - b.z, 2);
}