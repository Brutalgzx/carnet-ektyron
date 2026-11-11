# Générateur commun « mauvais / bon mouvement » (Blender 5.x, headless)
#
#   blender -b -P renders/gen.py -- <exo> <bad|good> <dossier_sortie> [frames, ex. 1,60]
#
# Même rendu que l'essai hipt.py (studio sombre, mannequin gris en métaballes,
# zones lumineuses rouge / vert, bandeau ✗ / ✓). Chaque exercice ne décrit que
# ses poses, son matériel, ses zones et ses textes : voir renders/exos.py.
# Tout est construit ici : aucun modèle, image ni vidéo tiers.
import bpy, sys, math, os
from mathutils import Vector, Quaternion, Matrix

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import exos

argv = sys.argv[sys.argv.index("--") + 1:] if "--" in sys.argv else []
EXO = argv[0]
VARIANT = argv[1] if len(argv) > 1 else "good"
OUT = argv[2] if len(argv) > 2 else "/tmp/exo"
STILLS = [int(x) for x in argv[3].split(",")] if len(argv) > 3 else None
BAD = VARIANT == "bad"
E = exos.EXOS[EXO]

FPS, FRAMES = 24, 144
W, H_ = 720, 640
X, Y, Z = Vector((1, 0, 0)), Vector((0, 1, 0)), Vector((0, 0, 1))
R = math.radians

# ================================================================ scène
bpy.ops.wm.read_factory_settings(use_empty=True)
sc = bpy.context.scene
sc.render.engine = "BLENDER_EEVEE"
sc.render.resolution_x, sc.render.resolution_y = W, H_
sc.render.fps = FPS
sc.frame_start, sc.frame_end = 1, FRAMES
sc.render.image_settings.file_format = "PNG"
sc.render.filepath = f"{OUT}/{VARIANT}_"
try:
    sc.view_settings.view_transform = "Standard"
    sc.view_settings.look = "Medium High Contrast"
except Exception:
    pass
ee = sc.eevee
for k, v in (("taa_render_samples", int(os.environ.get("SAMPLES", 24))), ("use_raytracing", True), ("use_shadows", True)):
    if hasattr(ee, k):
        setattr(ee, k, v)


def mat(name, base, rough=0.45, emit=None, metal=0.0, sheen=0.0):
    m = bpy.data.materials.new(name)
    m.use_nodes = True
    b = m.node_tree.nodes["Principled BSDF"]
    b.inputs["Base Color"].default_value = (*base, 1)
    b.inputs["Roughness"].default_value = rough
    b.inputs["Metallic"].default_value = metal
    if sheen:
        b.inputs["Sheen Weight"].default_value = sheen
    if emit:
        b.inputs["Emission Color"].default_value = (*emit[0], 1)
        b.inputs["Emission Strength"].default_value = emit[1]
    return m


world = bpy.data.worlds.new("W")
sc.world = world
world.use_nodes = True
world.node_tree.nodes["Background"].inputs["Color"].default_value = (0.018, 0.024, 0.034, 1)


def add_obj(name, data):
    o = bpy.data.objects.new(name, data)
    sc.collection.objects.link(o)
    return o


bpy.ops.mesh.primitive_plane_add(size=1)
floor = bpy.context.object
floor.scale = (22, 22, 1)
floor.data.materials.append(mat("Floor", (0.02, 0.026, 0.036), rough=0.55))
bpy.ops.mesh.primitive_cylinder_add(vertices=96, radius=6, depth=16, location=(0, 0, 0))
cyc = bpy.context.object
cyc.data.materials.append(mat("Cyc", (0.03, 0.038, 0.052), rough=0.9))
cyc.scale = (1.4, 1.4, 1)
for p in cyc.data.polygons:
    p.use_smooth = True
bpy.context.view_layer.objects.active = cyc
bpy.ops.object.mode_set(mode="EDIT")
bpy.ops.mesh.flip_normals()
bpy.ops.object.mode_set(mode="OBJECT")

MATS = {
    "metal": mat("Metal", (0.08, 0.085, 0.09), rough=0.45, metal=1.0),
    "chrome": mat("Chrome", (0.7, 0.72, 0.75), rough=0.18, metal=1.0),
    "pad": mat("Pad", (0.02, 0.022, 0.026), rough=0.72, sheen=0.15),
    "plate": mat("Plate", (0.025, 0.027, 0.03), rough=0.6),
    "foam": mat("Foam", (0.05, 0.05, 0.055), rough=0.8),
    "mat": mat("Mat", (0.035, 0.05, 0.075), rough=0.85),
    "rope": mat("Rope", (0.32, 0.31, 0.28), rough=0.9),
    "frame": mat("Frame", (0.12, 0.13, 0.15), rough=0.35, metal=0.8),
}

