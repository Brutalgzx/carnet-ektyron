# Définition des exercices pour gen.py.
#
# Repère : x = devant le mannequin, y = côté droit, z = haut, sol en z = 0 (mètres).
# Angles dans le plan de profil (degrés) : 0 = vers l'avant, 90 = vers le haut,
# -90 = vers le bas, 180 = vers l'arrière.
#   pel (x, z)   centre du bassin          t / pv / t2  buste (lombaires / bassin / thorax)
#   hd           tête (+ = menton rentré)  tw / lb      rotation / inclinaison latérale du thorax
#   th, sh, fo   cuisse, tibia, pied (direction absolue) ; ab/sab écart latéral, fy pointe de pied
#   ua, fa       bras, avant-bras ; uab/fab écart latéral
#   a  = cible de cheville, h = cible de main (cinématique inverse), kp / ep = pôle genou / coude
#     cible = (x, y, z) monde ou ("S"|"H"|"M", (avant, côté, haut)) dans le repère du thorax / bassin.
#     La composante « côté » est toujours comptée vers l'extérieur (miroir gauche / droite).
#   suffixe L / R : valeur propre à un côté.
# A = départ, B = fin du mouvement (C = autre côté pour cycle "alt").
# bad = surcharges pour la version « mauvais mouvement ».
# zgood / zbad = zones éclairées ; tgood / tbad = sous-titres.


def bench(x0, x1, top=0.45, y=0.0, w=0.30):
    cx = (x0 + x1) / 2
    L = x1 - x0
    out = [dict(k="box", c=(cx, y, top - 0.04), s=(L, w, 0.08), m="pad", bev=0.025),
           dict(k="box", c=(cx, y, top - 0.095), s=(L - 0.08, w - 0.06, 0.03), m="metal")]
    for x in (x0 + 0.1, x1 - 0.1):
        out += [dict(k="box", c=(x, y, (top - 0.11) / 2), s=(0.05, 0.05, top - 0.11), m="metal"),
                dict(k="box", c=(x, y, 0.015), s=(0.06, w + 0.12, 0.03), m="metal", bev=0.01)]
    return out


def floor_mat(x0, x1, w=0.66):
    return [dict(k="box", c=((x0 + x1) / 2, 0, 0.005), s=(x1 - x0, w, 0.01), m="mat")]


def column(x, y, h, w=0.12):
    return dict(k="box", c=(x, y, h / 2), s=(w, w + 0.04, h), m="frame")


def pullup_bar(z=2.22, x=0.0):
    return [dict(k="cyl", c=(x, 0, z), rad=0.016, d=1.3, m="chrome", ax="y"),
            dict(k="box", c=(x, -0.66, (z + 0.08) / 2), s=(0.07, 0.07, z + 0.08), m="frame"),
            dict(k="box", c=(x, 0.66, (z + 0.08) / 2), s=(0.07, 0.07, z + 0.08), m="frame")]


def cable(pulley, end=("hands", (0, 0, 0)), ax="y"):
    return [dict(k="pulley", c=pulley, ax=ax), dict(k="rod", a=pulley, b=end, rad=0.004)]


DBS = [dict(k="db", at="handL", ax="x"), dict(k="db", at="handR", ax="x")]
DBS_Y = [dict(k="db", at="handL", ax="y"), dict(k="db", at="handR", ax="y")]

EXOS = {}

# ---------------------------------------------------------------- jambes
EXOS["smsq"] = dict(
    A=dict(pel=(-0.02, 0.90), t=86, a=(0.10, 0.17, 0.085), kp=(1, 0.3, 0), fy=18,
           h=("S", (-0.09, 0.42, 0.04)), ep=(-0.5, 0.5, -1)),
    B=dict(pel=(-0.30, 0.47), t=62, kp=(1, 0.35, 0)),
    bad=dict(B=dict(kp=(1, -1.1, 0))),
    zgood=["quadL", "quadR", "gluteL", "gluteR"], zbad=["kneeL", "kneeR"],
    tgood="genoux dans l'axe des pieds · dos plaqué", tbad="genoux qui rentrent vers l'intérieur",
    props=[dict(k="barbell", at="hands"),
           dict(k="cyl", c=(-0.11, -0.60, 1.15), rad=0.022, d=2.3, m="chrome", ax="z"),
           dict(k="cyl", c=(-0.11, 0.60, 1.15), rad=0.022, d=2.3, m="chrome", ax="z"),
           dict(k="box", c=(-0.11, 0, 2.32), s=(0.1, 1.3, 0.08), m="frame", nofit=True),
           dict(k="box", c=(-0.11, 0, 0.03), s=(0.5, 1.3, 0.06), m="frame", nofit=True)],
    cam=dict(az=-35, el=14),
)

EXOS["press"] = dict(
    A=dict(pel=(0, 0.50), t=125, hd=10, a=(0.62, 0.15, 0.98), kp=(0, 0.25, 1), fo=132,
           h=("H", (0.0, 0.26, 0.0))),
    B=dict(a=(0.323, 0.15, 0.712)),
    bad=dict(B=dict(pel=(0.06, 0.55), pv=165, t=142, t2=125)),
    zgood=["quadL", "quadR", "gluteL", "gluteR"], zbad=["lowback"],
    tgood="dos et bassin plaqués · descente profonde", tbad="bassin qui décolle, le bas du dos s'enroule",
    props=[dict(k="box", at="anks", c=(0.027, 0, 0.119), s=(0.04, 0.6, 0.45), m="plate", r=(0, -42, 0)),
           dict(k="box", c=(-0.295, 0, 0.695), s=(0.06, 0.55, 0.75), m="pad", bev=0.02, r=(0, -35, 0)),
           dict(k="box", c=(-0.07, 0, 0.36), s=(0.5, 0.55, 0.06), m="pad", bev=0.02, r=(0, -20, 0)),
           dict(k="box", c=(-0.15, 0, 0.17), s=(0.3, 0.3, 0.34), m="frame"),
           dict(k="box", c=(0.62, -0.32, 0.72), s=(1.1, 0.05, 0.05), m="metal", r=(0, -42, 0)),
           dict(k="box", c=(0.62, 0.32, 0.72), s=(1.1, 0.05, 0.05), m="metal", r=(0, -42, 0)),
           dict(k="cyl", at="handL", c=(0, 0, 0), rad=0.018, d=0.12, m="pad", ax="x"),
           dict(k="cyl", at="handR", c=(0, 0, 0), rad=0.018, d=0.12, m="pad", ax="x")],
    cam=dict(az=-95, el=16),
)

EXOS["bulg"] = dict(
    A=dict(pel=(-0.05, 0.86), t=80, aL=(-0.62, 0.10, 0.52), aR=(0.30, 0.12, 0.085), foL=200,
           kpL=(0.3, 0, -1), kpR=(1, 0, 0), ua=-90, fa=-90, uab=9),
    B=dict(pel=(-0.13, 0.52), t=72),
    bad=dict(B=dict(kpR=(1, -1.2, 0), t=62)),
    zgood=["quadR", "gluteR"], zbad=["kneeR"],
    tgood="genou avant au-dessus du pied, buste un peu penché", tbad="le genou avant rentre vers l'intérieur",
    props=bench(-0.95, -0.40, top=0.45, y=-0.10) + DBS,
    cam=dict(az=-50, el=12),
)

EXOS["lcurl2"] = dict(
    A=dict(pel=(0, 0.61), t=0, th=180, sh=180, h=(0.70, 0.22, 0.47), ep=(0, 1, 0.3)),
    B=dict(sh=60),
    bad=dict(B=dict(pel=(0, 0.72), pv=-28, t=8, th=200, sh=70)),
    zgood=["hamL", "hamR"], zbad=["lowback"],
    tgood="bassin plaqué, talons vers les fesses", tbad="bassin qui décolle, le bas du dos se cambre",
    props=bench(-0.38, 0.80, top=0.50) + [
        dict(k="cyl", at="akbs", c=(0, 0, 0), rad=0.05, d=0.42, m="foam", ax="y"),
        dict(k="rod", a=(-0.44, 0.27, 0.48), b=("akbs", (0, 0.27, 0)), rad=0.016, m="frame"),
        dict(k="cyl", c=(-0.44, 0, 0.48), rad=0.03, d=0.6, m="frame", ax="y"),
        dict(k="cyl", c=(0.72, -0.22, 0.45), rad=0.02, d=0.14, m="pad", ax="z"),
        dict(k="cyl", c=(0.72, 0.22, 0.45), rad=0.02, d=0.14, m="pad", ax="z")],
    cam=dict(az=-62, el=20),
)

ABD_PROPS = [dict(k="box", c=(0.0, 0, 0.42), s=(0.5, 0.5, 0.06), m="pad", bev=0.02),
             dict(k="box", c=(-0.164, 0, 0.866), s=(0.06, 0.5, 0.6), m="pad", bev=0.02, r=(0, -6, 0)),
             dict(k="box", c=(0, 0, 0.2), s=(0.35, 0.3, 0.4), m="frame"),
             dict(k="box", c=(0.45, 0, 0.05), s=(0.22, 0.8, 0.03), m="metal"),
             dict(k="cyl", at="kneeL", c=(0.02, -0.085, 0), rad=0.05, d=0.18, m="foam", ax="z"),
             dict(k="cyl", at="kneeR", c=(0.02, 0.085, 0), rad=0.05, d=0.18, m="foam", ax="z")]

EXOS["abd"] = dict(
    A=dict(pel=(0, 0.55), t=96, th=-5, sh=-90, sab=0, ab=6, h=("H", (0.05, 0.27, 0.02))),
    B=dict(ab=38),
    bad=dict(B=dict(t=68, t2=58, hd=20, ab=44)),
    zgood=["gmedL", "gmedR"], zbad=["lowback"],
    tgood="dos calé, genoux écartés, retour contrôlé", tbad="le buste se décolle et donne de l'élan",
    props=ABD_PROPS + [dict(k="cyl", c=(0.05, -0.30, 0.52), rad=0.018, d=0.14, m="pad", ax="x"),
                       dict(k="cyl", c=(0.05, 0.30, 0.52), rad=0.018, d=0.14, m="pad", ax="x")],
    cam=dict(az=-22, el=22),
)

EXOS["abdp"] = dict(
    A=dict(pel=(0, 0.55), t=45, t2=40, hd=-5, th=-5, sh=-90, sab=0, ab=6,
           h=(0.55, 0.25, 0.60), ep=(0, 1, -0.5)),
    B=dict(ab=40),
    bad=dict(A=dict(t=50, t2=12, hd=30), B=dict(t=50, t2=12, hd=30)),
    zgood=["gluteL", "gluteR"], zbad=["lowback", "midback"],
    tgood="buste penché, dos plat : le grand fessier travaille", tbad="dos rond, épaules enroulées",
    props=ABD_PROPS + [dict(k="cyl", c=(0.57, -0.25, 0.58), rad=0.02, d=0.16, m="pad", ax="z"),
                       dict(k="cyl", c=(0.57, 0.25, 0.58), rad=0.02, d=0.16, m="pad", ax="z"),
                       dict(k="box", c=(0.57, 0, 0.5), s=(0.04, 0.54, 0.04), m="metal")],
    cam=dict(az=-70, el=20),
)

