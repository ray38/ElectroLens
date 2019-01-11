export function saveSystemMoleculeData(view, plotSetup){
	//var data;
	console.log("save MoleculeData");
	var csv = convertArrayOfObjectsToCSV(view.systemMoleculeData, plotSetup["moleculePropertyList"].slice());
	/*if (csv == null) return;

	var filename = 'export.csv';

	if (!csv.match(/^data:text\/csv/i)) {
	    csv = 'data:text/csv;charset=utf-8,' + csv;
	}
	data = encodeURI(csv);

	var link = document.createElement('a');
	link.setAttribute('href', data);
	link.setAttribute('download', filename);
	link.click();*/
}

export function saveSystemSpatiallyResolvedData(view, plotSetup){
	//var data;
	console.log("save SpatiallyResolvedData");
	var csv = convertArrayOfObjectsToCSV(view.data, plotSetup["spatiallyResolvedPropertyList"].slice());
	/*console.log("end processing csv");

	var filename = 'export.csv';

	if (!csv.match(/^data:text\/csv/i)) {
	    csv = 'data:text/csv;charset=utf-8,' + csv;
	}
	data = encodeURI(csv);

	//console.log(data);

	var link = document.createElement('a');
	link.setAttribute('href', data);
	link.setAttribute('download', filename);
	link.click();*/
}

export function saveOverallMoleculeData(view, plotSetup){
	//var data;
	console.log("save overall MoleculeData");
	var csv = convertArrayOfObjectsToCSV(view.overallMoleculeData, plotSetup["moleculePropertyList"].slice());
	/*if (csv == null) return;

	var filename = 'export.csv';

	if (!csv.match(/^data:text\/csv/i)) {
	    csv = 'data:text/csv;charset=utf-8,' + csv;
	}
	data = encodeURI(csv);

	var link = document.createElement('a');
	link.setAttribute('href', data);
	link.setAttribute('download', filename);
	link.click();*/
}

export function saveOverallSpatiallyResolvedData(view, plotSetup){
	//var data;
	console.log("save overall SpatiallyResolvedData");
	var csv = convertArrayOfObjectsToCSV(view.spatiallyResolvedData, plotSetup["spatiallyResolvedPropertyList"].slice());
	/*console.log("end processing csv");

	var filename = 'export.csv';

	if (!csv.match(/^data:text\/csv/i)) {
	    csv = 'data:text/csv;charset=utf-8,' + csv;
	}
	data = encodeURI(csv);

	//console.log(data);

	var link = document.createElement('a');
	link.setAttribute('href', data);
	link.setAttribute('download', filename);
	link.click();*/
}

function convertArrayOfObjectsToCSV(data, keys) {
    var result, ctr, columnDelimiter, lineDelimiter;

    /*if (data == null || !data.length) {
        return null;
    }*/
    //console.log(data);

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

    var filename = 'export.csv';

	/*if (!result.match(/^data:text\/csv/i)) {
	    result = 'data:text/csv;charset=utf-8,' + result;
	}
	var result_data = encodeURI(result);

	//console.log(data);

	var link = document.createElement('a');
	link.setAttribute('href', result_data);
	link.setAttribute('download', filename);
	link.click();*/

	var blob = new Blob([result], {type: "text/csv;charset=utf-8;"});
	if (navigator.msSaveBlob)
		{ // IE 10+
		navigator.msSaveBlob(blob, filename)
		}
	else
		{
		var link = document.createElement("a");
		if (link.download !== undefined)
			{
				// feature detection, Browsers that support HTML5 download attribute
				var url = URL.createObjectURL(blob);
				link.setAttribute("href", url);
				link.setAttribute("download", filename);
				link.style = "visibility:hidden";
				document.body.appendChild(link);
				link.click();
				document.body.removeChild(link);
			}
		}

}