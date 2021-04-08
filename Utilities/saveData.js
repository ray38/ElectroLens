export function saveSystemMoleculeData(view, plotSetup){
	console.log("save MoleculeData");
	const csv = convertArrayOfObjectsToCSV(view.systemMoleculeData, plotSetup["moleculePropertyList"].slice());
}

export function saveSystemSpatiallyResolvedData(view, plotSetup){
	console.log("save SpatiallyResolvedData");
	const csv = convertArrayOfObjectsToCSV(view.data, plotSetup["spatiallyResolvedPropertyList"].slice());
}

export function saveOverallMoleculeData(view, plotSetup){
	console.log("save overall MoleculeData");
	const csv = convertArrayOfObjectsToCSV(view.overallMoleculeData, plotSetup["moleculePropertyList"].slice());
}

export function saveOverallSpatiallyResolvedData(view, plotSetup){
	console.log("save overall SpatiallyResolvedData");
	const csv = convertArrayOfObjectsToCSV(view.spatiallyResolvedData, plotSetup["spatiallyResolvedPropertyList"].slice());
}



export function download(content, fileName, contentType) {
	const contentToWrite = JSON.stringify(content, null, 2);
    const a = document.createElement("a");
    const file = new Blob([contentToWrite], {type: contentType});
    a.href = URL.createObjectURL(file);
    a.download = fileName;
    a.click();
}

function convertArrayOfObjectsToCSV(data, keys) {
    let result, ctr, columnDelimiter, lineDelimiter;


    if (keys.indexOf("z") < 0) {keys.unshift("z");}
    if (keys.indexOf("y") < 0) {keys.unshift("y");}
    if (keys.indexOf("x") < 0) {keys.unshift("x");}

    if (keys.indexOf("selected") < 0) {keys.push("selected");}

    columnDelimiter = ',';
    lineDelimiter = '\n';

    //keys = Object.keys(data[0]);

    result = '';
    result += keys.join(columnDelimiter);
    result += lineDelimiter;

    data.forEach(function(item) {
        ctr = 0;
        keys.forEach(function(key) {
            if (ctr > 0) result += columnDelimiter;

            result += item[key];
            ctr++;
        });
        result += lineDelimiter;
    });

    const filename = 'export.csv';

	const blob = new Blob([result], {type: "text/csv;charset=utf-8;"});
	if (navigator.msSaveBlob)
		{ // IE 10+
		navigator.msSaveBlob(blob, filename)
		}
	else
		{
		const link = document.createElement("a");
		if (link.download !== undefined)
			{
				// feature detection, Browsers that support HTML5 download attribute
				const url = URL.createObjectURL(blob);
				link.setAttribute("href", url);
				link.setAttribute("download", filename);
				link.style = "visibility:hidden";
				document.body.appendChild(link);
				link.click();
				document.body.removeChild(link);
			}
		}

}