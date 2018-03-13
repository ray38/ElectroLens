from ase import io
from ase.parallel import paropen as open #ensures that open works in parallel environment
from ase.optimize import QuasiNewton #geometry optimization algorithm; QuasiNewton links to BFGS line search, which is the best general-purpose optimizer, but other options are available: https://wiki.fysik.dtu.dk/ase/ase/optimize.html
from espresso import espresso
from ase.constraints import FixBondLength
import numpy as np
from pickle import dump

from __future__ import division
import csv
from copy import deepcopy as dc


class structure(): ##it needs some type of stucture so I made one
    
    def __init__(self,lattice_vectors):
        self.lattice = lattice_vectors
        
    def lattice_vectors(self,space='r'):
        return self.lattice

#setup calculator

calcargs = dict(xc='BEEF-vdW',
        kpts=(4, 4, 1), #only need 1 kpt in z-direction
        pw=400.,
        dw=4000.,
        spinpol=True,
        beefensemble=True,
        printensemble=True,
        convergence={'energy':1e-6,
                    'mixing':0.05,
                    'maxsteps':1000,
                    'diag':'david'},
        startingwfc='atomic',
        smearing='fd', #fermi-dirac electron smearing
        sigma=0.1, #smearing width
        dipole={'status':True}, #dipole corrections True turns them on
        #parflags='-nk 2',
        outdir ='esp.log')

calc = espresso(**calcargs)

atoms = io.read('POSCAR') #Read in the structure built by the other script
consts = atoms.constraints

atoms.set_calculator(calc)
init_mag = np.zeros(len(atoms))
init_mag[-1] = 0.1
atoms.set_initial_magnetic_moments(magmoms=init_mag)

relax = QuasiNewton(atoms,logfile='opt.log',trajectory='opt.json',restart='opt.pckl')
#set up the optimization algorithm. It has a logfile, a "trajectory" file that tracks progress, and a restart file in case the algorithm has to be restarted.
#relax.run(fmax=0.05) #execute the relaxation algorithm. It will run until the maximum force on any atom is <0.05 eV/Angstrom.

energy = atoms.get_potential_energy() #this is the potential energy of the electrons as computed by DFT. It will be closely related to the enthalpy.

outie = calc.extract_density_minus_atomic()
dump(outie,open('pot.pckl','w'))

atoms.write('converged_slab.traj')

p,basis,both = outie

non_neg = dc(both)

grid = np.shape(both)
dv = np.zeros([np.prod(grid),4])
i_ind = grid[0]
j_ind = grid[1]
k_ind = grid[2]

n=0
for i in range(grid[0]):
    for j in range(grid[1]):
        for k in range(grid[2]):
            x,y,z = basis.dot(np.array([(i/i_ind),(j/j_ind),(k/k_ind)]))
            dv[n,0] = x
            dv[n,1] = y
            dv[n,2] = z
            dv[n,3] = abs(both[i,j,k])
            n=n+1


with open('pot.csv', "wb") as f:
   writer = csv.writer(f)
   writer.writerow(['x','y','z','rho','difference'])
   writer.writerows(dv)