# ================================================================ cinématique
def d2(a):
    r = R(a)
    return Vector((math.cos(r), 0, math.sin(r)))


def ang_of(v):
    return math.degrees(math.atan2(v.z, v.x))


def splay(v, a, sg):
    if not a:
        return v.copy()
    return (v * math.cos(R(a)) + Y * sg * math.sin(R(a))).normalized()


def ik(a, t, l1, l2, pole):
    v = t - a
    d = max(min(v.length, l1 + l2 - 1e-4), abs(l1 - l2) + 1e-3)
    u = v.normalized()
    x = (l1 * l1 - l2 * l2 + d * d) / (2 * d)
    h = math.sqrt(max(l1 * l1 - x * x, 0))
    p = pole - pole.dot(u) * u
    if p.length < 1e-5:
        p = u.orthogonal()
    return a + u * x + p.normalized() * h, a + u * d


def frame_quat(xaxis, zaxis):
    x = xaxis.normalized()
    y = zaxis.cross(x)
    if y.length < 1e-5:
        y = x.orthogonal().cross(x)
    y.normalize()
    z = x.cross(y)
    return Matrix((x, y, z)).transposed().to_quaternion()


def ease(t):
    t = max(0.0, min(1.0, t))
    return t * t * (3 - 2 * t)


def phase(f):
    """valeur 0 → 1 (pose A → B) ; cycle 'alt' : 0 → 1 → 0 → -1 → 0 (B puis C)"""
    t = ((f - 1) % FRAMES) / FPS
    if E.get("cycle") == "alt":
        s = 1 if t < 3 else -1
        t = t % 3
        if t < 0.25: v = 0.0
        elif t < 1.05: v = ease((t - 0.25) / 0.8)
        elif t < 1.85: v = 1.0
        elif t < 2.65: v = 1.0 - ease((t - 1.85) / 0.8)
        else: v = 0.0
        return v * s
    if t < 0.4: return 0.0
    if t < 1.9: return ease((t - 0.4) / 1.5)
    if t < 3.6: return 1.0
    if t < 5.2: return 1.0 - ease((t - 3.6) / 1.6)
    return 0.0


DEF = dict(pel=(0, 0.925), t=90, hd=0, tw=0, lb=0, th=-90, sh=-90, ab=0, fy=0,
           ua=-90, fa=-90, uab=6)


def merged(variant):
    keys = {}
    for k in "ABC":
        base = dict(E.get(k, {})) if k in E else None
        if base is None:
            continue
        if variant == "bad" and k in E.get("bad", {}):
            base.update(E["bad"][k])
        keys[k] = base
    return keys


def lerp(a, b, p):
    if isinstance(a, (int, float)) and isinstance(b, (int, float)):
        return a + (b - a) * p
    if isinstance(a, tuple) and isinstance(b, tuple):
        if a and isinstance(a[0], str):
            assert a[0] == b[0], (a, b)
            return (a[0], lerp(a[1], b[1], p))
        return tuple(lerp(x, y, p) for x, y in zip(a, b))
    return b if p >= 0.5 else a


def interp(keys, p):
    A = keys["A"]
    T = keys["B"] if p >= 0 or "C" not in keys else keys["C"]
    q = abs(p)
    out = dict(A)
    for k, v in T.items():
        base = A.get(k)
        if base is None and k[-1] in "LR":
            base = A.get(k[:-1], DEF.get(k[:-1]))
        if base is None:
            base = DEF.get(k)
        if base is None and k in ("pv", "t2"):
            base = A.get("t", DEF["t"])
        out[k] = lerp(base, v, q) if base is not None else v
    return out


