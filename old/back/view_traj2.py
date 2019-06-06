from ElectroLens import view
from ase import Atoms
import sys
#from ase.visualize import view
from ase.build import bulk
from ase.build import graphene_nanoribbon
from ase.build import nanotube
from ase.io.trajectory import Trajectory
import pickle

filename = sys.argv[1]
fingerprint_filename = sys.argv[2]
fingerprint = pickle.load(open(fingerprint_filename,"rb"))['510c9b18860d449e2d0d41c590fa3f7b']
traj = Trajectory(filename)

#a = nanotube(6, 0, length=4)
#a = bulk('Cu', 'bcc', a=3.6, orthorhombic=True)
#a = graphene_nanoribbon(3, 4, type='armchair', saturated=True, vacuum=3.5)
view((traj[0],fingerprint))


