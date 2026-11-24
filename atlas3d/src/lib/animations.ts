// Animations 3D procédurales : un mannequin articulé original animé par des
// angles d'articulations (en degrés). Aucune ressource externe n'est utilisée.
//
// Conventions (mannequin face à +Z, Y vers le haut) :
//  rootPitch : inclinaison du corps vers l'avant (+) / l'arrière (−) ; −90 = allongé sur le dos, +90 = face au sol
//  spine     : flexion du tronc (+ = enroulement vers l'avant)
//  shFlex    : flexion d'épaule (+ = bras vers l'avant/le haut, − = extension)
//  shAbd     : abduction d'épaule (+ = bras écartés sur les côtés)
//  elbow     : flexion du coude
//  hipFlex   : flexion de hanche (+ = cuisse vers l'avant)
//  hipAbd    : abduction de hanche
//  knee      : flexion du genou
//  ankle     : flexion dorsale de cheville (+ = pointe du pied vers le tibia)
//  shHor     : abduction horizontale d'épaule, bras à l'horizontale (+ = bras ouverts vers l'extérieur)
//  pron      : rotation de l'avant-bras depuis la position anatomique (0 = supination, paumes vers l'avant bras le long du corps ;
//              90 = prise neutre, paumes face à face ; 170 = pronation, prise « dessus » sur une barre)
//  grip      : fermeture des doigts en degrés aux jointures (0 = main ouverte à plat, ~85 = main fermée sur une barre)

export type JointName = "rootPitch" | "spine" | "neck" | "shFlex" | "shAbd" | "elbow" | "hipFlex" | "hipAbd" | "knee" | "ankle" | "shHor" | "pron" | "grip" | "twist" | "lean" | "shrug";
/** Valeurs communes aux deux côtés ; « shFlex_1 » (etc.) surcharge un seul côté (0 = côté x négatif, 1 = x positif). */
export type Pose = Partial<Record<JointName | `${JointName}_0` | `${JointName}_1`, number>>;

export type PropKind = "bench" | "barbell" | "dumbbells" | "pullupBar" | "parallelBars" | "seat" | "backrest" | "legPad" | "sled" | "latBar" | "handles" | "mat" | "rack" | "kettlebell" | "dumbbell";

export interface Prop {
  kind: PropKind;
  /** Accroché au mannequin : suit les mains, les tibias ou les pieds. */
  attach?: "hands" | "hand0" | "hand1" | "shins" | "feet" | "chest";
  position?: [number, number, number];
  rotation?: [number, number, number];
  size?: [number, number, number];
}

export type BodyPoint = "hands" | "hand0" | "hand1" | "shins" | "shin0" | "shin1" | "feet";
/** Machine générique : colonnes de poids, leviers (pivot → partie du corps), câbles (corps → poulie → colonne). */
export interface MachineSpec {
  label?: string;
  seat?: boolean;
  stacks?: [number, number, number][];
  levers?: { pivot: [number, number, number]; to: BodyPoint; stack?: number }[];
  cables?: { from: BodyPoint; via: [number, number, number]; stack?: number }[];
  frame?: { pos: [number, number, number]; size: [number, number, number]; rot?: [number, number, number]; pad?: boolean }[];
}

export interface Animation {
  machine?: MachineSpec;
  id: string;
  name: string;
  duration: number; // secondes pour une répétition complète à vitesse normale
  /** feet = milieu de la plante au sol ; toes = avant-pied (le talon peut monter) ; hands = mains sur la barre. */
  anchor: "feet" | "toes" | "hands" | "foot0" | "foot1" | "hand0" | "hand1" | null;
  anchorTarget?: [number, number, number];
  /** Point visé par la caméra (sinon : mains pour les suspensions, bassin sinon). */
  camTarget?: [number, number, number];
  rootPos?: [number, number, number];
  keys: { t: number; pose: Pose }[];
  /** Plage de temps (0–1) de la phase concentrique ; le reste est excentrique. null = isométrique. */
  concentric: [number, number] | null;
  props: Prop[];
  cableTo?: [number, number, number];
}

const stand: Pose = { rootPitch: 0, spine: 0, neck: 0, shFlex: 0, shAbd: 6, elbow: 8, hipFlex: 0, hipAbd: 3, knee: 2, ankle: 0 };
const seated: Pose = { ...stand, hipFlex: 90, knee: 90, ankle: 0 };

const squatTop: Pose = { ...stand, rootPitch: 4, hipFlex: 4, knee: 4, hipAbd: 8 };
const squatBottom: Pose = { ...stand, rootPitch: 42, spine: 4, hipFlex: 128, knee: 118, ankle: 30, hipAbd: 14 };
const barArms: Pose = { shFlex: -25, shAbd: 72, elbow: 110 };

const SEAT: Prop = { kind: "seat", position: [0, 0.28, 0.12] };
/** Répétition aller-retour : départ → milieu (t = 0,5) → départ ; option d'une image intermédiaire. */
function rep(
  id: string, name: string, duration: number,
  place: Pick<Animation, "anchor" | "anchorTarget" | "rootPos">,
  a: Pose, b: Pose, concentric: [number, number] | null, props: Prop[],
  cableTo?: [number, number, number], mid?: { t: number; pose: Pose },
): Animation {
  const keys = mid
    ? [{ t: 0, pose: a }, mid, { t: 0.5, pose: b }, { t: 1 - mid.t, pose: mid.pose }, { t: 1, pose: a }]
    : [{ t: 0, pose: a }, { t: 0.5, pose: b }, { t: 1, pose: a }];
  return { id, name, duration, ...place, keys, concentric, props, cableTo };
}

