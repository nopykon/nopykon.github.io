# Scene Exporter
# v2.79
# Author: Nopy
import bpy
import os
import sys


dir = os.path.dirname(bpy.data.filepath)
if not dir in sys.path:
    sys.path.append(dir )
    #print(sys.path)

# this next part forces a reload in case you edit the source after you first start the blender session
import tool
import imp
imp.reload(tool)
from tool import *

class Mesh:pass;
class Material:pass;
class Armature:pass;

triggers=[]
instances=[]
materials=[]
meshes=[]
materials=[]
armatures=[]

#bone_name, qp,qp,qp 
#Originals / Defaults

OG = False
SCENE = bpy.context.scene
originals = []
if 'Original' in bpy.data.scenes:
    OG = bpy.data.scenes['Original'] 
    if OG != SCENE:
        for o in OG.objects:        
            originals.append( o.data )


def add_armature(o):
    print('adding armature:', o.name )
    
    d = o.data
    arm = Armature()
    
    action = o.animation_data.action    
    frame = []
    for fcu in action.fcurves:
        for keyframe in fcu.keyframe_points:
            if keyframe.co.x not in frame:
                frame.append(keyframe.co.x)

    arm.pose_count = len(frame)        
    #

    print('frame count =', len(d.bones)) 
    print('bone count =', len(d.bones)) 
    arm.name = o.name
    arm.bone_names = []
    arm.bone_count = len(d.bones)
    
    #ok, frames
    #arm.frames = []
    #bone names
    arm.poses = []
    arm.parents = []
    
    for b in d.bones:#ok... d.bones
        arm.bone_names.append(b.name) 
        if len(b.parent_recursive) > 0 :
            bn = b.parent_recursive[0].name   
            pi = arm.bone_names.index(bn)
            arm.parents.append(pi)
        else:
            arm.parents.append(-1)
    
    print( 'parents :', arm.parents )
    
    sce = bpy.context.scene
    
    #sigh, of course arm.bones and o.pose.bones don't align
    bone_frames={}
    for b in d.bones:
        bone_frames[b.name]=[]
    
    for f in frame:
        sce.frame_set(f)
        for b in o.pose.bones:
            bone_frames[b.name].append( b.matrix.copy() )
            
    for i in range( 0, len(frame) ):
        kf=[]
        for b in d.bones:
            kf.append(bone_frames[b.name][i])
        arm.poses.append( kf )

    
    """    
    
    for f in frame:
        print( 'frame = ', f , ' -------------') 
        sce.frame_set( f )    
        kf = []
        for b in o.pose.bones:#NOT SAME ORDER??
            #print(b.name )#, b.matrix) # bone in object space
            kf.append( b.matrix.copy() )                                                            
            #print( 'w = ', b.matrix[3] ),they should all be [0,0,0,1]
        arm.poses.append(kf)  
    #arm.poses = poses #decide later if we want to convert to quat....
    #here on the other hand: WORDLSPACE COORDS, NOT DELTA, USELESS
    """    
    sce.frame_set(frame[0])
    
    armatures.append(arm)
    return 

###
def add_trigger(o):
    M = o.matrix_world
    m = o.data
    mi = [1<<15,1<<15,1<<15]
    ma = [-1<<15,-1<<15,-1<<15]
    for v in m.vertices:
        q = M*v.co
        q.x = int(SCALE*q.x)
        q.y = int(SCALE*q.y)
        q.z = int(SCALE*q.z)
        
        for i in range(0,3):
            mi[i] = min(mi[i], int(q[i]))  
            ma[i] = max(ma[i], int(q[i]))  
    
    t = Trig()
    t.min=mi
    t.max=ma
    t.name= o.name.replace('trig_','')
    triggers.append(t)
    print('Trigger ' + t.name + ' was added.')
    print('\t %d %d %d ' % (t.min[0],t.min[1],t.min[2]))
    print('\t %d %d %d ' % (t.max[0],t.max[1],t.max[2]))    
    return    
###
def add_instance(obj):
    if OG == SCENE: 
        return
    if obj.name.find('meshonly')==0 :
        return
    ins = Instance();
    ins.name = obj.name
    ins.matrix = obj.matrix_world
    ins.mesh_name = obj.data.name
    instances.append(ins)
    print('Instance '+obj.name+' added.')


### TODO check if accurate (tcount)
def append_if( v, e ):
    if e in v:
        return v.index(e)
    
    v.append(e)
    return len(v)-1


