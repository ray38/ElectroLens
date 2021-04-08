export function arrangeMoleculeDataToFrame(view){
	const moleculeDataFramed = view.systemMoleculeDataFramed;
	view.systemMoleculeDataFramedBondsDict = {};

	for (let frame in moleculeDataFramed) {
		
		if (moleculeDataFramed.hasOwnProperty(frame)) {
			const moleculeData = moleculeDataFramed[frame]
			view.systemMoleculeDataFramedBondsDict[frame] = []

			for (let i = 0; i < moleculeData.length; i++) {
				const tempNeighborObject = {};
				tempNeighborObject.neighborsList = [];
				tempNeighborObject.distancesList = [];
				tempNeighborObject.coordinatesList = [];
				const coordinates1 = new THREE.Vector3(moleculeData[i].x, moleculeData[i].y, moleculeData[i].z);
				const point1 = new THREE.Vector3(moleculeData[i].xPlot, moleculeData[i].yPlot,moleculeData[i].zPlot);

			    for (let j = 0; j < moleculeData.length; j++) {
			    	if (i!= j){
			    		const coordinates2 = new THREE.Vector3(moleculeData[j].x, moleculeData[j].y, moleculeData[j].z);
				    	const point2 = new THREE.Vector3(moleculeData[j].xPlot, moleculeData[j].yPlot,moleculeData[j].zPlot);
					    const bondlength = new THREE.Vector3().subVectors( coordinates2, coordinates1 ).length();
					    const midPoint = new THREE.Vector3().addVectors( point2, point1 ).divideScalar(2);
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

}

export function arrangeMoleculeDataToFrame2(view){
	const moleculeDataFramed = view.systemMoleculeDataFramed;
	view.systemMoleculeDataFramedBondsDict = {};
	

	for (let frame in moleculeDataFramed) {

		console.log("arrange frame: ", frame)
		
		if (moleculeDataFramed.hasOwnProperty(frame)) {
			const moleculeData = moleculeDataFramed[frame]
			view.systemMoleculeDataFramedBondsDict[frame] = []

			const pointsList = [];

			//var t0 = performance.now();


			//construct tree
			for (let i = 0; i < moleculeData.length; i++) {
				pointsList.push(moleculeData[i]);
			}

			//var t1 = performance.now();
			//console.log("arrange pointlist took " + (t1 - t0) + " milliseconds.");

			const tree = new kdTree(pointsList, euclideanDistnace, ["x", "y", "z"]);

			//var t1 = performance.now();
			//console.log("construct tree took " + (t1 - t0) + " milliseconds.");

			for (let i = 0; i < moleculeData.length; i++) {
				const tempNeighborObject = {};
				tempNeighborObject.neighborsList = [];
				tempNeighborObject.distancesList = [];
				tempNeighborObject.coordinatesList = [];
				//var coordinates1 =  {"x":moleculeData[i].x, "y": moleculeData[i].y, "z":moleculeData[i].z};
				const point1 = new THREE.Vector3(moleculeData[i].x, moleculeData[i].y, moleculeData[i].z);

				const nearest = tree.nearest(moleculeData[i], 6, 4);

				for (let j = 0; j < nearest.length; j++){
					const neighbor = nearest[j][0];
					const distance = nearest[j][1];

					if (distance > 0){
						const point2 = new THREE.Vector3(neighbor.x, neighbor.y,neighbor.z);
						const bondlength = Math.sqrt(distance);
					    const midPoint = new THREE.Vector3().addVectors( point2, point1 ).divideScalar(2);
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