export const animations: Animation[] = [
  {
    id: "squat",
    name: "Squat barre",
    duration: 3.2,
    anchor: "feet",
    anchorTarget: [0, 0, 0],
    keys: [
      { t: 0, pose: { ...squatTop, ...barArms } },
      { t: 0.5, pose: { ...squatBottom, ...barArms } },
      { t: 1, pose: { ...squatTop, ...barArms } },
    ],
    concentric: [0.5, 1],
    props: [{ kind: "barbell", attach: "chest", position: [0, 0.2, -0.13] }, { kind: "rack", position: [0, 0, -0.45] }],
  },
  {
    id: "airsquat",
    name: "Squat au poids du corps",
    duration: 2.6,
    anchor: "feet",
    anchorTarget: [0, 0, 0],
    keys: [
      { t: 0, pose: { ...squatTop, shFlex: 10, elbow: 10 } },
      { t: 0.5, pose: { ...squatBottom, shFlex: 85, elbow: 5 } },
      { t: 1, pose: { ...squatTop, shFlex: 10, elbow: 10 } },
    ],
    concentric: [0.5, 1],
    props: [],
  },
  {
    id: "bench",
    name: "Développé couché",
    duration: 3,
    anchor: null,
    rootPos: [0, 0.58, 0.05],
    keys: [
      { t: 0, pose: { ...stand, rootPitch: -90, hipFlex: -18, knee: 95, hipAbd: 18, shFlex: 90, shAbd: 8, elbow: 0 } },
      { t: 0.5, pose: { ...stand, rootPitch: -90, hipFlex: -18, knee: 95, hipAbd: 18, shFlex: -26, shAbd: 54, elbow: 92 } },
      { t: 1, pose: { ...stand, rootPitch: -90, hipFlex: -18, knee: 95, hipAbd: 18, shFlex: 90, shAbd: 8, elbow: 0 } },
    ],
    concentric: [0.5, 1],
    props: [
      { kind: "bench", position: [0, 0.22, -0.25], size: [0.3, 0.44, 1.25] },
      { kind: "barbell", attach: "hands" },
      { kind: "rack", position: [0, 0, -0.62] },
    ],
  },
  {
    id: "chestpress",
    name: "Chest press",
    duration: 3,
    anchor: null,
    rootPos: [0, 0.62, 0],
    keys: [
      { t: 0, pose: { ...seated, shFlex: 18, shAbd: 70, elbow: 92 } },
      { t: 0.5, pose: { ...seated, shFlex: 88, shAbd: 10, elbow: 2 } },
      { t: 1, pose: { ...seated, shFlex: 18, shAbd: 70, elbow: 92 } },
    ],
    concentric: [0, 0.5],
    props: [
      { kind: "seat", position: [0, 0.28, 0.12] },
      { kind: "backrest", position: [0, 0.95, -0.17] },
      { kind: "handles", attach: "hands" },
    ],
  },
  {
    id: "pulldown",
    name: "Tirage vertical",
    duration: 3,
    anchor: null,
    rootPos: [0, 0.62, 0],
    keys: [
      { t: 0, pose: { ...seated, rootPitch: -12, hipFlex: 78, shFlex: 165, shAbd: 25, elbow: 0 } },
      { t: 0.5, pose: { ...seated, rootPitch: -18, hipFlex: 72, shFlex: 25, shAbd: 45, elbow: 125 } },
      { t: 1, pose: { ...seated, rootPitch: -12, hipFlex: 78, shFlex: 165, shAbd: 25, elbow: 0 } },
    ],
    concentric: [0, 0.5],
    props: [
      { kind: "seat", position: [0, 0.28, 0.12] },
      { kind: "legPad", position: [0, 0.8, 0.3] },
      { kind: "latBar", attach: "hands" },
    ],
    cableTo: [0, 2.4, 0.1],
  },
  {
    id: "legext",
    name: "Leg extension",
    duration: 2.6,
    anchor: null,
    rootPos: [0, 0.62, 0],
    keys: [
      { t: 0, pose: { ...seated, rootPitch: -8, hipFlex: 98, knee: 92, shFlex: 20, elbow: 25, shAbd: 20 } },
      { t: 0.5, pose: { ...seated, rootPitch: -8, hipFlex: 98, knee: 5, shFlex: 20, elbow: 25, shAbd: 20 } },
      { t: 1, pose: { ...seated, rootPitch: -8, hipFlex: 98, knee: 92, shFlex: 20, elbow: 25, shAbd: 20 } },
    ],
    concentric: [0, 0.5],
    props: [
      { kind: "seat", position: [0, 0.28, 0.12] },
      { kind: "backrest", position: [0, 0.95, -0.2] },
      { kind: "legPad", attach: "shins" },
    ],
  },
  {
    id: "legpress",
    name: "Presse à jambes",
    camTarget: [0, 1.0, 0.25],
    duration: 3.2,
    anchor: null,
    rootPos: [0, 0.5, 0],
    keys: [
      // Angles calculés pour que les pieds glissent dans l'axe des rails (50° au-dessus de l'horizontale), plante à plat sur la plaque.
      { t: 0, pose: { ...seated, rootPitch: -55, hipFlex: 103, knee: 14, ankle: -3, hipAbd: 10, shFlex: 30, elbow: 20, shAbd: 25 } },
      { t: 0.5, pose: { ...seated, rootPitch: -55, hipFlex: 141, knee: 86, ankle: 30, hipAbd: 14, shFlex: 30, elbow: 20, shAbd: 25 } },
      { t: 1, pose: { ...seated, rootPitch: -55, hipFlex: 103, knee: 14, ankle: -3, hipAbd: 10, shFlex: 30, elbow: 20, shAbd: 25 } },
    ],
    concentric: [0.5, 1],
    props: [
      { kind: "backrest", position: [0, 0.57, -0.31], rotation: [-0.96, 0, 0], size: [0.42, 0.85, 0.08] },
      { kind: "seat", position: [0, 0.25, -0.06] },
      // Plaque toujours perpendiculaire aux rails (même inclinaison), posée sous les pieds.
      { kind: "sled", attach: "feet", rotation: [0.686, 0, 0] },
    ],
  },
  {
    id: "curl",
    name: "Curl biceps",
    duration: 2.4,
    anchor: "feet",
    anchorTarget: [0, 0, 0],
    keys: [
      { t: 0, pose: { ...stand, shFlex: 2, elbow: 6, shAbd: 8 } },
      { t: 0.5, pose: { ...stand, shFlex: 12, elbow: 138, shAbd: 8 } },
      { t: 1, pose: { ...stand, shFlex: 2, elbow: 6, shAbd: 8 } },
    ],
    concentric: [0, 0.5],
    props: [{ kind: "dumbbells", attach: "hands" }],
  },
  {
    id: "shoulderpress",
    name: "Développé militaire",
    duration: 2.8,
    anchor: "feet",
    anchorTarget: [0, 0, 0],
    keys: [
      { t: 0, pose: { ...stand, hipAbd: 8, shFlex: 28, shAbd: 25, elbow: 142 } },
      { t: 0.5, pose: { ...stand, hipAbd: 8, shFlex: 172, shAbd: 12, elbow: 4 } },
      { t: 1, pose: { ...stand, hipAbd: 8, shFlex: 28, shAbd: 25, elbow: 142 } },
    ],
    concentric: [0, 0.5],
    props: [{ kind: "barbell", attach: "hands" }],
  },
  {
    id: "deadlift",
    name: "Soulevé de terre",
    duration: 3.2,
    anchor: "feet",
    anchorTarget: [0, 0, 0],
    keys: [
      { t: 0, pose: { ...stand, rootPitch: 52, spine: 4, hipFlex: 86, knee: 62, ankle: 20, hipAbd: 6, shFlex: 54, shAbd: 6, elbow: 0 } },
      { t: 0.5, pose: { ...stand, rootPitch: 0, hipFlex: 0, knee: 2, hipAbd: 6, shFlex: 2, shAbd: 6, elbow: 0 } },
      { t: 1, pose: { ...stand, rootPitch: 52, spine: 4, hipFlex: 86, knee: 62, ankle: 20, hipAbd: 6, shFlex: 54, shAbd: 6, elbow: 0 } },
    ],
    concentric: [0, 0.5],
    props: [{ kind: "barbell", attach: "hands" }],
  },
  {
    id: "pushup",
    name: "Pompes",
    duration: 2.4,
    anchor: "feet",
    anchorTarget: [0, 0, -0.75],
    keys: [
      { t: 0, pose: { ...stand, rootPitch: 63, ankle: -45, shFlex: 63, shAbd: 18, elbow: 0 } },
      { t: 0.5, pose: { ...stand, rootPitch: 76, ankle: -52, shFlex: 22, shAbd: 62, elbow: 95 } },
      { t: 1, pose: { ...stand, rootPitch: 63, ankle: -45, shFlex: 63, shAbd: 18, elbow: 0 } },
    ],
    concentric: [0.5, 1],
    props: [{ kind: "mat", position: [0, 0.005, -0.1] }],
  },
  {
    id: "plank",
    name: "Gainage",
    duration: 4,
    anchor: "feet",
    anchorTarget: [0, 0, -0.75],
    keys: [
      { t: 0, pose: { ...stand, rootPitch: 75, ankle: -52, shFlex: -2, elbow: 92, shAbd: 10 } },
      { t: 0.5, pose: { ...stand, rootPitch: 76, ankle: -52, shFlex: -1, elbow: 92, shAbd: 10 } },
      { t: 1, pose: { ...stand, rootPitch: 75, ankle: -52, shFlex: -2, elbow: 92, shAbd: 10 } },
    ],
    concentric: null,
    props: [{ kind: "mat", position: [0, 0.005, -0.1] }],
  },
  {
    id: "pullup",
    name: "Traction",
    duration: 3,
    anchor: "hands",
    anchorTarget: [0, 2.3, 0],
    keys: [
      { t: 0, pose: { ...stand, shFlex: 172, shAbd: 18, elbow: 0, knee: 45, hipFlex: 15 } },
      { t: 0.5, pose: { ...stand, shFlex: 48, shAbd: 30, elbow: 128, knee: 45, hipFlex: 20 } },
      { t: 1, pose: { ...stand, shFlex: 172, shAbd: 18, elbow: 0, knee: 45, hipFlex: 15 } },
    ],
    concentric: [0, 0.5],
    props: [{ kind: "pullupBar", position: [0, 2.3, 0] }],
  },
  {
    id: "dips",
    name: "Dips",
    duration: 2.8,
    anchor: "hands",
    anchorTarget: [0, 1.2, 0],
    keys: [
      { t: 0, pose: { ...stand, rootPitch: 6, shFlex: 4, shAbd: 10, elbow: 0, knee: 75, hipFlex: 10 } },
      { t: 0.5, pose: { ...stand, rootPitch: 24, shFlex: -62, shAbd: 12, elbow: 96, knee: 75, hipFlex: 25 } },
      { t: 1, pose: { ...stand, rootPitch: 6, shFlex: 4, shAbd: 10, elbow: 0, knee: 75, hipFlex: 10 } },
    ],
    concentric: [0.5, 1],
    props: [{ kind: "parallelBars", position: [0, 1.2, 0] }],
  },
  // ───── Ajouts : couverture de toute la bibliothèque ─────
  rep("pecdeck", "Pec deck", 2.8, { anchor: null, rootPos: [0, 0.62, 0] },
    { ...seated, shFlex: 88, shAbd: 0, shHor: 78, elbow: 18 },
    { ...seated, shFlex: 88, shAbd: 0, shHor: 4, elbow: 18 },
    [0, 0.5], [SEAT, { kind: "backrest", position: [0, 0.95, -0.17] }, { kind: "handles", attach: "hands" }]),
  rep("cablefly", "Écarté à la poulie", 2.8, { anchor: "feet", anchorTarget: [0, 0, 0] },
    { ...stand, rootPitch: 14, hipAbd: 8, shFlex: 62, shHor: 78, elbow: 18 },
    { ...stand, rootPitch: 14, hipAbd: 8, shFlex: 70, shHor: 0, elbow: 18 },
    [0, 0.5], [{ kind: "handles", attach: "hands" }]),
  rep("seatedrow", "Tirage horizontal assis", 3, { anchor: null, rootPos: [0, 0.62, 0] },
    { ...seated, rootPitch: 2, knee: 25, shFlex: 86, shAbd: 8, elbow: 0 },
    { ...seated, rootPitch: -6, hipFlex: 82, knee: 25, shFlex: -18, shAbd: 18, elbow: 108 },
    [0, 0.5], [SEAT, { kind: "legPad", position: [0, 0.95, 0.27], rotation: [0, 0, 0] }, { kind: "handles", attach: "hands" }]),
  rep("barbellrow", "Rowing barre", 2.8, { anchor: "feet", anchorTarget: [0, 0, 0] },
    { ...stand, rootPitch: 48, spine: 2, hipFlex: 66, knee: 26, ankle: 10, hipAbd: 6, shFlex: 62, shAbd: 6, elbow: 0 },
    { ...stand, rootPitch: 48, spine: 2, hipFlex: 66, knee: 26, ankle: 10, hipAbd: 6, shFlex: -8, shAbd: 22, elbow: 100 },
    [0, 0.5], [{ kind: "barbell", attach: "hands" }]),
  rep("invertedrow", "Rowing inversé", 2.8, { anchor: "hands", anchorTarget: [0, 1.0, 0] },
    { ...stand, rootPitch: -70, shFlex: 72, shAbd: 10, elbow: 0, ankle: 10 },
    { ...stand, rootPitch: -40, shFlex: -38, shAbd: 28, elbow: 105, ankle: 10 },
    [0, 0.5], [{ kind: "pullupBar", position: [0, 1.0, 0] }]),
  rep("shoulderpressseated", "Développé épaules assis", 2.8, { anchor: null, rootPos: [0, 0.62, 0] },
    { ...seated, shFlex: 28, shAbd: 25, elbow: 142 },
    { ...seated, shFlex: 170, shAbd: 12, elbow: 6 },
    [0, 0.5], [SEAT, { kind: "backrest", position: [0, 0.98, -0.17] }, { kind: "handles", attach: "hands" }]),
  rep("lateralraise", "Élévations latérales", 2.6, { anchor: "feet", anchorTarget: [0, 0, 0] },
    { ...stand, hipAbd: 6, shAbd: 10, shFlex: 8, elbow: 14 },
    { ...stand, hipAbd: 6, shAbd: 86, shFlex: 12, elbow: 14 },
    [0, 0.5], [{ kind: "dumbbells", attach: "hands" }]),
  rep("lateralraisemachine", "Élévations latérales machine", 2.6, { anchor: null, rootPos: [0, 0.62, 0] },
    { ...seated, shAbd: 10, shFlex: 8, elbow: 85 },
    { ...seated, shAbd: 86, shFlex: 8, elbow: 85 },
    [0, 0.5], [SEAT]),
  rep("preachercurl", "Curl machine (pupitre)", 2.6, { anchor: null, rootPos: [0, 0.62, 0] },
    { ...seated, rootPitch: 10, shFlex: 48, shAbd: 10, elbow: 8 },
    { ...seated, rootPitch: 10, shFlex: 48, shAbd: 10, elbow: 128 },
    [0, 0.5], [SEAT, { kind: "handles", attach: "hands" }]),
  rep("tricepsmachine", "Extension triceps machine", 2.6, { anchor: null, rootPos: [0, 0.62, 0] },
    { ...seated, shFlex: 45, shAbd: 12, elbow: 125 },
    { ...seated, shFlex: 45, shAbd: 12, elbow: 6 },
    [0, 0.5], [SEAT, { kind: "backrest", position: [0, 0.95, -0.17] }, { kind: "handles", attach: "hands" }]),
  rep("pushdown", "Extension triceps à la poulie", 2.4, { anchor: "feet", anchorTarget: [0, 0, 0] },
    { ...stand, rootPitch: 10, hipFlex: 6, knee: 8, shFlex: 8, shAbd: 4, elbow: 100 },
    { ...stand, rootPitch: 10, hipFlex: 6, knee: 8, shFlex: 2, shAbd: 4, elbow: 4 },
    [0, 0.5], [{ kind: "handles", attach: "hands" }], [0, 2.2, 0.32]),
  rep("hacksquat", "Hack squat", 3.2, { anchor: "feet", anchorTarget: [0, 0, 0] },
    { ...squatTop, rootPitch: -6, shFlex: 0, shAbd: 30, elbow: 120 },
    { ...squatBottom, rootPitch: 8, spine: 0, hipFlex: 108, knee: 112, ankle: 26, shAbd: 30, elbow: 120 },
    [0.5, 1], [{ kind: "backrest", attach: "chest", position: [0, 0.02, -0.16] }]),
  rep("seatedlegcurl", "Leg curl assis", 2.6, { anchor: null, rootPos: [0, 0.62, 0] },
    { ...seated, rootPitch: -8, hipFlex: 98, knee: 4, shFlex: 20, elbow: 25, shAbd: 20 },
    { ...seated, rootPitch: -8, hipFlex: 98, knee: 105, shFlex: 20, elbow: 25, shAbd: 20 },
    [0, 0.5], [SEAT, { kind: "backrest", position: [0, 0.95, -0.2] }, { kind: "legPad", attach: "shins" }]),
  rep("lyinglegcurl", "Leg curl allongé", 2.6, { anchor: null, rootPos: [0, 0.7, -0.1] },
    { ...stand, rootPitch: 90, shFlex: 150, shAbd: 20, elbow: 40, knee: 4 },
    { ...stand, rootPitch: 90, shFlex: 150, shAbd: 20, elbow: 40, knee: 110 },
    [0, 0.5], [{ kind: "bench", position: [0, 0.3, 0.2], size: [0.32, 0.6, 1.4] }, { kind: "legPad", attach: "shins" }]),
  rep("hipthrust", "Hip thrust", 2.8, { anchor: "feet", anchorTarget: [0, 0, 0] },
    { ...stand, rootPitch: -73, hipFlex: 38, knee: 103, ankle: -9, hipAbd: 12, shFlex: 18, shAbd: 22, elbow: 25 },
    { ...stand, rootPitch: -88, hipFlex: 2, knee: 88, ankle: -4, hipAbd: 12, shFlex: 18, shAbd: 22, elbow: 25 },
    [0, 0.5], [{ kind: "bench", position: [0, 0.2, -1.05], size: [1.2, 0.4, 0.35] }, { kind: "barbell", attach: "hands" }]),
  rep("hipabduction", "Abduction de hanche machine", 2.4, { anchor: null, rootPos: [0, 0.62, 0] },
    { ...seated, rootPitch: -10, hipAbd: 4, shFlex: 15, elbow: 20, shAbd: 25 },
    { ...seated, rootPitch: -10, hipAbd: 40, shFlex: 15, elbow: 20, shAbd: 25 },
    [0, 0.5], [SEAT, { kind: "backrest", position: [0, 0.93, -0.22] }]),
  rep("hipadduction", "Adduction de hanche machine", 2.4, { anchor: null, rootPos: [0, 0.62, 0] },
    { ...seated, rootPitch: -10, hipAbd: 40, shFlex: 15, elbow: 20, shAbd: 25 },
    { ...seated, rootPitch: -10, hipAbd: 4, shFlex: 15, elbow: 20, shAbd: 25 },
    [0, 0.5], [SEAT, { kind: "backrest", position: [0, 0.93, -0.22] }]),
  rep("calfraise", "Extension mollets", 2, { anchor: "toes", anchorTarget: [0, 0.06, 0.08] },
    { ...stand, ankle: 8, shAbd: 20, elbow: 30 },
    { ...stand, ankle: -39, shAbd: 20, elbow: 30 },
    [0, 0.5], []),
  rep("backext", "Extension lombaire", 3, { anchor: "feet", anchorTarget: [0, 0, -0.55] },
    { ...stand, rootPitch: 120, hipFlex: 82, knee: 4, ankle: -38, shFlex: 10, elbow: 120, shAbd: 50 },
    { ...stand, rootPitch: 44, hipFlex: 4, knee: 4, ankle: -38, shFlex: 10, elbow: 120, shAbd: 50 },
    [0, 0.5], []),
  rep("abcrunch", "Crunch machine", 2.4, { anchor: null, rootPos: [0, 0.62, 0] },
    { ...seated, spine: 0, shFlex: 130, shAbd: 30, elbow: 120 },
    { ...seated, rootPitch: 14, spine: 46, neck: 10, shFlex: 130, shAbd: 30, elbow: 120 },
    [0, 0.5], [SEAT]),
  rep("inclinepress", "Développé incliné haltères", 2.8, { anchor: null, rootPos: [0, 0.52, 0] },
    { ...stand, rootPitch: -52, hipFlex: 30, knee: 80, hipAbd: 16, shFlex: 18, shAbd: 72, elbow: 95 },
    { ...stand, rootPitch: -52, hipFlex: 30, knee: 80, hipAbd: 16, shFlex: 92, shAbd: 10, elbow: 4 },
    [0, 0.5], [{ kind: "backrest", position: [0, 0.6, -0.31], rotation: [-0.9, 0, 0], size: [0.4, 0.75, 0.08] }, SEAT, { kind: "dumbbells", attach: "hands" }]),
  rep("kbswing", "Kettlebell swing", 1.6, { anchor: "feet", anchorTarget: [0, 0, 0] },
    { ...stand, rootPitch: 58, spine: 4, hipFlex: 80, knee: 28, ankle: 12, hipAbd: 10, shFlex: -18, shAbd: 4, elbow: 0 },
    { ...stand, rootPitch: -2, hipFlex: 0, knee: 2, hipAbd: 10, shFlex: 88, shAbd: 4, elbow: 0 },
    [0, 0.5], [{ kind: "kettlebell", attach: "hands" }]),
  rep("lsit", "L-sit", 4, { anchor: "hands", anchorTarget: [0, 1.2, 0] },
    { ...stand, shFlex: -6, shAbd: 10, elbow: 0, hipFlex: 88, knee: 0, ankle: -30 },
    { ...stand, shFlex: -8, shAbd: 10, elbow: 0, hipFlex: 92, knee: 0, ankle: -30 },
    null, [{ kind: "parallelBars", position: [0, 1.2, 0] }]),
  rep("frontlever", "Front lever", 4, { anchor: "hands", anchorTarget: [0, 2.3, 0] },
    { ...stand, rootPitch: -86, shFlex: 92, shAbd: 14, elbow: 0, ankle: -30 },
    { ...stand, rootPitch: -88, shFlex: 90, shAbd: 14, elbow: 0, ankle: -30 },
    null, [{ kind: "pullupBar", position: [0, 2.3, 0] }]),
  rep("hspu", "Pompes en équilibre", 3, { anchor: "hands", anchorTarget: [0, 0, 0] },
    { ...stand, rootPitch: 178, shFlex: 176, shAbd: 14, elbow: 0, ankle: -30 },
    { ...stand, rootPitch: 172, shFlex: 150, shAbd: 50, elbow: 95, ankle: -30 },
    [0.5, 1], [{ kind: "mat", position: [0, 0.005, 0] }]),
  rep("muscleup", "Muscle-up", 3.2, { anchor: "hands", anchorTarget: [0, 2.3, 0] },
    { ...stand, shFlex: 172, shAbd: 18, elbow: 0, knee: 30, hipFlex: 20 },
    { ...stand, rootPitch: 10, shFlex: -10, shAbd: 12, elbow: 2, knee: 20, hipFlex: 25 },
    [0, 0.5], [{ kind: "pullupBar", position: [0, 2.3, 0] }],
    undefined, { t: 0.3, pose: { ...stand, rootPitch: 18, shFlex: 20, shAbd: 25, elbow: 130, knee: 30, hipFlex: 35 } }),
];


