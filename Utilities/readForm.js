export function readInputForm() {
    for (let i = 0; i < NUMBER3DVIEWS; i++) {         
        document.getElementById('view'+ (i+1) +'YDim').disabled = false;
        document.getElementById('view'+ (i+1) +'ZDim').disabled = false;
        document.getElementById('view'+ (i+1) +'YNumPoints').disabled = false;
        document.getElementById('view'+ (i+1) +'ZNumPoints').disabled = false;
        document.getElementById('view'+ (i+1) +'YSpacing').disabled = false;
        document.getElementById('view'+ (i+1) +'ZSpacing').disabled = false;
        
        document.getElementById('view'+ (i+1) +'LatVec11').disabled = false;
        document.getElementById('view'+ (i+1) +'LatVec12').disabled = false;
        document.getElementById('view'+ (i+1) +'LatVec13').disabled = false;
        document.getElementById('view'+ (i+1) +'LatVec21').disabled = false;
        document.getElementById('view'+ (i+1) +'LatVec22').disabled = false;
        document.getElementById('view'+ (i+1) +'LatVec23').disabled = false;
        document.getElementById('view'+ (i+1) +'LatVec31').disabled = false;
        document.getElementById('view'+ (i+1) +'LatVec32').disabled = false;
        document.getElementById('view'+ (i+1) +'LatVec33').disabled = false;
    }  

    const tempFormResult = { };
    const CONFIG = {"views":[],"plotSetup":{}};
    $.each($('form').serializeArray(), function() {
        tempFormResult[this.name] = this.value;
    });

    let boolSpatiallyResolved, boolMolecular, boolFramed;
    if (tempFormResult["boolSpatiallyResolvedData"] == "yes") {boolSpatiallyResolved = true;}
    else {boolSpatiallyResolved = false;}

    if (tempFormResult["boolMolecularData"] == "yes") {boolMolecular = true;}
    else {boolMolecular = false;}

    if (tempFormResult["boolFramedData"] == "yes") {boolFramed = true;}
    else {boolFramed = false;}
    

    let boolFormFilledCorrectly = false;


    if (boolSpatiallyResolved) {
        CONFIG["plotSetup"]["spatiallyResolvedPropertyList"] = tempFormResult["propertyListSpatiallyResolved"].split(",").map(function(item) { return item.trim();});
        CONFIG["plotSetup"]["pointcloudDensity"] = tempFormResult["densityProperty"];
        CONFIG["plotSetup"]["densityCutoffLow"] = Number(tempFormResult["densityCutoffLow"]);
        CONFIG["plotSetup"]["densityCutoffUp"] = Number(tempFormResult["densityCutoffUp"]);
    }
    else{
    console.log("No Spatially Resolved Data");
    }

    if (boolMolecular) {
        CONFIG["plotSetup"]["moleculePropertyList"] = tempFormResult["propertyListMolecular"].split(",").map(function(item) { return item.trim();});
    
    }
    else{
        console.log("No Molecular Data");
    }

    if (boolFramed) {
        CONFIG["plotSetup"]["frameProperty"] = tempFormResult["frameProperty"];
    }
    else{
        console.log("Data not framed");
    }

    for (let i = 1; i < NUMBER3DVIEWS+1; i++) {
        const tempViewSetup = {"viewType": "3DView"};
        tempViewSetup["moleculeName"] = tempFormResult["view" + i + "Name"];
        tempViewSetup["systemDimension"] = {"x": Number(tempFormResult["view"+i+"XDim"]),
                                            "y": Number(tempFormResult["view"+i+"YDim"]),
                                            "z": Number(tempFormResult["view"+i+"ZDim"])};
        const tempU = { 	"u11":Number(tempFormResult["view"+i+"LatVec11"]), 
                        "u12":Number(tempFormResult["view"+i+"LatVec12"]), 
                        "u13":Number(tempFormResult["view"+i+"LatVec13"]), 
                        "u21":Number(tempFormResult["view"+i+"LatVec21"]), 
                        "u22":Number(tempFormResult["view"+i+"LatVec22"]), 
                        "u23":Number(tempFormResult["view"+i+"LatVec23"]),
                        "u31":Number(tempFormResult["view"+i+"LatVec31"]), 
                        "u32":Number(tempFormResult["view"+i+"LatVec32"]), 
                        "u33":Number(tempFormResult["view"+i+"LatVec33"])};
        tempViewSetup["systemLatticeVectors"] = normalizeLatticeVectors(tempU);

                                    
        if (boolSpatiallyResolved){
            tempViewSetup["spatiallyResolvedData"] = {};
            tempViewSetup["spatiallyResolvedData"]["dataFilename"] = document.getElementById("view"+i+"SpatiallyResolvedDataFilename").files[0].path;
            tempViewSetup["spatiallyResolvedData"]["numGridPoints"] = { "x": Number(tempFormResult["view"+i+"XNumPoints"]),
                                                                        "y": Number(tempFormResult["view"+i+"YNumPoints"]),
                                                                        "z": Number(tempFormResult["view"+i+"ZNumPoints"])};
            tempViewSetup["spatiallyResolvedData"]["gridSpacing"] = {	"x": Number(tempFormResult["view"+i+"XSpacing"]),
                                                                        "y": Number(tempFormResult["view"+i+"YSpacing"]),
                                                                        "z": Number(tempFormResult["view"+i+"ZSpacing"])};
        }

        if (boolMolecular){
            tempViewSetup["moleculeData"] = {};
            tempViewSetup["moleculeData"]["dataFilename"] = document.getElementById("view"+i+"MolecularDataFilename").files[0].path;
        }
        CONFIG["views"].push(tempViewSetup);
    }
    return CONFIG;
}

function normalizeLatticeVectors(U) {
	const magnitude1 = Math.sqrt(U.u11 * U.u11 + U.u12 * U.u12 + U.u13 * U.u13);
	const magnitude2 = Math.sqrt(U.u21 * U.u21 + U.u22 * U.u22 + U.u23 * U.u23);
	const magnitude3 = Math.sqrt(U.u31 * U.u31 + U.u32 * U.u32 + U.u33 * U.u33);
	const result = {
		"u11": U.u11 / magnitude1, 
		"u12": U.u12 / magnitude1, 
		"u13": U.u13 / magnitude1, 
		"u21": U.u21 / magnitude2, 
		"u22": U.u22 / magnitude2, 
		"u23": U.u23 / magnitude2,
		"u31": U.u31 / magnitude3, 
		"u32": U.u32 / magnitude3, 
		"u33": U.u33 / magnitude3
	}
	return result;
}