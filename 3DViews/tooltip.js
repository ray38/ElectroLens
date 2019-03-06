export function initialize3DViewTooltip(view){
	var tempRaycaster = new THREE.Raycaster();
	view.raycaster = tempRaycaster;
	view.INTERSECTED = null;

	var tempTooltip = document.createElement('div');
	tempTooltip.setAttribute('style', 'cursor: pointer; text-align: left; display:block;');
	tempTooltip.style.position = 'absolute';
	tempTooltip.innerHTML = "";
	//tempTooltip.style.width = 100;
	//tempTooltip.style.height = 100;
	tempTooltip.style.backgroundColor = "blue";
	tempTooltip.style.opacity = 0.5;
	tempTooltip.style.color = "white";
	tempTooltip.style.top = 0 + 'px';
	tempTooltip.style.left = 0 + 'px';
	view.tooltip = tempTooltip;
	document.body.appendChild(tempTooltip);

}


export function update3DViewTooltip(view){

	var mouse = new THREE.Vector2();
	mouse.set(	(((event.clientX-view.windowLeft)/(view.windowWidth)) * 2 - 1),
				(-((event.clientY-view.windowTop)/(view.windowHeight)) * 2 + 1));


	view.raycaster.setFromCamera( mouse.clone(), view.camera );
	var intersects = view.raycaster.intersectObjects( view.molecule.atoms );
	//console.log(intersects);
	if ( intersects.length > 0 ) {
		//console.log("found intersect")
		
		view.tooltip.style.top = event.clientY + 5  + 'px';
		view.tooltip.style.left = event.clientX + 5  + 'px';

		var data = view.systemMoleculeData[ intersects[ 0 ].object.dataIndex ];

		var tempDisplayedInfo = 	"x: " + data.x + "<br>" + 
									"y: " + data.y + "<br>" +
									"z: " + data.z + "<br>";
		for (var property in data ) {
			if (data.hasOwnProperty(property)) {
				if (property != "xPlot" && property != "yPlot" && property != "zPlot" && property != "x" && property != "y" && property != "z" && property != "selected"){
					tempDisplayedInfo += property + ": " + data[property] + "<br>";
				}
			}
		}

		view.tooltip.innerHTML = 	tempDisplayedInfo;

		if ( view.INTERSECTED != intersects[ 0 ] ) {

			if (view.INTERSECTED != null){view.INTERSECTED.scale.set(view.INTERSECTED.scale.x/1.3, view.INTERSECTED.scale.y/1.3, view.INTERSECTED.scale.z/1.3);}
			
			view.INTERSECTED = intersects[ 0 ].object;
			view.INTERSECTED.scale.set(view.INTERSECTED.scale.x*1.3, view.INTERSECTED.scale.y*1.3, view.INTERSECTED.scale.z*1.3);
		}
		

	}
	else {	view.tooltip.innerHTML = '';

			if (view.INTERSECTED != null){view.INTERSECTED.scale.set(view.INTERSECTED.scale.x/1.3, view.INTERSECTED.scale.y/1.3, view.INTERSECTED.scale.z/1.3);}
			view.INTERSECTED = null;
	}
}