// ───── Exercices d'Ektyron sans équivalent dans Atlas (fiches « ek-… » de src/data/exercisesEktyron.ts) ─────
// Prise : pron 165 = pronation, 90 = neutre, 0 = supination ; grip = fermeture des doigts.
const hold = (pron: number): Pose => ({ pron, grip: 85 });
const SUP: Pose = { ...stand, rootPitch: -90, hipFlex: -18, knee: 95, hipAbd: 18 }; // allongé sur un banc plat, pieds au sol
const SUP_PLACE = { anchor: null, rootPos: [0, 0.58, 0.05] as [number, number, number] };
const FLAT_BENCH: Prop = { kind: "bench", position: [0, 0.22, -0.25], size: [0.3, 0.44, 1.25] };
const FLOOR: Pose = { ...stand, rootPitch: -90 }; // allongé sur le dos au sol
const PRONE: Pose = { ...stand, rootPitch: 90, ankle: -55 }; // allongé sur le ventre
const MAT: Prop = { kind: "mat", position: [0, 0.005, 0] };
const DB: Prop = { kind: "dumbbells", attach: "hands" };
const DB1: Prop = { kind: "dumbbells", attach: "hand1" };
const ONE_DB: Prop = { kind: "dumbbell", attach: "hands" };
const INCL_BACK: Prop = { kind: "backrest", position: [0, 0.6, -0.31], rotation: [-0.9, 0, 0], size: [0.4, 0.75, 0.08] };
const ROPE: Prop = { kind: "handles", attach: "hands" };
const hinge = (deg: number, knee: number): Pose => ({ rootPitch: deg, hipFlex: deg + knee * 0.5, knee, ankle: knee * 0.5 });

