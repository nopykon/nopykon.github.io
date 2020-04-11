# Room Exporter
# v2.79
# Author: Nopy
import bpy
import os
from mathutils import Vector

# export to blend file location
basedir = os.path.dirname(bpy.data.filepath)

if not basedir:
    raise Exception("Blend file is not saved")

scene = bpy.context.scene

obj_active = scene.objects.active
selection = bpy.context.selected_objects
bpy.ops.object.select_all(action='DESELECT')

print('\n###### MAP EXPORT #########\n')
def room_export(o, fn):
    
    M = o.matrix_world
    m = o.data
    Vv = m.vertices    
    Iv = []    
    #triangulate    
    for p in m.polygons:
        iv = p.vertices
        vc = len(iv)
        for i in range(2,vc):            
            Iv.append(iv[ 0 ])
            Iv.append(iv[ i-1 ])
            Iv.append(iv[ i ])
    
    """
        write        
    """
    f = open( fn, 'w' )    
    f.write('/*\n\t' + o.name + '\n*/\n' )

    f.write('TRIMESH ' + o.name + ' = {')

    f.write('\n\t%d,' % (len(Vv)) )
    f.write('\n\t%d,' % (len(Iv)) )
    

    #positions    
    f.write('\n\t(float [][3]){ ')
    #f.write('float '+o.name+'_Vv[%d][3]={' % (len(Vv)) )
    for i in range( 0, len(Vv)):
        v = Vv[i].co
        f.write( '{%.4g,%.4g,%.4g}' % (v.x,v.y,v.z) )
        if i < len(Vv)-1:
            f.write(',');
    f.write('},')
    
    #indices
    f.write('\n\t(unsigned short[]){')
    for i in range( 0, len(Iv), 3):
        f.write('%d,%d,%d' % (Iv[i+0],Iv[i+1],Iv[i+2]) )
        if i < len(Iv)-3:
            f.write(', ');
    f.write('}  \n')
    f.write('};\n')
    

for obj in selection:

    obj.select = True
    
    # some exporters only use the active object
    scene.objects.active = obj
    name = bpy.path.clean_name(obj.name)
    fn = os.path.join(basedir, name)
        
    
    #split nonplanar
    #bpy.ops.object.mode_set(mode='EDIT')
    #bpy.ops.mesh.vert_connect_nonplanar( angle_limit=.01 )
    #bpy.ops.object.mode_set(mode='OBJECT')
    # 
    room_export(obj, fn + ".h" )
    obj.select = False

scene.objects.active = obj_active

for obj in selection:
    obj.select = True