EXOS["rdl"] = dict(
    A=dict(pel=(0, 0.92), t=90, a=(0.04, 0.11, 0.085), kp=(1, 0, 0), ua=-90, fa=-90, uab=4),
    B=dict(pel=(-0.24, 0.85), t=20, hd=-5),
    bad=dict(B=dict(pel=(-0.08, 0.84), pv=48, t=20, t2=-15, hd=12)),
    zgood=["hamL", "hamR", "gluteL", "gluteR"], zbad=["lowback", "midback"],
    tgood="fesses en arrière, dos plat, charge près des jambes", tbad="dos rond : la charge tire sur les lombaires",
    props=DBS,
    cam=dict(az=-78, el=10),
)

EXOS["sumosq"] = dict(
    A=dict(pel=(0, 0.88), t=88, a=(0.0, 0.33, 0.085), fy=35, kp=(1, 0.75, 0), h=("H", (0.18, 0.025, -0.05))),
    B=dict(pel=(-0.04, 0.50), t=80),
    bad=dict(B=dict(kp=(1, 0.0, 0.15))),
    zgood=["gluteL", "gluteR", "addL", "addR"], zbad=["kneeL", "kneeR"],
    tgood="genoux dans l'axe des pointes, buste droit", tbad="genoux qui rentrent vers l'intérieur",
    props=[dict(k="db", at="hands", c=(0, 0, -0.10), ax="z")],
    cam=dict(az=-25, el=12),
)

EXOS["kick"] = dict(
    A=dict(pel=(0, 0.88), t=45, hd=-10, aL=(0.02, 0.10, 0.085), kpL=(1, 0, 0), thR=-80, shR=-95,
           h=(0.48, 0.22, 1.02)),
    B=dict(thR=-152, shR=-165),
    bad=dict(B=dict(thR=-205, shR=-200, pv=8, t=55, t2=62, hd=-35)),
    zgood=["gluteR", "hamR"], zbad=["lowback"],
    tgood="bassin fixe, pousse la jambe en arrière", tbad="jambe trop haute, le bas du dos se cambre",
    props=[column(0.70, 0.10, 2.1), dict(k="cyl", c=(0.52, 0, 1.02), rad=0.018, d=0.7, m="chrome", ax="y"),
           dict(k="box", c=(0.62, 0, 1.02), s=(0.18, 0.05, 0.05), m="frame")]
          + cable((0.62, 0.10, 0.12), ("ankR", (0, 0, 0)), ax="y")
          + [dict(k="cyl", at="ankR", c=(0, 0, 0), rad=0.048, d=0.07, m="pad", ax="z")],
    cam=dict(az=72, el=12),
)

EXOS["stepup"] = dict(
    A=dict(pel=(0.04, 0.86), t=78, aR=(0.37, 0.11, 0.53), aL=(-0.05, 0.11, 0.085), kp=(1, 0, 0),
           ua=-90, fa=-90, uab=9),
    B=dict(pel=(0.30, 1.37), t=88, aL=(0.15, 0.11, 0.62)),
    bad=dict(A=dict(t=55), B=dict(pel=(0.26, 1.22), t=60, kpR=(1, -1.4, 0))),
    zgood=["quadR", "gluteR"], zbad=["kneeR", "lowback"],
    tgood="tout le pied sur le banc, pousse dans le talon", tbad="genou qui rentre, buste plongé en avant",
    props=[dict(k="box", c=(0.42, 0, 0.42), s=(0.34, 1.1, 0.06), m="pad", bev=0.02),
           dict(k="box", c=(0.42, 0, 0.2), s=(0.26, 0.9, 0.4), m="frame")] + DBS,
    cam=dict(az=-50, el=12),
)

# ---------------------------------------------------------------- haut du corps
EXOS["dch"] = dict(
    A=dict(pel=(0.15, 0.56), t=180, a=(0.62, 0.22, 0.085), kp=(0.3, 0.2, 1),
           h=("S", (0.52, 0.17, -0.06)), ep=(0.6, 0.8, -0.3)),
    B=dict(h=("S", (0.10, 0.25, -0.10))),
    bad=dict(B=dict(h=("S", (0.10, 0.31, 0.03)), ep=(0, 1, -0.2))),
    zgood=["pecL", "pecR"], zbad=["shoulderL", "shoulderR"],
    tgood="coudes à 45°, omoplates serrées", tbad="coudes à 90° : l'épaule prend tout",
    props=bench(-0.80, 0.40) + DBS_Y,
    cam=dict(az=-55, el=36),
)

EXOS["tvert"] = dict(
    A=dict(pel=(0, 0.55), t=100, th=-3, sh=-90, sab=0, ab=4, h=("S", (0.10, 0.36, 0.55)), ep=(0.2, 1, -0.3)),
    B=dict(h=("S", (0.14, 0.33, 0.04)), ep=(0.15, 0.6, -1)),
    bad=dict(B=dict(t=125, hd=-15, h=("S", (0.18, 0.33, -0.12)))),
    zgood=["latL", "latR"], zbad=["lowback"],
    tgood="omoplates basses, coudes vers les poches", tbad="le buste bascule en arrière pour tirer",
    props=[dict(k="box", c=(0.0, 0, 0.42), s=(0.4, 0.45, 0.06), m="pad", bev=0.02),
           dict(k="box", c=(0.0, 0, 0.2), s=(0.25, 0.25, 0.4), m="frame"),
           dict(k="cyl", c=(0.36, 0, 0.67), rad=0.05, d=0.5, m="foam", ax="y"),
           dict(k="box", c=(0.68, 0, 1.22), s=(0.12, 0.16, 2.45), m="frame", nofit=True),
           dict(k="box", c=(0.37, 0, 2.43), s=(0.66, 0.1, 0.08), m="frame", nofit=True),
           dict(k="barbell", at="hands", plates=False, len=1.05)] + cable((0.06, 0, 2.36)),
    cam=dict(az=-140, el=12),
)

EXOS["rowu"] = dict(
    A=dict(pel=(-0.05, 0.93), t=8, hd=10, thL=-90, shL=180, aR=(0.0, 0.33, 0.085), kpR=(1, 0, 0),
           hL=(0.50, 0.20, 0.47), uaR=-90, faR=-90, uab=4),
    B=dict(uaR=168, faR=-95),
    bad=dict(B=dict(tw=35, t2=22)),
    zgood=["latR", "drearR"], zbad=["lowback"],
    tgood="dos plat, tire le coude vers la hanche", tbad="le buste pivote pour arracher la charge",
    props=bench(-0.40, 0.62, top=0.43, y=-0.12) + [dict(k="db", at="handR", ax="x")],
    cam=dict(az=55, el=22),
)

EXOS["rowc"] = dict(
    A=dict(pel=(0, 0.51), t=85, a=(0.68, 0.14, 0.30), kp=(0.2, 0, 1), h=("S", (0.52, 0.04, -0.10)), ep=(0, 0.3, -1)),
    B=dict(t=90, h=("S", (0.20, 0.08, -0.38)), ep=(-1, 0.3, -0.4)),
    bad=dict(A=dict(t=45, t2=22, hd=15), B=dict(t=118, t2=122)),
    zgood=["midback", "latL", "latR"], zbad=["lowback"],
    tgood="buste droit, omoplates serrées, poignée au nombril", tbad="le dos s'arrondit puis bascule en arrière",
    props=[dict(k="box", c=(-0.1, 0, 0.36), s=(1.3, 0.3, 0.06), m="pad", bev=0.02),
           dict(k="box", c=(-0.1, 0, 0.17), s=(1.1, 0.16, 0.33), m="frame"),
           dict(k="box", c=(0.80, 0, 0.30), s=(0.04, 0.5, 0.3), m="frame"),
           column(1.05, 0, 1.2), dict(k="cyl", at="hands", rad=0.016, d=0.16, m="chrome", ax="y")]
          + cable((1.0, 0, 0.32)),
    cam=dict(az=-115, el=16),
)

EXOS["facep"] = dict(
    A=dict(pel=(0, 0.92), t=88, a=(0.0, 0.13, 0.085), kp=(1, 0, 0), h=("S", (0.50, 0.06, 0.10)), ep=(0, 1, 0.2)),
    B=dict(h=("S", (0.10, 0.21, 0.25)), ep=(-0.3, 1, 0.6)),
    bad=dict(B=dict(t=105, hd=-10, h=("S", (0.18, 0.13, -0.15)), ep=(-0.3, 0.4, -1))),
    zgood=["drearL", "drearR", "midback"], zbad=["lowback"],
    tgood="coudes hauts, tire vers le front en écartant", tbad="coudes bas, le buste recule",
    props=[column(1.22, 0, 2.0), dict(k="pulley", c=(1.15, 0, 1.62), ax="y"),
           dict(k="rod", a=("handL", (0, 0, 0)), b=("hands", (0.12, 0, 0)), rad=0.011, m="rope"),
           dict(k="rod", a=("handR", (0, 0, 0)), b=("hands", (0.12, 0, 0)), rad=0.011, m="rope"),
           dict(k="rod", a=("hands", (0.12, 0, 0)), b=(1.15, 0, 1.62), rad=0.004)],
    cam=dict(az=-132, el=14),
)

EXOS["curld"] = dict(
    A=dict(pel=(0, 0.92), t=90, a=(0.0, 0.12, 0.085), kp=(1, 0, 0), ua=-88, fa=-88, uab=8, fab=10),
    B=dict(ua=-84, fa=55),
    bad=dict(A=dict(t=80), B=dict(pel=(0.04, 0.92), t=110, hd=-10, ua=-55, fa=70)),
    zgood=["bicL", "bicR"], zbad=["lowback"],
    tgood="coudes fixes, buste immobile", tbad="le buste se jette en arrière : élan",
    props=DBS_Y,
    cam=dict(az=-60, el=8),
)

# ---------------------------------------------------------------- abdos / gainage
EXOS["hlr"] = dict(
    A=dict(pel=(0, 1.10), t=90, h=(0.0, 0.26, 2.2), ep=(-0.3, 1, 0), th=-88, sh=-90),
    B=dict(pv=108, t=96, th=5, sh=-3),
    bad=dict(A=dict(pel=(0.15, 1.10), t=75), B=dict(pel=(-0.15, 1.08), t=112, pv=112, hd=-20, th=-40, sh=-45)),
    zgood=["abs", "oblL", "oblR"], zbad=["lowback"],
    tgood="bassin enroulé, jambes montées sans élan", tbad="balancier : l'élan fait le travail",
    props=pullup_bar(2.22),
    cam=dict(az=-60, el=6),
)

EXOS["deadbug"] = dict(
    cycle="alt",
    A=dict(pel=(0.25, 0.11), t=180, th=90, sh=0, h=("S", (0.55, 0.17, 0.0)), ep=(0, 1, 0)),
    B=dict(hR=("S", (0.12, 0.17, 0.48)), thL=8, shL=8),
    C=dict(hL=("S", (0.12, 0.17, 0.48)), thR=8, shR=8),
    bad=dict(B=dict(pv=158, t=195, t2=180), C=dict(pv=158, t=195, t2=180)),
    zgood=["abs", "oblL", "oblR"], zbad=["lowback"],
    tgood="bas du dos plaqué, bras et jambe opposés", tbad="le bas du dos se cambre et décolle",
    props=floor_mat(-0.75, 1.15),
    cam=dict(az=-75, el=30),
)

