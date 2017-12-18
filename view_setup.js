var views = [
	{
		viewType: '3DView',
		moleculeName: 'CO2',
		dataFilename: "data/CO2_B3LYP_0_0_0_all_descriptors.csv"
	},
	{
		viewType: '3DView',
		moleculeName: 'H2O',
		dataFilename: "data/H2O_B3LYP_0_0_0_all_descriptors.csv"
	},
	{
		viewType: '2DHeatmap',
		plotX: 'gamma',
		plotY: 'epxc',
		plotXTransform: 'linear',
		plotYTransform: 'linear'
	},
	{
		viewType: '2DHeatmap',
		plotX: 'n',
		plotY: 'epxc',
		plotXTransform: 'linear',
		plotYTransform: 'linear'
	},				
	{
		viewType: '2DHeatmap',
		plotX: 'gamma',
		plotY: 'epxc',
		plotXTransform: 'linear',
		plotYTransform: 'neglog10'
	},
	
	{
		viewType: '2DHeatmap',
		plotX: 'n',
		plotY: 'epxc',
		plotXTransform: 'log10',
		plotYTransform: 'neglog10'
	}
];

var plotSetup = {
	propertyList: ['x','y','z','n','gamma','epxc','deriv1','deriv2'],
	pointcloudDensity: 'n',
	

}

export {views};