###
def add_mesh(o, name):        
    m = o.data                       
    #m.name in done_mesh
    for i in range(0, len(meshes)):
        if name == meshes[i].name:
            print('previously added mesh: ' + name )
            return
    
    mtrl_remap=[]
    for i in range(0,len(m.materials)):
        mtrl = m.materials[i]
        if mtrl != None:
            if not mtrl.name in materials:
                materials.append(mtrl.name)
            mtrl_remap.append( materials.index(mtrl.name) )
    if 0==len(mtrl_remap):
        mtrl_remap = None

       
    M = Mesh()

    M.has_materials = mtrl_remap and 1 or 0
    M.name = name 
    m.calc_normals_split()    
    Vv = m.vertices #also contains vertex normal!
    Cv = len(m.vertex_colors) and m.vertex_colors[0].data or False
    if Cv:
        print('NOTE: mesh has colors. ' + m.name )    

    #if len(m.uv_layers) == 0 :
    #    ass
        
    Tv = len(m.uv_layers) and m.uv_layers[0].data or False
    #Tv = m.uv_layers[0].data
    
    vv = []
    nv = []
    tv = []
    cv = []
    iv = []
    
    M.face_count=0
    
    #for k in m.materals:
    #    print(k)
    #
    #GROUP INDEX != BONE INDEX
    #look for modifier ARMATURE, find group bone.s
    #GROUP REMAP 
    group_rm = []
    sorted_polys = m.polygons
        
    if o.parent is not None and o.parent.type == 'ARMATURE':
        print('MESH',o,'is RIGGED by',o.parent.name )        
        bones = o.parent.data.bones        
        for g in o.vertex_groups:
            idx = bones.find(g.name) 
            if idx == -1 :
                print('WARNING: could not find bone',g.name)
                idx = 0
            group_rm.append(idx)
    
        #sort by bone group (and material index
        def avg_group( p ):
            avg = 0
            for vi in p.vertices:
                v = Vv[vi]
                vgroup = v.groups[0].group
                avg += group_rm[vgroup]*1024 + p.material_index
            return int(avg / len(p.vertices) )                    
        sorted_polys = sorted(m.polygons, key=lambda x: avg_group(x), reverse=False)        
    else:
        #sort only by material index
        sorted_polys = sorted(sorted_polys, key=lambda x: x.material_index, reverse=False)
    
    for p in sorted_polys:#polygons:
        
        vc = len(p.vertices)
        mi = 0 
        if mtrl_remap:
            mi = mtrl_remap[p.material_index]
                        
        #print(mi)
        M.face_count+=1
        #iv.append(mi) 
        #iv.append((mi<<8)|vc) 
        iv.append(vc) 
                                    
        #matrial.. check old/mesh_exp
        for i in p.loop_indices:
            g = m.vertices[ m.loops[i].vertex_index ]
            bone = 0
            if len(o.vertex_groups) > 1 :
                bone = group_rm[g.groups[0].group]

            #print(bone)                
            v = g.co
            n = m.loops[i].normal
            #v.p = M*Vector((q.x,q.y,q.z,1.))
            
            v = [int(v.x*SCALE), int(v.y*SCALE), int(v.z*SCALE),bone]            
            #v = [v.x,v.y,v.z,bone]            
            iv.append( append_if( vv, v ) )        
            
            #iv.append( append_if( nv, [int(n.x*9), int(n.y*9), int(n.z*9), int(bone)]) )

            UV_SCALE= 64

            if Tv:
                t = Tv[i].uv
                iv.append( append_if( tv, [int(t.x*UV_SCALE),int(UV_SCALE-t.y*UV_SCALE) ] ) )
                #iv.append( append_if( tv, [int(t.x*UV_SCALE),int(UV_SCALE-t.y*UV_SCALE) ] ) )
            #else:
            #    iv.append(0)
            """
            if Cv: 
                c = Cv[i].color
                R = int(max(0, min(255, c.r * 256)))
                G = int(max(0, min(255, c.g * 256)))
                B = int(max(0, min(255, c.b * 256)))                
                #iv.append( append_if( cv, [R,G,B] ) )
            """
            continue
        #
        continue
    #
    M.og_Vv = Vv #for calculating bounding box later
    M.Vv = vv
    M.Nv = nv
    M.Cv = cv
    M.Tv = tv
    M.Iv = iv

    meshes.append(M)
    print('Mesh '+M.name+' added. (vc %d, nv %d, tv %d, cv %d)' 
        % (len(vv),len(nv),len(tv),len(cv)))
    return


