"""
Communicate between Python and Javascript asynchronously using
inter-process messaging with the use of Javascript Bindings.
"""

from cefpython3 import cefpython as cef
import os
from ase import Atoms
from ase.io.trajectory import TrajectoryReader


def view(data):
    #print type(data)
    if isinstance(data, Atoms):
        config = atomsToConfig(data)
    elif isinstance(data, TrajectoryReader):
        config = trajToConfig(data)
    else:
        config = data
    cef.Initialize()
    cwd = os.getcwd()
    try:
        os.chdir("ElectroLens-python")
    except:
        pass
    browser = cef.CreateBrowserSync(url='file://' + os.path.realpath("index_cefpython.html"),
                                    window_title="Javascript Bindings")
    os.chdir(cwd)
    browser.SetClientHandler(LoadHandler(config))
    bindings = cef.JavascriptBindings()
    browser.SetJavascriptBindings(bindings)
    cef.MessageLoop()
    del browser
    cef.Shutdown()
    return 

def atomsToConfig(a):
    #print "converting atoms to config"
    systemDimension = {}
    systemDimension["x"] = [0,a.cell[0][0]]
    systemDimension["y"] = [0,a.cell[1][1]]
    systemDimension["z"] = [0,a.cell[2][2]]

    config = {}

    config["views"] = []
    temp = {}
    temp["viewType"] = "3DView"
    temp["moleculeName"] = "test"
    temp["moleculeData"] = {}
    temp["moleculeData"]["data"] = []
    for atom in a:
        temp_atom = {}
        temp_atom["x"] = atom.position[0]
        temp_atom["y"] = atom.position[1]
        temp_atom["z"] = atom.position[2]
        temp_atom["atom"] = atom.symbol
        temp["moleculeData"]["data"].append(temp_atom)
    temp["moleculeData"]["gridSpacing"] = {"x":0.1,"y":0.1,"z":0.1}
    temp["systemDimension"] = systemDimension
    config["views"].append(temp)
    config["plotSetup"] = {}
    config["plotSetup"]["moleculePropertyList"] = ["atom"]
    return config


def trajToConfig(a):
    #print "converting traj to config"
    systemDimension = {}
    systemDimension["x"] = [0,a[0].cell[0][0]]
    systemDimension["y"] = [0,a[0].cell[1][1]]
    systemDimension["z"] = [0,a[0].cell[2][2]]

    config = {}

    config["views"] = []
    temp = {}
    temp["viewType"] = "3DView"
    temp["moleculeName"] = "test"
    temp["moleculeData"] = {}
    temp["moleculeData"]["data"] = []
    for i in range(len(a)):
        atoms = a[i]
        for atom in atoms:
            temp_atom = {}
            temp_atom["x"] = atom.position[0]
            temp_atom["y"] = atom.position[1]
            temp_atom["z"] = atom.position[2]
            temp_atom["atom"] = atom.symbol
            temp_atom["frame"] = i
            temp["moleculeData"]["data"].append(temp_atom)
    temp["moleculeData"]["gridSpacing"] = {"x":0.1,"y":0.1,"z":0.1}
    temp["systemDimension"] = systemDimension
    config["views"].append(temp)
    config["plotSetup"] = {}
    config["plotSetup"]["frameProperty"] = "frame",
    config["plotSetup"]["moleculePropertyList"] = ["atom","frame"]
    return config

class LoadHandler(object):

    def __init__(self, config):
        self.config = config
    def OnLoadEnd(self, browser, **_):
        browser.ExecuteFunction("defineData", self.config)


if __name__ == '__main__':
    data = {
        "views": [
            {
                "viewType": "3DView",
                "moleculeName": "CO2",
                "moleculeData":{
                    "data":[
                        {
                            "x": 0.0,
                            "y": 0.0,
                            "z": 0.0,
                            "atom":"C",
                            "p1":0,
                            "p2":1
                        }
                    ]
                },
                "systemDimension": {"x":[-5,4.9],"y":[-5,4.9],"z":[-5,4.9]}
            }
        ],

        "plotSetup" : {
            "spatiallyResolvedPropertyList": ["rho","Vxc","epxc","gamma","tau","LDA_residual","deriv_1","deriv_2","deriv_3", "ad_0-06","ad_0-10","ad_0-14","PC1","PC2"],
            "pointcloudDensity": "rho",
            "densityCutoff": 1e-2,
            "moleculePropertyList":["p1","p2"]
        }
    }
    view(data)