def pose_points(P):
    """P : dict de paramètres -> points du squelette (Vector)"""
    g = lambda k, s="": P.get(k + s, P.get(k, DEF.get(k)))
    pel = g("pel")
    Hc = Vector((pel[0], 0, pel[1])) if len(pel) == 2 else Vector(pel)
    t = g("t")
    pv = g("pv") if g("pv") is not None else t
    t2 = g("t2") if g("t2") is not None else t
    upv, u1, u2 = d2(pv), d2(t), d2(t2)
    npv, n1, n2 = d2(pv - 90), d2(t - 90), d2(t2 - 90)
    L = Hc + upv * 0.10
    M = L + u1 * 0.17
    qlb = Quaternion(n2, -R(g("lb")))
    u2c = qlb @ u2
    q = Quaternion(u2c, R(g("tw"))) @ qlb
    nc, Yc = q @ n2, q @ Y
    S = M + u2c * 0.27
    J = dict(H=Hc, L=L, M=M, S=S, upv=upv, npv=npv, u1=u1, n1=n1, u2=u2c, nc=nc, Yc=Yc)
    FR = {"H": (npv, Y, upv), "M": (n1, Y, u1), "S": (nc, Yc, u2c), "L": (npv, Y, upv)}

    def target(spec, sg):
        if isinstance(spec[0], str):
            base = J[spec[0]] if spec[0] in J else None
            a, b, c = spec[1]
            fr = FR.get(spec[0], (X, Y, Z))
            return base + fr[0] * a + fr[1] * b * sg + fr[2] * c
        return Vector((spec[0], spec[1] * sg, spec[2]))

    # tête
    N = S + u2c * 0.05 + nc * 0.02
    qh = Quaternion(Yc, R(g("hd")))
    hdir, face = qh @ u2c, qh @ nc
    hc = N + hdir * 0.13 + face * 0.01
    J.update(N=N, hdir=hdir, face=face, hc=hc)
    for s, sg in (("L", -1), ("R", 1)):
        Ys = Y * sg
        hip = Hc + Ys * 0.095 - npv * 0.01
        at = g("a", s)
        if at is not None:
            kp = g("kp", s) or tuple(npv)
            pole = Vector((kp[0], kp[1] * sg, kp[2]))
            knee, ank = ik(hip, target(at, sg), 0.44, 0.40, pole)
        else:
            ab = g("ab", s)
            knee = hip + splay(d2(g("th", s)), ab, sg) * 0.44
            sab = g("sab", s)
            ank = knee + splay(d2(g("sh", s)), ab if sab is None else sab, sg) * 0.40
        sd = (ank - knee).normalized()
        fo = g("fo", s)
        if fo is None:
            fo = ang_of(Vector((sd.x, 0, sd.z))) + 90 if abs(sd.y) < 0.95 else 0
        fdir = d2(fo)
        sole = d2(fo - 90)
        fy = g("fy", s)
        if fy:
            qy = Quaternion(Z, R(fy * sg))
            fdir = qy @ fdir
        sh = S + Yc * sg * 0.185
        ht = g("h", s)
        if ht is not None:
            ep = g("ep", s)
            pole = (Vector((ep[0], ep[1] * sg, ep[2])) if ep else (-u2c + Yc * sg * 0.5 - nc * 0.2))
            el, hand = ik(sh, target(ht, sg), 0.29, 0.27, pole)
        else:
            el = sh + splay(d2(g("ua", s)), g("uab", s), sg) * 0.29
            fab = g("fab", s)
            hand = el + splay(d2(g("fa", s)), g("uab", s) if fab is None else fab, sg) * 0.27
        back = Y.cross(sd)
        if back.length < 1e-4:
            back = X.copy()
        back.normalize()
        J.update({"hip" + s: hip, "knee" + s: knee, "ank" + s: ank, "fdir" + s: fdir, "sole" + s: sole,
                  "sh" + s: sh, "el" + s: el, "hand" + s: hand, "sd" + s: sd, "back" + s: back,
                  "toe" + s: ank + fdir * 0.075 + sole * 0.04,
                  "akb" + s: ank + back * 0.075 - sd * 0.03,
                  "akf" + s: ank - back * 0.075 - sd * 0.03})
    for k in ("hand", "ank", "akb", "akf", "knee", "toe", "el"):
        J[k + "s"] = (J[k + "L"] + J[k + "R"]) / 2
    return J