animations.push(
  rep("dbfly", "Écarté haltères sur banc", 2.8, SUP_PLACE,
    { ...SUP, ...hold(90), shFlex: 80, shAbd: 6, elbow: 14 },
    { ...SUP, ...hold(90), shFlex: 78, shHor: 80, shAbd: 6, elbow: 28 },
    [0.5, 1], [FLAT_BENCH, DB]),
  rep("dbbench", "Développé couché haltères", 3, SUP_PLACE,
    { ...SUP, ...hold(165), shFlex: 82, shAbd: 10, elbow: 2 },
    { ...SUP, ...hold(165), shFlex: -20, shAbd: 60, elbow: 95 },
    [0.5, 1], [FLAT_BENCH, DB]),
  rep("smithincline", "Développé incliné à la Smith", 2.8, { anchor: null, rootPos: [0, 0.52, 0] },
    { ...stand, ...hold(165), rootPitch: -52, hipFlex: 30, knee: 80, hipAbd: 16, shFlex: 92, shAbd: 10, elbow: 4 },
    { ...stand, ...hold(165), rootPitch: -52, hipFlex: 30, knee: 80, hipAbd: 16, shFlex: 14, shAbd: 66, elbow: 100 },
    [0.5, 1], [INCL_BACK, SEAT, { kind: "barbell", attach: "hands" }]),
  rep("declinepushup", "Pompes pieds surélevés", 2.4, { anchor: "feet", anchorTarget: [0, 0.46, -0.85] },
    { ...stand, rootPitch: 80, ankle: -40, shFlex: 78, shAbd: 18, elbow: 0, grip: 0, pron: 165 },
    { ...stand, rootPitch: 92, ankle: -45, shFlex: 36, shAbd: 62, elbow: 98, grip: 0, pron: 165 },
    [0.5, 1], [MAT, { kind: "bench", position: [0, 0.22, -0.95], size: [0.4, 0.44, 0.4] }]),
  rep("chestrow", "Rowing machine poitrine appuyée", 2.8, { anchor: null, rootPos: [0, 0.46, 0] },
    { ...seated, ...hold(90), rootPitch: 12, hipFlex: 102, shFlex: 92, shAbd: 10, elbow: 0 },
    { ...seated, ...hold(90), rootPitch: 12, hipFlex: 102, shFlex: -10, shAbd: 20, elbow: 105 },
    [0, 0.5], [SEAT]),
  rep("dbshoulderpress", "Développé épaules haltères assis", 2.8, { anchor: null, rootPos: [0, 0.46, 0] },
    { ...seated, ...hold(165), shFlex: 20, shAbd: 80, elbow: 95 },
    { ...seated, ...hold(165), shFlex: 165, shAbd: 15, elbow: 6 },
    [0, 0.5], [SEAT, { kind: "backrest", position: [0, 0.82, -0.17] }, DB]),
  rep("cablelateral", "Élévation latérale à la poulie", 2.6, { anchor: "feet", anchorTarget: [0, 0, 0] },
    { ...stand, ...hold(90), hipAbd: 6, shAbd_1: 8, shFlex_1: 10, elbow_1: 12, shAbd_0: 30, elbow_0: 30, grip_0: 25 },
    { ...stand, ...hold(90), hipAbd: 6, shAbd_1: 86, shFlex_1: 12, elbow_1: 12, shAbd_0: 30, elbow_0: 30, grip_0: 25 },
    [0, 0.5], [{ kind: "handles", attach: "hand1" }]),
  rep("onearmpushdown", "Extension triceps poulie un bras", 2.4, { anchor: "feet", anchorTarget: [0, 0, 0] },
    { ...stand, ...hold(90), rootPitch: 8, hipFlex: 6, knee: 8, shFlex_1: 8, shAbd_1: 4, elbow_1: 100, shAbd_0: 12, elbow_0: 20, grip_0: 25 },
    { ...stand, ...hold(90), rootPitch: 8, hipFlex: 6, knee: 8, shFlex_1: 2, shAbd_1: 4, elbow_1: 4, shAbd_0: 12, elbow_0: 20, grip_0: 25 },
    [0, 0.5], [{ kind: "handles", attach: "hand1" }]),
  rep("cablecrunch", "Crunch à la poulie haute", 2.6, { anchor: "feet", anchorTarget: [0, 0.03, -0.42] },
    { ...stand, ...hold(90), rootPitch: 12, hipFlex: 12, knee: 90, ankle: -30, spine: 0, shFlex: 150, shAbd: 25, elbow: 130 },
    { ...stand, ...hold(90), rootPitch: 34, hipFlex: 34, knee: 90, ankle: -30, spine: 46, neck: 10, shFlex: 150, shAbd: 25, elbow: 130 },
    [0, 0.5], [MAT, ROPE]),
  rep("leanabduction", "Abduction de hanche buste penché", 2.4, { anchor: null, rootPos: [0, 0.47, 0] },
    { ...seated, rootPitch: 32, hipFlex: 122, hipAbd: 4, shFlex: 60, elbow: 30, shAbd: 25 },
    { ...seated, rootPitch: 32, hipFlex: 122, hipAbd: 40, shFlex: 60, elbow: 30, shAbd: 25 },
    [0, 0.5], [SEAT]),
  rep("onearmrow", "Rowing unilatéral haltère", 2.8, { anchor: "feet", anchorTarget: [0, 0, 0] },
    { ...stand, ...hold(90), rootPitch: 72, hipFlex: 98, knee: 26, ankle: 0, hipAbd: 8, shFlex_0: 80, shAbd_0: 12, elbow_0: 0, grip_0: 30, pron_0: 165, shFlex_1: 72, shAbd_1: 8, elbow_1: 0 },
    { ...stand, ...hold(90), rootPitch: 72, hipFlex: 98, knee: 26, ankle: 0, hipAbd: 8, shFlex_0: 80, shAbd_0: 12, elbow_0: 0, grip_0: 30, pron_0: 165, shFlex_1: -12, shAbd_1: 14, elbow_1: 100, twist: 10 },
    [0, 0.5], [DB1, { kind: "bench", position: [-0.25, 0.2, 0.42], size: [0.35, 0.4, 0.5] }]),
  rep("widerow", "Tirage poulie prise large, coudes levés", 2.8, { anchor: null, rootPos: [0, 0.46, 0] },
    { ...seated, ...hold(165), rootPitch: 0, knee: 25, hipFlex: 88, shFlex: 86, shAbd: 10, elbow: 0 },
    { ...seated, ...hold(165), rootPitch: -4, knee: 25, hipFlex: 84, shFlex: 84, shHor: 92, shAbd: 10, elbow: 92 },
    [0, 0.5], [SEAT, { kind: "latBar", attach: "hands" }]),
  rep("reversefly", "Reverse pec fly (oiseau machine)", 2.6, { anchor: null, rootPos: [0, 0.46, 0] },
    { ...seated, ...hold(90), rootPitch: 6, hipFlex: 96, shFlex: 88, shHor: -4, elbow: 8 },
    { ...seated, ...hold(90), rootPitch: 6, hipFlex: 96, shFlex: 86, shHor: 92, elbow: 8 },
    [0, 0.5], [SEAT]),
  rep("facepull", "Face pull à la poulie", 2.6, { anchor: "feet", anchorTarget: [0, 0, 0] },
    { ...stand, ...hold(90), rootPitch: -6, hipFlex: -2, knee: 10, ankle: 4, shFlex: 92, shAbd: 4, elbow: 4 },
    { ...stand, ...hold(90), rootPitch: -6, hipFlex: -2, knee: 10, ankle: 4, shFlex: 92, shHor: 88, shAbd: 4, elbow: 105 },
    [0, 0.5], [ROPE]),
  rep("reardeltfly", "Oiseau haltères buste penché", 2.6, { anchor: "feet", anchorTarget: [0, 0, 0] },
    { ...stand, ...hold(90), ...hinge(72, 22), shFlex: 74, shAbd: 6, elbow: 16 },
    { ...stand, ...hold(90), ...hinge(72, 22), shFlex: 74, shHor: 86, shAbd: 6, elbow: 16 },
    [0, 0.5], [DB]),
  {
    id: "ytw", name: "Y-T-W allongé", duration: 6, anchor: null, rootPos: [0, 0.12, 0], concentric: [0, 1], props: [MAT],
    keys: [
      { t: 0, pose: { ...PRONE, shFlex: 172, shAbd: 30, elbow: 5 } },
      { t: 0.16, pose: { ...PRONE, shFlex: 184, shAbd: 30, elbow: 5, spine: -6 } },
      { t: 0.33, pose: { ...PRONE, shFlex: -4, shAbd: 90, elbow: 5 } },
      { t: 0.5, pose: { ...PRONE, shFlex: -10, shAbd: 90, elbow: 5, spine: -6 } },
      { t: 0.64, pose: { ...PRONE, shFlex: -4, shAbd: 50, elbow: 30 } },
      { t: 0.78, pose: { ...PRONE, shFlex: -14, shAbd: 50, elbow: 30, spine: -6 } },
      { t: 0.9, pose: { ...PRONE, shFlex: -4, shAbd: 90, elbow: 5 } },
      { t: 1, pose: { ...PRONE, shFlex: 172, shAbd: 30, elbow: 5 } },
    ],
  },
  rep("pikepushup", "Pompes piquées (pike)", 2.6, { anchor: "feet", anchorTarget: [0, 0.03, -0.6] },
    { ...stand, rootPitch: 128, hipFlex: 88, knee: 0, ankle: -10, shFlex: 172, shAbd: 14, elbow: 0, grip: 0, pron: 165 },
    { ...stand, rootPitch: 140, hipFlex: 96, knee: 0, ankle: -10, shFlex: 128, shAbd: 40, elbow: 100, grip: 0, pron: 165 },
    [0.5, 1], [MAT]),
  rep("cablecurlback", "Curl poulie dos à la poulie", 2.6, { anchor: "feet", anchorTarget: [0, 0, 0] },
    { ...stand, ...hold(0), rootPitch: 4, shFlex: -18, shAbd: 8, elbow: 6 },
    { ...stand, ...hold(0), rootPitch: 4, shFlex: -6, shAbd: 8, elbow: 132 },
    [0, 0.5], [{ kind: "handles", attach: "hands" }]),
  rep("inclinecurl", "Curl haltères sur banc incliné", 2.6, { anchor: null, rootPos: [0, 0.52, 0] },
    { ...stand, ...hold(0), rootPitch: -52, hipFlex: 30, knee: 80, hipAbd: 16, shFlex: -52, shAbd: 10, elbow: 4 },
    { ...stand, ...hold(0), rootPitch: -52, hipFlex: 30, knee: 80, hipAbd: 16, shFlex: -44, shAbd: 10, elbow: 130 },
    [0, 0.5], [INCL_BACK, SEAT, DB]),
  rep("ropehammer", "Curl marteau à la corde", 2.6, { anchor: "feet", anchorTarget: [0, 0, 0] },
    { ...stand, ...hold(90), shFlex: 4, shAbd: 4, elbow: 6 },
    { ...stand, ...hold(90), shFlex: 12, shAbd: 4, elbow: 132 },
    [0, 0.5], [ROPE]),
  rep("hammercurl", "Curl marteau haltères", 2.6, { anchor: "feet", anchorTarget: [0, 0, 0] },
    { ...stand, ...hold(90), shFlex: 2, shAbd: 8, elbow: 6 },
    { ...stand, ...hold(90), shFlex: 12, shAbd: 8, elbow: 136 },
    [0, 0.5], [DB]),
  rep("bagcurl", "Curl avec sac à dos chargé", 2.6, { anchor: "feet", anchorTarget: [0, 0, 0] },
    { ...stand, ...hold(0), shFlex: 4, shAbd: 2, elbow: 8 },
    { ...stand, ...hold(0), shFlex: 14, shAbd: 2, elbow: 132 },
    [0, 0.5], [{ kind: "kettlebell", attach: "hands" }]),
  rep("overheadcable", "Extension triceps au-dessus de la tête (poulie)", 2.6, { anchor: "feet", anchorTarget: [0, 0, 0] },
    { ...stand, ...hold(90), ...hinge(22, 14), shFlex: 150, shAbd: 10, elbow: 125 },
    { ...stand, ...hold(90), ...hinge(22, 14), shFlex: 158, shAbd: 10, elbow: 8 },
    [0, 0.5], [ROPE]),
  rep("dbextension", "Extension triceps haltère derrière la tête", 2.6, { anchor: "feet", anchorTarget: [0, 0, 0] },
    { ...stand, ...hold(90), hipAbd: 8, shFlex: 165, shAbd: 4, elbow: 140 },
    { ...stand, ...hold(90), hipAbd: 8, shFlex: 168, shAbd: 4, elbow: 8 },
    [0, 0.5], [ONE_DB]),
  rep("benchdips", "Dips sur une chaise", 2.4, { anchor: "hands", anchorTarget: [0, 0.4, -0.24] },
    { ...stand, ...hold(165), rootPitch: 0, hipFlex: 97, knee: 86, ankle: -11, shFlex: -36, shAbd: 12, elbow: 4 },
    { ...stand, ...hold(165), rootPitch: 6, hipFlex: 107, knee: 48, ankle: -53, shFlex: -64, shAbd: 16, elbow: 92 },
    [0.5, 1], [{ kind: "bench", position: [0, 0.19, -0.3], size: [0.6, 0.38, 0.4] }]),
  rep("gobletsquat", "Goblet squat", 3, { anchor: "feet", anchorTarget: [0, 0, 0] },
    { ...squatTop, ...hold(90), shFlex: 34, shAbd: 18, elbow: 140 },
    { ...squatBottom, ...hold(90), rootPitch: 34, hipFlex: 122, shFlex: 64, shAbd: 26, elbow: 140 },
    [0.5, 1], [ONE_DB]),
  rep("sumosquat", "Sumo squat haltère", 3, { anchor: "feet", anchorTarget: [0, 0, 0] },
    { ...squatTop, ...hold(90), hipAbd: 32, shFlex: 4, shAbd: 0, elbow: 4 },
    { ...squatBottom, ...hold(90), rootPitch: 26, hipFlex: 100, knee: 98, ankle: 22, hipAbd: 40, shFlex: 26, shAbd: 0, elbow: 4 },
    [0.5, 1], [ONE_DB]),
  rep("bulgarian", "Fentes bulgares", 3, { anchor: "foot0", anchorTarget: [-0.1, 0, 0.3] },
    { ...stand, ...hold(90), rootPitch: 8, hipFlex_0: 20, knee_0: 12, ankle_0: 0, hipFlex_1: -26, knee_1: 52, ankle_1: -84, shFlex: 8, elbow: 6 },
    { ...stand, ...hold(90), rootPitch: 18, hipFlex_0: 103, knee_0: 90, ankle_0: 5, hipFlex_1: -11, knee_1: 133, ankle_1: -8, shFlex: 18, elbow: 6 },
    [0.5, 1], [DB, { kind: "bench", position: [0.1, 0.21, -0.5], size: [0.4, 0.42, 0.4] }]),
  {
    id: "lunges", name: "Fentes marchées", duration: 4.4, anchor: "feet", anchorTarget: [0, 0.02, 0], concentric: [0.15, 0.5], props: [],
    keys: [
      { t: 0, pose: { ...stand } },
      { t: 0.25, pose: { ...stand, rootPitch: 4, hipFlex_0: 89, knee_0: 85, ankle_0: 0, hipFlex_1: -34, knee_1: 49, ankle_1: 27, shAbd: 10, elbow: 10 } },
      { t: 0.5, pose: { ...stand } },
      { t: 0.75, pose: { ...stand, rootPitch: 4, hipFlex_1: 89, knee_1: 85, ankle_1: 0, hipFlex_0: -34, knee_0: 49, ankle_0: 27, shAbd: 10, elbow: 10 } },
      { t: 1, pose: { ...stand } },
    ],
  },
  rep("nordic", "Leg curl nordique", 3.4, { anchor: "feet", anchorTarget: [0, 0.07, -0.55] },
    { ...stand, rootPitch: 0, hipFlex: 0, knee: 90, ankle: -50, shFlex: 30, shAbd: 20, elbow: 100 },
    { ...stand, rootPitch: 62, hipFlex: 0, knee: 28, ankle: -50, shFlex: 70, shAbd: 20, elbow: 70 },
    [0.5, 1], [MAT]),
  rep("dbrdl", "Soulevé de terre roumain haltères", 3.2, { anchor: "feet", anchorTarget: [0, 0, 0] },
    { ...stand, ...hold(165), hipAbd: 5, shFlex: 0, shAbd: 4, elbow: 0 },
    { ...stand, ...hold(165), rootPitch: 72, spine: 2, hipFlex: 82, knee: 16, ankle: 6, hipAbd: 5, shFlex: 72, shAbd: 4, elbow: 0 },
    [0.5, 1], [DB]),
  rep("rdl", "Soulevé de terre roumain barre", 3.2, { anchor: "feet", anchorTarget: [0, 0, 0] },
    { ...stand, ...hold(165), hipAbd: 5, shFlex: 0, shAbd: 8, elbow: 0 },
    { ...stand, ...hold(165), rootPitch: 70, spine: 2, hipFlex: 80, knee: 16, ankle: 6, hipAbd: 5, shFlex: 70, shAbd: 8, elbow: 0 },
    [0.5, 1], [{ kind: "barbell", attach: "hands" }]),
  rep("singlebridge", "Pont fessier une jambe", 2.6, { anchor: "foot0", anchorTarget: [-0.1, 0, 0.25] },
    { ...FLOOR, rootPitch: -90, hipFlex_0: 45, knee_0: 110, ankle_0: -25, hipFlex_1: 45, knee_1: 0, shFlex: 0, shAbd: 20 },
    { ...FLOOR, rootPitch: -110, hipFlex_0: 0, knee_0: 100, ankle_0: -9, hipFlex_1: 0, knee_1: 0, shFlex: -20, shAbd: 20 },
    [0, 0.5], [MAT]),
  rep("seatedcalf", "Mollets assis", 2.2, { anchor: "toes", anchorTarget: [0, 0.06, 0.62] },
    { ...seated, ...hold(90), rootPitch: 6, hipFlex: 96, knee: 85, ankle: 14, shFlex: 40, shAbd: 20, elbow: 50 },
    { ...seated, ...hold(90), rootPitch: 6, hipFlex: 96, knee: 85, ankle: -24, shFlex: 40, shAbd: 20, elbow: 50 },
    [0, 0.5], [{ kind: "seat", position: [0, 0.36, 0.05] }, { kind: "legPad", position: [0, 0.62, 0.34] }]),
  rep("legraise", "Relevés de jambes allongé", 2.6, { anchor: null, rootPos: [0, 0.11, 0] },
    { ...FLOOR, hipFlex: 8, knee: 4, ankle: -20, shFlex: -8, shAbd: 18 },
    { ...FLOOR, hipFlex: 88, knee: 4, ankle: -20, shFlex: -8, shAbd: 18 },
    [0, 0.5], [MAT]),
  rep("superman", "Superman", 2.6, { anchor: null, rootPos: [0, 0.12, 0] },
    { ...PRONE, shFlex: 172, shAbd: 18, elbow: 4 },
    { ...PRONE, spine: -12, neck: -8, shFlex: 176, shAbd: 18, elbow: 4, hipFlex: -8 },
    [0, 0.5], [MAT]),
  rep("cablekickback", "Kickback fessier à la poulie", 2.4, { anchor: "foot0", anchorTarget: [-0.1, 0, 0] },
    { ...stand, ...hold(90), rootPitch: 26, hipFlex_0: 30, knee_0: 10, ankle_0: 6, hipFlex_1: 36, knee_1: 40, shFlex: 70, shAbd: 14, elbow: 20 },
    { ...stand, ...hold(90), rootPitch: 26, hipFlex_0: 30, knee_0: 10, ankle_0: 6, hipFlex_1: -24, knee_1: 12, shFlex: 70, shAbd: 14, elbow: 20 },
    [0, 0.5], []),
  rep("stepup", "Step up sur banc", 3, { anchor: "foot0", anchorTarget: [-0.1, 0.45, 0.2] },
    { ...stand, ...hold(90), rootPitch: 22, hipFlex_0: 100, knee_0: 104, ankle_0: 18, hipFlex_1: 10, knee_1: 6, ankle_1: 12, shFlex: 18, elbow: 6 },
    { ...stand, ...hold(90), rootPitch: 2, hipFlex_0: 2, knee_0: 2, ankle_0: 0, hipFlex_1: 40, knee_1: 70, ankle_1: 0, shFlex: 4, elbow: 6 },
    [0, 0.5], [DB, { kind: "bench", position: [0, 0.22, 0.25], size: [0.5, 0.44, 0.45] }]),
  rep("hangingraise", "Relevés de jambes suspendu", 2.8, { anchor: "hands", anchorTarget: [0, 2.3, 0] },
    { ...stand, ...hold(165), shFlex: 174, shAbd: 16, elbow: 0, hipFlex: 4, knee: 4 },
    { ...stand, ...hold(165), rootPitch: -12, shFlex: 162, shAbd: 16, elbow: 0, hipFlex: 100, knee: 10 },
    [0, 0.5], [{ kind: "pullupBar", position: [0, 2.3, 0] }]),
  {
    id: "deadbug", name: "Dead bug", duration: 5, anchor: null, rootPos: [0, 0.11, 0], concentric: null, props: [MAT],
    keys: [
      { t: 0, pose: { ...FLOOR, shFlex: 90, shAbd: 4, hipFlex: 90, knee: 90, ankle: 0 } },
      { t: 0.25, pose: { ...FLOOR, shFlex: 90, shFlex_0: 172, shAbd: 4, hipFlex: 90, knee: 90, hipFlex_1: 4, knee_1: 4, ankle: 0 } },
      { t: 0.5, pose: { ...FLOOR, shFlex: 90, shAbd: 4, hipFlex: 90, knee: 90, ankle: 0 } },
      { t: 0.75, pose: { ...FLOOR, shFlex: 90, shFlex_1: 172, shAbd: 4, hipFlex: 90, knee: 90, hipFlex_0: 4, knee_0: 4, ankle: 0 } },
      { t: 1, pose: { ...FLOOR, shFlex: 90, shAbd: 4, hipFlex: 90, knee: 90, ankle: 0 } },
    ],
  },
  {
    id: "heeltaps", name: "Heel taps", duration: 2.6, anchor: null, rootPos: [0, 0.11, 0], concentric: null, props: [MAT],
    keys: [
      { t: 0, pose: { ...FLOOR, spine: 30, neck: 10, hipFlex: 45, knee: 100, ankle: -20, hipAbd: 10, shFlex: 8, shAbd: 10 } },
      { t: 0.25, pose: { ...FLOOR, spine: 30, neck: 10, lean: -18, hipFlex: 45, knee: 100, ankle: -20, hipAbd: 10, shFlex: 8, shAbd: 10 } },
      { t: 0.5, pose: { ...FLOOR, spine: 30, neck: 10, hipFlex: 45, knee: 100, ankle: -20, hipAbd: 10, shFlex: 8, shAbd: 10 } },
      { t: 0.75, pose: { ...FLOOR, spine: 30, neck: 10, lean: 18, hipFlex: 45, knee: 100, ankle: -20, hipAbd: 10, shFlex: 8, shAbd: 10 } },
      { t: 1, pose: { ...FLOOR, spine: 30, neck: 10, hipFlex: 45, knee: 100, ankle: -20, hipAbd: 10, shFlex: 8, shAbd: 10 } },
    ],
  },
  {
    id: "russiantwist", name: "Russian twist", duration: 2.6, anchor: null, rootPos: [0, 0.13, 0], concentric: null, props: [MAT],
    keys: [
      { t: 0, pose: { ...stand, rootPitch: -42, spine: 10, hipFlex: 88, knee: 100, ankle: -30, hipAbd: 8, shFlex: 50, shAbd: 4, elbow: 70, grip: 60 } },
      { t: 0.25, pose: { ...stand, rootPitch: -42, spine: 10, twist: 40, hipFlex: 88, knee: 100, ankle: -30, hipAbd: 8, shFlex: 50, shAbd: 4, elbow: 70, grip: 60 } },
      { t: 0.5, pose: { ...stand, rootPitch: -42, spine: 10, hipFlex: 88, knee: 100, ankle: -30, hipAbd: 8, shFlex: 50, shAbd: 4, elbow: 70, grip: 60 } },
      { t: 0.75, pose: { ...stand, rootPitch: -42, spine: 10, twist: -40, hipFlex: 88, knee: 100, ankle: -30, hipAbd: 8, shFlex: 50, shAbd: 4, elbow: 70, grip: 60 } },
      { t: 1, pose: { ...stand, rootPitch: -42, spine: 10, hipFlex: 88, knee: 100, ankle: -30, hipAbd: 8, shFlex: 50, shAbd: 4, elbow: 70, grip: 60 } },
    ],
  },
  rep("suitcasecrunch", "Suitcase crunch", 2.6, { anchor: null, rootPos: [0, 0.12, 0] },
    { ...FLOOR, rootPitch: -86, hipFlex: 14, knee: 6, ankle: -20, shFlex: 168, shAbd: 14, elbow: 6 },
    { ...FLOOR, rootPitch: -62, spine: 40, neck: 10, hipFlex: 120, knee: 110, ankle: -20, shFlex: 80, shAbd: 14, elbow: 6 },
    [0, 0.5], [MAT]),
  rep("shrug", "Shrugs haltères", 2.2, { anchor: "feet", anchorTarget: [0, 0, 0] },
    { ...stand, ...hold(90), shFlex: 2, shAbd: 6, elbow: 2 },
    { ...stand, ...hold(90), shFlex: 2, shAbd: 6, elbow: 2, shrug: 6 },
    [0, 0.5], [DB]),
);

