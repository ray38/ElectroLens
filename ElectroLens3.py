"""
Communicate between Python and Javascript asynchronously using
inter-process messaging with the use of Javascript Bindings.
"""

from cefpython3 import cefpython as cef
import os
import json
from ase import Atoms
from ase.io.trajectory import TrajectoryReader

def view():

    cef.Initialize()
    cwd = os.getcwd()

    browser_setting = { "file_access_from_file_urls_allowed":True,\
                    "universal_access_from_file_urls_allowed": True,\
                    "web_security_disabled":True}

    browser = cef.CreateBrowserSync(url='file://' + os.path.realpath("index.html"),
                                    window_title="Javascript Bindings", settings = browser_setting)
    os.chdir(cwd)
    #browser.SetClientHandler(LoadHandler(config))
    bindings = cef.JavascriptBindings()
    browser.SetJavascriptBindings(bindings)
    cef.MessageLoop()
    del browser
    cef.Shutdown()
    return 



view()