# zones (centre, rayons) à partir des points
def zone(J, name):
    s = name[-1] if name[-1] in "LR" and name not in ("abs",) else ""
    base = name[:-1] if s else name
    sg = -1 if s == "L" else 1
    Ys, Yc = Y * sg, J["Yc"] * sg
    npv, upv, nc, u2 = J["npv"], J["upv"], J["nc"], J["u2"]
    if base == "glute":
        return J["H"] - npv * 0.07 + upv * 0.03 + Ys * 0.09, (0.17, 0.14, 0.15)
    if base == "gmed":
        return J["hip" + s] + Ys * 0.07 + upv * 0.07 - npv * 0.03, (0.13, 0.12, 0.13)
    if base in ("quad", "ham", "add"):
        hip, kn = J["hip" + s], J["knee" + s]
        td = (kn - hip).normalized()
        fr = td.cross(Y).normalized() if td.cross(Y).length > 1e-3 else X
        c = (hip + kn) / 2
        if base == "quad": return c + fr * 0.05, (0.16, 0.15, 0.16)
        if base == "ham": return c - fr * 0.05, (0.16, 0.15, 0.16)
        return hip + (kn - hip) * 0.35 - Ys * 0.06, (0.12, 0.11, 0.12)
    if base == "calf":
        return J["knee" + s] + J["sd" + s] * 0.13 + J["back" + s] * 0.04, (0.1, 0.1, 0.1)
    if base == "knee":
        return J["knee" + s], (0.1, 0.1, 0.1)
    if base == "lowback":
        return J["L"] - J["n1"] * 0.07 + J["u1"] * 0.04, (0.17, 0.17, 0.17)
    if base == "midback":
        return J["S"] - u2 * 0.13 - nc * 0.09, (0.17, 0.17, 0.17)
    if base == "abs":
        return J["M"] + J["n1"] * 0.09 - J["u1"] * 0.03, (0.16, 0.16, 0.18)
    if base == "obl":
        return J["M"] + J["Yc"] * sg * 0.11 + J["n1"] * 0.03, (0.12, 0.12, 0.14)
    if base == "pec":
        return J["S"] - u2 * 0.1 + nc * 0.1 + Yc * 0.08, (0.12, 0.12, 0.12)
    if base == "dfront":
        return J["sh" + s] + nc * 0.05, (0.09, 0.09, 0.09)
    if base == "dside":
        return J["sh" + s] + Yc * 0.05, (0.09, 0.09, 0.09)
    if base == "drear":
        return J["sh" + s] - nc * 0.05, (0.09, 0.09, 0.09)
    if base == "shoulder":
        return J["sh" + s], (0.11, 0.11, 0.11)
    if base == "lat":
        return J["S"] - u2 * 0.18 - nc * 0.06 + Yc * 0.12, (0.13, 0.13, 0.16)
    if base == "trap":
        return J["S"] + u2 * 0.02 - nc * 0.05, (0.15, 0.13, 0.12)
    if base in ("bic", "tri", "fore"):
        sh, el, hd = J["sh" + s], J["el" + s], J["hand" + s]
        ud = (el - sh).normalized()
        fd = hd - el
        perp = fd - fd.dot(ud) * ud
        perp = perp.normalized() if perp.length > 1e-3 else nc
        c = (sh + el) / 2
        if base == "bic": return c + perp * 0.03, (0.08, 0.08, 0.08)
        if base == "tri": return c - perp * 0.03, (0.08, 0.08, 0.08)
        return (el + hd) / 2, (0.08, 0.08, 0.08)
    if base == "elbow":
        return J["el" + s], (0.08, 0.08, 0.08)
    if base == "wrist":
        return J["hand" + s], (0.07, 0.07, 0.07)
    if base == "neck":
        return J["N"] + J["hdir"] * 0.04 - J["face"] * 0.02, (0.11, 0.13, 0.11)
    raise KeyError(name)


# ================================================================ mannequin
skin = bpy.data.materials.new("Skin")
skin.use_nodes = True
nt = skin.node_tree
bsdf = nt.nodes["Principled BSDF"]
bsdf.inputs["Roughness"].default_value = 0.38
bsdf.inputs["Coat Weight"].default_value = 0.35
bsdf.inputs["Coat Roughness"].default_value = 0.3
bsdf.inputs["Sheen Weight"].default_value = 0.25
GLOW = (0.95, 0.06, 0.04) if BAD else (0.05, 0.95, 0.25)
bsdf.inputs["Emission Color"].default_value = (*GLOW, 1)
ZONES = E["zbad"] if BAD else E["zgood"]
glow_empties, mask_sum = [], None
for i in range(len(ZONES)):
    e = add_obj(f"GlowZone{i}", None)
    glow_empties.append(e)
    tc = nt.nodes.new("ShaderNodeTexCoord")
    tc.object = e
    ln = nt.nodes.new("ShaderNodeVectorMath")
    ln.operation = "LENGTH"
    nt.links.new(tc.outputs["Object"], ln.inputs[0])
    mr = nt.nodes.new("ShaderNodeMapRange")
    mr.inputs["From Min"].default_value = 1.0
    mr.inputs["From Max"].default_value = 0.35
    mr.interpolation_type = "SMOOTHSTEP"
    nt.links.new(ln.outputs["Value"], mr.inputs["Value"])
    if mask_sum is None:
        mask_sum = mr.outputs["Result"]
    else:
        mx = nt.nodes.new("ShaderNodeMath")
        mx.operation = "MAXIMUM"
        nt.links.new(mask_sum, mx.inputs[0])
        nt.links.new(mr.outputs["Result"], mx.inputs[1])
        mask_sum = mx.outputs["Value"]
