let $ = jQuery = require('jquery');

import {initializeViewSetups} from "./MultiviewControl/initializeViewSetups.js";
import {initialize2DHeatmapSetup} from "./2DHeatmaps/initialize2DHeatmapSetup.js";
import {calculateViewportSizes} from "./MultiviewControl/calculateViewportSizes.js";

import {getPointCloudGeometry} from "./3DViews/PointCloud.js";
import {getMoleculeGeometry} from "./3DViews/MoleculeView.js";
import {addSystemEdge} from "./3DViews/systemEdge.js";
import {initialize3DViewTooltip,update3DViewTooltip,} from "./3DViews/tooltip.js";
import {hover3DViewSpatiallyResolved, hover3DViewMoleculeBall, hover3DViewMoleculeSprite, click3DViewMolecule, click3DViewSpatiallyResolved,gpuPickMolecule} from "./3DViews/selection.js";
import {combineData,readCSVSpatiallyResolvedData,readCSVMoleculeData, processSpatiallyResolvedData,processMoleculeData} from "./Utilities/readDataFile.js";


import {arrangeMoleculeDataToFrame,arrangeMoleculeDataToFrame2} from "./Utilities/arrangeData.js";

import {readInputForm} from "./Utilities/readForm.js";
import {download} from "./Utilities/saveData.js";


import {setupOptionBox3DView} from "./3DViews/setupOptionBox3DView.js";
import {setupOptionBox2DHeatmap} from "./2DHeatmaps/setupOptionBox2DHeatmap.js";

import {setupViewCameraSceneController } from "./MultiviewControl/setupViewBasic.js";
import {addOptionBox, updateOptionBoxLocation, showHideAllOptionBoxes } from "./MultiviewControl/optionBoxControl.js";
import {setupHUD} from "./MultiviewControl/HUDControl.js";
import {updateController} from "./MultiviewControl/controllerControl.js";
import {getAxis, addTitle, update2DHeatmapTitlesLocation} from "./2DHeatmaps/Utilities.js";
import {initialize2DPlotTooltip,updateHeatmapTooltip,  updateCovarianceTooltip/*, hoverHeatmap,clickHeatmap */} from "./2DHeatmaps/tooltip.js";
import {selectionControl, updatePlaneSelection, hoverHeatmap,clickHeatmap} from "./2DHeatmaps/selection.js";
import { updateAllPlots, updateSelectionFromHeatmap,updateAllPlotsMolecule, updateAllPlotsMoleculeScale,updateAllPlotsSpatiallyResolved} from "./2DHeatmaps/Selection/Utilities.js";

import {fullscreenOneView} from "./MultiviewControl/calculateViewportSizes.js";

import {insertLegend/*, removeLegend, changeLegend, insertLegendMolecule, removeLegendMolecule, changeLegendMolecule*/} from "./MultiviewControl/colorLegend.js";

import {calcDefaultScalesSpatiallyResolvedData, adjustColorScaleAccordingToDefaultSpatiallyResolvedData, calcDefaultScalesMoleculeData, adjustScaleAccordingToDefaultMoleculeData} from "./Utilities/scale.js";

if(typeof data !== 'undefined'){
	console.log(data);
    handleViewSetup(data);
    }
