function arrayToIdenticalObject(array){
	var result = {}
	for (var i = 0; i < array.length; i++) {
		result[array[i]] = array[i];
	}
	return result;
}