pulse = nt.nodes.new("ShaderNodeValue")
mul = nt.nodes.new("ShaderNodeMath")
mul.operation = "MULTIPLY"
nt.links.new(mask_sum, mul.inputs[0])
nt.links.new(pulse.outputs[0], mul.inputs[1])
nt.links.new(mul.outputs["Value"], bsdf.inputs["Emission Strength"])
mix = nt.nodes.new("ShaderNodeMix")
mix.data_type = "RGBA"
tint = nt.nodes.new("ShaderNodeMath")
tint.operation = "MULTIPLY"
tint.use_clamp = True
tint.inputs[1].default_value = 0.2
nt.links.new(mul.outputs["Value"], tint.inputs[0])
nt.links.new(tint.outputs["Value"], mix.inputs["Factor"])
mix.inputs["A"].default_value = (0.42, 0.43, 0.45, 1)
mix.inputs["B"].default_value = (*GLOW, 1)
nt.links.new(mix.outputs["Result"], bsdf.inputs["Base Color"])

mb = bpy.data.metaballs.new("Body")
mb.resolution = 0.04
mb.render_resolution = 0.011
mb.threshold = 0.6
body = add_obj("Body", mb)
body.data.materials.append(skin)
K = 1.72
EL = {}


def elem(name, kind, vr, size=(1, 1, 1)):
    e = mb.elements.new(type=kind)
    e.radius = vr * K
    e.stiffness = 2.0
    if kind == "ELLIPSOID":
        e.size_x, e.size_y, e.size_z = size
    EL[name] = e


def place(name, co, quat=None, half=None):
    e = EL[name]
    e.co = co
    if quat is not None:
        e.rotation = quat
    if half is not None:
        e.size_x = half


def capsule(name, a, b):
    d = b - a
    if d.length < 1e-4:
        d = Vector((1e-3, 0, 0))
    place(name, (a + b) / 2, X.rotation_difference(d.normalized()), d.length / 2)


elem("head", "ELLIPSOID", 0.1, (1.12, 0.82, 0.96))
elem("jaw", "ELLIPSOID", 0.055, (1.0, 1.15, 0.8))
elem("neck", "CAPSULE", 0.05)
elem("chest", "ELLIPSOID", 0.13, (1.25, 1.35, 0.85))
elem("abdo", "ELLIPSOID", 0.11, (1.15, 1.25, 0.82))
elem("pelvis", "ELLIPSOID", 0.12, (0.95, 1.4, 0.85))
for s in "LR":
    elem("delt" + s, "BALL", 0.058)
    elem("glute" + s, "BALL", 0.078)
    elem("thigh" + s, "CAPSULE", 0.066)
    elem("quad" + s, "ELLIPSOID", 0.07, (1.6, 1, 0.95))
    elem("knee" + s, "BALL", 0.048)
    elem("shin" + s, "CAPSULE", 0.042)
    elem("calf" + s, "ELLIPSOID", 0.05, (1.6, 1, 1))
    elem("foot" + s, "ELLIPSOID", 0.042, (2.3, 1.05, 0.75))
    elem("uarm" + s, "CAPSULE", 0.04)
    elem("farm" + s, "CAPSULE", 0.033)
    elem("hand" + s, "ELLIPSOID", 0.035, (1.2, 1.3, 0.9))


def place_body(J):
    u1, n1, u2, nc, upv, npv = J["u1"], J["n1"], J["u2"], J["nc"], J["upv"], J["npv"]
    place("chest", J["S"] - u2 * 0.11 + nc * 0.01, frame_quat(u2, nc))
    place("abdo", J["M"] - u1 * 0.06 + n1 * 0.005, frame_quat(u1, n1))
    place("pelvis", J["H"] + upv * 0.03 + npv * 0.005, frame_quat(upv, npv))
    N, hc, hdir, face = J["N"], J["hc"], J["hdir"], J["face"]
    capsule("neck", N - u2 * 0.01, hc - hdir * 0.05)
    place("head", hc, frame_quat(hdir, face))
    place("jaw", hc - hdir * 0.035 + face * 0.06, frame_quat(hdir, face))
    for s in "LR":
        hip, knee, ank = J["hip" + s], J["knee" + s], J["ank" + s]
        place("glute" + s, hip - npv * 0.06 + upv * 0.035)
        capsule("thigh" + s, hip, knee)
        td = (knee - hip).normalized()
        fr = td.cross(Y)
        fr = fr.normalized() if fr.length > 1e-3 else X.copy()
        place("quad" + s, hip + td * 0.17 + fr * 0.005, frame_quat(td, fr))
        place("knee" + s, knee)
        capsule("shin" + s, knee, ank)
        sd, back = J["sd" + s], J["back" + s]
        place("calf" + s, knee + sd * 0.13 + back * 0.03, frame_quat(sd, back))
        fdir, sole = J["fdir" + s], J["sole" + s]
        place("foot" + s, J["toe" + s], frame_quat(fdir + sole * 0.12, -sole))
        sh, el, hand = J["sh" + s], J["el" + s], J["hand" + s]
        place("delt" + s, sh + nc * 0.01)
        capsule("uarm" + s, sh, el)
        capsule("farm" + s, el, hand - (hand - el).normalized() * 0.03)
        place("hand" + s, hand, frame_quat(hand - el, nc))