EXOS["heeltap"] = dict(
    cycle="alt",
    A=dict(pel=(0.20, 0.11), t=168, t2=150, hd=15, a=(0.48, 0.20, 0.085), kp=(0.3, 0, 1),
           h=(0.22, 0.30, 0.17)),
    B=dict(lb=22, hR=(0.34, 0.36, 0.12), hL=(0.26, 0.12, 0.24)),
    C=dict(lb=-22, hL=(0.34, 0.36, 0.12), hR=(0.26, 0.12, 0.24)),
    bad=dict(A=dict(t=180, t2=178, hd=45), B=dict(lb=4), C=dict(lb=-4)),
    zgood=["oblL", "oblR", "abs"], zbad=["neck"],
    tgood="épaules décollées, touche chaque talon", tbad="épaules au sol, la nuque tire",
    props=floor_mat(-0.75, 0.85),
    cam=dict(az=-78, el=34),
)

EXOS["rtwist"] = dict(
    cycle="alt",
    A=dict(pel=(0, 0.10), t=125, hd=10, a=(0.45, 0.11, 0.14), kp=(0, 0, 1), h=("S", (0.33, 0.04, -0.18))),
    B=dict(tw=40),
    C=dict(tw=-40),
    bad=dict(A=dict(t=122, t2=95, hd=25),
             B=dict(tw=8, hR=("S", (0.30, 0.25, -0.20)), hL=("S", (0.30, -0.17, -0.20))),
             C=dict(tw=-8, hL=("S", (0.30, 0.25, -0.20)), hR=("S", (0.30, -0.17, -0.20)))),
    zgood=["oblL", "oblR", "abs"], zbad=["lowback"],
    tgood="dos droit, ce sont les épaules qui tournent", tbad="dos rond, seuls les bras bougent",
    props=floor_mat(-0.6, 0.75) + [dict(k="db", at="hands", ax="y", size=0.8)],
    cam=dict(az=-30, el=25),
)

EXOS["suitc"] = dict(
    A=dict(pel=(0.15, 0.11), t=180, th=6, sh=6, h=("S", (0.08, 0.17, 0.50)), ep=(0, 1, 0)),
    B=dict(t=140, t2=128, th=105, sh=20, h=("S", (0.40, 0.20, -0.22))),
    bad=dict(A=dict(pv=158, t=195, t2=182, th=0, sh=0), B=dict(hd=50)),
    zgood=["abs", "oblL", "oblR"], zbad=["lowback", "neck"],
    tgood="bas du dos plaqué, ramène genoux et buste", tbad="dos cambré en bas, nuque tirée en haut",
    props=floor_mat(-0.85, 1.05),
    cam=dict(az=-50, el=30),
)

EXOS["gain"] = dict(
    A=dict(pel=(-0.03, 0.24), t=10, th=190, sh=190, fo=-80, ua=-90, fa=0, uab=4, fab=-8),
    B=dict(pv=14),
    bad=dict(B=dict(pel=(-0.03, 0.11), pv=5, t=34, t2=24, th=183, sh=183, hd=35)),
    zgood=["abs", "gluteL", "gluteR"], zbad=["lowback", "neck"],
    tgood="corps aligné, fessiers et abdos serrés", tbad="bassin qui s'affaisse, dos creusé",
    props=floor_mat(-1.05, 0.95),
    cam=dict(az=-55, el=22),
)

ROMY = ["smsq", "press", "bulg", "lcurl2", "abd", "abdp", "rdl", "sumosq", "kick", "stepup", "dch",
        "tvert", "rowu", "hlr", "deadbug", "heeltap", "rowc", "facep", "curld", "rtwist", "suitc", "gain"]

# ================================================================ lot 2 : tous les autres exercices
def seat(x=0.0, top=0.45, back=None, w=0.45):
    out = [dict(k="box", c=(x, 0, top - 0.03), s=(0.42, w, 0.06), m="pad", bev=0.02),
           dict(k="box", c=(x, 0, (top - 0.06) / 2), s=(0.24, 0.24, top - 0.06), m="frame")]
    if back is not None:   # back = (centre x, centre z, angle du buste)
        out.append(dict(k="box", c=(back[0], 0, back[1]), s=(0.06, w, 0.62), m="pad", bev=0.02, r=(0, 90 - back[2], 0)))
    return out


def back_pad(H, t, w=0.45, L=0.62, off=0.13):
    import math
    u = (math.cos(math.radians(t)), math.sin(math.radians(t)))
    n = (math.cos(math.radians(t - 90)), math.sin(math.radians(t - 90)))
    c = (H[0] + u[0] * 0.33 - n[0] * off, 0, H[1] + u[1] * 0.33 - n[1] * off)
    return dict(k="box", c=c, s=(0.06, w, L), m="pad", bev=0.02, r=(0, 90 - t, 0))


def smith(x, rails=0.60):
    return [dict(k="cyl", c=(x, -rails, 1.15), rad=0.022, d=2.3, m="chrome", ax="z"),
            dict(k="cyl", c=(x, rails, 1.15), rad=0.022, d=2.3, m="chrome", ax="z"),
            dict(k="box", c=(x, 0, 2.32), s=(0.1, 1.3, 0.08), m="frame", nofit=True),
            dict(k="box", c=(x, 0, 0.03), s=(0.5, 1.3, 0.06), m="frame", nofit=True)]


STAND = dict(pel=(0, 0.92), t=90, a=(0.0, 0.12, 0.085), kp=(1, 0, 0))

EXOS["hack"] = dict(
    A=dict(pel=(-0.05, 0.98), t=118, a=(0.30, 0.15, 0.25), kp=(1, 0.3, 0.2), fo=20, h=("S", (0.06, 0.24, 0.05))),
    B=dict(pel=(0.161, 0.583)),
    bad=dict(B=dict(pel=(0.20, 0.62), pv=150, t=132, t2=118)),
    zgood=["quadL", "quadR", "gluteL", "gluteR"], zbad=["lowback"],
    tgood="dos et bassin collés au dossier, genoux dans l'axe", tbad="bassin qui décolle du dossier en bas",
    props=[dict(k="box", at="S", c=(0.0, 0, -0.305), s=(0.06, 0.45, 0.85), m="pad", bev=0.02, r=(0, -28, 0)),
           dict(k="box", at="S", c=(0.0, -0.17, 0.07), s=(0.16, 0.1, 0.07), m="pad", bev=0.02),
           dict(k="box", at="S", c=(0.0, 0.17, 0.07), s=(0.16, 0.1, 0.07), m="pad", bev=0.02),
           dict(k="box", c=(-0.17, -0.3, 0.93), s=(0.05, 0.05, 2.0), m="metal", r=(0, -28, 0)),
           dict(k="box", c=(-0.17, 0.3, 0.93), s=(0.05, 0.05, 2.0), m="metal", r=(0, -28, 0)),
           dict(k="box", c=(0.367, 0, 0.21), s=(0.5, 0.7, 0.04), m="plate", r=(0, -20, 0)),
           dict(k="box", c=(0.2, 0, 0.08), s=(0.6, 0.5, 0.16), m="frame")],
    cam=dict(az=-75, el=15),
)

EXOS["rdlx"] = dict(
    A=dict(pel=(0, 0.92), t=90, a=(0.04, 0.12, 0.085), kp=(1, 0, 0), ua=-80, fa=-80, uab=5),
    B=dict(pel=(-0.24, 0.85), t=20, hd=-5, ua=-102, fa=-102),
    bad=dict(B=dict(pel=(-0.08, 0.84), pv=48, t=20, t2=-15, hd=12, ua=-78, fa=-78)),
    zgood=["hamL", "hamR", "gluteL", "gluteR"], zbad=["lowback", "midback"],
    tgood="barre collée aux jambes, fesses en arrière, dos neutre", tbad="dos rond, barre qui s'éloigne des jambes",
    props=[dict(k="barbell", at="hands")],
    cam=dict(az=-78, el=10),
)


def incline(dumb):
    A = dict(pel=(0.1, 0.55), t=150, hd=10, a=(0.60, 0.25, 0.085), kp=(0.3, 0.3, 1))
    if dumb:
        A.update(h=("S", (0.53, 0.15, -0.03)), ep=(0.4, 0.8, -0.6))
        B = dict(h=("S", (0.10, 0.26, -0.08)))
        bad = dict(B=dict(h=("S", (0.10, 0.31, 0.04)), ep=(0, 1, -0.1)))
        pr = DBS_Y
    else:
        A.update(h=(-0.25, 0.40, 1.36), ep=(0.4, 0.8, -0.8))
        B = dict(h=(-0.25, 0.40, 0.93))
        bad = dict(B=dict(h=(-0.34, 0.40, 0.98), ep=(0, 1, 0)))
        pr = [dict(k="barbell", at="hands")] + smith(-0.25)
    return dict(A=A, B=B, bad=bad, zgood=["pecL", "pecR"], zbad=["shoulderL", "shoulderR"],
                tgood="coudes vers les côtes, descente au haut des pecs",
                tbad="coudes ouverts, charge vers le cou : épaules en danger",
                props=pr + seat(0.08, 0.44) + [back_pad((0.1, 0.55), 150, w=0.32, L=0.8)],
                cam=dict(az=-60, el=25))


EXOS["incl"] = incline(False)
EXOS["dbinc"] = incline(True)

EXOS["benchx"] = dict(
    A=dict(pel=(0.15, 0.56), t=180, a=(0.62, 0.22, 0.085), kp=(0.3, 0.2, 1),
           h=("S", (0.52, 0.38, -0.08)), ep=(0.6, 0.8, -0.4)),
    B=dict(h=("S", (0.14, 0.40, -0.16))),
    bad=dict(B=dict(h=("S", (0.14, 0.40, 0.03)), ep=(0, 1, -0.1))),
    zgood=["pecL", "pecR"], zbad=["shoulderL", "shoulderR"],
    tgood="omoplates serrées, barre au bas des pecs", tbad="coudes à 90°, barre vers le cou",
    props=bench(-0.80, 0.40) + [dict(k="barbell", at="hands"),
                                dict(k="box", c=(-0.62, -0.55, 0.6), s=(0.06, 0.06, 1.2), m="frame"),
                                dict(k="box", c=(-0.62, 0.55, 0.6), s=(0.06, 0.06, 1.2), m="frame")],
    cam=dict(az=-55, el=36),
)


def pushup(kind):
    if kind == "decl":
        A = dict(pel=(-0.11, 0.56), t=2.1, th=182.1, sh=182.1, fo=-80, h=(0.44, 0.25, 0.04), ep=(-0.5, 0.9, 0))
        B = dict(pel=(-0.137, 0.317), t=-14.7, th=165.3, sh=165.3)
        bad = dict(B=dict(pel=(-0.137, 0.24), pv=-30, t=-8, th=168, sh=168, hd=35, ep=(0, 1, 0)))
        pr = [dict(k="box", c=(-1.0, 0, 0.225), s=(0.42, 0.55, 0.45), m="pad", bev=0.02)]
    else:
        A = dict(pel=(-0.149, 0.381), t=19.4, th=199.4, sh=199.4, fo=-80, h=(0.40, 0.25, 0.04), ep=(-0.5, 0.9, 0))
        B = dict(pel=(-0.111, 0.137), t=2.5, th=182.5, sh=182.5)
        bad = dict(B=dict(pel=(-0.111, 0.08), pv=-20, t=10, th=184, sh=184, hd=30, ep=(0, 1, 0)))
        pr = []
    if kind == "diam":
        A.update(h=(0.40, 0.07, 0.04), ep=(-1, 0.2, 0))
    return dict(A=A, B=B, bad=bad, props=pr + floor_mat(-1.3, 0.8), cam=dict(az=-55, el=18))


