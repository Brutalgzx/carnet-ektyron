# Hip thrust — rendu 3D pré-calculé « mauvais / bon mouvement » (Blender 5.x, headless)
#
#   blender -b -P renders/hipt.py -- <bad|good> <dossier_sortie> [frame_test]
#
# Mannequin construit entièrement dans ce script (métaballes) : aucun modèle,
# image ni vidéo tiers. Une moitié d'écran par appel ; renders/build.sh assemble.
import bpy, sys, math
from mathutils import Vector, Quaternion

argv = sys.argv[sys.argv.index("--") + 1:] if "--" in sys.argv else []
VARIANT = argv[0] if argv else "good"
OUT = argv[1] if len(argv) > 1 else "/tmp/hipt"
STILL = int(argv[2]) if len(argv) > 2 else None
BAD = VARIANT == "bad"

FPS, FRAMES = 24, 144          # 6 s, boucle
W, H = 720, 640                # une moitié de l'écran 9:16 (720x1280)

# ---------------------------------------------------------------- scène
bpy.ops.wm.read_factory_settings(use_empty=True)
sc = bpy.context.scene
sc.render.engine = "BLENDER_EEVEE"
sc.render.resolution_x, sc.render.resolution_y = W, H
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
for k, v in (("taa_render_samples", 32), ("use_raytracing", True), ("use_shadows", True)):
    if hasattr(ee, k):
        setattr(ee, k, v)

def mat(name, base, rough=0.45, emit=None, coat=0.0, sheen=0.0):
    m = bpy.data.materials.new(name)
    m.use_nodes = True
    b = m.node_tree.nodes["Principled BSDF"]
    b.inputs["Base Color"].default_value = (*base, 1)
    b.inputs["Roughness"].default_value = rough
    if coat:
        b.inputs["Coat Weight"].default_value = coat
        b.inputs["Coat Roughness"].default_value = 0.25
    if sheen:
        b.inputs["Sheen Weight"].default_value = sheen
    if emit:
        b.inputs["Emission Color"].default_value = (*emit[0], 1)
        b.inputs["Emission Strength"].default_value = emit[1]
    return m

# monde : studio sombre bleu-gris
world = bpy.data.worlds.new("W")
sc.world = world
world.use_nodes = True
world.node_tree.nodes["Background"].inputs["Color"].default_value = (0.018, 0.024, 0.034, 1)
world.node_tree.nodes["Background"].inputs["Strength"].default_value = 1.0

def add_obj(name, data):
    o = bpy.data.objects.new(name, data)
    sc.collection.objects.link(o)
    return o

# sol + cyclo (fond arrondi)
bpy.ops.mesh.primitive_plane_add(size=1)
floor = bpy.context.object
floor.scale = (12, 12, 1)
floor.data.materials.append(mat("Floor", (0.02, 0.026, 0.036), rough=0.55))
bpy.ops.mesh.primitive_cylinder_add(vertices=96, radius=6, depth=14, location=(0, 0, 0))
cyc = bpy.context.object
cyc.data.materials.append(mat("Cyc", (0.03, 0.038, 0.052), rough=0.9))
cyc.scale = (1.4, 1.4, 1)
for p in cyc.data.polygons:
    p.use_smooth = True
# normales vers l'intérieur
bpy.context.view_layer.objects.active = cyc
bpy.ops.object.mode_set(mode="EDIT")
bpy.ops.mesh.flip_normals()
bpy.ops.object.mode_set(mode="OBJECT")

def light(name, kind, loc, energy, color=(1, 1, 1), size=1.0, target=(0.4, 0, 0.4)):
    l = bpy.data.lights.new(name, kind)
    l.energy, l.color = energy, color
    if kind == "AREA":
        l.size = size
    o = add_obj(name, l)
    o.location = loc
    d = Vector(target) - Vector(loc)
    o.rotation_euler = d.to_track_quat("-Z", "Y").to_euler()
    return o

