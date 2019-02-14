"""
Communicate between Python and Javascript asynchronously using
inter-process messaging with the use of Javascript Bindings.
"""

from cefpython3 import cefpython as cef
import os


def main(data):
    cef.Initialize()
    browser = cef.CreateBrowserSync(url='file://' + os.path.realpath("index_cefpython.html"),
                                    window_title="Javascript Bindings")
    browser.SetClientHandler(LoadHandler(data))
    bindings = cef.JavascriptBindings()
    browser.SetJavascriptBindings(bindings)
    cef.MessageLoop()
    del browser
    cef.Shutdown()




class LoadHandler(object):

    def __init__(self, data):
        self.data = data
    def OnLoadEnd(self, browser, **_):
        browser.ExecuteFunction("defineData", self.data)


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
    main(data)