// Cadrage : corps bas (dips sur chaise) ou haut (debout sur le banc).
const CAM: Record<string, [number, number, number]> = { benchdips: [0, 0.55, 0.15], stepup: [0, 1.1, 0.15] };
for (const a of animations) if (CAM[a.id]) a.camTarget = CAM[a.id];

// ───── Machines (modélisation générique, côté droit = x positif) ─────
const SIDE: [number, number, number] = [0.68, 0, -0.35];
const MACHINES: Record<string, MachineSpec> = {
  chestpress: { label: "Chest press — presse pectorale guidée", stacks: [SIDE], levers: [{ pivot: [-0.24, 1.6, -0.32], to: "hand0" }, { pivot: [0.24, 1.6, -0.32], to: "hand1" }] },
  shoulderpressseated: { label: "Presse épaules guidée", stacks: [SIDE], levers: [{ pivot: [0, 1.0, -0.42], to: "hands" }] },
  pecdeck: { label: "Pec deck — butterfly (écartés)", stacks: [SIDE], levers: [{ pivot: [-0.17, 1.55, -0.22], to: "hand0" }, { pivot: [0.17, 1.55, -0.22], to: "hand1" }] },
  lateralraisemachine: { label: "Machine élévations latérales", stacks: [SIDE], levers: [{ pivot: [-0.2, 1.4, -0.08], to: "hand0" }, { pivot: [0.2, 1.4, -0.08], to: "hand1" }] },
  preachercurl: { label: "Curl au pupitre guidé", stacks: [SIDE], levers: [{ pivot: [0, 1.02, 0.42], to: "hands" }], frame: [{ pos: [0, 0.95, 0.33], size: [0.46, 0.05, 0.3], rot: [-0.7, 0, 0], pad: true }, { pos: [0, 0.48, 0.42], size: [0.05, 0.9, 0.05] }] },
  tricepsmachine: { label: "Machine extension triceps", stacks: [SIDE], levers: [{ pivot: [0, 1.05, 0.4], to: "hands" }] },
  abcrunch: { label: "Machine crunch abdominal", stacks: [SIDE], levers: [{ pivot: [0, 1.25, -0.25], to: "hands" }] },
  legext: { label: "Leg extension — machine quadriceps", stacks: [SIDE], levers: [{ pivot: [0, 0.58, 0.46], to: "shins" }] },
  seatedlegcurl: { label: "Leg curl assis — ischio-jambiers", stacks: [SIDE], levers: [{ pivot: [0, 0.58, 0.46], to: "shins" }], frame: [{ pos: [0, 0.74, 0.3], size: [0.42, 0.06, 0.12], pad: true }] },
  lyinglegcurl: { label: "Leg curl allongé", seat: false, stacks: [[0.68, 0, -0.2]], levers: [{ pivot: [0, 0.6, -0.62], to: "shins" }] },
  hipabduction: { label: "Machine abducteurs", stacks: [SIDE], levers: [{ pivot: [-0.08, 0.52, 0.12], to: "shin0" }, { pivot: [0.08, 0.52, 0.12], to: "shin1" }] },
  hipadduction: { label: "Machine adducteurs", stacks: [SIDE], levers: [{ pivot: [-0.08, 0.52, 0.12], to: "shin0" }, { pivot: [0.08, 0.52, 0.12], to: "shin1" }] },
  backext: { label: "Banc à lombaires (chaise romaine 45°)", frame: [
    { pos: [0, 0.56, 0.07], size: [0.42, 0.3, 0.08], rot: [0.69, 0, 0], pad: true },
    { pos: [0, 0.13, -0.6], size: [0.36, 0.08, 0.08], pad: true },
    { pos: [0, 0.3, -0.25], size: [0.06, 0.06, 0.8], rot: [0.85, 0, 0] },
    { pos: [0, 0.2, -0.05], size: [0.06, 0.4, 0.06] },
    { pos: [0, 0.03, -0.3], size: [0.5, 0.06, 0.9] },
  ] },
  calfraise: { label: "Machine mollets debout", stacks: [SIDE], frame: [{ pos: [0, 0.03, 0.08], size: [0.5, 0.06, 0.25], pad: true },
    { pos: [-0.17, 1.5, -0.02], size: [0.14, 0.06, 0.22], pad: true }, { pos: [0.17, 1.5, -0.02], size: [0.14, 0.06, 0.22], pad: true },
    { pos: [0, 1.5, -0.16], size: [0.5, 0.05, 0.05] }, { pos: [0, 0.78, -0.2], size: [0.06, 1.5, 0.06] }] },
  seatedrow: { label: "Tirage horizontal — poulie basse", stacks: [[0, 0, 1.2]], cables: [{ from: "hands", via: [0, 0.95, 1.1] }], frame: [{ pos: [0, 0.28, 0.93], size: [0.5, 0.3, 0.04], rot: [0.43, 0, 0], pad: true }, { pos: [0, 0.07, 0.95], size: [0.06, 0.14, 0.06] }, { pos: [0, 0.03, 0.55], size: [0.08, 0.06, 1.3] }] },
  pulldown: { label: "Tirage vertical — lat pulldown", stacks: [[0, 0, -0.5]], cables: [{ from: "hands", via: [0, 2.3, 0.1] }], frame: [{ pos: [0, 2.32, -0.2], size: [0.06, 0.06, 0.7] }] },
  pushdown: { label: "Poulie haute — extension triceps", stacks: [[0, 0, 0.55]], cables: [{ from: "hands", via: [0, 2.15, 0.45] }] },
  cablefly: { label: "Vis-à-vis — double poulie", stacks: [[-0.95, 0, -0.1], [0.95, 0, -0.1]], cables: [{ from: "hand0", via: [-0.85, 1.95, -0.03], stack: 0 }, { from: "hand1", via: [0.85, 1.95, -0.03], stack: 1 }] },
  // Rails dans l'axe de la trajectoire des pieds (plaque à 3 cm sous les plantes), montants jusqu'au sol.
  legpress: { label: "Presse à cuisses inclinée 45°", frame: [
    { pos: [-0.33, 1.39, 0.47], size: [0.05, 1.42, 0.05], rot: [0.686, 0, 0] }, { pos: [0.33, 1.39, 0.47], size: [0.05, 1.42, 0.05], rot: [0.686, 0, 0] },
    { pos: [-0.33, 0.42, 0.02], size: [0.05, 0.84, 0.05] }, { pos: [0.33, 0.42, 0.02], size: [0.05, 0.84, 0.05] },
    { pos: [-0.33, 0.97, 0.92], size: [0.05, 1.94, 0.05] }, { pos: [0.33, 0.97, 0.92], size: [0.05, 1.94, 0.05] },
    { pos: [0, 0.03, 0.4], size: [0.8, 0.06, 1.6] }] },
  // Ektyron
  smithincline: { label: "Smith machine — barre guidée", frame: [{ pos: [-0.62, 1.05, -0.12], size: [0.06, 2.1, 0.06] }, { pos: [0.62, 1.05, -0.12], size: [0.06, 2.1, 0.06] }, { pos: [0, 2.12, -0.12], size: [1.3, 0.06, 0.06] }] },
  chestrow: { label: "Rowing machine, poitrine appuyée", stacks: [SIDE], levers: [{ pivot: [-0.2, 1.35, 0.75], to: "hand0" }, { pivot: [0.2, 1.35, 0.75], to: "hand1" }], frame: [{ pos: [0, 0.98, 0.32], size: [0.4, 0.5, 0.08], rot: [-0.2, 0, 0], pad: true }] },
  reversefly: { label: "Pec deck en inversé (oiseau machine)", stacks: [SIDE], levers: [{ pivot: [-0.17, 1.4, 0.62], to: "hand0" }, { pivot: [0.17, 1.4, 0.62], to: "hand1" }], frame: [{ pos: [0, 0.98, 0.26], size: [0.4, 0.55, 0.08], pad: true }] },
  widerow: { label: "Poulie basse, barre large", stacks: [[0, 0, 1.2]], cables: [{ from: "hands", via: [0, 0.95, 1.1] }], frame: [{ pos: [0, 0.28, 0.93], size: [0.5, 0.3, 0.04], rot: [0.43, 0, 0], pad: true }] },
  facepull: { label: "Poulie haute, corde", stacks: [[0, 0, 1.4]], cables: [{ from: "hands", via: [0, 1.7, 1.3] }] },
  cablecurlback: { label: "Poulie basse derrière soi", stacks: [[0, 0, -0.6]], cables: [{ from: "hands", via: [0, 0.12, -0.5] }] },
  ropehammer: { label: "Poulie basse, corde", stacks: [[0, 0, 0.6]], cables: [{ from: "hands", via: [0, 0.12, 0.5] }] },
  overheadcable: { label: "Poulie basse derrière soi, corde", stacks: [[0, 0, -0.7]], cables: [{ from: "hands", via: [0, 0.4, -0.6] }] },
  cablelateral: { label: "Poulie basse, côté opposé", stacks: [[-0.55, 0, 0]], cables: [{ from: "hand1", via: [-0.45, 0.12, 0] }] },
  onearmpushdown: { label: "Poulie haute, poignée", stacks: [[0.15, 0, 0.55]], cables: [{ from: "hand1", via: [0.15, 2.15, 0.45] }] },
  cablecrunch: { label: "Poulie haute, corde", stacks: [[0, 0, 0.75]], cables: [{ from: "hands", via: [0, 2.1, 0.65] }] },
  cablekickback: { label: "Poulie basse, sangle de cheville", stacks: [[0.1, 0, 0.75]], cables: [{ from: "shin1", via: [0.1, 0.12, 0.65] }], frame: [{ pos: [0, 1.08, 0.74], size: [0.6, 0.05, 0.05] }, { pos: [-0.3, 0.55, 0.74], size: [0.05, 1.1, 0.05] }, { pos: [0.3, 0.55, 0.74], size: [0.05, 1.1, 0.05] }] },
  leanabduction: { label: "Machine abducteurs, buste penché", stacks: [SIDE], levers: [{ pivot: [-0.08, 0.37, 0.12], to: "shin0" }, { pivot: [0.08, 0.37, 0.12], to: "shin1" }] },
  seatedcalf: { label: "Mollets assis (seated calf)", frame: [{ pos: [0, 0.03, 0.6], size: [0.5, 0.06, 0.22], pad: true }] },
  hacksquat: { label: "Hack squat", frame: [{ pos: [-0.28, 1.0, -0.32], size: [0.05, 2.0, 0.05], rot: [-0.12, 0, 0] }, { pos: [0.28, 1.0, -0.32], size: [0.05, 2.0, 0.05], rot: [-0.12, 0, 0] }, { pos: [0, 0.03, 0.05], size: [0.7, 0.06, 0.5] }] },
};
for (const a of animations) {
  const m = MACHINES[a.id];
  if (!m) continue;
  a.machine = m;
  if (m.cables) a.cableTo = undefined; // le câble est dessiné par la machine
}

