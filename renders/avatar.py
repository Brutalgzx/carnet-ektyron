"""Avatar à curseurs de muscles : corps en métaballes (même principe que le mannequin de gen.py),
exporté en maillage léger + une déformation par groupe musculaire.

Pour chaque groupe, on gonfle ses métaballes, on reconstruit la surface et on mesure, pour chaque sommet
du maillage de base, de combien la surface a bougé le long de la normale. Dans l'appli (avatar.js),
chaque curseur ajoute  normale × déplacement × valeur  : le muscle grossit sans déformer le reste.

usage : blender -b -P renders/avatar.py -- <dossier_sortie>
sortie : avatar_m.bin, avatar_f.bin (format décrit dans avatar.js)
"""
import bpy, bmesh, sys, os, math, struct
from mathutils import Vector, Quaternion, Matrix
from mathutils.bvhtree import BVHTree

argv = sys.argv[sys.argv.index("--") + 1:] if "--" in sys.argv else []
OUT = argv[0] if argv else "/tmp/avatar"
os.makedirs(OUT, exist_ok=True)
X, Y, Z = Vector((1, 0, 0)), Vector((0, 1, 0)), Vector((0, 0, 1))
K = 1.72
MORPHS = ["pecs", "dos", "epaules", "bras", "abdos", "trapezes", "jambes", "fessiers", "mollets", "gras"]
TARGET_VERTS = 9000


def frame_quat(xaxis, zaxis):
    x = xaxis.normalized()
    z = (zaxis - x * zaxis.dot(x)).normalized()
    y = z.cross(x)
    return Matrix((x, y, z)).transposed().to_quaternion()


def skeleton(f):
    """Points du corps debout, bras légèrement écartés. y < 0 = devant."""
    sw = 0.168 if f else 0.188           # demi-largeur d'épaules
    hw = 0.100 if f else 0.094           # demi-écart des hanches
    P = {}
    for s, sg in (("L", -1), ("R", 1)):
        sh = Vector((sg * sw, 0.0, 1.465))
        ua = Vector((sg * math.sin(math.radians(17)), 0.0, -math.cos(math.radians(17))))
        el = sh + ua * 0.29
        fd = Vector((sg * 0.36, -0.12, -0.925)).normalized()
        hand = el + fd * 0.27
        hip = Vector((sg * hw, 0.01, 0.925))
        knee = Vector((sg * (hw + 0.012), -0.005, 0.485))
        ank = Vector((sg * (hw + 0.022), 0.0, 0.085))
        P.update({"sh" + s: sh, "el" + s: el, "hand" + s: hand, "hip" + s: hip, "knee" + s: knee, "ank" + s: ank})
    return P