EXOS["pompes"] = dict(pushup("std"), zgood=["pecL", "pecR"], zbad=["lowback", "shoulderL", "shoulderR"],
                      tgood="corps gainé de la tête aux pieds, coudes à 45°", tbad="bassin qui s'affaisse, coudes écartés")
EXOS["pompesd"] = dict(pushup("decl"), zgood=["pecL", "pecR", "dfrontL"], zbad=["lowback", "shoulderL", "shoulderR"],
                       tgood="pieds surélevés, gainage serré", tbad="bassin qui tombe, coudes écartés")
EXOS["diam"] = dict(pushup("diam"), zgood=["triL", "triR"], zbad=["elbowL", "elbowR", "lowback"],
                    tgood="mains sous les épaules, coudes qui frôlent le corps", tbad="coudes qui s'ouvrent, bassin qui tombe")

EXOS["pike"] = dict(
    A=dict(pel=(0, 0.85), t=-48, hd=0, a=(-0.35, 0.12, 0.085), kp=(1, 0, 0), fo=-60,
           h=(0.73, 0.22, 0.04), ep=(-0.6, 0.6, 0.3)),
    B=dict(pel=(0.08, 0.80), t=-62),
    bad=dict(B=dict(pel=(0.24, 0.55), t=-30, hd=-25)),
    zgood=["dfrontL", "dfrontR", "triL", "triR"], zbad=["shoulderL", "shoulderR"],
    tgood="fesses en l'air, la tête descend entre les mains", tbad="fesses qui descendent : ça devient une pompe",
    props=floor_mat(-0.7, 1.0),
    cam=dict(az=-60, el=15),
)


def dips_def(machine):
    pr = []
    for s in (-1, 1):
        pr += [dict(k="cyl", c=(0.05, s * 0.28, 1.18), rad=0.02, d=0.62, m="chrome", ax="x"),
               dict(k="box", c=(0.3, s * 0.28, 0.59), s=(0.05, 0.05, 1.18), m="frame"),
               dict(k="box", c=(-0.2, s * 0.28, 0.59), s=(0.05, 0.05, 1.18), m="frame")]
    if machine:
        pr.append(dict(k="box", at="knees", c=(-0.02, 0, -0.07), s=(0.22, 0.42, 0.05), m="pad", bev=0.015))
    return dict(
        A=dict(pel=(-0.04, 1.20), t=78, th=-100, sh=-150, h=(0.06, 0.28, 1.20), ep=(-1, 0.3, 0)),
        B=dict(pel=(-0.10, 0.93), t=68),
        bad=dict(B=dict(pel=(-0.10, 0.80), t=60, hd=25, ep=(0, 1, 0))),
        zgood=["pecL", "pecR", "triL", "triR"], zbad=["shoulderL", "shoulderR"],
        tgood="penché en avant, descends jusqu'à 90° au coude", tbad="trop bas, coudes ouverts, épaules qui roulent",
        props=pr, cam=dict(az=-55, el=12))


EXOS["dips"] = dips_def(True)
EXOS["dipsb"] = dips_def(False)

EXOS["pfly"] = dict(
    A=dict(pel=(0, 0.55), t=92, th=-3, sh=-90, sab=0, ab=6, h=("S", (0.0, 0.66, -0.02)), ep=(0, 0.2, -1)),
    B=dict(h=("S", (0.50, 0.06, -0.02))),
    bad=dict(A=dict(h=("S", (-0.25, 0.60, 0.0))), B=dict(t=72, hd=20)),
    zgood=["pecL", "pecR"], zbad=["shoulderL", "shoulderR"],
    tgood="dos calé, rapproche les biceps", tbad="bras trop en arrière, buste qui se décolle",
    props=seat() + [back_pad((0, 0.55), 92), column(-0.45, 0, 1.9),
                    dict(k="rod", a=(-0.05, -0.2, 1.62), b=("handL", (0, 0, 0.04)), rad=0.016, m="frame"),
                    dict(k="rod", a=(-0.05, 0.2, 1.62), b=("handR", (0, 0, 0.04)), rad=0.016, m="frame"),
                    dict(k="cyl", at="handL", rad=0.02, d=0.16, m="pad", ax="z"),
                    dict(k="cyl", at="handR", rad=0.02, d=0.16, m="pad", ax="z")],
    cam=dict(az=-30, el=20),
)

EXOS["ecbh"] = dict(
    A=dict(STAND, h=("S", (0.10, 0.45, -0.52)), ep=(0, 0.4, -1)),
    B=dict(h=("S", (0.48, 0.08, 0.10))),
    bad=dict(B=dict(t=106, hd=-10, h=("S", (0.30, 0.12, 0.20)), ep=(-0.5, 0.5, -0.5))),
    zgood=["pecL", "pecR"], zbad=["lowback"],
    tgood="du bas vers le haut, bras légèrement fléchis", tbad="le buste recule et les bras poussent",
    props=[column(-0.15, -1.0, 2.0), column(-0.15, 1.0, 2.0)]
          + cable((-0.12, -0.92, 0.15), ("handL", (0, 0, 0)), ax="x") + cable((-0.12, 0.92, 0.15), ("handR", (0, 0, 0)), ax="x"),
    cam=dict(az=-30, el=12),
)

EXOS["dbfly"] = dict(
    A=dict(pel=(0.15, 0.56), t=180, a=(0.62, 0.22, 0.085), kp=(0.3, 0.2, 1),
           h=("S", (0.52, 0.10, -0.08)), ep=(0.3, 0.3, -1)),
    B=dict(h=("S", (0.10, 0.55, -0.08))),
    bad=dict(B=dict(h=("S", (-0.14, 0.52, -0.05)))),
    zgood=["pecL", "pecR"], zbad=["shoulderL", "shoulderR"],
    tgood="bras légèrement fléchis, ouvre sans descendre trop bas", tbad="trop bas : l'épaule est en danger",
    props=bench(-0.80, 0.40) + DBS,
    cam=dict(az=-50, el=36),
)

EXOS["tract"] = dict(
    A=dict(pel=(0, 1.10), t=90, th=-80, sh=-95, h=(0.0, 0.36, 2.2), ep=(0.2, 1, -0.5)),
    B=dict(pel=(0, 1.46), ep=(0.2, 0.8, -1)),
    bad=dict(B=dict(pel=(0.15, 1.30), t=75, th=-30, sh=-80, hd=-30)),
    zgood=["latL", "latR"], zbad=["neck", "lowback"],
    tgood="omoplates basses d'abord, menton au-dessus de la barre", tbad="élan des jambes, menton qui tend vers la barre",
    props=pullup_bar(2.22),
    cam=dict(az=-130, el=8),
)

EXOS["rowm"] = dict(
    A=dict(pel=(0, 0.55), t=80, th=-5, sh=-90, sab=0, ab=6, h=("S", (0.56, 0.12, -0.05)), ep=(-1, 0.2, -0.3)),
    B=dict(h=("S", (0.05, 0.18, -0.12))),
    bad=dict(B=dict(t=102, hd=-10)),
    zgood=["latL", "latR", "midback"], zbad=["lowback"],
    tgood="sternum plaqué, coudes loin en arrière", tbad="le buste quitte l'appui pour tirer",
    props=seat() + [dict(k="box", c=(0.27, 0, 0.95), s=(0.06, 0.35, 0.4), m="pad", bev=0.02, r=(0, 10, 0)),
                    dict(k="box", c=(0.36, 0, 0.5), s=(0.08, 0.12, 1.0), m="frame"),
                    dict(k="rod", a=(0.75, -0.2, 1.5), b=("handL", (0, 0, 0)), rad=0.016, m="frame"),
                    dict(k="rod", a=(0.75, 0.2, 1.5), b=("handR", (0, 0, 0)), rad=0.016, m="frame"),
                    column(0.8, 0, 1.6),
                    dict(k="cyl", at="handL", rad=0.02, d=0.14, m="pad", ax="z"),
                    dict(k="cyl", at="handR", rad=0.02, d=0.14, m="pad", ax="z")],
    cam=dict(az=-115, el=16),
)

EXOS["rowx"] = dict(
    A=dict(pel=(-0.15, 0.85), t=40, a=(0.04, 0.15, 0.085), kp=(1, 0, 0), h=("S", (0.42, 0.24, -0.32)), ep=(-1, 0.3, 0.3)),
    B=dict(h=("S", (0.25, 0.24, -0.42))),
    bad=dict(A=dict(t=30, t2=5, hd=15), B=dict(t=70, t2=60)),
    zgood=["latL", "latR", "midback"], zbad=["lowback"],
    tgood="dos neutre à 45°, barre vers le nombril", tbad="le dos s'arrondit puis se redresse d'un coup",
    props=[dict(k="barbell", at="hands")],
    cam=dict(az=-70, el=12),
)

EXOS["rowinv"] = dict(
    A=dict(pel=(0.288, 0.149), t=175.6, th=-4.4, sh=-4.4, h=(-0.25, 0.30, 0.75), ep=(0.6, 0.7, -1)),
    B=dict(pel=(0.346, 0.398), t=158.1, th=-21.9, sh=-21.9),
    bad=dict(B=dict(pel=(0.30, 0.22), pv=150, t=140, th=-10, sh=-10)),
    zgood=["latL", "latR"], zbad=["lowback"],
    tgood="corps gainé, poitrine vers le bord", tbad="bassin qui tombe, seuls les bras tirent",
    props=[dict(k="box", c=(-0.6, 0, 0.77), s=(0.84, 0.9, 0.04), m="frame"),
           dict(k="box", c=(-0.95, -0.4, 0.38), s=(0.05, 0.05, 0.76), m="metal"),
           dict(k="box", c=(-0.95, 0.4, 0.38), s=(0.05, 0.05, 0.76), m="metal")] + floor_mat(-0.8, 1.3),
    cam=dict(az=-60, el=18),
)

EXOS["tlarg"] = dict(
    A=dict(pel=(0, 0.51), t=88, a=(0.68, 0.14, 0.30), kp=(0.2, 0, 1), h=("S", (0.52, 0.30, -0.02)), ep=(-0.6, 1, 0.4)),
    B=dict(h=("S", (0.18, 0.36, 0.0))),
    bad=dict(B=dict(t=118, t2=122, h=("S", (0.20, 0.25, -0.30)), ep=(-1, 0.3, -1))),
    zgood=["midback", "drearL", "drearR"], zbad=["lowback"],
    tgood="coudes levés, serre les omoplates", tbad="coudes bas, le buste bascule en arrière",
    props=EXOS["rowc"]["props"][:4] + [dict(k="barbell", at="hands", plates=False, len=0.95)] + cable((1.0, 0, 0.32)),
    cam=dict(az=-120, el=16),
)