light("Key", "AREA", (1.6, -2.6, 3.2), 150, (1.0, 0.97, 0.93), 2.5)
light("Fill", "AREA", (-2.5, -1.5, 1.4), 35, (0.75, 0.85, 1.0), 3.0)
light("Rim", "AREA", (0.6, 2.8, 2.2), 320, (0.6, 0.75, 1.0), 2.0)
light("Top", "AREA", (0.4, 0, 4), 40, (1, 1, 1), 3.0)

# ---------------------------------------------------------------- matériel de muscu
dark = mat("Metal", (0.08, 0.085, 0.09), rough=0.3)
dark.node_tree.nodes["Principled BSDF"].inputs["Metallic"].default_value = 1.0
chrome = mat("Chrome", (0.7, 0.72, 0.75), rough=0.18)
chrome.node_tree.nodes["Principled BSDF"].inputs["Metallic"].default_value = 1.0
pad = mat("Pad", (0.02, 0.022, 0.026), rough=0.55, sheen=0.3)
plate_m = mat("Plate", (0.025, 0.027, 0.03), rough=0.6)
foam = mat("Foam", (0.05, 0.05, 0.055), rough=0.8)

def box(name, center, size, m, bevel=0.0):
    bpy.ops.mesh.primitive_cube_add(size=1, location=center)
    o = bpy.context.object
    o.name = name
    o.scale = size
    bpy.ops.object.transform_apply(scale=True)
    if bevel:
        bv = o.modifiers.new("b", "BEVEL")
        bv.width, bv.segments = bevel, 4
        bpy.ops.object.shade_smooth()
    o.data.materials.append(m)
    return o

# banc (posé en travers, bord d'appui en x = 0)
BENCH_TOP = 0.42
box("BenchPad", (-0.15, 0, BENCH_TOP - 0.04), (0.30, 1.15, 0.08), pad, bevel=0.025)
box("BenchFrame", (-0.15, 0, BENCH_TOP - 0.095), (0.24, 1.05, 0.03), dark)
for y in (-0.42, 0.42):
    box("Leg", (-0.15, y, (BENCH_TOP - 0.11) / 2), (0.05, 0.05, BENCH_TOP - 0.11), dark)
    box("Foot", (-0.15, y, 0.015), (0.42, 0.06, 0.03), dark, bevel=0.01)

# barre chargée (un seul objet parent, animé)
bar = add_obj("Bar", None)
def cyl(name, r, depth, y, m, parent, verts=64, bevel=0.0):
    bpy.ops.mesh.primitive_cylinder_add(vertices=verts, radius=r, depth=depth, location=(0, y, 0),
                                        rotation=(math.pi / 2, 0, 0))
    o = bpy.context.object
    o.name = name
    o.data.materials.append(m)
    if bevel:
        bv = o.modifiers.new("b", "BEVEL")
        bv.width, bv.segments = bevel, 3
        bv.limit_method = "ANGLE"
    bpy.ops.object.shade_auto_smooth()
    o.parent = parent
    return o

cyl("Shaft", 0.014, 1.31, 0, chrome, bar)
cyl("BarPad", 0.05, 0.42, 0, foam, bar, bevel=0.012)
for s in (-1, 1):
    cyl("Sleeve", 0.025, 0.42, s * 0.86, chrome, bar)
    cyl("Collar", 0.035, 0.04, s * 0.655, chrome, bar)
    cyl("Plate", 0.225, 0.055, s * 0.71, plate_m, bar, verts=96, bevel=0.008)
    cyl("Plate2", 0.16, 0.035, s * 0.755, plate_m, bar, verts=96, bevel=0.006)

# ---------------------------------------------------------------- mannequin (métaballes)
skin = bpy.data.materials.new("Skin")
skin.use_nodes = True
nt = skin.node_tree
bsdf = nt.nodes["Principled BSDF"]
bsdf.inputs["Base Color"].default_value = (0.42, 0.43, 0.45, 1)
bsdf.inputs["Roughness"].default_value = 0.38
bsdf.inputs["Coat Weight"].default_value = 0.35
bsdf.inputs["Coat Roughness"].default_value = 0.3
bsdf.inputs["Sheen Weight"].default_value = 0.25
GLOW = (0.95, 0.06, 0.04) if BAD else (0.05, 0.95, 0.25)
bsdf.inputs["Emission Color"].default_value = (*GLOW, 1)

