"""
Communicate between Python and Javascript asynchronously using
inter-process messaging with the use of Javascript Bindings.
"""

from cefpython3 import cefpython as cef
import os
import sys
import json


def main(data):
    cef.Initialize()
    browser_setting = {"file_access_from_file_urls_allowed": True}
    browser = cef.CreateBrowserSync(url='file://' + os.path.realpath("index_cefpython.html"),
                                    window_title="Javascript Bindings", settings = browser_setting)
    browser.ShowDevTools()
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
    filename = sys.argv[1]
    with open(filename) as f:
        data = json.load(f)
    main(data)