export const animationById = Object.fromEntries(animations.map((a) => [a.id, a]));

const ease = (x: number) => x * x * (3 - 2 * x);

/** Pose interpolée au temps t (0–1). */
export function poseAt(anim: Animation, t: number): Required<Pose> {
  const keys = anim.keys;
  let i = 0;
  while (i < keys.length - 2 && t > keys[i + 1].t) i++;
  const a = keys[i];
  const b = keys[i + 1];
  const u = ease(Math.min(1, Math.max(0, (t - a.t) / (b.t - a.t || 1))));
  const names: JointName[] = ["rootPitch", "spine", "neck", "shFlex", "shAbd", "elbow", "hipFlex", "hipAbd", "knee", "ankle", "shHor", "pron", "grip", "twist", "lean", "shrug"];
  const out = {} as Required<Pose>;
  for (const n of names) {
    const va = a.pose[n] ?? 0;
    const vb = b.pose[n] ?? 0;
    out[n] = va + (vb - va) * u;
    for (const i of [0, 1] as const) {
      const k = `${n}_${i}` as const;
      const sa = a.pose[k] ?? va, sb = b.pose[k] ?? vb;
      out[k] = sa + (sb - sa) * u;
    }
  }
  return out;
}

export function phaseAt(anim: Animation, t: number): "concentrique" | "excentrique" | "isométrique" {
  if (!anim.concentric) return "isométrique";
  const [a, b] = anim.concentric;
  return t >= a && t <= b ? "concentrique" : "excentrique";
}