EXOS["rfly"] = dict(
    A=dict(pel=(0, 0.60), t=88, th=-5, sh=-90, sab=0, ab=6, h=("S", (0.52, 0.10, 0.0)), ep=(-0.2, 1, 0.2)),
    B=dict(h=("S", (0.0, 0.62, 0.0))),
    bad=dict(B=dict(t=102, hd=-10, h=("S", (-0.1, 0.45, 0.08)), ep=(-1, 0.5, 0))),
    zgood=["drearL", "drearR"], zbad=["trap"],
    tgood="recule les coudes, pas les mains", tbad="épaules haussées, le buste recule",
    props=seat(0, 0.5) + [dict(k="box", c=(0.25, 0, 0.98), s=(0.06, 0.32, 0.5), m="pad", bev=0.02),
                          dict(k="box", c=(0.33, 0, 0.6), s=(0.08, 0.12, 1.2), m="frame"),
                          dict(k="cyl", at="handL", rad=0.02, d=0.16, m="pad", ax="z"),
                          dict(k="cyl", at="handR", rad=0.02, d=0.16, m="pad", ax="z")],
    cam=dict(az=-140, el=16),
)

EXOS["oiseau"] = dict(
    A=dict(pel=(-0.18, 0.86), t=25, hd=-5, a=(0.04, 0.13, 0.085), kp=(1, 0, 0), h=("S", (0.48, 0.12, -0.25)), ep=(0, 0.3, 1)),
    B=dict(h=("S", (0.05, 0.62, -0.05))),
    bad=dict(B=dict(t=55, hd=-20)),
    zgood=["drearL", "drearR"], zbad=["lowback"],
    tgood="buste penché, monte les coudes sur les côtés", tbad="le buste se relève : élan et lombaires",
    props=DBS,
    cam=dict(az=-140, el=22),
)

EXOS["ytw"] = dict(
    A=dict(pel=(0, 0.11), t=0, th=180, sh=180, h=("S", (0.03, 0.35, 0.45)), ep=(0, 0, 1)),
    B=dict(t=8, hd=-5, h=("S", (-0.15, 0.37, 0.42))),
    bad=dict(B=dict(t=25, pv=-10, hd=-40)),
    zgood=["drearL", "drearR", "midback"], zbad=["neck", "lowback"],
    tgood="pouces vers le ciel, tête dans l'axe", tbad="nuque cassée, dos qui se creuse",
    props=floor_mat(-0.95, 1.1),
    cam=dict(az=-120, el=30),
)

EXOS["dmil"] = dict(
    A=dict(pel=(0, 0.55), t=97, th=-3, sh=-92, ab=8, sab=4, h=("S", (0.05, 0.33, 0.10)), ep=(0.2, 1, -0.6)),
    B=dict(h=("S", (0.04, 0.20, 0.62))),
    bad=dict(B=dict(pv=80, t=108, t2=118, hd=15)),
    zgood=["dfrontL", "dfrontR", "dsideL", "dsideR"], zbad=["lowback"],
    tgood="dossier presque droit, abdos serrés", tbad="le dos se cambre pour pousser",
    props=seat() + [back_pad((0, 0.55), 97)] + DBS_Y,
    cam=dict(az=-40, el=14),
)

EXOS["elat"] = dict(
    A=dict(STAND, hR=("S", (0.22, 0.0, -0.50)), epR=(0, 1, 0.5), uaL=-90, faL=-90),
    B=dict(hR=("S", (0.05, 0.68, -0.02))),
    bad=dict(B=dict(lb=-15, hR=("S", (0.05, 0.55, 0.35)))),
    zgood=["dsideR"], zbad=["shoulderR", "trap"],
    tgood="monte le coude, stop à 90°", tbad="trop haut, l'épaule hausse : le trapèze prend tout",
    props=[column(0.0, -0.42, 2.0)] + cable((0.0, -0.33, 0.12), ("handR", (0, 0, 0)), ax="x")
          + [dict(k="cyl", at="handR", rad=0.016, d=0.12, m="chrome", ax="x")],
    cam=dict(az=-20, el=10),
)

EXOS["elmac"] = dict(
    A=dict(pel=(0, 0.55), t=92, th=-3, sh=-90, sab=0, ab=6, ua=-90, uab=12, fa=0, fab=0),
    B=dict(uab=85),
    bad=dict(B=dict(uab=108, t=104, hd=-15)),
    zgood=["dsideL", "dsideR"], zbad=["trap", "lowback"],
    tgood="trajectoire guidée, stop à 90°", tbad="trop haut et le buste part en arrière",
    props=seat() + [back_pad((0, 0.55), 92, w=0.3),
                    dict(k="cyl", at="elL", rad=0.045, d=0.16, m="foam", ax="x"),
                    dict(k="cyl", at="elR", rad=0.045, d=0.16, m="foam", ax="x")],
    cam=dict(az=-25, el=14),
)

EXOS["elath"] = dict(
    A=dict(STAND, t=82, ua=-90, uab=10, fa=-88, fab=12),
    B=dict(uab=85, fa=-80, fab=80),
    bad=dict(B=dict(t=106, hd=-10, uab=102, fab=100)),
    zgood=["dsideL", "dsideR"], zbad=["lowback", "trap"],
    tgood="léger penché, les coudes mènent, stop à 90°", tbad="élan du buste, bras trop hauts",
    props=DBS,
    cam=dict(az=-25, el=10),
)

EXOS["pupi"] = dict(
    A=dict(pel=(0, 0.6), t=75, th=-3, sh=-90, sab=0, ab=6, ua=-40, fa=-30, uab=10, fab=10),
    B=dict(fa=100),
    bad=dict(A=dict(fa=-52), B=dict(ua=-15, t=95, fa=120)),
    zgood=["bicL", "bicR"], zbad=["elbowL", "elbowR"],
    tgood="aisselle sur le support, descente contrôlée", tbad="descente lâchée, coudes qui décollent",
    props=seat(0, 0.5) + [dict(k="box", c=(0.21, 0, 0.98), s=(0.35, 0.5, 0.05), m="pad", bev=0.02, r=(0, 40, 0)),
                          dict(k="box", c=(0.30, 0, 0.45), s=(0.1, 0.12, 0.9), m="frame"),
                          dict(k="barbell", at="hands", small=True, len=1.0)],
    cam=dict(az=-60, el=14),
)

EXOS["cpou"] = dict(
    A=dict(STAND, ua=-108, fa=-108, uab=6),
    B=dict(fa=40, ua=-100),
    bad=dict(B=dict(ua=-50, fa=60, t=104)),
    zgood=["bicL", "bicR"], zbad=["lowback"],
    tgood="tension dès le départ, coudes fixes", tbad="coudes qui avancent, le buste donne l'élan",
    props=[column(-0.7, 0, 2.0), dict(k="barbell", at="hands", plates=False, len=0.55)] + cable((-0.62, 0, 0.12)),
    cam=dict(az=-65, el=10),
)

EXOS["curlh"] = dict(
    A=dict(pel=(0.1, 0.55), t=135, hd=15, a=(0.60, 0.22, 0.085), kp=(0.3, 0.3, 1), ua=-92, fa=-92, uab=6),
    B=dict(fa=50),
    bad=dict(B=dict(ua=-40, fa=80, hd=30)),
    zgood=["bicL", "bicR"], zbad=["shoulderL", "shoulderR"],
    tgood="bras qui pendent derrière le buste", tbad="coudes qui avancent : le biceps ne s'étire plus",
    props=seat(0.08, 0.44) + [back_pad((0.1, 0.55), 135, w=0.32, L=0.8)] + DBS_Y,
    cam=dict(az=-65, el=16),
)


def curl_stand(props, zg, tg):
    return dict(
        A=dict(STAND, ua=-88, fa=-88, uab=8, fab=10),
        B=dict(ua=-84, fa=55),
        bad=dict(A=dict(t=80), B=dict(pel=(0.04, 0.92), t=110, hd=-10, ua=-55, fa=70)),
        zgood=zg, zbad=["lowback"], tgood=tg, tbad="le buste se jette en arrière : élan",
        props=props, cam=dict(az=-60, el=8))


EXOS["marth"] = curl_stand(DBS, ["foreL", "foreR", "bicL", "bicR"], "prise neutre, coudes collés au corps")
EXOS["mart"] = curl_stand([column(0.55, 0, 2.0),
                           dict(k="rod", a=("handL", (0, 0, 0)), b=("hands", (0.06, 0, -0.08)), rad=0.011, m="rope"),
                           dict(k="rod", a=("handR", (0, 0, 0)), b=("hands", (0.06, 0, -0.08)), rad=0.011, m="rope")]
                          + cable((0.5, 0, 0.12), ("hands", (0.06, 0, -0.08))),
                          ["foreL", "foreR", "bicL", "bicR"], "pouces vers le ciel, coudes fixes")
EXOS["curlpdc"] = curl_stand([dict(k="box", at="hands", c=(0.04, 0, -0.17), s=(0.18, 0.3, 0.34), m="mat", bev=0.04)],
                             ["bicL", "bicR"], "coudes fixes, descente lente")
EXOS["curlpdc"]["A"].update(fab=-14)

EXOS["tri1"] = dict(
    A=dict(STAND, t=84, uaR=-88, faR=60, uab=4, uaL=-90, faL=-90),
    B=dict(faR=-88),
    bad=dict(A=dict(uaR=-50, t=72), B=dict(uaR=-95, t=72)),
    zgood=["triR"], zbad=["shoulderR"],
    tgood="coude collé au corps, seul l'avant-bras bouge", tbad="le coude se balade : l'épaule triche",
    props=[column(0.55, 0, 2.2)] + cable((0.45, 0, 2.05), ("handR", (0, 0, 0)), ax="y")
          + [dict(k="cyl", at="handR", rad=0.016, d=0.12, m="chrome", ax="y")],
    cam=dict(az=60, el=10),
)

EXOS["triv"] = dict(
    A=dict(STAND, t=84, ua=-85, fa=55, uab=2, fab=-8),
    B=dict(fa=-85),
    bad=dict(B=dict(t=68, uab=28, fab=10, ua=-70)),
    zgood=["triL", "triR"], zbad=["shoulderL", "shoulderR"],
    tgood="coudes fixes, tends complètement en bas", tbad="coudes qui s'écartent, buste qui plonge",
    props=[column(0.55, 0, 2.3), dict(k="barbell", at="hands", plates=False, len=0.4)] + cable((0.42, 0, 2.15)),
    cam=dict(az=-60, el=10),
)

EXOS["ovh"] = dict(
    A=dict(pel=(0, 0.90), t=70, hd=10, aL=(0.25, 0.12, 0.085), aR=(-0.25, 0.12, 0.085), kp=(1, 0, 0),
           ua=110, fa=250, uab=8, fab=0),
    B=dict(fa=112),
    bad=dict(A=dict(uab=35), B=dict(uab=35, pv=55, t=88, t2=100)),
    zgood=["triL", "triR"], zbad=["lowback", "elbowL", "elbowR"],
    tgood="abdos serrés, étire bien derrière la tête", tbad="coudes écartés, dos qui se cambre",
    props=[column(-0.75, 0, 2.0),
           dict(k="rod", a=("handL", (0, 0, 0)), b=("hands", (-0.1, 0, 0)), rad=0.011, m="rope"),
           dict(k="rod", a=("handR", (0, 0, 0)), b=("hands", (-0.1, 0, 0)), rad=0.011, m="rope")]
          + cable((-0.68, 0, 1.55), ("hands", (-0.1, 0, 0))),
    cam=dict(az=-70, el=10),
)