def build(f):
    """Liste d'éléments : (nom, type, rayon, taille, centre, quat, groupe, gonflement)."""
    P = skeleton(f)
    E = []
    mm = 0.84 if f else 1.0               # masse musculaire de base
    add = lambda *a: E.append(list(a))
    lat = 0.93 if f else 1.0
    # tronc et tête
    add("head", "ELLIPSOID", 0.1 * (0.95 if f else 1), (0.82, 0.96, 1.12), Vector((0, -0.005, 1.648)), None, None, 1)
    add("jaw", "ELLIPSOID", 0.055 * (0.9 if f else 1), (1.15, 0.8, 1.0), Vector((0, -0.055, 1.6)), None, "gras", 1.12)
    add("neck", "CAPSULE", 0.05 * (0.86 if f else 1), (0.05,), Vector((0, 0.004, 1.548)), frame_quat(Z, -Y), "gras", 1.1)
    add("chest", "ELLIPSOID", 0.13, (1.35 * lat, 0.85, 1.25), Vector((0, 0.0, 1.355)), None, "gras", 1.05)
    add("abdo", "ELLIPSOID", 0.11, ((1.1 if f else 1.13), 0.82, 1.15), Vector((0, 0.0, 1.135)), None, "gras", 1.14)
    add("pelvis", "ELLIPSOID", 0.12 * (1.06 if f else 1), ((1.55 if f else 1.28), 0.85, 0.95), Vector((0, 0.005, 0.955)), None, "gras", 1.07)
    add("belly", "ELLIPSOID", 0.06, (1.2, 0.8, 1.0), Vector((0, -0.06, 1.06)), None, "gras", 1.75)
    for s, sg in (("L", -1), ("R", 1)):
        add("handle" + s, "ELLIPSOID", 0.045, (0.8, 1.1, 1.2), Vector((sg * (0.125 if f else 0.13), 0.01, 1.03)), None, "gras", 1.7)
        add("backfat" + s, "BALL", 0.04, (1,), Vector((sg * 0.09, 0.07, 1.2)), None, "gras", 1.5)
    # muscles du tronc
    for s, sg in (("L", -1), ("R", 1)):
        add("pec" + s, "ELLIPSOID", 0.058 * mm * (0.75 if f else 1), (1.55, 0.36, 0.72), Vector((sg * 0.074, -0.068, 1.402)), None, "pecs", 1.55)
        add("pecfat" + s, "BALL", 0.036, (1,), Vector((sg * 0.08, -0.08, 1.35)), None, "gras", 1.25)
        add("lat" + s, "ELLIPSOID", 0.072 * mm, (0.65, 0.85, 1.7), Vector((sg * 0.13 * lat, 0.035, 1.29)), None, "dos", 1.5)
        add("erec" + s, "ELLIPSOID", 0.045 * mm, (0.8, 0.6, 2.2), Vector((sg * 0.035, 0.08, 1.1)), None, "dos", 1.4)
        q = Quaternion(Y, math.radians(sg * 22))
        add("trap" + s, "ELLIPSOID", 0.05 * mm * (0.8 if f else 1), (1.7, 0.85, 0.65), Vector((sg * 0.085, 0.025, 1.5)), q, "trapezes", 1.6)
        add("obl" + s, "ELLIPSOID", 0.05 * mm, (0.6, 0.9, 1.5), Vector((sg * 0.105, -0.03, 1.08)), None, "abdos", 1.35)
        if f:
            add("breast" + s, "BALL", 0.058, (1,), Vector((sg * 0.083, -0.105, 1.335)), None, "gras", 1.18)
    add("mback", "ELLIPSOID", 0.07 * mm, (1.5, 0.5, 1.1), Vector((0, 0.085, 1.36)), None, "dos", 1.45)
    add("mtrap", "ELLIPSOID", 0.05 * mm, (1.6, 0.45, 1.0), Vector((0, 0.07, 1.43)), None, "trapezes", 1.55)
    add("rect", "ELLIPSOID", 0.055 * mm, (1.05, 0.45, 2.1), Vector((0, -0.088, 1.15)), None, "abdos", 1.35)
    # membres
    for s, sg in (("L", -1), ("R", 1)):
        sh, el, hand = P["sh" + s], P["el" + s], P["hand" + s]
        hip, knee, ank = P["hip" + s], P["knee" + s], P["ank" + s]
        ud, fd = (el - sh).normalized(), (hand - el).normalized()
        cap = lambda a, b: ((a + b) / 2, X.rotation_difference((b - a).normalized()), (b - a).length / 2)
        c, q, h = cap(sh, el)
        add("uarm" + s, "CAPSULE", 0.04 * (0.9 if f else 1), (h,), c, q, "gras", 1.14)
        c, q, h = cap(el, hand - fd * 0.03)
        add("farm" + s, "CAPSULE", 0.033 * (0.88 if f else 1), (h,), c, q, None, 1)
        add("hand" + s, "ELLIPSOID", 0.035 * (0.92 if f else 1), (1.2, 0.9, 1.3), hand, frame_quat(fd, Vector((-sg, 0, 0))), None, 1)
        add("delt" + s, "BALL", 0.058 * mm * (0.88 if f else 1), (1,), sh + Vector((sg * 0.012, -0.006, -0.008)), None, "epaules", 1.45)
        add("bic" + s, "ELLIPSOID", 0.04 * mm, (1.8, 1, 1), sh + ud * 0.16 + Vector((0, -0.028, 0)), frame_quat(ud, -Y), "bras", 1.5)
        add("tri" + s, "ELLIPSOID", 0.042 * mm, (1.9, 1, 1), sh + ud * 0.13 + Vector((0, 0.028, 0)), frame_quat(ud, -Y), "bras", 1.45)
        add("fore" + s, "ELLIPSOID", 0.036 * mm, (1.7, 1, 1), el + fd * 0.075 + Vector((0, -0.006, 0)), frame_quat(fd, -Y), "bras", 1.35)
        add("glute" + s, "BALL", 0.078 * (1.08 if f else 1), (1,), hip + Vector((-sg * 0.012, 0.062, 0.03)), None, "fessiers", 1.42)
        add("gmed" + s, "BALL", 0.045, (1,), hip + Vector((sg * 0.035, 0.03, 0.075)), None, "fessiers", 1.4)
        c, q, h = cap(hip, knee)
        add("thigh" + s, "CAPSULE", 0.058 * (1.08 if f else 1), (h,), c, q, "gras", 1.13)
        td = (knee - hip).normalized()
        add("quad" + s, "ELLIPSOID", 0.064 * mm, (1.6, 1.0, 0.95), hip + td * 0.18 + Vector((0, -0.02, 0)), frame_quat(td, -Y), "jambes", 1.4)
        add("ham" + s, "ELLIPSOID", 0.054 * mm, (1.7, 1.0, 0.9), hip + td * 0.21 + Vector((0, 0.045, 0)), frame_quat(td, Y), "jambes", 1.38)
        add("addu" + s, "ELLIPSOID", 0.042 * mm, (1.6, 0.8, 1.0), hip + td * 0.14 + Vector((-sg * 0.04, 0.0, 0)), frame_quat(td, -Y), "jambes", 1.35)
        add("knee" + s, "BALL", 0.048, (1,), knee, None, None, 1)
        c, q, h = cap(knee, ank)
        add("shin" + s, "CAPSULE", 0.042, (h,), c, q, None, 1)
        sd = (ank - knee).normalized()
        add("calf" + s, "ELLIPSOID", 0.05 * mm, (1.6, 1, 1), knee + sd * 0.13 + Vector((0, 0.03, 0)), frame_quat(sd, Y), "mollets", 1.42)
        add("foot" + s, "ELLIPSOID", 0.042, (1.05, 2.3, 0.75), ank + Vector((0, -0.075, -0.04)), None, None, 1)
    return E