// Groupes "pédagogiques" du mannequin : chaque muscle de la base est rattaché
// à une zone colorable sur le mannequin animé.
export const overlayOf: Record<string, string> = {
  "grand-pectoral": "pecs",
  "petit-pectoral": "pecs",
  "deltoide-anterieur": "deltFront",
  "deltoide-moyen": "deltSide",
  "deltoide-posterieur": "deltRear",
  "supra-epineux": "deltSide",
  "infra-epineux": "deltRear",
  "petit-rond": "deltRear",
  subscapulaire: "deltFront",
  "biceps-brachial": "biceps",
  brachial: "biceps",
  "triceps-brachial": "triceps",
  "brachio-radial": "forearm",
  "grand-dorsal": "lats",
  "grand-rond": "lats",
  trapeze: "traps",
  rhomboides: "traps",
  "grand-droit": "abs",
  "oblique-externe": "obliques",
  "dentele-anterieur": "obliques",
  "erecteurs-rachis": "lowback",
  "grand-fessier": "glutes",
  "moyen-fessier": "glutes",
  "tenseur-fascia-lata": "glutes",
  "ilio-psoas": "hipflex",
  sartorius: "hipflex",
  "droit-femoral": "quads",
  "vaste-lateral": "quads",
  "vaste-medial": "quads",
  "vaste-intermediaire": "quads",
  "biceps-femoral": "hams",
  "semi-tendineux": "hams",
  "semi-membraneux": "hams",
  "grand-adducteur": "adductors",
  gastrocnemien: "calves",
  soleaire: "calves",
  fibulaires: "calves",
  "tibial-anterieur": "tibialis",
  "sterno-cleido-mastoidien": "neck",
};