EXOS["extd"] = dict(
    A=dict(pel=(0, 0.55), t=90, th=-3, sh=-92, ab=8, sab=4, h=("S", (-0.12, 0.02, 0.36)), ep=(0, 0.4, 1)),
    B=dict(h=("S", (0.02, 0.02, 0.58))),
    bad=dict(A=dict(ep=(0, 1, 0.3), t=100), B=dict(ep=(0, 1, 0.3), t=104)),
    zgood=["triL", "triR"], zbad=["elbowL", "elbowR", "lowback"],
    tgood="coudes pointés vers le plafond", tbad="coudes écartés, dos cambré",
    props=seat() + [dict(k="db", at="hands", c=(0, 0, 0.05), ax="z")],
    cam=dict(az=-60, el=10),
)

EXOS["dipsbanc"] = dict(
    A=dict(pel=(-0.27, 0.48), t=88, a=(0.45, 0.15, 0.085), kp=(0.3, 0, 1), h=(-0.32, 0.20, 0.47), ep=(-1, 0.3, 0)),
    B=dict(pel=(-0.24, 0.24)),
    bad=dict(B=dict(pel=(-0.22, 0.12), hd=20, ep=(0, 1, 0))),
    zgood=["triL", "triR"], zbad=["shoulderL", "shoulderR"],
    tgood="coudes vers l'arrière, descends à 90°", tbad="trop bas, coudes ouverts : épaules en danger",
    props=[dict(k="box", c=(-0.52, 0, 0.42), s=(0.4, 0.44, 0.05), m="pad", bev=0.015),
           dict(k="box", c=(-0.70, 0, 0.66), s=(0.04, 0.44, 0.44), m="pad", bev=0.015)]
          + [dict(k="box", c=(x, y, 0.2), s=(0.035, 0.035, 0.4), m="metal") for x in (-0.34, -0.70) for y in (-0.19, 0.19)],
    cam=dict(az=-60, el=14),
)


def squat_db(goblet):
    A = dict(pel=(0, 0.90), t=88, a=(0.02, 0.18, 0.085), fy=20, kp=(1, 0.35, 0))
    if goblet:
        A.update(h=("S", (0.17, 0.06, -0.15)), ep=(0.3, 0.4, -1))
        pr = [dict(k="db", at="hands", c=(0.02, 0, -0.02), ax="z")]
    else:
        A.update(ua=0, fa=0, uab=5, fab=0)
        pr = []
    return dict(A=A, B=dict(pel=(-0.20, 0.45), t=62), props=pr, cam=dict(az=-40, el=12),
                zgood=["quadL", "quadR", "gluteL", "gluteR"])


EXOS["gobsq"] = dict(squat_db(True), bad=dict(B=dict(pv=115, t=48, t2=28, hd=20)), zbad=["lowback"],
                     tgood="haltère contre la poitrine, dos droit", tbad="en bas le bassin bascule, dos rond")
EXOS["squatpdc"] = dict(squat_db(False), bad=dict(B=dict(kp=(1, -1.1, 0))), zbad=["kneeL", "kneeR"],
                        tgood="3 s pour descendre, genoux dans l'axe", tbad="genoux qui rentrent vers l'intérieur")

EXOS["fentes"] = dict(
    A=dict(pel=(-0.02, 0.80), t=90, aR=(0.40, 0.12, 0.085), aL=(-0.45, 0.12, 0.12), kpR=(1, 0, 0), kpL=(1, 0, -1),
           foL=-40, ua=-90, fa=-90, uab=8),
    B=dict(pel=(-0.03, 0.47)),
    bad=dict(B=dict(pel=(0.14, 0.52), t=72)),
    zgood=["quadR", "gluteR"], zbad=["kneeR"],
    tgood="grand pas, genou arrière qui frôle le sol, buste droit", tbad="genou avant qui part loin devant le pied",
    props=[],
    cam=dict(az=-60, el=10),
)

EXOS["lext"] = dict(
    A=dict(pel=(0, 0.55), t=100, th=-2, sh=-95, h=("H", (0.0, 0.27, 0.0))),
    B=dict(sh=-2),
    bad=dict(B=dict(pel=(0.04, 0.60), t=74, hd=15)),
    zgood=["quadL", "quadR"], zbad=["lowback"],
    tgood="genou aligné avec la machine, contracte en haut", tbad="fesses qui décollent, le buste donne l'élan",
    props=seat() + [back_pad((0, 0.55), 100),
                    dict(k="cyl", at="akfs", rad=0.05, d=0.42, m="foam", ax="y"),
                    dict(k="rod", a=(0.44, 0.27, 0.55), b=("akfs", (0, 0.27, 0)), rad=0.016, m="frame"),
                    dict(k="cyl", c=(0.44, 0, 0.55), rad=0.03, d=0.6, m="frame", ax="y")],
    cam=dict(az=-70, el=12),
)

EXOS["lcurl1"] = dict(
    A=dict(pel=(0, 0.55), t=100, th=-2, sh=-2, h=("H", (0.0, 0.27, 0.0))),
    B=dict(sh=-100),
    bad=dict(B=dict(pel=(0.04, 0.62), t=70, hd=15)),
    zgood=["hamL", "hamR"], zbad=["lowback"],
    tgood="cuisses bloquées, descente contrôlée", tbad="les fesses décollent et le buste tire",
    props=seat() + [back_pad((0, 0.55), 100),
                    dict(k="cyl", at="akbs", rad=0.05, d=0.42, m="foam", ax="y"),
                    dict(k="cyl", c=(0.34, 0, 0.67), rad=0.05, d=0.45, m="foam", ax="y"),
                    dict(k="rod", a=(0.44, 0.27, 0.55), b=("akbs", (0, 0.27, 0)), rad=0.016, m="frame"),
                    dict(k="cyl", c=(0.44, 0, 0.55), rad=0.03, d=0.6, m="frame", ax="y")],
    cam=dict(az=-70, el=12),
)

EXOS["nordic"] = dict(
    A=dict(pel=(0.1, 0.30), t=200, a=(0.95, 0.12, 0.085), kp=(0, 0, 1), fo=90, h=(-0.05, 0.25, 0.03)),
    B=dict(pel=(0.08, 0.42), t=210, a=(0.48, 0.12, 0.085)),
    bad=dict(B=dict(pel=(0.08, 0.14), t=184)),
    zgood=["hamL", "hamR", "gluteL", "gluteR"], zbad=["lowback"],
    tgood="bassin levé, ramène les talons en glissant", tbad="le bassin retombe au sol",
    props=floor_mat(-0.85, 1.2) + [dict(k="box", at="anks", c=(0.04, 0, -0.075), s=(0.22, 0.36, 0.01), m="rope")],
    cam=dict(az=-70, el=24),
)

EXOS["pont"] = dict(
    A=dict(pel=(0.1, 0.11), t=180, aR=(0.48, 0.13, 0.085), kpR=(0.3, 0, 1), thL=10, shL=10, h=(-0.1, 0.28, 0.03)),
    B=dict(pel=(0.1, 0.40), t=206.6, thL=26.6, shL=26.6),
    bad=dict(B=dict(pel=(0.1, 0.46), pv=235, t=212, t2=200)),
    zgood=["gluteR", "hamR"], zbad=["lowback"],
    tgood="pousse dans le talon, serre les fessiers", tbad="le dos se cambre au lieu des fessiers",
    props=floor_mat(-0.85, 1.15),
    cam=dict(az=-70, el=22),
)


def calf(kind):
    if kind == "seat":
        A = dict(pel=(-0.10, 0.52), t=92, a=(0.34, 0.11, 0.114), kp=(1, 0, 1), fo=25, h=("H", (0.25, 0.20, 0.1)))
        B = dict(a=(0.387, 0.11, 0.186), fo=-35)
        bad = dict(A=dict(a=(0.36, 0.11, 0.15), fo=0), B=dict(a=(0.375, 0.11, 0.17), fo=-18))
        pr = seat(-0.10, 0.47) + [dict(k="box", at="knees", c=(0, 0, 0.075), s=(0.15, 0.45, 0.06), m="pad", bev=0.02),
                                   dict(k="box", c=(0.55, 0, 0.045), s=(0.4, 0.5, 0.09), m="frame")]
        return dict(A=A, B=B, bad=bad, props=pr, zgood=["calfL", "calfR"], zbad=["calfL", "calfR"],
                    tgood="talons tout en bas, puis monte sur la pointe", tbad="demi-mouvement : les talons ne descendent pas",
                    cam=dict(az=-70, el=12))
    up = 0.11 if kind != "mach" else 0.0
    A = dict(pel=(0.0, 0.95 + up), t=90, a=(0.015, 0.11, 0.114 + up), kp=(1, 0, 0), fo=25)
    B = dict(pel=(0.04, 1.02 + up), a=(0.062, 0.11, 0.186 + up), fo=-35)
    bad = dict(A=dict(pel=(0.02, 0.90 + up), a=(0.04, 0.11, 0.15 + up), fo=0),
               B=dict(pel=(0.04, 0.93 + up), a=(0.055, 0.11, 0.17 + up), fo=-18))
    if kind == "mach":
        A.update(h=("S", (0.12, 0.25, 0.12)))
        pr = [dict(k="box", c=(0.20, 0, 0.045), s=(0.40, 0.5, 0.09), m="frame"),
              dict(k="box", at="S", c=(-0.02, -0.14, 0.08), s=(0.2, 0.12, 0.06), m="pad", bev=0.02),
              dict(k="box", at="S", c=(-0.02, 0.14, 0.08), s=(0.2, 0.12, 0.06), m="pad", bev=0.02),
              column(-0.35, 0, 2.0)]
        zg = ["calfL", "calfR"]
    else:
        A.update(aL=None, thL=-95, shL=-160, kpL=None, hL=(0.45, 0.25, 1.25), uaR=-90, faR=-90, uab=6)
        pr = [dict(k="box", c=(0.25, 0, 0.10), s=(0.5, 0.9, 0.2), m="frame", bev=0.01),
              dict(k="box", c=(0.62, 0, 1.0), s=(0.06, 1.4, 2.0), m="frame")]
        if kind == "db":
            pr.append(dict(k="db", at="handR", ax="x"))
        else:
            A.update(hR=(0.45, 0.25, 1.25), uaR=None)
        zg = ["calfR"]
    return dict(A=A, B=B, bad=bad, props=pr, zgood=zg, zbad=["kneeL", "kneeR"] if kind == "mach" else ["kneeR"],
                tgood="amplitude complète, pause en bas en étirement", tbad="demi-amplitude, le genou rebondit",
                cam=dict(az=-60, el=10))


EXOS["moll"] = calf("mach")
EXOS["moll2"] = calf("seat")
EXOS["mollh"] = calf("db")
EXOS["mollpdc"] = calf("bw")

EXOS["crun"] = dict(
    A=dict(pel=(0, 0.52), t=80, th=-90, sh=180, fo=-80, h=("S", (0.12, 0.10, 0.18)), ep=(0.3, 0.3, -1)),
    B=dict(t=40, t2=-10, hd=30),
    bad=dict(B=dict(pel=(-0.25, 0.32), th=-160, sh=180, t=30, t2=22, hd=5)),
    zgood=["abs"], zbad=["lowback"],
    tgood="bassin immobile, enroule la poitrine vers les genoux", tbad="les fesses reculent : les hanches font le travail",
    props=floor_mat(-0.75, 0.9) + [column(0.55, 0, 2.3),
                                   dict(k="rod", a=("handL", (0, 0, 0)), b=("hands", (0.06, 0, 0.1)), rad=0.011, m="rope"),
                                   dict(k="rod", a=("handR", (0, 0, 0)), b=("hands", (0.06, 0, 0.1)), rad=0.011, m="rope")]
          + cable((0.45, 0, 2.15), ("hands", (0.06, 0, 0.1))),
    cam=dict(az=-60, el=12),
)