else{
	console.log('starting');


	// THE INDEX JS


	$(document).ready(function(){
	  var next = 1;
	//   NUMBER3DVIEWS = 1;
	  $(".add-more").click(function(e){
		  e.preventDefault();
		  var addto = "#view" + next + "Form";
		  var addRemove = "#view" +( next) + "Form";
		  next = next + 1;
		  NUMBER3DVIEWS += 1;
		  
		  var newIn = ''
		  newIn += '<div class="form-group" id="view' + next + 'Form">\
					<h6 class="text-divider"><span>View ' + next + '</span></h6>\
					<div class="form-group" id="view' + next + 'NameForm">\
					  <label for="view' + next + 'Name">System Name: </label>\
					  <input autocomplete="off" class="input" id="view' + next + 'Name" name="view' + next + 'Name" type="text" value="System' + next + '" data-items="8"/>\
					</div>\
					<div class="form-group" id="view' + next + 'DimensionForm">\
					  <label>System Dimensions: </label>\
					  <div class="form-row">\
						<div class="col">\
						  <input class="form-check-input" type="checkbox" value="yes" name="boolView' + next + 'CubicCell" id="boolView' + next + 'CubicCell" checked>\
						  <label for="boolView' + next + 'CubicCell">Cubic Cell? </label>\
						</div>\
					  </div>\
					  <div class="form-row">\
						<div class="col">\
						  <label for="view' + next + 'XDim">x dimension: </label>\
						  <input type="number" step=any class="input" id="view' + next + 'XDim" name="view' + next + 'XDim" value="10">\
						</div>\
						<div class="col">\
						  <label for="view' + next + 'YDim">y dimension: </label>\
						  <input type="number" step=any class="input" id="view' + next + 'YDim" name="view' + next + 'YDim" value="10" disabled>\
						</div>\
						<div class="col">\
						  <label for="view' + next + 'ZDim">z dimension: </label>\
						  <input type="number" step=any class="input" id="view' + next + 'ZDim" name="view' + next + 'ZDim" value="10" disabled>\
						</div>\
					  </div>\
					  <div class="form-row">\
						<div class="col">\
						  <input class="form-check-input" type="checkbox" value="yes" name="boolView' + next + 'OrthogonalLattice" id="boolView' + next + 'OrthogonalLattice" checked>\
						  <label for="boolView' + next + 'OrthogonalLattice">Orthogonal Lattice? </label>\
						</div>\
					  </div>\
					  <div class="form-row">\
						<label>Lattice Vector: </label>\
					  </div>\
					  <div class="form-row">\
						<div class="col">\
						  <label for="view' + next + 'LatVec11">u11: </label>\
						  <input type="number" step=any class="input" id="view' + next + 'LatVec11" name="view' + next + 'LatVec11" value="1" disabled>\
						</div>\
						<div class="col">\
						  <label for="view' + next + 'LatVec12">u12: </label>\
						  <input type="number" step=any class="input" id="view' + next + 'LatVec12" name="view' + next + 'LatVec12" value="0" disabled>\
						</div>\
						<div class="col">\
						  <label for="view' + next + 'LatVec13">u13: </label>\
						  <input type="number" step=any class="input" id="view' + next + 'LatVec13" name="view' + next + 'LatVec13" value="0" disabled>\
						</div>\
					  </div>\
					  <div class="form-row">\
						<div class="col">\
						  <label for="view' + next + 'LatVec21">u21: </label>\
						  <input type="number" step=any class="input" id="view' + next + 'LatVec21" name="view' + next + 'LatVec21" value="0" disabled>\
						</div>\
						<div class="col">\
						  <label for="view' + next + 'LatVec22">u22: </label>\
						  <input type="number" step=any class="input" id="view' + next + 'LatVec22" name="view' + next + 'LatVec22" value="1" disabled>\
						</div>\
						<div class="col">\
						  <label for="view' + next + 'LatVec23">u23: </label>\
						  <input type="number" step=any class="input" id="view' + next + 'LatVec23" name="view' + next + 'LatVec23" value="0" disabled>\
						</div>\
					  </div>\
					  <div class="form-row">\
						<div class="col">\
						  <label for="view' + next + 'LatVec31">u31: </label>\
						  <input type="number" step=any class="input" id="view' + next + 'LatVec31" name="view' + next + 'LatVec31" value="0" disabled>\
						</div>\
						<div class="col">\
						  <label for="view' + next + 'LatVec32">u32: </label>\
						  <input type="number" step=any class="input" id="view' + next + 'LatVec32" name="view' + next + 'LatVec32" value="0" disabled>\
						</div>\
						<div class="col">\
						  <label for="view' + next + 'LatVec33">u33: </label>\
						  <input type="number" step=any class="input" id="view' + next + 'LatVec33" name="view' + next + 'LatVec33" value="1" disabled>\
						</div>\
					  </div>\
					</div>\
					<div class="form-group" id="view' + next + 'SpatiallyResolvedForm" style="display:none;">\
					  <div>\
						<label for="view' + next + 'SpatiallyResolvedDataFilename">Data File for Spatially Resolved Data: </label>\
						<input id="view' + next + 'SpatiallyResolvedDataFilename" name="view' + next + 'SpatiallyResolvedDataFilename" type="file" />\
					  </div>\
					  <label>Number grid point: </label>\
					  <div class="form-row">\
						<div class="col">\
						  <label for="view' + next + 'XNumPoints">x: </label>\
						  <input type="number" step=1 class="input" id="view' + next + 'XNumPoints" name="view' + next + 'XNumPoints" value="100">\
						</div>\
						<div class="col">\
						  <label for="view' + next + 'YNumPoints">y: </label>\
						  <input type="number" step=1 class="input" id="view' + next + 'YNumPoints" name="view' + next + 'YNumPoints" value="100" disabled>\
						</div>\
						<div class="col">\
						  <label for="view' + next + 'ZNumPoints">z: </label>\
						  <input type="number" step=1 class="input" id="view' + next + 'ZNumPoints" name="view' + next + 'ZNumPoints" value="100" disabled>\
						</div>\
					  </div>\
					  <label>Grid spacing: </label>\
					  <div class="form-row">\
						<div class="col">\
						  <label for="view' + next + 'XSpacing">x: </label>\
						  <input type="number" step=any class="input" id="view' + next + 'XSpacing" name="view' + next + 'XSpacing" value="0.1">\
						</div>\
						<div class="col">\
						  <label for="view' + next + 'YSpacing">y: </label>\
						  <input type="number" step=any class="input" id="view' + next + 'YSpacing" name="view' + next + 'YSpacing" value="0.1" disabled>\
						</div>\
						<div class="col">\
						  <label for="view' + next + 'ZSpacing">z: </label>\
						  <input type="number" step=any class="input" id="view' + next + 'ZSpacing" name="view' + next + 'ZSpacing" value="0.1" disabled>\
						</div>\
					  </div>\
					</div>\
					<div class="form-group" id="view' + next + 'MolecularForm" style="display:none;">\
					  <div>\
						<label for="view' + next + 'MolecularDataFilename">Data File for Molecular Data: </label>\
						<input id="view' + next + 'MolecularDataFilename" name="view' + next + 'MolecularDataFilename" type="file" />\
					  </div>\
					</div>\
				  </div>'
	
		  var newInput = $(newIn);
		  var removeBtn = '<button id="remove' + (next - 1) + '" class="btn btn-danger remove-me" >Remove View</button></div><div id="field">';
		  var removeButton = $(removeBtn);
		  $(addto).after(newInput);
		  //$(addRemove).after(removeButton);
		  //$("#field" + next).attr('data-source',$(addto).attr('data-source'));
		  $("#count").val(next);  
	
		  document.getElementById('boolView' + next + 'CubicCell').onchange = function() {
			document.getElementById('view' + next + 'YDim').disabled = this.checked;
			document.getElementById('view' + next + 'ZDim').disabled = this.checked;
			document.getElementById('view' + next + 'YSpacing').disabled = this.checked;
			document.getElementById('view' + next + 'ZSpacing').disabled = this.checked;
			document.getElementById('view' + next + 'YNumPoints').disabled = this.checked;
			document.getElementById('view' + next + 'ZNumPoints').disabled = this.checked;
		  }; 
	
		  document.getElementById('boolView' + next + 'OrthogonalLattice').onchange = function() {
		  document.getElementById('view' + next + 'LatVec11').disabled = this.checked;
		  document.getElementById('view' + next + 'LatVec12').disabled = this.checked;
		  document.getElementById('view' + next + 'LatVec13').disabled = this.checked;
		  document.getElementById('view' + next + 'LatVec21').disabled = this.checked;
		  document.getElementById('view' + next + 'LatVec22').disabled = this.checked;
		  document.getElementById('view' + next + 'LatVec23').disabled = this.checked;
		  document.getElementById('view' + next + 'LatVec31').disabled = this.checked;
		  document.getElementById('view' + next + 'LatVec32').disabled = this.checked;
		  document.getElementById('view' + next + 'LatVec33').disabled = this.checked;
		};
	
	
		  document.getElementById('view' + next + 'XDim').onchange = function(){
			if (document.getElementById('boolView' + next + 'CubicCell').checked){
			  document.getElementById('view' + next + 'YDim').value = document.getElementById('view' + next + 'XDim').value;
			  document.getElementById('view' + next + 'ZDim').value = document.getElementById('view' + next + 'XDim').value;
			  document.getElementById('view' + next + 'YSpacing').value = document.getElementById('view' + next + 'YDim').value / document.getElementById('view' + next + 'YNumPoints').value;
			  document.getElementById('view' + next + 'ZSpacing').value = document.getElementById('view' + next + 'ZDim').value / document.getElementById('view' + next + 'ZNumPoints').value;
			}
			document.getElementById('view' + next + 'XSpacing').value = document.getElementById('view' + next + 'XDim').value / document.getElementById('view' + next + 'XNumPoints').value;
		  }
		  
		  document.getElementById('view' + next + 'XSpacing').onchange = function(){
			if (document.getElementById('boolView' + next + 'CubicCell').checked){
			  document.getElementById('view' + next + 'YSpacing').value = document.getElementById('view' + next + 'XSpacing').value;
			  document.getElementById('view' + next + 'ZSpacing').value = document.getElementById('view' + next + 'XSpacing').value;
			  document.getElementById('view' + next + 'YNumPoints').value = document.getElementById('view' + next + 'YDim').value / document.getElementById('view' + next + 'YSpacing').value;
			  document.getElementById('view' + next + 'ZNumPoints').value = document.getElementById('view' + next + 'ZDim').value / document.getElementById('view' + next + 'ZSpacing').value;
			}
			document.getElementById('view' + next + 'XNumPoints').value = document.getElementById('view' + next + 'XDim').value / document.getElementById('view' + next + 'XSpacing').value;
		  }
		  document.getElementById('view' + next + 'XNumPoints').onchange = function(){
			if (document.getElementById('boolView' + next + 'CubicCell').checked){
			  document.getElementById('view' + next + 'YNumPoints').value = document.getElementById('view' + next + 'XNumPoints').value;
			  document.getElementById('view' + next + 'ZNumPoints').value = document.getElementById('view' + next + 'XNumPoints').value;
			  document.getElementById('view' + next + 'YSpacing').value = document.getElementById('view' + next + 'YDim').value / document.getElementById('view' + next + 'YNumPoints').value;
			  document.getElementById('view' + next + 'ZSpacing').value = document.getElementById('view' + next + 'ZDim').value / document.getElementById('view' + next + 'ZNumPoints').value;
			}
			document.getElementById('view' + next + 'XSpacing').value = document.getElementById('view' + next + 'XDim').value / document.getElementById('view' + next + 'XNumPoints').value;
		  }
	
		  document.getElementById('view' + next + 'YDim').onchange = function(){
			document.getElementById('view' + next + 'YSpacing').value = document.getElementById('view' + next + 'YDim').value / document.getElementById('view' + next + 'YNumPoints').value;
		  }
		  document.getElementById('view' + next + 'ZDim').onchange = function(){
			document.getElementById('view' + next + 'ZSpacing').value = document.getElementById('view' + next + 'ZDim').value / document.getElementById('view' + next + 'ZNumPoints').value;
		  }
		  document.getElementById('view' + next + 'YSpacing').onchange = function(){
			document.getElementById('view' + next + 'YNumPoints').value = document.getElementById('view' + next + 'YDim').value / document.getElementById('view' + next + 'YSpacing').value;
		  }
		  document.getElementById('view' + next + 'ZSpacing').onchange = function(){
			document.getElementById('view' + next + 'ZNumPoints').value = document.getElementById('view' + next + 'ZDim').value / document.getElementById('view' + next + 'ZSpacing').value;
		  }
		  document.getElementById('view' + next + 'YNumPoints').onchange = function(){
			document.getElementById('view' + next + 'YSpacing').value = document.getElementById('view' + next + 'YDim').value / document.getElementById('view' + next + 'YNumPoints').value;
		  }
		  document.getElementById('view' + next + 'ZNumPoints').onchange = function(){
			document.getElementById('view' + next + 'ZSpacing').value = document.getElementById('view' + next + 'ZDim').value / document.getElementById('view' + next + 'ZNumPoints').value;
		  }
	
	
		  
	
		  for (var i = 0; i < NUMBER3DVIEWS; i++) { 
			var tempSpatiallyResolvedFormID = "view" + (i+1) + "SpatiallyResolvedForm";
			if (document.getElementById('boolSpatiallyResolvedData').checked){
			  document.getElementById(tempSpatiallyResolvedFormID).style.display = "block";
			}
			else{
			  document.getElementById(tempSpatiallyResolvedFormID).style.display = "none";
			}
		  } 
	
		  for (var i = 0; i < NUMBER3DVIEWS; i++) { 
			var tempMolecularFormID = "view" + (i+1) + "MolecularForm";
			if (document.getElementById('boolMolecularData').checked){
			  document.getElementById(tempMolecularFormID).style.display = "block";
			}
			else{
			  document.getElementById(tempMolecularFormID).style.display = "none";
			}
		  } 
		  
		  /*
			  $('.remove-me').click(function(e){
				  e.preventDefault();
				  var fieldNum = this.id.charAt(this.id.length-1);
				  var fieldID = "#view" + fieldNum + "Form";
				  console.log(fieldID)
				  $(this).remove();
				  $(fieldID).remove();
			  });
			  */
	  });   
	});
	
	
	// SPLIT BETWEEN SCRIPT TAGS
	
	document.getElementById('boolSpatiallyResolvedData').onchange = function() {
	  document.getElementById('propertyListSpatiallyResolved').disabled = !this.checked;
	  document.getElementById('densityProperty').disabled = !this.checked;
	  document.getElementById('densityCutoffLow').disabled = !this.checked;
	  document.getElementById('densityCutoffUp').disabled = !this.checked;
	  if (this.checked){
		document.getElementById('propertyListSpatiallyResolvedForm').style.display = "block";
		document.getElementById('densityPropertyForm').style.display = "block";
		document.getElementById('densityCutoffLowForm').style.display = "block";
		document.getElementById('densityCutoffUpForm').style.display = "block";
	  }
	  else{
		document.getElementById('propertyListSpatiallyResolvedForm').style.display = "none";
		document.getElementById('densityPropertyForm').style.display = "none";
		document.getElementById('densityCutoffLowForm').style.display = "none";
		document.getElementById('densityCutoffUpForm').style.display = "none";
	  }
	
	  for (var i = 0; i < NUMBER3DVIEWS; i++) { 
		var tempSpatiallyResolvedFormID = "view" + (i+1) + "SpatiallyResolvedForm";
		if (this.checked){
		  document.getElementById(tempSpatiallyResolvedFormID).style.display = "block";
		}
		else{
		  document.getElementById(tempSpatiallyResolvedFormID).style.display = "none";
		}
	  } 
	
	  if (document.getElementById('boolSpatiallyResolvedData').checked  || document.getElementById('boolMolecularData').checked ){
		document.getElementById('formSubmitButton').disabled = false;
		document.getElementById('saveConfigButton').disabled = false;
		
	  }
	  else{
		document.getElementById('formSubmitButton').disabled = true;
		document.getElementById('saveConfigButton').disabled = true;
	  }
	  
	};
	
	document.getElementById('boolMolecularData').onchange = function() {
	  document.getElementById('propertyListMolecular').disabled = !this.checked;
	  if (this.checked){
		document.getElementById('propertyListMolecularForm').style.display = "block";
	  }
	  else{
		document.getElementById('propertyListMolecularForm').style.display = "none";
	  }
	
	  for (var i = 0; i < NUMBER3DVIEWS; i++) { 
		var tempMolecularFormID = "view" + (i+1) + "MolecularForm";
		if (this.checked){
		  document.getElementById(tempMolecularFormID).style.display = "block";
		}
		else{
		  document.getElementById(tempMolecularFormID).style.display = "none";
		}
	  } 
	
	  if (document.getElementById('boolSpatiallyResolvedData').checked  || document.getElementById('boolMolecularData').checked ){
		document.getElementById('formSubmitButton').disabled = false;
		document.getElementById('saveConfigButton').disabled = false;
	  }
	  else{
		document.getElementById('formSubmitButton').disabled = true;
		document.getElementById('saveConfigButton').disabled = true;
	  }
	  
	};
	
	document.getElementById('boolFramedData').onchange = function() {
	  document.getElementById('frameProperty').disabled = !this.checked;
	  if (this.checked){
		document.getElementById('framePropertyForm').style.display = "block";
	  }
	  else{
		document.getElementById('framePropertyForm').style.display = "none";
	  }
	};
	
	
	document.getElementById('boolView1CubicCell').onchange = function() {
	  document.getElementById('view1YDim').disabled = this.checked;
	  document.getElementById('view1ZDim').disabled = this.checked;
	  document.getElementById('view1YSpacing').disabled = this.checked;
	  document.getElementById('view1ZSpacing').disabled = this.checked;
	  document.getElementById('view1YNumPoints').disabled = this.checked;
	  document.getElementById('view1ZNumPoints').disabled = this.checked;
	}; 
	
	document.getElementById('boolView1OrthogonalLattice').onchange = function() {
	  document.getElementById('view1LatVec11').disabled = this.checked;
	  document.getElementById('view1LatVec12').disabled = this.checked;
	  document.getElementById('view1LatVec13').disabled = this.checked;
	  document.getElementById('view1LatVec21').disabled = this.checked;
	  document.getElementById('view1LatVec22').disabled = this.checked;
	  document.getElementById('view1LatVec23').disabled = this.checked;
	  document.getElementById('view1LatVec31').disabled = this.checked;
	  document.getElementById('view1LatVec32').disabled = this.checked;
	  document.getElementById('view1LatVec33').disabled = this.checked;
	};
	
	document.getElementById('view1XDim').onchange = function(){
	  if (document.getElementById('boolView1CubicCell').checked){
		document.getElementById('view1YDim').value = document.getElementById('view1XDim').value;
		document.getElementById('view1ZDim').value = document.getElementById('view1XDim').value;
		document.getElementById('view1YSpacing').value = document.getElementById('view1YDim').value / document.getElementById('view1YNumPoints').value;
		document.getElementById('view1ZSpacing').value = document.getElementById('view1ZDim').value / document.getElementById('view1ZNumPoints').value;
	  }
	  document.getElementById('view1XSpacing').value = document.getElementById('view1XDim').value / document.getElementById('view1XNumPoints').value;
	}
	document.getElementById('view1XSpacing').onchange = function(){
	  if (document.getElementById('boolView1CubicCell').checked){
		document.getElementById('view1YSpacing').value = document.getElementById('view1XSpacing').value;
		document.getElementById('view1ZSpacing').value = document.getElementById('view1XSpacing').value;
		document.getElementById('view1YNumPoints').value = document.getElementById('view1YDim').value / document.getElementById('view1YSpacing').value;
		document.getElementById('view1ZNumPoints').value = document.getElementById('view1ZDim').value / document.getElementById('view1ZSpacing').value;
	  }
	  document.getElementById('view1XNumPoints').value = document.getElementById('view1XDim').value / document.getElementById('view1XSpacing').value;
	}
	document.getElementById('view1XNumPoints').onchange = function(){
	  if (document.getElementById('boolView1CubicCell').checked){
		document.getElementById('view1YNumPoints').value = document.getElementById('view1XNumPoints').value;
		document.getElementById('view1ZNumPoints').value = document.getElementById('view1XNumPoints').value;
		document.getElementById('view1YSpacing').value = document.getElementById('view1YDim').value / document.getElementById('view1YNumPoints').value;
		document.getElementById('view1ZSpacing').value = document.getElementById('view1ZDim').value / document.getElementById('view1ZNumPoints').value;
	  }
	  document.getElementById('view1XSpacing').value = document.getElementById('view1XDim').value / document.getElementById('view1XNumPoints').value;
	}
	
	document.getElementById('view1YDim').onchange = function(){
	  document.getElementById('view1YSpacing').value = document.getElementById('view1YDim').value / document.getElementById('view1YNumPoints').value;
	}
	document.getElementById('view1ZDim').onchange = function(){
	  document.getElementById('view1ZSpacing').value = document.getElementById('view1ZDim').value / document.getElementById('view1ZNumPoints').value;
	}
	document.getElementById('view1YSpacing').onchange = function(){
	  document.getElementById('view1YNumPoints').value = document.getElementById('view1YDim').value / document.getElementById('view1YSpacing').value;
	}
	document.getElementById('view1ZSpacing').onchange = function(){
	  document.getElementById('view1ZNumPoints').value = document.getElementById('view1ZDim').value / document.getElementById('view1ZSpacing').value;
	}
	document.getElementById('view1YNumPoints').onchange = function(){
	  document.getElementById('view1YSpacing').value = document.getElementById('view1YDim').value / document.getElementById('view1YNumPoints').value;
	}
	document.getElementById('view1ZNumPoints').onchange = function(){
	  document.getElementById('view1ZSpacing').value = document.getElementById('view1ZDim').value / document.getElementById('view1ZNumPoints').value;
	}
	
	



	// END INDEX JS


	if (document.getElementById("uploader_wrapper") != null){
		
		const uploader = document.getElementById("uploader");
		const uploader_wrapper = document.getElementById("uploader_wrapper");
		uploader.addEventListener("change", handleFiles, false);

		const configForm = document.getElementById("form_wrapper");
		const divider = document.getElementById("divider");

		$(".save-config").click(function(e){
			const CONFIG = readInputForm();
			download(CONFIG, 'config.json', 'application/json');
		})

		$( "form" ).submit(function( event ) {

			const CONFIG = readInputForm();
		    console.log("read input form");
			event.preventDefault();
			
			//clears out the initial form layout
		    uploader.parentNode.removeChild(uploader);
			uploader_wrapper.parentNode.removeChild(uploader_wrapper);	
			configForm.parentNode.removeChild(configForm);
			divider.parentNode.removeChild(divider);

			handleViewSetup(CONFIG);
		});

	}
	else{
		console.log("error");
	}
}



