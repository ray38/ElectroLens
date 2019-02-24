from ElectroLens import view
from ase import Atoms
#from ase.visualize import view
from ase.build import bulk
from ase.build import graphene_nanoribbon
from ase.build import nanotube
from ase.io.trajectory import Trajectory
traj = Trajectory('example.traj')
#a = nanotube(6, 0, length=4)
a = bulk('Cu', 'bcc', a=3.6, orthorhombic=True)
#a = graphene_nanoribbon(3, 4, type='armchair', saturated=True, vacuum=3.5)
view(a)


