"""
Communicate between Python and Javascript asynchronously using
inter-process messaging with the use of Javascript Bindings.
"""

from cefpython3 import cefpython as cef
import os
import json
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
    with open('temp_data3.json', 'w') as fp:
        json.dump(config , fp)
    cef.Initialize()
    cwd = os.getcwd()
    try:
        os.chdir("ElectroLens-python")
    except:
        pass
    browser_setting = { "file_access_from_file_urls_allowed":True,\
                    "universal_access_from_file_urls_allowed": True,\
                    "web_security_disabled":True}
    browser = cef.CreateBrowserSync(url='file://' + os.path.realpath("index_cefpython.html"),
                                    window_title="Javascript Bindings", settings = browser_setting)
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
    config["plotSetup"]["frameProperty"] = "frame"
    config["plotSetup"]["moleculePropertyList"] = ["atom","frame"]
    return config

class LoadHandler(object):

    def __init__(self, config):
        self.config = config
    def OnLoadEnd(self, browser, **_):
        browser.ExecuteFunction("defineData", self.config)