function handleFiles() {

	const file = this.files[0];

	$.ajax({
		url: file.path,
		dataType: 'json',
		type: 'get',
		cache: false,
		success: function(data) {
			console.log("read pre defined config");
			handleViewSetup(data);
		},
		error: function(requestObject, error, errorThrown) {
	        alert(error);
	        alert(errorThrown);
	    }
	})
}


function handleViewSetup(data){
	// initializes loading bar
	document.getElementById("UI").innerHTML = "<div id='loading_progress' class='inner card border-success'><h3>ElectroLoading</h3><div class='progress'><div class='progress-bar progress-bar-striped progress-bar-animated active' id='loading-progress' role='progressbar' style='width: 5%;'></div></div><div id='loading-message'></div></div>";
	const views = data.views;
	const plotSetup = data.plotSetup;
	initializeViewSetups(views,plotSetup);
	document.getElementById("loading-progress").style["width"] = "10%";
	main(views,plotSetup);

}

function main(views,plotSetup) {
	if ( ! Detector.webgl ) Detector.addGetWebGLMessage();
	
	let container, stats, renderer, effect;
	let mouseX = 0, mouseY = 0;
	// var windowWidth, windowHeight;
	plotSetup.windowWidth  = window.innerWidth;
	plotSetup.windowHeight = window.innerHeight;
	let clickRequest = false;
	let mouseHold = false;
	let mouseDrag = false;
	
	// var continuousSelection = false;

	let activeView = views[0];

	let showOptionBoxesBool = true;
	let overallSpatiallyResolvedData = [];
	let overallMoleculeData = [];

	//initializeViewSetups(views,plotSetup);

	
	const queue=d3.queue();
	let queueLength = 0;

	for (let ii =  0; ii < views.length; ++ii ) {
		let view = views[ii];
		view.plotSetup = plotSetup;

		if (plotSetup.frameProperty != null){
			console.log("use MD mode");
			view.frameBool = true;
			view.frameProperty = plotSetup.frameProperty;
		}
		else{
			console.log("use normal mode");
			view.frameBool = false;
			view.frameProperty = "__frame__";
		}
		
		if (view.viewType == '3DView'){
			if(view.spatiallyResolvedData != null && view.spatiallyResolvedData.data != null){
				queue.defer(processSpatiallyResolvedData,view,plotSetup);
				queueLength++;
			}
			else if (view.spatiallyResolvedData != null && view.spatiallyResolvedData.dataFilename != null){
				queue.defer(readCSVSpatiallyResolvedData,view,plotSetup);
				queueLength++;
			}
			else {
				console.log('no spatially resolved data loaded');
			}

			if(view.moleculeData != null && view.moleculeData.data != null){
				queue.defer(processMoleculeData,view,plotSetup);
				queueLength++;
			}
			else if (view.moleculeData != null && view.moleculeData.dataFilename != null){
				queue.defer(readCSVMoleculeData,view,plotSetup);
				queueLength++;
			}	
			else {
				console.log('no molecule data loaded');
			}
		}			
	}
	console.log("count for queue length: " + queueLength.toString());
	queueLength = 90.0 / queueLength;
	// queueLength attribute is the percentage progress assigned to each queue item
	document.getElementById("loading-progress").setAttribute("queueLength",queueLength);

	queue.awaitAll(function(error) {
		if (error) throw error;

		combineData(views, overallSpatiallyResolvedData,overallMoleculeData);
		init();
		
		const htmlUI = document.getElementById("UI");
		htmlUI.parentNode.removeChild(htmlUI);
		render(views, plotSetup);
		animate();
	});


	function init() {
		
		console.log('started initialization')
		//const { UMAP } = require('umap-js');
		container = document.getElementById( 'container' );
		renderer = new THREE.WebGLRenderer( { antialias: false, alpha: true, clearAlpha: 1, preserveDrawingBuffer: true } );
		renderer.setPixelRatio( window.devicePixelRatio );
		renderer.setSize( window.innerWidth , window.innerHeight);
		//effect = new THREE.AnaglyphEffect( renderer );
		//effect.setSize( window.innerWidth , window.innerHeight);

		renderer.autoClear = false;

		renderer.shadowMap.enabled = true;
		renderer.shadowMapEnabled = true;
		renderer.shadowMapSoft = true;

		plotSetup.renderer = renderer;

		container.appendChild( renderer.domElement );

		plotSetup.active2DPlotSpatiallyResolved = null;
		plotSetup.active2DPlotMolecule = null;

		let defaultScalesSpatiallyResolvedData, defaultScalesMoleculeData;

		if (overallSpatiallyResolvedData.length > 0) {
			defaultScalesSpatiallyResolvedData = calcDefaultScalesSpatiallyResolvedData(plotSetup,overallSpatiallyResolvedData);
		}

		if (overallMoleculeData.length > 0) {
			defaultScalesMoleculeData = calcDefaultScalesMoleculeData(plotSetup,overallMoleculeData);
		}
		

		for (let ii =  0; ii < views.length; ++ii ) {
			let view = views[ii];

			view.overallSpatiallyResolvedData = overallSpatiallyResolvedData;
			view.overallMoleculeData = overallMoleculeData;

			if (view.frameBool){
				if ( view.systemMoleculeData != null && view.systemMoleculeData.length > 0){
					const frameValue = function(d) {return d[view.frameProperty];}
					view.frameMin = d3.min(view.systemMoleculeData,frameValue);
					view.frameMax = d3.max(view.systemMoleculeData,frameValue);
					view.options.currentFrame = view.frameMin;
					console.log("starting frame, from molecule data ",view.options.currentFrame);
				}
				else{
					if (view.systemSpatiallyResolvedData != null && view.systemSpatiallyResolvedData.length > 0){
						const frameValue = function(d) {return d[view.frameProperty];}
						view.frameMin = d3.min(view.systemSpatiallyResolvedData,frameValue);
						view.frameMax = d3.max(view.systemSpatiallyResolvedData,frameValue);
						view.options.currentFrame = view.frameMin;
						console.log("starting frame, from sp data ",view.options.currentFrame);
					}
					else{
						alert("error when calculating frame min and max, double check your input")
					}
				}
			}

			setupViewCameraSceneController(view,renderer);
			addOptionBox(view);
			setupHUD(view);

			view.controller.addEventListener( 'change', function( event ) {
				render(views, plotSetup);
			} );

			if (view.viewType == '3DView'){
				view.controller.autoRotate = false;
				view.options.plotID = "3D_View_" + ii;

							

				if (view.systemSpatiallyResolvedData != null && view.systemSpatiallyResolvedData.length > 0){
					
					view.systemSpatiallyResolvedDataBoolean = true;
					view.defaultScalesSpatiallyResolvedData = defaultScalesSpatiallyResolvedData;
					adjustColorScaleAccordingToDefaultSpatiallyResolvedData(view);
					getPointCloudGeometry(view);
					insertLegend(view);
				}
				if (view.systemMoleculeData != null && view.systemMoleculeData.length > 0){
					console.log("adding moleulce")
					view.systemMoleculeDataBoolean = true;
					view.defaultScalesMoleculeData = defaultScalesMoleculeData;
					adjustScaleAccordingToDefaultMoleculeData(view);
					arrangeMoleculeDataToFrame2(view);
					getMoleculeGeometry(view);
					//insertLegend(view);
					
				}

				setupOptionBox3DView(view,plotSetup);
				addSystemEdge(view);
				initialize3DViewTooltip(view);	
			}
			if (view.viewType == '2DHeatmap'){

				view.controller.enableRotate = false;
				view.options.plotID = "2D_Plot_" + ii;
				 

				if (overallSpatiallyResolvedData.length > 0){
					view.overallSpatiallyResolvedDataBoolean = true;
				}
				if (overallMoleculeData.length > 0){
					view.overallMoleculeDataBoolean = true;
				}

				initialize2DPlotTooltip(view);
				setupOptionBox2DHeatmap(view,plotSetup);
				
				addTitle(view);
				
			}

		}
		
		
		stats = new Stats();
		container.appendChild( stats.dom );

		container.addEventListener( 'mousemove', throttle(onDocumentMouseMove, 20), false );
		container.addEventListener( 'click', onDocumentMouseClick,  false );
		container.addEventListener( 'mousedown', function( event ) {
			mouseHold = true;
			if (event.button == 0){
				clickRequest = true;
			}
		}, false );
		container.addEventListener( 'mouseup', function( event ) {
			mouseHold = false;
			mouseDrag = false;
			if (event.button == 0){
				if (activeView.viewType == '2DHeatmap') {
					if (activeView.options.planeSelection){
						updatePlaneSelection(views,activeView);
						activeView.scene.remove(activeView.currentSelectionPlane);
						activeView.currentSelectionPlane = null;
					}
					if (activeView.options.brushSelection){
						//updateBrushSelection(views,activeView);
						activeView.scene.remove(activeView.currentSelectionBrush);
						activeView.currentSelectionBrush = null;
					}
				}
			}
		}, false );

		window.addEventListener( "keydown", onKeyDown, true);
		
	}




	function onKeyDown(e){
		if (e.keyCode == 72) {showHideAllOptionBoxes(views,showOptionBoxesBool); showOptionBoxesBool = !showOptionBoxesBool;}
		if (e.keyCode == 70) {
			for (let ii =  0; ii < views.length; ++ii ) {
				let view = views[ii];
				if (view.controllerEnabled) {
					view.options.toggleFullscreen.call();
				}
			}
			render(views, plotSetup);
		}
		if (e.keyCode == 76) {
			for (let ii =  0; ii < views.length; ++ii ) {
				let view = views[ii];
				if (view.controllerEnabled) {view.options.toggleLegend.call();}
			}
			render(views, plotSetup);
		}
		if (e.keyCode == 49) {
			//planeSelection = !planeSelection;
			//pointSelection = false;
			activeView.options.planeSelection = !activeView.options.planeSelection;
			activeView.options.brushSelection = false;
			activeView.gui.updateDisplay();
		}
		if (e.keyCode == 50) {
			//pointSelection = !pointSelection;
			//planeSelection = false;
			activeView.options.brushSelection = !activeView.options.brushSelection;
			activeView.options.planeSelection = false;
			activeView.gui.updateDisplay();
		}
		if (e.keyCode == 107 || e.keyCode == 65) {
			const temp_view = {"viewType": "2DHeatmap"}
			temp_view.plotSetup = plotSetup;
			
			if (overallSpatiallyResolvedData.length > 0){
				temp_view["plotXSpatiallyResolvedData"] = plotSetup.spatiallyResolvedPropertyList[0]
				temp_view["plotYSpatiallyResolvedData"] = plotSetup.spatiallyResolvedPropertyList[0]
				temp_view["plotXTransformSpatiallyResolvedData"] = "linear"
				temp_view["plotYTransformSpatiallyResolvedData"] = "linear"
			}
			if (overallMoleculeData.length > 0){
				temp_view["plotXMoleculeData"] = plotSetup.moleculePropertyList[0]
				temp_view["plotYMoleculeData"] = plotSetup.moleculePropertyList[0]
				temp_view["plotXTransformMoleculeData"] = "linear"
				temp_view["plotYTransformMoleculeData"] = "linear"
			}

			
			views.push(temp_view);
			initialize2DHeatmapSetup(temp_view,views,plotSetup);
			temp_view.options.plotID = "2D_Plot_" + views.length;
			calculateViewportSizes(views);

			temp_view.overallSpatiallyResolvedData = overallSpatiallyResolvedData;
			temp_view.overallMoleculeData = overallMoleculeData;
			if (overallSpatiallyResolvedData.length > 0){
				temp_view.overallSpatiallyResolvedDataBoolean = true;
			}
			if (overallMoleculeData.length > 0){
				temp_view.overallMoleculeDataBoolean = true;
			}

			if (temp_view.overallSpatiallyResolvedDataBoolean==false){
				temp_view.options.plotData = "moleculeData";
			}

			setupViewCameraSceneController(temp_view,renderer);
			addOptionBox(temp_view);
			setupHUD(temp_view);
			temp_view.controller.addEventListener( 'change', function( event ) {
				render(views, plotSetup);
			} );

			
			temp_view.controller.enableRotate=false;
			initialize2DPlotTooltip(temp_view);
			setupOptionBox2DHeatmap(temp_view,plotSetup);
			updateOptionBoxLocation(views);
			addTitle(temp_view)
			render(views, plotSetup);
			

			/*
			getAxis(temp_view);
			;
			arrangeDataToHeatmap(temp_view)
			getHeatmap(temp_view);
			addHeatmapLabels(temp_view);
			insertLegend(temp_view);*/
			
			//update2DHeatmapTitlesLocation(views);
				
			
		}
	}

	

	function updateActiveView(views){
		for ( let ii = 0; ii < views.length; ++ii ){
			let view = views[ii];
			if (view.controllerEnabled){
				return view;
			}
		}
	}

	

	function onDocumentMouseMove( mouseEvent ) {
		mouseX = mouseEvent.clientX;
		mouseY = mouseEvent.clientY;
		for ( let ii = 0; ii < views.length; ++ii ){
			const view = views[ii];
			const left   = Math.floor( plotSetup.windowWidth  * view.left );
			const top    = Math.floor( plotSetup.windowHeight * view.top );
			// var width  = Math.floor( windowWidth  * view.width ) + left;
			// var height = Math.floor( windowHeight * view.height ) + top;
			const vector = new THREE.Vector3();
		
			vector.set(	(((mouseEvent.clientX-left)/Math.floor( plotSetup.windowWidth  * view.width )) * 2 - 1),
						(-((mouseEvent.clientY-top)/Math.floor( plotSetup.windowHeight * view.height )) * 2 + 1),
						0.1);
			vector.unproject( view.camera );
			const dir = vector.sub( view.camera.position ).normalize();
			const distance = - view.camera.position.z/dir.z;
			view.mousePosition = view.camera.position.clone().add( dir.multiplyScalar( distance ) );
			// selectionControl(views, activeView, mouseHold);
		}

		if (mouseHold == false){
			updateController(views, plotSetup.windowWidth, plotSetup.windowHeight, mouseX, mouseY);
			activeView = updateActiveView(views);
		}
		else {
			mouseDrag = true;
			processSelection();
			render(views, plotSetup);
			return;
		}
		


		for ( let ii = 0; ii < views.length; ++ii ){
			const view = views[ii];
			if (view.controllerEnabled){
				if (view.viewType == "2DHeatmap"){
					if ((view.options.plotType == "Heatmap" || view.options.plotType == "Comparison"
						|| view.options.plotType == "PCA" || view.options.plotType == "Umap") 
						&& typeof view.heatmapPlot != "undefined"){

						if (view.options.plotData == "spatiallyResolvedData") {
							const needsUpdate = hoverHeatmap(view,mouseEvent);
							if (needsUpdate) {
								console.log('updating plots');
								updateAllPlotsSpatiallyResolved(views);
							}
						} else if (view.options.plotData == "moleculeData") {
							const needsUpdate = hoverHeatmap(view,mouseEvent);
							if (needsUpdate) {
								console.log('updating plots');
								updateAllPlotsMolecule(views);
							}
						}
					}
					if (view.options.plotType == "Correlation" && typeof view.covariancePlot != "undefined"){
						updateCovarianceTooltip(view);
					}
				} else if (view.viewType == "3DView") {
					if (view.systemMoleculeDataBoolean && view.options.interactiveMolecule ) {
						if (view.options.atomsStyle == "ball") {
							const pickingResult = gpuPickMolecule(view, renderer, view.scene,mouseEvent, plotSetup.windowWidth, plotSetup.windowHeight);
							const needsUpdate = hover3DViewMoleculeBall(view, plotSetup, pickingResult);
							if (needsUpdate) {
								updateAllPlotsMoleculeScale(views);
							}
						} else if (view.options.atomsStyle == "sprite"){
							const needsUpdate = hover3DViewMoleculeSprite(view, plotSetup, mouseEvent);
							if (needsUpdate) {
								updateAllPlotsMoleculeScale(views);
							}
						}
					}

					if (view.systemSpatiallyResolvedDataBoolean && view.options.interactiveSpatiallyResolved) {
						const needsUpdate = hover3DViewSpatiallyResolved(view, plotSetup, mouseEvent);
						if (needsUpdate) {
							updateAllPlotsSpatiallyResolved(views);
						}
					}
					
				}
			}
		}
		render(views, plotSetup);
	}

	function onDocumentMouseClick( mouseEvent ) {
		if (mouseDrag) {
			return;
		}
		
		for ( let ii = 0; ii < views.length; ++ii ){
			const view = views[ii];
			if (view.controllerEnabled){
				if (view.viewType == "2DHeatmap"){
					if ((view.options.plotType == "Heatmap" || view.options.plotType == "Comparison"
						|| view.options.plotType == "PCA" || view.options.plotType == "Umap")  && 
						typeof view.heatmapPlot != "undefined" &&
						!(view.options.planeSelection || view.options.brushSelection)){
							if (view.options.plotData == "spatiallyResolvedData") {
								const needsUpdate = clickHeatmap(view, views);
								if (needsUpdate) {
									updateAllPlotsSpatiallyResolved(views);
								}
							} else if (view.options.plotData == "moleculeData") {
								const needsUpdate = clickHeatmap(view, views);
								if (needsUpdate) {
									updateAllPlotsMolecule(views);
								}
							}
						
						// updateHeatmapTooltip(view);
					}
				} 
				else if (view.viewType == "3DView") {
					if (view.systemMoleculeDataBoolean && view.options.interactiveMolecule) {
						const needsUpdate = click3DViewMolecule(view, views, plotSetup);
						if (needsUpdate) {
							updateAllPlotsMolecule(views);
						}
					}

					if (view.systemSpatiallyResolvedDataBoolean && view.options.interactiveSpatiallyResolved) {
						const needsUpdate = click3DViewSpatiallyResolved(view, views, plotSetup);
						if (needsUpdate) {
							updateAllPlotsSpatiallyResolved(views);
						}
					}
				}
			}
		}
		render(views, plotSetup);
	}


	function animate() {
		// render();
		//processClick();
		// processSelection( );
		stats.update();

		requestAnimationFrame( animate );
	}


	

	function processSelection(){
		if (activeView != null){
			if (activeView.viewType == '2DHeatmap') {
				selectionControl(views, activeView, mouseHold);
			}
		}
	}
}