bpy.ops.wm.read_factory_settings(use_empty=True)
sc = bpy.context.scene


def make_body(E):
    mb = bpy.data.metaballs.new("Av")
    mb.resolution = 0.0075
    mb.render_resolution = 0.0075
    mb.threshold = 0.6
    ob = bpy.data.objects.new("Av", mb)
    sc.collection.objects.link(ob)
    els = []
    for name, kind, r, size, c, q, grp, k in E:
        e = mb.elements.new(type=kind)
        e.radius = r * K
        e.stiffness = 2.0
        if kind == "ELLIPSOID":
            e.size_x, e.size_y, e.size_z = size
        elif kind == "CAPSULE":
            e.size_x = size[0]
        e.co = c
        if q is not None:
            e.rotation = q
        els.append(e)
    return ob, els


def surface(ob):
    dg = bpy.context.evaluated_depsgraph_get()
    dg.update()
    ev = ob.evaluated_get(dg)
    me = bpy.data.meshes.new_from_object(ev)
    bm = bmesh.new()
    bm.from_mesh(me)
    bmesh.ops.remove_doubles(bm, verts=bm.verts, dist=1e-5)
    return me, bm


def export(f, path):
    E = build(f)
    ob, els = make_body(E)
    me, bm = surface(ob)
    # maillage de base allégé
    tmp = bpy.data.objects.new("Base", me)
    sc.collection.objects.link(tmp)
    bm.to_mesh(me)
    bm.free()
    mod = tmp.modifiers.new("dec", "DECIMATE")
    mod.ratio = min(1.0, TARGET_VERTS / max(1, len(me.vertices)))
    dg = bpy.context.evaluated_depsgraph_get()
    dg.update()
    base = bpy.data.meshes.new_from_object(tmp.evaluated_get(dg))
    bb = bmesh.new()
    bb.from_mesh(base)
    bmesh.ops.triangulate(bb, faces=bb.faces)
    bb.verts.ensure_lookup_table()
    bb.normal_update()
    V = [v.co.copy() for v in bb.verts]
    N = [v.normal.copy() for v in bb.verts]
    T = [[v.index for v in fc.verts] for fc in bb.faces]
    nbr = [[e.other_vert(v).index for e in v.link_edges] for v in bb.verts]
    print(f"[avatar] {'f' if f else 'm'} : {len(V)} sommets, {len(T)} triangles")
    # déformations par groupe
    D = {}
    for g in MORPHS:
        for e, row in zip(els, E):
            e.radius = row[2] * K * (row[7] if row[6] == g else 1.0)
        vm, vb = surface(ob)
        bvh = BVHTree.FromBMesh(vb)
        d = []
        for v, n in zip(V, N):
            # rayon le long de la normale ; on ne garde que la même face du corps (normale touchée dans le même sens),
            # sinon un rayon parti de l'aisselle s'accrocherait au bras.
            loc, hn, _, dist = bvh.ray_cast(v + n * 1e-4, n, 0.07)
            if loc is not None and hn.dot(n) > 0.55:
                d.append(dist)
                continue
            loc, hn, _, dist = bvh.ray_cast(v - n * 1e-4, -n, 0.035)
            d.append(-dist if loc is not None and hn.dot(n) > 0.55 else 0.0)
        for _ in range(3):  # lissage
            d = [0.5 * d[i] + 0.5 * (sum(d[j] for j in nbr[i]) / len(nbr[i]) if nbr[i] else d[i]) for i in range(len(d))]
        lim = sorted(abs(x) for x in d)[int(len(d) * 0.995)]  # écrête les rares valeurs aberrantes
        D[g] = [max(-lim, min(lim, x)) for x in d]
        vb.free()
        bpy.data.meshes.remove(vm)
        for e, row in zip(els, E):
            e.radius = row[2] * K
    # écriture : en-tête, boîte, positions u16, triangles u16, puis par groupe : échelle f32 + valeurs i8
    lo = Vector((min(v.x for v in V), min(v.y for v in V), min(v.z for v in V)))
    hi = Vector((max(v.x for v in V), max(v.y for v in V), max(v.z for v in V)))
    sz = hi - lo
    with open(path, "wb") as fh:
        fh.write(struct.pack("<4sIII", b"AVT1", len(V), len(T), len(MORPHS)))
        fh.write(struct.pack("<6f", *lo, *sz))
        for v in V:
            fh.write(struct.pack("<3H", *(round((v[i] - lo[i]) / sz[i] * 65535) for i in range(3))))
        for t in T:
            fh.write(struct.pack("<3H", *t))
        if len(T) % 2:
            fh.write(b"\0\0")
        for g in MORPHS:
            m = max(1e-6, max(abs(x) for x in D[g]))
            fh.write(struct.pack("<f", m / 127))
            fh.write(struct.pack(f"<{len(V)}b", *(round(x / m * 127) for x in D[g])))
            if len(V) % 4:
                fh.write(b"\0" * (4 - len(V) % 4))
            srt = sorted(abs(x) for x in D[g])
            print(f"[avatar]   {g} : max {m * 100:.1f} cm, p99 {srt[int(len(srt) * .99)] * 100:.1f} cm, >2 mm : {sum(x > .002 for x in srt)}")
    bb.free()
    for o in list(sc.collection.objects):
        bpy.data.objects.remove(o)


export(False, os.path.join(OUT, "avatar_m.bin"))
export(True, os.path.join(OUT, "avatar_f.bin"))