# ================================================================ matériel
def box(c, size, m, bevel=0.0, rot=(0, 0, 0)):
    bpy.ops.mesh.primitive_cube_add(size=1, location=c, rotation=tuple(R(a) for a in rot))
    o = bpy.context.object
    o.scale = size
    bpy.ops.object.transform_apply(scale=True)
    if bevel:
        bv = o.modifiers.new("b", "BEVEL")
        bv.width, bv.segments = bevel, 4
        bpy.ops.object.shade_smooth()
    o.data.materials.append(MATS[m])
    return o


AXROT = {"x": (0, math.pi / 2, 0), "y": (math.pi / 2, 0, 0), "z": (0, 0, 0)}


def cyl(c, r, depth, m, ax="y", verts=48, bevel=0.0, parent=None):
    bpy.ops.mesh.primitive_cylinder_add(vertices=verts, radius=r, depth=depth, location=c, rotation=AXROT[ax])
    o = bpy.context.object
    o.data.materials.append(MATS[m])
    if bevel:
        bv = o.modifiers.new("b", "BEVEL")
        bv.width, bv.segments = bevel, 3
        bv.limit_method = "ANGLE"
    bpy.ops.object.shade_auto_smooth()
    if parent:
        o.parent = parent
    return o


def barbell(parent, length=1.31, plates=True, pad=False, small=False):
    cyl((0, 0, 0), 0.014, length, "chrome", parent=parent)
    if pad:
        cyl((0, 0, 0), 0.05, 0.42, "foam", parent=parent, bevel=0.012)
    if not plates:
        return
    pr = 0.16 if small else 0.225
    for s in (-1, 1):
        cyl((0, s * (length / 2 + 0.205), 0), 0.025, 0.42, "chrome", parent=parent)
        cyl((0, s * (length / 2), 0), 0.035, 0.04, "chrome", parent=parent)
        cyl((0, s * (length / 2 + 0.055), 0), pr, 0.055, "plate", verts=96, bevel=0.008, parent=parent)
        if not small:
            cyl((0, s * (length / 2 + 0.10), 0), 0.16, 0.035, "plate", verts=96, bevel=0.006, parent=parent)


def dumbbell(parent, size=1.0):
    cyl((0, 0, 0), 0.016 * size, 0.15 * size, "chrome", parent=parent)
    for s in (-1, 1):
        cyl((0, s * 0.105 * size, 0), 0.06 * size, 0.07 * size, "plate", verts=6, bevel=0.006, parent=parent)


ATTACHED, RODS, STATIC = [], [], []


def build_props(lst):
    for q in lst:
        k = q["k"]
        at = q.get("at")
        c = Vector(q.get("c", (0, 0, 0)))
        rot = q.get("r", (0, 0, 0))
        if k in ("box", "cyl", "pulley"):
            if at:
                root = add_obj("P", None)
                root.rotation_euler = tuple(R(a) for a in rot)
                if k == "box":
                    o = box((0, 0, 0), q["s"], q.get("m", "pad"), q.get("bev", 0.0))
                else:
                    o = cyl((0, 0, 0), q.get("rad", 0.05), q.get("d", 0.1), q.get("m", "foam"), q.get("ax", "y"), bevel=q.get("bev", 0.0))
                o.parent = root
                ATTACHED.append((root, at, c))
            elif k == "box":
                o = box(c, q["s"], q.get("m", "pad"), q.get("bev", 0.0), rot)
            elif k == "cyl":
                o = cyl(c, q.get("rad", 0.05), q.get("d", 0.1), q.get("m", "metal"), q.get("ax", "y"), bevel=q.get("bev", 0.0))
                if any(rot):
                    o.rotation_euler.rotate(__import__("mathutils").Euler(tuple(R(a) for a in rot)))
            else:
                o = cyl(c, 0.06, 0.03, "frame", q.get("ax", "y"), bevel=0.005)
                cyl(c, 0.022, 0.05, "chrome", q.get("ax", "y"))
            if not at and not q.get("nofit"):
                bpy.context.view_layer.update()
                STATIC.append(o)
        elif k in ("barbell", "db"):
            root = add_obj("P", None)
            if k == "barbell":
                barbell(root, q.get("len", 1.31), q.get("plates", True), q.get("pad", False), q.get("small", False))
            else:
                dumbbell(root, q.get("size", 1.0))
            root.rotation_euler = {"y": (0, 0, 0), "x": (0, 0, math.pi / 2), "z": (math.pi / 2, 0, 0)}[q.get("ax", "y")]
            if at:
                ATTACHED.append((root, at, c))
            else:
                root.location = c
        elif k == "rod":
            bpy.ops.mesh.primitive_cylinder_add(vertices=12, radius=q.get("rad", 0.005), depth=1)
            o = bpy.context.object
            o.data.materials.append(MATS[q.get("m", "chrome")])
            o.rotation_mode = "QUATERNION"
            RODS.append((o, q["a"], q["b"]))
        else:
            raise KeyError(k)