// ───── Assise : le siège sous les fesses, les pieds au sol ─────
// Avant : bassin 20 cm au-dessus du siège et pieds 16 cm au-dessus du sol. DROP = descente du corps et de la machine (hors colonne de poids).
const DROP: Record<string, number> = { chestpress: 0.16, pecdeck: 0.16, shoulderpressseated: 0.16, tricepsmachine: 0.16, lateralraisemachine: 0.16, pulldown: 0.16, seatedrow: 0.16, preachercurl: 0.08, abcrunch: 0.08 };
for (const a of animations) {
  const d = DROP[a.id] ?? 0;
  if (!a.rootPos || a.anchor) continue;
  if (d) {
    a.rootPos = [a.rootPos[0], a.rootPos[1] - d, a.rootPos[2]];
    a.props = a.props.map((p) => (p.position && !p.attach ? { ...p, position: [p.position[0], p.position[1] - d, p.position[2]] } : p));
    if (a.machine) {
      const m = a.machine;
      a.machine = {
        ...m,
        levers: m.levers?.map((l) => ({ ...l, pivot: [l.pivot[0], l.pivot[1] - d, l.pivot[2]] })),
        frame: m.frame?.map((f) => (f.pos[1] > 0.1 && f.pos[1] < 2 && a.id !== "seatedrow" ? { ...f, pos: [f.pos[0], f.pos[1] - d, f.pos[2]] } : f)),
        cables: m.cables?.map((c) => (c.via[1] < 2 ? { ...c, via: [c.via[0], c.via[1] - d, c.via[2]] } : c)),
      };
    }
  }
  // Dessus du siège ≈ 9 cm sous le centre du bassin.
  const y = a.rootPos[1] - 0.13;
  a.props = a.props.map((p) => (p.kind === "seat" && !p.attach ? { ...p, position: [p.position?.[0] ?? 0, y, p.position?.[2] ?? 0.12] } : p));
}

// ───── Prise des mains (rotation de l'avant-bras, voir « pron ») ─────
// Le modèle anatomique est en supination (paumes vers l'avant) : sans réglage, toutes les prises étaient « dessous ».
const P = 165, N = 90, S = 0;
const GRIP: Record<string, number> = {
  squat: P, bench: P, chestpress: P, pulldown: P, shoulderpress: P, deadlift: P, pushup: P, pullup: P, muscleup: P,
  barbellrow: P, invertedrow: P, shoulderpressseated: P, pushdown: P, hipthrust: P, inclinepress: P, kbswing: P, frontlever: P, hspu: P,
  curl: S, preachercurl: S,
  legext: N, legpress: N, plank: N, dips: N, pecdeck: N, cablefly: N, seatedrow: N, lateralraise: N, lateralraisemachine: N,
  tricepsmachine: N, hacksquat: N, seatedlegcurl: N, lyinglegcurl: N, hipabduction: N, hipadduction: N, calfraise: N, backext: N, abcrunch: N, lsit: N, airsquat: N,
};
// Fermeture des mains : fermées sur barre / poignées / haltères, ouvertes à plat au sol, détendues sinon.
const OPEN = new Set(["pushup", "hspu"]);
const HOLD = new Set(["squat", "bench", "chestpress", "pulldown", "curl", "shoulderpress", "deadlift", "pullup", "dips", "pecdeck", "cablefly", "seatedrow",
  "barbellrow", "invertedrow", "shoulderpressseated", "lateralraise", "preachercurl", "tricepsmachine", "pushdown", "hacksquat", "legext", "legpress",
  "seatedlegcurl", "lyinglegcurl", "hipthrust", "hipabduction", "hipadduction", "abcrunch", "inclinepress", "kbswing", "frontlever", "muscleup"]);
for (const a of animations) {
  const g = GRIP[a.id];
  const c = OPEN.has(a.id) ? 0 : HOLD.has(a.id) ? 85 : a.id === "plank" ? 70 : 25;
  a.keys = a.keys.map((k) => ({ t: k.t, pose: { ...(g === undefined ? {} : { pron: g }), grip: c, ...k.pose } }));
}

// ───── Geste à éviter : la même animation, déformée par l'erreur la plus fréquente ─────
/** d = écart ajouté au pic du mouvement (proportionnel à l'avancée), c = écart constant, amp = amplitude (1 = normale). */
export interface Fault { label: string; d?: Pose; c?: Pose; amp?: number }
const F = {
  dos: { label: "Dos rond", d: { spine: 30, neck: 12 } },
  genoux: { label: "Genoux qui rentrent", d: { hipAbd: -16 } },
  elan: { label: "Élan du buste", d: { rootPitch: -16, hipFlex: -16, spine: -6 } },
  hausse: { label: "Épaules qui montent", d: { shrug: 4.5 } },
  creux: { label: "Bassin qui s'affaisse", c: { spine: -12, hipFlex: -18 } },
  coudesOuv: { label: "Coudes trop ouverts", d: { shAbd: 26 } },
  coudesAv: { label: "Coudes qui avancent", d: { shFlex: 38 } },
  cambre: { label: "Dos trop cambré", c: { spine: -16 } },
  cambreHaut: { label: "Cambrer en haut au lieu de serrer", d: { spine: -24 } },
  nuque: { label: "Tirer sur la nuque", d: { neck: 32 } },
  demi: { label: "Demi-amplitude", amp: 0.45 },
  tropBas: { label: "Descendre trop bas", amp: 1.3 },
} satisfies Record<string, Fault>;
export const faults: Record<string, Fault> = {
  squat: F.genoux, airsquat: F.genoux, hacksquat: F.genoux, sumosquat: F.genoux, bulgarian: F.genoux, lunges: F.genoux, stepup: F.genoux,
  gobletsquat: F.dos, deadlift: F.dos, rdl: F.dos, dbrdl: F.dos, barbellrow: F.dos, kbswing: F.dos, reardeltfly: F.dos, russiantwist: { label: "Dos rond", c: { spine: 22 } },
  legpress: { label: "Bassin qui décolle en bas", d: { spine: 22 } },
  onearmrow: { label: "Tourner le buste pour tirer", d: { twist: 28 } },
  bench: F.coudesOuv, dbbench: F.coudesOuv, inclinepress: F.coudesOuv, smithincline: F.coudesOuv, chestpress: F.coudesOuv,
  pushup: F.creux, declinepushup: F.creux, plank: F.creux, invertedrow: { label: "Bassin qui tombe", c: { hipFlex: 24, spine: 8 } },
  dbfly: { label: "Bras trop tendus", c: { elbow: -14 } }, pecdeck: F.hausse, cablefly: F.hausse,
  curl: F.elan, hammercurl: F.elan, bagcurl: F.elan, cablecurlback: F.elan, ropehammer: F.elan, inclinecurl: F.coudesAv, preachercurl: F.demi,
  pushdown: { label: "Coudes qui bougent", d: { shFlex: 32 } }, onearmpushdown: { label: "Coudes qui bougent", d: { shFlex: 32 } },
  overheadcable: F.coudesOuv, dbextension: F.coudesOuv, tricepsmachine: F.demi,
  dips: F.tropBas, benchdips: F.tropBas, pullup: F.demi, pikepushup: F.demi, hspu: F.demi, muscleup: F.demi,
  pulldown: { label: "Se jeter en arrière", d: { rootPitch: -22, hipFlex: -22 } }, seatedrow: { label: "Balancer le buste", d: { rootPitch: -20, hipFlex: -20 } },
  chestrow: F.hausse, widerow: F.hausse, facepull: F.hausse, reversefly: F.hausse, ytw: F.hausse,
  shoulderpress: F.cambre, shoulderpressseated: F.cambre, dbshoulderpress: F.cambre,
  lateralraise: { label: "Élan et épaules qui montent", d: { rootPitch: -10, hipFlex: -10, knee: 10, shrug: 4 } }, cablelateral: F.hausse, lateralraisemachine: F.hausse, leanabduction: F.hausse,
  hipthrust: F.cambreHaut, singlebridge: F.cambreHaut, backext: { label: "Hyperextension en haut", d: { spine: -24, neck: -15 } }, cablekickback: { label: "Cambrer le dos", d: { spine: -22 } },
  legext: F.demi, seatedlegcurl: F.demi, lyinglegcurl: { label: "Bassin qui décolle", d: { hipFlex: 22 } }, nordic: { label: "Hanches pliées", c: { hipFlex: 35 } },
  calfraise: F.demi, seatedcalf: F.demi, hipabduction: F.demi, hipadduction: F.demi, shrug: F.demi,
  abcrunch: F.nuque, cablecrunch: F.nuque, heeltaps: F.nuque, suitcasecrunch: F.nuque, superman: { label: "Nuque cassée vers l'arrière", d: { neck: -28 } },
  legraise: { label: "Bas du dos qui décolle", c: { spine: -14 } }, deadbug: { label: "Bas du dos qui décolle", c: { spine: -14 } },
  hangingraise: { label: "Balancer le corps", d: { rootPitch: -16 } },
};
export const faultOf = (anim: Animation): Fault => faults[anim.id] ?? F.demi;

const effortCache = new WeakMap<Animation, number[]>();
/** Avancée du mouvement (0 = position de départ, 1 = point le plus éloigné), échantillonnée une fois par animation. */
function effortAt(anim: Animation, t: number): number {
  let e = effortCache.get(anim);
  if (!e) {
    const p0 = poseAt(anim, 0) as Record<string, number>;
    const raw = Array.from({ length: 41 }, (_, i) => {
      const p = poseAt(anim, i / 40) as Record<string, number>;
      let s = 0;
      for (const k in p0) s += Math.abs(p[k] - p0[k]);
      return s;
    });
    const m = Math.max(...raw) || 1;
    effortCache.set(anim, (e = raw.map((v) => v / m)));
  }
  const x = Math.min(40, Math.max(0, t * 40)), i = Math.floor(x), f = x - i;
  return e[i] + ((e[Math.min(40, i + 1)] ?? e[i]) - e[i]) * f;
}

/** Pose de la répétition « à éviter ». */
export function faultPoseAt(anim: Animation, t: number): Required<Pose> {
  const f = faultOf(anim);
  const out = poseAt(anim, t) as Record<string, number>;
  if (f.amp != null) {
    const p0 = poseAt(anim, 0) as Record<string, number>;
    for (const k in out) out[k] = p0[k] + (out[k] - p0[k]) * f.amp;
  }
  const e = effortAt(anim, t);
  const w = Math.min(1, t / 0.12, (1 - t) / 0.12); // l'écart constant arrive et repart en douceur
  const add = (d: Pose | undefined, k: number) => {
    if (d) for (const [n, v] of Object.entries(d)) {
      out[n] += v! * k;
      for (const i of [0, 1]) if (`${n}_${i}` in out) out[`${n}_${i}`] += v! * k;
    }
  };
  add(f.d, e);
  add(f.c, w);
  return out as Required<Pose>;
}
