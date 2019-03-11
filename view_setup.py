from ElectroLens import view

import sys

import json





filename = sys.argv[1]

with open(filename) as f:
    data = json.load(f)
#print(data)
view(data)