# zones lumineuses : masques ellipsoïdaux portés par des empties animés
glow_empties = []
mask_sum = None
for i in range(2):
    e = add_obj(f"GlowZone{i}", None)
    e.empty_display_type = "SPHERE"
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
        add = nt.nodes.new("ShaderNodeMath")
        add.operation = "MAXIMUM"
        nt.links.new(mask_sum, add.inputs[0])
        nt.links.new(mr.outputs["Result"], add.inputs[1])
        mask_sum = add.outputs["Value"]
pulse = nt.nodes.new("ShaderNodeValue")
pulse.name = "Pulse"
mul = nt.nodes.new("ShaderNodeMath")
mul.operation = "MULTIPLY"
nt.links.new(mask_sum, mul.inputs[0])
nt.links.new(pulse.outputs[0], mul.inputs[1])
nt.links.new(mul.outputs["Value"], bsdf.inputs["Emission Strength"])
# la zone lumineuse vire aussi la couleur de base
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

K = 1.72          # rayon de métaballe / rayon visible
X = Vector((1, 0, 0))
ELEMS = {}

def elem(name, kind, vr, size=(1, 1, 1), stiff=2.0):
    e = mb.elements.new(type=kind)
    e.radius = vr * K
    e.stiffness = stiff
    if kind == "ELLIPSOID":
        e.size_x, e.size_y, e.size_z = size
    ELEMS[name] = e
    return e

def place(name, co, quat=None, half=None):
    e = ELEMS[name]
    e.co = co
    if quat is not None:
        e.rotation = quat
    if half is not None:
        e.size_x = half

def capsule(name, a, b):
    d = b - a
    place(name, (a + b) / 2, X.rotation_difference(d.normalized()), d.length / 2)

def frame_quat(xaxis, zaxis):
    """rotation dont l'axe local X = xaxis, Z ≈ zaxis"""
    x = xaxis.normalized()
    y = zaxis.cross(x).normalized()
    z = x.cross(y)
    from mathutils import Matrix
    return Matrix((x, y, z)).transposed().to_quaternion()

# déclaration des éléments (rayons visibles en mètres)
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

# ---------------------------------------------------------------- cinématique
def d2(a):          # direction dans le plan sagittal (x avant, z haut)
    r = math.radians(a)
    return Vector((math.cos(r), 0, math.sin(r)))

def n2(a):          # normale côté ventre
    r = math.radians(a)
    return Vector((-math.sin(r), 0, math.cos(r)))

def ik(a, t, l1, l2, pole):
    v = t - a
    d = min(v.length, l1 + l2 - 1e-4)
    u = v.normalized()
    x = (l1 * l1 - l2 * l2 + d * d) / (2 * d)
    h = math.sqrt(max(l1 * l1 - x * x, 0))
    p = pole - pole.dot(u) * u
    return a + u * x + p.normalized() * h

def ease(t):
    t = max(0.0, min(1.0, t))
    return t * t * (3 - 2 * t)

def phase(f):
    """0 = bas, 1 = haut ; 6 s : bas 0.4 s, montée 1.5 s, maintien 1.7 s, descente 1.6 s, bas 0.8 s"""
    t = (f - 1) / FPS
    if t < 0.4: return 0.0
    if t < 1.9: return ease((t - 0.4) / 1.5)
    if t < 3.6: return 1.0
    if t < 5.2: return 1.0 - ease((t - 3.6) / 1.6)
    return 0.0

BOTTOM = dict(chest=-30, lumb=-32, pelv=-34, head=22, flare=0.0)
TOP_GOOD = dict(chest=0, lumb=1, pelv=6, head=42, flare=0.0)       # menton rentré, rétroversion
TOP_BAD = dict(chest=24, lumb=-12, pelv=-30, head=-55, flare=0.05)  # cambrure, menton levé
TOP = TOP_BAD if BAD else TOP_GOOD