def resolve(J, spec):
    if isinstance(spec[0], str):
        return J[spec[0]] + Vector(spec[1])
    return Vector(spec)


build_props(E.get("props", []))

# ================================================================ animation
KEYS = merged(VARIANT)
frames = STILLS if STILLS else range(1, FRAMES + 1)
for f in frames:
    p = phase(f)
    J = pose_points(interp(KEYS, p))
    place_body(J)
    for i in range(len(mb.elements)):
        mb.keyframe_insert(f"elements[{i}].co", frame=f)
        mb.keyframe_insert(f"elements[{i}].rotation", frame=f)
        mb.keyframe_insert(f"elements[{i}].size_x", frame=f)
    for root, at, c in ATTACHED:
        root.location = J[at] + c
        root.keyframe_insert("location", frame=f)
    for o, a, b in RODS:
        pa, pb = resolve(J, a), resolve(J, b)
        d = pb - pa
        o.location = (pa + pb) / 2
        o.rotation_quaternion = Z.rotation_difference(d.normalized())
        o.scale = (1, 1, max(d.length, 1e-3))
        o.keyframe_insert("location", frame=f)
        o.keyframe_insert("rotation_quaternion", frame=f)
        o.keyframe_insert("scale", frame=f)
    for i, e in enumerate(glow_empties):
        c, sz = zone(J, ZONES[i])
        e.location, e.scale = c, sz
        e.keyframe_insert("location", frame=f)
        e.keyframe_insert("scale", frame=f)
    t = (f - 1) / FPS
    hold = E.get("glow_always")
    lvl = 1.0 if hold else ease((abs(p) - 0.55) / 0.45)
    pulse.outputs[0].default_value = lvl * (7.0 + 3.0 * math.sin(t * 2 * math.pi * 1.6))
    pulse.outputs[0].keyframe_insert("default_value", frame=f)

# ================================================================ caméra (cadrage auto commun aux deux variantes)
cfg = dict(az=-55, el=18, lens=40)
cfg.update(E.get("cam", {}))
pts = []
for var in ("good", "bad"):
    kk = merged(var)
    for f in range(1, FRAMES + 1, 4):
        J = pose_points(interp(kk, phase(f)))
        for k in ("hc", "S", "M", "H", "kneeL", "kneeR", "ankL", "ankR", "toeL", "toeR",
                  "elL", "elR", "handL", "handR", "shL", "shR"):
            for dv in (X, -X, Y, -Y, Z, -Z):
                pts.append(J[k] + dv * (0.13 if k == "hc" else 0.09))
        for root, at, c in ATTACHED:
            pts.append(J[at] + c)
for o in STATIC:
    for v in o.bound_box:
        pts.append(o.matrix_world @ Vector(v))
for pt in cfg.get("fit", []):
    pts.append(Vector(pt))
if cfg.get("fitonly"):
    pts = [Vector(p) for p in cfg["fitonly"]]
lo = Vector((min(p.x for p in pts), min(p.y for p in pts), max(min(p.z for p in pts), 0.0)))
hi = Vector((max(p.x for p in pts), max(p.y for p in pts), max(p.z for p in pts)))
ctr = (lo + hi) / 2
dirc = Vector((math.cos(R(cfg["el"])) * math.cos(R(cfg["az"])), math.cos(R(cfg["el"])) * math.sin(R(cfg["az"])), math.sin(R(cfg["el"]))))
fwd = -dirc
right = fwd.cross(Z).normalized()
up = right.cross(fwd)
tx = 18 / cfg["lens"]
ty = tx * H_ / W
TOP, BOT, SIDE = 0.50, -0.93, 0.92


def proj(d):
    xs, ys = [], []
    for p in pts:
        q = p - ctr
        dep = d + q.dot(fwd)
        xs.append(q.dot(right) / dep / tx)
        ys.append(q.dot(up) / dep / ty)
    return min(xs), max(xs), min(ys), max(ys)


lo_d, hi_d = 0.5, 30.0
for _ in range(40):
    d = (lo_d + hi_d) / 2
    x0, x1, y0, y1 = proj(d)
    if (x1 - x0) <= 2 * SIDE and (y1 - y0) <= (TOP - BOT):
        hi_d = d
    else:
        lo_d = d
