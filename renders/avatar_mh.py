"""Avatar réaliste « Mon corps » : corps humain MakeHuman (maillage et cibles en licence CC0, makehumancommunity/makehuman)
exporté en un fichier léger par sexe, avec une déformation par groupe musculaire.

Corps de base = maillage neutre + cibles « jeune adulte, muscle moyen, poids moyen » du sexe, ethnies mélangées à parts égales
(réglage par défaut de MakeHuman). Déformations (vecteurs, comme les cibles MakeHuman) :
 pecs, dos, épaules, bras, abdos, trapèzes, jambes, fessiers, mollets, gras (poids moyen → max), musc (muscle moyen → max, global).
Le short est tiré de la géométrie « helper-tights » coupée à mi-cuisse ; les yeux de « helper-l/r-eye ».

usage : python3 renders/avatar_mh.py <dossier makehuman/data> <dossier_sortie>
sortie : mh_m.bin, mh_f.bin (format AVT2, lu par corps.js)
"""
import sys, os, struct, math

DATA, OUT = sys.argv[1], sys.argv[2]
T = os.path.join(DATA, "targets")


def load_obj():
    V, F, grp = [], [], None
    for ln in open(os.path.join(DATA, "3dobjs", "base.obj")):
        if ln.startswith("v "):
            V.append([float(x) for x in ln.split()[1:4]])
        elif ln.startswith("g "):
            grp = ln.split()[1]
        elif ln.startswith("f "):
            F.append((grp, [int(t.split("/")[0]) - 1 for t in ln.split()[1:]]))
    return V, F


def target(rel):
    d = {}
    for ln in open(os.path.join(T, rel)):
        if ln[:1] in "#\n" or not ln.strip():
            continue
        i, x, y, z = ln.split()
        d[int(i)] = (float(x), float(y), float(z))
    return d


def add(dst, src, w=1.0):
    for i, (x, y, z) in src.items():
        a = dst.setdefault(i, [0.0, 0.0, 0.0])
        a[0] += x * w; a[1] += y * w; a[2] += z * w
    return dst


def mix(*parts):
    out = {}
    for rel, w in parts:
        add(out, target(rel), w)
    return out


def side(fmt):
    return [(fmt.format(s), 1.0) for s in "lr"]


V0, F = load_obj()


def export(sex):
    u = "macrodetails/universal-{}-young-{}muscle-{}weight.target"
    base = mix((u.format(sex, "average", "average"), 1.0),
               *[(f"macrodetails/{e}-{sex}-young.target", 1 / 3) for e in ("african", "asian", "caucasian")])
    P = [list(v) for v in V0]
    for i, d in base.items():
        P[i][0] += d[0]; P[i][1] += d[1]; P[i][2] += d[2]
    avg = target(u.format(sex, "average", "average"))
    M = {
        "pecs": mix(("torso/torso-muscle-pectoral-incr.target", 1.0)),
        "dos": mix(("torso/torso-muscle-dorsi-incr.target", 1.0), ("torso/torso-vshape-incr.target", 0.45)),
        "epaules": mix(*side("armslegs/{}-upperarm-shoulder-muscle-incr.target")),
        "bras": mix(*side("armslegs/{}-upperarm-muscle-incr.target"), *[(r, .7) for r, _ in side("armslegs/{}-lowerarm-muscle-incr.target")]),
        "abdos": mix(("stomach/stomach-tone-incr.target", 1.0)),
        "trapezes": mix(("neck/neck-back-scale-depth-incr.target", 0.8), ("neck/neck-scale-horiz-incr.target", 0.35)),
        "jambes": mix(*side("armslegs/{}-upperleg-muscle-incr.target")),
        "fessiers": mix(("buttocks/buttocks-volume-incr.target", 1.0)),
        "mollets": mix(*side("armslegs/{}-lowerleg-muscle-incr.target")),
        "gras": add(mix((u.format(sex, "average", "max"), 1.0)), avg, -1.0),
        "musc": add(mix((u.format(sex, "max", "average"), 1.0)), avg, -1.0),
    }
    # géométrie gardée : corps, short (collant coupé à mi-cuisse), yeux
    body = [f for g, f in F if g == "body"]
    tights = [f for g, f in F if g == "helper-tights"]
    eyes = [f for g, f in F if g in ("helper-l-eye", "helper-r-eye")]
    ys = [P[i][1] for f in body for i in f]
    y0, y1 = min(ys), max(ys)
    H = y1 - y0
    cut = y0 + H * (0.455 if sex == "male" else 0.47)
    waist = y0 + H * (0.585 if sex == "male" else 0.6)
    shorts = [f for f in tights if min(P[i][1] for i in f) > cut and max(P[i][1] for i in f) < waist]
    used, remap = [], {}
    for f in body + shorts + eyes:
        for i in f:
            if i not in remap:
                remap[i] = len(used); used.append(i)

    def tris(fs):
        out = []
        for f in fs:
            r = [remap[i] for i in f]
            for k in range(1, len(r) - 1):
                out += [r[0], r[k], r[k + 1]]
        return out

    TB, TS, TE = tris(body), tris(shorts), tris(eyes)
    nv = len(used)
    S = 0.1  # décimètres → mètres, pieds à y = 0
    pos = [((P[i][0]) * S, (P[i][1] - y0) * S, P[i][2] * S) for i in used]
    lo = [min(p[k] for p in pos) for k in range(3)]
    sz = [max(p[k] for p in pos) - lo[k] for k in range(3)]
    names = ["pecs", "dos", "epaules", "bras", "abdos", "trapezes", "jambes", "fessiers", "mollets", "gras", "musc"]
    path = os.path.join(OUT, f"mh_{sex[0]}.bin")
    with open(path, "wb") as fh:
        w = fh.write
        w(struct.pack("<4s5I", b"AVT2", nv, len(TB) // 3, len(TS) // 3, len(TE) // 3, len(names)))
        w(struct.pack("<6f", *lo, *sz))
        for p in pos:
            w(struct.pack("<3H", *(round((p[k] - lo[k]) / sz[k] * 65535) for k in range(3))))
        for t in (TB, TS, TE):
            w(struct.pack(f"<{len(t)}H", *t))
        if (len(TB) + len(TS) + len(TE)) % 2:
            w(b"\0\0")
        for n in names:
            d = {remap[i]: v for i, v in M[n].items() if i in remap and max(abs(c) for c in v) > 1e-5}
            ids = sorted(d)
            m = max(max(abs(c) for c in d[i]) for i in ids) * S
            w(struct.pack("<If", len(ids), m / 32767))
            w(struct.pack(f"<{len(ids)}H", *ids))
            if len(ids) % 2:
                w(b"\0\0")
            for i in ids:
                w(struct.pack("<3h", *(round(c * S / m * 32767) for c in d[i])))
            if len(ids) % 2:
                w(b"\0\0")
            print(f"  {n}: {len(ids)} sommets, max {m * 100:.1f} cm")
    print(f"{path}: {nv} sommets, {len(TB) // 3}+{len(TS) // 3}+{len(TE) // 3} triangles, hauteur {sz[1]:.2f} m, {os.path.getsize(path) // 1024} Ko")


export("male")
export("female")