BENCH_EDGE = Vector((0, 0, BENCH_TOP))
ANKLE = {"L": Vector((0.93, -0.14, 0.085)), "R": Vector((0.93, 0.14, 0.085))}
SIDE = {"L": -1, "R": 1}

def pose(f):
    p = phase(f)
    P = {k: BOTTOM[k] + (TOP[k] - BOTTOM[k]) * p for k in BOTTOM}
    out = {}
    # buste : appui des omoplates sur le bord du banc
    ac, al, ap = P["chest"], P["lumb"], P["pelv"]
    S = BENCH_EDGE + n2(ac) * 0.105 - d2(ac) * 0.05
    M = S + d2(ac) * 0.27
    L = M + d2(al) * 0.17
    Hc = L + d2(ap) * 0.10                       # centre des hanches
    nc, nl, npv = n2(ac), n2(al), n2(ap)
    place("chest", S + d2(ac) * 0.11 + nc * 0.01, frame_quat(d2(ac), nc))
    place("abdo", M + d2(al) * 0.06 + nl * (0.005 + P["flare"]), frame_quat(d2(al), nl))
    place("pelvis", Hc - d2(ap) * 0.03 + npv * 0.005, frame_quat(d2(ap), npv))
    # tête : angle par rapport au prolongement du buste (+ = menton rentré)
    N = S - d2(ac) * 0.05 + nc * 0.02
    ha = ac + 180 - P["head"]
    hd = d2(ha)
    # visage = côté ventre du crâne, tourne avec la tête
    face = Quaternion((0, 1, 0), math.radians(P["head"])) @ nc  # tourne avec la tête
    hc = N + hd * 0.13 + face * 0.01
    capsule("neck", N - d2(ac) * 0.01, hc - hd * 0.05)
    place("head", hc, frame_quat(hd, face))
    place("jaw", hc - hd * 0.035 + face * 0.06, frame_quat(hd, face))
    out["face"], out["hc"] = face, hc
    # barre posée sur le bassin
    barc = Hc + d2(ap) * 0.02 + npv * 0.17
    out["bar"] = barc
    for s in "LR":
        sg = SIDE[s]
        y = Vector((0, sg, 0))
        hip = Hc + y * 0.095 - npv * 0.01
        ank = ANKLE[s]
        knee = ik(hip, ank, 0.44, 0.40, Vector((0.35, sg * 0.08, 1)))
        place("glute" + s, hip - npv * 0.06 - d2(ap) * 0.035)
        capsule("thigh" + s, hip, knee)
        td = (knee - hip).normalized()
        place("quad" + s, hip + td * 0.17 + (Vector((0, -1, 0)).cross(td)) * -0.02,
              frame_quat(td, Vector((0, 1, 0)).cross(td) * -1))
        place("knee" + s, knee)
        capsule("shin" + s, knee, ank)
        sd = (ank - knee).normalized()
        back = Vector((0, 1, 0)).cross(sd)
        place("calf" + s, knee + sd * 0.13 + back * 0.03, frame_quat(sd, back))
        place("foot" + s, ank + Vector((0.075, 0, -0.04)), frame_quat(Vector((1, 0, -0.12)), Vector((0, 0, 1))))
        # bras : épaule -> mains sur la barre
        sh = S + y * 0.185 + nc * 0.0
        place("delt" + s, sh + nc * 0.01)
        hand = barc + y * 0.27 + npv * 0.035
        elbow = ik(sh, hand, 0.29, 0.27, Vector((-0.25, sg * 1.0, -0.15)))
        capsule("uarm" + s, sh, elbow)
        capsule("farm" + s, elbow, hand - (hand - elbow).normalized() * 0.03)
        place("hand" + s, hand, frame_quat((hand - elbow), npv))
    # zones à éclairer
    if BAD:
        out["z0"] = (L - nl * 0.02 + d2(al) * -0.03 + Vector((0, -0.1, 0)), (0.2, 0.16, 0.17))   # lombaires
        out["z1"] = (N + hd * 0.04 - face * 0.02, (0.11, 0.13, 0.11))                        # nuque
    else:
        out["z0"] = (Hc - npv * 0.07 - d2(ap) * 0.03 + Vector((0, -0.09, 0)), (0.17, 0.14, 0.15))  # fessier G
        out["z1"] = (Hc - npv * 0.07 - d2(ap) * 0.03 + Vector((0, 0.09, 0)), (0.17, 0.14, 0.15))   # fessier D
    out["p"] = p
    return out