"""

write

"""
def write(fn):
    
    fn += '.js'
    print('opened ' + fn)
    
    F = open(fn, 'w')
    F.write("//NoPy\n")

    #meshes
    F.write("//meshes\n")    
    for m in meshes:
        #mesh name, written twice indeed
        F.write("var " + m.name + "={ //fc:%d\n" % (m.face_count) )

        #pos
        F.write("\tPv:[")
        for i in range(0, len(m.Vv)):
            v = m.Vv[i]
            F.write( "[%d,%d,%d]" %(v[0],v[1],v[2]))
            if i < len(m.Vv)-1:
                F.write(",")
        F.write("],\n")


        """
        F.write("\tNv:[")
        for i in range(0,len(m.Nv)):
            n = m.Nv[i]
            F.write("[%d,%d,%d]" % (n[0],n[1],n[2]) )
            if i < len(m.Nv)-1:
                F.write(",")
        F.write("],\n")
        """

        F.write("\tTv:[")
        for i in range(0,len(m.Tv)):
            t = m.Tv[i]
            F.write( "[%d,%d]" % (t[0],t[1]) )    
            if i < len(m.Tv)-1:
                F.write(",")
        F.write("],\n");        
        """            
        for c in m.Cv:
            F.write( pack('BBBB', c[0],c[1],c[2],0) )
        """
        F.write("\tIv:[")
        for i in range(0,len(m.Iv)):
            if i < len(m.Iv)-1:
                F.write( "%d," % (m.Iv[i]) )
            else:
                F.write( "%d]\n}\n" % (m.Iv[i]) )

        #hmm, round it up to 16-byte even ?            
        continue

    
    """    
    
    #write instances 
    if not OG:
        F.write("var inst=[")                        
        for x in range(0,len(instances)):# in instances:
            ins = instances[x]        
            if len(ins.name) > 15 or len(ins.mesh_name) > 15:
                print('ERR: instance\mesh name too long!')            
                continue
            
            #F.write('\n\t' + ins.name+'={ mesh='+ins.mesh_name+', M={')                
            F.write('\n\t{ name="'+ins.name+'", mesh='+ins.mesh_name+', M=[')                
            M = ins.matrix        
            for i in range(0,3):
                F.write("[%g,%g,%g]," % (M[0][i],M[1][i],M[2][i]))
                continue
            
            F.write("[%g,%g,%g]]" % (M[0][3],M[1][3],M[2][3]))    
            if x < len(instances)-1:
                F.write("},")
            continue   
        
        F.write("\n]\n")
        #

    #triggers
    trigseek = F.tell()
    for t in triggers:        
        write_name16(F, t.name)
        F.write( pack('hhhh', t.min[0],t.min[1],t.min[2],0) )
        F.write( pack('hhhh', t.max[0],t.max[1],t.max[2],0) )                
        continue

    #armatures
    for a in armatures:
        F.write( pack('ii', a.bone_count, a.pose_count ) )
        for n in a.bone_names:
            write_name8(F, n)
        for p in a.parents:
            F.write( pack('i', p) )
        for p in a.poses:
            for i in range(0,len(p)):
                m = p[i]
                par = a.parents[i]
                q = m.to_quaternion()
                l = m.transposed()[3]
                QS = 16384
                S = SCALE
                F.write( pack('hhhh', int(QS*q[1]),int(QS*q[2]),int(QS*q[3]),int(QS*q[0])))
                F.write( pack('hhhh', int(S*l[0]),int(S*l[1]),int(S*l[2]), int(par) ))#NOTE:parent
    
        
    #write jump table    
    F.seek(jumpseek)
    F.write( pack('iiiii',mtrlseek, meshseek,instseek,trigseek, armseek))
    """ 
    
    #done
    F.close()
    print('closed ' + fn )
    return


"""

        ENTRY

"""
# export to blend file location
basedir = os.path.dirname(bpy.data.filepath)
if not basedir:
    raise Exception("Blend file is not saved")
scene = bpy.context.scene

#current_mode = bpy.context.mode 
bpy.ops.object.mode_set ( mode = 'OBJECT' )

obj_active = scene.objects.active
selection = bpy.context.selected_objects
bpy.ops.object.select_all(action='DESELECT')

"""

process

"""

#print('ORIGINALS:', originals) 
print('\n\nNOPY EXPORT SCENE', time.ctime())

for obj in selection:
    scene.objects.active = obj        
    obj.select = True 

    
    if obj.type == 'ARMATURE':    
        add_armature(obj)        
        obj.select = False
    elif obj.type == 'MESH':
        
        
        skip=False
        for s in ["room","Room","load","drop","skip"]:
            if 0 == obj.name.find(s):
                skip = True
                break
            
        if skip:
            obj.select = False
            continue
        
        if obj.name.find("trig") == 0 :
            add_trigger(obj)
            obj.select = False
            continue

        #obj.select = True
        if obj.name[0] !='_':
            add_instance(obj)

        m = obj.data
        
        if m in originals:
            print('Found Original of ' +m.name  )
            continue
                
        #apply modifies if any
        if len(obj.modifiers):                                        

            bpy.ops.object.duplicate(linked=False, mode='TRANSLATION' )
            o = bpy.context.selected_objects[0]
            
            """
            bpy.ops.object.modifier_apply( apply_as='DATA', 
                                            modifier=o.modifiers[0].name)
            """            
            for mo in o.modifiers:
                if mo.type != 'ARMATURE':
                    bpy.ops.object.modifier_apply( modifier = mo.name )
            
            add_mesh(o, m.name )#name of OG mesh!
            bpy.ops.object.delete(use_global=False)
        else:                        
            add_mesh(obj,m.name)
            
        obj.select = False    
        
    continue

##print( 'found ', len(materials), 'materials')

write( basedir + '/' + SCENE.name )


"""
    
reset blender state 

"""
scene.objects.active = obj_active
for obj in selection:
    obj.select = True

#bpy.ops.object.mode_set( mode = current_mode )
