export function activate2DPlotSpatiallyResolved(plotSetup, view, views) {
    for (var ii =  0; ii < views.length; ++ii ) {
        var tempView = views[ii];
        tempView.options.activeViewSpatiallyResolved = false;
        tempView.gui.updateDisplay();
    }
    view.options.activeViewSpatiallyResolved = true;
    view.gui.updateDisplay();
    plotSetup.active2DPlotSpatiallyResolved = view;
    console.log('activating view sp',plotSetup.active2DPlotSpatiallyResolved)

}

export function deactivate2DPlotsSpatiallyResolved(plotSetup, views){
    for (var ii =  0; ii < views.length; ++ii ) {
        var tempView = views[ii];
        tempView.options.activeViewSpatiallyResolved = false;
        tempView.gui.updateDisplay();
    }
    plotSetup.active2DPlotSpatiallyResolved = null;
    console.log('deactivating view sp',plotSetup.active2DPlotSpatiallyResolved)
}

export function activate2DPlotMolecule(plotSetup, view, views) {
    for (var ii =  0; ii < views.length; ++ii ) {
        var tempView = views[ii];
        tempView.options.activeViewMolecule = false;
        tempView.gui.updateDisplay();
    }
    view.options.activeViewMolecule = true;
    view.gui.updateDisplay();
    plotSetup.active2DPlotMolecule = view;
    console.log('activating view m',plotSetup.active2DPlotMolecule)

}

export function deactivate2DPlotsMolecule(plotSetup, views){
    for (var ii =  0; ii < views.length; ++ii ) {
        var tempView = views[ii];
        tempView.options.activeViewMolecule = false;
        tempView.gui.updateDisplay();
    }
    plotSetup.active2DPlotMolecule = null;
    console.log('deactivating view m',plotSetup.active2DPlotMolecule)
}