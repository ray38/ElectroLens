

/*export function addingProgressBar(){
	console.log("adding progressbar")
	var progressBar = new ProgressBar.Circle(midUI, {
		color: '#aaa',
	  // This has to be the same size as the maximum width to
	  // prevent clipping
		strokeWidth: 4,
		trailWidth: 1,
		text: {
			autoStyleContainer: false
		},
		from: { color: '#aaa', width: 1 },
		to: { color: '#333', width: 4 },
		// Set default step function for all animate calls
		step: function(state, circle) {
			circle.path.setAttribute('stroke', state.color);
			circle.path.setAttribute('stroke-width', state.width);

			var value = Math.round(circle.value() * 100);
			if (value === 0) {
				circle.setText('');
			} else {
				circle.setText(value);
			}

	 	}
	});
	progressBar.text.style.fontSize = '2rem';

	return progressBar;
}*/

export function addingProgressBar(loadingStatus){
	var gui = new dat.GUI({ autoPlace: false });

	var customContainer = document.getElementById('midUI');
	customContainer.appendChild(gui.domElement);

	gui.add(loadingStatus, "message");
	gui.add(loadingStatus, "progress", 0, 100);


	return gui
}

export function updateProgressBar(progressBar, status, progress, message){
	console.log("update progress");
	status.message = message;
	status.progress = progress;
	progressBar.updateDisplay();
	console.log("update progress2");
}