export function render(views, plotSetup) {
	try {
		const renderer = plotSetup.renderer;
		updateSize(views, plotSetup);
		for ( let ii = 0; ii < views.length; ++ii ) {

			const view = views[ii];
			
			const camera = view.camera;
			
			const width  = Math.floor( plotSetup.windowWidth  * view.width );
			const height = Math.floor( plotSetup.windowHeight * view.height );
			const left   = Math.floor( plotSetup.windowWidth  * view.left );
			const top    = Math.floor( plotSetup.windowHeight * (1-view.top) - height );
			// console.log('top', view.top,(1-view.top), top)

			view.windowLeft = left;
			view.windowTop = plotSetup.windowHeight * view.top;
			view.windowWidth = width;
			view.windowHeight = height;

			renderer.setViewport( left, top, width, height );
			renderer.setScissor( left, top, width, height );
			//renderer.clearDepth(); // important for draw fat line
			renderer.setScissorTest( true );
			renderer.setClearColor( 0xffffff, 1 ); // border color
			renderer.clearColor(); // clear color buffer
			renderer.setClearColor( view.background, view.backgroundAlpha);
			//if (view.controllerEnabled) {renderer.setClearColor( view.controllerEnabledBackground );}
			//else {renderer.setClearColor( view.background );}

			if (view.options.cameraType === "perspective"){
				camera.aspect = width / height;
				camera.updateProjectionMatrix();
			}
			if (view.options.cameraType === "orthographic"){
				const aspect = width / height;
				camera.left = view.options.cameraFrustumSize * aspect / - 2;
				camera.right = view.options.cameraFrustumSize  * aspect / 2;
				camera.top = view.options.cameraFrustumSize  / 2;
				camera.bottom = - view.options.cameraFrustumSize  / 2;

				camera.updateProjectionMatrix();

			}
			
			renderer.clear();
			renderer.render( view.scene, camera );
			//effect.render( view.scene, camera  );
			renderer.render( view.sceneHUD, view.cameraHUD );
		}
		// console.log('end render')
	}
	catch (err) {
		console.log('render error', err)
	}
	
}

function updateSize(views, plotSetup) {
	if ( plotSetup.windowWidth != window.innerWidth || plotSetup.windowHeight != window.innerHeight) {
		plotSetup.windowWidth  = window.innerWidth;
		plotSetup.windowHeight = window.innerHeight;
		plotSetup.renderer.setSize ( plotSetup.windowWidth, plotSetup.windowHeight );

		for ( let ii = 0; ii < views.length; ++ii ){
			const view = views[ii];
				
			const width  = Math.floor( plotSetup.windowWidth  * view.width );
			const height = Math.floor( plotSetup.windowHeight * view.height );
			const left   = Math.floor( plotSetup.windowWidth  * view.left );
			const top    = Math.floor( plotSetup.windowHeight * (1-view.top) - height );

			view.windowLeft = left;
			view.windowTop = plotSetup.windowHeight * view.top;
			view.windowWidth = width;
			view.windowHeight = height;
		}

		updateOptionBoxLocation(views);
		update2DHeatmapTitlesLocation(views);
	}
}


function throttle(callback, interval) {
	let enableCall = true;
  
	return function(...args) {
	  if (!enableCall) return;
  
	  enableCall = false;
	  callback.apply(this, args);
	  setTimeout(() => enableCall = true, interval);
	}
}