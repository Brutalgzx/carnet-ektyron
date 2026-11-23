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

export type JointName = "rootPitch" | "spine" | "neck" | "shFlex" | "shAbd" | "elbow" | "hipFlex" | "hipAbd" | "knee" | "ankle" | "shHor";
export type Pose = Partial<Record<JointName, number>>;

export type PropKind = "bench" | "barbell" | "dumbbells" | "pullupBar" | "parallelBars" | "seat" | "backrest" | "legPad" | "sled" | "latBar" | "handles" | "mat" | "rack" | "kettlebell";

export interface Prop {
  kind: PropKind;
  /** Accroché au mannequin : suit les mains, les tibias ou les pieds. */
  attach?: "hands" | "shins" | "feet" | "chest";
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
  anchor: "feet" | "hands" | null;
  anchorTarget?: [number, number, number];
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
    props: [{ kind: "barbell", attach: "chest", position: [0, 0.2, -0.13] }],
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
    rootPos: [0, 0.56, 0.05],
    keys: [
      { t: 0, pose: { ...stand, rootPitch: -90, hipFlex: -18, knee: 95, hipAbd: 18, shFlex: 90, shAbd: 8, elbow: 0 } },
      { t: 0.5, pose: { ...stand, rootPitch: -90, hipFlex: -18, knee: 95, hipAbd: 18, shFlex: 18, shAbd: 72, elbow: 92 } },
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
      { t: 0, pose: { ...seated, rootPitch: -12, shFlex: 165, shAbd: 25, elbow: 0 } },
      { t: 0.5, pose: { ...seated, rootPitch: -18, shFlex: 25, shAbd: 45, elbow: 125 } },
      { t: 1, pose: { ...seated, rootPitch: -12, shFlex: 165, shAbd: 25, elbow: 0 } },
    ],
    concentric: [0, 0.5],
    props: [
      { kind: "seat", position: [0, 0.28, 0.12] },
      { kind: "legPad", position: [0, 0.72, 0.3] },
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
    duration: 3.2,
    anchor: null,
    rootPos: [0, 0.5, 0],
    keys: [
      { t: 0, pose: { ...seated, rootPitch: -48, hipFlex: 62, knee: 12, ankle: -10, hipAbd: 10, shFlex: 30, elbow: 20, shAbd: 25 } },
      { t: 0.5, pose: { ...seated, rootPitch: -48, hipFlex: 122, knee: 100, ankle: 15, hipAbd: 14, shFlex: 30, elbow: 20, shAbd: 25 } },
      { t: 1, pose: { ...seated, rootPitch: -48, hipFlex: 62, knee: 12, ankle: -10, hipAbd: 10, shFlex: 30, elbow: 20, shAbd: 25 } },
    ],
    concentric: [0.5, 1],
    props: [
      { kind: "backrest", position: [0, 0.75, -0.35], rotation: [-0.84, 0, 0] },
      { kind: "seat", position: [0, 0.25, 0.05] },
      { kind: "sled", attach: "feet" },
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
      { t: 0, pose: { ...stand, rootPitch: 66, ankle: -45, shFlex: 66, shAbd: 18, elbow: 0 } },
      { t: 0.5, pose: { ...stand, rootPitch: 81, ankle: -55, shFlex: 22, shAbd: 62, elbow: 95 } },
      { t: 1, pose: { ...stand, rootPitch: 66, ankle: -45, shFlex: 66, shAbd: 18, elbow: 0 } },
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
      { t: 0, pose: { ...stand, rootPitch: 79, ankle: -55, shFlex: -2, elbow: 92, shAbd: 10 } },
      { t: 0.5, pose: { ...stand, rootPitch: 80, ankle: -55, shFlex: -1, elbow: 92, shAbd: 10 } },
      { t: 1, pose: { ...stand, rootPitch: 79, ankle: -55, shFlex: -2, elbow: 92, shAbd: 10 } },
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
    { ...seated, rootPitch: 2, shFlex: 86, shAbd: 8, elbow: 0 },
    { ...seated, rootPitch: -6, shFlex: -18, shAbd: 18, elbow: 108 },
    [0, 0.5], [SEAT, { kind: "legPad", position: [0, 0.95, 0.27], rotation: [0, 0, 0] }, { kind: "handles", attach: "hands" }]),
  rep("barbellrow", "Rowing barre", 2.8, { anchor: "feet", anchorTarget: [0, 0, 0] },
    { ...stand, rootPitch: 48, spine: 2, hipFlex: 66, knee: 26, ankle: 10, hipAbd: 6, shFlex: 62, shAbd: 6, elbow: 0 },
    { ...stand, rootPitch: 48, spine: 2, hipFlex: 66, knee: 26, ankle: 10, hipAbd: 6, shFlex: -8, shAbd: 22, elbow: 100 },
    [0, 0.5], [{ kind: "barbell", attach: "hands" }]),
  rep("invertedrow", "Rowing inversé", 2.8, { anchor: "hands", anchorTarget: [0, 1.0, 0] },
    { ...stand, rootPitch: -70, shFlex: 72, shAbd: 10, elbow: 0, ankle: 10 },
    { ...stand, rootPitch: -70, shFlex: -10, shAbd: 28, elbow: 105, ankle: 10 },
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
    [0.5, 1], []),
  rep("seatedlegcurl", "Leg curl assis", 2.6, { anchor: null, rootPos: [0, 0.62, 0] },
    { ...seated, rootPitch: -8, hipFlex: 98, knee: 4, shFlex: 20, elbow: 25, shAbd: 20 },
    { ...seated, rootPitch: -8, hipFlex: 98, knee: 105, shFlex: 20, elbow: 25, shAbd: 20 },
    [0, 0.5], [SEAT, { kind: "backrest", position: [0, 0.95, -0.2] }, { kind: "legPad", attach: "shins" }]),
  rep("lyinglegcurl", "Leg curl allongé", 2.6, { anchor: null, rootPos: [0, 0.6, -0.1] },
    { ...stand, rootPitch: 90, shFlex: 150, shAbd: 20, elbow: 40, knee: 4 },
    { ...stand, rootPitch: 90, shFlex: 150, shAbd: 20, elbow: 40, knee: 110 },
    [0, 0.5], [{ kind: "bench", position: [0, 0.3, 0.2], size: [0.32, 0.6, 1.4] }, { kind: "legPad", attach: "shins" }]),
  rep("hipthrust", "Hip thrust", 2.8, { anchor: "feet", anchorTarget: [0, 0, 0] },
    { ...stand, rootPitch: -62, hipFlex: 78, knee: 72, hipAbd: 12, shFlex: 25, shAbd: 40, elbow: 90 },
    { ...stand, rootPitch: -88, hipFlex: 2, knee: 88, ankle: -4, hipAbd: 12, shFlex: 25, shAbd: 40, elbow: 90 },
    [0, 0.5], [{ kind: "bench", position: [0, 0.2, -1.05], size: [1.2, 0.4, 0.35] }, { kind: "barbell", attach: "hands" }]),
  rep("hipabduction", "Abduction de hanche machine", 2.4, { anchor: null, rootPos: [0, 0.62, 0] },
    { ...seated, rootPitch: -10, hipAbd: 4, shFlex: 15, elbow: 20, shAbd: 25 },
    { ...seated, rootPitch: -10, hipAbd: 40, shFlex: 15, elbow: 20, shAbd: 25 },
    [0, 0.5], [SEAT, { kind: "backrest", position: [0, 0.93, -0.22] }]),
  rep("hipadduction", "Adduction de hanche machine", 2.4, { anchor: null, rootPos: [0, 0.62, 0] },
    { ...seated, rootPitch: -10, hipAbd: 40, shFlex: 15, elbow: 20, shAbd: 25 },
    { ...seated, rootPitch: -10, hipAbd: 4, shFlex: 15, elbow: 20, shAbd: 25 },
    [0, 0.5], [SEAT, { kind: "backrest", position: [0, 0.93, -0.22] }]),
  rep("calfraise", "Extension mollets", 2, { anchor: "feet", anchorTarget: [0, 0, 0] },
    { ...stand, ankle: 8, shAbd: 20, elbow: 30 },
    { ...stand, ankle: -32, shAbd: 20, elbow: 30 },
    [0, 0.5], []),
  rep("backext", "Extension lombaire", 3, { anchor: "feet", anchorTarget: [0, 0, 0] },
    { ...stand, rootPitch: 120, hipFlex: 82, knee: 4, ankle: -38, shFlex: 10, elbow: 120, shAbd: 50 },
    { ...stand, rootPitch: 44, hipFlex: 4, knee: 4, ankle: -38, shFlex: 10, elbow: 120, shAbd: 50 },
    [0, 0.5], []),
  rep("abcrunch", "Crunch machine", 2.4, { anchor: null, rootPos: [0, 0.62, 0] },
    { ...seated, spine: 0, shFlex: 130, shAbd: 30, elbow: 120 },
    { ...seated, rootPitch: 14, spine: 46, neck: 10, shFlex: 130, shAbd: 30, elbow: 120 },
    [0, 0.5], [SEAT]),
  rep("inclinepress", "Développé incliné haltères", 2.8, { anchor: null, rootPos: [0, 0.6, 0] },
    { ...stand, rootPitch: -52, hipFlex: 50, knee: 90, hipAbd: 16, shFlex: 18, shAbd: 72, elbow: 95 },
    { ...stand, rootPitch: -52, hipFlex: 50, knee: 90, hipAbd: 16, shFlex: 92, shAbd: 10, elbow: 4 },
    [0, 0.5], [{ kind: "backrest", position: [0, 0.82, -0.22], rotation: [-0.9, 0, 0], size: [0.4, 0.62, 0.08] }, SEAT, { kind: "dumbbells", attach: "hands" }]),
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
  calfraise: { label: "Machine mollets debout", stacks: [SIDE], frame: [{ pos: [0, 0.03, 0.08], size: [0.5, 0.06, 0.25], pad: true }] },
  seatedrow: { label: "Tirage horizontal — poulie basse", stacks: [[0, 0, 1.2]], cables: [{ from: "hands", via: [0, 0.95, 1.1] }] },
  pulldown: { label: "Tirage vertical — lat pulldown", stacks: [[0, 0, -0.5]], cables: [{ from: "hands", via: [0, 2.3, 0.1] }], frame: [{ pos: [0, 2.32, -0.2], size: [0.06, 0.06, 0.7] }] },
  pushdown: { label: "Poulie haute — extension triceps", stacks: [[0, 0, 0.55]], cables: [{ from: "hands", via: [0, 2.15, 0.45] }] },
  cablefly: { label: "Vis-à-vis — double poulie", stacks: [[-0.95, 0, -0.1], [0.95, 0, -0.1]], cables: [{ from: "hand0", via: [-0.85, 1.95, -0.03], stack: 0 }, { from: "hand1", via: [0.85, 1.95, -0.03], stack: 1 }] },
  legpress: { label: "Presse à cuisses inclinée 45°", frame: [{ pos: [-0.33, 0.95, 0.95], size: [0.05, 1.42, 0.05], rot: [0.686, 0, 0] }, { pos: [0.33, 0.95, 0.95], size: [0.05, 1.42, 0.05], rot: [0.686, 0, 0] }, { pos: [0, 0.03, 0.4], size: [0.8, 0.06, 1.6] }] },
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
  const names: JointName[] = ["rootPitch", "spine", "neck", "shFlex", "shAbd", "elbow", "hipFlex", "hipAbd", "knee", "ankle", "shHor"];
  const out = {} as Required<Pose>;
  for (const n of names) {
    const va = a.pose[n] ?? 0;
    const vb = b.pose[n] ?? 0;
    out[n] = va + (vb - va) * u;
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