# ---------------------------------------------------------------- animation (clés par image)
def key_all(f):
    o = pose(f)
    for i, e in enumerate(mb.elements):
        mb.keyframe_insert(f"elements[{i}].co", frame=f)
        mb.keyframe_insert(f"elements[{i}].rotation", frame=f)
        mb.keyframe_insert(f"elements[{i}].size_x", frame=f)
    bar.location = o["bar"]
    bar.keyframe_insert("location", frame=f)
    for i, e in enumerate(glow_empties):
        c, sz = o[f"z{i}"]
        e.location, e.scale = c, sz
        e.keyframe_insert("location", frame=f)
        e.keyframe_insert("scale", frame=f)
    t = (f - 1) / FPS
    glow = ease((o["p"] - 0.55) / 0.45) * (7.0 + 3.0 * math.sin(t * 2 * math.pi * 1.6))
    pulse.outputs[0].default_value = glow
    pulse.outputs[0].keyframe_insert("default_value", frame=f)

frames = [STILL] if STILL else range(1, FRAMES + 1)
for f in frames:
    key_all(f)

# ---------------------------------------------------------------- caméra + bandeau ✗ / ✓
cam_d = bpy.data.cameras.new("Cam")
cam_d.lens = 40
cam = add_obj("Cam", cam_d)
target = Vector((0.33, 0.0, 0.36))
cam.location = target + Vector((2.0, -2.25, 1.9))
cam.rotation_euler = (target - cam.location).to_track_quat("-Z", "Y").to_euler()
sc.camera = cam

def label(txt, font, size, loc, color, strength=1.0):
    cu = bpy.data.curves.new("T", "FONT")
    cu.body = txt
    cu.font = bpy.data.fonts.load(font)
    cu.size = size
    cu.align_y = "CENTER"
    o = add_obj("Label", cu)
    o.parent = cam
    o.location = loc
    m = mat("L" + txt, (0, 0, 0), emit=(color, strength))
    o.data.materials.append(m)
    return o

UNI = "/System/Library/Fonts/Supplemental/Arial Unicode.ttf"
BOLD = "/System/Library/Fonts/Supplemental/Arial Bold.ttf"
col = (1.0, 0.05, 0.03) if BAD else (0.06, 1.0, 0.3)
# plan à 1 m devant la caméra : largeur visible ≈ 36/40 = 0.9 m
bpy.ops.mesh.primitive_circle_add(vertices=64, radius=0.042, fill_type="NGON")
disc = bpy.context.object
disc.parent = cam
disc.location = (-0.36, 0.30, -1.0)
disc.data.materials.append(mat("Disc", (0, 0, 0), emit=(col, 0.75)))
label("✗" if BAD else "✓", UNI, 0.07, (-0.382, 0.30, -0.999), (1, 1, 1), 0.95)
label("MAUVAIS" if BAD else "BON", BOLD, 0.05, (-0.305, 0.30, -1.0), col, 0.8)
sub = "dos cambré · menton levé" if BAD else "menton rentré · bassin basculé · fessiers serrés"
label(sub, BOLD, 0.024, (-0.405, 0.24, -1.0), (0.85, 0.88, 0.92), 0.7)

# ---------------------------------------------------------------- compositing : halo (bloom)
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

if STILL:
    sc.frame_set(STILL)
    sc.render.filepath = f"{OUT}/{VARIANT}_still_{STILL}.png"
    bpy.ops.render.render(write_still=True)
else:
    bpy.ops.render.render(animation=True)