d = hi_d * cfg.get("zoom", 1.0)
x0, x1, y0, y1 = proj(d)
sx = (x0 + x1) / 2 * tx * d
sy = ((y0 + y1) / 2 - (TOP + BOT) / 2) * ty * d
cam_d = bpy.data.cameras.new("Cam")
cam_d.lens = cfg["lens"]
cam = add_obj("Cam", cam_d)
cam.location = ctr + dirc * d + right * sx + up * sy
cam.rotation_euler = fwd.to_track_quat("-Z", "Y").to_euler()
sc.camera = cam

# lumières : posées par rapport à la caméra (même éclairage que l'essai)
def light(name, loc, energy, color, size, target, spread=180):
    l = bpy.data.lights.new(name, "AREA")
    l.energy, l.color, l.size = energy, color, size
    l.spread = R(spread)
    o = add_obj(name, l)
    o.location = loc
    o.rotation_euler = (Vector(target) - Vector(loc)).to_track_quat("-Z", "Y").to_euler()


k = max(1.0, (hi - lo).length / 1.6)
tgt = ctr
light("Key", tgt + (dirc * 2.4 + right * 1.6 + Z * 1.9) * k ** 0.5, 150 * k, (1.0, 0.97, 0.93), 2.5 * k ** 0.5, tgt)
light("Fill", tgt + (dirc * 1.6 - right * 2.6 + Z * 0.6) * k ** 0.5, 35 * k, (0.75, 0.85, 1.0), 3.0, tgt)
light("Rim", tgt + (-dirc * 2.6 + right * 0.8 + Z * 1.6) * k ** 0.5, 320 * k, (0.6, 0.75, 1.0), 2.0, tgt, 40)
light("Top", tgt + Z * (3.6 + (hi.z - lo.z)), 40 * k, (1, 1, 1), 3.0, tgt)


def label(txt, font, size, loc, color, strength=1.0):
    cu = bpy.data.curves.new("T", "FONT")
    cu.body = txt
    cu.font = bpy.data.fonts.load(font)
    cu.size = size
    cu.align_y = "CENTER"
    o = add_obj("Label", cu)
    o.parent = cam
    o.location = loc
    o.data.materials.append(mat("L" + txt[:20], (0, 0, 0), emit=(color, strength)))


UNI = "/System/Library/Fonts/Supplemental/Arial Unicode.ttf"
BOLD = "/System/Library/Fonts/Supplemental/Arial Bold.ttf"
col = (1.0, 0.05, 0.03) if BAD else (0.06, 1.0, 0.3)
sz = 0.4 * 40 / cfg["lens"]   # demi-hauteur visible à 1 m
bpy.ops.mesh.primitive_circle_add(vertices=64, radius=0.042 * sz / 0.4, fill_type="NGON")
disc = bpy.context.object
disc.parent = cam
disc.location = (-0.36 * sz / 0.4, 0.30 * sz / 0.4, -1.0)
disc.data.materials.append(mat("Disc", (0, 0, 0), emit=(col, 0.75)))
f = sz / 0.4
label("✗" if BAD else "✓", UNI, 0.07 * f, (-0.382 * f, 0.30 * f, -0.999), (1, 1, 1), 0.95)
label("MAUVAIS" if BAD else "BON", BOLD, 0.05 * f, (-0.305 * f, 0.30 * f, -1.0), col, 0.8)
label(E["tbad"] if BAD else E["tgood"], BOLD, 0.024 * f, (-0.405 * f, 0.24 * f, -1.0), (0.85, 0.88, 0.92), 0.7)

# ================================================================ halo
tree = bpy.data.node_groups.new("Comp", "CompositorNodeTree")
sc.compositing_node_group = tree
tree.interface.new_socket("Image", in_out="OUTPUT", socket_type="NodeSocketColor")
rl = tree.nodes.new("CompositorNodeRLayers")
gl = tree.nodes.new("CompositorNodeGlare")
gl.inputs["Type"].default_value = "Bloom"
gl.inputs["Threshold"].default_value = 3.0
gl.inputs["Strength"].default_value = 1.0
gl.inputs["Size"].default_value = 0.6
outn = tree.nodes.new("NodeGroupOutput")
tree.links.new(rl.outputs["Image"], gl.inputs["Image"])
tree.links.new(gl.outputs["Image"], outn.inputs[0])

if STILLS:
    for f in STILLS:
        sc.frame_set(f)
        sc.render.filepath = f"{OUT}/{EXO}_{VARIANT}_{f:04d}.png"
        bpy.ops.render.render(write_still=True)
else:
    bpy.ops.render.render(animation=True)
