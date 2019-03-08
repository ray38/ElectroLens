from ElectroLens import view
from ase import Atoms
import sys

import json





filename = sys.argv[1]

with open(filename) as f:
    data = json.load(f)

view(data)