EXOS["releve"] = dict(
    A=dict(pel=(0.1, 0.11), t=180, th=6, sh=6, h=(0.1, 0.25, 0.03)),
    B=dict(th=90, sh=90),
    bad=dict(A=dict(pv=158, t=195, t2=182, th=0, sh=0), B=dict(pv=160, t=192, t2=182, th=62, sh=62)),
    zgood=["abs"], zbad=["lowback"],
    tgood="bas du dos plaqué, jambes montées sans élan", tbad="le bas du dos se creuse et décolle",
    props=floor_mat(-0.85, 1.1),
    cam=dict(az=-70, el=24),
)

EXOS["bext"] = dict(
    A=dict(pel=(0, 1.0), t=-75, th=-135, sh=-135, fo=-45, h=("S", (0.12, -0.05, -0.12))),
    B=dict(t=45),
    bad=dict(B=dict(t=85, t2=95, hd=-35)),
    zgood=["lowback", "gluteL", "gluteR"], zbad=["lowback"],
    tgood="remonte jusqu'à l'alignement, pas au-delà", tbad="trop haut : le bas du dos se plie en arrière",
    props=[dict(k="box", c=(0.007, 0, 0.823), s=(0.10, 0.45, 0.25), m="pad", bev=0.03, r=(0, -135, 0)),
           dict(k="cyl", c=(-0.644, 0, 0.456), rad=0.05, d=0.4, m="foam", ax="y"),
           dict(k="box", c=(-0.70, 0, 0.32), s=(0.3, 0.45, 0.04), m="frame", r=(0, -45, 0)),
           dict(k="box", c=(-0.30, 0, 0.4), s=(0.08, 0.3, 0.9), m="frame", r=(0, 45, 0))],
    cam=dict(az=-80, el=10),
)

EXOS["superman"] = dict(
    A=dict(pel=(0, 0.11), t=0, th=180, sh=180, h=("S", (0.03, 0.25, 0.55)), ep=(0, 0, 1)),
    B=dict(t=10, hd=-5, th=172, sh=172, h=("S", (-0.12, 0.25, 0.52))),
    bad=dict(B=dict(t=25, hd=-45, th=160, sh=160)),
    zgood=["lowback", "gluteL", "gluteR"], zbad=["neck", "lowback"],
    tgood="décolle bras et jambes, regard vers le sol", tbad="nuque cassée, dos trop creusé",
    props=floor_mat(-0.95, 1.15),
    cam=dict(az=-60, el=24),
)

ALIAS = {"addab": "abdp"}
LOT2 = ["hack", "rdlx", "incl", "dbinc", "benchx", "pompes", "pompesd", "diam", "pike", "dips", "dipsb", "pfly",
        "ecbh", "dbfly", "tract", "rowm", "rowx", "rowinv", "tlarg", "rfly", "oiseau", "ytw", "dmil", "elat",
        "elmac", "elath", "pupi", "cpou", "curlh", "marth", "mart", "curlpdc", "tri1", "triv", "ovh", "extd",
        "dipsbanc", "gobsq", "squatpdc", "fentes", "lext", "lcurl1", "nordic", "pont", "moll", "moll2", "mollh",
        "mollpdc", "crun", "releve", "bext", "superman"]

# ================================================================ lot 3 : échauffements (w_) et étirements (s_)
WALL_R = [dict(k="box", c=(0.0, 0.66, 1.1), s=(1.4, 0.06, 2.2), m="frame")]

EXOS["w_card"] = dict(
    cycle="alt",
    A=dict(pel=(0, 0.98), t=72, hd=-5, aR=(0.42, 0.12, 0.35), aL=(0.08, 0.12, 0.35), kp=(1, 0.1, 0.4),
           h=(0.58, 0.22, 1.05), ep=(-0.3, 0.6, -1)),
    B=dict(aR=(0.25, 0.12, 0.18), aL=(0.25, 0.12, 0.52)),
    C=dict(aR=(0.25, 0.12, 0.52), aL=(0.25, 0.12, 0.18)),
    bad=dict(A=dict(pel=(0, 0.84), t=60, hd=10), B=dict(pel=(0, 0.84)), C=dict(pel=(0, 0.84))),
    zgood=["quadL", "quadR"], zbad=["kneeL", "kneeR"],
    tgood="allure facile : tu dois pouvoir parler", tbad="selle trop basse : genoux écrasés",
    props=[dict(k="box", c=(-0.02, 0, 0.88), s=(0.26, 0.16, 0.05), m="pad", bev=0.02),
           dict(k="rod", a=(0.0, 0, 0.86), b=(0.25, 0, 0.35), rad=0.02, m="frame"),
           dict(k="rod", a=(0.25, 0, 0.35), b=(0.58, 0, 1.0), rad=0.025, m="frame"),
           dict(k="cyl", c=(0.58, 0, 1.03), rad=0.016, d=0.5, m="chrome", ax="y"),
           dict(k="cyl", c=(0.55, 0, 0.40), rad=0.26, d=0.05, m="plate", ax="y"),
           dict(k="cyl", c=(0.25, 0, 0.35), rad=0.05, d=0.3, m="chrome", ax="y"),
           dict(k="box", c=(0.25, 0, 0.03), s=(1.0, 0.5, 0.06), m="frame"),
           dict(k="box", at="ankL", c=(0.02, -0.02, -0.07), s=(0.12, 0.08, 0.02), m="frame"),
           dict(k="box", at="ankR", c=(0.02, 0.02, -0.07), s=(0.12, 0.08, 0.02), m="frame")],
    cam=dict(az=-65, el=10),
)

EXOS["w_cerc"] = dict(
    cycle="alt",
    A=dict(STAND, ua=-90, uab=80, fa=-90, fab=80),
    B=dict(ua=0), C=dict(ua=180),
    bad=dict(A=dict(uab=100, fab=100, hd=-10), B=dict(t=80, ua=40), C=dict(t=100, ua=140)),
    zgood=["dsideL", "dsideR", "dfrontL", "dfrontR"], zbad=["trap", "lowback"],
    tgood="bras tendus, cercles contrôlés", tbad="épaules haussées, le buste suit les bras",
    props=[], cam=dict(az=-30, el=10),
)

EXOS["w_dislo"] = dict(
    A=dict(STAND, h=("S", (0.35, 0.55, -0.35)), ep=(0, 0, -1)),
    B=dict(h=("S", (-0.12, 0.62, 0.40))),
    bad=dict(A=dict(h=("S", (0.35, 0.32, -0.35))), B=dict(t=104, h=("S", (-0.08, 0.32, 0.30)), ep=(-1, 1, 0))),
    zgood=["dfrontL", "dfrontR", "pecL", "pecR"], zbad=["shoulderL", "shoulderR", "lowback"],
    tgood="prise large, bras tendus, sans forcer", tbad="prise trop serrée : l'épaule force, le dos se cambre",
    props=[dict(k="barbell", at="hands", plates=False, len=1.5)], cam=dict(az=-60, el=10),
)

EXOS["w_band"] = dict(
    A=dict(STAND, h=("S", (0.52, 0.12, 0.0)), ep=(0, 0.3, 1)),
    B=dict(h=("S", (0.10, 0.55, 0.0))),
    bad=dict(B=dict(t=104, hd=-10, h=("S", (0.25, 0.45, 0.15)))),
    zgood=["drearL", "drearR", "midback"], zbad=["trap", "lowback"],
    tgood="bras tendus, serre les omoplates", tbad="épaules haussées, le buste recule",
    props=[dict(k="rod", a=("handL", (0, 0, 0)), b=("handR", (0, 0, 0)), rad=0.009, m="rope")],
    cam=dict(az=-140, el=12),
)

QUAD = dict(pel=(0, 0.50), th=-90, sh=180, fo=180, h=(0.55, 0.17, 0.04), ep=(-1, 0, 0))
EXOS["w_cat"] = dict(
    A=dict(QUAD, pv=-10, t=-12, t2=10, hd=-25),
    B=dict(pv=25, t=20, t2=-10, hd=35),
    bad=dict(A=dict(t=-22, t2=14, hd=-55), B=dict(hd=60)),
    zgood=["lowback", "midback"], zbad=["neck"],
    tgood="creuse en inspirant, arrondis en soufflant", tbad="nuque cassée, mouvement brusque",
    props=floor_mat(-0.6, 0.9), cam=dict(az=-80, el=14),
)

EXOS["w_wrist"] = dict(
    cycle="alt",
    A=dict(STAND, ua=-80, fa=0, uab=10, fab=0),
    B=dict(fa=55), C=dict(fa=-45),
    bad=dict(A=dict(hd=15, ua=-60), B=dict(t=84), C=dict(t=96)),
    zgood=["foreL", "foreR"], zbad=["trap"],
    tgood="poignets et avant-bras qui tournent, épaules relâchées", tbad="épaules crispées, bras tendus en force",
    props=[], cam=dict(az=-45, el=10),
)

EXOS["w_pont"] = dict(
    A=dict(pel=(0.1, 0.11), t=180, a=(0.48, 0.13, 0.085), kp=(0.3, 0, 1), h=(-0.1, 0.28, 0.03)),
    B=dict(pel=(0.1, 0.40), t=206.6),
    bad=dict(B=dict(pel=(0.1, 0.46), pv=235, t=212, t2=200)),
    zgood=["gluteL", "gluteR"], zbad=["lowback"],
    tgood="monte le bassin en serrant les fesses", tbad="le dos se cambre au lieu des fessiers",
    props=floor_mat(-0.85, 0.85), cam=dict(az=-70, el=22),
)

EXOS["w_thor"] = dict(
    A=dict(QUAD, t=4, hL=(0.55, 0.17, 0.04), hR=("S", (-0.10, 0.10, 0.20)), epR=(0, 1, -0.3)),
    B=dict(tw=58, hd=-25),
    bad=dict(B=dict(tw=22, pel=(-0.06, 0.50), pv=-15, hd=-55)),
    zgood=["midback"], zbad=["neck", "lowback"],
    tgood="ouvre le coude vers le plafond, suis du regard", tbad="le bassin tourne, la nuque force",
    props=floor_mat(-0.6, 0.9), cam=dict(az=60, el=22),
)

EXOS["w_swing"] = dict(
    cycle="alt",
    A=dict(pel=(0, 0.92), t=90, aL=(0.0, 0.12, 0.085), kpL=(1, 0, 0), thR=-90, shR=-90, hL=(0.1, 0.42, 1.1), uaR=-90, faR=-90),
    B=dict(thR=-30, shR=-30), C=dict(thR=-130, shR=-135),
    bad=dict(B=dict(thR=8, shR=-25, t=72, t2=55), C=dict(thR=-150, shR=-170, t=108, t2=112)),
    zgood=["hamR", "gluteR"], zbad=["lowback"],
    tgood="jambe tendue, le buste reste droit", tbad="le dos s'arrondit puis se cambre pour lancer la jambe",
    props=[column(0.1, -0.5, 1.4)], cam=dict(az=75, el=10),
)

