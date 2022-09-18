# Room Exporter
# v2.79
# Author: Nopy

import bpy
import os
from math import *
from mathutils import Vector
from struct import *
import time

SCALE = 256

class Mesh:pass;
class Trig:pass;
class Instance:pass;


def write_name16(F, s):
    pad=16-len(s)

    if pad<1:
        print('write_name16: Too long name!')
        s = s[:15]
        pad = 1

    #print('Writing name %s, pad = %d' %(s,pad))
    F.write( s.encode() )
    for i in range(0,pad):
        F.write( pack('B',0) )

def write_name8(F, s):
    pad=8-len(s)
    if pad<1:
        print('WARNING: Too long name!')
        s = s[:7]
        pad = 1
        
    #print('Writing name %s, pad = %d' %(s,pad))
    F.write( s.encode() )
    for i in range(0,pad):
        F.write( pack('B',0) )

    

def clamp(x,a,b):
    return max(a,min(b,x))