EXOS["w_lat"] = dict(
    cycle="alt",
    A=dict(pel=(0, 0.92), t=88, aL=(0.0, 0.12, 0.085), kpL=(1, 0, 0), thR=-90, shR=-90, h=(0.45, 0.2, 1.1)),
    B=dict(abR=32), C=dict(abR=-26, thR=-80, shR=-80),
    bad=dict(B=dict(abR=40, lb=-20), C=dict(lb=18)),
    zgood=["addR", "gmedR"], zbad=["lowback"],
    tgood="buste stable, la jambe balance devant toi", tbad="le buste penche à chaque balancement",
    props=[dict(k="box", c=(0.55, 0, 1.0), s=(0.06, 0.8, 2.0), m="frame")], cam=dict(az=-15, el=10),
)

ALIAS["w_plank"] = "gain"

EXOS["s_child"] = dict(
    A=dict(pel=(-0.05, 0.30), t=40, th=-30, sh=180, fo=180, h=(0.70, 0.20, 0.04), ep=(0, 0, 1)),
    B=dict(pel=(-0.05, 0.22), t=3, hd=30, th=-15, h=(1.0, 0.20, 0.04)),
    bad=dict(B=dict(pel=(0.05, 0.45), th=-80, hd=-25)),
    zgood=["latL", "latR", "lowback"], zbad=["neck", "lowback"],
    tgood="fesses sur les talons, bras loin devant", tbad="fesses qui décollent, tête relevée",
    props=floor_mat(-0.5, 1.2), cam=dict(az=-70, el=20),
)

EXOS["s_hands"] = dict(
    A=dict(STAND, h=("S", (-0.18, 0.04, -0.50)), ep=(0, 1, 0)),
    B=dict(h=("S", (-0.40, 0.04, -0.30))),
    bad=dict(B=dict(pel=(-0.1, 0.9), t=60, hd=25)),
    zgood=["pecL", "pecR", "dfrontL", "dfrontR"], zbad=["lowback"],
    tgood="bras tendus, ouvre la poitrine", tbad="le buste plonge au lieu d'ouvrir les épaules",
    props=[], cam=dict(az=-50, el=10),
)

EXOS["s_but"] = dict(
    A=dict(pel=(0, 0.10), t=90, a=(0.32, 0.03, 0.06), kp=(0.3, 1, 0.5), fy=0, h=(0.36, 0.06, 0.12)),
    B=dict(kp=(0.2, 1, 0.12), t=80),
    bad=dict(B=dict(t=70, t2=40, hd=30)),
    zgood=["addL", "addR"], zbad=["lowback", "midback"],
    tgood="dos droit, genoux poussés doucement", tbad="dos rond, tu tires avec les épaules",
    props=floor_mat(-0.5, 0.7), cam=dict(az=-25, el=18),
)

EXOS["s_cobra"] = dict(
    A=dict(pel=(0, 0.11), t=0, th=180, sh=180, h=(0.50, 0.25, 0.04), ep=(-1, 0.3, 0)),
    B=dict(t=40, t2=55, hd=-5),
    bad=dict(B=dict(pv=25, t=48, t2=60, hd=-45)),
    zgood=["abs"], zbad=["neck", "lowback"],
    tgood="hanches au sol, épaules basses", tbad="hanches qui décollent, tête jetée en arrière",
    props=floor_mat(-0.95, 1.0), cam=dict(az=-70, el=16),
)

EXOS["s_knee"] = dict(
    A=dict(pel=(0.1, 0.11), t=180, th=80, sh=0, h=("S", (0.40, 0.14, -0.25))),
    B=dict(th=125, sh=40, h=("S", (0.32, 0.14, -0.10))),
    bad=dict(B=dict(hd=45)),
    zgood=["lowback", "gluteL", "gluteR"], zbad=["neck"],
    tgood="tête posée, serre les genoux et respire", tbad="tête relevée : la nuque tire",
    props=floor_mat(-0.85, 0.85), cam=dict(az=-70, el=24),
)

EXOS["s_pec"] = dict(
    A=dict(STAND, hR=(0.02, 0.52, 1.70), epR=(0, 0.3, -1), uaL=-90, faL=-90),
    B=dict(tw=-30),
    bad=dict(A=dict(hR=(0.05, 0.52, 1.95)), B=dict(tw=-40, hR=(0.05, 0.52, 1.95))),
    zgood=["pecR", "dfrontR"], zbad=["shoulderR"],
    tgood="coude à hauteur d'épaule, tourne doucement", tbad="coude trop haut : l'épaule se coince",
    props=WALL_R, cam=dict(az=-35, el=12),
)

EXOS["s_lat"] = dict(
    A=dict(pel=(0, 0.90), t=60, a=(0.05, 0.12, 0.085), kp=(1, 0, 0), h=(0.75, 0.15, 0.95), ep=(0, 0.3, -1)),
    B=dict(pel=(-0.15, 0.86), t=10, hd=10, lb=8),
    bad=dict(B=dict(t=25, t2=-20, hd=35)),
    zgood=["latL", "latR"], zbad=["midback"],
    tgood="recule les fesses, laisse le flanc s'étirer", tbad="dos rond, la tête tombe",
    props=[column(0.82, 0, 1.2)], cam=dict(az=-75, el=12),
)

EXOS["s_cross"] = dict(
    A=dict(STAND, hR=("S", (0.35, 0.2, 0.0)), epR=(0, 0.3, -1), hL=("S", (0.18, 0.15, -0.25))),
    B=dict(hR=("S", (0.18, -0.28, -0.02)), hL=("S", (0.24, -0.02, -0.04))),
    bad=dict(B=dict(tw=-25, hR=("S", (0.18, -0.28, 0.12)))),
    zgood=["drearR", "dsideR"], zbad=["trap"],
    tgood="bras tendu contre la poitrine, épaule basse", tbad="épaule haussée, le buste tourne",
    props=[], cam=dict(az=-30, el=10),
)

EXOS["s_bic"] = dict(
    A=dict(STAND, hR=(-0.15, 0.62, 1.35), epR=(0, 0, -1), uaL=-90, faL=-90),
    B=dict(tw=-35),
    bad=dict(B=dict(tw=-35, hR=(-0.05, 0.55, 1.2), epR=(1, 0, 0), hd=20)),
    zgood=["bicR", "dfrontR"], zbad=["shoulderR"],
    tgood="paume au mur, bras tendu, tourne lentement", tbad="coude plié, l'épaule part en avant",
    props=WALL_R, cam=dict(az=-40, el=12),
)

EXOS["s_tri"] = dict(
    A=dict(STAND, hR=("S", (0.0, 0.15, 0.25)), epR=(0, 0.2, 1), hL=("S", (0.05, -0.12, 0.30)), epL=(0, 1, 0)),
    B=dict(hR=("S", (-0.12, 0.02, 0.05)), hL=("S", (0.02, -0.16, 0.36))),
    bad=dict(B=dict(hd=40, t=100)),
    zgood=["triR"], zbad=["neck", "lowback"],
    tgood="l'autre main pousse doucement le coude", tbad="tête poussée en avant, dos cambré",
    props=[], cam=dict(az=-120, el=12),
)

EXOS["s_quad"] = dict(
    A=dict(pel=(0, 0.92), t=90, aL=(0.0, 0.12, 0.085), kpL=(1, 0, 0), thR=-90, shR=40,
           hR=("H", (-0.17, 0.12, -0.05)), hL=(0.45, 0.25, 1.2)),
    B=dict(thR=-95, shR=105, pv=96),
    bad=dict(B=dict(thR=-60, abR=15, pv=70, t=96)),
    zgood=["quadR"], zbad=["lowback"],
    tgood="talon vers la fesse, genoux serrés, bassin en avant", tbad="genou qui part devant, dos cambré",
    props=[dict(k="box", c=(0.52, 0, 1.0), s=(0.06, 1.0, 2.0), m="frame")], cam=dict(az=70, el=10),
)

EXOS["s_hip"] = dict(
    A=dict(pel=(0, 0.55), t=90, aR=(0.45, 0.12, 0.085), kpR=(1, 0, 0), aL=(-0.62, 0.10, 0.07), kpL=(0, 0, -1),
           foL=180, h=("H", (0.02, 0.18, 0.08))),
    B=dict(pel=(0.12, 0.48)),
    bad=dict(B=dict(pv=60, t=105, hd=-15)),
    zgood=["quadL"], zbad=["lowback"],
    tgood="avance le bassin, buste droit", tbad="le dos se cambre au lieu d'avancer le bassin",
    props=floor_mat(-0.9, 0.8), cam=dict(az=-80, el=12),
)

EXOS["s_ham"] = dict(
    A=dict(pel=(0, 0.92), t=90, aL=(0.0, 0.12, 0.085), kpL=(1, 0, 0), aR=(0.72, 0.12, 0.52), kpR=(0, 0, 1),
           fo=0, foR=90, h=("H", (0.30, 0.12, 0.05))),
    B=dict(t=40, hd=-5),
    bad=dict(A=dict(aR=(0.62, 0.12, 0.52)), B=dict(t=55, t2=0, hd=35)),
    zgood=["hamR"], zbad=["midback", "lowback"],
    tgood="jambe tendue, penche-toi dos droit", tbad="dos rond, genou plié",
    props=bench(0.55, 1.0, top=0.45, y=0.12), cam=dict(az=-80, el=10),
)

EXOS["s_pig"] = dict(
    A=dict(pel=(0, 0.20), t=80, thR=-10, abR=30, shR=-5, sabR=-80, thL=185, shL=185, foL=270,
           h=(0.30, 0.30, 0.04), ep=(-1, 0.3, 0)),
    B=dict(t=20, hd=10, h=(0.65, 0.25, 0.04)),
    bad=dict(B=dict(t=25, t2=-20, hd=40)),
    zgood=["gluteR"], zbad=["lowback", "midback"],
    tgood="jambe avant pliée, penche le buste dos long", tbad="dos rond, tu tombes sur les épaules",
    props=floor_mat(-1.0, 1.0), cam=dict(az=-55, el=22),
)

EXOS["s_calf"] = dict(
    A=dict(pel=(0, 0.85), t=82, aR=(-0.45, 0.12, 0.085), kpR=(1, 0, 0), aL=(0.25, 0.12, 0.085), kpL=(1, 0, 0),
           h=(0.60, 0.20, 1.40), ep=(0, 0.5, -1)),
    B=dict(pel=(0.08, 0.82), t=72),
    bad=dict(B=dict(aR=(-0.40, 0.12, 0.15), foR=-30)),
    zgood=["calfR"], zbad=["calfR"],
    tgood="jambe arrière tendue, talon bien au sol", tbad="talon qui décolle : l'étirement disparaît",
    props=[dict(k="box", c=(0.68, 0, 1.1), s=(0.06, 1.2, 2.2), m="frame")], cam=dict(az=-80, el=10),
)

LOT3 = ["w_card", "w_cerc", "w_dislo", "w_band", "w_cat", "w_wrist", "w_pont", "w_thor", "w_swing", "w_lat",
        "s_child", "s_hands", "s_but", "s_cobra", "s_knee", "s_pec", "s_lat", "s_cross", "s_bic", "s_tri",
        "s_quad", "s_hip", "s_ham", "s_pig", "s_calf"]
